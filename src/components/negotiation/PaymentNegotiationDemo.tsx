import { getIntlLocale } from '../../i18n';
/**
 * Componente de demostración para el sistema completo de pagos colombianos
 * Integra PaymentForm, validaciones legales y análisis NPV
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calculator,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  FileText,
  TrendingUp,
  Shield,
  Scale
} from 'lucide-react';

import { PaymentForm } from './PaymentForm';
import { useHolisticNegotiation } from '../../hooks/useHolisticNegotiation';
import { PaymentValidationService } from '../../services/paymentValidation.service';
import {
  ColombianPaymentStructure,
  TEST_PAYMENT_CONFIGURATIONS,
  TEST_PROPERTIES,
  getTestNegotiationScenario
} from '../../test/fixtures/payment-test-data';

export function PaymentNegotiationDemo() {
  const [selectedScenario, setSelectedScenario] = useState<'standard' | 'financing' | 'crypto' | 'cash'>('standard');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<ColombianPaymentStructure | undefined>();

  // Cargar escenario de prueba
  const testScenario = getTestNegotiationScenario(selectedScenario);
  const property = testScenario.property;

  // Hook de negociación holística
  const {
    data: negotiationData,
    loading,
    error,
    updatePaymentStructure
  } = useHolisticNegotiation({
    propertyId: property.id,
    autoLoad: false, // Usamos datos de prueba
    enableRealTimeUpdates: false
  });

  // Simular datos de negociación con el escenario seleccionado
  const mockNegotiationData = {
    propertyId: property.id,
    buyerId: 'buyer_test',
    sellerId: 'seller_test',
    currentPrice: property.price,
    originalPrice: property.price,
    paymentStructure: testScenario.payment,
    contingencies: testScenario.payment.contingencies,
    riskFactors: [], // Se calcularían en el hook real
    npvAnalysis: {
      baseNPV: property.price * 0.85,
      adjustedNPV: property.price * 0.82,
      paymentMethodImpact: -50000,
      timingImpact: 25000,
      riskAdjustment: -30000,
      currency: 'COP' as const,
      discountRate: 0.12,
      timeHorizon: 12,
      cashFlows: [],
      breakEvenPoint: 6,
      irr: 0.15
    },
    legalCompliance: PaymentValidationService.validateCompletePayment(testScenario.payment)
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(getIntlLocale(), {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePaymentUpdate = async (newPayment: ColombianPaymentStructure) => {
    setCurrentPayment(newPayment);
    // En producción, esto actualizaría la base de datos
    console.log('Nuevo pago configurado:', newPayment);
    setShowPaymentForm(false);
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-muted text-foreground border-border';
    }
  };

  const getComplianceIcon = (compliant: boolean) => {
    return compliant ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <AlertTriangle className="h-5 w-5 text-red-600" />
    );
  };

  if (showPaymentForm) {
    return (
      <PaymentForm
        propertyPrice={property.price}
        currentPayment={currentPayment || testScenario.payment}
        onSubmit={handlePaymentUpdate}
        onCancel={() => setShowPaymentForm(false)}
        isOpen={showPaymentForm}
        onOpenChange={setShowPaymentForm}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Sistema de Pagos Colombiano
          </h1>
          <p className="text-muted-foreground">
            Demostración completa de formas de pago, validaciones legales y análisis NPV
          </p>
        </div>
      </div>

      {/* Selector de escenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Escenarios de Prueba
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'standard', label: 'Estándar', desc: 'Transferencia bancaria' },
              { key: 'financing', label: 'Financiado', desc: 'Crédito hipotecario' },
              { key: 'crypto', label: 'Cripto', desc: 'Bitcoin/Ethereum' },
              { key: 'cash', label: 'Efectivo', desc: 'Pago limitado' }
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => setSelectedScenario(key as any)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedScenario === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-border hover:border-border'
                }`}
              >
                <h3 className="font-semibold text-foreground">{label}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Información de la propiedad */}
      <Card>
        <CardHeader>
          <CardTitle>Propiedad: {property.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Precio:</span>
              <p className="font-semibold text-lg">{formatCurrency(property.price)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Ubicación:</span>
              <p className="font-medium">{property.city}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Área:</span>
              <p className="font-medium">{property.area}m²</p>
            </div>
            <div>
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant="outline" className="capitalize">{property.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="payment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payment">Configuración de Pago</TabsTrigger>
          <TabsTrigger value="analysis">Análisis NPV</TabsTrigger>
          <TabsTrigger value="compliance">Cumplimiento Legal</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
        </TabsList>

        {/* Configuración de Pago */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Método de Pago Actual
                </span>
                <Button onClick={() => setShowPaymentForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Configurar Pago
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Método:</span>
                  <p className="font-medium capitalize">
                    {mockNegotiationData.paymentStructure.method.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Monto total:</span>
                  <p className="font-medium">{formatCurrency(mockNegotiationData.paymentStructure.totalAmount)}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Pagos programados:</span>
                  <p className="font-medium">{mockNegotiationData.paymentStructure.paymentSchedule.length}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Riesgo:</span>
                  <Badge className={getRiskBadgeColor(mockNegotiationData.paymentStructure.riskLevel || 'low')}>
                    {mockNegotiationData.paymentStructure.riskLevel || 'low'}
                  </Badge>
                </div>
              </div>

              {/* Cronograma de pagos */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Cronograma de Pagos</h4>
                <div className="space-y-2">
                  {mockNegotiationData.paymentStructure.paymentSchedule.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.date).toLocaleDateString(getIntlLocale())}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                        <Badge variant="outline" className="text-xs">
                          {payment.paymentMethod.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análisis NPV */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Análisis de Valor Presente Neto (NPV)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">NPV Base</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(mockNegotiationData.npvAnalysis.baseNPV)}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">NPV Ajustado</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(mockNegotiationData.npvAnalysis.adjustedNPV)}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">TIR Estimada</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(mockNegotiationData.npvAnalysis.irr * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Break-even</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {mockNegotiationData.npvAnalysis.breakEvenPoint} meses
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-green-600">Impacto Positivo</h4>
                  <p className="text-sm text-muted-foreground">Método de pago</p>
                  <p className="text-lg font-bold text-green-600">
                    +{formatCurrency(Math.abs(mockNegotiationData.npvAnalysis.paymentMethodImpact))}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-blue-600">Impacto Temporal</h4>
                  <p className="text-sm text-muted-foreground">Timing de pagos</p>
                  <p className="text-lg font-bold text-blue-600">
                    {mockNegotiationData.npvAnalysis.timingImpact >= 0 ? '+' : ''}
                    {formatCurrency(mockNegotiationData.npvAnalysis.timingImpact)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-red-600">Ajuste por Riesgo</h4>
                  <p className="text-sm text-muted-foreground">Riesgo calculado</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(mockNegotiationData.npvAnalysis.riskAdjustment)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cumplimiento Legal */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DIAN Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getComplianceIcon(mockNegotiationData.legalCompliance.dianCompliant)}
                  DIAN (Impuestos)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Reportable:</span>
                  <Badge variant={mockNegotiationData.legalCompliance.dianCompliance.reportable ? "destructive" : "secondary"}>
                    {mockNegotiationData.legalCompliance.dianCompliance.reportable ? 'Sí' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Umbral:</span>
                  <span className="font-medium">{formatCurrency(mockNegotiationData.legalCompliance.dianCompliance.threshold)}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Categoría:</span>
                  <p className="text-sm capitalize">{mockNegotiationData.legalCompliance.dianCompliance.category.replace('_', ' ')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Anti-Money Laundering */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Anti-Lavado (SARLAFT)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Cumple:</span>
                  <Badge variant={mockNegotiationData.legalCompliance.antiMoneyLaundering.compliant ? "default" : "destructive"}>
                    {mockNegotiationData.legalCompliance.antiMoneyLaundering.compliant ? 'Sí' : 'No'}
                  </Badge>
                </div>
                {mockNegotiationData.legalCompliance.antiMoneyLaundering.flags.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Banderas:</span>
                    <ul className="text-sm text-red-600 mt-1 space-y-1">
                      {mockNegotiationData.legalCompliance.antiMoneyLaundering.flags.map((flag, index) => (
                        <li key={index}>• {flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notary Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Requisitos Notariales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Requerido:</span>
                  <Badge variant={mockNegotiationData.legalCompliance.notaryRequirements.required ? "default" : "secondary"}>
                    {mockNegotiationData.legalCompliance.notaryRequirements.required ? 'Sí' : 'No'}
                  </Badge>
                </div>
                {mockNegotiationData.legalCompliance.notaryRequirements.required && (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Costo estimado:</span>
                      <span className="font-medium">{formatCurrency(mockNegotiationData.legalCompliance.notaryRequirements.estimatedCost)}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Jurisdicción:</span>
                      <p className="text-sm">{mockNegotiationData.legalCompliance.notaryRequirements.jurisdiction}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Banking Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getComplianceIcon(mockNegotiationData.legalCompliance.bankingCompliance.allowsMethod)}
                  Cumplimiento Bancario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Permitido:</span>
                  <Badge variant={mockNegotiationData.legalCompliance.bankingCompliance.allowsMethod ? "default" : "destructive"}>
                    {mockNegotiationData.legalCompliance.bankingCompliance.allowsMethod ? 'Sí' : 'No'}
                  </Badge>
                </div>
                {mockNegotiationData.legalCompliance.bankingCompliance.restrictions.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Restricciones:</span>
                    <ul className="text-sm text-red-600 mt-1 space-y-1">
                      {mockNegotiationData.legalCompliance.bankingCompliance.restrictions.map((restriction, index) => (
                        <li key={index}>• {restriction}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recomendaciones */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones para Mejorar la Transacción</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const recommendations = PaymentValidationService.generateComplianceRecommendations(mockNegotiationData.paymentStructure);
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Prioridad:</span>
                      <Badge variant={
                        recommendations.priority === 'high' ? 'destructive' :
                        recommendations.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {recommendations.priority === 'high' ? 'Alta' :
                         recommendations.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {recommendations.recommendations.map((rec, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-start gap-3">
                            <Badge variant="outline" className="capitalize">
                              {rec.type}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-medium">{rec.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span>Impacto: {rec.impact}</span>
                                <Badge variant={
                                  rec.urgency === 'immediate' ? 'destructive' :
                                  rec.urgency === 'soon' ? 'default' : 'secondary'
                                } className="text-xs">
                                  {rec.urgency === 'immediate' ? 'Inmediato' :
                                   rec.urgency === 'soon' ? 'Pronto' : 'Opcional'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer con información de debug */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p><strong>Datos de Prueba:</strong> Esta demostración utiliza datos ficticios basados en documentos reales colombianos.</p>
            <p>Para producción, conecte con la base de datos real y valide con entidades regulatorias.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
