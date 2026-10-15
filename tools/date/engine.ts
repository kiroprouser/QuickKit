/**
 * Date Calculator — engine. Pure TypeScript.
 * Calendar-correct: adding a month to January 31 lands on February 28 (or 29
 * in a leap year), not on March 3.
 *
 * No external date library — all calendar math is in this file.
 */

export type DateISO = string; // YYYY-MM-DD

export interface DateDuration {
  days?: number;
  weeks?: number;
  months?: number;
  years?: number;
}

export interface DateDiff {
  ok: boolean;
  /** Total full days between the two dates. */
  days?: number;
  /** Total full weeks. */
  weeks?: number;
  /** Calendar-component breakdown (signed). */
  months?: number;
  years?: number;
  /** Human-friendly summary, e.g. "2 months 13 days". */
  human?: string;
  reason?: string;
}

export interface DateAddResult {
  ok: boolean;
  date?: DateISO;
  reason?: string;
}

// ---------- validation ----------

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidISO(s: string): boolean {
  if (!ISO_RE.test(s)) return false;
  const [, y, m, d] = s.match(ISO_RE)!;
  return isValidDate(+y, +m, +d);
}

export function isValidDate(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > daysInMonth(y, m)) return false;
  return true;
}

export function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(y: number, m: number): number {
  if (m === 2) return isLeapYear(y) ? 29 : 28;
  if ([4, 6, 9, 11].includes(m)) return 30;
  return 31;
}

// ---------- parsing ----------

export function parseISO(s: DateISO): { y: number; m: number; d: number } | null {
  const mt = s.match(ISO_RE);
  if (!mt) return null;
  const [, y, m, d] = mt;
  if (!isValidDate(+y, +m, +d)) return null;
  return { y: +y, m: +m, d: +d };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function toISO(y: number, m: number, d: number): DateISO {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

export function today(): DateISO {
  const d = new Date();
  return toISO(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

// ---------- add / subtract ----------

function clampDay(y: number, m: number, d: number): number {
  return Math.min(d, daysInMonth(y, m));
}

/**
 * Add a duration to a date, calendar-correct.
 * Order: years → months → weeks → days. Month-end is clamped, not overflowed.
 */
export function add(start: DateISO, duration: DateDuration): DateAddResult {
  const parsed = parseISO(start);
  if (!parsed) return { ok: false, reason: "Invalid date. Use YYYY-MM-DD." };
  let { y, m, d } = parsed;
  if (duration.years) {
    y += duration.years;
  }
  if (duration.months) {
    const total = (y * 12 + (m - 1)) + duration.months;
    y = Math.floor(total / 12);
    m = (total % 12) + 1;
    if (m < 1) m = 12;
    if (m > 12) m = 1;
    d = clampDay(y, m, d);
  }
  if (duration.weeks) {
    return addDays(toISO(y, m, d), duration.weeks * 7);
  }
  if (duration.days) {
    return addDays(toISO(y, m, d), duration.days);
  }
  return { ok: true, date: toISO(y, m, d) };
}

/** Subtract a duration. */
export function subtract(start: DateISO, duration: DateDuration): DateAddResult {
  const negated: DateDuration = {
    days: duration.days ? -duration.days : undefined,
    weeks: duration.weeks ? -duration.weeks : undefined,
    months: duration.months ? -duration.months : undefined,
    years: duration.years ? -duration.years : undefined,
  };
  return add(start, negated);
}

function addDays(start: DateISO, days: number): DateAddResult {
  const parsed = parseISO(start);
  if (!parsed) return { ok: false, reason: "Invalid date." };
  const dt = new Date(parsed.y, parsed.m - 1, parsed.d);
  dt.setDate(dt.getDate() + days);
  return { ok: true, date: toISO(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()) };
}

// ---------- difference ----------

function toEpochDays(s: DateISO): number | null {
  const p = parseISO(s);
  if (!p) return null;
  // Days since 0001-01-01 (proleptic Gregorian).
  // Use Date.UTC for stability; project onto a proleptic scale.
  const dt = Date.UTC(p.y, p.m - 1, p.d);
  return Math.floor(dt / 86_400_000) + 366; // 0001-01-01 offset
}

export function diff(from: DateISO, to: DateISO): DateDiff {
  const fp = parseISO(from);
  const tp = parseISO(to);
  if (!fp || !tp) {
    return { ok: false, reason: "Enter two valid dates (YYYY-MM-DD)." };
  }
  const fa = toEpochDays(from)!;
  const ta = toEpochDays(to)!;
  const totalDays = ta - fa;

  // Calendar-component breakdown between the two dates.
  let y = tp.y - fp.y;
  let m = tp.m - fp.m;
  let d = tp.d - fp.d;
  if (d < 0) {
    // Borrow from previous month.
    const prevMonth = tp.m === 1 ? 12 : tp.m - 1;
    const prevYear = tp.m === 1 ? tp.y - 1 : tp.y;
    d += daysInMonth(prevYear, prevMonth);
    m -= 1;
  }
  if (m < 0) {
    m += 12;
    y -= 1;
  }
  const weeks = Math.trunc(totalDays / 7);
  const parts: string[] = [];
  if (y !== 0) parts.push(`${Math.abs(y)} year${Math.abs(y) === 1 ? "" : "s"}`);
  if (m !== 0) parts.push(`${Math.abs(m)} month${Math.abs(m) === 1 ? "" : "s"}`);
  if (d !== 0) parts.push(`${Math.abs(d)} day${Math.abs(d) === 1 ? "" : "s"}`);
  const human = parts.length > 0 ? parts.join(" ") : "0 days";
  return {
    ok: true,
    days: totalDays,
    weeks,
    months: y * 12 + m,
    years: y,
    human,
  };
}
