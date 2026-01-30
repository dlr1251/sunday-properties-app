import React, { useState } from 'react';
import { Search, MapPin, Home, SlidersHorizontal } from 'lucide-react';
import { Button } from './button';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  variant?: 'default' | 'hero';
  className?: string;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  variant = 'default',
  className = '',
  placeholder = 'Buscar propiedades...'
}) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  // Hero variant - Large, glass morphism style for landing pages
  if (variant === 'hero') {
    return (
      <form 
        onSubmit={handleSubmit}
        className={[
          'w-full',
          className,
        ].join(' ')}
      >
        <div className="relative bg-background/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-elevated p-2">
          <div className="flex flex-col md:flex-row gap-2">
            {/* Location Input */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ciudad o barrio"
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none"
              />
            </div>
            
            {/* Property Type Input */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
              <Home className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tipo de propiedad"
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-xl"
                aria-label="Filtros avanzados"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
              <Button
                type="submit"
                size="lg"
                className="h-12 px-8 rounded-xl"
              >
                <Search className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Buscar</span>
              </Button>
            </div>
          </div>
        </div>
      </form>
    );
  }

  // Default variant - Compact for nav/sidebar
  return (
    <form 
      onSubmit={handleSubmit}
      className={[
        'flex items-center gap-2',
        className,
      ].join(' ')}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={[
            'w-full h-10 pl-10 pr-4 rounded-lg',
            'bg-background border border-input',
            'text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'transition-colors duration-200',
          ].join(' ')}
        />
      </div>
      <Button type="submit" size="default">
        Buscar
      </Button>
    </form>
  );
};

export default SearchBar;


