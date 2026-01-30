import React, { useState, useEffect } from 'react';
import { useResourceDetail } from '../../../hooks/superadmin/useResourceDetail';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  Edit, 
  Save, 
  X, 
  FileText, 
  Eye, 
  Home,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { Skeleton } from '../../ui/skeleton';

interface PropertyDetailViewProps {
  propertyId: string | null;
  onUpdate?: () => void;
}

export function PropertyDetailView({ propertyId, onUpdate }: PropertyDetailViewProps) {
  const { data, loading, error, update, refresh } = useResourceDetail({
    resourceType: 'property',
    resourceId: propertyId,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [legalDocs, setLegalDocs] = useState<any[]>([]);
  const [offersCount, setOffersCount] = useState(0);
  const [visitsCount, setVisitsCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        address: data.address || '',
        neighborhood: data.neighborhood || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        property_type: data.property_type || 'apartment',
        transaction_type: data.transaction_type || 'sale',
        price: data.price || 0,
        minimum_offer_price: data.minimum_offer_price || null,
        monthly_costs: data.monthly_costs || null,
        visit_price: data.visit_price || 49000,
        area: data.area || 0,
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        parking: data.parking || 0,
        floor: data.floor || null,
        total_floors: data.total_floors || null,
        year_built: data.year_built || null,
        strata: data.strata || null,
        status: data.status || 'draft',
        verified: data.verified || false,
        premium: data.premium || false,
        accepts_crypto: data.accepts_crypto || false,
        financing: data.financing || false,
        features: data.features || [],
        tags: data.tags || [],
        images: data.images || [],
        virtual_tour: data.virtual_tour || '',
        video: data.video || '',
        floor_plan: data.floor_plan || '',
        freedom_tradition: data.freedom_tradition || '',
        legal_documents: data.legal_documents || [],
      });
    }
  }, [data]);

  useEffect(() => {
    if (propertyId) {
      fetchRelatedData();
    }
  }, [propertyId]);

  const fetchRelatedData = async () => {
    if (!propertyId) return;

    try {
      setLoadingStats(true);

      // Fetch legal documents
      const { data: docs } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      setLegalDocs(docs || []);

      // Fetch offers count
      const { count: offers } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', propertyId);

      setOffersCount(offers || 0);

      // Fetch visits count
      const { count: visits } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', propertyId);

      setVisitsCount(visits || 0);
    } catch (err: any) {
      console.error('Error fetching related data:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSave = async () => {
    const success = await update(formData);
    if (success) {
      setIsEditing(false);
      onUpdate?.();
      await fetchRelatedData();
    }
  };

  const handleCancel = () => {
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        address: data.address || '',
        neighborhood: data.neighborhood || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        property_type: data.property_type || 'apartment',
        transaction_type: data.transaction_type || 'sale',
        price: data.price || 0,
        minimum_offer_price: data.minimum_offer_price || null,
        monthly_costs: data.monthly_costs || null,
        visit_price: data.visit_price || 49000,
        area: data.area || 0,
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        parking: data.parking || 0,
        floor: data.floor || null,
        total_floors: data.total_floors || null,
        year_built: data.year_built || null,
        strata: data.strata || null,
        status: data.status || 'draft',
        verified: data.verified || false,
        premium: data.premium || false,
        accepts_crypto: data.accepts_crypto || false,
        financing: data.financing || false,
        features: data.features || [],
        tags: data.tags || [],
        images: data.images || [],
        virtual_tour: data.virtual_tour || '',
        video: data.video || '',
        floor_plan: data.floor_plan || '',
        freedom_tradition: data.freedom_tradition || '',
        legal_documents: data.legal_documents || [],
      });
    }
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      published: { label: 'Publicada', variant: 'default' as const },
      pending: { label: 'Pendiente', variant: 'secondary' as const },
      draft: { label: 'Borrador', variant: 'outline' as const },
      sold: { label: 'Vendida', variant: 'default' as const },
      rented: { label: 'Arrendada', variant: 'default' as const },
      archived: { label: 'Archivada', variant: 'outline' as const },
    };
    const config = variants[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive">{error || 'Propiedad no encontrada'}</p>
      </div>
    );
  }

  const property = data as any;
  const owner = property.owner;
  const agent = property.agent;
  const coordinates = property.coordinates;

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Detalles de la Propiedad</h3>
          <p className="text-sm text-muted-foreground">{property.title}</p>
        </div>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="characteristics">Características</TabsTrigger>
          <TabsTrigger value="location">Ubicación</TabsTrigger>
          <TabsTrigger value="multimedia">Multimedia</TabsTrigger>
          <TabsTrigger value="documents">Documentos ({legalDocs.length + (property.legal_documents?.length || 0)})</TabsTrigger>
          <TabsTrigger value="relations">Relaciones</TabsTrigger>
        </TabsList>

        {/* Información General */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  {isEditing ? (
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  {isEditing ? (
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="draft">Borrador</option>
                      <option value="pending">Pendiente</option>
                      <option value="published">Publicada</option>
                      <option value="sold">Vendida</option>
                      <option value="rented">Arrendada</option>
                      <option value="archived">Archivada</option>
                    </select>
                  ) : (
                    <div>{getStatusBadge(property.status)}</div>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Descripción</Label>
                  {isEditing ? (
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{property.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Propiedad</Label>
                  {isEditing ? (
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.property_type}
                      onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    >
                      <option value="apartment">Apartamento</option>
                      <option value="house">Casa</option>
                      <option value="townhouse">Casa Campestre</option>
                      <option value="office">Oficina</option>
                      <option value="commercial">Comercial</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium capitalize">{property.property_type}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Transacción</Label>
                  {isEditing ? (
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.transaction_type}
                      onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                    >
                      <option value="sale">Venta</option>
                      <option value="rent">Arriendo</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium capitalize">{property.transaction_type || 'sale'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Verificada</Label>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={formData.verified}
                      onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                      className="h-4 w-4"
                    />
                  ) : (
                    <Badge variant={property.verified ? 'default' : 'outline'}>
                      {property.verified ? 'Sí' : 'No'}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Premium</Label>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={formData.premium}
                      onChange={(e) => setFormData({ ...formData, premium: e.target.checked })}
                      className="h-4 w-4"
                    />
                  ) : (
                    <Badge variant={property.premium ? 'default' : 'outline'}>
                      {property.premium ? 'Sí' : 'No'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Características Físicas */}
        <TabsContent value="characteristics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Características Físicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Área (m²)</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: parseInt(e.target.value) || 0 })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.area} m²</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Habitaciones</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.bedrooms}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Baños</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.bathrooms}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Parqueaderos</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.parking}
                      onChange={(e) => setFormData({ ...formData, parking: parseInt(e.target.value) || 0 })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.parking || 0}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Piso</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.floor || ''}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.floor || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Total de Pisos</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.total_floors || ''}
                      onChange={(e) => setFormData({ ...formData, total_floors: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.total_floors || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Año de Construcción</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.year_built || ''}
                      onChange={(e) => setFormData({ ...formData, year_built: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.year_built || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Estrato</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="1"
                      max="6"
                      value={formData.strata || ''}
                      onChange={(e) => setFormData({ ...formData, strata: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.strata || '-'}</p>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="mt-4 space-y-2">
                <Label>Características</Label>
                {isEditing ? (
                  <Input
                    placeholder="Separadas por comas (ej: piscina, gimnasio, seguridad)"
                    value={Array.isArray(formData.features) ? formData.features.join(', ') : ''}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value.split(',').map((f: string) => f.trim()).filter(Boolean) })}
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {property.features && property.features.length > 0 ? (
                      property.features.map((feature: string, idx: number) => (
                        <Badge key={idx} variant="outline">{feature}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin características</p>
                    )}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="mt-4 space-y-2">
                <Label>Etiquetas</Label>
                {isEditing ? (
                  <Input
                    placeholder="Separadas por comas"
                    value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean) })}
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {property.tags && property.tags.length > 0 ? (
                      property.tags.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{tag}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin etiquetas</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Precio */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Precio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Precio</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{formatCurrency(property.price)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Precio Mínimo de Oferta</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.minimum_offer_price || ''}
                      onChange={(e) => setFormData({ ...formData, minimum_offer_price: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {property.minimum_offer_price ? formatCurrency(property.minimum_offer_price) : '-'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Costos Mensuales</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.monthly_costs || ''}
                      onChange={(e) => setFormData({ ...formData, monthly_costs: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {property.monthly_costs ? formatCurrency(property.monthly_costs) : '-'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Precio de Visita</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.visit_price}
                      onChange={(e) => setFormData({ ...formData, visit_price: parseInt(e.target.value) || 49000 })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{formatCurrency(property.visit_price || 49000)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Acepta Criptomonedas</Label>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={formData.accepts_crypto}
                      onChange={(e) => setFormData({ ...formData, accepts_crypto: e.target.checked })}
                      className="h-4 w-4"
                    />
                  ) : (
                    <Badge variant={property.accepts_crypto ? 'default' : 'outline'}>
                      {property.accepts_crypto ? 'Sí' : 'No'}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Financiación Disponible</Label>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={formData.financing}
                      onChange={(e) => setFormData({ ...formData, financing: e.target.checked })}
                      className="h-4 w-4"
                    />
                  ) : (
                    <Badge variant={property.financing ? 'default' : 'outline'}>
                      {property.financing ? 'Sí' : 'No'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ubicación */}
        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dirección</Label>
                  {isEditing ? (
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Barrio</Label>
                  {isEditing ? (
                    <Input
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.neighborhood}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  {isEditing ? (
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Departamento</Label>
                  {isEditing ? (
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.state || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>País</Label>
                  {isEditing ? (
                    <Input
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{property.country || '-'}</p>
                  )}
                </div>

                {coordinates && (
                  <div className="space-y-2">
                    <Label>Coordenadas</Label>
                    <p className="text-sm font-medium">
                      {coordinates.lat}, {coordinates.lng}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multimedia */}
        <TabsContent value="multimedia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multimedia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Images */}
              <div className="space-y-2">
                <Label>Imágenes</Label>
                {isEditing ? (
                  <Input
                    placeholder="URLs separadas por comas"
                    value={Array.isArray(formData.images) ? formData.images.join(', ') : ''}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value.split(',').map((url: string) => url.trim()).filter(Boolean) })}
                  />
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {property.images && property.images.length > 0 ? (
                      property.images.map((url: string, idx: number) => (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="relative group">
                          <img src={url} alt={`Imagen ${idx + 1}`} className="w-full h-24 object-cover rounded border" />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded flex items-center justify-center">
                            <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100" />
                          </div>
                        </a>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground col-span-3">Sin imágenes</p>
                    )}
                  </div>
                )}
              </div>

              {/* Virtual Tour */}
              <div className="space-y-2">
                <Label>Tour Virtual</Label>
                {isEditing ? (
                  <Input
                    placeholder="URL del tour virtual"
                    value={formData.virtual_tour}
                    onChange={(e) => setFormData({ ...formData, virtual_tour: e.target.value })}
                  />
                ) : (
                  property.virtual_tour ? (
                    <a href={property.virtual_tour} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Ver tour virtual
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">No disponible</p>
                  )
                )}
              </div>

              {/* Video */}
              <div className="space-y-2">
                <Label>Video</Label>
                {isEditing ? (
                  <Input
                    placeholder="URL del video"
                    value={formData.video}
                    onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                  />
                ) : (
                  property.video ? (
                    <a href={property.video} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Ver video
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">No disponible</p>
                  )
                )}
              </div>

              {/* Floor Plan */}
              <div className="space-y-2">
                <Label>Plano</Label>
                {isEditing ? (
                  <Input
                    placeholder="URL del plano"
                    value={formData.floor_plan}
                    onChange={(e) => setFormData({ ...formData, floor_plan: e.target.value })}
                  />
                ) : (
                  property.floor_plan ? (
                    <a href={property.floor_plan} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Ver plano
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">No disponible</p>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentos */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Legales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Freedom and Tradition */}
              <div className="space-y-2">
                <Label>Libertad y Tradición</Label>
                {isEditing ? (
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                    value={formData.freedom_tradition}
                    onChange={(e) => setFormData({ ...formData, freedom_tradition: e.target.value })}
                    placeholder="Texto de libertad y tradición"
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{property.freedom_tradition || 'No disponible'}</p>
                )}
              </div>

              {/* Legal Documents Array */}
              <div className="space-y-2">
                <Label>Documentos Legales (URLs)</Label>
                {isEditing ? (
                  <Input
                    placeholder="URLs separadas por comas"
                    value={Array.isArray(formData.legal_documents) ? formData.legal_documents.join(', ') : ''}
                    onChange={(e) => setFormData({ ...formData, legal_documents: e.target.value.split(',').map((url: string) => url.trim()).filter(Boolean) })}
                  />
                ) : (
                  <div className="space-y-2">
                    {property.legal_documents && property.legal_documents.length > 0 ? (
                      property.legal_documents.map((url: string, idx: number) => (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                          <FileText className="h-4 w-4" />
                          Documento {idx + 1}
                        </a>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin documentos</p>
                    )}
                  </div>
                )}
              </div>

              {/* Legal Documents from Table */}
              {legalDocs.length > 0 && (
                <div className="space-y-2">
                  <Label>Documentos en Sistema</Label>
                  <div className="space-y-2">
                    {legalDocs.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">{doc.document_type || 'Documento'}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.created_at ? format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: es }) : '-'}
                            </p>
                          </div>
                        </div>
                        <Badge variant={doc.status === 'signed' ? 'default' : 'outline'}>
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relaciones */}
        <TabsContent value="relations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Propietario</Label>
                  {owner ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{owner.full_name || '-'}</p>
                        <p className="text-xs text-muted-foreground">{owner.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No asignado</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Agente</Label>
                  {agent ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{agent.full_name || '-'}</p>
                        <p className="text-xs text-muted-foreground">{agent.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No asignado</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Ofertas</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <p className="text-sm font-medium">{offersCount}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Visitas</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <p className="text-sm font-medium">{visitsCount}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fecha de Creación</Label>
                  <p className="text-sm font-medium">
                    {property.created_at
                      ? format(new Date(property.created_at), 'dd/MM/yyyy HH:mm', { locale: es })
                      : '-'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Última Actualización</Label>
                  <p className="text-sm font-medium">
                    {property.updated_at
                      ? format(new Date(property.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

