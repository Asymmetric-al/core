/**
 * Scriptable fake for `@supabase/supabase-js` used by the issue #2067
 * acceptance tests. Wire it with:
 *
 *   vi.mock("@supabase/supabase-js", async (importOriginal) =>
 *     (await import("./fake-supabase")).mockSupabaseModule(await importOriginal()),
 *   );
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 *
 * Addendum 4 (Blake-approved 2026-10-20 10:31 PM PT,
 * https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6308840307)
 * replaces the PostgREST read key with a `pg` connection as
 * `document_cutover_reader` (faked in ./fake-postgres.ts). The gate must no
 * longer create a Supabase client at all; `fakeDb.clients` records any that
 * it does. Criterion 10 item 1: this fake now models only the committed
 * exposure, so an unexposed or ungranted read errors as it would in
 * production (Reviewer M1/M2 on PR #2169):
 *
 * - `client.schema(name)` for a schema not listed in `supabase/config.toml`
 *   `[api] schemas` (committed: `public`, `graphql_public`) resolves every
 *   read to PostgREST's `PGRST106` error. That covers
 *   `.schema("supabase_migrations")` and `.schema("document_cutover")`.
 * - `client.auth.admin.*` with any key other than the service-role key fails
 *   with `403 User not allowed` (only a service_role/secret key may call it).
 * - Table reads with any key other than the service-role key return what RLS
 *   gives a restricted PostgREST role on the RLS-protected prototype tables:
 *   zero rows, count 0, no error.
 *
 * Read chains supported: `client.from(table)` / `client.schema(name).from(table)`
 * (`select`, `not(col, "is", null)`, `eq`, `order`, `limit`, `range`,
 * `single`, `maybeSingle`, ...) resolving to `{ data, count, error }`;
 * `client.auth.admin.listUsers()`; `client.storage.listBuckets()` /
 * `client.storage.from(bucket).list()`. Every write method (insert/update/
 * upsert/delete/rpc, storage upload/remove/move/copy, bucket and user writes)
 * records itself and throws.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** The only key the fake treats as service_role (never passed by these tests to the gate as a read credential). */
export const FAKE_SERVICE_ROLE_KEY = [
  "acceptance",
  "2067",
  "fake",
  "service",
  "role",
  "key",
].join("-");

const CONFIG_TOML = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../supabase/config.toml",
);

/** `[api] schemas` from the committed supabase/config.toml. */
export function committedExposedSchemas(): string[] {
  const text = readFileSync(CONFIG_TOML, "utf8");
  const api = /^\[api\]\s*$([\s\S]*?)(?=^\[)/m.exec(text)?.[1] ?? "";
  const list = /^\s*schemas\s*=\s*\[([^\]]*)\]/m.exec(api)?.[1];
  if (list === undefined) {
    throw new Error(
      "#2067 acceptance: supabase/config.toml has no [api] schemas list",
    );
  }
  return [...list.matchAll(/"([^"]+)"/g)].map((match) => match[1] as string);
}

const EXPOSED_SCHEMAS = new Set(committedExposedSchemas());

export type FakeMode =
  "happy" | "permission_denied" | "unavailable" | "unknown_shape";

type Row = Record<string, unknown>;

export const fakeDb = {
  mode: "happy" as FakeMode,
  /** Applied schema version the target DB reports; null => unreadable. */
  schemaVersion: null as string | null,
  tableRows: new Map<string, Row[]>(),
  users: [] as Row[],
  clients: [] as Array<{ url: string; key: string }>,
  writes: [] as string[],
  reads: [] as string[],
  reset(): void {
    this.mode = "happy";
    this.schemaVersion = null;
    this.tableRows = new Map();
    this.users = [];
    this.clients = [];
    this.writes = [];
    this.reads = [];
  },
};

const WRITE_METHODS = new Set([
  "insert",
  "update",
  "upsert",
  "delete",
  "rpc",
  "upload",
  "remove",
  "move",
  "copy",
  "createBucket",
  "updateBucket",
  "deleteBucket",
  "emptyBucket",
  "createSignedUploadUrl",
  "uploadToSignedUrl",
  "createUser",
  "updateUserById",
  "deleteUser",
  "inviteUserByEmail",
  "generateLink",
]);

function writeSpy(trail: string, method: string) {
  return (..._args: unknown[]) => {
    fakeDb.writes.push(`${trail}.${method}`);
    throw new Error(`#2067 acceptance: forbidden write ${trail}.${method}`);
  };
}

function failureResult() {
  switch (fakeDb.mode) {
    case "permission_denied":
      return {
        data: null,
        count: null,
        error: {
          message: "permission denied for relation (acceptance fake)",
          code: "42501",
        },
        status: 403,
      };
    case "unavailable":
      return {
        data: null,
        count: null,
        error: {
          message: "fetch failed: connect ECONNREFUSED (acceptance fake)",
          code: "",
        },
        status: 0,
      };
    case "unknown_shape":
      return {
        data: { unexpected: "shape" },
        count: null,
        error: null,
        status: 200,
      };
    default:
      return undefined;
  }
}

interface QueryContext {
  key: string;
  schema?: string;
  table: string;
  head: boolean;
  single: boolean;
  notNull: string[];
}

