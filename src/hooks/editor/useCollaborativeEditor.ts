import { useMemo, useCallback, useRef } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import * as Y from 'yjs';
import { useAuth } from '../../contexts/AuthContext';

interface UseCollaborativeEditorOptions {
  ydoc: Y.Doc;
  provider: any;
  isEditing: boolean;
  canEdit: boolean;
  documentContent: string | null;
  hasTipTapContent: boolean;
  savedDocumentId: string | null;
  onUpdate: (editor: any) => void;
  loadTipTapContentFromDB: (editor: any) => Promise<void>;
  textToTipTapJSON: (text: string) => any;
}

export function useCollaborativeEditor({
  ydoc,
  provider,
  isEditing,
  canEdit,
  documentContent,
  hasTipTapContent,
  savedDocumentId,
  onUpdate,
  loadTipTapContentFromDB,
  textToTipTapJSON
}: UseCollaborativeEditorOptions) {
  const { user, profile } = useAuth();

  // Stable refs to avoid re-renders
  const isEditingRef = useRef(isEditing);
  const canEditRef = useRef(canEdit);
  const documentContentRef = useRef(documentContent);
  const hasTipTapContentRef = useRef(hasTipTapContent);
  const savedDocumentIdRef = useRef(savedDocumentId);
  const userRef = useRef(user);
  const profileRef = useRef(profile);

  // Update refs when values change (but don't trigger re-renders)
  isEditingRef.current = isEditing;
  canEditRef.current = canEdit;
  documentContentRef.current = documentContent;
  hasTipTapContentRef.current = hasTipTapContent;
  savedDocumentIdRef.current = savedDocumentId;
  userRef.current = user;
  profileRef.current = profile;

  // Generar color único para cada usuario
  const getColorForUser = useCallback((userId: string) => {
    const colors = [
      '#1d4ed8', // azul
      '#dc2626', // rojo
      '#059669', // verde
      '#d97706', // naranja
      '#7c3aed', // morado
      '#db2777', // rosa
      '#0891b2', // cyan
      '#65a30d'  // lime
    ];
    // Generar un índice basado en el hash del userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, []);

  // Stable callback functions
  const handleCreate = useCallback(({ editor }: any) => {
    console.log('✏️ [useCollaborativeEditor] Tiptap editor created');

    // Cargar contenido cuando se crea el editor
    if (isEditingRef.current) {
      // Si hay TipTap JSON guardado, cargarlo directamente
      if (hasTipTapContentRef.current && savedDocumentIdRef.current) {
        loadTipTapContentFromDB(editor).catch(console.error);
      } else if (documentContentRef.current) {
        // Si es texto plano, convertirlo
        const jsonContent = textToTipTapJSON(documentContentRef.current);
        editor.commands.setContent(jsonContent);
        console.log('📄 [useCollaborativeEditor] Plain text content loaded into editor');
      }
    }
  }, [loadTipTapContentFromDB, textToTipTapJSON]);

  const handleUpdate = useCallback(({ editor }: any) => {
    onUpdate(editor);
  }, [onUpdate]);

  const handleFocus = useCallback(() => {
    console.log('🎯 [useCollaborativeEditor] Editor focused');
  }, []);

  const handleBlur = useCallback(() => {
    console.log('👁️ [useCollaborativeEditor] Editor blurred');
  }, []);

  // Memoized extensions to prevent re-creation
  const extensions = useMemo(() => [
    StarterKit.configure({
      history: false
    }),
    Underline,
    Typography,
    Placeholder.configure({
      placeholder: 'Escribe el contenido del contrato aquí...'
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph']
    }),
    Collaboration.configure({ document: ydoc }),
    ...(provider ? [CollaborationCursor.configure({
      provider,
      user: {
        name: profileRef.current?.full_name || userRef.current?.email || 'Usuario',
        color: getColorForUser(userRef.current?.id || 'default')
      }
    })] : [])
  ], [ydoc, provider, getColorForUser]); // Removed profile and user from dependencies

  // Memoized initial content
  const initialContent = useMemo(() => {
    return documentContent && isEditing ? textToTipTapJSON(documentContent) : '';
  }, [documentContent, isEditing, textToTipTapJSON]);

  const editor = useEditor({
    extensions,
    content: initialContent,
    editable: isEditing && canEdit,
    onCreate: handleCreate,
    onUpdate: handleUpdate,
    onFocus: handleFocus,
    onBlur: handleBlur
  }, [extensions, initialContent, isEditing, canEdit]); // Stable dependencies

  return editor;
}

