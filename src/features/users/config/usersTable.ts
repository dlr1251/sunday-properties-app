import { TableColumn } from '../../../components/data/EntityTable';

export type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  verification_status?: string | null;
  created_at?: string | null;
  last_sign_in_at?: string | null;
  properties_count?: number;
  reports_count?: number;
  visits_count?: number;
  offers_count?: number;
};

export const usersColumns: Array<TableColumn<UserRow>> = [
  { id: 'name', header: 'Name', accessor: (r) => r.name ?? '—' },
  { id: 'email', header: 'Email', accessor: (r) => r.email },
  { id: 'role', header: 'Role', accessor: (r) => r.role },
  { id: 'verification', header: 'Verification', accessor: (r) => r.verification_status ?? '—' },
  { id: 'properties', header: 'Properties', accessor: (r) => r.properties_count ?? 0, className: 'text-right' },
  { id: 'reports', header: 'Reports', accessor: (r) => r.reports_count ?? 0, className: 'text-right' },
  { id: 'visits', header: 'Visits', accessor: (r) => r.visits_count ?? 0, className: 'text-right' },
  { id: 'offers', header: 'Offers', accessor: (r) => r.offers_count ?? 0, className: 'text-right' },
];


