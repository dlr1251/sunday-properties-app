/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(() => cleanup());

import { SunnyMessageMarkdown } from './SunnyMessageMarkdown';

function renderMarkdown(text: string) {
  return render(
    <MemoryRouter>
      <SunnyMessageMarkdown text={text} />
    </MemoryRouter>,
  );
}

describe('SunnyMessageMarkdown', () => {
  it('renders bold text, line breaks, and listing links', () => {
    renderMarkdown('**El Escorial 701**\n3 habitaciones\n\n→ /properties/el-escorial-701');

    expect(screen.getByText('El Escorial 701').tagName).toBe('STRONG');
    expect(screen.queryByText(/\*\*El Escorial/)).toBeNull();
    expect(screen.getByRole('link', { name: '/properties/el-escorial-701' })).toHaveAttribute(
      'href',
      '/properties/el-escorial-701',
    );
    expect(screen.getByText(/3 habitaciones/).textContent).toContain('3 habitaciones');
  });

  it('keeps already-authored markdown links clickable', () => {
    renderMarkdown('Mira [este listado](/properties/casa-lauret)');
    expect(screen.getByRole('link', { name: 'este listado' })).toHaveAttribute('href', '/properties/casa-lauret');
  });
});
