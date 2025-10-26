import React from 'react';
import { AuthProvider } from '../../client/src/contexts/AuthContext';
import DriverDashboard from '../../client/src/pages/driver/DriverDashboard';

export default function App() {
  return (
    <AuthProvider>
      <DriverDashboard />
    </AuthProvider>
  );
}
