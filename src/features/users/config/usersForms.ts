import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['super_admin', 'admin', 'agent', 'user']).default('user'),
});

export const changeRoleSchema = z.object({
  role: z.enum(['super_admin', 'admin', 'agent', 'user']),
});

export const deleteUserSchema = z.object({
  confirm: z.literal(true, { errorMap: () => ({ message: 'Please confirm to proceed' }) }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;


