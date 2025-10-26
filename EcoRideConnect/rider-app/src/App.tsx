import React from 'react';
import { AuthProvider } from '../../client/src/contexts/AuthContext';
import RiderDashboard from '../../client/src/pages/rider/RiderDashboard';

export default function App() {
  return (
    <AuthProvider>
      <RiderDashboard />
    </AuthProvider>
  );
}
