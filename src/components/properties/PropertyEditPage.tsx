import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VisitAvailabilityConfig } from './VisitAvailabilityConfig';
import { FormFieldHelper } from '@/components/ui/FormFieldHelper';
import {
  Edit,
  Save,
  X,
  Clock,
  MapPin,
  DollarSign,
  Home,
  Car,
  Bath,
  Bed,
  Ruler,
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  neighborhood: string;
  city: string;
  property_type: string;
  transaction_type: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  floor?: number;
  total_floors?: number;
  year_built?: number;
  strata?: number;
  features: string[];
  images: string[];
  status: string;
  owner_id: string;
}

export const PropertyEditPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [property, setProperty] = useState<Property | null>(null);

  // Form state
  const [formData, setFormData] = useState<Property | null>(null);

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchProperty = async () => {
    if (!propertyId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('Propiedad no encontrada');
        navigate('/properties');
        return;
      }

      // Check if user owns this property
      if (!user || user.id !== data.owner_id) {
        toast.error('No tienes permiso para editar esta propiedad');
        navigate(`/properties/${propertyId}`);
        return;
      }

      setProperty(data);
      setFormData(data);
    } catch (error: any) {
      console.error('Error fetching property:', error);
      toast.error('Error al cargar la propiedad');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Property, value: any) => {
    if (!formData) return;
    setFormData(prev => prev ? ({
      ...prev,
      [field]: value
    }) : null);
  };

  const handleFeatureToggle = (feature: string) => {
    if (!formData) return;
    setFormData(prev => prev ? ({
      ...prev,
      features: prev.features?.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...(prev.features || []), feature]
    }) : null);
  };

  const handleSaveProperty = async () => {
    if (!formData || !propertyId) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({
          title: formData.title,
          description: formData.description,
          address: formData.address,
          neighborhood: formData.neighborhood,
          city: formData.city,
          property_type: formData.property_type,
          transaction_type: formData.transaction_type,
          price: formData.price,
          area: formData.area,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          parking: formData.parking,
          floor: formData.floor,
          total_floors: formData.total_floors,
          year_built: formData.year_built,
          strata: formData.strata,
          features: formData.features,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId)
        .eq('owner_id', user?.id) // Extra security check
        .select()
        .single();

      if (error) throw error;

      toast.success('Propiedad actualizada exitosamente');
      navigate(`/properties/${propertyId}`);
    } catch (error: any) {
      console.error('Error updating property:', error);
      toast.error(error.message || 'Error al actualizar la propiedad');
    } finally {
      setSaving(false);
    }
  };

  const availableFeatures = [
    'pool', 'gym', 'security', 'elevator', 'garden', 'terrace',
    'parking', 'storage', 'laundry', 'internet', 'furnished'
  ];

  const propertyTypes = [
    { value: 'apartment', label: 'Apartamento' },
    { value: 'house', label: 'Casa' },
    { value: 'townhouse', label: 'Casa en conjunto' },
    { value: 'office', label: 'Oficina' },
    { value: 'commercial', label: 'Local comercial' }
  ];

  const transactionTypes = [
    { value: 'sale', label: 'Venta' },
    { value: 'rent', label: 'Arriendo' }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!formData || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">Propiedad no encontrada</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/properties/${propertyId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Edit className="h-7 w-7" />
              Editar Propiedad
            </h1>
            <p className="text-muted-foreground mt-1">
              Modifica los detalles de tu propiedad y configura la disponibilidad para visitas
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/properties/${propertyId}`)}
            disabled={saving}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSaveProperty}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Detalles de la Propiedad
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Disponibilidad de Visitas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Basic Information */}
            <Card className="lg:col-span-2 xl:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="title">Título de la Propiedad</Label>
                    <FormFieldHelper
                      fieldId="title"
                      content="El título es lo primero que ven los usuarios. Sé descriptivo y atractivo. Ejemplo: 'Hermoso apartamento en el centro con vista a la montaña'"
                    />
                  </div>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ej: Hermoso apartamento en el centro"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="property_type">Tipo de Propiedad</Label>
                      <FormFieldHelper
                        fieldId="property_type"
                        content="Selecciona el tipo de inmueble. Esto ayuda a los usuarios a filtrar y encontrar lo que buscan."
                      />
                    </div>
                    <select
                      id="property_type"
                      className="w-full border rounded-md p-2 bg-background"
                      value={formData.property_type}
                      onChange={(e) => handleInputChange('property_type', e.target.value)}
                    >
                      {propertyTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="transaction_type">Tipo de Transacción</Label>
                      <FormFieldHelper
                        fieldId="transaction_type"
                        content="¿Vas a vender o arrendar la propiedad? Esto determina cómo se mostrará en las búsquedas."
                      />
                    </div>
                    <select
                      id="transaction_type"
                      className="w-full border rounded-md p-2 bg-background"
                      value={formData.transaction_type}
                      onChange={(e) => handleInputChange('transaction_type', e.target.value)}
                    >
                      {transactionTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="description">Descripción</Label>
                    <FormFieldHelper
                      fieldId="description"
                      content="Describe las características principales de tu propiedad. Incluye detalles sobre ubicación, características especiales, cercanías importantes, y cualquier información que pueda interesar a los compradores o arrendatarios."
                    />
                  </div>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe las características principales de tu propiedad..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="lg:col-span-2 xl:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="address">Dirección</Label>
                    <FormFieldHelper
                      fieldId="address"
                      content="Ingresa la dirección completa de la propiedad. Esto se mostrará en el mapa y ayudará a los usuarios a ubicarla."
                    />
                  </div>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Ej: Calle 10 # 20-30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="neighborhood">Barrio</Label>
                      <FormFieldHelper
                        fieldId="neighborhood"
                        content="El barrio es importante para la búsqueda. Usa el nombre oficial del barrio."
                      />
                    </div>
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                      placeholder="Ej: El Poblado"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="city">Ciudad</Label>
                      <FormFieldHelper
                        fieldId="city"
                        content="La ciudad donde se encuentra la propiedad."
                      />
                    </div>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Ej: Medellín"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price and Area */}
            <Card className="xl:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Precio y Área
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="price">Precio (COP)</Label>
                      <FormFieldHelper
                        fieldId="price"
                        content="Ingresa el precio en pesos colombianos sin puntos ni comas. Ejemplo: 300000000 para 300 millones."
                      />
                    </div>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                      placeholder="Ej: 300000000"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="area">Área (m²)</Label>
                      <FormFieldHelper
                        fieldId="area"
                        content="El área total de la propiedad en metros cuadrados. Incluye todos los espacios habitables."
                      />
                    </div>
                    <Input
                      id="area"
                      type="number"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', parseInt(e.target.value) || 0)}
                      placeholder="Ej: 80"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card className="lg:col-span-2 xl:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Especificaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="bedrooms" className="flex items-center gap-2">
                        <Bed className="h-4 w-4" />
                        Habitaciones
                      </Label>
                      <FormFieldHelper
                        fieldId="bedrooms"
                        content="Número de habitaciones o dormitorios de la propiedad."
                      />
                    </div>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="bathrooms" className="flex items-center gap-2">
                        <Bath className="h-4 w-4" />
                        Baños
                      </Label>
                      <FormFieldHelper
                        fieldId="bathrooms"
                        content="Número de baños completos de la propiedad."
                      />
                    </div>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="parking" className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Parqueaderos
                      </Label>
                      <FormFieldHelper
                        fieldId="parking"
                        content="Número de espacios de parqueo disponibles."
                      />
                    </div>
                    <Input
                      id="parking"
                      type="number"
                      value={formData.parking}
                      onChange={(e) => handleInputChange('parking', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="strata">Estrato</Label>
                      <FormFieldHelper
                        fieldId="strata"
                        content="Estrato socioeconómico según clasificación de Colombia (1-6). Esto afecta los costos de servicios públicos."
                      />
                    </div>
                    <select
                      id="strata"
                      className="w-full border rounded-md p-2"
                      value={formData.strata || ''}
                      onChange={(e) => handleInputChange('strata', parseInt(e.target.value) || undefined)}
                    >
                      <option value="">Seleccionar</option>
                      {[1, 2, 3, 4, 5, 6].map(strata => (
                        <option key={strata} value={strata}>
                          Estrato {strata}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="floor">Piso</Label>
                      <FormFieldHelper
                        fieldId="floor"
                        content="Si es un apartamento, indica en qué piso está ubicado."
                      />
                    </div>
                    <Input
                      id="floor"
                      type="number"
                      value={formData.floor || ''}
                      onChange={(e) => handleInputChange('floor', parseInt(e.target.value) || undefined)}
                      min="0"
                      placeholder="Opcional"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="total_floors">Total de Pisos</Label>
                      <FormFieldHelper
                        fieldId="total_floors"
                        content="Total de pisos del edificio o conjunto residencial."
                      />
                    </div>
                    <Input
                      id="total_floors"
                      type="number"
                      value={formData.total_floors || ''}
                      onChange={(e) => handleInputChange('total_floors', parseInt(e.target.value) || undefined)}
                      min="1"
                      placeholder="Opcional"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Características Adicionales</CardTitle>
              <CardDescription>
                Selecciona las características que tiene tu propiedad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {availableFeatures.map(feature => (
                  <div key={feature} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={feature}
                      checked={formData.features?.includes(feature) || false}
                      onChange={() => handleFeatureToggle(feature)}
                      className="rounded"
                    />
                    <Label htmlFor={feature} className="capitalize">
                      {feature === 'pool' ? 'Piscina' :
                       feature === 'gym' ? 'Gimnasio' :
                       feature === 'security' ? 'Seguridad' :
                       feature === 'elevator' ? 'Ascensor' :
                       feature === 'garden' ? 'Jardín' :
                       feature === 'terrace' ? 'Terraza' :
                       feature === 'parking' ? 'Parqueadero' :
                       feature === 'storage' ? 'Bodega' :
                       feature === 'laundry' ? 'Lavandería' :
                       feature === 'internet' ? 'Internet' :
                       feature === 'furnished' ? 'Amueblado' : feature}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <VisitAvailabilityConfig
            propertyId={property.id}
            onComplete={() => {
              toast.success('Disponibilidad de visitas actualizada');
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

