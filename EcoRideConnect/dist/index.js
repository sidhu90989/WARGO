"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  driverProfiles: () => driverProfiles,
  driverProfilesRelations: () => driverProfilesRelations,
  ecoBadges: () => ecoBadges,
  ecoBadgesRelations: () => ecoBadgesRelations,
  genderEnum: () => genderEnum,
  insertDriverProfileSchema: () => insertDriverProfileSchema,
  insertEcoBadgeSchema: () => insertEcoBadgeSchema,
  insertPaymentSchema: () => insertPaymentSchema,
  insertRatingSchema: () => insertRatingSchema,
  insertReferralSchema: () => insertReferralSchema,
  insertRideSchema: () => insertRideSchema,
  insertUserBadgeSchema: () => insertUserBadgeSchema,
  insertUserSchema: () => insertUserSchema,
  kycStatusEnum: () => kycStatusEnum,
  paymentMethodEnum: () => paymentMethodEnum,
  paymentStatusEnum: () => paymentStatusEnum,
  payments: () => payments,
  paymentsRelations: () => paymentsRelations,
  ratings: () => ratings,
  ratingsRelations: () => ratingsRelations,
  referrals: () => referrals,
  referralsRelations: () => referralsRelations,
  rideStatusEnum: () => rideStatusEnum,
  rides: () => rides,
  ridesRelations: () => ridesRelations,
  userBadges: () => userBadges,
  userBadgesRelations: () => userBadgesRelations,
  userRoleEnum: () => userRoleEnum,
  users: () => users,
  usersRelations: () => usersRelations,
  vehicleTypeEnum: () => vehicleTypeEnum
});
var import_drizzle_orm, import_pg_core, import_drizzle_orm2, import_drizzle_zod, userRoleEnum, genderEnum, vehicleTypeEnum, rideStatusEnum, paymentMethodEnum, paymentStatusEnum, kycStatusEnum, users, driverProfiles, rides, payments, ratings, ecoBadges, userBadges, referrals, usersRelations, driverProfilesRelations, ridesRelations, paymentsRelations, ratingsRelations, ecoBadgesRelations, userBadgesRelations, referralsRelations, insertUserSchema, insertDriverProfileSchema, insertRideSchema, insertPaymentSchema, insertRatingSchema, insertEcoBadgeSchema, insertUserBadgeSchema, insertReferralSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    import_drizzle_orm = require("drizzle-orm");
    import_pg_core = require("drizzle-orm/pg-core");
    import_drizzle_orm2 = require("drizzle-orm");
    import_drizzle_zod = require("drizzle-zod");
    userRoleEnum = (0, import_pg_core.pgEnum)("user_role", ["rider", "driver", "admin"]);
    genderEnum = (0, import_pg_core.pgEnum)("gender", ["male", "female", "other", "prefer_not_to_say"]);
    vehicleTypeEnum = (0, import_pg_core.pgEnum)("vehicle_type", ["e_rickshaw", "e_scooter", "cng_car"]);
    rideStatusEnum = (0, import_pg_core.pgEnum)("ride_status", ["pending", "accepted", "in_progress", "completed", "cancelled"]);
    paymentMethodEnum = (0, import_pg_core.pgEnum)("payment_method", ["cash", "card", "upi", "wallet"]);
    paymentStatusEnum = (0, import_pg_core.pgEnum)("payment_status", ["pending", "completed", "failed", "refunded"]);
    kycStatusEnum = (0, import_pg_core.pgEnum)("kyc_status", ["pending", "verified", "rejected"]);
    users = (0, import_pg_core.pgTable)("users", {
      id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
      firebaseUid: (0, import_pg_core.text)("firebase_uid").unique(),
      email: (0, import_pg_core.text)("email").unique(),
      name: (0, import_pg_core.text)("name").notNull(),
      phone: (0, import_pg_core.text)("phone").unique(),
      gender: genderEnum("gender"),
      role: userRoleEnum("role").notNull().default("rider"),
      profilePhoto: (0, import_pg_core.text)("profile_photo"),
      ecoPoints: (0, import_pg_core.integer)("eco_points").notNull().default(0),
      totalCO2Saved: (0, import_pg_core.decimal)("total_co2_saved", { precision: 10, scale: 2 }).notNull().default("0"),
      referralCode: (0, import_pg_core.text)("referral_code").unique(),
      referredBy: (0, import_pg_core.varchar)("referred_by"),
      isActive: (0, import_pg_core.boolean)("is_active").notNull().default(true),
      createdAt: (0, import_pg_core.timestamp)("created_at").notNull().defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").notNull().defaultNow()
    });
    driverProfiles = (0, import_pg_core.pgTable)("driver_profiles", {
      id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
      userId: (0, import_pg_core.varchar)("user_id").notNull().references(() => users.id),
      vehicleType: vehicleTypeEnum("vehicle_type").notNull(),
      vehicleNumber: (0, import_pg_core.text)("vehicle_number").notNull().unique(),
      vehicleModel: (0, import_pg_core.text)("vehicle_model"),
      licenseNumber: (0, import_pg_core.text)("license_number").notNull(),
      kycStatus: kycStatusEnum("kyc_status").notNull().default("pending"),
      kycDocuments: (0, import_pg_core.text)("kyc_documents").array(),
      rating: (0, import_pg_core.decimal)("rating", { precision: 3, scale: 2 }).default("5.00"),
      totalRides: (0, import_pg_core.integer)("total_rides").notNull().default(0),
      totalEarnings: (0, import_pg_core.decimal)("total_earnings", { precision: 10, scale: 2 }).notNull().default("0"),
      isAvailable: (0, import_pg_core.boolean)("is_available").notNull().default(false),
      femalePrefEnabled: (0, import_pg_core.boolean)("female_pref_enabled").notNull().default(false),
      createdAt: (0, import_pg_core.timestamp)("created_at").notNull().defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").notNull().defaultNow()
    });
    rides = (0, import_pg_core.pgTable)("rides", {
      id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
      riderId: (0, import_pg_core.varchar)("rider_id").notNull().references(() => users.id),
      driverId: (0, import_pg_core.varchar)("driver_id").references(() => users.id),
      pickupLocation: (0, import_pg_core.text)("pickup_location").notNull(),
      pickupLat: (0, import_pg_core.decimal)("pickup_lat", { precision: 10, scale: 7 }).notNull(),
      pickupLng: (0, import_pg_core.decimal)("pickup_lng", { precision: 10, scale: 7 }).notNull(),
      dropoffLocation: (0, import_pg_core.text)("dropoff_location").notNull(),
      dropoffLat: (0, import_pg_core.decimal)("dropoff_lat", { precision: 10, scale: 7 }).notNull(),
      dropoffLng: (0, import_pg_core.decimal)("dropoff_lng", { precision: 10, scale: 7 }).notNull(),
      vehicleType: vehicleTypeEnum("vehicle_type").notNull(),
      femalePrefRequested: (0, import_pg_core.boolean)("female_pref_requested").notNull().default(false),
      status: rideStatusEnum("status").notNull().default("pending"),
      distance: (0, import_pg_core.decimal)("distance", { precision: 10, scale: 2 }),
      estimatedFare: (0, import_pg_core.decimal)("estimated_fare", { precision: 10, scale: 2 }),
      actualFare: (0, import_pg_core.decimal)("actual_fare", { precision: 10, scale: 2 }),
      co2Saved: (0, import_pg_core.decimal)("co2_saved", { precision: 10, scale: 2 }),
      ecoPointsEarned: (0, import_pg_core.integer)("eco_points_earned").default(0),
      requestedAt: (0, import_pg_core.timestamp)("requested_at").notNull().defaultNow(),
      acceptedAt: (0, import_pg_core.timestamp)("accepted_at"),
      startedAt: (0, import_pg_core.timestamp)("started_at"),
      completedAt: (0, import_pg_core.timestamp)("completed_at"),
      cancelledAt: (0, import_pg_core.timestamp)("cancelled_at"),
      createdAt: (0, import_pg_core.timestamp)("created_at").notNull().defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").notNull().defaultNow()
    });
    payments = (0, import_pg_core.pgTable)("payments", {
      id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
      rideId: (0, import_pg_core.varchar)("ride_id").notNull().references(() => rides.id),
      amount: (0, import_pg_core.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
      paymentMethod: paymentMethodEnum("payment_method").notNull(),
      paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
      stripePaymentIntentId: (0, import_pg_core.text)("stripe_payment_intent_id"),
      transactionId: (0, import_pg_core.text)("transaction_id"),
      createdAt: (0, import_pg_core.timestamp)("created_at").notNull().defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").notNull().defaultNow()
    });
    ratings = (0, import_pg_core.pgTable)("ratings", {
      id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
      rideId: (0, import_pg_core.varchar)("ride_id").notNull().references(() => rides.id),
      raterId: (0, import_pg_core.varchar)("rater_id").notNull().references(() => users.id),
      rateeId: (0, import_pg_core.varchar)("ratee_id").notNull().references(() => users.id),
      rating: (0, import_pg_core.integer)("rating").notNull(),
      feedback: (0, import_pg_core.text)("feedback"),
      createdAt: (0, import_pg_core.timestamp)("created_at").notNull().defaultNow()
    });
    ecoBadges = (0, import_pg_core.pgTable)("eco_badges", {
      id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
      name: (0, import_pg_core.text)("name").notNull(),
      description: (0, import_pg_core.text)("description"),
      iconName: (0, import_pg_core.text)("icon_name").notNull(),
      requiredPoints: (0, import_pg_core.integer)("required_points").notNull(),
      createdAt: (0, import_pg_core.timestamp)("created_at").notNull().defaultNow()
    });
    userBadges = (0, import_pg_core.pgTable)("user_badges", {
      id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
      userId: (0, import_pg_core.varchar)("user_id").notNull().references(() => users.id),
      badgeId: (0, import_pg_core.varchar)("badge_id").notNull().references(() => ecoBadges.id),
      earnedAt: (0, import_pg_core.timestamp)("earned_at").notNull().defaultNow()
    });
    referrals = (0, import_pg_core.pgTable)("referrals", {
      id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
      referrerId: (0, import_pg_core.varchar)("referrer_id").notNull().references(() => users.id),
      refereeId: (0, import_pg_core.varchar)("referee_id").notNull().references(() => users.id),
      bonusAwarded: (0, import_pg_core.boolean)("bonus_awarded").notNull().default(false),
      createdAt: (0, import_pg_core.timestamp)("created_at").notNull().defaultNow()
    });
    usersRelations = (0, import_drizzle_orm2.relations)(users, ({ one, many }) => ({
      driverProfile: one(driverProfiles, {
        fields: [users.id],
        references: [driverProfiles.userId]
      }),
      ridesAsRider: many(rides, { relationName: "riderRides" }),
      ridesAsDriver: many(rides, { relationName: "driverRides" }),
      ratingsGiven: many(ratings, { relationName: "raterRatings" }),
      ratingsReceived: many(ratings, { relationName: "rateeRatings" }),
      badges: many(userBadges),
      referralsMade: many(referrals, { relationName: "referrerReferrals" }),
      referralsReceived: many(referrals, { relationName: "refereeReferrals" })
    }));
    driverProfilesRelations = (0, import_drizzle_orm2.relations)(driverProfiles, ({ one }) => ({
      user: one(users, {
        fields: [driverProfiles.userId],
        references: [users.id]
      })
    }));
    ridesRelations = (0, import_drizzle_orm2.relations)(rides, ({ one, many }) => ({
      rider: one(users, {
        fields: [rides.riderId],
        references: [users.id],
        relationName: "riderRides"
      }),
      driver: one(users, {
        fields: [rides.driverId],
        references: [users.id],
        relationName: "driverRides"
      }),
      payment: one(payments),
      ratings: many(ratings)
    }));
    paymentsRelations = (0, import_drizzle_orm2.relations)(payments, ({ one }) => ({
      ride: one(rides, {
        fields: [payments.rideId],
        references: [rides.id]
      })
    }));
    ratingsRelations = (0, import_drizzle_orm2.relations)(ratings, ({ one }) => ({
      ride: one(rides, {
        fields: [ratings.rideId],
        references: [rides.id]
      }),
      rater: one(users, {
        fields: [ratings.raterId],
        references: [users.id],
        relationName: "raterRatings"
      }),
      ratee: one(users, {
        fields: [ratings.rateeId],
        references: [users.id],
        relationName: "rateeRatings"
      })
    }));
    ecoBadgesRelations = (0, import_drizzle_orm2.relations)(ecoBadges, ({ many }) => ({
      userBadges: many(userBadges)
    }));
    userBadgesRelations = (0, import_drizzle_orm2.relations)(userBadges, ({ one }) => ({
      user: one(users, {
        fields: [userBadges.userId],
        references: [users.id]
      }),
      badge: one(ecoBadges, {
        fields: [userBadges.badgeId],
        references: [ecoBadges.id]
      })
    }));
    referralsRelations = (0, import_drizzle_orm2.relations)(referrals, ({ one }) => ({
      referrer: one(users, {
        fields: [referrals.referrerId],
        references: [users.id],
        relationName: "referrerReferrals"
      }),
      referee: one(users, {
        fields: [referrals.refereeId],
        references: [users.id],
        relationName: "refereeReferrals"
      })
    }));
    insertUserSchema = (0, import_drizzle_zod.createInsertSchema)(users).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertDriverProfileSchema = (0, import_drizzle_zod.createInsertSchema)(driverProfiles).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertRideSchema = (0, import_drizzle_zod.createInsertSchema)(rides).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPaymentSchema = (0, import_drizzle_zod.createInsertSchema)(payments).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertRatingSchema = (0, import_drizzle_zod.createInsertSchema)(ratings).omit({
      id: true,
      createdAt: true
    });
    insertEcoBadgeSchema = (0, import_drizzle_zod.createInsertSchema)(ecoBadges).omit({
      id: true,
      createdAt: true
    });
    insertUserBadgeSchema = (0, import_drizzle_zod.createInsertSchema)(userBadges).omit({
      id: true,
      earnedAt: true
    });
    insertReferralSchema = (0, import_drizzle_zod.createInsertSchema)(referrals).omit({
      id: true,
      createdAt: true
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  pool: () => pool
});
var import_dotenv, import_pg, import_node_postgres, SIMPLE_AUTH, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    import_dotenv = require("dotenv");
    import_pg = require("pg");
    import_node_postgres = require("drizzle-orm/node-postgres");
    init_schema();
    (0, import_dotenv.config)();
    SIMPLE_AUTH = process.env.SIMPLE_AUTH === "true";
    console.log(`[db] module init. SIMPLE_AUTH=${process.env.SIMPLE_AUTH} DATABASE_URL=${process.env.DATABASE_URL ? "SET" : "MISSING"}`);
    if (!SIMPLE_AUTH) {
      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
      }
      pool = new import_pg.Pool({ connectionString: process.env.DATABASE_URL });
      db = (0, import_node_postgres.drizzle)({ client: pool, schema: schema_exports });
    } else {
      console.log("[db] SIMPLE_AUTH=true -> skipping database initialization");
    }
  }
});

