/**
 * Percentage & Money — engine. Pure TypeScript. Deterministic, centralized.
 * The graphical UI and the Quick Command bar both call this same code.
 */

export interface DiscountResult {
  ok: boolean;
  original?: number;
  discount?: number;
  final?: number;
  reason?: string;
}

export interface TipResult {
  ok: boolean;
  base?: number;
  tip?: number;
  total?: number;
  reason?: string;
}

export interface ChangeResult {
  ok: boolean;
  from?: number;
  to?: number;
  delta?: number;
  percent?: number;
  direction?: "increase" | "decrease" | "none";
  reason?: string;
}

function isFiniteNum(n: number): boolean {
  return Number.isFinite(n);
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n
    .toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
}

/** percent% of value. */
export function percentOf(percent: number, value: number): { ok: boolean; value?: number; formatted?: string; reason?: string } {
  if (!isFiniteNum(percent) || !isFiniteNum(value)) {
    return { ok: false, reason: "Enter valid numbers." };
  }
  const r = (percent / 100) * value;
  return { ok: true, value: r, formatted: fmt(r) };
}

/** Apply a discount: percent% off price. */
export function discount(price: number, percent: number): DiscountResult {
  if (!isFiniteNum(price) || !isFiniteNum(percent)) {
    return { ok: false, reason: "Enter valid numbers." };
  }
  const saved = round2((percent / 100) * price);
  const final = round2(price - saved);
  return { ok: true, original: price, discount: saved, final };
}

/** Compute a tip: tip% on amount. */
export function tip(amount: number, percent: number): TipResult {
  if (!isFiniteNum(amount) || !isFiniteNum(percent)) {
    return { ok: false, reason: "Enter valid numbers." };
  }
  const t = round2((percent / 100) * amount);
  return { ok: true, base: amount, tip: t, total: round2(amount + t) };
}

/** Percentage change from `from` to `to`. */
export function change(from: number, to: number): ChangeResult {
  if (!isFiniteNum(from) || !isFiniteNum(to)) {
    return { ok: false, reason: "Enter valid numbers." };
  }
  if (from === 0) {
    return { ok: false, reason: "Original cannot be zero for percentage change." };
  }
  const delta = round2(to - from);
  const pct = round2((delta / from) * 100);
  const direction: ChangeResult["direction"] =
    delta > 0 ? "increase" : delta < 0 ? "decrease" : "none";
  return { ok: true, from, to, delta, percent: pct, direction };
}

// ---------- formatting helpers (used by Quick Command + UI) ----------

export function formatPercent(n: number): string {
  return fmt(n) + "%";
}

export function formatMoney(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return "$" + n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export { fmt as formatNumber };
