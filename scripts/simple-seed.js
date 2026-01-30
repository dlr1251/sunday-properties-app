import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54327';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Generate proper UUIDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function simpleSeed() {
  console.log('🌱 Simple data seeding...\n');

  try {
    // Get user IDs
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .order('email');

    if (profilesError || !profiles) {
      console.error('❌ Error getting profiles:', profilesError);
      return;
    }

    const regularUsers = profiles.filter(p => p.role === 'user');
    console.log(`📋 Found ${regularUsers.length} regular users`);

    if (regularUsers.length < 2) {
      console.log('❌ Need at least 2 users to seed data');
      return;
    }

    // Seed a simple property
    console.log('\n🏠 Seeding a simple property...');
    const propertyId = generateUUID();
    const property = {
      id: propertyId,
      owner_id: regularUsers[0].id,
      title: 'Apartamento Moderno en El Poblado',
      description: 'Hermoso apartamento moderno de 3 habitaciones.',
      address: 'Carrera 43A #15-25, Apto 1202',
      city: 'Medellín',
      price: 450000000,
      property_type: 'apartment',
      bedrooms: 3,
      bathrooms: 2,
      area: 85,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: propError } = await supabase
      .from('properties')
      .insert(property);

    if (propError) {
      console.log('❌ Property insert error:', propError);
    } else {
      console.log('✅ Property seeded successfully');
    }

    // Seed a simple offer
    if (!propError) {
      console.log('\n💰 Seeding a simple offer...');
      const offerId = generateUUID();
      const offer = {
        id: offerId,
        property_id: propertyId,
        buyer_id: regularUsers[1].id,
        offer_price: 430000000,
        payment_method: 'efectivo',
        closing_date: '2025-12-15',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: offerError } = await supabase
        .from('offers')
        .insert(offer);

      if (offerError) {
        console.log('❌ Offer insert error:', offerError);
      } else {
        console.log('✅ Offer seeded successfully');
      }
    }

    // Seed a simple visit
    if (!propError) {
      console.log('\n📅 Seeding a simple visit...');
      const visitId = generateUUID();
      const visit = {
        id: visitId,
        property_id: propertyId,
        visitor_id: regularUsers[1].id,
        visitor_name: 'Carlos Rodríguez',
        visitor_email: regularUsers[1].email,
        visitor_phone: '+57 300 123 4567',
        scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: visitError } = await supabase
        .from('visits')
        .insert(visit);

      if (visitError) {
        console.log('❌ Visit insert error:', visitError);
      } else {
        console.log('✅ Visit seeded successfully');
      }
    }

    console.log('\n🎉 Simple seeding complete!');
    console.log('Now check your ProfilePage - you should see data for user5@sunday.local!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

simpleSeed();
