import { z } from 'zod';

import {
  compareListingsInputSchema,
  listingStatsInputSchema,
  sunnyListingSearchSchema,
} from '../../src/lib/sunny/listing-search-schema';

export { compareListingsInputSchema, listingStatsInputSchema, sunnyListingSearchSchema };

export const listingHitSchema = z.object({
  id: z.string(),
  slug: z.string().nullable(),
  title: z.string().nullable(),
  url: z.string(),
  listing_type: z.string().nullable(),
  neighborhood: z.string().nullable(),
  city: z.string().nullable(),
  bedrooms: z.number().nullable(),
  bathrooms: z.number().nullable(),
  area: z.number().nullable(),
  price: z.number().nullable(),
  rent_monthly: z.number().nullable(),
  monthly_costs: z.number().nullable(),
  admin_fee: z.number().nullable(),
  strata: z.number().nullable(),
  property_type: z.string().nullable(),
  verified: z.boolean().nullable(),
  premium: z.boolean().nullable(),
  features: z.array(z.string()).nullable(),
  description: z.string().nullable(),
  images: z.array(z.string()),
  image: z.string().nullable(),
});

export const listingStatSchema = z.object({
  key: z.enum([
    'price',
    'price_per_m2',
    'area',
    'bedrooms',
    'bathrooms',
    'strata',
    'admin_fee',
    'zone',
  ]),
  value: z.union([z.number(), z.string()]),
});

export const compareHighlightsSchema = z.object({
  price: z.array(z.string()),
  price_per_m2: z.array(z.string()),
  area: z.array(z.string()),
  bedrooms: z.array(z.string()),
  admin_fee: z.array(z.string()),
});

export const searchListingsOutputSchema = z.object({
  ok: z.boolean(),
  hits: z.array(listingHitSchema),
  note: z.string(),
});

export const showListingsOutputSchema = z.object({
  ok: z.boolean(),
  listings: z.array(listingHitSchema),
  note: z.string(),
});

export const listingStatsOutputSchema = z.object({
  ok: z.boolean(),
  listing: listingHitSchema.nullable(),
  stats: z.array(listingStatSchema),
  note: z.string(),
});

export const compareListingsOutputSchema = z.object({
  ok: z.boolean(),
  listings: z.array(listingHitSchema),
  highlights: compareHighlightsSchema,
  note: z.string(),
});
