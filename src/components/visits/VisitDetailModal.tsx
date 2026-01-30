import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
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
  CreditCard, 
  XCircle, 
  RefreshCw, 
  Home,
  AlertCircle,
  CheckCircle,
  FileText,
  Phone,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
    ? format(new Date(visit.scheduled_date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
    : 'Fecha no disponible';

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Pendiente', variant: 'secondary' },
      confirmed: { label: 'Confirmada', variant: 'default' },
      completed: { label: 'Completada', variant: 'default' },
      cancelled: { label: 'Cancelada', variant: 'destructive' },
      rescheduled: { label: 'Reprogramada', variant: 'outline' },
    };
    
    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleCancel = async () => {
    if (!visit) return;

    const confirmed = window.confirm(
      '¿Estás seguro de que deseas cancelar esta visita?\n\n' +
      '⚠️ IMPORTANTE: No habrá reembolso por cancelaciones.'
    );

    if (!confirmed) return;

    setCancelling(true);
    try {
      const result = await visitsRepository.updateVisitStatus(
        visit.id,
        'cancelled',
        'Visita cancelada por el usuario',
        'Cancelación solicitada por el usuario'
      );

      if (isOk(result)) {
        toast.success('Visita cancelada exitosamente');
        onVisitUpdated();
        onClose();
      } else {
        toast.error(toUserMessage(result.error));
      }
    } catch (error: any) {
      toast.error('Error al cancelar la visita');
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
          `Has alcanzado el límite de ${MAX_FREE_RESCHEDULES} reprogramaciones gratuitas.\n\n` +
          `Para reprogramar esta visita, se requiere un pago adicional de $${RESCHEDULE_PAYMENT_AMOUNT.toLocaleString('es-CO')} COP.\n\n` +
          `¿Deseas continuar con el pago?`
        );

        if (!confirmed) {
          setShowRescheduleDialog(false);
          return;
        }

        // TODO: Integrate payment flow here
        // For now, we'll proceed with reschedule after confirmation
        toast.info('El flujo de pago para reprogramaciones adicionales se implementará próximamente');
      }

      const result = await visitsRepository.rescheduleVisit(input);

      if (isOk(result)) {
        toast.success('Visita reprogramada exitosamente');
        setShowRescheduleDialog(false);
        onVisitUpdated();
        onClose();
      } else {
        toast.error(toUserMessage(result.error));
      }
    } catch (error: any) {
      toast.error('Error al reprogramar la visita');
      console.error('Error rescheduling visit:', error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detalles de la Visita
            </DialogTitle>
            <DialogDescription>
              Información completa sobre esta visita
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              {getStatusBadge(visit.status)}
              {isReceivedVisit ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Home className="h-3 w-3 mr-1" />
                  Visita Recibida
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <User className="h-3 w-3 mr-1" />
                  Visita Programada
                </Badge>
              )}
            </div>

            {/* Property Information */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Home className="h-5 w-5" />
                Propiedad
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="font-medium text-gray-900">{property.title || 'Propiedad'}</p>
                {property.address && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {property.address}
                  </p>
                )}
              </div>
            </div>

            {/* Visitor/Owner Information */}
            {isReceivedVisit && visitor && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Visitante
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="font-medium text-gray-900">
                    {(visitor as any).full_name || (visitor as any).name || visitor.email || 'Visitante'}
                  </p>
                  {visitor.email && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {visitor.email}
                    </p>
                  )}
                  {visitor.phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {visitor.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Visit Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Detalles de la Visita</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Fecha</p>
                    <p className="font-medium">{scheduledDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Hora</p>
                    <p className="font-medium">{visit.scheduled_time || 'No especificada'}</p>
                  </div>
                </div>
                {visit.visit_price && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Precio</p>
                      <p className="font-medium">
                        ${visit.visit_price.toLocaleString('es-CO')} COP
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Estado de Pago</p>
                    <div className="flex items-center gap-2">
                      {visit.paid ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-600">Pagado</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-yellow-600">Pendiente</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reschedule Information */}
            {rescheduleCount > 0 && (
              <Alert>
                <RefreshCw className="h-4 w-4" />
                <AlertDescription>
                  Esta visita ha sido reprogramada {rescheduleCount} vez{rescheduleCount > 1 ? 'es' : ''}.
                  {remainingFreeReschedules > 0 ? (
                    <span className="block mt-1">
                      Te quedan {remainingFreeReschedules} reprogramación{remainingFreeReschedules > 1 ? 'es' : ''} gratuita{remainingFreeReschedules > 1 ? 's' : ''}.
                    </span>
                  ) : (
                    <span className="block mt-1 font-semibold text-orange-600">
                      Las próximas reprogramaciones requerirán un pago adicional.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Notes */}
            {visit.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas
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
                  <strong>Importante:</strong> Si cancelas esta visita, no habrá reembolso del pago realizado.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            {canReschedule && (
              <Button
                variant="outline"
                onClick={() => setShowRescheduleDialog(true)}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reprogramar
                {requiresPayment && (
                  <Badge variant="outline" className="ml-1">
                    +${RESCHEDULE_PAYMENT_AMOUNT.toLocaleString('es-CO')}
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
                {cancelling ? 'Cancelando...' : 'Cancelar Visita'}
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

