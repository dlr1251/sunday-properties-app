-- ============================================
-- 04 NEGOTIATIONS SYSTEM - Consolidated Migration
-- ============================================
-- This migration consolidates all negotiation-related tables and functions
-- Sources consolidated:
--   - 20250128000000_create_negotiations_table.sql
--   - 20251031000000_comprehensive_negotiations_system.sql
--   - 20251031_add_negotiations.sql
--   - 20251021080000_negotiation_closing.sql

-- ============================================
-- NEGOTIATIONS TABLE (Enhanced)
-- ============================================
-- Ensure the base negotiations table exists with enhanced structure
DO $$
BEGIN
    -- Check if negotiations table exists and has basic structure
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'negotiations') THEN
        -- Create comprehensive negotiations table
        CREATE TABLE public.negotiations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
            buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            lawyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
            agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
            
            -- Basic fields (for simple structure)
            title TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived', 'active', 'pending_lawyer', 'pending_documents', 'completed', 'cancelled', 'expired')),
            participants UUID[] NOT NULL DEFAULT '{}',
            
            -- Enhanced fields (for comprehensive structure)
            initial_offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
            current_price BIGINT,
            original_price BIGINT,
            price_difference BIGINT GENERATED ALWAYS AS (current_price - original_price) STORED,
            price_change_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
                CASE 
                    WHEN original_price > 0 THEN ((current_price - original_price)::DECIMAL / original_price::DECIMAL * 100)
                    ELSE 0
                END
            ) STORED,
            negotiation_progress INTEGER DEFAULT 0 CHECK (negotiation_progress >= 0 AND negotiation_progress <= 100),
            last_offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
            offer_count INTEGER DEFAULT 1,
            counter_offer_count INTEGER DEFAULT 0,
            metadata JSONB DEFAULT '{}',
            milestones_completed JSONB DEFAULT '{}',
            
            -- Timestamps
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            completed_at TIMESTAMP WITH TIME ZONE,
            expires_at TIMESTAMP WITH TIME ZONE
        );
    ELSE
        -- Add missing columns if they don't exist
        ALTER TABLE public.negotiations
            ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
            ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            ADD COLUMN IF NOT EXISTS lawyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS initial_offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS current_price BIGINT,
            ADD COLUMN IF NOT EXISTS original_price BIGINT,
            ADD COLUMN IF NOT EXISTS negotiation_progress INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS last_offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS offer_count INTEGER DEFAULT 1,
            ADD COLUMN IF NOT EXISTS counter_offer_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS milestones_completed JSONB DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
            ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
        
        -- Update status constraint if needed
        ALTER TABLE public.negotiations DROP CONSTRAINT IF EXISTS negotiations_status_check;
        ALTER TABLE public.negotiations ADD CONSTRAINT negotiations_status_check
            CHECK (status IN ('open', 'closed', 'archived', 'active', 'pending_lawyer', 'pending_documents', 'completed', 'cancelled', 'expired'));
        
        -- Ensure participants has default
        ALTER TABLE public.negotiations ALTER COLUMN participants SET DEFAULT '{}';
    END IF;
END $$;

