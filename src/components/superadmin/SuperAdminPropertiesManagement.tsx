import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Home, Plus, Search, Edit, Trash2, Eye, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { ResourceDetailDialog } from './ResourceDetailDialog';

export function SuperAdminPropertiesManagement() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:profiles!properties_owner_id_fkey(id, full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      toast.error('Error al cargar propiedades: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('¿Está seguro de eliminar esta propiedad?')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;
      toast.success('Propiedad eliminada exitosamente');
      fetchProperties();
    } catch (error: any) {
      toast.error('Error al eliminar propiedad: ' + error.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      published: { label: 'Publicada', variant: 'default' as const },
      pending: { label: 'Pendiente', variant: 'secondary' as const },
      draft: { label: 'Borrador', variant: 'outline' as const },
      sold: { label: 'Vendida', variant: 'default' as const },
      archived: { label: 'Archivada', variant: 'outline' as const }
    };
    const config = variants[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredProperties = properties.filter(prop =>
    prop.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.owner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Propiedades</h2>
          <p className="text-muted-foreground">
            Crear, editar y gestionar todas las propiedades del sistema
          </p>
        </div>
        <Button onClick={() => navigate('/properties/upload')}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Propiedad
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar propiedades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Propiedades ({filteredProperties.length})</CardTitle>
          <CardDescription>Todas las propiedades del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron propiedades</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Propiedad</th>
                    <th className="text-left p-4">Propietario</th>
                    <th className="text-left p-4">Precio</th>
                    <th className="text-left p-4">Estado</th>
                    <th className="text-left p-4">Creada</th>
                    <th className="text-right p-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map((prop) => (
                    <tr key={prop.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">{prop.title}</div>
                        <div className="text-sm text-muted-foreground">{prop.address}</div>
                      </td>
                      <td className="p-4">
                        <div>{prop.owner?.full_name || '-'}</div>
                        <div className="text-sm text-muted-foreground">{prop.owner?.email}</div>
                      </td>
                      <td className="p-4 font-medium">{formatCurrency(prop.price || 0)}</td>
                      <td className="p-4">{getStatusBadge(prop.status)}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {prop.created_at ? format(new Date(prop.created_at), 'dd/MM/yyyy', { locale: es }) : '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPropertyId(prop.id);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/properties/${prop.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProperty(prop.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Details Dialog */}
      <ResourceDetailDialog
        open={showDetailsDialog}
        onOpenChange={(open) => {
          setShowDetailsDialog(open);
          if (!open) {
            setSelectedPropertyId(null);
          }
        }}
        resourceType="property"
        resourceId={selectedPropertyId}
        onUpdate={() => {
          fetchProperties();
        }}
      />
    </div>
  );
}

