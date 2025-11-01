import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RideCard } from "@/components/RideCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ArrowLeft, Home, History, Wallet, User } from "lucide-react";
import { useLocation } from "wouter";
import type { Ride } from "@shared/schema";
import { FullScreenLayout } from "@/components/layout/FullScreenLayout";

export default function RideHistoryPage() {
  const [, setLocation] = useLocation();

  const { data: rides, isLoading } = useQuery<Ride[]>({
    queryKey: ["/api/rider/rides"],
  });

  return (
    <FullScreenLayout
      header={{
        title: "Ride History",
        leftActions: (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/rider")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ),
      }}
      bottomNav={[
        { label: "Home", href: "/rider", icon: <Home className="h-5 w-5" /> },
        { label: "Rides", href: "/rider/history", icon: <History className="h-5 w-5" /> },
        { label: "Wallet", href: "/rider/wallet", icon: <Wallet className="h-5 w-5" /> },
        { label: "Profile", href: "/rider/profile", icon: <User className="h-5 w-5" /> },
      ]}
    >
      <div className="p-4 max-w-4xl mx-auto space-y-4">
        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : rides && rides.length > 0 ? (
          rides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              onClick={() => setLocation(`/rider/ride/${ride.id}`)}
            />
          ))
        ) : (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">No rides yet</p>
            <Button onClick={() => setLocation("/rider")} data-testid="button-book-first-ride">
              Book Your First Ride
            </Button>
          </div>
        )}
      </div>
    </FullScreenLayout>
  );
}
