import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { CRM_LOOKUP_CHUNK_SIZE } from "../../../../packages/api/src/admin/crm/member-labels";
import pg from "pg";
import { expect, it } from "vitest";
import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asRole,
  fixtureIds,
  fixtureSql,
} from "../issue-2675/harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("requires the migrate database", () =>
  expect(ADMIN_URL).not.toBe(""),
);

it.skipIf(!ADMIN_URL)(
  "returns only requested live profiles, once per person, with the directory's same labels (D-18, AL-2678: each fixture missionary names a Party)",
  async () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    await db.connect();
    try {
      await db.query("begin");
      const ids = fixtureIds();
      await db.query(fixtureSql(ids));
      const caller = {
        sub: "UDEV",
        headers: { "x-asym-tenant": ids.TA, "x-asym-assignment": ids.mDev },
      };
      const read = asRole(db, ids);
      const original = await read(
        "authenticated",
        caller,
        `select distinct profile_id,display_name,email from public.tenant_member_directory('${ids.TA}') where profile_id='${ids.UFC}'`,
      );
      expect(original.rows).toHaveLength(1);
      const args = `'${ids.TA}',array['${ids.UFC}','${ids.UREV}','${ids.UB}']::uuid[]`;
      const narrow = await read(
        "authenticated",
        caller,
        `select profile_id,display_name,email from public.tenant_member_directory(${args})`,
      );
      expect(narrow.code).toBeNull();
      expect(narrow.rows).toEqual(original.rows);
      const refused = await read(
        "authenticated",
        {
          sub: "UDON",
          headers: { "x-asym-tenant": ids.TA, "x-asym-assignment": ids.mDonA },
        },
        `select * from public.tenant_member_directory(${args})`,
      );
      expect(refused.code).toBe("42501");
      await db.query(
        "insert into public.legal_entities (id,tenant_id,name,country_code,currency,legal_name) values ($1,$1,'Fixture A','US','usd','Fixture A'),($2,$2,'Fixture B','US','usd','Fixture B')",
        [ids.TA, ids.TB],
      );
      const workers = await db.query(
        "with party as (insert into public.parties (tenant_id,display_name) values ($1::uuid,'Fixture A'),($3::uuid,'Fixture B') returning id,tenant_id) insert into public.missionaries (tenant_id,profile_id,legal_entity_id,party_id) select party.tenant_id, case when party.tenant_id = $1::uuid then $2::uuid else $4::uuid end, party.tenant_id, party.id from party returning id,tenant_id",
        [ids.TA, ids.UFC, ids.TB, ids.UB],
      );
      const requested = workers.rows.map((row) => `'${row.id}'`).join(",");
      const labels = await read(
        "authenticated",
        caller,
        `select * from public.crm_missionary_labels('${ids.TA}',array[${requested}]::uuid[])`,
      );
      expect(labels.code).toBeNull();
      expect(labels.rows).toEqual([
        {
          ...original.rows[0],
          member_profile_id: ids.UFC,
          id: workers.rows.find((row) => row.tenant_id === ids.TA).id,
        },
      ]);
    } finally {
      await db.query("rollback");
      await db.end();
    }
  },
);

const stackUrl = process.env.CRM_READ_IT_SUPABASE_URL;
it.runIf(stackUrl || process.env.CRM_READ_IT_REQUIRED === "1").each([
  ["tenant_member_directory", "p_profile_ids"],
  ["crm_missionary_labels", "p_ids"],
] as const)(
  "accepts one application chunk and rejects an extra ID through %s",
  async (rpc, argument) => {
    const key = process.env.CRM_READ_IT_ANON_KEY;
    if (
      !stackUrl ||
      !["localhost", "127.0.0.1"].includes(new URL(stackUrl).hostname) ||
      !key
    )
      throw new Error(
        "CRM directory requires the disposable local stack and public key",
      );
    const auth = { persistSession: false, autoRefreshToken: false };
    const login = createClient(stackUrl, key, { auth });
    const { data, error } = await login.auth.signInWithPassword({
      email: "demo-owner@givehope.test",
      password: "demo-password",
    });
    expect(error).toBeNull();
    const tenant = "00000000-0000-0000-0000-000000000001";
    const memberships = await login.rpc("current_user_assignments");
    expect(memberships.error).toBeNull();
    const staff = memberships.data.find(
      (row: { tenant_id: string; role: string }) =>
        row.tenant_id === tenant && row.role === "staff",
    );
    expect(staff).toBeDefined();
    const client = createClient(stackUrl, key, {
      auth,
      accessToken: async () => data.session!.access_token,
      global: {
        headers: { "x-asym-tenant": tenant, "x-asym-assignment": staff.id },
      },
    });
    const read = (ids: string[]) =>
      client.rpc(rpc, { p_tenant_id: tenant, [argument]: ids });
    const ids = Array.from({ length: CRM_LOOKUP_CHUNK_SIZE }, () =>
      randomUUID(),
    );
    expect(ids).toHaveLength(150);
    for (const allowed of [[], ids]) {
      const result = await read(allowed);
      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    }
    const over = await read([...ids, randomUUID()]);
    expect(over.error?.code).toBe("22023");
  },
);
