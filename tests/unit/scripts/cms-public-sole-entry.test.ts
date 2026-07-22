import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  SOLE_ENTRY_ALLOWLIST,
  collectCmsPublicSoleEntryViolationsFromSource,
  isPublicCodePath,
  isSoleEntryAllowlisted,
} from "../../../scripts/verify/cms-public-sole-entry.mjs";

const PUBLIC_ROUTE_FILE = "apps/admin/app/api/cms/public/example/route.ts";
const PUBLIC_MODULE_FILE = "apps/admin/src/cms/public/example.ts";
const READER_FILE = "apps/admin/src/cms/public/published-content-reader.ts";
const RESOLVER_FILE = "apps/admin/src/cms/public/resolve-tenant.ts";
const STAFF_FILE = "apps/admin/src/cms/collections/pages.ts";

function repoFile(relativePath: string) {
  return readFileSync(
    fileURLToPath(new URL(`../../../${relativePath}`, import.meta.url)),
    "utf8",
  );
}

describe("public code path scoping", () => {
  it("covers the public route handlers, public server modules, and donor public surface", () => {
    expect(isPublicCodePath(PUBLIC_ROUTE_FILE)).toBe(true);
    expect(isPublicCodePath(PUBLIC_MODULE_FILE)).toBe(true);
    expect(isPublicCodePath("apps/donor/app/(public)/page.tsx")).toBe(true);
    expect(isPublicCodePath("apps/donor/lib/cms/client.ts")).toBe(true);
  });

  it("leaves staff/admin Payload reads unaffected", () => {
    expect(isPublicCodePath(STAFF_FILE)).toBe(false);
    expect(
      collectCmsPublicSoleEntryViolationsFromSource(
        STAFF_FILE,
        'const docs = await payload.find({ collection: "pages", overrideAccess: true });\n',
      ),
    ).toEqual([]);
  });

  it("documents the allowlist as exactly the reader and the tenant-resolver seam", () => {
    expect(SOLE_ENTRY_ALLOWLIST).toEqual([
      "apps/admin/src/cms/public/published-content-reader.ts",
      "apps/admin/src/cms/public/resolve-tenant.ts",
    ]);
    expect(isSoleEntryAllowlisted(READER_FILE)).toBe(true);
    expect(isSoleEntryAllowlisted(RESOLVER_FILE)).toBe(true);
    expect(isSoleEntryAllowlisted(PUBLIC_MODULE_FILE)).toBe(false);
  });
});

describe("raw Payload reads in public paths fail the lint", () => {
  it("flags payload.find in a public route", () => {
    const violations = collectCmsPublicSoleEntryViolationsFromSource(
      PUBLIC_ROUTE_FILE,
      [
        "export async function GET() {",
        '  const result = await payload.find({ collection: "pages" });',
        "  return result;",
        "}",
      ].join("\n"),
    );

    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain(`${PUBLIC_ROUTE_FILE}:2`);
    expect(violations[0]).toContain("published-content-reader");
  });

  it("flags payload.findByID, payload.db escapes, and aliased collection reads", () => {
    expect(
      collectCmsPublicSoleEntryViolationsFromSource(
        PUBLIC_MODULE_FILE,
        'await payload.findByID({ collection: "pages", id });\n',
      ),
    ).toHaveLength(1);

    expect(
      collectCmsPublicSoleEntryViolationsFromSource(
        PUBLIC_MODULE_FILE,
        "const rows = await payload.db.drizzle.select();\n",
      ),
    ).toHaveLength(1);

    expect(
      collectCmsPublicSoleEntryViolationsFromSource(
        PUBLIC_MODULE_FILE,
        'const result = await client.find({ collection: "navigation" });\n',
      ),
    ).toHaveLength(1);
  });

  it("flags a multiline aliased collection read", () => {
    const violations = collectCmsPublicSoleEntryViolationsFromSource(
      PUBLIC_MODULE_FILE,
      [
        "const result = await client.find({",
        '  collection: "navigation",',
        "  limit: 1,",
        "});",
      ].join("\n"),
    );

    expect(violations.length).toBeGreaterThanOrEqual(1);
    expect(violations[0]).toContain("[aliased-collection-read]");
  });

  it("flags overrideAccess: true anywhere in a public path", () => {
    const violations = collectCmsPublicSoleEntryViolationsFromSource(
      PUBLIC_ROUTE_FILE,
      "const options = { overrideAccess: true };\n",
    );

    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain("[override-access-true]");
  });

  it("does not flag plain array .find callbacks", () => {
    expect(
      collectCmsPublicSoleEntryViolationsFromSource(
        PUBLIC_MODULE_FILE,
        "const item = docs.find((doc) => doc.id === id);\n",
      ),
    ).toEqual([]);
  });
});

describe("the allowlisted construction sites pass with their real source", () => {
  it("passes the choke-point reader itself", () => {
    expect(
      collectCmsPublicSoleEntryViolationsFromSource(
        READER_FILE,
        repoFile(READER_FILE),
      ),
    ).toEqual([]);
  });

  it("passes the tenant-resolver seam", () => {
    expect(
      collectCmsPublicSoleEntryViolationsFromSource(
        RESOLVER_FILE,
        repoFile(RESOLVER_FILE),
      ),
    ).toEqual([]);
  });

  it("keeps every real public-path route free of raw reads (live regression)", () => {
    for (const file of [
      "apps/admin/app/api/cms/public/navigation/route.ts",
      "apps/admin/app/api/cms/public/updates/route.ts",
      "apps/admin/app/api/cms/public/pages/[...slug]/route.ts",
      "apps/admin/app/api/cms/public/missionary-pages/[id]/route.ts",
      "apps/admin/app/api/cms/public/project-pages/[slug]/route.ts",
      "apps/admin/src/cms/public/published-page-read.ts",
    ]) {
      expect(
        collectCmsPublicSoleEntryViolationsFromSource(file, repoFile(file)),
        file,
      ).toEqual([]);
    }
  });
});
