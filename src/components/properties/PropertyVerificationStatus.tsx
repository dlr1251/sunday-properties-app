import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { usePropertyVerifications } from '../../hooks/properties/usePropertyVerifications';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'En Revisión',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    bgColor: 'bg-yellow-50'
  },
  approved: {
    icon: CheckCircle,
    label: 'Aprobada',
    color: 'bg-green-100 text-green-800 border-green-200',
    bgColor: 'bg-green-50'
  },
  rejected: {
    icon: XCircle,
    label: 'Rechazada',
    color: 'bg-red-100 text-red-800 border-red-200',
    bgColor: 'bg-red-50'
  },
  requires_changes: {
    icon: AlertCircle,
    label: 'Requiere Cambios',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    bgColor: 'bg-orange-50'
  }
};

export const PropertyVerificationStatus: React.FC = () => {
  const { verifications, loading, error } = usePropertyVerifications();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">{error}</div>
      </Card>
    );
  }

  if (verifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Mis Publicaciones en Revisión
      </h3>
      <div className="grid gap-4">
        {verifications.map((verification) => {
          const config = statusConfig[verification.status];
          const Icon = config.icon;

          return (
            <Card key={verification.id} className={`p-4 ${config.bgColor} border`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-5 w-5 text-gray-700" />
                    <h4 className="font-medium text-gray-900">
                      {verification.property?.title || 'Sin título'}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {verification.property?.address}
                  </p>
                  <Badge className={config.color}>
                    {config.label}
                  </Badge>
                  
                  {verification.rejection_reason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-800 mb-1">
                        Razón de rechazo:
                      </p>
                      <p className="text-sm text-red-700">{verification.rejection_reason}</p>
                    </div>
                  )}
                  
                  {verification.changes_requested && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm font-medium text-orange-800 mb-1">
                        Cambios solicitados:
                      </p>
                      <p className="text-sm text-orange-700">{verification.changes_requested}</p>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {format(new Date(verification.submitted_at), 'PPP', { locale: es })}
                  </p>
                  {verification.visit_availability_configured && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Visitas Configuradas
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

