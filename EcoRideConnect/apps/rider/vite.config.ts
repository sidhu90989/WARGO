import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";

export default defineConfig({
  plugins: [
  // @ts-ignore fastRefresh may not be declared in the published types but is supported at runtime
  react({ fastRefresh: false } as any),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'EcoRide Rider',
        short_name: 'EcoRide Rider',
        description: 'Eco-friendly ridesharing for riders',
        theme_color: '#00A86B',
        background_color: '#ffffff',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "../../client", "src"),
      "@shared": path.resolve(import.meta.dirname, "../../shared"),
      "@assets": path.resolve(import.meta.dirname, "../../attached_assets"),
      "@app": path.resolve(import.meta.dirname, "./src"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "../../dist/rider"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("firebase")) return "vendor-firebase";
            if (id.includes("@tanstack")) return "vendor-query";
            if (id.includes("wouter")) return "vendor-router";
            if (id.includes("react")) return "vendor-react";
            if (id.includes("@radix-ui")) return "vendor-radix";
            if (id.includes("@vis.gl")) return "vendor-maps";
            if (id.includes("stripe")) return "vendor-stripe";
            if (id.includes("embla-carousel")) return "vendor-embla";
            return "vendor";
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  base: process.env.VITE_BASE_PATH || "/",
  server: {
    port: 5173,
    host: true,
    open: false,
  },
});
