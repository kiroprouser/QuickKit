/**
 * QuickKit platform capabilities.
 * Centralized browser API access so individual components do not probe
 * browser APIs everywhere. Safe fallbacks for unsupported environments.
 */

import type { ThemePreference } from "@core/runtime/persistent-store";

export const capabilities = {
  get isBrowser() {
    return typeof window !== "undefined" && typeof document !== "undefined";
  },
  get hasClipboard() {
    return (
      this.isBrowser &&
      typeof navigator !== "undefined" &&
      !!navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    );
  },
  get hasClipboardItem() {
    return (
      this.isBrowser &&
      typeof window !== "undefined" &&
      typeof (window as any).ClipboardItem !== "undefined"
    );
  },
  get hasShare() {
    return (
      this.isBrowser &&
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    );
  },
  get hasVibration() {
    return (
      this.isBrowser &&
      typeof navigator !== "undefined" &&
      typeof navigator.vibrate === "function"
    );
  },
  get hasCrypto() {
    return (
      this.isBrowser &&
      typeof window !== "undefined" &&
      !!window.crypto &&
      typeof window.crypto.getRandomValues === "function"
    );
  },
  get prefersReducedMotion() {
    if (!this.isBrowser) return false;
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  },
  get hasServiceWorker() {
    return (
      this.isBrowser &&
      typeof navigator !== "undefined" &&
      "serviceWorker" in navigator
    );
  },
  get hasInstallPrompt() {
    return this.isBrowser && typeof (window as any).BeforeInstallPromptEvent === "function";
  },
};

/** Apply the resolved theme to <html>. Used by RuntimeEffects. */
export function applyResolvedTheme(theme: ThemePreference): "light" | "dark" {
  const root = capabilities.isBrowser ? document.documentElement : null;
  if (!root) return "light";
  const systemDark =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = theme === "system" ? (systemDark ? "dark" : "light") : theme;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  return resolved;
}
