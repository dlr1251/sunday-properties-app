import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Edit, 
  Eye, 
  Save, 
  Send, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  DollarSign,
  CreditCard,
  AlertTriangle,
  Download,
  Share2,
  PenTool,
  Signature
} from 'lucide-react';
import { IntentLetter, Offer } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { useNegotiation } from '../../hooks/useNegotiation';

interface IntentLetterEditorProps {
  offerId: string;
  onLetterGenerated?: (letter: IntentLetter) => void;
  onLetterSigned?: (letter: IntentLetter) => void;
}

export const IntentLetterEditor: React.FC<IntentLetterEditorProps> = ({
  offerId,
  onLetterGenerated,
  onLetterSigned
}) => {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [letter, setLetter] = useState<IntentLetter | null>(null);
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signature, setSignature] = useState('');
  const [userRole, setUserRole] = useState<'buyer' | 'seller'>('buyer');

  const { generateIntentLetter, signIntentLetter } = useNegotiation();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load offer details
        const { data: offerData, error: offerError } = await supabase
          .from('offers')
          .select(`
            *,
            buyer:users!offers_buyer_id_fkey(*),
            seller:users!offers_seller_id_fkey(*),
            property:properties!offers_property_id_fkey(*)
          `)
          .eq('id', offerId)
          .single();

        if (offerError) {
          console.error('Error loading offer:', offerError);
          return;
        }

        setOffer(offerData);

        // Load existing intent letter
        const { data: letterData, error: letterError } = await supabase
          .from('intent_letters')
          .select('*')
          .eq('offer_id', offerId)
          .single();

        if (letterError && letterError.code !== 'PGRST116') {
          console.error('Error loading intent letter:', letterError);
          return;
        }

        if (letterData) {
          setLetter(letterData);
          setContent(letterData.content);
        } else {
          // Generate initial content
          const initialContent = generateLetterContent(offerData);
          setContent(initialContent);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [offerId]);

  const generateLetterContent = (offerData: any) => {
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    return `
CARTA DE INTENCIÓN DE COMPRAVENTA

Medellín, ${formatDate(new Date().toISOString())}

Por medio de la presente, ${offerData.buyer?.name || 'Comprador'} (en adelante "EL COMPRADOR") y ${offerData.seller?.name || 'Vendedor'} (en adelante "EL VENDEDOR") manifiestan su intención de celebrar un contrato de compraventa sobre el inmueble descrito a continuación:

INFORMACIÓN DEL INMUEBLE:
- Dirección: ${offerData.property?.address || 'Dirección no especificada'}
- Área: ${offerData.property?.area || 'No especificada'} m²
- Tipo: ${offerData.property?.type || 'No especificado'}

CONDICIONES PRINCIPALES ACORDADAS:
1. PRECIO: ${formatPrice(offerData.offer_price)}
2. MÉTODO DE PAGO: ${offerData.payment_method?.toUpperCase() || 'No especificado'}
3. FECHA DE CIERRE: ${formatDate(offerData.closing_date)}
4. MONEDA: ${offerData.currency || 'COP'}

CONDICIONES ESPECIALES:
${offerData.conditions && offerData.conditions.length > 0 
  ? offerData.conditions.map((condition: string, index: number) => `${index + 1}. ${condition}`).join('\n')
  : 'Ninguna condición especial aplica.'
}

OBLIGACIONES DE LAS PARTES:

EL COMPRADOR se compromete a:
- Realizar el pago según las condiciones acordadas
- Proporcionar la documentación necesaria para la escrituración
- Cumplir con los plazos establecidos

EL VENDEDOR se compromete a:
- Entregar el inmueble en las condiciones acordadas
- Proporcionar la documentación legal necesaria
- Facilitar el proceso de escrituración

VIGENCIA:
Esta carta de intención tiene una vigencia de 30 días calendario a partir de la fecha de firma de ambas partes.

ACEPTACIÓN:
Las partes declaran haber leído, entendido y estar de acuerdo con los términos aquí establecidos.

FIRMAS:

EL COMPRADOR:                           EL VENDEDOR:
_________________________              _________________________
${offerData.buyer?.name || 'Comprador'}              ${offerData.seller?.name || 'Vendedor'}
C.C. _________________                 C.C. _________________
Fecha: _______________                 Fecha: _______________

Firma Digital:                         Firma Digital:
_________________________              _________________________
    `.trim();
  };

  const handleGenerateLetter = async () => {
    try {
      setSaving(true);
      const newLetter = await generateIntentLetter(offerId);
      setLetter(newLetter);
      if (onLetterGenerated) {
        onLetterGenerated(newLetter);
      }
    } catch (error) {
      console.error('Error generating letter:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      
      if (letter) {
        // Update existing letter
        const { data, error } = await supabase
          .from('intent_letters')
          .update({
            content: content,
            updated_at: new Date().toISOString()
          })
          .eq('id', letter.id)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setLetter(data);
      } else {
        // Create new letter
        const { data, error } = await supabase
          .from('intent_letters')
          .insert({
            offer_id: offerId,
            property_id: offer?.property_id,
            buyer_id: offer?.buyer_id,
            seller_id: offer?.seller_id,
            content: content,
            status: 'draft'
          })
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setLetter(data);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignLetter = async () => {
    if (!letter || !signature.trim()) return;

    try {
      setSaving(true);
      const updatedLetter = await signIntentLetter(letter.id, signature, userRole);
      setLetter(updatedLetter);
      if (onLetterSigned) {
        onLetterSigned(updatedLetter);
      }
    } catch (error) {
      console.error('Error signing letter:', error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending_signatures':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'signed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Borrador';
      case 'pending_signatures':
        return 'Pendiente de firmas';
      case 'signed':
        return 'Firmada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (!offer) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No se encontró la oferta
          </h3>
          <p className="text-muted-foreground">
            No se pudo cargar la información necesaria
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Carta de Intención</h2>
            <p className="text-muted-foreground">
              {offer.property?.title || 'Propiedad'} - {formatPrice(offer.offer_price)}
            </p>
          </div>
        </div>
        
        {letter && (
          <Badge className={getStatusColor(letter.status)}>
            {getStatusLabel(letter.status)}
          </Badge>
        )}
      </div>

      {/* Letter Content */}
      <Tabs defaultValue="editor" className="space-y-4">
        <TabsList>
          <TabsTrigger value="editor">
            <Edit className="h-4 w-4 mr-2" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Vista Previa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Contenido de la Carta</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Vista' : 'Editar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Guardando...' : 'Guardar Borrador'}
                </Button>
              </div>
            </div>

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[600px] font-mono text-sm"
              disabled={!isEditing}
              placeholder="Contenido de la carta de intención..."
            />
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Vista Previa</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
              </div>
            </div>

            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                {content}
              </pre>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Signatures */}
      {letter && letter.status !== 'signed' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Signature className="h-5 w-5 mr-2" />
            Firmas Digitales
          </h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="user-role">Mi rol en esta transacción</Label>
              <select
                id="user-role"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as 'buyer' | 'seller')}
                className="mt-1 block w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="buyer">Comprador</option>
                <option value="seller">Vendedor</option>
              </select>
            </div>

            <div>
              <Label htmlFor="signature">Firma digital</Label>
              <Input
                id="signature"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Escribe tu nombre completo como firma"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Esta firma será registrada digitalmente y vinculada a tu cuenta
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleSignLetter}
                disabled={!signature.trim() || saving}
                className="min-w-[200px]"
              >
                <PenTool className="h-4 w-4 mr-2" />
                {saving ? 'Firmando...' : 'Firmar Carta'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Status Information */}
      {letter && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Estado de la Carta</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Firma del Comprador</h4>
              <div className="flex items-center space-x-2">
                {letter.buyer_signed_at ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700">
                      Firmada el {new Date(letter.buyer_signed_at).toLocaleDateString('es-CO')}
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-700">Pendiente</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Firma del Vendedor</h4>
              <div className="flex items-center space-x-2">
                {letter.seller_signed_at ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700">
                      Firmada el {new Date(letter.seller_signed_at).toLocaleDateString('es-CO')}
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-700">Pendiente</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {letter.status === 'signed' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-800">
                  ¡Carta de intención completamente firmada!
                </span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Ambas partes han firmado la carta. Puedes proceder con la documentación legal.
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
