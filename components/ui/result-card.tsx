"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";

export interface ResultCardProps {
  label?: string;
  children?: ReactNode;
  /** Render value as large display text. */
  display?: ReactNode;
  /** Right-aligned slot for actions like CopyButton. */
  actions?: ReactNode;
  className?: string;
}

export function ResultCard({
  label,
  children,
  display,
  actions,
  className,
}: ResultCardProps) {
  return (
    <div
      className={cn(
        "qk-card-inset p-4 sm:p-5 flex flex-col gap-2",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {(label || actions) && (
        <div className="flex items-center justify-between gap-3">
          {label && (
            <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">
              {label}
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {display !== undefined && (
        <div className="text-2xl sm:text-3xl font-semibold text-[var(--color-fg)] break-words">
          {display}
        </div>
      )}
      {children}
    </div>
  );
}
