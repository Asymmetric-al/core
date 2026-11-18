# WP1.6: the first hosted run, on the preview project

**Purpose.** WP1.6 owes the platform proofs that only a hosted Supabase project can give (plan section 12, WP1; section 15.2; `docs/ops/release-job.md`, "What still needs a hosted run"). This report records the first hosted run. It took place on the production-named project `btewedpsxwsjczvmegby`, which is the disposable `preview` project until WP11 (the coordinator's ruling of 18 November 2026; `docs/ops/release-job.md`, step 8).

**Base.** Branch `feature/AL-2674-wp16-hosted-mapping` at `946415c20`: stage 1 at `c3d03ca97`, plus the change that lets the preview environment address this project (`0b1d6342c`) and its documents (`946415c20`). Stage 1 is pull request #2714. One of its review fixes edits `20261117040237_role_change_requires_tenant_admin.sql` in place, so this database is rebuilt once more from the new tip. No result below depends on a function of that migration (section 5.4).

**Where it ran.** From the WSL clone `~/code/scratch-clones/wp16-hosted` on the coordinating machine, on 18 November 2026. Everything ran through the project's session pooler `aws-0-us-west-2.pooler.supabase.com:5432`. The machine has no IPv6 route, and the direct host `db.btewedpsxwsjczvmegby.supabase.co` resolves only to IPv6. The tools were Node 24.22.3, the Supabase CLI 2.121.0 that `scripts/supabase-cli.mjs` pins, and psql 17.11. Credentials went from mode 600 files into child processes only. No value appears in an argument, a log or this report.

**Authority.** The owner's authorization of 18 November 2026 allows a hosted rebuild outside the release job. The coordinator approved one first rebuild of this project with the job's own script, in the `preview` environment, and set the rule for a failure: a failed gate stops the run.

## 1. Verdict

**The hosted path works up to the gates, and the fingerprint gate stops it.** The job's script runs on hosted Supabase:

- the CLI's reset;
- all 109 forward migrations, applied by a `postgres` that is not a superuser;
- the seed and the replacement of the seeded login's published password;
- both CMS role passwords, each proved by a login;
- Payload's five migrations as `cms_owner` over `verify-full`.

Both catalog gates pass on hosted.

The schema fingerprint does not equal CI's replay, for two reasons.

1. **Hosted default privileges.** Hosted Supabase gives `postgres` default privileges in `public` that grant `service_role` every table privilege, and EXECUTE on functions. The release job replays the chain on plain Postgres, which has no such defaults. Stage 1 closes the hosted defaults for `anon` and `authenticated` but keeps them for `service_role`, by design. So 106 objects differ, in their access lists only.
2. **Engine leftovers.** The CLI's reset spares the `pgmq` schema by name. The legacy Stripe engine's two queue tables survive it, so 19 objects exist only on hosted.

A replay that applies the hosted defaults first leaves only the 19. As built, the release job therefore stops at its gates on every hosted Supabase project, development included. Section 6 says what stage 1 must change.

The run followed the coordinator's rule and stopped at the failed gate. The Stripe engine's removal, the Stripe webhook change, SSL enforcement and the proofs that write fixtures did not run (section 9).

## 2. Results

Numbers follow section 6 of the hosted plan.

| #   | Proof                                                         | Result                 | Evidence                                                                                                                                                                                                                 |
| --- | ------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | The pooler's certificate chains to Supabase's public root CA  | Pass                   | Ports 5432 and 6543: `*.pooler.supabase.com`, then Supabase Intermediate 2021 CA, then Supabase Root 2021 CA, with the hostname verified; return code 0                                                                  |
| 2   | The pinned CLI reads `PGPASSWORD` against the hosted pooler   | Pass                   | `supabase migration list --db-url` with no password in the URL lists the same 25 remote versions as the Management API                                                                                                   |
| 3   | `db reset --db-url` and the migrations on hosted              | Pass                   | 109 forward migrations applied, 14 `rollback_*` files skipped by name, seed applied; "Rebuild complete; the database is marked disposable"                                                                               |
| 4   | The CMS role migration by a `postgres` that is not superuser  | Pass                   | `postgres` has no superuser flag; `cms_owner` (limit 2) and `cms_runtime` (limit 10) log in and do not inherit; `cms` is owned by `cms_owner`                                                                            |
| 5   | Payload's migrations as `cms_owner` over `verify-full`        | Pass                   | Five migrations in 12 seconds through the session pooler; the Payload ledger holds all five                                                                                                                              |
| 6   | Custom login roles through the pooler                         | Partial                | The script logged in as each CMS role through the session pooler and read the role back. Transaction mode and the connection limits did not run                                                                          |
| 7   | Seeded logins carry the release secret                        | Partial                | The script replaced the published password of the one seeded login, and preflight finds no login with a published password. A sign-in through Supabase Auth did not run                                                  |
| 8   | Payload's start-up as `cms_runtime` cannot change the schema  | Not run                | Stopped at the gate                                                                                                                                                                                                      |
| 9   | Definer functions owned by the guard, which cannot bypass RLS | Partial                | The tenant RLS catalog gate passes on hosted; `tenant_guard` has no bypass; `postgres` holds it with SET and without INHERIT. The human command on a signed-in token and the two rolled-back platform checks did not run |
| 10  | A request header from a server and from a browser             | Not run                | Stopped at the gate                                                                                                                                                                                                      |
| 11  | The schema fingerprint equals CI's replay                     | **Fail**               | 106 objects differ in their access list, and 19 `pgmq` objects exist only on hosted. Against a replay with the hosted defaults, only the 19 differ                                                                       |
| 12  | Marker and heads                                              | Pass, with a deviation | The marker reads `disposable`; the heads read `20261117153112` and `20261117_082928_cms_runtime_ledger_read_only`; preflight passes. The heads were recorded after the failed gate (section 8)                           |

## 3. The run

| Step                               | Started (UTC) | Ended (UTC) | Result                                                                   |
| ---------------------------------- | ------------- | ----------- | ------------------------------------------------------------------------ |
| Password reset (Management API)    | 06:59:26      | 06:59:30    | "Successfully updated password"; the login check passed at 06:59:47      |
| Logical backup and its check       | 07:00:31      | 07:11:22    | 238 tables, each equal to its live count; checksums pass                 |
| Pre-checks                         | 07:48:04      | 07:48:17    | As below                                                                 |
| `first-rebuild`                    | 07:48:45      | 07:55:49    | Exit 0                                                                   |
| of which the reset, chain and seed | 07:48:45      | about 07:55 | About 6 minutes 40 seconds over the pooler                               |
| of which Payload as `cms_owner`    | 07:55:31      | 07:55:43    | Five migrations                                                          |
| `gates`                            | 07:56:25      | 07:57:00    | Exit 1: "Catalog gates failed; the expected heads were not recorded ..." |
| `record-heads`                     | 07:57:01      | 07:57:40    | Exit 0 (section 8)                                                       |
| `preflight`                        | 07:57:40      | 07:57:59    | Exit 0                                                                   |

**Pre-checks.**

- The backup's `sha256sum -c` passes on its 19 files.
- The script's own target check, called through `readReleaseSettings` and `assertTarget`, reads: `environment=preview ref=btewedpsxwsjczvmegby host=aws-0-us-west-2.pooler.supabase.com:5432 user=postgres.btewedpsxwsjczvmegby sslmode=require forbidden=pnmlrbgjiqzzsthsoikm rebuild=disposable`.
- The database has no health function and no `platform` schema, so it has no marker. `preflight` stops with "The database has no release health function: it predates WP1. Its first rebuild is the dispatched first-rebuild step."

**Inputs.**

- `RELEASE_ENVIRONMENT=preview` and `RELEASE_SUPABASE_PROJECT_REF=btewedpsxwsjczvmegby`.
- The census sign-off, https://github.com/Asymmetric-al/core/issues/2671#issuecomment-6945037135.
- The confirmation `rebuild btewedpsxwsjczvmegby`.
- The five secrets, each from its own file.
- The replay fingerprint `1bdbe4d4f1245eea65222f60f8e89b24b91e7730b2c17e16c90d51b66fe23605` (5,893 objects). It was captured from the database `wp16_release_replay` on the shared test Postgres (17.10), exactly as `release.yml` captures its own.

**What `first-rebuild` printed**, less the 109 "Applying migration" lines, the 14 lines that skip a rollback file and Payload's own log, which is condensed to one line:

```text
Rebuilding btewedpsxwsjczvmegby from source (first, sign-off https://github.com/Asymmetric-al/core/issues/2671#issuecomment-6945037135).
Do you want to reset the remote database? [y/N] y
Resetting remote database...
Seeding data from supabase/seed.sql...
Replaced the published password of 1 seeded login(s) with RELEASE_SEED_LOGIN_PASSWORD.
Set and verified the cms_owner password.
Set and verified the cms_runtime password.
...Payload: Migrated 20260515_173042_init_payload_cms, 20261022_002409_payload_v4_sizes_to_variants, 20261022_002412_payload_v4_public_beta_metadata, 20261117_040437_payload_v4_beta_9_upload_state, 20261117_082928_cms_runtime_ledger_read_only. Done.
Rebuild complete; the database is marked disposable.
```

**What `gates` printed**, its first lines and its last:

```text
PASS: tenant RLS catalog gate: 145 tenant tables enabled and forced (61 with policies, 84 listed deny-by-default, 0 stale), 84 SECURITY DEFINER functions with RLS-bypassing owners, a fixed search path and no PUBLIC EXECUTE (0 anon-allowlisted); command lanes: 1 human entry points, 0 platform commands, 4 wrappers; ...
PASS: name-collision gate (recorded exceptions only).
Schema fingerprints differ (CI replay vs btewedpsxwsjczvmegby):
- only in btewedpsxwsjczvmegby (19):
  - column pgmq.a_stripe_sync_work.archived_at
  ...
  - schema pgmq
- defined differently (106):
  - function public.admin_contributions_summary(p_tenant_id uuid)
  ...
  - ... 56 more
release-database: Catalog gates failed; the expected heads were not recorded and nothing was deployed.
```

## 4. Each proof

### 4.1 The pooler's certificate chain

**Run.** `openssl s_client -starttls postgres` against ports 5432 and 6543 of the pooler, with `-CAfile` set to Supabase's public root CA and `-verify_hostname` set to the pooler. The CA came from `https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt`. Its SHA-256 fingerprint is `80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA`, and it is valid to 26 April 2031.

**Seen.** Both ports present three certificates: `*.pooler.supabase.com`, then Supabase Intermediate 2021 CA, then Supabase Root 2021 CA. Verification returns 0. Every later `verify-full` connection, by psql, the CLI's psql steps and Payload, succeeded against the same file.

**Not shown.** Whether the dashboard's "Download certificate" serves the same file. The fingerprint above is the one to compare. The direct host was not reachable from this machine.

### 4.2 The pinned CLI reads `PGPASSWORD`

**Run.** `supabase migration list --db-url "postgresql://postgres.btewedpsxwsjczvmegby@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require"`, with the password in `PGPASSWORD` and CLI 2.121.0, before the rebuild.

**Seen.** 25 remote versions, the same 25 that `GET /v1/projects/{ref}/database/migrations` returns. The rebuild's reset, which passes the password the same way, then connected too.

### 4.3 The reset and the chain on hosted

**Seen.** The CLI's remote reset runs its `drop.sql` (`apps/cli-go/pkg/migration/queries/drop.sql` at tag `v2.121.0`). It then applies the 109 forward migrations and `supabase/seed.sql`, and skips the 14 `rollback_*` files by name. After it:

- the ledger holds 109 rows with head `20261117153112`;
- `auth.users` holds one login, `demo-owner@givehope.test`: the reset truncates every `auth` table, so the census's real people's logins are gone (D-15, O-2);
- the seed's rows are present: 1 tenant, 1 profile, 15 donors, 187 donations and 3 memberships;
- `pg_cron`, `pgmq`, `wrappers` and `btree_gist` are dropped, and the `stripe` and `cron` schemas are gone.

**Not shown.** `supabase db push` on hosted: a first rebuild applies the chain through the reset, and push runs only in a `release`.

### 4.4 The CMS role migration on hosted

**Seen.**

| Role                      | Login | Superuser | Inherit | Create role | Bypass RLS | Limit |
| ------------------------- | ----- | --------- | ------- | ----------- | ---------- | ----- |
| `postgres`                | yes   | no        | yes     | yes         | yes        | none  |
| `cms_owner`               | yes   | no        | no      | no          | no         | 2     |
| `cms_runtime`             | yes   | no        | no      | no          | no         | 10    |
| `tenant_guard`            | no    | no        | no      | no          | no         | none  |
| `document_cutover_reader` | no    | no        | yes     | no          | no         | none  |

`postgres` holds `cms_owner` twice: with ADMIN, and with INHERIT and SET. It holds `tenant_guard` with ADMIN, and with SET but no INHERIT. It holds `cms_runtime` and `document_cutover_reader` with ADMIN only. `cms` is owned by `cms_owner`; `authz`, `platform`, `tenant_guard` and `document_cutover` are owned by `postgres`. `createrole_self_grant` is empty, as on the local image of D-27. The migration that stopped at `ALTER SCHEMA cms OWNER TO cms_owner` in council round 2 applies on hosted.

### 4.5 Payload's migrations as `cms_owner`

**Seen.** The runner took the `cms_owner` login on the same pooler host with `sslmode=verify-full` and the CA, and applied five migrations in 12 seconds. `cms.payload_migrations` holds those five, in batch 1. The legacy schema-push marker (`dev`, batch -1) is gone with the old `cms` schema.

### 4.6 Custom login roles through the pooler

**Seen.** The script's password step logs in as `cms_owner.btewedpsxwsjczvmegby` and `cms_runtime.btewedpsxwsjczvmegby` through the session pooler with each new password, and reads `current_user` back as the role. It printed "Set and verified" for both. Only SCRAM verifiers reached the server.

**Not run.** The same logins on the transaction pooler (6543), and what a client sees at each role's connection limit.

### 4.7 Seeded logins

**Seen.** "Replaced the published password of 1 seeded login(s) with RELEASE_SEED_LOGIN_PASSWORD." `preflight`, which refuses any database where a login carries a password the repository publishes, passes. So no repair step was needed.

**Not run.** A sign-in through Supabase Auth with the release secret, and the refusal of `demo-password`.

### 4.8 Payload's start-up as `cms_runtime`

Not run.

### 4.9 The guard

**Seen.**

- The tenant RLS catalog gate passes on hosted, with the same counts as on CI's replay: 145 tenant tables, 84 definer functions and 1 human entry point.
- `tenant_guard` cannot bypass row security.
- The migration that hands the guard its functions (`GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard`, `ALTER FUNCTION ... OWNER TO tenant_guard`, then the revoke) applies as hosted `postgres`.

**Not run.**

- `public.resolve_command_assignment` called through the Data API on a signed-in token.
- The refusal of another tenant's row.
- Two rolled-back checks: whether hosted `postgres` may grant the guard use of `auth`, and whether it may replace a guard-owned function (the TP4 row of record section 9).

### 4.10 A request header from a server and from a browser

Not run. The probe is written (`public.resolve_command_assignment` reads `x-asym-assignment`), and a headless Chromium is ready in WSL.

### 4.11 The schema fingerprint

Section 5.

### 4.12 Marker and heads

**Seen.** `public.platform_health()` reads:

```json
{
  "environment": "disposable",
  "applied_heads": { "supabase": "20261117153112" },
  "expected_heads": {
    "payload": "20261117_082928_cms_runtime_ledger_read_only",
    "supabase": "20261117153112"
  }
}
```

`preflight` passes. "0 pending" on both ledgers; "Target btewedpsxwsjczvmegby is marked disposable."

## 5. The fingerprint failure

### 5.1 Access lists: hosted default privileges

All 106 objects that differ do so in their access list only. No definition, owner, column, constraint, index, policy or trigger differs. They are 73 tables in `public`, 32 functions in `public` and the schema `public`. The replay grants nothing that hosted lacks. Hosted grants these beyond the replay:

| Objects                                          | Role                                                        | Extra privileges on hosted                                           |
| ------------------------------------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| 40 tables                                        | `service_role`                                              | INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN      |
| 18 tables                                        | `service_role`                                              | DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN                      |
| 7 tables                                         | `service_role`                                              | UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN              |
| 8 tables                                         | `service_role`                                              | TRUNCATE, REFERENCES, TRIGGER, MAINTAIN                              |
| 17 functions                                     | `service_role`                                              | EXECUTE                                                              |
| 15 functions with the default list in the replay | PUBLIC, `anon`, `authenticated`, `postgres`, `service_role` | EXECUTE named explicitly. PUBLIC already executes them in the replay |
| schema `public`                                  | `anon`, `authenticated`, `postgres`, `service_role`         | USAGE named explicitly. PUBLIC already has it in the replay          |

The cause is the platform's default privileges. Read on both databases (`pg_default_acl`, schema `public`):

| Database                  | Owner role       | Tables                                                   | Functions                              | Sequences                          |
| ------------------------- | ---------------- | -------------------------------------------------------- | -------------------------------------- | ---------------------------------- |
| Hosted, after the rebuild | `postgres`       | `postgres` and `service_role`: all                       | `postgres` and `service_role`: EXECUTE | `postgres` and `service_role`: all |
| Hosted, after the rebuild | `supabase_admin` | `postgres`, `anon`, `authenticated`, `service_role`: all | the same four: EXECUTE                 | the same four: all                 |
| CI's replay               | `postgres`       | `service_role`: SELECT                                   | none                                   | none                               |

One table shows it: `public.donations` grants `service_role` every privilege on hosted, and SELECT only on the replay.

Stage 1 chose this split. `20261117034926_close_default_privileges_and_demo_grants.sql` closes the hosted defaults of `postgres` for `anon` and `authenticated` (lines 75 to 80) and leaves `service_role`'s. Its acceptance harness replays the chain with the hosted defaults (`tests/unit/acceptance/issue-2674/privileges-harness.ts:132-135`), and its tests leave the service role's grants as they are: "The platform lane is unchanged (hosted defaults may add DELETE there)" (`privileges-manifest.realstack.acceptance.test.ts:371-390`). The release job's replay does not apply those defaults: neither the step "Replay every migration on a fresh database" in `.github/workflows/release.yml` nor the same step of the `preview-database` job in `.github/workflows/qa-smoke-preview-deploy.yml`. So the fingerprint compares a hosted database with defaults against a replay without them.

### 5.2 Engine leftovers: `pgmq`

The CLI's `drop.sql` skips any schema named `pgmq`. It drops the `pgmq` extension, but the queue tables `pgmq.q_stripe_sync_work` and `pgmq.a_stripe_sync_work` are not members of the extension, so they survive. They are the 19 objects only on hosted: two tables, their columns, a primary key, three indexes and the schema.

The reset also spares two other things. `vault` keeps the engine's three secrets. The kept `pg_net` extension keeps six rows in `net._http_response`. The fingerprint excludes `vault` and `net`, so neither shows in the gate. The `pgmq` schema is not excluded, so it does.

This affects only this project. Development never had `pgmq`.

### 5.3 A replay with the hosted defaults

**Run.** A fresh database `wp16_replay_hosted_defaults` on the shared test Postgres. Before the chain, it received these statements:

```sql
alter default privileges for role postgres in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges for role postgres in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges for role postgres in schema public grant all on functions to anon, authenticated, service_role;
grant usage on schema public to postgres, anon, authenticated, service_role;
```

Then `scripts/verify/supabase-migrations.mjs` (both gates pass), `bun run cms:migrate` and the fingerprint capture.

**Seen.** Fingerprint `14e4dd8eac71b3db38d91990d11446d0aa08daaeecd61d6b79b64a6beef1446c` (5,893 objects). Against hosted (`18f1042341fd4eddec99385179eeb8b3ed7c15cf9546fc8330d1212954387c90`, 5,912 objects): 0 missing, 0 changed, 19 only on hosted, all of them `pgmq`. The default privileges explain every access-list difference.

### 5.4 The role-change migration

None of the 106 differing objects comes from `20261117040237_role_change_requires_tenant_admin.sql`, whose function is `public.atomic_update_user_role_with_audit`. No proof above calls it. Its in-place edit changes the replay's fingerprint and the hosted one alike, so the comparison must be captured again from the new tip, as the coordinator plans.

## 6. What stage 1 must change

1. **The release job's replay must carry the hosted platform's default privileges.** This applies to:
   - the step "Replay every migration on a fresh database" in `.github/workflows/release.yml`;
   - the same replay in the `preview-database` job of `.github/workflows/qa-smoke-preview-deploy.yml`;
   - any direct run of `release-database.mjs gates`.

   Each must apply the four statements of section 5.3 to the fresh database before `scripts/verify/supabase-migrations.mjs`. The narrowest form is one shared source of those statements, used by both workflows and by `privileges-harness.ts`, so that the harness and the release job cannot drift apart. Test first: a fingerprint of the plain replay must differ from one with the defaults, and the release workflow test must find the defaults step before the replay. Until this lands, every hosted `release`, `first-rebuild` and preview rebuild stops at its gates.

   The alternative is to close `service_role`'s hosted defaults as well, and to revoke what they granted. That changes what the service key may do on 73 tables, so it is a decision for the coordinator, not a gate fix. TRUNCATE on `public.donations` is one of those privileges. Plan 7.2 keeps the platform lane's power in a code allowlist, and the database grants alone do not narrow it.

2. **The preview project needs its legacy objects removed once.** These are the queue tables and schema `pgmq`, the three vault secrets and the six `net._http_response` rows. Do it with the Stripe engine's removal (B of the coordinator's brief) and before the next gate. The CLI's reset will not do it. No change to stage 1's code is needed for development.

