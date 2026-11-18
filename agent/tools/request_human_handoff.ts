import { defineTool } from 'eve/tools';
import { never } from 'eve/tools/approval';

import {
  persistSunnyLeadPreferringHostApi,
  sunnyHopAuthFromAttributes,
  type SunnyLeadHopAuth,
} from '../../src/lib/sunny/leads-host';
import {
  sunnyHandoffInputSchema,
  sunnyHandoffRowFromInput,
  sunnyLeadExecuteResult,
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
async function persistSunnyHandoff(row: SunnyLeadRow, hopAuth: SunnyLeadHopAuth) {
  "use step";
  return persistSunnyLeadPreferringHostApi(row, process.env, { hopAuth });
}

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
      const hopAuth = sunnyHopAuthFromAttributes(
        toolCtx.session.auth.current?.attributes,
        toolCtx.session.id,
      );
      const locale =
        input.language ??
        localeFromAttribute(toolCtx.session.auth.current?.attributes?.locale) ??
        detectMessageLocale(input.summary);
      const result = await persistSunnyHandoff(
        sunnyHandoffRowFromInput({
          ...input,
          locale,
          sessionId: hopAuth.sessionId ?? toolCtx.session.id,
        }),
        hopAuth,
      );
      return sunnyLeadExecuteResult('sunny-handoff', result, { handoff: true });
    } catch (error) {
      logPublicSupabaseError('sunny-handoff', error);
      return { ok: false, recorded: false };
    }
  },
});
