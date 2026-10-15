/**
 * Text Tools — engine. Pure TypeScript.
 * Word / character / line counts, case transformations, whitespace
 * normalization. The same engine powers Quick Command.
 */

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  sentences: number;
  paragraphs: number;
}

export type TransformOp =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "trim"
  | "collapse"
  | "normalizeLineEndings";

export function stats(text: string): TextStats {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const words = (text.trim().match(/\S+/g) || []).length;
  const lines = text.length === 0 ? 0 : text.split("\n").length;
  const sentences = (text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || []).length;
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0).length;
  return {
    characters,
    charactersNoSpaces,
    words,
    lines,
    sentences,
    paragraphs,
  };
}

export function transform(text: string, op: TransformOp): string {
  switch (op) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return titleCase(text);
    case "sentence":
      return sentenceCase(text);
    case "trim":
      return text.trim();
    case "collapse":
      return collapseWhitespace(text);
    case "normalizeLineEndings":
      return text.replace(/\r\n?/g, "\n");
    default:
      return text;
  }
}

function titleCase(text: string): string {
  return text.replace(/\S+/g, (w) => {
    if (w.length <= 1) return w.toUpperCase();
    // Skip short conjunctions/articles/prepositions? Keep simple: capitalize
    // first letter only, preserving rest as-is for readability.
    return w.charAt(0).toUpperCase() + w.slice(1);
  });
}

function sentenceCase(text: string): string {
  let out = "";
  let capitalizeNext = true;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (capitalizeNext && /[a-zA-Z]/.test(ch)) {
      out += ch.toUpperCase();
      capitalizeNext = false;
    } else {
      out += ch.toLowerCase();
    }
    if (/[.!?]/.test(ch)) {
      capitalizeNext = true;
    }
  }
  return out;
}

function collapseWhitespace(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
