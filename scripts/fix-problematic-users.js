// Script para corregir usuarios problemáticos (user1, user2, user9, user10)
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

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
const PROBLEMATIC_USERS = ['user1@sunday.local', 'user2@sunday.local', 'user9@sunday.local', 'user10@sunday.local'];

async function fixProblematicUsers() {
  console.log('🔧 Corrigiendo usuarios problemáticos...\n');

  try {
    // Step 1: Get problematic users from profiles
    console.log('1. Obteniendo usuarios problemáticos de profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, verification_status')
      .in('email', PROBLEMATIC_USERS);

    if (profilesError) {
      throw new Error(`Error al obtener perfiles: ${profilesError.message}`);
    }

    console.log(`   ✅ Encontrados ${profiles.length} usuarios problemáticos\n`);

    if (profiles.length === 0) {
      console.log('   ℹ️  No se encontraron usuarios problemáticos en profiles.');
      return;
    }

    // Step 2: Check auth.users
    console.log('2. Verificando estado en auth.users...\n');
    const { data: authUsersData, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Error al listar usuarios: ${listError.message}`);
    }

    const authUsers = authUsersData.users;

    for (const profile of profiles) {
      console.log(`\n🔍 Procesando: ${profile.email}`);
      console.log(`   Profile ID: ${profile.id}`);

      const existingAuthUser = authUsers.find(u => u.email === profile.email);

      if (existingAuthUser) {
        console.log(`   ✅ Usuario existe en auth.users (ID: ${existingAuthUser.id})`);
        
        // Check if IDs match
        if (existingAuthUser.id !== profile.id) {
          console.log(`   ⚠️  ID mismatch: profile.id=${profile.id}, auth.id=${existingAuthUser.id}`);
          console.log(`   🔨 Actualizando perfil para usar el ID correcto de auth...`);
          
          // Option 1: Try to update profile to match auth user ID
          // But first, check if there's already a profile with the auth user ID
          const { data: existingProfileWithAuthId } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('id', existingAuthUser.id)
            .single();

          if (existingProfileWithAuthId) {
            console.log(`   ⚠️  Ya existe un perfil con el ID de auth (${existingAuthUser.id})`);
            console.log(`   🔨 Eliminando perfil duplicado y creando uno nuevo...`);
            
            // Delete the profile with wrong ID
            const { error: deleteError } = await supabase
              .from('profiles')
              .delete()
              .eq('id', profile.id);

            if (deleteError) {
              console.log(`   ❌ Error al eliminar perfil duplicado: ${deleteError.message}`);
            } else {
              console.log(`   ✅ Perfil duplicado eliminado`);
            }

            // Update the existing profile to match this user's data
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                email: profile.email,
                full_name: profile.full_name,
                role: profile.role,
                verification_status: profile.verification_status,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingAuthUser.id);

            if (updateError) {
              console.log(`   ❌ Error al actualizar perfil: ${updateError.message}`);
            } else {
              console.log(`   ✅ Perfil actualizado correctamente`);
            }
          } else {
            // No profile with auth ID exists, we can update this one
            console.log(`   🔨 Actualizando perfil para usar el ID correcto...`);
            
            // This is tricky - we need to delete the old profile and create a new one
            // Or we can try to update the profile ID directly (might not work due to FK constraint)
            
            // Better approach: Delete old profile, create new one with correct ID
            const { error: deleteError } = await supabase
              .from('profiles')
              .delete()
              .eq('id', profile.id);

            if (deleteError) {
              console.log(`   ❌ Error al eliminar perfil con ID incorrecto: ${deleteError.message}`);
              continue;
            }

            // Create new profile with correct ID
            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert({
                id: existingAuthUser.id,
                email: profile.email,
                full_name: profile.full_name,
                role: profile.role,
                verification_status: profile.verification_status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (createProfileError) {
              console.log(`   ❌ Error al crear perfil con ID correcto: ${createProfileError.message}`);
            } else {
              console.log(`   ✅ Perfil recreado con ID correcto`);
            }
          }
        }

        // Update password
        console.log(`   🔨 Actualizando contraseña...`);
        const { error: updatePasswordError } = await supabase.auth.admin.updateUserById(
          existingAuthUser.id,
          {
            password: TEST_PASSWORD,
            email_confirm: true
          }
        );

        if (updatePasswordError) {
          console.log(`   ❌ Error al actualizar contraseña: ${updatePasswordError.message}`);
        } else {
          console.log(`   ✅ Contraseña actualizada`);
        }

      } else {
        // User doesn't exist in auth.users
        console.log(`   ⚠️  Usuario NO existe en auth.users`);
        console.log(`   🔨 Creando usuario en auth.users...`);

        // Check if the profile ID is a valid UUID that matches an auth user
        // If profile.id is already a UUID, try to create auth user with that ID
        // Otherwise, create new auth user and update profile

        try {
          // Try to create auth user
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
            console.log(`   ❌ Error al crear usuario: ${createError.message}`);
            
            // If it's a database error, try to delete and recreate the profile
            if (createError.message.includes('Database error')) {
              console.log(`   🔨 Intentando solución alternativa: eliminar y recrear perfil...`);
              
              // Delete the profile first
              const { error: deleteError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', profile.id);

              if (deleteError) {
                console.log(`   ❌ Error al eliminar perfil: ${deleteError.message}`);
              } else {
                console.log(`   ✅ Perfil eliminado`);
                
                // Now try to create auth user again
                const { data: retryUser, error: retryError } = await supabase.auth.admin.createUser({
                  email: profile.email,
                  password: TEST_PASSWORD,
                  email_confirm: true,
                  user_metadata: {
                    full_name: profile.full_name || profile.email.split('@')[0],
                    role: profile.role
                  }
                });

                if (retryError) {
                  console.log(`   ❌ Error al crear usuario después de eliminar perfil: ${retryError.message}`);
                } else if (retryUser?.user) {
                  console.log(`   ✅ Usuario creado: ${retryUser.user.id}`);
                  
                  // Create profile with correct ID
                  const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                      id: retryUser.user.id,
                      email: profile.email,
                      full_name: profile.full_name,
                      role: profile.role,
                      verification_status: profile.verification_status,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    });

                  if (profileError) {
                    console.log(`   ❌ Error al crear perfil: ${profileError.message}`);
                  } else {
                    console.log(`   ✅ Perfil creado con ID correcto`);
                  }
                }
              }
            }
          } else if (newUser?.user) {
            console.log(`   ✅ Usuario creado: ${newUser.user.id}`);
            
            // Update profile ID if it doesn't match
            if (newUser.user.id !== profile.id) {
              console.log(`   🔨 Actualizando perfil para usar el ID correcto...`);
              
              // Delete old profile
              const { error: deleteError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', profile.id);

              if (deleteError) {
                console.log(`   ⚠️  Error al eliminar perfil antiguo: ${deleteError.message}`);
              }

              // Create new profile with correct ID
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: newUser.user.id,
                  email: profile.email,
                  full_name: profile.full_name,
                  role: profile.role,
                  verification_status: profile.verification_status,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });

              if (profileError) {
                console.log(`   ❌ Error al crear perfil: ${profileError.message}`);
              } else {
                console.log(`   ✅ Perfil actualizado con ID correcto`);
              }
            }
          }
        } catch (err) {
          console.log(`   ❌ Excepción al crear usuario: ${err.message}`);
        }
      }
    }

    // Step 3: Test logins
    console.log('\n\n3. Probando logins de usuarios corregidos...\n');
    
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    const testClient = createClient(supabaseUrl, anonKey);

    for (const email of PROBLEMATIC_USERS) {
      try {
        const { data, error: signInError } = await testClient.auth.signInWithPassword({
          email,
          password: TEST_PASSWORD
        });

        if (signInError) {
          console.log(`   ❌ ${email}: ${signInError.message}`);
        } else {
          console.log(`   ✅ ${email}: Login exitoso`);
          await testClient.auth.signOut();
        }
      } catch (err) {
        console.log(`   ❌ ${email}: ${err.message}`);
      }
    }

    console.log('\n✅ Proceso completado!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixProblematicUsers();

