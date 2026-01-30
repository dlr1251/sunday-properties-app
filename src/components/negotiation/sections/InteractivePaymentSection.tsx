import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  CreditCard,
  DollarSign,
  Calendar,
  Plus,
  Trash2,
  Calculator,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  FileText,
  Zap,
  Target,
  Sparkles,
  Settings,
  Play,
  RotateCcw,
  Save,
  Eye,
  X,
  CheckSquare,
  FileCheck,
  Shield,
  Building,
  User,
  Users,
  Receipt,
  Banknote,
  Info
} from 'lucide-react';
import {
  ColombianPaymentMethod,
  COLOMBIAN_PAYMENT_METHODS,
  PaymentSchedule,
  PaymentContingency
} from '@/types/payments';

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

interface NegotiationCondition {
  id: string;
  type: 'escritura_firma' | 'pago_total' | 'entrega_inmueble' | 'promesa_compra' | 'pago_inicial' | 'pago_intermedio' | 'condicion_custom';
  title: string;
  description: string;
  date?: string;
  amount?: number;
  percentage?: number;
  required: boolean;
  completed: boolean;
  dependencies?: string[]; // IDs de condiciones que deben completarse antes
}

interface InteractivePaymentSectionProps {
  selectedPaymentMethod: ColombianPaymentMethod;
  onMethodChange: (method: ColombianPaymentMethod) => void;
  paymentSchedule: PaymentSchedule[];
  onScheduleChange: (schedule: PaymentSchedule[]) => void;
  earnestMoney: EarnestMoney | null;
  onEarnestMoneyChange: (earnestMoney: EarnestMoney | null) => void;
  propertyPrice: number;
  negotiationRules?: any;
  className?: string;
}

const PAYMENT_METHOD_ICONS: Record<ColombianPaymentMethod, React.ComponentType<{ className?: string }>> = {
  'efectivo': DollarSign,
  'transferencia_bancaria': CreditCard,
  'cheque': FileText,
  'financiacion_bancaria': Calculator,
  'financiacion_vendedor': Calculator,
  'cuotas': Clock,
  'criptomonedas': TrendingUp,
  'permuta': Target,
  'metales_preciosos': TrendingUp,
  'pago_a_terceros': CreditCard,
  'mixto': Calculator
};

// Condiciones disponibles para pagos intermedios
const PAYMENT_CONDITIONS: Array<{
  type: PaymentContingency['type'];
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  responsibleParty: PaymentContingency['responsibleParty'];
  documentRequired: boolean;
}> = [
  {
    type: 'paz_salvo_administracion',
    label: 'Paz y Salvo Administración',
    description: 'Certificado de que no hay deudas pendientes con la administración',
    icon: Building,
    responsibleParty: 'comprador',
    documentRequired: true
  },
  {
    type: 'paz_salvo_predial',
    label: 'Paz y Salvo Predial',
    description: 'Certificado de pago del impuesto predial al día',
    icon: Receipt,
    responsibleParty: 'vendedor',
    documentRequired: true
  },
  {
    type: 'sucesion',
    label: 'Declaración de Sucesión',
    description: 'Declaración de herederos y sucesión en caso de fallecimiento del propietario',
    icon: Users,
    responsibleParty: 'vendedor',
    documentRequired: true
  },
  {
    type: 'levantamiento_hipoteca',
    label: 'Levantamiento de Hipoteca',
    description: 'Cancelación y levantamiento de hipotecas existentes sobre la propiedad',
    icon: FileCheck,
    responsibleParty: 'banco',
    documentRequired: true
  },
  {
    type: 'poder_representar',
    label: 'Poder para Representar',
    description: 'Poder notarial para representar al comprador o vendedor en la transacción',
    icon: User,
    responsibleParty: 'comprador',
    documentRequired: true
  },
  {
    type: 'reforma_estatutaria',
    label: 'Reforma Estatutaria',
    description: 'Reforma estatutos de la empresa vendedora si aplica',
    icon: FileText,
    responsibleParty: 'vendedor',
    documentRequired: true
  },
  {
    type: 'certificado_tradicion',
    label: 'Certificado de Tradición',
    description: 'Certificado de tradición y libertad de la propiedad',
    icon: Shield,
    responsibleParty: 'registro',
    documentRequired: true
  },
  {
    type: 'certificado_libertad',
    label: 'Certificado de Libertad',
    description: 'Certificado que confirma que la propiedad está libre de gravámenes',
    icon: CheckSquare,
    responsibleParty: 'registro',
    documentRequired: true
  },
  {
    type: 'registro_comercial',
    label: 'Registro Comercial',
    description: 'Registro comercial actualizado de la empresa vendedora',
    icon: Building,
    responsibleParty: 'vendedor',
    documentRequired: true
  },
  {
    type: 'autorizacion_notarial',
    label: 'Autorización Notarial',
    description: 'Autorización expresa del notario para proceder con la transacción',
    icon: FileText,
    responsibleParty: 'notaria',
    documentRequired: true
  },
  {
    type: 'declaracion_renta',
    label: 'Declaración de Renta',
    description: 'Declaración de renta del último año del vendedor',
    icon: Receipt,
    responsibleParty: 'vendedor',
    documentRequired: true
  },
  {
    type: 'pago_impuestos',
    label: 'Pago de Impuestos',
    description: 'Comprobante de pago de todos los impuestos pendientes',
    icon: Banknote,
    responsibleParty: 'vendedor',
    documentRequired: true
  }
];

