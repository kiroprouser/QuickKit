import type { MetadataRoute } from "next";
import { getSiteUrl } from "@core/seo/site";

export const dynamic = "force-static";
export const revalidate = false;

/**
 * QuickKit robots.txt — production intent:
 *   User-agent: *
 *   Allow: /
 *   Sitemap: <SITE_URL>/sitemap.xml
 *
 * Settings is controlled via page-level noindex metadata (not blocked from
 * crawling here, so it stays reachable for browsers that ignore robots.txt
 * but still won't be indexed).
 */
export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: undefined,
  };
}
