-- ============================================
-- COMPLETE SETUP & SEED FOR PRODUCTION
-- ============================================
-- RUN THIS SCRIPT IN SUPABASE DASHBOARD > SQL EDITOR
-- This is a combined script that:
--   1. Creates missing tables
--   2. Fixes schema issues (RLS, columns, storage)
--   3. Creates test users
--   4. Seeds all required data
-- ============================================

-- ============================================
-- PART 0: CREATE MISSING TABLES
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create update_updated_at_column function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create negotiations table
CREATE TABLE IF NOT EXISTS public.negotiations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lawyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('open', 'closed', 'archived', 'active', 'pending_lawyer', 'pending_documents', 'completed', 'cancelled', 'expired')),
    participants UUID[] NOT NULL DEFAULT '{}',
    initial_offer_id UUID,
    current_price BIGINT,
    original_price BIGINT,
    negotiation_progress INTEGER DEFAULT 0,
    last_offer_id UUID,
    offer_count INTEGER DEFAULT 1,
    counter_offer_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    milestones_completed JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_negotiations_property ON negotiations(property_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_buyer ON negotiations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_seller ON negotiations(seller_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_status ON negotiations(status);
ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;

-- Create negotiation_offers table
CREATE TABLE IF NOT EXISTS public.negotiation_offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    negotiation_id UUID NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
    author UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    payload JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('offer', 'counter', 'accepted', 'rejected', 'pending', 'expired')),
    parent_offer_id UUID REFERENCES negotiation_offers(id) ON DELETE SET NULL,
    version INTEGER NOT NULL DEFAULT 1,
    author_role TEXT CHECK (author_role IN ('buyer', 'seller', 'agent', 'lawyer', 'admin')),
    kind TEXT NOT NULL DEFAULT 'offer' CHECK (kind IN ('offer', 'counter')),
    valid_until TIMESTAMPTZ,
    price BIGINT,
    down_payment BIGINT,
    payment_method TEXT,
    closing_date DATE,
    conditions JSONB,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_negotiation_offers_negotiation_id ON negotiation_offers(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_offers_author ON negotiation_offers(author);
ALTER TABLE negotiation_offers ENABLE ROW LEVEL SECURITY;

-- Create negotiation_documents table
CREATE TABLE IF NOT EXISTS public.negotiation_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    negotiation_id UUID NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('promise_of_sale', 'promesa', 'otrosi', 'oferta', 'escritura', 'legal', 'other')),
    content JSONB NOT NULL DEFAULT '{}',
    version INTEGER DEFAULT 1,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    document_url TEXT,
    document_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'signed', 'finalized', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE negotiation_documents ENABLE ROW LEVEL SECURITY;

-- Create feature_flags table
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

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Create conversations table if not exists
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    case_id UUID,
    participants UUID[] NOT NULL DEFAULT '{}',
    type VARCHAR(20) NOT NULL DEFAULT 'general' CHECK (type IN ('verification', 'property_inquiry', 'negotiation', 'general')),
    subject VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Add conversation_id to chat_messages if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'conversation_id') THEN
        ALTER TABLE public.chat_messages ADD COLUMN conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- RLS Policies for negotiations
DROP POLICY IF EXISTS "Users can view their negotiations" ON negotiations;
CREATE POLICY "Users can view their negotiations" ON negotiations
    FOR SELECT USING (
        auth.uid() = ANY(participants) OR auth.uid() = buyer_id OR auth.uid() = seller_id OR auth.uid() = lawyer_id
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

DROP POLICY IF EXISTS "Users can create negotiations" ON negotiations;
CREATE POLICY "Users can create negotiations" ON negotiations
    FOR INSERT WITH CHECK (auth.uid() = ANY(participants) OR auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Users can update their negotiations" ON negotiations;
CREATE POLICY "Users can update their negotiations" ON negotiations
    FOR UPDATE USING (
        auth.uid() = ANY(participants) OR auth.uid() = buyer_id OR auth.uid() = seller_id OR auth.uid() = lawyer_id
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- RLS Policies for negotiation_offers
DROP POLICY IF EXISTS "Participants can view offers" ON negotiation_offers;
CREATE POLICY "Participants can view offers" ON negotiation_offers
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM negotiations n WHERE n.id = negotiation_id AND (auth.uid() = ANY(n.participants) OR auth.uid() = author))
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

DROP POLICY IF EXISTS "Participants can create offers" ON negotiation_offers;
CREATE POLICY "Participants can create offers" ON negotiation_offers
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM negotiations n WHERE n.id = negotiation_id AND (auth.uid() = ANY(n.participants) OR auth.uid() = author))
    );

