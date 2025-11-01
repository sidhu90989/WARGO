import { Card } from "@/components/ui/card";
import { useParams } from "wouter";
import { FullScreenLayout } from "@/components/layout/FullScreenLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, History, Wallet, User as UserIcon } from "lucide-react";
import { useLocation } from "wouter";

export default function RideDetailsPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  return (
    <FullScreenLayout
      header={{
        title: "Ride Details",
        leftActions: (
          <Button size="icon" variant="ghost" onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/rider/history") }>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ),
      }}
      bottomNav={[
        { label: "Home", href: "/rider", icon: <Home className="h-5 w-5" /> },
        { label: "Rides", href: "/rider/history", icon: <History className="h-5 w-5" /> },
        { label: "Wallet", href: "/rider/wallet", icon: <Wallet className="h-5 w-5" /> },
        { label: "Profile", href: "/rider/profile", icon: <UserIcon className="h-5 w-5" /> },
      ]}
    >
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        <Card className="p-4">
          <div className="text-lg font-semibold">Ride Receipt</div>
          <div className="text-sm text-muted-foreground">Ride ID: {params?.id}</div>
          <div className="mt-4 space-y-1 text-sm">
            <div>Date: Today</div>
            <div>Amount: ₹120</div>
            <div>CO₂ Saved: 1.2 kg</div>
            <div>Vehicle: E-Rickshaw</div>
          </div>
        </Card>
      </div>
    </FullScreenLayout>
  );
}
