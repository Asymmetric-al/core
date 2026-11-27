/**
 * AL-2675 (WP2c rest, pull request B; brief stage5/wp2c-rest.md, invariants
 * 1, 3 and 6 of part B; plan 5.4 and WP2's exit line; record D-65, D-82 and
 * D-109; ADR-0228 decision 1): the catalog gate refuses any super-admin
 * branch, a write policy that calls the staff-read helper, a staff-wide read
 * on the bare staff check, and the blind spots (b), (c) and (e) that the
 * evaluator judges. The blind spots the catalog query itself must see, (d),
 * (f) and (g), and the query's half of the rules here, are planted on a real
 * database in tests/unit/acceptance/issue-2675/no-super-admin-gate.realstack.acceptance.test.ts.
 *
 * Policy text below is as Postgres deparses it.
 */
import { describe, expect, it } from "vitest";

import {
  STAFF_NARROWED_READS,
  STAFF_READ_HELPER,
  evaluateTenantRlsCatalog,
  tenantBound,
} from "../../../scripts/verify/tenant-rls-catalog.mjs";

const T =
  "(tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id))";
const STAFF =
  "( SELECT authz.assignment_is('staff'::authz.membership_role) AS assignment_is)";
const HELPER = "( SELECT authz.staff_read() AS staff_read)";
const SUPER = "( SELECT authz.is_super_admin() AS is_super_admin)";
const CARE =
  "( SELECT authz.assignment_is('staff'::authz.membership_role, ARRAY['member_care'::authz.staff_role]) AS assignment_is)";
const ADMIN =
  "( SELECT authz.assignment_is_tenant_admin() AS assignment_is_tenant_admin)";
const DONOR_OWN =
  "(( SELECT authz.assignment_is('donor'::authz.membership_role) AS assignment_is) AND (donor_id IN ( SELECT d.id FROM donors d WHERE (d.tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)))))";

const table = (name: string, over: Record<string, unknown> = {}) => ({
  ...{ table: name, tenant: true, rls: true, force: true, policies: 1 },
  ...{ owner: "postgres", owner_bypass: true },
  ...over,
});
const TABLES = [
  table("donors"),
  table("donations"),
  table("funds"),
  table("crm_notes"),
  table("member_care_goals"),
  table("support_saved_views"),
  table("currency_metadata", { tenant: false }),
  // A table with no tenant column whose rows reach a tenant through a parent
  // row, as the catalog query derives it from the foreign keys (finding (e)).
  table("thread_notes", { tenant: false, parent_scoped: true }),
];

type Policy = {
  table: string;
  policy: string;
  cmd: string;
  roles: string[];
  using: string | null;
  check: string | null;
  granted: boolean;
  permissive: boolean;
  writable: boolean;
};
const policy = (
  tableName: string,
  using: string | null,
  over: Partial<Policy> = {},
): Policy => ({
  ...{ table: tableName, policy: `${tableName} read`, cmd: "SELECT" },
  ...{ roles: ["authenticated"], using, check: null, granted: true },
  ...{ permissive: true, writable: true },
  ...over,
});
/** The same policy as the catalog's list of every policy in every schema shows it. */
const everyRow = (
  p: Policy,
  schema = "public",
  functions: string[] = [],
): Record<string, unknown> => ({
  schema,
  table: p.table,
  policy: p.policy,
  cmd: p.cmd,
  using: p.using,
  check: p.check,
  functions,
});

const HELPERS = [
  "authz.current_tenant_id()",
  "authz.request_tenant_id()",
  "authz.request_assignment_id()",
  "authz.request_assignment()",
].map((fn) => ({
  function: fn,
  body: "SELECT a.tenant_id FROM authz.request_assignment() AS a",
  search_path: '""',
  root: true,
}));
/** auth.uid() as hosted Supabase and the compat bootstrap define it: it reads the subject only and sets no search path. */
const UID = {
  function: "auth.uid()",
  body: "SELECT COALESCE( NULLIF(current_setting('request.jwt.claim.sub', true), ''), (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub') )::uuid",
  search_path: null,
  root: false,
};

function run(
  policies: Policy[],
  more: {
    every?: Record<string, unknown>[];
    functions?: Record<string, unknown>[];
    helpers?: object[];
    published?: string[];
  } = {},
) {
  const snapshot = {
    tenant_keys: [],
    tenant_update_violations: [],
    tenant_delete_violations: [],
    tables: TABLES,
    definers: [],
    commands: [],
    wrappers: [],
    grants: [],
    service_role_grants: [],
    service_role_schemas: [],
    policies,
    tenant_helpers: more.helpers ?? [...HELPERS, UID],
    published: more.published ?? [],
    every_policy: [...policies.map((p) => everyRow(p)), ...(more.every ?? [])],
    policy_functions: more.functions ?? [],
  };
  // No command in the fixture, so no pre-membership exception either.
  return evaluateTenantRlsCatalog(
    snapshot,
    { entries: [] },
    { entries: [] },
    { entries: [] },
    [],
    { entries: [] },
  );
}
const codes = (r: ReturnType<typeof run>) =>
  r.failures
    .map((f: { code: string; table?: string; function?: string }) =>
      `${f.code} ${f.table ?? f.function}`.trim(),
    )
    .sort();

