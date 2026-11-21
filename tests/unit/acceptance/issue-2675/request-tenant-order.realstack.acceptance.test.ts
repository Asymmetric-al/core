import { randomUUID } from "node:crypto";

import pg from "pg";
import { expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB, asRole } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("requires the migrate database", () =>
  expect(ADMIN_URL).not.toBe(""),
);

it.skipIf(!ADMIN_URL)(
  "protects restricted CRM notes using the selected tenant assignment on the joined chain",
  async () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    await db.connect();
    try {
      const policies = await db.query<{
        policyname: string;
        qual: string;
        with_check: string;
      }>(
        "select policyname, qual, with_check from pg_policies where schemaname = 'public' and tablename = 'crm_notes'",
      );
      for (const row of policies.rows) {
        expect(`${row.qual} ${row.with_check}`).not.toMatch(
          /profiles\.role|authz\.is_super_admin\(/i,
        );
      }
      const restricted =
        /visibility <> 'restricted'::text\) OR \( SELECT authz\.assignment_is_tenant_admin\(\)/i;
      expect(
        policies.rows.find(
          (row) => row.policyname === "crm_notes_tenant_select",
        )?.qual,
      ).toMatch(restricted);
      expect(
        policies.rows.find(
          (row) => row.policyname === "crm_notes_tenant_insert",
        )?.with_check,
      ).toMatch(restricted);
    } finally {
      await db.end();
    }
  },
);

/**
 * Review 4650094396 on #2741: the clauses above say what the policies read;
 * this says what they do. One person holds a finance row without the flag
 * and a development row with it in tenant A, and a row with the flag in
 * tenant B. Under a tenant A row they read and write tenant A's notes only,
 * though they could read tenant B's under their tenant B row; and a
 * restricted tenant A note follows the flag of the row they selected.
 */
it.skipIf(!ADMIN_URL)(
  "keeps a person with rows in two tenants to the selected tenant's notes, and a restricted note to the selected row's flag",
  async () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id: Record<string, string> = {};
    for (const k of ["TA", "TB", "U", "aFin", "aAdm", "bAdm"])
      id[k] = randomUUID();
    const q = (k: string) => `'${id[k]}'`;
    const as = asRole(db, id);
    await db.connect();
    await db.query("begin");
    try {
      await db.query(
        `insert into public.tenants (id, name, slug) values
           (${q("TA")}, 'acc2675 order A', 'acc2675-order-' || ${q("TA")}),
           (${q("TB")}, 'acc2675 order B', 'acc2675-order-' || ${q("TB")});
         insert into auth.users (id) values (${q("U")});
         delete from authz.memberships where user_id = ${q("U")};
         insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active) values
           (${q("aFin")}, ${q("U")}, ${q("TA")}, 'staff', 'finance', false, true),
           (${q("aAdm")}, ${q("U")}, ${q("TA")}, 'staff', 'development', true, true),
           (${q("bAdm")}, ${q("U")}, ${q("TB")}, 'staff', 'development', true, true);
         insert into public.crm_notes (tenant_id, title, body, visibility) values
           (${q("TA")}, 'A restricted', 'b', 'restricted'),
           (${q("TA")}, 'A standard', 'b', 'standard'),
           (${q("TB")}, 'B restricted', 'b', 'restricted'),
           (${q("TB")}, 'B standard', 'b', 'standard');`,
      );
      const profile = (
        await db.query<{ id: string }>(
          "select id from public.profiles where user_id = $1",
          [id.U],
        )
      ).rows[0]?.id;
      expect(profile).toBeTruthy();
      const under = (row: string, tenant: string) => ({
        sub: "U",
        headers: {
          "x-asym-tenant": id[tenant]!,
          "x-asym-assignment": id[row]!,
        },
      });
      const read = async (row: string, tenant: string) => {
        const r = await as(
          "authenticated",
          under(row, tenant),
          "select title from public.crm_notes order by title",
        );
        expect(r.code, r.message).toBeNull();
        return r.rows.map((x) => x.title);
      };
      const write = async (
        row: string,
        tenant: string,
        noteTenant: string,
        visibility: "restricted" | "standard",
      ) =>
        (
          await as(
            "authenticated",
            under(row, tenant),
            `insert into public.crm_notes (tenant_id, title, body, visibility, author_profile_id)
             values (${q(noteTenant)}, 'new', 'b', '${visibility}', '${profile}')`,
          )
        ).code;

      expect(await read("aFin", "TA")).toEqual(["A standard"]);
      expect(await read("aAdm", "TA")).toEqual(["A restricted", "A standard"]);
      expect(await read("bAdm", "TB")).toEqual(["B restricted", "B standard"]);

      expect(await write("aAdm", "TA", "TB", "standard")).toBe("42501");
      expect(await write("aAdm", "TA", "TB", "restricted")).toBe("42501");
      expect(await write("aFin", "TA", "TB", "standard")).toBe("42501");
      expect(await write("aAdm", "TA", "TA", "restricted")).toBeNull();
      expect(await write("aFin", "TA", "TA", "restricted")).toBe("42501");
      expect(await write("aFin", "TA", "TA", "standard")).toBeNull();
    } finally {
      await db.query("rollback");
      await db.end();
    }
  },
);
