import type { vehicleTypeEnum } from "@shared/schema";

// Simple haversine distance in KM
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface EstimateRideInput {
  pickup: { lat: number; lng: number };
  drop: { lat: number; lng: number };
  vehicleType: 'e_rickshaw' | 'e_scooter' | 'cng_car';
  femalePrefRequested?: boolean;
}

export interface RideEstimate {
  distanceKm: number;
  estimatedFare: number;
  co2SavedKg: number; // relative savings vs baseline gas
  ecoPoints: number;
}

// Configuration constants; in real mode could be env-driven.
const BASE_FARES: Record<string, number> = {
  e_scooter: 25,
  e_rickshaw: 40,
  cng_car: 75,
};

const PER_KM: Record<string, number> = {
  e_scooter: 6,
  e_rickshaw: 8,
  cng_car: 12,
};

// Rough CO₂ emission factor differentials (kg/km saved compared to petrol car)
const CO2_SAVED_PER_KM: Record<string, number> = {
  e_scooter: 0.18,
  e_rickshaw: 0.14,
  cng_car: 0.06, // smaller savings vs petrol
};

export function estimateRide(input: EstimateRideInput): RideEstimate {
  const distanceKm = Math.max(
    0.5,
    haversine(input.pickup.lat, input.pickup.lng, input.drop.lat, input.drop.lng),
  );
  const base = BASE_FARES[input.vehicleType] ?? 50;
  const perKm = PER_KM[input.vehicleType] ?? 10;
  let fare = base + distanceKm * perKm;
  if (input.femalePrefRequested) fare *= 1.05; // slight premium for preference feature
  const co2SavedKg = distanceKm * (CO2_SAVED_PER_KM[input.vehicleType] ?? 0.1);
  const ecoPoints = Math.round(co2SavedKg * 10 + distanceKm * 2);
  return {
    distanceKm,
    estimatedFare: fare,
    co2SavedKg,
    ecoPoints,
  };
}

export default { estimateRide };