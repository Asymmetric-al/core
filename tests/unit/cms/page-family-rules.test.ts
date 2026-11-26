import { beforeAll, describe, expect, it, vi } from "vitest";

const USER = "00000000-0000-4000-8000-0000000000a1";
const TENANT = "00000000-0000-4000-8000-000000000101";
const OTHER = "00000000-0000-4000-8000-000000000102";
const MISSIONARY = "20000000-0000-0000-0000-000000000001";
const FOREIGN_MISSIONARY = "20000000-0000-0000-0000-000000000009";
const FUND = "21000000-0000-0000-0000-000000000001";
const SYSTEM_FUND = "21000000-0000-0000-0000-000000000002";
const FOREIGN_FUND = "21000000-0000-0000-0000-000000000009";

const missionaries = [
  { id: MISSIONARY, tenant_id: TENANT, profile_id: "p1", display_name: "Ana" },
  {
    id: FOREIGN_MISSIONARY,
    tenant_id: OTHER,
    profile_id: "p2",
    display_name: "Bo",
  },
];
const funds = [
  {
    id: FUND,
    tenant_id: TENANT,
    system_purpose: null,
    name: "Wells",
    description: null,
  },
  {
    id: SYSTEM_FUND,
    tenant_id: TENANT,
    system_purpose: "fee_cover",
    name: "Fees",
    description: null,
  },
  {
    id: FOREIGN_FUND,
    tenant_id: OTHER,
    system_purpose: null,
    name: "Other",
    description: null,
  },
];

const state = { session: true, headers: {} as Record<string, string> };

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(
    (
      _url: string,
      _key: string,
      options: { global?: { headers?: Record<string, string> } },
    ) => {
      state.headers = options.global?.headers ?? {};
      return {
        auth: {
          getSession: async () => ({
            data: { session: state.session ? { user: { id: USER } } : null },
          }),
        },
        rpc: async (
          fn: string,
          args: { p_tenant_id: string; p_ids: string[] },
        ) => {
          if (fn !== "crm_missionary_labels") throw new Error(fn);
          return {
            data: missionaries
              .filter(
                (row) =>
                  row.tenant_id === args.p_tenant_id &&
                  args.p_ids.includes(row.id),
              )
              .map((row) => ({
                id: row.id,
                profile_id: row.profile_id,
                member_profile_id: row.profile_id,
                display_name: row.display_name,
                email: null,
              })),
            error: null,
          };
        },
        from: (table: string) => {
          if (table !== "funds") throw new Error(table);
          const filters: Array<(row: (typeof funds)[number]) => boolean> = [];
          const chain = {
            select: () => chain,
            is: (column: string, value: null) => {
              filters.push((row) => row[column as "system_purpose"] === value);
              return chain;
            },
            eq: (column: string, value: string) => {
              filters.push((row) => row[column as "id"] === value);
              return chain;
            },
            maybeSingle: async () => ({
              data:
                funds.find((row) => filters.every((filter) => filter(row))) ??
                null,
              error: null,
            }),
          };
          return chain;
        },
      };
    },
  ),
}));

type Rule = (
  args: Record<string, unknown>,
) => Promise<Array<{ path: string; message: string }>>;
let pageFamilyRule: Rule;

beforeAll(async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  ({ pageFamilyRule } =
    (await import("../../../apps/admin/src/cms/tenancy/page-rules")) as unknown as {
      pageFamilyRule: Rule;
    });
});

const actor = {
  id: USER,
  collection: "principal-links",
  tenantId: TENANT,
  assignmentId: "00000000-0000-4000-8000-000000000201",
  staffRole: "development",
  isTenantAdmin: false,
};

function judge(
  merged: Record<string, unknown>,
  {
    user = actor as Record<string, unknown> | null,
    cookie = "sb-token=1",
  } = {},
) {
  return pageFamilyRule({
    req: { user, headers: new Headers(cookie ? { cookie } : {}), context: {} },
    operation: "create",
    data: merged,
    merged,
    originalDoc: undefined,
    tenant: TENANT,
    asActor: user !== null,
  });
}

const paths = async (refusals: Promise<Array<{ path: string }>>) =>
  (await refusals).map((item) => item.path);

describe("test 6: each page family's rule, checked on the caller's own session", () => {
  it.each([
    [
      "standard with a missionary",
      { family: "standard", missionaryId: MISSIONARY },
      ["missionaryId"],
    ],
    ["standard with a fund", { family: "standard", fundId: FUND }, ["fundId"]],
    [
      "missionary without a missionary",
      { family: "missionary" },
      ["missionaryId"],
    ],
    [
      "missionary with a fund",
      { family: "missionary", missionaryId: MISSIONARY, fundId: FUND },
      ["fundId"],
    ],
    ["project without a fund", { family: "project" }, ["fundId"]],
    [
      "project with a missionary",
      { family: "project", fundId: FUND, missionaryId: MISSIONARY },
      ["missionaryId"],
    ],
    [
      "a reference that is not a UUID",
      { family: "missionary", missionaryId: "not-a-uuid" },
      ["missionaryId"],
    ],
  ])("refuses %s", async (_label, merged, expected) => {
    expect(await paths(judge(merged))).toEqual(expected);
  });

  it("keeps a standard page with neither reference", async () => {
    expect(await judge({ family: "standard" })).toEqual([]);
  });

  it("keeps the organization's own missionary and fund, read with both scope headers", async () => {
    expect(
      await judge({ family: "missionary", missionaryId: MISSIONARY }),
    ).toEqual([]);
    expect(state.headers).toEqual({
      "x-asym-tenant": TENANT,
      "x-asym-assignment": actor.assignmentId,
    });
    expect(await judge({ family: "project", fundId: FUND })).toEqual([]);
  });

  it.each([
    [
      "another organization's missionary",
      { family: "missionary", missionaryId: FOREIGN_MISSIONARY },
      "missionaryId",
    ],
    [
      "another organization's fund",
      { family: "project", fundId: FOREIGN_FUND },
      "fundId",
    ],
    [
      "a fund with system_purpose set",
      { family: "project", fundId: SYSTEM_FUND },
      "fundId",
    ],
  ])("refuses %s", async (_label, merged, path) => {
    expect(await paths(judge(merged))).toEqual([path]);
  });

  it("refuses every check with no session: no cookie, no Supabase session, or no actor (the E2E bypass and the service port)", async () => {
    const missionary = { family: "missionary", missionaryId: MISSIONARY };
    expect(await paths(judge(missionary, { cookie: "" }))).toEqual([
      "missionaryId",
    ]);
    state.session = false;
    try {
      expect(await paths(judge(missionary))).toEqual(["missionaryId"]);
    } finally {
      state.session = true;
    }
    expect(
      await paths(judge({ family: "project", fundId: FUND }, { user: null })),
    ).toEqual(["fundId"]);
  });
});
