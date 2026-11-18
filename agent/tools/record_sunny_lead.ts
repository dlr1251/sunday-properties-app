import { defineTool } from 'eve/tools';
import { never } from 'eve/tools/approval';

import {
  persistSunnyLeadPreferringHostApi,
  sunnyHopAuthFromAttributes,
  type SunnyLeadHopAuth,
} from '../../src/lib/sunny/leads-host';
import {
  sunnyLeadExecuteResult,
  sunnyLeadInputSchema,
  sunnyLeadRowFromInput,
  type SunnyLeadRow,
} from '../../src/lib/sunny/leads';
import { logPublicSupabaseError } from '../../src/lib/publicSupabase';
import { detectMessageLocale, localeFromAttribute } from '../../src/lib/sunny/reply-locale';
import {
  guardSensitiveToolFields,
  sensitiveToolBlockedResponse,
} from '../../src/lib/sunny/sensitive-tool-guard';

/**
 * Host Node step (not the workflow VM). Prefer the Hono `api` service, which
 * has normal Node egress to Supabase.
 */
async function persistSunnyLead(row: SunnyLeadRow, hopAuth: SunnyLeadHopAuth) {
  "use step";
  return persistSunnyLeadPreferringHostApi(row, process.env, { hopAuth });
}

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
      const hopAuth = sunnyHopAuthFromAttributes(
        toolCtx.session.auth.current?.attributes,
        toolCtx.session.id,
      );
      const locale =
        input.language ??
        localeFromAttribute(toolCtx.session.auth.current?.attributes?.locale) ??
        detectMessageLocale(input.message);
      const result = await persistSunnyLead(
        sunnyLeadRowFromInput({
          ...input,
          locale,
          sessionId: hopAuth.sessionId ?? toolCtx.session.id,
        }),
        hopAuth,
      );
      return sunnyLeadExecuteResult('sunny-leads', result);
    } catch (error) {
      logPublicSupabaseError('sunny-leads', error);
      return { ok: false, recorded: false };
    }
  },
});
