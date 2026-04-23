import { afterEach, describe, expect, it, vi } from "vitest";

import {
  readJsonBody,
  requireSupportHubAccess,
  toApiErrorResponse,
} from "../../../../../../packages/api/src/admin/support-hub/route-helpers";
import { saveLabelSchema } from "../../../../../../packages/api/src/admin/support-hub/schemas";

const getAuthContextMock = vi.hoisted(() => vi.fn());
const hasAnyContextRoleMock = vi.hoisted(() => vi.fn());

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  hasAnyContextRole: hasAnyContextRoleMock,
}));

afterEach(() => {
  getAuthContextMock.mockReset();
  hasAnyContextRoleMock.mockReset();
});

describe("requireSupportHubAccess", () => {
  it("returns 401 when the caller is not authenticated", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: false,
      userId: null,
      tenantId: null,
    });
    const result = await requireSupportHubAccess();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(401);
  });

  it("returns 403 when the caller lacks the support roles", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      userId: "user-1",
      tenantId: "tenant-1",
      role: "donor",
      profileRole: "donor",
    });
    hasAnyContextRoleMock.mockReturnValue(false);
    const result = await requireSupportHubAccess();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(403);
  });

  it("returns the typed context for a staff caller", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      userId: "user-1",
      tenantId: "tenant-1",
      role: "staff",
      profileRole: "staff",
    });
    hasAnyContextRoleMock.mockReturnValue(true);
    const result = await requireSupportHubAccess();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.context).toEqual({
      tenantId: "tenant-1",
      userId: "user-1",
      isSuperAdmin: false,
    });
  });
});

describe("readJsonBody", () => {
  it("returns 400 for non-object bodies", async () => {
    const request = new Request("https://example.org", {
      method: "POST",
      body: JSON.stringify(["not", "an", "object"]),
      headers: { "content-type": "application/json" },
    });
    const result = await readJsonBody(request);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(400);
  });

  it("validates against the supplied schema", async () => {
    const request = new Request("https://example.org", {
      method: "POST",
      body: JSON.stringify({
        name: "",
        slug: "x",
        tone: "blue",
        description: null,
      }),
      headers: { "content-type": "application/json" },
    });
    const result = await readJsonBody(request, saveLabelSchema);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(422);
  });
});

describe("toApiErrorResponse", () => {
  it("returns the supplied fallback for a generic error", () => {
    const response = toApiErrorResponse(new Error("boom"), "Failed.");
    expect(response.status).toBe(500);
  });
});
