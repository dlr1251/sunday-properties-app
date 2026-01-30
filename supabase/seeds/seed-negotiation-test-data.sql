-- ============================================
-- SEED NEGOTIATION TEST DATA - Dedicated Negotiation Testing Data
-- ============================================
-- This file creates comprehensive test data specifically for negotiation functionality testing
-- Run after seed-local.sql to add negotiation-specific test scenarios
-- This file is idempotent - safe to run multiple times

-- ============================================
-- SECTION 1: NEGOTIATIONS WITH VARIOUS STATES
-- ============================================

DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
    user4_id UUID;
    user5_id UUID;
    agent1_id UUID;
    lawyer1_id UUID;
    prop1_id UUID;
    prop2_id UUID;
    prop3_id UUID;
    prop4_id UUID;
    prop5_id UUID;
BEGIN
    -- Get user IDs dynamically
    SELECT id INTO user1_id FROM profiles WHERE email = 'user1@sunday.local' LIMIT 1;
    SELECT id INTO user2_id FROM profiles WHERE email = 'user2@sunday.local' LIMIT 1;
    SELECT id INTO user3_id FROM profiles WHERE email = 'user3@sunday.local' LIMIT 1;
    SELECT id INTO user4_id FROM profiles WHERE email = 'user4@sunday.local' LIMIT 1;
    SELECT id INTO user5_id FROM profiles WHERE email = 'user5@sunday.local' LIMIT 1;
    SELECT id INTO agent1_id FROM profiles WHERE role = 'agent' LIMIT 1;
    SELECT id INTO lawyer1_id FROM profiles WHERE role = 'lawyer' LIMIT 1;

    -- Get property IDs
    SELECT id INTO prop1_id FROM properties ORDER BY created_at LIMIT 1 OFFSET 0;
    SELECT id INTO prop2_id FROM properties ORDER BY created_at LIMIT 1 OFFSET 1;
    SELECT id INTO prop3_id FROM properties ORDER BY created_at LIMIT 1 OFFSET 2;
    SELECT id INTO prop4_id FROM properties ORDER BY created_at LIMIT 1 OFFSET 3;
    SELECT id INTO prop5_id FROM properties ORDER BY created_at LIMIT 1 OFFSET 4;

    -- Only proceed if we have the necessary users and properties
    IF user1_id IS NULL OR prop1_id IS NULL THEN
        RAISE NOTICE 'Skipping negotiation seed: missing users or properties';
        RETURN;
    END IF;

    -- ============================================
    -- NEGOTIATION 1: Active negotiation with multiple offers
    -- ============================================
    INSERT INTO negotiations (
        property_id, buyer_id, seller_id,
        title, status, participants,
        current_price, original_price, target_price,
        created_at, updated_at
    )
    SELECT
        prop1_id, user1_id, p.owner_id,
        'Negociación Activa - Apartamento Ejecutivo',
        'active',
        ARRAY[user1_id, p.owner_id, agent1_id, lawyer1_id],
        620000000, 650000000, 580000000,
        NOW() - INTERVAL '15 days', NOW() - INTERVAL '2 days'
    FROM properties p
    WHERE p.id = prop1_id
    ON CONFLICT DO NOTHING;

    -- ============================================
    -- NEGOTIATION 2: Counter-offer scenario
    -- ============================================
    INSERT INTO negotiations (
        property_id, buyer_id, seller_id,
        title, status, participants,
        current_price, original_price, target_price,
        created_at, updated_at
    )
    SELECT
        prop2_id, user2_id, p.owner_id,
        'Negociación con Contraoferta - Penthouse',
        'active',
        ARRAY[user2_id, p.owner_id],
        1150000000, 1200000000, 1050000000,
        NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day'
    FROM properties p
    WHERE p.id = prop2_id
    ON CONFLICT DO NOTHING;

    -- ============================================
    -- NEGOTIATION 3: Completed negotiation
    -- ============================================
    INSERT INTO negotiations (
        property_id, buyer_id, seller_id,
        title, status, participants,
        current_price, original_price, target_price,
        created_at, updated_at, closed_at
    )
    SELECT
        prop3_id, user3_id, p.owner_id,
        'Negociación Completada - Casa Moderna',
        'closed',
        ARRAY[user3_id, p.owner_id, lawyer1_id],
        1700000000, 1800000000, 1650000000,
        NOW() - INTERVAL '45 days', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'
    FROM properties p
    WHERE p.id = prop3_id
    ON CONFLICT DO NOTHING;

    -- ============================================
    -- NEGOTIATION 4: Cancelled negotiation
    -- ============================================
    INSERT INTO negotiations (
        property_id, buyer_id, seller_id,
        title, status, participants,
        current_price, original_price,
        created_at, updated_at, cancelled_at
    )
    SELECT
        prop4_id, user4_id, p.owner_id,
        'Negociación Cancelada - Apartamento Medellín',
        'cancelled',
        ARRAY[user4_id, p.owner_id],
        440000000, 450000000,
        NOW() - INTERVAL '25 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'
    FROM properties p
    WHERE p.id = prop4_id
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Created test negotiations with various states';
END $$;

