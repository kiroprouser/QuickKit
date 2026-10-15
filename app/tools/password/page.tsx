import type { Metadata } from "next";
import { toolMetadata } from "@core/seo/metadata";
import { toolJsonLd } from "@core/seo/jsonld";
import { ToolPageShell } from "@tools/shared/tool-page-shell";
import { Password } from "@tools/password/Password";

export const metadata: Metadata = toolMetadata("password");

export default function Page() {
  return (
    <ToolPageShell toolId="password">
      <Password />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd("password")) }}
      />
    </ToolPageShell>
  );
}
