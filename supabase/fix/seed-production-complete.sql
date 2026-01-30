-- ============================================
-- COMPREHENSIVE PRODUCTION SEED
-- ============================================
-- Run this in Supabase Dashboard > SQL Editor
-- Creates test users, properties, negotiations, and all related data
-- ============================================

-- ============================================
-- STEP 1: CREATE AUTH USERS
-- ============================================
-- Note: In Supabase, we need to create users through auth.users
-- Password for all users: Test123456!

-- Helper function to create users
CREATE OR REPLACE FUNCTION create_test_user(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_role TEXT
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Check if user already exists
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    
    IF v_user_id IS NOT NULL THEN
        RETURN v_user_id;
    END IF;
    
    -- Generate new UUID
    v_user_id := gen_random_uuid();
    
    -- Insert into auth.users
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        aud,
        role,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token
    ) VALUES (
        v_user_id,
        '00000000-0000-0000-0000-000000000000',
        p_email,
        crypt(p_password, gen_salt('bf')),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('full_name', p_full_name, 'role', p_role),
        'authenticated',
        'authenticated',
        NOW(),
        NOW(),
        '',
        ''
    );
    
    -- Insert into auth.identities
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        v_user_id,
        jsonb_build_object('sub', v_user_id::text, 'email', p_email),
        'email',
        v_user_id::text,
        NOW(),
        NOW(),
        NOW()
    );
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 2: CREATE TEST USERS
-- ============================================
DO $$
DECLARE
    superadmin_id UUID;
    admin1_id UUID;
    admin2_id UUID;
    lawyer1_id UUID;
    lawyer2_id UUID;
    agent1_id UUID;
    agent2_id UUID;
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
    user4_id UUID;
    user5_id UUID;
BEGIN
    -- Create Super Admin
    superadmin_id := create_test_user('superadmin@sunday.com', 'Test123456!', 'Carlos Administrador', 'super_admin');
    
    -- Create Admins
    admin1_id := create_test_user('admin@sunday.com', 'Test123456!', 'María García', 'admin');
    admin2_id := create_test_user('admin2@sunday.com', 'Test123456!', 'Pedro Martínez', 'admin');
    
    -- Create Lawyers
    lawyer1_id := create_test_user('lawyer1@sunday.com', 'Test123456!', 'Dr. Juan Abogado', 'lawyer');
    lawyer2_id := create_test_user('lawyer2@sunday.com', 'Test123456!', 'Dra. Ana Jurista', 'lawyer');
    
    -- Create Agents
    agent1_id := create_test_user('agent1@sunday.com', 'Test123456!', 'Roberto Agente', 'agent');
    agent2_id := create_test_user('agent2@sunday.com', 'Test123456!', 'Laura Vendedora', 'agent');
    
    -- Create Regular Users (property owners and buyers)
    user1_id := create_test_user('user1@sunday.com', 'Test123456!', 'Andrés Propietario', 'user');
    user2_id := create_test_user('user2@sunday.com', 'Test123456!', 'Sofia Compradora', 'user');
    user3_id := create_test_user('user3@sunday.com', 'Test123456!', 'Miguel Inversionista', 'user');
    user4_id := create_test_user('user4@sunday.com', 'Test123456!', 'Carolina Vendedora', 'user');
    user5_id := create_test_user('user5@sunday.com', 'Test123456!', 'Fernando Buscador', 'user');
    
    RAISE NOTICE 'Created users:';
    RAISE NOTICE '  Super Admin: %', superadmin_id;
    RAISE NOTICE '  Admin 1: %', admin1_id;
    RAISE NOTICE '  Lawyer 1: %', lawyer1_id;
    RAISE NOTICE '  Agent 1: %', agent1_id;
    RAISE NOTICE '  User 1: %', user1_id;
END $$;

