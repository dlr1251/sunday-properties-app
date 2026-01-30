import { TableColumn } from '../../../components/data/EntityTable';

export type PropertyRow = {
  id: string;
  title: string;
  price: number;
  status: string;
  city?: string;
  neighborhood?: string;
};

export const propertiesColumns: Array<TableColumn<PropertyRow>> = [
  { id: 'title', header: 'Title', accessor: (r) => r.title },
  { id: 'price', header: 'Price', accessor: (r) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(r.price) },
  { id: 'status', header: 'Status', accessor: (r) => r.status },
  { id: 'location', header: 'Location', accessor: (r) => `${r.city ?? ''}${r.neighborhood ? ', ' + r.neighborhood : ''}` },
];


