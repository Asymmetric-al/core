import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asRole,
  caller,
  fixtureIds,
  fixtureSql,
} from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2678 external identifiers (plan WP5 line 1002, section 8.4)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = fixtureIds();
    const fundA = randomUUID();
    const fundB = randomUUID();
    const queryAs = asRole(db, id);
    beforeAll(async () => {
      await db.connect();
      await db.query("begin");
      await db.query(fixtureSql(id));
      await db.query(
        "insert into public.funds (id, tenant_id, legal_entity_id, name) values ($1, $3, $3, 'Fund A'), ($2, $4, $4, 'Fund B')",
        [fundA, fundB, id.TA, id.TB],
      );
      await db.query(
        `insert into public.external_identifiers (tenant_id, source, external_id, target_type, target_id, donor_id) values
           ($1, 'legacy_crm', 'D-1', 'donor', $2, $2),
           ($3, 'legacy_crm', 'D-1', 'donor', $4, $4)`,
        [id.TA, id.dA, id.TB, id.dAB],
      );
      await db.query(
        `insert into public.external_identifiers (tenant_id, source, external_id, target_type, target_id, missionary_id) values ($1, 'legacy_crm', 'W-1', 'missionary', $2, $2)`,
        [id.TA, id.mA],
      );
    });
    afterAll(async () => {
      await db.query("rollback");
      await db.end();
    });

    async function code(role: string, sql: string, params: unknown[] = []) {
      await db.query("savepoint probe");
      try {
        await db.query(`set local role ${role}`);
        await db.query(sql, params);
        return null;
      } catch (e) {
        return (e as { code?: string }).code ?? "?";
      } finally {
        await db.query("rollback to savepoint probe");
      }
    }

    it("resolves to its typed target inside the request's tenant only", async () => {
      const resolve = (who: ReturnType<typeof caller>, ext: string) =>
        queryAs(
          "authenticated",
          who,
          `select target_type, target_id from public.resolve_external_identifier('legacy_crm', '${ext}')`,
        );
      expect((await resolve(caller(id, "US", "mS", "TA"), "D-1")).rows).toEqual(
        [{ target_type: "donor", target_id: id.dA }],
      );
      expect(
        (await resolve(caller(id, "UBS", "mBS", "TB"), "D-1")).rows,
      ).toEqual([{ target_type: "donor", target_id: id.dAB }]);
      expect(
        (await resolve(caller(id, "UBS", "mBS", "TB"), "W-1")).rows,
      ).toEqual([]);
      expect((await resolve(caller(id, "US", "mS", "TA"), "W-1")).rows).toEqual(
        [{ target_type: "missionary", target_id: id.mA }],
      );
      expect(
        (await resolve(caller(id, "UDA", "mDA", "TA"), "D-1")).rows,
      ).toEqual([]);
      expect(
        (
          await resolve(
            {
              sub: "UBS",
              headers: { "x-asym-tenant": id.TA, "x-asym-assignment": id.mBS },
            },
            "D-1",
          )
        ).rows,
      ).toEqual([]);
    });

    it("a Party or a fund of the identifier's own organization is accepted and resolves for that organization's staff only", async () => {
      await db.query("savepoint same_org");
      try {
        await db.query(
          `insert into public.external_identifiers (tenant_id, source, external_id, target_type, target_id, party_id) values ($1, 'legacy_crm', 'P-1', 'party', $2, $2)`,
          [id.TA, id.pDA],
        );
        await db.query(
          `insert into public.external_identifiers (tenant_id, source, external_id, target_type, target_id, fund_id) values ($1, 'legacy_crm', 'F-1', 'fund', $2, $2)`,
          [id.TA, fundA],
        );
        const resolve = (who: ReturnType<typeof caller>, ext: string) =>
          queryAs(
            "authenticated",
            who,
            `select target_type, target_id from public.resolve_external_identifier('legacy_crm', '${ext}')`,
          );
        expect(
          (await resolve(caller(id, "US", "mS", "TA"), "P-1")).rows,
        ).toEqual([{ target_type: "party", target_id: id.pDA }]);
        expect(
          (await resolve(caller(id, "US", "mS", "TA"), "F-1")).rows,
        ).toEqual([{ target_type: "fund", target_id: fundA }]);
        for (const ext of ["P-1", "F-1"])
          expect(
            (await resolve(caller(id, "UBS", "mBS", "TB"), ext)).rows,
          ).toEqual([]);
      } finally {
        await db.query("rollback to savepoint same_org");
      }
    });

    it("a cross-tenant, dangling or mistyped target is refused for every role, the service key included", async () => {
      for (const role of ["postgres", "service_role"]) {
        expect(
          await code(
            role,
            "insert into public.external_identifiers (tenant_id, source, external_id, target_type, target_id, donor_id) values ($1, 's', 'x', 'donor', $2, $2)",
            [id.TA, id.dAB],
          ),
          `${role} cross-tenant donor`,
        ).toBe("23503");
        for (const [type, column, target] of [
          ["party", "party_id", id.pDAB],
          ["missionary", "missionary_id", id.mB],
          ["fund", "fund_id", fundB],
          ["donor", "donor_id", id.gA],
        ] as const)
          expect(
            await code(
              role,
              `insert into public.external_identifiers (tenant_id, source, external_id, target_type, target_id, ${column}) values ($1, 's', 'x', '${type}', $2, $2)`,
              [id.TA, target],
            ),
            `${role} ${type}`,
          ).toBe("23503");
        expect(
          await code(
            role,
            "insert into public.external_identifiers (tenant_id, source, external_id, target_type, target_id, donor_id) values ($1, 's', 'x', 'party', $2, $2)",
            [id.TA, id.dA],
          ),
          `${role} mistyped`,
        ).toBe("23514");
        expect(
          await code(
            role,
            "insert into public.external_identifiers (tenant_id, source, external_id, target_type, target_id, donor_id) values ($1, 's', 'x', 'donor', $2, $3)",
            [id.TA, id.dC, id.dA],
          ),
          `${role} target_id differs`,
        ).toBe("23514");
        expect(
          await code(
            role,
            "insert into public.external_identifiers (tenant_id, source, external_id, target_type, target_id, donor_id) values ($1, 'legacy_crm', 'D-1', 'donor', $2, $2)",
            [id.TA, id.dC],
          ),
          `${role} duplicate`,
        ).toBe("23505");
      }
      expect(
        (
          await queryAs(
            "authenticated",
            caller(id, "US", "mS", "TA"),
            `insert into public.external_identifiers (tenant_id, source, external_id, target_type, target_id, donor_id) values ('${id.TA}', 's', 'y', 'donor', '${id.dA}', '${id.dA}')`,
          )
        ).code,
      ).toBe("42501");
    });
  },
);
