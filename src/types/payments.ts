/**
 * Sistema de pagos colombiano para ofertas inmobiliarias
 * Basado en prácticas legales colombianas (Código Civil, Ley 153/1887, DIAN)
 */

export type ColombianPaymentMethod =
  | 'efectivo'
  | 'transferencia_bancaria'
  | 'cheque'
  | 'financiacion_bancaria'
  | 'financiacion_vendedor'
  | 'cuotas'
  | 'criptomonedas'
  | 'permuta'
  | 'metales_preciosos'
  | 'pago_a_terceros'
  | 'mixto';

export interface PaymentSchedule {
  id: string;
  date: string; // Fecha de pago
  amount: number; // Monto a pagar
  description: string; // Descripción del pago
  paymentMethod: ColombianPaymentMethod; // Método específico para este pago
  recipient?: string; // Beneficiario (cuenta bancaria, wallet, etc.)
  verificationRequired: boolean; // Si requiere verificación bancaria
  verificationStatus?: 'pending' | 'verified' | 'failed';
  verificationDocument?: string; // URL del comprobante
  contingencies?: PaymentContingency[]; // Condiciones que afectan este pago
  otherConditions?: string; // Otras condiciones adicionales en texto libre
}

export interface PaymentContingency {
  type: 'credito_aprobado' | 'avaluo_satisfactorio' | 'inspeccion_aprobada' | 'titulo_limpio' | 'pago_previo' | 'fecha_limite' | 'paz_salvo_administracion' | 'paz_salvo_predial' | 'sucesion' | 'levantamiento_hipoteca' | 'poder_representar' | 'reforma_estatutaria' | 'certificado_tradicion' | 'certificado_libertad' | 'registro_comercial' | 'autorizacion_notarial' | 'declaracion_renta' | 'pago_impuestos';
  description: string;
  required: boolean;
  deadline?: string;
  verificationMethod?: string;
  documentRequired?: boolean;
  responsibleParty?: 'comprador' | 'vendedor' | 'notaria' | 'banco' | 'registro';
}

export interface BankingDetails {
  bankName: string;
  accountType: 'corriente' | 'ahorros' | 'fiduciaria';
  accountNumber: string;
  accountHolder: string;
  accountHolderId: string;
  branchOffice?: string;
  verificationRequired: boolean;
}

export interface CryptoDetails {
  currency: 'bitcoin' | 'ethereum' | 'usdt' | 'dai' | 'other';
  walletAddress: string;
  network: 'bitcoin' | 'ethereum' | 'polygon' | 'bsc' | 'other';
  exchange?: string; // Si se usa exchange intermediario
  verificationRequired: boolean;
  exchangeRatePeg?: 'usd' | 'cop'; // Tipo de cambio referenciado
}

export interface FinancingDetails {
  entity: 'banco' | 'financiera' | 'cooperativa' | 'vendedor' | 'other';
  entityName: string;
  approvedAmount: number;
  approvedRate: number; // Tasa de interés anual
  termMonths: number;
  monthlyPayment: number;
  downPayment: number;
  approvalDocument?: string; // URL del documento de aprobación
  appraisalRequired: boolean;
  appraisalValue?: number;
}

export interface ColombianPaymentStructure {
  method: ColombianPaymentMethod;

  // Estructura general
  totalAmount: number;
  currency: 'COP' | 'USD' | 'EUR'; // Moneda principal

  // Arras/Pago inicial
  earnestMoney?: {
    amount: number;
    percentage: number;
    dueDate: string;
    refundable: boolean;
    refundConditions?: string[];
  };

  // Pagos programados
  paymentSchedule: PaymentSchedule[];

  // Detalles específicos por método
  bankingDetails?: BankingDetails;
  cryptoDetails?: CryptoDetails;
  financingDetails?: FinancingDetails;

