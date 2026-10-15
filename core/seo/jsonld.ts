import { site, getSiteUrl, absoluteUrl } from "./site";
import { allTools, getTool } from "@core/catalog/tools";
import { getPage } from "@core/catalog/pages";
import type { ToolId } from "@core/catalog/tools";

/**
 * QuickKit JSON-LD builder.
 * Truthful structured data only — no fabricated ratings, reviews, downloads,
 * awards, or non-existent Organizations.
 *
 * All JSON-LD is rendered in static Server Components.
 */

function personSchema() {
  return {
    "@type": "Person",
    "@id": `${getSiteUrl()}/#person`,
    name: site.author,
    description: site.authorRole,
    url: getSiteUrl(),
  };
}

function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${getSiteUrl()}/#website`,
    url: getSiteUrl(),
    name: site.name,
    description: site.description,
    inLanguage: "en",
    publisher: { "@id": `${getSiteUrl()}/#person` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${getSiteUrl()}/guide?q={query}`,
      "query-input": "required name=query",
    },
  };
}

function webAppSchema() {
  return {
    "@type": "WebApplication",
    "@id": `${getSiteUrl()}/#app`,
    name: site.name,
    url: getSiteUrl(),
    description: site.description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@id": `${getSiteUrl()}/#person` },
    publisher: { "@id": `${getSiteUrl()}/#person` },
    license: site.licenseUrl,
  };
}

/** Home page: WebSite + WebApplication + Person. */
export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [personSchema(), websiteSchema(), webAppSchema()],
  };
}

/** Tool page: WebPage + BreadcrumbList. */
export function toolJsonLd(toolId: ToolId) {
  const tool = getTool(toolId);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${absoluteUrl(tool.route)}#page`,
        url: absoluteUrl(tool.route),
        name: tool.seoTitle,
        description: tool.seoDescription,
        isPartOf: { "@id": `${getSiteUrl()}/#website` },
        about: tool.name,
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${absoluteUrl(tool.route)}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: getSiteUrl(),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tools",
            item: `${getSiteUrl()}/#tools`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tool.name,
            item: absoluteUrl(tool.route),
          },
        ],
      },
    ],
  };
}

/** About page: AboutPage + Person. */
export function aboutJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${absoluteUrl("/about")}#page`,
        url: absoluteUrl("/about"),
        name: "About QuickKit",
        description: getPage("about").description,
        isPartOf: { "@id": `${getSiteUrl()}/#website` },
        mainEntity: { "@id": `${getSiteUrl()}/#person` },
      },
      personSchema(),
    ],
  };
}

/** Generic WebPage schema for Guide / Privacy. */
export function pageJsonLd(pageId: "guide" | "privacy") {
  const page = getPage(pageId);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${absoluteUrl(page.route)}#page`,
        url: absoluteUrl(page.route),
        name: page.name,
        description: page.description,
        isPartOf: { "@id": `${getSiteUrl()}/#website` },
        inLanguage: "en",
      },
    ],
  };
}

/** llms.txt content — generated from the same canonical catalog (no drift). */
export function llmsTxt(): string {
  const lines: string[] = [];
  lines.push(`# ${site.name}`);
  lines.push("");
  lines.push(`> ${site.tagline}`);
  lines.push("");
  lines.push(`${site.name} is a privacy-conscious, local-first collection of everyday browser utilities. All calculations run entirely in the user's browser — no account, no application backend, no database, no analytics. The production build is a static export of HTML, CSS, and JavaScript served from ${getSiteUrl()}.`);
  lines.push("");
  lines.push("Product characteristics:");
  lines.push("- Local-first: every calculation runs in the browser");
  lines.push("- Offline-capable: installable as a PWA with a service worker for offline use");
  lines.push("- No account, no backend, no database");
  lines.push("- No analytics or tracking");
  lines.push("- Quick Command: a global deterministic command bar (Ctrl/Cmd+K) that runs the same engines as the graphical tools");
  lines.push("");
  lines.push(`Site URL: ${getSiteUrl()}`);
  lines.push(`Repository: ${site.repositoryUrl}`);
  lines.push(`License: ${site.license} (${site.licenseUrl})`);
  lines.push(`Author: ${site.author}`);
  lines.push("");
  lines.push("## Tools");
  lines.push("");
  lines.push("QuickKit contains exactly eight tools:");
  lines.push("");
  for (const tool of allTools()) {
    lines.push(`${tool.order}. ${tool.name}`);
    lines.push(`   URL: ${absoluteUrl(tool.route)}`);
    lines.push(`   ${tool.tagline}`);
    lines.push("");
  }
  lines.push("## Important Pages");
  lines.push("");
  lines.push(`- Guide (${absoluteUrl("/guide")}): QuickKit Quick Command reference — supported commands, examples, tool capabilities, keyboard shortcut, local/private processing.`);
  lines.push(`- About (${absoluteUrl("/about")}): what QuickKit is, local-first philosophy, offline capability, open-source nature, MIT license, and the developer.`);
  lines.push(`- Privacy (${absoluteUrl("/privacy")}): accurate privacy practices — no account, no backend, no database, calculations happen locally, sensitive transient data is not durably persisted.`);
  lines.push("");
  lines.push("## Privacy / Runtime Characteristics");
  lines.push("");
  lines.push("- All calculations run locally in the browser");
  lines.push("- Sensitive transient data (generated passwords, PINs, QR payloads, raw text content, random choice lists) is held only in memory and is never durably persisted");
  lines.push("- Durable local storage is limited to: theme preference, favorites (tool identities only), Recent Tools (tool identities only, never inputs or results), and haptics preference");
  lines.push("- No operation/calculation history feature exists");
  lines.push("- Offline/PWA: a service worker caches the application shell and tool routes for offline use; no push notifications");
  lines.push("");
  lines.push("## Source");
  lines.push("");
  lines.push(`Source repository: ${site.repositoryUrl}`);
  lines.push(`Licensed under ${site.license}.`);
  lines.push("");
  return lines.join("\n");
}
