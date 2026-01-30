import { z } from 'zod';

export const visitsFilterSchema = z.object({
  search: z.string().optional().default(''),
  status: z.enum(['all', 'pending', 'confirmed', 'completed', 'cancelled']).default('all'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type VisitsFilterValues = z.infer<typeof visitsFilterSchema>;

export const defaultVisitsFilters: VisitsFilterValues = {
  search: '',
  status: 'all',
  dateFrom: undefined,
  dateTo: undefined,
};

