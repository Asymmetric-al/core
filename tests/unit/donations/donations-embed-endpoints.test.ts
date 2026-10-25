/**
 * #2269 (U): the five donations reads through a real supabase-js client whose
 * fetch is a PostgREST-shaped stub. Covers what runs in every unit job: the
 * select each site sends, the OQ1 donor mapping (profiled and guest), the
 * no-row paths, the success read-backs and the double-gift guard (a failed
 * read-back after the gift exists). The other injected error paths live in
 * the Acceptance (P) suite.
 */
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "../../../packages/api/src/donations";
import { DONATION_WITH_PARTIES_SELECT } from "../../../packages/api/src/donations/select";
import { createGraphQLHandler } from "../../../packages/graphql/handler";

import type * as AuthModule from "../../../packages/auth/context";
import type { AuthContext } from "../../../packages/auth/context";

type Row = Record<string, unknown>;
const s = vi.hoisted(() => ({
  auth: null as unknown,
  tables: new Map<string, Row[]>(),
  requests: [] as URL[],
  methods: [] as string[],
  /** Makes every donations request fail with develop's real PGRST200 body. */
  failDonations: false,
  intake: vi.fn(() => ({
    donationId: "gift-1",
    outboxId: "outbox-1",
    replayed: false,
  })),
  saga: vi.fn(() => ({ status: "completed" })),
}));

vi.mock("@asym/auth/context", async (orig) => ({
  ...(await orig<typeof AuthModule>()),
  getAuthContext: async () => s.auth,
}));
vi.mock("@asym/database/supabase/admin", () => {
  /** Serves `s.tables` by path; an object Accept header means `.single()`. */
  const fetchStub = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    s.requests.push(url);
    s.methods.push(init?.method ?? "GET");
    if (s.failDonations && url.pathname.endsWith("/donations")) {
      const message =
        "Could not find a relationship between 'donations' and 'profiles' in the schema cache";
      return Response.json(
        { code: "PGRST200", message, details: null },
        { status: 400 },
      );
    }
    const rows = s.tables.get(url.pathname.split("/").pop()!) ?? [];
    const accept = new Headers(init?.headers).get("accept") ?? "";
    const one = accept.includes("vnd.pgrst.object");
    if (one && rows.length !== 1) {
      return Response.json(
        { code: "PGRST116", message: "not one row", details: null },
        { status: 406 },
      );
    }
    return Response.json(one ? rows[0] : rows);
  };
  const client = createClient("http://postgrest.test", "service-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: fetchStub },
  });
  return { getAdminClient: () => ({ client, error: null }) };
});
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
vi.mock("../../../packages/api/src/stripe/tenant-client", () => ({
  resolveTenantStripe: async () => ({ ok: true, stripe: {} }),
}));
vi.mock("../../../packages/api/src/donate/saga", () => ({
  processDonationSagaOutboxEvent: async () => s.saga(),
}));
vi.mock("../../../packages/api/src/donate/begin-gift-intake", () => ({
  beginGiftIntake: async () => ({ ok: true, ...s.intake() }),
}));
vi.mock("../../../packages/graphql/gift-intake", () => ({
  beginGraphQLGiftIntake: async () => s.intake(),
}));

const T = "tenant-a";
const date = "2026-10-24T00:00:00.000Z";
const profile = (id: string, role: string) => ({
  id,
  tenant_id: T,
  user_id: id,
  role,
  first_name: "Ada",
  last_name: "Example",
  email: `${id}@example.invalid`,
  avatar_url: null,
  created_at: date,
  updated_at: date,
});
const missionary = {
  id: "missionary-1",
  tenant_id: T,
  profile: profile("profile-m", "missionary"),
  created_at: date,
  updated_at: date,
};
const donation = (id: string, donor: Row) => ({
  id,
  tenant_id: T,
  donor_id: donor.id,
  missionary_id: missionary.id,
  amount: 2500,
  currency: "usd",
  status: "completed",
  created_at: date,
  donor,
  missionary,
});
const profiled = { id: "donor-1", profile: profile("profile-d", "donor") };
const guest = { id: "donor-2", profile: null };
const otherDonor = { id: "donor-9", profile: profile("profile-x", "donor") };

