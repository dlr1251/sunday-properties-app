import { supabase } from '../lib/supabase';
import { appendAiPromptDisclaimer } from '@/lib/ai/append-prompt-disclaimer';

const XAI_PROXY_PATH = '/api/xai';

export type XaiGenerateOptions = {
  temperature?: number;
  maxTokens?: number;
  model?: string;
};

async function accessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error('Inicia sesión para usar el análisis con IA.');
  }
  return data.session.access_token;
}

async function readProxyJson(response: Response): Promise<Record<string, unknown>> {
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const code = typeof data.error === 'string' ? data.error : response.statusText;
    throw new Error(`xAI proxy error: ${response.status} ${code}`);
  }
  return data;
}

export class XAIService {
  async generateText(prompt: string, options: XaiGenerateOptions = {}): Promise<string> {
    const token = await accessToken();
    const response = await fetch(XAI_PROXY_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: 'chat',
        prompt: appendAiPromptDisclaimer(prompt),
        temperature: options.temperature ?? 0.1,
        max_tokens: options.maxTokens ?? 2000,
        model: options.model,
      }),
    });
    const data = await readProxyJson(response);
    if (typeof data.text !== 'string') throw new Error('Invalid response format from xAI');
    return data.text;
  }

  async generateTextWithFile(
    prompt: string,
    fileId: string,
    model: string = 'grok-4-fast'
  ): Promise<string> {
    const token = await accessToken();
    const response = await fetch(XAI_PROXY_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: 'chat',
        prompt: appendAiPromptDisclaimer(prompt),
        fileId,
        model,
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });
    const data = await readProxyJson(response);
    if (typeof data.text !== 'string') throw new Error('Invalid response format from xAI');
    return data.text;
  }

  async generateTextWithImage(prompt: string, imageBase64: string | string[]): Promise<string> {
    const token = await accessToken();
    const images = Array.isArray(imageBase64) ? imageBase64 : [imageBase64];
    const response = await fetch(XAI_PROXY_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: 'chat',
        prompt: appendAiPromptDisclaimer(prompt),
        images,
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });
    const data = await readProxyJson(response);
    if (typeof data.text !== 'string') throw new Error('Invalid response format from xAI');
    return data.text;
  }

  async uploadFile(file: File): Promise<{ id: string; filename: string; size: number }> {
    const token = await accessToken();
    const form = new FormData();
    form.append('action', 'upload');
    form.append('file', file);
    const response = await fetch(XAI_PROXY_PATH, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await readProxyJson(response);
    if (typeof data.id !== 'string') throw new Error('XAI Files API error: missing id');
    return {
      id: data.id,
      filename: typeof data.filename === 'string' ? data.filename : file.name,
      size: typeof data.size === 'number' ? data.size : file.size,
    };
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const token = await accessToken();
    const response = await fetch(XAI_PROXY_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'delete', fileId }),
    });
    const data = await readProxyJson(response);
    return data.deleted === true;
  }
}

export const xaiClient = new XAIService();
