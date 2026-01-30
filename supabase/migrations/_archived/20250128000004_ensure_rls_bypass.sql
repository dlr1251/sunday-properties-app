-- Final comprehensive fix: Ensure RLS is properly bypassed
-- This migration ensures that all components work together correctly

-- Verify and fix function
DO $$
BEGIN
    -- Ensure function exists and is correct
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'insert_notification' 
        AND prosecdef = true
        AND proowner = (SELECT oid FROM pg_roles WHERE rolname = 'postgres')
    ) THEN
        RAISE EXCEPTION 'Function insert_notification is not properly configured';
    END IF;
    
    RAISE NOTICE 'Function insert_notification is properly configured';
END $$;

-- Ensure all policies are correct
DROP POLICY IF EXISTS "Allow notification inserts" ON notifications;
CREATE POLICY "Allow notification inserts" ON notifications
    FOR INSERT 
    WITH CHECK (true);

-- Ensure RLS is enabled (for user queries) but can be bypassed by functions
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Grant all necessary permissions
GRANT ALL ON notifications TO postgres;
GRANT ALL ON notifications TO service_role;

-- Ensure function has execute permissions
GRANT EXECUTE ON FUNCTION insert_notification TO authenticated;
GRANT EXECUTE ON FUNCTION insert_notification TO anon;
GRANT EXECUTE ON FUNCTION insert_notification TO service_role;
GRANT EXECUTE ON FUNCTION insert_notification TO postgres;

-- Verify trigger is properly configured
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_update_negotiation_on_offer'
        AND tgenabled = 'O'
    ) THEN
        RAISE EXCEPTION 'Trigger trigger_update_negotiation_on_offer is not properly configured';
    END IF;
    
    RAISE NOTICE 'Trigger trigger_update_negotiation_on_offer is properly configured';
END $$;

-- Final test with a real scenario simulation
DO $$
DECLARE
    test_user_id UUID;
    test_property_id UUID;
    test_offer_id UUID;
    test_negotiation_id UUID;
    notification_result UUID;
BEGIN
    -- Get a real user and property for testing
    SELECT id INTO test_user_id FROM profiles WHERE role = 'user' LIMIT 1;
    SELECT id INTO test_property_id FROM properties LIMIT 1;
    
    IF test_user_id IS NOT NULL AND test_property_id IS NOT NULL THEN
        -- Test inserting a notification (simulating what the trigger does)
        notification_result := insert_notification(
            test_user_id,
            'negotiation_started',
            'Test: Nueva negociación iniciada',
            'Test: Has recibido una nueva oferta',
            NULL,
            'offer',
            NULL
        );
        
        IF notification_result IS NOT NULL THEN
            RAISE NOTICE 'SUCCESS: Test notification created successfully with id %', notification_result;
            -- Clean up
            DELETE FROM notifications WHERE id = notification_result;
        ELSE
            RAISE WARNING 'FAILED: Test notification was not created - check function implementation';
        END IF;
    ELSE
        RAISE NOTICE 'SKIPPED: No test data available (need at least one user and one property)';
    END IF;
END $$;

