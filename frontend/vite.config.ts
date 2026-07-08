import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server proxies API calls straight to the FastAPI backend so the
// frontend can call relative paths ('/auth/login', '/pipeline/runs', ...)
// in both dev and production (where nginx does the same job — see nginx.conf).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:8000',
      '/webhook': 'http://localhost:8000',
      '/pipeline': 'http://localhost:8000',
      '/lenders': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
