"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "./cn";
import { copyText } from "@core/platform/clipboard";
import { toast } from "./toast";
import { haptic } from "@core/platform/haptics";

export interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  /** When true, render as a small icon-only button. */
  iconOnly?: boolean;
  disabled?: boolean;
}

export function CopyButton({
  value,
  label = "Copy",
  className,
  iconOnly,
  disabled,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled || !value}
      aria-label={label}
      onClick={async () => {
        const ok = await copyText(value);
        if (ok) {
          setCopied(true);
          haptic(8);
          toast.success("Copied", value.length > 60 ? value.slice(0, 60) + "…" : value);
          setTimeout(() => setCopied(false), 1200);
        } else {
          toast.danger("Copy failed", "Clipboard access was blocked by the browser.");
        }
      }}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium",
        "transition-colors duration-150 qk-focus-ring disabled:opacity-50 disabled:pointer-events-none",
        "text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border)]",
        iconOnly ? "h-9 w-9" : "h-9 px-3 text-xs",
        className
      )}
    >
      {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
      {!iconOnly && <span>{copied ? "Copied" : label}</span>}
    </button>
  );
}
