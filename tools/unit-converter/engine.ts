/**
 * Unit Converter — engine. Pure TypeScript.
 * Knows nothing about React, Next.js, persistence, or viewport.
 *
 * Temperature uses offset math (Celsius is the base). All other categories use
 * multiplicative factors (1 unit = factor * base units).
 *
 * Digital storage uses decimal SI semantics (1 GB = 1,000,000,000 bytes).
 */

import type { ConversionInput, ConversionResult, UnitCategory } from "./types";
import { getCategory, getUnit, CATEGORY_DEFS } from "./definitions";

// ---------- temperature (offset math, base = Celsius) ----------

function toCelsius(value: number, fromId: string): number {
  if (fromId === "c") return value;
  if (fromId === "f") return (value - 32) * (5 / 9);
  if (fromId === "k") return value - 273.15;
  return value;
}

function fromCelsius(c: number, toId: string): number {
  if (toId === "c") return c;
  if (toId === "f") return c * (9 / 5) + 32;
  if (toId === "k") return c + 273.15;
  return c;
}

function convertTemperature(value: number, fromId: string, toId: string): number {
  return fromCelsius(toCelsius(value, fromId), toId);
}

// ---------- formatting ----------

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "—";
  // Trim trailing zeros for readability, keep up to 6 significant digits.
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 0.0001 || abs >= 1_000_000)) {
    return n.toExponential(4).replace(/\.?0+e/, "e");
  }
  // 4 decimal places max, trim trailing zeros.
  const fixed = n.toFixed(4);
  const trimmed = fixed.replace(/\.?0+$/, "");
  return trimmed === "" ? "0" : trimmed;
}

// ---------- main API ----------

/** Convert a value within a category. */
export function convert(input: ConversionInput): ConversionResult {
  const { category, value, from, to } = input;
  if (!Number.isFinite(value)) {
    return { ok: false, reason: "Enter a valid number." };
  }
  const fromUnit = getUnit(category, from);
  const toUnit = getUnit(category, to);
  if (!fromUnit || !toUnit) {
    return { ok: false, reason: "Unknown unit." };
  }
  if (from === to) {
    return { ok: true, value, formatted: formatNumber(value) };
  }
  let result: number;
  if (category === "temperature") {
    result = convertTemperature(value, from, to);
  } else {
    // value_in_base = value * fromUnit.factor
    // value_in_target = value_in_base / toUnit.factor
    result = (value * fromUnit.factor) / toUnit.factor;
  }
  return { ok: true, value: result, formatted: formatNumber(result) };
}

/** Convenience: format with the target unit's symbol. */
export function convertAndLabel(input: ConversionInput): string {
  const r = convert(input);
  if (!r.ok) return r.reason ?? "—";
  const u = getUnit(input.category, input.to);
  return `${r.formatted} ${u?.symbol ?? ""}`.trim();
}

/** All categories (for UI rendering). */
export function categories(): readonly { id: UnitCategory; label: string }[] {
  return CATEGORY_DEFS.map((c) => ({ id: c.id, label: c.label }));
}

// re-export for engine consumers (Quick Command, UI)
export { getCategory, getUnit, CATEGORY_DEFS } from "./definitions";
