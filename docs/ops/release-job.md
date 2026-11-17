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
   `scripts/cms/run-payload-command.mjs`. Both ledgers must then hold every
   source migration.
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
   this commit, against the expected Supabase project, does it promote them
   all. Promotion does not rebuild. A failed build or check promotes nothing.
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
in `docs/security/service-role-client-allowlist.json`. The allowlist does not
change: frozen acceptance suites cap it (#2253, #2312) and pin its bytes (#2308).

| Database compared with the build | Answer                     | Effect                                          |
| -------------------------------- | -------------------------- | ----------------------------------------------- |
| Same heads, or later             | `200`, `status: "ok"`      | Promotable; a rolled-back app stays healthy     |
| Earlier on either ledger         | `503`, `status: "behind"`  | Not promoted                                    |
| Build carries no heads           | `503`, `status: "unknown"` | Not promoted                                    |
| Function missing or call fails   | `503`, `status: "error"`   | Not promoted; only a PostgREST error code shown |

The body also names the Supabase project ref the app reads, the environment
marker, and the commit.

### Dispatched operations

Run from the Actions tab, workflow **Release**, branch `production`:

| Operation                | Inputs                                                         | What it does                                                                                                                                                                                                                                                                        |
| ------------------------ | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `release`                | `environment: production`                                      | Re-runs the release of the `production` head                                                                                                                                                                                                                                        |
| `set-environment-marker` | `environment`, `marker`, `confirmation: <ref>:<marker>`        | Moves the marker forward only: disposable to shared to production. The owner approves each change (plan 7.5)                                                                                                                                                                        |
| `first-rebuild`          | `environment`, `census_signoff`, `confirmation: rebuild <ref>` | The one-off rebuild of a database with no marker: drop what migrations made, apply every migration, seed, Payload migrations, gates, heads. Takes the owner's census sign-off (a link to the issue or comment), or `empty-project` for a new project, which the job checks is empty |
| `set-cms-role-passwords` | `environment`                                                  | Sets `cms_owner` and `cms_runtime` from the secrets and proves each can log in. For rotation and after a restore (plan 8.5)                                                                                                                                                         |

Only SCRAM-SHA-256 verifiers computed on the runner reach the database; the
plain passwords never appear in SQL, argv or logs.

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
directly (`npx supabase@<pin> db reset --db-url …`, the version read from
`scripts/supabase-cli.mjs`), and nothing else does. It exists only in the
release job's dispatched `first-rebuild` step, from the `production`
branch, and runs only after all of these hold:

- the connection addresses the environment's configured project, never the
  production-named one, as `postgres`, over TLS;
- the database has no marker (a marked database is refused: it is reset, if at
  all, under the ordinary rule);
- the input is the owner's census sign-off, a link to the issue or comment in
  `Asymmetric-al/core`, or `empty-project` for a new project, which the job
  checks holds no table and no migration ledger;
- the operator typed `rebuild <ref>`.

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

## Secrets and variables

Names only. Values live in GitHub environments and never in the repository.

| Where                              | Name                                                       | Kind     | Value                                                                                                                          |
| ---------------------------------- | ---------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Environment `release-production`   | `RELEASE_SUPABASE_PROJECT_REF`                             | variable | The project production-target deployments use. Until WP11: development, `pnmlrbgjiqzzsthsoikm`                                 |
|                                    | `RELEASE_DATABASE_URL`                                     | secret   | `postgres` on that project's **session pooler** (`postgres.<ref>@aws-0-<region>.pooler.supabase.com:5432`), `?sslmode=require` |
|                                    | `RELEASE_CMS_OWNER_PASSWORD`                               | secret   | 32 to 256 printable ASCII characters, no spaces                                                                                |
|                                    | `RELEASE_CMS_RUNTIME_PASSWORD`                             | secret   | As above, different from the owner's; the same value goes into the admin app's `PAYLOAD_DATABASE_URI`                          |
| Environment `release-preview`      | the same four names                                        |          | The `preview` project's values                                                                                                 |
| Repository (exist today)           | `VERCEL_TOKEN`, `VERCEL_ORG_ID`                            | secret   | Unchanged                                                                                                                      |
|                                    | `VERCEL_{ADMIN,DONOR,MISSIONARY}_PROJECT_ID`               | secret   | Unchanged                                                                                                                      |
|                                    | `VERCEL_{ADMIN,DONOR,MISSIONARY}_AUTOMATION_BYPASS_SECRET` | secret   | Unchanged; used as a header to reach staged and preview deployments                                                            |
| Repository or `release-production` | `RELEASE_REGISTER_JOB_FUNCTIONS`                           | variable | `true` once Inngest is configured in production; unset otherwise                                                               |

The cms_owner login is derived from `RELEASE_DATABASE_URL` (same host,
`cms_owner.<ref>`), so the job holds one connection string per environment.
GitHub-hosted runners have no IPv6, so the direct host
(`db.<ref>.supabase.co`) will not connect; use the session pooler.

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

1. **Create the GitHub environment `release-production`.** Settings,
   Environments, New environment. Deployment branches and tags: _Selected
   branches_, rule `production`. Optionally add yourself as a required
   reviewer, which makes every release wait for approval.
   Check: `gh api repos/Asymmetric-al/core/environments/release-production --jq .deployment_branch_policy`.
   Undo: delete the environment.
2. **Add its secrets and variable** from the table above. Generate the two
   CMS passwords; they are new and used nowhere yet.
   Check: `gh secret list --env release-production` and
   `gh variable list --env release-production` show the four names.
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
   confirmation `rebuild pnmlrbgjiqzzsthsoikm`. It resets the database with the pinned
   CLI directly (the named exception above), applies every migration, which
   creates the marker as `disposable` and the CMS roles, checks the marker,
   seeds, sets the CMS role passwords, runs Payload's migrations, the gates and
   the heads.
   Check: the run is green, and its log says the rebuild is complete, the
   database is marked disposable and both role passwords were verified.
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
     `postgresql://cms_runtime.<ref>:<RELEASE_CMS_RUNTIME_PASSWORD>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require`.

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
   reviewer (pull-request runs use it), and give it the four names with the
   preview project's values. Dispatch **Release** with operation
   `first-rebuild`, environment `preview`, `census_signoff: empty-project`,
   confirmation `rebuild <preview ref>`. In each Vercel project create the
   custom environment `preview-database` with no branch tracking, holding
   the Preview environment's variables but with the preview project's
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` and (admin) `PAYLOAD_DATABASE_URI` as
   `cms_runtime`, and no `SUPABASE_DB_URL`.
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
marker check after it, and the workflows' structure. CI's `migrate` job runs
the release job's real-stack suites and the `issue-2674` suites on every pull
request. Not yet run against a hosted service: Vercel creating a staged production deployment through the
API and promoting it; a gitSource deployment into the `preview-database`
custom environment (the job fails closed if Vercel ignores the environment);
`supabase db push` and `db reset --db-url` on a hosted project; custom login
roles through the session pooler; fingerprint equality with development after
its first rebuild; and the preview group's queueing under GitHub's
`queue: max` (a documented key of `jobs.<job_id>.concurrency`).
