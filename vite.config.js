import { defineConfig, loadEnv } from 'vite';
import process from 'node:process';
import { createRookHandler } from './server/rook.mjs';
import react from '@vitejs/plugin-react';
import { ROOK_ENDPOINT } from './src/data/rookContract.js';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Server-only credentials. These are never passed to define/import.meta.env.
  const secret = loadEnv('rook', process.cwd(), 'DEEPSEEK_');
  const config = loadEnv(mode, process.cwd(), 'DEEPSEEK_');
  const rook = () =>
    createRookHandler({
      apiKey: secret.DEEPSEEK_API_KEY || config.DEEPSEEK_API_KEY,
      model: secret.DEEPSEEK_MODEL || config.DEEPSEEK_MODEL || 'deepseek-flash',
    });
  return {
    plugins: [
      react(),
      {
        name: 'rook-server',
        configureServer(server) {
          server.middlewares.use(ROOK_ENDPOINT, rook());
        },
        configurePreviewServer(server) {
          server.middlewares.use(ROOK_ENDPOINT, rook());
        },
      },
    ],
    build: { manifest: true },
  };
});
