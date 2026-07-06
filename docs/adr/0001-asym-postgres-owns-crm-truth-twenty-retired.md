# ADR-0001: Asym Postgres owns all CRM truth; Twenty CRM is retired

**Status:** Accepted (founder ruling, Phase 9 grill session 2026-07-06)

> First entry in the platform-wide ADR series (`docs/adr/`). Feature-scoped
> ADRs continue to live in their feature folders (e.g.
> `docs/features/mission-control/contribution-detail/docs/adr/`). This
> decision is platform-wide because it settles source-of-truth ownership for
> the whole CRM layer.

## Context

The platform adopted Twenty CRM as a backing provider for the CRM
relationship layer (the unmerged OpenSpec change
`openspec/changes/integrate-twenty-crm-core/`, integration phases 01–07,
~14k LOC of gateway/webhook/sync/read-through machinery, used read-only).
The SiteStacker parity program's newer PRDs then progressively pulled truth
into Asym Postgres: Phase 4 made profiles the identity anchor and reserved a
typed `persons` spine ("Option A, scaffolded to Option C"), Phase 7 committed
the full party spine (persons, households, org profiles, `org_contacts`) to
Asym because receipt/credit truth legally cannot live in a provider, and
Phase 8 was groomed to open the first production write (Notes) to Twenty
behind a fail-closed write gate.

A research review during the Phase 9 grill (2026-07-06; five-lens repo +
external evidence pass) found:

- **Production never wrote to Twenty, and could not read it.** Three
  independent repo documents record no production domain cutover; the
  2026-05-14 Phase-4 env audit found no `TWENTY_*` keys active in
  production/preview runtime, and the two Twenty-backed screens return
  `not_configured` in production. There is no production Twenty data to
  migrate. (One discrepancy: a 2026-05-14 follow-up evidence file records
  `TWENTY_*` keys configured in the Vercel production/admin project —
  verify and revoke during cleanup.)
- **Tenant isolation for Twenty-resident data was an application-side filter
  string** (`asymTenantId` equality) over **one shared workspace with one
  global API key** — no RLS equivalent; Twenty row-level permissions are a
  paid feature. One filter bug in any read path would be a cross-tenant leak
  of ministry data.
- **Twenty is operationally young in the ways that matter for a system of
  record:** no API versioning or deprecation policy (breaking changes ship
  in near-weekly minor releases), at-most-once webhooks with no retries and
  no event IDs, record merge is an irreversible hard-delete, ~100 req/min
  default rate limit shared across all tenants.
- **Industry patterns are one-sided:** mature platforms keep truth in their
  own database and treat external systems as executors or disposable
  projections (Stripe mirrored locally, search-index pattern, CQRS read
  models). Fan-out API reads on page load are a named anti-pattern. No
  successful nonprofit platform builds relationship truth on an embedded
  third-party CRM engine; half-in/half-out truth splits have no documented
  precedent.
- **The repo's own documents conflicted:** the unmerged
  `integrate-twenty-crm-core` ownership matrix said people/orgs/households/
  relationships become "Twenty-backed … bidirectional … Twenty wins for
  CRM-only fields," while Phase 4 A2 ruled one-way projection and Phase 7
  built the party layer in Asym. The conflict had to be resolved before
  Phase 9 (Full CRM Depth & Relationship Graph) could be groomed.

## Decision

1. **Asym Postgres is the system of record for all CRM truth**: persons,
   donors, missionaries, households, organizations/churches, the
   relationship graph, CRM notes, tasks, activity timelines, and
   duplicate/merge state — alongside the already-Asym money, receipt,
   identity, and communication truth.
