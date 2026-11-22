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

1. **Replay.** The workflow sets `REPLAY_DATABASE_URL` explicitly to the job's empty local `release_replay` database. Both migration runners and the fingerprint capture use that address. If any of these steps fails, the workflow skips the first rebuild; do not run it separately after a failed replay.
   Every migration is applied to an empty Postgres in the job
   (`scripts/verify/supabase-migrations.mjs --hosted-defaults`, then the
   Payload migrations), and its schema fingerprint is captured
   (`scripts/release/schema-fingerprint.mjs`). Before the first migration the
   replay gives `postgres` the default privileges hosted Supabase gives it in
   `public` (`scripts/sql/hosted-default-privileges.sql`, the one copy of the
   platform's defaults, which
   both rebuilds put back before their reset, see
   [What a reset keeps of the default privileges](#what-a-reset-keeps-of-the-default-privileges),
   and the real-stack privileges harness reads too). The compatibility
   bootstrap's SELECT on tables for `service_role` is not one of them: it
   is the plain replay's own minimal grant, without which the chain does
   not apply on plain Postgres. Without the platform's defaults every table,
   sequence and function the chain creates has another access list than on
   the hosted target, and step 4 stops every hosted release, as it stopped the
   first hosted run (WP1.6). When a pull request changes one of its listed
   paths, the Local Supabase Stack workflow checks that such a replay
   fingerprints exactly as the image the pinned CLI starts. It is not a
   required check, and it compares with that image, not with hosted: a
   change of the defaults on hosted is caught by step 4's gates.
2. **Preflight** (`scripts/release/release-database.mjs`, first part of
   `migrate`). The connection must address the configured Supabase project as
   `postgres`, over TLS, and never a project its environment refuses: the
   production environment refuses the preview project
   (`btewedpsxwsjczvmegby`, the production-named project, until WP11), and
   the preview environment refuses development. The database must have the release
   health function and an environment marker. Both migration ledgers are
   compared with source: a pending migration older than the database head is
   out of order, and an applied migration that source does not have is drift.
   Either stops the release before anything is migrated or deployed.
   **So the order of migration dates must be the order of merge**
   (`scripts/release/migration-heads.mjs`). A migration dated before the
   database's head, merged after that head was applied, stops every release
   at this step until it is re-dated. A branch whose migrations are dated
   before those of a branch that merges first re-dates them before it merges;
   WP2a's branch does so, with a guard test.
3. **Migrate.** `supabase db push` (pinned CLI), then the two CMS role
   passwords are made those of the job's secrets (plan 7.5: after the role
   migration; see [The CMS role passwords](#the-cms-role-passwords)), then
   the Payload migrations run as `cms_owner` through
   `scripts/cms/run-payload-command.mjs`, with the `cms_owner` login in
   `PAYLOAD_MIGRATION_DATABASE_URI`: the only source that runner accepts for a
   hosted database, set in this step and nowhere else. That login uses
   `sslmode=verify-full` against the project's CA (`RELEASE_DATABASE_SSL_CA`,
   handed to Payload as `PAYLOAD_DATABASE_SSL_CA`): node-postgres reads
   `sslmode=require` as full verification against Node's own CA store, which
   does not hold Supabase's CA. Every other connection the job opens checks
   the database's certificate against the same CA (see
   [The database's certificate](#the-databases-certificate)). Both ledgers
   must then hold every source migration. Neither the Supabase CLI nor
   Payload's migrations inherit a `RELEASE_*` variable, and the Supabase CLI
   gets the database password in
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
   fingerprint, which must equal the replay's exactly, access lists included.
5. **Record heads.** The newest version of each ledger, read from the
   database, is written through `platform.record_migration_head`. Reading
   the ledgers rather than source means an older release never lowers them.
   Only the order of the workflow's steps keeps this step behind the gates:
   `record-heads` does not check that the gates passed. A direct run of
   `release-database.mjs` therefore stops at the first step that fails. The
   first hosted run recorded heads after a failed gate on a disposable
   database (WP1.6).
6. **Deploy** (`scripts/release/vercel-release.mjs`). The job picks the apps
   whose files or shared inputs changed since the commit each production domain
   serves, or all three apps when a dispatched `release` sets `apps` to `all`.
   For
   each it creates a production-target deployment of the exact SHA through
   Vercel's API. The build runs on Vercel, so application secrets stay there.
   With custom-domain auto-assignment off, the deployment is staged: it
   serves no production domain. The job then calls each staged deployment's
   `/api/health/migrations`, and only when every one answers `ok`, built from
   this commit, against the expected Supabase project, does it promote them.
   Promotion does not rebuild. A failed build or check promotes nothing.
   Promotion is one call per app, one after the other, so it is not all or
   nothing: see [If a promotion fails part way](#if-a-promotion-fails-part-way).
   Finally each production domain must serve the promoted deployment ID, commit
   and expected Supabase project ref and pass `/api/health/migrations`. This
   live check is bounded by attempts (18 attempts, with a 10-second pause
   between attempts and a 30-second per-request timeout), not a wall-clock
   deadline: while an older or unidentified deployment answers during alias
   propagation (including status-only answers after a bypass-secret rotation),
   it keeps retrying within those 18 attempts. If verification fails after
   promotion was requested, inspect what the domain serves before dispatching
   again or rolling back.
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
environment marker, the heads, the commit and the deployment ID from
`VERCEL_DEPLOYMENT_ID`) goes only to a caller whose
`x-vercel-protection-bypass` header equals the deployment's
`VERCEL_AUTOMATION_BYPASS_SECRET`, the system variable Vercel sets at build and
run time once the project has a Protection Bypass for Automation secret. The
job sends that header to the staged deployments and to the production
domains: on a staged URL a healthy answer without its detail stops promotion
immediately; on a production domain after promotion, an unidentified answer
(for example from an older deployment before a rotated bypass secret switches
over) keeps retrying within the live check's 18-attempt bound and fails
verification if the promoted deployment ID never answers.

### If a promotion fails part way

The job promotes the apps one after the other. If the promotion of a later
app fails, the apps promoted before it serve the new commit and the rest the
previous one. The database is already migrated, and every migration is safe
for the release still running (plan 7.4: expand, then contract), so each app
still works. To recover, dispatch **Release** anew from branch `production` (do not use
**Re-run all jobs** or **Re-run failed jobs** on the failed run: a re-run keeps
its original commit and inputs, and neither the workflow nor `releaseSha`
refuses a commit that is no longer `production`'s head) with operation
`release` and the same `apps` value as the run that failed: `changed` for a
code release, or `apps: all` after a change of Vercel variables (with `changed`,
an app that already serves the commit is skipped and keeps its old variables).
With `apps: all`, check that the plan step logged `build` for admin, donor and
missionary. Before a recovery dispatch with `apps: changed`, check each app the
failed run already promoted that the new run will skip (a skipped app is not
live-checked by the recovery run): confirm its production domain serves the
deployment ID the failed run logged for it, and that its
`/api/health/migrations` response (with that project's
`x-vercel-protection-bypass` header) is `ok` with the expected Supabase project
ref and commit; if that check cannot be made, fix the cause and dispatch with
`apps: all`, which builds, promotes and live-checks every app. Before the first
dispatch of a release that carries changed Vercel variables,
note for each app the deployment ID its production domain currently serves
(read it from `https://<domain>/api/health/migrations` with that project's
`x-vercel-protection-bypass` header, or from the project's **Deployments**
page in Vercel; the job's `plan` step does not log live deployment IDs). If
the second dispatch fails too, do not blindly roll back to "the previous
production deployment": for an app promoted by both runs of the same commit,
its previous deployment is the first failed attempt, not what served before
the release. Either return each app to the pre-release deployment ID you noted
before the first dispatch, or go forward (fix the cause and release again) if
the pre-release deployment's credentials no longer work — after a credential
rotation, revoked credentials on the pre-release deployment will not work. The
job has no rollback of its own.

### Dispatched operations

Run from the Actions tab, workflow **Release**, branch `production`:

| Operation                        | Inputs                                                                    | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `release`                        | `environment: production`, `apps` (`changed` or `all`, default `changed`) | Dispatches a release of the `production` head (always dispatch anew; never re-run an older run). With `apps: all`, builds, checks and promotes every app regardless of its live commit so changed Vercel variables reach users; check that the plan step logged `build` for admin, donor and missionary                                                                                                                                                                           |
| `set-environment-marker`         | `environment`, `marker`, `confirmation: <ref>:<marker>`                   | Moves the marker forward only: disposable to shared to production. Waits for the owner's approval in the environment `release-owner-approval` (plan 7.5)                                                                                                                                                                                                                                                                                                                          |
| `first-rebuild`                  | `environment`, `census_signoff`, `confirmation: rebuild <ref>`            | The first rebuild, retryable before either head is recorded on an unmarked or disposable database: put the platform's default privileges back, drop what migrations made, apply every migration, seed, replace the seeded logins' password, Payload migrations, gates, heads. Takes the owner's census sign-off (a link to the issue or comment), or `empty-project` for a new project, which the job checks is empty. Waits for the owner's approval in `release-owner-approval` |
| `set-cms-role-passwords`         | `environment`                                                             | Makes `cms_owner` and `cms_runtime` log in with the secrets: a role whose secret already logs in is left alone, and one refused for its password is set and verified within the bound. For rotation and after a restore (plan 8.5)                                                                                                                                                                                                                                                |
| `replace-seeded-login-passwords` | `environment`                                                             | Gives every login that still carries a password the repository publishes `RELEASE_SEED_LOGIN_PASSWORD` instead. Resets nothing and changes no other login. The repair after a rebuild that stopped between its seed and that replacement ([below](#if-seeded-logins-keep-a-published-password))                                                                                                                                                                                   |

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

### The CMS role passwords

The shared pooler of a hosted project caches each role's credentials for a
while. A login right after `ALTER ROLE ... PASSWORD` can be refused although
the new password is right, and repeated refusals trip the pooler's circuit
breaker, which blocks the client (Supabase, "Supavisor error: password
authentication failed after rotating database password"). Supavisor v2.10.1
(commit `83ca93e1`, its newest tag on 18 November 2026) blocks a project's
client address for 120 seconds after 10 refused logins in 150 seconds;
Supabase does not publish which version its pooler runs, so for hosted that
bound is an estimate. Setting the
same passwords again on every release made this happen: the second rebuild of
the preview project stopped at "password authentication failed for user
cms_owner", and the same login succeeded 80 seconds later. On the rotation
proof that followed the fix, each new password logged in on the second
attempt, 36 and 37 seconds after its change.

So the step first logs in as each role with its secret.

- The login works: the password is already right, and nothing changes. This
  is every ordinary release.
- The login is refused for the password, in one of two forms only, as
  Supavisor v2.10.1 words them, and as the preview project's pooler answered
  on 18 November 2026: "password authentication failed for user"
  naming that role, or "(EAUTHQUERY) unsupported or invalid secret format"
  for a role with no usable password. The step sets the password once, from a verifier
  computed on the runner, then logs in again at once, after 30 seconds and
  after 90 seconds (`ROLE_LOGIN_VERIFICATION` in
  `scripts/release/release-database.mjs`). That is a rotation, a restore from
  backup (plan 8.5) or a role just made. One role costs at most four refused
  logins, the two roles of a run at most eight.
- The login is refused for any other reason: any other EAUTHQUERY reason,
  such as a failed or timed-out auth query; a refusal naming another user; no
  route; TLS; the role's connection limit; the circuit breaker. The step stops
  at once. The refused role's password is unchanged; an earlier role may
  already have its new password.

Runs close together are the one case the step cannot tell apart. A run that
starts within minutes of another run's password change can meet a pooler
node that still holds the old salt. That node refuses the right password in
the first form above, so the step sets the password again, and the new salt
starts the wait anew. Waiting two minutes after a run that changed a password
is the only mitigation. Newer Supavisor marks such a refusal with the hint
"The password for this user was recently changed"; the preview project's
pooler showed none on 18 November 2026.

### If the CMS role passwords stop a run

If a new password is still refused after 90 seconds, or a login after the
change is refused for another reason, the step stops. The password is set in
the database either way. The stop says what the run skipped and what to run
next. In every case, wait two minutes first, and never retry in a loop.

- **`set-cms-role-passwords`:** dispatch it again.
- **A release (`migrate`):** Supabase migrations may already be applied. It stopped before Payload's migrations, the
  gates, the heads and the deployment, so nothing was deployed. Re-run the
  release.
- **The preview rebuild:** it stopped after the reset and the seed, before
  Payload's migrations, the gates and the heads. Rebuild again.
- **`first-rebuild`:** fix the refusal, then dispatch `first-rebuild` again with the census link, typed confirmation and fresh owner approval. It is allowed only before either head is recorded, on an unmarked or `disposable` database.

A password that logs in by then is left alone, so none of these sets it again.

A login refused for a reason the step does not recognise (anything but the
two forms above: the pooler, TLS, the role's connection limit, the circuit
breaker) leaves the password of that role unchanged. A password verified earlier in the same step stays changed; completed Supabase migrations also remain applied. The stop names the
refusal and says what to run next for the operation it stopped: fix what
the refusal names (for the circuit breaker, wait two minutes), then the same
next step as in the list above. A TLS refusal that is a certificate
verification error (`certificate verify failed`) leads to
[If the CA is rotated or expires](#if-the-ca-is-rotated-or-expires): Supabase
may have rotated the project's CA, and step 2 there checks that the pooler
chains to the new one. After fixing TLS for an unfinished first rebuild,
dispatch `first-rebuild` again with the census link, typed confirmation and
fresh owner approval. A `disposable` marker alone does not admit an ordinary
release on a first-only database with no recorded head.

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
project uses that secret. `bun run seed:demo:users` is a separate local-only
tool. It refuses every hosted project, regardless of the password.

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
4. Resume the operation that stopped:
   - Unfinished first rebuild, no recorded head: dispatch `first-rebuild` again
     with the census link, typed confirmation and fresh owner approval. The
     password repair did not complete the reset, migrations or gates.
   - Ordinary release with recorded heads: rerun `release` after the repair.
   - Ordinary disposable preview rebuild: rerun the preview workflow, which
     repeats the replacement.

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

- the connection addresses the environment's configured project, never one
  its environment refuses, as `postgres`, over TLS;
- neither ledger has a recorded head and the marker is absent or `disposable`. A `shared` or `production` marker always refuses this operation;
- the input is the owner's census sign-off, a link to the issue or comment in
  `Asymmetric-al/core`, or `empty-project` for a new project, which the job
  checks has no marker, public relations or Supabase migration ledger. A retry on a nonempty project needs the census link;
- the operator typed `rebuild <ref>`;
- the owner approved the run in the environment `release-owner-approval`;
- `RELEASE_SEED_LOGIN_PASSWORD` is set, so the seeded logins never keep the
  password published in the repository.

Both rebuild modes compare fixture counts with `supabase/seed-expectations.json` after reset and password replacement. A mismatch stops the rebuild before Payload. First-only release preflight does not count fixtures; it refuses a database with no recorded head and directs the operator to `first-rebuild`. The workflow records heads only after passing the gates. Direct `record-heads` must never stand in for completing those steps. ALWAYS triggers refuse DELETE and TRUNCATE of the heads table. The marker migration
writes `disposable` when `public.profiles`, `public.donors` and
`public.donations` are empty, as they are after the reset; Auth rows do not
count. If the marker does not read `disposable`, the step stops there, before
the CMS role passwords and Payload's migrations, and says what it read. The
preview rebuild makes the same check.

### What the first rebuild does not remove

The pinned CLI's reset (`drop.sql` of Supabase CLI 2.121.0) drops every schema
that neither the platform nor an extension owns, the extensions outside its
keep list, every object in `public` and every policy, and truncates `auth` and
the migration ledger. A project with a history keeps the rest:

- the schemas `pgmq`, `vault`, `extensions`, `pgsodium` and `pgtle`, and every
  schema an extension created or `supabase_admin` owns. A queue's tables in
  `pgmq` survive the drop of the `pgmq` extension;
- the extensions the reset keeps (`pg_graphql`, `pg_net`,
  `pg_stat_statements`, `pgcrypto`, `pgjwt`, `pgsodium`, `plpgsql`,
  `supabase_vault`, `uuid-ossp`) and their rows, such as `vault.secrets` and
  `net._http_response`;
- the cluster's roles, Storage buckets and objects, Edge Functions and their
  secrets, the project's Auth, API and Storage settings, and anything outside
  Supabase aimed at the project, such as a provider's webhook endpoint;
- the default privileges `postgres` holds in `public`. These the rebuild
  itself puts back before the reset
  ([below](#what-a-reset-keeps-of-the-default-privileges)); nothing is done
  by hand.

They are removed by hand, once, after the rebuild and before its gates, each
object listed before it goes:

1. Edge Functions: `supabase functions delete <slug> --project-ref <ref>`; their
   secrets: `supabase secrets unset <NAME> --project-ref <ref>`.
2. In one transaction as `postgres`, with each count checked before the commit:
   the named `vault.secrets` rows, the `net._http_response` rows, the leftover
   tables in `pgmq`, then the `pgmq` schema once it is empty.
3. Outside Supabase: disable, do not delete, what still calls the removed
   functions, in test mode.

Then `gates` finds nothing that exists only on the target. On 18 November 2026
the preview project lost the legacy Stripe sync engine this way: three Edge
Functions (`stripe-setup`, `stripe-webhook`, `stripe-worker`), the function
secret `STRIPE_SECRET_KEY`, three `vault.secrets` rows, two `pgmq` queue
tables with the `pgmq` schema, six `net._http_response` rows, and the Stripe
test-mode endpoint that called the webhook function, now disabled
(`docs/audits/core-crm-cms-database-proofs/wp16-hosted-proofs.md`). The
function secret `MANAGEMENT_API_URL` followed later that day. The census
found none of these objects in development.

### What a reset keeps of the default privileges

The reset never drops `public`, so it keeps the default privileges `postgres`
holds there: they belong to a role and a schema, not to any object the reset
drops. The chain changes them. Stage 1 closes them for `anon` and
`authenticated` (`20261117034926_close_default_privileges_and_demo_grants`).
So a rebuild of a project that was already rebuilt used to start from the
previous chain's end state, not where a fresh project starts. The functions in
`public` made before that migration, which have no grant of their own, then
lacked the EXECUTE grants to `anon` and `authenticated` that a fresh project
gives them. On 18 November 2026 that stopped the recovery of the preview
project at its gates: 15 such functions, their access lists the only
difference.

Both rebuilds therefore put the platform's default privileges back before
the reset, from `scripts/sql/hosted-default-privileges.sql`, the file the
replay applies before the chain. Every statement in it runs as `postgres`,
which owns those defaults and owns the database, so it may grant on `public`.
The file runs in one transaction: if it fails part way, nothing of it
applies, the rebuild stops and nothing is reset. The file only grants, so
any other default privilege of `postgres` would survive it and the reset: a
grant to another role in `public`, or an entry for every schema such as a
revoke from PUBLIC. The gates would then fail only after the reset. So the
step works out from the file, in a transaction it rolls back, what a replay
starts from, and commits the restore only when `postgres`'s default
privileges are exactly that and it holds none for every schema. Otherwise
the rebuild stops before the reset, naming each entry ("unexpected in
public tables:…", "in every schema functions:…"). Remove each, or record why
it stays, then rebuild. Both rebuilds check the
pinned CLI before this step, so a wrong CLI stops them before they touch the
database. `migrate` never resets and never touches default privileges: the
chain's own changes to them stand. The release real-stack suite proves the rebuild against a model of
the reset: a database built with the chain, then reset by a hand copy of the
pinned CLI's `drop.sql` (2.121.0; a test fails when the pin moves),
fingerprints equal to a fresh replay. The model cannot show what a
non-superuser `postgres` or a different `drop.sql` would do; the hosted
rebuilds of 18 November 2026 did.

**If the reset fails after this step.** The restore has reopened the
defaults of `postgres` in `public` to `anon` and `authenticated`, and the
chain closes them again. So the rebuild reads, in one query, the marker and
whether those defaults are still open, and its stop names the case:

| What the stop reads                                  | How far the chain got                               | What to run next                                                                                                |
| ---------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| No marker                                            | Reset did not complete                              | Fix the cause; dispatch `first-rebuild` again with the census link and fresh approval, provided no head exists. |
| `disposable`, ordinary preview rebuild               | The chain may or may not have closed the defaults   | Fix the cause and rebuild preview again.                                                                        |
| `disposable`, first rebuild, defaults open or closed | The reset may have stopped before or during seeding | Fix the cause; dispatch `first-rebuild` again with the census link and fresh approval. Neither head may exist.  |
| `shared`, `production`, or any recorded head         | Not eligible for first rebuild                      | Stop. Do not remove the marker or heads; investigate with the owner.                                            |
| Database unreadable                                  | Unknown                                             | Restore connectivity and inspect its marker, heads and defaults before choosing a guarded operation.            |

Preflight also stops if `postgres` grants default privileges to `anon`,
`authenticated`, or `PUBLIC`, globally or in schema `public`. This does not
mean a rebuild failed. In `psql`, use `\ddp` to find the object type, grantee
and scope. Revoke the offending grant at the same scope, then rerun the
release. For example, for a global table grant use
`ALTER DEFAULT PRIVILEGES FOR ROLE postgres REVOKE SELECT ON TABLES FROM PUBLIC;`.
For a schema grant add `IN SCHEMA public` before `REVOKE`. Use the privileges,
object type and grantee actually listed. A revoke changes defaults for future
objects, not grants on existing ones. `first-rebuild` is an option only if
neither head is recorded and the marker is absent or `disposable`.

Since review H1 the gate also
reads these default privileges, and those of `postgres` for every schema
(the schema fingerprint, version 2), so a release would stop at its gates
rather than deploy over them.

### Pull requests that carry a migration

`.github/workflows/qa-smoke-preview-deploy.yml` keeps its per-pull-request
group, which cancels a superseded run, for pull requests without a migration.
A pull request that changes `supabase/migrations/` or
`apps/admin/src/migrations/` instead runs the `preview-database` job, in one
repository-wide group that never cancels and queues the rest: replay and
fingerprint, rebuild the `preview` Supabase project from the PR head (only
where its marker says `disposable`, through `requireDisposableDatabase` and
the `bun run supabase` wrapper; the scripts refuse the development project
whatever the configuration says), gates, heads,
deploy into the Vercel custom environment `preview-database`, check each
deployment reads the preview project at the migrated heads, then the smoke
run. The next such pull request starts its rebuild only after this smoke run
ends. The job holds only the preview project's credentials.

### The request-tenant policies: after the first release's apps, never below them

Once WP3a's tenant-record migrations (`20261120130001` and later) are applied, the WP2b rollback cannot be run as written. Its ledger guard requires `20261119135300` to be newest. Do not edit the ledger to get around that check; use a forward fix or rebuild from the intended source chain (see [Tenant records and giving targets](#tenant-records-and-giving-targets-wp3a-part-1a-20261120130001-to-20261120130006)).

`20261119135300_request_tenant_policies.sql` (WP2b's second release,
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
migration would stop it (council R6).

No dispatched operation repairs the ledger or rolls this migration back, so
the three procedures below run by hand, in bash, from a checkout of the
released commit.

#### Connecting as the job does

The address is the one the environment's `RELEASE_DATABASE_URL` holds,
without its password: `postgres.<ref>` on the project's session pooler, with
`sslmode=verify-full` once, and the project's CA as `sslrootcert`, a file you
take and check as steps 1 and 2 of
[If the CA is rotated or expires](#if-the-ca-is-rotated-or-expires) say
([The database's certificate](#the-databases-certificate)). The password is
the project's database password, which the owner holds (GitHub never shows a
secret's value). As in the job, it goes in `PGPASSWORD`, never on a command
line; type it at a prompt that does not echo it. Set `PGREQUIREAUTH` as the
job does for every hosted connection, and use `psql` 16 or later, whose libpq
honours it:

```sh
DB='postgresql://postgres.<ref>@<pooler host>:5432/postgres?sslmode=verify-full&sslrootcert=<CA file>'
read -rs PGPASSWORD && export PGPASSWORD
export PGREQUIREAUTH=scram-sha-256
psql --version
supabase --version
```

Run the Supabase CLI as the job does: the version `scripts/supabase-cli.mjs`
pins (2.121.0) first on the `PATH`, which `supabase --version` must print,
and `SUPABASE_CLI_FORCE_PINNED=1` on the command, under which the repository's
wrapper runs only that binary, never fetches one, and stops if the one on the
`PATH` reports another version. The CLI reads the password from `PGPASSWORD`
for a `--db-url` that carries none, and the CA from the address's
`sslrootcert`, as the job's `db push` does. Each repair below keeps its exit
status, checks the ledger, and then removes the password and `PGREQUIREAUTH`
on either outcome. Dispatch the release again only after a repair that exited
0 and whose check reads as its step says.

#### If the migration committed but its ledger row is missing

The migration sets `lock_timeout` to 5s. If a long reader holds one of the
fifty tables it alters, it fails fast with `55P03` and nothing is applied;
dispatch the release again when the database is quiet. If its SQL committed
but the job stopped before the migration ledger recorded it, a second push
runs the file again and fails at its first `DROP POLICY` (the policy is
already gone). Do not edit the file (council R9):

1. Connect as above, and confirm that the SQL committed. Both columns must
   read `t`; if either reads `f`, nothing was applied: stop here and dispatch
   the release again, which applies the file.

   ```sh
   psql "$DB" -X -c "select to_regprocedure('authz.request_assignment()') is not null as helper_present, not exists (select 1 from pg_policy where polrelid = 'public.profiles'::regclass and polname = 'profiles staff tenant select') as old_policy_gone"
   ```

2. Record the version. Go on only if the status reads 0 and the count 1:

   ```sh
   SUPABASE_CLI_FORCE_PINNED=1 bun run supabase -- migration repair --status applied 20261119135300 --db-url "$DB" --yes
   status=$?
   psql "$DB" -X -tA -c "select count(*) from supabase_migrations.schema_migrations where version = '20261119135300'"
   unset PGPASSWORD PGREQUIREAUTH
   echo "repair exit status: $status"
   ```

3. Dispatch **Release**, branch `production`, operation `release`, with
   `environment` set to the environment whose database `$DB` is
   (`production` or `preview`; the form's default is `production`). Its
   `gates` step (`node scripts/release/release-database.mjs gates`) runs the
   catalog gates and compares the database's schema fingerprint with the
   replay the job builds, before it records the heads or deploys anything.
   Nothing is run by hand for this: `scripts/release/catalog-gates.mjs` is a
   module the step calls, with no command of its own, and the step needs the
   fingerprint of the replay the job builds in the same run. If the gates
   fail, nothing is recorded or deployed.

The connection, step 1's query and step 2's repair (then without
`SUPABASE_CLI_FORCE_PINNED`, the wrapper fetching the pinned version) were
run, with `psql` 17 and the pinned CLI (2.121.0), against a local Postgres
that served TLS with a
certificate a test CA signed and held the objects the query reads but not the
ledger row. With that CA as `sslrootcert` the query read `t` twice and the
repair recorded the version. With another CA, `psql` and the CLI both refused
the server's certificate, and nothing was recorded.

#### Rolling it back by hand

The rollback is
`supabase/migrations/rollback_20261119135300_request_tenant_policies.sql`,
one transaction. Run it only when both hold:

- No run that can reach that environment's database is unfinished, and
  nothing is pushed to `production` until it has committed. Releases wait for
  each other through the workflow's concurrency group (`release-production`,
  or `preview-database` for `preview`, which the `preview-database` job of
  `qa-smoke-preview-deploy.yml` shares; never cancelled, every waiting run
  queued), but a rollback run by hand is outside that group, so only this
  check keeps them apart. A run that waits in the group or for the owner's
  approval is unfinished too. Of the statuses `gh run list --status` takes,
  the unfinished ones are `queued`, `in_progress`, `requested`, `waiting` and
  `pending`; this must print nothing (for `preview`, run it for
  `qa-smoke-preview-deploy.yml` too):

  ```sh
  for s in queued in_progress requested waiting pending; do gh run list --workflow release.yml --status "$s"; done
  ```

  From the rollback until step 3 of
  [Applying it again after a rollback](#applying-it-again-after-a-rollback)
  dispatches the release, keep releases and preview rebuilds of that
  environment paused.

- 20261119135300 is the newest version in the migration ledger. The file
  checks it and stops, changing nothing, otherwise: reverse every later
  migration first.

Connect as above and run it, keeping `psql`'s exit status and removing the
password and `PGREQUIREAUTH` on either outcome:

```sh
psql "$DB" -X -v ON_ERROR_STOP=1 -f supabase/migrations/rollback_20261119135300_request_tenant_policies.sql
status=$?
unset PGPASSWORD PGREQUIREAUTH
echo "rollback exit status: $status"
```

Before it reads the ledger it locks the ledger table against writes until it
commits, so no migration can be recorded, and no repair or second rollback
run, between its check and its commit; a writer that holds the ledger makes
it stop within its 5s lock timeout. The lock does not exclude SQL a release
runs before it writes its ledger row: only the precondition above does. A
lock shared with the release job is recorded for WP11. The file leaves the
Realtime publication alone unless its marked block is run, which is only for
a database built by replaying the chain, where the seven tables were members
before; no hosted database published them. It ends with PostgREST's schema
reload.

It leaves 20261119135300 recorded in the ledger. A release after it would
not apply that migration again. Its migrate step runs before its gates, so it
would apply, and record in the ledger, any migration newer than 20261119135300
that its commit carries, and then stop at its gates, because the catalog gate
fails on a helper that reads the token claim and the schema fingerprint
differs from the replay's; no head would be recorded and nothing deployed.
That is why releases stay paused. To release again, apply the migration again
as the next section says.

After the rollback, `authz.current_tenant_id()` reads the token's tenant
claim again. A session whose token carries no tenant claim, as hosted
sessions do not, then reads no row through a policy keyed on it, exactly as
before the migration. For the first release's apps, measured on disposable
databases with such a token and the first release's headers, before the
migration, with it and after the rollback: the member directory
(`public.tenant_member_directory`), the commenters' names
(`public.post_comment_authors`), the reactions route's post read and the
reactions answer the same in all three states, and CRM table preferences are
read with the service key and written through functions that check
`authz.caller_assignment`, which reads the assignment header on both sides. A
donor's saved feed preferences read as no row before the migration and after
the rollback, so the route answers defaults; with the migration they read.
The rollback case of
`tests/unit/acceptance/issue-2675/tenant-policy-migration.realstack.acceptance.test.ts`
pins the feed-preference read. Image uploads: the rollback restores the two
Storage INSERT policies that compare the path's tenant with the uploader's
`profiles.tenant_id`, while the first release's upload routes build the path
from the tenant of the assignment the request resolved and upload on the
caller's token. A person whose profile names another tenant than the one they
act in is then refused by Storage, and the route answers `502` ("Image
upload failed.", `uploadOnce` in `packages/api/src/upload/image.ts`), exactly as
before the migration with the first release's apps.

#### Applying it again after a rollback

After a rollback the schema is the one before the migration, but the ledger
still records 20261119135300. Releases and preview rebuilds of that
environment stay paused from the rollback until the dispatch of step 3. Fix
what made you roll back first; the order at the top of this section still
holds. Then:

1. Connect as above, and see that schema and ledger disagree and that
   nothing came after: `recorded` reads `t`, `applied` reads `f` and `newest`
   reads `t`. Both `recorded` and `applied` `t` means the migration is in
   place; stop. `newest` `f` means a later migration was recorded after the
   rollback, which a release that was not paused applies before its gates
   stop it: stop, and remove nothing, because 20261119135300 would then sort
   before the database's head, and the release job refuses a pending
   migration dated at or before the head as out of order.

   ```sh
   psql "$DB" -X -c "select exists (select 1 from supabase_migrations.schema_migrations where version = '20261119135300') as recorded, to_regprocedure('authz.request_assignment()') is not null as applied, coalesce((select max(version) from supabase_migrations.schema_migrations) = '20261119135300', false) as newest"
   ```

2. Remove the version from the ledger. The block checks again that it is the
   newest version and removes nothing otherwise. Go on only if the status
   reads 0 and both `recorded` and `applied` read `f`:

   ```sh
   if [ "$(psql "$DB" -X -tA -c "select coalesce((select max(version) from supabase_migrations.schema_migrations) = '20261119135300', false)")" = t ]; then
     SUPABASE_CLI_FORCE_PINNED=1 bun run supabase -- migration repair --status reverted 20261119135300 --db-url "$DB" --yes
     status=$?
   else
     echo "20261119135300 is not the newest version in the ledger: stop, nothing removed"
     status=1
   fi
   psql "$DB" -X -c "select exists (select 1 from supabase_migrations.schema_migrations where version = '20261119135300') as recorded, to_regprocedure('authz.request_assignment()') is not null as applied"
   unset PGPASSWORD PGREQUIREAUTH
   echo "repair exit status: $status"
   ```

3. Dispatch **Release**, branch `production`, operation `release`, with
   `environment` set to the environment whose database `$DB` is
   (`production` or `preview`; the form's default is `production`). Its
   migrate step applies 20261119135300 again, as a pending migration newer
   than the database's head, and its gates compare the fingerprint with the
   replay's before it records the heads. The recorded heads stay at
   20261119135300 throughout (they only move forward), so the apps'
   `/api/health/migrations` keeps answering `ok`.

This procedure was run on a disposable database built by replaying the chain
with a full ledger, after the rollback, against a local Postgres without TLS,
with the pinned CLI (2.121.0) first on the `PATH` and
`SUPABASE_CLI_FORCE_PINNED=1`: step 1 read `t`, `f` and `t`, the repair
exited 0 and the check read `f` twice, the job's own `db push` then applied
20261119135300, and the schema fingerprint equalled the migrated chain's. On a
second copy with 20991231000000 recorded after the rollback, step 1 read `t`,
`f` and `f`, and step 2 removed nothing and ended with status 1, the row of
20261119135300 still recorded.

### Tenant records and giving targets (WP3a part 1a: 20261120130001 to 20261120130006)

#### Deploy order and expand prerequisite (plan 7.4)

`20261120130004_giving_target_entities.sql` drops `donations_missionary_id_fkey`
and leaves only the composite `(tenant_id, missionary_id)` key. Older app builds
whose `DONATION_WITH_PARTIES_SELECT` embeds `missionaries!missionary_id` fail
their donation reads (`GET` donations answers `500`, donor GraphQL donation
queries fail, and gift `POST` read-backs fail) from `20261120130004`'s `COMMIT`
until new builds promote, and stay down if the release stops after `db push`.

- The five migrations (`20261120130001`, `20261120130003` to `20261120130006`)
  are safe for a running release that carries the unhinted missionary embed
  (PR #2747, commit `474c5679f`, `fix/AL-2674-health-probe-embed-expand`,
  released and promoted on all three apps first by the coordinator) and **NOT**
  for an older one.
- A release that carries this part must build all three apps (`admin`, `donor`
  and `missionary`), because the new builds read `funds.system_purpose`.
- The labelled `preview-database` smoke
  (`.github/workflows/qa-smoke-preview-deploy.yml`) is the first hosted proof of
  the chain and its gates, including the tenant-key check against a hosted
  Supabase catalog.

#### Timeouts, transaction boundaries and rollback

All five migrations run in separate transactions with
`SET LOCAL lock_timeout = '5s'`. That bounds each wait for a lock, not how long
a lock is held, and none of the five sets `statement_timeout`.

Because each file is its own transaction, a stop at file N leaves the earlier
files applied and recorded in the ledger while file N aborts and applies nothing
of its own, and a re-run continues from file N. On a lock timeout in
`20261120130003`, `20261120130001` stays applied and recorded; inspect
`pg_blocking_pids`, let the blocker finish or end it, and run the release again.
After `20261120130004` commits, an intermediate stop before app promotion would
leave older-app donation reads broken unless the expand step above was already
promoted on all three apps.

After a release that applies all five migrations, repair is forward only
(`20261120130003` and `20261120130004` are forward only; `20261120130005` and
`20261120130006` can be reversed by hand from their headers).
`supabase/migrations/rollback_20261120130001_tenant_status_membership.sql`
serves only a push that stopped right after `20261120130001`; its ledger guard
refuses once any later migration is recorded, and it also refuses while any
tenant is suspended or closed.

#### Hosted prerequisites: read-only checks before a release

Run on preview, then production, before the release that carries this part.

**Tenant-key catalog check (all schemas).** The catalog gate inspects every
non-temporary table with a `tenant_id` column in every schema (no schema
filter). An unexpected table (`TENANT_KEY_MISSING`) or a listed `cms.*` table
that is absent or already keyed (`TENANT_KEY_STALE_EXCEPTION`) stops the release
at `gates`, after the forward-only push. Run this read-only query; it must
return **exactly** the nine `cms.*` names in
`docs/security/tenant-key-exceptions.json`:

```sql
SELECT n.nspname, c.relname
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_attribute a ON a.attrelid = c.oid AND a.attname = 'tenant_id' AND NOT a.attisdropped
WHERE c.relkind IN ('r', 'p') AND c.relpersistence <> 't'
  AND NOT EXISTS (
    SELECT 1 FROM pg_constraint fk
    JOIN pg_attribute p ON p.attrelid = fk.confrelid AND p.attname = 'id'
    WHERE fk.contype = 'f' AND fk.conrelid = c.oid AND fk.conkey = ARRAY[a.attnum]
      AND fk.confrelid = 'public.tenants'::regclass AND fk.confkey = ARRAY[p.attnum]
      AND fk.convalidated
  )
ORDER BY 1, 2;
```

**`20261120130001` and `20261120130003` (tenant status and deletion
protection).** `20261120130001` holds `ACCESS EXCLUSIVE` on `public.tenants`
across one `CHECK` scan and six function replacements; from then on every
membership reader joins `tenants`, so any later exclusive lock on `tenants`
blocks all signed-in requests. `20261120130003` stops on any non-`RESTRICT` key
to `tenants` whose definition is not
`FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)` with optional
`ON DELETE CASCADE` or `SET NULL`, requires the migrating role to be able to
`ALTER` every referencing table, assumes all validating scans (146 tables on a
seeded copy of `develop`) finish inside the role's `statement_timeout`, and
holds `ACCESS EXCLUSIVE` on `public.tenants` and every altered referencing table
until `COMMIT`.

1. Keys `20261120130003` would refuse (expect **0 rows**):

```sql
SELECT conrelid::regclass, conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE contype = 'f' AND confrelid = 'public.tenants'::regclass AND confdeltype <> 'r'
  AND pg_get_constraintdef(oid) !~ '^FOREIGN KEY \(tenant_id\) REFERENCES (public\.)?tenants\(id\)( ON DELETE (CASCADE|SET NULL))?$';
```

2. Referencing tables the migrating role may not alter (expect **0 rows**):

```sql
SELECT c.oid::regclass, c.relowner::regrole
FROM pg_constraint k
JOIN pg_class c ON c.oid = k.conrelid
WHERE k.contype = 'f' AND k.confrelid = 'public.tenants'::regclass AND k.confdeltype <> 'r'
  AND NOT pg_has_role(current_user, c.relowner, 'USAGE');
```

3. Open transactions to drain before running (also covers `20261120130004`):

```sql
SELECT pid, usename, state, now() - xact_start AS open_for, left(query, 60)
FROM pg_stat_activity
WHERE xact_start IS NOT NULL AND pid <> pg_backend_pid()
ORDER BY xact_start;
```

4. Referencing-table row estimate against `statement_timeout`:

```sql
SELECT current_setting('statement_timeout'),
  (SELECT sum(reltuples)::bigint FROM pg_class
   WHERE oid IN (
     SELECT conrelid FROM pg_constraint
     WHERE contype = 'f' AND confrelid = 'public.tenants'::regclass
   )) AS approx_rows;
```

5. Existing foreign-key delete actions to compare against
   `docs/security/tenant-fk-actions-before-wp3a.csv`:

```sql
SELECT n.nspname, c.relname, k.conname, k.confdeltype
FROM pg_constraint k
JOIN pg_class c ON c.oid = k.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE k.contype = 'f' AND k.confrelid = 'public.tenants'::regclass
ORDER BY 1, 2, 3;
```

**`20261120130004` (legal entities, giving targets and permanent locks).**
Locks eight tables (`public.tenants`, `public.funds`, `public.missionaries` and
the five money tables) in `SHARE ROW EXCLUSIVE` before its preflight (writers
wait; readers continue), then upgrades `funds`, `missionaries` and the five
money tables to `ACCESS EXCLUSIVE` through `COMMIT` across two updates, six
index builds, ten key validations and ten lock backfills (`tenants` stays at
`SHARE ROW EXCLUSIVE`). Under those locks it checks and stops before its first
change on a fund or missionary with a `NULL` tenant, a tenant whose name is
blank after `btrim`, or a row on any of the five money tables naming a fund or
missionary while its own `tenant_id` is `NULL` or differs from the target's (a
donation with a `NULL` tenant that names no target is allowed through). It
assumes the migrating role bypasses row security (otherwise the lock backfill
under forced RLS with no policy fails when money rows exist) and that policy
`"tenant scoped read"` exists on `public.funds`.

1. Run `scripts/sql/giving-target-preflight.sql`: both statements must return
   **0 rows**. If `20261120130004` stops on its in-migration preflight, repair
   the rows it names (it prints counts and blank-name tenant ids) and release
   again.
2. Confirm the migrating role bypasses row security (at least one of `rolsuper`
   or `rolbypassrls` must be `true`):

```sql
SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user;
```

3. Confirm `public.funds` carries policy `"tenant scoped read"`:

```sql
SELECT polname FROM pg_policy WHERE polrelid = 'public.funds'::regclass;
```

4. Drain open transactions using query 3 of `20261120130001`/`20261120130003`
   above.

**`20261120130005` and `20261120130006` (late readers and gift tenant
default).** `20261120130005` needs only `20261120130001`, locks no table and
reloads PostgREST's schema cache (covering `20261120130004`'s new keys too).
`20261120130006` takes `ACCESS EXCLUSIVE` on `public.donations` for a
catalog-only `DROP DEFAULT`; existing `NULL`-tenant rows stay invisible to any
tenant, an insert naming no tenant and no donor, fund or missionary is stored
with `NULL` while one naming any of them is refused (`23514`), and gift intake
(WP8a) owes `NOT NULL`. Record these baselines before the release:

```sql
SELECT count(*) FROM public.donations WHERE tenant_id IS NULL;
SELECT column_default FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'donations' AND column_name = 'tenant_id';
```

#### Read-only verification checks after a release

1. Confirm every tenant has a legal entity, every fund has one
   (`tenants_without_entity` and `funds_without_entity` must both be **0**), and
   record the lock count:

```sql
SELECT
  (SELECT count(*) FROM public.tenants t
   WHERE NOT EXISTS (SELECT 1 FROM public.legal_entities e WHERE e.tenant_id = t.id)) AS tenants_without_entity,
  (SELECT count(*) FROM public.funds WHERE legal_entity_id IS NULL) AS funds_without_entity,
  (SELECT count(*) FROM public.giving_target_entity_locks) AS locks;
```

2. Confirm no non-`RESTRICT` key to `public.tenants` remains (must be **0**):

```sql
SELECT count(*) FROM pg_constraint
WHERE contype = 'f' AND confrelid = 'public.tenants'::regclass AND confdeltype <> 'r';
```

### The database's certificate

Every connection the job opens to a hosted database checks the server's
certificate and its host name against the project's CA (review L6). The
target check refuses a hosted `RELEASE_DATABASE_URL` unless it says
`sslmode=verify-full`, once. `require` checks nothing without a CA file, and
`verify-ca` never checks the host name. A loopback address, which only the
tests use, is not affected.

At the start of each step the job writes `RELEASE_DATABASE_SSL_CA` to a file
in the runner's temporary directory that only the job can read. It adds the
file to the address as `sslrootcert`, and removes it when the step ends,
whether the step passed or failed. A step stops before it connects if a
hosted release has no `RELEASE_DATABASE_SSL_CA`, or if `RELEASE_DATABASE_URL`
names a CA file of its own. It reads the CA first (review M3): the secret
must hold exactly one PEM certificate and nothing else, a CA, valid now. A
stop says what it found (how many certificates, the subject, the dates, the
SHA-256 fingerprint), never the content. The job pins no fingerprint: the
owner compares it with the one in the step that sets the secrets, and a CA
that Supabase rotates, or that expires, is set again without a release of ours
(see [If the CA is rotated or expires](#if-the-ca-is-rotated-or-expires)). A
CA that Supabase replaces before its expiry date still passes that read: the
step starts, and its first connection fails with a certificate verification
error, which leads to the same section. A hosted step
also stops unless its `psql` is version 16 or later, because an older libpq
ignores `PGREQUIREAUTH` without a word. The same floor holds wherever one of
the three builders that start `psql` from an address connects to a hosted
one: the job's own SQL, the CMS runner, and `scripts/lib/psql.mjs`, which the
reset guard uses (review N6). It does not hold for
`scripts/verify/stripe-data-pipeline.mjs`, which starts `psql` on a hosted
address with a builder of its own. The workflow installs Ubuntu's
`postgresql-client` on `ubuntu-latest`, whose image carries PostgreSQL 16.
Each client checks the chain to that CA and the host name:

- The job's own psql and the reset guard's marker read: libpq, with the file
  as `sslrootcert`.
- The Supabase CLI's `db push` and `db reset` (2.121.0): the file as
  `sslrootcert` in `--db-url`. That version runs both commands in its
  TypeScript code on node-postgres, which reads `verify-full` as
  `rejectUnauthorized` with the CA and the host name.
- Payload's migrations as `cms_owner`: the CA as `PAYLOAD_DATABASE_SSL_CA`, as
  in step 3, and the same CA file as `PGSSLROOTCERT` for the runner's psql.

The same PEM is set twice, under two names, because two holders read it.
`RELEASE_DATABASE_SSL_CA` lives in the GitHub release environments, and only
the release job reads it. `PAYLOAD_DATABASE_SSL_CA` lives on the admin app in
Vercel, where Payload's run-time connection as `cms_runtime` reads it. Neither
reads the other's settings: the job holds no application environment, and no
application holds the job's secrets. So the owner sets each once for each
project. In the migrate step the job turns its secret into what the CMS runner
needs: `PAYLOAD_DATABASE_SSL_CA` for Payload, and `PGSSLROOTCERT`, a file
holding the same PEM, for the runner's own psql. The runner refuses a hosted
migration without both, or whose address does not say `sslmode=verify-full`
(review L7). It reads that file with the job's own check of the CA (one
certificate, a CA, valid now), and refuses `PGSSLROOTCERT=system`, which
libpq reads as the machine's whole certificate store; its `psql` builder does
the same for any hosted address (phase 15), and refuses one for which no CA
file is named at all (phase 16). It reads
`PAYLOAD_DATABASE_SSL_CA` with the same check, and refuses it unless it is the
very certificate that file holds: node-postgres trusts every certificate in
it, so a bundle of authorities would otherwise pass (phase 16).

Until review L6 the address said `sslmode=require`. The job's psql and the CLI
then encrypted the connection without checking the certificate; only Payload
checked it.

The pooler's certificate names `*.pooler.supabase.com` and
`*.pooler.supabase.co`, and chains through Supabase Intermediate 2021 CA to
Supabase Root 2021 CA. That is true on both projects' pooler hosts (TLS
handshakes on 18 November 2026). The direct host was not checked: it has an
IPv6 address only.

### If the CA is rotated or expires

The project's CA today is Supabase Root 2021 CA, self-signed, valid from
28 April 2021 to 26 April 2031 (10:56:53 UTC), SHA-256 fingerprint
`80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA`.
On that date every step stops at its start with "RELEASE_DATABASE_SSL_CA's CA
expired on ...", and nothing connects. If Supabase rotates it sooner, the CA
the job holds still reads as valid, so no step stops at its start. The step's
first connection fails instead, with a certificate verification error: `psql`
says `SSL error: certificate verify failed`, and the Supabase CLI and Payload
report a certificate error of their own. That error does not name this
section: any certificate verification error in a hosted step leads here. The
new CA has a new fingerprint, so the recorded one cannot confirm it. Then:

1. Take the new CA from the project's Database settings (SSL configuration),
   signed in to Supabase with your own account. Never take it from a message,
   a link or a file someone sends: this certificate decides which server the
   job trusts.
2. Check it:
   `openssl x509 -noout -subject -issuer -startdate -enddate -fingerprint -sha256 -ext basicConstraints -in <file>`.
   The subject and the issuer name Supabase Inc (a root CA names itself as
   its issuer), `basicConstraints` says `CA:TRUE`, and today lies between its
   two dates. Then check that the project's pooler chains to it, with a TLS
   handshake and no login:
   `openssl s_client -starttls postgres -connect <pooler host>:5432 -servername <pooler host> -CAfile <file> -verify_hostname <pooler host> -verify_return_error </dev/null`
   must print `Verification: OK` in the middle of its output, after the
   certificate chain, and `Verify return code: 0 (ok)` near its end.
3. Set it as `RELEASE_DATABASE_SSL_CA` in both `release-production` and
   `release-preview`, and as `PAYLOAD_DATABASE_SSL_CA` on the admin app; once
   switch-on step 7 has run, dispatch **Release** anew with operation `release`
   and `apps: all` so the changed variable reaches users, and check that the
   plan step logged `build` for admin, donor and missionary (before step 7,
   redeploy and promote by hand; see step 3 below).
4. In the same pull request as a document change, record the new CA's name,
   dates and fingerprint here and in step 2 of
   [Switching it on](#switching-it-on). No code changes: the job pins no
   fingerprint.

## Secrets and variables

Names only. Values live in GitHub environments and never in the repository.

| Where                                | Name                                                       | Kind     | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------ | ---------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Environment `release-production`     | `RELEASE_SUPABASE_PROJECT_REF`                             | variable | The project production-target deployments use. Until WP11: development, `pnmlrbgjiqzzsthsoikm`                                                                                                                                                                                                                                                                                                                                                                                  |
|                                      | `RELEASE_DATABASE_URL`                                     | secret   | `postgres` on that project's **session pooler** (`postgres.<ref>@<pooler host>:5432`), `?sslmode=verify-full` and no other SSL option. The password goes in the login part (`postgres.<ref>:<password>@`), percent-encoded, never as a `password=` query parameter, which the job refuses. The pooler host is the one the project's Database settings name: development's is `aws-1-us-east-1.pooler.supabase.com`, the preview project's `aws-0-us-west-2.pooler.supabase.com` |
|                                      | `RELEASE_CMS_OWNER_PASSWORD`                               | secret   | 32 to 256 printable ASCII characters, no spaces                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|                                      | `RELEASE_CMS_RUNTIME_PASSWORD`                             | secret   | As above, different from the owner's; the same value goes into the admin app's `PAYLOAD_DATABASE_URI`                                                                                                                                                                                                                                                                                                                                                                           |
|                                      | `RELEASE_DATABASE_SSL_CA`                                  | secret   | The project's CA certificate, the PEM from its Database settings (the same value as the admin app's `PAYLOAD_DATABASE_SSL_CA`). Every step checks the database's certificate and host name against it                                                                                                                                                                                                                                                                           |
|                                      | `RELEASE_SEED_LOGIN_PASSWORD`                              | secret   | 32 to 72 printable ASCII characters, no spaces: the password every seeded login gets on a hosted rebuild                                                                                                                                                                                                                                                                                                                                                                        |
| Environment `release-preview`        | the same six names                                         |          | The preview project's values: `RELEASE_SUPABASE_PROJECT_REF` is `btewedpsxwsjczvmegby`, the production-named project, which is the disposable preview project until WP11. `RELEASE_SEED_LOGIN_PASSWORD` takes the same value as in `release-production`                                                                                                                                                                                                                         |
| Environment `release-owner-approval` | none                                                       |          | Holds no secret. Its required reviewer (the owner) approves each marker change and each first rebuild                                                                                                                                                                                                                                                                                                                                                                           |
| Repository (exist today)             | `VERCEL_TOKEN`, `VERCEL_ORG_ID`                            | secret   | Unchanged                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|                                      | `VERCEL_{ADMIN,DONOR,MISSIONARY}_PROJECT_ID`               | secret   | Unchanged                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|                                      | `VERCEL_{ADMIN,DONOR,MISSIONARY}_AUTOMATION_BYPASS_SECRET` | secret   | Unchanged; used as a header to reach staged and preview deployments                                                                                                                                                                                                                                                                                                                                                                                                             |
| Repository or `release-production`   | `RELEASE_REGISTER_JOB_FUNCTIONS`                           | variable | `true` once Inngest is configured in production; unset otherwise                                                                                                                                                                                                                                                                                                                                                                                                                |

The cms_owner login is derived from `RELEASE_DATABASE_URL` (same host,
`cms_owner.<ref>`, `sslmode=verify-full`), so the job holds one connection
string per environment.
The job hands it to Payload's migrations as `PAYLOAD_MIGRATION_DATABASE_URI`
with `CMS_HOSTED_MIGRATION_REF` set to the project ref; the runner checks that
the user is `cms_owner.<ref>` on that project's pooler and that the address
says `sslmode=verify-full`, with the project's CA. No application environment
holds that variable: a protected
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
hosted data are fixtures, and the production deployments point at the
development database until WP11. There are two hosted projects and no third,
because nothing may raise the Supabase bill: development is the shared
database, and the production-named project (`btewedpsxwsjczvmegby`) is
rebuilt from source as the disposable `preview` project and the project of
WP1.6's hosted proofs. WP11 decides production's own database. The steps
below follow those decisions.

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
   they are new and used nowhere yet. `RELEASE_DATABASE_URL` ends in
   `?sslmode=verify-full` and names no other SSL option. `RELEASE_DATABASE_SSL_CA`
   is the PEM of the project's CA certificate: the file the project's Database
   settings offer under SSL configuration, which Supabase's guide calls
   `prod-ca-2021.crt`. Before you add it, run
   `openssl x509 -noout -subject -fingerprint -sha256 -in prod-ca-2021.crt`.
   Until Supabase rotates its CA (this one expires on 26 April 2031) it
   prints `CN = Supabase Root 2021 CA` and the fingerprint
   `80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA`,
   the CA both projects' poolers chain to. If it prints another name or
   fingerprint, follow
   [If the CA is rotated or expires](#if-the-ca-is-rotated-or-expires)
   instead. If `RELEASE_DATABASE_URL`
   is already set, edit it in both `release-production` and
   `release-preview`: it must end in `?sslmode=verify-full`, with the password
   in its login part. Until then every release stops at its target check,
   before it connects.
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
   Before the reset it puts the platform's default privileges back and stops,
   naming the entry and resetting nothing, if `postgres` then holds any
   default privilege a replay does not start from
   ([What a reset keeps of the default privileges](#what-a-reset-keeps-of-the-default-privileges)).
   Take a logical backup first. The job runs the rebuild, the gates and the
   heads with no pause, so there is no moment to remove what the reset leaves
   behind before the gates: list it first
   ([What the first rebuild does not remove](#what-the-first-rebuild-does-not-remove)).
   On 18 November 2026 development held nothing the gates read that the reset
   would leave: no Edge Function, no custom function secret, no `vault`,
   `net`, `pgmq` or cron rows (report, section 17). If a leftover the gates
   read remains anyway, the gates fail after the reset, which cannot be
   undone. The database is then rebuilt, seeded and marked `disposable`, with
   no heads recorded. Remove the leftovers as that section lists them, then dispatch `first-rebuild` again with the census link, typed confirmation and fresh owner approval. Its gates must pass before the first heads are recorded.
   Check: the run is green, and its log says the rebuild is complete, the
   seeded logins' password was replaced, the database is marked disposable
   and each role password was either already right or set and verified.
   Signing in as
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
     `postgresql://cms_runtime.<ref>:<RELEASE_CMS_RUNTIME_PASSWORD>@<pooler host>:5432/postgres?sslmode=verify-full`
     (development's pooler host is `aws-1-us-east-1.pooler.supabase.com`),
     with no other SSL option, and set `PAYLOAD_DATABASE_SSL_CA` beside it to
     the project's CA certificate (the PEM from its Database settings). A
     protected deployment refuses a pooler URL without that pair, and refuses
     to start Web Studio while `PAYLOAD_MIGRATION_DATABASE_URI` is set
     (`apps/admin/src/cms/payload-database-config.ts`); never add that
     variable to an application environment.

   Check: `bun run verify:runtime-connection-strings` prints
   `Overall: READY`. Undo: restore the previous values (re-adding
   `SUPABASE_DB_URL` reopens NA-04). They reach users only through a release
   dispatched with `apps: all` (step 7).

7. **Release.** First note each app's current live deployment ID (from
   `/api/health/migrations` with the project's bypass header or the project's
   **Deployments** page, as in
   [If a promotion fails part way](#if-a-promotion-fails-part-way)), then
   dispatch **Release** anew from branch `production` with operation `release`
   and `apps` set to `all`. This release must build all
   three apps, because the variables of step 6 reach an app only through a new
   production deployment, and with the default `apps: changed` the job skips an
   app whose files and shared inputs did not change since the commit its
   production domain serves. With `apps: all`, the plan step selects admin,
   donor and missionary regardless of their live commits and logs `build` for
   each, with the reason: read it. If the plan logged `skip` for any app, stop:
   `apps` was left at `changed`, and that app still serves a deployment built
   with the old variables. Dispatch **Release** anew with operation `release`
   and `apps: all` (never re-run an earlier run, and do not redeploy a skipped
   app from Vercel's dashboard: that rebuilds the commit the app serves and not
   the release, the project's Ignored Build Step can cancel it, and its ID is
   not one the run logged). Whenever changed Vercel variables must reach users,
   dispatch **Release** anew with operation `release` and `apps: all` and check
   that the plan step logged `build` for admin, donor and missionary.
   Check: the run is green; the plan step logged `build` for admin, donor and
   missionary; the run's last log line for each app names the deployment ID its
   production domain serves (the job compared that deployment ID, the commit
   and the project ref with each project's bypass secret on the staged
   deployment and again on the production domain); `bun run verify:vercel-production -- --commit <sha>`
   is READY; `curl https://admin.asymmetric.al/api/health/migrations` answers
   `"status":"ok"`, and so does the same path on the donor and the missionary
   production domains (a plain request is not shown the project ref or
   deployment ID); each production domain serves the ID the run logged for that
   app, and no deployment of the commit was created outside the IDs the runs
   logged in the release's window (earlier deployments of the same commit from
   before the release may still appear in Vercel's list).
   Undo: Vercel _Instant Rollback_ to the previous production deployment; it
   stays healthy, because a database that is ahead passes.
8. **The `preview` Supabase project.** No project is created: a third
   project would raise the Supabase bill. The preview project is the
   production-named project, `btewedpsxwsjczvmegby` (us-west-2, pooler host
   `aws-0-us-west-2.pooler.supabase.com`).
   Create the GitHub environment `release-preview` with no branch rule and
   no required reviewer (pull-request runs use it), and give it the six
   names with the preview project's values, except
   `RELEASE_SEED_LOGIN_PASSWORD`, which takes the same value as in
   `release-production`. Set the repository secrets `QA_PREVIEW_TEST_EMAIL`
   to `demo-owner@givehope.test` and `QA_PREVIEW_TEST_PASSWORD` to that
   value: the preview smoke runs, on the development database and on the
   preview database alike, sign in with that pair, and a rebuilt database
   holds only the seeded logins, with that password. The project predates
   WP1 and holds the census's fixtures, so its first rebuild takes the
   census sign-off (D-15), not `empty-project`: dispatch **Release** with
   operation `first-rebuild`, environment `preview`, `census_signoff` the
   sign-off link, confirmation `rebuild btewedpsxwsjczvmegby`, and approve
   its `owner-approval` job. Use the workflow so the rebuild cannot start if
   either replay migration step or fingerprint capture fails. Take a logical backup
   of the project first, and remove what the reset leaves behind
   ([What the first rebuild does not remove](#what-the-first-rebuild-does-not-remove)).
   Done on 18 November 2026: the first rebuild ran directly, the legacy
   objects are removed, SSL enforcement is on, the project is named
   `preview`, and the gates pass with nothing differing.
   The Vercel side has a cost limit. Vercel Pro includes one custom
   environment per project, and `core-development` already holds it in
   `admin`, `donor` and `missionary`; a second costs a pack of five at $50
   a month per project. So `preview-database` is created only in a slot
   that is free, never by buying a pack, and the choice of how to free one
   is made before this step. In each Vercel project the custom environment
   `preview-database` has no branch tracking and holds the Preview
   environment's variables but with the preview project's
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` and (admin) `PAYLOAD_DATABASE_URI` as
   `cms_runtime` with `PAYLOAD_DATABASE_SSL_CA`, as in step 6, and no
   `SUPABASE_DB_URL`.
   Check: label two pull requests that each carry a migration with
   `qa:smoke`; the second's `preview-database-smoke` job waits until the
   first's smoke run ends, and each posts a _Preview Database Smoke QA_
   comment naming the preview project. Development's recorded heads
   (`platform_health()`) are unchanged.
   Undo: delete the custom environments and the GitHub environment. The
   rebuild of the project has no undo.
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
(`bun run cms:qualify`).

Seen on hosted Supabase on 18 November 2026, on the preview project, with the
job's own script
(`docs/audits/core-crm-cms-database-proofs/wp16-hosted-proofs.md`):
`db reset --db-url` and the whole chain; the CMS role migration applied by a
`postgres` that is not a superuser; Payload's migrations as `cms_owner` over
`sslmode=verify-full` through the session pooler, whose certificate chains to
Supabase's root CA; the pinned CLI reading `PGPASSWORD`; both CMS roles through
the session and the transaction pooler, and each role's connection limit; a
sign-in through Supabase Auth with `RELEASE_SEED_LOGIN_PASSWORD`, and the
published password refused; Payload's start-up as `cms_runtime` with no DDL;
a human command on a signed-in token, with the assignment header sent from a
server and from a browser on another origin; and fingerprint equality, once
the replay carries the hosted defaults.

Two pooler behaviours bear on the CMS roles' limits. The pooler keeps a
client's server connection open for about two minutes after the client
leaves, and that connection counts against the role's limit, so `cms_owner`'s
limit of 2 can be full while no client is connected. A later client of the
same role in the same mode reuses that held connection, so the job's CMS
steps, which run one after another on the session pooler, stay within the
limit. In transaction mode a client beyond the limit loses its connection
rather than waiting, and connections held in one mode are not available to
the other.

The pooler also caches each role's credentials: a login right after a
password change can be refused (above, "The CMS role passwords"). Seen on the
second rebuild of the preview project, and the reason the password step now
changes a password only when its secret is refused.

Not yet run against a hosted service: Vercel creating a staged production
deployment through the API and promoting it; a gitSource deployment into the
`preview-database` custom environment (the job fails closed if Vercel ignores
the environment); `supabase db push` on a hosted project; fingerprint equality
with development after its first rebuild; and the preview group's queueing
under GitHub's `queue: max` (documented for `jobs.<job_id>.concurrency` and
for the workflow-level `concurrency` the release workflow now uses too).

Added by council round 2. The first four are now seen on hosted Supabase
(18 November 2026, above); the last two are still to be seen:

- Seen: the CMS role migration applied by hosted `postgres`, which holds
  CREATEROLE but is not a superuser. Proved first on Supabase's own Postgres
  image (17.11.0.004, `createrole_self_grant` empty): the earlier migration
  stopped at `ALTER SCHEMA cms OWNER TO cms_owner` with "must be able to SET
  ROLE", and this one applies, twice.
- Seen: Payload's migrations as `cms_owner` over `sslmode=verify-full` against
  `RELEASE_DATABASE_SSL_CA` through the session pooler. The pooler's
  certificate names `*.pooler.supabase.com` and chains through Supabase
  Intermediate 2021 CA to Supabase Root 2021 CA.
- Seen: `preflight`, `gates` and `record-heads` with `RELEASE_DATABASE_URL` at
  `sslmode=verify-full` and the CA from `RELEASE_DATABASE_SSL_CA` (review L6).
  `db push` and `db reset` under `verify-full` were seen only on the
  operator's own Postgres with TLS (`wp16-hosted-proofs.md`, section 22).
- Seen: the pinned CLI reading the password from `PGPASSWORD` against the
  hosted pooler.
- Seen: signing in as a seeded login with `RELEASE_SEED_LOGIN_PASSWORD` after a
  rebuild. Supabase Auth accepts the Argon2id verifier and refuses the
  published password.
- The detail of `/api/health/migrations`: that Vercel passes the
  `x-vercel-protection-bypass` header through to the route, on staged
  deployments and on the production domains, and sets
  `VERCEL_AUTOMATION_BYPASS_SECRET` and `VERCEL_DEPLOYMENT_ID` at run time
  (System Environment Variables enabled). If either is missing, the staged
  check fails closed ("answered without its detail" or "expected deployment
  <id>, saw unknown") and nothing is promoted.
- The `owner-approval` job: that a dispatched marker change or first rebuild
  waits for the required reviewer, that a rejection skips the work, that
  **Re-run failed jobs** skips it too (the approval output names the earlier
  run attempt), and that a push still runs the database and deploy jobs
  although the approval job is skipped (both carry a status function for that
  reason).