-- ============================================
-- STEP 3: UPSERT PROFILES WITH FULL DATA
-- ============================================
INSERT INTO public.profiles (id, email, full_name, role, status, verification_status, phone, bio, location)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'role', 'user'),
    'active',
    CASE 
        WHEN au.raw_user_meta_data->>'role' IN ('super_admin', 'admin', 'lawyer', 'agent') THEN 'verified'
        ELSE 'unverified'
    END,
    CASE 
        WHEN au.email LIKE 'superadmin%' THEN '+57 310 123 4567'
        WHEN au.email LIKE 'admin%' THEN '+57 311 234 5678'
        WHEN au.email LIKE 'lawyer%' THEN '+57 312 345 6789'
        WHEN au.email LIKE 'agent%' THEN '+57 313 456 7890'
        ELSE '+57 31' || (4 + floor(random() * 6)::int)::text || ' ' || 
             lpad((floor(random() * 1000)::int)::text, 3, '0') || ' ' ||
             lpad((floor(random() * 10000)::int)::text, 4, '0')
    END,
    CASE 
        WHEN au.raw_user_meta_data->>'role' = 'super_admin' THEN 'Administrador principal de la plataforma Sunday'
        WHEN au.raw_user_meta_data->>'role' = 'admin' THEN 'Administrador de operaciones y verificaciones'
        WHEN au.raw_user_meta_data->>'role' = 'lawyer' THEN 'Abogado especialista en derecho inmobiliario'
        WHEN au.raw_user_meta_data->>'role' = 'agent' THEN 'Agente inmobiliario certificado'
        ELSE 'Usuario de la plataforma Sunday'
    END,
    CASE 
        WHEN au.email LIKE '%1@%' THEN 'Bogotá, Colombia'
        WHEN au.email LIKE '%2@%' THEN 'Medellín, Colombia'
        WHEN au.email LIKE '%3@%' THEN 'Cartagena, Colombia'
        WHEN au.email LIKE '%4@%' THEN 'Cali, Colombia'
        ELSE 'Barranquilla, Colombia'
    END
FROM auth.users au
WHERE au.email LIKE '%@sunday.com'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    verification_status = EXCLUDED.verification_status,
    phone = EXCLUDED.phone,
    bio = EXCLUDED.bio,
    location = EXCLUDED.location,
    updated_at = NOW();

