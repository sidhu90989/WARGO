import { config } from "dotenv";
config(); // Load environment variables from .env file

import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import session from "express-session";
import MemoryStoreFactory from "memorystore";
import connectRedis from "connect-redis";
import { createClient as createRedisClient } from "redis";
import { registerRoutes } from "./routes";
import "./env"; // validate env at startup

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

// CORS for separate frontend origins while sending cookies
// Prefer FRONTEND_ORIGIN as a comma-separated list; otherwise, default to common dev ports
// and any explicit RIDER_ORIGIN/DRIVER_ORIGIN/ADMIN_ORIGIN values.
{
  const origins = new Set<string>();
  const add = (v?: string) => {
    if (!v) return;
    v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((s) => origins.add(s));
  };
  add(process.env.FRONTEND_ORIGIN);
  add(process.env.RIDER_ORIGIN);
  add(process.env.DRIVER_ORIGIN);
  add(process.env.ADMIN_ORIGIN);
  // Local dev defaults
  ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"].forEach((d) => origins.add(d));

  app.use(
    cors({
      origin: Array.from(origins),
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

// Optional Redis-backed session store
let sessionStore: session.Store;
if (process.env.REDIS_URL) {
  const RedisStore = connectRedis(session);
  const redisClient = createRedisClient({ url: process.env.REDIS_URL });
  redisClient.on('error', (err) => console.error('[redis] client error:', err));
  // connect asynchronously; do not block server start
  redisClient.connect().catch((e) => console.error('[redis] connect failed:', e));
  sessionStore = new RedisStore({ client: redisClient, prefix: 'sess:' });
} else {
  sessionStore = new MemoryStore({ checkPeriod: 1000 * 60 * 60 });
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    proxy: true,
    cookie: {
      secure: useSecureCookies,
      httpOnly: true,
      sameSite: sameSitePolicy,
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
);

// Basic rate limiting (per IP)
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false });
const rideCreateLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });
app.use('/api', apiLimiter);
app.use(['/api/auth', '/api/create-payment-intent'], authLimiter);
app.use('/api/rides', (req, res, next) => {
  // Only rate-limit creation: POST /api/rides
  if (req.method === 'POST' && (req.path === '/' || req.path === '')) {
    return rideCreateLimiter(req, res, next);
  }
  return next();
});

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

  // Export app for Firebase Functions
  if (process.env.FIREBASE_FUNCTIONS) {
    log('Exporting app for Firebase Functions');
    module.exports = app;
    module.exports.default = app;
    module.exports.app = app;
    return;
  }

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
