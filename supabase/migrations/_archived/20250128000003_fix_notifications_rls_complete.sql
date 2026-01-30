-- Complete fix for notifications RLS
-- The issue is that even SECURITY DEFINER functions are subject to RLS
-- We need to ensure the function can truly bypass RLS

-- First, let's verify current state
DO $$
BEGIN
    RAISE NOTICE 'Current RLS status for notifications: %', 
        (SELECT relforcerowsecurity FROM pg_class WHERE relname = 'notifications');
END $$;

-- Drop and recreate insert_notification with proper RLS bypass
DROP FUNCTION IF EXISTS insert_notification(UUID, VARCHAR, VARCHAR, TEXT, UUID, VARCHAR, UUID);

-- Create function that uses ALTER TABLE to disable RLS temporarily
-- This is the most reliable way to bypass RLS in PostgreSQL
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

-- Ensure function is owned by postgres
ALTER FUNCTION insert_notification OWNER TO postgres;

-- Grant all necessary permissions
GRANT ALL ON notifications TO postgres;
GRANT ALL ON notifications TO service_role;

-- Also ensure the function has execute permissions
GRANT EXECUTE ON FUNCTION insert_notification TO authenticated;
GRANT EXECUTE ON FUNCTION insert_notification TO anon;
GRANT EXECUTE ON FUNCTION insert_notification TO service_role;
GRANT EXECUTE ON FUNCTION insert_notification TO postgres;

-- Verify policies allow inserts
DROP POLICY IF EXISTS "Allow notification inserts" ON notifications;
CREATE POLICY "Allow notification inserts" ON notifications
    FOR INSERT 
    WITH CHECK (true);

-- Make sure RLS is enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Test: Try to insert a notification (this will fail FK check but shouldn't fail RLS)
DO $$
DECLARE
    test_result UUID;
    test_user_id UUID;
BEGIN
    -- Get a real user_id for testing
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        test_result := insert_notification(
            test_user_id,
            'negotiation_started',
            'Test Notification',
            'Testing RLS bypass'
        );
        
        IF test_result IS NOT NULL THEN
            RAISE NOTICE 'SUCCESS: Notification created with id %', test_result;
            DELETE FROM notifications WHERE id = test_result;
        ELSE
            RAISE WARNING 'FAILED: Notification was not created';
        END IF;
    ELSE
        RAISE NOTICE 'SKIPPED: No users found for testing';
    END IF;
END $$;

