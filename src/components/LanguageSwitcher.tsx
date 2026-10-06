import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

interface LanguageSwitcherProps {
  onDark?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onDark = false }) => {
  const { i18n, t } = useTranslation();
  const languageCode = (i18n.resolvedLanguage || i18n.language || 'es').split('-')[0];
  const nextLanguage = languageCode === 'es' ? 'en' : 'es';
  const nextLabel = nextLanguage.toUpperCase();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => {
        void i18n.changeLanguage(nextLanguage);
      }}
      aria-label={t('nav.switchLanguage', { language: nextLabel })}
      className={[
        'min-w-10 px-2 font-semibold tracking-wide',
        onDark
          ? 'text-white hover:text-white hover:bg-white/10'
          : 'text-foreground hover:text-foreground hover:bg-primary/10',
      ].join(' ')}
    >
      {nextLabel}
    </Button>
  );
};
