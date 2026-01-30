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
      try {
        setLoading(true);
        
        // Buscar documento de promesa existente
        const { data, error } = await supabase
          .from('negotiation_documents')
          .select('*')
          .eq('negotiation_id', negotiationId)
          .eq('kind', 'promesa')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('❌ [useDocumentLoader] Error loading document:', error);
          throw error;
        }

        if (data) {
          const doc = data as any;
          console.log('✅ [useDocumentLoader] Found existing document:', doc.id);
          setSavedDocumentId(doc.id);
          
          // Verificar si es TipTap JSON o texto plano
          if (doc.content && typeof doc.content === 'object' && doc.content.type === 'doc') {
            // Es un documento TipTap JSON
            console.log('📄 [useDocumentLoader] Document has TipTap JSON content');
            setHasTipTapContent(true);
            setDocumentContent(null); // Se cargará directamente en el editor cuando entre en modo edición
          } else if (doc.content && typeof doc.content === 'string') {
            // Es texto plano
            console.log('📄 [useDocumentLoader] Document has plain text content');
            setHasTipTapContent(false);
            setDocumentContent(doc.content);
          } else {
            // Contenido vacío o null
            if (initialContent) {
              setDocumentContent(initialContent);
              setHasTipTapContent(false);
            }
          }
        } else {
          // No hay documento, usar initialContent si existe
          if (initialContent) {
            console.log('📄 [useDocumentLoader] Using provided initial content');
            setDocumentContent(initialContent);
          }
        }
      } catch (err: any) {
        console.error('💥 [useDocumentLoader] Failed to load document:', err);
        toast.error('Error al cargar el documento');
        // Usar initialContent como fallback
        if (initialContent) {
          setDocumentContent(initialContent);
        }
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

