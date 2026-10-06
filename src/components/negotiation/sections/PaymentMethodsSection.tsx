import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  DollarSign,
  FileText,
  Calculator,
  Building2,
  Clock,
  Coins,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Banknote
} from 'lucide-react';
import { ColombianPaymentMethod, COLOMBIAN_PAYMENT_METHODS } from '@/types/payments';

interface PaymentMethodsSectionProps {
  selectedMethod: ColombianPaymentMethod;
  onMethodChange: (method: ColombianPaymentMethod) => void;
  propertyPrice: number;
  negotiationRules?: any;
  className?: string;
}

const PAYMENT_METHOD_ICONS: Record<ColombianPaymentMethod, React.ComponentType<{ className?: string }>> = {
  'efectivo': DollarSign,
  'transferencia_bancaria': CreditCard,
  'cheque': FileText,
  'financiacion_bancaria': Building2,
  'financiacion_vendedor': Building2,
  'cuotas': Clock,
  'criptomonedas': Coins,
  'permuta': ArrowRightLeft,
  'metales_preciosos': Coins,
  'pago_a_terceros': CreditCard,
  'mixto': Calculator
};

export function PaymentMethodsSection({
  selectedMethod,
  onMethodChange,
  propertyPrice,
  negotiationRules,
  className = ''
}: PaymentMethodsSectionProps) {
  const { t } = useTranslation();

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const selectedMethodData = COLOMBIAN_PAYMENT_METHODS.find(m => m.value === selectedMethod);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          {t('negotiations.sections.paymentMethod')}
        </CardTitle>
        {selectedMethodData && (
          <p className="text-sm text-gray-600 mt-1">
            {selectedMethodData.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grid de métodos de pago */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {COLOMBIAN_PAYMENT_METHODS.map((method) => {
            const IconComponent = PAYMENT_METHOD_ICONS[method.value];
            const isSelected = selectedMethod === method.value;
            const isRestricted = negotiationRules?.requiredPaymentMethods &&
                                !negotiationRules.requiredPaymentMethods.includes(method.value);

            return (
              <div
                key={method.value}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : isRestricted
                    ? 'border-red-200 bg-red-50 opacity-60 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => !isRestricted && onMethodChange(method.value)}
              >
                {isRestricted && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Restringido
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <IconComponent className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                    isSelected ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium text-sm truncate ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {method.label}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {method.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`text-xs ${getRiskBadgeColor(method.risk)}`}>
                        Riesgo {method.risk === 'low' ? 'Bajo' :
                               method.risk === 'medium' ? 'Medio' :
                               method.risk === 'high' ? 'Alto' : 'Crítico'}
                      </Badge>
                      {method.requiresVerification && (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      )}
                      {method.fees && (
                        <span className="text-xs text-gray-500">
                          {method.fees.percentage > 0 ? `${method.fees.percentage * 100}%` : 'Sin comisión'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detalles del método seleccionado */}
        {selectedMethodData && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Detalles del método seleccionado
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Método:</span>
                <span className="font-medium">{selectedMethodData.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Requiere verificación:</span>
                <span className="font-medium">
                  {selectedMethodData.requiresVerification ? 'Sí' : 'No'}
                </span>
              </div>
              {selectedMethodData.fees && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Comisión:</span>
                  <span className="font-medium">
                    {selectedMethodData.fees.percentage > 0
                      ? `${(selectedMethodData.fees.percentage * 100).toFixed(1)}%`
                      : 'Sin comisión'
                    }
                  </span>
                </div>
              )}
              {selectedMethodData.maxAmount && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Límite máximo:</span>
                  <span className="font-medium">
                    ${selectedMethodData.maxAmount.toLocaleString('es-CO')} COP
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alertas de validación */}
        {negotiationRules?.requiredPaymentMethods && !negotiationRules.requiredPaymentMethods.includes(selectedMethod) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Los métodos de pago aceptados son: {negotiationRules.requiredPaymentMethods.map((m: string) =>
                COLOMBIAN_PAYMENT_METHODS.find(method => method.value === m)?.label || m
              ).join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Recomendaciones */}
        <Alert>
          <Calculator className="h-4 w-4" />
          <AlertDescription>
            <strong>Recomendación:</strong> La transferencia bancaria ofrece la mejor relación costo-seguridad para transacciones inmobiliarias en Colombia.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
