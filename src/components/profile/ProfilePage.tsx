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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, MapPin, DollarSign, Building2, User, Phone, Mail, Shield, Edit3, Save, X, LogOut, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Profile Load Error</h2>
          <p className="text-slate-600 mb-4">
            We couldn't load your profile information. This might be a temporary issue.
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
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/testing-users')}
              className="w-full"
            >
              Back to User Selection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while auth is loading or profile is not yet loaded
  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">
            {loading ? 'Authenticating...' : !user ? 'Loading user...' : 'Loading profile...'}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {loading ? 'Please wait while we verify your login' :
             !user ? 'Setting up your session' :
             `Fetching your profile information${profileLoadAttempts > 0 ? ` (attempt ${profileLoadAttempts})` : ''}`}
          </p>
          {profileLoadAttempts > 1 && (
            <p className="mt-2 text-xs text-orange-600">
              Taking longer than expected... Please wait.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show login prompt if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Please log in to view your profile</p>
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
        toast.error('Failed to update profile', {
          description: error.message,
          duration: 5000,
        });
        return;
      }

      // Refresh the profile data in the context
      await refreshProfile();

      setIsEditing(false);

      toast.success('Profile updated successfully!', {
        description: 'Your profile information has been saved.',
        duration: 4000,
        action: {
          label: 'View Changes',
          onClick: () => {
            // Could scroll to profile section or highlight changes
          },
        },
      });

    } catch (err) {
      console.error('❌ ProfilePage: Exception updating profile:', err);
      toast.error('Unexpected error occurred', {
        description: 'Please try again or contact support if the issue persists.',
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
        toast.error('Failed to update preferences', {
          description: error.message,
          duration: 5000,
        });
        return;
      }

      // Refresh the profile data in the context
      await refreshProfile();

      toast.success('Preferences updated successfully!', {
        description: 'Your preferences have been saved.',
        duration: 4000,
      });

    } catch (err) {
      console.error('❌ ProfilePage: Exception updating preferences:', err);
      toast.error('Unexpected error occurred', {
        description: 'Please try again or contact support if the issue persists.',
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-white to-slate-50 rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-4 ring-slate-200 shadow-lg">
                  <AvatarImage src={displayProfile.avatar_url} />
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
                    {displayProfile.role}
                  </Badge>
                  <Badge variant={displayProfile.verification_status === 'verified' ? 'default' : 'outline'}>
                    {displayProfile.verification_status || 'unverified'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setIsEditing(true)} size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    onClick={() => signOutAndRedirect(signOut, '/testing-users')} 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
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
                      Profile Information
                    </CardTitle>
                    <CardDescription>
                      Your personal information and contact details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        {isEditing ? (
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-gray-900 mt-1">{displayProfile.full_name}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <p className="text-sm text-gray-900 mt-1">{displayProfile.email}</p>
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-gray-900 mt-1">{displayProfile.phone || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        {isEditing ? (
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="City, Country"
                          />
                        ) : (
                          <p className="text-sm text-gray-900 mt-1">{displayProfile.location || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <p className="text-sm text-gray-900 mt-1 capitalize">{displayProfile.role}</p>
                      </div>
                      <div>
                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                        {isEditing ? (
                          <Input
                            id="date_of_birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-gray-900 mt-1">
                            {displayProfile.date_of_birth ?
                              format(new Date(displayProfile.date_of_birth), 'MMMM d, yyyy') :
                              'Not provided'
                            }
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="nationality">Nationality</Label>
                        {isEditing ? (
                          <Input
                            id="nationality"
                            value={formData.nationality}
                            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                            placeholder="e.g., Colombian"
                          />
                        ) : (
                          <p className="text-sm text-gray-900 mt-1">{displayProfile.nationality || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        {isEditing ? (
                          <Input
                            id="website"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="https://yourwebsite.com"
                          />
                        ) : (
                          <p className="text-sm text-gray-900 mt-1">
                            {displayProfile.website ?
                              <a href={displayProfile.website} target="_blank" rel="noopener noreferrer"
                                 className="text-blue-600 hover:text-blue-800 underline">
                                {displayProfile.website}
                              </a> :
                              'Not provided'
                            }
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Verification Status</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {verificationStatus === 'verified' ? (
                            <>
                              <Shield className="h-4 w-4 text-green-600" />
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Verified
                              </Badge>
                              {profile?.verified_at && (
                                <span className="text-xs text-gray-500">
                                  Verified on {format(new Date(profile.verified_at), 'MMM dd, yyyy')}
                                </span>
                              )}
                            </>
                          ) : verificationStatus === 'pending' ? (
                            <>
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Pending Review
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Submitted for review
                              </span>
                            </>
                          ) : verificationStatus === 'rejected' ? (
                            <>
                              <X className="h-4 w-4 text-red-600" />
                              <Badge variant="destructive">
                                Rejected
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate('/verify-profile')}
                                className="ml-2 text-xs"
                              >
                                Edit & Re-submit
                              </Button>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-slate-600" />
                              <Badge variant="outline">
                                Not Verified
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      {isEditing ? (
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm text-gray-900 mt-1">{displayProfile.bio || 'No bio provided'}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div>
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                    <CardDescription>Your activity summary</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Properties</span>
                        <span className="text-lg font-semibold">
                          {propertiesLoading ? '...' : properties.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Visits</span>
                        <span className="text-lg font-semibold">
                          {visitsLoading ? '...' : visits.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Offers</span>
                        <span className="text-lg font-semibold">
                          {offersLoading ? '...' : offers.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Notifications</span>
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
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Manage your account and properties</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {verificationStatus !== 'verified' && (
                      <Button
                        onClick={() => navigate('/verify-profile')}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {verificationStatus === 'pending' ? 'Verification in Progress' :
                         verificationStatus === 'rejected' ? 'Re-submit Verification' :
                         'Verify Identity'}
                      </Button>
                    )}

                    {verificationStatus === 'verified' && (
                      <Button
                        onClick={() => navigate('/upload-property')}
                        className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        Upload Property
                      </Button>
                    )}

                    <Button
                      onClick={() => navigate('/dashboard')}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      View Dashboard
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
                <CardTitle className="text-slate-900">Your Properties</CardTitle>
                <CardDescription>Properties you own or manage</CardDescription>
              </CardHeader>
              <CardContent>
                {propertiesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading properties...</p>
                  </div>
                ) : propertiesError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">Error loading properties: {propertiesError}</p>
                  </div>
                ) : properties.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No properties found</p>
                    <p className="text-sm text-slate-500 mt-2">You haven't listed any properties yet.</p>
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
                              ${property.price?.toLocaleString()}
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
                <CardTitle className="text-slate-900">Recent Activity</CardTitle>
                <CardDescription>Your recent actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No recent activity</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Account Information */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-slate-900">Account Information</CardTitle>
                <CardDescription>Your account details and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Account Status</Label>
                    <p className="text-sm text-slate-900 mt-1 capitalize">{displayProfile.status}</p>
                  </div>
                  <div>
                    <Label>Verification Status</Label>
                    <p className="text-sm text-slate-900 mt-1 capitalize">{displayProfile.verification_status || 'unverified'}</p>
                  </div>
                  <div>
                    <Label>Member Since</Label>
                    <p className="text-sm text-slate-900 mt-1">
                      {format(new Date(displayProfile.created_at), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-slate-900">Preferences</CardTitle>
                <CardDescription>Customize your experience and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Language and Region */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={preferencesData.language}
                        onValueChange={(value) => setPreferencesData({ ...preferencesData, language: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="pt">Português</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={preferencesData.currency}
                        onValueChange={(value) => setPreferencesData({ ...preferencesData, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="COP">COP - Colombian Peso</SelectItem>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={preferencesData.timezone}
                        onValueChange={(value) => setPreferencesData({ ...preferencesData, timezone: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Bogota">Bogotá (GMT-5)</SelectItem>
                          <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                          <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                          <SelectItem value="America/Mexico_City">Mexico City (GMT-6)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-slate-900">Notification Settings</h4>
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
                          Email notifications for important updates
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
                          Push notifications for new messages
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
                          Marketing emails and promotional content
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4">
                    <Button onClick={handleSavePreferences} className="w-full md:w-auto">
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
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