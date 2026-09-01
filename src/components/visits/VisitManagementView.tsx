import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { formatCurrency } from '../../utils/format';
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
  const { t } = useTranslation();
  const [visits, setVisits] = useState<Visit[]>(mockVisits);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);

  const getStatusBadge = (status: Visit['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: t('visits.pending') },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: t('visits.confirmed') },
      completed: { color: 'bg-green-100 text-green-800', label: t('visits.completed') },
      cancelled: { color: 'bg-red-100 text-red-800', label: t('visits.cancelled') },
      rescheduled: { color: 'bg-orange-100 text-orange-800', label: t('visits.rescheduled') }
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
              <p className="text-sm text-muted-foreground">{t('visits.visitor')}</p>
              <p className="font-medium">{visit.visitorName}</p>
              <p className="text-sm text-muted-foreground">{visit.visitorPhone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('visits.management.dateAndTime')}</p>
              <p className="font-medium">{visit.scheduledDate}</p>
              <p className="text-sm text-muted-foreground">{visit.scheduledTime}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className={`text-sm ${visit.paid ? 'text-green-600' : 'text-red-600'}`}>
                  {visit.paid ? t('visits.management.paid') : t('visits.management.unpaid')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className={`text-sm ${visit.ndaAccepted ? 'text-green-600' : 'text-red-600'}`}>
                  {visit.ndaAccepted ? t('visits.management.ndaAccepted') : t('visits.management.ndaPending')}
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
                    {t('visits.management.confirm')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(visit.id, 'cancelled')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {t('common.cancel')}
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
                  {t('visits.management.completeVisit')}
                </Button>
              )}

              {visit.status === 'completed' && visit.documentsUnlocked && (
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  {t('visits.management.viewDocuments')}
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
        <h2 className="text-xl font-semibold">{t('visits.management.calendarTitle')}</h2>
        <Button variant="outline">
          <CalendarIcon className="h-4 w-4 mr-2" />
          {t('visits.management.newVisit')}
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
          <h3 className="font-semibold">{t('visits.management.scheduledVisits')}</h3>
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
        <h3 className="text-lg font-semibold mb-4">{t('visits.management.completeVisit')}</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="rating">{t('visits.management.rating')}</Label>
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
            <Label htmlFor="feedback">{t('visits.management.comments')}</Label>
            <Textarea
              id="feedback"
              placeholder={t('visits.management.commentsPlaceholder')}
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
              {t('visits.management.unlockDocs')}
            </Label>
          </div>
        </div>

        <div className="flex space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setShowFeedbackModal(false)}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleFeedbackSubmit}
            className="flex-1"
          >
            {t('visits.management.completeVisit')}
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
            <h1 className="text-xl font-semibold">{t('visits.management.title')}</h1>
            <p className="text-muted-foreground">
              {t('visits.management.subtitle')}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={showCalendar ? 'default' : 'outline'}
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {t('visits.management.calendar')}
            </Button>
            <Button>
              <CalendarIcon className="h-4 w-4 mr-2" />
              {t('visits.management.newVisit')}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">{t('visits.management.totalVisits')}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">{t('visits.management.pendingPlural')}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
            <div className="text-sm text-muted-foreground">{t('visits.management.confirmedPlural')}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">{t('visits.management.completedPlural')}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(stats.revenue)}
            </div>
            <div className="text-sm text-muted-foreground">{t('visits.management.revenue')}</div>
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
                    <SelectItem value="all">{t('visits.management.all')}</SelectItem>
                    <SelectItem value="pending">{t('visits.management.pendingPlural')}</SelectItem>
                    <SelectItem value="confirmed">{t('visits.management.confirmedPlural')}</SelectItem>
                    <SelectItem value="completed">{t('visits.management.completedPlural')}</SelectItem>
                    <SelectItem value="cancelled">{t('visits.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input placeholder={t('visits.management.searchVisitor')} className="flex-1 max-w-md" />
                
                <Button variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  {t('visits.management.filterByDate')}
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
