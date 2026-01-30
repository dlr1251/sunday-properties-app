import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { supportedLanguages } from '../i18n';

export const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const currentLanguage = supportedLanguages.find(
    (lang) => lang.code === i18n.language
  ) || supportedLanguages[0];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {supportedLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={[
              'flex items-center gap-2 cursor-pointer',
              i18n.language === lang.code ? 'bg-accent' : '',
            ].join(' ')}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
