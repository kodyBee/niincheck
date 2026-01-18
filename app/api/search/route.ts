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
    
    // Search pull2 table
    const { data: pull2Data, error } = await supabaseAdmin
      .from('pull2')
      .select('niin, itemName, commonName, fsc, characteristics, ric')
      .or(`niin.ilike.${searchPattern},itemName.ilike.${searchPattern},commonName.ilike.${searchPattern},fsc.ilike.${searchPattern}`)
      .limit(50);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!pull2Data || pull2Data.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Get unique NIINs to lookup AAC data
    const niins = [...new Set(pull2Data.map(item => item.niin).filter(Boolean))];
    
    // Fetch AAC data for these NIINs
    const { data: aacsData } = await supabaseAdmin
      .from('aacs')
      .select('niin, aac')
      .in('niin', niins);

    // Create a map of niin -> aac for quick lookup
    const aacMap = new Map<string, string>();
    if (aacsData) {
      aacsData.forEach(item => {
        if (item.niin && item.aac) {
          aacMap.set(item.niin, item.aac);
        }
      });
    }

    // Transform data to match expected format
    const transformedData = pull2Data.map((item: any) => {
      // Check if AAC is D, V, or Z for class IX determination
      const aac = aacMap.get(item.niin) || '';
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
