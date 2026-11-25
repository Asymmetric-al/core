import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import * as followers from "../../../../packages/api/src/follower-requests";
import * as follower from "../../../../packages/api/src/follower-requests/request";
import * as metrics from "../../../../packages/api/src/missionaries/metrics";
import * as portal from "../../../../packages/api/src/missionary-portal";
import {
  PATCH as patchDonor,
  POST_ACTIVITY,
} from "../../../../packages/api/src/missionary-portal/donor";
import * as partners from "../../../../packages/api/src/missionary-portal/donors";
import * as task from "../../../../packages/api/src/missionary-portal/task";
import * as tasks from "../../../../packages/api/src/missionary-portal/tasks";
import { createGraphQLHandler } from "../../../../packages/graphql/handler";
import { membershipsForRole } from "../../../fixtures/auth-memberships";

import type * as AuthModule from "../../../../packages/auth/context";
import type * as EnvModule from "../../../../packages/env";

const url = process.env.WP5_IDENTITY_IT_URL;
const database = process.env.WP5_IDENTITY_IT_DATABASE_URL;
const anon = process.env.WP5_IDENTITY_IT_ANON_KEY;
const service = process.env.WP5_IDENTITY_IT_SERVICE_KEY;
const required = process.env.GITHUB_JOB === "local-supabase";

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
vi.mock("@asym/env", async (orig) => {
  const real = await orig<typeof EnvModule>();
  return {
    ...real,
    serverEnv: new Proxy(real.serverEnv, {
      get: (target, key) =>
        key === "NEXT_PUBLIC_SUPABASE_URL"
          ? (process.env.WP5_IDENTITY_IT_URL ?? "http://127.0.0.1:1")
          : key === "NEXT_PUBLIC_SUPABASE_ANON_KEY"
            ? (process.env.WP5_IDENTITY_IT_ANON_KEY ?? "no-key")
            : Reflect.get(target, key),
    }),
  };
});
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

const PEOPLE = ["C", "R", "E", "S", "ST"] as const;
type Person = (typeof PEOPLE)[number];
const TA = randomUUID();
const TB = randomUUID();
const id = Object.fromEntries(
  [
    "mC",
    "mR",
    "mE",
    "mS",
    "mST",
    "pC",
    "pR",
    "pE",
    "pA",
    "pS",
    "wC",
    "wR",
    "wE",
    "dR",
    "dE",
    "dS",
    "gR1",
    "gR2",
    "gE",
    "gS",
    "plR",
    "aR",
    "aE",
    "aS",
    "tR",
    "tS",
    "frR",
    "frE",
    "frS",
  ].map((k) => [k, randomUUID()]),
) as Record<string, string>;
const user = {} as Record<Person, string>;
const token = {} as Record<Person, string>;
const assignment: Record<Person, string> = {
  C: id.mC!,
  R: id.mR!,
  E: id.mE!,
  S: id.mS!,
  ST: id.mST!,
};

const ROOK = [
  "Donor Rook",
  "rook@example.test",
  "+1-555-0177",
  "+1-555-0178",
  "1 Rook Lane",
  "Rookton",
  "https://example.test/rook.png",
  "https://rook.example.test",
  "Rook Org",
  "Rook Title",
  "1970-01-01",
  "Spouse Rook",
  "Note Rook",
  "tag-rook",
  "Call Rook",
];
const ELM = [
  "Donor Elm",
  "elm@example.test",
  "+1-555-0188",
  "2 Elm Road",
  "https://example.test/elm.png",
  "Note Elm",
];
const forbidden = () => [
  ...ROOK,
  ...ELM,
  "Wren",
  "Ash",
  "Party Rook",
  "Party Elm",
  "Party Ash",
  "Profile Rook",
  "Profile Elm",
  user.R,
  user.E,
  id.pR!,
  id.pE!,
  id.pA!,
];
function notShown(body: unknown) {
  const text = JSON.stringify(body).toLowerCase();
  for (const value of forbidden())
    expect(text, `the body holds ${value}`).not.toContain(value.toLowerCase());
}

