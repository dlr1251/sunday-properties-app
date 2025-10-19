-- Script de datos iniciales para Sundap Properties
-- Ejecutar después de crear el esquema

-- Insertar usuarios
INSERT INTO users (id, email, name, phone, user_type, verified_at, created_at) VALUES
-- Usuario 1 - Registrado
('11111111-1111-1111-1111-111111111111', 'usuario1@sundap.com', 'Carlos Ramírez', '+57 300 123 4567', 'registered', NULL, NOW() - INTERVAL '30 days'),

-- Usuario 2 - Vendedor
('22222222-2222-2222-2222-222222222222', 'usuario2@sundap.com', 'María López', '+57 300 234 5678', 'verified', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),

-- Usuario 3 - Comprador/Vendedor
('33333333-3333-3333-3333-333333333333', 'usuario3@sundap.com', 'Jorge Martínez', '+57 300 345 6789', 'verified', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),

-- Usuario 4 - Vendedor Activo
('44444444-4444-4444-4444-444444444444', 'usuario4@sundap.com', 'Ana Gómez', '+57 300 456 7890', 'premium', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),

-- Usuario 5 - Vendedor con Promesa Firmada
('55555555-5555-5555-5555-555555555555', 'usuario5@sundap.com', 'Pedro Sánchez', '+57 300 567 8901', 'premium', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),

-- Usuario 6 - Comprador con Promesa
('66666666-6666-6666-6666-666666666666', 'usuario6@sundap.com', 'Laura Fernández', '+57 300 678 9012', 'verified', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),

-- Usuario 7 - Vendedor en Negociación
('77777777-7777-7777-7777-777777777777', 'usuario7@sundap.com', 'Roberto Torres', '+57 300 789 0123', 'premium', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),

