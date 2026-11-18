import { describe, expect, it } from 'vitest';

import {
  PUBLIC_SUPABASE_URL,
  publicSupabaseErrorFields,
  resolvePublicSupabaseConfig,
} from './publicSupabase';

describe('resolvePublicSupabaseConfig', () => {
  it('prefers VITE_* names over unprefixed SUPABASE_* names', () => {
    const resolved = resolvePublicSupabaseConfig({
      VITE_SUPABASE_URL: 'https://vite.example.supabase.co/',
      SUPABASE_URL: 'https://unprefixed.example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'vite-anon',
      SUPABASE_ANON_KEY: 'unprefixed-anon',
    });
    expect(resolved.url).toBe('https://vite.example.supabase.co');
    expect(resolved.anonKey).toBe('vite-anon');
    expect(resolved.urlSource).toBe('vite');
    expect(resolved.anonKeySource).toBe('vite');
  });

  it('falls back to unprefixed names, then the public anon defaults', () => {
    const fromUnprefixed = resolvePublicSupabaseConfig(
      {
        SUPABASE_URL: 'https://unprefixed.example.supabase.co',
        SUPABASE_ANON_KEY: 'unprefixed-anon',
      },
      { includeProcess: false },
    );
    expect(fromUnprefixed.url).toBe('https://unprefixed.example.supabase.co');
    expect(fromUnprefixed.anonKey).toBe('unprefixed-anon');
    expect(fromUnprefixed.urlSource).toBe('supabase');

    const fromEmpty = resolvePublicSupabaseConfig({}, { includeProcess: false });
    expect(fromEmpty.url).toBe(PUBLIC_SUPABASE_URL);
    expect(fromEmpty.anonKey.length).toBeGreaterThan(20);
    expect(fromEmpty.urlSource).toBe('fallback');
    expect(fromEmpty.anonKeySource).toBe('fallback');
  });
});

describe('publicSupabaseErrorFields', () => {
  it('keeps PostgREST code/message and redacts JWT-like strings', () => {
    const fields = publicSupabaseErrorFields({
      code: 'PGRST204',
      message: 'Could not find the column',
      details: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig',
      hint: 'Use a granted column',
    });
    expect(fields.code).toBe('PGRST204');
    expect(fields.message).toBe('Could not find the column');
    expect(fields.details).toBe('[redacted]');
    expect(JSON.stringify(fields)).not.toMatch(/eyJ/);
  });
});
