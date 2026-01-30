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
            status, verified, images, features, created_at, updated_at, published_at
        ) VALUES
        -- Property 1 - Bogotá
        (
            'Apartamento Ejecutivo Chapinero',
            'Hermoso apartamento completamente remodelado en el corazón de Chapinero',
            'Calle 67 #12-34', 'Chapinero', 'Bogotá',
            '{"lat": 4.6483, "lng": -74.0636}'::jsonb,
            3, 2, 120, 1, 'apartment', 4,
            650000000, 600000000, 180000,
            regular_user_ids[1],
            CASE WHEN agent_count > 0 THEN agent_ids[1] ELSE NULL END,
            'published', true,
            ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
            ARRAY['Piscina', 'Gimnasio'],
            NOW() - INTERVAL '30 days', NOW(), NOW() - INTERVAL '25 days'
        ),
        -- Property 2 - Bogotá
        (
            'Penthouse Zona G',
            'Exclusivo penthouse con terraza privada y vista panorámica',
            'Carrera 7 #85-20', 'Zona G', 'Bogotá',
            '{"lat": 4.6583, "lng": -74.0676}'::jsonb,
            4, 3, 200, 2, 'apartment', 5,
            1200000000, 1100000000, 350000,
            regular_user_ids[1 % user_count + 1],
            CASE WHEN agent_count > 0 THEN agent_ids[2 % agent_count + 1] ELSE NULL END,
            'published', true,
            ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
            ARRAY['Terraza privada', 'Vista panorámica'],
            NOW() - INTERVAL '45 days', NOW(), NOW() - INTERVAL '40 days'
        ),
        -- Property 3 - Bogotá
        (
            'Casa Moderna Usaquén',
            'Casa contemporánea con jardín y piscina',
            'Calle 120 #15-45', 'Usaquén', 'Bogotá',
            '{"lat": 4.6783, "lng": -74.0336}'::jsonb,
            4, 4, 350, 2, 'house', NULL,
            1800000000, 1700000000, 450000,
            regular_user_ids[2 % user_count + 1],
            CASE WHEN agent_count > 0 THEN agent_ids[3 % agent_count + 1] ELSE NULL END,
            'published', true,
            ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
            ARRAY['Jardín', 'Piscina'],
            NOW() - INTERVAL '60 days', NOW(), NOW() - INTERVAL '55 days'
        ),
        -- Property 4 - Medellín
        (
            'Apartamento Moderno en El Poblado',
            'Hermoso apartamento moderno de 3 habitaciones con vista panorámica al Parque Lleras. Acabados de lujo, cocina integral, zona de lavandería, closets empotrados.',
            'Carrera 43A #15-25, Apto 1202', 'El Poblado', 'Medellín',
            '{"lat": 6.2091, "lng": -75.5678}'::jsonb,
            3, 2, 85, 1, 'apartment', 4,
            450000000, 420000000, 280000,
            regular_user_ids[3 % user_count + 1],
            CASE WHEN agent_count > 0 THEN agent_ids[4 % agent_count + 1] ELSE NULL END,
            'published', true,
            ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
            ARRAY['Gimnasio', 'Piscina', 'Portería 24/7', 'Ascensor'],
            NOW() - INTERVAL '20 days', NOW(), NOW() - INTERVAL '15 days'
        ),
        -- Property 5 - Medellín
        (
            'Casa Campestre en Envigado',
            'Casa campestre de 4 habitaciones con jardín privado de 200m², piscina, zona de parrilla y garaje doble.',
            'Calle 25 Sur #45-67', 'Envigado', 'Envigado',
            '{"lat": 6.1759, "lng": -75.5622}'::jsonb,
            4, 3, 280, 2, 'house', NULL,
            650000000, 600000000, 150000,
            regular_user_ids[4 % user_count + 1],
            CASE WHEN agent_count > 0 THEN agent_ids[1 % agent_count + 1] ELSE NULL END,
            'published', true,
            ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
            ARRAY['Jardín privado', 'Piscina', 'Zona de parrilla'],
            NOW() - INTERVAL '35 days', NOW(), NOW() - INTERVAL '30 days'
        );
        
        GET DIAGNOSTICS property_count = ROW_COUNT;
        RAISE NOTICE 'Inserted % properties', property_count;
    ELSE
        RAISE NOTICE 'Properties already exist. Skipping property insertion.';
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

