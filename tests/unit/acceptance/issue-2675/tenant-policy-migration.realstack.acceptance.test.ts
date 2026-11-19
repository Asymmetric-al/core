/**
 * AL-2675 real-stack acceptance (WP2b, second release: the policy migration;
 * plan 5.1, 5.2, 5.4, 5.5 and WP2b's acceptance list): the database admits a
 * signed-in read only for the tenant and the assignment the request names.
 *
 * Callers are emulated as PostgREST does it for the Data API (SET LOCAL ROLE,
 * request.jwt.claims and request.headers with lower-case names; see
 * ../issue-2674/harness.ts). Every case runs in one transaction that is always
 * rolled back. The activation review behind the lists here is
 * docs/security/tenant-policy-activation-review.md.
 *
 * Runs against TENANT_GUARD_IT_ADMIN_DATABASE_URL (see ./harness.ts).
 */
import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB, asRole } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

/** People. Each holds exactly the membership rows of ROWS. */
const USERS = [
  "UP", // staff in both tenants
  "USG", // staff and donor in TA
  "UMG", // missionary and donor in TA
  "UFC", // finance and member-care staff in TA
  "UADM", // tenant administrator in TA
  "UDON", // donor in TA only
  "UMIS", // missionary in TA only
  "UREV", // a revoked staff row in TA
  "UB", // staff in TB only
  "UX", // signed in, no membership
] as const;
type User = (typeof USERS)[number];

const ROWS: [
  string,
  User,
  "TA" | "TB",
  string,
  string | null,
  boolean,
  boolean,
][] = [
  ["mPA", "UP", "TA", "staff", "development", false, true],
  ["mPB", "UP", "TB", "staff", "finance", false, true],
  ["mSGs", "USG", "TA", "staff", "finance", false, true],
  ["mSGd", "USG", "TA", "donor", null, false, true],
  ["mMGm", "UMG", "TA", "missionary", null, false, true],
  ["mMGd", "UMG", "TA", "donor", null, false, true],
  ["mFin", "UFC", "TA", "staff", "finance", false, true],
  ["mCare", "UFC", "TA", "staff", "member_care", false, true],
  ["mAdm", "UADM", "TA", "staff", "development", true, true],
  ["mDon", "UDON", "TA", "donor", null, false, true],
  ["mMis", "UMIS", "TA", "missionary", null, false, true],
  ["mRev", "UREV", "TA", "staff", "hr", false, false],
  ["mB", "UB", "TB", "staff", "finance", false, true],
];

/**
 * The tables the activation review marks staff-only (its section 5): a donor
 * or missionary assignment reads no row of them. The deny-all finance tables
 * admit no one; pdf_templates has no grant for signed-in users at all.
 */
const STAFF_ONLY = [
  "account_claim_requests",
  "audit_logs",
  "crm_command_logs",
  "crm_merge_candidates",
  "crm_notes",
  "crm_record_links",
  "legacy_account_invitations",
  "member_care_activities",
  "member_care_goals",
  "member_care_private_notes",
  "member_care_requirements",
  "notification_queue",
  "pdf_template_artifacts",
  "pdf_template_audit_events",
  "pdf_template_batch_jobs",
  "pdf_template_batches",
  "pdf_template_renders",
  "pdf_template_versions",
  "persons",
  "support_contacts",
  "support_tickets",
  "support_agents",
  "support_assignments",
  "support_audit_log",
  "support_automation_rules",
  "support_business_hours",
  "support_canned_responses",
  "support_conversation_labels",
  "support_conversations",
  "support_inbox_settings",
  "support_inboxes",
  "support_labels",
  "support_macros",
  "support_message_attachments",
  "support_messages",
  "support_notification_preferences",
  "support_saved_views",
  "support_signatures",
  "support_sla_policies",
  "support_teams",
];
const NOBODY = [
  "donation_crm_links",
  "giving_reconciliation_runs",
  "staged_gift_allocations",
  "staged_gift_audit_events",
  "staged_gifts",
  "stripe_raw_events",
];
const NO_GRANT = ["pdf_templates"];

/** Values a generated row needs where a column's check constraint asks for one. */
const OVERRIDES: Record<string, Record<string, string>> = {
  crm_command_logs: { status: "'queued'" },
  crm_notes: { visibility: "'standard'", title: "'t'", body: "'b'" },
  member_care_activities: { type: "'check_in'" },
  member_care_requirements: {
    activity_type: "'check_in'",
    interval_days: "30",
  },
  pdf_template_artifacts: { kind: "'pdf'", storage_path: "'p'" },
  pdf_template_renders: {
    mode: "'preview'",
    renderer: "'local'",
    status: "'queued'",
  },
  support_tickets: {
    queue_id: "'donor_care'",
    channel: "'email'",
    priority: "'normal'",
    status: "'open'",
  },
  support_agents: { email: "'agent@example.org'" },
  support_automation_rules: {
    actions: "'[{}]'::jsonb",
    conditions: "'[]'::jsonb",
    trigger: "'conversation_created'",
  },
  support_conversations: {
    channel: "'email'",
    external_contact_email: "'contact@example.org'",
    last_message_direction: "'inbound'",
    priority: "'normal'",
    status: "'open'",
  },
  support_inboxes: {
    channel: "'email'",
    from_address: "'from@example.org'",
    inbound_address: "'in@example.org'",
  },
  support_messages: {
    direction: "'inbound'",
    type: "'email'",
    delivery_state: "'sent'",
    author: "'{}'::jsonb",
    body: "'{}'::jsonb",
  },
  support_saved_views: { scope: "'personal'", filter: "'{}'::jsonb" },
  support_teams: { initials: "'AC'" },
  giving_reconciliation_runs: {
    run_type: "'stripe_raw_events_vs_donations'",
    status: "'running'",
  },
};

const SEVEN_REALTIME = [
  "funds",
  "locations",
  "post_comments",
  "post_fires",
  "post_likes",
  "post_prayers",
  "posts",
];

