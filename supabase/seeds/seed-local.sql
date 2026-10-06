-- ============================================
-- SEED LOCAL - Consolidated Seed File
-- ============================================
-- This is the main seed file for local development
-- Run after creating auth users via: node scripts/seed-users.mjs
-- This file is idempotent - safe to run multiple times

-- ============================================
-- SECTION 1: PROFILES
-- ============================================
-- Update profiles with correct roles and verification status
-- Note: Users are created via scripts/seed-users.mjs, this just updates their profiles

INSERT INTO public.profiles (id, email, full_name, role, status, verification_status)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email),
    CASE
        WHEN au.email = 'superadmin@sunday.local' THEN 'super_admin'
        WHEN au.email IN ('admin@sunday.local', 'admin1@sunday.local') THEN 'admin'
        WHEN au.email IN ('lawyer1@sunday.local', 'lawyer2@sunday.local', 'lawyer3@sunday.local') THEN 'lawyer'
        WHEN au.email IN ('agent1@sunday.local', 'agent2@sunday.local', 'agent3@sunday.local', 'agent4@sunday.local') THEN 'agent'
        ELSE 'user'
    END,
    'active',
    CASE
        WHEN au.email IN (
            'superadmin@sunday.local', 'admin@sunday.local', 'admin1@sunday.local',
            'lawyer1@sunday.local', 'lawyer2@sunday.local', 'lawyer3@sunday.local',
            'agent1@sunday.local', 'agent2@sunday.local', 'agent3@sunday.local', 'agent4@sunday.local'
        ) THEN 'verified'
        ELSE 'unverified'
    END
FROM auth.users au
WHERE au.email LIKE '%@sunday.local'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    verification_status = EXCLUDED.verification_status;

-- ============================================
-- SECTION 2: PROPERTIES
-- ============================================
-- Seed properties assigned to regular users only
-- Uses dynamic user IDs - no hardcoded UUIDs

DO $$
DECLARE
    regular_user_ids UUID[];
    user_count INTEGER;
    property_count INTEGER := 0;
    agent_ids UUID[];
    agent_count INTEGER;
BEGIN
    -- Get all regular user IDs
    SELECT ARRAY_AGG(id ORDER BY created_at) INTO regular_user_ids
    FROM profiles
    WHERE role = 'user' AND status = 'active';
    
    SELECT COUNT(*) INTO user_count 
    FROM profiles 
    WHERE role = 'user' AND status = 'active';
    
    IF user_count = 0 THEN
        RAISE NOTICE 'No regular users found. Skipping property seeding.';
        RETURN;
    END IF;
    
    -- Get agent IDs for agent_id assignment
    SELECT ARRAY_AGG(id ORDER BY created_at) INTO agent_ids
    FROM profiles
    WHERE role = 'agent' AND status = 'active'
    LIMIT 4;
    
    agent_count := COALESCE(array_length(agent_ids, 1), 0);
    
    -- Insert properties only if they don't already exist
    IF NOT EXISTS (SELECT 1 FROM properties LIMIT 1) THEN
        INSERT INTO public.properties (
            title, description, address, neighborhood, city, coordinates,
            bedrooms, bathrooms, area, parking, property_type, strata,
            price, minimum_offer_price, monthly_costs, owner_id, agent_id,
            status, verified, images, features, created_at, updated_at, published_at,
            listing_type, rent_monthly, lease_term_months, deposit, admin_fee, utilities_included, pets_policy
        ) VALUES
        -- MINIMAL TEST PROPERTIES (reduced for real data focus)
        -- Keep only 2 minimal demo properties for testing flows (negotiation, visits, etc.)
        (
            'Apartamento Moderno en El Poblado',
            'Hermoso apartamento moderno de 3 habitaciones con vista panorámica al Parque Lleras. Acabados de lujo, cocina integral, zona de lavandería, closets empotrados. (Demo de prueba)',
            'Carrera 43A #15-25, Apto 1202', 'El Poblado', 'Medellín',
            '{"lat": 6.2091, "lng": -75.5678}'::jsonb,
            3, 2, 85, 1, 'apartment', 4,
            450000000, 420000000, 280000,
            regular_user_ids[1],
            CASE WHEN agent_count > 0 THEN agent_ids[1] ELSE NULL END,
            'published', true,
            ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
            ARRAY['Gimnasio', 'Piscina', 'Portería 24/7', 'Ascensor'],
            NOW() - INTERVAL '20 days', NOW(), NOW() - INTERVAL '15 days',
            'sale', NULL, NULL, NULL, NULL, ARRAY[]::text[], NULL
        ),
        (
            'Casa Demo Arriendo - Prueba',
            'Propiedad de prueba para flujos de arriendo. (Demo mínima)',
            'Calle 70 #45-20', 'Laureles', 'Medellín',
            '{"lat": 6.2458, "lng": -75.5942}'::jsonb,
            3, 2, 120, 1, 'house', 3,
            NULL, NULL, 150000,
            regular_user_ids[2 % user_count + 1],
            CASE WHEN agent_count > 0 THEN agent_ids[2 % agent_count + 1] ELSE NULL END,
            'published', true,
            ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
            ARRAY['Jardín', 'Zona BBQ'],
            NOW() - INTERVAL '10 days', NOW(), NOW() - INTERVAL '8 days',
            'rental', 2800000, 12, 5600000, 280000, ARRAY['Administración']::text[], 'Mascotas pequeñas permitidas'
        );
        
        GET DIAGNOSTICS property_count = ROW_COUNT;
        RAISE NOTICE 'Inserted % minimal test properties', property_count;
    ELSE
        RAISE NOTICE 'Properties already exist. Skipping property insertion.';
    END IF;
