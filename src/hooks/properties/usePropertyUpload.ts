import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface NegotiationTerms {
  min_offer_price?: number;
  max_closing_days?: number;
  required_payment_methods?: string[];
  auto_reject_enabled?: boolean;
  manual_review_threshold?: boolean;
  special_conditions?: string[];
}

export const usePropertyUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDraftProperty = useCallback(async (fields: any) => {
    setLoading(true);
    setError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const insert = {
        owner_id: userData.user.id,
        status: 'draft',
        ...fields,
      };

      const { data, error } = await supabase
        .from('properties')
        .insert(insert)
        .select('id')
        .single();

      if (error) throw error;
      return { id: data.id } as { id: string };
    } catch (e: any) {
      setError(e.message || 'Failed to create draft');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePropertyFields = useCallback(async (propertyId: string, fields: any) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('properties')
        .update(fields)
        .eq('id', propertyId);
      if (error) throw error;
    } catch (e: any) {
      setError(e.message || 'Failed to update property');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadImage = useCallback(async (propertyId: string, file: File) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const path = `${userData.user.id}/${propertyId}/images/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('property-images').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;
    const { data: publicUrl } = supabase.storage.from('property-images').getPublicUrl(path);
    return { path, url: publicUrl.publicUrl };
  }, []);

  const deleteImage = useCallback(async (path: string) => {
    const { error } = await supabase.storage.from('property-images').remove([path]);
    if (error) throw error;
  }, []);

  const uploadDoc = useCallback(async (propertyId: string, file: File, type: 'clyt' | 'escritura' | 'cedula') => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');
    const path = `${userData.user.id}/${propertyId}/docs/${type}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('property-docs').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });
    if (error) throw error;
    return { path };
  }, []);

  const getSignedDocUrl = useCallback(async (path: string, expiresIn = 60 * 10) => {
    const { data, error } = await supabase.storage.from('property-docs').createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  }, []);

  const submitForReview = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      // If data is just a propertyId string, use it directly
      // Otherwise, data is an object with propertyData, uploadedDocs, etc.
      const propertyId = typeof data === 'string' ? data : data.propertyId;
      
      if (!propertyId) throw new Error('Property ID is required');

      // Update property status to pending (for review)
      const { error } = await supabase
        .from('properties')
        .update({ status: 'pending' })
        .eq('id', propertyId);
        
      if (error) throw error;
    } catch (e: any) {
      setError(e.message || 'Failed to submit for review');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createDraftProperty,
    updatePropertyFields,
    uploadImage,
    deleteImage,
    uploadDoc,
    getSignedDocUrl,
    submitForReview,
  };
};


