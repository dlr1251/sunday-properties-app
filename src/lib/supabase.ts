import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Configuración de Supabase (Vite embeds these at build time; set on Vercel for production)
const isDevelopment = import.meta.env.DEV;
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseUrl = (envUrl && envUrl.trim()) ? envUrl.trim() : (isDevelopment
  ? 'http://127.0.0.1:54327'
  : 'https://prtyuwdkrrqhtwolcrav.supabase.co');
const supabaseAnonKey = (envKey && envKey.trim()) ? envKey.trim() : (isDevelopment
  ? 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydHl1d2RrcnJxaHR3b2xjcmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTA1MDUsImV4cCI6MjA3NjQ2NjUwNX0.0n7zBh6TvTdHtEDn_lNE0IaPkIVK3Ujhf6hZ2yNFOGo');

// Configuración condicional para realtime
// Nota: Realtime está temporalmente deshabilitado en desarrollo
// para evitar errores de conexión WebSocket con Supabase local.
// Para habilitar realtime, configurar opciones específicas o usar
// VITE_ENABLE_REALTIME=true en .env.local
const realtimeConfig = isDevelopment ? {} : {};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, realtimeConfig);

// Re-export Database type for convenience
export type { Database } from '../types/database';
