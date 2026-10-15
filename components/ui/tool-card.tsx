"use client";

import { ArrowUpRight } from "lucide-react";
import { cn } from "./cn";
import { AppLink } from "@components/shell/app-link";
import { FavoriteButton } from "./favorite-button";
import type { ToolCatalogEntry } from "@core/catalog/tools";

/**
 * Home tool card — compact, deliberate, tool-oriented.
 *
 * - ONE favorite control (icon variant, always visible for accessibility).
 * - Outline (unselected) vs filled (selected) star state.
 * - Toggling favorite does NOT navigate the card (stopPropagation).
 * - Entire card is a clear navigation surface via AppLink.
 * - Restrained hover/focus state; subtle directional affordance on hover.
 * - `h-full` so all cards in a grid row stretch to equal height (no uneven
 *   sizes when taglines differ in length).
 * - Tagline area has a min-height so 1-line and 2-line taglines produce
 *   visually consistent card heights.
 */

export interface ToolCardProps {
  tool: ToolCatalogEntry;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;

  return (
    <AppLink
      href={tool.route}
      className={cn(
        "group relative flex items-start gap-2 rounded-xl p-4 bg-[var(--color-surface)]",
        "border border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
        "shadow-sm hover:shadow-md transition-all duration-200 qk-focus-ring",
        // No mount animation (qk-fade-in) — would replay on Back navigation.
        // Stretch to fill the grid cell so all cards in a row are equal height.
        "h-full"
      )}
      aria-label={`${tool.name} — ${tool.tagline}`}
    >
      {/* Icon */}
      <div
        aria-hidden
        className={cn(
          "flex items-center justify-center h-9 w-9 shrink-0 rounded-lg",
          "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
          "border border-[var(--color-primary-soft)]",
          "group-hover:scale-105 transition-transform"
        )}
      >
        <Icon size={17} />
      </div>

      {/* Title + description — flex-col so description fills remaining height */}
      <div className="flex flex-col min-w-0 flex-1 min-h-0">
        <h3 className="text-sm font-semibold text-[var(--color-fg)] group-hover:text-[var(--color-primary)] transition-colors leading-tight truncate">
          {tool.name}
        </h3>
        <p className="text-xs text-[var(--color-fg-muted)] mt-1 leading-snug line-clamp-2 min-h-[2.25rem]">
          {tool.tagline}
        </p>
      </div>

      {/* Favorite (single control, always visible) + directional affordance */}
      <div className="flex flex-col items-center gap-1 shrink-0 -mr-1 self-start">
        <FavoriteButton toolId={tool.id} size="sm" variant="icon" />
        <ArrowUpRight
          size={14}
          aria-hidden
          className={cn(
            "text-[var(--color-fg-subtle)] transition-all",
            "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
            "-translate-y-0.5 group-hover:translate-y-0"
          )}
        />
      </div>
    </AppLink>
  );
}
