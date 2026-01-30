import { z } from 'zod';

export const resolveReportSchema = z.object({
  action: z.enum(['resolve', 'dismiss', 'escalate']),
  notes: z.string().optional(),
});

export type ResolveReportInput = z.infer<typeof resolveReportSchema>;


