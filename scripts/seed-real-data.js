import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54327';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedRealData() {
  console.log('🌱 Seeding real production data...\n');

  try {
    // First get the actual user IDs from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .order('email');

    if (profilesError) {
      console.error('❌ Error getting profiles:', profilesError);
      return;
    }

    console.log('📋 Available users:');
    const usersByRole = {};
    profiles.forEach(profile => {
      console.log(`  ${profile.email}: ${profile.id} (${profile.role})`);
      if (!usersByRole[profile.role]) usersByRole[profile.role] = [];
      usersByRole[profile.role].push(profile);
    });

    // Extract user IDs for different roles
    const adminUsers = usersByRole.super_admin || [];
    const agentUsers = usersByRole.agent || [];
    const regularUsers = usersByRole.user || [];
    const lawyerUsers = usersByRole.lawyer || [];

    console.log(`\n🎯 Found ${adminUsers.length} admins, ${agentUsers.length} agents, ${regularUsers.length} users, ${lawyerUsers.length} lawyers`);

    // Seed properties for users
    if (regularUsers.length >= 2) {
      console.log('\n🏠 Seeding properties...');

      const properties = [
        {
          id: 'prop-001',
          owner_id: regularUsers[0].id,
          title: 'Apartamento Moderno en El Poblado',
          description: 'Hermoso apartamento moderno de 3 habitaciones con vista panorámica.',
          address: 'Carrera 43A #15-25, Apto 1202',
          neighborhood: 'El Poblado',
          city: 'Medellín',
          coordinates: { lat: 6.2091, lng: -75.5678 },
          bedrooms: 3,
          bathrooms: 2,
          area: 85,
          parking_spaces: 1,
          property_type: 'apartment',
          price: 450000000,
          status: 'published',
          features: ['Gimnasio', 'Piscina', 'Portería 24/7'],
          images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'prop-002',
          owner_id: regularUsers[1].id,
          title: 'Casa Campestre en Envigado',
          description: 'Casa campestre de 4 habitaciones con jardín privado.',
          address: 'Calle 25 Sur #45-67',
          neighborhood: 'Envigado',
          city: 'Envigado',
          coordinates: { lat: 6.1759, lng: -75.5622 },
          bedrooms: 4,
          bathrooms: 3,
          area: 280,
          parking_spaces: 2,
          property_type: 'house',
          price: 650000000,
          status: 'published',
          features: ['Jardín', 'Piscina', 'Zona BBQ'],
          images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
          created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'prop-003',
          owner_id: agentUsers[0]?.id || regularUsers[0].id,
          title: 'Penthouse en Laureles',
          description: 'Penthouse de lujo con terraza privada y vista 360°.',
          address: 'Carrera 70 #45-12, PH 1801',
          neighborhood: 'Laureles',
          city: 'Medellín',
          coordinates: { lat: 6.2458, lng: -75.5942 },
          bedrooms: 3,
          bathrooms: 3,
          area: 180,
          parking_spaces: 2,
          property_type: 'apartment',
          price: 1200000000,
          status: 'published',
          features: ['Terraza privada', 'Vista panorámica', 'Jacuzzi'],
          images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
          created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      for (const property of properties) {
        const { error } = await supabase
          .from('properties')
          .upsert(property);

        if (error) {
          console.log(`❌ Error seeding property ${property.id}:`, error);
        } else {
          console.log(`✅ Seeded property: ${property.title}`);
        }
      }
    }

    // Seed offers
    if (regularUsers.length >= 3) {
      console.log('\n💰 Seeding offers...');

      const offers = [
        {
          id: 'offer-001',
          property_id: 'prop-001',
          buyer_id: regularUsers[2].id,
          offer_price: 430000000,
          payment_method: 'efectivo',
          closing_date: '2025-12-15',
          status: 'pending',
          validity_days: 30,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'offer-002',
          property_id: 'prop-002',
          buyer_id: regularUsers[3]?.id || regularUsers[0].id,
          offer_price: 620000000,
          payment_method: 'credito',
          closing_date: '2025-11-30',
          status: 'accepted',
          validity_days: 30,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      for (const offer of offers) {
        const { error } = await supabase
          .from('offers')
          .upsert(offer);

        if (error) {
          console.log(`❌ Error seeding offer ${offer.id}:`, error);
        } else {
          console.log(`✅ Seeded offer: ${offer.offer_price} for property ${offer.property_id}`);
        }
      }
    }

    // Seed visits
    if (regularUsers.length >= 2) {
      console.log('\n📅 Seeding visits...');

      const visits = [
        {
          id: 'visit-001',
          property_id: 'prop-001',
          visitor_id: regularUsers[2].id,
          visitor_name: 'Carlos Rodríguez',
          visitor_email: regularUsers[2].email,
          visitor_phone: '+57 300 123 4567',
          scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          duration_minutes: 60,
          status: 'confirmed',
          notes: 'Interesado en financiación',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'visit-002',
          property_id: 'prop-002',
          visitor_id: regularUsers[3]?.id || regularUsers[1].id,
          visitor_name: 'María González',
          visitor_email: regularUsers[3]?.email || regularUsers[1].email,
          visitor_phone: '+57 301 987 6543',
          scheduled_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          duration_minutes: 45,
          status: 'pending',
          notes: 'Família de 4 personas',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      for (const visit of visits) {
        const { error } = await supabase
          .from('visits')
          .upsert(visit);

        if (error) {
          console.log(`❌ Error seeding visit ${visit.id}:`, error);
        } else {
          console.log(`✅ Seeded visit: ${visit.visitor_name} for ${visit.scheduled_at}`);
        }
      }
    }

    // Seed notifications
    console.log('\n🔔 Seeding notifications...');

    const notifications = [
      {
        id: 'notif-001',
        user_id: regularUsers[0].id,
        type: 'offer_received',
        title: 'Nueva oferta recibida',
        message: 'Has recibido una oferta de $430.000.000 por tu apartamento en El Poblado',
        data: { property_id: 'prop-001', offer_id: 'offer-001', amount: 430000000 },
        read: false,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif-002',
        user_id: regularUsers[2].id,
        type: 'offer_submitted',
        title: 'Oferta enviada',
        message: 'Tu oferta de $430.000.000 ha sido enviada exitosamente',
        data: { property_id: 'prop-001', offer_id: 'offer-001', amount: 430000000 },
        read: true,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif-003',
        user_id: regularUsers[1].id,
        type: 'offer_accepted',
        title: '¡Oferta aceptada!',
        message: 'Tu oferta de $620.000.000 por la casa en Envigado ha sido aceptada',
        data: { property_id: 'prop-002', offer_id: 'offer-002', amount: 620000000 },
        read: false,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif-004',
        user_id: regularUsers[0].id,
        type: 'visit_scheduled',
        title: 'Visita programada',
        message: 'Tienes una visita programada para mañana a las 2:00 PM',
        data: { property_id: 'prop-001', visit_id: 'visit-001', scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
        read: false,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    for (const notification of notifications) {
      const { error } = await supabase
        .from('notifications')
        .upsert(notification);

      if (error) {
        console.log(`❌ Error seeding notification ${notification.id}:`, error);
      } else {
        console.log(`✅ Seeded notification: ${notification.title}`);
      }
    }

    // Seed contracts
    if (regularUsers.length >= 2) {
      console.log('\n📄 Seeding contracts...');

      const contracts = [
        {
          id: 'contract-001',
          offer_id: 'offer-002',
          property_id: 'prop-002',
          buyer_id: regularUsers[3]?.id || regularUsers[1].id,
          seller_id: regularUsers[1].id,
          final_price: 620000000,
          closing_date: '2025-11-30',
          payment_method: 'credito',
          status: 'pending_signature',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      for (const contract of contracts) {
        const { error } = await supabase
          .from('contracts')
          .upsert(contract);

        if (error) {
          console.log(`❌ Error seeding contract ${contract.id}:`, error);
        } else {
          console.log(`✅ Seeded contract: ${contract.final_price} for property ${contract.property_id}`);
        }
      }
    }

    console.log('\n🎉 Data seeding complete!');
    console.log('\n📊 Summary:');
    console.log(`   • ${Math.min(3, regularUsers.length)} Properties`);
    console.log(`   • ${Math.min(2, regularUsers.length)} Offers`);
    console.log(`   • ${Math.min(2, regularUsers.length)} Visits`);
    console.log(`   • 4 Notifications`);
    console.log(`   • ${regularUsers.length >= 2 ? 1 : 0} Contracts`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seedRealData();
