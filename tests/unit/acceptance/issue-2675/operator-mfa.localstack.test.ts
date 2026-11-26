/**
 * AL-2675 (WP2c, part 1; plan 5.1, 5.4 and 12 WP2c), proved on a real local
 * Supabase stack with TOTP switched on:
 *
 *   "The shared MFA-level check refuses a session without the second factor
 *    and passes after the challenge."
 *
 * A person signs in with a password, which gives a session at `aal1`. They are
 * put on the operator list by the operator script, run against the stack's
 * own database (Supabase's image, where `postgres` is no superuser). Through
 * the Data API, the read function says they are an operator and the shared
 * check, `public.platform_operator_session()`, refuses them for want of the
 * second factor. They enrol a TOTP factor through the Auth API, pass the
 * challenge with a code computed here, and the new session, at `aal2`, passes
 * the shared check. A person who is not on the list is refused at `aal2` too,
 * and the operator is refused at the next call once taken off the list. A
 * call with no session at all, as `anon`, is recorded too (review WC3).
 *
 * Not a `*.realstack.acceptance.test.ts`: CI's `migrate` job has a plain
 * Postgres and no Auth server. `node scripts/e2e/run-operator-mfa.mjs` runs it
 * against a running stack, and the Local Supabase Stack workflow runs that.
 * The runner passes the stack's values as OPERATOR_MFA_* with
 * OPERATOR_MFA_REQUIRED=1; without the values the suite skips, and with that
 * flag it fails instead. It creates two logins of its own and removes them.
 */
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { totp } from "../../../e2e/helpers/totp";

const API = process.env.OPERATOR_MFA_API_URL ?? "";
const ANON = process.env.OPERATOR_MFA_ANON_KEY ?? "";
const SERVICE = process.env.OPERATOR_MFA_SERVICE_KEY ?? "";
const DB_URL = process.env.OPERATOR_MFA_DB_URL ?? "";
const READY = Boolean(API && ANON && SERVICE && DB_URL);
const REQUIRED = process.env.OPERATOR_MFA_REQUIRED === "1";

const NO_SECOND_FACTOR =
  "platform: a platform command needs a session verified with a second factor";
const NOT_OPERATOR = "platform: the caller is not a platform operator";

it.runIf(REQUIRED && !READY)(
  "the runner passes the stack's values (fails, never skips)",
  () => expect(READY).toBe(true),
);

/** The claims of an access token, unverified: what Auth says it issued. */
function claims(token: string): Record<string, unknown> {
  return JSON.parse(
    Buffer.from(token.split(".")[1]!, "base64url").toString("utf8"),
  ) as Record<string, unknown>;
}

type Reply = { status: number; json: Record<string, unknown> | null };

async function call(url: string, init: RequestInit): Promise<Reply> {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(15_000),
  });
  const text = await response.text();
  return {
    status: response.status,
    json: text ? (JSON.parse(text) as Record<string, unknown>) : null,
  };
}

