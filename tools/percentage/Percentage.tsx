"use client";

import { useMemo, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { SegmentedControl } from "@components/ui/segmented-control";
import { Field } from "@components/ui/field";
import { ResultCard } from "@components/ui/result-card";
import { CopyButton } from "@components/ui/copy-button";
import { Button } from "@components/ui/button";
import { useToolState } from "@core/runtime/session-store";
import { haptic } from "@core/platform/haptics";
import {
  percentOf,
  discount,
  tip,
  change,
  formatMoney,
  formatNumber,
} from "./engine";

type Mode = "percentOf" | "discount" | "tip" | "change";

interface PercentageState {
  mode: Mode;
  value1: string;
  value2: string;
}

const MODE_OPTIONS: { value: Mode; label: string; short?: string }[] = [
  { value: "percentOf", label: "Percent of", short: "Percent" },
  { value: "discount", label: "Discount" },
  { value: "tip", label: "Tip" },
  { value: "change", label: "% Change" },
];

const INITIAL: PercentageState = {
  mode: "discount",
  value1: "749",
  value2: "20",
};

/** Parse a user-typed string into a number (tolerates commas and whitespace). */
function toNum(s: string): number {
  const v = parseFloat(String(s).replace(/,/g, "").trim());
  return Number.isFinite(v) ? v : NaN;
}

interface View {
  label: string;
  display: string;
  description?: string;
  copyValue: string;
}

/**
 * Percentage & Money — interactive UI.
 *
 * State is held in the shared SessionStore via `useToolState("percentage", ...)`
 * so it survives client navigation (Back/Forward) without being persisted.
 * All math is delegated to the pure engine in `./engine.ts` — the same engine
 * the Quick Command bar calls. No duplicated logic.
 */
export function Percentage() {
  const [s, setS] = useToolState("percentage", INITIAL);

  // Per-mode field configuration (label + adornments + which session value).
  const fields = useMemo(() => {
    const base = {
      v1: s.value1,
      v2: s.value2,
      prefix1: undefined as ReactNode,
      suffix1: undefined as ReactNode,
      prefix2: undefined as ReactNode,
      suffix2: undefined as ReactNode,
    };
    switch (s.mode) {
      case "percentOf":
        return { ...base, l1: "Value", l2: "Percent (%)" };
      case "discount":
        return { ...base, l1: "Price ($)", l2: "Discount (%)", prefix1: <span>$</span> };
      case "tip":
        return { ...base, l1: "Amount ($)", l2: "Tip (%)", prefix1: <span>$</span> };
      case "change":
        return { ...base, l1: "From", l2: "To" };
      default: {
        const _exhaustive: never = s.mode;
        void _exhaustive;
        throw new Error(`Unknown percentage mode: ${String(s.mode)}`);
      }
    }
  }, [s.mode, s.value1, s.value2]);

  // Compute the displayed result via the engine.
  const view = useMemo<View>(() => {
    const a = toNum(s.value1);
    const b = toNum(s.value2);

    if (s.mode === "percentOf") {
      const r = percentOf(b, a);
      if (!r.ok || r.value === undefined) {
        return {
          label: "Result",
          display: "—",
          description: r.reason,
          copyValue: "",
        };
      }
      const disp = formatNumber(r.value);
      return { label: "Result", display: disp, copyValue: disp };
    }

    if (s.mode === "discount") {
      const r = discount(a, b);
      if (!r.ok || r.final === undefined || r.discount === undefined) {
        return {
          label: "Final price",
          display: "—",
          description: r.reason,
          copyValue: "",
        };
      }
      const disp = `${formatMoney(r.final)} (save ${formatMoney(r.discount)})`;
      return { label: "Final price", display: disp, copyValue: disp };
    }

    if (s.mode === "tip") {
      const r = tip(a, b);
      if (!r.ok || r.tip === undefined || r.total === undefined) {
        return {
          label: "Tip",
          display: "—",
          description: r.reason,
          copyValue: "",
        };
      }
      const disp = `${formatMoney(r.tip)} tip`;
      return {
        label: "Tip",
        display: disp,
        description: `Total: ${formatMoney(r.total)}`,
        copyValue: disp,
      };
    }

    // change
    const r = change(a, b);
    if (!r.ok || r.percent === undefined || r.direction === undefined) {
      return {
        label: "Percentage change",
        display: "—",
        description: r.reason,
        copyValue: "",
      };
    }
    const sign =
      r.direction === "increase" ? "+" : r.direction === "decrease" ? "\u2212" : "";
    const disp = `${sign}${formatNumber(r.percent)}%`;
    const dirLabel =
      r.direction === "increase"
        ? "Increase"
        : r.direction === "decrease"
        ? "Decrease"
        : "No change";
    return {
      label: "Percentage change",
      display: disp,
      description: dirLabel,
      copyValue: disp,
    };
  }, [s.mode, s.value1, s.value2]);

  const handleReset = () => {
    haptic(8);
    setS(INITIAL);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="qk-card p-4 sm:p-5 flex flex-col gap-4">
        <SegmentedControl
          options={MODE_OPTIONS}
          value={s.mode}
          onChange={(m) => setS({ mode: m })}
          ariaLabel="Percentage calculation mode"
          className="w-full sm:w-auto justify-start flex-wrap"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="pct-value1"
            label={fields.l1}
            prefix={fields.prefix1}
            suffix={fields.suffix1}
            value={fields.v1}
            onChange={(e) => setS({ value1: e.target.value })}
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            placeholder="0"
            aria-label={fields.l1}
          />
          <Field
            id="pct-value2"
            label={fields.l2}
            prefix={fields.prefix2}
            suffix={fields.suffix2}
            value={fields.v2}
            onChange={(e) => setS({ value2: e.target.value })}
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            placeholder="0"
            aria-label={fields.l2}
          />
        </div>

        <ResultCard
          label={view.label}
          display={view.display}
          actions={
            <CopyButton
              value={view.copyValue}
              label={`Copy ${view.label}`}
              disabled={!view.copyValue}
            />
          }
        >
          {view.description && (
            <p className="text-sm text-[var(--color-fg-muted)]">
              {view.description}
            </p>
          )}
        </ResultCard>

        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            aria-label="Reset to default values"
          >
            <RotateCcw size={14} aria-hidden />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
