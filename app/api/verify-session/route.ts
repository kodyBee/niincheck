import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';
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
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status === 'paid' && checkoutSession.subscription) {
      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(
        checkoutSession.subscription as string
      );

      // Update user's subscription in database
      const updateData: any = {
        stripe_customer_id: checkoutSession.customer as string,
        subscription_id: checkoutSession.subscription as string,
        subscription_status: subscription.status,
        price_id: subscription.items.data[0]?.price.id,
        updated_at: new Date().toISOString(),
      };

      // Only add subscription_end_date if current_period_end exists
      if (subscription.current_period_end) {
        updateData.subscription_end_date = new Date(subscription.current_period_end * 1000).toISOString();
      }

      await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('email', session.user.email!);

      return NextResponse.json({ 
        success: true,
        status: subscription.status 
      });
    }

    return NextResponse.json({ 
      success: false,
      status: checkoutSession.payment_status 
    });
  } catch (error: any) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
