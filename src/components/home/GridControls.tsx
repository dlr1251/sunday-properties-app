import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Grid3X3, List, Filter, SortAsc } from 'lucide-react';

interface GridControlsProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  propertiesCount: number;
  sortBy?: string;
  onSortChange?: (sortBy: string) => void;
}

export const GridControls: React.FC<GridControlsProps> = ({
  viewMode,
  onViewModeChange,
  propertiesCount,
  sortBy = 'newest',
  onSortChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold">
          Propiedades Destacadas
        </h2>
        <p className="text-muted-foreground">
          {propertiesCount} propiedades encontradas
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex items-center bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid3X3 className="h-5 w-5" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => onViewModeChange('list')}
          >
            <List className="h-5 w-5" />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <SortAsc className="h-4 w-4 mr-2" />
              Ordenar por
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => onSortChange?.('newest')}
              className={sortBy === 'newest' ? 'bg-accent' : ''}
            >
              Fecha: Más recientes
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange?.('price-low')}
              className={sortBy === 'price-low' ? 'bg-accent' : ''}
            >
              Precio: Más bajo a más alto
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange?.('price-high')}
              className={sortBy === 'price-high' ? 'bg-accent' : ''}
            >
              Precio: Más alto a más bajo
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange?.('area')}
              className={sortBy === 'area' ? 'bg-accent' : ''}
            >
              Área: Más grande primero
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>
    </div>
  );
};
