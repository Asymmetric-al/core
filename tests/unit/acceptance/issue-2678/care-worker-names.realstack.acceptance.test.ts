import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2678 WP5 rest 2b (brief stage5/wp5-rest.md, pull request 2, outcome 4 and invariant 12): Care's directory names a worker with no login by the Party's display name, keeps its care.access gate and gives no one a new column",
  () => {
    const admin = new pg.Client({ connectionString: ADMIN_URL });
    const tenant = randomUUID();
    const users: string[] = [];

    async function staff(staffRole: string) {
      const user = randomUUID();
      await admin.query(
        "insert into auth.users (id, email, email_confirmed_at) values ($1, $2, now())",
        [user, `wp5rest2b-care-${user}@example.test`],
      );
      await admin.query(
        "insert into public.profiles (id, user_id) values ($1, $1) on conflict (id) do nothing",
        [user],
      );
      await admin.query("delete from authz.memberships where user_id = $1", [
        user,
      ]);
      await admin.query(
        "insert into authz.memberships (user_id, tenant_id, role, staff_role) values ($1, $2, 'staff', $3)",
        [user, tenant, staffRole],
      );
      users.push(user);
      return user;
    }

    async function worker(name: string, profile: string | null) {
      const party = (
        await admin.query(
          "insert into public.parties (tenant_id, display_name) values ($1, $2) returning id",
          [tenant, name],
        )
      ).rows[0].id as string;
      return (
        await admin.query(
          "insert into public.missionaries (tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $3, $1) returning id",
          [tenant, party, profile],
        )
      ).rows[0].id as string;
    }

    async function directory(user: string) {
      const c = new pg.Client({ connectionString: ADMIN_URL });
      await c.connect();
      try {
        await c.query("begin");
        await c.query(
          `set local role authenticated;
           select set_config('request.jwt.claims', '${JSON.stringify({ sub: user, role: "authenticated" })}', true),
                  set_config('request.jwt.claim.sub', '', true),
                  set_config('request.headers', '${JSON.stringify({ "x-asym-tenant": tenant })}', true);`,
        );
        return (
          await c.query(
            "select id, display_name, full_name, first_name, last_name, total_count from public.member_care_directory_rows($1, null, 250)",
            [tenant],
          )
        ).rows as Record<string, unknown>[];
      } finally {
        await c.query("rollback").catch(() => undefined);
        await c.end();
      }
    }

    beforeAll(async () => {
      await admin.connect();
      await admin.query(
        "insert into public.tenants (id, name, slug) values ($1::uuid, 'wp5rest2b care', 'wp5rest2b-care-' || $1::text)",
        [tenant],
      );
      await admin.query(
        "insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'L', 'US', 'usd', 'L')",
        [tenant],
      );
    });

    afterAll(async () => {
      try {
        for (const table of ["missionaries", "parties", "legal_entities"])
          await admin.query(
            `delete from public.${table} where tenant_id = $1`,
            [tenant],
          );
        await admin.query(
          "delete from authz.memberships where tenant_id = $1 or user_id = any($2::uuid[])",
          [tenant, users],
        );
        await admin.query("delete from public.tenants where id = $1", [tenant]);
        await admin.query("delete from auth.users where id = any($1::uuid[])", [
          users,
        ]);
      } finally {
        await admin.end();
      }
    });

    it("a worker with no login appears under the Party's display name, and a worker with a login keeps its profile's names (red: the worker with no login has no name)", async () => {
      const carer = await staff("member_care");
      const signedIn = await staff("development");
      await admin.query(
        "update public.profiles set display_name = 'Profile Plover', full_name = 'Profile Plover Full' where id = $1",
        [signedIn],
      );
      const noLogin = await worker("Party Heron", null);
      const withLogin = await worker("Party Plover", signedIn);
      const rows = await directory(carer);
      const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
      expect(byId[noLogin]).toMatchObject({
        display_name: "Party Heron",
        full_name: null,
        first_name: null,
        last_name: null,
        total_count: "2",
      });
      expect(byId[withLogin]).toMatchObject({
        display_name: "Profile Plover",
        full_name: "Profile Plover Full",
      });
    });

    it("a caller without care.access gets no row and no count, the worker with no login included (guard)", async () => {
      const outsider = await staff("development");
      await worker("Party Wren", null);
      expect(await directory(outsider)).toEqual([]);
    });

    it("the reader's columns are as before: no one gains a column (guard)", async () => {
      expect(
        (
          await admin.query(
            "select pg_get_function_result('public.member_care_directory_rows(uuid,uuid,integer)'::regprocedure) r",
          )
        ).rows[0].r,
      ).toBe(
        "TABLE(id uuid, location text, timezone text, health_status text, last_check_in timestamp with time zone, manual_attention boolean, region text, mission_field text, health_signals jsonb, birth_date date, first_name text, last_name text, full_name text, display_name text, avatar_url text, total_count bigint)",
      );
    });
  },
);
