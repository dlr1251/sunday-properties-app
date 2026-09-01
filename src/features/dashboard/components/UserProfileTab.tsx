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
import { getAvatarUrl } from '@/utils/avatar';
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
import { useTranslation } from 'react-i18next';
import { useDateFnsLocale } from '../../../i18n/useDateFnsLocale';

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
  const { t } = useTranslation();
  const dateLocale = useDateFnsLocale();
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
      const updatedAt = new Date().toISOString();
      const emptyToNull = (v: string) => (v?.trim() || null);

      // Full payload including optional columns (address, date_of_birth, nationality from additional_features migration)
      const fullPayload = {
        full_name: emptyToNull(personalData.full_name),
        phone: emptyToNull(personalData.phone),
        bio: emptyToNull(personalData.bio),
        location: emptyToNull(personalData.location),
        website: emptyToNull(personalData.website),
        address: emptyToNull(personalData.address),
        date_of_birth: emptyToNull(personalData.date_of_birth),
        nationality: emptyToNull(personalData.nationality),
        updated_at: updatedAt,
      };

      let result = await supabase.from('profiles').update(fullPayload).eq('id', profile.id);

      if (result.error) {
        const msg = result.error.message || '';
        if (msg.includes('does not exist') || msg.includes('column')) {
          // Schema may not have optional columns; retry with base columns only
          const basePayload = {
            full_name: fullPayload.full_name,
            phone: fullPayload.phone,
            bio: fullPayload.bio,
            location: fullPayload.location,
            website: fullPayload.website,
            updated_at: updatedAt,
          };
          result = await supabase.from('profiles').update(basePayload).eq('id', profile.id);
        }
        if (result.error) throw result.error;
      }

      await refreshProfile();
      setIsEditingPersonal(false);
      toast.success(t('profile.toasts.personalUpdated'));
    } catch (error: any) {
      console.error('Error updating personal data:', error);
      const message = error?.message || error?.error_description || t('profile.toasts.personalUpdateError');
      toast.error(message);
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
      toast.success(t('profile.toasts.preferencesUpdated'));
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast.error(t('profile.toasts.preferencesUpdateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.toasts.avatarTypeError'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.toasts.avatarSizeError'));
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
      toast.success(t('profile.toasts.avatarUpdated'));
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || t('profile.toasts.avatarUploadError'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = () => {
    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error(t('profile.toasts.fillAllFields'));
      return;
    }

    if (passwordData.newPassword.length < 8 || !/[A-Za-z]/.test(passwordData.newPassword) || !/\d/.test(passwordData.newPassword)) {
      toast.error(t('auth.passwordRequirements'));
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('profile.toasts.passwordMismatch'));
      return;
    }

    setChangingPassword(true);
    try {
      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast.success(t('profile.toasts.passwordUpdated'));
      setShowPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || t('profile.toasts.passwordChangeError'));
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
          toast.error(t('profile.toasts.cannotDeleteWithData'));
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
      toast.success(t('profile.toasts.accountDeleted'));
      await signOut();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.message || t('profile.toasts.deleteError'));
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
            <p className="text-gray-700 font-semibold">{t('profile.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRoleBadge = (role: string) => {
    const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      super_admin: 'default',
      admin: 'default',
      lawyer: 'secondary',
      agent: 'secondary',
      user: 'outline',
    };
    const variant = variantMap[role] || 'outline';
    return <Badge variant={variant}>{t(`profile.roles.${role}`, { defaultValue: t('profile.roles.user') })}</Badge>;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 ring-4 ring-gray-100">
                  <AvatarImage src={getAvatarUrl(profile)} alt={profile.full_name} />
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
                <CardTitle className="text-2xl">{profile.full_name || t('user')}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  {getRoleBadge(profile.role)}
                  {profile.verification_status === 'verified' ? (
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {t('profile.verified')}
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/verification')}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {t('profile.verifyAccount')}
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {t('profile.personalAndPreferences')}
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {t('profile.accountManagement')}
          </TabsTrigger>
        </TabsList>

        {/* Personal Data + Preferences Tab (merged) */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t('profile.personalInfo')}
                  </CardTitle>
                  <CardDescription>
                    {t('profile.personalInfoDescription')}
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
                    {t('common.edit')}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditingPersonal ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">{t('profile.fullNameRequired')}</Label>
                      <Input
                        id="full_name"
                        value={personalData.full_name}
                        onChange={(e) => setPersonalData({ ...personalData, full_name: e.target.value })}
                        placeholder={t('profile.placeholders.fullName')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('profile.phone')}</Label>
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
                      <Label htmlFor="location">{t('profile.location')}</Label>
                      <Input
                        id="location"
                        value={personalData.location}
                        onChange={(e) => setPersonalData({ ...personalData, location: e.target.value })}
                        placeholder={t('profile.placeholders.location')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">{t('profile.address')}</Label>
                      <Input
                        id="address"
                        value={personalData.address}
                        onChange={(e) => setPersonalData({ ...personalData, address: e.target.value })}
                        placeholder={t('profile.placeholders.address')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">{t('profile.dateOfBirth')}</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={personalData.date_of_birth}
                        onChange={(e) => setPersonalData({ ...personalData, date_of_birth: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">{t('profile.nationality')}</Label>
                      <Input
                        id="nationality"
                        value={personalData.nationality}
                        onChange={(e) => setPersonalData({ ...personalData, nationality: e.target.value })}
                        placeholder={t('profile.placeholders.nationality')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">{t('profile.website')}</Label>
                    <Input
                      id="website"
                      type="url"
                      value={personalData.website}
                      onChange={(e) => setPersonalData({ ...personalData, website: e.target.value })}
                      placeholder={t('profile.placeholders.website')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">{t('profile.bio')}</Label>
                    <Textarea
                      id="bio"
                      value={personalData.bio}
                      onChange={(e) => setPersonalData({ ...personalData, bio: e.target.value })}
                      placeholder={t('profile.placeholders.bio')}
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
                      {t('common.cancel')}
                    </Button>
                    <Button onClick={handleSavePersonal} disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? t('common.saving') : t('common.saveChanges')}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{t('profile.fullName')}</p>
                        <p className="text-base font-semibold text-gray-900">{profile.full_name || t('common.notSpecified')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{t('profile.phone')}</p>
                        <p className="text-base font-semibold text-gray-900">{profile.phone || t('common.notSpecified')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{t('profile.location')}</p>
                        <p className="text-base font-semibold text-gray-900">{profile.location || t('common.notSpecified')}</p>
                      </div>
                    </div>
                    {(profile as any).address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{t('profile.address')}</p>
                          <p className="text-base font-semibold text-gray-900">{(profile as any).address}</p>
                        </div>
                      </div>
                    )}
                    {(profile as any).date_of_birth && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{t('profile.dateOfBirth')}</p>
                          <p className="text-base font-semibold text-gray-900">
                            {format(new Date((profile as any).date_of_birth), 'PPP', { locale: dateLocale })}
                          </p>
                        </div>
                      </div>
                    )}
                    {(profile as any).nationality && (
                      <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{t('profile.nationality')}</p>
                          <p className="text-base font-semibold text-gray-900">{(profile as any).nationality}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {profile.bio && (
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">{t('profile.bio')}</p>
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

          {/* Preferences section (merged into same tab) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    {t('profile.preferences')}
                  </CardTitle>
                  <CardDescription>
                    {t('profile.preferencesDescription')}
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
                    {t('common.edit')}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditingPreferences ? (
                <>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('profile.languageAndRegion')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="language">{t('profile.language')}</Label>
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
                          <Label htmlFor="currency">{t('profile.currency')}</Label>
                          <Select
                            value={preferencesData.currency}
                            onValueChange={(value) => setPreferencesData({ ...preferencesData, currency: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="COP">{t('profile.currencies.COP')}</SelectItem>
                              <SelectItem value="USD">{t('profile.currencies.USD')}</SelectItem>
                              <SelectItem value="EUR">{t('profile.currencies.EUR')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timezone">{t('profile.timezone')}</Label>
                          <Select
                            value={preferencesData.timezone}
                            onValueChange={(value) => setPreferencesData({ ...preferencesData, timezone: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="America/Bogota">{t('profile.timezones.bogota')}</SelectItem>
                              <SelectItem value="America/New_York">{t('profile.timezones.newYork')}</SelectItem>
                              <SelectItem value="Europe/Madrid">{t('profile.timezones.madrid')}</SelectItem>
                              <SelectItem value="America/Mexico_City">{t('profile.timezones.mexicoCity')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">{t('profile.appearance')}</h3>
                      <div className="space-y-2">
                        <Label htmlFor="theme">{t('profile.theme')}</Label>
                        <Select
                          value={preferencesData.theme}
                          onValueChange={(value) => setPreferencesData({ ...preferencesData, theme: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">{t('settings.themes.light')}</SelectItem>
                            <SelectItem value="dark">{t('settings.themes.dark')}</SelectItem>
                            <SelectItem value="system">{t('settings.themes.system')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        {t('settings.notifications')}
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="font-semibold text-gray-800">{t('profile.emailNotifications')}</Label>
                            <p className="text-sm text-gray-700 font-medium">
                              {t('profile.emailNotificationsHint')}
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
                            <Label className="font-semibold text-gray-800">{t('profile.pushNotifications')}</Label>
                            <p className="text-sm text-gray-700 font-medium">
                              {t('profile.pushNotificationsHint')}
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
                            <Label className="font-semibold text-gray-800">{t('profile.smsNotifications')}</Label>
                            <p className="text-sm text-gray-700 font-medium">
                              {t('profile.smsNotificationsHint')}
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
                            <Label className="font-semibold text-gray-800">{t('profile.marketingEmails')}</Label>
                            <p className="text-sm text-gray-700 font-medium">
                              {t('profile.marketingEmailsHint')}
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
                        {t('common.cancel')}
                      </Button>
                      <Button onClick={handleSavePreferences} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? t('common.saving') : t('profile.savePreferences')}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">{t('profile.languageAndRegion')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{t('profile.language')}</p>
                        <p className="text-base font-semibold text-gray-900">
                          {preferencesData.language === 'es' ? 'Español' :
                           preferencesData.language === 'en' ? 'English' :
                           preferencesData.language === 'pt' ? 'Português' : preferencesData.language}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{t('profile.currency')}</p>
                        <p className="text-base font-semibold text-gray-900">{preferencesData.currency}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{t('profile.timezone')}</p>
                        <p className="text-base font-semibold text-gray-900">{preferencesData.timezone}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('profile.appearance')}</h3>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{t('profile.theme')}</p>
                      <p className="text-base font-semibold text-gray-900">{t(`settings.themes.${preferencesData.theme}`, { defaultValue: preferencesData.theme })}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('settings.notifications')}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">{t('profile.emailNotifications')}</span>
                        {preferencesData.email_notifications ? (
                          <CheckCircle className="w-5 h-5 text-green-700" />
                        ) : (
                          <X className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">{t('profile.pushNotifications')}</span>
                        {preferencesData.push_notifications ? (
                          <CheckCircle className="w-5 h-5 text-green-700" />
                        ) : (
                          <X className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">{t('profile.smsNotifications')}</span>
                        {preferencesData.sms_notifications ? (
                          <CheckCircle className="w-5 h-5 text-green-700" />
                        ) : (
                          <X className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">{t('profile.marketingEmails')}</span>
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
                {t('profile.accountInfo')}
              </CardTitle>
              <CardDescription>
                {t('profile.accountInfoDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{t('profile.email')}</p>
                      <p className="text-base font-semibold text-gray-900">{user.email}</p>
                      {user.email_confirmed_at ? (
                        <p className="text-xs font-semibold text-green-700 mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {t('profile.emailConfirmed')}
                        </p>
                      ) : (
                        <p className="text-xs font-semibold text-yellow-700 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {t('profile.emailPending')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{t('profile.memberSince')}</p>
                      <p className="text-base font-semibold text-gray-900">
                        {format(new Date(profile.created_at), 'PPP', { locale: dateLocale })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{t('profile.verificationStatus')}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {profile.verification_status === 'verified' ? (
                          <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-sm font-semibold">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {t('profile.verified')}
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-semibold text-gray-700">{t('profile.notVerified')}</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/verification')}
                              className="text-blue-700 hover:bg-blue-50 border-blue-300 font-semibold"
                            >
                              {t('profile.verifyNow')}
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
                      <p className="text-sm font-semibold text-gray-800">{t('profile.role')}</p>
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
                {t('profile.security')}
              </CardTitle>
              <CardDescription>
                {t('profile.securityDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start font-semibold text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900" 
                onClick={handleChangePassword}
              >
                <Key className="w-4 h-4 mr-2" />
                {t('profile.changePassword')}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300" 
                onClick={handleDeleteAccount}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('profile.deleteAccount')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogOut className="w-5 h-5" />
                {t('profile.session')}
              </CardTitle>
              <CardDescription>
                {t('profile.sessionDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full font-semibold text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900" 
                onClick={signOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('nav.signOut')}
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
              {t('profile.changePassword')}
            </DialogTitle>
            <DialogDescription>
              {t('profile.passwordDialogHint')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('profile.newPassword')}</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder={t('profile.newPasswordPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('profile.confirmNewPassword')}</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder={t('profile.confirmPasswordPlaceholder')}
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
              {t('common.cancel')}
            </Button>
            <Button onClick={handlePasswordSubmit} disabled={changingPassword}>
              {changingPassword ? t('profile.changingPassword') : t('profile.changePassword')}
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
              {t('profile.deleteAccount')}
            </DialogTitle>
            <DialogDescription>
              {t('profile.deleteAccountDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium mb-2">{t('profile.deleteAccountWarningTitle')}</p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>{t('profile.deleteWarning1')}</li>
                <li>{t('profile.deleteWarning2')}</li>
                <li>{t('profile.deleteWarning3')}</li>
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
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleDeleteAccountConfirm}
              disabled={deletingAccount}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {deletingAccount ? t('profile.deleting') : t('profile.deleteAccount')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

