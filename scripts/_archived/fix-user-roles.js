const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54327';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixUserRoles() {
  console.log('🔄 Fixing user roles in database...');

  // Role fixes mapping
  const roleFixes = [
    // Fix invalid roles
    { email: 'admin1@sunday.local', role: 'admin', verification_status: 'verified' },
    { email: 'admin2@sunday.local', role: 'admin', verification_status: 'verified' },
    { email: 'lawyer1@sunday.local', role: 'lawyer', verification_status: 'verified' },
    { email: 'lawyer2@sunday.local', role: 'lawyer', verification_status: 'verified' },
    { email: 'agent1@sunday.local', role: 'premium', verification_status: 'verified' },
    { email: 'user1@sunday.local', role: 'verified', verification_status: 'verified' },
    { email: 'user2@sunday.local', role: 'verified', verification_status: 'verified' },
    { email: 'user3@sunday.local', role: 'registered', verification_status: 'unverified' },
    { email: 'user4@sunday.local', role: 'registered', verification_status: 'pending' },
    { email: 'user5@sunday.local', role: 'visitor', verification_status: 'unverified' },
  ];

  for (const fix of roleFixes) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          role: fix.role,
          verification_status: fix.verification_status,
          updated_at: new Date().toISOString()
        })
        .eq('email', fix.email)
        .select();

      if (error) {
        console.error(`❌ Error updating ${fix.email}:`, error);
      } else if (data && data.length > 0) {
        console.log(`✅ Updated ${fix.email}: role='${fix.role}', verification='${fix.verification_status}'`);
      } else {
        console.log(`⚠️  No profile found for ${fix.email}`);
      }
    } catch (err) {
      console.error(`Failed to update ${fix.email}:`, err);
    }
  }

  console.log('🎉 User role fixes completed!');
}

fixUserRoles().catch(console.error);