const as = (profileId: string, role: string): AuthContext => ({
  userId: profileId,
  email: null,
  tenantId: T,
  role: role as AuthContext["role"],
  profileRole: role as AuthContext["profileRole"],
  memberships: [],
  profileId,
  isAuthenticated: true,
});
type Gql = {
  data?: Record<string, unknown> | null;
  errors?: Array<{ message: string; extensions?: Row }>;
};
async function gql(query: string): Promise<Gql> {
  const res = await createGraphQLHandler().POST(
    new Request("http://localhost/api/graphql", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "k-1" },
      body: JSON.stringify({ query }),
    }),
  );
  return (await res.json()) as Gql;
}
const rest = (method: "GET" | "POST", body?: object) =>
  new NextRequest("http://localhost/api/donations", {
    method,
    headers: { "content-type": "application/json", "idempotency-key": "k-1" },
    body: body && JSON.stringify(body),
  });
/** The donations request: its select must be the shared constant, tenant-scoped. */
function donationsRequest() {
  const req = s.requests.find((u) => u.pathname.endsWith("/donations"));
  // supabase-js strips whitespace from the select before sending it.
  expect(req?.searchParams.get("select")).toBe(
    DONATION_WITH_PARTIES_SELECT.replace(/\s+/g, ""),
  );
  return req!;
}
const FIELDS = "id amount donor { id email } missionary { id profile { id } }";
const mappedMissionary = { id: missionary.id, profile: { id: "profile-m" } };

beforeEach(() => {
  s.tables.clear();
  s.requests.length = 0;
  s.methods.length = 0;
  s.failDonations = false;
});
/** One intake, no write besides it, and the PostgREST error text never sent. */
function expectSingleGift(body: string) {
  expect(s.intake).toHaveBeenCalledTimes(1);
  expect(s.methods.every((m) => m === "GET")).toBe(true);
  expect(body).not.toMatch(/PGRST|relationship|schema cache/i);
}

describe("#2269 GraphQL donations reads (U)", () => {
  it("myDonations maps a profiled donor and returns null donor for a guest (C2)", async () => {
    s.auth = as("profile-d", "donor");
    s.tables.set("donors", [{ id: profiled.id }]);
    s.tables.set("donations", [
      donation("g1", profiled),
      donation("g2", guest),
    ]);
    const r = await gql(`{ myDonations { ${FIELDS} } }`);
    expect(r.errors).toBeUndefined();
    expect(r.data?.myDonations).toEqual([
      {
        id: "g1",
        amount: 2500,
        donor: { id: "profile-d", email: "profile-d@example.invalid" },
        missionary: mappedMissionary,
      },
      { id: "g2", amount: 2500, donor: null, missionary: mappedMissionary },
    ]);
    const req = donationsRequest();
    expect(req.searchParams.get("donor_id")).toBe(`eq.${profiled.id}`);
    expect(req.searchParams.get("tenant_id")).toBe(`eq.${T}`);
  });

  it("mySupporters returns the missionary's donations, tenant-scoped (C4)", async () => {
    s.auth = as("profile-m", "missionary");
    s.tables.set("missionaries", [{ id: missionary.id }]);
    s.tables.set("donations", [donation("g2", guest)]);
    const r = await gql(`{ mySupporters { ${FIELDS} } }`);
    expect(r.errors).toBeUndefined();
    expect(r.data?.mySupporters).toEqual([
      { id: "g2", amount: 2500, donor: null, missionary: mappedMissionary },
    ]);
    const req = donationsRequest();
    expect(req.searchParams.get("missionary_id")).toBe(`eq.${missionary.id}`);
    expect(req.searchParams.get("tenant_id")).toBe(`eq.${T}`);
  });

  it.each([
    ["myDonations", "profile-d", "donor"],
    ["mySupporters", "profile-m", "missionary"],
  ] as const)(
    "%s with no lookup row returns [] without querying donations (C4)",
    async (field, who, role) => {
      s.auth = as(who, role);
      const r = await gql(`{ ${field} { id } }`);
      expect(r).toEqual({ data: { [field]: [] } });
      expect(s.requests.some((u) => u.pathname.endsWith("/donations"))).toBe(
        false,
      );
    },
  );

  it("mySupporters errors when the profile has several missionary rows (OQ6)", async () => {
    s.auth = as("profile-m", "missionary");
    s.tables.set("missionaries", [{ id: "m-1" }, { id: "m-2" }]);
    const r = await gql(`{ mySupporters { id } }`);
    expect(r.data).toBeNull();
    expect(r.errors?.[0]?.extensions?.code).toBe("DONATIONS_QUERY_FAILED");
  });

  it("createDonation returns the read-back donation with its donor (C6)", async () => {
    s.auth = as("profile-d", "donor");
    s.tables.set("donations", [donation("gift-1", profiled)]);
    const r = await gql(
      `mutation { createDonation(input: { missionaryId: "${missionary.id}", amount: 2500, currency: "USD" }) { ${FIELDS} } }`,
    );
    expect(r.errors).toBeUndefined();
    expect(r.data?.createDonation).toEqual({
      id: "gift-1",
      amount: 2500,
      donor: { id: "profile-d", email: "profile-d@example.invalid" },
      missionary: mappedMissionary,
    });
    expect(donationsRequest().searchParams.get("id")).toBe("eq.gift-1");
  });

  it("createDonation with a failed read-back raises DONATION_READBACK_FAILED with the donationId (T1)", async () => {
    [s.auth, s.failDonations] = [as("profile-d", "donor"), true];
    const r = await gql(
      `mutation { createDonation(input: { missionaryId: "${missionary.id}", amount: 2500 }) { id } }`,
    );
    expect(r.data).toBeNull();
    expect(r.errors).toEqual([
      expect.objectContaining({
        message: "Donation was created but could not be read back",
        extensions: { code: "DONATION_READBACK_FAILED", donationId: "gift-1" },
      }),
    ]);
    expectSingleGift(JSON.stringify(r));
    expect(s.saga).not.toHaveBeenCalled();
  });
});

