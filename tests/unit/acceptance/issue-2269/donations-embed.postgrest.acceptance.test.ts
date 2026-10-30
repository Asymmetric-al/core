/**
 * #2269 (P) live-PostgREST acceptance, spec r1 criteria C4-C7 (comment
 * 6385584133, approved 6385601889; OQ3: no CI step, Acceptance runs this
 * before sign-off and pastes the output into the PR). The real handlers run
 * with a real supabase-js admin client against a live PostgREST; mocked only:
 * getAuthContext, resolveTenantStripe, processDonationSagaOutboxEvent
 * (`completed`) and beginGiftIntake / beginGraphQLGiftIntake, which really
 * insert a donation row. Skips unless all three env vars are set (every CI job),
 * except the A1-C8 block at the end, which needs no DB and always runs.
 *
 * Recipe (spec §0): PostgREST v14.18 static binary,
 *   postgrest-v14.18-linux-static-x86-64.tar.xz
 *   sha256 98de1c0be7787aea5f5e11a25f303ea0077634d6fc1000b687bfa825fd27d299
 * on a disposable PG17 with every migration + supabase/seed.sql, then these
 * hosted-Supabase-style grants (local test setup only, never a migration):
 *   grant usage on schema public to service_role;
 *   grant all on all tables in schema public to service_role;
 *   grant all on all sequences in schema public to service_role;
 *   grant execute on all functions in schema public to service_role;
 *   notify pgrst, 'reload schema';
 * PostgREST: db-schemas=public, db-anon-role=anon, a
 * throwaway jwt-secret and a locally minted HS256 {"role":"service_role"} JWT:
 *   DONATIONS_EMBED_IT_POSTGREST_URL=http://127.0.0.1:3000 \
 *   DONATIONS_EMBED_IT_SERVICE_JWT=<jwt> \
 *   DONATIONS_EMBED_IT_ADMIN_DATABASE_URL=postgresql://postgres@127.0.0.1/<db> \
 *     bun x vitest run donations-embed.postgrest
 * Fixture rows use random ids and are deleted afterwards.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import pg from "pg";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { GET, POST } from "../../../../packages/api/src/donations";
import { createGraphQLHandler } from "../../../../packages/graphql/handler";

import type { AuthContext } from "../../../../packages/auth/context";
import type * as AuthModule from "../../../../packages/auth/context";

const URL_ = process.env.DONATIONS_EMBED_IT_POSTGREST_URL ?? "";
const JWT = process.env.DONATIONS_EMBED_IT_SERVICE_JWT ?? "";
const DB_URL = process.env.DONATIONS_EMBED_IT_ADMIN_DATABASE_URL ?? "";
const LIVE = Boolean(URL_ && JWT && DB_URL);
const u = (): string => randomUUID();
const [TA, PD, PM, PM2, MI, MI2, DN1, DN2, G1, G2] = [
  u(),
  u(),
  u(),
  u(),
  u(),
  u(),
  u(),
  u(),
  u(),
  u(),
];

const PGRST200 = {
  code: "PGRST200",
  details:
    "Searched for a foreign key relationship between 'donations' and 'profiles' using the hint 'donor_id' in the schema 'public', but no matches were found.",
  hint: null,
  message:
    "Could not find a relationship between 'donations' and 'profiles' in the schema cache",
};
const s = vi.hoisted(() => ({
  auth: null as unknown,
  db: null as unknown as pg.Client,
  /** Fault injection: a request whose URL matches gets develop's real PGRST200 body. */
  fail: null as RegExp | null,
  /** A1-C8: in-memory PostgREST (no DB) and the donation id a replayed key returns. */
  fake: null as ((url: string, init?: RequestInit) => Response) | null,
  replay: null as string | null | undefined,
  /** A1-C8b: the saga result, saga calls and PostgREST writes; a fresh (not replayed) key. */
  saga: null as Record<string, unknown> | null,
  sagaRuns: 0,
  writes: 0,
  fresh: false,
}));
vi.mock("@asym/auth/context", async (orig) => ({
  ...(await orig<typeof AuthModule>()),
  getAuthContext: async () => s.auth,
}));
vi.mock("@asym/database/supabase/admin", () => {
  const base = "http://postgrest.invalid";
  let client: ReturnType<typeof createClient> | undefined;
  const getAdminClient = () => {
    client ??= createClient(base, JWT || "no-db", {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: async (input, init) =>
          s.fake?.(String(input), init) ??
          (s.fail?.test(String(input))
            ? new Response(JSON.stringify(PGRST200), {
                status: 400,
                headers: { "content-type": "application/json" },
              })
            : fetch(String(input).replace(`${base}/rest/v1`, URL_), init)),
      },
    });
    return { client, error: null };
  };
  return { getAdminClient };
});
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
vi.mock("../../../../packages/api/src/stripe/tenant-client", () => ({
  resolveTenantStripe: async () => ({ ok: true, stripe: {} }),
}));
vi.mock("../../../../packages/api/src/donate/saga", () => ({
  processDonationSagaOutboxEvent: async () => (
    s.sagaRuns++,
    s.saga ?? { status: "completed" }
  ),
}));
/** Really inserts the donation (from the profiled donor DN1) and returns its id. */
async function insertGift(input: {
  missionaryId: string;
  amountCents: number;
}) {
  const { rows } = await s.db.query<{ id: string }>(
    "insert into public.donations (tenant_id, donor_id, missionary_id, amount, status) values ($1, $2, $3, $4, 'completed') returning id",
    [TA, DN1, input.missionaryId, input.amountCents],
  );
  return { donationId: rows[0]!.id, outboxId: randomUUID(), replayed: false };
}
vi.mock("../../../../packages/api/src/donate/begin-gift-intake", () => ({
  beginGiftIntake: async (i: {
    missionaryId: string;
    amountCents: number;
  }) => ({
    ok: true,
    ...(await replayOr(i)),
  }),
}));
vi.mock("../../../../packages/graphql/gift-intake", () => ({
  beginGraphQLGiftIntake: (i: { missionaryId: string; amountCents: number }) =>
    replayOr(i),
}));
const replayOr = async (i: { missionaryId: string; amountCents: number }) =>
  s.replay
    ? { donationId: s.replay, outboxId: randomUUID(), replayed: !s.fresh }
    : insertGift(i);

