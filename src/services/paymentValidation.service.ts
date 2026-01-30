/**
 * Servicio de validaciones legales para pagos colombianos
 * Implementa reglas de DIAN, anti-lavado y regulaciones bancarias
 */

import { ColombianPaymentStructure, ColombianPaymentValidation, ColombianPaymentMethod } from '../types/payments';

export class PaymentValidationService {

  /**
   * Valida cumplimiento con normas de la DIAN (Dirección de Impuestos y Aduanas Nacionales)
   */
  static validateDIANCompliance(payment: ColombianPaymentStructure): {
    compliant: boolean;
    reportable: boolean;
    threshold: number;
    category: string;
    requirements: string[];
  } {
    const threshold = 200000000; // $200M COP
    const isReportable = payment.totalAmount > threshold;

    const requirements: string[] = [];

    if (isReportable) {
      requirements.push('Registro en formulario 350 para operaciones grandes');
      requirements.push('Identificación del comprador y vendedor');
      requirements.push('Justificación del origen de los fondos');

      if (payment.method === 'efectivo') {
        requirements.push('Declaración juramentada del origen del efectivo');
      }

      if (payment.method === 'criptomonedas') {
        requirements.push('Declaración de operaciones virtuales');
        requirements.push('Identificación del exchange utilizado');
      }
    }

    return {
      compliant: true, // Siempre compliant si se reporta correctamente
      reportable: isReportable,
      threshold,
      category: payment.internationalTransfer ? 'internacional' : 'venta_inmueble',
      requirements
    };
  }

  /**
   * Valida cumplimiento con Ley 1908/2018 (Anti-lavado de activos)
   */
  static validateAntiMoneyLaundering(payment: ColombianPaymentStructure): {
    compliant: boolean;
    flags: string[];
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  } {
    const flags: string[] = [];
    const recommendations: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Validaciones por método de pago
    const methodValidations: Record<ColombianPaymentMethod, () => void> = {
      'efectivo': () => {
        if (payment.totalAmount > 200000000) {
          flags.push('Monto excede límite de efectivo establecido por SARLAFT');
          recommendations.push('Utilizar transferencia bancaria o financiación');
          riskLevel = 'critical';
        } else if (payment.totalAmount > 100000000) {
          flags.push('Monto alto en efectivo requiere controles adicionales');
          recommendations.push('Considerar método de pago rastreable');
          riskLevel = 'high';
        }
      },

      'transferencia_bancaria': () => {
        // Método más seguro, bajo riesgo
        riskLevel = 'low';
      },

      'cheque': () => {
        flags.push('Cheque requiere verificación bancaria adicional');
        recommendations.push('Confirmar fondos antes de liberar propiedad');
        riskLevel = 'medium';
      },

      'financiacion_bancaria': () => {
        if (!payment.financingDetails?.approvedAmount) {
          flags.push('Falta documentación de aprobación crediticia');
          recommendations.push('Presentar carta de aprobación bancaria');
          riskLevel = 'medium';
        }
      },

      'financiacion_vendedor': () => {
        flags.push('Financiación directa del vendedor requiere contrato específico');
        recommendations.push('Formalizar en escritura pública con intereses claros');
        riskLevel = 'medium';
      },

      'cuotas': () => {
        flags.push('Pagos en cuotas aumentan riesgo de impago');
        recommendations.push('Incluir garantías adicionales en el contrato');
        riskLevel = 'high';
      },

      'criptomonedas': () => {
        flags.push('Criptomonedas no reguladas completamente en Colombia');
        flags.push('Volatilidad de precio representa riesgo');
        recommendations.push('Convertir a COP antes del pago final');
        recommendations.push('Utilizar exchange regulado');
        riskLevel = 'high';
      },

      'permuta': () => {
        flags.push('Permuta requiere avalúos independientes');
        recommendations.push('Contratar perito avaluador certificado');
        riskLevel = 'medium';
      },

      'metales_preciosos': () => {
        flags.push('Metales preciosos requieren valoración certificada');
        recommendations.push('Utilizar tasador certificado por Banco de la República');
        riskLevel = 'high';
      },

      'pago_a_terceros': () => {
        flags.push('Pago a terceros aumenta complejidad legal');
        recommendations.push('Verificar poderes y autorizaciones');
        riskLevel = 'medium';
      },

      'mixto': () => {
        // Método mixto puede ser positivo para diversificación
        riskLevel = 'low';
      }
    };

    // Ejecutar validación del método
    const methodValidator = methodValidations[payment.method];
    if (methodValidator) {
      methodValidator();
    }

    // Validaciones generales
    if (payment.internationalTransfer) {
      flags.push('Transferencia internacional requiere reporte cambiario');
      recommendations.push('Reportar a Banco de la República según normas cambiarias');
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    }

    if (payment.totalAmount > 1000000000) { // > $1B COP
      flags.push('Operación de alto valor requiere due diligence adicional');
      recommendations.push('Consultar con abogado especialista en transacciones grandes');
      riskLevel = 'critical';
    }

    // Validar cronograma de pagos
    const today = new Date();
    const futurePayments = payment.paymentSchedule.filter(p =>
      new Date(p.date) > today
    );

    if (futurePayments.length > 3) {
      flags.push('Múltiples pagos futuros aumentan riesgo de incumplimiento');
      recommendations.push('Considerar pagos concentrados o garantías adicionales');
    }

    // Validar contingencies
    const highRiskContingencies = payment.contingencies?.filter(c =>
      c.type === 'credito_aprobado' || c.type === 'titulo_limpio'
    ) || [];

    if (highRiskContingencies.length === 0) {
      flags.push('Faltan contingencias críticas para proteger la transacción');
      recommendations.push('Incluir aprobación de crédito y liberación de gravámenes');
    }

    return {
      compliant: flags.length === 0 || riskLevel !== 'critical',
      flags,
      recommendations,
      riskLevel
    };
  }

