import { supabase } from '../supabase';
import { Result, ok, err, tryCatch } from '../lib/utils/result';
import { AppError, createDatabaseError } from '../lib/utils/errors';
import { logError } from '../lib/utils/logger';
import { OfferCondition } from '../types/database';

export interface NPVCalculationResult {
  npv: number;
  adjustedValue: number;
  riskAdjustedNPV: number;
  breakdown: NPVBreakdown;
  confidence: number; // 0-100
}

export interface NPVBreakdown {
  baseValue: number;
  paymentMethodAdjustment: number;
  timeAdjustment: number;
  riskAdjustment: number;
  conditionsAdjustment: number;
  inflationAdjustment?: number;
  totalAdjustments: number;
  closingDays?: number;
  deliveryDays?: number;
  deedDays?: number;
  paymentMethod?: string;
}

export interface NPVComparison {
  offerId: string;
  npv: number;
  riskAdjustedNPV: number;
  ranking: number;
  deltaFromBest: number;
}

export interface NPVScenario {
  scenarioName: string;
  changes: {
    closingDate?: string;
    paymentMethod?: string;
    conditions?: any[];
  };
}

export interface NPVScenarioResult {
  scenario: NPVScenario;
  npv: number;
  riskAdjustedNPV: number;
  breakdown: NPVBreakdown;
  deltaFromBase: number;
}

export interface NPVSensitivityAnalysis {
  discountRateSensitivity: Array<{ rate: number; npv: number }>;
  timeSensitivity: Array<{ days: number; npv: number }>;
  paymentMethodImpact: Array<{ method: string; npv: number }>;
}

export class NPVCalculationService {
  private static instance: NPVCalculationService;

  private constructor() {}

  public static getInstance(): NPVCalculationService {
    if (!NPVCalculationService.instance) {
      NPVCalculationService.instance = new NPVCalculationService();
    }
    return NPVCalculationService.instance;
  }

  /**
   * Calculate NPV for an offer (calls SQL function)
   */
  async calculateOfferNPV(
    offerId: string,
    baseDiscountRate: number = 0.10
  ): Promise<Result<NPVCalculationResult, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase.rpc('calculate_offer_npv', {
        p_offer_id: offerId,
        p_base_discount_rate: baseDiscountRate
      });

      if (error) {
        logError('Failed to calculate NPV', { offerId, error });
        throw createDatabaseError('Error al calcular el VPN', error);
      }

      if (!data || data.length === 0) {
        throw createDatabaseError('No se recibieron datos del cálculo de VPN');
      }

      const result = data[0];
      const breakdown = result.breakdown as any;

      // Calculate confidence based on data quality
      const confidence = this.calculateConfidence(result, breakdown);

      const npvResult: NPVCalculationResult = {
        npv: Number(result.npv),
        adjustedValue: Number(result.adjusted_value),
        riskAdjustedNPV: Number(result.risk_adjusted_npv),
        breakdown: {
          baseValue: breakdown.base_value || 0,
          paymentMethodAdjustment: breakdown.payment_method_adjustment || 0,
          timeAdjustment: breakdown.time_adjustment || 0,
          riskAdjustment: breakdown.risk_adjustment || 0,
          conditionsAdjustment: breakdown.conditions_adjustment || 0,
          inflationAdjustment: breakdown.inflation_adjustment || 0,
          totalAdjustments: breakdown.total_adjustments || 0,
          closingDays: breakdown.closing_days,
          deliveryDays: breakdown.delivery_days,
          deedDays: breakdown.deed_days,
          paymentMethod: breakdown.payment_method
        },
        confidence
      };

