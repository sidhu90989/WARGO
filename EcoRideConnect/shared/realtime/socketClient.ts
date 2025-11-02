// Lightweight WebSocket client compatible with the server's `ws` implementation
// NOTE: The current server uses native WebSocket (not Socket.IO). This client
// connects to `${VITE_SOCKET_URL || VITE_API_URL}/ws` and dispatches messages
// by their `type` field: 'location_update', 'ride_request', 'ride_status_update'.

export type UserType = 'rider' | 'driver' | 'admin';
export type SocketEvent = 'ride_request' | 'driver_location' | 'ride_status_update' | 'open' | 'close' | 'error';

export interface LocationUpdate {
  type: 'location_update';
  rideId: string;
  lat: number;
  lng: number;
  who?: string;
  at?: number;
}

export interface RideRequestEvent {
  type: 'ride_request';
  rideId: string;
  payload?: any;
}

export interface RideStatusUpdateEvent {
  type: 'ride_status_update';
  rideId: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  payload?: any;
}

type InboundEvent = LocationUpdate | RideRequestEvent | RideStatusUpdateEvent | { type: string; [k: string]: any };

type Listener = (payload?: any) => void;

class SocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<SocketEvent, Set<Listener>> = new Map();
  private reconnectAttempts = 0;
  private userType: UserType | null = null;

  connect(userType: UserType) {
    this.userType = userType;

    const base = import.meta.env.VITE_SOCKET_URL
      || (import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/^http/, 'ws') : '')
      || 'ws://localhost:5000';

    const url = base.endsWith('/ws') ? base : `${base.replace(/\/$/, '')}/ws`;

    try {
      this.ws = new WebSocket(url);
    } catch (e) {
      this.emit('error', e);
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.emit('open');
      // Optional hello for server-side logging/association
      this.safeSend({ type: 'hello', who: userType, at: Date.now() });
    };

    this.ws.onmessage = (ev: MessageEvent) => {
      try {
        const data: InboundEvent = JSON.parse(String(ev.data));
        switch (data.type) {
          case 'location_update':
            this.emit('driver_location', data);
            break;
          case 'ride_request':
            this.emit('ride_request', data);
            break;
          case 'ride_status_update':
            this.emit('ride_status_update', data);
            break;
          default:
            // Unknown types are ignored but available for debugging
            break;
        }
      } catch (_e) {
        this.emit('error', new Error('Invalid WS message'));
      }
    };

    this.ws.onerror = (ev: Event) => {
      this.emit('error', ev);
    };

    this.ws.onclose = () => {
      this.emit('close');
      this.tryReconnect();
    };
  }

  private tryReconnect() {
    const max = 5;
    if (this.reconnectAttempts >= max || !this.userType) return;
    const backoff = Math.min(30000, 1000 * Math.pow(2, this.reconnectAttempts));
    this.reconnectAttempts += 1;
    setTimeout(() => this.connect(this.userType!), backoff);
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

  private safeSend(obj: Record<string, any>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }

  // Helper to publish driver/rider locations
  sendLocation(rideId: string, lat: number, lng: number, who?: string) {
    this.safeSend({ type: 'location_update', rideId, lat, lng, who, at: Date.now() });
  }

  // Generic sender if needed by features
  send(type: string, payload: Record<string, any>) {
    this.safeSend({ type, ...payload });
  }
}

export const socketService = new SocketService();
export default socketService;
