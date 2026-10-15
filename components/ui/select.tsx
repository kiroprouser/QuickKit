"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  options: readonly SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, id, className, ...rest },
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
          "relative flex items-center rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)]",
          "focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-ring)]",
          "transition-colors"
        )}
      >
        <select
          ref={ref}
          id={id}
          className={cn(
            "appearance-none bg-transparent px-3 h-11 pr-9 text-sm text-[var(--color-fg)] w-full outline-none cursor-pointer",
            className
          )}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden
          className="absolute right-3 pointer-events-none text-[var(--color-fg-subtle)]"
        />
      </div>
    </div>
  );
});
