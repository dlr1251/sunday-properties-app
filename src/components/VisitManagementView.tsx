import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Calendar } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getPropertyImage } from '../utils/imageUtils';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  FileText,
  CreditCard,
  Shield,
  Camera,
  Video
} from 'lucide-react';

interface Visit {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyImage: string;
  visitorId: string;
  visitorName: string;
  visitorPhone: string;
  visitorEmail: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  visitPrice: number;
  paid: boolean;
  ndaAccepted: boolean;
  feedback?: string;
  rating?: number;
  notes?: string;
  documentsUnlocked: boolean;
}

const mockVisits: Visit[] = [
  {
    id: '1',
    propertyId: '1',
    propertyTitle: 'Apartamento Moderno en El Poblado',
    propertyAddress: 'Carrera 43A #15-25, El Poblado',
    propertyImage: getPropertyImage(300, 200, 1),
    visitorId: '1',
    visitorName: 'Carlos Mendoza',
    visitorPhone: '+57 300 123 4567',
    visitorEmail: 'carlos@email.com',
    scheduledDate: '2024-01-15',
    scheduledTime: '14:00',
    status: 'confirmed',
    visitPrice: 49000,
    paid: true,
    ndaAccepted: true,
    documentsUnlocked: false
  },
  {
    id: '2',
    propertyId: '2',
    propertyTitle: 'Casa Familiar en Laureles',
    propertyAddress: 'Calle 70 #45-23, Laureles',
    propertyImage: getPropertyImage(300, 200, 1),
    visitorId: '2',
    visitorName: 'Ana García',
    visitorPhone: '+57 310 987 6543',
    visitorEmail: 'ana@email.com',
    scheduledDate: '2024-01-16',
    scheduledTime: '10:00',
    status: 'completed',
    visitPrice: 49000,
    paid: true,
    ndaAccepted: true,
    feedback: 'Excelente propiedad, muy bien ubicada',
    rating: 5,
    notes: 'Interesada en hacer oferta',
    documentsUnlocked: true
  },
  {
    id: '3',
    propertyId: '3',
    propertyTitle: 'Penthouse de Lujo',
    propertyAddress: 'Carrera 48 #25-67, Envigado',
    propertyImage: getPropertyImage(300, 200, 1),
    visitorId: '3',
    visitorName: 'Roberto Silva',
    visitorPhone: '+57 315 456 7890',
    visitorEmail: 'roberto@email.com',
    scheduledDate: '2024-01-17',
    scheduledTime: '16:00',
    status: 'pending',
    visitPrice: 49000,
    paid: false,
    ndaAccepted: false,
    documentsUnlocked: false
  }
];

