/**
 * Password & PIN — engine. Pure TypeScript using browser cryptographic
 * randomness (via platform/crypto.ts).
 *
 * Generated values exist ONLY in memory. They are never durably persisted,
 * never sent to a server, and never attached to an account.
 */

import { getRandomBytes, randomUint32 } from "@core/platform/crypto";

export interface PasswordOptions {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 16,
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false,
};

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/";
const AMBIGUOUS = "Il1O0oS5B8|`'\"";

function filterAmbiguous(set: string, exclude: boolean): string {
  if (!exclude) return set;
  return set
    .split("")
    .filter((c) => !AMBIGUOUS.includes(c))
    .join("");
}

function buildPool(opts: PasswordOptions): string {
  let pool = "";
  if (opts.lower) pool += filterAmbiguous(LOWER, opts.excludeAmbiguous);
  if (opts.upper) pool += filterAmbiguous(UPPER, opts.excludeAmbiguous);
  if (opts.digits) pool += filterAmbiguous(DIGITS, opts.excludeAmbiguous);
  if (opts.symbols) pool += filterAmbiguous(SYMBOLS, opts.excludeAmbiguous);
  return pool;
}

function pickChar(pool: string): string {
  if (pool.length === 0) return "";
  const idx = randomUint32(pool.length);
  return pool[idx];
}

/**
 * Generate a password. Guarantees that every selected category contributes
 * at least one character (when length allows). Uses rejection-sampled
 * cryptographic randomness.
 */
export function generatePassword(opts: PasswordOptions = DEFAULT_PASSWORD_OPTIONS): string {
  const pool = buildPool(opts);
  if (pool.length === 0) {
    return "";
  }
  const length = Math.max(1, Math.min(128, Math.floor(opts.length)));
  const required: string[] = [];
  const categories: string[] = [];
  if (opts.lower) categories.push(filterAmbiguous(LOWER, opts.excludeAmbiguous));
  if (opts.upper) categories.push(filterAmbiguous(UPPER, opts.excludeAmbiguous));
  if (opts.digits) categories.push(filterAmbiguous(DIGITS, opts.excludeAmbiguous));
  if (opts.symbols) categories.push(filterAmbiguous(SYMBOLS, opts.excludeAmbiguous));

  // Place one guaranteed char from each enabled category, then fill the rest.
  for (const cat of categories) {
    if (required.length < length) {
      required.push(pickChar(cat));
    }
  }
  while (required.length < length) {
    required.push(pickChar(pool));
  }
  // Shuffle the result so guaranteed chars are not at fixed positions.
  const shuffled = shuffle(required);
  return shuffled.join("");
}

/** Generate a numeric PIN of `length` digits. */
export function generatePin(length: number): string {
  const n = Math.max(1, Math.min(32, Math.floor(length)));
  const bytes = getRandomBytes(n);
  // Rejection-sampled unbiased digit per position.
  const digits: string[] = [];
  for (let i = 0; i < n; i++) {
    let d = bytes[i] % 10;
    // Rejection sampling: if the byte is in the upper non-divisible tail,
    // re-draw — extremely rare, keeps distribution uniform.
    while (bytes[i] >= 250) {
      // extremely rare; re-draw this position from a fresh crypto byte.
      const fresh = getRandomBytes(1)[0];
      if (fresh < 250) {
        d = fresh % 10;
        break;
      }
    }
    digits.push(String(d));
  }
  return digits.join("");
}

// ---------- strength estimate ----------

export interface PasswordStrength {
  bits: number;
  label: "Weak" | "Fair" | "Good" | "Strong";
}

export function estimateStrength(pw: string): PasswordStrength {
  if (!pw) return { bits: 0, label: "Weak" };
  let poolSize = 0;
  if (/[a-z]/.test(pw)) poolSize += 26;
  if (/[A-Z]/.test(pw)) poolSize += 26;
  if (/[0-9]/.test(pw)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) poolSize += 32;
  const bits = Math.round(pw.length * Math.log2(Math.max(poolSize, 1)));
  let label: PasswordStrength["label"] = "Weak";
  if (bits >= 128) label = "Strong";
  else if (bits >= 80) label = "Good";
  else if (bits >= 50) label = "Fair";
  return { bits, label };
}

// ---------- internal Fisher–Yates shuffle (uses CSPRNG) ----------

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomUint32(i + 1);
    if (i !== j) {
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
  }
  return out;
}
