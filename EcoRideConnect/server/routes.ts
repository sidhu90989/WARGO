import { config } from "dotenv";
config(); // Load environment variables

import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { z } from "zod";
import Stripe from "stripe";
import { trackLiveRide, setRideStatus, clearRideTracking } from "./integrations/firebaseRealtimeDb";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import nameApi from "./integrations/nameApi";

// Flags
const SIMPLE_AUTH = process.env.SIMPLE_AUTH === "true";
const ALLOW_SIMPLE_AUTH_ANON = process.env.ALLOW_SIMPLE_AUTH_ANON === 'true';
console.log("🔧 Environment check:", {
  SIMPLE_AUTH,
  ALLOW_SIMPLE_AUTH_ANON,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? "SET" : "NOT SET",
  NODE_ENV: process.env.NODE_ENV
});

// Initialize Firebase Admin unless using SIMPLE_AUTH
if (!SIMPLE_AUTH) {
  if (!admin.apps.length) {
    // Prefer explicit service account (path or inline JSON) else fallback to ADC
    const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
    const keyJsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON; // raw JSON or base64-encoded JSON
    try {
      if (keyJsonEnv && keyJsonEnv.trim().length > 0) {
        let jsonStr = keyJsonEnv.trim();
        // If looks like base64, try to decode; otherwise assume raw JSON
        try {
          if (!jsonStr.trim().startsWith('{')) {
            jsonStr = Buffer.from(jsonStr, 'base64').toString('utf8');
          }
        } catch {
          // ignore, will try to parse as-is
        }
        const json = JSON.parse(jsonStr);
        admin.initializeApp({
          credential: admin.credential.cert(json as any),
        });
      } else if (keyPath) {
        const resolved = path.isAbsolute(keyPath)
          ? keyPath
          : path.resolve(process.cwd(), keyPath);
        const json = JSON.parse(fs.readFileSync(resolved, "utf8"));
        const initConfig: any = {
          credential: admin.credential.cert(json as any),
        };
        if (process.env.FIREBASE_DATABASE_URL) {
          initConfig.databaseURL = process.env.FIREBASE_DATABASE_URL;
        }
        admin.initializeApp(initConfig);
      } else {
        const initConfig: any = {};
        if (process.env.FIREBASE_DATABASE_URL) {
          initConfig.databaseURL = process.env.FIREBASE_DATABASE_URL;
        }
        admin.initializeApp(initConfig);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[firebase-admin] initialization failed:", e);
      throw e;
    }
  }
}

// Initialize Stripe only if not SIMPLE_AUTH
const stripe: Stripe | null = (() => {
  if (SIMPLE_AUTH) return null;
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
})();

// Helper to verify Firebase token
async function verifyFirebaseToken(req: any, res: any, next: any) {
  // Always allow a valid session user in development or when using simple auth.
  // This enables a hybrid mode: SIMPLE_AUTH can be false (DB mode) while
  // the client uses a simple session login for local testing.
  if (req.session?.user) {
    req.firebaseUid = req.session.user.firebaseUid;
    req.email = req.session.user.email;
    return next();
  }

  // Header-based bypass for local testing when simple auth routes are allowed
  if (process.env.ALLOW_SIMPLE_AUTH_ROUTES === 'true') {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[auth] header-bypass verification', {
        path: req.path,
        emailHeader: req.header('x-simple-email'),
        roleHeader: req.header('x-simple-role'),
        rawEmail: (req.headers as any)['x-simple-email'],
        rawHeadersKeys: Object.keys(req.headers || {}),
      });
    }
    const emailHeader = req.header('x-simple-email');
    const roleHeader = req.header('x-simple-role') || 'rider';
    if (emailHeader) {
      const firebaseUid = `local-${emailHeader}`;
      req.firebaseUid = firebaseUid;
      req.email = emailHeader;
      if (req.session) {
        req.session.user = {
          firebaseUid,
          email: emailHeader,
          name: emailHeader.split('@')[0],
          role: roleHeader,
        };
      }
      return next();
    }

    // Dev convenience: if the client forgot to send headers, allow the
    // complete-profile request to proceed using the posted name/role.
    // This keeps local onboarding unblocked while we stabilize the clients.
    if (req.path === '/api/auth/complete-profile' && req.body && req.body.name) {
      const role = (req.body.role as string) || 'rider';
      const email = `${String(req.body.name).toLowerCase().split(' ').join('.')}@example.com`;
      const firebaseUid = `local-${email}`;
      req.firebaseUid = firebaseUid;
      req.email = email;
      if (req.session) {
        req.session.user = {
          firebaseUid,
          email,
          name: req.body.name,
          role,
        };
      }
      return next();
    }
  }

  if (SIMPLE_AUTH) {
    if (ALLOW_SIMPLE_AUTH_ANON) {
      req.firebaseUid = 'local-anon';
      req.email = 'anon@local';
      return next();
    }
    // If we expected simple auth but no session/header is present, reject.
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.substring(7);
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.firebaseUid = decodedToken.uid;
    req.email = decodedToken.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Simple auth routes for local testing
function registerSimpleAuth(app: Express) {
  app.post('/api/auth/login', (req: any, res) => {
    const { email, name, role } = req.body || {};
    if (!email || !name || !role) {
      return res.status(400).json({ error: 'email, name, and role are required' });
    }
    // Ensure a fresh session and explicitly persist so Set-Cookie is sent reliably in all environments
    req.session.regenerate((err: any) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error('[auth] session regenerate failed:', err);
        return res.status(500).json({ error: 'Session error' });
      }
      req.session.user = {
        firebaseUid: `local-${email}`,
        email,
        name,
        role,
      };
      req.session.save((saveErr: any) => {
        if (saveErr) {
          // eslint-disable-next-line no-console
          console.error('[auth] session save failed:', saveErr);
          return res.status(500).json({ error: 'Session save error' });
        }
        res.json({ success: true });
      });
    });
  });

  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });
}

