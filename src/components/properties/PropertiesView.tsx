import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { PropertyCard } from '../PropertyCard';
import { PropertiesMapView } from '../maps/PropertiesMapView';
import { useFavorites } from '../../hooks/useFavorites';
import { useAllProperties } from '../../hooks/useSupabase';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/format';
import {
  SlidersHorizontal,
  Grid3X3,
  List,
  Map,
  Search,
  ArrowUpDown,
  X,
} from 'lucide-react';

interface Filters {
  search: string;
  listingTypes: ('sale' | 'rental')[];
  priceRange: [number, number];
  areaRange: [number, number];
  bedrooms: number[];
  bathrooms: number[];
  propertyTypes: string[];
  cities: string[];
  neighborhoods: string[];
  features: string[];
  acceptsCrypto: boolean | null;
}

const COMMON_FEATURES = [
  'Piscina',
  'Gimnasio',
  'Portería',
  'Terraza',
  'Jardín',
  'Ascensor',
  'Parqueadero',
  'Cuarto de servicio',
  'Estudio',
  'Jacuzzi',
  'WiFi',
  'Seguridad 24h',
  'Cancha de tenis',
  'Salón social',
];

const FEATURE_I18N_KEY: Record<string, string> = {
  'Piscina': 'properties.features.pool',
  'Gimnasio': 'properties.features.gym',
  'Portería': 'properties.features.doorman',
  'Terraza': 'properties.features.terrace',
  'Jardín': 'properties.features.garden',
  'Ascensor': 'properties.features.elevator',
  'Parqueadero': 'properties.features.parking',
  'Cuarto de servicio': 'properties.features.serviceRoom',
  'Estudio': 'properties.features.study',
  'Jacuzzi': 'properties.features.jacuzzi',
  'WiFi': 'properties.features.wifi',
  'Seguridad 24h': 'properties.features.security24h',
  'Cancha de tenis': 'properties.features.tennisCourt',
  'Salón social': 'properties.features.socialRoom',
};

export interface PropertiesViewProps {
  /** When set (e.g. inside dashboard), property detail opens in-place instead of navigating to /properties/:id */
  onPropertyClick?: (propertyId: string) => void;
}

