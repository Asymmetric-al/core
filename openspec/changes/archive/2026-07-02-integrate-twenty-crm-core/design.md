# Design: Twenty CRM Phased Integration

> **RETIRED (2026-07-06, ADR-0001)** — this change is withdrawn; see the
> banner in [proposal.md](./proposal.md). Preserved unedited as historical
> record.

## Status

This active change package now contains Phase 00 through Phase 07 artifacts.
Phase 07 completes the production cutover and operations readiness contract
for the approved CRM domains. It does not add new CRM domains, make raw Twenty
UI the Mission Control product surface, or move finance, CMS, care, public,
auth, payment, receipt, statement, refund, reconciliation, automation, donor
account, or missionary workspace authority into Twenty.

The package uses `implementation-inventory.md` only as current-state context.
Existing Mission Control CRM code can reduce later effort, but it does not
change the required phase order.

## Source Inputs

Repo sources:

- `openspec/project.md`
- `openspec/specs/platform-product-intent/spec.md`
- `openspec/specs/platform-surfaces/spec.md`
- `openspec/specs/platform-principles/spec.md`
- `openspec/specs/platform-boundaries/spec.md`
- `docs/guides/architecture/data-access-boundary.md`
- `docs/guides/features/twenty-crm-integration/README.md`
- `docs/guides/features/twenty-crm-integration/implementation-inventory.md`
- `docs/guides/features/twenty-crm-integration/phase-00-strategy-and-proof.md`
- `docs/guides/features/twenty-crm-integration/phase-01-core-seam-and-authorization.md`
- `docs/guides/features/twenty-crm-integration/phase-02-identity-schema-and-mapping.md`
- `docs/guides/features/twenty-crm-integration/phase-03-sync-eventing-and-replay.md`
- `docs/guides/features/twenty-crm-integration/phase-04-first-domain-mission-control.md`
- `docs/guides/features/twenty-crm-integration/phase-05-relationship-expansion.md`
- `docs/guides/features/twenty-crm-integration/phase-06-cross-surface-projections-and-shadow-mode.md`
- `docs/guides/features/twenty-crm-integration/phase-07-production-cutover-and-operations.md`
- `docs/guides/operations/twenty-crm-cutover.md`
- `docs/ai/rules/general.md`
- `docs/ai/rules/backend.md`
- `docs/ai/rules/frontend.md`
- `docs/ai/rules/testing.md`
- `docs/ai/skills/supabase/SKILL.md`
- `docs/ai/skills/nextjs-supabase-auth/SKILL.md`
- `docs/ai/skills/supabase-postgres-best-practices/SKILL.md`
- `docs/ci.md`

Twenty sources reviewed for this package:

- `https://docs.twenty.com/developers/extend/api`
- `https://docs.twenty.com/developers/extend/webhooks`
- `https://docs.twenty.com/developers/self-host/capabilities/docker-compose`
- `https://docs.twenty.com/developers/extend/apps/getting-started`
- `https://raw.githubusercontent.com/twentyhq/twenty/refs/heads/main/packages/twenty-docker/docker-compose.yml`
- `https://raw.githubusercontent.com/twentyhq/twenty/refs/heads/main/packages/twenty-docker/.env.example`

## Integration Strategy

Twenty should be treated as the backing CRM engine for operational relationship
records, not as a replacement for the Asym platform shell.

Asym remains the product boundary:

- Supabase Auth remains the identity and session authority.
- Mission Control remains the staff operations home and native CRM surface.
- `packages/api` remains the server-side integration boundary for CRM access.
- Browser code never receives Twenty API keys, webhook secrets, or direct
  vendor credentials.
- Twenty records can back CRM data, but Asym keeps its own link, projection,
  command, and audit state around the integration.
- Stripe, receipts, statements, reconciliation, payment execution, donor portal
  money history, CMS publishing, public website content, and care workflows do
  not move to Twenty.

This makes Twenty an internal subsystem behind stable Asym contracts. Later
phases may add a root CRM gateway, identity links, sync jobs, and native
Mission Control CRM screens, but those phases must preserve this contract.

## Ownership Matrix

