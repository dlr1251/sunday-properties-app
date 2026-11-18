/**
 * Public listing columns the Sunny agent may read. Keep in sync with
 * PUBLIC_PROPERTY_COLUMNS in src/lib/propertyPrivacy.ts.
 *
 * This module has no Vite/Supabase imports so eve tools can use it.
 */
export const SUNNY_LISTING_COLUMNS = [
  'id',
  'slug',
  'title',
  'description',
  'neighborhood',
  'city',
  'public_coordinates',
  'bedrooms',
  'bathrooms',
  'area',
  'parking',
  'floor',
  'total_floors',
  'year_built',
  'property_type',
  'strata',
  'price',
  'monthly_costs',
  'accepts_crypto',
  'financing',
  'visit_price',
  'status',
  'verified',
  'premium',
  'images',
  'virtual_tour',
  'freedom_tradition',
  'tags',
  'features',
  'created_at',
  'updated_at',
  'published_at',
  'listing_type',
  'rent_monthly',
  'lease_term_months',
  'admin_fee',
  'utilities_included',
  'pets_policy',
  'nearby_places',
] as const;

export const SUNNY_PRIVATE_COLUMNS = [
  'address',
  'minimum_offer_price',
  'coordinates',
  'legal_documents',
  'owner_id',
  'agent_id',
  'negotiation_terms',
  'deposit',
  'owner_name',
  'phone',
  'email',
] as const;

export const SUNNY_LISTING_SELECT = SUNNY_LISTING_COLUMNS.join(',');

/**
 * Narrower public select used if the full PUBLIC_PROPERTY_COLUMNS list 400/403s
 * (a column not yet granted or missing on the live schema). Matches listing OG.
 */
export const SUNNY_LISTING_CORE_COLUMNS = [
  'id',
  'slug',
  'title',
  'description',
  'listing_type',
  'price',
  'rent_monthly',
  'neighborhood',
  'city',
  'images',
  'status',
] as const;

export const SUNNY_LISTING_CORE_SELECT = SUNNY_LISTING_CORE_COLUMNS.join(',');

export const PUBLISHED_LISTING_STATUS = 'published';

export type SunnyListingColumn = (typeof SUNNY_LISTING_COLUMNS)[number];
export type SunnyPrivateColumn = (typeof SUNNY_PRIVATE_COLUMNS)[number];
