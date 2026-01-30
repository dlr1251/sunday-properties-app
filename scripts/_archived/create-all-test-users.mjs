import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54327';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Complete test users with final role distribution:
// 1 Super Admin, 2 Admins, 3 Lawyers, 4 Agents, 10 Regular Users
const allUsers = [
  // Super Admin (1)
  {
    email: 'superadmin@sunday.local',
    password: 'Password123!',
    role: 'super_admin',
    full_name: 'Superadmin Root',
    verification_status: 'verified',
    bio: 'Platform administrator with full system access and oversight.',
    phone: '+57 300 000 0000',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    location: 'Bogotá, Colombia',
    address: 'Calle 85 #19-33, El Poblado',
    website: 'https://tiktok.com/@user_realestate',
    nationality: 'Canadian',
    preferences: {
      language: 'en',
      currency: 'USD',
      timezone: 'America/Santiago',
      notifications: { email: false, sms: false, push: true },
      privacy: { showEmail: false, showPhone: false }
    }
  },

  // Admins (2)
  {
    email: 'admin@sunday.local',
    password: 'Password123!',
    role: 'admin',
    full_name: 'Admin Root',
    verification_status: 'verified',
    bio: 'Senior platform administrator overseeing operations.',
    phone: '+57 300 111 1111',
    location: 'Medellín, Colombia',
    address: 'Carrera 7 #23-45, Chapinero',
    website: 'https://linkedin.com/in/user-profile',
    nationality: 'Colombian',
    preferences: {
      language: 'es',
      currency: 'COP',
      timezone: 'America/Bogota',
      notifications: { email: true, sms: false, push: true },
      privacy: { showEmail: false, showPhone: true }
    }
  },
  {
    email: 'admin1@sunday.local',
    password: 'Password123!',
    role: 'admin',
    full_name: 'Admin Uno',
    verification_status: 'verified',
    bio: 'Administrator focused on user operations and marketplace health.',
    phone: '+57 300 222 2222',
    location: 'Cali, Colombia',
    address: 'Avenida 6N #23-45, Granada',
    website: null,
    nationality: 'Mexican',
    preferences: {
      language: 'es',
      currency: 'USD',
      timezone: 'America/Mexico_City',
      notifications: { email: true, sms: true, push: false },
      privacy: { showEmail: false, showPhone: false }
    }
  },

  // Lawyers (3)
  {
    email: 'lawyer1@sunday.local',
    password: 'Password123!',
    role: 'lawyer',
    full_name: 'Dra. Ana Martínez',
    verification_status: 'verified',
    bio: 'Real estate attorney specialized in contracts and due diligence.',
    phone: '+57 300 555 1234',
    location: 'Montería, Colombia',
    address: 'Carrera 43A #7-89, Laureles',
    website: null,
    nationality: 'Peruvian',
    preferences: {
      language: 'es',
      currency: 'EUR',
      timezone: 'America/Lima',
      notifications: { email: true, sms: false, push: true },
      privacy: { showEmail: false, showPhone: true }
    }
  },
  {
    email: 'lawyer2@sunday.local',
    password: 'Password123!',
    role: 'lawyer',
    full_name: 'Dr. Roberto Silva',
    verification_status: 'verified',
    bio: 'Property law specialist with litigation background.',
    phone: '+57 300 666 7890',
    location: 'Cartagena, Colombia',
    address: 'Carrera 15 #127-34, Teusaquillo',
    website: 'https://instagram.com/@user_properties',
    nationality: 'Chilean',
    preferences: {
      language: 'es',
      currency: 'USD',
      timezone: 'America/Santiago',
      notifications: { email: true, sms: true, push: false },
      privacy: { showEmail: false, showPhone: false }
    }
  },
  {
    email: 'lawyer3@sunday.local',
    password: 'Password123!',
    role: 'lawyer',
    full_name: 'Lic. Carmen Delgado',
    verification_status: 'verified',
    bio: 'Commercial real estate lawyer with tax expertise.',
    phone: '+57 300 777 4567',
    location: 'Santa Marta, Colombia',
    address: 'Diagonal 127B #45-67, Usaquén',
    website: 'https://twitter.com/user_colombia',
    nationality: 'Spanish',
    preferences: {
      language: 'es',
      currency: 'EUR',
      timezone: 'Europe/Madrid',
      notifications: { email: false, sms: false, push: true },
      privacy: { showEmail: false, showPhone: true }
    }
  },

  // Agents (2)
  {
    email: 'agent1@sunday.local',
    password: 'Password123!',
    role: 'agent',
    full_name: 'Agente Ana López',
    verification_status: 'verified',
    bio: 'Real estate agent with 5+ years experience.',
    phone: '+57 300 888 1234',
    location: 'Pereira, Colombia',
    address: 'Calle 70 #8-90, Zona Rosa',
    website: 'https://youtube.com/c/userproperties',
    nationality: 'Colombian',
    preferences: {
      language: 'es',
      currency: 'COP',
      timezone: 'America/Bogota',
      notifications: { email: true, sms: false, push: true },
      privacy: { showEmail: false, showPhone: false }
    }
  },
  {
    email: 'agent2@sunday.local',
    password: 'Password123!',
    role: 'agent',
    full_name: 'Agente Jorge Ruiz',
    verification_status: 'verified',
    bio: 'Investment property specialist and relocation expert.',
    phone: '+57 300 999 5678',
    location: 'Manizales, Colombia',
    address: 'Avenida Boyacá #45-67, Centro',
    website: null,
    nationality: 'American',
    preferences: {
      language: 'en',
      currency: 'USD',
      timezone: 'America/New_York',
      notifications: { email: true, sms: true, push: false },
      privacy: { showEmail: true, showPhone: true }
    }
  },
  {
    email: 'user1@sunday.local',
    password: 'Password123!',
    role: 'user',
    full_name: 'Juan Pérez',
    verification_status: 'unverified',
    bio: 'First-time buyer exploring purchase options.',
    phone: '+57 300 101 0101',
    location: 'Barranquilla, Colombia',
    address: 'Calle 70 #8-90, Zona Rosa',
    website: 'https://twitter.com/user_colombia',
    nationality: 'Colombian',
    preferences: {
      language: 'pt',
      currency: 'EUR',
      timezone: 'America/Santiago',
      notifications: { email: true, sms: false, push: true },
      privacy: { showEmail: false, showPhone: false }
    }
  },
  {
    email: 'user2@sunday.local',
    password: 'Password123!',
    role: 'user',
    full_name: 'María Gómez',
    verification_status: 'unverified',
    bio: 'Looking for apartments in north-side neighborhoods.',
    phone: '+57 300 202 0202',
    location: 'Ibagué, Colombia',
    address: 'Carrera 11 #34-56, Quinta Camacho',
    website: null,
    nationality: 'Ecuadorian',
    preferences: {
      language: 'es',
      currency: 'USD',
      timezone: 'America/Lima',
      notifications: { email: false, sms: true, push: true },
      privacy: { showEmail: false, showPhone: true }
    }
  },
  {
    email: 'user3@sunday.local',
    password: 'Password123!',
    role: 'user',
    full_name: 'Pedro Sánchez',
    verification_status: 'unverified',
    bio: 'Researching local neighborhoods and pricing.',
    phone: '+57 300 303 0303',
    location: 'Neiva, Colombia',
    address: 'Calle 93 #14-25, Parque de la 93',
    website: 'https://linkedin.com/in/user-profile',
    nationality: 'Peruvian',
    preferences: {
      language: 'es',
      currency: 'COP',
      timezone: 'America/Lima',
      notifications: { email: true, sms: false, push: false },
      privacy: { showEmail: true, showPhone: false }
    }
  },
  {
    email: 'premium1@sunday.local',
    password: 'Password123!',
    role: 'user',
    full_name: 'Isabella Santos',
    verification_status: 'verified',
    bio: 'Premium user with investment interests.',
    phone: '+57 300 404 0404',
    location: 'Pereira, Colombia',
    address: 'Calle 70 #8-90, Zona Rosa',
    website: 'https://instagram.com/@user_properties',
    nationality: 'Colombian',
    preferences: {
      language: 'es',
      currency: 'EUR',
      timezone: 'America/Lima',
      notifications: { email: true, sms: true, push: false },
      privacy: { showEmail: false, showPhone: true }
    }
  },
  {
    email: 'premium2@sunday.local',
    password: 'Password123!',
    role: 'user',
    full_name: 'Miguel Ángel Torres',
    verification_status: 'verified',
    bio: 'Premium investor seeking commercial properties.',
    phone: '+57 300 505 0505',
    location: 'Popayán, Colombia',
    address: 'Carrera 9 #115-30, Chicó',
    website: null,
    nationality: 'Mexican',
    preferences: {
      language: 'es',
      currency: 'USD',
      timezone: 'America/Mexico_City',
      notifications: { email: false, sms: false, push: true },
      privacy: { showEmail: false, showPhone: false }
    }
  },
  {
    email: 'verified1@sunday.local',
    password: 'Password123!',
    role: 'user',
    full_name: 'Laura Fernández',
    verification_status: 'verified',
    bio: 'Verified user with completed identity verification.',
    phone: '+57 300 606 0606',
    location: 'Tunja, Colombia',
    address: 'Diagonal 127B #45-67, Usaquén',
    website: 'https://facebook.com/user.realestate',
    nationality: 'Chilean',
    preferences: {
      language: 'en',
      currency: 'USD',
      timezone: 'America/Santiago',
      notifications: { email: true, sms: false, push: true },
      privacy: { showEmail: true, showPhone: true }
    }
  },
  {
    email: 'verified2@sunday.local',
    password: 'Password123!',
    role: 'user',
    full_name: 'Diego Ramírez',
    verification_status: 'verified',
    bio: 'Verified professional investor.',
    phone: '+57 300 707 0707',
    location: 'Pasto, Colombia',
    address: 'Calle 5 #12-34, La Candelaria',
    website: 'https://tiktok.com/@user_realestate',
    nationality: 'Argentinian',
    preferences: {
      language: 'pt',
      currency: 'EUR',
      timezone: 'America/Santiago',
      notifications: { email: true, sms: true, push: false },
      privacy: { showEmail: false, showPhone: false }
    }
  },
  {
    email: 'registered1@sunday.local',
    password: 'Password123!',
    role: 'user',
    full_name: 'Carmen Ruiz',
    verification_status: 'unverified',
    bio: 'Registered user exploring the platform.',
    phone: '+57 300 808 0808',
    location: 'Cúcuta, Colombia',
    address: 'Avenida 6N #23-45, Granada',
    website: null,
    nationality: 'Spanish',
    preferences: {
      language: 'es',
      currency: 'COP',
      timezone: 'Europe/Madrid',
      notifications: { email: false, sms: false, push: true },
      privacy: { showEmail: false, showPhone: true }
    }
  },
  {
    email: 'registered2@sunday.local',
    password: 'Password123!',
    role: 'user',
    full_name: 'Javier Morales',
    verification_status: 'pending',
    bio: 'Newly registered user with pending verification.',
    phone: '+57 300 909 0909',
    location: 'Villavicencio, Colombia',
    address: 'Carrera 43A #7-89, Laureles',
    website: 'https://youtube.com/c/userproperties',
    nationality: 'American',
    preferences: {
      language: 'en',
      currency: 'USD',
      timezone: 'America/New_York',
      notifications: { email: true, sms: false, push: false },
      privacy: { showEmail: true, showPhone: false }
    }
  },
  {
    email: 'visitor1@sunday.local',
    password: 'Password123!',
    role: 'user',
    full_name: 'Sofia Castillo',
    verification_status: 'unverified',
    bio: 'Platform visitor exploring options.',
    phone: '+57 300 010 1010',
    location: 'Montería, Colombia',
    address: 'Carrera 7 #23-45, Chapinero',
    website: null,
    nationality: 'Canadian',
    preferences: {
      language: 'fr',
      currency: 'EUR',
      timezone: 'America/Bogota',
      notifications: { email: true, sms: true, push: true },
      privacy: { showEmail: false, showPhone: false }
    }
  },
  {
    email: 'visitor2@sunday.local',
    password: 'Password123!',
    role: 'user',
    full_name: 'David Chen',
    verification_status: 'unverified',
    bio: 'International visitor researching Colombian real estate.',
    phone: '+57 300 020 2020',
    location: 'Ibagué, Colombia',
    address: 'Carrera 15 #127-34, Teusaquillo',
    website: 'https://linkedin.com/in/user-profile',
    nationality: 'Chinese',
    preferences: {
      language: 'en',
      currency: 'USD',
      timezone: 'America/New_York',
      notifications: { email: false, sms: false, push: true },
      privacy: { showEmail: true, showPhone: true }
    }
  }
];

