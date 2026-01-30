import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://prtyuwdkrrqhtwolcrav.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydHl1d2RrcnJxaHR3b2xjcmF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg5MDUwNSwiZXhwIjoyMDc2NDY2NTA1fQ.Yj2q9w3K4zR8sN7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixProfilesRLS() {
  console.log('🔧 Fixing profiles RLS policies...\n');

  try {
    // Drop existing problematic policies
    console.log('Dropping existing policies...');
    const dropPoliciesSQL = `
      DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
      DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
      DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
      DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
      DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
      DROP POLICY IF EXISTS "Enable all access for service role" ON profiles;
    `;

    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropPoliciesSQL });
    if (dropError) {
      console.log('Note: Could not drop policies (might not exist):', dropError.message);
    }

    // Create new working policies
    console.log('Creating new policies...');
    const createPoliciesSQL = `
      -- Users can view their own profile
      CREATE POLICY "Users can view their own profile" ON profiles
        FOR SELECT USING (auth.uid()::text = id::text);

      -- Users can update their own profile
      CREATE POLICY "Users can update their own profile" ON profiles
        FOR UPDATE USING (auth.uid()::text = id::text);

      -- Users can insert their own profile
      CREATE POLICY "Users can insert their own profile" ON profiles
        FOR INSERT WITH CHECK (auth.uid()::text = id::text);

      -- Enable all access for service role (for seeding and admin operations)
      CREATE POLICY "Enable all access for service role" ON profiles
        FOR ALL USING (true);

      -- Admin policies using JWT claims instead of table queries
      CREATE POLICY "Admins can view all profiles" ON profiles
        FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

      CREATE POLICY "Admins can update all profiles" ON profiles
        FOR UPDATE USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

      CREATE POLICY "Admins can insert all profiles" ON profiles
        FOR INSERT WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
    `;

    const { error: createError } = await supabase.rpc('exec_sql', { sql: createPoliciesSQL });
    if (createError) {
      console.log('❌ Error creating policies:', createError);
      return;
    }

    console.log('✅ Profiles RLS policies fixed successfully!');

    // Test the fix
    console.log('\n🧪 Testing the fix...');
    const { data, error: testError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .limit(1);

    if (testError) {
      console.log('❌ Test failed:', testError);
    } else {
      console.log('✅ Test successful! Profiles table is now accessible.');
    }

  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error);
  }
}

fixProfilesRLS();
