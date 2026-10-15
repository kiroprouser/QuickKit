/**
 * QuickKit canonical page registry.
 *
 * Non-tool public pages: Guide, About, Privacy, Settings, plus Home.
 * Drives Footer, sitemap, llms.txt, robots policy.
 *
 * Tools come from quickkit/catalog/tools.ts (the tool catalog).
 */

export type PageId =
  | "home"
  | "guide"
  | "about"
  | "privacy"
  | "settings";

export interface PageEntry {
  id: PageId;
  route: string;
  name: string;
  shortName: string;
  description: string;
  /** Whether search engines should index this page. */
  indexable: boolean;
  /** Show in footer? */
  inFooter: boolean;
}

export const PAGES: readonly PageEntry[] = [
  {
    id: "home",
    route: "/",
    name: "Home",
    shortName: "Home",
    description:
      "QuickKit — a privacy-conscious, local-first collection of everyday browser utilities.",
    indexable: true,
    inFooter: false, // home is reachable via the logo, not a footer column
  },
  {
    id: "guide",
    route: "/guide",
    name: "Guide",
    shortName: "Guide",
    description:
      "QuickKit Guide — Quick Command, supported commands, examples, and tool capabilities.",
    indexable: true,
    inFooter: true,
  },
  {
    id: "about",
    route: "/about",
    name: "About",
    shortName: "About",
    description:
      "About QuickKit — local-first philosophy, offline capability, open-source, MIT license, and the developer.",
    indexable: true,
    inFooter: true,
  },
  {
    id: "privacy",
    route: "/privacy",
    name: "Privacy",
    shortName: "Privacy",
    description:
      "QuickKit Privacy — no account, no backend, no database, no analytics. Calculations happen locally.",
    indexable: true,
    inFooter: true,
  },
  {
    id: "settings",
    route: "/settings",
    name: "Settings",
    shortName: "Settings",
    description: "QuickKit Settings — appearance, haptics, recent tools, and favorites management.",
    indexable: false,
    inFooter: true,
  },
];

const PAGE_BY_ID: Readonly<Record<PageId, PageEntry>> = Object.fromEntries(
  PAGES.map((p) => [p.id, p]),
) as Readonly<Record<PageId, PageEntry>>;

export function getPage(id: PageId): PageEntry {
  const p = PAGE_BY_ID[id];
  if (!p) throw new Error(`Unknown page id: ${id}`);
  return p;
}

/** All public pages (including non-indexable ones, e.g. Settings). */
export function allPages(): readonly PageEntry[] {
  return PAGES;
}

/** Indexable public pages only (for sitemap). */
export function indexablePages(): readonly PageEntry[] {
  return PAGES.filter((p) => p.indexable);
}

/** Pages that should appear in the footer. */
export function footerPages(): readonly PageEntry[] {
  return PAGES.filter((p) => p.inFooter);
}
