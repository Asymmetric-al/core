import { describe, expect, it, vi } from "vitest";

import {
  assertSingleNavigationPerTenant,
  assertUniquePageSlugWithinTenant,
} from "../../../apps/admin/src/cms/hooks/public-contract";

function createHookArgs(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    data: {
      id: "draft_1",
      slug: "home",
      tenant: "tenant_1",
      ...overrides.data,
    },
    operation: "create",
    originalDoc: undefined,
    req: {
      payload: {
        find: vi.fn().mockResolvedValue({ docs: [] }),
      },
    },
    ...overrides,
  } as never;
}

describe("CMS public contract hooks", () => {
  it("rejects duplicate page slugs within the same tenant", async () => {
    const args = createHookArgs();
    args.req.payload.find.mockResolvedValue({
      docs: [{ id: "page_existing", slug: "home", tenant: "tenant_1" }],
    });

    await expect(assertUniquePageSlugWithinTenant(args)).rejects.toThrow(
      /already uses the slug/i,
    );

    expect(args.req.payload.find).toHaveBeenCalledWith({
      collection: "pages",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          { tenant: { equals: "tenant_1" } },
          { slug: { equals: "home" } },
        ],
      },
    });
  });

  it("excludes the current page document when validating updates", async () => {
    const args = createHookArgs({
      operation: "update",
      originalDoc: { id: "page_1" },
      data: { slug: "home", tenant: "tenant_1" },
    });

    await assertUniquePageSlugWithinTenant(args);

    expect(args.req.payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          and: [
            { tenant: { equals: "tenant_1" } },
            { slug: { equals: "home" } },
            { id: { not_equals: "page_1" } },
          ],
        },
      }),
    );
  });

  it("rejects multiple navigation documents for one tenant", async () => {
    const args = createHookArgs({
      data: { tenant: "tenant_1", label: "Primary" },
    });
    args.req.payload.find.mockResolvedValue({
      docs: [{ id: "nav_1", tenant: "tenant_1" }],
    });

    await expect(assertSingleNavigationPerTenant(args)).rejects.toThrow(
      /single navigation document/i,
    );

    expect(args.req.payload.find).toHaveBeenCalledWith({
      collection: "navigation",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: {
        tenant: {
          equals: "tenant_1",
        },
      },
    });
  });
});
