import type { Metadata } from "next";
import { pageMetadata } from "@core/seo/metadata";
import { pageJsonLd } from "@core/seo/jsonld";
import { COMMAND_SPECS } from "@components/command/registry";
import { allTools } from "@core/catalog/tools";
import { AppLink } from "@components/shell/app-link";
import { Terminal, Keyboard, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = pageMetadata("guide");

/**
 * QuickKit Guide — data-driven from the command/tool definitions.
 * Explains Quick Command, supported commands, examples, tool capabilities,
 * the keyboard shortcut, and local/private processing.
 */

export default function GuidePage() {
  return (
    <article className="qk-container py-8 sm:py-12">
      <header className="mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-fg)]">Guide</h1>
        <p className="mt-2 text-base text-[var(--color-fg-muted)] max-w-2xl">
          QuickKit Quick Command is the fastest way to use the tools. Press{" "}
          <kbd className="font-mono text-xs px-1.5 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-2)]">Ctrl</kbd>
          +<kbd className="font-mono text-xs px-1.5 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] ml-0.5">K</kbd>{" "}
          (or <kbd className="font-mono text-xs px-1.5 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-2)]">⌘K</kbd> on macOS), or tap the floating button at the bottom-right, anywhere in QuickKit and type a natural command.
        </p>
      </header>

      {/* Quick Command explainer */}
      <section className="mb-10 grid gap-3 sm:grid-cols-3" aria-label="Quick Command overview">
        <div className="qk-card p-4 flex items-start gap-3">
          <Terminal size={20} className="text-[var(--color-primary)] mt-0.5 shrink-0" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-fg)]">One input, every tool</h2>
            <p className="text-xs text-[var(--color-fg-muted)] mt-1">
              Type a natural command — QuickKit parses it deterministically and runs the real tool engine.
            </p>
          </div>
        </div>
        <div className="qk-card p-4 flex items-start gap-3">
          <Keyboard size={20} className="text-[var(--color-primary)] mt-0.5 shrink-0" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-fg)]">Global shortcut</h2>
            <p className="text-xs text-[var(--color-fg-muted)] mt-1">
              Open Quick Command from any page with <kbd className="font-mono">Ctrl/⌘+K</kbd>. Run with <kbd className="font-mono">Enter</kbd>. Close with <kbd className="font-mono">Esc</kbd>.
            </p>
          </div>
        </div>
        <div className="qk-card p-4 flex items-start gap-3">
          <ShieldCheck size={20} className="text-[var(--color-success)] mt-0.5 shrink-0" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-fg)]">Local &amp; private</h2>
            <p className="text-xs text-[var(--color-fg-muted)] mt-1">
              Every calculation runs in your browser. Nothing you type into Quick Command is sent to a server or persisted.
            </p>
          </div>
        </div>
      </section>

      {/* Supported commands — data-driven from COMMAND_SPECS */}
      <section className="mb-10" aria-label="Supported commands">
        <h2 className="text-xl font-semibold text-[var(--color-fg)] mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-[var(--color-primary)]" aria-hidden />
          Supported commands
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {COMMAND_SPECS.map((spec) => (
            <div key={spec.intent} className="qk-card p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-sm font-semibold text-[var(--color-fg)]">{spec.summary}</h3>
                <code className="text-[10px] font-mono text-[var(--color-fg-subtle)] bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded">{spec.intent}</code>
              </div>
              <ul className="mt-2 flex flex-col gap-1">
                {spec.examples.map((ex) => (
                  <li key={ex} className="text-xs font-mono text-[var(--color-fg-muted)] bg-[var(--color-surface-2)] rounded px-2 py-1 border border-[var(--color-border)]">{ex}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Tool capabilities — from the catalog */}
      <section className="mb-10" aria-label="Tool capabilities">
        <h2 className="text-xl font-semibold text-[var(--color-fg)] mb-4">Tool capabilities</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {allTools().map((t) => {
            const Icon = t.icon;
            return (
              <li key={t.id}>
                <AppLink
                  href={t.route}
                  className="qk-card p-4 flex items-start gap-3 hover:border-[var(--color-border-strong)] hover:shadow-md transition-all"
                >
                  <Icon size={20} className="text-[var(--color-primary)] mt-0.5 shrink-0" aria-hidden />
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd("guide")) }}
      />
    </article>
  );
}
