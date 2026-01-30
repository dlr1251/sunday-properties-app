import { useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export function useDocumentContent(savedDocumentId: string | null) {
  const loadTipTapContentFromDB = useCallback(async (editorInstance: any) => {
    if (!savedDocumentId) return;
    
    try {
      const { data, error } = await supabase
        .from('negotiation_documents')
        .select('content')
        .eq('id', savedDocumentId)
        .single();

      if (error) throw error;

      const doc = data as any;
      if (doc?.content && typeof doc.content === 'object' && doc.content.type === 'doc') {
        editorInstance.commands.setContent(doc.content);
        console.log('✅ [useDocumentContent] TipTap JSON content loaded from DB');
      }
    } catch (err: any) {
      console.error('❌ [useDocumentContent] Error loading TipTap content:', err);
    }
  }, [savedDocumentId]);

  return { loadTipTapContentFromDB };
}

