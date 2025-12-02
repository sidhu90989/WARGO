import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'WARGO',
        short_name: 'WARGO',
        description: 'Eco-friendly ridesharing platform',
        theme_color: '#00A86B',
        background_color: '#ffffff',
        icons: [
          { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
    }),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  // Allow overriding base path for different hosting targets.
  // Hosting at root (Firebase/Cloud Run) should use "/".
  base: process.env.VITE_BASE_PATH || "/",
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