  // Contingencias y riesgos
  contingencies: PaymentContingency[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';

  // Información legal y regulatoria
  requiresDianReporting: boolean; // Reportable a DIAN (> cierto monto)
  internationalTransfer: boolean; // Transferencia internacional
  requiresNotary: boolean; // Requiere notaría para algunos pagos

  // Metadata
  createdAt: string;
  updatedAt: string;
  version: number;
}

// Interfaces para validación legal colombiana
export interface ColombianPaymentValidation {
  dianCompliance: {
    reportable: boolean;
    threshold: number; // Monto mínimo para reporte
    category: 'venta_inmueble' | 'transferencia_grande' | 'internacional';
  };

  antiMoneyLaundering: {
    compliant: boolean;
    flags: string[];
    recommendations: string[];
  };

  notaryRequirements: {
    required: boolean;
    estimatedCost: number;
    jurisdiction: string;
  };

  bankingCompliance: {
    allowsMethod: boolean;
    restrictions: string[];
    alternatives: ColombianPaymentMethod[];
  };
}

// Tipos para la UI de selección de pagos
export interface PaymentMethodOption {
  value: ColombianPaymentMethod;
  label: string;
  description: string;
  icon: string;
  risk: 'low' | 'medium' | 'high';
  legalNotes?: string[];
  recommendedFor: string[];
  requiresVerification: boolean;
  maxAmount?: number;
  fees?: {
    fixed: number;
    percentage: number;
  };
}

// Constantes con métodos de pago colombianos comunes
export const COLOMBIAN_PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    value: 'transferencia_bancaria',
    label: 'Transferencia Bancaria',
    description: 'Transferencia electrónica entre cuentas bancarias colombianas',
    icon: 'CreditCard',
    risk: 'low',
    legalNotes: [
      'Método más seguro y rastreable',
      'Requiere verificación bancaria',
      'Comisión baja (0.1-0.3%)'
    ],
    recommendedFor: 'Todos los montos',
    requiresVerification: true,
    fees: { fixed: 0, percentage: 0.002 }
  },
  {
    value: 'efectivo',
    label: 'Efectivo',
    description: 'Pago en efectivo en notaría o entrega directa',
    icon: 'DollarSign',
    risk: 'high',
    legalNotes: [
      'Limitado por ley anti-lavado (Ley 1908/2018)',
      'Reportable a DIAN si > $200M COP',
      'Requiere recibo notariado'
    ],
    recommendedFor: 'Montos pequeños',
    requiresVerification: true,
    maxAmount: 200000000
  },
  {
    value: 'cheque',
    label: 'Cheque Nominativo',
    description: 'Cheque a nombre del vendedor o notaría',
    icon: 'FileText',
    risk: 'medium',
    legalNotes: [
      'Debe ser nominativo (Ley 510/1999)',
      'Requiere confirmación bancaria',
      'Riesgo de rechazo'
    ],
    recommendedFor: 'Pagos programados',
    requiresVerification: true
  },
  {
    value: 'financiacion_bancaria',
    label: 'Financiación Bancaria',
    description: 'Crédito hipotecario aprobado por entidad financiera',
    icon: 'Building2',
    risk: 'medium',
    legalNotes: [
      'Requiere aprobación previa',
      'Avalúo obligatorio',
      'Tasa máxima regulada por Banco de la República'
    ],
    recommendedFor: 'Compradores con crédito aprobado',
    requiresVerification: true
  },
  {
    value: 'cuotas',
    label: 'Pago en Cuotas',
    description: 'Pagos fraccionados acordados entre partes',
    icon: 'Calendar',
    risk: 'high',
    legalNotes: [
      'Debe formalizarse en promesa de compraventa',
      'Intereses moratorios por defecto',
      'Requiere garantías adicionales'
    ],
    recommendedFor: 'Acuerdos familiares o conocidos',
    requiresVerification: true
  },
  {
    value: 'criptomonedas',
    label: 'Criptomonedas',
    description: 'Pago en Bitcoin, Ethereum u otras criptomonedas',
    icon: 'Coins',
    risk: 'high',
    legalNotes: [
      'Riesgo de volatilidad',
      'Regulado por Superfinanciera',
      'Requiere conversión a COP',
      'Reportable si > $200M COP'
    ],
    recommendedFor: 'Compradores tecnológicos',
    requiresVerification: true,
    maxAmount: 200000000
  },
  {
    value: 'permuta',
    label: 'Permuta',
    description: 'Intercambio de bienes (otra propiedad, vehículo, etc.)',
    icon: 'ArrowRightLeft',
    risk: 'medium',
    legalNotes: [
      'Requiere avalúos independientes',
      'Impuestos por ganancia ocasional',
      'Formalizado en escritura pública'
    ],
    recommendedFor: 'Propietarios con activos equivalentes',
    requiresVerification: true
  },
  {
    value: 'mixto',
    label: 'Pago Mixto',
    description: 'Combinación de varios métodos de pago',
    icon: 'Shuffle',
    risk: 'medium',
    legalNotes: [
      'Común en transacciones grandes',
      'Cada método mantiene sus requisitos legales',
      'Permite optimizar flujos de caja'
    ],
    recommendedFor: 'Transacciones complejas',
    requiresVerification: true
  }
];

