-- Seed data for negotiation system testing
-- This file contains comprehensive test data for the negotiation features

-- Insert test properties with negotiation rules
INSERT INTO properties (
    id, title, description, address, neighborhood, city, coordinates, price, area, bedrooms, bathrooms,
    parking, property_type, status, owner_id, created_at
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Apartamento Moderno en El Poblado',
    'Hermoso apartamento moderno con vista panorámica, ubicado en el corazón de El Poblado. Ideal para familias jóvenes o profesionales.',
    'Carrera 43A #15-25',
    'El Poblado',
    'Medellín',
    '{"lat": 6.2091, "lng": -75.5678}',
    450000000,
    85,
    3,
    2,
    1,
    'apartment',
    'published',
    '550e8400-e29b-41d4-a716-446655440010',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Casa Campestre en Envigado',
    'Casa campestre con jardín privado, piscina y zona de parrilla. Perfecta para familias que buscan tranquilidad.',
    'Calle 25 Sur #45-67',
    'Envigado',
    'Envigado',
    '{"lat": 6.1759, "lng": -75.5622}',
    650000000,
    120,
    4,
    3,
    2,
    'house',
    'published',
    '550e8400-e29b-41d4-a716-446655440011',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Penthouse de Lujo en Laureles',
    'Penthouse de lujo con terraza privada y vista 360° de la ciudad. Acabados de primera calidad.',
    'Carrera 70 #45-89',
    'Laureles',
    'Medellín',
    '{"lat": 6.2442, "lng": -75.5984}',
    850000000,
    150,
    4,
    3,
    2,
    'apartment',
    'published',
    '550e8400-e29b-41d4-a716-446655440012',
    NOW()
);

-- Insert negotiation rules for properties
INSERT INTO negotiation_rules (
    id, property_id, min_price, max_closing_days, required_payment_methods,
    auto_reject_enabled, manual_review_threshold, special_conditions, created_at
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440001',
    420000000, -- Min price: 420M COP
    90, -- Max 90 days to close
    ARRAY['cash', 'bank_transfer', 'financing'],
    true,
    false,
    ARRAY['Incluir gastos notariales', 'Entrega inmediata disponible'],
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440002',
    600000000, -- Min price: 600M COP
    120, -- Max 120 days to close
    ARRAY['cash', 'bank_transfer'],
    true,
    true,
    ARRAY['Estudio de títulos requerido', 'Inspección técnica obligatoria'],
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440022',
    '550e8400-e29b-41d4-a716-446655440003',
    800000000, -- Min price: 800M COP
    60, -- Max 60 days to close
    ARRAY['cash', 'bank_transfer'],
    true,
    false,
    ARRAY['Pago del 30% al firmar', 'Financiación bancaria disponible'],
    NOW()
);

-- Insert test offers
INSERT INTO offers (
    id, property_id, buyer_id, offer_price, original_price, payment_method, closing_date,
    status, conditions, expires_at, created_at, updated_at
) VALUES 
-- Offers for Property 1 (El Poblado)
(
    '550e8400-e29b-41d4-a716-446655440030',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440013',
    440000000,
    450000000, -- original property price
    'cash',
    CURRENT_DATE + INTERVAL '45 days',
    'pending',
    ARRAY['Incluir electrodomésticos', 'Entrega en 30 días'],
    NOW() + INTERVAL '7 days', -- expires in 7 days
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440031',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440014',
    430000000,
    450000000, -- original property price
    'financing',
    CURRENT_DATE + INTERVAL '60 days',
    'pending',
    ARRAY['Financiación del 70%', 'Estudio de títulos'],
    NOW() + INTERVAL '7 days', -- expires in 7 days
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440032',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440015',
    410000000, -- Below minimum - will be auto-rejected
    450000000, -- original property price
    'cash',
    CURRENT_DATE + INTERVAL '30 days',
    'rejected',
    ARRAY['Oferta rápida'],
    NOW() + INTERVAL '7 days', -- expires in 7 days
    NOW(),
    NOW()
),

