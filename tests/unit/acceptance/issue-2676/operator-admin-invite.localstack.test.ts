import { spawnSync } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { isLoopbackDatabaseUrl } from "../../../../packages/env/src/database-url.mjs";

const API = process.env.OPERATOR_MFA_API_URL ?? "";
const ANON = process.env.OPERATOR_MFA_ANON_KEY ?? "";
const SERVICE = process.env.OPERATOR_MFA_SERVICE_KEY ?? "";
const DB_URL = process.env.OPERATOR_MFA_DB_URL ?? "";
const MAIL_URL = process.env.OPERATOR_MFA_MAIL_URL ?? "";
const READY = Boolean(API && ANON && SERVICE && DB_URL);
const REQUIRED =
  process.env.OPERATOR_MFA_REQUIRED === "1" ||
  process.env.GITHUB_JOB === "local-supabase";

const NO_SECOND_FACTOR =
  "platform: a platform command needs a session verified with a second factor";
const NOT_OPERATOR = "platform: the caller is not a platform operator";
const GENERIC_INVITE_REFUSAL = "Invitation is invalid or no longer available";

it.runIf(REQUIRED && !READY)(
  "requires local Supabase stack values for operator admin invitation proof",
  () => expect(READY).toBe(true),
);

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

function assertLoopbackHttp(url: string) {
  const host = new URL(url).hostname;
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(host)) {
    throw new Error(`Expected loopback URL, got ${host}`);
  }
}

