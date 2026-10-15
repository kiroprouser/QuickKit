/** Quick Command — suggestions. Deterministic ranking, NON-AI. */

import type { SuggestionEntry } from "./types";
import { allSuggestions } from "./registry";
import { parse } from "./parser";

/**
 * Returns suggestions ranked by:
 * 1. parsed-intent match (when the input parses to a known intent, surface
 *    the matching suggestion first)
 * 2. fuzzy contains-match on label/example/summary
 * 3. stable canonical order otherwise
 */
export function suggest(input: string, limit = 6): SuggestionEntry[] {
  const trimmed = input.trim().toLowerCase();
  const all = allSuggestions();
  if (!trimmed) {
    return all.slice(0, limit);
  }
  const parsed = parse(input);
  const ranked = all
    .map((s) => {
      const hay = `${s.label} ${s.example} ${s.summary}`.toLowerCase();
      let score = 0;
      if (parsed.intent !== "unknown" && s.intent === parsed.intent) score += 100;
      if (s.label.startsWith(trimmed)) score += 50;
      if (s.example.toLowerCase().startsWith(trimmed)) score += 40;
      if (hay.includes(trimmed)) score += 20;
      // Token overlap bonus
      const tokens = trimmed.split(/\s+/);
      for (const t of tokens) {
        if (t && hay.includes(t)) score += 2;
      }
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.s);
  return ranked.slice(0, limit);
}

/** Re-export the full list for the Guide. */
export { allSuggestions };
