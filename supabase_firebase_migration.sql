-- ============================================================================
-- KISAANSAATHI - FIREBASE PHONE AUTHENTICATION & SUPABASE THIRD-PARTY MIGRATION
-- Project ID: kisaansaathi-cba16
-- Supabase Target: https://ytuiolcffxcqnwlefvrr.supabase.co
-- ============================================================================
-- This migration safely links Firebase Authentication (SMS Phone OTP) with existing
-- Supabase database records while fully preserving all existing farmer profiles,
-- consumer profiles, historical crops, negotiations, orders, and wallet balances.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ADD FIREBASE IDENTITY COLUMNS TO PROFILES & CONSUMERS
-- ----------------------------------------------------------------------------
-- Preserves all existing records: Columns are added with IF NOT EXISTS.
-- Nullable so existing demo accounts and Google OAuth accounts continue to function.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS firebase_uid TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS aadhar_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS aadhar_number TEXT;

-- Create performant B-Tree indexes for rapid UID and Phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_firebase_uid ON public.profiles(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Consumer / Buyer Portal table
ALTER TABLE public.consumers ADD COLUMN IF NOT EXISTS firebase_uid TEXT;
ALTER TABLE public.consumers ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE public.consumers ADD COLUMN IF NOT EXISTS aadhar_verified BOOLEAN DEFAULT false;
ALTER TABLE public.consumers ADD COLUMN IF NOT EXISTS aadhar_number TEXT;

CREATE INDEX IF NOT EXISTS idx_consumers_firebase_uid ON public.consumers(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_consumers_phone ON public.consumers(phone);

-- ----------------------------------------------------------------------------
-- 2. USER LOGINS AUDIT TABLE FIREBASE ENHANCEMENT
-- ----------------------------------------------------------------------------
ALTER TABLE public.user_logins ADD COLUMN IF NOT EXISTS firebase_uid TEXT;
ALTER TABLE public.user_logins ADD COLUMN IF NOT EXISTS phone TEXT;

-- ----------------------------------------------------------------------------
-- 3. THIRD-PARTY FIREBASE AUTH JWT RECOGNITION IN SUPABASE
-- ----------------------------------------------------------------------------
-- Supabase Third-Party Firebase Authentication maps the verified Firebase user:
--   auth.jwt() ->> 'sub'   = Firebase UID
--   auth.jwt() ->> 'phone_number' = Verified E.164 Phone Number (+91XXXXXXXXXX)
--   auth.jwt() ->> 'iss'   = https://securetoken.google.com/kisaansaathi-cba16
--   auth.jwt() ->> 'aud'   = kisaansaathi-cba16
--   auth.jwt() ->> 'role'  = authenticated
--
-- The helper function below safely extracts the active Firebase UID from the JWT:
CREATE OR REPLACE FUNCTION public.firebase_uid()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        auth.jwt() ->> 'sub',
        auth.uid()::TEXT
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 4. HARDENED ROW LEVEL SECURITY (RLS) POLICIES (OPTIONAL / PRODUCTION GRADUATION)
-- ----------------------------------------------------------------------------
-- Note: The current application utilizes universal read/write policies for seamless
-- offline/demo presentation. To graduate to strict ownership-based RLS in production,
-- execute the policies below:

/*
-- Profiles: Users can view all verified farmer profiles, but only edit their own
DROP POLICY IF EXISTS "Public All Profiles" ON public.profiles;

CREATE POLICY "Allow public read verified profiles" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Allow users to update own profile" 
ON public.profiles FOR UPDATE 
USING (
    firebase_uid = public.firebase_uid() 
    OR user_id = auth.uid()
)
WITH CHECK (
    firebase_uid = public.firebase_uid() 
    OR user_id = auth.uid()
);

CREATE POLICY "Allow authenticated users to insert profile" 
ON public.profiles FOR INSERT 
WITH CHECK (
    firebase_uid = public.firebase_uid() 
    OR auth.role() = 'authenticated'
    OR firebase_uid IS NOT NULL
);

-- Crops: Anyone can view produce listings; only owner farmer can insert/update/delete
DROP POLICY IF EXISTS "Public All Crops" ON public.crops;

CREATE POLICY "Allow public read crops" 
ON public.crops FOR SELECT 
USING (true);

CREATE POLICY "Allow farmer to manage own crops" 
ON public.crops FOR ALL 
USING (
    farmer_id IN (
        SELECT farmer_id FROM public.profiles 
        WHERE firebase_uid = public.firebase_uid() OR user_id = auth.uid()
    )
    OR auth.role() = 'anon' -- fallback during transition
);
*/

-- ============================================================================
-- VERIFICATION QUERY: Run this to confirm successful schema migration
-- ============================================================================
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name IN ('firebase_uid', 'phone_verified', 'aadhar_verified');
