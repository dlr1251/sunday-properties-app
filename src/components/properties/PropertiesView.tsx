import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { PropertyCard } from '../PropertyCard';
import { formatArea, formatListingPrice, getListingPriceValue } from '../../utils/format';
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

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches : false
  );

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [breakpoint]);

  return isMobile;
}

function FilterCheckRow({
  id,
  checked,
  onCheckedChange,
  children,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-11 items-center gap-3">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id} className="flex-1 cursor-pointer py-2 text-sm leading-snug text-foreground">
        {children}
      </Label>
    </div>
  );
}

export interface PropertiesViewProps {
  /** When set (e.g. inside dashboard), property detail opens in-place instead of navigating to /properties/:id */
  onPropertyClick?: (propertyId: string) => void;
}

export function PropertiesView({ onPropertyClick: onPropertyClickProp }: PropertiesViewProps = {}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { properties: allProperties, loading: allPropertiesLoading } = useAllProperties(user?.id); // add , 'rental' to filter rentals only
  const { addToFavorites, removeFromFavorites, isFavorited } = useFavorites();

  const listingTypeParam = searchParams.get('listing_type');
  const cityParam = searchParams.get('city') || '';
  const neighborhoodParam = searchParams.get('neighborhood') || '';
  const typeParam = searchParams.get('type') || '';
  const qParam = searchParams.get('q') || '';

  const [filters, setFilters] = useState<Filters>({
    search: qParam,
    listingTypes:
      listingTypeParam === 'rental' || listingTypeParam === 'sale' ? [listingTypeParam] : [],
    priceRange: [0, 2000000000],
    areaRange: [0, 1000],
    bedrooms: [],
    bathrooms: [],
    propertyTypes: typeParam && typeParam !== 'all' ? [typeParam] : [],
    cities: cityParam ? [cityParam] : [],
    neighborhoods: neighborhoodParam ? [neighborhoodParam] : [],
    features: [],
    acceptsCrypto: null,
  });

  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'area-asc' | 'area-desc' | 'date-desc'>('date-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [propertiesPerPage] = useState(12);
  const [uniqueCities, setUniqueCities] = useState<string[]>([]);
  const [uniqueNeighborhoods, setUniqueNeighborhoods] = useState<string[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    const listingType = searchParams.get('listing_type');
    const city = searchParams.get('city') || '';
    const neighborhood = searchParams.get('neighborhood') || '';
    const type = searchParams.get('type') || '';
    const q = searchParams.get('q') || '';
    setFilters((prev) => ({
      ...prev,
      search: q,
      listingTypes: listingType === 'rental' || listingType === 'sale' ? [listingType] : [],
      propertyTypes: type && type !== 'all' ? [type] : [],
      cities: city ? [city] : [],
      neighborhoods: neighborhood ? [neighborhood] : [],
    }));
    setCurrentPage(1);
  }, [searchParams]);

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
      slug: property.slug,
      title: property.title,
      area: formatArea(property.area),
      area_value: property.area,
      location: `${property.neighborhood}, ${property.city}`,
      neighborhood: property.neighborhood,
      city: property.city,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      listing_type: (property.listing_type as 'sale' | 'rental') || 'sale',
      price: String(getListingPriceValue(property) ?? 0),
      price_value: getListingPriceValue(property) ?? 0,
      price_label:
        getListingPriceValue(property) == null
          ? formatListingPrice(property)
          : property.listing_type === 'rental'
            ? formatCurrency(getListingPriceValue(property) as number) + t('properties.perMonth')
            : formatCurrency(getListingPriceValue(property) as number),
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

      if (filters.cities.length > 0) {
        const wanted = filters.cities.map((value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase());
        const city = (property.city || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (!wanted.some((value) => city.includes(value) || value.includes(city))) return false;
      }

      if (filters.neighborhoods.length > 0) {
        const wanted = filters.neighborhoods.map((value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase());
        const neighborhood = (property.neighborhood || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (!wanted.some((value) => neighborhood.includes(value) || value.includes(neighborhood))) return false;
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
    <div className="space-y-6 pb-8">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">{t('common.search')}</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            placeholder={t('properties.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="h-11 pl-10 text-base"
          />
        </div>
      </div>

      {/* Listing Type */}
      <div className="space-y-2">
        <Label>{t('properties.type')}</Label>
        <div className="space-y-1">
          {[
            { value: 'sale' as const, label: t('properties.listingTypes.sale') },
            { value: 'rental' as const, label: t('properties.listingTypes.rental') },
          ].map((opt) => (
            <FilterCheckRow
              key={opt.value}
              id={`listing-${opt.value}`}
              checked={filters.listingTypes.includes(opt.value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setFilters((prev) => ({ ...prev, listingTypes: [...prev.listingTypes, opt.value] }));
                } else {
                  setFilters((prev) => ({ ...prev, listingTypes: prev.listingTypes.filter((t) => t !== opt.value) }));
                }
              }}
            >
              {opt.label}
            </FilterCheckRow>
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
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {[1, 2, 3, 4, 5].map(num => (
            <FilterCheckRow
              key={num}
              id={`bed-${num}`}
              checked={filters.bedrooms.includes(num)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setFilters(prev => ({ ...prev, bedrooms: [...prev.bedrooms, num] }));
                } else {
                  setFilters(prev => ({ ...prev, bedrooms: prev.bedrooms.filter(b => b !== num) }));
                }
              }}
            >
              {num}+
            </FilterCheckRow>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div className="space-y-2">
        <Label>{t('properties.bathrooms')}</Label>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {[1, 2, 3, 4].map(num => (
            <FilterCheckRow
              key={num}
              id={`bath-${num}`}
              checked={filters.bathrooms.includes(num)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setFilters(prev => ({ ...prev, bathrooms: [...prev.bathrooms, num] }));
                } else {
                  setFilters(prev => ({ ...prev, bathrooms: prev.bathrooms.filter(b => b !== num) }));
                }
              }}
            >
              {num}+
            </FilterCheckRow>
          ))}
        </div>
      </div>

      {/* Property Types */}
      <div className="space-y-2">
        <Label>{t('properties.propertyType')}</Label>
        <div className="space-y-1">
          {[
            { value: 'apartment', label: t('properties.types.apartment') },
            { value: 'house', label: t('properties.types.house') },
            { value: 'townhouse', label: t('properties.types.countryHouse') },
            { value: 'office', label: t('properties.types.office') },
            { value: 'commercial', label: t('properties.types.commercial') }
          ].map(type => (
            <FilterCheckRow
              key={type.value}
              id={`type-${type.value}`}
              checked={filters.propertyTypes.includes(type.value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setFilters(prev => ({ ...prev, propertyTypes: [...prev.propertyTypes, type.value] }));
                } else {
                  setFilters(prev => ({ ...prev, propertyTypes: prev.propertyTypes.filter(t => t !== type.value) }));
                }
              }}
            >
              {type.label}
            </FilterCheckRow>
          ))}
        </div>
      </div>

      {/* Cities */}
      {uniqueCities.length > 0 && (
        <div className="space-y-2">
          <Label>{t('properties.city')}</Label>
          <div className="max-h-40 space-y-1 overflow-y-auto">
            {uniqueCities.map(city => (
              <FilterCheckRow
                key={city}
                id={`city-${city}`}
                checked={filters.cities.includes(city)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilters(prev => ({ ...prev, cities: [...prev.cities, city] }));
                  } else {
                    setFilters(prev => ({ ...prev, cities: prev.cities.filter(c => c !== city) }));
                  }
                }}
              >
                {city}
              </FilterCheckRow>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="space-y-2">
        <Label>{t('properties.amenities')}</Label>
        <div className="max-h-60 space-y-1 overflow-y-auto">
          {COMMON_FEATURES.map(feature => (
            <FilterCheckRow
              key={feature}
              id={`feature-${feature}`}
              checked={filters.features.includes(feature)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setFilters(prev => ({ ...prev, features: [...prev.features, feature] }));
                } else {
                  setFilters(prev => ({ ...prev, features: prev.features.filter(f => f !== feature) }));
                }
              }}
            >
              {t(FEATURE_I18N_KEY[feature] ?? feature)}
            </FilterCheckRow>
          ))}
        </div>
      </div>

      {/* Accepts Crypto */}
      <div className="space-y-2">
        <Label>{t('properties.paymentMethods')}</Label>
        <div className="space-y-1">
          <FilterCheckRow
            id="crypto"
            checked={filters.acceptsCrypto === true}
            onCheckedChange={(checked) => {
              setFilters(prev => ({ ...prev, acceptsCrypto: checked ? true : null }));
            }}
          >
            {t('properties.acceptsCryptocurrency')}
          </FilterCheckRow>
        </div>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" onClick={clearFilters} className="h-11 min-h-11 w-full">
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
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 pb-28 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t('properties.exploreTitle')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('properties.found', { count: filteredAndSortedProperties.length })}
          </p>
        </div>

        {/* Controls */}
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          {/* View Mode */}
          <div className="flex rounded-lg bg-secondary/50 p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-11 w-11 p-0"
              aria-label={t('properties.gridView')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-11 w-11 p-0"
              aria-label={t('properties.listView')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="h-11 w-11 p-0"
              aria-label={t('properties.mapView')}
            >
              <Map className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-11 min-h-11">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {t('properties.filters')}
                {activeFiltersCount > 0 && (
                  <Badge variant="default" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side={isMobile ? 'bottom' : 'right'}
              className="w-full overflow-y-auto scrollbar-thin sm:w-80"
            >
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="h-11 min-h-11 w-full min-w-0 text-base sm:w-56">
              <ArrowUpDown className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">
                {sortBy === 'date-desc' && t('properties.sortOptions.newest')}
                {sortBy === 'price-asc' && t('properties.sortOptions.priceAsc')}
                {sortBy === 'price-desc' && t('properties.sortOptions.priceDesc')}
                {sortBy === 'area-asc' && t('properties.sortOptions.areaAsc')}
                {sortBy === 'area-desc' && t('properties.sortOptions.areaDesc')}
              </span>
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
            <Button variant="ghost" className="h-11 min-h-11 w-full sm:w-auto" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              {t('properties.clearFiltersCount', { count: activeFiltersCount })}
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground sm:text-right">
          {t('properties.showingOf', { shown: paginatedProperties.length, total: filteredAndSortedProperties.length })}
        </div>
      </div>

      {/* Properties Display */}
      {viewMode === 'map' ? (
        <PropertiesMapView
          properties={filteredAndSortedProperties.map(prop => ({
            id: prop.id,
            slug: prop.slug,
            title: prop.title,
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
              slug={property.slug}
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
