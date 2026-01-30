-- ============================================
-- 05 ADDITIONAL FEATURES - Consolidated Migration
-- ============================================
-- This migration consolidates additional features: verification, reports, platform settings, chat, audit logs, availability
-- Sources consolidated:
--   - 20251021180000_notifications_system.sql (already in base schema, but functions here)
--   - 20251021240000_user_verification_system.sql
--   - 20251021250000_create_verification_requests_table.sql
--   - 20251021100000_reports_denunciations.sql
--   - 20251021110100_platform_settings.sql
--   - 20251023_chat_system.sql
--   - 20251021050000_audit_logs.sql
--   - 20251021010000_property_availability.sql
--   - 20251021060000_visit_feedback.sql
--   - 20251021070000_offer_attachments.sql

-- ============================================
-- VERIFICATION SYSTEM
-- ============================================

-- Add verification fields to profiles table
ALTER TABLE profiles 
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'unverified' 
        CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected', 'premium')),
    ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS verification_reviewed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS verification_reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS verification_rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS date_of_birth DATE,
    ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);

-- Verification requests table
CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) CHECK (document_type IN ('passport', 'cedula', 'cedula_extranjeria', 'cedula_ciudadania', 'other')),
    id_doc_url TEXT,
    selfie_url TEXT,
    poa_doc_url TEXT,
    full_name VARCHAR(255),
    dob DATE,
    nationality VARCHAR(100),
    phone VARCHAR(20),
    location TEXT,
    is_owner BOOLEAN DEFAULT true,
    has_poa BOOLEAN DEFAULT false,
    how_did_you_find_us JSONB DEFAULT '[]'::jsonb,
    what_do_you_want_to_do JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification documents table
CREATE TABLE IF NOT EXISTS verification_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('passport', 'cedula', 'cedula_extranjeria', 'other')),
    document_url TEXT NOT NULL,
    selfie_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Login attempts table
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification indexes
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_documents_user_id ON verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON verification_documents(status);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);

-- Enable RLS for verification tables
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Verification RLS policies
DROP POLICY IF EXISTS "Users can view their own verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Users can insert their own verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Admins can view all verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Admins can update verification requests" ON verification_requests;

CREATE POLICY "Users can view their own verification requests" ON verification_requests
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own verification requests" ON verification_requests
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all verification requests" ON verification_requests
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

CREATE POLICY "Admins can update verification requests" ON verification_requests
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- Verification documents RLS policies
DROP POLICY IF EXISTS "Users can view their own verification documents" ON verification_documents;
DROP POLICY IF EXISTS "Users can insert their own verification documents" ON verification_documents;
DROP POLICY IF EXISTS "Admins can view all verification documents" ON verification_documents;
DROP POLICY IF EXISTS "Admins can update verification documents" ON verification_documents;

CREATE POLICY "Users can view their own verification documents" ON verification_documents
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own verification documents" ON verification_documents
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all verification documents" ON verification_documents
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

CREATE POLICY "Admins can update verification documents" ON verification_documents
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- Login attempts RLS policies
DROP POLICY IF EXISTS "Users can view their own login attempts" ON login_attempts;
DROP POLICY IF EXISTS "System can insert login attempts" ON login_attempts;
DROP POLICY IF EXISTS "Admins can view all login attempts" ON login_attempts;

CREATE POLICY "Users can view their own login attempts" ON login_attempts
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can insert login attempts" ON login_attempts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all login attempts" ON login_attempts
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- Triggers for verification tables updated_at
DROP TRIGGER IF EXISTS update_verification_requests_updated_at ON verification_requests;
CREATE TRIGGER update_verification_requests_updated_at
    BEFORE UPDATE ON verification_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_verification_documents_updated_at ON verification_documents;
CREATE TRIGGER update_verification_documents_updated_at
    BEFORE UPDATE ON verification_documents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- REPORTS AND DENUNCIATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reported_property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    reported_visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL CHECK (report_type IN (
        'spam', 'fraud', 'inappropriate_content', 'harassment',
        'fake_listing', 'scam', 'copyright_violation', 'other'
    )),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'under_review', 'resolved', 'dismissed', 'escalated'
    )),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN (
        'low', 'medium', 'high', 'critical'
    )),
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    resolution_action TEXT CHECK (resolution_action IN (
        'warning', 'suspension', 'ban', 'property_removal',
        'visit_cancellation', 'content_removal', 'no_action'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_property ON reports(reported_property_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_visit ON reports(reported_visit_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON reports(priority);

-- Enable RLS for reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Reports RLS policies
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
DROP POLICY IF EXISTS "Users can create reports" ON reports;
DROP POLICY IF EXISTS "Admins can update reports" ON reports;

CREATE POLICY "Users can view their own reports" ON reports
    FOR SELECT USING (auth.uid()::text = reporter_id::text);

CREATE POLICY "Admins can view all reports" ON reports
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

CREATE POLICY "Users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.uid()::text = reporter_id::text);

CREATE POLICY "Admins can update reports" ON reports
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- Reports updated_at trigger
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- PLATFORM SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    setting_type TEXT NOT NULL DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'uploads', 'offers', 'notifications', 'auth', 'email')),
    is_public BOOLEAN NOT NULL DEFAULT false,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Platform settings indexes
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_platform_settings_category ON platform_settings(category);
CREATE INDEX IF NOT EXISTS idx_platform_settings_updated_at ON platform_settings(updated_at DESC);

-- Enable RLS for platform settings
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Platform settings RLS policies
DROP POLICY IF EXISTS "Public settings are readable by all users" ON platform_settings;
DROP POLICY IF EXISTS "Admins can read all settings" ON platform_settings;
DROP POLICY IF EXISTS "Admins can modify settings" ON platform_settings;

CREATE POLICY "Public settings are readable by all users" ON platform_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can read all settings" ON platform_settings
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

CREATE POLICY "Admins can modify settings" ON platform_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- Platform settings updated_at trigger
DROP TRIGGER IF EXISTS update_platform_settings_updated_at ON platform_settings;
CREATE TRIGGER update_platform_settings_updated_at
    BEFORE UPDATE ON platform_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default platform settings
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

-- ============================================
-- CHAT SYSTEM (CONVERSATIONS)
-- ============================================

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    participants UUID[] NOT NULL DEFAULT '{}',
    type VARCHAR(20) NOT NULL DEFAULT 'general' CHECK (type IN ('verification', 'property_inquiry', 'negotiation', 'general')),
    subject VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Extend chat_messages table if needed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'chat_messages' AND column_name = 'conversation_id'
    ) THEN
        ALTER TABLE public.chat_messages
            ADD COLUMN conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'chat_messages' AND column_name = 'attachments'
    ) THEN
        ALTER TABLE public.chat_messages
            ADD COLUMN attachments JSONB DEFAULT '[]';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'chat_messages' AND column_name = 'reply_to_id'
    ) THEN
        ALTER TABLE public.chat_messages
            ADD COLUMN reply_to_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations USING GIN (participants);
