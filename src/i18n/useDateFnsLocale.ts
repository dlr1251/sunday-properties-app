import { useTranslation } from 'react-i18next';
import { getDateFnsLocale, getIntlLocale, getLanguageCode } from './locale';

/** Subscribe to language changes so date/number formatting re-renders. */
export function useDateFnsLocale() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language;
  return getDateFnsLocale(language);
}

export function useIntlLocale() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language;
  return getIntlLocale(language);
}

export function useLanguageCode() {
  const { i18n } = useTranslation();
  return getLanguageCode(i18n.resolvedLanguage || i18n.language);
}