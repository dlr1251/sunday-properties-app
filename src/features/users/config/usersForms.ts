import { z } from 'zod';
import i18n from '../../../i18n/config';

export const createUserSchema = z.object({
  name: z.string().min(1, { message: i18n.t('admin.validation.nameRequired') }),
  email: z.string().email({ message: i18n.t('admin.validation.invalidEmail') }),
  role: z.enum(['super_admin', 'admin', 'agent', 'user']).default('user'),
});

export const changeRoleSchema = z.object({
  role: z.enum(['super_admin', 'admin', 'agent', 'user']),
});

export const deleteUserSchema = z.object({
  confirm: z.literal(true, { errorMap: () => ({ message: i18n.t('admin.validation.confirmRequired') }) }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
