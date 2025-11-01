import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FullPageLoader } from "@/components/LoadingSpinner";

// Pages (moved into @app/pages)
import LoginPage from "@/pages/LoginPage";
import RiderDashboard from "@app/pages/RiderDashboard";
import RideHistoryPage from "@app/pages/RideHistoryPage";
import RewardsPage from "@app/pages/RewardsPage";
import ConfirmRidePage from "@app/pages/ConfirmRidePage";
import RideTrackingPage from "@app/pages/RideTrackingPage";
import PaymentPage from "@app/pages/PaymentPage";
import RatingPage from "@app/pages/RatingPage";
import WalletPage from "@app/pages/WalletPage";
import ProfilePage from "@app/pages/ProfilePage";
import RideTrackPage from "@app/pages/RideTrackPage";
import RideDetailsPage from "@app/pages/RideDetailsPage";
import WalletOffersPage from "@app/pages/WalletOffersPage";
import ProfileSettingsPage from "@app/pages/ProfileSettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";

function ProtectedRoute({
  component: Component,
  allowedRoles,
}: {
  component: React.ComponentType<any>;
  allowedRoles?: string[];
}) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (!user) return <Redirect to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Redirect to={`/${user.role}`} />;
  return <Component />;
}

function Router() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;

  return (
    <Switch>
      <Route path="/">
        {user ? <Redirect to="/rider" /> : <Redirect to="/login" />}
      </Route>
      <Route path="/login">
        {user ? <Redirect to="/rider" /> : <LoginPage />}
      </Route>

      {/* Rider-only routes */}
      <Route path="/rider">
        <ProtectedRoute component={RiderDashboard} allowedRoles={["rider"]} />
      </Route>
      <Route path="/rider/history">
        <ProtectedRoute component={RideHistoryPage} allowedRoles={["rider"]} />
      </Route>
      <Route path="/rider/rewards">
        <ProtectedRoute component={RewardsPage} allowedRoles={["rider"]} />
      </Route>
      <Route path="/rider/confirm">
        <ProtectedRoute component={ConfirmRidePage} allowedRoles={["rider"]} />
      </Route>
      <Route path="/rider/ride/:id/tracking">
        <ProtectedRoute component={RideTrackingPage} allowedRoles={["rider"]} />
      </Route>
      <Route path="/rider/payment">
        <ProtectedRoute component={PaymentPage} allowedRoles={["rider"]} />
      </Route>
      <Route path="/rider/rate">
        <ProtectedRoute component={RatingPage} allowedRoles={["rider"]} />
      </Route>
      <Route path="/rider/wallet">
        <ProtectedRoute component={WalletPage} allowedRoles={["rider"]} />
      </Route>
      <Route path="/rider/profile">
        <ProtectedRoute component={ProfilePage} allowedRoles={["rider"]} />
      </Route>
      <Route path="/rider/ride/:id">
        <ProtectedRoute component={RideTrackPage} allowedRoles={["rider"]} />
      </Route>
      <Route path="/rider/ride-details/:id">
        <ProtectedRoute component={RideDetailsPage} allowedRoles={["rider"]} />
      </Route>
      <Route path="/rider/wallet-offers">
        <ProtectedRoute component={WalletOffersPage} allowedRoles={["rider"]} />
      </Route>
      <Route path="/rider/settings">
        <ProtectedRoute component={ProfileSettingsPage} allowedRoles={["rider"]} />
      </Route>

      {/* 404 */}
      <Route component={NotFoundPage} />
    </Switch>
  );
}

export default function RiderApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
