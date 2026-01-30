import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import {
  ColombianPaymentStructure,
  ColombianPaymentMethod,
  validateColombianPayment,
  calculatePaymentRisk,
  PaymentSchedule
} from '../types/payments';

interface HolisticNegotiationData {
  propertyId: string;
  buyerId: string;
  sellerId: string;
  currentPrice: number;
  originalPrice: number;
  paymentStructure: ColombianPaymentStructure;
  contingencies: any[];
  riskFactors: RiskFactor[];
  npvAnalysis: NPVAnalysis;
  legalCompliance: LegalCompliance;
}

interface RiskFactor {
  type: 'payment_method' | 'timing' | 'legal' | 'market' | 'regulatory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: number; // Impacto en NPV (porcentaje)
  mitigation?: string[];
}

interface NPVAnalysis {
  baseNPV: number;
  adjustedNPV: number;
  paymentMethodImpact: number;
  timingImpact: number;
  riskAdjustment: number;
  currency: 'COP' | 'USD';
  discountRate: number;
  timeHorizon: number; // meses
  cashFlows: CashFlow[];
  breakEvenPoint: number;
  irr: number; // Internal Rate of Return
}

interface CashFlow {
  date: string;
  amount: number;
  type: 'inflow' | 'outflow';
  description: string;
  risk: number; // Probabilidad de no materializarse (0-1)
  presentValue: number;
}

interface LegalCompliance {
  dianCompliant: boolean;
  antiMoneyLaunderingCompliant: boolean;
  notaryRequirements: boolean;
  regulatoryFlags: string[];
  recommendedActions: string[];
}

interface UseHolisticNegotiationOptions {
  propertyId: string;
  autoLoad?: boolean;
  enableRealTimeUpdates?: boolean;
}

