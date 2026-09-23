# 7. Build plan, acceptance, rollout, and operations

## Delivery waves

Waves describe sequencing within this specification, not new roadmap phase numbers or authorization to skip dependencies.

| Wave                                | Deliverable                                                                                                                                                             | Exit evidence                                                                                                                             |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| W0 — authority and substrate        | Binding map, registry contracts, domain-ready matrix, additive schema design, threat model, source event correctness                                                    | OpenSpec review, Core Guardian review, source owners agree exact allowed commands                                                         |
| W1 — executable foundation          | AST/compiler, state transitions, event intake, semantic operations, wait handshake, two real vertical slices                                                            | Non-mobilization intake/shared-task and private-document/review tracers work through real source services; giving proof belongs to GIVING |
| W2 — authoring and participation    | Guided editor, canvas/outline, common forms, limited tasks and participant composition, My Work, simulation and publication; application My Journey binds in Phase 41   | Accessible staff and external-participant end-to-end tests                                                                                |
| W3 — long processes and amendments  | Generic parallel work, non-mobilization plan revision, compatible migration and document evidence; full mobilization and training-plan qualification belong to Phase 41 | Evidence-currentness, late-event, concurrency, cancellation, and upgrade drills                                                           |
| W4 — cross-product packs            | CORE Support/development/coaching/content/document/operational recipes; EVENTS, GIVING, CARE and MOBILIZATION qualify their separate assigned packs                     | Each pack passes owning-source capability/readiness tests                                                                                 |
| W5 — protected and restricted lanes | CORE protected finance coordination and sealed-scope negative tests; CARE independently qualifies actual member-care orchestration                                      | Independent approval invariants, zero existence leaks, provider/data-handling qualification                                               |
| W6 — pilot and rollout              | Per-tenant activation, operational tooling, documentation, cost/load results                                                                                            | Representative-tenant usability tests, rollback and restore evidence, no critical findings                                                |

No wave is complete because the templates are visible. No member-care scope activates before sealed projections and provider qualification. No finance scope activates by exposing the prototype correction/replay actions.

## Repository placement

Proposed shared contract module can start under the existing workflow package boundary rather than immediately introducing a new workspace. Prefer `packages/api/src/workflows/studio/` for business services, a pure isomorphic contract/compiler module in the established shared package topology, `packages/database` for browser-safe query hooks/projections, and `packages/ui` for shared primitives. Mission Control owns editor composition; participant routes use their app's scoped projection. Read nearest `AGENTS.md`, current manifests, installed Next documentation, and tests before implementing each subtree [R1].

The effective active change is `openspec/changes/add-workflow-studio-program-contracts/`. It consumes durable orchestration and source owners; it does not replace Eve’s separate governed dynamic-workflow capability. Its future task projection is generated from the effective delivery plan. Do not run `openspec update` or archive unfinished work [R2]. The specification supplies no production migration and applies none.

## Required TDD suites

Compiler: malformed AST, type mismatches, node identity, predicate truth tables, unknown history, overlap, unselected branches, dominator analysis, subflow recursion, workload budgets, classification propagation, retired bindings, default-off posture.

State-machine/property tests: accepted events cannot produce duplicate effects; selected joins advance at most once; past decisions remain immutable; cancellation fences stale work; unrelated branches survive partial failure; publication changes do not change active plans. Generate shuffled events, duplicate events, lease expiries, source corrections, and concurrent edits.

Database: composite tenant isolation, source FKs, RLS and privileged-path negative tests, CAS, unique enrollment/effects, claim fencing, outbox atomicity, lower-sequence late commit, concurrent consumers, retention and restore tombstones. Do not substitute in-memory tests for database races.

Adapter: source-owned evidence, communications, assignments, permissions, signatures and webhooks, provider ambiguity, retry window expiry, source retirement, invalidation events, and safe source-specific result mapping. Each action has both a simulation implementation and a real integration test; simulation cannot call production transport.

UI/Playwright: CORE builds a simple rule and parallel non-mobilization source process, previews roles, recovers a missing owner, amends an active common plan, prevents duplicate messages and completes a purpose-limited form on mobile. Prove poor connectivity, keyboard/outline authoring, assistive technology, return-to-task focus and server field exclusion. MOBILIZATION separately proves the parallel application and applicant-specific amendment; other packs qualify their exact source journeys.

Security: cross-tenant IDs, staff-to-care enumeration, unauthorized derived conditions, source-access revocation between preflight and dispatch, malicious form/email text, unsafe attachment/reference URLs, CSRF, token scanners, guessed task IDs, secret leakage in traces and error reports, destructive imported definitions.

## Proposed performance and reliability targets

Targets below are acceptance requirements to measure under documented infrastructure and load, not current production performance claims. Record CPU, memory, database size, hosted plan, dataset, region, browser, network profile, and observed results in evidence.

