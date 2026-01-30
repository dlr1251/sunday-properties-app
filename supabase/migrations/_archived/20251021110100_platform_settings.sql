-- Platform Settings Configuration
-- Table for storing global platform configuration

CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    setting_type TEXT NOT NULL DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'uploads', 'offers', 'notifications', 'auth', 'email')),
    is_public BOOLEAN NOT NULL DEFAULT false,
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_platform_settings_category ON platform_settings(category);
CREATE INDEX IF NOT EXISTS idx_platform_settings_updated_at ON platform_settings(updated_at DESC);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public settings can be read by all users
CREATE POLICY "Public settings are readable by all users" ON platform_settings
    FOR SELECT USING (is_public = true);

-- Only admins can read all settings
CREATE POLICY "Admins can read all settings" ON platform_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Only admins can modify settings
CREATE POLICY "Admins can modify settings" ON platform_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_platform_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_platform_settings_updated_at
    BEFORE UPDATE ON platform_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_platform_settings_updated_at();

-- Function to log setting changes
CREATE OR REPLACE FUNCTION log_platform_setting_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the setting change
    INSERT INTO audit_logs (
        user_id,
        action_type,
        resource_type,
        resource_id,
        changes
    ) VALUES (
        NEW.updated_by,
        'platform_setting_updated',
        'platform_setting',
        NEW.id,
        json_build_object(
            'setting_key', NEW.setting_key,
            'old_value', CASE WHEN TG_OP = 'UPDATE' THEN OLD.setting_value ELSE null END,
            'new_value', NEW.setting_value,
            'category', NEW.category
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for setting change logging
CREATE TRIGGER log_platform_setting_change_trigger
    AFTER INSERT OR UPDATE ON platform_settings
    FOR EACH ROW
    EXECUTE FUNCTION log_platform_setting_change();

-- Insert default settings
INSERT INTO platform_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
('max_photos_per_property', '20', 'number', 'Maximum number of photos allowed per property listing', 'uploads', true),
('max_file_size_mb', '10', 'number', 'Maximum file size in MB for uploads', 'uploads', true),
('default_offer_validity_days', '7', 'number', 'Default validity period for offers in days', 'offers', true),
('enable_oauth_login', 'false', 'boolean', 'Enable OAuth login providers', 'auth', false),
('auto_approve_properties', 'false', 'boolean', 'Automatically approve property listings', 'general', false),
('commission_rate_percent', '3.5', 'number', 'Platform commission rate as percentage', 'general', false),
('required_verification_for_publish', 'true', 'boolean', 'Require identity verification to publish properties', 'general', false),
('auto_reject_offers_below_min', 'true', 'boolean', 'Automatically reject offers below minimum price', 'offers', false),
('email_notifications_enabled', 'true', 'boolean', 'Enable email notifications system', 'notifications', false),
('sms_notifications_enabled', 'false', 'boolean', 'Enable SMS notifications system', 'notifications', false),
('max_properties_per_user', '10', 'number', 'Maximum number of active properties per user', 'general', true),
('visit_reminder_hours_before', '24', 'number', 'Hours before visit to send reminder', 'notifications', false),
('negotiation_timeout_days', '30', 'number', 'Days before inactive negotiations are closed', 'offers', false),
('support_email', '"support@sundayproto.com"', 'string', 'Support email address', 'general', true),
('platform_name', '"Sunday Proto"', 'string', 'Platform display name', 'general', true),
('currency', '"COP"', 'string', 'Default currency code', 'general', true)
ON CONFLICT (setting_key) DO NOTHING;

