/**
 * Quick Command — parser. Deterministic, NON-AI.
 *
 * user input → typed intent → executor (real tool engine) → formatted outcome
 *
 * The parser ONLY classifies the input into a typed intent and extracts the
 * relevant payload. It performs NO calculations. All calculations are done by
 * the executor calling the real tool engines.
 */

import type { ParsedIntent, IntentId } from "./types";
import { COMMAND_SPECS } from "./registry";
import { allTools } from "@core/catalog/tools";
import { footerPages } from "@core/catalog/pages";
import type { UnitCategory } from "@tools/unit-converter/types";
import { CATEGORY_DEFS } from "@tools/unit-converter/definitions";

// ---------- helpers ----------

function tryParseNumber(s: string): number | undefined {
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

// ---------- per-intent parsing_delivery ----------

function parseUnitConvert(input: string): ParsedIntent {
  // "10 km to mi"
  const m = input.match(/^([\d.\-]+)\s*([a-zA-Z°²]+)\s+to\s+([a-zA-Z°²]+)$/i);
  if (m) {
    const value = tryParseNumber(m[1]);
    const from = m[2].toLowerCase();
    const to = m[3].toLowerCase();
    const category = inferCategory(from, to);
    if (value !== undefined && category) {
      return { intent: "unit:convert", raw: input, payload: { value, from, to, category } };
    }
  }
  return { intent: "unknown", raw: input };
}

function inferCategory(from: string, to: string): UnitCategory | undefined {
  const f = normalizeUnitId(from);
  const t = normalizeUnitId(to);
  const categories: UnitCategory[] = ["length", "mass", "temperature", "speed", "area", "storage"];
  for (const cat of categories) {
    if (unitInCategory(cat, f) && unitInCategory(cat, t)) {
      return cat;
    }
  }
  return undefined;
}

function unitInCategory(cat: UnitCategory, id: string): boolean {
  const def = CATEGORY_DEFS.find((c) => c.id === cat);
  if (!def) return false;
  // Compare on id, with case-insensitive fold and ° / ² stripping.
  const norm = id.toLowerCase().replace(/°/g, "").replace(/²/g, "2");
  return def.units.some((u) => u.id === norm || u.id.toLowerCase() === norm);
}

function normalizeUnitId(id: string): string {
  return id.toLowerCase().replace(/°/g, "").replace(/²/g, "2").trim();
}

function parsePercent(input: string): ParsedIntent {
  // "20% off 749" / "15% tip on 60" / "18% of 250" / "% change 120 to 90"
  let m = input.match(/^([\d.]+)\s*%\s*off\s+([\d.]+)$/i);
  if (m) {
    const percent = tryParseNumber(m[1]);
    const price = tryParseNumber(m[2]);
    if (percent !== undefined && price !== undefined) {
      return { intent: "percent:calc", raw: input, payload: { op: "discount", percent, price } };
    }
  }
  m = input.match(/^([\d.]+)\s*%\s*tip\s+on\s+([\d.]+)$/i);
  if (m) {
    const percent = tryParseNumber(m[1]);
    const amount = tryParseNumber(m[2]);
    if (percent !== undefined && amount !== undefined) {
      return { intent: "percent:calc", raw: input, payload: { op: "tip", percent, amount } };
    }
  }
  m = input.match(/^(?:what\s+is\s+)?([\d.]+)\s*%\s*of\s+([\d.]+)$/i);
  if (m) {
    const percent = tryParseNumber(m[1]);
    const value = tryParseNumber(m[2]);
    if (percent !== undefined && value !== undefined) {
      return { intent: "percent:calc", raw: input, payload: { op: "percentOf", percent, value } };
    }
  }
  m = input.match(/^%?\s*change\s+([\d.\-]+)\s+to\s+([\d.\-]+)$/i);
  if (m) {
    const from = tryParseNumber(m[1]);
    const to = tryParseNumber(m[2]);
    if (from !== undefined && to !== undefined) {
      return { intent: "percent:calc", raw: input, payload: { op: "change", from, to } };
    }
  }
  return { intent: "unknown", raw: input };
}

function parseQr(input: string): ParsedIntent {
  // "qr <payload>" — strip leading "qr " word.
  const m = input.match(/^qr\s+(.+)$/i);
  if (m) {
    return { intent: "qr:generate", raw: input, payload: { payload: m[1].trim() } };
  }
  return { intent: "unknown", raw: input };
}

function parsePassword(input: string): ParsedIntent {
  // "password 16" / "pin 6" / "password 20 with symbols"
  let m = input.match(/^password\s+(\d+)(\s+with\s+(symbols?|digits?|uppercase?|lowercase?))?(?:\s+(symbols?|digits?|uppercase?|lowercase?))*$/i);
  if (m) {
    const length = parseInt(m[1], 10);
    const withSymbols = /symbols?/i.test(input);
    const withDigits = /digits?/i.test(input);
    const withUpper = /uppercase?/i.test(input);
    const withLower = /lowercase?/i.test(input);
    return {
      intent: "password:generate",
      raw: input,
      payload: {
        length,
        symbols: withSymbols || undefined,
        digits: withDigits || undefined,
        upper: withUpper || undefined,
        lower: withLower || undefined,
      },
    };
  }
  m = input.match(/^pin\s+(\d+)$/i);
  if (m) {
    const length = parseInt(m[1], 10);
    return { intent: "password:generate", raw: input, payload: opPin(length) };
  }
  return { intent: "unknown", raw: input };
}

function opPin(length: number) {
  return { op: "pin", length };
}

function parseDate(input: string): ParsedIntent {
  // "days from 2026-01-01 to 2026-03-14"
  let m = input.match(/^days\s+(?:from|between)\s+(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})$/i);
  if (m) {
    return {
      intent: "date:calc",
      raw: input,
      payload: { op: "diff", from: m[1], to: m[2] },
    };
  }
  // "add 90 days to 2026-05-01"
  m = input.match(/^add\s+(\d+)\s*days?\s+to\s+(\d{4}-\d{2}-\d{2})$/i);
  if (m) {
    return {
      intent: "date:calc",
      raw: input,
      payload: { op: "add", date: m[2], duration: { days: parseInt(m[1], 10) } },
    };
  }
  // "subtract 90 days from 2026-05-01"
  m = input.match(/^subtract\s+(\d+)\s*days?\s+from\s+(\d{4}-\d{2}-\d{2})$/i);
  if (m) {
    return {
      intent: "date:calc",
      raw: input,
      payload: { op: "subtract", date: m[2], duration: { days: parseInt(m[1], 10) } },
    };
  }
  return { intent: "unknown", raw: input };
}

