-- Add reschedule_count column to visits table
ALTER TABLE visits 
ADD COLUMN IF NOT EXISTS reschedule_count INTEGER DEFAULT 0 CHECK (reschedule_count >= 0);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_visits_reschedule_count ON visits(reschedule_count);

-- Update existing visits to have reschedule_count = 0
UPDATE visits SET reschedule_count = 0 WHERE reschedule_count IS NULL;

