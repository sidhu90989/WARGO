import { z } from "zod";

// Enumerations (string literal unions)
export const userRoles = ["rider", "driver", "admin"] as const;
export type UserRole = typeof userRoles[number];

export const genders = ["male", "female", "other", "prefer_not_to_say"] as const;
export type Gender = typeof genders[number];

export const vehicleTypes = ["e_rickshaw", "e_scooter", "cng_car"] as const;
export type VehicleType = typeof vehicleTypes[number];

export const rideStatuses = ["pending", "accepted", "in_progress", "completed", "cancelled"] as const;
export type RideStatus = typeof rideStatuses[number];

export const paymentMethods = ["cash", "card", "upi", "wallet"] as const;
export type PaymentMethod = typeof paymentMethods[number];

export const paymentStatuses = ["pending", "completed", "failed", "refunded"] as const;
export type PaymentStatus = typeof paymentStatuses[number];

export const kycStatuses = ["pending", "verified", "rejected"] as const;
export type KycStatus = typeof kycStatuses[number];

// Zod Schemas for Insert shapes
export const insertUserSchema = z.object({
  firebaseUid: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  gender: z.enum(genders).optional(),
  role: z.enum(userRoles).default("rider").optional(),
  profilePhoto: z.string().url().nullable().optional(),
  ecoPoints: z.number().int().nonnegative().default(0).optional(),
  totalCO2Saved: z.string().default("0").optional(),
  referralCode: z.string().optional(),
  referredBy: z.string().nullable().optional(),
  isActive: z.boolean().default(true).optional(),
});

export const insertDriverProfileSchema = z.object({
  userId: z.string(),
  vehicleType: z.enum(vehicleTypes),
  vehicleNumber: z.string(),
  vehicleModel: z.string().optional(),
  licenseNumber: z.string(),
  kycStatus: z.enum(kycStatuses).default("pending").optional(),
  kycDocuments: z.array(z.string()).default([]).optional(),
  rating: z.string().default("5.00").optional(),
  totalRides: z.number().int().nonnegative().default(0).optional(),
  totalEarnings: z.string().default("0").optional(),
  isAvailable: z.boolean().default(false).optional(),
  femalePrefEnabled: z.boolean().default(false).optional(),
});

export const insertRideSchema = z.object({
  riderId: z.string(),
  driverId: z.string().optional(),
  pickupLocation: z.string(),
  pickupLat: z.union([z.number(), z.string()]),
  pickupLng: z.union([z.number(), z.string()]),
  dropoffLocation: z.string(),
  dropoffLat: z.union([z.number(), z.string()]),
  dropoffLng: z.union([z.number(), z.string()]),
  vehicleType: z.enum(vehicleTypes),
  femalePrefRequested: z.boolean().default(false).optional(),
  status: z.enum(rideStatuses).default("pending").optional(),
  distance: z.string().optional(),
  estimatedFare: z.string().optional(),
  actualFare: z.string().optional(),
  co2Saved: z.string().optional(),
  ecoPointsEarned: z.number().int().default(0).optional(),
  requestedAt: z.date().optional(),
  acceptedAt: z.date().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  cancelledAt: z.date().optional(),
});

export const insertPaymentSchema = z.object({
  rideId: z.string(),
  amount: z.string(),
  paymentMethod: z.enum(paymentMethods),
  paymentStatus: z.enum(paymentStatuses).default("pending").optional(),
  stripePaymentIntentId: z.string().optional(),
  transactionId: z.string().optional(),
});

export const insertRatingSchema = z.object({
  rideId: z.string(),
  raterId: z.string(),
  rateeId: z.string(),
  rating: z.number().int(),
  feedback: z.string().optional(),
});

export const insertEcoBadgeSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  iconName: z.string(),
  requiredPoints: z.number().int().nonnegative(),
});

export const insertUserBadgeSchema = z.object({
  userId: z.string(),
  badgeId: z.string(),
});

export const insertReferralSchema = z.object({
  referrerId: z.string(),
  refereeId: z.string(),
  bonusAwarded: z.boolean().default(false).optional(),
});

// Runtime Types (records as stored/returned by backend)
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDriverProfile = z.infer<typeof insertDriverProfileSchema>;
export type InsertRide = z.infer<typeof insertRideSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type InsertEcoBadge = z.infer<typeof insertEcoBadgeSchema>;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

// Entity Types (complete)
export type User = {
  id: string;
  firebaseUid?: string;
  email?: string;
  name: string;
  phone?: string;
  gender?: Gender;
  role: UserRole;
  profilePhoto?: string | null;
  ecoPoints: number;
  totalCO2Saved: string;
  referralCode?: string;
  referredBy?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type DriverProfile = {
  id: string;
  userId: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  vehicleModel?: string;
  licenseNumber: string;
  kycStatus: KycStatus;
  kycDocuments?: string[];
  rating?: string;
  totalRides: number;
  totalEarnings: string;
  isAvailable: boolean;
  femalePrefEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Ride = {
  id: string;
  riderId: string;
  driverId?: string;
  pickupLocation: string;
  pickupLat: number | string;
  pickupLng: number | string;
  dropoffLocation: string;
  dropoffLat: number | string;
  dropoffLng: number | string;
  vehicleType: VehicleType;
  femalePrefRequested: boolean;
  status: RideStatus;
  distance?: string;
  estimatedFare?: string;
  actualFare?: string;
  co2Saved?: string;
  ecoPointsEarned?: number;
  requestedAt?: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Payment = {
  id: string;
  rideId: string;
  amount: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Rating = {
  id: string;
  rideId: string;
  raterId: string;
  rateeId: string;
  rating: number;
  feedback?: string;
  createdAt: Date;
};

export type EcoBadge = {
  id: string;
  name: string;
  description?: string;
  iconName: string;
  requiredPoints: number;
  createdAt: Date;
};

export type UserBadge = {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
};

export type Referral = {
  id: string;
  referrerId: string;
  refereeId: string;
  bonusAwarded: boolean;
  createdAt: Date;
};
