import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const fscFilter = searchParams.get('fsc');
    const classIXFilter = searchParams.get('classIX');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [], total: 0, page, limit });
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Optimize search: use prefix matching instead of wildcard for better performance
    const searchPattern = `${query}%`;
    
    // Build the base query - limit to 50 results before joining
    let searchQuery = supabaseAdmin
      .from('pull2')
      .select('niin, itemName, commonName, fsc, characteristics, publicationDate', { count: 'exact' })
      .or(`niin.ilike.${searchPattern},itemName.ilike.${searchPattern},commonName.ilike.${searchPattern},fsc.ilike.${searchPattern}`)
      .limit(50); // Limit BEFORE joins to reduce data processed

    // Apply FSC filter if provided
    if (fscFilter) {
      searchQuery = searchQuery.eq('fsc', fscFilter);
    }

    const { data: pull2Data, error, count } = await searchQuery;

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!pull2Data || pull2Data.length === 0) {
      return NextResponse.json({ results: [], total: 0, page, limit });
    }

    // Get unique NIINs to lookup related data
    const niins = [...new Set(pull2Data.map(item => item.niin).filter(Boolean))];
    
    // Fetch only the most critical related data to avoid timeout
    // Fetch in smaller batches if needed
    const [
      { data: aacsData },
      { data: pricesData }
    ] = await Promise.all([
      supabaseAdmin.from('aacs').select('niin, aac').in('niin', niins),
      supabaseAdmin.from('prices').select('niin, unitPrice, ui').in('niin', niins)
    ]);

    // Optionally fetch additional data only if result set is small
    let weightsData = null;
    let descriptionsData = null;
    let namesData = null;
    
    if (niins.length <= 20) {
      const [weights, descriptions, names] = await Promise.all([
        supabaseAdmin.from('weights').select('niin, dss_weight, dss_cube, publication_date').in('niin', niins),
        supabaseAdmin.from('descriptions').select('niin, requirementsStatement, clearTextReply').in('niin', niins),
        supabaseAdmin.from('names').select('niin, item_name').in('niin', niins)
      ]);
      weightsData = weights.data;
      descriptionsData = descriptions.data;
      namesData = names.data;
    }

    // Create maps for quick lookup
    const aacMap = new Map<string, string>();
    if (aacsData) {
      aacsData.forEach(item => {
        if (item.niin && item.aac) {
          aacMap.set(item.niin, item.aac);
        }
      });
    }

    const priceMap = new Map<string, { unitPrice: string; ui: string }>();
    if (pricesData) {
      pricesData.forEach(item => {
        if (item.niin) {
          priceMap.set(item.niin, { unitPrice: item.unitPrice || '', ui: item.ui || '' });
        }
      });
    }

    const weightMap = new Map<string, { weight: string; cube: string; pubDate: string }>();
    if (weightsData) {
      weightsData.forEach(item => {
        if (item.niin) {
          weightMap.set(item.niin, {
            weight: item.dss_weight || '',
            cube: item.dss_cube || '',
            pubDate: item.publication_date || ''
          });
        }
      });
    }

    const descriptionMap = new Map<string, { requirement: string; clearText: string }>();
    if (descriptionsData) {
      descriptionsData.forEach(item => {
        if (item.niin) {
          descriptionMap.set(item.niin, {
            requirement: item.requirementsStatement || '',
            clearText: item.clearTextReply || ''
          });
        }
      });
    }

    const alternateNamesMap = new Map<string, string[]>();
    if (namesData) {
      namesData.forEach(item => {
        if (item.niin && item.item_name) {
          if (!alternateNamesMap.has(item.niin)) {
            alternateNamesMap.set(item.niin, []);
          }
          alternateNamesMap.get(item.niin)!.push(item.item_name);
        }
      });
    }

    // Transform data to match expected format with enriched data
    let transformedData = pull2Data.map((item: any) => {
      const aac = aacMap.get(item.niin) || '';
      const isClassIX = ['D', 'V', 'Z'].includes(aac.toUpperCase());
      const priceInfo = priceMap.get(item.niin);
      const weightInfo = weightMap.get(item.niin);
      const descInfo = descriptionMap.get(item.niin);
      const altNames = alternateNamesMap.get(item.niin) || [];
      
      return {
        nsn: item.niin || '',
        name: item.itemName || '',
        description: item.commonName || '',
        turnInPart: '',
        classIX: isClassIX,
        aac: aac,
        fsc: item.fsc || '',
        niin: item.niin || '',
        characteristics: item.characteristics || '',
        publicationDate: item.publicationDate || '',
        // Enriched data
        unitPrice: priceInfo?.unitPrice || null,
        unitOfIssue: priceInfo?.ui || null,
        weight: weightInfo?.weight || null,
        cube: weightInfo?.cube || null,
        weightPubDate: weightInfo?.pubDate || null,
        requirementsStatement: descInfo?.requirement || null,
        clearTextReply: descInfo?.clearText || null,
        alternateNames: altNames
      };
    });

    // Apply Class IX filter if provided
    if (classIXFilter !== null) {
      const filterValue = classIXFilter === 'true';
      transformedData = transformedData.filter(item => item.classIX === filterValue);
    }

    // Apply price range filter if provided
    if (minPrice || maxPrice) {
      transformedData = transformedData.filter(item => {
        if (!item.unitPrice) return false;
        const price = parseFloat(item.unitPrice);
        if (isNaN(price)) return false;
        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    return NextResponse.json({
      results: transformedData,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
