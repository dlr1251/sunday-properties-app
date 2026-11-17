export type SunnyLocale = 'es' | 'en';

const ES_HINT =
  /\b(?:hola|buenas|precio|arriendo|venta|barrio|apartamento|baño|habitaciones|gracias|quisiera|necesito|cuánto|cuanto)\b|[áéíóúñ¿¡]/i;

export function detectMessageLocale(text: string): SunnyLocale {
  const trimmed = text.trim();
  if (!trimmed) return 'es';
  return ES_HINT.test(trimmed) ? 'es' : 'en';
}

export function localeFromAttribute(value: unknown): SunnyLocale | null {
  if (value === 'es' || value === 'en') return value;
  return null;
}

export function resolveSunnyLocale(options: {
  header?: string | null;
  attribute?: unknown;
  text?: string | null;
}): SunnyLocale {
  if (options.header === 'es' || options.header === 'en') return options.header;
  const fromAttr = localeFromAttribute(options.attribute);
  if (fromAttr) return fromAttr;
  if (options.text) return detectMessageLocale(options.text);
  return 'es';
}
