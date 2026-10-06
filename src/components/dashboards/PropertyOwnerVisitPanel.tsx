import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useVisitManagement } from '../../hooks/useSupabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { formatDate } from '../../utils/format';

interface VisitResponseModalProps {
  visit: any;
  onClose: () => void;
  onRespond: (visitId: string, status: 'confirmed' | 'cancelled') => void;
}

function VisitResponseModal({ visit, onClose, onRespond }: VisitResponseModalProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'confirmed' | 'cancelled'>('confirmed');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onRespond(visit.id, status);
      toast.success(status === 'confirmed' ? t('admin.visitConfirmed') : t('admin.visitCancelled'));
      onClose();
    } catch (error) {
      toast.error(t('admin.visitResponseError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">{t('admin.visitResponseTitle')}</h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">{t('admin.decision')}</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="confirmed"
                  checked={status === 'confirmed'}
                  onChange={(e) => setStatus(e.target.value as 'confirmed')}
                  className="mr-2"
                />
                {t('common.confirm')}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cancelled"
                  checked={status === 'cancelled'}
                  onChange={(e) => setStatus(e.target.value as 'cancelled')}
                  className="mr-2"
                />
                {t('common.cancel')}
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? t('common.processing') : t('admin.sendResponse')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PropertyOwnerVisitPanel() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pendingVisits, allVisits, loading, respondToVisit, refreshVisits } = useVisitManagement(user?.id);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [showAll, setShowAll] = useState(false);

  // Refresh visits periodically and on focus
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) {
        console.log('Refreshing owner visits on focus');
        refreshVisits();
      }
    };

    window.addEventListener('focus', handleFocus);
    // Also refresh every 30 seconds if tab is active
    const interval = setInterval(() => {
      if (user?.id && document.hasFocus()) {
        refreshVisits();
      }
    }, 30000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [user?.id, refreshVisits]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const visitsToShow = showAll ? allVisits : pendingVisits;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {showAll ? t('admin.allVisitsTitle') : t('admin.pendingVisitRequests')}
              </CardTitle>
              <CardDescription>
                {showAll 
                  ? t('admin.allScheduledVisitsDesc')
                  : t('admin.manageVisitRequestsDesc')}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? t('admin.viewPendingOnly') : t('admin.viewAll')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {visitsToShow.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {showAll 
                  ? t('admin.noScheduledVisits')
                  : t('admin.noPendingVisitRequests')}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {showAll
                  ? t('admin.scheduledVisitsHint')
                  : t('admin.pendingVisitsHint')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visitsToShow.map((visit: any) => {
                const isPending = visit.status === 'pending';
                return (
                <Card key={visit.id} className={`border-l-4 ${isPending ? 'border-l-orange-500' : 'border-l-green-500'} hover:shadow-md transition-shadow`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {visit.visitor?.full_name?.charAt(0).toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">{visit.visitor?.full_name || t('visits.visitor')}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {visit.visitor?.email || t('common.notAvailable')}
                              </span>
                              {visit.visitor?.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {visit.visitor.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {visit.properties?.title || t('visits.property')}
                            </h5>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{visit.properties?.address}, {visit.properties?.city}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(visit.scheduled_date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{visit.scheduled_time}</span>
                              </div>
                            </div>
                          </div>

                          {visit.notes && (
                            <div>
                              <h6 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                {t('admin.visitorMessage')}
                              </h6>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border-l-2 border-gray-200">
                                "{visit.notes}"
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isPending ? (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {t('admin.awaitingResponse')}
                            </Badge>
                          ) : (
                            <Badge variant={visit.status === 'confirmed' ? 'default' : visit.status === 'cancelled' ? 'destructive' : 'secondary'}>
                              {t(`admin.status.${visit.status}`, { defaultValue: visit.status })}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {isPending && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedVisit(visit)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t('admin.respond')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visit Response Modal */}
      {selectedVisit && (
        <VisitResponseModal
          visit={selectedVisit}
          onClose={() => setSelectedVisit(null)}
          onRespond={respondToVisit}
        />
      )}
    </div>
  );
}

export default PropertyOwnerVisitPanel;
