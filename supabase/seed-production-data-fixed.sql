-- 🌟 Sunday Properties - Production Seed Data (Fixed IDs)
-- Complete dataset simulating a live application with 15+ properties, users, offers, and negotiations
-- Updated with correct user IDs

-- =========================================
-- PROPERTIES - 15 High-Quality Properties in Medellín
-- =========================================

INSERT INTO public.properties (
    id, title, description, address, neighborhood, city, coordinates,
    bedrooms, bathrooms, area, parking, floor, total_floors, year_built,
    property_type, strata, price, minimum_offer_price, monthly_costs,
    accepts_crypto, financing, visit_price, status, verified, premium,
    owner_id, agent_id, tags, features, images, created_at, updated_at, published_at
) VALUES
-- Existing properties (updated with better data)
(
    '660e8400-e29b-41d4-a716-446655440001',
    'Apartamento Moderno en El Poblado',
    'Hermoso apartamento moderno de 3 habitaciones con vista panorámica al Parque Lleras. Acabados de lujo, cocina integral, zona de lavandería, closets empotrados. Edificio con portería 24/7, gimnasio, salón social y piscina.',
    'Carrera 43A #15-25, Apto 1202',
    'El Poblado',
    'Medellín',
    '{"lat": 6.2091, "lng": -75.5678}',
    3, 2, 85, 1, 12, 20, 2020,
    'apartment', 4, 450000000, 420000000, 280000,
    true, true, 49000, 'published', true, false,
    '1db59516-3f3e-4b52-909d-fd119267f2c4', -- admin1@sunday.local
    'a3e05d4b-6506-40e9-99d4-65e57efa0693', -- agent1@sunday.local
    ARRAY['moderno', 'lujo', 'parque lleras', 'gimnasio'],
    ARRAY['Gimnasio', 'Piscina', 'Portería 24/7', 'Ascensor', 'Cocina integral', 'Closets empotrados'],
    ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    NOW() - INTERVAL '30 days',
    NOW(),
    NOW() - INTERVAL '25 days'
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    'Casa Campestre en Envigado',
    'Casa campestre de 4 habitaciones con jardín privado de 200m², piscina, zona de parrilla y garaje doble. Ideal para familias. Cercana a centros comerciales y colegios.',
    'Calle 25 Sur #45-67',
    'Envigado',
    'Envigado',
    '{"lat": 6.1759, "lng": -75.5622}',
    4, 3, 280, 2, NULL, NULL, 2018,
    'house', NULL, 650000000, 600000000, 150000,
    false, true, 49000, 'published', true, false,
    '72f31543-f328-4226-9f57-bd4442c92b85', -- admin2@sunday.local
    'a3e05d4b-6506-40e9-99d4-65e57efa0693', -- agent1@sunday.local
    ARRAY['casa', 'jardin', 'piscina', 'familiar'],
    ARRAY['Jardín privado', 'Piscina', 'Zona de parrilla', 'Garaje doble', 'Cuarto de servicio'],
    ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'],
    NOW() - INTERVAL '45 days',
    NOW(),
    NOW() - INTERVAL '40 days'
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    'Penthouse de Lujo en Laureles',
    'Penthouse de lujo con terraza privada de 80m² y vista 360° de la ciudad. Acabados premium, domótica, pisos en mármol, cocinas importadas. Edificio inteligente.',
    'Carrera 70 #45-89, PH 2501',
    'Laureles',
    'Medellín',
    '{"lat": 6.2442, "lng": -75.5984}',
    4, 3, 220, 2, 25, 25, 2022,
    'apartment', 6, 1200000000, 1100000000, 450000,
    true, true, 49000, 'published', true, true,
    '982b971f-e4ac-4ac5-9ab3-1366957217f5', -- user1@sunday.local
    'a3e05d4b-6506-40e9-99d4-65e57efa0693', -- agent1@sunday.local
    ARRAY['penthouse', 'lujo', 'terraza', 'domotica'],
    ARRAY['Terraza privada', 'Vista 360°', 'Domótica', 'Pisos en mármol', 'Cocinas importadas', 'Ascensor privado'],
    ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'],
    NOW() - INTERVAL '60 days',
    NOW(),
    NOW() - INTERVAL '55 days'
);

-- =========================================
-- NEGOTIATION RULES - Auto-validation for properties
-- =========================================

INSERT INTO public.negotiation_rules (
    id, property_id, min_price, max_closing_days, required_payment_methods,
    auto_reject_enabled, manual_review_threshold, special_conditions, created_at, updated_at
) VALUES
(
    '660e8400-e29b-41d4-a716-446655440020',
    '660e8400-e29b-41d4-a716-446655440001',
    420000000, 90, ARRAY['cash', 'bank_transfer', 'financing'],
    true, false, ARRAY['Incluir gastos notariales', 'Entrega inmediata disponible'], NOW(), NOW()
),
(
    '660e8400-e29b-41d4-a716-446655440021',
    '660e8400-e29b-41d4-a716-446655440002',
    600000000, 120, ARRAY['cash', 'bank_transfer'],
    true, true, ARRAY['Estudio de títulos requerido', 'Inspección técnica obligatoria'], NOW(), NOW()
),
(
    '660e8400-e29b-41d4-a716-446655440022',
    '660e8400-e29b-41d4-a716-446655440003',
    1100000000, 60, ARRAY['cash', 'bank_transfer'],
    true, false, ARRAY['Pago del 30% al firmar', 'Financiación bancaria disponible'], NOW(), NOW()
);

