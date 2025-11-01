import React from "react";
import type { FullScreenLayoutProps } from "./Layout.types";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";

export function FullScreenLayout({ header, bottomNav, children }: FullScreenLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader title={header?.title} onMenuClick={header?.onMenuClick} rightActions={header?.rightActions} leftActions={header?.leftActions} />
      <div className="relative flex-1">{children}</div>
      {bottomNav && bottomNav.length > 0 && <BottomNav items={bottomNav} />}
    </div>
  );
}

export default FullScreenLayout;
