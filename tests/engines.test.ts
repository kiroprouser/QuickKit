/**
 * QuickKit engine unit tests.
 * Run with: `bun test tests`
 *
 * Covers:
 * - Unit Converter engine
 * - Percentage engine
 * - Date calculations
 * - Text transformations
 * - Random invariants
 * - Password/PIN invariants
 * - Color conversions
 * - QR input rules
 * - ranking
 * - Quick Command parsing/execution
 */

import { describe, it, expect } from "bun:test";
import { convert } from "../tools/unit-converter/engine";
import { percentOf, discount, tip, change } from "../tools/percentage/engine";
import { diff, add, subtract, isLeapYear, daysInMonth } from "../tools/date/engine";
import { stats, transform } from "../tools/text/engine";
import { randomInteger, flipCoin, rollDice, pickFromList } from "../tools/random/engine";
import { generatePassword, generatePin, estimateStrength } from "../tools/password/engine";
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, parseColor, format } from "../tools/color/engine";
import { validatePayload } from "../tools/qr/engine";
import { rankTools } from "../core/catalog/ranking";
import { parse } from "../components/command/parser";
import { execute, runCommand } from "../components/command/executor";

// ---------- Unit Converter ----------

describe("Unit Converter engine", () => {
  it("converts length: 10 km to mi", () => {
    const r = convert({ category: "length", value: 10, from: "km", to: "mi" });
    expect(r.ok).toBe(true);
    expect(r.value).toBeCloseTo(6.21371, 4);
  });

  it("converts temperature: 0 C to F = 32", () => {
    const r = convert({ category: "temperature", value: 0, from: "c", to: "f" });
    expect(r.value).toBe(32);
  });

  it("converts temperature: 100 C to F = 212", () => {
    expect(convert({ category: "temperature", value: 100, from: "c", to: "f" }).value).toBe(212);
  });

  it("converts temperature: 0 C to K = 273.15", () => {
    expect(convert({ category: "temperature", value: 0, from: "c", to: "k" }).value).toBeCloseTo(273.15, 2);
  });

  it("converts mass: 100 kg to lb", () => {
    const r = convert({ category: "mass", value: 100, from: "kg", to: "lb" });
    expect(r.value).toBeCloseTo(220.462, 2);
  });

  it("converts digital storage with decimal SI: 1 GB to MB = 1000", () => {
    expect(convert({ category: "storage", value: 1, from: "gb", to: "mb" }).value).toBe(1000);
  });

  it("converts digital storage: 1 byte to bit = 8", () => {
    expect(convert({ category: "storage", value: 1, from: "b", to: "bit" }).value).toBe(8);
  });

  it("returns same value when from === to", () => {
    const r = convert({ category: "length", value: 42, from: "km", to: "km" });
    expect(r.value).toBe(42);
  });

  it("rejects non-numeric input", () => {
    expect(convert({ category: "length", value: NaN, from: "km", to: "mi" }).ok).toBe(false);
  });
});

// ---------- Percentage ----------

describe("Percentage engine", () => {
  it("percentOf: 18% of 250 = 45", () => {
    expect(percentOf(18, 250).value).toBe(45);
  });

  it("discount: 20% off 749 → final 599.2, saved 149.8", () => {
    const r = discount(749, 20);
    expect(r.final).toBe(599.2);
    expect(r.discount).toBe(149.8);
  });

  it("tip: 15% on 60 → tip 9, total 69", () => {
    const r = tip(60, 15);
    expect(r.tip).toBe(9);
    expect(r.total).toBe(69);
  });

  it("change: 120 → 90 = -25% decrease", () => {
    const r = change(120, 90);
    expect(r.percent).toBe(-25);
    expect(r.direction).toBe("decrease");
  });

  it("change: 100 → 150 = +50% increase", () => {
    const r = change(100, 150);
    expect(r.percent).toBe(50);
    expect(r.direction).toBe("increase");
  });

  it("change rejects from=0", () => {
    expect(change(0, 100).ok).toBe(false);
  });
});

// ---------- Date ----------

