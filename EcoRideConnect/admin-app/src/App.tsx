import React from 'react';
import { AuthProvider } from '../../client/src/contexts/AuthContext';
import AdminDashboard from '../../client/src/pages/admin/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <AdminDashboard />
    </AuthProvider>
  );
}
