import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const storeSource = readFileSync(
  new URL("../../../../packages/api/src/crm/sync/store.ts", import.meta.url),
  "utf8",
);
const stagedGiftsSource = readFileSync(
  new URL(
    "../../../../packages/api/src/giving/staged-gifts.ts",
    import.meta.url,
  ),
  "utf8",
);
const crmDetailSource = readFileSync(
  new URL(
    "../../../../packages/api/src/admin/crm/detail/service.ts",
    import.meta.url,
  ),
  "utf8",
);
const crmReportsSource = readFileSync(
  new URL(
    "../../../../packages/api/src/admin/crm/reports/service.ts",
    import.meta.url,
  ),
  "utf8",
);
const crmLinksMigrationSource = readFileSync(
  new URL(
    "../../../../supabase/migrations/20260611155000_crm_links_parent_child_scope.sql",
    import.meta.url,
  ),
  "utf8",
);

function sourceSection(
  source: string,
  startMarker: string,
  endMarker?: string,
): string {
  const start = source.indexOf(startMarker);
  expect(start).toBeGreaterThanOrEqual(0);

  const end = endMarker
    ? source.indexOf(endMarker, start + startMarker.length)
    : source.length;
  expect(end).toBeGreaterThan(start);

  return source.slice(start, end);
}

const parentLinkSingletonRead =
  /\.from\("donation_crm_links"\)[\s\S]*?\.eq\("scope", "parent"\)[\s\S]*?\.maybeSingle\(\)/;
const parentLinkCollectionRead =
  /\.from\("donation_crm_links"\)[\s\S]*?\.eq\("scope", "parent"\)[\s\S]*?(?:\.in\(|\.limit\()/;

describe("CRM donation link parent-scope contract", () => {
  it("keeps outbound success/failure singleton reads scoped to parent links", () => {
    const success = sourceSection(
      storeSource,
      "async recordOutboundSuccess(input)",
      "async recordOutboundFailure(input)",
    );
    const failure = sourceSection(
      storeSource,
      "async recordOutboundFailure(input)",
      "async loadReconciliationSnapshot(input)",
    );

    expect(success).toMatch(parentLinkSingletonRead);
    expect(success).toContain('scope: "parent"');
    expect(failure).toMatch(parentLinkSingletonRead);
  });

  it("keeps reconciliation gift-link drift scoped to parent links", () => {
    const reconciliation = sourceSection(
      storeSource,
      "async loadReconciliationSnapshot(input)",
      "requireNoError(orphanLinks.error",
    );

    expect(reconciliation).toMatch(parentLinkCollectionRead);
  });

  it("keeps staged gift queueing scoped to parent links", () => {
    const queueStagedGiftPostingToTwenty = sourceSection(
      stagedGiftsSource,
      "export async function queueStagedGiftPostingToTwenty(",
    );

    expect(queueStagedGiftPostingToTwenty).toMatch(parentLinkSingletonRead);
    expect(queueStagedGiftPostingToTwenty).toContain('scope: "parent"');
  });

  it("backs parent staged gift singleton reads with a partial unique index", () => {
    expect(crmLinksMigrationSource).toContain(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_donation_crm_links_parent_staged_gift",
    );
    expect(crmLinksMigrationSource).toContain(
      "ON public.donation_crm_links (tenant_id, staged_gift_id, crm_provider)",
    );
    expect(crmLinksMigrationSource).toContain(
      "WHERE staged_gift_id IS NOT NULL",
    );
    expect(crmLinksMigrationSource).toContain("AND scope = 'parent'");
  });

  it("keeps CRM detail and report readers scoped to parent links", () => {
    const detail = sourceSection(
      crmDetailSource,
      "const [linkResult, allocationsResult] =",
      "assertNoError(linkResult.error",
    );
    const report = sourceSection(
      crmReportsSource,
      "async function buildSyncFailureRows(",
      "assertNoError(jobsResult.error",
    );

    expect(detail).toMatch(parentLinkCollectionRead);
    expect(report).toMatch(parentLinkCollectionRead);
  });
});
