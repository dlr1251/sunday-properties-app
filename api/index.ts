import { Hono } from 'hono';
import { GET as listingHtmlGet } from './listing-html';
import { handleMcpRequest } from './mcp/http';
import { handlePreviewRequest } from './mcp/preview';
import { GET as sunnyAnonGet, POST as sunnyAnonPost } from './sunny/anon';
import { POST as sunnyLeadsPost } from './sunny/leads';
import { GET as sunnyListingsGet } from './sunny/listings';

/**
 * Vercel Services skip the zero-config `api/` directory. This Hono app is the
 * `api` service entrypoint so every existing handler still ships:
 * `/api/listing-html`, `/api/sunny/anon`, `/api/sunny/listings`,
 * `/api/sunny/leads`, `/mcp` (ChatGPT Apps SDK + ask_sunny), `/api/mcp/preview`,
 * and `/properties/:slug` (OG HTML).
 * Import new `api/*.ts` handlers here when you add them.
 */
const app = new Hono();

const listingHtml = (c: { req: { raw: Request } }) => listingHtmlGet(c.req.raw);

app.on(['GET', 'HEAD'], '/api/listing-html', listingHtml);
app.on(['GET', 'HEAD'], '/properties/:slugOrId', listingHtml);
app.get('/api/sunny/anon', (c) => sunnyAnonGet(c.req.raw));
app.post('/api/sunny/anon', (c) => sunnyAnonPost(c.req.raw));
app.get('/api/sunny/listings', (c) => sunnyListingsGet(c.req.raw));
app.post('/api/sunny/leads', (c) => sunnyLeadsPost(c.req.raw));
app.get('/api/mcp/preview', (c) => handlePreviewRequest(c.req.raw));
app.get('/api/mcp/preview/widget', (c) => handlePreviewRequest(c.req.raw));
app.on(['GET', 'POST', 'DELETE', 'OPTIONS'], '/mcp', (c) => handleMcpRequest(c.req.raw));

export const maxDuration = 60;

export default app;
