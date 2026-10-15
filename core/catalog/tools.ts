/**
 * QuickKit canonical tool catalog.
 *
 * ONE authoritative source of truth for the eight tools. Drives:
 * - Home (ranked)
 * - Header Tools menu (canonical order, NOT personalized)
 * - Footer (tools list)
 * - Guide (commands + capabilities)
 * - Quick Command (aliases + intents)
 * - Route resolution (path → ToolId)
 * - Related tool recommendations
 * - SEO metadata, sitemap, llms.txt
 *
 * Never create a second array containing the eight tools anywhere else.
 */

import type { LucideIcon } from "lucide-react";
import {
  Ruler,
  Percent,
  QrCode,
  KeyRound,
  CalendarDays,
  Type,
  Dices,
  Palette,
} from "lucide-react";

export const TOOL_IDS = [
  "unit-converter",
  "percentage",
  "qr",
  "password",
  "date",
  "text",
  "random",
  "color",
] as const;

export type ToolId = (typeof TOOL_IDS)[number];

export interface ToolExample {
  label: string;
  input: string;
  result: string;
}

export interface ToolCatalogEntry {
  /** Canonical id. */
  id: ToolId;
  /** Absolute route path (no trailing slash). */
  route: string;
  /** Display name. */
  name: string;
  /** Compact name (header/footer/mobile). */
  shortName: string;
  /** One-line tagline. */
  tagline: string;
  /** Longer description (1–3 sentences) for SEO + tool page intro. */
  description: string;
  /** Lucide icon component. */
  icon: LucideIcon;
  /** Canonical catalog position (1-based). */
  order: number;
  /** Quick Command aliases / search keywords. */
  aliases: string[];
  /** Quick Command intent id. */
  intent: string;
  /** Example Quick Command inputs (data-driven Guide). */
  commandExamples: string[];
  /** Visible tool-page examples. */
  examples: ToolExample[];
  /** SEO title (page-specific). */
  seoTitle: string;
  /** SEO meta description (~150–160 chars). */
  seoDescription: string;
  /** Visible H1 on the tool page. */
  h1: string;
  /** Visible static contextual content sections for SEO + humans. */
  contentSections: { heading: string; body: string }[];
  /** Local/privacy note shown on the tool page. */
  privacyNote: string;
  /** Related tool ids (for cross-linking). */
  relatedToolIds: ToolId[];
}

