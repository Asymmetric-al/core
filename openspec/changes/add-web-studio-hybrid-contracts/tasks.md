# Phase 42 implementation work packages

<!-- Generated from docs/prds/web-studio-hybrid/contracts/tasks.json. -->

The 27 HA package identities are preserved. Each package closes only after all assigned checkpoint scopes pass. The operative blocking graph is `checkpointDependencies`; historical `sourceDependencies` never drive execution. See the [full implementation plan](../../../docs/prds/web-studio-hybrid/implementation-plan.md) and [owner contracts](../../../docs/prds/web-studio-hybrid/owner-contracts.md).

Use TDD at actual owner seams, focused tests, strict OpenSpec and delta checks, applicable Core gates, real transaction/RLS/concurrency and browser evidence, migration, operational fault/capacity, accessible staff handoff and rollback proof. No product implementation task is completed by this planning update.

## 1. Work-package group 1

- [ ] 1.1 Reconcile the corrected baseline and exact owner amendments (HA-1.1). Record HA-A1–HA-A4 with preserved D1–D36 semantics, a verified issue overlap map and current evidence. No feature code or invented ratification. Exit proof: Changed-doc consistency and dependency review; required amendments accepted before implementation. Requirements: HW-001, HW-002. Required checkpoint scopes: WEB-VISUAL.

- [ ] 1.2 Qualify the engine/editor/toolchain cohort (HA-1.2). One exact supported Payload-major-compatible cohort and Puck candidate evaluated; no forced peers or dependency channel mixing. Exit proof: Real startup, forms, transactions, auth, preview, version restore and migration proof under Q01. Requirements: HW-003. Required checkpoint scopes: WEB-VISUAL.

- [ ] 1.3 Prove the authoritative actor/service and physical transaction boundary (HA-1.3). One save tracer commits content/revision/lease/receipt together; exact server context and no raw provider path. Exit proof: Red-green tests plus real Postgres grants/RLS, rollback injection, same-user tab and lost-response proof (Q02). Requirements: HW-004, HW-039, HW-040, HW-041. Required checkpoint scopes: WEB-VISUAL.

## 2. Work-package group 2

- [ ] 2.1 Extract the canonical semantic contract without changing existing content meaning (HA-2.1). One code-owned catalog adapter for current semantic types, identities and explicit versions. Exit proof: Existing valid fixtures remain equivalent; unknown type/version rejects without omission. Requirements: HW-005. Required checkpoint scopes: WEB-VISUAL.

- [ ] 2.2 Implement the bounded v2 composition grammar and reversible canvas projection (HA-2.2). Exact approved Page grammar; v1/Article unchanged; one lossless projection for the actual pinned adapter. Exit proof: Positive/boundary/malicious grammar tests and actual Puck canonical round-trip, not only the reference validator. Requirements: HW-006, HW-007. Required checkpoint scopes: WEB-VISUAL.

- [ ] 2.3 Ship the presentation SDK and registered editor/public bindings (HA-2.3). Pure versioned public types, safe capabilities, declarative controls and separate client/public entrypoints. Exit proof: Type/import graph, binding visibility, SSR/no-JS/hydration and representative local setup tests. Requirements: HW-008, HW-028. Required checkpoint scopes: WEB-VISUAL.

- [ ] 2.4 Establish compatibility fixtures and the standard rendering path (HA-2.4). Standard renderers and historical/locale/reduced-motion/failure fixtures for all admitted semantic and layout profiles. Exit proof: No silent drop across versions; explicit fallback and incompatible-state proof. Requirements: HW-009. Required checkpoint scopes: WEB-VISUAL.

## 3. Work-package group 3

- [ ] 3.1 Deliver acknowledged editorial saving and fenced recovery (HA-3.1). Asym form projection uses D12 receipts, serialized autosave, incomplete drafts, compare and restore-as-draft. Exit proof: Strict real-stack edit/save/retry/takeover/revocation tracer; separate axes do not mutate one another. Requirements: HW-010, HW-011, HW-012. Required checkpoint scopes: WEB-VISUAL.

- [ ] 3.2 Deliver the visual composer and equivalent non-drag controls (HA-3.2). Base Maia outline/canvas/inspector with insertion, move, duplicate, remove and finite controls. Exit proof: Real tasks with keyboard/pointer/touch, focus/announcements, screen reader and narrow reflow. Requirements: HW-013. Required checkpoint scopes: WEB-VISUAL.

- [ ] 3.3 Integrate the isolated composer and click-to-edit preview bridge (HA-3.3). Whole composer on approved isolated origin with minimal projection, validated bridge and editor-only source mappings. Exit proof: Cross-origin attack/replay tests, supported-browser auth/cookie behavior and current content selection. Requirements: HW-014, HW-015. Required checkpoint scopes: WEB-VISUAL.

- [ ] 3.4 Connect qualified media and canonical links/capabilities (HA-3.4). Pickers and render bindings reference owner-approved media and link identities; no copied operational records. Exit proof: Revocation/expiry races, alt/crop/localization and side-effect-dark Give/form preview. Requirements: HW-016. Required checkpoint scopes: WEB-VISUAL.

- [ ] 3.5 Connect root reuse and exact-locale editing (HA-3.5). Existing owner operations exposed through visual UI with exact scopes and explicit impact. Exit proof: Reference depth/scope denial, copy independence, missing-locale no-fallback and source-change preservation. Requirements: HW-017, HW-018. Required checkpoint scopes: WEB-VISUAL.

- [ ] 3.6 Connect Page variants and separately governed Site appearance (HA-3.6). Finite instance settings and separate appearance work; no hidden brand, navigation or route writes. Exit proof: Per-instance/Site-axis isolation and actual affected-scope review. Requirements: HW-019. Required checkpoint scopes: WEB-VISUAL.