  /**
   * Valida requisitos notariales según valor y complejidad
   */
  static validateNotaryRequirements(payment: ColombianPaymentStructure): {
    required: boolean;
    jurisdiction: string;
    estimatedCost: number;
    requirements: string[];
  } {
    const isRequired = payment.totalAmount > 50000000; // $50M COP
    const estimatedCost = isRequired ? payment.totalAmount * 0.007 : 0; // 0.7% aproximado

    const requirements: string[] = [];

    if (isRequired) {
      requirements.push('Escritura pública de compraventa');
      requirements.push('Pago de impuestos de registro (4x1000)');
      requirements.push('Pago de impuesto predial proporcional');

      if (payment.method === 'financiacion_bancaria') {
        requirements.push('Hipoteca a favor de la entidad financiera');
      }

      if (payment.contingencies?.some(c => c.type === 'titulo_limpio')) {
        requirements.push('Cancelación de hipotecas anteriores');
      }
    }

    return {
      required: isRequired,
      jurisdiction: 'Bogotá', // Podría variar por ubicación
      estimatedCost,
      requirements
    };
  }

  /**
   * Valida cumplimiento bancario y financiero
   */
  static validateBankingCompliance(payment: ColombianPaymentStructure): {
    compliant: boolean;
    restrictions: string[];
    alternatives: ColombianPaymentMethod[];
    requirements: string[];
  } {
    const restrictions: string[] = [];
    const alternatives: ColombianPaymentMethod[] = [];
    const requirements: string[] = [];

    // Validaciones por método
    switch (payment.method) {
      case 'efectivo':
        if (payment.totalAmount > 200000000) {
          restrictions.push('Límite legal de efectivo excedido');
          alternatives.push('transferencia_bancaria', 'financiacion_bancaria');
        }
        break;

      case 'transferencia_bancaria':
        requirements.push('Cuenta bancaria a nombre del vendedor');
        requirements.push('Verificación de fondos antes del pago');
        break;

      case 'cheque':
        requirements.push('Cheque nominativo');
        requirements.push('Confirmación de fondos por 48 horas');
        restrictions.push('Riesgo de rechazo del cheque');
        alternatives.push('transferencia_bancaria');
        break;

      case 'financiacion_bancaria':
        requirements.push('Aprobación crediticia previa');
        requirements.push('Avalúo bancario obligatorio');
        requirements.push('Seguro de vida y desempleo');
        break;

      case 'criptomonedas':
        restrictions.push('No regulado completamente por Superfinanciera');
        requirements.push('Conversión a COP');
        requirements.push('Reportes de operaciones virtuales');
        alternatives.push('transferencia_bancaria');
        break;
    }

    // Validaciones de timing
    const today = new Date();
    const paymentsWithin30Days = payment.paymentSchedule.filter(p =>
      (new Date(p.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 30
    );

    if (paymentsWithin30Days.length > 0) {
      requirements.push('Verificación inmediata de fondos disponibles');
    }

    return {
      compliant: restrictions.length === 0,
      restrictions,
      alternatives,
      requirements
    };
  }

  /**
   * Validación completa del pago colombiano
   */
  static validateCompletePayment(payment: ColombianPaymentStructure): ColombianPaymentValidation {
    const dianValidation = this.validateDIANCompliance(payment);
    const amlValidation = this.validateAntiMoneyLaundering(payment);
    const notaryValidation = this.validateNotaryRequirements(payment);
    const bankingValidation = this.validateBankingCompliance(payment);

    return {
      dianCompliance: {
        reportable: dianValidation.reportable,
        threshold: dianValidation.threshold,
        category: dianValidation.category
      },
      antiMoneyLaundering: {
        compliant: amlValidation.compliant,
        flags: amlValidation.flags,
        recommendations: amlValidation.recommendations
      },
      notaryRequirements: {
        required: notaryValidation.required,
        estimatedCost: notaryValidation.estimatedCost,
        jurisdiction: notaryValidation.jurisdiction
      },
      bankingCompliance: {
        allowsMethod: bankingValidation.compliant,
        restrictions: bankingValidation.restrictions,
        alternatives: bankingValidation.alternatives
      }
    };
  }

  /**
   * Genera recomendaciones para mejorar el cumplimiento
   */
  static generateComplianceRecommendations(payment: ColombianPaymentStructure): {
    priority: 'low' | 'medium' | 'high';
    recommendations: Array<{
      type: 'legal' | 'operational' | 'financial';
      description: string;
      impact: string;
      urgency: 'immediate' | 'soon' | 'optional';
    }>;
  } {
    const recommendations: Array<{
      type: 'legal' | 'operational' | 'financial';
      description: string;
      impact: string;
      urgency: 'immediate' | 'soon' | 'optional';
    }> = [];

    const validation = this.validateCompletePayment(payment);

    // Recomendaciones basadas en validación DIAN
    if (validation.dianCompliance.reportable) {
      recommendations.push({
        type: 'legal',
        description: 'Preparar y enviar formulario 350 a la DIAN',
        impact: 'Evita sanciones tributarias',
        urgency: 'immediate'
      });
    }

    // Recomendaciones anti-lavado
    if (!validation.antiMoneyLaundering.compliant) {
      validation.antiMoneyLaundering.recommendations.forEach(rec => {
        recommendations.push({
          type: 'legal',
          description: rec,
          impact: 'Reduce riesgo de sanciones',
          urgency: 'immediate'
        });
      });
    }

    // Recomendaciones notariales
    if (validation.notaryRequirements.required) {
      recommendations.push({
        type: 'legal',
        description: 'Coordinar escritura pública con notaría',
        impact: 'Formaliza legalmente la transacción',
        urgency: 'soon'
      });
    }

    // Recomendaciones bancarias
    if (!validation.bankingCompliance.allowsMethod) {
      validation.bankingCompliance.alternatives.forEach(alt => {
        recommendations.push({
          type: 'financial',
          description: `Considerar método alternativo: ${alt.replace('_', ' ')}`,
          impact: 'Mejora seguridad y cumplimiento',
          urgency: 'soon'
        });
      });
    }

    // Recomendaciones operativas
    if (payment.paymentSchedule.length > 3) {
      recommendations.push({
        type: 'operational',
        description: 'Simplificar cronograma de pagos para reducir riesgos',
        impact: 'Facilita seguimiento y cumplimiento',
        urgency: 'optional'
      });
    }

    const priority = recommendations.some(r => r.urgency === 'immediate') ? 'high' :
                    recommendations.some(r => r.urgency === 'soon') ? 'medium' : 'low';

    return {
      priority,
      recommendations
    };
  }
}
