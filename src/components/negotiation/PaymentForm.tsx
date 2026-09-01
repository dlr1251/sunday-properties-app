import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Calculator,
  CreditCard,
  DollarSign,
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Coins,
  Building2,
  FileText,
  ArrowRightLeft,
  Shuffle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { getIntlLocale } from '../../i18n';

import {
  ColombianPaymentMethod,
  ColombianPaymentStructure,
  PaymentSchedule,
  PaymentContingency,
  BankingDetails,
  CryptoDetails,
  FinancingDetails,
  COLOMBIAN_PAYMENT_METHODS,
  validateColombianPayment,
  calculatePaymentRisk
} from '@/types/payments';

interface PaymentFormProps {
  propertyPrice: number;
  currentPayment?: ColombianPaymentStructure;
  onSubmit: (payment: ColombianPaymentStructure) => void;
  onCancel?: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const PAYMENT_METHOD_ICONS: Record<ColombianPaymentMethod, React.ComponentType<{ className?: string }>> = {
  'efectivo': DollarSign,
  'transferencia_bancaria': CreditCard,
  'cheque': FileText,
  'financiacion_bancaria': Building2,
  'financiacion_vendedor': Building2,
  'cuotas': Calendar,
  'criptomonedas': Coins,
  'permuta': ArrowRightLeft,
  'metales_preciosos': Coins,
  'pago_a_terceros': CreditCard,
  'mixto': Shuffle
};

export function PaymentForm({
  propertyPrice,
  currentPayment,
  onSubmit,
  onCancel,
  isOpen,
  onOpenChange
}: PaymentFormProps) {
  const [payment, setPayment] = useState<ColombianPaymentStructure>(() => ({
    method: 'transferencia_bancaria',
    totalAmount: propertyPrice,
    currency: 'COP',
    paymentSchedule: [],
    contingencies: [],
    riskLevel: 'low',
    requiresDianReporting: false,
    internationalTransfer: false,
    requiresNotary: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1
  }));

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [validation, setValidation] = useState<any>(null);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);

  // Initialize with current payment if provided
  useEffect(() => {
    if (currentPayment) {
      setPayment(currentPayment);
    } else {
      setPayment(prev => ({ ...prev, totalAmount: propertyPrice }));
    }
  }, [currentPayment, propertyPrice]);

