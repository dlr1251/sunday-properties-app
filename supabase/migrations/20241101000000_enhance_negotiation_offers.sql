-- ============================================
-- ENHANCE NEGOTIATION_OFFERS WITH TYPED COLUMNS
-- ============================================
-- Transform negotiation_offers into a first-class history ledger with:
-- - Typed columns for core offer terms
-- - Parent-child relationships for offer chains
-- - Versioning per negotiation
-- - Author roles and kind (offer/counter)
-- ============================================

-- ============================================
-- ADD NEW COLUMNS TO negotiation_offers
-- ============================================
DO $$
BEGIN
    -- Parent-child relationship
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'negotiation_offers' AND column_name = 'parent_offer_id'
    ) THEN
        ALTER TABLE negotiation_offers 
        ADD COLUMN parent_offer_id UUID REFERENCES negotiation_offers(id) ON DELETE SET NULL;
    END IF;

    -- Version tracking
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'negotiation_offers' AND column_name = 'version'
    ) THEN
        ALTER TABLE negotiation_offers 
        ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
    END IF;

    -- Author role
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'negotiation_offers' AND column_name = 'author_role'
    ) THEN
        ALTER TABLE negotiation_offers 
        ADD COLUMN author_role TEXT CHECK (author_role IN ('buyer', 'seller', 'agent', 'lawyer', 'admin'));
    END IF;

    -- Kind (offer vs counter)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'negotiation_offers' AND column_name = 'kind'
    ) THEN
        ALTER TABLE negotiation_offers 
        ADD COLUMN kind TEXT NOT NULL DEFAULT 'offer' CHECK (kind IN ('offer', 'counter'));
    END IF;

    -- Validity period
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'negotiation_offers' AND column_name = 'valid_until'
    ) THEN
        ALTER TABLE negotiation_offers 
        ADD COLUMN valid_until TIMESTAMPTZ NULL;
    END IF;

    -- Typed price column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'negotiation_offers' AND column_name = 'price'
    ) THEN
        ALTER TABLE negotiation_offers 
        ADD COLUMN price BIGINT NULL;
    END IF;

    -- Typed down payment column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'negotiation_offers' AND column_name = 'down_payment'
    ) THEN
        ALTER TABLE negotiation_offers 
        ADD COLUMN down_payment BIGINT NULL;
    END IF;

    -- Typed payment method column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'negotiation_offers' AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE negotiation_offers 
        ADD COLUMN payment_method TEXT NULL;
    END IF;

    -- Typed closing date column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'negotiation_offers' AND column_name = 'closing_date'
    ) THEN
        ALTER TABLE negotiation_offers 
        ADD COLUMN closing_date DATE NULL;
    END IF;

    -- Conditions as JSONB array
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'negotiation_offers' AND column_name = 'conditions'
    ) THEN
        ALTER TABLE negotiation_offers 
        ADD COLUMN conditions JSONB NULL;
    END IF;

    -- Message text
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'negotiation_offers' AND column_name = 'message'
    ) THEN
        ALTER TABLE negotiation_offers 
        ADD COLUMN message TEXT NULL;
    END IF;
