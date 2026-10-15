"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string; // accessible label, required
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ label, className, type = "button", ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex items-center justify-center rounded-md h-10 w-10",
          "text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]",
          "transition-colors duration-150 qk-focus-ring disabled:opacity-50",
          "disabled:pointer-events-none",
          className
        )}
        {...rest}
      />
    );
  }
);
