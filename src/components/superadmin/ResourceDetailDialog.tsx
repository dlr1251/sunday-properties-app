import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { ResourceType } from '../../../hooks/superadmin/useResourceDetail';
import { UserDetailView } from './views/UserDetailView';
import { PropertyDetailView } from './views/PropertyDetailView';
import { NegotiationDetailView } from './views/NegotiationDetailView';
import { DocumentDetailView } from './views/DocumentDetailView';

interface ResourceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: ResourceType;
  resourceId: string | null;
  onUpdate?: () => void;
}

export function ResourceDetailDialog({
  open,
  onOpenChange,
  resourceType,
  resourceId,
  onUpdate,
}: ResourceDetailDialogProps) {
  const getTitle = () => {
    switch (resourceType) {
      case 'user':
        return 'Detalles del Usuario';
      case 'property':
        return 'Detalles de la Propiedad';
      case 'negotiation':
        return 'Detalles de la Negociación';
      case 'document':
        return 'Detalles del Documento';
      default:
        return 'Detalles del Recurso';
    }
  };

  const renderContent = () => {
    if (!resourceId) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No se ha seleccionado ningún recurso</p>
        </div>
      );
    }

    switch (resourceType) {
      case 'user':
        return <UserDetailView userId={resourceId} onUpdate={onUpdate} />;
      case 'property':
        return <PropertyDetailView propertyId={resourceId} onUpdate={onUpdate} />;
      case 'negotiation':
        return <NegotiationDetailView negotiationId={resourceId} onUpdate={onUpdate} />;
      case 'document':
        return <DocumentDetailView documentId={resourceId} onUpdate={onUpdate} />;
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <p>Tipo de recurso no soportado</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            Visualiza y edita toda la información del recurso seleccionado
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

