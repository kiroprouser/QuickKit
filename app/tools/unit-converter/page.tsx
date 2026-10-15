import type { Metadata } from "next";
import { toolMetadata } from "@core/seo/metadata";
import { toolJsonLd } from "@core/seo/jsonld";
import { ToolPageShell } from "@tools/shared/tool-page-shell";
import { UnitConverter } from "@tools/unit-converter/UnitConverter";

export const metadata: Metadata = toolMetadata("unit-converter");

export default function Page() {
  return (
    <ToolPageShell toolId="unit-converter">
      <UnitConverter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toolJsonLd("unit-converter")),
        }}
      />
    </ToolPageShell>
  );
}
