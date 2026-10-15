"use client";

/**
 * QuickKit AppLink.
 * Wraps next/link with `prefetch={false}` as the default.
 *
 * - Gives Next client navigation (no full document reload).
 * - Preserves persistent App Router layouts (AppRuntime never restarts).
 * - Avoids unnecessary viewport/hover route prefetching.
 * - Informs the centralized NavigationController BEFORE the route transition
 *   begins, so the global progress bar is coordinated.
 *
 * Uses Next.js Link's DEFAULT scroll behavior (no `scroll={false}`).
 * The browser + Next.js App Router own scroll restoration entirely.
 *
 * Internal application code should use AppLink rather than importing next/link
 * directly. External destinations use a normal semantic <a>.
 */

import Link, { type LinkProps } from "next/link";
import { forwardRef, type AnchorHTMLAttributes, type ReactNode, type MouseEvent } from "react";
import { useNavigationController } from "@core/runtime/navigation-controller";

export interface AppLinkProps
  extends Omit<LinkProps, "href">,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps | "href"> {
  href: string;
  children: ReactNode;
  /** Opt-in to prefetch. Off by default per QuickKit spec. */
  prefetch?: boolean;
}

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith("//");
}

function isSamePath(a: string, b: string): boolean {
  // Compare pathname (ignore hash/query for same-page detection, but treat
  // different query strings as different routes).
  const aPath = a.split("#")[0];
  const bPath = b.split("#")[0];
  return aPath === bPath;
}

export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(function AppLink(
  { href, children, prefetch = false, onClick, ...rest },
  ref
) {
  const startPush = useNavigationController((s) => s.startPush);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Call the caller's onClick first (e.g. to close a mobile menu).
    onClick?.(e);

    // If the caller prevented default, do nothing.
    if (e.defaultPrevented) return;

    // Do not start navigation progress for:
    // - modifier-click / middle-click / new-tab navigation
    // - prevented clicks
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (e.button !== 0) return; // not a primary click

    // - external URLs
    if (isExternal(href)) return;

    // - same current URL (no route transition occurs)
    if (typeof window !== "undefined" && isSamePath(window.location.pathname + window.location.search, href)) {
      return;
    }

    // - same-page hash navigation where a route transition does not occur
    if (href.startsWith("#")) return;
    // If the href only adds a hash to the current path, it's same-page.
    if (typeof window !== "undefined") {
      const current = window.location.pathname + window.location.search;
      const hrefPath = href.split("#")[0];
      if (hrefPath === current) return;
    }

    // Valid internal PUSH navigation — inform the controller BEFORE the
    // route transition begins so the progress bar can start. The browser
    // + Next.js handle scroll restoration natively.
    startPush(href);
  };

  return (
    <Link href={href} prefetch={prefetch} ref={ref} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
});
