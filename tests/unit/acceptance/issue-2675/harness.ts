/**
 * AL-2675 (WP2a, the membership core) shared fixtures for the real-stack
 * suites. They run against the migrated database named by
 * TENANT_GUARD_IT_ADMIN_DATABASE_URL (a PG17 superuser URL, as in CI's
 * `migrate` job); without it they skip, except in that job, where they fail.
 * Every check runs inside one transaction that is always rolled back, and
 * callers are emulated as PostgREST does it (see ../issue-2674/harness.ts).
 */
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";

export {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asRole,
  type Caller,
  type Outcome,
} from "../issue-2674/harness";

export const MIG = "supabase/migrations";
/** The WP2a migration whose name ends with `suffix`. */
export function migration(suffix: string) {
  const name = readdirSync(MIG).find(
    (f) => /^\d{14}_/.test(f) && f.endsWith(`${suffix}.sql`),
  );
  if (!name) throw new Error(`no migration ends with ${suffix}.sql`);
  return `${MIG}/${name}`;
}
export const read = (file: string) =>
  existsSync(file) ? readFileSync(file, "utf8") : "";

/** The demo tenant the sign-up rule assigns (init schema, seed). */
export const DEMO_TENANT = "00000000-0000-0000-0000-000000000001";

/**
 * Fixture ids. TA and TB are tenants.
 * - UFC: two staff rows in TA, finance (mFin) and member care (mCare).
 * - UADM: the tenant administrator of TA (mAdm, development with the flag).
 * - UDEV: development staff in TA without the flag (mDev).
 * - UDON: a donor in TA (mDonA) and in TB (mDonB).
 * - UREV: a revoked hr row in TA (mRev).
 * - UB: finance staff in TB (mB).
 */
export const USERS = ["UFC", "UADM", "UDEV", "UDON", "UREV", "UB"] as const;
export const ROWS: [
  string,
  (typeof USERS)[number],
  "TA" | "TB",
  "donor" | "missionary" | "staff",
  string | null,
  boolean,
  boolean,
][] = [
  ["mFin", "UFC", "TA", "staff", "finance", false, true],
  ["mCare", "UFC", "TA", "staff", "member_care", false, true],
  ["mAdm", "UADM", "TA", "staff", "development", true, true],
  ["mDev", "UDEV", "TA", "staff", "development", false, true],
  ["mDonA", "UDON", "TA", "donor", null, false, true],
  ["mDonB", "UDON", "TB", "donor", null, false, true],
  ["mRev", "UREV", "TA", "staff", "hr", false, false],
  ["mB", "UB", "TB", "staff", "finance", false, true],
];
export const DISPLAY: Record<(typeof USERS)[number], string> = {
  UFC: "Avery Finance-Care",
  UADM: "Blair Admin",
  UDEV: "Casey Developer",
  UDON: "Drew Donor",
  UREV: "Emery Revoked",
  UB: "Finley Bravo",
};

export function fixtureIds() {
  const id: Record<string, string> = {};
  for (const k of ["TA", "TB", ...USERS, ...ROWS.map((r) => r[0])])
    id[k] = randomUUID();
  return id;
}

/**
 * The fixture. Inserting a login fires the sign-up trigger, which adds a
 * profile and a donor membership in the demo tenant; the fixture removes those
 * memberships so each person holds exactly the rows above, and names the
 * profiles. Profiles keep no tenant, as sign-up leaves them since AL-2675.
 */
export function fixtureSql(id: Record<string, string>) {
  const q = (k: string) => `'${id[k]}'`;
  const users = USERS.map(q).join(", ");
  return `insert into public.tenants (id, name, slug) values (${q("TA")}, 'acc2675 A', 'acc2675-' || ${q("TA")}), (${q("TB")}, 'acc2675 B', 'acc2675-' || ${q("TB")});
    insert into auth.users (id) select unnest(array[${users}]::uuid[]);
    delete from authz.memberships where user_id = any(array[${users}]::uuid[]);
    ${USERS.map((u) => `update public.profiles set display_name = '${DISPLAY[u]}' where user_id = ${q(u)};`).join("\n    ")}
    insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active) values ${ROWS.map(
      ([m, u, t, role, staff, admin, live]) =>
        `(${q(m)}, ${q(u)}, ${q(t)}, '${role}', ${staff ? `'${staff}'` : "null"}, ${admin}, ${live})`,
    ).join(", ")};`;
}
