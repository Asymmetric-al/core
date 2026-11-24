import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  migration,
  read,
} from "../issue-2675/harness";

const DEMO = "00000000-0000-0000-0000-000000000001";
const OWNER = "11111111-1111-1111-1111-111111111111";
const SUFFIX = "_demo_member_care_assignment";

function grantSource() {
  const sql = read(migration(SUFFIX));
  const start = sql.indexOf("DO $$");
  const end = sql.indexOf("END $$;", start) + "END $$;".length;
  if (start < 0 || end <= start) throw new Error("no DO block in the grant");
  return { sql, block: sql.slice(start, end) };
}

type Written = {
  id: string;
  user_id: string;
  tenant_id: string;
  role: string;
  staff_role: string | null;
  is_active: boolean;
  revoked: boolean;
  is_tenant_admin: boolean;
  granted_by: string | null;
};

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe("AL-2677 WP4b part 1b: the demonstration Member Care grant (migration text)", () => {
  it("is one guarded block for the demonstration organization and owner, inside the neighbours' lock timeout", () => {
    const { sql, block } = grantSource();
    expect(sql).toMatch(/^BEGIN;$/m);
    expect(sql).toMatch(/^SET LOCAL lock_timeout = '5s';$/m);
    expect(sql).toMatch(/^COMMIT;$/m);
    expect(sql.match(/DO \$\$/g)).toHaveLength(1);
    expect(block).toContain(`'${DEMO}'`);
    expect(block).toContain(`'${OWNER}'`);
    expect(block).not.toContain("00000000-0000-0000-0000-000000000002");
    expect(block).not.toMatch(/RAISE\s+EXCEPTION/i);
    expect(block).not.toMatch(/\bUPDATE\b|\bDELETE\b|auth\.users\s*\(/i);
    expect(block).toMatch(
      /ON CONFLICT \(user_id, tenant_id, role, staff_role\) DO NOTHING/,
    );
  });
});

describe.skipIf(!ADMIN_URL)(
  "AL-2677 WP4b part 1b: the demonstration Member Care grant (real stack; every check is rolled back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const notices: string[] = [];

    beforeAll(async () => {
      await db.connect();
      db.on("notice", (notice) => notices.push(notice.message ?? ""));
    });
    afterAll(() => db.end());

    async function rolledBack<T>(run: () => Promise<T>): Promise<T> {
      await db.query("BEGIN");
      try {
        return await run();
      } finally {
        await db.query("ROLLBACK");
      }
    }

    async function grant(block = grantSource().block) {
      notices.length = 0;
      await db.query(block);
      return [...notices];
    }

    async function writtenMemberships(): Promise<Written[]> {
      const { rows } = await db.query<Written>(
        `select m.id, m.user_id, m.tenant_id, m.role::text as role,
                m.staff_role::text as staff_role, m.is_active,
                m.revoked_at is not null as revoked, m.is_tenant_admin,
                m.granted_by
           from authz.memberships as m
          where m.xmin::text::bigint = pg_catalog.txid_current() % 4294967296
          order by m.id`,
      );
      return rows;
    }

    async function writtenAudit() {
      const { rows } = await db.query<{
        tenant_id: string;
        user_id: string | null;
        action: string;
        resource_type: string;
        resource_id: string;
        details: Record<string, unknown>;
      }>(
        `select a.tenant_id, a.user_id, a.action, a.resource_type,
                a.resource_id, a.details
           from public.audit_logs as a
          where a.xmin::text::bigint = pg_catalog.txid_current() % 4294967296`,
      );
      return rows;
    }

    async function ownerStaffRows() {
      const { rows } = await db.query<{
        staff_role: string;
        is_active: boolean;
        is_tenant_admin: boolean;
      }>(
        `select m.staff_role::text as staff_role, m.is_active, m.is_tenant_admin
           from authz.memberships as m
          where m.user_id = $1 and m.tenant_id = $2 and m.role = 'staff'
          order by m.staff_role::text`,
        [OWNER, DEMO],
      );
      return rows;
    }

    it("the seeded owner is the demonstration organization's administrator on one development row, and holds no member care row", async () => {
      expect(await ownerStaffRows()).toEqual([
        { staff_role: "development", is_active: true, is_tenant_admin: true },
      ]);
    });

    it("a first run gives the owner one live, non-administrator member_care row and one audit entry; a second run adds nothing", async () => {
      await rolledBack(async () => {
        await db.query("select pg_catalog.txid_current()");
        const first = await grant();
        const rows = await writtenMemberships();
        expect(rows).toEqual([
          {
            id: expect.any(String),
            user_id: OWNER,
            tenant_id: DEMO,
            role: "staff",
            staff_role: "member_care",
            is_active: true,
            revoked: false,
            is_tenant_admin: false,
            granted_by: null,
          },
        ]);
        expect(first.join("\n")).toMatch(/granted/i);
        const audit = await writtenAudit();
        expect(audit).toEqual([
          {
            tenant_id: DEMO,
            user_id: null,
            action: "membership_granted",
            resource_type: "membership",
            resource_id: rows[0]!.id,
            details: expect.objectContaining({
              target_user_id: OWNER,
              granted_by_migration: expect.stringContaining(SUFFIX),
              to: {
                membership_id: rows[0]!.id,
                role: "staff",
                staff_role: "member_care",
                is_tenant_admin: false,
              },
            }),
          },
        ]);

        const second = await grant();
        expect(await writtenMemberships()).toEqual(rows);
        expect(await writtenAudit()).toEqual(audit);
        expect(second.join("\n")).toMatch(/already holds/i);
        expect(await ownerStaffRows()).toEqual([
          {
            staff_role: "development",
            is_active: true,
            is_tenant_admin: true,
          },
          {
            staff_role: "member_care",
            is_active: true,
            is_tenant_admin: false,
          },
        ]);
      });
    });

    it("a revoked member_care row stays revoked, and nothing else is written", async () => {
      await rolledBack(async () => {
        await db.query(
          `insert into authz.memberships (user_id, tenant_id, role, staff_role, is_active, is_tenant_admin)
           values ($1, $2, 'staff', 'member_care', false, false)`,
          [OWNER, DEMO],
        );
        const before = await writtenMemberships();
        expect(before).toEqual([
          expect.objectContaining({
            staff_role: "member_care",
            is_active: false,
            revoked: true,
          }),
        ]);
        const said = await grant();
        expect(await writtenMemberships()).toEqual(before);
        expect(await writtenAudit()).toEqual([]);
        expect(said.join("\n")).toMatch(/already holds/i);
      });
    });

    it.each<[string, (block: string) => string, string | null]>([
      [
        "the organization is absent",
        (block) => block.replaceAll(DEMO, randomUUID()),
        null,
      ],
      [
        "the person is absent",
        (block) => block.replaceAll(OWNER, randomUUID()),
        null,
      ],
      [
        "the development row is not an administrator's",
        (block) => block,
        "update authz.memberships set is_tenant_admin = false where user_id = $1 and tenant_id = $2 and role = 'staff' and staff_role = 'development'",
      ],
      [
        "the development row is revoked",
        (block) => block,
        "update authz.memberships set is_active = false where user_id = $1 and tenant_id = $2 and role = 'staff' and staff_role = 'development'",
      ],
    ])(
      "is a no-op with a NOTICE, never an error, when %s",
      async (_label, rewrite, setup) => {
        await rolledBack(async () => {
          await db.query("select pg_catalog.txid_current()");
          if (setup) await db.query(setup, [OWNER, DEMO]);
          const before = await writtenMemberships();
          const said = await grant(rewrite(grantSource().block));
          expect(await writtenMemberships()).toEqual(before);
          expect(await writtenAudit()).toEqual([]);
          expect(said.join("\n")).toMatch(/nothing changed/i);
          expect(
            (await ownerStaffRows()).filter(
              (row) => row.staff_role === "member_care",
            ),
          ).toEqual([]);
        });
      },
    );
  },
);
