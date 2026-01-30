import { TableColumn } from '../../../components/data/EntityTable';

export type ReportRow = {
  id: string;
  title?: string | null;
  description?: string | null;
  type?: string | null;
  status?: string | null;
  priority?: string | null;
  created_at?: string | null;
  reporter_email?: string | null;
};

export const reportsColumns: Array<TableColumn<ReportRow>> = [
  { id: 'title', header: 'Title', accessor: (r) => r.title ?? '—' },
  { id: 'type', header: 'Type', accessor: (r) => r.type ?? '—' },
  { id: 'status', header: 'Status', accessor: (r) => r.status ?? '—' },
  { id: 'priority', header: 'Priority', accessor: (r) => r.priority ?? '—' },
  { id: 'reporter', header: 'Reporter', accessor: (r) => r.reporter_email ?? '—' },
  { id: 'created', header: 'Created', accessor: (r) => r.created_at ?? '—' },
];


