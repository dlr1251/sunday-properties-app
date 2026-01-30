import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Home,
  Building,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  Search,
  Filter,
  AlertCircle,
  Check,
  X,
  Image as ImageIcon,
  Calendar,
  User
} from 'lucide-react';
import { useAdminProperties } from '../../hooks/admin/useAdminProperties';

interface PropertyVerification {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  property_type: 'apartment' | 'house' | 'townhouse' | 'office' | 'commercial';
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: 'draft' | 'pending' | 'published' | 'sold' | 'rented' | 'archived';
  owner_id: string;
  owner?: {
    id: string;
    full_name: string;
    email: string;
  };
  images: string[];
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
  // Computed fields for UI
  location: string;
  owner_name: string;
  owner_email: string;
  documents: string[]; // For now, we'll simulate this
}

export const AdminPropertyVerificationPanel: React.FC = () => {
  const {
    properties,
    loading,
    updatePropertyStatus,
    refreshProperties
  } = useAdminProperties();

  const [selectedProperty, setSelectedProperty] = useState<PropertyVerification | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending_approval');

  useEffect(() => {
    refreshProperties();
  }, [refreshProperties]);

  const handleReview = async (propertyId: string, action: 'approve' | 'reject') => {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      await updatePropertyStatus(propertyId, status, reviewNotes);
      setReviewDialogOpen(false);
      setReviewNotes('');
      setSelectedProperty(null);
      refreshProperties();
    } catch (error) {
      console.error('Error updating property status:', error);
    }
  };

  const openReviewDialog = (property: PropertyVerification, action: 'approve' | 'reject') => {
    setSelectedProperty(property);
    setReviewAction(action);
    setReviewDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'pending': return 'secondary';
      case 'sold': return 'destructive';
      case 'rented': return 'outline';
      case 'archived': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'sold': return <XCircle className="h-4 w-4" />;
      case 'rented': return <AlertCircle className="h-4 w-4" />;
      case 'archived': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Map properties to include computed fields for UI
  const mappedProperties: PropertyVerification[] = properties.map(property => ({
    ...property,
    location: `${property.address}, ${property.city}`,
    owner_name: property.owner?.full_name || 'Usuario',
    owner_email: property.owner?.email || 'usuario@email.com',
    documents: [], // For now, simulate empty documents array
  }));

  const filteredProperties = mappedProperties.filter(property => {
    const matchesSearch = property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.owner_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = properties.filter(p => p.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Home className="h-4 w-4 text-blue-600" />
              Total Propiedades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Aprobadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {properties.filter(p => p.status === 'approved' || p.status === 'published').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Rechazadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {properties.filter(p => p.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Buscar por título, propietario o ubicación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="status">Estado</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="published">Publicadas</SelectItem>
              <SelectItem value="sold">Vendidas</SelectItem>
              <SelectItem value="rented">Alquiladas</SelectItem>
              <SelectItem value="archived">Archivadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Verificación de Propiedades
          </CardTitle>
          <CardDescription>
            Revisa y aprueba las propiedades antes de su publicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Propiedad</th>
                  <th className="text-left p-4 font-medium">Propietario</th>
                  <th className="text-left p-4 font-medium">Precio</th>
                  <th className="text-left p-4 font-medium">Estado</th>
                  <th className="text-left p-4 font-medium">Archivos</th>
                  <th className="text-left p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{property.title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {property.location}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {property.property_type}
                          {property.bedrooms && ` • ${property.bedrooms} hab`}
                          {property.area_sqm && ` • ${property.area_sqm}m²`}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {property.owner_name}
                        </div>
                        <div className="text-sm text-muted-foreground">{property.owner_email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-green-600">
                        {formatPrice(property.price)}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusBadgeVariant(property.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(property.status)}
                        {property.status === 'pending' ? 'Pendiente' :
                         property.status === 'published' ? 'Publicada' :
                         property.status === 'sold' ? 'Vendida' :
                         property.status === 'rented' ? 'Alquilada' :
                         property.status === 'archived' ? 'Archivada' : property.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <ImageIcon className="h-4 w-4" />
                          <span>{property.images?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{property.documents?.length || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedProperty(property)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {property.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => openReviewDialog(property, 'approve')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => openReviewDialog(property, 'reject')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProperties.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron propiedades
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Aprobar Propiedad' : 'Rechazar Propiedad'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve'
                ? 'Confirma que deseas aprobar esta propiedad para publicación.'
                : 'Indica el motivo del rechazo de esta propiedad.'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedProperty && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <div className="font-medium">{selectedProperty.title}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedProperty.owner_name} • {formatPrice(selectedProperty.price)}
                </div>
              </div>

              {reviewAction === 'reject' && (
                <div>
                  <Label htmlFor="notes">Motivo del rechazo</Label>
                  <Textarea
                    id="notes"
                    placeholder="Explica por qué se rechaza esta propiedad..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {reviewAction === 'approve' && (
                <div>
                  <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Comentarios sobre la aprobación..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setReviewDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleReview(selectedProperty.id, reviewAction)}
                  variant={reviewAction === 'approve' ? 'default' : 'destructive'}
                >
                  {reviewAction === 'approve' ? 'Aprobar' : 'Rechazar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Property Details Dialog */}
      <Dialog open={!!selectedProperty && !reviewDialogOpen} onOpenChange={() => setSelectedProperty(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Propiedad</DialogTitle>
            <DialogDescription>
              Información completa de la propiedad para revisión
            </DialogDescription>
          </DialogHeader>

          {selectedProperty && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Título</Label>
                    <p className="text-lg font-medium mt-1">{selectedProperty.title}</p>
                  </div>

                  <div>
                    <Label className="font-medium">Descripción</Label>
                    <p className="text-sm mt-1">{selectedProperty.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Precio</Label>
                      <p className="text-lg font-bold text-green-600 mt-1">
                        {formatPrice(selectedProperty.price)}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Tipo</Label>
                      <p className="text-sm mt-1">{selectedProperty.property_type}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="font-medium">Habitaciones</Label>
                      <p className="text-sm mt-1">{selectedProperty.bedrooms || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Baños</Label>
                      <p className="text-sm mt-1">{selectedProperty.bathrooms || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Área (m²)</Label>
                      <p className="text-sm mt-1">{selectedProperty.area_sqm || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Ubicación</Label>
                    <p className="text-sm mt-1 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedProperty.location}
                    </p>
                  </div>

                  <div>
                    <Label className="font-medium">Propietario</Label>
                    <div className="mt-1">
                      <p className="font-medium">{selectedProperty.owner_name}</p>
                      <p className="text-sm text-muted-foreground">{selectedProperty.owner_email}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium">Estado</Label>
                    <div className="mt-1">
                      <Badge variant={getStatusBadgeVariant(selectedProperty.status)}>
                        {selectedProperty.status === 'pending' ? 'Pendiente' :
                         selectedProperty.status === 'published' ? 'Publicada' :
                         selectedProperty.status === 'sold' ? 'Vendida' :
                         selectedProperty.status === 'rented' ? 'Alquilada' :
                         selectedProperty.status === 'archived' ? 'Archivada' : selectedProperty.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium">Fechas</Label>
                    <div className="mt-1 space-y-1 text-sm">
                      <p>Creada: {new Date(selectedProperty.created_at).toLocaleDateString('es-CO')}</p>
                      <p>Actualizada: {new Date(selectedProperty.updated_at).toLocaleDateString('es-CO')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Images Section */}
              {selectedProperty.images && selectedProperty.images.length > 0 && (
                <div>
                  <Label className="font-medium">Imágenes ({selectedProperty.images.length})</Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedProperty.images.map((image, index) => (
                      <div key={index} className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground ml-2">Imagen {index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents Section */}
              {selectedProperty.documents && selectedProperty.documents.length > 0 && (
                <div>
                  <Label className="font-medium">Documentos ({selectedProperty.documents.length})</Label>
                  <div className="mt-2 space-y-2">
                    {selectedProperty.documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Documento {index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedProperty.rejection_reason && (
                <div>
                  <Label className="font-medium">Motivo de Rechazo</Label>
                  <p className="text-sm mt-1 text-red-600">{selectedProperty.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
