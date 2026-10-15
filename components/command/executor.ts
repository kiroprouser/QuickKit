/**
 * Quick Command — executor. Calls the REAL tool engines. No duplicated
 * calculation implementations. The graphical tool UIs and Quick Command both
 * hit the same code paths.
 *
 * user input → parser → typed intent → executor (real engine) → formatted
 */

import type { ParsedIntent, CommandResult } from "./types";
import { parse } from "./parser";
import * as unitEngine from "@tools/unit-converter/engine";
import * as percentEngine from "@tools/percentage/engine";
import * as qrEngine from "@tools/qr/engine";
import * as passwordEngine from "@tools/password/engine";
import * as dateEngine from "@tools/date/engine";
import * as textEngine from "@tools/text/engine";
import * as randomEngine from "@tools/random/engine";
import * as colorEngine from "@tools/color/engine";
import { getUnit } from "@tools/unit-converter/definitions";
import type { ColorFormat } from "@tools/color/engine";
import type { UnitCategory } from "@tools/unit-converter/types";

/** Execute a parsed intent. */
export function execute(parsed: ParsedIntent): CommandResult {
  switch (parsed.intent) {
    case "unit:convert":
      return execUnit(parsed);
    case "percent:calc":
      return execPercent(parsed);
    case "qr:generate":
      return execQr(parsed);
    case "password:generate":
      return execPassword(parsed);
    case "date:calc":
      return execDate(parsed);
    case "text:transform":
      return execText(parsed);
    case "random:pick":
      return execRandom(parsed);
    case "color:convert":
      return execColor(parsed);
    case "navigate:tool":
    case "navigate:page":
      return { ok: true, title: "Navigate", value: parsed.raw, route: parsed.route };
    case "unknown":
    default:
      return { ok: false, reason: "Unknown command. Type a tool example, e.g. `10 km to mi`." };
  }
}

/** Convenience: parse + execute in one step. */
export function runCommand(input: string): CommandResult {
  const parsed = parse(input);
  return execute(parsed);
}

// ---------- per-intent executors ----------

function execUnit(parsed: ParsedIntent): CommandResult {
  const p = parsed.payload as { value: number; from: string; to: string; category: UnitCategory };
  const result = unitEngine.convert({
    category: p.category,
    value: p.value,
    from: p.from,
    to: p.to,
  });
  if (!result.ok) return { ok: false, reason: result.reason };
  const toUnit = getUnit(p.category, p.to);
  return {
    ok: true,
    title: `${p.value} ${p.from} → ${p.to}`,
    value: `${result.formatted} ${toUnit?.symbol ?? ""}`.trim(),
    description: `${unitEngine.getCategory(p.category).label} conversion`,
  };
}

function execPercent(parsed: ParsedIntent): CommandResult {
  const p = parsed.payload as { op: string; [k: string]: any };
  switch (p.op) {
    case "discount": {
      const r = percentEngine.discount(p.price, p.percent);
      if (!r.ok) return { ok: false, reason: r.reason };
      return {
        ok: true,
        title: `${p.percent}% off ${percentEngine.formatMoney(p.price)}`,
        value: percentEngine.formatMoney(r.final!) + " (save " + percentEngine.formatMoney(r.discount!) + ")",
        description: "Discount",
      };
    }
    case "tip": {
      const r = percentEngine.tip(p.amount, p.percent);
      if (!r.ok) return { ok: false, reason: r.reason };
      return {
        ok: true,
        title: `${p.percent}% tip on ${percentEngine.formatMoney(p.amount)}`,
        value: `${percentEngine.formatMoney(r.tip!)} tip (${percentEngine.formatMoney(r.total!)} total)`,
        description: "Tip",
      };
    }
    case "percentOf": {
      const r = percentEngine.percentOf(p.percent, p.value);
      if (!r.ok) return { ok: false, reason: r.reason };
      return {
        ok: true,
        title: `${p.percent}% of ${percentEngine.formatNumber(p.value)}`,
        value: r.formatted!,
        description: "Percent of",
      };
    }
    case "change": {
      const r = percentEngine.change(p.from, p.to);
      if (!r.ok) return { ok: false, reason: r.reason };
      const sign = r.direction === "increase" ? "+" : r.direction === "decrease" ? "−" : "";
      return {
        ok: true,
        title: `${percentEngine.formatNumber(p.from)} → ${percentEngine.formatNumber(p.to)}`,
        value: `${sign}${percentEngine.formatNumber(r.percent!)}% (${r.direction})`,
        description: "Percentage change",
      };
    }
  }
  return { ok: false, reason: "Could not parse percentage command." };
}

function execQr(parsed: ParsedIntent): CommandResult {
  const p = parsed.payload as { payload: string };
  // QR generation is async (canvas). Return a deferred marker; the surface
  // itself will call generateQr directly when it sees this intent.
  return {
    ok: true,
    title: `QR — ${p.payload.length > 40 ? p.payload.slice(0, 40) + "…" : p.payload}`,
    value: "Generate QR",
    description: "Open the QR Generator to render this payload locally.",
  };
}