| Domain                                                                      | System of record                                                                              | Write authority                                                             | Conflict winner                                                                                   | Sync direction                                                                                   | Rollback owner              |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------- |
| Platform user identity, sessions, staff roles                               | Supabase Auth plus Asym role tables                                                           | Asym auth and admin flows                                                   | Asym                                                                                              | Asym can project actor context to CRM logs; Twenty never writes auth truth                       | Platform/auth owner         |
| CRM people and relationship identity                                        | Twenty-backed CRM, linked by Asym CRM link tables in later phases                             | Mission Control through `packages/api` CRM gateway                          | Asym link authority wins for tenant and entity mapping; Twenty wins for CRM-only fields           | Bidirectional after Phase 03, with Asym links as the join contract                               | CRM/platform owner          |
| Organizations, churches, households, relationship graph                     | Twenty-backed CRM after domain-specific cutover                                               | Mission Control through server-side CRM contracts                           | Twenty for CRM relationship facts unless an Asym-owned finance, care, or CMS field conflicts      | Bidirectional after each domain is cut over                                                      | CRM/platform owner          |
| Staff notes, tasks, and CRM activity                                        | Twenty-backed CRM after first-domain cutover                                                  | Mission Control native UI through `packages/api`                            | Twenty for CRM activity state; Asym audit wins for command authorship                             | Bidirectional after Phase 03                                                                     | CRM/platform owner          |
| Donor profile and donor-facing account state                                | Asym and Supabase                                                                             | Donor portal and Mission Control through Asym server actions/API            | Asym                                                                                              | Asym may project limited donor relationship context to Twenty; donor account truth does not move | Donor experience owner      |
| Donations, payment execution, refunds, receipts, statements, reconciliation | Asym finance and Stripe-backed systems                                                        | Asym payment, finance, and admin flows                                      | Asym always                                                                                       | Asym may project summary context into CRM; Twenty never drives money state                       | Finance/platform owner      |
| Recurring gifts and payment methods                                         | Asym finance and Stripe-backed systems                                                        | Donor portal and Mission Control finance flows                              | Asym always                                                                                       | Asym to CRM summary only, no CRM-to-finance writes                                               | Finance/platform owner      |
| Pledges and relationship commitments                                        | Asym for payment/collection state; Twenty may hold CRM relationship context after later phase | Mission Control through domain-specific Asym contracts                      | Asym for money-adjacent state; Twenty for CRM-only relationship notes                             | Asym to Twenty for CRM context, with guarded CRM-to-Asym updates only after Phase 05             | Finance plus CRM owners     |
| CMS public content and publishing state                                     | Asym CMS                                                                                      | CMS and authorized Mission Control/missionary flows                         | CMS public truth wins for content; CRM operational entity truth wins for entity identity          | CRM entity links into CMS; CMS does not become CRM                                               | CMS/platform owner          |
| Missionary and project operational entity                                   | Asym operational model plus CRM links; Twenty may hold CRM relationship context               | Mission Control and authorized missionary workflows through Asym boundaries | Asym for permissions, designations, and public release state; Twenty for CRM relationship context | Bidirectional only through explicit link/projection contracts                                    | Mission Control owner       |
| Care workflows and sensitive support state                                  | Asym                                                                                          | Mission Control care workflows                                              | Asym always                                                                                       | Optional Asym-to-CRM summary only after an accepted later change                                 | Care/platform owner         |
| Public tenant website                                                       | Asym public/CMS surface                                                                       | CMS and public site delivery                                                | Asym                                                                                              | No direct Twenty dependency; CRM context only through safe projections                           | Public website owner        |
| Donor portal CRM context                                                    | Asym donor surface                                                                            | Donor portal through Asym server boundaries                                 | Asym                                                                                              | Role-scoped projection from CRM to donor portal after Phase 06 only                              | Donor experience owner      |
| Missionary workspace CRM context                                            | Asym missionary surface                                                                       | Missionary workspace through Asym server boundaries                         | Asym                                                                                              | Role-scoped projection from CRM to missionary workspace after Phase 06 only                      | Missionary experience owner |
| Twenty schema and metadata                                                  | Twenty workspace metadata, controlled by Asym integration tooling                             | Phase 02 schema bootstrap path after approval                               | Approved Asym schema contract wins over ad hoc Twenty UI edits                                    | Asym integration tooling to Twenty metadata                                                      | CRM/platform owner          |
| Webhook events, outbound jobs, replay, and projection state                 | Asym integration tables after Phase 03                                                        | `packages/api` and background workers                                       | Asym replay/idempotency state wins for delivery correctness                                       | Twenty to Asym inbound, Asym to Twenty outbound                                                  | Platform operations owner   |
| Integration secrets and API keys                                            | Asym secret management outside source control                                                 | Server-only env/runtime configuration                                       | Asym                                                                                              | No sync; secrets never appear in browser bundles or docs                                         | Platform operations owner   |

