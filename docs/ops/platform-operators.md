# Platform operators

A platform operator is a person who may run platform commands: the commands that cross organizations or act before one exists (plan 5.4 of [the CRM, CMS and database plan](../audits/core-crm-cms-database-target-architecture.md)). Operators are a list, not a membership role. AL-2675 (WP2c) builds the list and the check; WP3 and WP10 add the commands that use it.

## The list and the check

- The list is `authz.platform_operators`. Row security is forced, it has no policy, and signed-in, anonymous and service users hold no privilege on it. Only its owner reads it, inside the database functions below.
- Every platform command starts with one shared check, `platform.require_operator()`. It refuses a request with no signed-in caller, a caller who is not on the list, and a session that did not pass a second factor (the token's `aal` claim is not `aal2`). It reads the caller and the claims through the guard's helpers and names nothing in `auth` ([tenant guard, "Platform commands"](../security/tenant-guard.md#platform-commands)).
- `public.platform_operator_session()` runs the shared check alone and returns the operator's login id. Server code that acts for an operator outside the database calls it on the operator's own token first: the assistant runtime's platform gates (`withPlatformOperation(…, { platformOperator: true })`, and `isPlatformOperator()` in the handler context), and later the Auth admin module (plan 5.5). The operator area calls it from the browser, on the operator's own token, and shows the area as verified only when it returns the operator's own id.
- `public.caller_is_platform_operator()` answers whether the signed-in caller is on the list. It never raises and does not ask for the second factor. The admin proxy and the operator page both use it to admit the operator area (`/operator`, WP2c part 2a): the proxy before the page renders, the page again before it renders anything.
- The second factor is TOTP, switched on in `supabase/config.toml` (`[auth.mfa.totp]`). An operator enrols a factor and passes the challenge in the operator area (WP2c, part 2).
- Two platform commands read for operators and write nothing (WP2c rest, `20261127035000`). `public.tenant_operators(uuid)` lists the platform operators who hold a live row in an organization, the people the assistant runtime's launch-permission grant accepts there; the launch-readiness settings' picker asks it through `GET /api/admin/eve/launch-readiness/operators`, on the caller's token, for an administrator of that organization who passes the shared check and holds a live staff row there, and only for the request's own organization while it is active. `public.platform_eve_history(integer)` returns the assistant runtime's changes recorded with no organization (a global kill switch or model-policy change), whoever made them, and never a row of an organization; the operator area shows them once the session is confirmed. Both refuse at the next call a person taken off the list.

## Adding or removing an operator

The list has one writer: `scripts/platform/operators.mjs`, which the release job's owner runs. There is no platform command, wrapper or screen for managing operators.

In the target project's dashboard, open **Authentication → Users**, search for the person's exact email, and copy the existing user's ID. The login must already exist in Auth; the script returns `P0002` if it cannot find it. From a Bash shell in the repository, run this sequence. At the hidden prompt paste the complete connection URL described below; do not put it in shell history, a file, or the audit reason.

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

For reference only, this is the shell form of a hosted URL with **dummy values**:

```bash
OPERATORS_DATABASE_URL='postgresql://postgres.PROJECT_REF:pa%40ss%23word@POOLER_HOST:5432/postgres?sslmode=verify-full&sslrootcert=/absolute/path/project-ca.crt'
```

Single quotes protect `&` from the shell. The password belongs in the URL: the script starts `psql` with `--no-password`, so a URL without one fails at once instead of waiting for a prompt. Percent-encode password characters inside the URL (`@` → `%40`, `#` → `%23`). At the hidden prompt paste the actual URL **without surrounding quotes**. Use the absolute path of a readable PEM file containing the project's one valid CA certificate from Database settings; `sslrootcert=system` is refused.

For removal, use `remove` instead of `add`, with the reason for removal. The subshell discards the variables when it exits.

Install `psql` 16 or later on the machine running the script. It reads two environment variables. Their values never print.

| Variable                         | What                                                                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `OPERATORS_DATABASE_URL`         | The local `postgres` connection, or the hosted session pooler with `sslmode=verify-full` and the project's CA file                        |
| `OPERATORS_SUPABASE_PROJECT_REF` | Only for a hosted address: the project the address must name. The script refuses an address that does not name this project as `postgres` |

It connects as the release job does ([release job](release-job.md)): a hosted address passes the release job's one address check, `assertDatabaseTarget`, and anything else must be on this machine (`isLoopbackDatabaseUrl`). `psql` starts through the shared runner (`scripts/lib/psql.mjs`), and the person, the actor and the reason reach it as environment variables, never in its arguments or the SQL text.

The hosted URL itself must contain exactly one `sslmode=verify-full` and `sslrootcert` pointing to the readable project CA file. `sslmode=require`, repeated modes and ambient TLS settings do not satisfy this rule. For a hosted project, copy its **session pooler** address from Connect and use the CA certificate downloaded from Database Settings. The URL has this shape: `postgresql://postgres.PROJECT_REF:PASSWORD@POOLER_HOST:5432/postgres?sslmode=verify-full&sslrootcert=/absolute/path/to/project-ca.crt`. Use placeholders only in documentation. The default direct host is IPv6-only; the pooler works over IPv4 without buying the IPv4 add-on. Do not enable paid add-ons for this procedure. TOTP is included; leave phone factors off.

Each writer locks the list against other writers in its transaction; `list` reads without taking that lock:

- `add` puts the login on the list. `remove` takes it off.
- Each change writes one row in `audit_logs` with no tenant: `action` is `platform_operator_added` or `platform_operator_removed`, `resource_id` is the login id, and `details` names the actor and the reason.
- Running either again changes nothing, writes nothing, and says so (`"changed": false`).
- `remove` refuses to take the last operator off the list. Add the new operator first.

After adding an operator, check the person's memberships in every organization: a role change that committed before the addition stands, and from the addition on no tenant administrator can change or revoke that person's rows.

- A login on the list cannot be deleted from Auth until it is removed.

It prints one JSON line: the action, the login id, whether the list changed and how many operators it now holds. `list` prints the list as JSON.

## Proofs

- `tests/unit/acceptance/issue-2675/platform-operators.realstack.acceptance.test.ts` and `platform-operator-script.realstack.acceptance.test.ts` run in CI's `migrate` job, on a plain Postgres: the list's privileges, the read function, the shared check by the request's assurance claim, and the script.
- `tests/unit/acceptance/issue-2675/operator-reads.realstack.acceptance.test.ts` runs there too: the picker's list and the history with no organization, by the request's claims and headers, and their refusals.
- `node scripts/e2e/run-operator-mfa.mjs` proves the second factor on a running local Supabase stack, which CI's `migrate` job does not have: a password session at `aal1` is refused by the shared check, and passes after the operator enrols a TOTP factor and passes the challenge through the Auth API. With those real `aal1` and `aal2` sessions it also calls the two operator reads through the Data API, and their refusals. It reads the stack from `supabase status` (set `OPERATOR_MFA_SUPABASE_WORKDIR` for a stack started with `--workdir`) and fails, never skips, when it cannot. The Local Supabase Stack workflow (`.github/workflows/local-supabase.yml`) runs it.

## Owner steps for a hosted project

Each is the owner's, by hand, once per hosted project, and none runs in CI:

1. Switch on TOTP enrolment and verification in the project's Auth settings (Authentication, Multi-Factor). The repository's `supabase/config.toml` switches them on for local stacks only; `supabase config push` is not part of any job.
2. Add the first operator: the owner's own login, with the project's `postgres` connection in `OPERATORS_DATABASE_URL` and its ref in `OPERATORS_SUPABASE_PROJECT_REF`. While `CORE_SERVE_UNDER_PATHS=1`, add a person to the list only when they can enrol at once: this step waits with step 3, so that no operator is on the list without a verified factor.
3. Sign in on the operations address at `/operator`, set up an authenticator and pass the challenge. The area then says the session is verified with a second factor; until then every platform gate stays closed to that session. Do this at once after step 2: between adding a person to the list and their first enrolment, their password alone is enough to enrol. While `CORE_SERVE_UNDER_PATHS=1`, sign in at `/admin/login` on the operations address: there only sign-in, its callback, sign-out, the staff project's explicit list and `/admin/operator` answer without a front header, and every sign-in lands on `/admin/operator`, whatever `next` says ([ADR 0018](../../packages/auth/docs/adr/0018-operator-area-admission-and-mfa.md), decision 13).

## The operator area

`/operator` in Mission Control answers only on an operations address: a request that carries neither `x-asym-front-stamp` nor `x-asym-front-origin`, whose `host` (and `x-forwarded-host`, when present) equals an entry of `OPERATIONS_NAMES` after stripping ASCII spaces and tabs at both ends and lower-casing ASCII `A-Z` only ([environments, 5.9](environments.md#59-the-operator-areas-operations-address-operations_names)). Everywhere else, and inside any organization's address, it answers an empty `404`; with `CORE_SERVE_UNDER_PATHS=1` an unlisted host without a front header gets `403`. The admin proxy then reads the session: anonymous visitors go to sign-in, people who are not on the list get the same empty `404`, and only listed people reach the page, which checks the list again before it renders anything. No answer says whether a refused person is an operator.

In the area an operator:

- with no verified authenticator, sets one up: the page shows a QR code and the key (the key exists only in that screen, never on Core's servers, logs or tables) and asks for the current code. Verifying signs the person out on their other devices;
- with a verified authenticator but a session below `aal2`, enters the current code;
- at `aal2`, once the database has confirmed the operator session, sees the authenticators, can add another, and can remove one only while at least two remain. Removing the last authenticator is the release owner's, below. The same screen lists the changes recorded with no organization, newest first; a refused or failed read says so and is never shown as an empty list.

"Lost your authenticator?" tells the operator to ask the release owner, which is the only recovery the product offers; there are no recovery codes.

Supabase Auth's own factor API stays open to every signed-in person, so someone who is not on the list can enrol a factor directly; doing so admits them neither to `/operator` nor to `platform_operator_session()` (`operator-mfa.localstack.test.ts`, T5 row 5).

## Hosted prerequisites for the operator area

The coordinator's and the owner's, by hand, before the release that carries the operator area. None costs money: TOTP is free on every plan, and phone factors, the paid add-on, stay off.

- Each Supabase project (development, production): Authentication, Multi-Factor: TOTP enrolment on and verification on; phone and WebAuthn off; maximum enrolled factors 2 or more.
- The staff Vercel project: `OPERATIONS_NAMES` as bare `host[:port]` entries, no scheme, for Production and for the development environment; unset for Preview; redeploy after setting it.

Without `OPERATIONS_NAMES` the area answers `404` everywhere (`403` to a request without a front header while `CORE_SERVE_UNDER_PATHS=1`); without TOTP the enrolment screen says two-step sign-in is switched off. Both fail closed.

## Recovery

A tenant administrator can engage Emergency off on a hosted project. The operator area raises an operator's session to `aal2` (set up an authenticator, or pass the challenge); the break-glass steps below stay for an operator who cannot reach the area.

**Break glass using real Auth MFA, not the database connection.** Use a listed operator with a live flagged staff assignment in the affected tenant. In a trusted local HTTPS client with history, logging, redirects and cloud sync disabled, use the project's own Supabase origin and its publishable key (`apikey` header). Send JSON with `Content-Type: application/json`; keep passwords, tokens, authenticator secrets and codes out of URLs, shell arguments, tickets and logs. Stop on any non-2xx response.

1. `POST /auth/v1/token?grant_type=password` with `{"email":"…","password":"…"}`. Use the response's `access_token` as `Authorization: Bearer …` for the following Auth calls. If `user.factors` contains your verified TOTP factor, use its `id`; otherwise `POST /auth/v1/factors` with `{"factor_type":"totp","friendly_name":"Incident recovery"}`, enter the returned `totp.secret` in your authenticator, and use the returned `id`.
2. `POST /auth/v1/factors/{id}/challenge` with `{}`, then `POST /auth/v1/factors/{id}/verify` with `{"challenge_id":"…","code":"…"}` (the challenge response's `id` and your authenticator's current code). **Replace** the bearer token with the verify response's `access_token`. Enrolling a factor does not upgrade a separate browser session.
3. On the same Supabase origin, `POST /rest/v1/rpc/platform_operator_session` and `/rest/v1/rpc/current_user_assignments`, each with `{}` and the new bearer token. Check the returned operator ID against your Auth user ID and select your live staff assignment `id` for the intended `tenant_id`.
4. On the trusted **Mission Control origin** for this project, `GET /api/admin/eve/launch-readiness` with that same bearer token and `x-asym-assignment: …` (the selected assignment ID). If `governance.emergencyOff` is true and incident clearance is approved, `POST` to that same endpoint with both headers and `{"kind":"safety_control","mode":"clear_emergency","expectedStateVersion":123,"reason":"…"}`. Replace `123` with the exact `governance.stateVersion` just read and give the actual incident reason. Confirm `governance.emergencyOff` and `governance.releaseEnabled` are both false; this clears the emergency, not the kill switches or a release approval. After any failed safety-control response, read the governance state again: the control may have taken effect before the response failed. If that read fails, escalate to the release owner rather than retrying the control. On a stale version, re-read and reassess rather than retrying blindly. Discard the local session material when finished; retain the enrolled factor securely.

For a lost device, remove the lost factor from the user's Auth dashboard page or through the Auth admin API. The operator must enrol and verify a replacement; removing a factor does not satisfy the gate.

For a compromised device or account, work in this order. `platform.require_operator()` reads the list at every call and the `aal` claim of the access token the caller presents; neither removing a factor nor revoking the user's sessions ends an access token already issued, which keeps its `aal2` claim until `jwt_expiry` (up to one hour). Removing the person from the list is the one step that refuses them at once.

1. Remove the person from `authz.platform_operators` with the script (effective at the next call).
2. Revoke the user's sessions and remove the compromised factor in Auth (dashboard or admin API); for an account compromise, also reset the password.
3. Stay off the list until every access token issued before step 2 was complete has expired: a token can still be issued while step 2 is under way, before the sessions are revoked and the password is reset, and once the person is back on the list such a token passes the list check again with its old `aal2` claim. So the wait starts when the last action of step 2 has finished, and it lasts the affected hosted project's own access-token lifetime: read it from that project (Authentication settings, access token expiry), not from `supabase/config.toml`, whose `jwt_expiry` (`3600` seconds) sets local stacks only.
4. Add the person back to the list with the script, and have them set up a new authenticator in the operator area at once: until they do, their password alone is enough to enrol.

If the last operator is locked out or compromised, the release owner first adds a trusted replacement with the database script, which does not need an MFA session. Then remove the old operator before deleting the login from Auth.
