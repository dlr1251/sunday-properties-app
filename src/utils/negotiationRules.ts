// Negotiation Rules Validation Engine
// Validates offers against property negotiation rules and auto-rejects invalid ones

export interface OfferValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100 score for offer quality
}

export interface NegotiationRules {
  minPrice?: number;
  maxClosingDays?: number;
  requiredPaymentMethods?: string[];
  autoRejectEnabled?: boolean;
  manualReviewThreshold?: number;
  specialConditions?: string[];
}

export interface OfferData {
  price: number;
  paymentMethod: string;
  closingDate: string;
  conditions: string;
  downPayment?: number;
}

/**
 * Validates an offer against negotiation rules
 */
export function validateOffer(
  offer: OfferData,
  rules: NegotiationRules | null,
  propertyPrice: number
): OfferValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 50; // Base score

  if (!rules) {
    return { isValid: true, errors, warnings, score: 100 };
  }

  // 1. Price validation
  if (rules.minPrice && offer.price < rules.minPrice) {
    errors.push(`El precio (${formatCurrency(offer.price)}) está por debajo del mínimo establecido (${formatCurrency(rules.minPrice)})`);
    score -= 30;
  } else if (offer.price >= propertyPrice * 0.95) {
    score += 20; // Excellent price
  } else if (offer.price >= propertyPrice * 0.90) {
    score += 10; // Good price
  }

  // 2. Payment method validation
  if (rules.requiredPaymentMethods && rules.requiredPaymentMethods.length > 0) {
    if (!rules.requiredPaymentMethods.includes(offer.paymentMethod)) {
      const allowedMethods = rules.requiredPaymentMethods
        .map(method => getPaymentMethodLabel(method))
        .join(', ');
      errors.push(`Método de pago no aceptado. Métodos permitidos: ${allowedMethods}`);
      score -= 25;
    } else {
      score += 15; // Preferred payment method
    }
  }

  // 3. Closing date validation
  if (rules.maxClosingDays && offer.closingDate) {
    const closingDate = new Date(offer.closingDate);
    const today = new Date();
    const daysToClose = Math.ceil((closingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysToClose > rules.maxClosingDays) {
      errors.push(`Fecha de cierre demasiado lejana. Máximo ${rules.maxClosingDays} días`);
      score -= 20;
    } else if (daysToClose <= 30) {
      score += 15; // Quick closing
    } else if (daysToClose <= 60) {
      score += 10; // Reasonable closing
    }
  }

  // 4. Special conditions check
  if (rules.specialConditions && rules.specialConditions.length > 0) {
    const hasRequiredConditions = rules.specialConditions.some(condition =>
      offer.conditions.toLowerCase().includes(condition.toLowerCase())
    );

    if (!hasRequiredConditions) {
      warnings.push(`Considera incluir las condiciones requeridas: ${rules.specialConditions.join(', ')}`);
      score -= 5;
    }
  }

  // 5. Financing validation
  if (offer.paymentMethod === 'financing') {
    if (!offer.downPayment || offer.downPayment < offer.price * 0.1) {
      warnings.push('Para financiamiento, se recomienda un pago inicial del 10% o más');
      score -= 5;
    } else {
      score += 5; // Good down payment
    }
  }

  // 6. Conditions length check
  if (offer.conditions && offer.conditions.length > 500) {
    warnings.push('Las condiciones son muy extensas. Considera simplificar');
    score -= 2;
  } else if (!offer.conditions || offer.conditions.trim().length === 0) {
    score += 5; // No special conditions = cleaner offer
  }

  // Ensure score stays within bounds
  score = Math.max(0, Math.min(100, score));

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score
  };
}

/**
 * Determines if an offer should be auto-rejected based on rules
 */
export function shouldAutoReject(
  offer: OfferData,
  rules: NegotiationRules | null,
  propertyPrice: number
): boolean {
  if (!rules?.autoRejectEnabled) {
    return false;
  }

  const validation = validateOffer(offer, rules, propertyPrice);

  // Auto-reject if there are critical errors
  return validation.errors.length > 0;
}

/**
 * Determines if an offer should be flagged for manual review
 */
export function requiresManualReview(
  offer: OfferData,
  rules: NegotiationRules | null,
  propertyPrice: number
): boolean {
  if (!rules?.manualReviewThreshold) {
    return false;
  }

  const validation = validateOffer(offer, rules, propertyPrice);

  // Flag for manual review if score is below threshold
  return validation.score < rules.manualReviewThreshold;
}

/**
 * Gets offer quality assessment
 */
export function getOfferQuality(offer: OfferData, propertyPrice: number): {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  reasons: string[];
} {
  const priceRatio = offer.price / propertyPrice;
  const reasons: string[] = [];

  if (priceRatio >= 0.95) {
    reasons.push('Precio excelente (95%+ del precio de lista)');
  } else if (priceRatio >= 0.90) {
    reasons.push('Buen precio (90%+ del precio de lista)');
  } else if (priceRatio >= 0.80) {
    reasons.push('Precio justo');
  } else {
    reasons.push('Precio por debajo del mercado');
  }

  if (offer.paymentMethod === 'cash') {
    reasons.push('Pago en efectivo preferido');
  }

  const closingDate = new Date(offer.closingDate);
  const daysToClose = Math.ceil((closingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (daysToClose <= 30) {
    reasons.push('Cierre rápido (ideal)');
  } else if (daysToClose <= 60) {
    reasons.push('Cierre razonable');
  }

  let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'fair';

  if (priceRatio >= 0.95 && offer.paymentMethod === 'cash' && daysToClose <= 30) {
    quality = 'excellent';
  } else if (priceRatio >= 0.90 && (offer.paymentMethod === 'cash' || daysToClose <= 60)) {
    quality = 'good';
  } else if (priceRatio < 0.80) {
    quality = 'poor';
  }

  return { quality, reasons };
}

// Helper functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'Efectivo',
    bank_transfer: 'Transferencia bancaria',
    financing: 'Financiación',
    crypto: 'Criptomonedas',
    installments: 'Cuotas',
    mixed: 'Mixto'
  };
  return labels[method] || method;
}

// Export types for use in components
export type { OfferValidation, NegotiationRules, OfferData };