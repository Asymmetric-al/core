import { beforeEach, describe, expect, it, vi } from "vitest";

const { select, profileQuery, auth } = vi.hoisted(() => ({
  select: vi.fn(),
  profileQuery: vi.fn(),
  auth: {
    isAuthenticated: true,
    userId: "user-1",
    tenantId: "tenant-1",
    role: "staff",
  },
}));
vi.mock("@asym/auth/context", () => ({
  getAuthContext: async () => auth,
  hasAnyContextRole: () => true,
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: null }),
}));
vi.mock("@asym/database/supabase/server", () => ({
  createClient: async () => ({
    from: () => ({
      select: (columns: string) => {
        select(columns);
        return { eq: () => ({ maybeSingle: profileQuery }) };
      },
    }),
  }),
}));
vi.mock("@asym/lib/mission-control/bootstrap", () => ({
  createMCBootstrapState: (input: unknown) => input,
}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { getProtectedShellState } from "../../../../apps/admin/lib/admin-access";

describe("admin shell identity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("uses the tenant foreign key when reading a profile", async () => {
    profileQuery.mockResolvedValue({
      data: {
        email: "staff@example.org",
        tenants: { id: "tenant-1", name: "Our tenant", slug: "ours" },
      },
    });
    const state = await getProtectedShellState("/");
    expect(select).toHaveBeenCalledWith(
      expect.stringContaining(
        "tenants!profiles_tenant_id_fkey(id, name, slug)",
      ),
    );
    expect(state).toMatchObject({
      email: "staff@example.org",
      tenant: { id: "tenant-1", name: "Our tenant", slug: "ours" },
    });
  });
  it("keeps only the authenticated tenant identity if the joined row is absent", async () => {
    profileQuery.mockResolvedValue({ data: { tenants: null } });
    expect(await getProtectedShellState("/")).toMatchObject({
      tenant: { id: "tenant-1", name: "", slug: "" },
    });
  });
});
