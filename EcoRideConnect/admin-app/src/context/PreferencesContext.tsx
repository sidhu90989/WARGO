import React, { createContext, useContext, useMemo, useState } from 'react';

type Preferences = { showLiveHeatmaps: boolean; setShowLiveHeatmaps: (v: boolean) => void };
const Ctx = createContext<Preferences | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [showLiveHeatmaps, setShowLiveHeatmaps] = useState(true);
  const value = useMemo(() => ({ showLiveHeatmaps, setShowLiveHeatmaps }), [showLiveHeatmaps]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePreferences() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
