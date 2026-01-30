/**
 * Rollout script for structured conditions feature
 * Gradually enables feature flags for increasing percentages of users
 * 
 * Usage: node scripts/rollout-structured-conditions.mjs <percentage>
 * Example: node scripts/rollout-structured-conditions.mjs 10
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Rollout feature to a percentage of users
 */
async function rolloutFeature(percentage) {
  console.log(`🚀 Rolling out structured conditions to ${percentage}% of users...`);
  
  try {
    // Get active users
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['user', 'agent'])
      .eq('status', 'active');
    
    if (error) {
      throw error;
    }
    
    if (!users || users.length === 0) {
      console.log('⚠️  No users found');
      return;
    }
    
    console.log(`📊 Found ${users.length} active users`);
    
    // Calculate sample size
    const sampleSize = Math.floor(users.length * percentage / 100);
    
    // Randomly select users
    const selectedUsers = users
      .sort(() => Math.random() - 0.5)
      .slice(0, sampleSize)
      .map(u => u.id);
    
    console.log(`🎯 Selected ${selectedUsers.length} users for rollout`);
    
    // Get current feature flag
    const { data: flag, error: flagError } = await supabase
      .from('feature_flags')
      .select('enabled_for_users')
      .eq('flag_name', 'structured_conditions')
      .single();
    
    if (flagError) {
      throw flagError;
    }
    
    // Merge with existing enabled users
    const existingUsers = flag.enabled_for_users || [];
    const mergedUsers = [...new Set([...existingUsers, ...selectedUsers])];
    
    // Update feature flag
    const { error: updateError } = await supabase
      .from('feature_flags')
      .update({
        enabled_for_users: mergedUsers,
        updated_at: new Date().toISOString()
      })
      .eq('flag_name', 'structured_conditions');
    
    if (updateError) {
      throw updateError;
    }
    
    console.log(`✅ Successfully enabled feature for ${mergedUsers.length} total users`);
    console.log(`   Previous: ${existingUsers.length}`);
    console.log(`   New: ${selectedUsers.length}`);
    console.log(`   Total: ${mergedUsers.length}`);
    
  } catch (error) {
    console.error('❌ Error during rollout:', error);
    process.exit(1);
  }
}

/**
 * Enable globally
 */
async function enableGlobally() {
  console.log('🚀 Enabling structured conditions globally...');
  
  try {
    const { error } = await supabase
      .from('feature_flags')
      .update({
        enabled_globally: true,
        enabled_for_users: [],
        updated_at: new Date().toISOString()
      })
      .eq('flag_name', 'structured_conditions');
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Feature enabled globally for all users');
    
  } catch (error) {
    console.error('❌ Error enabling globally:', error);
    process.exit(1);
  }
}

/**
 * Rollback - disable feature
 */
async function rollback() {
  console.log('🔄 Rolling back structured conditions feature...');
  
  try {
    const { error } = await supabase
      .from('feature_flags')
      .update({
        enabled_globally: false,
        enabled_for_users: [],
        updated_at: new Date().toISOString()
      })
      .eq('flag_name', 'structured_conditions');
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Feature rolled back - disabled for all users');
    
  } catch (error) {
    console.error('❌ Error during rollback:', error);
    process.exit(1);
  }
}

/**
 * Show current status
 */
async function showStatus() {
  console.log('📊 Current feature flag status:');
  
  try {
    const { data: flags, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('flag_name', 'structured_conditions')
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log(`   Flag: ${flags.flag_name}`);
    console.log(`   Globally enabled: ${flags.enabled_globally}`);
    console.log(`   Users enabled: ${flags.enabled_for_users?.length || 0}`);
    console.log(`   Roles enabled: ${flags.enabled_for_roles?.join(', ') || 'none'}`);
    
    // Get adoption stats
    const { data: offers } = await supabase
      .from('offers')
      .select('id', { count: 'exact' });
    
    const { data: conditions } = await supabase
      .from('offer_conditions')
      .select('id', { count: 'exact' });
    
    console.log(`\n📈 Adoption stats:`);
    console.log(`   Total offers: ${offers?.length || 0}`);
    console.log(`   Offers with conditions: ${conditions?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Error getting status:', error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('='.repeat(60));
  console.log('STRUCTURED CONDITIONS ROLLOUT');
  console.log('='.repeat(60));
  
  switch (command) {
    case 'rollout':
      const percentage = parseInt(args[1]);
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        console.error('❌ Invalid percentage. Must be 0-100');
        process.exit(1);
      }
      await rolloutFeature(percentage);
      break;
      
    case 'global':
      await enableGlobally();
      break;
      
    case 'rollback':
      await rollback();
      break;
      
    case 'status':
      await showStatus();
      break;
      
    default:
      console.log('Usage:');
      console.log('  node rollout-structured-conditions.mjs rollout <percentage>');
      console.log('  node rollout-structured-conditions.mjs global');
      console.log('  node rollout-structured-conditions.mjs rollback');
      console.log('  node rollout-structured-conditions.mjs status');
      console.log('\nExamples:');
      console.log('  node rollout-structured-conditions.mjs rollout 10  # 10% of users');
      console.log('  node rollout-structured-conditions.mjs rollout 50  # 50% of users');
      console.log('  node rollout-structured-conditions.mjs global      # All users');
      console.log('  node rollout-structured-conditions.mjs rollback    # Disable');
      process.exit(0);
  }
  
  console.log('='.repeat(60));
  console.log('Done!');
  console.log('='.repeat(60));
}

main().catch(console.error);

