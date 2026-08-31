import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Calculator,
  BarChart3,
  PieChart,
  DollarSign,
  Percent,
  Target,
  AlertTriangle,
  CheckCircle,
  Brain,
  Zap
} from 'lucide-react';
import { ColombianPaymentStructure } from '@/types/payments';

interface OfferMetrics {
  // Financieras básicas
  npv: number;
  irr: number;
  paybackPeriod: number;
  roi: number;

  // Comparativas de mercado
  marketComparison: {
    priceVsMarket: number; // -10% = 10% por debajo del mercado
    daysOnMarket: number;
    similarSales: number;
  };

  // Calidad de oferta
  offerQuality: {
    score: number; // 0-100
    factors: {
      priceCompetitiveness: number;
      paymentTerms: number;
      closingSpeed: number;
      contingencies: number;
      documentation: number;
    };
  };

  // Riesgo
  riskAssessment: {
    overall: 'low' | 'medium' | 'high';
    factors: {
      paymentMethod: number;
      buyerReliability: number;
      marketConditions: number;
      legalCompliance: number;
    };
  };

  // Recomendaciones IA
  aiRecommendations: {
    priceAdjustment: number;
    urgencyLevel: 'low' | 'medium' | 'high';
    negotiationStrategy: string;
    alternativeScenarios: Array<{
      description: string;
      probability: number;
      impact: number;
    }>;
  };
}

interface OfferAnalysisSectionProps {
  paymentStructure: ColombianPaymentStructure;
  propertyPrice: number;
  marketData?: {
    averagePrice: number;
    medianPrice: number;
    daysOnMarket: number;
    recentSales: Array<{
      price: number;
      date: string;
      conditions: string;
    }>;
  };
  negotiationRules?: any;
  className?: string;
}

