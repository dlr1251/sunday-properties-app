import {
  loadIndexHtmlFromAssets,
  respondToListingHtmlRequest,
} from '../../src/utils/listingHtmlRequest';

type PagesEnv = {
  ASSETS: {
    fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  };
};

type PagesContext = {
  request: Request;
  env: PagesEnv;
  params: Record<string, string | string[] | undefined>;
};

function slugFromParams(params: PagesContext['params']): string {
  const raw = params.slugOrId;
  if (Array.isArray(raw)) return raw[0] || '';
  return raw || '';
}

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const { request, env, params } = context;
  const slugOrId = slugFromParams(params);
  return respondToListingHtmlRequest(request, slugOrId, (req) =>
    loadIndexHtmlFromAssets(req, env.ASSETS)
  );
}

export const onRequestHead = onRequestGet;

export async function onRequest(context: PagesContext): Promise<Response> {
  return onRequestGet(context);
}
