import { afterEach, describe, expect, it, vi } from "vitest";
import { membershipsForRole } from "../../../../../fixtures/auth-memberships";

import {
  readJsonBody,
  requireSupportHubAccess,
  toApiErrorResponse,
} from "../../../../../../packages/api/src/admin/support-hub/route-helpers";
import {
  saveBusinessHoursSchema,
  saveLabelSchema,
} from "../../../../../../packages/api/src/admin/support-hub/schemas";

const getAuthContextMock = vi.hoisted(() => vi.fn());

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@asym/auth/context")>()),
  getAuthContext: getAuthContextMock,
}));

afterEach(() => {
  getAuthContextMock.mockReset();
});

describe("requireSupportHubAccess", () => {
  const authRequest = new Request("https://example.org/api/admin/support");

  it("returns 401 when the caller is not authenticated", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: false,
      userId: null,
      tenantId: null,
    });
    const result = await requireSupportHubAccess(authRequest);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(401);
    expect(getAuthContextMock).toHaveBeenCalledWith(authRequest);
  });

  it("returns 403 when the caller lacks admin.dashboard.access (a donor)", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      userId: "user-1",
      tenantId: "tenant-1",
      role: "donor",
      // AL-2675: authority is the membership the request acts under.
      memberships: membershipsForRole("donor", "tenant-1"),
    });
    const result = await requireSupportHubAccess(authRequest);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(403);
  });

  it("returns the typed context for a staff caller", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      userId: "user-1",
      email: "user-1@example.com",
      tenantId: "tenant-1",
      role: "staff",
      // AL-2675: authority is the membership the request acts under.
      memberships: membershipsForRole("staff", "tenant-1"),
    });
    const result = await requireSupportHubAccess(authRequest);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.context).toEqual({
      tenantId: "tenant-1",
      userId: "user-1",
      userEmail: "user-1@example.com",
      canManageAll: false,
    });
  });

  it("carries no super-admin flag in the context, even for a context labelled super_admin", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      userId: "user-3",
      email: "user-3@example.com",
      tenantId: "tenant-1",
      role: "super_admin",
      memberships: membershipsForRole("staff", "tenant-1"),
    });
    const result = await requireSupportHubAccess(authRequest);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.context).not.toHaveProperty("isSuperAdmin");
    expect(result.context.canManageAll).toBe(false);
  });

  it("lets the tenant administrator manage every agent's per-agent settings", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      userId: "user-2",
      email: "user-2@example.com",
      tenantId: "tenant-1",
      role: "admin",
      // AL-2675: authority is the membership the request acts under.
      memberships: membershipsForRole("admin", "tenant-1"),
    });
    const result = await requireSupportHubAccess(authRequest);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.context.canManageAll).toBe(true);
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

describe("Support Hub mutation schemas", () => {
  const businessHoursInput = {
    name: "Office",
    timezone: "UTC",
    weeklySchedule: [
      {
        day: "monday",
        enabled: true,
        openTime: "09:00",
        closeTime: "17:00",
      },
    ],
    holidays: [
      {
        id: "holiday_thanksgiving",
        date: "2026-11-26",
        label: "Thanksgiving",
      },
    ],
    isDefault: true,
  };

  it("accepts date-only business-hours holiday inputs", () => {
    expect(saveBusinessHoursSchema.parse(businessHoursInput).holidays).toEqual([
      expect.objectContaining({ date: "2026-11-26" }),
    ]);
  });

  it("rejects non-ISO business-hours holiday inputs", () => {
    expect(
      saveBusinessHoursSchema.safeParse({
        ...businessHoursInput,
        holidays: [
          {
            id: "holiday_invalid",
            date: "Thanksgiving",
            label: "Thanksgiving",
          },
        ],
      }).success,
    ).toBe(false);
  });
});

describe("toApiErrorResponse", () => {
  it("returns the supplied fallback for a generic error", () => {
    const response = toApiErrorResponse(new Error("boom"), "Failed.");
    expect(response.status).toBe(500);
  });
});
