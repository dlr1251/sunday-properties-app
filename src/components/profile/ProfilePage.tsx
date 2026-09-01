import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useVerification } from '../../hooks/verification/useVerification';
import { useSignOutWithRedirect } from '../../utils/auth';
import { useUserProperties, useUserVisits, useUserOffers, useUserNotifications } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/utils/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, MapPin, DollarSign, Building2, User, Phone, Mail, Shield, Edit3, Save, X, LogOut, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate } from '../../utils/format';

interface ProfileFormData {
  full_name: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
  date_of_birth: string;
  nationality: string;
}

interface PreferencesData {
  language: string;
  currency: string;
  timezone: string;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
}

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const { verificationStatus } = useVerification();
  const { signOutAndRedirect } = useSignOutWithRedirect();
  const navigate = useNavigate();
  const [profileLoadAttempts, setProfileLoadAttempts] = useState(0);
  const [showProfileError, setShowProfileError] = useState(false);

  // Only fetch data when user AND profile are fully loaded
  const userIdForData = user?.id && profile?.id ? user.id : undefined;

  const { properties, loading: propertiesLoading, error: propertiesError } = useUserProperties(userIdForData);
  const { visits, loading: visitsLoading } = useUserVisits(userIdForData);
  const { offers, loading: offersLoading } = useUserOffers(userIdForData);
  const { notifications, loading: notificationsLoading } = useUserNotifications(userIdForData);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    date_of_birth: '',
    nationality: '',
  });

  const [preferencesData, setPreferencesData] = useState<PreferencesData>({
    language: 'es',
    currency: 'COP',
    timezone: 'America/Bogota',
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        date_of_birth: profile.date_of_birth || '',
        nationality: profile.nationality || '',
      });
    }
  }, [profile]);

  // Force profile refresh if user exists but profile doesn't
  useEffect(() => {
    if (user && !profile && !loading) {
      setProfileLoadAttempts(prev => prev + 1);
      refreshProfile();
    }
  }, [user, profile, loading, refreshProfile]);

  // Timeout for profile loading - show error after 10 seconds and 3 attempts
  useEffect(() => {
    if (user && !profile && !loading && profileLoadAttempts > 0) {
      const timeout = setTimeout(() => {
        if (!profile && profileLoadAttempts >= 3) {
          console.error('🧪 ProfilePage: Profile failed to load after multiple attempts');
          setShowProfileError(true);
        } else if (!profile) {
          refreshProfile();
          setProfileLoadAttempts(prev => prev + 1);
        }
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [user, profile, loading, profileLoadAttempts, refreshProfile]);

  // Show error state if profile failed to load
  if (showProfileError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">{t('profile.loadErrorTitle')}</h2>
          <p className="text-slate-600 mb-4">
            {t('profile.loadErrorDescription')}
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => {
                setShowProfileError(false);
                setProfileLoadAttempts(0);
                refreshProfile();
              }}
              className="w-full"
            >
              {t('common.tryAgain')}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/testing-users')}
              className="w-full"
            >
              {t('profile.backToUserSelection')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while auth is loading or profile is not yet loaded
  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">
            {loading ? t('profile.authenticating') : !user ? t('profile.loadingUser') : t('profile.loading')}
          </p>
          <p className="mt-2 text-sm text-slate-500">
{loading ? t('profile.authenticatingHint') :
             !user ? t('profile.settingUpSession') :
             profileLoadAttempts > 0
               ? t('profile.fetchingProfileAttempt', { count: profileLoadAttempts })
               : t('profile.fetchingProfile')}
          </p>
          {profileLoadAttempts > 1 && (
            <p className="mt-2 text-xs text-orange-600">
              {t('profile.takingLonger')}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show login prompt if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">{t('profile.pleaseLogIn')}</p>
        </div>
      </div>
    );
  }

  // Use profile data or create fallback
  const displayProfile = profile || {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    phone: '',
    role: 'user',
    status: 'active',
    verification_status: 'unverified',
    created_at: user.created_at || new Date().toISOString(),
    updated_at: user.updated_at || new Date().toISOString(),
  };

  const handleSave = async () => {
    if (!user?.id) {
      console.error('No user ID available for profile update');
      return;
    }

    try {
      // Clean form data - convert empty strings to null for optional fields
      const cleanData = {
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        bio: formData.bio || null,
        location: formData.location || null,
        website: formData.website || null,
        date_of_birth: formData.date_of_birth || null,
        nationality: formData.nationality || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(cleanData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ ProfilePage: Error updating profile:', error);
        toast.error(t('profile.toasts.profileUpdateError'), {
          description: error.message,
          duration: 5000,
        });
        return;
      }

      // Refresh the profile data in the context
      await refreshProfile();

      setIsEditing(false);

      toast.success(t('profile.toasts.profileUpdatedSuccess'), {
        description: t('profile.toasts.profileUpdatedHint'),
        duration: 4000,
        action: {
          label: t('profile.toasts.viewChanges'),
          onClick: () => {
            // Could scroll to profile section or highlight changes
          },
        },
      });

    } catch (err) {
      console.error('❌ ProfilePage: Exception updating profile:', err);
      toast.error(t('profile.toasts.unexpectedError'), {
        description: t('profile.toasts.unexpectedErrorHint'),
        duration: 5000,
      });
    }
  };

  const handleSavePreferences = async () => {
    if (!user?.id) {
      console.error('No user ID available for preferences update');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          preferences: preferencesData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ ProfilePage: Error updating preferences:', error);
        toast.error(t('profile.toasts.preferencesUpdateError'), {
          description: error.message,
          duration: 5000,
        });
        return;
      }

      // Refresh the profile data in the context
      await refreshProfile();

      toast.success(t('profile.toasts.preferencesUpdated'), {
        description: t('profile.toasts.preferencesSavedHint'),
        duration: 4000,
      });

    } catch (err) {
      console.error('❌ ProfilePage: Exception updating preferences:', err);
      toast.error(t('profile.toasts.unexpectedError'), {
        description: t('profile.toasts.unexpectedErrorHint'),
        duration: 5000,
      });
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        date_of_birth: profile.date_of_birth || '',
        nationality: profile.nationality || '',
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-white to-slate-50 rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-4 ring-slate-200 shadow-lg">
                  <AvatarImage src={getAvatarUrl(displayProfile)} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700">
                    {displayProfile.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {displayProfile.verification_status === 'verified' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-md">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {displayProfile.full_name}
                </h1>
                <p className="text-slate-600">{displayProfile.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={displayProfile.role === 'admin' ? 'default' : 'secondary'}>
                    {t(`profile.roles.${displayProfile.role}`, { defaultValue: displayProfile.role })}
                  </Badge>
                  <Badge variant={displayProfile.verification_status === 'verified' ? 'default' : 'outline'}>
                    {t(`profile.verificationLabels.${displayProfile.verification_status || 'unverified'}`, { defaultValue: displayProfile.verification_status || t('profile.notVerified') })}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    {t('common.save')}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    {t('common.cancel')}
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setIsEditing(true)} size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    {t('profile.editProfile')}
                  </Button>
                  <Button 
                    onClick={() => signOutAndRedirect(signOut, '/testing-users')} 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.signOut')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t('profile.tabOverview')}</TabsTrigger>
            <TabsTrigger value="properties">{t('profile.tabProperties')}</TabsTrigger>
            <TabsTrigger value="activity">{t('profile.tabActivity')}</TabsTrigger>
            <TabsTrigger value="settings">{t('profile.tabSettings')}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Information */}
              <div className="lg:col-span-2">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      {t('profile.profileInformation')}
                    </CardTitle>
                    <CardDescription>
                      {t('profile.profileInformationHint')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="full_name">{t('profile.fullName')}</Label>
                        {isEditing ? (
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-foreground mt-1">{displayProfile.full_name}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">{t('profile.email')}</Label>
                        <p className="text-sm text-foreground mt-1">{displayProfile.email}</p>
                      </div>
                      <div>
                        <Label htmlFor="phone">{t('profile.phone')}</Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-foreground mt-1">{displayProfile.phone || t('profile.notProvided')}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="location">{t('profile.location')}</Label>
                        {isEditing ? (
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder={t('profile.placeholders.location')}
                          />
                        ) : (
                          <p className="text-sm text-foreground mt-1">{displayProfile.location || t('profile.notProvided')}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="role">{t('profile.role')}</Label>
                        <p className="text-sm text-foreground mt-1">{t(`profile.roles.${displayProfile.role}`, { defaultValue: displayProfile.role })}</p>
                      </div>
                      <div>
                        <Label htmlFor="date_of_birth">{t('profile.dateOfBirth')}</Label>
                        {isEditing ? (
                          <Input
                            id="date_of_birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-foreground mt-1">
                            {displayProfile.date_of_birth ?
                              formatDate(displayProfile.date_of_birth) :
                              t('profile.notProvided')
                            }
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="nationality">{t('profile.nationality')}</Label>
                        {isEditing ? (
                          <Input
                            id="nationality"
                            value={formData.nationality}
                            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                            placeholder={t('profile.placeholders.nationality')}
                          />
                        ) : (
                          <p className="text-sm text-foreground mt-1">{displayProfile.nationality || t('profile.notProvided')}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="website">{t('profile.website')}</Label>
                        {isEditing ? (
                          <Input
                            id="website"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder={t('profile.placeholders.website')}
                          />
                        ) : (
                          <p className="text-sm text-foreground mt-1">
                            {displayProfile.website ?
                              <a href={displayProfile.website} target="_blank" rel="noopener noreferrer"
                                 className="text-blue-600 hover:text-blue-800 underline">
                                {displayProfile.website}
                              </a> :
                              t('profile.notProvided')
                            }
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>{t('profile.verificationStatus')}</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {verificationStatus === 'verified' ? (
                            <>
                              <Shield className="h-4 w-4 text-green-600" />
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {t('profile.verified')}
                              </Badge>
                              {profile?.verified_at && (
                                <span className="text-xs text-muted-foreground">
                                  {t('profile.verifiedOn', { date: formatDate(profile.verified_at) })}
                                </span>
                              )}
                            </>
                          ) : verificationStatus === 'pending' ? (
                            <>
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                {t('profile.pendingReview')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {t('profile.submittedForReview')}
                              </span>
                            </>
                          ) : verificationStatus === 'rejected' ? (
                            <>
                              <X className="h-4 w-4 text-red-600" />
                              <Badge variant="destructive">
                                {t('profile.rejected')}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate('/verify-profile')}
                                className="ml-2 text-xs"
                              >
                                {t('profile.editAndResubmit')}
                              </Button>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-slate-600" />
                              <Badge variant="outline">
                                {t('profile.notVerified')}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">{t('profile.bio')}</Label>
                      {isEditing ? (
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm text-foreground mt-1">{displayProfile.bio || t('profile.noBio')}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div>
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>{t('profile.quickStats')}</CardTitle>
                    <CardDescription>{t('profile.activitySummary')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{t('nav.properties')}</span>
                        <span className="text-lg font-semibold">
                          {propertiesLoading ? '...' : properties.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{t('nav.visits')}</span>
                        <span className="text-lg font-semibold">
                          {visitsLoading ? '...' : visits.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{t('negotiations.offers')}</span>
                        <span className="text-lg font-semibold">
                          {offersLoading ? '...' : offers.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{t('dashboard.notifications')}</span>
                        <span className="text-lg font-semibold">
                          {notificationsLoading ? '...' : notifications.filter(n => !n.read).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>{t('profile.quickActions')}</CardTitle>
                    <CardDescription>{t('profile.manageAccountAndProperties')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {verificationStatus !== 'verified' && (
                      <Button
                        onClick={() => navigate('/verify-profile')}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {verificationStatus === 'pending' ? t('profile.verificationInProgress') :
                         verificationStatus === 'rejected' ? t('profile.resubmitVerification') :
                         t('profile.verifyIdentity')}
                      </Button>
                    )}

                    {verificationStatus === 'verified' && (
                      <Button
                        onClick={() => navigate('/upload-property')}
                        className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        {t('profile.uploadProperty')}
                      </Button>
                    )}

                    <Button
                      onClick={() => navigate('/dashboard')}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      {t('profile.viewDashboard')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-slate-900">{t('profile.yourProperties')}</CardTitle>
                <CardDescription>{t('profile.propertiesYouOwn')}</CardDescription>
              </CardHeader>
              <CardContent>
                {propertiesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">{t('profile.loadingProperties')}</p>
                  </div>
                ) : propertiesError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">{t('profile.errorLoadingProperties', { error: propertiesError })}</p>
                  </div>
                ) : properties.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">{t('profile.noPropertiesFound')}</p>
                    <p className="text-sm text-slate-500 mt-2">{t('profile.noPropertiesHint')}</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {properties.map((property) => (
                      <Card key={property.id} className="bg-white hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="aspect-video bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-slate-400" />
                          </div>
                          <h3 className="font-semibold text-lg text-slate-900 mb-2">{property.title}</h3>
                          <p className="text-sm text-slate-600 mb-2">{property.address}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">
                              {property.property_type}
                            </Badge>
                            <span className="font-bold text-lg text-slate-900">
                              {property.price != null ? formatCurrency(property.price) : t('profile.notProvided')}
                            </span>
                          </div>
                          <div className="flex items-center mt-2 text-sm text-slate-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            {property.neighborhood}, {property.city}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-slate-900">{t('profile.recentActivity')}</CardTitle>
                <CardDescription>{t('profile.recentActions')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">{t('profile.noRecentActivity')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Account Information */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-slate-900">{t('profile.accountInfo')}</CardTitle>
                <CardDescription>{t('profile.accountDetails')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>{t('profile.accountStatus')}</Label>
                    <p className="text-sm text-slate-900 mt-1">{t(`profile.accountStatuses.${displayProfile.status}`, { defaultValue: displayProfile.status })}</p>
                  </div>
                  <div>
                    <Label>{t('profile.verificationStatus')}</Label>
                    <p className="text-sm text-slate-900 mt-1">{t(`profile.verificationLabels.${displayProfile.verification_status || 'unverified'}`, { defaultValue: displayProfile.verification_status || t('profile.notVerified') })}</p>
                  </div>
                  <div>
                    <Label>{t('profile.memberSince')}</Label>
                    <p className="text-sm text-slate-900 mt-1">
                      {formatDate(displayProfile.created_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-slate-900">{t('profile.preferences')}</CardTitle>
                <CardDescription>{t('profile.customizeExperience')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Language and Region */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="language">{t('profile.language')}</Label>
                      <Select
                        value={preferencesData.language}
                        onValueChange={(value) => setPreferencesData({ ...preferencesData, language: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('settings.selectLanguage')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="pt">Português</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="currency">{t('profile.currency')}</Label>
                      <Select
                        value={preferencesData.currency}
                        onValueChange={(value) => setPreferencesData({ ...preferencesData, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('profile.selectCurrency')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="COP">{t('profile.currencies.COP')}</SelectItem>
                          <SelectItem value="USD">{t('profile.currencies.USD')}</SelectItem>
                          <SelectItem value="EUR">{t('profile.currencies.EUR')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timezone">{t('profile.timezone')}</Label>
                      <Select
                        value={preferencesData.timezone}
                        onValueChange={(value) => setPreferencesData({ ...preferencesData, timezone: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('profile.selectTimezone')} />
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

                  {/* Notification Settings */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-slate-900">{t('profile.notificationSettings')}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="email_notifications"
                          checked={preferencesData.email_notifications}
                          onCheckedChange={(checked) =>
                            setPreferencesData({ ...preferencesData, email_notifications: checked as boolean })
                          }
                        />
                        <Label htmlFor="email_notifications" className="text-sm">
                          {t('profile.emailNotificationsImportant')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="push_notifications"
                          checked={preferencesData.push_notifications}
                          onCheckedChange={(checked) =>
                            setPreferencesData({ ...preferencesData, push_notifications: checked as boolean })
                          }
                        />
                        <Label htmlFor="push_notifications" className="text-sm">
                          {t('profile.pushNotificationsMessages')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="marketing_emails"
                          checked={preferencesData.marketing_emails}
                          onCheckedChange={(checked) =>
                            setPreferencesData({ ...preferencesData, marketing_emails: checked as boolean })
                          }
                        />
                        <Label htmlFor="marketing_emails" className="text-sm">
                          {t('profile.marketingEmailsPromo')}
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4">
                    <Button onClick={handleSavePreferences} className="w-full md:w-auto">
                      <Save className="h-4 w-4 mr-2" />
                      {t('profile.savePreferences')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};