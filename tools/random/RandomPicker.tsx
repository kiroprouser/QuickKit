"use client";

/**
 * QuickKit Random Picker — interactive UI.
 *
 * Four modes: Integer, Coin, Dice, Choice. All randomness comes from the
 * browser's CSPRNG via the pure engine. Choice lists and the picked value
 * live ONLY in the session store (memory) — never persisted, never sent.
 */

import { useState } from "react";
import { Dices, Shuffle, RotateCcw } from "lucide-react";
import { SegmentedControl } from "@components/ui/segmented-control";
import { Field } from "@components/ui/field";
import { ResultCard } from "@components/ui/result-card";
import { CopyButton } from "@components/ui/copy-button";
import { Button } from "@components/ui/button";
import { useToolState } from "@core/runtime/session-store";
import { haptic } from "@core/platform/haptics";
import { capabilities } from "@core/platform/capabilities";
import {
  randomInteger,
  pickFromList,
  flipCoin,
  rollDice,
  shuffleList,
} from "./engine";

type RandomMode = "int" | "coin" | "dice" | "choice";

interface RandomPickerState {
  mode: RandomMode;
  min: string;
  max: string;
  /** SENSITIVE — list of choices. Lives in session store (memory) only. */
  list: string;
  diceCount: string;
  diceFaces: string;
  /** SENSITIVE — picked value. Lives in session store (memory) only. */
  result: string;
  // Allow assignment to ToolStateBag (Record<string, unknown>).
  [key: string]: unknown;
}

const INITIAL: RandomPickerState = {
  mode: "int",
  min: "1",
  max: "100",
  list: "apple, banana, cherry, date, elderberry",
  diceCount: "2",
  diceFaces: "6",
  result: "",
};

const MODE_OPTIONS: { value: RandomMode; label: string }[] = [
  { value: "int", label: "Integer" },
  { value: "coin", label: "Coin" },
  { value: "dice", label: "Dice" },
  { value: "choice", label: "Choice" },
];

