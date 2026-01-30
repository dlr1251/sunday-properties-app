-- Enable RLS and basic policies for visit availability and blocked dates

-- Visit availability per property
DO $$ BEGIN
  PERFORM 1 FROM information_schema.tables WHERE table_name = 'property_visit_availability';
  IF FOUND THEN
    EXECUTE 'ALTER TABLE property_visit_availability ENABLE ROW LEVEL SECURITY';
    -- Anyone can read availability to schedule visits
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Anyone can view availability" ON property_visit_availability FOR SELECT USING (true)';
  END IF;
END $$;

-- Blocked dates per property
DO $$ BEGIN
  PERFORM 1 FROM information_schema.tables WHERE table_name = 'blocked_dates';
  IF FOUND THEN
    EXECUTE 'ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY';
    -- Anyone can read blocked dates to avoid showing unavailable days
    EXECUTE 'CREATE POLICY IF NOT EXISTS "Anyone can view blocked dates" ON blocked_dates FOR SELECT USING (true)';
  END IF;
END $$;


