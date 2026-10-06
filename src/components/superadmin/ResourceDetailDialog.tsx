import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const getTitle = () => {
    switch (resourceType) {
      case 'user':
        return t('admin.userDetails');
      case 'property':
        return t('admin.propertyDetails');
      case 'negotiation':
        return t('admin.negotiationDetails');
      case 'document':
        return t('admin.documentDetails');
      default:
        return t('admin.resourceDetails');
    }
  };

  const renderContent = () => {
    if (!resourceId) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t('admin.noResourceSelected')}</p>
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
            <p>{t('admin.unsupportedResource')}</p>
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
            {t('admin.resourceDialogDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