export const TOOL_CATALOG: readonly ToolCatalogEntry[] = [
  {
    id: "unit-converter",
    route: "/tools/unit-converter",
    name: "Unit Converter",
    shortName: "Units",
    tagline: "Length, mass, temperature, speed, area, and digital storage.",
    description:
      "Convert between common units for length, mass, temperature, speed, area, and digital storage. All math runs locally in your browser — nothing is sent to a server.",
    icon: Ruler,
    order: 1,
    aliases: ["convert", "units", "km to mi", "length", "mass", "temperature", "kg to lb"],
    intent: "unit:convert",
    commandExamples: ["10 km to mi", "1.8 m to ft", "100 kg to lb", "0 C to F", "1 GB to MB"],
    examples: [
      { label: "Kilometers to miles", input: "10 km", result: "6.2137 mi" },
      { label: "Celsius to Fahrenheit", input: "0 °C", result: "32 °F" },
      { label: "Kilograms to pounds", input: "100 kg", result: "220.46 lb" },
    ],
    seoTitle: "Unit Converter — Length, Mass, Temperature, Speed, Area, Storage | QuickKit",
    seoDescription:
      "Free online unit converter for length, mass, temperature, speed, area, and digital storage. Local-first: every conversion runs in your browser. No account, no tracking.",
    h1: "Unit Converter",
    contentSections: [
      {
        heading: "What it does",
        body: "QuickKit Unit Converter translates values between common measurement units across six categories: length, mass, temperature, speed, area, and digital storage. Type a value, pick the source and target units, and the converted result appears instantly.",
      },
      {
        heading: "When you need it",
        body: "Cooking with a recipe from another country, planning a run while traveling, sizing a hard drive, or converting a temperature from Celsius to Fahrenheit — Unit Converter handles everyday measurement conversions without forcing you to hunt down a formula.",
      },
      {
        heading: "How it works locally",
        body: "Every conversion is computed by a pure TypeScript engine running entirely in your browser. No value you convert is sent to a server, stored in a database, or attached to an account. Digital storage uses decimal SI semantics (1 GB = 1,000,000,000 bytes) for everyday readability.",
      },
    ],
    privacyNote:
      "All conversions happen in your browser. No value you enter is sent to a server or persisted anywhere.",
    relatedToolIds: ["percentage", "color", "date"],
  },
  {
    id: "percentage",
    route: "/tools/percentage",
    name: "Percentage & Money",
    shortName: "Percentage",
    tagline: "Percent of, discounts, tips, and percentage change.",
    description:
      "Calculate percentage of a number, discounts, tips, and percentage change between two values. Deterministic, centralized math — the same engine powers the Quick Command bar.",
    icon: Percent,
    order: 2,
    aliases: ["percent", "discount", "tip", "percentage change", "increase", "decrease"],
    intent: "percent:calc",
    commandExamples: ["20% off 749", "15% tip on 60", "what is 18% of 250", "% change 120 to 90"],
    examples: [
      { label: "Discount", input: "20% off $749", result: "$599.20 (save $149.80)" },
      { label: "Tip", input: "15% tip on $60", result: "$9.00 tip ($69.00 total)" },
      { label: "Percent of", input: "18% of 250", result: "45" },
      { label: "Percentage change", input: "120 → 90", result: "−25% (decrease)" },
    ],
    seoTitle: "Percentage & Money Calculator — Discounts, Tips, Change | QuickKit",
    seoDescription:
      "Calculate percentage of a number, discounts, tips, and percentage change. Local-first, deterministic math. Same engine powers QuickKit Quick Command. No tracking.",
    h1: "Percentage & Money",
    contentSections: [
      {
        heading: "What it does",
        body: "Percentage & Money handles the four most common everyday percentage calculations: percent of a number, discounts, tips, and percentage change between two values.",
      },
      {
        heading: "When you need it",
        body: "Discount shopping, tipping at a restaurant, comparing two prices, or working out how much something grew or shrank — Percentage & Money gives the answer immediately and deterministically.",
      },
      {
        heading: "How it works locally",
        body: "All calculations run in a centralized TypeScript engine. The graphical tool on this page and the global Quick Command bar call the exact same calculation code — there is no duplicated logic to drift out of sync. Nothing you type leaves your browser.",
      },
    ],
    privacyNote:
      "Calculations run locally in a centralized engine. No input or result is sent to a server or stored in a database.",
    relatedToolIds: ["unit-converter", "date", "random"],
  },
  {
    id: "qr",
    route: "/tools/qr",
    name: "QR Generator",
    shortName: "QR",
    tagline: "Generate QR codes locally for text and URLs.",
    description:
      "Create QR codes for text or URLs entirely in your browser. No payload is ever sent to a server. Download as PNG or SVG.",
    icon: QrCode,
    order: 3,
    aliases: ["qr code", "qrcode", "generate qr", "url to qr"],
    intent: "qr:generate",
    commandExamples: ["qr https://quickkit-59o.pages.dev", "qr Hello world"],
    examples: [
      { label: "URL", input: "https://quickkit-59o.pages.dev", result: "Scannable QR linking to the URL" },
      { label: "Text", input: "Hello world", result: "Scannable QR encoding the text" },
    ],
    seoTitle: "QR Code Generator — Local, Private, PNG & SVG | QuickKit",
    seoDescription:
      "Generate QR codes for text or URLs entirely in your browser. No payload is sent to a server. Download as PNG or SVG. Local-first and free.",
    h1: "QR Generator",
    contentSections: [
      {
        heading: "What it does",
        body: "QR Generator turns any text or URL into a scannable QR code. Choose size and error-correction level, then download the result as a PNG or SVG image.",
      },
      {
        heading: "When you need it",
        body: "Share a link from a laptop to a phone, label a printed document with a scannable URL, or encode short contact-like text for a quick handoff — without depending on a third-party QR service that might log your payload.",
      },
      {
        heading: "How it works locally",
        body: "The QR is generated by a client-side library running inside your browser. The text or URL you encode never leaves your device — there is no backend, no logging service, and no account. Your payload is not durably persisted.",
      },
    ],
    privacyNote:
      "QR codes are generated entirely in your browser. The text or URL you encode is never sent to a server or persisted.",
    relatedToolIds: ["text", "password", "color"],
  },
  {
    id: "password",
    route: "/tools/password",
    name: "Password & PIN",
    shortName: "Password",
    tagline: "Cryptographically secure passwords and PINs, never saved.",
    description:
      "Generate strong passwords and numeric PINs using browser cryptographic randomness. Choose length, character categories, and PIN digit count. Generated values are never durably persisted.",
    icon: KeyRound,
    order: 4,
    aliases: ["password", "pin", "random password", "secure password", "passcode"],
    intent: "password:generate",
    commandExamples: ["password 16", "pin 6", "password 20 with symbols"],
    examples: [
      { label: "Strong password", input: "16 chars, letters + digits + symbols", result: "e.g. 7K$qB9!r… (16 chars)" },
      { label: "Numeric PIN", input: "6 digits", result: "e.g. 419207" },
    ],
    seoTitle: "Password & PIN Generator — Cryptographic, Local, Never Saved | QuickKit",
    seoDescription:
      "Generate strong passwords and numeric PINs using browser cryptographic randomness. Nothing is stored or sent anywhere. Free and local-first.",
    h1: "Password & PIN Generator",
    contentSections: [
      {
        heading: "What it does",
        body: "Password & PIN Generator produces strong passwords and numeric PINs using the browser's cryptographically secure random source (window.crypto.getRandomValues). Pick the length, choose character categories, or generate a numeric PIN of any digit count.",
      },
      {
        heading: "When you need it",
        body: "Creating a new account, rotating a leaked password, setting a phone PIN, or generating a one-time code — anytime you need an unpredictable secret without trusting an online generator.",
      },
      {
        heading: "How it works locally",
        body: "All randomness comes from your browser's CSPRNG. Generated values live only in memory and are never written to localStorage, never sent to a server, and never attached to an account. Closing the tab or reloading the page clears the in-memory value.",
      },
    ],
    privacyNote:
      "Generated passwords and PINs use browser cryptographic randomness and exist only in memory. They are never durably persisted or sent anywhere.",
    relatedToolIds: ["random", "qr", "text"],
  },
  {
    id: "date",
    route: "/tools/date",
    name: "Date Calculator",
    shortName: "Date",
    tagline: "Difference between dates, add and subtract durations.",
    description:
      "Calculate the difference between two dates, or add/subtract a duration from a date. Calendar-correct (months and years, not just days).",
    icon: CalendarDays,
    order: 5,
    aliases: ["date", "days between", "date difference", "add days", "subtract days", "calendar"],
    intent: "date:calc",
    commandExamples: ["days from 2026-01-01 to 2026-03-14", "add 90 days to 2026-05-01"],
    examples: [
      { label: "Difference", input: "2026-01-01 → 2026-03-14", result: "72 days (2 months 13 days)" },
      { label: "Add duration", input: "2026-05-01 + 90 days", result: "2026-07-30" },
    ],
    seoTitle: "Date Calculator — Difference, Add & Subtract Durations | QuickKit",
    seoDescription:
      "Calculate the difference between two dates, or add/subtract a duration from a date. Calendar-correct, local-first, free. No tracking.",
    h1: "Date Calculator",
    contentSections: [
      {
        heading: "What it does",
        body: "Date Calculator computes the difference between two dates (in days, weeks, months, and years), and lets you add or subtract a duration from a date while respecting calendar semantics — adding a month to January 31 lands on February 28 (or 29 in a leap year), not on March 3.",
      },
      {
        heading: "When you need it",
        body: "Planning a project deadline, counting down to a trip, calculating an eligibility window, or working out a renewal date — Date Calculator gives you an exact answer without spreadsheet gymnastics.",
      },
      {
        heading: "How it works locally",
        body: "All date math is performed by a pure TypeScript engine that runs in your browser. No date you enter is sent to a server or stored in a database. The same engine powers the Quick Command bar.",
      },
    ],
    privacyNote:
      "Date math runs locally in a pure TypeScript engine. No date you enter is sent to a server or persisted.",
    relatedToolIds: ["unit-converter", "percentage", "text"],
  },
  {
    id: "text",
    route: "/tools/text",
    name: "Text Tools",
    shortName: "Text",
    tagline: "Word, character, and line counts; case and whitespace fixes.",
    description:
      "Count words, characters, and lines; transform case (upper, lower, title, sentence); normalize whitespace. Raw text is never durably persisted.",
    icon: Type,
    order: 6,
    aliases: ["text", "word count", "character count", "case", "uppercase", "lowercase", "whitespace"],
    intent: "text:transform",
    commandExamples: ["uppercase hello world", "wordcount the quick brown 1234567"],
    examples: [
      { label: "Word count", input: "the quick brown fox", result: "4 words, 19 characters" },
      { label: "Uppercase", input: "hello world", result: "HELLO WORLD" },
      { label: "Normalize whitespace", input: "  hello   world  ", result: "hello world" },
    ],
    seoTitle: "Text Tools — Word & Character Count, Case, Whitespace | QuickKit",
    seoDescription:
      "Count words, characters, and lines; transform case; normalize whitespace. Local-first, free. Your text never leaves the browser.",
    h1: "Text Tools",
    contentSections: [
      {
        heading: "What it does",
        body: "Text Tools gives you instant word, character, and line counts, plus case transformations (UPPERCASE, lowercase, Title Case, Sentence case) and whitespace normalization (trim, collapse repeated spaces, normalize line endings).",
      },
      {
        heading: "When you need it",
        body: "Hitting a word-count limit, pasting messy text from a PDF, cleaning up indentation, or preparing a string for code — Text Tools handles the small everyday text chores without opening a full editor.",
      },
      {
        heading: "How it works locally",
        body: "All transformations run in a pure TypeScript engine inside your browser. The text you paste is held only in memory (so navigating away and back preserves your working session) and is never durably persisted or sent to a server.",
      },
    ],
    privacyNote:
      "Your text is held only in memory. It is never durably persisted or sent to a server.",
    relatedToolIds: ["qr", "password", "color"],
  },
  {
    id: "random",
    route: "/tools/random",
    name: "Random Picker",
    shortName: "Random",
    tagline: "Random integers, choices, coin flips, and dice.",
    description:
      "Pick a random integer, choose a random item from a list, flip a coin, or roll dice — using unbiased cryptographic randomness where appropriate.",
    icon: Dices,
    order: 7,
    aliases: ["random", "random number", "coin flip", "dice", "pick", "choice"],
    intent: "random:pick",
    commandExamples: ["random 1 to 100", "flip a coin", "roll 2d6", "pick from apple, banana, cherry"],
    examples: [
      { label: "Integer", input: "1 to 100", result: "e.g. 73" },
      { label: "Coin flip", input: "—", result: "Heads or Tails" },
      { label: "Dice", input: "2d6", result: "e.g. 4 + 5 = 9" },
    ],
    seoTitle: "Random Picker — Integers, Choices, Coin, Dice | QuickKit",
    seoDescription:
      "Pick a random integer, choose from a list, flip a coin, or roll dice using cryptographic randomness. Local-first, free, no tracking.",
    h1: "Random Picker",
    contentSections: [
      {
        heading: "What it does",
        body: "Random Picker gives you four unbiased random utilities in one place: a random integer within a range, a random choice from a comma-separated list, a coin flip, and dice rolls (any count and any face count).",
      },
      {
        heading: "When you need it",
        body: "Deciding who goes first, settling a tie, picking a winner from a small list, running a tabletop dice roll, or generating an unbiased sample — Random Picker gives an immediate, trustworthy result.",
      },
      {
        heading: "How it works locally",
        body: "Randomness comes from your browser's cryptographic source (window.crypto.getRandomValues) and is rendered unbiased by rejection sampling where the natural range does not divide evenly into the target space. No list you enter is durably persisted or sent to a server.",
      },
    ],
    privacyNote:
      "Random values use browser cryptographic randomness. Choice lists are held only in memory and never persisted or sent to a server.",
    relatedToolIds: ["password", "percentage", "unit-converter"],
  },
  {
    id: "color",
    route: "/tools/color",
    name: "Color Converter",
    shortName: "Color",
    tagline: "HEX, RGB, HSL — bidirectional, with a live preview.",
    description:
      "Convert colors bidirectionally between HEX, RGB, and HSL with a useful live preview. The same engine powers the Quick Command bar.",
    icon: Palette,
    order: 8,
    aliases: ["color", "hex", "rgb", "hsl", "color converter", "hex to rgb", "rgb to hsl"],
    intent: "color:convert",
    commandExamples: ["#ff6600 to rgb", "rgb(255,102,0) to hsl", "hsl(20,100%,50%) to hex"],
    examples: [
      { label: "HEX → RGB", input: "#ff6600", result: "rgb(255, 102, 0)" },
      { label: "RGB → HSL", input: "rgb(255, 102, 0)", result: "hsl(24, 100%, 50%)" },
      { label: "HSL → HEX", input: "hsl(24, 100%, 50%)", result: "#ff6600" },
    ],
    seoTitle: "Color Converter — HEX, RGB, HSL, Live Preview | QuickKit",
    seoDescription:
      "Convert colors bidirectionally between HEX, RGB, and HSL with a live preview. Local-first, free. Same engine powers QuickKit Quick Command.",
    h1: "Color Converter",
    contentSections: [
      {
        heading: "What it does",
        body: "Color Converter translates a color between HEX, RGB, and HSL representations in either direction. A large live preview shows the color you are working with at all times.",
      },
      {
        heading: "When you need it",
        body: "Picking a CSS color, copying a value from a design tool, switching a HEX swatch into HSL to tweak hue, or matching an accessibility contrast target — Color Converter is the small everyday bridge between color formats.",
      },
      {
        heading: "How it works locally",
        body: "All conversions are computed by a pure TypeScript engine. The graphical tool on this page and the global Quick Command bar call the same code — no duplicated color logic. Your input is not sent anywhere or persisted.",
      },
    ],
    privacyNote:
      "Color math runs locally in a pure TypeScript engine. No value you enter is sent to a server or persisted.",
    relatedToolIds: ["qr", "text", "unit-converter"],
  },
];

