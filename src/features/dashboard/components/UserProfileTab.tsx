import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Shield,
  Settings,
  Bell,
  Globe,
  Lock,
  Trash2,
  Camera,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Key,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PersonalData {
  full_name: string;
  phone: string;
  bio: string;
  location: string;
  address?: string;
  date_of_birth?: string;
  nationality?: string;
  website?: string;
}

interface PreferencesData {
  language: string;
  currency: string;
  timezone: string;
  theme: string;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  sms_notifications?: boolean;
}

export const UserProfileTab: React.FC = () => {
  const { user, profile, updateProfile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('personal');
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [personalData, setPersonalData] = useState<PersonalData>({
    full_name: '',
    phone: '',
    bio: '',
    location: '',
    address: '',
    date_of_birth: '',
    nationality: '',
    website: '',
  });

  const [preferencesData, setPreferencesData] = useState<PreferencesData>({
    language: 'es',
    currency: 'COP',
    timezone: 'America/Bogota',
    theme: 'light',
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    sms_notifications: false,
  });

  // Initialize data when profile loads
  useEffect(() => {
    if (profile) {
      setPersonalData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || '',
        address: (profile as any).address || '',
        date_of_birth: (profile as any).date_of_birth || '',
        nationality: (profile as any).nationality || '',
        website: profile.website || '',
      });

      // Load preferences from profile
      const prefs = (profile as any).preferences || {};
      setPreferencesData({
        language: prefs.language || 'es',
        currency: prefs.currency || 'COP',
        timezone: prefs.timezone || 'America/Bogota',
        theme: prefs.theme || 'light',
        email_notifications: prefs.email_notifications !== undefined ? prefs.email_notifications : true,
        push_notifications: prefs.push_notifications !== undefined ? prefs.push_notifications : true,
        marketing_emails: prefs.marketing_emails || false,
        sms_notifications: prefs.sms_notifications || false,
      });
    }
  }, [profile]);

  const handleSavePersonal = async () => {
    if (!user?.id || !profile?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: personalData.full_name,
          phone: personalData.phone,
          bio: personalData.bio,
          location: personalData.location,
          address: personalData.address || null,
          date_of_birth: personalData.date_of_birth || null,
          nationality: personalData.nationality || null,
          website: personalData.website || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      setIsEditingPersonal(false);
      toast.success('Datos personales actualizados exitosamente');
    } catch (error: any) {
      console.error('Error updating personal data:', error);
      toast.error('Error al actualizar los datos personales');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user?.id || !profile?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: preferencesData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      setIsEditingPreferences(false);
      toast.success('Preferencias actualizadas exitosamente');
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast.error('Error al actualizar las preferencias');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Try uploading to avatars bucket, fallback to profile-docs if needed
      let bucket = 'avatars';
      let uploadError: any = null;
      
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (error) {
        // If avatars bucket doesn't exist, try profile-docs
        if (error.message?.includes('not found') || error.statusCode === 404) {
          bucket = 'profile-docs';
          const { error: fallbackError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type
            });
          uploadError = fallbackError;
        } else {
          uploadError = error;
        }
      }

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast.success('Foto de perfil actualizada exitosamente');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Error al subir la foto de perfil');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = () => {
    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (passwordData.newPassword.length < 8 || !/[A-Za-z]/.test(passwordData.newPassword) || !/\d/.test(passwordData.newPassword)) {
      toast.error('La contraseña debe tener al menos 8 caracteres, una letra y un número');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setChangingPassword(true);
    try {
      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast.success('Contraseña actualizada exitosamente');
      setShowPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Error al cambiar la contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteAccountConfirm = async () => {
    if (!user?.id || !profile?.id) return;

    setDeletingAccount(true);
    try {
      // Check if user has associated data
      const { data: userData } = await supabase
        .from('profiles')
        .select(`
          properties:properties!properties_owner_id_fkey(count),
          offers:offers!offers_buyer_id_fkey(count),
          visits:visits!visits_visitor_id_fkey(count)
        `)
        .eq('id', user.id)
        .single();

      if (userData) {
        const hasProperties = (userData.properties?.[0]?.count || 0) > 0;
        const hasOffers = (userData.offers?.[0]?.count || 0) > 0;
        const hasVisits = (userData.visits?.[0]?.count || 0) > 0;

        if (hasProperties || hasOffers || hasVisits) {
          toast.error('No puedes eliminar tu cuenta porque tienes propiedades, ofertas o visitas asociadas. Por favor, elimina primero estos datos.');
          setShowDeleteDialog(false);
          setDeletingAccount(false);
          return;
        }
      }

      // Delete profile (this will cascade delete related data due to ON DELETE CASCADE)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (deleteError) throw deleteError;

      // Sign out and redirect
      toast.success('Cuenta eliminada exitosamente');
      await signOut();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'Error al eliminar la cuenta');
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleCancelPersonal = () => {
    if (profile) {
      setPersonalData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || '',
        address: (profile as any).address || '',
        date_of_birth: (profile as any).date_of_birth || '',
        nationality: (profile as any).nationality || '',
        website: profile.website || '',
      });
    }
    setIsEditingPersonal(false);
  };

  const handleCancelPreferences = () => {
    if (profile) {
      const prefs = (profile as any).preferences || {};
      setPreferencesData({
        language: prefs.language || 'es',
        currency: prefs.currency || 'COP',
        timezone: prefs.timezone || 'America/Bogota',
        theme: prefs.theme || 'light',
        email_notifications: prefs.email_notifications !== undefined ? prefs.email_notifications : true,
        push_notifications: prefs.push_notifications !== undefined ? prefs.push_notifications : true,
        marketing_emails: prefs.marketing_emails || false,
        sms_notifications: prefs.sms_notifications || false,
      });
    }
    setIsEditingPreferences(false);
  };

  if (!profile || !user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-semibold">Cargando perfil...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      super_admin: { label: 'Super Admin', variant: 'default' },
      admin: { label: 'Administrador', variant: 'default' },
      lawyer: { label: 'Abogado', variant: 'secondary' },
      agent: { label: 'Agente', variant: 'secondary' },
      user: { label: 'Usuario', variant: 'outline' },
    };

    const config = roleConfig[role] || roleConfig.user;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 ring-4 ring-gray-100">
                  <AvatarImage src={(profile as any).avatar_url} alt={profile.full_name} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">
                    {profile.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
              <div>
                <CardTitle className="text-2xl">{profile.full_name || 'Usuario'}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  {getRoleBadge(profile.role)}
                  {profile.verification_status === 'verified' ? (
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/verification')}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Verificar Cuenta
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Datos Personales
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Preferencias
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Gestión de Cuenta
          </TabsTrigger>
        </TabsList>

        {/* Personal Data Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información Personal
                  </CardTitle>
                  <CardDescription>
                    Actualiza tu información personal y de contacto
                  </CardDescription>
                </div>
                {!isEditingPersonal && (
                  <Button 
                    onClick={() => setIsEditingPersonal(true)} 
                    variant="outline" 
                    size="sm"
                    className="font-semibold text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditingPersonal ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nombre Completo *</Label>
                      <Input
                        id="full_name"
                        value={personalData.full_name}
                        onChange={(e) => setPersonalData({ ...personalData, full_name: e.target.value })}
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={personalData.phone}
                        onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                        placeholder="+57 300 000 0000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Ubicación</Label>
                      <Input
                        id="location"
                        value={personalData.location}
                        onChange={(e) => setPersonalData({ ...personalData, location: e.target.value })}
                        placeholder="Ciudad, País"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        value={personalData.address}
                        onChange={(e) => setPersonalData({ ...personalData, address: e.target.value })}
                        placeholder="Dirección completa"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Fecha de Nacimiento</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={personalData.date_of_birth}
                        onChange={(e) => setPersonalData({ ...personalData, date_of_birth: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nacionalidad</Label>
                      <Input
                        id="nationality"
                        value={personalData.nationality}
                        onChange={(e) => setPersonalData({ ...personalData, nationality: e.target.value })}
                        placeholder="Ej: Colombiana"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input
                      id="website"
                      type="url"
                      value={personalData.website}
                      onChange={(e) => setPersonalData({ ...personalData, website: e.target.value })}
                      placeholder="https://tu-sitio.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={personalData.bio}
                      onChange={(e) => setPersonalData({ ...personalData, bio: e.target.value })}
                      placeholder="Cuéntanos sobre ti..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={handleCancelPersonal} 
                      disabled={saving}
                      className="font-semibold text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button onClick={handleSavePersonal} disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Nombre Completo</p>
                        <p className="text-base font-semibold text-gray-900">{profile.full_name || 'No especificado'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Teléfono</p>
                        <p className="text-base font-semibold text-gray-900">{profile.phone || 'No especificado'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Ubicación</p>
                        <p className="text-base font-semibold text-gray-900">{profile.location || 'No especificada'}</p>
                      </div>
                    </div>
                    {(profile as any).address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Dirección</p>
                          <p className="text-base font-semibold text-gray-900">{(profile as any).address}</p>
                        </div>
                      </div>
                    )}
                    {(profile as any).date_of_birth && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Fecha de Nacimiento</p>
                          <p className="text-base font-semibold text-gray-900">
                            {format(new Date((profile as any).date_of_birth), "d 'de' MMMM 'de' yyyy", { locale: es })}
                          </p>
                        </div>
                      </div>
                    )}
                    {(profile as any).nationality && (
                      <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Nacionalidad</p>
                          <p className="text-base font-semibold text-gray-900">{(profile as any).nationality}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {profile.bio && (
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">Biografía</p>
                      <p className="text-base font-medium text-gray-900">{profile.bio}</p>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Preferencias
                  </CardTitle>
                  <CardDescription>
                    Personaliza tu experiencia en la plataforma
                  </CardDescription>
                </div>
                {!isEditingPreferences && (
                  <Button 
                    onClick={() => setIsEditingPreferences(true)} 
                    variant="outline" 
                    size="sm"
                    className="font-semibold text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditingPreferences ? (
                <>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Idioma y Región</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="language">Idioma</Label>
                          <Select
                            value={preferencesData.language}
                            onValueChange={(value) => setPreferencesData({ ...preferencesData, language: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="es">Español</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="pt">Português</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currency">Moneda</Label>
                          <Select
                            value={preferencesData.currency}
                            onValueChange={(value) => setPreferencesData({ ...preferencesData, currency: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
                              <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                              <SelectItem value="EUR">EUR - Euro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timezone">Zona Horaria</Label>
                          <Select
                            value={preferencesData.timezone}
                            onValueChange={(value) => setPreferencesData({ ...preferencesData, timezone: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="America/Bogota">Bogotá (GMT-5)</SelectItem>
                              <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                              <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                              <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Apariencia</h3>
                      <div className="space-y-2">
                        <Label htmlFor="theme">Tema</Label>
                        <Select
                          value={preferencesData.theme}
                          onValueChange={(value) => setPreferencesData({ ...preferencesData, theme: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Claro</SelectItem>
                            <SelectItem value="dark">Oscuro</SelectItem>
                            <SelectItem value="system">Sistema</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notificaciones
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="font-semibold text-gray-800">Notificaciones por Email</Label>
                            <p className="text-sm text-gray-700 font-medium">
                              Recibe notificaciones importantes por correo electrónico
                            </p>
                          </div>
                          <Switch
                            checked={preferencesData.email_notifications}
                            onCheckedChange={(checked) =>
                              setPreferencesData({ ...preferencesData, email_notifications: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="font-semibold text-gray-800">Notificaciones Push</Label>
                            <p className="text-sm text-gray-700 font-medium">
                              Recibe notificaciones en tiempo real en tu dispositivo
                            </p>
                          </div>
                          <Switch
                            checked={preferencesData.push_notifications}
                            onCheckedChange={(checked) =>
                              setPreferencesData({ ...preferencesData, push_notifications: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="font-semibold text-gray-800">Notificaciones SMS</Label>
                            <p className="text-sm text-gray-700 font-medium">
                              Recibe notificaciones importantes por mensaje de texto
                            </p>
                          </div>
                          <Switch
                            checked={preferencesData.sms_notifications || false}
                            onCheckedChange={(checked) =>
                              setPreferencesData({ ...preferencesData, sms_notifications: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="font-semibold text-gray-800">Emails de Marketing</Label>
                            <p className="text-sm text-gray-700 font-medium">
                              Recibe promociones y contenido de marketing
                            </p>
                          </div>
                          <Switch
                            checked={preferencesData.marketing_emails}
                            onCheckedChange={(checked) =>
                              setPreferencesData({ ...preferencesData, marketing_emails: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={handleCancelPreferences} 
                        disabled={saving}
                        className="font-semibold text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button onClick={handleSavePreferences} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Guardando...' : 'Guardar Preferencias'}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Idioma y Región</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Idioma</p>
                        <p className="text-base font-semibold text-gray-900">
                          {preferencesData.language === 'es' ? 'Español' :
                           preferencesData.language === 'en' ? 'English' :
                           preferencesData.language === 'pt' ? 'Português' : preferencesData.language}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Moneda</p>
                        <p className="text-base font-semibold text-gray-900">{preferencesData.currency}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Zona Horaria</p>
                        <p className="text-base font-semibold text-gray-900">{preferencesData.timezone}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Apariencia</h3>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Tema</p>
                      <p className="text-base font-semibold text-gray-900 capitalize">{preferencesData.theme}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Notificaciones</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">Notificaciones por Email</span>
                        {preferencesData.email_notifications ? (
                          <CheckCircle className="w-5 h-5 text-green-700" />
                        ) : (
                          <X className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">Notificaciones Push</span>
                        {preferencesData.push_notifications ? (
                          <CheckCircle className="w-5 h-5 text-green-700" />
                        ) : (
                          <X className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">Notificaciones SMS</span>
                        {preferencesData.sms_notifications ? (
                          <CheckCircle className="w-5 h-5 text-green-700" />
                        ) : (
                          <X className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">Emails de Marketing</span>
                        {preferencesData.marketing_emails ? (
                          <CheckCircle className="w-5 h-5 text-green-700" />
                        ) : (
                          <X className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Management Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Información de la Cuenta
              </CardTitle>
              <CardDescription>
                Gestiona la seguridad y configuración de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Email</p>
                      <p className="text-base font-semibold text-gray-900">{user.email}</p>
                      {user.email_confirmed_at ? (
                        <p className="text-xs font-semibold text-green-700 mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Email confirmado
                        </p>
                      ) : (
                        <p className="text-xs font-semibold text-yellow-700 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Email pendiente de confirmación
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Miembro desde</p>
                      <p className="text-base font-semibold text-gray-900">
                        {format(new Date(profile.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">Estado de Verificación</p>
                      <div className="flex items-center gap-2 mt-1">
                        {profile.verification_status === 'verified' ? (
                          <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-sm font-semibold">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Verificado
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-semibold text-gray-700">No Verificado</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/verification')}
                              className="text-blue-700 hover:bg-blue-50 border-blue-300 font-semibold"
                            >
                              Verificar Ahora
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Rol</p>
                      <div className="mt-1">{getRoleBadge(profile.role)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Seguridad
              </CardTitle>
              <CardDescription>
                Gestiona la seguridad de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start font-semibold text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900" 
                onClick={handleChangePassword}
              >
                <Key className="w-4 h-4 mr-2" />
                Cambiar Contraseña
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300" 
                onClick={handleDeleteAccount}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Cuenta
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogOut className="w-5 h-5" />
                Sesión
              </CardTitle>
              <CardDescription>
                Gestiona tu sesión actual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full font-semibold text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900" 
                onClick={signOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Cambiar Contraseña
            </DialogTitle>
            <DialogDescription>
              Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres, incluir una letra y un número.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Ingresa tu nueva contraseña"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirma tu nueva contraseña"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPasswordDialog(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }} 
              disabled={changingPassword}
              className="font-semibold text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
            >
              Cancelar
            </Button>
            <Button onClick={handlePasswordSubmit} disabled={changingPassword}>
              {changingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Eliminar Cuenta
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y todos los datos asociados.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium mb-2">Advertencia:</p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>Tu perfil será eliminado permanentemente</li>
                <li>No podrás recuperar tu cuenta después de eliminarla</li>
                <li>Si tienes propiedades, ofertas o visitas asociadas, no podrás eliminar tu cuenta</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)} 
              disabled={deletingAccount}
              className="font-semibold text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteAccountConfirm}
              disabled={deletingAccount}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {deletingAccount ? 'Eliminando...' : 'Eliminar Cuenta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

