import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  category: 'general' | 'uploads' | 'offers' | 'notifications' | 'auth' | 'email';
  is_public: boolean;
  updated_by?: string;
  updated_at: string;
  created_at: string;
}

interface SettingFormData {
  [key: string]: any;
}

export const usePlatformSettings = () => {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      setError(null);

      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('setting_key', { ascending: true });

      if (error) throw error;

      setSettings(data || []);
    } catch (err: any) {
      console.error('Error fetching platform settings:', err);
      setError(err.message || 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (settingKey: string, value: any) => {
    try {
      const { error } = await supabase
        .from('platform_settings')
        .update({
          setting_value: value,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', settingKey);

      if (error) throw error;

      // Update local state
      setSettings(prev => prev.map(setting =>
        setting.setting_key === settingKey
          ? { ...setting, setting_value: value, updated_at: new Date().toISOString() }
          : setting
      ));

      return { success: true };
    } catch (error: any) {
      console.error('Error updating setting:', error);
      return { success: false, error: error.message };
    }
  };

  const updateMultipleSettings = async (updates: { [key: string]: any }) => {
    setSaving(true);
    try {
      const currentUser = (await supabase.auth.getUser()).data.user?.id;

      // Update each setting
      for (const [key, value] of Object.entries(updates)) {
        const { error } = await supabase
          .from('platform_settings')
          .update({
            setting_value: value,
            updated_by: currentUser,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', key);

        if (error) throw error;
      }

      // Refresh settings
      await fetchSettings();

      toast.success('Configuración actualizada exitosamente');
      return { success: true };
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast.error('Error al actualizar configuración');
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  const getSettingValue = (key: string, defaultValue?: any) => {
    const setting = settings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter(s => s.category === category);
  };

  const exportSettings = () => {
    const csvData = settings.map(s => ({
      'Clave': s.setting_key,
      'Valor': typeof s.setting_value === 'object' ? JSON.stringify(s.setting_value) : s.setting_value,
      'Tipo': s.setting_type,
      'Descripción': s.description,
      'Categoría': s.category,
      'Público': s.is_public ? 'Sí' : 'No',
      'Última Actualización': new Date(s.updated_at).toLocaleDateString('es-CO')
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `configuracion_plataforma_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Archivo exportado exitosamente');
  };

  const resetToDefaults = async () => {
    if (!confirm('¿Estás seguro de que quieres restaurar la configuración por defecto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      // This would typically call a backend function to reset defaults
      // For now, we'll just show a message
      toast.info('Función de restaurar valores por defecto próximamente disponible');
    } catch (error: any) {
      console.error('Error resetting settings:', error);
      toast.error('Error al restaurar configuración');
    }
  };

  // Convert setting value based on type
  const parseSettingValue = (value: any, type: string) => {
    switch (type) {
      case 'number':
        return typeof value === 'string' ? parseFloat(value) : value;
      case 'boolean':
        return typeof value === 'string' ? value === 'true' : Boolean(value);
      case 'json':
        return typeof value === 'string' ? JSON.parse(value) : value;
      default:
        return value;
    }
  };

  // Format setting value for display
  const formatSettingValue = (value: any, type: string) => {
    switch (type) {
      case 'boolean':
        return value ? 'Activado' : 'Desactivado';
      case 'json':
        return JSON.stringify(value, null, 2);
      default:
        return String(value);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    saving,
    error,
    fetchSettings,
    updateSetting,
    updateMultipleSettings,
    getSettingValue,
    getSettingsByCategory,
    exportSettings,
    resetToDefaults,
    parseSettingValue,
    formatSettingValue
  };
};

