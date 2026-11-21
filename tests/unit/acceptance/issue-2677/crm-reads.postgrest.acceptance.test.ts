import { randomUUID } from "node:crypto";
import { getAdminClient } from "@asym/database/supabase/admin";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { GET as notes } from "../../../../packages/api/src/admin/crm/notes";
import { createRequestSessionClient } from "../../../../packages/api/src/shared/request-session-client";

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: vi.fn(() => {
    throw new Error("CRM read used the service key");
  }),
}));
vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: () => ({ logRequired: vi.fn() }),
}));

const url = process.env.CRM_READ_IT_SUPABASE_URL;
const tenantA = "00000000-0000-0000-0000-000000000001";
const tenantB = "00000000-0000-0000-0000-000000000002";
const dualUser = "44444444-4444-4444-4444-444444444444";

describe.skipIf(!url && process.env.CRM_READ_IT_REQUIRED !== "1")(
  "Mission Control reads as the selected staff assignment",
  () => {
    const dualA = randomUUID();
    const dualB = randomUUID();
    const noteA = randomUUID();
    const noteB = randomUUID();
    const restrictedA = randomUUID();
    let db: pg.Client;
    let sole: { token: string; assignment: string };
    let dual: { token: string; assignment: string };

    beforeAll(async () => {
      const database = process.env.CRM_READ_IT_ADMIN_DATABASE_URL;
      const key = process.env.CRM_READ_IT_ANON_KEY;
      const local = (value?: string) =>
        value && ["127.0.0.1", "localhost"].includes(new URL(value).hostname);
      if (!local(url) || !local(database) || !key)
        throw new Error(
          "CRM acceptance requires the disposable local stack, database and public key",
        );
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url!);
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", key);
      db = new pg.Client({ connectionString: database });
      await db.connect();
      await db.query(
        "insert into authz.memberships (id,user_id,tenant_id,role,staff_role) values ($1,$3,$4,'staff','development'),($2,$3,$5,'staff','development')",
        [dualA, dualB, dualUser, tenantA, tenantB],
      );
      await db.query(
        "insert into public.crm_notes (tenant_id,id,title,body,visibility) values ($1,$3,'Fixture A','Local test','standard'),($2,$4,'Fixture B','Local test','standard'),($1,$5,'Restricted A','Local test','restricted')",
        [tenantA, tenantB, noteA, noteB, restrictedA],
      );
      async function signIn(email: string) {
        const client = createClient(url!, key!, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password: "demo-password",
        });
        if (error || !data.session) throw new Error("Fixture sign-in failed");
        const assignments = await client.rpc("current_user_assignments");
        if (assignments.error) throw assignments.error;
        const assignment = assignments.data.find(
          (row: { tenant_id: string; role: string }) =>
            row.role === "staff" && row.tenant_id === tenantA,
        );
        expect(assignment).toBeTruthy();
        return {
          token: data.session.access_token,
          assignment: assignment.id as string,
        };
      }
      sole = await signIn("demo-owner@givehope.test");
      dual = await signIn("two-organizations@donors.test");
    });
    afterAll(async () => {
      vi.unstubAllEnvs();
      if (db) {
        try {
          await db.query(
            "delete from public.crm_notes where id = any($1::uuid[])",
            [[noteA, noteB, restrictedA]],
          );
          await db.query(
            "delete from authz.memberships where id = any($1::uuid[])",
            [[dualA, dualB]],
          );
        } finally {
          await db.end();
        }
      }
    });
    function request(path: string, person = dual, tenant = tenantA) {
      return new NextRequest(new URL(path, url), {
        headers: {
          authorization: `Bearer ${person.token}`,
          "x-asym-tenant": tenant,
          "x-asym-assignment": person.assignment,
          "x-asym-role-class": "staff",
          "sec-fetch-site": "same-origin",
        },
      });
    }

    it("reads the selected tenant's notes and enforces restricted visibility in PostgREST", async () => {
      const path = "/api/admin/crm/notes";
      const refused = await notes(request(path, sole, tenantB));
      expect(refused.status).toBe(401);
      expect(refused.headers.has("x-asym-scope-refused")).toBe(true);
      for (const [person, visible] of [
        [dual, [noteA]],
        [sole, [noteA, restrictedA]],
      ] as const) {
        const req = request(path, person);
        const res = await notes(req);
        expect(res.status).toBe(200);
        const ids = (await res.json()).rows.map(
          (row: { id: string }) => row.id,
        );
        expect(
          ids
            .filter((id: string) => [noteA, noteB, restrictedA].includes(id))
            .sort(),
        ).toEqual([...visible].sort());
        const client = await createRequestSessionClient(req, {
          tenantId: tenantA,
          assignmentId: person.assignment,
        });
        const direct = await client
          .from("crm_notes")
          .select("id")
          .in("id", [noteA, noteB, restrictedA]);
        expect(direct.error).toBeNull();
        expect(direct.data?.map((row) => row.id).sort()).toEqual(
          [...visible].sort(),
        );
      }
      expect(getAdminClient).not.toHaveBeenCalled();
    });
  },
);