## Non-Production Twenty Infrastructure Proof Plan

The proof must run outside production and must not use production CRM data,
production donor data, production payment data, or production secrets.

### Topology

Use an isolated Twenty proof environment with:

- Twenty server container.
- Twenty worker container.
- Redis container.
- Dedicated Postgres 16 database for Twenty.
- Local Docker volume for first proof storage, then optional S3-compatible
  storage smoke if development will require external storage.
- A public webhook receiver URL only for the non-production proof, using a
  disposable endpoint or tunnel.

The official Docker Compose source currently defines server, worker, Postgres,
Redis, health checks, local storage, `PG_DATABASE_URL`, `REDIS_URL`,
`SERVER_URL`, and storage-related environment variables. The proof should start
from that topology rather than inventing a custom runtime first.

### Setup Rules

- Pin the Twenty image tag or source commit used for the proof in the evidence
  note.
- Store all proof secrets outside git.
- Use synthetic tenant/workspace data only.
- Keep the proof under a scratch path such as `/tmp/asym-twenty-proof` or a
  separate untracked operator workspace.
- Do not add production app env vars, package exports, route handlers,
  migrations, or frontend code during Phase 00.
- If app-manifest tooling is tested, keep it in a disposable app project and do
  not add it to this monorepo until a later phase accepts that path.

### Smoke Tests

The proof must record command output or screenshots for each passing check:

1. Server health check responds from the Twenty server.
2. Worker container starts, can be restarted, and recovers without corrupting
   proof data.
3. Redis health check passes and worker/server dependencies are healthy.
4. Dedicated Postgres persists data across a server restart.
5. Backup and restore succeeds by dumping the Twenty database and restoring it
   into a fresh proof database.
6. Core API can read and write a disposable record with a scoped API key.
7. Batch behavior is understood and test calls stay within the documented
   60-record batch size.
8. Rate-limit posture is recorded and client plans stay under the documented
   100 requests per minute limit.
9. Metadata API or disposable app tooling can create and remove a proof-only
   schema element.
10. Webhook delivery reaches the non-production receiver for create, update,
    and delete events.
11. Webhook signatures are verified with HMAC SHA256 using the timestamp and
    payload contract.
12. Storage behavior is verified for the chosen proof storage mode.
13. No browser request, static bundle, or app route in Asym receives raw Twenty
    credentials.

### Evidence Artifact

When the proof is executed, create a dated evidence note under:

`docs/guides/features/twenty-crm-integration/proofs/`

The note must include:

- Twenty image tag or source commit.
- Proof environment date and operator.
- Topology used.
- Redacted environment shape.
- Commands run.
- API and webhook smoke results.
- Backup/restore result.
- Worker restart result.
- Known failures or deviations.
- Go/no-go recommendation for Phase 01.

### Stop Criteria

Stop at Phase 00 if any of these are true:

- Twenty cannot run with server, worker, Redis, storage, and Postgres in an
  isolated non-production topology.
- Webhook authenticity cannot be verified.
- Backup and restore cannot be proven.
- Twenty requires sharing the existing Asym Supabase platform database.
- Twenty requires browser-exposed credentials.
- Twenty cannot be operated without risking Asym auth, finance, CMS, care, or
  tenant boundaries.

