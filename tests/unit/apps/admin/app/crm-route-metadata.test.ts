import { readFileSync } from "node:fs";

import { expect, it } from "vitest";

/**
 * Each CRM route names its browser tab from the same constant as its
 * PageShell heading, so the two cannot drift apart.
 */
it.each([
  ["crm", "CRM_PAGE_META"],
  ["crm/notes", "CRM_NOTES_PAGE_META"],
  ["crm/relationships", "CRM_RELATIONSHIPS_PAGE_META"],
])("titles %s from %s", (route, meta) => {
  const source = readFileSync(
    new URL(
      `../../../../../apps/admin/app/(app)/${route}/page.tsx`,
      import.meta.url,
    ),
    "utf8",
  );
  expect(source).toContain(
    `export const metadata: Metadata = { title: ${meta}.title };`,
  );
  expect(source).toContain("<Suspense fallback={<Loading />}>");
  expect(source).not.toContain('"use client"');
});
