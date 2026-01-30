import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54327';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test users mapping
const userMapping = {
  'admin1@sunday.local': { full_name: 'Super Admin User', role: 'super_admin' },
  'admin2@sunday.local': { full_name: 'Admin User', role: 'admin' },
  'lawyer1@sunday.local': { full_name: 'María González', role: 'lawyer' },
  'lawyer2@sunday.local': { full_name: 'Carlos Rodríguez', role: 'lawyer' },
  'agent1@sunday.local': { full_name: 'Ana López', role: 'agent' },
  'user1@sunday.local': { full_name: 'Juan Pérez', role: 'user' },
  'user2@sunday.local': { full_name: 'María García', role: 'user' },
  'user3@sunday.local': { full_name: 'Pedro Sánchez', role: 'user' },
  'user4@sunday.local': { full_name: 'Laura Martínez', role: 'user' },
  'user5@sunday.local': { full_name: 'Diego Fernández', role: 'user' }
};

async function ensureProfiles() {
  console.log('🔍 Ensuring all auth users have profiles...');

  try {
    // Get all auth users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    console.log(`Found ${users.length} auth users`);

    for (const authUser of users) {
      if (!authUser.email) continue;

      const userInfo = userMapping[authUser.email];
      if (!userInfo) continue;

      // Check if profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authUser.id)
        .single();

      if (profileCheckError || !existingProfile) {
        console.log(`Creating profile for ${authUser.email}...`);

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email,
            full_name: userInfo.full_name,
            role: userInfo.role,
            status: 'active',
            verification_status: 'verified'
          });

        if (profileError) {
          console.error(`❌ Error creating profile for ${authUser.email}:`, profileError);
        } else {
          console.log(`✅ Created profile for ${authUser.email}`);
        }
      } else {
        console.log(`✅ Profile already exists for ${authUser.email}`);
      }
    }

    console.log('🎉 Profile check completed!');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

ensureProfiles().catch(console.error);
