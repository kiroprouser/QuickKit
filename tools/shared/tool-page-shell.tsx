import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { allTools, type ToolId } from "@core/catalog/tools";
import { FavoriteButton } from "@components/ui/favorite-button";
import { AppLink } from "@components/shell/app-link";

/**
 * QuickKit shared Tool Page composition (Server Component).
 *
 * The route's `page.tsx` (Server Component) renders this shell with the
 * interactive tool as a Client Component child. The shell owns:
 * - tool title (H1) + concise description + Favorite control (client island)
 * - the interactive tool (children — the only client island)
 * - useful contextual static sections (SEO + humans)
 * - examples where helpful
 * - privacy / local-processing note
 * - related tools
 *
 * Breadcrumb/Back is owned globally by <BackBreadcrumb /> in <AppRuntime />,
 * NOT per-page.
 */

export interface ToolPageShellProps {
  toolId: ToolId;
  /** The interactive tool component (client island). */
  children: ReactNode;
}

export function ToolPageShell({ toolId, children }: ToolPageShellProps) {
  const tool = allTools().find((t) => t.id === toolId);
  if (!tool) throw new Error(`Unknown tool id: ${toolId}`);

  const sections = tool.contentSections;
  const examplesList = tool.examples;
  const Icon = tool.icon;

  return (
    <article className="qk-container py-6 sm:py-10">
      {/* header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6 mb-6 sm:mb-8">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary-soft)]">
            <Icon size={24} aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-fg)] tracking-tight">
              {tool.h1}
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-fg-muted)] mt-1">
              {tool.tagline}
            </p>
          </div>
        </div>
        <FavoriteButton toolId={tool.id} withLabel className="shrink-0 self-start sm:self-auto" />
      </header>

      {/* interactive tool — primary focus */}
      <section aria-label={`${tool.name} tool`} className="mb-8 sm:mb-10">
        {children}
      </section>

      {/* examples (where helpful) */}
      {examplesList.length > 0 && (
        <section aria-label="Examples" className="mb-8 sm:mb-10">
          <h2 className="text-lg font-semibold text-[var(--color-fg)] mb-3">Examples</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {examplesList.map((ex, i) => (
              <li key={i} className="qk-card-inset p-3 flex flex-col gap-1">
                <div className="text-xs font-medium text-[var(--color-fg-subtle)]">{ex.label}</div>
                <div className="text-sm font-mono text-[var(--color-fg)]">{ex.input}</div>
                <div className="text-xs text-[var(--color-fg-muted)]">→ {ex.result}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* static contextual content (SEO + humans) */}
      <section className="mb-8 sm:mb-10">
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s, i) => (
            <div key={i} className="qk-card p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-[var(--color-fg)] mb-2">{s.heading}</h2>
              <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* privacy / local processing note */}
      <aside
        aria-label="Privacy"
        className="flex items-start gap-3 qk-card-inset p-4 mb-8 sm:mb-10"
      >
        <Lock size={18} className="text-[var(--color-success)] mt-0.5 shrink-0" aria-hidden />
        <p className="text-sm text-[var(--color-fg-muted)]">{tool.privacyNote}</p>
      </aside>

      {/* related tools */}
      {tool.relatedToolIds.length > 0 && (
        <section aria-label="Related tools" className="mb-2">
          <h2 className="text-lg font-semibold text-[var(--color-fg)] mb-3">Related tools</h2>
          <ul className="flex flex-wrap gap-2">
            {tool.relatedToolIds.map((rid) => {
              const rt = allTools().find((t) => t.id === rid);
              if (!rt) return null;
              const RIcon = rt.icon;
              return (
                <li key={rid}>
                  <AppLink
                    href={rt.route}
                    className="inline-flex items-center gap-2 rounded-md px-3 h-10 text-sm font-medium border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-border-strong)] transition-colors qk-focus-ring"
                  >
                    <RIcon size={16} className="text-[var(--color-primary)]" aria-hidden />
                    {rt.name}
                  </AppLink>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}