| Measurement                      | Initial target                                                                                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accepted source events           | No loss in fault-injection suite; every accepted event has a durable receipt/outbox identity                                                          |
| Duplicate business effects       | Zero in replay/race/recovery fixtures; uncertain outcomes never silently retried                                                                      |
| Interactive editor               | 250-node expanded fixture remains usable; p95 interaction feedback under 100 ms on agreed reference laptop                                            |
| Participant task mutation        | p95 authoritative acceptance under 1 s excluding file upload/provider execution on agreed baseline                                                    |
| Normal event-to-visible-task lag | p95 under 10 s, p99 under 60 s at certified load; source receipt time is reported                                                                     |
| Recovery scan                    | Finds due stalled work within 5 min of healthy execution recovery; outage independent alert has tested coverage                                       |
| Workload test                    | At least 100 tenant fixtures, 100k dormant engagements, 10k due operations, and a 10x burst tenant without cross-tenant leakage or accepted-work loss |
| Accessibility                    | WCAG 2.2 AA target; automated checks plus manual keyboard and screen-reader acceptance                                                                |

Thresholds may be revised through an evidence-backed spec amendment before launch. Do not hide a failing test by changing the target after measurement without recorded approval.

## Operational runbooks

**Missing work:** identify source event and binding generation; inspect durable receipt, publication readiness, enrollment key, run health, and source task. Repair the smallest missing handoff. Do not re-fire the whole donor lifecycle.

**Uncertain email/provider result:** inspect prepared intent and exact source request identity; query the authorized provider evidence path; confirm or retain `outcome_unknown`; resend only when the contract proves safe or an authorized new business communication is explicitly created.

**Revoked grant or departed staff:** suspend affected new optional operations; reassign work through authorized source services; review grant ownership; do not grant blanket admin access. Preserve irreversible completed facts.

**Bad template publication:** disable new enrollment for that binding; inspect impact cohort; continue unaffected old versions; prepare per-run amendments or discontinuation. Do not alter immutable history or remove required source operations.

**Provider outage:** continue accepted source writes and queue work; distinguish essential versus optional capacity; surface operational health. Reopen gradually with current permission and suppression checks, not a catch-up flood.

**Database restore:** keep outward effects and grant changes disabled; reconcile prior operations and revocations; preserve disposal tombstones; verify no duplicate or resurrected effect before enabling tenant batches.

## Metrics

Use authorized, source-labeled metrics: run age, waiting-on-staff/applicant/external-source time, missing owners, due work, unknown outcomes, confirmed source handoffs, duplicate attempts prevented, eligible notifications suppressed, late timer wake, amended plans, abandoned drafts, and publication errors. Avoid a universal progress percentage. Care-related aggregates remain protected. Financial metrics use their owning reporting definitions; Studio never sums incomparable currencies or sources.

## Go / no-go gates

Do not release with any unresolved cross-tenant or restricted-existence leak, unauthorized source command, duplicate external effect, lost accepted event, blind ambiguous retry, unsafe payment/expense approval, invalid evidence completion, or irreversible history rewrite. A missing provider integration cannot be disguised by a mock green node.

Before full release, choose representative design partners: small agency, larger multi-region agency, sending church/network, and restricted-ministry organization. CORE staff must create a real rule without a developer, amend a real non-mobilization run, and recover stalled work; participants must complete their authorized part on a phone. MOBILIZATION separately proves an applicant amendment and the complete application-to-handoff journey. Record findings, not assumed satisfaction.

## Repository verification to run during implementation

Use the locally pinned CLI and current scripts: `bun run openspec -- validate add-workflow-studio-program-contracts --strict`, `bun run openspec:validate`, `bun run lint`, `bun run typecheck`, `bun run test:unit`, relevant Playwright/a11y suites, `bun run format:check`, `bun run verify:workspace-contract`, `bun run check`, and `bun run ci:preflight`. Inspect current commands before use. This package's own validation is not a claim these repository checks ran.

## Remaining external decisions, with safe defaults

| Gate                                            | Accountable owner             | Evidence needed                                                                 | Safe behavior before resolution                                       |
| ----------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Exact Inngest deployment/plan and data handling | Platform/security             | Current contract, retention/access/residency, load and failover tests           | Synthetic development only for unqualified restricted lanes           |
| Exact e-sign provider/capability                | Document/domain owner         | Signature/evidence semantics, webhook and ambiguity tests, tenant authorization | Manual reviewed evidence where policy permits; automated signing dark |
| Screening provider/capability                   | Mobilization/security         | Exact lawful purpose, access/retention, source evidence tests                   | Authorized manual screening; no fake provider result                  |
| Current source seams and DB names               | Owning implementation teams   | Repo inventory and compatibility tests                                          | Do not introduce parallel owner or unsafe migration                   |
| Domain retention schedules                      | Data/records owners           | Approved purpose-specific schedules and holds                                   | No arbitrary Studio disposal timer                                    |
| Licensed layout dependency/version              | Frontend/security             | Exact package/license provenance, browser performance                           | Manual layout/outline remain fully usable                             |
| Tenant operational thresholds                   | Tenant publisher/domain owner | Activation preview with concrete dates/currency/recipients                      | Suggested defaults remain inert until accepted                        |
