/**
 * QuickKit PersistentAppStore.
 *
 * Durable, safe, locally-persisted application state:
 * - theme preference
 * - favorites (ToolId[])
 * - Recent Tools MRU (ToolId[] — only tool identities, never inputs/results)
 * - haptics preference
 *
 * Privacy boundary:
 * - Holds ONLY safe durable state.
 * - Never holds generated passwords, PINs, QR payloads, raw text, choice lists,
 *   or any sensitive tool inputs/results. Those live in SessionStore (memory-only).
 *
 * Persistence:
 * - Explicit schema version
 * - Validation (type + shape check)
 * - Migration support (old → new schemaVersion)
 * - Corruption fallback (reset to defaults if localStorage is unreadable)
 *
 * One store, one source of truth. Tools do NOT create their own persistent stores.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TOOL_IDS, type ToolId } from "@core/catalog/tools";

const TOOL_ID_SET: ReadonlySet<string> = new Set(TOOL_IDS);

const SCHEMA_VERSION = 1;
const RECENT_MAX = 8;
const STORAGE_KEY = "quickkit.state.v1";

export type ThemePreference = "system" | "light" | "dark";

interface PersistentState {
  schemaVersion: number;
  theme: ThemePreference;
  favorites: ToolId[];
  /** MRU list — most recent first. Only ToolIds. Never inputs/results. */
  recent: ToolId[];
  haptics: boolean;
}

interface PersistentActions {
  setTheme: (theme: ThemePreference) => void;
  toggleFavorite: (id: ToolId) => void;
  isFavorite: (id: ToolId) => boolean;
  clearFavorites: () => void;
  recordRecent: (id: ToolId) => void;
  clearRecent: () => void;
  setHaptics: (enabled: boolean) => void;
  /** Reset all durable state to defaults (Settings → reset). */
  resetAll: () => void;
}

const DEFAULTS: PersistentState = {
  schemaVersion: SCHEMA_VERSION,
  theme: "system",
  favorites: [],
  recent: [],
  haptics: true,
};

// ---------- validation ----------

function isToolId(value: unknown): value is ToolId {
  return typeof value === "string" && TOOL_ID_SET.has(value);
}

function isToolIdArray(value: unknown): value is ToolId[] {
  return Array.isArray(value) && value.every(isToolId);
}

function isTheme(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

/**
 * Validate the shape of persisted state. If anything is off, return null so
 * the storage adapter falls back to defaults (corruption fallback).
 */
function validateState(value: unknown): PersistentState | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const schemaVersion = typeof v.schemaVersion === "number" ? v.schemaVersion : SCHEMA_VERSION;
  const theme = isTheme(v.theme) ? v.theme : DEFAULTS.theme;
  const favorites = isToolIdArray(v.favorites) ? dedupe(v.favorites) : [];
  const recent = isToolIdArray(v.recent) ? dedupe(v.recent).slice(0, RECENT_MAX) : [];
  const haptics = typeof v.haptics === "boolean" ? v.haptics : DEFAULTS.haptics;
  return { schemaVersion, theme, favorites, recent, haptics };
}

function dedupe<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const x of arr) {
    if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}

// ---------- migration ----------

/**
 * Migrate older schemaVersions to the current one.
 * zustand calls this with the persisted state and the previous version.
 */
function migrate(persisted: unknown, version: number): PersistentState {
  // Today there is only version 1, but the contract is in place for future
  // migrations. If we encounter an unknown future version, fall back to defaults.
  if (version > SCHEMA_VERSION) {
    return { ...DEFAULTS };
  }
  const validated = validateState(persisted);
  return validated ?? { ...DEFAULTS };
}

// ---------- store ----------

export const usePersistentStore = create<PersistentState & PersistentActions>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      setTheme: (theme) => set({ theme }),

      toggleFavorite: (id) =>
        set((s) => {
          const has = s.favorites.includes(id);
          return {
            favorites: has
              ? s.favorites.filter((x) => x !== id)
              : [...s.favorites, id],
          };
        }),

      isFavorite: (id) => get().favorites.includes(id),

      clearFavorites: () => set({ favorites: [] }),

      // MRU: move id to front, remove older occurrence, keep bounded list.
      recordRecent: (id) =>
        set((s) => {
          const without = s.recent.filter((x) => x !== id);
          const next = [id, ...without].slice(0, RECENT_MAX);
          return { recent: next };
        }),

      clearRecent: () => set({ recent: [] }),

      setHaptics: (enabled) => set({ haptics: enabled }),

      resetAll: () => set({ ...DEFAULTS }),
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => {
        // Use a wrapped localStorage that validates + falls back on corruption.
        const ls: Storage | null =
          typeof window !== "undefined" ? window.localStorage : null;
        return {
          getItem: (name) => {
            if (!ls) return null;
            try {
              const raw = ls.getItem(name);
              if (!raw) return null;
              const parsed = JSON.parse(raw) as { state?: unknown; version?: number };
              return JSON.stringify({
                state: parsed.state ?? null,
                version: typeof parsed.version === "number" ? parsed.version : SCHEMA_VERSION,
              });
            } catch {
              // Corruption fallback — discard, return null so defaults load.
              return null;
            }
          },
          setItem: (name, value) => {
            if (!ls) return;
            try {
              ls.setItem(name, value);
            } catch {
              // Quota / private mode — silently no-op. State stays in-memory.
            }
          },
          removeItem: (name) => {
            if (!ls) return;
            try {
              ls.removeItem(name);
            } catch {
              // ignore
            }
          },
        };
      }),
      partialize: (s) => ({
        schemaVersion: s.schemaVersion,
        theme: s.theme,
        favorites: s.favorites,
        recent: s.recent,
        haptics: s.haptics,
      }),
      migrate,
      // On rehydration, validate the state. If invalid, fall back.
      onRehydrateStorage: () => (state) => {
        if (state) {
          const validated = validateState({
            schemaVersion: state.schemaVersion,
            theme: state.theme,
            favorites: state.favorites,
            recent: state.recent,
            haptics: state.haptics,
          });
          if (validated) {
            usePersistentStore.setState({
              schemaVersion: SCHEMA_VERSION,
              theme: validated.theme,
              favorites: validated.favorites,
              recent: validated.recent,
              haptics: validated.haptics,
            });
          } else {
            usePersistentStore.setState({ ...DEFAULTS });
          }
        }
      },
      merge: (persisted, current) => {
        const validated = validateState(persisted);
        const next: PersistentState = validated ?? { ...DEFAULTS };
        return { ...current, ...next };
      },
    }
  )
);

/** Selector helpers for stable references. */
export const selectFavorites = (s: PersistentState & PersistentActions): ToolId[] => s.favorites;
export const selectRecent = (s: PersistentState & PersistentActions): ToolId[] => s.recent;
export const selectTheme = (s: PersistentState & PersistentActions): ThemePreference => s.theme;
export const selectHaptics = (s: PersistentState & PersistentActions): boolean => s.haptics;
