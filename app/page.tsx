import type { Metadata } from "next";
import { Sparkles, ShieldCheck, WifiOff } from "lucide-react";
import { pageMetadata } from "@core/seo/metadata";
import { HomeRankedGrid } from "@components/shell/home-ranked-grid";
import { homeJsonLd } from "@core/seo/jsonld";
import { site } from "@core/seo/site";

export const metadata: Metadata = pageMetadata("home");

/**
 * Home page — Server Component.
 *
 * Owns the static identity / tagline / "What do you need?" section, the
 * Quick Command explainer, and the local-first / privacy / offline context.
 * Only the ranked tool grid is a client island (<HomeRankedGrid />) because
 * it reads from the persistent app store.
 *
 * Per spec: Home does NOT show the global Back/breadcrumb row (handled in
 * <AppRuntime /> / <BackBreadcrumb />).
 */
export default function HomePage() {
  return (
    <div className="qk-container">
      {/* Identity / tagline */}
      <section className="text-center pt-6 sm:pt-10 pb-8 sm:pb-12">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-fg-muted)] mb-4">
          <Sparkles size={12} className="text-[var(--color-primary)]" aria-hidden />
          Everyday tools, local-first
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--color-fg)]">
          QuickKit
        </h1>
        <p className="mt-3 text-base sm:text-lg text-[var(--color-fg-muted)] max-w-xl mx-auto">
          {site.tagline}
        </p>
        <p className="mt-4 text-sm text-[var(--color-fg-subtle)]">What do you need?</p>
      </section>

      {/* Unified ranked tool grid (client island) */}
      <section aria-label="Tools" className="pb-10">
        <HomeRankedGrid />
      </section>

      {/* Quick Command explainer — static (the entry point is the global FAB) */}
      <section className="pb-10" aria-label="Quick Command">
        <div className="qk-card p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-11 w-11 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary-soft)] shrink-0">
              <Sparkles size={20} aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-[var(--color-fg)]">Quick Command</h2>
              <p className="text-sm text-[var(--color-fg-muted)] mt-1">
                Press{" "}
                <kbd className="font-mono text-xs px-1.5 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-2)]">
                  Ctrl
                </kbd>
                +
                <kbd className="font-mono text-xs px-1.5 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] ml-0.5">
                  K
                </kbd>{" "}
                anywhere, or tap the floating button at the bottom-right, and type{" "}
                <span className="font-mono text-[var(--color-fg)]">10 km to mi</span> — QuickKit runs the real tool engine instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Local-first / privacy / offline context */}
      <section className="pb-12 grid gap-3 sm:grid-cols-3" aria-label="Why QuickKit">
        <div className="qk-card-inset p-4 flex items-start gap-3">
          <ShieldCheck size={18} className="text-[var(--color-success)] mt-0.5 shrink-0" aria-hidden />
          <div>
            <h3 className="text-sm font-medium text-[var(--color-fg)]">Local-first</h3>
            <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">
              Calculations run in your browser. No account, no backend, no database.
            </p>
          </div>
        </div>
        <div className="qk-card-inset p-4 flex items-start gap-3">
          <WifiOff size={18} className="text-[var(--color-primary)] mt-0.5 shrink-0" aria-hidden />
          <div>
            <h3 className="text-sm font-medium text-[var(--color-fg)]">Offline-capable</h3>
            <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">
              Install as a PWA and every tool keeps working without a connection.
            </p>
          </div>
        </div>
        <div className="qk-card-inset p-4 flex items-start gap-3">
          <Sparkles size={18} className="text-[var(--color-primary)] mt-0.5 shrink-0" aria-hidden />
          <div>
            <h3 className="text-sm font-medium text-[var(--color-fg)]">One command away</h3>
            <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">
              Quick Command runs the same engines as the graphical tools. No new math.
            </p>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd()) }}
      />
    </div>
  );
}
