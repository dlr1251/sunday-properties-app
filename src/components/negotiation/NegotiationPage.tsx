import React, { useState } from 'react';
import { FinancePanel } from './FinancePanel';
import { NegotiationParticipants } from './NegotiationParticipants';
import { NegotiationProperty } from './NegotiationProperty';
import { NegotiationOffers } from './NegotiationOffers';
import { NegotiationLegalSection } from './NegotiationLegalSection';
import { CollaborativeEditor } from '../editor/CollaborativeEditor';
import { NegotiationHeader } from './NegotiationHeader';
import { NegotiationActions } from './NegotiationActions';
import { generatePromesaCompraventaDraft } from '../../services/grokDraft';
import { exportPromesaDocx } from '../../services/docxExport';
import { useToast } from '../../hooks/useToast';
import { useNegotiationPermissions } from '../../hooks/useNegotiationPermissions';
import { useNegotiationData } from '../../hooks/negotiations/useNegotiationData';
import { supabase } from '../../lib/supabase';

export type NegotiationPageProps = {
  negotiationId: string;
};

export const NegotiationPage: React.FC<NegotiationPageProps> = ({ negotiationId }) => {
  console.log('📄 [NegotiationPage] Rendering for negotiation:', negotiationId);

  const { canEdit } = useNegotiationPermissions(negotiationId);
  const { data: negotiationData, loading: dataLoading, error: dataError } = useNegotiationData(negotiationId);
  const { success, error: showError, info } = useToast();
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [draft, setDraft] = useState<string>('');
  const [showLegalSection, setShowLegalSection] = useState(false);

  const handleGenerate = async () => {
    console.log('🤖 [NegotiationPage] Starting document generation for negotiation:', negotiationId);
    console.log('🔐 [NegotiationPage] User can edit:', canEdit);

    if (!canEdit) {
      console.warn('🚫 [NegotiationPage] Document generation blocked - no edit permissions');
      showError('No tienes permisos para generar documentos en esta negociación');
      return;
    }

    if (!negotiationData) {
      showError('No hay datos de negociación disponibles');
      return;
    }

    try {
      setGenerating(true);
      console.log('⏳ [NegotiationPage] Setting generating state to true');

      info('Generando borrador del documento legal...');

      // Usar datos reales de la negociación
      const property = negotiationData.property;
      const buyer = negotiationData.buyer;
      const seller = negotiationData.seller;
      const latestOffer = negotiationData.offers?.[0]; // La oferta más reciente

      if (!property || !buyer || !seller) {
        throw new Error('Faltan datos necesarios (propiedad, comprador o vendedor)');
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
          full_name: buyer.name || buyer.email || 'Comprador',
          email: buyer.email || '',
          phone: (buyer as any).phone || undefined,
          id_number: (buyer as any).id_number || undefined
        },
        seller: {
          full_name: seller.name || seller.email || 'Vendedor',
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
          full_name: negotiationData.lawyer.name || negotiationData.lawyer.email || 'Abogado',
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
          document_name: 'Promesa de Compraventa'
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

      success('Borrador generado exitosamente');
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
      showError(`Error al generar documento: ${err?.message || 'Error desconocido'}`);
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
      showError('No tienes permisos para exportar documentos en esta negociación');
      return;
    }

    if (!negotiationData) {
      showError('No hay datos de negociación disponibles');
      return;
    }

    try {
      setExporting(true);
      console.log('⏳ [NegotiationPage] Setting exporting state to true');

      info('Exportando documento a DOCX...');

      // Usar datos reales de la negociación
      const property = negotiationData.property;
      const buyer = negotiationData.buyer;
      const seller = negotiationData.seller;
      const latestOffer = negotiationData.offers?.[0]; // La oferta más reciente

      if (!property || !buyer || !seller) {
        throw new Error('Faltan datos necesarios (propiedad, comprador o vendedor)');
      }

      const offerPrice = latestOffer?.price || latestOffer?.payload?.price || property.price || 0;
      const closingDate = latestOffer?.closing_date || latestOffer?.payload?.closingDate 
        ? new Date(latestOffer.closing_date || latestOffer.payload?.closingDate).toLocaleDateString('es-CO')
        : new Date().toLocaleDateString('es-CO');

      const templateData = {
        seller_name: seller.name || seller.email || 'Vendedor',
        buyer_name: buyer.name || buyer.email || 'Comprador',
        property_address: property.address || '',
        city: property.city || '',
        price: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(offerPrice),
        closing_date: closingDate
      };

      console.log('📋 [NegotiationPage] DOCX template data (real data):', templateData);

      await exportPromesaDocx(templateData);
      console.log('✅ [NegotiationPage] DOCX export completed successfully');

      success('Documento exportado exitosamente');
    } catch (err: any) {
      console.error('💥 [NegotiationPage] DOCX export failed:', err);
      console.error('📋 [NegotiationPage] Error details:', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        stack: err?.stack
      });
      showError(`Error al exportar documento: ${err?.message || 'Error desconocido'}`);
    } finally {
      setExporting(false);
      console.log('⏹️ [NegotiationPage] Setting exporting state to false');
    }
  };
  // Loading state
  if (dataLoading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cargando negociación...</h1>
          <p className="text-gray-600">Estamos obteniendo la información de la negociación.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (dataError || !negotiationData) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar negociación</h1>
          <p className="text-gray-600">{dataError || 'No se pudo cargar la información de la negociación.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header con fondo blanco */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
          <NegotiationHeader
            negotiationId={negotiationId}
            title={negotiationData.title}
          />
        </div>
      </div>

      {/* Contenido principal - maximizado */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        {/* Grid principal con layout optimizado */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
          {/* Columna izquierda - Participantes y Propiedad (4 cols) */}
          <div className="xl:col-span-4 space-y-6">
            <NegotiationParticipants
              buyer={negotiationData.buyer}
              seller={negotiationData.seller}
              lawyer={negotiationData.lawyer}
              agent={negotiationData.agent}
            />
            <NegotiationProperty property={negotiationData.property} />
          </div>

          {/* Columna derecha - Acciones y Ofertas (8 cols) */}
          <div className="xl:col-span-8 space-y-6">
            {/* Botones de acción */}
            <NegotiationActions
              canEdit={canEdit}
              generating={generating}
              exporting={exporting}
              showLegalSection={showLegalSection}
              onGenerate={handleGenerate}
              onExport={handleExportDocx}
              onToggleLegal={() => setShowLegalSection(!showLegalSection)}
            />

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

        {/* Grid inferior - Editor y Panel Financiero */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Editor colaborativo */}
          <div className="xl:col-span-1">
            <CollaborativeEditor 
              negotiationId={negotiationId} 
              docKey={`neg-${negotiationId}-promise`}
              initialContent={draft || undefined}
            />
          </div>

          {/* Panel financiero */}
          <div className="xl:col-span-1">
            <FinancePanel negotiationId={negotiationId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NegotiationPage;


