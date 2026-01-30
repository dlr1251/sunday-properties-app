import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54327';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getUserIds() {
  console.log('🔍 Getting user IDs...\n');

  try {
    // Get all users from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.log('❌ Error getting auth users:', authError);
      return;
    }

    console.log('📋 Auth Users:');
    authUsers.users.forEach(user => {
      console.log(`  ${user.email}: ${user.id}`);
    });

    // Get profiles to see the mapping
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role');

    console.log('\n👤 Profiles:');
    profiles?.forEach(profile => {
      console.log(`  ${profile.email}: ${profile.id} (${profile.role})`);
    });

  } catch (error) {
    console.error('❌ Failed to get user IDs:', error);
  }
}

getUserIds();
