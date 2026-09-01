import { getIntlLocale } from '../../i18n';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { LegalDocumentGenerationService } from '../../services/legalDocumentGeneration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  FileText,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  Scale,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { AiLegalDisclaimer } from '@/components/ai/AiLegalDisclaimer';

interface Negotiation {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  lawyer_id: string | null;
  current_price: number;
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    property_type: string;
    area: number;
    bedrooms: number | null;
    bathrooms: number | null;
    strata: number | null;
    year_built: number | null;
    registration_info?: {
      folio_number?: string;
      registration_date?: string;
      notary_name?: string;
      notary_number?: string;
      folio_status?: string;
      annotations?: Array<{
        annotation_number: string;
        date: string;
        radicacion: string;
        document: string;
        value?: number;
        specification: string;
        parties: string;
      }>;
    };
    legal_description?: string;
  };
  buyer: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    // Datos de verificación
    id_number?: string;
    nationality?: string;
    address?: string;
    dob?: string;
    marital_status?: string;
    occupation?: string;
  };
  seller: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    // Datos de verificación
    id_number?: string;
    nationality?: string;
    address?: string;
    dob?: string;
    marital_status?: string;
    occupation?: string;
  };
  latestOffer: {
    id: string;
    offer_price: number;
    payment_method: string;
    closing_date: string;
    down_payment: number | null;
    conditions: string[];
  };
}

interface PromesaCompraventaGeneratorProps {
  negotiationId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentGenerated?: (documentId: string) => void;
}

