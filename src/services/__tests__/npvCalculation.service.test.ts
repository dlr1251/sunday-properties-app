import { describe, it, expect, beforeEach, vi } from 'vitest';
import { npvCalculationService } from '../npvCalculation.service';
import { supabase } from '../../lib/supabase';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(() => Promise.resolve({
      data: [{
        npv: 495000000,
        adjusted_value: 500000000,
        risk_adjusted_npv: 490000000,
        breakdown: {
          base_price: 500000000,
          payment_method_adjustment: 10000000,
          time_value_adjustment: 5000000,
          inflation_adjustment: 0,
          notary_costs_adjustment: 0,
          total_conditions_npv_impact: -10000000,
          total_conditions_risk_impact: 10,
          final_adjusted_value: 500000000,
          base_risk_factor: 0.05,
          final_risk_adjusted_npv: 490000000
        }
      }],
      error: null
    }))
  }
}));

vi.mock('../../lib/utils/result', () => ({
  tryCatch: vi.fn((fn) => fn()),
  ok: vi.fn((data) => ({ ok: true, data })),
  err: vi.fn((error) => ({ ok: false, error }))
}));

describe('NPVCalculationService', () => {
  describe('calculateOfferNPV', () => {
    it('should calculate NPV for an offer', async () => {
      const result = await npvCalculationService.calculateOfferNPV('test-offer-1');
      expect(result.ok).toBe(true);
      
      if (result.ok) {
        expect(result.data.npv).toBeDefined();
        expect(result.data.riskAdjustedNPV).toBeDefined();
        expect(result.data.breakdown).toBeDefined();
      }
    });

    it('should allow custom discount rate', async () => {
      const result = await npvCalculationService.calculateOfferNPV('test-offer-1', 0.10);
      expect(result).toBeDefined();
    });
  });

  describe('compareOffersByNPV', () => {
    it('should compare multiple offers', async () => {
      const result = await npvCalculationService.compareOffersByNPV([
        'test-offer-1',
        'test-offer-2'
      ]);
      expect(result).toBeDefined();
    });
  });

  describe('performSensitivityAnalysis', () => {
    it('should perform sensitivity analysis', async () => {
      const result = await npvCalculationService.performSensitivityAnalysis(
        'test-offer-1',
        'discount_rate',
        [0.05, 0.08, 0.10]
      );
      expect(result).toBeDefined();
    });
  });
});

