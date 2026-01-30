import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VisitAvailabilityConfig } from './VisitAvailabilityConfig';
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
  CheckCircle
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

interface PropertyEditPanelProps {
  property: Property;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPropertyUpdated?: (property: Property) => void;
}

export const PropertyEditPanel: React.FC<PropertyEditPanelProps> = ({
  property,
  open,
  onOpenChange,
  onPropertyUpdated
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Form state
  const [formData, setFormData] = useState<Property>(property);

  useEffect(() => {
    if (property) {
      setFormData(property);
    }
  }, [property]);

  // Check if user owns this property
  if (!user || user.id !== property.owner_id) {
    return null;
  }

  const handleInputChange = (field: keyof Property, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...(prev.features || []), feature]
    }));
  };

  const handleSaveProperty = async () => {
    setLoading(true);
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
        .eq('id', property.id)
        .eq('owner_id', user.id) // Extra security check
        .select()
        .single();

      if (error) throw error;

      toast.success('Propiedad actualizada exitosamente');
      onPropertyUpdated?.(data);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating property:', error);
      toast.error(error.message || 'Error al actualizar la propiedad');
    } finally {
      setLoading(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full overflow-y-auto lg:max-w-7xl xl:max-w-[90vw]">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl lg:text-2xl">
            <Edit className="h-5 w-5 lg:h-6 lg:w-6" />
            Editar Propiedad
          </DialogTitle>
          <DialogDescription className="text-sm lg:text-base">
            Modifica los detalles de tu propiedad y configura la disponibilidad para visitas
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12 lg:h-14">
            <TabsTrigger value="details" className="flex items-center gap-2 text-sm lg:text-base">
              <Home className="h-4 w-4 lg:h-5 lg:w-5" />
              Detalles de la Propiedad
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-2 text-sm lg:text-base">
              <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
              Disponibilidad de Visitas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {/* Basic Information */}
              <Card className="lg:col-span-2 xl:col-span-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl">Información Básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 lg:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm lg:text-base">Título de la Propiedad</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Ej: Hermoso apartamento en el centro"
                      className="h-10 lg:h-12 text-sm lg:text-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="property_type" className="text-sm lg:text-base">Tipo de Propiedad</Label>
                      <select
                        id="property_type"
                        className="w-full border rounded-md p-2 lg:p-3 h-10 lg:h-12 text-sm lg:text-base bg-background"
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
                      <Label htmlFor="transaction_type" className="text-sm lg:text-base">Tipo de Transacción</Label>
                      <select
                        id="transaction_type"
                        className="w-full border rounded-md p-2 lg:p-3 h-10 lg:h-12 text-sm lg:text-base bg-background"
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
                    <Label htmlFor="description" className="text-sm lg:text-base">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe las características principales de tu propiedad..."
                      rows={4}
                      className="text-sm lg:text-base min-h-[100px] lg:min-h-[120px] resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card className="lg:col-span-2 xl:col-span-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl flex items-center gap-2">
                    <MapPin className="h-4 w-4 lg:h-5 lg:w-5" />
                    Ubicación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 lg:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm lg:text-base">Dirección</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Ej: Calle 10 # 20-30"
                      className="h-10 lg:h-12 text-sm lg:text-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood" className="text-sm lg:text-base">Barrio</Label>
                      <Input
                        id="neighborhood"
                        value={formData.neighborhood}
                        onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                        placeholder="Ej: El Poblado"
                        className="h-10 lg:h-12 text-sm lg:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm lg:text-base">Ciudad</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Ej: Medellín"
                        className="h-10 lg:h-12 text-sm lg:text-base"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price and Area */}
              <Card className="xl:col-span-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl flex items-center gap-2">
                    <DollarSign className="h-4 w-4 lg:h-5 lg:w-5" />
                    Precio y Área
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 lg:space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm lg:text-base">Precio (COP)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                        placeholder="Ej: 300000000"
                        className="h-10 lg:h-12 text-sm lg:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area" className="text-sm lg:text-base">Área (m²)</Label>
                      <Input
                        id="area"
                        type="number"
                        value={formData.area}
                        onChange={(e) => handleInputChange('area', parseInt(e.target.value) || 0)}
                        placeholder="Ej: 80"
                        className="h-10 lg:h-12 text-sm lg:text-base"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card className="lg:col-span-2 xl:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl">Especificaciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms" className="flex items-center gap-2">
                        <Bed className="h-4 w-4" />
                        Habitaciones
                      </Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        value={formData.bedrooms}
                        onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bathrooms" className="flex items-center gap-2">
                        <Bath className="h-4 w-4" />
                        Baños
                      </Label>
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
                      <Label htmlFor="parking" className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Parqueaderos
                      </Label>
                      <Input
                        id="parking"
                        type="number"
                        value={formData.parking}
                        onChange={(e) => handleInputChange('parking', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="strata">Estrato</Label>
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
                      <Label htmlFor="floor">Piso</Label>
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
                      <Label htmlFor="total_floors">Total de Pisos</Label>
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
                <CardTitle className="text-lg lg:text-xl">Características Adicionales</CardTitle>
                <CardDescription className="text-sm lg:text-base">
                  Selecciona las características que tiene tu propiedad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
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

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto h-11 lg:h-12 text-sm lg:text-base"
          >
            <X className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSaveProperty}
            disabled={loading}
            className="w-full sm:w-auto h-11 lg:h-12 text-sm lg:text-base"
          >
            <Save className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