-- ============================================
-- STEP 4: CREATE PROPERTIES
-- ============================================
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
    user4_id UUID;
    agent1_id UUID;
    agent2_id UUID;
    prop_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO user1_id FROM profiles WHERE email = 'user1@sunday.com';
    SELECT id INTO user2_id FROM profiles WHERE email = 'user2@sunday.com';
    SELECT id INTO user3_id FROM profiles WHERE email = 'user3@sunday.com';
    SELECT id INTO user4_id FROM profiles WHERE email = 'user4@sunday.com';
    SELECT id INTO agent1_id FROM profiles WHERE email = 'agent1@sunday.com';
    SELECT id INTO agent2_id FROM profiles WHERE email = 'agent2@sunday.com';
    
    IF user1_id IS NULL THEN
        RAISE NOTICE 'Users not found, skipping property creation';
        RETURN;
    END IF;
    
    -- Delete existing properties (clean slate)
    DELETE FROM properties WHERE owner_id IN (user1_id, user2_id, user3_id, user4_id);
    
    -- Property 1: Apartamento en Chapinero, Bogotá
    INSERT INTO properties (
        title, description, address, neighborhood, city, coordinates,
        bedrooms, bathrooms, area, parking, property_type, strata,
        price, minimum_offer_price, monthly_costs, owner_id, agent_id,
        status, verified, premium, images, features, tags
    ) VALUES (
        'Apartamento Moderno en Chapinero Alto',
        'Hermoso apartamento completamente remodelado con acabados de lujo. Cocina integral con isla, pisos en porcelanato, closets en madera. Vista despejada hacia los cerros. Edificio con seguridad 24/7, gimnasio, salón social.',
        'Calle 67 #12-34, Edificio Torres del Parque',
        'Chapinero Alto',
        'Bogotá',
        '{"lat": 4.6483, "lng": -74.0636}'::jsonb,
        3, 2, 120, 1, 'apartment', 4,
        650000000, 600000000, 180000,
        user1_id, agent1_id,
        'published', true, false,
        ARRAY[
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
        ],
        ARRAY['Gimnasio', 'Salón Social', 'Seguridad 24/7', 'Ascensor'],
        ARRAY['remodelado', 'vista', 'parqueadero']
    ) RETURNING id INTO prop_id;
    RAISE NOTICE 'Created property 1: %', prop_id;
    
    -- Property 2: Penthouse en Zona G, Bogotá
    INSERT INTO properties (
        title, description, address, neighborhood, city, coordinates,
        bedrooms, bathrooms, area, parking, property_type, strata,
        price, minimum_offer_price, monthly_costs, owner_id, agent_id,
        status, verified, premium, images, features, tags
    ) VALUES (
        'Penthouse de Lujo en Zona G',
        'Exclusivo penthouse dúplex con terraza privada de 80m². Vista panorámica 360° a la ciudad y cerros. 4 habitaciones con baño privado, estudio, sala de TV. Cocina tipo americano con electrodomésticos importados.',
        'Carrera 7 #85-20, Penthouse 1',
        'Zona G',
        'Bogotá',
        '{"lat": 4.6683, "lng": -74.0576}'::jsonb,
        4, 4, 280, 3, 'apartment', 6,
        1850000000, 1700000000, 450000,
        user1_id, agent1_id,
        'published', true, true,
        ARRAY[
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
        ],
        ARRAY['Terraza', 'Vista Panorámica', 'Jacuzzi', 'Chimenea', 'Gimnasio', 'Spa'],
        ARRAY['penthouse', 'lujo', 'terraza', 'duplex']
    );
    
    -- Property 3: Casa en El Poblado, Medellín
    INSERT INTO properties (
        title, description, address, neighborhood, city, coordinates,
        bedrooms, bathrooms, area, parking, property_type, strata,
        price, minimum_offer_price, monthly_costs, owner_id, agent_id,
        status, verified, premium, images, features, tags
    ) VALUES (
        'Casa Moderna con Piscina en El Poblado',
        'Espectacular casa contemporánea en zona exclusiva de El Poblado. Diseño arquitectónico único con amplios espacios abiertos. Piscina climatizada, jardín paisajizado, zona BBQ. Sistema domótico completo.',
        'Calle 10 Sur #45-67, Loma de Los Balsos',
        'El Poblado',
        'Medellín',
        '{"lat": 6.2091, "lng": -75.5678}'::jsonb,
        5, 5, 450, 4, 'house', 6,
        2500000000, 2300000000, 600000,
        user3_id, agent2_id,
        'published', true, true,
        ARRAY[
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
            'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
        ],
        ARRAY['Piscina', 'Jardín', 'BBQ', 'Domótica', 'Gimnasio Privado'],
        ARRAY['casa', 'piscina', 'lujo', 'moderno']
    );
    
    -- Property 4: Apartamento en Laureles, Medellín
    INSERT INTO properties (
        title, description, address, neighborhood, city, coordinates,
        bedrooms, bathrooms, area, parking, property_type, strata,
        price, minimum_offer_price, monthly_costs, owner_id, agent_id,
        status, verified, images, features, tags
    ) VALUES (
        'Apartamento Acogedor en Laureles',
        'Cómodo apartamento en el corazón de Laureles, cerca de la 70 y parques. Ideal para vivir o invertir. Zona tranquila con excelente transporte público. Cocina semi-integral, balcón.',
        'Circular 4 #71-32, Apto 501',
        'Laureles',
        'Medellín',
        '{"lat": 6.2456, "lng": -75.5912}'::jsonb,
        2, 2, 75, 1, 'apartment', 4,
        380000000, 350000000, 120000,
        user4_id, agent2_id,
        'published', true,
        ARRAY[
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
        ],
        ARRAY['Balcón', 'Portería 24/7', 'Parqueadero Visitantes'],
        ARRAY['laureles', 'céntrico', 'inversión']
    );
    
    -- Property 5: Oficina en Centro Empresarial
    INSERT INTO properties (
        title, description, address, neighborhood, city, coordinates,
        bedrooms, bathrooms, area, parking, property_type, strata,
        price, minimum_offer_price, monthly_costs, owner_id,
        status, verified, images, features, tags
    ) VALUES (
        'Oficina Premium en Centro Empresarial Salitre',
        'Oficina de alta especificación en el mejor centro empresarial de Bogotá. Piso técnico, cableado estructurado, aire acondicionado central. Acabados tipo A. Ubicación estratégica cerca al aeropuerto.',
        'Avenida El Dorado #68B-85, Piso 12',
        'Salitre',
        'Bogotá',
        '{"lat": 4.6589, "lng": -74.1147}'::jsonb,
        0, 2, 150, 3, 'office', 5,
        850000000, 800000000, 280000,
        user3_id,
        'published', true,
        ARRAY[
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
            'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'
        ],
        ARRAY['Aire Acondicionado', 'Piso Técnico', 'Recepción', 'Sala de Juntas'],
        ARRAY['oficina', 'corporativo', 'aeropuerto']
    );
    
    -- Property 6: Casa de Playa en Cartagena
    INSERT INTO properties (
        title, description, address, neighborhood, city, coordinates,
        bedrooms, bathrooms, area, parking, property_type,
        price, minimum_offer_price, monthly_costs, owner_id, agent_id,
        status, verified, premium, images, features, tags
    ) VALUES (
        'Villa Frente al Mar en Bocagrande',
        'Exclusiva villa con acceso directo a la playa. 6 habitaciones, todas con baño y vista al mar. Piscina infinita, muelle privado, jardín tropical. Personal de servicio incluido. Ideal para vacaciones o eventos.',
        'Carrera 2 #5-23, Bocagrande',
        'Bocagrande',
        'Cartagena',
        '{"lat": 10.4019, "lng": -75.5508}'::jsonb,
        6, 7, 600, 4, 'house',
        4500000000, 4200000000, 800000,
        user4_id, agent1_id,
        'published', true, true,
        ARRAY[
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
        ],
        ARRAY['Frente al Mar', 'Piscina Infinita', 'Muelle', 'Jardín Tropical', 'Servicio'],
        ARRAY['playa', 'villa', 'lujo', 'cartagena']
    );
    
    -- Property 7: Draft property (not published)
    INSERT INTO properties (
        title, description, address, neighborhood, city, coordinates,
        bedrooms, bathrooms, area, parking, property_type, strata,
        price, owner_id, status, verified, images
    ) VALUES (
        'Loft en Construcción - Usaquén',
        'Proyecto nuevo de lofts en Usaquén. Entrega 2025.',
        'Calle 119 #15-24',
        'Usaquén',
        'Bogotá',
        '{"lat": 4.6983, "lng": -74.0336}'::jsonb,
        1, 1, 55, 1, 'apartment', 4,
        320000000,
        user2_id,
        'draft', false,
        ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']
    );
    
    RAISE NOTICE 'Properties created successfully';
