-- Advanced Negotiation Functions
-- Execute this in the Supabase SQL Editor after the main migration

-- Function to auto-reject offers based on rules
CREATE OR REPLACE FUNCTION auto_reject_offers()
RETURNS TRIGGER AS $$
DECLARE
    rules RECORD;
    validation_result JSONB;
BEGIN
    -- Get negotiation rules for the property
    SELECT * INTO rules FROM negotiation_rules WHERE property_id = NEW.property_id;
    
    IF rules IS NOT NULL AND rules.auto_reject_enabled THEN
        -- Validate the offer
        validation_result := validate_offer_against_rules(
            NEW.property_id,
            NEW.offer_price,
            NEW.payment_method,
            NEW.closing_date
        );
        
        -- If validation fails, auto-reject
        IF NOT (validation_result->>'valid')::boolean THEN
            NEW.auto_rejected := TRUE;
            NEW.rejection_reason := validation_result->>'reason';
            NEW.status := 'rejected';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-reject offers
CREATE TRIGGER trigger_auto_reject_offers
    BEFORE INSERT ON offers
    FOR EACH ROW
    EXECUTE FUNCTION auto_reject_offers();

-- Function to update negotiation progress
CREATE OR REPLACE FUNCTION update_negotiation_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update progress when offer changes
    NEW.negotiation_progress := calculate_negotiation_progress(NEW.id);
    
    -- Update milestones based on status changes
    IF OLD.status != NEW.status THEN
        CASE NEW.status
            WHEN 'accepted' THEN
                NEW.milestones_completed := COALESCE(NEW.milestones_completed, '{}'::jsonb) || 
                    '{"offer_accepted": true}'::jsonb;
            WHEN 'rejected' THEN
                NEW.milestones_completed := COALESCE(NEW.milestones_completed, '{}'::jsonb) || 
                    '{"offer_rejected": true}'::jsonb;
        END CASE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update negotiation progress
CREATE TRIGGER trigger_update_negotiation_progress
    BEFORE UPDATE ON offers
    FOR EACH ROW
    EXECUTE FUNCTION update_negotiation_progress();

-- Function to calculate competitiveness score
CREATE OR REPLACE FUNCTION calculate_competitiveness_score(p_offer_id UUID)
RETURNS INTEGER AS $$
DECLARE
    offer RECORD;
    property RECORD;
    score INTEGER := 0;
    price_ratio DECIMAL;
    days_to_close INTEGER;
BEGIN
    SELECT * INTO offer FROM offers WHERE id = p_offer_id;
    SELECT * INTO property FROM properties WHERE id = offer.property_id;
    
    -- Price competitiveness (40% weight)
    IF property.price > 0 THEN
        price_ratio := (offer.offer_price::DECIMAL / property.price::DECIMAL) * 100;
        IF price_ratio >= 95 THEN score := score + 40;
        ELSIF price_ratio >= 90 THEN score := score + 30;
        ELSIF price_ratio >= 85 THEN score := score + 20;
        ELSIF price_ratio >= 80 THEN score := score + 10;
        END IF;
    END IF;
    
    -- Payment method competitiveness (20% weight)
    CASE offer.payment_method
        WHEN 'cash' THEN score := score + 20;
        WHEN 'bank_transfer' THEN score := score + 15;
        WHEN 'financing' THEN score := score + 10;
        WHEN 'installments' THEN score := score + 5;
    END CASE;
    
    -- Closing date competitiveness (20% weight)
    days_to_close := offer.closing_date - CURRENT_DATE;
    IF days_to_close <= 30 THEN score := score + 20;
    ELSIF days_to_close <= 60 THEN score := score + 15;
    ELSIF days_to_close <= 90 THEN score := score + 10;
    ELSIF days_to_close <= 120 THEN score := score + 5;
    END IF;
    
    -- Conditions competitiveness (20% weight)
    IF offer.conditions IS NULL OR array_length(offer.conditions, 1) IS NULL THEN
        score := score + 20; -- No conditions = most competitive
    ELSIF array_length(offer.conditions, 1) <= 2 THEN
        score := score + 15;
    ELSIF array_length(offer.conditions, 1) <= 4 THEN
        score := score + 10;
    ELSE
        score := score + 5;
    END IF;
    
    RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to get negotiation insights
CREATE OR REPLACE FUNCTION get_negotiation_insights(p_property_id UUID)
RETURNS JSONB AS $$
DECLARE
    insights JSONB;
    total_offers INTEGER;
    avg_price BIGINT;
    price_range JSONB;
    common_conditions TEXT[];
    avg_closing_days INTEGER;
BEGIN
    -- Get basic statistics
    SELECT 
        COUNT(*),
        AVG(offer_price),
        MIN(offer_price),
        MAX(offer_price),
        AVG(closing_date - CURRENT_DATE)
    INTO total_offers, avg_price, price_range->'min', price_range->'max', avg_closing_days
    FROM offers 
    WHERE property_id = p_property_id AND status != 'rejected';
    
    -- Get common conditions
    SELECT array_agg(DISTINCT unnest(conditions))
    INTO common_conditions
    FROM offers 
    WHERE property_id = p_property_id AND conditions IS NOT NULL;
    
    insights := jsonb_build_object(
        'total_offers', total_offers,
        'average_price', avg_price,
        'price_range', price_range,
        'average_closing_days', avg_closing_days,
        'common_conditions', common_conditions,
        'market_activity', CASE 
            WHEN total_offers >= 5 THEN 'high'
            WHEN total_offers >= 3 THEN 'medium'
            ELSE 'low'
        END
    );
    
    RETURN insights;
