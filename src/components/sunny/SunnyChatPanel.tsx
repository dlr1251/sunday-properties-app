import { useEveAgent } from 'eve/react';
import { Send, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../ui/button';
import { consumeSunnyAnonTurn, fetchSunnyAnonStatus } from '../../lib/sunny/anon-client';
import { SUNNY_LOCALE_HEADER, SUNNY_TICKET_HEADER } from '../../lib/sunny/config';
import { parseSunnyPreviewMode, previewMessages } from '../../lib/sunny/preview-fixtures';
import { SUNNY_TURNSTILE_SITE_KEY, SUNNY_WIDGET_AGENT_NAME } from '../../lib/sunny/widget-flag';
import { SunnyFace } from './SunnyFace';
import { SunnyMessageMarkdown } from './SunnyMessageMarkdown';
import { SunnyToolResult, type SunnyToolPartView } from './SunnyToolResult';

type ChatPart = {
  type?: string;
  text?: string;
  id?: string;
  name?: string;
  callId?: string;
  state?: SunnyToolPartView['state'];
  output?: unknown;
  label?: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  parts: readonly ChatPart[];
};

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

function hasRenderableParts(parts: ReadonlyArray<{ type?: string }>): boolean {
  return parts.some((part) => part.type === 'text' || part.type === 'tool');
}

function AssistantParts({ parts }: { parts: readonly ChatPart[] }) {
  return (
    <div className="mr-2 flex items-start gap-2">
      <SunnyFace size={24} variant="static" className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        {parts.map((part, index) => {
          if (part.type === 'text' && part.text) {
            return (
              <div key={part.id ?? `text-${index}`} className="rounded-xl bg-white/10 px-3 py-2">
                <SunnyMessageMarkdown text={part.text} />
              </div>
            );
          }
          if (part.type === 'tool' && part.name && part.state) {
            return (
              <SunnyToolResult
                key={part.callId ?? `tool-${index}`}
                part={{
                  name: part.name,
                  state: part.state,
                  output: part.output,
                  label: part.label ?? '',
                }}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

export default function SunnyChatPanel() {
  const { t, i18n } = useTranslation();
  const initialPreview =
    typeof window === 'undefined' ? null : parseSunnyPreviewMode(window.location.search);
  const [open, setOpen] = useState(Boolean(initialPreview));
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [turnstileRequired, setTurnstileRequired] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [previewMode] = useState(initialPreview);
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

  const liveMessages = useMemo<ChatMessage[]>(() => {
    return agent.messages.flatMap((message) => {
      if (message.role !== 'user' && message.role !== 'assistant') return [];
      if (!hasRenderableParts(message.parts)) return [];
      return [{ id: message.id, role: message.role, parts: message.parts as ChatPart[] }];
    });
  }, [agent.messages]);

  const previewChat = useMemo(() => (previewMode ? previewMessages(previewMode) : []), [previewMode]);
  const messages = liveMessages.length > 0 ? liveMessages : previewChat;
  const busy = agent.status === 'busy' || agent.status === 'resuming';

  useEffect(() => {
    if (!open || previewMode) return;
    void fetchSunnyAnonStatus().then((status) => {
      setRemaining(status.remaining);
      setTurnstileRequired(status.turnstileRequired);
    });
  }, [open, previewMode]);

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
          className="flex h-[min(36rem,72vh)] w-[min(24rem,calc(100vw-1.25rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1a2441] text-white shadow-2xl dark:border-[#f5d15a]/15 sm:h-[min(38rem,78vh)] sm:w-[min(30rem,calc(100vw-2rem))]"
          aria-label={t('sunnyChat.title', { name: SUNNY_WIDGET_AGENT_NAME })}
          data-testid="sunny-chat-panel"
        >
          <header className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <SunnyFace size={44} variant="interactive" thinking={busy} />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{t('sunnyChat.title', { name: SUNNY_WIDGET_AGENT_NAME })}</p>
                <p className="text-xs text-white/70">{t('sunnyChat.subtitle')}</p>
              </div>
            </div>
            <button type="button" className="shrink-0 rounded-full p-1 hover:bg-white/10" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-[#132033] px-4 py-3 text-sm">
            {messages.length === 0 ? (
              <p className="text-white/80">{t('sunnyChat.welcome', { name: SUNNY_WIDGET_AGENT_NAME })}</p>
            ) : null}
            {messages.map((message) =>
              message.role === 'user' ? (
                <div key={message.id} className="ml-8 rounded-xl bg-[#2f8ac0] px-3 py-2">
                  {textFromParts(message.parts)}
                </div>
              ) : (
                <AssistantParts key={message.id} parts={message.parts} />
              ),
            )}
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
        className={`sunny-launcher flex h-16 w-16 items-center justify-center overflow-visible rounded-full bg-transparent p-0 text-[#1a2441] ${busy ? 'is-thinking' : ''}`}
        aria-label={t('sunnyChat.open', { name: SUNNY_WIDGET_AGENT_NAME })}
        aria-expanded={open}
        data-testid="sunny-launcher"
      >
        <SunnyFace size={64} variant="interactive" thinking={busy} />
      </button>
    </div>
  );
}