-- RLS Policies for feature_flags
DROP POLICY IF EXISTS "Anyone can read feature flags" ON feature_flags;
CREATE POLICY "Anyone can read feature flags" ON feature_flags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage feature flags" ON feature_flags;
CREATE POLICY "Admins can manage feature flags" ON feature_flags FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- RLS Policies for conversations
DROP POLICY IF EXISTS "Users can read their conversations" ON conversations;
CREATE POLICY "Users can read their conversations" ON conversations
    FOR SELECT USING (auth.uid() = ANY(participants) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = ANY(participants));

-- ============================================
-- PART 1: SCHEMA FIXES
-- ============================================

-- 1.1 Fix profiles RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable all access for service role" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;

CREATE POLICY "Authenticated users can view all profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "Admins can insert all profiles" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "Enable all access for service role" ON profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 1.2 Add verification_status column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN verification_status VARCHAR(20) DEFAULT 'unverified';
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_verification_status_check
      CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected', 'premium'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON public.profiles(verification_status);

-- 1.3 Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('property-images', 'property-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-docs', 'property-docs', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-docs', 'profile-docs', false)
ON CONFLICT (id) DO NOTHING;

-- 1.4 Storage policies
DROP POLICY IF EXISTS "Public read property-images" ON storage.objects;
CREATE POLICY "Public read property-images" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated upload property-images" ON storage.objects;
CREATE POLICY "Authenticated upload property-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated update property-images" ON storage.objects;
CREATE POLICY "Authenticated update property-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated delete property-images" ON storage.objects;
CREATE POLICY "Authenticated delete property-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated upload property-docs" ON storage.objects;
CREATE POLICY "Authenticated upload property-docs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-docs');

DROP POLICY IF EXISTS "Owner read property-docs" ON storage.objects;
CREATE POLICY "Owner read property-docs" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'property-docs' AND (auth.uid()::text = (storage.foldername(name))[1]
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'lawyer'))));

DROP POLICY IF EXISTS "User upload own profile-docs" ON storage.objects;
CREATE POLICY "User upload own profile-docs" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "User read own profile-docs" ON storage.objects;
CREATE POLICY "User read own profile-docs" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'profile-docs' AND (auth.uid()::text = (storage.foldername(name))[1]
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))));

-- Schema fixes applied

-- ============================================
-- PART 2: CREATE TEST USERS
-- ============================================

CREATE OR REPLACE FUNCTION create_test_user(p_email TEXT, p_password TEXT, p_full_name TEXT, p_role TEXT) 
RETURNS UUID AS $$
DECLARE v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    IF v_user_id IS NOT NULL THEN RETURN v_user_id; END IF;
    
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at, confirmation_token, recovery_token)
    VALUES (v_user_id, '00000000-0000-0000-0000-000000000000', p_email, crypt(p_password, gen_salt('bf')), NOW(),
        '{"provider": "email", "providers": ["email"]}', jsonb_build_object('full_name', p_full_name, 'role', p_role),
        'authenticated', 'authenticated', NOW(), NOW(), '', '');
    
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', p_email), 
        'email', v_user_id::text, NOW(), NOW(), NOW());
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
    PERFORM create_test_user('superadmin@sunday.com', 'Test123456!', 'Carlos Administrador', 'super_admin');
    PERFORM create_test_user('admin@sunday.com', 'Test123456!', 'María García', 'admin');
    PERFORM create_test_user('lawyer1@sunday.com', 'Test123456!', 'Dr. Juan Abogado', 'lawyer');
    PERFORM create_test_user('lawyer2@sunday.com', 'Test123456!', 'Dra. Ana Jurista', 'lawyer');
    PERFORM create_test_user('agent1@sunday.com', 'Test123456!', 'Roberto Agente', 'agent');
    PERFORM create_test_user('agent2@sunday.com', 'Test123456!', 'Laura Vendedora', 'agent');
    PERFORM create_test_user('user1@sunday.com', 'Test123456!', 'Andrés Propietario', 'user');
    PERFORM create_test_user('user2@sunday.com', 'Test123456!', 'Sofia Compradora', 'user');
    PERFORM create_test_user('user3@sunday.com', 'Test123456!', 'Miguel Inversionista', 'user');
    PERFORM create_test_user('user4@sunday.com', 'Test123456!', 'Carolina Vendedora', 'user');
    PERFORM create_test_user('user5@sunday.com', 'Test123456!', 'Fernando Buscador', 'user');
    RAISE NOTICE '✅ Test users created';
