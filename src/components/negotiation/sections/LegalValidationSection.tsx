import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Scale,
  Calculator,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  FileText,
  CreditCard,
  TrendingUp,
  Shield,
  Info
} from 'lucide-react';
import { ColombianPaymentStructure, PaymentValidationService } from '../../../services/paymentValidation.service';

interface LegalCosts {
  // Gastos notariales y registro
  notarialFees: number; // ~0.7% del valor
  registrationFees: number; // ~0.5% del valor
  notarialTotal: number;

  // Impuestos
  tax4x1000: number; // 0.4% sobre transacciones financieras
  capitalGainsTax: number; // 10-20% dependiendo del tiempo de posesión
  incomeTax: number; // Retención en la fuente si aplica

  // Otros costos
  appraisalFees: number; // Avalúo bancario
  legalFees: number; // Honorarios abogado
  insuranceFees: number; // Seguros (vida, título)

  // Totales
  subtotal: number;
  iva: number; // IVA sobre servicios
  total: number;
}

interface LegalValidationSectionProps {
  propertyPrice: number;
  paymentStructure: ColombianPaymentStructure;
  ownershipYears: number; // Años de posesión del vendedor
  buyerIsResident: boolean; // Si el comprador es residente colombiano
  sellerIsCompany: boolean; // Si el vendedor es persona jurídica
  className?: string;
}

