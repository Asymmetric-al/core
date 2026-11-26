import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const WEB_STUDIO_IMPORT_MAP_PATH = path.join(
  process.cwd(),
  "apps/admin/app/(payload)/web-studio/importMap.js",
);

describe("Payload Web Studio import map", () => {
  it("holds no upload handler or retired view (D-18: WP6 part 2b drops Payload uploads, Vercel Blob and the prototype collections' views)", () => {
    const importMapSource = readFileSync(WEB_STUDIO_IMPORT_MAP_PATH, "utf8");

    expect(importMapSource).not.toContain("@payloadcms/storage-vercel-blob");
    for (const retired of [
      "MinistryUpdateCreateView",
      "MissionaryGivingCreateView",
      "ProjectPageCreateView",
      "PageTemplateCreateView",
      "MissionariesHubView",
      "AdministrationListViews",
    ]) {
      expect(importMapSource, retired).not.toContain(retired);
    }
    expect(importMapSource).toContain(
      "/src/cms-ui/web-studio/flows/StandardPageFromTemplateView.tsx#StandardPageFromTemplateView",
    );
  });
});