END $$;

-- ============================================
-- REAL PROPERTIES (Lauret / Campo Nuevo rentals + Peter Pitchler sale)
-- ============================================
-- These are the production/real properties the user wants to promote.
-- They use listing_type correctly and reference real legal docs from ai_food/.
-- Idempotent: skips if title already exists.
-- Runs always (even if other properties exist), assigned to first available regular users.

DO $$
DECLARE
    v_owner_id UUID;
    v_agent_id UUID;
    v_real_count INTEGER := 0;
BEGIN
    -- Pick first regular user as owner for real props (in real use, you can reassign via UI or specific seed)
    SELECT id INTO v_owner_id FROM profiles WHERE role = 'user' AND status = 'active' ORDER BY created_at LIMIT 1;
    SELECT id INTO v_agent_id FROM profiles WHERE role = 'agent' AND status = 'active' ORDER BY created_at LIMIT 1;

    IF v_owner_id IS NULL THEN
        RAISE NOTICE 'No regular user found. Skipping real properties seed.';
        RETURN;
    END IF;

    -- 1. Rental - Lauret / Laureles
    IF NOT EXISTS (SELECT 1 FROM properties WHERE title = 'Casa Lauret - Arriendo en Laureles') THEN
        INSERT INTO public.properties (
            title, description, address, neighborhood, city, coordinates,
            bedrooms, bathrooms, area, parking, property_type, strata,
            price, owner_id, agent_id, status, verified, premium,
            images, legal_documents, features,
            listing_type, rent_monthly, lease_term_months, deposit, admin_fee, utilities_included, pets_policy,
            visit_price, created_at, updated_at, published_at
        ) VALUES (
            'Casa Lauret - Arriendo en Laureles',
            'Hermosa casa en el corazón de Laureles, ideal para familias o ejecutivos que buscan comodidad y excelente ubicación. Incluye jardín privado, zona de parrilla y fácil acceso a parques, restaurantes y transporte público. Documentos legales completos disponibles (CLYT, Paz y Salvo, etc.). Contrato de arrendamiento estándar con opción de renovación.',
            'Calle 70 # 45-20, Laureles', 'Laureles', 'Medellín',
            '{"lat": 6.2458, "lng": -75.5942}'::jsonb,
            4, 3, 220, 2, 'house', 4,
            NULL, v_owner_id, v_agent_id, 'published', true, true,
            ARRAY['/ai_food/jpeg/vista_1.jpeg', '/ai_food/jpeg/vista_2.jpeg', '/ai_food/jpeg/vista_3.jpeg'],
            ARRAY['/ai_food/CLYT_CASA_BQLLA_DOÑA_ELCY.pdf', '/ai_food/PAZ_Y_SALVO_ADMINISTRACION_ZOCALO_APTO_31_JAN_2025.jpeg'],
            ARRAY['Jardín', 'Zona BBQ', 'Parqueadero', 'Seguridad'],
            'rental', 5200000, 12, 10400000, 520000, ARRAY['Administración']::text[], 'Se permiten mascotas pequeñas con depósito adicional',
            49000,
            NOW() - INTERVAL '5 days', NOW(), NOW() - INTERVAL '4 days'
        );
        v_real_count := v_real_count + 1;
        RAISE NOTICE 'Inserted real rental: Casa Lauret - Arriendo en Laureles';
    END IF;

    -- 2. Rental - Campo Nuevo
    IF NOT EXISTS (SELECT 1 FROM properties WHERE title = 'Apartamento Campo Nuevo - Arriendo') THEN
        INSERT INTO public.properties (
            title, description, address, neighborhood, city, coordinates,
            bedrooms, bathrooms, area, parking, property_type, strata,
            price, owner_id, agent_id, status, verified, premium,
            images, legal_documents, features,
            listing_type, rent_monthly, lease_term_months, deposit, admin_fee, utilities_included, pets_policy,
            visit_price, created_at, updated_at, published_at
        ) VALUES (
            'Apartamento Campo Nuevo - Arriendo',
            'Moderno apartamento en Campo Nuevo con excelente iluminación natural y acabados de primera. Ideal para parejas o profesionales que buscan un espacio funcional, seguro y bien conectado. Incluye parqueadero, depósito y acceso controlado. Se entrega con contrato de arrendamiento claro y respaldo legal completo (CLYT actualizado).',
            'Carrera 80 # 32-15, Campo Nuevo', 'Campo Nuevo', 'Medellín',
            '{"lat": 6.175, "lng": -75.58}'::jsonb,
            2, 2, 78, 1, 'apartment', 3,
            NULL, v_owner_id, v_agent_id, 'published', true, false,
            ARRAY['/ai_food/jpeg/vista_10.jpeg', '/ai_food/jpeg/vista_11.jpeg'],
            ARRAY['/ai_food/CLYT_APTO_POBLADO_MI_001-1429919_17_OCT_2025_ANGELA_LAMBARRI.pdf'],
            ARRAY['Ascensor', 'Portería 24h', 'Parqueadero'],
            'rental', 2450000, 12, 4900000, 245000, ARRAY[]::text[], 'No se permiten mascotas',
            49000,
            NOW() - INTERVAL '3 days', NOW(), NOW() - INTERVAL '2 days'
        );
        v_real_count := v_real_count + 1;
        RAISE NOTICE 'Inserted real rental: Apartamento Campo Nuevo - Arriendo';
    END IF;

    -- 3. Sale - Peter Pitchler
    IF NOT EXISTS (SELECT 1 FROM properties WHERE title = 'Propiedad Peter Pitchler - Venta') THEN
        INSERT INTO public.properties (
            title, description, address, neighborhood, city, coordinates,
            bedrooms, bathrooms, area, parking, property_type, strata,
            price, minimum_offer_price, owner_id, agent_id, status, verified, premium,
            images, legal_documents, features,
            listing_type, visit_price, accepts_crypto, financing,
            created_at, updated_at, published_at
        ) VALUES (
            'Propiedad Peter Pitchler - Venta',
            'Excelente oportunidad de inversión o vivienda propia. Propiedad bien ubicada con alto potencial de valorización. Documentación en regla (CLYT, escrituras, paz y salvos). Ideal para compradores que buscan transparencia y un proceso ágil con acompañamiento legal. Precio negociable para compradores serios.',
            'Calle 10A # 43-55, El Poblado', 'El Poblado', 'Medellín',
            '{"lat": 6.2091, "lng": -75.5678}'::jsonb,
            3, 2, 95, 1, 'apartment', 5,
            720000000, 680000000, v_owner_id, v_agent_id, 'published', true, true,
            ARRAY['/ai_food/jpeg/vista_20.jpeg', '/ai_food/jpeg/vista_21.jpeg', '/ai_food/jpeg/vista_22.jpeg'],
            ARRAY['/ai_food/CLTYD_APTO_ED_ZOCALO_04_FEB_2025_DOLF_ANDRINGA.pdf', '/ai_food/EP_COMPRAVENTA_ZOCALO_04_FEB_2013_DOLF_ANDRINGA.pdf'],
            ARRAY['Piscina', 'Gimnasio', 'Vista', 'Seguridad 24h'],
            'sale', 49000, false, true,
            NOW() - INTERVAL '7 days', NOW(), NOW() - INTERVAL '6 days'
        );
        v_real_count := v_real_count + 1;
        RAISE NOTICE 'Inserted real sale: Propiedad Peter Pitchler - Venta';
    END IF;

    RAISE NOTICE 'Real properties seeded: % new', v_real_count;
