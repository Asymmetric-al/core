import { randomUUID } from "node:crypto";

import {
  attempt,
  removeTwoTenants,
  role,
  uniqueEmail,
  type Attempt,
  type Fixture,
  type Side,
} from "./wp8a-rest1-harness";

import type pg from "pg";

export * from "./wp8a-rest1-harness";

export type Hosts = { site: string; siteId: string; home: string };

const hostOf = (label: string) =>
  `${label}-${randomUUID().slice(0, 8)}.give.example.test`;

const PROOFS =
  "control_proved_at, attached_at, routing_proved_at, https_proved_at, sign_in_ready_at, activation_proved_at";

export async function admitHosts(db: pg.Client, side: Side): Promise<Hosts> {
  await role(db, null);
  const siteId = (
    await db.query(
      "INSERT INTO public.sites (tenant_id, name) VALUES ($1, 'Rest 2a Site') RETURNING id",
      [side.tenant],
    )
  ).rows[0].id as string;
  const site = hostOf("site");
  const home = hostOf("home");
  await db.query(
    `INSERT INTO public.site_domains (host, tenant_id, site_id, surfaces, expected_project, ${PROOFS})
     VALUES ($1, $2, $3, ARRAY['website'], 'donor', now(), now(), now(), now(), now(), now()),
            ($4, $2, NULL, ARRAY['donor_account'], 'donor', now(), now(), now(), now(), now(), now())`,
    [site, side.tenant, siteId, home],
  );
  await db.query(
    "INSERT INTO public.donor_portal_hosts (tenant_id, primary_domain) VALUES ($1, $2)",
    [side.tenant, home],
  );
  return { site, siteId, home };
}

export async function readyOnlyHost(db: pg.Client, side: Side) {
  await role(db, null);
  const siteId = (
    await db.query(
      "INSERT INTO public.sites (tenant_id, name) VALUES ($1, 'Rest 2a ready Site') RETURNING id",
      [side.tenant],
    )
  ).rows[0].id as string;
  const host = hostOf("ready");
  await db.query(
    `INSERT INTO public.site_domains (host, tenant_id, site_id, surfaces, expected_project,
       control_proved_at, attached_at, routing_proved_at, https_proved_at, sign_in_ready_at)
     VALUES ($1, $2, $3, ARRAY['website'], 'donor', now(), now(), now(), now(), now())`,
    [host, side.tenant, siteId],
  );
  return host;
}

export type GiftLine = { fund?: string; missionary?: string; amount: number };

export type GiftRequest = {
  host: string;
  surface?: string;
  key?: string;
  lines: GiftLine[];
  fee?: number;
  method?: string | null;
  anonymous?: boolean | null;
  source?: string | null;
  contact?: Record<string, unknown> | null;
  actor?: Record<string, unknown> | null;
};

export const BEGIN_SQL =
  "SELECT public.begin_line_gift($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9::jsonb, $10::jsonb) AS r";

export const guestContact = () => ({
  email: uniqueEmail("guest"),
  first_name: "Gail",
  last_name: `Guest ${randomUUID().slice(0, 6)}`,
});

export function beginArgs(r: GiftRequest) {
  return [
    r.host,
    r.surface ?? "website",
    r.key ?? randomUUID(),
    JSON.stringify(
      r.lines.map((l) =>
        l.missionary
          ? { missionary_id: l.missionary, amount: l.amount }
          : { fund_id: l.fund, amount: l.amount },
      ),
    ),
    r.fee ?? 0,
    r.method === undefined ? "card" : r.method,
    r.anonymous === undefined ? false : r.anonymous,
    r.source ?? null,
    r.contact === null ? null : JSON.stringify(r.contact ?? guestContact()),
    r.actor ? JSON.stringify(r.actor) : null,
  ];
}

export async function begin(db: pg.Client, r: GiftRequest): Promise<Attempt> {
  await role(db, null);
  await db.query(
    "SELECT pg_catalog.set_config('app.current_tenant_id', '', true)",
  );
  await role(db, "service_role");
  const a = await attempt(db, BEGIN_SQL, beginArgs(r));
  await role(db, null);
  return a;
}

export function begun(a: Attempt) {
  if (!a.ok) throw new Error(`begin_line_gift refused: ${a.code} ${a.message}`);
  return a.rows[0]!.r as {
    outcome: string;
    donation_id: string;
    operation_id: string;
    tenant_id: string;
    amount: number;
    currency: string;
    provider_account: string;
  };
}

export async function intakeCounts(db: pg.Client, tenant: string) {
  await role(db, null);
  return (
    await db.query(
      `SELECT (SELECT count(*)::int FROM public.donations WHERE tenant_id = $1 AND intake_format = 'line_based') AS intakes,
              (SELECT count(*)::int FROM public.donation_intake_lines WHERE tenant_id = $1) AS lines,
              (SELECT count(*)::int FROM public.donation_intake_contacts WHERE tenant_id = $1) AS contacts,
              (SELECT count(*)::int FROM public.donation_saga_outbox WHERE tenant_id = $1 AND kind = 'provider_request') AS requests,
              (SELECT count(*)::int FROM public.donation_intake_requests WHERE tenant_id = $1) AS keys`,
      [tenant],
    )
  ).rows[0] as Record<string, number>;
}

export async function configFor(
  db: pg.Client,
  host: string,
  targets: Array<{ fund?: string; missionary?: string }>,
) {
  await role(db, null);
  await db.query("SAVEPOINT rest2a_config");
  try {
    await db.query("SET LOCAL ROLE anon");
    return (
      await db.query(
        "SELECT * FROM public.checkout_giving_config($1, $2::jsonb)",
        [
          host,
          JSON.stringify(
            targets.map((t) =>
              t.missionary
                ? { missionary_id: t.missionary }
                : { fund_id: t.fund },
            ),
          ),
        ],
      )
    ).rows as Record<string, unknown>[];
  } finally {
    await db.query("ROLLBACK TO SAVEPOINT rest2a_config");
  }
}

export async function rateToken(db: pg.Client, address: string) {
  await role(db, "service_role");
  const allowed = (
    await db.query("SELECT public.take_intake_rate_token($1) AS ok", [address])
  ).rows[0].ok as boolean;
  await role(db, null);
  return allowed;
}

export async function removeRest2aTenants(db: pg.Client, fx: Fixture) {
  const tenants = [fx.A.tenant, fx.B.tenant];
  await db.query("BEGIN");
  try {
    await db.query("SET LOCAL session_replication_role = replica");
    for (const table of [
      "public.donation_intake_requests",
      "public.site_domains",
      "public.donor_portal_hosts",
      "public.sites",
      "public.giving_source_codes",
    ])
      await db.query(`DELETE FROM ${table} WHERE tenant_id = ANY($1::uuid[])`, [
        tenants,
      ]);
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
  await removeTwoTenants(db, fx);
}
