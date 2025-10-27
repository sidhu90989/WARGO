import React from 'react';
import { Route, Switch, Router } from 'wouter';
import { AuthProvider } from '@shared/hooks/useAuth';
import { PreferencesProvider } from './context/PreferencesContext';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <Router>
          <Switch>
            <Route path="/" component={AdminDashboard} />
            {/* Temporarily route feature pages to dashboard until dedicated pages are migrated */}
            <Route path="/users" component={AdminDashboard} />
            <Route path="/rides" component={AdminDashboard} />
            <Route path="/analytics" component={AdminDashboard} />
            <Route path="/payments" component={AdminDashboard} />
            <Route path="/offers" component={AdminDashboard} />
            <Route path="/auth" component={require('./pages/AuthPage').default} />
            <Route>404 - Not Found</Route>
          </Switch>
        </Router>
      </PreferencesProvider>
    </AuthProvider>
  );
}