describe.skipIf(!READY)(
  "AL-2676 WP3c: platform.issue_admin_invitation second-factor proof on local Supabase",
  () => {
    const db = new pg.Client({
      connectionString: DB_URL,
      connectionTimeoutMillis: 10_000,
      query_timeout: 15_000,
      statement_timeout: 15_000,
    });
    const password = `wp3c-op-${randomUUID()}`;
    const tenantId = randomUUID();
    const operator = {
      email: `wp3c-op-${randomUUID()}@example.test`,
      id: "",
    };
    const outsider = {
      email: `wp3c-outsider-${randomUUID()}@example.test`,
      id: "",
    };
    const invitee = {
      email: `wp3c-first-admin-${randomUUID()}@example.test`,
      id: "",
    };

    function auth(
      path: string,
      body: unknown,
      token?: string,
      service = false,
    ) {
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

    function rpc(fn: string, token: string, body: Record<string, unknown>) {
      return call(`${API}/rest/v1/rpc/${fn}`, {
        method: "POST",
        headers: {
          apikey: ANON,
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });
    }

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

    async function secondFactor(token: string) {
      const enrolled = await auth(
        "/factors",
        { factor_type: "totp", friendly_name: `wp3c-${randomUUID()}` },
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

    async function mailCountFor(email: string): Promise<number> {
      if (!MAIL_URL) return 0;
      const res = await fetch(
        `${MAIL_URL}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`,
        { signal: AbortSignal.timeout(10_000) },
      );
      expect(res.status).toBe(200);
      const data = (await res.json()) as { messages?: unknown[] };
      return data.messages?.length ?? 0;
    }

    let operatorAal1 = "";
    let operatorAal2 = "";
    let inviteeToken = "";
    let firstInviteId = "";
    let secondInvite: { selector: string; verifier: string } | null = null;
    let thirdInvite: { selector: string; verifier: string } | null = null;

    beforeAll(async () => {
      assertLoopbackHttp(API);
      if (MAIL_URL) assertLoopbackHttp(MAIL_URL);
      if (!isLoopbackDatabaseUrl(DB_URL)) {
        throw new Error("DB_URL must point to a local database");
      }

      await db.connect();
      await createLogin(operator);
      await createLogin(outsider);
      await createLogin(invitee);

      await db.query(
        "insert into public.tenants (id, name, slug, status) values ($1, 'WP3c Admin Invite Proof', $2, 'active')",
        [tenantId, `wp3c-op-${tenantId.slice(0, 8)}`],
      );

      const added = spawnSync(
        process.execPath,
        [
          "scripts/platform/operators.mjs",
          "add",
          "--user",
          operator.email,
          "--actor",
          "WP3c stack proof",
          "--reason",
          "Operator admin invite TOTP proof on local stack",
        ],
        {
          encoding: "utf8",
          timeout: 60_000,
          env: { ...process.env, OPERATORS_DATABASE_URL: DB_URL },
        },
      );
      expect(added.status, added.stderr).toBe(0);

      operatorAal1 = await signIn(operator.email);
      inviteeToken = await signIn(invitee.email);
    });

    afterAll(async () => {
      const ids = [operator.id, outsider.id, invitee.id].filter(Boolean);
      const errors: unknown[] = [];
      async function attempt(fn: () => Promise<void>) {
        try {
          await fn();
        } catch (err) {
          errors.push(err);
        }
      }

      await attempt(async () => {
        await db.query(
          "delete from public.membership_invitations where tenant_id = $1",
          [tenantId],
        );
        await db.query("delete from authz.memberships where tenant_id = $1", [
          tenantId,
        ]);
        await db.query(
          "delete from public.audit_logs where tenant_id = $1 or (resource_type = 'platform_operator' and resource_id = any($2::text[]))",
          [tenantId, ids],
        );
        await db.query("delete from public.tenants where id = $1", [tenantId]);
        if (ids.length > 0) {
          await db.query(
            "delete from authz.platform_operators where user_id = any($1::uuid[])",
            [ids],
          );
          await db.query(
            "delete from authz.memberships where user_id = any($1::uuid[])",
            [ids],
          );
        }
      });

      for (const id of ids) {
        await attempt(async () => {
          const removed = await call(`${API}/auth/v1/admin/users/${id}`, {
            method: "DELETE",
            headers: { apikey: SERVICE, authorization: `Bearer ${SERVICE}` },
          });
          if (removed.status !== 200) {
            throw new Error(
              `deleting proof login ${id} returned ${removed.status}`,
            );
          }
        });
      }

      await attempt(() => db.end());
      if (errors.length > 0) {
        throw new AggregateError(
          errors,
          "operator admin invite proof cleanup failed",
        );
      }
    });

    it("refuses anon, operator at aal1, and non-operator at aal1 and aal2", async () => {
      const args = {
        p_tenant_id: tenantId,
        p_email: invitee.email,
        p_staff_role: "development",
        p_reason: "Initial tenant admin",
      };

      const anonRes = await rpc("issue_admin_invitation", ANON, args);
      expect([anonRes.status, anonRes.json?.code]).toEqual([401, "42501"]);

      expect(claims(operatorAal1).aal).toBe("aal1");
      const aal1Res = await rpc("issue_admin_invitation", operatorAal1, args);
      expect(aal1Res.status).toBe(403);
      expect(aal1Res.json).toMatchObject({
        code: "42501",
        message: NO_SECOND_FACTOR,
      });

      const outsiderAal1 = await signIn(outsider.email);
      const outsiderAal2 = await secondFactor(outsiderAal1);
      expect(claims(outsiderAal2).aal).toBe("aal2");
      for (const token of [outsiderAal1, outsiderAal2]) {
        const res = await rpc("issue_admin_invitation", token, args);
        expect(res.status).toBe(403);
        expect(res.json).toMatchObject({
          code: "42501",
          message: NOT_OPERATOR,
        });
      }
    });

    it("succeeds for a listed operator at aal2 on an admin-less tenant, after expiry, and supersedes prior live invite without sending mail", async () => {
      operatorAal2 = await secondFactor(operatorAal1);
      expect(claims(operatorAal2).aal).toBe("aal2");

      const first = await rpc("issue_admin_invitation", operatorAal2, {
        p_tenant_id: tenantId,
        p_email: invitee.email,
        p_staff_role: "development",
        p_reason: "First admin bootstrap",
      });
      expect(first.status, JSON.stringify(first.json)).toBe(200);
      expect(first.json).toMatchObject({
        tenant_id: tenantId,
        staff_role: "development",
      });
      firstInviteId = String(first.json!.invitation_id);

      await db.query(
        "update public.membership_invitations set created_at = now() - interval '2 days', expires_at = now() - interval '1 day' where id = $1",
        [firstInviteId],
      );

      const second = await rpc("issue_admin_invitation", operatorAal2, {
        p_tenant_id: tenantId,
        p_email: invitee.email,
        p_staff_role: "finance",
        p_reason: "Re-issue after expired initial invitation",
      });
      expect(second.status, JSON.stringify(second.json)).toBe(200);
      secondInvite = {
        selector: String(second.json!.selector),
        verifier: String(second.json!.verifier),
      };

      const third = await rpc("issue_admin_invitation", operatorAal2, {
        p_tenant_id: tenantId,
        p_email: invitee.email,
        p_staff_role: "development",
        p_reason: "Supersede live admin invitation",
      });
      expect(third.status, JSON.stringify(third.json)).toBe(200);
      thirdInvite = {
        selector: String(third.json!.selector),
        verifier: String(third.json!.verifier),
      };

      const supersededAccept = await rpc(
        "accept_membership_invitation",
        inviteeToken,
        {
          p_selector: secondInvite.selector,
          p_verifier: secondInvite.verifier,
        },
      );
      expect(supersededAccept.status).toBe(403);
      expect(supersededAccept.json).toMatchObject({
        code: "42501",
        message: GENERIC_INVITE_REFUSAL,
      });

      expect(await mailCountFor(invitee.email)).toBe(0);
    });

    it("refuses suspended tenants with 55000 and refuses once the tenant has a live administrator", async () => {
      await db.query(
        "update public.tenants set status = 'suspended' where id = $1",
        [tenantId],
      );
      const suspendedRes = await rpc("issue_admin_invitation", operatorAal2, {
        p_tenant_id: tenantId,
        p_email: invitee.email,
        p_staff_role: "development",
        p_reason: "Should refuse suspended tenant",
      });
      expect(suspendedRes.status).toBe(500);
      expect(suspendedRes.json?.code).toBe("55000");

      await db.query(
        "update public.tenants set status = 'active' where id = $1",
        [tenantId],
      );

      const accepted = await rpc("accept_membership_invitation", inviteeToken, {
        p_selector: thirdInvite!.selector,
        p_verifier: thirdInvite!.verifier,
      });
      expect(accepted.status, JSON.stringify(accepted.json)).toBe(200);
      expect(accepted.json).toMatchObject({
        tenant_id: tenantId,
        role: "staff",
        staff_role: "development",
        is_tenant_admin: true,
      });

      const afterAdmin = await rpc("issue_admin_invitation", operatorAal2, {
        p_tenant_id: tenantId,
        p_email: outsider.email,
        p_staff_role: "development",
        p_reason: "Should refuse when admin exists",
      });
      expect(afterAdmin.status).toBe(403);
      expect(afterAdmin.json?.code).toBe("42501");

      expect(await mailCountFor(invitee.email)).toBe(0);
      expect(await mailCountFor(outsider.email)).toBe(0);
    });
  },
);
