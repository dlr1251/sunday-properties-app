import { getSupabasePublicConfig } from '../utils/listingMeta';

export const XAI_CHAT_URL = 'https://api.x.ai/v1/chat/completions';
export const XAI_FILES_URL = 'https://api.x.ai/v1/files';

const ALLOWED_MODELS = new Set(['grok-4-fast-reasoning', 'grok-4-fast', 'grok-4']);
const ALLOWED_ACTIONS = new Set(['chat', 'upload', 'delete']);
const PRODUCTION_HOSTS = new Set(['www.sundayproperties.co', 'sundayproperties.co']);

const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_AUTH = 20;
const RATE_LIMIT_IP = 30;
const MAX_PROMPT_CHARS = 80_000;
const MAX_IMAGES = 8;
const MAX_IMAGE_CHARS = 8_000_000;
const MAX_UPLOAD_BYTES = 48 * 1024 * 1024;

type RateBucket = { count: number; resetAt: number };

const rateBuckets = new Map<string, RateBucket>();

export type XaiProxyEnv = {
  XAI_API_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
};

export type XaiChatBody = {
  action?: string;
  prompt?: string;
  temperature?: number;
  max_tokens?: number;
  maxTokens?: number;
  model?: string;
  images?: unknown;
  fileId?: string;
};

