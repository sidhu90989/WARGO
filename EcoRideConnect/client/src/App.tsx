import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { Route, Switch } from "wouter";

function Placeholder() {
  return (
    <div className="p-6 max-w-2xl mx-auto text-sm">
      <h1 className="text-2xl font-semibold mb-2">WARGO</h1>
      <p className="mb-4">
        The unified client has been split into three separate apps. This placeholder exists only for legacy compatibility and development tooling.
      </p>
      <ul className="list-disc pl-6 space-y-1 mb-4">
        <li>Rider app: apps/rider</li>
        <li>Driver app: apps/driver</li>
        <li>Admin app: apps/admin</li>
      </ul>
      <p className="text-muted-foreground">
        Use the per-app dev scripts (rider:dev, driver:dev, admin:dev). The API server runs separately via <code>npm run dev</code>.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Switch>
              <Route path="/login" component={LoginPage} />
              <Route component={Placeholder} />
            </Switch>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
