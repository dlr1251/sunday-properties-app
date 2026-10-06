import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface UseDocumentLoaderResult {
  documentContent: string | null;
  savedDocumentId: string | null;
  hasTipTapContent: boolean;
  loading: boolean;
}

export function useDocumentLoader(
  negotiationId: string,
  initialContent?: string
): UseDocumentLoaderResult {
  const [documentContent, setDocumentContent] = useState<string | null>(null);
  const [savedDocumentId, setSavedDocumentId] = useState<string | null>(null);
  const [hasTipTapContent, setHasTipTapContent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExistingDocument() {
      if (!negotiationId || typeof negotiationId !== 'string' || negotiationId.trim() === '') {
        setLoading(false);
        if (initialContent) setDocumentContent(initialContent);
        return;
      }

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('negotiation_documents')
          .select('*')
          .eq('negotiation_id', negotiationId)
          .eq('kind', 'promesa')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          // PGRST116 = 0 rows with .single(); maybeSingle() no suele devolver error por 0 filas
          if (error.code === 'PGRST116') {
            if (initialContent) setDocumentContent(initialContent);
            setLoading(false);
            return;
          }
          console.error('❌ [useDocumentLoader] Error loading document:', error.code, error.message, error);
          toast.error(`Error al cargar el documento: ${error.message || error.code || 'consulta fallida'}`);
          if (initialContent) setDocumentContent(initialContent);
          setLoading(false);
          return;
        }

        if (data) {
          const doc = data as any;
          console.log('✅ [useDocumentLoader] Found existing document:', doc.id);
          setSavedDocumentId(doc.id);

          if (doc.content && typeof doc.content === 'object' && doc.content.type === 'doc') {
            setHasTipTapContent(true);
            setDocumentContent(null);
          } else if (doc.content && typeof doc.content === 'string') {
            setHasTipTapContent(false);
            setDocumentContent(doc.content);
          } else {
            if (initialContent) {
              setDocumentContent(initialContent);
              setHasTipTapContent(false);
            }
          }
        } else {
          if (initialContent) {
            console.log('📄 [useDocumentLoader] Using provided initial content');
            setDocumentContent(initialContent);
          }
        }
      } catch (err: any) {
        console.error('💥 [useDocumentLoader] Failed to load document:', err);
        const msg = err?.message || err?.code || 'Error desconocido';
        toast.error(`Error al cargar el documento: ${msg}`);
        if (initialContent) setDocumentContent(initialContent);
      } finally {
        setLoading(false);
      }
    }

    loadExistingDocument();
  }, [negotiationId, initialContent]);

  return {
    documentContent,
    savedDocumentId,
    hasTipTapContent,
    loading
  };
}

