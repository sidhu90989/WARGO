import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RideMap, type LatLng } from "@/components/maps/RideMap";
import { BottomSheet, type BottomSheetState } from "@/components/BottomSheet";
import { locationService } from "@/services/locationService";
import { History, Wallet, Menu, Home, User } from "lucide-react";
import { FullScreenLayout } from "@/components/layout/FullScreenLayout";

export default function RiderDashboard() {
  const { signOut } = useAuth();
  const [, setLocation] = useLocation();

  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const [center, setCenter] = useState<LatLng>({ lat: 28.6139, lng: 77.2090 });
  const [pickup, setPickup] = useState<LatLng | undefined>();
  const [drop, setDrop] = useState<LatLng | undefined>();
  const [sheetState, setSheetState] = useState<BottomSheetState>("collapsed");
  const [fromVal, setFromVal] = useState("");
  const [toVal, setToVal] = useState("");
  const [recent, setRecent] = useState<Array<{ label: string; sub?: string }>>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setRecent(locationService.getRecent());
    const stop = locationService.watchCurrentLocation((p) => setCenter({ lat: p.lat, lng: p.lng }));
    return () => stop();
  }, []);

  const confirmRide = () => {
    // Placeholder booking flow
    setLocation("/rider/confirm");
  };

  return (
    <FullScreenLayout
      header={{
        rightActions: (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setLocation("/rider/history")}>
              <History className="h-4 w-4 mr-1"/> History
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setLocation("/rider/wallet")}>
              <Wallet className="h-4 w-4 mr-1"/> Wallet
            </Button>
            <ThemeToggle />
          </div>
        ),
      }}
      bottomNav={[
        { label: "Home", href: "/rider", icon: <Home className="h-5 w-5" /> },
        { label: "Rides", href: "/rider/history", icon: <History className="h-5 w-5" /> },
        { label: "Wallet", href: "/rider/wallet", icon: <Wallet className="h-5 w-5" /> },
        { label: "Profile", href: "/rider/profile", icon: <User className="h-5 w-5" /> },
      ]}
    >
      <div className="absolute inset-0">
        {mapsKey && (
          <RideMap
            apiKey={mapsKey}
            pickup={pickup}
            dropoff={drop}
            rider={center}
            autoFit={false}
            height={window.innerHeight}
            showUserDot
            mapTheme="dark"
            onMapDrag={(c) => setPickup(c)}
          />
        )}
      </div>
      <BottomSheet
        state={sheetState}
        setState={setSheetState}
        currentAddress={"Your location"}
        fromValue={fromVal}
        toValue={toVal}
        onFromChange={setFromVal}
        onToChange={setToVal}
        recent={recent}
        onConfirmRide={confirmRide}
      />
    </FullScreenLayout>
  );
}
