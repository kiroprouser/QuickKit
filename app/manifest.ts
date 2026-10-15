import type { MetadataRoute } from "next";
import { site, getSiteUrl } from "@core/seo/site";

export const dynamic = "force-static";
export const revalidate = false;

/**
 * QuickKit PWA manifest — generated from the central site config so there is
 * one authoritative definition (no manual duplicate manifests).
 */
export default function manifest(): MetadataRoute.Manifest {
  const base = getSiteUrl();
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#faf6ef",
    theme_color: site.themeColor,
    categories: ["utilities", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Quick Command",
        short_name: "Command",
        description: "Open the QuickKit Quick Command bar",
        url: "/?cmd=1",
      },
    ],
  };
}
