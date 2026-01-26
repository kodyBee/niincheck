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

    if (!query) {
      return NextResponse.json({ results: [], total: 0, page, limit });
    }

    // Clean query: remove dashes and whitespace, convert to uppercase
    const cleanQuery = query.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // Strict NSN/Part Number search check
    if (cleanQuery.length < 3) {
      return NextResponse.json({ results: [], total: 0, page, limit });
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    const isNumeric = /^\d+$/.test(cleanQuery);

    // Determine the search term for NIIN columns
    let niinSearchTerm = cleanQuery;
    let isFullNsn = false;
    let fscFromInput = '';

    // Logic: 
    // If input is a full NSN (13 digits) or longer than 9 digits and numeric, 
    // extract NIIN (last 9) and FSC (first 4 if available).
    if (isNumeric && cleanQuery.length >= 9) {
      if (cleanQuery.length >= 13) {
        isFullNsn = true;
        fscFromInput = cleanQuery.substring(0, 4);
      }
      niinSearchTerm = cleanQuery.slice(-9);
    }

    // === HYBRID STRATEGY ===

    // PATH A: EXACT MATCH (Fast Path)
    // If we have a full 9-digit NIIN, we do direct lookups.
    if (isNumeric && niinSearchTerm.length === 9) {
      // Parallel fetch from all optimized tables
      const [namesRes, weightsRes, pricesRes, aacsRes, pull2Res] = await Promise.all([
        supabaseAdmin.from('names').select('*').eq('niin', niinSearchTerm).limit(1),
        supabaseAdmin.from('weights').select('*').eq('niin', niinSearchTerm).limit(1),
        supabaseAdmin.from('prices').select('*').eq('niin', niinSearchTerm).limit(1),
        supabaseAdmin.from('aacs').select('*').eq('niin', niinSearchTerm).limit(1),
        supabaseAdmin.from('pull2').select('*').eq('niin', niinSearchTerm).limit(1)
      ]);

      // If we found nothing in 'names' or 'pull2', it might handle as no result, 
      // but if we found it in ANY table, we construct the result.
      const hasResult = namesRes.data?.length || weightsRes.data?.length || pricesRes.data?.length || aacsRes.data?.length || pull2Res.data?.length;

      if (!hasResult) {
        return NextResponse.json({ results: [], total: 0, page, limit });
      }

      const p2 = pull2Res.data?.[0] || {};
      const nameData = namesRes.data?.[0] || {};
      const weightData = weightsRes.data?.[0] || {};
      const priceData = pricesRes.data?.[0] || {};
      const aacData = aacsRes.data?.[0] || {};

      const aac = aacData.aac || '';
      const isClassIX = ['D', 'V', 'Z'].includes(aac.toUpperCase());
      const fsc = nameData.fsc || p2.fsc || fscFromInput || '';

      const result = {
        nsn: fsc ? `${fsc}${niinSearchTerm}` : niinSearchTerm,
        niin: niinSearchTerm,
        name: nameData.item_name || p2.itemName || 'Unknown Item',
        description: nameData.common_name || p2.commonName || null,
        turnInPart: '',
        classIX: isClassIX,
        aac: aac,
        fsc: fsc,
        characteristics: nameData.characteristics || p2.characteristics || null,
        publicationDate: weightData.publication_date || p2.publicationDate || null,

        // Price data
        unitPrice: priceData.unitPrice || null,
        unitOfIssue: priceData.ui || null,

        // Weight data
        weight: weightData.dss_weight || null,
        cube: weightData.dss_cube || null,
        weightPubDate: null,
        requirementsStatement: null,
        clearTextReply: null,
        alternateNames: []
      };

      // Apply single-item filters
      let results = [result];
      if (classIXFilter !== null && classIXFilter !== undefined && classIXFilter !== 'all') {
        const filterValue = classIXFilter === 'true';
        if ((isClassIX) !== filterValue) results = [];
      }

      // We return immediately for exact match
      return NextResponse.json({
        results,
        total: results.length,
        page,
        limit,
        totalPages: 1
      });
    }

    // PATH B: PARTIAL SEARCH (Discovery Path)
    // For partial matches, we search `names` and `prices` and `pull2` for candidates.
    // We prioritize `names` as it's likely smaller and faster than `pull2` for text/niin prefix.

    const searchLimit = limit * 2;
    const searchPromises = [];

    // Query 1: Names table (Fast text/NIIN)
    let namesQuery = supabaseAdmin.from('names').select('niin').limit(searchLimit);
    if (isNumeric) {
      namesQuery = namesQuery.ilike('niin', `${niinSearchTerm}%`);
    } else {
      // Optional: search item_name if we wanted text search back, but user said no.
      // We'll stick to NIIN only for now as requested.
      namesQuery = namesQuery.ilike('niin', `${cleanQuery}%`);
    }
    searchPromises.push(namesQuery);

    // Query 2: Prices table
    let pricesQuery = supabaseAdmin.from('prices').select('niin').ilike('niin', `${niinSearchTerm}%`).limit(searchLimit);
    searchPromises.push(pricesQuery);

    // Query 3: Pull2 table (Legacy/Main)
    let pull2Query = supabaseAdmin.from('pull2').select('niin').limit(searchLimit);
    if (isNumeric) {
      pull2Query = pull2Query.or(`niin.ilike.${niinSearchTerm}%,fsc.eq.${cleanQuery}`);
    } else {
      pull2Query = pull2Query.ilike('niin', `${cleanQuery}%`);
    }
    if (fscFilter) pull2Query = pull2Query.eq('fsc', fscFilter);
    searchPromises.push(pull2Query);

    // Execute parallel searches
    const [namesRes, pricesRes, pull2Res] = await Promise.all(searchPromises);

    // Collect all matched NIINs
    const allNiins = new Set<string>();
    namesRes.data?.forEach((r: any) => r.niin && allNiins.add(r.niin));
    pricesRes.data?.forEach((r: any) => r.niin && allNiins.add(r.niin));
    pull2Res.data?.forEach((r: any) => r.niin && allNiins.add(r.niin));

    const totalUnique = allNiins.size;
    if (totalUnique === 0) {
      return NextResponse.json({ results: [], total: 0, page, limit });
    }

    // Pagination
    const sortedNiins = Array.from(allNiins).sort();
    const paginatedNiins = sortedNiins.slice(offset, offset + limit);

    if (paginatedNiins.length === 0) {
      return NextResponse.json({ results: [], total: totalUnique, page, limit, totalPages: Math.ceil(totalUnique / limit) });
    }

    // Fetch details for aggregated NIINs
    const detailsPromises = [
      supabaseAdmin.from('names').select('*').in('niin', paginatedNiins),
      supabaseAdmin.from('weights').select('*').in('niin', paginatedNiins),
      supabaseAdmin.from('prices').select('*').in('niin', paginatedNiins),
      supabaseAdmin.from('aacs').select('*').in('niin', paginatedNiins),
      supabaseAdmin.from('pull2').select('*').in('niin', paginatedNiins)
    ];

    const [dNames, dWeights, dPrices, dAacs, dPull2] = await Promise.all(detailsPromises);

    // Map details
    const namesMap = new Map(dNames.data?.map((i: any) => [i.niin, i]));
    const weightsMap = new Map(dWeights.data?.map((i: any) => [i.niin, i]));
    const pricesMap = new Map(dPrices.data?.map((i: any) => [i.niin, i]));
    const aacsMap = new Map(dAacs.data?.map((i: any) => [i.niin, i]));
    const pull2Map = new Map(dPull2.data?.map((i: any) => [i.niin, i]));

    // Construct results
    let transformedData = paginatedNiins.map(niin => {
      const p2 = pull2Map.get(niin) || {};
      const nameD = namesMap.get(niin) || {};
      const weightD = weightsMap.get(niin) || {};
      const priceD = pricesMap.get(niin) || {};
      const aacD = aacsMap.get(niin) || {};

      const aac = aacD.aac || '';
      const isClassIX = ['D', 'V', 'Z'].includes(aac.toUpperCase());
      const fsc = nameD.fsc || p2.fsc || (niin === niinSearchTerm ? fscFromInput : '');

      return {
        nsn: fsc ? `${fsc}${niin}` : niin,
        niin: niin,
        name: nameD.item_name || p2.itemName || 'Unknown Item',
        description: nameD.common_name || p2.commonName || null,
        turnInPart: '',
        classIX: isClassIX,
        aac: aac,
        fsc: fsc,
        characteristics: nameD.characteristics || p2.characteristics || null,
        publicationDate: weightD.publication_date || p2.publicationDate || null,

        unitPrice: priceD.unitPrice || null,
        unitOfIssue: priceD.ui || null,

        weight: weightD.dss_weight || null,
        cube: weightD.dss_cube || null,
        weightPubDate: null,
        requirementsStatement: null,
        clearTextReply: null,
        alternateNames: []
      };
    });

    // Apply Post-aggregation filters
    if (classIXFilter !== null && classIXFilter !== undefined && classIXFilter !== 'all') {
      const filterValue = classIXFilter === 'true';
      transformedData = transformedData.filter(item => item.classIX === filterValue);
    }

    if (minPrice || maxPrice) {
      transformedData = transformedData.filter(item => {
        if (!item.unitPrice) return false;
        const p = parseFloat(item.unitPrice);
        if (isNaN(p)) return false;
        if (minPrice && p < parseFloat(minPrice)) return false;
        if (maxPrice && p > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    return NextResponse.json({
      results: transformedData,
      total: totalUnique,
      page,
      limit,
      totalPages: Math.ceil(totalUnique / limit)
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