CREATE INDEX IF NOT EXISTS idx_conversations_property ON public.conversations(property_id);
CREATE INDEX IF NOT EXISTS idx_conversations_case ON public.conversations(case_id);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON public.conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to ON public.chat_messages(reply_to_id);

-- Enable RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Conversations RLS policies
DROP POLICY IF EXISTS "Users can read their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;

CREATE POLICY "Users can read their conversations" ON public.conversations
    FOR SELECT USING (
        auth.uid() = ANY(participants) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('lawyer', 'admin', 'super_admin'))
    );

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (
        auth.uid() = ANY(participants) AND created_by = auth.uid()
    );

CREATE POLICY "Users can update their conversations" ON public.conversations
    FOR UPDATE USING (
        auth.uid() = ANY(participants) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('lawyer', 'admin', 'super_admin'))
    );

-- Conversations updated_at trigger
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable RLS for audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs RLS policies
DROP POLICY IF EXISTS "audit_logs_read" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;

CREATE POLICY "audit_logs_read" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "audit_logs_insert" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- Audit logging functions and triggers
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

-- Audit triggers
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

-- ============================================
-- PROPERTY AVAILABILITY
-- ============================================

CREATE TABLE IF NOT EXISTS property_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    time_slots TEXT[] NOT NULL DEFAULT '{}',
    visit_duration INTEGER DEFAULT 60 CHECK (visit_duration > 0),
    max_visits_per_day INTEGER DEFAULT 5 CHECK (max_visits_per_day > 0),
    advance_booking_hours INTEGER DEFAULT 24 CHECK (advance_booking_hours >= 0),
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(property_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS blocked_dates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    blocked_date DATE NOT NULL,
    reason TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(property_id, blocked_date)
);

-- Property availability indexes
CREATE INDEX IF NOT EXISTS idx_property_availability_property_id ON property_availability(property_id);
CREATE INDEX IF NOT EXISTS idx_property_availability_day ON property_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_property_id ON blocked_dates(property_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(blocked_date);

-- Enable RLS for property availability
ALTER TABLE property_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Property availability RLS policies
DROP POLICY IF EXISTS "Property owners can manage their availability" ON property_availability;
DROP POLICY IF EXISTS "Anyone can view availability for published properties" ON property_availability;
DROP POLICY IF EXISTS "Property owners can manage their blocked dates" ON blocked_dates;
DROP POLICY IF EXISTS "Anyone can view blocked dates for published properties" ON blocked_dates;

CREATE POLICY "Property owners can manage their availability" ON property_availability
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = property_availability.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view availability for published properties" ON property_availability
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = property_availability.property_id 
            AND properties.status = 'published'
        )
    );

CREATE POLICY "Property owners can manage their blocked dates" ON blocked_dates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = blocked_dates.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view blocked dates for published properties" ON blocked_dates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = blocked_dates.property_id 
            AND properties.status = 'published'
        )
    );

-- Property availability updated_at triggers
DROP TRIGGER IF EXISTS update_property_availability_updated_at ON property_availability;
CREATE TRIGGER update_property_availability_updated_at
    BEFORE UPDATE ON property_availability
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- NOTIFICATION FUNCTIONS (if notifications table exists)
-- ============================================

-- Function to send notification
CREATE OR REPLACE FUNCTION send_notification(
    p_user_id UUID,
    p_type VARCHAR,
    p_title VARCHAR,
    p_message TEXT,
    p_data JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
        RETURN NULL;
    END IF;
    
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_data)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
        RETURN FALSE;
    END IF;
    
    UPDATE notifications 
    SET read = TRUE, read_at = NOW(), updated_at = NOW()
    WHERE id = p_notification_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to mark all notifications as read for user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
        RETURN 0;
    END IF;
    
    UPDATE notifications 
    SET read = TRUE, read_at = NOW(), updated_at = NOW()
    WHERE user_id = p_user_id AND read = FALSE;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

