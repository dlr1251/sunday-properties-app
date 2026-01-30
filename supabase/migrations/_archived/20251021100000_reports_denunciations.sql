-- Reports and Denunciations System
-- Create table for user reports and property/visit denunciations

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
    evidence_urls TEXT[], -- Array of URLs to evidence files/images
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'under_review', 'resolved', 'dismissed', 'escalated'
    )),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN (
        'low', 'medium', 'high', 'critical'
    )),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    resolution_notes TEXT,
    resolution_action TEXT CHECK (resolution_action IN (
        'warning', 'suspension', 'ban', 'property_removal',
        'visit_cancellation', 'content_removal', 'no_action'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_property ON reports(reported_property_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_visit ON reports(reported_visit_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON reports(priority);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own reports
CREATE POLICY "Users can view their own reports" ON reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports" ON reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Users can create reports
CREATE POLICY "Users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Admins can update reports
CREATE POLICY "Admins can update reports" ON reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_reports_updated_at();

-- Function to notify admins of new reports
CREATE OR REPLACE FUNCTION notify_new_report()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert notification for all admins
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        data
    )
    SELECT
        p.id,
        'new_report',
        'Nueva Denuncia Recibida',
        CASE
            WHEN NEW.report_type = 'spam' THEN 'Se ha reportado contenido como spam'
            WHEN NEW.report_type = 'fraud' THEN 'Se ha reportado posible fraude'
            WHEN NEW.report_type = 'inappropriate_content' THEN 'Se ha reportado contenido inapropiado'
            WHEN NEW.report_type = 'harassment' THEN 'Se ha reportado acoso'
            WHEN NEW.report_type = 'fake_listing' THEN 'Se ha reportado anuncio falso'
            WHEN NEW.report_type = 'scam' THEN 'Se ha reportado posible estafa'
            ELSE 'Nueva denuncia recibida'
        END,
        json_build_object(
            'report_id', NEW.id,
            'report_type', NEW.report_type,
            'priority', NEW.priority
        )
    FROM profiles p
    WHERE p.role IN ('admin', 'super_admin');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new report notifications
CREATE TRIGGER notify_new_report_trigger
    AFTER INSERT ON reports
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_report();

-- Function to log report resolution
CREATE OR REPLACE FUNCTION log_report_resolution()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status changed to resolved, dismissed, or escalated
    IF NEW.status IN ('resolved', 'dismissed', 'escalated') AND
       OLD.status != NEW.status THEN

        INSERT INTO audit_logs (
            user_id,
            action_type,
            resource_type,
            resource_id,
            changes
        ) VALUES (
            NEW.reviewed_by,
            'report_' || NEW.status,
            'report',
            NEW.id,
            json_build_object(
                'report_type', NEW.report_type,
                'reported_user_id', NEW.reported_user_id,
                'reported_property_id', NEW.reported_property_id,
                'reported_visit_id', NEW.reported_visit_id,
                'resolution_action', NEW.resolution_action,
                'resolution_notes', NEW.resolution_notes
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for report resolution logging
CREATE TRIGGER log_report_resolution_trigger
    AFTER UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION log_report_resolution();
