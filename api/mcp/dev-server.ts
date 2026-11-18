import { serve } from '@hono/node-server';

import app from '../index';

const port = Number(process.env.PORT ?? 8787);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Sunday MCP listening on http://127.0.0.1:${info.port}/mcp`);
  console.log(`Widget preview: http://127.0.0.1:${info.port}/api/mcp/preview?kind=listings`);
});
