/**
 * AL-2675 real-stack acceptance (WP2b, first release, slice A; decision D-26
 * as the coordinator's ruling amends it): `public.current_user_organizations()`
 * names the organizations on the organization chooser, on the caller's own
 * token. It returns a tenant's id and name only where the session caller
 * holds a live (not revoked) membership row, and nothing to anyone else.
 * `public.current_user_assignments()`, which the resolver reads on every
 * request, is left as it is.
 *
 * Runs against TENANT_GUARD_IT_ADMIN_DATABASE_URL (see ./harness.ts): skips
 * without it, except in CI's `migrate` job, where it fails. Every check runs
 * in one transaction that is always rolled back, over fixture rows with fresh
 * ids, so it holds no state another run could see.
 */
import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  ROWS,
  USERS,
  asRole,
  fixtureIds,
  fixtureSql,
  migration,
  read,
} from "./harness";

const FN = "public.current_user_organizations()";
const CALL = `select tenant_id, name from ${FN}`;
const NAMES: Record<string, string> = { TA: "acc2675 A", TB: "acc2675 B" };

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2675 organization names for the chooser (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = fixtureIds();
    const as = asRole(db, id);
    const keyOf = (v: unknown) =>
      Object.keys(id).find((k) => id[k] === v) ?? String(v);

    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function tx(fn: () => Promise<void>) {
      await db.query("begin");
      try {
        await db.query(fixtureSql(id));
        await fn();
      } finally {
        await db.query("rollback");
      }
    }

    /** What `sub` sees, as fixture keys, sorted by tenant. */
    async function names(sub: string | null) {
      const r = await as("authenticated", { sub }, CALL);
      expect(r.code, r.message).toBeNull();
      return r.rows
        .map((row) => ({ tenant: keyOf(row.tenant_id), name: row.name }))
        .sort((a, b) => a.tenant.localeCompare(b.tenant));
    }

    async function proc() {
      const r = await db.query(
        `select p.prosecdef, p.provolatile, p.pronargs, p.proconfig,
                pg_get_userbyid(p.proowner) as owner,
                array(
                  select case a.grantee when 0 then 'PUBLIC' else a.grantee::regrole::text end
                    from aclexplode(p.proacl) a
                   where a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner
                   order by 1
                ) as grantees
           from pg_proc p
          where p.oid = $1::regprocedure`,
        [FN],
      );
      return r.rows[0] as {
        prosecdef: boolean;
        provolatile: string;
        pronargs: number;
        proconfig: string[] | null;
        owner: string;
        grantees: string[];
      };
    }

    describe("who sees which name", () => {
      it("a member sees the name of each organization they hold a live row in, once", () =>
        tx(async () => {
          // Two staff rows in TA give one organization.
          expect(await names("UFC")).toEqual([
            { tenant: "TA", name: NAMES.TA },
          ]);
          expect(await names("UDON")).toEqual([
            { tenant: "TA", name: NAMES.TA },
            { tenant: "TB", name: NAMES.TB },
          ]);
          expect(await names("UB")).toEqual([{ tenant: "TB", name: NAMES.TB }]);
        }));

      it("a person whose row in a tenant is revoked sees no name for that tenant", () =>
        tx(async () => {
          // UREV's only row, hr in TA, is revoked.
          expect(await names("UREV")).toEqual([]);

          // A revoked row beside a live row elsewhere names only the live one.
          await db.query(
            `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_active)
             values ($1, $2, $3, 'donor', null, false)`,
            [randomUUID(), id.UB, id.TA],
          );
          expect(await names("UB")).toEqual([{ tenant: "TB", name: NAMES.TB }]);

          // Revoking the live row takes its name away too.
          await db.query(
            "update authz.memberships set revoked_at = now() where id = $1",
            [id.mB],
          );
          expect(await names("UB")).toEqual([]);
        }));

      it("no person ever sees the name of a tenant they hold no live row in", () =>
        tx(async () => {
          for (const user of USERS) {
            const own = [
              ...new Set(
                ROWS.filter(([, u, , , , , live]) => u === user && live).map(
                  ([, , tenant]) => tenant,
                ),
              ),
            ].sort();
            expect(
              await names(user),
              `${user} sees the names of its own live tenants and no others`,
            ).toEqual(own.map((tenant) => ({ tenant, name: NAMES[tenant] })));
          }
        }));

      it("a signed-in request with no session caller sees nothing", () =>
        tx(async () => expect(await names(null)).toEqual([])));

      it.each([
        ["anon", null],
        ["anon", "UFC"],
        ["service_role", null],
        ["service_role", "UFC"],
      ] as const)("%s (sub %s) cannot execute it", (role, sub) =>
        tx(async () =>
          expect((await as(role, { sub }, CALL)).code).toBe("42501"),
        ),
      );
    });

    describe("the function's catalog entry", () => {
      it("is a stable SECURITY DEFINER owned by postgres, with no arguments and the empty search path, executable by authenticated only", () =>
        tx(async () => {
          const p = await proc();
          expect([p.prosecdef, p.provolatile, p.pronargs, p.owner]).toEqual([
            true,
            "s",
            0,
            "postgres",
          ]);
          expect(p.proconfig ?? []).toEqual(
            expect.arrayContaining([
              expect.stringMatching(/^search_path=(""|'')$/),
            ]),
          );
          expect(p.grantees).toEqual(["authenticated"]);
        }));

      it("re-running its migration after hosted default privileges widened EXECUTE leaves exactly authenticated", () =>
        tx(async () => {
          await db.query(
            `grant execute on function ${FN} to public, anon, service_role`,
          );
          expect((await proc()).grantees).toEqual(
            expect.arrayContaining(["PUBLIC", "anon", "service_role"]),
          );
          const body = read(migration("current_user_organizations"))
            .replace(/^\s*BEGIN;\s*$/m, "")
            .replace(/^\s*COMMIT;\s*$/m, "");
          expect(body).toContain(FN);
          await db.query(body);
          expect((await proc()).grantees).toEqual(["authenticated"]);
        }));
    });
  },
);