// Helper to generate referral code
function generateReferralCode(name: string): string {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const namePart = name.substring(0, 3).toUpperCase();
  return `${namePart}${randomPart}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Zod validation helpers
  const validateBody = (schema: z.ZodTypeAny) => (req: any, res: any, next: any) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    req.body = parsed.data;
    next();
  };
  const validateParams = (schema: z.ZodTypeAny) => (req: any, res: any, next: any) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    req.params = parsed.data;
    next();
  };

  // Schemas
  const idParamSchema = z.object({ id: z.string().min(1) });
  const createRideSchema = z.object({
    pickupLocation: z.string().min(1),
    pickupLat: z.coerce.number(),
    pickupLng: z.coerce.number(),
    dropoffLocation: z.string().min(1),
    dropoffLat: z.coerce.number(),
    dropoffLng: z.coerce.number(),
    vehicleType: z.enum(["e_rickshaw", "e_scooter", "cng_car"]),
    femalePrefRequested: z.coerce.boolean().optional(),
  });
  const completeRideSchema = z.object({
    actualFare: z.coerce.number().optional(),
  });
  const availabilitySchema = z.object({ available: z.coerce.boolean() });
  // Enable simple auth routes either when SIMPLE_AUTH=true or when explicitly
  // allowed via env for hybrid development with a real database.
  if (SIMPLE_AUTH || process.env.ALLOW_SIMPLE_AUTH_ROUTES === 'true') {
    // eslint-disable-next-line no-console
    console.log(`[auth] registering simple-auth routes (SIMPLE_AUTH=${SIMPLE_AUTH}, ALLOW_SIMPLE_AUTH_ROUTES=${process.env.ALLOW_SIMPLE_AUTH_ROUTES})`);
    registerSimpleAuth(app);
  }
  // Authentication routes
  // Support both GET and POST for verify for flexibility
  const verifyHandler = async (req: any, res: any) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
  app.get("/api/auth/verify", verifyFirebaseToken, verifyHandler);
  app.post("/api/auth/verify", verifyFirebaseToken, verifyHandler);

  app.post("/api/auth/complete-profile", verifyFirebaseToken, async (req: any, res) => {
    try {
      const { name, phone, role } = req.body;
      if (!name || !role) {
        return res.status(400).json({ error: "Missing required fields: name, role" });
      }
      
      // Check if user already exists
      let user = await storage.getUserByFirebaseUid(req.firebaseUid);
      
      if (user) {
        return res.json(user);
      }

      // Create new user
      const referralCode = generateReferralCode(name);
      
      user = await storage.createUser({
        firebaseUid: req.firebaseUid,
        email: req.email || `${name.toLowerCase().split(' ').join('.')}@example.com`,
        name,
        phone,
        role,
        referralCode,
        ecoPoints: 0,
        totalCO2Saved: '0',
        isActive: true,
      });

      // If driver, create driver profile
      if (role === 'driver') {
        // Ensure vehicleNumber is unique to avoid conflicts with the unique constraint
        const uniqueSuffix = (user.id || '').slice(0, 8) || Math.random().toString(36).slice(2, 10);
        await storage.createDriverProfile({
          userId: user.id,
          vehicleType: 'e_rickshaw',
          vehicleNumber: `PENDING-${uniqueSuffix}`,
          licenseNumber: `PENDING-${uniqueSuffix}`,
          kycStatus: 'pending',
          rating: '5.00',
          totalRides: 0,
          totalEarnings: '0',
          isAvailable: false,
          femalePrefEnabled: false,
        });
      }

      res.json(user);
    } catch (error: any) {
      // Improved diagnostics in development
      // eslint-disable-next-line no-console
      console.error("/api/auth/complete-profile error:", error);
      const message = (() => {
        if (!error) return 'Unknown error';
        if (typeof error === 'string') return error;
        if (error.message) return error.message;
        try { return JSON.stringify(error); } catch { return String(error); }
      })();
      if (process.env.NODE_ENV !== 'production') {
        return res.status(500).json({ error: message });
      }
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Simple health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, mode: SIMPLE_AUTH ? 'simple' : 'full' });
  });

  // External Name API sanity endpoint (server-side only)
  app.get('/api/integrations/name-api/whoami', async (_req, res) => {
    try {
      const data = await nameApi.whoAmI();
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  });

  // Rider routes
  app.get("/api/rider/stats", verifyFirebaseToken, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const stats = await storage.getRiderStats(user.id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/rider/rides", verifyFirebaseToken, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const rides = await storage.getUserRides(user.id, 'rider');
      res.json(rides);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/rider/badges", verifyFirebaseToken, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const allBadges = await storage.getAllBadges();
      const userBadges = await storage.getUserBadges(user.id);
      const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));
      
      const badgesWithStatus = allBadges.map(badge => ({
        ...badge,
        earned: earnedBadgeIds.has(badge.id),
      }));
      
      res.json(badgesWithStatus);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Ride routes - RIDERS ONLY can create rides
  app.post("/api/rides", verifyFirebaseToken, validateBody(createRideSchema), async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Only riders can create ride requests
      if (user.role !== 'rider') {
        return res.status(403).json({ error: 'Only riders can request rides' });
      }

      const { pickupLocation, pickupLat, pickupLng, dropoffLocation, dropoffLat, dropoffLng, vehicleType, femalePrefRequested } = req.body;

      // Calculate estimated fare, distance and eco impact
      const { estimateRide } = await import("@shared/services/ridePricingService");
      const est = estimateRide({
        pickup: { lat: Number(pickupLat), lng: Number(pickupLng) },
        drop: { lat: Number(dropoffLat), lng: Number(dropoffLng) },
        vehicleType,
        femalePrefRequested: !!femalePrefRequested,
      });

      const ride = await storage.createRide({
        riderId: user.id,
        pickupLocation,
        pickupLat,
        pickupLng,
        dropoffLocation,
        dropoffLat,
        dropoffLng,
        vehicleType,
        femalePrefRequested,
        status: 'pending',
        distance: est.distanceKm.toFixed(2),
        estimatedFare: est.estimatedFare.toFixed(2),
        co2Saved: est.co2SavedKg.toFixed(2),
        ecoPointsEarned: est.ecoPoints,
      });

      res.json(ride);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/rides/:id", verifyFirebaseToken, validateParams(idParamSchema), async (req: any, res) => {
    try {
      const ride = await storage.getRide(req.params.id);
      if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
      }
      res.json(ride);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DRIVERS ONLY can accept rides
  app.post("/api/rides/:id/accept", verifyFirebaseToken, validateParams(idParamSchema), async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Only drivers can accept rides
      if (user.role !== 'driver') {
        return res.status(403).json({ error: 'Only drivers can accept rides' });
      }

      const ride = await storage.getRide(req.params.id);
      if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
      }

      // Check if ride is still pending
      if (ride.status !== 'pending') {
        return res.status(400).json({ error: 'Ride is no longer available' });
      }

      // Check if driver is available
      const driverProfile = await storage.getDriverProfile(user.id);
      if (!driverProfile?.isAvailable) {
        return res.status(400).json({ error: 'Driver is not available' });
      }

      const updatedRide = await storage.updateRide(req.params.id, {
        driverId: user.id,
        status: 'accepted',
        acceptedAt: new Date(),
      });

      res.json(updatedRide);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/rides/:id/complete", verifyFirebaseToken, validateParams(idParamSchema), validateBody(completeRideSchema), async (req: any, res) => {
    try {
      const { actualFare } = req.body;
      const ride = await storage.getRide(req.params.id);
      
      if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
      }

      const updatedRide = await storage.updateRide(req.params.id, {
        status: 'completed',
        actualFare: actualFare || ride.estimatedFare,
        completedAt: new Date(),
      });

      // Clear real-time tracking from Firebase (ride complete)
      await clearRideTracking(req.params.id).catch(err => 
        console.error('Firebase cleanup error:', err)
      );

      // Update rider eco points and CO2
      const rider = await storage.getUser(ride.riderId);
      if (rider) {
        const newEcoPoints = rider.ecoPoints + (ride.ecoPointsEarned || 0);
        const newCO2 = (Number(rider.totalCO2Saved) + Number(ride.co2Saved || 0)).toString();
        const updatedRider = await storage.updateUser(ride.riderId, {
          ecoPoints: newEcoPoints,
          totalCO2Saved: newCO2,
        });

        // Badge awarding: grant any badges with requiredPoints <= newEcoPoints that are not yet earned
        try {
          const [allBadges, userBadges] = await Promise.all([
            storage.getAllBadges(),
            storage.getUserBadges(updatedRider.id),
          ]);
          const earned = new Set(userBadges.map((b) => b.badgeId));
          const toAward = allBadges.filter((b) => (b.requiredPoints ?? 0) <= newEcoPoints && !earned.has(b.id));
          await Promise.all(
            toAward.map((b) => storage.awardBadge({ userId: updatedRider.id, badgeId: b.id }))
          );
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('[badges] awarding failed:', e);
        }
      }

      // Update driver stats
      if (ride.driverId) {
        const driverProfile = await storage.getDriverProfile(ride.driverId);
        if (driverProfile) {
          await storage.updateDriverProfile(ride.driverId, {
            totalRides: driverProfile.totalRides + 1,
            totalEarnings: (Number(driverProfile.totalEarnings) + Number(actualFare || ride.estimatedFare)).toString(),
          });
        }
      }

      res.json(updatedRide);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Start ride (driver only)
  app.post("/api/rides/:id/start", verifyFirebaseToken, validateParams(idParamSchema), async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const ride = await storage.getRide(req.params.id);
      if (!ride) return res.status(404).json({ error: 'Ride not found' });
      if (ride.driverId && ride.driverId !== user.id) {
        return res.status(403).json({ error: 'Not your ride' });
      }

      const updated = await storage.updateRide(req.params.id, {
        driverId: ride.driverId || user.id,
        status: 'in_progress',
        startedAt: new Date(),
      });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // SOS trigger (rider only - but keep simple)
  app.post("/api/rides/:id/sos", verifyFirebaseToken, validateParams(idParamSchema), async (req: any, res) => {
    try {
      const ride = await storage.getRide(req.params.id);
      if (!ride) return res.status(404).json({ error: 'Ride not found' });
      // Here we could notify admins/drivers via WebSocket, SMS, etc.
      // For now, just respond OK and mark a timestamp note if desired.
      await storage.updateRide(req.params.id, { } as any);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Real-time location tracking endpoint (driver/rider)
  const locationUpdateSchema = z.object({
    lat: z.coerce.number(),
    lng: z.coerce.number(),
    heading: z.coerce.number().optional(),
    speed: z.coerce.number().optional(),
  });
  app.post("/api/rides/:id/location", verifyFirebaseToken, validateParams(idParamSchema), validateBody(locationUpdateSchema), async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const ride = await storage.getRide(req.params.id);
      if (!ride) return res.status(404).json({ error: 'Ride not found' });

      // Verify user is part of this ride
      if (ride.riderId !== user.id && ride.driverId !== user.id) {
        return res.status(403).json({ error: 'Not authorized for this ride' });
      }

      const { lat, lng, heading, speed } = req.body;
      const who = user.id === ride.driverId ? 'driver' : 'rider';

      // Persist to Firebase Realtime DB
      await trackLiveRide(req.params.id, lat, lng, who, { heading, speed });

      res.json({ success: true, timestamp: Date.now() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get current ride tracking data from Firebase Realtime DB
  app.get("/api/rides/:id/location", verifyFirebaseToken, validateParams(idParamSchema), async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const ride = await storage.getRide(req.params.id);
      if (!ride) return res.status(404).json({ error: 'Ride not found' });

      // Verify user is part of this ride
      if (ride.riderId !== user.id && ride.driverId !== user.id) {
        return res.status(403).json({ error: 'Not authorized for this ride' });
      }

      // Read from Firebase Realtime DB
      const db = admin.database();
      const snapshot = await db.ref(`active_rides/${req.params.id}`).once('value');
      const tracking = snapshot.val();

      if (!tracking) {
        return res.json({ rideId: req.params.id, locations: {} });
      }

      res.json(tracking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Driver routes
  app.get("/api/driver/stats", verifyFirebaseToken, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const stats = await storage.getDriverStats(user.id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DRIVERS ONLY - get pending ride requests to accept
  app.get("/api/driver/pending-rides", verifyFirebaseToken, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Only drivers can see pending rides
      if (user.role !== 'driver') {
        return res.status(403).json({ error: 'Only drivers can view pending rides' });
      }

      // Check if driver is available
      const driverProfile = await storage.getDriverProfile(user.id);
      if (!driverProfile?.isAvailable) {
        return res.json([]); // No rides if driver is offline
      }

      const rides = await storage.getPendingRides();
      res.json(rides);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DRIVERS ONLY - toggle availability to receive ride requests
  app.put("/api/driver/availability", verifyFirebaseToken, validateBody(availabilitySchema), async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Only drivers can set availability
      if (user.role !== 'driver') {
        return res.status(403).json({ error: 'Only drivers can set availability' });
      }

      const { available } = req.body;
      await storage.updateDriverProfile(user.id, {
        isAvailable: available,
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", verifyFirebaseToken, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/active-rides", verifyFirebaseToken, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      const rides = await storage.getActiveRides();
      res.json(rides);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe payment route
  app.post("/api/create-payment-intent", verifyFirebaseToken, async (req: any, res) => {
    try {
      const { amount } = req.body;
      if (!stripe) {
        // Mock response for SIMPLE_AUTH/dev mode
        return res.json({ clientSecret: `mock_${Math.round(amount * 100)}` });
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "inr",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // For Firebase Functions, we don't create HTTP server or Socket.IO here
  // Socket.IO requires ws transport which isn't supported in Cloud Functions
  // Return the Express app directly for Firebase Functions compatibility
  if (process.env.FIREBASE_FUNCTIONS) {
    console.log('[routes] Running in Firebase Functions mode - Socket.IO disabled');
    return app as any;
  }

  const httpServer = createServer(app);

  // Build allowed origins similar to express CORS in index.ts
  const ioOrigins = new Set<string>();
  const addOrigin = (v?: string) => {
    if (!v) return;
    v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((s) => ioOrigins.add(s));
  };
  addOrigin(process.env.FRONTEND_ORIGIN);
  addOrigin(process.env.RIDER_ORIGIN);
  addOrigin(process.env.DRIVER_ORIGIN);
  addOrigin(process.env.ADMIN_ORIGIN);
  ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"].forEach((d) => ioOrigins.add(d));

  // Socket.IO server for real-time updates
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: Array.from(ioOrigins),
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
    path: "/socket.io",
  });

  io.on('connection', (socket) => {
    console.log('Client connected to Socket.IO');

    socket.on('disconnect', () => {
      console.log('Client disconnected from Socket.IO');
    });

    // Receive location updates from drivers/riders and broadcast
    socket.on('location_update', async (data: any) => {
      try {
        const payload = {
          rideId: data?.rideId,
          lat: Number(data?.lat),
          lng: Number(data?.lng),
          who: data?.who || 'unknown',
          heading: data?.heading,
          speed: data?.speed,
          at: Date.now(),
        };
        // Broadcast via Socket.IO
        io.emit('driver_location', payload);
        
        // Also persist to Firebase Realtime DB for redundancy and historical tracking
        if (payload.rideId && !isNaN(payload.lat) && !isNaN(payload.lng)) {
          await trackLiveRide(
            payload.rideId,
            payload.lat,
            payload.lng,
            payload.who,
            { heading: payload.heading, speed: payload.speed }
          ).catch(err => console.error('Firebase tracking error:', err));
        }
      } catch (e) {
        console.error('socket.on(location_update) error:', e);
      }
    });

    // Relay ride status updates and sync to Firebase Realtime DB
    socket.on('ride_status_update', async (data: any) => {
      const payload = { ...data, at: Date.now() };
      io.emit('ride_status_update', payload);
      
      // Sync status to Firebase Realtime DB
      if (data?.rideId && data?.status) {
        await setRideStatus(data.rideId, data.status).catch(err => 
          console.error('Firebase status sync error:', err)
        );
      }
    });

    // Placeholder: new ride request broadcast
    socket.on('ride_request', (data: any) => {
      io.emit('ride_request', { ...data, at: Date.now() });
    });
  });

  return httpServer;
}
