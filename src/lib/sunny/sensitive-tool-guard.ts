export type SensitiveToolBlockReason = 'injection_pattern' | 'untrusted_only';

export type SensitiveToolGuardResult =
  | { ok: true }
  | { ok: false; reason: SensitiveToolBlockReason };

const INSTRUCTION_PATTERNS: readonly RegExp[] = [
  /\b(?:ignore|disregard|forget|olvida|ignora|omite)\b.{0,72}\b(?:all\s+)?(?:previous|prior|above|anterior|previas?)\b.{0,48}\b(?:instructions?|prompt|rules?|reglas?)\b/i,
  /\b(?:you are now|ahora eres|act as|actúa como|pretend to be)\b/i,
  /\b(?:reveal|show|print|dump|exp[oó]n|muestra)\b.{0,36}\b(?:system prompt|hidden instructions?|instrucciones ocultas)\b/i,
  /\b(?:call|invoke|run|execute|llama|ejecuta)\b.{0,24}\b(?:record_sunny_lead|request_human_handoff|search_listings)\b/i,
  /\b(?:DAN|jailbreak|developer mode|modo desarrollador)\b/i,
];

const DIRECTIVE_NEEDLES = [
  'respond only with',
  'responde solo con',
  'must reply with',
  'email the attacker',
] as const;

export function containsInstructionLikeInjection(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return INSTRUCTION_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function neutralizeInstructionLikeText(text: string): string {
  if (!text.trim()) return '';
  return text
    .split('\n')
    .map((line) =>
      INSTRUCTION_PATTERNS.some((pattern) => pattern.test(line))
        ? '[instruction removed]'
        : line,
    )
    .join('\n')
    .trim();
}

function userTextsFromMessages(
  messages: ReadonlyArray<{ role?: string; content?: unknown }>,
): string[] {
  const texts: string[] = [];
  for (const message of messages) {
    if (message.role !== 'user') continue;
    const content = message.content;
    if (typeof content === 'string') texts.push(content);
    else if (Array.isArray(content)) {
      for (const part of content) {
        if (part && typeof part === 'object' && 'text' in part) {
          texts.push(String(part.text ?? ''));
        }
      }
    }
  }
  return texts;
}

export function guardSensitiveToolFields(
  fields: Record<string, string | undefined | null>,
  messages: ReadonlyArray<{ role?: string; content?: unknown }>,
): SensitiveToolGuardResult {
  const combined = Object.values(fields)
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean)
    .join('\n');
  if (!combined) return { ok: true };
  if (containsInstructionLikeInjection(combined)) {
    return { ok: false, reason: 'injection_pattern' };
  }
  const userBlob = userTextsFromMessages(messages).join('\n').toLowerCase();
  const payload = combined.toLowerCase();
  for (const needle of DIRECTIVE_NEEDLES) {
    if (payload.includes(needle) && !userBlob.includes(needle)) {
      return { ok: false, reason: 'untrusted_only' };
    }
  }
  return { ok: true };
}

export function sensitiveToolBlockedResponse(reason: SensitiveToolBlockReason) {
  return { ok: false, recorded: false, reason };
}

/**
 * Drop any invented COP amounts that did not come from tool output or the
 * visitor's own message. Used by evals; the live agent is instructed not to
 * invent prices, and search_listings is the only price source.
 */
export function extractCopAmounts(text: string): number[] {
  const amounts: number[] = [];
  const re =
    /(?:\$\s*)?(\d{1,3}(?:[.\s]\d{3})+|\d{6,})(?:\s*(?:COP|pesos))?/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    const n = Number(String(match[1]).replace(/[.\s]/g, ''));
    if (Number.isFinite(n) && n >= 100000) amounts.push(n);
  }
  return amounts;
}

export function inventedPriceInReply(
  reply: string,
  allowedAmounts: readonly number[],
): boolean {
  const found = extractCopAmounts(reply);
  if (found.length === 0) return false;
  const allowed = new Set(allowedAmounts);
  return found.some((amount) => !allowed.has(amount));
}
