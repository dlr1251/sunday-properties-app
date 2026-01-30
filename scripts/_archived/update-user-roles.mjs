import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '../.env.local' });

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

// Role mapping to fix existing users
const roleUpdates = [
  // Fix admin roles
  { email: 'admin1@sunday.local', newRole: 'admin', verification_status: 'verified' },
  { email: 'admin2@sunday.local', newRole: 'admin', verification_status: 'verified' },

  // Fix user roles (map 'user' to 'verified' for active users)
  { email: 'user1@sunday.local', newRole: 'verified', verification_status: 'verified' },
  { email: 'user2@sunday.local', newRole: 'verified', verification_status: 'verified' },
  { email: 'user3@sunday.local', newRole: 'registered', verification_status: 'unverified' },
  { email: 'user4@sunday.local', newRole: 'registered', verification_status: 'pending' },
  { email: 'user5@sunday.local', newRole: 'visitor', verification_status: 'unverified' },

  // Fix agent roles (map to 'premium' since agents have special privileges)
  { email: 'agent1@sunday.local', newRole: 'premium', verification_status: 'verified' }
];

async function updateUserRoles() {
  console.log('🔄 Updating user roles to match database schema...');

  for (const update of roleUpdates) {
    try {
      // Get user by email
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(update.email);

      if (authError || !authUser.user) {
        console.log(`⚠️  User ${update.email} not found, skipping...`);
        continue;
      }

      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: update.newRole,
          verification_status: update.verification_status,
          updated_at: new Date().toISOString()
        })
        .eq('email', update.email);

      if (profileError) {
        console.error(`❌ Error updating profile for ${update.email}:`, profileError);
      } else {
        console.log(`✅ Updated ${update.email}: role '${update.newRole}', verification '${update.verification_status}'`);
      }

      // Also update user metadata if needed
      if (authUser.user.user_metadata?.role !== update.newRole) {
        const { error: metadataError } = await supabase.auth.admin.updateUserById(
          authUser.user.id,
          {
            user_metadata: {
              ...authUser.user.user_metadata,
              role: update.newRole
            }
          }
        );

        if (metadataError) {
          console.error(`⚠️  Could not update metadata for ${update.email}:`, metadataError);
        }
      }

    } catch (err) {
      console.error(`Failed to update user ${update.email}:`, err);
    }
  }

  console.log('🎉 User role updates completed!');
}

updateUserRoles().catch(console.error);
