import React from 'react';
import { Button } from '../ui/button';
import { Edit2, Save, X, Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';

interface EditorHeaderProps {
  isEditing: boolean;
  canEdit: boolean;
  isSaving: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  lastSaved: Date | null;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  isEditing,
  canEdit,
  isSaving,
  connectionStatus,
  lastSaved,
  onEdit,
  onCancel,
  onSave
}) => {
  return (
    <header className="px-4 lg:px-6 py-3 border-b border-gray-200 flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Contrato de Promesa de Compraventa</h2>
          {isEditing && (
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' ? (
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <Wifi className="w-3 h-3" />
                  <span>Conectado</span>
                </div>
              ) : connectionStatus === 'connecting' ? (
                <div className="flex items-center gap-1 text-yellow-600 text-xs">
                  <WifiOff className="w-3 h-3 animate-pulse" />
                  <span>Conectando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <WifiOff className="w-3 h-3" />
                  <span>Desconectado</span>
                </div>
              )}
              {lastSaved && (
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <Cloud className="w-3 h-3" />
                  <span>Guardado {lastSaved.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
              {isSaving && (
                <div className="flex items-center gap-1 text-blue-600 text-xs">
                  <CloudOff className="w-3 h-3 animate-pulse" />
                  <span>Guardando...</span>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {isEditing 
            ? 'Editor colaborativo activo - Los cambios se sincronizan en tiempo real'
            : 'Documento generado por IA - Haz clic en Editar para modificarlo'}
        </p>
      </div>
      {!isEditing ? (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            disabled={!canEdit}
            className="text-gray-800 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={!canEdit || isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </>
            )}
          </Button>
        </div>
      )}
    </header>
  );
};