-- Usuario 8 - Abogado
('88888888-8888-8888-8888-888888888888', 'abogado1@sundap.com', 'Dr. Andrés Morales', '+57 300 890 1234', 'lawyer', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

-- Usuario 9 - Abogado
('99999999-9999-9999-9999-999999999999', 'abogado2@sundap.com', 'Dra. Patricia Ruiz', '+57 300 901 2345', 'lawyer', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

-- Usuario 10 - SuperAdmin
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@sundap.com', 'Sistema Administrativo', '+57 300 012 3456', 'superadmin', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- Insertar propiedades
INSERT INTO properties (id, title, description, address, neighborhood, city, coordinates, bedrooms, bathrooms, area, parking, floor, total_floors, year_built, property_type, strata, price, minimum_offer_price, monthly_costs, accepts_crypto, financing, visit_price, status, verified, premium, images, owner_id, created_at) VALUES
-- Propiedades de Usuario 2 (María López)
('p1111111-1111-1111-1111-111111111111', 'Apartamento Moderno en El Poblado', 'Hermoso apartamento de 3 habitaciones en el corazón de El Poblado, con excelente ubicación cerca a centros comerciales y transporte público.', 'Carrera 43A #5-50', 'El Poblado', 'Medellín', '{"lat": 6.2088, "lng": -75.5676}', 3, 2, 85, 1, 8, 15, 2018, 'apartment', 4, 450000000, 420000000, 450000, true, true, 49000, 'published', true, false, '{"https://picsum.photos/800/600?random=1", "https://picsum.photos/800/600?random=2"}', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '20 days'),

('p2222222-2222-2222-2222-222222222222', 'Casa Familiar en Laureles', 'Casa de 4 habitaciones en Laureles, con jardín privado y excelente conectividad. Ideal para familias.', 'Calle 70 #45-23', 'Laureles', 'Medellín', '{"lat": 6.2418, "lng": -75.5900}', 4, 3, 120, 2, 1, 2, 2015, 'house', 3, 380000000, 350000000, 320000, false, true, 49000, 'published', true, false, '{"https://picsum.photos/800/600?random=3", "https://picsum.photos/800/600?random=4"}', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '18 days'),

('p3333333-3333-3333-3333-333333333333', 'Apartamento en Envigado', 'Apartamento de 2 habitaciones en Envigado, cerca al metro y con vista a la montaña.', 'Carrera 48 #30-15', 'Envigado', 'Medellín', '{"lat": 6.1699, "lng": -75.5850}', 2, 2, 65, 1, 5, 12, 2020, 'apartment', 3, 280000000, 260000000, 280000, true, false, 49000, 'published', true, false, '{"https://picsum.photos/800/600?random=5", "https://picsum.photos/800/600?random=6"}', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '15 days'),

-- Propiedades de Usuario 3 (Jorge Martínez)
('p4444444-4444-4444-4444-444444444444', 'Casa en Belén', 'Casa de 3 habitaciones en Belén, con terraza y vista panorámica.', 'Calle 30 #75-40', 'Belén', 'Medellín', '{"lat": 6.2000, "lng": -75.6000}', 3, 2, 95, 1, 1, 2, 2017, 'house', 2, 320000000, 300000000, 250000, false, true, 49000, 'published', true, false, '{"https://picsum.photos/800/600?random=7", "https://picsum.photos/800/600?random=8"}', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '12 days'),

('p5555555-5555-5555-5555-555555555555', 'Apartamento en Robledo', 'Apartamento de 2 habitaciones en Robledo, con balcón y excelente iluminación.', 'Carrera 80 #65-20', 'Robledo', 'Medellín', '{"lat": 6.2500, "lng": -75.6200}', 2, 1, 55, 1, 3, 8, 2019, 'apartment', 2, 180000000, 170000000, 180000, false, false, 49000, 'published', true, false, '{"https://picsum.photos/800/600?random=9", "https://picsum.photos/800/600?random=10"}', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '10 days'),

('p6666666-6666-6666-6666-666666666666', 'Casa en Bello', 'Casa de 4 habitaciones en Bello, con garaje para 2 carros y jardín.', 'Calle 50 #45-30', 'Bello', 'Medellín', '{"lat": 6.3300, "lng": -75.5500}', 4, 3, 140, 2, 1, 2, 2016, 'house', 2, 250000000, 230000000, 200000, false, true, 49000, 'published', true, false, '{"https://picsum.photos/800/600?random=11", "https://picsum.photos/800/600?random=12"}', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '8 days');

-- Continuar con más propiedades...
-- Propiedades de Usuario 4 (Ana Gómez)
('p7777777-7777-7777-7777-777777777777', 'Penthouse en El Poblado', 'Lujoso penthouse de 4 habitaciones con terraza privada y vista panorámica de la ciudad.', 'Carrera 37 #8-50', 'El Poblado', 'Medellín', '{"lat": 6.2100, "lng": -75.5700}', 4, 3, 150, 2, 20, 20, 2021, 'apartment', 5, 850000000, 800000000, 650000, true, true, 49000, 'published', true, true, '{"https://picsum.photos/800/600?random=13", "https://picsum.photos/800/600?random=14"}', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '6 days'),

('p8888888-8888-8888-8888-888888888888', 'Casa en Laureles', 'Casa de 3 habitaciones en Laureles, con patio interior y excelente ubicación.', 'Calle 75 #40-15', 'Laureles', 'Medellín', '{"lat": 6.2400, "lng": -75.5900}', 3, 2, 100, 1, 1, 2, 2018, 'house', 3, 420000000, 400000000, 350000, false, true, 49000, 'published', true, true, '{"https://picsum.photos/800/600?random=15", "https://picsum.photos/800/600?random=16"}', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '5 days'),

('p9999999-9999-9999-9999-999999999999', 'Apartamento en Envigado', 'Apartamento de 2 habitaciones en Envigado, moderno y bien ubicado.', 'Carrera 50 #25-30', 'Envigado', 'Medellín', '{"lat": 6.1700, "lng": -75.5800}', 2, 2, 70, 1, 4, 10, 2020, 'apartment', 3, 290000000, 270000000, 300000, true, false, 49000, 'published', true, true, '{"https://picsum.photos/800/600?random=17", "https://picsum.photos/800/600?random=18"}', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '4 days'),

('paaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Casa en Sabaneta', 'Casa de 4 habitaciones en Sabaneta, con jardín y garaje.', 'Calle 60 #50-25', 'Sabaneta', 'Medellín', '{"lat": 6.1500, "lng": -75.6000}', 4, 3, 130, 2, 1, 2, 2019, 'house', 2, 350000000, 330000000, 280000, false, true, 49000, 'published', true, true, '{"https://picsum.photos/800/600?random=19", "https://picsum.photos/800/600?random=20"}', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '3 days'),

-- Propiedades de Usuario 5 (Pedro Sánchez)
('pbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Apartamento en El Poblado', 'Apartamento de 3 habitaciones en El Poblado, con balcón y vista a la montaña.', 'Carrera 45 #10-20', 'El Poblado', 'Medellín', '{"lat": 6.2000, "lng": -75.5600}', 3, 2, 90, 1, 6, 12, 2017, 'apartment', 4, 480000000, 450000000, 400000, true, true, 49000, 'published', true, true, '{"https://picsum.photos/800/600?random=21", "https://picsum.photos/800/600?random=22"}', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '2 days'),

('pccccccc-cccc-cccc-cccc-cccccccccccc', 'Casa en Laureles', 'Casa de 3 habitaciones en Laureles, con terraza y excelente ubicación.', 'Calle 80 #35-40', 'Laureles', 'Medellín', '{"lat": 6.2300, "lng": -75.5800}', 3, 2, 110, 1, 1, 2, 2016, 'house', 3, 380000000, 360000000, 300000, false, true, 49000, 'published', true, true, '{"https://picsum.photos/800/600?random=23", "https://picsum.photos/800/600?random=24"}', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '1 day'),

-- Propiedades de Usuario 6 (Laura Fernández)
('pddddddd-dddd-dddd-dddd-dddddddddddd', 'Apartamento en Envigado', 'Apartamento de 2 habitaciones en Envigado, moderno y bien ubicado.', 'Carrera 52 #28-15', 'Envigado', 'Medellín', '{"lat": 6.1600, "lng": -75.5700}', 2, 2, 75, 1, 3, 8, 2021, 'apartment', 3, 320000000, 300000000, 320000, true, false, 49000, 'published', true, false, '{"https://picsum.photos/800/600?random=25", "https://picsum.photos/800/600?random=26"}', '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '1 day'),

-- Propiedades de Usuario 7 (Roberto Torres)
('peeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Casa en El Poblado', 'Casa de 4 habitaciones en El Poblado, con jardín privado y excelente ubicación.', 'Carrera 40 #12-30', 'El Poblado', 'Medellín', '{"lat": 6.1900, "lng": -75.5500}', 4, 3, 140, 2, 1, 3, 2018, 'house', 4, 650000000, 620000000, 500000, true, true, 49000, 'published', true, true, '{"https://picsum.photos/800/600?random=27", "https://picsum.photos/800/600?random=28"}', '77777777-7777-7777-7777-777777777777', NOW() - INTERVAL '1 day'),

('pfffffff-ffff-ffff-ffff-ffffffffffff', 'Apartamento en Laureles', 'Apartamento de 3 habitaciones en Laureles, con balcón y vista panorámica.', 'Calle 70 #50-25', 'Laureles', 'Medellín', '{"lat": 6.2500, "lng": -75.6000}', 3, 2, 95, 1, 5, 10, 2019, 'apartment', 3, 420000000, 400000000, 350000, false, true, 49000, 'published', true, true, '{"https://picsum.photos/800/600?random=29", "https://picsum.photos/800/600?random=30"}', '77777777-7777-7777-7777-777777777777', NOW() - INTERVAL '1 day');

-- Insertar casos para abogados
INSERT INTO cases (id, lawyer_id, buyer_id, seller_id, property_id, case_number, title, description, status, start_date, expected_close_date, created_at) VALUES
-- Caso 1: Abogado 8 (Dr. Andrés Morales) - Usuario 5 y Usuario 6
('c1111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', '66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 'pbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'CASE-2024-001', 'Compraventa Apartamento El Poblado', 'Caso de compraventa de apartamento en El Poblado entre Laura Fernández (compradora) y Pedro Sánchez (vendedor).', 'active', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '15 days', NOW() - INTERVAL '5 days'),

-- Caso 2: Abogado 9 (Dra. Patricia Ruiz) - Usuario 4 y Usuario 7
('c2222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', 'peeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'CASE-2024-002', 'Compraventa Casa El Poblado', 'Caso de compraventa de casa en El Poblado entre Ana Gómez (compradora) y Roberto Torres (vendedor).', 'active', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '20 days', NOW() - INTERVAL '3 days');

-- Insertar ofertas
INSERT INTO offers (id, property_id, buyer_id, lawyer_id, offer_price, original_price, payment_method, financing_details, crypto_details, closing_date, status, message, created_at) VALUES
-- Usuario 3 → Usuario 2: Oferta de $280M (precio original $300M)
('o1111111-1111-1111-1111-111111111111', 'p3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', NULL, 280000000, 300000000, 'financing', '{"downPayment": 84000000, "monthlyPayment": 1200000, "termMonths": 180, "interestRate": 12.5}', NULL, CURRENT_DATE + INTERVAL '30 days', 'pending', 'Me interesa mucho esta propiedad. Ofrezco $280M con financiación bancaria.', NOW() - INTERVAL '5 days'),

-- Usuario 3 → Usuario 4: Oferta de $450M (precio original $480M)
('o2222222-2222-2222-2222-222222222222', 'p8888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', NULL, 450000000, 480000000, 'mixed', '{"downPayment": 135000000, "monthlyPayment": 2000000, "termMonths": 180, "interestRate": 11.8}', '{"currency": "BTC", "amount": 0.5, "exchangeRate": 200000000}', CURRENT_DATE + INTERVAL '45 days', 'pending', 'Excelente ubicación. Ofrezco $450M con parte en efectivo y parte en Bitcoin.', NOW() - INTERVAL '3 days'),

-- Usuario 4 → Usuario 7: Promesa en edición ($520M)
('o3333333-3333-3333-3333-333333333333', 'peeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', '99999999-9999-9999-9999-999999999999', 520000000, 650000000, 'cash', NULL, NULL, CURRENT_DATE + INTERVAL '60 days', 'negotiating', 'Propuesta de compra en efectivo por $520M. Esperamos respuesta.', NOW() - INTERVAL '2 days'),

-- Usuario 6 → Usuario 5: Promesa firmada ($380M)
('o4444444-4444-4444-4444-444444444444', 'pbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', '88888888-8888-8888-8888-888888888888', 380000000, 480000000, 'financing', '{"downPayment": 114000000, "monthlyPayment": 1800000, "termMonths": 180, "interestRate": 12.0}', NULL, CURRENT_DATE + INTERVAL '30 days', 'accepted', 'Promesa de compraventa firmada por $380M con financiación bancaria.', NOW() - INTERVAL '1 day');

-- Insertar visitas
INSERT INTO visits (id, property_id, visitor_id, scheduled_date, scheduled_time, status, visit_price, paid, payment_method, nda_accepted, feedback, rating, notes, documents_unlocked, created_at) VALUES
-- Usuario 1 programó visita a propiedad de Usuario 2
('v1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', CURRENT_DATE + INTERVAL '2 days', '14:00:00', 'confirmed', 49000, true, 'card', true, NULL, NULL, 'Interesado en conocer la propiedad', false, NOW() - INTERVAL '1 day');

-- Insertar documentos de casos
INSERT INTO case_documents (id, case_id, document_type, document_name, document_content, status, signed_by, signed_at, created_at) VALUES
-- Caso 1: Documentos firmados
('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'promesa', 'Promesa de Compraventa - Apartamento El Poblado', 'PROMESA DE COMPRAVENTA...', 'signed', '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days'),
('d2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'otrosi', 'Otrosí No. 1 - Modificación de Plazos', 'OTROSÍ No. 1...', 'signed', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- Caso 2: Documentos en edición
('d3333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'promesa', 'Promesa de Compraventa - Casa El Poblado', 'PROMESA DE COMPRAVENTA...', 'review', NULL, NULL, NOW() - INTERVAL '1 day'),
('d4444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222', 'oferta', 'Oferta de Compra - Casa El Poblado', 'OFERTA DE COMPRA...', 'draft', NULL, NULL, NOW() - INTERVAL '1 day');

-- Insertar mensajes de chat
INSERT INTO chat_messages (id, case_id, sender_id, receiver_id, message, message_type, read, created_at) VALUES
-- Caso 1: Conversación entre abogado y clientes
('m1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', '66666666-6666-6666-6666-666666666666', 'Hola Laura, he revisado la promesa de compraventa. Todo está en orden. ¿Podrías revisar los términos del pago inicial?', 'text', true, NOW() - INTERVAL '2 days'),
('m2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', '88888888-8888-8888-8888-888888888888', 'Perfecto Dr. Morales, los términos están bien. ¿Cuándo podemos firmar?', 'text', true, NOW() - INTERVAL '1 day'),
('m3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', 'Pedro, necesito que revises el otrosí sobre la modificación de plazos. ¿Te parece bien la nueva fecha de cierre?', 'text', false, NOW() - INTERVAL '1 day'),

-- Caso 2: Conversación entre abogado y clientes
('m4444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', 'Ana, he preparado la promesa de compraventa. Necesito que revises los términos antes de enviarla a Roberto.', 'text', true, NOW() - INTERVAL '1 day'),
('m5555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', '99999999-9999-9999-9999-999999999999', 'Dra. Ruiz, los términos están perfectos. Podemos proceder con el envío a Roberto.', 'text', false, NOW() - INTERVAL '12 hours');

-- Insertar favoritos
INSERT INTO favorites (id, user_id, property_id, notes, created_at) VALUES
-- Usuario 1 tiene 3 propiedades favoritas
('f1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'Me gusta mucho la ubicación', NOW() - INTERVAL '5 days'),
('f2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'p2222222-2222-2222-2222-222222222222', 'Casa perfecta para mi familia', NOW() - INTERVAL '3 days'),
('f3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'p4444444-4444-4444-4444-444444444444', 'Excelente precio en Belén', NOW() - INTERVAL '1 day');

-- Insertar artículos del blog
INSERT INTO blog_posts (id, title, slug, content, excerpt, author_id, category, tags, published, published_at, meta_title, meta_description, featured_image, view_count, created_at) VALUES
-- Artículo 1: La Promesa de Compraventa en Colombia
('b1111111-1111-1111-1111-111111111111', 'La Promesa de Compraventa en Colombia: Guía Completa', 'promesa-compraventa-colombia-guia-completa', 
'# La Promesa de Compraventa en Colombia: Guía Completa

## ¿Qué es una Promesa de Compraventa?

La promesa de compraventa es un contrato mediante el cual una persona se compromete a vender y otra a comprar un bien inmueble en un plazo determinado, bajo condiciones específicas acordadas entre las partes.

## Elementos Esenciales

### 1. Identificación de las Partes
- **Promitente vendedor**: Quien se compromete a vender
- **Promitente comprador**: Quien se compromete a comprar
- Datos completos de identificación (cédula, dirección, teléfono)

### 2. Descripción del Inmueble
- Dirección exacta
- Matrícula inmobiliaria
- Área del terreno y construcción
- Linderos y colindancias

### 3. Precio y Forma de Pago
- Precio total acordado
- Forma de pago (efectivo, financiación, mixto)
- Cronograma de pagos
- Garantías y fianzas

### 4. Plazos y Condiciones
- Fecha límite para el cumplimiento
- Condiciones suspensivas
- Penalidades por incumplimiento

## Ventajas de la Promesa de Compraventa

1. **Seguridad jurídica**: Protege tanto al comprador como al vendedor
2. **Flexibilidad**: Permite negociar términos específicos
3. **Tiempo para trámites**: Da plazo para obtener financiación
4. **Documentación**: Facilita la preparación de documentos legales

## Aspectos Legales Importantes

### Registro de Instrumento Público
La promesa debe ser registrada en la oficina de instrumentos públicos correspondiente para tener efectos frente a terceros.

### Impuestos y Gastos
- **Impuesto de Timbre**: 0.5% del valor del inmueble
- **Registro**: Tarifa según el valor
- **Notaría**: Honorarios del notario

### Condiciones Suspensivas Comunes
- Aprobación de crédito bancario
- Obtención de licencias
- Resolución de litigios
- Cumplimiento de requisitos legales

## Recomendaciones

1. **Asesoría legal**: Siempre consulte con un abogado especializado
2. **Verificación**: Confirme la legalidad del inmueble
3. **Documentación**: Tenga todos los documentos en orden
4. **Plazos**: Respete los tiempos acordados

## Conclusión

La promesa de compraventa es una herramienta fundamental en las transacciones inmobiliarias en Colombia. Su correcta elaboración y cumplimiento garantiza la seguridad jurídica de todas las partes involucradas.', 
'Conoce todo sobre la promesa de compraventa en Colombia: elementos esenciales, ventajas, aspectos legales y recomendaciones para una transacción segura.',
'88888888-8888-8888-8888-888888888888', 'Derecho Inmobiliario', '{"promesa", "compraventa", "derecho", "inmuebles", "colombia"}', true, NOW() - INTERVAL '7 days', 
'Promesa de Compraventa en Colombia - Guía Legal Completa', 
'Guía completa sobre la promesa de compraventa en Colombia. Elementos esenciales, aspectos legales y recomendaciones para transacciones seguras.',
'https://picsum.photos/800/400?random=31', 156, NOW() - INTERVAL '7 days'),

-- Artículo 2: Escrituras Públicas
('b2222222-2222-2222-2222-222222222222', 'Escrituras Públicas: Qué Son y Cómo Funcionan', 'escrituras-publicas-que-son-como-funcionan',
'# Escrituras Públicas: Qué Son y Cómo Funcionan

## Definición

Una escritura pública es un documento notarial que da fe de un acto jurídico, garantizando su autenticidad y validez legal.

## Características Principales

### 1. Autenticidad
- Certifica la identidad de las partes
- Confirma la voluntad de los contratantes
- Garantiza la veracidad del contenido

### 2. Fecha Cierta
- Establece el momento exacto del acto
- Previene fraudes y disputas temporales
- Sirve como prueba en procesos judiciales

### 3. Efectos Legales
- Genera obligaciones y derechos
- Transfiere la propiedad
- Crea derechos reales

## Tipos de Escrituras Públicas

### Escrituras de Compraventa
- Transferencia de propiedad inmobiliaria
- Incluye condiciones y modalidades de pago
- Establece garantías y responsabilidades

### Escrituras de Donación
- Transferencia gratuita de bienes
- Requiere aceptación del donatario
- Puede incluir condiciones

### Escrituras de Permuta
- Intercambio de bienes
- Valoración de los inmuebles
- Diferencia en dinero si aplica

## Proceso de Elaboración

### 1. Preparación
- Revisión de documentos
- Verificación de antecedentes
- Elaboración del borrador

### 2. Firma
- Presentación de las partes
- Lectura del documento
- Firma y autenticación

### 3. Registro
- Inscripción en el registro de instrumentos públicos
- Pago de impuestos correspondientes
- Entrega de copias

## Documentos Requeridos

- Cédulas de identidad
- Certificados de tradición y libertad
- Paz y salvo de predial
- Paz y salvo de administración
- Certificados de valorización
- Licencias de construcción (si aplica)

## Costos Involucrados

### Honorarios Notariales
- Tarifa según el valor del inmueble
- Mínimo establecido por ley
- Servicios adicionales

### Impuestos
- **Impuesto de Timbre**: 0.5% del valor
- **Registro**: Tarifa según valor
- **Valorización**: Si aplica

## Recomendaciones

1. **Verificación previa**: Confirme la legalidad del inmueble
2. **Documentación completa**: Tenga todos los documentos
3. **Asesoría legal**: Consulte con un abogado
4. **Presupuesto**: Calcule todos los costos

## Conclusión

Las escrituras públicas son fundamentales en las transacciones inmobiliarias, garantizando la seguridad jurídica y la validez legal de los actos.',
'Descubre qué son las escrituras públicas, cómo funcionan, qué tipos existen y cuál es el proceso completo para elaborarlas correctamente.',
'99999999-9999-9999-9999-999999999999', 'Derecho Inmobiliario', '{"escrituras", "notaria", "derecho", "inmuebles", "documentos"}', true, NOW() - INTERVAL '6 days',
'Escrituras Públicas en Colombia - Guía Legal',
'Guía completa sobre escrituras públicas: qué son, tipos, proceso de elaboración, documentos requeridos y costos involucrados.',
'https://picsum.photos/800/400?random=32', 89, NOW() - INTERVAL '6 days');
