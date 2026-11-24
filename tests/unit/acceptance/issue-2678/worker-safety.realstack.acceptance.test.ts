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
  keepAs,
} from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2678 worker safety room (plan WP5 lines 984 and 1003-1007, Phase 10, W5-R7)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = {
      ...fixtureIds(),
      UST: randomUUID(),
      mST: randomUUID(),
      UOP: randomUUID(),
    };
    const queryAs = asRole(db, id);
    const writeAs = keepAs(db, id);
    const admin = caller(id, "US", "mS", "TA");
    const plainStaff = {
      sub: "UST",
      headers: { "x-asym-tenant": id.TA, "x-asym-assignment": id.mST },
    };
    const staffB = caller(id, "UBS", "mBS", "TB");
    const staffBforgedA = {
      sub: "UBS",
      headers: { "x-asym-tenant": id.TA, "x-asym-assignment": id.mBS },
    };
    const donor = caller(id, "UDA", "mDA", "TA");
    const missionary = caller(id, "UM", "mM", "TA");
    const operator = {
      sub: "UOP",
      aal: "aal2",
      headers: { "x-asym-tenant": id.TA },
    };

    beforeAll(async () => {
      await db.connect();
      await db.query("begin");
      await db.query(fixtureSql(id as never));
      await db.query(
        "update authz.memberships set is_tenant_admin = true where id = $1",
        [id.mS],
      );
      await db.query("insert into auth.users (id) values ($1), ($2)", [
        id.UST,
        id.UOP,
      ]);
      await db.query(
        "delete from authz.memberships where user_id in ($1, $2)",
        [id.UST, id.UOP],
      );
      await db.query(
        "insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_active) values ($1, $2, $3, 'staff', 'development', true)",
        [id.mST, id.UST, id.TA],
      );
      await db.query(
        "insert into authz.platform_operators (user_id, added_by, reason) values ($1, 'acc2678', 'fixture operator')",
        [id.UOP],
      );
    });
    afterAll(async () => {
      await db.query("rollback");
      await db.end();
    });

    const run = (who: object, sql: string) =>
      queryAs("authenticated", who as never, sql);
    const act = (who: object, sql: string) =>
      writeAs("authenticated", who as never, sql);
    const setIdentity = (
      who: object,
      party: string,
      level: string | null,
      alias: string | null,
      reason = "fixture",
    ) =>
      act(
        who,
        `select public.set_worker_identity('${id.TA}', '${party}', 'Legal Name', 'Real Country', 'Precise Place', null, ${level ? `'${level}'` : "null"}, ${alias ? `'${alias}'` : "null"}, ${reason === "" ? "''" : `'${reason}'`}) as r`,
      );

    it("set_worker_identity with no level leaves the standard level with the unreviewed marker, and the worker raises the signal; confirming it marks it manual and clears the signal", async () => {
      await db.query("savepoint s");
      try {
        const created = await setIdentity(admin, id.pM2, null, null);
        expect(created.code, created.message).toBeNull();
        expect(created.rows[0]!.r).toMatchObject({
          created: true,
          security_level: "standard",
          security_level_source: "unreviewed_default",
        });
        const signal = async () =>
          (
            await run(
              admin,
              "select party_id from public.unreviewed_worker_security_levels()",
            )
          ).rows.map((r) => r.party_id);
        expect(await signal()).toEqual(
          expect.arrayContaining([id.pM2, id.pMA]),
        );
        const confirmed = await act(
          admin,
          `select public.restrict_worker_publication('${id.TA}', '${id.pM2}', 'standard', null, null, 'Reviewed with the field director') as r`,
        );
        expect(confirmed.rows[0]!.r).toMatchObject({
          security_level: "standard",
          security_level_source: "manual",
        });
        expect(await signal()).not.toContain(id.pM2);
        expect(await signal()).toContain(id.pMA);
        expect(
          (
            await run(
              plainStaff,
              "select party_id from public.unreviewed_worker_security_levels()",
            )
          ).rows.map((r) => r.party_id),
        ).toContain(id.pMA);
        for (const who of [donor, missionary, staffBforgedA, operator])
          expect(
            (
              await run(
                who,
                "select * from public.unreviewed_worker_security_levels()",
              )
            ).rows,
          ).toEqual([]);
        const audit = await db.query(
          "select action, details->>'reason' reason from public.audit_logs where tenant_id = $1 and resource_id = $2 order by created_at, action",
          [id.TA, id.pM2],
        );
        expect(audit.rows).toEqual([
          { action: "worker_identity_set", reason: "fixture" },
          {
            action: "worker_publication_restricted",
            reason: "Reviewed with the field director",
          },
        ]);
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("a staff member's direct insert or update of a Party's level, alias or do-not-publish is refused (42501), and the restrict and lift commands set them with a reason and an audit row", async () => {
      await db.query("savepoint s");
      try {
        for (const sql of [
          `update public.parties set security_level = 'restricted' where id = '${id.pMA}'`,
          `update public.parties set public_alias = 'X' where id = '${id.pMA}'`,
          `update public.parties set do_not_publish = true where id = '${id.pMA}'`,
          `update public.parties set security_level_source = 'manual' where id = '${id.pMA}'`,
          `insert into public.parties (tenant_id, display_name, security_level, public_alias, do_not_publish) values ('${id.TA}', 'x', 'restricted', 'y', true)`,
        ])
          expect((await run(admin, sql)).code, sql).toBe("42501");
        expect(
          (await setIdentity(admin, id.pMA, "restricted", "Shepherd")).code,
        ).toBeNull();
        const restricted = await act(
          admin,
          `select public.restrict_worker_publication('${id.TA}', '${id.pMA}', 'high_risk', 'Shepherd Two', true, 'Threat assessment') as r`,
        );
        expect(restricted.rows[0]!.r).toMatchObject({
          security_level: "high_risk",
          security_level_source: "manual",
          do_not_publish: true,
        });
        const row = await db.query(
          "select public_alias from public.parties where id = $1",
          [id.pMA],
        );
        expect(row.rows).toEqual([{ public_alias: "Shepherd Two" }]);
        expect(
          (
            await act(
              admin,
              `select public.restrict_worker_publication('${id.TA}', '${id.pMA}', 'sensitive', null, null, 'lower')`,
            )
          ).code,
          "restrict never lowers",
        ).toBe("22023");
        const lifted = await act(
          admin,
          `select public.lift_worker_restriction('${id.TA}', '${id.pMA}', 'standard', true, 'Returned home') as r`,
        );
        expect(lifted.rows[0]!.r).toMatchObject({
          security_level: "standard",
          security_level_source: "manual",
          do_not_publish: false,
        });
        expect(
          (
            await act(
              admin,
              `select public.lift_worker_restriction('${id.TA}', '${id.pMA}', 'restricted', null, 'raise')`,
            )
          ).code,
          "lift never raises",
        ).toBe("22023");
        for (const reason of ["", "   "])
          expect(
            (
              await act(
                admin,
                `select public.restrict_worker_publication('${id.TA}', '${id.pMA}', 'restricted', null, null, '${reason}')`,
              )
            ).code,
          ).toBe("22023");
        expect(
          (
            await run(
              admin,
              `select public.set_worker_identity('${id.TA}', '${id.pMA}', 'Legal', null, null, null, 'restricted', null, 'edit')`,
            )
          ).code,
          "after creation the level moves only through restrict and lift",
        ).toBe("22023");
        for (const who of [plainStaff, donor, missionary, staffBforgedA])
          for (const sql of [
            `select public.restrict_worker_publication('${id.TA}', '${id.pMA}', 'restricted', 'A', null, 'r')`,
            `select public.lift_worker_restriction('${id.TA}', '${id.pMA}', 'standard', true, 'r')`,
            `select public.set_worker_identity('${id.TA}', '${id.pM2}', 'Legal', null, null, null, null, null, 'r')`,
          ])
            expect((await run(who, sql)).code, sql).toBe("42501");
        const audit = await db.query(
          "select action from public.audit_logs where tenant_id = $1 and resource_id = $2 order by created_at",
          [id.TA, id.pMA],
        );
        expect(audit.rows.map((r) => r.action)).toEqual([
          "worker_identity_set",
          "worker_publication_restricted",
          "worker_restriction_lifted",
        ]);
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("each safety command refuses a request whose organization header is missing or names another organization than the one it enters (42501), and changes nothing, as the Member Care and Sites commands do until begin_human_command checks it itself", async () => {
      await db.query("savepoint s");
      try {
        const before = await db.query(
          "select id, security_level, public_alias, do_not_publish from public.parties where tenant_id = $1 order by id",
          [id.TA],
        );
        const restrictedBefore = await db.query(
          "select party_id, legal_name from private.party_restricted where tenant_id = $1 order by party_id",
          [id.TA],
        );
        for (const who of [
          { sub: "US", headers: { "x-asym-assignment": id.mS } },
          {
            sub: "US",
            headers: { "x-asym-tenant": id.TB, "x-asym-assignment": id.mS },
          },
        ])
          for (const sql of [
            `select public.restrict_worker_publication('${id.TA}', '${id.pMA}', 'high_risk', 'Shepherd', true, 'r')`,
            `select public.lift_worker_restriction('${id.TA}', '${id.pMA}', 'standard', true, 'r')`,
            `select public.set_worker_identity('${id.TA}', '${id.pM2}', 'Legal', null, null, null, null, null, 'r')`,
          ]) {
            const refused = await run(who, sql);
            expect(refused.code, sql).toBe("42501");
            expect(refused.message, sql).toContain(
              "request tenant scope is required and must match command tenant",
            );
          }
        const after = await db.query(
          "select id, security_level, public_alias, do_not_publish from public.parties where tenant_id = $1 order by id",
          [id.TA],
        );
        expect(after.rows).toEqual(before.rows);
        const restrictedAfter = await db.query(
          "select party_id, legal_name from private.party_restricted where tenant_id = $1 order by party_id",
          [id.TA],
        );
        expect(restrictedAfter.rows).toEqual(restrictedBefore.rows);
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("a restricted or high-risk level without an alias, or with the legal name as alias, is refused from either table for every role", async () => {
      await db.query("savepoint s");
      try {
        await db.query(
          "insert into private.party_restricted (party_id, tenant_id, legal_name) values ($1, $2, 'Legal Name')",
          [id.pMA, id.TA],
        );
        const attempt = async (role: string, sql: string) => {
          await db.query("savepoint attempt");
          try {
            await db.query(`set local role ${role}`);
            if (role === "tenant_guard")
              await db.query(`select tenant_guard.enter('${id.TA}')`);
            await db.query(sql);
            return null;
          } catch (e) {
            return (e as { code?: string }).code ?? "?";
          } finally {
            await db.query("rollback to savepoint attempt");
          }
        };
        for (const level of ["restricted", "high_risk"]) {
          for (const role of ["postgres", "tenant_guard", "service_role"]) {
            for (const alias of [
              "null",
              "''",
              "'  '",
              "'legal name'",
              "' Legal Name '",
            ])
              expect(
                await attempt(
                  role,
                  `update public.parties set security_level = '${level}', public_alias = ${alias} where id = '${id.pMA}'`,
                ),
                `${role} ${level} ${alias}`,
              ).toBe("23514");
            expect(
              await attempt(
                role,
                `update public.parties set security_level = '${level}', public_alias = 'Shepherd' where id = '${id.pMA}'`,
              ),
              `${role} ${level} with a distinct alias`,
            ).toBeNull();
          }
          await db.query("savepoint level");
          await db.query(
            `update public.parties set security_level = '${level}', public_alias = 'Shepherd' where id = '${id.pMA}'`,
          );
          for (const role of ["postgres", "tenant_guard"])
            expect(
              await attempt(
                role,
                `update private.party_restricted set legal_name = 'SHEPHERD' where party_id = '${id.pMA}'`,
              ),
              `${role} renames the legal name to the alias`,
            ).toBe("23514");
          expect(
            await attempt(
              "postgres",
              `insert into public.parties (tenant_id, display_name, security_level) values ('${id.TA}', 'New', '${level}')`,
            ),
          ).toBe("23514");
          await db.query("rollback to savepoint level");
        }
        expect(
          (await setIdentity(admin, id.pM2, "restricted", null)).code,
          "the command meets the same rule",
        ).toBe("23514");
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("a signed-in user reads nothing of party_restricted directly; tenant staff read a worker's legal name through the read function; a donor, a missionary, another tenant's staff and an operator without a staff membership do not", async () => {
      await db.query("savepoint s");
      try {
        expect(
          (await setIdentity(admin, id.pMA, "restricted", "Shepherd")).code,
        ).toBeNull();
        for (const who of [admin, donor, missionary, staffB])
          expect(
            (await run(who, "select * from private.party_restricted")).code,
          ).toBe("42501");
        const read = (who: object) =>
          run(
            who,
            `select party_id, legal_name, real_country, precise_location from public.read_party_restricted('${id.pMA}')`,
          );
        for (const who of [admin, plainStaff])
          expect((await read(who)).rows).toEqual([
            {
              party_id: id.pMA,
              legal_name: "Legal Name",
              real_country: "Real Country",
              precise_location: "Precise Place",
            },
          ]);
        for (const who of [
          donor,
          missionary,
          staffB,
          staffBforgedA,
          operator,
          { sub: "UOP", aal: "aal2" },
        ]) {
          const result = await read(who);
          expect(result.code).toBeNull();
          expect(result.rows).toEqual([]);
        }
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("the name projection gives the alias, else the approved profile's name, else the Party's name, and never the legal name", async () => {
      const name = async (
        alias: string | null,
        approved: string | null,
        party: string,
      ) =>
        (
          await run(
            donor,
            `select public.worker_public_display_name(${alias === null ? "null" : `'${alias}'`}, ${approved === null ? "null" : `'${approved}'`}, '${party}') as n`,
          )
        ).rows[0]!.n;
      expect(await name("Shepherd", "Approved", "Party")).toBe("Shepherd");
      expect(await name("  ", "Approved", "Party")).toBe("Approved");
      expect(await name(null, null, "Party")).toBe("Party");
      expect(await name(null, " ", "Party")).toBe("Party");
      const seeded = await db.query(
        `select public.worker_public_display_name(p.public_alias, null, p.display_name) n, r.legal_name
           from public.parties p join private.party_restricted r on r.party_id = p.id`,
      );
      for (const row of seeded.rows) expect(row.n).not.toBe(row.legal_name);
    });

    it("set_worker_identity on a worker restricted first keeps the level, its source, the alias and do-not-publish, still records the legal identity, and its audit row carries before and after (finding B1)", async () => {
      await db.query("savepoint s");
      try {
        const restricted = await act(
          admin,
          `select public.restrict_worker_publication('${id.TA}', '${id.pM2}', 'high_risk', 'Cedar', true, 'Urgent threat') as r`,
        );
        expect(restricted.code, restricted.message).toBeNull();
        const identified = await act(
          admin,
          `select public.set_worker_identity('${id.TA}', '${id.pM2}', 'Real Legal Name', 'Closed Country', 'Exact City', null, null, null, 'Record legal identity') as r`,
        );
        expect(identified.code, identified.message).toBeNull();
        const state = {
          security_level: "high_risk",
          security_level_source: "manual",
          public_alias: "Cedar",
          do_not_publish: true,
        };
        expect(
          (
            await db.query(
              "select security_level, security_level_source, public_alias, do_not_publish from public.parties where id = $1",
              [id.pM2],
            )
          ).rows,
        ).toEqual([state]);
        expect(
          (
            await db.query(
              "select legal_name from private.party_restricted where party_id = $1",
              [id.pM2],
            )
          ).rows,
        ).toEqual([{ legal_name: "Real Legal Name" }]);
        expect(
          (
            await db.query(
              "select details->'before' as before, details->'after' as after from public.audit_logs where tenant_id = $1 and resource_id = $2 and action = 'worker_identity_set'",
              [id.TA, id.pM2],
            )
          ).rows,
        ).toEqual([{ before: state, after: state }]);
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("set_worker_identity refuses a level or an alias argument (22023) once a worker's level was set or reviewed, and a worker confirmed standard keeps its manual source (finding B1)", async () => {
      await db.query("savepoint s");
      try {
        expect(
          (
            await act(
              admin,
              `select public.restrict_worker_publication('${id.TA}', '${id.pM2}', 'high_risk', 'Cedar', true, 'Urgent threat')`,
            )
          ).code,
        ).toBeNull();
        expect(
          (await setIdentity(admin, id.pM2, "standard", null)).code,
          "a lower level",
        ).toBe("22023");
        expect(
          (await setIdentity(admin, id.pM2, null, "Other alias")).code,
          "another alias",
        ).toBe("22023");
        expect(
          (
            await db.query(
              "select security_level, public_alias from public.parties where id = $1",
              [id.pM2],
            )
          ).rows,
        ).toEqual([{ security_level: "high_risk", public_alias: "Cedar" }]);
      } finally {
        await db.query("rollback to savepoint s");
      }
      await db.query("savepoint s");
      try {
        expect(
          (
            await act(
              admin,
              `select public.restrict_worker_publication('${id.TA}', '${id.pM2}', 'standard', null, null, 'Reviewed with the field director')`,
            )
          ).code,
        ).toBeNull();
        expect((await setIdentity(admin, id.pM2, null, null)).code).toBeNull();
        expect(
          (
            await db.query(
              "select security_level, security_level_source from public.parties where id = $1",
              [id.pM2],
            )
          ).rows,
        ).toEqual([
          { security_level: "standard", security_level_source: "manual" },
        ]);
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("an administrator of A naming a Party of B in any of the three commands is answered P0002 and nothing changes in B (finding B6)", async () => {
      await db.query("savepoint s");
      try {
        const party = () =>
          db.query(
            "select security_level, security_level_source, public_alias, do_not_publish, updated_at from public.parties where id = $1",
            [id.pMB],
          );
        const before = (await party()).rows;
        for (const sql of [
          `select public.set_worker_identity('${id.TA}', '${id.pMB}', 'Legal', null, null, null, null, null, 'r')`,
          `select public.restrict_worker_publication('${id.TA}', '${id.pMB}', 'high_risk', 'Cedar', true, 'r')`,
          `select public.lift_worker_restriction('${id.TA}', '${id.pMB}', 'standard', true, 'r')`,
        ])
          expect((await act(admin, sql)).code, sql).toBe("P0002");
        expect((await party()).rows).toEqual(before);
        expect(
          (
            await db.query(
              `select (select count(*) from private.party_restricted where party_id = $1) restricted,
                      (select count(*) from public.audit_logs where resource_id = $1::text) audits`,
              [id.pMB],
            )
          ).rows,
        ).toEqual([{ restricted: "0", audits: "0" }]);
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("the unreviewed signal answers B's own staff with B's workers only (finding B6)", async () => {
      const signal = await run(
        staffB,
        "select party_id from public.unreviewed_worker_security_levels()",
      );
      expect(signal.code, signal.message).toBeNull();
      expect(signal.rows.map((r) => r.party_id)).toEqual([id.pMB]);
    });

    it("the command role writes party_restricted through its named columns only, and the service key holds nothing on it (finding B8)", async () => {
      const grants = await db.query(
        `select has_column_privilege('tenant_guard', 'private.party_restricted', 'legal_name', 'UPDATE') legal_update,
                has_column_privilege('tenant_guard', 'private.party_restricted', 'real_photo_ref', 'UPDATE') photo_update,
                has_column_privilege('tenant_guard', 'private.party_restricted', 'real_photo_ref', 'INSERT') photo_insert,
                has_column_privilege('tenant_guard', 'private.party_restricted', 'party_id', 'UPDATE') key_update,
                has_column_privilege('tenant_guard', 'private.party_restricted', 'party_id', 'INSERT') key_insert,
                has_table_privilege('service_role', 'private.party_restricted', 'SELECT') service_read`,
      );
      expect(grants.rows).toEqual([
        {
          legal_update: true,
          photo_update: false,
          photo_insert: false,
          key_update: false,
          key_insert: true,
          service_read: false,
        },
      ]);
    });

    it("each guard command of this package share-locks its organization before its targets, and the three safety commands check the request's organization first, then lock the caller's assignment and re-check the active organization, the live assignment and the capability under those locks before any validation", async () => {
      const safety = [
        "set_worker_identity",
        "restrict_worker_publication",
        "lift_worker_restriction",
      ];
      const claims = [
        "start_account_claim",
        "issue_account_claim_token",
        "redeem_account_claim",
      ];
      const bodies = await db.query(
        "select p.proname as name, p.prosrc as body from pg_proc as p join pg_namespace as n on n.oid = p.pronamespace where n.nspname = 'tenant_guard' and p.proname = any($1::text[]) order by 1",
        [[...safety, ...claims]],
      );
      expect(bodies.rows).toHaveLength(6);
      for (const { name, body } of bodies.rows as {
        name: string;
        body: string;
      }[]) {
        const lock = body.indexOf("private.share_lock_tenant(");
        const target = body.search(
          /FOR UPDATE|INSERT INTO|UPDATE public\.|UPDATE private\./,
        );
        expect(lock, name).toBeGreaterThan(-1);
        expect(lock, name).toBeLessThan(target);
        if (!safety.includes(name)) continue;
        const scope = body.indexOf(
          "v_request_tenant_id := authz.request_tenant_id()",
        );
        expect(scope, name).toBeGreaterThan(
          body.indexOf("tenant_guard.begin_human_command("),
        );
        expect(scope, name).toBeLessThan(lock);
        const recheck = body.indexOf(
          "the caller no longer holds the authority this command requires",
        );
        expect(body.slice(lock, recheck), name).toMatch(
          /FROM authz\.memberships AS m[\s\S]*FOR SHARE/,
        );
        expect(body.slice(lock, recheck), name).toContain(
          "'safety.restrict_publication' = ANY (authz.assignment_capabilities(v_ctx.assignment_id))",
        );
        expect(recheck, name).toBeLessThan(
          body.indexOf("A reason is required"),
        );
        expect(recheck, name).toBeLessThan(target);
      }
    });
  },
);

describe.skipIf(!ADMIN_URL)(
  "AL-2678 worker safety under concurrency (findings B6 and B10)",
  () => {
    async function withFixture(
      run: (
        f: { tenant: string; user: string; membership: string; party: string },
        connections: [pg.Client, pg.Client],
      ) => Promise<void>,
    ) {
      const admin = new pg.Client({ connectionString: ADMIN_URL });
      const first = new pg.Client({ connectionString: ADMIN_URL });
      const second = new pg.Client({ connectionString: ADMIN_URL });
      const f = {
        tenant: randomUUID(),
        user: randomUUID(),
        membership: randomUUID(),
        party: randomUUID(),
      };
      await admin.connect();
      try {
        await admin.query(
          "insert into public.tenants (id, name, slug) values ($1::uuid, 'acc2678 safety race', 'acc2678-safety-' || $1::text)",
          [f.tenant],
        );
        await admin.query(
          "insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'R', 'US', 'usd', 'R')",
          [f.tenant],
        );
        await admin.query(
          "insert into auth.users (id, email, email_confirmed_at) values ($1::uuid, 'acc2678-safety-' || $1::text || '@example.test', now())",
          [f.user],
        );
        await admin.query("delete from authz.memberships where user_id = $1", [
          f.user,
        ]);
        await admin.query(
          "insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_active, is_tenant_admin) values ($1, $2, $3, 'staff', 'development', true, true)",
          [f.membership, f.user, f.tenant],
        );
        await admin.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Race worker')",
          [f.party, f.tenant],
        );
        await admin.query(
          "insert into public.missionaries (tenant_id, party_id, legal_entity_id) values ($1, $2, $1)",
          [f.tenant, f.party],
        );
        await first.connect();
        await second.connect();
        await run(f, [first, second]);
      } finally {
        await first.end().catch(() => undefined);
        await second.end().catch(() => undefined);
        for (const sql of [
          "delete from public.audit_logs where tenant_id = $1",
          "delete from private.party_restricted where tenant_id = $1",
          "delete from public.missionaries where tenant_id = $1",
          "delete from public.parties where tenant_id = $1",
          "delete from authz.memberships where tenant_id = $1",
          "delete from public.legal_entities where tenant_id = $1",
        ])
          await admin.query(sql, [f.tenant]);
        await admin.query("delete from auth.users where id = $1", [f.user]);
        await admin.query("delete from public.tenants where id = $1", [
          f.tenant,
        ]);
        await admin.end();
      }
    }

    const pause = () => new Promise((resolve) => setTimeout(resolve, 300));

    it("an assignment revoked after a safety command's preamble and before its lock is refused (42501) and the command changes nothing", () =>
      withFixture(async (f, [command, revoker]) => {
        await revoker.query("begin");
        await revoker.query(
          "update authz.memberships set is_active = false, is_tenant_admin = false where id = $1",
          [f.membership],
        );
        await command.query(
          `begin; set local role authenticated;
           select set_config('request.jwt.claims', '${JSON.stringify({ sub: f.user, role: "authenticated" })}', true),
                  set_config('request.jwt.claim.sub', '', true),
                  set_config('request.headers', '${JSON.stringify({ "x-asym-tenant": f.tenant, "x-asym-assignment": f.membership })}', true);`,
        );
        let settled = false;
        const outcome = command
          .query(
            "select public.restrict_worker_publication($1, $2, 'high_risk', 'Cedar', true, 'Urgent threat') as r",
            [f.tenant, f.party],
          )
          .then(
            () => "done",
            (e) => (e as { code?: string }).code ?? "?",
          )
          .finally(() => {
            settled = true;
          });
        await pause();
        expect(settled, "the command waits on the assignment's row lock").toBe(
          false,
        );
        await revoker.query("commit");
        expect(await outcome).toBe("42501");
        await command.query("rollback");
        const party = await revoker.query(
          "select security_level, public_alias, do_not_publish from public.parties where id = $1",
          [f.party],
        );
        expect(party.rows).toEqual([
          {
            security_level: "standard",
            public_alias: null,
            do_not_publish: false,
          },
        ]);
      }));

    it("a direct write of a restricted level with an alias and a concurrent direct write of the same legal name serialize on the Party, and the second is refused (23514)", () =>
      withFixture(async (f, [levelWriter, nameWriter]) => {
        await levelWriter.query("begin");
        await levelWriter.query(
          "update public.parties set security_level = 'restricted', security_level_source = 'manual', public_alias = 'Alice' where id = $1",
          [f.party],
        );
        await nameWriter.query("begin");
        let settled = false;
        const outcome = nameWriter
          .query(
            "insert into private.party_restricted (party_id, tenant_id, legal_name) values ($1, $2, 'Alice')",
            [f.party, f.tenant],
          )
          .then(
            () => "done",
            (e) => (e as { code?: string }).code ?? "?",
          )
          .finally(() => {
            settled = true;
          });
        await pause();
        expect(settled, "the second writer waits for the first").toBe(false);
        await levelWriter.query("commit");
        expect(await outcome).toBe("23514");
        await nameWriter.query("rollback");
        const state = await levelWriter.query(
          `select (select count(*) from private.party_restricted where party_id = $1) restricted,
                  (select public_alias from public.parties where id = $1) alias`,
          [f.party],
        );
        expect(state.rows).toEqual([{ restricted: "0", alias: "Alice" }]);
      }));
  },
);