describe("Date engine", () => {
  it("diff: 2026-01-01 to 2026-03-14 = 72 days", () => {
    const r = diff("2026-01-01", "2026-03-14");
    expect(r.days).toBe(72);
    expect(r.ok).toBe(true);
  });

  it("add: 2026-05-01 + 90 days = 2026-07-30", () => {
    const r = add("2026-05-01", { days: 90 });
    expect(r.date).toBe("2026-07-30");
  });

  it("subtract: 2026-05-01 - 30 days = 2026-04-01", () => {
    const r = subtract("2026-05-01", { days: 30 });
    expect(r.date).toBe("2026-04-01");
  });

  it("isLeapYear: 2024 yes, 2025 no, 2000 yes, 1900 no", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
  });

  it("daysInMonth: Feb 2024 = 29, Feb 2025 = 28", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2025, 2)).toBe(28);
  });

  it("calendar-correct: 2026-01-31 + 1 month = 2026-02-28 (clamped, not Mar 3)", () => {
    const r = add("2026-01-31", { months: 1 });
    expect(r.date).toBe("2026-02-28");
  });

  it("calendar-correct leap year: 2024-01-31 + 1 month = 2024-02-29", () => {
    const r = add("2024-01-31", { months: 1 });
    expect(r.date).toBe("2024-02-29");
  });

  it("add 1 year to 2026-05-01 = 2027-05-01", () => {
    expect(add("2026-05-01", { years: 1 }).date).toBe("2027-05-01");
  });

  it("rejects invalid date", () => {
    expect(diff("not-a-date", "2026-01-01").ok).toBe(false);
  });
});

// ---------- Text ----------

describe("Text engine", () => {
  it("stats: counts words/characters/lines", () => {
    const s = stats("the quick brown fox\njumps over");
    expect(s.words).toBe(6);
    expect(s.characters).toBe(30); // 19 + 1 newline + 10
    expect(s.lines).toBe(2);
  });

  it("stats: empty text → zeros", () => {
    const s = stats("");
    expect(s.words).toBe(0);
    expect(s.characters).toBe(0);
    expect(s.lines).toBe(0);
  });

  it("transform: upper", () => {
    expect(transform("hello", "upper")).toBe("HELLO");
  });

  it("transform: lower", () => {
    expect(transform("HELLO", "lower")).toBe("hello");
  });

  it("transform: title", () => {
    expect(transform("hello world", "title")).toBe("Hello World");
  });

  it("transform: collapse", () => {
    expect(transform("  hello   world  ", "collapse")).toBe("hello world");
  });

  it("transform: normalizeLineEndings converts \\r\\n to \\n", () => {
    expect(transform("a\r\nb\rc", "normalizeLineEndings")).toBe("a\nb\nc");
  });
});

// ---------- Random ----------

describe("Random engine invariants", () => {
  it("randomInteger stays within [min, max]", () => {
    for (let i = 0; i < 200; i++) {
      const v = randomInteger(5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
    }
  });

  it("randomInteger(7,7) always returns 7", () => {
    for (let i = 0; i < 10; i++) {
      expect(randomInteger(7, 7)).toBe(7);
    }
  });

  it("flipCoin returns heads or tails", () => {
    for (let i = 0; i < 50; i++) {
      const v = flipCoin();
      expect(v === "heads" || v === "tails").toBe(true);
    }
  });

  it("rollDice returns the right count and within faces", () => {
    const r = rollDice(4, 6);
    expect(r.rolls).toHaveLength(4);
    for (const v of r.rolls) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
    }
    expect(r.total).toBe(r.rolls.reduce((a, b) => a + b, 0));
  });

  it("pickFromList returns one of the items", () => {
    const items = ["a", "b", "c"];
    const r = pickFromList("a,b,c");
    expect(r.ok).toBe(true);
    expect(items).toContain(r.value);
  });

  it("pickFromList rejects a single item", () => {
    expect(pickFromList("only").ok).toBe(false);
  });

  // Statistical unbiasedness sanity check (loose)
  it("flipCoin distribution is roughly balanced over 1000 flips", () => {
    let heads = 0;
    for (let i = 0; i < 1000; i++) if (flipCoin() === "heads") heads++;
    // Expect within [400, 600] — extremely unlikely to fail for unbiased source
    expect(heads).toBeGreaterThan(380);
    expect(heads).toBeLessThan(620);
  });
});

// ---------- Password / PIN ----------

describe("Password engine invariants", () => {
  it("generatePassword returns the right length", () => {
    for (let len = 4; len <= 32; len++) {
      const pw = generatePassword({ length: len, lower: true, upper: true, digits: true, symbols: true, excludeAmbiguous: false });
      expect(pw).toHaveLength(len);
    }
  });

  it("generatePin returns the right length", () => {
    for (let len = 1; len <= 16; len++) {
      expect(generatePin(len)).toHaveLength(len);
    }
  });

  it("generatePin only contains digits", () => {
    const pin = generatePin(8);
    expect(pin).toMatch(/^\d{8}$/);
  });

  it("excludeAmbiguous removes ambiguous chars", () => {
    const ambiguous = "Il1O0oS5B8|`'\"";
    for (let i = 0; i < 50; i++) {
      const pw = generatePassword({ length: 64, lower: true, upper: true, digits: true, symbols: false, excludeAmbiguous: true });
      for (const c of ambiguous) {
        expect(pw).not.toContain(c);
      }
    }
  });

  it("estimateStrength labels strong passwords as Strong", () => {
    const pw = generatePassword({ length: 32, lower: true, upper: true, digits: true, symbols: true, excludeAmbiguous: false });
    const s = estimateStrength(pw);
    expect(s.bits).toBeGreaterThan(100);
    expect(["Strong", "Good"]).toContain(s.label);
  });

  it("empty password is Weak", () => {
    expect(estimateStrength("").label).toBe("Weak");
  });

  it("two consecutive generates differ (very likely)", () => {
    const a = generatePassword({ length: 16, lower: true, upper: true, digits: true, symbols: true, excludeAmbiguous: false });
    const b = generatePassword({ length: 16, lower: true, upper: true, digits: true, symbols: true, excludeAmbiguous: false });
    expect(a).not.toBe(b);
  });
});

