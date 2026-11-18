/**
 * #2708: what the live API contract tests share. The stack comes from
 * scripts/api-contract/stack.mjs (`up` locally, `prepare` in CI), which passes
 * three variables through `stack.mjs test`:
 *
 *   API_CONTRACT_POSTGREST_URL  the run's PostgREST
 *   API_CONTRACT_JWT_SECRET     the run's random HS256 secret
 *   API_CONTRACT_DATABASE_URL   superuser URL of the disposable database,
 *                               used only to write and remove fixtures
 *
 * Without them the live suites skip, unless API_CONTRACT_REQUIRE_STACK=1
 * (set by `stack.mjs test`), which turns a missing stack into a failure.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import pg from "pg";
import { describe } from "vitest";

import { claimsForAuthUser, mintToken, type AuthUserRow } from "./tokens";

export type LiveStack = {
  postgrestUrl: string;
  jwtSecret: string;
  databaseUrl: string;
};

export function liveStack(): LiveStack | null {
  const postgrestUrl = process.env.API_CONTRACT_POSTGREST_URL?.trim() ?? "";
  const jwtSecret = process.env.API_CONTRACT_JWT_SECRET?.trim() ?? "";
  const databaseUrl = process.env.API_CONTRACT_DATABASE_URL?.trim() ?? "";
  if (postgrestUrl && jwtSecret && databaseUrl)
    return { postgrestUrl, jwtSecret, databaseUrl };
  if (process.env.API_CONTRACT_REQUIRE_STACK === "1")
    throw new Error(
      "API_CONTRACT_REQUIRE_STACK=1 but the stack variables are missing; start it with scripts/api-contract/stack.mjs",
    );
  return null;
}

/** `describe` when the stack is running, `describe.skip` otherwise. */
export function describeLive(
  name: string,
  body: (stack: LiveStack) => void,
): void {
  const stack = liveStack();
  if (stack) describe(name, () => body(stack));
  else describe.skip(`${name} (no API contract stack)`, () => {});
}

/**
 * A real supabase-js client whose Data API requests go to the run's
 * PostgREST. supabase-js addresses `<url>/rest/v1`; the fetch below maps that
 * prefix onto the bare PostgREST URL and changes nothing else.
 */
export function dataApiClient(stack: LiveStack, token: string): SupabaseClient {
  const base = "http://api-contract.invalid";
  return createClient(base, token, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(
          String(input instanceof Request ? input.url : input).replace(
            `${base}/rest/v1`,
            stack.postgrestUrl,
          ),
          init,
        ),
    },
  });
}

export const serviceClient = (stack: LiveStack) =>
  dataApiClient(stack, mintToken({ role: "service_role" }, stack.jwtSecret));

export const anonClient = (stack: LiveStack) =>
  dataApiClient(stack, mintToken({ role: "anon" }, stack.jwtSecret));

/** A client signed in as `userId`, with the claims GoTrue would issue. */
export async function userClient(
  stack: LiveStack,
  db: pg.Client,
  userId: string,
): Promise<SupabaseClient> {
  const { rows } = await db.query<AuthUserRow>(
    "select id::text, email, raw_app_meta_data, raw_user_meta_data from auth.users where id = $1",
    [userId],
  );
  if (!rows[0]) throw new Error(`auth.users has no row ${userId}`);
  return dataApiClient(
    stack,
    mintToken(claimsForAuthUser(rows[0]), stack.jwtSecret),
  );
}

export async function adminDatabase(stack: LiveStack): Promise<pg.Client> {
  const client = new pg.Client({ connectionString: stack.databaseUrl });
  await client.connect();
  return client;
}

const quoteIdent = (name: string) => `"${name.replace(/"/g, '""')}"`;

/**
 * Inserts (or updates on `conflict`) one fixture row through only the columns
 * the table has today, so a column the in-flight schema work drops does not
 * break the fixture; a NOT NULL column it adds fails loudly by name.
 */
export async function upsertFixture(
  db: pg.Client,
  qualifiedTable: string,
  values: Record<string, unknown>,
  conflict: readonly string[] = ["id"],
): Promise<Record<string, unknown>> {
  const [schema, table] = qualifiedTable.split(".");
  const { rows: columns } = await db.query<{ column_name: string }>(
    "select column_name from information_schema.columns where table_schema = $1 and table_name = $2",
    [schema, table],
  );
  const present = new Set(columns.map((c) => c.column_name));
  if (present.size === 0) throw new Error(`${qualifiedTable} does not exist`);
  const keys = Object.keys(values).filter((key) => present.has(key));
  const target = `${quoteIdent(schema!)}.${quoteIdent(table!)}`;
  const updates = keys
    .filter((key) => !conflict.includes(key))
    .map((key) => `${quoteIdent(key)} = excluded.${quoteIdent(key)}`);
  const sql = `insert into ${target} (${keys.map(quoteIdent).join(", ")})
    values (${keys.map((_, i) => `$${i + 1}`).join(", ")})
    on conflict (${conflict.map(quoteIdent).join(", ")})
    ${updates.length > 0 ? `do update set ${updates.join(", ")}` : "do nothing"}
    returning *`;
  const { rows } = await db.query(
    sql,
    keys.map((key) => {
      const value = values[key];
      return value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
        ? JSON.stringify(value)
        : value;
    }),
  );
  return rows[0] ?? {};
}