-- ============================================
-- SECTION 2: OFFERS WITH DIFFERENT SCENARIOS
-- ============================================

DO $$
DECLARE
    neg1_id UUID;
    neg2_id UUID;
    neg3_id UUID;
    neg4_id UUID;
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
    user4_id UUID;
BEGIN
    -- Get negotiation IDs
    SELECT id INTO neg1_id FROM negotiations WHERE title LIKE '%Apartamento Ejecutivo%' LIMIT 1;
    SELECT id INTO neg2_id FROM negotiations WHERE title LIKE '%Penthouse%' LIMIT 1;
    SELECT id INTO neg3_id FROM negotiations WHERE title LIKE '%Casa Moderna%' LIMIT 1;
    SELECT id INTO neg4_id FROM negotiations WHERE title LIKE '%Apartamento Medellín%' LIMIT 1;

    -- Get user IDs
    SELECT id INTO user1_id FROM profiles WHERE email = 'user1@sunday.local' LIMIT 1;
    SELECT id INTO user2_id FROM profiles WHERE email = 'user2@sunday.local' LIMIT 1;
    SELECT id INTO user3_id FROM profiles WHERE email = 'user3@sunday.local' LIMIT 1;
    SELECT id INTO user4_id FROM profiles WHERE email = 'user4@sunday.local' LIMIT 1;

    IF neg1_id IS NOT NULL AND user1_id IS NOT NULL THEN
        -- ============================================
        -- OFFERS FOR NEGOTIATION 1 (Active with multiple offers)
        -- ============================================

        -- Initial offer
        INSERT INTO offers (
            property_id, buyer_id, negotiation_id,
            offer_price, original_price,
            payment_method, closing_date,
            status, expires_at,
            created_at, updated_at
        )
        SELECT
            n.property_id, user1_id, neg1_id,
            620000000, 650000000,
            'cash', (CURRENT_DATE + INTERVAL '60 days')::date,
            'pending', NOW() + INTERVAL '7 days',
            NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
        FROM negotiations n
        WHERE n.id = neg1_id
        ON CONFLICT DO NOTHING;

        -- Counter offer from seller
        INSERT INTO offers (
            property_id, buyer_id, negotiation_id,
            offer_price, original_price,
            payment_method, closing_date,
            status, expires_at,
            created_at, updated_at
        )
        SELECT
            n.property_id, user1_id, neg1_id,
            640000000, 650000000,
            'cash', (CURRENT_DATE + INTERVAL '45 days')::date,
            'counter_offer', NOW() + INTERVAL '5 days',
            NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'
        FROM negotiations n
        WHERE n.id = neg1_id
        ON CONFLICT DO NOTHING;

        -- Buyer's response to counter
        INSERT INTO offers (
            property_id, buyer_id, negotiation_id,
            offer_price, original_price,
            payment_method, closing_date,
            status, expires_at,
            created_at, updated_at
        )
        SELECT
            n.property_id, user1_id, neg1_id,
            630000000, 650000000,
            'mortgage', (CURRENT_DATE + INTERVAL '75 days')::date,
            'pending', NOW() + INTERVAL '3 days',
            NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
        FROM negotiations n
        WHERE n.id = neg1_id
        ON CONFLICT DO NOTHING;
    END IF;

    IF neg2_id IS NOT NULL AND user2_id IS NOT NULL THEN
        -- ============================================
        -- OFFERS FOR NEGOTIATION 2 (Counter-offer scenario)
        -- ============================================

        INSERT INTO offers (
            property_id, buyer_id, negotiation_id,
            offer_price, original_price,
            payment_method, closing_date,
            status, expires_at,
            created_at, updated_at
        )
        SELECT
            n.property_id, user2_id, neg2_id,
            1150000000, 1200000000,
            'cash', (CURRENT_DATE + INTERVAL '90 days')::date,
            'counter_offer', NOW() + INTERVAL '10 days',
            NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'
        FROM negotiations n
        WHERE n.id = neg2_id
        ON CONFLICT DO NOTHING;
    END IF;

    IF neg3_id IS NOT NULL AND user3_id IS NOT NULL THEN
        -- ============================================
        -- OFFERS FOR NEGOTIATION 3 (Completed)
        -- ============================================

        INSERT INTO offers (
            property_id, buyer_id, negotiation_id,
            offer_price, original_price,
            payment_method, closing_date,
            status, expires_at,
            created_at, updated_at, accepted_at
        )
        SELECT
            n.property_id, user3_id, neg3_id,
            1700000000, 1800000000,
            'cash', (CURRENT_DATE + INTERVAL '30 days')::date,
            'accepted', NOW() - INTERVAL '30 days',
            NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days', NOW() - INTERVAL '30 days'
        FROM negotiations n
        WHERE n.id = neg3_id
        ON CONFLICT DO NOTHING;
    END IF;

    IF neg4_id IS NOT NULL AND user4_id IS NOT NULL THEN
        -- ============================================
        -- OFFERS FOR NEGOTIATION 4 (Cancelled)
        -- ============================================

        INSERT INTO offers (
            property_id, buyer_id, negotiation_id,
            offer_price, original_price,
            payment_method, closing_date,
            status, expires_at,
            created_at, updated_at
        )
        SELECT
            n.property_id, user4_id, neg4_id,
            440000000, 450000000,
            'mortgage', (CURRENT_DATE + INTERVAL '60 days')::date,
            'cancelled', NOW() - INTERVAL '20 days',
            NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'
        FROM negotiations n
        WHERE n.id = neg4_id
        ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE 'Created test offers for negotiations';