      return npvResult;
    });
  }

  /**
   * Compare NPV of multiple offers
   */
  async compareOffersNPV(offerIds: string[]): Promise<Result<NPVComparison[], AppError>> {
    return tryCatch(async () => {
      const comparisons: NPVComparison[] = [];
      let maxNPV = -Infinity;

      // Calculate NPV for each offer
      for (const offerId of offerIds) {
        const npvResult = await this.calculateOfferNPV(offerId);
        if (npvResult.ok) {
          const npv = npvResult.data.riskAdjustedNPV;
          if (npv > maxNPV) {
            maxNPV = npv;
          }

          comparisons.push({
            offerId,
            npv: npvResult.data.npv,
            riskAdjustedNPV: npv,
            ranking: 0, // Will be set after
            deltaFromBest: 0 // Will be set after
          });
        }
      }

      // Calculate ranking and delta
      comparisons.sort((a, b) => b.riskAdjustedNPV - a.riskAdjustedNPV);

      comparisons.forEach((comp, index) => {
        comp.ranking = index + 1;
        comp.deltaFromBest = maxNPV - comp.riskAdjustedNPV;
      });

      return comparisons;
    });
  }

  /**
   * Simulate NPV with different scenarios
   */
  async simulateNPVScenarios(
    offerId: string,
    scenarios: NPVScenario[]
  ): Promise<Result<NPVScenarioResult[], AppError>> {
    return tryCatch(async () => {
      // Get base NPV
      const baseNPResult = await this.calculateOfferNPV(offerId);
      if (!baseNPResult.ok) {
        return baseNPResult;
      }

      const baseNPV = baseNPResult.data.riskAdjustedNPV;
      const results: NPVScenarioResult[] = [];

      // Calculate NPV for each scenario
      for (const scenario of scenarios) {
        // This would require creating temporary offer modifications
        // For now, we'll return a simplified version
        // In production, this would involve more complex calculations

        results.push({
          scenario,
          npv: baseNPV, // Placeholder
          riskAdjustedNPV: baseNPV,
          breakdown: baseNPResult.data.breakdown,
          deltaFromBase: 0
        });
      }

      return results;
    });
  }

  /**
   * Get NPV sensitivity analysis
   */
  async getNPVSensitivity(offerId: string): Promise<Result<NPVSensitivityAnalysis, AppError>> {
    return tryCatch(async () => {
      // Get base NPV
      const baseNPResult = await this.calculateOfferNPV(offerId);
      if (!baseNPResult.ok) {
        return baseNPResult;
      }

      const analysis: NPVSensitivityAnalysis = {
        discountRateSensitivity: [],
        timeSensitivity: [],
        paymentMethodImpact: []
      };

      // Test different discount rates
      const discountRates = [0.05, 0.07, 0.10, 0.12, 0.15];
      for (const rate of discountRates) {
        const result = await this.calculateOfferNPV(offerId, rate);
        if (result.ok) {
          analysis.discountRateSensitivity.push({
            rate,
            npv: result.data.npv
          });
        }
      }

      // Payment method impact would require offer data
      // This is a placeholder for the structure
      analysis.paymentMethodImpact = [
        { method: 'cash', npv: baseNPResult.data.npv * 1.02 },
        { method: 'financing', npv: baseNPResult.data.npv * 0.97 },
        { method: 'crypto', npv: baseNPResult.data.npv * 0.95 },
        { method: 'mixed', npv: baseNPResult.data.npv * 0.99 }
      ];

      return analysis;
    });
  }

  /**
   * Calculate confidence score for NPV calculation
   */
  private calculateConfidence(result: any, breakdown: any): number {
    let confidence = 100;

    // Reduce confidence if adjustments are large (indicates uncertainty)
    const totalAdjustments = Math.abs(breakdown.total_adjustments || 0);
    const baseValue = breakdown.base_value || 1;
    const adjustmentPercentage = (totalAdjustments / baseValue) * 100;

    if (adjustmentPercentage > 20) {
      confidence -= 20;
    } else if (adjustmentPercentage > 10) {
      confidence -= 10;
    }

    // Reduce confidence if there are many conditions (more complex = more uncertainty)
    if (breakdown.conditions_count && breakdown.conditions_count > 5) {
      confidence -= 10;
    }

    // Reduce confidence for unusual payment methods
    if (breakdown.payment_method === 'crypto') {
      confidence -= 15;
    }

    // Ensure minimum confidence
    return Math.max(50, confidence);
  }
}

// Export singleton instance
export const npvCalculationService = NPVCalculationService.getInstance();