END $$;

-- Minimal availability for the real rental properties (so visits can be scheduled in demo)
DO $$
DECLARE
    lauret_id UUID;
    campo_id UUID;
BEGIN
    SELECT id INTO lauret_id FROM properties WHERE title = 'Casa Lauret - Arriendo en Laureles' LIMIT 1;
    SELECT id INTO campo_id FROM properties WHERE title = 'Apartamento Campo Nuevo - Arriendo' LIMIT 1;

    IF lauret_id IS NOT NULL THEN
        INSERT INTO property_availability (property_id, day_of_week, start_time, end_time, is_available)
        VALUES 
            (lauret_id, 1, '09:00', '12:00', true),
            (lauret_id, 1, '14:00', '18:00', true),
            (lauret_id, 3, '09:00', '12:00', true),
            (lauret_id, 5, '14:00', '18:00', true)
        ON CONFLICT DO NOTHING;
    END IF;

    IF campo_id IS NOT NULL THEN
        INSERT INTO property_availability (property_id, day_of_week, start_time, end_time, is_available)
        VALUES 
            (campo_id, 2, '10:00', '13:00', true),
            (campo_id, 4, '15:00', '19:00', true),
            (campo_id, 6, '09:00', '12:00', true)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================
-- SECTION 3: REASSIGN PROPERTIES TO REGULAR USERS
-- ============================================
-- Ensure all properties are owned by regular users (not admins, lawyers, agents)

