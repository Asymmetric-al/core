import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  anon,
  database,
  required,
  service,
  url,
} from "./identity-keys.postgrest-fixture";
import { GET as getDonations } from "../../../../packages/api/src/donations";
import { GET as getPortal } from "../../../../packages/api/src/donor-portal";
import {
  getDonorPortalSnapshot,
  getOwnedStatementDonations,
  resolveDonorPortalContext,
} from "../../../../packages/api/src/donor-portal/service";
import { GET as getFeedPreferences } from "../../../../packages/api/src/feed-preferences";
import { resolveDonorId } from "../../../../packages/api/src/reads/donor-history";
import { findOwnDonor } from "../../../../packages/api/src/shared/queries";
import { createGraphQLHandler } from "../../../../packages/graphql/handler";
import { loadOwnDonorId } from "../../../../packages/lib/hooks/use-donor-record";
import { membershipsForRole } from "../../../fixtures/auth-memberships";

import type { AuthContext } from "../../../../packages/auth/context";
import type * as AuthModule from "../../../../packages/auth/context";

/**
 * AL-2678 (WP5 rest, pull request 1; brief section 3 invariant 7, section 4;
 * ruling Q1 (b)): every reader that found the signed-in person's donor by
 * donors.profile_id goes from the person and the selected organization
 * through their account link and its Party to that organization's donor:
 * the donor portal (snapshot, statements, GET), the donations route, the
 * donor-history read, the feed preferences, GraphQL myDonations, the browser
 * hook's query and the shared resolver they use. Real tokens, a real stack.
 */
const s = vi.hoisted(() => ({ auth: null as unknown }));
vi.mock("@asym/auth/context", async (orig) => ({
  ...(await orig<typeof AuthModule>()),
  getAuthContext: async () => s.auth,
}));
vi.mock("@asym/database/supabase/admin", () => {
  let client: ReturnType<typeof createClient> | undefined;
  return {
    getAdminClient: () => {
      client ??= createClient(
        process.env.WP5_IDENTITY_IT_URL ?? "http://127.0.0.1:1",
        process.env.WP5_IDENTITY_IT_SERVICE_KEY ?? "no-key",
        { auth: { persistSession: false, autoRefreshToken: false } },
      );
      return { client, error: null };
    },
  };
});
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

const PEOPLE = [
  "linked",
  "claimed",
  "staff",
  "staffOwn",
  "stale",
  "relinked",
  "twin",
] as const;
type Person = (typeof PEOPLE)[number];