2. **Twenty CRM is retired as a product dependency.** No product surface may
   read from, write to, or depend on Twenty. The one-way mirror never turns
   on. The unmerged `integrate-twenty-crm-core` change is withdrawn (its
   spec deltas must never be merged); the package carries a RETIRED banner
   and is archived by the cleanup ticket (#602).
3. **The Twenty-specific code goes dormant now and is removed by a scheduled
   cleanup ticket (#602)** (client stack, webhook ingress, read-through
   services, projection/mirror machinery, `twenty-object-model`). Reusable
   Asym-serving pieces are kept: `crm_record_links` (generalized provider
   links), `crm_merge_candidates` + duplicate detection (feeds the Phase 4
   merge workbench), `crm_command_logs` (audited-write boundary), and the
   durable idempotent outbound-queue pattern (future provider sync, e.g.
   Mailchimp).
4. **Phase 8 (CRM Operating Foundation) is re-groomed.** Its
   Notes-write-to-Twenty tranche, provider write gates, provider
   idempotency log, and live-Twenty round-trip evidence requirements are
   withdrawn. Surviving concerns (staff operations visibility, CRM data
   health, alert routing) will be re-scoped against Asym-internal subjects
   in a dedicated grill (#603) before any Phase 8 build starts.
5. **Phase 9+ build CRM depth directly on Asym Postgres** using Phase 4
   isolation plumbing (composite `(tenant_id, id)` keys, `ENABLE`+`FORCE`
   RLS, tenant-guard) and the Phase 7 party spine.

The full record-type ownership table lives in
`docs/prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md`
(the Phase 1 deliverable this ruling completes).

## Consequences

- Phase 9's net-new data model is small and local: CRM notes, activity
  timeline, and relationship edge/type tables in Asym Postgres (tasks and
  pledges already live in Asym; Phase 7 builds the party tables).
- The `/crm/relationships` and `/crm/notes` screens are re-pointed from
  Twenty REST read-through to local SQL (faster, paginated, RLS-protected);
  the "queued note placeholder" wart disappears — a created note is an
  authoritative local insert.
- Phase 11 (Custom CRM Fields) must design its own tenant-safe
  configurable-fields engine on Postgres; Twenty's Metadata API was
  workspace-global and could not deliver per-tenant fields in the shared
  workspace anyway.
- Reporting (Phase 33), imports (Phase 30), and workflows (Phase 34) operate
  on one local database — no cross-system ETL for CRM data.
  _(Editorial note, 2026-07-07: the forward-phase numbers in this section
  were updated to Roadmap v2 — see
  `docs/prds/sitestacker-parity/roadmap.md`; the decision content is
  unchanged.)_
- The cleanup ticket (#602) must also: verify/revoke the Vercel `TWENTY_*`
  env entries recorded on 2026-05-14, delete the dev-workspace proof record
  and development API key left in Twenty Cloud, re-`COMMENT` the
  `staged_gifts`/`crm_command_logs` SQL comments via a forward migration,
  rewrite or delete the six staff-visible "Twenty CRM owns …" strings, and
  archive the `integrate-twenty-crm-core` package with a link-fix sweep.
- Historical records are not rewritten: phase-evidence files, the tombstoned
  `phase-01-crm-operating-foundation.md`, and the checked-off
  `integrate-twenty-crm-core/tasks.md` remain as written, with supersession
  pointers only.

## Alternatives rejected

- **Twenty as system of record for the relationship facet** (the unmerged
  ownership matrix's position): rejected — filter-string tenant isolation in
  a shared workspace, no API stability contract, at-most-once webhooks,
  irreversible merge, the fan-out read anti-pattern, and no industry
  precedent for splitting entity truth (Asym) from relationship truth
  (provider).
- **Asym truth + a maintained one-way Twenty mirror**: rejected — the mirror
  has no consumer (raw Twenty UI is forbidden as the staff workflow by
  OpenSpec), so it would be a permanently maintained projection nobody
  reads.
- **Defer the decision until Phase 8 unblocks**: rejected — switching costs
  grow the moment the first production write lands in Twenty; deciding
  before the Phase 8 build is the uniquely cheap moment.
