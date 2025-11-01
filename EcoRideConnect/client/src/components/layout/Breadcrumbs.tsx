import React from "react";
import type { BreadcrumbsProps } from "./Layout.types";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const [, setLocation] = useLocation();
  return (
    <div className={cn("text-sm text-muted-foreground flex items-center gap-2", className)}>
      {items.map((b, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="opacity-50">/</span>}
          {b.href ? (
            <button className="hover:underline" onClick={() => setLocation(b.href!)}>{b.label}</button>
          ) : (
            <span className="text-foreground">{b.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default Breadcrumbs;
