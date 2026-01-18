import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { niin: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { niin } = params;

    if (!niin) {
      return NextResponse.json(
        { error: 'NIIN is required' },
        { status: 400 }
      );
    }

    // Fetch all data for this NIIN in parallel
    const [
      { data: pull2Data, error: pull2Error },
      { data: aacData },
      { data: priceData },
      { data: weightData },
      { data: descriptionData },
      { data: namesData },
      { data: fscData }
    ] = await Promise.all([
      supabaseAdmin
        .from('pull2')
        .select('*')
        .eq('niin', niin)
        .single(),
      supabaseAdmin
        .from('aacs')
        .select('*')
        .eq('niin', niin)
        .single(),
      supabaseAdmin
        .from('prices')
        .select('*')
        .eq('niin', niin)
        .single(),
      supabaseAdmin
        .from('weights')
        .select('*')
        .eq('niin', niin)
        .single(),
      supabaseAdmin
        .from('descriptions')
        .select('*')
        .eq('niin', niin)
        .single(),
      supabaseAdmin
        .from('names')
        .select('*')
        .eq('niin', niin),
      supabaseAdmin
        .from('fscs')
        .select('*')
        .eq('niin', niin)
        .single()
    ]);

    if (pull2Error && pull2Error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'NSN not found' },
        { status: 404 }
      );
    }

    if (pull2Error) {
      console.error('Database error:', pull2Error);
      return NextResponse.json(
        { error: pull2Error.message },
        { status: 500 }
      );
    }

    // Determine if Class IX
    const aac = aacData?.aac || '';
    const isClassIX = ['D', 'V', 'Z'].includes(aac.toUpperCase());

    // Compile comprehensive NSN data
    const nsnDetail = {
      // Basic Info
      niin: pull2Data?.niin || niin,
      itemName: pull2Data?.itemName || null,
      commonName: pull2Data?.commonName || null,
      characteristics: pull2Data?.characteristics || null,
      publicationDate: pull2Data?.publicationDate || null,
      
      // Classification
      fsc: pull2Data?.fsc || fscData?.fsc || null,
      aac: aac,
      classIX: isClassIX,
      
      // Pricing
      unitPrice: priceData?.unitPrice || null,
      unitOfIssue: priceData?.ui || null,
      
      // Physical Properties
      weight: weightData?.dss_weight || null,
      cube: weightData?.dss_cube || null,
      weightPublicationDate: weightData?.publication_date || null,
      
      // Descriptions
      requirementsStatement: descriptionData?.requirementsStatement || null,
      clearTextReply: descriptionData?.clearTextReply || null,
      
      // Alternate Names
      alternateNames: namesData?.map(n => n.item_name).filter(Boolean) || [],
      
      // Complete records for reference
      rawData: {
        pull2: pull2Data,
        aac: aacData,
        price: priceData,
        weight: weightData,
        description: descriptionData,
        names: namesData,
        fsc: fscData
      }
    };

    return NextResponse.json(nsnDetail);
  } catch (error) {
    console.error('NSN detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
