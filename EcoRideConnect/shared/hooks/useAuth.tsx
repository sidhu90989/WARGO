import React, { createContext, useContext, useEffect, useState } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { signInWithGoogle as fbSignInWithGoogle, signOut as fbSignOut, auth } from "@shared/lib/firebase";
import type { User } from "@shared/schema";
import { withApiBase } from "@shared/lib/apiBase";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const SIMPLE_AUTH = import.meta.env.VITE_SIMPLE_AUTH === 'true';
    if (SIMPLE_AUTH) {
      (async () => {
        try {
          const response = await fetch(withApiBase("/api/auth/verify"), { credentials: 'include' });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        } finally {
          setLoading(false);
        }
      })();
      return;
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser as any);
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          const response = await fetch(withApiBase("/api/auth/verify"), {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            setUser(null);
          }
        } catch (e) {
          console.error("Error verifying auth:", e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const SIMPLE_AUTH = import.meta.env.VITE_SIMPLE_AUTH === 'true';
    if (SIMPLE_AUTH) return;
    await fbSignInWithGoogle();
  };

  const signOut = async () => {
    const SIMPLE_AUTH = import.meta.env.VITE_SIMPLE_AUTH === 'true';
    if (SIMPLE_AUTH) {
      await fetch(withApiBase('/api/auth/logout'), { method: 'POST', credentials: 'include' });
      setUser(null);
      return;
    }
    await fbSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, signInWithGoogle, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
