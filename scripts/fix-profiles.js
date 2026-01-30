const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54327';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Role mappings for each user
const roleMappings = {
  'superadmin@sunday.local': { role: 'super_admin', verification_status: 'verified' },
  'admin@sunday.local': { role: 'admin', verification_status: 'verified' },
  'lawyer1@sunday.local': { role: 'lawyer', verification_status: 'verified' },
  'lawyer2@sunday.local': { role: 'lawyer', verification_status: 'verified' },
  'premium1@sunday.local': { role: 'premium', verification_status: 'verified' },
  'premium2@sunday.local': { role: 'premium', verification_status: 'verified' },
  'verified1@sunday.local': { role: 'verified', verification_status: 'verified' },
  'verified2@sunday.local': { role: 'verified', verification_status: 'verified' },
  'registered1@sunday.local': { role: 'registered', verification_status: 'unverified' },
  'registered2@sunday.local': { role: 'registered', verification_status: 'pending' },
  'visitor1@sunday.local': { role: 'visitor', verification_status: 'unverified' },
  'visitor2@sunday.local': { role: 'visitor', verification_status: 'unverified' }
};

async function fixProfiles() {
  console.log('🔧 Fixing user profiles with correct roles...\n');

  for (const [email, { role, verification_status }] of Object.entries(roleMappings)) {
    try {
      console.log(`📝 Updating ${email}: role='${role}', verification='${verification_status}'`);

      const { data, error } = await supabase
        .from('profiles')
        .update({
          role: role,
          verification_status: verification_status,
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

  console.log('\n🎉 Profile updates completed!');
  console.log('\n📋 Testing dashboard routing:');
  console.log('• superadmin@sunday.local → SuperAdminDashboard');
  console.log('• admin@sunday.local → AdminDashboard');
  console.log('• lawyer1/2@sunday.local → LawyerDashboard');
  console.log('• All others → UserDashboard');
}

fixProfiles().catch(console.error);
