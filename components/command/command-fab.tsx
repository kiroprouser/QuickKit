"use client";

import { useEffect, useState } from "react";
import { Command } from "lucide-react";
import { cn } from "@components/ui/cn";
import { useSessionStore } from "@core/runtime/session-store";
import { capabilities } from "@core/platform/capabilities";
import { haptic } from "@core/platform/haptics";

/**
 * QuickKit global Quick Command floating action button.
 *
 * - Mounted ONCE in <AppRuntime> (persistent shell), not per route.
 * - Opens the EXISTING global Quick Command state (setCmdOpen(true)).
 * - Position: fixed bottom-RIGHT on ALL screen sizes (desktop + mobile).
 * - Safe-area insets are respected via the button's POSITION offsets (bottom/
 *   right calc with env(safe-area-inset-*)), NOT via internal padding — this
 *   keeps the icon perfectly centered in the circle.
 * - z-[80] — below toasts (z-[100]) and the dialog (z-[95]).
 * - Hidden while the dialog is open (redundant).
 * - The keyboard shortcut (Ctrl/⌘+K) handled in <RuntimeEffects /> continues
 *   to open the same global surface.
 */
export function CommandFab() {
  const setCmdOpen = useSessionStore((s) => s.setCmdOpen);
  const cmdOpen = useSessionStore((s) => s.cmdOpen);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Hide the FAB while the dialog is open (it's redundant).
  if (cmdOpen) return null;

  // Avoid rendering during SSR; show after mount to keep hydration stable.
  if (!mounted) return null;

  if (!capabilities.isBrowser) return null;

  return (
    <button
      type="button"
      aria-label="Open Quick Command (Ctrl+K)"
      title="Quick Command (Ctrl+K)"
      onClick={() => {
        setCmdOpen(true);
        haptic(8);
      }}
      className={cn(
        // Position: fixed bottom-right on ALL screen sizes.
        // Safe-area is handled via the inline style below (bottom/right
        // calc with env(safe-area-inset-*)), so the button's POSITION
        // respects notches/browser UI without shifting the icon.
        "fixed z-[80]",
        // Size + shape — perfect circle, icon centered.
        "inline-flex items-center justify-center",
        "h-12 w-12 rounded-full",
        // Restrained QuickKit styling — burnt-orange primary.
        "bg-[var(--color-primary)] text-[var(--color-primary-fg)]",
        "shadow-lg",
        "border border-[var(--color-accent)]",
        // Hover/focus.
        "hover:bg-[var(--color-accent)] transition-colors qk-focus-ring",
        "qk-fade-in"
      )}
      style={{
        // Position offsets respect safe-area insets on mobile (notches,
        // browser UI). Internal padding is NEVER used for safe-area so the
        // icon stays perfectly centered in the circle.
        bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
        right: "calc(1rem + env(safe-area-inset-right, 0px))",
      }}
    >
      <Command size={20} aria-hidden />
      <span className="sr-only">Open Quick Command</span>
    </button>
  );
}
