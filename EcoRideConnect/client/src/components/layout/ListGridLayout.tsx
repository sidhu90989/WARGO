import React from "react";
import type { ListGridLayoutProps } from "./Layout.types";
import { cn } from "@/lib/utils";

const gridCols = (n: number) => {
  switch (n) {
    case 1: return "grid-cols-1";
    case 2: return "grid-cols-2";
    case 3: return "grid-cols-3";
    case 4: return "grid-cols-4";
    case 5: return "grid-cols-5";
    case 6: return "grid-cols-6";
    default: return "grid-cols-1";
  }
};

export function ListGridLayout({ children, cols, gap }: ListGridLayoutProps) {
  const base = gridCols(cols?.base ?? 1);
  const md = gridCols(cols?.md ?? 2).replace("grid-", "md:grid-");
  const lg = gridCols(cols?.lg ?? 3).replace("grid-", "lg:grid-");
  return (
    <div className={cn("grid", base, md, lg, gap || "gap-4")}>{children}</div>
  );
}

export default ListGridLayout;