-- Insert test verification requests
INSERT INTO verification_requests (
    id, user_id, document_type, document_url, selfie_url,
    full_name, dob, nationality, phone, address,
    status, submitted_at
) VALUES
(
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440012',
    'cedula_ciudadania',
    'https://example.com/docs/cedula-front.jpg',
    'https://example.com/docs/selfie.jpg',
    'Juan Carlos Pérez',
    '1985-03-15',
    'Colombia',
    '+57 300 123 4567',
    'Carrera 43A #15-25, El Poblado, Medellín',
    'approved',
    NOW() - INTERVAL '5 days'
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440013',
    'cedula_extranjeria',
    'https://example.com/docs/cedula-ext-front.jpg',
    'https://example.com/docs/selfie2.jpg',
    'Maria González',
    '1990-07-22',
    'Spain',
    '+57 301 234 5678',
    'Calle 25 Sur #45-67, Envigado',
    'pending',
    NOW() - INTERVAL '2 days'
);

-- Insert platform settings
INSERT INTO platform_settings (setting_key, setting_value, updated_by) VALUES
('max_photos_per_property', '20', '550e8400-e29b-41d4-a716-446655440001'),
('max_file_size_mb', '10', '550e8400-e29b-41d4-a716-446655440001'),
('default_offer_validity_days', '7', '550e8400-e29b-41d4-a716-446655440001'),
('enable_oauth_login', 'false', '550e8400-e29b-41d4-a716-446655440001'),
('auto_approve_properties', 'false', '550e8400-e29b-41d4-a716-446655440001'),
('commission_rate_percent', '3.5', '550e8400-e29b-41d4-a716-446655440001'),
('required_verification_for_publish', 'true', '550e8400-e29b-41d4-a716-446655440001'),
('auto_reject_offers_below_min', 'true', '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample reports for testing
INSERT INTO reports (
    id, reporter_id, reported_user_id, reported_property_id,
    report_type, title, description, status, priority,
    created_at
) VALUES
(
    '770e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440011', -- Regular user reporting
    '550e8400-e29b-41d4-a716-446655440012', -- Property owner
    '550e8400-e29b-41d4-a716-446655440001', -- Property being reported
    'fake_listing',
    'Anuncio falso - propiedad no existe',
    'He visitado la dirección proporcionada y la propiedad no existe. Parece ser un anuncio falso para estafar a posibles compradores.',
    'pending',
    'high',
    NOW() - INTERVAL '2 days'
),
(
    '770e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440014',
    NULL,
    'harassment',
    'Comportamiento ofensivo en visita',
    'El propietario fue extremadamente grosero durante la visita programada. Usó lenguaje inapropiado y amenazó con no devolver mi depósito.',
    'under_review',
    'medium',
    NOW() - INTERVAL '1 day'
),
(
    '770e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440015',
    NULL,
    '550e8400-e29b-41d4-a716-446655440002',
    'inappropriate_content',
    'Imágenes inapropiadas en anuncio',
    'Las fotos del anuncio contienen contenido que no corresponde a una propiedad inmobiliaria. Esto viola las políticas de la plataforma.',
    'resolved',
    'high',
    NOW() - INTERVAL '5 days'
),
(
    '770e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440016',
    '550e8400-e29b-41d4-a716-446655440017',
    NULL,
    'spam',
    'Mensajes no solicitados repetitivos',
    'Este usuario me ha enviado múltiples mensajes no solicitados promocionando servicios no relacionados con la plataforma.',
    'dismissed',
    'low',
    NOW() - INTERVAL '3 days'
),
(
    '770e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440018',
    NULL,
    '550e8400-e29b-41d4-a716-446655440003',
    'copyright_violation',
    'Uso de imágenes sin autorización',
    'Las imágenes utilizadas en este anuncio son de mi propiedad y fueron tomadas sin mi permiso. Tengo los derechos de autor.',
    'pending',
    'critical',
    NOW() - INTERVAL '6 hours'
);
