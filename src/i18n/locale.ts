import { es, enUS } from 'date-fns/locale';
import type { Locale } from 'date-fns';

let detectedLanguage = 'es';

export function setDetectedLanguage(lng: string | undefined): void {
  if (lng) detectedLanguage = lng;
}

export function getLanguageCode(lng?: string): 'es' | 'en' {
  const value = lng ?? detectedLanguage;
  return value.toLowerCase().startsWith('en') ? 'en' : 'es';
}

export function isEnglish(lng?: string): boolean {
  return getLanguageCode(lng) === 'en';
}

/** Intl locale for dates, numbers, and COP currency grouping. */
export function getIntlLocale(lng?: string): 'en-US' | 'es-CO' {
  return isEnglish(lng) ? 'en-US' : 'es-CO';
}

export function getDateFnsLocale(lng?: string): Locale {
  return isEnglish(lng) ? enUS : es;
}

export function syncDocumentLang(lng?: string): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = getLanguageCode(lng);
}
