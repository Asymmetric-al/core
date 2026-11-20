import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import pg from "pg";
import { expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2675/harness";
import {
  ANON_DEFINER_ALLOWLIST_PATH,
  TENANT_POLICY_EXCEPTIONS_PATH,
  TENANT_RLS_CATALOG_SQL,
  TENANT_RLS_EXCEPTIONS_PATH,
  evaluateTenantRlsCatalog,
} from "../../../../scripts/verify/tenant-rls-catalog.mjs";

const list = (path: string) => JSON.parse(readFileSync(path, "utf8"));

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("requires the migrate database", () =>
  expect(ADMIN_URL).not.toBe(""),
);

it.skipIf(!ADMIN_URL)(
  "checks the writer, service helper and human wrapper independently against real grants",
  async () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const suffix = randomUUID().replaceAll("-", "");
    const writer = `tenant_guard.wp4a1_writer_${suffix}`;
    const helper = `tenant_guard.wp4a1_helper_${suffix}`;
    const wrapper = `public.wp4a1_wrapper_${suffix}`;
    const judge = async () => {
      const result = await db.query({
        text: TENANT_RLS_CATALOG_SQL,
        rowMode: "array",
      });
      return evaluateTenantRlsCatalog(
        JSON.parse(result.rows[0][0]),
        list(TENANT_RLS_EXCEPTIONS_PATH),
        list(ANON_DEFINER_ALLOWLIST_PATH),
        list(TENANT_POLICY_EXCEPTIONS_PATH),
      ).failures;
    };
    await db.connect();
    try {
      await db.query("begin");
      expect(await judge()).toEqual([]);
      await db.query(`create function ${writer}(p_tenant_id uuid) returns void language plpgsql security definer set search_path='' as $$ begin perform tenant_guard.begin_human_command(p_tenant_id); update authz.memberships set tenant_id=p_tenant_id where false; end $$;
      create function ${helper}(p_tenant_id uuid) returns void language plpgsql security invoker set search_path='' as $$ begin return; end $$;
      create function ${wrapper}(p_tenant_id uuid) returns void language sql security invoker set search_path='' as $$ select ${writer}(p_tenant_id) $$;
      alter function ${writer}(uuid) owner to tenant_guard;
      revoke all on function ${writer}(uuid), ${helper}(uuid), ${wrapper}(uuid) from public, anon, authenticated, service_role;
      grant execute on function ${writer}(uuid), ${wrapper}(uuid) to authenticated;
      grant execute on function ${helper}(uuid), ${wrapper}(uuid) to service_role;`);
      expect(
        (await judge())
          .map(
            (failure: { code: string; function: string }) =>
              `${failure.code} ${failure.function}`,
          )
          .sort(),
      ).toEqual([
        `COMMAND_CAPABILITY ${writer}(p_tenant_id uuid)`,
        `COMMAND_HELPER_EXPOSED ${helper}(p_tenant_id uuid)`,
        `WRAPPER_GRANTS_HUMAN ${wrapper}(p_tenant_id uuid)`,
      ]);
      await db.query(
        `create or replace function ${wrapper}(p_tenant_id uuid) returns void language sql security invoker set search_path='' as $$ select ${writer}(p_tenant_id); select ${helper}(p_tenant_id) $$`,
      );
      expect(await judge()).toContainEqual(
        expect.objectContaining({
          code: "WRAPPER_GRANTS_HUMAN",
          function: `${wrapper}(p_tenant_id uuid)`,
        }),
      );
    } finally {
      await db.query("rollback");
      await db.end();
    }
  },
);
