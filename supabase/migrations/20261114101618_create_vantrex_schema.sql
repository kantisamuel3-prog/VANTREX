/*
# Vantrex Investment Platform Schema

## Overview
Creates the database schema for the Vantrex investment platform with user authentication,
investment plans, user investments, transactions, and referral tracking.

## Tables

### profiles
- `id` (uuid, PK, references auth.users) — one-to-one with each user's auth account
- `username` (text) — display name
- `email` (text) — user's email
- `balance` (numeric, default 0) — current withdrawable balance
- `referral_code` (text, unique) — unique code for referrals
- `referred_by` (text) — referral code of the person who invited this user
- `gcash_number` (text) — bound GCash number for withdrawals
- `maya_number` (text) — bound Maya number for withdrawals
- `created_at` (timestamptz)

### investments
- `id` (uuid, PK)
- `user_id` (uuid, references auth.users) — owner
- `plan_name` (text) — name of the plan purchased
- `plan_amount` (numeric) — amount invested
- `daily_return` (numeric) — daily earnings
- `cycle_days` (integer) — total days of the plan
- `start_date` (timestamptz) — when the investment started
- `end_date` (timestamptz) — when the investment ends
- `status` (text, default 'active') — active, completed, cancelled
- `total_earned` (numeric, default 0) — accumulated earnings
- `last_claim_date` (timestamptz) — last time earnings were claimed
- `created_at` (timestamptz)

### transactions
- `id` (uuid, PK)
- `user_id` (uuid, references auth.users) — owner
- `type` (text) — deposit, withdraw, investment, referral_bonus, daily_earning
- `amount` (numeric) — transaction amount
- `status` (text, default 'completed') — pending, completed, failed
- `description` (text) — human-readable description
- `created_at` (timestamptz)

### referrals
- `id` (uuid, PK)
- `referrer_id` (uuid, references auth.users) — the person who referred
- `referred_id` (uuid, references auth.users) — the person who was referred
- `referral_code` (text) — the code used
- `bonus_amount` (numeric, default 0) — bonus earned from this referral
- `status` (text, default 'pending') — pending, completed
- `created_at` (timestamptz)

## Security
- RLS enabled on all tables
- All policies scoped TO authenticated with ownership checks (auth.uid() = user_id)
- Grants limited to authenticated role only (this app requires sign-in)
- service_role granted for potential edge function usage
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  email text,
  balance numeric DEFAULT 0,
  referral_code text UNIQUE,
  referred_by text,
  gcash_number text,
  maya_number text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO service_role;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  plan_amount numeric NOT NULL,
  daily_return numeric NOT NULL,
  cycle_days integer NOT NULL,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  status text DEFAULT 'active',
  total_earned numeric DEFAULT 0,
  last_claim_date timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON investments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON investments TO service_role;

DROP POLICY IF EXISTS "select_own_investments" ON investments;
CREATE POLICY "select_own_investments" ON investments FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_investments" ON investments;
CREATE POLICY "insert_own_investments" ON investments FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_investments" ON investments;
CREATE POLICY "update_own_investments" ON investments FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'completed',
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON transactions TO authenticated;
GRANT SELECT, INSERT ON transactions TO service_role;

DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
CREATE POLICY "select_own_transactions" ON transactions FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_transactions" ON transactions;
CREATE POLICY "insert_own_transactions" ON transactions FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  bonus_amount numeric DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON referrals TO authenticated;
GRANT SELECT, INSERT ON referrals TO service_role;

DROP POLICY IF EXISTS "select_own_referrals" ON referrals;
CREATE POLICY "select_own_referrals" ON referrals FOR SELECT
TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

DROP POLICY IF EXISTS "insert_own_referrals" ON referrals;
CREATE POLICY "insert_own_referrals" ON referrals FOR INSERT
TO authenticated WITH CHECK (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