## 7. What the platform's `postgres` role could and could not do

| Could                                                                                                                                                 | Could not, or not shown                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Run the CLI's reset: drop the non-platform schemas and extensions, drop `public`'s objects and every policy, truncate `auth` and the migration ledger | Act as a superuser: it has no superuser flag                                                                                    |
| Create the four stage 1 roles, and grant itself `tenant_guard` with SET and without INHERIT                                                           | Grant `tenant_guard` use of the `auth` schema: not tested                                                                       |
| Hand `cms` to `cms_owner` and functions to `tenant_guard`                                                                                             | Replace a function the guard owns without the migration's grant-and-revoke: not tested                                          |
| Set login passwords as SCRAM verifiers, and read `pg_roles`                                                                                           | Make its pooled session read-only with a startup option: the pooler drops the `options` parameter, so `PGOPTIONS` has no effect |
| Bypass row security (it holds BYPASSRLS), and create roles (CREATEROLE)                                                                               |                                                                                                                                 |

Other settings read: `max_connections` 60, `password_encryption` `scram-sha-256`, `ssl` on, Postgres 17.6. SSL enforcement on the project is off. On a pooled session, `pg_stat_ssl` describes the pooler's own link to Postgres, not the client's.

## 8. A deviation by the operator

The run should have stopped when `gates` failed. The operator's loop went on to `record-heads` and `preflight`. So this database holds expected heads that a failed gate would have withheld, and the gate's message "the expected heads were not recorded" is not true for it.