export const VisitManagementView: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>(mockVisits);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: Visit['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmada' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completada' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelada' },
      rescheduled: { color: 'bg-orange-100 text-orange-800', label: 'Reprogramada' }
    };
    
    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleStatusChange = (visitId: string, newStatus: Visit['status']) => {
    setVisits(prev => prev.map(visit => 
      visit.id === visitId ? { ...visit, status: newStatus } : visit
    ));
  };

  const handleFeedbackSubmit = () => {
    if (selectedVisit) {
      setVisits(prev => prev.map(visit => 
        visit.id === selectedVisit.id 
          ? { ...visit, feedback, rating, status: 'completed' as const }
          : visit
      ));
      setShowFeedbackModal(false);
      setFeedback('');
      setRating(0);
    }
  };

  const VisitCard: React.FC<{ visit: Visit }> = ({ visit }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <img
          src={visit.propertyImage}
          alt={visit.propertyTitle}
          className="w-20 h-20 rounded-lg object-cover"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg">{visit.propertyTitle}</h3>
              <p className="text-muted-foreground text-sm">{visit.propertyAddress}</p>
            </div>
            {getStatusBadge(visit.status)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Visitante</p>
              <p className="font-medium">{visit.visitorName}</p>
              <p className="text-sm text-muted-foreground">{visit.visitorPhone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha y Hora</p>
              <p className="font-medium">{visit.scheduledDate}</p>
              <p className="text-sm text-muted-foreground">{visit.scheduledTime}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className={`text-sm ${visit.paid ? 'text-green-600' : 'text-red-600'}`}>
                  {visit.paid ? 'Pagado' : 'Pendiente'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className={`text-sm ${visit.ndaAccepted ? 'text-green-600' : 'text-red-600'}`}>
                  {visit.ndaAccepted ? 'NDA Aceptado' : 'NDA Pendiente'}
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              {visit.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(visit.id, 'confirmed')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirmar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(visit.id, 'cancelled')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </>
              )}
              
              {visit.status === 'confirmed' && (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedVisit(visit);
                    setShowFeedbackModal(true);
                  }}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Completar Visita
                </Button>
              )}

              {visit.status === 'completed' && visit.documentsUnlocked && (
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Ver Documentos
                </Button>
              )}

              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {visit.feedback && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-medium">{visit.rating}/5</span>
              </div>
              <p className="text-sm text-muted-foreground">{visit.feedback}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  const CalendarView = () => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Calendario de Visitas</h2>
        <Button variant="outline">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Nueva Visita
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Calendar
            mode="single"
            className="rounded-md border"
            disabled={(date) => date < new Date()}
          />
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold">Visitas Programadas</h3>
          {visits.filter(v => v.status === 'confirmed').map(visit => (
            <div key={visit.id} className="p-3 border rounded-lg">
              <p className="font-medium text-sm">{visit.propertyTitle}</p>
              <p className="text-xs text-muted-foreground">{visit.visitorName}</p>
              <p className="text-xs text-muted-foreground">{visit.scheduledTime}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  const FeedbackModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Completar Visita</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="rating">Calificación</Label>
            <div className="flex space-x-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 ${
                    star <= rating ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="feedback">Comentarios</Label>
            <Textarea
              id="feedback"
              placeholder="¿Cómo fue la visita? ¿Algún comentario especial?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="unlock-docs"
              checked={true}
            />
            <Label htmlFor="unlock-docs" className="text-sm">
              Desbloquear documentos privados para el visitante
            </Label>
          </div>
        </div>

        <div className="flex space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setShowFeedbackModal(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleFeedbackSubmit}
            className="flex-1"
          >
            Completar Visita
          </Button>
        </div>
      </Card>
    </div>
  );

  const stats = {
    total: visits.length,
    pending: visits.filter(v => v.status === 'pending').length,
    confirmed: visits.filter(v => v.status === 'confirmed').length,
    completed: visits.filter(v => v.status === 'completed').length,
    revenue: visits.filter(v => v.paid).reduce((sum, v) => sum + v.visitPrice, 0)
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Gestión de Visitas</h1>
            <p className="text-muted-foreground">
              Administra las visitas programadas a tus propiedades
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={showCalendar ? 'default' : 'outline'}
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendario
            </Button>
            <Button>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Nueva Visita
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Visitas</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pendientes</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
            <div className="text-sm text-muted-foreground">Confirmadas</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completadas</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {formatPrice(stats.revenue)}
            </div>
            <div className="text-sm text-muted-foreground">Ingresos</div>
          </Card>
        </div>

        {showCalendar ? (
          <CalendarView />
        ) : (
          <div className="space-y-6">
            {/* Filters */}
            <Card className="p-4">
              <div className="flex items-center space-x-4">
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="confirmed">Confirmadas</SelectItem>
                    <SelectItem value="completed">Completadas</SelectItem>
                    <SelectItem value="cancelled">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input placeholder="Buscar por visitante..." className="flex-1 max-w-md" />
                
                <Button variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Filtrar por Fecha
                </Button>
              </div>
            </Card>

            {/* Visits List */}
            <div className="space-y-4">
              {visits.map((visit) => (
                <VisitCard key={visit.id} visit={visit} />
              ))}
            </div>
          </div>
        )}
      </div>

      {showFeedbackModal && <FeedbackModal />}
    </div>
  );
};
