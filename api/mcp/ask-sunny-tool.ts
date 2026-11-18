import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { askSunny, type AskSunnyInput, type AskSunnyResult } from './sunny-client';

export const askSunnyInputSchema = z.object({
  message: z
    .string()
    .min(1)
    .describe('The visitor’s question for Sunny, in Spanish or English.'),
  session_id: z
    .string()
    .min(1)
    .optional()
    .describe('Sunny session id from a previous ask_sunny call. Omit to start a new conversation.'),
});

export const askSunnyOutputSchema = z.object({
  ok: z.boolean(),
  reply: z.string(),
  session_id: z.string(),
  turn_id: z.string().optional(),
  note: z.string().optional(),
});

const ASK_SUNNY_ANNOTATIONS = {
  readOnlyHint: false,
  destructiveHint: false,
  openWorldHint: true,
  idempotentHint: false,
} as const;

function textResult(text: string) {
  return [{ type: 'text' as const, text }];
}

export type AskSunnyFn = (input: AskSunnyInput) => Promise<{
  structuredContent: {
    ok: boolean;
    reply: string;
    session_id: string;
    turn_id?: string;
    note?: string;
  };
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}>;

export function mcpResultFromAskSunny(result: AskSunnyResult): Awaited<ReturnType<AskSunnyFn>> {
  if (result.ok === false) {
    return {
      isError: true,
      structuredContent: {
        ok: false,
        reply: '',
        session_id: result.session_id ?? '',
        note: result.error,
      },
      content: textResult(result.error),
    };
  }
  return {
    structuredContent: {
      ok: true,
      reply: result.reply,
      session_id: result.session_id,
      ...(result.turn_id ? { turn_id: result.turn_id } : {}),
      note: 'Pass session_id on the next ask_sunny call to keep this conversation.',
    },
    content: textResult(result.reply),
  };
}

export const executeAskSunny: AskSunnyFn = async (input) =>
  mcpResultFromAskSunny(await askSunny(input));

export function registerAskSunny(server: McpServer, ask: AskSunnyFn = executeAskSunny): void {
  server.registerTool(
    'ask_sunny',
    {
      title: 'Ask Sunny',
      description:
        'Talk to Sunny, Sunday Properties’ public assistant for published listings in Medellín. Use this for a conversational answer (recommendations, follow-ups, bilingual help). Pass session_id from a previous ask_sunny call to keep context. For structured inventory, cards, figures, or a comparison table, prefer search_listings, show_listings, listing_stats, or compare_listings. Sunny only knows published public fields — never expect addresses, owners, minimum offer, deposit, or internal notes.',
      inputSchema: askSunnyInputSchema,
      outputSchema: askSunnyOutputSchema,
      annotations: ASK_SUNNY_ANNOTATIONS,
      _meta: {
        securitySchemes: [{ type: 'noauth' }],
        'openai/toolInvocation/invoking': 'Consultando a Sunny…',
        'openai/toolInvocation/invoked': 'Sunny respondió',
      },
    },
    async (args) => ask(args),
  );
}