async function createAllTestUsers() {
  console.log('🧪 Creating all test users...');

  for (const user of allUsers) {
    try {
      console.log(`Creating user: ${user.email}`);

      // First, try to create in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          role: user.role
        }
      });

      if (authError && !authError.message.includes('already registered')) {
        console.error(`Auth error for ${user.email}:`, authError);
        continue;
      }

      const userId = authData?.user?.id;
      if (!userId) {
        // Try to get existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === user.email);
        if (existingUser) {
          console.log(`User ${user.email} already exists, updating profile...`);
          continue; // Skip to next user
        } else {
          console.error(`Could not create or find user ${user.email}`);
          continue;
        }
      }

      // Create or update profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            verification_status: user.verification_status,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error(`Profile update error for ${user.email}:`, updateError);
        } else {
          console.log(`✅ Updated profile for ${user.email}`);
        }
      } else {
        // Create new profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            status: 'active',
            verification_status: user.verification_status || 'unverified',
            bio: user.bio,
            phone: user.phone,
            location: user.location,
            address: user.address,
            website: user.website,
            nationality: user.nationality,
            preferences: user.preferences
          });

        if (profileError) {
          console.error(`Profile creation error for ${user.email}:`, profileError);
        } else {
          console.log(`✅ Created profile for ${user.email}`);
        }
      }

    } catch (err) {
      console.error(`Failed to create user ${user.email}:`, err);
    }
  }

  console.log('🎉 All test users creation completed!');
}

createAllTestUsers().catch(console.error);
