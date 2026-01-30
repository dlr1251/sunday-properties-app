-- User verification, messaging, availability and audit

-- 1) Buckets for profile docs
INSERT INTO storage.buckets (id, name, public)
SELECT 'profile-docs','profile-docs', false
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-docs');

-- Policies: owner (by path prefix auth.uid()), lawyers/admins can read; owner/admin can write
DROP POLICY IF EXISTS "Read profile docs: owner or legal" ON storage.objects;
CREATE POLICY "Read profile docs: owner or legal" ON storage.objects
FOR SELECT USING (
  bucket_id = 'profile-docs' AND (
    position((auth.uid())::text || '/' in name) = 1 OR (auth.jwt() ->> 'role') IN ('lawyer','admin','super_admin')
  )
);

DROP POLICY IF EXISTS "Write profile docs: owner or admin" ON storage.objects;
CREATE POLICY "Write profile docs: owner or admin" ON storage.objects
FOR ALL TO authenticated
USING (
  bucket_id = 'profile-docs' AND (
    position((auth.uid())::text || '/' in name) = 1 OR (auth.jwt() ->> 'role') IN ('admin','super_admin')
  )
)
WITH CHECK (
  bucket_id = 'profile-docs' AND (
    position((auth.uid())::text || '/' in name) = 1 OR (auth.jwt() ->> 'role') IN ('admin','super_admin')
  )
);

-- 2) Verification requests
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  data JSONB DEFAULT '{}'::jsonb,
  selfie_path TEXT,
  id_doc_path TEXT,
  is_owner BOOLEAN,
  has_poa BOOLEAN,
  poa_doc_path TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id)
);

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can manage own verification" ON public.verification_requests;
CREATE POLICY "Owner can manage own verification" ON public.verification_requests
FOR ALL TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Lawyer and admin can review verification" ON public.verification_requests;
CREATE POLICY "Lawyer and admin can review verification" ON public.verification_requests
FOR SELECT USING ((auth.jwt() ->> 'role') IN ('lawyer','admin','super_admin'));

DROP POLICY IF EXISTS "Lawyer and admin can update verification" ON public.verification_requests;
CREATE POLICY "Lawyer and admin can update verification" ON public.verification_requests
FOR UPDATE USING ((auth.jwt() ->> 'role') IN ('lawyer','admin','super_admin'))
WITH CHECK ((auth.jwt() ->> 'role') IN ('lawyer','admin','super_admin'));

-- 3) Verification messages
CREATE TABLE IF NOT EXISTS public.verification_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES verification_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.verification_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read messages" ON public.verification_messages;
CREATE POLICY "Participants can read messages" ON public.verification_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM verification_requests vr
    WHERE vr.id = verification_messages.request_id
      AND (
        vr.user_id::text = auth.uid()::text OR (auth.jwt() ->> 'role') IN ('lawyer','admin','super_admin')
      )
  )
);

DROP POLICY IF EXISTS "Participants can write messages" ON public.verification_messages;
CREATE POLICY "Participants can write messages" ON public.verification_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM verification_requests vr
    WHERE vr.id = verification_messages.request_id
      AND (
        vr.user_id::text = auth.uid()::text OR (auth.jwt() ->> 'role') IN ('lawyer','admin','super_admin')
      )
  )
);

-- 4) Property availability
CREATE TABLE IF NOT EXISTS public.property_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  exceptions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.property_availability ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner manage availability" ON public.property_availability;
CREATE POLICY "Owner manage availability" ON public.property_availability
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.owner_id::text = auth.uid()::text)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.owner_id::text = auth.uid()::text)
);

-- 5) Property change log
CREATE TABLE IF NOT EXISTS public.property_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  changes JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.property_change_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins and owners can read change log" ON public.property_change_log;
CREATE POLICY "Admins and owners can read change log" ON public.property_change_log
FOR SELECT USING (
  (auth.jwt() ->> 'role') IN ('admin','super_admin') OR
  EXISTS (SELECT 1 FROM properties p WHERE p.id = property_change_log.property_id AND p.owner_id::text = auth.uid()::text)
);


