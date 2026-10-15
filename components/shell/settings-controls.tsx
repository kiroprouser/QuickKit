"use client";

/**
 * Small interactive control islands for the Settings page.
 *
 * The Settings route's `page.tsx` (Server Component) owns the static shell:
 * headers, intros, section captions, app-info rows. These small client
 * components handle only the genuinely interactive bits (reading/writing
 * the persistent store).
 *
 * Each control is self-contained: it reads its own slice of the store with
 * a zustand selector, so changing one control does not re-render the others
 * or the surrounding static shell.
 */

import { useEffect, useState } from "react";
import { Trash2, RotateCcw, Wifi } from "lucide-react";
import { usePersistentStore, type ThemePreference } from "@core/runtime/persistent-store";
import { useSessionStore } from "@core/runtime/session-store";
import { SegmentedControl } from "@components/ui/segmented-control";
import { Switch } from "@components/ui/switch";
import { Button } from "@components/ui/button";
import { toast } from "@components/ui/toast";
import { haptic } from "@core/platform/haptics";
import { capabilities } from "@core/platform/capabilities";
import { allTools } from "@core/catalog/tools";

const THEME_OPTIONS = [
  { value: "system" as const, label: "System" },
  { value: "light" as const, label: "Light" },
  { value: "dark" as const, label: "Dark" },
];

export function ThemeControl() {
  const theme = usePersistentStore((s) => s.theme);
  const setTheme = usePersistentStore((s) => s.setTheme);
  return (
    // On mobile: stack vertically (label/description on top, SegmentedControl
    // full-width below). On sm+ (640px+): horizontal row side-by-side.
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <div className="text-sm font-medium text-[var(--color-fg)]">Theme</div>
        <p className="text-xs text-[var(--color-fg-subtle)] mt-0.5">
          System mode follows your OS theme automatically.
        </p>
      </div>
      <SegmentedControl
        options={THEME_OPTIONS}
        value={theme}
        onChange={(v: ThemePreference) => {
          setTheme(v);
          haptic(8);
        }}
        ariaLabel="Theme"
        fullWidth
      />
    </div>
  );
}

export function HapticsControl() {
  const hapticsEnabled = usePersistentStore((s) => s.haptics);
  const setHaptics = usePersistentStore((s) => s.setHaptics);
  return (
    <>
      <Switch
        checked={hapticsEnabled}
        onChange={(v) => {
          setHaptics(v);
          if (v) haptic(15);
        }}
        label="Haptic feedback"
        description="Vibrate briefly on key actions (copy, generate, flip). Supported on most mobile browsers."
        disabled={!capabilities.hasVibration}
      />
      {!capabilities.hasVibration && (
        <p className="text-xs text-[var(--color-fg-subtle)] mt-2">
          Haptics aren&apos;t available on this device/browser.
        </p>
      )}
    </>
  );
}

export function RecentToolsControl() {
  const recent = usePersistentStore((s) => s.recent);
  const clearRecent = usePersistentStore((s) => s.clearRecent);
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-[var(--color-fg)]">Recent tools list</div>
        <p className="text-xs text-[var(--color-fg-subtle)] mt-0.5">
          QuickKit records only the identities of tools you visit (never inputs or results). Currently {recent.length} tool{recent.length === 1 ? "" : "s"}.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          clearRecent();
          haptic(8);
          toast.success("Recent tools cleared");
        }}
        disabled={recent.length === 0}
      >
        <Trash2 size={14} aria-hidden /> Clear
      </Button>
    </div>
  );
}

export function FavoritesControl() {
  const favorites = usePersistentStore((s) => s.favorites);
  const clearFavorites = usePersistentStore((s) => s.clearFavorites);
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-[var(--color-fg)]">Favorite tools</div>
          <p className="text-xs text-[var(--color-fg-subtle)] mt-0.5">
            You have {favorites.length} favorite tool{favorites.length === 1 ? "" : "s"}. Favorited tools appear first on Home.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            clearFavorites();
            haptic(8);
            toast.success("Favorites cleared");
          }}
          disabled={favorites.length === 0}
        >
          <Trash2 size={14} aria-hidden /> Clear
        </Button>
      </div>
      {favorites.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {favorites.map((id) => {
            const tool = allTools().find((t) => t.id === id);
            if (!tool) return null;
            const Icon = tool.icon;
            return (
              <li
                key={id}
                className="inline-flex items-center gap-1.5 rounded-md px-2 h-8 text-xs border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-fg)]"
              >
                <Icon size={12} className="text-[var(--color-primary)]" aria-hidden />
                {tool.shortName}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function ResetControl() {
  const resetAll = usePersistentStore((s) => s.resetAll);
  const clearAllSession = useSessionStore((s) => s.clearAllSession);
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-[var(--color-fg)]">Reset all preferences</div>
        <p className="text-xs text-[var(--color-fg-subtle)] mt-0.5">
          Clears theme, favorites, recent tools, and haptics. Sensitive session state is also cleared.
        </p>
      </div>
      <Button
        variant="danger"
        size="sm"
        onClick={() => {
          resetAll();
          clearAllSession();
          haptic([8, 30, 8]);
          toast.success("All preferences reset");
        }}
      >
        <RotateCcw size={14} aria-hidden /> Reset all
      </Button>
    </div>
  );
}

export function PwaInstallRow() {
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    if (capabilities.isBrowser) {
      setInstalled(window.matchMedia("(display-mode: standalone)").matches);
    }
  }, []);
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-[var(--color-fg-muted)]">Installed as PWA</span>
      <span className="text-[var(--color-fg)] font-medium inline-flex items-center gap-1.5">
        {installed ? <Wifi size={14} aria-hidden /> : null}
        {installed ? "Yes" : "No"}
      </span>
    </div>
  );
}
