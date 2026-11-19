#!/usr/bin/env node
// The platform operator list's one writer (AL-2675, WP2c; plan 5.4): the
// release job's owner adds or removes a platform operator with it. There is no
// platform command, wrapper or screen for managing operators.
//
//   node scripts/platform/operators.mjs add    --user <login id or email> --actor <who runs this> --reason <why>
//   node scripts/platform/operators.mjs remove --user <login id or email> --actor <who runs this> --reason <why>
//   node scripts/platform/operators.mjs list
//
// Inputs are environment variables (names only; values never print):
//   OPERATORS_DATABASE_URL          the database's `postgres` connection: a
//                                   local database, or a hosted project's
//                                   (session pooler or direct, sslmode=require)
//   OPERATORS_SUPABASE_PROJECT_REF  for a hosted address only: the project the
//                                   address must name, checked by the release
//                                   job's one address check before anything
//                                   connects
//
// What it does, in one transaction that locks the list against a concurrent
// run: `add` puts the login on the list and `remove` takes it off, each only
// when that changes the list, and each change writes one row in `audit_logs`
// with no tenant that names the acting person and the reason. Running either
// again changes nothing and writes nothing, and says so. `remove` refuses to
// take the last operator off the list. `list` prints the list.
//
// It connects as the release job does (docs/ops/release-job.md): a hosted
// address passes `assertDatabaseTarget` (scripts/release/lib/database-target.mjs)
// for the `postgres` role of the named project, and anything else must be on
// this machine (`isLoopbackDatabaseUrl`). psql starts only through the shared
// runner (scripts/lib/psql.mjs), which drops every ambient PG* setting and
// passes the password in PGPASSWORD. The user, the actor and the reason reach
// psql as environment variables read with \getenv, so they appear neither in
// the argument list nor in the SQL text. Output: one JSON line on standard
// output, the result; psql's error on standard error and a non-zero exit when
// the database refuses.
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isLoopbackDatabaseUrl, spawnPsql } from "../lib/psql.mjs";
import { assertDatabaseTarget } from "../release/lib/database-target.mjs";

export const ACTIONS = Object.freeze(["add", "remove", "list"]);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+$/;
const MAX_TEXT = 500;

/** The environment variables psql reads the inputs from (\getenv). */
export const PSQL_INPUTS = Object.freeze({
  userId: "PLATFORM_OPERATOR_USER_ID",
  email: "PLATFORM_OPERATOR_EMAIL",
  actor: "PLATFORM_OPERATOR_ACTOR",
  reason: "PLATFORM_OPERATOR_REASON",
});

const USAGE =
  "usage: node scripts/platform/operators.mjs add|remove --user <login id or email> --actor <who runs this> --reason <why>\n" +
  "       node scripts/platform/operators.mjs list";

function text(value, name) {
  const v = String(value ?? "").trim();
  if (!v) throw new Error(`--${name} is required and may not be blank.`);
  if (v.length > MAX_TEXT)
    throw new Error(`--${name} is longer than ${MAX_TEXT} characters.`);
  // A control character would only hide what the audit row says.
  if (/\p{Cc}/u.test(v))
    throw new Error(`--${name} may not contain control characters.`);
  return v;
}

/**
 * The action and its inputs from the command line. Throws a usage error.
 * `--user` is a login id (UUID) or an email address.
 */
export function parseArguments(argv) {
  const [action, ...rest] = argv;
  if (!ACTIONS.includes(action)) throw new Error(USAGE);
  const flags = {};
  for (let i = 0; i < rest.length; i += 1) {
    const flag = /^--(user|actor|reason)$/.exec(rest[i] ?? "")?.[1];
    if (!flag || i + 1 >= rest.length) throw new Error(USAGE);
    if (flag in flags) throw new Error(`--${flag} is given twice.`);
    flags[flag] = rest[i + 1];
    i += 1;
  }
  if (action === "list") {
    if (Object.keys(flags).length > 0) throw new Error(USAGE);
    return { action };
  }
  const user = text(flags.user, "user");
  let target;
  if (UUID.test(user)) target = { userId: user.toLowerCase() };
  else if (EMAIL.test(user)) target = { email: user.toLowerCase() };
  else throw new Error("--user must be a login id (UUID) or an email address.");
  return {
    action,
    ...target,
    actor: text(flags.actor, "actor"),
    reason: text(flags.reason, "reason"),
  };
}