const as = (profileId: string, role: string): AuthContext =>
  ({
    userId: profileId,
    email: null,
    tenantId: TA,
    role,
    profileRole: role,
    memberships: [],
    profileId,
    isAuthenticated: true,
  }) as AuthContext;
const count = async () =>
  Number(
    (
      await s.db.query(
        "select count(*) n from public.donations where tenant_id = $1",
        [TA],
      )
    ).rows[0].n,
  );
type Gql = {
  data?: Record<
    string,
    Array<Record<string, unknown>> | Record<string, unknown> | null
  > | null;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
};
async function gql(query: string): Promise<Gql> {
  const res = await createGraphQLHandler().POST(
    new Request("http://localhost/api/graphql", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": randomUUID(),
      },
      body: JSON.stringify({ query }),
    }),
  );
  return (await res.json()) as Gql;
}
const rest = (method: "GET" | "POST", body?: object) =>
  new NextRequest("http://localhost/api/donations", {
    method,
    headers: {
      "content-type": "application/json",
      "idempotency-key": randomUUID(),
    },
    body: body && JSON.stringify(body),
  });
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO(#2269): REST returns raw PostgREST rows with no declared contract (OQ2)
type Row = Record<string, any>;
const FIELDS = "id donor { id } missionary { id profile { id } }";

describe.skipIf(!LIVE)("#2269 live PostgREST (P)", () => {
  beforeAll(async () => {
    s.db = new pg.Client({ connectionString: DB_URL });
    await s.db.connect();
    const v = [TA, PD, PM, PM2, MI, MI2, DN1, DN2, G1, G2];
    await s.db.query(
      `insert into public.tenants (id, name, slug) values ($1, 'acc2269 P', 'acc2269-p-' || $1);
       insert into auth.users (id) values ($2), ($3), ($4);
       insert into public.profiles (id, tenant_id, role) values ($2, $1, 'donor'), ($3, $1, 'missionary'), ($4, $1, 'missionary')
         on conflict (id) do update set tenant_id = excluded.tenant_id, role = excluded.role;
       insert into public.missionaries (id, tenant_id, profile_id) values ($5, $1, $3), ($6, $1, $4);
       insert into public.donors (id, tenant_id, profile_id) values ($7, $1, $2), ($8, $1, null);
       insert into public.donations (id, tenant_id, donor_id, missionary_id, amount) values ($9, $1, $7, $5, 1000), ($10, $1, $8, $5, 2000);`.replace(
        /\$(\d+)/g,
        (_m, i: string) => `'${v[Number(i) - 1]}'`,
      ),
    );
  });
  afterAll(async () => {
    await s.db.query(
      `delete from public.donations where tenant_id = $1; delete from public.donors where tenant_id = $1;
       delete from public.missionaries where tenant_id = $1; delete from auth.users where id in ($2, $3, $4);
       delete from public.profiles where id in ($2, $3, $4); delete from public.tenants where id = $1;`.replace(
        /\$(\d+)/g,
        (_m, i: string) => `'${[TA, PD, PM, PM2][Number(i) - 1]}'`,
      ),
    );
    await s.db.end();
  });

  afterEach(() => {
    s.fail = null;
  });

  it("C7 (P): REST GET /api/donations → 200, non-empty, nested donor.profile", async () => {
    s.auth = as(PD, "donor");
    const res = await GET(rest("GET"));
    const body = (await res.json()) as { donations?: Row[] };
    expect(res.status, JSON.stringify(body)).toBe(200);
    expect(body.donations!.map((d) => d.id)).toEqual([G1]);
    expect(body.donations![0]!.donor).toMatchObject({
      id: DN1,
      profile: { id: PD },
    });
    expect(body.donations![0]!.missionary.profile.id).toBe(PM);
  });

  it("C4 (P): GraphQL myDonations → the donor's rows with donor.id = profile, no errors", async () => {
    s.auth = as(PD, "donor");
    const r = await gql(`{ myDonations { ${FIELDS} } }`);
    expect(r.errors, JSON.stringify(r.errors)).toBeUndefined();
    expect(r.data!.myDonations).toEqual([
      {
        id: G1,
        donor: { id: PD },
        missionary: { id: MI, profile: { id: PM } },
      },
    ]);
  });

  it("C4/C2 (P): GraphQL mySupporters → 2 rows, the guest's donor is null, no errors", async () => {
    s.auth = as(PM, "missionary");
    const r = await gql(`{ mySupporters { ${FIELDS} } }`);
    expect(r.errors, JSON.stringify(r.errors)).toBeUndefined();
    const m = { id: MI, profile: { id: PM } };
    expect(r.data!.mySupporters).toEqual(
      expect.arrayContaining([
        { id: G1, donor: { id: PD }, missionary: m },
        { id: G2, donor: null, missionary: m },
      ]),
    );
    expect(r.data!.mySupporters).toHaveLength(2);
  });

  it("C5 (P): REST POST /api/donations → 201 { donation, donationId } with donor.profile, exactly +1 row", async () => {
    s.auth = as(PD, "donor");
    const before = await count();
    const res = await POST(
      rest("POST", { missionaryId: MI2, amount: 2500, currency: "usd" }),
    );
    const body = (await res.json()) as Row;
    expect(await count()).toBe(before + 1);
    expect(res.status, JSON.stringify(body)).toBe(201);
    expect(body.donationId).toEqual(expect.any(String));
    expect(body.donation).toMatchObject({
      id: body.donationId,
      amount: 2500,
      donor: { id: DN1, profile: { id: PD } },
      missionary: { id: MI2, profile: { id: PM2 } },
    });
  });

  it("C6 (P): GraphQL createDonation → the created id, donor mapped, no errors, exactly +1 row", async () => {
    s.auth = as(PD, "donor");
    const before = await count();
    const r = await gql(
      `mutation { createDonation(input: { missionaryId: "${MI2}", amount: 3100 }) { ${FIELDS} amount } }`,
    );
    expect(await count()).toBe(before + 1);
    expect(r.errors, JSON.stringify(r.errors)).toBeUndefined();
    const created = r.data!.createDonation as Record<string, unknown>;
    const { rows } = await s.db.query(
      "select id from public.donations where tenant_id = $1 and missionary_id = $2 and amount = 3100",
      [TA, MI2],
    );
    expect(created).toEqual({
      id: rows[0].id,
      amount: 3100,
      donor: { id: PD },
      missionary: { id: MI2, profile: { id: PM2 } },
    });
  });
  it.each([
    ["donations query", /\/donations\?/],
    ["donor lookup", /\/donors\?/],
  ])(
    "C7 (P, injected): REST GET with a failing %s → 500, no PostgREST text",
    async (what, re) => {
      [s.auth, s.fail] = [as(PD, "donor"), re];
      const res = await GET(rest("GET"));
      const text = await res.text();
      expect(res.status, text).toBe(500);
      expect(text).not.toMatch(/PGRST|relationship|schema cache/i);
      if (what === "donations query")
        expect(JSON.parse(text)).toEqual({ error: "Failed to load donations" });
    },
  );

  it.each([
    [
      "myDonations",
      "donations query",
      PD,
      "donor",
      /\/donations\?/,
      "DONATIONS_QUERY_FAILED",
    ],
    [
      "mySupporters",
      "donations query",
      PM,
      "missionary",
      /\/donations\?/,
      "DONATIONS_QUERY_FAILED",
    ],
    ["myDonations", "donor lookup", PD, "donor", /\/donors\?/, undefined],
    [
      "mySupporters",
      "missionary lookup",
      PM,
      "missionary",
      /\/missionaries\?/,
      undefined,
    ],
  ] as const)(
    "C4 (P, injected): GraphQL %s with a failing %s request → error, not []",
    async (field, _what, who, role, re, code) => {
      [s.auth, s.fail] = [as(who, role), re];
      const r = await gql(`{ ${field} { id } }`);
      expect(r.data?.[field] ?? null).toBeNull();
      expect(r.errors, JSON.stringify(r)).toHaveLength(1);
      if (code) expect(r.errors![0]!.extensions?.code).toBe(code);
    },
  );

  it('C5 (P, injected): REST POST with a failing read-back → 201 { donation: null, donationId, readBack: "failed" }, +1 row', async () => {
    [s.auth, s.fail] = [as(PD, "donor"), /\/donations\?/];
    const before = await count();
    const res = await POST(rest("POST", { missionaryId: MI2, amount: 2700 }));
    const body = (await res.json()) as Row;
    expect(await count()).toBe(before + 1);
    expect(res.status, JSON.stringify(body)).toBe(201);
    const { rows } = await s.db.query(
      "select id from public.donations where tenant_id = $1 and amount = 2700",
      [TA],
    );
    expect(body).toEqual({
      donation: null,
      donationId: rows[0].id,
      readBack: "failed",
    });
  });

  it("C6 (P, injected): GraphQL createDonation with a failing read-back → DONATION_READBACK_FAILED with donationId, +1 row", async () => {
    [s.auth, s.fail] = [as(PD, "donor"), /\/donations\?/];
    const before = await count();
    const r = await gql(
      `mutation { createDonation(input: { missionaryId: "${MI2}", amount: 2900 }) { id } }`,
    );
    expect(await count()).toBe(before + 1);
    const { rows } = await s.db.query(
      "select id from public.donations where tenant_id = $1 and amount = 2900",
      [TA],
    );
    expect(r.errors?.[0]?.message).not.toBe("Unexpected error.");
    expect(r.errors?.[0]?.extensions).toMatchObject({
      code: "DONATION_READBACK_FAILED",
      donationId: rows[0].id,
    });
  });
});

// A1-C8 (final C8 ruling, issue comment 6391426341): a replayed idempotency key
// resolves to a donation that is not the caller's gift as requested. Runs in CI
// with no DB: an in-memory PostgREST applies the request's eq. filters to ROWS.
const [V1, V2, PV, DNV, TB, DNX] = Array.from({ length: 6 }, u);
const ROWS: Row[] = [
  [V1, TA, DNV, PV, "victim@example.test"],
  [V2, TB, DNX, PD, "tenantb@example.test"],
  [G1, TA, DN1, PD, "caller@example.test"],
  [G2, TA, DN1, PD, "caller@example.test", MI2],
].map(([id, tenant_id, did, pid, email, fund]) => ({
  id,
  tenant_id,
  missionary_id: MI,
  fund_id: fund ?? null,
  amount: 2500,
  currency: "usd",
  donor: { id: did, profile: { id: pid, tenant_id, email } },
}));
function fakePostgrest(url: string, init?: RequestInit) {
  if (!/^(GET|HEAD)?$/.test(init?.method ?? "")) s.writes++;
  const q = new URL(url).searchParams;
  const rows = ROWS.filter((r) =>
    [...q].every(
      ([k, v]) => !v.startsWith("eq.") || String(r[k]) === v.slice(3),
    ),
  );
  const one = new Headers(init?.headers)
    .get("accept")
    ?.includes("pgrst.object");
  if (one && rows.length !== 1)
    return Response.json(
      { code: "PGRST116", message: "0 rows" },
      { status: 406 },
    );
  return Response.json(one ? rows[0] : rows);
}
const VICTIM = [V1, PV, DNV, "victim@"];
const REQ = { missionaryId: MI, amount: 2500, currency: "usd" };
/** [case, replayed donation id, request overrides]: each is a C8 mismatch. */
const MISMATCH = [
  ["another donor in the tenant", V1, {}],
  ["the caller's gift with another amount", G1, { amount: 99 }],
  ["the caller's gift with another currency", G1, { currency: "eur" }],
  ["the caller's gift with another missionary", G1, { missionaryId: MI2 }],
  ["the caller's gift to a fund (A1-C8b NIT 3)", G2, {}],
] as const;
const gqlCreate = (
  req: typeof REQ,
  fields = "id tenantId amount donor { id email }",
) =>
  gql(
    `mutation { createDonation(input: { missionaryId: "${req.missionaryId}", amount: ${req.amount}, currency: "${req.currency}" }) { ${fields} } }`,
  );

describe("A1-C8 replayed idempotency key (in-memory PostgREST, no DB)", () => {
  beforeEach(() =>
    Object.assign(s, { auth: as(PD, "donor"), fake: fakePostgrest }),
  );
  afterEach(() =>
    Object.assign(s, {
      fake: null,
      replay: null,
      saga: null,
      sagaRuns: 0,
      writes: 0,
      fresh: false,
    }),
  );

  it.each(MISMATCH)(
    'A1-C8: REST POST replay resolving to %s → 409 exactly {error:"Idempotency key already used"}',
    async (_n, id, over) => {
      s.replay = id;
      const res = await POST(rest("POST", { ...REQ, ...over }));
      const body: unknown = await res.json();
      expect(res.status, JSON.stringify(body)).toBe(409);
      expect(body).toEqual({ error: "Idempotency key already used" });
    },
  );

  it.each(MISMATCH)(
    "A1-C8: GraphQL createDonation replay resolving to %s → data null, unmasked IDEMPOTENCY_KEY_REUSED, nothing leaked",
    async (_n, id, over) => {
      s.replay = id;
      const r = await gqlCreate({ ...REQ, ...over });
      expect(r.data ?? null, JSON.stringify(r)).toBeNull();
      expect(r.errors).toHaveLength(1);
      expect(r.errors![0]!.message).not.toBe("Unexpected error.");
      expect(r.errors![0]!.extensions?.code).toBe("IDEMPOTENCY_KEY_REUSED");
      for (const leak of [id, ...VICTIM])
        expect(JSON.stringify(r)).not.toContain(leak);
    },
  );

  it("A1-C8: replay resolving to another tenant's donation → no row data from that tenant (REST and GraphQL)", async () => {
    s.replay = V2;
    const res = await POST(rest("POST", REQ));
    const r = await gqlCreate(REQ);
    const body = (await res.json()) as Row;
    expect(body.donation ?? null).toBeNull();
    expect(r.data ?? null).toBeNull();
    for (const leak of [TB, DNX, "tenantb@"])
      expect(JSON.stringify([body, r])).not.toContain(leak);
  });

  it("A1-C8 control: the caller's own replayed gift, as requested, still reads back (REST 201 + GraphQL data)", async () => {
    s.replay = G1;
    const res = await POST(rest("POST", REQ));
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({
      donationId: G1,
      donation: { id: G1 },
    });
    expect(await gqlCreate(REQ, "id donor { id }")).toEqual({
      data: { createDonation: { id: G1, donor: { id: PD } } },
    });
  });

  // A1-C8b (ruling 6391807123): a replay is checked before any saga work, and UUIDs match case-insensitively.
  it.each([
    [
      "processing",
      { status: "processing", error: "Donation is still processing" },
    ],
    [
      "dead_letter",
      { status: "dead_letter", error: "card_declined: do not honor" },
    ],
    ["not yet started", null],
  ] as const)(
    "A1-C8b: REST POST replay of another donor's key, saga %s → 409 with no saga output, saga never run",
    async (_n, saga) => {
      Object.assign(s, { replay: V1, saga });
      const res = await POST(rest("POST", REQ));
      expect(await res.json()).toEqual({
        error: "Idempotency key already used",
      });
      expect(res.status).toBe(409);
      expect({ sagaRuns: s.sagaRuns, writes: s.writes }).toEqual({
        sagaRuns: 0,
        writes: 0,
      });
    },
  );

  it.each([
    ["a fresh key", true],
    ["an own replay", false],
  ] as const)(
    "A1-C8b: uppercase missionary UUID (and currency) on %s matches the gift → REST 201 and GraphQL data, no 409 / IDEMPOTENCY_KEY_REUSED",
    async (_n, fresh) => {
      Object.assign(s, { replay: G1, fresh });
      const req = { ...REQ, missionaryId: MI.toUpperCase(), currency: "USD" };
      const res = await POST(rest("POST", req));
      expect(await res.json()).toMatchObject({
        donationId: G1,
        donation: { id: G1 },
      });
      expect(res.status).toBe(201);
      expect(await gqlCreate(req, "id")).toEqual({
        data: { createDonation: { id: G1 } },
      });
    },
  );

  // Fail closed (rulings 6391991201 item 3, C8c, C8d): an unconfirmed replay does no saga work and echoes no donationId.
  it.each([
    ["finds nothing (another tenant's gift)", V2, 0],
    ["errors", G1, 400],
  ] as const)(
    'A1-C8b/d: replay whose pre-saga read-back %s → REST 201 exactly {donation:null, readBack:"failed"}; GraphQL code-only DONATION_READBACK_FAILED (C8c); no saga, no writes',
    async (_n, id, err) => {
      s.replay = id;
      if (err)
        s.fake = (u, i) => (
          fakePostgrest(u, i),
          Response.json(PGRST200, { status: err })
        );
      const [res, r] = [await POST(rest("POST", REQ)), await gqlCreate(REQ)];
      const body = { donation: null, readBack: "failed" };
      expect([res.status, await res.json(), s.sagaRuns, s.writes]).toEqual([
        201,
        body,
        0,
        0,
      ]);
      const ext = [{ code: "DONATION_READBACK_FAILED" }];
      expect([r.data ?? null, r.errors?.map((e) => e.extensions)]).toEqual([
        null,
        ext,
      ]);
      expect(JSON.stringify(r)).not.toContain(id);
    },
  );
});
