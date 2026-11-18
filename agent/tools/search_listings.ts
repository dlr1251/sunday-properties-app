import { defineTool } from 'eve/tools';
import { never } from 'eve/tools/approval';
import { z } from 'zod';

import { logPublicSupabaseError } from '../../src/lib/publicSupabase';
import { searchPublishedListings } from '../../src/lib/sunny/listings';

const inputSchema = z.object({
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
});

export default defineTool({
  description:
    'Search Sunday Properties listings that are publicly published. Returns only public-safe fields (no address, owner contact, minimum offer, deposit, or internal notes). Call this before answering any question about a specific property, price, area, neighborhood inventory, or availability. If it returns no rows, say you do not have a published match and offer a human follow-up.',
  approval: never(),
  inputSchema,
  async execute(input) {
    let result: Awaited<ReturnType<typeof searchPublishedListings>>;
    try {
      result = await searchPublishedListings(input);
    } catch (error) {
      logPublicSupabaseError('sunny-listings', error, { city: input.city });
      return {
        ok: false,
        hits: [],
        note: 'Could not load published listings. Offer a human follow-up; do not invent inventory.',
      };
    }
    if (!result.ok) {
      return {
        ok: false,
        hits: [],
        note: 'Could not load published listings. Offer a human follow-up; do not invent inventory.',
      };
    }
    return {
      ok: true,
      hits: result.hits,
      note:
        result.hits.length === 0
          ? 'No published listing matched. Do not invent a property, price, or availability.'
          : 'Quote only these public fields. Never mention address, owner, minimum offer, or deposit.',
    };
  },
});
