-- Migration: Add Stripe subscription columns to users table
-- Run this in your Supabase SQL Editor (Database → SQL Editor)

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT DEFAULT NULL;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT DEFAULT NULL;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT DEFAULT NULL;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT DEFAULT NULL;

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_status 
ON users(stripe_subscription_status);

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id 
ON users(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id 
ON users(stripe_subscription_id);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
