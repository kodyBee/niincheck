import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { priceId } = await request.json();
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create Stripe customer
    let customerId: string;
    
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('email', session.user.email!)
      .single();

    if (existingUser?.stripe_customer_id) {
      customerId = existingUser.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        metadata: {
          userId: session.user.id!,
        },
      });
      customerId = customer.id;
      
      // Save customer ID
      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('email', session.user.email!);
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      metadata: {
        userId: session.user.id!,
        priceId: priceId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
