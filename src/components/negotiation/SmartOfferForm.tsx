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
  Scale,
  Home
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/format';

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
  transactionType?: 'sale' | 'rental';
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
  transactionType = 'sale',
  negotiationRules,
  onSubmit,
  onCancel,
  isOpen,
  onOpenChange
}: SmartOfferFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(transactionType === 'rental' ? 'rental' : 'payment');

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
    expiryActions: [],
  });
  const [legalDocuments, setLegalDocuments] = useState<LegalDocument[]>([]);

  // Rental-specific terms (for transactionType === 'rental')
  const [monthlyRent, setMonthlyRent] = useState<number>(propertyPrice || 0);
  const [leaseStartDate, setLeaseStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [leaseTermMonths, setLeaseTermMonths] = useState<number>(12);
  const [deposit, setDeposit] = useState<number>(0);
  const [adminFee, setAdminFee] = useState<number>(0);
  const [utilitiesIncluded, setUtilitiesIncluded] = useState<string[]>([]);
  const [petsPolicy, setPetsPolicy] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Estado para validaciones
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [canProceed, setCanProceed] = useState(false);

  // Validar oferta completa
  useEffect(() => {
    validateOffer();
  }, [
    transactionType,
    selectedPaymentMethod,
    paymentSchedule,
    earnestMoney,
    offerValidity,
    legalDocuments,
    monthlyRent,
    leaseStartDate,
    leaseTermMonths,
  ]);

  const validateOffer = () => {
    const errors: string[] = [];

    if (transactionType === 'rental') {
      if (!monthlyRent || monthlyRent <= 0) errors.push(t('negotiations.smartOffer.errMonthlyRent'));
      if (!leaseStartDate) errors.push(t('negotiations.smartOffer.errLeaseStart'));
      if (!leaseTermMonths || leaseTermMonths < 1) errors.push(t('negotiations.smartOffer.errLeaseTerm'));
      setValidationErrors(errors);
      setCanProceed(errors.length === 0);
      return;
    }

    // Validar método de pago
    if (!selectedPaymentMethod) {
      errors.push(t('negotiations.smartOffer.errPaymentMethod'));
    }

    // Validar cronograma de pagos
    if (paymentSchedule.length === 0) {
      errors.push(t('negotiations.smartOffer.errSchedule'));
    }

    const totalScheduled = paymentSchedule.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(totalScheduled - propertyPrice) > 1000) {
      errors.push(t('negotiations.smartOffer.errScheduleTotal'));
    }

    // Validar arras
    if (!earnestMoney) {
      errors.push(t('negotiations.smartOffer.errEarnest'));
    }

    // Validar documentos legales
    const requiredDocs = legalDocuments.filter(d => d.required);
    if (requiredDocs.length === 0) {
      errors.push(t('negotiations.smartOffer.errLegalDocs'));
    }

    // Validar validez de la oferta
    if (offerValidity.durationDays < 7) {
      errors.push(t('negotiations.smartOffer.errValidity'));
    }

    setValidationErrors(errors);
    setCanProceed(errors.length === 0);
  };

  const handleSubmit = async () => {
    if (!user || !canProceed) return;

    setLoading(true);
    try {
      const completeOffer =
        transactionType === 'rental'
          ? {
              property_id: propertyId,
              buyer_id: user.id,
              transaction_type: 'rental',
              monthly_rent: monthlyRent,
              lease_start_date: leaseStartDate,
              lease_term_months: leaseTermMonths,
              deposit,
              admin_fee: adminFee,
              utilities_included: utilitiesIncluded,
              pets_policy: petsPolicy,
              message,
              status: 'draft',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          : {
              property_id: propertyId,
              buyer_id: user.id,
              transaction_type: 'sale',
              offer_price: propertyPrice,
              original_price: propertyPrice,
              payment_method: selectedPaymentMethod,
              financing_details: null,
              crypto_details: null,
              closing_date: offerValidity.endDate,
              conditions: [],
              metrics: {
                payment_schedule: paymentSchedule,
                earnest_money: earnestMoney,
                offer_validity: offerValidity,
                legal_documents: legalDocuments,
              },
              status: 'pending',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

      const { data: offerResult, error } = await supabase
        .from('offers')
        .insert(completeOffer)
        .select()
        .single();

      if (error) throw error;

      toast.success(t('negotiations.smartOffer.saved'));
      onSubmit?.(offerResult);
      onOpenChange(false);

    } catch (err: any) {
      console.error('Error submitting complete offer:', err);
      toast.error(err.message || t('negotiations.smartOffer.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-[95vw] max-h-[95vh] overflow-y-auto md:w-[96vw] lg:w-[94vw] xl:w-[92vw] 2xl:max-w-[1400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            {transactionType === 'rental' ? t('negotiations.smartOffer.rentalTitle') : t('negotiations.smartOffer.title')}
          </DialogTitle>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground font-medium">
              {transactionType === 'rental'
                ? t('negotiations.smartOffer.referenceRent', { price: formatCurrency(propertyPrice) })
                : t('negotiations.smartOffer.referencePrice', { price: formatCurrency(propertyPrice) })}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={canProceed ? 'default' : 'destructive'}>
                {canProceed ? t('negotiations.smartOffer.readyToSend') : t('negotiations.smartOffer.needsCorrection')}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Sistema de Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${transactionType === 'rental' ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="payment" className="text-xs">
              <CreditCard className="h-4 w-4 mr-1" />
              {t('negotiations.smartOffer.tabPayments')}
            </TabsTrigger>
            <TabsTrigger value="legal" className="text-xs">
              <Scale className="h-4 w-4 mr-1" />
              {t('negotiations.smartOffer.tabLegal')}
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs">
              <FileText className="h-4 w-4 mr-1" />
              {t('negotiations.smartOffer.tabDocuments')}
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs">
              <Brain className="h-4 w-4 mr-1" />
              {t('negotiations.smartOffer.tabAnalysis')}
            </TabsTrigger>
            {transactionType === 'rental' && (
              <TabsTrigger value="rental" className="text-xs">
                <Home className="h-4 w-4 mr-1" />
                {t('negotiations.smartOffer.tabRental')}
              </TabsTrigger>
            )}
          </TabsList>

          {transactionType === 'rental' && (
            <TabsContent value="rental" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    {t('negotiations.smartOffer.rentalTerms')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('negotiations.smartOffer.monthlyRent')}</label>
                      <input
                        className="w-full border border-input bg-background rounded-md px-3 py-2"
                        type="number"
                        min="0"
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('negotiations.smartOffer.leaseStart')}</label>
                      <input
                        className="w-full border border-input bg-background rounded-md px-3 py-2"
                        type="date"
                        value={leaseStartDate}
                        onChange={(e) => setLeaseStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('negotiations.smartOffer.termMonths')}</label>
                      <input
                        className="w-full border border-input bg-background rounded-md px-3 py-2"
                        type="number"
                        min="1"
                        value={leaseTermMonths}
                        onChange={(e) => setLeaseTermMonths(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('negotiations.smartOffer.deposit')}</label>
                      <input
                        className="w-full border border-input bg-background rounded-md px-3 py-2"
                        type="number"
                        min="0"
                        value={deposit}
                        onChange={(e) => setDeposit(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('negotiations.smartOffer.adminFee')}</label>
                      <input
                        className="w-full border border-input bg-background rounded-md px-3 py-2"
                        type="number"
                        min="0"
                        value={adminFee}
                        onChange={(e) => setAdminFee(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('negotiations.smartOffer.utilitiesIncluded')}</label>
                    <div className="flex flex-wrap gap-2">
                      {['agua', 'luz', 'gas', 'internet', 'administracion'].map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() =>
                            setUtilitiesIncluded((prev) => (prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]))
                          }
                          className={`px-3 py-1 rounded-full border text-sm ${
                            utilitiesIncluded.includes(u) ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground'
                          }`}
                        >
                          {t(`negotiations.smartOffer.utilities.${u}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('negotiations.smartOffer.petsPolicy')}</label>
                    <input
                      className="w-full border border-input bg-background rounded-md px-3 py-2"
                      value={petsPolicy}
                      onChange={(e) => setPetsPolicy(e.target.value)}
                      placeholder={t('negotiations.smartOffer.petsPlaceholder')}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('negotiations.smartOffer.messageConditions')}</label>
                    <textarea
                      className="w-full border border-input bg-background rounded-md px-3 py-2 min-h-[90px]"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t('negotiations.smartOffer.messagePlaceholder')}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

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
              <div className="font-medium">{t('negotiations.smartOffer.validationErrors')}</div>
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
            {t('common.cancel')}
          </Button>
          <Button
            variant="outline"
            onClick={() => {/* Guardar como borrador */}}
            disabled={loading}
            className="bg-muted hover:bg-muted"
          >
            <Save className="h-4 w-4 mr-2" />
            {t('negotiations.smartOffer.saveDraft')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !canProceed}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('common.processing')}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {t('negotiations.smartOffer.sendComplete')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SmartOfferForm;