function json(status: number, payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function hostnameOf(value: string): string | null {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isLocalHost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost');
}

export function isAllowedXaiOrigin(request: Request): boolean {
  let requestHost = '';
  try {
    requestHost = new URL(request.url).hostname.toLowerCase();
  } catch {
    return false;
  }

  const origin = request.headers.get('Origin') || '';
  const referer = request.headers.get('Referer') || '';
  const candidate = origin || referer;
  if (!candidate) return false;

  const host = hostnameOf(candidate);
  if (!host) return false;
  if (host === requestHost) return true;
  if (isLocalHost(host) && isLocalHost(requestHost)) return true;
  if (PRODUCTION_HOSTS.has(host) && PRODUCTION_HOSTS.has(requestHost)) return true;
  return false;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';
  return forwarded.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

export function consumeRateLimit(key: string, limit: number, now = Date.now()): boolean {
  const current = rateBuckets.get(key);
  if (!current || now >= current.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}

export function resetXaiRateLimits(): void {
  rateBuckets.clear();
}

function resolveEnv(runtime?: XaiProxyEnv): XaiProxyEnv {
  const proc = typeof process !== 'undefined' ? process.env : undefined;
  return {
    XAI_API_KEY: runtime?.XAI_API_KEY || proc?.XAI_API_KEY,
    VITE_SUPABASE_URL: runtime?.VITE_SUPABASE_URL || proc?.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: runtime?.VITE_SUPABASE_ANON_KEY || proc?.VITE_SUPABASE_ANON_KEY,
    SUPABASE_URL: runtime?.SUPABASE_URL || proc?.SUPABASE_URL,
    SUPABASE_ANON_KEY: runtime?.SUPABASE_ANON_KEY || proc?.SUPABASE_ANON_KEY,
  };
}

function supabaseConfig(env: XaiProxyEnv): { url: string; anonKey: string } {
  const fallback = getSupabasePublicConfig();
  const url = (env.VITE_SUPABASE_URL || env.SUPABASE_URL || fallback.url).replace(/\/$/, '');
  const anonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || fallback.anonKey;
  return { url, anonKey };
}

async function requireSupabaseUser(
  request: Request,
  env: XaiProxyEnv
): Promise<{ id: string } | Response> {
  const header = request.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return json(401, { error: 'auth_required' });

  const { url, anonKey } = supabaseConfig(env);
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) return json(401, { error: 'invalid_session' });
  const user = (await response.json()) as { id?: string };
  if (!user?.id) return json(401, { error: 'invalid_session' });
  return { id: user.id };
}

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function extractChatText(data: {
  choices?: Array<{ message?: { content?: string }; text?: string }>;
}): string {
  const choice = data.choices?.[0];
  if (choice?.message?.content) return choice.message.content;
  if (choice?.text) return choice.text;
  throw new Error('Invalid response format from xAI');
}

async function handleChat(body: XaiChatBody, apiKey: string): Promise<Response> {
  const prompt = typeof body.prompt === 'string' ? body.prompt : '';
  if (!prompt.trim()) return json(400, { error: 'prompt_required' });
  if (prompt.length > MAX_PROMPT_CHARS) return json(413, { error: 'prompt_too_large' });

  const model = typeof body.model === 'string' && ALLOWED_MODELS.has(body.model)
    ? body.model
    : 'grok-4-fast-reasoning';
  const temperature = clampNumber(body.temperature, 0.1, 0, 1);
  const maxTokens = clampNumber(body.max_tokens ?? body.maxTokens, 2000, 16, 8000);

  const images = Array.isArray(body.images) ? body.images : [];
  if (images.length > MAX_IMAGES) return json(413, { error: 'too_many_images' });

  type ContentPart =
    | { type: 'text'; text: string }
    | { type: 'file'; file_id: string }
    | { type: 'image_url'; image_url: { url: string } };

  const content: ContentPart[] = [{ type: 'text', text: prompt }];

  if (typeof body.fileId === 'string' && body.fileId.trim()) {
    if (!/^[a-zA-Z0-9_-]{6,128}$/.test(body.fileId.trim())) {
      return json(400, { error: 'invalid_file_id' });
    }
    content.push({ type: 'file', file_id: body.fileId.trim() });
  }

  for (const image of images) {
    if (typeof image !== 'string' || !image.trim()) {
      return json(400, { error: 'invalid_image' });
    }
    if (image.length > MAX_IMAGE_CHARS) return json(413, { error: 'image_too_large' });
    if (!image.startsWith('data:image/') && !/^[A-Za-z0-9+/=\s]+$/.test(image.slice(0, 80))) {
      return json(400, { error: 'invalid_image' });
    }
    content.push({
      type: 'image_url',
      image_url: {
        url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`,
      },
    });
  }

  const response = await fetch(XAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: content.length === 1 ? prompt : content,
        },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('[xai-proxy] chat failed', response.status);
    return json(502, { error: 'xai_error', status: response.status, detail: detail.slice(0, 300) });
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string }; text?: string }>;
  };
  return json(200, { text: extractChatText(data) });
}

async function handleUpload(request: Request, apiKey: string): Promise<Response> {
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return json(400, { error: 'file_required' });
  if (file.size > MAX_UPLOAD_BYTES) return json(413, { error: 'file_too_large' });

  const upload = new FormData();
  upload.append('file', file);
  upload.append('purpose', 'file-extract');

  const response = await fetch(XAI_FILES_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: upload,
  });

  if (!response.ok) {
    console.error('[xai-proxy] upload failed', response.status);
    return json(502, { error: 'xai_error', status: response.status });
  }

  const data = (await response.json()) as { id?: string; filename?: string; bytes?: number };
  if (!data.id) return json(502, { error: 'xai_error' });
  return json(200, {
    id: data.id,
    filename: data.filename || file.name,
    size: data.bytes || file.size,
  });
}

async function handleDelete(fileId: string, apiKey: string): Promise<Response> {
  if (!/^[a-zA-Z0-9_-]{6,128}$/.test(fileId)) return json(400, { error: 'invalid_file_id' });
  const response = await fetch(`${XAI_FILES_URL}/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) {
    console.warn('[xai-proxy] delete failed', response.status);
    return json(200, { deleted: false });
  }
  const data = (await response.json()) as { deleted?: boolean };
  return json(200, { deleted: data.deleted === true });
}

export async function handleXaiProxyRequest(
  request: Request,
  runtimeEnv?: XaiProxyEnv
): Promise<Response> {
  if (request.method !== 'POST') {
    return json(405, { error: 'method_not_allowed' });
  }
  if (!isAllowedXaiOrigin(request)) {
    return json(403, { error: 'origin_not_allowed' });
  }

  const ip = clientIp(request);
  if (!consumeRateLimit(`ip:${ip}`, RATE_LIMIT_IP)) {
    return json(429, { error: 'rate_limited' });
  }

  const env = resolveEnv(runtimeEnv);
  const userOrError = await requireSupabaseUser(request, env);
  if (userOrError instanceof Response) return userOrError;

  if (!consumeRateLimit(`user:${userOrError.id}`, RATE_LIMIT_AUTH)) {
    return json(429, { error: 'rate_limited' });
  }

  const apiKey = (env.XAI_API_KEY || '').trim();
  if (!apiKey) return json(503, { error: 'xai_not_configured' });

  const contentType = request.headers.get('Content-Type') || '';
  try {
    if (contentType.includes('multipart/form-data')) {
      return await handleUpload(request, apiKey);
    }

    const body = (await request.json()) as XaiChatBody;
    const action = typeof body.action === 'string' ? body.action : 'chat';
    if (!ALLOWED_ACTIONS.has(action)) return json(400, { error: 'invalid_action' });
    if (action === 'upload') return json(400, { error: 'use_multipart' });
    if (action === 'delete') return handleDelete(String(body.fileId || ''), apiKey);
    return handleChat(body, apiKey);
  } catch (error) {
    console.error('[xai-proxy] request failed', error instanceof Error ? error.name : 'error');
    return json(400, { error: 'invalid_request' });
  }
}
