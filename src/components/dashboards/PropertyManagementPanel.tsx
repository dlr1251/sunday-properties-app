import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Search,
  Filter,
  MoreHorizontal,
  Home,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';
import { useAdminProperties } from '../../hooks/admin/useAdminProperties';
import { formatCurrency, formatDate } from '../../utils/format';
import { toast } from 'sonner';

interface PropertyManagementPanelProps {
  onViewProperty?: (propertyId: string) => void;
}

export function PropertyManagementPanel({
  onViewProperty }: PropertyManagementPanelProps) {
    const { t } = useTranslation();
  const {
    properties,
    loading,
    error,
    totalCount,
    fetchProperties,
    approveProperty,
    rejectProperty,
    unpublishProperty,
    deleteProperty,
    bulkApprove
  } = useAdminProperties();

  const [filters, setFilters] = useState({
    status: 'all',
    property_type: 'all',
    city: '',
    search: ''
  });
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentPropertyId, setCurrentPropertyId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties(filters, currentPage);
  }, [filters, currentPage]);

  const handleApprove = async (propertyId: string) => {
    setActionLoading(propertyId);
    const result = await approveProperty(propertyId);
    if (result.success) {
      toast.success(t('admin.propertyApproved'));
    } else {
      toast.error(result.error || t('admin.approvePropertyError'));
    }
    setActionLoading(null);
  };

  const handleReject = async () => {
    if (!currentPropertyId || !rejectionReason.trim()) return;

    setActionLoading(currentPropertyId);
    const result = await rejectProperty(currentPropertyId, rejectionReason);
    if (result.success) {
      toast.success(t('admin.propertyRejected'));
      setShowRejectDialog(false);
      setRejectionReason('');
      setCurrentPropertyId(null);
    } else {
      toast.error(result.error || t('admin.rejectPropertyError'));
    }
    setActionLoading(null);
  };

  const handleUnpublish = async (propertyId: string) => {
    setActionLoading(propertyId);
    const result = await unpublishProperty(propertyId);
    if (result.success) {
      toast.success(t('admin.propertyUnpublished'));
    } else {
      toast.error(result.error || t('admin.unpublishError'));
    }
    setActionLoading(null);
  };

  const handleDelete = async () => {
    if (!currentPropertyId) return;

    setActionLoading(currentPropertyId);
    const result = await deleteProperty(currentPropertyId);
    if (result.success) {
      toast.success(t('admin.propertyRemoved'));
      setShowDeleteDialog(false);
      setCurrentPropertyId(null);
    } else {
      toast.error(result.error || t('admin.deletePropertyToastError'));
    }
    setActionLoading(null);
  };

  const handleBulkApprove = async () => {
    if (selectedProperties.length === 0) {
      toast.error(t('admin.selectAtLeastOne'));
      return;
    }

    const result = await bulkApprove(selectedProperties);
    if (result.success) {
      toast.success(t('admin.bulkApproved', { count: selectedProperties.length }));
      setSelectedProperties([]);
    } else {
      toast.error(result.error || t('admin.bulkApproveError'));
    }
  };

  const exportProperties = () => {
    const csvData = properties.map(prop => ({
      ID: prop.id,
      [t('admin.recordTitle')]: prop.title,
      [t('admin.address')]: prop.address,
      [t('admin.city')]: prop.city,
      [t('lawyer.price').replace(/:$/, '')]: prop.price,
      [t('admin.reviewStatus')]: prop.status,
      [t('admin.propertyType')]: prop.property_type,
      [t('admin.areaM2')]: prop.area,
      [t('properties.bedrooms')]: prop.bedrooms,
      [t('properties.bathrooms')]: prop.bathrooms,
      [t('admin.owner')]: prop.owner_name,
      Email: prop.owner_email,
      [t('admin.createdAt')]: formatDate(prop.created_at),
      [t('admin.images')]: prop.images_count
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `propiedades_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success(t('admin.fileExported'));
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      sold: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-200 text-red-900'
    };
    return colors[status] || colors.draft;
  };

  const getStatusLabel = (status: string) => {
    return t(`admin.status.${status}`, { defaultValue: status });
  };

  const getPropertyTypeLabel = (type: string) => {
    return t(`properties.types.${type}`, { defaultValue: type });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('admin.propertiesManagement')}</h2>
          <p className="text-muted-foreground">
            Administrar aprobación, publicación y eliminación de propiedades
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchProperties(filters, currentPage)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" onClick={exportProperties}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProperties.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedProperties.length} propiedad{selectedProperties.length !== 1 ? 'es' : ''} seleccionada{selectedProperties.length !== 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedProperties([])}>
                  Limpiar selección
                </Button>
                <Button onClick={handleBulkApprove} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('admin.approveSelected')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">{t('common.search')}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Título, dirección..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>{t('admin.reviewStatus')}</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="pending">{t('admin.status.pending')}</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="sold">Vendido</SelectItem>
                  <SelectItem value="rejected">{t('admin.rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('admin.propertyType')}</Label>
              <Select value={filters.property_type} onValueChange={(value) => setFilters(prev => ({ ...prev, property_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                  <SelectItem value="house">Casa</SelectItem>
                  <SelectItem value="townhouse">Casa de pueblo</SelectItem>
                  <SelectItem value="office">Oficina</SelectItem>
                  <SelectItem value="commercial">Comercial</SelectItem>
                  <SelectItem value="land">Terreno</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                placeholder="Ciudad"
                value={filters.city}
                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    status: 'all',
                    property_type: 'all',
                    city: '',
                    search: ''
                  });
                  setCurrentPage(1);
                }}
                className="w-full"
              >
                {t('common.clearFilters')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.properties')} ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8">
              <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron propiedades</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedProperties.length === properties.length && properties.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProperties(properties.map(p => p.id));
                          } else {
                            setSelectedProperties([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>{t('visits.property')}</TableHead>
                    <TableHead>Propietario</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>{t('admin.reviewStatus')}</TableHead>
                    <TableHead>{t('lawyer.details')}</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProperties.includes(property.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProperties(prev => [...prev, property.id]);
                            } else {
                              setSelectedProperties(prev => prev.filter(id => id !== property.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{property.title}</p>
                          <p className="text-sm text-muted-foreground">{property.address}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <ImageIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{property.images_count} fotos</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{property.owner_name}</p>
                          <p className="text-sm text-muted-foreground">{property.owner_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(property.price)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(property.status)}>
                          {getStatusLabel(property.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{getPropertyTypeLabel(property.property_type)}</p>
                          <p className="text-muted-foreground">
                            {property.area}m² • {property.bedrooms}hab • {property.bathrooms}bañ
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(property.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewProperty?.(property.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {property.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(property.id)}
                                disabled={actionLoading === property.id}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCurrentPropertyId(property.id);
                                  setShowRejectDialog(true);
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          {property.status === 'published' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnpublish(property.id)}
                              disabled={actionLoading === property.id}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              Despublicar
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCurrentPropertyId(property.id);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalCount > 20 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * 20) + 1} a {Math.min(currentPage * 20, totalCount)} de {totalCount} propiedades
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage * 20 >= totalCount}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Reject Property Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.rejectProperty')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Razón del rechazo *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Explica por qué se rechaza esta propiedad..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-sm text-yellow-800">
                El propietario recibirá una notificación con esta razón y podrá corregir y volver a enviar la propiedad.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || actionLoading === currentPropertyId}
            >
              {actionLoading === currentPropertyId ? t('admin.rejecting') : t('admin.rejectProperty')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Property Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar propiedad?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Esta acción eliminará permanentemente la propiedad y todos sus datos asociados (imágenes, ofertas, visitas).
              Esta acción no se puede deshacer.
            </p>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-800">
                ⚠️ Asegúrese de que la propiedad no tenga negociaciones activas o contratos firmados.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading === currentPropertyId}
            >
              {actionLoading === currentPropertyId ? t('profile.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PropertyManagementPanel;
