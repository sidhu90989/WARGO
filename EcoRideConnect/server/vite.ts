import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Choose which SPA to serve via the API dev server (rider|driver|admin)
  const serveApp = process.env.SERVE_APP || "rider";

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };
  // Use the selected app's directory as Vite root so imports like /src/main.tsx
  // resolve correctly when serving through the API dev server.
  const appRoot = path.resolve(import.meta.dirname, "..", `${serveApp}-app`);

  const vite = await createViteServer({
    ...viteConfig,
    root: appRoot,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Allow serving one of the role-specific SPAs through the API dev server
      // Set SERVE_APP to "rider", "driver", or "admin" to pick which SPA's index.html
      const serveApp = process.env.SERVE_APP || "rider";
      const candidatePaths = [
        path.resolve(import.meta.dirname, "..", `${serveApp}-app`, "index.html"),
        // legacy fallback for older repos
        path.resolve(import.meta.dirname, "..", "client", "index.html"),
      ];

      let clientTemplate: string | undefined;
      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          clientTemplate = p;
          break;
        }
      }

      if (!clientTemplate) {
        throw Object.assign(new Error("index.html not found for any SPA"), { code: "ENOENT" });
      }

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      // If the legacy client index.html is missing (multi-app setup), serve a simple landing page
      if (err.code === "ENOENT") {
        const page = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>EcoRide API (Dev)</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 2rem; line-height: 1.6; }
      code { background: #f4f4f5; padding: 0 .25rem; border-radius: 4px; }
      ul { margin: .5rem 0 0 1.25rem; }
    </style>
  </head>
  <body>
    <h1>EcoRide API server is running</h1>
    <p>This repository now uses three separate SPAs for development. Open them directly:</p>
    <ul>
      <li>Admin: <a href="http://localhost:5173" target="_blank">http://localhost:5173</a></li>
      <li>Driver: <a href="http://localhost:5174" target="_blank">http://localhost:5174</a></li>
      <li>Rider: <a href="http://localhost:5175" target="_blank">http://localhost:5175</a></li>
    </ul>
    <p>Tip: run <code>npm run dev:apps</code> to start all three Vite servers.</p>
  </body>
</html>`;
        return res.status(200).set({ "Content-Type": "text/html" }).end(page);
        return res.status(200).set({ "Content-Type": "text/html" }).end(page);
      }
      vite.ssrFixStacktrace(err);
      next(err);
    }
  });
}

export function serveStatic(app: Express) {
  // Support serving one of the SPA builds directly from server on port 5000
  // Specify APP_TARGET=rider|driver|admin to use EcoRideConnect/dist/<target>
  const target = process.env.APP_TARGET as "rider" | "driver" | "admin" | undefined;
  const spaDistPath = target
    ? path.resolve(import.meta.dirname, "..", "dist", target)
    : undefined;

  const distPath = spaDistPath && fs.existsSync(spaDistPath)
    ? spaDistPath
    : path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}. Build the SPA (APP_TARGET=${target ?? 'rider|driver|admin'}) or the legacy client first.`,
    );
  }

  app.use(express.static(distPath));

  // Explicitly serve PWA icons from dist to avoid HTML fallback content-type
  const distIcons = path.resolve(distPath, "icons");
  app.get("/icons/:file", (req, res) => {
    const file = req.params.file;
    const iconPath = path.resolve(distIcons, file);
    if (fs.existsSync(iconPath)) {
      return res.sendFile(iconPath);
    }
    // Not found: return 404 so SPA fallback does not take over for assets
    res.status(404).end();
  });

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
