/**
 * QuickKit centralized NavigationController.
 *
 * ONE authoritative navigation subsystem. Owns:
 * - navigation kind (PUSH | HISTORY_TRAVERSAL | REPLACE | HASH | IDLE)
 * - pending destination
 * - progress lifecycle (optimistic, non-network-byte-based)
 * - completion detection (driven by actual App Router route commit, NOT timeouts)
 * - flicker prevention (reveal delay — fast transitions don't show the loader)
 * - reduced-motion respect
 *
 * This store is a zustand hook. It is consumed by:
 * - <NavigationProgress /> (the Header-attached progress bar)
 * - <AppLink /> (informs the controller of PUSH navigation)
 * - <BackBreadcrumb /> (informs the controller of history traversal)
 * - <RuntimeEffects /> (commits progress on route change + coordinates scroll)
 *
 * Timers are managed at module level (not in the store) to avoid stale
 * closures and to allow clean cancellation.
 */

import { create } from "zustand";
import { capabilities } from "@core/platform/capabilities";

export type NavKind =
  | "idle"
  | "push"
  | "history-traversal"
  | "replace"
  | "hash";

export interface NavigationControllerState {
  /** Current navigation kind. */
  kind: NavKind;
  /** Destination pathname of the pending navigation (null when idle). */
  pendingDest: string | null;
  /** Visual progress 0–100 (visual only — actual completion is route-driven). */
  progress: number;
  /** Whether the progress bar should be visually visible. */
  visible: boolean;

  // ---------- internal coordination flags ----------
  /** Set by AppLink BEFORE the route transition begins (PUSH). */
  _pushPending: boolean;
  /** Set by the popstate listener (HISTORY_TRAVERSAL). */
  _popstateFired: boolean;

  // ---------- actions ----------
  startPush: (dest: string) => void;
  startHistoryTraversal: () => void;
  startReplace: (dest: string) => void;
  /** Called by RuntimeEffects when the pathname actually commits. */
  commit: (actualPathname: string) => void;
  /** Reset to idle (after fade-out). */
  reset: () => void;
  /** Internal flag management. */
  _clearPushPending: () => void;
  _clearPopstate: () => void;
  _markPopstate: () => void;
}

// ---------- module-level timers (avoid stale closures) ----------

let revealTimer: ReturnType<typeof setTimeout> | null = null;
let creepTimer: ReturnType<typeof setInterval> | null = null;
let fadeTimer: ReturnType<typeof setTimeout> | null = null;

const REVEAL_DELAY_MS = 200; // don't show loader for very fast transitions
const CREEP_INTERVAL_MS = 350; // visual progress creep interval
const CREEP_STEP = 8; // how much progress advances per creep tick
const CREEP_LIMIT = 85; // never exceed this until actual commit
const FADE_OUT_MS = 250; // how long 100% stays before fading

function clearAllTimers() {
  if (revealTimer !== null) { clearTimeout(revealTimer); revealTimer = null; }
  if (creepTimer !== null) { clearInterval(creepTimer); creepTimer = null; }
  if (fadeTimer !== null) { clearTimeout(fadeTimer); fadeTimer = null; }
}

const prefersReducedMotion = () => capabilities.prefersReducedMotion;

export const useNavigationController = create<NavigationControllerState>((set, get) => ({
  kind: "idle",
  pendingDest: null,
  progress: 0,
  visible: false,
  _pushPending: false,
  _popstateFired: false,

  startPush: (dest) => {
    clearAllTimers();
    set({
      kind: "push",
      pendingDest: dest,
      progress: prefersReducedMotion() ? 50 : 8,
      visible: prefersReducedMotion(), // reduced motion: show immediately
      _pushPending: true,
      _popstateFired: false,
    });

    if (!prefersReducedMotion()) {
      // Reveal delay — if the route commits before this fires, the loader
      // never shows (fast-navigation flicker prevention).
      revealTimer = setTimeout(() => {
        const s = get();
        if (s.pendingDest !== null && s.kind === "push") {
          set({ visible: true, progress: 25 });
          // Start the gradual creep toward the intermediate limit.
          creepTimer = setInterval(() => {
            const cur = get();
            if (cur.pendingDest === null) return;
            if (cur.progress >= CREEP_LIMIT) return;
            set({ progress: Math.min(cur.progress + CREEP_STEP, CREEP_LIMIT) });
          }, CREEP_INTERVAL_MS);
        }
      }, REVEAL_DELAY_MS);
    }
  },

  startHistoryTraversal: () => {
    clearAllTimers();
    set({
      kind: "history-traversal",
      pendingDest: null, // we don't know the destination until popstate
      progress: prefersReducedMotion() ? 50 : 8,
      visible: prefersReducedMotion(),
      _pushPending: false,
    });

    if (!prefersReducedMotion()) {
      revealTimer = setTimeout(() => {
        const s = get();
        if (s.kind === "history-traversal") {
          set({ visible: true, progress: 25 });
          creepTimer = setInterval(() => {
            const cur = get();
            if (cur.kind !== "history-traversal") return;
            if (cur.progress >= CREEP_LIMIT) return;
            set({ progress: Math.min(cur.progress + CREEP_STEP, CREEP_LIMIT) });
          }, CREEP_INTERVAL_MS);
        }
      }, REVEAL_DELAY_MS);
    }
  },

  startReplace: (dest) => {
    clearAllTimers();
    set({
      kind: "replace",
      pendingDest: dest,
      progress: prefersReducedMotion() ? 50 : 8,
      visible: prefersReducedMotion(),
      _pushPending: false,
      _popstateFired: false,
    });
    if (!prefersReducedMotion()) {
      revealTimer = setTimeout(() => {
        const s = get();
        if (s.pendingDest !== null && s.kind === "replace") {
          set({ visible: true, progress: 25 });
        }
      }, REVEAL_DELAY_MS);
    }
  },

  commit: (actualPathname) => {
    const s = get();
    if (s.kind === "idle") return; // nothing pending

    // For PUSH/REPLACE: only commit if the actual route matches the pending dest.
    // For HISTORY_TRAVERSAL: always commit (the destination is whatever popstate gave us).
    if (s.kind === "push" || s.kind === "replace") {
      if (s.pendingDest !== actualPathname) {
        // The route changed to something other than the pending dest.
        // This can happen if another navigation started. Don't commit.
        return;
      }
    }

    clearAllTimers();
    set({
      progress: 100,
      visible: true, // briefly show 100% if it was visible, or show if reduced-motion
    });

    // After a short fade, reset to idle.
    fadeTimer = setTimeout(() => {
      get().reset();
    }, FADE_OUT_MS);
  },

  reset: () => {
    clearAllTimers();
    set({
      kind: "idle",
      pendingDest: null,
      progress: 0,
      visible: false,
    });
  },

  _clearPushPending: () => set({ _pushPending: false }),
  _clearPopstate: () => set({ _popstateFired: false }),
  _markPopstate: () => set({ _popstateFired: true }),
}));

// ---------- selectors ----------

export const selectVisible = (s: NavigationControllerState): boolean => s.visible;
export const selectProgress = (s: NavigationControllerState): number => s.progress;
export const selectKind = (s: NavigationControllerState): NavKind => s.kind;
export const selectPushPending = (s: NavigationControllerState): boolean => s._pushPending;
export const selectPopstateFired = (s: NavigationControllerState): boolean => s._popstateFired;
