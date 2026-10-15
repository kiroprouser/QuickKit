import { Github } from "lucide-react";
import { AppLink } from "./app-link";
import { allTools } from "@core/catalog/tools";
import { footerPages } from "@core/catalog/pages";
import { site } from "@core/seo/site";

/**
 * QuickKit compact, professional, useful Footer.
 * Lives in the persistent root layout so it sticks to the bottom (mt-auto)
 * and is pushed down naturally when content overflows.
 *
 * Uses catalog/page registries — never hardcodes a duplicate tool inventory.
 */

export function Footer() {
  const year = site.copyrightYear;
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      <div className="qk-container py-8 sm:py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                aria-hidden
                className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-bold text-xs"
              >
                Q
              </span>
              <span className="font-semibold text-[var(--color-fg)]">QuickKit</span>
            </div>
            <p className="text-sm text-[var(--color-fg-muted)] max-w-xs">
              {site.tagline}
            </p>
          </div>

          {/* tools */}
          <nav aria-label="Footer tools" className="min-w-0">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)] mb-3">
              Tools
            </h2>
            <ul className="grid gap-1.5">
              {allTools().map((t) => (
                <li key={t.id}>
                  <AppLink
                    href={t.route}
                    className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
                  >
                    {t.name}
                  </AppLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* product */}
          <nav aria-label="Footer product" className="min-w-0">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)] mb-3">
              Product
            </h2>
            <ul className="grid gap-1.5">
              {footerPages().map((p) => (
                <li key={p.id}>
                  <AppLink
                    href={p.route}
                    className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
                  >
                    {p.name}
                  </AppLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* project */}
          <nav aria-label="Footer project" className="min-w-0">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)] mb-3">
              Project
            </h2>
            <ul className="grid gap-1.5">
              <li>
                <a
                  href={site.repositoryUrl}
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Github size={14} aria-hidden /> GitHub
                </a>
              </li>
              <li>
                <a
                  href={site.licenseUrl}
                  className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {site.license} License
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-[var(--color-fg-subtle)]">
            © {year} {site.author} · {site.license}
          </p>
          <p className="text-xs text-[var(--color-fg-subtle)]">
            Local-first · Offline-capable · No account
          </p>
        </div>
      </div>
    </footer>
  );
}