## 4. Work-package group 4

- [ ] 4.1 Connect and manage the ministry-owned source repository (HA-4.1). Selected-repository GitHub App consent, durable scope/identity/epoch and deliberate disconnect/rebind UX. Exit proof: Forged callback, replay, unrelated repository, rename/transfer/removal and source-independent CMS behavior. Requirements: HW-021, HW-022, HW-042. Required checkpoint scopes: WEB-SOURCE.

- [ ] 4.2 Ingest exact source from durable authenticated events (HA-4.2). Raw webhook verification, durable event/dispatch receipt, bounded source capture and credential stripping. Exit proof: Missed/duplicate/out-of-order events, symlink/archive abuse, submodule/LFS policy and reconnect fences. Requirements: HW-023, HW-024. Required checkpoint scopes: WEB-SOURCE.

- [ ] 4.3 Ship a professional developer starter and handoff guide (HA-4.3). Conventional project, local commands, safe fixtures, optional external-agent guide and clear source rights. Exit proof: Fresh clone in clean supported environment without internal Core source, hosted AI or proprietary IDE. Requirements: HW-020, HW-025, HW-046. Required checkpoint scopes: WEB-SOURCE.

- [ ] 4.4 Run clean isolated builds with bounded supervision (HA-4.4). Frozen toolchain/dependency execution, claim fencing, independent evidence collection and truthful cancellation. Exit proof: Hostile scripts/egress, poisoned cache, interrupted and duplicated execution, resource ceilings. Requirements: HW-026. Required checkpoint scopes: WEB-SOURCE.

- [ ] 4.5 Attach independent admission to the existing package owner (HA-4.5). Extend existing #1365 responsibilities with exact source origin and hybrid binding evidence; no duplicate certifier. Exit proof: Customer-controlled false green cannot admit; exact artifact and maintainer/license/compatibility evidence required. Requirements: HW-027. Required checkpoint scopes: WEB-SOURCE.

## 5. Work-package group 5

- [ ] 5.1 Prepare exact private working and whole-site review previews (HA-5.1). Distinguish fast working canvas from complete sealed candidate; actual-content review reauthorized per request. Exit proof: Later private edits stay excluded; partial candidate cannot browse; unknown routes do not fall through to Live. Requirements: HW-029, HW-030. Required checkpoint scopes: WEB-VISUAL, WEB-HYBRID.

- [ ] 5.2 Make admitted renderers available through a versioned managed runtime registry (HA-5.2). Controlled code release installs exact admitted artifacts and retains required old versions. Exit proof: No auto activation, remote module or private runtime import; mixed-version readiness is explicit. Requirements: HW-031. Required checkpoint scopes: WEB-SOURCE.

- [ ] 5.3 Join editorial and complete-cohort design activation to existing owners (HA-5.3). Reuse #1350/#1366/#1367 responsibilities; exact head and cohort fences, receipts, restore successor. Exit proof: All-or-none real Postgres races, preserved unrelated content, failed activation byte-stability and current-safety restore. Requirements: HW-032, HW-033, HW-034. Required checkpoint scopes: WEB-VISUAL, WEB-HYBRID.

- [ ] 5.4 Expose existing exact publication appointments and shared execution (HA-5.4). Schedule UI over exact owner operation, time-zone disambiguation, horizon handoff and shared overdue recovery. Exit proof: No-before execution, duplicate event beyond provider dedupe, cancel/execute race and organization authorization semantics. Requirements: HW-035, HW-036. Required checkpoint scopes: WEB-VISUAL, WEB-HYBRID.

- [ ] 5.5 Wire release convergence and immediate adverse containment (HA-5.5). Identifier-only outbox to existing projections; current adverse eligibility before rendering. Exit proof: Delayed old favorable events cannot restore withdrawn content; projection failure never invents publication. Requirements: HW-037. Required checkpoint scopes: WEB-VISUAL, WEB-HYBRID.

## 6. Work-package group 6

- [ ] 6.1 Deliver cause-owned operations, bounded capacity and artifact retention (HA-6.1). Receipt lookup, bounded retry/claim supervision, safe diagnostics, reference-aware cleanup and documented controls. Exit proof: Unknown external outcomes, fairness/load, expired previews and incomplete-use no-purge proof. Requirements: HW-038, HW-044, HW-045. Required checkpoint scopes: WEB-VISUAL, WEB-SOURCE, WEB-HYBRID.

- [ ] 6.2 Prove migration, upgrade and one-authority cutover (HA-6.2). No-write census/plan, exact schema/content successors, expand-contract and legacy retirement. Exit proof: Old/new code/schema matrix, editor race, interrupted backfill, restoration and no competing writer. Requirements: HW-043. Required checkpoint scopes: WEB-VISUAL, WEB-HYBRID.

- [ ] 6.3 Prove visual/developer handoff with representative staff (HA-6.3). Staff complete named tasks after real custom redesign; maintainer replacement and export explanation tested. Exit proof: Moderated actual target-user tasks; synthetic demos alone cannot qualify experience. Requirements: HW-047. Required checkpoint scopes: WEB-VISUAL, WEB-SOURCE, WEB-HYBRID.

- [ ] 6.4 Complete end-to-end, capacity and release admission evidence (HA-6.4). Cross-journey evidence maps every HW requirement and scenario to exact versioned results and owner. Exit proof: Run applicable Core gates and strict real-stack/security/a11y/capacity tests; activate only proved profiles. Requirements: HW-048. Required checkpoint scopes: WEB-VISUAL, WEB-SOURCE, WEB-HYBRID.
