# WP1.6: the hosted proofs, on the preview project

**Purpose.** WP1.6 owes the platform proofs that only a hosted Supabase project can give (plan section 12, WP1; section 15.2; `docs/ops/release-job.md`, "What still needs a hosted run"). This report records them. They ran on the production-named project `btewedpsxwsjczvmegby`, which is the disposable `preview` project until WP11 (the coordinator's ruling of 18 November 2026; `docs/ops/release-job.md`, step 8). The project is now named `preview`.

**Base.** Branch `feature/AL-2674-wp16-hosted-mapping`. It started on stage 1 at `c3d03ca97` (pull request #2714), then merged stage 1 at `7a9fc5b39` (merge `fc39fe557`) and at `be59e2a68` (merge `95710bee4`).

- The first rebuild ran at `946415c20`. The gates that pass first ran at `172bd89f0`, which adds the replay fix (section 5).
- One of #2714's review fixes edits `20261117040237_role_change_requires_tenant_admin.sql` in place. So the project was rebuilt again at `51f30dfa2`. That second rebuild stopped at the CMS role passwords (section 8).
- The recovery at `ae09da272` carries the fix for that, and stopped at its gates (section 9).
- The third and fourth rebuilds ran at `3fb11620c`, with both fixes, and pass (section 10).

**Where it ran.** From the WSL clone `~/code/scratch-clones/wp16-hosted` on the coordinating machine, on 18 November 2026: between 06:59 and 09:25 UTC for the first rebuild and its proofs, and between 10:36 and 13:58 UTC for the later rebuilds (sections 8 to 11).

- Every database step went through the project's session pooler `aws-0-us-west-2.pooler.supabase.com:5432`, or its transaction pooler on 6543 where a proof needs it. The machine has no IPv6 route, and the direct host resolves only to IPv6.
- The tools were Node 24.22.3, the Supabase CLI 2.121.0 that `scripts/supabase-cli.mjs` pins, psql 17.11 and Playwright 1.64.1's headless Chromium.
- Credentials went from mode 600 files into child processes only. No value appears in an argument, a log or this report.

**Authority.** The owner's authorization of 18 November 2026 allows hosted work outside the release job. The coordinator approved, for this project only:

- the first rebuild with the job's own script, in the `preview` environment;
- the removal of the legacy Stripe engine;
- the rename, SSL enforcement, and disabling the Stripe test-mode endpoint;
- the gates again after the fix;
- the proofs below, with small fixture writes that were removed afterwards;
- later the same day: the second rebuild, the recovery's `migrate` and gates, two more rebuilds with the fixes, the rotation of both CMS role passwords, the role-change proof in a transaction that was rolled back, and the removal of the function secret `MANAGEMENT_API_URL`. A hand edit of a hosted object and a new migration were not approved.

## 1. Verdict

**The hosted path works end to end on the preview project, and every WP1.6 proof that does not need Vercel or development passes.**

The release job's own script ran the CLI's reset, the 109 migrations, the seed, the seeded-login replacement, both CMS role passwords and Payload's five migrations. Both catalog gates pass on hosted. The schema fingerprint equals CI's replay, with nothing differing.

The first hosted run did not get there. Its fingerprint gate failed, and that failure is the main finding.

- **The cause.** Hosted Supabase gives `postgres` default privileges in `public` before any migration runs. The release job replayed the chain on plain Postgres, which has none. So 106 objects differed in their access lists, and the release job would have stopped at its gates on every hosted project, development included.
- **The fix.** The replay is now made like the platform. It applies the same default privileges first, from one file that the real-stack harness reads too. When a pull request changes one of its listed paths, the Local Supabase Stack workflow checks that such a replay fingerprints exactly as the image the pinned CLI starts. It is not a required check, and it compares with that image, not with hosted: a change of the defaults on hosted is caught by the release's gates.

The legacy engine's leftovers, which the CLI's reset spares, were removed by hand.

The second rebuild, and the recovery after it, found two more defects. Both are in the release job, and both are fixed on this branch:

- **The pooler's credential cache** (section 8). The CMS role step set each password on every run and logged in right after. The pooler still held the old credentials and refused. The step now changes a password only when its secret is refused, then waits for the pooler within a bound.
- **A reset keeps default privileges** (section 9). The second rebuild started from the first one's end state, not where a fresh project starts. So 15 functions lacked grants a fresh project gives them. Both rebuilds now put the platform's defaults back before the reset.

With both fixes, the project was rebuilt twice in a row from the same tip. Each time its fingerprint equals CI's replay (section 10).

## 2. Results

Numbers follow section 6 of the hosted plan.

| #   | Proof                                                        | Result | Evidence                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The pooler's certificate chains to Supabase's public root CA | Pass   | Ports 5432 and 6543: `*.pooler.supabase.com`, then Supabase Intermediate 2021 CA, then Supabase Root 2021 CA, hostname verified, return code 0                                                                                                  |
| 2   | The pinned CLI reads `PGPASSWORD` against the hosted pooler  | Pass   | `supabase migration list --db-url` with no password in the URL lists the 25 remote versions the Management API lists                                                                                                                            |
| 3   | `db reset --db-url` and the migrations on hosted             | Pass   | 109 forward migrations, 14 `rollback_*` files skipped by name, seed applied; "Rebuild complete; the database is marked disposable"                                                                                                              |
| 4   | The CMS role migration by a `postgres` that is not superuser | Pass   | `postgres` has no superuser flag; `cms_owner` (limit 2) and `cms_runtime` (limit 10) log in and do not inherit; `cms` is owned by `cms_owner`                                                                                                   |
| 5   | Payload's migrations as `cms_owner` over `verify-full`       | Pass   | Five migrations in 12 seconds through the session pooler; the Payload ledger holds all five                                                                                                                                                     |
| 6   | Custom login roles through the pooler, and their limits      | Pass   | Both roles log in on 5432 and 6543. At each role's limit, the next session-mode login gets "too many connections for role". Two pooler behaviours bear on the limits (section 4.6)                                                              |
| 7   | Seeded logins carry the release secret                       | Pass   | Supabase Auth signs `demo-owner@givehope.test` in with the release secret (HTTP 200, `aal1`) and refuses `demo-password` (HTTP 400, `invalid_credentials`)                                                                                      |
| 8   | Payload's start-up as `cms_runtime` cannot change the schema | Pass   | Payload ran three statements as `cms_runtime`, none of them DDL. `cms_runtime` is refused a table in `cms` and a read of `public.donors`                                                                                                        |
| 9   | A human command through a definer owned by the guard         | Pass   | `public.resolve_command_assignment` on a signed-in token resolves the named assignment inside its tenant and refuses another tenant's. Both platform checks are recorded (section 4.9)                                                          |
| 10  | The request header from a server and from a browser          | Pass   | The preflight from another origin admits `x-asym-assignment`. Headless Chromium on `https://wp16-probe.example` gets the server's answers: named, missing, cross-tenant and malformed                                                           |
| 11  | The schema fingerprint equals CI's replay                    | Pass   | First run: 106 access-list differences and 19 `pgmq` objects. After the fix and the removal: "Schema fingerprints match (CI replay = btewedpsxwsjczvmegby)", 0 differing. Again after the third and fourth rebuilds (section 10)                |
| 12  | Marker and heads                                             | Pass   | The marker reads `disposable`; the heads read `20261117153112` and `20261117_082928_cms_runtime_ledger_read_only`; preflight passes. The first run recorded heads after a failed gate (section 12). Again after the fourth rebuild (section 10) |

| Other act                                | Result | Evidence                                                                                                                                                      |
| ---------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Removal of the legacy Stripe sync engine | Done   | Functions list empty; `STRIPE_SECRET_KEY` unset; 0 `vault.secrets`; 0 `net._http_response`; no `pgmq`, `stripe` or `cron` schema; nothing only on hosted      |
| Stripe test-mode endpoint                | Done   | `we_1TRwFtCKW1xvz62wDmPDLukb`, `livemode: false`, address this project's `stripe-webhook`: `enabled`, then `disabled` at 08:17:39 UTC                         |
| SSL enforcement                          | Done   | A login without TLS is refused on 5432 and 6543 with "(ESSLREQUIRED) SSL connection is required"; the `verify-full` login works                               |
| Rename                                   | Done   | `production` to `preview` at 08:17:20 UTC; the ref is unchanged                                                                                               |
| The replay against Supabase's own image  | Equal  | Local stack on slot B (`supabase/postgres:17.11.0.004`): its default privileges equal hosted's, and its fingerprint equals a flagged replay's (4,194 objects) |
| Removal of `MANAGEMENT_API_URL`          | Done   | Unset at 13:57:25 UTC. Only the platform's `SUPABASE_*` secrets remain; no Edge Function (section 10)                                                         |

| Later proof                                          | Result | Evidence                                                                                                                                               |
| ---------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A secret that already logs in changes nothing        | Pass   | The recovery's `migrate` and the third and fourth rebuilds: "The cms_owner password already logs in; nothing changed", and the same for `cms_runtime`  |
| Rotation of both CMS role passwords                  | Pass   | Each login refused, each password set once; each logged in on the second attempt, 36 and 37 seconds after its change; limits and fingerprint unchanged |
| A rebuild of a rebuilt project equals a fresh replay | Pass   | Fourth rebuild at `3fb11620c`: "Schema fingerprints match", 0 differing                                                                                |
| A role change for someone in another organization    | Pass   | Refused with SQLSTATE 42501 and the function's own message; a person wholly inside is changed, with one audit row; all rolled back                     |

## 3. The run

| Step                                           | UTC               | Result                                                                        |
| ---------------------------------------------- | ----------------- | ----------------------------------------------------------------------------- |
| Password reset through the Management API      | 06:59:26-06:59:30 | "Successfully updated password"; the `verify-full` login passed at 06:59:47   |
| Logical backup and its check                   | 07:00:31-07:11:22 | 238 tables, each equal to its live count; checksums pass                      |
| `preflight` before                             | 07:48:08-07:48:17 | Stops, as expected: "it predates WP1"                                         |
| `first-rebuild` at `946415c20`                 | 07:48:45-07:55:49 | Exit 0. Reset, chain and seed about 6 minutes 40 seconds; Payload 12 seconds  |
| `gates` (plain replay)                         | 07:56:25-07:57:00 | **Exit 1**: 106 access-list differences, 19 `pgmq` objects only on hosted     |
| `record-heads`, `preflight` (operator's error) | 07:57:01-07:57:59 | Exit 0 (section 12)                                                           |
| Engine removal, rename, Stripe endpoint        | 08:16:11-08:17:39 | Section 6                                                                     |
| SSL enforcement on                             | 08:18:04          | Applied at once; logins checked at 08:18:24                                   |
| Local stack on slot B, started and stopped     | 09:03:41-09:08:34 | Section 5.3                                                                   |
| `gates` (fixed replay at `172bd89f0`)          | 09:15:20-09:15:30 | Exit 0: "Schema fingerprints match (CI replay = btewedpsxwsjczvmegby)"        |
| `record-heads`, then `preflight`               | 09:15:30-09:16:02 | Exit 0, each run only after the step before it passed                         |
| Proofs 6 to 10, fixtures created and removed   | 09:17-09:25       | Section 4                                                                     |
| Read-only probe of the pooler's connections    | 10:36:59-10:37:32 | Section 11                                                                    |
| `preflight`, `gates` at `51f30dfa2`            | 10:58:44-10:59:32 | Preflight 0 pending; **gates exit 1**: the in-place edit differs (section 12) |
| `preview-rebuild` at `51f30dfa2` (second)      | 11:00:08-11:08:31 | **Exit 1** at the CMS role passwords (section 8)                              |
| `migrate` at `ae09da272` (recovery)            | 12:03:31-12:04:45 | Exit 0: both secrets already logged in; Payload's five migrations             |
| `gates` at `ae09da272`                         | 12:05:05-12:05:16 | **Exit 1**: 15 functions differ in their access lists (section 9)             |
| `preview-rebuild` at `3fb11620c` (third)       | 13:17:10-13:30:15 | Exit 0: the defaults put back first; both secrets already logged in           |
| `gates`, `record-heads`, `preflight`           | 13:30:42-13:36:00 | Exit 0: 0 differing                                                           |
| `migrate` after rotating both secrets          | 13:36:23-13:39:55 | Exit 0: each password set once, logged in after 36 and 37 seconds             |
| `preview-rebuild` at `3fb11620c` (fourth)      | 13:44:56-13:54:54 | Exit 0: both secrets already logged in                                        |
| `gates`, `record-heads`, `preflight`           | 13:54:55-13:55:47 | Exit 0: 0 differing                                                           |
| Role-change proof, rolled back                 | 13:56:26-13:56:32 | Section 10                                                                    |
| `MANAGEMENT_API_URL` unset                     | 13:57:25          | Section 10                                                                    |

**Pre-checks before the first rebuild.**

- The backup's `sha256sum -c` passes on its 19 files.
- The script's own target check reads `environment=preview ref=btewedpsxwsjczvmegby host=aws-0-us-west-2.pooler.supabase.com:5432 user=postgres.btewedpsxwsjczvmegby sslmode=require forbidden=pnmlrbgjiqzzsthsoikm rebuild=disposable`.
- The database has no health function and no `platform` schema, so it has no marker.

**Inputs.**

- `RELEASE_ENVIRONMENT=preview` and `RELEASE_SUPABASE_PROJECT_REF=btewedpsxwsjczvmegby`.
- The census sign-off, https://github.com/Asymmetric-al/core/issues/2671#issuecomment-6945037135.
- The confirmation `rebuild btewedpsxwsjczvmegby`.
- The five secrets, each from its own file.
- The replay fingerprint, made as `release.yml` makes it but on the shared test Postgres 17.10, where `release.yml` uses 17.11: `1bdbe4d4…` (5,893 objects) for the first run, from a plain replay; `14e4dd8eac71b3db38d91990d11446d0aa08daaeecd61d6b79b64a6beef1446c` (5,893 objects) for the passing run, from the fixed replay in the database `wp16_release_replay_hd`.

**What `first-rebuild` printed**, less the 109 "Applying migration" lines, the 14 lines that skip a rollback file and Payload's own log, which is condensed to one line:

```text
Rebuilding btewedpsxwsjczvmegby from source (first, sign-off https://github.com/Asymmetric-al/core/issues/2671#issuecomment-6945037135).
Do you want to reset the remote database? [y/N] y
Resetting remote database...
Seeding data from supabase/seed.sql...
Replaced the published password of 1 seeded login(s) with RELEASE_SEED_LOGIN_PASSWORD.
Set and verified the cms_owner password.
Set and verified the cms_runtime password.
(Payload: five migrations, then Done.)
Rebuild complete; the database is marked disposable.
```

**What the passing `gates` printed:**

```text
PASS: tenant RLS catalog gate: 145 tenant tables enabled and forced (61 with policies, 84 listed deny-by-default, 0 stale), 84 SECURITY DEFINER functions with RLS-bypassing owners, a fixed search path and no PUBLIC EXECUTE (0 anon-allowlisted); command lanes: 1 human entry points, 0 platform commands, 4 wrappers; ...
PASS: name-collision gate (recorded exceptions only).
Schema fingerprints match (CI replay = btewedpsxwsjczvmegby).
```

## 4. Each proof

### 4.1 The pooler's certificate chain

**Run.** `openssl s_client -starttls postgres` against ports 5432 and 6543 of the pooler, with `-CAfile` set to Supabase's public root CA and `-verify_hostname` set to the pooler. The CA came from `https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt`. Its SHA-256 fingerprint is `80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA`, and it is valid to 26 April 2031.

**Seen.** Both ports present `*.pooler.supabase.com`, then Supabase Intermediate 2021 CA, then Supabase Root 2021 CA. Verification returns 0. Every later `verify-full` connection, by psql, the script and Payload, succeeded against the same file.

**Not shown.** Whether the dashboard's "Download certificate" serves the same file. The fingerprint above is the one to compare.

### 4.2 The pinned CLI reads `PGPASSWORD`

`supabase migration list --db-url "postgresql://postgres.btewedpsxwsjczvmegby@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require"`, with the password in `PGPASSWORD`, listed the 25 remote versions that `GET /v1/projects/{ref}/database/migrations` returns. The rebuild's reset then connected the same way.

### 4.3 The reset and the chain

The CLI's remote reset runs its `drop.sql` (`apps/cli-go/pkg/migration/queries/drop.sql` at tag `v2.121.0`). It then applies the 109 forward migrations and `supabase/seed.sql`. After it:

- the ledger holds 109 rows with head `20261117153112`;
- `auth.users` holds one login, `demo-owner@givehope.test`: the reset truncates every `auth` table, so the census's real people's logins are gone (D-15, O-2);
- the seed's rows are present: 1 tenant, 1 profile, 15 donors, 187 donations and 3 memberships;
- `pg_cron`, `pgmq`, `wrappers` and `btree_gist` are dropped, and the `stripe` and `cron` schemas are gone.

What the reset spares is section 6.

`supabase db push` did not run on hosted: a first rebuild applies the chain through the reset, and push runs only in a `release`.

### 4.4 The CMS role migration

| Role                      | Login | Superuser | Inherit | Create role | Bypass RLS | Limit |
| ------------------------- | ----- | --------- | ------- | ----------- | ---------- | ----- |
| `postgres`                | yes   | no        | yes     | yes         | yes        | none  |
| `cms_owner`               | yes   | no        | no      | no          | no         | 2     |
| `cms_runtime`             | yes   | no        | no      | no          | no         | 10    |
| `tenant_guard`            | no    | no        | no      | no          | no         | none  |
| `document_cutover_reader` | no    | no        | yes     | no          | no         | none  |

`postgres` holds `cms_owner` twice: with ADMIN, and with INHERIT and SET. It holds `tenant_guard` with ADMIN, and with SET but no INHERIT. It holds `cms_runtime` and `document_cutover_reader` with ADMIN only. `cms` is owned by `cms_owner`; `authz`, `platform`, `tenant_guard` and `document_cutover` are owned by `postgres`. `createrole_self_grant` is empty. The migration that stopped at `ALTER SCHEMA cms OWNER TO cms_owner` in council round 2 applies on hosted.

### 4.5 Payload's migrations as `cms_owner`

The runner took the `cms_owner` login on the same pooler host, with `sslmode=verify-full` and the CA, and applied five migrations in 12 seconds. `cms.payload_migrations` holds them in batch 1. The legacy schema-push marker (`dev`, batch -1) went with the old `cms` schema.

### 4.6 Custom login roles through the pooler

**Run.**

- As `cms_owner.btewedpsxwsjczvmegby` and `cms_runtime.btewedpsxwsjczvmegby`, with `verify-full`, `select current_user` on ports 5432 and 6543.
- On 5432, hold each role's limit in sessions running `pg_sleep(20)`, then open one more.
- On 6543, three `cms_owner` clients, each running a six-second statement at once.

**Seen.**

- Both roles log in on both ports and read back as themselves.
- On 5432, the session past each limit is refused with `FATAL: too many connections for role "cms_owner"` (and `"cms_runtime"`), passed through by the pooler.
- On 6543, two of the three clients lost their connection after 2.1 seconds, and the third finished after 8.2 seconds. The pooler does not queue a client beyond the role's limit in transaction mode; it drops it.
- **The pooler holds server connections after the client leaves, and they count against the role's limit.** One of the held sessions was itself refused, because the pooler still held a server connection from the login check a minute earlier. `pg_stat_activity` then showed 2 idle `cms_owner` and 10 idle `cms_runtime` connections named `Supavisor`. The pooler released them between 2 and 2.5 minutes after their last use.

**What it means.**

- `cms_owner`'s limit of 2 can be full while no client is connected, for about two minutes after any use. The release job's password step logs in as `cms_owner` and Payload's migrations follow at once. That worked in this rebuild, with no headroom.
- For `cms_runtime`, plan 9.3's ceiling of ten connections includes the pooler's idle ones.
- Payload stays on session mode, as plan 9.3 says. In transaction mode, a burst past the limit fails rather than waits.

### 4.7 Seeded logins

**Run.** `POST https://btewedpsxwsjczvmegby.supabase.co/auth/v1/token?grant_type=password` with the project's anon key, as `demo-owner@givehope.test`, once with the release secret and once with `demo-password`.

**Seen.** HTTP 200 with a bearer token at `aal1`, then HTTP 400 `invalid_credentials`. Supabase Auth accepts the Argon2id verifier the script computed on this machine. The session was signed out globally at the end (HTTP 204). No Auth session and no live refresh token remains.

### 4.8 Payload's start-up as `cms_runtime`

**Run.**

1. `extensions.pg_stat_statements_reset()` as `postgres`.
2. `node ../../scripts/cms/run-payload-command.mjs migrate:status` in `apps/admin`, with `PAYLOAD_DATABASE_URI` naming `cms_runtime` on the session pooler with `sslmode=verify-full`, and `PAYLOAD_DATABASE_SSL_CA` beside it. Schema push stays off: the runner sets `PAYLOAD_DISABLE_SCHEMA_PUSH=1`.
3. The statement statistics for `cms_runtime`.
4. As `cms_runtime`: `create table cms.wp16_probe (id int)` in a rolled-back transaction, and `select 1 from public.donors limit 1`.

**Seen.**

- Payload started, read its ledger (five migrations, all run) and finished in 13 seconds.
- As `cms_runtime` it ran three statements: `SELECT to_regclass($1)`, the read of `cms.payload_migrations`, and the pooler's `DISCARD ALL`. There was no DDL and no write.
- The table was refused: "permission denied for schema cms". The read was refused: "permission denied for table donors".

**Not shown.** The admin application's full start serving Web Studio against this project, which waits for a deployment that reads it.

### 4.9 A human command through the guard

**Fixture.** A second tenant ("WP1.6 proof tenant"), and one live membership for the demo owner in it. Both were removed at the end. The demo owner has three live assignments in the demo tenant: donor, missionary, and staff with the member-care sub-role.

**Run.** `POST /rest/v1/rpc/resolve_command_assignment`, with the anon key and the signed-in token from 4.7. The function runs `tenant_guard.resolve_command_assignment` as `tenant_guard`.

| Call                                                     | HTTP | Answer                                                                                                           |
| -------------------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------- |
| Demo tenant, no header                                   | 403  | 42501 "the caller has several live assignments in this tenant and the request names none"                        |
| Demo tenant, the owner's staff assignment named          | 200  | That assignment, role `staff`, sub-role `member_care`, the demo tenant as the guard's tenant, the owner as actor |
| Demo tenant, the owner's assignment in the second tenant | 403  | 42501 "the selected assignment is not a live assignment of the caller in this tenant"                            |
| Second tenant, no header                                 | 200  | The owner's one assignment there, with the second tenant as the guard's tenant                                   |
| Demo tenant, a header that is not a UUID                 | 400  | 22P02 "the assignment header is not a UUID"                                                                      |
| Demo tenant, a stranger's UUID                           | 403  | 42501, as above                                                                                                  |
| No signed-in session (anon key only)                     | 401  | 42501 "permission denied for function resolve_command_assignment"                                                |

**Platform checks**, each as `postgres` in a transaction that was rolled back:

| Check                                                                                        | Answer                                                                                        |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `grant usage on schema auth to tenant_guard`                                                 | `GRANT`: allowed                                                                              |
| `grant select on auth.users to tenant_guard`                                                 | `GRANT`: allowed                                                                              |
| `grant execute on function auth.uid() to tenant_guard`                                       | "WARNING: no privileges were granted for uid" (`auth.uid()` belongs to `supabase_auth_admin`) |
| Replace `tenant_guard.resolve_command_assignment` with its own body                          | "must be owner of function resolve_command_assignment"                                        |
| The same after `set role tenant_guard`                                                       | "permission denied for schema tenant_guard"                                                   |
| `grant create on schema tenant_guard to tenant_guard`, `set role tenant_guard`, then replace | Replaced, still owned by `tenant_guard`                                                       |

Afterwards the function's owner and body are unchanged, and the guard holds neither CREATE on its schema nor USAGE on `auth`.

**What it means.**

- D-27's choice stands. Hosted `postgres` could grant the guard use of `auth`, but not EXECUTE on `auth.uid()`, which only warns. The guard can already execute `auth.uid()` through PUBLIC. Reading the caller from the claims setting needs neither.
- The TP4 row of record section 9 is settled. Replacing a function the guard owns takes the migration's own pattern: grant CREATE on the schema, `SET ROLE tenant_guard`, replace, then revoke. `postgres` alone cannot do it.

### 4.10 The request header from a server and from a browser

**Server.** The calls of 4.9 sent `x-asym-assignment` from this machine. Named, missing, cross-tenant, stranger's and malformed values each reach `tenant_guard.request_assignment_id()` and get the answer above.

**Browser.** A preflight `OPTIONS` from origin `https://wp16-probe.example`, asking for `apikey, authorization, content-type, x-asym-assignment`, answers HTTP 200 with `access-control-allow-headers: apikey, authorization, content-type, x-asym-assignment` and `access-control-allow-origin: *`.

Playwright's headless Chromium then served a page at that origin and called the function with `fetch`, the tokens read from files inside the Node process:

- the named staff assignment: 200, that assignment, in the demo tenant;
- no header: 403, 42501;
- the owner's assignment in the second tenant: 403, 42501;
- `not-a-uuid`: 400, 22P02.

The browser and the server get the same answers. Plan 15.2's fallback, same-origin handlers, is not needed.

### 4.11 The schema fingerprint

Section 5.

### 4.12 Marker and heads

`public.platform_health()` reads `environment: disposable`, `expected_heads: {supabase: 20261117153112, payload: 20261117_082928_cms_runtime_ledger_read_only}`, and `applied_heads: {supabase: 20261117153112}`. `preflight` passes: "0 pending" on both ledgers; "Target btewedpsxwsjczvmegby is marked disposable."

## 5. The fingerprint finding: cause and fix

### 5.1 The first run

Against the plain replay, the gate found 106 objects that differ and 19 that exist only on hosted.

The 106 differ in their access list only: 73 tables in `public`, 32 functions in `public`, and the schema `public`. No definition, owner, column, constraint, index, policy or trigger differs. The replay grants nothing that hosted lacks. Hosted grants these beyond the replay:

| Objects                                          | Role                                                        | Extra privileges on hosted                                      |
| ------------------------------------------------ | ----------------------------------------------------------- | --------------------------------------------------------------- |
| 40 tables                                        | `service_role`                                              | INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN |
| 18 tables                                        | `service_role`                                              | DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN                 |
| 7 tables                                         | `service_role`                                              | UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN         |
| 8 tables                                         | `service_role`                                              | TRUNCATE, REFERENCES, TRIGGER, MAINTAIN                         |
| 17 functions                                     | `service_role`                                              | EXECUTE                                                         |
| 15 functions with the default list in the replay | PUBLIC, `anon`, `authenticated`, `postgres`, `service_role` | EXECUTE named. PUBLIC already executes them in the replay       |
| schema `public`                                  | `anon`, `authenticated`, `postgres`, `service_role`         | USAGE named. PUBLIC already has it in the replay                |

The 19 objects only on hosted are the legacy engine's two `pgmq` queue tables, their columns, key and indexes, and the `pgmq` schema (section 6).

### 5.2 The cause

Hosted Supabase gives `postgres` default privileges in `public` before any migration runs (`pg_default_acl`): `service_role`, `anon` and `authenticated` get all privileges on new tables and sequences, and EXECUTE on new functions. `supabase_admin` has the same defaults for its own objects.

Stage 1's `20261117034926_close_default_privileges_and_demo_grants.sql` closes the defaults of `postgres` for `anon` and `authenticated` (lines 75 to 80), and keeps `service_role`'s by design. Its harness replays with the hosted defaults (`tests/unit/acceptance/issue-2674/privileges-harness.ts`). Its tests leave the service role's grants as they are: "The platform lane is unchanged (hosted defaults may add DELETE there)" (`privileges-manifest.realstack.acceptance.test.ts:371-390`). One table shows the result: `public.donations` grants `service_role` everything on hosted, and SELECT on the plain replay.

The release job's replay, in `release.yml` and in the preview-database job, applied no defaults. So it compared a hosted database with defaults against a replay without them.

### 5.3 The fix

The replay is now made like the platform (commits `eb7646f5e` and `172bd89f0`):

- `scripts/sql/hosted-default-privileges.sql` is the one copy of the platform's default privileges in `public`. It holds the three `alter default privileges` statements and the `public` schema's USAGE grants.
- `scripts/verify/supabase-migrations.mjs --hosted-defaults` applies that file after the compatibility bootstrap and before the first migration. Any other argument is refused, so a misspelt flag never replays without the defaults.
- The real-stack privileges harness reads the same file in place of its own copy.
- `release.yml` and the `preview-database` job of `qa-smoke-preview-deploy.yml` pass the flag.
- The Local Supabase Stack workflow replays the chain on plain Postgres with the flag, fingerprints both its stack and the replay, and fails when they differ. It runs only when a pull request changes one of its listed paths, it is not a required check, and it compares with the image the pinned CLI starts, not with hosted. A change of the defaults on hosted is caught by the release's gates.

**Tests that failed first.**

- In `tests/unit/scripts/release/schema-fingerprint.realstack.test.ts`, the harness's hosted replay stands in for the platform. A plain replay differs from it in access lists only. A replay with the flag equals it. An unknown argument is refused. That "platform" is itself a replay that applies the same file (`privileges-harness.ts`), so the test proves the file is applied at the same point, not that the file equals the platform. What proves the file right is the comparison with Supabase's image on a local stack (below) and the hosted gates of 18 November.
- `tests/unit/scripts/release/hosted-default-privileges.test.ts`: the file holds the statements, both the replay and the harness read it, and no second copy exists in code, tests or workflows.
- `tests/unit/workflows/release.test.ts` and `qa-smoke-preview-deploy.test.ts` pin the flag in both replay steps. The changed assertion carries its reason (record D-18).
- `tests/unit/workflows/local-supabase.test.ts` pins the new comparison.

**The platform's image.** A local stack on slot B (project `wp16-slot-b`, ports 26320 to 26329, image `supabase/postgres:17.11.0.004`) was started and stopped with `--no-backup`. After the chain, its default privileges for `postgres` and `supabase_admin`, and its `public` schema's grants, equal the hosted project's (Postgres 17.6.1.063) exactly. Its fingerprint equals a flagged replay of the same chain without Payload: `39c855e0048082648b692158963c3be99607777aed5c6ef6938675b4475a37a2`, 4,194 objects on both sides. That is why the comparison could go into the workflow.

### 5.4 The second run

At `172bd89f0`, against a fingerprint from the fixed replay (`14e4dd8e…`, 5,893 objects) and after the removal of section 6, `gates` printed "Schema fingerprints match (CI replay = btewedpsxwsjczvmegby)". Nothing differs.

### 5.5 The role-change migration

None of the objects that differed comes from `20261117040237_role_change_requires_tenant_admin.sql`, whose function is `public.atomic_update_user_role_with_audit`, and no proof calls it. Its in-place edit changes the replay's fingerprint and the hosted one alike, so the comparison is captured again after the rebuild from #2714's tip. It was: after the third and fourth rebuilds the function equals the replay's (section 10).

### 5.6 A question for the package that narrows the service key

On hosted Supabase the service key holds every table privilege, TRUNCATE included, on the tables the chain creates in `public`, by the platform's defaults. Plan 7.2 keeps the platform lane's power in a code allowlist, and the database grants do not narrow it. Whether to close `service_role`'s default privileges as well is a security decision. The coordinator records it as a question for WP4a.

## 6. What the reset spares, and its removal

The CLI's `drop.sql` skips the schemas `pgmq`, `vault`, `extensions`, `pgsodium` and `pgtle` and every schema an extension created or `supabase_admin` owns. It keeps the extensions `pg_graphql`, `pg_net`, `pg_stat_statements`, `pgcrypto`, `pgjwt`, `pgsodium`, `plpgsql`, `supabase_vault` and `uuid-ossp`. Edge Functions, their secrets and the project's settings are outside the database.

On this project that left the legacy engine's objects. Each was listed, then removed:

| Object                                                                                       | Before                                                                                           | Removed                                               |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| Edge Functions `stripe-setup`, `stripe-webhook`, `stripe-worker`                             | `ACTIVE`; source kept unopened in the backup                                                     | `supabase functions delete`, 08:16:11 to 08:16:21 UTC |
| Function secret `STRIPE_SECRET_KEY`                                                          | Present                                                                                          | `supabase secrets unset`, 08:16:25                    |
| `vault.secrets` `stripe_setup_secret`, `stripe_sync_skip_until`, `stripe_sync_worker_secret` | 3 rows                                                                                           | Deleted by name, 08:16:45                             |
| `net._http_response`                                                                         | 6 rows, the newest from 17 November 05:44                                                        | Deleted, 08:16:45                                     |
| `pgmq.q_stripe_sync_work`, `pgmq.a_stripe_sync_work`, schema `pgmq`                          | 2 empty tables, 3 indexes, their row types; owned by `postgres`; nothing outside depends on them | Dropped without CASCADE, 08:16:48                     |
| Stripe test-mode endpoint `we_1TRwFtCKW1xvz62wDmPDLukb`                                      | `enabled`, `livemode: false`, aimed at `stripe-webhook`                                          | Disabled, not deleted, 08:17:39                       |

The database removals ran in one transaction, which would have rolled back unless it removed exactly 3 vault rows and 6 `net` rows. Afterwards there is no `vault.secrets` row, no `net` response, and no `pgmq`, `stripe` or `cron` schema. The extensions are those the platform keeps. The function secret `MANAGEMENT_API_URL`, not named in that approval, remained until it was unset with approval later that day (section 10).

The runbook's section "What the first rebuild does not remove" now lists this and the way it is removed.

## 7. What the platform's `postgres` role could and could not do

| Could                                                                                                                                                 | Could not                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Run the CLI's reset, and apply the chain                                                                                                              | Act as a superuser                                                                          |
| Create the four stage 1 roles, and grant itself `tenant_guard` with SET and without INHERIT                                                           | Replace a function the guard owns without the migration's grant-and-revoke (4.9)            |
| Hand `cms` to `cms_owner` and functions to `tenant_guard`                                                                                             | Grant EXECUTE on `auth.uid()`, which belongs to `supabase_auth_admin`: the grant only warns |
| Grant the guard USAGE on `auth` and SELECT on `auth.users` (rolled back)                                                                              | Make its pooled session read-only by a startup option: the pooler drops `options`           |
| Set login passwords as SCRAM verifiers, reset the statement statistics, delete `vault.secrets` and `net._http_response` rows, drop `pgmq`'s leftovers |                                                                                             |
| Bypass row security (BYPASSRLS), and create roles (CREATEROLE)                                                                                        |                                                                                             |

Other settings: `max_connections` 60, `password_encryption` `scram-sha-256`, Postgres 17.6.1.063. SSL enforcement is now on. On a pooled session, `pg_stat_ssl` describes the pooler's own link to Postgres, not the client's.

## 8. The second rebuild: the pooler's credential cache

**Why it ran.** #2714's review fix edits `20261117040237_role_change_requires_tenant_admin.sql` in place. At `51f30dfa2`, `preflight` found 0 pending migrations on both ledgers (10:58:44 UTC). Then `gates` found the edit: `public.atomic_update_user_role_with_audit` is defined differently (10:59:19). The coordinator called a second rebuild.

**What happened.** `preview-rebuild` at `51f30dfa2` ran the reset, the chain and the seed, and replaced the seeded login's password. It then set the `cms_owner` password and logged in as `cms_owner` at once. The pooler refused: "password authentication failed for user cms_owner". The step stopped at 11:08:31, before Payload's migrations; `preflight` at 11:10:23 found Payload's five pending. A read-only login as each role at 11:09:51, about 80 seconds after the refusal, worked with the same secrets.

**The cause.** The pooler (Supavisor) caches each role's credentials. Each `ALTER ROLE ... PASSWORD` writes a new verifier with a new salt, even for the same password. A login right after it can be refused until the pooler fetches the new one (Supabase, "Supavisor error: password authentication failed after rotating database password"). Repeated refusals trip its circuit breaker. In Supavisor v2.10.1 (commit `83ca93e1`, its newest tag on 18 November 2026), 10 refused logins in 150 seconds block the client address for 120 seconds (`lib/supavisor/circuit_breaker.ex`, `:auth_error`). Supabase does not publish which version its pooler runs, so for hosted that bound is an estimate. The step set the same passwords on every release, so every release risked this.

**The fix** (`c452bb6fc`; runbook `ae09da272`, "The CMS role passwords"). The step first logs in with each secret.

- The login works: nothing changes. Every ordinary release takes this path.
- The login is refused for the password, in one of Supavisor v2.10.1's two forms: "password authentication failed for user" naming that role, or "(EAUTHQUERY) unsupported or invalid secret format" for a role with no usable password. The step sets the password once, from a SCRAM verifier computed on the runner. It then logs in again at 0, 30 and 90 seconds after the change.
- The login is refused for any other reason: the step stops at once and changes nothing.

One role costs at most four refused logins, a run at most eight. No message carries a password or a verifier.

**Tests that failed first.** Ten unit cases:

- a secret that logs in changes nothing;
- a wrong password, and the pooler's "unsupported or invalid secret format", are each set once and verified on a later attempt;
- a password that never logs in within the bound stops the step, naming the role and the bound and nothing secret;
- four other refusals set nothing;
- a verification refused for another reason stops at once;
- the bound outlasts 80 seconds and stays under the breaker.

The preview rebuild case failed too, because its fake did not record the change. The release real-stack suite now also proves, on a real Postgres, that a second run leaves both verifiers untouched and that a rotated secret is set once.

## 9. The recovery: a reset keeps default privileges

**What happened.** At `ae09da272`, the fix above on stage 1 at `be59e2a68`, `migrate` passed (12:03:31-12:04:45). Both secrets already logged in, and Payload's five migrations ran as `cms_owner`. Then `gates` failed (12:05:05-12:05:16): 15 functions in `public` differ. The in-place edit no longer does.

**The difference.** Each of the 15 differs only in its access list. The replay grants EXECUTE to `anon` and `authenticated`; hosted does not. PUBLIC executes them on both sides, so who may call them is the same. They are:

- `admin_contributions_summary` and `assert_amount_columns_multiple_of_100`;
- the seven post counters (`increment_post_*` and `decrement_post_*`) and `get_user_post_interactions`;
- `normalize_email`;
- four `updated_at` trigger functions (`set_pdf_template_native_updated_at`, `set_support_hub_updated_at`, `set_support_workspace_updated_at`, `set_workflow_dispatch_updated_at`).

All are made before `20261117034926_close_default_privileges_and_demo_grants.sql`, and none has a grant of its own. They are the 15 functions of section 5.1's "default list" row.

**The cause.** Default privileges belong to a role and a schema. The CLI's reset drops every object in `public` but never `public` itself, so it keeps the default privileges `postgres` holds there. Stage 1's migration closes them for `anon` and `authenticated`. The first rebuild started from the platform's defaults. The second started from the first one's end state, so the functions made before that migration got none of the grants a fresh project gives them. On hosted, the defaults of `postgres` in `public` read `postgres` and `service_role` only: the chain's end state. The `supabase_admin` row is untouched.

**The fix** (`7afd07286`; runbook `3fb11620c`, "What a reset keeps of the default privileges"). Both rebuilds put the platform's default privileges back before the reset. They read them from `scripts/sql/hosted-default-privileges.sql`, the file the replay applies before the chain, and nothing else holds a list of them. Every statement in it runs as hosted `postgres`: it owns those defaults, and as the database's owner it may grant on `public`, which `pg_database_owner` owns. If the step fails, nothing is reset. `migrate` never resets and leaves default privileges alone. No migration was added.

**Tests that failed first.**

- A real-stack test builds a database with the chain and puts the defaults back as the rebuild does. It then resets it with a model of the CLI's reset, a hand copy of the pinned CLI 2.121.0's `drop.sql` (every schema but `public`, and every object in `public`), applies the chain, and compares with a fresh flagged replay. Since review H6 a test fails when the CLI pin moves, and the suite lists what the model cannot show (a `drop.sql` that recreates `public`, defaults in the schemas hosted keeps, objects the real drop leaves, a `postgres` that is not a superuser). Without the step it failed with exactly the 15 functions above.
- Unit cases: the defaults go back from their file before the reset, in both rebuilds; a failure resets nothing; `migrate` leaves them alone. The last is a guard: it passes before and after.
- The single-source test names the rebuild as a reader of the file.

## 10. The third and fourth rebuilds, the rotation and the role change

All ran at `3fb11620c`, each step only after the one before it passed. The gates compared against a fresh flagged replay made as `release.yml` makes it, on the operator's own Postgres: `9705936f5c672c88f164182d5c41c1d74a249c2d91e28c291c2a920d08ad6a2b`, 5,893 objects.

**Third rebuild** (13:17:10-13:30:15).

- "Put back the platform's default privileges in public", then the reset: 109 migrations (14 rollback files skipped by name) and the seed.
- One seeded login replaced.
- Both CMS secrets already logged in ("nothing changed"), so there was no wait.
- Payload's five migrations in 42 seconds.

`gates`: "Schema fingerprints match", 0 differing. Then `record-heads` and `preflight` (13:30:42-13:36:00).

**Rotation proof** (13:36:23-13:39:55). Both stored passwords were replaced with new random 48-character values, then `migrate` ran.

- Each login was refused, and each password was set once.
- Each new password logged in on the second attempt: `cms_owner` 36 seconds after its change, `cms_runtime` 37 seconds after.
- That is four refused logins in the run, inside the bound of 90 seconds and under the breaker.
- Nothing else changed. Both roles keep their limits (2 and 10), no expiry and no inherit. The fingerprint still equals the replay's: its digest is `9705936f…` on both sides.

**Fourth rebuild** (13:44:56-13:54:54). This is the proof that a rebuild of a rebuilt project equals a fresh one. It ran the same steps, and both rotated secrets already logged in. `gates`: "Schema fingerprints match", 0 differing. Then `record-heads` and `preflight` (13:54:55-13:55:47). Proofs 11 and 12 hold again: `platform_health()` reads `environment: disposable`, with expected heads `20261117153112` and `20261117_082928_cms_runtime_ledger_read_only`.

**Role-change proof** (13:56:26-13:56:32). It ran in one transaction that was rolled back, calling the function as `service_role`. The fixtures were two people in the demo organization (the new-user trigger gives each a donor profile there) and a second organization in which one of them has an active membership. The seeded demo owner, an admin, asked for both to become staff.

- The person with the other membership: refused, SQLSTATE 42501, "This person also belongs to another organization; their role cannot be changed here".
- The person wholly inside: changed to staff, with one `role_change` audit row (`oldRole` donor, `newRole` staff).
- After the rollback, no fixture user, profile, organization, membership or audit row remains.

**The last of the old engine.** The function secret `MANAGEMENT_API_URL` was unset at 13:57:25. Only the platform's own `SUPABASE_*` secrets remain, and the project has no Edge Function. The database has no `pgmq`, `stripe` or `cron` schema, no `vault.secrets` row and no `net._http_response` row.

## 11. The connection limit of `cms_owner`

**The question.** Can `cms_owner`'s limit of 2 make the release job fail, given that the pooler holds idle server connections for about two minutes?

**Which connection each CMS step uses.** All of them use the session pooler on port 5432: the password step's logins, Payload's migrations as `cms_owner`, and the ledger check. None uses the transaction pooler or the direct host.

**What the pooler does.** A read-only probe ran at 10:36:59-10:37:32:

- Three session clients, one after another, reused one server connection, and it stayed held, idle, after each.
- Two concurrent session clients took two server connections. Both stayed held.
- With both held by session mode, a transaction-mode client lost its connection.
- Two further session clients reused the two held connections.

**The answer.** The job's CMS steps run one after another in session mode. So they reuse what the pooler holds and stay within the limit, re-runs inside the window included. The limit binds only when more than two `cms_owner` sessions overlap, such as a person running a CMS migration during the job, or when a transaction-mode client meets connections held in session mode. Payload's own pool on the runner is not bounded to 2, a bound that applies only on Vercel or a protected deployment, so it takes node-postgres's default of 10; its migrations stayed within the limit on every run here.

**Recommendation, accepted by the coordinator:** leave the limit at 2.

## 12. Observations, and the operator's deviations

- **Only the step order keeps heads behind the gates.** In the first run the operator's loop ran `record-heads` and `preflight` after `gates` failed. Both passed. So nothing in `record-heads` checks that the gates passed: in the job, the workflow's step order alone keeps heads from being recorded after a failed gate. On this disposable database it did no harm, and the passing run recorded the same heads. The runbook now says that a direct run stops at the first failure.
- **Real-stack suites on the shared test Postgres.** The CMS roles suite (`tests/unit/cms/cms-database-roles.realstack.test.ts`) sets the cluster-wide `cms_owner` and `cms_runtime` passwords in its setup and sets them back to NULL afterwards. The release suite creates and drops two `wp13r_*` roles. The operator ran both on the shared cluster before noticing, against the rule to create and alter no role there. Afterwards both CMS roles have no password and no test role remains. No suite that changes roles was run again.
- **One CMS roles case failed on the shared cluster:** "stops the eleventh cms_runtime connection at the role's limit". Role limits are cluster-wide, and other sessions on that cluster held `cms_runtime` connections during the run. The case does not touch code this branch changes. CI's own cluster is its judge.
- **The local stack's printed credentials.** Starting the slot B stack printed its local publishable key and local S3 key pair, which the operator's output filter missed. They are throwaway values of a local stack that no longer exists. No hosted value was printed.
- **The ledger cannot see an edit in place.** At `51f30dfa2`, `preflight` found 0 pending migrations on both ledgers, while `gates` found the edited function (section 8). A ledger records versions, not contents. So only the fingerprint shows an applied migration that was edited in place. Here a rebuild applied the new text; on a shared or production database a forward migration would have to.
- **The recovery stopped at its first failure.** In the recovery and in the later runs, `record-heads` and `preflight` ran only after `gates` passed.
- **Later real-stack runs** used only the operator's own Postgres container (`postgres:17.11-alpine`, record D-34). It is removed.
- **A unit test timed out under load.** "fails the #2256 v3 census for v3-column-missing" timed out at 60 seconds once, with a load average above 27. Run alone, its file passed, 16 of 16. It does not touch code this branch changes.
- **The pooler drops startup options** (4.6, section 7). The first login check, a single SELECT, ran without a read-only transaction. Every later read used `begin transaction read only`.

## 13. Where the runbook, the plan and other documents change

Done on this branch, in `docs/ops/release-job.md`:

- the replay's hosted defaults;
- the gate counting access lists;
- `record-heads` kept behind the gates by step order only;
- "What the first rebuild does not remove";
- development's pooler host in step 6;
- "What still needs a hosted run", including the pooler's behaviours;
- "The CMS role passwords": a password changes only when its secret is refused, and the wait for the pooler;
- the pooler's credential cache, and its reuse of held connections in session mode;
- "What a reset keeps of the default privileges", and the rebuild's first step.

For the coordinator:

- **Plan 7.4.** "A schema fingerprint compared with CI's fresh replay" becomes "compared with a fresh replay that carries the hosted platform's default privileges".
- **Plan 9.3.**
  - The pooler holds a role's server connections for about two minutes after the client leaves, and they count against the role's limit.
  - In transaction mode, a client beyond the limit is dropped, not queued.
  - The ceiling of ten for `cms_runtime` includes these, and `cms_owner`'s limit of 2 leaves the release job no headroom.
- **Plan 15.2.** These rows are settled on hosted Supabase:
  - definer functions owned by a role that cannot bypass row security;
  - custom login roles through the pooler;
  - Payload's start-up as a role that cannot change the schema;
  - a request header from a server and from a browser across origins.

  Still open: production deployment by the release job, and the deployed revision and role.

- **Record D-27.** Hosted `postgres` may grant USAGE on `auth`, but not EXECUTE on `auth.uid()`. The claims-setting fallback stands.
- **Record section 9, the TP4 row.** Replacing a guard-owned function on hosted Supabase takes the migration's pattern of granting CREATE on the schema, `SET ROLE tenant_guard`, then revoking.
- **WP4a.** The question of section 5.6. With it: the 15 early functions in `public` whose EXECUTE grants to `anon` and `authenticated` come from the platform's default privileges, not from a grant of their own (section 9). Whether they keep those grants is a privilege question, decided with the `service_role` defaults.
- **Plan 7.5 and 8.5.** "Every release sets the CMS role passwords" becomes "every release makes the secrets log in: it changes a password only when its secret is refused, then waits up to 90 seconds for the pooler". A rotation is a new secret, then a release or `set-cms-role-passwords`.
- **Plan 7.5, the rebuild.** A hosted reset keeps `public` and the default privileges held there. So a rebuild first puts the platform's defaults back, from the replay's file.
- **Plan 7.4.** The ledgers check versions only. An applied migration edited in place shows only in the fingerprint, which is what enforces the rule that applied migrations are never edited.
- **Plan 9.3.** `cms_owner`'s limit of 2 holds for the job's own steps, which run one after another in session mode (section 11). Overlap with a person's CMS migration would exceed it.
- **`docs/ci.md`, "Local Supabase stack workflow".** Done: the line was added in `51f30dfa2`, with the six frozen suites that pin the file's bytes (issues 2180, 2250, 2254, 2258, 2260 and 2312) re-taken under D-18, and corrected after review H7, with the pins re-taken again.

## 14. What did not run

- **Everything that needs a deployment:** Vercel staging and promotion through the job, the health route's detail behind the bypass header, a gitSource deployment into `preview-database`, the deployed Payload's role, and the preview group's queueing. These wait for Vercel.
- **`supabase db push` on hosted,** which runs in a `release`.
- **`release.yml` on GitHub.** The release workflow has never run there; every hosted step here ran its script directly.
- **The Local Supabase Stack workflow's new comparison step on GitHub.** It ran only as its parts, by hand.
- **The `preview-database` job** of `qa-smoke-preview-deploy.yml`. It has never run.
- **Fingerprint equality with development,** after its first rebuild.

## 15. How to repeat

From the clone, with the pinned CLI and Node 24.22.3 on the PATH and the release values in the environment (names in `docs/ops/release-job.md`, "Secrets and variables"; `RELEASE_ENVIRONMENT=preview`):

```bash
# The replay, as release.yml makes it, on a disposable Postgres.
createdb wp16_release_replay_hd
DATABASE_URL=$REPLAY_DATABASE_URL node scripts/verify/supabase-migrations.mjs --hosted-defaults
PAYLOAD_DATABASE_URI=$REPLAY_DATABASE_URL bun run cms:migrate   # with the release.yml variables
node scripts/release/schema-fingerprint.mjs capture --database-url-env REPLAY_DATABASE_URL --out replay.json

# The hosted steps, each only after the one before it passed.
node scripts/release/release-database.mjs preflight      # before a first rebuild: stops, "predates WP1"
node scripts/release/release-database.mjs first-rebuild  # RELEASE_CENSUS_SIGNOFF, RELEASE_CONFIRMATION
# Later rebuilds of the marked project: preview-rebuild, with RELEASE_CONFIRMATION.
# Remove what the reset spares (runbook, "What the first rebuild does not remove").
RELEASE_REPLAY_FINGERPRINT=replay.json node scripts/release/release-database.mjs gates &&
  node scripts/release/release-database.mjs record-heads &&
  node scripts/release/release-database.mjs preflight
```

The scratch databases of the first run (`wp16_release_replay`, `wp16_release_replay_hd`, `wp16_replay_hosted_defaults`, `wp16_replay_hd_chain_only` and `wp16_realstack_admin`) were dropped from the shared test Postgres in the clean-up. The later replays ran on the operator's own Postgres container, since removed.

## 16. Checks run

- `tests/unit/scripts/release`, `tests/unit/workflows` and `tests/unit/docs`: 304 passed, 15 skipped (the files that need a database).
- Real-stack suites on the shared test Postgres (17.10), Vitest at 8 workers:
  - `schema-fingerprint.realstack` and `release-database.realstack`: pass, including the new cases;
  - `privileges-manifest.realstack` (the harness): 30 passed;
  - `cms-database-roles.realstack`: 19 passed and the one case of section 12 failed.
- ESLint on the changed files: no finding.
- Prettier on the changed files: formatted.
- The three edited workflows parse.
- The mapping change's two tests, and every test named in 5.3, failed first.

Later, on the operator's own Postgres (`postgres:17.11-alpine`):

- At `ae09da272`: `tests/unit/scripts` and `tests/unit/workflows`, 244 files passed and 2 skipped, 6,301 tests passed and 17 skipped; the release, fingerprint and CMS roles real-stack step, 32 passed and 4 skipped.
- At `3fb11620c`: the same unit suites, 6,306 passed and 18 skipped; the real-stack step, 33 passed and 4 skipped; `tests/unit/docs`, 184 passed. The four skipped real-stack cases are the guards that fail in CI when an admin URL is missing.
- Both tips: `format:check` clean; `lint` and `typecheck` pass, from Turbo's cache, which does not cover the root `scripts` and `tests`; ESLint on the changed files, no error.

## 17. Development, read on 18 November 2026

Review H5 approved these reads of the development project (`pnmlrbgjiqzzsthsoikm`), and nothing else there. They ran at 15:06 UTC through the Management API's query endpoint with the management token, each query a SELECT sent with `read_only`. Nothing was changed and no password was reset.

**Default privileges** (`pg_default_acl`):

- `postgres` in `public`: the platform's own defaults. `postgres`, `anon`, `authenticated` and `service_role` hold all privileges on tables and sequences and EXECUTE on functions.
- `postgres` in `cms`: `service_role` on tables (`arwdxt`) and on sequences (`rwU`), from the chain development carries now.
- `postgres` in `storage`: the platform's defaults, as in `public`.
- `postgres` holds no default for every schema.
- `supabase_admin` (in `public`, `extensions`, `graphql`, `graphql_public` and `realtime`) and `supabase_auth_admin` (in `auth`): the platform's.

**The two checks WP2a's delegate asked for:**

- PostgREST `max_rows`: 1000.
- `has_table_privilege('postgres', 'auth.users', 'SELECT')`: true. `auth.users` holds 8 rows.

**What a reset would leave behind**, by the pinned CLI's `drop.sql`:

- Schemas kept: `auth`, `extensions`, `graphql`, `graphql_public`, `pgbouncer`, `public` (emptied of its 87 tables and 42 functions), `realtime`, `storage`, `supabase_migrations` (its ledger truncated) and `vault`. Dropped: `authz`, `cms` and `private`.
- Extensions: `pg_graphql`, `pg_stat_statements`, `pgcrypto`, `plpgsql`, `supabase_vault` and `uuid-ossp`, all on the keep list. `pg_net`, `pgmq` and `pg_cron` are not installed, so there are no `net`, `pgmq` or `cron` rows.
- `vault.secrets`: no rows.
- Storage: three public buckets, `document-uploads`, `email-assets` and `profiles`, each with no objects.
- Edge Functions: none. Function secrets: `SUPABASE_DB_URL` only, the platform's own.

**What this means for WP1.7, the first rebuild of development.**

- The pre-reset check of section 9 passes there. After the restore, the defaults of `postgres` in `public` are exactly what a replay starts from, and it holds none for every schema. Its `cms` rows go with the `cms` schema, which the reset drops.
- Nothing of the legacy engine is left to remove: no Edge Function, custom secret, vault row, `net` row, queue or cron job. The runbook's step 5 needs no removal before the gates.
- The three buckets survive the reset as rows, which the fingerprint does not read. The chain's bucket migrations ran over the buckets of the previous run in the third and fourth rebuilds of the preview project.
- `pg_net` is installed on the preview project but not on development. The fingerprint leaves extensions out, so this is no difference at the gates.
- The reset truncates `auth`, so the 8 users go, and the seed makes its own.
