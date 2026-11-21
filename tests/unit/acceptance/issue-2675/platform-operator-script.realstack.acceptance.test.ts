/**
 * AL-2675 (WP2c, part 1; plan 5.4 and 12 WP2c) real-stack acceptance for the
 * operator list's one writer, `scripts/platform/operators.mjs`:
 *   "The operator script adds and removes idempotently, writes an audit row
 *    and refuses to remove the last operator."
 *
 * Two kinds of proof:
 *   - the script itself, run as the owner runs it, against the database named
 *     by TENANT_GUARD_IT_ADMIN_DATABASE_URL: add, add again, remove, remove
 *     again, each with its audit row or none. It commits, so it works on two
 *     logins of its own, never assumes the list is empty, and removes what it
 *     made afterwards;
 *   - the script's exact statements (`operatorStatements`), run by psql inside
 *     a transaction that is rolled back, for the cases that depend on the
 *     whole list: the last operator is refused, and an operator is removed
 *     while another remains. Inside that transaction the list is emptied
 *     first, which no other session sees.
 *
 * Without the URL the block skips, except in the CI `migrate` job, where it
 * fails. Needs psql (the `migrate` job installs it).
 */
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { psqlConnection } from "../../../../scripts/lib/psql.mjs";
import {
  PSQL_ARGS,
  operatorStatements,
  parseArguments,
  psqlInputs,
} from "../../../../scripts/platform/operators.mjs";
import { ADMIN_URL, IN_MIGRATE_JOB } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const SCRIPT = "scripts/platform/operators.mjs";
const LAST =
  "operators: that login is the last platform operator; add another operator before removing it";

