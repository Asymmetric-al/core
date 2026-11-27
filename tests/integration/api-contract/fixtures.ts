/**
 * #2708: the tenants of the live tests.
 *
 * The seed tenant (TENANT_A) is supabase/seed.sql's demo tenant: its one user
 * is staff, donor and missionary there and owns the seeded donors, tasks and
 * gifts. The portal tests read it as tenant A.
 *
 * createTenantFixture writes a tenant per run, with random ids, mirroring that
 * user: an auth user (the profile comes from the auth trigger), staff, donor
 * and missionary memberships, a missionaries row, a donor and a task, plus
 * rows another tenant must not read: a gift, a pledge, and a draft post and
 * draft location that no ruling makes public. It also gets a fund: funds are
 * readable only through the tenant claim, so its identity guard has a row
 * only its own `app_metadata.tenant_id` admits. Its ids come from
 * randomUUID(), version 4 UUIDs, which authz.current_tenant_id() accepts; it
 * rejects the seed tenant's id (see tenant-isolation.live.test.ts).
 *
 * Rows are written as the database owner through only the columns that exist
 * today (upsertFixture) and removed afterwards.
 *
 * AL-2676 (WP3a part 1a, 20261120130004): every missionary and fund names its
 * tenant's legal entity, so the tenant gets one; and a gift or pledge locks
 * the missionary or fund it names, for good, so removal deletes the lock rows
 * after the money rows and before their targets, and the entity before the
 * tenant.
 */
import { randomUUID } from "node:crypto";

import { upsertFixture } from "./live-stack";

import type pg from "pg";

/** supabase/seed.sql: the demo tenant and its single profile identity. */
export const TENANT_A = "00000000-0000-0000-0000-000000000001";
export const SEED_USER_A = "11111111-1111-1111-1111-111111111111";

export type TenantFixture = {
  tenantId: string;
  userId: string;
  missionaryId: string;
  donorId: string;
  taskId: string;
  donationId: string;
  pledgeId: string;
  draftPostId: string;
  draftLocationId: string;
  fundId: string;
  legalEntityId: string;
  partyId: string;
};

/**
 * Writes a tenant fixture; `label` names its rows ("Tenant B",
 * tenant-b.test). If a write fails part-way, the rows already written are
 * removed before the error is rethrown, so a failed run leaves nothing
 * behind; if that removal fails too, the error says what is left.
 */
export async function createTenantFixture(
  db: pg.Client,
  label = "B",
): Promise<TenantFixture> {
  const fixture: TenantFixture = {
    tenantId: randomUUID(),
    userId: randomUUID(),
    missionaryId: randomUUID(),
    donorId: randomUUID(),
    taskId: randomUUID(),
    donationId: randomUUID(),
    pledgeId: randomUUID(),
    draftPostId: randomUUID(),
    draftLocationId: randomUUID(),
    fundId: randomUUID(),
    legalEntityId: randomUUID(),
    partyId: randomUUID(),
  };
  try {
    await writeTenantFixture(db, fixture, label);
    return fixture;
  } catch (error) {
    const problems = await removeTenantFixture(db, fixture);
    if (problems.length === 0) throw error;
    throw new Error(
      `creating tenant fixture ${label} failed (${error instanceof Error ? error.message : String(error)}), and removing what it wrote left: ${problems.join("; ")}`,
      { cause: error },
    );
  }
}