export function RandomPicker() {
  const [s, setS] = useToolState<RandomPickerState>("random", INITIAL);

  // Local-only UI state — visual flourish bits that don't need to survive
  // navigation. Derived from sensitive inputs, so kept in memory.
  const [coinFace, setCoinFace] = useState<"heads" | "tails" | null>(null);
  const [diceRolls, setDiceRolls] = useState<number[] | null>(null);
  const [shuffled, setShuffled] = useState<string[] | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);

  // --- handlers ---

  const handleRollInt = () => {
    if (!capabilities.isBrowser) return; // SSR guard
    haptic(8);
    const min = parseInt(s.min, 10);
    const max = parseInt(s.max, 10);
    if (Number.isNaN(min) || Number.isNaN(max)) {
      setS({ result: "" });
      setPickError("Enter numeric Min and Max values.");
      return;
    }
    if (min > max) {
      setS({ result: "" });
      setPickError("Min must be less than or equal to Max.");
      return;
    }
    setPickError(null);
    const value = randomInteger(min, max);
    setS({ result: String(value) });
  };

  const handleFlip = () => {
    if (!capabilities.isBrowser) return; // SSR guard
    haptic(8);
    const face = flipCoin();
    setCoinFace(face);
    setPickError(null);
    setS({ result: face === "heads" ? "Heads" : "Tails" });
  };

  const handleRollDice = () => {
    if (!capabilities.isBrowser) return; // SSR guard
    // Slightly stronger pattern for dice — multi-pulse.
    haptic([8, 20, 8]);
    const count = parseInt(s.diceCount, 10);
    const faces = parseInt(s.diceFaces, 10);
    if (Number.isNaN(count) || Number.isNaN(faces)) {
      setS({ result: "" });
      setDiceRolls(null);
      setPickError("Enter numeric count and faces values.");
      return;
    }
    setPickError(null);
    const { rolls, total } = rollDice(count, faces);
    setDiceRolls(rolls);
    setS({ result: rolls.join(" + ") + " = " + total });
  };

  const handlePick = () => {
    if (!capabilities.isBrowser) return; // SSR guard
    haptic(8);
    const r = pickFromList(s.list);
    if (!r.ok || !r.value) {
      setS({ result: "" });
      setPickError(r.reason ?? "Could not pick an item.");
      return;
    }
    setPickError(null);
    setS({ result: r.value });
  };

  const handleShuffle = () => {
    if (!capabilities.isBrowser) return; // SSR guard
    haptic(8);
    const r = shuffleList(s.list);
    if (!r.ok || !r.value) {
      setShuffled(null);
      setPickError(r.reason ?? "Could not shuffle the list.");
      return;
    }
    setPickError(null);
    setShuffled(r.value);
  };

  const handleReset = () => {
    haptic(8);
    setS({ ...INITIAL, result: "" });
    setCoinFace(null);
    setDiceRolls(null);
    setShuffled(null);
    setPickError(null);
  };

  const onModeChange = (mode: RandomMode) => {
    haptic(8);
    setPickError(null);
    setShuffled(null);
    setDiceRolls(null);
    setCoinFace(null);
    setS({ mode, result: "" });
  };

  // Visual flourish per mode.
  let flourish: React.ReactNode = null;
  if (s.mode === "coin" && coinFace) {
    flourish = (
      <div className="flex justify-center pt-1" aria-hidden>
        <div
          className="h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold text-[var(--color-primary-fg)] bg-[var(--color-primary)] shadow-md ring-2 ring-[var(--color-primary)]"
        >
          {coinFace === "heads" ? "H" : "T"}
        </div>
      </div>
    );
  } else if (s.mode === "dice" && diceRolls && diceRolls.length > 0) {
    flourish = (
      <div className="flex flex-wrap gap-2 justify-center pt-1" aria-hidden>
        {diceRolls.map((r, i) => (
          <div
            key={i}
            className="h-12 w-12 rounded-md flex items-center justify-center text-lg font-semibold text-[var(--color-fg)] bg-[var(--color-surface)] border-2 border-[var(--color-border-strong)] shadow-sm"
          >
            {r}
          </div>
        ))}
      </div>
    );
  }

  const display = s.result ? (
    s.result
  ) : (
    <span className="font-normal text-base sm:text-lg text-[var(--color-fg-subtle)]">
      Press the button to roll
    </span>
  );

  const primaryLabel =
    s.mode === "int"
      ? "Roll"
      : s.mode === "coin"
        ? "Flip coin"
        : s.mode === "dice"
          ? "Roll dice"
          : "Pick one";

  return (
    <div className="flex flex-col gap-5">
      {/* Mode toggle */}
      <div className="flex justify-center sm:justify-start">
        <SegmentedControl<RandomMode>
          options={MODE_OPTIONS}
          value={s.mode}
          onChange={onModeChange}
          ariaLabel="Random mode"
        />
      </div>

      {/* Result — prominent at top */}
      <ResultCard
        label="Result"
        display={display}
        actions={<CopyButton value={s.result} label="Copy" disabled={!s.result} />}
      >
        <div className="flex flex-col gap-2.5">
          {flourish}
          {pickError && (
            <p className="text-xs text-[var(--color-danger)]">{pickError}</p>
          )}
          {s.mode === "choice" && shuffled && shuffled.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="text-xs font-medium text-[var(--color-fg-subtle)] uppercase tracking-wide">
                Shuffled
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto qk-scroll">
                {shuffled.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-fg)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-[var(--color-fg-subtle)] leading-relaxed">
            Uses browser cryptographic randomness. Choice lists and the picked
            value live only in memory and are never persisted.
          </p>
        </div>
      </ResultCard>

      {/* Controls */}
      <div className="qk-card p-4 sm:p-5 flex flex-col gap-4">
        {s.mode === "int" && (
          <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
            <Field
              id="rand-min"
              label="Min"
              type="number"
              inputMode="numeric"
              value={s.min}
              onChange={(e) => setS({ min: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleRollInt();
                }
              }}
              aria-label="Minimum integer"
              hint="Inclusive lower bound. Press Enter to roll."
            />
            <Field
              id="rand-max"
              label="Max"
              type="number"
              inputMode="numeric"
              value={s.max}
              onChange={(e) => setS({ max: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleRollInt();
                }
              }}
              aria-label="Maximum integer"
              hint="Inclusive upper bound. Press Enter to roll."
            />
            <div className="sm:col-span-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleRollInt}
                aria-label="Roll a random integer"
              >
                <Dices size={16} aria-hidden />
                {primaryLabel}
              </Button>
            </div>
          </div>
        )}

        {s.mode === "coin" && (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleFlip}
            aria-label="Flip a coin"
          >
            <Dices size={16} aria-hidden />
            {primaryLabel}
          </Button>
        )}

        {s.mode === "dice" && (
          <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
            <Field
              id="rand-dice-count"
              label="Number of dice"
              type="number"
              min={1}
              max={100}
              step={1}
              inputMode="numeric"
              value={s.diceCount}
              onChange={(e) => setS({ diceCount: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleRollDice();
                }
              }}
              aria-label="Number of dice (1 to 100)"
              hint="1 to 100. Press Enter to roll."
            />
            <Field
              id="rand-dice-faces"
              label="Faces"
              type="number"
              min={2}
              max={1000}
              step={1}
              inputMode="numeric"
              value={s.diceFaces}
              onChange={(e) => setS({ diceFaces: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleRollDice();
                }
              }}
              aria-label="Faces per die (2 to 1000)"
              hint="2 to 1000. Default 6. Press Enter to roll."
            />
            <div className="sm:col-span-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleRollDice}
                aria-label="Roll dice"
              >
                <Dices size={16} aria-hidden />
                {primaryLabel}
              </Button>
            </div>
          </div>
        )}

        {s.mode === "choice" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="rand-list"
                className="text-xs font-medium text-[var(--color-fg-muted)]"
              >
                Items (one per line or comma-separated)
              </label>
              <textarea
                id="rand-list"
                value={s.list}
                onChange={(e) => setS({ list: e.target.value })}
                rows={4}
                spellCheck={false}
                placeholder="apple, banana, cherry"
                aria-describedby="rand-list-hint"
                className="flex-1 min-w-0 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2.5 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-0 resize-y min-h-[120px] leading-relaxed transition-colors"
              />
              <p id="rand-list-hint" className="text-xs text-[var(--color-fg-subtle)]">
                Separate items with commas, semicolons, or new lines. Items live
                only in memory — never persisted or sent to a server.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handlePick}
                aria-label="Pick a random item"
              >
                <Dices size={16} aria-hidden />
                Pick one
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleShuffle}
                aria-label="Shuffle the list"
              >
                <Shuffle size={16} aria-hidden />
                Shuffle
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reset */}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw size={14} aria-hidden />
          Reset
        </Button>
      </div>
    </div>
  );
}

export default RandomPicker;
