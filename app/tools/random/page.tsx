import type { Metadata } from "next";
import { toolMetadata } from "@core/seo/metadata";
import { toolJsonLd } from "@core/seo/jsonld";
import { ToolPageShell } from "@tools/shared/tool-page-shell";
import { RandomPicker } from "@tools/random/RandomPicker";

export const metadata: Metadata = toolMetadata("random");

export default function Page() {
  return (
    <ToolPageShell toolId="random">
      <RandomPicker />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd("random")) }}
      />
    </ToolPageShell>
  );
}
