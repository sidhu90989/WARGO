import React, { createContext, useContext, useMemo, useState } from 'react';

type Preferences = { compactMode: boolean; setCompactMode: (v: boolean) => void };
const Ctx = createContext<Preferences | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [compactMode, setCompactMode] = useState(false);
  const value = useMemo(() => ({ compactMode, setCompactMode }), [compactMode]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePreferences() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
