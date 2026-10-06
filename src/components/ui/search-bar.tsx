import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Home } from 'lucide-react';

export interface HomeSearchValues {
  city: string;
  neighborhood: string;
  propertyType: string;
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onFiltersChange?: (filters: HomeSearchValues) => void;
  variant?: 'default' | 'hero';
  className?: string;
  placeholder?: string;
}

const PROPERTY_TYPES = ['all', 'apartment', 'house', 'office', 'commercial'] as const;

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onFiltersChange,
  variant = 'default',
  className = '',
  placeholder,
}) => {
  const { t } = useTranslation();
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [query, setQuery] = useState('');

  const emitFilters = (next: HomeSearchValues) => {
    onFiltersChange?.(next);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch?.(query || city || neighborhood);
  };

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSubmit} className={['w-full', className].join(' ')}>
        <div className="relative bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-elevated p-2">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                value={city}
                onChange={(event) => {
                  const next = event.target.value;
                  setCity(next);
                  emitFilters({ city: next, neighborhood, propertyType });
                }}
                placeholder={t('home.search.cityPlaceholder')}
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none"
              />
            </div>

            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                value={neighborhood}
                onChange={(event) => {
                  const next = event.target.value;
                  setNeighborhood(next);
                  emitFilters({ city, neighborhood: next, propertyType });
                }}
                placeholder={t('home.search.neighborhoodPlaceholder')}
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none"
              />
            </div>

            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
              <Home className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <select
                value={propertyType}
                onChange={(event) => {
                  const next = event.target.value;
                  setPropertyType(next);
                  emitFilters({ city, neighborhood, propertyType: next });
                }}
                className="flex-1 bg-transparent text-foreground text-sm font-medium focus:outline-none"
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? t('properties.allTypes') : t(`properties.types.${type}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={['flex items-center gap-2', className].join(' ')}>
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder || t('common.search')}
          className={[
            'w-full h-10 pl-4 pr-4 rounded-lg',
            'bg-background border border-input',
            'text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
          ].join(' ')}
        />
      </div>
    </form>
  );
};

export default SearchBar;
