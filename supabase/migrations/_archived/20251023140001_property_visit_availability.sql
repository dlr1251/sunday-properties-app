-- Property visit availability management
-- Enables property owners to configure visit schedules

-- Create visit_availability table
CREATE TABLE IF NOT EXISTS public.property_visit_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  
  -- Availability configuration
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Advanced settings
  advance_booking_days INTEGER DEFAULT 1 CHECK (advance_booking_days >= 0), -- Days in advance required
  max_visits_per_day INTEGER DEFAULT 3 CHECK (max_visits_per_day > 0),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure no overlapping availability for same property/day
  UNIQUE(property_id, day_of_week)
);

-- Enable RLS
ALTER TABLE public.property_visit_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Property owners can manage their own property's availability
CREATE POLICY "Owners can manage their property availability"
ON public.property_visit_availability
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE id = property_id 
    AND owner_id = auth.uid()
  )
);

-- Admins and super_admins can manage any property's availability
CREATE POLICY "Admins can manage all property availability"
ON public.property_visit_availability
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role') IN ('admin','super_admin'))
WITH CHECK ((auth.jwt() ->> 'role') IN ('admin','super_admin'));

-- Public can read active availability
CREATE POLICY "Public can read active availability"
ON public.property_visit_availability
FOR SELECT
USING (is_active = true);

-- Add indexes
CREATE INDEX idx_property_visit_availability_property_id ON public.property_visit_availability(property_id);
CREATE INDEX idx_property_visit_availability_active ON public.property_visit_availability(is_active, day_of_week);

-- Create visit requests table
CREATE TABLE IF NOT EXISTS public.visit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Requested visit time
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending','confirmed','rejected','completed','cancelled')),
  
  -- Owner response
  owner_notes TEXT,
  responded_at TIMESTAMPTZ,
  
  -- Visit completion
  visit_notes TEXT,
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.visit_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visit requests
-- Requesters can view their own requests
CREATE POLICY "Requesters can view their own requests"
ON public.visit_requests
FOR SELECT
TO authenticated
USING (requester_id = auth.uid());

-- Property owners can view requests for their properties
CREATE POLICY "Property owners can view requests"
ON public.visit_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE id = property_id 
    AND owner_id = auth.uid()
  )
);

-- Requesters can create visit requests
CREATE POLICY "Authenticated users can create visit requests"
ON public.visit_requests
FOR INSERT
TO authenticated
WITH CHECK (requester_id = auth.uid());

-- Property owners can update requests for their properties (confirm/reject)
CREATE POLICY "Property owners can update their requests"
ON public.visit_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE id = property_id 
    AND owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE id = property_id 
    AND owner_id = auth.uid()
  )
);

-- Admins can manage all visit requests
CREATE POLICY "Admins can manage all visit requests"
ON public.visit_requests
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role') IN ('admin','super_admin'))
WITH CHECK ((auth.jwt() ->> 'role') IN ('admin','super_admin'));

-- Add indexes for visit requests
CREATE INDEX idx_visit_requests_property_id ON public.visit_requests(property_id);
CREATE INDEX idx_visit_requests_requester_id ON public.visit_requests(requester_id);
CREATE INDEX idx_visit_requests_status ON public.visit_requests(status);
CREATE INDEX idx_visit_requests_date ON public.visit_requests(requested_date);

-- Add visit availability configuration to properties table
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS visit_availability_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_confirm_visits BOOLEAN DEFAULT false;

-- Create function to auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to property_visit_availability
DROP TRIGGER IF EXISTS update_property_visit_availability_updated_at ON public.property_visit_availability;
CREATE TRIGGER update_property_visit_availability_updated_at
  BEFORE UPDATE ON public.property_visit_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger to visit_requests
DROP TRIGGER IF EXISTS update_visit_requests_updated_at ON public.visit_requests;
CREATE TRIGGER update_visit_requests_updated_at
  BEFORE UPDATE ON public.visit_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.property_visit_availability IS 
  'Configuration for property visit schedules. Owners can set days and times when visits are available.';

COMMENT ON TABLE public.visit_requests IS 
  'Requests from potential buyers to visit properties. Includes status tracking and owner responses.';

COMMENT ON COLUMN public.properties.visit_availability_enabled IS 
  'Whether visit scheduling is enabled for this property.';

COMMENT ON COLUMN public.properties.auto_confirm_visits IS 
  'If true, visit requests are automatically confirmed without manual owner approval.';

