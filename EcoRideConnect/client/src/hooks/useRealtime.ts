import { useEffect, useRef, useState } from "react";

export type RideEvent =
  | { type: "ride_added"; ride: any }
  | { type: "ride_updated"; ride: any }
  | { type: "ride_removed"; rideId: string };

export type DriverEvent =
  | { type: "driver_added"; driver: any }
  | { type: "driver_updated"; driver: any }
  | { type: "driver_removed"; driverId: string };

export type LocationEvent = {
  type: "location_update";
  rideId: string;
  lat: number;
  lng: number;
  who: "rider" | "driver" | "unknown";
  at: number;
};

export type RealtimeMessage = RideEvent | DriverEvent | LocationEvent;

export type UseRealtimeOptions = {
  // Optional filters
  // If provided, only events matching these predicates will be forwarded to callbacks
  filter?: (msg: RealtimeMessage) => boolean;

  // Optional callbacks for specific events
  onRideAdded?: (e: Extract<RealtimeMessage, { type: "ride_added" }>) => void;
  onRideUpdated?: (e: Extract<RealtimeMessage, { type: "ride_updated" }>) => void;
  onRideRemoved?: (e: Extract<RealtimeMessage, { type: "ride_removed" }>) => void;

  onDriverAdded?: (e: Extract<RealtimeMessage, { type: "driver_added" }>) => void;
  onDriverUpdated?: (e: Extract<RealtimeMessage, { type: "driver_updated" }>) => void;
  onDriverRemoved?: (e: Extract<RealtimeMessage, { type: "driver_removed" }>) => void;

  onLocationUpdate?: (e: Extract<RealtimeMessage, { type: "location_update" }>) => void;

  // Fallback handler for any event
  onMessage?: (msg: any) => void;
};

function deriveWsUrl(): string {
  const apiUrl = (import.meta as any).env?.VITE_API_URL as string | undefined;
  if (apiUrl) {
    try {
      const u = new URL(apiUrl);
      u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
      u.pathname = "/ws";
      u.search = "";
      return u.toString();
    } catch {
      /* fallthrough */
    }
  }
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws`;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const { filter, onRideAdded, onRideUpdated, onRideRemoved, onDriverAdded, onDriverUpdated, onDriverRemoved, onLocationUpdate, onMessage } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const url = deriveWsUrl();
    const ws = new WebSocket(url);
    wsRef.current = ws;

    const handle = (raw: MessageEvent<string>) => {
      try {
        const msg = JSON.parse(raw.data) as any;
        if (filter && !filter(msg)) return;
        switch (msg.type as RealtimeMessage["type"]) {
          case "ride_added":
            onRideAdded?.(msg as Extract<RealtimeMessage, { type: "ride_added" }>);
            break;
          case "ride_updated":
            onRideUpdated?.(msg as Extract<RealtimeMessage, { type: "ride_updated" }>);
            break;
          case "ride_removed":
            onRideRemoved?.(msg as Extract<RealtimeMessage, { type: "ride_removed" }>);
            break;
          case "driver_added":
            onDriverAdded?.(msg as Extract<RealtimeMessage, { type: "driver_added" }>);
            break;
          case "driver_updated":
            onDriverUpdated?.(msg as Extract<RealtimeMessage, { type: "driver_updated" }>);
            break;
          case "driver_removed":
            onDriverRemoved?.(msg as Extract<RealtimeMessage, { type: "driver_removed" }>);
            break;
          case "location_update":
            onLocationUpdate?.(msg as Extract<RealtimeMessage, { type: "location_update" }>);
            break;
          default:
            break;
        }
        onMessage?.(msg);
      } catch {
        // ignore
      }
    };

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = handle as any;

    return () => {
      ws.close();
    };
  }, [filter, onRideAdded, onRideUpdated, onRideRemoved, onDriverAdded, onDriverUpdated, onDriverRemoved, onLocationUpdate, onMessage]);

  return { connected };
}