describe("evaluateTenantRlsCatalog: no super-admin branch (AL-2675, WP2c rest B)", () => {
  it("fails a super-admin branch beside the tenant condition, which passed until this change, and the branch alone", () => {
    const branch = `(${SUPER} OR (${T} AND (${HELPER} OR ${DONOR_OWN})))`;
    expect(tenantBound(branch)).toBe(false);
    expect(codes(run([policy("donors", branch)]))).toEqual([
      "POLICY_SUPER_ADMIN_BRANCH donors",
      "TENANT_CONDITION_MISSING donors",
    ]);
    expect(codes(run([policy("donors", SUPER)]))).toEqual([
      "POLICY_SUPER_ADMIN_BRANCH donors",
      "TENANT_CONDITION_MISSING donors",
    ]);
  });

  it("fails the role name tested in a policy of any schema, of any command, in either expression, whatever its case", () => {
    const named =
      "(EXISTS ( SELECT 1 FROM profiles p WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (p.role = 'SUPER_ADMIN'::text))))";
    const own = policy("memberships", named, { policy: "acc own" });
    expect(codes(run([], { every: [everyRow(own, "authz")] }))).toEqual([
      "POLICY_SUPER_ADMIN_BRANCH authz.memberships",
    ]);
    const write = policy("objects", null, {
      policy: "acc upload",
      cmd: "INSERT",
      check: `(bucket_id = 'x'::text) OR ${named}`,
    });
    expect(codes(run([], { every: [everyRow(write, "storage")] }))).toEqual([
      "POLICY_SUPER_ADMIN_BRANCH storage.objects",
    ]);
  });

  it("fails a policy that calls a function whose text tests the role, and passes one whose text names it only in a comment", () => {
    const via = policy(
      "donors",
      `(${T} AND ( SELECT authz.platform_admin() AS platform_admin))`,
    );
    const tests = {
      function: "authz.platform_admin()",
      body: "SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'super_admin')",
    };
    expect(
      codes(
        run([], {
          every: [everyRow(via, "public", [tests.function])],
          functions: [tests],
        }),
      ),
    ).toEqual(["POLICY_SUPER_ADMIN_BRANCH donors"]);
    const commented = {
      ...tests,
      body: "-- replaced the super_admin test of WP2b\nSELECT false",
    };
    expect(
      run([], {
        every: [everyRow(via, "public", [tests.function])],
        functions: [commented],
      }).failures,
    ).toEqual([]);
  });
});

describe("evaluateTenantRlsCatalog: the staff-read helper (AL-2675, WP2c rest B; plan 5.4)", () => {
  it("names the helper and the nine reads that keep the bare staff check, the member-care reads among them", () => {
    expect(STAFF_READ_HELPER).toBe("authz.staff_read");
    expect([...STAFF_NARROWED_READS].sort()).toEqual([
      "crm_notes|crm_notes_tenant_select",
      "crm_table_named_views|crm staff read",
      "crm_table_user_preferences|crm staff read",
      "member_care_activities|member care activities select",
      "member_care_goals|member care goals select",
      "member_care_private_notes|member care private notes select",
      "member_care_requirements|member care requirements select",
      "support_notification_preferences|support hub staff select",
      "support_saved_views|support hub staff select",
    ]);
  });

  it("passes a pure staff-wide read and a staff-or-own read's staff branch on the helper", () => {
    expect(
      run([
        policy("funds", `((${T} AND ${HELPER}) AND (system_purpose IS NULL))`),
        policy("donations", `(${T} AND (${HELPER} OR ${DONOR_OWN}))`),
      ]).failures,
    ).toEqual([]);
  });

  it("fails a pure staff-wide read, and a staff-or-own read's staff branch, on the bare staff check, with or without a NULL sub-role list", () => {
    for (const using of [
      `(${T} AND ${STAFF})`,
      `((${T} AND ${STAFF}) AND (system_purpose IS NULL))`,
      `(${T} AND (${STAFF} OR ${DONOR_OWN}))`,
      `(${T} AND ( SELECT authz.assignment_is('staff'::authz.membership_role, NULL::authz.staff_role[]) AS assignment_is))`,
    ])
      expect(codes(run([policy("funds", using)])), using).toEqual([
        "STAFF_READ_ON_BARE_STAFF_CHECK funds",
      ]);
  });

  it("fails a write policy that calls the helper, for every command that writes", () => {
    const bound = `(${T} AND ${HELPER})`;
    for (const [cmd, using, check] of [
      ["INSERT", null, bound],
      ["UPDATE", bound, bound],
      ["DELETE", bound, null],
      ["ALL", bound, bound],
    ] as const)
      expect(
        codes(run([policy("donors", using, { policy: "w", cmd, check })])),
        cmd,
      ).toEqual(["STAFF_READ_HELPER_IN_WRITE donors"]);
    // A write on the bare staff check stays as it is.
    expect(
      run([
        policy("crm_notes", null, {
          policy: "crm_notes_tenant_insert",
          cmd: "INSERT",
          check: `((${T} AND ${STAFF}) AND ((visibility <> 'restricted'::text) OR ${ADMIN}))`,
        }),
      ]).failures,
    ).toEqual([]);
  });

  it("keeps the nine named reads on the bare staff check or the sub-role check, and fails one of them on the helper", () => {
    const views = `((${T} AND ${STAFF}) AND ((scope <> 'personal'::text) OR ${ADMIN}))`;
    const notes = `((${T} AND ${STAFF}) AND ((visibility <> 'restricted'::text) OR ${ADMIN}))`;
    const named = [
      policy("support_saved_views", views, {
        policy: "support hub staff select",
      }),
      policy("crm_notes", notes, { policy: "crm_notes_tenant_select" }),
      policy("member_care_goals", `(${T} AND ${CARE})`, {
        policy: "member care goals select",
      }),
    ];
    expect(run(named).failures).toEqual([]);
    expect(
      codes(
        run([
          policy("support_saved_views", views.replace(STAFF, HELPER), {
            policy: "support hub staff select",
          }),
        ]),
      ),
    ).toEqual(["STAFF_READ_HELPER_ON_NARROWED_READ support_saved_views"]);
    expect(
      codes(
        run([
          policy("member_care_goals", `((${T} AND ${HELPER}) AND ${CARE})`, {
            policy: "member care goals select",
          }),
        ]),
      ),
    ).toEqual(["STAFF_READ_HELPER_ON_NARROWED_READ member_care_goals"]);
    // The same narrowed text under any other name is a staff-wide read.
    expect(
      codes(run([policy("support_saved_views", views, { policy: "another" })])),
    ).toEqual(["STAFF_READ_ON_BARE_STAFF_CHECK support_saved_views"]);
  });
});

