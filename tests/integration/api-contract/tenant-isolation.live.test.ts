/**
 * #2708: tenant isolation through the Data API. Every table or view in the
 * exposed schemas with a `tenant_id` column is read as a signed-in user of
 * tenant A (the seed's demo user), as a signed-in user of tenant B (written
 * here), and anonymously. It asserts floors only, so the WP2 policy rewrite
 * can change who reads what inside a tenant without breaking it:
 *
 * - no signed-in caller receives a row whose tenant_id names another tenant,
 *   unless a ruling makes that row public (ruled-public-reads.ts: published
 *   posts and their interactions, published locations; the admin connection
 *   computes exactly which rows); NULL-tenant rows (platform defaults such as
 *   field_policies) belong to no tenant and are not counted;
 * - `anon` receives no row, except the rows a ruling makes public;
 * - a read Postgres refuses for lack of privilege on the swept relation
 *   (42501 naming it) counts as no rows. If the role still holds column
 *   privileges there (missionaries grants authenticated `id, profile_id`),
 *   the sweep reads a readable primary key instead and resolves each row's
 *   tenant through the admin connection. Any other error fails the sweep.
 *
 * What it proves, and what it does not: a table is evidenced for a caller
 * when the caller could query it and the database holds rows that caller
 * must not read. Core tables must be evidenced in both directions
 * (REQUIRED_EVIDENCE). The run lists evidenced, readable-but-unevidenced and
 * refused tables by name. On the plain-Postgres replay `authenticated` and
 * `anon` lack the table grants hosted Supabase gives by default, so a refused
 * table here proves nothing about its row policy on a hosted project until
 * those defaults are closed (AL-2674's in-flight default-privilege migration).
 *
 * Vacuity guard: each signed-in caller must read its own profiles row by id
 * and some row of its own tenant outside the ruled public reads, so its token
 * reached the database as that user; a token for an unknown subject must not.
 */
import { randomUUID } from "node:crypto";
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
import { isRefusalOf, qualifiedName, type Relation } from "./isolation-probe";
import {
  adminDatabase,
  anonClient,
  claimsClient,
  claimsOfUser,
  describeLive,
  userClient,
} from "./live-stack";
import { RULED_PUBLIC_READS } from "./ruled-public-reads";
import { readApiSettings } from "../../../scripts/api-contract/stack.mjs";

import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type pg from "pg";

const repoRoot = path.resolve(import.meta.dirname, "../../..");

/**
 * Tables each signed-in caller must have evidence on, in both directions:
 * the money and people tables, the column-grant path (missionaries) and the
 * ruled-row path (posts, locations). Anon must have evidence on the ruled
 * tables. A table missing here was either unreadable (refused) or held no
 * row the caller must not read; the failure lists which.
 */
const REQUIRED_EVIDENCE = {
  signedIn: [
    "donors",
    "donations",
    "donor_pledges",
    "profiles",
    "missionaries",
    "posts",
    "locations",
  ],
  anon: ["posts", "locations"],
} as const;

/** PostgREST's cap here is 1000 rows; pages never exceed it. */
const PAGE = 1000;

type Caller = {
  name: string;
  client: SupabaseClient;
  role: "authenticated" | "anon";
  /** null for anon: every row is someone else's. */
  tenantId: string | null;
  userId: string | null;
};

type Probe = {
  /** How the caller could read the relation. */
  access: "table" | "columns" | "refused";
  /** The primary key read when only column privileges allow a read. */
  via?: string;
  /** Rows the caller read that it must not read. */
  leaked: number;
  sample: unknown[];
  /** Rows of other tenants the caller read that a ruling makes public. */
  ruledPublic: number;
  error?: string;
};

type Sweep = {
  leaks: string[];
  errors: string[];
  evidenced: string[];
  unevidenced: string[];
  refused: string[];
  columnsOnly: string[];
  ruledPublic: string[];
};

const ident = (name: string) => `"${name.replace(/"/g, '""')}"`;
const sqlName = ({ schema, table }: Relation) =>
  `${ident(schema)}.${ident(table)}`;
const describeError = (error: PostgrestError) =>
  `${error.code}: ${error.message}`;

