import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';

import { createSundayMcpServer } from './server';

export const MCP_CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'content-type, accept, mcp-session-id, mcp-protocol-version, last-event-id',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id, mcp-session-id',
  'Access-Control-Max-Age': '86400',
};

export function mcpCorsHeaders(): Headers {
  return new Headers(MCP_CORS_HEADERS);
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(MCP_CORS_HEADERS)) {
    if (!headers.has(key)) headers.set(key, value);
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export async function handleMcpRequest(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: mcpCorsHeaders() });
  }
  if (request.method !== 'GET' && request.method !== 'POST' && request.method !== 'DELETE') {
    return new Response('Method Not Allowed', { status: 405, headers: mcpCorsHeaders() });
  }

  const server = createSundayMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);
  try {
    const response = await transport.handleRequest(request);
    return withCors(response);
  } catch (error) {
    console.error('[sunday-mcp]', error);
    return new Response('Internal server error', { status: 500, headers: mcpCorsHeaders() });
  }
}