END $$;

-- ============================================
-- STEP 5: CREATE VISITS
-- ============================================
DO $$
DECLARE
    buyer_id UUID;
    prop_id UUID;
BEGIN
    SELECT id INTO buyer_id FROM profiles WHERE email = 'user2@sunday.com';
    SELECT id INTO prop_id FROM properties WHERE title LIKE '%Chapinero%' LIMIT 1;
    
    IF buyer_id IS NULL OR prop_id IS NULL THEN
        RAISE NOTICE 'Missing data for visits, skipping';
        RETURN;
    END IF;
    
    -- Clear existing visits for clean data
    DELETE FROM visits WHERE visitor_id = buyer_id;
    
    -- Visit 1: Completed visit
    INSERT INTO visits (
        property_id, visitor_id, scheduled_date, scheduled_time,
        status, visit_price, paid, payment_method, nda_accepted,
        feedback, rating, completed_at
    ) VALUES (
        prop_id, buyer_id, CURRENT_DATE - 5, '10:00',
        'completed', 49000, true, 'card', true,
        'Excelente propiedad, muy bien mantenida. El agente fue muy profesional.',
        5, NOW() - INTERVAL '5 days'
    );
    
    -- Visit 2: Upcoming visit
    INSERT INTO visits (
        property_id, visitor_id, scheduled_date, scheduled_time,
        status, visit_price, paid, payment_method, nda_accepted
    )
    SELECT 
        p.id, buyer_id, CURRENT_DATE + 3, '15:00',
        'confirmed', 49000, true, 'card', true
    FROM properties p
    WHERE p.title LIKE '%Poblado%'
    LIMIT 1;
    
    -- Visit 3: Pending visit
    INSERT INTO visits (
        property_id, visitor_id, scheduled_date, scheduled_time,
        status, visit_price, paid, nda_accepted
    )
    SELECT 
        p.id, buyer_id, CURRENT_DATE + 7, '11:00',
        'pending', 49000, false, false
    FROM properties p
    WHERE p.title LIKE '%Laureles%'
    LIMIT 1;
    
    RAISE NOTICE 'Visits created successfully';