it("aborts stalled stack HTTP calls", async () => {
  const expired = AbortSignal.abort(
    new DOMException("deadline", "TimeoutError"),
  );
  const deadline = vi.spyOn(AbortSignal, "timeout").mockReturnValue(expired);
  const request = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (_url, init) => {
      init?.signal?.throwIfAborted();
      return new Response("{}");
    });
  try {
    await expect(call("http://localhost", {})).rejects.toMatchObject({
      name: "TimeoutError",
    });
    expect(deadline.mock.calls[0]?.[0]).toBeGreaterThan(0);
    expect(deadline.mock.calls[0]?.[0]).toBeLessThanOrEqual(30_000);
  } finally {
    request.mockRestore();
    deadline.mockRestore();
  }
});
/** The Auth API, as the person (their token) or as the service key. */
function auth(path: string, body: unknown, token?: string, service = false) {
  return call(`${API}/auth/v1${path}`, {
    method: "POST",
    headers: {
      apikey: service ? SERVICE : ANON,
      authorization: `Bearer ${service ? SERVICE : (token ?? ANON)}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

/** A Data API call of a `public` function on the person's token. */
function rpc(fn: string, token: string) {
  return call(`${API}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: ANON,
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: "{}",
  });
}

async function cleanupProofUsers(
  users: { email: string; id: string }[],
  steps: {
    findIds(emails: string[]): Promise<string[]>;
    removeOperators(ids: string[]): Promise<void>;
    removeAudit(ids: string[]): Promise<void>;
    removeLogin(id: string): Promise<void>;
    close(): Promise<void>;
  },
) {
  const ids = new Set(users.map((user) => user.id).filter(Boolean));
  const errors: unknown[] = [];
  async function attempt(step: () => Promise<void>) {
    try {
      await step();
    } catch (error) {
      errors.push(error);
    }
  }
  const missing = users.filter((user) => !user.id).map((user) => user.email);
  if (missing.length)
    await attempt(async () => {
      for (const id of await steps.findIds(missing)) ids.add(id);
    });
  await attempt(() => steps.removeOperators([...ids]));
  await attempt(() => steps.removeAudit([...ids]));
  for (const id of ids) await attempt(() => steps.removeLogin(id));
  await attempt(steps.close);
  if (errors.length)
    throw new AggregateError(errors, "the stack proof's cleanup failed");
}

it("recovers an unrecorded login and attempts every cleanup after a failed operator deletion", async () => {
  const removed: string[] = [];
  const cleanup = cleanupProofUsers(
    [{ id: "", email: "run@example.invalid" }],
    {
      findIds: async (emails) => {
        expect(emails).toEqual(["run@example.invalid"]);
        return ["recovered"];
      },
      removeOperators: async () => {
        throw new Error("operator cleanup failed");
      },
      removeAudit: async (ids) => {
        removed.push(`audit:${ids.join()}`);
      },
      removeLogin: async (id) => {
        removed.push(`login:${id}`);
      },
      close: async () => {
        removed.push("closed");
      },
    },
  );
  await expect(cleanup).rejects.toMatchObject({
    errors: [new Error("operator cleanup failed")],
  });
  expect(removed).toEqual(["audit:recovered", "login:recovered", "closed"]);
});

describe.skipIf(!READY)(
  "AL-2675 WP2c: the operators' second factor on a real Supabase stack",
  () => {
    const db = new pg.Client({
      connectionString: DB_URL,
      connectionTimeoutMillis: 10_000,
      query_timeout: 15_000,
      statement_timeout: 15_000,
    });
    const password = `wp2c-${randomUUID()}`;
    const operator = {
      email: `wp2c-operator-${randomUUID()}@example.invalid`,
      id: "",
    };
    const person = {
      email: `wp2c-person-${randomUUID()}@example.invalid`,
      id: "",
    };

    async function createLogin(login: { email: string; id: string }) {
      const created = await auth(
        "/admin/users",
        { email: login.email, password, email_confirm: true },
        undefined,
        true,
      );
      expect(created.status, JSON.stringify(created.json)).toBe(200);
      login.id = String(created.json!.id);
    }

    async function signIn(email: string) {
      const session = await auth("/token?grant_type=password", {
        email,
        password,
      });
      expect(session.status, JSON.stringify(session.json)).toBe(200);
      return String(session.json!.access_token);
    }

    /** Enrols a TOTP factor on an `aal1` token and passes the challenge; returns the `aal2` token. */
    async function secondFactor(token: string) {
      const enrolled = await auth(
        "/factors",
        { factor_type: "totp", friendly_name: `wp2c-${randomUUID()}` },
        token,
      );
      expect(enrolled.status, JSON.stringify(enrolled.json)).toBe(200);
      const factorId = String(enrolled.json!.id);
      const secret = String((enrolled.json!.totp as { secret: string }).secret);
      const challenge = await auth(`/factors/${factorId}/challenge`, {}, token);
      expect(challenge.status, JSON.stringify(challenge.json)).toBe(200);
      const verified = await auth(
        `/factors/${factorId}/verify`,
        { challenge_id: String(challenge.json!.id), code: totp(secret) },
        token,
      );
      expect(verified.status, JSON.stringify(verified.json)).toBe(200);
      return String(verified.json!.access_token);
    }

    let operatorAal1 = "";
    let operatorAal2 = "";

    beforeAll(async () => {
      await db.connect();
      await createLogin(operator);
      await createLogin(person);
      // The list's one writer, against the stack's own database.
      const added = spawnSync(
        process.execPath,
        [
          "scripts/platform/operators.mjs",
          "add",
          "--user",
          operator.email,
          "--actor",
          "WP2c stack proof",
          "--reason",
          "Second-factor proof on a local stack",
        ],
        {
          encoding: "utf8",
          timeout: 60_000,
          env: { ...process.env, OPERATORS_DATABASE_URL: DB_URL },
        },
      );
      expect(added.status, added.stderr).toBe(0);
      expect(JSON.parse(added.stdout.trim())).toMatchObject({
        action: "add",
        user_id: operator.id,
        changed: true,
      });
      operatorAal1 = await signIn(operator.email);
    });

    // Review of WP2c part 1, WC14: the database client always closes, every
    // step runs, and a step that fails fails the suite instead of passing
    // unseen. The logins go last: a listed login cannot be deleted from Auth.
    afterAll(() =>
      cleanupProofUsers([operator, person], {
        findIds: async (emails) =>
          (
            await db.query<{ id: string }>(
              "select id from auth.users where email = any($1::text[])",
              [emails],
            )
          ).rows.map((user) => user.id),
        removeOperators: async (ids) => {
          await db.query(
            "delete from authz.platform_operators where user_id = any($1::uuid[])",
            [ids],
          );
        },
        removeAudit: async (ids) => {
          await db.query(
            "delete from public.audit_logs where resource_type = 'platform_operator' and resource_id = any($1::text[])",
            [ids],
          );
        },
        removeLogin: async (id) => {
          const removed = await call(`${API}/auth/v1/admin/users/${id}`, {
            method: "DELETE",
            headers: { apikey: SERVICE, authorization: `Bearer ${SERVICE}` },
          });
          if (removed.status !== 200)
            throw new Error(
              `deleting proof login ${id} answered ${removed.status}`,
            );
        },
        close: () => db.end(),
      }),
    );

    // Review of WP2c part 1, WC3: what a real PostgREST answers when the
    // shared check is called with no session, as `anon`, to whom the function
    // is not granted. The application no longer asks in that case
    // (`confirmPlatformOperator` answers "not an operator" first); this
    // records the answer it would have had.
    it("answers a call with no session, as anon, with a permission refusal", async () => {
      const refused = await rpc("platform_operator_session", ANON);
      expect([refused.status, refused.json?.code]).toEqual([401, "42501"]);
    });

    it("issues a password session at aal1, which the read function admits and the shared check refuses for want of the second factor", async () => {
      expect(claims(operatorAal1).aal).toBe("aal1");
      const read = await rpc("caller_is_platform_operator", operatorAal1);
      expect([read.status, read.json]).toEqual([200, true]);
      const refused = await rpc("platform_operator_session", operatorAal1);
      expect(refused.status).toBe(403);
      expect(refused.json).toMatchObject({
        code: "42501",
        message: NO_SECOND_FACTOR,
      });
    });

    it("passes the shared check after the operator enrols TOTP and passes the challenge", async () => {
      operatorAal2 = await secondFactor(operatorAal1);
      expect(claims(operatorAal2).aal).toBe("aal2");
      const passed = await rpc("platform_operator_session", operatorAal2);
      expect([passed.status, passed.json]).toEqual([
        200,
        { operator_id: operator.id },
      ]);
    });

    it("refuses a person who is not on the list, before and after the challenge, and the read function says no without raising", async () => {
      const aal1 = await signIn(person.email);
      const read = await rpc("caller_is_platform_operator", aal1);
      expect([read.status, read.json]).toEqual([200, false]);
      for (const token of [aal1, await secondFactor(aal1)]) {
        const refused = await rpc("platform_operator_session", token);
        expect(refused.status).toBe(403);
        expect(refused.json).toMatchObject({
          code: "42501",
          message: NOT_OPERATOR,
        });
      }
    });

    it("refuses the operator at the next call once taken off the list, though the token still says aal2", async () => {
      expect(operatorAal2).not.toBe("");
      await db.query(
        "delete from authz.platform_operators where user_id = $1",
        [operator.id],
      );
      const refused = await rpc("platform_operator_session", operatorAal2);
      expect(refused.status).toBe(403);
      expect(refused.json).toMatchObject({
        code: "42501",
        message: NOT_OPERATOR,
      });
      const read = await rpc("caller_is_platform_operator", operatorAal2);
      expect([read.status, read.json]).toEqual([200, false]);
    });
  },
);

describe.skipIf(!READY)(
  "AL-2675 WP2c part 2a, T5: what Supabase Auth does with operators' factors, refreshes and removals",
  () => {
    const db = new pg.Client({
      connectionString: DB_URL,
      connectionTimeoutMillis: 10_000,
      query_timeout: 15_000,
      statement_timeout: 15_000,
    });
    const password = `wp2c2a-${randomUUID()}`;
    const operator = {
      email: `wp2c2a-operator-${randomUUID()}@example.invalid`,
      id: "",
    };
    const keeper = {
      email: `wp2c2a-keeper-${randomUUID()}@example.invalid`,
      id: "",
    };
    const person = {
      email: `wp2c2a-person-${randomUUID()}@example.invalid`,
      id: "",
    };

    type Session = { access: string; refresh: string };

    async function createLogin(login: { email: string; id: string }) {
      const created = await auth(
        "/admin/users",
        { email: login.email, password, email_confirm: true },
        undefined,
        true,
      );
      expect(created.status, JSON.stringify(created.json)).toBe(200);
      login.id = String(created.json!.id);
    }

    function addToList(login: { email: string }) {
      const added = spawnSync(
        process.execPath,
        [
          "scripts/platform/operators.mjs",
          "add",
          "--user",
          login.email,
          "--actor",
          "WP2c part 2a stack proof",
          "--reason",
          "Factor and refresh proof on a local stack",
        ],
        {
          encoding: "utf8",
          timeout: 60_000,
          env: { ...process.env, OPERATORS_DATABASE_URL: DB_URL },
        },
      );
      expect(added.status, added.stderr).toBe(0);
    }

    async function signIn(email: string): Promise<Session> {
      const session = await auth("/token?grant_type=password", {
        email,
        password,
      });
      expect(session.status, JSON.stringify(session.json?.code)).toBe(200);
      return {
        access: String(session.json!.access_token),
        refresh: String(session.json!.refresh_token),
      };
    }

    async function refresh(session: Session): Promise<Session> {
      const renewed = await auth("/token?grant_type=refresh_token", {
        refresh_token: session.refresh,
      });
      expect(renewed.status, JSON.stringify(renewed.json?.code)).toBe(200);
      return {
        access: String(renewed.json!.access_token),
        refresh: String(renewed.json!.refresh_token),
      };
    }

    async function enrol(token: string) {
      const enrolled = await auth(
        "/factors",
        { factor_type: "totp", friendly_name: `wp2c2a-${randomUUID()}` },
        token,
      );
      expect(enrolled.status, JSON.stringify(enrolled.json?.code)).toBe(200);
      return {
        id: String(enrolled.json!.id),
        secret: String((enrolled.json!.totp as { secret: string }).secret),
      };
    }

    async function verify(
      token: string,
      factor: { id: string; secret: string },
    ): Promise<Session> {
      const challenge = await auth(
        `/factors/${factor.id}/challenge`,
        {},
        token,
      );
      expect(challenge.status, JSON.stringify(challenge.json?.code)).toBe(200);
      const verified = await auth(
        `/factors/${factor.id}/verify`,
        {
          challenge_id: String(challenge.json!.id),
          code: totp(factor.secret),
        },
        token,
      );
      expect(verified.status, JSON.stringify(verified.json?.code)).toBe(200);
      return {
        access: String(verified.json!.access_token),
        refresh: String(verified.json!.refresh_token),
      };
    }

    function unenrol(token: string, factorId: string) {
      return call(`${API}/auth/v1/factors/${factorId}`, {
        method: "DELETE",
        headers: { apikey: ANON, authorization: `Bearer ${token}` },
      });
    }

    let session: Session = { access: "", refresh: "" };
    let first = { id: "", secret: "" };
    let second = { id: "", secret: "" };

    beforeAll(async () => {
      await db.connect();
      await createLogin(operator);
      await createLogin(keeper);
      await createLogin(person);
      addToList(keeper);
      addToList(operator);
      session = await signIn(operator.email);
    });

    afterAll(() =>
      cleanupProofUsers([operator, keeper, person], {
        findIds: async (emails) =>
          (
            await db.query<{ id: string }>(
              "select id from auth.users where email = any($1::text[])",
              [emails],
            )
          ).rows.map((user) => user.id),
        removeOperators: async (ids) => {
          await db.query(
            "delete from authz.platform_operators where user_id = any($1::uuid[])",
            [ids],
          );
        },
        removeAudit: async (ids) => {
          await db.query(
            "delete from public.audit_logs where resource_type = 'platform_operator' and resource_id = any($1::text[])",
            [ids],
          );
        },
        removeLogin: async (id) => {
          const removed = await call(`${API}/auth/v1/admin/users/${id}`, {
            method: "DELETE",
            headers: { apikey: SERVICE, authorization: `Bearer ${SERVICE}` },
          });
          if (removed.status !== 200)
            throw new Error(
              `deleting proof login ${id} answered ${removed.status}`,
            );
        },
        close: () => db.end(),
      }),
    );

    it("(1) keeps aal2 across a refresh, and the shared check still passes", async () => {
      first = await enrol(session.access);
      session = await verify(session.access, first);
      expect(claims(session.access).aal).toBe("aal2");
      session = await refresh(session);
      expect(claims(session.access).aal).toBe("aal2");
      const passed = await rpc("platform_operator_session", session.access);
      expect([passed.status, passed.json]).toEqual([
        200,
        { operator_id: operator.id },
      ]);
    });

    it("(2) with two verified factors, removing one at aal2 and refreshing keeps aal2, and the other still verifies", async () => {
      second = await enrol(session.access);
      session = await verify(session.access, second);
      const removed = await unenrol(session.access, first.id);
      expect(removed.status, JSON.stringify(removed.json?.code)).toBe(200);
      session = await refresh(session);
      expect(claims(session.access).aal).toBe("aal2");
      session = await verify(session.access, second);
      expect(claims(session.access).aal).toBe("aal2");
      const passed = await rpc("platform_operator_session", session.access);
      expect(passed.status).toBe(200);
    });

    it("(3) removing the last verified factor and refreshing gives aal1, and the shared check refuses", async () => {
      const removed = await unenrol(session.access, second.id);
      expect(removed.status, JSON.stringify(removed.json?.code)).toBe(200);
      session = await refresh(session);
      expect(claims(session.access).aal).toBe("aal1");
      const refused = await rpc("platform_operator_session", session.access);
      expect(refused.status).toBe(403);
      expect(refused.json).toMatchObject({
        code: "42501",
        message: NO_SECOND_FACTOR,
      });
    });

    it("(4) removes an unverified factor at aal1, and a new enrolment starts", async () => {
      expect(claims(session.access).aal).toBe("aal1");
      const pending = await enrol(session.access);
      const removed = await unenrol(session.access, pending.id);
      expect(removed.status, JSON.stringify(removed.json?.code)).toBe(200);
      const next = await enrol(session.access);
      expect(next.id).not.toBe(pending.id);
      const cleared = await unenrol(session.access, next.id);
      expect(cleared.status).toBe(200);
    });

    it("(5) a person who is not on the list may enrol and verify through Auth directly and reach aal2, yet the list read the area's admission uses answers false and platform_operator_session refuses", async () => {
      const own = await signIn(person.email);
      const verified = await verify(own.access, await enrol(own.access));
      expect(claims(verified.access).aal).toBe("aal2");
      const read = await rpc("caller_is_platform_operator", verified.access);
      expect([read.status, read.json]).toEqual([200, false]);
      const refused = await rpc("platform_operator_session", verified.access);
      expect(refused.status).toBe(403);
      expect(refused.json).toMatchObject({
        code: "42501",
        message: NOT_OPERATOR,
      });
    });
  },
);
