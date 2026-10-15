import type { Metadata } from "next";
import { pageMetadata } from "@core/seo/metadata";
import { aboutJsonLd } from "@core/seo/jsonld";
import { AppLink } from "@components/shell/app-link";
import { site } from "@core/seo/site";
import { allTools } from "@core/catalog/tools";
import { Github, ShieldCheck, WifiOff, Terminal, Sparkles } from "lucide-react";

export const metadata: Metadata = pageMetadata("about");

export default function AboutPage() {
  return (
    <article className="qk-container py-8 sm:py-12 max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-fg)]">
          About QuickKit
        </h1>
        <p className="mt-3 text-base text-[var(--color-fg-muted)] max-w-2xl">
          {site.description}
        </p>
      </header>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--color-fg)] mb-3">What QuickKit is</h2>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed mb-3">
          QuickKit is a small, focused collection of eight everyday browser utilities — Unit Converter, Percentage &amp; Money, QR Generator, Password &amp; PIN, Date Calculator, Text Tools, Random Picker, and Color Converter. Nothing more, nothing less. Each tool does one job well, runs entirely in your browser, and stays out of your way.
        </p>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          QuickKit also includes Quick Command — a global, deterministic command bar (open with Ctrl/⌘+K) that runs the same engines as the graphical tools. Type a natural command like <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)]">10 km to mi</code> and QuickKit answers immediately, without an AI.
        </p>
      </section>

      <section className="mb-10 grid gap-3 sm:grid-cols-3" aria-label="Principles">
        <div className="qk-card p-4 flex items-start gap-3">
          <ShieldCheck size={20} className="text-[var(--color-success)] mt-0.5 shrink-0" aria-hidden />
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-fg)]">Local-first</h3>
            <p className="text-xs text-[var(--color-fg-muted)] mt-1">
              Every calculation runs in your browser. There is no account, no backend, no database, and no analytics.
            </p>
          </div>
        </div>
        <div className="qk-card p-4 flex items-start gap-3">
          <WifiOff size={20} className="text-[var(--color-primary)] mt-0.5 shrink-0" aria-hidden />
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-fg)]">Offline-capable</h3>
            <p className="text-xs text-[var(--color-fg-muted)] mt-1">
              Install QuickKit as a PWA and every tool keeps working without a network connection.
            </p>
          </div>
        </div>
        <div className="qk-card p-4 flex items-start gap-3">
          <Terminal size={20} className="text-[var(--color-primary)] mt-0.5 shrink-0" aria-hidden />
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-fg)]">One command away</h3>
            <p className="text-xs text-[var(--color-fg-muted)] mt-1">
              Quick Command runs the real engines — no duplicated math, no AI guesswork.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--color-fg)] mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-[var(--color-primary)]" aria-hidden />
          The eight tools
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {allTools().map((t) => {
            const Icon = t.icon;
            return (
              <li key={t.id}>
                <AppLink
                  href={t.route}
                  className="flex items-start gap-3 rounded-md p-3 border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-border-strong)] transition-colors"
                >
                  <Icon size={18} className="text-[var(--color-primary)] mt-0.5 shrink-0" aria-hidden />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--color-fg)]">{t.name}</div>
                    <div className="text-xs text-[var(--color-fg-muted)] mt-0.5">{t.tagline}</div>
                  </div>
                </AppLink>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--color-fg)] mb-3">Open source</h2>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          QuickKit is free and open-source software released under the {site.license} license. The source is available on{" "}
          <a href={site.repositoryUrl} className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1" rel="noopener noreferrer" target="_blank">
            <Github size={14} aria-hidden /> GitHub
          </a>
          . Contributions, bug reports, and feature ideas are welcome.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--color-fg)] mb-3">Author</h2>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          QuickKit is built and maintained by <span className="font-medium text-[var(--color-fg)]">{site.author}</span>, a {site.authorRole}. Built quietly and with care for everyday use.
        </p>
      </section>

      <section className="mb-2 flex flex-wrap gap-3">
        <AppLink href="/privacy" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">
          <ShieldCheck size={14} aria-hidden /> Privacy
        </AppLink>
        <AppLink href="/guide" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">
          <Terminal size={14} aria-hidden /> Guide
        </AppLink>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd()) }}
      />
    </article>
  );
}
