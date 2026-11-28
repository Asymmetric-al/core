import { randomUUID } from "node:crypto";

import pg from "pg";

import {
  attempt,
  feeFund,
  removeTwoTenants,
  role,
  seedTwoTenants,
  uniqueEmail,
  type Attempt,
  type Fixture,
  type Side,
} from "./wp8a-rest1-harness";

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

export async function dualHost(db: pg.Client, side: Side, hosts: Hosts) {
  await role(db, null);
  const host = hostOf("both");
  await db.query(
    `INSERT INTO public.site_domains (host, tenant_id, site_id, surfaces, expected_project, ${PROOFS})
     VALUES ($1, $2, $3, ARRAY['website', 'donor_account'], 'donor', now(), now(), now(), now(), now(), now())`,
    [host, side.tenant, hosts.siteId],
  );
  await db.query(
    "UPDATE public.donor_portal_hosts SET primary_domain = $2 WHERE tenant_id = $1",
    [side.tenant, host],
  );
  return host;
}

export const verifiedActor = (email = uniqueEmail("signed")) => ({
  user_id: randomUUID(),
  email,
  email_confirmed: true,
});

export async function rest2aWorld(db: pg.Client) {
  const fx = await seedTwoTenants(db);
  const hostsA = await admitHosts(db, fx.A);
  const hostsB = await admitHosts(db, fx.B);
  const feeA = await feeFund(db, fx.A);
  await feeFund(db, fx.B);
  return { fx, A: fx.A, B: fx.B, hostsA, hostsB, feeA };
}

export async function intakeOf(db: pg.Client, donationId: string) {
  await role(db, null);
  return (
    await db.query(
      `SELECT intake_format, status, amount::int, currency, donor_id, site_id, entry_surface,
              source_code_id, unlisted_source_code, is_anonymous, payment_method,
              payment_account_binding_id, provider_account_ref, livemode, legal_entity_id
         FROM public.donations WHERE id = $1`,
      [donationId],
    )
  ).rows[0] as Record<string, unknown>;
}

export async function intakeLinesOf(db: pg.Client, donationId: string) {
  await role(db, null);
  return (
    await db.query(
      `SELECT line_number, fund_id, missionary_id, is_fee_cover, amount::int
         FROM public.donation_intake_lines WHERE donation_id = $1 ORDER BY line_number`,
      [donationId],
    )
  ).rows as Record<string, unknown>[];
}

export async function intakeContactOf(db: pg.Client, donationId: string) {
  await role(db, null);
  return (
    await db.query(
      `SELECT email, first_name, last_name, actor_user_id, actor_email, actor_email_confirmed
         FROM public.donation_intake_contacts WHERE donation_id = $1`,
      [donationId],
    )
  ).rows[0] as Record<string, unknown>;
}

export async function intakeRequestsOf(db: pg.Client, donationId: string) {
  await role(db, null);
  return (
    await db.query(
      `SELECT id, kind, request_kind, status, amount::int, donor_id, missionary_id, fund_id,
              provider_account_ref, livemode, request_params, idempotency_key
         FROM public.donation_saga_outbox WHERE donation_id = $1`,
      [donationId],
    )
  ).rows as Record<string, unknown>[];
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
  sourceSite?: string | null;
};

export const BEGIN_SQL =
  "SELECT public.begin_line_gift($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11::uuid) AS r";

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
      r.lines.map((l) => ({
        ...(l.fund === undefined ? {} : { fund_id: l.fund }),
        ...(l.missionary === undefined ? {} : { missionary_id: l.missionary }),
        amount: l.amount,
      })),
    ),
    r.fee ?? 0,
    r.method === undefined ? "card" : r.method,
    r.anonymous === undefined ? false : r.anonymous,
    r.source ?? null,
    r.contact === null ? null : JSON.stringify(r.contact ?? guestContact()),
    r.actor ? JSON.stringify(r.actor) : null,
    r.sourceSite ?? null,
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

export async function configRead(
  db: pg.Client,
  host: string,
  targets: Array<{ fund?: string; missionary?: string }>,
  surface = "website",
  sourceSite: string | null = null,
) {
  await role(db, null);
  await db.query("SAVEPOINT rest2a_config");
  try {
    await db.query("SET LOCAL ROLE anon");
    return (
      await db.query(
        "SELECT * FROM public.checkout_giving_config($1, $2::jsonb, $3, $4::uuid)",
        [
          host,
          JSON.stringify(
            targets.map((t) => ({
              ...(t.fund === undefined ? {} : { fund_id: t.fund }),
              ...(t.missionary === undefined
                ? {}
                : { missionary_id: t.missionary }),
            })),
          ),
          surface,
          sourceSite,
        ],
      )
    ).rows as Record<string, unknown>[];
  } finally {
    await db.query("ROLLBACK TO SAVEPOINT rest2a_config");
  }
}