// ---------- lookup helpers (single source of truth) ----------

const TOOL_BY_ID: Readonly<Record<ToolId, ToolCatalogEntry>> = Object.fromEntries(
  TOOL_CATALOG.map((t) => [t.id, t]),
) as Readonly<Record<ToolId, ToolCatalogEntry>>;

/** Get a tool entry by id. Throws if unknown (defensive — catalog is closed). */
export function getTool(id: ToolId): ToolCatalogEntry {
  const t = TOOL_BY_ID[id];
  if (!t) throw new Error(`Unknown tool id: ${id}`);
  return t;
}

/** Maybe get a tool entry by id. */
export function maybeGetTool(id: string): ToolCatalogEntry | undefined {
  return (TOOL_BY_ID as Record<string, ToolCatalogEntry>)[id];
}

/** Resolve a tool by its route path. */
export function getToolByRoute(path: string): ToolCatalogEntry | undefined {
  return TOOL_CATALOG.find((t) => t.route === path);
}

/** All tools in canonical catalog order (NOT personalized). */
export function allTools(): readonly ToolCatalogEntry[] {
  return TOOL_CATALOG;
}

/** Tools in canonical order, excluding a given id (for related-tool lists). */
export function toolsExcept(id: ToolId): readonly ToolCatalogEntry[] {
  return TOOL_CATALOG.filter((t) => t.id !== id);
}

/** Resolve a route path to a ToolId, or undefined if not a tool route. */
export function routeToToolId(pathname: string): ToolId | undefined {
  const tool = getToolByRoute(pathname);
  return tool?.id;
}
