-- Consolidated Migration: All Fixes for Negotiation System
-- Execute this single migration before running the seed data

-- 1. Fix strata constraint to allow strata = 0 for houses
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_strata_check;
ALTER TABLE properties ADD CONSTRAINT properties_strata_check 
CHECK (
    (property_type = 'house' AND strata = 0) OR 
    (property_type IN ('apartment', 'townhouse', 'office', 'commercial') AND strata >= 1 AND strata <= 6)
);

-- 2. Update payment_method constraint to include new payment methods
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_payment_method_check;
ALTER TABLE offers ADD CONSTRAINT offers_payment_method_check 
CHECK (payment_method IN ('cash', 'financing', 'crypto', 'mixed', 'bank_transfer', 'installments'));

-- 3. Add missing columns to notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data JSONB;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Update notifications type constraint to include all types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
    'offer_received', 
    'offer_accepted', 
    'offer_rejected', 
    'counter_offer', 
    'negotiation_update', 
    'system',
    'visit_scheduled',
    'contract_ready',
    'payment_received'
));

-- 5. Add comments for documentation
COMMENT ON CONSTRAINT properties_strata_check ON properties IS 
'Strata constraint: houses must have strata = 0, other property types must have strata between 1 and 6';

COMMENT ON CONSTRAINT offers_payment_method_check ON offers IS 
'Payment method constraint: allows cash, financing, crypto, mixed, bank_transfer, and installments';

COMMENT ON COLUMN notifications.data IS 'Additional data for the notification in JSON format';

-- 6. Create indexes for performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_offers_property_id ON offers(property_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 8. Enable Row Level Security (RLS) for key tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE intent_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrative_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisory_sessions ENABLE ROW LEVEL SECURITY;

-- 9. Create basic RLS policies for notifications (drop existing first)
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 10. Create basic RLS policies for offers (drop existing first)
DROP POLICY IF EXISTS "Users can view offers for their properties" ON offers;
DROP POLICY IF EXISTS "Users can create offers" ON offers;
DROP POLICY IF EXISTS "Property owners can update their offers" ON offers;
DROP POLICY IF EXISTS "Users can delete their own offers" ON offers;

CREATE POLICY "Users can view offers for their properties" ON offers
    FOR SELECT USING (
        auth.uid() IN (
            SELECT owner_id FROM properties WHERE id = offers.property_id
        ) OR 
        auth.uid() = buyer_id
    );

CREATE POLICY "Users can create offers" ON offers
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Property owners can update their offers" ON offers
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT owner_id FROM properties WHERE id = offers.property_id
        )
    );

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Consolidated migration completed successfully!';
    RAISE NOTICE 'All constraints, columns, and policies have been applied.';
    RAISE NOTICE 'You can now run the seed data script.';
END $$;