export async function configFor(
  db: pg.Client,
  host: string,
  targets: Array<{ fund?: string; missionary?: string }>,
  surface = "website",
) {
  return (await configRead(db, host, targets, surface)).map((row) => ({
    connected_account_id: row.connected_account_id,
  }));
}

export type AttemptRequest = {
  host: string;
  surface?: string;
  address: string;
  key?: string;
  user?: string | null;
};

export type AttemptAnswer = {
  admitted: boolean;
  retry_after_seconds: number | null;
};

export const ATTEMPT_SQL =
  "SELECT public.take_intake_attempt($1, $2, $3, $4, $5::uuid) AS r";

export const attemptArgs = (r: AttemptRequest) => [
  r.host,
  r.surface ?? "website",
  r.address,
  r.key ?? randomUUID(),
  r.user ?? null,
];

export async function attemptGift(
  db: pg.Client,
  r: AttemptRequest,
): Promise<AttemptAnswer> {
  await role(db, "service_role");
  const answer = (await db.query(ATTEMPT_SQL, attemptArgs(r))).rows[0]
    .r as AttemptAnswer;
  await role(db, null);
  return answer;
}

type Answer =
  | { ok: true; rows: Array<Record<string, unknown>> }
  | { ok: false; code?: string; message?: string };

export function launch(
  client: pg.Client,
  sql: string,
  params: unknown[] = [],
): Promise<Answer> {
  return client.query(sql, params).then(
    (res) => ({ ok: true as const, rows: res.rows }),
    (e: { code?: string; message?: string }) => ({
      ok: false as const,
      code: e.code,
      message: e.message,
    }),
  );
}

export const said = (a: Answer) =>
  a.ok ? "committed" : `${a.code} ${a.message}`;

export async function blockedBy(db: pg.Client, pid: number) {
  for (let i = 0; i < 100; i += 1) {
    const blockers = (await db.query("SELECT pg_blocking_pids($1) AS b", [pid]))
      .rows[0].b as number[];
    if (blockers.length > 0) return true;
    await new Promise((r) => setTimeout(r, 50));
  }
  return false;
}

export const pidOf = async (client: pg.Client) =>
  (await client.query("SELECT pg_backend_pid() AS p")).rows[0].p as number;

export async function committedWorld(db: pg.Client) {
  await db.query("BEGIN");
  try {
    const fx = await seedTwoTenants(db);
    const hosts = await admitHosts(db, fx.A);
    await db.query("COMMIT");
    return { fx, hosts };
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}

export async function twoSessions<T>(
  db: pg.Client,
  url: string,
  fn: (s1: pg.Client, s2: pg.Client, fx: Fixture, hosts: Hosts) => Promise<T>,
): Promise<T> {
  const s1 = new pg.Client({ connectionString: url });
  const s2 = new pg.Client({ connectionString: url });
  const opened: pg.Client[] = [];
  let fx: Fixture | undefined;
  try {
    await s1.connect();
    opened.push(s1);
    await s2.connect();
    opened.push(s2);
    const world = await committedWorld(db);
    fx = world.fx;
    return await fn(s1, s2, world.fx, world.hosts);
  } finally {
    await Promise.all(
      opened.map((client) => client.end().catch(() => undefined)),
    );
    await db.query("ROLLBACK").catch(() => undefined);
    if (fx) await removeRest2aTenants(db, fx);
  }
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

export async function secondEntityBinding(db: pg.Client, side: Side) {
  await role(db, null);
  const account = `acct_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
  const intent = randomUUID();
  const binding = randomUUID();
  const fund = randomUUID();
  await db.query(
    `INSERT INTO public.payment_onboarding_intents
       (id, tenant_id, legal_entity_id, livemode, version, status, reason, created_by, assignment_id,
        provider_account_id, confirmed_at, confirmed_by_event)
     VALUES ($1, $2, $3, false, 1, 'confirmed', 'Second entity', gen_random_uuid(), gen_random_uuid(),
             $4, now(), 'evt_rest2a_second')`,
    [intent, side.tenant, side.otherEntity, account],
  );
  await db.query(
    `INSERT INTO public.payment_provider_accounts
       (tenant_id, legal_entity_id, provider_account_id, livemode, onboarding_intent_id, confirmed_at)
     VALUES ($1, $2, $3, false, $4, now())`,
    [side.tenant, side.otherEntity, account, intent],
  );
  await db.query(
    `INSERT INTO public.payment_account_bindings
       (id, tenant_id, legal_entity_id, version, status, provider_account_ref, livemode,
        onboarding_intent_id, activated_at)
     VALUES ($1, $2, $3, 1, 'active', $4, false, $5, now())`,
    [binding, side.tenant, side.otherEntity, account, intent],
  );
  await db.query(
    "INSERT INTO public.funds (id, tenant_id, legal_entity_id, name) VALUES ($1, $2, $3, 'Second entity fund')",
    [fund, side.tenant, side.otherEntity],
  );
  return { account, binding, fund };
}
