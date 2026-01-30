import { useState, useEffect, useCallback } from 'react';
import { lawyersRepository, LawyerProfile, LawyerFilters, CreateLawyerInput, UpdateLawyerInput } from '../lib/db/repositories/lawyers.repo';
import { Result, isOk, isErr } from '../lib/utils/result';
import { AppError, toUserMessage } from '../lib/utils/errors';
import { logError } from '../lib/utils/logger';
import { toast } from 'sonner';

interface UseLawyersOptions {
  filters?: LawyerFilters;
  autoFetch?: boolean;
}

interface UseLawyersReturn {
  lawyers: LawyerProfile[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateLawyer: (input: UpdateLawyerInput) => Promise<boolean>;
  deleteLawyer: (lawyerId: string) => Promise<boolean>;
  createLawyer: (input: CreateLawyerInput) => Promise<boolean>;
  stats: {
    total: number;
    verified: number;
    pending: number;
    active_cases: number;
    completed_cases: number;
    average_rating: number;
    top_specializations: Array<{ specialization: string; count: number }>;
  } | null;
}

export function useLawyers({
  filters = {},
  autoFetch = true
}: UseLawyersOptions = {}): UseLawyersReturn {
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UseLawyersReturn['stats']>(null);

  const fetchLawyers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await lawyersRepository.getLawyers(filters);

      if (isOk(result)) {
        setLawyers(result.data);
      } else {
        const errorMessage = toUserMessage(result.error);
        setError(errorMessage);
        logError('Failed to fetch lawyers', { filters, error: result.error });
      }
    } catch (err: any) {
      const errorMessage = toUserMessage(err);
      setError(errorMessage);
      logError('Failed to fetch lawyers', { filters, error: err });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const result = await lawyersRepository.getLawyerStats();

      if (isOk(result)) {
        setStats(result.data);
      }
    } catch (err) {
      logError('Failed to fetch lawyer stats', { error: err });
    }
  }, []);

  const updateLawyer = useCallback(async (input: UpdateLawyerInput): Promise<boolean> => {
    try {
      const result = await lawyersRepository.updateLawyer(input);

      if (isOk(result)) {
        // Update local state
        setLawyers(prev => prev.map(lawyer =>
          lawyer.id === input.id
            ? { ...lawyer, ...input }
            : lawyer
        ));

        // Update stats
        await fetchStats();

        toast.success('Abogado actualizado exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to update lawyer', { input, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to update lawyer', { input, error: err });
      return false;
    }
  }, [fetchStats]);

  const deleteLawyer = useCallback(async (lawyerId: string): Promise<boolean> => {
    try {
      const result = await lawyersRepository.deleteLawyer(lawyerId);

      if (isOk(result)) {
        // Remove lawyer from local state
        setLawyers(prev => prev.filter(lawyer => lawyer.id !== lawyerId));

        // Update stats
        await fetchStats();

        toast.success('Abogado eliminado exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to delete lawyer', { lawyerId, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to delete lawyer', { lawyerId, error: err });
      return false;
    }
  }, [fetchStats]);

  const createLawyer = useCallback(async (input: CreateLawyerInput): Promise<boolean> => {
    try {
      const result = await lawyersRepository.createLawyer(input);

      if (isOk(result)) {
        // Add new lawyer to local state
        setLawyers(prev => [result.data, ...prev]);

        // Update stats
        await fetchStats();

        toast.success('Abogado creado exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to create lawyer', { input, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to create lawyer', { input, error: err });
      return false;
    }
  }, [fetchStats]);

  const refetch = useCallback(async () => {
    await Promise.all([fetchLawyers(), fetchStats()]);
  }, [fetchLawyers, fetchStats]);

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [refetch, autoFetch]);

  return {
    lawyers,
    loading,
    error,
    refetch,
    updateLawyer,
    deleteLawyer,
    createLawyer,
    stats
  };
}

// Hook for lawyer profile management
export function useLawyerProfile(lawyerId: string) {
  const [lawyer, setLawyer] = useState<LawyerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLawyer = useCallback(async () => {
    if (!lawyerId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await lawyersRepository.getLawyerById(lawyerId);

      if (isOk(result)) {
        setLawyer(result.data);
      } else {
        const errorMessage = toUserMessage(result.error);
        setError(errorMessage);
        logError('Failed to fetch lawyer profile', { lawyerId, error: result.error });
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      setError(errorMessage);
      logError('Failed to fetch lawyer profile', { lawyerId, error: err });
    } finally {
      setLoading(false);
    }
  }, [lawyerId]);

  const updateProfile = useCallback(async (data: Partial<LawyerProfile>): Promise<boolean> => {
    try {
      if (!lawyer) return false;

      const result = await lawyersRepository.updateLawyer({
        id: lawyer.id,
        ...data
      } as UpdateLawyerInput);

      if (isOk(result)) {
        setLawyer(prev => prev ? { ...prev, ...data } : null);
        toast.success('Perfil actualizado exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to update lawyer profile', { lawyerId, data, error: err });
      return false;
    }
  }, [lawyer, lawyerId]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchLawyer();
  }, [fetchLawyer]);

  return {
    lawyer,
    loading,
    error,
    refetch: fetchLawyer,
    updateProfile
  };
}