The heads equal both ledgers, the function only moves them forward, and nothing is deployed against this project. The next rebuild from the new tip replaces the database and the heads. A direct run of the script must stop at the first failed step, as the job does; the runbook says so in section 10.

## 9. What did not run

The brief's rule stops the run at a failed gate, so these wait for the coordinator.

- **The Stripe engine's removal (B).** The three Edge Functions, the function secret `STRIPE_SECRET_KEY`, the vault secrets, the leftovers of section 5.2, and the project's rename to `preview`. The functions' source is in the backup, unopened.
- **The Stripe webhook (C).** Read only. The CLI's stored configuration holds test-mode keys only, and the key in use is a test key. The account has one webhook endpoint, `we_1TRwFtCKW1xvz62wDmPDLukb`. It reads `enabled`, `livemode: false`, 92 events, address `https://btewedpsxwsjczvmegby.supabase.co/functions/v1/stripe-webhook`. It is unchanged. It still delivers: two test payment intents reached the `stripe` schema on 17 November at 21:10 UTC, after the cron job was paused.
- **SSL enforcement (D).**
- **The rest of proofs 6, 7 and 9, and proofs 8 and 10.**

## 10. Where the runbook and the plan must change

- **`docs/ops/release-job.md`, "What it does", step 4 (Gates).** The fingerprint "must equal the replay's exactly". Say that the replay carries the hosted platform's default privileges (section 6, item 1).
- **"What still needs a hosted run".**
  - Now seen on hosted: `db reset --db-url`; the CMS role migration applied by a hosted `postgres` that is not a superuser; Payload's migrations as `cms_owner` over `verify-full` through the session pooler, with the pooler's certificate chaining to Supabase's root CA; the pinned CLI reading `PGPASSWORD`; the seeded-login replacement.
  - Fingerprint equality with a hosted rebuild fails until section 6, item 1 lands.
  - Still to see: `db push`, sign-in with the release secret, transaction-mode logins and connection limits, and everything that needs Vercel.
