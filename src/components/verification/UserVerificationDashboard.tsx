import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Eye,
  RefreshCw,
  Send,
  AlertTriangle
} from 'lucide-react';
import { useUserVerification } from '../../hooks/verification/useUserVerification';
import { VerificationWizard } from './VerificationWizard';
import { storageService } from '../../services/storageService';
import { toast } from 'sonner';
import { formatDateTime } from '../../utils/format';

export const UserVerificationDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { status, loading, error, refetch } = useUserVerification();
  const [showWizard, setShowWizard] = useState(false);

  const statusConfig = {
    none: { label: t('verification.dashboard.statusNone'), color: 'bg-gray-100 text-gray-800', icon: AlertTriangle },
    pending: { label: t('verification.dashboard.statusPending'), color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { label: t('verification.dashboard.statusApproved'), color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: t('verification.dashboard.statusRejected'), color: 'bg-red-100 text-red-800', icon: XCircle },
  };

  const handleViewDocument = async (path: string, fileName: string) => {
    try {
      const signedUrl = await storageService.getSignedUrl('profile-docs', path);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        toast.error(t('verification.dashboard.documentAccessError'));
      }
    } catch (error) {
      toast.error(t('verification.dashboard.documentError'));
    }
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('verification.dashboard.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto border-red-200">
        <CardContent className="p-6">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">{t('common.error')}</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.tryAgain')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('verification.dashboard.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {React.createElement(statusConfig[status.status].icon, {
                className: "h-8 w-8"
              })}
              <div>
                <h3 className="text-lg font-semibold">
                  {statusConfig[status.status].label}
                </h3>
                <p className="text-gray-600">
                  {status.hasRequest
                    ? t('verification.dashboard.submittedAt', { date: status.lastUpdated ? formatDateTime(status.lastUpdated) : '' })
                    : t('verification.dashboard.noRequest')
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={refetch} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('common.refresh')}
              </Button>

              {status.canSubmitNew && (
                <Button onClick={() => setShowWizard(true)}>
                  <Send className="h-4 w-4 mr-2" />
                  {status.hasRequest ? t('verification.dashboard.newRequest') : t('verification.dashboard.requestVerification')}
                </Button>
              )}
            </div>
          </div>

          {status.request?.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>{t('verification.dashboard.reviewerNotes')}</strong> {status.request.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Details */}
      {status.hasRequest && status.request && (
        <Card>
          <CardHeader>
            <CardTitle>{t('verification.dashboard.requestDetails')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="info" className="w-full">
              <TabsList>
                <TabsTrigger value="info">{t('verification.dashboard.info')}</TabsTrigger>
                <TabsTrigger value="documents">{t('verification.dashboard.documents')}</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('verification.dashboard.status')}</label>
                    <div className="mt-1">
                      <Badge className={statusConfig[status.request.status].color}>
                        {statusConfig[status.request.status].label}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('verification.dashboard.submittedDate')}</label>
                    <p className="mt-1">{formatDateTime(status.request.created_at)}</p>
                  </div>

                  {status.request.reviewed_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">{t('verification.dashboard.reviewedDate')}</label>
                      <p className="mt-1">{formatDateTime(status.request.reviewed_at)}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('verification.dashboard.userType')}</label>
                    <p className="mt-1">
                      {status.request.is_owner ? t('verification.dashboard.owner') : t('verification.dashboard.intermediary')}
                    </p>
                  </div>
                </div>

                {status.request.data && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">{t('verification.dashboard.personalInfo')}</label>
                    <div className="mt-2 space-y-2">
                      {status.request.data.phone && (
                        <p><strong>{t('verification.dashboard.phone')}</strong> {status.request.data.phone}</p>
                      )}
                      {status.request.data.location && (
                        <p><strong>{t('verification.dashboard.location')}</strong> {status.request.data.location}</p>
                      )}
                      {status.request.data.date_of_birth && (
                        <p><strong>{t('verification.dashboard.dateOfBirth')}</strong> {status.request.data.date_of_birth}</p>
                      )}
                      {status.request.data.nationality && (
                        <p><strong>{t('verification.dashboard.nationality')}</strong> {status.request.data.nationality}</p>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div className="space-y-3">
                  {status.request.selfie_path && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{t('verification.dashboard.facePhoto')}</p>
                          <p className="text-sm text-gray-500">{t('verification.dashboard.imageUploaded')}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(status.request!.selfie_path!, t('verification.dashboard.facePhoto'))}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('verification.dashboard.view')}
                      </Button>
                    </div>
                  )}

                  {status.request.id_doc_path && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">{t('verification.dashboard.idCard')}</p>
                          <p className="text-sm text-gray-500">{t('verification.dashboard.idDocument')}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(status.request!.id_doc_path!, t('verification.dashboard.idCard'))}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('verification.dashboard.view')}
                      </Button>
                    </div>
                  )}

                  {status.request.poa_doc_path && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">{t('verification.dashboard.poa')}</p>
                          <p className="text-sm text-gray-500">{t('verification.dashboard.legalDocument')}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(status.request!.poa_doc_path!, t('verification.dashboard.poa'))}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('verification.dashboard.view')}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Verification Wizard Modal */}
      {showWizard && (
        <VerificationWizard
          onComplete={() => {
            setShowWizard(false);
            refetch(); // Refresh status after submission
            toast.success(t('verification.dashboard.submittedSuccess'));
          }}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </div>
  );
};
