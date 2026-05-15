import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const pageClientPath = join(
  process.cwd(),
  "apps",
  "admin",
  "app",
  "pdf",
  "page-client.tsx",
);

describe("admin PDF Studio native UI", () => {
  it("keeps native builder behind the public flag while preserving Unlayer defaults", () => {
    const source = readFileSync(pageClientPath, "utf8");

    expect(source).toContain(
      "NEXT_PUBLIC_PDF_STUDIO_NATIVE_BUILDER_ENABLED",
    );
    expect(source).toContain('engine: "unlayer"');
    expect(source).toContain("New Native Document");
  });

  it("uses server routes for native preview and render without client DocRaptor imports", () => {
    const source = readFileSync(pageClientPath, "utf8");

    expect(source).toContain("/api/pdf-templates/native/preview");
    expect(source).toContain("/api/pdf-templates/native/render");
    expect(source).not.toContain("@asym/docraptor-client");
    expect(source).not.toContain("@asym/pdf-renderer/docraptor-preview");
  });

  it("saves native templates as source JSON instead of generated HTML", () => {
    const source = readFileSync(pageClientPath, "utf8");

    expect(source).toContain('engine: "asym_pdf_document_builder"');
    expect(source).toContain("native_schema_version");
    expect(source).toContain("html: null");
    expect(source).toContain("Export Native JSON");
  });
});