describe.skipIf(!ADMIN_URL)(
  "AL-2675 WP2c: the operator script (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const a = {
      id: randomUUID(),
      email: `wp2c-op-a-${randomUUID()}@example.invalid`,
    };
    const b = {
      id: randomUUID(),
      email: `wp2c-op-b-${randomUUID()}@example.invalid`,
    };

    beforeAll(async () => {
      await db.connect();
      await db.query(
        "insert into auth.users (id, email) values ($1, $2), ($3, $4)",
        [a.id, a.email, b.id, b.email],
      );
    });

    afterAll(async () => {
      await db.query(
        "delete from authz.platform_operators where user_id = any($1::uuid[])",
        [[a.id, b.id]],
      );
      await db.query(
        "delete from public.audit_logs where resource_type = 'platform_operator' and resource_id = any($1::text[])",
        [[a.id, b.id]],
      );
      await db.query("delete from auth.users where id = any($1::uuid[])", [
        [a.id, b.id],
      ]);
      await db.end();
    });

    /** Runs the script as its owner runs it. */
    function run(args: string[]) {
      const r = spawnSync(process.execPath, [SCRIPT, ...args], {
        encoding: "utf8",
        timeout: 60_000,
        env: { ...process.env, OPERATORS_DATABASE_URL: ADMIN_URL },
      });
      const last = r.stdout.trim().split("\n").filter(Boolean).at(-1);
      return {
        status: r.status,
        stderr: r.stderr,
        result: last ? (JSON.parse(last) as Record<string, unknown>) : null,
      };
    }

    async function onList(userId: string) {
      const r = await db.query(
        "select added_by, reason from authz.platform_operators where user_id = $1",
        [userId],
      );
      return r.rows as Array<{ added_by: string; reason: string }>;
    }

    async function audits(userId: string) {
      const r = await db.query(
        "select tenant_id, user_id, action, details from public.audit_logs where resource_type = 'platform_operator' and resource_id = $1 order by created_at, id",
        [userId],
      );
      return r.rows as Array<Record<string, unknown>>;
    }

    it("adds a login by email, writes one audit row with no tenant naming the actor and the reason, and adds nothing the second time", async () => {
      const args = [
        "add",
        "--user",
        a.email.toUpperCase(),
        "--actor",
        "Release owner",
        "--reason",
        "First operator for the WP2c proof",
      ];
      const first = run(args);
      expect(first.status, first.stderr).toBe(0);
      expect(first.result).toMatchObject({
        action: "add",
        user_id: a.id,
        changed: true,
      });
      expect(await onList(a.id)).toEqual([
        {
          added_by: "Release owner",
          reason: "First operator for the WP2c proof",
        },
      ]);
      const added = [
        {
          tenant_id: null,
          user_id: null,
          action: "platform_operator_added",
          details: {
            actor: "Release owner",
            reason: "First operator for the WP2c proof",
          },
        },
      ];
      expect(await audits(a.id)).toEqual(added);

      const again = run(args);
      expect(again.status, again.stderr).toBe(0);
      expect(again.result).toMatchObject({ user_id: a.id, changed: false });
      expect(await onList(a.id)).toHaveLength(1);
      expect(await audits(a.id)).toEqual(added);
    });

    it("removes an operator by login id while another remains, with one audit row, and removes nothing the second time", async () => {
      const add = run([
        "add",
        "--user",
        b.id,
        "--actor",
        "Release owner",
        "--reason",
        "Second operator",
      ]);
      expect(add.status, add.stderr).toBe(0);
      const args = [
        "remove",
        "--user",
        a.id,
        "--actor",
        "Release owner",
        "--reason",
        "Rotation",
      ];
      const first = run(args);
      expect(first.status, first.stderr).toBe(0);
      expect(first.result).toMatchObject({
        action: "remove",
        user_id: a.id,
        changed: true,
      });
      expect(await onList(a.id)).toEqual([]);
      const removed = (await audits(a.id)).filter(
        (row) => row.action === "platform_operator_removed",
      );
      expect(removed).toEqual([
        {
          tenant_id: null,
          user_id: null,
          action: "platform_operator_removed",
          details: { actor: "Release owner", reason: "Rotation" },
        },
      ]);

      const again = run(args);
      expect(again.status, again.stderr).toBe(0);
      expect(again.result).toMatchObject({ user_id: a.id, changed: false });
      expect(await audits(a.id)).toHaveLength(2);
      expect(await onList(b.id)).toHaveLength(1);
    });

    it("lists the operators, and refuses a login that does not exist without writing", async () => {
      const list = run(["list"]);
      expect(list.status, list.stderr).toBe(0);
      const listed = list.result as unknown as Array<{
        user_id: string;
        email: string;
      }>;
      expect(listed.map((o) => o.user_id)).toContain(b.id);
      expect(listed.map((o) => o.user_id)).not.toContain(a.id);

      const ghost = randomUUID();
      const out = run([
        "add",
        "--user",
        ghost,
        "--actor",
        "Release owner",
        "--reason",
        "x",
      ]);
      expect(out.status).not.toBe(0);
      expect(out.stderr).toContain(
        "operators: no login matches the given user",
      );
      expect(await onList(ghost)).toEqual([]);
      expect(await audits(ghost)).toEqual([]);
    });

    /**
     * Runs `setup` and then one action's exact statements in one psql session,
     * inside a transaction that is always rolled back.
     */
    function inRolledBackTransaction(
      setup: string,
      argv: string[],
      after = "",
    ) {
      const parsed = parseArguments(argv);
      const { connection, env } = psqlConnection(ADMIN_URL);
      const r = spawnSync("psql", [connection, ...PSQL_ARGS], {
        encoding: "utf8",
        timeout: 60_000,
        env: { ...env, ...psqlInputs(parsed) },
        input: `BEGIN;\n${setup}\n${operatorStatements(parsed.action)}${after}\nROLLBACK;\n`,
      });
      return { status: r.status, stdout: r.stdout.trim(), stderr: r.stderr };
    }

    const onlyA = `DELETE FROM authz.platform_operators;
INSERT INTO authz.platform_operators (user_id, added_by, reason) VALUES ('${a.id}', 'acceptance', 'only operator');`;

    it("refuses to remove the last operator, and leaves the list and the audit log as they were", () => {
      const out = inRolledBackTransaction(onlyA, [
        "remove",
        "--user",
        a.id,
        "--actor",
        "Release owner",
        "--reason",
        "Leaving",
      ]);
      // psql stops at the refusal (ON_ERROR_STOP) and never reaches the result.
      expect(out.status).toBe(3);
      expect(out.stderr).toContain(LAST);
      expect(out.stdout).toBe("");
    });

    it("removes an operator when another remains, in the same statements", () => {
      const out = inRolledBackTransaction(
        `${onlyA}\nINSERT INTO authz.platform_operators (user_id, added_by, reason) VALUES ('${b.id}', 'acceptance', 'second');`,
        [
          "remove",
          "--user",
          a.id,
          "--actor",
          "Release owner",
          "--reason",
          "Leaving",
        ],
        "SELECT pg_catalog.count(*) FROM public.audit_logs WHERE action = 'platform_operator_removed' AND resource_id = '" +
          a.id +
          "' AND details ->> 'reason' = 'Leaving';",
      );
      expect(out.status, out.stderr).toBe(0);
      const [result, auditCount] = out.stdout.split("\n");
      expect(JSON.parse(result!)).toEqual({
        action: "remove",
        user_id: a.id,
        changed: true,
        operators: 1,
      });
      expect(auditCount).toBe("1");
    });

    it("adds the first operator to an empty list", () => {
      const out = inRolledBackTransaction(
        "DELETE FROM authz.platform_operators;",
        [
          "add",
          "--user",
          a.id,
          "--actor",
          "Release owner",
          "--reason",
          "First",
        ],
      );
      expect(out.status, out.stderr).toBe(0);
      expect(JSON.parse(out.stdout)).toEqual({
        action: "add",
        user_id: a.id,
        changed: true,
        operators: 1,
      });
    });
  },
);