END $$;

-- ============================================
-- PART 3: UPSERT PROFILES
-- ============================================

INSERT INTO public.profiles (id, email, full_name, role, status, verification_status, phone, bio, location)
SELECT au.id, au.email, COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'role', 'user'), 'active',
    CASE WHEN au.raw_user_meta_data->>'role' IN ('super_admin', 'admin', 'lawyer', 'agent') THEN 'verified' ELSE 'unverified' END,
    '+57 310 ' || lpad((floor(random() * 10000000)::int)::text, 7, '0'),
    CASE 
        WHEN au.raw_user_meta_data->>'role' = 'super_admin' THEN 'Administrador principal de Sunday'
        WHEN au.raw_user_meta_data->>'role' = 'admin' THEN 'Administrador de operaciones'
        WHEN au.raw_user_meta_data->>'role' = 'lawyer' THEN 'Abogado inmobiliario'
        WHEN au.raw_user_meta_data->>'role' = 'agent' THEN 'Agente inmobiliario certificado'
        ELSE 'Usuario de Sunday'
    END,
    CASE floor(random() * 4)::int
        WHEN 0 THEN 'Bogotá, Colombia'
        WHEN 1 THEN 'Medellín, Colombia'
        WHEN 2 THEN 'Cartagena, Colombia'
        ELSE 'Cali, Colombia'
    END
FROM auth.users au WHERE au.email LIKE '%@sunday.com'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email, full_name = EXCLUDED.full_name, role = EXCLUDED.role,
    status = EXCLUDED.status, verification_status = EXCLUDED.verification_status,
    phone = EXCLUDED.phone, bio = EXCLUDED.bio, location = EXCLUDED.location, updated_at = NOW();

-- Profiles created/updated

-- ============================================
-- PART 4: CREATE PROPERTIES
-- ============================================

DO $$
DECLARE
    user1_id UUID; user3_id UUID; user4_id UUID;
    agent1_id UUID; agent2_id UUID;
