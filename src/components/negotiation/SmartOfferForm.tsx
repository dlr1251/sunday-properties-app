import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Calculator,
  FileText,
  CheckCircle,
  AlertTriangle,
  Brain,
  Save,
  Send,
  User,
  Clock,
  Settings,
  Zap,
  CreditCard,
  DollarSign,
  Scale
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

// Importar todos los subcomponentes
import { InteractivePaymentSection } from './sections/InteractivePaymentSection';
import { LegalValidationSection } from './sections/LegalValidationSection';
import { LegalDocumentsSection } from './sections/LegalDocumentsSection';
import { OfferValiditySection } from './sections/OfferValiditySection';
import { OfferAnalysisSection } from './sections/OfferAnalysisSection';

// Importar tipos y servicios
import { ColombianPaymentStructure, PaymentSchedule, COLOMBIAN_PAYMENT_METHODS } from '../../types/payments';
import { PaymentValidationService } from '../../services/paymentValidation.service';

interface SmartOfferFormProps {
  propertyId: string;
  propertyPrice: number;
  negotiationRules?: any;
  onSubmit?: (offer: any) => void;
  onCancel?: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Interfaces para la estructura completa de la oferta
interface OfferValidity {
  durationDays: number;
  startDate: string;
  endDate: string;
  modifiableBy: 'buyer' | 'seller' | 'both' | 'neither';
  autoExtend: boolean;
  autoExtendDays: number;
  autoExtendConditions: string[];
  notifyBeforeExpiry: boolean;
  notificationDays: number;
  expiryActions: string[];
  customConditions?: string;
}

interface EarnestMoney {
  amount: number;
  percentage: number;
  dueDate: string;
  refundable: boolean;
  refundConditions: string[];
  paymentMethod: string;
  recipient: string;
  includesCartaIntencion: boolean;
  cartaIntencionDetails?: string;
}

interface LegalDocument {
  id: string;
  type: 'contrato_opcion' | 'promesa_compraventa' | 'escrituras';
  title: string;
  description: string;
  required: boolean;
  signingDate: string;
  paymentDate?: string;
  conditions: string[];
  status: 'pending' | 'draft' | 'signed' | 'completed';
  assignedLawyer?: string;
  notes?: string;
}

export function SmartOfferForm({
  propertyId,
  propertyPrice,
  negotiationRules,
  onSubmit,
  onCancel,
  isOpen,
  onOpenChange
}: SmartOfferFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('payment');

  // Estados para cada sección
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<ColombianPaymentStructure['method']>('transferencia_bancaria');
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule[]>([]);
  const [earnestMoney, setEarnestMoney] = useState<EarnestMoney | null>(null);
  const [offerValidity, setOfferValidity] = useState<OfferValidity>({
    durationDays: 30,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    modifiableBy: 'both',
    autoExtend: false,
    autoExtendDays: 15,
    autoExtendConditions: [],
    notifyBeforeExpiry: true,
    notificationDays: 7,
    expiryActions: ['Marcar oferta como expirada', 'Notificar a ambas partes']
  });
  const [legalDocuments, setLegalDocuments] = useState<LegalDocument[]>([]);

  // Estado para validaciones
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [canProceed, setCanProceed] = useState(false);

  // Validar oferta completa
  useEffect(() => {
    validateOffer();
  }, [selectedPaymentMethod, paymentSchedule, earnestMoney, offerValidity, legalDocuments]);

  const validateOffer = () => {
    const errors: string[] = [];

    // Validar método de pago
    if (!selectedPaymentMethod) {
      errors.push('Debe seleccionar un método de pago');
    }

    // Validar cronograma de pagos
    if (paymentSchedule.length === 0) {
      errors.push('Debe configurar al menos un pago en el cronograma');
    }

    const totalScheduled = paymentSchedule.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(totalScheduled - propertyPrice) > 1000) {
      errors.push('La suma de los pagos no coincide con el precio de la propiedad');
    }

    // Validar arras
    if (!earnestMoney) {
      errors.push('Debe configurar el pago inicial/arras');
    }

    // Validar documentos legales
    const requiredDocs = legalDocuments.filter(d => d.required);
    if (requiredDocs.length === 0) {
      errors.push('Debe configurar al menos los documentos legales requeridos');
    }

    // Validar validez de la oferta
    if (offerValidity.durationDays < 7) {
      errors.push('La oferta debe tener al menos 7 días de validez');
    }

    setValidationErrors(errors);
    setCanProceed(errors.length === 0);
  };

