import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  handleXaiProxyRequest,
  isAllowedXaiOrigin,
  resetXaiRateLimits,
} from './xaiProxy';

function request(
  url: string,
  init: RequestInit & { origin?: string; token?: string } = {}
): Request {
  const headers = new Headers(init.headers);
  if (init.origin) headers.set('Origin', init.origin);
  if (init.token) headers.set('Authorization', `Bearer ${init.token}`);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return new Request(url, { ...init, headers });
}

describe('isAllowedXaiOrigin', () => {
  it('allows same-origin browser calls and rejects missing or foreign origins', () => {
    expect(
      isAllowedXaiOrigin(
        request('https://www.sundayproperties.co/api/xai', {
          origin: 'https://www.sundayproperties.co',
        })
      )
    ).toBe(true);
    expect(
      isAllowedXaiOrigin(
        request('http://127.0.0.1:8788/api/xai', { origin: 'http://127.0.0.1:3000' })
      )
    ).toBe(true);
    expect(isAllowedXaiOrigin(request('https://www.sundayproperties.co/api/xai'))).toBe(false);
    expect(
      isAllowedXaiOrigin(
        request('https://www.sundayproperties.co/api/xai', {
          origin: 'https://evil.example',
        })
      )
    ).toBe(false);
  });
});

describe('handleXaiProxyRequest', () => {
  afterEach(() => {
    resetXaiRateLimits();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('rejects cross-origin callers before touching xAI', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = await handleXaiProxyRequest(
      request('https://www.sundayproperties.co/api/xai', {
        method: 'POST',
        origin: 'https://evil.example',
        body: JSON.stringify({ action: 'chat', prompt: 'hi' }),
      }),
      { XAI_API_KEY: 'test-key' }
    );
    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('requires a Supabase session', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = await handleXaiProxyRequest(
      request('https://www.sundayproperties.co/api/xai', {
        method: 'POST',
        origin: 'https://www.sundayproperties.co',
        body: JSON.stringify({ action: 'chat', prompt: 'hi' }),
      }),
      { XAI_API_KEY: 'test-key' }
    );
    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not call xAI when the user JWT is invalid', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(url).toContain('/auth/v1/user');
      expect(url).not.toContain('api.x.ai');
      return new Response(JSON.stringify({ message: 'invalid' }), { status: 401 });
    });
    vi.stubGlobal('fetch', fetchMock);
    const response = await handleXaiProxyRequest(
      request('https://www.sundayproperties.co/api/xai', {
        method: 'POST',
        origin: 'https://www.sundayproperties.co',
        token: 'not-a-real-session',
        body: JSON.stringify({ action: 'chat', prompt: 'hi' }),
      }),
      { XAI_API_KEY: 'test-key' }
    );
    expect(response.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
