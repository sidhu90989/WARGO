import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Optional root Vite config for unified builds. Per-app configs under apps/* remain primary.
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
