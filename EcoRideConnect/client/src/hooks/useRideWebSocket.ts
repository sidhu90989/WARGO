import { useEffect, useState } from "react";
import socketService from "@shared/realtime/socketIoClient";

export type LocationMessage = {
  type: "location_update";
  rideId: string;
  lat: number;
  lng: number;
  who: "rider" | "driver" | "unknown";
  at: number;
};

type Options = {
  rideId: string;
  who: "rider" | "driver";
  onMessage?: (msg: LocationMessage) => void;
};

export function useRideWebSocket({ rideId, who, onMessage }: Options) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socketService.connect(who);

    const offConnect = socketService.on("connect", () => setConnected(true));
    const offDisconnect = socketService.on("disconnect", () => setConnected(false));
    const offError = socketService.on("error", () => setConnected(false));
    const offDriverLoc = socketService.on("driver_location", (data) => {
      try {
        if (!data) return;
        if (data.rideId !== rideId) return;
        const msg: LocationMessage = {
          type: "location_update",
          rideId: data.rideId,
          lat: Number(data.lat),
          lng: Number(data.lng),
          who: (data.who as any) || "unknown",
          at: Number(data.at) || Date.now(),
        };
        onMessage?.(msg);
      } catch {
        // ignore malformed payloads
      }
    });

    return () => {
      offConnect?.();
      offDisconnect?.();
      offError?.();
      offDriverLoc?.();
    };
  }, [rideId, who, onMessage]);

  const sendLocation = (lat: number, lng: number) => {
    socketService.emitLocation(rideId, lat, lng, who);
  };

  return { connected, sendLocation };
}
