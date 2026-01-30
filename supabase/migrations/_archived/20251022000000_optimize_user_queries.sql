-- Optimize user profile queries for better performance
-- Create indexes for frequently queried columns

-- Properties table indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner_id_status ON properties(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_properties_status_created_at ON properties(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON properties(agent_id);

-- Offers table indexes
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id_created_at ON offers(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offers_property_id_status ON offers(property_id, status);

-- Visits table indexes
CREATE INDEX IF NOT EXISTS idx_visits_visitor_id_scheduled_date ON visits(visitor_id, scheduled_date DESC);
CREATE INDEX IF NOT EXISTS idx_visits_property_id_scheduled_date ON visits(property_id, scheduled_date DESC);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, read);

-- Contracts table indexes
CREATE INDEX IF NOT EXISTS idx_contracts_buyer_id_created_at ON contracts(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contracts_seller_id_created_at ON contracts(seller_id, created_at DESC);

-- Reports table indexes
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id_created_at ON reports(reporter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id_created_at ON reports(reported_user_id, created_at DESC);

-- Verification requests table indexes (moved to 20251021250000_create_verification_requests_table.sql)
-- CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id_status ON verification_requests(user_id, status);

-- RPC function to get user profile with counts in a single query
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
    contracts_count INTEGER;
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
    WHERE user_id = target_user_id;

    SELECT COUNT(*) INTO contracts_count
    FROM contracts
    WHERE buyer_id = target_user_id OR seller_id = target_user_id;

    -- Build result JSON
    result := json_build_object(
        'profile', profile_data,
        'userPropertiesCount', user_properties_count,
        'totalPublishedProperties', total_published_properties,
        'visitsCount', visits_count,
        'offersCount', offers_count,
        'notificationsCount', notifications_count,
        'contractsCount', contracts_count,
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
        ),
        'recentNotifications', (
            SELECT json_agg(
                json_build_object(
                    'id', n.id,
                    'type', n.type,
                    'title', n.title,
                    'message', n.message,
                    'read', n.read,
                    'created_at', n.created_at
                )
            )
            FROM (
                SELECT * FROM notifications
                WHERE user_id = target_user_id
                ORDER BY created_at DESC
                LIMIT 10
            ) n
        )
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_profile_with_counts(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_user_profile_with_counts(UUID) IS 'Optimized function to get user profile data with counts in a single query';
