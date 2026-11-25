import { randomUUID } from "node:crypto";

import type pg from "pg";

export { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2674/harness";

export type Row = Record<string, unknown>;
export type Outcome = Record<string, unknown>;
export type Attempt = {
  ok: boolean;
  rows: Row[];
  code?: string;
  message?: string;
  constraint?: string;
};

export const account = () =>
  `acct_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
export const paymentIntent = () =>
  `pi_${randomUUID().replaceAll("-", "").slice(0, 24)}`;

export const GUARD_TEST_GRANTS = [
  "GRANT INSERT ON TABLE public.donations, public.donation_saga_outbox TO tenant_guard",
  "GRANT EXECUTE ON FUNCTION public.normalize_currency_code(text) TO tenant_guard",
];

export const GUARD_UPDATE_GRANTS = [
  "GRANT UPDATE ON TABLE public.donations, public.donation_saga_outbox TO tenant_guard",
];

export const HOSTED_SERVICE_GRANTS = [
  "GRANT INSERT, UPDATE, DELETE ON TABLE public.donations, public.donation_saga_outbox, public.donors, public.audit_logs TO service_role",
];

export const PROVIDER_STATUSES = [
  "queued",
  "sending",
  "retry_wait",
  "parked",
  "linked",
  "refused",
  "dead_letter",
  "adopted",
  "abandoned",
] as const;
export type ProviderStatus = (typeof PROVIDER_STATUSES)[number];

export async function inTx<T>(db: pg.Client, fn: () => Promise<T>) {
  await db.query("BEGIN");
  try {
    return await fn();
  } finally {
    await db.query("ROLLBACK");
  }
}

export async function role(db: pg.Client, name: string | null) {
  await db.query(name ? `SET LOCAL ROLE ${name}` : "RESET ROLE");
}

export async function attempt(
  db: pg.Client,
  sql: string,
  params: unknown[] = [],
): Promise<Attempt> {
  await db.query("SAVEPOINT r1a_attempt");
  try {
    const result = await db.query(sql, params);
    await db.query("RELEASE SAVEPOINT r1a_attempt");
    return { ok: true, rows: result.rows as Row[] };
  } catch (error) {
    await db.query("ROLLBACK TO SAVEPOINT r1a_attempt");
    const e = error as { code?: string; message?: string; constraint?: string };
    return {
      ok: false,
      rows: [],
      code: e.code,
      message: e.message,
      constraint: e.constraint,
    };
  }
}

export const refusal = (a: Attempt) => `${a.code} ${a.message}`;

export async function grant(db: pg.Client, statements: string[]) {
  await role(db, null);
  await db.query(
    "SELECT pg_advisory_xact_lock(hashtext('wp8a-p2r1a test grants'))",
  );
  for (const statement of statements) await db.query(statement);
}

export async function enterAs(
  db: pg.Client,
  roleName: string,
  tenantId: string,
) {
  await role(db, null);
  await db.query(
    "SELECT pg_catalog.set_config('app.current_tenant_id', '', true)",
  );
  await role(db, roleName);
  if (roleName === "tenant_guard")
    await db.query("SELECT tenant_guard.enter($1::uuid)", [tenantId]);
}

export type Side = {
  tenant: string;
  entity: string;
  otherEntity: string;
  account: string;
  binding: string;
};
export type Fixture = { A: Side; B: Side };

export async function seedTwoTenants(db: pg.Client): Promise<Fixture> {
  const side = (): Side => ({
    tenant: randomUUID(),
    entity: randomUUID(),
    otherEntity: randomUUID(),
    account: account(),
    binding: randomUUID(),
  });
  const fx = { A: side(), B: side() };
  await role(db, null);
  for (const [label, s] of Object.entries(fx)) {
    const intent = randomUUID();
    await db.query(
      "INSERT INTO public.tenants (id, name, slug) VALUES ($1::uuid, $2, $1::uuid::text)",
      [s.tenant, `R1a ${label}`],
    );
    await db.query(
      `INSERT INTO public.legal_entities (id, tenant_id, name, country_code, currency, legal_name)
       VALUES ($1, $3, 'R1a entity', 'US', 'usd', 'R1a Legal Inc.'),
              ($2, $3, 'R1a second entity', 'US', 'usd', 'R1a Second Inc.')`,
      [s.entity, s.otherEntity, s.tenant],
    );
    await db.query(
      `INSERT INTO public.payment_onboarding_intents
         (id, tenant_id, legal_entity_id, livemode, version, status, reason, created_by, assignment_id,
          provider_account_id, confirmed_at, confirmed_by_event)
       VALUES ($1, $2, $3, false, 1, 'confirmed', 'R1a fixture', gen_random_uuid(), gen_random_uuid(),
               $4, now(), 'evt_r1a')`,
      [intent, s.tenant, s.entity, s.account],
    );
    await db.query(
      `INSERT INTO public.payment_provider_accounts
         (tenant_id, legal_entity_id, provider_account_id, livemode, onboarding_intent_id, confirmed_at)
       VALUES ($1, $2, $3, false, $4, now())`,
      [s.tenant, s.entity, s.account, intent],
    );
    await db.query(
      `INSERT INTO public.payment_account_bindings
         (id, tenant_id, legal_entity_id, version, status, provider_account_ref, livemode,
          onboarding_intent_id, activated_at)
       VALUES ($1, $2, $3, 1, 'active', $4, false, $5, now())`,
      [s.binding, s.tenant, s.entity, s.account, intent],
    );
  }
  return fx;
}

export async function removeTwoTenants(db: pg.Client, fx: Fixture) {
  const tenants = [fx.A.tenant, fx.B.tenant];
  await db.query("BEGIN");
  try {
    await db.query("SET LOCAL session_replication_role = replica");
    for (const table of [
      "public.mission_control_task_links",
      "public.mission_control_tasks",
      "public.audit_logs",
      "public.payment_repair_cases",
      "public.donation_saga_outbox",
      "public.donations",
      "public.payment_account_bindings",
      "public.payment_provider_accounts",
      "public.payment_onboarding_intents",
      "public.legal_entities",
    ]) {
      const present = (
        await db.query("SELECT to_regclass($1) IS NOT NULL AS present", [table])
      ).rows[0].present as boolean;
      if (present)
        await db.query(
          `DELETE FROM ${table} WHERE tenant_id = ANY($1::uuid[])`,
          [tenants],
        );
    }
    await db.query("DELETE FROM public.tenants WHERE id = ANY($1::uuid[])", [
      tenants,
    ]);
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}

export type Method = "card" | "ach" | "wallet";

export function requestParams(
  operationId: string,
  donationId: string,
  amount: number,
  currency = "usd",
  method?: Method,
) {
  return {
    amount,
    currency,
    metadata: {
      asym_operation: operationId,
      asym_intake: donationId,
      ...(method ? { payment_method: method } : {}),
    },
    ...(method
      ? {
          payment_method_types:
            method === "ach" ? ["us_bank_account"] : ["card"],
        }
      : { automatic_payment_methods: { enabled: true } }),
  };
}

export type Intake = {
  side: Side;
  donationId: string;
  operationId: string;
  amount: number;
};

export type IntakeOptions = {
  amount?: number;
  maxAttempts?: number;
  params?: (operationId: string, donationId: string, amount: number) => unknown;
};

export async function guardIntake(
  db: pg.Client,
  side: Side,
  options: IntakeOptions = {},
): Promise<Intake> {
  const amount = options.amount ?? 10300;
  const donationId = randomUUID();
  const operationId = randomUUID();
  const params = (options.params ?? requestParams)(
    operationId,
    donationId,
    amount,
  );
  await grant(db, GUARD_TEST_GRANTS);
  await enterAs(db, "tenant_guard", side.tenant);
  await db.query(
    `INSERT INTO public.donations
       (id, tenant_id, legal_entity_id, payment_account_binding_id, provider_account_ref, livemode, amount, currency)
     VALUES ($1, $2, $3, $4, $5, false, $6, 'usd')`,
    [donationId, side.tenant, side.entity, side.binding, side.account, amount],
  );
  await db.query(
    `INSERT INTO public.donation_saga_outbox
       (id, tenant_id, donation_id, amount, currency, idempotency_key, status, request_kind,
        provider_account_ref, livemode, request_params, request_digest, max_attempts)
     VALUES ($1, $2, $3, $4, 'usd', 'gift:' || $3::uuid::text || ':create_payment', 'queued', 'create_payment',
             $5, false, $6::jsonb,
             encode(sha256(convert_to($6::jsonb::text, 'UTF8')), 'hex'), $7)`,
    [
      operationId,
      side.tenant,
      donationId,
      amount,
      side.account,
      JSON.stringify(params),
      options.maxAttempts ?? 5,
    ],
  );
  await role(db, null);
  return { side, donationId, operationId, amount };
}

export async function replica(
  db: pg.Client,
  sql: string,
  params: unknown[] = [],
) {
  await role(db, null);
  await db.query("SAVEPOINT r1a_replica");
  await db.query("SET LOCAL session_replication_role = replica");
  try {
    const rows = (await db.query(sql, params)).rows as Row[];
    await db.query("SET LOCAL session_replication_role = origin");
    await db.query("RELEASE SAVEPOINT r1a_replica");
    return rows;
  } catch (error) {
    await db.query("ROLLBACK TO SAVEPOINT r1a_replica");
    throw error;
  }
}

export async function rowOf(db: pg.Client, operationId: string) {
  await role(db, null);
  return (
    await db.query(
      `SELECT kind, status, attempt_count, max_attempts, outcome_unknown, provider_object_id,
              last_error_code, first_sent_at, send_deadline, lease_expires_at, parked_at, next_attempt_at
         FROM public.donation_saga_outbox WHERE id = $1`,
      [operationId],
    )
  ).rows[0] as Row;
}

export async function claim(
  db: pg.Client,
  operationId: string,
  leaseSeconds = 300,
): Promise<Outcome> {
  await role(db, null);
  await db.query(
    "SELECT pg_catalog.set_config('app.current_tenant_id', '', true)",
  );
  await role(db, "service_role");
  const r = await db.query(
    "SELECT public.claim_provider_operation($1::uuid, $2::integer) AS r",
    [operationId, leaseSeconds],
  );
  await role(db, null);
  return r.rows[0].r as Outcome;
}

export async function report(
  db: pg.Client,
  operationId: string,
  attemptNumber: number,
  result: unknown,
): Promise<Outcome> {
  await role(db, null);
  await db.query(
    "SELECT pg_catalog.set_config('app.current_tenant_id', '', true)",
  );
  await role(db, "service_role");
  const r = await db.query(
    "SELECT public.record_provider_operation_result($1::uuid, $2::integer, $3::jsonb) AS r",
    [operationId, attemptNumber, JSON.stringify(result)],
  );
  await role(db, null);
  return r.rows[0].r as Outcome;
}

export async function tryClaim(
  db: pg.Client,
  operationId: string,
  leaseSeconds: number | null = 300,
) {
  await role(db, null);
  await db.query(
    "SELECT pg_catalog.set_config('app.current_tenant_id', '', true)",
  );
  await role(db, "service_role");
  const r = await attempt(
    db,
    "SELECT public.claim_provider_operation($1::uuid, $2::integer) AS r",
    [operationId, leaseSeconds],
  );
  await role(db, null);
  return r;
}

export async function tryReport(
  db: pg.Client,
  operationId: string,
  attemptNumber: number | null,
  result: unknown,
) {
  await role(db, null);
  await db.query(
    "SELECT pg_catalog.set_config('app.current_tenant_id', '', true)",
  );
  await role(db, "service_role");
  const r = await attempt(
    db,
    "SELECT public.record_provider_operation_result($1::uuid, $2::integer, $3::jsonb) AS r",
    [
      operationId,
      attemptNumber,
      result === undefined ? null : JSON.stringify(result),
    ],
  );
  await role(db, null);
  return r;
}

export async function expireLease(db: pg.Client, operationId: string) {
  return replica(
    db,
    `UPDATE public.donation_saga_outbox
        SET lease_expires_at = clock_timestamp() - interval '1 second'
      WHERE id = $1`,
    [operationId],
  );
}

export async function windowEndsIn(
  db: pg.Client,
  operationId: string,
  seconds: number,
) {
  return replica(
    db,
    `WITH clock AS (SELECT clock_timestamp() + make_interval(secs => $2) AS deadline)
     UPDATE public.donation_saga_outbox
        SET first_sent_at = clock.deadline - interval '23 hours',
            send_deadline = clock.deadline,
            lease_expires_at = CASE WHEN lease_expires_at IS NULL THEN NULL
                                    ELSE LEAST(lease_expires_at, clock.deadline) END,
            next_attempt_at = CASE WHEN status = 'retry_wait'
                                   THEN LEAST(next_attempt_at, clock.deadline - interval '900 seconds')
                                   ELSE next_attempt_at END
       FROM clock
      WHERE id = $1`,
    [operationId, seconds],
  );
}

export async function makeDue(db: pg.Client, operationId: string) {
  return replica(
    db,
    `UPDATE public.donation_saga_outbox
        SET next_attempt_at = LEAST(next_attempt_at, clock_timestamp() - interval '1 second')
      WHERE id = $1`,
    [operationId],
  );
}

export async function tasksOf(db: pg.Client, tenantId: string) {
  await role(db, null);
  return (
    await db.query(
      `SELECT t.issue_type, t.urgency, t.source_module, l.record_type, l.record_id, l.relationship
         FROM public.mission_control_tasks AS t
         JOIN public.mission_control_task_links AS l ON l.task_id = t.id AND l.tenant_id = t.tenant_id
        WHERE t.tenant_id = $1
        ORDER BY t.created_at, t.id`,
      [tenantId],
    )
  ).rows as Row[];
}

export async function casesOf(db: pg.Client, operationId: string) {
  await role(db, null);
  return (
    await db.query(
      `SELECT id, kind, resolution, resolved_at FROM public.payment_repair_cases
        WHERE operation_id = $1 ORDER BY created_at, id`,
      [operationId],
    )
  ).rows as Row[];
}

export async function auditOf(db: pg.Client, operationId: string) {
  await role(db, null);
  return (
    await db.query(
      `SELECT action, resource_type, details FROM public.audit_logs
        WHERE resource_type = 'donation_saga_outbox' AND resource_id = $1
        ORDER BY created_at`,
      [operationId],
    )
  ).rows as Row[];
}

export async function resolveCase(
  db: pg.Client,
  caseId: string,
  resolution: "adopted" | "abandoned" | "retried",
) {
  await role(db, null);
  await db.query(
    `UPDATE public.payment_repair_cases
        SET resolution = $2, resolution_reason = 'Resolved by the R1a suite',
            resolved_by = gen_random_uuid(), resolved_assignment_id = gen_random_uuid(),
            resolved_at = clock_timestamp(), resolution_details = '{}'::jsonb
      WHERE id = $1`,
    [caseId, resolution],
  );
}

export async function guardUpdate(
  db: pg.Client,
  tenantId: string,
  sql: string,
  params: unknown[] = [],
) {
  await enterAs(db, "tenant_guard", tenantId);
  const r = await attempt(db, sql, params);
  await role(db, null);
  return r;
}

export const keysOf = (o: Outcome) => Object.keys(o).sort();
