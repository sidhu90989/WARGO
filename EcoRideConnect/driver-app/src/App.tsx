import React from 'react';
import { Route, Switch, Router } from 'wouter';
import { AuthProvider } from '@shared/hooks/useAuth';
import { PreferencesProvider } from './context/PreferencesContext';
import DriverDashboard from './pages/DriverDashboard';

export default function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <Router>
          <Switch>
            <Route path="/" component={DriverDashboard} />
            {/* Temporarily route feature pages to dashboard until dedicated pages are migrated */}
            <Route path="/active" component={DriverDashboard} />
            <Route path="/earnings" component={DriverDashboard} />
            <Route path="/availability" component={DriverDashboard} />
            <Route path="/profile" component={DriverDashboard} />
            <Route path="/auth" component={require('./pages/AuthPage').default} />
            <Route>404 - Not Found</Route>
          </Switch>
        </Router>
      </PreferencesProvider>
    </AuthProvider>
  );
}
