/**
 * QuickKit SessionStore.
 *
 * Memory-only application/session state. Lives above route pages in AppRuntime
 * so it survives Next client navigation (Back/Forward included).
 *
 * Holds:
 * - per-tool working state (Unit Converter, Percentage, QR, Password, Date,
 *   Text, Random, Color)
 * - Quick Command runtime (open state, query)
 * - transient dialog/feedback state
 *
 * Privacy boundary:
 * - This state is NEVER automatically persisted to localStorage.
 * - Sensitive values (generated passwords, PINs, QR payloads, raw text, random
 *   choice lists, sensitive tool inputs/results) MAY live here so navigation
 *   away/back restores the working session. A full reload/browser restart
 *   clears this state by design.
 *
 * One store — tools do NOT create their own. Per-tool state is keyed by ToolId
 * and accessed through the typed `useToolState` hook below.
 */

import { create } from "zustand";
import { useEffect, useCallback, useRef } from "react";
import type { ToolId } from "@core/catalog/tools";

type ToolStateBag = Record<string, unknown>;
type ToolStateMap = Partial<Record<ToolId, ToolStateBag>>;

interface SessionState {
  tool: ToolStateMap;
  cmdOpen: boolean;
  cmdQuery: string;
  toastSeq: number;

  initTool: <T extends object>(id: ToolId, initial: T) => void;
  setToolState: <T extends object>(
    id: ToolId,
    patch: Partial<T> | ((prev: T) => Partial<T>),
    fallbackInitial?: T
  ) => void;
  clearTool: (id: ToolId) => void;
  setCmdOpen: (open: boolean) => void;
  setCmdQuery: (q: string) => void;
  nextToastSeq: () => number;
  clearAllSession: () => void;
}

const EMPTY = {
  tool: {},
  cmdOpen: false,
  cmdQuery: "",
  toastSeq: 0,
} as const;

let _toastSeq = 0;

export const useSessionStore = create<SessionState>((set, get) => ({
  ...EMPTY,

  initTool: (id, initial) =>
    set((s) => {
      if (s.tool[id]) return {}; // already initialized — no-op
      return { tool: { ...s.tool, [id]: { ...initial } } };
    }),

  setToolState: (id, patch, fallbackInitial) =>
    set((s) => {
      const prev = (s.tool[id] ?? fallbackInitial ?? {}) as ToolStateBag;
      const resolvedPatch =
        typeof patch === "function"
          ? patch((s.tool[id] ?? fallbackInitial ?? {}) as any)
          : patch;
      return {
        tool: { ...s.tool, [id]: { ...prev, ...resolvedPatch } },
      };
    }),

  clearTool: (id) =>
    set((s) => {
      const next = { ...s.tool };
      delete next[id];
      return { tool: next };
    }),

  setCmdOpen: (open) => set({ cmdOpen: open }),
  setCmdQuery: (q) => set({ cmdQuery: q }),
  nextToastSeq: () => {
    _toastSeq += 1;
    set({ toastSeq: _toastSeq });
    return _toastSeq;
  },

  clearAllSession: () => set({ ...EMPTY, tool: {} }),
}));

/**
 * Typed hook for a tool to read/patch its own working state.
 *
 * - Selective subscription: only this tool's slice is subscribed to, so
 *   changing one tool's session state does NOT re-render other tools.
 * - On first mount the tool's `initial` is lazily stored if absent.
 * - Survives client navigation because the store lives in AppRuntime.
 *
 * @example
 * const [s, setS] = useToolState('unit-converter', { inputValue: '', from: 'km', to: 'mi' });
 * setS({ inputValue: '10' });
 */
export function useToolState<T extends object>(
  id: ToolId,
  initial: T
): [T, (patch: Partial<T> | ((prev: T) => Partial<T>)) => void] {
  // Subscribe ONLY to this tool's slice (stable reference via shallow default).
  const value = useSessionStore((s) => (s.tool[id] as T | undefined) ?? initial);

  // Lazy init: if absent on mount, store the initial. Runs once per (id,initial).
  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    const cur = useSessionStore.getState().tool[id];
    if (!cur) {
      useSessionStore.getState().initTool(id, initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Stable setter.
  const setS = useCallback(
    (patch: Partial<T> | ((prev: T) => Partial<T>)) => {
      useSessionStore.getState().setToolState<T>(id, patch, initial);
    },
    [id, initial]
  );

  return [value, setS];
}
