"use client";

/**
 * QuickKit Password & PIN — interactive UI.
 *
 * Generated values exist ONLY in the session store (memory). They are never
 * durably persisted and never sent to a server. Closing the tab clears them.
 */

import { useEffect, useRef } from "react";
import { SegmentedControl } from "@components/ui/segmented-control";
import { Switch } from "@components/ui/switch";
import { Field } from "@components/ui/field";
import { ResultCard } from "@components/ui/result-card";
import { CopyButton } from "@components/ui/copy-button";
import { Button } from "@components/ui/button";
import { useToolState } from "@core/runtime/session-store";
import { haptic } from "@core/platform/haptics";
import {
  generatePassword,
  generatePin,
  estimateStrength,
  type PasswordOptions,
} from "./engine";

type PasswordMode = "password" | "pin";

interface PasswordState {
  mode: PasswordMode;
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  /** The generated value. SENSITIVE — lives in session store only, never persisted. */
  current: string;
}

const INITIAL: PasswordState = {
  mode: "password",
  length: 16,
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false,
  current: "",
};

const STRENGTH_TONE: Record<"Weak" | "Fair" | "Good" | "Strong", string> = {
  Weak: "var(--color-danger)",
  Fair: "var(--color-warning)",
  Good: "var(--color-primary)",
  Strong: "var(--color-success)",
};

/** Pure helper — builds a fresh secret from the given state. */
function doGenerate(state: PasswordState): string {
  if (state.mode === "password") {
    const opts: PasswordOptions = {
      length: state.length,
      lower: state.lower,
      upper: state.upper,
      digits: state.digits,
      symbols: state.symbols,
      excludeAmbiguous: state.excludeAmbiguous,
    };
    return generatePassword(opts);
  }
  return generatePin(state.length);
}

export function Password() {
  const [s, setS] = useToolState<PasswordState>("password", INITIAL);
  const didAutoGenRef = useRef(false);

  // Auto-generate on first mount so the result is never empty when you arrive.
  useEffect(() => {
    if (didAutoGenRef.current) return;
    didAutoGenRef.current = true;
    if (!s.current) {
      setS({ current: doGenerate(s) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = () => {
    haptic(8);
    setS({ current: doGenerate(s) });
  };

  const switchMode = (mode: PasswordMode) => {
    haptic(8);
    // Regenerate on mode switch so the displayed value always matches the mode.
    setS((prev) => ({ mode, current: doGenerate({ ...prev, mode }) }));
  };

  const strength =
    s.mode === "password" && s.current ? estimateStrength(s.current) : null;
  const tone = strength ? STRENGTH_TONE[strength.label] : null;

  const placeholder =
    s.mode === "password"
      ? "Press Generate to create a password…"
      : "Press Generate to create a PIN…";

  const display = s.current ? (
    <span className="font-mono text-xl sm:text-2xl break-all">{s.current}</span>
  ) : (
    <span className="font-normal text-base sm:text-lg text-[var(--color-fg-subtle)]">
      {placeholder}
    </span>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Mode toggle */}
      <div className="flex justify-center sm:justify-start">
        <SegmentedControl<PasswordMode>
          options={[
            { value: "password", label: "Password" },
            { value: "pin", label: "PIN" },
          ]}
          value={s.mode}
          onChange={switchMode}
          ariaLabel="Generation mode"
        />
      </div>

      {/* Result — prominent at top */}
      <ResultCard
        label={s.mode === "password" ? "Password" : "PIN"}
        display={display}
        actions={
          <CopyButton value={s.current} label="Copy" disabled={!s.current} />
        }
      >
        <div className="flex flex-col gap-2.5">
          {strength && tone && (
            <span
              className="inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-xs font-medium"
              style={{
                backgroundColor: `color-mix(in srgb, ${tone} 12%, transparent)`,
                color: tone,
              }}
              aria-label={`Strength: ${strength.label}, ${strength.bits} bits of entropy`}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: tone }}
                aria-hidden
              />
              {strength.label} · {strength.bits} bits
            </span>
          )}
          <p className="text-xs text-[var(--color-fg-subtle)] leading-relaxed">
            Generated with browser cryptographic randomness. Not persisted.
            Closing this tab clears it.
          </p>
        </div>
      </ResultCard>

      {/* Controls — 2 columns on desktop, stacked on mobile */}
      <div className="grid gap-5 sm:grid-cols-2 sm:items-start">
        {/* Left: length field + Generate button */}
        <div className="qk-card p-4 sm:p-5 flex flex-col gap-4">
          {s.mode === "password" ? (
            <Field
              id="pw-length"
              label="Length"
              type="number"
              min={4}
              max={128}
              step={1}
              value={s.length}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (!Number.isNaN(n)) setS({ length: n });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  generate();
                }
              }}
              hint="Between 4 and 128 characters. Press Enter to generate."
            />
          ) : (
            <Field
              id="pin-length"
              label="PIN length"
              type="number"
              min={1}
              max={32}
              step={1}
              value={s.length}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (!Number.isNaN(n)) setS({ length: n });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  generate();
                }
              }}
              hint="Between 1 and 32 digits. Press Enter to generate."
            />
          )}
          <Button
            variant="primary"
            size="lg"
            onClick={generate}
            className="w-full"
          >
            Generate {s.mode === "password" ? "password" : "PIN"}
          </Button>
        </div>

        {/* Right: switches (password) or info (PIN) */}
        <div className="qk-card p-4 sm:p-5 flex flex-col gap-3.5">
          {s.mode === "password" ? (
            <>
              <Switch
                checked={s.lower}
                onChange={(v) => setS({ lower: v })}
                label="lowercase (a–z)"
              />
              <Switch
                checked={s.upper}
                onChange={(v) => setS({ upper: v })}
                label="UPPERCASE (A–Z)"
              />
              <Switch
                checked={s.digits}
                onChange={(v) => setS({ digits: v })}
                label="digits (0–9)"
              />
              <Switch
                checked={s.symbols}
                onChange={(v) => setS({ symbols: v })}
                label={"symbols (!@#$%^&*)"}
              />
              <Switch
                checked={s.excludeAmbiguous}
                onChange={(v) => setS({ excludeAmbiguous: v })}
                label="Exclude ambiguous (Il1O0oS5B8|)"
                description="Removes look-alike characters for easier manual entry."
              />
            </>
          ) : (
            <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
              PINs use digits 0–9 only. Each digit is drawn independently using
              rejection-sampled cryptographic randomness for an unbiased
              distribution. A 6-digit PIN has roughly 19.93 bits of entropy.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Password;
