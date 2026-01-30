import { useState, useEffect, useCallback } from 'react';
import { casesRepository, Case, CaseDocument } from '../lib/db/repositories/cases.repo';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const useCases = () => {
  const { user, profile } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    if (!user || !profile) return;
    
    setLoading(true);
    setError(null);

    try {
      let result;
      
      // Fetch cases based on user role
      if (profile.role === 'lawyer') {
        result = await casesRepository.getCasesByParticipant(user.id, 'lawyer');
      } else if (profile.role === 'user') {
        // For regular users, we need to check if they're buyer or seller
        // We'll fetch both and merge them
        const buyerResult = await casesRepository.getCasesByParticipant(user.id, 'buyer');
        const sellerResult = await casesRepository.getCasesByParticipant(user.id, 'seller');
        
        if (buyerResult.isOk() && sellerResult.isOk()) {
          const allCases = [...buyerResult.value, ...sellerResult.value];
          // Remove duplicates by ID
          const uniqueCases = Array.from(new Map(allCases.map(c => [c.id, c])).values());
          setCases(uniqueCases);
          setLoading(false);
          return;
        } else {
          result = buyerResult.isOk() ? buyerResult : sellerResult;
        }
      } else {
        setError('Rol de usuario no válido para ver casos');
        setLoading(false);
        return;
      }

      if (result.isOk()) {
        setCases(result.value);
      } else {
        setError(result.error.message);
        toast.error(`Error al cargar casos: ${result.error.message}`);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error al cargar casos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  const getCaseById = useCallback(async (caseId: string): Promise<Case | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await casesRepository.getCaseById(caseId);
      if (result.isOk()) {
        return result.value;
      } else {
        setError(result.error.message);
        toast.error(`Error al cargar caso: ${result.error.message}`);
        return null;
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error al cargar caso: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCaseDocuments = useCallback(async (caseId: string): Promise<CaseDocument[]> => {
    setLoading(true);
    setError(null);

    try {
      const result = await casesRepository.getCaseDocuments(caseId);
      if (result.isOk()) {
        return result.value;
      } else {
        setError(result.error.message);
        toast.error(`Error al cargar documentos: ${result.error.message}`);
        return [];
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error al cargar documentos: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCaseStatus = useCallback(async (caseId: string, status: 'active' | 'closed' | 'pending') => {
    setLoading(true);
    setError(null);

    try {
      const result = await casesRepository.updateCase(caseId, { status, updated_at: new Date().toISOString() });
      if (result.isOk()) {
        toast.success('Estado del caso actualizado');
        fetchCases(); // Refresh the list
      } else {
        setError(result.error.message);
        toast.error(`Error al actualizar caso: ${result.error.message}`);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error al actualizar caso: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchCases]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return {
    cases,
    loading,
    error,
    fetchCases,
    getCaseById,
    getCaseDocuments,
    updateCaseStatus,
  };
};

