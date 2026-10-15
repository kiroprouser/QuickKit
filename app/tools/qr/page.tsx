import type { Metadata } from "next";
import { toolMetadata } from "@core/seo/metadata";
import { toolJsonLd } from "@core/seo/jsonld";
import { ToolPageShell } from "@tools/shared/tool-page-shell";
import { QrGenerator } from "@tools/qr/QrGenerator";

export const metadata: Metadata = toolMetadata("qr");

export default function QrToolPage() {
  return (
    <ToolPageShell toolId="qr">
      <QrGenerator />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd("qr")) }}
      />
    </ToolPageShell>
  );
}
