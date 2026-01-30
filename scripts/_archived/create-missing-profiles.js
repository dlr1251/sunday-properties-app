const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54327';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create profiles for users that don't exist yet
const missingProfiles = [
  {
    email: 'user1@sunday.local',
    full_name: 'Andrés López',
    role: 'verified',
    verification_status: 'verified',
    phone: '+57 314 666 1122',
    bio: 'Software engineer looking for a modern apartment in Zona G. Remote work so flexibility is important.',
    location: 'Bogotá, Colombia',
    website: 'https://andreslopez.dev',
    date_of_birth: '1991-03-05',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face'
  },
  {
    email: 'user2@sunday.local',
    full_name: 'Valentina Herrera',
    role: 'verified',
    verification_status: 'verified',
    phone: '+57 315 777 3344',
    bio: 'Teacher seeking a family-friendly neighborhood with good schools. Currently renting and ready to buy.',
    location: 'Medellín, Colombia',
    website: null,
    date_of_birth: '1986-07-18',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face'
  },
  {
    email: 'user3@sunday.local',
    full_name: 'Felipe Gómez',
    role: 'registered',
    verification_status: 'unverified',
    phone: '+57 316 888 5566',
    bio: 'Student finishing university and planning to stay in the city. Looking for affordable shared housing options.',
    location: 'Cali, Colombia',
    website: null,
    date_of_birth: '1999-01-30',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop&crop=face'
  },
  {
    email: 'user4@sunday.local',
    full_name: 'Gabriela Díaz',
    role: 'registered',
    verification_status: 'pending',
    phone: '+57 317 999 7788',
    bio: 'Healthcare worker relocating to Bogotá for a new job opportunity. Need housing quickly and prefer furnished options.',
    location: 'Santa Marta, Colombia',
    website: null,
    date_of_birth: '1993-10-12',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face'
  },
  {
    email: 'user5@sunday.local',
    full_name: 'Tomás Rivera',
    role: 'visitor',
    verification_status: 'unverified',
    phone: '+57 318 000 9900',
    bio: 'Retired professional considering moving to Colombia. Researching retirement communities and climate considerations.',
    location: 'Buenos Aires, Argentina',
    website: null,
    date_of_birth: '1955-12-08',
    nationality: 'Argentinian',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
  }
];

// Update existing profiles with additional data (but keep working roles)
const profileUpdates = {
  'premium1@sunday.local': {
    full_name: 'Isabella Santos',
    phone: '+57 320 777 8910',
    bio: 'Real estate investor and entrepreneur. Looking for premium investment opportunities in Bogotá\'s growing market.',
    location: 'Bogotá, Colombia',
    website: 'https://isabellainvest.com',
    date_of_birth: '1990-01-15',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
  },
  'premium2@sunday.local': {
    full_name: 'Miguel Ángel Torres',
    phone: '+57 321 888 2345',
    bio: 'Business executive seeking luxury properties for personal and investment purposes.',
    location: 'Medellín, Colombia',
    website: 'https://torresinvestments.co',
    date_of_birth: '1987-09-12',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'
  },
  'verified1@sunday.local': {
    full_name: 'Laura Fernández',
    phone: '+57 310 222 3344',
    bio: 'Young professional looking for my first apartment in Chapinero.',
    location: 'Bogotá, Colombia',
    website: null,
    date_of_birth: '1995-04-20',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'
  },
  'verified2@sunday.local': {
    full_name: 'Diego Ramírez',
    phone: '+57 311 333 5566',
    bio: 'Family man searching for a larger home as our family grows.',
    location: 'Barranquilla, Colombia',
    website: null,
    date_of_birth: '1983-12-03',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face'
  },
  'registered1@sunday.local': {
    full_name: 'Carmen Ruiz',
    phone: '+57 312 444 7788',
    bio: 'First-time homebuyer exploring options in the market.',
    location: 'Cartagena, Colombia',
    website: null,
    date_of_birth: '1992-06-28',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face'
  },
  'registered2@sunday.local': {
    full_name: 'Javier Morales',
    phone: '+57 313 555 9900',
    bio: 'Recent graduate planning to move to Bogotá for work.',
    location: 'Pereira, Colombia',
    website: 'https://javiermorales.dev',
    date_of_birth: '1997-08-14',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=400&h=400&fit=crop&crop=face'
  },
  'visitor1@sunday.local': {
    full_name: 'Sofia Castillo',
    phone: null,
    bio: 'Exploring real estate options while visiting Colombia.',
    location: 'Madrid, Spain',
    website: null,
    date_of_birth: '1989-02-10',
    nationality: 'Spanish',
    avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face'
  },
  'visitor2@sunday.local': {
    full_name: 'David Chen',
    phone: '+1 555 123 4567',
    bio: 'International investor researching Colombian real estate market.',
    location: 'Miami, USA',
    website: 'https://cheninvestments.com',
    date_of_birth: '1980-11-25',
    nationality: 'American',
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face'
  }
};

async function createMissingProfiles() {
  console.log('🆕 Creating missing user profiles...\n');

  // First create the missing user auth accounts
  for (const profile of missingProfiles) {
    try {
      console.log(`🔐 Creating auth user: ${profile.email}`);

      const { data, error } = await supabase.auth.admin.createUser({
        email: profile.email,
        password: 'Password123!',
        email_confirm: true,
        user_metadata: {
          full_name: profile.full_name,
          role: profile.role
        }
      });

      if (error) {
        console.error(`❌ Failed to create auth user ${profile.email}:`, error);
        continue;
      }

      const userId = data.user.id;
      console.log(`✅ Created auth user ${profile.email} with ID: ${userId}`);

      // Create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          verification_status: profile.verification_status,
          phone: profile.phone,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          date_of_birth: profile.date_of_birth,
          nationality: profile.nationality,
          avatar_url: profile.avatar_url,
          status: 'active'
        });

      if (profileError) {
        console.error(`❌ Failed to create profile for ${profile.email}:`, profileError);
      } else {
        console.log(`✅ Created profile for ${profile.email}`);
      }

    } catch (err) {
      console.error(`❌ Exception creating ${profile.email}:`, err);
    }
  }

  // Now update existing profiles with additional data
  console.log('\n📝 Updating existing profiles with additional data...\n');

  for (const [email, updateData] of Object.entries(profileUpdates)) {
    try {
      console.log(`📝 Updating ${email} with additional data`);

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: updateData.full_name,
          phone: updateData.phone,
          bio: updateData.bio,
          location: updateData.location,
          website: updateData.website,
          date_of_birth: updateData.date_of_birth,
          nationality: updateData.nationality,
          avatar_url: updateData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select();

      if (error) {
        console.error(`❌ Error updating ${email}:`, error);
      } else if (data && data.length > 0) {
        console.log(`✅ Updated ${email} successfully`);
      } else {
        console.log(`⚠️  No profile found for ${email}`);
      }

    } catch (err) {
      console.error(`❌ Exception updating ${email}:`, err);
    }
  }

  console.log('\n🎉 Profile creation and updates completed!');
}

createMissingProfiles().catch(console.error);
