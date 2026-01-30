import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54327';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const password = 'Password123!';

// All test users with correct roles and realistic profiles
// Roles: user, agent, lawyer, admin, super_admin
// Verification statuses: unverified, verified, premium
const testUsers = [
  // Super Admin (1)
  {
    email: 'superadmin@sunday.local',
    role: 'super_admin',
    full_name: 'Superadmin Root',
    verification_status: 'premium',
    bio: 'Platform administrator with full system access and oversight.',
    phone: '+57 300 000 0000',
    location: 'Bogotá, Colombia',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1985-03-15'
  },

  // Admins (2)
  {
    email: 'admin@sunday.local',
    role: 'admin',
    full_name: 'System Administrator',
    verification_status: 'premium',
    bio: 'Senior platform administrator overseeing operations.',
    phone: '+57 300 111 1111',
    location: 'Medellín, Colombia',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1988-07-22'
  },
  {
    email: 'admin1@sunday.local',
    role: 'admin',
    full_name: 'Admin Uno',
    verification_status: 'premium',
    bio: 'Administrator focused on user operations.',
    phone: '+57 300 222 2222',
    location: 'Cali, Colombia',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1990-11-08'
  },
  
  // Lawyers (3)
  {
    email: 'lawyer1@sunday.local',
    role: 'lawyer',
    full_name: 'Dra. Ana Martínez',
    verification_status: 'premium',
    bio: 'Real estate attorney specialized in contracts and due diligence.',
    phone: '+57 300 333 3333',
    location: 'Bogotá, Colombia',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1982-01-30'
  },
  {
    email: 'lawyer2@sunday.local',
    role: 'lawyer',
    full_name: 'Dr. Roberto Silva',
    verification_status: 'premium',
    bio: 'Property law specialist with litigation background.',
    phone: '+57 300 444 4444',
    location: 'Medellín, Colombia',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1979-09-14'
  },
  {
    email: 'lawyer3@sunday.local',
    role: 'lawyer',
    full_name: 'Lic. Carmen Delgado',
    verification_status: 'premium',
    bio: 'Commercial real estate lawyer with tax expertise.',
    phone: '+57 300 555 5555',
    location: 'Cali, Colombia',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1986-05-12'
  },
  
  // Agents (4) - verified with premium status
  {
    email: 'agent1@sunday.local',
    role: 'agent',
    full_name: 'Agente Ana López',
    verification_status: 'premium',
    bio: 'Real estate agent with 5+ years experience.',
    phone: '+57 300 666 6666',
    location: 'Bogotá, Colombia',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1992-03-25'
  },
  {
    email: 'agent2@sunday.local',
    role: 'agent',
    full_name: 'Agente Jorge Ruiz',
    verification_status: 'premium',
    bio: 'Investment property specialist and relocation expert.',
    phone: '+57 300 777 7777',
    location: 'Medellín, Colombia',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1987-12-03'
  },
  {
    email: 'agent3@sunday.local',
    role: 'agent',
    full_name: 'Agente María González',
    verification_status: 'premium',
    bio: 'Luxury properties specialist.',
    phone: '+57 300 888 8888',
    location: 'Cali, Colombia',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1991-07-18'
  },
  {
    email: 'agent4@sunday.local',
    role: 'agent',
    full_name: 'Agente Carlos Rodríguez',
    verification_status: 'premium',
    bio: 'Commercial real estate expert.',
    phone: '+57 300 999 9999',
    location: 'Bogotá, Colombia',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1984-11-09'
  },
  
  // Regular Users (10)
  {
    email: 'user1@sunday.local',
    role: 'user',
    full_name: 'Juan Pérez',
    verification_status: 'unverified',
    bio: 'First-time buyer exploring purchase options.',
    phone: '+57 300 111 0000',
    location: 'Bogotá, Colombia',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1995-08-20'
  },
  {
    email: 'user2@sunday.local',
    role: 'user',
    full_name: 'María Gómez',
    verification_status: 'unverified',
    bio: 'Looking for apartments in north-side neighborhoods.',
    phone: '+57 300 222 0000',
    location: 'Medellín, Colombia',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1993-04-15'
  },
  {
    email: 'user3@sunday.local',
    role: 'user',
    full_name: 'Pedro Sánchez',
    verification_status: 'unverified',
    bio: 'Researching local neighborhoods and pricing.',
    phone: '+57 300 333 0000',
    location: 'Cali, Colombia',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1989-06-28'
  },
  {
    email: 'user4@sunday.local',
    role: 'user',
    full_name: 'Ana López',
    verification_status: 'verified',
    bio: 'Verified user with completed identity verification.',
    phone: '+57 300 444 0000',
    location: 'Bogotá, Colombia',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1990-02-10'
  },
  {
    email: 'user5@sunday.local',
    role: 'user',
    full_name: 'Carlos Torres',
    verification_status: 'verified',
    bio: 'Verified professional investor.',
    phone: '+57 300 555 0000',
    location: 'Medellín, Colombia',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1986-09-05'
  },
  {
    email: 'user6@sunday.local',
    role: 'user',
    full_name: 'Laura Fernández',
    verification_status: 'unverified',
    bio: 'Registered user exploring the platform.',
    phone: '+57 300 666 0000',
    location: 'Cali, Colombia',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1994-12-07'
  },
  {
    email: 'user7@sunday.local',
    role: 'user',
    full_name: 'Diego Ramírez',
    verification_status: 'pending',
    bio: 'Newly registered user with pending verification.',
    phone: '+57 300 777 0000',
    location: 'Bogotá, Colombia',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1996-03-22'
  },
  {
    email: 'user8@sunday.local',
    role: 'user',
    full_name: 'Sofia Castillo',
    verification_status: 'unverified',
    bio: 'Platform visitor exploring options.',
    phone: '+57 300 888 0000',
    location: 'Medellín, Colombia',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1997-11-30'
  },
  {
    email: 'user9@sunday.local',
    role: 'user',
    full_name: 'David Chen',
    verification_status: 'unverified',
    bio: 'International visitor researching Colombian real estate.',
    phone: '+57 300 999 0000',
    location: 'Cali, Colombia',
    nationality: 'Chinese',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1988-07-14'
  },
  {
    email: 'user10@sunday.local',
    role: 'user',
    full_name: 'Carmen Ruiz',
    verification_status: 'verified',
    bio: 'Exploring property options in Colombia.',
    phone: '+57 300 000 1111',
    location: 'Bogotá, Colombia',
    nationality: 'Spanish',
    avatar_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop&crop=face',
    date_of_birth: '1991-01-25'
  }
];

