import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { renderContributionReceiptSnapshotPdf } from "../../../../packages/api/src/admin/contribution-operations/receipt-pdf";
import { GET as getDonations } from "../../../../packages/api/src/donations";
import { GET as getDonorPortal } from "../../../../packages/api/src/donor-portal";
import * as partners from "../../../../packages/api/src/missionary-portal/donors";
import { GET as getComments } from "../../../../packages/api/src/posts/comments";
import { GET as getFeed } from "../../../../packages/api/src/posts/index";
import { postAuthorName } from "../../../../packages/database/hooks/donor-feed-posts";
import { createGraphQLHandler } from "../../../../packages/graphql/handler";

import type * as AuthModule from "../../../../packages/auth/context";
import type * as EnvModule from "../../../../packages/env";
import type { DocRaptorClient } from "@asym/docraptor-client";

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

const PEOPLE = ["A", "P", "D", "M", "B", "DS", "R", "C"] as const;
type Person = (typeof PEOPLE)[number];
const TA = randomUUID();
const TB = randomUUID();
const id = Object.fromEntries(
  [
    "mA",
    "mP",
    "mD",
    "mM",
    "mB",
    "mDSA",
    "mDSB",
    "mR",
    "mC",
    "pU",
    "pK",
    "pV",
    "pZ",
    "pR",
    "pC",
    "pD",
    "wU",
    "wK",
    "wV",
    "wZ",
    "wR",
    "wC",
    "dD",
    "dR",
    "gD",
    "gR",
    "postR",
    "snap",
  ].map((k) => [k, randomUUID()]),
) as Record<string, string>;
const user = {} as Record<Person, string>;
const token = {} as Record<Person, string>;

const IDENTITY = [
  "Legal Kestrel",
  "Country Kestrel",
  "Place Kestrel",
  "Legal Vale",
  "Country Vale",
  "Place Vale",
  "Legal Zed",
  "Country Zed",
  "Place Zed",
  "Legal Rowan",
  "Country Rowan",
  "Place Rowan",
];
const IDENTITY_KEYS = [
  "legal_name",
  "legalname",
  "real_country",
  "realcountry",
  "precise_location",
  "preciselocation",
];
const NOT_PERMITTED =
  "Only staff with the Restrict publication permission can change these settings.";
const REFUSAL_TEXT: Record<string, string> = {
  NOT_FOUND: "Worker not found.",
  NO_IDENTITY: "No legal name is recorded for this worker.",
  REASON_REQUIRED: "Give a reason.",
  NOTHING_TO_CHANGE: "Choose what to change.",
  LEVEL_CHANGED: "This worker's level has changed. Reload to see it.",
  ALIAS_REQUIRED: "A restricted or high-risk worker needs a public alias.",
  ALIAS_IS_LEGAL_NAME:
    "The public alias must differ from the worker's legal name.",
  INVALID_INPUT: "Check the form and try again.",
};

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

function absent(value: unknown, extra: string[] = []) {
  const text = JSON.stringify(value).toLowerCase();
  for (const word of [...IDENTITY, ...extra])
    expect(text, `the body holds ${word}`).not.toContain(word.toLowerCase());
  for (const key of IDENTITY_KEYS)
    expect(text, `the body holds the key ${key}`).not.toContain(`"${key}"`);
}

