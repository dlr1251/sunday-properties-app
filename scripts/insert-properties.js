// Script para insertar propiedades de prueba
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://prtyuwdkrrqhtwolcrav.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydHl1d2RrcnJxaHR3b2xjcmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTA1MDUsImV4cCI6MjA3NjQ2NjUwNX0.0n7zBh6TvTdHtEDn_lNE0IaPkIVK3Ujhf6hZ2yNFOGo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertProperties() {
  try {
    console.log('Inserting test properties...');

    const properties = [
      {
        owner_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Moderno Apartamento en El Poblado',
        description: 'Lujoso apartamento con acabados modernos y vista a la ciudad.',
        address: 'Cra 43A #6 Sur-15',
        neighborhood: 'El Poblado',
        city: 'Medellín',
        coordinates: { lat: 6.2007, lng: -75.5689 },
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        price: 450000000,
        status: 'published',
        property_type: 'apartment',
        year_built: 2021,
        strata: 6,
        images: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'
        ]
      },
      {
        owner_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        title: 'Casa Campestre en Envigado',
        description: 'Amplia casa con zonas verdes, perfecta para familias.',
        address: 'Loma del Escobero',
        neighborhood: 'Envigado',
        city: 'Envigado',
        coordinates: { lat: 6.162, lng: -75.589 },
        bedrooms: 4,
        bathrooms: 3,
        area: 280,
        price: 650000000,
        status: 'published',
        property_type: 'house',
        year_built: 2018,
        strata: 5,
        images: [
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop'
        ]
      },
      {
        owner_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Oficina en WeWork Milla de Oro',
        description: 'Oficina moderna y bien ubicada, ideal para startups.',
        address: 'Cra 42 #3 Sur-81',
        neighborhood: 'El Poblado',
        city: 'Medellín',
        coordinates: { lat: 6.208, lng: -75.571 },
        bedrooms: 0,
        bathrooms: 1,
        area: 45,
        price: 280000000,
        status: 'published',
        property_type: 'office',
        year_built: 2019,
        strata: 6,
        images: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop'
        ]
      }
    ];

    for (const property of properties) {
      const { data, error } = await supabase
        .from('properties')
        .insert(property);

      if (error) {
        console.error('Error inserting property:', property.title, error);
      } else {
        console.log('Inserted property:', property.title);
      }
    }

    console.log('Finished inserting properties');

    // Verify the insertion
    const { data: verifyData, error: verifyError } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'published')
      .limit(10);

    if (verifyError) {
      console.error('Error verifying:', verifyError);
    } else {
      console.log('Verification: Found', verifyData?.length || 0, 'published properties');
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

insertProperties();