describeLive("tenant isolation through the Data API", (stack) => {
  const settings = readApiSettings(
    readFileSync(path.join(repoRoot, "supabase/config.toml"), "utf8"),
  );
  let db: pg.Client;
  let b: TenantFixture;
  let tables: Relation[];
  const callers: Record<"A" | "B" | "anon", Caller> = {} as Record<
    "A" | "B" | "anon",
    Caller
  >;

  beforeAll(async () => {
    db = await adminDatabase(stack);
    b = await createTenantFixture(db);
    tables = (
      await db.query<Relation>(
        `select c.table_schema as schema, c.table_name as table
           from information_schema.columns c
          where c.column_name = 'tenant_id' and c.table_schema = any($1)
          order by 1, 2`,
        [settings.schemas],
      )
    ).rows;
    callers.A = {
      name: "tenant A",
      client: await userClient(stack, db, SEED_USER_A),
      role: "authenticated",
      tenantId: TENANT_A,
      userId: SEED_USER_A,
    };
    callers.B = {
      name: "tenant B",
      client: await userClient(stack, db, b.userId),
      role: "authenticated",
      tenantId: b.tenantId,
      userId: b.userId,
    };
    callers.anon = {
      name: "anon",
      client: anonClient(stack),
      role: "anon",
      tenantId: null,
      userId: null,
    };
  });

  afterAll(async () => {
    if (db) {
      const problems = b ? await removeTenantFixture(db, b) : [];
      await db.end();
      expect(problems, "fixture cleanup").toEqual([]);
    }
  });

  const api = (client: SupabaseClient, relation: Relation) =>
    (relation.schema === "public"
      ? client
      : client.schema(relation.schema)
    ).from(relation.table);

  /** The ruling's row predicate for `relation`, or `false` when none. */
  const publicRows = (relation: Relation) =>
    RULED_PUBLIC_READS.get(qualifiedName(relation))?.publicRows ?? "false";

  /** The single-column primary key `role` may read, when it has column privileges only. */
  async function readableKey(
    role: Caller["role"],
    relation: Relation,
  ): Promise<{ column: string } | { problem: string } | null> {
    const { rows } = await db.query<{ column: string; is_key: boolean }>(
      `select a.attname as column,
              exists (
                select 1 from pg_index i
                 where i.indrelid = c.oid and i.indisprimary
                   and i.indnkeyatts = 1 and i.indkey[0] = a.attnum
              ) as is_key
         from pg_class c
         join pg_namespace n on n.oid = c.relnamespace
         join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
        where n.nspname = $1 and c.relname = $2
          and has_column_privilege($3::name, c.oid, a.attnum, 'SELECT')
        order by a.attnum`,
      [relation.schema, relation.table, role],
    );
    if (rows.length === 0) return null;
    const key = rows.find((row) => row.is_key);
    if (key) return { column: key.column };
    return {
      problem: `${role} may select ${rows.map((r) => r.column).join(", ")} but no single-column primary key, so the sweep cannot attribute its rows to tenants; extend the probe`,
    };
  }

  /** Every value of `column` the caller can read, page by page. */
  async function readKeys(
    caller: Caller,
    relation: Relation,
    column: string,
    foreignOnly: boolean,
  ): Promise<{ values: string[] } | { error: PostgrestError }> {
    const values: string[] = [];
    for (let from = 0; ; from += PAGE) {
      let query = api(caller.client, relation)
        .select(column)
        .order(column)
        .range(from, from + PAGE - 1);
      if (foreignOnly && caller.tenantId)
        query = query.neq("tenant_id", caller.tenantId);
      const { data, error } = await query;
      if (error) return { error };
      const rows = (data ?? []) as unknown as Record<string, unknown>[];
      values.push(...rows.map((row) => String(row[column])));
      if (rows.length < PAGE) return { values };
    }
  }

  /** Resolves keys the caller read to tenants and the ruling, as the admin. */
  async function judgeKeys(
    caller: Caller,
    relation: Relation,
    column: string,
    values: string[],
    access: Probe["access"],
  ): Promise<Probe> {
    const { rows } = await db.query<{
      key: string;
      tenant_id: string | null;
      is_public: boolean;
    }>(
      `select t.${ident(column)}::text as key, t.tenant_id::text as tenant_id,
              coalesce((${publicRows(relation)}), false) as is_public
         from ${sqlName(relation)} t
        where t.${ident(column)}::text = any($1::text[])`,
      [values],
    );
    const probe: Probe = {
      access,
      ...(access === "columns" ? { via: column } : {}),
      leaked: 0,
      sample: [],
      ruledPublic: 0,
    };
    if (rows.length !== new Set(values).size)
      probe.error = `read ${values.length} row(s) by ${column}, the database resolved ${rows.length}`;
    for (const row of rows) {
      const foreign =
        caller.tenantId === null ||
        (row.tenant_id !== null && row.tenant_id !== caller.tenantId);
      if (!foreign) continue;
      if (row.is_public) probe.ruledPublic += 1;
      else {
        probe.leaked += 1;
        if (probe.sample.length < 3)
          probe.sample.push({ [column]: row.key, tenant_id: row.tenant_id });
      }
    }
    return probe;
  }

  async function probe(caller: Caller, relation: Relation): Promise<Probe> {
    const ruled = RULED_PUBLIC_READS.has(qualifiedName(relation));
    let refusal: PostgrestError;
    if (ruled) {
      // Read each foreign row's key so every row is checked against the ruling.
      const read = await readKeys(caller, relation, "id", true);
      if ("values" in read)
        return judgeKeys(caller, relation, "id", read.values, "table");
      refusal = read.error;
    } else {
      let query = api(caller.client, relation).select("tenant_id", {
        count: "exact",
      });
      if (caller.tenantId) query = query.neq("tenant_id", caller.tenantId);
      const { data, error, count } = await query.limit(3);
      if (!error)
        return {
          access: "table",
          leaked: count ?? data?.length ?? 0,
          sample: data ?? [],
          ruledPublic: 0,
        };
      refusal = error;
    }

    const failed = { leaked: 0, sample: [], ruledPublic: 0 } as const;
    if (!isRefusalOf(refusal, relation))
      return { access: "table", ...failed, error: describeError(refusal) };
    const key = await readableKey(caller.role, relation);
    if (key === null) return { access: "refused", ...failed };
    if ("problem" in key)
      return { access: "columns", ...failed, error: key.problem };
    const read = await readKeys(caller, relation, key.column, false);
    if ("error" in read)
      return {
        access: "columns",
        via: key.column,
        ...failed,
        error: describeError(read.error),
      };
    return judgeKeys(caller, relation, key.column, read.values, "columns");
  }

  /** Rows the database holds that `caller` must not read. */
  async function forbiddenRows(
    caller: Caller,
    relation: Relation,
  ): Promise<number> {
    const outsideRuling = `not coalesce((${publicRows(relation)}), false)`;
    const { rows } = await db.query<{ n: number }>(
      caller.tenantId === null
        ? `select count(*)::int as n from ${sqlName(relation)} t where ${outsideRuling}`
        : `select count(*)::int as n from ${sqlName(relation)} t
            where t.tenant_id is not null and t.tenant_id::text <> $1 and ${outsideRuling}`,
      caller.tenantId === null ? [] : [caller.tenantId],
    );
    return rows[0]?.n ?? 0;
  }

  async function sweep(caller: Caller): Promise<Sweep> {
    const result: Sweep = {
      leaks: [],
      errors: [],
      evidenced: [],
      unevidenced: [],
      refused: [],
      columnsOnly: [],
      ruledPublic: [],
    };
    for (const relation of tables) {
      const name = qualifiedName(relation);
      const p = await probe(caller, relation);
      if (p.error) result.errors.push(`${name}: ${p.error}`);
      if (p.leaked > 0)
        result.leaks.push(
          `${name}: ${p.leaked} row(s) ${caller.tenantId ? "of another tenant" : "readable without signing in"} that no ruling makes public${p.via ? ` (read by ${p.via} through column privileges)` : ""}, e.g. ${JSON.stringify(p.sample)}`,
        );
      if (p.ruledPublic > 0)
        result.ruledPublic.push(`${relation.table} (${p.ruledPublic})`);
      if (p.access === "refused") {
        result.refused.push(relation.table);
        continue;
      }
      if (p.access === "columns")
        result.columnsOnly.push(`${relation.table} by ${p.via ?? "?"}`);
      if ((await forbiddenRows(caller, relation)) > 0)
        result.evidenced.push(relation.table);
      else result.unevidenced.push(relation.table);
    }
    const readable = tables.length - result.refused.length;
    console.info(
      [
        `API contract: ${caller.name} swept ${tables.length} tables: ${readable} readable (${result.columnsOnly.length} through column privileges only${result.columnsOnly.length ? `: ${result.columnsOnly.join(", ")}` : ""}), ${result.refused.length} refused for lack of privilege.`,
        `  evidenced (${result.evidenced.length}; the caller could query them and they hold rows it must not read): ${result.evidenced.join(", ") || "none"}`,
        `  readable but unevidenced (${result.unevidenced.length}; no row the caller must not read exists, so nothing is proven there): ${result.unevidenced.join(", ") || "none"}`,
        `  refused (${result.refused.length}; no privilege on this plain-Postgres replay, which proves nothing about their row policies on a hosted project): ${result.refused.join(", ") || "none"}`,
        `  ${caller.tenantId ? "rows of other tenants" : "rows"} read that a ruling makes public: ${result.ruledPublic.join(", ") || "none"}`,
      ].join("\n"),
    );
    return result;
  }

  it("finds the tenant tables to sweep", () => {
    expect(tables.length).toBeGreaterThan(20);
    expect(tables.map((t) => t.table)).toEqual(
      expect.arrayContaining([
        ...REQUIRED_EVIDENCE.signedIn,
        ...REQUIRED_EVIDENCE.anon,
      ]),
    );
  });

  /**
   * Why `client` cannot be shown to read as `userId` of `tenantId`; empty when
   * it can. Two reads only that identity passes: the user's own profiles row
   * by id (the profile policies admit it to the user or to staff of its
   * tenant, never to an unresolved token), and some row of its own tenant in a
   * table outside the ruled public reads (a published post is readable by
   * any token, so it proves nothing).
   */
  async function identityProblems(
    client: SupabaseClient,
    userId: string,
    tenantId: string,
  ): Promise<string[]> {
    const problems: string[] = [];
    const profile = await client.from("profiles").select("id").eq("id", userId);
    if (profile.error)
      problems.push(`its own profiles row: ${describeError(profile.error)}`);
    else if ((profile.data ?? []).length !== 1)
      problems.push(`its own profiles row ${userId} is not visible`);

    let own = 0;
    for (const relation of tables) {
      if (RULED_PUBLIC_READS.has(qualifiedName(relation))) continue;
      const { count } = await api(client, relation)
        .select("tenant_id", { count: "exact", head: true })
        .eq("tenant_id", tenantId);
      own += count ?? 0;
    }
    if (own === 0)
      problems.push(
        `no row of tenant ${tenantId} outside the ruled public reads is visible`,
      );
    return problems;
  }

  it("a token whose subject is not the user does not pass the identity guard", async () => {
    const claims = await claimsOfUser(db, SEED_USER_A);
    const stranger = claimsClient(stack, { ...claims, sub: randomUUID() });
    const problems = await identityProblems(stranger, SEED_USER_A, TENANT_A);
    console.info(
      `API contract: a token for an unknown subject with tenant A's claims fails the identity guard: ${problems.join("; ")}.`,
    );
    expect(
      problems,
      "a token for an unknown subject with tenant A's claims",
    ).toContain(`its own profiles row ${SEED_USER_A} is not visible`);
  });

  for (const key of ["A", "B"] as const) {
    it(`a user of tenant ${key} sees its own tenant, so its token reached the database`, async () => {
      const { client, tenantId, userId } = callers[key];
      expect(
        await identityProblems(client, userId!, tenantId!),
        `caller ${key}`,
      ).toEqual([]);
    });

    it(`a user of tenant ${key} reads no row of another tenant`, async () => {
      const result = await sweep(callers[key]);
      expect(
        REQUIRED_EVIDENCE.signedIn.filter(
          (table) => !result.evidenced.includes(table),
        ),
        `core tables without evidence for tenant ${key} (each must be readable by the caller and hold rows it must not read; if one became unreadable on purpose, record why and remove it from REQUIRED_EVIDENCE)`,
      ).toEqual([]);
      expect(result.errors, "unexpected Data API errors").toEqual([]);
      expect(result.leaks, `tenant ${key} read other tenants' rows`).toEqual(
        [],
      );
    });
  }

  it("anon reads no tenant row outside the ruled public rows", async () => {
    const result = await sweep(callers.anon);
    expect(
      REQUIRED_EVIDENCE.anon.filter(
        (table) => !result.evidenced.includes(table),
      ),
      "ruled tables without evidence for anon",
    ).toEqual([]);
    expect(result.errors, "unexpected Data API errors").toEqual([]);
    expect(result.leaks, "anonymous tenant reads").toEqual([]);
  });
});