// shared/services/ridePricingService.ts
var ridePricingService_exports = {};
__export(ridePricingService_exports, {
  default: () => ridePricingService_default,
  estimateRide: () => estimateRide
});
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (v) => v * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function estimateRide(input) {
  const distanceKm = Math.max(
    0.5,
    haversine(input.pickup.lat, input.pickup.lng, input.drop.lat, input.drop.lng)
  );
  const base = BASE_FARES[input.vehicleType] ?? 50;
  const perKm = PER_KM[input.vehicleType] ?? 10;
  let fare = base + distanceKm * perKm;
  if (input.femalePrefRequested) fare *= 1.05;
  const co2SavedKg = distanceKm * (CO2_SAVED_PER_KM[input.vehicleType] ?? 0.1);
  const ecoPoints = Math.round(co2SavedKg * 10 + distanceKm * 2);
  return {
    distanceKm,
    estimatedFare: fare,
    co2SavedKg,
    ecoPoints
  };
}
var BASE_FARES, PER_KM, CO2_SAVED_PER_KM, ridePricingService_default;
var init_ridePricingService = __esm({
  "shared/services/ridePricingService.ts"() {
    "use strict";
    BASE_FARES = {
      e_scooter: 25,
      e_rickshaw: 40,
      cng_car: 75
    };
    PER_KM = {
      e_scooter: 6,
      e_rickshaw: 8,
      cng_car: 12
    };
    CO2_SAVED_PER_KM = {
      e_scooter: 0.18,
      e_rickshaw: 0.14,
      cng_car: 0.06
      // smaller savings vs petrol
    };
    ridePricingService_default = { estimateRide };
  }
});

