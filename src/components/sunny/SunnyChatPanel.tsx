import { useEveAgent } from 'eve/react';
import { MessageCircle, Send, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../ui/button';
import { consumeSunnyAnonTurn, fetchSunnyAnonStatus } from '../../lib/sunny/anon-client';
import { SUNNY_LOCALE_HEADER, SUNNY_TICKET_HEADER } from '../../lib/sunny/config';
import { SUNNY_TURNSTILE_SITE_KEY, SUNNY_WIDGET_AGENT_NAME } from '../../lib/sunny/widget-flag';

type ChatLine = { id: string; role: 'user' | 'assistant'; text: string };

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void; 'error-callback'?: () => void },
      ) => string;
      reset: (id?: string) => void;
      getResponse: (id?: string) => string;
    };
  }
}

function textFromParts(parts: ReadonlyArray<{ type?: string; text?: string }>): string {
  return parts
    .filter((part) => part.type === 'text' && part.text)
    .map((part) => part.text as string)
    .join('\n')
    .trim();
}

export default function SunnyChatPanel() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [turnstileRequired, setTurnstileRequired] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const ticketRef = useRef<string | null>(null);
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const locale = i18n.language?.toLowerCase().startsWith('en') ? 'en' : 'es';

  const agent = useEveAgent({
    headers: () => {
      const headers: Record<string, string> = { [SUNNY_LOCALE_HEADER]: locale };
      if (ticketRef.current) headers[SUNNY_TICKET_HEADER] = ticketRef.current;
      return headers;
    },
  });

  const lines = useMemo<ChatLine[]>(() => {
    return agent.messages
      .map((message) => {
        if (message.role !== 'user' && message.role !== 'assistant') return null;
        const text = textFromParts(message.parts as Array<{ type?: string; text?: string }>);
        if (!text) return null;
        return { id: message.id, role: message.role, text };
      })
      .filter((row): row is ChatLine => Boolean(row));
  }, [agent.messages]);

  const busy = agent.status === 'busy' || agent.status === 'resuming';

  useEffect(() => {
    if (!open) return;
    void fetchSunnyAnonStatus().then((status) => {
      setRemaining(status.remaining);
      setTurnstileRequired(status.turnstileRequired);
    });
  }, [open]);

  useEffect(() => {
    if (!open || !turnstileRequired || !SUNNY_TURNSTILE_SITE_KEY || !widgetRef.current) return;
    let cancelled = false;
    const scriptId = 'cf-turnstile';
    const mount = () => {
      if (cancelled || !widgetRef.current || !window.turnstile) return;
      widgetRef.current.innerHTML = '';
      window.turnstile.render(widgetRef.current, {
        sitekey: SUNNY_TURNSTILE_SITE_KEY,
        callback: (token) => setTurnstileToken(token),
        'error-callback': () => setTurnstileToken(null),
      });
    };
    if (window.turnstile) {
      mount();
      return () => {
        cancelled = true;
      };
    }
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', mount);
    return () => {
      cancelled = true;
      script?.removeEventListener('load', mount);
    };
  }, [open, turnstileRequired]);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setError(null);
    const consume = await consumeSunnyAnonTurn(turnstileToken ?? undefined);
    if (!consume.ok || !consume.ticket) {
      if (consume.error === 'quota') setError(t('sunnyChat.quota'));
      else if (consume.error === 'ip_minute' || consume.error === 'ip_hour') setError(t('sunnyChat.rateLimit'));
      else if (consume.error === 'turnstile_failed') setError(t('sunnyChat.turnstile'));
      else setError(t('sunnyChat.error'));
      return;
    }
    ticketRef.current = consume.ticket;
    setRemaining(consume.remaining);
    setTurnstileRequired(false);
    setDraft('');
    try {
      await agent.send(text);
    } catch {
      setError(t('sunnyChat.error'));
    }
  }, [agent, busy, draft, t, turnstileToken]);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open ? (
        <section
          className="flex h-[min(28rem,70vh)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1a2441] text-white shadow-2xl"
          aria-label={t('sunnyChat.title', { name: SUNNY_WIDGET_AGENT_NAME })}
        >
          <header className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-semibold">{t('sunnyChat.title', { name: SUNNY_WIDGET_AGENT_NAME })}</p>
              <p className="text-xs text-white/70">{t('sunnyChat.subtitle')}</p>
            </div>
            <button type="button" className="rounded-full p-1 hover:bg-white/10" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-[#132033] px-4 py-3 text-sm">
            {lines.length === 0 ? (
              <p className="text-white/80">{t('sunnyChat.welcome', { name: SUNNY_WIDGET_AGENT_NAME })}</p>
            ) : null}
            {lines.map((line) => (
              <div
                key={line.id}
                className={
                  line.role === 'user'
                    ? 'ml-6 rounded-xl bg-[#2f8ac0] px-3 py-2'
                    : 'mr-6 rounded-xl bg-white/10 px-3 py-2'
                }
              >
                {line.text}
              </div>
            ))}
            {busy ? <p className="text-xs text-white/60">{t('sunnyChat.thinking')}</p> : null}
          </div>
          <form
            className="border-t border-white/10 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            {turnstileRequired && SUNNY_TURNSTILE_SITE_KEY ? <div ref={widgetRef} className="mb-2" /> : null}
            {error ? <p className="mb-2 text-xs text-amber-300">{error}</p> : null}
            {remaining != null ? (
              <p className="mb-2 text-[11px] text-white/50">{t('sunnyChat.remaining', { count: remaining })}</p>
            ) : null}
            <div className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={t('sunnyChat.placeholder')}
                disabled={busy}
                maxLength={2000}
              />
              <Button type="submit" size="icon" variant="accent" disabled={busy || !draft.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </section>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0a80d] text-[#1a2441] shadow-lg hover:bg-[#d9940b]"
        aria-label={t('sunnyChat.open', { name: SUNNY_WIDGET_AGENT_NAME })}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