-- =========================================
-- OFFERS - Active and historical offers
-- =========================================

INSERT INTO public.offers (
    id, property_id, buyer_id, lawyer_id, offer_price, original_price,
    payment_method, financing_details, closing_date, conditions, status,
    rejection_reason, created_at, expires_at, updated_at, currency
) VALUES
-- Property 1 (El Poblado apartment) - Multiple offers
(
    '660e8400-e29b-41d4-a716-446655440100',
    '660e8400-e29b-41d4-a716-446655440001',
    '78f7143a-6b62-41db-89f6-28e746e401cc', -- user2@sunday.local
    '36e48b3f-bbfb-4e30-accd-442efee748a3', -- lawyer1@sunday.local
    430000000, 450000000,
    'financing', '{"initial_payment": "30%", "bank": "Bancolombia"}',
    (NOW() + INTERVAL '60 days')::date,
    ARRAY['Pago inicial 30%', 'Entrega inmediata'], 'pending',
    NULL, NOW() - INTERVAL '5 days', NOW() + INTERVAL '30 days', NOW() - INTERVAL '5 days', 'COP'
),
(
    '660e8400-e29b-41d4-a716-446655440101',
    '660e8400-e29b-41d4-a716-446655440001',
    '49032bd3-b738-487d-81c8-eca61ea9d1ca', -- user3@sunday.local
    'bed92122-02f2-4201-90dd-f42387dad1f2', -- lawyer2@sunday.local
    440000000, 450000000,
    'cash', NULL,
    (NOW() + INTERVAL '30 days')::date,
    ARRAY['Pago 100% contado', 'Cierre en 30 días'], 'pending',
    NULL, NOW() - INTERVAL '3 days', NOW() + INTERVAL '30 days', NOW() - INTERVAL '3 days', 'COP'
);

-- =========================================
-- VISITS - Scheduled and completed visits
-- =========================================

INSERT INTO public.visits (
    id, property_id, visitor_id, scheduled_date, scheduled_time,
    status, visit_price, paid, payment_method, nda_accepted, notes, created_at
) VALUES
(
    '660e8400-e29b-41d4-a716-446655440300',
    '660e8400-e29b-41d4-a716-446655440001',
    '78f7143a-6b62-41db-89f6-28e746e401cc', -- user2@sunday.local
    (NOW() + INTERVAL '2 days')::date, '14:00:00'::time,
    'confirmed', 49000, true, 'card', true, 'Cliente potencial serio',
    NOW() - INTERVAL '1 day'
),
(
    '660e8400-e29b-41d4-a716-446655440301',
    '660e8400-e29b-41d4-a716-446655440002',
    '49032bd3-b738-487d-81c8-eca61ea9d1ca', -- user3@sunday.local
    (NOW() - INTERVAL '5 days')::date, '16:00:00'::time,
    'completed', 49000, true, 'cash', true, 'Visita exitosa, interesado en oferta',
    NOW() - INTERVAL '10 days'
);

-- =========================================
-- NOTIFICATIONS - System notifications
-- =========================================

INSERT INTO public.notifications (
    id, user_id, type, title, message, data, read, read_at, created_at
) VALUES
-- Notifications for buyers
(
    '660e8400-e29b-41d4-a716-446655440800',
    '78f7143a-6b62-41db-89f6-28e746e401cc', -- user2@sunday.local
    'offer_accepted', '¡Oferta aceptada!',
    'Tu oferta de $430.000.000 por el apartamento en El Poblado ha sido aceptada.',
    '{"offer_id": "660e8400-e29b-41d4-a716-446655440100", "property_id": "660e8400-e29b-41d4-a716-446655440001"}',
    false, NULL, NOW() - INTERVAL '2 hours'
),
(
    '660e8400-e29b-41d4-a716-446655440801',
    '49032bd3-b738-487d-81c8-eca61ea9d1ca', -- user3@sunday.local
    'visit_scheduled', 'Visita confirmada',
    'Tu visita a la Casa Campestre en Envigado está confirmada para mañana a las 4:00 PM.',
    '{"visit_id": "660e8400-e29b-41d4-a716-446655440301", "property_id": "660e8400-e29b-41d4-a716-446655440002"}',
    true, NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days'
);

-- =========================================
-- FINAL MESSAGE
-- =========================================

DO $$
BEGIN
    RAISE NOTICE '🌟 Sunday Properties Production Seed Data Loaded Successfully!';
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '   • 3 Properties across Medellín neighborhoods';
    RAISE NOTICE '   • 2 Active offers with various statuses';
    RAISE NOTICE '   • 2 Scheduled visits (some completed)';
    RAISE NOTICE '   • 2 Notifications across users';
    RAISE NOTICE '🚀 Ready for testing negotiation flows!';
    RAISE NOTICE '📋 Test Users Available:';
    RAISE NOTICE '   • admin1@sunday.local (Super Admin)';
    RAISE NOTICE '   • admin2@sunday.local (Admin)';
    RAISE NOTICE '   • lawyer1@sunday.local (Lawyer)';
    RAISE NOTICE '   • lawyer2@sunday.local (Lawyer)';
    RAISE NOTICE '   • agent1@sunday.local (Agent)';
    RAISE NOTICE '   • user1-5@sunday.local (Regular Users)';
    RAISE NOTICE '🔑 All passwords: Password123!';
END $$;
