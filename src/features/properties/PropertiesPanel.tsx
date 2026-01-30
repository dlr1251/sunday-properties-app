import React from 'react';
import { PropertiesFilters } from './PropertiesFilters';
import { PropertiesTable } from './PropertiesTable';
import { defaultPropertiesFilters, PropertiesFilterValues } from './config/propertiesFilters';
import { usePropertiesData } from './hooks/usePropertiesData';

export function PropertiesPanel() {
  const [filters, setFilters] = React.useState<PropertiesFilterValues>(defaultPropertiesFilters);
  const [page] = React.useState(1);
  const [limit] = React.useState(20);
  const { properties, isLoading } = usePropertiesData({
    page,
    limit,
    search: filters.search,
    status: filters.status,
    city: filters.city,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Properties Management</h2>
      </div>

      <PropertiesFilters values={filters} onChange={setFilters} onReset={() => setFilters(defaultPropertiesFilters)} />

      <PropertiesTable data={properties as any} isLoading={isLoading} />
    </div>
  );
}

export default PropertiesPanel;