END $$;

-- ============================================
-- STEP 6: CREATE NEGOTIATIONS AND OFFERS
-- ============================================
DO $$
DECLARE
    buyer1_id UUID;
    buyer2_id UUID;
    seller_id UUID;
    lawyer_id UUID;
    prop1_id UUID;
    prop2_id UUID;
    neg1_id UUID;
    neg2_id UUID;
    offer1_id UUID;
    offer2_id UUID;
    offer3_id UUID;
    prop_price BIGINT;
BEGIN
    -- Get user IDs
    SELECT id INTO buyer1_id FROM profiles WHERE email = 'user2@sunday.com';
    SELECT id INTO buyer2_id FROM profiles WHERE email = 'user5@sunday.com';
    SELECT id INTO seller_id FROM profiles WHERE email = 'user1@sunday.com';
    SELECT id INTO lawyer_id FROM profiles WHERE email = 'lawyer1@sunday.com';
    
    -- Get property
    SELECT id, price INTO prop1_id, prop_price 
    FROM properties WHERE title LIKE '%Chapinero%' LIMIT 1;
    
    IF buyer1_id IS NULL OR seller_id IS NULL OR prop1_id IS NULL THEN
        RAISE NOTICE 'Missing data for negotiations, skipping';
        RETURN;
    END IF;
    
    -- Clear existing negotiations
    DELETE FROM negotiations WHERE buyer_id IN (buyer1_id, buyer2_id);
    
    -- Create Negotiation 1: Active with multiple offers
    INSERT INTO negotiations (
        property_id, buyer_id, seller_id, lawyer_id,
        title, status, participants,
        current_price, original_price,
        offer_count, counter_offer_count
    ) VALUES (
        prop1_id, buyer1_id, seller_id, lawyer_id,
        'Negociación - Apartamento Chapinero Alto',
        'active',
        ARRAY[buyer1_id, seller_id, lawyer_id],
        prop_price - 30000000, prop_price,
        3, 2
    ) RETURNING id INTO neg1_id;
    
    -- Create offers for negotiation 1
    -- Offer 1: Initial from buyer
    INSERT INTO negotiation_offers (
        negotiation_id, author, payload, status,
        version, kind, author_role,
        price, down_payment, payment_method, closing_date, message
    ) VALUES (
        neg1_id, buyer1_id,
        jsonb_build_object(
            'price', prop_price - 50000000,
            'downPayment', (prop_price - 50000000) * 0.2,
            'paymentMethod', 'cash',
            'closingDate', (CURRENT_DATE + 45)::text
        ),
        'rejected', 1, 'offer', 'buyer',
        prop_price - 50000000,
        (prop_price - 50000000) * 0.2,
        'cash',
        CURRENT_DATE + 45,
        'Oferta inicial. Estoy muy interesado en la propiedad.'
    ) RETURNING id INTO offer1_id;
    
    -- Offer 2: Counter from seller
    INSERT INTO negotiation_offers (
        negotiation_id, author, payload, status,
        version, kind, parent_offer_id, author_role,
        price, down_payment, payment_method, closing_date, message
    ) VALUES (
        neg1_id, seller_id,
        jsonb_build_object(
            'price', prop_price - 20000000,
            'downPayment', (prop_price - 20000000) * 0.3,
            'paymentMethod', 'cash',
            'closingDate', (CURRENT_DATE + 30)::text
        ),
        'rejected', 2, 'counter', offer1_id, 'seller',
        prop_price - 20000000,
        (prop_price - 20000000) * 0.3,
        'cash',
        CURRENT_DATE + 30,
        'Gracias por su interés. Mi contraoferta considera el valor real de mercado.'
    ) RETURNING id INTO offer2_id;
    
    -- Offer 3: Final counter from buyer (pending)
    INSERT INTO negotiation_offers (
        negotiation_id, author, payload, status,
        version, kind, parent_offer_id, author_role,
        price, down_payment, payment_method, closing_date, 
        conditions, message
    ) VALUES (
        neg1_id, buyer1_id,
        jsonb_build_object(
            'price', prop_price - 30000000,
            'downPayment', (prop_price - 30000000) * 0.25,
            'paymentMethod', 'cash',
            'closingDate', (CURRENT_DATE + 35)::text,
            'conditions', ARRAY['Incluir refrigerador', 'Revisión legal completa', 'Paz y salvo de administración']
        ),
        'pending', 3, 'counter', offer2_id, 'buyer',
        prop_price - 30000000,
        (prop_price - 30000000) * 0.25,
        'cash',
        CURRENT_DATE + 35,
        jsonb_build_array('Incluir refrigerador', 'Revisión legal completa', 'Paz y salvo de administración'),
        'Oferta final. Espero podamos llegar a un acuerdo.'
    ) RETURNING id INTO offer3_id;
    
    -- Update negotiation with last offer
    UPDATE negotiations SET last_offer_id = offer3_id WHERE id = neg1_id;
    
    -- Create Negotiation 2: With different property
    SELECT id, price INTO prop2_id, prop_price 
    FROM properties WHERE title LIKE '%Poblado%' LIMIT 1;
    
    IF prop2_id IS NOT NULL THEN
        INSERT INTO negotiations (
            property_id, buyer_id, seller_id,
            title, status, participants,
            current_price, original_price
        )
        SELECT 
            prop2_id, buyer2_id, p.owner_id,
            'Negociación - Casa El Poblado',
            'pending_lawyer',
            ARRAY[buyer2_id, p.owner_id],
            prop_price - 100000000, prop_price
        FROM properties p WHERE p.id = prop2_id
        RETURNING id INTO neg2_id;
        
        -- Create initial offer
        INSERT INTO negotiation_offers (
            negotiation_id, author, payload, status,
            version, kind, author_role,
            price, payment_method, closing_date, message
        ) VALUES (
            neg2_id, buyer2_id,
            jsonb_build_object(
                'price', prop_price - 100000000,
                'paymentMethod', 'financing',
                'closingDate', (CURRENT_DATE + 60)::text
            ),
            'accepted', 1, 'offer', 'buyer',
            prop_price - 100000000,
            'financing',
            CURRENT_DATE + 60,
            'Propongo financiamiento bancario con cierre en 60 días.'
        );
    END IF;
    
    RAISE NOTICE 'Negotiations created: %, %', neg1_id, neg2_id;
