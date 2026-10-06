import i18n from '../i18n/config';
import { getIntlLocale } from '../i18n/locale';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(getIntlLocale(), {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

/** List price for filters/cards: rentals use monthly canon, sales use sale price. */
export function listingAmount(property: {
  listing_type?: string | null;
  rent_monthly?: number | null;
  price?: number | null;
}): number {
  if (property.listing_type === 'rental') return Number(property.rent_monthly ?? 0);
  return Number(property.price ?? 0);
}

export interface ListingPriceSource {
  price?: number | string | null;
  rent_monthly?: number | string | null;
  listing_type?: string | null;
}

function toFiniteNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
}

/**
 * Sale price first; rentals fall back to monthly rent so null `price` does not crash listings.
 */
export function getListingPriceValue(property: ListingPriceSource): number | null {
  const salePrice = toFiniteNumber(property.price);
  const monthly = toFiniteNumber(property.rent_monthly);
  if (property.listing_type === 'rental' && monthly != null) return monthly;
  if (salePrice != null) return salePrice;
  if (monthly != null) return monthly;
  return null;
}

/**
 * Display label for catalog/detail cards. Rentals show "/mes" instead of crashing on null sale price.
 */
export function formatListingPrice(property: ListingPriceSource): string {
  const salePrice = toFiniteNumber(property.price);
  const monthly = toFiniteNumber(property.rent_monthly);
  if (property.listing_type === 'rental' && monthly != null) {
    return `${formatCurrency(monthly)}/mes`;
  }
  if (salePrice != null) {
    return formatCurrency(salePrice);
  }
  if (monthly != null) {
    return `${formatCurrency(monthly)}/mes`;
  }
  return 'Precio a consultar';
}


export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(getIntlLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(getIntlLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return `0 ${i18n.t('common.bytes')}`;

  const k = 1024;
  const sizes = [
    i18n.t('common.bytes'),
    'KB',
    'MB',
    'GB',
    'TB',
  ];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat(getIntlLocale()).format(num);
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const absMs = Math.abs(diffInMs);
  const rtf = new Intl.RelativeTimeFormat(getIntlLocale(), { numeric: 'auto' });

  if (absMs < 60 * 1000) return i18n.t('common.justNow');

  const minutes = Math.round(diffInMs / (1000 * 60));
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, 'minute');

  const hours = Math.round(diffInMs / (1000 * 60 * 60));
  if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour');

  const days = Math.round(diffInMs / (1000 * 60 * 60 * 24));
  if (Math.abs(days) < 7) return rtf.format(-days, 'day');

  if (Math.abs(days) < 30) {
    const weeks = Math.round(days / 7);
    return rtf.format(-weeks, 'week');
  }

  return formatDate(dateObj);
}

export function formatArea(area: number): string {
  return `${formatNumber(area)} m²`;
}

export function formatPropertyDimensions(bedrooms: number, bathrooms: number): string {
  const beds = i18n.t('properties.bedroomsShort', { count: bedrooms });
  const baths = i18n.t('properties.bathroomsShort', { count: bathrooms });
  return `${beds} • ${baths}`;
}

export function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
