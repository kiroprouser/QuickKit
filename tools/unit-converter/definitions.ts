/** Unit Converter — definitions. Pure TS data, no React. */

import type { UnitCategory, UnitDef } from "./types";

/**
 * For non-temperature categories, every unit has a `factor` = how many base
 * units equal 1 of this unit. Converting from A to B = value * factorA / factorB.
 *
 * Temperature is special-cased in engine.ts via offsets (Celsius base).
 *
 * Digital storage uses DECIMAL SI semantics: 1 GB = 1,000,000,000 bytes.
 * (No binary KiB/MiB here — everyday readability.)
 */

export interface UnitDefWithFactor extends UnitDef {
  factor: number; // 1 unit = `factor` base units
}

interface CategoryDef {
  id: UnitCategory;
  label: string;
  baseUnit: string; // unit id of the base
  units: readonly UnitDefWithFactor[];
}

const length: readonly UnitDefWithFactor[] = [
  { id: "mm", label: "Millimeters", symbol: "mm", factor: 0.001 },
  { id: "cm", label: "Centimeters", symbol: "cm", factor: 0.01 },
  { id: "m", label: "Meters", symbol: "m", factor: 1 },
  { id: "km", label: "Kilometers", symbol: "km", factor: 1000 },
  { id: "in", label: "Inches", symbol: "in", factor: 0.0254 },
  { id: "ft", label: "Feet", symbol: "ft", factor: 0.3048 },
  { id: "yd", label: "Yards", symbol: "yd", factor: 0.9144 },
  { id: "mi", label: "Miles", symbol: "mi", factor: 1609.344 },
];

const mass: readonly UnitDefWithFactor[] = [
  { id: "mg", label: "Milligrams", symbol: "mg", factor: 0.000001 },
  { id: "g", label: "Grams", symbol: "g", factor: 0.001 },
  { id: "kg", label: "Kilograms", symbol: "kg", factor: 1 },
  { id: "t", label: "Tonnes", symbol: "t", factor: 1000 },
  { id: "oz", label: "Ounces", symbol: "oz", factor: 0.028349523125 },
  { id: "lb", label: "Pounds", symbol: "lb", factor: 0.45359237 },
  { id: "st", label: "Stones", symbol: "st", factor: 6.35029318 },
];

const temperature: readonly UnitDefWithFactor[] = [
  { id: "c", label: "Celsius", symbol: "°C", factor: 1 },
  { id: "f", label: "Fahrenheit", symbol: "°F", factor: 1 },
  { id: "k", label: "Kelvin", symbol: "K", factor: 1 },
];

const speed: readonly UnitDefWithFactor[] = [
  { id: "mps", label: "Meters / second", symbol: "m/s", factor: 1 },
  { id: "kph", label: "Kilometers / hour", symbol: "km/h", factor: 0.2777777777778 },
  { id: "mph", label: "Miles / hour", symbol: "mph", factor: 0.44704 },
  { id: "fps", label: "Feet / second", symbol: "ft/s", factor: 0.3048 },
  { id: "knot", label: "Knots", symbol: "kn", factor: 0.5144444444444 },
];

const area: readonly UnitDefWithFactor[] = [
  { id: "mm2", label: "Square millimeters", symbol: "mm²", factor: 0.000001 },
  { id: "cm2", label: "Square centimeters", symbol: "cm²", factor: 0.0001 },
  { id: "m2", label: "Square meters", symbol: "m²", factor: 1 },
  { id: "ha", label: "Hectares", symbol: "ha", factor: 10000 },
  { id: "km2", label: "Square kilometers", symbol: "km²", factor: 1000000 },
  { id: "in2", label: "Square inches", symbol: "in²", factor: 0.00064516 },
  { id: "ft2", label: "Square feet", symbol: "ft²", factor: 0.09290304 },
  { id: "ac", label: "Acres", symbol: "ac", factor: 4046.8564224 },
  { id: "mi2", label: "Square miles", symbol: "mi²", factor: 2589988.110336 },
];

// Decimal SI semantics. 1 byte = 1 B. 1 KB = 1,000 B. 1 MB = 1,000,000 B.
const storage: readonly UnitDefWithFactor[] = [
  { id: "b", label: "Bytes", symbol: "B", factor: 1 },
  { id: "kb", label: "Kilobytes", symbol: "KB", factor: 1_000 },
  { id: "mb", label: "Megabytes", symbol: "MB", factor: 1_000_000 },
  { id: "gb", label: "Gigabytes", symbol: "GB", factor: 1_000_000_000 },
  { id: "tb", label: "Terabytes", symbol: "TB", factor: 1_000_000_000_000 },
  { id: "pb", label: "Petabytes", symbol: "PB", factor: 1_000_000_000_000_000 },
  { id: "bit", label: "Bits", symbol: "bit", factor: 0.125 },
  { id: "kbit", label: "Kilobits", symbol: "Kbit", factor: 125 },
  { id: "mbit", label: "Megabits", symbol: "Mbit", factor: 125_000 },
  { id: "gbit", label: "Gigabits", symbol: "Gbit", factor: 125_000_000 },
];

export const CATEGORY_DEFS: readonly CategoryDef[] = [
  { id: "length", label: "Length", baseUnit: "m", units: length },
  { id: "mass", label: "Mass", baseUnit: "kg", units: mass },
  { id: "temperature", label: "Temperature", baseUnit: "c", units: temperature },
  { id: "speed", label: "Speed", baseUnit: "mps", units: speed },
  { id: "area", label: "Area", baseUnit: "m2", units: area },
  { id: "storage", label: "Digital Storage", baseUnit: "b", units: storage },
];

const CATEGORY_INDEX: Readonly<Record<UnitCategory, CategoryDef>> = Object.fromEntries(
  CATEGORY_DEFS.map((c) => [c.id, c]),
) as Readonly<Record<UnitCategory, CategoryDef>>;

export function getCategory(id: UnitCategory): CategoryDef {
  return CATEGORY_INDEX[id];
}

export function getUnit(category: UnitCategory, unitId: string): UnitDefWithFactor | undefined {
  return CATEGORY_INDEX[category].units.find((u) => u.id === unitId);
}
