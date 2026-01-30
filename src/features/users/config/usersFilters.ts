import { z } from 'zod';

export const usersFilterSchema = z.object({
  search: z.string().optional().default(''),
  role: z.enum(['all', 'super_admin', 'admin', 'agent', 'user']).default('all'),
});

export type UsersFilterValues = z.infer<typeof usersFilterSchema>;

export const defaultUsersFilters: UsersFilterValues = {
  search: '',
  role: 'all',
};