describe("evaluateTenantRlsCatalog: blind spots (b), (c) and (e) (record D-82, D-109, section 9 'WP2c part 3')", () => {
  it("(b) fails a function a request-tenant helper reaches that sets a search path that is not empty, and passes auth.uid(), which sets none", () => {
    expect(run([]).failures).toEqual([]);
    const reached = (search_path: string | null) => ({
      function: "private.tenant_lookup()",
      body: "SELECT NULL::uuid",
      search_path,
      root: false,
    });
    for (const path of ["public", "private, public", '"$user", public'])
      expect(
        codes(run([], { helpers: [...HELPERS, UID, reached(path)] })),
        path,
      ).toEqual(["TENANT_HELPER_SEARCH_PATH private.tenant_lookup()"]);
    for (const path of [null, '""'])
      expect(
        run([], { helpers: [...HELPERS, UID, reached(path)] }).failures,
        String(path),
      ).toEqual([]);
  });

  it("(c) ties a claim key to the claims value: a read of another key through another JSON form fails beside a read of 'sub' elsewhere", () => {
    for (const body of [
      "SELECT (current_setting('request.jwt.claims', true)::jsonb #>> '{app_metadata,tenant_id}')::uuid, ('{\"sub\":1}'::jsonb ->> 'sub')",
      "SELECT jsonb_extract_path_text(current_setting('request.jwt.claims', true)::jsonb, 'tenant_id'), (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')",
      "SELECT (current_setting('request.jwt.claims', true)::jsonb)['tenant_id'], ('{}'::jsonb ->> 'sub')",
    ]) {
      const reached = {
        function: "private.token_tenant()",
        body,
        search_path: '""',
        root: false,
      };
      expect(
        codes(run([], { helpers: [...HELPERS, UID, reached] })),
        body,
      ).toEqual(["TENANT_HELPER_READS_CLAIM private.token_tenant()"]);
    }
  });

  it("(c) reads tenant_guard.request_claims() as a read of the claims, in a policy and in a helper", () => {
    const viaGuard = `(${T} AND ((tenant_guard.request_claims() ->> 'role'::text) = 'staff'::text))`;
    expect(codes(run([policy("donors", viaGuard)]))).toEqual([
      "POLICY_READS_TOKEN_CLAIM donors",
    ]);
    expect(
      codes(
        run([], {
          helpers: [
            {
              ...HELPERS[0],
              body: "SELECT (tenant_guard.request_claims() ->> 'tenant_id')::uuid",
            },
            ...HELPERS.slice(1),
            UID,
          ],
        }),
      ),
    ).toEqual(["TENANT_HELPER_READS_CLAIM authz.current_tenant_id()"]);
  });

  it("(e) holds a table the catalog finds scoped through a parent to the parent-scoped rules, outside the constant list", () => {
    expect(codes(run([policy("thread_notes", "true")]))).toEqual([
      "PARENT_SCOPED_POLICY_NOT_PINNED thread_notes",
    ]);
    expect(codes(run([], { published: ["thread_notes"] }))).toEqual([
      "TENANT_TABLE_PUBLISHED thread_notes",
    ]);
    // A table with no tenant column and no parent is outside the rule.
    expect(run([policy("currency_metadata", "true")]).failures).toEqual([]);
  });
});
