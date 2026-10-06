import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Vite embeds these at build time. Set VITE_SUPABASE_* in Vercel for production.
const isDevelopment = import.meta.env.DEV;
const envUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

const supabaseUrl = envUrl || (isDevelopment ? 'http://127.0.0.1:54327' : 'https://prtyuwdkrrqhtwolcrav.supabase.co');
const supabaseAnonKey = envKey || (isDevelopment ? 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' : 'MISSING_ANON_KEY');

if (!isDevelopment && !envKey) {
  console.error(
    '[Supabase] VITE_SUPABASE_ANON_KEY is missing in production. ' +
    'Add it in Vercel → Project → Settings → Environment Variables, then redeploy. Supabase requests will return 401 until then.'
  );
}

// Configuración condicional para realtime
// Nota: Realtime está temporalmente deshabilitado en desarrollo
// para evitar errores de conexión WebSocket con Supabase local.
// Para habilitar realtime, configurar opciones específicas o usar
// VITE_ENABLE_REALTIME=true en .env.local
const realtimeConfig = isDevelopment ? {} : {};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, realtimeConfig);

// Re-export Database type for convenience
export type { Database } from '../types/database';
