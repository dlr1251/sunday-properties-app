import { TableColumn } from '../../../components/data/EntityTable';
import { formatCurrency } from '../../../utils/format';

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
  { id: 'price', header: 'Price', accessor: (r) => formatCurrency(r.price) },
  { id: 'status', header: 'Status', accessor: (r) => r.status },
  { id: 'location', header: 'Location', accessor: (r) => `${r.city ?? ''}${r.neighborhood ? ', ' + r.neighborhood : ''}` },
];
