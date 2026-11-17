import { z } from 'zod';

export const sunnyLeadInputSchema = z.object({
  name: z.string().min(2).max(120).describe('Visitor name as they gave it.'),
  contact: z
    .string()
    .min(5)
    .max(180)
    .describe('Email, phone, or WhatsApp the visitor shared. Do not invent one.'),
  listing_of_interest: z
    .string()
    .max(180)
    .optional()
    .describe('Published listing slug, id, title, or URL they asked about.'),
  message: z
    .string()
    .min(4)
    .max(2000)
    .describe('Short note in their words. Facts from this chat only.'),
  language: z.enum(['es', 'en']).optional(),
});

export const sunnyHandoffInputSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  contact: z.string().min(5).max(180).optional(),
  listing_of_interest: z.string().max(180).optional(),
  summary: z
    .string()
    .min(8)
    .max(2000)
    .describe('Why a human should follow up. Facts from this chat only.'),
  language: z.enum(['es', 'en']).optional(),
});

export type SunnyLeadInput = z.infer<typeof sunnyLeadInputSchema>;
export type SunnyHandoffInput = z.infer<typeof sunnyHandoffInputSchema>;

function getServiceConfig(env: Readonly<Record<string, string | undefined>> = process.env) {
  const url = (env.VITE_SUPABASE_URL || env.SUPABASE_URL || '').trim();
  const key = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  return { url: url.replace(/\/$/, ''), key };
}

export function isSunnyLeadsConfigured(
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  const { url, key } = getServiceConfig(env);
  return Boolean(url && key);
}

async function insertLead(
  row: {
    name: string | null;
    contact: string | null;
    listing_of_interest: string | null;
    message: string;
    locale: string;
    handoff_requested: boolean;
    session_id: string | null;
  },
  env: Readonly<Record<string, string | undefined>> = process.env,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { url, key } = getServiceConfig(env);
  if (!url || !key) return { ok: false, error: 'leads_not_configured' };

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('agent_leads')
    .insert({
      name: row.name,
      contact: row.contact,
      listing_of_interest: row.listing_of_interest,
      message: row.message,
      locale: row.locale,
      handoff_requested: row.handoff_requested,
      session_id: row.session_id,
      source: 'sunny',
    })
    .select('id')
    .maybeSingle();

  if (error || !data?.id) return { ok: false, error: 'lead_insert_failed' };
  return { ok: true, id: data.id };
}

export async function recordSunnyLead(
  input: SunnyLeadInput & { locale: string; sessionId?: string },
  env: Readonly<Record<string, string | undefined>> = process.env,
) {
  return insertLead(
    {
      name: input.name.trim(),
      contact: input.contact.trim(),
      listing_of_interest: input.listing_of_interest?.trim() || null,
      message: input.message.trim(),
      locale: input.locale,
      handoff_requested: false,
      session_id: input.sessionId ?? null,
    },
    env,
  );
}

export async function recordSunnyHandoff(
  input: SunnyHandoffInput & { locale: string; sessionId?: string },
  env: Readonly<Record<string, string | undefined>> = process.env,
) {
  return insertLead(
    {
      name: input.name?.trim() || null,
      contact: input.contact?.trim() || null,
      listing_of_interest: input.listing_of_interest?.trim() || null,
      message: input.summary.trim(),
      locale: input.locale,
      handoff_requested: true,
      session_id: input.sessionId ?? null,
    },
    env,
  );
}
