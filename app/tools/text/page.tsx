import type { Metadata } from "next";
import { toolMetadata } from "@core/seo/metadata";
import { toolJsonLd } from "@core/seo/jsonld";
import { ToolPageShell } from "@tools/shared/tool-page-shell";
import { TextTools } from "@tools/text/TextTools";

export const metadata: Metadata = toolMetadata("text");

export default function TextToolPage() {
  return (
    <ToolPageShell toolId="text">
      <TextTools />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd("text")) }}
      />
    </ToolPageShell>
  );
}
