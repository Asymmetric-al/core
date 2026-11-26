import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  signWebStudioSelection,
  WEB_STUDIO_TENANT_COOKIE,
} from "../../../../packages/auth/web-studio";

const USER = "00000000-0000-4000-8000-0000000000c1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const NAME = "x-asym-name-tenant";
const SECRET = "unit-test-web-studio-name-secret";

const state = vi.hoisted(() => ({
  signedIn: {} as unknown,
  cookie: undefined as string | undefined,
  headers: new Headers(),
  set: [] as Array<Record<string, unknown>>,
}));

vi.mock("server-only", () => ({}));
vi.mock("@asym/auth/context", () => ({
  getSignedInAssignments: async () => state.signedIn,
}));
vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === WEB_STUDIO_TENANT_COOKIE && state.cookie !== undefined
        ? { name, value: state.cookie }
        : undefined,
    set: (cookie: Record<string, unknown>) => state.set.push(cookie),
  }),
  headers: async () => state.headers,
}));
class RedirectError extends Error {
  constructor(public readonly target: string) {
    super(`NEXT_REDIRECT:${target}`);
  }
}
vi.mock("next/navigation", () => ({
  redirect: (target: string) => {
    throw new RedirectError(target);
  },
  permanentRedirect: (target: string) => {
    throw new RedirectError(target);
  },
  unstable_rethrow: () => undefined,
}));

const { requireWebStudioAccess, readWebStudioSelection } =
  await import("../../../../apps/admin/src/cms/web-studio-access");
const { chooseWebStudioOrganization } =
  await import("../../../../apps/admin/app/(auth)/web-studio/organization/actions");
const { loadOrganizationChoices, loadWebStudioOrganizationChoices } =
  await import("../../../../packages/api/src/auth/organization-choices");

function assignment(
  id: number,
  tenantId: string,
  membershipRole = "staff",
  staffRole: string | null = "development",
) {
  return {
    assignmentId: `00000000-0000-4000-8000-${id.toString(16).padStart(12, "0")}`,
    userId: USER,
    tenantId,
    revision: "r",
    membershipRole,
    staffRole: membershipRole === "staff" ? staffRole : null,
    isTenantAdmin: false,
  };
}
const P_DEV_A = assignment(0x801, TA);
const P_FIN_A = assignment(0x802, TA, "staff", "finance");
const P_DEV_B = assignment(0x803, TB);
const P_MISS_A = assignment(0x804, TA, "missionary");
const P_MISS_B = assignment(0x805, TB, "missionary");
const P = [P_DEV_A, P_FIN_A, P_DEV_B, P_MISS_A, P_MISS_B];
const Q = [assignment(0x811, TA, "staff", "member_care")];
const R = [assignment(0x821, TA), assignment(0x822, TB)];

function signedIn(assignments: unknown[]) {
  return {
    kind: "signed_in",
    userId: USER,
    assignments,
    organizationNames: new Map([
      [TA, "Alpha Mission"],
      [TB, "Bravo Mission"],
    ]),
  };
}

async function selectCookie(tenantId: string, assignmentId: string) {
  state.cookie = await signWebStudioSelection(
    { tenantId, assignmentId },
    SECRET,
  );
}

function onName(tenantId: string | null) {
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
  state.headers = new Headers(
    tenantId === null
      ? { "next-action": "choose" }
      : {
          [NAME]: tenantId,
          "x-asym-name-generation": "7",
          "next-action": "choose",
        },
  );
}

async function redirectOf(run: () => Promise<unknown>) {
  try {
    await run();
  } catch (error) {
    if (error instanceof RedirectError) return error.target;
    throw error;
  }
  throw new Error("expected a redirect");
}

function choose(tenantId: string, assignmentId: string) {
  const form = new FormData();
  form.set("tenant", tenantId);
  form.set("assignment", assignmentId);
  form.set("next", "/web-studio");
  return chooseWebStudioOrganization(form);
}

