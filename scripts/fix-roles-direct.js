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

async function fixRoles() {
  console.log('🔧 Fixing database role constraints...');

  try {
    // First, update any existing invalid roles
    console.log('Updating existing invalid roles...');
    await supabase.rpc('exec_sql', {
      sql: `
        UPDATE profiles SET role = 'registered' WHERE role = 'user';
        UPDATE profiles SET role = 'premium' WHERE role = 'agent';
      `
    });

    // Drop the old constraint
    console.log('Dropping old constraint...');
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;'
    });

    // Add the new constraint
    console.log('Adding new constraint...');
    await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('visitor', 'registered', 'verified', 'premium', 'lawyer', 'admin', 'super_admin'));"
    });

    // Update default
    console.log('Updating default role...');
    await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'visitor';"
    });

    console.log('✅ Database role constraints fixed!');
  } catch (error) {
    console.error('❌ Error fixing roles:', error);
  }
}

fixRoles().catch(console.error);
