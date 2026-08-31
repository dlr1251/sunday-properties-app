-- Property visit availability table (used by VisitAvailabilityConfig)
-- Schema matches useVisitAvailability hook expectations

CREATE TABLE IF NOT EXISTS public.property_visit_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  advance_booking_days INTEGER DEFAULT 1 CHECK (advance_booking_days >= 0),
  max_visits_per_day INTEGER DEFAULT 3 CHECK (max_visits_per_day > 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, day_of_week)
);

ALTER TABLE public.property_visit_availability ENABLE ROW LEVEL SECURITY;

-- Property owners can manage their own property's availability (including drafts)
DROP POLICY IF EXISTS "Owners can manage their property availability" ON public.property_visit_availability;
CREATE POLICY "Owners can manage their property availability"
  ON public.property_visit_availability FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND owner_id = auth.uid()
    )
  );

-- Admins can manage any
DROP POLICY IF EXISTS "Admins can manage all property availability" ON public.property_visit_availability;
CREATE POLICY "Admins can manage all property availability"
  ON public.property_visit_availability FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Public can read active availability
DROP POLICY IF EXISTS "Public can read active availability" ON public.property_visit_availability;
CREATE POLICY "Public can read active availability"
  ON public.property_visit_availability FOR SELECT
  USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_property_visit_availability_property_id
  ON public.property_visit_availability(property_id);
CREATE INDEX IF NOT EXISTS idx_property_visit_availability_active
  ON public.property_visit_availability(is_active, day_of_week);