// Funciones de utilidad para validación
export function validateColombianPayment(
  payment: ColombianPaymentStructure
): ColombianPaymentValidation {
  const validation: ColombianPaymentValidation = {
    dianCompliance: {
      reportable: payment.totalAmount > 200000000, // $200M COP
      threshold: 200000000,
      category: payment.internationalTransfer ? 'internacional' : 'venta_inmueble'
    },
    antiMoneyLaundering: {
      compliant: true,
      flags: [],
      recommendations: []
    },
    notaryRequirements: {
      required: payment.totalAmount > 50000000, // $50M COP requiere notaría
      estimatedCost: payment.totalAmount > 50000000 ? payment.totalAmount * 0.007 : 0,
      jurisdiction: 'Bogotá' // Podría variar por ubicación
    },
    bankingCompliance: {
      allowsMethod: true,
      restrictions: [],
      alternatives: []
    }
  };

  // Validaciones específicas por método
  switch (payment.method) {
    case 'efectivo':
      if (payment.totalAmount > 200000000) {
        validation.antiMoneyLaundering.compliant = false;
        validation.antiMoneyLaundering.flags.push('Monto excede límite anti-lavado');
        validation.antiMoneyLaundering.recommendations.push('Usar transferencia bancaria');
        validation.bankingCompliance.allowsMethod = false;
        validation.bankingCompliance.restrictions.push('Límite $200M COP por ley anti-lavado');
        validation.bankingCompliance.alternatives.push('transferencia_bancaria');
      }
      break;

    case 'criptomonedas':
      validation.antiMoneyLaundering.flags.push('Método de alto riesgo');
      validation.antiMoneyLaundering.recommendations.push('Considerar conversión a COP primero');
      if (payment.totalAmount > 200000000) {
        validation.dianCompliance.reportable = true;
      }
      break;

    case 'financiacion_bancaria':
      if (!payment.financingDetails?.appraisalRequired) {
        validation.antiMoneyLaundering.flags.push('Falta avalúo obligatorio');
      }
      break;
  }

  return validation;
}

export function calculatePaymentRisk(payment: ColombianPaymentStructure): number {
  let riskScore = 0;

  // Riesgo por método
  const methodRisks: Record<ColombianPaymentMethod, number> = {
    'transferencia_bancaria': 1,
    'cheque': 2,
    'financiacion_bancaria': 2,
    'financiacion_vendedor': 3,
    'efectivo': 4,
    'cuotas': 4,
    'mixto': 2,
    'criptomonedas': 5,
    'permuta': 3,
    'metales_preciosos': 5,
    'pago_a_terceros': 4
  };

  riskScore += methodRisks[payment.method] || 3;

  // Riesgo por monto
  if (payment.totalAmount > 1000000000) riskScore += 2; // > $1B COP
  else if (payment.totalAmount > 500000000) riskScore += 1; // > $500M COP

  // Riesgo por internacional
  if (payment.internationalTransfer) riskScore += 2;

  // Riesgo por contingencias
  riskScore += payment.contingencies.filter(c => c.required).length;

  return Math.min(10, riskScore);
}
