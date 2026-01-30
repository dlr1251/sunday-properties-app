import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatFileSize,
  formatPercentage,
  formatNumber,
  capitalize,
  truncateText
} from './format';

describe('formatCurrency', () => {
  it('formats Colombian Pesos correctly', () => {
    expect(formatCurrency(1500000)).toMatch(/\$[\s\u00A0]?1\.500\.000/);
    expect(formatCurrency(50000)).toMatch(/\$[\s\u00A0]?50\.000/);
    expect(formatCurrency(0)).toMatch(/\$[\s\u00A0]?0/);
  });

  it('handles decimal values', () => {
    expect(formatCurrency(1500000.50)).toMatch(/\$[\s\u00A0]?1\.500\.000,5/);
    expect(formatCurrency(50000.99)).toMatch(/\$[\s\u00A0]?50\.000,99/);
  });
});

describe('formatDate', () => {
  it('formats date strings correctly', () => {
    const date = '2024-01-15';
    const result = formatDate(date);
    expect(result).toMatch(/\d{1,2}.*\d{4}/); // Should contain day and year
  });

  it('formats Date objects correctly', () => {
    const date = new Date(2024, 0, 15); // January 15, 2024
    const result = formatDate(date);
    expect(result).toMatch(/\d{1,2}.*2024/); // Should contain day and year
  });
});

describe('formatDateTime', () => {
  it('formats date and time correctly', () => {
    const date = new Date('2024-01-15T14:30:00');
    const result = formatDateTime(date);
    expect(result).toMatch(/\d{1,2}.*2024/); // Should contain day and year
    expect(result).toMatch(/\d{1,2}:\d{2}/); // Should contain time
  });
});

describe('formatFileSize', () => {
  it('formats bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(512)).toBe('512 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
  });
});

describe('formatPercentage', () => {
  it('formats percentages with default decimals', () => {
    expect(formatPercentage(25.5)).toBe('25.5%');
    expect(formatPercentage(100)).toBe('100.0%');
  });

  it('formats percentages with custom decimals', () => {
    expect(formatPercentage(25.5, 0)).toBe('26%');
    expect(formatPercentage(25.123, 2)).toBe('25.12%');
  });
});

describe('formatNumber', () => {
  it('formats numbers with thousands separators', () => {
    expect(formatNumber(1000)).toBe('1.000');
    expect(formatNumber(1000000)).toBe('1.000.000');
    expect(formatNumber(500)).toBe('500');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('HELLO')).toBe('HELLO');
    expect(capitalize('')).toBe('');
  });
});

describe('truncateText', () => {
  it('truncates text longer than max length', () => {
    expect(truncateText('Hello world', 5)).toBe('Hello...');
    expect(truncateText('Short', 10)).toBe('Short');
  });

  it('handles exact length', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });
});
