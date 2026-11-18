import { z } from 'zod';

export const sunnyListingSearchSchema = z.object({
  query: z
    .string()
    .max(180)
    .optional()
    .describe('Free-text neighborhood, title, or city. Public published listings only.'),
  city: z.string().max(80).optional(),
  neighborhood: z.string().max(80).optional(),
  listing_type: z.enum(['sale', 'rental']).optional(),
  bedrooms_min: z.number().int().min(0).max(20).optional(),
  max_price: z.number().min(0).optional().describe('COP ceiling for sale price or monthly rent.'),
  slug_or_id: z.string().max(120).optional().describe('Exact published slug or property id.'),
  slugs: z
    .array(z.string().min(1).max(120))
    .min(1)
    .max(8)
    .optional()
    .describe('Published listing slugs to fetch, in that order.'),
});

export const listingStatsInputSchema = z.object({
  slug_or_id: z.string().min(1).max(120).describe('Published listing slug or property id.'),
});

export const compareListingsInputSchema = z.object({
  slugs: z
    .array(z.string().min(1).max(120))
    .min(2)
    .max(4)
    .optional()
    .describe('Two to four published slugs to compare, in display order.'),
  query: z.string().max(180).optional(),
  city: z.string().max(80).optional(),
  neighborhood: z.string().max(80).optional(),
  listing_type: z.enum(['sale', 'rental']).optional(),
});
