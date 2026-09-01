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
import { Download, RefreshCw, Search, Filter, Users, Home, DollarSign, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import { useAgents } from '../../hooks/useAgents';
import { CreateAgentInput } from '../../lib/db/repositories/agents.repo';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/format';

interface AgentsManagementPanelProps {
  isDarkMode?: boolean;
}

export const AgentsManagementPanel: React.FC<AgentsManagementPanelProps> = ({ isDarkMode = false }) => {
  const { t } = useTranslation();
  const {
    agents,
    loading,
    error,
    refetch,
    updateAgent,
    deleteAgent,
    createAgent,
    stats
  } = useAgents();

  const [filters, setFilters] = useState({
    search: '',
    verification_status: 'all' as 'all' | 'unverified' | 'pending' | 'verified' | 'rejected',
    experience_min: '',
    experience_max: ''
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState<CreateAgentInput>({
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

  const handleCreateAgent = async () => {
    const success = await createAgent(createForm);
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

  const filteredAgents = agents.filter(agent => {
    if (filters.search && !agent.name?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !agent.email?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !agent.company?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.verification_status !== 'all' && agent.verification_status !== filters.verification_status) {
      return false;
    }
    if (filters.experience_min && agent.experience_years && agent.experience_years < parseInt(filters.experience_min)) {
      return false;
    }
    if (filters.experience_max && agent.experience_years && agent.experience_years > parseInt(filters.experience_max)) {
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
          <h2 className={`text-2xl font-bold ${textClasses}`}>{t('admin.manageAgentsTitle')}</h2>
          <p className={subTextClasses}>{t('admin.manageAgentsDescription')}</p>
        </div>

        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Home className="h-4 w-4 mr-2" />
          {t('admin.addAgent')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${subTextClasses}`}>{t('admin.totalAgents')}</p>
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
                <p className={`text-sm ${subTextClasses}`}>{t('admin.activeProperties')}</p>
                <p className={`text-2xl font-bold ${textClasses}`}>{stats?.active_properties || 0}</p>
              </div>
              <Home className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${subTextClasses}`}>{t('admin.soldProperties')}</p>
                <p className={`text-2xl font-bold ${textClasses}`}>{stats?.sold_properties || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${subTextClasses}`}>{t('admin.totalSalesValue')}</p>
                <p className={`text-2xl font-bold ${textClasses}`}>
                  {formatCurrency(stats?.total_sales_value || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
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

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className={cardClasses}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={getAvatarUrl(agent)} />
                  <AvatarFallback className={isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200'}>
                    {agent.name?.charAt(0).toUpperCase() || agent.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${textClasses}`}>{agent.name || t('common.unnamed')}</h3>
                    <Badge
                      variant={agent.verification_status === 'verified' ? 'default' : 'secondary'}
                      className={
                        agent.verification_status === 'verified'
                          ? 'bg-green-500'
                          : agent.verification_status === 'pending'
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                      }
                    >
                      {t(`admin.status.${agent.verification_status === 'verified' ? 'verified' : agent.verification_status === 'pending' ? 'pending' : agent.verification_status === 'rejected' ? 'rejected' : 'unverified'}`)}
                    </Badge>
                  </div>

                  <p className={`text-sm ${subTextClasses} mb-2`}>{agent.email}</p>

                  {agent.company && (
                    <p className={`text-sm ${subTextClasses} mb-2`}>{agent.company}</p>
                  )}

                  {agent.experience_years && (
                    <p className={`text-sm ${subTextClasses} mb-2`}>
                      {t('admin.yearsExperience', { count: agent.experience_years })}
                    </p>
                  )}

                  {agent.specializations && agent.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {agent.specializations.slice(0, 3).map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {agent.specializations.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{agent.specializations.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm">
                      <p className={textClasses}>{t('admin.propertiesCountShort', { count: agent.properties_count || 0 })}</p>
                      <p className={subTextClasses}>{t('admin.activeCountShort', { count: agent.active_properties_count || 0 })}</p>
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
                        onClick={() => deleteAgent(agent.id)}
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

      {/* Create Agent Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className={`max-w-2xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <DialogHeader>
            <DialogTitle className={textClasses}>{t('admin.addNewAgent')}</DialogTitle>
            <DialogDescription className={subTextClasses}>
              Crea un nuevo perfil de agente inmobiliario en el sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="agent-name" className={textClasses}>{t('admin.fullNameRequired')}</Label>
                <Input
                  id="agent-name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
                />
              </div>

              <div>
                <Label htmlFor="agent-email" className={textClasses}>{t('admin.emailRequired')}</Label>
                <Input
                  id="agent-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
                />
              </div>

              <div>
                <Label htmlFor="agent-phone" className={textClasses}>{t('profile.phone')}</Label>
                <Input
                  id="agent-phone"
                  value={createForm.phone || ''}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
                />
              </div>

              <div>
                <Label htmlFor="agent-company" className={textClasses}>{t('admin.company')}</Label>
                <Input
                  id="agent-company"
                  value={createForm.company || ''}
                  onChange={(e) => setCreateForm({ ...createForm, company: e.target.value })}
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
                />
              </div>

              <div>
                <Label htmlFor="agent-license" className={textClasses}>{t('admin.licenseNumber')}</Label>
                <Input
                  id="agent-license"
                  value={createForm.license_number || ''}
                  onChange={(e) => setCreateForm({ ...createForm, license_number: e.target.value })}
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
                />
              </div>

              <div>
                <Label htmlFor="agent-experience" className={textClasses}>{t('admin.experienceYears')}</Label>
                <Input
                  id="agent-experience"
                  type="number"
                  value={createForm.experience_years || ''}
                  onChange={(e) => setCreateForm({ ...createForm, experience_years: parseInt(e.target.value) || 0 })}
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="agent-bio" className={textClasses}>{t('admin.bio')}</Label>
              <Textarea
                id="agent-bio"
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
                onClick={handleCreateAgent}
                className="bg-green-600 hover:bg-green-700"
              >
                {t('admin.createAgent')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
