# Design - Year-End Statement Operations

## Decision Authority

This design implements the ratified Phase 19 D1-D18 decisions without reopening
them. The Phase 19 PRD and its decision-to-test matrix are the detailed
implementation interface; this OpenSpec change records the observable contract.

At implementation and archive time, the repository source-of-truth order
controls: merged OpenSpec specifications, then accepted proposed OpenSpec
requirements, then the ratified PRD's detailed implementation and acceptance
contract, then ADR rationale, then `CONTEXT.md` vocabulary. These artifacts MUST
agree before dispatch. A conflict blocks implementation until every affected
surface is reconciled; an implementer may not select the most convenient text.

## Public Application Boundary

The highest public seam is one tenant- and actor-scoped
`StatementOperationsService` application boundary.
It exposes explicit typed commands and queries rather than one mega-function:

- build, inspect, and invalidate a Run Preflight;
- manage pre-start participation;
- request or perform the exact reviewed start;
- read run, item, lane, exception, progress, and evidence projections;
- pause, resume, stop, complete, or return a run to review;
- manage governed delivery profiles, destination succession, fulfillment, and
  contextual statement help; and
- admit supplemental, copy, and evidence-package operations.

The service is constructed with a trusted server-resolved execution context:
tenant, environment, stable human or service principal, active assignment,
effective-access token, assurance, governance epoch, and trace identity.
Command payloads never accept caller-authoritative tenant, environment, actor,
role, capability, or assurance fields. A caller may supply only an opaque replay
token; the server derives the permanent semantic slot and immutable command
fingerprint from trusted scope, command kind/version, logical target,
authorized occurrence slot, canonical input, expected fences, and governing
policy versions.

Command results use one discriminated outcome family: applied, exact replay,
stale, semantic conflict, blocked, invalid, not permitted or not found, or
external outcome unknown after a crossed handoff. Error projections expose only
closed reason codes, cause owner, permission-safe explanation, safe current
revision, and next action—not provider, SQL, or cross-scope details.

Phase 19-owned admin and donor route handlers, durable workers, recovery scans,
physical-provider adapters, and future Phase 19 surfaces must use this
boundary. They may not write Phase 19 tables, call providers outside their
typed ports, or reconstruct population truth directly. Phase 17 and Phase 18
workers continue through their own public boundaries.

## Authority Model

Phase 19 owns frozen run population, pre-start participation, release,
recipient-operation coordination, physical-fulfillment orchestration, run
control, staff completion, and Run Evidence Record projection. It consumes:

- Phase 7 Statement Subject, eligibility, facts, coverage, and corrections;
- Phase 14 recognition projections;
- Phase 18 publication resolution, logical documents, artifacts, current head,
  and access;
- Phase 17/6 communication plans, intent, transport, and delivery evidence;
- Phase 12 capability, assurance, and review authority; and
- Phase 15 source entry and correction.

Each foreign authority is referenced by same-scope stable identity, immutable
version/digest, and current fence. Phase 19 does not copy mutable donor profiles,
money facts, PDF bytes, message bodies, provider payloads, or exact destinations
into generic run evidence.

## Persistence And Concurrency

The canonical persistence model must support:

- immutable preflight manifests and digests;
- purpose-pinned runs and run items;
- frozen participation and reason evidence;
- recipient-document operations, delivery snapshots, Fulfillment Plans, and
  mutually exclusive derived lane membership;
- monotonic run-control posture and epoch;
- physical-fulfillment attempts and evidence;
- numbered completion snapshots;
- late-fact, recovery, supplemental, and contextual-help correlations; and
- one logical Run Evidence Record projection.

All durable rows carry composite tenant and environment ownership. Same-scope
foreign keys, `ENABLE ROW LEVEL SECURITY`, `FORCE ROW LEVEL SECURITY`,
server-derived scope, nonrevealing denials, permanent semantic idempotency,
compare-and-set revisions, transactional outbox, fenced leases, and
reconciliation are release invariants.

