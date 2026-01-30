-- ============================================
-- FEATURE FLAGS SYSTEM
-- ============================================
-- Enables gradual rollout of new features with granular control
-- Features can be enabled globally, per user, or per role

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name TEXT NOT NULL UNIQUE,
  enabled_globally BOOLEAN DEFAULT FALSE,
  enabled_for_users UUID[] DEFAULT '{}',
  enabled_for_roles TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(flag_name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_global ON feature_flags(enabled_globally) WHERE enabled_globally = TRUE;
CREATE INDEX IF NOT EXISTS idx_feature_flags_users ON feature_flags USING GIN(enabled_for_users);
CREATE INDEX IF NOT EXISTS idx_feature_flags_roles ON feature_flags USING GIN(enabled_for_roles);

-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can check if a feature flag is enabled (read-only)
CREATE POLICY "Anyone can read feature flags" ON feature_flags
  FOR SELECT
  USING (true);

-- Only admins can manage feature flags
CREATE POLICY "Admins can manage feature flags" ON feature_flags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Initial feature flags with all features disabled
INSERT INTO feature_flags (flag_name, enabled_globally, metadata) VALUES
  ('structured_conditions', FALSE, '{"description": "Enable structured conditions for offers", "version": "1.0"}'),
  ('npv_calculation', FALSE, '{"description": "Enable NPV calculation for offers", "version": "1.0"}'),
  ('enhanced_lawyer_workflow', FALSE, '{"description": "Enable enhanced lawyer workflow features", "version": "1.0"}'),
  ('legal_data_extraction', FALSE, '{"description": "Enable legal data extraction from documents", "version": "1.0"}')
ON CONFLICT (flag_name) DO NOTHING;

-- Helper function to check if a feature is enabled for a user
CREATE OR REPLACE FUNCTION is_feature_enabled(
  p_flag_name TEXT,
  p_user_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_flag RECORD;
  v_user_role TEXT;
BEGIN
  -- Get feature flag
  SELECT * INTO v_flag
  FROM feature_flags
  WHERE flag_name = p_flag_name;
  
  -- If flag doesn't exist, return false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- If globally enabled, return true
  IF v_flag.enabled_globally THEN
    RETURN TRUE;
  END IF;
  
  -- If no user provided, return false
  IF p_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if enabled for specific user
  IF p_user_id = ANY(v_flag.enabled_for_users) THEN
    RETURN TRUE;
  END IF;
  
  -- Get user role and check if enabled for role
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_user_role = ANY(v_flag.enabled_for_roles) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to add user to feature flag
CREATE OR REPLACE FUNCTION add_user_to_feature_flag(
  p_flag_name TEXT,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_users UUID[];
BEGIN
  -- Get current users array
  SELECT enabled_for_users INTO v_current_users
  FROM feature_flags
  WHERE flag_name = p_flag_name;
  
  -- If flag doesn't exist, return false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Add user if not already in array
  IF NOT (p_user_id = ANY(v_current_users)) THEN
    UPDATE feature_flags
    SET enabled_for_users = array_append(v_current_users, p_user_id),
        updated_at = NOW()
    WHERE flag_name = p_flag_name;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_feature_enabled TO authenticated;
GRANT EXECUTE ON FUNCTION is_feature_enabled TO anon;
GRANT EXECUTE ON FUNCTION add_user_to_feature_flag TO authenticated;

-- Comments for documentation
COMMENT ON TABLE feature_flags IS 'Feature flags for gradual rollout of new features';
COMMENT ON FUNCTION is_feature_enabled IS 'Check if a feature flag is enabled for a user';
COMMENT ON FUNCTION add_user_to_feature_flag IS 'Add a user to a feature flag enabled list';

