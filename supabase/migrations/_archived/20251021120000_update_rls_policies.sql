-- RLS Policies for profiles (only create if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
    CREATE POLICY "Users can view their own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
    CREATE POLICY "Users can insert their own profile" ON profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles') THEN
    CREATE POLICY "Admins can view all profiles" ON profiles
      FOR SELECT USING (
        (get_my_claim('user_role'::text)) = '"admin"'::jsonb OR
        (get_my_claim('user_role'::text)) = '"super_admin"'::jsonb
      );
  END IF;
END $$;

-- RLS Policies for offers (only create if they don't exist)
DO $$
BEGIN
  IF to_regclass('public.offers') IS NOT NULL THEN
    ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'offers' AND policyname = 'Participants can view their offers') THEN
      CREATE POLICY "Participants can view their offers" ON offers
        FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = (SELECT owner_id FROM properties WHERE id = property_id));
    END IF;
  END IF;
END $$;

-- RLS Policies for verification_documents (only create if they don't exist)
DO $$
BEGIN
  IF to_regclass('public.verification_documents') IS NOT NULL THEN
    ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'verification_documents' AND policyname = 'Users can view their own verification documents') THEN
      CREATE POLICY "Users can view their own verification documents" ON verification_documents
        FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'verification_documents' AND policyname = 'Admins can view all verification documents') THEN
      CREATE POLICY "Admins can view all verification documents" ON verification_documents
        FOR SELECT USING (
          (get_my_claim('user_role'::text)) = '"admin"'::jsonb OR
          (get_my_claim('user_role'::text)) = '"super_admin"'::jsonb
        );
    END IF;
  END IF;
END $$;
