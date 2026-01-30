import { z } from 'zod';

export const reportsFilterSchema = z.object({
  search: z.string().optional().default(''),
  status: z.enum(['all', 'pending', 'resolved', 'dismissed', 'escalated']).default('all'),
  type: z.enum(['all', 'user', 'property', 'message']).default('all'),
  priority: z.enum(['all', 'low', 'medium', 'high']).default('all'),
});

export type ReportsFilterValues = z.infer<typeof reportsFilterSchema>;

export const defaultReportsFilters: ReportsFilterValues = {
  search: '',
  status: 'all',
  type: 'all',
  priority: 'all',
};


