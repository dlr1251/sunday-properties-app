-- ============================================
-- COMPLETE PRODUCTION SETUP & SEED
-- ============================================
-- This script handles:
-- 1. Missing columns and tables
-- 2. RLS policies
-- 3. Storage buckets
-- 4. Test users and data
-- ============================================

-- ============================================
-- SECTION 1: EXTENSIONS AND HELPER FUNCTIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SECTION 2: FIX EXISTING TABLES - ADD MISSING COLUMNS
-- ============================================

-- Fix blog_posts table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'published') THEN
        ALTER TABLE blog_posts ADD COLUMN published BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'status') THEN
        ALTER TABLE blog_posts ADD COLUMN status VARCHAR(20) DEFAULT 'draft';
    END IF;
END $$;

-- Fix profiles table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verification_status') THEN
        ALTER TABLE profiles ADD COLUMN verification_status VARCHAR(20) DEFAULT 'unverified';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE profiles ADD COLUMN location TEXT;
    END IF;
END $$;

-- Fix properties table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'minimum_offer_price') THEN
        ALTER TABLE properties ADD COLUMN minimum_offer_price BIGINT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'monthly_costs') THEN
        ALTER TABLE properties ADD COLUMN monthly_costs INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'premium') THEN
        ALTER TABLE properties ADD COLUMN premium BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'tags') THEN
        ALTER TABLE properties ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'agent_id') THEN
        ALTER TABLE properties ADD COLUMN agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Fix offers table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'negotiation_id') THEN
        ALTER TABLE offers ADD COLUMN negotiation_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'seller_id') THEN
        ALTER TABLE offers ADD COLUMN seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Fix favorites table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'favorites' AND column_name = 'notes') THEN
        ALTER TABLE favorites ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Fix notifications table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_id') THEN
        ALTER TABLE notifications ADD COLUMN related_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_type') THEN
        ALTER TABLE notifications ADD COLUMN related_type VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'data') THEN
        ALTER TABLE notifications ADD COLUMN data JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'updated_at') THEN
        ALTER TABLE notifications ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Update notifications type constraint to include all types
    ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
    ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
    CHECK (type IN (
        'visit_scheduled', 
        'offer_received', 
        'offer_accepted', 
        'offer_rejected',
        'counter_offer', 
        'counter_offer_received',
        'negotiation_started',
        'negotiation_update',
        'lawyer_assigned',
        'document_generated',
        'contract_ready', 
        'payment_received',
        'negotiation_completed',
        'system',
        'case_assigned'
    ));
    
    -- Update related_type constraint
    ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_related_type_check;
    ALTER TABLE notifications ADD CONSTRAINT notifications_related_type_check 
    CHECK (related_type IS NULL OR related_type IN ('property', 'offer', 'visit', 'contract', 'negotiation'));
END $$;

-- Fix visits table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'visits' AND column_name = 'feedback') THEN
        ALTER TABLE visits ADD COLUMN feedback TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'visits' AND column_name = 'rating') THEN
        ALTER TABLE visits ADD COLUMN rating INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'visits' AND column_name = 'completed_at') THEN
        ALTER TABLE visits ADD COLUMN completed_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'visits' AND column_name = 'nda_accepted') THEN
        ALTER TABLE visits ADD COLUMN nda_accepted BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- ============================================
-- SECTION 3: CREATE MISSING TABLES
-- ============================================

-- Negotiations table
CREATE TABLE IF NOT EXISTS public.negotiations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lawyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active',
    participants UUID[] NOT NULL DEFAULT '{}',
    current_price BIGINT,
    original_price BIGINT,
    last_offer_id UUID,
    offer_count INTEGER DEFAULT 1,
    counter_offer_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- Negotiation offers table
CREATE TABLE IF NOT EXISTS public.negotiation_offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    negotiation_id UUID NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
    author UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    payload JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending',
    parent_offer_id UUID REFERENCES negotiation_offers(id) ON DELETE SET NULL,
    version INTEGER NOT NULL DEFAULT 1,
    author_role TEXT,
    kind TEXT NOT NULL DEFAULT 'offer',
    price BIGINT,
    down_payment BIGINT,
    payment_method TEXT,
    closing_date DATE,
    conditions JSONB,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_name TEXT NOT NULL UNIQUE,
    enabled_globally BOOLEAN DEFAULT FALSE,
    enabled_for_users UUID[] DEFAULT '{}',
    enabled_for_roles TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    participants UUID[] NOT NULL DEFAULT '{}',
    type VARCHAR(20) DEFAULT 'general',
    subject VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Add conversation_id to chat_messages if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'conversation_id') THEN
        ALTER TABLE chat_messages ADD COLUMN conversation_id UUID;
    END IF;
END $$;

