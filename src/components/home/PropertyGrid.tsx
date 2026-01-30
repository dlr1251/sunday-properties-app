import React from 'react';
import { PropertyCard } from '../PropertyCard';
import { PropertyCardSkeleton } from '../PropertyCardSkeleton';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Filter } from 'lucide-react';
import { GridControls } from './GridControls';

interface Property {
  id: string;
  title: string;
  area: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  price: string;
  image?: string;
  rating?: number;
  verified?: boolean;
  premium?: boolean;
}

interface PropertyGridProps {
  properties: Property[];
  loading?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onPropertySelect?: (propertyId: string) => void;
  onPropertyFavorite?: (propertyId: string) => void;
  sortBy?: string;
  onSortChange?: (sortBy: string) => void;
  className?: string;
}

const PropertySkeleton: React.FC = () => <PropertyCardSkeleton />;

const EmptyState: React.FC = () => (
  <div className="text-center py-16">
    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
      <MapPin className="h-12 w-12 text-muted-foreground" />
    </div>
    <h3 className="text-xl font-semibold mb-2">
      No se encontraron propiedades
    </h3>
    <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
      Intenta ajustar tus filtros de búsqueda para encontrar más opciones.
    </p>
    <Button variant="outline">
      <Filter className="h-4 w-4 mr-2" />
      Ajustar Filtros
    </Button>
  </div>
);

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  loading = false,
  viewMode = 'grid',
  onViewModeChange = () => {},
  onPropertySelect,
  onPropertyFavorite,
  sortBy,
  onSortChange,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`space-y-8 ${className}`}>
        <GridControls
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          propertiesCount={0}
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <PropertySkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <GridControls
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        propertiesCount={properties.length}
        sortBy={sortBy}
        onSortChange={onSortChange}
      />
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
      }>
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            id={property.id}
            title={property.title}
            area={property.area}
            location={property.location}
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            price={property.price}
            image={property.image}
            rating={property.rating}
            onView={onPropertySelect}
            onFavorite={onPropertyFavorite}
            className={viewMode === 'list' ? 'flex flex-row' : ''}
          />
        ))}
      </div>
      <div className="flex justify-center pt-8">
        <Button variant="outline" size="lg">
          Cargar más propiedades
        </Button>
      </div>
    </div>
  );
};