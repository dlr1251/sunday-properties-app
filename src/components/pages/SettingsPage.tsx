import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Moon, Sun, Monitor, Bell, Lock, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/components/ThemeProvider';
import { supportedLanguages } from '@/i18n';

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20">
      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
        {t('settings.title')}
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        {t('common.viewMore')}
      </p>

      <div className="space-y-6">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('settings.language')}
            </CardTitle>
            <CardDescription>
              {t('settings.selectLanguage')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={i18n.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              {t('settings.theme')}
            </CardTitle>
            <CardDescription>
              {t('settings.selectLanguage')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={theme} onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <span className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    {t('settings.themes.light')}
                  </span>
                </SelectItem>
                <SelectItem value="dark">
                  <span className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    {t('settings.themes.dark')}
                  </span>
                </SelectItem>
                <SelectItem value="system">
                  <span className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    {t('settings.themes.system')}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('settings.notifications')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email notifications</Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push notifications</Label>
              <Switch id="push-notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('settings.privacy')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-visibility">Profile visibility</Label>
              <Switch id="profile-visibility" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