DO $$
DECLARE
    regular_user_count INTEGER;
    reassigned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO regular_user_count
    FROM profiles
    WHERE role = 'user' AND status = 'active';
    
    IF regular_user_count = 0 THEN
        RETURN;
    END IF;
    
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
    IF reassigned_count > 0 THEN
        RAISE NOTICE 'Reassigned % properties to regular users', reassigned_count;
    END IF;
END $$;

-- ============================================
-- SECTION 4: NEGOTIATIONS TEST DATA
-- ============================================
-- Create test negotiations using dynamic user IDs

DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
    prop1_id UUID;
    prop2_id UUID;
    neg1_id UUID;
    neg2_id UUID;
BEGIN
    -- Get user IDs dynamically
    SELECT id INTO user1_id FROM profiles WHERE email = 'user1@sunday.local' LIMIT 1;
    SELECT id INTO user2_id FROM profiles WHERE email = 'user2@sunday.local' LIMIT 1;
    SELECT id INTO user3_id FROM profiles WHERE email = 'user3@sunday.local' LIMIT 1;
    
    -- Get property IDs
    SELECT id INTO prop1_id FROM properties ORDER BY created_at LIMIT 1;
    SELECT id INTO prop2_id FROM properties ORDER BY created_at OFFSET 1 LIMIT 1;
    
    -- Only create negotiations if users and properties exist
    IF user1_id IS NOT NULL AND user2_id IS NOT NULL AND prop1_id IS NOT NULL THEN
        -- Create negotiation 1 if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM negotiations 
            WHERE buyer_id = user1_id 
            AND seller_id = user2_id 
            AND property_id = prop1_id
            LIMIT 1
        ) THEN
            INSERT INTO negotiations (
                property_id, buyer_id, seller_id, 
                title, status, participants,
                current_price, original_price,
                created_at
            )
            SELECT 
                prop1_id, user1_id, p.owner_id,
                'Negociación - ' || p.title,
                'active',
                ARRAY[user1_id, p.owner_id],
                p.price, p.price,
                NOW()
            FROM properties p
            WHERE p.id = prop1_id
            RETURNING id INTO neg1_id;
            
            RAISE NOTICE 'Created negotiation 1: %', neg1_id;
        END IF;
    END IF;
    
    -- Create negotiation 2 if users and properties exist
    IF user2_id IS NOT NULL AND user3_id IS NOT NULL AND prop2_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM negotiations 
            WHERE buyer_id = user2_id 
            AND property_id = prop2_id
            LIMIT 1
        ) THEN
            INSERT INTO negotiations (
                property_id, buyer_id, seller_id,
                title, status, participants,
                current_price, original_price,
                created_at
            )
            SELECT 
                prop2_id, user2_id, p.owner_id,
                'Negociación - ' || p.title,
                'active',
                ARRAY[user2_id, p.owner_id],
                p.price, p.price,
                NOW()
            FROM properties p
            WHERE p.id = prop2_id
            RETURNING id INTO neg2_id;
            
            RAISE NOTICE 'Created negotiation 2: %', neg2_id;
        END IF;
    END IF;
