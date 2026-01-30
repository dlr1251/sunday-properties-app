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

// Complete user profile data with realistic information
const userProfiles = {
  // Administrative Users
  'superadmin@sunday.local': {
    role: 'super_admin',
    verification_status: 'verified',
    full_name: 'Carlos Rodríguez',
    phone: '+57 310 123 4567',
    bio: 'Experienced technology executive with 15+ years in real estate technology and platform management. Passionate about connecting people with their dream homes through innovative solutions.',
    location: 'Bogotá, Colombia',
    website: 'https://sundayproperties.com',
    date_of_birth: '1985-03-15',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
  },

  'admin@sunday.local': {
    role: 'admin',
    verification_status: 'verified',
    full_name: 'María González',
    phone: '+57 315 987 6543',
    bio: 'Property management specialist with extensive experience in Colombian real estate market. Dedicated to ensuring smooth operations and exceptional user experiences.',
    location: 'Medellín, Colombia',
    website: 'https://sundayproperties.com/admin',
    date_of_birth: '1988-07-22',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
  },

  // Legal Professionals
  'lawyer1@sunday.local': {
    role: 'lawyer',
    verification_status: 'verified',
    full_name: 'Dr. Ana Martínez',
    phone: '+57 300 555 1234',
    bio: 'Licensed real estate attorney specializing in property transactions, contracts, and legal compliance. Member of the Colombian Bar Association with 8+ years of experience.',
    location: 'Bogotá, Colombia',
    website: 'https://martinezlaw.co',
    date_of_birth: '1982-11-08',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=400&fit=crop&crop=face'
  },

  'lawyer2@sunday.local': {
    role: 'lawyer',
    verification_status: 'verified',
    full_name: 'Dr. Roberto Silva',
    phone: '+57 301 444 5678',
    bio: 'Specialized in real estate law and property disputes. Former judge with extensive knowledge of Colombian property legislation and international transactions.',
    location: 'Cali, Colombia',
    website: 'https://silvalegal.com',
    date_of_birth: '1979-05-30',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
  },

  // Premium Users
  'premium1@sunday.local': {
    role: 'premium',
    verification_status: 'verified',
    full_name: 'Isabella Santos',
    phone: '+57 320 777 8910',
    bio: 'Real estate investor and entrepreneur. Looking for premium investment opportunities in Bogotá\'s growing market. Focus on sustainable and high-yield properties.',
    location: 'Bogotá, Colombia',
    website: 'https://isabellainvest.com',
    date_of_birth: '1990-01-15',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
  },

  'premium2@sunday.local': {
    role: 'premium',
    verification_status: 'verified',
    full_name: 'Miguel Ángel Torres',
    phone: '+57 321 888 2345',
    bio: 'Business executive seeking luxury properties for personal and investment purposes. Interested in modern architecture and prime locations in Medellín.',
    location: 'Medellín, Colombia',
    website: 'https://torresinvestments.co',
    date_of_birth: '1987-09-12',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'
  },

  // Verified Regular Users
  'verified1@sunday.local': {
    role: 'verified',
    verification_status: 'verified',
    full_name: 'Laura Fernández',
    phone: '+57 310 222 3344',
    bio: 'Young professional looking for my first apartment in Chapinero. Work in tech and want a modern, safe place close to public transport.',
    location: 'Bogotá, Colombia',
    website: null,
    date_of_birth: '1995-04-20',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'
  },

  'verified2@sunday.local': {
    role: 'verified',
    verification_status: 'verified',
    full_name: 'Diego Ramírez',
    phone: '+57 311 333 5566',
    bio: 'Family man searching for a larger home as our family grows. Currently in a 2-bedroom apartment, need at least 3 bedrooms with good schools nearby.',
    location: 'Barranquilla, Colombia',
    website: null,
    date_of_birth: '1983-12-03',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face'
  },

  // Basic Registered Users
  'registered1@sunday.local': {
    role: 'registered',
    verification_status: 'unverified',
    full_name: 'Carmen Ruiz',
    phone: '+57 312 444 7788',
    bio: 'First-time homebuyer exploring options in the market. Saving up for a down payment and learning about the process.',
    location: 'Cartagena, Colombia',
    website: null,
    date_of_birth: '1992-06-28',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face'
  },

  'registered2@sunday.local': {
    role: 'registered',
    verification_status: 'pending',
    full_name: 'Javier Morales',
    phone: '+57 313 555 9900',
    bio: 'Recent graduate planning to move to Bogotá for work. Looking for affordable housing options in the city center.',
    location: 'Pereira, Colombia',
    website: 'https://javiermorales.dev',
    date_of_birth: '1997-08-14',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=400&h=400&fit=crop&crop=face'
  },

  // Visitors (unverified accounts)
  'visitor1@sunday.local': {
    role: 'visitor',
    verification_status: 'unverified',
    full_name: 'Sofia Castillo',
    phone: null,
    bio: 'Exploring real estate options while visiting Colombia. Interested in vacation properties and investment opportunities.',
    location: 'Madrid, Spain',
    website: null,
    date_of_birth: '1989-02-10',
    nationality: 'Spanish',
    avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face'
  },

  'visitor2@sunday.local': {
    role: 'visitor',
    verification_status: 'unverified',
    full_name: 'David Chen',
    phone: '+1 555 123 4567',
    bio: 'International investor researching Colombian real estate market. Looking for opportunities in Medellín and Cartagena.',
    location: 'Miami, USA',
    website: 'https://cheninvestments.com',
    date_of_birth: '1980-11-25',
    nationality: 'American',
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face'
  },

  // Legacy users that need to be mapped
  'user1@sunday.local': {
    role: 'verified',
    verification_status: 'verified',
    full_name: 'Andrés López',
    phone: '+57 314 666 1122',
    bio: 'Software engineer looking for a modern apartment in Zona G. Remote work so flexibility is important.',
    location: 'Bogotá, Colombia',
    website: 'https://andreslopez.dev',
    date_of_birth: '1991-03-05',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face'
  },

  'user2@sunday.local': {
    role: 'verified',
    verification_status: 'verified',
    full_name: 'Valentina Herrera',
    phone: '+57 315 777 3344',
    bio: 'Teacher seeking a family-friendly neighborhood with good schools. Currently renting and ready to buy.',
    location: 'Medellín, Colombia',
    website: null,
    date_of_birth: '1986-07-18',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face'
  },

  'user3@sunday.local': {
    role: 'registered',
    verification_status: 'unverified',
    full_name: 'Felipe Gómez',
    phone: '+57 316 888 5566',
    bio: 'Student finishing university and planning to stay in the city. Looking for affordable shared housing options.',
    location: 'Cali, Colombia',
    website: null,
    date_of_birth: '1999-01-30',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop&crop=face'
  },

  'user4@sunday.local': {
    role: 'registered',
    verification_status: 'pending',
    full_name: 'Gabriela Díaz',
    phone: '+57 317 999 7788',
    bio: 'Healthcare worker relocating to Bogotá for a new job opportunity. Need housing quickly and prefer furnished options.',
    location: 'Santa Marta, Colombia',
    website: null,
    date_of_birth: '1993-10-12',
    nationality: 'Colombian',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face'
  },

  'user5@sunday.local': {
    role: 'visitor',
    verification_status: 'unverified',
    full_name: 'Tomás Rivera',
    phone: '+57 318 000 9900',
    bio: 'Retired professional considering moving to Colombia. Researching retirement communities and climate considerations.',
    location: 'Buenos Aires, Argentina',
    website: null,
    date_of_birth: '1955-12-08',
    nationality: 'Argentinian',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
  }
};