-- Negotiations indexes
CREATE INDEX IF NOT EXISTS idx_negotiations_property ON negotiations(property_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_buyer ON negotiations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_seller ON negotiations(seller_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_lawyer ON negotiations(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_status ON negotiations(status);
CREATE INDEX IF NOT EXISTS idx_negotiations_created_at ON negotiations(created_at);
CREATE INDEX IF NOT EXISTS idx_negotiations_participants ON negotiations USING GIN(participants);

-- ============================================
-- NEGOTIATION OFFERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.negotiation_offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    negotiation_id UUID NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
    author UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    payload JSONB NOT NULL, -- { price, downPayment, annualRate, termMonths, fees[], dates }
    status TEXT NOT NULL CHECK (status IN ('offer', 'counter', 'accepted', 'rejected', 'pending', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Negotiation offers indexes
CREATE INDEX IF NOT EXISTS idx_negotiation_offers_negotiation_id ON negotiation_offers(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_offers_author ON negotiation_offers(author);
CREATE INDEX IF NOT EXISTS idx_negotiation_offers_status ON negotiation_offers(status);

-- ============================================
-- NEGOTIATION DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.negotiation_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    negotiation_id UUID NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('promise_of_sale', 'promesa', 'otrosi', 'oferta', 'escritura', 'legal', 'other')),
    content JSONB NOT NULL, -- tiptap json snapshot or document content
    version INTEGER DEFAULT 1,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    document_url TEXT,
    document_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'signed', 'finalized', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Negotiation documents indexes
CREATE INDEX IF NOT EXISTS idx_negotiation_documents_negotiation_id ON negotiation_documents(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_documents_kind ON negotiation_documents(kind);
CREATE INDEX IF NOT EXISTS idx_negotiation_documents_status ON negotiation_documents(status);

-- ============================================
-- ADD NEGOTIATION_ID TO OFFERS TABLE
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'negotiation_id'
    ) THEN
        ALTER TABLE offers ADD COLUMN negotiation_id UUID REFERENCES negotiations(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_offers_negotiation ON offers(negotiation_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'seller_id'
    ) THEN
        ALTER TABLE offers ADD COLUMN seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_offers_seller ON offers(seller_id);
    END IF;
END $$;

-- ============================================
-- FUNCTION TO UPDATE NEGOTIATION ON OFFER
-- ============================================
CREATE OR REPLACE FUNCTION update_negotiation_on_offer()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_property_owner_id UUID;
    v_negotiation_id UUID;
BEGIN
    -- Get property owner
    SELECT owner_id INTO v_property_owner_id
    FROM properties
    WHERE id = NEW.property_id;

    IF v_property_owner_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Find or create negotiation
    SELECT id INTO v_negotiation_id
    FROM negotiations
    WHERE property_id = NEW.property_id
    AND buyer_id = NEW.buyer_id
    AND seller_id = v_property_owner_id
    AND status IN ('active', 'open', 'pending_lawyer', 'pending_documents')
    ORDER BY created_at DESC
    LIMIT 1;

    -- If no negotiation exists, create one
    IF v_negotiation_id IS NULL THEN
        INSERT INTO negotiations (
            property_id,
            buyer_id,
            seller_id,
            initial_offer_id,
            current_price,
            original_price,
            last_offer_id,
            status,
            expires_at,
            title,
            participants
        ) VALUES (
            NEW.property_id,
            NEW.buyer_id,
            v_property_owner_id,
            NEW.id,
            NEW.offer_price,
            NEW.original_price,
            NEW.id,
            'active',
            NEW.expires_at,
            'Negociación - ' || COALESCE((SELECT title FROM properties WHERE id = NEW.property_id), 'Propiedad'),
            ARRAY[NEW.buyer_id, v_property_owner_id]
        ) RETURNING id INTO v_negotiation_id;

        -- Create notification for seller
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
            PERFORM insert_notification(
                v_property_owner_id,
                'negotiation_started',
                'Nueva negociación iniciada',
                'Has recibido una nueva oferta',
                NEW.id,
                'offer',
                NULL,
                jsonb_build_object('negotiation_id', v_negotiation_id)
            );
        END IF;
    ELSE
        -- Update existing negotiation
        UPDATE negotiations
        SET 
            last_offer_id = NEW.id,
            current_price = NEW.offer_price,
            offer_count = offer_count + 1,
            counter_offer_count = CASE WHEN NEW.status = 'countered' THEN counter_offer_count + 1 ELSE counter_offer_count END,
            updated_at = NOW()
        WHERE id = v_negotiation_id;
    END IF;

    -- Link offer to negotiation
    NEW.negotiation_id := v_negotiation_id;
    NEW.seller_id := v_property_owner_id;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in update_negotiation_on_offer trigger: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger function owner has permissions
ALTER FUNCTION update_negotiation_on_offer OWNER TO postgres;
GRANT EXECUTE ON FUNCTION update_negotiation_on_offer TO authenticated, anon, service_role, postgres;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_negotiation_on_offer ON offers;
CREATE TRIGGER trigger_update_negotiation_on_offer
    BEFORE INSERT OR UPDATE ON offers
    FOR EACH ROW
    EXECUTE FUNCTION update_negotiation_on_offer();

-- ============================================
-- HELPER FUNCTION FOR CURRENCY FORMATTING
-- ============================================
CREATE OR REPLACE FUNCTION format_currency(amount BIGINT)
RETURNS TEXT AS $$
BEGIN
    RETURN '$' || TO_CHAR(amount, 'FM999,999,999,999');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ENABLE RLS FOR NEGOTIATIONS TABLES
-- ============================================
ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR NEGOTIATIONS
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their negotiations" ON negotiations;
DROP POLICY IF EXISTS "Users can create negotiations" ON negotiations;
DROP POLICY IF EXISTS "Users can update their negotiations" ON negotiations;
DROP POLICY IF EXISTS "participants can select negotiations" ON negotiations;
DROP POLICY IF EXISTS "participants can insert negotiations" ON negotiations;
DROP POLICY IF EXISTS "participants can update negotiations" ON negotiations;

-- Participants can view negotiations (using participants array or explicit fields)
CREATE POLICY "Users can view their negotiations" ON negotiations
    FOR SELECT
    USING (
        auth.uid() = ANY(participants) OR
        auth.uid()::text = buyer_id::text OR 
        auth.uid()::text = seller_id::text OR 
        auth.uid()::text = lawyer_id::text OR
        auth.uid()::text = agent_id::text OR
        auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin'
    );

-- Users can create negotiations
CREATE POLICY "Users can create negotiations" ON negotiations
    FOR INSERT
    WITH CHECK (
        auth.uid() = ANY(participants) OR
        auth.uid()::text = buyer_id::text
    );

-- Users can update their negotiations
CREATE POLICY "Users can update their negotiations" ON negotiations
    FOR UPDATE
    USING (
        auth.uid() = ANY(participants) OR
        auth.uid()::text = buyer_id::text OR 
        auth.uid()::text = seller_id::text OR 
        auth.uid()::text = lawyer_id::text OR
        auth.uid()::text = agent_id::text OR
        auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin'
    );

-- ============================================
-- RLS POLICIES FOR NEGOTIATION OFFERS
-- ============================================
DROP POLICY IF EXISTS "participants read offers" ON negotiation_offers;
DROP POLICY IF EXISTS "participants insert offers" ON negotiation_offers;

CREATE POLICY "Participants can view offers" ON negotiation_offers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM negotiations n
            WHERE n.id = negotiation_offers.negotiation_id
            AND (auth.uid() = ANY(n.participants) OR auth.uid()::text = author::text OR auth.uid()::text = n.buyer_id::text OR auth.uid()::text = n.seller_id::text)
        )
    );

CREATE POLICY "Participants can create offers" ON negotiation_offers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM negotiations n
            WHERE n.id = negotiation_offers.negotiation_id
            AND (auth.uid() = ANY(n.participants) OR auth.uid()::text = author::text)
        )
    );

-- ============================================
-- RLS POLICIES FOR NEGOTIATION DOCUMENTS
-- ============================================
DROP POLICY IF EXISTS "participants read documents" ON negotiation_documents;
DROP POLICY IF EXISTS "participants upsert documents" ON negotiation_documents;

CREATE POLICY "Participants can view documents" ON negotiation_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM negotiations n
            WHERE n.id = negotiation_documents.negotiation_id
            AND (auth.uid() = ANY(n.participants) OR auth.uid()::text = n.buyer_id::text OR auth.uid()::text = n.seller_id::text OR auth.uid()::text = n.lawyer_id::text)
        )
    );

CREATE POLICY "Participants can manage documents" ON negotiation_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM negotiations n
            WHERE n.id = negotiation_documents.negotiation_id
            AND (auth.uid() = ANY(n.participants) OR auth.uid()::text = updated_by::text OR auth.uid()::text = n.lawyer_id::text OR auth.uid()::text = n.buyer_id::text OR auth.uid()::text = n.seller_id::text)
        )
    );

-- ============================================
-- TRIGGER FOR UPDATED_AT ON NEGOTIATIONS
-- ============================================
DROP TRIGGER IF EXISTS update_negotiations_updated_at ON negotiations;
CREATE TRIGGER update_negotiations_updated_at
    BEFORE UPDATE ON negotiations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for negotiation_offers updated_at
DROP TRIGGER IF EXISTS update_negotiation_offers_updated_at ON negotiation_offers;
CREATE TRIGGER update_negotiation_offers_updated_at
    BEFORE UPDATE ON negotiation_offers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for negotiation_documents updated_at (already exists, but ensure it's correct)
DROP TRIGGER IF EXISTS trg_negotiation_documents_updated_at ON negotiation_documents;
CREATE TRIGGER trg_negotiation_documents_updated_at
    BEFORE UPDATE ON negotiation_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