beforeEach(() => {
  vi.stubEnv("PAYLOAD_SECRET", SECRET);
  state.signedIn = signedIn(P);
  state.cookie = undefined;
  state.headers = new Headers();
  state.set = [];
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("on: Web Studio's render gate takes the name (D-18, N2 part 2a: the name's fixture carries its generation, 7)", () => {
  it("sends P with a cookie for B to the chooser with refused=1 on name A, and selects nothing", async () => {
    onName(TA);
    await selectCookie(TB, P_DEV_B.assignmentId);
    expect(await redirectOf(() => requireWebStudioAccess("/web-studio"))).toBe(
      "/web-studio/organization?next=%2Fweb-studio&refused=1",
    );
    await expect(readWebStudioSelection()).resolves.toEqual({ kind: "none" });
  });

  it("sends Q to /no-access on name B, never the chooser", async () => {
    onName(TB);
    state.signedIn = signedIn(Q);
    await selectCookie(TA, Q[0]!.assignmentId);
    expect(await redirectOf(() => requireWebStudioAccess("/web-studio"))).toBe(
      "/no-access",
    );
  });

  it("lets Q with no cookie in on name A", async () => {
    onName(TA);
    state.signedIn = signedIn(Q);
    await expect(requireWebStudioAccess("/web-studio")).resolves.toMatchObject({
      scope: { tenantId: TA, assignmentId: Q[0]!.assignmentId },
      organization: { canSwitch: false },
    });
  });

  it("counts the name's staff rows only for canSwitch: false for R on A, true for P", async () => {
    onName(TA);
    state.signedIn = signedIn(R);
    await expect(requireWebStudioAccess("/web-studio")).resolves.toMatchObject({
      scope: { tenantId: TA },
      organization: { canSwitch: false },
    });
    state.signedIn = signedIn(P);
    await selectCookie(TA, P_FIN_A.assignmentId);
    await expect(requireWebStudioAccess("/web-studio")).resolves.toMatchObject({
      scope: { tenantId: TA, assignmentId: P_FIN_A.assignmentId },
      organization: { canSwitch: true },
    });
  });

  it.each([
    ["absent", null],
    ["invalid", "not-a-uuid"],
  ] as const)(
    "fails closed when the name is %s: /no-access, and no selection",
    async (_l, name) => {
      onName(null);
      if (name) state.headers = new Headers({ [NAME]: name });
      state.signedIn = signedIn(Q);
      expect(
        await redirectOf(() => requireWebStudioAccess("/web-studio")),
      ).toBe("/no-access");
      await expect(readWebStudioSelection()).resolves.toEqual({ kind: "none" });
    },
  );

  it("refuses on name B a person whose rows there are suspended or revoked", async () => {
    onName(TB);
    state.signedIn = signedIn([P_DEV_A, P_FIN_A, P_MISS_A]);
    expect(await redirectOf(() => requireWebStudioAccess("/web-studio"))).toBe(
      "/no-access",
    );
  });
});

describe("on: the choice action takes the name", () => {
  it("refuses B and signs A on name A", async () => {
    onName(TA);
    expect(await redirectOf(() => choose(TB, P_DEV_B.assignmentId))).toBe(
      "/web-studio/organization?next=%2Fweb-studio&refused=1",
    );
    expect(state.set).toEqual([]);
    expect(await redirectOf(() => choose(TA, P_FIN_A.assignmentId))).toBe(
      "/web-studio",
    );
    expect(state.set).toHaveLength(1);
    expect(String(state.set[0]!.value)).toContain(
      `${TA}.${P_FIN_A.assignmentId}`,
    );
  });

  it.each([
    ["absent", null],
    ["invalid", "not-a-uuid"],
  ] as const)("signs nothing when the name is %s", async (_l, name) => {
    onName(null);
    if (name) {
      state.headers = new Headers({ [NAME]: name, "next-action": "choose" });
    }
    expect(await redirectOf(() => choose(TA, P_FIN_A.assignmentId))).toBe(
      "/no-access",
    );
    expect(state.set).toEqual([]);
  });
});

describe("on: both choosers list the name's rows only", () => {
  it("Web Studio's chooser lists A's staff rows on name A", async () => {
    onName(TA);
    const choices = await loadWebStudioOrganizationChoices();
    expect(choices).toMatchObject({ kind: "ok" });
    expect(
      (
        choices as { organizations: Array<{ tenantId: string }> }
      ).organizations.map((organization) => organization.tenantId),
    ).toEqual([TA]);
  });

  it("Mission Control's chooser shows nothing of B, whatever ?tenant= says", async () => {
    onName(TA);
    for (const tenantId of [TB, null]) {
      const choices = await loadOrganizationChoices({
        roleClass: "staff",
        tenantId,
        next: "/donors",
      });
      expect(JSON.stringify(choices), String(tenantId)).not.toContain(TB);
      expect(choices).toMatchObject({
        kind: "ok",
        organizations: [{ tenantId: TA }],
      });
    }
  });

  it.each([
    ["absent", null],
    ["invalid", "not-a-uuid"],
  ] as const)("both list nothing when the name is %s", async (_l, name) => {
    onName(null);
    if (name) state.headers = new Headers({ [NAME]: name });
    await expect(loadWebStudioOrganizationChoices()).resolves.toEqual({
      kind: "ok",
      organizations: [],
    });
    await expect(
      loadOrganizationChoices({ roleClass: "staff" }),
    ).resolves.toEqual({ kind: "ok", organizations: [] });
  });
});

describe.each([
  ["unset", undefined],
  ["0", "0"],
] as const)(
  "off (switch %s): a client's name header changes nothing",
  (_label, value) => {
    beforeEach(() => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
      vi.stubEnv("CORE_APP_BASE_PATH", "");
    });

    async function gate() {
      try {
        return await requireWebStudioAccess("/web-studio");
      } catch (error) {
        if (error instanceof RedirectError) return error.target;
        throw error;
      }
    }

    it("the gate, the selection, the action and the choosers answer as without it", async () => {
      await selectCookie(TB, P_DEV_B.assignmentId);
      const without = {
        gate: await gate(),
        selection: await readWebStudioSelection(),
        studio: await loadWebStudioOrganizationChoices(),
        chooser: await loadOrganizationChoices({ roleClass: "staff" }),
      };
      state.headers = new Headers({ [NAME]: TA });
      expect({
        gate: await gate(),
        selection: await readWebStudioSelection(),
        studio: await loadWebStudioOrganizationChoices(),
        chooser: await loadOrganizationChoices({ roleClass: "staff" }),
      }).toEqual(without);
      expect(without.selection).toMatchObject({ tenantId: TB });

      state.cookie = "v1.x.y.z";
      expect(await gate()).toBe("/web-studio/organization?next=%2Fweb-studio");
      await redirectOf(() => choose(TB, P_DEV_B.assignmentId));
      expect(state.set).toHaveLength(1);
    });
  },
);

describe("on: Web Studio's scope carries the name's generation", () => {
  it("gives Q's document on name A generation 7, so its own-API calls send it", async () => {
    onName(TA);
    state.signedIn = signedIn(Q);
    const access = await requireWebStudioAccess("/web-studio");
    expect(access.scope).toEqual({
      userId: USER,
      tenantId: TA,
      assignmentId: Q[0]!.assignmentId,
      addressPrefix: "",
      generation: 7,
    });
  });

  it.each([
    ["absent", null],
    ["invalid", "07"],
  ] as const)(
    "refuses a valid name whose generation is %s: /no-access, and selects nothing",
    async (_label, generation) => {
      onName(TA);
      state.headers.delete("x-asym-name-generation");
      if (generation !== null) {
        state.headers.set("x-asym-name-generation", generation);
      }
      state.signedIn = signedIn(Q);
      expect(
        await redirectOf(() => requireWebStudioAccess("/web-studio")),
      ).toBe("/no-access");
      await expect(readWebStudioSelection()).resolves.toEqual({
        kind: "none",
      });
    },
  );
});

describe.each([
  ["unset", undefined],
  ["0", "0"],
] as const)(
  "off (switch %s): a client's generation headers change nothing",
  (_label, value) => {
    it("the gate's scope has today's keys", async () => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
      vi.stubEnv("CORE_APP_BASE_PATH", "");
      state.signedIn = signedIn(Q);
      const without = await requireWebStudioAccess("/web-studio");
      state.headers = new Headers({
        "x-asym-name-generation": "6",
        "x-asym-scope-generation": "6",
      });
      const withThem = await requireWebStudioAccess("/web-studio");
      expect(withThem).toEqual(without);
      expect(Object.keys(withThem.scope).sort()).toEqual([
        "addressPrefix",
        "assignmentId",
        "tenantId",
        "userId",
      ]);
    });
  },
);
