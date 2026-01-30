import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface UseDocumentSaverOptions {
  negotiationId: string;
  savedDocumentId: string | null;
  canEdit: boolean;
  onDocumentSaved: (documentId: string, lastSaved: Date) => void;
}

export function useDocumentSaver({
  negotiationId,
  savedDocumentId,
  canEdit,
  onDocumentSaved
}: UseDocumentSaverOptions) {
  const [isSaving, setIsSaving] = useState(false);

  const saveDocument = useCallback(async (content: any) => {
    if (!canEdit) {
      toast.error('No tienes permisos para guardar este documento');
      return false;
    }

    try {
      setIsSaving(true);
      
      // Actualizar o crear documento
      if (savedDocumentId) {
        const updateData: any = {
          content: content,
          updated_at: new Date().toISOString()
        };
        const { error } = await (supabase
          .from('negotiation_documents') as any)
          .update(updateData)
          .eq('id', savedDocumentId);

        if (error) throw error;
        toast.success('Documento actualizado');
        
        const now = new Date();
        onDocumentSaved(savedDocumentId, now);
        return true;
      } else {
        const { data, error } = await supabase
          .from('negotiation_documents')
          .insert({
            negotiation_id: negotiationId,
            kind: 'promesa',
            content: content as any,
            version: 1,
            status: 'draft'
          } as any)
          .select()
          .single();

        if (error) throw error;
        const doc = data as any;
        const now = new Date();
        onDocumentSaved(doc.id, now);
        toast.success('Documento guardado');
        return true;
      }
    } catch (err: any) {
      console.error('❌ [useDocumentSaver] Error saving:', err);
      toast.error('Error al guardar documento');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [canEdit, savedDocumentId, negotiationId, onDocumentSaved]);

  return {
    saveDocument,
    isSaving
  };
}

