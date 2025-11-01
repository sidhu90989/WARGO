import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RideMap, type LatLng } from "@/components/maps/RideMap";
import {
  Users,
  Car,
  DollarSign,
  Leaf,
  TrendingUp,
  TrendingDown,
  MapPin,
  LogOut,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Navigation,
  Shield,
  Settings,
  Bell,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Calendar,
  Globe,
  Award,
  Target,
  Zap,
  Menu,
  Gift
} from "lucide-react";

// Import hooks and contexts
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { AdminStats, Ride } from "@/types/api";
import { useRealtime } from "@/hooks/useRealtime";

// Extended interfaces for comprehensive admin stats
interface ExtendedAdminStats extends AdminStats {
  cityWiseStats: Array<{
    city: string;
    totalRides: number;
    revenue: number;
    co2Saved: number;
  }>;
  hourlyStats: Array<{
    hour: number;
    rides: number;
    revenue: number;
  }>;
  vehicleTypeStats: Array<{
    type: string;
    count: number;
    revenue: number;
    efficiency: number;
  }>;
}

type ActiveRideWithLocation = Ride & {
  currentLocation: LatLng;
  dropoff: LatLng;
  driverLocation: LatLng;
};

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("today");
  const [mapCenter] = useState<LatLng>({ lat: 28.6139, lng: 77.2090 }); // Delhi coordinates
  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  // Mock comprehensive admin stats
  const adminStats: ExtendedAdminStats = {
    totalUsers: 12845,
    activeDrivers: 3421,
    totalRevenue: 890543,
    totalCO2Saved: 2340,
    totalRides: 15234,
    todayRides: 456,
    weekRides: 3456,
    monthRides: 12345,
    vehicleStats: { e_rickshaw: 145, e_scooter: 89, cng_car: 234 },
    cityWiseStats: [
      { city: "Delhi", totalRides: 5432, revenue: 234567, co2Saved: 876 },
      { city: "Mumbai", totalRides: 4321, revenue: 198765, co2Saved: 654 },
      { city: "Bangalore", totalRides: 3210, revenue: 167543, co2Saved: 543 },
      { city: "Chennai", totalRides: 2109, revenue: 145321, co2Saved: 432 },
      { city: "Hyderabad", totalRides: 1876, revenue: 134567, co2Saved: 387 }
    ],
    hourlyStats: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      rides: Math.floor(Math.random() * 50) + 10,
      revenue: Math.floor(Math.random() * 5000) + 1000
    })),
    vehicleTypeStats: [
      { type: "E-Rickshaw", count: 145, revenue: 45670, efficiency: 89 },
      { type: "E-Scooter", count: 89, revenue: 23450, efficiency: 92 },
      { type: "CNG Car", count: 234, revenue: 78900, efficiency: 75 }
    ]
  };

  // Active rides from API + realtime updates
  const { data: initialActive } = useQuery<any[]>({
    queryKey: ["/api/admin/active-rides"],
    enabled: !!user && user.role === "admin",
  });
  const [activeRides, setActiveRides] = useState<any[]>([]);
  useEffect(() => { if (initialActive) setActiveRides(initialActive); }, [initialActive]);

  // Handle realtime ride updates for admin
  useRealtime({
    filter: (m) => m.type.startsWith("ride_"),
    onRideAdded: ({ ride }: any) => {
      if (ride?.status === "accepted" || ride?.status === "in_progress") {
        setActiveRides((cur) => (cur.some((r) => r.id === ride.id) ? cur : [ride, ...cur]));
      }
    },
    onRideUpdated: ({ ride }: any) => {
      setActiveRides((cur) => {
        const isActive = ride?.status === "accepted" || ride?.status === "in_progress";
        const exists = cur.some((r) => r.id === ride.id);
        if (isActive && exists) return cur.map((r) => (r.id === ride.id ? { ...r, ...ride } : r));
        if (isActive && !exists) return [ride, ...cur];
        return cur.filter((r) => r.id !== ride.id);
      });
    },
    onRideRemoved: ({ rideId }) => {
      setActiveRides((cur) => cur.filter((r) => r.id !== rideId));
    },
    onLocationUpdate: ({ rideId, lat, lng }) => {
      setActiveRides((cur) => cur.map((r: any) => (r.id === rideId ? { ...r, currentLocation: { lat, lng } } : r)));
    },
  });

  // Daily revenue data for chart
  const dailyRevenue = [
    { day: "Mon", amount: 12345 },
    { day: "Tue", amount: 15678 },
    { day: "Wed", amount: 13456 },
    { day: "Thu", amount: 17890 },
    { day: "Fri", amount: 19234 },
    { day: "Sat", amount: 21567 },
    { day: "Sun", amount: 18432 }
  ];

  const handleSignOut = async () => {
    await signOut();
    setLocation("/");
  };

  const handleRefresh = () => {
    // Simulate data refresh
    toast({
      title: "Data refreshed",
      description: "Dashboard data has been updated"
    });
  };

  return (
    <DashboardLayout
      header={{
        title: "Admin Dashboard",
        rightActions: (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <ThemeToggle />
            <Button size="sm" variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </div>
        ),
      }}
      sidebar={{
        items: [
          { label: "Overview", href: "/admin", icon: <Activity className="h-5 w-5" /> },
          { label: "Users & Drivers", href: "/admin/users", icon: <Users className="h-5 w-5" /> },
          { label: "Payments", href: "/admin/payments", icon: <DollarSign className="h-5 w-5" /> },
          { label: "Offers", href: "/admin/offers", icon: <Gift className="h-5 w-5" /> },
          { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 className="h-5 w-5" /> },
        ],
        onNavigate: (href) => setLocation(href),
      }}
    >
      <div className="space-y-6">

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{adminStats.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Drivers</p>
                <p className="text-3xl font-bold">{adminStats.activeDrivers.toLocaleString()}</p>
              </div>
              <Car className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+8.2%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Rides</p>
                <p className="text-3xl font-bold">{activeRides.length}</p>
              </div>
              <Navigation className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Activity className="h-4 w-4 text-orange-600 mr-1" />
              <span className="text-orange-600">Live tracking</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">₹{adminStats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+15.3%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold">Weekly Revenue</h3>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              {dailyRevenue.map((day, index) => {
                const maxRevenue = Math.max(...dailyRevenue.map(d => d.amount));
                return (
                  <div key={day.day} className="flex items-center gap-4">
                    <span className="w-12 text-sm font-medium">{day.day}</span>
                    <div className="flex-1 relative">
                      <div className="h-8 bg-muted rounded">
                        <div 
                          className="h-full bg-primary rounded transition-all duration-500"
                          style={{ width: `${(day.amount / maxRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-20 text-sm font-medium text-right">₹{day.amount.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Environmental Impact */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Leaf className="h-6 w-6 text-green-600" />
              <h3 className="font-serif text-lg font-semibold">Environmental Impact</h3>
            </div>
            <div className="space-y-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{adminStats.totalCO2Saved} kg</div>
                <p className="text-sm text-green-700 dark:text-green-300">CO₂ Saved This Month</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">1,234</div>
                  <p className="text-xs text-muted-foreground">Trees Equivalent</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">89%</div>
                  <p className="text-xs text-muted-foreground">Efficiency</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">567L</div>
                  <p className="text-xs text-muted-foreground">Fuel Saved</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* City-wise Performance */}
        <Card className="p-6">
          <h3 className="font-serif text-lg font-semibold mb-4">City-wise Performance</h3>
          <div className="space-y-4">
            {adminStats.cityWiseStats.map((city, index) => (
              <div key={city.city} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{city.city}</div>
                    <div className="text-sm text-muted-foreground">{city.totalRides} rides</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{city.revenue.toLocaleString()}</div>
                  <div className="text-sm text-green-600">{city.co2Saved}kg CO₂ saved</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Live Ride Tracking */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-semibold">Live Ride Tracking</h3>
            <Badge variant="secondary" className="text-green-600 bg-green-100">
              <Activity className="h-3 w-3 mr-1" />
              {activeRides.length} Active
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map Component */}
            <div className="h-96 rounded-lg overflow-hidden">
              {mapsKey && activeRides.length > 0 ? (
                <RideMap
                  apiKey={mapsKey}
                  autoFit
                  height={384}
                  pickup={{ lat: Number(activeRides[0]?.pickupLat) || activeRides[0]?.currentLocation?.lat || mapCenter.lat, lng: Number(activeRides[0]?.pickupLng) || activeRides[0]?.currentLocation?.lng || mapCenter.lng }}
                  dropoff={{ lat: Number(activeRides[0]?.dropoffLat) || mapCenter.lat, lng: Number(activeRides[0]?.dropoffLng) || mapCenter.lng }}
                  rider={activeRides[0]?.currentLocation}
                  mapTheme="dark"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  {mapsKey ? "No active rides yet" : "Set VITE_GOOGLE_MAPS_API_KEY to render the map"}
                </div>
              )}
            </div>
            {/* Active Rides List */}
            <div className="space-y-3">
              {activeRides.map((ride) => (
                <Card key={ride.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{ride.pickupLocation} → {ride.dropoffLocation}</div>
                      <div className="text-xs text-muted-foreground">{ride.vehicleType}</div>
                    </div>
                    <Badge variant="secondary">{ride.status}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
