import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { HeaderProps } from "./Layout.types";
import { Menu } from "lucide-react";

export function AppHeader({ title, onMenuClick, rightActions, leftActions }: HeaderProps) {
  return (
    <header className={cn("sticky top-0 z-50 bg-card border-b")}>      
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <Button size="icon" variant="ghost" onClick={onMenuClick} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          {leftActions}
          <div className="flex items-center gap-2">
            <div className="font-serif text-xl font-bold">EcoRide</div>
            {title && <div className="text-sm text-muted-foreground">{title}</div>}
          </div>
        </div>
        <div className="flex items-center gap-2">{rightActions}</div>
      </div>
    </header>
  );
}

export default AppHeader;