END;
$$ LANGUAGE plpgsql;

-- Function to generate negotiation timeline
CREATE OR REPLACE FUNCTION get_negotiation_timeline(p_offer_id UUID)
RETURNS JSONB AS $$
DECLARE
    timeline JSONB := '[]'::jsonb;
    history_record RECORD;
BEGIN
    FOR history_record IN 
        SELECT * FROM offer_history 
        WHERE offer_id = p_offer_id 
        ORDER BY created_at ASC
    LOOP
        timeline := timeline || jsonb_build_object(
            'id', history_record.id,
            'action', history_record.action,
            'actor_role', history_record.actor_role,
            'offer_price', history_record.offer_price,
            'changes', history_record.changes,
            'reason', history_record.reason,
            'created_at', history_record.created_at
        );
    END LOOP;
    
    RETURN timeline;
END;
$$ LANGUAGE plpgsql;

-- Function to create counter offer
CREATE OR REPLACE FUNCTION create_counter_offer(
    p_original_offer_id UUID,
    p_new_price BIGINT,
    p_new_payment_method VARCHAR,
    p_new_closing_date DATE,
    p_new_conditions TEXT[],
    p_reason TEXT
) RETURNS UUID AS $$
DECLARE
    original_offer RECORD;
    new_offer_id UUID;
BEGIN
    -- Get original offer data
    SELECT * INTO original_offer FROM offers WHERE id = p_original_offer_id;
    
    -- Create new offer
    INSERT INTO offers (
        property_id,
        buyer_id,
        offer_price,
        payment_method,
        closing_date,
        conditions,
        status,
        currency,
        exchange_rate
    ) VALUES (
        original_offer.property_id,
        original_offer.buyer_id,
        p_new_price,
        p_new_payment_method,
        p_new_closing_date,
        p_new_conditions,
        'pending',
        original_offer.currency,
        original_offer.exchange_rate
    ) RETURNING id INTO new_offer_id;
    
    -- Create history entry
    INSERT INTO offer_history (
        offer_id,
        version,
        action,
        actor_id,
        actor_role,
        offer_price,
        payment_method,
        closing_date,
        conditions,
        changes,
        reason
    ) VALUES (
        new_offer_id,
        1,
        'countered',
        original_offer.buyer_id,
        'buyer',
        p_new_price,
        p_new_payment_method,
        p_new_closing_date,
        p_new_conditions,
        jsonb_build_object(
            'price_change', p_new_price - original_offer.offer_price,
            'payment_method_change', p_new_payment_method != original_offer.payment_method,
            'closing_date_change', p_new_closing_date != original_offer.closing_date
        ),
        p_reason
    );
    
    RETURN new_offer_id;
END;
$$ LANGUAGE plpgsql;

-- Function to send negotiation notifications
CREATE OR REPLACE FUNCTION send_negotiation_notification(
    p_offer_id UUID,
    p_notification_type VARCHAR,
    p_message TEXT
) RETURNS VOID AS $$
DECLARE
    offer_data RECORD;
    property_data RECORD;
BEGIN
    -- Get offer and property data
    SELECT o.*, p.title as property_title, p.address
    INTO offer_data
    FROM offers o
    JOIN properties p ON o.property_id = p.id
    WHERE o.id = p_offer_id;
    
    -- Here you would integrate with your notification system
    -- For now, we'll just log the notification
    RAISE NOTICE 'Notification: % - % - %', p_notification_type, offer_data.property_title, p_message;
    
    -- In a real implementation, you would:
    -- 1. Insert into a notifications table
    -- 2. Send email/SMS/push notification
    -- 3. Update user dashboard
END;
$$ LANGUAGE plpgsql;

-- Create notification triggers
CREATE OR REPLACE FUNCTION trigger_offer_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Send notification when offer status changes
    IF OLD.status != NEW.status THEN
        CASE NEW.status
            WHEN 'accepted' THEN
                PERFORM send_negotiation_notification(
                    NEW.id,
                    'offer_accepted',
                    'Tu oferta ha sido aceptada!'
                );
            WHEN 'rejected' THEN
                PERFORM send_negotiation_notification(
                    NEW.id,
                    'offer_rejected',
                    'Tu oferta ha sido rechazada. ' || COALESCE(NEW.rejection_reason, '')
                );
        END CASE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications
CREATE TRIGGER trigger_offer_status_notifications
    AFTER UPDATE ON offers
    FOR EACH ROW
    EXECUTE FUNCTION trigger_offer_notifications();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_offers_negotiation_progress ON offers(negotiation_progress);
CREATE INDEX IF NOT EXISTS idx_offers_competitiveness_score ON offers(competitiveness_score);
CREATE INDEX IF NOT EXISTS idx_offers_auto_rejected ON offers(auto_rejected);
CREATE INDEX IF NOT EXISTS idx_offer_history_created_at ON offer_history(created_at);