-- ============================================
-- SECTION 4: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_negotiations_property ON negotiations(property_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_buyer ON negotiations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_seller ON negotiations(seller_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_status ON negotiations(status);
CREATE INDEX IF NOT EXISTS idx_negotiation_offers_negotiation ON negotiation_offers(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_offers_author ON negotiation_offers(author);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);

-- ============================================
-- SECTION 5: ENABLE RLS AND CREATE POLICIES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
CREATE POLICY "Authenticated users can view all profiles" ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;
CREATE POLICY "Service role full access profiles" ON profiles FOR ALL TO service_role USING (true);

-- Negotiations policies
DROP POLICY IF EXISTS "Users view negotiations" ON negotiations;
CREATE POLICY "Users view negotiations" ON negotiations FOR SELECT TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR auth.uid() = lawyer_id OR auth.uid() = ANY(participants));

DROP POLICY IF EXISTS "Users create negotiations" ON negotiations;
CREATE POLICY "Users create negotiations" ON negotiations FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Users update negotiations" ON negotiations;
CREATE POLICY "Users update negotiations" ON negotiations FOR UPDATE TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR auth.uid() = lawyer_id);

-- Negotiation offers policies
DROP POLICY IF EXISTS "Users view offers" ON negotiation_offers;
CREATE POLICY "Users view offers" ON negotiation_offers FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM negotiations n WHERE n.id = negotiation_id AND (auth.uid() = n.buyer_id OR auth.uid() = n.seller_id)));

DROP POLICY IF EXISTS "Users create offers" ON negotiation_offers;
CREATE POLICY "Users create offers" ON negotiation_offers FOR INSERT TO authenticated WITH CHECK (auth.uid() = author);

-- Feature flags policies
DROP POLICY IF EXISTS "Anyone reads feature flags" ON feature_flags;
CREATE POLICY "Anyone reads feature flags" ON feature_flags FOR SELECT USING (true);

-- Conversations policies
DROP POLICY IF EXISTS "Users view conversations" ON conversations;
CREATE POLICY "Users view conversations" ON conversations FOR SELECT TO authenticated USING (auth.uid() = ANY(participants));

DROP POLICY IF EXISTS "Users create conversations" ON conversations;
CREATE POLICY "Users create conversations" ON conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = ANY(participants));

-- ============================================
-- SECTION 6: STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('property-images', 'property-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('property-docs', 'property-docs', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-docs', 'profile-docs', false) ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public read property-images" ON storage.objects;
CREATE POLICY "Public read property-images" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Auth upload property-images" ON storage.objects;
CREATE POLICY "Auth upload property-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-images');

-- ============================================
-- SECTION 7: CREATE TEST USERS
-- ============================================

CREATE OR REPLACE FUNCTION temp_create_test_user(
    p_email TEXT, 
    p_password TEXT, 
    p_full_name TEXT, 
    p_role TEXT
) RETURNS UUID AS $$
DECLARE 
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    IF v_user_id IS NOT NULL THEN RETURN v_user_id; END IF;
    
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
    ) VALUES (
        v_user_id, '00000000-0000-0000-0000-000000000000', p_email, 
        crypt(p_password, gen_salt('bf')), NOW(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('full_name', p_full_name, 'role', p_role),
        'authenticated', 'authenticated', NOW(), NOW()
    );
    
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', p_email), 'email', v_user_id::text, NOW(), NOW(), NOW());
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create all test users
DO $$
DECLARE
    v_id UUID;
BEGIN
    v_id := temp_create_test_user('superadmin@sunday.com', 'Test123456!', 'Carlos Superadmin', 'super_admin');
    v_id := temp_create_test_user('admin@sunday.com', 'Test123456!', 'María Administradora', 'admin');
    v_id := temp_create_test_user('admin2@sunday.com', 'Test123456!', 'Pedro Admin', 'admin');
    v_id := temp_create_test_user('lawyer1@sunday.com', 'Test123456!', 'Dr. Juan Abogado', 'lawyer');
    v_id := temp_create_test_user('lawyer2@sunday.com', 'Test123456!', 'Dra. Ana Jurista', 'lawyer');
    v_id := temp_create_test_user('lawyer3@sunday.com', 'Test123456!', 'Dr. Luis Legal', 'lawyer');
    v_id := temp_create_test_user('agent1@sunday.com', 'Test123456!', 'Roberto Agente', 'agent');
    v_id := temp_create_test_user('agent2@sunday.com', 'Test123456!', 'Laura Vendedora', 'agent');
    v_id := temp_create_test_user('agent3@sunday.com', 'Test123456!', 'Carlos Asesor', 'agent');
    v_id := temp_create_test_user('user1@sunday.com', 'Test123456!', 'Andrés Propietario', 'user');
    v_id := temp_create_test_user('user2@sunday.com', 'Test123456!', 'Sofia Compradora', 'user');
    v_id := temp_create_test_user('user3@sunday.com', 'Test123456!', 'Miguel Inversionista', 'user');
    v_id := temp_create_test_user('user4@sunday.com', 'Test123456!', 'Carolina Dueña', 'user');
    v_id := temp_create_test_user('user5@sunday.com', 'Test123456!', 'Fernando Buscador', 'user');
    v_id := temp_create_test_user('user6@sunday.com', 'Test123456!', 'Diana Exploradora', 'user');
    v_id := temp_create_test_user('user7@sunday.com', 'Test123456!', 'Ricardo Rentista', 'user');
    v_id := temp_create_test_user('user8@sunday.com', 'Test123456!', 'Patricia Propietaria', 'user');
END $$;

-- ============================================
-- SECTION 8: UPSERT PROFILES
-- ============================================

INSERT INTO profiles (id, email, full_name, role, status, verification_status, phone, bio, location)
SELECT 
    au.id, au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'role', 'user'),
    'active',
    CASE WHEN au.raw_user_meta_data->>'role' IN ('super_admin', 'admin', 'lawyer', 'agent') THEN 'verified' ELSE 'unverified' END,
    '+57 31' || (floor(random() * 10))::int::text || ' ' || lpad((floor(random() * 10000000)::int)::text, 7, '0'),
    CASE 
        WHEN au.raw_user_meta_data->>'role' = 'super_admin' THEN 'Administrador principal de la plataforma'
        WHEN au.raw_user_meta_data->>'role' = 'admin' THEN 'Administrador de operaciones'
        WHEN au.raw_user_meta_data->>'role' = 'lawyer' THEN 'Abogado especialista en derecho inmobiliario'
        WHEN au.raw_user_meta_data->>'role' = 'agent' THEN 'Agente inmobiliario certificado'
        ELSE 'Usuario de Sunday'
    END,
    (ARRAY['Bogotá', 'Medellín', 'Cartagena', 'Cali', 'Barranquilla'])[floor(random() * 5 + 1)::int] || ', Colombia'
