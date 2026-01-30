-- Property Availability System Migration
-- Adds tables for property availability scheduling and blocked dates

-- 1. Create property_availability table
CREATE TABLE IF NOT EXISTS property_availability (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday, etc
  time_slots TEXT[] NOT NULL DEFAULT '{}', -- Array of time slots like ["09:00-12:00", "14:00-17:00"]
  visit_duration INTEGER DEFAULT 60 CHECK (visit_duration > 0), -- Duration in minutes
  max_visits_per_day INTEGER DEFAULT 5 CHECK (max_visits_per_day > 0),
  advance_booking_hours INTEGER DEFAULT 24 CHECK (advance_booking_hours >= 0),
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, day_of_week)
);

-- 2. Create blocked_dates table
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, blocked_date)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_availability_property_id ON property_availability(property_id);
CREATE INDEX IF NOT EXISTS idx_property_availability_day ON property_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_property_availability_enabled ON property_availability(enabled);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_property_id ON blocked_dates(property_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(blocked_date);

-- 4. Enable RLS
ALTER TABLE property_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for property_availability
CREATE POLICY "Property owners can manage their availability" ON property_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_availability.property_id 
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view availability for published properties" ON property_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_availability.property_id 
      AND properties.status = 'published'
    )
  );

-- 6. Create RLS policies for blocked_dates
CREATE POLICY "Property owners can manage their blocked dates" ON blocked_dates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = blocked_dates.property_id 
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view blocked dates for published properties" ON blocked_dates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = blocked_dates.property_id 
      AND properties.status = 'published'
    )
  );

-- 7. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Add triggers for updated_at
DROP TRIGGER IF EXISTS update_property_availability_updated_at ON property_availability;
CREATE TRIGGER update_property_availability_updated_at
  BEFORE UPDATE ON property_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Create function to check availability
CREATE OR REPLACE FUNCTION check_property_availability(
  p_property_id UUID,
  p_date DATE,
  p_time TIME
) RETURNS BOOLEAN AS $$
DECLARE
  day_of_week INTEGER;
  availability_record RECORD;
  blocked_count INTEGER;
BEGIN
  -- Get day of week (0=Sunday, 1=Monday, etc)
  day_of_week := EXTRACT(DOW FROM p_date);
  
  -- Check if date is blocked
  SELECT COUNT(*) INTO blocked_count
  FROM blocked_dates
  WHERE property_id = p_property_id 
  AND blocked_date = p_date;
  
  IF blocked_count > 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Check if property has availability for this day
  SELECT * INTO availability_record
  FROM property_availability
  WHERE property_id = p_property_id 
  AND day_of_week = day_of_week
  AND enabled = TRUE;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if time falls within any available time slot
  FOR i IN 1..array_length(availability_record.time_slots, 1) LOOP
    IF p_time >= split_part(availability_record.time_slots[i], '-', 1)::TIME
       AND p_time <= split_part(availability_record.time_slots[i], '-', 2)::TIME THEN
      RETURN TRUE;
    END IF;
  END LOOP;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to get available time slots for a date
CREATE OR REPLACE FUNCTION get_available_time_slots(
  p_property_id UUID,
  p_date DATE
) RETURNS TEXT[] AS $$
DECLARE
  day_of_week INTEGER;
  availability_record RECORD;
  result_slots TEXT[] := '{}';
  slot_time TIME;
  slot_duration INTERVAL := '1 hour'::INTERVAL;
BEGIN
  -- Get day of week (0=Sunday, 6=Saturday)
  day_of_week := EXTRACT(DOW FROM p_date);

  -- Check if date is blocked
  IF EXISTS (
    SELECT 1 FROM blocked_dates
    WHERE property_id = p_property_id
    AND blocked_date = p_date
  ) THEN
    RETURN result_slots;
  END IF;

  -- Get availability for this day
  SELECT * INTO availability_record
  FROM property_visit_availability
  WHERE property_id = p_property_id
  AND day_of_week = day_of_week
  AND is_active = TRUE;

  IF NOT FOUND THEN
    RETURN result_slots;
  END IF;

  -- Generate time slots based on start_time and end_time
  -- Assuming 1-hour slots for simplicity
  slot_time := availability_record.start_time;

  WHILE slot_time < availability_record.end_time LOOP
    result_slots := array_append(
      result_slots,
      to_char(slot_time, 'HH24:MI') || '-' || to_char(slot_time + slot_duration, 'HH24:MI')
    );
    slot_time := slot_time + slot_duration;
  END LOOP;

  RETURN result_slots;
END;
$$ LANGUAGE plpgsql;

-- (Documentation comments omitted in local migration to avoid cross-migration dependencies)
