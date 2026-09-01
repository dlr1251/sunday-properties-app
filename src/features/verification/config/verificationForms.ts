import { z } from 'zod';
import i18n from '../../../i18n/config';

export const approveVerificationSchema = z.object({
  notes: z.string().optional(),
});

export const rejectVerificationSchema = z.object({
  reason: z.string().min(1, { message: i18n.t('admin.validation.reasonRequired') }),
  notes: z.string().optional(),
});

export type ApproveVerificationInput = z.infer<typeof approveVerificationSchema>;
export type RejectVerificationInput = z.infer<typeof rejectVerificationSchema>;
