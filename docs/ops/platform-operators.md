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

In the target project's dashboard, open **Authentication → Users**, search for the person's exact email, and copy the existing user's ID. The script does not create a login. From a Bash shell in the repository, run this sequence. At the hidden prompt paste the complete connection URL described below; do not put it in shell history, a file, or the audit reason.

```bash
(
  set -e
  set +x
  cd "$(git rev-parse --show-toplevel)"
  read -rsp 'Database connection URL: ' OPERATORS_DATABASE_URL; printf '\n'
  read -rp 'Expected project ref (empty for local): ' OPERATORS_SUPABASE_PROJECT_REF
  export OPERATORS_DATABASE_URL OPERATORS_SUPABASE_PROJECT_REF
  read -rp 'Existing Auth user ID: ' login
  read -rp 'Your name: ' actor
  read -rp 'Reason for adding this operator: ' reason
  node scripts/platform/operators.mjs add --user "$login" --actor "$actor" --reason "$reason"
  node scripts/platform/operators.mjs list
)
```

For removal, use `remove` instead of `add`, with the reason for removal. The subshell discards the variables when it exits.

Install `psql` 16 or later on the machine running the script. It reads two environment variables. Their values never print.

| Variable                         | What                                                                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `OPERATORS_DATABASE_URL`         | The local `postgres` connection, or the hosted session pooler with `sslmode=verify-full` and the project's CA file                        |
| `OPERATORS_SUPABASE_PROJECT_REF` | Only for a hosted address: the project the address must name. The script refuses an address that does not name this project as `postgres` |

It connects as the release job does ([release job](release-job.md)): a hosted address passes the release job's one address check, `assertDatabaseTarget`, and anything else must be on this machine (`isLoopbackDatabaseUrl`). `psql` starts through the shared runner (`scripts/lib/psql.mjs`), and the person, the actor and the reason reach it as environment variables, never in its arguments or the SQL text.

For a hosted project, copy its **session pooler** address from Connect and use the CA certificate downloaded from Database Settings. The URL has this shape: `postgresql://postgres.PROJECT_REF:PASSWORD@POOLER_HOST:5432/postgres?sslmode=verify-full&sslrootcert=/absolute/path/to/project-ca.crt`. Use placeholders only in documentation. The default direct host is IPv6-only; the pooler works over IPv4 without buying the IPv4 add-on. Do not enable paid add-ons for this procedure. TOTP is included; leave phone factors off.

Each writer locks the list against other writers in its transaction; `list` reads without taking that lock:

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
3. **Not available in part 1:** sign in and enrol a TOTP factor once part 2 ships the operator area. Until then the product has no hosted enrolment screen; adding a login does not raise its session to `aal2`. Every platform gate stays closed to that session.

## Recovery

For a lost device, remove the lost factor from the user's Auth dashboard page or through the Auth admin API. The operator must enrol and verify a replacement; removing a factor does not satisfy the gate. If the last operator is locked out or compromised, the release owner first adds a trusted replacement with the database script, which does not need an MFA session. Then remove the old operator before deleting the login from Auth.