## Supabase Postgres Versus Dedicated Postgres Decision

Decision for Phase 00 and the default production path: do not use the existing
Asym Supabase Postgres database as Twenty's backing database. Use a dedicated
Postgres database for Twenty.

Rationale:

- The Asym Supabase Postgres database is part of the platform auth, RLS, and
  application data boundary.
- Twenty owns its own database schema, migrations, server, worker, and upgrade
  lifecycle.
- Sharing the platform database would couple Twenty restore, upgrade, and
  operational incidents to Asym auth, finance, CMS, care, and tenant data.
- A dedicated database keeps backup, restore, scaling, incident response, and
  rollback cleaner.
- The integration seam should be API, webhook, link-table, projection, command,
  and replay contracts, not shared database ownership.

The decision can be reopened only through a later accepted OpenSpec change that
proves all of the following in non-production:

- Twenty can run against a separate Supabase project or isolated database
  without touching the Asym platform database.
- Twenty migrations, extensions, privileges, and connection behavior are
  compatible with the selected Supabase plan.
- Backup and restore can be executed without affecting Asym platform data.
- Connection pooling and worker load do not degrade Asym app traffic.
- Operational runbooks clearly separate Twenty incidents from Asym auth,
  finance, CMS, care, and tenant incidents.

If the dedicated and Supabase-hosted options are otherwise tied, dedicated
Postgres wins because it preserves a smaller blast radius.

## First-Domain Recommendation for Phase 04

The first safe user-facing cutover domain is staff-owned CRM Notes in Mission
Control. Notes prove the native CRM surface, read path, audit path, outbound
job path, replay path, and rollback controls without moving people write
authority first.

Do not choose donations, recurring gifts, receipts, statements, refunds,
reconciliation, CMS publishing, care workflows, donor portal controls, or
missionary workspace controls as the first cutover domain.

This choice keeps the first CRM experience close to Mission Control and away
from money-adjacent or public-truth domains while still proving the core CRM
value.

## Phase 02 Identity, Schema, And Mapping

Phase 02 adds the identity and mapping layer that lets Asym and Twenty refer to
the same ministry reality without collapsing distinct systems of record.

This phase still does not run production imports, start sync/event replay, cut
over user-facing CRM domains, or expose raw Twenty UI. It creates the schema
and pure transforms needed before those later phases can be safe.

### Identity Concepts

The integration keeps these concepts separate:

| Concept                                                     | Owner         | CRM link policy                      | Rule                                                        |
| ----------------------------------------------------------- | ------------- | ------------------------------------ | ----------------------------------------------------------- |
| Supabase auth user                                          | Supabase Auth | Context link                         | Auth/session subject only; not a CRM person                 |
| Asym profile                                                | Asym          | Context link                         | App profile and role context; not a CRM person              |
| Tenant membership and role                                  | Asym          | Context link                         | Authorization state; not a CRM relationship identity        |
| CRM person                                                  | Twenty        | Direct link                          | Operational relationship person, linked to source records   |
| Donor profile                                               | Asym          | Direct link                          | Donor account/giving relationship; may link to a CRM person |
| Missionary profile                                          | Asym          | Direct link                          | Missionary operational identity; may link to CRM context    |
| CMS public entity                                           | Asym CMS      | Context link                         | Public presentation entity; not operational truth           |
| Stripe customer                                             | Stripe        | Context link                         | Billing identity; not donor profile or CRM person           |
| Fund or project                                             | Asym          | Direct link                          | Designation/project truth remains Asym-owned                |
| Pledge or relationship commitment                           | Asym          | Direct link                          | Relationship intent; not payment execution                  |
| Payment, receipt, refund, statement, reconciliation records | Asym finance  | Summary only or no CRM identity link | Money and official record truth never moves to Twenty       |

### Supabase Link And Projection Schema

Phase 02 creates:

- `crm_record_links`: tenant-scoped links from Asym identity concepts to Twenty
  records with provider, object name, record id, source concept, source id,
  confidence, status, verification, and replay metadata.
- `crm_merge_candidates`: review queue for possible duplicate identities with
  source concept, candidate Twenty record, score, confidence, reasons, status,
  and review metadata.
