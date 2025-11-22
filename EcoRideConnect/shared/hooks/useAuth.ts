import { useEffect, useState, useCallback } from 'react';
import { auth } from '@shared/lib/firebase';
import { apiClient } from '@shared/lib/apiBase';
import type { ApplicationVerifier, ConfirmationResult } from 'firebase/auth';
import { signInWithPhoneNumber } from 'firebase/auth';

export interface AuthUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: 'rider' | 'driver' | 'admin';
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiClient.request('/api/auth/verify');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const SIMPLE = (import.meta as any).env?.VITE_SIMPLE_AUTH === 'true';
    if (SIMPLE) {
      // Session-based; just verify on mount
      refresh();
      return;
    }
    // Firebase-based; refresh on auth state changes if available
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = auth.onAuthStateChanged(() => {
      refresh();
    });
    refresh();
    return () => unsub();
  }, [refresh]);

  const simpleLogin = useCallback(async (email: string, name: string, role: 'rider' | 'driver' | 'admin') => {
    await apiClient.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, role }),
    });
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await apiClient.request('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  // Phone auth helpers using Firebase (requires Recaptcha verifier)
  const startPhoneLogin = useCallback(async (phone: string, appVerifier: ApplicationVerifier): Promise<ConfirmationResult> => {
    if (!auth) throw new Error('Firebase auth not initialized');
    return await signInWithPhoneNumber(auth, phone, appVerifier);
  }, []);

  const confirmPhoneLogin = useCallback(async (
    confirmation: ConfirmationResult,
    code: string,
    role?: 'rider' | 'driver' | 'admin',
    doRedirect = true,
  ) => {
    await confirmation.confirm(code);
    await refresh();
    if (doRedirect && role) {
      if (role === 'rider') window.location.href = '/rider/dashboard';
      if (role === 'driver') window.location.href = '/driver/dashboard';
      if (role === 'admin') window.location.href = '/admin/dashboard';
    }
  }, [refresh]);

  return { user, loading, refresh, simpleLogin, logout, startPhoneLogin, confirmPhoneLogin, setUser } as const;
}

export default useAuth;
