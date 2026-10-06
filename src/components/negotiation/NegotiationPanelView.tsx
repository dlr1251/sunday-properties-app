import { getIntlLocale } from '../../i18n';
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useMobile } from '../hooks/useMobile';
import { 
  MessageSquare, 
  BarChart3, 
  Clock, 
  Settings,
  Bell,
  TrendingUp, 
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { AdvancedNegotiationPanel } from './negotiation/AdvancedNegotiationPanel';
import { OfferComparisonPanel } from './negotiation/OfferComparisonPanel';
import { NegotiationTimeline } from './negotiation/NegotiationTimeline';
import { NegotiationProgress } from './negotiation/NegotiationProgress';
import { AdvisoryAssistant } from './advisory/AdvisoryAssistant';
import { useNegotiation } from '../hooks/useNegotiation';
import { closeNegotiation } from '../utils/negotiationClosing';
import { toast } from 'sonner';

interface NegotiationPanelViewProps {
  propertyId: string;
  userId: string;
  userRole: 'buyer' | 'seller' | 'agent' | 'lawyer';
}

export const NegotiationPanelView: React.FC<NegotiationPanelViewProps> = ({
  propertyId,
  userId,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState('negotiation');
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [showAdvisory, setShowAdvisory] = useState(false);
  const { isMobile, isTablet } = useMobile();
  
  const {
    offers,
    property,
    negotiationRules,
    loading,
    error,
    createOffer,
    updateOffer,
    rejectOffer,
    acceptOffer,
    createCounterOffer,
    updateNegotiationRules,
    getNegotiationInsights
  } = useNegotiation(propertyId, userId);

  const [insights, setInsights] = useState<any>(null);
  const [acceptingOffer, setAcceptingOffer] = useState<string | null>(null);

  useEffect(() => {
    if (propertyId) {
      getNegotiationInsights().then(setInsights);
    }
  }, [propertyId, getNegotiationInsights]);

  const handleAcceptOffer = async (offerId: string) => {
    if (!property || !offers) return;

    const offer = offers.find(o => o.id === offerId);
    if (!offer) {
      toast.error('Oferta no encontrada');
      return;
    }

    setAcceptingOffer(offerId);

    try {
      const result = await closeNegotiation({
        offerId,
        propertyId,
        buyerId: offer.buyer_id,
        sellerId: property.owner_id,
        finalPrice: offer.offer_price,
        closingDate: offer.closing_date,
        paymentMethod: offer.payment_method,
        conditions: offer.conditions || ''
      });

      if (result.success) {
        toast.success('¡Negociación cerrada exitosamente!');

        // Refresh data
        if (propertyId) {
          getNegotiationInsights().then(setInsights);
        }

        // The offers will be updated via real-time subscription or manual refresh
      } else {
        toast.error(result.message || 'Error al cerrar la negociación');
      }
    } catch (error: any) {
      console.error('Error accepting offer:', error);
      toast.error(error.message || 'Error al aceptar la oferta');
    } finally {
      setAcceptingOffer(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(getIntlLocale(), {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'countered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-muted text-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'countered': return <TrendingUp className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>Error al cargar las negociaciones: {error}</span>
              </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
              <div>
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>Panel de Negociación</h1>
          <p className="text-muted-foreground text-sm">
            {property?.title} - {property?.address}
                </p>
              </div>
        <div className={`flex items-center ${isMobile ? 'justify-between w-full' : 'space-x-2'}`}>
          <Button
            variant="outline"
            size={isMobile ? 'sm' : 'default'}
            onClick={() => setShowAdvisory(!showAdvisory)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {isMobile ? 'IA' : 'Asesoría IA'}
          </Button>
          <Badge variant="secondary">
            {offers?.length || 0} ofertas
          </Badge>
              </div>
            </div>

      {/* Advisory Assistant */}
      {showAdvisory && (
        <Card className="p-6">
          <AdvisoryAssistant
            propertyId={propertyId}
            userId={userId}
            context={{
              type: 'negotiation',
              property: property,
              offers: offers,
              userRole: userRole
            }}
          />
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <TabsTrigger value="negotiation" className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
            <MessageSquare className="w-4 h-4" />
            <span className={isMobile ? 'text-xs' : ''}>Negociación</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
            <BarChart3 className="w-4 h-4" />
            <span className={isMobile ? 'text-xs' : ''}>Comparación</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
            <Clock className="w-4 h-4" />
            <span className={isMobile ? 'text-xs' : ''}>Historial</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
            <TrendingUp className="w-4 h-4" />
            <span className={isMobile ? 'text-xs' : ''}>Progreso</span>
          </TabsTrigger>
        </TabsList>

        {/* Negotiation Tab */}
        <TabsContent value="negotiation" className="space-y-4">
          <AdvancedNegotiationPanel
            propertyId={propertyId}
            userId={userId}
            userRole={userRole}
            offers={offers || []}
            property={property}
            negotiationRules={negotiationRules}
            onOfferUpdate={updateOffer}
            onOfferReject={rejectOffer}
            onOfferAccept={handleAcceptOffer}
            onCounterOffer={createCounterOffer}
            onRulesUpdate={updateNegotiationRules}
            acceptingOffer={acceptingOffer}
          />
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <OfferComparisonPanel
            offers={offers || []}
            property={property}
            onOfferSelect={setSelectedOfferId}
            selectedOfferId={selectedOfferId}
          />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <NegotiationTimeline
            offers={offers || []}
            propertyId={propertyId}
            onOfferSelect={setSelectedOfferId}
          />
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <NegotiationProgress
            offers={offers || []}
            property={property}
            insights={insights}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'}`}>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
            <div>
              <p className="text-sm text-muted-foreground">Ofertas Totales</p>
              <p className="text-2xl font-bold">{offers?.length || 0}</p>
            </div>
              </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aceptadas</p>
              <p className="text-2xl font-bold">
                {offers?.filter(o => o.status === 'accepted').length || 0}
              </p>
          </div>
        </div>
      </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          <div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold">
                {offers?.filter(o => o.status === 'pending').length || 0}
              </p>
          </div>
          </div>
        </Card>

        <Card className="p-4">
              <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            <div>
              <p className="text-sm text-muted-foreground">Progreso Promedio</p>
              <p className="text-2xl font-bold">
                {offers?.length ? 
                  Math.round(offers.reduce((acc, offer) => acc + (offer.negotiationProgress || 0), 0) / offers.length) 
                  : 0}%
              </p>
            </div>
          </div>
        </Card>
        </div>

      {/* Recent Offers List */}
      {offers && offers.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Ofertas Recientes</h3>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
          </Button>
          </div>
          
          <div className="space-y-3">
            {offers.slice(0, 5).map((offer) => (
              <div
                key={offer.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 cursor-pointer"
                onClick={() => setSelectedOfferId(offer.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(offer.status)}
                    <Badge className={getStatusColor(offer.status)}>
                      {offer.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium">{offer.buyerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(offer.offerPrice)} • {offer.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {offer.negotiationProgress || 0}% progreso
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};