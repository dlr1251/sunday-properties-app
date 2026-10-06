import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { getAvatarUrl } from '../../utils/avatar';
import { VisitWithType } from './UserVisitsView';
import { RescheduleDialog } from './components/RescheduleDialog';
import { visitsRepository } from '../../lib/db/repositories/visits.repo';
import { RescheduleVisitInput } from '../../lib/validation/visits.schema';
import { isOk, isErr } from '../../lib/utils/result';
import { toUserMessage } from '../../lib/utils/errors';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  XCircle, 
  RefreshCw, 
  Home,
  AlertCircle,
  FileText,
  Phone,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { useDateFnsLocale } from '../../i18n/useDateFnsLocale';
import { formatCurrency } from '../../utils/format';

interface VisitDetailModalProps {
  visit: VisitWithType | null;
  isOpen: boolean;
  onClose: () => void;
  onVisitUpdated: () => void;
}

const MAX_FREE_RESCHEDULES = 3;
const RESCHEDULE_PAYMENT_AMOUNT = 49000; // COP

export const VisitDetailModal: React.FC<VisitDetailModalProps> = ({
  visit,
  isOpen,
  onClose,
  onVisitUpdated
}) => {
  const { t } = useTranslation();
  const dateLocale = useDateFnsLocale();
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [rescheduleCount, setRescheduleCount] = useState(0);

  useEffect(() => {
    if (visit) {
      // Get reschedule count from visit.reschedule_count if available, otherwise count from notes
      const count = (visit as any).reschedule_count ?? 
        ((visit.notes || '').match(/Reprogramada/g) || []).length;
      setRescheduleCount(count);
    }
  }, [visit]);

  if (!visit) return null;

  const property = visit.property || {};
  const visitor = visit.visitor || {};
  const isReceivedVisit = visit.visitType === 'received';
  const canReschedule = visit.status !== 'cancelled' && visit.status !== 'completed';
  const canCancel = visit.status !== 'cancelled' && visit.status !== 'completed';
  const requiresPayment = rescheduleCount >= MAX_FREE_RESCHEDULES;
  const remainingFreeReschedules = Math.max(0, MAX_FREE_RESCHEDULES - rescheduleCount);

  const scheduledDate = visit.scheduled_date 
    ? format(new Date(visit.scheduled_date), 'EEEE, PPP', { locale: dateLocale })
    : t('visits.dateUnavailable');

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: t('visits.pending'), variant: 'secondary' },
      confirmed: { label: t('visits.confirmed'), variant: 'default' },
      completed: { label: t('visits.completed'), variant: 'default' },
      cancelled: { label: t('visits.cancelled'), variant: 'destructive' },
      rescheduled: { label: t('visits.rescheduled'), variant: 'outline' },
    };
    
    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isTechnicalNotes = (notes: string): boolean => {
    const n = notes.toLowerCase();
    return n.includes('payment id') || n.includes('[payment]') || n.includes('[test payment]');
  };

  const handleCancel = async () => {
    if (!visit) return;

    const confirmed = window.confirm(t('visits.cancelWindowConfirm'));

    if (!confirmed) return;

    setCancelling(true);
    try {
      const result = await visitsRepository.updateVisitStatus(
        visit.id,
        'cancelled',
        t('visits.cancelNotes'),
        t('visits.cancelReason')
      );

      if (isOk(result)) {
        toast.success(t('visits.toast.cancelled'));
        onVisitUpdated();
        onClose();
      } else {
        toast.error(toUserMessage(result.error));
      }
    } catch (error: any) {
      toast.error(t('visits.toast.cancelError'));
      console.error('Error cancelling visit:', error);
    } finally {
      setCancelling(false);
    }
  };

  const handleReschedule = async (input: RescheduleVisitInput) => {
    if (!visit) return;

    try {
      // If requires payment, show payment modal first
      if (requiresPayment) {
        const confirmed = window.confirm(
          t('visits.reschedulePaymentConfirm', {
            max: MAX_FREE_RESCHEDULES,
            amount: formatCurrency(RESCHEDULE_PAYMENT_AMOUNT),
          })
        );

        if (!confirmed) {
          setShowRescheduleDialog(false);
          return;
        }

        // TODO: Integrate payment flow here
        // For now, we'll proceed with reschedule after confirmation
        toast.info(t('visits.toast.paymentComingSoon'));
      }

      const result = await visitsRepository.rescheduleVisit(input);

      if (isOk(result)) {
        toast.success(t('visits.toast.rescheduled'));
        setShowRescheduleDialog(false);
        onVisitUpdated();
        onClose();
      } else {
        toast.error(toUserMessage(result.error));
      }
    } catch (error: any) {
      toast.error(t('visits.toast.rescheduleError'));
      console.error('Error rescheduling visit:', error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-2xl sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('visits.detailsTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('visits.detailsDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              {getStatusBadge(visit.status)}
              {isReceivedVisit ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Home className="h-3 w-3 mr-1" />
                  {t('visits.receivedVisit')}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <User className="h-3 w-3 mr-1" />
                  {t('visits.scheduledVisit')}
                </Badge>
              )}
            </div>

            {/* Visitor - first (for received visits) */}
            {isReceivedVisit && visitor && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('visits.visitor')}
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-4">
                  <Avatar className="h-14 w-14 shrink-0">
                    <AvatarImage src={getAvatarUrl(visitor)} alt={(visitor as any).full_name || (visitor as any).name || visitor.email} />
                    <AvatarFallback className="text-base">
                      {((visitor as any).full_name || (visitor as any).name || visitor.email || '?').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {(visitor as any).full_name || (visitor as any).name || visitor.email || t('visits.visitor')}
                    </p>
                    {visitor.email && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="h-4 w-4 shrink-0" />
                        {visitor.email}
                      </p>
                    )}
                    {visitor.phone && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone className="h-4 w-4 shrink-0" />
                        {visitor.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Property Information */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Home className="h-5 w-5" />
                {t('visits.property')}
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="font-medium text-gray-900">{property.title || t('visits.property')}</p>
                {property.address && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {property.address}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Visit Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">{t('visits.detailsTitle')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">{t('visits.date')}</p>
                    <p className="font-medium">{scheduledDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">{t('visits.time')}</p>
                    <p className="font-medium">{visit.scheduled_time || t('visits.timeUnspecified')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reschedule Information */}
            {rescheduleCount > 0 && (
              <Alert>
                <RefreshCw className="h-4 w-4" />
                <AlertDescription>
                  {t('visits.rescheduledTimes', { count: rescheduleCount })}
                  {remainingFreeReschedules > 0 ? (
                    <span className="block mt-1">
                      {t('visits.freeReschedulesLeft', { count: remainingFreeReschedules })}
                    </span>
                  ) : (
                    <span className="block mt-1 font-semibold text-orange-600">
                      {t('visits.nextReschedulesRequirePayment')}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Notes - ocultar notas técnicas de pagos/sistema */}
            {visit.notes && !isTechnicalNotes(visit.notes) && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('visits.notes')}
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{visit.notes}</p>
                </div>
              </div>
            )}

            {/* Cancellation Warning */}
            {canCancel && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{t('visits.important')}:</strong> {t('visits.cancelNoRefundWarning')}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              {t('common.close')}
            </Button>
            {canReschedule && (
              <Button
                variant="outline"
                onClick={() => setShowRescheduleDialog(true)}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {t('visits.reschedule')}
                {requiresPayment && (
                  <Badge variant="outline" className="ml-1">
                    +{formatCurrency(RESCHEDULE_PAYMENT_AMOUNT)}
                  </Badge>
                )}
              </Button>
            )}
            {canCancel && (
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={cancelling}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                {cancelling ? t('visits.cancelling') : t('visits.cancelVisit')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      {visit && (
        <RescheduleDialog
          visit={visit as any}
          isOpen={showRescheduleDialog}
          onClose={() => setShowRescheduleDialog(false)}
          onReschedule={handleReschedule}
        />
      )}
    </>
  );
};