END $$;

-- ============================================
-- STEP 7: CREATE OFFERS (Legacy table)
-- ============================================
DO $$
DECLARE
    buyer_id UUID;
    prop_id UUID;
    prop_price BIGINT;
BEGIN
    SELECT id INTO buyer_id FROM profiles WHERE email = 'user5@sunday.com';
    SELECT id, price INTO prop_id, prop_price 
    FROM properties WHERE title LIKE '%Laureles%' LIMIT 1;
    
    IF buyer_id IS NULL OR prop_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Create a pending offer
    INSERT INTO offers (
        property_id, buyer_id, offer_price, original_price,
        payment_method, closing_date, status, expires_at, conditions
    ) VALUES (
        prop_id, buyer_id, prop_price - 20000000, prop_price,
        'cash', CURRENT_DATE + 30, 'pending', NOW() + INTERVAL '7 days',
        ARRAY['Incluir parqueadero', 'Entrega en 45 días']
    ) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Legacy offers created';
END $$;

-- ============================================
-- STEP 8: CREATE FAVORITES
-- ============================================
DO $$
DECLARE
    user_id UUID;
BEGIN
    SELECT id INTO user_id FROM profiles WHERE email = 'user2@sunday.com';
    
    IF user_id IS NULL THEN RETURN; END IF;
    
    DELETE FROM favorites WHERE user_id = user_id;
    
    INSERT INTO favorites (user_id, property_id, notes)
    SELECT user_id, p.id, 
        CASE 
            WHEN p.title LIKE '%Penthouse%' THEN 'Me encanta la terraza y la vista'
            WHEN p.title LIKE '%Poblado%' THEN 'Perfecta para la familia'
            ELSE 'Para considerar'
        END
    FROM properties p
    WHERE p.status = 'published'
    LIMIT 4
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Favorites created';
END $$;

