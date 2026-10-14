import { handleXaiProxyRequest } from '../src/server/xaiProxy';

export async function POST(request: Request): Promise<Response> {
  return handleXaiProxyRequest(request, {
    XAI_API_KEY: process.env.XAI_API_KEY,
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  });
}
