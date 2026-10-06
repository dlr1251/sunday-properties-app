-- ============================================
-- Add sale + rental listing support
-- ============================================
-- - Adds listing_type + rental fields to properties
-- - Adds transaction_type + rental offer fields to offers
-- - Updates constraints so sale requires price, rental requires rent_monthly

BEGIN;

-- ----------------------------
-- PROPERTIES
-- ----------------------------
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS listing_type TEXT NOT NULL DEFAULT 'sale' CHECK (listing_type IN ('sale', 'rental')),
  ADD COLUMN IF NOT EXISTS rent_monthly BIGINT,
  ADD COLUMN IF NOT EXISTS lease_term_months INTEGER,
  ADD COLUMN IF NOT EXISTS deposit BIGINT,
  ADD COLUMN IF NOT EXISTS admin_fee BIGINT,
  ADD COLUMN IF NOT EXISTS utilities_included TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pets_policy TEXT;

-- Allow rentals to omit sale price; enforce via check constraint instead.
ALTER TABLE public.properties
  ALTER COLUMN price DROP NOT NULL;

-- Replace price-only constraint with a transaction-aware constraint.
DO $$
BEGIN
  -- Drop any existing simple price constraint if present (name may vary).
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.properties'::regclass
      AND contype = 'c'
      AND conname = 'properties_price_check'
  ) THEN
    ALTER TABLE public.properties DROP CONSTRAINT properties_price_check;
  END IF;
EXCEPTION WHEN undefined_object THEN
  -- ignore
END$$;

ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_price_check;

ALTER TABLE public.properties
  ADD CONSTRAINT properties_sale_or_rental_pricing_check
  CHECK (
    (listing_type = 'sale' AND price IS NOT NULL AND price > 0)
    OR
    (listing_type = 'rental' AND rent_monthly IS NOT NULL AND rent_monthly > 0)
  );

-- Helpful index for filtering
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties(listing_type);

-- ----------------------------
-- OFFERS
-- ----------------------------
ALTER TABLE public.offers
  ADD COLUMN IF NOT EXISTS transaction_type TEXT NOT NULL DEFAULT 'sale' CHECK (transaction_type IN ('sale', 'rental')),
  ADD COLUMN IF NOT EXISTS monthly_rent BIGINT,
  ADD COLUMN IF NOT EXISTS lease_start_date DATE,
  ADD COLUMN IF NOT EXISTS lease_term_months INTEGER,
  ADD COLUMN IF NOT EXISTS deposit BIGINT,
  ADD COLUMN IF NOT EXISTS admin_fee BIGINT,
  ADD COLUMN IF NOT EXISTS utilities_included TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pets_policy TEXT;

-- Allow rental offers to omit offer_price/original_price; enforce via check constraint.
ALTER TABLE public.offers
  ALTER COLUMN offer_price DROP NOT NULL,
  ALTER COLUMN original_price DROP NOT NULL;

ALTER TABLE public.offers
  DROP CONSTRAINT IF EXISTS offers_offer_price_check,
  DROP CONSTRAINT IF EXISTS offers_original_price_check;

ALTER TABLE public.offers
  ADD CONSTRAINT offers_sale_or_rental_pricing_check
  CHECK (
    (transaction_type = 'sale' AND offer_price IS NOT NULL AND offer_price > 0 AND original_price IS NOT NULL AND original_price > 0)
    OR
    (transaction_type = 'rental' AND monthly_rent IS NOT NULL AND monthly_rent > 0)
  );

CREATE INDEX IF NOT EXISTS idx_offers_transaction_type ON public.offers(transaction_type);

COMMIT;

