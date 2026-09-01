import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PropertyGrid } from './home/PropertyGrid';
import { supabase } from '../../lib/supabase';
import { Property } from '../types/entities';
import { SearchBar } from '@/components/ui/search-bar';
import { formatCurrency } from '../../utils/format';

interface SearchFilters {
  location: string;
  propertyType: string;
  priceRange: [number, number];
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  features?: string[];
}

export const DiscoveryView: React.FC = () => {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    location: '',
    propertyType: 'all',
    priceRange: [0, 10000000000]
  });

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      console.log('🔍 Fetching real properties from database...');

      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('❌ Error fetching properties:', error);
          setProperties([]);
        } else {
          console.log(`✅ Fetched ${data?.length || 0} properties from database`);
          setProperties(data as Property[] || []);
        }
      } catch (err) {
        console.error('❌ Unexpected error fetching properties:', err);
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
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    setFilteredProperties(filtered);
  }, [properties, searchFilters, sortBy]);

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  const handleSearch = (filters: SearchFilters) => {
    console.log('🔍 Applying search filters:', filters);
    setSearchFilters(filters);
  };

  const handlePropertySelect = (propertyId: string) => {
    console.log('🏠 Navigating to property:', propertyId);
    // Navigate to property detail page
    window.location.href = `/properties/${propertyId}`;
  };

  const handlePropertyFavorite = (propertyId: string) => {
    console.log('❤️ Toggle favorite for property:', propertyId);
    // Implement favorite logic here
  };

  const formatPrice = (price: number) => formatCurrency(price);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              {t('properties.findYour')}
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                {" "}{t('properties.idealProperty')}
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              {t('properties.discoverySubtitle')}
            </p>

            {/* Search Section */}
            <div className="mb-16">
              <SearchBar variant="hero" onSearch={handleSearch} />
            </div>

            {/* Quick Categories */}
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { key: 'apartment', label: t('properties.apartments'), count: properties.filter(p => p.property_type === 'apartment').length },
                { key: 'house', label: t('properties.houses'), count: properties.filter(p => p.property_type === 'house').length },
                { key: 'office', label: t('properties.offices'), count: properties.filter(p => p.property_type === 'office').length },
                { key: 'commercial', label: t('properties.shops'), count: properties.filter(p => p.property_type === 'commercial').length }
              ].map((category) => (
                <div key={category.key} className="bg-white rounded-lg px-6 py-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-sm font-medium text-gray-900">{category.label}</div>
                  <div className="text-xs text-gray-500">{t('properties.availableCount', { count: category.count })}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('properties.availableProperties')}
            {filteredProperties.length !== properties.length && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                {t('properties.filteredOfTotal', { filtered: filteredProperties.length, total: properties.length })}
              </span>
            )}
          </h2>
          <p className="text-lg text-gray-600">
            {filteredProperties.length === properties.length
              ? t('properties.discoverAll')
              : t('properties.filteredResults')
            }
          </p>
        </div>

        <PropertyGrid
          properties={convertProperties(filteredProperties)}
          loading={loading}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onPropertySelect={handlePropertySelect}
          onPropertyFavorite={handlePropertyFavorite}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />
      </div>
    </div>
  );
};