// server/index.ts
import { config as config4 } from "dotenv";
import express from "express";
import cors from "cors";
import session from "express-session";
import MemoryStoreFactory from "memorystore";

// server/routes.ts
import { config as config3 } from "dotenv";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/storage.ts
import { config as config2 } from "dotenv";
import { customAlphabet } from "nanoid";
import admin2 from "firebase-admin";

// server/firebaseAdmin.ts
import { config } from "dotenv";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
config();
function ensureFirebaseAdmin() {
  if (admin.apps.length) {
    return admin.app();
  }
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  try {
    if (projectId) {
      process.env.GOOGLE_CLOUD_PROJECT = projectId;
      process.env.GCLOUD_PROJECT = projectId;
    }
    if (keyPath) {
      const resolved = path.isAbsolute(keyPath) ? keyPath : path.resolve(process.cwd(), keyPath);
      const json = JSON.parse(fs.readFileSync(resolved, "utf8"));
      const pid = json.project_id || projectId;
      const app3 = admin.initializeApp({
        credential: admin.credential.cert(json),
        projectId: pid
      });
      if (pid) {
        process.env.GOOGLE_CLOUD_PROJECT = pid;
        process.env.GCLOUD_PROJECT = pid;
      }
      return app3;
    }
    if (saJson) {
      const json = JSON.parse(saJson);
      const pid = json.project_id || projectId;
      const app3 = admin.initializeApp({
        credential: admin.credential.cert(json),
        projectId: pid
      });
      if (pid) {
        process.env.GOOGLE_CLOUD_PROJECT = pid;
        process.env.GCLOUD_PROJECT = pid;
      }
      return app3;
    }
    if (projectId && clientEmail && privateKey) {
      const app3 = admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        projectId
      });
      return app3;
    }
    const app2 = admin.initializeApp();
    return app2;
  } catch (e) {
    console.error("[firebase-admin] initialization failed:", e);
    throw e;
  }
}

