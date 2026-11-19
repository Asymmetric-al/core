# Release job

The release job is the only path that migrates a hosted database and the only
path that deploys production. It implements section 7.4 and 7.5 of
[the target architecture](../audits/core-crm-cms-database-target-architecture.md)
and the release-pipeline part of WP1 (issue #2674, slice 1.3).

**State.** The code is in the repository. It does nothing until the owner
completes [the steps to switch it on](#switching-it-on). Until then the
first push to `production` that carries this change runs the job, which stops
at its preflight (the development database has no release health function and
no environment marker) and deploys nothing.

## What it does

`.github/workflows/release.yml` runs on every push to `production` and on
manual dispatch from `production`. One release runs at a time per database
and none is ever cancelled.

1. **Replay.** Every migration is applied to an empty Postgres in the job
   (`scripts/verify/supabase-migrations.mjs`, then the Payload migrations),
   and its schema fingerprint is captured
   (`scripts/release/schema-fingerprint.mjs`).
2. **Preflight** (`scripts/release/release-database.mjs`, first part of
   `migrate`). The connection must address the configured Supabase project as
   `postgres`, over TLS, and never the frozen production-named project
   (`btewedpsxwsjczvmegby`, until WP11). The database must have the release
   health function and an environment marker. Both migration ledgers are
   compared with source: a pending migration older than the database head is
   out of order, and an applied migration that source does not have is drift.
   Either stops the release before anything is migrated or deployed.
3. **Migrate.** `supabase db push` (pinned CLI), then the two CMS role
   passwords are set from the job's secrets (plan 7.5: after the role
   migration), then the Payload migrations run as `cms_owner` through
   `scripts/cms/run-payload-command.mjs`, with the `cms_owner` login in
   `PAYLOAD_MIGRATION_DATABASE_URI`: the only source that runner accepts for a
   hosted database, set in this step and nowhere else. That login uses
   `sslmode=verify-full` against the project's CA (`RELEASE_DATABASE_SSL_CA`,
   handed to Payload as `PAYLOAD_DATABASE_SSL_CA`): node-postgres reads
   `sslmode=require` as full verification against Node's own CA store, which
   does not hold Supabase's CA. Both ledgers must then hold every source
   migration. Neither the Supabase CLI nor Payload's migrations inherit a
   `RELEASE_*` variable, and the Supabase CLI gets the database password in
   `PGPASSWORD`, never on its command line (the pinned CLI, 2.121.0, reads it
   for a `--db-url` that carries none). The job installs that CLI with
   `supabase/setup-cli`, the version read from `scripts/supabase-cli.mjs` (the
   repository's one pin), and runs only it: the wrapper, under
   `SUPABASE_CLI_FORCE_PINNED=1`, never fetches a CLI and stops if the one on
   the `PATH` reports another version. `npx supabase@<pin>` run inside the
   repository stops on the root `package.json`'s `overrides` (npm
   `EOVERRIDE`); the wrapper's local fallback gives npm an empty project
   outside the repository instead.
4. **Gates.** The tenant RLS catalog gate, the cross-schema name-collision
   gate (one recorded exception, `cms.tenants`, until WP6) and the schema
   fingerprint, which must equal the replay's exactly.
5. **Record heads.** The newest version of each ledger, read from the
   database, is written through `platform.record_migration_head`. Reading
   the ledgers rather than source means an older release never lowers them.