/**
 * The database URL the script may connect to, after the one address check.
 * A local database passes `isLoopbackDatabaseUrl`; anything else must address
 * `OPERATORS_SUPABASE_PROJECT_REF` as `postgres`, with sslmode=require or
 * stronger, as the release job requires. Errors never repeat the URL.
 */
export function admitDatabase(env = process.env) {
  const databaseUrl = env.OPERATORS_DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error("OPERATORS_DATABASE_URL is not set.");
  if (isLoopbackDatabaseUrl(databaseUrl)) return databaseUrl;
  const projectRef = env.OPERATORS_SUPABASE_PROJECT_REF?.trim();
  if (!projectRef)
    throw new Error(
      "OPERATORS_DATABASE_URL is not on this machine; set OPERATORS_SUPABASE_PROJECT_REF to the hosted project it must address.",
    );
  assertDatabaseTarget({ databaseUrl, projectRef, role: "postgres" });
  return databaseUrl;
}

/** psql statements that put the matching login's id in `asym.operator_user`, or refuse. */
const FIND_USER = `\\getenv op_user_id ${PSQL_INPUTS.userId}
\\getenv op_email ${PSQL_INPUTS.email}
SELECT pg_catalog.set_config('asym.operator_user_id', :'op_user_id', true) AS user_id_set,
       pg_catalog.set_config('asym.operator_email', :'op_email', true) AS email_set \\gset ignored_
DO $find$
DECLARE
  v_user_id TEXT := NULLIF(pg_catalog.current_setting('asym.operator_user_id'), '');
  v_email TEXT := NULLIF(pg_catalog.current_setting('asym.operator_email'), '');
  v_found UUID[];
BEGIN
  SELECT pg_catalog.array_agg(u.id ORDER BY u.id)
    INTO v_found
    FROM auth.users AS u
   WHERE (v_user_id IS NOT NULL AND u.id = v_user_id::UUID)
      OR (v_email IS NOT NULL AND pg_catalog.lower(u.email) = v_email);
  IF v_found IS NULL THEN
    RAISE EXCEPTION 'operators: no login matches the given user' USING ERRCODE = 'P0002';
  END IF;
  IF pg_catalog.cardinality(v_found) > 1 THEN
    RAISE EXCEPTION 'operators: more than one login has that email; give the login id' USING ERRCODE = '21000';
  END IF;
  PERFORM pg_catalog.set_config('asym.operator_user', v_found[1]::TEXT, true);
END
$find$;
`;

const READ_ACTOR = `\\getenv op_actor ${PSQL_INPUTS.actor}
\\getenv op_reason ${PSQL_INPUTS.reason}
SELECT pg_catalog.set_config('asym.operator_actor', :'op_actor', true) AS actor_set,
       pg_catalog.set_config('asym.operator_reason', :'op_reason', true) AS reason_set \\gset ignored_
`;

// SHARE ROW EXCLUSIVE conflicts with itself and with every write, so two runs
// of the script, or a run and any other writer, take turns: the count that
// decides "the last operator" cannot change underneath it.
const LOCK = `SET LOCAL lock_timeout = '30s';
LOCK TABLE authz.platform_operators IN SHARE ROW EXCLUSIVE MODE;
`;

const ADD = `DO $add$
DECLARE
  v_user UUID := pg_catalog.current_setting('asym.operator_user')::UUID;
  v_actor TEXT := pg_catalog.current_setting('asym.operator_actor');
  v_reason TEXT := pg_catalog.current_setting('asym.operator_reason');
  v_changed BOOLEAN;
BEGIN
  INSERT INTO authz.platform_operators (user_id, added_by, reason)
  VALUES (v_user, v_actor, v_reason)
  ON CONFLICT (user_id) DO NOTHING;
  v_changed := FOUND;
  IF v_changed THEN
    INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
    VALUES (NULL, NULL, 'platform_operator_added', 'platform_operator', v_user::TEXT,
            pg_catalog.jsonb_build_object('actor', v_actor, 'reason', v_reason));
  END IF;
  PERFORM pg_catalog.set_config('asym.operator_changed', v_changed::TEXT, true);
END
$add$;
`;

