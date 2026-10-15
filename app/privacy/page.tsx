import type { Metadata } from "next";
import { pageMetadata } from "@core/seo/metadata";
import { pageJsonLd } from "@core/seo/jsonld";
import { AppLink } from "@components/shell/app-link";
import { site } from "@core/seo/site";
import { ShieldCheck, Lock, Trash2, KeyRound } from "lucide-react";

export const metadata: Metadata = pageMetadata("privacy");

export default function PrivacyPage() {
  return (
    <article className="qk-container py-8 sm:py-12 max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-fg)]">Privacy</h1>
        <p className="mt-3 text-base text-[var(--color-fg-muted)] max-w-2xl">
          QuickKit is built to respect your data. This page describes the actual product accurately — no marketing, no unsupported claims.
        </p>
      </header>

      <section className="mb-8 qk-card p-5 flex items-start gap-4">
        <ShieldCheck size={22} className="text-[var(--color-success)] mt-0.5 shrink-0" aria-hidden />
        <div>
          <h2 className="text-base font-semibold text-[var(--color-fg)]">No account, no backend, no database</h2>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1 leading-relaxed">
            QuickKit does not require sign-up, does not call a backend API, and is not connected to any database. The production build is a static export of HTML, CSS, and JavaScript. There is no server that processes your inputs.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--color-fg)] mb-3">What happens locally</h2>
        <ul className="grid gap-3">
          <li className="qk-card-inset p-4 flex items-start gap-3">
            <Lock size={18} className="text-[var(--color-primary)] mt-0.5 shrink-0" aria-hidden />
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-fg)]">Calculations run in your browser</h3>
              <p className="text-xs text-[var(--color-fg-muted)] mt-1">
                Every tool computes its result with client-side JavaScript. Numbers, dates, colors, passwords, QR payloads, and text you enter never leave your device.
              </p>
            </div>
          </li>
          <li className="qk-card-inset p-4 flex items-start gap-3">
            <KeyRound size={18} className="text-[var(--color-primary)] mt-0.5 shrink-0" aria-hidden />
            <h3 className="text-sm font-semibold text-[var(--color-fg)]">Cryptographic randomness</h3>
            <p className="text-xs text-[var(--color-fg-muted)] mt-1">
              Passwords, PINs, coin flips, dice, and random choices use <code className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)]">window.crypto.getRandomValues</code> with rejection sampling for unbiased distributions.
            </p>
          </li>
          <li className="qk-card-inset p-4 flex items-start gap-3">
            <Trash2 size={18} className="text-[var(--color-primary)] mt-0.5 shrink-0" aria-hidden />
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-fg)]">Sensitive data is never persisted</h3>
              <p className="text-xs text-[var(--color-fg-muted)] mt-1">
                Generated passwords, PINs, QR payloads, raw Text Tool content, and Random Picker choice lists live only in memory. Closing the tab or reloading the page clears them. They are not written to localStorage or sent anywhere.
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--color-fg)] mb-3">What is stored locally</h2>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed mb-3">
          QuickKit stores a small set of durable, harmless preferences in your browser's <code className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)]">localStorage</code>:
        </p>
        <ul className="text-sm text-[var(--color-fg-muted)] list-disc pl-6 space-y-1">
          <li><strong className="text-[var(--color-fg)]">Theme preference</strong> — System / Light / Dark.</li>
          <li><strong className="text-[var(--color-fg)]">Favorites</strong> — the identities of tools you starred (e.g. <code className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)]">"color", "unit-converter"</code>).</li>
          <li><strong className="text-[var(--color-fg)]">Recent Tools</strong> — a small bounded list of the identities of tools you have visited (most recent first). QuickKit stores tool identities only — never inputs, results, command strings, or any other content.</li>
          <li><strong className="text-[var(--color-fg)]">Haptics preference</strong> — on or off.</li>
        </ul>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed mt-3">
          You can clear any of these at any time from <AppLink href="/settings" className="text-[var(--color-primary)] hover:underline">Settings</AppLink>. A schema version is stored alongside the data so future updates can migrate it safely; if the data is ever corrupted, QuickKit falls back to defaults.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--color-fg)] mb-3">PWA and offline</h2>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          When you install QuickKit as a Progressive Web App, a service worker caches the application shell and tool routes so the app continues to work offline. The service worker only caches application assets (HTML, CSS, JS, icons) on your device — it does not transmit your data anywhere. There is no push notification functionality.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--color-fg)] mb-3">What QuickKit does NOT do</h2>
        <ul className="text-sm text-[var(--color-fg-muted)] list-disc pl-6 space-y-1">
          <li>No analytics or telemetry.</li>
          <li>No tracking pixels, no third-party scripts, no advertising.</li>
          <li>No cookies for tracking.</li>
          <li>No operation History feature. There is no /history, no calculation log, no input/result history stored anywhere.</li>
          <li>No backend, no API server, no serverless functions.</li>
          <li>No database of any kind.</li>
        </ul>
      </section>

      <section className="mb-2">
        <h2 className="text-lg font-semibold text-[var(--color-fg)] mb-3">Contact</h2>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          For privacy questions or security reports, please open an issue on the{" "}
          <a href={site.repositoryUrl} className="text-[var(--color-primary)] hover:underline" rel="noopener noreferrer" target="_blank">
            QuickKit GitHub repository
          </a>.
        </p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd("privacy")) }}
      />
    </article>
  );
}
