-- Create property_verifications table (only after properties exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'properties'
  ) THEN
    -- Table
    CREATE TABLE IF NOT EXISTS public.property_verifications (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'requires_changes')),
      reviewed_by UUID REFERENCES auth.users(id),
      reviewed_at TIMESTAMP WITH TIME ZONE,
      rejection_reason TEXT,
      changes_requested TEXT,
      submitted_data JSONB NOT NULL,
      visit_availability_configured BOOLEAN DEFAULT FALSE,
      submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_property_verifications_property_id ON public.property_verifications(property_id);
    CREATE INDEX IF NOT EXISTS idx_property_verifications_user_id ON public.property_verifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_property_verifications_status ON public.property_verifications(status);
    CREATE INDEX IF NOT EXISTS idx_property_verifications_submitted_at ON public.property_verifications(submitted_at DESC);

    -- RLS
    ALTER TABLE public.property_verifications ENABLE ROW LEVEL SECURITY;

    -- Policies
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'property_verifications' AND policyname = 'Users can view their own property verifications'
    ) THEN
      CREATE POLICY "Users can view their own property verifications"
        ON public.property_verifications FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'property_verifications' AND policyname = 'Admins and lawyers can view all property verifications'
    ) THEN
      CREATE POLICY "Admins and lawyers can view all property verifications"
        ON public.property_verifications FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin', 'lawyer')
          )
        );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'property_verifications' AND policyname = 'Users can insert their own property verifications'
    ) THEN
      CREATE POLICY "Users can insert their own property verifications"
        ON public.property_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'property_verifications' AND policyname = 'Admins and lawyers can update property verifications'
    ) THEN
      CREATE POLICY "Admins and lawyers can update property verifications"
        ON public.property_verifications FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin', 'lawyer')
          )
        );
    END IF;

    -- Trigger intentionally omitted to avoid nested dollar-quoting in DO block
  ELSE
    RAISE NOTICE 'Skipping property_verifications creation: properties table not found yet';
  END IF;
END $$;

