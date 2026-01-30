
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['react-markdown', 'remark-gfm', 'rehype-raw'],
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
            'pdfjs': ['pdfjs-dist'],
          },
        },
      },
    },
  });