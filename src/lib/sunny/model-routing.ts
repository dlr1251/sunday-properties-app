export type SunnyModelRoute = 'primary' | 'lite';

export type SunnyRoutingTurnContext = {
  latestUserText: string;
  latestUserHasAttachment: boolean;
};

const NAV_ONLY =
  /^[\s¿¡]*(?:hi|hello|hey|hola|buenas|good (?:morning|afternoon|evening)|what (?:can you|do you) do|who are you|qué (?:puedes|sabes) hacer|quién eres|cómo funciona)[\s!.,?¡¿]*$/iu;

const LISTING_SUBSTANCE =
  /\b(?:precio|price|m2|m²|metro|área|area|habitacion|bedroom|baño|bath|arriendo|rent|venta|sale|barrio|neighborhood|poblado|laureles|envigado|sabaneta|belén|belen|disponible|available|visita|visit|estrato|listing|inmueble|apartamento|casa|propiedad)\b/iu;

function textFromContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .map((part) => {
      if (part && typeof part === 'object' && 'type' in part && part.type === 'text' && 'text' in part) {
        return String(part.text ?? '');
      }
      return '';
    })
    .join('\n')
    .trim();
}

function hasAttachment(content: unknown): boolean {
  if (!Array.isArray(content)) return false;
  return content.some(
    (part) =>
      part &&
      typeof part === 'object' &&
      'type' in part &&
      (part.type === 'image' || part.type === 'file'),
  );
}

export function sunnyRoutingTurnContext(
  messages: ReadonlyArray<{ role?: string; content?: unknown }>,
): SunnyRoutingTurnContext {
  let latestUserText = '';
  let latestUserHasAttachment = false;
  for (const message of messages) {
    if (message.role !== 'user') continue;
    latestUserText = textFromContent(message.content);
    latestUserHasAttachment = hasAttachment(message.content);
  }
  return { latestUserText, latestUserHasAttachment };
}

/**
 * Greetings and "who are you" go to the lite model. Listing, price, and
 * availability questions stay on the primary model.
 */
export function classifySunnyModelRoute(ctx: SunnyRoutingTurnContext): SunnyModelRoute {
  if (ctx.latestUserHasAttachment) return 'primary';
  const latest = ctx.latestUserText.trim();
  if (!latest) return 'lite';
  if (NAV_ONLY.test(latest) && !LISTING_SUBSTANCE.test(latest)) return 'lite';
  return 'primary';
}
