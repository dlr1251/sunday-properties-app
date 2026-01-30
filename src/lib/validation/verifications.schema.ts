import { z } from 'zod';

export const verificationSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  document_type: z.enum([
    'id_card',
    'passport', 
    'driver_license',
    'utility_bill',
    'bank_statement',
    'employment_certificate',
    'income_certificate',
    'property_deed',
    'other'
  ]),
  status: z.enum(['pending', 'approved', 'rejected', 'expired']).default('pending'),
  documents: z.array(z.object({
    url: z.string().url(),
    filename: z.string().optional(),
    type: z.string().optional(),
    size: z.number().optional()
  })).optional().nullable(),
  notes: z.string().optional().nullable(),
  reviewer_id: z.string().uuid().optional().nullable(),
  reviewed_at: z.string().datetime().optional().nullable(),
  rejection_reason: z.string().optional().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const verificationFiltersSchema = z.object({
  status: z.string().optional(),
  document_type: z.string().optional(),
  search: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

export const updateVerificationStatusSchema = z.object({
  verificationId: z.string().uuid(),
  status: z.enum(['pending', 'approved', 'rejected', 'expired']),
  notes: z.string().optional().nullable(),
  rejectionReason: z.string().optional().nullable(),
});

export const bulkUpdateVerificationsSchema = z.object({
  verificationIds: z.array(z.string().uuid()),
  status: z.enum(['pending', 'approved', 'rejected', 'expired']),
  notes: z.string().optional().nullable(),
});

export type Verification = z.infer<typeof verificationSchema>;
export type VerificationFilters = z.infer<typeof verificationFiltersSchema>;
export type UpdateVerificationStatusInput = z.infer<typeof updateVerificationStatusSchema>;
export type BulkUpdateVerificationsInput = z.infer<typeof bulkUpdateVerificationsSchema>;
