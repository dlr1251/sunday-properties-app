import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54327';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔍 Testing database connection...');

  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    console.log('📊 Connection test result:', { data: connectionTest, error: connectionError });

    // Test specific user lookup
    const userId = '49032bd3-b738-487d-81c8-eca61ea9d1ca';
    console.log('🔍 Testing profile lookup for user:', userId);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('👤 Profile lookup result:', { data: profile, error: profileError });

    // Test all profiles
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('*');

    console.log('📋 All profiles:', { count: allProfiles?.length, error: allProfilesError });

  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase();
