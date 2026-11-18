import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * AL-2675 (WP2a; NR-20): the shell's tenant is the tenant of the caller's
 * staff membership, read from `tenants` by that id, not the profile's tenant
 * through a foreign key; the profile supplies display fields only.
 */
const { select, profileQuery, tenantQuery, tenantFilter, auth } = vi.hoisted(
  () => ({
    select: vi.fn(),
    profileQuery: vi.fn(),
    tenantQuery: vi.fn(),
    tenantFilter: vi.fn(),
    auth: {
      isAuthenticated: true,
      userId: "user-1",
      tenantId: "tenant-1",
      role: "admin",
    },
  }),
);
vi.mock("@asym/auth/context", () => ({
  getAuthContext: async () => auth,
  hasAnyContextRole: () => true,
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: null }),
}));
vi.mock("@asym/database/supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => ({
      select: (columns: string) => {
        select(table, columns);
        return {
          eq: (...args: unknown[]) => {
            if (table === "tenants") tenantFilter(...args);
            return {
              maybeSingle: table === "tenants" ? tenantQuery : profileQuery,
            };
          },
        };
      },
    }),
  }),
}));
vi.mock("@asym/lib/mission-control/bootstrap", () => ({
  createMCBootstrapState: (input: unknown) => input,
}));
// The signed-in layout's gate reads the document scope the proxy decided
// (council round 1, A13: the dead getProtectedShellState is gone).
vi.mock("@asym/auth/tenant-server", () => ({
  readDocumentScope: async () => ({
    userId: "user-1",
    tenantId: "tenant-1",
    assignmentId: "assignment-1",
    addressPrefix: "/tenant-1",
  }),
  redirectInTenant: vi.fn(),
}));

import { getTenantShell } from "../../../../apps/admin/lib/admin-access";

describe("admin shell identity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("reads the tenant of the caller's membership and display fields from the profile", async () => {
    profileQuery.mockResolvedValue({ data: { email: "staff@example.org" } });
    tenantQuery.mockResolvedValue({
      data: { id: "tenant-1", name: "Our tenant", slug: "ours" },
    });
    const { shellState: state } = await getTenantShell("/");
    expect(select).toHaveBeenCalledWith(
      "profiles",
      "email, first_name, last_name, avatar_url",
    );
    expect(select).toHaveBeenCalledWith("tenants", "id, name, slug");
    expect(tenantFilter).toHaveBeenCalledWith("id", "tenant-1");
    expect(state).toMatchObject({
      email: "staff@example.org",
      role: "admin",
      tenant: { id: "tenant-1", name: "Our tenant", slug: "ours" },
    });
  });
  it("keeps only the authenticated tenant identity if the tenant row is absent", async () => {
    profileQuery.mockResolvedValue({ data: null });
    tenantQuery.mockResolvedValue({ data: null });
    expect((await getTenantShell("/")).shellState).toMatchObject({
      tenant: { id: "tenant-1", name: "", slug: "" },
    });
  });
});
