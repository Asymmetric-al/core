import { createHash, randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2674/harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const unique = (label: string) =>
  `${label}-${randomUUID().slice(0, 8)}@example.test`;
const uniqueAddress = () =>
  `198.51.${Math.floor(Math.random() * 256)}.${1 + Math.floor(Math.random() * 254)}`;

describe.skipIf(!ADMIN_URL)(
  "AL-2671 N4 PR 1: Core's sign-in limits reserve each attempt, per account and per address (real stack)",
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

    const release = (account: string, address: string, cleared: boolean) =>
      asService(async () => {
        await db.query("SELECT public.release_sign_in_attempt($1, $2, $3)", [
          account,
          address,
          cleared,
        ]);
      });

    const clear = (account: string) =>
      asService(async () => {
        await db.query("SELECT public.clear_sign_in_account($1)", [account]);
      });

    async function hits(kind: string, key: string) {
      const { rows } = await db.query(
        "SELECT coalesce(sum(hits), 0)::int AS n FROM private.sign_in_windows WHERE kind = $1 AND key_digest = $2",
        [kind, digest(key)],
      );
      return rows[0].n as number;
    }

    async function concurrentTakes(
      sessions: number,
      account: string,
      addresses: (i: number) => string,
    ) {
      const clients = await Promise.all(
        Array.from({ length: sessions }, async () => {
          const client = new pg.Client({ connectionString: ADMIN_URL });
          await client.connect();
          await client.query("SET ROLE service_role");
          return client;
        }),
      );
      try {
        const answers = await Promise.all(
          clients.map(async (client, i) =>
            Boolean(
              (
                await client.query(
                  "SELECT public.take_sign_in_attempt($1, $2) AS ok",
                  [account, addresses(i)],
                )
              ).rows[0].ok,
            ),
          ),
        );
        return answers.filter(Boolean).length;
      } finally {
        await Promise.all(clients.map((client) => client.end()));
      }
    }

    it("an attempt that is answered gives its reservation back: forty sign-ins from one address across accounts all pass", () =>
      inTx(async () => {
        const address = "198.51.100.70";
        for (let i = 0; i < 40; i += 1) {
          const account = `signed-in-${i}@example.test`;
          expect(await take(account, address), String(i)).toBe(true);
          await release(account, address, true);
        }
        expect(await hits("address", address)).toBe(0);
      }));

    it("thirty refused passwords from one address, across thirty accounts, refuse that address for every account, while another address passes", () =>
      inTx(async () => {
        const address = "198.51.100.77";
        for (let i = 0; i < 30; i += 1)
          expect(await take(`person-${i}@example.test`, address)).toBe(true);
        expect(await take("fresh@example.test", address)).toBe(false);
        expect(await take("fresh@example.test", "203.0.113.8")).toBe(true);
        expect(await hits("address", address)).toBe(30);
      }));

    it("ten refused passwords for one account, from several addresses, refuse it from every address, while another account still passes", () =>
      inTx(async () => {
        const account = "target@example.test";
        for (let i = 0; i < 10; i += 1)
          expect(await take(account, `198.51.100.${i}`)).toBe(true);
        for (const address of ["198.51.100.1", "203.0.113.9"])
          expect(await take(account, address), address).toBe(false);
        expect(await take("other@example.test", "198.51.100.1")).toBe(true);
        expect(await hits("account", account)).toBe(10);
      }));

    it("a provider failure gives the reservation back without clearing the account", () =>
      inTx(async () => {
        const account = "flaky@example.test";
        for (let i = 0; i < 9; i += 1) await take(account, `198.51.101.${i}`);
        expect(await take(account, "198.51.101.50")).toBe(true);
        await release(account, "198.51.101.50", false);
        expect(await hits("account", account)).toBe(9);
        expect(await hits("address", "198.51.101.50")).toBe(0);
      }));

    it("a success clears the account's count, and so does a recovery", () =>
      inTx(async () => {
        const account = "recovers@example.test";
        for (let i = 0; i < 9; i += 1) await take(account, `198.51.102.${i}`);
        expect(await take(account, "198.51.102.99")).toBe(true);
        await release(account, "198.51.102.99", true);
        expect(await hits("account", account)).toBe(0);

        for (let i = 0; i < 10; i += 1) await take(account, `198.51.103.${i}`);
        expect(await take(account, "198.51.103.99")).toBe(false);
        await clear(account);
        expect(await take(account, "198.51.103.99")).toBe(true);
      }));

    it("a limit ends with its window: an account refused in an ended window passes in the current one", () =>
      inTx(async () => {
        const account = "earlier@example.test";
        await db.query(
          "INSERT INTO private.sign_in_windows (kind, key_digest, window_start, hits) VALUES ('account', $1, now() - interval '1 hour', 50)",
          [digest(account)],
        );
        expect(await take(account, "198.51.100.3")).toBe(true);
      }));

    it("two sessions at once at one reservation from the limit: exactly one passes", async () => {
      const account = unique("two-at-once");
      for (let i = 0; i < 9; i += 1)
        expect(await concurrentTakes(1, account, () => uniqueAddress())).toBe(
          1,
        );
      expect(await concurrentTakes(2, account, () => uniqueAddress())).toBe(1);
    });

    it("twenty sessions at once never pass more than the account's limit, nor the address's", async () => {
      expect(
        await concurrentTakes(20, unique("burst"), () => uniqueAddress()),
      ).toBe(10);
      const address = uniqueAddress();
      expect(
        await concurrentTakes(20, unique("burst-a"), () => address),
      ).toBeLessThanOrEqual(10);
      const shared = uniqueAddress();
      const accounts = Array.from({ length: 40 }, (_, i) =>
        unique(`burst-${i}`),
      );
      const clients = await Promise.all(
        accounts.map(async () => {
          const client = new pg.Client({ connectionString: ADMIN_URL });
          await client.connect();
          await client.query("SET ROLE service_role");
          return client;
        }),
      );
      try {
        const answers = await Promise.all(
          clients.map(
            async (client, i) =>
              (
                await client.query(
                  "SELECT public.take_sign_in_attempt($1, $2) AS ok",
                  [accounts[i], shared],
                )
              ).rows[0].ok as boolean,
          ),
        );
        expect(answers.filter(Boolean)).toHaveLength(30);
      } finally {
        await Promise.all(clients.map((client) => client.end()));
      }
    });

    it("the scheduled trim removes every row of an ended window, whether or not anyone signs in again, and keeps the current window", () =>
      inTx(async () => {
        for (const [kind, key] of [
          ["account", "old-a@example.test"],
          ["address", "198.51.104.1"],
        ] as const)
          await db.query(
            "INSERT INTO private.sign_in_windows (kind, key_digest, window_start, hits) VALUES ($1, $2, now() - interval '20 minutes', 3)",
            [kind, digest(key)],
          );
        const removed = await asService(
          async () =>
            (await db.query("SELECT public.trim_sign_in_windows() AS n"))
              .rows[0].n as number,
        );
        expect(removed).toBeGreaterThanOrEqual(2);
        const { rows } = await db.query(
          "SELECT count(*)::int AS n FROM private.sign_in_windows WHERE window_start < now() - interval '15 minutes'",
        );
        expect(rows[0].n).toBe(0);
        await take("current@example.test", "198.51.104.2");
        await asService(async () => {
          await db.query("SELECT public.trim_sign_in_windows()");
        });
        expect(await hits("account", "current@example.test")).toBe(1);
      }));

    it("stores digests only: no account address or client address in any row", () =>
      inTx(async () => {
        const account = "stored@example.test";
        const address = "198.51.100.44";
        await take(account, address);
        const raw = (
          await db.query(
            "SELECT count(*)::int AS n FROM private.sign_in_windows AS w WHERE to_jsonb(w)::text LIKE ANY ($1)",
            [[`%${account}%`, `%${address}%`]],
          )
        ).rows[0].n;
        expect(raw).toBe(0);
        expect(await hits("account", account)).toBe(1);
        expect(await hits("address", address)).toBe(1);
      }));

    it("only service_role may call the functions: the publishable key's roles are refused, and blank keys are refused", () =>
      inTx(async () => {
        const grants = (
          await db.query(
            `SELECT r,
                    has_function_privilege(r, 'public.take_sign_in_attempt(text, text)', 'EXECUTE') AS take,
                    has_function_privilege(r, 'public.release_sign_in_attempt(text, text, boolean)', 'EXECUTE') AS release,
                    has_function_privilege(r, 'public.clear_sign_in_account(text)', 'EXECUTE') AS clear,
                    has_function_privilege(r, 'public.trim_sign_in_windows()', 'EXECUTE') AS trim
               FROM unnest(ARRAY['anon', 'authenticated', 'service_role']) AS r ORDER BY r`,
          )
        ).rows;
        expect(grants).toEqual([
          { r: "anon", take: false, release: false, clear: false, trim: false },
          {
            r: "authenticated",
            take: false,
            release: false,
            clear: false,
            trim: false,
          },
          {
            r: "service_role",
            take: true,
            release: true,
            clear: true,
            trim: true,
          },
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
            "SELECT public.release_sign_in_attempt($1, $2, true)",
            ["a@example.test", "198.51.100.5"],
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
          ["service_role", "SELECT public.clear_sign_in_account($1)", [""]],
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