export const PromesaCompraventaGenerator: React.FC<PromesaCompraventaGeneratorProps> = ({
  negotiationId,
  isOpen,
  onOpenChange,
  onDocumentGenerated
}) => {
  const [negotiation, setNegotiation] = useState<Negotiation | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isOpen && negotiationId) {
      fetchNegotiation();
    }
  }, [isOpen, negotiationId]);

  const fetchNegotiation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('negotiations')
        .select(`
          *,
          property:properties(
            id,
            title,
            address,
            city,
            property_type,
            area,
            bedrooms,
            bathrooms,
            strata,
            year_built
          ),
          buyer:profiles!negotiations_buyer_id_fkey(
            id,
            full_name,
            email,
            phone
          ),
          seller:profiles!negotiations_seller_id_fkey(
            id,
            full_name,
            email,
            phone
          ),
          offers:offers(
            id,
            offer_price,
            payment_method,
            closing_date,
            down_payment,
            conditions
          )
        `)
        .eq('id', negotiationId)
        .single();

      if (error) throw error;

      // Get latest offer
      const latestOffer = data.offers?.[data.offers.length - 1] || {
        id: '',
        offer_price: data.current_price,
        payment_method: 'cash',
        closing_date: new Date().toISOString(),
        down_payment: null,
        conditions: []
      };

      // Fetch verification data for buyer and seller
      const [buyerVerification, sellerVerification, propertyLegalDocs] = await Promise.all([
        supabase
          .from('verification_requests')
          .select('full_name, dob, nationality, phone, location, document_type')
          .eq('user_id', data.buyer_id)
          .eq('status', 'approved')
          .single(),
        supabase
          .from('verification_requests')
          .select('full_name, dob, nationality, phone, location, document_type')
          .eq('user_id', data.seller_id)
          .eq('status', 'approved')
          .single(),
        // Try to get legal documents analysis for the property
        supabase
          .from('legal_documents')
          .select('document_type, content')
          .eq('property_id', data.property_id)
          .in('document_type', ['clyt_analysis', 'escritura_analysis', 'title_study'])
          .limit(5)
      ]);

      const buyerData = {
        ...data.buyer,
        // Note: ID number might need to be added to verification_requests table or stored separately
        // For now, using available verification data
        nationality: buyerVerification.data?.nationality || 'Colombia',
        address: buyerVerification.data?.location || data.buyer.phone, // fallback to phone if no address
        dob: buyerVerification.data?.dob,
        phone: buyerVerification.data?.phone || data.buyer.phone,
      };

      const sellerData = {
        ...data.seller,
        // Note: ID number might need to be added to verification_requests table or stored separately
        // For now, using available verification data
        nationality: sellerVerification.data?.nationality || 'Colombia',
        address: sellerVerification.data?.location || data.seller.phone, // fallback to phone if no address
        dob: sellerVerification.data?.dob,
        phone: sellerVerification.data?.phone || data.seller.phone,
      };

      // Extract title study information from legal documents
      let registrationInfo = undefined;
      let legalDescription = undefined;

      if (propertyLegalDocs.data && propertyLegalDocs.data.length > 0) {
        for (const doc of propertyLegalDocs.data) {
          try {
            // Try to parse JSON content from legal documents
            const parsedContent = JSON.parse(doc.content);
            if (parsedContent.extractedData) {
              const extracted = parsedContent.extractedData;

              // Extract CLYT information
              if (doc.document_type === 'clyt_analysis' || extracted.folioNumber || extracted.ownerName) {
                registrationInfo = {
                  folio_number: extracted.folioNumber || extracted.folio_number,
                  registration_date: extracted.registrationDate || extracted.registration_date,
                  notary_name: extracted.notaryName || extracted.notary_name,
                  notary_number: extracted.notaryNumber || extracted.notary_number,
                  folio_status: extracted.folioStatus || extracted.folio_status,
                  annotations: extracted.annotations || []
                };
              }

              // Build legal description from available data
              if (!legalDescription) {
                const parts = [];
                if (extracted.propertyAddress) parts.push(`Ubicado en ${extracted.propertyAddress}`);
                if (extracted.propertyArea) parts.push(`con área de ${extracted.propertyArea} m²`);
                if (extracted.ownerName) parts.push(`propiedad de ${extracted.ownerName}`);
                if (extracted.folioNumber) parts.push(`registrado bajo folio ${extracted.folioNumber}`);
                if (parts.length > 0) {
                  legalDescription = parts.join(', ') + '.';
                }
              }
            }
          } catch (error) {
            // If content is not JSON, skip this document
            console.warn('Could not parse legal document content:', error);
          }
        }
      }

      setNegotiation({
        ...data,
        buyer: buyerData,
        seller: sellerData,
        latestOffer,
        property: {
          ...data.property,
          registration_info: registrationInfo,
          legal_description: legalDescription
        }
      });
    } catch (error: any) {
      console.error('Error fetching negotiation:', error);
      toast.error('Error al cargar la negociación');
    } finally {
      setLoading(false);
    }
  };

  const generatePromesa = async () => {
    if (!negotiation) return;

    setGenerating(true);
    try {
      const legalService = LegalDocumentGenerationService.getInstance();
      
      const caseData = {
        property: {
          id: negotiation.property.id,
          title: negotiation.property.title,
          address: negotiation.property.address,
          city: negotiation.property.city,
          property_type: negotiation.property.property_type,
          area: negotiation.property.area,
          bedrooms: negotiation.property.bedrooms,
          bathrooms: negotiation.property.bathrooms,
          strata: negotiation.property.strata,
          year_built: negotiation.property.year_built,
          registration_info: negotiation.property.registration_info,
          legal_description: negotiation.property.legal_description
        },
        buyer: {
          id: negotiation.buyer.id,
          full_name: negotiation.buyer.full_name,
          email: negotiation.buyer.email,
          phone: negotiation.buyer.phone || undefined,
          id_number: negotiation.buyer.id_number,
          nationality: negotiation.buyer.nationality,
          address: negotiation.buyer.address,
          dob: negotiation.buyer.dob,
          marital_status: negotiation.buyer.marital_status,
          occupation: negotiation.buyer.occupation,
        },
        seller: {
          id: negotiation.seller.id,
          full_name: negotiation.seller.full_name,
          email: negotiation.seller.email,
          phone: negotiation.seller.phone || undefined,
          id_number: negotiation.seller.id_number,
          nationality: negotiation.seller.nationality,
          address: negotiation.seller.address,
          dob: negotiation.seller.dob,
          marital_status: negotiation.seller.marital_status,
          occupation: negotiation.seller.occupation,
        },
        offer: {
          id: negotiation.latestOffer.id,
          offer_price: negotiation.latestOffer.offer_price,
          payment_method: negotiation.latestOffer.payment_method,
          closing_date: negotiation.latestOffer.closing_date,
          down_payment: negotiation.latestOffer.down_payment || undefined,
          conditions: negotiation.latestOffer.conditions || []
        }
      };

      const documentContent = await legalService.generatePromesaCompraventa(caseData);
      setDocumentContent(documentContent);

      // Save document to database
      const { data: savedDoc, error: saveError } = await supabase
        .from('legal_documents')
        .insert({
          property_id: negotiation.property_id,
          offer_id: negotiation.latestOffer.id,
          document_type: 'promesa',
          title: 'Promesa de Compraventa',
          content: documentContent,
          status: 'draft',
          requires_signatures: true,
          version: 1
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setDocumentId(savedDoc.id);

      // Update negotiation status
      await supabase
        .from('negotiations')
        .update({
          status: 'pending_documents',
          updated_at: new Date().toISOString()
        })
        .eq('id', negotiationId);

      // Create notifications for buyer and seller
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: negotiation.buyer_id,
            type: 'document_generated',
            title: 'Promesa de Compraventa generada',
            message: 'La promesa de compraventa está lista para revisión',
            related_id: savedDoc.id,
            related_type: 'offer',
            related_negotiation_id: negotiationId
          },
          {
            user_id: negotiation.seller_id,
            type: 'document_generated',
            title: 'Promesa de Compraventa generada',
            message: 'La promesa de compraventa está lista para revisión',
            related_id: savedDoc.id,
            related_type: 'offer',
            related_negotiation_id: negotiationId
          }
        ]);

      toast.success('Promesa de compraventa generada exitosamente');
      onDocumentGenerated?.(savedDoc.id);
    } catch (error: any) {
      console.error('Error generating promesa:', error);
      toast.error('Error al generar la promesa de compraventa');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!documentContent) return;

    const blob = new Blob([documentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Promesa_Compraventa_${negotiationId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Cargando información de la negociación...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!negotiation) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
            <p className="text-muted-foreground">No se pudo cargar la negociación</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generar Promesa de Compraventa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Negotiation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen de la Negociación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Propiedad</p>
                  <p className="font-medium">{negotiation.property.title}</p>
                  <p className="text-sm text-muted-foreground">{negotiation.property.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Precio Acordado</p>
                  <p className="font-semibold text-lg">
                    {new Intl.NumberFormat(getIntlLocale(), {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                    }).format(negotiation.latestOffer.offer_price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Comprador</p>
                  <p className="font-medium">{negotiation.buyer.full_name}</p>
                  <p className="text-sm text-muted-foreground">{negotiation.buyer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vendedor</p>
                  <p className="font-medium">{negotiation.seller.full_name}</p>
                  <p className="text-sm text-muted-foreground">{negotiation.seller.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Actions */}
          {!documentContent ? (
            <div className="text-center py-8 space-y-4">
              <AiLegalDisclaimer className="text-left" />
              <p className="text-muted-foreground mb-4">
                Genera la promesa de compraventa usando inteligencia artificial (Grok)
              </p>
              <Button
                onClick={generatePromesa}
                disabled={generating}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generar Promesa de Compraventa
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <AiLegalDisclaimer />
              <div className="flex items-center justify-between">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Documento Generado
                </Badge>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                    <Eye className="w-4 h-4 mr-2" />
                    {showPreview ? 'Ocultar' : 'Ver'} Vista Previa
                  </Button>
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </div>

              {showPreview && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vista Previa del Documento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/30 p-4 rounded-lg max-h-96 overflow-y-auto">
                        {documentContent}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

