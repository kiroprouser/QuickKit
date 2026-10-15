/**
 * Quick Command — registry. The deterministic, NON-AI contract for every
 * supported command. Drives the parser, suggestions, and the data-driven
 * Guide. No independent calculation implementations — the executor calls the
 * real tool engines.
 */

import type { CommandSpec, IntentId, SuggestionEntry } from "./types";
import { allTools } from "@core/catalog/tools";
import { footerPages } from "@core/catalog/pages";

export const COMMAND_SPECS: readonly CommandSpec[] = [
  {
    intent: "unit:convert",
    triggers: [
      /\bto\b/i,            // "10 km to mi"
      /\bkm\b/i, /\bmi\b/i, /\bkg\b/i, /\blb\b/i, /\b°?[cCfFkK]\b/, /\bmph\b/i, /\bkph\b/i, /\bgb\b/i, /\bmb\b/i,
    ],
    summary: "Convert units: length, mass, temperature, speed, area, digital storage.",
    examples: [
      "10 km to mi",
      "1.8 m to ft",
      "100 kg to lb",
      "0 C to F",
      "1 GB to MB",
    ],
    category: "tools",
  },
  {
    intent: "percent:calc",
    triggers: [
      /\d+\s*%\s*off/i, /\d+\s*%\s*tip/i, /\d+\s*%\s*of\b/i, /%?\s*change/i, /%?\s*increase/i, /%?\s*decrease/i, /percent\s*of/i,
    ],
    summary: "Percentage of a number, discounts, tips, and percentage change.",
    examples: [
      "20% off 749",
      "15% tip on 60",
      "18% of 250",
      "% change 120 to 90",
    ],
    category: "tools",
  },
  {
    intent: "qr:generate",
    triggers: [/\bqr\b/i, /^qr\s+/i],
    summary: "Generate a QR code locally for text or a URL.",
    examples: [
      "qr https://quickkit-59o.pages.dev",
      "qr Hello world",
    ],
    category: "tools",
  },
  {
    intent: "password:generate",
    triggers: [/\bpassword\b/i, /\bpwd\b/i, /\bpwd?\b/i, /\bpin\b/i],
    summary: "Generate a cryptographically secure password or numeric PIN.",
    examples: [
      "password 16",
      "pin 6",
      "password 20 with symbols",
    ],
    category: "tools",
  },
  {
    intent: "date:calc",
    triggers: [/\bdays?\s*(from|between|to)\b/i, /\badd\s+\d+\s*days?\b/i, /\bsubtract\s+\d+\s*days?\b/i],
    summary: "Date difference, add and subtract durations.",
    examples: [
      "days from 2026-01-01 to 2026-03-14",
      "add 90 days to 2026-05-01",
    ],
    category: "tools",
  },
  {
    intent: "text:transform",
    triggers: [/\buppercase\b/i, /\blowercase\b/i, /\btitle\s*case\b/i, /\bword\s*count\b/i, /\bcharacter\s*count\b/i, /\bnormalize\s*whitespace\b/i],
    summary: "Word/character count, case transforms, whitespace fixes.",
    examples: [
      "uppercase hello world",
      "wordcount the quick brown fox",
      "normalize whitespace   hello   world",
    ],
    category: "tools",
  },
  {
    intent: "random:pick",
    triggers: [/\brandom\b/i, /\bflip(?:\s+a)?\s*coin\b/i, /\broll\b/i, /\bdice\b/i, /\bpick\s*from\b/i, /\bd[0-9]+\b/i],
    summary: "Random integer, choice from a list, coin flip, dice.",
    examples: [
      "random 1 to 100",
      "flip a coin",
      "roll 2d6",
      "pick from apple, banana, cherry",
    ],
    category: "tools",
  },
  {
    intent: "color:convert",
    triggers: [/^#?[0-9a-fA-F]{3,6}\b/, /\brgb\s*\(/i, /\bhsl\s*\(/i, /\bhex\b/i, /\bto\s*(rgb|hsl|hex)\b/i],
    summary: "Convert colors between HEX, RGB, and HSL.",
    examples: [
      "#ff6600 to rgb",
      "rgb(255,102,0) to hsl",
      "hsl(24,100%,50%) to hex",
    ],
    category: "tools",
  },
];

export function specsForIntent(intent: IntentId): CommandSpec | undefined {
  return COMMAND_SPECS.find((s) => s.intent === intent);
}

/** All suggestions — used by the Quick Command surface when input is empty. */
export function allSuggestions(): SuggestionEntry[] {
  const toolSuggestions: SuggestionEntry[] = COMMAND_SPECS.map((s) => ({
    intent: s.intent,
    label: s.intent.split(":")[1] || s.intent,
    example: s.examples[0],
    summary: s.summary,
  }));
  // Navigate-to-tool suggestions
  const navSuggestions: SuggestionEntry[] = allTools().map((t) => ({
    intent: "navigate:tool" as IntentId,
    label: `open ${t.shortName.toLowerCase()}`,
    example: `open ${t.shortName.toLowerCase()}`,
    summary: `Open the ${t.name}.`,
  }));
  // Navigate-to-page suggestions
  const pageSuggestions: SuggestionEntry[] = footerPages().map((p) => ({
    intent: "navigate:page" as IntentId,
    label: `open ${p.shortName.toLowerCase()}`,
    example: `open ${p.shortName.toLowerCase()}`,
    summary: `Open the ${p.name} page.`,
  }));
  return [...toolSuggestions, ...navSuggestions, ...pageSuggestions];
}
