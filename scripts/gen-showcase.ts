/**
 * Generate polished showcase images from real QuickKit screenshots.
 *
 * Key design decisions:
 * - Crop bottom only (remove footer/excess) — NEVER crop sides or top
 * - Adjust frame aspect ratio to MATCH the screenshot (no letterbox/white gaps)
 * - For tools: draw BOTH frames in the background SVG, then composite
 *   both screenshots on top (no overlay that covers content)
 * - Correct per-page URLs in each browser frame's URL bar
 * - Mobile: rounded-corner mask + edge dissolve for seamless phone blend
 *
 * Run via: `bun run scripts/gen-showcase.ts`
 */

import sharp from "sharp";
import { resolve } from "node:path";

const UPLOAD = resolve(process.cwd(), "upload");
const OUT = resolve(process.cwd(), "artifacts", "showcase", "final");

const PRIMARY = "#c24a1a";
const BG = "#f0e8da";
const FG = "#1f1a15";
const MUTED = "#5c5347";
const SUBTLE = "#8a7f70";
const WHITE = "#ffffff";
const BORDER = "#d6c9b3";
const PHONE_BODY = "#1f1a15";

async function svgToPng(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Crop bottom only — keeps full width, removes excess height from the bottom. */
async function cropBottom(path: string, height: number): Promise<Buffer> {
  const meta = await sharp(resolve(UPLOAD, path)).metadata();
  const w = meta.width!;
  const h = Math.min(height, meta.height!);
  return sharp(resolve(UPLOAD, path))
    .extract({ left: 0, top: 0, width: w, height: h })
    .toBuffer();
}

/** Get dimensions of a buffer. */
async function dims(buf: Buffer) {
  const m = await sharp(buf).metadata();
  return { w: m.width!, h: m.height! };
}

/**
 * Build a browser-frame background SVG.
 * The frame is sized to MATCH the screenshot's aspect ratio (no letterbox).
 * Canvas height = title area + frame + bottom text + padding.
 */
function frameBgAdaptive(
  canvasW: number,
  shotW: number, shotH: number,  // cropped screenshot dimensions
  frameW: number,                 // target frame width
  title: string, subtitle: string, url: string,
  opts?: { accentLine?: boolean; bottomText?: string }
): { svg: string; frameH: number; canvasH: number; frameX: number; frameY: number; shotTargetH: number } {
  const tbH = 36;
  const padX = 40;
  const padTop = 90;
  const padBottom = 60;

  // Scale screenshot to frame width — height follows aspect ratio (no side gaps)
  const scale = frameW / shotW;
  const shotTargetH = Math.round(shotH * scale);
  const frameH = shotTargetH + tbH + 2; // content + top bar + bottom border

  const frameX = padX;
  const frameY = padTop;
  const canvasH = padTop + frameH + padBottom;

  const accentY = frameY - 30;
  const bottomY = canvasH - 25;

  return {
    frameH, canvasH, frameX, frameY, shotTargetH,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}">
  <rect width="${canvasW}" height="${canvasH}" fill="${BG}"/>
  <rect x="20" y="20" width="${canvasW - 40}" height="${canvasH - 40}" rx="12" fill="none" stroke="${PRIMARY}" stroke-width="1.5" opacity="0.1"/>
  ${title ? `<text x="${canvasW / 2}" y="${frameY - 48}" font-family="system-ui, sans-serif" font-size="${title.length > 20 ? 30 : 38}" font-weight="700" fill="${FG}" text-anchor="middle">${title}</text>` : ""}
  ${subtitle ? `<text x="${canvasW / 2}" y="${frameY - 22}" font-family="system-ui, sans-serif" font-size="15" font-weight="400" fill="${MUTED}" text-anchor="middle">${subtitle}</text>` : ""}
  ${opts?.accentLine ? `<line x1="${canvasW / 2 - 30}" y1="${accentY}" x2="${canvasW / 2 + 30}" y2="${accentY}" stroke="${PRIMARY}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>` : ""}
  <rect x="${frameX}" y="${frameY}" width="${frameW}" height="${frameH}" rx="10" fill="${WHITE}" stroke="${BORDER}" stroke-width="2"/>
  <rect x="${frameX + 2}" y="${frameY + 2}" width="${frameW - 4}" height="${tbH}" rx="8" fill="#f5efe5"/>
  <rect x="${frameX + 2}" y="${frameY + tbH - 2}" width="${frameW - 4}" height="1" fill="${BORDER}"/>
  <circle cx="${frameX + 16}" cy="${frameY + tbH / 2 + 2}" r="5" fill="#e0703a" opacity="0.5"/>
  <circle cx="${frameX + 32}" cy="${frameY + tbH / 2 + 2}" r="5" fill="#e0a03a" opacity="0.5"/>
  <circle cx="${frameX + 48}" cy="${frameY + tbH / 2 + 2}" r="5" fill="#3aa06a" opacity="0.5"/>
  <rect x="${frameX + 72}" y="${frameY + 8}" width="${frameW - 92}" height="20" rx="4" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>
  <text x="${frameX + 84}" y="${frameY + 22}" font-family="system-ui, sans-serif" font-size="11" fill="${SUBTLE}">${url}</text>
  ${opts?.bottomText ? `<text x="${canvasW / 2}" y="${bottomY}" font-family="system-ui, sans-serif" font-size="15" font-weight="500" fill="${SUBTLE}" text-anchor="middle">${opts.bottomText}</text>` : ""}
</svg>`
  };
}

/** Phone frame SVG with empty screen area. */
function phoneBg(sw: number, sh: number): string {
  const W = sw + 80;
  const H = sh + 160;
  const pW = sw + 24;
  const pH = sh + 24;
  const pX = (W - pW) / 2;
  const pY = 100;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="12" fill="none" stroke="${PRIMARY}" stroke-width="1.5" opacity="0.1"/>
  <text x="${W / 2}" y="68" font-family="system-ui, sans-serif" font-size="30" font-weight="700" fill="${FG}" text-anchor="middle">Responsive Design</text>
  <text x="${W / 2}" y="88" font-family="system-ui, sans-serif" font-size="13" fill="${MUTED}" text-anchor="middle">Optimized for every screen</text>
  <rect x="${pX}" y="${pY}" width="${pW}" height="${pH}" rx="36" fill="${PHONE_BODY}"/>
  <rect x="${pX + 12}" y="${pY + 12}" width="${sw}" height="${sh}" rx="24" fill="${BG}"/>
  <rect x="${pX + (pW - 50) / 2}" y="${pY + 18}" width="50" height="6" rx="3" fill="${BG}" opacity="0.3"/>
  <rect x="${pX + (pW - 80) / 2}" y="${pY + pH - 18}" width="80" height="4" rx="2" fill="${BG}" opacity="0.2"/>
  <text x="${W / 2}" y="${H - 25}" font-family="system-ui, sans-serif" font-size="12" fill="${SUBTLE}" text-anchor="middle">Mobile · Tablet · Desktop</text>
</svg>`;
}

async function generateAll() {
  const tbH = 36;
  const HOME_FILE = "screencapture-quickkit-59o-pages-dev-2026-10-15-14_28_23.png";
  const HOME2_FILE = "screencapture-quickkit-59o-pages-dev-2026-10-15-14_29_14.png";
  const MOBILE_FILE = "screencapture-quickkit-59o-pages-dev-2026-10-15-14_30_05.png";
  const UNIT_FILE = "screencapture-quickkit-59o-pages-dev-tools-unit-converter-2026-10-15-14_30_41.png";
  const COLOR_FILE = "screencapture-quickkit-59o-pages-dev-tools-color-2026-10-15-14_31_01.png";

  // === 1. HERO IMAGE — Home, adaptive aspect ratio ===
  {
    const canvasW = 1200;
    const frameW = 1120;
    const shot = await cropBottom(HOME_FILE, 1100);
    const d = await dims(shot);
    const url = "https://quickkit-59o.pages.dev/";
    const { svg, frameH, canvasH, frameX, frameY, shotTargetH } = frameBgAdaptive(
      canvasW, d.w, d.h, frameW, "QuickKit", "Everyday tools. One command away.", url,
      { accentLine: true, bottomText: "Local-first  ·  Offline-capable  ·  No account" }
    );
    const bg = await svgToPng(svg);
    // Resize screenshot to EXACTLY fill the frame content area (width-driven, no side gaps)
    const fitted = await sharp(shot).resize(frameW - 4, shotTargetH, { fit: "fill" }).toBuffer();
    const final = await sharp(bg).composite([{ input: fitted, left: frameX + 2, top: frameY + tbH }]).png().toBuffer();
    await sharp(final).toFile(resolve(OUT, "quickkit-showcase-hero.png"));
    console.log(`[showcase] hero.png ✓ (${canvasW}×${canvasH})`);
  }

  // === 2. HOME / DISCOVERY ===
  {
    const canvasW = 1200;
    const frameW = 1120;
    const shot = await cropBottom(HOME_FILE, 950);
    const d = await dims(shot);
    const url = "https://quickkit-59o.pages.dev/";
    const { svg, frameX, frameY, shotTargetH } = frameBgAdaptive(
      canvasW, d.w, d.h, frameW, "Tool Discovery", "Eight focused utilities, one unified ranked grid.", url, {}
    );
    const bg = await svgToPng(svg);
    const fitted = await sharp(shot).resize(frameW - 4, shotTargetH, { fit: "fill" }).toBuffer();
    const final = await sharp(bg).composite([{ input: fitted, left: frameX + 2, top: frameY + tbH }]).png().toBuffer();
    await sharp(final).toFile(resolve(OUT, "quickkit-showcase-home.png"));
    console.log(`[showcase] home.png ✓`);
  }

  // === 3. QUICK COMMAND ===
  {
    const canvasW = 1200;
    const frameW = 1120;
    const shot = await cropBottom(HOME2_FILE, 800);
    const d = await dims(shot);
    const url = "https://quickkit-59o.pages.dev/";
    const { svg, frameX, frameY, shotTargetH } = frameBgAdaptive(
      canvasW, d.w, d.h, frameW, "Quick Command", "Press Ctrl/Cmd+K anywhere — runs the real tool engines.", url, {}
    );
    const bg = await svgToPng(svg);
    const fitted = await sharp(shot).resize(frameW - 4, shotTargetH, { fit: "fill" }).toBuffer();
    const final = await sharp(bg).composite([{ input: fitted, left: frameX + 2, top: frameY + tbH }]).png().toBuffer();
    await sharp(final).toFile(resolve(OUT, "quickkit-showcase-command.png"));
    console.log(`[showcase] command.png ✓`);
  }

  // === 4. TOOL WORKFLOW — Two frames side by side, BOTH in background SVG ===
  {
    const canvasW = 1200;
    const gap = 20;
    const padX = 30;
    const frameW = Math.floor((canvasW - padX * 2 - gap) / 2); // ~575

    // Crop both screenshots to similar heights
    const shot1 = await cropBottom(UNIT_FILE, 1500);
    const shot2 = await cropBottom(COLOR_FILE, 1500);
    const d1 = await dims(shot1);
    const d2 = await dims(shot2);

    // Use the same target height for both (based on the shorter one)
    const scale1 = frameW / d1.w;
    const scale2 = frameW / d2.w;
    const shotH1 = Math.round(d1.h * scale1);
    const shotH2 = Math.round(d2.h * scale2);
    const shotTargetH = Math.min(shotH1, shotH2); // use shorter — the taller one crops from bottom
    const frameH = shotTargetH + tbH + 2;

    const padTop = 110;
    const canvasH = padTop + frameH + 50;
    const f1X = padX;
    const f2X = padX + frameW + gap;
    const fY = padTop;

    const url1 = "https://quickkit-59o.pages.dev/tools/unit-converter";
    const url2 = "https://quickkit-59o.pages.dev/tools/color";

    // Draw BOTH frames in the background SVG (no overlay later)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}">
  <rect width="${canvasW}" height="${canvasH}" fill="${BG}"/>
  <rect x="20" y="20" width="${canvasW - 40}" height="${canvasH - 40}" rx="12" fill="none" stroke="${PRIMARY}" stroke-width="1.5" opacity="0.1"/>
  <text x="${canvasW / 2}" y="${fY - 48}" font-family="system-ui, sans-serif" font-size="30" font-weight="700" fill="${FG}" text-anchor="middle">Real Tools, Real Engines</text>
  <text x="${canvasW / 2}" y="${fY - 22}" font-family="system-ui, sans-serif" font-size="14" fill="${MUTED}" text-anchor="middle">Each tool has a pure TypeScript engine shared by the UI and Quick Command</text>
  <line x1="${canvasW / 2 - 30}" y1="${fY - 8}" x2="${canvasW / 2 + 30}" y2="${fY - 8}" stroke="${PRIMARY}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
  <!-- Left frame -->
  <rect x="${f1X}" y="${fY}" width="${frameW}" height="${frameH}" rx="10" fill="${WHITE}" stroke="${BORDER}" stroke-width="2"/>
  <rect x="${f1X + 2}" y="${fY + 2}" width="${frameW - 4}" height="${tbH}" rx="8" fill="#f5efe5"/>
  <rect x="${f1X + 2}" y="${fY + tbH - 2}" width="${frameW - 4}" height="1" fill="${BORDER}"/>
  <circle cx="${f1X + 16}" cy="${fY + tbH / 2 + 2}" r="5" fill="#e0703a" opacity="0.5"/>
  <circle cx="${f1X + 32}" cy="${fY + tbH / 2 + 2}" r="5" fill="#e0a03a" opacity="0.5"/>
  <circle cx="${f1X + 48}" cy="${fY + tbH / 2 + 2}" r="5" fill="#3aa06a" opacity="0.5"/>
  <rect x="${f1X + 72}" y="${fY + 8}" width="${frameW - 92}" height="20" rx="4" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>
  <text x="${f1X + 84}" y="${fY + 22}" font-family="system-ui, sans-serif" font-size="10" fill="${SUBTLE}">${url1}</text>
  <!-- Right frame -->
  <rect x="${f2X}" y="${fY}" width="${frameW}" height="${frameH}" rx="10" fill="${WHITE}" stroke="${BORDER}" stroke-width="2"/>
  <rect x="${f2X + 2}" y="${fY + 2}" width="${frameW - 4}" height="${tbH}" rx="8" fill="#f5efe5"/>
  <rect x="${f2X + 2}" y="${fY + tbH - 2}" width="${frameW - 4}" height="1" fill="${BORDER}"/>
  <circle cx="${f2X + 16}" cy="${fY + tbH / 2 + 2}" r="5" fill="#e0703a" opacity="0.5"/>
  <circle cx="${f2X + 32}" cy="${fY + tbH / 2 + 2}" r="5" fill="#e0a03a" opacity="0.5"/>
  <circle cx="${f2X + 48}" cy="${fY + tbH / 2 + 2}" r="5" fill="#3aa06a" opacity="0.5"/>
  <rect x="${f2X + 72}" y="${fY + 8}" width="${frameW - 92}" height="20" rx="4" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>
  <text x="${f2X + 84}" y="${fY + 22}" font-family="system-ui, sans-serif" font-size="10" fill="${SUBTLE}">${url2}</text>
</svg>`;

    const bg = await svgToPng(svg);

    // Resize both screenshots to fill frame width, crop excess height from bottom
    const fit1 = await sharp(shot1).resize(frameW - 4, shotTargetH, { fit: "cover", position: "top" }).toBuffer();
    const fit2 = await sharp(shot2).resize(frameW - 4, shotTargetH, { fit: "cover", position: "top" }).toBuffer();

    // Composite both screenshots on top of the background (frames already drawn)
    const final = await sharp(bg)
      .composite([
        { input: fit1, left: f1X + 2, top: fY + tbH },
        { input: fit2, left: f2X + 2, top: fY + tbH },
      ])
      .png()
      .toBuffer();
    await sharp(final).toFile(resolve(OUT, "quickkit-showcase-tools.png"));
    console.log(`[showcase] tools.png ✓ (${canvasW}×${canvasH}, frames ${frameW}×${frameH})`);
  }

  // === 5. MOBILE / RESPONSIVE — Phone frame with blended edges ===
  {
    // Larger phone screen for better text readability
    const sw = 340, sh = 680;
    const svg = phoneBg(sw, sh);
    const bg = await svgToPng(svg);

    // Crop mobile screenshot to top ~1100px (header + tool cards)
    const mobileShot = await cropBottom(MOBILE_FILE, 1100);
    const fitted = await sharp(mobileShot)
      .resize(sw, sh, { fit: "cover", position: "top" })
      .toBuffer();

    // Rounded-corner mask
    const mask = await svgToPng(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${sw}" height="${sh}" viewBox="0 0 ${sw} ${sh}">
        <rect width="${sw}" height="${sh}" rx="24" ry="24" fill="white"/>
      </svg>`
    );
    const masked = await sharp(fitted)
      .composite([{ input: mask, blend: "dest-in" }])
      .toBuffer();

    // Edge vignette for dissolve
    const vignette = await svgToPng(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${sw}" height="${sh}" viewBox="0 0 ${sw} ${sh}">
        <defs>
          <radialGradient id="vig" cx="50%" cy="50%" r="70%">
            <stop offset="0.88" stop-color="rgba(0,0,0,0)"/>
            <stop offset="1" stop-color="rgba(240,232,218,0.5)"/>
          </radialGradient>
        </defs>
        <rect width="${sw}" height="${sh}" rx="24" ry="24" fill="url(#vig)"/>
      </svg>`
    );
    const blended = await sharp(masked)
      .composite([{ input: vignette }])
      .toBuffer();

    // Correct position: screen area = phone body + 12px padding on each side
    // phoneBg: pX = (W - pW) / 2 = ((sw+80) - (sw+24)) / 2 = 56/2 = 28
    // screen left = pX + 12 = 28 + 12 = 40 → but W = sw+80 = 420, so pX = (420-364)/2 = 28
    // screen left = 28 + 12 = 40
    const pX = 28;       // phone body left
    const screenLeft = pX + 12;  // = 40 — screen area left (CORRECT)
    const pY = 100;     // phone body top
    const screenTop = pY + 12;   // = 112 — screen area top
    const final = await sharp(bg)
      .composite([{ input: blended, left: screenLeft, top: screenTop }])
      .png()
      .toBuffer();
    await sharp(final).toFile(resolve(OUT, "quickkit-showcase-mobile.png"));
    console.log(`[showcase] mobile.png ✓ (${sw+80}×${sh+160})`);
  }
}

generateAll().catch((err) => {
  console.error("[showcase] failed:", err);
  process.exit(1);
});