- `crm_projection_state`: later-phase projection bookkeeping for shadow mode,
  role-scoped surfaces, replay, drift checks, and rollback.

These tables are staff-scoped by RLS and intentionally do not run import,
webhook, or projection jobs in Phase 02.

### Twenty Object Model

The Phase 02 object model uses Twenty standard objects where they fit and
custom objects where ministry-specific semantics are required:

| Twenty object             | Kind     | Purpose                                                           |
| ------------------------- | -------- | ----------------------------------------------------------------- |
| `people`                  | Standard | Operational relationship people                                   |
| `companies`               | Standard | Organizations and partner groups                                  |
| `churches`                | Custom   | Church-specific relationship context                              |
| `households`              | Custom   | Family/shared relationship grouping                               |
| `tasks`                   | Standard | Staff CRM follow-up work                                          |
| `notes`                   | Standard | CRM relationship notes, excluding care-sensitive truth by default |
| `ministryActivities`      | Custom   | CRM activity timeline context                                     |
| `relationshipCommitments` | Custom   | Pledges/relationship intent without payment execution truth       |

The model deliberately does not mirror payments, receipts, refunds,
statements, reconciliation, care workflows, CMS publishing state, or the full
Asym database into Twenty.

### Schema Management Path

Production schema bootstrap uses the Twenty Metadata API. Twenty app manifests
remain useful for disposable proof work, but they are alpha and bring a
separate Node/Yarn/toolchain and app installation lifecycle. They should not
become the production schema path unless a later accepted change proves the
tooling is stable and isolated enough for this repo.

### Duplicate Rules

Duplicate scoring is deterministic and tenant-scoped:

- Cross-tenant candidates are ignored.
- Exact normalized email contributes the strongest evidence.
- Exact normalized phone, name, and organization add confidence.
- High-confidence matches become link candidates for controlled handling.
- Medium and low-confidence matches become merge candidates.
- Low-confidence matches never auto-link or auto-merge.

### Phase Boundary

Phase 03 may build webhook/eventing/replay and outbound job execution using
these identity contracts. Phase 02 itself does not execute imports, production
writes, cross-surface projections, webhooks, or automatic merges.

## Phase 03 Sync, Eventing, And Replay

Phase 03 adds the non-production sync substrate around Twenty. It moves the
integration from pure schema/mapping into durable, replayable event handling
without cutting over any user-facing CRM domain.

### Signed Webhook Ingress

Twenty webhook ingress is a thin admin app route that delegates to
`packages/api`. The route reads the raw request body and validates
`X-Twenty-Webhook-Signature` plus `X-Twenty-Webhook-Timestamp` using the
documented HMAC SHA256 `{timestamp}:{JSON payload}` contract.

Accepted events are stored in `crm_webhook_events` before any processing
starts. Missing, stale, and invalid signatures are rejected before storage.
Duplicate deliveries resolve through the event key and are logged as ignored
duplicates instead of being processed twice.

### Durable Sync State

Phase 03 creates these durable tables:

- `crm_sync_settings`: tenant/domain pause controls for inbound, outbound, and
  replay.
- `crm_webhook_events`: signed inbound Twenty events with ignored, failed,
  queued, paused, processed, and replay state.
- `crm_outbound_jobs`: queued Twenty writes with idempotency keys, retry counts,
  dead-letter state, and source identity references.
- `crm_reconciliation_runs`: operator-visible reconciliation evidence.
- `crm_sync_logs`: append-only operational log for inbound, outbound, replay,
  and reconciliation paths.

### Outbound Jobs And Replay

Outbound writes are queued instead of blocking user-facing flows. Each write
uses a deterministic idempotency key and can move through queued, processing,
succeeded, failed, dead-letter, or paused states.

Replay operates on the existing durable event or job row. It reuses the same
event id or idempotency key and therefore does not create duplicate records.
Replay respects both global server flags and per-domain pause controls.

### Reconciliation

Reconciliation checks report:

- active links that have not been seen by webhook processing,
- stale or failed projection state,
- stalled outbound jobs,
- pending duplicate candidates,
- failed or dead-letter webhook events.

