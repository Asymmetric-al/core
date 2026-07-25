import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("admin CRM TanStack cache stability contracts", () => {
  it("normalizes the relationships domain filter inside the query key", () => {
    const source = readRepoFile(
      "packages/database/hooks/admin-crm-relationships.ts",
    );

    // Sorted, stable serialization keeps equivalent domain sets on one entry.
    expect(source).toMatch(/\[\.\.\.domains\]\.sort\(\)\.join\(","\)/);
    expect(source).toMatch(/domains: domainsKey/);
    // The fetch still receives the raw domains array (unchanged behavior).
    expect(source).toMatch(/fetchCrmRelationships\(\{\s*domains,/);
  });

  it("keys the infinite-grid staging collection by a value fingerprint", () => {
    const source = readRepoFile(
      "packages/database/hooks/admin-crm-infinite.ts",
    );

    // Fingerprint serializes debounced filters + sorting by value, so
    // identity-only changes do not recreate the local staging collection.
    expect(source).toMatch(
      /JSON\.stringify\(\{ filters: debouncedFilters, sorting \}\)/,
    );
    expect(source).toMatch(/id: `crm-loaded-\$\{collectionFingerprint\}`/);
    expect(source).toMatch(/\[collectionFingerprint\],\s*\)/);
  });

  it("invalidates the drawer detail query when CRM mutations succeed", () => {
    const hookSource = readRepoFile(
      "packages/database/hooks/admin-crm-detail.ts",
    );
    const drawerSource = readRepoFile(
      "apps/admin/app/(app)/crm/detail-drawer.tsx",
    );

    // The drawer reads detail via this hook, keyed under the detail prefix.
    expect(drawerSource).toMatch(/useAdminCrmRecordDetail\(contact\.id\)/);
    expect(drawerSource).toMatch(/useCreateLinkedCrmNote\(contact\.id\)/);
    expect(hookSource).toMatch(/ADMIN_CRM_RECORD_DETAIL_QUERY_KEY/);
    expect(hookSource).toMatch(/"admin",\s*"crm",\s*"records",\s*"detail"/);
    expect(hookSource).toMatch(
      /CRM_DETAIL_QUERY_KEY = ADMIN_CRM_RECORD_DETAIL_QUERY_KEY/,
    );

    // Note save must invalidate the detail prefix so the open record refetches.
    const detailInvalidations = hookSource.match(
      /queryKey: CRM_DETAIL_QUERY_KEY/g,
    );
    expect(detailInvalidations?.length ?? 0).toBeGreaterThanOrEqual(1);
    const listInvalidations = hookSource.match(
      /queryKey: CRM_RECORDS_QUERY_KEY/g,
    );
    expect(listInvalidations?.length ?? 0).toBeGreaterThanOrEqual(1);
  });
});
