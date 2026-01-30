import { useState, useEffect, useCallback } from 'react';
import { dealsRepository, Deal, DealFilters, CreateDealInput, UpdateDealInput } from '../lib/db/repositories/deals.repo';
import { Result, isOk, isErr } from '../lib/utils/result';
import { AppError, toUserMessage } from '../lib/utils/errors';
import { logError } from '../lib/utils/logger';
import { toast } from 'sonner';

interface UseDealsOptions {
  filters?: DealFilters;
  autoFetch?: boolean;
}

interface UseDealsReturn {
  deals: Deal[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateDeal: (input: UpdateDealInput) => Promise<boolean>;
  deleteDeal: (dealId: string) => Promise<boolean>;
  createDeal: (input: CreateDealInput) => Promise<boolean>;
  stats: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    total_value: number;
    average_deal_value: number;
    this_month: number;
    success_rate: number;
  } | null;
}

export function useDeals({
  filters = {},
  autoFetch = true
}: UseDealsOptions = {}): UseDealsReturn {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UseDealsReturn['stats']>(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await dealsRepository.getDeals(filters);

      if (isOk(result)) {
        setDeals(result.data);
      } else {
        const errorMessage = toUserMessage(result.error);
        setError(errorMessage);
        logError('Failed to fetch deals', { filters, error: result.error });
      }
    } catch (err: any) {
      const errorMessage = toUserMessage(err);
      setError(errorMessage);
      logError('Failed to fetch deals', { filters, error: err });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const result = await dealsRepository.getDealStats();

      if (isOk(result)) {
        setStats(result.data);
      }
    } catch (err) {
      logError('Failed to fetch deal stats', { error: err });
    }
  }, []);

  const updateDeal = useCallback(async (input: UpdateDealInput): Promise<boolean> => {
    try {
      const result = await dealsRepository.updateDeal(input);

      if (isOk(result)) {
        // Update local state
        setDeals(prev => prev.map(deal =>
          deal.id === input.id
            ? { ...deal, ...input }
            : deal
        ));

        // Update stats
        await fetchStats();

        toast.success('Negociación actualizada exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to update deal', { input, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to update deal', { input, error: err });
      return false;
    }
  }, [fetchStats]);

  const deleteDeal = useCallback(async (dealId: string): Promise<boolean> => {
    try {
      const result = await dealsRepository.deleteDeal(dealId);

      if (isOk(result)) {
        // Remove deal from local state
        setDeals(prev => prev.filter(deal => deal.id !== dealId));

        // Update stats
        await fetchStats();

        toast.success('Negociación eliminada exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to delete deal', { dealId, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to delete deal', { dealId, error: err });
      return false;
    }
  }, [fetchStats]);

  const createDeal = useCallback(async (input: CreateDealInput): Promise<boolean> => {
    try {
      const result = await dealsRepository.createDeal(input);

      if (isOk(result)) {
        // Add new deal to local state
        setDeals(prev => [result.data, ...prev]);

        // Update stats
        await fetchStats();

        toast.success('Negociación creada exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to create deal', { input, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to create deal', { input, error: err });
      return false;
    }
  }, [fetchStats]);

  const refetch = useCallback(async () => {
    await Promise.all([fetchDeals(), fetchStats()]);
  }, [fetchDeals, fetchStats]);

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [refetch, autoFetch]);

  return {
    deals,
    loading,
    error,
    refetch,
    updateDeal,
    deleteDeal,
    createDeal,
    stats
  };
}

// Hook for deal details management
export function useDealDetails(dealId: string) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeal = useCallback(async () => {
    if (!dealId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await dealsRepository.getDealById(dealId);

      if (isOk(result)) {
        setDeal(result.data);
      } else {
        const errorMessage = toUserMessage(result.error);
        setError(errorMessage);
        logError('Failed to fetch deal details', { dealId, error: result.error });
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      setError(errorMessage);
      logError('Failed to fetch deal details', { dealId, error: err });
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  const updateDeal = useCallback(async (data: Partial<Deal>): Promise<boolean> => {
    try {
      if (!deal) return false;

      const result = await dealsRepository.updateDeal({
        id: deal.id,
        ...data
      } as UpdateDealInput);

      if (isOk(result)) {
        setDeal(prev => prev ? { ...prev, ...data } : null);
        toast.success('Negociación actualizada exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to update deal details', { dealId, data, error: err });
      return false;
    }
  }, [deal, dealId]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  return {
    deal,
    loading,
    error,
    refetch: fetchDeal,
    updateDeal
  };
}
