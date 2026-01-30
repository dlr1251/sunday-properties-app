-- Audit Logging System
-- Comprehensive logging of all administrative and user actions

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- RLS Policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins and super_admins can read audit logs
CREATE POLICY audit_logs_read ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- Anyone can insert audit logs (system operations)
CREATE POLICY audit_logs_insert ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Function to log user role changes
CREATE OR REPLACE FUNCTION log_user_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO audit_logs (user_id, action_type, resource_type, resource_id, changes)
    VALUES (NEW.id, 'user_role_changed', 'user', NEW.id, jsonb_build_object(
      'old_role', OLD.role,
      'new_role', NEW.role,
      'changed_by', auth.uid()
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log property status changes
CREATE OR REPLACE FUNCTION log_property_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_logs (user_id, action_type, resource_type, resource_id, changes)
    VALUES (NEW.owner_id, 'property_status_changed', 'property', NEW.id, jsonb_build_object(
      'old_status', OLD.status,
      'new_status', NEW.status,
      'changed_by', auth.uid()
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log offer status changes
CREATE OR REPLACE FUNCTION log_offer_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_logs (user_id, action_type, resource_type, resource_id, changes)
    VALUES (NEW.buyer_id, 'offer_status_changed', 'offer', NEW.id, jsonb_build_object(
      'old_status', OLD.status,
      'new_status', NEW.status,
      'property_id', NEW.property_id,
      'changed_by', auth.uid()
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log verification status changes
CREATE OR REPLACE FUNCTION log_verification_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
    INSERT INTO audit_logs (user_id, action_type, resource_type, resource_id, changes)
    VALUES (NEW.id, 'verification_status_changed', 'user', NEW.id, jsonb_build_object(
      'old_status', OLD.verification_status,
      'new_status', NEW.verification_status,
      'changed_by', auth.uid()
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers to tables
DROP TRIGGER IF EXISTS audit_user_role_changes ON profiles;
CREATE TRIGGER audit_user_role_changes
  AFTER UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION log_user_role_change();

DROP TRIGGER IF EXISTS audit_property_status_changes ON properties;
CREATE TRIGGER audit_property_status_changes
  AFTER UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION log_property_status_change();

DROP TRIGGER IF EXISTS audit_offer_status_changes ON offers;
CREATE TRIGGER audit_offer_status_changes
  AFTER UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION log_offer_status_change();

DROP TRIGGER IF EXISTS audit_verification_status_changes ON profiles;
CREATE TRIGGER audit_verification_status_changes
  AFTER UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION log_verification_status_change();

-- Function to get audit logs with user details
CREATE OR REPLACE FUNCTION get_audit_logs_with_users(
  limit_count INTEGER DEFAULT 100,
  offset_count INTEGER DEFAULT 0,
  user_filter UUID DEFAULT NULL,
  action_filter TEXT DEFAULT NULL,
  resource_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  action_type TEXT,
  resource_type TEXT,
  resource_id UUID,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.user_id,
    COALESCE(p.name, 'System') as user_name,
    COALESCE(u.email, 'system@platform.com') as user_email,
    al.action_type,
    al.resource_type,
    al.resource_id,
    al.changes,
    al.created_at
  FROM audit_logs al
  LEFT JOIN auth.users u ON al.user_id = u.id
  LEFT JOIN profiles p ON al.user_id = p.id
  WHERE (user_filter IS NULL OR al.user_id = user_filter)
    AND (action_filter IS NULL OR al.action_type = action_filter)
    AND (resource_filter IS NULL OR al.resource_type = resource_filter)
  ORDER BY al.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit statistics
CREATE OR REPLACE FUNCTION get_audit_statistics(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_logs', COUNT(*),
    'actions_by_type', (
      SELECT json_object_agg(action_type, count)
      FROM (
        SELECT action_type, COUNT(*) as count
        FROM audit_logs
        WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
        GROUP BY action_type
        ORDER BY count DESC
      ) t
    ),
    'top_users', (
      SELECT json_agg(json_build_object('user_id', user_id, 'name', name, 'count', count))
      FROM (
        SELECT al.user_id, COALESCE(p.name, 'System') as name, COUNT(*) as count
        FROM audit_logs al
        LEFT JOIN profiles p ON al.user_id = p.id
        WHERE al.created_at >= NOW() - INTERVAL '1 day' * days_back
        GROUP BY al.user_id, p.name
        ORDER BY count DESC
        LIMIT 5
      ) t
    )
  ) INTO result
  FROM audit_logs
  WHERE created_at >= NOW() - INTERVAL '1 day' * days_back;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all platform actions and changes';
COMMENT ON COLUMN audit_logs.changes IS 'JSON object containing before/after values and metadata';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource being acted upon (user, property, offer, etc)';
COMMENT ON FUNCTION get_audit_logs_with_users(INTEGER, INTEGER, UUID, TEXT, TEXT) IS 'Returns audit logs with user details and filtering options';
COMMENT ON FUNCTION get_audit_statistics(INTEGER) IS 'Returns aggregated statistics about audit activity';