// ---------- Color ----------

describe("Color engine", () => {
  it("hexToRgb: #ff6600 → rgb(255, 102, 0)", () => {
    expect(hexToRgb("#ff6600")).toEqual({ r: 255, g: 102, b: 0 });
  });

  it("hexToRgb: short form #f60 → rgb(255, 102, 0)", () => {
    expect(hexToRgb("#f60")).toEqual({ r: 255, g: 102, b: 0 });
  });

  it("hexToRgb: rejects invalid", () => {
    expect(hexToRgb("not-a-color")).toBeNull();
  });

  it("rgbToHex is inverse of hexToRgb for #ff6600", () => {
    const rgb = hexToRgb("#ff6600")!;
    expect(rgbToHex(rgb)).toBe("#ff6600");
  });

  it("rgbToHsl: rgb(255,102,0) → hsl(24,100,50)", () => {
    expect(rgbToHsl({ r: 255, g: 102, b: 0 })).toEqual({ h: 24, s: 100, l: 50 });
  });

  it("hslToRgb is inverse of rgbToHsl", () => {
    const rgb = { r: 200, g: 100, b: 50 };
    const hsl = rgbToHsl(rgb);
    const back = hslToRgb(hsl);
    expect(back.r).toBeCloseTo(rgb.r, 0);
    expect(back.g).toBeCloseTo(rgb.g, 0);
    expect(back.b).toBeCloseTo(rgb.b, 0);
  });

  it("parseColor parses hex, rgb, hsl", () => {
    expect(parseColor("#ff6600")?.format).toBe("hex");
    expect(parseColor("rgb(255, 102, 0)")?.format).toBe("rgb");
    expect(parseColor("hsl(24, 100%, 50%)")?.format).toBe("hsl");
  });

  it("parseColor returns null for junk", () => {
    expect(parseColor("junk")).toBeNull();
  });

  it("format emits the expected string", () => {
    const rgb = hexToRgb("#ff6600")!;
    expect(format(rgb, "hex")).toBe("#ff6600");
    expect(format(rgb, "rgb")).toBe("rgb(255, 102, 0)");
  });
});

// ---------- QR input rules ----------

describe("QR input rules", () => {
  it("rejects empty", () => {
    expect(validatePayload("").ok).toBe(false);
  });

  it("rejects whitespace-only", () => {
    expect(validatePayload("   ").ok).toBe(false);
  });

  it("rejects too-long payload (>1500 chars)", () => {
    expect(validatePayload("a".repeat(1501)).ok).toBe(false);
  });

  it("accepts a normal URL", () => {
    expect(validatePayload("https://quickkit-59o.pages.dev").ok).toBe(true);
  });
});

// ---------- Ranking ----------

describe("ranking", () => {
  it("initial canonical order when no fav/recent", () => {
    const r = rankTools([], []);
    expect(r.map((t) => t.id)).toEqual([
      "unit-converter", "percentage", "qr", "password", "date", "text", "random", "color",
    ]);
  });

  it("favorite moves to front", () => {
    const r = rankTools(["color"], []);
    expect(r[0].id).toBe("color");
  });

  it("multiple favorites order by canonical", () => {
    const r = rankTools(["color", "date"], []);
    expect(r[0].id).toBe("date"); // date is canonical 5, color is 8 → date first
    expect(r[1].id).toBe("color");
  });

  it("favorite wins over recent", () => {
    const r = rankTools(["color"], ["color", "date"]);
    expect(r[0].id).toBe("color"); // appears once
    expect(r.filter((t) => t.id === "color")).toHaveLength(1);
  });

  it("recent non-favorite appears before remaining", () => {
    const r = rankTools([], ["date"]);
    expect(r[0].id).toBe("date");
    expect(r[1].id).toBe("unit-converter"); // first remaining in canonical order
  });

  it("no duplicates ever", () => {
    const r = rankTools(["color", "date"], ["color", "date", "text", "color"]);
    const ids = r.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(8);
  });
});

// ---------- Quick Command parser + executor ----------

