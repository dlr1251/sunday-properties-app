import { createClient } from '@supabase/supabase-js';

// Test with service role key to bypass RLS
const supabaseUrl = 'https://prtyuwdkrrqhtwolcrav.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydHl1d2RrcnJxaHR3b2xjcmF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg5MDUwNSwiZXhwIjoyMDc2NDY2NTA1fQ.Yj2q9w3K4R8sN7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabaseService = createClient(supabaseUrl, serviceRoleKey);

async function testProfilesAccess() {
  console.log('🧪 Testing profiles table access with service role...\n');

  try {
    // Test with service role (should bypass RLS)
    console.log('Testing with service role key:');
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('profiles')
      .select('id, full_name, role')
      .limit(3);

    if (serviceError) {
      console.log('❌ Service role access failed:', serviceError);
    } else {
      console.log('✅ Service role access successful!');
      console.log('Sample profiles:', serviceData);
    }

    // Test with anon key (current app behavior)
    console.log('\nTesting with anon key (current app):');
    const supabaseAnon = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydHl1d2RrcnJxaHR3b2xjcmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTA1MDUsImV4cCI6MjA3NjQ2NjUwNX0.0n7zBh6TvTdHtEDn_lNE0IaPkIVK3Ujhf6hZ2yNFOGo');

    const { data: anonData, error: anonError } = await supabaseAnon
      .from('profiles')
      .select('id, full_name, role')
      .limit(1);

    if (anonError) {
      console.log('❌ Anon key access failed:', anonError.message);
    } else {
      console.log('✅ Anon key access successful!');
      console.log('Sample profile:', anonData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProfilesAccess();
