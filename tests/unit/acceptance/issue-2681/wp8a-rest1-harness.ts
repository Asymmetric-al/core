import { randomUUID } from "node:crypto";

import {
  GUARD_TEST_GRANTS,
  attempt,
  enterAs,
  grant,
  insertLines,
  paymentIntent,
  recordReference,
  role,
  storeEvent,
  work,
  type Attempt,
  type Line,
  type Outcome,
  type Row,
  type Side,
} from "./wp8a-p2r2a-harness";

import type pg from "pg";

export * from "./wp8a-p2r2a-harness";

export type Actor = { user: string; email?: string | null; confirmed: boolean };
export type Contact = {
  email?: string | null;
  first?: string | null;
  last?: string | null;
  address?: Record<string, string> | null;
};

export type GiftOptions = {
  lines?: Line[];
  actor?: Actor | null;
  contact?: Contact | null;
  anonymous?: boolean;
  status?: string;
};

export const uniqueEmail = (label = "giver") =>
  `rest1-${label}-${randomUUID().slice(0, 8)}@example.test`;

export async function giftIntake(
  db: pg.Client,
  side: Side,
  options: GiftOptions = {},
) {
  const lines = options.lines ?? [{ amount: 10300 }];
  const amount = lines.reduce((sum, l) => sum + l.amount, 0);
  const donationId = randomUUID();
  await grant(db, GUARD_TEST_GRANTS);
  await enterAs(db, "tenant_guard", side.tenant);
  await db.query(
    `INSERT INTO public.donations
       (id, tenant_id, legal_entity_id, payment_account_binding_id, provider_account_ref, livemode,
        amount, currency, status, actor_user_id, actor_email, actor_email_confirmed, is_anonymous)
     VALUES ($1, $2, $3, $4, $5, false, $6, 'usd', $7, $8, $9, $10, $11)`,
    [
      donationId,
      side.tenant,
      side.entity,
      side.binding,
      side.account,
      amount,
      options.status ?? "pending",
      options.actor?.user ?? null,
      options.actor ? (options.actor.email ?? null) : null,
      options.actor ? options.actor.confirmed : null,
      options.anonymous ?? false,
    ],
  );
  await insertLines(db, side, donationId, lines);
  const contact =
    options.contact === null
      ? null
      : {
          email: uniqueEmail(),
          first: "Pat",
          last: `Giver ${randomUUID().slice(0, 6)}`,
          ...options.contact,
        };
  if (contact)
    await db.query(
      `INSERT INTO public.donation_intake_contacts
         (tenant_id, donation_id, legal_entity_id, email, first_name, last_name, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [
        side.tenant,
        donationId,
        side.entity,
        contact.email ?? null,
        contact.first ?? null,
        contact.last ?? null,
        contact.address ? JSON.stringify(contact.address) : null,
      ],
    );
  await role(db, null);
  return { side, donationId, amount, lines, contact };
}

export type GiftIntake = Awaited<ReturnType<typeof giftIntake>>;

export async function pay(
  db: pg.Client,
  intake: GiftIntake,
  pi = paymentIntent(),
) {
  await recordReference(db, intake.donationId, pi);
  const event = await storeEvent(db, intake.side, {
    pi,
    amount: intake.amount,
  });
  const outcome = await work(db, event.id);
  return { pi, event, outcome };
}

export type Person = {
  user: string;
  email: string;
  party?: string;
  donor?: string;
  worker?: string;
};

export async function person(
  db: pg.Client,
  side: Side,
  options: {
    confirmed?: boolean;
    link?: boolean;
    donor?: boolean;
    donorProfile?: boolean;
    worker?: boolean;
    partyName?: string;
    donorName?: string;
    donorEmail?: string | null;
  } = {},
): Promise<Person> {
  await role(db, null);
  const user = randomUUID();
  const email = uniqueEmail("login");
  await db.query(
    `INSERT INTO auth.users (id, email, email_confirmed_at) VALUES ($1, $2, $3)`,
    [user, email, options.confirmed === false ? null : new Date()],
  );
  const p: Person = { user, email };
  if (options.link || options.donor || options.worker || options.donorProfile) {
    p.party = randomUUID();
    await db.query(
      "INSERT INTO public.parties (id, tenant_id, display_name) VALUES ($1, $2, $3)",
      [p.party, side.tenant, options.partyName ?? "Linked Party Name"],
    );
  }
  if (options.link)
    await db.query(
      `INSERT INTO public.account_links (tenant_id, user_id, party_id, linked_via)
       VALUES ($1, $2, $3, 'account_claim')`,
      [side.tenant, user, p.party],
    );
  if (options.worker)
    p.worker = (
      await db.query(
        `INSERT INTO public.missionaries (tenant_id, legal_entity_id, party_id, profile_id)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [side.tenant, side.entity, p.party, user],
      )
    ).rows[0].id as string;
  if (options.donor || options.donorProfile)
    p.donor = (
      await db.query(
        `INSERT INTO public.donors (tenant_id, party_id, profile_id, name, email)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          side.tenant,
          p.party,
          options.donorProfile ? user : null,
          options.donorName ?? "Existing Donor",
          options.donorEmail === undefined ? null : options.donorEmail,
        ],
      )
    ).rows[0].id as string;
  return p;
}

export async function existingDonor(
  db: pg.Client,
  side: Side,
  values: {
    name: string;
    email?: string | null;
    address?: Record<string, string>;
  },
) {
  await role(db, null);
  const party = randomUUID();
  await db.query(
    "INSERT INTO public.parties (id, tenant_id, display_name) VALUES ($1, $2, $3)",
    [party, side.tenant, values.name],
  );
  return (
    await db.query(
      `INSERT INTO public.donors (tenant_id, party_id, name, email, address)
       VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING id`,
      [
        side.tenant,
        party,
        values.name,
        values.email ?? null,
        values.address ? JSON.stringify(values.address) : null,
      ],
    )
  ).rows[0].id as string;
}

export async function identityRows(db: pg.Client, tenant: string) {
  await role(db, null);
  const q = async (sql: string) =>
    (await db.query(sql, [tenant])).rows as Row[];
  return {
    parties: await q(
      "SELECT id, display_name FROM public.parties WHERE tenant_id = $1 ORDER BY created_at, id",
    ),
    donors: await q(
      "SELECT id, party_id, profile_id, name, email FROM public.donors WHERE tenant_id = $1 ORDER BY created_at, id",
    ),
    links: await q(
      "SELECT user_id, party_id, linked_via FROM public.account_links WHERE tenant_id = $1 ORDER BY user_id",
    ),
    memberships: await q(
      "SELECT user_id, role, is_active FROM authz.memberships WHERE tenant_id = $1 ORDER BY user_id, role",
    ),
  };
}

export async function intakeRow(db: pg.Client, donationId: string) {
  await role(db, null);
  return (
    await db.query(
      `SELECT status, donor_id, abandoned_by, stripe_payment_intent_id
         FROM public.donations WHERE id = $1`,
      [donationId],
    )
  ).rows[0] as Row;
}

export async function giftOf(db: pg.Client, donationId: string) {
  await role(db, null);
  return (
    await db.query(
      `SELECT id, donor_id, status, donor_match_status, review_reason, legal_entity_id
         FROM public.staged_gifts WHERE donation_id = $1`,
      [donationId],
    )
  ).rows[0] as Row | undefined;
}

export async function holdsOf(db: pg.Client, giftId: string) {
  await role(db, null);
  return (
    await db.query(
      `SELECT id, reason, details, resolved_at, resolution_reason, resolution_details
         FROM public.staged_gift_holds WHERE staged_gift_id = $1 ORDER BY reason, created_at`,
      [giftId],
    )
  ).rows as Row[];
}

export const reasons = (rows: Row[]) => rows.map((r) => r.reason).sort();

export async function requestRow(db: pg.Client, operationId: string) {
  await role(db, null);
  return (
    await db.query(
      `SELECT status, outcome_unknown, park_reason, parked_at, attempt_count, request_kind
         FROM public.donation_saga_outbox WHERE id = $1`,
      [operationId],
    )
  ).rows[0] as Row;
}

export async function setThreshold(
  db: pg.Client,
  side: Side,
  cents: number | null,
) {
  await role(db, null);
  await db.query(
    `INSERT INTO public.contribution_approval_policies (tenant_id, large_gift_threshold_cents)
     VALUES ($1, $2)
     ON CONFLICT (tenant_id) DO UPDATE SET large_gift_threshold_cents = EXCLUDED.large_gift_threshold_cents`,
    [side.tenant, cents],
  );
}

export async function worker(
  db: pg.Client,
  side: Side,
  level: "standard" | "sensitive" | "restricted" | "high_risk",
) {
  await role(db, null);
  const party = randomUUID();
  await db.query(
    `INSERT INTO public.parties (id, tenant_id, display_name, public_alias, security_level, security_level_source)
       VALUES ($1, $2, 'Rest1 worker', 'Field partner', $3, 'manual')`,
    [party, side.tenant, level],
  );
  return (
    await db.query(
      `INSERT INTO public.missionaries (tenant_id, legal_entity_id, party_id)
       VALUES ($1, $2, $3) RETURNING id`,
      [side.tenant, side.entity, party],
    )
  ).rows[0].id as string;
}

export async function staff(
  db: pg.Client,
  side: Side,
  kind: "finance" | "development" | "admin",
) {
  await role(db, null);
  const user = randomUUID();
  await db.query(
    "INSERT INTO auth.users (id, email, email_confirmed_at) VALUES ($1, $2, now())",
    [user, uniqueEmail("staff")],
  );
  const assignment = (
    await db.query(
      `INSERT INTO authz.memberships (user_id, tenant_id, role, staff_role, is_active, is_tenant_admin)
       VALUES ($1, $2, 'staff', $3, true, $4) RETURNING id`,
      [
        user,
        side.tenant,
        kind === "admin" ? "finance" : kind,
        kind === "admin",
      ],
    )
  ).rows[0].id as string;
  return { user, assignment, tenant: side.tenant };
}

export type Staff = Awaited<ReturnType<typeof staff>>;

export async function asCaller(
  db: pg.Client,
  who: Staff,
  sql: string,
  params: unknown[] = [],
  headers: Record<string, string> | null = {
    "x-asym-tenant": who.tenant,
    "x-asym-assignment": who.assignment,
  },
): Promise<Attempt> {
  await role(db, null);
  await db.query(
    `SELECT set_config('request.jwt.claims', $1, true),
            set_config('request.jwt.claim.sub', '', true),
            set_config('request.headers', $2, true),
            set_config('app.current_tenant_id', '', true)`,
    [
      JSON.stringify({ sub: who.user, role: "authenticated" }),
      headers ? JSON.stringify(headers) : "",
    ],
  );
  await role(db, "authenticated");
  const r = await attempt(db, sql, params);
  await role(db, null);
  await db.query(
    "SELECT set_config('request.jwt.claims', '', true), set_config('request.headers', '', true), set_config('app.current_tenant_id', '', true)",
  );
  return r;
}

export const outcomeOf = (a: Attempt) => {
  if (!a.ok) throw new Error(`refused: ${a.code} ${a.message}`);
  return a.rows[0]!.r as Outcome;
};

export async function ageIntake(
  db: pg.Client,
  donationId: string,
  days: number,
) {
  await role(db, null);
  await db.query("SAVEPOINT rest1_age");
  await db.query("SET LOCAL session_replication_role = replica");
  await db.query(
    "UPDATE public.donations SET created_at = clock_timestamp() - make_interval(days => $2) WHERE id = $1",
    [donationId, days],
  );
  await db.query("SET LOCAL session_replication_role = origin");
  await db.query("RELEASE SAVEPOINT rest1_age");
}
