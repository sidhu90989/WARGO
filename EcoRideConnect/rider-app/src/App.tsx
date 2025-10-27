import React from 'react';
import { Route, Switch, Router } from 'wouter';
import { AuthProvider } from '@shared/hooks/useAuth';
import { PreferencesProvider } from './context/PreferencesContext';
// Pages (temporarily sourced from original client until migration completes)
import RiderDashboard from './pages/RiderDashboard';
import RideHistoryPage from './pages/RideHistoryPage';
import RideTrackPage from './pages/RideTrackPage';
import PaymentPage from './pages/PaymentPage';
import WalletPage from './pages/WalletPage';

export default function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <Router>
          <Switch>
            <Route path="/" component={RiderDashboard} />
            <Route path="/rides" component={RideHistoryPage} />
            <Route path="/ride/:id" component={RideTrackPage as any} />
            <Route path="/payment" component={PaymentPage} />
            <Route path="/wallet" component={WalletPage} />
            <Route path="/auth" component={require('./pages/AuthPage').default} />
            <Route>404 - Not Found</Route>
          </Switch>
        </Router>
      </PreferencesProvider>
    </AuthProvider>
  );
}
