/**
 * #2708: the Data API caps every read at the `max_rows` supabase/config.toml
 * declares, as the hosted Data API does. That cap silently truncated gift
 * totals once (1eb444a5f); here it is served for real. Tenant B gets one
 * donor more than the cap; a plain read returns exactly the cap while the
 * exact count reports every row.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, expect, it } from "vitest";

import {
  createTenantFixture,
  removeTenantFixture,
  type TenantFixture,
} from "./fixtures";
import { adminDatabase, describeLive, serviceClient } from "./live-stack";
import { readApiSettings } from "../../../scripts/api-contract/stack.mjs";

import type pg from "pg";

const repoRoot = path.resolve(import.meta.dirname, "../../..");

describeLive("the Data API row cap", (stack) => {
  const { maxRows } = readApiSettings(
    readFileSync(path.join(repoRoot, "supabase/config.toml"), "utf8"),
  );
  let db: pg.Client;
  let b: TenantFixture;

  beforeAll(async () => {
    db = await adminDatabase(stack);
    b = await createTenantFixture(db);
    // The fixture's donor plus maxRows more: one row over the cap.
    await db.query(
      `insert into public.donors (tenant_id, name)
       select $1::uuid, 'Row cap donor ' || g from generate_series(1, $2::int) g`,
      [b.tenantId, maxRows],
    );
  });

  afterAll(async () => {
    if (db) {
      const problems = b ? await removeTenantFixture(db, b) : [];
      await db.end();
      expect(problems, "fixture cleanup").toEqual([]);
    }
  });

  it("returns at most the declared max_rows, as the hosted Data API does", async () => {
    const { data, count, error } = await serviceClient(stack)
      .from("donors")
      .select("id", { count: "exact" })
      .eq("tenant_id", b.tenantId);
    expect(error).toBeNull();
    expect(count, "rows that match").toBe(maxRows + 1);
    expect(
      data?.length,
      `rows the Data API returned; supabase/config.toml declares max_rows = ${maxRows}`,
    ).toBe(maxRows);
  });
});
