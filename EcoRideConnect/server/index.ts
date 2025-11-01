import { config } from "dotenv";
config(); // Load environment variables from .env file

import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import MemoryStoreFactory from "memorystore";
import { registerRoutes } from "./routes";

const app = express();

function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  // eslint-disable-next-line no-console
  console.log(`${formattedTime} [${source}] ${message}`);
}
// Trust the first proxy (required for secure cookies behind proxies like Codespaces)
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS for separate frontend origin while sending cookies
if (process.env.FRONTEND_ORIGIN) {
  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN.split(',').map((s) => s.trim()),
      credentials: true,
    }),
  );
}

// Session setup for SIMPLE_AUTH/local dev flows
const MemoryStore = MemoryStoreFactory(session);
const isCodespaces = !!process.env.CODESPACES;
const forceSecure = process.env.COOKIE_SECURE === 'true';
const useSecureCookies = isCodespaces || forceSecure;
const sameSitePolicy: "lax" | "none" = useSecureCookies ? "none" : "lax";
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({ checkPeriod: 1000 * 60 * 60 }), // prune expired every hour
    proxy: true, // honor X-Forwarded-* headers for secure cookies
    cookie: {
      secure: useSecureCookies, // required when served over HTTPS via proxy
      httpOnly: true,
      sameSite: sameSitePolicy,
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  }),
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});


(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Frontend is now served by per-app dev servers / static hosts.
  // The API server no longer serves the client assets.

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
