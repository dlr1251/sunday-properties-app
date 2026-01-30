import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Visit, VisitStatus } from '../../../lib/db/repositories/visits.repo';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Eye, 
  X, 
  RotateCcw, 
  MessageSquare 
} from 'lucide-react';

interface VisitsTableProps {
  visits: Visit[];
  onViewDetails: (visit: Visit) => void;
  onReject: (visit: Visit) => void;
  onReschedule: (visit: Visit) => void;
  onAddNotes: (visit: Visit) => void;
  onStatusUpdate: (visitId: string, status: VisitStatus, notes?: string, reason?: string) => void;
}

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmada', color: 'bg-blue-500' },
  completed: { label: 'Completada', color: 'bg-green-500' },
  cancelled: { label: 'Cancelada', color: 'bg-red-500' },
  rescheduled: { label: 'Reprogramada', color: 'bg-purple-500' },
};

export const VisitsTable: React.FC<VisitsTableProps> = ({
  visits,
  onViewDetails,
  onReject,
  onReschedule,
  onAddNotes,
  onStatusUpdate
}) => {
  if (visits.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay visitas</h3>
          <p className="text-gray-700">No tienes visitas programadas en este momento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitas ({visits.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propiedad</TableHead>
                <TableHead>Visitante</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{visit.property?.title}</div>
                      <div className="text-sm text-gray-700 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-600" />
                        {visit.property?.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{visit.visitor?.name}</div>
                      <div className="text-sm text-gray-700 flex items-center">
                        <Mail className="w-4 h-4 mr-1 text-gray-600" />
                        {visit.visitor?.email}
                      </div>
                      {visit.visitor?.phone && (
                        <div className="text-sm text-gray-700 flex items-center">
                          <Phone className="w-4 h-4 mr-1 text-gray-600" />
                          {visit.visitor.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-gray-900">{new Date(visit.scheduled_date).toLocaleDateString('es-CO')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-gray-900">{visit.scheduled_time}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusConfig[visit.status].color} text-white`}>
                      {statusConfig[visit.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(visit)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      
                      {visit.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onStatusUpdate(visit.id, 'confirmed')}
                            className="text-green-600 hover:text-green-700"
                          >
                            Confirmar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onReject(visit)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Rechazar
                          </Button>
                        </>
                      )}
                      
                      {visit.status === 'confirmed' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onReschedule(visit)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Reprogramar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onStatusUpdate(visit.id, 'completed')}
                            className="text-green-600 hover:text-green-700"
                          >
                            Completar
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddNotes(visit)}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Notas
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
