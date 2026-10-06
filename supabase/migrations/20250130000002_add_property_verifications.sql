-- Property verifications table for draft→pending submission flow
CREATE TABLE IF NOT EXISTS public.property_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'requires_changes')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  changes_requested TEXT,
  submitted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  visit_availability_configured BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_verifications_property_id ON public.property_verifications(property_id);
CREATE INDEX IF NOT EXISTS idx_property_verifications_user_id ON public.property_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_property_verifications_status ON public.property_verifications(status);

ALTER TABLE public.property_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own property verifications" ON public.property_verifications;
CREATE POLICY "Users can view their own property verifications"
  ON public.property_verifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins and lawyers can view all property verifications" ON public.property_verifications;
CREATE POLICY "Admins and lawyers can view all property verifications"
  ON public.property_verifications FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'lawyer'))
  );

DROP POLICY IF EXISTS "Users can insert their own property verifications" ON public.property_verifications;
CREATE POLICY "Users can insert their own property verifications"
  ON public.property_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins and lawyers can update property verifications" ON public.property_verifications;
CREATE POLICY "Admins and lawyers can update property verifications"
  ON public.property_verifications FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'lawyer'))
  );
