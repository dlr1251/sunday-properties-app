import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54327';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Map emails to correct roles
const roleMappings = {
  'admin@sunday.local': 'admin',
  'lawyer1@sunday.local': 'lawyer',
  'lawyer2@sunday.local': 'lawyer',
  'premium1@sunday.local': 'premium',
  'premium2@sunday.local': 'premium',
  'verified1@sunday.local': 'verified',
  'verified2@sunday.local': 'verified',
  'registered1@sunday.local': 'registered',
  'registered2@sunday.local': 'registered',
  'visitor1@sunday.local': 'visitor',
  'visitor2@sunday.local': 'visitor'
};

async function fixUserRoles() {
  console.log('🔧 Fixing user roles...');

  for (const [email, correctRole] of Object.entries(roleMappings)) {
    try {
      console.log(`Updating ${email} to role: ${correctRole}`);

      const { error } = await supabase
        .from('profiles')
        .update({
          role: correctRole,
          updated_at: new Date().toISOString()
        })
        .eq('email', email);

      if (error) {
        console.error(`❌ Error updating ${email}:`, error);
      } else {
        console.log(`✅ Updated ${email} successfully`);
      }
    } catch (err) {
      console.error(`❌ Failed to update ${email}:`, err);
    }
  }

  console.log('🎉 User roles fixed!');
}

fixUserRoles().catch(console.error);