function parseText(input: string): ParsedIntent {
  // "uppercase hello world" / "lowercase ..." / "wordcount ..."
  let m = input.match(/^uppercase\s+(.+)$/i);
  if (m) return { intent: "text:transform", raw: input, payload: { op: "upper", text: m[1] } };
  m = input.match(/^lowercase\s+(.+)$/i);
  if (m) return { intent: "text:transform", raw: input, payload: { op: "lower", text: m[1] } };
  m = input.match(/^title\s*case\s+(.+)$/i);
  if (m) return { intent: "text:transform", raw: input, payload: { op: "title", text: m[1] } };
  m = input.match(/^wordcount\s+(.+)$/i);
  if (m) return { intent: "text:transform", raw: input, payload: { op: "stats", text: m[1] } };
  m = input.match(/^normalize\s+whitespace\s+(.+)$/i);
  if (m) return { intent: "text:transform", raw: input, payload: { op: "collapse", text: m[1] } };
  return { intent: "unknown", raw: input };
}

function parseRandom(input: string): ParsedIntent {
  // "random 1 to 100" / "flip a coin" / "roll 2d6" / "pick from a, b, c"
  let m = input.match(/^random\s+(-?\d+)\s+to\s+(-?\d+)$/i);
  if (m) {
    return { intent: "random:pick", raw: input, payload: { op: "int", min: +m[1], max: +m[2] } };
  }
  m = input.match(/^flip(?:\s+a)?\s*coin$/i);
  if (m) return { intent: "random:pick", raw: input, payload: { op: "coin" } };
  m = input.match(/^roll\s+(\d+)d(\d+)$/i);
  if (m) {
    return { intent: "random:pick", raw: input, payload: { op: "dice", count: +m[1], faces: +m[2] } };
  }
  m = input.match(/^pick\s+from\s+(.+)$/i);
  if (m) {
    return { intent: "random:pick", raw: input, payload: { op: "choice", input: m[1] } };
  }
  return { intent: "unknown", raw: input };
}

function parseColor(input: string): ParsedIntent {
  // "#ff6600 to rgb" / "rgb(...) to hsl" / "hsl(...) to hex"
  let m = input.match(/^(.+?)\s+to\s+(rgb|hsl|hex)$/i);
  if (m) {
    return { intent: "color:convert", raw: input, payload: { input: m[1].trim(), target: m[2].toLowerCase() } };
  }
  // Bare "#ff6600" or "rgb(255,102,0)" → convert to all formats
  if (/^#?[0-9a-fA-F]{3,6}$/.test(input) || /^rgb\s*\(/i.test(input) || /^hsl\s*\(/i.test(input)) {
    return { intent: "color:convert", raw: input, payload: { input: input.trim(), target: null } };
  }
  return { intent: "unknown", raw: input };
}

function parseNavigate(input: string): ParsedIntent {
  // "open <tool>" / "open <page>"
  const m = input.match(/^open\s+(\w[\w-]*)$/i);
  if (m) {
    const target = m[1].toLowerCase();
    const tool = allTools().find((t) => t.shortName.toLowerCase() === target || t.name.toLowerCase().replace(/\s+/g, "") === target);
    if (tool) {
      return { intent: "navigate:tool", raw: input, route: tool.route };
    }
    const page = footerPages().find((p) => p.shortName.toLowerCase() === target);
    if (page) {
      return { intent: "navigate:page", raw: input, route: page.route };
    }
  }
  return { intent: "unknown", raw: input };
}

// ---------- main parser ----------

const PARSERS: Array<(input: string) => ParsedIntent> = [
  parseNavigate,
  parsePercent,
  parsePassword,
  parseQr,
  parseDate,
  parseText,
  parseRandom,
  parseColor,
  parseUnitConvert, // last (broad "to" matcher)
];

export function parse(input: string): ParsedIntent {
  const raw = input.trim();
  if (!raw) return { intent: "unknown", raw };
  for (const p of PARSERS) {
    const result = p(raw);
    if (result.intent !== "unknown") {
      return result;
    }
  }
  return { intent: "unknown", raw };
}

export function intentFromQuery(input: string): IntentId {
  return parse(input).intent;
}

// re-exports for executor
export { COMMAND_SPECS } from "./registry";
export type { ParsedIntent };
