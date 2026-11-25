import { readFileSync } from "node:fs";

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const USER = "00000000-0000-4000-8000-0000000000a1";
const TENANT = "00000000-0000-0000-0000-000000000001";
const SEED_SITE = "ffbeafc8-f85f-a2c9-5493-d62f5003e3b8";
const OTHER_SITE = "5b53f899-8988-6455-fb3d-bb9fe896184c";
const MISSIONARY = "20000000-0000-0000-0000-000000000001";
const FUND = "21000000-0000-0000-0000-000000000001";

const supabase = vi.hoisted(() => ({
  session: true,
  rpc: [] as Array<{ fn: string; args: unknown }>,
  headers: {} as Record<string, string>,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(
    (
      _url: string,
      _key: string,
      options: { global?: { headers?: Record<string, string> } },
    ) => {
      supabase.headers = options.global?.headers ?? {};
      return {
        auth: {
          getSession: async () => ({
            data: { session: supabase.session ? { user: { id: USER } } : null },
          }),
        },
        rpc: async (
          fn: string,
          args: { p_tenant_id: string; p_ids: string[] },
        ) => {
          supabase.rpc.push({ fn, args });
          return {
            data:
              args.p_tenant_id === TENANT && args.p_ids.includes(MISSIONARY)
                ? [
                    {
                      id: MISSIONARY,
                      profile_id: "p1",
                      member_profile_id: "p1",
                      display_name: "Ana Field",
                      email: null,
                    },
                  ]
                : [],
            error: null,
          };
        },
        from: () => {
          const filters: Record<string, unknown> = {};
          const chain = {
            select: () => chain,
            is: (column: string, value: unknown) => {
              filters[`is:${column}`] = value;
              return chain;
            },
            eq: (column: string, value: unknown) => {
              filters[column] = value;
              return chain;
            },
            maybeSingle: async () => ({
              data:
                filters.id === FUND &&
                filters.tenant_id === TENANT &&
                filters["is:system_purpose"] === null
                  ? { id: FUND, name: "Clean Water", description: "Wells" }
                  : null,
              error: null,
            }),
          };
          return chain;
        },
      };
    },
  ),
}));

let handler: (req: unknown) => Promise<Response>;
let PAGE_STARTERS: Array<{ key: string; family: string }>;

beforeAll(async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  const module =
    await import("../../../apps/admin/src/cms/create-from-template-endpoint");
  handler = module.webStudioCreateFromTemplateEndpoint.handler as (
    req: unknown,
  ) => Promise<Response>;
  ({ PAGE_STARTERS } =
    (await import("../../../apps/admin/src/cms/starters")) as unknown as {
      PAGE_STARTERS: typeof PAGE_STARTERS;
    });
}, 60_000);

beforeEach(() => {
  supabase.session = true;
  supabase.rpc = [];
});

const actor = {
  id: USER,
  collection: "principal-links",
  tenantId: TENANT,
  assignmentId: "00000000-0000-4000-8000-000000000201",
  staffRole: "development",
  isTenantAdmin: false,
};

function makeReq({
  body,
  sites = [SEED_SITE],
  user = actor as Record<string, unknown> | null,
  contentType = "application/json",
}: {
  body: unknown;
  sites?: string[];
  user?: Record<string, unknown> | null;
  contentType?: string;
}) {
  const find = vi.fn(async (options: { collection: string }) => ({
    docs:
      options.collection === "site-presentations"
        ? sites.map((id) => ({ id, tenant: TENANT }))
        : [],
  }));
  const create = vi.fn(async (options: { data: Record<string, unknown> }) => ({
    id: "00000000-0000-4000-8000-00000000c0de",
    ...options.data,
  }));
  const req = Object.assign(
    new Request(
      "https://admin.test/web-studio/api/web-studio/create-from-template",
      {
        method: "POST",
        headers: { "content-type": contentType, cookie: "sb-token=1" },
        body: typeof body === "string" ? body : JSON.stringify(body),
      },
    ),
    { user, payload: { find, create }, context: {}, t: undefined },
  );
  return { req: req as never, find, create };
}

async function respond(options: Parameters<typeof makeReq>[0]) {
  const made = makeReq(options);
  const response = await handler(made.req);
  return {
    ...made,
    status: response.status,
    body: (await response.json()) as Record<string, unknown>,
  };
}

