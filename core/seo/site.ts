/**
 * QuickKit central site configuration.
 * ONE authoritative source for product identity, SEO, and metadata.
 *
 * Production URL: https://quickkit-59o.pages.dev/
 */

export const site = {
  name: "QuickKit",
  shortName: "QuickKit",
  tagline: "Everyday tools. One command away.",
  description:
    "QuickKit is a privacy-conscious, local-first collection of everyday browser utilities — unit converter, percentage & money, QR generator, password & PIN, date calculator, text tools, random picker, and color converter. No account, no backend, no database. Everything runs in your browser.",
  /** Production URL — never localhost / example.com placeholder. */
  url: "https://quickkit-59o.pages.dev",
  /** Author — exactly "Asaad". Never "Asaad Student". */
  author: "Asaad",
  authorRole: "student developer",
  license: "MIT",
  licenseUrl: "https://opensource.org/license/mit",
  repositoryUrl: "https://github.com/quickkit/quickkit",
  /** Default Open Graph image (1200×630). */
  defaultOgImage: "/icons/og.png",
  /** Theme color (matches manifest). */
  themeColor: "#c24a1a",
  themeColorDark: "#181411",
  /** App version. */
  version: "1.0.0",
  /** Copyright year. */
  copyrightYear: 2026,
  /** Locale. */
  locale: "en_US",
} as const;

export type Site = typeof site;

/**
 * Resolve the production SITE_URL.
 * Honors NEXT_PUBLIC_SITE_URL when set, falls back to the canonical production
 * URL. Never uses localhost or example.com.
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, "");
  }
  return site.url;
}

/**
 * Build an absolute URL from a path. Uses canonical production SITE_URL.
 */
export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
