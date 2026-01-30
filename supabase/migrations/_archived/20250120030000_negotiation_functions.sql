-- Create functions for offer validation and progress calculation

-- Function to validate offer against rules
CREATE OR REPLACE FUNCTION validate_offer_against_rules(
    p_property_id UUID,
    p_offer_price BIGINT,
    p_payment_method VARCHAR,
    p_closing_date DATE
) RETURNS JSONB AS $$
DECLARE
    rules RECORD;
    validation_result JSONB;
BEGIN
    SELECT * INTO rules FROM negotiation_rules WHERE property_id = p_property_id;
    
    IF rules IS NULL THEN
        RETURN jsonb_build_object('valid', true);
    END IF;
    
    -- Validate price
    IF rules.min_price IS NOT NULL AND p_offer_price < rules.min_price THEN
        RETURN jsonb_build_object(
            'valid', false,
            'reason', 'Precio mínimo no alcanzado',
            'min_required', rules.min_price
        );
    END IF;
    
    -- Validate closing date
    IF rules.max_closing_days IS NOT NULL AND 
       (p_closing_date - CURRENT_DATE) > rules.max_closing_days THEN
        RETURN jsonb_build_object(
            'valid', false,
            'reason', 'Plazo de cierre excede el máximo permitido',
            'max_days', rules.max_closing_days
        );
    END IF;
    
    -- Validate payment method
    IF rules.required_payment_methods IS NOT NULL AND 
       NOT (p_payment_method = ANY(rules.required_payment_methods)) THEN
        RETURN jsonb_build_object(
            'valid', false,
            'reason', 'Método de pago no aceptado',
            'accepted_methods', rules.required_payment_methods
        );
    END IF;
    
    RETURN jsonb_build_object('valid', true);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate negotiation progress
CREATE OR REPLACE FUNCTION calculate_negotiation_progress(p_offer_id UUID)
RETURNS INTEGER AS $$
DECLARE
    offer RECORD;
    progress INTEGER := 0;
    milestones JSONB;
BEGIN
    SELECT * INTO offer FROM offers WHERE id = p_offer_id;
    milestones := COALESCE(offer.milestones_completed, '{}'::jsonb);
    
    -- Milestone weights (total 100%)
    IF (milestones->>'offer_sent')::boolean THEN progress := progress + 20; END IF;
    IF (milestones->>'visit_completed')::boolean THEN progress := progress + 15; END IF;
    IF (milestones->>'price_agreed')::boolean THEN progress := progress + 25; END IF;
    IF (milestones->>'payment_agreed')::boolean THEN progress := progress + 15; END IF;
    IF (milestones->>'closing_date_agreed')::boolean THEN progress := progress + 10; END IF;
    IF (milestones->>'conditions_agreed')::boolean THEN progress := progress + 10; END IF;
    IF offer.status = 'accepted' THEN progress := progress + 5; END IF;
    
    RETURN progress;
END;
$$ LANGUAGE plpgsql;

-- Function to get advisory for context
CREATE OR REPLACE FUNCTION get_advisory_for_context(
    p_context VARCHAR,
    p_user_role VARCHAR,
    p_property_type VARCHAR DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    advisory_data JSONB;
BEGIN
    -- Simulate AI-generated advisory based on context
    advisory_data := jsonb_build_object(
        'context', p_context,
        'advice', CASE 
            WHEN p_context = 'offer_creation' THEN
                jsonb_build_object(
                    'title', 'Consejos para crear una oferta competitiva',
                    'content', 'Asegúrate de incluir un precio competitivo, método de pago claro y plazo de cierre realista.',
                    'level', 'fundamental'
                )
            WHEN p_context = 'price_negotiation' THEN
                jsonb_build_object(
                    'title', 'Estrategias de negociación de precio',
                    'content', 'Considera el valor de mercado, estado de la propiedad y condiciones del comprador.',
                    'level', 'best_practices'
                )
            WHEN p_context = 'legal_considerations' THEN
                jsonb_build_object(
                    'title', 'Aspectos legales importantes',
                    'content', 'Verifica la documentación legal, estudios de título y permisos necesarios.',
                    'level', 'advanced'
                )
            ELSE
                jsonb_build_object(
                    'title', 'Asesoría general',
                    'content', 'Consulta con un profesional para obtener orientación específica.',
                    'level', 'fundamental'
                )
        END,
        'timestamp', NOW()
    );
    
    RETURN advisory_data;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate offer net efficiency index
CREATE OR REPLACE FUNCTION get_offer_net_efficiency_index(
    p_offer_id UUID
) RETURNS DECIMAL AS $$
DECLARE
    offer RECORD;
    property RECORD;
    net_value DECIMAL;
    closing_days INTEGER;
    efficiency_index DECIMAL;
BEGIN
    SELECT * INTO offer FROM offers WHERE id = p_offer_id;
    SELECT * INTO property FROM properties WHERE id = offer.property_id;
    
    -- Calculate net value (considering taxes and fees)
    net_value := offer.price * 0.95; -- Assuming 5% in taxes/fees
    
    -- Calculate closing days
    closing_days := EXTRACT(DAYS FROM (offer.closing_date - CURRENT_DATE));
    
    -- Calculate efficiency index (net value / closing days)
    IF closing_days > 0 THEN
        efficiency_index := net_value / closing_days;
    ELSE
        efficiency_index := 0;
    END IF;
    
    RETURN efficiency_index;
END;
$$ LANGUAGE plpgsql;
