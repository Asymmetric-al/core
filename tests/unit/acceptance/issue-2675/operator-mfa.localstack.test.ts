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
 * and the operator is refused at the next call once taken off the list.
 *
 * Not a `*.realstack.acceptance.test.ts`: CI's `migrate` job has a plain
 * Postgres and no Auth server. `node scripts/e2e/run-operator-mfa.mjs` runs it
 * against a running stack, and the Local Supabase Stack workflow runs that.
 * The runner passes the stack's values as OPERATOR_MFA_* with
 * OPERATOR_MFA_REQUIRED=1; without the values the suite skips, and with that
 * flag it fails instead. It creates two logins of its own and removes them.
 */
import { spawnSync } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

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

/** RFC 4648 base32, as TOTP secrets are written. */
function base32(secret: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (const char of secret.replace(/=+$/, "").toUpperCase()) {
    const index = alphabet.indexOf(char);
    if (index < 0) throw new Error("the TOTP secret is not base32");
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
      value &= (1 << bits) - 1;
    }
  }
  return Buffer.from(bytes);
}

/** RFC 6238: six digits, SHA-1, 30-second steps. */
function totp(secret: string, at = Date.now()): string {
  const step = Buffer.alloc(8);
  step.writeBigUInt64BE(BigInt(Math.floor(at / 30_000)));
  const mac = createHmac("sha1", base32(secret)).update(step).digest();
  const offset = mac[mac.length - 1]! & 0x0f;
  const code =
    ((mac[offset]! & 0x7f) << 24) |
    (mac[offset + 1]! << 16) |
    (mac[offset + 2]! << 8) |
    mac[offset + 3]!;
  return String(code % 1_000_000).padStart(6, "0");
}

/** The claims of an access token, unverified: what Auth says it issued. */
function claims(token: string): Record<string, unknown> {
  return JSON.parse(
    Buffer.from(token.split(".")[1]!, "base64url").toString("utf8"),
  ) as Record<string, unknown>;
}

type Reply = { status: number; json: Record<string, unknown> | null };

async function call(url: string, init: RequestInit): Promise<Reply> {
  const response = await fetch(url, init);
  const text = await response.text();
  return {
    status: response.status,
    json: text ? (JSON.parse(text) as Record<string, unknown>) : null,
  };
}

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

describe.skipIf(!READY)(
  "AL-2675 WP2c: the operators' second factor on a real Supabase stack",
  () => {
    const db = new pg.Client({ connectionString: DB_URL });
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

    afterAll(async () => {
      const ids = [operator.id, person.id].filter(Boolean);
      await db.query(
        "delete from authz.platform_operators where user_id = any($1::uuid[])",
        [ids],
      );
      await db.query(
        "delete from public.audit_logs where resource_type = 'platform_operator' and resource_id = any($1::text[])",
        [ids],
      );
      await db.end();
      for (const id of ids)
        await call(`${API}/auth/v1/admin/users/${id}`, {
          method: "DELETE",
          headers: { apikey: SERVICE, authorization: `Bearer ${SERVICE}` },
        });
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
