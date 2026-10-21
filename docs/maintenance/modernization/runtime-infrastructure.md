# Runtime infrastructure checkpoint

Tracking: [AL-1965](https://github.com/Asymmetric-al/core/issues/1965).
Status: implementation and qualification in progress. This record does not close
the full modernization campaign or authorize production execution.

The [owned pin inventory](runtime-infrastructure-inventory.json) records every
active Action, CI/restore image, project MCP launcher, operational wrapper and
protocol changed or reconciled in this checkpoint. The local Inngest MCP endpoint
is recorded as open under the data/workflows cohort; its server has not yet been
qualified. Exact launchers do not freeze
external CLI transitive dependencies; their advisory paths remain owned findings.

## Delivered behavior

- Setup enforces the approved Node runtime and accepts Supabase publishable keys
  or maintained legacy anon keys. Privileged keys fail before requests. Auth
  health/settings use `apikey`; URL credentials and provider bodies stay out of
  errors. Both historical shell entrypoints delegate to the Node verifier.
- Vercel CLI 65 uses environment authentication. Production sync values use stdin,
  and provider failures cannot echo them. The production sync was not executed.
- Vitest runs through its frozen installed CLI, with argument arrays, coverage,
  explicit test filters, and existing Windows resource controls. Native Windows
  execution is not established by mocked platform contract tests.
- MCP readiness tries current discovery, negotiates maintained legacy protocols,
  and refuses authentication/server errors as downgrade signals. HTTP metadata
  and annotated headers agree; unsupported interactive results fail closed.
  Modern results require an explicit complete discriminator; successful HTTP
  responses require JSON or SSE media types. Requests have a 15-second HTTP timeout, response-byte limits and stream
  cancellation. STDIO transports supply their own bounded request timeout.
- Four CI database services and the synthetic restore transport use the exact
  PostgreSQL 17.11 image digest. Disposable Auth helpers work for restricted
  roles while Auth-table reads remain denied. This bootstrap is not a hosted
  migration or a production Auth implementation.
- Removed two unreferenced duplicate Codex setup scripts that incorrectly required
  global Context7, Nia and GitHub servers. Project MCP configuration and the
  optional-helper rules in `AGENTS.md` govern setup.
- Supabase configuration uses `local_smtp` and removes the obsolete empty
  experimental OrioleDB setting. The supported database major remains 17.
- The newly merged OSS investigation image uses the pinned Node 24 Debian 13
  base and PostgreSQL 17.11 server/client packages. An incompatible existing
  database major is refused before app shutdown or database reset. The build
  context excludes the opaque vendored database.

## Evidence and remaining qualification

Both pinned MCP executables negotiated 2025-11-25 and returned their tool lists:
Next DevTools 0.4.0 returned 4 tools; Shadcn 4.22.1 returned 7. The standalone licensed ReUI HTTP check also passed Pro/base-maia context,
required tools, Pro block discovery, Base UI component API and paid registry
retrieval. Its credential was supplied through non-echoing ephemeral input; only
the verification result was saved.

The exact PostgreSQL 17.11 image passed all committed Supabase migrations, the
Payload migration runner/status, demo seed, restricted-role Auth checks and fee
replay. The new fixture contains 166 public/Payload tables and one demo profile.
The separate representative baseline/restore remains preserved for Payload's
migration rehearsal. A three-row backup transport smoke is insufficient evidence
for product migration preservation or disaster recovery.

Vercel 65.0.0 and Supabase 2.121.0 version commands passed. Supabase parsed the
new keys on the local-status path and successfully listed migrations through an
explicit URL to the isolated PostgreSQL fixture. The isolated core stack then started successfully, applied all 81 canonical
migrations and seeded one profile. Auth health/settings, the public campaign
query and the setup verifier passed. Studio, image proxy, Edge Runtime,
analytics/vector and pooler were excluded; this is not whole-platform coverage.
Local signup, password login, session refresh, logout and test-user deletion also
passed. The isolated stack was stopped afterward with its volumes preserved.
[Qualification evidence](runtime-infrastructure-qualification.json) records the
actual service image digests and the boundaries of every check.

The rebuilt scanner image passed its offline runner with networking disabled,
two CPUs and 8 GiB RAM: committed migration/seed paths, local SQL/RLS checks,
227 selected unit tests, normal health/denial and Chromium login checks across
all three apps, and one explicit donor demo preflight. Both incompatible-major
refusal modes and Docker context exclusions have separate regression evidence.
The [installed OS inventory](scanner-os-packages.json) freezes 552 package
versions; image advisory reconciliation remains open. These checks do not prove
hosted authentication, paid integrations or acceptance by the scanner service.

Independent immutable reviews cover the operational and MCP slices. Final delta
review, repository gates, current-head CI, deployed previews and merge readback
are still required. [The tooling checkpoint](development-tools.md) is already
merged and its post-merge CI and full integration jobs passed.

## Hosted PostgreSQL release preparation

The [read-only hosted snapshot](hosted-postgres-qualification.json) records both
projects still on 17.6 and the provider bundle 17.6.1.063. The committed
[catalogue preflight](../../../scripts/sql/postgres17-upgrade-readiness.sql)
queries versions, extensions and migration hazards without application records,
keys or encrypted values. The normal disposable migration verifier tests the
actual preflight with mixed-case literal and SQL-standard PGP callers to prevent false clearance. No candidate ltree/float-GiST indexes, custom estimator
operators or stored PGP callers were found. Repository application/SQL sources
also contain no PGP encryption calls. External writers require provenance review.

Use the provider's supported 17.11 upgrade, preserving its extension bundle.
Before the release, refresh catalogue checks and representative backup/restore
proof, assess external PGP writers, and record extension versions. Reindex any
affected indexes after upgrade; verify queries, tenant denial, Auth, jobs and
assets. If legacy PGP ciphertext exists, prepare reviewed AES re-encryption before
cutover. Do not treat a vanilla CI container as a hosted replacement. Rollback
requires the qualified provider restore boundary and the campaign's write-pause
and payment-drain procedure.

Sources: [provider 17.11 upgrade guidance](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes),
[API key migration](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys),
[MCP transport specification](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http),
[GitHub REST changes](https://docs.github.com/en/rest/about-the-rest-api/breaking-changes?apiVersion=2026-03-10).
