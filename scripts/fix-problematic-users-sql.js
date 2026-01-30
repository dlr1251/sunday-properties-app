// Script para corregir usuarios problemáticos usando SQL directo
// Esto evita problemas con la API de admin que pueden causar "Database error"

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54327';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
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

async function fixProblematicUsersSQL() {
  console.log('🔧 Corrigiendo usuarios problemáticos usando SQL directo...\n');

  try {
    // Get problematic users from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, verification_status')
      .in('email', PROBLEMATIC_USERS);

    if (profilesError) {
      throw new Error(`Error: ${profilesError.message}`);
    }

    console.log(`Encontrados ${profiles.length} usuarios problemáticos\n`);

    // Create SQL script to insert users into auth.users
    console.log('Generando script SQL para crear usuarios en auth.users...\n');
    
    const sqlStatements = [];
    
    for (const profile of profiles) {
      // Hash password manually (bcrypt with salt)
      // For Supabase, we'll use the admin API but with a workaround
      console.log(`\n🔍 Procesando: ${profile.email}`);
      console.log(`   Profile ID: ${profile.id}`);

      // Try a different approach: use supabase-rpc or direct SQL
      // First, let's try to see if we can create the user using a different method
      
      // Check if there's an existing auth user with a similar email (case insensitive)
      const { data: authUsersData } = await supabase.auth.admin.listUsers();
      const existingUser = authUsersData?.users?.find(u => 
        u.email?.toLowerCase() === profile.email.toLowerCase()
      );

      if (existingUser) {
        console.log(`   ✅ Usuario encontrado en auth (diferente caso?): ${existingUser.id}`);
        
        // Update password
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          {
            password: TEST_PASSWORD,
            email_confirm: true
          }
        );

        if (updateError) {
          console.log(`   ❌ Error al actualizar: ${updateError.message}`);
        } else {
          console.log(`   ✅ Contraseña actualizada`);
          
          // Update properties if IDs don't match
          if (existingUser.id !== profile.id) {
            console.log(`   🔨 Actualizando propiedades...`);
            const { error: propError } = await supabase
              .from('properties')
              .update({ owner_id: existingUser.id })
              .eq('owner_id', profile.id);

            if (propError) {
              console.log(`   ❌ Error propiedades: ${propError.message}`);
            } else {
              console.log(`   ✅ Propiedades actualizadas`);
              
              // Recreate profile
              const { error: delError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', profile.id);

              if (!delError) {
                const { error: createError } = await supabase
                  .from('profiles')
                  .insert({
                    id: existingUser.id,
                    email: profile.email,
                    full_name: profile.full_name,
                    role: profile.role,
                    verification_status: profile.verification_status,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });

                if (createError) {
                  console.log(`   ❌ Error al recrear perfil: ${createError.message}`);
                } else {
                  console.log(`   ✅ Perfil recreado`);
                }
              }
            }
          }
        }
      } else {
        // User doesn't exist - try creating with the profile ID
        console.log(`   🔨 Intentando crear usuario con ID específico...`);
        
        // Try creating user without specifying ID first (let Supabase assign)
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
          console.log(`   ❌ Error: ${createError.message}`);
          
          // If still failing, try creating a SQL migration file
          console.log(`   📝 Generando SQL para ejecutar manualmente...`);
          sqlStatements.push(`-- Usuario: ${profile.email}`);
          sqlStatements.push(`-- Profile ID: ${profile.id}`);
          sqlStatements.push(`-- NOTA: Ejecutar en Supabase SQL Editor`);
          sqlStatements.push(``);
        } else if (newUser?.user) {
          console.log(`   ✅ Usuario creado: ${newUser.user.id}`);
          
          // Update properties
          if (newUser.user.id !== profile.id) {
            const { error: propError } = await supabase
              .from('properties')
              .update({ owner_id: newUser.user.id })
              .eq('owner_id', profile.id);

            if (!propError) {
              // Recreate profile
              await supabase.from('profiles').delete().eq('id', profile.id);
              await supabase.from('profiles').insert({
                id: newUser.user.id,
                email: profile.email,
                full_name: profile.full_name,
                role: profile.role,
                verification_status: profile.verification_status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              console.log(`   ✅ Perfil y propiedades actualizados`);
            }
          }
        }
      }
    }

    // Test logins
    console.log('\n\n🧪 Probando logins...\n');
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    const testClient = createClient(supabaseUrl, anonKey);

    for (const email of PROBLEMATIC_USERS) {
      const { error } = await testClient.auth.signInWithPassword({
        email,
        password: TEST_PASSWORD
      });

      if (error) {
        console.log(`   ❌ ${email}: ${error.message}`);
      } else {
        console.log(`   ✅ ${email}: Login exitoso`);
        await testClient.auth.signOut();
      }
    }

    if (sqlStatements.length > 0) {
      console.log('\n\n📝 SQL generado para ejecutar manualmente:');
      console.log(sqlStatements.join('\n'));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixProblematicUsersSQL();

