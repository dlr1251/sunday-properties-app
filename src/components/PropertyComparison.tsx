import { getIntlLocale } from '../../i18n';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  X, 
  Download, 
  Eye, 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar,
  DollarSign,
  Star,
  Trash2
} from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { toast } from 'sonner';

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  neighborhood: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  status: string;
  property_type: string;
  strata?: number;
  year_built?: number;
  features: string[];
  created_at: string;
}

interface PropertyComparisonProps {
  properties: Property[];
  onRemoveProperty: (propertyId: string) => void;
  onClearAll: () => void;
  onViewProperty: (propertyId: string) => void;
}

export const PropertyComparison: React.FC<PropertyComparisonProps> = ({
  properties,
  onRemoveProperty,
  onClearAll,
  onViewProperty
}) => {
  const { addToFavorites, removeFromFavorites, isFavorited } = useFavorites();
  const [favoriteStates, setFavoriteStates] = useState<Record<string, boolean>>({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(getIntlLocale(), {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatArea = (area: number) => {
    return `${area.toLocaleString()} m²`;
  };

  const handleFavoriteToggle = async (propertyId: string) => {
    const isCurrentlyFavorited = isFavorited(propertyId);
    
    if (isCurrentlyFavorited) {
      await removeFromFavorites(propertyId);
      setFavoriteStates(prev => ({ ...prev, [propertyId]: false }));
    } else {
      await addToFavorites(propertyId);
      setFavoriteStates(prev => ({ ...prev, [propertyId]: true }));
    }
  };

  const handleExportPDF = () => {
    // This would integrate with a PDF generation library
    toast.info('Función de exportación a PDF próximamente');
  };

  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <Eye className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay propiedades para comparar</h3>
            <p className="text-muted-foreground mb-4">
              Agrega al menos 2 propiedades para comenzar la comparación
            </p>
            <Button onClick={() => window.history.back()}>
              Explorar Propiedades
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const comparisonData = [
    { label: 'Precio', key: 'price', format: formatCurrency },
    { label: 'Área', key: 'area', format: formatArea },
    { label: 'Habitaciones', key: 'bedrooms', format: (val: number) => val.toString() },
    { label: 'Baños', key: 'bathrooms', format: (val: number) => val.toString() },
    { label: 'Estrato', key: 'strata', format: (val: number) => val ? val.toString() : 'N/A' },
    { label: 'Año de Construcción', key: 'year_built', format: (val: number) => val ? val.toString() : 'N/A' },
    { label: 'Tipo', key: 'property_type', format: (val: string) => val },
    { label: 'Estado', key: 'status', format: (val: string) => val },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comparación de Propiedades</h2>
          <p className="text-muted-foreground">
            Comparando {properties.length} propiedades
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={onClearAll}>
            <Trash2 className="mr-2 h-4 w-4" />
            Limpiar Todo
          </Button>
        </div>
      </div>

      {/* Properties Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {properties.map((property) => (
          <Card key={property.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{property.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {property.neighborhood}, {property.city}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveProperty(property.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {property.images && property.images.length > 0 && (
                <div className="aspect-video bg-muted rounded-md mb-3 overflow-hidden">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">
                    {formatCurrency(property.price)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFavoriteToggle(property.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        isFavorited(property.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                      }`} 
                    />
                  </Button>
                </div>
                <div className="flex items-center text-xs text-muted-foreground space-x-2">
                  <span className="flex items-center">
                    <Bed className="h-3 w-3 mr-1" />
                    {property.bedrooms}
                  </span>
                  <span className="flex items-center">
                    <Bath className="h-3 w-3 mr-1" />
                    {property.bathrooms}
                  </span>
                  <span className="flex items-center">
                    <Square className="h-3 w-3 mr-1" />
                    {formatArea(property.area)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewProperty(property.id)}
                  className="w-full"
                >
                  <Eye className="mr-2 h-3 w-3" />
                  Ver Detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparación Detallada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Característica</TableHead>
                  {properties.map((property) => (
                    <TableHead key={property.id} className="text-center min-w-48">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm truncate">{property.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {property.neighborhood}, {property.city}
                        </p>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonData.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    {properties.map((property) => (
                      <TableCell key={property.id} className="text-center">
                        {row.format(property[row.key as keyof Property] as any)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                
                {/* Features Row */}
                <TableRow>
                  <TableCell className="font-medium">Características</TableCell>
                  {properties.map((property) => (
                    <TableCell key={property.id} className="text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {property.features?.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {property.features && property.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{property.features.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Location Row */}
                <TableRow>
                  <TableCell className="font-medium">Ubicación</TableCell>
                  {properties.map((property) => (
                    <TableCell key={property.id} className="text-center">
                      <div className="flex items-center justify-center text-sm">
                        <MapPin className="h-3 w-3 mr-1" />
                        {property.address}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Date Added Row */}
                <TableRow>
                  <TableCell className="font-medium">Fecha de Publicación</TableCell>
                  {properties.map((property) => (
                    <TableCell key={property.id} className="text-center">
                      <div className="flex items-center justify-center text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(property.created_at).toLocaleDateString(getIntlLocale())}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Precio Promedio</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    properties.reduce((sum, p) => sum + p.price, 0) / properties.length
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Square className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Área Promedio</p>
                <p className="text-2xl font-bold">
                  {formatArea(
                    properties.reduce((sum, p) => sum + p.area, 0) / properties.length
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Bed className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Habitaciones Promedio</p>
                <p className="text-2xl font-bold">
                  {(properties.reduce((sum, p) => sum + p.bedrooms, 0) / properties.length).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyComparison;
