/**
 * Central breadcrumb derivation.
 *
 * Breadcrumbs represent hierarchy, NOT browser history. Labels/routes come
 * from the existing central page/tool catalog — never hardcoded in
 * individual pages.
 *
 * Hierarchy:
 *   Home  →  Tools  →  <tool name>            (for /tools/<id> routes)
 *   Home  →  <page name>                       (for /guide, /about, /privacy, /settings)
 *
 * "Tools" is a hierarchy label only — there is no /tools index page, so it
 * renders as a non-link breadcrumb item.
 */

import { allTools } from "./tools";
import { allPages } from "./pages";

export interface BreadcrumbItem {
  label: string;
  /** Route to link to. When undefined, the item is a non-link label. */
  route?: string;
  /** Whether this is the current (last) item. */
  current?: boolean;
}

/**
 * Derive breadcrumb items for a given App Router pathname.
 * Returns an empty array for Home (Home does not show the row).
 */
export function deriveBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === "/" || pathname === "") return [];

  // Tool route?
  const tool = allTools().find((t) => t.route === pathname);
  if (tool) {
    return [
      { label: "Home", route: "/" },
      { label: "Tools" }, // hierarchy label only — no /tools index page exists
      { label: tool.name, current: true },
    ];
  }

  // Non-tool page?
  const page = allPages().find((p) => p.route === pathname);
  if (page) {
    return [
      { label: "Home", route: "/" },
      { label: page.name, current: true },
    ];
  }

  // Unknown route (e.g. not-found) — just show Home.
  return [{ label: "Home", route: "/" }];
}
