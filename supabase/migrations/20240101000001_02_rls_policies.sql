-- ============================================
-- 02 RLS POLICIES - Consolidated Migration
-- ============================================
-- This migration consolidates all RLS policies for all tables
-- Sources consolidated:
--   - 20251020090000_create_profiles_table.sql (RLS policies)
--   - 20251021120000_update_rls_policies.sql
--   - 20251021230000_fix_profiles_rls_policies.sql
--   - 20251031_fix_profiles_rls_final.sql
--   - 20251021002315_fix_properties_public_access.sql
--   - 20251028010000_visit_rls_verified_only.sql
--   - 20250128000001_fix_notifications_rls.sql
--   - 20250128000004_ensure_rls_bypass.sql

-- ============================================
-- PROFILES RLS POLICIES
-- ============================================
-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable all access for service role" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Service role has full access (for seeding and admin operations)
CREATE POLICY "Enable all access for service role" ON profiles
  FOR ALL USING (true);

-- Admin policies using JWT claims (avoids recursion)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Admins can insert all profiles" ON profiles
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- ============================================
-- PROPERTIES RLS POLICIES
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view properties" ON properties;
DROP POLICY IF EXISTS "Allow public access to published properties" ON properties;
DROP POLICY IF EXISTS "Allow authenticated users to manage properties" ON properties;
DROP POLICY IF EXISTS "Owners can manage their properties" ON properties;
DROP POLICY IF EXISTS "Anyone can view published properties" ON properties;

-- Public can view published properties
CREATE POLICY "Anyone can view published properties" ON properties
  FOR SELECT USING (status = 'published');

-- Owners can manage their own properties
CREATE POLICY "Owners can manage their properties" ON properties
  FOR ALL USING (auth.uid()::text = owner_id::text);

-- Authenticated users can manage properties (for agents, etc.)
CREATE POLICY "Allow authenticated users to manage properties" ON properties
  FOR ALL TO authenticated USING (true);

-- ============================================
-- VISITS RLS POLICIES
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own visits" ON visits;
DROP POLICY IF EXISTS "Users can create visits" ON visits;
DROP POLICY IF EXISTS "Visit select for participants" ON visits;
DROP POLICY IF EXISTS "Insert only by verified users for published properties" ON visits;

-- Users can view their own visits
CREATE POLICY "Users can view their own visits" ON visits
  FOR SELECT USING (
    auth.uid()::text = visitor_id::text OR 
    auth.uid()::text = (SELECT owner_id FROM properties WHERE id = property_id)::text
  );

-- Users can create visits
CREATE POLICY "Users can create visits" ON visits
  FOR INSERT WITH CHECK (auth.uid()::text = visitor_id::text);

-- Users can update their own visits
CREATE POLICY "Users can update their own visits" ON visits
  FOR UPDATE USING (auth.uid()::text = visitor_id::text);

-- Property owners can view visits to their properties
CREATE POLICY "Owners can view visits to their properties" ON visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = visits.property_id
      AND p.owner_id = auth.uid()
    )
  );

-- ============================================
-- OFFERS RLS POLICIES
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own offers" ON offers;
DROP POLICY IF EXISTS "Users can create offers" ON offers;
DROP POLICY IF EXISTS "Participants can view their offers" ON offers;

-- Participants can view their offers (buyer or property owner)
CREATE POLICY "Participants can view their offers" ON offers
  FOR SELECT USING (
    auth.uid()::text = buyer_id::text OR 
    auth.uid()::text = (SELECT owner_id FROM properties WHERE id = property_id)::text
  );

-- Users can create offers
CREATE POLICY "Users can create offers" ON offers
  FOR INSERT WITH CHECK (auth.uid()::text = buyer_id::text);

-- Users can update their own offers
CREATE POLICY "Users can update their own offers" ON offers
  FOR UPDATE USING (auth.uid()::text = buyer_id::text);

-- Property owners can update offers for their properties
CREATE POLICY "Owners can update offers for their properties" ON offers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = offers.property_id
      AND p.owner_id = auth.uid()
    )
  );

