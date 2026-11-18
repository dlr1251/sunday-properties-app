import { z } from 'zod';

import { logPublicSupabaseError } from '../publicSupabase';

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

export const sunnyLeadRowSchema = z
  .object({
    name: z.string().min(2).max(120).nullable().optional(),
    contact: z.string().min(5).max(180).nullable().optional(),
    listing_of_interest: z.string().max(180).nullable().optional(),
    message: z.string().min(4).max(2000),
    locale: z.enum(['es', 'en']),
    handoff_requested: z.boolean(),
    session_id: z.string().max(200).nullable().optional(),
    source: z.literal('sunny').default('sunny'),
  })
  .refine(
    (row) =>
      row.handoff_requested ||
      (typeof row.name === 'string' && row.name.trim().length >= 2 &&
        typeof row.contact === 'string' && row.contact.trim().length >= 5),
    { message: 'name_and_contact_required' },
  );

export type SunnyLeadInput = z.infer<typeof sunnyLeadInputSchema>;
export type SunnyHandoffInput = z.infer<typeof sunnyHandoffInputSchema>;
export type SunnyLeadRow = z.infer<typeof sunnyLeadRowSchema>;

const PINNED_VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const PINNED_SUPABASE_URL = process.env.SUPABASE_URL;
const PINNED_SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function firstNonEmpty(values: Array<string | undefined>): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function pinnedServiceEnv(): Record<string, string | undefined> {
  return {
    VITE_SUPABASE_URL: PINNED_VITE_SUPABASE_URL,
    SUPABASE_URL: PINNED_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: PINNED_SUPABASE_SERVICE_ROLE_KEY,
  };
}

function getServiceConfig(
  env: Readonly<Record<string, string | undefined>> = process.env,
  options: { includePinned?: boolean } = {},
) {
  const includePinned = options.includePinned ?? env === process.env;
  const pinned = includePinned ? pinnedServiceEnv() : {};
  const url = firstNonEmpty([
    env.VITE_SUPABASE_URL,
    pinned.VITE_SUPABASE_URL,
    env.SUPABASE_URL,
    pinned.SUPABASE_URL,
  ]).replace(/\/+$/, '');
  const key = firstNonEmpty([env.SUPABASE_SERVICE_ROLE_KEY, pinned.SUPABASE_SERVICE_ROLE_KEY]);
  return { url, key };
}

export function isSunnyLeadsConfigured(
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  const { url, key } = getServiceConfig(env);
  return Boolean(url && key);
}

export function sunnyLeadRowFromInput(
  input: SunnyLeadInput & { locale: 'es' | 'en'; sessionId?: string },
): SunnyLeadRow {
  return {
    name: input.name.trim(),
    contact: input.contact.trim(),
    listing_of_interest: input.listing_of_interest?.trim() || null,
    message: input.message.trim(),
    locale: input.locale,
    handoff_requested: false,
    session_id: input.sessionId ?? null,
    source: 'sunny',
  };
}

export function sunnyHandoffRowFromInput(
  input: SunnyHandoffInput & { locale: 'es' | 'en'; sessionId?: string },
): SunnyLeadRow {
  return {
    name: input.name?.trim() || null,
    contact: input.contact?.trim() || null,
    listing_of_interest: input.listing_of_interest?.trim() || null,
    message: input.summary.trim(),
    locale: input.locale,
    handoff_requested: true,
    session_id: input.sessionId ?? null,
    source: 'sunny',
  };
}

export function sunnyLeadExecuteResult(
  scope: string,
  result: { ok: true; id?: string } | { ok: false; error: string },
  extra: { handoff?: boolean } = {},
): { ok: true; recorded: true; handoff?: true } | { ok: false; recorded: false } {
  if (result.ok === false) {
    logPublicSupabaseError(scope, new Error(result.error), { error: result.error });
    return { ok: false, recorded: false };
  }
  if (extra.handoff) return { ok: true, recorded: true, handoff: true };
  return { ok: true, recorded: true };
}

export async function insertSunnyLeadRow(
  row: SunnyLeadRow,
  env: Readonly<Record<string, string | undefined>> = process.env,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const { setDefaultResultOrder } = await import('node:dns');
    setDefaultResultOrder('ipv4first');
  } catch {
    // Edge / browsers have no dns module; Hono Node does.
  }

  const { url, key } = getServiceConfig(env);
  if (!url || !key) return { ok: false, error: 'leads_not_configured' };

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('agent_leads')
    .insert({
      name: row.name ?? null,
      contact: row.contact ?? null,
      listing_of_interest: row.listing_of_interest ?? null,
      message: row.message,
      locale: row.locale,
      handoff_requested: row.handoff_requested,
      session_id: row.session_id ?? null,
      source: 'sunny',
    })
    .select('id')
    .maybeSingle();

  if (error || !data?.id) {
    const rawCode =
      error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
        ? error.code.replace(/[^A-Za-z0-9_]/g, '').slice(0, 32)
        : '';
    const code = rawCode || 'lead_insert_failed';
    logPublicSupabaseError('sunny-leads', new Error(code), {
      error: code,
      handoff: row.handoff_requested,
    });
    return { ok: false, error: code };
  }
  return { ok: true, id: data.id };
}

export async function recordSunnyLead(
  input: SunnyLeadInput & { locale: 'es' | 'en'; sessionId?: string },
  env: Readonly<Record<string, string | undefined>> = process.env,
) {
  return insertSunnyLeadRow(sunnyLeadRowFromInput(input), env);
}

export async function recordSunnyHandoff(
  input: SunnyHandoffInput & { locale: 'es' | 'en'; sessionId?: string },
  env: Readonly<Record<string, string | undefined>> = process.env,
) {
  return insertSunnyLeadRow(sunnyHandoffRowFromInput(input), env);
}
