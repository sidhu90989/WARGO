import React from "react";
import type { SidebarProps } from "./Layout.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AppSidebar({ items, footer, onNavigate, className }: SidebarProps) {
  return (
    <aside className={cn("h-full w-64 shrink-0 border-r bg-card", className)}>
      <nav className="p-3 space-y-1">
        {items.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => onNavigate?.(item.href)}
          >
            {item.icon}
            <span>{item.label}</span>
            {!!item.badge && (
              <span className="ml-auto text-xs rounded-full bg-muted px-2 py-0.5">{item.badge}</span>
            )}
          </Button>
        ))}
      </nav>
      {footer && <div className="mt-auto p-3">{footer}</div>}
    </aside>
  );
}

export default AppSidebar;
