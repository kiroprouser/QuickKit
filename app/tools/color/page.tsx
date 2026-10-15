import type { Metadata } from "next";
import { toolMetadata } from "@core/seo/metadata";
import { toolJsonLd } from "@core/seo/jsonld";
import { ToolPageShell } from "@tools/shared/tool-page-shell";
import { ColorConverter } from "@tools/color/ColorConverter";

export const metadata: Metadata = toolMetadata("color");

export default function ColorToolPage() {
  return (
    <ToolPageShell toolId="color">
      <ColorConverter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd("color")) }}
      />
    </ToolPageShell>
  );
}