- **"Why the first rebuild alone may reset an unmarked database", or a new note on direct runs.** A direct run of `release-database.mjs` stops at the first step that fails, as the job does, and never runs `record-heads` after a failed `gates`.
- **Step 8 (the preview project).** The CLI's reset does not remove the `pgmq`, `vault` or `net` leftovers of the legacy engine, nor the project's Edge Functions or their secrets. A one-off removal belongs to this step.
- **Step 5 (first rebuild of development).** Its check, "the run is green", cannot hold until section 6, item 1 lands.
- **Plan 7.4.** "A schema fingerprint compared with CI's fresh replay" becomes "compared with a fresh replay that carries the hosted platform's default privileges".
- **Plan 15.2, the row on definer functions owned by a non-bypass role.** The tenant-guard migration applies on hosted Supabase as `postgres`, without the grant on `auth` (D-27). The grant itself is still untested on hosted.

## 11. How to repeat

From the clone, with the pinned CLI and Node 24.22.3 on the PATH and the release values in the environment (names in `docs/ops/release-job.md`, "Secrets and variables"; `RELEASE_ENVIRONMENT=preview`):

```bash
# The replay, on a disposable Postgres (see section 5.3 for the hosted defaults).
createdb wp16_release_replay
DATABASE_URL=$REPLAY_DATABASE_URL node scripts/verify/supabase-migrations.mjs
PAYLOAD_DATABASE_URI=$REPLAY_DATABASE_URL bun run cms:migrate   # with the release.yml variables
node scripts/release/schema-fingerprint.mjs capture --database-url-env REPLAY_DATABASE_URL --out replay.json

# The hosted steps, stopping at the first failure.
node scripts/release/release-database.mjs preflight      # before: stops, "predates WP1"
node scripts/release/release-database.mjs first-rebuild  # RELEASE_CENSUS_SIGNOFF, RELEASE_CONFIRMATION
RELEASE_REPLAY_FINGERPRINT=replay.json node scripts/release/release-database.mjs gates
node scripts/release/release-database.mjs record-heads
node scripts/release/release-database.mjs preflight
```

The databases `wp16_release_replay` and `wp16_replay_hosted_defaults` stay on the shared test Postgres for review. The hosted fingerprint is kept beside the replay's outside the repository.

## 12. Checks run

- `tests/unit/scripts/release` and `tests/unit/workflows`: 112 passed, 12 skipped (two files that need a database). With `preview-smoke-scope` and `vercel-ignore-build`: 195 passed.
- The mapping change's two tests failed first, on the old lists.
- ESLint on the changed files: no finding.
- `bun run format:check` passes.
- `verify:vercel-build-controls`: every local check passes. Its four remote checks need the `vercel` CLI, which WSL lacks, and fail the same way on `c3d03ca97`.
