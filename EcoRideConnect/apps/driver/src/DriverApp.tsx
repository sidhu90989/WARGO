import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FullPageLoader } from "@/components/LoadingSpinner";

// Pages
import LoginPage from "@/pages/LoginPage";
import DriverDashboard from "@app/pages/DriverDashboard";
import RideManagementPage from "@app/pages/RideManagementPage";
import DriveRidePage from "@app/pages/DriveRidePage";
import EarningsInsightsPage from "@app/pages/EarningsInsightsPage";
import EarningsPage from "@app/pages/EarningsPage";
import ProfileVerificationPage from "@app/pages/ProfileVerificationPage";
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
        {user ? <Redirect to="/driver" /> : <Redirect to="/login" />}
      </Route>
      <Route path="/login">
        {user ? <Redirect to="/driver" /> : <LoginPage />}
      </Route>

      {/* Driver-only routes */}
      <Route path="/driver">
        <ProtectedRoute component={DriverDashboard} allowedRoles={["driver"]} />
      </Route>
      <Route path="/driver/ride-management">
        <ProtectedRoute component={RideManagementPage} allowedRoles={["driver"]} />
      </Route>
      <Route path="/driver/ride/:id">
        <ProtectedRoute component={DriveRidePage} allowedRoles={["driver"]} />
      </Route>
      <Route path="/driver/earnings">
        <ProtectedRoute component={EarningsInsightsPage} allowedRoles={["driver"]} />
      </Route>
      <Route path="/driver/earnings-old">
        <ProtectedRoute component={EarningsPage} allowedRoles={["driver"]} />
      </Route>
      <Route path="/driver/profile">
        <ProtectedRoute component={ProfileVerificationPage} allowedRoles={["driver"]} />
      </Route>

      {/* 404 */}
      <Route component={NotFoundPage} />
    </Switch>
  );
}

export default function DriverApp() {
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
