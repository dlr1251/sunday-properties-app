import i18n from '../i18n/config';
import { getIntlLocale } from '../i18n/locale';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(getIntlLocale(), {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
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
