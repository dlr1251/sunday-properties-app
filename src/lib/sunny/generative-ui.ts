import {
  listingDisplayPrice,
  listingPricePerM2,
  publicSunnyListingHits,
  type SunnyListingHit,
} from './listing-hit';

export const SHOW_LISTINGS_TOOL = 'show_listings';
export const LISTING_STATS_TOOL = 'listing_stats';
export const COMPARE_LISTINGS_TOOL = 'compare_listings';

export const SUNNY_UI_TOOLS = [SHOW_LISTINGS_TOOL, LISTING_STATS_TOOL, COMPARE_LISTINGS_TOOL] as const;
export type SunnyUiToolName = (typeof SUNNY_UI_TOOLS)[number];

export type ListingStatKey =
  | 'price'
  | 'price_per_m2'
  | 'area'
  | 'bedrooms'
  | 'bathrooms'
  | 'strata'
  | 'admin_fee'
  | 'zone';

export type ListingStat = {
  key: ListingStatKey;
  value: number | string;
};

export type CompareMetric = 'price' | 'price_per_m2' | 'area' | 'bedrooms' | 'admin_fee';

export type CompareHighlights = Record<CompareMetric, string[]>;

const EMPTY_HIGHLIGHTS: CompareHighlights = {
  price: [],
  price_per_m2: [],
  area: [],
  bedrooms: [],
  admin_fee: [],
};

export function isSunnyUiTool(name: string): name is SunnyUiToolName {
  return (SUNNY_UI_TOOLS as readonly string[]).includes(name);
}

export function listingStatsFromHit(hit: SunnyListingHit): ListingStat[] {
  const stats: ListingStat[] = [];
  const price = listingDisplayPrice(hit);
  if (price != null) stats.push({ key: 'price', value: price });
  const perM2 = listingPricePerM2(hit);
  if (perM2 != null) stats.push({ key: 'price_per_m2', value: perM2 });
  if (hit.area != null) stats.push({ key: 'area', value: hit.area });
  if (hit.bedrooms != null) stats.push({ key: 'bedrooms', value: hit.bedrooms });
  if (hit.bathrooms != null) stats.push({ key: 'bathrooms', value: hit.bathrooms });
  if (hit.strata != null) stats.push({ key: 'strata', value: hit.strata });
  if (hit.admin_fee != null) stats.push({ key: 'admin_fee', value: hit.admin_fee });
  const zone = [hit.neighborhood, hit.city].filter((part): part is string => Boolean(part?.trim()));
  if (zone.length) stats.push({ key: 'zone', value: zone.join(', ') });
  return stats;
}

function numericMetric(hit: SunnyListingHit, metric: CompareMetric): number | null {
  switch (metric) {
    case 'price':
      return listingDisplayPrice(hit);
    case 'price_per_m2':
      return listingPricePerM2(hit);
    case 'area':
      return hit.area;
    case 'bedrooms':
      return hit.bedrooms;
    case 'admin_fee':
      return hit.admin_fee;
    default:
      return null;
  }
}

function winners(
  hits: readonly SunnyListingHit[],
  metric: CompareMetric,
  direction: 'min' | 'max',
): string[] {
  const scored = hits
    .map((hit) => ({ id: hit.id, value: numericMetric(hit, metric) }))
    .filter((row): row is { id: string; value: number } => row.value != null);
  if (scored.length < 2) return [];
  const best = direction === 'min' ? Math.min(...scored.map((row) => row.value)) : Math.max(...scored.map((row) => row.value));
  return scored.filter((row) => row.value === best).map((row) => row.id);
}

export function compareHighlights(hits: readonly SunnyListingHit[]): CompareHighlights {
  if (hits.length < 2) return { ...EMPTY_HIGHLIGHTS };
  const types = new Set(hits.map((hit) => hit.listing_type).filter(Boolean));
  const comparablePrices = types.size <= 1;
  return {
    price: comparablePrices ? winners(hits, 'price', 'min') : [],
    price_per_m2: comparablePrices ? winners(hits, 'price_per_m2', 'min') : [],
    area: winners(hits, 'area', 'max'),
    bedrooms: winners(hits, 'bedrooms', 'max'),
    admin_fee: winners(hits, 'admin_fee', 'min'),
  };
}

export function listingsFromToolOutput(output: unknown): SunnyListingHit[] | null {
  if (!output || typeof output !== 'object') return null;
  const record = output as Record<string, unknown>;
  const rows = record.listings ?? record.hits;
  if (rows == null) return Array.isArray(record.listing) ? publicSunnyListingHits(record.listing) : [];
  if (!Array.isArray(rows)) return null;
  return publicSunnyListingHits(rows);
}

export function parseShowListingsOutput(output: unknown): SunnyListingHit[] | null {
  return listingsFromToolOutput(output);
}

export function parseListingStatsOutput(output: unknown): SunnyListingHit | null {
  if (!output || typeof output !== 'object') return null;
  const record = output as Record<string, unknown>;
  if (record.listing && typeof record.listing === 'object') {
    return publicSunnyListingHits([record.listing])[0] ?? null;
  }
  const listings = listingsFromToolOutput(output);
  return listings?.[0] ?? null;
}

export function parseCompareListingsOutput(output: unknown): {
  listings: SunnyListingHit[];
  highlights: CompareHighlights;
} | null {
  const listings = listingsFromToolOutput(output);
  if (!listings) return null;
  return { listings, highlights: compareHighlights(listings) };
}

export function slimListingForModel(hit: SunnyListingHit) {
  return {
    id: hit.id,
    slug: hit.slug,
    title: hit.title,
    url: hit.url,
    listing_type: hit.listing_type,
    neighborhood: hit.neighborhood,
    city: hit.city,
    bedrooms: hit.bedrooms,
    bathrooms: hit.bathrooms,
    area: hit.area,
    price: hit.price,
    rent_monthly: hit.rent_monthly,
    monthly_costs: hit.monthly_costs,
    admin_fee: hit.admin_fee,
    strata: hit.strata,
    property_type: hit.property_type,
    image_count: hit.images.length,
    has_photos: hit.images.length > 0,
  };
}
