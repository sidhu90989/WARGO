import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'WARGO Admin',
        short_name: 'WARGO Admin',
        description: 'WARGO Platform Administration',
        theme_color: '#1a365d',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
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
    outDir: path.resolve(import.meta.dirname, "../../dist/admin"),
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
    port: 5175,
    open: false,
  },
});
