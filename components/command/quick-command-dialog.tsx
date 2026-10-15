"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { ArrowRight, CornerDownLeft, Search, X } from "lucide-react";
import { cn } from "@components/ui/cn";
import { useSessionStore } from "@core/runtime/session-store";
import { capabilities } from "@core/platform/capabilities";
import { haptic } from "@core/platform/haptics";
import { suggest } from "./suggestions";
import { runCommand, qrExecuteAsync } from "./executor";
import { parse } from "./parser";
import { CopyButton } from "@components/ui/copy-button";
import { toast } from "@components/ui/toast";
import { AppLink } from "@components/shell/app-link";
import type { CommandResult } from "./types";

/**
 * QuickKit Quick Command — global surface.
 *
 * State / parser / suggestions / results / execution remain shared. The
 * presentation adapts responsively: a centered dialog on desktop, a bottom
 * sheet on mobile. The result surface keeps a stable minimum height so it does
 * not jump unpredictably as results change.
 *
 * Accessible from anywhere via Ctrl/Cmd+K (handled in RuntimeEffects).
 */

export function QuickCommandDialog() {
  const open = useSessionStore((s) => s.cmdOpen);
  const setOpen = useSessionStore((s) => s.setCmdOpen);
  const storedQuery = useSessionStore((s) => s.cmdQuery);
  const setStoredQuery = useSessionStore((s) => s.setCmdQuery);
  const router = useRouter();

  const [input, setInput] = useState(storedQuery);
  const [result, setResult] = useState<CommandResult | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Sync local input when dialog opens; reset preview state.
  useEffect(() => {
    if (open) {
      setInput("");
      setResult(null);
      const id = window.setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  // Persist input to the session store so it survives navigation.
  useEffect(() => {
    if (open) setStoredQuery(input);
  }, [input, open, setStoredQuery]);

  const suggestions = useMemo(() => suggest("", 6), []);

  // Live preview as the user types.
  useEffect(() => {
    if (!input.trim()) {
      setResult(null);
      return;
    }
    const parsed = parse(input);
    if (parsed.intent === "navigate:tool" || parsed.intent === "navigate:page") {
      if (parsed.route) {
        setResult({ ok: true, title: "Open page", value: parsed.raw, route: parsed.route });
        return;
      }
    }
    if (parsed.intent === "qr:generate") {
      setResult({ ok: true, title: "QR Generator", value: "Press Enter to render locally" });
      return;
    }
    if (parsed.intent === "unknown") {
      setResult(null);
      return;
    }
    setResult(runCommand(input));
  }, [input]);

  const submit = async () => {
    if (!input.trim()) return;
    const parsed = parse(input);
    haptic(8);
    if ((parsed.intent === "navigate:tool" || parsed.intent === "navigate:page") && parsed.route) {
      const route = parsed.route;
      setOpen(false);
      router.push(route);
      return;
    }
    if (parsed.intent === "qr:generate") {
      const r = await qrExecuteAsync(parsed);
      setResult(r);
      return;
    }
    if (parsed.intent === "unknown") {
      toast.warning("Unknown command", "Try `10 km to mi`, `20% off 749`, or `#ff6600 to rgb`.");
      return;
    }
    setResult(runCommand(input));
  };

  if (!capabilities.isBrowser || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[95] flex items-end sm:items-start sm:justify-center sm:pt-[10vh] p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Quick Command"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm qk-fade-in"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div className="relative w-full sm:max-w-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-t-2xl sm:rounded-2xl shadow-lg qk-fade-in flex flex-col max-h-[85vh] sm:max-h-[80vh]">
        {/* input row */}
        <div className="flex items-center gap-2 p-3 sm:p-4 border-b border-[var(--color-border)]">
          <Search size={18} className="text-[var(--color-fg-subtle)] shrink-0" aria-hidden />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder="Type a command — e.g. 10 km to mi"
            aria-label="Quick Command input"
            className="flex-1 min-w-0 bg-transparent outline-none text-sm sm:text-base text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)]"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            aria-label="Close Quick Command"
            onClick={() => setOpen(false)}
            className="shrink-0 rounded-md p-1.5 text-[var(--color-fg-subtle)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)] qk-focus-ring"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        {/* result / suggestions surface — stable min-height to avoid thrashing */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-[7rem]">
          {!input.trim() && suggestions.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)] px-1 pb-1">
                Try one of these
              </div>
              {suggestions.map((s) => (
                <button
                  key={`${s.intent}-${s.example}`}
                  type="button"
                  onClick={() => {
                    setInput(s.example);
                    inputRef.current?.focus();
                  }}
                  className="group flex items-center justify-between gap-3 rounded-md px-2 py-2 text-left hover:bg-[var(--color-surface-2)] transition-colors qk-focus-ring"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-mono text-[var(--color-fg)]">{s.example}</div>
                    <div className="text-xs text-[var(--color-fg-subtle)] mt-0.5">{s.summary}</div>
                  </div>
                  <ArrowRight size={14} className="text-[var(--color-fg-subtle)] group-hover:text-[var(--color-primary)] transition-colors shrink-0" aria-hidden />
                </button>
              ))}
            </div>
          )}

          {input.trim() && !result && (
            <div className="text-sm text-[var(--color-fg-subtle)] px-1 py-3">
              No matching command. Try <span className="font-mono text-[var(--color-fg-muted)]">10 km to mi</span>,{" "}
              <span className="font-mono text-[var(--color-fg-muted)]">20% off 749</span>, or{" "}
              <span className="font-mono text-[var(--color-fg-muted)]">#ff6600 to rgb</span>.
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-3">
              <div className="qk-card-inset p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-subtle)]">
                    {result.title ?? "Result"}
                  </div>
                  {result.value && (
                    <div className="text-base sm:text-lg font-semibold text-[var(--color-fg)] mt-1 break-all font-mono">
                      {result.value}
                    </div>
                  )}
                  {result.description && (
                    <div className="text-xs text-[var(--color-fg-muted)] mt-1">{result.description}</div>
                  )}
                  {!result.ok && result.reason && (
                    <div className="text-xs text-[var(--color-danger)] mt-1">{result.reason}</div>
                  )}
                </div>
                {result.value && (
                  <CopyButton value={result.value} iconOnly label="Copy result" className="shrink-0" />
                )}
              </div>
              {result.route && (
                <button
                  type="button"
                  onClick={() => {
                    const route = result.route!;
                    setOpen(false);
                    router.push(route);
                  }}
                  className="self-start inline-flex items-center gap-1.5 rounded-md h-9 px-3 text-sm font-medium bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-accent)] qk-focus-ring"
                >
                  Open <ArrowRight size={14} aria-hidden />
                </button>
              )}
            </div>
          )}
        </div>

        {/* footer helper */}
        <div className="border-t border-[var(--color-border)] px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
          <div className="text-xs text-[var(--color-fg-subtle)]">
            <kbd className="font-mono">Enter</kbd> to run · <kbd className="font-mono">Esc</kbd> to close
          </div>
          <AppLink href="/guide" className="text-xs text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] qk-focus-ring rounded">
            Guide
          </AppLink>
        </div>
      </div>
    </div>,
    document.body
  );
}
