import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleXaiProxyRequest } from './src/server/xaiProxy';

function nodeRequestUrl(req: IncomingMessage): string {
  const host = req.headers.host || '127.0.0.1:3000';
  return `http://${host}${req.url || '/api/xai'}`;
}

async function readNodeBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function xaiDevProxy(env: Record<string, string>): Plugin {
  return {
    name: 'xai-dev-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] || '';
        if (url !== '/api/xai') {
          next();
          return;
        }
        try {
          const body = await readNodeBody(req);
          const headers = new Headers();
          for (const [name, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') headers.set(name, value);
            else if (Array.isArray(value) && value[0]) headers.set(name, value[0]);
          }
          const method = req.method || 'POST';
          const request = new Request(nodeRequestUrl(req), {
            method,
            headers,
            body: method === 'GET' || method === 'HEAD' ? undefined : body,
          });
          const response = await handleXaiProxyRequest(request, env);
          await writeNodeResponse(res, response);
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'xai_proxy_failed' }));
          void error;
        }
      });
    },
  };
}

async function writeNodeResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, name) => {
    res.setHeader(name, value);
  });
  const buf = Buffer.from(await response.arrayBuffer());
  res.end(buf);
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), xaiDevProxy(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['react-markdown', 'remark-gfm', 'rehype-raw', 'maplibre-gl'],
    },
    server: {
      port: 3000,
      open: true,
      // Removed COEP headers to allow Stripe.js and other third-party scripts to load
      // These headers were blocking Stripe's CDN from loading properly
    },
    build: {
      outDir: 'build',
      rollupOptions: {
        output: {
          manualChunks: {
            pdfjs: ['pdfjs-dist'],
          },
        },
      },
    },
  };
});
