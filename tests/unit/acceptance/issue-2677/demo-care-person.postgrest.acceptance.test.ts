import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";

import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { GET as getDashboard } from "../../../../packages/api/src/admin/member-care/dashboard";
import { GET as getDirectory } from "../../../../packages/api/src/admin/member-care/directory";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => {
    throw new Error("Member Care handler used the service key");
  },
  createAdminClient: () => {
    throw new Error("Member Care handler used the service key");
  },
}));

const url = process.env.DEMO_CARE_IT_SUPABASE_URL;
const DEMO = "00000000-0000-0000-0000-000000000001";
const SEEDED_PASSWORD = "demo-password";
const OWNER = {
  userId: "11111111-1111-1111-1111-111111111111",
  email: "demo-owner@givehope.test",
};
const CARE = {
  userId: "55555555-5555-5555-5555-555555555555",
  email: "member-care@givehope.test",
};

function grantBlock() {
  const name = readdirSync("supabase/migrations").find(
    (f) => /^\d{14}_/.test(f) && f.endsWith("_demo_member_care_assignment.sql"),
  );
  if (!name) throw new Error("no demonstration Member Care grant migration");
  const sql = readFileSync(`supabase/migrations/${name}`, "utf8");
  const start = sql.indexOf("DO $$");
  const end = sql.indexOf("END $$;", start) + "END $$;".length;
  if (start < 0 || end <= start) throw new Error("no DO block in the grant");
  return sql.slice(start, end);
}

