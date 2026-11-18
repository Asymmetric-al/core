/**
 * #2708: tenant isolation through the Data API. Every table or view in the
 * exposed schemas with a `tenant_id` column is read as a signed-in user of
 * tenant A (the seed's demo user), as a signed-in user of tenant B (written
 * here), and anonymously. It asserts floors only, so the WP2 policy rewrite
 * can change who reads what inside a tenant without breaking it:
 *
 * - no signed-in caller receives a row whose tenant_id names another tenant,
 *   beyond what `anon` may read from the ruled public reads (a public row is
 *   public to everyone); NULL-tenant rows (platform defaults such as
 *   field_policies) belong to no tenant and are not counted;
 * - `anon` receives no tenant row, except from the ruled public reads;
 * - a read refused for lack of privilege (42501) counts as no rows.
 *
 * Vacuity guards: each signed-in caller must see some row of its own tenant
 * (so its token reached the database as that user), and a table only counts
 * as evidence when the service role sees rows the caller must not.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, expect, it } from "vitest";

import {
  createTenantFixture,
  removeTenantFixture,
  SEED_USER_A,
  TENANT_A,
  type TenantFixture,
} from "./fixtures";
import {
  adminDatabase,
  anonClient,
  describeLive,
  serviceClient,
  userClient,
} from "./live-stack";
import { RULED_PUBLIC_READS } from "./ruled-public-reads";
import { readApiSettings } from "../../../scripts/api-contract/stack.mjs";

import type { SupabaseClient } from "@supabase/supabase-js";
import type pg from "pg";

const repoRoot = path.resolve(import.meta.dirname, "../../..");

type Probe = {
  table: string;
  rows: number;
  refused: boolean;
  error?: string;
  sample: unknown[];
};

/** Rows of `table` naming a tenant other than `tenantId` (any row, for anon). */
async function foreignRows(
  client: SupabaseClient,
  schema: string,
  table: string,
  tenantId: string | null,
): Promise<Probe> {
  const from = schema === "public" ? client : client.schema(schema);
  let query = from.from(table).select("tenant_id", { count: "exact" });
  if (tenantId) query = query.neq("tenant_id", tenantId);
  const { data, error, count } = await query.limit(3);
  if (error) {
    const refused = error.code === "42501";
    return {
      table,
      rows: 0,
      refused,
      sample: [],
      ...(refused ? {} : { error: `${error.code}: ${error.message}` }),
    };
  }
  return {
    table,
    rows: count ?? data?.length ?? 0,
    refused: false,
    sample: data ?? [],
  };
}

describeLive("tenant isolation through the Data API", (stack) => {
  const settings = readApiSettings(
    readFileSync(path.join(repoRoot, "supabase/config.toml"), "utf8"),
  );
  let db: pg.Client;
  let b: TenantFixture;
  let tables: { schema: string; table: string }[];
  const callers: Record<
    string,
    { client: SupabaseClient; tenantId: string | null }
  > = {};

  beforeAll(async () => {
    db = await adminDatabase(stack);
    b = await createTenantFixture(db);
    tables = (
      await db.query<{ schema: string; table: string }>(
        `select c.table_schema as schema, c.table_name as table
           from information_schema.columns c
          where c.column_name = 'tenant_id' and c.table_schema = any($1)
          order by 1, 2`,
        [settings.schemas],
      )
    ).rows;
    callers.A = {
      client: await userClient(stack, db, SEED_USER_A),
      tenantId: TENANT_A,
    };
    callers.B = {
      client: await userClient(stack, db, b.userId),
      tenantId: b.tenantId,
    };
    callers.anon = { client: anonClient(stack), tenantId: null };
  });

  afterAll(async () => {
    if (db) {
      const problems = b ? await removeTenantFixture(db, b) : [];
      await db.end();
      expect(problems, "fixture cleanup").toEqual([]);
    }
  });

  it("finds the tenant tables to sweep", () => {
    expect(tables.length).toBeGreaterThan(20);
    expect(tables.map((t) => t.table)).toEqual(
      expect.arrayContaining([
        "donors",
        "donations",
        "missionaries",
        "profiles",
      ]),
    );
  });

  for (const caller of ["A", "B"] as const) {
    it(`a user of tenant ${caller} sees its own tenant, so its token reached the database`, async () => {
      const { client, tenantId } = callers[caller]!;
      let own = 0;
      for (const { schema, table } of tables) {
        const from = schema === "public" ? client : client.schema(schema);
        const { count } = await from
          .from(table)
          .select("tenant_id", { count: "exact", head: true })
          .eq("tenant_id", tenantId!);
        own += count ?? 0;
      }
      expect(
        own,
        `rows of its own tenant visible to ${caller}`,
      ).toBeGreaterThan(0);
    });

    it(`a user of tenant ${caller} reads no row of another tenant`, async () => {
      const { client, tenantId } = callers[caller]!;
      const service = serviceClient(stack);
      const leaks: string[] = [];
      const errors: string[] = [];
      const evidenced: string[] = [];
      let refused = 0;
      for (const { schema, table } of tables) {
        const probe = await foreignRows(client, schema, table, tenantId);
        if (probe.error) errors.push(`${schema}.${table}: ${probe.error}`);
        if (probe.refused) refused += 1;
        const publicRows = RULED_PUBLIC_READS.has(`${schema}.${table}`)
          ? (await foreignRows(callers.anon!.client, schema, table, tenantId))
              .rows
          : 0;
        if (probe.rows > publicRows)
          leaks.push(
            `${schema}.${table}: ${probe.rows} row(s) of another tenant (${publicRows} public), e.g. ${JSON.stringify(probe.sample)}`,
          );
        // Evidence: the caller may select the table and other tenants' rows exist.
        const exposure = await foreignRows(service, schema, table, tenantId);
        if (exposure.rows > 0 && !probe.refused) evidenced.push(table);
      }
      console.info(
        `API contract: tenant ${caller} swept ${tables.length} tables (${refused} refused for lack of privilege); ${evidenced.length} readable tables held other tenants' rows to leak (${evidenced.join(", ")}).`,
      );
      expect(evidenced.length, "tables with rows to leak").toBeGreaterThan(0);
      expect(errors, "unexpected Data API errors").toEqual([]);
      expect(leaks, `tenant ${caller} read other tenants' rows`).toEqual([]);
    });
  }

  it("anon reads no tenant row outside the ruled public reads", async () => {
    const leaks: string[] = [];
    const errors: string[] = [];
    const publicTables: string[] = [];
    for (const { schema, table } of tables) {
      const probe = await foreignRows(
        callers.anon!.client,
        schema,
        table,
        null,
      );
      if (probe.error) errors.push(`${schema}.${table}: ${probe.error}`);
      if (probe.rows === 0) continue;
      if (RULED_PUBLIC_READS.has(`${schema}.${table}`))
        publicTables.push(`${table} (${probe.rows})`);
      else
        leaks.push(
          `${schema}.${table}: ${probe.rows} row(s) readable without signing in`,
        );
    }
    console.info(
      `API contract: anon read rows only from ruled public tables: ${publicTables.join(", ") || "none"}.`,
    );
    expect(errors, "unexpected Data API errors").toEqual([]);
    expect(leaks, "anonymous tenant reads").toEqual([]);
  });
});