One short database transaction performs atomic start. It reauthorizes and
re-proves the exact Run Preflight, creates the run and item bindings, records
review/release evidence, writes the outbox request, and opens the release
barrier. It performs no renderer, storage, Resend, Inngest, portal, or mail
provider I/O.

## Durable Execution

Inngest may wake and execute work, but database state remains business truth.
Recipient-grained claims are tenant-fair, lease- and epoch-fenced, and recheck
the D8 control fence immediately before each irreversible effect. Provider
idempotency is defense in depth; unknown submission outcomes reconcile under
the original semantic identity and are never blindly retried.

The scheduler protects critical transactional messages, uses workload-shaped
certified capacity, and exposes one bounded tenant control:
**Target ready for review by**. It does not expose priority weights,
concurrency, batch size, provider rates, or a paid jump queue. Progress is a set
of separately truthful axes with freshness and ETA ranges, never one blended
percentage.

## Product Surfaces

The staff product is one calm, derived **Year-End Operations** workspace and
one authoritative run page. It is exception-first, permission-filtered,
responsive, and built from shared Core page, table/card, Base UI, and semantic
token primitives. Ordinary automatic work stays quiet. Actions state
consequences in plain language and avoid repeated confirmations, technical
jargon, color-only status, toast-only results, or a wall of KPI cards.

The donor portal shows one logical document and one current exact PDF action.
View, download, and local print are unmetered while current authorization and
records state permit access. A deliberate outbound copy request is a separate,
bounded, idempotent operation.

Canadian controls and Support-overview surfaces are structurally absent unless
their exact issuer/purpose contracts are active. Self-print is the quiet paper
default; provider configuration stays outside the ordinary workflow.

## Test Architecture

Primary acceptance tests exercise `StatementOperationsService` against real
PostgreSQL/Supabase behavior, including RLS, same-scope constraints, permanent
idempotency, compare-and-set races, atomic start, leases, fencing, outbox
recovery, and tenant-fair claims.

Deterministic fakes are allowed only at explicit external authority ports:

- the combined source-authority port: Phase 7 facts/eligibility/coverage and,
  only for Support-overview scenarios, Phase 14's authorized recognition
  projection;
- Phase 18 generated-document resolution and commands;
- Phase 17 communication resolution and commands;
- physical-fulfillment provider;
- object storage where exact-byte behavior is not the subject of the test; and
- clock, identifiers, and randomness.

There is no direct Phase 14 table/reducer fake and no second source seam.

The primary tests observe frozen population and reasons, idempotent atomic
start, participation, run control, downstream axes, physical fulfillment,
destination succession, recovery, completion, portal copy requests, and
evidence. Supporting tests cover route authorization and validation, dependency
contracts, SQL constraints and query plans, deterministic reducers, and a small
set of Playwright staff/donor journeys with WCAG 2.2 AA behavior.

Test mode is synthetic-only and structurally incapable of creating official
identity, donor history, portal publication, real communication, or physical
fulfillment. Production-shaped scale proof covers 0, 1, 100, 1,000, 10,000,
50,000, a complete over-cap preflight with atomic no-side-effect release block,
ten concurrent 50,000-subject runs, 100 concurrent 5,000-subject runs, and
certified 500,000-recipient simulations without a live mass send.

## Release Gates

- The Phase 17/18 authority package accepted or explicitly superseded.
- Strict OpenSpec, documentation congruence, and ownership validation.
- Real-database tenant isolation and concurrency proof.
- Exact count reconciliation with no dropped or duplicate recipient operation.
- Critical-message capacity remains protected under seasonal load.
- No legacy live-text statement path or alternate runtime remains.
- Complete keyboard, focus, screen-reader, reflow, zoom, forced-color,
  reduced-motion, touch-target, locale, RTL, and accessible-PDF evidence.

## Explicit Non-goals

No general campaign parent, workflow canvas, legal DSL, fiscal-close engine,
household ledger, postal platform, provider marketplace, generic case system,
second audit archive, giant snapshot blob, custom PDF viewer, or legacy
compatibility runtime is introduced.
