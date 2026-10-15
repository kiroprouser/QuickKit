"use client";

import { cn } from "./cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Optional short label for compact presentation. */
  short?: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
  size?: "sm" | "md";
  /**
   * When true, the control fills its container width on mobile and buttons
   * stretch evenly. On sm+ (640px+) it reverts to inline content-width
   * (no stretch) so it sits neatly beside labels.
   */
  fullWidth?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  size = "md",
  fullWidth = false,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "items-center rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] p-0.5 gap-0.5",
        fullWidth
          ? "flex w-full sm:inline-flex sm:w-auto"
          : "inline-flex",
        className
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-[calc(var(--radius-md)-2px)] font-medium transition-colors qk-focus-ring whitespace-nowrap",
              fullWidth && "flex-1 text-center sm:flex-none",
              size === "sm" ? "h-7 px-2 text-xs" : "h-9 px-3 text-sm",
              active
                ? "bg-[var(--color-surface)] text-[var(--color-fg)] shadow-sm border border-[var(--color-border)]"
                : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
            )}
          >
            {o.short ?? o.label}
          </button>
        );
      })}
    </div>
  );
}
