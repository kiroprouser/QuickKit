"use client";

import { cn } from "./cn";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
}: SwitchProps) {
  const inputId = id ?? `switch-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={inputId} className="block text-sm font-medium text-[var(--color-fg)] cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-xs text-[var(--color-fg-subtle)] mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        id={inputId}
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors qk-focus-ring",
          "disabled:opacity-50 disabled:pointer-events-none",
          checked
            ? "bg-[var(--color-primary)]"
            : "bg-[var(--color-border-strong)]"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
          aria-hidden
        />
      </button>
    </div>
  );
}
