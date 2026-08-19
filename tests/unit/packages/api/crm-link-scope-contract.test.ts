import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

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

const parentLinkCollectionRead =
  /\.from\("donation_crm_links"\)[\s\S]*?\.eq\("scope", "parent"\)[\s\S]*?(?:\.in\(|\.limit\()/;

describe("CRM donation link parent-scope contract", () => {
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

  it("keeps CRM detail and report leftover gift-link readers scoped to parent links", () => {
    const detail = sourceSection(
      crmDetailSource,
      "const [linkResult, sharedInputs] =",
      "assertNoError(linkResult.error",
    );
    const report = sourceSection(
      crmReportsSource,
      "async function buildSyncFailureRows(",
      'assertNoError(linksResult.error, "Failed to load leftover CRM gift links.")',
    );

    expect(detail).toMatch(parentLinkCollectionRead);
    expect(report).toMatch(parentLinkCollectionRead);
  });

  it("does not queue Twenty CRM posts when approving a staged gift for finance", () => {
    const approve = sourceSection(
      stagedGiftsSource,
      "export async function approveStagedGiftForFinance(",
      "export function rejectRetiredCrmPostingRetry()",
    );

    expect(approve).toContain('crm_post_status: "not_required"');
    expect(approve).not.toContain("donation_crm_links");
    expect(approve).not.toContain('crm_provider: "twenty"');
    expect(approve).not.toContain("queueStagedGiftPostingToTwenty");
  });
});