const REMOVE = `DO $remove$
DECLARE
  v_user UUID := pg_catalog.current_setting('asym.operator_user')::UUID;
  v_actor TEXT := pg_catalog.current_setting('asym.operator_actor');
  v_reason TEXT := pg_catalog.current_setting('asym.operator_reason');
  v_changed BOOLEAN := false;
BEGIN
  IF EXISTS (SELECT 1 FROM authz.platform_operators AS o WHERE o.user_id = v_user) THEN
    IF NOT EXISTS (SELECT 1 FROM authz.platform_operators AS o WHERE o.user_id <> v_user) THEN
      RAISE EXCEPTION 'operators: that login is the last platform operator; add another operator before removing it'
        USING ERRCODE = '42501';
    END IF;
    DELETE FROM authz.platform_operators AS o WHERE o.user_id = v_user;
    v_changed := true;
    INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
    VALUES (NULL, NULL, 'platform_operator_removed', 'platform_operator', v_user::TEXT,
            pg_catalog.jsonb_build_object('actor', v_actor, 'reason', v_reason));
  END IF;
  PERFORM pg_catalog.set_config('asym.operator_changed', v_changed::TEXT, true);
END
$remove$;
`;

const RESULT = (action) => `SELECT pg_catalog.jsonb_build_object(
  'action', '${action}',
  'user_id', pg_catalog.current_setting('asym.operator_user'),
  'changed', pg_catalog.current_setting('asym.operator_changed')::BOOLEAN,
  'operators', (SELECT pg_catalog.count(*) FROM authz.platform_operators)
)::TEXT;
`;

const LIST = `SELECT COALESCE(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
  'user_id', o.user_id, 'email', u.email, 'added_at', o.added_at,
  'added_by', o.added_by, 'reason', o.reason) ORDER BY o.added_at, o.user_id), '[]'::JSONB)::TEXT
  FROM authz.platform_operators AS o
  LEFT JOIN auth.users AS u ON u.id = o.user_id;
`;

/**
 * The statements of one action, without the transaction around them, which
 * `operatorScript` adds. A test runs them inside a transaction it rolls back.
 */
export function operatorStatements(action) {
  if (action === "list") return LIST;
  if (action === "add")
    return FIND_USER + READ_ACTOR + LOCK + ADD + RESULT(action);
  if (action === "remove")
    return FIND_USER + READ_ACTOR + LOCK + REMOVE + RESULT(action);
  throw new Error(USAGE);
}

/** The whole psql input for one action: one transaction. */
export function operatorScript(action) {
  return `BEGIN;\n${operatorStatements(action)}COMMIT;\n`;
}

/** The environment psql reads the inputs from. */
export function psqlInputs(parsed) {
  if (parsed.action === "list") return {};
  return {
    [PSQL_INPUTS.userId]: parsed.userId ?? "",
    [PSQL_INPUTS.email]: parsed.email ?? "",
    [PSQL_INPUTS.actor]: parsed.actor,
    [PSQL_INPUTS.reason]: parsed.reason,
  };
}

/** The psql arguments after the connection: quiet, unaligned, stop on error, SQL on stdin. */
export const PSQL_ARGS = Object.freeze([
  "-X",
  "-q",
  "-A",
  "-t",
  "-v",
  "ON_ERROR_STOP=1",
  "-f",
  "-",
]);

export function main(argv = process.argv.slice(2), env = process.env) {
  let parsed;
  let databaseUrl;
  try {
    parsed = parseArguments(argv);
    databaseUrl = admitDatabase(env);
  } catch (error) {
    console.error(`error: ${error instanceof Error ? error.message : error}`);
    return 2;
  }
  const result = spawnPsql({
    databaseUrl,
    args: [...PSQL_ARGS],
    input: operatorScript(parsed.action),
    baseEnv: { ...env, ...psqlInputs(parsed) },
    psqlBin: env.PSQL_BIN?.trim() || "psql",
  });
  if (result.error) {
    console.error(`error: could not run psql (${result.error.message}).`);
    return 1;
  }
  return result.status ?? 1;
}

const invokedDirectly =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) process.exit(main());
