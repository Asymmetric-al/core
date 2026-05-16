import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const WEB_STUDIO_IMPORT_MAP_PATH = path.join(
  process.cwd(),
  "apps/admin/app/(payload)/web-studio/importMap.js",
);

describe("Payload Web Studio import map", () => {
  it("includes the Vercel Blob upload handler required by production media storage", () => {
    const importMapSource = readFileSync(WEB_STUDIO_IMPORT_MAP_PATH, "utf8");

    expect(importMapSource).toContain("@payloadcms/storage-vercel-blob/client");
    expect(importMapSource).toContain(
      "@payloadcms/storage-vercel-blob/client#VercelBlobClientUploadHandler",
    );
  });
});
