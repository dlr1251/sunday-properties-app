import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Image as ImageIcon,
  Video,
  MapPin,
  DollarSign,
  Calendar,
  User,
  AlertCircle,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ApprovalChecklist } from '../admin/ApprovalChecklist';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format';

interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  status: 'draft' | 'pending' | 'published' | 'sold' | 'rented' | 'archived' | 'rejected';
  images: string[];
  virtual_tour?: string;
  legal_documents: string[];
  owner_id: string;
  created_at: string;
  owner_profile: {
    full_name?: string;
    email?: string;
  };
}

interface PropertyApprovalPanelProps {
  isDarkMode?: boolean;
}

export const PropertyApprovalPanel: React.FC<PropertyApprovalPanelProps> = ({
  isDarkMode = true
}) => {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'published' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const cardClasses = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputClasses = isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : '';

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          profiles!properties_owner_id_fkey (
            full_name,
            email
          )
        `)
        .in('status', ['pending', 'published', 'rejected'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        toast.error(t('admin.loadPropertiesToast'));
        return;
      }

      const formattedProperties = data?.map(prop => ({
        ...prop,
        owner_profile: prop.profiles || {}
      })) || [];

      setProperties(formattedProperties);
    } catch (err) {
      console.error('Error:', err);
      toast.error(t('admin.unexpectedLoadProperties'));
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(prop => {
    const matchesStatus = filterStatus === 'all' || prop.status === filterStatus;
    const matchesSearch = !searchTerm ||
      prop.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.owner_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.owner_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" className="dark:bg-yellow-900 dark:text-yellow-100">{t('admin.status.pending')}</Badge>;
      case 'published':
        return <Badge variant="success" className="dark:bg-green-900 dark:text-green-100">{t('admin.status.published')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="dark:bg-red-900 dark:text-red-100">{t('admin.rejected')}</Badge>;
      default:
        return <Badge variant="secondary">{t('common.unknown')}</Badge>;
    }
  };

  const handleApprove = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          status: 'published',
          verified: true
        })
        .eq('id', propertyId);

      if (error) {
        console.error('Error approving property:', error);
        toast.error(t('admin.approvePropertyError'));
        return;
      }

      toast.success(t('admin.propertyApprovedPublished'));
      setShowDetailsDialog(false);
      setSelectedProperty(null);
      setReviewNotes('');
      fetchProperties();
    } catch (err) {
      console.error('Error:', err);
      toast.error(t('admin.unexpectedApprove'));
    }
  };

  const handleReject = async (propertyId: string) => {
    if (!reviewNotes.trim()) {
      toast.error(t('admin.rejectReasonRequired'));
      return;
    }

    try {
      const { error } = await supabase
        .from('properties')
        .update({
          status: 'rejected'
        })
        .eq('id', propertyId);

      if (error) {
        console.error('Error rejecting property:', error);
        toast.error(t('admin.rejectPropertyError'));
        return;
      }

      // TODO: Send notification to property owner with rejection reason

      toast.success(t('admin.propertyRejected'));
      setShowDetailsDialog(false);
      setSelectedProperty(null);
      setReviewNotes('');
      fetchProperties();
    } catch (err) {
      console.error('Error:', err);
      toast.error(t('admin.unexpectedRejectRequest'));
    }
  };

  const stats = {
    total: properties.length,
    pending: properties.filter(p => p.status === 'pending').length,
    published: properties.filter(p => p.status === 'published').length,
    rejected: properties.filter(p => p.status === 'rejected').length
  };

  if (loading) {
    return (
      <Card className={cardClasses}>
        <CardContent className="p-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <p className={`text-center mt-4 ${textPrimary}`}>{t('admin.loadingProperties')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className={cardClasses}>
        <CardHeader>
          <CardTitle className={textPrimary}>{t('admin.propertyApprovalTitle')}</CardTitle>
          <p className={textSecondary}>{t('admin.propertyApprovalDescription')}</p>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary}`}>{t('admin.total')}</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.total}</p>
              </div>
              <FileText className={`h-8 w-8 ${textSecondary}`} />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary}`}>{t('admin.pendingPlural')}</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary}`}>Aprobadas</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.published}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClasses}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textSecondary}`}>{t('admin.rejectedPlural')}</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className={cardClasses}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${textSecondary}`} />
              <input
                type="text"
                placeholder={t('admin.searchByTitleOwnerEmail')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-md border ${inputClasses}`}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className={`h-4 w-4 ${textSecondary}`} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className={`px-3 py-2 rounded-md border ${inputClasses}`}
              >
                <option value="all">{t('common.all')}</option>
                <option value="pending">{t('admin.pendingPlural')}</option>
                <option value="published">{t('admin.approvedPlural')}</option>
                <option value="rejected">{t('admin.rejectedPlural')}</option>
              </select>

              <Button
                onClick={fetchProperties}
                variant="outline"
                className={isDarkMode ? 'border-gray-600 hover:bg-gray-700' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {t('common.refresh')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties List */}
      <Card className={cardClasses}>
        <CardContent className="p-4">
          <div className="space-y-4">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className={`font-semibold ${textPrimary}`}>{property.title}</h3>
                        <p className={`text-sm ${textSecondary}`}>{property.owner_profile?.full_name || t('common.unnamed')}</p>
                        <p className={`text-sm ${textSecondary}`}>{property.owner_profile?.email}</p>
                      </div>
                      {getStatusBadge(property.status)}
                    </div>

                    <div className={`text-sm ${textSecondary} mt-2 grid grid-cols-2 md:grid-cols-4 gap-4`}>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {property.city}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {formatCurrency(property.price)}
                      </div>
                      <div className="flex items-center">
                        <ImageIcon className="w-4 h-4 mr-1" />
                        {t('admin.photosCount', { count: property.images?.length || 0 })}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(property.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProperty(property);
                        setShowDetailsDialog(true);
                      }}
                      className={isDarkMode ? 'border-gray-600 hover:bg-gray-700' : ''}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {t('admin.review')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredProperties.length === 0 && (
              <div className="text-center py-8">
                <FileText className={`w-12 h-12 mx-auto mb-4 ${textSecondary}`} />
                <p className={textPrimary}>{t('admin.noMatchingProperties')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      {selectedProperty && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className={isDarkMode ? 'bg-gray-800 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto' : 'max-w-4xl max-h-[90vh] overflow-y-auto'}>
            <DialogHeader>
              <DialogTitle className={textPrimary}>
                {t('admin.review')}: {selectedProperty.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Property Info */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold mb-3 ${textPrimary}`}>{t('admin.propertyDetails')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><span className={textSecondary}>{t('admin.recordTitle')}:</span> {selectedProperty.title}</p>
                    <p><span className={textSecondary}>{t('admin.address')}:</span> {selectedProperty.address}</p>
                    <p><span className={textSecondary}>{t('admin.city')}:</span> {selectedProperty.city}</p>
                    <p><span className={textSecondary}>{t('lawyer.price')}</span> {formatCurrency(selectedProperty.price)}</p>
                  </div>
                  <div>
                    <p><span className={textSecondary}>{t('admin.owner')}:</span> {selectedProperty.owner_profile?.full_name || t('common.notAvailable')}</p>
                    <p><span className={textSecondary}>Email:</span> {selectedProperty.owner_profile?.email || t('common.notAvailable')}</p>
                    <p><span className={textSecondary}>{t('admin.requestDate')}:</span> {formatDateTime(selectedProperty.created_at)}</p>
                    <p><span className={textSecondary}>{t('admin.reviewStatus')}:</span> {getStatusBadge(selectedProperty.status)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className={textSecondary}>{t('admin.description')}:</p>
                  <p className={`mt-1 ${textPrimary}`}>{selectedProperty.description}</p>
                </div>
              </div>

              {/* Media */}
              <div>
                <h3 className={`font-semibold mb-3 ${textPrimary}`}>{t('admin.mediaSection')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                    <div className="flex items-center mb-2">
                      <ImageIcon className={`w-5 h-5 mr-2 ${textSecondary}`} />
                      <span className={`text-sm ${textPrimary}`}>{t('admin.photosCount', { count: selectedProperty.images?.length || 0 })}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProperty.images?.slice(0, 6).map((image, index) => (
                        <div key={index} className="aspect-square bg-gray-200 rounded overflow-hidden">
                          <img
                            src={image}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.png';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                    <div className="flex items-center mb-2">
                      <FileText className={`w-5 h-5 mr-2 ${textSecondary}`} />
                      <span className={`text-sm ${textPrimary}`}>{t('admin.legalDocuments')} ({selectedProperty.legal_documents?.length || 0})</span>
                    </div>
                    <div className="space-y-2">
                      {selectedProperty.legal_documents?.map((doc, index) => (
                        <div key={index} className="flex items-center">
                          <FileText className={`w-4 h-4 mr-2 ${textSecondary}`} />
                          <span className={`text-sm ${textPrimary}`}>{doc.split('/').pop()}</span>
                        </div>
                      ))}
                      {(!selectedProperty.legal_documents || selectedProperty.legal_documents.length === 0) && (
                        <p className={`text-sm ${textSecondary}`}>{t('admin.noLegalDocuments')}</p>
                      )}
                    </div>
                  </div>
                </div>

                {selectedProperty.virtual_tour && (
                  <div className={`p-3 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} mt-4`}>
                    <div className="flex items-center">
                      <Video className={`w-5 h-5 mr-2 ${textSecondary}`} />
                      <span className={`text-sm ${textPrimary}`}>{t('admin.virtualTour')}: </span>
                      <a
                        href={selectedProperty.virtual_tour}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 ml-2"
                      >
                        {t('admin.viewTour')}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Review Actions with Checklist */}
              {selectedProperty.status === 'pending' && (
                <ApprovalChecklist
                  property={selectedProperty as any}
                  onApprove={(notes) => {
                    setReviewNotes(notes);
                    handleApprove(selectedProperty.id);
                  }}
                  onReject={(reason) => {
                    setReviewNotes(reason);
                    handleReject(selectedProperty.id);
                  }}
                  isLoading={false}
                />
              )}

              {selectedProperty.status !== 'pending' && (
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${textPrimary}`}>{t('admin.reviewStatus')}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(selectedProperty.status)}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PropertyApprovalPanel;
