import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54327';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test users that should have properties
const testUsers = [
  { email: 'user1@sunday.local', full_name: 'Juan Pérez', properties: 0 },
  { email: 'user2@sunday.local', full_name: 'María García', properties: 3 },
  { email: 'user3@sunday.local', full_name: 'Pedro Sánchez', properties: 1 },
  { email: 'user4@sunday.local', full_name: 'Laura Martínez', properties: 0 },
  { email: 'user5@sunday.local', full_name: 'Diego Fernández', properties: 2 }
];

// Property templates for different types
const propertyTemplates = {
  apartment: {
    property_type: 'apartment',
    bedrooms: [1, 2, 3, 4],
    bathrooms: [1, 2, 3],
    area: [45, 65, 85, 120, 150],
    strata: [3, 4, 5, 6]
  },
  house: {
    property_type: 'house',
    bedrooms: [3, 4, 5, 6],
    bathrooms: [2, 3, 4],
    area: [120, 180, 250, 350],
    strata: [3, 4, 5]
  },
  townhouse: {
    property_type: 'townhouse',
    bedrooms: [3, 4, 5],
    bathrooms: [2, 3, 4],
    area: [100, 140, 180],
    strata: [4, 5]
  },
  office: {
    property_type: 'office',
    bedrooms: [0],
    bathrooms: [1, 2],
    area: [30, 50, 80, 120],
    strata: [5, 6]
  },
  commercial: {
    property_type: 'commercial',
    bedrooms: [0],
    bathrooms: [1, 2],
    area: [60, 100, 200, 400],
    strata: [4, 5, 6]
  }
};

// Neighborhoods in Medellín area
const neighborhoods = [
  { name: 'El Poblado', city: 'Medellín', coordinates: { lat: 6.2088, lng: -75.5654 } },
  { name: 'Laureles', city: 'Medellín', coordinates: { lat: 6.2442, lng: -75.5812 } },
  { name: 'Envigado', city: 'Envigado', coordinates: { lat: 6.1699, lng: -75.5856 } },
  { name: 'Sabaneta', city: 'Sabaneta', coordinates: { lat: 6.1514, lng: -75.6166 } },
  { name: 'Itagüí', city: 'Itagüí', coordinates: { lat: 6.1728, lng: -75.6114 } },
  { name: 'Bello', city: 'Bello', coordinates: { lat: 6.3373, lng: -75.5579 } },
  { name: 'Copacabana', city: 'Copacabana', coordinates: { lat: 6.3469, lng: -75.5089 } }
];

