import { supabase } from '../lib/supabase';
import { Result, asUserMessage, logError } from '../lib/error';
import type { VerificationDocument, VerificationData } from '../types/entities';

/**
 * Uploads a file to Supabase Storage for verification.
 * @param file The file to upload.
 * @param path The storage path (e.g., 'documents' or 'selfies').
 * @returns A Result object containing the public URL of the uploaded file.
 */
export async function uploadVerificationFile(
  file: File,
  path: string
): Promise<Result<string>> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(filePath);
    return { ok: true, data: data.publicUrl };
  } catch (e) {
    logError('uploadVerificationFile', e);
    return { ok: false, error: asUserMessage(e, 'Error al subir el archivo') };
  }
}

/**
 * Submits user verification data and documents.
 * @param userId The ID of the user submitting for verification.
 * @param data The verification data, including files and personal info.
 * @returns A Result object indicating success or failure.
 */
export async function submitVerificationService(
  userId: string,
  data: VerificationData
): Promise<Result<null>> {
  try {
    let documentUrl = '';
    let selfieUrl = '';

    if (data.documentFile) {
      const res = await uploadVerificationFile(data.documentFile, 'documents');
      if (!res.ok) return { ok: false, error: res.error };
      documentUrl = res.data;
    }
    if (data.selfieFile) {
      const res = await uploadVerificationFile(data.selfieFile, 'selfies');
      if (!res.ok) return { ok: false, error: res.error };
      selfieUrl = res.data;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        phone: data.phone,
        address: data.address,
        date_of_birth: data.dateOfBirth,
        nationality: data.nationality,
        verification_status: 'pending',
        verification_submitted_at: new Date().toISOString()
      })
      .eq('id', userId);
    if (profileError) throw profileError;

    const { error: docError } = await supabase
      .from('verification_documents')
      .insert({
        user_id: userId,
        document_type: data.documentType,
        document_url: documentUrl,
        selfie_url: selfieUrl,
        status: 'pending'
      });
    if (docError) throw docError;

    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'verification_submitted',
        title: 'Nueva solicitud de verificación',
        message: `${data.fullName} ha enviado documentos para verificación de identidad`,
        related_type: 'verification'
      });

    return { ok: true, data: null };
  } catch (e) {
    logError('submitVerificationService', e);
    return { ok: false, error: asUserMessage(e, 'Error al enviar la verificación') };
  }
}

/**
 * Fetches the current verification status and document for a user.
 * @param userId The ID of the user to check.
 * @returns A Result object with the status and document.
 */
export async function getVerificationStatusService(
  userId: string
): Promise<Result<{ status: string; document: VerificationDocument | null }>> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('verification_status')
      .eq('id', userId)
      .single();

    let document: VerificationDocument | null = null;
    const { data: doc } = await supabase
      .from('verification_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (doc) document = doc as any;

    return { ok: true, data: { status: profile?.verification_status || 'unverified', document } };
  } catch (e) {
    logError('getVerificationStatusService', e);
    return { ok: false, error: asUserMessage(e, 'Error al obtener el estado de verificación') };
  }
}


