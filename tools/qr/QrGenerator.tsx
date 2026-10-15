"use client";

import { useState, useMemo, useCallback } from "react";
import { Download, ImageDown, Loader2, QrCode } from "lucide-react";
import { useToolState } from "@core/runtime/session-store";
import { capabilities } from "@core/platform/capabilities";
import { haptic } from "@core/platform/haptics";
import { toast } from "@components/ui/toast";
import { Button } from "@components/ui/button";
import { SegmentedControl } from "@components/ui/segmented-control";
import { CopyButton } from "@components/ui/copy-button";
import { cn } from "@components/ui/cn";
import {
  classifyPayload,
  generateQr,
  validatePayload,
  type EccLevel,
  type QrResult,
} from "./engine";

/**
 * QR Generator tool UI.
 *
 * Pure client component. Generates QR codes entirely in the browser. No
 * payload leaves the device — the engine uses the `qrcode` library directly
 * in the browser, and the payload/result live only in memory (SessionStore).
 */

const ECC_OPTIONS: { value: EccLevel; label: string; short: string }[] = [
  { value: "L", label: "L (7%)", short: "L" },
  { value: "M", label: "M (15%)", short: "M" },
  { value: "Q", label: "Q (25%)", short: "Q" },
  { value: "H", label: "H (30%)", short: "H" },
];

interface QrSessionState {
  payload: string;
  ecc: EccLevel;
  size: number;
  // Allow assignment to ToolStateBag (Record<string, unknown>).
  [key: string]: unknown;
}

const INITIAL_STATE: QrSessionState = {
  payload: "https://quickkit-59o.pages.dev",
  ecc: "M",
  size: 512,
};

