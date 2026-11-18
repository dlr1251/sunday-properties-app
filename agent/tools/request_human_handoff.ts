import { defineTool } from 'eve/tools';
import { never } from 'eve/tools/approval';

import { recordSunnyHandoff, sunnyHandoffInputSchema } from '../../src/lib/sunny/leads';
import { detectMessageLocale, localeFromAttribute } from '../../src/lib/sunny/reply-locale';
import {
  guardSensitiveToolFields,
  sensitiveToolBlockedResponse,
} from '../../src/lib/sunny/sensitive-tool-guard';

export default defineTool({
  description:
    'Flag a lead for a human on the Sunday Properties team. Use it when you are unsure, the visitor asks for legal advice, unpublished details, a visit, or anything you cannot answer from search_listings. Pass only facts from this chat. After it runs, say in one or two sentences that a person will follow up. Never promise a time, a price, or a legal result. Never send WhatsApp, email, or SMS.',
  approval: never(),
  inputSchema: sunnyHandoffInputSchema,
  async execute(input, toolCtx) {
    const guard = guardSensitiveToolFields(
      {
        name: input.name,
        contact: input.contact,
        listing_of_interest: input.listing_of_interest,
        summary: input.summary,
      },
      toolCtx.messages,
    );
    if (!guard.ok) return sensitiveToolBlockedResponse(guard.reason);
    try {
      const locale =
        input.language ??
        localeFromAttribute(toolCtx.session.auth.current?.attributes?.locale) ??
        detectMessageLocale(input.summary);
      const result = await recordSunnyHandoff({
        ...input,
        locale,
        sessionId: toolCtx.session.id,
      });
      if (!result.ok) return { ok: false, recorded: false };
      return { ok: true, recorded: true, handoff: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'handoff_failed';
      console.error(`[sunny-handoff] ${message.slice(0, 240)}`);
      return { ok: false, recorded: false };
    }
  },
});
