const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54327';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  // Administrative Users
  { email: 'superadmin@sunday.local', password: 'Password123!', role: 'super_admin', full_name: 'Super Administrator', verification_status: 'verified' },
  { email: 'admin@sunday.local', password: 'Password123!', role: 'admin', full_name: 'System Administrator', verification_status: 'verified' },

  // Legal Professionals
  { email: 'lawyer1@sunday.local', password: 'Password123!', role: 'lawyer', full_name: 'María González', verification_status: 'verified' },
  { email: 'lawyer2@sunday.local', password: 'Password123!', role: 'lawyer', full_name: 'Carlos Rodríguez', verification_status: 'verified' },

  // Premium Users
  { email: 'premium1@sunday.local', password: 'Password123!', role: 'premium', full_name: 'Ana López', verification_status: 'verified' },
  { email: 'premium2@sunday.local', password: 'Password123!', role: 'premium', full_name: 'Roberto Torres', verification_status: 'verified' },

  // Verified Regular Users
  { email: 'verified1@sunday.local', password: 'Password123!', role: 'verified', full_name: 'Juan Pérez', verification_status: 'verified' },
  { email: 'verified2@sunday.local', password: 'Password123!', role: 'verified', full_name: 'María García', verification_status: 'verified' },

  // Basic Registered Users
  { email: 'registered1@sunday.local', password: 'Password123!', role: 'registered', full_name: 'Pedro Sánchez', verification_status: 'unverified' },
  { email: 'registered2@sunday.local', password: 'Password123!', role: 'registered', full_name: 'Laura Martínez', verification_status: 'pending' },

  // Visitors (unverified accounts)
  { email: 'visitor1@sunday.local', password: 'Password123!', role: 'visitor', full_name: 'Diego Fernández', verification_status: 'unverified' },
  { email: 'visitor2@sunday.local', password: 'Password123!', role: 'visitor', full_name: 'Carmen Ruiz', verification_status: 'unverified' }
];

async function setupTestUsers() {
  console.log('🌱 Setting up comprehensive test users...');

  for (const userData of testUsers) {
    try {
      console.log(`\n📧 Processing user: ${userData.email}`);

      // Check if user exists
      const { data: existingUser, error: userCheckError } = await supabase.auth.admin.listUsers({
        filter: `email.eq.${userData.email}`
      });

      let userId;

      if (existingUser && existingUser.users && existingUser.users.length > 0) {
        console.log(`✅ User ${userData.email} exists, updating...`);
        userId = existingUser.users[0].id;

        // Update user metadata if needed
        if (existingUser.users[0].user_metadata?.role !== userData.role) {
          await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
              ...existingUser.users[0].user_metadata,
              full_name: userData.full_name,
              role: userData.role
            }
          });
        }
      } else {
        // Create new user
        console.log(`🆕 Creating user: ${userData.email}`);
        const { data, error } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            full_name: userData.full_name,
            role: userData.role
          }
        });

        if (error) {
          console.error(`❌ Failed to create user ${userData.email}:`, error);
          continue;
        }

        userId = data.user.id;
        console.log(`✅ Created user ${userData.email} with ID: ${userId}`);
      }

      // Ensure profile exists and is correct
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileCheckError || !existingProfile) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role,
            status: 'active',
            verification_status: userData.verification_status
          });

        if (profileError) {
          console.error(`❌ Failed to create profile for ${userData.email}:`, profileError);
        } else {
          console.log(`✅ Created profile for ${userData.email}`);
        }
      } else {
        // Update profile if needed
        if (existingProfile.role !== userData.role || existingProfile.verification_status !== userData.verification_status) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              role: userData.role,
              verification_status: userData.verification_status,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (updateError) {
            console.error(`❌ Failed to update profile for ${userData.email}:`, updateError);
          } else {
            console.log(`✅ Updated profile for ${userData.email}: role=${userData.role}, verification=${userData.verification_status}`);
          }
        } else {
          console.log(`✅ Profile for ${userData.email} is already correct`);
        }
      }

    } catch (err) {
      console.error(`❌ Error processing ${userData.email}:`, err);
    }
  }

  console.log('\n🎉 Test users setup completed!');
  console.log('\n📋 Available test accounts:');
  console.log('Password for all accounts: Password123!');
  console.log('');

  const roles = [...new Set(testUsers.map(u => u.role))];
  roles.forEach(role => {
    const usersInRole = testUsers.filter(u => u.role === role);
    console.log(`\n${role.toUpperCase()} (${usersInRole.length} accounts):`);
    usersInRole.forEach(user => {
      console.log(`  📧 ${user.email} - ${user.full_name}`);
    });
  });

  console.log('\n💡 Use these accounts to test different dashboard experiences!');
}

setupTestUsers().catch(console.error);
