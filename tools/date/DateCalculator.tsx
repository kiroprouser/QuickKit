"use client";

import { useEffect, useMemo, useRef } from "react";
import { SegmentedControl } from "@components/ui/segmented-control";
import { Field } from "@components/ui/field";
import { Select } from "@components/ui/select";
import { ResultCard } from "@components/ui/result-card";
import { CopyButton } from "@components/ui/copy-button";
import { Button } from "@components/ui/button";
import { useToolState } from "@core/runtime/session-store";
import { haptic } from "@core/platform/haptics";
import {
  diff,
  add,
  subtract,
  today,
  type DateDuration,
} from "./engine";

type Mode = "diff" | "add" | "subtract";
type DurationUnit = "days" | "weeks" | "months" | "years";

interface DateState {
  mode: Mode;
  from: string;
  to: string;
  date: string;
  durationValue: string;
  durationUnit: DurationUnit;
}

// Initial state. Date strings start empty and are populated with today() on
// first client mount (in useEffect). today() is non-deterministic (depends on
// the browser clock); using it directly in INITIAL would mismatch the
// statically-exported SSR HTML against the hydrated client state.
const INITIAL: DateState = {
  mode: "diff",
  from: "",
  to: "",
  date: "",
  durationValue: "90",
  durationUnit: "days",
};

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: "diff", label: "Difference" },
  { value: "add", label: "Add" },
  { value: "subtract", label: "Subtract" },
];

const UNIT_OPTIONS: { value: DurationUnit; label: string }[] = [
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
];

/** "1 day" / "2 days" / "-1 day" — matches the engine's own pluralization. */
function pluralize(n: number, unit: DurationUnit): string {
  const singular = unit.slice(0, -1); // day | week | month | year
  const abs = Math.abs(n);
  return `${n} ${abs === 1 ? singular : unit}`;
}

interface DateView {
  label: string;
  display: string;
  description?: string;
  copyValue: string;
}

/**
 * Date Calculator — interactive UI.
 *
 * Working state is held in the shared SessionStore via `useToolState("date", …)`
 * so it survives client navigation (Back/Forward) without being persisted.
 * All math is delegated to the pure engine in `./engine.ts` — the same engine
 * the Quick Command bar calls. No duplicated math, no localStorage.
 */
