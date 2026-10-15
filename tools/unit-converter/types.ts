/** Unit Converter — types. Pure TS. */

export type UnitCategory =
  | "length"
  | "mass"
  | "temperature"
  | "speed"
  | "area"
  | "storage";

export interface UnitDef {
  /** Stable id, e.g. "km". */
  id: string;
  /** Display label, e.g. "Kilometers". */
  label: string;
  /** Short symbol, e.g. "km". */
  symbol: string;
}

export interface ConversionInput {
  category: UnitCategory;
  value: number;
  from: string; // unit id
  to: string;   // unit id
}

export interface ConversionResult {
  ok: boolean;
  /** Converted numeric value. */
  value?: number;
  /** Human-readable formatted value. */
  formatted?: string;
  /** Error reason when not ok. */
  reason?: string;
}
