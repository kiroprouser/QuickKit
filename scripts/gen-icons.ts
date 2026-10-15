/**
 * Generate QuickKit static icon assets from a single visual identity.
 *
 * Visual identity:
 * - Burnt-orange (#c24a1a) rounded square surface
 * - White Q, optically centered
 * - Warm off-white (#faf6ef) favicon background (for light browser tabs)
 * - Clean, restrained, premium
 *
 * Outputs:
 *   public/icons/favicon.svg
 *   public/icons/favicon-16.png, favicon-32.png
 *   public/icons/favicon.ico
 *   public/icons/apple-touch-icon.png (180×180, full-bleed)
 *   public/icons/icon-192.png, icon-512.png
 *   public/icons/icon-maskable-512.png (safe-zone compliant)
 *   public/icons/og.png (1200×630 social preview)
 *
 * Run via: `bun run scripts/gen-icons.ts`
 */

import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const ICONS_DIR = resolve(process.cwd(), "public", "icons");
mkdirSync(ICONS_DIR, { recursive: true });

const PRIMARY = "#c24a1a";   // burnt orange
const PRIMARY_DARK = "#9c3d12"; // deeper burnt orange (hover/edge)
const BG = "#faf6ef";        // warm off-white
const FG = "#1f1a15";        // dark warm neutral
const WHITE = "#ffffff";
const MUTED = "#5c5347";     // warm gray secondary text
const SUBTLE = "#8a7f70";    // warm gray tertiary text

/**
 * QuickKit Q mark — burnt-orange rounded square with a white Q.
 * The Q is optically centered (slightly above geometric center to
 * compensate for the visual weight of the letter's descender).
 */
function qMarkSvg(size: number, opts: {
  bg: string;       // surface background
  qColor: string;   // Q text color
  padding: number;  // padding around the rounded square (0 = full-bleed)
  qSize?: number;   // Q font-size as fraction of size (default 0.52)
  radius?: number;  // corner radius as fraction of size (default 0.22)
}): string {
  const { bg, qColor, padding, qSize = 0.52, radius = 0.22 } = opts;
  const r = size * radius;
  const inner = size - 2 * padding;
  // Optical centering: shift Q up by ~2% to account for the visual weight
  const opticalY = 0.48; // slightly above 50%
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="${padding}" y="${padding}" width="${inner}" height="${inner}" rx="${r}" ry="${r}" fill="${bg}"/>
  <text x="${size / 2}" y="${size * opticalY}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="${size * qSize}" font-weight="700" fill="${qColor}" text-anchor="middle" dominant-baseline="central">Q</text>
</svg>`;
}

/**
 * Maskable icon — full-bleed background, Q in the safe zone (center ~60%).
 * Important content stays visible under circular/squircle/other masks.
 */
function maskableSvg(size: number): string {
  const qSafe = size * 0.3; // Q at 30% of size — well within safe zone
  const qY = size * 0.46;    // optical center
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="0" y="0" width="${size}" height="${size}" fill="${PRIMARY}"/>
  <text x="${size / 2}" y="${qY}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="${qSafe * 2}" font-weight="700" fill="${WHITE}" text-anchor="middle" dominant-baseline="central">Q</text>
</svg>`;
}

/**
 * Social / Open Graph preview — 1200×630.
 * Professional social card with strong typography hierarchy.
 * Composition:
 *   - Warm off-white background
 *   - Small/moderate Q logo (top area)
 *   - "QuickKit" title (large, bold)
 *   - Tagline (medium)
 *   - Supporting line (small, muted)
 *   - Safe margins on all edges
 *   - No domain on the border (omitted for cleaner look)
 */
