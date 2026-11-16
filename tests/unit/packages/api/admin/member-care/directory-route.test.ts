import { expect, it, vi } from "vitest";

vi.mock("@asym/api/admin/member-care/route-helpers", () => ({
  requireMemberCareAccess: vi
    .fn()
    .mockResolvedValue({ ok: true, context: { tenantId: "tenant" } }),
  toApiErrorResponse: vi.fn(),
}));
vi.mock("@asym/api/reads/member-care", () => ({
  MEMBER_CARE_DIRECTORY_LIMIT: 250,
  readMemberCareDirectorySnapshot: vi
    .fn()
    .mockResolvedValue({ personnel: [{ id: "member" }], total: 290 }),
}));

import { GET } from "../../../../../../apps/admin/app/api/admin/member-care/directory/route";

it("preserves the directory array contract and exposes total and cap headers", async () => {
  const response = await GET(
    new Request("https://example.test/api/admin/member-care/directory"),
  );
  expect(await response.json()).toEqual([{ id: "member" }]);
  expect(response.headers.get("X-Total-Count")).toBe("290");
  expect(response.headers.get("X-Directory-Limit")).toBe("250");
});