describe("test 10: starters in code and the create-from-template endpoint", () => {
  it("lists the starters from code, one per family, with no ministry-update starter", () => {
    expect(
      PAGE_STARTERS.map((starter) => [starter.key, starter.family]),
    ).toEqual([
      ["standard", "standard"],
      ["missionary-giving", "missionary"],
      ["project", "project"],
    ]);
    const gallery = readFileSync(
      "apps/admin/src/cms-ui/web-studio/flows/studio-templates.tsx",
      "utf8",
    );
    expect(gallery).toContain("cms/starters");
    expect(gallery).not.toMatch(/page-templates|PAGE_TEMPLATES_SLUG/);
  });

  it("creates a pages draft with family, Site and starter through the actor port", async () => {
    const { status, body, create } = await respond({
      body: {
        starterKey: "standard",
        site: SEED_SITE,
        title: "About us",
        slug: "About Us",
      },
    });
    expect(status).toBe(200);
    expect(body).toEqual({
      id: "00000000-0000-4000-8000-00000000c0de",
      collectionSlug: "pages",
    });
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0]?.[0]).toMatchObject({
      collection: "pages",
      draft: true,
      overrideAccess: false,
      data: {
        site: SEED_SITE,
        family: "standard",
        templateKey: "standard",
        title: "About us",
        slug: "about-us",
        legacyContentFallback: true,
      },
    });
    expect(create.mock.calls[0]?.[0]).not.toHaveProperty("data.tenant");
  });

  it("names a missionary page from crm_missionary_labels on the caller's own session", async () => {
    const { status, create } = await respond({
      body: {
        starterKey: "missionary-giving",
        site: SEED_SITE,
        missionaryId: MISSIONARY,
      },
    });
    expect(status).toBe(200);
    expect(supabase.rpc).toEqual([
      {
        fn: "crm_missionary_labels",
        args: { p_tenant_id: TENANT, p_ids: [MISSIONARY] },
      },
    ]);
    expect(supabase.headers).toEqual({
      "x-asym-tenant": TENANT,
      "x-asym-assignment": actor.assignmentId,
    });
    expect(create.mock.calls[0]?.[0]).toMatchObject({
      data: {
        family: "missionary",
        missionaryId: MISSIONARY,
        title: "Ana Field — Give",
      },
    });
  });

  it("names a project page from the fund, read without system funds", async () => {
    const { status, create } = await respond({
      body: { starterKey: "project", site: SEED_SITE, fundId: FUND },
    });
    expect(status).toBe(200);
    expect(create.mock.calls[0]?.[0]).toMatchObject({
      data: {
        family: "project",
        fundId: FUND,
        title: "Clean Water",
        summary: "Wells",
      },
    });
  });

  it("refuses in JSON when the organization has no presentation", async () => {
    const { status, body, create } = await respond({
      body: { starterKey: "standard", title: "x", slug: "x" },
      sites: [],
    });
    expect(status).toBe(409);
    expect(body.error).toMatch(/no Site/);
    expect(create).not.toHaveBeenCalled();
  });

  it("refuses a Site that is not one of the organization's presentations", async () => {
    const { status, create } = await respond({
      body: { starterKey: "standard", site: OTHER_SITE, title: "x", slug: "x" },
    });
    expect(status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });

  it("refuses a missionary page with no session, and a person who cannot edit", async () => {
    supabase.session = false;
    const noSession = await respond({
      body: {
        starterKey: "missionary-giving",
        site: SEED_SITE,
        missionaryId: MISSIONARY,
      },
    });
    expect(noSession.status).toBe(403);
    expect(noSession.create).not.toHaveBeenCalled();
    supabase.session = true;
    const viewer = await respond({
      body: { starterKey: "standard", site: SEED_SITE, title: "x", slug: "x" },
      user: { ...actor, staffRole: null },
    });
    expect(viewer.status).toBe(403);
  });

  it("accepts PostgreSQL UUIDs that are not RFC 4122 (seed Sites, missionaries and funds) in the request body (D-16 ruling)", async () => {
    for (const body of [
      { starterKey: "standard", site: SEED_SITE, title: "x", slug: "x" },
      {
        starterKey: "missionary-giving",
        site: SEED_SITE,
        missionaryId: MISSIONARY,
      },
      { starterKey: "project", site: SEED_SITE, fundId: FUND },
    ]) {
      expect((await respond({ body })).status).toBe(200);
    }
    expect(
      (
        await respond({
          body: {
            starterKey: "standard",
            site: "not-a-uuid",
            title: "x",
            slug: "x",
          },
        })
      ).status,
    ).toBe(400);
  });

  it("keeps its refusals: 415 for a body that is not JSON, 400 for a bad body, an unknown starter or an empty address", async () => {
    expect(
      (
        await respond({
          body: "starterKey=standard",
          contentType: "text/plain",
        })
      ).status,
    ).toBe(415);
    expect((await respond({ body: { title: "x" } })).status).toBe(400);
    expect(
      (await respond({ body: { starterKey: "nope", site: SEED_SITE } })).status,
    ).toBe(404);
    const empty = await respond({
      body: {
        starterKey: "standard",
        site: SEED_SITE,
        title: "x",
        slug: "!!!",
      },
    });
    expect(empty.status).toBe(400);
    expect(empty.body.fieldErrors).toEqual({
      slug: ["Enter an address with at least one letter or number."],
    });
  });
});
