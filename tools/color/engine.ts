/**
 * Color Converter — engine. Pure TypeScript. Bidirectional HEX / RGB / HSL.
 * The graphical UI and Quick Command both call this same code.
 */

export interface RgbColor {
  r: number; // 0–255
  g: number;
  b: number;
}

export interface HslColor {
  h: number; // 0–360
  s: number; // 0–100
  l: number; // 0–100
}

export type ColorFormat = "hex" | "rgb" | "hsl";

export interface ParsedColor {
  format: ColorFormat;
  rgb: RgbColor;
}

// ---------- HEX ----------

export function hexToRgb(hex: string): RgbColor | null {
  let h = hex.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(h)) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (/^[0-9a-fA-F]{6}$/.test(h)) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  return null;
}

export function rgbToHex(c: RgbColor): string {
  const to = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${to(c.r)}${to(c.g)}${to(c.b)}`;
}

// ---------- HSL ----------

export function rgbToHsl(c: RgbColor): HslColor {
  const r = c.r / 255;
  const g = c.g / 255;
  const b = c.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb(c: HslColor): RgbColor {
  const h = ((c.h % 360) + 360) % 360;
  const s = Math.max(0, Math.min(100, c.s)) / 100;
  const l = Math.max(0, Math.min(100, c.l)) / 100;
  const c1 = (1 - Math.abs(2 * l - 1)) * s;
  const x = c1 * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c1 / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c1; g = x; b = 0; }
  else if (h < 120) { r = x; g = c1; b = 0; }
  else if (h < 180) { r = 0; g = c1; b = x; }
  else if (h < 240) { r = 0; g = x; b = c1; }
  else if (h < 300) { r = x; g = 0; b = c1; }
  else { r = c1; g = 0; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// ---------- cross-format helpers ----------

export function hexToHsl(hex: string): HslColor | null {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsl(rgb) : null;
}

export function hslToHex(c: HslColor): string {
  return rgbToHex(hslToRgb(c));
}

// ---------- smart parsing (for Quick Command + UI) ----------

const RGB_RE = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+)?\s*\)/i;
const HSL_RE = /hsla?\(\s*(\d{1,3}(?:\.\d+)?)\s*,\s*(\d{1,3}(?:\.\d+)?)%?\s*,\s*(\d{1,3}(?:\.\d+)?)%?(?:\s*,\s*[\d.]+)?\s*\)/i;

export function parseColor(input: string): ParsedColor | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // HEX
  if (/^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(trimmed) || /^#?[0-9a-fA-F]{6}$/.test(trimmed)) {
    const rgb = hexToRgb(trimmed.startsWith("#") ? trimmed : "#" + trimmed);
    if (rgb) return { format: "hex", rgb };
  }
  // RGB
  const rm = trimmed.match(RGB_RE);
  if (rm) {
    const r = +rm[1], g = +rm[2], b = +rm[3];
    if (r <= 255 && g <= 255 && b <= 255) {
      return { format: "rgb", rgb: { r, g, b } };
    }
  }
  // HSL
  const hm = trimmed.match(HSL_RE);
  if (hm) {
    const rgb = hslToRgb({ h: +hm[1], s: +hm[2], l: +hm[3] });
    return { format: "hsl", rgb };
  }
  return null;
}

// ---------- formatting ----------

export function formatHex(c: RgbColor): string {
  return rgbToHex(c);
}

export function formatRgb(c: RgbColor): string {
  return `rgb(${c.r}, ${c.g}, ${c.b})`;
}

export function formatHsl(c: RgbColor): string {
  const h = rgbToHsl(c);
  return `hsl(${h.h}, ${h.s}%, ${h.l}%)`;
}

export function format(c: RgbColor, format: ColorFormat): string {
  switch (format) {
    case "hex": return formatHex(c);
    case "rgb": return formatRgb(c);
    case "hsl": return formatHsl(c);
  }
}

/** Convert between two formats, returning the formatted target string. */
export function convertFormat(input: string, target: ColorFormat): { ok: boolean; value?: string; reason?: string } {
  const parsed = parseColor(input);
  if (!parsed) {
    return { ok: false, reason: "Could not parse a HEX, RGB, or HSL color." };
  }
  return { ok: true, value: format(parsed.rgb, target) };
}