-- ============================================
-- CASES RLS POLICIES
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Lawyers can view their assigned cases" ON cases;
DROP POLICY IF EXISTS "Lawyers can manage their cases" ON cases;

-- Case participants can view their cases
CREATE POLICY "Case participants can view their cases" ON cases
  FOR SELECT USING (
    auth.uid()::text = lawyer_id::text OR 
    auth.uid()::text = buyer_id::text OR 
    auth.uid()::text = seller_id::text OR
    auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin'
  );

-- Lawyers can manage their cases
CREATE POLICY "Lawyers can manage their cases" ON cases
  FOR ALL USING (
    auth.uid()::text = lawyer_id::text OR
    auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin'
  );

-- ============================================
-- CASE DOCUMENTS RLS POLICIES
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Case participants can view case documents" ON case_documents;
DROP POLICY IF EXISTS "Lawyers can manage case documents" ON case_documents;

-- Case participants can view case documents
CREATE POLICY "Case participants can view case documents" ON case_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c 
      WHERE c.id = case_documents.case_id 
      AND (c.lawyer_id = auth.uid() OR c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    ) OR
    auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin'
  );

-- Lawyers can manage case documents
CREATE POLICY "Lawyers can manage case documents" ON case_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cases c 
      WHERE c.id = case_documents.case_id 
      AND c.lawyer_id = auth.uid()
    ) OR
    auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin'
  );

-- ============================================
-- CHAT MESSAGES RLS POLICIES
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Case participants can view chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Case participants can send messages" ON chat_messages;

-- Case participants can view chat messages
CREATE POLICY "Case participants can view chat messages" ON chat_messages
  FOR SELECT USING (
    auth.uid()::text = sender_id::text OR 
    auth.uid()::text = receiver_id::text OR
    EXISTS (
      SELECT 1 FROM cases c 
      WHERE c.id = chat_messages.case_id 
      AND (c.lawyer_id = auth.uid() OR c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    ) OR
    auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin'
  );

-- Case participants can send messages
CREATE POLICY "Case participants can send messages" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid()::text = sender_id::text AND (
      auth.uid()::text = receiver_id::text OR
      EXISTS (
        SELECT 1 FROM cases c 
        WHERE c.id = chat_messages.case_id 
        AND (c.lawyer_id = auth.uid() OR c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
      )
    )
  );

-- ============================================
-- BLOG POSTS RLS POLICIES
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can manage their blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Superadmin can manage all blog posts" ON blog_posts;

-- Anyone can view published blog posts
CREATE POLICY "Anyone can view published blog posts" ON blog_posts
  FOR SELECT USING (published = true OR status = 'published');

-- Authors can manage their blog posts
CREATE POLICY "Authors can manage their blog posts" ON blog_posts
  FOR ALL USING (auth.uid()::text = author_id::text);

-- Superadmin can manage all blog posts
CREATE POLICY "Superadmin can manage all blog posts" ON blog_posts
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin'
  );

-- ============================================
-- FAVORITES RLS POLICIES
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can manage their own favorites" ON favorites;

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can manage their own favorites
CREATE POLICY "Users can manage their own favorites" ON favorites
  FOR ALL USING (auth.uid()::text = user_id::text);

-- ============================================
-- NOTIFICATIONS RLS POLICIES
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow notification inserts" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Allow all inserts (for SECURITY DEFINER functions and triggers)
-- Authorization is handled by the functions/triggers that call this
CREATE POLICY "Allow notification inserts" ON notifications
  FOR INSERT 
  WITH CHECK (true);

-- Grant necessary permissions for notification functions
GRANT ALL ON notifications TO postgres;
GRANT ALL ON notifications TO service_role;

-- ============================================
-- NEGOTIATIONS RLS POLICIES
-- ============================================
-- Note: Negotiations table policies are defined in 04_negotiations_system.sql
-- Skipping here to avoid conflicts with different schema versions

