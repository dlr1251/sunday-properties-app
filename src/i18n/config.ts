import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import es from './locales/es.json';
import en from './locales/en.json';
import { setDetectedLanguage, syncDocumentLang } from './locale';

export const resources = {
  es: { translation: es },
  en: { translation: en },
} as const;

export const supportedLanguages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    supportedLngs: ['es', 'en'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    defaultNS: 'translation',
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'sunday-language',
    },
  });

const applyLanguage = (lng?: string) => {
  setDetectedLanguage(lng);
  syncDocumentLang(lng);
};

i18n.on('initialized', () => {
  applyLanguage(i18n.resolvedLanguage);
});
i18n.on('languageChanged', applyLanguage);
applyLanguage(i18n.resolvedLanguage || i18n.language);

export default i18n;