describe.skipIf(!url && process.env.DEMO_CARE_IT_REQUIRED !== "1")(
  "AL-2677 WP4b part 1b: the demonstration data keeps a person who can open Member Care (PostgREST, seeded stack)",
  () => {
    let db: pg.Client;
    let anonKey: string;
    let serviceRoleKey: string;
    let dualUserId: string | undefined;
    const dualMembershipIds: string[] = [];

    function request(
      path: string,
      token: string,
      assignmentId: string,
    ): NextRequest {
      return new NextRequest(new URL(path, url), {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
          "x-asym-role-class": "staff",
          "sec-fetch-site": "same-origin",
          "x-asym-tenant": DEMO,
          "x-asym-assignment": assignmentId,
        },
      });
    }

    async function signIn(email: string, password: string) {
      const client = createClient(url!, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.session) {
        throw new Error(`Sign-in failed for ${email}: ${error?.message}`);
      }
      return data.session.access_token;
    }

    async function liveStaffRows(userId: string) {
      const { rows } = await db.query<{
        id: string;
        staff_role: string;
        is_tenant_admin: boolean;
      }>(
        `select m.id, m.staff_role::text as staff_role, m.is_tenant_admin
           from authz.memberships as m
          where m.user_id = $1 and m.tenant_id = $2 and m.role = 'staff'
            and m.is_active and m.revoked_at is null
          order by m.staff_role::text`,
        [userId, DEMO],
      );
      return rows;
    }

    async function opens(token: string, assignmentId: string) {
      const dashboard = await getDashboard(
        request("/api/admin/member-care/dashboard", token, assignmentId),
      );
      const directory = await getDirectory(
        request("/api/admin/member-care/directory", token, assignmentId),
      );
      return {
        dashboard: dashboard.status,
        directory: directory.status,
        total: Number(directory.headers.get("X-Total-Count") ?? "0"),
      };
    }

    beforeAll(async () => {
      const database = process.env.DEMO_CARE_IT_ADMIN_DATABASE_URL;
      anonKey = process.env.DEMO_CARE_IT_ANON_KEY ?? "";
      serviceRoleKey = process.env.DEMO_CARE_IT_SERVICE_ROLE_KEY ?? "";
      const isLocal = (value?: string) =>
        Boolean(
          value && ["127.0.0.1", "localhost"].includes(new URL(value).hostname),
        );
      if (!isLocal(url) || !isLocal(database) || !anonKey || !serviceRoleKey) {
        throw new Error(
          "The demonstration care suite requires a local Supabase URL, database URL, anon key and service role key",
        );
      }
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url!);
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", anonKey);
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey);
      db = new pg.Client({ connectionString: database });
      await db.connect();
    });

    afterAll(async () => {
      vi.unstubAllEnvs();
      if (db) {
        try {
          if (dualUserId) {
            await db.query(
              "delete from public.audit_logs where resource_type = 'membership' and (resource_id = any($1::text[]) or details ->> 'target_user_id' = $2::text)",
              [dualMembershipIds, dualUserId],
            );
            await db.query("delete from authz.memberships where user_id = $1", [
              dualUserId,
            ]);
          }
        } finally {
          await db.end();
        }
      }
      if (dualUserId) {
        await fetch(`${url}/auth/v1/admin/users/${dualUserId}`, {
          method: "DELETE",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }).catch(() => undefined);
      }
    });

    it("the seed's care person holds one live staff row in the demonstration organization: member_care, not an administrator", async () => {
      expect(await liveStaffRows(CARE.userId)).toEqual([
        {
          id: expect.any(String),
          staff_role: "member_care",
          is_tenant_admin: false,
        },
      ]);
      const { rows } = await db.query<{ c: string }>(
        `select count(*)::text as c from authz.memberships
          where user_id = $1 and is_active and revoked_at is null`,
        [CARE.userId],
      );
      expect(rows[0]!.c).toBe("1");
    });

    it("the seed's care person opens Member Care and sees the seeded workers", async () => {
      const [row] = await liveStaffRows(CARE.userId);
      const token = await signIn(CARE.email, SEEDED_PASSWORD);
      const result = await opens(token, row!.id);
      expect(result.dashboard).toBe(200);
      expect(result.directory).toBe(200);
      expect(result.total).toBeGreaterThan(0);
    });

    it("the seed's owner keeps one staff row, development with administration, and is refused (403)", async () => {
      const rows = await liveStaffRows(OWNER.userId);
      expect(rows).toEqual([
        {
          id: expect.any(String),
          staff_role: "development",
          is_tenant_admin: true,
        },
      ]);
      const token = await signIn(OWNER.email, SEEDED_PASSWORD);
      expect(await opens(token, rows[0]!.id)).toEqual({
        dashboard: 403,
        directory: 403,
        total: 0,
      });
    });

    it("a person given the grant beside an administrator's development row opens Care at ~member_care and is refused (403) at ~development", async () => {
      const runTag = randomUUID().slice(0, 8);
      const email = `wp4b1b-dual-${runTag}@example.test`;
      const password = `Wp4b1b-${runTag}-Pass!`;
      const created = await fetch(`${url}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          email_confirm: true,
          user_metadata: { first_name: "Dual", last_name: "Demo" },
        }),
      });
      expect(created.status, await created.clone().text()).toBe(200);
      dualUserId = ((await created.json()) as { id: string }).id;
      await db.query("delete from authz.memberships where user_id = $1", [
        dualUserId,
      ]);
      const development = randomUUID();
      dualMembershipIds.push(development);
      await db.query(
        `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin)
         values ($1, $2, $3, 'staff', 'development', true)`,
        [development, dualUserId, DEMO],
      );

      await db.query(grantBlock().replaceAll(OWNER.userId, dualUserId));
      const rows = await liveStaffRows(dualUserId);
      expect(rows).toEqual([
        { id: development, staff_role: "development", is_tenant_admin: true },
        {
          id: expect.any(String),
          staff_role: "member_care",
          is_tenant_admin: false,
        },
      ]);
      const care = rows[1]!.id;
      dualMembershipIds.push(care);

      const token = await signIn(email, password);
      const atCare = await opens(token, care);
      expect(atCare.dashboard).toBe(200);
      expect(atCare.directory).toBe(200);
      expect(atCare.total).toBeGreaterThan(0);
      expect(await opens(token, development)).toEqual({
        dashboard: 403,
        directory: 403,
        total: 0,
      });
    });
  },
);
