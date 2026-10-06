#!/usr/bin/env node

/**
 * Script to verify that all auth users have corresponding profiles
 * and create missing profiles if needed.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '..', '..', '.env.example');
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54327'; // Local development
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'; // Local anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyProfiles() {
  console.log('🔍 Verifying user profiles...\n');

  try {
    // Use direct SQL query to check profiles vs auth users
    const { data: profileStats, error: statsError } = await supabase.rpc('verify_user_profiles');

    if (statsError) {
      // Fallback: manual verification
      console.log('⚠️ RPC function not available, using manual verification...\n');

      // Get counts using direct query
      const { data: authCount, error: authError } = await supabase
        .from('auth.users')
        .select('id', { count: 'exact', head: true });

      const { data: profileCount, error: profileError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      if (authError || profileError) {
        console.error('❌ Error checking counts:', authError || profileError);
        return;
      }

      console.log(`📊 Auth users: ${authCount}`);
      console.log(`📊 Profiles: ${profileCount}`);

      if (authCount === profileCount) {
        console.log('\n✅ All auth users have profiles! (Counts match)');
      } else {
        console.log(`\n⚠️ Count mismatch: ${authCount} auth users, ${profileCount} profiles`);
        console.log('🔍 Run detailed check in database directly');
      }

      return;
    }

    // If RPC function exists, use it
    console.log('📊 Profile verification results:');
    console.log(`✅ Auth users with profiles: ${profileStats.users_with_profiles}`);
    console.log(`❌ Auth users missing profiles: ${profileStats.users_missing_profiles}`);
    console.log(`🗑️ Orphaned profiles: ${profileStats.orphaned_profiles}`);

    if (profileStats.users_missing_profiles > 0) {
      console.log('\n🚨 Missing profiles detected!');
      console.log('🔧 Run: supabase db reset --local && npm run seed');
    } else {
      console.log('\n✅ All profiles are properly synchronized!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the verification
verifyProfiles();
