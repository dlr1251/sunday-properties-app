// Format utility functions
// Centralized formatting functions for consistent display across the app

/**
 * Format currency amount in Colombian Pesos
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date in Spanish format
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format date and time in Spanish format
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-CO').format(num);
}

/**
 * Format relative time (e.g., "hace 2 horas", "ayer")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Ahora mismo';
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
  if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
  if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;

  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `Hace ${weeks} semana${weeks !== 1 ? 's' : ''}`;
  }

  return formatDate(dateObj);
}

/**
 * Format property area
 */
export function formatArea(area: number): string {
  return `${formatNumber(area)} m²`;
}

/**
 * Format property dimensions (beds/baths)
 */
export function formatPropertyDimensions(bedrooms: number, bathrooms: number): string {
  const beds = bedrooms === 1 ? '1 hab' : `${bedrooms} hab`;
  const baths = bathrooms === 1 ? '1 baño' : `${bathrooms} baños`;
  return `${beds} • ${baths}`;
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
