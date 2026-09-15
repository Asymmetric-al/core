## Context

The ratified Phase26 contract completes an existing partial Support implementation within Mission Control and selected contextual Help surfaces. Current code includes parallel legacy Support, broad staff/admin gates, in-memory/demo fallbacks, partially qualified intake/delivery, shared unread and editor behavior, and tests that often assert mocked or shell outcomes. Those are current-state facts, not the desired contract.

The founder confirmed the primary real authenticated workflow/owner boundary, backed by disposable local Supabase, with focused database/concurrency proof and real Playwright journeys. Existing platform identity, native CRM, P17 content/preparation, P6 communication, source privacy and durable-work owners constrain the implementation. The complete specification supplies the precise per-decision requirements and acceptance registry; this design explains the shared architecture and delivery approach.

## Goals / Non-Goals

**Goals:**

- Preserve one owner and one authoritative mutation boundary for every fact, while giving users coherent Support/CRM/Help journeys.
- Make forbidden state transformations, duplicate effects and stale resurrection structurally impossible where the actual database and owner boundary can enforce them.
- Reuse the established UI, authoring, projection, authentication, storage, durable execution and testing patterns; qualify or replace incompatible current paths explicitly.
- Keep common interactions simple while providing honest, in-context failure recovery and complete source custody.
- Deliver an auditable migration/qualification path with the exact accepted proof and operating obligations.

**Non-Goals:**

- New generic workflow, approval, CRM, identity, notification or provider platforms.
- Caller-controlled credentials, roles, source identity, policy time, actor attribution or protected-action authority.
- Reproducing competitor scope, rewriting unrelated Asym surfaces or treating this planning package as an implemented release.
- A new testing framework, a prototype presented as real-backend proof, or public/production fixture endpoints.

## Decisions

### Canonical Support and domain commands

Implement through the existing shared business API contracts and approved database read projections. Thin application routes and shared UI consume those contracts. Sensitive state changes, multi-table work, audit, provider calls and role changes remain server-owned. Browser collection conventions remain available only for their permitted simple operations, not as bypasses around the ratified Support commands.

This preserves source authority and minimizes seams. A feature-local database client or duplicated CRM adapter would be smaller superficially but would fragment authorization, replay and source truth. The current broad adapter must be narrowed where it conflicts with the accepted contract; its existence is not a reason to perpetuate it.

### Source identities and current projections

Retain immutable original conversation, inbound occurrence/recipient, authored content, receiving identity and canonical owner relationships. Combined membership, readers, filtered views and private finders project exact currently authorized originals. Current component work, assignment, priority and reminder plans and guarded work-home transfer decisions/receipts are authoritative owner-command facts; do not reconstruct them from dormant original states. Store only the selected Support facts—no duplicate Party, provider-mailbox state, raw-body archive or general identity registry.

Commands bind the exact current input set, actor, expected revisions and generation. The per-decision registry defines the different mutability and custody of messages, note revisions, drafts, policy controls, reading markers and evidence; do not collapse them into a single generic event/document table or universal update endpoint. Derived presentation cannot become a write authority.

### Trusted context and database defense

Resolve real sessions, user/profile mapping, tenant membership and current capability server-side. External input retains verified receiving/provider provenance without pretending that a mailbox proves a person. Authorization checks apply to each read/command/result path and current source, not only the top-level staff shell.

Use same-tenant keys, constrained valid states, trusted immutable attribution, exact source/control generations and durable-effect uniqueness. Recheck effective grants, RLS, views, RPC and Storage behavior under actual roles, including resulting-row transformations and privileged paths. The specific source protocols, not a generic superuser function, define the necessary atomicity and serialization.

### P17/P6 and canonical intake

Keep Support human drafting/source intent separate from P17 governed whole-message preparation and P6 actual recipient/channel communication. Freeze exact external material and provider envelope before I/O; reconcile possibly submitted outcomes under the same immutable identity. Local in-product availability uses its existing no-provider-artifact posture. Internal-note publication is not outgoing email preparation, and optional Follow is not a substitute for direct or required attention.

Canonical intake owns verified receiving occurrence, hydration, correlation, held gates and exact future-mail policy. Hold effectiveness uses first durable acceptance and survives replay/deferred routing; current handling inbox or current worker-time hold policy is insufficient. Policy binding remains purpose-specific: D6 still-pending automatic first assignment reevaluates the current published assignment policy with original identity and decision lineage; D8 handoff mode binds once to its qualified episode. Shared durable execution and dispatch claims recover handoff without acquiring business authority. No new provider is selected by this spec; the mandated provider capability must be qualified before activation.

