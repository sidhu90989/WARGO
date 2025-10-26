/**
 * Shared Socket.IO Client for real-time updates across apps
 */
import { io, Socket } from 'socket.io-client';
import type { LatLng } from '../types/geo';
import { SOCKET_EVENTS } from './socketEvents';

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
  // Legacy + namespaced
  socket.emit('driver_location_update', { driverId, location, timestamp: Date.now() });
  socket.emit('driver:location_update', { location });
  socket.emit(SOCKET_EVENTS.DRIVER.UPDATE_LOCATION, { driverId, location, timestamp: Date.now() });
};
export const updateDriverStatus = (driverId: string, isAvailable: boolean): void => {
  if (!socket) return;
  socket.emit('driver_status_update', { driverId, isAvailable, timestamp: Date.now() });
};
export const goOnline = (location: LatLng): void => { if (!socket) return; socket.emit('driver:online', { location }); };
export const goOffline = (): void => { if (!socket) return; socket.emit('driver:offline'); };
export const acceptRideRequest = (rideId: string, driverId: string): void => {
  if (!socket) return;
  socket.emit('ride_accept', { rideId, driverId, timestamp: Date.now() });
  socket.emit('ride:accept', { rideId });
  socket.emit(SOCKET_EVENTS.DRIVER.ACCEPT_RIDE, { rideId, driverId, timestamp: Date.now() });
};
export const rejectRideRequest = (rideId: string, driverId: string, reason?: string): void => {
  if (!socket) return;
  socket.emit('ride_reject', { rideId, driverId, reason, timestamp: Date.now() });
  socket.emit('ride:reject', { rideId, reason });
};
export const startRide = (rideId: string): void => { if (!socket) return; socket.emit('ride_start', { rideId, timestamp: Date.now() }); socket.emit('ride:start', { rideId }); socket.emit(SOCKET_EVENTS.DRIVER.RIDE_STARTED, { rideId, timestamp: Date.now() }); };
export const completeRide = (rideId: string): void => { if (!socket) return; socket.emit('ride_complete', { rideId, timestamp: Date.now() }); socket.emit('ride:complete', { rideId }); socket.emit(SOCKET_EVENTS.DRIVER.RIDE_COMPLETED, { rideId, timestamp: Date.now() }); };
export const onRideRequest = (cb: (ride: RideDetails) => void): void => { if (!socket) return; socket.on('new_ride_request', cb); socket.on('ride:request', cb as any); socket.on(SOCKET_EVENTS.DRIVER.NEW_RIDE_REQUEST, cb as any); };
export const offRideRequest = (): void => { if (!socket) return; socket.off('new_ride_request'); socket.off('ride:request'); };

// Rider events
export const requestRide = (rideRequest: RideRequest): void => { if (!socket) return; socket.emit('ride_request', { ...rideRequest, timestamp: Date.now() }); socket.emit('ride:request', rideRequest); socket.emit(SOCKET_EVENTS.RIDER.REQUEST_RIDE, { ...rideRequest, timestamp: Date.now() }); };
export const cancelRide = (rideId: string, reason?: string): void => { if (!socket) return; socket.emit('ride_cancel', { rideId, reason, timestamp: Date.now() }); socket.emit('ride:cancel', { rideId }); socket.emit(SOCKET_EVENTS.RIDER.CANCEL_RIDE, { rideId, reason, timestamp: Date.now() }); };
export const onDriverAssigned = (cb: (d: { rideId: string; driver: DriverLocation }) => void): void => { if (!socket) return; socket.on('driver_assigned', cb); socket.on('ride:driver_assigned', cb as any); socket.on(SOCKET_EVENTS.RIDER.DRIVER_ASSIGNED, cb as any); };
export const onDriverLocationUpdate = (cb: (location: LatLng) => void): void => { if (!socket) return; socket.on('driver_location', cb); socket.on('ride:driver_location', cb as any); socket.on(SOCKET_EVENTS.RIDER.DRIVER_LOCATION, cb as any); };
export const onRideStatusUpdate = (cb: (status: RideDetails) => void): void => { if (!socket) return; socket.on('ride_status_update', cb); socket.on('ride:started', cb as any); socket.on('ride:completed', cb as any); socket.on(SOCKET_EVENTS.DRIVER.RIDE_STARTED, cb as any); socket.on(SOCKET_EVENTS.DRIVER.RIDE_COMPLETED, cb as any); };
export const removeRiderListeners = (): void => { if (!socket) return; socket.off('driver_assigned'); socket.off('ride:driver_assigned'); socket.off('driver_location'); socket.off('ride:driver_location'); socket.off('ride_status_update'); socket.off('ride:started'); socket.off('ride:completed'); };

// Admin events
export const requestAllDrivers = (): void => { if (!socket) return; socket.emit('request_all_drivers'); socket.emit('admin:get_all_drivers'); };
export const onAllDriversLocations = (cb: (drivers: DriverLocation[]) => void): void => { if (!socket) return; socket.on('all_drivers_locations', cb); socket.on('admin:all_drivers', (payload: any) => cb((payload?.drivers ?? payload) as any)); socket.on(SOCKET_EVENTS.ADMIN.DRIVERS_LOCATION, cb as any); };
export const onAllActiveRides = (cb: (rides: RideDetails[]) => void): void => { if (!socket) return; socket.on('all_active_rides', cb); socket.on('admin:active_rides', (payload: any) => cb((payload?.rides ?? payload) as any)); socket.on(SOCKET_EVENTS.ADMIN.ALL_RIDES_UPDATE, cb as any); };
export const onPlatformMetrics = (cb: (m: { activeDrivers: number; activeRiders: number; ongoingRides: number; todayRevenue: number; }) => void): void => { if (!socket) return; socket.on('platform_metrics', cb); socket.on('platform:metrics', cb as any); socket.on(SOCKET_EVENTS.ADMIN.PLATFORM_METRICS, cb as any); };
export const removeAdminListeners = (): void => { if (!socket) return; socket.off('all_drivers_locations'); socket.off('all_active_rides'); socket.off('platform_metrics'); };

// Common
export const onError = (cb: (error: { message: string; code?: string }) => void): void => { if (!socket) return; socket.on('error', cb); };
export const onNotification = (cb: (n: { type: string; message: string; data?: any }) => void): void => { if (!socket) return; socket.on('notification', cb); };
export const emitEvent = (name: string, data: any): void => { if (!socket) return; socket.emit(name, data); };
export const onEvent = (name: string, cb: (...args: any[]) => void): void => { if (!socket) return; socket.on(name, cb); };
export const offEvent = (name: string, cb?: (...args: any[]) => void): void => { if (!socket) return; if (cb) socket.off(name, cb); else socket.off(name); };
export const isSocketConnected = (): boolean => !!(socket?.connected);