describe("Quick Command parser", () => {
  it("parses unit convert: 10 km to mi", () => {
    const p = parse("10 km to mi");
    expect(p.intent).toBe("unit:convert");
    expect(p.payload.value).toBe(10);
    expect(p.payload.from).toBe("km");
    expect(p.payload.to).toBe("mi");
  });

  it("parses percent discount: 20% off 749", () => {
    const p = parse("20% off 749");
    expect(p.intent).toBe("percent:calc");
    expect(p.payload.op).toBe("discount");
    expect(p.payload.percent).toBe(20);
    expect(p.payload.price).toBe(749);
  });

  it("parses tip: 15% tip on 60", () => {
    const p = parse("15% tip on 60");
    expect(p.intent).toBe("percent:calc");
    expect(p.payload.op).toBe("tip");
  });

  it("parses percent of: 18% of 250", () => {
    const p = parse("18% of 250");
    expect(p.payload.op).toBe("percentOf");
  });

  it("parses color: #ff6600 to rgb", () => {
    const p = parse("#ff6600 to rgb");
    expect(p.intent).toBe("color:convert");
    expect(p.payload.target).toBe("rgb");
  });

  it("parses navigate: open color", () => {
    const p = parse("open color");
    expect(p.intent).toBe("navigate:tool");
    expect(p.route).toBe("/tools/color");
  });

  it("parses flip a coin", () => {
    const p = parse("flip a coin");
    expect(p.intent).toBe("random:pick");
    expect(p.payload.op).toBe("coin");
  });

  it("parses roll 2d6", () => {
    const p = parse("roll 2d6");
    expect(p.intent).toBe("random:pick");
    expect(p.payload.op).toBe("dice");
    expect(p.payload.count).toBe(2);
    expect(p.payload.faces).toBe(6);
  });

  it("parses pin 6", () => {
    const p = parse("pin 6");
    expect(p.intent).toBe("password:generate");
    expect(p.payload.op).toBe("pin");
  });

  it("parses date diff", () => {
    const p = parse("days from 2026-01-01 to 2026-03-14");
    expect(p.intent).toBe("date:calc");
    expect(p.payload.op).toBe("diff");
  });
});

describe("Quick Command executor — uses real engines", () => {
  it("executes 10 km to mi → 6.2137 mi", () => {
    const r = execute(parse("10 km to mi"));
    expect(r.ok).toBe(true);
    expect(r.value).toContain("6.21");
    expect(r.value).toContain("mi");
  });

  it("executes 20% off 749 → $599.20", () => {
    const r = execute(parse("20% off 749"));
    expect(r.ok).toBe(true);
    expect(r.value).toContain("599.20");
  });

  it("executes 18% of 250 → 45", () => {
    const r = execute(parse("18% of 250"));
    expect(r.ok).toBe(true);
    expect(r.value).toBe("45");
  });

  it("executes #ff6600 to rgb → rgb(255, 102, 0)", () => {
    const r = execute(parse("#ff6600 to rgb"));
    expect(r.ok).toBe(true);
    expect(r.value).toBe("rgb(255, 102, 0)");
  });

  it("executes flip a coin → Heads or Tails", () => {
    const r = execute(parse("flip a coin"));
    expect(r.ok).toBe(true);
    expect(["Heads", "Tails"]).toContain(r.value);
  });

  it("executes pin 6 → 6 digits", () => {
    const r = execute(parse("pin 6"));
    expect(r.ok).toBe(true);
    expect(r.value).toMatch(/^\d{6}$/);
  });

  it("executes password 16 → 16 chars", () => {
    const r = execute(parse("password 16"));
    expect(r.ok).toBe(true);
    expect(r.value).toHaveLength(16);
  });

  it("executes days from 2026-01-01 to 2026-03-14 → 72 days", () => {
    const r = execute(parse("days from 2026-01-01 to 2026-03-14"));
    expect(r.ok).toBe(true);
    expect(r.value).toContain("72");
  });

  it("executes add 90 days to 2026-05-01 → 2026-07-30", () => {
    const r = execute(parse("add 90 days to 2026-05-01"));
    expect(r.ok).toBe(true);
    expect(r.value).toBe("2026-07-30");
  });

  it("executes uppercase hello world", () => {
    const r = execute(parse("uppercase hello world"));
    expect(r.ok).toBe(true);
    expect(r.value).toBe("HELLO WORLD");
  });

  it("executes open color → navigate route", () => {
    const r = execute(parse("open color"));
    expect(r.ok).toBe(true);
    expect(r.route).toBe("/tools/color");
  });

  it("runCommand end-to-end: 100 kg to lb", () => {
    const r = runCommand("100 kg to lb");
    expect(r.ok).toBe(true);
    expect(r.value).toContain("220.46");
  });
});
