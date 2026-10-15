"use client";

import { useMemo } from "react";
import { Copy } from "lucide-react";
import { Field } from "@components/ui/field";
import { ResultCard } from "@components/ui/result-card";
import { CopyButton } from "@components/ui/copy-button";
import { Button } from "@components/ui/button";
import { useToolState } from "@core/runtime/session-store";
import { haptic } from "@core/platform/haptics";
import { copyText } from "@core/platform/clipboard";
import { toast } from "@components/ui/toast";
import {
  parseColor,
  formatHex,
  formatRgb,
  formatHsl,
  type ColorFormat,
} from "./engine";

interface ColorState {
  input: string;
}

const INITIAL: ColorState = {
  input: "#ff6600",
};

const FORMAT_LABEL: Record<ColorFormat, string> = {
  hex: "HEX",
  rgb: "RGB",
  hsl: "HSL",
};

/**
 * Color Converter — interactive UI.
 *
 * State is held in the shared SessionStore via `useToolState("color", ...)`
 * so it survives client navigation (Back/Forward) without being persisted.
 * All parsing/formatting is delegated to the pure engine in `./engine.ts` —
 * the same engine the Quick Command bar calls. No duplicated logic.
 *
 * Layout: live preview (left) + conversions (right) on desktop; stacked on
 * mobile. The preview square is the hero — it shows the exact color string
 * the user typed (as a CSS background) so the result is always trustworthy.
 */
export function ColorConverter() {
  const [s, setS] = useToolState<ColorState>("color", INITIAL);

  const parsed = useMemo(() => parseColor(s.input), [s.input]);
  const valid = parsed !== null;

  const hex = parsed ? formatHex(parsed.rgb) : "";
  const rgb = parsed ? formatRgb(parsed.rgb) : "";
  const hsl = parsed ? formatHsl(parsed.rgb) : "";
  const allFormats = valid ? `${hex}\n${rgb}\n${hsl}` : "";

  const handleCopyAll = async () => {
    if (!valid) return;
    const ok = await copyText(allFormats);
    haptic(8);
    if (ok) {
      toast.success(
        "Copied all formats",
        "HEX, RGB, and HSL on separate lines"
      );
    } else {
      toast.danger(
        "Copy failed",
        "Clipboard access was blocked by the browser."
      );
    }
  };

  // Only flag the field invalid when there's actual non-empty content that
  // failed to parse — empty input is just "no input yet".
  const fieldInvalid = s.input.trim().length > 0 && !valid;

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
      {/* LEFT: live preview + input */}
      <div className="qk-card p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">
            Live preview
          </div>
          {valid && parsed && (
            <span
              className="inline-flex items-center rounded-full px-2.5 h-6 text-[10px] font-semibold tracking-wide bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary-soft)]"
              aria-label={`Detected input format: ${FORMAT_LABEL[parsed.format]}`}
            >
              {FORMAT_LABEL[parsed.format]}
            </span>
          )}
        </div>

        <div
          className="relative w-full rounded-md border-4 border-white shadow-sm overflow-hidden"
          style={{
            minHeight: 220,
            background: valid ? s.input : "var(--color-surface-2)",
          }}
          role="img"
          aria-label={
            valid
              ? `Preview of color ${s.input}`
              : "Invalid color — preview unavailable"
          }
        >
          {!valid && (
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-[var(--color-fg-subtle)]">
              Invalid color
            </div>
          )}
        </div>

        <Field
          id="color-input"
          label="Color input"
          hint="HEX (#ff6600), RGB (rgb(255,102,0)), or HSL (hsl(24,100%,50%))."
          value={s.input}
          onChange={(e) => setS({ input: e.target.value })}
          invalid={fieldInvalid}
          autoComplete="off"
          spellCheck={false}
          placeholder="#ff6600"
          aria-label="Color input"
          className="font-mono"
        />
      </div>

      {/* RIGHT: conversions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">
            Conversions
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyAll}
            disabled={!valid}
            aria-label="Copy all three color formats (HEX, RGB, HSL)"
          >
            <Copy size={14} aria-hidden />
            Copy all
          </Button>
        </div>

        {valid ? (
          <div className="flex flex-col gap-3">
            <ResultCard
              label="HEX"
              display={<span className="font-mono text-xl sm:text-2xl">{hex}</span>}
              actions={<CopyButton value={hex} label="Copy HEX" />}
            />
            <ResultCard
              label="RGB"
              display={<span className="font-mono text-xl sm:text-2xl">{rgb}</span>}
              actions={<CopyButton value={rgb} label="Copy RGB" />}
            />
            <ResultCard
              label="HSL"
              display={<span className="font-mono text-xl sm:text-2xl">{hsl}</span>}
              actions={<CopyButton value={hsl} label="Copy HSL" />}
            />
          </div>
        ) : (
          <ResultCard label="Result">
            <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
              Could not parse a color. Try a HEX string like{" "}
              <span className="font-mono text-[var(--color-fg)]">#ff6600</span>,
              an RGB triplet like{" "}
              <span className="font-mono text-[var(--color-fg)]">rgb(255, 102, 0)</span>,
              or an HSL triplet like{" "}
              <span className="font-mono text-[var(--color-fg)]">hsl(24, 100%, 50%)</span>.
            </p>
          </ResultCard>
        )}
      </div>
    </div>
  );
}
