import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Upload,
  DollarSign,
  Bell,
  Shield,
  Mail,
  Save,
  RefreshCw,
  Download,
  RotateCcw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { usePlatformSettings } from '../../hooks/usePlatformSettings';
import { toast } from 'sonner';
import { formatDate, formatDateTime } from '../../utils/format';

interface PlatformConfigPanelProps {
  onSettingsChanged?: () => void;
}

export function PlatformConfigPanel({
  onSettingsChanged }: PlatformConfigPanelProps) {
    const { t } = useTranslation();
  const {
    settings,
    loading,
    saving,
    error,
    updateMultipleSettings,
    getSettingsByCategory,
    exportSettings,
    resetToDefaults,
    parseSettingValue,
    formatSettingValue
  } = usePlatformSettings();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Initialize form data from settings
    const initialData: Record<string, any> = {};
    settings.forEach(setting => {
      initialData[setting.setting_key] = setting.setting_value;
    });
    setFormData(initialData);
    setHasChanges(false);
  }, [settings]);

  const handleInputChange = (key: string, value: any, type: string) => {
    const parsedValue = parseSettingValue(value, type);
    setFormData(prev => ({ ...prev, [key]: parsedValue }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const result = await updateMultipleSettings(formData);
    if (result.success) {
      setHasChanges(false);
      onSettingsChanged?.();
    }
  };

  const handleReset = () => {
    const initialData: Record<string, any> = {};
    settings.forEach(setting => {
      initialData[setting.setting_key] = setting.setting_value;
    });
    setFormData(initialData);
    setHasChanges(false);
    toast.info(t('admin.changesDiscarded'));
  };

  const renderSettingInput = (setting: any) => {
    const value = formData[setting.setting_key];

    switch (setting.setting_type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={setting.setting_key}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleInputChange(setting.setting_key, checked, setting.setting_type)}
            />
            <Label htmlFor={setting.setting_key} className="text-sm">
              {value ? 'Activado' : 'Desactivado'}
            </Label>
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value, setting.setting_type)}
            placeholder={`Valor numérico`}
          />
        );

      case 'json':
        return (
          <Textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value, setting.setting_type)}
            placeholder="JSON válido"
            rows={4}
          />
        );

      default: // string
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value, setting.setting_type)}
            placeholder="Valor de texto"
          />
        );
    }
  };

  const renderSettingsCategory = (category: string, title: string, icon: React.ReactNode, categorySettings: any[]) => (
    <TabsContent key={category} value={category} className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="grid gap-6">
        {categorySettings.map((setting) => (
          <Card key={setting.setting_key}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">{setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                  {setting.description && (
                    <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1 max-w-md">
                    {renderSettingInput(setting)}
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    {setting.is_public && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Público
                      </span>
                    )}
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded capitalize">
                      {setting.setting_type}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  {t('admin.lastUpdate')}: {formatDateTime(setting.updated_at)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const generalSettings = getSettingsByCategory('general');
  const uploadSettings = getSettingsByCategory('uploads');
  const offerSettings = getSettingsByCategory('offers');
  const notificationSettings = getSettingsByCategory('notifications');
  const authSettings = getSettingsByCategory('auth');
  const emailSettings = getSettingsByCategory('email');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('admin.platformConfigTitle')}</h2>
          <p className="text-muted-foreground">
            {t('admin.platformConfigDescription')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSettings}>
            <Download className="h-4 w-4 mr-2" />
            {t('common.export')}
          </Button>
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('admin.restoreDefaults')}
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      {hasChanges && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {t('admin.unsavedChanges')}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset}>
                  {t('admin.discardChanges')}
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {t('common.saving')}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {t('common.saveChanges')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t('admin.tabGeneral')}
          </TabsTrigger>
          <TabsTrigger value="uploads" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {t('admin.tabUploads')}
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            {t('admin.tabOffers')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {t('admin.tabNotifications')}
          </TabsTrigger>
          <TabsTrigger value="auth" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('admin.tabAuth')}
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
        </TabsList>

{renderSettingsCategory('general', t('admin.configCategoryGeneral'), <Settings className="h-5 w-5" />, generalSettings)}
{renderSettingsCategory('uploads', t('admin.configCategoryUploads'), <Upload className="h-5 w-5" />, uploadSettings)}
{renderSettingsCategory('offers', t('admin.configCategoryOffers'), <DollarSign className="h-5 w-5" />, offerSettings)}
{renderSettingsCategory('notifications', t('admin.configCategoryNotifications'), <Bell className="h-5 w-5" />, notificationSettings)}
{renderSettingsCategory('auth', t('admin.configCategoryAuth'), <Shield className="h-5 w-5" />, authSettings)}
{renderSettingsCategory('email', t('admin.configCategoryEmail'), <Mail className="h-5 w-5" />, emailSettings)}
      </Tabs>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.configStats')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('admin.totalSettings')}</p>
              <p className="text-2xl font-bold">{settings.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('admin.publicSettings')}</p>
              <p className="text-2xl font-bold">{settings.filter(s => s.is_public).length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('admin.categories')}</p>
              <p className="text-2xl font-bold">{new Set(settings.map(s => s.category)).size}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('admin.lastUpdate')}</p>
              <p className="text-sm font-medium">
                {settings.length > 0 ? formatDate(new Date(Math.max(...settings.map(s => new Date(s.updated_at).getTime())))) : t('common.never')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PlatformConfigPanel;

