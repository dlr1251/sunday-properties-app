// Script mejorado para corregir usuarios problemáticos que tienen propiedades
// Estrategia: Crear usuarios en auth.users y actualizar propiedades para usar los nuevos IDs

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

async function fixProblematicUsersV2() {
  console.log('🔧 Corrigiendo usuarios problemáticos (v2 - con propiedades)...\n');

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

    // Step 2: Check which users have properties
    console.log('2. Verificando propiedades asociadas...\n');
    
    for (const profile of profiles) {
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id, title, owner_id')
        .eq('owner_id', profile.id);

      if (propError) {
        console.log(`   ⚠️  Error al verificar propiedades para ${profile.email}: ${propError.message}`);
      } else {
        console.log(`   ${profile.email}: ${properties?.length || 0} propiedades`);
      }
    }

    // Step 3: Check auth.users
    console.log('\n3. Verificando estado en auth.users...\n');
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
        
        if (existingAuthUser.id !== profile.id) {
          console.log(`   ⚠️  ID mismatch detectado`);
          console.log(`   🔨 Actualizando propiedades para usar el ID correcto de auth...`);
          
          // Update properties to use the correct auth user ID
          const { data: properties, error: propError } = await supabase
            .from('properties')
            .select('id, title')
            .eq('owner_id', profile.id);

          if (propError) {
            console.log(`   ❌ Error al obtener propiedades: ${propError.message}`);
          } else if (properties && properties.length > 0) {
            console.log(`   🔨 Actualizando ${properties.length} propiedades...`);
            
            const { error: updatePropsError } = await supabase
              .from('properties')
              .update({ owner_id: existingAuthUser.id })
              .eq('owner_id', profile.id);

            if (updatePropsError) {
              console.log(`   ❌ Error al actualizar propiedades: ${updatePropsError.message}`);
            } else {
              console.log(`   ✅ Propiedades actualizadas`);
            }
          }

          // Now delete the old profile and create a new one with correct ID
          console.log(`   🔨 Recreando perfil con ID correcto...`);
          
          // Save profile data
          const profileData = {
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role,
            verification_status: profile.verification_status
          };

          // Delete old profile
          const { error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', profile.id);

          if (deleteError) {
            console.log(`   ❌ Error al eliminar perfil antiguo: ${deleteError.message}`);
            continue;
          }

          // Create new profile with correct ID
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert({
              id: existingAuthUser.id,
              ...profileData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (createProfileError) {
            console.log(`   ❌ Error al crear perfil: ${createProfileError.message}`);
          } else {
            console.log(`   ✅ Perfil recreado con ID correcto`);
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
        // User doesn't exist in auth.users - create it
        console.log(`   ⚠️  Usuario NO existe en auth.users`);
        console.log(`   🔨 Creando usuario en auth.users...`);

        // Check if there are properties
        const { data: properties, error: propError } = await supabase
          .from('properties')
          .select('id, title')
          .eq('owner_id', profile.id);

        const hasProperties = properties && properties.length > 0;
        
        if (hasProperties) {
          console.log(`   ⚠️  Usuario tiene ${properties.length} propiedades asociadas`);
          console.log(`   🔨 Creando usuario y luego actualizando propiedades...`);
        }

        // Create auth user (let Supabase assign the ID)
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
          
          // If it's a duplicate email error, try to find the user
          if (createError.message.includes('already registered') || createError.message.includes('already exists')) {
            console.log(`   🔍 Buscando usuario existente...`);
            const foundUser = authUsers.find(u => u.email.toLowerCase() === profile.email.toLowerCase());
            
            if (foundUser) {
              console.log(`   ✅ Usuario encontrado: ${foundUser.id}`);
              
              // Update password
              const { error: updatePasswordError } = await supabase.auth.admin.updateUserById(
                foundUser.id,
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

              // Update properties if needed
              if (hasProperties && foundUser.id !== profile.id) {
                console.log(`   🔨 Actualizando propiedades para usar el ID correcto...`);
                const { error: updatePropsError } = await supabase
                  .from('properties')
                  .update({ owner_id: foundUser.id })
                  .eq('owner_id', profile.id);

                if (updatePropsError) {
                  console.log(`   ❌ Error al actualizar propiedades: ${updatePropsError.message}`);
                } else {
                  console.log(`   ✅ Propiedades actualizadas`);
                }

                // Recreate profile with correct ID
                const profileData = {
                  email: profile.email,
                  full_name: profile.full_name,
                  role: profile.role,
                  verification_status: profile.verification_status
                };

                // Delete old profile
                const { error: deleteError } = await supabase
                  .from('profiles')
                  .delete()
                  .eq('id', profile.id);

                if (!deleteError) {
                  // Create new profile
                  const { error: createProfileError } = await supabase
                    .from('profiles')
                    .insert({
                      id: foundUser.id,
                      ...profileData,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    });

                  if (createProfileError) {
                    console.log(`   ❌ Error al crear perfil: ${createProfileError.message}`);
                  } else {
                    console.log(`   ✅ Perfil recreado con ID correcto`);
                  }
                }
              }
            }
          }
        } else if (newUser?.user) {
          console.log(`   ✅ Usuario creado: ${newUser.user.id}`);
          
          // Update properties if needed
          if (hasProperties && newUser.user.id !== profile.id) {
            console.log(`   🔨 Actualizando propiedades para usar el nuevo ID...`);
            const { error: updatePropsError } = await supabase
              .from('properties')
              .update({ owner_id: newUser.user.id })
              .eq('owner_id', profile.id);

            if (updatePropsError) {
              console.log(`   ❌ Error al actualizar propiedades: ${updatePropsError.message}`);
            } else {
              console.log(`   ✅ Propiedades actualizadas`);
            }
          }

          // Recreate profile with correct ID
          if (newUser.user.id !== profile.id) {
            console.log(`   🔨 Recreando perfil con ID correcto...`);
            
            const profileData = {
              email: profile.email,
              full_name: profile.full_name,
              role: profile.role,
              verification_status: profile.verification_status
            };

            // Delete old profile
            const { error: deleteError } = await supabase
              .from('profiles')
              .delete()
              .eq('id', profile.id);

            if (!deleteError) {
              // Create new profile
              const { error: createProfileError } = await supabase
                .from('profiles')
                .insert({
                  id: newUser.user.id,
                  ...profileData,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });

              if (createProfileError) {
                console.log(`   ❌ Error al crear perfil: ${createProfileError.message}`);
              } else {
                console.log(`   ✅ Perfil recreado con ID correcto`);
              }
            }
          }
        }
      }
    }

    // Step 4: Test logins
    console.log('\n\n4. Probando logins de usuarios corregidos...\n');
    
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    const testClient = createClient(supabaseUrl, anonKey);

    let successCount = 0;
    let failCount = 0;

    for (const email of PROBLEMATIC_USERS) {
      try {
        const { data, error: signInError } = await testClient.auth.signInWithPassword({
          email,
          password: TEST_PASSWORD
        });

        if (signInError) {
          console.log(`   ❌ ${email}: ${signInError.message}`);
          failCount++;
        } else {
          console.log(`   ✅ ${email}: Login exitoso`);
          successCount++;
          await testClient.auth.signOut();
        }
      } catch (err) {
        console.log(`   ❌ ${email}: ${err.message}`);
        failCount++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Logins exitosos: ${successCount}`);
    console.log(`   ❌ Logins fallidos: ${failCount}`);

    console.log('\n✅ Proceso completado!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixProblematicUsersV2();

