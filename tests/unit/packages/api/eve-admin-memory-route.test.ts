import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthenticatedContext } from "@asym/auth/context";
import type { NextRequest } from "next/server";

const getAdminClientMock = vi.fn();
const getAuthContextMock = vi.fn();
const requireRoleMock = vi.fn();
const createAuditLoggerMock = vi.fn();
const loadViewMock = vi.fn();
const createMemoryMock = vi.fn();
const updateMemoryMock = vi.fn();
const setAutoSaveMock = vi.fn();
const deleteMemoryMock = vi.fn();
const profileSingleMock = vi.fn();

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  requireAuth: vi.fn(),
  requireRole: requireRoleMock,
}));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: createAuditLoggerMock,
}));

vi.mock("../../../../packages/api/src/eve/admin-memory/store", () => ({
  loadEveAdminMemoryAdminView: loadViewMock,
}));

vi.mock("../../../../packages/api/src/eve/admin-memory/control", () => ({
  createEveAdminMemory: createMemoryMock,
  updateEveAdminMemory: updateMemoryMock,
  setEveAdminMemoryAutoSave: setAutoSaveMock,
  deleteEveAdminMemory: deleteMemoryMock,
}));

const tenantId = "00000000-0000-4000-8000-000000000001";
const profileId = "00000000-0000-4000-8000-000000000002";
const entryId = "00000000-0000-4000-8000-000000000003";

const superAdminAuth = {
  userId: "user_1",
  email: "super-admin@example.com",
  tenantId,
  profileId,
  role: "super_admin",
  profileRole: "super_admin",
  memberships: [],
  isAuthenticated: true,
} as AuthenticatedContext;

type RouteModule =
  typeof import("../../../../packages/api/src/eve/admin-memory/route");

type RouteCase = {
  invoke: (route: RouteModule) => Promise<Response>;
  mutationMock: ReturnType<typeof vi.fn> | null;
  name: string;
};

function request(method: string, body?: unknown): NextRequest {
  return new Request("https://admin.example.test/api/admin/eve/memory", {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers:
      body === undefined ? undefined : { "content-type": "application/json" },
  }) as NextRequest;
}

const routeCases: RouteCase[] = [
  {
    name: "GET",
    invoke: (route) => route.GET(request("GET")),
    mutationMock: null,
  },
  {
    name: "POST",
    invoke: (route) =>
      route.POST(
        request("POST", {
          category: "preference",
          content: "Prefer concise summaries.",
          source: "manual",
          title: "Updates",
        }),
      ),
    mutationMock: createMemoryMock,
  },
  {
    name: "PATCH edit",
    invoke: (route) =>
      route.PATCH(
        request("PATCH", {
          action: "edit",
          category: "decision",
          content: "Use the shared boundary.",
          entryId,
          expectedVersion: 1,
          title: "Choice",
        }),
      ),
    mutationMock: updateMemoryMock,
  },
  {
    name: "PATCH auto-save",
    invoke: (route) =>
      route.PATCH(
        request("PATCH", {
          action: "set_auto_save",
          category: "preference",
          enabled: false,
        }),
      ),
    mutationMock: setAutoSaveMock,
  },
  {
    name: "DELETE",
    invoke: (route) =>
      route.DELETE(
        request("DELETE", {
          entryId,
          expectedVersion: 1,
        }),
      ),
    mutationMock: deleteMemoryMock,
  },
];

function createSupabaseAdmin() {
  const single = { single: profileSingleMock };
  const profileQuery = {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => single),
      })),
    })),
  };

  return {
    from: vi.fn((table: string) => {
      if (table !== "profiles") {
        throw new Error(`Unexpected table: ${table}`);
      }
      return profileQuery;
    }),
  };
}

function expectNoMemoryAccess() {
  expect(loadViewMock).not.toHaveBeenCalled();
  expect(createMemoryMock).not.toHaveBeenCalled();
  expect(updateMemoryMock).not.toHaveBeenCalled();
  expect(setAutoSaveMock).not.toHaveBeenCalled();
  expect(deleteMemoryMock).not.toHaveBeenCalled();
}

describe("Eve admin-memory route tenant binding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminClientMock.mockReturnValue({
      client: createSupabaseAdmin(),
      error: null,
    });
    getAuthContextMock.mockResolvedValue(superAdminAuth);
    createAuditLoggerMock.mockReturnValue({});
    profileSingleMock.mockResolvedValue({
      data: { tenant_id: tenantId },
      error: null,
    });
    loadViewMock.mockResolvedValue({ entries: [], history: [], settings: [] });
    createMemoryMock.mockResolvedValue({ stored: true, entry: { id: entryId } });
    updateMemoryMock.mockResolvedValue({ stored: true, entry: { id: entryId } });
    setAutoSaveMock.mockResolvedValue(undefined);
    deleteMemoryMock.mockResolvedValue(undefined);
  });

  it.each(routeCases)(
    "allows a tenant-bound super-admin to use $name",
    async ({ invoke, mutationMock }) => {
      const route =
        await import("../../../../packages/api/src/eve/admin-memory/route");
      const response = await invoke(route);

      expect(response.status).toBeLessThan(400);
      expect(loadViewMock).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerProfileId: profileId,
          tenantId,
        }),
      );
      if (mutationMock) {
        expect(mutationMock).toHaveBeenCalledWith(
          expect.objectContaining({ auth: superAdminAuth }),
        );
      }
    },
  );

  it.each(routeCases)(
    "keeps ordinary tenant-bound admin $name behavior unchanged",
    async ({ invoke, mutationMock }) => {
      const adminAuth = {
        ...superAdminAuth,
        email: "admin@example.com",
        role: "admin" as const,
        profileRole: "admin" as const,
      };
      getAuthContextMock.mockResolvedValue(adminAuth);
      const route =
        await import("../../../../packages/api/src/eve/admin-memory/route");

      const response = await invoke(route);

      expect(response.status).toBeLessThan(400);
      expect(loadViewMock).toHaveBeenCalledOnce();
      if (mutationMock) {
        expect(mutationMock).toHaveBeenCalledWith(
          expect.objectContaining({ auth: adminAuth }),
        );
      }
    },
  );

  it.each(routeCases)(
    "denies a tenantless persisted profile before $name memory access",
    async ({ invoke }) => {
      profileSingleMock.mockResolvedValue({
        data: { tenant_id: null },
        error: null,
      });
      const route =
        await import("../../../../packages/api/src/eve/admin-memory/route");

      const response = await invoke(route);

      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({
        error:
          "Private memory requires a tenant-bound profile matching the authenticated tenant.",
        requestId: expect.any(String),
      });
      expectNoMemoryAccess();
    },
  );

  it.each(routeCases)(
    "denies a persisted/auth tenant mismatch before $name memory access",
    async ({ invoke }) => {
      profileSingleMock.mockResolvedValue({
        data: { tenant_id: "00000000-0000-4000-8000-000000000004" },
        error: null,
      });
      const route =
        await import("../../../../packages/api/src/eve/admin-memory/route");

      const response = await invoke(route);

      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({
        error:
          "Private memory requires a tenant-bound profile matching the authenticated tenant.",
        requestId: expect.any(String),
      });
      expectNoMemoryAccess();
    },
  );
});
