import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Search } from 'lucide-react';

interface Filters {
  search: string;
  role: string;
}

interface Props {
  filters: Filters;
  setFilters: (updater: (prev: Filters) => Filters) => void;
}

export const RoleFilters: React.FC<Props> = ({ filters, setFilters }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="search">Buscar</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Nombre o email..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10"
          />
        </div>
      </div>
      <div>
        <Label>Filtrar por Rol</Label>
        <Select value={filters.role} onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="user">Usuarios</SelectItem>
            <SelectItem value="agent">Agentes</SelectItem>
            <SelectItem value="admin">Administradores</SelectItem>
            <SelectItem value="super_admin">Super Administradores</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end">
        <Button
          variant="outline"
          onClick={() => setFilters({ search: '', role: 'all' })}
          className="w-full"
        >
          Limpiar Filtros
        </Button>
      </div>
    </div>
  );
};


