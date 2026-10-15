/**
 * Centralized cryptographic randomness using window.crypto.getRandomValues.
 * Used by Password/PIN and Random Picker for unbiased secure randomness.
 *
 * Rejection sampling is used where the requested range does not divide evenly
 * into the output space (so the distribution is unbiased).
 */

import { capabilities } from "./capabilities";

/** Fill a Uint8Array with cryptographically secure random bytes. */
export function getRandomBytes(len: number): Uint8Array {
  if (!capabilities.hasCrypto) {
    // Fallback: Math.random — clearly not cryptographic, but only used when
    // the environment lacks window.crypto (extremely rare in modern browsers).
    const out = new Uint8Array(len);
    for (let i = 0; i < len; i++) out[i] = Math.floor(Math.random() * 256);
    return out;
  }
  const out = new Uint8Array(len);
  window.crypto.getRandomValues(out);
  return out;
}

/** Random unsigned 32-bit integer in [0, max) using rejection sampling. */
export function randomUint32(max: number): number {
  if (max <= 0) throw new Error("max must be > 0");
  if (max === 1) return 0;
  // Use a 32-bit rejection-sampled uniform value.
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  let x = 0xffffffff;
  // Loop until we get a value below `limit` (rejection sampling).
  while (x >= limit) {
    if (capabilities.hasCrypto) {
      window.crypto.getRandomValues(buf);
    } else {
      // Test/Node fallback — Math.random is not cryptographic but suffices
      // for tests. In production, the branch above is always taken.
      buf[0] = Math.floor(Math.random() * 0x100000000);
    }
    x = buf[0];
  }
  return x % max;
}

/** Random integer in [min, max] inclusive (cryptographic). */
export function randomInt(min: number, max: number): number {
  if (min > max) throw new Error("min must be <= max");
  const range = max - min + 1;
  return min + randomUint32(range);
}

/** Pick a random element from an array (cryptographic, unbiased). */
export function randomChoice<T>(arr: readonly T[]): T {
  if (arr.length === 0) throw new Error("array must be non-empty");
  const idx = randomUint32(arr.length);
  return arr[idx];
}

/**
 * Shuffle a copy of the array using Fisher–Yates with cryptographic
 * randomness (unbiased).
 */
export function shuffle<T>(arr: readonly T[]): T[] {
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