async function api(
  path: string,
  init: { key?: string; bearer?: string; body?: unknown; method?: string } = {},
) {
  return fetch(`${url}/${path}`, {
    method: init.method ?? (init.body === undefined ? "GET" : "POST"),
    headers: {
      apikey: init.key ?? anon!,
      Authorization: `Bearer ${init.bearer ?? anon!}`,
      "Content-Type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}

type Role = "staff" | "missionary" | "donor";
const contexts: Record<
  string,
  {
    who: Person;
    tenant: string;
    assignment: string;
    role: Role;
    staffRole: string | null;
    admin: boolean;
  }
> = {
  A: {
    who: "A",
    tenant: TA,
    assignment: id.mA!,
    role: "staff",
    staffRole: "development",
    admin: true,
  },
  P: {
    who: "P",
    tenant: TA,
    assignment: id.mP!,
    role: "staff",
    staffRole: "member_care",
    admin: false,
  },
  D: {
    who: "D",
    tenant: TA,
    assignment: id.mD!,
    role: "donor",
    staffRole: null,
    admin: false,
  },
  M: {
    who: "M",
    tenant: TA,
    assignment: id.mM!,
    role: "missionary",
    staffRole: null,
    admin: false,
  },
  B: {
    who: "B",
    tenant: TB,
    assignment: id.mB!,
    role: "staff",
    staffRole: "development",
    admin: true,
  },
  DSA: {
    who: "DS",
    tenant: TA,
    assignment: id.mDSA!,
    role: "staff",
    staffRole: "finance",
    admin: false,
  },
  DSB: {
    who: "DS",
    tenant: TB,
    assignment: id.mDSB!,
    role: "staff",
    staffRole: "finance",
    admin: false,
  },
  C: {
    who: "C",
    tenant: TA,
    assignment: id.mC!,
    role: "missionary",
    staffRole: null,
    admin: false,
  },
};

function as(key: keyof typeof contexts) {
  const c = contexts[key]!;
  s.auth = {
    userId: user[c.who],
    profileId: user[c.who],
    email: null,
    tenantId: c.tenant,
    isAuthenticated: true,
    role: c.admin ? "admin" : c.role,
    memberships: [
      {
        tenantId: c.tenant,
        role: c.role,
        staffRole: c.staffRole,
        isActive: true,
        isTenantAdmin: c.admin,
      },
    ],
    assignment: {
      userId: user[c.who],
      tenantId: c.tenant,
      membershipRole: c.role,
      staffRole: c.staffRole,
      isTenantAdmin: c.admin,
      assignmentId: c.assignment,
    },
  };
  return c.who;
}

function request(
  who: Person | null,
  method: string,
  path: string,
  body?: unknown,
  type = "application/json",
) {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: {
      ...(who ? { authorization: `Bearer ${token[who]}` } : {}),
      ...(body === undefined ? {} : { "content-type": type }),
    },
    ...(body === undefined
      ? {}
      : { body: typeof body === "string" ? body : JSON.stringify(body) }),
  });
}

const seen: unknown[] = [];
async function answer(response: Response, status: number) {
  const body = (await response.json()) as Record<string, unknown>;
  expect(response.status, JSON.stringify(body)).toBe(status);
  expect(response.headers.get("cache-control")).toBe("no-store");
  return body;
}

const routes = {
  list: () => import("../../../../packages/api/src/admin/workers/read"),
  commands: () => import("../../../../packages/api/src/admin/workers/commands"),
};
const params = (assignmentId: string) => ({
  params: Promise.resolve({ assignmentId }),
});

async function directory(who: Person) {
  const { GET } = await routes.list();
  const body = await answer(
    await GET(request(who, "GET", "/api/admin/workers")),
    200,
  );
  seen.push(body);
  return Object.fromEntries(
    (body.workers as Record<string, unknown>[]).map((w) => [
      w.assignmentId as string,
      w,
    ]),
  );
}
async function count(who: Person) {
  const { GET_UNREVIEWED_COUNT } = await routes.list();
  const body = await answer(
    await GET_UNREVIEWED_COUNT(
      request(who, "GET", "/api/admin/workers/unreviewed-count"),
    ),
    200,
  );
  seen.push(body);
  return body.count;
}
async function record(who: Person | null, assignmentId: string) {
  const { GET_RECORD } = await routes.list();
  return GET_RECORD(
    request(who, "GET", `/api/admin/workers/${assignmentId}`),
    params(assignmentId),
  );
}
type Command = "restrict" | "lift" | "confirm" | "reveal";
async function command(
  who: Person | null,
  name: Command,
  assignmentId: string,
  body: unknown,
  type?: string,
) {
  const handlers = await routes.commands();
  const handler = {
    restrict: handlers.POST_RESTRICT,
    lift: handlers.POST_LIFT,
    confirm: handlers.POST_CONFIRM,
    reveal: handlers.POST_REVEAL,
  }[name];
  return handler(
    request(
      who,
      "POST",
      `/api/admin/workers/${assignmentId}/${name}`,
      body,
      type,
    ),
    params(assignmentId),
  );
}

describe.skipIf(!required && ![url, database, anon, service].some(Boolean))(
  "AL-2678 WP5 part 2-r2b1: the worker's record through its routes with real tokens (T3) and a restriction at once on every surface (T4)",
  () => {
    let db: pg.Client;
    const publicEnv = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      publishable: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    };
    const parties = async () =>
      (
        await db.query(
          "select id, security_level, security_level_source, public_alias, do_not_publish from public.parties where tenant_id = any($1::uuid[]) order by id",
          [[TA, TB]],
        )
      ).rows;
    const reveals = async (party: string) =>
      (
        await db.query(
          "select details from public.audit_logs where action = 'worker_identity_revealed' and resource_id = $1",
          [party],
        )
      ).rows as { details: Record<string, unknown> }[];

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
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      for (const who of PEOPLE) {
        const credentials = {
          email: `r2b1-${who.toLowerCase()}-${TA}@example.test`,
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
        const sql = (text: string, values: unknown[] = []) =>
          db.query(
            text.replace(/:(\w+)/g, (_m, key: string) => {
              if (!(key in v)) throw Error(`no fixture value ${key}`);
              return `'${v[key]}'`;
            }),
            values,
          );
        await sql(
          `insert into public.tenants (id, name, slug) values (:TA, 'r2b1 A', 'r2b1-a-' || :TA), (:TB, 'r2b1 B', 'r2b1-b-' || :TB)`,
        );
        await sql(
          `insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values (:TA, :TA, 'A', 'US', 'usd', 'A'), (:TB, :TB, 'B', 'US', 'usd', 'B')`,
        );
        await sql(
          `delete from authz.memberships where user_id in (:A, :P, :D, :M, :B, :DS, :R, :C)`,
        );
        await sql(
          `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin) values
             (:mA, :A, :TA, 'staff', 'development', true), (:mP, :P, :TA, 'staff', 'member_care', false),
             (:mD, :D, :TA, 'donor', null, false), (:mM, :M, :TA, 'missionary', null, false),
             (:mB, :B, :TB, 'staff', 'development', true),
             (:mDSA, :DS, :TA, 'staff', 'finance', false), (:mDSB, :DS, :TB, 'staff', 'finance', false),
             (:mR, :R, :TA, 'missionary', null, false), (:mC, :C, :TA, 'missionary', null, false)`,
        );
        await sql(
          `update public.profiles set display_name = 'Profile Rowan', full_name = 'Profile Rowan', first_name = 'Profile Rowan', last_name = 'Profile Rowan' where id = :R;
           update public.profiles set display_name = 'Profile Cole', full_name = 'Profile Cole', first_name = 'Cole', last_name = 'Worker' where id = :C;
           update public.profiles set display_name = 'Donor Dee', full_name = 'Donor Dee', first_name = 'Donor', last_name = 'Dee' where id = :D`,
        );
        await sql(
          `insert into public.parties (id, tenant_id, display_name, security_level, security_level_source, public_alias) values
             (:pU, :TA, 'Worker Umber', 'standard', 'unreviewed_default', null),
             (:pK, :TA, 'Worker Kestrel', 'standard', 'manual', null),
             (:pV, :TA, 'Worker Vale', 'restricted', 'manual', 'Birch'),
             (:pR, :TA, 'Party Rowan', 'standard', 'manual', null),
             (:pC, :TA, 'Party Cole', 'standard', 'manual', null),
             (:pD, :TA, 'Donor Dee', 'standard', 'manual', null),
             (:pZ, :TB, 'Worker Zed', 'standard', 'manual', null)`,
        );
        await sql(
          `insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values
             (:wU, :TA, :pU, null, :TA), (:wK, :TA, :pK, null, :TA), (:wV, :TA, :pV, null, :TA),
             (:wR, :TA, :pR, :R, :TA), (:wC, :TA, :pC, :C, :TA), (:wZ, :TB, :pZ, null, :TB)`,
        );
        await sql(
          `insert into private.party_restricted (party_id, tenant_id, legal_name, real_country, precise_location) values
             (:pK, :TA, 'Legal Kestrel', 'Country Kestrel', 'Place Kestrel'),
             (:pV, :TA, 'Legal Vale', 'Country Vale', 'Place Vale'),
             (:pR, :TA, 'Legal Rowan', 'Country Rowan', 'Place Rowan'),
             (:pZ, :TB, 'Legal Zed', 'Country Zed', 'Place Zed')`,
        );
        await sql(
          `insert into public.account_links (tenant_id, user_id, party_id, linked_via) values
             (:TA, :R, :pR, 'profile_backfill'), (:TA, :C, :pC, 'profile_backfill'), (:TA, :D, :pD, 'profile_backfill')`,
        );
        await sql(
          `insert into public.donors (id, tenant_id, party_id, profile_id, missionary_id, giving_preferences, name, email) values
             (:dD, :TA, :pD, :D, :R, '{"defaultAnonymousToRecipient": false}', 'Donor Dee', 'r2b1-dee-' || :dD || '@example.test'),
             (:dR, :TA, :pR, :R, :C, '{"defaultAnonymousToRecipient": false}', 'Donor Rowan', 'r2b1-rowan-' || :dR || '@example.test')`,
        );
        await sql(
          `insert into public.donations (id, tenant_id, donor_id, missionary_id, amount, status, gift_date) values
             (:gD, :TA, :dD, :wR, 1000, 'completed', '2026-11-01'), (:gR, :TA, :dR, :wC, 2000, 'completed', '2026-11-02')`,
        );
        await sql(
          `insert into public.posts (id, tenant_id, missionary_id, content, visibility, status) values (:postR, :TA, :R, 'From R', 'public', 'published')`,
        );
        await sql(
          `insert into public.post_comments (post_id, user_id, content) values (:postR, :R, 'r2b1 R'), (:postR, :D, 'r2b1 D')`,
        );
        await sql(
          `insert into public.contribution_receipt_snapshots (id, tenant_id, donation_id, kind, content) values (:snap, :TA, :gD, 'pdf', $1)`,
          [
            JSON.stringify({
              version: 1,
              donationId: id.gD,
              donorName: "Donor Dee",
              giftDate: "2026-11-01",
              currencyCode: "USD",
              effective: {
                amountCents: 1000,
                fundId: null,
                missionaryId: id.wR,
                paymentStatus: "completed",
              },
              designationLines: [
                {
                  id: "line-R",
                  amountCents: 1000,
                  fundId: null,
                  fundName: "Fund R",
                  missionaryId: id.wR,
                  missionaryName: "Profile Rowan",
                  memo: "Memo R",
                },
              ],
              affectedFields: ["amount"],
              adjustmentId: null,
              generatedAt: "2026-11-02T00:00:00.000Z",
            }),
          ],
        );
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      }
    });

    afterAll(async () => {
      restoreEnv("NEXT_PUBLIC_SUPABASE_URL", publicEnv.url);
      restoreEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", publicEnv.anonKey);
      restoreEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", publicEnv.publishable);
      try {
        if (db)
          try {
            await db.query("rollback").catch(() => undefined);
            await db.query("begin");
            try {
              for (const statement of [
                "delete from public.audit_logs where tenant_id = any($1::uuid[])",
                "delete from public.contribution_receipt_snapshots where tenant_id = any($1::uuid[])",
                "delete from public.post_comments where post_id in (select id from public.posts where tenant_id = any($1::uuid[]))",
                "delete from public.posts where tenant_id = any($1::uuid[])",
                "delete from public.account_links where tenant_id = any($1::uuid[])",
                "delete from private.party_restricted where tenant_id = any($1::uuid[])",
                "delete from public.donations where tenant_id = any($1::uuid[])",
                "delete from public.giving_target_entity_locks where tenant_id = any($1::uuid[])",
                "delete from public.donors where tenant_id = any($1::uuid[])",
                "delete from public.missionaries where tenant_id = any($1::uuid[])",
                "delete from public.parties where tenant_id = any($1::uuid[])",
                "delete from public.legal_entities where tenant_id = any($1::uuid[])",
                "delete from authz.memberships where tenant_id = any($1::uuid[])",
                "delete from public.tenants where id = any($1::uuid[])",
              ])
                await db.query(statement, [[TA, TB]]);
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

    it("T3 an administrator reads the directory and the count, confirms U (Q12: badge, filter and count clear together), restricts K with an alias, lifts K, and reveals K with exactly one audit row; a second confirm of U is 409 LEVEL_CHANGED", async () => {
      const who = as("A");
      const before = await directory(who);
      expect(Object.keys(before)).toEqual(
        expect.arrayContaining([id.wU, id.wK, id.wV, id.wR, id.wC]),
      );
      expect(Object.keys(before)).not.toContain(id.wZ);
      expect(before[id.wU!]).toMatchObject({
        securityLevelSource: "unreviewed_default",
        hasLegalIdentity: false,
      });
      expect(before[id.wK!]).toMatchObject({ hasLegalIdentity: true });
      expect(await count(who)).toBe(1);
      const k = await answer(await record(who, id.wK!), 200);
      expect(k.worker).toMatchObject({
        assignmentId: id.wK,
        partyId: id.pK,
        displayName: "Worker Kestrel",
      });

      const confirmed = await answer(
        await command(who, "confirm", id.wU!, {
          level: "standard",
          reason: "Reviewed with the field director",
        }),
        200,
      );
      expect(confirmed.worker).toMatchObject({
        securityLevel: "standard",
        securityLevelSource: "manual",
      });
      expect(await count(who)).toBe(0);
      expect((await directory(who))[id.wU!]).toMatchObject({
        securityLevelSource: "manual",
      });
      expect(
        await answer(
          await command(who, "confirm", id.wU!, {
            level: "standard",
            reason: "Again",
          }),
          409,
        ),
      ).toMatchObject({
        error: "This worker's level has changed. Reload to see it.",
        code: "LEVEL_CHANGED",
      });

      const restricted = await answer(
        await command(who, "restrict", id.wK!, {
          level: "restricted",
          alias: "Heron",
          reason: "Field security",
        }),
        200,
      );
      expect(restricted.worker).toMatchObject({
        securityLevel: "restricted",
        publicAlias: "Heron",
      });
      const lifted = await answer(
        await command(who, "lift", id.wK!, {
          level: "standard",
          reason: "Back home",
        }),
        200,
      );
      expect(lifted.worker).toMatchObject({
        securityLevel: "standard",
        publicAlias: "Heron",
      });

      const keptAlias = await answer(
        await command(who, "restrict", id.wV!, {
          doNotPublish: true,
          reason: "Hold publishing",
        }),
        200,
      );
      expect(keptAlias.worker).toMatchObject({
        publicAlias: "Birch",
        doNotPublish: true,
        securityLevel: "restricted",
      });

      expect(await reveals(id.pK!)).toEqual([]);
      const revealed = await answer(
        await command(who, "reveal", id.wK!, { reason: "Visa paperwork" }),
        200,
      );
      expect(revealed).toEqual({
        legalName: "Legal Kestrel",
        realCountry: "Country Kestrel",
        preciseLocation: "Place Kestrel",
      });
      const audit = await reveals(id.pK!);
      expect(audit).toEqual([
        { details: { reason: "Visa paperwork", assignment_id: id.mA } },
      ]);
      seen.push(confirmed, restricted, lifted, keptAlias, k);
    });

    it("T3 plain staff read both pages with hasLegalIdentity null and are refused every command with 403 NOT_PERMITTED and the fixed text; nothing changes", async () => {
      const who = as("P");
      const rows = await directory(who);
      for (const row of Object.values(rows))
        expect(row.hasLegalIdentity).toBeNull();
      const k = await answer(await record(who, id.wK!), 200);
      expect((k.worker as Record<string, unknown>).hasLegalIdentity).toBeNull();
      expect(typeof (await count(who))).toBe("number");
      const state = await parties();
      for (const [name, body] of [
        ["restrict", { level: "high_risk", alias: "Owl", reason: "x" }],
        ["lift", { clearDoNotPublish: true, reason: "x" }],
        ["confirm", { level: "standard", reason: "x" }],
        ["reveal", { reason: "x" }],
      ] as const) {
        const refused = await answer(
          await command(who, name, id.wK!, body),
          403,
        );
        expect(refused, name).toMatchObject({
          error: NOT_PERMITTED,
          code: "NOT_PERMITTED",
        });
        seen.push(refused);
      }
      expect(await parties()).toEqual(state);
      expect(await reveals(id.pK!)).toHaveLength(1);
      seen.push(rows, k);
    });

    it("T3 another organization's administrator gets 404 for the organization's worker, on the record and on a command, and changes nothing; a person with staff rows in both reads each organization's workers under its own selection only", async () => {
      const who = as("B");
      const state = await parties();
      expect(Object.keys(await directory(who))).toEqual([id.wZ]);
      for (const response of [
        await record(who, id.wK!),
        await command(who, "restrict", id.wK!, {
          level: "high_risk",
          alias: "Owl",
          reason: "x",
        }),
        await command(who, "reveal", id.wK!, { reason: "x" }),
      ])
        expect(await answer(response, 404)).toMatchObject({
          error: "Worker not found.",
          code: "NOT_FOUND",
        });
      expect(await parties()).toEqual(state);
      as("DSA");
      const inA = Object.keys(await directory("DS"));
      as("DSB");
      const inB = Object.keys(await directory("DS"));
      expect(inA).toEqual(expect.arrayContaining([id.wU, id.wK, id.wV]));
      expect(inA).not.toContain(id.wZ);
      expect(inB).toEqual([id.wZ]);
    });

    it("T3 every refusal the routes can reach answers its status, fixed text and code with no-store, withOperation's own 401 and 403 included", async () => {
      s.auth = { isAuthenticated: false, memberships: [] };
      for (const response of [
        await record(null, id.wK!),
        await command(null, "reveal", id.wK!, { reason: "x" }),
      ]) {
        const refused = await answer(response, 401);
        expect(refused).toEqual({
          error: "Unauthorized",
          requestId: expect.any(String),
        });
        seen.push(refused);
      }
      as("D");
      const staffOnly = await answer(await record("D", id.wK!), 403);
      expect(staffOnly.error).toBe("Forbidden: requires a staff membership");
      expect(staffOnly.code).toBeUndefined();
      const who = as("A");
      const cases: [Command, string, unknown, number, string, string?][] = [
        ["reveal", "not-a-uuid", { reason: "x" }, 404, "NOT_FOUND"],
        ["reveal", randomUUID(), { reason: "x" }, 404, "NOT_FOUND"],
        ["reveal", id.wU!, { reason: "x" }, 404, "NO_IDENTITY"],
        [
          "restrict",
          id.wK!,
          { level: "high_risk", reason: "  " },
          400,
          "REASON_REQUIRED",
        ],
        [
          "restrict",
          id.wK!,
          { level: "high_risk", reason: "\u200b\u2060" },
          400,
          "REASON_REQUIRED",
        ],
        ["restrict", id.wK!, { reason: "x" }, 400, "NOTHING_TO_CHANGE"],
        [
          "lift",
          id.wK!,
          { level: "high_risk", reason: "x" },
          409,
          "LEVEL_CHANGED",
        ],
        [
          "restrict",
          id.wV!,
          { level: "sensitive", reason: "x" },
          409,
          "LEVEL_CHANGED",
        ],
        [
          "restrict",
          id.wU!,
          { level: "restricted", reason: "x" },
          400,
          "ALIAS_REQUIRED",
        ],
        [
          "restrict",
          id.wK!,
          { level: "restricted", alias: "legal kestrel", reason: "x" },
          400,
          "ALIAS_IS_LEGAL_NAME",
        ],
        [
          "restrict",
          id.wK!,
          { level: "high_risk", alias: "Owl", reason: "x", tenantId: TB },
          400,
          "INVALID_INPUT",
        ],
        ["reveal", id.wK!, "x", 415, "INVALID_INPUT", "text/plain"],
      ];
      const state = await parties();
      for (const [name, target, body, status, code, type] of cases) {
        const refused = await answer(
          await command(who, name, target, body, type),
          status,
        );
        expect(refused, `${name} ${code}`).toEqual({
          error: REFUSAL_TEXT[code],
          code,
          requestId: expect.any(String),
        });
        seen.push(refused);
      }
      expect(await parties()).toEqual(state);
      expect(await reveals(id.pU!)).toEqual([]);
    });

    it("T4 a restriction through the route holds at once on every surface r1, r2a and r2s cover: the donor portal, the feed, comments, GET /api/donations, GraphQL, a stored receipt rendered again, and the colleague's Partners; none shows the legal identity, the profile name or the Party name", async () => {
      const forbidden = ["Profile Rowan", "Party Rowan", "Donor Rowan"];
      as("A");
      const restricted = await answer(
        await command("A", "restrict", id.wR!, {
          level: "restricted",
          alias: "Wren",
          reason: "Field security",
        }),
        200,
      );
      expect(restricted.worker).toMatchObject({
        securityLevel: "restricted",
        publicAlias: "Wren",
      });

      as("D");
      const portal = (await (
        await getDonorPortal(request("D", "GET", "/api/donor-portal"))
      ).json()) as Record<string, unknown>;
      expect(JSON.stringify(portal)).toContain("Wren");
      absent(portal, forbidden);

      const feed = await getFeed(
        request("D", "GET", `/api/posts?missionaryId=${user.R}`),
      );
      const feedBody = (await feed.json()) as {
        posts?: Record<string, unknown>[];
      };
      expect(feed.status, JSON.stringify(feedBody)).toBe(200);
      const post = (feedBody.posts ?? []).find((p) => p.id === id.postR);
      expect(post && postAuthorName(post as never)).toBe("Wren");
      absent(feedBody, forbidden);

      const comments = await getComments(
        request("D", "GET", `/api/posts/${id.postR}/comments`),
        { params: Promise.resolve({ postId: id.postR! }) },
      );
      const commentsBody = (await comments.json()) as {
        comments?: {
          user_id: string;
          user: { first_name: string; avatar_url: string | null };
        }[];
      };
      expect(comments.status, JSON.stringify(commentsBody)).toBe(200);
      expect(
        (commentsBody.comments ?? []).find((c) => c.user_id === user.R)?.user,
      ).toMatchObject({ first_name: "Wren", avatar_url: null });
      absent(commentsBody, forbidden);

      const donations = await getDonations(
        request("D", "GET", "/api/donations"),
      );
      const donationsBody = (await donations.json()) as {
        donations?: {
          id: string;
          missionary: { worker_public_name: string | null };
        }[];
      };
      expect(donations.status, JSON.stringify(donationsBody)).toBe(200);
      expect(
        (donationsBody.donations ?? []).find((d) => d.id === id.gD)?.missionary
          .worker_public_name,
      ).toBe("Wren");
      absent(donationsBody, forbidden);

      const graph = (await (
        await createGraphQLHandler().POST(
          new Request("http://localhost/api/graphql", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              query:
                "{ myDonations(limit: 10) { id missionary { id publicName } } }",
            }),
          }),
        )
      ).json()) as {
        data?: {
          myDonations: { id: string; missionary: { publicName: string } }[];
        };
        errors?: unknown;
      };
      expect(graph.errors, JSON.stringify(graph.errors)).toBeUndefined();
      expect(
        graph.data!.myDonations.find((d) => d.id === id.gD)?.missionary
          .publicName,
      ).toBe("Wren");
      absent(graph, forbidden);

      const html: string[] = [];
      await renderContributionReceiptSnapshotPdf({
        supabaseAdmin: createClient(url!, service!, {
          auth: { persistSession: false, autoRefreshToken: false },
        }) as never,
        tenantId: TA,
        snapshotId: id.snap!,
        docraptorClient: {
          async renderSync(input: { html: string }) {
            html.push(input.html);
            return {
              kind: "sync",
              pdf: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
              contentType: "application/pdf",
              request: {},
            };
          },
        } as unknown as DocRaptorClient,
      });
      expect(html).toHaveLength(1);
      expect(html[0]).toContain("Wren");
      absent(html, forbidden);

      as("C");
      const partnersBody = (await (
        await partners.GET(request("C", "GET", "/api/missionary/donors"))
      ).json()) as { donors?: Record<string, unknown>[] };
      expect(
        (partnersBody.donors ?? []).find((d) => d.id === id.dR),
      ).toMatchObject({ name: "Anonymous partner", is_anonymous: true });
      absent(partnersBody, forbidden);
    });

    it("T4b (review fix) an update whose alias is blank or invisible-only keeps the stored alias, so the public name stays the alias across that update, an audited reveal and a lift, and the profile name is never shown", async () => {
      const forbidden = ["Profile Rowan", "Party Rowan", "Donor Rowan"];
      const publicName = async () => {
        as("D");
        const donations = (await (
          await getDonations(request("D", "GET", "/api/donations"))
        ).json()) as {
          donations?: {
            id: string;
            missionary: { worker_public_name: string | null };
          }[];
        };
        const feed = (await (
          await getFeed(
            request("D", "GET", `/api/posts?missionaryId=${user.R}`),
          )
        ).json()) as { posts?: Record<string, unknown>[] };
        absent([donations, feed], forbidden);
        const post = (feed.posts ?? []).find((p) => p.id === id.postR);
        return [
          (donations.donations ?? []).find((d) => d.id === id.gD)?.missionary
            .worker_public_name,
          post && postAuthorName(post as never),
        ];
      };
      as("A");
      const lowered = await answer(
        await command("A", "lift", id.wR!, {
          level: "standard",
          reason: "Back home",
        }),
        200,
      );
      expect(lowered.worker).toMatchObject({
        securityLevel: "standard",
        publicAlias: "Wren",
      });
      expect(await publicName()).toEqual(["Wren", "Wren"]);

      as("A");
      const updated = await answer(
        await command("A", "restrict", id.wR!, {
          doNotPublish: true,
          alias: "\u200b\u2060 \u00a0\ufeff",
          reason: "Hold publishing",
        }),
        200,
      );
      expect(updated.worker).toMatchObject({
        securityLevel: "standard",
        publicAlias: "Wren",
        doNotPublish: true,
      });
      expect(await publicName()).toEqual(["Wren", "Wren"]);

      as("A");
      const disclosed = await answer(
        await command("A", "reveal", id.wR!, { reason: "Visa paperwork" }),
        200,
      );
      expect(disclosed.legalName).toBe("Legal Rowan");
      const afterReveal = await answer(await record("A", id.wR!), 200);
      expect(afterReveal.worker).toMatchObject({ publicAlias: "Wren" });

      const cleared = await answer(
        await command("A", "lift", id.wR!, {
          clearDoNotPublish: true,
          reason: "Publishing allowed",
        }),
        200,
      );
      expect(cleared.worker).toMatchObject({
        publicAlias: "Wren",
        doNotPublish: false,
      });
      expect(await publicName()).toEqual(["Wren", "Wren"]);
      seen.push(lowered, updated, afterReveal, cleared);
    });

    it("T3 the revealed values reach no other response", () => {
      expect(seen.length).toBeGreaterThan(10);
      absent(seen);
    });
  },
);
