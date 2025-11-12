import { describe, it, expect } from 'vitest';

// Ensure SIMPLE_AUTH mode for the storage singleton selection before import
process.env.SIMPLE_AUTH = 'true';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { IStorage } from '../../server/storage';

let storage: IStorage;
async function getStorage(): Promise<IStorage> {
  if (!storage) {
    const mod = await import('../../server/storage');
    storage = mod.storage as IStorage;
  }
  return storage;
}

describe('MemoryStorage basic flows', () => {
  it('creates users and driver profile, and manages rides lifecycle', async () => {
    const store = await getStorage();

    const rider = await store.createUser({
      firebaseUid: 'local-rider',
      email: 'rider@test.com',
      name: 'Rider Test',
      role: 'rider',
      ecoPoints: 0,
      totalCO2Saved: '0',
      isActive: true,
    } as any);

    const driver = await store.createUser({
      firebaseUid: 'local-driver',
      email: 'driver@test.com',
      name: 'Driver Test',
      role: 'driver',
      ecoPoints: 0,
      totalCO2Saved: '0',
      isActive: true,
    } as any);

    const profile = await store.createDriverProfile({
      userId: driver.id,
      vehicleType: 'e_rickshaw',
      vehicleNumber: 'PENDING-123',
      licenseNumber: 'LIC-123',
    } as any);

    expect(profile.userId).toBe(driver.id);

    const ride = await store.createRide({
      riderId: rider.id,
      pickupLocation: 'A',
      pickupLat: 12.0,
      pickupLng: 77.0,
      dropoffLocation: 'B',
      dropoffLat: 12.5,
      dropoffLng: 77.5,
      vehicleType: 'e_rickshaw',
      femalePrefRequested: false,
      status: 'pending',
    } as any);

  const pending = await store.getPendingRides();
  expect(pending.find((r: any) => r.id === ride.id)).toBeTruthy();

    await store.updateRide(ride.id, { status: 'accepted', driverId: driver.id });
  const active = await store.getActiveRides();
  expect(active.find((r: any) => r.id === ride.id)).toBeTruthy();

    await store.updateRide(ride.id, { status: 'completed', actualFare: '50' as any });
    const stats = await store.getDriverStats(driver.id);
    expect(Number(stats.todayEarnings)).toBeGreaterThanOrEqual(0);
  });
});