END $$;

-- ============================================
-- SECTION 3: NEGOTIATION DOCUMENTS
-- ============================================

DO $$
DECLARE
    neg1_id UUID;
    neg2_id UUID;
    neg3_id UUID;
BEGIN
    -- Get negotiation IDs
    SELECT id INTO neg1_id FROM negotiations WHERE title LIKE '%Apartamento Ejecutivo%' LIMIT 1;
    SELECT id INTO neg2_id FROM negotiations WHERE title LIKE '%Penthouse%' LIMIT 1;
    SELECT id INTO neg3_id FROM negotiations WHERE title LIKE '%Casa Moderna%' LIMIT 1;

    -- Create documents for active negotiations
    IF neg1_id IS NOT NULL THEN
        INSERT INTO negotiation_documents (
            negotiation_id, kind, content, version, created_at
        )
        VALUES
        (
            neg1_id,
            'promise_of_sale',
            '{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1}, "content": [{"type": "text", "text": "PROMESA DE COMPRAVENTA"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "Entre las partes identificadas, se acuerda la compraventa del inmueble ubicado en Calle 67 #12-34, Chapinero, Bogotá, por el valor de $620.000.000 COP."}]}]}',
            1,
            NOW() - INTERVAL '8 days'
        ),
        (
            neg1_id,
            'valuation_report',
            '{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1}, "content": [{"type": "text", "text": "INFORME DE AVALUO"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "Avalúo comercial del inmueble: $680.000.000 COP. Avalúo catastral: $650.000.000 COP."}]}]}',
            1,
            NOW() - INTERVAL '12 days'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    IF neg2_id IS NOT NULL THEN
        INSERT INTO negotiation_documents (
            negotiation_id, kind, content, version, created_at
        )
        VALUES
        (
            neg2_id,
            'promise_of_sale',
            '{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1}, "content": [{"type": "text", "text": "PROMESA DE COMPRAVENTA - PENTHOUSE"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "Negociación del penthouse en Zona G, Bogotá, por $1.150.000.000 COP."}]}]}',
            1,
            NOW() - INTERVAL '18 days'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    IF neg3_id IS NOT NULL THEN
        INSERT INTO negotiation_documents (
            negotiation_id, kind, content, version, created_at
        )
        VALUES
        (
            neg3_id,
            'final_contract',
            '{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1}, "content": [{"type": "text", "text": "ESCRITURA PÚBLICA DEFINITIVA"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "Escritura pública de compraventa perfeccionada el "}' || to_char(NOW() - INTERVAL '30 days', 'DD/MM/YYYY') || '{"type": "text", "text": "."}]}]}',
            1,
            NOW() - INTERVAL '30 days'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE 'Created test documents for negotiations';
END $$;

-- ============================================
-- SECTION 4: NEGOTIATION ACTIONS TIMELINE
-- ============================================

DO $$
DECLARE
    neg1_id UUID;
    neg2_id UUID;
    neg3_id UUID;
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
    agent1_id UUID;
    lawyer1_id UUID;
BEGIN
    -- Get IDs
    SELECT id INTO neg1_id FROM negotiations WHERE title LIKE '%Apartamento Ejecutivo%' LIMIT 1;
    SELECT id INTO neg2_id FROM negotiations WHERE title LIKE '%Penthouse%' LIMIT 1;
    SELECT id INTO neg3_id FROM negotiations WHERE title LIKE '%Casa Moderna%' LIMIT 1;
    SELECT id INTO user1_id FROM profiles WHERE email = 'user1@sunday.local' LIMIT 1;
    SELECT id INTO user2_id FROM profiles WHERE email = 'user2@sunday.local' LIMIT 1;
    SELECT id INTO user3_id FROM profiles WHERE email = 'user3@sunday.local' LIMIT 1;
    SELECT id INTO agent1_id FROM profiles WHERE role = 'agent' LIMIT 1;
    SELECT id INTO lawyer1_id FROM profiles WHERE role = 'lawyer' LIMIT 1;

    -- Create timeline actions for negotiation 1
    IF neg1_id IS NOT NULL AND user1_id IS NOT NULL THEN
        INSERT INTO negotiation_actions (
            negotiation_id, user_id, action_type,
            metadata, created_at
        )
        VALUES
        (
            neg1_id, user1_id, 'offer_created',
            '{"offer_price": 620000000, "payment_method": "cash"}',
            NOW() - INTERVAL '10 days'
        ),
        (
            neg1_id, agent1_id, 'counter_offer',
            '{"offer_price": 640000000, "reason": "Precio por encima del mercado"}',
            NOW() - INTERVAL '8 days'
        ),
        (
            neg1_id, user1_id, 'offer_updated',
            '{"offer_price": 630000000, "payment_method": "mortgage"}',
            NOW() - INTERVAL '5 days'
        ),
        (
            neg1_id, lawyer1_id, 'document_uploaded',
            '{"document_type": "promise_of_sale", "version": 1}',
            NOW() - INTERVAL '8 days'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    -- Create timeline actions for negotiation 2
    IF neg2_id IS NOT NULL AND user2_id IS NOT NULL THEN
        INSERT INTO negotiation_actions (
            negotiation_id, user_id, action_type,
            metadata, created_at
        )
        VALUES
        (
            neg2_id, user2_id, 'negotiation_started',
            '{"initial_price": 1200000000}',
            NOW() - INTERVAL '20 days'
        ),
        (
            neg2_id, user2_id, 'offer_created',
            '{"offer_price": 1150000000}',
            NOW() - INTERVAL '15 days'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    -- Create timeline actions for negotiation 3
    IF neg3_id IS NOT NULL AND user3_id IS NOT NULL THEN
        INSERT INTO negotiation_actions (
            negotiation_id, user_id, action_type,
            metadata, created_at
        )
        VALUES
        (
            neg3_id, user3_id, 'offer_accepted',
            '{"final_price": 1700000000}',
            NOW() - INTERVAL '30 days'
        ),
        (
            neg3_id, lawyer1_id, 'contract_signed',
            '{"document_type": "final_contract"}',
            NOW() - INTERVAL '30 days'
        ),
        (
            neg3_id, lawyer1_id, 'negotiation_closed',
            '{"reason": "successful_completion"}',
            NOW() - INTERVAL '30 days'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE 'Created negotiation timeline actions';
END $$;

-- ============================================
-- SECTION 5: NEGOTIATION REPORTS
-- ============================================

DO $$
DECLARE
    neg1_id UUID;
    neg2_id UUID;
    neg3_id UUID;
BEGIN
    -- Get negotiation IDs
    SELECT id INTO neg1_id FROM negotiations WHERE title LIKE '%Apartamento Ejecutivo%' LIMIT 1;
    SELECT id INTO neg2_id FROM negotiations WHERE title LIKE '%Penthouse%' LIMIT 1;
    SELECT id INTO neg3_id FROM negotiations WHERE title LIKE '%Casa Moderna%' LIMIT 1;

    -- Create reports for negotiations
    IF neg1_id IS NOT NULL THEN
        INSERT INTO negotiation_reports (
            negotiation_id, report_type, data, created_at
        )
        VALUES
        (
            neg1_id,
            'progress_report',
            '{"progress_percentage": 75, "days_active": 15, "offers_count": 3, "current_price": 630000000, "target_achievement": "85%"}',
            NOW() - INTERVAL '2 days'
        ),
        (
            neg1_id,
            'competitiveness_analysis',
            '{"market_position": "strong", "competitor_offers": 2, "buyer_motivation": "high", "seller_motivation": "medium"}',
            NOW() - INTERVAL '5 days'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    IF neg2_id IS NOT NULL THEN
        INSERT INTO negotiation_reports (
            negotiation_id, report_type, data, created_at
        )
        VALUES
        (
            neg2_id,
            'progress_report',
            '{"progress_percentage": 60, "days_active": 20, "offers_count": 1, "current_price": 1150000000, "target_achievement": "92%"}',
            NOW() - INTERVAL '1 day'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    IF neg3_id IS NOT NULL THEN
        INSERT INTO negotiation_reports (
            negotiation_id, report_type, data, created_at
        )
        VALUES
        (
            neg3_id,
            'closing_report',
            '{"final_price": 1700000000, "negotiation_duration_days": 15, "total_offers": 1, "success_rate": "100%", "closing_date": "' || to_char(NOW() - INTERVAL '30 days', 'YYYY-MM-DD') || '"}',
            NOW() - INTERVAL '30 days'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE 'Created negotiation reports';
END $$;

-- ============================================
-- SEED NEGOTIATION TEST DATA COMPLETED
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Negotiation test data seeded successfully!';
    RAISE NOTICE 'Created negotiations with various states, offers, documents, actions, and reports.';
END $$;
