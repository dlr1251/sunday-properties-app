-- Reassign all properties from non-regular users to regular users
-- This ensures all properties are owned by users with role = 'user'
-- and not by admins, lawyers, agents, or superadmins

DO $$
DECLARE
  regular_user_count INTEGER;
  reassigned_count INTEGER;
  profiles_exists BOOLEAN;
  properties_exists BOOLEAN;
BEGIN
  -- Check if required tables exist
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) INTO profiles_exists;

  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'properties'
  ) INTO properties_exists;

  -- Exit early if tables don't exist yet
  IF NOT profiles_exists OR NOT properties_exists THEN
    RAISE NOTICE 'Tables not yet created. Skipping property reassignment.';
    RETURN;
  END IF;

  -- Check if we have regular users to assign to
  SELECT COUNT(*) INTO regular_user_count
  FROM profiles
  WHERE role = 'user' AND status = 'active';

  IF regular_user_count = 0 THEN
    RAISE WARNING 'No regular users found. Cannot reassign properties.';
    RETURN;
  END IF;

  -- Reassign properties from non-regular users to regular users
  -- Uses round-robin distribution to evenly distribute properties
  WITH numbered_properties AS (
    SELECT 
      p.id,
      p.owner_id,
      ROW_NUMBER() OVER (ORDER BY p.id) as row_num
    FROM properties p
    INNER JOIN profiles pr ON pr.id = p.owner_id
    WHERE pr.role IN ('super_admin', 'admin', 'lawyer', 'agent')
  ),
  numbered_users AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY id) as row_num
    FROM profiles
    WHERE role = 'user' AND status = 'active'
  )
  UPDATE properties p
  SET 
    owner_id = nu.id,
    updated_at = NOW()
  FROM numbered_properties np
  JOIN numbered_users nu ON (np.row_num - 1) % regular_user_count = nu.row_num - 1
  WHERE p.id = np.id;

  GET DIAGNOSTICS reassigned_count = ROW_COUNT;

  RAISE NOTICE 'Reassigned % properties from non-regular users to regular users', reassigned_count;
END $$;

-- Verify the reassignment (only if tables exist)
DO $$
DECLARE
  properties_with_non_regular_owners INTEGER;
  profiles_exists BOOLEAN;
  properties_exists BOOLEAN;
BEGIN
  -- Check if required tables exist
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) INTO profiles_exists;

  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'properties'
  ) INTO properties_exists;

  -- Exit early if tables don't exist yet
  IF NOT profiles_exists OR NOT properties_exists THEN
    RETURN;
  END IF;

  SELECT COUNT(*) INTO properties_with_non_regular_owners
  FROM properties p
  INNER JOIN profiles pr ON pr.id = p.owner_id
  WHERE pr.role IN ('super_admin', 'admin', 'lawyer', 'agent');

  IF properties_with_non_regular_owners > 0 THEN
    RAISE WARNING 'Still found % properties owned by non-regular users', properties_with_non_regular_owners;
  ELSE
    RAISE NOTICE 'All properties are now owned by regular users';
  END IF;
END $$;

