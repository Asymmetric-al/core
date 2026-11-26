import { createHash, randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  GUARD_TEST_GRANTS,
  attempt,
  enterAs,
  grant,
  paymentIntent,
  role,
  type Attempt,
  type Outcome,
  type Row,
  type Side,
} from "./wp8a-p2r1a-harness";

import type pg from "pg";

export * from "./wp8a-p2r1a-harness";

const ROOT = fileURLToPath(new URL("../../../../", import.meta.url));
export const MIGRATIONS = join(ROOT, "supabase/migrations");

export const R2A_FILES = [
  "fee_cover_key",
  "intake_lines",
  "staging_generation",
  "payment_observations",
  "enqueue_and_apply",
] as const;

export function r2aMigration(name: (typeof R2A_FILES)[number]) {
  const pattern = new RegExp(`^\\d{14}_wp8a2_r2a_${name}\\.sql$`);
  const names = readdirSync(MIGRATIONS).filter((n) => pattern.test(n));
  if (names.length !== 1)
    throw new Error(`expected one migration matching ${pattern}`);
  return {
    name: names[0]!,
    text: readFileSync(join(MIGRATIONS, names[0]!), "utf8"),
  };
}

export type Line = {
  fund?: string;
  missionary?: string;
  fee?: boolean;
  amount: number;
};

export type LineIntakeOptions = {
  lines?: Line[];
  method?: "card" | "ach" | "wallet" | null;
  status?: string;
};

export async function feeFund(db: pg.Client, side: Side) {
  await role(db, null);
  const existing = (
    await db.query(
      `SELECT id FROM public.funds
        WHERE legal_entity_id = $1 AND system_purpose = 'fee_cover'`,
      [side.entity],
    )
  ).rows[0] as { id: string } | undefined;
  if (existing) return existing.id;
  return (
    await db.query(
      `INSERT INTO public.funds (tenant_id, legal_entity_id, name, system_purpose)
       VALUES ($1, $2, 'Fee cover', 'fee_cover') RETURNING id`,
      [side.tenant, side.entity],
    )
  ).rows[0].id as string;
}

export async function missionary(db: pg.Client, side: Side, entity?: string) {
  await role(db, null);
  const party = randomUUID();
  await db.query(
    "INSERT INTO public.parties (tenant_id, id, display_name) VALUES ($1, $2, 'R2a worker')",
    [side.tenant, party],
  );
  return (
    await db.query(
      `INSERT INTO public.missionaries (tenant_id, legal_entity_id, party_id)
       VALUES ($1, $2, $3) RETURNING id`,
      [side.tenant, entity ?? side.entity, party],
    )
  ).rows[0].id as string;
}