/** qrExecuteAsync — surfaces use this to actually render a QR. */
export async function qrExecuteAsync(parsed: ParsedIntent): Promise<CommandResult> {
  if (parsed.intent !== "qr:generate") return execute(parsed);
  const p = parsed.payload as { payload: string };
  const result = await qrEngine.generateQr(p.payload);
  if (!result.ok) return { ok: false, reason: result.reason };
  return {
    ok: true,
    title: `QR — ${p.payload.length > 40 ? p.payload.slice(0, 40) + "…" : p.payload}`,
    value: "Generated locally",
    description: "Open the QR Generator to download the result.",
  };
}

function execPassword(parsed: ParsedIntent): CommandResult {
  const p = parsed.payload as { op?: "pin"; length: number; symbols?: boolean; digits?: boolean; upper?: boolean; lower?: boolean };
  if (p.op === "pin") {
    const pin = passwordEngine.generatePin(p.length);
    return {
      ok: true,
      title: `PIN (${p.length} digits)`,
      value: pin,
      description: "Generated with browser cryptographic randomness. Not persisted.",
    };
  }
  const opts = {
    length: p.length,
    lower: p.lower ?? true,
    upper: p.upper ?? true,
    digits: p.digits ?? true,
    symbols: p.symbols ?? true,
    excludeAmbiguous: false,
  };
  const pw = passwordEngine.generatePassword(opts);
  const strength = passwordEngine.estimateStrength(pw);
  return {
    ok: true,
    title: `Password (${p.length} chars)`,
    value: pw,
    description: `${strength.bits} bits — ${strength.label}`,
  };
}

function execDate(parsed: ParsedIntent): CommandResult {
  const p = parsed.payload as { op: string; [k: string]: any };
  switch (p.op) {
    case "diff": {
      const r = dateEngine.diff(p.from, p.to);
      if (!r.ok) return { ok: false, reason: r.reason };
      return {
        ok: true,
        title: `${p.from} → ${p.to}`,
        value: `${r.days} days`,
        description: r.human,
      };
    }
    case "add":
    case "subtract": {
      const r = p.op === "add"
        ? dateEngine.add(p.date, p.duration)
        : dateEngine.subtract(p.date, p.duration);
      if (!r.ok) return { ok: false, reason: r.reason };
      return {
        ok: true,
        title: `${p.op === "add" ? "Add" : "Subtract"} ${JSON.stringify(p.duration)} ${p.op === "add" ? "to" : "from"} ${p.date}`,
        value: r.date!,
        description: "Calendar-correct result",
      };
    }
  }
  return { ok: false, reason: "Could not parse date command." };
}

function execText(parsed: ParsedIntent): CommandResult {
  const p = parsed.payload as { op: string; text: string };
  if (p.op === "stats") {
    const s = textEngine.stats(p.text);
    return {
      ok: true,
      title: `Stats — ${p.text.length > 40 ? p.text.slice(0, 40) + "…" : p.text}`,
      value: `${s.words} words · ${s.characters} chars · ${s.lines} lines`,
      description: "Text statistics",
    };
  }
  const ops: Record<string, textEngine.TransformOp> = {
    upper: "upper",
    lower: "lower",
    title: "title",
    collapse: "collapse",
  };
  const out = textEngine.transform(p.text, ops[p.op] ?? "upper");
  return {
    ok: true,
    title: `${p.op} — ${p.text.length > 30 ? p.text.slice(0, 30) + "…" : p.text}`,
    value: out,
    description: "Text transformation",
  };
}

function execRandom(parsed: ParsedIntent): CommandResult {
  const p = parsed.payload as { op: string; [k: string]: any };
  switch (p.op) {
    case "int": {
      const v = randomEngine.randomInteger(p.min, p.max);
      return { ok: true, title: `Random [${p.min}–${p.max}]`, value: String(v) };
    }
    case "coin": {
      const v = randomEngine.flipCoin();
      return { ok: true, title: "Coin flip", value: v.charAt(0).toUpperCase() + v.slice(1) };
    }
    case "dice": {
      const r = randomEngine.rollDice(p.count, p.faces);
      return {
        ok: true,
        title: `${p.count}d${p.faces}`,
        value: r.rolls.join(" + ") + " = " + r.total,
      };
    }
    case "choice": {
      const r = randomEngine.pickFromList(p.input);
      if (!r.ok) return { ok: false, reason: r.reason };
      return { ok: true, title: "Random pick", value: r.value! };
    }
  }
  return { ok: false, reason: "Could not parse random command." };
}

function execColor(parsed: ParsedIntent): CommandResult {
  const p = parsed.payload as { input: string; target: ColorFormat | null };
  const parsedColor = colorEngine.parseColor(p.input);
  if (!parsedColor) return { ok: false, reason: "Could not parse a HEX, RGB, or HSL color." };
  if (p.target) {
    const v = colorEngine.format(parsedColor.rgb, p.target);
    return { ok: true, title: `${p.input} → ${p.target}`, value: v };
  }
  // No explicit target → show all three.
  const hex = colorEngine.formatHex(parsedColor.rgb);
  const rgb = colorEngine.formatRgb(parsedColor.rgb);
  const hsl = colorEngine.formatHsl(parsedColor.rgb);
  return {
    ok: true,
    title: "Color",
    value: hex,
    description: `${rgb} · ${hsl}`,
  };
}
