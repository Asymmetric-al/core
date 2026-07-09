import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const routeSource = readFileSync(
  new URL(
    "../../../../../packages/api/src/admin/crm/table-preferences/route.ts",
    import.meta.url,
  ),
  "utf8",
);

function sourceSection(
  source: string,
  startMarker: string,
  endMarker: string,
): string {
  const start = source.indexOf(startMarker);
  expect(start).toBeGreaterThanOrEqual(0);

  const end = source.indexOf(endMarker, start + startMarker.length);
  expect(end).toBeGreaterThan(start);

  return source.slice(start, end);
}

describe("admin/crm/table-preferences route contract", () => {
  it("accepts null to clear delegated tenant-default managers and validates ids", () => {
    const tenantDefaultSchema = sourceSection(
      routeSource,
      "const tenantDefaultSchema =",
      "function settingsPatchFromBody",
    );
    const settingsPatchFromBody = sourceSection(
      routeSource,
      "function settingsPatchFromBody",
      "const namedViewCreateSchema",
    );

    expect(routeSource).toContain("const profileIdSchema = z.string().uuid();");
    expect(tenantDefaultSchema).toMatch(
      /delegatedManagerProfileIds:\s*z\s*\.\s*array\(profileIdSchema\)\s*\.\s*nullable\(\)\s*\.\s*optional\(\)/,
    );
    expect(settingsPatchFromBody).toContain(
      "delegatedManagerProfileIds?: string[] | null;",
    );
  });

  it("computes GET tenant-default manageability from the exact write gate", () => {
    const getHandler = sourceSection(
      routeSource,
      "export const GET =",
      "export const PUT =",
    );
    const putTenantDefault = sourceSection(
      routeSource,
      "export const PUT_TENANT_DEFAULT =",
      "export const GET_NAMED_VIEWS =",
    );

    // Both the GET visibility flag and the PUT write gate go through the one
    // shared helper, so the UI can never be shown more than it may write.
    expect(getHandler).toContain("resolveCanManageCrmTenantDefaults({");
    expect(getHandler).toContain(
      "capabilities: resolveContributionCapabilities(auth)",
    );
    expect(getHandler).toContain("tenantDefault: preferences.tenantDefault");
    expect(getHandler).toContain("canManageTenantDefaults,");
    expect(putTenantDefault).toContain("resolveCanManageCrmTenantDefaults({");
    expect(putTenantDefault).toContain("tenantDefault: current.tenantDefault");
  });

  it("keeps named-view PUT compatible with hooks expecting an ok flag", () => {
    const putNamedView = sourceSection(
      routeSource,
      "export const PUT_NAMED_VIEW =",
      "export const DELETE_NAMED_VIEW =",
    );

    expect(putNamedView).toContain(
      "return NextResponse.json({ ok: true, view, requestId });",
    );
  });
});
