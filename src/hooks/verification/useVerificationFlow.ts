import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { storageService } from '../../services/storageService';

export interface VerificationData {
  phone: string;
  location: string;
  date_of_birth: string;
  nationality: string;
  is_owner: boolean;
  has_poa: boolean;
  // Discovery questions
  how_did_you_find_us?: string;
  what_do_you_want_to_do?: string[];
  selfie_path?: string;
  id_doc_path?: string;
  poa_doc_path?: string;
}

export const useVerificationFlow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File | string, type: 'selfie' | 'id_doc' | 'poa_doc') => {
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Error de autenticación');
      }
      if (!userData.user) {
        throw new Error('Usuario no autenticado');
      }

      let fileToUpload: File;
      let fileName: string;

      if (typeof file === 'string') {
        // Handle base64 string (from camera capture)
        console.log('Processing base64 string...');
        const response = await fetch(file);
        if (!response.ok) {
          throw new Error('Error procesando imagen base64');
        }
        const blob = await response.blob();
        fileName = `${type}_${Date.now()}.jpg`;
        fileToUpload = new File([blob], fileName, { type: 'image/jpeg' });
      } else {
        // Handle File object (from file upload)
        console.log('Processing file object:', file.name, file.type, file.size);
        fileToUpload = file;
        fileName = file.name;
      }

      const path = `${userData.user.id}/verification/${type}/${Date.now()}_${fileName}`;

      console.log(`Uploading file to: ${path}`);
      console.log('File details:', {
        name: fileName,
        type: fileToUpload.type,
        size: fileToUpload.size
      });

      // Use storage service to handle bucket initialization and upload
      const { data, error } = await storageService.uploadFile(fileToUpload, 'profile-docs', path);

      if (error) {
        console.error('Upload error:', error);

        // Try direct upload to Supabase storage as fallback
        console.log('Trying direct Supabase upload as fallback...');
        const { data: directData, error: directError } = await supabase.storage
          .from('profile-docs')
          .upload(path, fileToUpload, {
            cacheControl: '3600',
            upsert: true,
            contentType: fileToUpload.type,
          });

        if (directError) {
          console.error('Direct upload also failed:', directError);
          throw new Error(`Error subiendo archivo: ${directError.message}`);
        }

        console.log(`File uploaded successfully via direct upload:`, directData);
        return path;
      }

      console.log(`File uploaded successfully:`, data);
      return path;
    } catch (error: any) {
      console.error('Upload file error:', error);
      throw error;
    }
  }, []);

  const getSignedUrl = useCallback(async (path: string, expiresIn = 60 * 10) => {
    const { data, error } = await supabase.storage.from('profile-docs').createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  }, []);

  const submitVerificationRequest = useCallback(async (data: VerificationData) => {
    setLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Update profile with personal data
      await supabase
        .from('profiles')
        .update({
          phone: data.phone,
          location: data.location,
          bio: data.bio,
          date_of_birth: data.date_of_birth,
          nationality: data.nationality,
        })
        .eq('id', userData.user.id);

      // Create verification request
      const { data: request, error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: userData.user.id,
          status: 'pending',
          phone: data.phone,
          location: data.location,
          dob: data.date_of_birth,
          nationality: data.nationality,
          selfie_url: data.selfie_path,
          id_doc_url: data.id_doc_path,
          is_owner: data.is_owner,
          has_poa: data.has_poa,
          poa_doc_url: data.poa_doc_path,
        })
        .select()
        .single();

      if (error) throw error;

      return { id: request.id };

    } catch (e: any) {
      setError(e.message || 'Failed to submit verification');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkVerificationStatus = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      const { data, error } = await supabase
        .from('verification_requests')
        .select('status, reviewed_at, notes')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (e: any) {
      console.error('Error checking verification status:', e);
      return null;
    }
  }, []);

  const fetchVerificationRequest = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (e: any) {
      console.error('Error fetching verification request:', e);
      return null;
    }
  }, []);

  const updateVerificationRequest = useCallback(async (requestId: string, data: VerificationData) => {
    setLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Update profile with personal data
      await supabase
        .from('profiles')
        .update({
          phone: data.phone,
          location: data.location,
          bio: data.bio,
          date_of_birth: data.date_of_birth,
          nationality: data.nationality,
        })
        .eq('id', userData.user.id);

      // Update verification request
      const { data: request, error } = await supabase
        .from('verification_requests')
        .update({
          status: 'pending',
          data: {
            phone: data.phone,
            location: data.location,
            date_of_birth: data.date_of_birth,
            nationality: data.nationality,
            how_did_you_find_us: data.how_did_you_find_us,
            what_do_you_want_to_do: data.what_do_you_want_to_do,
          },
          selfie_path: data.selfie_path,
          id_doc_path: data.id_doc_path,
          is_owner: data.is_owner,
          has_poa: data.has_poa,
          poa_doc_path: data.poa_doc_path,
          notes: null, // Clear previous rejection notes
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;

      return { id: request.id };

    } catch (e: any) {
      setError(e.message || 'Failed to update verification');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    uploadFile,
    getSignedUrl,
    submitVerificationRequest,
    checkVerificationStatus,
    fetchVerificationRequest,
    updateVerificationRequest,
  };
};