describe.skipIf(!ADMIN_URL)(
  "AL-2675 WP2b second release: the policy migration (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id: Record<string, string> = {};
    for (const k of [
      "TA",
      "TB",
      ...USERS,
      ...ROWS.map((r) => r[0]),
      ..."dSG dMG dDON dOther dB misMG misMIS misB g1 g2 g3 g4 g5".split(" "),
    ])
      id[k] = randomUUID();
    const as = asRole(db, id);
    const q = (k: string) => `'${id[k]}'`;

    beforeAll(() => db.connect());
    afterAll(() => db.end());

    const rows = async (sql: string, params: unknown[] = []) =>
      (await db.query(sql, params)).rows as Record<string, unknown>[];

    /**
     * Inserts one row as the superuser with triggers and foreign keys off
     * (session_replication_role = replica): the given columns, every NOT NULL
     * column without a default filled by type, and the table's overrides.
     */
    async function insertRow(table: string, given: Record<string, string>) {
      const cols = await rows(
        `select a.attname::text name, format_type(a.atttypid, a.atttypmod) typ, t.typtype::text kind,
                t.typcategory::text cat,
                (select e.enumlabel::text from pg_enum e where e.enumtypid = a.atttypid order by e.enumsortorder limit 1) label
           from pg_attribute a join pg_type t on t.oid = a.atttypid
          where a.attrelid = $1::regclass and a.attnum > 0 and not a.attisdropped
            and a.attnotnull and not a.atthasdef and a.attgenerated = '' and a.attidentity = ''`,
        [`public.${table}`],
      );
      const values: Record<string, string> = {
        ...Object.fromEntries(
          cols.map((c) => {
            const typ = c.typ as string;
            const v =
              c.kind === "e"
                ? `'${c.label}'::${typ}`
                : typ === "uuid"
                  ? "gen_random_uuid()"
                  : c.cat === "S"
                    ? "'acc2675'"
                    : c.cat === "N"
                      ? "1"
                      : c.cat === "B"
                        ? "false"
                        : c.cat === "D"
                          ? "now()"
                          : typ === "jsonb" || typ === "json"
                            ? `'{}'::${typ}`
                            : c.cat === "A"
                              ? `'{}'::${typ}`
                              : "null";
            return [c.name as string, v];
          }),
        ),
        ...(OVERRIDES[table] ?? {}),
        ...given,
      };
      const names = Object.keys(values);
      await db.query(
        `insert into public.${table} (${names.map((n) => `"${n}"`).join(", ")}) values (${names.map((n) => values[n]).join(", ")})`,
      );
    }

    /** The fixture: two tenants, the people of ROWS, and their gifts. */
    async function fixture() {
      await db.query(
        `insert into public.tenants (id, name, slug) values (${q("TA")}, 'acc2675r2 A', 'acc2675r2-' || ${q("TA")}), (${q("TB")}, 'acc2675r2 B', 'acc2675r2-' || ${q("TB")})`,
      );
      const users = USERS.map(q).join(", ");
      await db.query(
        `insert into auth.users (id) select unnest(array[${users}]::uuid[])`,
      );
      await db.query(
        `delete from authz.memberships where user_id = any(array[${users}]::uuid[])`,
      );
      // Legacy profile columns as a pre-WP2 profile would hold them, so a
      // test of the old profile-keyed policies can tell them apart.
      await db.query(
        `update public.profiles set tenant_id = ${q("TA")}, display_name = 'acc2675r2' where user_id = any(array[${users}]::uuid[])`,
      );
      await db.query(
        `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active) values ${ROWS.map(
          ([m, u, t, role, staff, admin, live]) =>
            `(${q(m)}, ${q(u)}, ${q(t)}, '${role}', ${staff ? `'${staff}'` : "null"}, ${admin}, ${live})`,
        ).join(", ")}`,
      );
      await db.query("set local session_replication_role = replica");
      for (const [d, tenant, profile] of [
        ["dSG", "TA", "USG"],
        ["dMG", "TA", "UMG"],
        ["dDON", "TA", "UDON"],
        ["dOther", "TA", null],
        ["dB", "TB", null],
      ] as const)
        await insertRow("donors", {
          id: q(d),
          tenant_id: q(tenant),
          profile_id: profile ? q(profile) : "null",
          email: `'${d.toLowerCase()}-${id[d]}@example.org'`,
        });
      for (const [m, tenant, profile] of [
        ["misMG", "TA", "UMG"],
        ["misMIS", "TA", "UMIS"],
        ["misB", "TB", null],
      ] as const)
        await insertRow("missionaries", {
          id: q(m),
          tenant_id: q(tenant),
          profile_id: profile ? q(profile) : "null",
        });
      for (const [g, tenant, donor, missionary] of [
        ["g1", "TA", "dSG", "misMIS"],
        ["g2", "TA", "dMG", "misMIS"],
        ["g3", "TA", "dOther", "misMG"],
        ["g4", "TA", "dDON", "misMIS"],
        ["g5", "TB", "dB", "misB"],
      ] as const)
        await insertRow("donations", {
          id: q(g),
          tenant_id: q(tenant),
          donor_id: q(donor),
          missionary_id: q(missionary),
        });
      await db.query("set local session_replication_role = origin");
    }

    async function tx(fn: () => Promise<void>) {
      await db.query("begin");
      try {
        await fixture();
        await fn();
      } finally {
        await db.query("rollback");
      }
    }

    /** The request headers of a caller acting under membership row `m`. */
    const under = (m: string, tenant?: string) => {
      const row = ROWS.find((r) => r[0] === m)!;
      return {
        "x-asym-tenant": id[tenant ?? row[2]]!,
        "x-asym-assignment": id[m]!,
      };
    };
    const ids = (r: { rows: Record<string, unknown>[] }) =>
      r.rows.map((x) => Object.keys(id).find((k) => id[k] === x.id) ?? x.id);
    const sorted = (xs: unknown[]) => [...xs].map(String).sort();

    describe("the request's tenant and assignment", () => {
      it("current_tenant_id() is the named tenant only when the request's assignment resolves there, and never the token claim", () =>
        tx(async () => {
          const tenantOf = async (
            sub: User,
            headers?: Record<string, string>,
          ) => {
            const r = await as(
              "authenticated",
              { sub, headers },
              "select authz.current_tenant_id() t",
            );
            expect(r.code, r.message).toBeNull();
            return r.rows[0]!.t ?? null;
          };
          expect(await tenantOf("UP", under("mPA"))).toBe(id.TA);
          expect(await tenantOf("UP", under("mPB"))).toBe(id.TB);
          // The caller's one live row there, with no assignment header.
          expect(await tenantOf("UP", { "x-asym-tenant": id.TA! })).toBe(id.TA);
          // An assignment in another tenant than the one named.
          expect(await tenantOf("UP", under("mPB", "TA"))).toBeNull();
          // No tenant header: no tenant, whatever else the request carries.
          expect(await tenantOf("UP")).toBeNull();
          expect(
            await tenantOf("UP", { "x-asym-assignment": id.mPA! }),
          ).toBeNull();
          // A forged tenant, someone else's row, a revoked row.
          expect(await tenantOf("UB", { "x-asym-tenant": id.TA! })).toBeNull();
          expect(await tenantOf("UB", under("mPB"))).toBeNull();
          expect(await tenantOf("UREV", under("mRev"))).toBeNull();
          expect(await tenantOf("UX", { "x-asym-tenant": id.TA! })).toBeNull();
          // Several live rows and none named: no assignment, so no tenant.
          expect(await tenantOf("USG", { "x-asym-tenant": id.TA! })).toBeNull();
          expect(await tenantOf("UFC", { "x-asym-tenant": id.TA! })).toBeNull();
        }));

      it("ignores the app_metadata.tenant_id claim", () =>
        tx(async () => {
          await db.query("savepoint claim");
          await db.query("set local role authenticated");
          await db.query(
            "select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', '', true), set_config('request.headers', '', true)",
            [
              JSON.stringify({
                sub: id.UP,
                role: "authenticated",
                app_metadata: { tenant_id: id.TA },
              }),
            ],
          );
          const r = await rows("select authz.current_tenant_id() t");
          await db.query("rollback to savepoint claim");
          expect(r[0]!.t).toBeNull();
        }));

      // Ruled on the activation review's Q11: a hyphenated UUID in any letter
      // case is accepted, as the command lane accepts it; the upper-case case
      // moved to the Q11 test below, which asserts that it works.
      it("refuses a tenant or assignment header that is not a hyphenated UUID (22P02), and is not an empty read", () =>
        tx(async () => {
          for (const bad of [
            "not-a-uuid",
            id.TA!.replaceAll("-", ""),
            `{${id.TA!}}`,
          ]) {
            const r = await as(
              "authenticated",
              {
                sub: "UP",
                headers: { "x-asym-tenant": bad, "x-asym-assignment": id.mPA! },
              },
              "select id from public.donors",
            );
            expect(r.code, bad).toBe("22P02");
          }
          const r = await as(
            "authenticated",
            {
              sub: "UP",
              headers: { "x-asym-tenant": id.TA!, "x-asym-assignment": "nope" },
            },
            "select id from public.donors",
          );
          expect(r.code).toBe("22P02");
        }));

      it("the helpers are STABLE and PARALLEL SAFE; the one definer resolves the row and only signed-in users may call the helpers", () =>
        tx(async () => {
          const fns = await rows(
            `select p.oid::regprocedure::text fn, p.provolatile v, p.proparallel par, p.prosecdef def,
                    pg_get_userbyid(p.proowner) owner,
                    has_function_privilege('anon', p.oid, 'EXECUTE') anon,
                    has_function_privilege('authenticated', p.oid, 'EXECUTE') auth,
                    exists (select 1 from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                             where a.grantee = 0 and a.privilege_type = 'EXECUTE') pub
               from pg_proc p join pg_namespace n on n.oid = p.pronamespace
              where n.nspname = 'authz'
                and p.proname in ('request_tenant_id', 'request_assignment_id', 'request_assignment',
                                  'current_tenant_id', 'assignment_is', 'assignment_is_tenant_admin',
                                  'assignment_holds', 'caller_profile_ids', 'has_membership',
                                  'has_staff_membership')
              order by 1`,
          );
          expect(fns.map((f) => f.fn)).toEqual([
            "authz.assignment_holds(text)",
            "authz.assignment_is(authz.membership_role,authz.staff_role[])",
            "authz.assignment_is_tenant_admin()",
            "authz.caller_profile_ids()",
            "authz.current_tenant_id()",
            "authz.has_membership(uuid,authz.membership_role[])",
            "authz.has_staff_membership(uuid,authz.staff_role[])",
            "authz.request_assignment()",
            "authz.request_assignment_id()",
            "authz.request_tenant_id()",
          ]);
          for (const f of fns) {
            expect(f.v, f.fn as string).toBe("s");
            expect(f.par, f.fn as string).toBe("s");
            expect(f.auth, f.fn as string).toBe(true);
            // current_tenant_id keeps the PUBLIC EXECUTE that #2270 (C1)
            // pins for the invoker helpers; anon still reaches no row, since
            // it may not call the resolver beneath it.
            if (f.fn !== "authz.current_tenant_id()")
              expect(f.anon, f.fn as string).toBe(false);
          }
          // The super-admin branch every rewritten policy keeps until WP2c
          // must not deny caller-token reads a parallel plan.
          const superAdmin = await rows(
            "select provolatile v, proparallel par from pg_proc where oid = 'authz.is_super_admin()'::regprocedure",
          );
          expect(superAdmin).toEqual([{ v: "s", par: "s" }]);
          const anon = await as(
            "anon",
            {},
            "select authz.current_tenant_id() t",
          );
          expect(anon.code).toBe("42501");
          const definers = fns.filter((f) => f.def).map((f) => f.fn);
          expect(definers).toEqual([
            "authz.assignment_holds(text)",
            "authz.has_membership(uuid,authz.membership_role[])",
            "authz.has_staff_membership(uuid,authz.staff_role[])",
            "authz.request_assignment()",
          ]);
          for (const f of fns.filter((x) => x.def)) {
            expect(f.owner).toBe("postgres");
            expect(f.pub, f.fn as string).toBe(false);
          }
        }));
    });

    describe("what a person can and cannot read", () => {
      // A request that names no tenant receives no row of a tenant table,
      // outside the named exceptions of the activation review's section 3:
      // the public reads of posts, locations and the post tables (WP7), the
      // claimant's own claims (WP5), the caller's own profile and the global
      // field_policies rows. This case reads donors and donations.
      it("a person in both tenants who reads with no filter receives one tenant's rows; a request that names no tenant receives none (outside the named exceptions)", () =>
        tx(async () => {
          const ta = await as(
            "authenticated",
            { sub: "UP", headers: under("mPA") },
            "select id, tenant_id from public.donors where id = any($$" +
              `{${[id.dSG, id.dMG, id.dDON, id.dOther, id.dB].join(",")}}` +
              "$$::uuid[])",
          );
          expect(ta.code, ta.message).toBeNull();
          expect(sorted(ids(ta))).toEqual(
            sorted(["dSG", "dMG", "dDON", "dOther"]),
          );
          const giftsA = await as(
            "authenticated",
            { sub: "UP", headers: under("mPA") },
            `select id from public.donations where tenant_id in (${q("TA")}, ${q("TB")})`,
          );
          expect(sorted(ids(giftsA))).toEqual(sorted(["g1", "g2", "g3", "g4"]));
          // The unfiltered read: every row returned belongs to the named tenant.
          const all = await as(
            "authenticated",
            { sub: "UP", headers: under("mPB") },
            "select distinct tenant_id from public.donations",
          );
          expect(all.rows.map((r) => r.tenant_id)).toEqual([id.TB]);
          const giftsB = await as(
            "authenticated",
            { sub: "UP", headers: under("mPB") },
            `select id from public.donations where tenant_id in (${q("TA")}, ${q("TB")})`,
          );
          expect(ids(giftsB)).toEqual(["g5"]);
          for (const headers of [undefined, { "x-asym-assignment": id.mPA! }]) {
            const none = await as(
              "authenticated",
              { sub: "UP", headers },
              "select count(*)::int n from public.donations",
            );
            expect(none.rows[0]!.n).toBe(0);
            const noDonors = await as(
              "authenticated",
              { sub: "UP", headers },
              "select count(*)::int n from public.donors",
            );
            expect(noDonors.rows[0]!.n).toBe(0);
          }
        }));

      it("a revoked membership is refused at the next request; an assignment that is revoked or not the caller's is refused", () =>
        tx(async () => {
          const read = () =>
            as(
              "authenticated",
              { sub: "UP", headers: under("mPA") },
              `select count(*)::int n from public.donations where tenant_id = ${q("TA")}`,
            );
          expect((await read()).rows[0]!.n).toBe(4);
          await db.query(
            "update authz.memberships set revoked_at = now() where id = $1",
            [id.mPA],
          );
          expect((await read()).rows[0]!.n).toBe(0);
          const revoked = await as(
            "authenticated",
            { sub: "UREV", headers: under("mRev") },
            "select count(*)::int n from public.donations",
          );
          expect(revoked.rows[0]!.n).toBe(0);
          // UB names UP's row in TB, then UP's row in TA.
          for (const m of ["mPB", "mAdm"]) {
            const notTheirs = await as(
              "authenticated",
              { sub: "UB", headers: under(m) },
              "select count(*)::int n from public.donations",
            );
            expect(notTheirs.rows[0]!.n, m).toBe(0);
          }
        }));

      it("refuses a direct update of a support audit row, a staff member's direct insert into support_messages, notification_queue, crm_command_logs and pdf_template_audit_events, and a direct read of another member's profile row", () =>
        tx(async () => {
          await db.query("set local session_replication_role = replica");
          await insertRow("support_audit_log", { tenant_id: q("TA") });
          await db.query("set local session_replication_role = origin");
          const update = await as(
            "authenticated",
            { sub: "UADM", headers: under("mAdm") },
            `update public.support_audit_log set tenant_id = tenant_id where tenant_id = ${q("TA")}`,
          );
          expect(update.code).toBe("42501");
          expect(update.message).toMatch(
            /permission denied for table support_audit_log/,
          );
          for (const t of [
            "support_messages",
            "notification_queue",
            "crm_command_logs",
            "pdf_template_audit_events",
          ]) {
            const insert = await as(
              "authenticated",
              { sub: "UADM", headers: under("mAdm") },
              `insert into public.${t} (tenant_id) values (${q("TA")})`,
            );
            expect(insert.code, t).toBe("42501");
            expect(insert.message, t).toMatch(
              new RegExp(`permission denied for table ${t}`),
            );
          }
          // UP is staff in TA; UADM's profile names TA (fixture). Only the
          // caller's own profile row is readable.
          const other = await as(
            "authenticated",
            { sub: "UP", headers: under("mPA") },
            `select id from public.profiles where id in (${q("UADM")}, ${q("UP")})`,
          );
          expect(other.code, other.message).toBeNull();
          expect(ids(other)).toEqual(["UP"]);
        }));

      it("refuses a direct insert into audit_logs, each member-care table and field_policies on a signed-in token, for a row of every class", () =>
        tx(async () => {
          const callers: [User, string][] = [
            ["UDON", "mDon"],
            ["UMIS", "mMis"],
            ["UFC", "mFin"],
            ["UFC", "mCare"],
            ["UADM", "mAdm"],
          ];
          for (const t of [
            "audit_logs",
            "member_care_activities",
            "member_care_goals",
            "member_care_private_notes",
            "member_care_requirements",
            "field_policies",
          ])
            for (const [u, m] of callers) {
              const r = await as(
                "authenticated",
                { sub: u, headers: under(m) },
                `insert into public.${t} (tenant_id) values (${q("TA")})`,
              );
              expect(r.code, `${t} ${m}`).toBe("42501");
              expect(r.message, `${t} ${m}`).toMatch(
                new RegExp(`permission denied for table ${t}`),
              );
            }
        }));

      it("a donor-class or missionary-class member reads no row of a staff-only table, which a staff member of the tenant does read", () =>
        tx(async () => {
          await db.query("set local session_replication_role = replica");
          for (const t of [...STAFF_ONLY, ...NOBODY, ...NO_GRANT])
            await insertRow(t, {
              tenant_id: q("TA"),
              ...(t === "member_care_private_notes"
                ? { author_user_id: q("UADM") }
                : {}),
            });
          await db.query("set local session_replication_role = origin");
          for (const t of [...STAFF_ONLY, ...NOBODY, ...NO_GRANT]) {
            for (const [u, m] of [
              ["UDON", "mDon"],
              ["UMIS", "mMis"],
              ["USG", "mSGd"],
              ["UMG", "mMGm"],
            ] as [User, string][]) {
              const r = await as(
                "authenticated",
                { sub: u, headers: under(m) },
                `select count(*)::int n from public.${t}`,
              );
              if (NO_GRANT.includes(t))
                expect(r.code, `${t} ${m}`).toBe("42501");
              else {
                expect(r.code, `${t} ${m}: ${r.message}`).toBeNull();
                expect(r.rows[0]!.n, `${t} ${m}`).toBe(0);
              }
            }
            const staff = await as(
              "authenticated",
              { sub: "UADM", headers: under("mAdm") },
              `select count(*)::int n from public.${t}`,
            );
            if (NO_GRANT.includes(t)) expect(staff.code, t).toBe("42501");
            else {
              expect(staff.code, `${t}: ${staff.message}`).toBeNull();
              expect(staff.rows[0]!.n, t).toBe(NOBODY.includes(t) ? 0 : 1);
            }
          }
        }));

      it("a donor row and a missionary row still read field_policies", () =>
        tx(async () => {
          for (const [u, m] of [
            ["UDON", "mDon"],
            ["UMIS", "mMis"],
          ] as [User, string][]) {
            const r = await as(
              "authenticated",
              { sub: u, headers: under(m) },
              "select count(*)::int n from public.field_policies",
            );
            expect(r.code, r.message).toBeNull();
            expect(r.rows[0]!.n, m).toBeGreaterThan(0);
          }
          const none = await as(
            "authenticated",
            { sub: "UDON" },
            "select count(*)::int n from public.field_policies",
          );
          expect(none.rows[0]!.n).toBe(0);
        }));

      it("a staff member who also gives receives under the donor assignment their own gifts and no others, and nothing with no assignment header", () =>
        tx(async () => {
          const gifts = (m: string | null) =>
            as(
              "authenticated",
              {
                sub: "USG",
                headers: m ? under(m) : { "x-asym-tenant": id.TA! },
              },
              "select id from public.donations",
            );
          expect(ids(await gifts("mSGd"))).toEqual(["g1"]);
          expect((await gifts(null)).rows).toEqual([]);
          expect(sorted(ids(await gifts("mSGs")))).toEqual(
            sorted(["g1", "g2", "g3", "g4"]),
          );
        }));

      it("a missionary who also gives receives under the donor assignment the gifts they gave and none given to them, and the reverse under the missionary assignment", () =>
        tx(async () => {
          const gifts = (m: string) =>
            as(
              "authenticated",
              { sub: "UMG", headers: under(m) },
              "select id from public.donations",
            );
          expect(ids(await gifts("mMGd"))).toEqual(["g2"]);
          expect(ids(await gifts("mMGm"))).toEqual(["g3"]);
          const donors = await as(
            "authenticated",
            { sub: "UMG", headers: under("mMGm") },
            "select id from public.donors",
          );
          expect(donors.rows).toEqual([]);
          const own = await as(
            "authenticated",
            { sub: "UMG", headers: under("mMGd") },
            "select id from public.donors",
          );
          expect(ids(own)).toEqual(["dMG"]);
        }));

      it("a person with finance and member-care rows holds no care.access under the finance row, in the database's own judgment, and does under the other", () =>
        tx(async () => {
          const holds = async (m: string) => {
            const r = await as(
              "authenticated",
              { sub: "UFC", headers: under(m) },
              "select authz.assignment_holds('care.access') ok, authz.assignment_is('staff', array['member_care']::authz.staff_role[]) care",
            );
            expect(r.code, r.message).toBeNull();
            return r.rows[0];
          };
          expect(await holds("mFin")).toEqual({ ok: false, care: false });
          expect(await holds("mCare")).toEqual({ ok: true, care: true });
          const none = await as(
            "authenticated",
            { sub: "UFC", headers: { "x-asym-tenant": id.TA! } },
            "select authz.assignment_holds('care.access') ok",
          );
          expect(none.rows[0]!.ok).toBe(false);
        }));

      it("a finance staff member cannot read a restricted note, whatever the profile role; the tenant administrator can", () =>
        tx(async () => {
          await db.query("set local session_replication_role = replica");
          await insertRow("crm_notes", {
            tenant_id: q("TA"),
            visibility: "'restricted'",
            title: "'restricted'",
          });
          await insertRow("crm_notes", {
            tenant_id: q("TA"),
            visibility: "'standard'",
            title: "'standard'",
          });
          await db.query("set local session_replication_role = origin");
          // The old gate read profiles.role; give the finance member that role.
          await db.query(
            "update public.profiles set role = 'admin' where user_id = $1",
            [id.UFC],
          );
          const notes = (u: User, m: string) =>
            as(
              "authenticated",
              { sub: u, headers: under(m) },
              "select title from public.crm_notes order by title",
            );
          expect((await notes("UFC", "mFin")).rows).toEqual([
            { title: "standard" },
          ]);
          expect((await notes("UADM", "mAdm")).rows).toEqual([
            { title: "restricted" },
            { title: "standard" },
          ]);
        }));
    });

    describe("Storage and Realtime", () => {
      /** Storage's own grants on a hosted project, inside the case's transaction. */
      const storageGrants = () =>
        db.query(
          "grant usage on schema storage to anon, authenticated; grant select, insert, update, delete on storage.objects to anon, authenticated",
        );

      it("an anonymous listing of email-assets returns nothing, and the bucket stays public so an image loads by its address", () =>
        tx(async () => {
          await storageGrants();
          await db.query(
            `insert into storage.objects (bucket_id, name) values ('email-assets', 'acc2675/${id.TA}.png')`,
          );
          const anon = await as(
            "anon",
            {},
            "select count(*)::int n from storage.objects where bucket_id = 'email-assets'",
          );
          expect(anon.code, anon.message).toBeNull();
          expect(anon.rows[0]!.n).toBe(0);
          const signedIn = await as(
            "authenticated",
            { sub: "UP", headers: under("mPA") },
            "select count(*)::int n from storage.objects where bucket_id = 'email-assets'",
          );
          expect(signedIn.rows[0]!.n).toBe(0);
          expect(
            await rows(
              "select public from storage.buckets where id = 'email-assets'",
            ),
          ).toEqual([{ public: true }]);
          const policies = await rows(
            "select polname from pg_policy where polrelid = 'storage.objects'::regclass and (pg_get_expr(polqual, polrelid) like '%email-assets%' or pg_get_expr(polwithcheck, polrelid) like '%email-assets%')",
          );
          expect(policies).toEqual([]);
        }));

      it("avatar and editor-image uploads work for a person with two memberships and for a person with two rows in one tenant, with no headers, and only in a tenant where the person holds a live row", () =>
        tx(async () => {
          await storageGrants();
          const upload = (u: User, bucket: string, path: string) =>
            as(
              "authenticated",
              { sub: u },
              `insert into storage.objects (bucket_id, name, owner) values ('${bucket}', '${path}', ${q(u)}) returning name`,
            );
          for (const [u, t] of [
            ["UP", "TA"],
            ["UP", "TB"],
            ["USG", "TA"],
            ["UFC", "TA"],
          ] as [User, string][]) {
            const avatar = await upload(
              u,
              "profiles",
              `avatars/${id[t]}/${id[u]}/a.png`,
            );
            expect(avatar.code, `${u} ${t}: ${avatar.message}`).toBeNull();
            const editor = await upload(
              u,
              "document-uploads",
              `editor/${id[t]}/${id[u]}/e.png`,
            );
            expect(editor.code, `${u} ${t}: ${editor.message}`).toBeNull();
          }
          for (const [u, t] of [
            ["UB", "TA"],
            ["UREV", "TA"],
            ["UX", "TA"],
          ] as [User, string][]) {
            const refused = await upload(
              u,
              "profiles",
              `avatars/${id[t]}/${id[u]}/a.png`,
            );
            expect(refused.code, `${u} ${t}`).toBe("42501");
          }
        }));

      it("none of the seven tables is in the Realtime publication", () =>
        tx(async () => {
          const published = await rows(
            "select tablename::text t from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = any($1)",
            [SEVEN_REALTIME],
          );
          expect(published).toEqual([]);
        }));
    });

    /**
     * The coordinator's rulings of 19 November 2026 on the activation
     * review's questions (docs/security/tenant-policy-activation-review.md,
     * section 8), each with the test the ruling names.
     */
    describe("the rulings on the activation review", () => {
      /** As `as`, with extra token claims (the seed writes app_metadata.tenant_id). */
      async function asClaims(
        sub: User,
        headers: Record<string, string> | undefined,
        extra: Record<string, unknown>,
        sql: string,
      ) {
        await db.query("savepoint claims");
        try {
          await db.query("set local role authenticated");
          await db.query(
            "select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', '', true), set_config('request.headers', $2, true)",
            [
              JSON.stringify({ sub: id[sub], role: "authenticated", ...extra }),
              headers ? JSON.stringify(headers) : "",
            ],
          );
          const r = await db.query(sql);
          return {
            rows: r.rows as Record<string, unknown>[],
            code: null as string | null,
          };
        } catch (e) {
          return { rows: [], code: (e as { code?: string }).code ?? "?" };
        } finally {
          await db.query("rollback to savepoint claims");
        }
      }
      const replica = (on: boolean) =>
        db.query(
          `set local session_replication_role = ${on ? "replica" : "origin"}`,
        );

      it("Q2: assets, campaigns and funds are staff-only: a donor or missionary assignment reads no row, even with the tenant claim; staff read their own tenant's rows only", () =>
        tx(async () => {
          await replica(true);
          for (const t of ["assets", "campaigns", "funds"])
            for (const tenant of ["TA", "TB"])
              await insertRow(t, { tenant_id: q(tenant) });
          await replica(false);
          for (const t of ["assets", "campaigns", "funds"]) {
            for (const [u, m] of [
              ["UDON", "mDon"],
              ["UMIS", "mMis"],
              ["USG", "mSGd"],
              ["UMG", "mMGm"],
            ] as [User, string][]) {
              const r = await asClaims(
                u,
                under(m),
                { app_metadata: { tenant_id: id.TA } },
                `select count(*)::int n from public.${t}`,
              );
              expect(r.code, `${t} ${m}`).toBeNull();
              expect(r.rows[0]!.n, `${t} ${m}`).toBe(0);
            }
            const staff = await as(
              "authenticated",
              { sub: "UP", headers: under("mPA") },
              `select distinct tenant_id from public.${t}`,
            );
            expect(
              staff.rows.map((r) => r.tenant_id),
              t,
            ).toEqual([id.TA]);
            const policy = await rows(
              "select pg_get_expr(polqual, polrelid) q from pg_policy where polrelid = $1::regclass and polname = 'tenant scoped read'",
              [`public.${t}`],
            );
            expect(policy[0]!.q, t).toContain(
              "authz.assignment_is('staff'::authz.membership_role)",
            );
          }
        }));

      it("Q1: a staff member without the flag reads no row of another agent's notification preferences or personal saved views; the tenant administrator reads them", () =>
        tx(async () => {
          await replica(true);
          for (const [agent, user] of [
            ["aADM", "UADM"],
            ["aFIN", "UFC"],
          ] as const) {
            await insertRow("support_agents", {
              tenant_id: q("TA"),
              id: `'${agent}'`,
              user_id: q(user),
              email: `'${agent}@example.org'`,
            });
            await insertRow("support_notification_preferences", {
              tenant_id: q("TA"),
              id: `'np-${agent}'`,
              agent_id: `'${agent}'`,
            });
            await insertRow("support_saved_views", {
              tenant_id: q("TA"),
              id: `'sv-${agent}'`,
              owner_agent_id: `'${agent}'`,
              scope: "'personal'",
              slug: `'${agent}'`,
            });
          }
          await insertRow("support_saved_views", {
            tenant_id: q("TA"),
            id: "'sv-shared'",
            owner_agent_id: "null",
            scope: "'workspace'",
            slug: "'shared'",
          });
          await replica(false);
          const read = (u: User, m: string, t: string) =>
            as(
              "authenticated",
              { sub: u, headers: under(m) },
              `select id from public.${t} order by id`,
            );
          expect(
            (await read("UFC", "mFin", "support_notification_preferences"))
              .rows,
          ).toEqual([{ id: "np-aFIN" }]);
          expect(
            (await read("UFC", "mFin", "support_saved_views")).rows,
          ).toEqual([{ id: "sv-aFIN" }, { id: "sv-shared" }]);
          expect(
            (await read("UADM", "mAdm", "support_notification_preferences"))
              .rows,
          ).toEqual([{ id: "np-aADM" }, { id: "np-aFIN" }]);
          expect(
            (await read("UADM", "mAdm", "support_saved_views")).rows,
          ).toEqual([
            { id: "sv-aADM" },
            { id: "sv-aFIN" },
            { id: "sv-shared" },
          ]);
          // Signatures and the other tables stay staff-wide.
          expect((await read("UFC", "mFin", "support_agents")).rows).toEqual([
            { id: "aADM" },
            { id: "aFIN" },
          ]);
        }));

      it("Q3: a signed-in unfiltered read of posts returns published public rows only, under any assignment or none", () =>
        tx(async () => {
          await replica(true);
          for (const [status, visibility] of [
            ["published", "public"],
            ["draft", "public"],
            ["published", "followers"],
          ])
            await insertRow("posts", {
              tenant_id: q("TA"),
              status: `'${status}'`,
              visibility: `'${visibility}'`,
            });
          await replica(false);
          for (const [sub, headers] of [
            ["UP", under("mPA")],
            ["UDON", under("mDon")],
            ["UX", undefined],
          ] as [User, Record<string, string> | undefined][]) {
            const r = await as(
              "authenticated",
              { sub, headers },
              `select distinct status, visibility from public.posts where tenant_id = ${q("TA")}`,
            );
            expect(r.code, sub).toBeNull();
            expect(r.rows, sub).toEqual([
              { status: "published", visibility: "public" },
            ]);
          }
        }));

      it("Q7, Q8: no signed-in write policy remains on a table whose write grants went, and a staff member's direct insert or update of crm_merge_candidates is refused", () =>
        tx(async () => {
          const left = await rows(
            `select c.relname::text t, p.polname::text p from pg_policy p join pg_class c on c.oid = p.polrelid
              where c.relnamespace = 'public'::regnamespace and p.polcmd in ('a', 'w', 'd', '*')
                and p.polroles && array[0::oid, 'authenticated'::regrole::oid]
                and pg_get_expr(p.polqual, p.polrelid) is distinct from 'false'
                and c.relname = any($1) order by 1, 2`,
            [
              [
                ...STAFF_ONLY.filter(
                  (t) =>
                    ![
                      "crm_notes",
                      "account_claim_requests",
                      "crm_record_links",
                      "legacy_account_invitations",
                      "persons",
                    ].includes(t),
                ),
                "field_policies",
              ],
            ],
          );
          expect(left).toEqual([]);
          for (const sql of [
            `insert into public.crm_merge_candidates (tenant_id) values (${q("TA")})`,
            `update public.crm_merge_candidates set tenant_id = tenant_id where tenant_id = ${q("TA")}`,
          ]) {
            const r = await as(
              "authenticated",
              { sub: "UADM", headers: under("mAdm") },
              sql,
            );
            expect(r.code, sql).toBe("42501");
            expect(r.message, sql).toMatch(
              /permission denied for table crm_merge_candidates/,
            );
          }
        }));

      // The coordinator's follow-up on Q7: no signed-in write policy on a
      // table where signed-in users hold no write grant, so a grant that came
      // back by accident fails the catalog gate instead of admitting every
      // staff sub-role. The catalog half fails before the drop; the refusal
      // half is a regression guard, because signed-in users already held no
      // write grant on either table.
      it("Q7: pdf_templates and crm_record_links carry no signed-in write policy, and a staff member's direct insert and update on each are refused", () =>
        tx(async () => {
          const left = await rows(
            `select c.relname::text t, p.polname::text p from pg_policy p join pg_class c on c.oid = p.polrelid
              where c.relnamespace = 'public'::regnamespace and p.polcmd in ('a', 'w', 'd')
                and p.polroles && array[0::oid, 'authenticated'::regrole::oid]
                and c.relname in ('pdf_templates', 'crm_record_links') order by 1, 2`,
          );
          expect(left).toEqual([]);
          for (const t of ["pdf_templates", "crm_record_links"])
            for (const sql of [
              `insert into public.${t} (tenant_id) values (${q("TA")})`,
              `update public.${t} set tenant_id = tenant_id where tenant_id = ${q("TA")}`,
            ]) {
              const r = await as(
                "authenticated",
                { sub: "UADM", headers: under("mAdm") },
                sql,
              );
              expect(r.code, sql).toBe("42501");
              expect(r.message, sql).toMatch(
                new RegExp(`permission denied for table ${t}`),
              );
            }
        }));

      // Amended by council R1 (record D-18): the commenter read and the
      // comments route's move onto it ship in the first release (slice B,
      // JB11), because the release job migrates before it promotes the apps;
      // this migration no longer defines public.post_comment_authors. What
      // stays here is the policy drop: another member's profile row is not
      // readable. Where the chain holds a migration that defines the read, it
      // is asserted as the coordinator ruled it: a display name only, NULL
      // when blank with no fallback to another name field, and a name and an
      // avatar only for a caller with a live membership of any class in the
      // post's organization; others get the rows with no name. The columns
      // are assumed to be (user_id, display_name, avatar_url), as ruled.
      it("Q9: a donor cannot read another member's profile row; where the chain defines the commenter read, it names an author by display name alone, to a member of the post's organization only", () =>
        tx(async () => {
          const post = randomUUID();
          await db.query(
            "update public.profiles set display_name = 'Blair Admin', full_name = 'Blair Full', avatar_url = 'https://example.org/a.png', email = 'blair@example.org' where user_id = $1",
            [id.UADM],
          );
          await db.query(
            "update public.profiles set display_name = '  ', full_name = 'Pat Full' where user_id = $1",
            [id.UP],
          );
          await replica(true);
          await insertRow("posts", {
            id: `'${post}'`,
            tenant_id: q("TA"),
            status: "'published'",
            visibility: "'public'",
          });
          for (const u of ["UADM", "UP"])
            await insertRow("post_comments", {
              post_id: `'${post}'`,
              user_id: q(u),
              content: "'hello'",
            });
          await replica(false);
          const profile = await as(
            "authenticated",
            { sub: "UDON", headers: under("mDon") },
            `select id from public.profiles where id in (${q("UADM")}, ${q("UP")})`,
          );
          expect(profile.code, profile.message).toBeNull();
          expect(profile.rows).toEqual([]);

          const defines = (file: string) =>
            readFileSync(`supabase/migrations/${file}`, "utf8").includes(
              "FUNCTION public.post_comment_authors",
            );
          const shipped = readdirSync("supabase/migrations").some(
            (f) => /^\d{14}_.+\.sql$/.test(f) && defines(f),
          );
          const [{ defined }] = (await rows(
            "select to_regprocedure('public.post_comment_authors(uuid)') is not null defined",
          )) as [{ defined: boolean }];
          expect(defined).toBe(shipped);
          if (!defined) return;
          const authors = async (u: User, m?: string) => {
            const r = await as(
              "authenticated",
              { sub: u, headers: m ? under(m) : undefined },
              `select user_id, display_name, avatar_url from public.post_comment_authors('${post}') order by user_id`,
            );
            expect(r.code, r.message).toBeNull();
            return Object.fromEntries(
              r.rows.map((row) => [
                Object.keys(id).find((k) => id[k] === row.user_id),
                [row.display_name, row.avatar_url],
              ]),
            );
          };
          // A member of the post's organization, of any class.
          expect(await authors("UDON", "mDon")).toEqual({
            UADM: ["Blair Admin", "https://example.org/a.png"],
            UP: [null, null],
          });
          // A signed-in person with no row there: the rows, no names.
          expect(await authors("UB", "mB")).toEqual({
            UADM: [null, null],
            UP: [null, null],
          });
          const anon = await as(
            "anon",
            {},
            `select * from public.post_comment_authors('${post}')`,
          );
          expect(anon.code).toBe("42501");
        }));

      it("Q10: after a revoke, a person's delete or read of their own image in that tenant's folder is refused; with a live row it works", () =>
        tx(async () => {
          await db.query(
            "grant usage on schema storage to authenticated; grant select, insert, update, delete on storage.objects to authenticated",
          );
          const paths = {
            profiles: [
              `avatars/${id.TA}/${id.UP}/one.png`,
              `avatars/${id.TA}/${id.UP}/two.png`,
            ],
            "document-uploads": [
              `editor/${id.TA}/${id.UP}/one.png`,
              `editor/${id.TA}/${id.UP}/two.png`,
            ],
          };
          for (const [bucket, [a, b]] of Object.entries(paths))
            await db.query(
              "insert into storage.objects (bucket_id, name, owner) values ($1, $2, $4), ($1, $3, $4)",
              [bucket, a, b, id.UP],
            );
          for (const [bucket, [a]] of Object.entries(paths)) {
            const read = await as(
              "authenticated",
              { sub: "UP" },
              `select name from storage.objects where bucket_id = '${bucket}' and name = '${a}'`,
            );
            expect(read.rows, bucket).toHaveLength(1);
            const del = await as(
              "authenticated",
              { sub: "UP" },
              `delete from storage.objects where bucket_id = '${bucket}' and name = '${a}' returning name`,
            );
            expect(del.rows, bucket).toHaveLength(1);
          }
          await db.query(
            "update authz.memberships set revoked_at = now() where id = $1",
            [id.mPA],
          );
          for (const [bucket, [, b]] of Object.entries(paths)) {
            const read = await as(
              "authenticated",
              { sub: "UP" },
              `select name from storage.objects where bucket_id = '${bucket}' and name = '${b}'`,
            );
            expect(read.rows, bucket).toEqual([]);
            const del = await as(
              "authenticated",
              { sub: "UP" },
              `delete from storage.objects where bucket_id = '${bucket}' and name = '${b}' returning name`,
            );
            expect(del.rows, bucket).toEqual([]);
          }
          // Each call above runs in its own rolled-back savepoint, so the
          // refused deletes left both objects in place: the superuser still
          // sees all four.
          expect(
            await rows(
              "select count(*)::int n from storage.objects where owner = $1",
              [id.UP],
            ),
          ).toEqual([{ n: 4 }]);
        }));

      it("Q11: an upper-case assignment header works on a Data API read, the member directory and a command; garbage raises 22P02 on all three; a blank header acts as absent", () =>
        tx(async () => {
          const upper = {
            "x-asym-tenant": id.TA!.toUpperCase(),
            "x-asym-assignment": id.mPA!.toUpperCase(),
          };
          const calls = [
            "select count(*)::int n from public.donors",
            `select count(*)::int n from public.tenant_member_directory(${q("TA")})`,
            `select (public.resolve_command_assignment(${q("TA")}))::text n`,
          ];
          for (const sql of calls) {
            const ok = await as(
              "authenticated",
              { sub: "UP", headers: upper },
              sql,
            );
            expect(ok.code, `${sql}: ${ok.message}`).toBeNull();
            const bad = await as(
              "authenticated",
              {
                sub: "UP",
                headers: {
                  "x-asym-tenant": id.TA!,
                  "x-asym-assignment": "garbage",
                },
              },
              sql,
            );
            expect(bad.code, sql).toBe("22P02");
            const blank = await as(
              "authenticated",
              {
                sub: "UP",
                headers: {
                  "x-asym-tenant": id.TA!,
                  "x-asym-assignment": "   ",
                },
              },
              sql,
            );
            expect(blank.code, `${sql}: ${blank.message}`).toBeNull();
          }
          const donors = await as(
            "authenticated",
            { sub: "UP", headers: upper },
            "select count(*)::int n from public.donors",
          );
          expect(donors.rows[0]!.n).toBe(4);
          const badTenant = await as(
            "authenticated",
            { sub: "UP", headers: { "x-asym-tenant": "garbage" } },
            "select count(*)::int n from public.donors",
          );
          expect(badTenant.code).toBe("22P02");
          const blankTenant = await as(
            "authenticated",
            { sub: "UP", headers: { "x-asym-tenant": " " } },
            "select count(*)::int n from public.donors",
          );
          expect(blankTenant.rows[0]!.n).toBe(0);
        }));

      it("defect 9: with no assignment header, a person with a staff and a donor row in the tenant passes no staff check of the member directory; naming the staff row does", () =>
        tx(async () => {
          const dir = (headers?: Record<string, string>) =>
            as(
              "authenticated",
              { sub: "USG", headers },
              `select count(*)::int n from public.tenant_member_directory(${q("TA")})`,
            );
          expect((await dir()).code).toBe("42501");
          expect((await dir({ "x-asym-tenant": id.TA! })).code).toBe("42501");
          expect((await dir(under("mSGd"))).code).toBe("42501");
          const named = await dir(under("mSGs"));
          expect(named.code, named.message).toBeNull();
          // One live row there and no header: still that row.
          const one = await as(
            "authenticated",
            { sub: "UADM" },
            `select count(*)::int n from public.tenant_member_directory(${q("TA")})`,
          );
          expect(one.code, one.message).toBeNull();
        }));

      it("defect 10: both own-row branches of donor_pledges read on a signed-in token: given under the donor assignment, received under the missionary one", () =>
        tx(async () => {
          await replica(true);
          await insertRow("donor_pledges", {
            id: "'7e000000-0000-4000-8000-000000000001'",
            tenant_id: q("TA"),
            donor_id: q("dMG"),
            missionary_id: q("misMIS"),
          });
          await insertRow("donor_pledges", {
            id: "'7e000000-0000-4000-8000-000000000002'",
            tenant_id: q("TA"),
            donor_id: q("dOther"),
            missionary_id: q("misMG"),
          });
          await replica(false);
          const pledges = (m: string) =>
            as(
              "authenticated",
              { sub: "UMG", headers: under(m) },
              "select id::text from public.donor_pledges order by id",
            );
          const gave = await pledges("mMGd");
          expect(gave.code, gave.message).toBeNull();
          expect(gave.rows).toEqual([
            { id: "7e000000-0000-4000-8000-000000000001" },
          ]);
          const received = await pledges("mMGm");
          expect(received.code, received.message).toBeNull();
          expect(received.rows).toEqual([
            { id: "7e000000-0000-4000-8000-000000000002" },
          ]);
        }));

      it("Q13, defect 2: a super_admin profile with an unflagged staff row reads no restricted note there; a staff member cannot insert a note in another's name, and a signed-in insert gets its author name and timestamps stamped", () =>
        tx(async () => {
          await db.query(
            "update public.profiles set role = 'super_admin' where user_id = $1",
            [id.UB],
          );
          await replica(true);
          await insertRow("crm_notes", {
            tenant_id: q("TB"),
            visibility: "'restricted'",
            title: "'restricted'",
          });
          await replica(false);
          const notes = await as(
            "authenticated",
            { sub: "UB", headers: under("mB") },
            "select title from public.crm_notes",
          );
          expect(notes.code, notes.message).toBeNull();
          expect(notes.rows).toEqual([]);
          const foreign = await as(
            "authenticated",
            { sub: "UADM", headers: under("mAdm") },
            `insert into public.crm_notes (tenant_id, title, body, visibility, author_profile_id) values (${q("TA")}, 't', 'b', 'standard', ${q("UFC")})`,
          );
          expect(foreign.code).toBe("42501");
          const own = await as(
            "authenticated",
            { sub: "UADM", headers: under("mAdm") },
            `insert into public.crm_notes (tenant_id, title, body, visibility, author_profile_id, author_name, created_at, updated_at)
             values (${q("TA")}, 't', 'b', 'standard', ${q("UADM")}, 'Someone Else', '2000-01-01', '2000-01-01')
             returning author_name, created_at = now() fresh, updated_at = now() fresh_update`,
          );
          expect(own.code, own.message).toBeNull();
          expect(own.rows).toEqual([
            { author_name: "acc2675r2", fresh: true, fresh_update: true },
          ]);
        }));
    });

    describe("the council's findings", () => {
      const replica = (on: boolean) =>
        db.query(
          `set local session_replication_role = ${on ? "replica" : "origin"}`,
        );

      // R7: the sweep of "a request that names no tenant receives none", as
      // the staff-only case is swept: every public table with a tenant column
      // and a signed-in read policy, less the reviewed exceptions.
      it("R7: no row of any tenant table without the headers, nor with the assignment header alone, outside the reviewed exceptions", () =>
        tx(async () => {
          const pinned = new Set(
            (
              JSON.parse(
                readFileSync(
                  "docs/security/tenant-policy-exceptions.json",
                  "utf8",
                ),
              ) as { entries: { table: string }[] }
            ).entries.map((e) => e.table),
          );
          const tables = (
            await rows(
              `select c.relname::text t
                 from pg_class c
                where c.relnamespace = 'public'::regnamespace and c.relkind in ('r', 'p')
                  and exists (select 1 from pg_attribute a where a.attrelid = c.oid and a.attname = 'tenant_id' and not a.attisdropped)
                  and exists (select 1 from pg_policy p where p.polrelid = c.oid and p.polcmd in ('r', '*')
                                and p.polroles && array[0::oid, 'authenticated'::regrole::oid])
                  and has_table_privilege('authenticated', c.oid, 'SELECT')
                order by 1`,
            )
          )
            .map((r) => r.t as string)
            .filter((t) => !pinned.has(t));
          expect(tables.length).toBeGreaterThan(40);
          await replica(true);
          for (const t of tables)
            await insertRow(t, {
              tenant_id: q("TA"),
              ...(t === "member_care_private_notes"
                ? { author_user_id: q("UADM") }
                : {}),
            });
          await replica(false);
          for (const t of tables) {
            const there = await rows(
              `select count(*)::int n from public.${t} where tenant_id = $1`,
              [id.TA],
            );
            expect(there[0]!.n, t).toBeGreaterThan(0);
            // UADM holds one live row, in TA; UP holds one in each tenant.
            for (const [u, headers] of [
              ["UADM", undefined],
              ["UADM", { "x-asym-assignment": id.mAdm! }],
              ["UP", undefined],
              ["UP", { "x-asym-assignment": id.mPA! }],
            ] as [User, Record<string, string> | undefined][]) {
              const r = await as(
                "authenticated",
                { sub: u, headers },
                `select count(*)::int n from public.${t}`,
              );
              expect(r.code, `${t} ${u}: ${r.message}`).toBeNull();
              expect(r.rows[0]!.n, `${t} ${u} ${JSON.stringify(headers)}`).toBe(
                0,
              );
            }
          }
        }));

      // R8: the member directory answers only for the tenant the request
      // selected.
      it("R8: the member directory refuses a tenant header that names another tenant than the one asked about, and keeps the one-row fallback without a header", () =>
        tx(async () => {
          const directory = (tenant: string) =>
            `select membership_id from public.tenant_member_directory('${id[tenant]}')`;
          // UP's request names TA, while the argument and the row say TB.
          const conflict = await as(
            "authenticated",
            {
              sub: "UP",
              headers: {
                "x-asym-tenant": id.TA!,
                "x-asym-assignment": id.mPB!,
              },
            },
            directory("TB"),
          );
          expect(conflict.code, JSON.stringify(conflict.rows)).toBe("42501");
          expect(conflict.rows).toEqual([]);
          // The same call naming TB is answered.
          const own = await as(
            "authenticated",
            { sub: "UP", headers: under("mPB") },
            directory("TB"),
          );
          expect(own.code, own.message).toBeNull();
          const members = own.rows.map(
            (r) =>
              Object.keys(id).find((k) => id[k] === r.membership_id) ??
              r.membership_id,
          );
          expect(sorted(members)).toEqual(sorted(["mPB", "mB"]));
          // UB's one live row, in TB, serves with no header at all.
          const fallback = await as(
            "authenticated",
            { sub: "UB" },
            directory("TB"),
          );
          expect(fallback.code, fallback.message).toBeNull();
          expect(fallback.rows.length).toBe(2);
        }));

      // R11: an own-row sub-select carries the request's tenant itself, so a
      // super administrator who is a donor in two organizations cannot link a
      // row of one to their donor record in the other.
      it("R11: a super administrator who is a donor in both tenants cannot set feed preferences in one tenant for their donor record in the other", () =>
        tx(async () => {
          const user = randomUUID();
          const row = randomUUID();
          const [mine, theirs] = [randomUUID(), randomUUID()];
          id.USA = user;
          await db.query("insert into auth.users (id) values ($1)", [user]);
          await db.query("delete from authz.memberships where user_id = $1", [
            user,
          ]);
          await db.query(
            "update public.profiles set role = 'super_admin' where user_id = $1",
            [user],
          );
          await db.query(
            `insert into authz.memberships (id, user_id, tenant_id, role, is_active)
             values ($1, $2, $3, 'donor', true)`,
            [row, user, id.TA],
          );
          await replica(true);
          for (const [donor, tenant] of [
            [mine, "TA"],
            [theirs, "TB"],
          ] as const)
            await insertRow("donors", {
              id: `'${donor}'`,
              tenant_id: q(tenant),
              profile_id: `'${user}'`,
              email: `'${donor}@example.org'`,
            });
          await replica(false);
          const headers = { "x-asym-tenant": id.TA!, "x-asym-assignment": row };
          const across = await as(
            "authenticated",
            { sub: "USA", headers },
            `insert into public.donor_feed_preferences (donor_id, tenant_id) values ('${theirs}', ${q("TA")}) returning id`,
          );
          expect(across.code, JSON.stringify(across.rows)).toBe("42501");
          const own = await as(
            "authenticated",
            { sub: "USA", headers },
            `insert into public.donor_feed_preferences (donor_id, tenant_id) values ('${mine}', ${q("TA")}) returning id`,
          );
          expect(own.code, own.message).toBeNull();
          expect(own.rows).toHaveLength(1);
          // Every own-row sub-select the migration writes carries the tenant.
          const leaning = await rows(
            `select c.relname || ': ' || p.polname n
               from pg_policy p join pg_class c on c.oid = p.polrelid
              where c.relnamespace = 'public'::regnamespace
                and coalesce(pg_get_expr(p.polqual, p.polrelid), '') || ' ' || coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '')
                    ~ 'FROM (donors d|missionaries m|support_agents a)\\s+WHERE \\(+(d|m|a)\\.(profile_id|user_id)'
              order by 1`,
          );
          expect(leaning).toEqual([]);
        }));

      // R12 (b): the policies compare the caller through the parallel-safe
      // caller-id helper, not auth.uid().
      it("R12: the Support Hub reads and the private-notes read compare the caller through authz.current_user_id(), which is PARALLEL SAFE", () =>
        tx(async () => {
          const policies = await rows(
            `select c.relname || ': ' || p.polname n,
                    coalesce(pg_get_expr(p.polqual, p.polrelid), '') q
               from pg_policy p join pg_class c on c.oid = p.polrelid
              where c.relnamespace = 'public'::regnamespace
                and (c.relname, p.polname) in (
                  ('support_notification_preferences', 'support hub staff select'),
                  ('support_saved_views', 'support hub staff select'),
                  ('member_care_private_notes', 'member care private notes select'))
              order by 1`,
          );
          expect(policies).toHaveLength(3);
          for (const p of policies) {
            expect(p.q, p.n as string).toContain(
              "SELECT authz.current_user_id() AS current_user_id",
            );
            expect(p.q, p.n as string).not.toMatch(/auth\.uid\(\)/);
          }
          expect(
            await rows(
              "select proparallel::text p from pg_proc where oid = 'authz.current_user_id()'::regprocedure",
            ),
          ).toEqual([{ p: "s" }]);
        }));

      // R13: a malformed header is an error only where a policy's lookup runs.
      it("R13: a malformed header on a read whose lookup never runs gives an empty answer, not an error", () =>
        tx(async () => {
          const headers = {
            "x-asym-tenant": "not-a-uuid",
            "x-asym-assignment": id.mPA!,
          };
          for (const sql of [
            `select id from public.donors where id = '${randomUUID()}'`,
            "select id from public.donors where false",
          ]) {
            const r = await as("authenticated", { sub: "UP", headers }, sql);
            expect(r.code, `${sql}: ${r.message}`).toBeNull();
            expect(r.rows, sql).toEqual([]);
          }
          // Where rows are there to judge, the lookup runs and raises.
          const judged = await as(
            "authenticated",
            { sub: "UP", headers },
            "select id from public.donors",
          );
          expect(judged.code).toBe("22P02");
        }));

      // R15: "refused" on the Data API is an empty answer; the resolving
      // function returns one all-null record, not an empty set.
      it("R15: authz.request_assignment() returns exactly one record, all null when nothing resolves", () =>
        tx(async () => {
          // USG holds two live rows in TA, so the tenant alone selects none.
          const shape = (headers?: Record<string, string>) =>
            as(
              "authenticated",
              { sub: "USG", headers },
              `select count(*)::int n,
                      bool_and(membership_id is null and tenant_id is null and role is null) all_null
                 from authz.request_assignment()`,
            );
          const unresolved: (Record<string, string> | undefined)[] = [
            undefined,
            { "x-asym-tenant": id.TA! },
            { "x-asym-tenant": id.TA!, "x-asym-assignment": id.mPB! },
            { "x-asym-tenant": id.TB! },
          ];
          for (const headers of unresolved) {
            const r = await shape(headers);
            expect(r.code, r.message).toBeNull();
            expect(r.rows, JSON.stringify(headers)).toEqual([
              { n: 1, all_null: true },
            ]);
          }
          const resolved = await shape(under("mSGs"));
          expect(resolved.rows).toEqual([{ n: 1, all_null: false }]);
        }));

      // R5: a replace tests the membership on the object as it stands, too.
      // A statement whose WHERE or RETURNING reads the row also needs the
      // select policy, which tests the membership since Q10; a statement that
      // does not read it (no WHERE, no RETURNING) was held by the update
      // policy's USING alone, which tested the bucket and the owner. The case
      // sends that statement, as the caller, and counts the moved objects as
      // the superuser before the savepoint is rolled back.
      it("R5: a person revoked in one tenant and live in another cannot move an object under the first, however the statement is phrased", () =>
        tx(async () => {
          await db.query(
            "grant usage on schema storage to authenticated; grant select, insert, update, delete on storage.objects to authenticated",
          );
          const objects = [
            ["profiles", "avatars"],
            ["document-uploads", "editor"],
          ].map(([bucket, folder]) => ({
            bucket: bucket!,
            from: `${folder}/${id.TA}/${id.UP}/r5.png`,
            to: `${folder}/${id.TB}/${id.UP}/r5.png`,
          }));
          /**
           * With UP's one object of the bucket under TA, sends, as UP, an
           * update that reads no column of the row (a constant name, no
           * WHERE, no RETURNING), and returns whether the object moved to
           * TB's folder.
           */
          const moved = async (o: (typeof objects)[number]) => {
            await db.query("savepoint r5");
            try {
              await db.query(
                "insert into storage.objects (bucket_id, name, owner) values ($1, $2, $3)",
                [o.bucket, o.from, id.UP],
              );
              await db.query("set local role authenticated");
              await db.query(
                `select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', '', true), set_config('request.headers', '', true)`,
                [JSON.stringify({ sub: id.UP, role: "authenticated" })],
              );
              await db.query(`update storage.objects set name = '${o.to}'`);
              await db.query("reset role");
              const [{ n }] = (await rows(
                "select count(*)::int n from storage.objects where name = $1",
                [o.to],
              )) as [{ n: number }];
              return n === 1;
            } finally {
              await db.query("rollback to savepoint r5");
            }
          };
          // With UP's row in TA live, the object moves.
          for (const o of objects) expect(await moved(o), o.bucket).toBe(true);
          await db.query(
            "update authz.memberships set revoked_at = now() where id = $1",
            [id.mPA],
          );
          // Revoked in TA and live in TB: it does not.
          for (const o of objects) expect(await moved(o), o.bucket).toBe(false);
          // And both update policies test the path's tenant in USING.
          const using = await rows(
            `select polname n, pg_get_expr(polqual, polrelid) q from pg_policy
              where polrelid = 'storage.objects'::regclass
                and polname in ('profiles owner folder update', 'editor images owner folder update')`,
          );
          expect(using).toHaveLength(2);
          for (const p of using)
            expect(p.q, p.n as string).toContain("authz.caller_tenant_ids()");
        }));
    });

    // R19: "own profile" matches p.user_id or p.id; the schema allows a row
    // whose id is one login and whose user_id another, which WP5 resolves.
    // The seeded chain holds none.
    it("R19: no profile row has an id that is one login and a user_id that is another", async () => {
      expect(
        await rows(
          `select count(*)::int n from public.profiles p
            where p.id in (select u.id from auth.users u)
              and p.user_id is distinct from p.id`,
        ),
      ).toEqual([{ n: 0 }]);
    });

    describe("reads that carry no tenant header still work", () => {
      it("the caller's assignments and own profile row", () =>
        tx(async () => {
          const assignments = await as(
            "authenticated",
            { sub: "UP" },
            "select id from public.current_user_assignments()",
          );
          expect(sorted(ids(assignments))).toEqual(sorted(["mPA", "mPB"]));
          const own = await as(
            "authenticated",
            { sub: "UP" },
            `select id from public.profiles where id = ${q("UP")}`,
          );
          expect(ids(own)).toEqual(["UP"]);
          const organizations = await rows(
            "select to_regprocedure('public.current_user_organizations()') is not null present",
          );
          if (organizations[0]!.present) {
            const orgs = await as(
              "authenticated",
              { sub: "UP" },
              "select tenant_id from public.current_user_organizations()",
            );
            expect(sorted(orgs.rows.map((r) => r.tenant_id))).toEqual(
              sorted([id.TA, id.TB]),
            );
          }
        }));

      it("public locations, and the comments of a public post for a caller with no resolved row", () =>
        tx(async () => {
          const loc = randomUUID();
          const post = randomUUID();
          await db.query("set local session_replication_role = replica");
          await insertRow("locations", {
            id: `'${loc}'`,
            tenant_id: q("TA"),
            status: "'published'",
          });
          await insertRow("posts", {
            id: `'${post}'`,
            tenant_id: q("TA"),
            status: "'published'",
            visibility: "'public'",
          });
          await insertRow("post_comments", {
            post_id: `'${post}'`,
            user_id: q("UADM"),
            content: "'hello'",
          });
          await db.query("set local session_replication_role = origin");
          const locations = await as(
            "authenticated",
            { sub: "UX" },
            `select id from public.locations where id = '${loc}'`,
          );
          expect(locations.code, locations.message).toBeNull();
          expect(locations.rows).toHaveLength(1);
          const comments = await as(
            "authenticated",
            { sub: "UX" },
            `select content from public.post_comments where post_id = '${post}'`,
          );
          expect(comments.code, comments.message).toBeNull();
          expect(comments.rows).toEqual([{ content: "hello" }]);
        }));
    });
  },
);
