/**
 * QR Generator — engine. Validates payload and generates QR codes entirely
 * in the browser using the `qrcode` library.
 *
 * No payload is ever sent to a server. Generated payloads are not durably
 * persisted (they live in SessionStore only).
 */

import QRCode from "qrcode";

export type EccLevel = "L" | "M" | "Q" | "H";

export interface QrOptions {
  /** Pixel size of the PNG output. */
  size?: number;
  /** Error correction level. */
  ecc?: EccLevel;
  /** Foreground (dark module) color. */
  fg?: string;
  /** Background (light module) color. */
  bg?: string;
  /** Margin in modules. */
  margin?: number;
}

export interface QrResult {
  ok: boolean;
  /** Data URL PNG (always available on success). */
  dataUrl?: string;
  /** SVG string (always available on success). */
  svg?: string;
  /** Estimated QR version (matrix size). */
  version?: number;
  reason?: string;
}

const DEFAULT_OPTS: Required<QrOptions> = {
  size: 512,
  ecc: "M",
  fg: "#1f1a15",
  bg: "#ffffff",
  margin: 2,
};

/**
 * Validate a payload. Empty payloads or payloads exceeding QR capacity are
 * rejected before generation.
 */
export function validatePayload(payload: string): { ok: boolean; reason?: string } {
  if (!payload || payload.trim().length === 0) {
    return { ok: false, reason: "Enter text or a URL to encode." };
  }
  // QR max capacity (numeric, version 40, ECC L) ≈ 7,089 chars. We use ECC M,
  // which caps alphanumeric ~2,995 and byte ~1,817. Be safe and cap at 1,500.
  if (payload.length > 1500) {
    return { ok: false, reason: "Payload is too long for a single QR code." };
  }
  return { ok: true };
}

/** Generate a QR code from a payload. */
export async function generateQr(payload: string, opts?: QrOptions): Promise<QrResult> {
  const validation = validatePayload(payload);
  if (!validation.ok) {
    return { ok: false, reason: validation.reason };
  }
  const cfg = { ...DEFAULT_OPTS, ...opts };
  try {
    const dataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: cfg.ecc,
      width: cfg.size,
      margin: cfg.margin,
      color: { dark: cfg.fg, light: cfg.bg },
    });
    const svg = await QRCode.toString(payload, {
      type: "svg",
      errorCorrectionLevel: cfg.ecc,
      margin: cfg.margin,
      color: { dark: cfg.fg, light: cfg.bg },
    });
    return { ok: true, dataUrl, svg };
  } catch {
    return {
      ok: false,
      reason: "Could not generate QR. The payload may be too long for the selected ECC.",
    };
  }
}

/** Quick payload classification (for UI hints). */
export function classifyPayload(payload: string): "url" | "text" {
  const trimmed = payload.trim();
  if (/^https?:\/\/.+/i.test(trimmed)) return "url";
  if (/^[\w-]+(\.[\w-]+)+.*$/i.test(trimmed) && !/\s/.test(trimmed)) {
    // Looks like a bare domain — treat as URL-ish text (still encodes fine).
    return "url";
  }
  return "text";
}
