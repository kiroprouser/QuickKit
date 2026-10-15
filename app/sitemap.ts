import type { MetadataRoute } from "next";
import { getSiteUrl } from "@core/seo/site";
import { indexableRoutes } from "@core/seo/metadata";

export const dynamic = "force-static";
export const revalidate = false;

/**
 * QuickKit sitemap — generated from the canonical catalogs.
 * Includes indexable canonical pages only (no Settings, no Not Found, no
 * non-page assets). Uses absolute production URLs.
 *
 * lastModified: the build date (accurate for a static export — content
 * changes only on rebuild/deploy).
 * changeFrequency: honest hint to crawlers about how often the route's
 * static content changes between deploys.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  // Build date — the real "last modified" for a static-export product.
  const lastModified = new Date();

  return indexableRoutes().map((r) => {
    // Determine change frequency based on route type.
    let changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    if (r.route === "/") {
      changeFrequency = "weekly"; // Home tool grid changes with deploy
    } else if (r.route.startsWith("/tools/")) {
      changeFrequency = "weekly"; // Tool pages change with deploy
    } else {
      changeFrequency = "monthly"; // Guide/About/Privacy — rarely changes
    }

    return {
      url: `${base}${r.route === "/" ? "" : r.route}`,
      lastModified,
      changeFrequency,
    };
  });
}
