import { createHash } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2674/harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");

describe.skipIf(!ADMIN_URL)(
  "AL-2671 N4 PR 1: Core's sign-in limits, per account and per address (real stack, every test rolled back)",
  () => {
    let db: pg.Client;

    beforeAll(async () => {
      db = new pg.Client({ connectionString: ADMIN_URL });
      await db.connect();
    });

    afterAll(async () => {
      await db?.end();
    });

    async function inTx(work: () => Promise<void>) {
      await db.query("BEGIN");
      try {
        await work();
      } finally {
        await db.query("ROLLBACK");
      }
    }

    async function asService<T>(work: () => Promise<T>): Promise<T> {
      await db.query("SET LOCAL ROLE service_role");
      try {
        return await work();
      } finally {
        await db.query("RESET ROLE");
      }
    }

    const take = (account: string, address: string) =>
      asService(async () =>
        Boolean(
          (
            await db.query("SELECT public.take_sign_in_attempt($1, $2) AS ok", [
              account,
              address,
            ])
          ).rows[0].ok,
        ),
      );

    const fail = (account: string) =>
      asService(async () => {
        await db.query("SELECT public.record_sign_in_failure($1)", [account]);
      });

    it("thirty attempts from one address pass across accounts, the thirty-first is refused, and another address is unaffected", () =>
      inTx(async () => {
        const address = "198.51.100.77";
        const answers: boolean[] = [];
        for (let i = 0; i < 31; i += 1)
          answers.push(await take(`person-${i}@example.test`, address));
        expect(answers).toEqual([...Array(30).fill(true), false]);
        expect(await take("person-0@example.test", "203.0.113.8")).toBe(true);
      }));

    it("ten refused passwords for one account refuse it from every address, while another account and the same addresses still pass", () =>
      inTx(async () => {
        const account = "target@example.test";
        for (let i = 0; i < 9; i += 1) await fail(account);
        expect(await take(account, "198.51.100.1")).toBe(true);
        await fail(account);
        for (const address of ["198.51.100.1", "198.51.100.2", "203.0.113.9"])
          expect(await take(account, address), address).toBe(false);
        expect(await take("other@example.test", "198.51.100.1")).toBe(true);
      }));

    it("a limit ends with its window: an account refused in an ended window passes in the current one", () =>
      inTx(async () => {
        const account = "earlier@example.test";
        await db.query(
          "INSERT INTO private.sign_in_windows (kind, key_digest, window_start, hits) VALUES ('account', $1, now() - interval '1 hour', 50)",
          [digest(account)],
        );
        expect(await take(account, "198.51.100.3")).toBe(true);
        const ended = (
          await db.query(
            "SELECT count(*)::int AS n FROM private.sign_in_windows WHERE window_start < now() - interval '20 minutes'",
          )
        ).rows[0].n;
        expect(ended).toBe(0);
      }));

    it("stores digests only: no account address or client address in any row", () =>
      inTx(async () => {
        const account = "stored@example.test";
        const address = "198.51.100.44";
        await take(account, address);
        await fail(account);
        const rows = (
          await db.query(
            "SELECT kind, key_digest, hits FROM private.sign_in_windows WHERE key_digest IN ($1, $2) ORDER BY kind",
            [digest(account), digest(address)],
          )
        ).rows;
        expect(rows).toEqual([
          { kind: "account", key_digest: digest(account), hits: 1 },
          { kind: "address", key_digest: digest(address), hits: 1 },
        ]);
        const raw = (
          await db.query(
            "SELECT count(*)::int AS n FROM private.sign_in_windows AS w WHERE to_jsonb(w)::text LIKE ANY ($1)",
            [[`%${account}%`, `%${address}%`]],
          )
        ).rows[0].n;
        expect(raw).toBe(0);
      }));

    it("only service_role may call either function: the publishable key's roles are refused, and blank keys are refused", () =>
      inTx(async () => {
        const grants = (
          await db.query(
            `SELECT r,
                    has_function_privilege(r, 'public.take_sign_in_attempt(text, text)', 'EXECUTE') AS take,
                    has_function_privilege(r, 'public.record_sign_in_failure(text)', 'EXECUTE') AS fail
               FROM unnest(ARRAY['anon', 'authenticated', 'service_role']) AS r ORDER BY r`,
          )
        ).rows;
        expect(grants).toEqual([
          { r: "anon", take: false, fail: false },
          { r: "authenticated", take: false, fail: false },
          { r: "service_role", take: true, fail: true },
        ]);
        const table = (
          await db.query(
            `SELECT has_table_privilege(r, 'private.sign_in_windows', 'SELECT') AS can
               FROM unnest(ARRAY['anon', 'authenticated', 'service_role']) AS r`,
          )
        ).rows.map((row) => row.can);
        expect(table).toEqual([false, false, false]);

        for (const [roleName, sql, args] of [
          [
            "anon",
            "SELECT public.take_sign_in_attempt($1, $2)",
            ["a@example.test", "198.51.100.5"],
          ],
          [
            "authenticated",
            "SELECT public.record_sign_in_failure($1)",
            ["a@example.test"],
          ],
          [
            "service_role",
            "SELECT public.take_sign_in_attempt($1, $2)",
            ["  ", "198.51.100.5"],
          ],
          [
            "service_role",
            "SELECT public.take_sign_in_attempt($1, $2)",
            ["a@example.test", " "],
          ],
        ] as const) {
          await db.query("SAVEPOINT n4_limits");
          await db.query(`SET LOCAL ROLE ${roleName}`);
          const refused = await db
            .query(sql, [...args])
            .then(() => null)
            .catch((e: { code?: string }) => e.code ?? "error");
          await db.query("ROLLBACK TO SAVEPOINT n4_limits");
          await db.query("RESET ROLE");
          expect(refused, `${roleName} ${sql}`).not.toBeNull();
        }
      }));
  },
);
