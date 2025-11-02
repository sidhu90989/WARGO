import socketService from "@shared/realtime/socketIoClient";

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}

export type PositionCallback = (pos: GeoPosition) => void;

class LocationTrackingService {
  private watchId: number | null = null;

  start(userType: 'rider' | 'driver' | 'admin', onUpdate?: PositionCallback) {
    socketService.connect(userType);

    if (!('geolocation' in navigator)) {
      return () => {};
    }

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const payload: GeoPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: Date.now(),
        };
        onUpdate?.(payload);
      },
      (_err) => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );

    return () => this.stop();
  }

  // Convenience to forward a location update to server via WebSocket
  sendLocation(rideId: string, lat: number, lng: number, who?: string) {
    socketService.emitLocation(rideId, lat, lng, who);
  }

  stop() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}

export const locationTrackingService = new LocationTrackingService();
export default locationTrackingService;