describe("#2269 REST /api/donations (U)", () => {
  it("GET returns the nested donor shape for the donor's donations (C7)", async () => {
    s.auth = as("profile-d", "donor");
    s.tables.set("donors", [{ id: profiled.id }]);
    s.tables.set("donations", [donation("g1", profiled)]);
    const res = await GET(rest("GET"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      donations: [donation("g1", profiled)],
    });
    expect(donationsRequest().searchParams.get("tenant_id")).toBe(`eq.${T}`);
  });

  it("GET returns { donations: [] } when the profile has no donor row", async () => {
    s.auth = as("profile-d", "donor");
    const res = await GET(rest("GET"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ donations: [] });
  });

  it("POST returns 201 { donation, donationId } when the read-back succeeds (C5)", async () => {
    s.auth = as("profile-d", "donor");
    s.tables.set("donations", [donation("gift-1", profiled)]);
    const res = await POST(
      rest("POST", {
        missionaryId: missionary.id,
        amount: 2500,
        currency: " USD ",
      }),
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      donation: donation("gift-1", profiled),
      donationId: "gift-1",
    });
    expect(donationsRequest().searchParams.get("id")).toBe("eq.gift-1");
  });

  it('POST with a failed read-back after the saga still answers 201 { donation: null, donationId, readBack: "failed" } (T1)', async () => {
    [s.auth, s.failDonations] = [as("profile-d", "donor"), true];
    const res = await POST(
      rest("POST", { missionaryId: missionary.id, amount: 2500 }),
    );
    const body = await res.text();
    expect(res.status).toBe(201);
    expect(JSON.parse(body)).toEqual({
      donation: null,
      donationId: "gift-1",
      readBack: "failed",
    });
    expectSingleGift(body);
    expect(s.saga).toHaveBeenCalledTimes(1);
  });
});

describe("#2269 C8: a replayed key whose gift is not the caller's request (U)", () => {
  it.each([
    ["REST POST", "another donor's gift", otherDonor, 2500],
    ["REST POST", "a different amount", profiled, 99],
    ["GraphQL createDonation", "another donor's gift", otherDonor, 2500],
    ["GraphQL createDonation", "a different amount", profiled, 99],
  ] as const)(
    "%s with %s answers IDEMPOTENCY_KEY_REUSED and none of the gift's data",
    async (via, _case, donor, amount) => {
      s.auth = as("profile-d", "donor");
      s.tables.set("donations", [donation("gift-1", donor)]);
      let body: string;
      if (via === "REST POST") {
        const res = await POST(
          rest("POST", { missionaryId: missionary.id, amount }),
        );
        body = await res.text();
        expect([res.status, JSON.parse(body)]).toEqual([
          409,
          { error: "Idempotency key already used" },
        ]);
      } else {
        const r = await gql(
          `mutation { createDonation(input: { missionaryId: "${missionary.id}", amount: ${amount} }) { id } }`,
        );
        body = JSON.stringify(r);
        expect(r.data).toBeNull();
        expect(r.errors).toEqual([
          expect.objectContaining({
            message: "Idempotency key already used",
            extensions: { code: "IDEMPOTENCY_KEY_REUSED" },
          }),
        ]);
      }
      expect(body).not.toMatch(/gift-1|donor-|profile-|@example/);
      expect(donationsRequest().searchParams.get("tenant_id")).toBe(`eq.${T}`);
    },
  );
});
