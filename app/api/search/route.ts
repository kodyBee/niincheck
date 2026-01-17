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

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Optimize search: use prefix matching instead of wildcard for better performance
    const searchPattern = `${query}%`;
    
    // Search across NIIN, item name, common name, FSC fields with optimized pattern
    // Join with aacs table to determine class IX status
    const { data, error } = await supabaseAdmin
      .from('pull2')
      .select(`
        niin, 
        itemName, 
        commonName, 
        fsc, 
        characteristics,
        ric,
        aacs!left(aac)
      `)
      .or(`niin.ilike.${searchPattern},itemName.ilike.${searchPattern},commonName.ilike.${searchPattern},fsc.ilike.${searchPattern}`)
      .limit(50);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Transform data to match expected format
    const transformedData = (data || []).map((item: any) => {
      // Check if AAC is D, V, or Z for class IX determination
      const aac = item.aacs?.[0]?.aac || item.aacs?.aac || '';
      const isClassIX = ['D', 'V', 'Z'].includes(aac.toUpperCase());
      
      return {
        nsn: item.niin || '', // Using NIIN as NSN equivalent
        name: item.itemName || '',
        description: item.commonName || '',
        turnInPart: item.ric || '', // RIC is typically the turn-in part indicator
        classIX: isClassIX,
        fsc: item.fsc || '',
        niin: item.niin || ''
      };
    });

    return NextResponse.json({ results: transformedData });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
