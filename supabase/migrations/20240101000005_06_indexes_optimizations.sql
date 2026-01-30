-- ============================================
-- 06 INDEXES AND OPTIMIZATIONS - Consolidated Migration
-- ============================================
-- This migration consolidates all indexes, constraints fixes, and optimizations
-- Sources consolidated:
--   - 20251022000000_optimize_user_queries.sql
--   - 20251021220000_consolidated_fixes.sql
--   - 20251025220000_property_storage_buckets.sql
--   - 20250126000000_create_properties_bucket.sql

-- ============================================
-- CONSTRAINT FIXES
-- ============================================

-- Fix strata constraint to allow strata = 0 for houses
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_strata_check;
ALTER TABLE properties ADD CONSTRAINT properties_strata_check 
CHECK (
    (property_type = 'house' AND (strata IS NULL OR strata = 0)) OR 
    (property_type IN ('apartment', 'townhouse', 'office', 'commercial') AND strata >= 1 AND strata <= 6)
);

-- Update payment_method constraint to include all payment methods
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_payment_method_check;
ALTER TABLE offers ADD CONSTRAINT offers_payment_method_check 
CHECK (payment_method IN ('cash', 'financing', 'crypto', 'mixed', 'bank_transfer', 'installments'));

-- Add missing columns to notifications table if they don't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data JSONB;
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        -- Update notifications type constraint to include all types
        ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
        ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
        CHECK (type IN (
            'visit_scheduled', 
            'offer_received', 
            'offer_accepted', 
            'offer_rejected',
            'counter_offer', 
            'counter_offer_received',
            'counter_offer_accepted',
            'negotiation_started',
            'negotiation_update',
            'lawyer_assigned',
            'document_generated',
            'document_pending_signature',
            'contract_ready', 
            'payment_received',
            'negotiation_completed',
            'system',
            'case_assigned'
        ));
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON CONSTRAINT properties_strata_check ON properties IS 
'Strata constraint: houses must have strata = 0 or NULL, other property types must have strata between 1 and 6';

