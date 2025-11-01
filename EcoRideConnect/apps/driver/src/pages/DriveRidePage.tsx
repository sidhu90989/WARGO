import { withApiBase } from "@/lib/apiBase";
import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MapPin, Navigation, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { RideMap, type LatLng } from "@/components/maps/RideMap";
import { useRideWebSocket } from "@/hooks/useRideWebSocket";
import { useRealtime } from "@/hooks/useRealtime";

type Ride = {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  vehicleType: "e_rickshaw" | "e_scooter" | "cng_car";
  estimatedFare?: string | number;
  pickupLat?: string | number;
  pickupLng?: string | number;
  dropoffLat?: string | number;
  dropoffLng?: string | number;
};

export default function DriveRidePage() {
  const params = useParams<{ id: string }>();
  const rideId = params?.id || "";
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [driverLoc, setDriverLoc] = useState<LatLng | null>(null);
  const [riderLoc, setRiderLoc] = useState<LatLng | null>(null);
  const [driverPath, setDriverPath] = useState<LatLng[]>([]);

  // Helper to append a point to the driver's path with simple de-duplication
  const maybeAddPathPoint = (pt: LatLng) => {
    setDriverPath((cur) => {
      const last = cur[cur.length - 1];
      if (!last) return [pt];
      const dLat = Math.abs(pt.lat - last.lat);
      const dLng = Math.abs(pt.lng - last.lng);
      // ~5-10 meters threshold to reduce noise
      if (dLat < 0.00005 && dLng < 0.00005) return cur;
      return [...cur, pt];
    });
  };

  const loadRide = async () => {
    const res = await apiRequest("GET", `/api/rides/${rideId}`);
    if (res.ok) setRide(await res.json());
  };

  useEffect(() => {
    (async () => {
      try { await loadRide(); } finally { setLoading(false); }
    })();
    const t = setInterval(loadRide, 5000);
    return () => clearInterval(t);
  }, [rideId]);

  const { sendLocation } = useRideWebSocket({
    rideId,
    who: "driver",
    onMessage: (msg) => {
      if (msg.who === "rider") setRiderLoc({ lat: msg.lat, lng: msg.lng });
      if (msg.who === "driver") {
        const pt = { lat: msg.lat, lng: msg.lng };
        setDriverLoc(pt);
        if (ride?.status === "in_progress") {
          maybeAddPathPoint(pt);
        }
      }
    },
  });

  useEffect(() => {
    let watchId: number | null = null;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const pt = { lat: latitude, lng: longitude };
          setDriverLoc(pt);
          sendLocation(latitude, longitude);
          if (ride?.status === "in_progress") {
            maybeAddPathPoint(pt);
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
      );
    }
    return () => { if (watchId !== null) navigator.geolocation.clearWatch(watchId); };
  }, [sendLocation, ride?.status]);

  const startRide = async () => {
    try {
      setBusy(true);
      await apiRequest("POST", `/api/rides/${rideId}/start`, {});
      await loadRide();
      toast({ title: "Ride started" });
    } catch {
      toast({ title: "Failed to start", variant: "destructive" });
    } finally { setBusy(false); }
  };

  const completeRide = async () => {
    try {
      setBusy(true);
      await apiRequest("POST", `/api/rides/${rideId}/complete`, {});
      await loadRide();
      toast({ title: "Ride completed" });
      setLocation("/driver");
    } catch {
      toast({ title: "Failed to complete", variant: "destructive" });
    } finally { setBusy(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!ride) return <div className="p-6">Ride not found.</div>;

  // Subscribe to ride updates for this ride to reflect status changes in real time
  useRealtime({
    filter: (m) => m.type === "ride_updated" && (m as any).ride?.id === rideId,
    onRideUpdated: ({ ride: r }: any) => {
      setRide((prev) => ({ ...(prev || {} as any), ...r } as any));
      // Reset/seed the path when a ride transitions to in_progress
      if (r.status === "in_progress" && driverLoc) {
        setDriverPath((cur) => (cur.length ? cur : [driverLoc]));
      }
    },
  });
  return (
    <div className="min-h-screen bg-background p-4 max-w-3xl mx-auto space-y-4">
      <Card className="overflow-hidden">
        <RideMap
          apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}
          pickup={ride?.pickupLat && ride?.pickupLng ? { lat: Number(ride.pickupLat), lng: Number(ride.pickupLng) } : undefined}
          dropoff={ride?.dropoffLat && ride?.dropoffLng ? { lat: Number(ride.dropoffLat), lng: Number(ride.dropoffLng) } : undefined}
          rider={riderLoc}
          driver={driverLoc}
          height={260}
          autoFit={ride?.status !== "in_progress"}
          path={driverPath}
          mapTheme="dark"
        />
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <Car className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-semibold">Ride #{ride.id.slice(0, 6)}</div>
            <div className="text-xs text-muted-foreground uppercase">{ride.vehicleType.replace("_"," ")}</div>
          </div>
        </div>
        <Badge>{ride.status.replace("_"," ")}</Badge>
      </Card>

      <Card className="p-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <div>
              <div className="text-xs text-muted-foreground">Pickup</div>
              <div className="font-medium">{ride?.pickupLocation}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            <div>
              <div className="text-xs text-muted-foreground">Dropoff</div>
              <div className="font-medium">{ride?.dropoffLocation}</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button className="flex-1" onClick={startRide} disabled={busy} data-testid="button-start-ride">Start</Button>
        <Button className="flex-1" variant="outline" onClick={completeRide} disabled={busy} data-testid="button-complete-ride">Complete</Button>
      </div>
    </div>
  );
}
