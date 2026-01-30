import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Visit, VisitStatus } from '../../../lib/db/repositories/visits.repo';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  X, 
  RotateCcw, 
  MessageSquare,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface VisitDetailsDialogProps {
  visit: Visit;
  isOpen: boolean;
  onClose: () => void;
  onReject: () => void;
  onReschedule: () => void;
  onAddNotes: () => void;
  onStatusUpdate: (visitId: string, status: VisitStatus, notes?: string, reason?: string) => void;
}

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmada', color: 'bg-blue-500' },
  completed: { label: 'Completada', color: 'bg-green-500' },
  cancelled: { label: 'Cancelada', color: 'bg-red-500' },
  rescheduled: { label: 'Reprogramada', color: 'bg-purple-500' },
};

export const VisitDetailsDialog: React.FC<VisitDetailsDialogProps> = ({
  visit,
  isOpen,
  onClose,
  onReject,
  onReschedule,
  onAddNotes,
  onStatusUpdate
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalles de la Visita</span>
            <Badge className={`${statusConfig[visit.status].color} text-white`}>
              {statusConfig[visit.status].label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Información de la Propiedad</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="font-medium">{visit.property?.title}</div>
              <div className="text-gray-600 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {visit.property?.address}
              </div>
              <div className="text-gray-600">
                {visit.property?.neighborhood}, {visit.property?.city}
              </div>
            </div>
          </div>

          {/* Visitor Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Información del Visitante</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-600" />
                <span className="font-medium text-gray-900">{visit.visitor?.name}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-600" />
                <span className="text-gray-900">{visit.visitor?.email}</span>
              </div>
              {visit.visitor?.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="text-gray-900">{visit.visitor.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Visit Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Detalles de la Visita</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                <span>Fecha: {new Date(visit.scheduled_date).toLocaleDateString('es-CO')}</span>
              </div>
              <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-600" />
                <span>Hora: {visit.scheduled_time}</span>
              </div>
              <div className="text-sm text-gray-600">
                Precio: ${visit.visit_price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                NDA Aceptado: {visit.nda_accepted ? 'Sí' : 'No'}
              </div>
              {visit.notes && (
                <div className="text-sm text-gray-600">
                  <strong>Notas:</strong> {visit.notes}
                </div>
              )}
              {visit.seller_notes && (
                <div className="text-sm text-gray-600">
                  <strong>Notas del Vendedor:</strong> {visit.seller_notes}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            
            {visit.status === 'pending' && (
              <>
                <Button
                  onClick={() => onStatusUpdate(visit.id, 'confirmed')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Confirmar
                </Button>
                <Button
                  variant="destructive"
                  onClick={onReject}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Rechazar
                </Button>
              </>
            )}
            
            {visit.status === 'confirmed' && (
              <>
                <Button
                  variant="outline"
                  onClick={onReschedule}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reprogramar
                </Button>
                <Button
                  onClick={() => onStatusUpdate(visit.id, 'completed')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Completar
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              onClick={onAddNotes}
              className="text-gray-600 hover:text-gray-700"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Agregar Notas
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