FROM auth.users au
WHERE au.email LIKE '%@sunday.com'
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    verification_status = EXCLUDED.verification_status,
    phone = COALESCE(profiles.phone, EXCLUDED.phone),
    bio = COALESCE(profiles.bio, EXCLUDED.bio),
    location = COALESCE(profiles.location, EXCLUDED.location),
    updated_at = NOW();

-- ============================================
-- SECTION 9: CREATE PROPERTIES
-- ============================================

DO $$
DECLARE
    v_user1 UUID; v_user3 UUID; v_user4 UUID; v_user7 UUID; v_user8 UUID;
    v_agent1 UUID; v_agent2 UUID; v_agent3 UUID;
BEGIN
    SELECT id INTO v_user1 FROM profiles WHERE email = 'user1@sunday.com';
    SELECT id INTO v_user3 FROM profiles WHERE email = 'user3@sunday.com';
    SELECT id INTO v_user4 FROM profiles WHERE email = 'user4@sunday.com';
    SELECT id INTO v_user7 FROM profiles WHERE email = 'user7@sunday.com';
    SELECT id INTO v_user8 FROM profiles WHERE email = 'user8@sunday.com';
    SELECT id INTO v_agent1 FROM profiles WHERE email = 'agent1@sunday.com';
    SELECT id INTO v_agent2 FROM profiles WHERE email = 'agent2@sunday.com';
    SELECT id INTO v_agent3 FROM profiles WHERE email = 'agent3@sunday.com';
    
    IF v_user1 IS NULL THEN RAISE NOTICE 'Users not found, skipping properties'; RETURN; END IF;
    
    -- Clear existing test properties
    DELETE FROM properties WHERE title LIKE '%Chapinero%' OR title LIKE '%Zona G%' OR title LIKE '%Poblado%' 
        OR title LIKE '%Laureles%' OR title LIKE '%Salitre%' OR title LIKE '%Bocagrande%'
        OR title LIKE '%Usaquén%' OR title LIKE '%Envigado%' OR title LIKE '%Cartagena%';
    
    -- BOGOTÁ PROPERTIES
    INSERT INTO properties (title, description, address, neighborhood, city, coordinates, bedrooms, bathrooms, area, parking, property_type, strata, price, minimum_offer_price, monthly_costs, owner_id, agent_id, status, verified, premium, images, features, tags) VALUES
    ('Apartamento Moderno en Chapinero Alto', 'Hermoso apartamento completamente remodelado con acabados de lujo. Cocina integral con isla, pisos en porcelanato. Vista despejada hacia los cerros orientales.', 'Calle 67 #12-34', 'Chapinero Alto', 'Bogotá', '{"lat": 4.6483, "lng": -74.0636}', 3, 2, 120, 1, 'apartment', 4, 650000000, 600000000, 180000, v_user1, v_agent1, 'published', true, false, ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'], ARRAY['Gimnasio', 'Salón Social', 'Seguridad 24/7', 'Ascensor'], ARRAY['remodelado', 'vista', 'parqueadero']),
    
    ('Penthouse de Lujo en Zona G', 'Exclusivo penthouse dúplex con terraza privada de 80m². Vista panorámica 360° a la ciudad y cerros. 4 habitaciones con baño privado, estudio, sala de TV.', 'Carrera 7 #85-20', 'Zona G', 'Bogotá', '{"lat": 4.6683, "lng": -74.0576}', 4, 4, 280, 3, 'apartment', 6, 1850000000, 1700000000, 450000, v_user1, v_agent1, 'published', true, true, ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'], ARRAY['Terraza', 'Vista Panorámica', 'Jacuzzi', 'Chimenea', 'Gimnasio'], ARRAY['penthouse', 'lujo', 'terraza']),
    
    ('Apartamento Familiar en Usaquén', 'Amplio apartamento de 4 habitaciones en conjunto cerrado. Zonas verdes, parque infantil. Cerca de centros comerciales y colegios.', 'Calle 127 #15-60', 'Usaquén', 'Bogotá', '{"lat": 4.6983, "lng": -74.0336}', 4, 3, 180, 2, 'apartment', 5, 980000000, 920000000, 280000, v_user4, v_agent3, 'published', true, false, ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'], ARRAY['Zonas Verdes', 'Parque Infantil', 'Conjunto Cerrado'], ARRAY['familiar', 'usaquen', 'conjunto']),
    
    ('Oficina Premium en Salitre', 'Oficina de alta especificación en el mejor centro empresarial. Piso técnico, cableado estructurado, aire acondicionado central.', 'Av El Dorado #68B-85', 'Salitre', 'Bogotá', '{"lat": 4.6589, "lng": -74.1147}', 0, 2, 150, 3, 'office', 5, 850000000, 800000000, 280000, v_user3, NULL, 'published', true, false, ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'], ARRAY['Aire Acondicionado', 'Piso Técnico', 'Recepción', 'Sala de Juntas'], ARRAY['oficina', 'corporativo']);
    
    -- MEDELLÍN PROPERTIES
    INSERT INTO properties (title, description, address, neighborhood, city, coordinates, bedrooms, bathrooms, area, parking, property_type, strata, price, minimum_offer_price, monthly_costs, owner_id, agent_id, status, verified, premium, images, features, tags) VALUES
    ('Casa Moderna con Piscina en El Poblado', 'Espectacular casa contemporánea en zona exclusiva. Piscina climatizada, jardín paisajizado, zona BBQ. Sistema domótico completo.', 'Calle 10 Sur #45-67', 'El Poblado', 'Medellín', '{"lat": 6.2091, "lng": -75.5678}', 5, 5, 450, 4, 'house', 6, 2500000000, 2300000000, 600000, v_user3, v_agent2, 'published', true, true, ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800'], ARRAY['Piscina', 'Jardín', 'BBQ', 'Domótica', 'Gimnasio Privado'], ARRAY['casa', 'piscina', 'lujo']),
    
    ('Apartamento Acogedor en Laureles', 'Cómodo apartamento cerca de la 70 y parques. Ideal para vivir o invertir. Zona tranquila con excelente transporte público.', 'Circular 4 #71-32', 'Laureles', 'Medellín', '{"lat": 6.2456, "lng": -75.5912}', 2, 2, 75, 1, 'apartment', 4, 380000000, 350000000, 120000, v_user4, v_agent2, 'published', true, false, ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'], ARRAY['Balcón', 'Portería 24/7', 'Parqueadero Visitantes'], ARRAY['laureles', 'céntrico', 'inversión']),
    
    ('Casa Campestre en Envigado', 'Hermosa casa campestre con 3000m² de lote. Ideal para familia grande. Frutales, huerta, zona de camping.', 'Vereda El Escobero', 'Envigado', 'Medellín', '{"lat": 6.1759, "lng": -75.5322}', 6, 4, 400, 4, 'house', 3, 1200000000, 1100000000, 200000, v_user7, v_agent2, 'published', true, false, ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'], ARRAY['Lote Grande', 'Frutales', 'Zona Verde', 'Tranquilidad'], ARRAY['campestre', 'envigado', 'naturaleza']);
    
    -- CARTAGENA PROPERTIES
    INSERT INTO properties (title, description, address, neighborhood, city, coordinates, bedrooms, bathrooms, area, parking, property_type, price, minimum_offer_price, monthly_costs, owner_id, agent_id, status, verified, premium, images, features, tags) VALUES
    ('Villa Frente al Mar en Bocagrande', 'Exclusiva villa con acceso directo a la playa. 6 habitaciones con vista al mar. Piscina infinita, muelle privado.', 'Carrera 2 #5-23', 'Bocagrande', 'Cartagena', '{"lat": 10.4019, "lng": -75.5508}', 6, 7, 600, 4, 'house', 4500000000, 4200000000, 800000, v_user4, v_agent1, 'published', true, true, ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'], ARRAY['Frente al Mar', 'Piscina Infinita', 'Muelle Privado', 'Servicio'], ARRAY['playa', 'villa', 'lujo']),
    
    ('Apartamento Centro Histórico Cartagena', 'Encantador apartamento colonial restaurado. Balcones con vista a la muralla. Techos altos, pisos en barro.', 'Calle del Curato #32-15', 'Centro Histórico', 'Cartagena', '{"lat": 10.4236, "lng": -75.5509}', 2, 2, 90, 0, 'apartment', 420000000, 400000000, 150000, v_user8, v_agent3, 'published', true, true, ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'], ARRAY['Colonial', 'Balcón', 'Vista Muralla', 'Restaurado'], ARRAY['colonial', 'centro', 'turístico']);
    
    -- CALI PROPERTY
    INSERT INTO properties (title, description, address, neighborhood, city, coordinates, bedrooms, bathrooms, area, parking, property_type, strata, price, minimum_offer_price, monthly_costs, owner_id, agent_id, status, verified, images, features, tags) VALUES
    ('Casa con Piscina en Ciudad Jardín', 'Hermosa casa en exclusivo sector de Cali. Piscina, jardín, zona de BBQ. Muy cerca de centros comerciales.', 'Calle 16 #100-45', 'Ciudad Jardín', 'Cali', '{"lat": 3.3727, "lng": -76.5395}', 4, 4, 300, 3, 'house', 6, 1400000000, 1300000000, 350000, v_user7, v_agent3, 'published', true, ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'], ARRAY['Piscina', 'Jardín', 'BBQ', 'Seguridad'], ARRAY['cali', 'piscina', 'exclusivo']);
    
    RAISE NOTICE 'Properties created successfully';
END $$;

-- ============================================
-- SECTION 10: CREATE VISITS
-- ============================================

DO $$
DECLARE
    v_buyer1 UUID; v_buyer2 UUID; v_buyer3 UUID;
    v_prop1 UUID; v_prop2 UUID; v_prop3 UUID; v_prop4 UUID;
BEGIN
    SELECT id INTO v_buyer1 FROM profiles WHERE email = 'user2@sunday.com';
    SELECT id INTO v_buyer2 FROM profiles WHERE email = 'user5@sunday.com';
    SELECT id INTO v_buyer3 FROM profiles WHERE email = 'user6@sunday.com';
    
    SELECT id INTO v_prop1 FROM properties WHERE title LIKE '%Chapinero%' LIMIT 1;
    SELECT id INTO v_prop2 FROM properties WHERE title LIKE '%Poblado%' LIMIT 1;
    SELECT id INTO v_prop3 FROM properties WHERE title LIKE '%Laureles%' LIMIT 1;
    SELECT id INTO v_prop4 FROM properties WHERE title LIKE '%Zona G%' LIMIT 1;
    
    IF v_buyer1 IS NULL OR v_prop1 IS NULL THEN RAISE NOTICE 'Missing data for visits'; RETURN; END IF;
    
    -- Clear existing test visits
    DELETE FROM visits WHERE visitor_id IN (v_buyer1, v_buyer2, v_buyer3);
    
    -- Completed visits
    INSERT INTO visits (property_id, visitor_id, scheduled_date, scheduled_time, status, visit_price, paid, payment_method, nda_accepted, feedback, rating, completed_at) VALUES
    (v_prop1, v_buyer1, CURRENT_DATE - 10, '10:00', 'completed', 49000, true, 'card', true, 'Excelente propiedad, muy bien mantenida. El agente fue muy profesional.', 5, NOW() - INTERVAL '10 days'),
    (v_prop2, v_buyer1, CURRENT_DATE - 5, '15:00', 'completed', 49000, true, 'card', true, 'Casa espectacular, la piscina es increíble.', 5, NOW() - INTERVAL '5 days'),
    (v_prop3, v_buyer2, CURRENT_DATE - 3, '11:00', 'completed', 49000, true, 'cash', true, 'Buen apartamento para inversión.', 4, NOW() - INTERVAL '3 days');
    
    -- Confirmed upcoming visits
    INSERT INTO visits (property_id, visitor_id, scheduled_date, scheduled_time, status, visit_price, paid, payment_method, nda_accepted) VALUES
    (v_prop4, v_buyer1, CURRENT_DATE + 2, '10:00', 'confirmed', 49000, true, 'card', true),
    (v_prop1, v_buyer2, CURRENT_DATE + 3, '14:00', 'confirmed', 49000, true, 'card', true),
    (v_prop2, v_buyer3, CURRENT_DATE + 5, '16:00', 'confirmed', 49000, true, 'card', true);
    
    -- Pending visits
    INSERT INTO visits (property_id, visitor_id, scheduled_date, scheduled_time, status, visit_price, paid, nda_accepted) VALUES
    (v_prop3, v_buyer3, CURRENT_DATE + 7, '11:00', 'pending', 49000, false, false),
    (v_prop4, v_buyer2, CURRENT_DATE + 10, '15:00', 'pending', 49000, false, false);
    
    RAISE NOTICE 'Visits created successfully';
END $$;

-- ============================================
-- SECTION 11: CREATE NEGOTIATIONS AND OFFERS
-- ============================================

DO $$
DECLARE
    v_buyer1 UUID; v_buyer2 UUID; v_buyer3 UUID;
    v_seller1 UUID; v_seller2 UUID;
    v_lawyer1 UUID; v_lawyer2 UUID;
    v_prop1 UUID; v_prop2 UUID; v_prop3 UUID;
    v_prop1_price BIGINT; v_prop2_price BIGINT; v_prop3_price BIGINT;
    v_neg1 UUID; v_neg2 UUID; v_neg3 UUID;
    v_offer1 UUID; v_offer2 UUID; v_offer3 UUID;
BEGIN
    SELECT id INTO v_buyer1 FROM profiles WHERE email = 'user2@sunday.com';
    SELECT id INTO v_buyer2 FROM profiles WHERE email = 'user5@sunday.com';
    SELECT id INTO v_buyer3 FROM profiles WHERE email = 'user6@sunday.com';
    SELECT id INTO v_seller1 FROM profiles WHERE email = 'user1@sunday.com';
    SELECT id INTO v_seller2 FROM profiles WHERE email = 'user3@sunday.com';
    SELECT id INTO v_lawyer1 FROM profiles WHERE email = 'lawyer1@sunday.com';
    SELECT id INTO v_lawyer2 FROM profiles WHERE email = 'lawyer2@sunday.com';
    
    SELECT id, price INTO v_prop1, v_prop1_price FROM properties WHERE title LIKE '%Chapinero%' LIMIT 1;
    SELECT id, price INTO v_prop2, v_prop2_price FROM properties WHERE title LIKE '%Poblado%' LIMIT 1;
    SELECT id, price INTO v_prop3, v_prop3_price FROM properties WHERE title LIKE '%Zona G%' LIMIT 1;
    
    IF v_buyer1 IS NULL OR v_prop1 IS NULL THEN RAISE NOTICE 'Missing data for negotiations'; RETURN; END IF;
    
    -- Clear existing test negotiations
    DELETE FROM negotiations WHERE buyer_id IN (v_buyer1, v_buyer2, v_buyer3);
    
    -- NEGOTIATION 1: Active with offer chain (Chapinero)
    INSERT INTO negotiations (property_id, buyer_id, seller_id, lawyer_id, title, status, participants, current_price, original_price, offer_count, counter_offer_count)
    VALUES (v_prop1, v_buyer1, v_seller1, v_lawyer1, 'Negociación - Apartamento Chapinero Alto', 'active', ARRAY[v_buyer1, v_seller1, v_lawyer1], v_prop1_price - 30000000, v_prop1_price, 3, 2)
    RETURNING id INTO v_neg1;
    
    -- Offer chain for negotiation 1
    INSERT INTO negotiation_offers (negotiation_id, author, payload, status, version, kind, author_role, price, down_payment, payment_method, closing_date, message)
    VALUES (v_neg1, v_buyer1, jsonb_build_object('price', v_prop1_price - 50000000), 'rejected', 1, 'offer', 'buyer', v_prop1_price - 50000000, (v_prop1_price - 50000000) * 0.2, 'cash', CURRENT_DATE + 45, 'Oferta inicial. Estoy muy interesado en esta propiedad.')
    RETURNING id INTO v_offer1;
    
    INSERT INTO negotiation_offers (negotiation_id, author, payload, status, version, kind, parent_offer_id, author_role, price, payment_method, closing_date, message)
    VALUES (v_neg1, v_seller1, jsonb_build_object('price', v_prop1_price - 20000000), 'rejected', 2, 'counter', v_offer1, 'seller', v_prop1_price - 20000000, 'cash', CURRENT_DATE + 30, 'Gracias por su oferta. Considerando el valor del mercado, mi contraoferta es la siguiente.')
    RETURNING id INTO v_offer2;
    
    INSERT INTO negotiation_offers (negotiation_id, author, payload, status, version, kind, parent_offer_id, author_role, price, payment_method, closing_date, conditions, message)
    VALUES (v_neg1, v_buyer1, jsonb_build_object('price', v_prop1_price - 30000000, 'conditions', ARRAY['Incluir electrodomésticos', 'Paz y salvo de administración']), 'pending', 3, 'counter', v_offer2, 'buyer', v_prop1_price - 30000000, 'cash', CURRENT_DATE + 35, '["Incluir electrodomésticos", "Paz y salvo de administración", "Revisión legal"]'::jsonb, 'Esta es mi oferta final. Espero podamos llegar a un acuerdo.')
    RETURNING id INTO v_offer3;
    
    UPDATE negotiations SET last_offer_id = v_offer3 WHERE id = v_neg1;
    
    -- NEGOTIATION 2: Pending lawyer review (El Poblado)
    IF v_prop2 IS NOT NULL THEN
        INSERT INTO negotiations (property_id, buyer_id, seller_id, lawyer_id, title, status, participants, current_price, original_price, offer_count)
        VALUES (v_prop2, v_buyer2, v_seller2, v_lawyer2, 'Negociación - Casa El Poblado', 'pending_lawyer', ARRAY[v_buyer2, v_seller2, v_lawyer2], v_prop2_price - 100000000, v_prop2_price, 2)
        RETURNING id INTO v_neg2;
        
        INSERT INTO negotiation_offers (negotiation_id, author, payload, status, version, kind, author_role, price, payment_method, closing_date, message)
        VALUES (v_neg2, v_buyer2, jsonb_build_object('price', v_prop2_price - 150000000), 'rejected', 1, 'offer', 'buyer', v_prop2_price - 150000000, 'financing', CURRENT_DATE + 60, 'Propongo financiamiento bancario.');
        
        INSERT INTO negotiation_offers (negotiation_id, author, payload, status, version, kind, author_role, price, payment_method, closing_date, message)
        VALUES (v_neg2, v_seller2, jsonb_build_object('price', v_prop2_price - 100000000), 'accepted', 2, 'counter', 'seller', v_prop2_price - 100000000, 'financing', CURRENT_DATE + 45, 'Acepto con financiamiento y cierre en 45 días.');
    END IF;
    
    -- NEGOTIATION 3: New negotiation (Zona G)
    IF v_prop3 IS NOT NULL AND v_buyer3 IS NOT NULL THEN
        INSERT INTO negotiations (property_id, buyer_id, seller_id, title, status, participants, current_price, original_price)
        VALUES (v_prop3, v_buyer3, v_seller1, 'Negociación - Penthouse Zona G', 'active', ARRAY[v_buyer3, v_seller1], v_prop3_price - 50000000, v_prop3_price)
        RETURNING id INTO v_neg3;
        
        INSERT INTO negotiation_offers (negotiation_id, author, payload, status, version, kind, author_role, price, down_payment, payment_method, closing_date, message)
        VALUES (v_neg3, v_buyer3, jsonb_build_object('price', v_prop3_price - 50000000), 'pending', 1, 'offer', 'buyer', v_prop3_price - 50000000, (v_prop3_price - 50000000) * 0.3, 'mixed', CURRENT_DATE + 90, 'Oferta inicial con 30% de entrada y financiamiento del resto.');
    END IF;
    
    RAISE NOTICE 'Negotiations and offers created successfully';
END $$;

-- ============================================
-- SECTION 12: CREATE FAVORITES AND NOTIFICATIONS
-- ============================================

DO $$
DECLARE
    v_user1 UUID; v_user2 UUID; v_user3 UUID;
    v_prop_ids UUID[];
BEGIN
    SELECT id INTO v_user1 FROM profiles WHERE email = 'user2@sunday.com';
    SELECT id INTO v_user2 FROM profiles WHERE email = 'user5@sunday.com';
    SELECT id INTO v_user3 FROM profiles WHERE email = 'user6@sunday.com';
    
    SELECT ARRAY_AGG(id) INTO v_prop_ids FROM properties WHERE status = 'published' LIMIT 6;
    
    IF v_user1 IS NULL OR v_prop_ids IS NULL THEN RETURN; END IF;
    
    -- Clear and recreate favorites
    DELETE FROM favorites WHERE user_id IN (v_user1, v_user2, v_user3);
    
    INSERT INTO favorites (user_id, property_id, notes) VALUES
    (v_user1, v_prop_ids[1], 'Me encanta la ubicación'),
    (v_user1, v_prop_ids[2], 'Perfecto para inversión'),
    (v_user1, v_prop_ids[3], 'Para considerar'),
    (v_user2, v_prop_ids[1], 'Muy buena opción'),
    (v_user2, v_prop_ids[4], 'Excelente precio'),
    (v_user3, v_prop_ids[2], 'Mi favorito');
    
    -- Clear and recreate notifications
    DELETE FROM notifications WHERE user_id IN (v_user1, v_user2, v_user3);
    
    INSERT INTO notifications (user_id, type, title, message, read, related_id, related_type) VALUES
    (v_user1, 'offer_received', 'Nueva oferta recibida', 'Has recibido una nueva oferta por tu propiedad en Chapinero.', false, v_prop_ids[1], 'property'),
    (v_user1, 'visit_scheduled', 'Visita programada', 'Tienes una visita programada para el próximo viernes a las 10:00 AM.', false, v_prop_ids[1], 'property'),
    (v_user1, 'counter_offer', 'Contraoferta recibida', 'El comprador ha respondido a tu contraoferta.', true, v_prop_ids[1], 'offer'),
    (v_user2, 'offer_accepted', 'Oferta en revisión', 'Tu oferta está siendo revisada por el propietario.', false, v_prop_ids[1], 'offer'),
    (v_user2, 'system', 'Bienvenido a Sunday', 'Tu cuenta ha sido verificada exitosamente.', true, NULL, NULL),
    (v_user3, 'visit_scheduled', 'Visita confirmada', 'Tu visita ha sido confirmada.', false, v_prop_ids[2], 'visit');
    
    RAISE NOTICE 'Favorites and notifications created';
END $$;

-- ============================================
-- SECTION 13: FEATURE FLAGS
-- ============================================

INSERT INTO feature_flags (flag_name, enabled_globally, metadata) VALUES
    ('structured_conditions', true, '{"description": "Condiciones estructuradas para ofertas"}'),
    ('npv_calculation', true, '{"description": "Cálculo de NPV para ofertas"}'),
    ('enhanced_lawyer_workflow', true, '{"description": "Flujo mejorado para abogados"}'),
    ('legal_data_extraction', false, '{"description": "Extracción de datos legales"}'),
    ('new_dashboard', true, '{"description": "Nuevo diseño de dashboard"}'),
    ('chat_v2', true, '{"description": "Chat mejorado v2"}')
ON CONFLICT (flag_name) DO UPDATE SET enabled_globally = EXCLUDED.enabled_globally, updated_at = NOW();

-- ============================================
-- SECTION 14: VERIFY ACTIVE USERS
-- ============================================

UPDATE profiles SET verification_status = 'verified'
WHERE id IN (
    SELECT DISTINCT owner_id FROM properties WHERE owner_id IS NOT NULL
    UNION SELECT DISTINCT buyer_id FROM negotiations WHERE buyer_id IS NOT NULL
    UNION SELECT DISTINCT seller_id FROM negotiations WHERE seller_id IS NOT NULL
    UNION SELECT DISTINCT visitor_id FROM visits WHERE visitor_id IS NOT NULL
) AND verification_status != 'verified';

-- ============================================
-- CLEANUP
-- ============================================

DROP FUNCTION IF EXISTS temp_create_test_user;

-- ============================================
-- SUMMARY
-- ============================================

SELECT '
╔══════════════════════════════════════════════════════════════════╗
║           ✅ PRODUCTION SETUP COMPLETED SUCCESSFULLY             ║
╠══════════════════════════════════════════════════════════════════╣
║                        TEST CREDENTIALS                          ║
╠══════════════════════════════════════════════════════════════════╣
║  Email                     │ Password      │ Role                ║
╠══════════════════════════════════════════════════════════════════╣
║  superadmin@sunday.com     │ Test123456!   │ Super Admin         ║
║  admin@sunday.com          │ Test123456!   │ Admin               ║
║  lawyer1@sunday.com        │ Test123456!   │ Lawyer              ║
║  agent1@sunday.com         │ Test123456!   │ Agent               ║
║  user1@sunday.com          │ Test123456!   │ User (Seller)       ║
║  user2@sunday.com          │ Test123456!   │ User (Buyer)        ║
║  user5@sunday.com          │ Test123456!   │ User (Browser)      ║
╚══════════════════════════════════════════════════════════════════╝
' AS credentials;

SELECT 'Data Summary:' AS info;
SELECT 'Users: ' || COUNT(*)::text FROM profiles WHERE email LIKE '%@sunday.com';
SELECT 'Properties: ' || COUNT(*)::text FROM properties WHERE status = 'published';
SELECT 'Visits: ' || COUNT(*)::text FROM visits;
SELECT 'Negotiations: ' || COUNT(*)::text FROM negotiations;
SELECT 'Offers: ' || COUNT(*)::text FROM negotiation_offers;
SELECT 'Favorites: ' || COUNT(*)::text FROM favorites;
SELECT 'Notifications: ' || COUNT(*)::text FROM notifications;
