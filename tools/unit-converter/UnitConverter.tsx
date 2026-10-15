"use client";

/**
 * QuickKit Unit Converter — interactive client island.
 *
 * Reads/writes its working state through the shared session store
 * (`useToolState<"unit-converter">`). All unit math is delegated to the
 * pure-TS engine (`@tools/unit-converter/engine`). No math is
 * duplicated here; no localStorage is touched directly.
 */

import { ArrowLeftRight } from "lucide-react";
import { SegmentedControl } from "@components/ui/segmented-control";
import { Field } from "@components/ui/field";
import { Select } from "@components/ui/select";
import { ResultCard } from "@components/ui/result-card";
import { CopyButton } from "@components/ui/copy-button";
import { IconButton } from "@components/ui/icon-button";
import { useToolState } from "@core/runtime/session-store";
import { haptic } from "@core/platform/haptics";
import {
  convert,
  categories,
  getCategory,
} from "@tools/unit-converter/engine";
import type {
  ConversionResult,
  UnitCategory,
} from "@tools/unit-converter/types";

interface UnitConverterState {
  category: UnitCategory;
  /** Raw user input string — kept as a string so partial typing ("1.") is
   * never fighting the input. Parsed to a number at compute time. */
  value: string;
  from: string;
  to: string;
}

const INITIAL: UnitConverterState = {
  category: "length",
  value: "10",
  from: "km",
  to: "mi",
};

export function UnitConverter() {
  const [s, setS] = useToolState<UnitConverterState>("unit-converter", INITIAL);
  const { category, value, from, to } = s;

  // Category options for the SegmentedControl.
  const categoryOptions = categories().map((c) => ({
    value: c.id,
    label: c.label,
  }));

  // Unit options for the current category.
  const cat = getCategory(category);
  const unitOptions = cat.units.map((u) => ({
    value: u.id,
    label: `${u.label} (${u.symbol})`,
  }));
  const fromUnit = cat.units.find((u) => u.id === from);
  const toUnit = cat.units.find((u) => u.id === to);

  // When the category changes, reset from/to to the first two units of the
  // new category. The value is preserved so the user's number carries over.
  function handleCategoryChange(next: UnitCategory) {
    const c = getCategory(next);
    const first = c.units[0]?.id ?? "";
    const second = c.units[1]?.id ?? first;
    setS({ category: next, from: first, to: second });
  }

  // Swap from/to. Use the functional form so we read the latest state.
  function handleSwap() {
    haptic(8);
    setS((prev) => ({ from: prev.to, to: prev.from }));
  }

  // Compute the conversion with graceful invalid-input handling — never
  // crashes, always shows a friendly hint.
  const trimmed = value.trim();
  const numericValue = Number(trimmed);
  const valueIsEmpty = trimmed === "";
  const valueIsValid = !valueIsEmpty && Number.isFinite(numericValue);

  let result: ConversionResult;
  if (valueIsValid) {
    result = convert({ category, value: numericValue, from, to });
  } else {
    result = {
      ok: false,
      reason: valueIsEmpty
        ? "Enter a value to convert."
        : "Enter a valid number.",
    };
  }

  const display = result.ok
    ? `${result.formatted ?? ""} ${toUnit?.symbol ?? ""}`.trim()
    : "—";
  const copyValue =
    result.ok && result.value !== undefined ? String(result.value) : "";

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* category segmented control — wraps to a second row on small screens */}
      <div className="w-full">
        <SegmentedControl<UnitCategory>
          options={categoryOptions}
          value={category}
          onChange={handleCategoryChange}
          ariaLabel="Unit category"
          className="w-full sm:w-auto flex-wrap"
        />
      </div>

      {/* main form card */}
      <div className="qk-card p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
          <Field
            id="uc-value"
            label="Value"
            type="text"
            inputMode="decimal"
            placeholder="Enter a value"
            value={value}
            onChange={(e) => setS({ value: e.target.value })}
            invalid={!valueIsEmpty && !valueIsValid}
            aria-label="Value to convert"
            suffix={fromUnit ? <span aria-hidden>{fromUnit.symbol}</span> : undefined}
          />

          <Select
            id="uc-from"
            label="From"
            options={unitOptions}
            value={from}
            onChange={(e) => setS({ from: e.target.value })}
          />

          {/* Swap button — sits visually between From and To on desktop,
              centered on its own row on mobile. */}
          <div className="flex items-end justify-center sm:pb-1">
            <IconButton
              onClick={handleSwap}
              label="Swap units"
              className="h-11 w-11 border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              <ArrowLeftRight size={16} aria-hidden />
            </IconButton>
          </div>

          <Select
            id="uc-to"
            label="To"
            options={unitOptions}
            value={to}
            onChange={(e) => setS({ to: e.target.value })}
          />
        </div>
      </div>

      {/* result */}
      <ResultCard
        label="Result"
        display={display}
        actions={
          result.ok ? <CopyButton value={copyValue} label="Copy value" /> : undefined
        }
      >
        {!result.ok && (
          <p className="text-sm text-[var(--color-fg-muted)]">
            {result.reason ?? "Unable to convert."}
          </p>
        )}
      </ResultCard>
    </div>
  );
}
