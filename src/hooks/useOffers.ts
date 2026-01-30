import { useState, useEffect, useCallback } from 'react';
import { offersRepository, Offer } from '../lib/db/repositories/offers.repo';
import { Result, isOk, isErr } from '../lib/utils/result';
import { AppError, toUserMessage } from '../lib/utils/errors';
import { logError } from '../lib/utils/logger';
import { 
  OfferFilters, 
  CreateOfferInput, 
  CounterOfferInput, 
  UpdateOfferStatusInput,
  OfferStatus 
} from '../lib/validation/offers.schema';
import { toast } from 'sonner';

interface UseOffersOptions {
  propertyId: string;
  filters?: OfferFilters;
  autoFetch?: boolean;
}

interface UseOffersReturn {
  offers: Offer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  submitOffer: (input: CreateOfferInput) => Promise<boolean>;
  acceptOffer: (offerId: string) => Promise<boolean>;
  rejectOffer: (offerId: string, reason?: string) => Promise<boolean>;
  counterOffer: (input: CounterOfferInput) => Promise<boolean>;
  updateStatus: (input: UpdateOfferStatusInput) => Promise<boolean>;
  stats: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    countered: number;
    expired: number;
  } | null;
}

export function useOffers({
  propertyId,
  filters = {},
  autoFetch = true
}: UseOffersOptions): UseOffersReturn {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UseOffersReturn['stats']>(null);

  const fetchOffers = useCallback(async () => {
    if (!propertyId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await offersRepository.getOffersByProperty(propertyId, filters);
      
      if (isOk(result)) {
        setOffers(result.data);
      } else {
        const errorMessage = toUserMessage(result.error);
        setError(errorMessage);
        logError('Failed to fetch offers', { propertyId, error: result.error });
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      setError(errorMessage);
      logError('Failed to fetch offers', { propertyId, error: err });
    } finally {
      setLoading(false);
    }
  }, [propertyId, filters]);

  const fetchStats = useCallback(async () => {
    if (!propertyId) return;

    try {
      const result = await offersRepository.getOfferStats(propertyId);
      
      if (isOk(result)) {
        setStats(result.data);
      }
    } catch (err) {
      logError('Failed to fetch offer stats', { propertyId, error: err });
    }
  }, [propertyId]);

  const submitOffer = useCallback(async (input: CreateOfferInput): Promise<boolean> => {
    try {
      const result = await offersRepository.createOffer(input);
      
      if (isOk(result)) {
        // Add new offer to local state
        setOffers(prev => [result.data, ...prev]);
        
        // Update stats
        await fetchStats();
        
        toast.success('Oferta enviada exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to submit offer', { input, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to submit offer', { input, error: err });
      return false;
    }
  }, [fetchStats]);

  const acceptOffer = useCallback(async (offerId: string): Promise<boolean> => {
    try {
      const result = await offersRepository.acceptOffer(offerId);
      
      if (isOk(result)) {
        // Update local state
        setOffers(prev => prev.map(offer => 
          offer.id === offerId ? result.data : offer
        ));
        
        // Update stats
        await fetchStats();
        
        toast.success('Oferta aceptada exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to accept offer', { offerId, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to accept offer', { offerId, error: err });
      return false;
    }
  }, [fetchStats]);

  const rejectOffer = useCallback(async (offerId: string, reason?: string): Promise<boolean> => {
    try {
      const result = await offersRepository.rejectOffer(offerId, reason);
      
      if (isOk(result)) {
        // Update local state
        setOffers(prev => prev.map(offer => 
          offer.id === offerId ? result.data : offer
        ));
        
        // Update stats
        await fetchStats();
        
        toast.success('Oferta rechazada exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to reject offer', { offerId, reason, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to reject offer', { offerId, reason, error: err });
      return false;
    }
  }, [fetchStats]);

  const counterOffer = useCallback(async (input: CounterOfferInput): Promise<boolean> => {
    try {
      const result = await offersRepository.createCounterOffer(input);
      
      if (isOk(result)) {
        // Add counter offer to local state
        setOffers(prev => [result.data, ...prev]);
        
        // Update stats
        await fetchStats();
        
        toast.success('Contraoferta enviada exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to create counter offer', { input, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to create counter offer', { input, error: err });
      return false;
    }
  }, [fetchStats]);

  const updateStatus = useCallback(async (input: UpdateOfferStatusInput): Promise<boolean> => {
    try {
      const result = await offersRepository.updateOfferStatus(
        input.offerId, 
        input.status, 
        input.reason, 
        input.notes
      );
      
      if (isOk(result)) {
        // Update local state
        setOffers(prev => prev.map(offer => 
          offer.id === input.offerId ? result.data : offer
        ));
        
        // Update stats
        await fetchStats();
        
        toast.success('Estado de oferta actualizado');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to update offer status', { input, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to update offer status', { input, error: err });
      return false;
    }
  }, [fetchStats]);

  const refetch = useCallback(async () => {
    await Promise.all([fetchOffers(), fetchStats()]);
  }, [fetchOffers, fetchStats]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [refetch, autoFetch]);

  return {
    offers,
    loading,
    error,
    refetch,
    submitOffer,
    acceptOffer,
    rejectOffer,
    counterOffer,
    updateStatus,
    stats
  };
}

// Hook for buyer's offers
export function useBuyerOffers(buyerId: string, filters: OfferFilters = {}) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    if (!buyerId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await offersRepository.getOffersByBuyer(buyerId, filters);
      
      if (isOk(result)) {
        setOffers(result.data);
      } else {
        const errorMessage = toUserMessage(result.error);
        setError(errorMessage);
        logError('Failed to fetch buyer offers', { buyerId, error: result.error });
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      setError(errorMessage);
      logError('Failed to fetch buyer offers', { buyerId, error: err });
    } finally {
      setLoading(false);
    }
  }, [buyerId, filters]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  return {
    offers,
    loading,
    error,
    refetch: fetchOffers
  };
}
