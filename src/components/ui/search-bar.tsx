import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Home, ChevronDown } from 'lucide-react';

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

const heroFieldClass =
  'flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-xl bg-secondary/50 px-4 py-2.5 hover:bg-secondary transition-colors';
const heroControlClass =
  'min-w-0 flex-1 bg-transparent text-base font-medium text-foreground placeholder:text-muted-foreground focus:outline-none';

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
      <form onSubmit={handleSubmit} className={['w-full min-w-0', className].join(' ')}>
        <div className="relative rounded-2xl border border-border/50 bg-card/95 p-2 shadow-elevated backdrop-blur-xl">
          <div className="flex flex-col gap-2 lg:flex-row">
            <div className={heroFieldClass}>
              <MapPin className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={city}
                onChange={(event) => {
                  const next = event.target.value;
                  setCity(next);
                  emitFilters({ city: next, neighborhood, propertyType });
                }}
                placeholder={t('home.search.cityPlaceholder')}
                className={heroControlClass}
                autoComplete="address-level2"
              />
            </div>

            <div className={heroFieldClass}>
              <MapPin className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={neighborhood}
                onChange={(event) => {
                  const next = event.target.value;
                  setNeighborhood(next);
                  emitFilters({ city, neighborhood: next, propertyType });
                }}
                placeholder={t('home.search.neighborhoodPlaceholder')}
                className={heroControlClass}
                autoComplete="address-level3"
              />
            </div>

            <div className={heroFieldClass}>
              <Home className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
              <select
                value={propertyType}
                onChange={(event) => {
                  const next = event.target.value;
                  setPropertyType(next);
                  emitFilters({ city, neighborhood, propertyType: next });
                }}
                className={`${heroControlClass} w-full appearance-none truncate`}
                aria-label={t('properties.propertyType')}
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? t('properties.allTypes') : t(`properties.types.${type}`)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none h-4 w-4 flex-shrink-0 text-muted-foreground" />
            </div>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={['flex min-w-0 items-center gap-2', className].join(' ')}>
      <div className="relative min-w-0 flex-1">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder || t('common.search')}
          className={[
            'h-11 w-full rounded-lg pl-4 pr-4',
            'border border-input bg-background',
            'text-base text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
          ].join(' ')}
        />
      </div>
    </form>
  );
};

export default SearchBar;
