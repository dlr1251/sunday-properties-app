-- Insert test properties for development
INSERT INTO public.properties (id, owner_id, title, description, address, neighborhood, city, coordinates, bedrooms, bathrooms, area, price, status, property_type, year_built, strata, images) VALUES
('test-prop-1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Moderno Apartamento en El Poblado', 'Lujoso apartamento con acabados modernos y vista a la ciudad.', 'Cra 43A #6 Sur-15', 'El Poblado', 'Medellín', '{"lat": 6.2007, "lng": -75.5689}', 3, 2, 120, 450000000, 'published', 'apartment', 2021, 6, ARRAY[
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'
]),
('test-prop-2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Casa Campestre en Envigado', 'Amplia casa con zonas verdes, perfecta para familias.', 'Loma del Escobero', 'Envigado', 'Envigado', '{"lat": 6.162, "lng": -75.589}', 4, 3, 280, 650000000, 'published', 'house', 2018, 5, ARRAY[
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop'
]),
('test-prop-3', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Oficina en WeWork Milla de Oro', 'Oficina moderna y bien ubicada, ideal para startups.', 'Cra 42 #3 Sur-81', 'El Poblado', 'Medellín', '{"lat": 6.208, "lng": -75.571}', 0, 1, 45, 280000000, 'published', 'office', 2019, 6, ARRAY[
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop'
])
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price, status = EXCLUDED.status, images = EXCLUDED.images;