export function useHolisticNegotiation({
  propertyId,
  autoLoad = true,
  enableRealTimeUpdates = true
}: UseHolisticNegotiationOptions) {

  const [data, setData] = useState<HolisticNegotiationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Cargar datos de negociación
  const loadNegotiationData = useCallback(async () => {
    if (!propertyId) return;

    setLoading(true);
    setError(null);

    try {
      // Obtener datos de la propiedad y negociación actual
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (propertyError) throw propertyError;

      // Obtener negociación activa
      const { data: negotiationData, error: negotiationError } = await supabase
        .from('negotiations')
        .select('*')
        .eq('property_id', propertyId)
        .eq('status', 'active')
        .single();

      if (negotiationError && negotiationError.code !== 'PGRST116') {
        throw negotiationError;
      }

      // Obtener oferta más reciente
      const { data: latestOffer, error: offerError } = await supabase
        .from('offers')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (offerError && offerError.code !== 'PGRST116') {
        throw offerError;
      }

      // Construir estructura de pago desde la oferta
      const paymentStructure = latestOffer ? buildPaymentStructureFromOffer(latestOffer) : getDefaultPaymentStructure(propertyData.price);

      // Calcular análisis holístico
      const holisticData: HolisticNegotiationData = {
        propertyId,
        buyerId: latestOffer?.buyer_id || '',
        sellerId: propertyData.owner_id,
        currentPrice: latestOffer?.offer_price || propertyData.price,
        originalPrice: propertyData.price,
        paymentStructure,
        contingencies: [],
        riskFactors: calculateRiskFactors(paymentStructure, propertyData),
        npvAnalysis: calculateNPVAnalysis(paymentStructure, propertyData),
        legalCompliance: validateLegalCompliance(paymentStructure)
      };

      setData(holisticData);
      setLastUpdated(new Date());

    } catch (err: any) {
      setError(err.message);
      toast.error('Error al cargar datos de negociación: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  // Construir estructura de pago desde oferta existente
  const buildPaymentStructureFromOffer = (offer: any): ColombianPaymentStructure => {
    // Si ya tiene estructura avanzada
    if (offer.payment_structure) {
      return offer.payment_structure as ColombianPaymentStructure;
    }

    // Construir estructura básica desde campos legacy
    const paymentSchedule: PaymentSchedule[] = [];

    // Pago inicial si existe
    if (offer.down_payment && offer.down_payment > 0) {
      paymentSchedule.push({
        id: 'initial_payment',
        date: new Date().toISOString().split('T')[0], // Hoy
        amount: offer.down_payment,
        description: 'Pago inicial',
        paymentMethod: offer.payment_method || 'transferencia_bancaria',
        verificationRequired: true,
        contingencies: []
      });
    }

    // Pago final
    const remainingAmount = offer.offer_price - (offer.down_payment || 0);
    if (remainingAmount > 0) {
      paymentSchedule.push({
        id: 'final_payment',
        date: offer.closing_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días
        amount: remainingAmount,
        description: 'Pago final',
        paymentMethod: offer.payment_method || 'transferencia_bancaria',
        verificationRequired: true,
        contingencies: []
      });
    }

    return {
      method: offer.payment_method || 'transferencia_bancaria',
      totalAmount: offer.offer_price,
      currency: 'COP',
      paymentSchedule,
      contingencies: [],
      riskLevel: 'medium',
      requiresDianReporting: offer.offer_price > 200000000,
      internationalTransfer: false,
      requiresNotary: true,
      createdAt: offer.created_at,
      updatedAt: offer.updated_at,
      version: 1
    };
  };

  // Estructura de pago por defecto
  const getDefaultPaymentStructure = (propertyPrice: number): ColombianPaymentStructure => ({
    method: 'transferencia_bancaria',
    totalAmount: propertyPrice,
    currency: 'COP',
    paymentSchedule: [
      {
        id: 'initial_payment',
        date: new Date().toISOString().split('T')[0],
        amount: propertyPrice * 0.1, // 10%
        description: 'Pago inicial (arras)',
        paymentMethod: 'transferencia_bancaria',
        verificationRequired: true,
        contingencies: []
      },
      {
        id: 'final_payment',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días
        amount: propertyPrice * 0.9, // 90%
        description: 'Pago final',
        paymentMethod: 'transferencia_bancaria',
        verificationRequired: true,
        contingencies: []
      }
    ],
    contingencies: [],
    riskLevel: 'medium',
    requiresDianReporting: propertyPrice > 200000000,
    internationalTransfer: false,
    requiresNotary: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1
  });

  // Calcular factores de riesgo
  const calculateRiskFactors = (
    paymentStructure: ColombianPaymentStructure,
    property: any
  ): RiskFactor[] => {
    const factors: RiskFactor[] = [];

    // Riesgo por método de pago
    const methodRisks: Record<ColombianPaymentMethod, number> = {
      'transferencia_bancaria': 1,
      'cheque': 2,
      'financiacion_bancaria': 2,
      'financiacion_vendedor': 3,
      'efectivo': 4,
      'cuotas': 4,
      'criptomonedas': 5,
      'permuta': 3,
      'metales_preciosos': 5,
      'pago_a_terceros': 4,
      'mixto': 2
    };

    const methodRisk = methodRisks[paymentStructure.method] || 3;
    if (methodRisk >= 4) {
      factors.push({
        type: 'payment_method',
        severity: 'high',
        description: `Método de pago ${paymentStructure.method.replace('_', ' ')} tiene alto riesgo legal`,
        impact: -methodRisk * 2, // Impacto negativo en NPV
        mitigation: [
          'Considerar transferencia bancaria',
          'Consultar con abogado sobre regulaciones',
          'Documentar apropiadamente'
        ]
      });
    }

    // Riesgo por monto alto
    if (paymentStructure.totalAmount > 1000000000) { // > $1B COP
      factors.push({
        type: 'regulatory',
        severity: 'medium',
        description: 'Monto alto requiere reportes especiales a DIAN',
        impact: -1,
        mitigation: ['Preparar documentación tributaria']
      });
    }

    // Riesgo por internacional
    if (paymentStructure.internationalTransfer) {
      factors.push({
        type: 'regulatory',
        severity: 'high',
        description: 'Transferencia internacional requiere controles adicionales',
        impact: -3,
        mitigation: [
          'Verificar cumplimiento cambiario',
          'Preparar reportes a Banco de la República'
        ]
      });
    }

    return factors;
  };

  // Calcular análisis NPV avanzado
  const calculateNPVAnalysis = (
    paymentStructure: ColombianPaymentStructure,
    property: any
  ): NPVAnalysis => {
    const discountRate = 0.12; // 12% anual (tasa colombiana típica)
    const timeHorizon = 12; // 12 meses

    // Generar flujos de caja desde cronograma de pagos
    const cashFlows: CashFlow[] = paymentStructure.paymentSchedule.map(payment => ({
      date: payment.date,
      amount: -payment.amount, // Salida (negativo)
      type: 'outflow',
      description: payment.description,
      risk: payment.contingencies.length > 0 ? 0.1 : 0.05, // 10% o 5% riesgo
      presentValue: 0 // Se calcula abajo
    }));

    // Agregar ingreso futuro (venta de propiedad)
    cashFlows.push({
      date: new Date(Date.now() + timeHorizon * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: property.price * 1.05, // 5% apreciación esperada
      type: 'inflow',
      description: 'Venta proyectada de la propiedad',
      risk: 0.3, // 30% riesgo de no vender
      presentValue: 0
    });

    // Calcular valores presentes
    const today = new Date();
    cashFlows.forEach(flow => {
      const flowDate = new Date(flow.date);
      const monthsDiff = (flowDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);
      const discountFactor = Math.pow(1 + discountRate / 12, -monthsDiff);
      flow.presentValue = flow.amount * discountFactor * (1 - flow.risk);
    });

    const baseNPV = cashFlows.reduce((sum, flow) => sum + flow.presentValue, 0);
    const paymentMethodImpact = calculatePaymentMethodImpact(paymentStructure);
    const timingImpact = calculateTimingImpact(paymentStructure);
    const riskAdjustment = calculateRiskAdjustment(paymentStructure);

    const adjustedNPV = baseNPV + paymentMethodImpact + timingImpact + riskAdjustment;

    return {
      baseNPV,
      adjustedNPV,
      paymentMethodImpact,
      timingImpact,
      riskAdjustment,
      currency: 'COP',
      discountRate,
      timeHorizon,
      cashFlows,
      breakEvenPoint: calculateBreakEvenPoint(cashFlows),
      irr: calculateIRR(cashFlows, discountRate)
    };
  };

  // Funciones auxiliares para cálculos NPV
  const calculatePaymentMethodImpact = (payment: ColombianPaymentStructure): number => {
    const impacts: Record<ColombianPaymentMethod, number> = {
      'transferencia_bancaria': 50000, // Beneficio por rapidez y seguridad
      'cheque': -25000, // Costo por demora
      'financiacion_bancaria': 100000, // Beneficio por financiamiento
      'financiacion_vendedor': -50000, // Costo por intereses
      'efectivo': -100000, // Alto riesgo legal
      'cuotas': -150000, // Riesgo de impago
      'criptomonedas': -200000, // Volatilidad y regulación
      'permuta': 0, // Neutro
      'metales_preciosos': -150000, // Liquidez limitada
      'pago_a_terceros': -75000, // Riesgo adicional
      'mixto': 25000 // Beneficio por diversificación
    };

    return impacts[payment.method] || 0;
  };

  const calculateTimingImpact = (payment: ColombianPaymentStructure): number => {
    let impact = 0;
    const today = new Date();

    payment.paymentSchedule.forEach(payment => {
      const paymentDate = new Date(payment.date);
      const daysDiff = (paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

      // Penalización por pagos muy lejanos (más de 90 días)
      if (daysDiff > 90) {
        impact -= payment.amount * 0.02; // 2% penalización
      }
      // Beneficio por pagos cercanos (menos de 30 días)
      else if (daysDiff < 30) {
        impact += payment.amount * 0.01; // 1% beneficio
      }
    });

    return impact;
  };

  const calculateRiskAdjustment = (payment: ColombianPaymentStructure): number => {
    const riskScore = calculatePaymentRisk(payment);
    // Ajuste negativo proporcional al riesgo
    return -payment.totalAmount * (riskScore / 100) * 0.05;
  };

  const calculateBreakEvenPoint = (cashFlows: CashFlow[]): number => {
    const sortedFlows = [...cashFlows].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let cumulative = 0;
    for (let i = 0; i < sortedFlows.length; i++) {
      cumulative += sortedFlows[i].presentValue;
      if (cumulative >= 0) {
        return i; // Punto de break-even
      }
    }
    return sortedFlows.length; // Nunca rompe even
  };

  const calculateIRR = (cashFlows: CashFlow[], initialRate: number): number => {
    // Simplified IRR calculation
    let rate = initialRate;
    const maxIterations = 100;
    const tolerance = 0.0001;

    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      cashFlows.forEach(flow => {
        const months = (new Date(flow.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
        npv += flow.amount / Math.pow(1 + rate / 12, months);
      });

      if (Math.abs(npv) < tolerance) {
        return rate;
      }

      // Newton-Raphson approximation
      let dNPV = 0;
      cashFlows.forEach(flow => {
        const months = (new Date(flow.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
        dNPV -= months * flow.amount / Math.pow(1 + rate / 12, months + 1);
      });

      rate = rate - npv / dNPV;
    }

    return rate;
  };

  // Validar cumplimiento legal
  const validateLegalCompliance = (payment: ColombianPaymentStructure): LegalCompliance => {
    const validation = validateColombianPayment(payment);

    return {
      dianCompliant: validation.dianCompliance.reportable ? false : true, // Si requiere reporte, necesita acción
      antiMoneyLaunderingCompliant: validation.antiMoneyLaundering.compliant,
      notaryRequirements: validation.notaryRequirements.required,
      regulatoryFlags: [
        ...validation.antiMoneyLaundering.flags,
        ...(validation.dianCompliance.reportable ? ['Requiere reporte DIAN'] : [])
      ],
      recommendedActions: [
        ...validation.antiMoneyLaundering.recommendations,
        ...(validation.dianCompliance.reportable ? ['Preparar formulario de reporte DIAN'] : []),
        ...(validation.notaryRequirements.required ? ['Coordinar con notaría'] : [])
      ]
    };
  };

  // Actualizar estructura de pago
  const updatePaymentStructure = useCallback(async (newPaymentStructure: ColombianPaymentStructure) => {
    if (!data) return false;

    try {
      // Validar la nueva estructura
      const validation = validateColombianPayment(newPaymentStructure);
      if (!validation.antiMoneyLaundering.compliant) {
        toast.error('La estructura de pago no cumple con regulaciones anti-lavado');
        return false;
      }

      // Calcular nuevos análisis
      const updatedData: HolisticNegotiationData = {
        ...data,
        paymentStructure: newPaymentStructure,
        riskFactors: calculateRiskFactors(newPaymentStructure, { price: data.originalPrice }),
        npvAnalysis: calculateNPVAnalysis(newPaymentStructure, { price: data.originalPrice }),
        legalCompliance: validateLegalCompliance(newPaymentStructure)
      };

      setData(updatedData);
      setLastUpdated(new Date());

      // Aquí iría la lógica para persistir en la base de datos
      // await updateOfferPaymentStructure(propertyId, newPaymentStructure);

      toast.success('Estructura de pago actualizada exitosamente');
      return true;

    } catch (err: any) {
      setError(err.message);
      toast.error('Error al actualizar estructura de pago: ' + err.message);
      return false;
    }
  }, [data, propertyId]);

  // Auto-load data
  useEffect(() => {
    if (autoLoad && propertyId) {
      loadNegotiationData();
    }
  }, [autoLoad, propertyId, loadNegotiationData]);

  // Real-time updates
  useEffect(() => {
    if (!enableRealTimeUpdates || !propertyId) return;

    const channel = supabase
      .channel(`negotiation_${propertyId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'offers',
        filter: `property_id=eq.${propertyId}`
      }, () => {
        loadNegotiationData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enableRealTimeUpdates, propertyId, loadNegotiationData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    loadNegotiationData,
    updatePaymentStructure,
    // Utilidades para cálculos
    calculatePaymentRisk,
    validateColombianPayment
  };
}
