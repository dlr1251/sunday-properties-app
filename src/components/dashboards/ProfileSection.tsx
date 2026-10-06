import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/utils/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Crown,
  Award,
  Star,
  Building2,
  Briefcase,
  GraduationCap,
  Languages,
  MessageSquare,
  Camera,
  Upload,
  Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/format';

interface ProfileSectionProps {
  isDarkMode?: boolean;
  compact?: boolean;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  isDarkMode = false,
  compact = false
}) => {
  const { t } = useTranslation();
  const { user, profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const cardClasses = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  const handleEdit = () => {
    setEditData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      address: profile?.address || '',
      date_of_birth: profile?.date_of_birth || '',
      nationality: profile?.nationality || '',
      website: profile?.website || '',
      company: profile?.company || '',
      license_number: profile?.license_number || '',
      specializations: profile?.specializations || [],
      languages: profile?.languages || [],
      experience_years: profile?.experience_years || 0
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(editData)
        .eq('id', profile.id);

      if (error) throw error;

      await updateProfile(editData);
      setIsEditing(false);
      toast.success(t('profile.toasts.profileUpdated'));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(t('profile.toasts.profileUpdateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({});
    setIsEditing(false);
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      super_admin: { labelKey: 'profile.roles.super_admin', color: 'bg-purple-100 text-purple-800', icon: Crown },
      admin: { labelKey: 'profile.roles.admin', color: 'bg-red-100 text-red-800', icon: Shield },
      lawyer: { labelKey: 'profile.roles.lawyer', color: 'bg-blue-100 text-blue-800', icon: GraduationCap },
      agent: { labelKey: 'profile.roles.agent', color: 'bg-green-100 text-green-800', icon: Briefcase },
      verified: { labelKey: 'profile.verified', color: 'bg-green-100 text-green-800', icon: Award },
      premium: { labelKey: 'profile.roles.premium', color: 'bg-yellow-100 text-yellow-800', icon: Star },
      user: { labelKey: 'profile.roles.user', color: 'bg-gray-100 text-gray-800', icon: User }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {t(config.labelKey)}
      </Badge>
    );
  };

  const getVerificationBadge = (status: string) => {
    const statusConfig = {
      verified: { labelKey: 'profile.verified', color: 'bg-green-100 text-green-800', icon: Award },
      pending: { labelKey: 'profile.pendingReview', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      rejected: { labelKey: 'profile.rejected', color: 'bg-red-100 text-red-800', icon: X },
      unverified: { labelKey: 'profile.notVerified', color: 'bg-gray-100 text-gray-800', icon: User }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unverified;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {t(config.labelKey)}
      </Badge>
    );
  };

  if (!profile) {
    return (
      <Card className={cardClasses}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={textSecondary}>{t('profile.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClasses}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-16 h-16">
              <AvatarImage src={getAvatarUrl(profile)} alt={profile.full_name || user?.email} />
              <AvatarFallback>
                {profile.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className={textPrimary}>
                {profile.full_name || t('profile.roles.user')}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user?.email}
              </CardDescription>
            </div>
          </div>
          {!isEditing && (
            <Button onClick={handleEdit} variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              {t('common.edit')}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {profile.role && getRoleBadge(profile.role)}
          {profile.verification_status && getVerificationBadge(profile.verification_status)}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">{t('profile.tabBasic')}</TabsTrigger>
            <TabsTrigger value="professional">{t('profile.tabProfessional')}</TabsTrigger>
            <TabsTrigger value="account">{t('profile.tabAccount')}</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">{t('profile.fullName')}</Label>
                    <Input
                      id="full_name"
                      value={editData.full_name || ''}
                      onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                      placeholder={t('profile.placeholders.fullName')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('profile.phone')}</Label>
                    <Input
                      id="phone"
                      value={editData.phone || ''}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      placeholder={t('profile.placeholders.phone')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">{t('profile.location')}</Label>
                    <Input
                      id="location"
                      value={editData.location || ''}
                      onChange={(e) => setEditData({...editData, location: e.target.value})}
                      placeholder={t('profile.placeholders.location')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">{t('profile.address')}</Label>
                    <Input
                      id="address"
                      value={editData.address || ''}
                      onChange={(e) => setEditData({...editData, address: e.target.value})}
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
                      value={editData.date_of_birth || ''}
                      onChange={(e) => setEditData({...editData, date_of_birth: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">{t('profile.nationality')}</Label>
                    <Input
                      id="nationality"
                      value={editData.nationality || ''}
                      onChange={(e) => setEditData({...editData, nationality: e.target.value})}
                      placeholder={t('profile.placeholders.nationality')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">{t('profile.bio')}</Label>
                  <Textarea
                    id="bio"
                    value={editData.bio || ''}
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    placeholder={t('profile.placeholders.bio')}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">{t('profile.website')}</Label>
                  <Input
                    id="website"
                    type="url"
                    value={editData.website || ''}
                    onChange={(e) => setEditData({...editData, website: e.target.value})}
                    placeholder={t('profile.placeholders.website')}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className={`w-5 h-5 ${textSecondary}`} />
                    <div>
                      <p className={`text-sm ${textSecondary}`}>{t('profile.fullName')}</p>
                      <p className={textPrimary}>{profile.full_name || t('common.notSpecified')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className={`w-5 h-5 ${textSecondary}`} />
                    <div>
                      <p className={`text-sm ${textSecondary}`}>{t('profile.phone')}</p>
                      <p className={textPrimary}>{profile.phone || t('common.notSpecified')}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin className={`w-5 h-5 ${textSecondary}`} />
                    <div>
                      <p className={`text-sm ${textSecondary}`}>{t('profile.location')}</p>
                      <p className={textPrimary}>{profile.location || t('common.notSpecified')}</p>
                    </div>
                  </div>
                  {profile.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className={`w-5 h-5 ${textSecondary}`} />
                      <div>
                        <p className={`text-sm ${textSecondary}`}>{t('profile.address')}</p>
                        <p className={textPrimary}>{profile.address}</p>
                      </div>
                    </div>
                  )}
                </div>
                {(profile.date_of_birth || profile.nationality) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.date_of_birth && (
                      <div className="flex items-center gap-3">
                        <Calendar className={`w-5 h-5 ${textSecondary}`} />
                        <div>
                          <p className={`text-sm ${textSecondary}`}>{t('profile.dateOfBirth')}</p>
                          <p className={textPrimary}>
                            {formatDate(profile.date_of_birth)}
                          </p>
                        </div>
                      </div>
                    )}
                    {profile.nationality && (
                      <div className="flex items-center gap-3">
                        <User className={`w-5 h-5 ${textSecondary}`} />
                        <div>
                          <p className={`text-sm ${textSecondary}`}>{t('profile.nationality')}</p>
                          <p className={textPrimary}>{profile.nationality}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {profile.bio && (
                  <div>
                    <p className={`text-sm ${textSecondary} mb-2`}>{t('profile.bio')}</p>
                    <p className={textPrimary}>{profile.bio}</p>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-3">
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`text-sm ${textPrimary} hover:underline flex items-center gap-2`}
                    >
                      <MessageSquare className={`w-4 h-4 ${textSecondary}`} />
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="professional" className="space-y-4 mt-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">{t('profile.company')}</Label>
                    <Input
                      id="company"
                      value={editData.company || ''}
                      onChange={(e) => setEditData({...editData, company: e.target.value})}
                      placeholder={t('profile.placeholders.company')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license_number">{t('profile.licenseNumber')}</Label>
                    <Input
                      id="license_number"
                      value={editData.license_number || ''}
                      onChange={(e) => setEditData({...editData, license_number: e.target.value})}
                      placeholder={t('profile.placeholders.license')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">{t('profile.experienceYears')}</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      value={editData.experience_years || 0}
                      onChange={(e) => setEditData({...editData, experience_years: parseInt(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specializations">{t('profile.specializations')}</Label>
                    <Input
                      id="specializations"
                      value={editData.specializations?.join(', ') || ''}
                      onChange={(e) => setEditData({...editData, specializations: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                      placeholder={t('profile.placeholders.specializations')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="languages">{t('profile.languages')}</Label>
                  <Input
                    id="languages"
                    value={editData.languages?.join(', ') || ''}
                    onChange={(e) => setEditData({...editData, languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                    placeholder={t('profile.placeholders.languages')}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Building2 className={`w-5 h-5 ${textSecondary}`} />
                    <div>
                      <p className={`text-sm ${textSecondary}`}>{t('profile.company')}</p>
                      <p className={textPrimary}>{profile.company || t('common.notSpecified')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className={`w-5 h-5 ${textSecondary}`} />
                    <div>
                      <p className={`text-sm ${textSecondary}`}>{t('profile.license')}</p>
                      <p className={textPrimary}>{profile.license_number || t('common.notSpecified')}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className={`w-5 h-5 ${textSecondary}`} />
                    <div>
                      <p className={`text-sm ${textSecondary}`}>{t('profile.experience')}</p>
                      <p className={textPrimary}>{profile.experience_years ? t('profile.experienceValue', { count: profile.experience_years }) : t('common.notSpecified')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap className={`w-5 h-5 ${textSecondary}`} />
                    <div>
                      <p className={`text-sm ${textSecondary}`}>{t('profile.specializations')}</p>
                      <p className={textPrimary}>{profile.specializations?.length ? profile.specializations.join(', ') : t('common.notSpecified')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Languages className={`w-5 h-5 ${textSecondary}`} />
                    <div>
                      <p className={`text-sm ${textSecondary}`}>{t('profile.languages')}</p>
                      <p className={textPrimary}>{profile.languages?.length ? profile.languages.join(', ') : t('common.notSpecified')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="account" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className={`w-5 h-5 ${textSecondary}`} />
                <div>
                  <p className={`text-sm ${textSecondary}`}>{t('profile.email')}</p>
                  <p className={textPrimary}>{user?.email}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {user?.email_confirmed_at ? t('profile.emailConfirmed') : t('profile.emailPending')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className={`w-5 h-5 ${textSecondary}`} />
                <div>
                  <p className={`text-sm ${textSecondary}`}>{t('profile.memberSince')}</p>
                  <p className={textPrimary}>
                    {profile.created_at ? formatDate(profile.created_at) : t('profile.dateUnavailable')}
                  </p>
                </div>
              </div>

              {profile.verified_at && (
                <div className="flex items-center gap-3">
                  <Award className={`w-5 h-5 ${textSecondary}`} />
                  <div>
                    <p className={`text-sm ${textSecondary}`}>{t('profile.verifiedOnLabel')}</p>
                    <p className={textPrimary}>
                      {formatDate(profile.verified_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {isEditing && (
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              <X className="w-4 h-4 mr-2" />
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? t('common.saving') : t('common.saveChanges')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

