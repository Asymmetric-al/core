import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2674/harness";

const DIR_ONE_ARG_MSG =
  "Forbidden: the member directory requires a live staff membership in this tenant.";
const DIR_BOUNDED_MSG =
  "The member directory requires an active staff assignment in the selected tenant.";
const INVITATIONS_MSG =
  "Forbidden: listing invitations requires people.manage_members in this tenant.";
const CRM_PREFS_MSG =
  "Forbidden: CRM table preferences require a CRM role in this tenant.";
const MALFORMED_TENANT_MSG = "authz: the tenant header is not a UUID";

const REQUIRED_CAPABILITIES = [
  "people.manage_members",
  "crm.gift_history.manage_view_defaults",
] as const;

type Outcome = {
  code: string | null;
  message: string;
  rows: Record<string, unknown>[];
};

type Fixture = {
  tenantA: string;
  tenantB: string;
  uDual: string;
  mDualA: string;
  mDualB: string;
  uMemberB: string;
  mMemberB: string;
  entityB: string;
  partyB: string;
  missionaryB: string;
  invB: string;
  viewB: string;
};

type EntrySpec = {
  name: string;
  refusal: { kind: "42501"; message: string } | { kind: "empty" };
  build: (f: Fixture, tag: string) => { sql: string; params: unknown[] };
  assertServed: (
    f: Fixture,
    tag: string,
    rows: Record<string, unknown>[],
  ) => void;
};

