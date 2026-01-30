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

async function testWorkingUsers() {
  console.log('🔍 Testing working user accounts...\n');

  const workingUsers = [
    { email: 'superadmin@sunday.local', password: 'Password123!', expectedRole: 'super_admin' },
    { email: 'admin@sunday.local', password: 'Password123!', expectedRole: 'admin' },
    { email: 'lawyer1@sunday.local', password: 'Password123!', expectedRole: 'lawyer' },
    { email: 'lawyer2@sunday.local', password: 'Password123!', expectedRole: 'lawyer' }
  ];

  for (const user of workingUsers) {
    try {
      console.log(`🔐 Testing login for: ${user.email} (${user.expectedRole})`);

      // Check if user exists in auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
        filter: `email.eq.${user.email}`
      });

      if (authError || !authUsers.users || authUsers.users.length === 0) {
        console.log(`❌ User ${user.email} not found in auth`);
        continue;
      }

      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .single();

      if (profileError || !profile) {
        console.log(`❌ Profile not found for ${user.email}`);
        continue;
      }

      console.log(`✅ ${user.email}: role='${profile.role}', verification='${profile.verification_status}'`);

      if (profile.role === user.expectedRole) {
        console.log(`🎯 Dashboard should show: ${profile.role === 'super_admin' ? 'SuperAdminDashboard' : profile.role === 'admin' ? 'AdminDashboard' : 'LawyerDashboard'}`);
      } else {
        console.log(`⚠️  Role mismatch: expected '${user.expectedRole}', got '${profile.role}'`);
      }

      console.log('');

    } catch (err) {
      console.error(`❌ Error testing ${user.email}:`, err.message);
    }
  }

  console.log('💡 Ready to test these working accounts!');
  console.log('📋 Use these credentials in the TestingUsersPage:');
  workingUsers.forEach(user => {
    console.log(`   ${user.email} / Password123! → ${user.expectedRole} dashboard`);
  });
}

testWorkingUsers().catch(console.error);