COMMENT ON CONSTRAINT offers_payment_method_check ON offers IS 
'Payment method constraint: allows cash, financing, crypto, mixed, bank_transfer, and installments';

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Properties composite indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner_id_status ON properties(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_properties_status_created_at ON properties(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_price_range ON properties(price) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_properties_city_status ON properties(city, status);

-- Offers composite indexes
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id_created_at ON offers(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offers_property_id_status ON offers(property_id, status);
CREATE INDEX IF NOT EXISTS idx_offers_seller_id ON offers(seller_id) WHERE seller_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_offers_expires_at_status ON offers(expires_at, status);

-- Visits composite indexes
CREATE INDEX IF NOT EXISTS idx_visits_visitor_id_scheduled_date ON visits(visitor_id, scheduled_date DESC);
CREATE INDEX IF NOT EXISTS idx_visits_property_id_scheduled_date ON visits(property_id, scheduled_date DESC);
CREATE INDEX IF NOT EXISTS idx_visits_status_date ON visits(status, scheduled_date);

-- Notifications composite indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_type_created_at ON notifications(type, created_at DESC);

-- Cases indexes
CREATE INDEX IF NOT EXISTS idx_cases_lawyer_status ON cases(lawyer_id, status);
CREATE INDEX IF NOT EXISTS idx_cases_buyer_seller ON cases(buyer_id, seller_id);

-- Negotiations indexes
CREATE INDEX IF NOT EXISTS idx_negotiations_buyer_seller ON negotiations(buyer_id, seller_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_status_created_at ON negotiations(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_negotiations_property_status ON negotiations(property_id, status);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id_created_at ON reports(reporter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id_created_at ON reports(reported_user_id, created_at DESC) WHERE reported_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reports_status_priority ON reports(status, priority);

-- Verification requests indexes
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id_status ON verification_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status_created_at ON verification_requests(status, created_at DESC);

-- Platform settings indexes
CREATE INDEX IF NOT EXISTS idx_platform_settings_category_key ON platform_settings(category, setting_key);

-- ============================================
-- OPTIMIZED FUNCTIONS
-- ============================================

-- Function to get user profile with counts in a single query
CREATE OR REPLACE FUNCTION get_user_profile_with_counts(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    profile_data JSON;
    user_properties_count INTEGER;
    total_published_properties INTEGER;
    visits_count INTEGER;
    offers_count INTEGER;
    notifications_count INTEGER;
BEGIN
    -- Get profile data
    SELECT json_build_object(
        'id', p.id,
        'email', p.email,
        'full_name', p.full_name,
        'phone', p.phone,
        'role', p.role,
        'status', p.status,
        'verification_status', p.verification_status,
        'created_at', p.created_at,
        'updated_at', p.updated_at
    ) INTO profile_data
    FROM profiles p
    WHERE p.id = target_user_id;

    IF profile_data IS NULL THEN
        RETURN NULL;
    END IF;

    -- Get counts in parallel
    SELECT COUNT(*) INTO user_properties_count
    FROM properties
    WHERE owner_id = target_user_id;

    SELECT COUNT(*) INTO total_published_properties
    FROM properties
    WHERE status = 'published';

    SELECT COUNT(*) INTO visits_count
    FROM visits
    WHERE visitor_id = target_user_id;

    SELECT COUNT(*) INTO offers_count
    FROM offers
    WHERE buyer_id = target_user_id;

    SELECT COUNT(*) INTO notifications_count
    FROM notifications
    WHERE user_id = target_user_id AND read = FALSE;

    -- Build result JSON
    result := json_build_object(
        'profile', profile_data,
        'userPropertiesCount', user_properties_count,
        'totalPublishedProperties', total_published_properties,
        'visitsCount', visits_count,
        'offersCount', offers_count,
        'unreadNotificationsCount', notifications_count,
        'userProperties', (
            SELECT json_agg(
                json_build_object(
                    'id', p.id,
                    'title', p.title,
                    'price', p.price,
                    'status', p.status,
                    'created_at', p.created_at
                )
            )
            FROM (
                SELECT * FROM properties
                WHERE owner_id = target_user_id
                ORDER BY created_at DESC
                LIMIT 10
            ) p
        ),
        'recentVisits', (
            SELECT json_agg(
                json_build_object(
                    'id', v.id,
                    'property_id', v.property_id,
                    'scheduled_date', v.scheduled_date,
                    'status', v.status
                )
            )
            FROM (
                SELECT * FROM visits
                WHERE visitor_id = target_user_id
                ORDER BY scheduled_date DESC
                LIMIT 5
            ) v
        ),
        'recentOffers', (
            SELECT json_agg(
                json_build_object(
                    'id', o.id,
                    'property_id', o.property_id,
                    'offer_price', o.offer_price,
                    'status', o.status,
                    'created_at', o.created_at
                )
            )
            FROM (
                SELECT * FROM offers
                WHERE buyer_id = target_user_id
                ORDER BY created_at DESC
                LIMIT 5
            ) o
        )
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_profile_with_counts(UUID) TO authenticated, anon, service_role;

-- Add comment
COMMENT ON FUNCTION get_user_profile_with_counts(UUID) IS 'Optimized function to get user profile data with counts in a single query';

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage buckets for property media and documents
-- Note: Storage buckets are created via Supabase Dashboard or API, but we include policies here

-- Properties bucket (for property images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'properties',
    'properties',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Property photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-photos', 'property-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Property videos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-videos', 'property-videos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Property docs bucket (private for legal documents)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-docs', 'property-docs', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Profile docs bucket for verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-docs', 'profile-docs', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- ============================================
-- STORAGE RLS POLICIES
-- ============================================

-- Properties bucket policies
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete property images" ON storage.objects;

CREATE POLICY "Authenticated users can upload property images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'properties');

CREATE POLICY "Public can view property images" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'properties');

CREATE POLICY "Authenticated users can update property images" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'properties');

CREATE POLICY "Authenticated users can delete property images" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'properties');

-- Property photos bucket policies
DROP POLICY IF EXISTS "Authenticated users can upload property photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view property photos" ON storage.objects;
DROP POLICY IF EXISTS "Property owners can delete their photos" ON storage.objects;

CREATE POLICY "Authenticated users can upload property photos" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'property-photos');

CREATE POLICY "Public can view property photos" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'property-photos');

CREATE POLICY "Property owners can delete their photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'property-photos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Property videos bucket policies
DROP POLICY IF EXISTS "Authenticated users can upload property videos" ON storage.objects;
DROP POLICY IF EXISTS "Property owners and admins can view videos" ON storage.objects;
DROP POLICY IF EXISTS "Property owners can delete their videos" ON storage.objects;

CREATE POLICY "Authenticated users can upload property videos" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'property-videos');

CREATE POLICY "Property owners and admins can view videos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'property-videos'
        AND (
            auth.uid()::text = (storage.foldername(name))[1]
            OR EXISTS (
                SELECT 1 FROM profiles
                WHERE id = auth.uid()
                AND role IN ('admin', 'super_admin')
            )
        )
    );

CREATE POLICY "Property owners can delete their videos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'property-videos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Property docs bucket policies
DROP POLICY IF EXISTS "Property owners can upload legal documents" ON storage.objects;
DROP POLICY IF EXISTS "Authorized users can view legal documents" ON storage.objects;
DROP POLICY IF EXISTS "Property owners can delete their documents" ON storage.objects;

CREATE POLICY "Property owners can upload legal documents" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'property-docs');

CREATE POLICY "Authorized users can view legal documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'property-docs'
        AND (
            auth.uid()::text = (storage.foldername(name))[1]
            OR EXISTS (
                SELECT 1 FROM profiles
                WHERE id = auth.uid()
                AND role IN ('admin', 'super_admin', 'lawyer')
            )
        )
    );

CREATE POLICY "Property owners can delete their documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'property-docs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Profile docs bucket policies
DROP POLICY IF EXISTS "Users can upload verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins and lawyers can review verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own verification documents" ON storage.objects;

CREATE POLICY "Users can upload verification documents" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'profile-docs');

CREATE POLICY "Users can view their own verification documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'profile-docs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Admins and lawyers can review verification documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'profile-docs'
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'lawyer')
        )
    );

CREATE POLICY "Users can delete their own verification documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'profile-docs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant necessary permissions for schema access
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- ============================================
-- ADDITIONAL COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON INDEX idx_properties_owner_id_status IS 'Composite index for querying properties by owner and status';
COMMENT ON INDEX idx_offers_buyer_id_created_at IS 'Composite index for querying offers by buyer ordered by creation date';
COMMENT ON INDEX idx_visits_visitor_id_scheduled_date IS 'Composite index for querying visits by visitor ordered by scheduled date';
COMMENT ON INDEX idx_notifications_user_id_read IS 'Composite index for querying unread notifications by user';

