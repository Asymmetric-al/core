import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const getAuthContextMock = vi.fn();
const hasAnyContextRoleMock = vi.fn();

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  hasAnyContextRole: hasAnyContextRoleMock,
}));

import {
  readJsonBody,
  requireMemberCareAccess,
  toApiErrorResponse,
  toMutationErrorResponse,
} from "../../../../apps/admin/app/api/admin/member-care/_lib";

describe("member care route helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: false,
      userId: null,
      tenantId: null,
    });

    const result = await requireMemberCareAccess();
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected auth failure");
    expect(result.response.status).toBe(401);
  });

  it("returns 403 when authenticated but role is not allowed", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      userId: "user-1",
      tenantId: "tenant-1",
      role: "viewer",
    });
    hasAnyContextRoleMock.mockReturnValue(false);

    const result = await requireMemberCareAccess();
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected auth failure");
    expect(result.response.status).toBe(403);
  });

  it("returns context when authenticated and role is allowed", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      userId: "user-1",
      tenantId: "tenant-1",
      role: "admin",
    });
    hasAnyContextRoleMock.mockReturnValue(true);

    const result = await requireMemberCareAccess();
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected auth success");
    expect(result.context).toEqual({
      tenantId: "tenant-1",
      userId: "user-1",
    });
  });

  it("returns 400 for invalid json request body", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: "{invalid-json",
    });

    const result = await readJsonBody(request);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected invalid JSON failure");
    expect(result.response.status).toBe(400);
  });

  it("returns 400 for non-object json payloads", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(["not-an-object"]),
    });

    const result = await readJsonBody(request);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected object payload failure");
    expect(result.response.status).toBe(400);
  });

  it("maps zod errors to 422 responses", async () => {
    const response = toMutationErrorResponse(
      new z.ZodError([
        {
          code: "invalid_type",
          expected: "string",
          received: "number",
          path: ["personnelId"],
          message: "Expected string",
        },
      ]),
      "Fallback",
    );

    expect(response.status).toBe(422);
  });

  it("maps unknown errors to supplied status and fallback message", async () => {
    const response = toApiErrorResponse(new Error("boom"), "fallback", 503);
    expect(response.status).toBe(503);
  });
});
