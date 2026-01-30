import { TableColumn } from '../../../components/data/EntityTable';

export type VisitRow = {
  id: string;
  property_id?: string | null;
  buyer_id?: string | null;
  scheduled_date?: string | null;
  status?: string | null;
  created_at?: string | null;
  buyer_email?: string | null;
  property_title?: string | null;
};

export const visitsColumns: Array<TableColumn<VisitRow>> = [
  { id: 'property', header: 'Property', accessor: (r) => r.property_title ?? '—' },
  { id: 'buyer', header: 'Buyer', accessor: (r) => r.buyer_email ?? '—' },
  { id: 'date', header: 'Scheduled Date', accessor: (r) => r.scheduled_date ?? '—' },
  { id: 'status', header: 'Status', accessor: (r) => r.status ?? '—' },
  { id: 'created', header: 'Created', accessor: (r) => r.created_at ?? '—' },
];

