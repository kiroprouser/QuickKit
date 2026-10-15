/**
 * QuickKit RuntimeEffects.
 * Truly global browser effects that live exactly once, in AppRuntime.
 *
 * - Route tracking: maps current App Router pathname → ToolId via canonical
 *   catalog and updates the Recent Tools MRU. Individual tool components do NOT
 *   record themselves.
 * - Theme application: resolves 'system' | 'light' | 'dark' to <html> class
 *   and listens for OS theme changes.
 * - Service worker registration (PWA / offline).
 * - Global Quick Command keyboard shortcut (Ctrl/Cmd+K).
 * - CENTRALIZED NAVIGATION PROGRESS (only — NOT scroll):
 *   - popstate listener (marks history-traversal so the progress bar knows
 *     the navigation kind)
 *   - on pathname change: commit progress (actual route commit = authoritative
 *     completion signal)
 *
 * SCROLL RESTORATION:
 *   NOT managed here. The browser + Next.js App Router own scroll behavior
 *   entirely. `scroll-behavior: auto` in globals.css ensures instant
 *   (non-smooth) restoration on Back/Forward. Next.js handles scroll-to-top
 *   on PUSH navigation. Tool state is preserved through the persistent
 *   SessionStore (not by preventing remounts).
 *
 * Renders nothing.
 */

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePersistentStore } from "./persistent-store";
import { useSessionStore } from "./session-store";
import { useNavigationController } from "./navigation-controller";
import { routeToToolId } from "@core/catalog/tools";
import { applyResolvedTheme, capabilities } from "@core/platform/capabilities";

export function RuntimeEffects() {
  const pathname = usePathname();

  // ----- route tracking → Recent MRU -----
  useEffect(() => {
    if (!pathname) return;
    const id = routeToToolId(pathname);
    if (!id) return;
    usePersistentStore.getState().recordRecent(id);
  }, [pathname]);

  // ----- theme application + system theme change listener -----
  const theme = usePersistentStore((s) => s.theme);
  useEffect(() => {
    applyResolvedTheme(theme);
    if (theme !== "system" || !capabilities.isBrowser) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyResolvedTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  // ----- service worker registration (offline / PWA) -----
  useEffect(() => {
    if (!capabilities.hasServiceWorker) return;
    if (process.env.NODE_ENV !== "production") return; // dev: skip
    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {
          // ignore — offline still works for cached assets.
        });
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  // ----- global Quick Command shortcut -----
  useEffect(() => {
    if (!capabilities.isBrowser) return;
    const onKey = (e: KeyboardEvent) => {
      const isShortcut =
        (e.key === "k" || e.key === "K") &&
        (e.metaKey || e.ctrlKey) &&
        !e.altKey &&
        !e.shiftKey;
      if (!isShortcut) return;
      e.preventDefault();
      useSessionStore.getState().setCmdOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ----- CENTRALIZED NAVIGATION PROGRESS (NOT scroll) -----
  // popstate listener — marks history-traversal (Back/Forward) so the
  // progress bar knows the navigation kind. Also clears the _pushPending
  // flag (a popstate means we went Back/Forward, not PUSH).
  // Scroll is NOT managed here — browser + Next.js own it.
  useEffect(() => {
    if (!capabilities.isBrowser) return;

    const onPopstate = () => {
      const nav = useNavigationController.getState();
      nav._markPopstate();
      // If a PUSH was pending but popstate fired, it means the user went
      // Back before the PUSH committed — cancel the pending push.
      nav._clearPushPending();
    };
    window.addEventListener("popstate", onPopstate);
    return () => window.removeEventListener("popstate", onPopstate);
  }, []);

  // ----- ROUTE COMMIT (progress completion only) -----
  // When the pathname changes, the route has committed. This is the
  // authoritative completion signal for the progress bar.
  // Scroll behavior is NOT managed here — browser + Next.js own it.
  useEffect(() => {
    if (!pathname) return;
    const nav = useNavigationController.getState();
    nav.commit(pathname);
    // Clear the push-pending flag — the route has committed.
    nav._clearPushPending();
    nav._clearPopstate();
  }, [pathname]);

  return null;
}