// Generate random property data
function generateProperty(ownerId, userName, index) {
  const propertyTypes = Object.keys(propertyTemplates);
  const randomType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
  const template = propertyTemplates[randomType];
  const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];

  // Generate realistic prices based on property type and area
  let basePrice = 0;
  if (randomType === 'apartment') basePrice = 200000000 + Math.random() * 400000000;
  else if (randomType === 'house') basePrice = 300000000 + Math.random() * 600000000;
  else if (randomType === 'townhouse') basePrice = 250000000 + Math.random() * 450000000;
  else if (randomType === 'office') basePrice = 150000000 + Math.random() * 300000000;
  else basePrice = 200000000 + Math.random() * 500000000;

  const area = template.area[Math.floor(Math.random() * template.area.length)];
  const price = Math.round(basePrice * (0.8 + Math.random() * 0.4)); // ±20% variation

  // Generate property features
  const features = [];
  const availableFeatures = [
    'Cocina integral', 'Balcón', 'Terraza', 'Jardín', 'Piscina', 'Gym',
    'Seguridad 24/7', 'Ascensor', 'Parqueadero', 'Cuarto de servicio',
    'Estudio', 'Sala de cine', 'Jacuzzi', 'Aire acondicionado'
  ];

  for (let i = 0; i < Math.floor(Math.random() * 5) + 2; i++) {
    const feature = availableFeatures[Math.floor(Math.random() * availableFeatures.length)];
    if (!features.includes(feature)) features.push(feature);
  }

  const bedrooms = template.bedrooms[Math.floor(Math.random() * template.bedrooms.length)];
  const bathrooms = template.bathrooms[Math.floor(Math.random() * template.bathrooms.length)];

  return {
    owner_id: ownerId,
    title: `${randomType === 'apartment' ? 'Apartamento' :
            randomType === 'house' ? 'Casa' :
            randomType === 'townhouse' ? 'Casa en conjunto' :
            randomType === 'office' ? 'Oficina' : 'Local comercial'} en ${neighborhood.name}`,
    description: `Hermosa propiedad ${randomType === 'apartment' ? 'ubicada en edificio moderno' :
                  randomType === 'house' ? 'con excelente ubicación' :
                  randomType === 'townhouse' ? 'en conjunto cerrado residencial' :
                  'comercial ideal para negocios'}. ${bedrooms > 0 ? `${bedrooms} habitaciones, ` : ''}${bathrooms} baños, área de ${area}m². Incluye: ${features.join(', ')}.`,
    address: `Cra ${Math.floor(Math.random() * 80) + 1} #${Math.floor(Math.random() * 100) + 1}-${Math.floor(Math.random() * 100) + 1}`,
    neighborhood: neighborhood.name,
    city: neighborhood.city,
    coordinates: {
      lat: neighborhood.coordinates.lat + (Math.random() - 0.5) * 0.01,
      lng: neighborhood.coordinates.lng + (Math.random() - 0.5) * 0.01
    },
    property_type: randomType,
    price: price,
    area: area,
    bedrooms: bedrooms,
    bathrooms: bathrooms,
    parking: Math.floor(Math.random() * 3) + (randomType === 'apartment' ? 0 : 1),
    floor: randomType === 'apartment' ? Math.floor(Math.random() * 20) + 1 : null,
    total_floors: randomType === 'apartment' ? Math.floor(Math.random() * 15) + 10 : null,
    year_built: 2015 + Math.floor(Math.random() * 9),
    strata: template.strata[Math.floor(Math.random() * template.strata.length)],
    features: features,
    images: [
      `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&random=${Math.floor(Math.random() * 1000)}`,
      `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&random=${Math.floor(Math.random() * 1000)}`,
      `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&random=${Math.floor(Math.random() * 1000)}`
    ],
    status: 'published',
    verified: Math.random() > 0.3, // 70% verified
    premium: Math.random() > 0.7, // 30% premium
    tags: [`${neighborhood.name}`, randomType === 'apartment' ? 'Apartamento' : randomType === 'house' ? 'Casa' : 'Comercial'],
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
    updated_at: new Date().toISOString()
  };
}

async function seedUserProperties() {
  console.log('🏠 Seeding properties for test users...');

  try {
    // Get user IDs from profiles table
    const userIds = {};
    for (const user of testUsers) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error(`Error getting profile for ${user.email}:`, error);
        continue;
      }
      userIds[user.email] = profile.id;
      console.log(`Found user ${user.email} with profile ID: ${profile.id}`);
    }

    // Generate and insert properties for each user
    for (const user of testUsers) {
      const userId = userIds[user.email];
      if (!userId) {
        console.error(`Skipping ${user.email} - no user ID found`);
        continue;
      }

      const numProperties = user.properties || Math.floor(Math.random() * 3) + 3; // 3-5 properties if not specified

      console.log(`\n📝 Creating ${numProperties} properties for ${user.full_name} (${user.email})`);

      for (let i = 0; i < numProperties; i++) {
        const property = generateProperty(userId, user.full_name, i);

        const { data, error } = await supabase
          .from('properties')
          .insert(property)
          .select('id, title')
          .single();

        if (error) {
          console.error(`❌ Error creating property ${i + 1} for ${user.email}:`, error);
        } else {
          console.log(`✅ Created property: ${data.title}`);
        }
      }
    }

    console.log('\n🎉 Property seeding completed!');

    // Verify the results
    console.log('\n📊 Verifying property creation...');
    for (const user of testUsers) {
      const userId = userIds[user.email];
      if (!userId) continue;

      const { data: properties, error } = await supabase
        .from('properties')
        .select('id, title, property_type, price')
        .eq('owner_id', userId)
        .eq('status', 'published');

      if (error) {
        console.error(`Error verifying properties for ${user.email}:`, error);
      } else {
        console.log(`${user.full_name}: ${properties?.length || 0} properties`);
        if (properties && properties.length > 0) {
          properties.forEach(prop => {
            console.log(`  - ${prop.title} (${prop.property_type}) - $${prop.price?.toLocaleString()}`);
          });
        }
      }
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

seedUserProperties().catch(console.error);
