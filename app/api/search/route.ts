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

    // ULTRA-LEAN search for 5+ GB tables without indexes
    let searchQuery = supabaseAdmin
      .from('pull2')
      .select('niin, fsc', { count: 'exact' }) // Minimal columns only
      .limit(20); // Reduced to 20 for speed

    // Apply search filter - simple matching only
    if (/^\d+$/.test(query)) {
      // Numeric search: prefix match on NIIN
      searchQuery = searchQuery.ilike('niin', `${query}%`);
    } else {
      // Text search: exact FSC match only (fastest option)
      searchQuery = searchQuery.eq('fsc', query.toUpperCase());
    }

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
    
    // Skip ALL joins to prevent timeout - minimal data only
    const aacsData = null;
    const pricesData = null;
    let weightsData = null;
    let descriptionsData = null;
    let namesData = null;

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

    conTransform data to match expected format - MINIMAL DATA ONLY
    let transformedData = pull2Data.map((item: any) => {
      return {
        nsn: item.niin || '',
        name: null,
        description: null,
        turnInPart: '',
        classIX: null,
        aac: null,
        fsc: item.fsc || '',
        niin: item.niin || '',
        characteristics: null,
        publicationDate: null,
        // All enriched data null - use detail endpoint
        unitPrice: null,
        unitOfIssue: null,
        weight: null,
        cube: null,
        weightPubDate: null,
        requirementsStatement: null,
        clearTextReply: null,
        alternateNames: []
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
