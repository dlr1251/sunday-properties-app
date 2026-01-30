import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '../../.env.local' });

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

const users = [
  // Administrative Users
  { email: 'superadmin@sunday.local', password: 'Password123!', role: 'super_admin', full_name: 'Super Administrator', verification_status: 'verified' },
  { email: 'admin@sunday.local', password: 'Password123!', role: 'admin', full_name: 'System Administrator', verification_status: 'verified' },

  // Legal Professionals
  { email: 'lawyer1@sunday.local', password: 'Password123!', role: 'lawyer', full_name: 'María González', verification_status: 'verified' },
  { email: 'lawyer2@sunday.local', password: 'Password123!', role: 'lawyer', full_name: 'Carlos Rodríguez', verification_status: 'verified' },

  // Premium Users
  { email: 'premium1@sunday.local', password: 'Password123!', role: 'premium', full_name: 'Ana López', verification_status: 'verified' },
  { email: 'premium2@sunday.local', password: 'Password123!', role: 'premium', full_name: 'Roberto Torres', verification_status: 'verified' },

  // Verified Regular Users
  { email: 'verified1@sunday.local', password: 'Password123!', role: 'verified', full_name: 'Juan Pérez', verification_status: 'verified' },
  { email: 'verified2@sunday.local', password: 'Password123!', role: 'verified', full_name: 'María García', verification_status: 'verified' },

  // Basic Registered Users
  { email: 'registered1@sunday.local', password: 'Password123!', role: 'registered', full_name: 'Pedro Sánchez', verification_status: 'unverified' },
  { email: 'registered2@sunday.local', password: 'Password123!', role: 'registered', full_name: 'Laura Martínez', verification_status: 'pending' },

  // Visitors (unverified accounts)
  { email: 'visitor1@sunday.local', password: 'Password123!', role: 'visitor', full_name: 'Diego Fernández', verification_status: 'unverified' },
  { email: 'visitor2@sunday.local', password: 'Password123!', role: 'visitor', full_name: 'Carmen Ruiz', verification_status: 'unverified' }
];

async function upsertAuthUsers() {
  console.log('🌱 Seeding auth users...');

  for (const user of users) {
    try {
      console.log(`Creating user: ${user.email}`);
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          role: user.role
        }
      });

      if (error) {
        console.error(`Error creating user ${user.email}:`, error);
      } else {
        console.log(`✅ Created user ${user.email} with ID: ${data.user.id}`);

      // Ensure profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (profileCheckError || !existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            status: 'active',
            verification_status: user.verification_status || 'unverified'
          });

        if (profileError) {
          console.error(`Error creating profile for ${user.email}:`, profileError);
        } else {
          console.log(`✅ Created profile for ${user.email}`);
        }
      }
      }
    } catch (err) {
      console.error(`Failed to create user ${user.email}:`, err);
    }
  }

  console.log('🎉 Auth users seeding completed!');
}

upsertAuthUsers().catch(console.error);