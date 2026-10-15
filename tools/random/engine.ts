/**
 * Random Picker — engine. Pure TypeScript using browser cryptographic
 * randomness via platform/crypto.ts. Rejection sampling where the natural
 * range does not divide evenly into the target space → unbiased distribution.
 */

import { randomInt, randomChoice, shuffle as cryptoShuffle } from "@core/platform/crypto";

export interface DiceResult {
  rolls: number[];
  total: number;
}

/** Random integer in [min, max] inclusive. */
export function randomInteger(min: number, max: number): number {
  return randomInt(min, max);
}

/** Pick a random element from a comma-separated list. */
export function pickFromList(input: string): { ok: boolean; value?: string; reason?: string } {
  const items = input
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (items.length === 0) {
    return { ok: false, reason: "Enter at least two items separated by commas." };
  }
  if (items.length === 1) {
    return { ok: false, reason: "Enter at least two items to pick from." };
  }
  return { ok: true, value: randomChoice(items) };
}

/** Flip a coin. */
export function flipCoin(): "heads" | "tails" {
  return randomInt(0, 1) === 0 ? "heads" : "tails";
}

/** Roll `count` dice each with `faces` faces. */
export function rollDice(count: number, faces: number): DiceResult {
  const n = Math.max(1, Math.min(100, Math.floor(count)));
  const f = Math.max(2, Math.min(1000, Math.floor(faces)));
  const rolls: number[] = [];
  let total = 0;
  for (let i = 0; i < n; i++) {
    const r = randomInt(1, f);
    rolls.push(r);
    total += r;
  }
  return { rolls, total };
}

/** Shuffle a comma-separated list (unbiased, cryptographic). */
export function shuffleList(input: string): { ok: boolean; value?: string[]; reason?: string } {
  const items = input
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (items.length === 0) {
    return { ok: false, reason: "Enter at least one item." };
  }
  return { ok: true, value: cryptoShuffle(items) };
}
