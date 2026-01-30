import { TableColumn } from '../../../components/data/EntityTable';

export type VerificationRow = {
  id: string;
  user_id?: string;
  full_name?: string | null;
  email?: string | null;
  document_type?: string | null;
  status?: string | null;
  created_at?: string | null;
  verification_status?: string | null;
};

export const verificationColumns: Array<TableColumn<VerificationRow>> = [
  { id: 'name', header: 'Name', accessor: (r) => r.full_name ?? '—' },
  { id: 'email', header: 'Email', accessor: (r) => r.email ?? '—' },
  { id: 'document_type', header: 'Document Type', accessor: (r) => r.document_type ?? '—' },
  { id: 'status', header: 'Status', accessor: (r) => r.status ?? r.verification_status ?? '—' },
  { id: 'created', header: 'Created', accessor: (r) => r.created_at ?? '—' },
];

