import React from "react";

type ModalShellProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function ModalShell({ title, subtitle, children, footer }: ModalShellProps) {
  return (
    <div className="w-full max-w-lg bg-card border rounded-lg shadow-lg">
      {(title || subtitle) && (
        <div className="px-4 py-3 border-b">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <div className="p-4 space-y-3">{children}</div>
      {footer && <div className="px-4 py-3 border-t">{footer}</div>}
    </div>
  );
}

export default ModalShell;
