"use client";

import { useEffect, useState } from "react";
import { cn } from "@components/ui/cn";
import { useNavigationController, selectVisible, selectProgress } from "@core/runtime/navigation-controller";
import { capabilities } from "@core/platform/capabilities";

/**
 * QuickKit NavigationProgress bar.
 *
 * Lives visually at the EXACT bottom edge of the Header (positioned
 * absolutely inside the Header, which is a positioning container).
 *
 * Idle:
 *   - completely invisible/transparent
 *   - NO background track
 *   - no layout space reserved
 *
 * Active:
 *   - a thin (3px) progress line appears over the Header's bottom edge
 *   - uses a subtle gradient derived from QuickKit's existing accent tokens
 *     (burnt orange → warm orange → soft warm gold)
 *   - the LEADING EDGE (right side) has a small stair-step shape via clip-path
 *   - NO neon/electric colors
 *
 * The bar never shifts Header content, breadcrumbs, or page content.
 * Header geometry is identical before/during/after.
 *
 * Reduced motion: functional but minimal — no smooth width interpolation,
 * discrete transitions only.
 */

export function NavigationProgress() {
  const visible = useNavigationController(selectVisible);
  const progress = useNavigationController(selectProgress);

  // Avoid SSR hydration mismatch — only render after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // The bar is always in the DOM (so it can transition width), but invisible
  // when not visible. This avoids CLS — the element occupies 0 visual space
  // when idle (opacity:0, height:0 via parent) and animates in.
  const reduced = capabilities.prefersReducedMotion;

  return (
    <div
      aria-hidden="true"
      className={cn(
        // Positioned at the exact bottom edge of the Header.
        "absolute left-0 right-0 bottom-0 z-50",
        "pointer-events-none overflow-visible",
        // Height: 3px when visible, 0 when idle (no layout space).
        visible ? "h-[3px]" : "h-0"
      )}
    >
      {/* The progress line — width is progress% of the header */}
      <div
        className={cn(
          "h-full will-change-[width,opacity]",
          // Stair-step leading edge via clip-path (3 steps, each 1px tall × 4px wide).
          // The right edge goes down-right in 3 small steps.
        )}
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          // Subtle gradient derived from QuickKit's existing accent tokens.
          // burnt orange → warm orange → soft warm gold. No neon.
          background:
            "linear-gradient(90deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary), #f0b060 60%) 60%, #f0c070 100%)",
          // Transition: smooth width for non-reduced-motion; instant for reduced.
          transition: reduced
            ? "opacity 0.05s linear"
            : "width 0.2s linear, opacity 0.2s ease-out",
          // Stair-step leading edge (right edge). 3 steps:
          // (100%-12px,0) → (100%-12px,1px) → (100%-8px,1px)
          // → (100%-8px,2px) → (100%-4px,2px) → (100%-4px,3px) → (100%,3px)
          clipPath: `polygon(
            0% 0,
            calc(100% - 12px) 0,
            calc(100% - 12px) 1px,
            calc(100% - 8px) 1px,
            calc(100% - 8px) 2px,
            calc(100% - 4px) 2px,
            calc(100% - 4px) 3px,
            100% 3px,
            0% 3px
          )`,
        }}
      />
    </div>
  );
}
