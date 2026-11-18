import { useEffect, useState } from 'react';

type OpenAiGlobals = {
  toolOutput?: unknown;
  theme?: 'light' | 'dark';
  locale?: string;
};

declare global {
  interface Window {
    openai?: OpenAiGlobals;
    __SUNDAY_WIDGET__?: 'listings' | 'stats' | 'compare';
  }
}

function readOpenAiOutput(): unknown {
  return typeof window === 'undefined' ? null : window.openai?.toolOutput ?? null;
}

function applyHostTheme(theme?: string) {
  if (theme !== 'light' && theme !== 'dark') return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

/**
 * MCP Apps bridge (ui/initialize + tool-result) with ChatGPT window.openai fallback.
 */
export function useToolStructuredContent(): unknown {
  const [data, setData] = useState<unknown>(() => readOpenAiOutput());

  useEffect(() => {
    applyHostTheme(window.openai?.theme);
    if (window.openai?.locale) {
      document.documentElement.lang = window.openai.locale;
    }

    let rpcId = 0;
    const pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: unknown) => void }>();

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      const message = event.data;
      if (!message || message.jsonrpc !== '2.0') return;
      if (typeof message.id === 'number' && pending.has(message.id)) {
        const waiter = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) waiter?.reject(message.error);
        else waiter?.resolve(message.result);
        return;
      }
      if (message.method === 'ui/notifications/tool-result') {
        const structured = message.params?.structuredContent ?? message.params;
        if (structured) setData(structured);
      }
      if (message.method === 'ui/notifications/host-context-changed') {
        applyHostTheme(message.params?.theme);
      }
    };

    window.addEventListener('message', onMessage, { passive: true });
    window.addEventListener(
      'openai:set_globals',
      ((event: CustomEvent<{ globals?: OpenAiGlobals }>) => {
        const next = event.detail?.globals?.toolOutput;
        if (next !== undefined) setData(next);
        applyHostTheme(event.detail?.globals?.theme);
      }) as EventListener,
    );

    const rpcRequest = (method: string, params: unknown) =>
      new Promise((resolve, reject) => {
        const id = ++rpcId;
        pending.set(id, { resolve, reject });
        window.parent.postMessage({ jsonrpc: '2.0', id, method, params }, '*');
      });

    void rpcRequest('ui/initialize', {
      appInfo: { name: 'sunday-properties', version: '1.0.0' },
      appCapabilities: {},
      protocolVersion: '2026-01-26',
    })
      .then(() => {
        window.parent.postMessage(
          { jsonrpc: '2.0', method: 'ui/notifications/initialized', params: {} },
          '*',
        );
      })
      .catch(() => {
        // Preview pages and hosts without the MCP Apps bridge still render toolOutput.
      });

    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return data;
}

export function widgetKind(): 'listings' | 'stats' | 'compare' {
  const fromWindow = typeof window !== 'undefined' ? window.__SUNDAY_WIDGET__ : undefined;
  if (fromWindow === 'stats' || fromWindow === 'compare' || fromWindow === 'listings') return fromWindow;
  const fromBody = typeof document !== 'undefined' ? document.body?.dataset.sundayWidget : undefined;
  if (fromBody === 'stats' || fromBody === 'compare' || fromBody === 'listings') return fromBody;
  return 'listings';
}
