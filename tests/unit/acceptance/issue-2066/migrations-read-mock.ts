/**
 * Read-only fake Supabase client for the #2066 `--verify` fixtures.
 *
 * Ruling (Samson, option A, #2067): spec rev 2 §2 makes `--verify` compare the
 * proof's schemaVersion with the target DB's
 * `supabase_migrations.schema_migrations` and fail closed when it cannot read
 * it. The #2066 `--verify` tests therefore need a target that reports the
 * proof's version. This fake serves exactly that, read-only:
 *
 * - any read chain that went through `.schema(<name>)` or `.from(<name>)` with
 *   a name containing "migrations" resolves to `[{ version }]` (or
 *   `{ version }` after `.single()` / `.maybeSingle()`);
 * - every other read chain resolves to an empty, successful result;
 * - every write method (`SUPABASE_WRITE_METHODS`, which includes `rpc`) calls
 *   `onWrite` and throws, on every chain, migrations chains included. The
 *   version is never served through `rpc`.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

export const SUPABASE_WRITE_METHODS: ReadonlySet<string> = new Set([
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
]);

export interface ReadOnlyClientOptions {
  /** Version the migrations table reports; `null` serves no migrations rows. */
  migrationsVersion: () => string | null;
  /** Called with `<trail>.<method>` before a write method throws. */
  onWrite: (call: string) => void;
  /** Prefix of the thrown error message. */
  writeErrorPrefix: string;
}

interface ChainState {
  migrations: boolean;
  single: boolean;
}

function readResult(state: ChainState, options: ReadOnlyClientOptions) {
  const version = state.migrations ? options.migrationsVersion() : null;
  if (version === null) {
    return { data: [], count: 0, error: null, status: 200 };
  }
  const row = { version };
  return {
    data: state.single ? row : [row],
    count: 1,
    error: null,
    status: 200,
  };
}

export function readOnlySupabaseClient(
  options: ReadOnlyClientOptions,
): unknown {
  const makeProxy = (
    trail: string,
    state: ChainState,
    lastProp?: string,
  ): unknown =>
    new Proxy(function fakeSupabase() {}, {
      get(_target, prop) {
        if (prop === "then") {
          return (resolve: (value: unknown) => void) =>
            resolve(readResult(state, options));
        }
        if (typeof prop === "symbol") return undefined;
        if (SUPABASE_WRITE_METHODS.has(prop)) {
          return (..._args: unknown[]) => {
            options.onWrite(`${trail}.${prop}`);
            throw new Error(`${options.writeErrorPrefix}: ${trail}.${prop}`);
          };
        }
        return makeProxy(`${trail}.${prop}`, state, prop);
      },
      apply(_target, _thisArg, args: unknown[]) {
        const name = typeof args[0] === "string" ? args[0] : "";
        const next: ChainState = {
          migrations:
            state.migrations ||
            ((lastProp === "schema" || lastProp === "from") &&
              /migrations/i.test(name)),
          single:
            state.single || lastProp === "single" || lastProp === "maybeSingle",
        };
        return makeProxy(`${trail}()`, next);
      },
    });
  return makeProxy("client", { migrations: false, single: false });
}
