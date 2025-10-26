import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /\/ws(\/|$)/],
      },
      includeAssets: ['icons/icon-192x192.png','icons/icon-512x512.png'],
      manifest: {
        name: 'Surya Ride — Driver',
        short_name: 'Driver',
        description: 'Driver app for Surya Ride',
        theme_color: '#00A86B',
        background_color: '#ffffff',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '..', 'client', 'src'),
      '@shared': path.resolve(import.meta.dirname, '..', 'shared'),
      '@types': path.resolve(import.meta.dirname, '..', 'shared', 'types'),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, '..', 'dist', 'driver'),
    emptyOutDir: true,
  },
  base: '/',
})
