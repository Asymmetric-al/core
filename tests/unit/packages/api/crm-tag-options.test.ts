import { describe, expect, it, vi } from "vitest";

import {
  CRM_TAG_SCAN_PAGE_SIZE,
  listAdminCrmTagOptions,
} from "../../../../packages/api/src/admin/crm/tags";

type TagRow = { tags: string[] | null };

/**
 * A minimal PostgREST double for `from("donors").select("tags")`: it records
 * the tenant filter and serves the rows page by page through `range`.
 */
function fakeSupabase(rowsByTenant: Record<string, TagRow[]>) {
  const calls: Array<{ tenantId: string; from: number; to: number }> = [];
  const client = {
    from: vi.fn((table: string) => {
      expect(table).toBe("donors");
      let tenantId = "";
      const builder = {
        select: vi.fn(() => builder),
        eq: vi.fn((column: string, value: string) => {
          if (column === "tenant_id") tenantId = value;
          return builder;
        }),
        not: vi.fn(() => builder),
        order: vi.fn(() => builder),
        range: vi.fn(async (from: number, to: number) => {
          calls.push({ tenantId, from, to });
          const rows = rowsByTenant[tenantId] ?? [];
          return { data: rows.slice(from, to + 1), error: null };
        }),
      };
      return builder;
    }),
  };
  return { client, calls };
}

describe("listAdminCrmTagOptions", () => {
  it("lists every tag in use across the tenant's records, sorted and once each", async () => {
    const { client } = fakeSupabase({
      "tenant-a": [
        { tags: ["Major donor", "Board"] },
        { tags: ["Board"] },
        { tags: null },
        { tags: ["  ", "Volunteer"] },
      ],
      "tenant-b": [{ tags: ["Other tenant tag"] }],
    });

    await expect(
      listAdminCrmTagOptions(client as never, "tenant-a"),
    ).resolves.toEqual(["Board", "Major donor", "Volunteer"]);
  });

  it("reads past the first page, so tags on later records are offered too", async () => {
    const rows: TagRow[] = Array.from(
      { length: CRM_TAG_SCAN_PAGE_SIZE + 5 },
      (_, index) => ({
        tags: index === CRM_TAG_SCAN_PAGE_SIZE + 2 ? ["Late tag"] : ["Common"],
      }),
    );
    const { client, calls } = fakeSupabase({ "tenant-a": rows });

    const tags = await listAdminCrmTagOptions(client as never, "tenant-a");

    expect(tags).toEqual(["Common", "Late tag"]);
    expect(calls).toHaveLength(2);
    expect(calls.every((call) => call.tenantId === "tenant-a")).toBe(true);
  });

  it("surfaces a database error instead of an empty list", async () => {
    const client = {
      from: () => {
        const builder = {
          select: () => builder,
          eq: () => builder,
          not: () => builder,
          order: () => builder,
          range: async () => ({ data: null, error: { message: "boom" } }),
        };
        return builder;
      },
    };
    await expect(
      listAdminCrmTagOptions(client as never, "tenant-a"),
    ).rejects.toThrow("boom");
  });
});
