import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { cloudflareWorkerPlugin } from './scripts/vite-cloudflare-worker-plugin.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cloudflareWorkerPlugin()
  ],
  server: {
    host: true
  }
});
