"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";

export interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  label?: string;
  hint?: string;
  /** Slot for an adornment to the right of the input (e.g. unit suffix). */
  suffix?: ReactNode;
  /** Slot for an adornment to the left of the input (e.g. an icon). */
  prefix?: ReactNode;
  invalid?: boolean;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, hint, suffix, prefix, invalid, id, className, ...rest },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-[var(--color-fg-muted)]">
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex items-center rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)]",
          "focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-ring)] focus-within:ring-offset-0",
          invalid && "border-[var(--color-danger)] focus-within:border-[var(--color-danger)] focus-within:ring-[var(--color-danger)]",
          "transition-colors"
        )}
      >
        {prefix && (
          <span className="pl-3 text-[var(--color-fg-subtle)]" aria-hidden>
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "flex-1 min-w-0 bg-transparent px-3 h-11 text-sm text-[var(--color-fg)]",
            "placeholder:text-[var(--color-fg-subtle)] outline-none",
            className
          )}
          aria-invalid={invalid || undefined}
          {...rest}
        />
        {suffix && (
          <span className="pr-3 text-xs text-[var(--color-fg-muted)] select-none" aria-hidden>
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p className={cn("text-xs", invalid ? "text-[var(--color-danger)]" : "text-[var(--color-fg-subtle)]")}>
          {hint}
        </p>
      )}
    </div>
  );
});
