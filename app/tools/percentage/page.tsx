import type { Metadata } from "next";
import { toolMetadata } from "@core/seo/metadata";
import { toolJsonLd } from "@core/seo/jsonld";
import { ToolPageShell } from "@tools/shared/tool-page-shell";
import { Percentage } from "@tools/percentage/Percentage";

export const metadata: Metadata = toolMetadata("percentage");

export default function PercentageToolPage() {
  return (
    <ToolPageShell toolId="percentage">
      <Percentage />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd("percentage")) }}
      />
    </ToolPageShell>
  );
}
