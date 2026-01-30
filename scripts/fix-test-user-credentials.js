// Script para verificar y corregir credenciales de usuarios de prueba
// Asegura que todos los usuarios en profiles tengan credenciales válidas en auth.users

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54327';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const TEST_PASSWORD = 'Password123!';

async function fixTestUserCredentials() {
  console.log('🔍 Verificando y corrigiendo credenciales de usuarios de prueba...\n');

  try {
    // Step 1: Get all users from profiles table
    console.log('1. Obteniendo usuarios de la tabla profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, verification_status')
      .order('created_at', { ascending: false });

    if (profilesError) {
      throw new Error(`Error al obtener perfiles: ${profilesError.message}`);
    }

    console.log(`   ✅ Encontrados ${profiles.length} usuarios en profiles\n`);

    if (profiles.length === 0) {
      console.log('   ⚠️  No hay usuarios para verificar.');
      return;
    }

    // Step 2: Check each user in auth.users
    console.log('2. Verificando usuarios en auth.users...\n');
    let fixedCount = 0;
    let verifiedCount = 0;
    let errorCount = 0;

    for (const profile of profiles) {
      if (!profile.email) {
        console.log(`   ⚠️  Usuario ${profile.id} no tiene email, saltando...`);
        continue;
      }

      try {
        // Check if user exists in auth.users
        const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          console.error(`   ❌ Error al listar usuarios: ${listError.message}`);
          continue;
        }

        const existingUser = authUsers.users.find(u => u.email === profile.email);

        if (!existingUser) {
          // Create user in auth.users
          console.log(`   🔨 Creando usuario en auth: ${profile.email}`);
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: profile.email,
            password: TEST_PASSWORD,
            email_confirm: true,
            user_metadata: {
              full_name: profile.full_name || profile.email.split('@')[0],
              role: profile.role
            }
          });

          if (createError) {
            console.error(`   ❌ Error al crear usuario ${profile.email}: ${createError.message}`);
            errorCount++;
            continue;
          }

          console.log(`   ✅ Usuario creado: ${profile.email} (ID: ${newUser.user.id})`);
          fixedCount++;
        } else {
          // User exists, check if password needs to be reset
          console.log(`   ✅ Usuario existe: ${profile.email}`);
          
          // Update password to ensure it's correct
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
              password: TEST_PASSWORD,
              email_confirm: true
            }
          );

          if (updateError) {
            console.error(`   ⚠️  Error al actualizar contraseña para ${profile.email}: ${updateError.message}`);
          } else {
            console.log(`   ✅ Contraseña actualizada para ${profile.email}`);
            fixedCount++;
          }

          verifiedCount++;
        }
      } catch (err) {
        console.error(`   ❌ Error procesando ${profile.email}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n3. Resumen:');
    console.log(`   ✅ Usuarios verificados: ${verifiedCount}`);
    console.log(`   🔨 Usuarios corregidos/creados: ${fixedCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`\n   🔑 Contraseña para todos los usuarios: ${TEST_PASSWORD}`);

    // Step 3: Test login for a few users
    console.log('\n4. Probando login con algunos usuarios...\n');
    
    const testUsers = profiles.slice(0, 3).filter(p => p.email);
    for (const testUser of testUsers) {
      try {
        // Create a client with anon key for testing
        const testClient = createClient(
          supabaseUrl,
          process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
        );

        const { data: signInData, error: signInError } = await testClient.auth.signInWithPassword({
          email: testUser.email,
          password: TEST_PASSWORD
        });

        if (signInError) {
          console.log(`   ❌ Login falló para ${testUser.email}: ${signInError.message}`);
        } else {
          console.log(`   ✅ Login exitoso para ${testUser.email}`);
          // Sign out immediately
          await testClient.auth.signOut();
        }
      } catch (err) {
        console.log(`   ❌ Error probando login para ${testUser.email}: ${err.message}`);
      }
    }

    console.log('\n✅ Proceso completado!');
    console.log('\n💡 Ahora puedes usar estos usuarios en TestingUsersPage:');
    console.log(`   Email: cualquier email de la lista`);
    console.log(`   Contraseña: ${TEST_PASSWORD}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
fixTestUserCredentials();

