import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const requestHeaders = vi.hoisted(() => new Map<string, string>());
const redirect = vi.hoisted(() =>
  vi.fn((target: string) => {
    throw new Error(`NEXT_REDIRECT ${target}`);
  }),
);
const permanentRedirect = vi.hoisted(() =>
  vi.fn((target: string) => {
    throw new Error(`NEXT_PERMANENT_REDIRECT ${target}`);
  }),
);

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => requestHeaders.get(name) ?? null,
    has: (name: string) => requestHeaders.has(name),
  }),
}));
vi.mock("next/navigation", () => ({
  redirect,
  permanentRedirect,
  unstable_rethrow: () => undefined,
}));

const { readDocumentScope, redirectInTenant, tenantHref } =
  await import("../../../packages/auth/tenant-server");

const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const USER = "00000000-0000-4000-8000-0000000000a1";

function authFor(
  tenantId: string,
  staffRole: "finance" | "development" | "member_care",
) {
  const assignment = {
    assignmentId: "00000000-0000-4000-8000-000000000101",
    userId: USER,
    tenantId,
    revision: "r1",
    membershipRole: "staff" as const,
    staffRole,
    isTenantAdmin: false,
  };
  return {
    userId: USER,
    email: null,
    tenantId,
    role: "staff" as const,
    profileRole: null,
    memberships: [],
    assignment,
    assignmentDenial: null,
    profileId: "profile-1",
    isAuthenticated: true,
  };
}

function onName(prefix: string | null) {
  requestHeaders.set("x-asym-name-tenant", TA);
  requestHeaders.set("x-asym-name-generation", "7");
  if (prefix !== null) requestHeaders.set("x-asym-address-prefix", prefix);
}

beforeEach(() => {
  requestHeaders.clear();
  redirect.mockClear();
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("on: the document scope", () => {
  it("is the name's organization at the empty prefix (base: no scope without an ID prefix)", async () => {
    onName("");
    await expect(
      readDocumentScope(authFor(TA, "member_care")),
    ).resolves.toEqual({
      userId: USER,
      tenantId: TA,
      assignmentId: "00000000-0000-4000-8000-000000000101",
      addressPrefix: "",
      generation: 7,
    });
  });

  it("is the row of the sub-role at /~<sub-role> (base: no scope)", async () => {
    onName("/~finance");
    await expect(readDocumentScope(authFor(TA, "finance"))).resolves.toEqual({
      userId: USER,
      tenantId: TA,
      assignmentId: "00000000-0000-4000-8000-000000000101",
      addressPrefix: "/~finance",
      generation: 7,
    });
  });

  it("refuses a row of another sub-role, or of another organization than the name's", async () => {
    onName("/~finance");
    await expect(
      readDocumentScope(authFor(TA, "development")),
    ).rejects.toThrow();
    onName("");
    await expect(readDocumentScope(authFor(TB, "finance"))).rejects.toThrow();
  });

  it.each([
    ["no prefix at all", null],
    ["an ID prefix", `/${TA}`],
    ["an ID and sub-role prefix", `/${TA}~finance`],
    ["an unknown sub-role", "/~nobody"],
    ["another case", "/~Finance"],
    ["a path, not a prefix", "/~finance/gifts"],
  ])("gives no scope for %s", async (_label, prefix) => {
    onName(prefix);
    await expect(readDocumentScope(authFor(TA, "finance"))).resolves.toBeNull();
  });
});

describe("on: server addresses carry the sub-role, never an ID", () => {
  it("builds hrefs and redirects under /~<sub-role>, and bare under the empty prefix", async () => {
    onName("/~finance");
    await expect(tenantHref("/gifts")).resolves.toBe("/~finance/gifts");
    await expect(redirectInTenant("/gifts")).rejects.toThrow(
      "NEXT_REDIRECT /~finance/gifts",
    );
    requestHeaders.set("x-asym-address-prefix", "");
    await expect(tenantHref("/gifts")).resolves.toBe("/gifts");
    await expect(redirectInTenant("/")).rejects.toThrow("NEXT_REDIRECT /");
  });
});

describe("off: today's prefix (guard)", () => {
  it("reads only the ID prefix, and no empty one", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    vi.stubEnv("CORE_APP_BASE_PATH", "");
    requestHeaders.set("x-asym-address-prefix", "");
    await expect(readDocumentScope(authFor(TA, "finance"))).resolves.toBeNull();
    requestHeaders.set("x-asym-address-prefix", "/~finance");
    await expect(readDocumentScope(authFor(TA, "finance"))).resolves.toBeNull();
    await expect(tenantHref("/gifts")).resolves.toBe("/gifts");
    requestHeaders.set("x-asym-address-prefix", `/${TA}~finance`);
    await expect(tenantHref("/gifts")).resolves.toBe(`/${TA}~finance/gifts`);
  });
});
