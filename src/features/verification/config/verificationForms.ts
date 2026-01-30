import { z } from 'zod';

export const approveVerificationSchema = z.object({
  notes: z.string().optional(),
});

export const rejectVerificationSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
});

export type ApproveVerificationInput = z.infer<typeof approveVerificationSchema>;
export type RejectVerificationInput = z.infer<typeof rejectVerificationSchema>;

