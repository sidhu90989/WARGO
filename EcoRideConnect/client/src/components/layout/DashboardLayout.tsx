import React, { useState } from "react";
import type { DashboardLayoutProps } from "./Layout.types";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";

export function DashboardLayout({ header, sidebar, children }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false);
  const onNavigate = (href: string) => {
    setOpen(false);
    sidebar?.onNavigate?.(href);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title={header?.title}
        onMenuClick={sidebar ? () => setOpen(true) : header?.onMenuClick}
        rightActions={header?.rightActions}
        leftActions={header?.leftActions}
      />
      <div className="max-w-7xl mx-auto w-full flex">
        {sidebar && (
          <div className={cn("hidden md:block")}>            
            <AppSidebar items={sidebar.items} onNavigate={onNavigate} />
          </div>
        )}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      {/* Mobile drawer */}
      {sidebar && open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-card border-r shadow-xl">
            <AppSidebar items={sidebar.items} onNavigate={onNavigate} />
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardLayout;
