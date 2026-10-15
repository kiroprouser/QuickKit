"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "./cn";
import { usePersistentStore } from "@core/runtime/persistent-store";
import { haptic } from "@core/platform/haptics";
import type { ToolId } from "@core/catalog/tools";

export interface FavoriteButtonProps {
  toolId: ToolId;
  className?: string;
  /** Render label next to icon. */
  withLabel?: boolean;
  size?: "sm" | "md";
  /** Visual presentation. "button" = bordered pill; "icon" = bare icon-only. */
  variant?: "button" | "icon";
}

export function FavoriteButton({
  toolId,
  className,
  withLabel,
  size = "md",
  variant = "button",
}: FavoriteButtonProps) {
  const isFav = usePersistentStore((s) => s.favorites.includes(toolId));
  const toggleFavorite = usePersistentStore((s) => s.toggleFavorite);
  const [pending, setPending] = useState(false);

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPending(true);
    toggleFavorite(toolId);
    haptic(8);
    setTimeout(() => setPending(false), 0);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      setPending(true);
      toggleFavorite(toolId);
      haptic(8);
      setTimeout(() => setPending(false), 0);
    }
  };

  const star = (
    <Star
      size={size === "sm" ? 15 : 16}
      aria-hidden
      className={cn(
        "transition-colors",
        isFav
          ? "fill-[var(--color-primary)] text-[var(--color-primary)]"
          : "text-[var(--color-fg-subtle)]"
      )}
    />
  );

  if (variant === "icon") {
    return (
      <button
        type="button"
        aria-pressed={isFav}
        aria-label={isFav ? `Remove ${toolId} from favorites` : `Add ${toolId} to favorites`}
        title={isFav ? "Remove from favorites" : "Add to favorites"}
        onClick={handle}
        onKeyDown={handleKey}
        disabled={pending}
        className={cn(
          "inline-flex items-center justify-center rounded-md qk-focus-ring",
          "transition-colors disabled:opacity-50 disabled:pointer-events-none",
          size === "sm" ? "h-8 w-8" : "h-9 w-9",
          "hover:bg-[var(--color-surface-2)]",
          isFav && "hover:bg-[var(--color-primary-soft)]",
          className
        )}
      >
        {star}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={isFav}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      onClick={handle}
      onKeyDown={handleKey}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-medium transition-colors qk-focus-ring",
        "border border-[var(--color-border)] hover:bg-[var(--color-surface-2)]",
        "disabled:opacity-50 disabled:pointer-events-none",
        size === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-xs",
        isFav
          ? "text-[var(--color-primary)] border-[var(--color-primary-soft)] bg-[var(--color-primary-soft)]"
          : "text-[var(--color-fg-muted)]",
        className
      )}
    >
      {star}
      {withLabel && <span>{isFav ? "Favorited" : "Favorite"}</span>}
    </button>
  );
}
