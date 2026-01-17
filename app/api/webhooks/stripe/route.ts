import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;

      if (userId && session.subscription) {
        // Update user's subscription in the users table
        await supabaseAdmin
          .from('users')
          .update({
            stripe_customer_id: session.customer,
            subscription_id: session.subscription as string,
            subscription_status: 'active',
            price_id: session.metadata?.priceId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as any;
      
      await supabaseAdmin
        .from('users')
        .update({
          subscription_status: subscription.status,
          subscription_end_date: subscription.current_period_end 
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq('subscription_id', subscription.id);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      // Handle failed payment - notify user, etc.
      console.log('Payment failed for invoice:', invoice.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
