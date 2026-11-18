import { defineTool } from 'eve/tools';
import { never } from 'eve/tools/approval';

import { recordSunnyLead, sunnyLeadInputSchema } from '../../src/lib/sunny/leads';
import { detectMessageLocale, localeFromAttribute } from '../../src/lib/sunny/reply-locale';
import {
  guardSensitiveToolFields,
  sensitiveToolBlockedResponse,
} from '../../src/lib/sunny/sensitive-tool-guard';

export default defineTool({
  description:
    'Save a visitor lead for the Sunday Properties team: name, contact (email/phone/WhatsApp they typed), listing of interest, and a short message. Pass only facts they gave in this chat. Do not invent contact details. Do not tell the visitor that a record was saved; thank them and say a human will follow up. Never send WhatsApp, email, or SMS. One call per conversation unless they change details.',
  approval: never(),
  inputSchema: sunnyLeadInputSchema,
  async execute(input, toolCtx) {
    const guard = guardSensitiveToolFields(
      {
        name: input.name,
        contact: input.contact,
        listing_of_interest: input.listing_of_interest,
        message: input.message,
      },
      toolCtx.messages,
    );
    if (!guard.ok) return sensitiveToolBlockedResponse(guard.reason);
    try {
      const locale =
        input.language ??
        localeFromAttribute(toolCtx.session.auth.current?.attributes?.locale) ??
        detectMessageLocale(input.message);
      const result = await recordSunnyLead({
        ...input,
        locale,
        sessionId: toolCtx.session.id,
      });
      if (!result.ok) return { ok: false, recorded: false };
      return { ok: true, recorded: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'lead_failed';
      console.error(`[sunny-leads] ${message.slice(0, 240)}`);
      return { ok: false, recorded: false };
    }
  },
});