// Condiciones mínimas de negociación por defecto
const DEFAULT_NEGOTIATION_CONDITIONS: NegotiationCondition[] = [
  {
    id: 'escritura_firma',
    type: 'escritura_firma',
    title: 'Firma de Escritura Pública',
    description: 'Fecha programada para la firma de la escritura pública',
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 días
    required: true,
    completed: false
  },
  {
    id: 'pago_total',
    type: 'pago_total',
    title: 'Pago Total del Precio',
    description: 'Pago completo del precio de venta el mismo día de la firma',
    amount: 0, // Se calcula dinámicamente
    required: true,
    completed: false,
    dependencies: ['escritura_firma']
  },
  {
    id: 'entrega_inmueble',
    type: 'entrega_inmueble',
    title: 'Entrega del Inmueble',
    description: 'Entrega física del inmueble el mismo día de la firma',
    required: true,
    completed: false,
    dependencies: ['escritura_firma']
  }
];

export function InteractivePaymentSection({
  selectedPaymentMethod,
  onMethodChange,
  paymentSchedule,
  onScheduleChange,
  earnestMoney,
  onEarnestMoneyChange,
  propertyPrice,
  negotiationRules,
  className = ''
}: InteractivePaymentSectionProps) {
  const [conditions, setConditions] = useState<NegotiationCondition[]>(DEFAULT_NEGOTIATION_CONDITIONS);
  const [negotiationMode, setNegotiationMode] = useState<'basic' | 'advanced'>('basic');
  const [showPreview, setShowPreview] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Estados para el modal de pagos avanzados
  const [showAdvancedPaymentModal, setShowAdvancedPaymentModal] = useState(false);
  const [editingPaymentIndex, setEditingPaymentIndex] = useState<number | null>(null);

  // Estado para el formulario de pago avanzado
  const [advancedPaymentForm, setAdvancedPaymentForm] = useState({
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 0,
    currency: 'COP' as 'COP' | 'USD' | 'EUR',
    paymentMethod: selectedPaymentMethod,
    description: '',
    recipient: '',
    verificationRequired: true,
    contingencies: [] as PaymentContingency[],
    otherConditions: '' // Campo adicional para otras condiciones
  });

  // Estados para la negociación interactiva
  const [initialPaymentPercentage, setInitialPaymentPercentage] = useState<number[]>([20]);
  const [promiseCommitment, setPromiseCommitment] = useState(false);
  const [intermediatePayments, setIntermediatePayments] = useState<PaymentSchedule[]>([]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  // Logging para debugging
  const logDebug = useCallback((message: string, data?: any) => {
    if (debugMode) {
      console.log(`[InteractivePayment] ${message}`, data);
    }
  }, [debugMode]);

  useEffect(() => {
    logDebug('Component initialized', {
      propertyPrice,
      selectedPaymentMethod,
      paymentScheduleLength: paymentSchedule.length,
      conditionsCount: conditions.length
    });
  }, [propertyPrice, selectedPaymentMethod, paymentSchedule.length, conditions.length, logDebug]);

  // Actualizar condiciones cuando cambie el precio
  useEffect(() => {
    setConditions(prev => prev.map(condition => {
      if (condition.type === 'pago_total') {
        return {
          ...condition,
          amount: propertyPrice
        };
      }
      return condition;
    }));
    logDebug('Updated payment total condition', { propertyPrice });
  }, [propertyPrice, logDebug]);

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const selectedMethodData = COLOMBIAN_PAYMENT_METHODS.find(m => m.value === selectedPaymentMethod);

  // Calcular totales
  const totalScheduled = paymentSchedule.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = propertyPrice - totalScheduled;
  const completionPercentage = Math.min((totalScheduled / propertyPrice) * 100, 100);

  // Aplicar cambios de negociación
  const applyNegotiationChanges = () => {
    logDebug('Applying negotiation changes', {
      initialPaymentPercentage: initialPaymentPercentage[0],
      promiseCommitment,
      intermediatePaymentsCount: intermediatePayments.length
    });

    // Crear nuevo cronograma basado en las selecciones
    const newSchedule: PaymentSchedule[] = [];

    // Pago inicial si está habilitado
    if (initialPaymentPercentage[0] > 0) {
      const initialAmount = (propertyPrice * initialPaymentPercentage[0]) / 100;
      const promiseDate = conditions.find(c => c.type === 'escritura_firma')?.date;

      newSchedule.push({
        id: `initial_${Date.now()}`,
        date: promiseCommitment && promiseDate
          ? new Date(new Date(promiseDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        amount: initialAmount,
        description: promiseCommitment
          ? `Pago inicial ${initialPaymentPercentage[0]}% con promesa de compraventa`
          : `Pago inicial ${initialPaymentPercentage[0]}%`,
        paymentMethod: selectedPaymentMethod,
        recipient: 'Notaría o cuenta fiduciaria',
        verificationRequired: true,
        contingencies: []
      });

      logDebug('Added initial payment', { amount: initialAmount, percentage: initialPaymentPercentage[0] });
    }

    // Agregar pagos intermedios
    newSchedule.push(...intermediatePayments);

    // Pago final
    const totalPaid = newSchedule.reduce((sum, p) => sum + p.amount, 0);
    const finalPayment = propertyPrice - totalPaid;

    if (finalPayment > 1000) { // Si queda más de $1000 por pagar
      const escrituraDate = conditions.find(c => c.type === 'escritura_firma')?.date || new Date().toISOString().split('T')[0];

      newSchedule.push({
        id: `final_${Date.now()}`,
        date: escrituraDate,
        amount: finalPayment,
        description: 'Pago final del precio de venta',
        paymentMethod: selectedPaymentMethod,
        recipient: 'Vendedor o notaría',
        verificationRequired: true,
        contingencies: []
      });

      logDebug('Added final payment', { amount: finalPayment });
    }

    onScheduleChange(newSchedule);

    // Actualizar arras
    if (initialPaymentPercentage[0] > 0) {
      const earnestMoneyData: EarnestMoney = {
        amount: (propertyPrice * initialPaymentPercentage[0]) / 100,
        percentage: initialPaymentPercentage[0],
        dueDate: newSchedule[0]?.date || new Date().toISOString().split('T')[0],
        refundable: true,
        refundConditions: [
          'Si el comprador no obtiene crédito aprobado dentro del plazo establecido',
          'Si se detectan vicios ocultos en la propiedad no declarados por el vendedor'
        ],
        paymentMethod: selectedPaymentMethod,
        recipient: 'Notaría o fiduciaria',
        includesCartaIntencion: promiseCommitment,
        cartaIntencionDetails: promiseCommitment
          ? 'Carta de intención formal con promesa de compraventa'
          : undefined
      };

      onEarnestMoneyChange(earnestMoneyData);
      logDebug('Updated earnest money', earnestMoneyData);
    }
  };

  const resetToDefaults = () => {
    setConditions(DEFAULT_NEGOTIATION_CONDITIONS);
    setInitialPaymentPercentage([20]);
    setPromiseCommitment(false);
    setIntermediatePayments([]);
    onScheduleChange([]);
    onEarnestMoneyChange(null);
    logDebug('Reset to default conditions');
  };

  const addIntermediatePayment = () => {
    // Reset form
    setAdvancedPaymentForm({
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: propertyPrice * 0.1,
      currency: 'COP',
      paymentMethod: selectedPaymentMethod,
      description: 'Pago intermedio',
      recipient: 'Por definir',
      verificationRequired: true,
      contingencies: [],
      otherConditions: ''
    });
    setEditingPaymentIndex(null);
    setShowAdvancedPaymentModal(true);
    logDebug('Opened advanced payment modal for new payment');
  };

  const editIntermediatePayment = (index: number) => {
    const payment = intermediatePayments[index];
    setAdvancedPaymentForm({
      date: payment.date,
      amount: payment.amount,
      currency: 'COP', // Assuming COP for now, could be extended
      paymentMethod: payment.paymentMethod,
      description: payment.description,
      recipient: payment.recipient || '',
      verificationRequired: payment.verificationRequired,
      contingencies: payment.contingencies || [],
      otherConditions: payment.otherConditions || '' // Campo adicional
    });
    setEditingPaymentIndex(index);
    setShowAdvancedPaymentModal(true);
    logDebug('Opened advanced payment modal for editing', { index, payment });
  };

  const saveAdvancedPayment = () => {
    const paymentData: PaymentSchedule = {
      id: editingPaymentIndex !== null
        ? intermediatePayments[editingPaymentIndex].id
        : `intermediate_${Date.now()}`,
      date: advancedPaymentForm.date,
      amount: advancedPaymentForm.amount,
      description: advancedPaymentForm.description,
      paymentMethod: advancedPaymentForm.paymentMethod,
      recipient: advancedPaymentForm.recipient,
      verificationRequired: advancedPaymentForm.verificationRequired,
      contingencies: advancedPaymentForm.contingencies,
      otherConditions: advancedPaymentForm.otherConditions
    };

    if (editingPaymentIndex !== null) {
      // Edit existing
      const updated = [...intermediatePayments];
      updated[editingPaymentIndex] = paymentData;
      setIntermediatePayments(updated);
      logDebug('Updated intermediate payment', { index: editingPaymentIndex, payment: paymentData });
    } else {
      // Add new
      setIntermediatePayments(prev => [...prev, paymentData]);
      logDebug('Added new intermediate payment', paymentData);
    }

    setShowAdvancedPaymentModal(false);
  };

  const togglePaymentCondition = (conditionType: PaymentContingency['type']) => {
    const conditionData = PAYMENT_CONDITIONS.find(c => c.type === conditionType);
    if (!conditionData) return;

    setAdvancedPaymentForm(prev => {
      const existingIndex = prev.contingencies.findIndex(c => c.type === conditionType);

      if (existingIndex >= 0) {
        // Remove condition
        const updated = prev.contingencies.filter(c => c.type !== conditionType);
        return { ...prev, contingencies: updated };
      } else {
        // Add condition
        const newCondition: PaymentContingency = {
          type: conditionType,
          description: conditionData.description,
          required: true,
          verificationMethod: 'documento',
          documentRequired: conditionData.documentRequired,
          responsibleParty: conditionData.responsibleParty
        };
        return { ...prev, contingencies: [...prev.contingencies, newCondition] };
      }
    });
  };

  const removeIntermediatePayment = (index: number) => {
    setIntermediatePayments(prev => prev.filter((_, i) => i !== index));
    logDebug('Removed intermediate payment', { index });
  };

  const updateCondition = (id: string, updates: Partial<NegotiationCondition>) => {
    setConditions(prev => prev.map(condition =>
      condition.id === id ? { ...condition, ...updates } : condition
    ));
    logDebug('Updated condition', { id, updates });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con controles */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  Negociación Interactiva de Pagos
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Configura tu oferta de manera inteligente y atractiva
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="debug-mode" className="text-sm">Debug</Label>
                <Switch
                  id="debug-mode"
                  checked={debugMode}
                  onCheckedChange={setDebugMode}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {showPreview ? 'Ocultar' : 'Vista Previa'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Precio Total</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(propertyPrice)}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-medium">Programado</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(totalScheduled)}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
              <p className="text-sm text-orange-600 font-medium">Restante</p>
              <p className="text-2xl font-bold text-orange-900">{formatCurrency(remainingAmount)}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progreso de la oferta</span>
              <span>{completionPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Modo de Negociación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            Modo de Negociación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button
              variant={negotiationMode === 'basic' ? 'default' : 'outline'}
              onClick={() => setNegotiationMode('basic')}
            >
              Básico
            </Button>
            <Button
              variant={negotiationMode === 'advanced' ? 'default' : 'outline'}
              onClick={() => setNegotiationMode('advanced')}
            >
              Avanzado
            </Button>
          </div>

          {negotiationMode === 'basic' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Negociación Simplificada</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Configura un pago inicial atractivo y deja el resto para el día de la firma.
                </p>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Porcentaje de Pago Inicial</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        value={initialPaymentPercentage}
                        onValueChange={setInitialPaymentPercentage}
                        max={40}
                        min={0}
                        step={5}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-12">{initialPaymentPercentage[0]}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Monto: {formatCurrency((propertyPrice * initialPaymentPercentage[0]) / 100)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={promiseCommitment}
                      onCheckedChange={setPromiseCommitment}
                    />
                    <Label className="text-sm">
                      Incluir compromiso con promesa de compraventa
                    </Label>
                  </div>

                  {promiseCommitment && (
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        El pago inicial se hará efectivo al firmar la promesa de compraventa,
                        asegurando la seriedad de la oferta.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          )}

          {negotiationMode === 'advanced' && (
            <div className="space-y-6">
              <Alert>
                <Calculator className="h-4 w-4" />
                <div className="text-sm">
                  Modo avanzado: Configura pagos intermedios y condiciones específicas
                  para crear una oferta más sofisticada.
                </div>
              </Alert>

              {/* Vista de Calendario de Pagos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Calendario de Pagos Programados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Pago Inicial */}
                    {initialPaymentPercentage[0] > 0 && (
                      <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-blue-900">Pago Inicial</h4>
                            <Badge variant="outline" className="text-xs">
                              {initialPaymentPercentage[0]}% del total
                            </Badge>
                            {promiseCommitment && (
                              <Badge variant="secondary" className="text-xs">
                                Con promesa
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-blue-700 mb-2">
                            Monto: {formatCurrency((propertyPrice * initialPaymentPercentage[0]) / 100)}
                          </p>
                          <p className="text-xs text-blue-600">
                            Fecha programada: {promiseCommitment
                              ? new Date(conditions.find(c => c.type === 'escritura_firma')?.date || '').toLocaleDateString('es-CO', {
                                  year: 'numeric', month: 'long', day: 'numeric'
                                })
                              : 'Inmediato'
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Pagos Intermedios */}
                    {intermediatePayments.map((payment, index) => (
                      <div key={payment.id} className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Clock className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-green-900">{payment.description}</h4>
                            <Badge variant="outline" className="text-xs">
                              {COLOMBIAN_PAYMENT_METHODS.find(m => m.value === payment.paymentMethod)?.label}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <p className="text-sm text-green-700">
                              💰 {formatCurrency(payment.amount)}
                            </p>
                            <p className="text-sm text-green-700">
                              📅 {new Date(payment.date).toLocaleDateString('es-CO', {
                                year: 'numeric', month: 'long', day: 'numeric'
                              })}
                            </p>
                            <p className="text-sm text-green-700">
                              🏢 {payment.recipient}
                            </p>
                            <p className="text-sm text-green-700">
                              📋 {payment.contingencies?.length || 0} condiciones
                            </p>
                          </div>

                          {/* Mostrar condiciones del pago */}
                          {payment.contingencies && payment.contingencies.length > 0 && (
                            <div className="mt-3 p-3 bg-white rounded border">
                              <h5 className="text-xs font-medium text-green-800 mb-2">Condiciones del pago:</h5>
                              <div className="space-y-1">
                                {payment.contingencies.map((condition, condIndex) => {
                                  const conditionData = PAYMENT_CONDITIONS.find(c => c.type === condition.type);
                                  const IconComponent = conditionData?.icon || FileText;

                                  return (
                                    <div key={condIndex} className="flex items-center gap-2 text-xs">
                                      <IconComponent className="h-3 w-3 text-green-600" />
                                      <span className="text-green-800">{conditionData?.label || condition.description}</span>
                                      <Badge
                                        variant={condition.responsibleParty === 'comprador' ? 'default' :
                                                 condition.responsibleParty === 'vendedor' ? 'secondary' : 'outline'}
                                        className="text-xs px-1 py-0"
                                      >
                                        {condition.responsibleParty === 'comprador' ? 'Comprador' :
                                         condition.responsibleParty === 'vendedor' ? 'Vendedor' :
                                         condition.responsibleParty === 'notaria' ? 'Notaría' :
                                         condition.responsibleParty === 'banco' ? 'Banco' : 'Registro'}
                                      </Badge>
                                      {condition.documentRequired && (
                                        <FileText className="h-3 w-3 text-orange-600" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Mostrar otras condiciones si existen */}
                          {payment.otherConditions && (
                            <div className="mt-3 p-3 bg-white rounded border">
                              <h5 className="text-xs font-medium text-green-800 mb-1">Otras condiciones:</h5>
                              <p className="text-xs text-green-700">{payment.otherConditions}</p>
                            </div>
                          )}

                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => editIntermediatePayment(index)}
                            >
                              <Settings className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeIntermediatePayment(index)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pago Final */}
                    <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-purple-900">Pago Final</h4>
                          <Badge variant="outline" className="text-xs">
                            Escritura pública
                          </Badge>
                        </div>
                        <p className="text-sm text-purple-700 mb-2">
                          Monto restante: {formatCurrency(remainingAmount > 0 ? remainingAmount : 0)}
                        </p>
                        <p className="text-xs text-purple-600">
                          Fecha: {conditions.find(c => c.type === 'escritura_firma')?.date
                            ? new Date(conditions.find(c => c.type === 'escritura_firma')!.date).toLocaleDateString('es-CO', {
                                year: 'numeric', month: 'long', day: 'numeric'
                              })
                            : 'Por definir'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {intermediatePayments.length === 0 && initialPaymentPercentage[0] === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm">No hay pagos programados</p>
                      <p className="text-xs">Agrega pagos intermedios para ver el calendario completo</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Configuración de Márgenes de Fechas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-orange-600" />
                    Márgenes de Fechas para Condiciones
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Configura plazos antes/después de eventos clave para las condiciones de pago
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Márgenes para Pago Inicial */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-orange-900 border-b border-orange-200 pb-1">
                        Pago Inicial
                      </h4>
                      <div>
                        <Label className="text-sm">Días antes de promesa de compraventa</Label>
                        <Input
                          type="number"
                          placeholder="7"
                          className="mt-1"
                          min="0"
                          max="30"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Si el pago inicial requiere promesa, este es el margen antes de la firma
                        </p>
                      </div>
                    </div>

                    {/* Márgenes para Condiciones */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-orange-900 border-b border-orange-200 pb-1">
                        Condiciones de Pago
                      </h4>
                      <div>
                        <Label className="text-sm">Días para entregar documentos</Label>
                        <Input
                          type="number"
                          placeholder="15"
                          className="mt-1"
                          min="1"
                          max="90"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Margen de tiempo para que las partes entreguen documentos requeridos
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm">Días para verificaciones</Label>
                        <Input
                          type="number"
                          placeholder="5"
                          className="mt-1"
                          min="1"
                          max="30"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Tiempo para verificar cumplimiento de condiciones
                        </p>
                      </div>
                    </div>

                    {/* Márgenes para Escritura */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-orange-900 border-b border-orange-200 pb-1">
                        Escritura Pública
                      </h4>
                      <div>
                        <Label className="text-sm">Días antes del pago final</Label>
                        <Input
                          type="number"
                          placeholder="1"
                          className="mt-1"
                          min="0"
                          max="7"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Margen entre escritura y pago final (usualmente el mismo día)
                        </p>
                      </div>
                    </div>

                    {/* Recordatorios */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-orange-900 border-b border-orange-200 pb-1">
                        Recordatorios
                      </h4>
                      <div>
                        <Label className="text-sm">Días de anticipación para notificaciones</Label>
                        <Input
                          type="number"
                          placeholder="7"
                          className="mt-1"
                          min="1"
                          max="30"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Días antes de cada fecha límite para enviar recordatorios
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="auto-reminders"
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="auto-reminders" className="text-sm">
                          Recordatorios automáticos
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <div className="text-sm">
                      Estos márgenes ayudan a crear un cronograma realista y evitan contratiempos
                      en el proceso de negociación. Los valores sugeridos son estándares del mercado colombiano.
                    </div>
                  </Alert>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Pago Inicial (%)</Label>
                  <Input
                    type="number"
                    value={initialPaymentPercentage[0]}
                    onChange={(e) => setInitialPaymentPercentage([Number(e.target.value)])}
                    min="0"
                    max="40"
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={promiseCommitment}
                    onCheckedChange={setPromiseCommitment}
                  />
                  <Label className="text-sm">Promesa de compraventa</Label>
                </div>
              </div>

              {/* Pagos Intermedios */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Pagos Intermedios</Label>
                  <Button size="sm" onClick={addIntermediatePayment}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Pago Detallado
                  </Button>
                </div>

                {intermediatePayments.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No hay pagos intermedios configurados
                  </p>
                ) : (
                  <div className="space-y-2">
                    {intermediatePayments.map((payment, index) => (
                      <div key={payment.id} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{payment.description}</h4>
                              <Badge variant="outline" className="text-xs">
                                {COLOMBIAN_PAYMENT_METHODS.find(m => m.value === payment.paymentMethod)?.label}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                              <div>📅 {new Date(payment.date).toLocaleDateString('es-CO')}</div>
                              <div>💰 {formatCurrency(payment.amount)}</div>
                              <div>🏢 {payment.recipient}</div>
                              <div>📋 {payment.contingencies?.length || 0} condiciones</div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => editIntermediatePayment(index)}
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeIntermediatePayment(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button onClick={applyNegotiationChanges} className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Aplicar Cambios
            </Button>
            <Button variant="outline" onClick={resetToDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reiniciar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Condiciones de Negociación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Condiciones de Negociación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {conditions.map((condition) => (
              <div
                key={condition.id}
                className={`p-4 border rounded-lg ${
                  condition.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1 rounded-full ${
                    condition.completed ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {condition.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{condition.title}</h4>
                      {condition.required && (
                        <Badge variant="destructive" className="text-xs">Requerido</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{condition.description}</p>

                    {condition.type === 'escritura_firma' && (
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Fecha programada:</Label>
                        <Input
                          type="date"
                          value={condition.date}
                          onChange={(e) => updateCondition(condition.id, { date: e.target.value })}
                          className="w-auto"
                        />
                      </div>
                    )}

                    {condition.amount && (
                      <p className="text-sm font-medium">
                        Monto: {formatCurrency(condition.amount)}
                      </p>
                    )}
                  </div>

                  {!condition.completed && (
                    <Button
                      size="sm"
                      onClick={() => updateCondition(condition.id, { completed: true })}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Método de Pago */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Método de Pago Principal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {COLOMBIAN_PAYMENT_METHODS.map((method) => {
              const IconComponent = PAYMENT_METHOD_ICONS[method.value];
              const isSelected = selectedPaymentMethod === method.value;

              return (
                <div
                  key={method.value}
                  className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => onMethodChange(method.value)}
                >
                  <div className="flex items-start gap-2">
                    <IconComponent className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      isSelected ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-medium truncate ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {method.label}
                      </h3>
                      <Badge className={`text-xs mt-1 ${getRiskBadgeColor(method.risk)}`}>
                        Riesgo {method.risk === 'low' ? 'Bajo' :
                               method.risk === 'medium' ? 'Medio' :
                               method.risk === 'high' ? 'Alto' : 'Crítico'}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedMethodData && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <div className="text-sm">
                <strong>Método seleccionado:</strong> {selectedMethodData.label} -
                {selectedMethodData.description}
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Vista Previa */}
      {showPreview && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Eye className="h-5 w-5" />
              Vista Previa de la Oferta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-purple-900 mb-2">Resumen de Pagos</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Precio total:</strong> {formatCurrency(propertyPrice)}</p>
                    <p><strong>Pago inicial:</strong> {initialPaymentPercentage[0]}% ({formatCurrency((propertyPrice * initialPaymentPercentage[0]) / 100)})</p>
                    <p><strong>Pagos intermedios:</strong> {intermediatePayments.length}</p>
                    <p><strong>Método de pago:</strong> {selectedMethodData?.label}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-purple-900 mb-2">Condiciones Clave</h4>
                  <div className="space-y-2 text-sm">
                    {conditions.filter(c => c.completed).map(condition => (
                      <div key={condition.id} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>{condition.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  Esta vista previa muestra cómo se verá tu oferta. Los cambios se aplicarán
                  cuando hagas clic en "Aplicar Cambios".
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Panel */}
      {debugMode && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <Settings className="h-5 w-5" />
              Debug Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs font-mono">
              <p><strong>Property Price:</strong> {propertyPrice}</p>
              <p><strong>Selected Method:</strong> {selectedPaymentMethod}</p>
              <p><strong>Payment Schedule Length:</strong> {paymentSchedule.length}</p>
              <p><strong>Initial Payment %:</strong> {initialPaymentPercentage[0]}</p>
              <p><strong>Promise Commitment:</strong> {promiseCommitment ? 'Yes' : 'No'}</p>
              <p><strong>Conditions Count:</strong> {conditions.length}</p>
              <p><strong>Completed Conditions:</strong> {conditions.filter(c => c.completed).length}</p>
              <p><strong>Total Scheduled:</strong> {formatCurrency(totalScheduled)}</p>
              <p><strong>Remaining:</strong> {formatCurrency(remainingAmount)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Pago Avanzado */}
      <Dialog open={showAdvancedPaymentModal} onOpenChange={setShowAdvancedPaymentModal}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              {editingPaymentIndex !== null ? 'Editar Pago Intermedio' : 'Agregar Pago Intermedio Detallado'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica del Pago */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Información del Pago</h3>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Descripción</Label>
                  <Input
                    value={advancedPaymentForm.description}
                    onChange={(e) => setAdvancedPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ej: Pago por mejoras realizadas"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Monto</Label>
                    <Input
                      type="number"
                      value={advancedPaymentForm.amount}
                      onChange={(e) => setAdvancedPaymentForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Moneda</Label>
                    <Select
                      value={advancedPaymentForm.currency}
                      onValueChange={(value: 'COP' | 'USD' | 'EUR') =>
                        setAdvancedPaymentForm(prev => ({ ...prev, currency: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
                        <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Fecha programada</Label>
                  <Input
                    type="date"
                    value={advancedPaymentForm.date}
                    onChange={(e) => setAdvancedPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Método de pago</Label>
                  <Select
                    value={advancedPaymentForm.paymentMethod}
                    onValueChange={(value) =>
                      setAdvancedPaymentForm(prev => ({ ...prev, paymentMethod: value as ColombianPaymentMethod }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOMBIAN_PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Beneficiario</Label>
                  <Input
                    value={advancedPaymentForm.recipient}
                    onChange={(e) => setAdvancedPaymentForm(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder="Cuenta bancaria, wallet, etc."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={advancedPaymentForm.verificationRequired}
                    onCheckedChange={(checked) =>
                      setAdvancedPaymentForm(prev => ({ ...prev, verificationRequired: checked }))
                    }
                  />
                  <Label className="text-sm">Requiere verificación bancaria</Label>
                </div>

                <div>
                  <Label className="text-sm font-medium">Otras Condiciones</Label>
                  <Textarea
                    value={advancedPaymentForm.otherConditions}
                    onChange={(e) => setAdvancedPaymentForm(prev => ({ ...prev, otherConditions: e.target.value }))}
                    placeholder="Especifique cualquier otra condición adicional para este pago..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Condiciones del Pago */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">
                Condiciones del Pago ({advancedPaymentForm.contingencies.length} seleccionadas)
              </h3>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {PAYMENT_CONDITIONS.map((condition) => {
                  const isSelected = advancedPaymentForm.contingencies.some(c => c.type === condition.type);
                  const IconComponent = condition.icon;

                  return (
                    <div
                      key={condition.type}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => togglePaymentCondition(condition.type)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1 rounded ${
                          isSelected ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <IconComponent className={`h-4 w-4 ${
                            isSelected ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{condition.label}</h4>
                            <Badge
                              variant={condition.responsibleParty === 'comprador' ? 'default' :
                                     condition.responsibleParty === 'vendedor' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {condition.responsibleParty === 'comprador' ? 'Comprador' :
                               condition.responsibleParty === 'vendedor' ? 'Vendedor' :
                               condition.responsibleParty === 'notaria' ? 'Notaría' :
                               condition.responsibleParty === 'banco' ? 'Banco' : 'Registro'}
                            </Badge>
                            {condition.documentRequired && (
                              <FileText className="h-3 w-3 text-orange-600" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600">{condition.description}</p>
                        </div>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => togglePaymentCondition(condition.type)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {advancedPaymentForm.contingencies.length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Se han seleccionado {advancedPaymentForm.contingencies.length} condiciones para este pago.
                    Cada condición requerirá verificación antes del desembolso.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedPaymentModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={saveAdvancedPayment}
              disabled={!advancedPaymentForm.description || advancedPaymentForm.amount <= 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {editingPaymentIndex !== null ? 'Actualizar Pago' : 'Guardar Pago'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
