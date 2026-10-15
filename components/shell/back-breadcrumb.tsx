"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { AppLink } from "./app-link";
import { cn } from "@components/ui/cn";
import { deriveBreadcrumbs } from "@core/catalog/breadcrumbs";
import { haptic } from "@core/platform/haptics";
import { useNavigationController } from "@core/runtime/navigation-controller";

/**
 * QuickKit global navigation context row.
 *
 * Mounted ONCE in <AppRuntime>. Renders on every non-Home route.
 *
 *   ←  Home / Tools / Unit Converter
 *
 * BACK ARROW:
 * - informs the centralized NavigationController (for the progress bar)
 * - performs real browser-history Back (router.back()); falls back to Home
 *   only when there is no meaningful in-app history entry
 * - the browser + Next.js handle scroll restoration natively
 *
 * BREADCRUMBS:
 * - represent hierarchy, not browser history
 * - derived centrally from core/catalog (no hardcoded strings in pages)
 * - breadcrumb Links are normal AppLink PUSH navigation (destination starts
 *   at top/default)
 *
 * Home `/` does NOT show the row.
 */

export function BackBreadcrumb() {
  const pathname = usePathname();
  const router = useRouter();
  const startHistoryTraversal = useNavigationController((s) => s.startHistoryTraversal);

  // Home does not show the row.
  if (!pathname || pathname === "/") return null;

  const items = deriveBreadcrumbs(pathname);
  if (items.length === 0) return null;

  const handleBack = () => {
    haptic(8);
    // Inform the centralized controller (for the progress bar).
    // The browser + Next.js handle scroll restoration natively.
    startHistoryTraversal();
    // If there's no meaningful in-app back entry, fall back to Home.
    // Otherwise use browser/App Router history (real Back).
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // The last item is the current page.
  const current = items[items.length - 1];

  return (
    <nav
      aria-label="Page navigation"
      // Full-width background + border (matching the Header), with the
      // content constrained and centered inside via qk-container.
      className="pt-3 pb-1 sm:pt-4 sm:pb-2 border-b border-[var(--color-border)] bg-[var(--color-bg)]/85 backdrop-blur-md sticky top-[var(--header-h)] z-30"
    >
      {/* Parent row: flex + items-center ensures ALL children share the same
          vertical centerline. Every child is inline-flex/items-center with
          consistent line-height (text-xs leading-none) so no element sits
          higher or lower than another. */}
      <div className="qk-container flex items-center gap-2 min-w-0">
        {/* Back arrow */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className={cn(
            "inline-flex items-center justify-center h-8 w-8 shrink-0 rounded-md",
            "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]",
            "transition-colors qk-focus-ring"
          )}
        >
          <ArrowLeft size={16} aria-hidden />
        </button>

        {/* Slash divider — same text size + leading as breadcrumbs for
            consistent vertical centering */}
        <span aria-hidden className="inline-flex items-center text-xs leading-none text-[var(--color-fg-subtle)] select-none">/</span>

        {/* Breadcrumb trail — shown on sm+ (640px+). On narrow screens only
            the current page label is shown (below). */}
        <ol
          className="hidden sm:flex items-center gap-1 text-xs leading-none text-[var(--color-fg-subtle)] min-w-0 overflow-hidden"
        >
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={i} className="inline-flex items-center gap-1 min-w-0">
                {i > 0 && (
                  <ChevronRight size={11} aria-hidden className="text-[var(--color-fg-subtle)] shrink-0" />
                )}
                {item.route && !isLast ? (
                  <AppLink
                    href={item.route}
                    className="inline-flex items-center leading-none hover:text-[var(--color-fg)] transition-colors truncate"
                  >
                    {item.label}
                  </AppLink>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center leading-none truncate",
                      isLast ? "text-[var(--color-fg)] font-medium" : "text-[var(--color-fg-muted)]"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        {/* On narrow screens: just the current page label */}
        <span
          aria-current="page"
          className="sm:hidden text-xs leading-none text-[var(--color-fg)] font-medium truncate min-w-0"
        >
          {current.label}
        </span>
      </div>
    </nav>
  );
}