Findings are written to `crm_reconciliation_runs` and summarized in
`crm_sync_logs` so operators can distinguish healthy reconciliation from drift
that needs review.

### Phase Boundary

Phase 03 remains a non-production sync foundation. It does not run production
imports, cut over Mission Control CRM screens, add donor/missionary/CMS
projections, or move Stripe, receipt, statement, reconciliation, CMS publish,
or care truth into Twenty. Phase 04 must explicitly authorize any user-facing
CRM domain cutover.

## Phase 04 First Domain Mission Control

Phase 04 moves one safe CRM domain into native Mission Control. The selected
domain is Notes.

### Native Notes Surface

Mission Control owns the user experience at `/crm/notes`. The page uses the
existing admin shell, shared table primitives, stable row ids, and TanStack
Query state. It does not embed raw Twenty UI and does not add donor,
missionary, finance, CMS, care, public, or payment controls.

### Route And Package Boundary

The app route at `/api/admin/crm/notes` is a thin route handler that re-exports
from `@asym/api/admin/crm/notes`. All Twenty access, authorization checks,
command logging, outbound job creation, and sync log writes live under
`packages/api`.

Browser code receives only the native Asym response model from
`@asym/database/types`; it never receives Twenty credentials or imports raw
Twenty client code.

### Notes Read Path

Staff users with `crm.note.read` can list notes. The service sends a tenant
filter to Twenty and applies a second tenant filter after response
normalization. Search, sort, limit, and cursor state are explicit in the route
query and query key.

When server-only Twenty credentials are absent, the route returns a safe
`not_configured` response with an empty row set and missing configuration
metadata. The Mission Control screen remains usable for permission, empty, and
write-queue states without exposing secrets.

### Notes Write Path

Staff users with `crm.note.create` can queue a note. The write path validates
the body, records a `crm.note.create` command log entry, creates a `notes`
outbound sync job with a deterministic idempotency key, and appends a CRM sync
log entry. The response includes the outbound job id so the existing Phase 03
replay endpoint can replay the write without duplicating durable state.

### Replay And Rollback

Outbound replay uses the Phase 03 `/api/admin/crm/sync/replay` path. Inbound
webhook side effects remain replayable through the durable webhook event path.

Rollback is domain-scoped: pause the `notes` domain in `crm_sync_settings` for
outbound and replay, hide or remove the `/crm/notes` entry point, and continue
using the existing `/crm` Mission Control path. No donor, missionary, finance,
CMS, care, public, or payment authority changes are required to roll back
Phase 04.

## Phase 05 Relationship Expansion

Phase 05 expands the native Mission Control CRM surface from the first Notes
domain into relationship graph read models, search, and reporting. The Phase 05
surface is `/crm/relationships`, backed by `/api/admin/crm/relationships` and
`@asym/api/admin/crm/relationships`.

### Relationship Domains

Phase 05 reads these domains through `packages/api`:

| Domain        | Twenty object(s)                         | Guardrail                                                                       |
| ------------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| People        | `people`                                 | CRM relationship context only; auth identity remains Supabase Auth plus Asym.   |
| Organizations | `companies`                              | Generic organization records; church-like company duplicates are deduped.       |
| Churches      | `churches`, church-like `companies`      | Custom church records win over duplicate company records for same tenant/name.  |
| Households    | `households`                             | Membership keys are deterministic from sorted unique member ids.                |
| Pledges       | `relationshipCommitments`                | Relationship commitment context only; Asym finance remains payment authority.   |
| Activity      | `ministryActivities` excluding care rows | CRM activity context only; care plans and private care notes remain Asym-owned. |

### Search And Reporting

Staff users with `crm.relationship.read` can search the expanded relationship
graph by text and domain. The service sends a tenant filter to Twenty and then
applies server-side tenant filtering after response normalization and
deduplication.

Mission Control relationship reports cite source-system ownership explicitly:
Twenty CRM owns relationship context, Asym finance owns payment execution and
official money records, Asym care owns care plans and private notes, and
Supabase Auth plus Asym memberships own authentication and authorization.

