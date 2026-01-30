import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export type ResourceType = 'user' | 'property' | 'negotiation' | 'document';

interface ResourceDetailHookOptions {
  resourceType: ResourceType;
  resourceId: string | null;
  enabled?: boolean;
}

interface UseResourceDetailResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  update: (updates: Partial<T>) => Promise<boolean>;
}

export function useResourceDetail<T = any>({
  resourceType,
  resourceId,
  enabled = true,
}: ResourceDetailHookOptions): UseResourceDetailResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResource = useCallback(async () => {
    if (!resourceId || !enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query;

      switch (resourceType) {
        case 'user':
          query = supabase
            .from('profiles')
            .select(`
              *,
              properties_owned:properties!properties_owner_id_fkey(
                id,
                title,
                address,
                status,
                price,
                created_at
              ),
              properties_agent:properties!properties_agent_id_fkey(
                id,
                title,
                address,
                status,
                price,
                created_at
              )
            `)
            .eq('id', resourceId)
            .single();
          break;

        case 'property':
          query = supabase
            .from('properties')
            .select(`
              *,
              owner:profiles!properties_owner_id_fkey(
                id,
                full_name,
                email,
                phone
              ),
              agent:profiles!properties_agent_id_fkey(
                id,
                full_name,
                email,
                phone
              )
            `)
            .eq('id', resourceId)
            .single();
          break;

        case 'negotiation':
          query = supabase
            .from('negotiations')
            .select(`
              *,
              property:properties(
                id,
                title,
                address,
                price
              ),
              participants:negotiation_participants(
                *,
                user:profiles(
                  id,
                  full_name,
                  email,
                  role
                )
              )
            `)
            .eq('id', resourceId)
            .single();
          break;

        case 'document':
          // Try to find in different document tables
          const [legalDoc, caseDoc, verificationDoc] = await Promise.all([
            supabase
              .from('legal_documents')
              .select('*')
              .eq('id', resourceId)
              .single(),
            supabase
              .from('case_documents')
              .select('*')
              .eq('id', resourceId)
              .single(),
            supabase
              .from('verification_documents')
              .select('*')
              .eq('id', resourceId)
              .single(),
          ]);

          const docData = legalDoc.data || caseDoc.data || verificationDoc.data;
          const docError = legalDoc.error && caseDoc.error && verificationDoc.error;

          if (docError && !docData) {
            throw docError;
          }

          setData(docData as T);
          setLoading(false);
          return;

        default:
          throw new Error(`Unsupported resource type: ${resourceType}`);
      }

      const { data: result, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setData(result as T);
    } catch (err: any) {
      const errorMessage = err.message || `Error al cargar ${resourceType}`;
      setError(errorMessage);
      console.error(`Error fetching ${resourceType}:`, err);
    } finally {
      setLoading(false);
    }
  }, [resourceType, resourceId, enabled]);

  const update = useCallback(
    async (updates: Partial<T>): Promise<boolean> => {
      if (!resourceId) return false;

      try {
        let updateQuery;

        switch (resourceType) {
          case 'user':
            updateQuery = supabase
              .from('profiles')
              .update({ ...updates, updated_at: new Date().toISOString() })
              .eq('id', resourceId);
            break;

          case 'property':
            updateQuery = supabase
              .from('properties')
              .update({ ...updates, updated_at: new Date().toISOString() })
              .eq('id', resourceId);
            break;

          case 'negotiation':
            updateQuery = supabase
              .from('negotiations')
              .update({ ...updates, updated_at: new Date().toISOString() })
              .eq('id', resourceId);
            break;

          default:
            throw new Error(`Update not supported for resource type: ${resourceType}`);
        }

        const { error: updateError } = await updateQuery;

        if (updateError) throw updateError;

        toast.success(`${resourceType} actualizado exitosamente`);
        await fetchResource();
        return true;
      } catch (err: any) {
        const errorMessage = err.message || `Error al actualizar ${resourceType}`;
        toast.error(errorMessage);
        console.error(`Error updating ${resourceType}:`, err);
        return false;
      }
    },
    [resourceType, resourceId, fetchResource]
  );

  useEffect(() => {
    fetchResource();
  }, [fetchResource]);

  return {
    data,
    loading,
    error,
    refresh: fetchResource,
    update,
  };
}

