
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';
  import { eveVite } from 'eve/vite';

  export default defineConfig({
    plugins: [react(), ...(process.env.VITEST ? [] : [eveVite()])],
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
    test: {
      exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**', '**/build/**'],
    },
    build: {
      outDir: 'build',
      rollupOptions: {
        output: {
          manualChunks: {
            'pdfjs': ['pdfjs-dist'],
          },
        },
      },
    },
  });