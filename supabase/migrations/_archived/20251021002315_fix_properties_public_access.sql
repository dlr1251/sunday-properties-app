-- Allow public access to published properties
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow authenticated users to view properties" ON properties;

-- Create new policy allowing public access to published properties
CREATE POLICY "Allow public access to published properties" ON properties
FOR SELECT USING (status = 'published');

-- Keep authenticated users policy for other operations
CREATE POLICY "Allow authenticated users to manage properties" ON properties
FOR ALL TO authenticated USING (true);
