import React, { createContext, useContext, useMemo, useState } from 'react';

type Preferences = { autoGoOnline: boolean; setAutoGoOnline: (v: boolean) => void };
const Ctx = createContext<Preferences | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [autoGoOnline, setAutoGoOnline] = useState(false);
  const value = useMemo(() => ({ autoGoOnline, setAutoGoOnline }), [autoGoOnline]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePreferences() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