END $$;

-- ============================================
-- SECTION 5: NEGOTIATION OFFERS TEST DATA (negotiation_offers table)
-- ============================================
-- Create test offers within negotiations with parent-child chains

DO $$
DECLARE
    neg_id UUID;
    buyer_id UUID;
    seller_id UUID;
    prop_id UUID;
    prop_price BIGINT;
    offer1_id UUID;
    offer2_id UUID;
    offer3_id UUID;
BEGIN
    -- Get first active negotiation
    SELECT n.id, n.buyer_id, n.seller_id, n.property_id, p.price
    INTO neg_id, buyer_id, seller_id, prop_id, prop_price
    FROM negotiations n
    JOIN properties p ON p.id = n.property_id
    WHERE n.status = 'active'
    LIMIT 1;
    
    IF neg_id IS NOT NULL AND buyer_id IS NOT NULL AND seller_id IS NOT NULL AND prop_price IS NOT NULL THEN
        -- Create negotiation_offers if they don't exist for this negotiation
        IF NOT EXISTS (
            SELECT 1 FROM negotiation_offers 
            WHERE negotiation_id = neg_id 
            LIMIT 1
        ) THEN
            -- Offer 1: Initial offer from buyer
            INSERT INTO negotiation_offers (
                negotiation_id,
                author,
                payload,
                status,
                version,
                kind,
                parent_offer_id,
                author_role,
                price,
                payment_method,
                closing_date,
                message
            )
            VALUES (
                neg_id,
                buyer_id,
                jsonb_build_object(
                    'price', prop_price - 20000000,
                    'downPayment', (prop_price - 20000000) * 0.20,
                    'paymentMethod', 'cash',
                    'closingDate', (CURRENT_DATE + INTERVAL '45 days')::text,
                    'message', 'Inicial oferta formal'
                ),
                'pending',
                1,
                'offer',
                NULL,
                'buyer',
                prop_price - 20000000,
                'cash',
                CURRENT_DATE + INTERVAL '45 days',
                'Oferta inicial formal de compra'
            )
            RETURNING id INTO offer1_id;
            
            -- Offer 2: Counter from seller
            INSERT INTO negotiation_offers (
                negotiation_id,
                author,
                payload,
                status,
                version,
                kind,
                parent_offer_id,
                author_role,
                price,
                payment_method,
                closing_date,
                message
            )
            VALUES (
                neg_id,
                seller_id,
                jsonb_build_object(
                    'price', prop_price - 10000000,
                    'downPayment', (prop_price - 10000000) * 0.20,
                    'paymentMethod', 'cash',
                    'closingDate', (CURRENT_DATE + INTERVAL '30 days')::text,
                    'message', 'Acepto reducir precio si cierre es más rápido'
                ),
                'pending',
                2,
                'counter',
                offer1_id,
                'seller',
                prop_price - 10000000,
                'cash',
                CURRENT_DATE + INTERVAL '30 days',
                'Acepto reducir precio si cierre es más rápido'
            )
            RETURNING id INTO offer2_id;
            
            -- Offer 3: Final counter from buyer
            INSERT INTO negotiation_offers (
                negotiation_id,
                author,
                payload,
                status,
                version,
                kind,
                parent_offer_id,
                author_role,
                price,
                payment_method,
                closing_date,
                conditions,
                message
            )
            VALUES (
                neg_id,
                buyer_id,
                jsonb_build_object(
                    'price', prop_price - 15000000,
                    'downPayment', (prop_price - 15000000) * 0.20,
                    'paymentMethod', 'cash',
                    'closingDate', (CURRENT_DATE + INTERVAL '40 days')::text,
                    'conditions', jsonb_build_array(
                        'Incluir refrigerador y lavadora',
                        'Revisión de documentos legales',
                        'Paz y salvo de administración'
                    ),
                    'message', 'Oferta final con condiciones'
                ),
                'pending',
                3,
                'counter',
                offer2_id,
                'buyer',
                prop_price - 15000000,
                'cash',
                CURRENT_DATE + INTERVAL '40 days',
                jsonb_build_array(
                    'Incluir refrigerador y lavadora',
                    'Revisión de documentos legales',
                    'Paz y salvo de administración'
                ),
                'Oferta final con condiciones'
            )
            RETURNING id INTO offer3_id;
            
            RAISE NOTICE 'Created test offers for negotiation: %, %, %', offer1_id, offer2_id, offer3_id;
        END IF;
    END IF;
