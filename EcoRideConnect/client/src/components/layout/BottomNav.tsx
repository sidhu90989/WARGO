import React from "react";
import type { BottomNavProps } from "./Layout.types";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export function BottomNav({ items }: BottomNavProps) {
  const [loc, setLocation] = useLocation();
  return (
    <nav className={cn("fixed bottom-0 inset-x-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 md:hidden")}>      
      <div className="grid grid-cols-4">
        {items.map((it) => {
          const active = loc === it.href || (loc?.startsWith(it.href) && it.href !== "/");
          return (
            <button
              key={it.href}
              className={cn("flex flex-col items-center justify-center py-2 text-xs", active ? "text-primary" : "text-muted-foreground")}
              onClick={() => setLocation(it.href)}
            >
              <div className="h-5 w-5">{it.icon}</div>
              <div className="mt-1">{it.label}</div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
