import type { Metadata } from "next";
import { Monitor, Sun, Moon, Star, Clock, Info, RotateCcw } from "lucide-react";
import { pageMetadata } from "@core/seo/metadata";
import { AppLink } from "@components/shell/app-link";
import {
  ThemeControl,
  HapticsControl,
  RecentToolsControl,
  FavoritesControl,
  ResetControl,
  PwaInstallRow,
} from "@components/shell/settings-controls";
import { site } from "@core/seo/site";

export const metadata: Metadata = pageMetadata("settings");

/**
 * Settings page — Server Component.
 *
 * Owns the static shell (header, intro, section headers, captions, app-info
 * rows). The genuinely interactive bits (theme switcher, haptics toggle,
 * clear Recent/Favorites, reset, PWA install info) are small client islands
 * placed inline from components/shell/settings-controls.tsx.
 *
 * The breadcrumb/Back row is owned globally by <BackBreadcrumb /> in
 * <AppRuntime />, NOT here.
 */
export default function SettingsPage() {
  return (
    <article className="qk-container py-8 sm:py-12 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-fg)]">Settings</h1>
        <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
          QuickKit stores your preferences locally in this browser. No account, no sync, no server.
        </p>
      </header>

      {/* Appearance */}
      <section className="mb-8" aria-label="Appearance">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)] mb-3 flex items-center gap-2">
          <Monitor size={14} aria-hidden /> Appearance
        </h2>
        <div className="qk-card p-4">
          <ThemeControl />
        </div>
      </section>

      {/* Haptics */}
      <section className="mb-8" aria-label="Haptics">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)] mb-3">
          Haptics
        </h2>
        <div className="qk-card p-4">
          <HapticsControl />
        </div>
      </section>

      {/* Recent Tools */}
      <section className="mb-8" aria-label="Recent tools">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)] mb-3 flex items-center gap-2">
          <Clock size={14} aria-hidden /> Recent Tools
        </h2>
        <div className="qk-card p-4">
          <RecentToolsControl />
        </div>
      </section>

      {/* Favorites */}
      <section className="mb-8" aria-label="Favorites">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)] mb-3 flex items-center gap-2">
          <Star size={14} aria-hidden /> Favorites
        </h2>
        <div className="qk-card p-4">
          <FavoritesControl />
        </div>
      </section>

      {/* Application information */}
      <section className="mb-8" aria-label="Application information">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)] mb-3 flex items-center gap-2">
          <Info size={14} aria-hidden /> Application information
        </h2>
        <div className="qk-card p-4 flex flex-col gap-2">
          <Row label="Name" value={site.name} />
          <Row label="Version" value={site.version} />
          <Row label="Author" value={site.author} />
          <Row label="License" value={site.license} />
          <PwaInstallRow />
          <div className="flex gap-2 pt-2">
            <AppLink
              href="/about"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] qk-focus-ring rounded"
            >
              About →
            </AppLink>
            <span className="text-[var(--color-fg-subtle)]">·</span>
            <AppLink
              href="/privacy"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] qk-focus-ring rounded"
            >
              Privacy →
            </AppLink>
          </div>
        </div>
      </section>

      {/* Reset */}
      <section className="mb-8" aria-label="Reset">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)] mb-3 flex items-center gap-2">
          <RotateCcw size={14} aria-hidden /> Reset
        </h2>
        <div className="qk-card p-4">
          <ResetControl />
        </div>
      </section>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-[var(--color-fg-muted)]">{label}</span>
      <span className="text-[var(--color-fg)] font-medium">{value}</span>
    </div>
  );
}
