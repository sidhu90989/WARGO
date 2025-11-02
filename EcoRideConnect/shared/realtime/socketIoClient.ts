import { io, Socket } from 'socket.io-client';

export type UserType = 'rider' | 'driver' | 'admin';
export type SocketEvent = 'ride_request' | 'driver_location' | 'ride_status_update' | 'connect' | 'disconnect' | 'error';

type Listener = (payload?: any) => void;

class SocketIoService {
  private socket: Socket | null = null;
  private listeners: Map<SocketEvent, Set<Listener>> = new Map();
  private userType: UserType | null = null;

  connect(userType: UserType) {
    this.userType = userType;
    const base = (import.meta as any).env?.VITE_SOCKET_URL || (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

    this.socket = io(String(base).replace(/\/$/, ''), {
      withCredentials: true,
      transports: ['websocket'],
      auth: { userType },
      path: '/socket.io',
    });

    this.socket.on('connect', () => this.emit('connect'));
    this.socket.on('disconnect', () => this.emit('disconnect'));
  this.socket.on('connect_error', (e: any) => this.emit('error', e));

    // App events
  this.socket.on('driver_location', (data: any) => this.emit('driver_location', data));
  this.socket.on('ride_request', (data: any) => this.emit('ride_request', data));
  this.socket.on('ride_status_update', (data: any) => this.emit('ride_status_update', data));
  }

  on(event: SocketEvent, listener: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  off(event: SocketEvent, listener: Listener) {
    this.listeners.get(event)?.delete(listener);
  }

  private emit(event: SocketEvent, payload?: any) {
    this.listeners.get(event)?.forEach((l) => l(payload));
  }

  emitLocation(rideId: string, lat: number, lng: number, who?: string) {
    this.socket?.emit('location_update', { rideId, lat, lng, who, at: Date.now() });
  }

  emitRideStatus(rideId: string, status: string, payload?: any) {
    this.socket?.emit('ride_status_update', { rideId, status, payload, at: Date.now() });
  }
}

const socketIoService = new SocketIoService();
export default socketIoService;
