-- Utility Setup Migration
-- Consolidates indexes, functions, extensions, and RLS setup
-- This migration combines multiple small utility migrations for efficiency

-- Enable UUID extension (required for many tables)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- JWT Claim Functions (for RLS policies)
CREATE OR REPLACE FUNCTION get_my_claim(claim TEXT)
RETURNS JSONB AS $$
BEGIN
  RETURN COALESCE(current_setting('request.jwt.claims', true)::JSONB -> claim, NULL::JSONB);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_my_claims()
RETURNS JSONB AS $$
BEGIN
  RETURN current_setting('request.jwt.claims', true)::JSONB;
END;
$$ LANGUAGE plpgsql STABLE;

-- Database Indexes (consolidated from multiple migrations)
-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- Create verification_status index only if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'verification_status'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON public.profiles(verification_status)';
  END IF;
END $$;

-- Properties table indexes
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);

-- Offers table indexes
CREATE INDEX IF NOT EXISTS idx_offers_property_id ON public.offers(property_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON public.offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_created_at ON public.offers(created_at DESC);

-- Other table indexes
CREATE INDEX IF NOT EXISTS idx_visits_property ON public.visits(property_id);
CREATE INDEX IF NOT EXISTS idx_visits_visitor ON public.visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer ON public.cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_case_documents_case ON public.case_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_case ON public.chat_messages(case_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- Note: RLS policies are handled by other migrations to avoid conflicts

-- Add comment
COMMENT ON FUNCTION get_my_claim(claim TEXT) IS 'Helper function to get specific JWT claims for RLS policies';
