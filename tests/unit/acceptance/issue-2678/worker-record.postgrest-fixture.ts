import { randomUUID } from "node:crypto";

import pg from "pg";
import { expect } from "vitest";

export const url = process.env.WP5_IDENTITY_IT_URL;
export const database = process.env.WP5_IDENTITY_IT_DATABASE_URL;
export const anon = process.env.WP5_IDENTITY_IT_ANON_KEY;
export const service = process.env.WP5_IDENTITY_IT_SERVICE_KEY;
export const required = process.env.GITHUB_JOB === "local-supabase";

let authSink: (auth: unknown) => void = () => {};
export function onAuth(sink: (auth: unknown) => void) {
  authSink = sink;
}

export const PEOPLE = ["A", "P", "D", "M", "B", "DS", "R", "C"] as const;
export type Person = (typeof PEOPLE)[number];
export const TA = randomUUID();
export const TB = randomUUID();
export const id = Object.fromEntries(
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
    "pS",
    "pN",
    "pE",
    "pX",
    "pY",
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
export const user = {} as Record<Person, string>;
export const token = {} as Record<Person, string>;
const extra: string[] = [];

export const IDENTITY = [
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
export const IDENTITY_KEYS = [
  "legal_name",
  "legalname",
  "real_country",
  "realcountry",
  "precise_location",
  "preciselocation",
];
export const NOT_PERMITTED =
  "Only staff with the Restrict publication permission can change these settings.";
export const REFUSAL_TEXT: Record<string, string> = {
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

export function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

export function absent(value: unknown, extra: string[] = []) {
  const text = JSON.stringify(value).toLowerCase();
  for (const word of [...IDENTITY, ...extra])
    expect(text, `the body holds ${word}`).not.toContain(word.toLowerCase());
  for (const key of IDENTITY_KEYS)
    expect(text, `the body holds the key ${key}`).not.toContain(`"${key}"`);
}

export async function api(
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

export async function rpc(name: string, body: Record<string, unknown>) {
  const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: anon!,
      Authorization: `Bearer ${token.A}`,
      "Content-Type": "application/json",
      "x-asym-tenant": TA,
      "x-asym-assignment": id.mA!,
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  return {
    status: response.status,
    body: text ? (JSON.parse(text) as Record<string, unknown>) : null,
  };
}

export type Role = "staff" | "missionary" | "donor";
export const contexts: Record<
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

export function as(key: keyof typeof contexts) {
  const c = contexts[key]!;
  authSink({
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
  });
  return c.who;
}

let db: pg.Client | undefined;
const publicEnv = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  publishable: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
};

export async function provisionWorkerRecordStack(): Promise<pg.Client> {
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
         (:pZ, :TB, 'Worker Zed', 'standard', 'manual', null),
         (:pS, :TA, 'Worker Sorrel', 'standard', 'manual', 'Ash'),
         (:pN, :TA, 'Worker Nettle', 'standard', 'manual', 'Ash'),
         (:pE, :TA, 'Worker Esker', 'standard', 'manual', 'Ash'),
         (:pX, :TA, 'Worker Xylem', 'restricted', 'manual', 'Elm'),
         (:pY, :TA, 'Worker Yew', 'standard', 'manual', null)`,
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
      `update public.posts set review_state = 'approved' where id = :postR`,
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
  return db!;
}

export async function freshLogin(tag: string) {
  const credentials = {
    email: `r2b1-${tag}-${randomUUID()}@example.test`,
    password: randomUUID(),
  };
  const created = await api("auth/v1/admin/users", {
    key: service,
    bearer: service,
    body: { ...credentials, email_confirm: true },
  });
  expect(created.ok, `Auth fixture ${tag}: ${created.status}`).toBe(true);
  const userId = (await created.json()).id as string;
  extra.push(userId);
  const login = await api("auth/v1/token?grant_type=password", {
    body: credentials,
  });
  expect(login.ok, `Sign-in ${tag}: ${login.status}`).toBe(true);
  return {
    userId,
    email: credentials.email,
    bearer: (await login.json()).access_token as string,
  };
}

export async function cleanupWorkerRecordStack() {
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
            "delete from public.membership_invitations where tenant_id = any($1::uuid[])",
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
    const logins: [string, string][] = [
      ...PEOPLE.filter((who) => user[who]).map((who): [string, string] => [
        who,
        user[who],
      ]),
      ...extra.map((userId): [string, string] => [userId, userId]),
    ];
    for (const [who, userId] of logins)
      try {
        const deleted = await api(`auth/v1/admin/users/${userId}`, {
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
}
