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
const DENIED = "permission denied for function provision_tenant";

it.runIf(REQUIRED && !READY)(
  "requires local Supabase stack values for the provisioning second-factor proof",
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
  "AL-2676 WP3a part 2a: platform.provision_tenant second-factor proof on local Supabase",
  () => {
    const db = new pg.Client({
      connectionString: DB_URL,
      connectionTimeoutMillis: 10_000,
      query_timeout: 15_000,
      statement_timeout: 15_000,
    });
    const password = `wp3a2-op-${randomUUID()}`;
    const tag = randomUUID().slice(0, 8);
    const request = {
      p_provisioning_key: `wp3a2-proof-${tag}`,
      p_name: `WP3a2 Provisioning Proof ${tag}`,
      p_slug: `wp3a2-proof-${tag}`,
      p_admin_email: `wp3a2-first-admin-${tag}@example.test`,
      p_staff_role: null,
      p_reason: "Provisioning second-factor proof on the local stack",
    };
    const operator = {
      email: `wp3a2-op-${randomUUID()}@example.test`,
      id: "",
    };
    const outsider = {
      email: `wp3a2-outsider-${randomUUID()}@example.test`,
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

    function provision(token: string) {
      return call(`${API}/rest/v1/rpc/provision_tenant`, {
        method: "POST",
        headers: {
          apikey: ANON,
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(request),
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
        { factor_type: "totp", friendly_name: `wp3a2-${randomUUID()}` },
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

    async function nothingProvisioned() {
      const { rows } = await db.query(
        `select (select count(*)::int from public.tenants where slug = $1) as tenants,
                (select count(*)::int from platform.tenant_provisioning where provisioning_key = $2) as steps`,
        [request.p_slug, request.p_provisioning_key],
      );
      expect(rows[0]).toEqual({ tenants: 0, steps: 0 });
    }

    let operatorAal1 = "";

    beforeAll(async () => {
      assertLoopbackHttp(API);
      if (MAIL_URL) assertLoopbackHttp(MAIL_URL);
      if (!isLoopbackDatabaseUrl(DB_URL)) {
        throw new Error("DB_URL must point to a local database");
      }

      await db.connect();
      await createLogin(operator);
      await createLogin(outsider);

      const added = spawnSync(
        process.execPath,
        [
          "scripts/platform/operators.mjs",
          "add",
          "--user",
          operator.email,
          "--actor",
          "WP3a2 stack proof",
          "--reason",
          "Provisioning TOTP proof on local stack",
        ],
        {
          encoding: "utf8",
          timeout: 60_000,
          env: { ...process.env, OPERATORS_DATABASE_URL: DB_URL },
        },
      );
      expect(added.status, added.stderr).toBe(0);

      operatorAal1 = await signIn(operator.email);
    });

    afterAll(async () => {
      const ids = [operator.id, outsider.id].filter(Boolean);
      const errors: unknown[] = [];
      async function attempt(fn: () => Promise<void>) {
        try {
          await fn();
        } catch (err) {
          errors.push(err);
        }
      }

      await attempt(async () => {
        const { rows } = await db.query(
          "select id from public.tenants where slug = $1",
          [request.p_slug],
        );
        const tenants = rows.map((row) => row.id as string);
        for (const table of [
          "platform.tenant_provisioning",
          "public.membership_invitations",
          "public.donor_account_brands",
          "public.donor_portal_hosts",
          "public.sites",
          "public.contribution_approval_policies",
          "public.funds",
          "public.legal_entities",
          "public.audit_logs",
        ])
          await db.query(
            `delete from ${table} where tenant_id = any($1::uuid[])`,
            [tenants],
          );
        await db.query(
          "delete from public.tenants where id = any($1::uuid[])",
          [tenants],
        );
        await db.query(
          "delete from public.audit_logs where resource_type = 'platform_operator' and resource_id = any($1::text[])",
          [ids],
        );
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
        throw new AggregateError(errors, "provisioning proof cleanup failed");
      }
    });

    it("refuses anon, the operator's own token at aal1, and a non-operator at aal1 and aal2, creating no organization and no step record", async () => {
      const anonRes = await provision(ANON);
      expect(anonRes.status).toBe(401);
      expect(anonRes.json).toMatchObject({ code: "42501", message: DENIED });
      await nothingProvisioned();

      expect(claims(operatorAal1).aal).toBe("aal1");
      const aal1Res = await provision(operatorAal1);
      expect(aal1Res.status).toBe(403);
      expect(aal1Res.json).toMatchObject({
        code: "42501",
        message: NO_SECOND_FACTOR,
      });
      await nothingProvisioned();

      const outsiderAal1 = await signIn(outsider.email);
      const outsiderAal2 = await secondFactor(outsiderAal1);
      expect(claims(outsiderAal2).aal).toBe("aal2");
      for (const token of [outsiderAal1, outsiderAal2]) {
        const res = await provision(token);
        expect(res.status).toBe(403);
        expect(res.json).toMatchObject({
          code: "42501",
          message: NOT_OPERATOR,
        });
        await nothingProvisioned();
      }
    });

    it("provisions after the operator's TOTP challenge, on the same request, and sends no mail", async () => {
      const operatorAal2 = await secondFactor(operatorAal1);
      expect(claims(operatorAal2).aal).toBe("aal2");

      const res = await provision(operatorAal2);
      expect(res.status, JSON.stringify(res.json)).toBe(200);
      expect(res.json).toMatchObject({
        created: true,
        invitation: { staff_role: "development" },
      });
      const tenant = String(res.json!.tenant_id);
      const { rows } = await db.query(
        `select t.status,
                (select count(*)::int from public.sites s where s.tenant_id = t.id and s.is_default) as default_sites,
                (select count(*)::int from public.donor_portal_hosts h where h.tenant_id = t.id) as homes,
                (select count(*)::int from public.donor_account_brands b where b.tenant_id = t.id) as brands,
                (select count(*)::int from platform.tenant_provisioning p where p.tenant_id = t.id and p.requested_by = $2) as steps,
                (select count(*)::int from public.membership_invitations i where i.tenant_id = t.id and i.status = 'issued') as invitations
           from public.tenants t where t.id = $1`,
        [tenant, operator.id],
      );
      expect(rows).toEqual([
        {
          status: "active",
          default_sites: 1,
          homes: 1,
          brands: 1,
          steps: 1,
          invitations: 1,
        },
      ]);

      const again = await provision(operatorAal2);
      expect(again.status, JSON.stringify(again.json)).toBe(200);
      expect(again.json).toEqual({ tenant_id: tenant, created: false });

      expect(await mailCountFor(request.p_admin_email)).toBe(0);
    });
  },
);