function ogSvg(): string {
  const W = 1200;
  const H = 630;
  // Logo: 88×88 px — moderate, not dominating
  const logoSize = 88;
  const logoX = (W - logoSize) / 2;
  const logoY = 110;
  const logoR = logoSize * 0.22;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <!-- Background: warm off-white -->
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- Subtle decorative border (inside safe margin) -->
  <rect x="60" y="60" width="${W - 120}" height="${H - 120}" rx="20" ry="20" fill="none" stroke="${PRIMARY}" stroke-width="1.5" opacity="0.15"/>

  <!-- QuickKit Q logo (moderate size, optically centered) -->
  <rect x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" rx="${logoR}" ry="${logoR}" fill="${PRIMARY}"/>
  <text x="${logoX + logoSize / 2}" y="${logoY + logoSize * 0.46}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="${logoSize * 0.52}" font-weight="700" fill="${WHITE}" text-anchor="middle" dominant-baseline="central">Q</text>

  <!-- "QuickKit" title -->
  <text x="${W / 2}" y="${H * 0.50}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="68" font-weight="700" fill="${FG}" text-anchor="middle" letter-spacing="-1.5">QuickKit</text>

  <!-- Tagline -->
  <text x="${W / 2}" y="${H * 0.61}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="28" font-weight="400" fill="${MUTED}" text-anchor="middle">Everyday tools. One command away.</text>

  <!-- Supporting line -->
  <text x="${W / 2}" y="${H * 0.72}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="18" font-weight="500" fill="${SUBTLE}" text-anchor="middle" letter-spacing="0.5">Local-first  ·  Offline-capable  ·  No account</text>

  <!-- Thin accent line above tagline (subtle brand element) -->
  <line x1="${W / 2 - 40}" y1="${H * 0.44}" x2="${W / 2 + 40}" y2="${H * 0.44}" stroke="${PRIMARY}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
</svg>`;
}

async function generateAll() {
  // SVG favicon (modern browsers) — burnt-orange square + white Q on warm off-white
  const faviconSvg = qMarkSvg(64, { bg: BG, qColor: PRIMARY, padding: 2 });
  writeFileSync(resolve(ICONS_DIR, "favicon.svg"), faviconSvg, "utf-8");

  // Favicon PNGs (small, for legacy browser tab display)
  // Use burnt-orange background + white Q for strong visibility at tiny sizes
  const tasks: Array<{ name: string; svg: string; w: number; h: number }> = [
    // PWA icons — burnt-orange surface, white Q, small padding
    { name: "icon-192.png", svg: qMarkSvg(192, { bg: PRIMARY, qColor: WHITE, padding: 0 }), w: 192, h: 192 },
    { name: "icon-512.png", svg: qMarkSvg(512, { bg: PRIMARY, qColor: WHITE, padding: 0 }), w: 512, h: 512 },
    // Maskable — full-bleed, Q in safe zone
    { name: "icon-maskable-512.png", svg: maskableSvg(512), w: 512, h: 512 },
    // Apple touch — full-bleed burnt-orange, white Q (iOS applies its own mask)
    { name: "apple-touch-icon.png", svg: qMarkSvg(180, { bg: PRIMARY, qColor: WHITE, padding: 0 }), w: 180, h: 180 },
    // Small favicon PNGs — burnt-orange background, white Q for tab visibility
    { name: "favicon-32.png", svg: qMarkSvg(32, { bg: PRIMARY, qColor: WHITE, padding: 0 }), w: 32, h: 32 },
    { name: "favicon-16.png", svg: qMarkSvg(16, { bg: PRIMARY, qColor: WHITE, padding: 0 }), w: 16, h: 16 },
    // OG image
    { name: "og.png", svg: ogSvg(), w: 1200, h: 630 },
  ];

  for (const t of tasks) {
    const buf = await sharp(Buffer.from(t.svg), { density: 144 })
      .resize(t.w, t.h, { fit: "cover" })
      .png({ compressionLevel: 9 })
      .toBuffer();
    writeFileSync(resolve(ICONS_DIR, t.name), buf);
    console.log(`[gen-icons] wrote ${t.name} (${t.w}×${t.h})`);
  }

  // favicon.ico — 32×32 PNG (browsers accept PNG in .ico)
  const icoSvg = qMarkSvg(32, { bg: PRIMARY, qColor: WHITE, padding: 0 });
  const icoBuf = await sharp(Buffer.from(icoSvg), { density: 144 })
    .resize(32, 32)
    .png()
    .toBuffer();
  writeFileSync(resolve(ICONS_DIR, "favicon.ico"), icoBuf);
  console.log(`[gen-icons] wrote favicon.ico`);
}

generateAll().catch((err) => {
  console.error("[gen-icons] failed:", err);
  process.exit(1);
});