export function DateCalculator() {
  const [s, setS] = useToolState<DateState>("date", INITIAL);
  const didInitTodayRef = useRef(false);

  // First client mount: populate empty dates with today(). Ref-guarded so it
  // runs exactly once per component lifecycle (not on every session-restored
  // navigation — the `||` short-circuit preserves user-typed values).
  useEffect(() => {
    if (didInitTodayRef.current) return;
    didInitTodayRef.current = true;
    setS((prev) => {
      const t = today();
      return {
        from: prev.from || t,
        to: prev.to || t,
        date: prev.date || t,
      };
    });
  }, [setS]);

  // Compute the view model via the pure engine.
  const view = useMemo<DateView>(() => {
    if (s.mode === "diff") {
      const r = diff(s.from, s.to);
      if (
        !r.ok ||
        r.days === undefined ||
        r.weeks === undefined ||
        r.human === undefined
      ) {
        return {
          label: "Difference",
          display: "—",
          description: r.reason,
          copyValue: "",
        };
      }

      // The engine's calendar breakdown assumes from <= to. For from > to it
      // produces a confusing borrow-overflow (e.g. "1 year 9 months 18 days"
      // for a 72-day backward span). Recompute with swapped args to surface
      // the correct non-negative breakdown, and prefix the total with −.
      if (r.days < 0) {
        const r2 = diff(s.to, s.from);
        if (
          r2.ok &&
          r2.days !== undefined &&
          r2.weeks !== undefined &&
          r2.human !== undefined
        ) {
          const disp = `\u2212${r2.days} days`;
          const desc = `${r2.human} \u00b7 ${r2.weeks} weeks`;
          const copy = `\u2212${r2.days} days (${r2.human}, ${r2.weeks} weeks)`;
          return {
            label: "Difference",
            display: disp,
            description: desc,
            copyValue: copy,
          };
        }
      }

      const disp = `${r.days} days`;
      const desc = `${r.human} \u00b7 ${r.weeks} weeks`;
      const copy = `${r.days} days (${r.human}, ${r.weeks} weeks)`;
      return {
        label: "Difference",
        display: disp,
        description: desc,
        copyValue: copy,
      };
    }

    // add / subtract
    const amount = parseInt(s.durationValue, 10);
    if (!Number.isFinite(amount)) {
      return {
        label: s.mode === "add" ? "Add" : "Subtract",
        display: "—",
        description: "Enter a whole number of units.",
        copyValue: "",
      };
    }
    const duration: DateDuration = { [s.durationUnit]: amount };
    const r =
      s.mode === "add" ? add(s.date, duration) : subtract(s.date, duration);
    if (!r.ok || !r.date) {
      return {
        label: s.mode === "add" ? "Add" : "Subtract",
        display: "—",
        description: r.reason,
        copyValue: "",
      };
    }
    const op = s.mode === "add" ? "Add" : "Subtract";
    const dir = s.mode === "add" ? "to" : "from";
    const disp = r.date;
    const desc = `${op} ${pluralize(amount, s.durationUnit)} ${dir} ${s.date}`;
    return {
      label: s.mode === "add" ? "Add" : "Subtract",
      display: disp,
      description: desc,
      copyValue: r.date,
    };
  }, [
    s.mode,
    s.from,
    s.to,
    s.date,
    s.durationValue,
    s.durationUnit,
  ]);

  const handleModeChange = (m: Mode) => {
    haptic(8);
    setS({ mode: m });
  };

  const handleToday = (field: "from" | "to" | "date") => {
    haptic(8);
    const t = today();
    if (field === "from") setS({ from: t });
    else if (field === "to") setS({ to: t });
    else setS({ date: t });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="qk-card p-4 sm:p-5 flex flex-col gap-4">
        <SegmentedControl
          options={MODE_OPTIONS}
          value={s.mode}
          onChange={handleModeChange}
          ariaLabel="Date calculation mode"
          className="w-full sm:w-auto justify-start flex-wrap"
        />

        {s.mode === "diff" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <DateField
              id="date-from"
              label="From"
              value={s.from}
              onChange={(v) => setS({ from: v })}
              onToday={() => handleToday("from")}
            />
            <DateField
              id="date-to"
              label="To"
              value={s.to}
              onChange={(v) => setS({ to: v })}
              onToday={() => handleToday("to")}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <DateField
              id="date-start"
              label="Start date"
              value={s.date}
              onChange={(v) => setS({ date: v })}
              onToday={() => handleToday("date")}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="date-amount"
                label="Amount"
                type="number"
                inputMode="numeric"
                step={1}
                value={s.durationValue}
                onChange={(e) => setS({ durationValue: e.target.value })}
                autoComplete="off"
                placeholder="0"
                aria-label="Amount"
              />
              <Select
                id="date-unit"
                label="Unit"
                options={UNIT_OPTIONS}
                value={s.durationUnit}
                onChange={(e) =>
                  setS({ durationUnit: e.target.value as DurationUnit })
                }
                aria-label="Unit"
              />
            </div>
          </div>
        )}

        <ResultCard
          label={view.label}
          display={view.display}
          actions={
            <CopyButton
              value={view.copyValue}
              label="Copy"
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
      </div>
    </div>
  );
}

interface DateFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onToday: () => void;
}

/**
 * Date field = `Field` (type=date) with a small "Today" ghost `Button` rendered
 * in the label row (right-aligned) so the field's accessible label and the
 * helper button share the same baseline. Uses the shared `Field` primitive for
 * visual parity with the other tools.
 */
function DateField({ id, label, value, onChange, onToday }: DateFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="text-xs font-medium text-[var(--color-fg-muted)]"
        >
          {label}
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToday}
          className="h-6 px-2 text-[11px]"
          aria-label={`Set ${label.toLowerCase()} to today`}
        >
          Today
        </Button>
      </div>
      <Field
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      />
    </div>
  );
}
