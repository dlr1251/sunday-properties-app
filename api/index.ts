import { Hono } from 'hono';
import { GET as listingHtmlGet } from './listing-html';
import { GET as sunnyAnonGet, POST as sunnyAnonPost } from './sunny/anon';
import { GET as sunnyListingsGet } from './sunny/listings';

/**
 * Vercel Services skip the zero-config `api/` directory. This Hono app is the
 * `api` service entrypoint so every existing handler still ships:
 * `/api/listing-html`, `/api/sunny/anon`, `/api/sunny/listings`, and
 * `/properties/:slug` (OG HTML).
 * Import new `api/*.ts` handlers here when you add them.
 */
const app = new Hono();

const listingHtml = (c: { req: { raw: Request } }) => listingHtmlGet(c.req.raw);

app.on(['GET', 'HEAD'], '/api/listing-html', listingHtml);
app.on(['GET', 'HEAD'], '/properties/:slugOrId', listingHtml);
app.get('/api/sunny/anon', (c) => sunnyAnonGet(c.req.raw));
app.post('/api/sunny/anon', (c) => sunnyAnonPost(c.req.raw));
app.get('/api/sunny/listings', (c) => sunnyListingsGet(c.req.raw));

export default app;
