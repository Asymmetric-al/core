/**
 * #2708: the two tenants of the live tests.
 *
 * Tenant A is supabase/seed.sql's demo tenant: its one user is staff, donor
 * and missionary there and owns the seeded donors, tasks and gifts.
 * Tenant B is written here per run, with random ids, mirroring that user:
 * an auth user (the profile comes from the auth trigger), staff, donor and
 * missionary memberships, a missionaries row, a donor and a task. Rows are
 * written as the database owner through only the columns that exist today
 * (upsertFixture) and removed afterwards.
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
};

export async function createTenantFixture(
  db: pg.Client,
): Promise<TenantFixture> {
  const fixture: TenantFixture = {
    tenantId: randomUUID(),
    userId: randomUUID(),
    missionaryId: randomUUID(),
    donorId: randomUUID(),
    taskId: randomUUID(),
  };
  const short = fixture.tenantId.slice(0, 8);
  const email = `api-contract-${short}@tenant-b.test`;

  await upsertFixture(db, "public.tenants", {
    id: fixture.tenantId,
    name: `API contract tenant ${short}`,
    slug: `api-contract-${short}`,
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
      last_name: "B",
      full_name: "Tenant B",
    },
  });
  await upsertFixture(db, "public.profiles", {
    id: fixture.userId,
    user_id: fixture.userId,
    email,
    first_name: "Tenant",
    last_name: "B",
    full_name: "Tenant B",
    display_name: "Tenant B",
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
  await upsertFixture(db, "public.missionaries", {
    id: fixture.missionaryId,
    tenant_id: fixture.tenantId,
    profile_id: fixture.userId,
    mission_field: "API contract field",
    tagline: "Tenant B missionary",
  });
  await upsertFixture(db, "public.donors", {
    id: fixture.donorId,
    tenant_id: fixture.tenantId,
    missionary_id: fixture.userId,
    name: "Tenant B donor",
    email: `donor-${short}@tenant-b.test`,
  });
  await upsertFixture(db, "public.missionary_tasks", {
    id: fixture.taskId,
    missionary_id: fixture.userId,
    donor_id: fixture.donorId,
    title: "Tenant B task",
  });
  return fixture;
}

/** Removes the fixture's rows; returns what it could not remove. */
export async function removeTenantFixture(
  db: pg.Client,
  fixture: TenantFixture,
): Promise<string[]> {
  const problems: string[] = [];
  const steps: [string, string, unknown][] = [
    ["public.missionary_tasks", "missionary_id", fixture.userId],
    ["public.donors", "tenant_id", fixture.tenantId],
    ["public.missionaries", "tenant_id", fixture.tenantId],
    ["authz.memberships", "user_id", fixture.userId],
    ["public.profiles", "id", fixture.userId],
    ["auth.users", "id", fixture.userId],
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

/** Every string anywhere in a value, for asserting on returned ids. */
export function collectStrings(value: unknown, into = new Set<string>()) {
  if (typeof value === "string") into.add(value);
  else if (Array.isArray(value))
    for (const item of value) collectStrings(item, into);
  else if (value && typeof value === "object")
    for (const item of Object.values(value)) collectStrings(item, into);
  return into;
}