  // Real-time validation
  useEffect(() => {
    if (payment.totalAmount > 0) {
      const validationResult = validateColombianPayment(payment);
      setValidation(validationResult);

      // Update risk level
      const riskScore = calculatePaymentRisk(payment);
      const riskLevel = riskScore <= 3 ? 'low' : riskScore <= 6 ? 'medium' : riskScore <= 8 ? 'high' : 'critical';
      setPayment(prev => ({ ...prev, riskLevel: riskLevel as any }));
    }
  }, [payment]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(getIntlLocale(), {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getSelectedMethod = () => {
    return COLOMBIAN_PAYMENT_METHODS.find(m => m.value === payment.method);
  };

  const addPaymentScheduleItem = (item: Omit<PaymentSchedule, 'id'>) => {
    const newItem: PaymentSchedule = {
      ...item,
      id: `payment_${Date.now()}_${Math.random()}`
    };

    setPayment(prev => ({
      ...prev,
      paymentSchedule: [...prev.paymentSchedule, newItem]
    }));
  };

  const removePaymentScheduleItem = (id: string) => {
    setPayment(prev => ({
      ...prev,
      paymentSchedule: prev.paymentSchedule.filter(item => item.id !== id)
    }));
  };

  const updatePaymentScheduleItem = (id: string, updates: Partial<PaymentSchedule>) => {
    setPayment(prev => ({
      ...prev,
      paymentSchedule: prev.paymentSchedule.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  };

  const addContingency = (contingency: PaymentContingency) => {
    setPayment(prev => ({
      ...prev,
      contingencies: [...prev.contingencies, contingency]
    }));
  };

  const removeContingency = (index: number) => {
    setPayment(prev => ({
      ...prev,
      contingencies: prev.contingencies.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!payment.method || payment.totalAmount <= 0) {
      return;
    }

    // Validate payment schedule totals
    const totalScheduled = payment.paymentSchedule.reduce((sum, item) => sum + item.amount, 0);
    if (Math.abs(totalScheduled - payment.totalAmount) > 1000) {
      alert('La suma de los pagos programados no coincide con el monto total');
      return;
    }

    onSubmit({
      ...payment,
      updatedAt: new Date().toISOString(),
      version: payment.version + 1
    });
    onOpenChange(false);
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-[95vw] max-h-[95vh] overflow-y-auto md:w-[96vw] lg:w-[94vw] xl:w-[92vw] 2xl:max-w-[1400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Configurar Método de Pago
          </DialogTitle>
          <p className="text-muted-foreground">
            Valor de referencia: {formatCurrency(propertyPrice)}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Monto Total */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monto Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Monto total *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="totalAmount"
                      type="number"
                      value={payment.totalAmount}
                      onChange={(e) => setPayment(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
                      className="pl-10"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select
                    value={payment.currency}
                    onValueChange={(value: 'COP' | 'USD' | 'EUR') => setPayment(prev => ({ ...prev, currency: value }))}
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

              {/* Risk Level */}
              <div className="mt-4 flex items-center gap-2">
                <Label>Nivel de riesgo:</Label>
                <Badge className={getRiskBadgeColor(payment.riskLevel)}>
                  {payment.riskLevel === 'low' ? 'Bajo' :
                   payment.riskLevel === 'medium' ? 'Medio' :
                   payment.riskLevel === 'high' ? 'Alto' : 'Crítico'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Método de Pago */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Método de Pago Principal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {COLOMBIAN_PAYMENT_METHODS.map((method) => {
                  const IconComponent = PAYMENT_METHOD_ICONS[method.value];
                  const isSelected = payment.method === method.value;

                  return (
                    <div
                      key={method.value}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-border hover:border-border'
                      }`}
                      onClick={() => setPayment(prev => ({ ...prev, method: method.value }))}
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent className={`h-5 w-5 mt-0.5 ${
                          isSelected ? 'text-blue-600' : 'text-muted-foreground'
                        }`} />
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{method.label}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              Riesgo {method.risk === 'low' ? 'Bajo' :
                                     method.risk === 'medium' ? 'Medio' :
                                     method.risk === 'high' ? 'Alto' : 'Crítico'}
                            </Badge>
                            {method.requiresVerification && (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detalles específicos del método seleccionado */}
              {getSelectedMethod()?.legalNotes && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <ul className="list-disc list-inside text-sm">
                    {getSelectedMethod()?.legalNotes?.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              {/* Detalles bancarios para transferencias */}
              {(payment.method === 'transferencia_bancaria' || payment.method === 'cheque') && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">Detalles Bancarios</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Banco</Label>
                      <Input
                        id="bankName"
                        value={payment.bankingDetails?.bankName || ''}
                        onChange={(e) => setPayment(prev => ({
                          ...prev,
                          bankingDetails: {
                            ...prev.bankingDetails,
                            bankName: e.target.value,
                            accountType: prev.bankingDetails?.accountType || 'corriente',
                            accountNumber: prev.bankingDetails?.accountNumber || '',
                            accountHolder: prev.bankingDetails?.accountHolder || '',
                            accountHolderId: prev.bankingDetails?.accountHolderId || '',
                            verificationRequired: true
                          } as BankingDetails
                        }))}
                        placeholder="Ej: Bancolombia"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Número de cuenta</Label>
                      <Input
                        id="accountNumber"
                        value={payment.bankingDetails?.accountNumber || ''}
                        onChange={(e) => setPayment(prev => ({
                          ...prev,
                          bankingDetails: {
                            ...prev.bankingDetails!,
                            accountNumber: e.target.value
                          }
                        }))}
                        placeholder="Ej: 123-456789-0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Detalles cripto */}
              {payment.method === 'criptomonedas' && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">Detalles Criptomonedas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cryptoCurrency">Criptomoneda</Label>
                      <Select
                        value={payment.cryptoDetails?.currency || 'bitcoin'}
                        onValueChange={(value: 'bitcoin' | 'ethereum' | 'usdt' | 'dai' | 'other') => setPayment(prev => ({
                          ...prev,
                          cryptoDetails: {
                            ...prev.cryptoDetails,
                            currency: value,
                            walletAddress: prev.cryptoDetails?.walletAddress || '',
                            network: value === 'bitcoin' ? 'bitcoin' : 'ethereum',
                            verificationRequired: true
                          } as CryptoDetails
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                          <SelectItem value="usdt">Tether (USDT)</SelectItem>
                          <SelectItem value="dai">Dai (DAI)</SelectItem>
                          <SelectItem value="other">Otra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="walletAddress">Dirección de Wallet</Label>
                      <Input
                        id="walletAddress"
                        value={payment.cryptoDetails?.walletAddress || ''}
                        onChange={(e) => setPayment(prev => ({
                          ...prev,
                          cryptoDetails: {
                            ...prev.cryptoDetails!,
                            walletAddress: e.target.value
                          }
                        }))}
                        placeholder="Ej: bc1q..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pago Inicial/Arras */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pago Inicial (Arras)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="earnestAmount">Monto</Label>
                  <Input
                    id="earnestAmount"
                    type="number"
                    value={payment.earnestMoney?.amount || ''}
                    onChange={(e) => setPayment(prev => ({
                      ...prev,
                      earnestMoney: {
                        ...prev.earnestMoney,
                        amount: Number(e.target.value),
                        percentage: prev.earnestMoney ? (Number(e.target.value) / payment.totalAmount) * 100 : 0,
                        dueDate: prev.earnestMoney?.dueDate || new Date().toISOString().split('T')[0],
                        refundable: prev.earnestMoney?.refundable ?? true
                      }
                    }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="earnestDate">Fecha límite</Label>
                  <Input
                    id="earnestDate"
                    type="date"
                    value={payment.earnestMoney?.dueDate || ''}
                    onChange={(e) => setPayment(prev => ({
                      ...prev,
                      earnestMoney: {
                        ...prev.earnestMoney!,
                        dueDate: e.target.value
                      }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>¿Reembolsable?</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="refundable"
                      checked={payment.earnestMoney?.refundable ?? true}
                      onCheckedChange={(checked) => setPayment(prev => ({
                        ...prev,
                        earnestMoney: {
                          ...prev.earnestMoney!,
                          refundable: !!checked
                        }
                      }))}
                    />
                    <Label htmlFor="refundable" className="text-sm">Sí, reembolsable</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cronograma de Pagos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Cronograma de Pagos
                <Button
                  size="sm"
                  onClick={() => setShowAddPaymentDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Pago
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payment.paymentSchedule.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay pagos programados</p>
                  <p className="text-sm">Agregue pagos para completar el cronograma</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payment.paymentSchedule.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <Label className="text-xs text-muted-foreground">Fecha</Label>
                            <p className="font-medium">{new Date(item.date).toLocaleDateString(getIntlLocale())}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Monto</Label>
                            <p className="font-medium">{formatCurrency(item.amount)}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Método</Label>
                            <p className="font-medium capitalize">{item.paymentMethod.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Descripción</Label>
                            <p className="font-medium text-xs">{item.description}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removePaymentScheduleItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total programado:</span>
                      <span className="font-bold text-lg">
                        {formatCurrency(payment.paymentSchedule.reduce((sum, item) => sum + item.amount, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Diferencia con total:</span>
                      <span className={payment.paymentSchedule.reduce((sum, item) => sum + item.amount, 0) === payment.totalAmount ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(payment.paymentSchedule.reduce((sum, item) => sum + item.amount, 0) - payment.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validaciones Legales */}
          {validation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validación Legal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {validation.dianCompliance.reportable && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Este pago debe reportarse a la DIAN (monto &gt; {formatCurrency(validation.dianCompliance.threshold)})
                    </AlertDescription>
                  </Alert>
                )}

                {validation.antiMoneyLaundering.flags.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Banderas anti-lavado detectadas:</p>
                      <ul className="list-disc list-inside mt-2">
                        {validation.antiMoneyLaundering.flags.map((flag: string, index: number) => (
                          <li key={index}>{flag}</li>
                        ))}
                      </ul>
                      {validation.antiMoneyLaundering.recommendations.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Recomendaciones:</p>
                          <ul className="list-disc list-inside">
                            {validation.antiMoneyLaundering.recommendations.map((rec: string, index: number) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Alert>
                )}

                {validation.notaryRequirements.required && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Requiere notaría. Costo estimado: {formatCurrency(validation.notaryRequirements.estimatedCost)}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={false}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!payment.method || payment.totalAmount <= 0 || payment.paymentSchedule.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Guardar Configuración de Pago
          </Button>
        </DialogFooter>

        {/* Add Payment Dialog */}
        <AddPaymentDialog
          isOpen={showAddPaymentDialog}
          onClose={() => setShowAddPaymentDialog(false)}
          onAdd={addPaymentScheduleItem}
          totalAmount={payment.totalAmount}
          remainingAmount={payment.totalAmount - payment.paymentSchedule.reduce((sum, item) => sum + item.amount, 0)}
        />
      </DialogContent>
    </Dialog>
  );
}

// Componente auxiliar para agregar pagos al cronograma
interface AddPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (payment: Omit<PaymentSchedule, 'id'>) => void;
  totalAmount: number;
  remainingAmount: number;
}

function AddPaymentDialog({ isOpen, onClose, onAdd, totalAmount, remainingAmount }: AddPaymentDialogProps) {
  const [payment, setPayment] = useState<Omit<PaymentSchedule, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: '',
    paymentMethod: 'transferencia_bancaria',
    recipient: '',
    verificationRequired: true,
    contingencies: []
  });

  const handleSubmit = () => {
    if (!payment.date || payment.amount <= 0 || !payment.description) {
      return;
    }

    onAdd(payment);
    setPayment({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      description: '',
      paymentMethod: 'transferencia_bancaria',
      recipient: '',
      verificationRequired: true,
      contingencies: []
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Pago al Cronograma</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Fecha *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={payment.date}
                onChange={(e) => setPayment(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Monto *</Label>
              <Input
                id="paymentAmount"
                type="number"
                value={payment.amount}
                onChange={(e) => setPayment(prev => ({ ...prev, amount: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pago</Label>
            <Select
              value={payment.paymentMethod}
              onValueChange={(value: ColombianPaymentMethod) => setPayment(prev => ({ ...prev, paymentMethod: value }))}
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

          <div className="space-y-2">
            <Label htmlFor="paymentDescription">Descripción *</Label>
            <Textarea
              id="paymentDescription"
              value={payment.description}
              onChange={(e) => setPayment(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ej: Pago inicial, Segundo pago, Saldo final..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentRecipient">Destinatario (opcional)</Label>
            <Input
              id="paymentRecipient"
              value={payment.recipient || ''}
              onChange={(e) => setPayment(prev => ({ ...prev, recipient: e.target.value }))}
              placeholder="Cuenta bancaria, wallet, etc."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="verificationRequired"
              checked={payment.verificationRequired}
              onCheckedChange={(checked) => setPayment(prev => ({ ...prev, verificationRequired: !!checked }))}
            />
            <Label htmlFor="verificationRequired" className="text-sm">
              Requiere verificación bancaria/comprobante
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!payment.date || payment.amount <= 0 || !payment.description}
          >
            Agregar Pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