// server/storage.ts
config2();
console.log(`[storage] module initialized. SIMPLE_AUTH=${process.env.SIMPLE_AUTH} DATABASE_URL=${process.env.DATABASE_URL ? "SET" : "MISSING"}`);
var StorageSelector = class {
  static instance;
  static getInstance() {
    if (!this.instance) {
      const simple = process.env.SIMPLE_AUTH === "true";
      const backend = process.env.STORAGE || "";
      console.log(`[storage] selecting storage. SIMPLE_AUTH=${process.env.SIMPLE_AUTH} STORAGE=${backend}`);
      if (simple) {
        this.instance = new MemoryStorage();
      } else if (backend.toLowerCase() === "firestore") {
        this.instance = new FirestoreStorage();
      } else {
        this.instance = new FirestoreStorage();
      }
      const label = this.instance.constructor.name;
      console.log(`[storage] using ${label}`);
    }
    return this.instance;
  }
};
var FirestoreStorage = class {
  db = (() => {
    ensureFirebaseAdmin();
    return admin2.firestore();
  })();
  col(name) {
    return this.db.collection(name);
  }
  // Users
  async getUser(id) {
    const snap = await this.col("users").doc(id).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : void 0;
  }
  async getUserByEmail(email) {
    const q = await this.col("users").where("email", "==", email).limit(1).get();
    const doc = q.docs[0];
    return doc ? { id: doc.id, ...doc.data() } : void 0;
  }
  async getUserByFirebaseUid(firebaseUid) {
    const q = await this.col("users").where("firebaseUid", "==", firebaseUid).limit(1).get();
    const doc = q.docs[0];
    return doc ? { id: doc.id, ...doc.data() } : void 0;
  }
  async createUser(user) {
    const now = /* @__PURE__ */ new Date();
    const data = { ...user, createdAt: now, updatedAt: now };
    const docRef = await this.col("users").add(data);
    const snap = await docRef.get();
    return { id: docRef.id, ...snap.data() };
  }
  async updateUser(id, updates) {
    const data = { ...updates, updatedAt: /* @__PURE__ */ new Date() };
    await this.col("users").doc(id).set(data, { merge: true });
    const snap = await this.col("users").doc(id).get();
    return { id, ...snap.data() };
  }
  // Driver profiles (doc id = userId for easy lookup)
  async getDriverProfile(userId) {
    const snap = await this.col("driverProfiles").doc(userId).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : void 0;
  }
  async createDriverProfile(profile) {
    const data = { ...profile, createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() };
    await this.col("driverProfiles").doc(profile.userId).set(data);
    const snap = await this.col("driverProfiles").doc(profile.userId).get();
    return { id: snap.id, ...snap.data() };
  }
  async updateDriverProfile(userId, updates) {
    const data = { ...updates, updatedAt: /* @__PURE__ */ new Date() };
    await this.col("driverProfiles").doc(userId).set(data, { merge: true });
    const snap = await this.col("driverProfiles").doc(userId).get();
    return { id: snap.id, ...snap.data() };
  }
  // Rides
  async createRide(ride) {
    const data = { ...ride, requestedAt: /* @__PURE__ */ new Date(), createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() };
    const ref = await this.col("rides").add(data);
    const snap = await ref.get();
    return { id: ref.id, ...snap.data() };
  }
  async getRide(id) {
    const snap = await this.col("rides").doc(id).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : void 0;
  }
  async getUserRides(userId, role) {
    const key = role === "rider" ? "riderId" : "driverId";
    const q = await this.col("rides").where(key, "==", userId).orderBy("createdAt", "desc").get();
    return q.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  async getPendingRides() {
    const q = await this.col("rides").where("status", "==", "pending").orderBy("requestedAt", "asc").get();
    return q.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  async getActiveRides() {
    const q1 = await this.col("rides").where("status", "==", "accepted").get();
    const q2 = await this.col("rides").where("status", "==", "in_progress").get();
    const docs = [...q1.docs, ...q2.docs].sort((a, b) => +new Date(b.data().requestedAt || 0) - +new Date(a.data().requestedAt || 0));
    return docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  async updateRide(id, updates) {
    await this.col("rides").doc(id).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }, { merge: true });
    const snap = await this.col("rides").doc(id).get();
    return { id, ...snap.data() };
  }
  // Payments
  async createPayment(payment) {
    const ref = await this.col("payments").add({ ...payment, createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() });
    const snap = await ref.get();
    return { id: ref.id, ...snap.data() };
  }
  async getPaymentByRide(rideId) {
    const q = await this.col("payments").where("rideId", "==", rideId).limit(1).get();
    const d = q.docs[0];
    return d ? { id: d.id, ...d.data() } : void 0;
  }
  // Ratings
  async createRating(rating) {
    const ref = await this.col("ratings").add({ ...rating, createdAt: /* @__PURE__ */ new Date() });
    const snap = await ref.get();
    return { id: ref.id, ...snap.data() };
  }
  async getDriverRatings(driverId) {
    const q = await this.col("ratings").where("rateeId", "==", driverId).orderBy("createdAt", "desc").get();
    return q.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  // Badges
  async getAllBadges() {
    const q = await this.col("ecoBadges").get();
    if (q.empty) {
      const seed = [
        { name: "Green Beginner", description: "Complete your first eco-friendly ride", iconName: "leaf", requiredPoints: 10 },
        { name: "Eco Warrior", description: "Save 10kg of CO\u2082", iconName: "shield", requiredPoints: 100 },
        { name: "Planet Protector", description: "Complete 25 eco-rides", iconName: "globe", requiredPoints: 250 }
      ];
      await Promise.all(seed.map((s) => this.col("ecoBadges").add({ ...s, createdAt: /* @__PURE__ */ new Date() })));
      const q2 = await this.col("ecoBadges").get();
      return q2.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    return q.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  async getUserBadges(userId) {
    const q = await this.col("userBadges").where("userId", "==", userId).get();
    return q.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  async awardBadge(userBadge) {
    const ref = await this.col("userBadges").add({ ...userBadge, earnedAt: /* @__PURE__ */ new Date() });
    const snap = await ref.get();
    return { id: ref.id, ...snap.data() };
  }
  // Referrals
  async createReferral(referral) {
    const ref = await this.col("referrals").add({ ...referral, createdAt: /* @__PURE__ */ new Date() });
    const snap = await ref.get();
    return { id: ref.id, ...snap.data() };
  }
  async getUserReferrals(userId) {
    const q = await this.col("referrals").where("referrerId", "==", userId).get();
    return q.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  // Stats
  async getRiderStats(userId) {
    const user = await this.getUser(userId);
    const q = await this.col("rides").where("riderId", "==", userId).where("status", "==", "completed").get();
    const badges = await this.getUserBadges(userId);
    return {
      totalRides: q.size,
      ecoPoints: user?.ecoPoints || 0,
      totalCO2Saved: user?.totalCO2Saved || "0",
      badgesEarned: badges.length
    };
  }
  async getDriverStats(userId) {
    const profile = await this.getDriverProfile(userId);
    const today = /* @__PURE__ */ new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const q = await this.col("rides").where("driverId", "==", userId).where("status", "==", "completed").get();
    const todayRides = q.docs.map((d) => ({ id: d.id, ...d.data() })).filter((r) => r.completedAt && new Date(r.completedAt).getTime() >= start.getTime());
    const todayEarnings = todayRides.reduce((s, r) => s + Number(r.actualFare || 0), 0);
    return {
      totalRides: profile?.totalRides || 0,
      totalEarnings: profile?.totalEarnings || "0",
      rating: profile?.rating || "5.00",
      todayEarnings: todayEarnings.toFixed(2)
    };
  }
  async getAdminStats() {
    const usersSnap = await this.col("users").get();
    const driversSnap = await this.col("driverProfiles").where("isAvailable", "==", true).get();
    const ridesSnap = await this.col("rides").get();
    const rides = ridesSnap.docs.map((d) => d.data());
    const completed = rides.filter((r) => r.status === "completed");
    const totalRevenue = completed.reduce((s, r) => s + Number(r.actualFare || 0), 0);
    const totalCO2 = completed.reduce((s, r) => s + Number(r.co2Saved || 0), 0);
    const today = (/* @__PURE__ */ new Date()).toDateString();
    const todayRides = rides.filter((r) => r.requestedAt && new Date(r.requestedAt).toDateString() === today);
    const vehicleStats = {
      e_rickshaw: rides.filter((r) => r.vehicleType === "e_rickshaw").length,
      e_scooter: rides.filter((r) => r.vehicleType === "e_scooter").length,
      cng_car: rides.filter((r) => r.vehicleType === "cng_car").length
    };
    return {
      totalUsers: usersSnap.size,
      activeDrivers: driversSnap.size,
      totalRevenue: totalRevenue.toFixed(2),
      totalCO2Saved: totalCO2.toFixed(2),
      totalRides: rides.length,
      todayRides: todayRides.length,
      weekRides: rides.length,
      monthRides: rides.length,
      vehicleStats
    };
  }
};
var MemoryStorage = class {
  id = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);
  _users = [];
  _driverProfiles = [];
  _rides = [];
  _payments = [];
  _ratings = [];
  _ecoBadges = [
    { id: this.id(), name: "Green Beginner", description: "Complete your first eco-friendly ride", iconName: "leaf", requiredPoints: 10, createdAt: /* @__PURE__ */ new Date() },
    { id: this.id(), name: "Eco Warrior", description: "Save 10kg of CO\u2082", iconName: "shield", requiredPoints: 100, createdAt: /* @__PURE__ */ new Date() },
    { id: this.id(), name: "Planet Protector", description: "Complete 25 eco-rides", iconName: "globe", requiredPoints: 250, createdAt: /* @__PURE__ */ new Date() }
  ];
  _userBadges = [];
  _referrals = [];
  async getUser(id) {
    return this._users.find((u) => u.id === id);
  }
  async getUserByEmail(email) {
    return this._users.find((u) => u.email === email);
  }
  async getUserByFirebaseUid(firebaseUid) {
    return this._users.find((u) => u.firebaseUid === firebaseUid);
  }
  async createUser(user) {
    const now = /* @__PURE__ */ new Date();
    const u = {
      id: this.id(),
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name,
      phone: user.phone,
      gender: user.gender,
      role: user.role || "rider",
      profilePhoto: null,
      ecoPoints: 0,
      totalCO2Saved: "0",
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      isActive: true,
      createdAt: now,
      updatedAt: now
    };
    this._users.push(u);
    return u;
  }
  async updateUser(id, updates) {
    const u = await this.getUser(id);
    if (!u) throw new Error("User not found");
    Object.assign(u, updates, { updatedAt: /* @__PURE__ */ new Date() });
    return u;
  }
  async getDriverProfile(userId) {
    return this._driverProfiles.find((p) => p.userId === userId);
  }
  async createDriverProfile(profile) {
    const p = {
      id: this.id(),
      userId: profile.userId,
      vehicleType: profile.vehicleType,
      vehicleNumber: profile.vehicleNumber,
      vehicleModel: profile.vehicleModel ?? null,
      licenseNumber: profile.licenseNumber,
      kycStatus: profile.kycStatus ?? "pending",
      kycDocuments: [],
      rating: profile.rating ?? "5.00",
      totalRides: profile.totalRides ?? 0,
      totalEarnings: profile.totalEarnings ?? "0",
      isAvailable: profile.isAvailable ?? false,
      femalePrefEnabled: profile.femalePrefEnabled ?? false,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this._driverProfiles.push(p);
    return p;
  }
  async updateDriverProfile(userId, updates) {
    const p = await this.getDriverProfile(userId);
    if (!p) throw new Error("Driver profile not found");
    Object.assign(p, updates, { updatedAt: /* @__PURE__ */ new Date() });
    return p;
  }
  async createRide(ride) {
    const r = {
      id: this.id(),
      ...ride,
      status: ride.status ?? "pending",
      requestedAt: /* @__PURE__ */ new Date(),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this._rides.push(r);
    return r;
  }
  async getRide(id) {
    return this._rides.find((r) => r.id === id);
  }
  async getUserRides(userId, role) {
    const key = role === "rider" ? "riderId" : "driverId";
    return this._rides.filter((r) => r[key] === userId).sort((a, b) => +b.createdAt - +a.createdAt);
  }
  async getPendingRides() {
    return this._rides.filter((r) => r.status === "pending").sort((a, b) => +a.requestedAt - +b.requestedAt);
  }
  async getActiveRides() {
    return this._rides.filter((r) => r.status === "accepted" || r.status === "in_progress").sort((a, b) => +b.requestedAt - +a.requestedAt);
  }
  async updateRide(id, updates) {
    const r = await this.getRide(id);
    if (!r) throw new Error("Ride not found");
    Object.assign(r, updates, { updatedAt: /* @__PURE__ */ new Date() });
    return r;
  }
  async createPayment(payment) {
    const p = { id: this.id(), ...payment, paymentStatus: payment.paymentStatus ?? "pending", createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() };
    this._payments.push(p);
    return p;
  }
  async getPaymentByRide(rideId) {
    return this._payments.find((p) => p.rideId === rideId);
  }
  async createRating(rating) {
    const r = { id: this.id(), ...rating, createdAt: /* @__PURE__ */ new Date() };
    this._ratings.push(r);
    return r;
  }
  async getDriverRatings(driverId) {
    return this._ratings.filter((r) => r.rateeId === driverId).sort((a, b) => +b.createdAt - +a.createdAt);
  }
  async getAllBadges() {
    return this._ecoBadges;
  }
  async getUserBadges(userId) {
    return this._userBadges.filter((ub) => ub.userId === userId);
  }
  async awardBadge(userBadge) {
    const ub = { id: this.id(), ...userBadge, earnedAt: /* @__PURE__ */ new Date() };
    this._userBadges.push(ub);
    return ub;
  }
  async createReferral(referral) {
    const r = { id: this.id(), ...referral, createdAt: /* @__PURE__ */ new Date() };
    this._referrals.push(r);
    return r;
  }
  async getUserReferrals(userId) {
    return this._referrals.filter((r) => r.referrerId === userId);
  }
  async getRiderStats(userId) {
    const user = await this.getUser(userId);
    const completed = this._rides.filter((r) => r.riderId === userId && r.status === "completed");
    const badges = this._userBadges.filter((ub) => ub.userId === userId);
    return {
      totalRides: completed.length,
      ecoPoints: user?.ecoPoints ?? 0,
      totalCO2Saved: user?.totalCO2Saved ?? "0",
      badgesEarned: badges.length
    };
  }
  async getDriverStats(userId) {
    const profile = await this.getDriverProfile(userId);
    const today = (/* @__PURE__ */ new Date()).toDateString();
    const todayRides = this._rides.filter((r) => r.driverId === userId && r.status === "completed" && r.completedAt && new Date(r.completedAt).toDateString() === today);
    const todayEarnings = todayRides.reduce((sum, r) => sum + Number(r.actualFare || 0), 0);
    return {
      totalRides: profile?.totalRides ?? 0,
      totalEarnings: profile?.totalEarnings ?? "0",
      rating: profile?.rating ?? "5.00",
      todayEarnings: todayEarnings.toFixed(2)
    };
  }
  async getAdminStats() {
    const allRides = this._rides;
    const completed = allRides.filter((r) => r.status === "completed");
    const totalRevenue = completed.reduce((s, r) => s + Number(r.actualFare || 0), 0);
    const totalCO2 = completed.reduce((s, r) => s + Number(r.co2Saved || 0), 0);
    const todayRides = allRides.filter((r) => r.requestedAt && new Date(r.requestedAt).toDateString() === (/* @__PURE__ */ new Date()).toDateString());
    const vehicleStats = {
      e_rickshaw: allRides.filter((r) => r.vehicleType === "e_rickshaw").length,
      e_scooter: allRides.filter((r) => r.vehicleType === "e_scooter").length,
      cng_car: allRides.filter((r) => r.vehicleType === "cng_car").length
    };
    return {
      totalUsers: this._users.length,
      activeDrivers: this._driverProfiles.filter((d) => d.isAvailable).length,
      totalRevenue: totalRevenue.toFixed(2),
      totalCO2Saved: totalCO2.toFixed(2),
      totalRides: allRides.length,
      todayRides: todayRides.length,
      weekRides: allRides.length,
      monthRides: allRides.length,
      vehicleStats
    };
  }
};
var storage = StorageSelector.getInstance();

// server/routes.ts
import Stripe from "stripe";
import admin3 from "firebase-admin";

// server/integrations/nameApi.ts
function getEnv() {
  const isProd = process.env.NODE_ENV === "production";
  const baseUrl = isProd ? process.env.NAME_API_BASE_URL_PROD : process.env.NAME_API_BASE_URL_DEV;
  const token = isProd ? process.env.NAME_API_TOKEN_PROD : process.env.NAME_API_TOKEN_DEV;
  if (!baseUrl || !token) {
    throw new Error("[nameApi] Missing NAME_API_* envs. Please configure .env");
  }
  return { baseUrl, token };
}
async function fetchJson(path2, init) {
  const { baseUrl, token } = getEnv();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1e4);
  try {
    const res = await fetch(`${baseUrl}${path2}`, {
      ...init,
      method: init?.method || "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...init?.headers || {}
      },
      signal: controller.signal
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`[nameApi] ${res.status} ${res.statusText} :: ${text}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}
var nameApi = {
  ping: () => fetchJson(`/ping`),
  whoAmI: () => fetchJson(`/whoami`)
};
var nameApi_default = nameApi;

// server/routes.ts
config3();
var SIMPLE_AUTH = process.env.SIMPLE_AUTH === "true";
console.log("\u{1F527} Environment check:", {
  SIMPLE_AUTH,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? "SET" : "NOT SET",
  NODE_ENV: process.env.NODE_ENV
});
if (!SIMPLE_AUTH) {
  ensureFirebaseAdmin();
}
var stripe = (() => {
  if (SIMPLE_AUTH) return null;
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
})();
async function verifyFirebaseToken(req, res, next) {
  if (req.session?.user) {
    req.firebaseUid = req.session.user.firebaseUid;
    req.email = req.session.user.email;
    return next();
  }
  if (SIMPLE_AUTH) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  ensureFirebaseAdmin();
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.substring(7);
  try {
    const decodedToken = await admin3.auth().verifyIdToken(token);
    req.firebaseUid = decodedToken.uid;
    req.email = decodedToken.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
function registerSimpleAuth(app2) {
  app2.post("/api/auth/login", (req, res) => {
    const { email, name, role } = req.body || {};
    if (!email || !name || !role) {
      return res.status(400).json({ error: "email, name, and role are required" });
    }
    req.session.user = {
      firebaseUid: `local-${email}`,
      email,
      name,
      role
    };
    req.session.save((err) => {
      if (err) {
        console.error("[auth] session save failed:", err);
        return res.status(500).json({ error: "Session save failed" });
      }
      res.json({ success: true });
    });
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });
}
function generateReferralCode(name) {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const namePart = name.substring(0, 3).toUpperCase();
  return `${namePart}${randomPart}`;
}
async function registerRoutes(app2) {
  let broadcast = () => {
  };
  if (SIMPLE_AUTH || process.env.ALLOW_SIMPLE_AUTH_ROUTES === "true") {
    console.log(`[auth] registering simple-auth routes (SIMPLE_AUTH=${SIMPLE_AUTH}, ALLOW_SIMPLE_AUTH_ROUTES=${process.env.ALLOW_SIMPLE_AUTH_ROUTES})`);
    registerSimpleAuth(app2);
  }
  const verifyHandler = async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  app2.get("/api/auth/verify", verifyFirebaseToken, verifyHandler);
  app2.post("/api/auth/verify", verifyFirebaseToken, verifyHandler);
  app2.post("/api/auth/complete-profile", verifyFirebaseToken, async (req, res) => {
    try {
      const { name, phone, role } = req.body;
      if (!name || !role) {
        return res.status(400).json({ error: "Missing required fields: name, role" });
      }
      let user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (user) {
        return res.json(user);
      }
      const referralCode = generateReferralCode(name);
      user = await storage.createUser({
        firebaseUid: req.firebaseUid,
        email: req.email || `${name.toLowerCase().split(" ").join(".")}@example.com`,
        name,
        phone,
        role,
        referralCode,
        ecoPoints: 0,
        totalCO2Saved: "0",
        isActive: true
      });
      if (role === "driver") {
        await storage.createDriverProfile({
          userId: user.id,
          vehicleType: "e_rickshaw",
          vehicleNumber: "PENDING",
          licenseNumber: "PENDING",
          kycStatus: "pending",
          rating: "5.00",
          totalRides: 0,
          totalEarnings: "0",
          isAvailable: false,
          femalePrefEnabled: false
        });
      }
      res.json(user);
    } catch (error) {
      console.error("/api/auth/complete-profile error:", error);
      const message = (() => {
        if (!error) return "Unknown error";
        if (typeof error === "string") return error;
        if (error.message) return error.message;
        try {
          return JSON.stringify(error);
        } catch {
          return String(error);
        }
      })();
      if (process.env.NODE_ENV !== "production") {
        return res.status(500).json({ error: message });
      }
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  app2.get("/api/health", (_req, res) => {
    res.json({ ok: true, mode: SIMPLE_AUTH ? "simple" : "full" });
  });
  app2.get("/api/integrations/name-api/whoami", async (_req, res) => {
    try {
      const data = await nameApi_default.whoAmI();
      res.json({ ok: true, data });
    } catch (e) {
      res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  });
  app2.get("/api/rider/stats", verifyFirebaseToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const stats = await storage.getRiderStats(user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/rider/rides", verifyFirebaseToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const rides = await storage.getUserRides(user.id, "rider");
      res.json(rides);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/rider/badges", verifyFirebaseToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const allBadges = await storage.getAllBadges();
      const userBadges = await storage.getUserBadges(user.id);
      const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));
      const badgesWithStatus = allBadges.map((badge) => ({
        ...badge,
        earned: earnedBadgeIds.has(badge.id)
      }));
      res.json(badgesWithStatus);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/rides", verifyFirebaseToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (user.role !== "rider") {
        return res.status(403).json({ error: "Only riders can request rides" });
      }
      const {
        pickupLocation,
        pickupLat,
        pickupLng,
        dropoffLocation,
        dropoffLat,
        dropoffLng,
        vehicleType,
        femalePrefRequested
      } = req.body;
      const distance = 5.5;
      const estimatedFare = vehicleType === "e_scooter" ? 30 : vehicleType === "e_rickshaw" ? 45 : 80;
      const co2Saved = distance * 0.12;
      const ecoPoints = Math.floor(distance * 10);
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
        status: "pending",
        distance: distance.toString(),
        estimatedFare: estimatedFare.toString(),
        co2Saved: co2Saved.toString(),
        ecoPointsEarned: ecoPoints
      });
      try {
        broadcast({ type: "ride_added", ride });
      } catch {
      }
      res.json(ride);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/rides/:id", verifyFirebaseToken, async (req, res) => {
    try {
      const ride = await storage.getRide(req.params.id);
      if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
      }
      res.json(ride);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/rides/:id/accept", verifyFirebaseToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (user.role !== "driver") {
        return res.status(403).json({ error: "Only drivers can accept rides" });
      }
      const ride = await storage.getRide(req.params.id);
      if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
      }
      if (ride.status !== "pending") {
        return res.status(400).json({ error: "Ride is no longer available" });
      }
      const driverProfile = await storage.getDriverProfile(user.id);
      if (!driverProfile?.isAvailable) {
        return res.status(400).json({ error: "Driver is not available" });
      }
      const updatedRide = await storage.updateRide(req.params.id, {
        driverId: user.id,
        status: "accepted",
        acceptedAt: /* @__PURE__ */ new Date()
      });
      try {
        broadcast({ type: "ride_updated", ride: updatedRide });
      } catch {
      }
      res.json(updatedRide);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/rides/:id/complete", verifyFirebaseToken, async (req, res) => {
    try {
      const { actualFare } = req.body;
      const ride = await storage.getRide(req.params.id);
      if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
      }
      const updatedRide = await storage.updateRide(req.params.id, {
        status: "completed",
        actualFare: actualFare || ride.estimatedFare,
        completedAt: /* @__PURE__ */ new Date()
      });
      const rider = await storage.getUser(ride.riderId);
      if (rider) {
        await storage.updateUser(ride.riderId, {
          ecoPoints: rider.ecoPoints + (ride.ecoPointsEarned || 0),
          totalCO2Saved: (Number(rider.totalCO2Saved) + Number(ride.co2Saved || 0)).toString()
        });
      }
      if (ride.driverId) {
        const driverProfile = await storage.getDriverProfile(ride.driverId);
        if (driverProfile) {
          await storage.updateDriverProfile(ride.driverId, {
            totalRides: driverProfile.totalRides + 1,
            totalEarnings: (Number(driverProfile.totalEarnings) + Number(actualFare || ride.estimatedFare)).toString()
          });
        }
      }
      try {
        broadcast({ type: "ride_updated", ride: updatedRide });
      } catch {
      }
      res.json(updatedRide);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/rides/:id/start", verifyFirebaseToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) return res.status(404).json({ error: "User not found" });
      const ride = await storage.getRide(req.params.id);
      if (!ride) return res.status(404).json({ error: "Ride not found" });
      if (ride.driverId && ride.driverId !== user.id) {
        return res.status(403).json({ error: "Not your ride" });
      }
      const updated = await storage.updateRide(req.params.id, {
        driverId: ride.driverId || user.id,
        status: "in_progress",
        startedAt: /* @__PURE__ */ new Date()
      });
      try {
        broadcast({ type: "ride_updated", ride: updated });
      } catch {
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/rides/:id/sos", verifyFirebaseToken, async (req, res) => {
    try {
      const ride = await storage.getRide(req.params.id);
      if (!ride) return res.status(404).json({ error: "Ride not found" });
      await storage.updateRide(req.params.id, {});
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/driver/stats", verifyFirebaseToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const stats = await storage.getDriverStats(user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/driver/pending-rides", verifyFirebaseToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (user.role !== "driver") {
        return res.status(403).json({ error: "Only drivers can view pending rides" });
      }
      const driverProfile = await storage.getDriverProfile(user.id);
      if (!driverProfile?.isAvailable) {
        return res.json([]);
      }
      const rides = await storage.getPendingRides();
      res.json(rides);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/driver/availability", verifyFirebaseToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (user.role !== "driver") {
        return res.status(403).json({ error: "Only drivers can set availability" });
      }
      const { available } = req.body;
      await storage.updateDriverProfile(user.id, {
        isAvailable: available
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/admin/stats", verifyFirebaseToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/admin/active-rides", verifyFirebaseToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const rides = await storage.getActiveRides();
      res.json(rides);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/create-payment-intent", verifyFirebaseToken, async (req, res) => {
    try {
      const { amount } = req.body;
      if (!stripe) {
        return res.json({ clientSecret: `mock_${Math.round(amount * 100)}` });
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "inr"
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  broadcast = (msg) => {
    const json = JSON.stringify(msg);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(json);
    });
  };
  if (!SIMPLE_AUTH) {
    try {
      const db = admin3.firestore();
      const broadcast2 = (msg) => {
        const json = JSON.stringify(msg);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) client.send(json);
        });
      };
      db.collection("rides").onSnapshot((snap) => {
        snap.docChanges().forEach((change) => {
          const data = { id: change.doc.id, ...change.doc.data() };
          if (change.type === "added") {
            broadcast2({ type: "ride_added", ride: data });
          } else if (change.type === "modified") {
            broadcast2({ type: "ride_updated", ride: data });
          } else if (change.type === "removed") {
            broadcast2({ type: "ride_removed", rideId: change.doc.id });
          }
        });
      }, (err) => {
        console.error("[ws] rides snapshot error:", err?.message || err);
      });
      db.collection("driverProfiles").onSnapshot((snap) => {
        snap.docChanges().forEach((change) => {
          const data = { id: change.doc.id, ...change.doc.data() };
          if (change.type === "added") {
            broadcast2({ type: "driver_added", driver: data });
          } else if (change.type === "modified") {
            broadcast2({ type: "driver_updated", driver: data });
          } else if (change.type === "removed") {
            broadcast2({ type: "driver_removed", driverId: change.doc.id });
          }
        });
      }, (err) => {
        console.error("[ws] driverProfiles snapshot error:", err?.message || err);
      });
      console.log("[ws] Firestore realtime bridge initialized");
    } catch (e) {
      console.error("[ws] Firestore realtime bridge failed to init:", e);
    }
  }
  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "location_update") {
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: "location_update",
                rideId: data.rideId,
                lat: data.lat,
                lng: data.lng,
                who: data.who || "unknown",
                at: Date.now()
              }));
            }
          });
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws.on("close", () => {
      console.log("Client disconnected from WebSocket");
    });
  });
  return httpServer;
}

// server/index.ts
config4();
var app = express();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
if (process.env.FRONTEND_ORIGIN) {
  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN.split(",").map((s) => s.trim()),
      credentials: true
    })
  );
} else if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: true,
      // reflect request origin
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  );
}
var MemoryStore = MemoryStoreFactory(session);
var isCodespaces = !!process.env.CODESPACES;
var secureEnv = process.env.COOKIE_SECURE;
var useSecureCookies = secureEnv ? secureEnv === "true" : isCodespaces;
var sameSitePolicy = useSecureCookies ? "none" : "lax";
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({ checkPeriod: 1e3 * 60 * 60 }),
    // prune expired every hour
    proxy: true,
    // honor X-Forwarded-* headers for secure cookies
    cookie: {
      secure: useSecureCookies,
      // required when served over HTTPS via proxy
      httpOnly: true,
      sameSite: sameSitePolicy,
      maxAge: 1e3 * 60 * 60 * 8
      // 8 hours
    }
  })
);
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
