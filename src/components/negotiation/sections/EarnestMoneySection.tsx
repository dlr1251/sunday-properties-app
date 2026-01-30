import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calculator,
  Info
} from 'lucide-react';

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

interface EarnestMoneySectionProps {
  earnestMoney: EarnestMoney | null;
  onEarnestMoneyChange: (earnestMoney: EarnestMoney | null) => void;
  propertyPrice: number;
  selectedPaymentMethod: string;
  negotiationRules?: any;
  className?: string;
}

export function EarnestMoneySection({
  earnestMoney,
  onEarnestMoneyChange,
  propertyPrice,
  selectedPaymentMethod,
  negotiationRules,
  className = ''
}: EarnestMoneySectionProps) {
  const [localEarnestMoney, setLocalEarnestMoney] = useState<EarnestMoney>({
    amount: propertyPrice * 0.1, // 10% por defecto
    percentage: 10,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 días
    refundable: true,
    refundConditions: [
      'Si el comprador no obtiene crédito aprobado dentro del plazo establecido',
      'Si se detectan vicios ocultos en la propiedad no declarados por el vendedor'
    ],
    paymentMethod: selectedPaymentMethod,
    recipient: '',
    includesCartaIntencion: true,
    cartaIntencionDetails: 'Carta de intención formal con condiciones específicas de la oferta'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (earnestMoney) {
      setLocalEarnestMoney(earnestMoney);
    }
  }, [earnestMoney]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAmountChange = (value: string) => {
    const amount = Number(value);
    const percentage = (amount / propertyPrice) * 100;
    setLocalEarnestMoney(prev => ({
      ...prev,
      amount,
      percentage: Math.round(percentage * 100) / 100
    }));
  };

  const handlePercentageChange = (value: string) => {
    const percentage = Number(value);
    const amount = (propertyPrice * percentage) / 100;
    setLocalEarnestMoney(prev => ({
      ...prev,
      percentage,
      amount: Math.round(amount)
    }));
  };

  const handleRefundConditionChange = (index: number, condition: string) => {
    const newConditions = [...localEarnestMoney.refundConditions];
    newConditions[index] = condition;
    setLocalEarnestMoney(prev => ({
      ...prev,
      refundConditions: newConditions
    }));
  };

  const addRefundCondition = () => {
    setLocalEarnestMoney(prev => ({
      ...prev,
      refundConditions: [...prev.refundConditions, '']
    }));
  };

  const removeRefundCondition = (index: number) => {
    setLocalEarnestMoney(prev => ({
      ...prev,
      refundConditions: prev.refundConditions.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onEarnestMoneyChange(localEarnestMoney.amount > 0 ? localEarnestMoney : null);
  };

  const isValid = localEarnestMoney.amount > 0 &&
                  localEarnestMoney.dueDate &&
                  localEarnestMoney.refundConditions.length > 0;

  // Validaciones de reglas de negociación
  const minEarnestMoney = negotiationRules?.minEarnestMoneyPercentage || 5;
  const maxEarnestMoney = negotiationRules?.maxEarnestMoneyPercentage || 20;
  const isPercentageValid = localEarnestMoney.percentage >= minEarnestMoney &&
                           localEarnestMoney.percentage <= maxEarnestMoney;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Pago Inicial / Arras
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Vista Simple' : 'Vista Avanzada'}
            </Button>
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Define el pago inicial que garantiza el compromiso de la oferta
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monto y porcentaje */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="earnestAmount">Monto *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="earnestAmount"
                type="number"
                value={localEarnestMoney.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pl-10"
                placeholder="0"
              />
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(localEarnestMoney.amount)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="earnestPercentage">Porcentaje *</Label>
            <div className="relative">
              <Input
                id="earnestPercentage"
                type="number"
                value={localEarnestMoney.percentage}
                onChange={(e) => handlePercentageChange(e.target.value)}
                min={minEarnestMoney}
                max={maxEarnestMoney}
                step={0.1}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
            {!isPercentageValid && (
              <p className="text-xs text-red-600">
                Debe estar entre {minEarnestMoney}% y {maxEarnestMoney}%
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="earnestDate">Fecha límite *</Label>
            <Input
              id="earnestDate"
              type="date"
              value={localEarnestMoney.dueDate}
              onChange={(e) => setLocalEarnestMoney(prev => ({
                ...prev,
                dueDate: e.target.value
              }))}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Método de pago */}
        <div className="space-y-2">
          <Label>Método de pago para arras</Label>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <Badge variant="outline" className="capitalize">
              {localEarnestMoney.paymentMethod.replace('_', ' ')}
            </Badge>
            <span className="text-sm text-gray-600">
              Se utilizará el mismo método que el pago principal
            </span>
          </div>
        </div>

        {/* Destinatario */}
        <div className="space-y-2">
          <Label htmlFor="earnestRecipient">Destinatario de la arras</Label>
          <Input
            id="earnestRecipient"
            value={localEarnestMoney.recipient}
            onChange={(e) => setLocalEarnestMoney(prev => ({
              ...prev,
              recipient: e.target.value
            }))}
            placeholder="Cuenta bancaria, fideicomiso, o entidad receptora"
          />
        </div>

        {/* Reembolsabilidad */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="refundable"
              checked={localEarnestMoney.refundable}
              onCheckedChange={(checked) => setLocalEarnestMoney(prev => ({
                ...prev,
                refundable: !!checked
              }))}
            />
            <Label htmlFor="refundable" className="font-medium">
              Las arras son reembolsables
            </Label>
          </div>

          {localEarnestMoney.refundable && (
            <div className="space-y-3">
              <Label className="font-medium">Condiciones de reembolso</Label>
              {localEarnestMoney.refundConditions.map((condition, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={condition}
                    onChange={(e) => handleRefundConditionChange(index, e.target.value)}
                    placeholder="Describe una condición de reembolso..."
                    className="flex-1"
                    rows={2}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeRefundCondition(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    ✕
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={addRefundCondition}
                className="text-blue-600"
              >
                + Agregar condición
              </Button>
            </div>
          )}
        </div>

        {/* Carta de intención */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="cartaIntencion"
              checked={localEarnestMoney.includesCartaIntencion}
              onCheckedChange={(checked) => setLocalEarnestMoney(prev => ({
                ...prev,
                includesCartaIntencion: !!checked
              }))}
            />
            <Label htmlFor="cartaIntencion" className="font-medium">
              Incluir Carta de Intención formal
            </Label>
          </div>

          {localEarnestMoney.includesCartaIntencion && (
            <Textarea
              value={localEarnestMoney.cartaIntencionDetails || ''}
              onChange={(e) => setLocalEarnestMoney(prev => ({
                ...prev,
                cartaIntencionDetails: e.target.value
              }))}
              placeholder="Detalles específicos de la carta de intención..."
              rows={3}
            />
          )}
        </div>

        {/* Vista avanzada */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Información Legal y Financiera
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <Label className="text-blue-700">Valor de la propiedad</Label>
                <p className="font-medium">{formatCurrency(propertyPrice)}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-blue-700">Porcentaje de arras</Label>
                <p className="font-medium">{localEarnestMoney.percentage}%</p>
              </div>

              <div className="space-y-2">
                <Label className="text-blue-700">Monto de arras</Label>
                <p className="font-medium text-green-600">{formatCurrency(localEarnestMoney.amount)}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-blue-700">Fecha límite</Label>
                <p className="font-medium">
                  {new Date(localEarnestMoney.dueDate).toLocaleDateString('es-CO')}
                </p>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Las arras representan un depósito que garantiza el cumplimiento del contrato.
                En caso de incumplimiento, pueden perderse total o parcialmente según las condiciones acordadas.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Alertas de validación */}
        {!isPercentageValid && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              El porcentaje de arras debe estar entre {minEarnestMoney}% y {maxEarnestMoney}%
              según las reglas de negociación establecidas.
            </AlertDescription>
          </Alert>
        )}

        {!localEarnestMoney.refundable && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Advertencia: Las arras no reembolsables implican un mayor riesgo para el comprador.
              Se recomienda incluir condiciones claras de reembolso.
            </AlertDescription>
          </Alert>
        )}

        {/* Botón de guardar */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onEarnestMoneyChange(null)}
          >
            Remover Arras
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || !isPercentageValid}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Guardar Configuración
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
