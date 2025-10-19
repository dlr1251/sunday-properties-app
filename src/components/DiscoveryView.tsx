import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { getPropertyImage } from '../utils/imageUtils';
import { 
  MapPin, 
  Search, 
  Filter, 
  Heart, 
  Eye,
  Bed,
  Bath,
  Square,
  Car,
  Shield,
  Star,
  ChevronDown,
  Map
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  location: string;
  image: string;
  verified: boolean;
  premium: boolean;
  coordinates: { lat: number; lng: number };
  monthlyCosts: number;
  tags: string[];
}

const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Apartamento Moderno en El Poblado',
    price: 450000000,
    area: 85,
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    location: 'El Poblado, Medellín',
    image: getPropertyImage(400, 300, 1),
    verified: true,
    premium: true,
    coordinates: { lat: 6.2088, lng: -75.5654 },
    monthlyCosts: 1200000,
    tags: ['Nuevo', 'Vista panorámica', 'Gym']
  },
  {
    id: '2',
    title: 'Casa Familiar en Laureles',
    price: 380000000,
    area: 120,
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    location: 'Laureles, Medellín',
    image: getPropertyImage(400, 300, 1),
    verified: true,
    premium: false,
    coordinates: { lat: 6.2442, lng: -75.5812 },
    monthlyCosts: 950000,
    tags: ['Jardín', 'Zona verde', 'Seguro']
  },
  {
    id: '3',
    title: 'Penthouse de Lujo',
    price: 850000000,
    area: 200,
    bedrooms: 5,
    bathrooms: 4,
    parking: 3,
    location: 'Envigado, Medellín',
    image: getPropertyImage(400, 300, 1),
    verified: true,
    premium: true,
    coordinates: { lat: 6.1699, lng: -75.5856 },
    monthlyCosts: 2100000,
    tags: ['Lujo', 'Terraza', 'Piscina']
  }
];

export const DiscoveryView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filters, setFilters] = useState({
    priceRange: [0, 1000000000],
    bedrooms: 'all',
    bathrooms: 'all',
    area: [0, 500],
    verified: false
  });
  const [searchQuery, setSearchQuery] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const PropertyCard: React.FC<{ property: Property }> = ({ property }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="relative">
        <img 
          src={property.image} 
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3 flex space-x-2">
          {property.verified && (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <Shield className="h-3 w-3 mr-1" />
              Verificado
            </Badge>
          )}
          {property.premium && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Star className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 bg-white/90 hover:bg-white"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{property.title}</h3>
        <p className="text-muted-foreground text-sm mb-3">{property.location}</p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(property.price)}
          </span>
          <span className="text-sm text-muted-foreground">
            {formatPrice(property.monthlyCosts)}/mes
          </span>
        </div>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center space-x-1">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Square className="h-4 w-4" />
            <span>{property.area}m²</span>
          </div>
          <div className="flex items-center space-x-1">
            <Car className="h-4 w-4" />
            <span>{property.parking}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {property.tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex space-x-2">
          <Button className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            Ver Detalle
          </Button>
          <Button variant="outline" size="sm">
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  const FilterSidebar = () => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Filtros</h2>
        <Button variant="ghost" size="sm">
          Limpiar
        </Button>
      </div>

      <div className="space-y-6">
        {/* Precio */}
        <div>
          <label className="text-sm font-medium mb-2 block">Rango de Precio</label>
          <div className="space-y-2">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => setFilters({...filters, priceRange: value})}
              max={1000000000}
              step={10000000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatPrice(filters.priceRange[0])}</span>
              <span>{formatPrice(filters.priceRange[1])}</span>
            </div>
          </div>
        </div>

        {/* Habitaciones */}
        <div>
          <label className="text-sm font-medium mb-2 block">Habitaciones</label>
          <Select value={filters.bedrooms} onValueChange={(value) => setFilters({...filters, bedrooms: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquiera</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Baños */}
        <div>
          <label className="text-sm font-medium mb-2 block">Baños</label>
          <Select value={filters.bathrooms} onValueChange={(value) => setFilters({...filters, bathrooms: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquiera</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Área */}
        <div>
          <label className="text-sm font-medium mb-2 block">Área (m²)</label>
          <div className="space-y-2">
            <Slider
              value={filters.area}
              onValueChange={(value) => setFilters({...filters, area: value})}
              max={500}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{filters.area[0]}m²</span>
              <span>{filters.area[1]}m²</span>
            </div>
          </div>
        </div>

        {/* Verificado */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="verified"
            checked={filters.verified}
            onChange={(e) => setFilters({...filters, verified: e.target.checked})}
            className="rounded border-gray-300"
          />
          <label htmlFor="verified" className="text-sm font-medium">
            Solo propiedades verificadas
          </label>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-4 lg:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ubicación, barrio o características..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => setViewMode('map')}
              className="flex items-center space-x-2"
            >
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Mapa</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Lista</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden lg:block w-80 p-6">
          <FilterSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {viewMode === 'map' ? (
            <div className="h-[calc(100vh-120px)] relative">
              {/* Map Placeholder */}
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    Mapa Interactivo
                  </h3>
                  <p className="text-muted-foreground">
                    Integración con Google Maps mostrará aquí
                  </p>
                </div>
              </div>

              {/* Map Results Panel */}
              <div className="absolute bottom-4 left-4 right-4 lg:right-auto lg:w-96">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Propiedades encontradas</h3>
                    <Badge variant="secondary">{mockProperties.length}</Badge>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {mockProperties.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center space-x-3 p-2 hover:bg-muted rounded cursor-pointer"
                        onClick={() => setSelectedProperty(property)}
                      >
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{property.title}</p>
                          <p className="text-xs text-muted-foreground">{property.location}</p>
                          <p className="text-sm font-semibold text-primary">
                            {formatPrice(property.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <div className="p-4 lg:p-6">
              {/* Mobile Filters */}
              <div className="lg:hidden mb-6">
                <Button variant="outline" className="w-full justify-between">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Properties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