BEGIN
    SELECT id INTO user1_id FROM profiles WHERE email = 'user1@sunday.com';
    SELECT id INTO user3_id FROM profiles WHERE email = 'user3@sunday.com';
    SELECT id INTO user4_id FROM profiles WHERE email = 'user4@sunday.com';
    SELECT id INTO agent1_id FROM profiles WHERE email = 'agent1@sunday.com';
    SELECT id INTO agent2_id FROM profiles WHERE email = 'agent2@sunday.com';
    
    IF user1_id IS NULL THEN RAISE NOTICE 'Users not found'; RETURN; END IF;
    
    DELETE FROM properties WHERE owner_id IN (user1_id, user3_id, user4_id);
    
    -- Apartamento Chapinero
    INSERT INTO properties (title, description, address, neighborhood, city, coordinates, bedrooms, bathrooms, area, parking, property_type, strata, price, minimum_offer_price, monthly_costs, owner_id, agent_id, status, verified, premium, images, features, tags)
    VALUES ('Apartamento Moderno en Chapinero Alto', 'Hermoso apartamento completamente remodelado con acabados de lujo. Vista despejada hacia los cerros.', 'Calle 67 #12-34', 'Chapinero Alto', 'Bogotá', '{"lat": 4.6483, "lng": -74.0636}', 3, 2, 120, 1, 'apartment', 4, 650000000, 600000000, 180000, user1_id, agent1_id, 'published', true, false, ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'], ARRAY['Gimnasio', 'Seguridad 24/7'], ARRAY['remodelado', 'vista']);
    
    -- Penthouse Zona G
    INSERT INTO properties (title, description, address, neighborhood, city, coordinates, bedrooms, bathrooms, area, parking, property_type, strata, price, minimum_offer_price, monthly_costs, owner_id, agent_id, status, verified, premium, images, features, tags)
    VALUES ('Penthouse de Lujo en Zona G', 'Exclusivo penthouse dúplex con terraza privada de 80m² y vista panorámica 360°.', 'Carrera 7 #85-20', 'Zona G', 'Bogotá', '{"lat": 4.6683, "lng": -74.0576}', 4, 4, 280, 3, 'apartment', 6, 1850000000, 1700000000, 450000, user1_id, agent1_id, 'published', true, true, ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'], ARRAY['Terraza', 'Vista Panorámica', 'Jacuzzi'], ARRAY['penthouse', 'lujo']);
    
    -- Casa El Poblado
    INSERT INTO properties (title, description, address, neighborhood, city, coordinates, bedrooms, bathrooms, area, parking, property_type, strata, price, minimum_offer_price, monthly_costs, owner_id, agent_id, status, verified, premium, images, features, tags)
    VALUES ('Casa Moderna con Piscina en El Poblado', 'Espectacular casa contemporánea con piscina climatizada y jardín paisajizado.', 'Calle 10 Sur #45-67', 'El Poblado', 'Medellín', '{"lat": 6.2091, "lng": -75.5678}', 5, 5, 450, 4, 'house', 6, 2500000000, 2300000000, 600000, user3_id, agent2_id, 'published', true, true, ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'], ARRAY['Piscina', 'Jardín', 'BBQ', 'Domótica'], ARRAY['casa', 'piscina', 'lujo']);
    
    -- Apartamento Laureles
    INSERT INTO properties (title, description, address, neighborhood, city, coordinates, bedrooms, bathrooms, area, parking, property_type, strata, price, minimum_offer_price, monthly_costs, owner_id, agent_id, status, verified, images, features)
    VALUES ('Apartamento Acogedor en Laureles', 'Cómodo apartamento cerca de la 70. Ideal para vivir o invertir.', 'Circular 4 #71-32', 'Laureles', 'Medellín', '{"lat": 6.2456, "lng": -75.5912}', 2, 2, 75, 1, 'apartment', 4, 380000000, 350000000, 120000, user4_id, agent2_id, 'published', true, ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'], ARRAY['Balcón', 'Portería 24/7']);
    
    -- Oficina Salitre
    INSERT INTO properties (title, description, address, neighborhood, city, coordinates, bedrooms, bathrooms, area, parking, property_type, strata, price, minimum_offer_price, monthly_costs, owner_id, status, verified, images, features)
    VALUES ('Oficina Premium en Centro Empresarial', 'Oficina de alta especificación. Piso técnico, cableado estructurado.', 'Av El Dorado #68B-85', 'Salitre', 'Bogotá', '{"lat": 4.6589, "lng": -74.1147}', 0, 2, 150, 3, 'office', 5, 850000000, 800000000, 280000, user3_id, 'published', true, ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'], ARRAY['Aire Acondicionado', 'Piso Técnico']);
    
    -- Villa Cartagena
    INSERT INTO properties (title, description, address, neighborhood, city, coordinates, bedrooms, bathrooms, area, parking, property_type, price, minimum_offer_price, monthly_costs, owner_id, agent_id, status, verified, premium, images, features)
    VALUES ('Villa Frente al Mar en Bocagrande', 'Exclusiva villa con acceso directo a la playa. 6 habitaciones, piscina infinita.', 'Carrera 2 #5-23', 'Bocagrande', 'Cartagena', '{"lat": 10.4019, "lng": -75.5508}', 6, 7, 600, 4, 'house', 4500000000, 4200000000, 800000, user4_id, agent1_id, 'published', true, true, ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'], ARRAY['Frente al Mar', 'Piscina Infinita', 'Muelle']);
    
    RAISE NOTICE '✅ Properties created';
END $$;

-- ============================================
-- PART 5: CREATE NEGOTIATIONS
-- ============================================

DO $$
DECLARE
    buyer1_id UUID; buyer2_id UUID; seller_id UUID; lawyer_id UUID;
    prop1_id UUID; prop2_id UUID; prop_price BIGINT;
    neg_id UUID; offer1_id UUID; offer2_id UUID; offer3_id UUID;
BEGIN
    SELECT id INTO buyer1_id FROM profiles WHERE email = 'user2@sunday.com';
    SELECT id INTO buyer2_id FROM profiles WHERE email = 'user5@sunday.com';
    SELECT id INTO seller_id FROM profiles WHERE email = 'user1@sunday.com';
    SELECT id INTO lawyer_id FROM profiles WHERE email = 'lawyer1@sunday.com';
    SELECT id, price INTO prop1_id, prop_price FROM properties WHERE title LIKE '%Chapinero%' LIMIT 1;
    SELECT id INTO prop2_id FROM properties WHERE title LIKE '%Poblado%' LIMIT 1;
    
    IF buyer1_id IS NULL OR prop1_id IS NULL THEN RAISE NOTICE 'Missing data'; RETURN; END IF;
    
    DELETE FROM negotiations WHERE buyer_id IN (buyer1_id, buyer2_id);
    
    -- Active negotiation with offer chain
    INSERT INTO negotiations (property_id, buyer_id, seller_id, lawyer_id, title, status, participants, current_price, original_price, offer_count, counter_offer_count)
    VALUES (prop1_id, buyer1_id, seller_id, lawyer_id, 'Negociación - Apartamento Chapinero', 'active', ARRAY[buyer1_id, seller_id, lawyer_id], prop_price - 30000000, prop_price, 3, 2)
    RETURNING id INTO neg_id;
    
    INSERT INTO negotiation_offers (negotiation_id, author, payload, status, version, kind, author_role, price, down_payment, payment_method, closing_date, message)
    VALUES (neg_id, buyer1_id, '{"price": 600000000}'::jsonb, 'rejected', 1, 'offer', 'buyer', prop_price - 50000000, (prop_price - 50000000) * 0.2, 'cash', CURRENT_DATE + 45, 'Oferta inicial')
    RETURNING id INTO offer1_id;
    
    INSERT INTO negotiation_offers (negotiation_id, author, payload, status, version, kind, parent_offer_id, author_role, price, payment_method, closing_date, message)
    VALUES (neg_id, seller_id, '{"price": 630000000}'::jsonb, 'rejected', 2, 'counter', offer1_id, 'seller', prop_price - 20000000, 'cash', CURRENT_DATE + 30, 'Contraoferta')
    RETURNING id INTO offer2_id;
    
    INSERT INTO negotiation_offers (negotiation_id, author, payload, status, version, kind, parent_offer_id, author_role, price, payment_method, closing_date, conditions, message)
    VALUES (neg_id, buyer1_id, '{"price": 620000000}'::jsonb, 'pending', 3, 'counter', offer2_id, 'buyer', prop_price - 30000000, 'cash', CURRENT_DATE + 35, '["Incluir electrodomésticos", "Paz y salvo"]'::jsonb, 'Oferta final')
    RETURNING id INTO offer3_id;
    
    UPDATE negotiations SET last_offer_id = offer3_id WHERE id = neg_id;
    
    -- Second negotiation
    IF prop2_id IS NOT NULL THEN
        INSERT INTO negotiations (property_id, buyer_id, seller_id, title, status, participants, current_price, original_price)
        SELECT prop2_id, buyer2_id, p.owner_id, 'Negociación - Casa El Poblado', 'pending_lawyer', ARRAY[buyer2_id, p.owner_id], 2400000000, 2500000000
        FROM properties p WHERE p.id = prop2_id;
    END IF;
    
    RAISE NOTICE '✅ Negotiations created';
END $$;

-- ============================================
-- PART 6: CREATE VISITS
-- ============================================

DO $$
DECLARE buyer_id UUID; prop_id UUID;
BEGIN
    SELECT id INTO buyer_id FROM profiles WHERE email = 'user2@sunday.com';
    SELECT id INTO prop_id FROM properties WHERE title LIKE '%Chapinero%' LIMIT 1;
    IF buyer_id IS NULL THEN RETURN; END IF;
    
    DELETE FROM visits WHERE visitor_id = buyer_id;
    
    INSERT INTO visits (property_id, visitor_id, scheduled_date, scheduled_time, status, visit_price, paid, payment_method, nda_accepted, feedback, rating, completed_at)
    VALUES (prop_id, buyer_id, CURRENT_DATE - 5, '10:00', 'completed', 49000, true, 'card', true, 'Excelente propiedad', 5, NOW() - INTERVAL '5 days');
    
    INSERT INTO visits (property_id, visitor_id, scheduled_date, scheduled_time, status, visit_price, paid, nda_accepted)
    SELECT p.id, buyer_id, CURRENT_DATE + 3, '15:00', 'confirmed', 49000, true, true
    FROM properties p WHERE p.title LIKE '%Poblado%' LIMIT 1;
    
    RAISE NOTICE '✅ Visits created';
END $$;

-- ============================================
-- PART 7: CREATE FAVORITES & NOTIFICATIONS
-- ============================================

DO $$
DECLARE user_id UUID;
BEGIN
    SELECT id INTO user_id FROM profiles WHERE email = 'user2@sunday.com';
    IF user_id IS NULL THEN RETURN; END IF;
    
    DELETE FROM favorites WHERE user_id = user_id;
    INSERT INTO favorites (user_id, property_id, notes)
    SELECT user_id, p.id, 'Para considerar' FROM properties p WHERE p.status = 'published' LIMIT 4 ON CONFLICT DO NOTHING;
    
    DELETE FROM notifications WHERE user_id = user_id;
    INSERT INTO notifications (user_id, type, title, message, read)
    VALUES 
        (user_id, 'offer_received', 'Nueva oferta recibida', 'Has recibido una nueva oferta', false),
        (user_id, 'visit_scheduled', 'Visita programada', 'Tienes una visita el próximo viernes', false),
        (user_id, 'system', 'Bienvenido a Sunday', 'Tu cuenta está verificada', true);
    
    RAISE NOTICE '✅ Favorites & notifications created';
END $$;

-- ============================================
-- PART 8: FEATURE FLAGS
-- ============================================

INSERT INTO feature_flags (flag_name, enabled_globally, metadata) VALUES
    ('structured_conditions', true, '{"description": "Structured conditions"}'),
    ('npv_calculation', true, '{"description": "NPV calculation"}'),
    ('enhanced_lawyer_workflow', true, '{"description": "Enhanced lawyer workflow"}'),
    ('new_dashboard', true, '{"description": "New dashboard"}')
ON CONFLICT (flag_name) DO UPDATE SET enabled_globally = EXCLUDED.enabled_globally, updated_at = NOW();

-- ============================================
-- PART 9: VERIFY ACTIVE USERS
-- ============================================

UPDATE profiles SET verification_status = 'verified'
WHERE id IN (
    SELECT DISTINCT owner_id FROM properties WHERE owner_id IS NOT NULL
    UNION SELECT DISTINCT buyer_id FROM negotiations WHERE buyer_id IS NOT NULL
    UNION SELECT DISTINCT seller_id FROM negotiations WHERE seller_id IS NOT NULL
) AND verification_status != 'verified';

-- ============================================
-- CLEANUP
-- ============================================
DROP FUNCTION IF EXISTS create_test_user;

-- ============================================
-- SUMMARY
-- ============================================
SELECT '
╔══════════════════════════════════════════════════════════════════╗
║              ✅ SETUP & SEED COMPLETED SUCCESSFULLY              ║
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
' as credentials;

SELECT 'Users: ' || COUNT(*)::text FROM profiles WHERE email LIKE '%@sunday.com';
SELECT 'Properties: ' || COUNT(*)::text FROM properties;
SELECT 'Negotiations: ' || COUNT(*)::text FROM negotiations;
SELECT 'Visits: ' || COUNT(*)::text FROM visits;
