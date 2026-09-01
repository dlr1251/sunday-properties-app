import React, { useEffect, useMemo, useState } from 'react';
import { PropertyGrid } from './PropertyGrid';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/format';
import type { Property } from '../../types/entities';

interface PublishedPropertiesGridProps {
  limit?: number;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onPropertySelect?: (propertyId: string) => void;
  onPropertyFavorite?: (propertyId: string) => void;
  sortBy?: string;
  onSortChange?: (sortBy: string) => void;
  className?: string;
}

function displayPrice(property: Property): string {
  if (property.listing_type === 'rental' && property.rent_monthly) {
    return `${formatCurrency(property.rent_monthly)} / mes`;
  }
  if (property.price) {
    return formatCurrency(property.price);
  }
  return formatCurrency(0);
}

function sortValue(property: Property): number {
  if (property.listing_type === 'rental') return property.rent_monthly ?? 0;
  return property.price ?? 0;
}

function mapForGrid(properties: Property[]) {
  return properties.map((prop) => ({
    id: prop.id,
    title: prop.title,
    area: `${prop.area} m²`,
    location: `${prop.neighborhood}, ${prop.city}`,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    price: displayPrice(prop),
    image:
      prop.images?.[0] ||
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
    rating: 4.6,
    verified: prop.verified,
    premium: prop.premium,
    listingType: prop.listing_type
  }));
}

export const PublishedPropertiesGrid: React.FC<PublishedPropertiesGridProps> = ({
  limit = 12,
  viewMode = 'grid',
  onViewModeChange,
  onPropertySelect,
  onPropertyFavorite,
  sortBy = 'newest',
  onSortChange,
  className
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchProperties = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false, nullsFirst: false })
          .limit(limit);

        if (cancelled) return;
        if (error) {
          console.error('Error fetching published properties:', error);
          setProperties([]);
        } else {
          setProperties((data as Property[]) || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Unexpected error fetching published properties:', err);
          setProperties([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProperties();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  const sorted = useMemo(() => {
    const copy = [...properties];
    switch (sortBy) {
      case 'price-low':
        copy.sort((a, b) => sortValue(a) - sortValue(b));
        break;
      case 'price-high':
        copy.sort((a, b) => sortValue(b) - sortValue(a));
        break;
      case 'area':
        copy.sort((a, b) => b.area - a.area);
        break;
      case 'bedrooms':
        copy.sort((a, b) => b.bedrooms - a.bedrooms);
        break;
      case 'newest':
      default:
        copy.sort(
          (a, b) =>
            new Date(b.published_at || b.created_at).getTime() -
            new Date(a.published_at || a.created_at).getTime()
        );
        break;
    }
    return copy;
  }, [properties, sortBy]);

  return (
    <PropertyGrid
      className={className}
      properties={mapForGrid(sorted)}
      loading={loading}
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
      onPropertySelect={onPropertySelect}
      onPropertyFavorite={onPropertyFavorite}
      sortBy={sortBy}
      onSortChange={onSortChange}
    />
  );
};
