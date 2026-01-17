# Stripe Webhook Setup Guide

## The Problem
When you subscribe, Stripe needs to notify your application via webhooks. Without proper webhook setup, your subscription status won't update in the database.

## Solution Implemented
The application now has two ways to handle subscription activation:

1. **Immediate Verification (Fallback)**: After checkout, the app directly verifies the payment with Stripe and updates your subscription status
2. **Webhook Updates (Production)**: Stripe webhooks handle subscription lifecycle events (renewals, cancellations, etc.)

## Local Development Setup

### Option 1: Use Stripe CLI (Recommended for Testing)

1. **Install Stripe CLI**
   - Windows: Download from https://github.com/stripe/stripe-cli/releases
   - Or use Scoop: `scoop install stripe`

2. **Login to Stripe**
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   
4. **Copy the webhook signing secret**
   - The CLI will display: `whsec_...`
   - Add it to your `.env` file:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

5. **Test a payment**
   ```bash
   stripe trigger checkout.session.completed
   ```

### Option 2: Skip Webhooks (Quick Testing)

The app now works without webhooks! After successful payment:
- The dashboard automatically verifies the session with Stripe
- Your subscription is activated immediately
- You can start searching right away

This fallback ensures the app works even without webhook setup.

## Production Setup

### Deploy Webhook Endpoint

1. **Add webhook endpoint in Stripe Dashboard**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   
2. **Select events to listen to**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

3. **Copy the webhook signing secret**
   - Add to your production environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

## Testing Your Setup

### Test Successful Payment
1. Go to `/pricing`
2. Click "Subscribe"
3. Use Stripe test card: `4242 4242 4242 4242`
4. Any future date and CVC
5. Complete checkout
6. You should see "Activating your subscription..." then "Subscription activated successfully!"
7. Try searching - it should work immediately!

### Test Stripe Test Cards
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Auth**: `4000 0025 0000 3155`

## Troubleshooting

### "Subscription not active" after payment
- Check browser console for errors
- Verify `STRIPE_SECRET_KEY` in `.env`
- Check Stripe Dashboard logs
- Make sure user email matches in both NextAuth and Supabase

### Webhooks not working locally
- Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Check terminal output for webhook events
- Verify `STRIPE_WEBHOOK_SECRET` matches CLI output

### Production webhooks failing
- Check Stripe Dashboard webhook logs
- Verify your production URL is correct
- Check application logs for errors
- Ensure webhook secret is set in production environment

## How It Works Now

1. **User subscribes** → Redirected to Stripe Checkout
2. **Payment succeeds** → Redirected to `/dashboard?session_id=xxx`
3. **Dashboard loads** → Calls `/api/verify-session` with session_id
4. **API verifies** → Fetches session from Stripe, updates database
5. **Success!** → User can immediately start searching
6. **Webhooks (async)** → Handle renewals, cancellations, failures in background

This dual approach ensures:
- ✅ Instant access after payment (verify-session API)
- ✅ Ongoing subscription management (webhooks)
- ✅ Works in development without Stripe CLI
- ✅ Production-ready with full webhook support