  const handleSubmit = async () => {
    if (!user || !canProceed) return;

    setLoading(true);
    try {
      // Crear oferta completa con todos los componentes
      const completeOffer = {
        property_id: propertyId,
        buyer_id: user.id,
        offer_price: propertyPrice,
        payment_method: selectedPaymentMethod,
        payment_schedule: paymentSchedule,
        earnest_money: earnestMoney,
        offer_validity: offerValidity,
        legal_documents: legalDocuments,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: offerResult, error } = await supabase
        .from('offers')
        .insert(completeOffer)
        .select()
        .single();

      if (error) throw error;

      toast.success('Oferta completa guardada exitosamente');
      onSubmit?.(offerResult);
      onOpenChange(false);

    } catch (err: any) {
      console.error('Error submitting complete offer:', err);
      toast.error(err.message || 'Error al guardar la oferta completa');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-[95vw] max-h-[95vh] overflow-y-auto md:w-[96vw] lg:w-[94vw] xl:w-[92vw] 2xl:max-w-[1400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Formulario de Oferta Inteligente Completo
          </DialogTitle>
          <div className="flex items-center justify-between">
            <p className="text-gray-700 font-medium">
              Precio de referencia: {formatCurrency(propertyPrice)}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={canProceed ? 'default' : 'destructive'}>
                {canProceed ? 'Lista para enviar' : 'Requiere corrección'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Sistema de Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="payment" className="text-xs">
              <CreditCard className="h-4 w-4 mr-1" />
              Pagos
            </TabsTrigger>
            <TabsTrigger value="legal" className="text-xs">
              <Scale className="h-4 w-4 mr-1" />
              Legal
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs">
              <FileText className="h-4 w-4 mr-1" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs">
              <Brain className="h-4 w-4 mr-1" />
              Análisis
            </TabsTrigger>
          </TabsList>

          {/* Contenido de cada tab */}
          <TabsContent value="payment" className="space-y-4">
            <InteractivePaymentSection
              selectedPaymentMethod={selectedPaymentMethod}
              onMethodChange={setSelectedPaymentMethod}
              paymentSchedule={paymentSchedule}
              onScheduleChange={setPaymentSchedule}
              earnestMoney={earnestMoney}
              onEarnestMoneyChange={setEarnestMoney}
              propertyPrice={propertyPrice}
              negotiationRules={negotiationRules}
            />
          </TabsContent>

          <TabsContent value="legal" className="space-y-4">
            <LegalValidationSection
              propertyPrice={propertyPrice}
              paymentStructure={{
                method: selectedPaymentMethod,
                totalAmount: propertyPrice,
                currency: 'COP',
                paymentSchedule: paymentSchedule,
                contingencies: [],
                riskLevel: 'medium',
                requiresDianReporting: propertyPrice > 200000000,
                internationalTransfer: false,
                requiresNotary: propertyPrice > 50000000,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1
              }}
              ownershipYears={5}
              buyerIsResident={true}
              sellerIsCompany={false}
            />
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <LegalDocumentsSection
              documents={legalDocuments}
              onDocumentsChange={setLegalDocuments}
              propertyPrice={propertyPrice}
              offerValidityDays={offerValidity.durationDays}
            />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <OfferAnalysisSection
              paymentStructure={{
                method: selectedPaymentMethod,
                totalAmount: propertyPrice,
                currency: 'COP',
                paymentSchedule: paymentSchedule,
                contingencies: [],
                riskLevel: 'medium',
                requiresDianReporting: propertyPrice > 200000000,
                internationalTransfer: false,
                requiresNotary: propertyPrice > 50000000,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1
              }}
              propertyPrice={propertyPrice}
              marketData={{
                averagePrice: propertyPrice,
                medianPrice: propertyPrice * 0.95,
                daysOnMarket: 30,
                recentSales: []
              }}
              negotiationRules={negotiationRules}
            />
          </TabsContent>
        </Tabs>

        {/* Errores de validación */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <div className="space-y-1">
              <div className="font-medium">Errores de validación:</div>
              <ul className="list-disc list-inside text-sm">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </Alert>
        )}

        {/* Footer con acciones */}
        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={() => {/* Guardar como borrador */}}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Borrador
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !canProceed}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Oferta Completa
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SmartOfferForm;
