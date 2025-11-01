import React from "react";
import type { FormCardLayoutProps } from "./Layout.types";
import { Card } from "@/components/ui/card";

export function FormCardLayout({ title, subtitle, children, footer }: FormCardLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        {(title || subtitle) && (
          <div>
            {title && <h1 className="text-xl font-semibold">{title}</h1>}
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        )}
        <div className="space-y-3">{children}</div>
        {footer && <div className="pt-2">{footer}</div>}
      </Card>
    </div>
  );
}

export default FormCardLayout;
