import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOffers } from '../../hooks/useOffers';
import { OffersOverview } from './components/OffersOverview';
import { OffersList } from './components/OffersList';
import { NegotiationMetrics } from './components/NegotiationMetrics';
import { KnowledgeBasePanel } from '../advisory/KnowledgeBasePanel';
import { AdvisoryAssistant } from '../advisory/AdvisoryAssistant';
import { NegotiationRulesConfig } from './NegotiationRulesConfig';
import { SmartOfferForm } from './SmartOfferForm';
import { OfferComparisonPanel } from './OfferComparisonPanel';
import { NegotiationTimeline } from './NegotiationTimeline';
import { NegotiationProgress } from './NegotiationProgress';
import { IntentLetterEditor } from './IntentLetterEditor';
import { CounterOfferDialog } from './CounterOfferDialog';
import { Property, User } from '../../types/database';
import { CreateOfferInput, CounterOfferInput } from '../../lib/validation/offers.schema';

interface AdvancedNegotiationPanelProps {
  propertyId: string;
  currentUser: User;
  property: Property;
  onOfferSubmitted?: (offer: any) => void;
  onOfferAccepted?: (offer: any) => void;
  onCounterOffer?: (offer: any) => void;
}

export const AdvancedNegotiationPanel: React.FC<AdvancedNegotiationPanelProps> = ({
  propertyId,
  currentUser,
  property,
  onOfferSubmitted,
  onOfferAccepted,
  onCounterOffer
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAdvisory, setShowAdvisory] = useState(true);
  const [counterOfferDialog, setCounterOfferDialog] = useState<{
    isOpen: boolean;
    offer: any | null;
  }>({ isOpen: false, offer: null });

  // Use the offers hook
  const {
    offers,
    loading,
    error,
    refetch,
    submitOffer,
    acceptOffer,
    rejectOffer,
    counterOffer,
    stats
  } = useOffers({
    propertyId,
    autoFetch: true
  });

  // Calculate negotiation progress
  const negotiationProgress = offers.length > 0 
    ? Math.min((offers.filter(o => o.status === 'accepted').length / offers.length) * 100, 100)
    : 0;

  const handleSubmitOffer = async (input: CreateOfferInput) => {
    const success = await submitOffer(input);
    if (success) {
      onOfferSubmitted?.(offers[0]); // Pass the latest offer
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    const success = await acceptOffer(offerId);
    if (success) {
      const offer = offers.find(o => o.id === offerId);
      onOfferAccepted?.(offer);
    }
  };

  const handleRejectOffer = async (offerId: string, reason?: string) => {
    const success = await rejectOffer(offerId, reason);
    if (success) {
      // Handle rejection
    }
  };

  const handleCounterOffer = async (input: CounterOfferInput) => {
    const success = await counterOffer(input);
    if (success) {
      const offer = offers.find(o => o.id === input.originalOfferId);
      onCounterOffer?.(offer);
    }
  };

  const handleOpenCounterOffer = (offer: any) => {
    setCounterOfferDialog({ isOpen: true, offer });
  };

  const handleCloseCounterOffer = () => {
    setCounterOfferDialog({ isOpen: false, offer: null });
  };

  // Verificar si property está cargando
  if (!property) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando información de la propiedad...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando ofertas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-foreground mb-2">Error al cargar ofertas</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Advisory Panel Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Panel de Negociación Avanzado</h2>
        <button
          onClick={() => setShowAdvisory(!showAdvisory)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {showAdvisory ? 'Ocultar' : 'Mostrar'} Asistente
        </button>
      </div>

      {/* Advisory Panel */}
      {showAdvisory && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <KnowledgeBasePanel 
            context={{ property, offers, user: currentUser }}
          />
          <AdvisoryAssistant 
            context={{ property, offers, user: currentUser }}
          />
        </div>
      )}

      {/* Negotiation Progress */}
      <NegotiationProgress 
        progress={negotiationProgress}
        totalOffers={offers.length}
        acceptedOffers={offers.filter(o => o.status === 'accepted').length}
      />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="offers">Ofertas</TabsTrigger>
          <TabsTrigger value="timeline">Cronología</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OffersOverview 
            offers={offers}
            property={property}
            onAcceptOffer={handleAcceptOffer}
            onRejectOffer={handleRejectOffer}
            onCounterOffer={handleOpenCounterOffer}
          />
          
          <NegotiationMetrics 
            offers={offers}
            property={property}
            stats={stats}
          />
        </TabsContent>

        <TabsContent value="offers" className="space-y-6">
          <OffersList 
            offers={offers}
            onAcceptOffer={handleAcceptOffer}
            onRejectOffer={handleRejectOffer}
            onCounterOffer={handleOpenCounterOffer}
          />
          
          <OfferComparisonPanel 
            offers={offers}
            property={property}
          />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <NegotiationTimeline 
            offers={offers}
            property={property}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <NegotiationRulesConfig 
            propertyId={propertyId}
            onRulesUpdated={refetch}
          />
        </TabsContent>
      </Tabs>

      {/* Counter Offer Dialog */}
      {counterOfferDialog.isOpen && counterOfferDialog.offer && (
        <CounterOfferDialog
          offer={counterOfferDialog.offer}
          property={property}
          isOpen={counterOfferDialog.isOpen}
          onClose={handleCloseCounterOffer}
          onSubmit={handleCounterOffer}
        />
      )}
    </div>
  );
};