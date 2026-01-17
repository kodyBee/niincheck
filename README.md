# NSN Database Subscription Website

A modern, subscription-based web application for accessing a National Stock Number (NSN) database built with Next.js 14, NextAuth, Supabase (PostgreSQL), and Stripe.

## Features

- 🔐 **Authentication** - Secure user authentication with NextAuth (Auth.js)
- 💳 **Subscriptions** - Monthly subscription plans with Stripe
- 🔍 **Search** - Fast and powerful NSN database search
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 📊 **Dashboard** - User dashboard with search functionality
- 🔒 **Protected Routes** - Middleware-based authentication

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth v5 (Auth.js)
- **Payments**: Stripe
- **Deployment**: Vercel (recommended)

## Project Structure

```
NSNlog/
├── app/
│   ├── api/
│   │   ├── create-checkout-session/
│   │   │   └── route.ts
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts
│   ├── dashboard/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── pricing/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── PricingCard.tsx
│   ├── ResultsTable.tsx
│   └── SearchBar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   └── stripe.ts
├── .env.example
├── middleware.ts
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- A Stripe account
- npm or yarn package manager

### 1. Clone and Install

```bash
cd NSNlog
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. In your Supabase SQL Editor, run the migration script from `nextauth-migration.sql`:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  stripe_customer_id TEXT,
  subscription_status TEXT,
  subscription_id TEXT,
  price_id TEXT,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create NSN data table
CREATE TABLE nsn_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nsn TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  fsc TEXT,
  niin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
```

3. Get your Supabase credentials from Settings > API
   - You'll need the Project URL, anon/public key, and service_role key

### 3. Set Up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from Developers > API keys
3. Create subscription products and prices in Stripe Dashboard
4. Set up a webhook endpoint pointing to: `https://yourdomain.com/api/webhooks/stripe`
5. Select these events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Edit `.env` with your credentials:

```env
# Supabase (PostgreSQL Database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth - Generate secret with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# App URL (optional, defaults to http://localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Generate a secure `NEXTAUTH_SECRET` using:
```bash
openssl rand -base64 32
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [vercel.com](https://vercel.com)
3. Add all environment variables from `.env`
4. Deploy!

### Update Stripe Webhook

After deployment, update your Stripe webhook URL to point to your production domain:
```
https://yourdomain.com/api/webhooks/stripe
```

## Customization

### Update NSN Table Name

If your Supabase table has a different name, update the query in [app/dashboard/page.tsx](app/dashboard/page.tsx):

```typescript
const { data, error } = await supabase
  .from('your_table_name') // Change this
  .select('*')
  // ...
```

### Modify Pricing Plans

Edit the pricing plans in [app/pricing/page.tsx](app/pricing/page.tsx):

```typescript
const pricingPlans = [
  {
    name: "Your Plan",
    price: "49",
    period: "month",
    priceId: "price_xxxxx",
    features: ["Feature 1", "Feature 2"],
  },
  // ...
];
```

### Customize Branding

- Update colors in [tailwind.config.ts](tailwind.config.ts)
- Modify the logo and company name in components
- Customize metadata in [app/layout.tsx](app/layout.tsx)

## Database Schema

### NSN Data Table
- `nsn`: National Stock Number
- `name`: Item name
- `description`: Item description
- `fsc`: Federal Supply Class
- `niin`: National Item Identification Number

### User Subscriptions Table
- `user_id`: Reference to Supabase auth user
- `stripe_customer_id`: Stripe customer ID
- `stripe_subscription_id`: Stripe subscription ID
- `status`: Subscription status (active, canceled, etc.)

## API Routes

### `/api/create-checkout-session`
Creates a Stripe checkout session for subscription purchase.

### `/api/webhooks/stripe`
Handles Stripe webhook events for subscription management.

## Security

- All routes except public pages require authentication
- Row Level Security (RLS) enabled on Supabase tables
- Stripe webhook signature verification
- Environment variables for sensitive keys

## Troubleshooting

### Stripe Webhook Not Working
- Ensure webhook URL is correct
- Verify webhook secret in environment variables
- Check Stripe Dashboard > Developers > Webhooks for failed attempts

### Authentication Issues
- Verify Supabase environment variables
- Check that email confirmation is set up correctly
- Ensure middleware is properly configured

### Database Connection Errors
- Verify Supabase URL and keys
- Check table names match your schema
- Ensure RLS policies are set correctly

## Support

For issues and questions:
- Check the [Next.js documentation](https://nextjs.org/docs)
- Review [Supabase docs](https://supabase.com/docs)
- See [Stripe documentation](https://stripe.com/docs)

## License

MIT License - feel free to use this project for your own purposes.

## Next Steps

1. Import your NSN data into Supabase
2. Set up your Stripe products and pricing
3. Customize the UI to match your brand
4. Add more features (export, filtering, etc.)
5. Deploy to production
6. Set up monitoring and analytics

---

Built with ❤️ using Next.js, Supabase, and Stripe
