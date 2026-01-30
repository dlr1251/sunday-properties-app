import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProperties } from '../../hooks/useSupabase';
import { PropertyUploadWizardModal } from './PropertyUploadWizardModal';
import { PropertyEditPanel } from './PropertyEditPanel';
import { 
  Home, 
  Plus, 
  Edit, 
  Eye, 
  MapPin, 
  DollarSign, 
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const UserPropertiesView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { properties, loading, error } = useUserProperties(user?.id);
  const [showUploadWizard, setShowUploadWizard] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [showEditPanel, setShowEditPanel] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: any }> = {
      draft: { label: 'Borrador', variant: 'secondary', icon: FileText },
      pending: { label: 'Pendiente', variant: 'outline', icon: AlertCircle },
      published: { label: 'Publicada', variant: 'default', icon: CheckCircle },
      rejected: { label: 'Rechazada', variant: 'destructive', icon: XCircle },
    };
    
    const config = statusConfig[status] || { label: status, variant: 'secondary' as const, icon: AlertCircle };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setShowEditPanel(true);
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  const handlePropertyUpdated = () => {
    setShowEditPanel(false);
    setEditingProperty(null);
    // The properties list will automatically refresh via the hook
  };

  const handleUploadComplete = () => {
    setShowUploadWizard(false);
    // The properties list will automatically refresh via the hook
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Mis Propiedades
                </CardTitle>
                <CardDescription>
                  Gestiona todas tus propiedades publicadas
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowUploadWizard(true)}
                className="bg-[#2dc97b] text-[#150f0f] hover:bg-[#26b36b]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Subir Propiedad
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!properties || properties.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No tienes propiedades registradas
                </h3>
                <p className="text-gray-500 mb-6">
                  Comienza subiendo tu primera propiedad para venderla o arrendarla.
                </p>
                <Button
                  onClick={() => setShowUploadWizard(true)}
                  className="bg-[#2dc97b] text-[#150f0f] hover:bg-[#26b36b]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Subir Primera Propiedad
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((property: any) => (
                  <Card key={property.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      {/* Property Image */}
                      <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Home className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          {getStatusBadge(property.status)}
                        </div>
                      </div>

                      {/* Property Info */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
                            {property.title || 'Sin título'}
                          </h3>
                          <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {property.address || 'Dirección no especificada'}
                            {property.neighborhood && `, ${property.neighborhood}`}
                            {property.city && `, ${property.city}`}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div>
                            <p className="text-xs font-semibold text-gray-700">Precio</p>
                            <p className="text-lg font-bold text-gray-900">
                              {property.price ? formatPrice(property.price) : 'No especificado'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-gray-700">Tipo</p>
                            <p className="text-sm font-semibold text-gray-900 capitalize">
                              {property.property_type || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {property.created_at && (
                          <div className="flex items-center gap-1 text-xs font-medium text-gray-700 pt-2 border-t">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Creada {format(new Date(property.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProperty(property.id)}
                            className="flex-1 font-semibold text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProperty(property)}
                            className="flex-1 font-semibold text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload Wizard Modal */}
      <PropertyUploadWizardModal
        open={showUploadWizard}
        onClose={() => setShowUploadWizard(false)}
        onComplete={handleUploadComplete}
      />

      {/* Edit Panel Modal */}
      {showEditPanel && editingProperty && (
        <PropertyEditPanel
          property={editingProperty}
          open={showEditPanel}
          onOpenChange={setShowEditPanel}
          onPropertyUpdated={handlePropertyUpdated}
        />
      )}
    </>
  );
};

