/**
 * Generate /public/llms.txt from the same canonical QuickKit catalog that
 * drives Home, the Footer, sitemap, and the manifest. Static-export
 * compatible: writes a real static file at /public/llms.txt that Next
 * serves as a plain static asset in both dev and the /out production build.
 *
 * Run via: `bun run scripts/gen-static-assets.ts`
 * Wired as a prebuild step in package.json.
 */

import { llmsTxt } from "../core/seo/jsonld";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const PUBLIC_DIR = resolve(process.cwd(), "public");
const LLM_TXT = resolve(PUBLIC_DIR, "llms.txt");

mkdirSync(PUBLIC_DIR, { recursive: true });

const content = llmsTxt();
writeFileSync(LLM_TXT, content, "utf-8");

console.log(`[gen-static-assets] wrote ${LLM_TXT} (${content.length} bytes)`);
