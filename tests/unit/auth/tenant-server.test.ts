import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Server side of the tenant address (plan 5.2; AL-2675): the signed-in
 * layouts read the document scope once from what the proxy decided, and
 * server redirects keep the prefix.
 */

const requestHeaders = vi.hoisted(() => new Map<string, string>());
const redirect = vi.hoisted(() =>
  vi.fn((target: string) => {
    throw new Error(`NEXT_REDIRECT ${target}`);
  }),
);

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => requestHeaders.get(name) ?? null,
  }),
}));
const permanentRedirect = vi.hoisted(() =>
  vi.fn((target: string) => {
    throw new Error(`NEXT_PERMANENT_REDIRECT ${target}`);
  }),
);
vi.mock("next/navigation", () => ({ redirect, permanentRedirect }));

const { permanentRedirectInTenant, readDocumentScope, redirectInTenant } =
  await import("../../../packages/auth/tenant-server");

const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const assignment = {
  assignmentId: "00000000-0000-4000-8000-000000000101",
  userId: "00000000-0000-4000-8000-0000000000a1",
  tenantId: TA,
  revision: "r1",
  membershipRole: "staff" as const,
  staffRole: "finance" as const,
  isTenantAdmin: false,
};
const auth = {
  userId: assignment.userId,
  email: null,
  tenantId: TA,
  role: "staff" as const,
  profileRole: null,
  memberships: [],
  assignment,
  assignmentDenial: null,
  profileId: "profile-1",
  isAuthenticated: true,
};

beforeEach(() => {
  requestHeaders.clear();
  redirect.mockClear();
});

describe("readDocumentScope", () => {
  it("builds the scope from the proxy's prefix and the resolved assignment", async () => {
    requestHeaders.set("x-asym-address-prefix", `/${TA}~finance`);

    await expect(readDocumentScope(auth)).resolves.toEqual({
      userId: assignment.userId,
      tenantId: TA,
      assignmentId: assignment.assignmentId,
      addressPrefix: `/${TA}~finance`,
    });
  });

  it("has no scope on a request without a tenant address", async () => {
    await expect(readDocumentScope(auth)).resolves.toBeNull();
  });

  it("fails loudly when the resolution and the address disagree", async () => {
    requestHeaders.set("x-asym-address-prefix", `/${TB}`);
    await expect(readDocumentScope(auth)).rejects.toThrow(/does not match/);

    requestHeaders.set("x-asym-address-prefix", `/${TA}`);
    await expect(
      readDocumentScope({ ...auth, assignment: null }),
    ).rejects.toThrow(/does not match/);
  });
});

describe("redirectInTenant", () => {
  it("keeps the document's prefix on a server redirect", async () => {
    requestHeaders.set("x-asym-address-prefix", `/${TA}`);

    await expect(redirectInTenant("/contributions?gift=1")).rejects.toThrow(
      `NEXT_REDIRECT /${TA}/contributions?gift=1`,
    );
    await expect(redirectInTenant("/login")).rejects.toThrow(
      "NEXT_REDIRECT /login",
    );
  });

  it("keeps the prefix on a permanent redirect too", async () => {
    requestHeaders.set("x-asym-address-prefix", `/${TA}`);

    await expect(permanentRedirectInTenant("/feed")).rejects.toThrow(
      `NEXT_PERMANENT_REDIRECT /${TA}/feed`,
    );
  });

  it("redirects unchanged on a request without a tenant address", async () => {
    await expect(redirectInTenant("/contributions")).rejects.toThrow(
      "NEXT_REDIRECT /contributions",
    );
  });
});
