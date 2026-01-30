-- Fix RLS policies for notifications to allow SECURITY DEFINER functions
-- This migration fixes the issue where triggers with SECURITY DEFINER functions
-- cannot insert notifications due to RLS policies

-- Drop all existing INSERT policies for notifications
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow notification inserts" ON notifications;

-- Create a single comprehensive INSERT policy that allows:
-- 1. Users to insert their own notifications
-- 2. System functions (SECURITY DEFINER) to insert any notification
-- The WITH CHECK (true) allows all inserts, authorization is handled by the function
CREATE POLICY "Allow notification inserts" ON notifications
    FOR INSERT 
    WITH CHECK (true);

-- Ensure the functions are owned by postgres with proper permissions
ALTER FUNCTION insert_notification OWNER TO postgres;
ALTER FUNCTION update_negotiation_on_offer OWNER TO postgres;

-- Grant all necessary permissions
GRANT ALL ON notifications TO postgres;
GRANT ALL ON notifications TO service_role;

-- Verify RLS is enabled (it should be, but just in case)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

