-- Property approval policy update
-- Only admin and super_admin can approve properties (not lawyers)
-- This creates consistency between frontend permissions and database RLS

-- Drop the old policy that included lawyers
DROP POLICY IF EXISTS "Lawyers and admins can review properties" ON public.properties;

-- Create new policy for admin and super_admin only (for approval workflow)
CREATE POLICY "Admins can review and approve properties"
ON public.properties FOR UPDATE TO authenticated
USING ((auth.jwt() ->> 'role') IN ('admin','super_admin'))
WITH CHECK ((auth.jwt() ->> 'role') IN ('admin','super_admin'));

-- Lawyers can still view and analyze documents but not approve properties
-- This maintains their ability to perform legal analysis without approval power
CREATE POLICY "Lawyers can view property documents"
ON public.properties FOR SELECT TO authenticated
USING ((auth.jwt() ->> 'role') IN ('lawyer','admin','super_admin'));

-- Add audit trail columns if they don't exist
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create function to track property status changes
CREATE OR REPLACE FUNCTION track_property_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- When status changes to 'approved', record approval timestamp and user
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    NEW.approved_at := NOW();
    NEW.approved_by := auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for status change tracking
DROP TRIGGER IF EXISTS property_status_change_trigger ON public.properties;
CREATE TRIGGER property_status_change_trigger
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION track_property_status_change();

-- Create indexes for approval queries
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_approved_at ON public.properties(approved_at) WHERE approved_at IS NOT NULL;

-- Add comment explaining the policy
COMMENT ON POLICY "Admins can review and approve properties" ON public.properties IS 
  'Only admins and super_admins can approve properties for publication. Lawyers can view and analyze documents but cannot approve.';

COMMENT ON POLICY "Lawyers can view property documents" ON public.properties IS 
  'Lawyers can view property details and legal documents for analysis purposes but cannot approve properties for publication.';

