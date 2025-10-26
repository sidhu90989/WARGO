/**
 * Shared Socket.IO Client for real-time updates across apps
 */
import { io, Socket } from 'socket.io-client';
import type { LatLng } from '../types/geo';

export interface RideRequest {
  riderId: string;
  pickup: LatLng & { address: string };
  drop: LatLng & { address: string };
  vehicleType: 'auto' | 'bike' | 'car';
  fare: number;
  distance: number;
}

export interface RideDetails extends RideRequest {
  id: string;
  driverId?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface DriverLocation {
  driverId: string;
  location: LatLng;
  vehicleType: 'auto' | 'bike' | 'car';
  isAvailable: boolean;
  rating: number;
  timestamp: number;
}

let socket: Socket | null = null;

export const initSocket = (
  userId: string,
  userType: 'rider' | 'driver' | 'admin'
): Socket => {
  const socketServer = (import.meta as any).env?.VITE_SOCKET_SERVER ||
    (typeof window !== 'undefined' ? `${window.location.protocol === 'https:' ? 'https' : 'http'}://${window.location.host}` : 'http://localhost:5000');

  if (socket?.connected) return socket;

  socket = io(socketServer, {
    auth: { userId, userType },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });
  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });
  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;
export const disconnectSocket = (): void => { if (socket) { socket.disconnect(); socket = null; } };

// Driver events
export const sendDriverLocationUpdate = (driverId: string, location: LatLng): void => {
  if (!socket) return;
  socket.emit('driver_location_update', { driverId, location, timestamp: Date.now() });
};
export const updateDriverStatus = (driverId: string, isAvailable: boolean): void => {
  if (!socket) return;
  socket.emit('driver_status_update', { driverId, isAvailable, timestamp: Date.now() });
};
export const acceptRideRequest = (rideId: string, driverId: string): void => {
  if (!socket) return;
  socket.emit('ride_accept', { rideId, driverId, timestamp: Date.now() });
};
export const rejectRideRequest = (rideId: string, driverId: string, reason?: string): void => {
  if (!socket) return;
  socket.emit('ride_reject', { rideId, driverId, reason, timestamp: Date.now() });
};
export const startRide = (rideId: string): void => { if (!socket) return; socket.emit('ride_start', { rideId, timestamp: Date.now() }); };
export const completeRide = (rideId: string): void => { if (!socket) return; socket.emit('ride_complete', { rideId, timestamp: Date.now() }); };
export const onRideRequest = (cb: (ride: RideDetails) => void): void => { if (!socket) return; socket.on('new_ride_request', cb); };
export const offRideRequest = (): void => { if (!socket) return; socket.off('new_ride_request'); };

// Rider events
export const requestRide = (rideRequest: RideRequest): void => { if (!socket) return; socket.emit('ride_request', { ...rideRequest, timestamp: Date.now() }); };
export const cancelRide = (rideId: string, reason?: string): void => { if (!socket) return; socket.emit('ride_cancel', { rideId, reason, timestamp: Date.now() }); };
export const onDriverAssigned = (cb: (d: { rideId: string; driver: DriverLocation }) => void): void => { if (!socket) return; socket.on('driver_assigned', cb); };
export const onDriverLocationUpdate = (cb: (location: LatLng) => void): void => { if (!socket) return; socket.on('driver_location', cb); };
export const onRideStatusUpdate = (cb: (status: RideDetails) => void): void => { if (!socket) return; socket.on('ride_status_update', cb); };
export const removeRiderListeners = (): void => { if (!socket) return; socket.off('driver_assigned'); socket.off('driver_location'); socket.off('ride_status_update'); };

// Admin events
export const requestAllDrivers = (): void => { if (!socket) return; socket.emit('request_all_drivers'); };
export const onAllDriversLocations = (cb: (drivers: DriverLocation[]) => void): void => { if (!socket) return; socket.on('all_drivers_locations', cb); };
export const onAllActiveRides = (cb: (rides: RideDetails[]) => void): void => { if (!socket) return; socket.on('all_active_rides', cb); };
export const onPlatformMetrics = (cb: (m: { activeDrivers: number; activeRiders: number; ongoingRides: number; todayRevenue: number; }) => void): void => { if (!socket) return; socket.on('platform_metrics', cb); };
export const removeAdminListeners = (): void => { if (!socket) return; socket.off('all_drivers_locations'); socket.off('all_active_rides'); socket.off('platform_metrics'); };

// Common
export const onError = (cb: (error: { message: string; code?: string }) => void): void => { if (!socket) return; socket.on('error', cb); };
export const onNotification = (cb: (n: { type: string; message: string; data?: any }) => void): void => { if (!socket) return; socket.on('notification', cb); };
export const emitEvent = (name: string, data: any): void => { if (!socket) return; socket.emit(name, data); };
export const onEvent = (name: string, cb: (...args: any[]) => void): void => { if (!socket) return; socket.on(name, cb); };
export const offEvent = (name: string, cb?: (...args: any[]) => void): void => { if (!socket) return; if (cb) socket.off(name, cb); else socket.off(name); };
export const isSocketConnected = (): boolean => !!(socket?.connected);
