"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, AlertTriangle, Info, X, XCircle } from "lucide-react";
import { useToastStore, type ToastTone } from "./toast";
import { capabilities } from "@core/platform/capabilities";

const TONE: Record<ToastTone, { icon: typeof Info; fg: string }> = {
  default: { icon: Info, fg: "text-[var(--color-fg-muted)]" },
  success: { icon: Check, fg: "text-[var(--color-success)]" },
  warning: { icon: AlertTriangle, fg: "text-[var(--color-warning)]" },
  danger: { icon: XCircle, fg: "text-[var(--color-danger)]" },
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  // Avoid SSR/portal mismatch — render only after mount.
  useEffect(() => {}, []);

  if (!capabilities.isBrowser) return null;
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className="fixed z-[100] bottom-4 right-4 left-4 sm:left-auto flex flex-col gap-2 max-w-[24rem] sm:ml-auto pointer-events-none"
    >
      {toasts.map((t) => {
        const Tone = TONE[t.tone];
        const Icon = Tone.icon;
        return (
          <div
            key={t.id}
            role="status"
            className="qk-card qk-fade-in pointer-events-auto flex items-start gap-3 p-3 shadow-lg"
          >
            <Icon size={18} className={`mt-0.5 shrink-0 ${Tone.fg}`} aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-[var(--color-fg)]">{t.title}</div>
              {t.description && (
                <div className="text-xs text-[var(--color-fg-muted)] mt-0.5 break-words">
                  {t.description}
                </div>
              )}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismiss(t.id)}
              className="qk-focus-ring rounded-md p-1 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]"
            >
              <X size={14} aria-hidden />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