async function updateAllUserProfiles() {
  console.log('🎨 Updating all user profiles with complete data...\n');

  for (const [email, profileData] of Object.entries(userProfiles)) {
    try {
      console.log(`📝 Updating ${email}: ${profileData.full_name} (${profileData.role})`);

      const { data, error } = await supabase
        .from('profiles')
        .update({
          role: profileData.role,
          verification_status: profileData.verification_status,
          full_name: profileData.full_name,
          phone: profileData.phone,
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website,
          date_of_birth: profileData.date_of_birth,
          nationality: profileData.nationality,
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select();

      if (error) {
        console.error(`❌ Error updating ${email}:`, error.message);
      } else if (data && data.length > 0) {
        console.log(`✅ Updated ${email} successfully`);
      } else {
        console.log(`⚠️  No profile found for ${email}`);
      }

    } catch (err) {
      console.error(`❌ Exception updating ${email}:`, err.message);
    }
  }

  console.log('\n🎉 All user profiles updated!');
  console.log('\n📋 User Summary:');
  console.log('Password for all accounts: Password123!\n');

  const roleGroups = {};
  Object.entries(userProfiles).forEach(([email, data]) => {
    if (!roleGroups[data.role]) roleGroups[data.role] = [];
    roleGroups[data.role].push({ email, name: data.full_name });
  });

  Object.entries(roleGroups).forEach(([role, users]) => {
    console.log(`${role.toUpperCase()} (${users.length} users):`);
    users.forEach(user => console.log(`  📧 ${user.email} - ${user.name}`));
    console.log('');
  });
}

updateAllUserProfiles().catch(console.error);