export function PropertiesView({ onPropertyClick: onPropertyClickProp }: PropertiesViewProps = {}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { properties: allProperties, loading: allPropertiesLoading } = useAllProperties(user?.id); // add , 'rental' to filter rentals only
  const { addToFavorites, removeFromFavorites, isFavorited } = useFavorites();

  const [filters, setFilters] = useState<Filters>({
    search: '',
    listingTypes: [],
    priceRange: [0, 2000000000],
    areaRange: [0, 1000],
    bedrooms: [],
    bathrooms: [],
    propertyTypes: [],
    cities: [],
    neighborhoods: [],
    features: [],
    acceptsCrypto: null,
  });

  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'area-asc' | 'area-desc' | 'date-desc'>('date-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [propertiesPerPage] = useState(12);
  const [uniqueCities, setUniqueCities] = useState<string[]>([]);
  const [uniqueNeighborhoods, setUniqueNeighborhoods] = useState<string[]>([]);

  // Fetch unique cities and neighborhoods
  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await supabase
        .from('properties')
        .select('city, neighborhood')
        .eq('status', 'published');

      if (data) {
        const cities = [...new Set(data.map(p => p.city))].filter(Boolean).sort();
        const neighborhoods = [...new Set(data.map(p => p.neighborhood))].filter(Boolean).sort();
        setUniqueCities(cities);
        setUniqueNeighborhoods(neighborhoods);
      }
    };
    fetchLocations();
  }, []);

  // Transform properties to match our interface
  const transformedProperties = useMemo(() => {
    if (!allProperties || allProperties.length === 0) return [];

    return allProperties.map((property: any) => ({
      id: property.id,
      title: property.title,
      area: `${property.area}m²`,
      area_value: property.area,
      location: `${property.neighborhood}, ${property.city}`,
      neighborhood: property.neighborhood,
      city: property.city,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      listing_type: (property.listing_type as 'sale' | 'rental') || 'sale',
      price: (property.listing_type === 'rental' ? (property.rent_monthly ?? 0) : (property.price ?? 0)).toString(),
      price_value: property.listing_type === 'rental' ? Number(property.rent_monthly ?? 0) : Number(property.price ?? 0),
      price_label:
        property.listing_type === 'rental'
          ? formatCurrency(Number(property.rent_monthly ?? 0)) + t('properties.perMonth')
          : formatCurrency(Number(property.price ?? 0)),
      image: Array.isArray(property.images) && property.images.length > 0 ? property.images[0] : '',
      verified: property.verified,
      premium: property.premium,
      acceptsCrypto: property.accepts_crypto || false,
      property_type: property.property_type,
      features: property.features || [],
      created_at: property.created_at,
      isOwner: property.isOwner || false,
      coordinates: property.coordinates,
      images: property.images || [],
    }));
  }, [allProperties, t]);

  // Filter and sort properties (exclude current user's properties — those are in "Mis propiedades")
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = transformedProperties.filter(property => {
      // Only show other users' properties in the explorer
      if (property.isOwner) return false;

      // Listing type
      if (filters.listingTypes.length > 0 && !filters.listingTypes.includes(property.listing_type)) {
        return false;
      }

      // Search filter
      const searchText = filters.search?.toLowerCase();
      if (searchText) {
        const searchableText = [
          property.title,
          property.location,
          property.neighborhood,
          property.city,
        ].join(' ').toLowerCase();

        if (!searchableText.includes(searchText)) {
          return false;
        }
      }

      // Price range
      if (property.price_value < filters.priceRange[0] || property.price_value > filters.priceRange[1]) {
        return false;
      }

      // Area range
      if (property.area_value < filters.areaRange[0] || property.area_value > filters.areaRange[1]) {
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

      // Neighborhoods
      if (filters.neighborhoods.length > 0 && !filters.neighborhoods.includes(property.neighborhood)) {
        return false;
      }

      // Features
      if (filters.features.length > 0) {
        const hasFeature = filters.features.some(feature =>
          property.features.some((propFeature: string) =>
            propFeature.toLowerCase().includes(feature.toLowerCase())
          )
        );
        if (!hasFeature) return false;
      }

      // Accepts Crypto
      if (filters.acceptsCrypto !== null && property.acceptsCrypto !== filters.acceptsCrypto) {
        return false;
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
        default:
          return 0;
      }
    });

    return filtered;
  }, [transformedProperties, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProperties.length / propertiesPerPage);
  const paginatedProperties = filteredAndSortedProperties.slice(
    (currentPage - 1) * propertiesPerPage,
    currentPage * propertiesPerPage
  );

  const handlePropertyClick = (propertyId: string) => {
    if (onPropertyClickProp) {
      onPropertyClickProp(propertyId);
    } else {
      navigate(`/properties/${propertyId}`);
    }
  };

  const handleFavoriteToggle = async (propertyId: string) => {
    if (isFavorited(propertyId)) {
      await removeFromFavorites(propertyId);
    } else {
      await addToFavorites(propertyId);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      listingTypes: [],
      priceRange: [0, 2000000000],
      areaRange: [0, 1000],
      bedrooms: [],
      bathrooms: [],
      propertyTypes: [],
      cities: [],
      neighborhoods: [],
      features: [],
      acceptsCrypto: null,
    });
    setCurrentPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    count += filters.listingTypes.length;
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 2000000000) count++;
    if (filters.areaRange[0] !== 0 || filters.areaRange[1] !== 1000) count++;
    count += filters.bedrooms.length;
    count += filters.bathrooms.length;
    count += filters.propertyTypes.length;
    count += filters.cities.length;
    count += filters.neighborhoods.length;
    count += filters.features.length;
    if (filters.acceptsCrypto !== null) count++;
    return count;
  }, [filters]);

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">{t('common.search')}</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder={t('properties.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10"
          />
        </div>
      </div>

      {/* Listing Type */}
      <div className="space-y-2">
        <Label>{t('properties.type')}</Label>
        <div className="space-y-2">
          {[
            { value: 'sale' as const, label: t('properties.listingTypes.sale') },
            { value: 'rental' as const, label: t('properties.listingTypes.rental') },
          ].map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2">
              <Checkbox
                id={`listing-${opt.value}`}
                checked={filters.listingTypes.includes(opt.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilters((prev) => ({ ...prev, listingTypes: [...prev.listingTypes, opt.value] }));
                  } else {
                    setFilters((prev) => ({ ...prev, listingTypes: prev.listingTypes.filter((t) => t !== opt.value) }));
                  }
                }}
              />
              <Label htmlFor={`listing-${opt.value}`} className="text-sm">
                {opt.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label>{t('properties.priceRangeCop')}</Label>
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
        <Label>{t('properties.areaRangeM2')}</Label>
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
        <Label>{t('properties.bedrooms')}</Label>
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
        <Label>{t('properties.bathrooms')}</Label>
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
        <Label>{t('properties.propertyType')}</Label>
        <div className="space-y-2">
          {[
            { value: 'apartment', label: t('properties.types.apartment') },
            { value: 'house', label: t('properties.types.house') },
            { value: 'townhouse', label: t('properties.types.countryHouse') },
            { value: 'office', label: t('properties.types.office') },
            { value: 'commercial', label: t('properties.types.commercial') }
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
      {uniqueCities.length > 0 && (
        <div className="space-y-2">
          <Label>{t('properties.city')}</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {uniqueCities.map(city => (
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
      )}

      {/* Features */}
      <div className="space-y-2">
        <Label>{t('properties.amenities')}</Label>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {COMMON_FEATURES.map(feature => (
            <div key={feature} className="flex items-center space-x-2">
              <Checkbox
                id={`feature-${feature}`}
                checked={filters.features.includes(feature)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilters(prev => ({ ...prev, features: [...prev.features, feature] }));
                  } else {
                    setFilters(prev => ({ ...prev, features: prev.features.filter(f => f !== feature) }));
                  }
                }}
              />
              <Label htmlFor={`feature-${feature}`} className="text-sm">{t(FEATURE_I18N_KEY[feature] ?? feature)}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Accepts Crypto */}
      <div className="space-y-2">
        <Label>{t('properties.paymentMethods')}</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="crypto"
              checked={filters.acceptsCrypto === true}
              onCheckedChange={(checked) => {
                setFilters(prev => ({ ...prev, acceptsCrypto: checked ? true : null }));
              }}
            />
            <Label htmlFor="crypto" className="text-sm">{t('properties.acceptsCryptocurrency')}</Label>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" onClick={clearFilters} className="w-full">
        {t('common.clearFilters')}
      </Button>
    </div>
  );

  if (allPropertiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">{t('properties.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {t('properties.exploreTitle')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('properties.found', { count: filteredAndSortedProperties.length })}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* View Mode */}
          <div className="flex p-1 bg-secondary/50 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
              aria-label={t('properties.gridView')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
              aria-label={t('properties.listView')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="h-8 w-8 p-0"
              aria-label={t('properties.mapView')}
            >
              <Map className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {t('properties.filters')}
                {activeFiltersCount > 0 && (
                  <Badge variant="default" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto scrollbar-thin">
              <SheetHeader>
                <SheetTitle>{t('properties.filters')}</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Sort and Results */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-48">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">{t('properties.sortOptions.newest')}</SelectItem>
              <SelectItem value="price-asc">{t('properties.sortOptions.priceAsc')}</SelectItem>
              <SelectItem value="price-desc">{t('properties.sortOptions.priceDesc')}</SelectItem>
              <SelectItem value="area-asc">{t('properties.sortOptions.areaAsc')}</SelectItem>
              <SelectItem value="area-desc">{t('properties.sortOptions.areaDesc')}</SelectItem>
            </SelectContent>
          </Select>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              {t('properties.clearFiltersCount', { count: activeFiltersCount })}
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          {t('properties.showingOf', { shown: paginatedProperties.length, total: filteredAndSortedProperties.length })}
        </div>
      </div>

      {/* Properties Display */}
      {viewMode === 'map' ? (
        <PropertiesMapView
          properties={filteredAndSortedProperties.map(prop => ({
            id: prop.id,
            title: prop.title,
            address: prop.location,
            neighborhood: prop.neighborhood,
            city: prop.city,
            price: prop.price_value,
            coordinates: prop.coordinates,
            images: prop.images || (prop.image ? [prop.image] : []),
            verified: prop.verified,
            premium: prop.premium,
          }))}
          height="600px"
          onPropertyClick={handlePropertyClick}
        />
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        }`}>
          {paginatedProperties.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              title={property.title}
              area={property.area}
              location={property.location}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              price={property.price}
              priceLabel={property.price_label}
              listingType={property.listing_type}
              image={property.image}
              rating={4.5}
              isFavorite={isFavorited(property.id)}
              onFavorite={handleFavoriteToggle}
              onView={handlePropertyClick}
              verified={property.verified}
              premium={property.premium}
              acceptsCrypto={property.acceptsCrypto}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="h-9"
          >
            {t('common.previous')}
          </Button>

          <div className="flex items-center gap-1 mx-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // Show first, last, current, and adjacent pages
                if (page === 1 || page === totalPages) return true;
                if (Math.abs(page - currentPage) <= 1) return true;
                return false;
              })
              .map((page, index, array) => {
                // Add ellipsis
                const showEllipsis = index > 0 && page - array[index - 1] > 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="h-9 w-9 p-0"
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                );
              })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="h-9"
          >
            {t('common.next')}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedProperties.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t('properties.noProperties')}
            </h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              {t('properties.noMatchHint')}
            </p>
            <Button onClick={clearFilters} variant="outline">
              <X className="h-4 w-4 mr-2" />
              {t('properties.clearAllFilters')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