-- ============================================
-- STEP 9: CREATE NOTIFICATIONS
-- ============================================
DO $$
DECLARE
    user_id UUID;
    prop_id UUID;
BEGIN
    SELECT id INTO user_id FROM profiles WHERE email = 'user1@sunday.com';
    SELECT id INTO prop_id FROM properties WHERE title LIKE '%Chapinero%' LIMIT 1;
    
    IF user_id IS NULL THEN RETURN; END IF;
    
    DELETE FROM notifications WHERE user_id = user_id;
    
    INSERT INTO notifications (user_id, type, title, message, related_id, related_type, read)
    VALUES 
        (user_id, 'offer_received', 'Nueva oferta recibida', 
         'Has recibido una nueva oferta de $620.000.000 por tu propiedad en Chapinero Alto.',
         prop_id, 'property', false),
        (user_id, 'visit_scheduled', 'Visita programada', 
         'Se ha programado una visita para el próximo viernes a las 10:00 AM.',
         prop_id, 'property', false),
        (user_id, 'counter_offer', 'Contraoferta recibida',
         'El comprador ha respondido a tu contraoferta.',
         prop_id, 'property', true),
        (user_id, 'system', 'Bienvenido a Sunday',
         'Tu cuenta ha sido verificada exitosamente. Ya puedes publicar propiedades.',
         NULL, NULL, true);
    
    -- Notifications for buyer
    SELECT id INTO user_id FROM profiles WHERE email = 'user2@sunday.com';
    
    INSERT INTO notifications (user_id, type, title, message, related_id, related_type, read)
    VALUES 
        (user_id, 'offer_accepted', 'Oferta en revisión',
         'Tu oferta está siendo revisada por el propietario.',
         prop_id, 'offer', false);
    
    RAISE NOTICE 'Notifications created';
END $$;

-- ============================================
-- STEP 10: CREATE CONVERSATIONS
-- ============================================
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    admin_id UUID;
    conv_id UUID;
    prop_id UUID;
BEGIN
    SELECT id INTO user1_id FROM profiles WHERE email = 'user1@sunday.com';
    SELECT id INTO user2_id FROM profiles WHERE email = 'user2@sunday.com';
    SELECT id INTO admin_id FROM profiles WHERE email = 'admin@sunday.com';
    SELECT id INTO prop_id FROM properties WHERE title LIKE '%Chapinero%' LIMIT 1;
    
    IF user1_id IS NULL OR user2_id IS NULL THEN RETURN; END IF;
    
    -- Create conversation about property
    INSERT INTO conversations (
        property_id, participants, type, subject, created_by
    ) VALUES (
        prop_id, 
        ARRAY[user1_id, user2_id],
        'property_inquiry',
        'Consulta sobre Apartamento Chapinero',
        user2_id
    ) RETURNING id INTO conv_id;
    
    -- Add messages
    INSERT INTO chat_messages (conversation_id, sender_id, receiver_id, message, message_type)
    VALUES 
        (conv_id, user2_id, user1_id, 'Hola, me interesa mucho tu propiedad. ¿Está disponible para visitar este fin de semana?', 'text'),
        (conv_id, user1_id, user2_id, '¡Hola! Sí, está disponible. ¿Te parece el sábado a las 10am?', 'text'),
        (conv_id, user2_id, user1_id, 'Perfecto, ahí estaré. ¿La dirección exacta cuál es?', 'text');
    
    -- Verification conversation
    INSERT INTO conversations (
        participants, type, subject, created_by
    ) VALUES (
        ARRAY[user2_id, admin_id],
        'verification',
        'Verificación de identidad',
        admin_id
    ) RETURNING id INTO conv_id;
    
    INSERT INTO chat_messages (conversation_id, sender_id, receiver_id, message, is_system_message)
    VALUES 
        (conv_id, admin_id, user2_id, 'Por favor sube tu documento de identidad para verificar tu cuenta.', true);
    
    RAISE NOTICE 'Conversations created';