END $$;

-- ============================================
-- SECTION 7: ENSURE ALL NEGOTIATIONS HAVE OFFERS
-- ============================================
-- Make sure every active negotiation has at least one offer

DO $$
DECLARE
    neg_record RECORD;
BEGIN
    -- Loop through all active negotiations and ensure they have at least one offer
    FOR neg_record IN
        SELECT n.id, n.buyer_id, n.seller_id, n.property_id, n.current_price, n.original_price
        FROM negotiations n
        WHERE n.status IN ('active', 'pending_lawyer', 'pending_documents')
        AND NOT EXISTS (
            SELECT 1 FROM offers o WHERE o.negotiation_id = n.id LIMIT 1
        )
    LOOP
        -- Create a basic offer for negotiations that don't have any
        INSERT INTO offers (
            property_id, buyer_id, negotiation_id,
            offer_price, original_price,
            payment_method, closing_date,
            status, expires_at,
            created_at, updated_at
        )
        VALUES (
            neg_record.property_id,
            neg_record.buyer_id,
            neg_record.id,
            COALESCE(neg_record.current_price, neg_record.original_price, 100000000), -- Fallback price
            COALESCE(neg_record.original_price, 100000000),
            'cash',
            (CURRENT_DATE + INTERVAL '60 days')::date,
            'pending',
            NOW() + INTERVAL '7 days',
            NOW(),
            NOW()
        )
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Created offer for negotiation %', neg_record.id;
    END LOOP;

    RAISE NOTICE 'Ensured all active negotiations have at least one offer';
END $$;

-- ============================================
-- SECTION 8: NEGOTIATION DOCUMENTS TEST DATA
-- ============================================
-- Create test documents for negotiations

DO $$
DECLARE
    neg_id UUID;
BEGIN
    -- Get first active negotiation
    SELECT id INTO neg_id
    FROM negotiations
    WHERE status = 'active'
    LIMIT 1;
    
    IF neg_id IS NOT NULL THEN
        -- Create a document if one doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM negotiation_documents 
            WHERE negotiation_id = neg_id 
            LIMIT 1
        ) THEN
            INSERT INTO negotiation_documents (
                negotiation_id, kind, content, version
            )
            VALUES (
                neg_id,
                'promise_of_sale',
                '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Documento de prueba para negociación"}]}]}'::jsonb,
                1
            )
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE 'Created test document for negotiation';
        END IF;
    END IF;
END $$;

-- ============================================
-- SECTION 9: UPDATE VERIFICATION STATUS FOR ACTIVE USERS
-- ============================================
-- Users with properties or negotiations should be verified
-- This runs at the end after all data is created

DO $$
DECLARE
    user_with_activity INTEGER := 0;
BEGIN
    -- Update verification status for users who have properties or negotiations
    UPDATE public.profiles
    SET verification_status = 'verified'
    WHERE id IN (
        -- Users who own properties
        SELECT DISTINCT owner_id FROM properties WHERE owner_id IS NOT NULL
        UNION
        -- Users who are buyers or sellers in negotiations
        SELECT DISTINCT buyer_id FROM negotiations WHERE buyer_id IS NOT NULL
        UNION
        SELECT DISTINCT seller_id FROM negotiations WHERE seller_id IS NOT NULL
    )
    AND role = 'user'
    AND verification_status = 'unverified'; -- Only update if currently unverified

    GET DIAGNOSTICS user_with_activity = ROW_COUNT;
    RAISE NOTICE 'Updated verification status for % active users', user_with_activity;
END $$;

-- ============================================
-- SEED COMPLETED
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Seed completed successfully!';
    RAISE NOTICE 'Profiles updated with verification status, properties seeded, negotiations created.';
END $$;