### Authority Boundaries

Pledge rows surface commitment amount, currency, frequency, status, and
relationship labels as CRM context. They intentionally do not project payment
status, payment intent ids, receipt ids, statement ids, refund ids, or
reconciliation state into the CRM read model.

Relationship activity excludes care-sensitive activity before returning rows to
Mission Control. This prevents CRM activity from duplicating private care truth.

Phase 05 is read-only for the expanded relationship domains. Relationship
writes, donor/missionary/CMS/public projections, and shadow-mode cutover remain
for later phases.

### Rollback

Rollback is domain-scoped: hide `/crm/relationships`, continue using the
existing `/crm` and `/crm/notes` paths, and pause `people`, `companies`,
`churches`, `households`, `ministry_activities`, and
`relationship_commitments` in `crm_sync_settings` as needed. No finance, care,
CMS, auth, donor, missionary, public, payment, receipt, statement, refund, or
reconciliation authority changes are required to roll back Phase 05.

## Phase 06 Cross-Surface Projections And Shadow Mode

Phase 06 defines role-scoped CRM projections for donor, missionary, CMS, event,
and reporting contexts and keeps them in shadow mode. It introduces a staff
Mission Control dashboard at `/crm/projections`, backed by
`/api/admin/crm/projections` and `@asym/api/admin/crm/projections`, so staff
can review projection health before any target surface depends on Twenty.

### Projection Contracts

Projection contracts live under `packages/api/src/crm/projections/*`. Each
contract names its target surface, role scope, allowed roles, visible fields,
blocked fields, source-of-truth ownership, shadow-mode status, and rollback
read model.

| Projection                       | Target     | Role scope          | Guardrail                                                                                         |
| -------------------------------- | ---------- | ------------------- | ------------------------------------------------------------------------------------------------- |
| `donor_crm_detail`               | donor      | donor self          | Donor portal never receives staff notes, duplicate controls, payment internals, or care records.  |
| `missionary_crm_detail`          | missionary | assigned missionary | Missionary workspace never receives tenant-wide staff CRM controls.                               |
| `cms_linkage_status`             | CMS        | CMS editor/staff    | CMS publish state, content, moderation, and release rules remain Asym-owned.                      |
| `event_attendee_crm_context`     | event      | event staff         | Event attendee context stays tenant- and event-scoped.                                            |
| `project_fund_crm_detail`        | reporting  | reporting staff     | Fund/project designations, finance truth, CMS publish state, and release rules remain Asym-owned. |
| `relationship_reporting_context` | reporting  | reporting staff     | Finance, ledger, receipts, refunds, statements, and reconciliation remain Asym-owned.             |

### Shadow State And Drift

Projection bookkeeping uses `crm_projection_state`. Phase 06 adds `event` and
`reporting` target-surface enum values. Shadow rows record source hashes,
projected hashes, Twenty links, sync status, metadata, and replay request
metadata without replacing existing target-surface read models.

The Mission Control dashboard reports record-count parity, duplicate candidate
counts, missing CRM records, missing Asym records, stale rows, failed rows, and
conflicting source/projected hashes. Source ownership is visible per row so
staff can tell whether CRM, Asym finance, Asym CMS, Asym event state, care, or
auth owns each field.

### Rollback

Rollback is projection-name scoped: hide `/crm/projections`, disable the
relevant `projection_name` rows in `crm_projection_state`, and leave donor,
missionary, CMS, event, and reporting surfaces on their previous Asym read
models. No Phase 06 artifact changes production cutover behavior.

## Phase 07 Production Cutover And Operations

Phase 07 turns the integration into an operations-ready production program. It
does not add domains. It freezes the approved domain catalog, defines the
domain-by-domain cutover evidence, and requires monitoring, rollback rehearsal,
backup/restore proof, secret rotation, support ownership, and CI/OpenSpec
validation before a domain can stay production-live.

### Frozen Domain Catalog

The only Phase 07 production domains are:

1. Notes and tasks.
2. People.
3. Churches and organizations.
4. Households.
5. Pledges as CRM relationship records only.
6. CRM search across cut-over domains.
7. Person and church detail pages.
8. Recent donor CRM views.
9. Missionary and fund anchors.
10. Event attendee linkage.

