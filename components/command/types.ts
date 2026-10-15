/** Quick Command — types. Deterministic, NON-AI. */

export type IntentId =
  | "unit:convert"
  | "percent:calc"
  | "qr:generate"
  | "password:generate"
  | "date:calc"
  | "text:transform"
  | "random:pick"
  | "color:convert"
  | "navigate:tool"
  | "navigate:page"
  | "unknown";

export interface ParsedIntent {
  intent: IntentId;
  /** The raw, normalized query string. */
  raw: string;
  /** Tool-specific payload (shape depends on intent). */
  payload?: any;
  /** A navigate target route when intent is navigate:*. */
  route?: string;
}

export interface CommandResult {
  ok: boolean;
  /** Display title, e.g. "10 km → mi". */
  title?: string;
  /** Display value, e.g. "6.2137 mi". */
  value?: string;
  /** Optional secondary info. */
  description?: string;
  /** Optional route to navigate to (for navigate intents). */
  route?: string;
  reason?: string;
}

export interface CommandSpec {
  intent: IntentId;
  /** Pattern fragments that signal this intent. */
  triggers: RegExp[];
  /** Human-friendly description for the Guide + suggestions. */
  summary: string;
  /** Canonical examples (data-driven Guide). */
  examples: string[];
  /** Optional category for grouping in the Guide. */
  category: "tools" | "navigation";
}

export interface SuggestionEntry {
  intent: IntentId;
  label: string;
  example: string;
  summary: string;
}
