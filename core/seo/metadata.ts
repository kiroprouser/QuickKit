import type { Metadata } from "next";
import { site, getSiteUrl, absoluteUrl } from "./site";
import { allTools, getTool, type ToolCatalogEntry } from "@core/catalog/tools";
import { PAGES, getPage } from "@core/catalog/pages";

/**
 * QuickKit central metadata factory.
 * Uses Next.js Metadata API. No client-side SEO manager. No <meta name="keywords">.
 */

export const BASE_METADATA: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author, url: site.repositoryUrl }],
  creator: site.author,
  publisher: site.author,
  keywords: undefined, // explicitly no <meta name="keywords">
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: getSiteUrl(),
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [
      {
        url: site.defaultOgImage,
        width: 1200,
        height: 630,
        alt: `${site.name} — ${site.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [site.defaultOgImage],
  },
  icons: {
    icon: [
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png" }],
  },
  manifest: "/manifest.webmanifest",
};

/** Page metadata for a non-tool page (Guide, About, Privacy, Settings, Home). */
export function pageMetadata(pageId: "home" | "guide" | "about" | "privacy" | "settings"): Metadata {
  if (pageId === "home") {
    return {
      ...BASE_METADATA,
      alternates: { canonical: "/" },
      openGraph: {
        ...BASE_METADATA.openGraph,
        url: getSiteUrl(),
        title: `${site.name} — ${site.tagline}`,
        description: site.description,
      },
      twitter: {
        ...BASE_METADATA.twitter,
        title: `${site.name} — ${site.tagline}`,
        description: site.description,
      },
    };
  }
  const page = getPage(pageId);
  const url = absoluteUrl(page.route);
  const title = `${page.name} — ${site.name}`;
  return {
    title: `${page.name}`,
    description: page.description,
    alternates: { canonical: page.route },
    openGraph: {
      type: "website",
      locale: site.locale,
      url,
      siteName: site.name,
      title,
      description: page.description,
      images: [{ url: site.defaultOgImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: page.description,
      images: [site.defaultOgImage],
    },
    robots: page.indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

/** Page metadata for a tool page. */
export function toolMetadata(toolId: Parameters<typeof getTool>[0]): Metadata {
  const tool = getTool(toolId);
  const url = absoluteUrl(tool.route);
  return {
    title: tool.name,
    description: tool.seoDescription,
    alternates: { canonical: tool.route },
    openGraph: {
      type: "website",
      locale: site.locale,
      url,
      siteName: site.name,
      title: tool.seoTitle,
      description: tool.seoDescription,
      images: [{ url: site.defaultOgImage, width: 1200, height: 630, alt: tool.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: tool.seoTitle,
      description: tool.seoDescription,
      images: [site.defaultOgImage],
    },
    robots: { index: true, follow: true },
  };
}

/** All canonical public routes (for sitemap). */
export function indexableRoutes(): { route: string }[] {
  const toolRoutes = allTools().map((t) => ({ route: t.route }));
  const pageRoutes = PAGES.filter((p) => p.indexable).map((p) => ({
    route: p.route,
  }));
  return [...pageRoutes, ...toolRoutes];
}

/** Convenience: get a tool entry (re-exported for SEO use). */
export function toolForSeo(id: Parameters<typeof getTool>[0]): ToolCatalogEntry {
  return getTool(id);
}
