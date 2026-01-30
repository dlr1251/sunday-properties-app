import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface UseAutoSaveOptions {
  enabled: boolean;
  canEdit: boolean;
  savedDocumentId: string | null;
  onSave?: (lastSaved: Date) => void;
}

export function useAutoSave(
  { enabled, canEdit, savedDocumentId, onSave }: UseAutoSaveOptions
) {
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleAutoSave = useCallback(async (editorInstance: any) => {
    if (!editorInstance || !canEdit || !savedDocumentId || !enabled) return;

    try {
      const content = editorInstance.getJSON();
      
      const updateData: any = {
        content: content,
        updated_at: new Date().toISOString()
      };
      const { error } = await (supabase
        .from('negotiation_documents') as any)
        .update(updateData)
        .eq('id', savedDocumentId);

      if (error) throw error;
      
      const now = new Date();
      onSave?.(now);
      console.log('💾 [useAutoSave] Auto-saved');
    } catch (err: any) {
      console.error('❌ [useAutoSave] Error auto-saving:', err);
      // No mostrar toast en auto-save para no interrumpir
    }
  }, [canEdit, savedDocumentId, enabled, onSave]);

  const scheduleAutoSave = useCallback((editorInstance: any, delay: number = 2000) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      handleAutoSave(editorInstance).catch(console.error);
    }, delay);
  }, [handleAutoSave]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  return {
    scheduleAutoSave,
    handleAutoSave
  };
}

