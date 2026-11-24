import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2674/harness";

const REFUSAL_MESSAGE =
  "tenant_guard: request tenant scope is required and must match command tenant";

const REQUIRED_CAPABILITIES = [
  "people.manage_members",
  "admin.crm.manage",
  "web_studio.edit",
  "payments.manage_account",
  "contributions.manage_settings",
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
  uTargetB: string;
  mTargetB: string;
  invB: string;
  assetB: string;
  entityB: string;
  sourceCodeB: string;
};

type EntrySpec = {
  name: string;
  build: (f: Fixture, tag: string) => { argsSql: string; params: unknown[] };
};

const ENTRY_POINTS: readonly EntrySpec[] = [
  {
    name: "resolve_command_assignment",
    build: (f) => ({
      argsSql: "$1::uuid",
      params: [f.tenantB],
    }),
  },
  {
    name: "revoke_membership",
    build: (f) => ({
      argsSql: "$1::uuid, $2::uuid, $3::text",
      params: [f.tenantB, f.mTargetB, "Membership ended"],
    }),
  },
  {
    name: "change_membership_role",
    build: (f) => ({
      argsSql:
        "$1::uuid, $2::uuid, $3::text, $4::text, $5::boolean, $6::text, $7::timestamptz",
      params: [f.tenantB, f.mTargetB, "staff", "hr", false, "Role shift", null],
    }),
  },
  {
    name: "invite_member",
    build: (f, tag) => ({
      argsSql: "$1::uuid, $2::text, $3::text, $4::text, $5::boolean, $6::text",
      params: [
        f.tenantB,
        `cmdorg-${tag}-${randomUUID().slice(0, 8)}@example.org`,
        "staff",
        "finance",
        false,
        "Team hire",
      ],
    }),
  },
  {
    name: "revoke_membership_invitation",
    build: (f) => ({
      argsSql: "$1::uuid, $2::uuid, $3::text",
      params: [f.tenantB, f.invB, "Invite withdrawn"],
    }),
  },
  {
    name: "create_crm_note",
    build: (f) => ({
      argsSql:
        "$1::uuid, $2::uuid, $3::text, $4::text, $5::text, $6::text, $7::text, $8::text, $9::uuid",
      params: [
        f.tenantB,
        randomUUID(),
        "Partner call",
        "Checked in on support goals",
        "standard",
        null,
        null,
        null,
        randomUUID(),
      ],
    }),
  },
  {
    name: "start_media_upload",
    build: (f) => ({
      argsSql: "$1::uuid, $2::bigint, $3::text",
      params: [f.tenantB, 1024, "image/png"],
    }),
  },
  {
    name: "delete_media_asset",
    build: (f) => ({
      argsSql: "$1::uuid, $2::uuid",
      params: [f.tenantB, f.assetB],
    }),
  },
  {
    name: "begin_payment_account_onboarding",
    build: (f) => ({
      argsSql: "$1::uuid, $2::uuid, $3::boolean, $4::text",
      params: [f.tenantB, f.entityB, false, "Connect payout account"],
    }),
  },
  {
    name: "list_payment_legal_entities",
    build: (f) => ({
      argsSql: "$1::uuid",
      params: [f.tenantB],
    }),
  },
  {
    name: "create_giving_source_code",
    build: (f, tag) => ({
      argsSql: "$1::uuid, $2::text, $3::text, $4::text",
      params: [
        f.tenantB,
        `appeal-${tag}-${randomUUID().slice(0, 6)}`,
        "Autumn Appeal",
        "Campaign launch",
      ],
    }),
  },
  {
    name: "update_giving_source_code",
    build: (f) => ({
      argsSql: "$1::uuid, $2::uuid, $3::text, $4::boolean, $5::text",
      params: [
        f.tenantB,
        f.sourceCodeB,
        "Spring Appeal Updated",
        false,
        "Campaign closed",
      ],
    }),
  },
];

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "requires TENANT_GUARD_IT_ADMIN_DATABASE_URL in the migrate job",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2676: every human command requires the request organization (real stack)",
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
        uTargetB: randomUUID(),
        mTargetB: randomUUID(),
        invB: randomUUID(),
        assetB: randomUUID(),
        entityB: randomUUID(),
        sourceCodeB: randomUUID(),
      };
      const selectorB = `cmdorg_sel_${f.invB.replaceAll("-", "")}`;

      await db.query("begin");
      try {
        await db.query(
          `insert into public.tenants (id, name, slug, status) values
             ($1, 'CmdOrg A', $2, 'active'),
             ($3, 'CmdOrg B', $4, 'active')`,
          [
            f.tenantA,
            `cmdorg-a-${f.tenantA.slice(0, 8)}`,
            f.tenantB,
            `cmdorg-b-${f.tenantB.slice(0, 8)}`,
          ],
        );

        await db.query(
          `insert into auth.users (id, email, email_confirmed_at) values
             ($1, $2, now()),
             ($3, $4, now())`,
          [
            f.uDual,
            `dual-${f.uDual.slice(0, 8)}@example.org`,
            f.uTargetB,
            `target-${f.uTargetB.slice(0, 8)}@example.org`,
          ],
        );

        await db.query(
          "delete from authz.memberships where user_id = any($1::uuid[])",
          [[f.uDual, f.uTargetB]],
        );

        await db.query(
          `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active) values
             ($1, $2, $3, 'staff', 'development', true, true),
             ($4, $2, $5, 'staff', 'development', true, true),
             ($6, $7, $5, 'staff', 'finance', false, true)`,
          [
            f.mDualA,
            f.uDual,
            f.tenantA,
            f.mDualB,
            f.tenantB,
            f.mTargetB,
            f.uTargetB,
          ],
        );

        await db.query(
          `insert into public.membership_invitations (
             id, tenant_id, email, role, staff_role, is_tenant_admin,
             purpose, delivery_mode, selector, verifier_digest_version,
             verifier_digest, invited_by, reason, expires_at, status
           ) values (
             $1, $2, $3, 'staff', 'hr', false,
             'member_invite', 'email', $4, 1,
             decode(repeat('ab', 32), 'hex'), $5, 'Fixture invitation',
             now() + interval '7 days', 'issued'
           )`,
          [
            f.invB,
            f.tenantB,
            `pending-${f.invB.slice(0, 8)}@example.org`,
            selectorB,
            f.uDual,
          ],
        );

        await db.query(
          `insert into public.media_assets (
             id, tenant_id, status, declared_byte_size, declared_mime_type,
             mime_type, content_hash, master_key, byte_size, width, height, created_by
           ) values (
             $1, $2, 'ready', 1024, 'image/png',
             'image/png', repeat('a', 64), $3, 1024, 100, 100, $4
           )`,
          [
            f.assetB,
            f.tenantB,
            `tenants/${f.tenantB}/media/${f.assetB}/master.png`,
            f.uDual,
          ],
        );

        await db.query(
          `insert into public.legal_entities (
             id, tenant_id, name, legal_name, country_code, currency, tax_id
           ) values ($1, $2, 'CmdOrg Entity B', 'CmdOrg Entity B Inc', 'US', 'usd', '12-3456789')`,
          [f.entityB, f.tenantB],
        );

        await db.query(
          `insert into public.giving_source_codes (id, tenant_id, code, label, is_active)
           values ($1, $2, $3, 'Spring Appeal', true)`,
          [f.sourceCodeB, f.tenantB, `spring-${f.sourceCodeB.slice(0, 8)}`],
        );

        await run(f);
      } finally {
        await db.query("rollback");
      }
    }

    async function invoke(
      role: "authenticated" | "tenant_guard",
      sub: string,
      headers: Record<string, string>,
      sql: string,
      params: unknown[],
      keepOnSuccess: boolean,
    ): Promise<Outcome> {
      await db.query("savepoint cmdorg_call");
      try {
        await db.query(`set local role ${role}`);
        await db.query(
          `select set_config('request.jwt.claims', $1, true),
                  set_config('request.jwt.claim.sub', '', true),
                  set_config('request.headers', $2, true)`,
          [
            JSON.stringify({ sub, role }),
            Object.keys(headers).length > 0 ? JSON.stringify(headers) : "",
          ],
        );
        const res = await db.query(sql, params);
        await db.query("reset role");
        if (keepOnSuccess) {
          await db.query(
            `select set_config('request.jwt.claims', '', true),
                    set_config('request.headers', '', true),
                    set_config('app.current_tenant_id', '', true)`,
          );
          await db.query("release savepoint cmdorg_call");
        } else {
          await db.query("rollback to savepoint cmdorg_call");
          await db.query("release savepoint cmdorg_call");
        }
        return {
          code: null,
          message: "",
          rows: res.rows as Record<string, unknown>[],
        };
      } catch (error) {
        await db.query("rollback to savepoint cmdorg_call");
        await db.query("release savepoint cmdorg_call");
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
           (select count(*)::int from authz.memberships where tenant_id in ($1, $2)) as memberships,
           (select count(*)::int from public.membership_invitations where tenant_id in ($1, $2)) as invitations,
           (select count(*)::int from public.crm_notes where tenant_id in ($1, $2)) as crm_notes,
           (select count(*)::int from public.crm_command_logs where tenant_id in ($1, $2)) as crm_command_logs,
           (select count(*)::int from public.media_assets where tenant_id in ($1, $2)) as media_assets,
           (select count(*)::int from public.payment_onboarding_intents where tenant_id in ($1, $2)) as onboarding_intents,
           (select count(*)::int from public.giving_source_codes where tenant_id in ($1, $2)) as source_codes,
           (select count(*)::int from public.audit_logs where tenant_id in ($1, $2)) as audit_logs`,
        [f.tenantA, f.tenantB],
      );
      const targetMembership = (
        await db.query(
          `select role::text, staff_role::text, is_tenant_admin, is_active, revoked_at
             from authz.memberships where id = $1`,
          [f.mTargetB],
        )
      ).rows[0];
      const targetInvitation = (
        await db.query(
          "select status, revoked_at from public.membership_invitations where id = $1",
          [f.invB],
        )
      ).rows[0];
      const targetAsset = (
        await db.query(
          "select status, deleted_at, purge_after from public.media_assets where id = $1",
          [f.assetB],
        )
      ).rows[0];
      const targetSourceCode = (
        await db.query(
          "select label, is_active from public.giving_source_codes where id = $1",
          [f.sourceCodeB],
        )
      ).rows[0];
      return {
        counts: counts.rows[0],
        targetMembership,
        targetInvitation,
        targetAsset,
        targetSourceCode,
      };
    }

    it("gives the dual-organization administrator a profile and all five capabilities in B", () =>
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
      async function expectRefusedBothSchemas(
        f: Fixture,
        label: string,
        headerVariants: readonly Record<string, string>[],
      ) {
        const before = await captureState(f);
        for (const schema of ["public", "tenant_guard"] as const) {
          for (const [idx, headers] of headerVariants.entries()) {
            const { argsSql, params } = entry.build(
              f,
              `${label}-${schema}-${idx}`,
            );
            const outcome = await invoke(
              "authenticated",
              f.uDual,
              headers,
              `select ${schema}.${entry.name}(${argsSql}) as result`,
              params,
              true,
            );
            expect(
              outcome.code,
              `${schema}.${entry.name} ${label}[${idx}]: ${outcome.message}`,
            ).toBe("42501");
            expect(outcome.message).toBe(REFUSAL_MESSAGE);
          }
        }
        expect(await captureState(f)).toEqual(before);
      }

      it("(a) refuses x-asym-tenant: A with B's assignment named through public and tenant_guard and writes nothing", () =>
        withFixture((f) =>
          expectRefusedBothSchemas(f, "a", [
            { "x-asym-tenant": f.tenantA, "x-asym-assignment": f.mDualB },
          ]),
        ));

      it("(b) refuses x-asym-tenant: A with no assignment header through public and tenant_guard and writes nothing", () =>
        withFixture((f) =>
          expectRefusedBothSchemas(f, "b", [{ "x-asym-tenant": f.tenantA }]),
        ));

      it("(c) refuses missing x-asym-tenant with B's assignment named and with none through public and tenant_guard and writes nothing", () =>
        withFixture((f) =>
          expectRefusedBothSchemas(f, "c", [
            { "x-asym-assignment": f.mDualB },
            {},
          ]),
        ));

      it("(d) refuses malformed x-asym-tenant with B's assignment named and with none through public and tenant_guard and writes nothing", () =>
        withFixture((f) =>
          expectRefusedBothSchemas(f, "d", [
            { "x-asym-tenant": "not-a-uuid", "x-asym-assignment": f.mDualB },
            { "x-asym-tenant": "not-a-uuid" },
          ]),
        ));

      it("(e) serves x-asym-tenant: B through public and tenant_guard", () =>
        withFixture(async (f) => {
          for (const schema of ["public", "tenant_guard"] as const) {
            for (const [idx, headers] of [
              { "x-asym-tenant": f.tenantB, "x-asym-assignment": f.mDualB },
              { "x-asym-tenant": f.tenantB },
            ].entries()) {
              const { argsSql, params } = entry.build(f, `e-${schema}-${idx}`);
              const outcome = await invoke(
                "authenticated",
                f.uDual,
                headers,
                `select ${schema}.${entry.name}(${argsSql}) as result`,
                params,
                false,
              );
              expect(
                outcome.code,
                `${schema}.${entry.name} e[${idx}]: ${outcome.message}`,
              ).toBeNull();
              expect(outcome.rows).toHaveLength(1);
            }
          }
        }));
    });

    it("refuses the preamble itself for (a)-(d) without entering the tenant and serves (e) as tenant_guard", () =>
      withFixture(async (f) => {
        const preambleSql =
          "select (r).actor_id, (r).tenant_id, (r).assignment_id, tenant_guard.current_tenant_id() as entered from tenant_guard.begin_human_command($1::uuid, null) as r";

        const refusalCases: readonly [string, Record<string, string>][] = [
          ["a", { "x-asym-tenant": f.tenantA, "x-asym-assignment": f.mDualB }],
          ["b", { "x-asym-tenant": f.tenantA }],
          ["c-named", { "x-asym-assignment": f.mDualB }],
          ["c-none", {}],
          [
            "d-named",
            { "x-asym-tenant": "not-a-uuid", "x-asym-assignment": f.mDualB },
          ],
          ["d-none", { "x-asym-tenant": "not-a-uuid" }],
        ];

        for (const [label, headers] of refusalCases) {
          const outcome = await invoke(
            "tenant_guard",
            f.uDual,
            headers,
            preambleSql,
            [f.tenantB],
            true,
          );
          expect(outcome.code, `${label}: ${outcome.message}`).toBe("42501");
          expect(outcome.message, label).toBe(REFUSAL_MESSAGE);
          const current = await db.query(
            "select tenant_guard.current_tenant_id() as current",
          );
          expect(current.rows[0]!.current, label).toBeNull();
        }

        for (const [label, headers] of [
          [
            "e-named",
            { "x-asym-tenant": f.tenantB, "x-asym-assignment": f.mDualB },
          ],
          ["e-none", { "x-asym-tenant": f.tenantB }],
        ] as const) {
          const outcome = await invoke(
            "tenant_guard",
            f.uDual,
            headers,
            preambleSql,
            [f.tenantB],
            false,
          );
          expect(outcome.code, `${label}: ${outcome.message}`).toBeNull();
          expect(outcome.rows[0]).toEqual({
            actor_id: f.uDual,
            tenant_id: f.tenantB,
            assignment_id: f.mDualB,
            entered: f.tenantB,
          });
        }
      }));

    it("preserves the one-row rule when x-asym-tenant matches B and no assignment header is sent", () =>
      withFixture(async (f) => {
        const single = await invoke(
          "authenticated",
          f.uDual,
          { "x-asym-tenant": f.tenantB },
          "select public.resolve_command_assignment($1::uuid) as result",
          [f.tenantB],
          false,
        );
        expect(single.code, single.message).toBeNull();
        expect(single.rows[0]!.result).toMatchObject({
          actor_id: f.uDual,
          assignment_id: f.mDualB,
          tenant_id: f.tenantB,
        });

        await db.query(
          `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active)
           values ($1, $2, $3, 'donor', null, false, true)`,
          [randomUUID(), f.uDual, f.tenantB],
        );

        const multiple = await invoke(
          "authenticated",
          f.uDual,
          { "x-asym-tenant": f.tenantB },
          "select public.resolve_command_assignment($1::uuid) as result",
          [f.tenantB],
          false,
        );
        expect(multiple.code).toBe("42501");
        expect(multiple.message).toMatch(/several live assignments/);
      }));

    it("leaves pre-membership accept_membership_invitation untouched with no headers and with x-asym-tenant: A", () =>
      withFixture(async (f) => {
        const invitee1 = randomUUID();
        const invitee2 = randomUUID();
        const email1 = `accept-none-${invitee1.slice(0, 8)}@example.org`;
        const email2 = `accept-other-${invitee2.slice(0, 8)}@example.org`;

        await db.query(
          `insert into auth.users (id, email, email_confirmed_at) values
             ($1, $2, now()),
             ($3, $4, now())`,
          [invitee1, email1, invitee2, email2],
        );
        await db.query(
          "delete from authz.memberships where user_id = any($1::uuid[])",
          [[invitee1, invitee2]],
        );

        const issued1 = await invoke(
          "authenticated",
          f.uDual,
          { "x-asym-tenant": f.tenantB, "x-asym-assignment": f.mDualB },
          "select public.invite_member($1::uuid, $2::text, 'staff', 'hr', false, 'Pre-membership check 1') as result",
          [f.tenantB, email1],
          true,
        );
        expect(issued1.code, issued1.message).toBeNull();
        const token1 = issued1.rows[0]!.result as {
          selector: string;
          verifier: string;
        };

        const issued2 = await invoke(
          "authenticated",
          f.uDual,
          { "x-asym-tenant": f.tenantB, "x-asym-assignment": f.mDualB },
          "select public.invite_member($1::uuid, $2::text, 'staff', 'hr', false, 'Pre-membership check 2') as result",
          [f.tenantB, email2],
          true,
        );
        expect(issued2.code, issued2.message).toBeNull();
        const token2 = issued2.rows[0]!.result as {
          selector: string;
          verifier: string;
        };

        const acceptNoHeaders = await invoke(
          "authenticated",
          invitee1,
          {},
          "select public.accept_membership_invitation($1::text, $2::text) as result",
          [token1.selector, token1.verifier],
          true,
        );
        expect(acceptNoHeaders.code, acceptNoHeaders.message).toBeNull();
        expect(acceptNoHeaders.rows[0]!.result).toMatchObject({
          tenant_id: f.tenantB,
        });

        const acceptOtherTenant = await invoke(
          "authenticated",
          invitee2,
          { "x-asym-tenant": f.tenantA },
          "select public.accept_membership_invitation($1::text, $2::text) as result",
          [token2.selector, token2.verifier],
          true,
        );
        expect(acceptOtherTenant.code, acceptOtherTenant.message).toBeNull();
        expect(acceptOtherTenant.rows[0]!.result).toMatchObject({
          tenant_id: f.tenantB,
        });
      }));
  },
);