export function LegalValidationSection({
  propertyPrice,
  paymentStructure,
  ownershipYears = 5,
  buyerIsResident = true,
  sellerIsCompany = false,
  className = ''
}: LegalValidationSectionProps) {
  const { t } = useTranslation();

  const [legalCosts, setLegalCosts] = useState<LegalCosts>({
    notarialFees: 0,
    registrationFees: 0,
    notarialTotal: 0,
    tax4x1000: 0,
    capitalGainsTax: 0,
    incomeTax: 0,
    appraisalFees: 0,
    legalFees: 0,
    insuranceFees: 0,
    subtotal: 0,
    iva: 0,
    total: 0
  });

  const [complianceValidation, setComplianceValidation] = useState<any>(null);
  const [showValidationOverride, setShowValidationOverride] = useState(false);

  useEffect(() => {
    calculateLegalCosts();
    validateCompliance();
  }, [propertyPrice, paymentStructure, ownershipYears, buyerIsResident, sellerIsCompany]);

  const calculateLegalCosts = () => {
    // Gastos notariales (~0.7% del valor de la propiedad)
    const notarialFees = propertyPrice * 0.007;
    // Gastos de registro (~0.5% del valor)
    const registrationFees = propertyPrice * 0.005;
    const notarialTotal = notarialFees + registrationFees;

    // Impuesto 4x1000 (0.4% sobre transacciones financieras)
    // Se calcula sobre el valor total de pagos realizados
    const totalPayments = paymentStructure.paymentSchedule.reduce((sum, p) => sum + p.amount, 0);
    const tax4x1000 = totalPayments * 0.004;

    // Ganancias ocasionales (capital gains tax)
    // - Si propiedad poseída < 2 años: 20%
    // - Si propiedad poseída 2-5 años: 15%
    // - Si propiedad poseída > 5 años: 10%
    // - Si es empresa: 33% + 4% CREE
    let capitalGainsTax = 0;
    if (sellerIsCompany) {
      // Para empresas: 33% de renta presuntiva + 4% CREE
      capitalGainsTax = propertyPrice * 0.33 + propertyPrice * 0.04;
    } else {
      // Para personas naturales
      if (ownershipYears < 2) {
        capitalGainsTax = propertyPrice * 0.20;
      } else if (ownershipYears <= 5) {
        capitalGainsTax = propertyPrice * 0.15;
      } else {
        capitalGainsTax = propertyPrice * 0.10;
      }
    }

    // Retención en la fuente (aplica a no residentes)
    const incomeTax = buyerIsResident ? 0 : propertyPrice * 0.20; // 20% para no residentes

    // Otros costos
    const appraisalFees = paymentStructure.financingDetails ? 1500000 : 0; // $1.5M si hay financiación
    const legalFees = propertyPrice * 0.005; // 0.5% honorarios abogado
    const insuranceFees = paymentStructure.financingDetails ? 800000 : 0; // $800k seguros

    // Cálculos finales
    const subtotal = notarialTotal + tax4x1000 + capitalGainsTax + incomeTax + appraisalFees + legalFees + insuranceFees;
    const iva = (legalFees + appraisalFees) * 0.19; // IVA sobre servicios (19%)
    const total = subtotal + iva;

    setLegalCosts({
      notarialFees,
      registrationFees,
      notarialTotal,
      tax4x1000,
      capitalGainsTax,
      incomeTax,
      appraisalFees,
      legalFees,
      insuranceFees,
      subtotal,
      iva,
      total
    });
  };

  const validateCompliance = () => {
    const validation = PaymentValidationService.validateCompletePayment(paymentStructure);
    setComplianceValidation(validation);
  };

  const getComplianceStatus = () => {
    if (!complianceValidation) return 'unknown';

    const hasErrors = complianceValidation.antiMoneyLaundering.compliant === false ||
                     complianceValidation.dianCompliance.reportable === false;
    const hasWarnings = complianceValidation.notaryRequirements.required ||
                       complianceValidation.bankingCompliance.restrictions.length > 0;

    if (hasErrors) return 'error';
    if (hasWarnings) return 'warning';
    return 'success';
  };

  const complianceStatus = getComplianceStatus();
  const complianceProgress = complianceStatus === 'success' ? 100 :
                            complianceStatus === 'warning' ? 75 : 50;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-600" />
            {t('negotiations.sections.legalValidation')}
          </div>
          <Badge
            variant={
              complianceStatus === 'success' ? 'default' :
              complianceStatus === 'warning' ? 'secondary' : 'destructive'
            }
            className="flex items-center gap-1"
          >
            {complianceStatus === 'success' ? <CheckCircle className="h-3 w-3" /> :
             complianceStatus === 'warning' ? <AlertTriangle className="h-3 w-3" /> :
             <AlertTriangle className="h-3 w-3" />}
            {complianceStatus === 'success' ? 'Compliant' :
             complianceStatus === 'warning' ? 'Requiere Atención' : 'No Compliant'}
          </Badge>
        </CardTitle>
        <div className="space-y-2">
          <Progress value={complianceProgress} className="h-2" />
          <p className="text-sm text-gray-600">
            Estado de cumplimiento legal y proyección de costos totales de la transacción
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumen de costos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-medium">Gastos Notariales</p>
            <p className="text-xl font-bold text-green-900">{formatCurrency(legalCosts.notarialTotal)}</p>
            <p className="text-xs text-green-600">1.2% del valor</p>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Impuestos</p>
            <p className="text-xl font-bold text-blue-900">
              {formatCurrency(legalCosts.capitalGainsTax + legalCosts.incomeTax + legalCosts.tax4x1000)}
            </p>
            <p className="text-xs text-blue-600">10-33% + 4x1000</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-600 font-medium">Total Estimado</p>
            <p className="text-xl font-bold text-purple-900">{formatCurrency(legalCosts.total)}</p>
            <p className="text-xs text-purple-600">Incluye todos los costos</p>
          </div>
        </div>

        {/* Desglose detallado de costos */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-base">{t('negotiations.sections.costBreakdown')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Gastos Notariales */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Gastos Notariales y Registro
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Honorarios notariales:</span>
                  <span className="font-medium">{formatCurrency(legalCosts.notarialFees)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gastos de registro:</span>
                  <span className="font-medium">{formatCurrency(legalCosts.registrationFees)}</span>
                </div>
                <div className="flex justify-between col-span-2 border-t pt-2">
                  <span className="font-medium">Total notarial:</span>
                  <span className="font-bold">{formatCurrency(legalCosts.notarialTotal)}</span>
                </div>
              </div>
            </div>

            {/* Impuestos */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Impuestos
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Ganancias ocasionales ({ownershipYears} años posesión):</span>
                  <span className="font-medium">{formatCurrency(legalCosts.capitalGainsTax)}</span>
                </div>
                {!buyerIsResident && (
                  <div className="flex justify-between">
                    <span>Retención en la fuente (no residente):</span>
                    <span className="font-medium">{formatCurrency(legalCosts.incomeTax)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Impuesto 4x1000 (transacciones financieras):</span>
                  <span className="font-medium">{formatCurrency(legalCosts.tax4x1000)}</span>
                </div>
                {sellerIsCompany && (
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>(Incluye 33% renta presuntiva + 4% CREE)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Servicios Profesionales */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Servicios Profesionales
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Honorarios abogado:</span>
                  <span className="font-medium">{formatCurrency(legalCosts.legalFees)}</span>
                </div>
                {legalCosts.appraisalFees > 0 && (
                  <div className="flex justify-between">
                    <span>Avalúo bancario:</span>
                    <span className="font-medium">{formatCurrency(legalCosts.appraisalFees)}</span>
                  </div>
                )}
                {legalCosts.insuranceFees > 0 && (
                  <div className="flex justify-between">
                    <span>Seguros (vida/título):</span>
                    <span className="font-medium">{formatCurrency(legalCosts.insuranceFees)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Totales */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(legalCosts.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>IVA (19% sobre servicios):</span>
                <span className="font-medium">{formatCurrency(legalCosts.iva)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total estimado:</span>
                <span>{formatCurrency(legalCosts.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validaciones de cumplimiento */}
        {complianceValidation && (
          <div className="space-y-4">
            {/* DIAN Compliance */}
            {complianceValidation.dianCompliance.reportable && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <div className="text-sm">
                  <strong>Reporte DIAN requerido:</strong> La transacción debe reportarse por superar {formatCurrency(complianceValidation.dianCompliance.threshold)}
                </div>
              </Alert>
            )}

            {/* Anti-Money Laundering */}
            {complianceValidation.antiMoneyLaundering.flags.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <div className="font-medium">Banderas SARLAFT detectadas:</div>
                    <ul className="list-disc list-inside mt-2">
                      {complianceValidation.antiMoneyLaundering.flags.map((flag: string, index: number) => (
                        <li key={index}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Notary Requirements */}
            {complianceValidation.notaryRequirements.required && (
              <Alert>
                <Scale className="h-4 w-4" />
                <div className="text-sm">
                  <strong>Requerimiento notarial:</strong> Costo estimado {formatCurrency(complianceValidation.notaryRequirements.estimatedCost)}
                  en {complianceValidation.notaryRequirements.jurisdiction}
                </div>
              </Alert>
            )}
          </div>
        )}

        {/* Sistema de override de validaciones */}
        {complianceStatus !== 'success' && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-base text-orange-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t('negotiations.sections.specialValidation')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-800 mb-4">
                Si necesitas proceder con esta configuración de pago a pesar de las validaciones,
                puedes pagar $250,000 COP para saltarte las restricciones de validación.
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-orange-900">Costo del override:</p>
                  <p className="text-lg font-bold text-orange-900">$250,000 COP</p>
                </div>
                <Button
                  onClick={() => setShowValidationOverride(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pagar y Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información adicional */}
        <Alert>
          <Info className="h-4 w-4" />
          <div className="text-sm">
            <strong>Nota importante:</strong> Estos cálculos son estimativos. Los costos reales pueden variar
            según la jurisdicción, el notario específico y las condiciones particulares de la transacción.
            Se recomienda consultar con un abogado especialista en derecho inmobiliario colombiano.
          </div>
        </Alert>

        {/* Modal de pago para override */}
        {showValidationOverride && (
          <ValidationOverrideModal
            amount={250000}
            onClose={() => setShowValidationOverride(false)}
            onPaymentComplete={() => {
              setShowValidationOverride(false);
              // Aquí iría la lógica para permitir continuar con las validaciones
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

// Modal para pago de override de validaciones
interface ValidationOverrideModalProps {
  amount: number;
  onClose: () => void;
  onPaymentComplete: () => void;
}

function ValidationOverrideModal({ amount, onClose, onPaymentComplete }: ValidationOverrideModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('transferencia_bancaria');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    // Simular procesamiento de pago
    setTimeout(() => {
      setProcessing(false);
      onPaymentComplete();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-orange-600" />
          Pago por Validación Especial
        </h3>

        <div className="space-y-4">
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-600">Monto a pagar</p>
            <p className="text-2xl font-bold text-orange-900">{formatCurrency(amount)}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Método de pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="transferencia_bancaria">Transferencia bancaria</option>
              <option value="tarjeta_credito">Tarjeta de crédito</option>
              <option value="efectivo">Efectivo en plataforma</option>
            </select>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Este pago te permite continuar con la configuración actual sin restricciones de validación.
              El pago se procesará inmediatamente y no es reembolsable.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handlePayment}
            disabled={processing}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
          >
            {processing ? 'Procesando...' : 'Pagar y Continuar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
