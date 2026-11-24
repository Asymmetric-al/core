import { NextRequest } from "next/server";
import { expect, it, vi } from "vitest";

import { GET } from "../../../../../../packages/api/src/admin/member-care/directory";

import type * as AuthContext from "@asym/auth/context";

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthContext>()),
  getAuthContext: async () => ({
    isAuthenticated: true,
    userId: "11111111-1111-4111-8111-111111111111",
    email: "care@example.test",
    tenantId: "00000000-0000-0000-0000-000000000001",
    role: "staff",
    profileId: "11111111-1111-4111-8111-111111111111",
    memberships: [
      {
        tenantId: "00000000-0000-0000-0000-000000000001",
        role: "staff",
        staffRole: "member_care",
        isTenantAdmin: false,
        isActive: true,
      },
    ],
    assignment: {
      assignmentId: "22222222-2222-4222-8222-222222222222",
      userId: "11111111-1111-4111-8111-111111111111",
      tenantId: "00000000-0000-0000-0000-000000000001",
      membershipRole: "staff",
      staffRole: "member_care",
      isTenantAdmin: false,
      revision: "2026-11-24T00:00:00Z",
    },
  }),
}));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: () => ({ log: vi.fn() }),
}));

vi.mock(
  "../../../../../../packages/api/src/shared/request-session-client",
  () => ({
    requestCarriesSupabaseSession: () => true,
    createRequestSessionClient: async () => ({}),
  }),
);

vi.mock("@asym/api/reads/member-care", () => ({
  MEMBER_CARE_DIRECTORY_LIMIT: 250,
  readMemberCareDirectorySnapshot: vi
    .fn()
    .mockResolvedValue({ personnel: [{ id: "member" }], total: 290 }),
}));

it("preserves the directory array contract and exposes total and cap headers", async () => {
  const response = await GET(
    new NextRequest("https://example.test/api/admin/member-care/directory"),
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual([{ id: "member" }]);
  expect(response.headers.get("X-Total-Count")).toBe("290");
  expect(response.headers.get("X-Directory-Limit")).toBe("250");
});