### Shared UI and editor contracts

Use the existing Base UI/base-maia system and canonical Tiptap schema/render/authoring profiles, with the ratified publication/audience boundaries. Preserve draft ownership, recipients, focus, selection, IME and position across navigation and source changes. State indicators, private lists, note history, file viewers and scoped recovery operate through the same source and permission contracts.

Keep the accepted terse actions and defaults. The detailed UX clauses, including D29-X01, bind actual target size, focus visibility, text resize/reflow, mobile keyboard and keyboard/AT outcomes. Reference examples are visual evidence, not permission to install different primitives, silently downgrade rendering or create a separate theme.

### One primary acceptance harness and necessary proof lanes

Use existing test frameworks with one thin shared local fixture/runner around authenticated public commands, authorized projections and canonical intake/job entries. A distinct integration invocation exercises real Supabase/PostgreSQL/Auth/Storage as required; ordinary unit tests remain offline and secret-free. Browser acceptance uses that same backend and actual session paths, with explicit target and no-demo-fallback assertions.

Use direct real-role database and independent-connection checks for invariants the public API alone cannot prove. Control genuinely external network behavior at the provider boundary for repeatable failures, then separately qualify actual provider contracts in an isolated authorized environment. Preserve manual accessibility and intended-user proof. This shared setup avoids many disconnected test-only product seams without pretending one browser click can prove every database invariant.

## Risks / Trade-offs

- Current source is materially less qualified than the design → distinguish existing scaffolding from new implementation work, fence incompatible writers and require actual acceptance before activation.
- One giant generalized Support abstraction would conceal distinct owners → use stable existing module boundaries and source-specific typed commands; consolidate common validation only when invariants truly match.
- A small UI action can affect source custody, pending work or communication → commit the exact current effect atomically, preserve independent obligations and offer source-owned recovery.
- Realtime or optimistic UI can be stale → treat them as advisory/invalidation/pending presentation, reconcile durable results and preserve the per-decision concurrency fences.
- A broad historical corpus can hide later amendments → maintain source-section dispositions and formal requirement/story/AC links; preserve D27-C, D29-X01 and all later exact refinements without resurrecting old scope.
- A universal timing/retention/performance policy would erase accepted distinctions → carry each exact unit, origin, bound and owner-specific gate; measure deliberately deferred operating budgets before activation.
- Mocked or skipped tests can produce false confidence → separate documentary, unit, integration, browser, provider, accessibility and intended-user evidence and fail the relevant qualification when required fixtures are unavailable.

## Migration Plan

1. Inventory actual legacy data, current writers, owner contracts, source/receiving identities, pending effects, privacy/custody and dependency readiness. Record verified mappings and explicitly unresolved provenance. Resolve the existing native-CRM correction through its owning accepted change rather than adding a parallel vendor seam.
2. Add qualified data/control identities, constraints, current capabilities, generation fences and durable result/dispatch protocols. Keep old code compatible only where it cannot bypass the new boundary; fence conflicting writers before capability activation. No guessed personal state, sender policy, historical time, Party or resolution credit is backfilled.
3. Establish the isolated integration fixtures and actual role/concurrency/migration tests. Prove both commit orders, ambiguous outcomes, source restriction, expiry, restore and dependent-owner failures. Preserve per-decision mandatory provider and privacy qualification.
4. Introduce qualified projections and complete staff/Help journeys using the existing UI and authoring system. Complete exact-state, interruption, accessibility, localization, mobile, low-bandwidth and production-shaped performance proof.
5. Assign actual operating responsibility, coverage, custody schedules, measured budgets and residual controls. Activate only the scope whose acceptance and dependencies are proven; do not label unqualified remaining scope complete.
6. Rehearse scoped stop, recovery and roll-forward. Disable unsafe new admission/actions while retaining source restrictions, held review, accepted business effects and P6 uncertain-outcome reconciliation. A rollback must not restore an incompatible writer, stale generation, expired byte source or fresh provider retry identity.

## Evidence obligations

No unresolved product choice is deferred by this design. Actual provider capabilities, legacy mappings, source/role qualification, custody inventory, numerical runtime capacity/budgets, accountable operators and intended-user outcomes are concrete preactivation deliverables specified in the acceptance registry. They cannot be replaced by assumptions or monitor-only placeholders. Implementation work and release proof remain unchecked until their actual evidence exists.