const ENTRY_POINTS: readonly EntrySpec[] = [
  {
    name: "tenant_member_directory(uuid)",
    refusal: { kind: "42501", message: DIR_ONE_ARG_MSG },
    build: (f) => ({
      sql: "select membership_id, user_id, profile_id, display_name from public.tenant_member_directory($1::uuid)",
      params: [f.tenantB],
    }),
    assertServed: (f, _tag, rows) => {
      expect(rows.map((r) => String(r.membership_id)).sort()).toEqual(
        [f.mDualB, f.mMemberB].sort(),
      );
    },
  },
  {
    name: "tenant_member_directory(uuid, uuid[])",
    refusal: { kind: "42501", message: DIR_BOUNDED_MSG },
    build: (f) => ({
      sql: "select profile_id, display_name, email from public.tenant_member_directory($1::uuid, array[$2::uuid])",
      params: [f.tenantB, f.uMemberB],
    }),
    assertServed: (f, _tag, rows) => {
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        profile_id: f.uMemberB,
        display_name: "CallerOrg Member B",
      });
    },
  },
  {
    name: "tenant_membership_invitations(uuid)",
    refusal: { kind: "42501", message: INVITATIONS_MSG },
    build: (f) => ({
      sql: "select id, tenant_id, status from public.tenant_membership_invitations($1::uuid)",
      params: [f.tenantB],
    }),
    assertServed: (f, _tag, rows) => {
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        id: f.invB,
        tenant_id: f.tenantB,
      });
    },
  },
  {
    name: "crm_missionary_labels(uuid, uuid[])",
    refusal: { kind: "empty" },
    build: (f) => ({
      sql: "select id, profile_id, member_profile_id, display_name, email from public.crm_missionary_labels($1::uuid, array[$2::uuid])",
      params: [f.tenantB, f.missionaryB],
    }),
    assertServed: (f, _tag, rows) => {
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        id: f.missionaryB,
        profile_id: f.uMemberB,
        member_profile_id: f.uMemberB,
        display_name: "CallerOrg Member B",
      });
    },
  },
  {
    name: "create_crm_table_named_view",
    refusal: { kind: "42501", message: CRM_PREFS_MSG },
    build: (f, tag) => ({
      sql: "select to_jsonb(public.create_crm_table_named_view($1::uuid, $2::text, $3::text, $4::boolean, $5::integer, $6::text, $7::jsonb)) as result",
      params: [
        f.tenantB,
        "crm.giftHistory",
        `View-${tag}`,
        false,
        1,
        null,
        JSON.stringify({}),
      ],
    }),
    assertServed: (f, tag, rows) => {
      expect(rows).toHaveLength(1);
      expect(rows[0]!.result).toMatchObject({
        tenant_id: f.tenantB,
        profile_id: f.uDual,
        table_id: "crm.giftHistory",
        name: `View-${tag}`,
      });
    },
  },
  {
    name: "update_crm_table_named_view",
    refusal: { kind: "42501", message: CRM_PREFS_MSG },
    build: (f) => ({
      sql: "select to_jsonb(public.update_crm_table_named_view($1::uuid, $2::text, $3::text, $4::text, $5::boolean, $6::boolean, $7::boolean, $8::integer, $9::text, $10::boolean, $11::jsonb, $12::boolean)) as result",
      params: [
        f.tenantB,
        "crm.giftHistory",
        f.viewB,
        "Renamed View B",
        true,
        true,
        true,
        1,
        "resend_receipt",
        true,
        JSON.stringify({}),
        true,
      ],
    }),
    assertServed: (f, _tag, rows) => {
      expect(rows).toHaveLength(1);
      expect(rows[0]!.result).toMatchObject({
        id: f.viewB,
        tenant_id: f.tenantB,
        profile_id: f.uDual,
        name: "Renamed View B",
      });
    },
  },
  {
    name: "delete_crm_table_named_view",
    refusal: { kind: "42501", message: CRM_PREFS_MSG },
    build: (f) => ({
      sql: "select public.delete_crm_table_named_view($1::uuid, $2::text, $3::text, $4::text) as result",
      params: [f.tenantB, "crm.giftHistory", f.viewB, null],
    }),
    assertServed: (_f, _tag, rows) => {
      expect(rows).toHaveLength(1);
      expect(rows[0]!.result).toEqual({ deleted: true, promoted: false });
    },
  },
  {
    name: "save_crm_user_table_preference",
    refusal: { kind: "42501", message: CRM_PREFS_MSG },
    build: (f) => ({
      sql: "select to_jsonb(public.save_crm_user_table_preference($1::uuid, $2::text, $3::text, $4::boolean, $5::integer, $6::jsonb)) as result",
      params: [
        f.tenantB,
        "crm.giftHistory",
        "resend_receipt",
        true,
        1,
        JSON.stringify({}),
      ],
    }),
    assertServed: (f, _tag, rows) => {
      expect(rows).toHaveLength(1);
      expect(rows[0]!.result).toMatchObject({
        tenant_id: f.tenantB,
        profile_id: f.uDual,
        table_id: "crm.giftHistory",
        pinned_action_id: "resend_receipt",
      });
    },
  },
  {
    name: "save_crm_tenant_table_default",
    refusal: { kind: "42501", message: CRM_PREFS_MSG },
    build: (f) => ({
      sql: "select to_jsonb(public.save_crm_tenant_table_default($1::uuid, $2::text, $3::text, $4::boolean, $5::integer, $6::jsonb)) as result",
      params: [
        f.tenantB,
        "crm.giftHistory",
        "resend_receipt",
        true,
        1,
        JSON.stringify({}),
      ],
    }),
    assertServed: (f, _tag, rows) => {
      expect(rows).toHaveLength(1);
      expect(rows[0]!.result).toMatchObject({
        tenant_id: f.tenantB,
        table_id: "crm.giftHistory",
        updated_by: f.uDual,
        pinned_action_id: "resend_receipt",
      });
    },
  },
];

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "requires TENANT_GUARD_IT_ADMIN_DATABASE_URL in the migrate job",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2676: authz.caller_assignment requires the request organization (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });

    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function withFixture(run: (f: Fixture) => Promise<void>) {
      const f: Fixture = {
        tenantA: randomUUID(),
        tenantB: randomUUID(),
        uDual: randomUUID(),
        mDualA: randomUUID(),
        mDualB: randomUUID(),
        uMemberB: randomUUID(),
        mMemberB: randomUUID(),
        entityB: randomUUID(),
        partyB: randomUUID(),
        missionaryB: randomUUID(),
        invB: "",
        viewB: randomUUID(),
      };

      await db.query("begin");
      try {
        await db.query(
          `insert into public.tenants (id, name, slug, status) values
             ($1, 'CallerOrg A', $2, 'active'),
             ($3, 'CallerOrg B', $4, 'active')`,
          [
            f.tenantA,
            `callerorg-a-${f.tenantA.slice(0, 8)}`,
            f.tenantB,
            `callerorg-b-${f.tenantB.slice(0, 8)}`,
          ],
        );

        await db.query(
          `insert into auth.users (id, email, email_confirmed_at) values
             ($1, $2, now()),
             ($3, $4, now())`,
          [
            f.uDual,
            `dual-${f.uDual.slice(0, 8)}@example.org`,
            f.uMemberB,
            `memberb-${f.uMemberB.slice(0, 8)}@example.org`,
          ],
        );

        await db.query(
          `update public.profiles set display_name = 'CallerOrg Member B' where id = $1`,
          [f.uMemberB],
        );

        await db.query(
          "delete from authz.memberships where user_id = any($1::uuid[])",
          [[f.uDual, f.uMemberB]],
        );

        await db.query(
          `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active) values
             ($1, $2, $3, 'staff', 'development', true, true),
             ($4, $2, $5, 'staff', 'development', true, true),
             ($6, $7, $5, 'missionary', null, false, true)`,
          [
            f.mDualA,
            f.uDual,
            f.tenantA,
            f.mDualB,
            f.tenantB,
            f.mMemberB,
            f.uMemberB,
          ],
        );

        await db.query(
          `insert into public.legal_entities (
             id, tenant_id, name, legal_name, country_code, currency, tax_id
           ) values ($1, $2, 'CallerOrg Entity B', 'CallerOrg Entity B Inc', 'US', 'usd', '12-3456789')`,
          [f.entityB, f.tenantB],
        );

        await db.query(
          `insert into public.parties (id, tenant_id, display_name)
           values ($1, $2, 'CallerOrg Member B')`,
          [f.partyB, f.tenantB],
        );

        await db.query(
          `insert into public.missionaries (id, tenant_id, profile_id, legal_entity_id, party_id)
           values ($1, $2, $3, $4, $5)`,
          [f.missionaryB, f.tenantB, f.uMemberB, f.entityB, f.partyB],
        );

        const issued = await db.query<{ invitation_id: string }>(
          `select invitation_id from tenant_guard.issue_membership_invitation(
             $1::uuid, $2::text, 'missionary'::authz.membership_role,
             null, false, 'member_invite', 'email', $3::uuid, 'Fixture invitation'
           )`,
          [f.tenantB, `pending-${f.tenantB.slice(0, 8)}@example.org`, f.uDual],
        );
        f.invB = issued.rows[0]!.invitation_id;

        await db.query(
          `insert into public.crm_table_named_views (
             id, tenant_id, profile_id, table_id, name, is_default,
             schema_version, pinned_action_id, settings
           ) values (
             $1, $2, $3, 'crm.giftHistory', 'Planted View B', false,
             1, null, '{}'::jsonb
           )`,
          [f.viewB, f.tenantB, f.uDual],
        );

        await run(f);
      } finally {
        await db.query("rollback");
      }
    }

    async function invoke(
      role: "authenticated" | "postgres",
      sub: string,
      headers: Record<string, string>,
      sql: string,
      params: unknown[],
      keepOnSuccess: boolean,
    ): Promise<Outcome> {
      await db.query("savepoint callerorg_call");
      try {
        if (role !== "postgres") {
          await db.query(`set local role ${role}`);
        }
        await db.query(
          `select set_config('request.jwt.claims', $1, true),
                  set_config('request.jwt.claim.sub', '', true),
                  set_config('request.headers', $2, true)`,
          [
            JSON.stringify({ sub, role: "authenticated" }),
            Object.keys(headers).length > 0 ? JSON.stringify(headers) : "",
          ],
        );
        const res = await db.query(sql, params);
        if (role !== "postgres") {
          await db.query("reset role");
        }
        if (keepOnSuccess) {
          await db.query(
            `select set_config('request.jwt.claims', '', true),
                    set_config('request.headers', '', true)`,
          );
          await db.query("release savepoint callerorg_call");
        } else {
          await db.query("rollback to savepoint callerorg_call");
          await db.query("release savepoint callerorg_call");
        }
        return {
          code: null,
          message: "",
          rows: res.rows as Record<string, unknown>[],
        };
      } catch (error) {
        await db.query("rollback to savepoint callerorg_call");
        await db.query("release savepoint callerorg_call");
        const err = error as { code?: string; message?: string };
        return {
          code: err.code ?? "UNKNOWN",
          message: err.message ?? String(error),
          rows: [],
        };
      }
    }

    async function captureState(f: Fixture) {
      const counts = await db.query(
        `select
           (select count(*)::int from public.crm_table_named_views where tenant_id in ($1, $2)) as named_views,
           (select count(*)::int from public.crm_table_user_preferences where tenant_id in ($1, $2)) as user_prefs,
           (select count(*)::int from public.crm_table_tenant_defaults where tenant_id in ($1, $2)) as tenant_defaults,
           (select count(*)::int from public.crm_table_preference_audit_events where tenant_id in ($1, $2)) as pref_audit`,
        [f.tenantA, f.tenantB],
      );
      const plantedView = (
        await db.query(
          `select id, tenant_id, profile_id, table_id, name, is_default,
                  schema_version, pinned_action_id, settings, updated_at
             from public.crm_table_named_views where id = $1`,
          [f.viewB],
        )
      ).rows[0];
      return {
        counts: counts.rows[0],
        plantedView,
      };
    }

    it("gives the dual-organization administrator a profile and required capabilities in B", () =>
      withFixture(async (f) => {
        const profiles = await db.query(
          "select id, user_id from public.profiles where user_id = $1",
          [f.uDual],
        );
        expect(profiles.rows).toEqual([{ id: f.uDual, user_id: f.uDual }]);
        const caps = await db.query(
          "select authz.assignment_capabilities($1) as caps",
          [f.mDualB],
        );
        const list = caps.rows[0]!.caps as string[];
        for (const capability of REQUIRED_CAPABILITIES) {
          expect(list).toContain(capability);
        }
      }));

    describe.each(ENTRY_POINTS)("entry point $name", (entry) => {
      async function expectRefused(
        f: Fixture,
        label: string,
        headerVariants: readonly Record<string, string>[],
      ) {
        const before = await captureState(f);
        for (const [idx, headers] of headerVariants.entries()) {
          const tag = `${label}-${idx}`;
          const { sql, params } = entry.build(f, tag);
          const outcome = await invoke(
            "authenticated",
            f.uDual,
            headers,
            sql,
            params,
            true,
          );
          if (entry.refusal.kind === "empty") {
            expect(
              outcome.code,
              `${entry.name} ${tag}: ${outcome.message}`,
            ).toBeNull();
            expect(outcome.rows, `${entry.name} ${tag}`).toEqual([]);
          } else {
            expect(
              outcome.code,
              `${entry.name} ${tag}: ${outcome.message}`,
            ).toBe("42501");
            expect(outcome.message, `${entry.name} ${tag}`).toBe(
              entry.refusal.message,
            );
            expect(outcome.rows, `${entry.name} ${tag}`).toEqual([]);
          }
        }
        expect(await captureState(f)).toEqual(before);
      }

      it("(a) refuses x-asym-tenant: A with B's row named and with none, writing nothing", () =>
        withFixture((f) =>
          expectRefused(f, "a", [
            { "x-asym-tenant": f.tenantA, "x-asym-assignment": f.mDualB },
            { "x-asym-tenant": f.tenantA },
          ]),
        ));

      it("(b) refuses missing x-asym-tenant (no headers and B's row named alone), writing nothing", () =>
        withFixture((f) =>
          expectRefused(f, "b", [{}, { "x-asym-assignment": f.mDualB }]),
        ));

      it("(c-blank) refuses blank x-asym-tenant ('') with B's row named and with none, writing nothing", () =>
        withFixture((f) =>
          expectRefused(f, "c-blank", [
            { "x-asym-tenant": "", "x-asym-assignment": f.mDualB },
            { "x-asym-tenant": "" },
          ]),
        ));

      it("(c-spaces) refuses spaces-only x-asym-tenant ('   ') with B's row named and with none, writing nothing", () =>
        withFixture((f) =>
          expectRefused(f, "c-spaces", [
            { "x-asym-tenant": "   ", "x-asym-assignment": f.mDualB },
            { "x-asym-tenant": "   " },
          ]),
        ));

      it("(d) raises 22P02 on malformed x-asym-tenant ('not-a-uuid') with B's row named and with none, writing nothing", () =>
        withFixture(async (f) => {
          const before = await captureState(f);
          for (const [idx, headers] of [
            { "x-asym-tenant": "not-a-uuid", "x-asym-assignment": f.mDualB },
            { "x-asym-tenant": "not-a-uuid" },
          ].entries()) {
            const tag = `d-${idx}`;
            const { sql, params } = entry.build(f, tag);
            const outcome = await invoke(
              "authenticated",
              f.uDual,
              headers,
              sql,
              params,
              true,
            );
            expect(
              outcome.code,
              `${entry.name} ${tag}: ${outcome.message}`,
            ).toBe("22P02");
            expect(outcome.message, `${entry.name} ${tag}`).toBe(
              MALFORMED_TENANT_MSG,
            );
            expect(outcome.rows, `${entry.name} ${tag}`).toEqual([]);
          }
          expect(await captureState(f)).toEqual(before);
        }));

      it("(e) serves x-asym-tenant: B with B's row named and with no assignment header", () =>
        withFixture(async (f) => {
          for (const [idx, headers] of [
            { "x-asym-tenant": f.tenantB, "x-asym-assignment": f.mDualB },
            { "x-asym-tenant": f.tenantB },
          ].entries()) {
            const tag = `e-${idx}`;
            const { sql, params } = entry.build(f, tag);
            const outcome = await invoke(
              "authenticated",
              f.uDual,
              headers,
              sql,
              params,
              false,
            );
            expect(
              outcome.code,
              `${entry.name} ${tag}: ${outcome.message}`,
            ).toBeNull();
            entry.assertServed(f, tag, outcome.rows);
          }
        }));
    });

    it("returns NULL from authz.caller_assignment as postgres for (a)-(c), raises 22P02 for (d), and returns B's row for (e)", () =>
      withFixture(async (f) => {
        const sql = "select authz.caller_assignment($1::uuid, 'staff') as a";

        for (const [label, headers] of [
          [
            "a-named",
            { "x-asym-tenant": f.tenantA, "x-asym-assignment": f.mDualB },
          ],
          ["a-none", { "x-asym-tenant": f.tenantA }],
          ["b-none", {}],
          ["b-named", { "x-asym-assignment": f.mDualB }],
          [
            "c-empty-named",
            { "x-asym-tenant": "", "x-asym-assignment": f.mDualB },
          ],
          ["c-empty-none", { "x-asym-tenant": "" }],
          [
            "c-spaces-named",
            { "x-asym-tenant": "   ", "x-asym-assignment": f.mDualB },
          ],
          ["c-spaces-none", { "x-asym-tenant": "   " }],
        ] as const) {
          const outcome = await invoke(
            "postgres",
            f.uDual,
            headers,
            sql,
            [f.tenantB],
            false,
          );
          expect(outcome.code, `${label}: ${outcome.message}`).toBeNull();
          expect(outcome.rows[0]!.a, label).toBeNull();
        }

        for (const [label, headers] of [
          [
            "d-named",
            { "x-asym-tenant": "not-a-uuid", "x-asym-assignment": f.mDualB },
          ],
          ["d-none", { "x-asym-tenant": "not-a-uuid" }],
        ] as const) {
          const outcome = await invoke(
            "postgres",
            f.uDual,
            headers,
            sql,
            [f.tenantB],
            false,
          );
          expect(outcome.code, `${label}: ${outcome.message}`).toBe("22P02");
          expect(outcome.message, label).toBe(MALFORMED_TENANT_MSG);
        }

        for (const [label, headers] of [
          [
            "e-named",
            { "x-asym-tenant": f.tenantB, "x-asym-assignment": f.mDualB },
          ],
          ["e-none", { "x-asym-tenant": f.tenantB }],
        ] as const) {
          const outcome = await invoke(
            "postgres",
            f.uDual,
            headers,
            sql,
            [f.tenantB],
            false,
          );
          expect(outcome.code, `${label}: ${outcome.message}`).toBeNull();
          expect(outcome.rows[0]!.a, label).toBe(f.mDualB);
        }
      }));

    it("strips ASCII spaces only in authz.request_tenant_id: tab, newline, NBSP and other Unicode whitespace raise 22P02 and admit nothing", () =>
      withFixture(async (f) => {
        const before = await captureState(f);
        const nonSpaceWhitespace: readonly [string, string][] = [
          ["tab", "\t"],
          ["newline", "\n"],
          ["carriage-return", "\r"],
          ["nbsp", "\u00A0"],
          ["em-space", "\u2003"],
          ["ideographic-space", "\u3000"],
          ["spaces-around-tab", "   \t   "],
          ["tab-padded-uuid", `\t${f.tenantB}`],
          ["nbsp-padded-uuid", `\u00A0${f.tenantB}`],
        ];

        for (const [label, value] of nonSpaceWhitespace) {
          for (const [suffix, headers] of [
            [
              "named",
              { "x-asym-tenant": value, "x-asym-assignment": f.mDualB },
            ],
            ["none", { "x-asym-tenant": value }],
          ] as const) {
            const direct = await invoke(
              "postgres",
              f.uDual,
              headers,
              "select authz.caller_assignment($1::uuid, 'staff') as a",
              [f.tenantB],
              false,
            );
            expect(direct.code, `direct ${label}-${suffix}`).toBe("22P02");
            expect(direct.message, `direct ${label}-${suffix}`).toBe(
              MALFORMED_TENANT_MSG,
            );

            const dir = await invoke(
              "authenticated",
              f.uDual,
              headers,
              "select * from public.tenant_member_directory($1::uuid)",
              [f.tenantB],
              true,
            );
            expect(dir.code, `directory ${label}-${suffix}`).toBe("22P02");
            expect(dir.message, `directory ${label}-${suffix}`).toBe(
              MALFORMED_TENANT_MSG,
            );

            const write = await invoke(
              "authenticated",
              f.uDual,
              headers,
              "select to_jsonb(public.create_crm_table_named_view($1::uuid, $2::text, $3::text, false, 1, null, '{}'::jsonb)) as result",
              [f.tenantB, "crm.giftHistory", `WS-${label}-${suffix}`],
              true,
            );
            expect(write.code, `write ${label}-${suffix}`).toBe("22P02");
            expect(write.message, `write ${label}-${suffix}`).toBe(
              MALFORMED_TENANT_MSG,
            );
          }
        }
        expect(await captureState(f)).toEqual(before);

        const asciiSpacePadded = await invoke(
          "postgres",
          f.uDual,
          {
            "x-asym-tenant": `  ${f.tenantB}  `,
            "x-asym-assignment": f.mDualB,
          },
          "select authz.caller_assignment($1::uuid, 'staff') as a",
          [f.tenantB],
          false,
        );
        expect(asciiSpacePadded.code, asciiSpacePadded.message).toBeNull();
        expect(asciiSpacePadded.rows[0]!.a).toBe(f.mDualB);
      }));

    it("preserves SECURITY INVOKER, STABLE, empty search_path, postgres-only EXECUTE, no profiles reference, and updated comment on authz.caller_assignment", async () => {
      const res = await db.query<{
        prosecdef: boolean;
        provolatile: string;
        owner: string;
        proconfig: string[];
        grantees: string[];
        prosrc: string;
        comment: string | null;
      }>(
        `select p.prosecdef,
                p.provolatile::text,
                p.proowner::regrole::text as owner,
                p.proconfig,
                array(
                  select distinct case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
                    from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                   where a.privilege_type = 'EXECUTE'
                   order by 1
                ) as grantees,
                p.prosrc,
                obj_description(p.oid, 'pg_proc') as comment
           from pg_proc p
           join pg_namespace n on n.oid = p.pronamespace
          where n.nspname = 'authz'
            and p.proname = 'caller_assignment'`,
      );
      expect(res.rows).toHaveLength(1);
      const fn = res.rows[0]!;
      expect(fn.prosecdef).toBe(false);
      expect(fn.provolatile).toBe("s");
      expect(fn.owner).toBe("postgres");
      expect(fn.proconfig).toContain('search_path=""');
      expect(fn.grantees).toEqual(["postgres"]);
      expect(fn.prosrc).not.toMatch(/\bprofiles\b/i);
      expect(fn.comment ?? "").toContain("x-asym-tenant");
    });
  },
);
