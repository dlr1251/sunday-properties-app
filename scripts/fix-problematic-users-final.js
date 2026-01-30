// Script final para crear usuarios nuevos después de limpiar los problemáticos
// Este script crea usuarios limpios en auth.users y luego recrea los perfiles

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

// Datos de los usuarios a recrear
const usersToRecreate = [
  {
    email: 'user1@sunday.local',
    full_name: 'Usuario Uno',
    role: 'user',
    verification_status: 'verified'
  },
  {
    email: 'user2@sunday.local',
    full_name: 'Usuario Dos',
    role: 'user',
    verification_status: 'verified'
  },
  {
    email: 'user9@sunday.local',
    full_name: 'Usuario Nueve',
    role: 'user',
    verification_status: 'verified'
  },
  {
    email: 'user10@sunday.local',
    full_name: 'Usuario Diez',
    role: 'user',
    verification_status: 'verified'
  }
];

async function recreateUsers() {
  console.log('🔧 Recreando usuarios problemáticos...\n');

  try {
    // Step 1: Find a temporary user to get properties from
    console.log('1. Buscando usuario temporal con propiedades reasignadas...\n');
    
    const { data: tempUser } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('role', 'user')
      .not('email', 'in', `(${usersToRecreate.map(u => `'${u.email}'`).join(',')})`)
      .limit(1)
      .single();

    if (!tempUser) {
      console.log('   ⚠️  No se encontró usuario temporal');
    } else {
      console.log(`   ✅ Usuario temporal: ${tempUser.email} (${tempUser.id})`);
    }

    // Step 2: Create users in auth.users
    console.log('\n2. Creando usuarios en auth.users...\n');
    
    const createdUsers = [];

    for (const userData of usersToRecreate) {
      try {
        console.log(`   🔨 Creando: ${userData.email}`);
        
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: TEST_PASSWORD,
          email_confirm: true,
          user_metadata: {
            full_name: userData.full_name,
            role: userData.role
          }
        });

        if (createError) {
          console.log(`   ❌ Error: ${createError.message}`);
          
          // Check if user already exists
          if (createError.message.includes('already') || createError.message.includes('registered')) {
            console.log(`   ℹ️  Usuario ya existe, obteniendo ID...`);
            
            const { data: authUsers } = await supabase.auth.admin.listUsers();
            const existingUser = authUsers?.users?.find(u => 
              u.email?.toLowerCase() === userData.email.toLowerCase()
            );
            
            if (existingUser) {
              console.log(`   ✅ Usuario encontrado: ${existingUser.id}`);
              createdUsers.push({
                ...userData,
                authId: existingUser.id
              });
              
              // Update password
              await supabase.auth.admin.updateUserById(existingUser.id, {
                password: TEST_PASSWORD,
                email_confirm: true
              });
            }
          }
        } else if (newUser?.user) {
          console.log(`   ✅ Usuario creado: ${newUser.user.id}`);
          createdUsers.push({
            ...userData,
            authId: newUser.user.id
          });
        }
      } catch (err) {
        console.log(`   ❌ Excepción: ${err.message}`);
      }
    }

    // Step 3: Create profiles
    console.log('\n3. Creando perfiles...\n');
    
    for (const user of createdUsers) {
      try {
        console.log(`   🔨 Creando perfil para: ${user.email}`);
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.authId,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            verification_status: user.verification_status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          if (profileError.message.includes('duplicate') || profileError.message.includes('unique')) {
            console.log(`   ℹ️  Perfil ya existe, actualizando...`);
            
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                verification_status: user.verification_status,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.authId);

            if (updateError) {
              console.log(`   ❌ Error al actualizar: ${updateError.message}`);
            } else {
              console.log(`   ✅ Perfil actualizado`);
            }
          } else {
            console.log(`   ❌ Error: ${profileError.message}`);
          }
        } else {
          console.log(`   ✅ Perfil creado`);
        }
      } catch (err) {
        console.log(`   ❌ Excepción: ${err.message}`);
      }
    }

    // Step 4: Reassign properties if temp user exists
    if (tempUser && createdUsers.length > 0) {
      console.log('\n4. Reasignando propiedades a usuarios nuevos...\n');
      
      // Get properties owned by temp user that should belong to our users
      const { data: tempProperties } = await supabase
        .from('properties')
        .select('id, title, owner_id')
        .eq('owner_id', tempUser.id);

      if (tempProperties && tempProperties.length > 0) {
        console.log(`   Encontradas ${tempProperties.length} propiedades para reasignar`);
        
        // Distribute properties evenly among recreated users
        for (let i = 0; i < tempProperties.length; i++) {
          const property = tempProperties[i];
          const targetUser = createdUsers[i % createdUsers.length];
          
          const { error: updateError } = await supabase
            .from('properties')
            .update({ owner_id: targetUser.authId })
            .eq('id', property.id);

          if (updateError) {
            console.log(`   ❌ Error reasignando propiedad ${property.id}: ${updateError.message}`);
          } else {
            console.log(`   ✅ Propiedad "${property.title}" → ${targetUser.email}`);
          }
        }
      }
    }

    // Step 5: Test logins
    console.log('\n5. Probando logins...\n');
    
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    const testClient = createClient(supabaseUrl, anonKey);

    let successCount = 0;
    let failCount = 0;

    for (const user of createdUsers) {
      try {
        const { error } = await testClient.auth.signInWithPassword({
          email: user.email,
          password: TEST_PASSWORD
        });

        if (error) {
          console.log(`   ❌ ${user.email}: ${error.message}`);
          failCount++;
        } else {
          console.log(`   ✅ ${user.email}: Login exitoso`);
          successCount++;
          await testClient.auth.signOut();
        }
      } catch (err) {
        console.log(`   ❌ ${user.email}: ${err.message}`);
        failCount++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Logins exitosos: ${successCount}`);
    console.log(`   ❌ Logins fallidos: ${failCount}`);
    console.log(`\n🔑 Contraseña: ${TEST_PASSWORD}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

recreateUsers();

