import React, { useState } from 'react';
import { NegotiationParticipants } from './NegotiationParticipants';
import { NegotiationProperty } from './NegotiationProperty';
import { NegotiationOffers } from './NegotiationOffers';
import { NegotiationLegalSection } from './NegotiationLegalSection';
import { CollaborativeEditor } from '../editor/CollaborativeEditor';
import { NegotiationHeader } from './NegotiationHeader';
import { NegotiationActions } from './NegotiationActions';
import { NegotiationsSidebar } from './NegotiationsSidebar';
import { generatePromesaCompraventaDraft } from '../../services/grokDraft';
import { exportPromesaDocx } from '../../services/docxExport';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../contexts/AuthContext';
import { useNegotiationPermissions } from '../../hooks/useNegotiationPermissions';
import { useNegotiationData } from '../../hooks/negotiations/useNegotiationData';
import { useNegotiationsListData } from '../../hooks/negotiations/useNegotiationsListData';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { PanelLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate } from '../../utils/format';

export type NegotiationPageProps = {
  negotiationId: string;
};

export const NegotiationPage: React.FC<NegotiationPageProps> = ({ negotiationId }) => {
  console.log('📄 [NegotiationPage] Rendering for negotiation:', negotiationId);

  const { t } = useTranslation();
  const { user } = useAuth();
  const { canEdit } = useNegotiationPermissions(negotiationId);
  const { data: negotiationData, loading: dataLoading, error: dataError } = useNegotiationData(negotiationId);
  const { success, error: showError, info } = useToast();
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [draft, setDraft] = useState<string>('');
  const [showLegalSection, setShowLegalSection] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const {
    buyingNegotiations,
    sellingNegotiations,
    listedNoOffers
  } = useNegotiationsListData(user?.id);

  const formatPrice = formatCurrency;

  const handleGenerate = async () => {
    console.log('🤖 [NegotiationPage] Starting document generation for negotiation:', negotiationId);
    console.log('🔐 [NegotiationPage] User can edit:', canEdit);

    if (!canEdit) {
      console.warn('🚫 [NegotiationPage] Document generation blocked - no edit permissions');
      showError(t('negotiations.noEditPermissionGenerate'));
      return;
    }

    if (!negotiationData) {
      showError(t('negotiations.noNegotiationData'));
      return;
    }

    try {
      setGenerating(true);
      console.log('⏳ [NegotiationPage] Setting generating state to true');

      info(t('negotiations.generatingDraft'));

      // Usar datos reales de la negociación
      const property = negotiationData.property;
      const buyer = negotiationData.buyer;
      const seller = negotiationData.seller;
      const latestOffer = negotiationData.offers?.[0]; // La oferta más reciente

      if (!property || !buyer || !seller) {
        throw new Error(t('negotiations.missingParties'));
      }

      // Preparar el contexto con datos reales
      const context = {
        property: {
          address: property.address || '',
          city: property.city || '',
          area: property.area || 0,
          price: property.price || 0,
          property_type: property.property_type || 'apartment'
        },
        buyer: {
          full_name: buyer.name || buyer.email || t('negotiations.roles.buyer'),
          email: buyer.email || '',
          phone: (buyer as any).phone || undefined,
          id_number: (buyer as any).id_number || undefined
        },
        seller: {
          full_name: seller.name || seller.email || t('negotiations.roles.seller'),
          email: seller.email || '',
          phone: (seller as any).phone || undefined,
          id_number: (seller as any).id_number || undefined
        },
        offer: {
          offer_price: latestOffer?.price || latestOffer?.payload?.price || property.price || 0,
          payment_method: latestOffer?.payment_method || latestOffer?.payload?.paymentMethod || 'cash',
          closing_date: latestOffer?.closing_date || latestOffer?.payload?.closingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          down_payment: latestOffer?.down_payment || latestOffer?.payload?.downPayment,
          conditions: latestOffer?.conditions || latestOffer?.payload?.conditions || []
        },
        lawyer: negotiationData.lawyer ? {
          full_name: negotiationData.lawyer.name || negotiationData.lawyer.email || t('negotiations.roles.lawyer'),
          email: negotiationData.lawyer.email || ''
        } : undefined
      };

      console.log('📋 [NegotiationPage] Document generation context (real data):', context);

      const text = await generatePromesaCompraventaDraft(context);
      console.log('✅ [NegotiationPage] Document generated successfully, length:', text.length);

      // Guardar documento en negotiation_documents
      const { data: savedDoc, error: saveError } = await supabase
        .from('negotiation_documents')
        .insert({
          negotiation_id: negotiationId,
          kind: 'promesa',
          content: text as any, // Guardar como texto plano inicialmente
          version: 1,
          status: 'draft',
          document_name: t('negotiations.documentName')
        } as any)
        .select()
        .single();

      if (saveError) {
        console.error('⚠️ [NegotiationPage] Failed to save document:', saveError);
        // No fallar si no se puede guardar, pero seguir con el draft
      } else if (savedDoc) {
        const doc = savedDoc as any;
        console.log('✅ [NegotiationPage] Document saved to database:', doc.id);
      }

      success(t('negotiations.draftGenerated'));
      setDraft(text);
      console.log('📄 [NegotiationPage] Draft text set in component state');
    } catch (err: any) {
      console.error('💥 [NegotiationPage] Document generation failed:', err);
      console.error('📋 [NegotiationPage] Error details:', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        stack: err?.stack
      });
      showError(t('negotiations.generateError', { message: err?.message || t('negotiations.unknownError') }));
    } finally {
      setGenerating(false);
      console.log('⏹️ [NegotiationPage] Setting generating state to false');
    }
  };

  const handleExportDocx = async () => {
    console.log('📄 [NegotiationPage] Starting DOCX export for negotiation:', negotiationId);
    console.log('🔐 [NegotiationPage] User can edit:', canEdit);

    if (!canEdit) {
      console.warn('🚫 [NegotiationPage] DOCX export blocked - no edit permissions');
      showError(t('negotiations.noEditPermissionExport'));
      return;
    }

    if (!negotiationData) {
      showError(t('negotiations.noNegotiationData'));
      return;
    }

    try {
      setExporting(true);
      console.log('⏳ [NegotiationPage] Setting exporting state to true');

      info(t('negotiations.exportingDocx'));

      // Usar datos reales de la negociación
      const property = negotiationData.property;
      const buyer = negotiationData.buyer;
      const seller = negotiationData.seller;
      const latestOffer = negotiationData.offers?.[0]; // La oferta más reciente

      if (!property || !buyer || !seller) {
        throw new Error(t('negotiations.missingParties'));
      }

      const offerPrice = latestOffer?.price || latestOffer?.payload?.price || property.price || 0;
      const closingDate = latestOffer?.closing_date || latestOffer?.payload?.closingDate 
        ? formatDate(latestOffer.closing_date || latestOffer.payload?.closingDate)
        : formatDate(new Date());

      const templateData = {
        seller_name: seller.name || seller.email || t('negotiations.roles.seller'),
        buyer_name: buyer.name || buyer.email || t('negotiations.roles.buyer'),
        property_address: property.address || '',
        city: property.city || '',
        price: formatCurrency(offerPrice),
        closing_date: closingDate
      };

      console.log('📋 [NegotiationPage] DOCX template data (real data):', templateData);

      await exportPromesaDocx(templateData);
      console.log('✅ [NegotiationPage] DOCX export completed successfully');

      success(t('negotiations.exported'));
    } catch (err: any) {
      console.error('💥 [NegotiationPage] DOCX export failed:', err);
      console.error('📋 [NegotiationPage] Error details:', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        stack: err?.stack
      });
      showError(t('negotiations.exportError', { message: err?.message || t('negotiations.unknownError') }));
    } finally {
      setExporting(false);
      console.log('⏹️ [NegotiationPage] Setting exporting state to false');
    }
  };
  // Loading state
  if (dataLoading) {
    return (
      <div className="w-full min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('negotiations.loadingDetail')}</h1>
          <p className="text-muted-foreground">{t('negotiations.loadingDetailSubtitle')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (dataError || !negotiationData) {
    return (
      <div className="w-full min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('negotiations.loadError')}</h1>
          <p className="text-muted-foreground">{dataError || t('negotiations.loadErrorSubtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-row min-h-0 w-full">
      {/* Misma barra de negociaciones que en la lista */}
      {sidebarOpen && (
        <NegotiationsSidebar
          buyingNegotiations={buyingNegotiations}
          sellingNegotiations={sellingNegotiations}
          listedNoOffers={listedNoOffers}
          onClose={() => setSidebarOpen(false)}
          selectedPropertyId={selectedPropertyId}
          onSelectProperty={setSelectedPropertyId}
          currentNegotiationId={negotiationId}
          formatPrice={formatPrice}
        />
      )}

      {/* Contenido de la negociación */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-auto bg-muted/30">
        {/* Header con fondo blanco + botón Lista cuando sidebar cerrado */}
        <div className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 flex items-center justify-between gap-4">
            {!sidebarOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="shrink-0"
                aria-label={t('negotiations.showList')}
              >
                <PanelLeft className="h-4 w-4 mr-2" />
                {t('common.list')}
              </Button>
            )}
            <div className="flex-1 min-w-0">
              <NegotiationHeader
                negotiationId={negotiationId}
                title={negotiationData.title}
                createdAt={negotiationData.created_at}
                updatedAt={negotiationData.updated_at}
                currentPrice={negotiationData.current_price}
                property={negotiationData.property ? {
                  id: negotiationData.property.id,
                  title: negotiationData.property.title,
                  images: negotiationData.property.images,
                  price: negotiationData.property.price,
                  neighborhood: negotiationData.property.neighborhood,
                  city: negotiationData.property.city
                } : null}
              />
            </div>
          </div>
        </div>

        {/* Contenido principal - maximizado */}
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 flex-1">
        {/* Partes involucradas siempre arriba, ancho completo */}
        <div className="mb-6">
          <NegotiationParticipants
            buyer={negotiationData.buyer}
            seller={negotiationData.seller}
            lawyer={negotiationData.lawyer}
            agent={negotiationData.agent}
            currentUserId={user?.id}
          />
        </div>

        {/* Grid: propiedad (sidebar en xl) + ofertas/acciones */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
          {/* Columna izquierda en xl: solo propiedad */}
          {user?.id !== negotiationData.seller_id && (
            <div className="xl:col-span-4 xl:order-1 order-2">
              <NegotiationProperty property={negotiationData.property} />
            </div>
          )}

          {/* Columna derecha - Ofertas y Acciones */}
          <div className={`space-y-6 ${user?.id !== negotiationData.seller_id ? 'xl:col-span-8' : 'xl:col-span-12'} order-1`}>
            {/* Sección de ofertas - Maximizada */}
            <NegotiationOffers
              offers={negotiationData.offers}
              participants={{
                buyer: negotiationData.buyer,
                seller: negotiationData.seller,
                lawyer: negotiationData.lawyer,
                agent: negotiationData.agent
              }}
              property={negotiationData.property}
              currentUserId={user?.id}
            />

          </div>
        </div>

        {/* Sección legal (condicional) - Full width */}
        {showLegalSection && (
          <div className="mb-8">
            <NegotiationLegalSection
              negotiationId={negotiationId}
              buyer={negotiationData.buyer}
              seller={negotiationData.seller}
              lawyer={negotiationData.lawyer}
              agent={negotiationData.agent}
              documents={negotiationData.documents}
            />
          </div>
        )}

        {/* Toggle: Acciones y documento de promesa (colapsado por defecto) */}
        <details className="group mb-8 rounded-xl border border-border bg-card shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-left font-medium text-muted-foreground hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl [&::-webkit-details-marker]:hidden">
            <span>{t('negotiations.legalDocsTitle')}</span>
            <svg className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="border-t border-border space-y-6 p-4">
            <NegotiationActions
              canEdit={canEdit}
              generating={generating}
              exporting={exporting}
              showLegalSection={showLegalSection}
              onGenerate={handleGenerate}
              onExport={handleExportDocx}
              onToggleLegal={() => setShowLegalSection(!showLegalSection)}
            />
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">{t('negotiations.promiseContract')}</h3>
              <CollaborativeEditor 
                negotiationId={negotiationId} 
                docKey={`neg-${negotiationId}-promise`}
                initialContent={draft || undefined}
              />
            </div>
          </div>
        </details>
        </div>
      </div>
    </div>
  );
};

export default NegotiationPage;


