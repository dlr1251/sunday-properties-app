import React, { useEffect, useMemo, useState } from 'react';
import { EditorContent } from '@tiptap/react';
import * as Y from 'yjs';
import { useNegotiationPermissions } from '../../hooks/useNegotiationPermissions';
import { toast } from 'sonner';
import { Toolbar } from './Toolbar';
import { EditorHeader } from './EditorHeader';
import { EditorReadOnlyView } from './EditorReadOnlyView';
import { EditorStyles } from './EditorStyles';
import { useDocumentLoader } from '../../hooks/editor/useDocumentLoader';
import { useWebSocketProvider } from '../../hooks/editor/useWebSocketProvider';
import { useCollaborativeEditor } from '../../hooks/editor/useCollaborativeEditor';
import { useAutoSave } from '../../hooks/editor/useAutoSave';
import { useDocumentSaver } from '../../hooks/editor/useDocumentSaver';
import { useDocumentContent } from '../../hooks/editor/useDocumentContent';
import { textToTipTapJSON } from '../../utils/tipTapHelpers';

export type CollaborativeEditorProps = {
  negotiationId: string;
  docKey: string;
  className?: string;
  initialContent?: string; // Contenido generado por Grok (texto plano)
};

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ 
  negotiationId, 
  docKey, 
  className,
  initialContent 
}) => {
  console.log('📝 [CollaborativeEditor] Initializing for negotiation:', negotiationId, 'docKey:', docKey);

  const { canEdit } = useNegotiationPermissions(negotiationId);
  const [isEditing, setIsEditing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Cargar documento existente
  const {
    documentContent,
    savedDocumentId,
    hasTipTapContent,
    loading
  } = useDocumentLoader(negotiationId, initialContent);

  // Estado local para el documento guardado (puede cambiar cuando se guarda)
  const [localSavedDocumentId, setLocalSavedDocumentId] = useState<string | null>(savedDocumentId);
  const [localHasTipTapContent, setLocalHasTipTapContent] = useState(hasTipTapContent);

  // Sincronizar cuando se carga el documento
  useEffect(() => {
    setLocalSavedDocumentId(savedDocumentId);
    setLocalHasTipTapContent(hasTipTapContent);
  }, [savedDocumentId, hasTipTapContent]);

  // Crear Y.Doc
  const ydoc = useMemo(() => {
    console.log('📄 [CollaborativeEditor] Creating new Y.Doc for docKey:', docKey);
    return new Y.Doc();
  }, [docKey]);

  // Configurar WebSocket
  const wsUrl = (import.meta as any).env?.VITE_YJS_WS_URL || 'ws://localhost:1234';
  const enableWebSocket = (import.meta as any).env?.VITE_ENABLE_YJS_WEBSOCKET !== 'false';
  console.log('🌐 [CollaborativeEditor] WebSocket URL:', wsUrl, 'Enabled:', enableWebSocket);

  // WebSocket provider
  const provider = useWebSocketProvider({
    wsUrl,
    docKey,
    ydoc,
    enableWebSocket,
    isEditing,
    onConnectionStatusChange: setConnectionStatus
  });

  // Cargar contenido TipTap desde DB
  const { loadTipTapContentFromDB } = useDocumentContent(localSavedDocumentId);

  // Auto-guardado
  const { scheduleAutoSave } = useAutoSave({
    enabled: isEditing,
    canEdit,
    savedDocumentId: localSavedDocumentId,
    onSave: setLastSaved
  });

  // Guardar documento
  const { saveDocument, isSaving } = useDocumentSaver({
    negotiationId,
    savedDocumentId: localSavedDocumentId,
    canEdit,
    onDocumentSaved: (docId, savedDate) => {
      setLocalSavedDocumentId(docId);
      setLocalHasTipTapContent(true);
      setLastSaved(savedDate);
    }
  });

  // Editor TipTap
  const editor = useCollaborativeEditor({
    ydoc,
    provider,
    isEditing,
    canEdit,
    documentContent,
    hasTipTapContent: localHasTipTapContent,
    savedDocumentId: localSavedDocumentId,
    onUpdate: (editorInstance) => {
      console.log('📝 [CollaborativeEditor] Editor content updated');
      scheduleAutoSave(editorInstance);
    },
    loadTipTapContentFromDB,
    textToTipTapJSON
  });

  // Cargar contenido cuando se activa el modo edición
  useEffect(() => {
    if (editor && isEditing) {
      if (localHasTipTapContent && localSavedDocumentId) {
        // Cargar contenido TipTap JSON desde DB
        loadTipTapContentFromDB(editor).catch(console.error);
      } else if (documentContent) {
        // Convertir texto plano a TipTap JSON
        const jsonContent = textToTipTapJSON(documentContent);
        editor.commands.setContent(jsonContent);
        console.log('📄 [CollaborativeEditor] Plain text content loaded after entering edit mode');
      }
    }
  }, [editor, isEditing, documentContent, localHasTipTapContent, localSavedDocumentId, loadTipTapContentFromDB]);

  // Cleanup WebSocket y Y.Doc
  useEffect(() => {
    return () => {
      console.log('🧹 [CollaborativeEditor] Cleaning up WebSocket provider and Y.Doc');
      try {
        if (provider) {
          provider.destroy();
          console.log('✅ [CollaborativeEditor] WebSocket provider destroyed');
        }
      } catch (err) {
        console.error('❌ [CollaborativeEditor] Error destroying WebSocket provider:', err);
      }
      try {
        ydoc.destroy();
        console.log('✅ [CollaborativeEditor] Y.Doc destroyed');
      } catch (err) {
        console.error('❌ [CollaborativeEditor] Error destroying Y.Doc:', err);
      }
    };
  }, [provider, ydoc]);

  // Handlers
  const handleEdit = () => {
    if (!canEdit) {
      toast.error('No tienes permisos para editar este documento');
      return;
    }
    setIsEditing(true);
    toast.info('Modo edición activado');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Recargar contenido original si es necesario
    if (editor && documentContent) {
      const jsonContent = textToTipTapJSON(documentContent);
      editor.commands.setContent(jsonContent);
    }
    toast.info('Edición cancelada');
  };

  const handleSave = async () => {
    if (!editor) return;
    const content = editor.getJSON();
    await saveDocument(content);
  };

  // Loading state
  if (loading) {
    return (
      <section className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className ?? ''}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando documento...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className ?? ''}`}>
      <EditorHeader
        isEditing={isEditing}
        canEdit={canEdit}
        isSaving={isSaving}
        connectionStatus={connectionStatus}
        lastSaved={lastSaved}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onSave={handleSave}
      />
      <div className="p-4 lg:p-6">
        {!isEditing && documentContent ? (
          <EditorReadOnlyView content={documentContent} />
        ) : (
          <div className="border border-gray-200 rounded-lg min-h-[400px] bg-white overflow-hidden">
            {editor && <Toolbar editor={editor} />}
            <EditorStyles />
            <div className="prose prose-sm max-w-none">
              <EditorContent editor={editor} />
            </div>
            {!editor && (
              <div className="text-center py-8 text-gray-500">
                Inicializando editor...
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CollaborativeEditor;