// server/index.ts
var import_dotenv4 = require("dotenv");
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var import_express_session = __toESM(require("express-session"), 1);
var import_memorystore = __toESM(require("memorystore"), 1);
var import_connect_redis = __toESM(require("connect-redis"), 1);
var import_redis = require("redis");

// server/routes.ts
var import_dotenv3 = require("dotenv");
var import_http = require("http");
var import_socket = require("socket.io");

// server/storage.ts
var import_dotenv2 = require("dotenv");
init_schema();
var import_drizzle_orm3 = require("drizzle-orm");
var import_nanoid = require("nanoid");
(0, import_dotenv2.config)();
console.log(`[storage] module initialized. SIMPLE_AUTH=${process.env.SIMPLE_AUTH} DATABASE_URL=${process.env.DATABASE_URL ? "SET" : "MISSING"}`);
async function getDb() {
  const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  if (!db2) {
    throw new Error("[db] Not initialized. Attempted to use database storage while SIMPLE_AUTH=true");
  }
  return db2;
}
var StorageSelector = class {
  static instance;
  static getInstance() {
    if (!this.instance) {
      const simple = process.env.SIMPLE_AUTH === "true";
      console.log(`[storage] selecting storage. SIMPLE_AUTH=${process.env.SIMPLE_AUTH} -> ${simple ? "memory" : "database"}`);
      this.instance = simple ? new MemoryStorage() : new DatabaseStorage();
      console.log(`[storage] using ${simple ? "memory" : "database"} storage`);
    }
    return this.instance;
  }
};
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const db2 = await getDb();
    const [user] = await db2.select().from(users).where((0, import_drizzle_orm3.eq)(users.id, id));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const db2 = await getDb();
    const [user] = await db2.select().from(users).where((0, import_drizzle_orm3.eq)(users.email, email));
    return user || void 0;
  }
  async getUserByFirebaseUid(firebaseUid) {
    const db2 = await getDb();
    const [user] = await db2.select().from(users).where((0, import_drizzle_orm3.eq)(users.firebaseUid, firebaseUid));
    return user || void 0;
  }
  async createUser(insertUser) {
    const db2 = await getDb();
    const [user] = await db2.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, updates) {
    const db2 = await getDb();
    const [user] = await db2.update(users).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.eq)(users.id, id)).returning();
    return user;
  }
  // Driver operations
  async getDriverProfile(userId) {
    const db2 = await getDb();
    const [profile] = await db2.select().from(driverProfiles).where((0, import_drizzle_orm3.eq)(driverProfiles.userId, userId));
    return profile || void 0;
  }
  async createDriverProfile(profile) {
    const db2 = await getDb();
    const [driverProfile] = await db2.insert(driverProfiles).values(profile).returning();
    return driverProfile;
  }
  async updateDriverProfile(userId, updates) {
    const db2 = await getDb();
    const [profile] = await db2.update(driverProfiles).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.eq)(driverProfiles.userId, userId)).returning();
    return profile;
  }
  // Ride operations
  async createRide(ride) {
    const db2 = await getDb();
    const [newRide] = await db2.insert(rides).values(ride).returning();
    return newRide;
  }
  async getRide(id) {
    const db2 = await getDb();
    const [ride] = await db2.select().from(rides).where((0, import_drizzle_orm3.eq)(rides.id, id));
    return ride || void 0;
  }
  async getUserRides(userId, role) {
    const db2 = await getDb();
    const condition = role === "rider" ? (0, import_drizzle_orm3.eq)(rides.riderId, userId) : (0, import_drizzle_orm3.eq)(rides.driverId, userId);
    return await db2.select().from(rides).where(condition).orderBy((0, import_drizzle_orm3.desc)(rides.createdAt));
  }
  async getPendingRides() {
    const db2 = await getDb();
    return await db2.select().from(rides).where((0, import_drizzle_orm3.eq)(rides.status, "pending")).orderBy(rides.requestedAt);
  }
  async getActiveRides() {
    const db2 = await getDb();
    return await db2.select().from(rides).where(
      (0, import_drizzle_orm3.or)(
        (0, import_drizzle_orm3.eq)(rides.status, "accepted"),
        (0, import_drizzle_orm3.eq)(rides.status, "in_progress")
      )
    ).orderBy((0, import_drizzle_orm3.desc)(rides.requestedAt));
  }
  async updateRide(id, updates) {
    const db2 = await getDb();
    const [ride] = await db2.update(rides).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.eq)(rides.id, id)).returning();
    return ride;
  }
  // Payment operations
  async createPayment(payment) {
    const db2 = await getDb();
    const [newPayment] = await db2.insert(payments).values(payment).returning();
    return newPayment;
  }
  async getPaymentByRide(rideId) {
    const db2 = await getDb();
    const [payment] = await db2.select().from(payments).where((0, import_drizzle_orm3.eq)(payments.rideId, rideId));
    return payment || void 0;
  }
  // Rating operations
  async createRating(rating) {
    const db2 = await getDb();
    const [newRating] = await db2.insert(ratings).values(rating).returning();
    return newRating;
  }
  async getDriverRatings(driverId) {
    const db2 = await getDb();
    return await db2.select().from(ratings).where((0, import_drizzle_orm3.eq)(ratings.rateeId, driverId)).orderBy((0, import_drizzle_orm3.desc)(ratings.createdAt));
  }
  // Badge operations
  async getAllBadges() {
    const db2 = await getDb();
    return await db2.select().from(ecoBadges);
  }
  async getUserBadges(userId) {
    const db2 = await getDb();
    return await db2.select().from(userBadges).where((0, import_drizzle_orm3.eq)(userBadges.userId, userId));
  }
  async awardBadge(userBadge) {
    const db2 = await getDb();
    const [badge] = await db2.insert(userBadges).values(userBadge).returning();
    return badge;
  }
  // Referral operations
  async createReferral(referral) {
    const db2 = await getDb();
    const [newReferral] = await db2.insert(referrals).values(referral).returning();
    return newReferral;
  }
  async getUserReferrals(userId) {
    const db2 = await getDb();
    return await db2.select().from(referrals).where((0, import_drizzle_orm3.eq)(referrals.referrerId, userId));
  }
  // Stats operations
  async getRiderStats(userId) {
    const db2 = await getDb();
    const [user] = await db2.select().from(users).where((0, import_drizzle_orm3.eq)(users.id, userId));
    const userRides = await db2.select().from(rides).where((0, import_drizzle_orm3.and)(
      (0, import_drizzle_orm3.eq)(rides.riderId, userId),
      (0, import_drizzle_orm3.eq)(rides.status, "completed")
    ));
    const badgeCount = await db2.select({ count: import_drizzle_orm3.sql`count(*)` }).from(userBadges).where((0, import_drizzle_orm3.eq)(userBadges.userId, userId));
    return {
      totalRides: userRides.length,
      ecoPoints: user?.ecoPoints || 0,
      totalCO2Saved: user?.totalCO2Saved || "0",
      badgesEarned: badgeCount[0]?.count || 0
    };
  }
  async getDriverStats(userId) {
    const profile = await this.getDriverProfile(userId);
    const db2 = await getDb();
    const todayRides = await db2.select().from(rides).where((0, import_drizzle_orm3.and)(
      (0, import_drizzle_orm3.eq)(rides.driverId, userId),
      (0, import_drizzle_orm3.eq)(rides.status, "completed"),
      import_drizzle_orm3.sql`DATE(${rides.completedAt}) = CURRENT_DATE`
    ));
    const todayEarnings = todayRides.reduce((sum, ride) => {
      return sum + Number(ride.actualFare || 0);
    }, 0);
    return {
      totalRides: profile?.totalRides || 0,
      totalEarnings: profile?.totalEarnings || "0",
      rating: profile?.rating || "5.00",
      todayEarnings: todayEarnings.toFixed(2)
    };
  }
  async getAdminStats() {
    const db2 = await getDb();
    const [userCount] = await db2.select({ count: import_drizzle_orm3.sql`count(*)` }).from(users);
    const [driverCount] = await db2.select({ count: import_drizzle_orm3.sql`count(*)` }).from(driverProfiles).where((0, import_drizzle_orm3.eq)(driverProfiles.isAvailable, true));
    const allRides = await db2.select().from(rides);
    const completedRides = allRides.filter((r) => r.status === "completed");
    const totalRevenue = completedRides.reduce((sum, ride) => {
      return sum + Number(ride.actualFare || 0);
    }, 0);
    const totalCO2 = completedRides.reduce((sum, ride) => {
      return sum + Number(ride.co2Saved || 0);
    }, 0);
    const todayRides = allRides.filter((r) => {
      return !!(r.requestedAt && new Date(r.requestedAt).toDateString() === (/* @__PURE__ */ new Date()).toDateString());
    });
    const vehicleStats = {
      e_rickshaw: allRides.filter((r) => r.vehicleType === "e_rickshaw").length,
      e_scooter: allRides.filter((r) => r.vehicleType === "e_scooter").length,
      cng_car: allRides.filter((r) => r.vehicleType === "cng_car").length
    };
    return {
      totalUsers: userCount.count,
      activeDrivers: driverCount.count,
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
var MemoryStorage = class {
  id = (0, import_nanoid.customAlphabet)("0123456789abcdefghijklmnopqrstuvwxyz", 10);
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
var import_zod = require("zod");
var import_stripe = __toESM(require("stripe"), 1);

// server/integrations/firebaseRealtimeDb.ts
var import_firebase_admin = __toESM(require("firebase-admin"), 1);
async function trackLiveRide(rideId, lat, lng, who = "unknown", extra) {
  const db2 = import_firebase_admin.default.database();
  const location = {
    lat,
    lng,
    who,
    timestamp: Date.now(),
    ...extra?.heading !== void 0 && { heading: extra.heading },
    ...extra?.speed !== void 0 && { speed: extra.speed }
  };
  const key = who === "driver" ? "driver_location" : "rider_location";
  await db2.ref(`active_rides/${rideId}/${key}`).set(location);
  await db2.ref(`active_rides/${rideId}/lastUpdated`).set(Date.now());
}
async function setRideStatus(rideId, status) {
  const db2 = import_firebase_admin.default.database();
  await db2.ref(`active_rides/${rideId}/status`).set({
    value: status,
    timestamp: Date.now()
  });
}
async function clearRideTracking(rideId) {
  const db2 = import_firebase_admin.default.database();
  await db2.ref(`active_rides/${rideId}`).remove();
}

// server/routes.ts
var import_firebase_admin2 = __toESM(require("firebase-admin"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);

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
      const text2 = await res.text().catch(() => "");
      throw new Error(`[nameApi] ${res.status} ${res.statusText} :: ${text2}`);
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
(0, import_dotenv3.config)();
var SIMPLE_AUTH2 = process.env.SIMPLE_AUTH === "true";
var ALLOW_SIMPLE_AUTH_ANON = process.env.ALLOW_SIMPLE_AUTH_ANON === "true";
console.log("\u{1F527} Environment check:", {
  SIMPLE_AUTH: SIMPLE_AUTH2,
  ALLOW_SIMPLE_AUTH_ANON,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? "SET" : "NOT SET",
  NODE_ENV: process.env.NODE_ENV
});
if (!SIMPLE_AUTH2) {
  if (!import_firebase_admin2.default.apps.length) {
    const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
    const keyJsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    try {
      if (keyJsonEnv && keyJsonEnv.trim().length > 0) {
        let jsonStr = keyJsonEnv.trim();
        try {
          if (!jsonStr.trim().startsWith("{")) {
            jsonStr = Buffer.from(jsonStr, "base64").toString("utf8");
          }
        } catch {
        }
        const json = JSON.parse(jsonStr);
        import_firebase_admin2.default.initializeApp({
          credential: import_firebase_admin2.default.credential.cert(json)
        });
      } else if (keyPath) {
        const resolved = import_path.default.isAbsolute(keyPath) ? keyPath : import_path.default.resolve(process.cwd(), keyPath);
        const json = JSON.parse(import_fs.default.readFileSync(resolved, "utf8"));
        const initConfig = {
          credential: import_firebase_admin2.default.credential.cert(json)
        };
        if (process.env.FIREBASE_DATABASE_URL) {
          initConfig.databaseURL = process.env.FIREBASE_DATABASE_URL;
        }
        import_firebase_admin2.default.initializeApp(initConfig);
      } else {
        const initConfig = {};
        if (process.env.FIREBASE_DATABASE_URL) {
          initConfig.databaseURL = process.env.FIREBASE_DATABASE_URL;
        }
        import_firebase_admin2.default.initializeApp(initConfig);
      }
    } catch (e) {
      console.error("[firebase-admin] initialization failed:", e);
      throw e;
    }
  }
}
var stripe = (() => {
  if (SIMPLE_AUTH2) return null;
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
  }
  return new import_stripe.default(process.env.STRIPE_SECRET_KEY);
})();
async function verifyFirebaseToken(req, res, next) {
  if (req.session?.user) {
    req.firebaseUid = req.session.user.firebaseUid;
    req.email = req.session.user.email;
    return next();
  }
  if (process.env.ALLOW_SIMPLE_AUTH_ROUTES === "true") {
    if (process.env.NODE_ENV !== "production") {
      console.log("[auth] header-bypass verification", {
        path: req.path,
        emailHeader: req.header("x-simple-email"),
        roleHeader: req.header("x-simple-role"),
        rawEmail: req.headers["x-simple-email"],
        rawHeadersKeys: Object.keys(req.headers || {})
      });
    }
    const emailHeader = req.header("x-simple-email");
    const roleHeader = req.header("x-simple-role") || "rider";
    if (emailHeader) {
      const firebaseUid = `local-${emailHeader}`;
      req.firebaseUid = firebaseUid;
      req.email = emailHeader;
      if (req.session) {
        req.session.user = {
          firebaseUid,
          email: emailHeader,
          name: emailHeader.split("@")[0],
          role: roleHeader
        };
      }
      return next();
    }
    if (req.path === "/api/auth/complete-profile" && req.body && req.body.name) {
      const role = req.body.role || "rider";
      const email = `${String(req.body.name).toLowerCase().split(" ").join(".")}@example.com`;
      const firebaseUid = `local-${email}`;
      req.firebaseUid = firebaseUid;
      req.email = email;
      if (req.session) {
        req.session.user = {
          firebaseUid,
          email,
          name: req.body.name,
          role
        };
      }
      return next();
    }
  }
  if (SIMPLE_AUTH2) {
    if (ALLOW_SIMPLE_AUTH_ANON) {
      req.firebaseUid = "local-anon";
      req.email = "anon@local";
      return next();
    }
    return res.status(401).json({ error: "Unauthorized" });
  }
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.substring(7);
  try {
    const decodedToken = await import_firebase_admin2.default.auth().verifyIdToken(token);
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
    req.session.regenerate((err) => {
      if (err) {
        console.error("[auth] session regenerate failed:", err);
        return res.status(500).json({ error: "Session error" });
      }
      req.session.user = {
        firebaseUid: `local-${email}`,
        email,
        name,
        role
      };
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("[auth] session save failed:", saveErr);
          return res.status(500).json({ error: "Session save error" });
        }
        res.json({ success: true });
      });
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
  const validateBody = (schema) => (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    req.body = parsed.data;
    next();
  };
  const validateParams = (schema) => (req, res, next) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    req.params = parsed.data;
    next();
  };
  const idParamSchema = import_zod.z.object({ id: import_zod.z.string().min(1) });
  const createRideSchema = import_zod.z.object({
    pickupLocation: import_zod.z.string().min(1),
    pickupLat: import_zod.z.coerce.number(),
    pickupLng: import_zod.z.coerce.number(),
    dropoffLocation: import_zod.z.string().min(1),
    dropoffLat: import_zod.z.coerce.number(),
    dropoffLng: import_zod.z.coerce.number(),
    vehicleType: import_zod.z.enum(["e_rickshaw", "e_scooter", "cng_car"]),
    femalePrefRequested: import_zod.z.coerce.boolean().optional()
  });
  const completeRideSchema = import_zod.z.object({
    actualFare: import_zod.z.coerce.number().optional()
  });
  const availabilitySchema = import_zod.z.object({ available: import_zod.z.coerce.boolean() });
  if (SIMPLE_AUTH2 || process.env.ALLOW_SIMPLE_AUTH_ROUTES === "true") {
    console.log(`[auth] registering simple-auth routes (SIMPLE_AUTH=${SIMPLE_AUTH2}, ALLOW_SIMPLE_AUTH_ROUTES=${process.env.ALLOW_SIMPLE_AUTH_ROUTES})`);
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
        const uniqueSuffix = (user.id || "").slice(0, 8) || Math.random().toString(36).slice(2, 10);
        await storage.createDriverProfile({
          userId: user.id,
          vehicleType: "e_rickshaw",
          vehicleNumber: `PENDING-${uniqueSuffix}`,
          licenseNumber: `PENDING-${uniqueSuffix}`,
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
    res.json({ ok: true, mode: SIMPLE_AUTH2 ? "simple" : "full" });
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
      const rides2 = await storage.getUserRides(user.id, "rider");
      res.json(rides2);
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
      const userBadges2 = await storage.getUserBadges(user.id);
      const earnedBadgeIds = new Set(userBadges2.map((ub) => ub.badgeId));
      const badgesWithStatus = allBadges.map((badge) => ({
        ...badge,
        earned: earnedBadgeIds.has(badge.id)
      }));
      res.json(badgesWithStatus);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/rides", verifyFirebaseToken, validateBody(createRideSchema), async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (user.role !== "rider") {
        return res.status(403).json({ error: "Only riders can request rides" });
      }
      const { pickupLocation, pickupLat, pickupLng, dropoffLocation, dropoffLat, dropoffLng, vehicleType, femalePrefRequested } = req.body;
      const { estimateRide: estimateRide2 } = await Promise.resolve().then(() => (init_ridePricingService(), ridePricingService_exports));
      const est = estimateRide2({
        pickup: { lat: Number(pickupLat), lng: Number(pickupLng) },
        drop: { lat: Number(dropoffLat), lng: Number(dropoffLng) },
        vehicleType,
        femalePrefRequested: !!femalePrefRequested
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
        status: "pending",
        distance: est.distanceKm.toFixed(2),
        estimatedFare: est.estimatedFare.toFixed(2),
        co2Saved: est.co2SavedKg.toFixed(2),
        ecoPointsEarned: est.ecoPoints
      });
      res.json(ride);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/rides/:id", verifyFirebaseToken, validateParams(idParamSchema), async (req, res) => {
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
  app2.post("/api/rides/:id/accept", verifyFirebaseToken, validateParams(idParamSchema), async (req, res) => {
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
      res.json(updatedRide);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/rides/:id/complete", verifyFirebaseToken, validateParams(idParamSchema), validateBody(completeRideSchema), async (req, res) => {
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
      await clearRideTracking(req.params.id).catch(
        (err) => console.error("Firebase cleanup error:", err)
      );
      const rider = await storage.getUser(ride.riderId);
      if (rider) {
        const newEcoPoints = rider.ecoPoints + (ride.ecoPointsEarned || 0);
        const newCO2 = (Number(rider.totalCO2Saved) + Number(ride.co2Saved || 0)).toString();
        const updatedRider = await storage.updateUser(ride.riderId, {
          ecoPoints: newEcoPoints,
          totalCO2Saved: newCO2
        });
        try {
          const [allBadges, userBadges2] = await Promise.all([
            storage.getAllBadges(),
            storage.getUserBadges(updatedRider.id)
          ]);
          const earned = new Set(userBadges2.map((b) => b.badgeId));
          const toAward = allBadges.filter((b) => (b.requiredPoints ?? 0) <= newEcoPoints && !earned.has(b.id));
          await Promise.all(
            toAward.map((b) => storage.awardBadge({ userId: updatedRider.id, badgeId: b.id }))
          );
        } catch (e) {
          console.warn("[badges] awarding failed:", e);
        }
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
      res.json(updatedRide);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/rides/:id/start", verifyFirebaseToken, validateParams(idParamSchema), async (req, res) => {
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
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/rides/:id/sos", verifyFirebaseToken, validateParams(idParamSchema), async (req, res) => {
    try {
      const ride = await storage.getRide(req.params.id);
      if (!ride) return res.status(404).json({ error: "Ride not found" });
      await storage.updateRide(req.params.id, {});
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  const locationUpdateSchema = import_zod.z.object({
    lat: import_zod.z.coerce.number(),
    lng: import_zod.z.coerce.number(),
    heading: import_zod.z.coerce.number().optional(),
    speed: import_zod.z.coerce.number().optional()
  });
  app2.post("/api/rides/:id/location", verifyFirebaseToken, validateParams(idParamSchema), validateBody(locationUpdateSchema), async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) return res.status(404).json({ error: "User not found" });
      const ride = await storage.getRide(req.params.id);
      if (!ride) return res.status(404).json({ error: "Ride not found" });
      if (ride.riderId !== user.id && ride.driverId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this ride" });
      }
      const { lat, lng, heading, speed } = req.body;
      const who = user.id === ride.driverId ? "driver" : "rider";
      await trackLiveRide(req.params.id, lat, lng, who, { heading, speed });
      res.json({ success: true, timestamp: Date.now() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/rides/:id/location", verifyFirebaseToken, validateParams(idParamSchema), async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.firebaseUid);
      if (!user) return res.status(404).json({ error: "User not found" });
      const ride = await storage.getRide(req.params.id);
      if (!ride) return res.status(404).json({ error: "Ride not found" });
      if (ride.riderId !== user.id && ride.driverId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this ride" });
      }
      const db2 = import_firebase_admin2.default.database();
      const snapshot = await db2.ref(`active_rides/${req.params.id}`).once("value");
      const tracking = snapshot.val();
      if (!tracking) {
        return res.json({ rideId: req.params.id, locations: {} });
      }
      res.json(tracking);
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
      const rides2 = await storage.getPendingRides();
      res.json(rides2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/driver/availability", verifyFirebaseToken, validateBody(availabilitySchema), async (req, res) => {
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
      const rides2 = await storage.getActiveRides();
      res.json(rides2);
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
  if (process.env.FIREBASE_FUNCTIONS) {
    console.log("[routes] Running in Firebase Functions mode - Socket.IO disabled");
    return app2;
  }
  const httpServer = (0, import_http.createServer)(app2);
  const ioOrigins = /* @__PURE__ */ new Set();
  const addOrigin = (v) => {
    if (!v) return;
    v.split(",").map((s) => s.trim()).filter(Boolean).forEach((s) => ioOrigins.add(s));
  };
  addOrigin(process.env.FRONTEND_ORIGIN);
  addOrigin(process.env.RIDER_ORIGIN);
  addOrigin(process.env.DRIVER_ORIGIN);
  addOrigin(process.env.ADMIN_ORIGIN);
  ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"].forEach((d) => ioOrigins.add(d));
  const io = new import_socket.Server(httpServer, {
    cors: {
      origin: Array.from(ioOrigins),
      credentials: true,
      methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"],
    path: "/socket.io"
  });
  io.on("connection", (socket) => {
    console.log("Client connected to Socket.IO");
    socket.on("disconnect", () => {
      console.log("Client disconnected from Socket.IO");
    });
    socket.on("location_update", async (data) => {
      try {
        const payload = {
          rideId: data?.rideId,
          lat: Number(data?.lat),
          lng: Number(data?.lng),
          who: data?.who || "unknown",
          heading: data?.heading,
          speed: data?.speed,
          at: Date.now()
        };
        io.emit("driver_location", payload);
        if (payload.rideId && !isNaN(payload.lat) && !isNaN(payload.lng)) {
          await trackLiveRide(
            payload.rideId,
            payload.lat,
            payload.lng,
            payload.who,
            { heading: payload.heading, speed: payload.speed }
          ).catch((err) => console.error("Firebase tracking error:", err));
        }
      } catch (e) {
        console.error("socket.on(location_update) error:", e);
      }
    });
    socket.on("ride_status_update", async (data) => {
      const payload = { ...data, at: Date.now() };
      io.emit("ride_status_update", payload);
      if (data?.rideId && data?.status) {
        await setRideStatus(data.rideId, data.status).catch(
          (err) => console.error("Firebase status sync error:", err)
        );
      }
    });
    socket.on("ride_request", (data) => {
      io.emit("ride_request", { ...data, at: Date.now() });
    });
  });
  return httpServer;
}

// server/env.ts
var requirements = [
  { key: "SESSION_SECRET", requiredWhen: () => true, description: "Session cookie signing secret", redact: true },
  { key: "SIMPLE_AUTH", requiredWhen: () => true, description: "Simple auth mode toggle" },
  { key: "DATABASE_URL", requiredWhen: (e) => e.SIMPLE_AUTH !== "true", description: "Postgres connection string", redact: true },
  { key: "STRIPE_SECRET_KEY", requiredWhen: (e) => e.SIMPLE_AUTH !== "true", description: "Stripe API secret", redact: true },
  { key: "FIREBASE_SERVICE_ACCOUNT_KEY_PATH", requiredWhen: (e) => e.SIMPLE_AUTH !== "true" && e.ALLOW_SIMPLE_AUTH_ROUTES !== "true" && !e.FIREBASE_SERVICE_ACCOUNT_JSON, description: "Path to Firebase service account (or provide FIREBASE_SERVICE_ACCOUNT_JSON)", redact: false }
];
function validateEnv(env = process.env) {
  const missing = [];
  const warnings = [];
  const summary = {};
  for (const req of requirements) {
    if (!req.requiredWhen(env)) continue;
    const val = env[req.key];
    if (!val) {
      missing.push(`${req.key} (${req.description})`);
    } else {
      summary[req.key] = req.redact ? "SET" : val;
    }
  }
  if (env.ALLOW_SIMPLE_AUTH_ROUTES === "true" && env.NODE_ENV === "production") {
    warnings.push("ALLOW_SIMPLE_AUTH_ROUTES=true in production \u2013 disable unless intentionally exposing dev endpoints.");
  }
  return { missing, warnings, summary };
}
function logEnvReport(report) {
  console.log("[env] summary:", report.summary);
  if (report.missing.length) {
    console.error("[env] missing required variables:", report.missing);
  }
  if (report.warnings.length) {
    console.warn("[env] warnings:", report.warnings);
  }
  if (report.missing.length) {
    throw new Error(`Missing required environment variables: ${report.missing.join(", ")}`);
  }
}
if (process.env.NODE_ENV !== "test") {
  try {
    const report = validateEnv();
    logEnvReport(report);
  } catch (e) {
    throw e;
  }
}

// server/index.ts
(0, import_dotenv4.config)();
var app = (0, import_express.default)();
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
app.use(import_express.default.json());
app.use(import_express.default.urlencoded({ extended: false }));
{
  const origins = /* @__PURE__ */ new Set();
  const add = (v) => {
    if (!v) return;
    v.split(",").map((s) => s.trim()).filter(Boolean).forEach((s) => origins.add(s));
  };
  add(process.env.FRONTEND_ORIGIN);
  add(process.env.RIDER_ORIGIN);
  add(process.env.DRIVER_ORIGIN);
  add(process.env.ADMIN_ORIGIN);
  ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"].forEach((d) => origins.add(d));
  app.use(
    (0, import_cors.default)({
      origin: Array.from(origins),
      credentials: true
    })
  );
}
var MemoryStore = (0, import_memorystore.default)(import_express_session.default);
var isCodespaces = !!process.env.CODESPACES;
var forceSecure = process.env.COOKIE_SECURE === "true";
var useSecureCookies = isCodespaces || forceSecure;
var sameSitePolicy = useSecureCookies ? "none" : "lax";
var sessionStore;
if (process.env.REDIS_URL) {
  const RedisStore = (0, import_connect_redis.default)(import_express_session.default);
  const redisClient = (0, import_redis.createClient)({ url: process.env.REDIS_URL });
  redisClient.on("error", (err) => console.error("[redis] client error:", err));
  redisClient.connect().catch((e) => console.error("[redis] connect failed:", e));
  sessionStore = new RedisStore({ client: redisClient, prefix: "sess:" });
} else {
  sessionStore = new MemoryStore({ checkPeriod: 1e3 * 60 * 60 });
}
app.use(
  (0, import_express_session.default)({
    secret: process.env.SESSION_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    proxy: true,
    cookie: {
      secure: useSecureCookies,
      httpOnly: true,
      sameSite: sameSitePolicy,
      maxAge: 1e3 * 60 * 60 * 8
    }
  })
);
var apiLimiter = (0, import_express_rate_limit.default)({ windowMs: 15 * 60 * 1e3, max: 300, standardHeaders: true, legacyHeaders: false });
var authLimiter = (0, import_express_rate_limit.default)({ windowMs: 10 * 60 * 1e3, max: 50, standardHeaders: true, legacyHeaders: false });
var rideCreateLimiter = (0, import_express_rate_limit.default)({ windowMs: 5 * 60 * 1e3, max: 60, standardHeaders: true, legacyHeaders: false });
app.use("/api", apiLimiter);
app.use(["/api/auth", "/api/create-payment-intent"], authLimiter);
app.use("/api/rides", (req, res, next) => {
  if (req.method === "POST" && (req.path === "/" || req.path === "")) {
    return rideCreateLimiter(req, res, next);
  }
  return next();
});
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
  if (process.env.FIREBASE_FUNCTIONS) {
    log("Exporting app for Firebase Functions");
    module.exports = app;
    module.exports.default = app;
    module.exports.app = app;
    return;
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
