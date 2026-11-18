const ON = new Set(['1', 'true', 'on', 'yes']);

type Env = Readonly<Record<string, string | undefined>>;

function envOf(env?: Env): Env {
  return env ?? (typeof process !== 'undefined' ? process.env : {});
}

function truthy(value: string | undefined): boolean {
  return ON.has((value ?? '').trim().toLowerCase());
}

/** Placeholder name; override with SUNNY_AGENT_NAME. */
export function sunnyAgentName(env?: Env): string {
  const e = envOf(env);
  return e.SUNNY_AGENT_NAME?.trim() || e.VITE_SUNNY_AGENT_NAME?.trim() || 'Sunny';
}

/** Server-side chat runtime. Off unless explicitly enabled. */
export function isSunnyChatEnabled(env?: Env): boolean {
  const e = envOf(env);
  return truthy(e.SUNNY_CHAT_ENABLED);
}

export function sunnyPrimaryModelId(env?: Env): string {
  return envOf(env).SUNNY_MODEL?.trim() || 'anthropic/claude-haiku-5.5';
}

export function sunnyLiteModelId(env?: Env): string {
  return envOf(env).SUNNY_ROUTING_LITE_MODEL?.trim() || 'google/gemini-2.5-flash-lite';
}

export function sunnySessionSpendCapCents(env?: Env): number | null {
  const raw = envOf(env).SUNNY_SESSION_SPEND_CAP_CENTS?.trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function sunnyMaxOutputTokens(env?: Env): number | null {
  const raw = Number(envOf(env).SUNNY_MAX_OUTPUT_TOKENS?.trim() ?? '');
  if (!Number.isFinite(raw) || raw < 64) return null;
  return Math.floor(raw);
}

export function sunnyMaxSteps(env?: Env): number {
  const raw = Number(envOf(env).SUNNY_MAX_STEPS?.trim() ?? '5');
  if (!Number.isFinite(raw) || raw < 1) return 3;
  return Math.min(8, Math.floor(raw));
}

export function sunnyAnonFreeMessages(env?: Env): number {
  const raw = Number(envOf(env).SUNNY_ANON_FREE_MESSAGES?.trim() ?? '8');
  if (!Number.isFinite(raw) || raw < 0) return 8;
  return Math.floor(raw);
}

export function sunnyIpMinuteLimit(env?: Env): number {
  const raw = Number(envOf(env).SUNNY_ANON_IP_MINUTE_LIMIT?.trim() ?? '4');
  if (!Number.isFinite(raw) || raw < 1) return 4;
  return Math.floor(raw);
}

export function sunnyIpHourLimit(env?: Env): number {
  const raw = Number(envOf(env).SUNNY_ANON_IP_HOUR_LIMIT?.trim() ?? '20');
  if (!Number.isFinite(raw) || raw < 1) return 20;
  return Math.floor(raw);
}

export const SUNNY_TICKET_HEADER = 'x-sunny-anon-ticket';
export const SUNNY_LOCALE_HEADER = 'x-sunny-locale';
export const SUNNY_ANON_COOKIE = 'sp-sunny-anon';
