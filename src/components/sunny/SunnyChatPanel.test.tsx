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
  messages: [] as Array<{ id: string; role: string; parts: Array<{ type: string; text: string }> }>,
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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { name?: string; count?: number }) => {
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
      };
      return map[key] ?? key;
    },
    i18n: { language: 'es' },
  }),
}));

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
});
