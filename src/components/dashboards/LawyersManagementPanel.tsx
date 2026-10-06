import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/utils/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, RefreshCw, Search, Filter, Users, Award, Briefcase, Star, Eye, Edit, Trash2 } from 'lucide-react';
import { useLawyers } from '../../hooks/useLawyers';
import { CreateLawyerInput } from '../../lib/db/repositories/lawyers.repo';
import { useTranslation } from 'react-i18next';

interface LawyersManagementPanelProps {
  isDarkMode?: boolean;
}

export const LawyersManagementPanel: React.FC<LawyersManagementPanelProps> = ({ isDarkMode = false }) => {
  const { t } = useTranslation();
  const {
    lawyers,
    loading,
    error,
    refetch,
    updateLawyer,
    deleteLawyer,
    createLawyer,
    stats
  } = useLawyers();

  const [filters, setFilters] = useState({
    search: '',
    verification_status: 'all' as 'all' | 'unverified' | 'pending' | 'verified' | 'rejected',
    experience_min: '',
    experience_max: ''
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState<CreateLawyerInput>({
    email: '',
    name: '',
    phone: '',
    bio: '',
    company: '',
    license_number: '',
    specializations: [],
    languages: [],
    experience_years: 0,
    verification_status: 'unverified'
  });

  const handleCreateLawyer = async () => {
    const success = await createLawyer(createForm);
    if (success) {
      setShowCreateDialog(false);
      setCreateForm({
        email: '',
        name: '',
        phone: '',
        bio: '',
        company: '',
        license_number: '',
        specializations: [],
        languages: [],
        experience_years: 0,
        verification_status: 'unverified'
      });
    }
  };

  const filteredLawyers = lawyers.filter(lawyer => {
    if (filters.search && !lawyer.name?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !lawyer.email?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !lawyer.company?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.verification_status !== 'all' && lawyer.verification_status !== filters.verification_status) {
      return false;
    }
    if (filters.experience_min && lawyer.experience_years && lawyer.experience_years < parseInt(filters.experience_min)) {
      return false;
    }
    if (filters.experience_max && lawyer.experience_years && lawyer.experience_years > parseInt(filters.experience_max)) {
      return false;
    }
    return true;
  });

  const textClasses = isDarkMode ? "text-gray-300" : "text-gray-900";
  const subTextClasses = isDarkMode ? "text-gray-400" : "text-gray-500";
  const cardClasses = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${textClasses}`}>{t('admin.manageLawyersTitle')}</h2>
          <p className={subTextClasses}>{t('admin.manageLawyersDescription')}</p>
        </div>

        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Award className="h-4 w-4 mr-2" />
          {t('admin.addLawyer')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${subTextClasses}`}>{t('admin.totalLawyers')}</p>
                <p className={`text-2xl font-bold ${textClasses}`}>{stats?.total || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${subTextClasses}`}>{t('admin.verifiedCount')}</p>
                <p className={`text-2xl font-bold ${textClasses}`}>{stats?.verified || 0}</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${subTextClasses}`}>{t('admin.activeCases')}</p>
                <p className={`text-2xl font-bold ${textClasses}`}>{stats?.active_cases || 0}</p>
              </div>
              <Briefcase className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${subTextClasses}`}>{t('admin.averageRating')}</p>
                <p className={`text-2xl font-bold ${textClasses}`}>{stats?.average_rating?.toFixed(1) || '0.0'}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className={cardClasses}>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${subTextClasses}`} />
                <Input
                  placeholder={t('admin.searchNameEmailCompany')}
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className={`pl-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}`}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Select
                value={filters.verification_status}
                onValueChange={(value) => setFilters({ ...filters, verification_status: value as any })}
              >
                <SelectTrigger className={`w-40 ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`}>
                  <SelectValue placeholder={t('properties.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.allStatuses')}</SelectItem>
                  <SelectItem value="unverified">{t('admin.status.unverified')}</SelectItem>
                  <SelectItem value="pending">{t('admin.status.pending')}</SelectItem>
                  <SelectItem value="verified">{t('admin.status.verified')}</SelectItem>
                  <SelectItem value="rejected">{t('admin.status.rejected')}</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder={t('admin.experienceMin')}
                value={filters.experience_min}
                onChange={(e) => setFilters({ ...filters, experience_min: e.target.value })}
                className={`w-24 ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`}
              />

              <Input
                type="number"
                placeholder={t('admin.experienceMax')}
                value={filters.experience_max}
                onChange={(e) => setFilters({ ...filters, experience_max: e.target.value })}
                className={`w-24 ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`}
              />

              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={loading}
                className={isDarkMode ? 'border-gray-600 hover:bg-gray-700' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {t('common.refresh')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lawyers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLawyers.map((lawyer) => (
          <Card key={lawyer.id} className={cardClasses}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={getAvatarUrl(lawyer)} />
                  <AvatarFallback className={isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200'}>
                    {lawyer.name?.charAt(0).toUpperCase() || lawyer.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${textClasses}`}>{lawyer.name || t('common.unnamed')}</h3>
                    <Badge
                      variant={lawyer.verification_status === 'verified' ? 'default' : 'secondary'}
                      className={
                        lawyer.verification_status === 'verified'
                          ? 'bg-green-500'
                          : lawyer.verification_status === 'pending'
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                      }
                    >
                      {t(`admin.status.${lawyer.verification_status === 'verified' ? 'verified' : lawyer.verification_status === 'pending' ? 'pending' : lawyer.verification_status === 'rejected' ? 'rejected' : 'unverified'}`)}
                    </Badge>
                  </div>

                  <p className={`text-sm ${subTextClasses} mb-2`}>{lawyer.email}</p>

                  {lawyer.company && (
                    <p className={`text-sm ${subTextClasses} mb-2`}>{lawyer.company}</p>
                  )}

                  {lawyer.experience_years && (
                    <p className={`text-sm ${subTextClasses} mb-2`}>
                      {t('admin.yearsExperience', { count: lawyer.experience_years })}
                    </p>
                  )}

                  {lawyer.specializations && lawyer.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {lawyer.specializations.slice(0, 3).map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {lawyer.specializations.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{lawyer.specializations.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm">
                      <p className={textClasses}>{lawyer.cases_count || 0} casos</p>
                      <p className={subTextClasses}>{lawyer.active_cases_count || 0} activos</p>
                    </div>

                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLawyer(lawyer.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Lawyer Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className={`max-w-2xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <DialogHeader>
            <DialogTitle className={textClasses}>{t('admin.addNewLawyer')}</DialogTitle>
            <DialogDescription className={subTextClasses}>
              Crea un nuevo perfil de abogado en el sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lawyer-name" className={textClasses}>{t('admin.fullNameRequired')}</Label>
                <Input
                  id="lawyer-name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
                />
              </div>

              <div>
                <Label htmlFor="lawyer-email" className={textClasses}>{t('admin.emailRequired')}</Label>
                <Input
                  id="lawyer-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
                />
              </div>

              <div>
                <Label htmlFor="lawyer-phone" className={textClasses}>{t('profile.phone')}</Label>
                <Input
                  id="lawyer-phone"
                  value={createForm.phone || ''}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
                />
              </div>

              <div>
                <Label htmlFor="lawyer-company" className={textClasses}>{t('admin.company')}</Label>
                <Input
                  id="lawyer-company"
                  value={createForm.company || ''}
                  onChange={(e) => setCreateForm({ ...createForm, company: e.target.value })}
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
                />
              </div>

              <div>
                <Label htmlFor="lawyer-license" className={textClasses}>{t('admin.licenseNumber')}</Label>
                <Input
                  id="lawyer-license"
                  value={createForm.license_number || ''}
                  onChange={(e) => setCreateForm({ ...createForm, license_number: e.target.value })}
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
                />
              </div>

              <div>
                <Label htmlFor="lawyer-experience" className={textClasses}>{t('admin.experienceYears')}</Label>
                <Input
                  id="lawyer-experience"
                  type="number"
                  value={createForm.experience_years || ''}
                  onChange={(e) => setCreateForm({ ...createForm, experience_years: parseInt(e.target.value) || 0 })}
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="lawyer-bio" className={textClasses}>{t('admin.bio')}</Label>
              <Textarea
                id="lawyer-bio"
                value={createForm.bio || ''}
                onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
                className={`min-h-20 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}`}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className={isDarkMode ? 'border-gray-600 hover:bg-gray-700' : ''}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleCreateLawyer}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {t('admin.createLawyer')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
