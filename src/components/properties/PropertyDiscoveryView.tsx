import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { PropertyCard } from './PropertyCard';
import { PropertyComparison } from './PropertyComparison';
import { ScheduleVisitModal } from './ScheduleVisitModal';
import { useFavorites } from '../../hooks/useFavorites';
import { useAllProperties, useVisitScheduling } from '../../hooks/useSupabase';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import {
  SlidersHorizontal,
  Grid3X3,
  List,
  Search,
  MapPin,
  ArrowUpDown,
  X,
  BarChart3
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  area: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  pool: string;
  price: string;
  image: string;
  property_type: string;
  neighborhood: string;
  city: string;
  strata: number;
  year_built: number;
  features: string[];
  price_value: number; // Numeric price for filtering
  area_value: number; // Numeric area for filtering
  views_count: number;
  favorites_count: number;
  created_at: string;
}

interface Filters {
  search: string;
  priceRange: [number, number];
  areaRange: [number, number];
  bedrooms: number[];
  bathrooms: number[];
  propertyTypes: string[];
  neighborhoods: string[];
  cities: string[];
  features: string[];
  strata: number[];
}

interface PropertyDiscoveryViewProps {
  onPropertyClick?: (propertyId: string) => void;
}

const mockProperties: Property[] = [
  {
    id: "1",
    title: "Finca en El Retiro",
    area: "300m²",
    location: "Llanogrande, Rionegro",
    bedrooms: 2,
    bathrooms: 3,
    pool: "climatizada",
    price: "$700,000,000 COP",
    image: "https://images.unsplash.com/photo-1707299539593-a4e151b570e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvbWJpYSUyMGNvdW50cnlzaWRlJTIwdmlsbGF8ZW58MXx8fHwxNzYwOTEwNTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    property_type: "house",
    neighborhood: "El Retiro",
    city: "Rionegro",
    strata: 0,
    year_built: 2020,
    features: ["Piscina", "Jardín", "Terraza"],
    price_value: 700000000,
    area_value: 300,
    views_count: 245,
    favorites_count: 12,
    created_at: "2024-01-15"
  },
  {
    id: "2",
    title: "Apartamento en Envigado",
    area: "120m²",
    location: "Zona Rosa, Envigado",
    bedrooms: 3,
    bathrooms: 2,
    pool: "comunal",
    price: "$450,000,000 COP",
    image: "https://images.unsplash.com/photo-1515263487990-61b07816b324?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjA4OTU4Njl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    property_type: "apartment",
    neighborhood: "Zona Rosa",
    city: "Envigado",
    strata: 4,
    year_built: 2018,
    features: ["Ascensor", "Gimnasio", "Seguridad 24h"],
    price_value: 450000000,
    area_value: 120,
    views_count: 189,
    favorites_count: 8,
    created_at: "2024-01-10"
  },
  {
    id: "3",
    title: "Casa Campestre Guarne",
    area: "450m²",
    location: "Vereda San Ignacio, Guarne",
    bedrooms: 4,
    bathrooms: 4,
    pool: "natural",
    price: "$950,000,000 COP",
    image: "https://images.unsplash.com/photo-1760265756109-91061e7c1a64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydXJhbCUyMGVzdGF0ZSUyMHByb3BlcnR5fGVufDF8fHx8MTc2MDkxMDU4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    property_type: "house",
    neighborhood: "Guarne",
    city: "Guarne",
    strata: 0,
    year_built: 2019,
    features: ["Piscina", "Jardín", "Vista panorámica"],
    price_value: 950000000,
    area_value: 450,
    views_count: 156,
    favorites_count: 23,
    created_at: "2024-01-08"
  }
];