export async function insertLines(
  db: pg.Client,
  side: Side,
  donationId: string,
  lines: Line[],
  first = 1,
) {
  for (const [i, line] of lines.entries())
    await db.query(
      `INSERT INTO public.donation_intake_lines
         (tenant_id, donation_id, legal_entity_id, line_number, fund_id, missionary_id, is_fee_cover, amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        side.tenant,
        donationId,
        side.entity,
        first + i,
        line.missionary ? null : (line.fund ?? side.fund),
        line.missionary ?? null,
        line.fee ?? false,
        line.amount,
      ],
    );
}

export async function lineIntake(
  db: pg.Client,
  side: Side,
  options: LineIntakeOptions = {},
) {
  const lines = options.lines ?? [{ amount: 10300 }];
  const amount = lines.reduce((sum, l) => sum + l.amount, 0);
  const donationId = randomUUID();
  await grant(db, GUARD_TEST_GRANTS);
  await enterAs(db, "tenant_guard", side.tenant);
  await db.query(
    `INSERT INTO public.donations
       (id, tenant_id, legal_entity_id, payment_account_binding_id, provider_account_ref, livemode,
        amount, currency, payment_method, status)
     VALUES ($1, $2, $3, $4, $5, false, $6, 'usd', $7, $8)`,
    [
      donationId,
      side.tenant,
      side.entity,
      side.binding,
      side.account,
      amount,
      options.method ?? null,
      options.status ?? "pending",
    ],
  );
  await insertLines(db, side, donationId, lines);
  await role(db, null);
  return { side, donationId, amount, lines };
}

export type LineIntake = Awaited<ReturnType<typeof lineIntake>>;

export async function enqueue(db: pg.Client, side: Side, donationId: string) {
  await enterAs(db, "tenant_guard", side.tenant);
  const r = await attempt(
    db,
    "SELECT tenant_guard.money_enqueue_payment_request($1::uuid) AS id",
    [donationId],
  );
  await role(db, null);
  return r;
}

export type PaymentEvent = {
  type?: string;
  pi?: string;
  amount?: unknown;
  received?: unknown;
  currency?: unknown;
  metadata?: unknown;
  created?: number;
  livemode?: boolean;
  account?: string;
  objectLivemode?: unknown;
  payload?: (event: Record<string, unknown>) => Record<string, unknown>;
  rawText?: (text: string) => string;
};

let clock = 1_790_000_000;

export function eventPayload(side: Side, e: PaymentEvent, id: string) {
  const type = e.type ?? "payment_intent.succeeded";
  const amount = e.amount ?? 10300;
  const payload: Record<string, unknown> = {
    id,
    object: "event",
    api_version: "2026-10-28.acacia",
    account: e.account ?? side.account,
    created: e.created ?? (clock += 10),
    livemode: e.livemode ?? false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type,
    data: {
      object: {
        id: e.pi ?? paymentIntent(),
        object: "payment_intent",
        amount,
        amount_received:
          e.received ?? (type === "payment_intent.succeeded" ? amount : 0),
        currency: e.currency ?? "usd",
        livemode: e.objectLivemode ?? e.livemode ?? false,
        metadata: e.metadata ?? {},
        status: type.replace("payment_intent.", ""),
      },
    },
  };
  return payload;
}

export async function storeEvent(db: pg.Client, side: Side, e: PaymentEvent) {
  const stripeEventId = `evt_${randomUUID().replaceAll("-", "")}`;
  const base = eventPayload(side, e, stripeEventId);
  const created = base.created as number;
  const payload = e.payload
    ? e.payload(JSON.parse(JSON.stringify(base)) as Record<string, unknown>)
    : base;
  const text = (e.rawText ?? ((t: string) => t))(JSON.stringify(payload));
  await role(db, null);
  await db.query(
    "SELECT pg_catalog.set_config('app.current_tenant_id', '', true)",
  );
  await role(db, "service_role");
  const id = (
    await db.query(
      `INSERT INTO public.stripe_connect_events
         (tenant_id, stripe_event_id, event_type, livemode, provider_account_id,
          event_created_at, payload_sha256, raw_payload)
       VALUES ($1, $2, $3, $4, $5, to_timestamp($6), $7, $8::jsonb)
       RETURNING id`,
      [
        side.tenant,
        stripeEventId,
        e.type ?? "payment_intent.succeeded",
        e.livemode ?? false,
        side.account,
        created,
        createHash("sha256").update(text).digest("hex"),
        text,
      ],
    )
  ).rows[0].id as string;
  await role(db, null);
  const object = (base.data as { object: { id: string } }).object;
  return { id, stripeEventId, pi: object.id, payload };
}

export type StoredEvent = Awaited<ReturnType<typeof storeEvent>>;

async function asService(db: pg.Client, sql: string, params: unknown[]) {
  await role(db, null);
  await db.query(
    "SELECT pg_catalog.set_config('app.current_tenant_id', '', true)",
  );
  await role(db, "service_role");
  const r = await attempt(db, sql, params);
  await role(db, null);
  return r;
}

export const claimEvent = async (db: pg.Client, eventId: string) =>
  (
    await asService(
      db,
      "SELECT public.claim_provider_event($1::uuid, 300) AS r",
      [eventId],
    )
  ).rows[0]?.r as Outcome;

export const tryApply = (db: pg.Client, eventId: string, attemptNo: number) =>
  asService(db, "SELECT public.apply_payment_outcome($1::uuid, $2) AS r", [
    eventId,
    attemptNo,
  ]);

export async function apply(db: pg.Client, eventId: string, attemptNo = 1) {
  const r = await tryApply(db, eventId, attemptNo);
  if (!r.ok) throw new Error(`apply refused: ${r.code} ${r.message}`);
  return r.rows[0]!.r as Outcome;
}

export const failEvent = async (
  db: pg.Client,
  eventId: string,
  attemptNo: number,
  retryable = true,
) =>
  (
    await asService(
      db,
      "SELECT public.record_provider_event_failure($1::uuid, $2, 'unmatched', 'unmatched payment', $3, 0) AS r",
      [eventId, attemptNo, retryable],
    )
  ).rows[0]?.r as Outcome;

export async function work(db: pg.Client, eventId: string) {
  const claimed = await claimEvent(db, eventId);
  if (claimed.outcome !== "claimed")
    throw new Error(`claim answered ${JSON.stringify(claimed)}`);
  return apply(db, eventId, claimed.attempt as number);
}

export async function core(db: pg.Client, tenant: string, eventId: string) {
  await enterAs(db, "tenant_guard", tenant);
  const r = await attempt(
    db,
    "SELECT tenant_guard.money_apply_payment_event($1::uuid) AS r",
    [eventId],
  );
  await role(db, null);
  return r;
}

export const coreOutcome = (a: Attempt) => {
  if (!a.ok) throw new Error(`core refused: ${a.code} ${a.message}`);
  return a.rows[0]!.r as Outcome;
};

export async function recordReference(
  db: pg.Client,
  donationId: string,
  pi: string,
) {
  await role(db, null);
  await db.query(
    "UPDATE public.donations SET stripe_payment_intent_id = $2 WHERE id = $1",
    [donationId, pi],
  );
}

export async function moneyRows(db: pg.Client, tenant: string) {
  await role(db, null);
  const q = async (sql: string) =>
    (await db.query(sql, [tenant])).rows as Row[];
  return {
    intakes: await q(
      `SELECT id, status, amount, currency, stripe_payment_intent_id, payment_method
         FROM public.donations WHERE tenant_id = $1 AND intake_format = 'line_based' ORDER BY id`,
    ),
    gifts: await q(
      `SELECT id, donation_id, legal_entity_id, amount, currency, status, donor_match_status,
              allocation_status, review_reason, stripe_payment_intent_id, stripe_event_id,
              donor_id, fund_id, missionary_id, intake_format
         FROM public.staged_gifts WHERE tenant_id = $1 ORDER BY id`,
    ),
    allocations: await q(
      `SELECT staged_gift_id, line_number, fund_id, missionary_id, is_fee_cover, amount, intake_format
         FROM public.staged_gift_allocations WHERE tenant_id = $1 ORDER BY staged_gift_id, line_number`,
    ),
    observations: await q(
      `SELECT donation_id, event_id, payment_object_id, effect_kind, amount, currency
         FROM public.payment_observations WHERE tenant_id = $1 ORDER BY provider_created_at, effect_kind, event_id`,
    ),
    audit: await q(
      `SELECT action, resource_type, resource_id, details
         FROM public.audit_logs WHERE tenant_id = $1 AND action = 'payment_applied' ORDER BY created_at, id`,
    ),
    tasks: await q(
      `SELECT t.issue_type, t.urgency, t.source_module, t.status, l.record_type, l.record_id,
              l.relationship, l.metadata
         FROM public.mission_control_tasks AS t
         JOIN public.mission_control_task_links AS l ON l.task_id = t.id
        WHERE t.tenant_id = $1 ORDER BY t.created_at, t.id`,
    ),
  };
}

export const digest = (rows: unknown) =>
  createHash("sha256").update(JSON.stringify(rows)).digest("hex");

export async function eventRow(db: pg.Client, eventId: string) {
  await role(db, null);
  return (
    await db.query(
      `SELECT processing_status, process_attempts, lease_expires_at, processing_outcome
         FROM public.stripe_connect_events WHERE id = $1`,
      [eventId],
    )
  ).rows[0] as Row;
}

export async function syncLease(db: pg.Client, side: Side) {
  await role(db, null);
  return (
    await db.query(
      `SELECT sync_lease_event_id FROM public.payment_provider_accounts
        WHERE tenant_id = $1 AND provider_account_id = $2`,
      [side.tenant, side.account],
    )
  ).rows[0]?.sync_lease_event_id as string | null;
}

export const succeeded = (pi: string, amount = 10300, metadata = {}) => ({
  type: "payment_intent.succeeded",
  pi,
  amount,
  metadata,
});
