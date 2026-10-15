"use client";

/**
 * QuickKit Text Tools — interactive UI.
 *
 * Raw text is held ONLY in the session store (memory). It is never durably
 * persisted and never sent to a server. Closing the tab clears it. All
 * counting and transformations are delegated to the pure engine in
 * `./engine.ts` — the same engine the Quick Command bar calls. No duplicated
 * logic.
 */

import { stats, transform, type TransformOp } from "./engine";
import { Button } from "@components/ui/button";
import { CopyButton } from "@components/ui/copy-button";
import { ResultCard } from "@components/ui/result-card";
import { useToolState } from "@core/runtime/session-store";
import { haptic } from "@core/platform/haptics";

interface TextState {
  /** Raw text — SENSITIVE. Lives in session store only, never persisted. */
  input: string;
  op: TransformOp;
  output: string;
}

const INITIAL: TextState = {
  input: "",
  op: "upper",
  output: "",
};

const OPS: { value: TransformOp; label: string }[] = [
  { value: "upper", label: "UPPER" },
  { value: "lower", label: "lower" },
  { value: "title", label: "Title" },
  { value: "sentence", label: "Sentence" },
  { value: "trim", label: "Trim" },
  { value: "collapse", label: "Collapse" },
  { value: "normalizeLineEndings", label: "Normalize" },
];

export function TextTools() {
  const [s, setS] = useToolState<TextState>("text", INITIAL);
  const textStats = stats(s.input);

  const apply = (op: TransformOp) => {
    haptic(8);
    setS({ op, output: transform(s.input, op) });
  };

  const statChips: { label: string; value: number }[] = [
    { label: "Words", value: textStats.words },
    { label: "Characters", value: textStats.characters },
    { label: "Characters (no spaces)", value: textStats.charactersNoSpaces },
    { label: "Lines", value: textStats.lines },
    { label: "Sentences", value: textStats.sentences },
    { label: "Paragraphs", value: textStats.paragraphs },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      {/* Input column — stats + textarea + transform buttons */}
      <div className="qk-card p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">
            Input
          </h2>
          <span className="text-xs text-[var(--color-fg-subtle)]">
            Held in memory only
          </span>
        </div>

        {/* Stats grid */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-2"
          role="group"
          aria-label="Text statistics"
        >
          {statChips.map((c) => (
            <div
              key={c.label}
              className="qk-card-inset p-2 flex flex-col gap-0.5"
            >
              <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">
                {c.label}
              </span>
              <span className="text-sm font-semibold text-[var(--color-fg)] tabular-nums">
                {c.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          aria-label="Text to analyze"
          placeholder="Paste or type text here…"
          value={s.input}
          onChange={(e) => setS({ input: e.target.value })}
          className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md px-3 py-2.5 text-sm text-[var(--color-fg)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-ring)] min-h-[160px] resize-y placeholder:text-[var(--color-fg-subtle)]"
        />

        {/* Transform buttons */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">
            Transform
          </h3>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Text transformations"
          >
            {OPS.map((o) => {
              const active = s.op === o.value;
              return (
                <Button
                  key={o.value}
                  size="sm"
                  variant={active ? "primary" : "secondary"}
                  aria-pressed={active}
                  onClick={() => apply(o.value)}
                >
                  {o.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Output column — ResultCard with the transformed text */}
      <ResultCard
        label="Output"
        actions={
          <CopyButton value={s.output} label="Copy" disabled={!s.output} />
        }
      >
        {s.output ? (
          <div className="whitespace-pre-wrap break-words font-mono text-sm text-[var(--color-fg)] max-h-[420px] overflow-y-auto">
            {s.output}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-fg-subtle)]">
            Pick a transformation above to see the result.
          </p>
        )}
      </ResultCard>
    </div>
  );
}

export default TextTools;
