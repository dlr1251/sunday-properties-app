// Estrategia alternativa: Asignar propiedades a usuarios existentes que funcionan
// en lugar de crear usuarios nuevos que están fallando

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

const PROBLEMATIC_USERS = ['user1@sunday.local', 'user2@sunday.local', 'user9@sunday.local', 'user10@sunday.local'];

async function reassignPropertiesToWorkingUsers() {
  console.log('🔧 Reasignando propiedades de usuarios problemáticos a usuarios que funcionan...\n');

  try {
    // Step 1: Get problematic users and their properties
    console.log('1. Obteniendo usuarios problemáticos y sus propiedades...\n');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .in('email', PROBLEMATIC_USERS);

    if (profilesError) {
      throw new Error(`Error: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      console.log('   ℹ️  No se encontraron usuarios problemáticos en profiles.');
      console.log('   ✅ Puede que ya hayan sido eliminados.');
      return;
    }

    // Step 2: Get working users (users that can log in)
    console.log('\n2. Buscando usuarios que funcionan correctamente...\n');
    
    const { data: workingProfiles, error: workingError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('role', 'user')
      .not('email', 'in', `(${PROBLEMATIC_USERS.map(e => `'${e}'`).join(',')})`)
      .limit(10);

    if (workingError) {
      throw new Error(`Error: ${workingError.message}`);
    }

    if (!workingProfiles || workingProfiles.length === 0) {
      console.log('   ❌ No se encontraron usuarios que funcionen para reasignar propiedades.');
      return;
    }

    console.log(`   ✅ Encontrados ${workingProfiles.length} usuarios que funcionan`);

    // Step 3: Verify working users exist in auth.users
    const { data: authUsersData } = await supabase.auth.admin.listUsers();
    const authUsers = authUsersData?.users || [];
    
    const verifiedWorkingUsers = workingProfiles.filter(profile => 
      authUsers.some(auth => auth.id === profile.id)
    );

    console.log(`   ✅ ${verifiedWorkingUsers.length} usuarios verificados en auth.users\n`);

    if (verifiedWorkingUsers.length === 0) {
      console.log('   ❌ No hay usuarios verificados disponibles.');
      return;
    }

    // Step 4: Reassign properties
    console.log('3. Reasignando propiedades...\n');
    
    let totalReassigned = 0;

    for (let i = 0; i < profiles.length; i++) {
      const problematicProfile = profiles[i];
      const targetUser = verifiedWorkingUsers[i % verifiedWorkingUsers.length];
      
      console.log(`   🔄 ${problematicProfile.email} → ${targetUser.email}`);

      // Get properties
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id, title')
        .eq('owner_id', problematicProfile.id);

      if (propError) {
        console.log(`      ❌ Error al obtener propiedades: ${propError.message}`);
        continue;
      }

      if (!properties || properties.length === 0) {
        console.log(`      ℹ️  No tiene propiedades`);
        continue;
      }

      console.log(`      📦 ${properties.length} propiedades encontradas`);

      // Reassign properties
      const { error: updateError } = await supabase
        .from('properties')
        .update({ 
          owner_id: targetUser.id,
          updated_at: new Date().toISOString()
        })
        .eq('owner_id', problematicProfile.id);

      if (updateError) {
        console.log(`      ❌ Error al reasignar: ${updateError.message}`);
      } else {
        console.log(`      ✅ Propiedades reasignadas exitosamente`);
        totalReassigned += properties.length;
        
        // List properties
        properties.forEach(prop => {
          console.log(`         - ${prop.title}`);
        });
      }
    }

    // Step 5: Delete problematic profiles
    console.log('\n4. Eliminando perfiles problemáticos...\n');
    
    for (const profile of profiles) {
      // Check if profile still has properties
      const { data: remainingProps } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', profile.id)
        .limit(1);

      if (remainingProps && remainingProps.length > 0) {
        console.log(`   ⚠️  ${profile.email} aún tiene propiedades, saltando eliminación`);
        continue;
      }

      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id);

      if (deleteError) {
        console.log(`   ❌ Error al eliminar ${profile.email}: ${deleteError.message}`);
      } else {
        console.log(`   ✅ Perfil eliminado: ${profile.email}`);
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Propiedades reasignadas: ${totalReassigned}`);
    console.log(`   ✅ Usuarios objetivo: ${verifiedWorkingUsers.map(u => u.email).join(', ')}`);
    console.log(`\n💡 Los usuarios problemáticos han sido eliminados y sus propiedades`);
    console.log(`   han sido reasignadas a usuarios que funcionan correctamente.`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

reassignPropertiesToWorkingUsers();

