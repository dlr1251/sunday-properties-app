import type { SunnyListingHit } from './listing-hit';
import { listingDisplayPrice } from './listing-hit';

export function formatCop(amount: number, locale = 'es-CO'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatSunnyListingPrice(listing: Pick<SunnyListingHit, 'listing_type' | 'price' | 'rent_monthly'>): string {
  const amount = listingDisplayPrice(listing);
  if (amount == null) return 'Precio a consultar';
  const formatted = formatCop(amount);
  return listing.listing_type === 'rental' ? `${formatted}/mes` : formatted;
}
