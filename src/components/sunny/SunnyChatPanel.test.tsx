/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

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

const agentState = {
  messages: [] as Array<{ id: string; role: string; parts: Array<Record<string, unknown>> }>,
  status: 'idle',
  send: vi.fn(),
};

vi.mock('eve/react', () => ({
  useEveAgent: () => agentState,
}));

vi.mock('../../lib/sunny/anon-client', () => ({
  fetchSunnyAnonStatus: vi.fn(async () => ({ ok: true, remaining: 5, turnstileRequired: false })),
  consumeSunnyAnonTurn: vi.fn(),
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
    t: (key: string, opts?: { name?: string; count?: number; current?: number; total?: number; title?: string }) => {
      const name = opts?.name ?? 'Sunny';
      const map: Record<string, string> = {
        'sunnyChat.title': name,
        'sunnyChat.subtitle': 'Sunday Properties · listados publicados',
        'sunnyChat.welcome': `Hola, soy ${name}. Pregúntame por listados publicados en Medellín.`,
        'sunnyChat.placeholder': 'Escribe tu pregunta…',
        'sunnyChat.thinking': 'Un momento…',
        'sunnyChat.open': `Abrir chat con ${name}`,
        'sunnyChat.remaining': `${opts?.count ?? 0} mensajes restantes`,
        'sunnyChat.quota': 'quota',
        'sunnyChat.rateLimit': 'rate',
        'sunnyChat.turnstile': 'turnstile',
        'sunnyChat.error': 'error',
        'sunnyChat.viewListing': 'Ver listado',
        'sunnyChat.scheduleVisit': 'Agendar visita',
        'sunnyChat.photoOf': `Foto ${opts?.current ?? 1} de ${opts?.total ?? 1}: ${opts?.title ?? ''}`,
        'sunnyChat.previousPhoto': 'Foto anterior',
        'sunnyChat.nextPhoto': 'Foto siguiente',
        'sunnyChat.noPhoto': 'Sin fotos publicadas',
        'sunnyChat.statsHeading': 'Cifras del listado',
        'sunnyChat.compareHeading': 'Comparar listados',
        'sunnyChat.chartHeading': 'Precio por m²',
        'sunnyChat.pricePerM2': 'Precio / m²',
        'sunnyChat.adminFee': 'Administración',
        'sunnyChat.strata': 'Estrato',
        'sunnyChat.area': 'Área',
        'sunnyChat.bedrooms': 'Habitaciones',
        'sunnyChat.bathrooms': 'Baños',
        'sunnyChat.zone': 'Zona',
        'sunnyChat.price': 'Precio',
        'sunnyChat.listing': 'Listado',
        'sunnyChat.best': 'Mejor valor',
        'sunnyChat.loadingUi': 'Preparando listados…',
      };
      return map[key] ?? key;
    },
    i18n: { language: 'es' },
  }),
  };
});

import SunnyChatPanel from './SunnyChatPanel';

function renderPanel() {
  return render(
    <MemoryRouter>
      <SunnyChatPanel />
    </MemoryRouter>,
  );
}

describe('SunnyChatPanel', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    agentState.messages = [];
    agentState.status = 'idle';
    window.history.replaceState({}, '', '/');
  });

  it('uses Sunny as the round launcher instead of a chat-bubble icon', () => {
    renderPanel();
    const launcher = screen.getByRole('button', { name: 'Abrir chat con Sunny' });
    expect(launcher.querySelector('svg.sunny-face-svg')).toBeTruthy();
    expect(launcher.querySelector('.lucide-message-circle')).toBeNull();
  });

  it('shows the face in the header and renders Sunny markdown in replies', () => {
    agentState.messages = [
      {
        id: 'u1',
        role: 'user',
        parts: [{ type: 'text', text: '¿Tienen un 3 habitaciones?' }],
      },
      {
        id: 'a1',
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: 'Sí. **El Escorial 701** está publicado.\n\n→ /properties/el-escorial-701',
          },
        ],
      },
    ];
    renderPanel();
    fireEvent.click(screen.getByTestId('sunny-launcher'));

    expect(screen.getByText('Sunny')).toBeTruthy();
    expect(screen.getAllByTestId('sunny-face').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('El Escorial 701').tagName).toBe('STRONG');
    expect(screen.getByRole('link', { name: '/properties/el-escorial-701' })).toHaveAttribute(
      'href',
      '/properties/el-escorial-701',
    );
  });

  it('renders listing cards from a show_listings tool part', () => {
    agentState.messages = [
      {
        id: 'u1',
        role: 'user',
        parts: [{ type: 'text', text: 'Muéstrame fotos de Brisas' }],
      },
      {
        id: 'a1',
        role: 'assistant',
        parts: [
          {
            type: 'tool',
            name: 'show_listings',
            callId: 'c1',
            state: 'completed',
            output: {
              ok: true,
              listings: [
                {
                  id: 'brisas',
                  slug: 'brisas-del-estadio',
                  title: 'Brisas del Estadio',
                  listing_type: 'sale',
                  neighborhood: 'Estadio',
                  city: 'Medellín',
                  bedrooms: 1,
                  bathrooms: 2,
                  area: 45.54,
                  price: 390_000_000,
                  images: ['https://cdn.example/brisas.webp'],
                },
              ],
            },
          },
          { type: 'text', text: 'Aquí tienes **Brisas del Estadio**.' },
        ],
      },
    ];
    renderPanel();
    fireEvent.click(screen.getByTestId('sunny-launcher'));
    expect(screen.getByTestId('sunny-listings')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Brisas del Estadio' })).toHaveAttribute(
      'href',
      '/properties/brisas-del-estadio',
    );
    expect(screen.getByRole('link', { name: 'Agendar visita' })).toBeTruthy();
    expect(screen.getAllByText('Brisas del Estadio').some((node) => node.tagName === 'STRONG')).toBe(true);
  });

  it('auto-opens listing preview cards from sunny_preview=listings', () => {
    window.history.replaceState({}, '', '/?sunny_preview=listings');
    renderPanel();
    expect(screen.getByTestId('sunny-chat-panel')).toBeTruthy();
    expect(screen.getByTestId('sunny-listings')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Brisas del Estadio/ })).toHaveAttribute(
      'href',
      '/properties/brisas-del-estadio',
    );
  });
});
