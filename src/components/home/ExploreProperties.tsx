import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PropertyGrid } from './PropertyGrid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Property } from '../../types/entities';
import { supabase } from '../../lib/supabase';
import {
  Map,
  Grid3X3,
  List,
  Filter,
  MapPin,
  TrendingUp,
  Star,
  ArrowRight,
  Search,
  SlidersHorizontal,
  X,
  Home,
  Building2,
  Briefcase,
  Store,
  Bed,
  Bath,
  Car,
  Ruler,
  Wifi,
  Shield,
  Zap,
  Droplets
} from 'lucide-react';

interface SearchFilters {
  location: string;
  propertyType: string;
  priceRange: [number, number];
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  parking?: number;
  features?: string[];
  verified?: boolean;
  premium?: boolean;
}

interface ExplorePropertiesProps {
  onPropertySelect?: (propertyId: string) => void;
  onViewAllProperties?: () => void;
}

export const ExploreProperties: React.FC<ExplorePropertiesProps> = ({
  onPropertySelect,
  onViewAllProperties
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    location: '',
    propertyType: 'all',
    priceRange: [0, 10000000000]
  });

  const propertyTypes = [
    { value: 'all', label: 'Todos los tipos', icon: Home },
    { value: 'apartment', label: 'Apartamentos', icon: Building2 },
    { value: 'house', label: 'Casas', icon: Home },
    { value: 'office', label: 'Oficinas', icon: Briefcase },
    { value: 'commercial', label: 'Locales', icon: Store },
  ];

  const priceRanges = [
    { label: 'Cualquier precio', value: [0, 10000000000] },
    { label: 'Hasta $300M', value: [0, 300000000] },
    { label: '$300M - $600M', value: [300000000, 600000000] },
    { label: '$600M - $1B', value: [600000000, 1000000000] },
    { label: '$1B - $2B', value: [1000000000, 2000000000] },
    { label: '$2B+', value: [2000000000, 10000000000] },
  ];

  const features = [
    { value: 'Piscina', icon: Droplets },
    { value: 'Gimnasio', icon: Zap },
    { value: 'Portería', icon: Shield },
    { value: 'Terraza', icon: Home },
    { value: 'Jardín', icon: Home },
    { value: 'Ascensor', icon: ArrowRight },
    { value: 'Parqueadero', icon: Car },
    { value: 'Cuarto de servicio', icon: Home },
    { value: 'Estudio', icon: Home },
    { value: 'Jacuzzi', icon: Droplets },
    { value: 'WiFi', icon: Wifi },
  ];

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error fetching properties:', error);
          setProperties([]);
        } else {
          setProperties(data as Property[] || []);
        }
      } catch (err) {
        console.error('Unexpected error fetching properties:', err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Apply filters when properties or filters change
  useEffect(() => {
    let filtered = [...properties];

    // Location filter
    if (searchFilters.location) {
      const locationLower = searchFilters.location.toLowerCase();
      filtered = filtered.filter(property =>
        property.city.toLowerCase().includes(locationLower) ||
        property.neighborhood.toLowerCase().includes(locationLower) ||
        property.address.toLowerCase().includes(locationLower)
      );
    }

    // Property type filter
    if (searchFilters.propertyType !== 'all') {
      filtered = filtered.filter(property => property.property_type === searchFilters.propertyType);
    }

    // Price range filter
    filtered = filtered.filter(property =>
      property.price >= searchFilters.priceRange[0] &&
      property.price <= searchFilters.priceRange[1]
    );

    // Bedrooms filter
    if (searchFilters.bedrooms && searchFilters.bedrooms > 0) {
      filtered = filtered.filter(property => property.bedrooms >= searchFilters.bedrooms!);
    }

    // Bathrooms filter
    if (searchFilters.bathrooms && searchFilters.bathrooms > 0) {
      filtered = filtered.filter(property => property.bathrooms >= searchFilters.bathrooms!);
    }

    // Parking filter
    if (searchFilters.parking && searchFilters.parking > 0) {
      filtered = filtered.filter(property => property.parking >= searchFilters.parking!);
    }

    // Area filters
    if (searchFilters.minArea && searchFilters.minArea > 0) {
      filtered = filtered.filter(property => property.area >= searchFilters.minArea!);
    }
    if (searchFilters.maxArea && searchFilters.maxArea > 0) {
      filtered = filtered.filter(property => property.area <= searchFilters.maxArea!);
    }

    // Features filter
    if (searchFilters.features && searchFilters.features.length > 0) {
      filtered = filtered.filter(property =>
        searchFilters.features!.some(feature =>
          property.features?.some(propFeature =>
            propFeature.toLowerCase().includes(feature.toLowerCase())
          )
        )
      );
    }

    // Verified filter
    if (searchFilters.verified) {
      filtered = filtered.filter(property => property.verified);
    }

    // Premium filter
    if (searchFilters.premium) {
      filtered = filtered.filter(property => property.premium);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'area':
        filtered.sort((a, b) => b.area - a.area);
        break;
      case 'bedrooms':
        filtered.sort((a, b) => b.bedrooms - a.bedrooms);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    setFilteredProperties(filtered);
  }, [properties, searchFilters, sortBy]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleFeature = (feature: string) => {
    const currentFeatures = searchFilters.features || [];
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    handleFilterChange('features', newFeatures);
  };

  const clearFilters = () => {
    setSearchFilters({
      location: '',
      propertyType: 'all',
      priceRange: [0, 10000000000]
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchFilters.location) count++;
    if (searchFilters.propertyType !== 'all') count++;
    if (searchFilters.priceRange[0] > 0 || searchFilters.priceRange[1] < 10000000000) count++;
    if (searchFilters.bedrooms && searchFilters.bedrooms > 0) count++;
    if (searchFilters.bathrooms && searchFilters.bathrooms > 0) count++;
    if (searchFilters.parking && searchFilters.parking > 0) count++;
    if (searchFilters.minArea && searchFilters.minArea > 0) count++;
    if (searchFilters.maxArea && searchFilters.maxArea > 0) count++;
    if (searchFilters.features && searchFilters.features.length > 0) count++;
    if (searchFilters.verified) count++;
    if (searchFilters.premium) count++;
    return count;
  };

  const handlePropertySelect = (propertyId: string) => {
    onPropertySelect?.(propertyId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const convertProperties = (props: Property[]) => {
    return props.map(prop => ({
      id: prop.id,
      title: prop.title,
      area: `${prop.area} m²`,
      location: `${prop.neighborhood}, ${prop.city}`,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      price: formatPrice(prop.price),
      image: prop.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      rating: 4.2 + Math.random() * 0.8,
      verified: prop.verified,
      premium: prop.premium
    }));
  };

  const stats = [
    {
      label: 'Propiedades',
      value: properties.length.toString(),
      icon: MapPin,
      color: 'text-blue-600'
    },
    {
      label: 'Precio Promedio',
      value: properties.length > 0
        ? formatPrice(properties.reduce((sum, p) => sum + p.price, 0) / properties.length)
        : '$0',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Verificadas',
      value: properties.filter(p => p.verified).length.toString(),
      icon: Star,
      color: 'text-yellow-600'
    }
  ];

  const activeFiltersCount = getActiveFiltersCount();
  const selectedPropertyType = propertyTypes.find(type => type.value === searchFilters.propertyType);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Explora Propiedades
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encuentra la propiedad perfecta con nuestros filtros avanzados y vista de mapa
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                  <div className={`w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Advanced Search Filters */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Basic Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Ubicación
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ciudad, barrio o dirección"
                  value={searchFilters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Tipo de Propiedad
              </label>
              <select
                value={searchFilters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {propertyTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Rango de Precio
              </label>
              <select
                value={`${searchFilters.priceRange[0]}-${searchFilters.priceRange[1]}`}
                onChange={(e) => {
                  const selected = priceRanges.find(range =>
                    `${range.value[0]}-${range.value[1]}` === e.target.value
                  );
                  if (selected) handleFilterChange('priceRange', selected.value);
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {priceRanges.map((range, index) => (
                  <option key={index} value={`${range.value[0]}-${range.value[1]}`}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Más recientes</option>
                <option value="price-low">Precio: menor a mayor</option>
                <option value="price-high">Precio: mayor a menor</option>
                <option value="area">Mayor área</option>
                <option value="bedrooms">Más habitaciones</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros avanzados</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            <div className="flex items-center space-x-4">
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}

              {/* View Mode Controls */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Vista:</span>
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3 py-1"
                  >
                    <Grid3X3 className="w-4 h-4 mr-1" />
                    Cuadrícula
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3 py-1"
                  >
                    <List className="w-4 h-4 mr-1" />
                    Lista
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('map')}
                    className="px-3 py-1"
                  >
                    <Map className="w-4 h-4 mr-1" />
                    Mapa
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <motion.div
              className="border-t border-gray-200 pt-6 mt-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Bedrooms */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Bed className="w-4 h-4 mr-2" />
                    Habitaciones mínimas
                  </label>
                  <select
                    value={searchFilters.bedrooms || ''}
                    onChange={(e) => handleFilterChange('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Cualquiera</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                {/* Bathrooms */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Bath className="w-4 h-4 mr-2" />
                    Baños mínimos
                  </label>
                  <select
                    value={searchFilters.bathrooms || ''}
                    onChange={(e) => handleFilterChange('bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Cualquiera</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                {/* Parking */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Car className="w-4 h-4 mr-2" />
                    Parqueaderos mínimos
                  </label>
                  <select
                    value={searchFilters.parking || ''}
                    onChange={(e) => handleFilterChange('parking', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Cualquiera</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                {/* Area Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Ruler className="w-4 h-4 mr-2" />
                    Área (m²)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={searchFilters.minArea || ''}
                      onChange={(e) => handleFilterChange('minArea', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      value={searchFilters.maxArea || ''}
                      onChange={(e) => handleFilterChange('maxArea', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Características
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {features.map((feature) => {
                    const Icon = feature.icon;
                    const isSelected = (searchFilters.features || []).includes(feature.value);
                    return (
                      <button
                        key={feature.value}
                        onClick={() => toggleFeature(feature.value)}
                        className={`flex items-center p-3 border rounded-lg text-sm transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{feature.value}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Special Filters */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={searchFilters.verified || false}
                    onChange={(e) => handleFilterChange('verified', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm text-gray-700">Solo propiedades verificadas</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={searchFilters.premium || false}
                    onChange={(e) => handleFilterChange('premium', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm text-gray-700">Solo propiedades premium</span>
                </label>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Propiedades Disponibles
              {filteredProperties.length !== properties.length && (
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({filteredProperties.length} de {properties.length})
                </span>
              )}
            </h3>
            <p className="text-gray-600">
              {filteredProperties.length === properties.length
                ? 'Descubre todas las propiedades disponibles'
                : 'Resultados filtrados según tus criterios'
              }
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {viewMode === 'map' && (
              <Badge variant="secondary" className="px-4 py-2">
                <Map className="w-4 h-4 mr-2" />
                Vista de mapa próximamente
              </Badge>
            )}
            <Button
              onClick={onViewAllProperties}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Ver Todas
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* Properties Display */}
        {viewMode !== 'map' ? (
          <PropertyGrid
            properties={convertProperties(filteredProperties.slice(0, 12))}
            loading={loading}
            viewMode={viewMode}
            onPropertySelect={handlePropertySelect}
            sortBy={sortBy}
            onSortChange={setSortBy}
            showFilters={false}
          />
        ) : (
          <motion.div
            className="bg-gray-100 rounded-2xl h-96 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Vista de Mapa
              </h3>
              <p className="text-gray-600 max-w-md">
                Próximamente podrás explorar propiedades directamente en el mapa
                para una experiencia más inmersiva.
              </p>
            </div>
          </motion.div>
        )}

        {/* View All Button */}
        {filteredProperties.length > 12 && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Button
              onClick={onViewAllProperties}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4"
            >
              Ver Todas las Propiedades
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};
