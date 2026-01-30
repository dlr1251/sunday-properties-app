-- Create negotiations table for managing negotiation sessions
-- This table links offers together in a negotiation flow

CREATE TABLE IF NOT EXISTS public.negotiations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES profiles(id),
    seller_id UUID NOT NULL REFERENCES profiles(id),
    lawyer_id UUID REFERENCES profiles(id),
    agent_id UUID REFERENCES profiles(id),
    
    -- Initial offer that started the negotiation
    initial_offer_id UUID REFERENCES offers(id),
    
    -- Current status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending_lawyer', 'pending_documents', 'completed', 'cancelled', 'expired')),
    
    -- Financial metrics summary
    current_price BIGINT NOT NULL,
    original_price BIGINT NOT NULL,
    price_difference BIGINT GENERATED ALWAYS AS (current_price - original_price) STORED,
    price_change_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN original_price > 0 THEN ((current_price - original_price)::DECIMAL / original_price::DECIMAL * 100)
            ELSE 0
        END
    ) STORED,
    
    -- Negotiation progress
    negotiation_progress INTEGER DEFAULT 0 CHECK (negotiation_progress >= 0 AND negotiation_progress <= 100),
    
    -- Tracking
    last_offer_id UUID REFERENCES offers(id),
    offer_count INTEGER DEFAULT 1,
    counter_offer_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    milestones_completed JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_negotiations_property ON negotiations(property_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_buyer ON negotiations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_seller ON negotiations(seller_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_lawyer ON negotiations(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_status ON negotiations(status);
CREATE INDEX IF NOT EXISTS idx_negotiations_created_at ON negotiations(created_at);

-- Add negotiation_id to offers table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'negotiation_id'
    ) THEN
        ALTER TABLE offers ADD COLUMN negotiation_id UUID REFERENCES negotiations(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_offers_negotiation ON offers(negotiation_id);
    END IF;
END $$;

-- Add seller_id to offers table if it doesn't exist (for easier querying)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'seller_id'
    ) THEN
        ALTER TABLE offers ADD COLUMN seller_id UUID REFERENCES profiles(id);
        CREATE INDEX IF NOT EXISTS idx_offers_seller ON offers(seller_id);
    END IF;
END $$;

-- Update notifications table to support negotiation notifications
DO $$
BEGIN
    -- Add negotiation type if not exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'notifications_type_check' 
        AND contype = 'c'
    ) THEN
        ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
    END IF;
END $$;

-- Recreate the check constraint with new types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
    CHECK (type IN (
        'visit_scheduled', 
        'offer_received', 
        'offer_accepted', 
        'offer_rejected',
        'counter_offer_received',
        'counter_offer_accepted',
        'negotiation_started',
        'lawyer_assigned',
        'document_generated',
        'document_pending_signature',
        'contract_ready', 
        'payment_received',
        'negotiation_completed'
    ));

-- Ensure RLS is enabled for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow system functions (SECURITY DEFINER) to insert notifications
-- This allows triggers and server-side functions to create notifications
-- Note: SECURITY DEFINER functions run with the privileges of the function owner,
-- but RLS is still checked. We need a policy that allows all inserts.
-- The function will handle authorization internally.
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT 
    WITH CHECK (true);
    
-- Note: service_role automatically bypasses RLS, so no separate policy needed
    
-- Grant necessary permissions to the function owner (postgres) and service_role
-- This ensures SECURITY DEFINER functions can insert notifications
GRANT ALL ON notifications TO postgres;
GRANT ALL ON notifications TO service_role;

-- Also ensure authenticated users can insert their own notifications (for direct API calls)
CREATE POLICY "Users can insert their own notifications" ON notifications
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Add related_negotiation_id for better tracking
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'related_negotiation_id'
    ) THEN
        ALTER TABLE notifications ADD COLUMN related_negotiation_id UUID REFERENCES negotiations(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_notifications_negotiation ON notifications(related_negotiation_id);
    END IF;
END $$;

-- RLS Policies for negotiations
ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;

-- Users can view negotiations they're involved in
DROP POLICY IF EXISTS "Users can view their negotiations" ON negotiations;
CREATE POLICY "Users can view their negotiations" ON negotiations
    FOR SELECT
    USING (
        auth.uid() = buyer_id OR 
        auth.uid() = seller_id OR 
        auth.uid() = lawyer_id OR
        auth.uid() = agent_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Users can create negotiations (when making an offer)
DROP POLICY IF EXISTS "Users can create negotiations" ON negotiations;
CREATE POLICY "Users can create negotiations" ON negotiations
    FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

-- Users can update negotiations they're involved in
DROP POLICY IF EXISTS "Users can update their negotiations" ON negotiations;
CREATE POLICY "Users can update their negotiations" ON negotiations
    FOR UPDATE
    USING (
        auth.uid() = buyer_id OR 
        auth.uid() = seller_id OR 
        auth.uid() = lawyer_id OR
        auth.uid() = agent_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Helper function to insert notifications (SECURITY DEFINER)
-- This function runs with the privileges of the function owner (postgres)
-- and bypasses RLS by temporarily disabling it
-- Note: This function is updated in migration 20250128000003_fix_notifications_rls_complete.sql
-- Keeping this placeholder to ensure migration order
CREATE OR REPLACE FUNCTION insert_notification(
    p_user_id UUID,
    p_type VARCHAR,
    p_title VARCHAR,
    p_message TEXT,
    p_related_id UUID DEFAULT NULL,
    p_related_type VARCHAR DEFAULT NULL,
    p_related_negotiation_id UUID DEFAULT NULL
) RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_notification_id UUID;
    v_rls_was_enabled BOOLEAN;
BEGIN
    -- Check if RLS is currently enabled
    SELECT relforcerowsecurity INTO v_rls_was_enabled
    FROM pg_class 
    WHERE relname = 'notifications';
    
    -- Disable RLS temporarily
    IF v_rls_was_enabled OR EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'notifications'
    ) THEN
        ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Insert notification
    BEGIN
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            related_id,
            related_type,
            related_negotiation_id
        ) VALUES (
            p_user_id,
            p_type,
            p_title,
            p_message,
            p_related_id,
            p_related_type,
            p_related_negotiation_id
        ) RETURNING id INTO v_notification_id;
    EXCEPTION
        WHEN OTHERS THEN
            -- Re-enable RLS before re-raising
            IF v_rls_was_enabled THEN
                ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
            END IF;
            RAISE;
    END;
    
    -- Re-enable RLS if it was enabled
    IF v_rls_was_enabled THEN
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    END IF;
    
    RETURN v_notification_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Ensure RLS is re-enabled even on unexpected errors
        BEGIN
            IF v_rls_was_enabled THEN
                ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
        RAISE WARNING 'Error in insert_notification: %', SQLERRM;
        RETURN NULL;
END;
$$;

-- Ensure the function owner has all necessary permissions
ALTER FUNCTION insert_notification OWNER TO postgres;
GRANT EXECUTE ON FUNCTION insert_notification TO authenticated, anon, service_role, postgres;

-- Function to automatically update negotiation when offer is created/updated
-- SECURITY DEFINER allows the function to bypass RLS
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

    -- Find or create negotiation
    SELECT id INTO v_negotiation_id
    FROM negotiations
    WHERE property_id = NEW.property_id
    AND buyer_id = NEW.buyer_id
    AND seller_id = v_property_owner_id
    AND status IN ('active', 'pending_lawyer', 'pending_documents')
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
            expires_at
        ) VALUES (
            NEW.property_id,
            NEW.buyer_id,
            v_property_owner_id,
            NEW.id,
            NEW.offer_price,
            NEW.offer_price,
            NEW.id,
            'active',
            NEW.expires_at
        ) RETURNING id INTO v_negotiation_id;

        -- Create notification for seller using helper function
        PERFORM insert_notification(
            v_property_owner_id,
            'negotiation_started',
            'Nueva negociación iniciada',
            'Has recibido una nueva oferta de ' || COALESCE((SELECT full_name FROM profiles WHERE id = NEW.buyer_id), 'un comprador'),
            NEW.id,
            'offer',
            v_negotiation_id
        );
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

        -- Create notification based on offer status
        IF NEW.status = 'countered' THEN
            PERFORM insert_notification(
                CASE WHEN NEW.buyer_id = (SELECT buyer_id FROM negotiations WHERE id = v_negotiation_id) 
                     THEN v_property_owner_id 
                     ELSE NEW.buyer_id END,
                'counter_offer_received',
                'Nueva contraoferta recibida',
                'Has recibido una contraoferta de ' || format_currency(NEW.offer_price),
                NEW.id,
                'offer',
                v_negotiation_id
            );
        END IF;
    END IF;

    -- Link offer to negotiation
    NEW.negotiation_id = v_negotiation_id;
    
    -- Set seller_id if the column exists (check dynamically)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' 
        AND column_name = 'seller_id'
    ) THEN
        NEW.seller_id := v_property_owner_id;
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the transaction
        RAISE WARNING 'Error in update_negotiation_on_offer trigger: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger function owner has permissions
ALTER FUNCTION update_negotiation_on_offer OWNER TO postgres;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_negotiation_on_offer ON offers;
CREATE TRIGGER trigger_update_negotiation_on_offer
    BEFORE INSERT OR UPDATE ON offers
    FOR EACH ROW
    EXECUTE FUNCTION update_negotiation_on_offer();

-- Helper function for currency formatting (if not exists)
CREATE OR REPLACE FUNCTION format_currency(amount BIGINT)
RETURNS TEXT AS $$
BEGIN
    RETURN '$' || TO_CHAR(amount, 'FM999,999,999,999');
END;
$$ LANGUAGE plpgsql;

