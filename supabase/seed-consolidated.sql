-- 🌟 Sunday Properties - Consolidated Seed Data
-- Complete seed file combining local and production seed data
-- Run this after creating auth users via: node scripts/seed-users.mjs

-- =========================================
-- PROFILES - Update profiles with correct roles and verification status
-- =========================================

INSERT INTO public.profiles (id, email, full_name, role, status, verification_status)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  CASE
    WHEN au.email = 'superadmin@sunday.local' THEN 'super_admin'
    WHEN au.email IN ('admin@sunday.local', 'admin1@sunday.local') THEN 'admin'
    WHEN au.email IN ('lawyer1@sunday.local', 'lawyer2@sunday.local', 'lawyer3@sunday.local') THEN 'lawyer'
    WHEN au.email IN ('agent1@sunday.local', 'agent2@sunday.local', 'agent3@sunday.local', 'agent4@sunday.local', 'premium1@sunday.local', 'premium2@sunday.local') THEN 'agent'
    ELSE 'user'
  END,
  'active',
  CASE
    WHEN au.email IN ('superadmin@sunday.local', 'admin@sunday.local', 'admin1@sunday.local', 
                      'lawyer1@sunday.local', 'lawyer2@sunday.local', 'lawyer3@sunday.local', 
                      'agent1@sunday.local', 'agent2@sunday.local', 'agent3@sunday.local', 'agent4@sunday.local',
                      'premium1@sunday.local', 'premium2@sunday.local') THEN 'verified'
    ELSE 'unverified'
  END
FROM auth.users au
WHERE au.email LIKE '%@sunday.local'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  verification_status = EXCLUDED.verification_status;

-- =========================================
-- PROPERTIES - Seed properties assigned to regular users only
-- =========================================

DO $$
DECLARE
  regular_user_ids UUID[];
  user_count INTEGER;
  property_count INTEGER := 0;
BEGIN
  -- Get all regular user IDs
  SELECT ARRAY_AGG(id) INTO regular_user_ids
  FROM profiles
  WHERE role = 'user' AND status = 'active';
  
  SELECT COUNT(*) INTO user_count FROM profiles WHERE role = 'user' AND status = 'active';
  
  IF user_count = 0 THEN
    RAISE NOTICE 'No regular users found. Skipping property seeding.';
    RETURN;
  END IF;

  -- Get agent IDs for agent_id assignment
  DECLARE
    agent_ids UUID[];
    agent_count INTEGER;
  BEGIN
    SELECT ARRAY_AGG(id) INTO agent_ids
    FROM profiles
    WHERE role = 'agent' AND status = 'active'
    LIMIT 4;
    
    agent_count := COALESCE(array_length(agent_ids, 1), 0);
    
    -- Insert properties, distributing them evenly among regular users
    -- Only insert if properties don't already exist
    IF NOT EXISTS (SELECT 1 FROM properties LIMIT 1) THEN
      INSERT INTO public.properties (
        title, description, address, neighborhood, city, coordinates,
        bedrooms, bathrooms, area, parking, property_type, strata,
        price, minimum_offer_price, monthly_costs, owner_id, agent_id,
        status, verified, images, features, created_at, updated_at, published_at
      ) VALUES
      -- Property 1
      (
        'Apartamento Ejecutivo Chapinero',
        'Hermoso apartamento completamente remodelado en el corazón de Chapinero',
        'Calle 67 #12-34', 'Chapinero', 'Bogotá',
        '{"lat": 4.6483, "lng": -74.0636}'::jsonb,
        3, 2, 120, 1, 'apartment', 4,
        650000000, 600000000, 180000,
        regular_user_ids[1 % user_count + 1],
        CASE WHEN agent_count > 0 THEN agent_ids[1 % agent_count + 1] ELSE NULL END,
        'published', true,
        ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
        ARRAY['Piscina', 'Gimnasio'],
        NOW() - INTERVAL '30 days', NOW(), NOW() - INTERVAL '25 days'
      ),
      -- Property 2
      (
        'Penthouse Zona G',
        'Exclusivo penthouse con terraza privada y vista panorámica',
        'Carrera 7 #85-20', 'Zona G', 'Bogotá',
        '{"lat": 4.6583, "lng": -74.0676}'::jsonb,
        4, 3, 200, 2, 'apartment', 5,
        1200000000, 1100000000, 350000,
        regular_user_ids[2 % user_count + 1],
        CASE WHEN agent_count > 0 THEN agent_ids[2 % agent_count + 1] ELSE NULL END,
        'published', true,
        ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
        ARRAY['Terraza privada', 'Vista panorámica'],
        NOW() - INTERVAL '45 days', NOW(), NOW() - INTERVAL '40 days'
      ),
      -- Property 3
      (
        'Casa Moderna Usaquén',
        'Casa contemporánea con jardín y piscina',
        'Calle 120 #15-45', 'Usaquén', 'Bogotá',
        '{"lat": 4.6783, "lng": -74.0336}'::jsonb,
        4, 4, 350, 2, 'house', NULL,
        1800000000, 1700000000, 450000,
        regular_user_ids[3 % user_count + 1],
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
        regular_user_ids[4 % user_count + 1],
        CASE WHEN agent_count > 0 THEN agent_ids[4 % agent_count + 1] ELSE NULL END,
        'published', true,
        ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
        ARRAY['Gimnasio', 'Piscina', 'Portería 24/7', 'Ascensor'],
        NOW() - INTERVAL '20 days', NOW(), NOW() - INTERVAL '15 days'
      ),
      -- Property 5
      (
        'Casa Campestre en Envigado',
        'Casa campestre de 4 habitaciones con jardín privado de 200m², piscina, zona de parrilla y garaje doble.',
        'Calle 25 Sur #45-67', 'Envigado', 'Envigado',
        '{"lat": 6.1759, "lng": -75.5622}'::jsonb,
        4, 3, 280, 2, 'house', NULL,
        650000000, 600000000, 150000,
        regular_user_ids[5 % user_count + 1],
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
  END;
END $$;

-- =========================================
-- REASSIGN PROPERTIES TO REGULAR USERS
-- =========================================
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

-- Seed completed successfully!