async function writeTenantFixture(
  db: pg.Client,
  fixture: TenantFixture,
  label: string,
): Promise<void> {
  const short = fixture.tenantId.slice(0, 8);
  const email = `api-contract-${short}@tenant-${label.toLowerCase()}.test`;

  await upsertFixture(db, "public.tenants", {
    id: fixture.tenantId,
    name: `API contract tenant ${label} ${short}`,
    slug: `api-contract-${short}`,
  });
  await upsertFixture(db, "public.legal_entities", {
    id: fixture.legalEntityId,
    tenant_id: fixture.tenantId,
    name: `API contract tenant ${label} ${short}`,
    country_code: "US",
    currency: "usd",
    legal_name: `API contract tenant ${label} ${short}`,
  });
  await upsertFixture(db, "auth.users", {
    id: fixture.userId,
    instance_id: "00000000-0000-0000-0000-000000000000",
    aud: "authenticated",
    role: "authenticated",
    email,
    email_confirmed_at: new Date().toISOString(),
    raw_app_meta_data: {
      provider: "email",
      providers: ["email"],
      tenant_id: fixture.tenantId,
    },
    raw_user_meta_data: {
      first_name: "Tenant",
      last_name: label,
      full_name: `Tenant ${label}`,
    },
  });
  await upsertFixture(db, "public.profiles", {
    id: fixture.userId,
    user_id: fixture.userId,
    email,
    first_name: "Tenant",
    last_name: label,
    full_name: `Tenant ${label}`,
    display_name: `Tenant ${label}`,
    role: "admin",
    tenant_id: fixture.tenantId,
  });
  for (const [role, staffRole] of [
    ["staff", "development"],
    ["donor", null],
    ["missionary", null],
  ] as const) {
    await upsertFixture(
      db,
      "authz.memberships",
      {
        user_id: fixture.userId,
        tenant_id: fixture.tenantId,
        role,
        staff_role: staffRole,
        is_active: true,
      },
      ["user_id", "tenant_id", "role", "staff_role"],
    );
  }
  await upsertFixture(db, "public.parties", {
    id: fixture.partyId,
    tenant_id: fixture.tenantId,
    display_name: `Tenant ${label}`,
  });
  await upsertFixture(
    db,
    "public.account_links",
    {
      tenant_id: fixture.tenantId,
      user_id: fixture.userId,
      party_id: fixture.partyId,
      linked_via: "profile_backfill",
    },
    ["tenant_id", "user_id"],
  );
  await upsertFixture(db, "public.missionaries", {
    id: fixture.missionaryId,
    tenant_id: fixture.tenantId,
    legal_entity_id: fixture.legalEntityId,
    profile_id: fixture.userId,
    party_id: fixture.partyId,
    mission_field: "API contract field",
    tagline: `Tenant ${label} missionary`,
  });
  const donorParty = (
    await db.query(
      "select coalesce((select party_id from public.donors where id = $1), public.donor_party_for_insert($2, null, $3, null)) as id",
      [fixture.donorId, fixture.tenantId, `Tenant ${label} donor`],
    )
  ).rows[0].id as string;
  await upsertFixture(db, "public.donors", {
    id: fixture.donorId,
    tenant_id: fixture.tenantId,
    party_id: donorParty,
    missionary_id: fixture.userId,
    name: `Tenant ${label} donor`,
    email: `donor-${short}@tenant-${label.toLowerCase()}.test`,
  });
  await upsertFixture(db, "public.missionary_tasks", {
    id: fixture.taskId,
    tenant_id: fixture.tenantId,
    missionary_id: fixture.userId,
    donor_id: fixture.donorId,
    title: `Tenant ${label} task`,
  });
  await upsertFixture(db, "public.donor_pledges", {
    id: fixture.pledgeId,
    tenant_id: fixture.tenantId,
    donor_id: fixture.donorId,
    missionary_id: fixture.missionaryId,
    amount: 2500,
    currency: "usd",
    frequency: "monthly",
    status: "active",
  });
  await upsertFixture(db, "public.donations", {
    id: fixture.donationId,
    tenant_id: fixture.tenantId,
    donor_id: fixture.donorId,
    missionary_id: fixture.missionaryId,
    amount: 2500,
    currency: "usd",
    status: "completed",
    donation_type: "one_time",
  });
  await upsertFixture(db, "public.posts", {
    id: fixture.draftPostId,
    tenant_id: fixture.tenantId,
    missionary_id: fixture.userId,
    title: `Tenant ${label} draft`,
    content: `Not published: no ruling makes this readable outside tenant ${label}.`,
    visibility: "public",
    status: "draft",
  });
  await upsertFixture(db, "public.locations", {
    id: fixture.draftLocationId,
    tenant_id: fixture.tenantId,
    title: `Tenant ${label} draft location`,
    lat: 0,
    lng: 0,
    status: "draft",
  });
  await upsertFixture(db, "public.funds", {
    id: fixture.fundId,
    tenant_id: fixture.tenantId,
    legal_entity_id: fixture.legalEntityId,
    name: `Tenant ${label} fund`,
  });
}

/** Removes the fixture's rows; returns what it could not remove. */
export async function removeTenantFixture(
  db: pg.Client,
  fixture: TenantFixture,
): Promise<string[]> {
  const problems: string[] = [];
  const steps: [string, string, unknown][] = [
    ["public.donations", "tenant_id", fixture.tenantId],
    ["public.donor_pledges", "tenant_id", fixture.tenantId],
    ["public.giving_target_entity_locks", "tenant_id", fixture.tenantId],
    ["public.posts", "tenant_id", fixture.tenantId],
    ["public.locations", "tenant_id", fixture.tenantId],
    ["public.funds", "tenant_id", fixture.tenantId],
    ["public.missionary_tasks", "missionary_id", fixture.userId],
    ["public.donors", "tenant_id", fixture.tenantId],
    ["public.missionaries", "tenant_id", fixture.tenantId],
    ["public.account_links", "tenant_id", fixture.tenantId],
    ["public.parties", "tenant_id", fixture.tenantId],
    ["authz.memberships", "user_id", fixture.userId],
    ["public.profiles", "id", fixture.userId],
    ["auth.users", "id", fixture.userId],
    ["public.legal_entities", "tenant_id", fixture.tenantId],
    ["public.tenants", "id", fixture.tenantId],
  ];
  for (const [table, column, value] of steps) {
    try {
      await db.query(`delete from ${table} where ${column} = $1`, [value]);
    } catch (error) {
      problems.push(
        `${table}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return problems;
}

/** Active membership id for a user in a tenant with a given role. */
export async function membershipIdForRole(
  db: pg.Client,
  userId: string,
  tenantId: string,
  role: "staff" | "donor" | "missionary",
): Promise<string> {
  const { rows } = await db.query<{ id: string }>(
    `select id::text from authz.memberships
      where user_id = $1 and tenant_id = $2 and role = $3
        and is_active and revoked_at is null
      order by id limit 1`,
    [userId, tenantId, role],
  );
  if (!rows[0]) {
    throw new Error(
      `no active ${role} membership for user ${userId} in tenant ${tenantId}`,
    );
  }
  return rows[0].id;
}

/** Every string anywhere in a value, for asserting on returned ids. */
export function collectStrings(value: unknown, into = new Set<string>()) {
  if (typeof value === "string") into.add(value);
  else if (Array.isArray(value))
    for (const item of value) collectStrings(item, into);
  else if (value && typeof value === "object")
    for (const item of Object.values(value)) collectStrings(item, into);
  return into;
}