export function QrGenerator() {
  const [state, setState] = useToolState<QrSessionState>("qr", INITIAL_STATE);
  const { payload, ecc, size } = state;

  // Local-only UI state (not persisted, not session-restored — generated on demand).
  const [result, setResult] = useState<QrResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const validation = useMemo(() => validatePayload(payload), [payload]);
  const classification = useMemo(() => classifyPayload(payload), [payload]);

  const handleGenerate = useCallback(async () => {
    if (!capabilities.isBrowser) return; // SSR guard
    if (!validation.ok) {
      toast.danger("Cannot generate", validation.reason ?? "Invalid payload.");
      haptic(8);
      return;
    }
    setIsGenerating(true);
    haptic(8);
    try {
      const res = await generateQr(payload, { size, ecc });
      setResult(res);
      if (!res.ok) {
        toast.danger("Generation failed", res.reason ?? "Could not generate the QR code.");
      } else {
        toast.success("QR generated", "Ready to download or copy.");
      }
    } finally {
      setIsGenerating(false);
    }
  }, [payload, ecc, size, validation]);

  const handleDownloadPng = useCallback(() => {
    if (!result?.ok || !result.dataUrl) return;
    haptic(8);
    // Anchor with download attribute — no programmatic click needed; it's a link.
  }, [result]);

  const handleDownloadSvg = useCallback(async () => {
    if (!result?.ok || !result.svg) return;
    haptic(8);
    try {
      const blob = new Blob([result.svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "quickkit-qr.svg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Defer revoke so the download has time to start.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("SVG downloaded", "Saved as quickkit-qr.svg");
    } catch {
      toast.danger("Download failed", "Could not save the SVG file.");
    }
  }, [result]);

  const payloadInvalid = !validation.ok;
  const hasImage = result?.ok && !!result.dataUrl;
  const altText = `QR code encoding ${classification === "url" ? "the URL" : "the text"}: ${payload.slice(0, 80)}`;

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 lg:items-start">
      {/* ---------- Controls (left column on desktop) ---------- */}
      <div className="qk-card p-4 sm:p-6 flex flex-col gap-4">
        {/* Payload input — custom textarea styled like Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="qr-payload"
              className="text-xs font-medium text-[var(--color-fg-muted)]"
            >
              Text or URL to encode
            </label>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                "border border-[var(--color-border)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
              )}
              aria-label={`Payload type: ${classification}`}
            >
              <QrCode size={10} aria-hidden />
              {classification === "url" ? "URL" : "Text"}
            </span>
          </div>
          <div
            className={cn(
              "flex items-stretch rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)]",
              "focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-ring)] focus-within:ring-offset-0",
              payloadInvalid &&
                "border-[var(--color-danger)] focus-within:border-[var(--color-danger)] focus-within:ring-[var(--color-danger)]",
              "transition-colors"
            )}
          >
            <textarea
              id="qr-payload"
              value={payload}
              onChange={(e) => setState({ payload: e.target.value })}
              rows={3}
              spellCheck={false}
              placeholder="https://example.com or any text"
              aria-invalid={payloadInvalid || undefined}
              aria-describedby="qr-payload-hint"
              className={cn(
                "flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm text-[var(--color-fg)]",
                "placeholder:text-[var(--color-fg-subtle)] outline-none resize-y min-h-[88px] leading-relaxed"
              )}
            />
          </div>
          <p
            id="qr-payload-hint"
            className={cn(
              "text-xs",
              payloadInvalid
                ? "text-[var(--color-danger)]"
                : "text-[var(--color-fg-subtle)]"
            )}
          >
            {payloadInvalid
              ? validation.reason
              : `${payload.length.toLocaleString()} / 1,500 characters • ${size}px output`}
          </p>
        </div>

        {/* ECC segmented control */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-medium text-[var(--color-fg-muted)]"
            htmlFor="qr-ecc"
          >
            Error correction
          </label>
          <SegmentedControl<EccLevel>
            ariaLabel="Error correction level"
            value={ecc}
            onChange={(v) => setState({ ecc: v })}
            options={ECC_OPTIONS}
            className="w-full justify-between"
          />
          <p className="text-xs text-[var(--color-fg-subtle)]">
            Higher correction lets the QR survive smudging or partial damage.
          </p>
        </div>

        {/* Generate */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleGenerate}
          disabled={isGenerating || payloadInvalid}
          className="w-full"
          aria-label="Generate QR code"
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden />
              Generating…
            </>
          ) : (
            <>
              <QrCode size={16} aria-hidden />
              Generate QR
            </>
          )}
        </Button>

        <p className="text-xs text-[var(--color-fg-subtle)] text-center">
          Generated locally — no payload leaves your browser.
        </p>
      </div>

      {/* ---------- Preview (right column on desktop) ---------- */}
      <div className="qk-card p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[var(--color-fg)]">Preview</h2>
          {hasImage && (
            <span className="text-xs text-[var(--color-fg-subtle)]">{size}×{size}px · {ecc}</span>
          )}
        </div>

        {/* QR display area — always white to keep QR scannable */}
        <div
          className={cn(
            "relative flex items-center justify-center rounded-md border border-[var(--color-border-strong)] bg-white p-4 sm:p-6",
            "min-h-[260px]"
          )}
        >
          {hasImage ? (
            // Using <img> with a dynamic data URL. The @next/next/no-img-element
            // rule is disabled project-wide (eslint.config.mjs), so a plain
            // <img> is safe here and avoids the Next/Image data-URL caveats.
            <img
              src={result.dataUrl}
              alt={altText}
              width={size}
              height={size}
              className="block max-w-full h-auto rounded-sm qk-fade-in"
              style={{ width: "min(100%, 320px)", height: "auto" }}
            />
          ) : (
            <div
              className="flex flex-col items-center gap-2 text-[var(--color-fg-subtle)] py-10"
              aria-live="polite"
            >
              <QrCode size={48} aria-hidden className="opacity-30" />
              <p className="text-sm">
                {result && !result.ok
                  ? result.reason ?? "Could not generate QR code."
                  : "Press Generate to preview your QR code."}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {hasImage ? (
            <>
              <a
                href={result.dataUrl}
                download="quickkit-qr.png"
                onClick={handleDownloadPng}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium rounded-md transition-colors qk-focus-ring select-none bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-accent)] border border-transparent"
              >
                <Download size={16} aria-hidden />
                Download PNG
              </a>
              <Button
                variant="secondary"
                size="md"
                onClick={handleDownloadSvg}
                className="flex-1 sm:flex-none"
              >
                <ImageDown size={16} aria-hidden />
                Download SVG
              </Button>
              <CopyButton
                value={result.dataUrl ?? ""}
                label="Copy image data URL"
                className="flex-1 sm:flex-none"
              />
            </>
          ) : (
            <p className="text-xs text-[var(--color-fg-subtle)]">
              Download and copy options appear once a QR is generated.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default QrGenerator;