export function PropertyDiscoveryView({ onPropertyClick }: PropertyDiscoveryViewProps) {
  const navigate = useNavigate();
  const { addToFavorites, removeFromFavorites, isFavorited } = useFavorites();
  
  // Default navigation handler if onPropertyClick is not provided
  const handlePropertyClick = onPropertyClick || ((propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  });

  const [filters, setFilters] = useState<Filters>({
    search: '',
    priceRange: [0, 2000000000],
    areaRange: [0, 1000],
    bedrooms: [],
    bathrooms: [],
    propertyTypes: [],
    neighborhoods: [],
    cities: [],
    features: [],
    strata: []
  });

  const { user } = useAuth();
  const { properties: allProperties, loading: allPropertiesLoading } = useAllProperties(user?.id);
  const { scheduleVisit } = useVisitScheduling();
  const { createPropertyInquiry } = useChat();

  // State for visit scheduling modal
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [selectedPropertyForVisit, setSelectedPropertyForVisit] = useState<{id: string, title: string} | null>(null);

  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'area-asc' | 'area-desc' | 'date-desc' | 'views-desc'>('date-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [propertiesPerPage] = useState(12);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);

  // Determine which properties to use
  const propertiesToUse = user ? allProperties : mockProperties;

  // Filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    if (!propertiesToUse || propertiesToUse.length === 0) return [];

    let filtered = propertiesToUse.filter(property => {
      // Search filter - handle both mock data (location) and DB data (neighborhood, city)
      const searchText = filters.search?.toLowerCase();
      if (searchText) {
        const searchableText = [
          property.title,
          property.location || `${property.neighborhood}, ${property.city}`
        ].join(' ').toLowerCase();

        if (!searchableText.includes(searchText)) {
          return false;
        }
      }

      // Price range - handle both string prices and numeric prices
      const priceValue = typeof property.price === 'string'
        ? parseInt(property.price.replace(/[^\d]/g, ''))
        : property.price_value || property.price || 0;

      if (priceValue < filters.priceRange[0] || priceValue > filters.priceRange[1]) {
        return false;
      }

      // Area range - handle both string areas and numeric areas
      const areaValue = typeof property.area === 'string'
        ? parseInt(property.area.replace(/[^\d]/g, ''))
        : property.area_value || property.area || 0;

      if (areaValue < filters.areaRange[0] || areaValue > filters.areaRange[1]) {
        return false;
      }

      // Bedrooms
      if (filters.bedrooms.length > 0 && !filters.bedrooms.includes(property.bedrooms)) {
        return false;
      }

      // Bathrooms
      if (filters.bathrooms.length > 0 && !filters.bathrooms.includes(property.bathrooms)) {
        return false;
      }

      // Property types
      if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(property.property_type)) {
        return false;
      }

      // Cities
      if (filters.cities.length > 0 && !filters.cities.includes(property.city)) {
        return false;
      }

      // Features
      if (filters.features.length > 0) {
        const hasFeature = filters.features.some(feature =>
          property.features.some(propFeature =>
            propFeature.toLowerCase().includes(feature.toLowerCase())
          )
        );
        if (!hasFeature) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price_value - b.price_value;
        case 'price-desc':
          return b.price_value - a.price_value;
        case 'area-asc':
          return a.area_value - b.area_value;
        case 'area-desc':
          return b.area_value - a.area_value;
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'views-desc':
          return b.views_count - a.views_count;
        default:
          return 0;
      }
    });

    return filtered;
  }, [filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProperties.length / propertiesPerPage);
  const paginatedProperties = filteredAndSortedProperties.slice(
    (currentPage - 1) * propertiesPerPage,
    currentPage * propertiesPerPage
  );

  const handleFavoriteToggle = async (propertyId: string) => {
    if (isFavorited(propertyId)) {
      await removeFromFavorites(propertyId);
    } else {
      await addToFavorites(propertyId);
    }
  };

  const handleScheduleVisit = (propertyId: string, title: string) => {
    setSelectedPropertyForVisit({ id: propertyId, title });
    setVisitModalOpen(true);
  };

  const handleContactOwner = async (propertyId: string, title: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para contactar al propietario');
      return;
    }

    try {
      const conversationId = await createPropertyInquiry(
        propertyId,
        `Consulta sobre ${title}`,
        `Hola, estoy interesado en la propiedad "${title}". ¿Podrías darme más información?`
      );
      
      toast.success('Conversación iniciada. Puedes ver tus mensajes en el menú.');
      // Optionally navigate to messages
      // navigate(`/messages/${conversationId}`);
    } catch (error) {
      toast.error('Error al contactar al propietario');
      console.error('Error creating property inquiry:', error);
    }
  };

  const handleVisitScheduled = async (visitData: any) => {
    const result = await scheduleVisit(visitData);
    if (result.success) {
      toast.success('Visita agendada exitosamente. El propietario será notificado.');
      setVisitModalOpen(false);
      setSelectedPropertyForVisit(null);
    } else {
      toast.error('Error al agendar la visita: ' + result.error.message);
    }
  };

  const handleCompareToggle = (propertyId: string) => {
    const newSelected = new Set(selectedForComparison);
    if (newSelected.has(propertyId)) {
      newSelected.delete(propertyId);
    } else {
      if (newSelected.size >= 4) {
        // Limit to 4 properties for comparison
        return;
      }
      newSelected.add(propertyId);
    }
    setSelectedForComparison(newSelected);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      priceRange: [0, 2000000000],
      areaRange: [0, 1000],
      bedrooms: [],
      bathrooms: [],
      propertyTypes: [],
      neighborhoods: [],
      cities: [],
      features: [],
      strata: []
    });
    setCurrentPage(1);
  };

  const activeFiltersCount = Object.values(filters).reduce((count, filter) => {
    if (Array.isArray(filter)) {
      return count + filter.length;
    } else if (typeof filter === 'string') {
      return count + (filter ? 1 : 0);
    } else if (Array.isArray(filter) && filter.length === 2) {
      // For ranges, count if different from defaults
      return count + ((filter[0] !== 0 || filter[1] !== 2000000000) ? 1 : 0);
    }
    return count;
  }, 0);

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Buscar</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Buscar por título o ubicación..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10"
          />
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label>Rango de Precio (COP)</Label>
        <div className="px-2">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
            max={2000000000}
            min={0}
            step={50000000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>${(filters.priceRange[0] / 1000000).toFixed(0)}M</span>
            <span>${(filters.priceRange[1] / 1000000).toFixed(0)}M</span>
          </div>
        </div>
      </div>

      {/* Area Range */}
      <div className="space-y-2">
        <Label>Rango de Área (m²)</Label>
        <div className="px-2">
          <Slider
            value={filters.areaRange}
            onValueChange={(value) => setFilters(prev => ({ ...prev, areaRange: value as [number, number] }))}
            max={1000}
            min={0}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>{filters.areaRange[0]}m²</span>
            <span>{filters.areaRange[1]}m²</span>
          </div>
        </div>
      </div>

      {/* Bedrooms */}
      <div className="space-y-2">
        <Label>Habitaciones</Label>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4, 5].map(num => (
            <div key={num} className="flex items-center space-x-2">
              <Checkbox
                id={`bed-${num}`}
                checked={filters.bedrooms.includes(num)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilters(prev => ({ ...prev, bedrooms: [...prev.bedrooms, num] }));
                  } else {
                    setFilters(prev => ({ ...prev, bedrooms: prev.bedrooms.filter(b => b !== num) }));
                  }
                }}
              />
              <Label htmlFor={`bed-${num}`} className="text-sm">{num}+</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div className="space-y-2">
        <Label>Baños</Label>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="flex items-center space-x-2">
              <Checkbox
                id={`bath-${num}`}
                checked={filters.bathrooms.includes(num)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilters(prev => ({ ...prev, bathrooms: [...prev.bathrooms, num] }));
                  } else {
                    setFilters(prev => ({ ...prev, bathrooms: prev.bathrooms.filter(b => b !== num) }));
                  }
                }}
              />
              <Label htmlFor={`bath-${num}`} className="text-sm">{num}+</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Property Types */}
      <div className="space-y-2">
        <Label>Tipo de Propiedad</Label>
        <div className="space-y-2">
          {[
            { value: 'apartment', label: 'Apartamento' },
            { value: 'house', label: 'Casa' },
            { value: 'townhouse', label: 'Casa Campestre' },
            { value: 'office', label: 'Oficina' },
            { value: 'commercial', label: 'Local Comercial' }
          ].map(type => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type.value}`}
                checked={filters.propertyTypes.includes(type.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilters(prev => ({ ...prev, propertyTypes: [...prev.propertyTypes, type.value] }));
                  } else {
                    setFilters(prev => ({ ...prev, propertyTypes: prev.propertyTypes.filter(t => t !== type.value) }));
                  }
                }}
              />
              <Label htmlFor={`type-${type.value}`} className="text-sm">{type.label}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Cities */}
      <div className="space-y-2">
        <Label>Ciudad</Label>
        <div className="space-y-2">
          {['Medellín', 'Envigado', 'Sabaneta', 'Itagüí', 'Bello'].map(city => (
            <div key={city} className="flex items-center space-x-2">
              <Checkbox
                id={`city-${city}`}
                checked={filters.cities.includes(city)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilters(prev => ({ ...prev, cities: [...prev.cities, city] }));
                  } else {
                    setFilters(prev => ({ ...prev, cities: prev.cities.filter(c => c !== city) }));
                  }
                }}
              />
              <Label htmlFor={`city-${city}`} className="text-sm">{city}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" onClick={clearFilters} className="w-full">
        Limpiar Filtros
      </Button>
    </div>
  );

  if (showComparison && selectedForComparison.size > 0) {
    const comparisonProperties = mockProperties.filter(p => selectedForComparison.has(p.id));
    return (
      <PropertyComparison
        properties={comparisonProperties}
        onRemoveProperty={(id) => {
          setSelectedForComparison(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }}
        onClearAll={() => setSelectedForComparison(new Set())}
        onViewProperty={onPropertyClick}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Descubrir Propiedades</h2>
          <p className="text-muted-foreground">
            {filteredAndSortedProperties.length} propiedades encontradas
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Compare Mode Toggle */}
          <Button
            variant={isCompareMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setIsCompareMode(!isCompareMode);
              setSelectedForComparison(new Set());
            }}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Comparar
          </Button>

          {/* View Mode */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Compare Bar */}
      {isCompareMode && selectedForComparison.size > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="font-medium">
                  {selectedForComparison.size} propiedad{selectedForComparison.size !== 1 ? 'es' : ''} seleccionada{selectedForComparison.size !== 1 ? 's' : ''} para comparar
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedForComparison(new Set())}
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowComparison(true)}
                  disabled={selectedForComparison.size < 2}
                >
                  Comparar Ahora
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort and Results */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-48">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Más recientes</SelectItem>
              <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
              <SelectItem value="area-asc">Área: menor a mayor</SelectItem>
              <SelectItem value="area-desc">Área: mayor a menor</SelectItem>
              <SelectItem value="views-desc">Más vistas</SelectItem>
            </SelectContent>
          </Select>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpiar filtros ({activeFiltersCount})
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          Mostrando {paginatedProperties.length} de {filteredAndSortedProperties.length} propiedades
        </div>
      </div>

      {/* Properties Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'grid'
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-1'
      }`}>
        {paginatedProperties.map((property) => {
          // Check if current user is the owner
          const isOwner = user?.id === property.owner_id;
          
          return (
            <PropertyCard
              key={property.id}
              id={property.id}
              title={property.title}
              area={typeof property.area === 'string' ? property.area : `${property.area}m²`}
              location={property.location || `${property.neighborhood}, ${property.city}`}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              price={typeof property.price === 'string' ? property.price : `$${property.price.toLocaleString()}`}
              image={property.image || property.images?.[0]}
              rating={4.5}
              isFavorite={isFavorited(property.id)}
              onFavorite={handleFavoriteToggle}
              onView={handlePropertyClick}
              verified={property.verified}
              isOwner={isOwner}
              onScheduleVisit={!isOwner && user ? handleScheduleVisit : undefined}
              onContactOwner={!isOwner && user ? handleContactOwner : undefined}
              viewsCount={property.views_count}
              favoritesCount={property.favorites_count}
              isCompareMode={isCompareMode}
              isSelectedForComparison={selectedForComparison.has(property.id)}
              onCompareToggle={handleCompareToggle}
            />
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className="w-10"
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedProperties.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron propiedades</h3>
              <p className="text-muted-foreground mb-4">
                Prueba ajustando los filtros para encontrar más opciones
              </p>
              <Button onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visit Scheduling Modal */}
      {selectedPropertyForVisit && (
        <ScheduleVisitModal
          open={visitModalOpen}
          onOpenChange={setVisitModalOpen}
          propertyTitle={selectedPropertyForVisit.title}
          propertyId={selectedPropertyForVisit.id}
          onVisitScheduled={handleVisitScheduled}
        />
      )}
    </div>
  );
}

export default PropertyDiscoveryView;
