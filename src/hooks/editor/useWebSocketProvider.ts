import { useMemo } from 'react';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { toast } from 'sonner';

interface UseWebSocketProviderOptions {
  wsUrl: string;
  docKey: string;
  ydoc: Y.Doc;
  enableWebSocket: boolean;
  isEditing: boolean;
  onConnectionStatusChange: (status: 'disconnected' | 'connecting' | 'connected') => void;
}

export function useWebSocketProvider({
  wsUrl,
  docKey,
  ydoc,
  enableWebSocket,
  isEditing,
  onConnectionStatusChange
}: UseWebSocketProviderOptions) {
  const provider = useMemo(() => {
    if (!enableWebSocket || !isEditing) {
      console.log('🚫 [useWebSocketProvider] WebSocket disabled or not editing, skipping provider creation');
      return null;
    }

    console.log('🔌 [useWebSocketProvider] Creating WebSocket provider for:', docKey);
    const prov = new WebsocketProvider(wsUrl, docKey, ydoc, { connect: true });

    // Add event listeners for debugging
    // Note: We don't include onConnectionStatusChange in dependencies to avoid re-creation loops
    const handleStatus = (event: any) => {
      console.log('📊 [useWebSocketProvider] WebSocket status:', event.status);
      if (event.status === 'connecting') {
        onConnectionStatusChange('connecting');
      } else if (event.status === 'connected') {
        onConnectionStatusChange('connected');
      } else if (event.status === 'disconnected') {
        onConnectionStatusChange('disconnected');
      }
    };

    const handleConnectionError = (event: any) => {
      console.error('❌ [useWebSocketProvider] WebSocket connection error:', event);
      toast.error('Error de conexión con el servidor colaborativo');
      onConnectionStatusChange('disconnected');
    };

    const handleConnected = () => {
      console.log('🔗 [useWebSocketProvider] WebSocket connected successfully');
      onConnectionStatusChange('connected');
      toast.success('Editor colaborativo conectado');
    };

    const handleDisconnected = () => {
      console.log('🔌 [useWebSocketProvider] WebSocket disconnected');
      onConnectionStatusChange('disconnected');
      toast.info('Editor colaborativo desconectado');
    };

    prov.on('status', handleStatus);
    prov.on('connection-error', handleConnectionError);
    (prov as any).on('connected', handleConnected);
    (prov as any).on('disconnected', handleDisconnected);

    console.log('✅ [useWebSocketProvider] WebSocket provider created with event listeners');
    return prov;
  }, [wsUrl, docKey, ydoc, enableWebSocket, isEditing]); // Removed onConnectionStatusChange

  return provider;
}