END $$;

-- ============================================
-- STEP 11: CREATE PROPERTY AVAILABILITY
-- ============================================
DO $$
DECLARE
    prop_record RECORD;
BEGIN
    FOR prop_record IN 
        SELECT id FROM properties WHERE status = 'published'
    LOOP
        -- Monday to Friday: 9am-6pm
        FOR i IN 1..5 LOOP
            INSERT INTO property_availability (
                property_id, day_of_week, time_slots, visit_duration, max_visits_per_day
            ) VALUES (
                prop_record.id, i,
                ARRAY['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
                45, 4
            ) ON CONFLICT (property_id, day_of_week) DO NOTHING;
        END LOOP;
        
        -- Saturday: 10am-2pm
        INSERT INTO property_availability (
            property_id, day_of_week, time_slots, visit_duration, max_visits_per_day
        ) VALUES (
            prop_record.id, 6,
            ARRAY['10:00', '11:00', '12:00', '13:00'],
            45, 3
        ) ON CONFLICT (property_id, day_of_week) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Property availability created';
END $$;

-- ============================================
-- STEP 12: CREATE FEATURE FLAGS
-- ============================================
INSERT INTO feature_flags (flag_name, enabled_globally, metadata) VALUES
    ('structured_conditions', true, '{"description": "Enable structured conditions for offers"}'),
    ('npv_calculation', true, '{"description": "Enable NPV calculation for offers"}'),
    ('enhanced_lawyer_workflow', true, '{"description": "Enable enhanced lawyer workflow"}'),
    ('legal_data_extraction', false, '{"description": "Enable legal data extraction"}'),
    ('new_dashboard', true, '{"description": "Enable new dashboard design"}')
ON CONFLICT (flag_name) DO UPDATE SET 
    enabled_globally = EXCLUDED.enabled_globally,
    updated_at = NOW();

-- ============================================
-- STEP 13: VERIFY AND ACTIVATE USERS WITH DATA
-- ============================================
UPDATE profiles
SET verification_status = 'verified'
WHERE id IN (
    SELECT DISTINCT owner_id FROM properties WHERE owner_id IS NOT NULL
    UNION
    SELECT DISTINCT buyer_id FROM negotiations WHERE buyer_id IS NOT NULL
    UNION
    SELECT DISTINCT seller_id FROM negotiations WHERE seller_id IS NOT NULL
)
AND verification_status != 'verified';

-- ============================================
-- CLEANUP: Remove helper function
-- ============================================
DROP FUNCTION IF EXISTS create_test_user;

-- ============================================
-- VERIFICATION: Show summary
-- ============================================
SELECT 'Users by role:' as info;
SELECT role, COUNT(*) as count FROM profiles GROUP BY role ORDER BY count DESC;

SELECT 'Properties by status:' as info;
SELECT status, COUNT(*) as count FROM properties GROUP BY status;

SELECT 'Negotiations by status:' as info;
SELECT status, COUNT(*) as count FROM negotiations GROUP BY status;

SELECT 'Test credentials:' as info;
SELECT '
╔════════════════════════════════════════════════════════════════╗
║                    TEST USER CREDENTIALS                       ║
╠════════════════════════════════════════════════════════════════╣
║ Email                      │ Password      │ Role               ║
╠════════════════════════════════════════════════════════════════╣
║ superadmin@sunday.com      │ Test123456!   │ super_admin        ║
║ admin@sunday.com           │ Test123456!   │ admin              ║
║ lawyer1@sunday.com         │ Test123456!   │ lawyer             ║
║ agent1@sunday.com          │ Test123456!   │ agent              ║
║ user1@sunday.com           │ Test123456!   │ user (seller)      ║
║ user2@sunday.com           │ Test123456!   │ user (buyer)       ║
╚════════════════════════════════════════════════════════════════╝
' as credentials;

SELECT '✅ Production seed completed successfully!' as result;
