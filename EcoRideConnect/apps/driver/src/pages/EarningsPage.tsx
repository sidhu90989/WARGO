import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLocation } from "wouter";
import { TrendingUp, DollarSign, FileText, Star } from "lucide-react";

export default function EarningsPage() {
  const [, setLocation] = useLocation();
  return (
    <DashboardLayout
      header={{ title: "Earnings" }}
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
      <div className="p-4 max-w-3xl mx-auto space-y-4">
        <Card className="p-4">
          <div className="text-lg font-semibold">Earnings</div>
          <Separator className="my-3" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Today</div>
              <div className="text-xl font-bold">₹ 0</div>
            </div>
            <div>
              <div className="text-muted-foreground">This Week</div>
              <div className="text-xl font-bold">₹ 0</div>
            </div>
            <div>
              <div className="text-muted-foreground">Trips</div>
              <div className="text-xl font-bold">0</div>
            </div>
            <div>
              <div className="text-muted-foreground">Eco Bonus</div>
              <div className="text-xl font-bold">₹ 0</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-lg font-semibold">Insights</div>
          <div className="text-sm text-muted-foreground">Charts coming soon</div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
