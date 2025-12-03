import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";

const cacheBustPlugin = (): Plugin => ({
  name: 'cache-bust-html',
  transformIndexHtml(html) {
    const timestamp = Date.now();
    return html.replace(/(<script[^>]*src="[^"]+")>/g, `$1?v=${timestamp}>`);
  },
});

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: [],
        babelrc: false,
        configFile: false,
      },
    }),
    cacheBustPlugin(),
    // Temporarily disable PWA to avoid service worker caching issues.
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   manifest: {
    //     name: 'WARGO PARTNER',
    //     short_name: 'WARGO Driver',
    //     description: 'WARGO Partner Driver Application',
    //     theme_color: '#000000',
    //     background_color: '#ffffff',
    //     icons: [
    //       { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    //     ],
    //   },
    // }),
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
    outDir: path.resolve(import.meta.dirname, "../../dist/driver"),
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
    port: 5174,
    open: false,
  },
});
