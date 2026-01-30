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

async function checkUsers() {
  console.log('🔍 Checking actual users in database...\n');

  try {
    // Get all users from auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Auth error:', authError);
      return;
    }

    console.log(`📊 Found ${authUsers.users.length} users in auth:\n`);

    for (const user of authUsers.users) {
      console.log(`🔐 User: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.log(`   ❌ Profile: Not found (${profileError.message})`);
      } else {
        console.log(`   ✅ Profile: role='${profile.role}', verification='${profile.verification_status}'`);
      }

      console.log('');
    }

    // Test specific user login
    console.log('🔐 Testing login for lawyer1@sunday.local...\n');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'lawyer1@sunday.local',
        password: 'Password123!'
      });

      if (error) {
        console.error('❌ Login failed:', error.message);
      } else {
        console.log('✅ Login successful!');
        console.log('User:', data.user?.email);
        console.log('Session:', data.session ? 'Created' : 'None');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

checkUsers().catch(console.error);
