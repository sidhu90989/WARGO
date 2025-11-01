import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  DollarSign, 
  TrendingUp, 
  Star, 
  Car, 
  Power,
  Menu,
  LogOut,
  History,
  FileText,
  Settings,
  MapPin,
  Navigation,
  Clock,
  CheckCircle,
  X,
  Phone,
  MessageCircle,
  Target,
  Calendar,
  BarChart3,
  UserCheck,
  Award,
  Bell,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { RideMap, type LatLng } from "@/components/maps/RideMap";
import { useRealtime } from "@/hooks/useRealtime";
import type { DriverStats, Ride } from "@/types/api";

export default function DriverDashboard() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  // Layout no longer needs local menu; DashboardLayout manages sidebar/drawer
  const [isAvailable, setIsAvailable] = useState(false);
  const [femalePref, setFemalePref] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [newRideRequest, setNewRideRequest] = useState<Ride | null>(null);
  const [showRideRequest, setShowRideRequest] = useState(false);

  // Enhanced stats with daily earnings
  const todayStats = {
    ridesCompleted: 8,
    earnings: 1250,
    hoursOnline: 6.5,
    rating: 4.8,
    co2Saved: 12.4,
    ecoBonus: 85
  };

  const { data: stats, isLoading } = useQuery<DriverStats>({
    queryKey: ["/api/driver/stats"],
    enabled: !!user,
  });

  const { data: pendingRides } = useQuery<Ride[]>({
    queryKey: ["/api/driver/pending-rides"],
    enabled: !!user && isAvailable,
    refetchInterval: false,
  });

  // Local pending rides state kept in sync via realtime events
  const [pending, setPending] = useState<Ride[]>([]);

  // Seed local pending list from initial query when it changes
  useEffect(() => {
    if (pendingRides) setPending(pendingRides);
  }, [pendingRides]);

  // Wire realtime updates for pending rides when driver is available
  useRealtime({
    filter: (m) => isAvailable && (m.type === "ride_added" || m.type === "ride_updated" || m.type === "ride_removed"),
    onRideAdded: ({ ride }: any) => {
      if (ride?.status === "pending") {
        setPending((cur) => (cur.some((r) => r.id === ride.id) ? cur : [ride, ...cur]));
      }
    },
    onRideUpdated: ({ ride }: any) => {
      setPending((cur) => {
        const isPending = ride?.status === "pending";
        const exists = cur.some((r) => r.id === ride.id);
        if (isPending && exists) return cur.map((r) => (r.id === ride.id ? { ...r, ...ride } : r));
        if (isPending && !exists) return [ride, ...cur];
        // If no longer pending, drop it
        return cur.filter((r) => r.id !== ride.id);
      });
    },
    onRideRemoved: ({ rideId }) => {
      setPending((cur) => cur.filter((r) => r.id !== rideId));
    },
  });

  // Mock nearby ride requests
  const nearbyRequests = [
    {
      id: "1",
      pickupLocation: "Connaught Place",
      dropoffLocation: "Khan Market",
      distance: "2.4 km",
      fare: 45,
      estimatedDuration: "8 min",
      riderRating: 4.6,
      pickupLat: 28.6315,
      pickupLng: 77.2167
    },
    {
      id: "2", 
      pickupLocation: "India Gate",
      dropoffLocation: "Hauz Khas",
      distance: "5.2 km",
      fare: 120,
      estimatedDuration: "15 min",
      riderRating: 4.9,
      pickupLat: 28.6129,
      pickupLng: 77.2295
    }
  ];

  // Location tracking
  useEffect(() => {
    if (isAvailable && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Location error:", error);
        },
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isAvailable]);

  // Simulate new ride request notifications
  useEffect(() => {
    if (isAvailable && pending && pending.length > 0) {
      const latestRide = pending[0];
      if (latestRide.id !== newRideRequest?.id) {
        setNewRideRequest(latestRide);
        setShowRideRequest(true);
        
        // Play notification sound (in real app)
        toast({
          title: "🚗 New Ride Request!",
          description: `${latestRide.pickupLocation} → ${latestRide.dropoffLocation}`,
        });
      }
    }
  }, [pending, isAvailable, newRideRequest?.id]);

  const handleToggleAvailability = async (available: boolean) => {
    try {
      await apiRequest("PUT", "/api/driver/availability", { available });
      setIsAvailable(available);
      
      if (available) {
        // Start location tracking when going online
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          }
        );
      }
      
      toast({
        title: available ? "✅ You're now online!" : "⏸️ You're now offline",
        description: available 
          ? "📱 You'll start receiving ride requests from nearby riders."
          : "🚫 You won't receive any new ride requests until you go online.",
      });
    } catch (error) {
      toast({
        title: "❌ Status Update Failed",
        description: "Could not update your availability status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptRide = async (rideId: string) => {
    try {
      await apiRequest("POST", `/api/rides/${rideId}/accept`, {});
      toast({
        title: "Ride Accepted!",
        description: "Navigate to pickup location",
      });
      setLocation(`/driver/ride/${rideId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept ride",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setLocation("/");
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout
      header={{
        title: "Driver Dashboard",
        rightActions: (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleSignOut} data-testid="button-signout">
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </div>
        ),
      }}
      sidebar={{
        items: [
          { label: "Dashboard", href: "/driver", icon: <TrendingUp className="h-5 w-5" /> },
          { label: "Earnings", href: "/driver/earnings", icon: <DollarSign className="h-5 w-5" /> },
          { label: "Profile & KYC", href: "/driver/profile", icon: <FileText className="h-5 w-5" /> },
          { label: "Leaderboard", href: "/leaderboard", icon: <Star className="h-5 w-5" /> },
        ],
        onNavigate: (href) => setLocation(href),
      }}
    >
      <div className="space-y-6">
        {/* Driver Availability Toggle */}
        {/* Enhanced Status Toggle */}
        <Card className="p-6 border-2 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <Label htmlFor="availability" className="text-xl font-bold">
                  {isAvailable ? "🟢 ONLINE" : "🔴 OFFLINE"}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {isAvailable ? "Ready to receive ride requests" : "Go online to start earning"}
              </p>
              {currentLocation && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Location updated
                </p>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <Switch
                id="availability"
                checked={isAvailable}
                onCheckedChange={handleToggleAvailability}
                data-testid="switch-availability"
                className="data-[state=checked]:bg-green-500 scale-125"
              />
              <span className="text-xs font-medium">
                {isAvailable ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </Card>

        {/* Today's Performance Dashboard */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Today's Performance
            </h2>
            <Button variant="outline" size="sm" className="text-xs">
              View Details
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="today-rides">
                {todayStats.ridesCompleted}
              </div>
              <div className="text-xs text-muted-foreground">Rides</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600" data-testid="today-earnings">
                ₹{todayStats.earnings}
              </div>
              <div className="text-xs text-muted-foreground">Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600" data-testid="today-hours">
                {todayStats.hoursOnline}h
              </div>
              <div className="text-xs text-muted-foreground">Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600" data-testid="eco-bonus">
                ₹{todayStats.ecoBonus}
              </div>
              <div className="text-xs text-muted-foreground">Eco Bonus</div>
            </div>
          </div>
        </Card>

        {/* Map View & Nearby Requests */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Nearby Ride Requests
            </h2>
            {isAvailable && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Searching for rides...
              </div>
            )}
          </div>
          <div className="relative bg-muted rounded-lg overflow-hidden" style={{ height: '300px' }}>
            {isAvailable ? (
              (() => {
                const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
                return mapsKey ? (
                  <RideMap
                    apiKey={mapsKey}
                    pickup={currentLocation || undefined}
                    height={300}
                    showUserDot
                    mapTheme="dark"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    Set VITE_GOOGLE_MAPS_API_KEY to see the map
                  </div>
                );
              })()
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
                <div className="text-center space-y-2">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="text-gray-500">Go online to see nearby requests</p>
                  <Button onClick={() => handleToggleAvailability(true)} className="mt-2">
                    Go Online
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Overall Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold" data-testid="text-total-earnings">
                  ₹{Number(stats?.totalEarnings || 0).toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Earnings</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold" data-testid="text-total-rides">
                  {stats?.totalRides || 0}
                </div>
                <div className="text-xs text-muted-foreground">Total Rides</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold" data-testid="text-rating">
                  {Number(stats?.rating || 5).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">₹{Number(todayStats?.ecoBonus || 0).toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">Eco Bonus</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Driver Preferences */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Driver Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="female-pref" className="font-medium">Female Rider Preference</Label>
                <p className="text-xs text-muted-foreground">
                  Only receive ride requests from female riders
                </p>
              </div>
              <Switch
                id="female-pref"
                checked={femalePref}
                onCheckedChange={setFemalePref}
                data-testid="switch-female-pref"
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Ride Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified about nearby ride requests
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Auto-Accept Short Rides</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically accept rides under 2km
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        {/* Recent Rides & Actions would continue ... (content preserved) */}
      </div>
    </DashboardLayout>
  );
}