6. **Deploy** (`scripts/release/vercel-release.mjs`). The job picks the apps
   whose files changed since the commit each production domain serves. For
   each it creates a production-target deployment of the exact SHA through
   Vercel's API. The build runs on Vercel, so application secrets stay there.
   With custom-domain auto-assignment off, the deployment is staged: it
   serves no production domain. The job then calls each staged deployment's
   `/api/health/migrations`, and only when every one answers `ok`, built from
   this commit, against the expected Supabase project, does it promote them.
   Promotion does not rebuild. A failed build or check promotes nothing.
   Promotion is one call per app, one after the other, so it is not all or
   nothing: see [If a promotion fails part way](#if-a-promotion-fails-part-way).
   Finally each production domain must serve the commit and pass.
7. **Register job functions** (optional, `RELEASE_REGISTER_JOB_FUNCTIONS`):
   a `PUT` to the admin app's Inngest serve route, because Git deployment no
   longer triggers a sync (council reservation 7).

### The migration health route

Each app serves `GET /api/health/migrations` (logic in
`packages/api/src/health/migrations.ts`, route factory in
`packages/api/src/health/db.ts`). Next.js inlines the heads the build was
made against (`next.config.ts` `env`, from `scripts/release/migration-heads.mjs`);
the route reads the recorded heads through `public.platform_health()` with
the service key. That key is used at one site, shared with the database
health probe: the named health-probe entry for `packages/api/src/health/db.ts`
in `docs/security/service-role-client-allowlist.json`, whose reason names the
migration-head check. No site was added: the entry caps (#2253, #2312) and the
ceiling are unchanged, and #2308 pins the file's bytes.

| Database compared with the build | Answer                     | Effect                                          |
| -------------------------------- | -------------------------- | ----------------------------------------------- |
| Same heads, or later             | `200`, `status: "ok"`      | Promotable; a rolled-back app stays healthy     |
| Earlier on either ledger         | `503`, `status: "behind"`  | Not promoted                                    |
| Build carries no heads           | `503`, `status: "unknown"` | Not promoted                                    |
| Function missing or call fails   | `503`, `status: "error"`   | Not promoted; only a PostgREST error code shown |

The route is public and uncached. Any caller gets the status alone, with its
`200` or `503`. The detail (the Supabase project ref the app reads, the
environment marker, the heads and the commit) goes only to a caller whose
`x-vercel-protection-bypass` header equals the deployment's
`VERCEL_AUTOMATION_BYPASS_SECRET`, the system variable Vercel sets at build and
run time once the project has a Protection Bypass for Automation secret. The
job sends that header to the staged deployments and to the production
domains, and stops if a healthy answer comes back without its detail.

### If a promotion fails part way

The job promotes the apps one after the other. If the promotion of a later
app fails, the apps promoted before it serve the new commit and the rest the
previous one. The database is already migrated, and every migration is safe
for the release still running (plan 7.4: expand, then contract), so each app
still works. To recover, dispatch **Release** with operation `release`: it
plans the apps whose domain does not serve the commit, stages, checks and
promotes them. If that fails again, roll the promoted apps back with Vercel's
_Instant Rollback_ to their previous production deployment, so that all three
serve the previous commit, and fix the cause before the next release. The job
has no rollback of its own.

### Dispatched operations

Run from the Actions tab, workflow **Release**, branch `production`:

| Operation                        | Inputs                                                         | What it does                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `release`                        | `environment: production`                                      | Re-runs the release of the `production` head                                                                                                                                                                                                                                                                                                                                         |
| `set-environment-marker`         | `environment`, `marker`, `confirmation: <ref>:<marker>`        | Moves the marker forward only: disposable to shared to production. Waits for the owner's approval in the environment `release-owner-approval` (plan 7.5)                                                                                                                                                                                                                             |
| `first-rebuild`                  | `environment`, `census_signoff`, `confirmation: rebuild <ref>` | The one-off rebuild of a database with no marker: drop what migrations made, apply every migration, seed, replace the seeded logins' password, Payload migrations, gates, heads. Takes the owner's census sign-off (a link to the issue or comment), or `empty-project` for a new project, which the job checks is empty. Waits for the owner's approval in `release-owner-approval` |
| `set-cms-role-passwords`         | `environment`                                                  | Sets `cms_owner` and `cms_runtime` from the secrets and proves each can log in. For rotation and after a restore (plan 8.5)                                                                                                                                                                                                                                                          |
| `replace-seeded-login-passwords` | `environment`                                                  | Gives every login that still carries a password the repository publishes `RELEASE_SEED_LOGIN_PASSWORD` instead. Resets nothing and changes no other login. The repair after a rebuild that stopped between its seed and that replacement ([below](#if-seeded-logins-keep-a-published-password))                                                                                      |

The marker change and the first rebuild run only after a required reviewer of
the GitHub environment `release-owner-approval` approves the run's
`owner-approval` job. That environment holds no secret; the job that does the
work starts only once it is approved, and a rejected approval skips it.

An approval is good for one run attempt. `owner-approval` records the attempt
it was approved in, and the `database` job's first rebuild and the `marker`
job run only in that attempt. So **Re-run failed jobs**, or a re-run of one
job, changes nothing: the work job is skipped, because the approval belongs to
the earlier attempt. To repeat a first rebuild or a marker change that
stopped, fix the cause, then choose **Re-run all jobs** on that run (GitHub
asks the owner again) or dispatch the operation anew.

While an approval is pending, its run holds the workflow's concurrency group:
`release-production` for the `production` environment, `preview-database`
for `preview`. Every push to `production` (or every preview rebuild) queues
behind it until the owner approves or rejects, so answer a pending approval
promptly, or reject it, before anything else must release.

Only SCRAM-SHA-256 verifiers computed on the runner reach the database for
the CMS roles, and only an Argon2id verifier for the seeded logins; the plain
passwords never appear in SQL, argv or logs.

### Seeded logins on a hosted rebuild

`supabase/seed.sql` creates logins (today `demo-owner@givehope.test`) whose
password is published in the repository. Local and CI databases keep it. A
hosted database never does (record D-24): every hosted rebuild, the first
rebuild and the preview rebuild alike, stops before it resets anything unless
`RELEASE_SEED_LOGIN_PASSWORD` holds 32 to 72 printable ASCII characters, and
right after the reset and seed, before anything else uses the database, gives
every login whose stored hash matches a password the seed publishes the
release environment's password instead (`replaceSeededLoginPasswords` in
`scripts/release/release-database.mjs`). Only an Argon2id verifier computed on
the runner reaches the server, in the form Supabase Auth verifies; logins
that do not carry a published password are left alone. The step stops if any
login still carries one. Anyone who signs in as a seeded login on a hosted
project uses that secret. `bun run seed:demo:users` refuses a published
password for a hosted project too.

The replacement runs after any reset that was attempted, whatever the reset's
outcome, because a reset that fails after its seed has already put the
published password in place. If the replacement itself fails, the step stops
with "Seeded logins may still carry the password published in the
repository". From then on every release of that database stops at its
preflight, which refuses a database where any login still carries a published
password, until the repair below has run.

### If seeded logins keep a published password

A rebuild that stopped between its seed and the replacement (the step failed,
or the runner was lost) leaves the demo logins with their published password,
and anyone who knows it can sign in. The release job's preflight then stops
with "N login(s) carry a password published in the repository", and a
rebuild with "Seeded logins may still carry the password published in the
repository".

1. Do not use the database, and do not promote anything built against it.
2. Read the failed run's log and fix what stopped it.
3. Dispatch **Release**, branch `production`, operation
   `replace-seeded-login-passwords`, with the affected `environment`. It needs
   no approval: it resets nothing, and it changes only the logins whose stored
   hash matches a password the repository publishes, giving them
   `RELEASE_SEED_LOGIN_PASSWORD` as the rebuild would have.
   Check: the run's log says "Replaced the published password of N seeded
   login(s)", and signing in as `demo-owner@givehope.test` with
   `demo-password` fails.
4. Release again (a push to `production`, or the `release` operation); its
   preflight passes. A preview database can instead be rebuilt again by the
   preview workflow, which repeats the replacement.

### Why the first rebuild alone may reset an unmarked database

Every reset in the repository goes through WP1.1's reset rule: the
`bun run supabase` wrapper and `requireDisposableDatabase`
(`scripts/lib/environment-marker.mjs`) refuse a database not marked
`disposable`, and a database with no marker counts as not disposable. The
preview rebuild follows that rule twice: the job calls
`requireDisposableDatabase`, then resets through the wrapper.

The one-off first rebuild cannot: a hosted database that predates WP1 has no
marker by definition. It is the one exception plan 7.5 names ("the first
rebuild of each … is a named one-off step of the job that takes the census
sign-off as its input"). So `first-rebuild` runs the pinned Supabase CLI
directly (`supabase db reset --db-url …`, the CLI the job installed, after
checking that it reports the version `scripts/supabase-cli.mjs` pins), and
nothing else does. It exists only in the
release job's dispatched `first-rebuild` step, from the `production`
branch, and runs only after all of these hold:

- the connection addresses the environment's configured project, never the
  production-named one, as `postgres`, over TLS;
- the database has no marker (a marked database is refused: it is reset, if at
  all, under the ordinary rule);
- the input is the owner's census sign-off, a link to the issue or comment in
  `Asymmetric-al/core`, or `empty-project` for a new project, which the job
  checks holds no table and no migration ledger;
- the operator typed `rebuild <ref>`;
- the owner approved the run in the environment `release-owner-approval`;
- `RELEASE_SEED_LOGIN_PASSWORD` is set, so the seeded logins never keep the
  password published in the repository.

Right after the migrations the job reads the marker. The marker migration
writes `disposable` when `public.profiles`, `public.donors` and
`public.donations` are empty, as they are after the reset; Auth rows do not
count. If the marker does not read `disposable`, the step stops there, before
the CMS role passwords and Payload's migrations, and says what it read. The
preview rebuild makes the same check.

### Pull requests that carry a migration

`.github/workflows/qa-smoke-preview-deploy.yml` keeps its per-pull-request
group, which cancels a superseded run, for pull requests without a migration.
A pull request that changes `supabase/migrations/` or
`apps/admin/src/migrations/` instead runs the `preview-database` job, in one
repository-wide group that never cancels and queues the rest: replay and
fingerprint, rebuild the `preview` Supabase project from the PR head (only
where its marker says `disposable`, through `requireDisposableDatabase` and
the `bun run supabase` wrapper; the scripts refuse the development and
production-named projects whatever the configuration says), gates, heads,
deploy into the Vercel custom environment `preview-database`, check each
deployment reads the preview project at the migrated heads, then the smoke
run. The next such pull request starts its rebuild only after this smoke run
ends. The job holds only the preview project's credentials.

### The request-tenant policies: after the first release's apps, never below them

`20261119022102_request_tenant_policies.sql` (WP2b's second release,
AL-2675) makes the database read the tenant and the assignment from the
`x-asym-tenant` and `x-asym-assignment` request headers, which only the apps
of WP2b's first release send. An app that sends neither gets no row of a
tenant table. So:

- release this migration to an environment only after a release that carries
  the first release's apps has completed there;
- once it has shipped there, no application rollback goes below the first
  release, whether by _Instant Rollback_ or by a release of an older commit.

The database does not enforce the order: a rebuild from source applies the
whole chain to a database with no recorded heads, and a guard in the
migration would stop it (council R6). Its rollback, run by hand, is
`supabase/migrations/rollback_20261119022102_request_tenant_policies.sql`.
It stops, changing nothing, unless 20261119022102 is the newest version in
the migration ledger: reverse every later migration first. It leaves the
ledger as it is, so the next release does not apply the migration again, and
leaves the Realtime publication alone unless its marked block is run, which
is only for a database built by replaying the chain. It ends with PostgREST's
schema reload.

The migration sets `lock_timeout` to 5s. If a long reader holds one of the
fifty tables it alters, it fails fast with `55P03` and nothing is applied;
dispatch the release again when the database is quiet. If its SQL committed
but the job stopped before the migration ledger recorded it, a second push
runs the file again and fails at its first `DROP POLICY` (the policy is
already gone). Do not edit the file. Confirm that it is applied: the catalog
gate passes (`scripts/release/catalog-gates.mjs`),
`to_regprocedure('authz.request_assignment()')` is not null and the policy
"profiles staff tenant select" on `public.profiles` is gone. Then record the
version with the pinned CLI, `bun run supabase -- migration repair --status
applied 20261119022102`, against the same project, and dispatch the release
again (council R9).

## Secrets and variables

Names only. Values live in GitHub environments and never in the repository.

| Where                                | Name                                                       | Kind     | Value                                                                                                                          |
| ------------------------------------ | ---------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Environment `release-production`     | `RELEASE_SUPABASE_PROJECT_REF`                             | variable | The project production-target deployments use. Until WP11: development, `pnmlrbgjiqzzsthsoikm`                                 |
|                                      | `RELEASE_DATABASE_URL`                                     | secret   | `postgres` on that project's **session pooler** (`postgres.<ref>@aws-0-<region>.pooler.supabase.com:5432`), `?sslmode=require` |
|                                      | `RELEASE_CMS_OWNER_PASSWORD`                               | secret   | 32 to 256 printable ASCII characters, no spaces                                                                                |
|                                      | `RELEASE_CMS_RUNTIME_PASSWORD`                             | secret   | As above, different from the owner's; the same value goes into the admin app's `PAYLOAD_DATABASE_URI`                          |
|                                      | `RELEASE_DATABASE_SSL_CA`                                  | secret   | The project's CA certificate, the PEM from its Database settings (the same value as the admin app's `PAYLOAD_DATABASE_SSL_CA`) |
|                                      | `RELEASE_SEED_LOGIN_PASSWORD`                              | secret   | 32 to 72 printable ASCII characters, no spaces: the password every seeded login gets on a hosted rebuild                       |
| Environment `release-preview`        | the same six names                                         |          | The `preview` project's values                                                                                                 |
| Environment `release-owner-approval` | none                                                       |          | Holds no secret. Its required reviewer (the owner) approves each marker change and each first rebuild                          |
| Repository (exist today)             | `VERCEL_TOKEN`, `VERCEL_ORG_ID`                            | secret   | Unchanged                                                                                                                      |
|                                      | `VERCEL_{ADMIN,DONOR,MISSIONARY}_PROJECT_ID`               | secret   | Unchanged                                                                                                                      |
|                                      | `VERCEL_{ADMIN,DONOR,MISSIONARY}_AUTOMATION_BYPASS_SECRET` | secret   | Unchanged; used as a header to reach staged and preview deployments                                                            |
| Repository or `release-production`   | `RELEASE_REGISTER_JOB_FUNCTIONS`                           | variable | `true` once Inngest is configured in production; unset otherwise                                                               |

The cms_owner login is derived from `RELEASE_DATABASE_URL` (same host,
`cms_owner.<ref>`, `sslmode=verify-full`), so the job holds one connection
string per environment.
The job hands it to Payload's migrations as `PAYLOAD_MIGRATION_DATABASE_URI`
with `CMS_HOSTED_MIGRATION_REF` set to the project ref; the runner checks that
the user is `cms_owner.<ref>` on that project's pooler and that the connection
is encrypted. No application environment holds that variable: a protected
deployment that has it refuses to start Web Studio. GitHub-hosted runners have
no IPv6, so the direct host (`db.<ref>.supabase.co`) will not connect; use the
session pooler.

## Database contract

The SQL objects belong to WP1.1 (slice 1.1a, migration
`platform_schema_marker_and_health`). The release code reaches them only
through `packages/api/src/health/release-contract.mjs`; tests run against a
stub of the same shape (`tests/unit/scripts/release/support/test-database.ts`).

- `public.platform_health()`, the wrapper of the definer `platform.health()`,
  EXECUTE for `service_role` only, returns jsonb
  `{"environment": "disposable"|"shared"|"production"|null, "expected_heads": {"supabase"?: text, "payload"?: text}, "applied_heads": {...}, "checked_at": ...}`.
  A ledger with no recorded head is absent and counts as behind.
- `platform.record_migration_head(p_ledger text, p_head text)` records one
  ledger's head, forward only.
- `platform.advance_environment(p_kind text)` moves the marker to `shared` or
  `production`; the release code also refuses a database with no marker.
- The marker migration writes `disposable` when `public.profiles`,
  `public.donors` and `public.donations` are empty, that is, on a database being
  built from source. Auth rows do not count, so a hosted reset that keeps Auth
  users still yields the marker.
- `requireDisposableDatabase({databaseUrl, action})` and the `bun run supabase`
  wrapper refuse to reset a database not marked `disposable`, with no override.
- `cms_owner` and `cms_runtime` are login roles that `postgres` can alter.
  WP1.2's migration `*_cms_database_roles.sql` creates them without a
  password (connection limits 2 and 10); the job sets both passwords.

## Switching it on

Do the steps in order. Each says how to check it and how to undo it. Steps
1 to 4 leave production serving what it serves today; steps 5 and 6 change
development and the Vercel variables; step 7 is the first release through the
job. Nothing here is done by the code.

**Preconditions.** WP1.1 (the health function, marker, reset rule and CMS
roles) and WP1.2 (Payload as `cms_runtime`, migrating as `cms_owner`) are
merged with this change. The owner has decided the census (record D-15): all
hosted data are fixtures; the production-named project is replaced in WP11,
not rebuilt in place; and the production deployments point at the
development database until WP11. The steps below follow those decisions.

1. **Create the GitHub environments `release-production` and
   `release-owner-approval`.** Settings, Environments, New environment. For
   both, deployment branches and tags: _Selected branches_, rule
   `production`. `release-owner-approval` must have you as a required
   reviewer, and holds no secret: every marker change and every first rebuild
   waits there for your approval (plan 7.5). Leave _Prevent self-review_ off
   if you dispatch those runs yourself, and turn off the administrators'
   bypass of its protection rules, so that the approval cannot be skipped.
   On `release-production` a required reviewer is optional, and makes every
   release wait for approval.
   Check: `gh api repos/Asymmetric-al/core/environments/release-owner-approval --jq '[.protection_rules[].type, .deployment_branch_policy]'`
   lists `required_reviewers`; `gh api repos/Asymmetric-al/core/environments/release-production --jq .deployment_branch_policy`.
   Undo: delete the environments.
2. **Add the secrets and the variable of `release-production`** from the
   table above. Generate the two CMS passwords and the seeded-login password;
   they are new and used nowhere yet. `RELEASE_DATABASE_SSL_CA` is the PEM of
   the project's CA certificate (Database settings, SSL configuration).
   Check: `gh secret list --env release-production` shows the five secrets and
   `gh variable list --env release-production` the variable.
   Undo: delete them.
3. **Stage production deployments.** Turn off _Auto-assign Custom Production
   Domains_ for admin, donor and missionary (Vercel, Project Settings,
   Environments, Production). This comes before the code ships, because
   `bun run release:production` runs `verify:deployment-discipline`, which
   now requires it. From now on nothing reaches the production domains except
   by promotion; until step 7 has run once, promote an urgent fix by hand in
   the Vercel dashboard.
   Check: `bun run verify:deployment-discipline` passes
   `production deployments are staged (custom domains not auto-assigned)`.
   Undo: turn it back on.
4. **Ship the code.** Merge this change through `develop` and release it with
   `bun run release:production`. From this push on, Vercel's Git integration
   deploys nothing (`apps/*/vercel.json`), and the Release run that the push
   starts stops at preflight, because the development database has no health
   function and no marker. Production keeps serving its current deployment.
   Check: the run fails in its migrate step with "predates WP1"; Vercel lists
   no new production deployment for the commit
   (`vercel list admin --scope asymmetric-al`).
   Undo: release a revert of the commit.
5. **The first rebuild of development** (WP1.7). Its input is the census
   sign-off, decision D-15 (all hosted data are fixtures). Dispatch
   **Release** with operation `first-rebuild`, environment `production`,
   `census_signoff` a link to the issue, pull request or comment in
   `Asymmetric-al/core` that records D-15 (the job accepts no other link),
   confirmation `rebuild pnmlrbgjiqzzsthsoikm`. Approve the run's
   `owner-approval` job when GitHub asks. It resets the database with the pinned
   CLI directly (the named exception above), applies every migration, which
   creates the marker as `disposable` and the CMS roles, seeds, gives the
   seeded logins `RELEASE_SEED_LOGIN_PASSWORD`, checks the marker, sets the
   CMS role passwords, runs Payload's migrations, the gates and the heads.
   Check: the run is green, and its log says the rebuild is complete, the
   seeded logins' password was replaced, the database is marked disposable
   and both role passwords were verified. Signing in as
   `demo-owner@givehope.test` with `demo-password` fails, and with the secret
   succeeds.
   Undo: none after the reset (forward only, plan 7.5); before it, cancel
   the run.
6. **Point the applications at that database, without a `postgres` login.**
   In each Vercel project (admin, donor, missionary):
   - Production `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     and `SUPABASE_SERVICE_ROLE_KEY` belong to `RELEASE_SUPABASE_PROJECT_REF`
     (the development project until WP11; D-15). The job checks this on every
     staged deployment and refuses to promote a mismatch.
   - Delete `SUPABASE_DB_URL` everywhere. Names read on 17 November 2026:
     admin Production, and the `core-development` custom environment of
     admin, donor and missionary (dashboard, or `vercel env rm` from a
     directory linked to the project).
   - Replace the admin app's `PAYLOAD_DATABASE_URI` in Production, in
     `core-development` and in its branch-scoped Preview entry with a
     `cms_runtime` login on the session pooler:
     `postgresql://cms_runtime.<ref>:<RELEASE_CMS_RUNTIME_PASSWORD>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=verify-full`,
     with no other SSL option, and set `PAYLOAD_DATABASE_SSL_CA` beside it to
     the project's CA certificate (the PEM from its Database settings). A
     protected deployment refuses a pooler URL without that pair, and refuses
     to start Web Studio while `PAYLOAD_MIGRATION_DATABASE_URI` is set
     (`apps/admin/src/cms/payload-database-config.ts`); never add that
     variable to an application environment.

   Check: `bun run verify:runtime-connection-strings` prints
   `Overall: READY`. Undo: restore the previous values (re-adding
   `SUPABASE_DB_URL` reopens NA-04). They reach users only through the next
   deployment.

7. **Release.** Dispatch **Release** with operation `release`.
   Check: the run is green; `bun run verify:vercel-production -- --commit <sha>`
   is READY; `curl https://admin.asymmetric.al/api/health/migrations` answers
   `"status":"ok"` with the expected ref; the deployments Vercel lists for the
   commit are exactly the IDs the run logged, so the push started none
   outside the job.
   Undo: Vercel _Instant Rollback_ to the previous production deployment; it
   stays healthy, because a database that is ahead passes.
8. **The `preview` Supabase project.** It is a new billable resource in the
   owner's organization, so creating it is the owner's go-ahead (D-03; D-15
   does not decide it).
   Create a project named `preview` in the organization. Create the GitHub
   environment `release-preview` with no branch rule and no required
   reviewer (pull-request runs use it), and give it the six names with the
   preview project's values, except `RELEASE_SEED_LOGIN_PASSWORD`, which
   takes the same value as in `release-production`. Set the repository
   secrets `QA_PREVIEW_TEST_EMAIL` to `demo-owner@givehope.test` and
   `QA_PREVIEW_TEST_PASSWORD` to that value: the preview smoke runs, on the
   development database and on the preview database alike, sign in with that
   pair, and a rebuilt database holds only the seeded logins, with that
   password. Dispatch **Release** with operation
   `first-rebuild`, environment `preview`, `census_signoff: empty-project`,
   confirmation `rebuild <preview ref>`, and approve its `owner-approval`
   job. In each Vercel project create the
   custom environment `preview-database` with no branch tracking, holding
   the Preview environment's variables but with the preview project's
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` and (admin) `PAYLOAD_DATABASE_URI` as
   `cms_runtime` with `PAYLOAD_DATABASE_SSL_CA`, as in step 6, and no
   `SUPABASE_DB_URL`.
   Check: label two pull requests that each carry a migration with
   `qa:smoke`; the second's `preview-database-smoke` job waits until the
   first's smoke run ends, and each posts a _Preview Database Smoke QA_
   comment naming the preview project. Development's recorded heads
   (`platform_health()`) are unchanged.
   Undo: delete the custom environments, the GitHub environment and the
   project.
9. **Optional.** Set `RELEASE_REGISTER_JOB_FUNCTIONS=true` once Inngest is
   configured for production.

**Turning the whole job off.** Disable the workflow
(`gh workflow disable release.yml`), set `production: true` again in each
`apps/*/vercel.json` through a release, and turn custom-domain
auto-assignment back on. Migrations then have no automated path again, which
reopens D02.

## What still needs a hosted run

Proved locally (unit and real-stack tests against a disposable Postgres):
the order check, preflight refusals, heads, marker, SCRAM passwords, the
fingerprint and gates, the health route's answers, the all-or-nothing deploy
against a fake Vercel API, the first rebuild's direct reset path and the
marker check after it, and the workflows' structure. CI's `migrate` job runs,
on every pull request, the real-stack suites of every package of the AL-2671
program (`tests/unit/acceptance/issue-2670` to `issue-2689`), the release
job's, Payload's database-role suite and the Payload qualification
(`bun run cms:qualify`). Not yet run against a hosted service: Vercel creating a staged production deployment through the
API and promoting it; a gitSource deployment into the `preview-database`
custom environment (the job fails closed if Vercel ignores the environment);
`supabase db push` and `db reset --db-url` on a hosted project; custom login
roles through the session pooler; fingerprint equality with development after
its first rebuild; and the preview group's queueing under GitHub's
`queue: max` (documented for `jobs.<job_id>.concurrency` and for the
workflow-level `concurrency` the release workflow now uses too).

Added by council round 2, each also still to be seen on a hosted run:

- The CMS role migration applied by hosted `postgres`, which holds
  CREATEROLE but is not a superuser. Proved locally on Supabase's own
  Postgres image (17.11.0.004, `createrole_self_grant` empty): the earlier
  migration stopped at `ALTER SCHEMA cms OWNER TO cms_owner` with "must be
  able to SET ROLE", and this one applies, twice.
- Payload's migrations as `cms_owner` over `sslmode=verify-full` against
  `RELEASE_DATABASE_SSL_CA` through the session pooler. Only a hosted run can
  show that the pooler's certificate chains to that CA and names the pooler
  host.
- The pinned CLI reading the password from `PGPASSWORD` against the hosted
  pooler (proved locally against Postgres with 2.121.0).
- Signing in as a seeded login with `RELEASE_SEED_LOGIN_PASSWORD` after a
  rebuild: the Argon2id verifier matches Supabase Auth's documented format
  and limits (unit test), and the replacement runs on Postgres (real-stack
  test), but Supabase Auth itself has not verified one here.
- The detail of `/api/health/migrations`: that Vercel passes the
  `x-vercel-protection-bypass` header through to the route, on staged
  deployments and on the production domains, and sets
  `VERCEL_AUTOMATION_BYPASS_SECRET` at run time. If it does not, every check
  fails closed with "answered without its detail" and nothing is promoted.
- The `owner-approval` job: that a dispatched marker change or first rebuild
  waits for the required reviewer, that a rejection skips the work, that
  **Re-run failed jobs** skips it too (the approval output names the earlier
  run attempt), and that a push still runs the database and deploy jobs
  although the approval job is skipped (both carry a status function for that
  reason).
