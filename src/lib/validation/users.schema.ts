import { z } from 'zod';

// User role enum
export const UserRoleSchema = z.enum([
  'visitor',
  'registered',
  'verified',
  'premium',
  'lawyer',
  'admin',
  'super_admin'
]);

// Verification status enum
export const VerificationStatusSchema = z.enum([
  'unverified',
  'pending',
  'verified',
  'rejected'
]);

// Update user role schema
export const updateUserRoleSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido'),
  role: UserRoleSchema,
  reason: z.string().optional(),
  notes: z.string().optional(),
});

// Update verification status schema
export const updateVerificationSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido'),
  status: VerificationStatusSchema,
  notes: z.string().optional(),
  documents: z.array(z.string()).optional(),
});

// User filters schema
export const userFiltersSchema = z.object({
  role: z.string().optional(),
  verificationStatus: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  hasProperties: z.boolean().optional(),
  hasOffers: z.boolean().optional(),
});

// Create user schema (for admin user creation)
export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  phone: z.string().optional(),
  role: UserRoleSchema.default('registered'),
  verificationStatus: VerificationStatusSchema.default('unverified'),
  sendWelcomeEmail: z.boolean().default(true),
});

// Update user profile schema
export const updateUserProfileSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  phone: z.string().optional(),
  preferences: z.record(z.unknown()).optional(),
});

// Bulk user actions schema
export const bulkUserActionsSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, 'Se debe seleccionar al menos un usuario'),
  action: z.enum(['update_role', 'update_verification', 'delete', 'suspend']),
  role: UserRoleSchema.optional(),
  verificationStatus: VerificationStatusSchema.optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

// User search schema
export const userSearchSchema = z.object({
  query: z.string().min(1, 'La búsqueda no puede estar vacía'),
  filters: userFiltersSchema.optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Type exports
export type UserRole = z.infer<typeof UserRoleSchema>;
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateVerificationInput = z.infer<typeof updateVerificationSchema>;
export type UserFilters = z.infer<typeof userFiltersSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type BulkUserActionsInput = z.infer<typeof bulkUserActionsSchema>;
export type UserSearchInput = z.infer<typeof userSearchSchema>;
