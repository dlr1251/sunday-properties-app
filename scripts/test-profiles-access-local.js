import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54327';
const serviceRoleKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';
const anonKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const supabaseService = createClient(supabaseUrl, serviceRoleKey);
const supabaseAnon = createClient(supabaseUrl, anonKey);

async function testProfilesAccess() {
  console.log('🧪 Testing profiles table access on LOCAL database...\n');

  try {
    // Test with service role (should bypass RLS)
    console.log('Testing with service role key:');
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('profiles')
      .select('id, full_name, role, email')
      .limit(3);

    if (serviceError) {
      console.log('❌ Service role access failed:', serviceError);
    } else {
      console.log('✅ Service role access successful!');
      console.log('Sample profiles:', serviceData);
    }

    // Test with anon key (should work for authenticated users)
    console.log('\nTesting with anon key (simulating app behavior):');
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('profiles')
      .select('id, full_name, role')
      .limit(1);

    if (anonError) {
      console.log('❌ Anon key access failed:', anonError.message);
      console.log('This is expected if no user is authenticated');
    } else {
      console.log('✅ Anon key access successful!');
      console.log('Sample profile:', anonData);
    }

    console.log('\n🎉 Profiles RLS policies test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProfilesAccess();