describe.skipIf(!required && ![url, database, anon, service].some(Boolean))(
  "AL-2678 WP5 rest: a signed-in person's own donor through account link and Party",
  () => {
    const TA = randomUUID();
    const TB = randomUUID();
    const k = Object.fromEntries(
      [
        "pLA",
        "pLB",
        "pC",
        "pS",
        "pX",
        "pR",
        "pR2",
        "pT",
        "dLA",
        "dLB",
        "dC",
        "dS",
        "dX",
        "dR",
        "dT1",
        "dT2",
        "gLA",
        "gLB",
        "gC",
        "gS",
        "gX",
        "gR",
        "gT1",
        "gT2",
        "plC",
      ].map((key) => [key, randomUUID()]),
    ) as Record<string, string>;
    const user = {} as Record<Person, string>;
    const token = {} as Record<Person, string>;
    const membership = {} as Record<string, string>;
    const role: Record<Person, "donor" | "staff"> = {
      linked: "donor",
      claimed: "donor",
      staff: "staff",
      staffOwn: "staff",
      stale: "donor",
      relinked: "donor",
      twin: "donor",
    };
    const publicEnv = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
    const db = new pg.Client({ connectionString: database });
    const admin = () =>
      createClient(url!, service!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    const api = (path: string, init: RequestInit & { key: string }) =>
      fetch(`${url}/${path}`, {
        ...init,
        headers: {
          apikey: init.key,
          Authorization: `Bearer ${init.key}`,
          "Content-Type": "application/json",
          ...init.headers,
        },
      });

    const auth = (who: Person, tenant = TA): AuthContext =>
      ({
        userId: user[who],
        email: null,
        tenantId: tenant,
        role: role[who],
        memberships: membershipsForRole(role[who], tenant),
        profileId: user[who],
        isAuthenticated: true,
        assignment: {
          assignmentId: membership[`${who}:${tenant}`],
          userId: user[who],
          tenantId: tenant,
          revision: "1",
          membershipRole: role[who],
          staffRole: role[who] === "staff" ? "development" : null,
          isTenantAdmin: false,
        },
      }) as AuthContext;
    const request = (path: string, who: Person, tenant = TA) =>
      new Request(`http://localhost${path}`, {
        headers: {
          authorization: `Bearer ${token[who]}`,
          "x-asym-tenant": tenant,
          "x-asym-assignment": membership[`${who}:${tenant}`]!,
        },
      });
    const asUser = (who: Person, tenant = TA) =>
      createClient(url!, anon!, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          headers: {
            Authorization: `Bearer ${token[who]}`,
            "x-asym-tenant": tenant,
            "x-asym-assignment": membership[`${who}:${tenant}`]!,
          },
        },
      });

    beforeAll(async () => {
      if (
        !url ||
        !database ||
        !anon ||
        !service ||
        ![url, database].every((value) =>
          ["localhost", "127.0.0.1", "[::1]"].includes(new URL(value).hostname),
        )
      )
        throw Error("A disposable local Supabase stack is required");
      process.env.NEXT_PUBLIC_SUPABASE_URL = url;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = anon;
      for (const who of PEOPLE) {
        const credentials = {
          email: `wp5rest-${who}-${TA}@example.test`,
          password: randomUUID(),
        };
        const created = await api("auth/v1/admin/users", {
          key: service,
          method: "POST",
          body: JSON.stringify({ ...credentials, email_confirm: true }),
        });
        expect(created.ok, `Auth fixture ${who}: ${created.status}`).toBe(true);
        user[who] = (await created.json()).id;
        const login = await api("auth/v1/token?grant_type=password", {
          key: anon,
          method: "POST",
          body: JSON.stringify(credentials),
        });
        expect(login.ok, `Sign-in ${who}: ${login.status}`).toBe(true);
        token[who] = (await login.json()).access_token;
      }
      await db.connect();
      await db.query("begin");
      try {
        await db.query(
          "insert into public.tenants (id, name, slug) values ($1::uuid, 'WP5 rest A', 'wp5rest-a-' || $1::text), ($2::uuid, 'WP5 rest B', 'wp5rest-b-' || $2::text)",
          [TA, TB],
        );
        await db.query(
          "insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'A', 'US', 'usd', 'A'), ($2, $2, 'B', 'US', 'usd', 'B')",
          [TA, TB],
        );
        await db.query(
          "delete from authz.memberships where user_id = any($1::uuid[])",
          [Object.values(user)],
        );
        const seats: [Person, string][] = [
          ...PEOPLE.map((who): [Person, string] => [who, TA]),
          ["linked", TB],
        ];
        for (const [who, tenant] of seats) {
          const id = randomUUID();
          membership[`${who}:${tenant}`] = id;
          await db.query(
            "insert into authz.memberships (id, user_id, tenant_id, role, staff_role) values ($1, $2, $3, $4, $5)",
            [
              id,
              user[who],
              tenant,
              role[who],
              role[who] === "staff" ? "development" : null,
            ],
          );
        }
        await db.query(
          `insert into public.parties (id, tenant_id, display_name) values
             ($1, $9, 'Linked A'), ($2, $10, 'Linked B'), ($3, $9, 'Claimed'), ($4, $9, 'Staff own'),
             ($5, $9, 'Stale'), ($6, $9, 'Relinked old'), ($7, $9, 'Relinked new'), ($8, $9, 'Twin')`,
          [k.pLA, k.pLB, k.pC, k.pS, k.pX, k.pR, k.pR2, k.pT, TA, TB],
        );
        const donors: [string, string, string, string | null][] = [
          [k.dLA!, TA, k.pLA!, user.linked],
          [k.dLB!, TB, k.pLB!, user.linked],
          [k.dC!, TA, k.pC!, null],
          [k.dS!, TA, k.pS!, user.staffOwn],
          [k.dX!, TA, k.pX!, user.stale],
          [k.dR!, TA, k.pR!, user.relinked],
          [k.dT1!, TA, k.pT!, null],
          [k.dT2!, TA, k.pT!, null],
        ];
        for (const [id, tenant, party, profile] of donors)
          await db.query(
            "insert into public.donors (id, tenant_id, party_id, profile_id, name, email) values ($1, $2, $3, $4, 'Own read', $5)",
            [id, tenant, party, profile, `wp5rest-${id}@example.test`],
          );
        for (const [who, tenant, party, via] of [
          ["linked", TA, k.pLA, "profile_backfill"],
          ["linked", TB, k.pLB, "profile_backfill"],
          ["claimed", TA, k.pC, "account_claim"],
          ["staffOwn", TA, k.pS, "account_claim"],
          ["relinked", TA, k.pR2, "account_claim"],
          ["twin", TA, k.pT, "account_claim"],
        ] as const)
          await db.query(
            "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, $4)",
            [tenant, user[who], party, via],
          );
        const year = new Date().getUTCFullYear();
        for (const [gift, donor, tenant] of [
          [k.gLA, k.dLA, TA],
          [k.gLB, k.dLB, TB],
          [k.gC, k.dC, TA],
          [k.gS, k.dS, TA],
          [k.gX, k.dX, TA],
          [k.gR, k.dR, TA],
          [k.gT1, k.dT1, TA],
          [k.gT2, k.dT2, TA],
        ])
          await db.query(
            "insert into public.donations (id, tenant_id, donor_id, amount, status, gift_date) values ($1, $2, $3, 1000, 'completed', $4::date)",
            [gift, tenant, donor, `${year}-02-01`],
          );
        await db.query(
          "insert into public.donor_pledges (id, tenant_id, donor_id, amount, status) values ($1, $2, $3, 2500, 'active')",
          [k.plC, TA, k.dC],
        );
        await db.query(
          "insert into public.donor_feed_preferences (tenant_id, donor_id, follow_org) values ($1, $2, true), ($1, $3, true)",
          [TA, k.dC, k.dX],
        );
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      }
    });

    afterAll(async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = publicEnv.url;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = publicEnv.key;
      try {
        await db.query("begin");
        for (const sql of [
          "delete from public.donor_feed_preferences where tenant_id = any($1::uuid[])",
          "delete from public.donor_pledges where tenant_id = any($1::uuid[])",
          "delete from public.donations where tenant_id = any($1::uuid[])",
          "delete from public.giving_target_entity_locks where tenant_id = any($1::uuid[])",
          "delete from public.account_links where tenant_id = any($1::uuid[])",
          "delete from public.donors where tenant_id = any($1::uuid[])",
          "delete from public.parties where tenant_id = any($1::uuid[])",
          "delete from public.legal_entities where tenant_id = any($1::uuid[])",
          "delete from authz.memberships where tenant_id = any($1::uuid[])",
          "delete from public.tenants where id = any($1::uuid[])",
        ])
          await db.query(sql, [[TA, TB]]);
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      } finally {
        await db.end();
        const failures: string[] = [];
        for (const who of PEOPLE)
          if (user[who]) {
            const deleted = await api(`auth/v1/admin/users/${user[who]}`, {
              key: service!,
              method: "DELETE",
            });
            if (!deleted.ok) failures.push(`${who}: ${deleted.status}`);
          }
        expect(failures, "auth users the fixture could not delete").toEqual([]);
      }
    });

    /** What every reader answers for one person in one organization. */
    async function readAll(who: Person, tenant = TA) {
      s.auth = auth(who, tenant);
      const service = admin();
      const out: Record<string, unknown> = {};
      out.resolver = await findOwnDonor(service, {
        userId: user[who],
        tenantId: tenant,
      });
      try {
        const snapshot = await getDonorPortalSnapshot({
          supabaseAdmin: service,
          profileId: user[who],
          tenantId: tenant,
        });
        out.snapshot = {
          gifts: snapshot.donations.map((g) => g.id).sort(),
          pledges: snapshot.recurringGifts.map((p) => p.id).sort(),
        };
        const { donor } = await resolveDonorPortalContext(
          service,
          user[who],
          tenant,
        );
        out.statements = (
          await getOwnedStatementDonations({
            supabaseAdmin: service,
            donorId: donor.id,
            tenantId: tenant,
            year: new Date().getUTCFullYear(),
          })
        )
          .map((g) => g.id)
          .sort();
      } catch (error) {
        out.snapshot = (error as { status?: number }).status ?? String(error);
      }
      const portal = await getPortal(request("/api/donor/portal", who, tenant));
      out.portal = portal.status;
      const donations = await getDonations(
        request("/api/donations", who, tenant) as never,
      );
      out.donations =
        donations.status === 200
          ? ((await donations.json()).donations as { id: string }[])
              .map((g) => g.id)
              .sort()
          : donations.status;
      out.history = await resolveDonorId(null, tenant, user[who]);
      const feed = await getFeedPreferences(
        request("/api/donor/feed-preferences", who, tenant),
      );
      out.feed =
        feed.status === 200
          ? (await feed.json()).followOrg === true
            ? "stored"
            : "default"
          : feed.status;
      const graph = await createGraphQLHandler().POST(
        new Request("http://localhost/api/graphql", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ query: "{ myDonations(limit: 50) { id } }" }),
        }),
      );
      const graphBody = (await graph.json()) as {
        data?: { myDonations: { id: string }[] | null };
        errors?: { message: string }[];
      };
      out.graphql = graphBody.errors?.length
        ? graphBody.errors.map((e) => e.message)
        : (graphBody.data?.myDonations ?? []).map((g) => g.id).sort();
      out.hook = await loadOwnDonorId(asUser(who, tenant), {
        userId: user[who],
        tenantId: tenant,
      });
      return out;
    }

    it("a donor whose only tie is a claim (profile_id NULL) sees their gifts, pledges and statements through every reader (red: none found by profile)", async () => {
      expect(await readAll("claimed")).toEqual({
        resolver: { status: "found", donor: { id: k.dC } },
        snapshot: { gifts: [k.gC], pledges: [k.plC] },
        statements: [k.gC],
        portal: 200,
        donations: [k.gC],
        history: k.dC,
        feed: "stored",
        graphql: [k.gC],
        hook: k.dC,
      });
    });

    it("a donor linked before the change still does, and a donor of A and B sees only A's in A and only B's in B (guard)", async () => {
      expect(await readAll("linked", TA)).toMatchObject({
        resolver: { status: "found", donor: { id: k.dLA } },
        snapshot: { gifts: [k.gLA], pledges: [] },
        portal: 200,
        donations: [k.gLA],
        history: k.dLA,
        graphql: [k.gLA],
        hook: k.dLA,
      });
      expect(await readAll("linked", TB)).toMatchObject({
        resolver: { status: "found", donor: { id: k.dLB } },
        snapshot: { gifts: [k.gLB], pledges: [] },
        donations: [k.gLB],
        history: k.dLB,
        graphql: [k.gLB],
        hook: k.dLB,
      });
    });

    it("staff of A get no donor but their own, although row security lets them read every donor of A", async () => {
      expect(await readAll("staff")).toMatchObject({
        resolver: { status: "none" },
        history: null,
        feed: "default",
        graphql: [],
        hook: null,
      });
      expect(await readAll("staffOwn")).toMatchObject({
        resolver: { status: "found", donor: { id: k.dS } },
        history: k.dS,
        graphql: [k.gS],
        hook: k.dS,
      });
    });

    it("a profile_id left on a donor after an unlink or a relink names nothing (red: the old readers return that donor's gifts)", async () => {
      for (const who of ["stale", "relinked"] as const)
        expect([who, await readAll(who)]).toEqual([
          who,
          {
            resolver: { status: "none" },
            snapshot: 404,
            portal: 404,
            donations: [],
            history: null,
            feed: "default",
            graphql: [],
            hook: null,
          },
        ]);
    });

    it("two donors on one (organization, Party) refuse cleanly: the portal and the donations route 409, feed preferences its existing 409, GraphQL an error, and no reader names either (red: the old readers find none by profile)", async () => {
      expect(await readAll("twin")).toEqual({
        resolver: { status: "multiple" },
        snapshot: 409,
        portal: 409,
        donations: 409,
        history: null,
        feed: 409,
        graphql: ["Multiple donor records for this account"],
        hook: null,
      });
    });
  },
);
