import { handleXaiProxyRequest, type XaiProxyEnv } from '../../src/server/xaiProxy';

type PagesContext = {
  request: Request;
  env: XaiProxyEnv;
};

export async function onRequestPost(context: PagesContext): Promise<Response> {
  return handleXaiProxyRequest(context.request, context.env);
}

export async function onRequest(context: PagesContext): Promise<Response> {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
  return onRequestPost(context);
}
