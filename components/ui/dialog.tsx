"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "./cn";
import { capabilities } from "@core/platform/capabilities";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Footer slot (e.g. actions). */
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** When true, clicking outside does NOT close. */
  disableOutsideClose?: boolean;
  ariaLabelledById?: string;
}

const SIZE: Record<NonNullable<DialogProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  disableOutsideClose,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Focus trap + restore on close.
  useEffect(() => {
    if (!open || !capabilities.isBrowser) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const dialog = dialogRef.current;
    if (dialog) {
      const focusable = dialog.querySelector<HTMLElement>(
        '[data-autofocus="true"], input, textarea, select, button, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        // basic focus trap
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    // Prevent body scroll while open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open || !capabilities.isBrowser) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm qk-fade-in"
        onClick={() => !disableOutsideClose && onClose()}
        aria-hidden
      />
      <div
        ref={dialogRef}
        className={cn(
          "relative w-full bg-[var(--color-surface)] border border-[var(--color-border)]",
          "rounded-t-2xl sm:rounded-2xl shadow-lg qk-fade-in flex flex-col max-h-[90vh] sm:max-h-[85vh]",
          SIZE[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 p-4 sm:p-5 border-b border-[var(--color-border)]">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[var(--color-fg)]">{title}</h2>
            {description && (
              <p className="text-sm text-[var(--color-fg-muted)] mt-0.5">{description}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-[var(--color-fg-subtle)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)] qk-focus-ring"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>
        {footer && (
          <div className="border-t border-[var(--color-border)] p-4 sm:p-5 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