END $$;

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_negotiation_offers_negotiation_version 
    ON negotiation_offers(negotiation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_negotiation_offers_parent 
    ON negotiation_offers(parent_offer_id);

CREATE INDEX IF NOT EXISTS idx_negotiation_offers_version 
    ON negotiation_offers(version);

CREATE INDEX IF NOT EXISTS idx_negotiation_offers_price 
    ON negotiation_offers(price);

CREATE INDEX IF NOT EXISTS idx_negotiation_offers_kind 
    ON negotiation_offers(kind);

-- ============================================
-- BACKFILL TYPED COLUMNS FROM PAYLOAD
-- ============================================
DO $$
DECLARE
    offer_rec RECORD;
    current_version INTEGER;
    prev_offer_id UUID;
    neg_id UUID;
    buyer_role TEXT;
    seller_role TEXT;
BEGIN
    -- Loop through all negotiation_offers and backfill typed columns
    FOR offer_rec IN 
        SELECT * FROM negotiation_offers ORDER BY negotiation_id, created_at ASC
    LOOP
        -- Track negotiation context for version numbering
        IF neg_id IS NULL OR neg_id != offer_rec.negotiation_id THEN
            neg_id := offer_rec.negotiation_id;
            current_version := 1;
            prev_offer_id := NULL;
            
            -- Determine buyer/seller for author_role inference
            SELECT buyer_id, seller_id INTO buyer_role, seller_role
            FROM negotiations WHERE id = neg_id;
            
            RAISE NOTICE 'Backfilling negotiation: %', neg_id;
        ELSE
            current_version := current_version + 1;
        END IF;

        -- Extract typed columns from payload JSONB
        UPDATE negotiation_offers
        SET
            -- Typed columns from payload
            price = CASE 
                WHEN payload ? 'price' THEN (payload->>'price')::BIGINT
                WHEN payload ? 'priceAmount' THEN (payload->>'priceAmount')::BIGINT
                ELSE NULL
            END,
            down_payment = CASE 
                WHEN payload ? 'downPayment' THEN (payload->>'downPayment')::BIGINT
                WHEN payload ? 'down_payment' THEN (payload->>'down_payment')::BIGINT
                ELSE NULL
            END,
            payment_method = CASE 
                WHEN payload ? 'paymentMethod' THEN payload->>'paymentMethod'
                WHEN payload ? 'payment_method' THEN payload->>'payment_method'
                ELSE NULL
            END,
            closing_date = CASE 
                WHEN payload ? 'closingDate' THEN (payload->>'closingDate')::DATE
                WHEN payload ? 'closing_date' THEN (payload->>'closing_date')::DATE
                ELSE NULL
            END,
            conditions = CASE 
                WHEN payload ? 'conditions' THEN payload->'conditions'
                ELSE NULL
            END,
            message = CASE 
                WHEN payload ? 'message' THEN payload->>'message'
                ELSE NULL
            END,
            -- Version and kind
            version = current_version,
            kind = CASE 
                WHEN current_version = 1 THEN 'offer'
                ELSE 'counter'
            END,
            -- Parent relationship
            parent_offer_id = prev_offer_id,
            -- Infer author_role from negotiation participants
            author_role = CASE
                WHEN offer_rec.author = buyer_role THEN 'buyer'
                WHEN offer_rec.author = seller_role THEN 'seller'
                ELSE NULL -- Will be populated by application later
            END
        WHERE id = offer_rec.id;

        -- Track for next iteration
        prev_offer_id := offer_rec.id;
    END LOOP;

    RAISE NOTICE 'Backfill completed for negotiation_offers';
END $$;

-- ============================================
-- CREATE offers_history_v VIEW
-- ============================================
CREATE OR REPLACE VIEW offers_history_v AS
SELECT 
    o.*,
    parent.id AS parent_id,
    parent.price AS parent_price,
    parent.down_payment AS parent_down_payment,
    parent.payment_method AS parent_payment_method,
    parent.closing_date AS parent_closing_date,
    -- Computed diffs
    (o.price - COALESCE(parent.price, 0)) AS price_delta,
    (CASE 
        WHEN o.price != COALESCE(parent.price, o.price) THEN 'price' 
        ELSE NULL 
    END) AS price_changed,
    (CASE 
        WHEN o.down_payment != COALESCE(parent.down_payment, o.down_payment) THEN 'down_payment' 
        ELSE NULL 
    END) AS down_payment_changed,
    (CASE 
        WHEN o.payment_method IS DISTINCT FROM parent.payment_method THEN 'payment_method' 
        ELSE NULL 
    END) AS payment_method_changed,
    (CASE 
        WHEN o.closing_date IS DISTINCT FROM parent.closing_date THEN 'closing_date' 
        ELSE NULL 
    END) AS closing_date_changed,
    -- Changed fields summary
    jsonb_build_object(
        'price', CASE WHEN o.price != COALESCE(parent.price, o.price) THEN 'changed' ELSE NULL END,
        'down_payment', CASE WHEN o.down_payment != COALESCE(parent.down_payment, o.down_payment) THEN 'changed' ELSE NULL END,
        'payment_method', CASE WHEN o.payment_method IS DISTINCT FROM parent.payment_method THEN 'changed' ELSE NULL END,
        'closing_date', CASE WHEN o.closing_date IS DISTINCT FROM parent.closing_date THEN 'changed' ELSE NULL END
    ) AS changed_fields
FROM negotiation_offers o
LEFT JOIN negotiation_offers parent ON o.parent_offer_id = parent.id;

-- ============================================
-- UPDATE UPDATED_AT TRIGGER
-- ============================================
-- Ensure trigger exists for updated_at
DROP TRIGGER IF EXISTS update_negotiation_offers_updated_at ON negotiation_offers;
CREATE TRIGGER update_negotiation_offers_updated_at
    BEFORE UPDATE ON negotiation_offers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT SELECT ON offers_history_v TO authenticated;
GRANT SELECT ON offers_history_v TO anon;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON COLUMN negotiation_offers.parent_offer_id IS 'Links to previous offer in the negotiation chain';
COMMENT ON COLUMN negotiation_offers.version IS 'Sequential version number within negotiation, starting at 1';
COMMENT ON COLUMN negotiation_offers.author_role IS 'Role of author in negotiation context (buyer/seller/etc)';
COMMENT ON COLUMN negotiation_offers.kind IS 'Type of offer: initial offer or counteroffer';
COMMENT ON COLUMN negotiation_offers.price IS 'Typed price field extracted from payload for easier querying';
COMMENT ON COLUMN negotiation_offers.down_payment IS 'Typed down payment extracted from payload';
COMMENT ON COLUMN negotiation_offers.payment_method IS 'Typed payment method extracted from payload';
COMMENT ON COLUMN negotiation_offers.closing_date IS 'Typed closing date extracted from payload';
COMMENT ON COLUMN negotiation_offers.conditions IS 'Conditions array extracted from payload';
COMMENT ON COLUMN negotiation_offers.message IS 'Message text extracted from payload';
COMMENT ON VIEW offers_history_v IS 'Enriched view of offers with parent references and computed diffs';

