import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useLegalDocs = () => {
  const getSignedUrl = useCallback(async (path: string, expiresIn = 60 * 10) => {
    const { data, error } = await supabase.storage.from('property-docs').createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  }, []);

  const listDocsByType = useCallback(async (ownerId: string, propertyId: string, type: 'clyt' | 'escritura' | 'cedula') => {
    const folder = `${ownerId}/${propertyId}/docs/${type}`;
    const { data, error } = await supabase.storage.from('property-docs').list(folder, { limit: 100 });
    if (error) throw error;
    return data?.map(d => `${folder}/${d.name}`) || [];
  }, []);

  return { getSignedUrl, listDocsByType };
};


