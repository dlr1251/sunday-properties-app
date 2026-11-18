/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

afterEach(() => cleanup());

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
});

import { SunnyFace } from './SunnyFace';

describe('SunnyFace', () => {
  it('renders the vector avatar as a decorative SVG', () => {
    render(<SunnyFace size={64} />);
    const wrap = screen.getByTestId('sunny-face');
    expect(wrap.querySelector('svg')).toBeTruthy();
    expect(wrap.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(wrap.querySelectorAll('ellipse').length).toBeGreaterThanOrEqual(2);
  });

  it('marks small message avatars as static', () => {
    render(<SunnyFace size={24} variant="static" />);
    expect(screen.getByTestId('sunny-face')).toHaveAttribute('data-variant', 'static');
    expect(screen.getByTestId('sunny-face').className).toContain('is-static');
  });
});
