-- Notifications System
-- Execute this in the Supabase SQL Editor

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'offer_received', 
        'offer_accepted', 
        'offer_rejected', 
        'counter_offer', 
        'negotiation_update', 
        'system'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Create function to send notification
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
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_data)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user notifications
CREATE OR REPLACE FUNCTION get_user_notifications(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    type VARCHAR,
    title VARCHAR,
    message TEXT,
    data JSONB,
    read BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.type,
        n.title,
        n.message,
        n.data,
        n.read,
        n.created_at
    FROM notifications n
    WHERE n.user_id = p_user_id
    ORDER BY n.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notifications 
    SET read = TRUE, updated_at = NOW()
    WHERE id = p_notification_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create function to mark all notifications as read for user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications 
    SET read = TRUE, updated_at = NOW()
    WHERE user_id = p_user_id AND read = FALSE;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get unread count
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unread_count
    FROM notifications
    WHERE user_id = p_user_id AND read = FALSE;
    
    RETURN unread_count;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Create trigger to send notification when offer is created
CREATE OR REPLACE FUNCTION trigger_offer_notification()
RETURNS TRIGGER AS $$
DECLARE
    property_title VARCHAR;
    seller_id UUID;
BEGIN
    -- Get property title and seller ID
    SELECT p.title, p.owner_id INTO property_title, seller_id
    FROM properties p
    WHERE p.id = NEW.property_id;
    
    -- Send notification to seller
    PERFORM send_notification(
        seller_id,
        'offer_received',
        'Nueva Oferta Recibida',
        'Has recibido una nueva oferta de $' || NEW.offer_price::TEXT || ' para ' || property_title,
        jsonb_build_object(
            'offer_id', NEW.id,
            'property_id', NEW.property_id,
            'property_title', property_title,
            'offer_price', NEW.offer_price,
            'buyer_id', NEW.buyer_id
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_send_offer_notification
    AFTER INSERT ON offers
    FOR EACH ROW
    EXECUTE FUNCTION trigger_offer_notification();

-- Create trigger to send notification when offer status changes
CREATE OR REPLACE FUNCTION trigger_offer_status_notification()
RETURNS TRIGGER AS $$
DECLARE
    property_title VARCHAR;
    notification_type VARCHAR;
    notification_title VARCHAR;
    notification_message TEXT;
BEGIN
    -- Only send notification if status changed
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;
    
    -- Get property title
    SELECT p.title INTO property_title
    FROM properties p
    WHERE p.id = NEW.property_id;
    
    -- Determine notification type and message
    CASE NEW.status
        WHEN 'accepted' THEN
            notification_type := 'offer_accepted';
            notification_title := 'Oferta Aceptada';
            notification_message := 'Tu oferta de $' || NEW.offer_price::TEXT || ' para ' || property_title || ' ha sido aceptada!';
        WHEN 'rejected' THEN
            notification_type := 'offer_rejected';
            notification_title := 'Oferta Rechazada';
            notification_message := 'Tu oferta de $' || NEW.offer_price::TEXT || ' para ' || property_title || ' ha sido rechazada.';
        WHEN 'countered' THEN
            notification_type := 'counter_offer';
            notification_title := 'Contraoferta Recibida';
            notification_message := 'Has recibido una contraoferta para ' || property_title;
        ELSE
            RETURN NEW;
    END CASE;
    
    -- Send notification to buyer
    PERFORM send_notification(
        NEW.buyer_id,
        notification_type,
        notification_title,
        notification_message,
        jsonb_build_object(
            'offer_id', NEW.id,
            'property_id', NEW.property_id,
            'property_title', property_title,
            'offer_price', NEW.offer_price,
            'status', NEW.status
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_send_offer_status_notification
    AFTER UPDATE ON offers
    FOR EACH ROW
    EXECUTE FUNCTION trigger_offer_status_notification();

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, UPDATE ON notifications TO authenticated;
GRANT EXECUTE ON FUNCTION send_notification TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_count TO authenticated;
