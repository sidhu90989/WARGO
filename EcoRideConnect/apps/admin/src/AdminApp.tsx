import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FullPageLoader } from "@/components/LoadingSpinner";

// Shared pages
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";

// Admin-local pages
import AdminDashboard from "@app/pages/AdminDashboard";
import UsersDriversPage from "@app/pages/UsersDriversPage";
import PaymentsCommissionPage from "@app/pages/PaymentsCommissionPage";
import OffersNotificationsPage from "@app/pages/OffersNotificationsPage";
import AnalyticsPage from "@app/pages/AnalyticsPage";

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
        {user ? <Redirect to="/admin" /> : <Redirect to="/login" />}
      </Route>
      <Route path="/login">
        {user ? <Redirect to="/admin" /> : <LoginPage />}
      </Route>

      {/* Admin-only routes */}
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute component={UsersDriversPage} allowedRoles={["admin"]} />
      </Route>
      <Route path="/admin/payments">
        <ProtectedRoute component={PaymentsCommissionPage} allowedRoles={["admin"]} />
      </Route>
      <Route path="/admin/offers">
        <ProtectedRoute component={OffersNotificationsPage} allowedRoles={["admin"]} />
      </Route>
      <Route path="/admin/analytics">
        <ProtectedRoute component={AnalyticsPage} allowedRoles={["admin"]} />
      </Route>

      {/* 404 */}
      <Route component={NotFoundPage} />
    </Switch>
  );
}

export default function AdminApp() {
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
