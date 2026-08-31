import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types/database';
import { User, Mail, Phone, MapPin, Globe, FileText, Settings, Shield, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { formatDate, formatDateTime } from '../../utils/format';

export const ProfileSettings: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error(t('profile.loadError'));
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(t('profile.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error(t('profile.toasts.profileUpdateError'));
        return;
      }

      setProfile({ ...profile, ...updates });
      toast.success(t('profile.toasts.profileUpdated'));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('profile.toasts.profileUpdateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Profile, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handlePreferenceChange = (key: string, value: any) => {
    if (!profile) return;
    setProfile({
      ...profile,
      preferences: {
        ...profile.preferences,
        [key]: value
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('profile.loading')}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">{t('profile.loadFailed')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('profile.settingsTitle')}</h1>
          <p className="text-muted-foreground mt-2">{t('profile.settingsSubtitle')}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {t(`profile.roles.${profile.role}`, { defaultValue: t('profile.roles.user') })}
        </Badge>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t('profile.tabPersonal')}
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {t('profile.tabContact')}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t('profile.tabPreferences')}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('profile.tabSecurity')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('profile.personalInfo')}
              </CardTitle>
              <CardDescription>
                {t('profile.personalInfoBasic')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">{t('profile.fullName')}</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name || ''}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder={t('profile.placeholders.fullName')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('profile.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">{t('profile.bio')}</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder={t('profile.placeholders.bio')}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">{t('profile.location')}</Label>
                <Input
                  id="location"
                  value={profile.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={t('profile.placeholders.location')}
                />
              </div>

              <Button 
                onClick={() => updateProfile(profile)} 
                disabled={saving}
                className="w-full"
              >
                {saving ? t('common.saving') : t('common.saveChanges')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                {t('profile.contactInfo')}
              </CardTitle>
              <CardDescription>
                {t('profile.contactKeepUpdated')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t('profile.phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+57 300 123 4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">{t('profile.website')}</Label>
                <Input
                  id="website"
                  type="url"
                  value={profile.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder={t('profile.placeholders.website')}
                />
              </div>

              <Button 
                onClick={() => updateProfile(profile)} 
                disabled={saving}
                className="w-full"
              >
                {saving ? t('common.saving') : t('common.saveChanges')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t('profile.preferences')}
              </CardTitle>
              <CardDescription>
                {t('profile.preferencesAppDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('profile.theme')}</Label>
                    <p className="text-sm text-muted-foreground">{t('profile.chooseTheme')}</p>
                  </div>
                  <Select
                    value={profile.preferences?.theme || 'light'}
                    onValueChange={(value) => handlePreferenceChange('theme', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t('settings.themes.light')}</SelectItem>
                      <SelectItem value="dark">{t('settings.themes.dark')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('profile.language')}</Label>
                    <p className="text-sm text-muted-foreground">{t('profile.interfaceLanguage')}</p>
                  </div>
                  <Select
                    value={profile.preferences?.language || 'es'}
                    onValueChange={(value) => handlePreferenceChange('language', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notifications')}</Label>
                    <p className="text-sm text-muted-foreground">{t('profile.receiveNotifications')}</p>
                  </div>
                  <Switch
                    checked={profile.preferences?.notifications ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('profile.emailUpdates')}</Label>
                    <p className="text-sm text-muted-foreground">{t('profile.emailUpdatesHint')}</p>
                  </div>
                  <Switch
                    checked={profile.preferences?.emailUpdates ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange('emailUpdates', checked)}
                  />
                </div>
              </div>

              <Button 
                onClick={() => updateProfile(profile)} 
                disabled={saving}
                className="w-full"
              >
                {saving ? t('common.saving') : t('profile.savePreferences')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('profile.securityPrivacy')}
              </CardTitle>
              <CardDescription>
                {t('profile.securityDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('profile.accountStatus')}</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
                    {t(`profile.accountStatuses.${profile.status}`, { defaultValue: t('profile.accountStatuses.pending') })}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('profile.lastAccess')}</Label>
                <p className="text-sm text-muted-foreground">
                  {profile.last_login_at 
                    ? formatDateTime(profile.last_login_at)
                    : t('common.never')
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t('profile.memberSince')}</Label>
                <p className="text-sm text-muted-foreground">
                  {formatDate(profile.created_at)}
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  {t('profile.changePassword')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
