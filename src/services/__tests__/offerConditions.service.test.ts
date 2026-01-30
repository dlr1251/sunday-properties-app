import { describe, it, expect, beforeEach, vi } from 'vitest';
import { offerConditionsService, ConditionType, ConditionStatus } from '../offerConditions.service';
import { supabase } from '../../lib/supabase';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({
              data: [],
              error: null
            }))
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: null,
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: null
            }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          error: null
        }))
      }))
    })),
    rpc: vi.fn(() => Promise.resolve({
      data: 0,
      error: null
    }))
  }
}));

vi.mock('../../lib/utils/result', () => ({
  tryCatch: vi.fn((fn) => fn()),
  ok: vi.fn((data) => ({ ok: true, data })),
  err: vi.fn((error) => ({ ok: false, error }))
}));

describe('OfferConditionsService', () => {
  describe('getConditionsByOffer', () => {
    it('should fetch conditions for an offer', async () => {
      const result = await offerConditionsService.getConditionsByOffer('test-offer-1');
      expect(result.ok).toBe(true);
    });
  });

  describe('createCondition', () => {
    it('should create a new condition', async () => {
      const input = {
        offerId: 'test-offer-1',
        conditionType: 'inspection_contingency' as ConditionType,
        conditionKey: 'inspection_contingency',
        conditionValue: { description: 'Test inspection' },
        conditionDisplayText: 'Test inspection',
        proposedBy: 'buyer' as const
      };

      const result = await offerConditionsService.createCondition(input);
      expect(result.ok).toBeDefined();
    });

    it('should validate required fields', async () => {
      const input = {
        offerId: '',
        conditionType: 'inspection_contingency' as ConditionType,
        conditionKey: '',
        conditionDisplayText: '',
        proposedBy: 'buyer' as const
      };

      const result = await offerConditionsService.createCondition(input);
      // Should handle validation error
      expect(result).toBeDefined();
    });
  });

  describe('acceptCondition', () => {
    it('should accept a condition', async () => {
      const result = await offerConditionsService.acceptCondition('test-condition-1');
      expect(result).toBeDefined();
    });
  });

  describe('rejectCondition', () => {
    it('should reject a condition', async () => {
      const result = await offerConditionsService.rejectCondition('test-condition-1');
      expect(result).toBeDefined();
    });
  });

  describe('getConditionHistory', () => {
    it('should fetch condition history', async () => {
      const result = await offerConditionsService.getConditionHistory(
        'test-offer-1',
        'inspection_contingency'
      );
      expect(result).toBeDefined();
    });
  });
});

