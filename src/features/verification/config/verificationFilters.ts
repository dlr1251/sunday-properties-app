import { z } from 'zod';

export const verificationFilterSchema = z.object({
  search: z.string().optional().default(''),
  status: z.enum(['all', 'pending', 'approved', 'rejected']).default('all'),
  document_type: z.enum(['all', 'id', 'passport', 'driver_license']).default('all'),
});

export type VerificationFilterValues = z.infer<typeof verificationFilterSchema>;

export const defaultVerificationFilters: VerificationFilterValues = {
  search: '',
  status: 'all',
  document_type: 'all',
};

