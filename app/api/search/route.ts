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

    // Optimized search query utilizing DB indexes and Joins
    // Join pull2 -> items -> (prices, aacs)
    let dbQuery = supabaseAdmin
      .from('pull2')
      .select('*, items!inner(prices(unitPrice), aacs(aac))', { count: 'exact' })
      .range(offset, offset + limit - 1);

    // Apply smart search filters
    const cleanQuery = query.trim().toUpperCase();

    if (/^[\d-]+$/.test(cleanQuery)) {
      const cleanNiin = cleanQuery.replace(/-/g, '');
      dbQuery = dbQuery.or(`niin.ilike.${cleanNiin}%,fsc.eq.${cleanQuery}`);
    } else {
      // Relies on pg_trgm GIN index
      dbQuery = dbQuery.or(`itemName.ilike.%${cleanQuery}%,fsc.eq.${cleanQuery}`);
    }

    // Apply FSC filter
    if (fscFilter) {
      dbQuery = dbQuery.eq('fsc', fscFilter);
    }

    const { data: pull2Data, error, count } = await dbQuery;

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

    // Transform data
    let transformedData = pull2Data.map((item: any) => {
      // items is likely a single object because pull2.niin -> items.niin is Many-to-One
      const relatedItems = item.items;

      // prices and aacs are arrays within relatedItems
      const prices = relatedItems?.prices || [];
      const aacs = relatedItems?.aacs || [];

      // Get first matching price/aac if available
      const priceObj = prices.find((p: any) => p.unitPrice) || {};
      const aacObj = aacs.find((a: any) => a.aac) || {};

      const aac = aacObj.aac || '';
      const isClassIX = ['D', 'V', 'Z'].includes(aac.toUpperCase());
      const unitPrice = priceObj.unitPrice;

      return {
        nsn: item.niin || '',
        name: item.itemName || '',
        description: null,
        turnInPart: '',
        classIX: isClassIX,
        aac: aac,
        fsc: item.fsc || '',
        niin: item.niin || '',
        characteristics: null,
        publicationDate: null,
        // Essential data
        unitPrice: unitPrice || null,
        unitOfIssue: null,
        // Other data null - use detail endpoint
        weight: null,
        cube: null,
        weightPubDate: null,
        requirementsStatement: null,
        clearTextReply: null,
        alternateNames: []
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

