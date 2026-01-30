import { z } from 'zod';

// Visit status enum
export const VisitStatusSchema = z.enum([
  'pending',
  'confirmed', 
  'completed',
  'cancelled',
  'rescheduled'
]);

// Reschedule visit schema
export const rescheduleVisitSchema = z.object({
  visitId: z.string().uuid('ID de visita inválido'),
  scheduledDate: z.string().min(1, 'La fecha es requerida'),
  scheduledTime: z.string().min(1, 'La hora es requerida'),
  reason: z.string().optional(),
});

// Visit notes schema
export const visitNotesSchema = z.object({
  visitId: z.string().uuid('ID de visita inválido'),
  notes: z.string().min(1, 'Las notas no pueden estar vacías').max(1000, 'Las notas no pueden exceder 1000 caracteres'),
  type: z.enum(['seller', 'admin']).default('seller'),
});

// Visit status update schema
export const updateVisitStatusSchema = z.object({
  visitId: z.string().uuid('ID de visita inválido'),
  status: VisitStatusSchema,
  notes: z.string().optional(),
  reason: z.string().optional(),
});

// Visit filters schema
export const visitFiltersSchema = z.object({
  status: z.string().optional(),
  type: z.enum(['incoming', 'scheduled', 'all']).optional().default('all'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
});

// Visit creation schema (for booking visits)
export const createVisitSchema = z.object({
  propertyId: z.string().uuid('ID de propiedad inválido'),
  scheduledDate: z.string().min(1, 'La fecha es requerida'),
  scheduledTime: z.string().min(1, 'La hora es requerida'),
  visitorName: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  visitorPhone: z.string().min(1, 'El teléfono es requerido').max(20, 'El teléfono no puede exceder 20 caracteres'),
  visitorEmail: z.string().email('Email inválido'),
  notes: z.string().optional(),
  ndaAccepted: z.boolean().default(false),
});

// Type exports
export type VisitStatus = z.infer<typeof VisitStatusSchema>;
export type RescheduleVisitInput = z.infer<typeof rescheduleVisitSchema>;
export type VisitNotesInput = z.infer<typeof visitNotesSchema>;
export type UpdateVisitStatusInput = z.infer<typeof updateVisitStatusSchema>;
export type VisitFilters = z.infer<typeof visitFiltersSchema>;
export type CreateVisitInput = z.infer<typeof createVisitSchema>;
