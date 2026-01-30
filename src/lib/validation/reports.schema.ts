import { z } from 'zod';

// Report type enum
export const ReportTypeSchema = z.enum([
  'spam',
  'fraud',
  'inappropriate_content',
  'harassment',
  'fake_listing',
  'scam',
  'copyright_violation',
  'other'
]);

// Report status enum
export const ReportStatusSchema = z.enum([
  'pending',
  'under_review',
  'resolved',
  'dismissed',
  'escalated'
]);

// Report priority enum
export const ReportPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'critical'
]);

// Resolution action enum
export const ResolutionActionSchema = z.enum([
  'warning',
  'suspension',
  'ban',
  'property_removal',
  'visit_cancellation',
  'content_removal',
  'no_action'
]);

// Create report schema
export const createReportSchema = z.object({
  reportedUserId: z.string().uuid().optional(),
  reportedPropertyId: z.string().uuid().optional(),
  reportedVisitId: z.string().uuid().optional(),
  reportType: ReportTypeSchema,
  title: z.string().min(1, 'El título es requerido').max(200, 'El título no puede exceder 200 caracteres'),
  description: z.string().min(1, 'La descripción es requerida').max(2000, 'La descripción no puede exceder 2000 caracteres'),
  evidenceUrls: z.array(z.string().url('URL de evidencia inválida')).optional(),
  priority: ReportPrioritySchema.default('medium'),
});

// Update report status schema
export const updateReportStatusSchema = z.object({
  reportId: z.string().uuid('ID de denuncia inválido'),
  status: ReportStatusSchema,
  resolutionAction: ResolutionActionSchema.optional(),
  resolutionNotes: z.string().optional(),
  reviewerNotes: z.string().optional(),
});

// Report filters schema
export const reportFiltersSchema = z.object({
  status: z.string().optional(),
  reportType: z.string().optional(),
  priority: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  reportedUserId: z.string().uuid().optional(),
  reportedPropertyId: z.string().uuid().optional(),
});

// Bulk update reports schema
export const bulkUpdateReportsSchema = z.object({
  reportIds: z.array(z.string().uuid()).min(1, 'Se debe seleccionar al menos una denuncia'),
  status: ReportStatusSchema,
  resolutionAction: ResolutionActionSchema.optional(),
  resolutionNotes: z.string().optional(),
});

// Resolution form schema
export const resolutionFormSchema = z.object({
  status: ReportStatusSchema,
  resolutionAction: ResolutionActionSchema.optional(),
  resolutionNotes: z.string().min(1, 'Las notas de resolución son requeridas').max(1000, 'Las notas no pueden exceder 1000 caracteres'),
  reviewerNotes: z.string().optional(),
  notifyReporter: z.boolean().default(true),
  notifyReportedUser: z.boolean().default(false),
});

// Type exports
export type ReportType = z.infer<typeof ReportTypeSchema>;
export type ReportStatus = z.infer<typeof ReportStatusSchema>;
export type ReportPriority = z.infer<typeof ReportPrioritySchema>;
export type ResolutionAction = z.infer<typeof ResolutionActionSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
export type ReportFilters = z.infer<typeof reportFiltersSchema>;
export type BulkUpdateReportsInput = z.infer<typeof bulkUpdateReportsSchema>;
export type ResolutionFormInput = z.infer<typeof resolutionFormSchema>;
