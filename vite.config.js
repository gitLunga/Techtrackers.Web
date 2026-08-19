/**
 * vite.config.js
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Replaces react-scripts (Create React App), which is deprecated and no longer
 *   receives security patches. Vite starts the dev server in about a second
 *   instead of ~30s and rebuilds on save almost instantly.
 *
 * WHAT IT ACHIEVES
 *   - `@` alias so imports read `@/components/...` instead of `../../../../`.
 *     The old code had imports five levels deep, which made moving a file a
 *     find-and-replace exercise.
 *   - A dev proxy: the browser calls `/api/v1/...` on the SAME origin as the
 *     app, and Vite forwards it to the Node backend on :5000. That removes CORS
 *     from local development entirely, and means the production build works
 *     unchanged when the API is served from the same domain.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(process.cwd(), 'src') },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5000', ws: true, changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Split the vendor bundle so a change to app code does not force users
        // to re-download all of MUI.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
        },
      },
    },
  },
});
