# Platform operators

A platform operator is a person who may run platform commands: the commands that cross organizations or act before one exists (plan 5.4 of [the CRM, CMS and database plan](../audits/core-crm-cms-database-target-architecture.md)). Operators are a list, not a membership role. AL-2675 (WP2c) builds the list and the check; WP3 and WP10 add the commands that use it.

## The list and the check

- The list is `authz.platform_operators`. Row security is forced, it has no policy, and signed-in, anonymous and service users hold no privilege on it. Only its owner reads it, inside the database functions below.
- Every platform command starts with one shared check, `platform.require_operator()`. It refuses a request with no signed-in caller, a caller who is not on the list, and a session that did not pass a second factor (the token's `aal` claim is not `aal2`). It reads the caller and the claims through the guard's helpers and names nothing in `auth` ([tenant guard, "Platform commands"](../security/tenant-guard.md#platform-commands)).
- `public.platform_operator_session()` runs the shared check alone and returns the operator's login id. Server code that acts for an operator outside the database calls it on the operator's own token first: the assistant runtime's platform gates (`withOperation({ platformOperator: true })`, and `isPlatformOperator()` in the handler context), and later the operator area and the Auth admin module (plan 5.5).
- `public.caller_is_platform_operator()` answers whether the signed-in caller is on the list. It never raises and does not ask for the second factor. The admin proxy uses it to admit the operator area (WP2c, part 2).
- The second factor is TOTP, switched on in `supabase/config.toml` (`[auth.mfa.totp]`). An operator enrols a factor and passes the challenge in the operator area (WP2c, part 2).

## Adding or removing an operator

The list has one writer: `scripts/platform/operators.mjs`, which the release job's owner runs. There is no platform command, wrapper or screen for managing operators.

```bash
node scripts/platform/operators.mjs add    --user <login id or email> --actor "<your name>" --reason "<why>"
node scripts/platform/operators.mjs remove --user <login id or email> --actor "<your name>" --reason "<why>"
node scripts/platform/operators.mjs list
```

It reads two environment variables. Their values never print.

| Variable                         | What                                                                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `OPERATORS_DATABASE_URL`         | The database's `postgres` connection: a local database, or a hosted project's (session pooler or direct, `sslmode=require` or stronger)   |
| `OPERATORS_SUPABASE_PROJECT_REF` | Only for a hosted address: the project the address must name. The script refuses an address that does not name this project as `postgres` |

It connects as the release job does ([release job](release-job.md)): a hosted address passes the release job's one address check, `assertDatabaseTarget`, and anything else must be on this machine (`isLoopbackDatabaseUrl`). `psql` starts through the shared runner (`scripts/lib/psql.mjs`), and the person, the actor and the reason reach it as environment variables, never in its arguments or the SQL text.

What it does, in one transaction that locks the list against any other run:

- `add` puts the login on the list. `remove` takes it off.
- Each change writes one row in `audit_logs` with no tenant: `action` is `platform_operator_added` or `platform_operator_removed`, `resource_id` is the login id, and `details` names the actor and the reason.
- Running either again changes nothing, writes nothing, and says so (`"changed": false`).
- `remove` refuses to take the last operator off the list. Add the new operator first.
- A login on the list cannot be deleted from Auth until it is removed.

It prints one JSON line: the action, the login id, whether the list changed and how many operators it now holds. `list` prints the list as JSON.

## Proofs

- `tests/unit/acceptance/issue-2675/platform-operators.realstack.acceptance.test.ts` and `platform-operator-script.realstack.acceptance.test.ts` run in CI's `migrate` job, on a plain Postgres: the list's privileges, the read function, the shared check by the request's assurance claim, and the script.
- `node scripts/e2e/run-operator-mfa.mjs` proves the second factor on a running local Supabase stack, which CI's `migrate` job does not have: a password session at `aal1` is refused by the shared check, and passes after the operator enrols a TOTP factor and passes the challenge through the Auth API. It reads the stack from `supabase status` (set `OPERATOR_MFA_SUPABASE_WORKDIR` for a stack started with `--workdir`) and fails, never skips, when it cannot. The Local Supabase Stack workflow (`.github/workflows/local-supabase.yml`) runs it.

## Owner steps for a hosted project

Each is the owner's, by hand, once per hosted project, and none runs in CI:

1. Switch on TOTP enrolment and verification in the project's Auth settings (Authentication, Multi-Factor). The repository's `supabase/config.toml` switches them on for local stacks only; `supabase config push` is not part of any job.
2. Add the first operator: the owner's own login, with the project's `postgres` connection in `OPERATORS_DATABASE_URL` and its ref in `OPERATORS_SUPABASE_PROJECT_REF`.
3. Sign in as that operator and enrol a TOTP factor (the operator area, WP2c part 2). Until then every platform command refuses the operator for want of the second factor.
