import { z } from 'zod';

export const propertiesFilterSchema = z.object({
  search: z.string().optional().default(''),
  status: z.enum(['all', 'published', 'pending', 'draft', 'archived']).default('all'),
  city: z.string().optional().default(''),
  listingType: z.enum(['all', 'sale', 'rental']).default('all'),
});

export type PropertiesFilterValues = z.infer<typeof propertiesFilterSchema>;

export const defaultPropertiesFilters: PropertiesFilterValues = {
  search: '',
  status: 'all',
  city: '',
  listingType: 'all',
};