This catalog is intentionally limited to the Phase 04 through Phase 06 domain
set. It does not authorize any finance, CMS publish, care, auth, payment,
receipt, statement, refund, reconciliation, automation, donor account,
missionary workspace, or public website authority transfer.

### Domain-Gated Cutover

Each domain must move through the same production gate:

1. Development parity is green for counts, links, duplicates, webhook lag,
   outbound queue lag, projection lag, failed jobs, and dead letters.
2. Twenty and Asym CRM schema changes are frozen for the cutover window.
3. A dedicated Twenty Postgres backup is taken and restored into an isolated
   target without touching the Asym Supabase platform database.
4. Production sync starts paused or read-only.
5. Final import or replay runs.
6. Reconciliation compares counts, links, duplicates, webhook lag, projection
   lag, and failed jobs.
7. Reads are enabled before writes.
8. Writes are enabled only for approved roles after read stability is recorded.
9. Domain monitors stay green through the rollback window.
10. The evidence note records support owner, rollback owner, security review,
    CI/OpenSpec commands, and go/no-go decision.

### Monitoring And Alerts

Phase 07 monitors the shared CRM infrastructure and every production domain:

- Twenty server health, 5xx rate, and p95 latency.
- Twenty worker heartbeat, throughput, and restart count.
- Redis availability, memory pressure, and evictions.
- Dedicated Twenty Postgres connection count, storage, backup age, and slow
  queries.
- Webhook signature rejects, duplicate deliveries, lag, and failed events.
- Outbound queue depth, stale processing rows, retries, and dead letters.
- Projection stale, missing, failed, conflicting, and duplicate records.
- Twenty rate-limit headroom and 429 responses.
- CRM auth denials by action, route, tenant, and role.
- CRM command failures and idempotency collisions.

Alerts route to platform operations for shared infrastructure, to the
CRM/platform owner for CRM sync and command behavior, and to the named domain
owner for domain-specific projection or support issues.

### Operations Runbooks

`docs/guides/operations/twenty-crm-cutover.md` is the Phase 07 runbook for:

- Twenty server outage.
- Supabase outage.
- Redis outage.
- Webhook failure.
- Replay.
- Outbound retry.
- Rate-limit pressure.
- Duplicate merge review.
- Projection drift.
- Import failure.
- Domain rollback.
- Twenty upgrade.
- Dedicated Twenty database restore.
- Secret rotation.

### Backup And Restore Proof

Before reads are enabled, operators must prove the latest dedicated Twenty
Postgres backup can be restored into an isolated target. The proof records the
backup id, restore target id, restore duration, domain row counts, sample
records, mismatches, and confirmation that the Asym Supabase platform database
was not touched.

After the first production write window, the domain must repeat backup/restore
proof and compare restored Twenty state to Asym command, link, projection, and
replay state. The rollback window stays open while restore evidence is missing
or mismatched.

### Secret Rotation

Twenty API keys, webhook secrets, workspace ids, and runtime credentials remain
server-only. Rotation creates replacement secrets outside git, validates
outbound API calls and signed webhook tests, confirms browser bundles and route
responses do not expose raw secrets, then revokes the old secret. If dual
webhook verification is unavailable, inbound sync is paused during rotation
and replayed after validation.

### OpenSpec Archive Rule

The active OpenSpec change must not be archived merely because a one-time sync
or cutover succeeded. Archive is allowed only after the approved production
domains are stable, monitored, rollback-ready, documented, and aligned with
OpenSpec.

## Phase Boundary

This active change now contains Phase 00 through Phase 07 artifacts. The Phase
07 stop point is production operations readiness for the approved domains only.
No additional CRM domain is introduced here. Any later expansion beyond the
frozen catalog, any raw Twenty UI as the default Mission Control CRM product
surface, or any finance, CMS publish, care, auth, payment, receipt, statement,
refund, reconciliation, automation, donor account, missionary workspace, or
public website authority transfer requires a later accepted OpenSpec change.