async function api(
  path: string,
  init: {
    key?: string;
    bearer?: string;
    body?: unknown;
    method?: string;
    headers?: Record<string, string>;
  } = {},
) {
  return fetch(`${url}/${path}`, {
    method: init.method ?? (init.body === undefined ? "GET" : "POST"),
    headers: {
      apikey: init.key ?? anon!,
      Authorization: `Bearer ${init.bearer ?? anon!}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}

const as = (who: Person, role: "missionary" | "staff" | "donor") => {
  s.auth = {
    userId: user[who],
    profileId: user[who],
    email: null,
    tenantId: TA,
    isAuthenticated: true,
    role,
    memberships: membershipsForRole(role, TA),
    assignment: {
      userId: user[who],
      tenantId: TA,
      membershipRole: role,
      assignmentId: assignment[who],
    },
  };
};
function request(method: string, path: string, body?: unknown) {
  return new NextRequest("http://localhost" + path, {
    method,
    ...(body
      ? {
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });
}
async function answer(response: Response, status: number) {
  const body = await response.json();
  expect(response.status, JSON.stringify(body)).toBe(status);
  return body;
}
async function gql(query: string) {
  const response = await createGraphQLHandler().POST(
    new Request("http://localhost/api/graphql", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": randomUUID(),
      },
      body: JSON.stringify({ query }),
    }),
  );
  return (await response.json()) as {
    data?: Record<string, Array<Record<string, unknown>>> | null;
    errors?: unknown[];
  };
}

const fullPatch = (name: string, email: string) => ({
  name,
  email,
  phone: "",
  mobile: "",
  work_phone: "",
  preferred_contact: "email",
  type: "Individual",
  status: "Active",
  frequency: "Monthly",
  location: "",
  website: "",
  organization: "",
  title: "",
  spouse: "",
  birthday: "",
  anniversary: "",
  notes: "",
  street: "",
  street2: "",
  city: "",
  state: "",
  zip: "",
});

describe.skipIf(!required && ![url, database, anon, service].some(Boolean))(
  "AL-2678 WP5 part 2-r2s: a restricted person is an anonymous partner to a colleague, through PostgREST and each reader's own route",
  () => {
    let db: pg.Client;

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
      for (const who of PEOPLE) {
        const credentials = {
          email: `r2s-${who.toLowerCase()}-${TA}@example.test`,
          password: randomUUID(),
        };
        const created = await api("auth/v1/admin/users", {
          key: service,
          bearer: service,
          body: { ...credentials, email_confirm: true },
        });
        expect(created.ok, `Auth fixture ${who}: ${created.status}`).toBe(true);
        user[who] = (await created.json()).id;
        const login = await api("auth/v1/token?grant_type=password", {
          body: credentials,
        });
        expect(login.ok, `Sign-in ${who}: ${login.status}`).toBe(true);
        token[who] = (await login.json()).access_token;
      }
      db = new pg.Client({ connectionString: database });
      await db.connect();
      await db.query("begin");
      try {
        const v = { ...id, TA, TB, ...user } as Record<string, string>;
        const sql = (text: string) =>
          db.query(
            text.replace(/:(\w+)/g, (_m, key: string) => {
              if (!(key in v)) throw Error(`no fixture value ${key}`);
              return `'${v[key]}'`;
            }),
          );
        await sql(
          `insert into public.tenants (id, name, slug) values (:TA, 'r2s A', 'r2s-a-' || :TA), (:TB, 'r2s B', 'r2s-b-' || :TB)`,
        );
        await sql(
          `insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values (:TA, :TA, 'A', 'US', 'usd', 'A'), (:TB, :TB, 'B', 'US', 'usd', 'B')`,
        );
        await sql(
          `delete from authz.memberships where user_id in (:C, :R, :E, :S, :ST)`,
        );
        await sql(
          `insert into authz.memberships (id, user_id, tenant_id, role, staff_role) values
             (:mC, :C, :TA, 'missionary', null), (:mR, :R, :TA, 'missionary', null), (:mE, :E, :TB, 'missionary', null),
             (:mS, :S, :TA, 'donor', null), (:mST, :ST, :TA, 'staff', 'development')`,
        );
        await sql(
          `update public.profiles set display_name = 'Profile Cole', full_name = 'Profile Cole', first_name = 'Cole', last_name = 'Worker' where id = :C;
           update public.profiles set display_name = 'Profile Rook', full_name = 'Profile Rook', first_name = 'Profile Rook', last_name = 'Profile Rook' where id = :R;
           update public.profiles set display_name = 'Profile Elm', full_name = 'Profile Elm', first_name = 'Profile Elm', last_name = 'Profile Elm' where id = :E;
           update public.profiles set display_name = 'Profile Sage', full_name = 'Profile Sage', first_name = 'Sage', last_name = 'Giver' where id = :S`,
        );
        await sql(
          `insert into public.parties (id, tenant_id, display_name, security_level, security_level_source, public_alias) values
             (:pC, :TA, 'Party Cole', 'standard', 'manual', null),
             (:pR, :TA, 'Party Rook', 'restricted', 'manual', 'Wren'),
             (:pE, :TA, 'Party Elm', 'standard', 'manual', null),
             (:pA, :TB, 'Party Ash', 'restricted', 'manual', 'Ash'),
             (:pS, :TA, 'Party Sage', 'standard', 'manual', null)`,
        );
        await sql(
          `insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values
             (:wC, :TA, :pC, :C, :TA), (:wR, :TA, :pR, :R, :TA), (:wE, :TB, :pA, :E, :TB)`,
        );
        await sql(
          `insert into public.donors (id, tenant_id, party_id, profile_id, missionary_id, giving_preferences, name, email, phone, mobile,
                                      address, location, avatar_url, website, organization, title, birthday, spouse, notes, tags) values
             (:dR, :TA, :pR, :R, :C, '{"defaultAnonymousToRecipient": false}', 'Donor Rook', 'rook@example.test', '+1-555-0177', '+1-555-0178',
              '{"street": "1 Rook Lane", "city": "Rookton"}', 'Rookton', 'https://example.test/rook.png', 'https://rook.example.test',
              'Rook Org', 'Rook Title', '1970-01-01', 'Spouse Rook', 'Note Rook', '{tag-rook}'),
             (:dE, :TA, :pE, :E, :C, '{"defaultAnonymousToRecipient": false}', 'Donor Elm', 'elm@example.test', '+1-555-0188', null,
              '{"street": "2 Elm Road"}', null, 'https://example.test/elm.png', null, null, null, null, null, 'Note Elm', null),
             (:dS, :TA, :pS, :S, :C, '{"defaultAnonymousToRecipient": false}', 'Donor Sage', 'sage@example.test', '+1-555-0199', null,
              '{"street": "3 Sage Way"}', 'Sageville', null, null, null, null, null, null, 'Note Sage', '{tag-sage}')`,
        );
        await sql(
          `insert into public.account_links (tenant_id, user_id, party_id, linked_via) values
             (:TA, :C, :pC, 'profile_backfill'), (:TA, :R, :pR, 'profile_backfill'), (:TA, :E, :pE, 'profile_backfill'),
             (:TB, :E, :pA, 'profile_backfill'), (:TA, :S, :pS, 'profile_backfill')`,
        );
        await sql(
          `insert into public.donations (id, tenant_id, donor_id, missionary_id, amount, status, gift_date) values
             (:gR1, :TA, :dR, :wC, 1111, 'completed', '2026-11-01'), (:gR2, :TA, :dR, :wC, 2222, 'completed', '2026-11-02'),
             (:gE, :TA, :dE, :wC, 3333, 'completed', '2026-11-03'), (:gS, :TA, :dS, :wC, 4444, 'completed', '2026-11-04')`,
        );
        await sql(
          `insert into public.donor_pledges (id, tenant_id, donor_id, missionary_id, amount, frequency, status) values
             (:plR, :TA, :dR, :wC, 1500, 'monthly', 'active')`,
        );
        await sql(
          `insert into public.donor_activities (id, tenant_id, donor_id, type, title) values
             (:aR, :TA, :dR, 'call', 'Call Rook'), (:aE, :TA, :dE, 'note', 'Note Elm'), (:aS, :TA, :dS, 'note', 'Thanked')`,
        );
        await sql(
          `insert into public.missionary_tasks (id, tenant_id, missionary_id, donor_id, title) values
             (:tR, :TA, :C, :dR, 'Follow up'), (:tS, :TA, :C, :dS, 'Call back')`,
        );
        await sql(
          `insert into public.follower_requests (id, tenant_id, donor_id, missionary_id) values
             (:frR, :TA, :dR, :C), (:frE, :TA, :dE, :C), (:frS, :TA, :dS, :C)`,
        );
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      }
    });

    afterAll(async () => {
      try {
        if (db)
          try {
            await db.query("begin");
            try {
              for (const sql of [
                "delete from public.audit_logs where tenant_id = any($1::uuid[])",
                "delete from public.account_links where tenant_id = any($1::uuid[])",
                "delete from private.party_restricted where tenant_id = any($1::uuid[])",
                "delete from public.missionary_tasks where tenant_id = any($1::uuid[])",
                "delete from public.follower_requests where tenant_id = any($1::uuid[])",
                "delete from public.donor_feed_preferences where tenant_id = any($1::uuid[])",
                "delete from public.donor_activities where tenant_id = any($1::uuid[])",
                "delete from public.donor_pledges where tenant_id = any($1::uuid[])",
                "delete from public.donations where tenant_id = any($1::uuid[])",
                "delete from public.giving_target_entity_locks where tenant_id = any($1::uuid[])",
                "delete from public.donors where tenant_id = any($1::uuid[])",
                "delete from public.missionaries where tenant_id = any($1::uuid[])",
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
            }
          } finally {
            await db.end();
          }
      } finally {
        const failures: string[] = [];
        for (const who of PEOPLE)
          if (user[who])
            try {
              const deleted = await api(`auth/v1/admin/users/${user[who]}`, {
                key: service,
                bearer: service,
                method: "DELETE",
              });
              if (!deleted.ok) failures.push(`${who}: ${deleted.status}`);
            } catch (error) {
              failures.push(`${who}: ${String(error)}`);
            }
        expect(failures, "auth users the fixture could not delete").toEqual([]);
      }
    });

    describe("the fact through PostgREST (test 3)", () => {
      it("the service key reads the computed column: R and E restricted, S not", async () => {
        const response = await api(
          `rest/v1/donors?select=id,donor_is_restricted_party&id=in.(${id.dR},${id.dE},${id.dS})`,
          { key: service, bearer: service },
        );
        expect(response.status).toBe(200);
        const rows = (await response.json()) as {
          id: string;
          donor_is_restricted_party: boolean;
        }[];
        expect(
          Object.fromEntries(
            rows.map((row) => [row.id, row.donor_is_restricted_party]),
          ),
        ).toEqual({ [id.dR!]: true, [id.dE!]: true, [id.dS!]: false });
      });

      it("the service key calls it through rpc/ with a row argument", async () => {
        const response = await api("rest/v1/rpc/donor_is_restricted_party", {
          key: service,
          bearer: service,
          body: {
            p_donor: {
              id: id.dE,
              tenant_id: TA,
              party_id: id.pE,
              profile_id: user.E,
            },
          },
        });
        expect(response.status, await response.clone().text()).toBe(200);
        expect(await response.json()).toBe(true);
      });

      it("a donor's own token may run it neither as a column nor through rpc/", async () => {
        const headers = { "x-asym-tenant": TA, "x-asym-assignment": id.mS! };
        const column = await api(
          `rest/v1/donors?select=id,donor_is_restricted_party&id=eq.${id.dS}`,
          { bearer: token.S, headers },
        );
        expect(column.status).toBe(403);
        expect(await column.json()).toMatchObject({
          code: "42501",
          message: "permission denied for function donor_is_restricted_party",
        });
        const rpc = await api("rest/v1/rpc/donor_is_restricted_party", {
          bearer: token.S,
          headers,
          body: { p_donor: { id: id.dS, tenant_id: TA } },
        });
        expect(rpc.status).toBe(403);
        expect(await rpc.json()).toMatchObject({
          code: "42501",
          message: "permission denied for function donor_is_restricted_party",
        });
      });

      it("anon is refused the table before the column, and the function through rpc/", async () => {
        const column = await api(
          "rest/v1/donors?select=id,donor_is_restricted_party&limit=1",
        );
        expect(column.status).toBe(401);
        expect(await column.json()).toMatchObject({
          code: "42501",
          message: "permission denied for table donors",
        });
        const rpc = await api("rest/v1/rpc/donor_is_restricted_party", {
          body: { p_donor: { id: id.dS, tenant_id: TA } },
        });
        expect(rpc.status).toBe(401);
        expect(await rpc.json()).toMatchObject({
          code: "42501",
          message: "permission denied for function donor_is_restricted_party",
        });
      });
    });

    describe("each reader through its route's own code, as the colleague C (test 6)", () => {
      it.each(["missionary", "staff"] as const)(
        "D1 GraphQL mySupporters for a %s caller: R and E have no donor, S is named",
        async (role) => {
          as("C", role);
          const r = await gql(
            "{ mySupporters { id amount donor { id firstName lastName email avatarUrl } } }",
          );
          expect(r.errors, JSON.stringify(r.errors)).toBeUndefined();
          const rows = Object.fromEntries(
            r.data!.mySupporters!.map((row) => [row.id, row]),
          );
          for (const gift of ["gR1", "gR2", "gE"])
            expect(rows[id[gift]!]?.donor, gift).toBeNull();
          expect(rows[id.gS!]?.donor).toMatchObject({
            id: user.S,
            firstName: "Sage",
          });
          expect(rows[id.gR1!]?.amount).toBe(1111);
          notShown(r);
        },
      );

      it("D2 GET /api/missionary/donors: R and E are anonymous partners, S is named", async () => {
        as("C", "missionary");
        const body = await answer(
          await partners.GET(request("GET", "/api/missionary/donors")),
          200,
        );
        const rows = Object.fromEntries(
          (body.donors as Record<string, unknown>[]).map((row) => [
            row.id,
            row,
          ]),
        );
        for (const donor of ["dR", "dE"])
          expect(rows[id[donor]!], donor).toMatchObject({
            name: "Anonymous partner",
            initials: "AP",
            email: "",
            phone: "",
            tags: [],
            activities: [],
            recurring_donations: [],
            is_anonymous: true,
          });
        expect(rows[id.dS!]).toMatchObject({
          name: "Donor Sage",
          is_anonymous: false,
        });
        notShown(body);
      });

      it("D3 GET /api/missionary/portal: R's and E's gifts carry no donor id, amounts and dates as stored", async () => {
        as("C", "missionary");
        const body = await answer(
          await portal.GET(request("GET", "/api/missionary/portal")),
          200,
        );
        const gifts = Object.fromEntries(
          (body.portal.recentGifts as Record<string, unknown>[]).map((g) => [
            g.id,
            g,
          ]),
        );
        expect(gifts[id.gR1!]).toMatchObject({
          donorId: null,
          amountCents: 1111,
          date: "2026-11-01",
        });
        expect(gifts[id.gR2!]).toMatchObject({
          donorId: null,
          amountCents: 2222,
          date: "2026-11-02",
        });
        expect(gifts[id.gE!]).toMatchObject({
          donorId: null,
          amountCents: 3333,
          date: "2026-11-03",
        });
        expect(gifts[id.gS!]).toMatchObject({ donorId: id.dS });
        const relationships = Object.fromEntries(
          (body.portal.donorRelationships as Record<string, unknown>[]).map(
            (d) => [d.id, d],
          ),
        );
        for (const donor of ["dR", "dE"])
          expect(relationships[id[donor]!], donor).toMatchObject({
            displayName: "Anonymous partner",
            email: null,
            phone: null,
            avatarUrl: null,
            location: null,
            tags: [],
          });
        expect(relationships[id.dS!]).toMatchObject({
          displayName: "Donor Sage",
        });
        notShown(body);
      });

      it("D4 GET, POST and PATCH /api/missionary/tasks: R's task keeps its donor id and hides the rest", async () => {
        as("C", "missionary");
        const hidden = {
          id: id.dR,
          name: "Anonymous partner",
          email: null,
          avatar_url: null,
        };
        const list = await answer(
          await tasks.GET(request("GET", "/api/missionary/tasks")),
          200,
        );
        const byId = Object.fromEntries(
          (list.tasks as Record<string, unknown>[]).map((t) => [t.id, t]),
        );
        expect(byId[id.tR!]?.donor).toEqual(hidden);
        expect(byId[id.tS!]?.donor).toMatchObject({ name: "Donor Sage" });
        notShown(list);
        const created = await answer(
          await tasks.POST(
            request("POST", "/api/missionary/tasks", {
              title: "Call",
              donor_id: id.dR,
            }),
          ),
          201,
        );
        expect(created.task.donor).toEqual(hidden);
        notShown(created);
        const updated = await answer(
          await task.PATCH(
            request("PATCH", `/api/missionary/tasks/${id.tR}`, {
              title: "Follow up again",
            }),
            { params: Promise.resolve({ taskId: id.tR! }) },
          ),
          200,
        );
        expect(updated.task.donor).toEqual(hidden);
        notShown(updated);
      });

      it("D5 GET /api/follower-requests and PATCH approving R's request: no donor id, the label, AP, no photo", async () => {
        as("C", "missionary");
        const list = await answer(
          await followers.GET(
            request("GET", "/api/follower-requests?status=pending"),
          ),
          200,
        );
        const byId = Object.fromEntries(
          (list.requests as Record<string, unknown>[]).map((r) => [r.id, r]),
        );
        for (const key of ["frR", "frE"])
          expect(byId[id[key]!], key).toMatchObject({
            donor_id: null,
            name: "Anonymous partner",
            initials: "AP",
            avatar_url: null,
          });
        expect(byId[id.frS!]).toMatchObject({
          donor_id: id.dS,
          name: "Donor Sage",
        });
        notShown(list);
        const approved = await answer(
          await follower.PATCH(
            request("PATCH", `/api/follower-requests/${id.frR}`, {
              status: "approved",
              access_level: "view",
            }),
            { params: Promise.resolve({ requestId: id.frR! }) },
          ),
          200,
        );
        expect(approved.request).toMatchObject({
          id: id.frR,
          status: "approved",
          donor_id: null,
          donor: null,
          name: "Anonymous partner",
          initials: "AP",
        });
        notShown(approved);
      });

      it("guard: PATCH approving S's request names S with the donor's id, name and photo only", async () => {
        as("C", "missionary");
        const approved = await answer(
          await follower.PATCH(
            request("PATCH", `/api/follower-requests/${id.frS}`, {
              status: "approved",
              access_level: "view",
            }),
            { params: Promise.resolve({ requestId: id.frS! }) },
          ),
          200,
        );
        expect(approved.request.donor).toEqual({
          id: id.dS,
          name: "Donor Sage",
          avatar_url: null,
        });
        expect(approved.request.name).toBe("Donor Sage");
      });

      it.each([
        ["C", "missionary"],
        ["ST", "staff"],
      ] as const)(
        "D7 GET /api/missionaries/[C]/metrics for %s as %s: R's and E's gifts have no donor id",
        async (who, role) => {
          as(who, role);
          const body = await answer(
            await metrics.GET(
              request("GET", `/api/missionaries/${id.wC}/metrics`),
              { params: Promise.resolve({ id: id.wC! }) },
            ),
            200,
          );
          const gifts = Object.fromEntries(
            (body.donations as Record<string, unknown>[]).map((g) => [g.id, g]),
          );
          for (const gift of ["gR1", "gR2", "gE"])
            expect(gifts[id[gift]!]?.donor_id, gift).toBeNull();
          expect(gifts[id.gS!]?.donor_id).toBe(id.dS);
          expect(gifts[id.gR1!]?.amount).toBe(1111);
          notShown(body);
        },
      );
    });

    describe("the colleague cannot write to a hidden donor (test 7)", () => {
      const row = async (donor: string) =>
        (
          await db.query(
            "select name, email, tags, notes, (select count(*)::int from public.donor_activities where donor_id = $1) as activities from public.donors where id = $1",
            [donor],
          )
        ).rows[0];

      it.each([
        ["R", "dR", "Donor Rook", "rook@example.test"],
        ["E", "dE", "Donor Elm", "elm@example.test"],
      ])(
        "%s: PATCH with a full body, PATCH with tags and POST an activity answer 404 and change nothing",
        async (_who, key, name, email) => {
          as("C", "missionary");
          const donorId = id[key]!;
          const before = await row(donorId);
          const params = { params: Promise.resolve({ donorId }) };
          for (const response of [
            await patchDonor(
              request(
                "PATCH",
                `/api/missionary/donors/${donorId}`,
                fullPatch("Overwritten", `overwritten-${key}@example.test`),
              ),
              params,
            ),
            await patchDonor(
              request("PATCH", `/api/missionary/donors/${donorId}`, {
                tags: ["overwritten"],
              }),
              { params: Promise.resolve({ donorId }) },
            ),
            await POST_ACTIVITY(
              request("POST", `/api/missionary/donors/${donorId}/activities`, {
                activityType: "note",
                note: "Overwritten",
              }),
              { params: Promise.resolve({ donorId }) },
            ),
          ])
            expect(await answer(response, 404)).toMatchObject({
              error: "Donor relationship not found",
            });
          expect(await row(donorId)).toEqual(before);
          expect(before).toMatchObject({ name, email });
        },
      );

      it("guard: S takes the same writes", async () => {
        as("C", "missionary");
        const donorId = id.dS!;
        await answer(
          await patchDonor(
            request(
              "PATCH",
              `/api/missionary/donors/${donorId}`,
              fullPatch("Donor Sage", "sage@example.test"),
            ),
            { params: Promise.resolve({ donorId }) },
          ),
          200,
        );
        await answer(
          await patchDonor(
            request("PATCH", `/api/missionary/donors/${donorId}`, {
              tags: ["tag-sage"],
            }),
            { params: Promise.resolve({ donorId }) },
          ),
          200,
        );
        await answer(
          await POST_ACTIVITY(
            request("POST", `/api/missionary/donors/${donorId}/activities`, {
              activityType: "note",
              note: "Thanks",
            }),
            { params: Promise.resolve({ donorId }) },
          ),
          201,
        );
        expect(await row(donorId)).toMatchObject({
          name: "Donor Sage",
          activities: 2,
        });
      });
    });
  },
);
