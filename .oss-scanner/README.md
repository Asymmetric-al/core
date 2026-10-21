# Anthropic OSS Scanner runbook

Core maintainers own this setup. The intended public registration lives in
[anthropics/oss-scanner](https://github.com/anthropics/oss-scanner) under
`projects/asymmetric-al-core/project.yaml`, targeting
`https://github.com/Asymmetric-al/core#develop` when the preparation has merged.
The designated primary security contact is **blake@globalfellowship.org**,
authorized for public listing in [SECURITY.md](../SECURITY.md).

These files prepare an investigation environment. An image build, local wrapper
check or test pass is not a vulnerability scan, acceptance or confirmation that
Anthropic has built/scanned Core. Anthropic controls acceptance and scheduling.
Track actual milestones and fetched revisions in [Core issue #2177](https://github.com/Asymmetric-al/core/issues/2177);
do not infer success from silence.

## Contents and image build

| File                           | Purpose                                                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `Dockerfile`                   | Full source, development dependencies, native/browser tools and all three built apps at `/src`; no runtime-only stage |
| `build.sh`                     | Controlled, credential-free app/package build profile; Eve artifacts without live sandbox/provider qualification      |
| `run-local.sh`                 | Command-scoped normal/demo environment; drops inherited host configuration                                            |
| `start-services.sh`            | Explicit local PostgreSQL initialization and normal/demo app startup                                                  |
| `smoke.mjs` / `verify-rls.sql` | Normal browser/denial smoke and actual role-switched CRM note RLS checks                                              |
| `test-offline.sh`              | Fail-fast offline checks with declared evidence categories                                                            |
| `threat_model.md`              | Current entry points, assets, boundaries, conditional code, investigation priorities and reporting guidance           |

Build from the repository root. Docker ignore rules exclude local env files,
credentials and irrelevant host outputs. Never add build secrets, host auth
mounts, real provider credentials or a Docker socket to this environment.

```bash
docker build -f .oss-scanner/Dockerfile -t core-oss-scanner:local .
docker run --rm --init --network none --cpus 2 --memory 8g \
  -w /src core-oss-scanner:local bash -lc './.oss-scanner/test-offline.sh'
```

Use the runtime versions declared by Core's current manifests/runtime files and
frozen lockfile. Dependency repairs, workspace links, local vendored PDF packages,
fonts, tests, fixtures and migrations remain available. Changing a runtime,
lockfile, patch, build script, local package, migration or browser dependency
requires rechecking this image. Avoid imposing the image build on unrelated PRs.

The image fetches the migration census's historical Git object anonymously into
`/opt/core-provenance.git`; standalone migration checks use it only for the
existing provenance check. Host Git metadata never enters the build context.
The official wrapper adds the actual anonymously cloned revision's full history
at `/src/.git`, which takes precedence for wrapped-image checks and investigation.

## Explicit audit startup

The scanner replaces Docker startup commands. Processes running during image
construction do not survive. From `/src`, as root with `HOME=/root`:

```bash
./.oss-scanner/start-services.sh db
./.oss-scanner/test-offline.sh
./.oss-scanner/start-services.sh apps
```

PostgreSQL **17.11** listens on loopback port **55432**, with disposable database
`core_scanner` and synthetic local password `scanner-local-only`.
The helper uses the committed Supabase compatibility bootstrap and migration
verifier, then the committed CMS migration/seed path. Fixture SQL lives in `tests/integration/supabase/` and
`.oss-scanner/verify-rls.sql`. The RLS fixture creates tenant A
`f2177000-0000-4000-8000-000000000001` and tenant B
`f2177000-0000-4000-8000-000000000002`, with ordinary member-care staff users
`f2177000-0000-4000-8000-000000000011` and
`f2177000-0000-4000-8000-000000000012` respectively. It verifies own standard
note read/insert, cross-tenant/restricted denial, a mismatched tenant claim and
anonymous denial, then rolls back all fixtures. Inspect the exact fixture before
extending it. These are synthetic identities, not mailbox logins
or credentials for a hosted account.

Normal apps listen on donor **3005**, admin **3030**, missionary **4000**.
The normal profile has a loopback Supabase HTTP URL and no hosted Auth service.
Database health is therefore expected to report **503/degraded**; the smoke check
verifies the surface and degraded state. Protected routes must redirect to
login, and demo-account POST must deny without minting a bypass cookie.
This is useful fail-closed behavior, not proof of successful authenticated
sessions.

Admin's production `withEve` integration may auto-start the built local Eve
HTTP sidecar on loopback. The smoke checks do not invoke Eve sessions or tools.
Do not run `eve start` or admin Next dev: their startup/prewarm behavior is
separate from directly serving built output and is outside this audit profile.
Logs and helper-owned PID files live in `/tmp/core-oss-scanner`; migration and
Payload logs remain there for diagnosis. Stop app process groups explicitly with
`./.oss-scanner/start-services.sh stop`. PostgreSQL remains available for SQL
investigation until the disposable container exits.

Ordinary `db` startup preserves an existing database. After editing migrations,
bootstrap SQL, CMS migration code or seed data, use
`./.oss-scanner/start-services.sh reset-db` to stop helper-owned apps and recreate
only the disposable `core_scanner` database from the current source. This discards
local investigation changes in that database; save any reproduction SQL first.
Other databases and the PostgreSQL cluster remain intact. `test-offline.sh`
always performs this reset before its checks, including on repeated runs, so its
results cannot silently validate a schema left over from before a patch.
If initialization is interrupted or a migration fails, inspect the retained logs,
fix the cause and run `reset-db` before retrying; forward migrations are not
idempotent and ordinary `db` startup cannot repair a partially initialized schema.

The modernization checkpoint supersedes the initial PostgreSQL 15 image with
PostgreSQL 17 on the pinned Node 24 Debian 13 image. Its server/client package
versions are frozen in the Dockerfile. Rebuild the image after changing those
pins and use a fresh disposable container for a database-major change. The helper
refuses an incompatible `PG_VERSION` before stopping apps or changing the database;
`reset-db` does not perform a cluster upgrade. The Docker context also excludes
the opaque vendored `payload.db`; it is not a synthetic scanner fixture.

For a separate UI demonstration (startup stops helper-owned normal apps):

```bash
./.oss-scanner/start-services.sh demo
```

The explicit demo profile starts only the donor Next development server on
port 3005 for the existing donor demo preflight and synthetic role identities.
Normal mode still starts all three built apps. Do not start admin Next dev in
this image: its withEve integration auto-starts Eve development tooling, which
can prewarm a sandbox. That is outside this offline demonstration profile.

## Normal, build and demo profiles

`run-local.sh` executes its command under a clean environment. It does not load
developer `.env.local` or inherit cloud/provider credentials.

```bash
./.oss-scanner/run-local.sh normal node -e 'console.log(process.env.E2E_AUTH_BYPASS)'
./.oss-scanner/run-local.sh demo node -e 'console.log(process.env.E2E_AUTH_BYPASS)'
```

| Profile                 | Meaning and limits                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Normal interactive/HTTP | Loopback public Supabase configuration, E2E bypass false, no global `SKIP_ENV_VALIDATION`. Uses normal handler/role paths. Hosted HTTP services remain absent.                                                                                                                                                                                                                                      |
| Build                   | `build.sh` invokes `bun run build:strict` with loopback public Supabase URL, `E2E_AUTH_BYPASS=false`, `ALLOW_DEMO_ACCOUNTS=false` and no `SKIP_ENV_VALIDATION`. Those public values are compiled into retained Next artifacts. The separate Eve service dispatcher uses command-only hosted-preview signals to skip sandbox prewarming; no provider/sandbox qualification or activation is implied. |
| Demo                    | Donor-only development-mode process with the placeholder datasource and scoped bypass/validation flags. Demo identities/cookies support UI preflight only; they do not prove real Auth, tenant isolation or RLS.                                                                                                                                                                                    |
| Vitest                  | The repository harness supplies placeholder public env/validation settings and mocked providers. Tests must override defaults intentionally to test env/auth settings.                                                                                                                                                                                                                              |

Build metadata is retained at `.oss-scanner/results/build.json`; the separate
Eve service build profile is `.oss-scanner/results/eve-service-build-profile.json`.
The assertions verify all app build IDs, local Eve output, service output and
absence of the sandbox-prewarm phase.

Changing a runtime env URL does not rewrite compiled public values. To investigate
normal authorization, use the normal command profile and inspect both process
configuration and the artifact's compiled public config. Do not promote the demo
profile to the interactive shell or mistake demo output for a hosted security
verification. Code guards, roles and governance remain intact.

## Offline verification and patch investigation

`test-offline.sh` resets the disposable local database and runs bounded security-relevant Vitest tests, local migration/
database SQL checks, normal app health/denial/browser checks and a separate
explicit demo preflight. Its exit status must propagate. Read its actual test
selection and output; passing selected tests does not mean the full suite ran.

Evidence categories remain separate:

- **Unit/provider fixtures:** useful for signature parsing, ownership helpers,
  authorization decisions, idempotency and governance seams. Mocks do not prove
  provider deployment, real Supabase Auth or RLS.
- **Local PostgreSQL:** migrations, selected donation replay/Eve SQL and
  role-switched tenant/RLS checks execute against PostgreSQL. Compatibility
  functions set synthetic JWT claims; they do not verify tokens. This is not
  the full Supabase Auth/PostgREST/Storage/Realtime stack.
- **Normal app smoke:** startup, expected degraded observability, login rendering
  and denial with normal auth paths. Successful real authenticated operations
  remain outside this environment's coverage.
- **Demo browser checks:** synthetic UI preflight with explicitly enabled demo
  auth. These are not authentication, payment or tenant-isolation proofs.

No hosted integrations, actual payment/refund, outbound email, cloud storage,
live Inngest, model call, Eve sandbox provisioning or GitHub mutation is tested.
The full Playwright inventory, full unit suite and production deployment
qualification are not implied by this bounded runner. Keep all corresponding
source available for inspection and report reproduction limits honestly.

After a local patch, rerun the smallest matching committed tests through the
appropriate profile. For example, select a specific existing Vitest file:

```bash
./.oss-scanner/run-local.sh normal env NODE_ENV=test node node_modules/vitest/vitest.mjs run \
  tests/unit/packages/api/eve-admin-session-ownership.test.ts \
  --maxWorkers=2 --no-file-parallelism
./.oss-scanner/build.sh
./.oss-scanner/test-offline.sh
```

The build reuses installed dependencies and local browser/font assets. Do not
download dependencies during offline patch verification. Runtime/build-path
changes need a fresh image as well as tests.

## Official wrapper validation

Use a fresh checkout of the current upstream repository and its unchanged tools.
Record its revision, the configured Core branch and the anonymously fetched Core
SHA. A local worktree edit is absent until it is published.

```bash
python3 tools/validate.py
python3 tools/check --no-shell asymmetric-al-core
docker run --rm --init --network none --cap-add SYS_PTRACE \
  --cpus 2 --memory 8g -w /src \
  oss-scanner-check/built:asymmetric-al-core \
  bash -lc './.oss-scanner/test-offline.sh'
```

Verify the current upstream image naming/arguments before reuse. `--no-shell`
proves wrapper build/startup only. Run explicit tests and capture their real exit
status; the interactive helper may discard the shell's status. Independently
confirm the remote Dockerfile and threat model exist and are present in the
wrapped image. Schema validation alone does not check remote files.

Temporary branch registrations are local validation inputs only. The final
registration must target maintained `develop` after merge and pass the wrapper
and offline checks again against that remote target.

## Notifications, private triage and resumption

The manifest's primary contact receives all program communications, including
build failures and findings, according to the current service FAQ. This designation does not prove
email delivery or access to that mailbox. No CC or PGP recipient is configured.
Track separate evidence for submission, acceptance/merge, Anthropic build,
first scan and any delivered findings. If only Blake's mailbox can confirm a
step, record the exact confirmation needed without accessing it under another
identity or calling the step complete.

Authorized maintainers triage reports privately under [SECURITY.md](../SECURITY.md)
and the [current service terms](https://red.anthropic.com/oss-scanner/terms/).
Reports are confidential and used to identify, assess and fix Core bugs; share
only with authorized maintainers under the terms. Validate proposed patches
before use. Preserve Core's acknowledgement, update and coordinated-disclosure
commitments. The program currently imposes no forced disclosure timeline for
unvalidated reports; a later manually validated finding may enter Anthropic's
90-day coordinated-disclosure process from notification. Read the actual report
and current agreement rather than assuming one universal deadline.

1. Retain the report privately; record the affected SHA and environment without
   publishing unpatched details or credentials.
2. Reproduce at that revision in a disposable local image. Record attacker
   permissions, relevant activation/configuration, expected/observed behavior
   and whether provider seams are mocked or real.
3. Check duplicates by underlying cause; decide validity from reachable source,
   controls and evidence. Keep unsupported prerequisites explicit.
4. Prepare a focused fix and meaningful regression test, review both, and run
   normal Core gates. Suggested patches are candidates; do not auto-apply/merge.
5. Give factual validity/reproduction feedback through the report's official
   reply channel. Follow the service confidentiality terms and Core's private
   disclosure process for any later publication.

Use the existing enrollment work item to record the last completed milestone,
Core and upstream PRs/revisions, wrapper/offline output, external review state
and exact next action. A submitted PR is not acceptance; an accepted registration
is not proof of a completed scan; no findings is not proof Core is secure.

## Update, pause or withdraw

- **Recipient:** update the upstream `primary_contact` and Core security/runbook
  designation together through maintainer-reviewed PRs. Confirm the actual
  provider requirement if verification is requested; do not assume delivery.
- **Build/threat model:** update Core first, run focused checks and
  `bun run ci:preflight`, merge through normal review, then validate the final
  upstream registration against the maintained branch. Keep code and model
  current when boundaries or activation change.
- **Pause:** submit an upstream registration change with `disabled: true` and
  record its merged state; a local edit alone does not pause the service.
- **Resume:** revalidate the maintained target, request `disabled: false` and
  verify acceptance/build feedback.
- **Withdraw:** submit an upstream PR deleting
  `projects/asymmetric-al-core/`, then verify it merged and record confirmation.
  Follow current terms for retained reports/data questions.
- **Program questions:** the current
  [OSS Scanner FAQ](https://red.anthropic.com/oss-scanner/) lists
  `oss-scanner-questions@anthropic.com`; recheck before use. For a delivered
  report, reply to that report email.
  Do not create a public issue containing vulnerability details or promise a
  scan schedule that Anthropic has not confirmed.
