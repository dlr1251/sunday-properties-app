# Quick Migration Instructions

## The Problem
The `property_verifications` table doesn't exist in your database yet.

## Solution: Run the Migration

### Method 1: Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste this SQL:

```sql
-- Create property_verifications table
-- Tracks property uploads and their approval status

CREATE TABLE IF NOT EXISTS public.property_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'requires_changes')),
  
  -- Review information
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  changes_requested TEXT,
  
  -- Submission metadata
  submitted_data JSONB NOT NULL,
  visit_availability_configured BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_property_verifications_property_id ON public.property_verifications(property_id);
CREATE INDEX IF NOT EXISTS idx_property_verifications_user_id ON public.property_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_property_verifications_status ON public.property_verifications(status);
CREATE INDEX IF NOT EXISTS idx_property_verifications_submitted_at ON public.property_verifications(submitted_at DESC);

-- Enable RLS
ALTER TABLE public.property_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own property verifications"
  ON public.property_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and lawyers can view all property verifications"
  ON public.property_verifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'lawyer')
    )
  );

CREATE POLICY "Users can insert their own property verifications"
  ON public.property_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and lawyers can update property verifications"
  ON public.property_verifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'lawyer')
    )
  );

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_property_verifications_updated_at
  BEFORE UPDATE ON public.property_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

5. Click "Run" or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)
6. You should see "Success. No rows returned" message

### Method 2: Using Supabase CLI

If you have the Supabase CLI linked:

```bash
cd /Users/danielluque/Projects/sunday_proto
supabase db push
```

## Verification

After running the migration, verify the table was created:

```sql
SELECT * FROM public.property_verifications LIMIT 1;
```

You should see an empty result (or existing data if you've already submitted properties).

## What This Migration Does

1. Creates the `property_verifications` table to track property submissions
2. Sets up indexes for performance
3. Configures Row Level Security (RLS) policies
4. Creates a trigger to update the `updated_at` timestamp automatically

## After Migration

The property verification system will work immediately:
- Users can submit properties
- Admins can review and approve/reject
- Chat conversations will be created automatically on approval

