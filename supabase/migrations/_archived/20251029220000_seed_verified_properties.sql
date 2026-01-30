-- Seed 10 realistic, verified properties for users 1,2,9,10
-- Also mark those users as verified and set distinct visit availability per property

-- Ensure pgcrypto extension is available for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  u1 UUID;
  u2 UUID;
  u9 UUID;
  u10 UUID;
  instance_uuid UUID;

  p_ids UUID[] := '{}';
  p_id UUID;
BEGIN
  -- Get instance_id from existing users or use default
  SELECT COALESCE((SELECT instance_id FROM auth.users LIMIT 1), '00000000-0000-0000-0000-000000000000'::UUID) INTO instance_uuid;
  -- Resolve or create users by conventional test emails
  -- User 1
  SELECT id INTO u1 FROM auth.users WHERE email IN ('user1@sunday.local','user01@sunday.local') ORDER BY created_at LIMIT 1;
  IF u1 IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
    VALUES (
      gen_random_uuid(),
      instance_uuid,
      'user1@sunday.local',
      crypt('Password123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      ''
    ) RETURNING id INTO u1;
    INSERT INTO public.profiles (id, email, full_name, role, verification_status, status) 
    VALUES (u1, 'user1@sunday.local', 'Usuario Uno', 'user', 'verified', 'active')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- User 2
  SELECT id INTO u2 FROM auth.users WHERE email IN ('user2@sunday.local','user02@sunday.local') ORDER BY created_at LIMIT 1;
  IF u2 IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
    VALUES (
      gen_random_uuid(),
      instance_uuid,
      'user2@sunday.local',
      crypt('Password123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      ''
    ) RETURNING id INTO u2;
    INSERT INTO public.profiles (id, email, full_name, role, verification_status, status) 
    VALUES (u2, 'user2@sunday.local', 'Usuario Dos', 'user', 'verified', 'active')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- User 9
  SELECT id INTO u9 FROM auth.users WHERE email IN ('user9@sunday.local','user09@sunday.local') ORDER BY created_at LIMIT 1;
  IF u9 IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
    VALUES (
      gen_random_uuid(),
      instance_uuid,
      'user9@sunday.local',
      crypt('Password123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      ''
    ) RETURNING id INTO u9;
    INSERT INTO public.profiles (id, email, full_name, role, verification_status, status) 
    VALUES (u9, 'user9@sunday.local', 'Usuario Nueve', 'user', 'verified', 'active')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- User 10
  SELECT id INTO u10 FROM auth.users WHERE email = 'user10@sunday.local' ORDER BY created_at LIMIT 1;
  IF u10 IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
    VALUES (
      gen_random_uuid(),
      instance_uuid,
      'user10@sunday.local',
      crypt('Password123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      ''
    ) RETURNING id INTO u10;
    INSERT INTO public.profiles (id, email, full_name, role, verification_status, status) 
    VALUES (u10, 'user10@sunday.local', 'Usuario Diez', 'user', 'verified', 'active')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Mark profiles as verified if they exist (update in case they were created above)
  UPDATE public.profiles 
  SET verification_status = 'verified', status = 'active', updated_at = NOW()
  WHERE id IN (u1, u2, u9, u10) AND id IS NOT NULL;

  -- Insert 10 properties (published + verified), distributed among owners
  -- Use RETURNING to collect their ids for availability seeding
  WITH ins AS (
    INSERT INTO public.properties (
      title, description, address, neighborhood, city, coordinates,
      bedrooms, bathrooms, area, parking, property_type, strata,
      price, minimum_offer_price, monthly_costs, owner_id, agent_id,
      status, verified, images, features, tags, visit_price, premium
    ) VALUES
    ('Apto Moderno El Poblado', 'Apartamento moderno con vista a la ciudad, acabados de lujo y parqueadero.', 'Cra 30 #15-20', 'El Poblado', 'Medellín', '{"lng": -75.572, "lat": 6.208}'::jsonb, 3, 2, 92, 1, 'apartment', 5, 690000000, 650000000, 220000, u1, NULL, 'published', true, '{"https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200"}', '{"Gimnasio","Piscina"}', '{"Remodelado","Vista"}', 49000, false),
    ('Casa Familiar Laureles', 'Casa de dos niveles con jardín y estudio. Excelente iluminación natural.', 'Calle 40 #75-12', 'Laureles', 'Medellín', '{"lng": -75.594, "lat": 6.244}'::jsonb, 4, 3, 210, 2, 'house', 0, 1250000000, 1180000000, 380000, u1, NULL, 'published', true, '{"https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200"}', '{"Jardín","Estudio"}', '{"Familiar"}', 49000, false),
    ('Penthouse Zona G', 'Penthouse con terraza privada y vista 360°, ascensor privado.', 'Cra 7 #85-20', 'Zona G', 'Bogotá', '{"lng": -74.062, "lat": 4.653}'::jsonb, 4, 4, 230, 2, 'apartment', 6, 1680000000, 1600000000, 520000, u2, NULL, 'published', true, '{"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200"}', '{"Terraza","Ascensor privado"}', '{"Premium"}', 59000, true),
    ('Loft Chicó Norte', 'Loft amoblado, excelente para inversionistas (airbnb-Ready).', 'Calle 94 #15-31', 'Chicó Norte', 'Bogotá', '{"lng": -74.043, "lat": 4.676}'::jsonb, 1, 1, 58, 1, 'apartment', 5, 520000000, 495000000, 260000, u2, NULL, 'published', true, '{"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200"}', '{"Amoblado","Cowork"}', '{"Inversión"}', 49000, false),
    ('Casa Campestre Llanogrande', 'Casa campestre con lote, zona BBQ y salón de juegos.', 'Vereda La Amalita', 'Llanogrande', 'Rionegro', '{"lng": -75.430, "lat": 6.146}'::jsonb, 5, 5, 420, 4, 'house', NULL, 2450000000, 2350000000, 680000, u9, NULL, 'published', true, '{"https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200"}', '{"BBQ","Juegos"}', '{"Campestre"}', 69000, true),
    ('Oficina Poblado Milla de Oro', 'Oficina lista para ocupar, 3 parqueaderos, sala de juntas.', 'Av El Poblado #1-50', 'Milla de Oro', 'Medellín', '{"lng": -75.570, "lat": 6.206}'::jsonb, 0, 1, 110, 3, 'office', NULL, 980000000, 930000000, 420000, u9, NULL, 'published', true, '{"https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=1200"}', '{"Juntas","Recepción"}', '{"Corporativo"}', 49000, false),
    ('Apto Ciudad Jardín', 'Apartamento iluminado, cocina abierta y balcón amplio.', 'Calle 14 #98-22', 'Ciudad Jardín', 'Cali', '{"lng": -76.531, "lat": 3.383}'::jsonb, 3, 2, 96, 1, 'apartment', 5, 460000000, 430000000, 190000, u10, NULL, 'published', true, '{"https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200"}', '{"Balcón","Cocina abierta"}', '{"Oportunidad"}', 49000, false),
    ('Casa San Lucas', 'Casa adosada con terraza y dos parqueaderos.', 'Transv Superior #20-15', 'San Lucas', 'Medellín', '{"lng": -75.561, "lat": 6.185}'::jsonb, 3, 3, 180, 2, 'house', 0, 890000000, 850000000, 350000, u10, NULL, 'published', true, '{"https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200"}', '{"Terraza","Doble parqueadero"}', '{"Remate"}', 49000, false),
    ('Townhouse El Retiro', 'Townhouse duplex con chimenea y deck de madera.', 'Kilómetro 23 Vía Las Palmas', 'Las Palmas', 'El Retiro', '{"lng": -75.508, "lat": 6.064}'::jsonb, 2, 2, 140, 2, 'townhouse', NULL, 720000000, 690000000, 300000, u1, NULL, 'published', true, '{"https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200"}', '{"Chimenea","Deck"}', '{"Duplex"}', 49000, false),
    ('Local Comercial Provenza', 'Local esquinero alta visibilidad, ideal gastro/bar.', 'Calle 10 #36-20', 'Provenza', 'Medellín', '{"lng": -75.567, "lat": 6.207}'::jsonb, 0, 1, 85, 0, 'commercial', NULL, 1250000000, 1180000000, 0, u2, NULL, 'published', true, '{"https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=1200"}', '{"Esquinero","Alto flujo"}', '{"Gastro"}', 49000, false),
    ('Apto Laureles Estadio', 'Apartamento remodelado cerca al estadio, 2 balcones.', 'Circular 4 #70-12', 'Laureles', 'Medellín', '{"lng": -75.590, "lat": 6.256}'::jsonb, 2, 2, 78, 1, 'apartment', 4, 520000000, 495000000, 230000, u9, NULL, 'published', true, '{"https://images.unsplash.com/photo-1501183638710-841dd1904471?w=1200"}', '{"Balcones","Remodelado"}', '{"Ubicación"}', 49000, false)
    RETURNING id
  )
  SELECT array_agg(id) INTO p_ids FROM ins;

  -- Enable visit scheduling on those properties (if the column exists)
  UPDATE public.properties SET visit_availability_enabled = true WHERE id = ANY(p_ids);

  -- Seed distinct availability windows for each property
  -- For variety: different days/hours/max per day
  FOREACH p_id IN ARRAY p_ids LOOP
    -- Monday 09:00-12:00
    INSERT INTO public.property_visit_availability (property_id, day_of_week, start_time, end_time, advance_booking_days, max_visits_per_day, is_active)
    VALUES (p_id, 1, '09:00', '12:00', 1, 3, true)
    ON CONFLICT DO NOTHING;

    -- Wednesday 14:00-18:00
    INSERT INTO public.property_visit_availability (property_id, day_of_week, start_time, end_time, advance_booking_days, max_visits_per_day, is_active)
    VALUES (p_id, 3, '14:00', '18:00', 2, 2, true)
    ON CONFLICT DO NOTHING;

    -- Saturday 10:00-16:00 with higher daily cap
    INSERT INTO public.property_visit_availability (property_id, day_of_week, start_time, end_time, advance_booking_days, max_visits_per_day, is_active)
    VALUES (p_id, 6, '10:00', '16:00', 1, 5, true)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;


