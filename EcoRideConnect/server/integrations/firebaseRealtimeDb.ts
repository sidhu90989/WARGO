// Example: Using Firebase Realtime Database alongside Postgres
// This demonstrates how to use both databases in the WARGO API

import admin from 'firebase-admin';

// Firebase Admin is already initialized in server/routes.ts with Realtime Database URL
// Access it anywhere in your backend like this:

export async function exampleRealtimeDbUsage() {
  // Get a reference to the database
  const db = admin.database();
  
  // Write data
  await db.ref('active_rides/ride123').set({
    riderId: 'user_abc',
    driverId: 'driver_xyz',
    status: 'in_progress',
    currentLocation: {
      lat: 28.6129,
      lng: 77.2295,
    },
    lastUpdated: Date.now(),
  });
  
  // Read data
  const snapshot = await db.ref('active_rides/ride123').once('value');
  const ride = snapshot.val();
  console.log('Active ride:', ride);
  
  // Listen to changes (realtime)
  db.ref('active_rides/ride123/currentLocation').on('value', (snapshot) => {
    const location = snapshot.val();
    console.log('Location updated:', location);
  });
  
  // Update specific fields
  await db.ref('active_rides/ride123').update({
    status: 'completed',
    completedAt: Date.now(),
  });
  
  // Delete data
  await db.ref('active_rides/ride123').remove();
}

// Use case: Store live ride tracking in Realtime DB, persist historical data in Postgres
// - Realtime DB: Live driver locations, active ride status, Socket.IO supplements
// - Postgres: User profiles, completed rides, payments, analytics

interface LocationData {
  lat: number;
  lng: number;
  who: string;
  timestamp: number;
  heading?: number;
  speed?: number;
}

export async function trackLiveRide(
  rideId: string,
  lat: number,
  lng: number,
  who: string = 'unknown',
  extra?: { heading?: number; speed?: number }
): Promise<void> {
  const db = admin.database();
  const location: LocationData = {
    lat,
    lng,
    who,
    timestamp: Date.now(),
    ...(extra?.heading !== undefined && { heading: extra.heading }),
    ...(extra?.speed !== undefined && { speed: extra.speed }),
  };

  // Store under driver or rider key for differentiated tracking
  const key = who === 'driver' ? 'driver_location' : 'rider_location';
  await db.ref(`active_rides/${rideId}/${key}`).set(location);
  
  // Also update last activity timestamp
  await db.ref(`active_rides/${rideId}/lastUpdated`).set(Date.now());
}

export async function setRideStatus(rideId: string, status: string): Promise<void> {
  const db = admin.database();
  await db.ref(`active_rides/${rideId}/status`).set({
    value: status,
    timestamp: Date.now(),
  });
}

export async function clearRideTracking(rideId: string): Promise<void> {
  const db = admin.database();
  await db.ref(`active_rides/${rideId}`).remove();
}

export async function getRideTracking(rideId: string): Promise<any> {
  const db = admin.database();
  const snapshot = await db.ref(`active_rides/${rideId}`).once('value');
  return snapshot.val();
}

export function listenToRideLocation(
  rideId: string,
  callback: (driverLoc: LocationData | null, riderLoc: LocationData | null) => void
): () => void {
  const db = admin.database();
  const ref = db.ref(`active_rides/${rideId}`);
  
  ref.on('value', (snapshot) => {
    const data = snapshot.val();
    callback(data?.driver_location || null, data?.rider_location || null);
  });
  
  return () => ref.off('value');
}

// Architecture: Socket.IO + Firebase Realtime DB dual tracking
// - POST /api/rides/:id/location: REST endpoint for location updates
// - Socket.IO location_update: Real-time bidirectional events
// - Firebase Realtime DB: Persistent backup, queryable history, redundancy