export function OfferAnalysisSection({
  paymentStructure,
  propertyPrice,
  marketData,
  negotiationRules,
  className = ''
}: OfferAnalysisSectionProps) {
  const { t } = useTranslation();

  const [metrics, setMetrics] = useState<OfferMetrics | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  useEffect(() => {
    calculateMetrics();
  }, [paymentStructure, propertyPrice, marketData]);

  const calculateMetrics = async () => {
    setAnalyzing(true);

    // Simular cálculo de métricas (en producción esto vendría de un servicio)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const calculatedMetrics: OfferMetrics = {
      // NPV calculado basado en estructura de pagos
      npv: calculateNPV(paymentStructure, propertyPrice),

      // IRR estimado
      irr: calculateIRR(paymentStructure),

      // Período de recuperación
      paybackPeriod: calculatePaybackPeriod(paymentStructure),

      // ROI
      roi: calculateROI(paymentStructure, propertyPrice),

      // Comparación con mercado
      marketComparison: {
        priceVsMarket: marketData ? ((propertyPrice - marketData.averagePrice) / marketData.averagePrice) * 100 : 0,
        daysOnMarket: marketData?.daysOnMarket || 30,
        similarSales: marketData?.recentSales.length || 0
      },

      // Calidad de oferta
      offerQuality: calculateOfferQuality(paymentStructure, propertyPrice, negotiationRules),

      // Evaluación de riesgo
      riskAssessment: assessRisk(paymentStructure, paymentStructure),

      // Recomendaciones IA
      aiRecommendations: generateAIRecommendations(paymentStructure, propertyPrice, marketData)
    };

    setMetrics(calculatedMetrics);
    setAnalyzing(false);
  };

  // Funciones de cálculo (simplificadas para demo)
  const calculateNPV = (payment: ColombianPaymentStructure, price: number): number => {
    const discountRate = 0.12; // 12% anual
    let npv = -price; // Costo inicial

    payment.paymentSchedule.forEach((p, index) => {
      const timeInYears = (index + 1) / 12; // Asumiendo pagos mensuales
      npv += p.amount / Math.pow(1 + discountRate, timeInYears);
    });

    return npv;
  };

  const calculateIRR = (payment: ColombianPaymentStructure): number => {
    // IRR simplificado
    return 0.08 + Math.random() * 0.04; // 8-12%
  };

  const calculatePaybackPeriod = (payment: ColombianPaymentStructure): number => {
    const totalInvestment = propertyPrice;
    let cumulativeCashFlow = 0;
    let months = 0;

    for (const p of payment.paymentSchedule) {
      cumulativeCashFlow += p.amount;
      months++;
      if (cumulativeCashFlow >= totalInvestment) break;
    }

    return months;
  };

  const calculateROI = (payment: ColombianPaymentStructure, price: number): number => {
    const totalInvestment = payment.paymentSchedule.reduce((sum, p) => sum + p.amount, 0);
    const totalReturn = price;
    return ((totalReturn - totalInvestment) / totalInvestment) * 100;
  };

  const calculateOfferQuality = (payment: ColombianPaymentStructure, price: number, rules?: any) => {
    let score = 50; // Base score

    // Competitividad de precio
    const priceScore = Math.max(0, Math.min(100, 100 - Math.abs(price - (marketData?.averagePrice || price)) / price * 100));
    score += (priceScore - 50) * 0.3;

    // Términos de pago
    const paymentScore = payment.paymentSchedule.length > 1 ? 80 : 60;
    score += (paymentScore - 50) * 0.2;

    // Velocidad de cierre
    const closingScore = 85; // Placeholder
    score += (closingScore - 50) * 0.2;

    // Contingencias
    const contingencyScore = payment.paymentSchedule.some(p => p.contingencies?.length) ? 75 : 50;
    score += (contingencyScore - 50) * 0.15;

    // Documentación
    const docScore = 70; // Placeholder
    score += (docScore - 50) * 0.15;

    return {
      score: Math.max(0, Math.min(100, score)),
      factors: {
        priceCompetitiveness: priceScore,
        paymentTerms: paymentScore,
        closingSpeed: closingScore,
        contingencies: contingencyScore,
        documentation: docScore
      }
    };
  };

  const assessRisk = (payment: ColombianPaymentStructure, fullPayment: ColombianPaymentStructure) => {
    let riskScore = 50; // Base

    // Riesgo por método de pago
    const paymentMethodRisk = {
      'efectivo': 80,
      'transferencia_bancaria': 20,
      'cheque': 60,
      'financiacion_bancaria': 30,
      'financiacion_vendedor': 40,
      'cuotas': 50,
      'criptomonedas': 90,
      'permuta': 70,
      'metales_preciosos': 85,
      'pago_a_terceros': 75,
      'mixto': 45
    };

    riskScore += (paymentMethodRisk[payment.method] || 50) - 50;

    // Otros factores
    riskScore += Math.random() * 20 - 10; // ±10% variación

    const overall: 'low' | 'medium' | 'high' = riskScore < 40 ? 'low' : riskScore < 70 ? 'medium' : 'high';

    return {
      overall,
      factors: {
        paymentMethod: paymentMethodRisk[payment.method] || 50,
        buyerReliability: 60 + Math.random() * 20,
        marketConditions: 50 + Math.random() * 30,
        legalCompliance: 70 + Math.random() * 20
      }
    };
  };

  const generateAIRecommendations = (payment: ColombianPaymentStructure, price: number, marketData?: any) => {
    const recommendations = {
      priceAdjustment: 0,
      urgencyLevel: 'medium' as 'low' | 'medium' | 'high',
      negotiationStrategy: '',
      alternativeScenarios: [] as Array<{ description: string; probability: number; impact: number }>
    };

    // Ajuste de precio basado en mercado
    if (marketData) {
      const marketDiff = ((price - marketData.averagePrice) / marketData.averagePrice) * 100;
      recommendations.priceAdjustment = marketDiff > 5 ? -3 : marketDiff < -5 ? 3 : 0;
    }

    // Estrategia de negociación
    if (payment.paymentSchedule.length > 1) {
      recommendations.negotiationStrategy = 'Enfocarse en términos de pago flexibles y plazos extendidos';
    } else {
      recommendations.negotiationStrategy = 'Negociar precio agresivamente dado el pago inmediato';
    }

    // Escenarios alternativos
    recommendations.alternativeScenarios = [
      {
        description: 'Vendedor acepta rebaja del 3%',
        probability: 0.6,
        impact: 0.03
      },
      {
        description: 'Extensión de plazo 15 días',
        probability: 0.4,
        impact: -0.01
      },
      {
        description: 'Pago inicial reducido al 5%',
        probability: 0.3,
        impact: -0.02
      }
    ];

    return recommendations;
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (analyzing) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analizando oferta con IA...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            {t('negotiations.sections.offerAnalysis')}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getRiskBadgeColor(metrics.riskAssessment.overall)}>
              Riesgo {metrics.riskAssessment.overall === 'low' ? 'Bajo' :
                     metrics.riskAssessment.overall === 'medium' ? 'Medio' : 'Alto'}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
            >
              {showDetailedAnalysis ? 'Vista Resumen' : 'Análisis Detallado'}
            </Button>
          </div>
        </CardTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Calidad de Oferta</p>
            <p className={`text-2xl font-bold ${getScoreColor(metrics.offerQuality.score)}`}>
              {metrics.offerQuality.score.toFixed(0)}/100
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">NPV</p>
            <p className={`text-xl font-bold ${metrics.npv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(metrics.npv)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">ROI</p>
            <p className={`text-xl font-bold ${metrics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(metrics.roi)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Payback</p>
            <p className="text-xl font-bold text-blue-600">
              {metrics.paybackPeriod} meses
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comparación con mercado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">vs Precio de Mercado</p>
            <p className={`text-xl font-bold ${
              metrics.marketComparison.priceVsMarket > 0 ? 'text-red-600' :
              metrics.marketComparison.priceVsMarket < -5 ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {formatPercentage(metrics.marketComparison.priceVsMarket)}
            </p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Ventas Similares</p>
            <p className="text-xl font-bold text-blue-600">
              {metrics.marketComparison.similarSales}
            </p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Días en Mercado</p>
            <p className="text-xl font-bold text-purple-600">
              {metrics.marketComparison.daysOnMarket}
            </p>
          </div>
        </div>

        {/* Recomendaciones IA */}
        <Alert className="bg-blue-50 border-blue-200">
          <Brain className="h-4 w-4 text-blue-600" />
          <div className="space-y-2">
            <p className="font-medium text-blue-900">Recomendaciones IA:</p>
            <p className="text-blue-800">{metrics.aiRecommendations.negotiationStrategy}</p>
            {metrics.aiRecommendations.priceAdjustment !== 0 && (
              <p className="text-sm text-blue-700">
                💡 Sugerencia: Ajustar precio {formatPercentage(metrics.aiRecommendations.priceAdjustment)}
              </p>
            )}
          </div>
        </Alert>

        {/* Análisis detallado */}
        {showDetailedAnalysis && (
          <div className="space-y-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900">Análisis Detallado</h4>

            {/* Factores de calidad */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-800">Factores de Calidad</h5>
              <div className="space-y-2">
                {Object.entries(metrics.offerQuality.factors).map(([factor, score]) => (
                  <div key={factor} className="flex items-center justify-between">
                    <span className="text-sm capitalize">
                      {factor.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <Progress value={score} className="w-20 h-2" />
                      <span className="text-sm font-medium w-12 text-right">{score.toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evaluación de riesgo */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-800">Evaluación de Riesgo</h5>
              <div className="space-y-2">
                {Object.entries(metrics.riskAssessment.factors).map(([factor, score]) => (
                  <div key={factor} className="flex items-center justify-between">
                    <span className="text-sm capitalize">
                      {factor.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <Progress value={score} className="w-20 h-2" />
                      <span className="text-sm font-medium w-12 text-right">{score.toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Escenarios alternativos */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-800">Escenarios Alternativos</h5>
              <div className="space-y-2">
                {metrics.aiRecommendations.alternativeScenarios.map((scenario, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{scenario.description}</p>
                      <p className="text-xs text-gray-600">
                        Probabilidad: {(scenario.probability * 100).toFixed(0)}%
                      </p>
                    </div>
                    <Badge variant={scenario.impact > 0 ? 'default' : 'secondary'}>
                      {formatPercentage(scenario.impact * 100)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Alertas importantes */}
        {metrics.offerQuality.score < 60 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Oferta de baja calidad:</strong> Considera mejorar los términos
              de pago o ajustar el precio para aumentar las probabilidades de aceptación.
            </AlertDescription>
          </Alert>
        )}

        {metrics.npv < 0 && (
          <Alert>
            <TrendingDown className="h-4 w-4" />
            <AlertDescription>
              <strong>NPV negativo:</strong> La oferta actual tiene un valor presente neto negativo.
              Considera renegociar términos más favorables o reducir el precio.
            </AlertDescription>
          </Alert>
        )}

        {metrics.marketComparison.priceVsMarket > 10 && (
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              <strong>Precio por encima del mercado:</strong> El precio ofrecido está
              {Math.abs(metrics.marketComparison.priceVsMarket).toFixed(1)}% por encima del promedio.
              Podría requerir negociación intensa.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