function respond(ctx: QueryContext) {
  fakeDb.reads.push(`${ctx.schema ? `${ctx.schema}.` : ""}${ctx.table}`);
  if (ctx.schema !== undefined && !EXPOSED_SCHEMAS.has(ctx.schema)) {
    return {
      data: null,
      count: null,
      error: {
        message: `The schema must be one of the following: ${[...EXPOSED_SCHEMAS].join(", ")}`,
        code: "PGRST106",
      },
      status: 406,
    };
  }
  const failure = failureResult();
  if (failure) return failure;
  if (ctx.key !== FAKE_SERVICE_ROLE_KEY) {
    // RLS on the prototype tables filters every row for a restricted role.
    return {
      data: ctx.single ? null : ctx.head ? null : [],
      count: 0,
      error: null,
      status: 200,
    };
  }

  const isMigrations =
    /migrations/i.test(ctx.table) || /migrations/i.test(ctx.schema ?? "");
  let rows: Row[];
  if (isMigrations) {
    if (fakeDb.schemaVersion === null) {
      return {
        data: null,
        count: null,
        error: {
          message: `relation "${ctx.table}" does not exist (acceptance fake)`,
          code: "42P01",
        },
        status: 404,
      };
    }
    rows = [{ version: fakeDb.schemaVersion, name: "acceptance" }];
  } else {
    rows = fakeDb.tableRows.get(ctx.table) ?? [];
  }
  for (const column of ctx.notNull) {
    rows = rows.filter(
      (row) => row[column] !== null && row[column] !== undefined,
    );
  }
  const count = rows.length;
  if (ctx.single) {
    return { data: rows[0] ?? null, count, error: null, status: 200 };
  }
  return {
    data: ctx.head ? null : rows.map((row) => ({ ...row })),
    count,
    error: null,
    status: 200,
  };
}

function queryBuilder(ctx: QueryContext): unknown {
  const builder: unknown = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "then") {
          return (
            resolve: (value: unknown) => unknown,
            reject: (error: unknown) => unknown,
          ) => Promise.resolve(respond(ctx)).then(resolve, reject);
        }
        if (typeof prop === "symbol") return undefined;
        if (WRITE_METHODS.has(prop)) return writeSpy(ctx.table, prop);
        if (prop === "select") {
          return (_columns?: string, options?: { head?: boolean }) =>
            queryBuilder({ ...ctx, head: options?.head === true });
        }
        if (prop === "not") {
          return (column: string, operator: string, value: unknown) =>
            queryBuilder(
              operator === "is" && value === null
                ? { ...ctx, notNull: [...ctx.notNull, column] }
                : ctx,
            );
        }
        if (prop === "single" || prop === "maybeSingle") {
          return () => queryBuilder({ ...ctx, single: true });
        }
        // eq, neq, is, in, order, limit, range, filter, match, ...
        return (..._args: unknown[]) => builder;
      },
    },
  );
  return builder;
}

function storageResult(data: unknown) {
  const failure = failureResult();
  if (failure) {
    return failure.error
      ? { data: null, error: failure.error }
      : { data: failure.data, error: null };
  }
  return { data, error: null };
}

export function makeFakeClient(key = ""): Record<string, unknown> {
  const from = (schema?: string) => (table: string) =>
    queryBuilder({
      key,
      schema,
      table,
      head: false,
      single: false,
      notNull: [],
    });
  const bucket = (name: string) => {
    const api: Record<string, unknown> = {
      list: async () => storageResult([]),
    };
    for (const method of WRITE_METHODS) {
      api[method] = writeSpy(`storage.${name}`, method);
    }
    return api;
  };
  const storage: Record<string, unknown> = {
    listBuckets: async () => storageResult([]),
    from: bucket,
  };
  for (const method of WRITE_METHODS) {
    storage[method] = writeSpy("storage", method);
  }
  const admin: Record<string, unknown> = {
    listUsers: async () => {
      fakeDb.reads.push("auth.admin.listUsers");
      if (key !== FAKE_SERVICE_ROLE_KEY) {
        return {
          data: { users: [] },
          error: {
            message: "User not allowed",
            status: 403,
            code: "not_admin",
          },
        };
      }
      const failure = failureResult();
      if (failure) {
        return failure.error
          ? { data: { users: [] }, error: failure.error }
          : { data: failure.data, error: null };
      }
      return {
        data: { users: fakeDb.users.map((user) => ({ ...user })) },
        error: null,
      };
    },
  };
  for (const method of WRITE_METHODS) {
    admin[method] = writeSpy("auth.admin", method);
  }
  return {
    from: from(),
    schema: (name: string) => ({
      from: from(name),
      rpc: writeSpy(`schema.${name}`, "rpc"),
    }),
    rpc: writeSpy("client", "rpc"),
    storage,
    auth: { admin },
  };
}

export function mockSupabaseModule(actual: unknown): Record<string, unknown> {
  return {
    ...(actual as Record<string, unknown>),
    createClient: (url: string, key: string) => {
      fakeDb.clients.push({ url, key });
      return makeFakeClient(key);
    },
  };
}