async function createUser(userData) {
  try {
    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === userData.email);
    
    let userId;
    
    if (existingUser) {
      userId = existingUser.id;
      console.log(`   ✓ User exists: ${userData.email}`);
    } else {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
          role: userData.role
        }
      });

      if (authError) {
        console.error(`   ✗ Auth error for ${userData.email}:`, authError.message);
        return null;
      }

      userId = authData.user.id;
      console.log(`   ✓ Created: ${userData.email}`);
    }

    // Create or update profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    const profileData = {
      id: userId,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      verification_status: userData.verification_status,
      bio: userData.bio,
      phone: userData.phone,
      location: userData.location,
      nationality: userData.nationality,
      avatar_url: userData.avatar_url,
      date_of_birth: userData.date_of_birth,
      status: 'active'
    };

    if (existingProfile) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);

      if (updateError) {
        console.error(`   ✗ Profile update error for ${userData.email}:`, updateError.message);
        return null;
      }
    } else {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (insertError) {
        console.error(`   ✗ Profile insert error for ${userData.email}:`, insertError.message);
        return null;
      }
    }

    return userId;
  } catch (err) {
    console.error(`   ✗ Error for ${userData.email}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('\n🌱 Seeding test users...\n');
  
  const results = {
    success: 0,
    skipped: 0,
    failed: 0
  };

  for (const user of testUsers) {
    const result = await createUser(user);
    if (result) {
      results.success++;
    } else {
      results.failed++;
    }
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`   Success: ${results.success}`);
  console.log(`   Failed: ${results.failed}`);
  console.log(`   Total: ${testUsers.length}\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
