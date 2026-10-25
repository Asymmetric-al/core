/**
 * #2252 real-stack acceptance, spec r2 (approved by Samson Oct 24, 2026):
 * criteria 1-6, 8 (seed rows), 9 (idempotency) and 12.2-12.3. Runs against
 * the migrated database named by TENANT_GUARD_IT_ADMIN_DATABASE_URL; without
 * it the block skips, except in the CI `migrate` job, where it fails.
 * Every case runs in its own transaction, which is rolled back.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  CATALOG_SQL,
  CHECK_DEF,
  FOLLOW_UPS,
  MIGRATION,
  NEW_CHECK,
  NEW_FK,
  OLD_FK,
  PREFLIGHT_QUERY,
  ROLLBACK,
  SPINE,
  body,
  evaluate,
  PREFLIGHT_PHRASE,
  type FkRow,
} from "./harness";

const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
const IN_MIGRATE_JOB =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_JOB === "migrate";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

type PgErr = { code?: string; constraint?: string; message?: string };

describe.skipIf(!ADMIN_URL)("#2252 donor spine composite FKs (R)", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  let [TA, TB, DA, DB, XA] = ["", "", "", "", ""];

  beforeAll(() => db.connect());
  afterAll(() => db.end());

  /** One case = one transaction with the spec §4 fixture, always rolled back. */
  async function tx(fn: () => Promise<void>) {
    [TA, TB, DA, DB, XA] = [1, 2, 3, 4, 5].map(() => randomUUID());
    await db.query("begin");
    try {
      await db.query(
        `insert into public.tenants (id, name, slug) values ($1::uuid, 'acc2252 A', 'acc2252-' || $1::text), ($2::uuid, 'acc2252 B', 'acc2252-' || $2::text)`,
        [TA, TB],
      );
      await db.query(
        `insert into public.donors (id, tenant_id, email) values ($1, $2, 'acc2252-a@example.test'), ($3, $4, 'acc2252-b@example.test')`,
        [DA, TA, DB, TB],
      );
      await db.query(
        "insert into public.donations (id, tenant_id, donor_id, amount) values ($1, $2, $3, 10)",
        [XA, TA, DA],
      );
      await fn();
    } finally {
      await db.query("rollback");
    }
  }
  /** Runs one statement under a savepoint; returns the error (or null). */
  async function attempt(sql: string, args: unknown[] = []) {
    await db.query("savepoint a");
    try {
      await db.query(sql, args);
      await db.query("release savepoint a");
      return null;
    } catch (e) {
      await db.query("rollback to savepoint a");
      const { code, constraint, message } = e as PgErr;
      return { code, constraint, message };
    }
  }
  const insert = (tenant: string | null, donor: string | null) =>
    attempt(
      "insert into public.donations (tenant_id, donor_id, amount) values ($1, $2, 10)",
      [tenant, donor],
    );
  async function rows(): Promise<FkRow[]> {
    const r = await db.query(CATALOG_SQL, [SPINE.map(([, n]) => n)]);
    return r.rows as FkRow[];
  }
  const donationFks = async () =>
    (await rows()).filter(
      (r) => r.table === "donations" && r.refTable === "donors",
    );
  const exists = async (name: string) =>
    (
      await db.query(
        "select 1 from pg_constraint where conrelid = 'public.donations'::regclass and conname = $1",
        [name],
      )
    ).rowCount === 1;

  async function expectCriterion3Shape() {
    const fk = await db.query(
      `select contype, convalidated, confmatchtype, confupdtype, confdeltype,
         confrelid = 'public.donors'::regclass as to_donors,
         array(select a.attname::text from unnest(conkey) with ordinality k(n, i) join pg_attribute a on a.attrelid = conrelid and a.attnum = k.n order by k.i) as cols,
         array(select a.attname::text from unnest(confkey) with ordinality k(n, i) join pg_attribute a on a.attrelid = confrelid and a.attnum = k.n order by k.i) as ref
       from pg_constraint where conrelid = 'public.donations'::regclass and conname = $1`,
      [NEW_FK],
    );
    expect(fk.rows, NEW_FK).toEqual([
      {
        contype: "f",
        convalidated: true,
        confmatchtype: "s",
        confupdtype: "a",
        confdeltype: "a",
        to_donors: true,
        cols: ["tenant_id", "donor_id"],
        ref: ["tenant_id", "id"],
      },
    ]);
    const ck = await db.query(
      "select convalidated, pg_get_constraintdef(oid) def from pg_constraint where conrelid = 'public.donations'::regclass and conname = $1",
      [NEW_CHECK],
    );
    expect(ck.rows, NEW_CHECK).toEqual([
      { convalidated: true, def: CHECK_DEF },
    ]);
    const single = (await donationFks()).filter(
      (r) => r.cols.join() === "donor_id",
    );
    expect(
      single.map((r) => r.name),
      "no FK from donations on (donor_id)",
    ).toEqual([]);
  }
  async function expectOneDonationFk(name: string) {
    expect(
      (await donationFks()).map((r) => r.name),
      "12.2 exactly one donations -> donors FK",
    ).toEqual([name]);
  }

  it("C1: cross-tenant donation -> donor links are refused (23503) on INSERT and UPDATE; same-tenant and NULL donor pass", () =>
    tx(async () => {
      expect(await insert(TA, DB)).toMatchObject({
        code: "23503",
        constraint: NEW_FK,
      });
      expect(
        await attempt(
          "update public.donations set donor_id = $1 where id = $2",
          [DB, XA],
        ),
      ).toMatchObject({ code: "23503", constraint: NEW_FK });
      expect(await insert(TA, DA)).toBeNull();
      expect(await insert(TA, null)).toBeNull();
      expect(
        await insert(TA, randomUUID()),
        "donor existence still enforced",
      ).toMatchObject({ code: "23503" });
    }));

  it("C2: a NULL-tenant donation naming a donor is refused (23514); (NULL, NULL) still succeeds", () =>
    tx(async () => {
      expect(await insert(null, DA)).toMatchObject({
        code: "23514",
        constraint: NEW_CHECK,
      });
      expect(await insert(null, randomUUID())).toMatchObject({
        code: "23514",
        constraint: NEW_CHECK,
      });
      expect(await insert(null, null)).toBeNull();
    }));

  it("C3 + 12.2: catalog shape of the new FK and CHECK; exactly one donations -> donors FK", () =>
    tx(async () => {
      await expectCriterion3Shape();
      await expectOneDonationFk(NEW_FK);
    }));

  it("C8: the operator preflight query returns no rows on the migrated, seeded database", () =>
    tx(async () => {
      expect((await db.query(PREFLIGHT_QUERY)).rows).toEqual([]);
    }));

  for (const kind of ["cross", "null"] as const)
    it(`C4: the forward body refuses a pre-existing ${kind}-tenant row with counts only and rewrites nothing`, () =>
      tx(async () => {
        await db.query(body(ROLLBACK));
        const cx = randomUUID();
        const [tenant, donor] = kind === "cross" ? [TA, DB] : [null, DA];
        await db.query(
          "insert into public.donations (id, tenant_id, donor_id, amount) values ($1, $2, $3, 10)",
          [cx, tenant, donor],
        );
        await db.query("savepoint pre");
        const err = await db.query(body(MIGRATION)).then(
          () => null,
          (e: PgErr) => e,
        );
        await db.query("rollback to savepoint pre");
        expect(err?.code).toBe("23503");
        expect(err?.message).toContain(PREFLIGHT_PHRASE);
        for (const id of [cx, tenant, donor].filter(Boolean))
          expect(JSON.stringify(err), "no ids in the error").not.toContain(id);
        const row = await db.query(
          "select tenant_id, donor_id from public.donations where id = $1",
          [cx],
        );
        expect(row.rows).toEqual([{ tenant_id: tenant, donor_id: donor }]);
        expect([
          await exists(OLD_FK),
          await exists(NEW_FK),
          await exists(NEW_CHECK),
        ]).toEqual([true, false, false]);
        const q = await db.query(PREFLIGHT_QUERY);
        expect(
          q.rows.map((r: Record<string, unknown>) => [
            r.donation_id,
            r.problem,
          ]),
        ).toEqual([[cx, kind === "cross" ? "cross_tenant" : "null_tenant"]]);
      }));

  it("C5/C6: the evaluator passes: 7 spine FKs, 21 FKs into donors = 7 spine + 14 follow-ups", () =>
    tx(async () => {
      const r = await rows();
      expect(evaluate(r)).toEqual([]);
      const into = r
        .filter((x) => x.refTable === "donors")
        .map((x) => x.name)
        .sort();
      expect(into).toEqual([...SPINE.map(([, n]) => n), ...FOLLOW_UPS].sort());
    }));

  /** Each mutation runs under a savepoint and must make the evaluator name `want`. */
  async function mutant(sql: string, want: string) {
    await db.query("savepoint m");
    try {
      await db.query(sql);
      const problems = evaluate(await rows());
      expect(
        problems.some((p) => p.includes(want)),
        `${want} in ${JSON.stringify(problems)}`,
      ).toBe(true);
    } finally {
      await db.query("rollback to savepoint m");
    }
  }
  it("C5 mutations: drop / single-column / NOT VALID on each of the 7, and dropping the CHECK, each turn the evaluator red naming the FK", () =>
    tx(async () => {
      for (const [t, n] of SPINE) {
        const fk = (await rows()).find((r) => r.name === n);
        expect(fk, `${n} exists before mutating`).toBeDefined();
        const col = fk!.cols[1]!;
        const drop = `alter table public.${t} drop constraint ${n};`;
        await mutant(drop, `${n}: missing`);
        await mutant(
          `${drop} alter table public.${t} add constraint ${n} foreign key (${col}) references public.donors(id);`,
          `${n}: not composite`,
        );
        await mutant(
          `${drop} alter table public.${t} add constraint ${n} foreign key (tenant_id, ${col}) references public.donors(tenant_id, id) not valid;`,
          `${n}: NOT VALID`,
        );
      }
      await mutant(
        `alter table public.donations drop constraint ${NEW_CHECK}`,
        `${NEW_FK}: not tenant-complete`,
      );
    }));

  it("C6 mutations: a new single-column donor FK, and a listed follow-up turned composite, turn the ratchet red", () =>
    tx(async () => {
      await mutant(
        "alter table public.donor_activities add constraint t2252_probe foreign key (donor_id) references public.donors(id)",
        "t2252_probe: new single-column donor reference",
      );
      await mutant(
        `alter table public.staged_gifts drop constraint staged_gifts_donor_id_fkey;
         alter table public.staged_gifts add constraint staged_gifts_donor_id_fkey foreign key (tenant_id, donor_id) references public.donors(tenant_id, id) not valid`,
        "staged_gifts_donor_id_fkey: stale entry: remove it from the follow-up list",
      );
    }));

  it("12.3 mutation: keeping donations_donor_id_fkey beside the composite FK is red, naming both and PGRST201", () =>
    tx(async () => {
      await db.query("savepoint m");
      await db.query(
        `alter table public.donations add constraint ${OLD_FK} foreign key (donor_id) references public.donors(id)`,
      );
      const p = evaluate(await rows()).filter((x) =>
        x.includes("ambiguous embed (PGRST201)"),
      );
      expect(p).toHaveLength(1);
      expect(p[0]).toContain(OLD_FK);
      expect(p[0]).toContain(NEW_FK);
      await db.query("rollback to savepoint m");
    }));

  it("C9 idempotency + 12.2: forward x2, rollback x2, forward x1 raise nothing; one donations -> donors FK after each phase", () =>
    tx(async () => {
      const [fwd, back] = [body(MIGRATION), body(ROLLBACK)];
      await db.query(fwd);
      await expectOneDonationFk(NEW_FK);
      await db.query(fwd);
      await db.query(back);
      await expectOneDonationFk(OLD_FK);
      expect(
        [await exists(NEW_FK), await exists(NEW_CHECK)],
        "rollback drops both",
      ).toEqual([false, false]);
      const old = await db.query(
        "select convalidated, pg_get_constraintdef(oid) def from pg_constraint where conrelid = 'public.donations'::regclass and conname = $1",
        [OLD_FK],
      );
      expect(old.rows).toEqual([
        {
          convalidated: true,
          def: "FOREIGN KEY (donor_id) REFERENCES donors(id)",
        },
      ]);
      await db.query(back);
      await expectOneDonationFk(OLD_FK);
      await db.query(fwd);
      await expectCriterion3Shape();
      await expectOneDonationFk(NEW_FK);
      expect(evaluate(await rows())).toEqual([]);
    }));
});
