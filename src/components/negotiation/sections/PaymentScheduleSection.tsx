import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  Plus,
  Trash2,
  Calculator,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  FileText
} from 'lucide-react';
import { PaymentSchedule, ColombianPaymentMethod, COLOMBIAN_PAYMENT_METHODS } from '@/types/payments';

interface PaymentScheduleSectionProps {
  paymentSchedule: PaymentSchedule[];
  onScheduleChange: (schedule: PaymentSchedule[]) => void;
  totalAmount: number;
  selectedPaymentMethod: ColombianPaymentMethod;
  className?: string;
}

interface AddPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (payment: Omit<PaymentSchedule, 'id'>) => void;
  totalAmount: number;
  remainingAmount: number;
  selectedPaymentMethod: ColombianPaymentMethod;
}

export function PaymentScheduleSection({
  paymentSchedule,
  onScheduleChange,
  totalAmount,
  selectedPaymentMethod,
  className = ''
}: PaymentScheduleSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const addPayment = (payment: Omit<PaymentSchedule, 'id'>) => {
    const newPayment: PaymentSchedule = {
      ...payment,
      id: `payment_${Date.now()}_${Math.random()}`
    };
    onScheduleChange([...paymentSchedule, newPayment]);
  };

  const removePayment = (id: string) => {
    onScheduleChange(paymentSchedule.filter(p => p.id !== id));
  };

  const updatePayment = (id: string, updates: Partial<PaymentSchedule>) => {
    onScheduleChange(paymentSchedule.map(p =>
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const totalScheduled = paymentSchedule.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = totalAmount - totalScheduled;
  const isComplete = Math.abs(remainingAmount) < 1000; // Tolerancia de $1000

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Cronograma de Pagos
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar Pago
          </Button>
        </CardTitle>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total programado</p>
            <p className="text-lg font-bold text-blue-900">{formatCurrency(totalScheduled)}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Monto total</p>
            <p className="text-lg font-bold text-green-900">{formatCurrency(totalAmount)}</p>
          </div>
          <div className={`text-center p-3 rounded-lg ${isComplete ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`text-sm font-medium ${isComplete ? 'text-green-600' : 'text-red-600'}`}>
              {isComplete ? 'Completado' : 'Diferencia'}
            </p>
            <p className={`text-lg font-bold ${isComplete ? 'text-green-900' : 'text-red-900'}`}>
              {isComplete ? '✓' : formatCurrency(remainingAmount)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {paymentSchedule.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No hay pagos programados</p>
            <p className="text-sm mb-4">Agregue pagos para completar el cronograma</p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primer Pago
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Lista de pagos programados */}
            <div className="space-y-3">
              {paymentSchedule
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((payment, index) => (
                  <div
                    key={payment.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    {/* Número de pago */}
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>

                    {/* Información del pago */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs text-gray-600">Fecha</Label>
                        <p className="font-medium text-sm">
                          {new Date(payment.date).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Monto</Label>
                        <p className="font-medium text-sm text-green-600">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Método</Label>
                        <Badge variant="outline" className="text-xs">
                          {COLOMBIAN_PAYMENT_METHODS.find(m => m.value === payment.paymentMethod)?.label ||
                           payment.paymentMethod.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Descripción</Label>
                        <p className="text-sm text-gray-700 truncate">
                          {payment.description || 'Sin descripción'}
                        </p>
                      </div>
                    </div>

                    {/* Estado de verificación */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {payment.verificationRequired ? (
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                          <Clock className="h-3 w-3" />
                          <span>Requiere verificación</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>Verificado</span>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removePayment(payment.id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Alertas de validación */}
            {!isComplete && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  La suma de los pagos programados ({formatCurrency(totalScheduled)})
                  no coincide con el monto total ({formatCurrency(totalAmount)}).
                  Diferencia: {formatCurrency(Math.abs(remainingAmount))}
                </AlertDescription>
              </Alert>
            )}

            {paymentSchedule.length > 0 && (
              <Alert>
                <Calculator className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recomendación:</strong> Un cronograma con pagos distribuidos en el tiempo
                  reduce el riesgo y mejora el flujo de caja para ambas partes.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>

      {/* Dialog para agregar pago */}
      <AddPaymentDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={addPayment}
        totalAmount={totalAmount}
        remainingAmount={remainingAmount}
        selectedPaymentMethod={selectedPaymentMethod}
      />
    </Card>
  );
}

// Componente auxiliar para agregar pagos
function AddPaymentDialog({
  isOpen,
  onClose,
  onAdd,
  totalAmount,
  remainingAmount,
  selectedPaymentMethod
}: AddPaymentDialogProps) {
  const [payment, setPayment] = useState<Omit<PaymentSchedule, 'id'>>({
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días
    amount: Math.max(0, remainingAmount),
    description: '',
    paymentMethod: selectedPaymentMethod,
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
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: Math.max(0, remainingAmount - payment.amount),
      description: '',
      paymentMethod: selectedPaymentMethod,
      recipient: '',
      verificationRequired: true,
      contingencies: []
    });
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-blue-600" />
          Agregar Pago al Cronograma
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Fecha *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={payment.date}
                onChange={(e) => setPayment(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
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
              onValueChange={(value: ColombianPaymentMethod) =>
                setPayment(prev => ({ ...prev, paymentMethod: value }))
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="verificationRequired"
              checked={payment.verificationRequired}
              onChange={(e) => setPayment(prev => ({ ...prev, verificationRequired: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="verificationRequired" className="text-sm">
              Requiere verificación bancaria/comprobante
            </Label>
          </div>

          {remainingAmount > 0 && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <strong>Monto restante por programar:</strong> {formatCurrency(remainingAmount)}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!payment.date || payment.amount <= 0 || !payment.description}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Agregar Pago
          </Button>
        </div>
      </div>
    </div>
  );
}
