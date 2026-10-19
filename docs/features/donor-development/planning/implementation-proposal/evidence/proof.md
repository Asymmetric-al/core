# Phase 27 ticket qualification and dispatch evidence

Read-only review by ticket_gates. No repository source, existing issue, label, PR or parent change was made.

## Revision and scope

The approved proof.md (all 16 Q requirements / 32 cases), operations.md (all 141 rows), owner-reconciliation.md, main Implementation Decisions / Testing Decisions / Out of Scope / Further Notes, context C35/C36 and assignments A12/A14/A15/A18 were read in full. The final proposal binds to the documentation commit root will publish, not this temporary report.

Code first inspected at 225c02e9499bd6c0d493223cd4b1a4120ff787e3. Refreshed relevant evidence against current develop **71b81fae2ce1f9b615bcfee8606cd2c978a70e71** in `/workspace/core-phase27-docs`: current Bun **1.4.3**, Base UI **1.9.0**; the relevant test/config prior art is unchanged except CI's Bun bump. Do not freeze stale 1.4.2/1.8.2 into tickets.

Loaded repository `.agents/skills/to-tickets/SKILL.md` and full references/upstream.md manually; no claim of native picker invocation. Root AGENTS, general/backend/testing/OpenSpec rules, document-authority, protected paths and data-access boundary read. No skill mirror changed.

## Verified existing seams and actual gaps

- `tests/e2e/admin-table-pages-smoke.spec.ts`: real-shaped create/list/detail and reload workflow prior art, but `ensureAdminDemo` and available demo-state behavior mean this is not P27 current-auth/source qualification.
- `tests/e2e/data-table-accessibility.spec.ts`: real shared Base UI controls/axe/keyboard at widths 320,700,1280, both themes, reduced motion; intentionally isolated network-free component fixture, not composed P27 or WCAG conformance evidence.
- `tests/unit/packages/api/crm-notes.test.ts`: boundary outcomes with MemoryCrmNotesSupabase, useful unit prior art; not RLS/transaction/concurrency evidence.
- `tests/unit/packages/api/admin/contribution-operations-test-helpers.ts`: existing adapter enters the actual parsed command/executor seam; no new production test API needed.
- `supabase/tests/field_policies_rls.sql`: actual authenticated/anon role, grants/policies, two synthetic tenants, UPDATE/DELETE row effects and INSERT failures inside rollback; useful direct-role pattern.
- `tests/integration/supabase/donation-fee-replay-verification.sql`: actual RPC/role privileges and persisted saga receipt/replay facts, rollback-only seed proof. P27 extends the owner pattern rather than a copied in-memory model.
- `scripts/verify/supabase-migrations.mjs` and `.github/workflows/ci-integration.yml`: existing disposable migration/SQL replay path. CI uses `postgres:15-alpine`; local `supabase/config.toml` says `major_version=17`. Test on the actual admitted release version; neither implies qualification for another version.
- `scripts/run-with-ci-env.mjs` inserts `E2E_AUTH_BYPASS=true`, placeholder Supabase; main `playwright.config.ts` has bypass defaults. `test:e2e:strict` avoids the wrapper but is not by itself a guaranteed real-auth lane (must explicitly configure real disposable inputs, disable bypass and supply a fail-closed preflight). Required P27 suite must fail, never skip, if current source/identity/storage is absent.
- Ordinary Vitest stays offline (`vitest.config.ts`, `tests/setup/unit-env.ts`); do not quietly turn all unit tests into a real-service suite.

Verified current package entrypoints: `bun run test:unit`, `bun run test:e2e:strict`, `bun run test:a11y:strict`, `bun run test:perf:strict`, `bun run verify:supabase-migrations`, `bun run db:migrate:local`, `bun run verify:data-boundary`, `bun run verify:workspace-contract`, `bun run ci:preflight`. These command names are inspected, not runtime results. `db:migrate:local` resets the local DB and belongs only in disposable qualification setup. A first delivered P27 source slice extends the existing real-role test setup and records an exact focused required lane; no nonexistent P27 script is claimed here.

## Integrate common proof with every vertical slice

Q01–Q06 are mandatory at every reached owner boundary, not a late test ticket. Q09–Q10 are mandatory in each reached UI/egress flow; Q11 migration safety accompanies each writer/schema; Q13 source receipts/history/signals accompany their source; Q14 applies to each independently verifiable behavior. The final Q tickets only prove interactions and release evidence.

The proposed common-source mapping is in `../coverage.json`. Primary ownership is for coverage accounting, not exemption of other source consumers. Q01/Q02/Q03/Q04/Q05 and Q14-01 can be introduced with the first complete contextual-admission tracer P27-P01; any independently developed assignment/finance/context branch must prove the same contracts in its own real source fixture rather than wait for an unrelated UI ticket. Add every Q requirement's full current text or concise exact obligations into each applicable ticket's context/testing, with focused commit-pinned link.

No new horizontal “all database”, “all RLS”, “all UI”, “build the harness”, or giant final QA ticket is warranted. Existing #516 owns permanent actual-role isolation tier; extend that qualified seam. Domain producers provide current authorization, source receipts, bounded recovery and safe UI from their first delivery. Missing required producer blocks that consumed capability and never silently grants a mock substitute.

## Proposed terminal qualification slices

`../tickets.json` contains three complete draft issue payloads:

1. P27-Q01: cross-source migration/disable/restore after accepted new writes. Owns AC27-Q11-01/02 plus AC27-A12-01; source-specific census/migrations remain domain tickets.
2. P27-Q02: measured envelope and exercised operating controls. Owns Q12 both cases, Q13-02, A15-01, C36-04; consumes every admitted producer's emitted signal/repair controls, does not implement them at the end.
3. P27-Q03: composed real user journeys, intended-user pilot, truthful evidence. Owns Q09/Q10, Q14-02, Q16, C35 all four, C36-01/02/03, A14-01/A18-01. Root should bind only actual minimal producer sinks plus Q01/Q02; all per-slice security/a11y remains earlier mandatory proof.

Coordinated with program_contracts: removed its duplicate A10 final capacity/pilot catchall; nine assignment behavior slices retain 36 A cases, four terminal cases above remain explicit. Coordinated with next_frontier: its ten context behavior slices retain their behavioral proof; C35/C36 final composition/evidence maps to these Q tickets. A14-02/03 stay assignment source recovery/UI scope, not terminalized.

Q01/Q02 can progress independently once the actual consumed candidate components exist; Q03 depends on both operational evidence packets for qualification of its exact cohort. E7/C-01 do not block independent lifecycle/nonfinancial/native staff work or preparation. A pilot can identify safe admitted cohorts while explicitly unqualified lanes stay gated; no partial cohort closes the complete-phase coverage claim.

## Monitor implementation allocation

Every MON27 ID keeps its exact source signal/threshold/owner/response. Multiple historical rows can share a production signal and incident if their meanings coincide; no obligation to create 141 duplicate alerts or tasks. Producers implement/tests controls in their domain tickets. Q02 only maps accountable roles to actual people and exercises runbooks for admitted deployment. Q03 observes usability controls in intended-user pilot.

- MON001–087: P domain D2–D19; source agent owns exact ticket allocation. D6 due-review attention retains 15-minute planning threshold; no substitute email/cadence.
- MON088–092: Requests D22.
- MON093–098: bounded Request review D23.
- MON099–105: recorded appeal plan D24 and actual dispatch fence.
- MON106–113: P15 operational intake/handling D25.
- MON114–120: coordinated appeals/reporting/closure D29.
- MON121–126: shared voluntary context D26. Primary C01=121/123/124; C02=122/125/126.
- MON127–134: D28 giving patterns. Primary C05=127/128/134; C06=129/131/132; C07=130; C04=133.
- MON135=A08 privacy;136=A06 Auto fences;137=A05 handoff;138=A06 churn;139=A03 current proposal freshness;140=Q02 measured performance;141=Q03 comprehension/workaround.

All rows are fully preserved in source `monitors.json`/`operations.md`; `../coverage.json` assigns exact C/A primary maps and the P/F source-owner groups for root to resolve from those agents' proposed IDs. Never invent a new threshold where the source requires a declared measured budget before activation.

## Verified predecessor evidence and limits

Read full body/comments of #505/#516/#492/#493/#1954; source JSON snapshots are `/tmp/p27-ticket-gate-issue<n>.json`. Other #667–679 owner bodies were fetched for root reference but this report does not claim full review of those larger tickets.

- https://github.com/Asymmetric-al/core/issues/491 — delivered field-policy static ceiling source (not current-context producer).
- https://github.com/Asymmetric-al/core/issues/1954 — CLOSED; pure projection core shipped through PR1960, develop3793e44c083d9535f692a0fb09829d402def099e, as recorded in current#493. Current code has `packages/api/src/projection/*`. Pure tests are not runtime/RLS/financial qualification.
- https://github.com/Asymmetric-al/core/issues/493 — OPEN; retained actual current context, portal/source/parity/lint/CSV work. Its October6 component accounting says reuse #667/#668/#669 with #505 and applicable#516, plus actual reciprocal#670/#671/#677–680 components. It explicitly rejects whole-issue cycles and does not mark all components Ready. P27 must consume exact qualified artifacts, not gate every slice on all of #493.
- https://github.com/Asymmetric-al/core/issues/505 — OPEN; same-source trusted Tenant guard, non-owner/non-BYPASS role, FORCE RLS/composite references and permanent actual guard checks. Actual use needs qualified#669/#668/#667. Preparation need not wait for#516 which tests it.
- https://github.com/Asymmetric-al/core/issues/516 — OPEN; permanent actual-role/service-path isolation proof tier. Has staged preparation against actual#505/#506 inputs, later actual target proof. Completion remains broader than a P27 test fixture. P27 consumes applicable exact certificate and extends relevant tables/commands rather than creating a duplicate framework or treating a partial tracer as entire#516 done.
- https://github.com/Asymmetric-al/core/issues/492 — OPEN older body says union of all memberships. Do NOT import that stale shorthand into P27. Current governing single acting-context contracts and current#493 notes explicitly reject it. No issue amendment authorized here; proposal can identify the stale predecessor clause and pinned current source.

Existing source tasks remain their owners; no new duplicate capability/role/tenant substrate ticket. Registry/action extensions needed by a P27 source slice are bounded registration/qualification, not a whole configurable-P12 dependency. No native relation is claimed merely from these references.

## Labels and dispatch

Read `docs/agents/issue-tracker.md` and `triage-labels.md` plus live labels. Repository skill role `ready-for-agent` maps to **status:ready**, exactly one type, one status, one complexity. Do not create literal ready-for-agent. Live label description says “Ready for merge”; this is existing wording drift, not authority to change the explicit documented skill mapping or relabel parent1992.

At inspection current default branch is develop; live contents list exactly the seven checked-in workflows. None listens to `issues: labeled` or a ready-label implementation trigger. Actions inventory also lists historical PR Signal Coordinator, but its file is absent from live develop (404). Thus no repository-visible issue-ready dispatch is identified; external installed automation is not proved absent. `openspec/config.yaml` explicitly has `githubCopilot.cloudAgent: false`. No agent assignment or workflow-dispatch is required or authorized by ticket publication.

After breakdown approval, use **status:blocked** for every issue gated by unmerged docs, a genuine direct issue blocker, missing owner decision or unqualified consumed producer. Defer status:ready until those exact prerequisites are satisfied; record the reason in each issue. This obeys both status taxonomy and user’s no-accidental-dispatch requirement, even without visible dispatch automation. Once eligible, apply mappedstatus:ready after body/relationships readback. Parent1992 title/body/state/labels/comments must remain byte-for-byte unchanged; only approved native child links are allowed.

Human hierarchy is not a blocker. Specification integration is a non-issue prerequisite while docs PR is open, never a fictitious closed issue. Native blocked-by edges should represent genuine consumed work; component qualification can be a separately explicit evidence gate where whole-issue closure would create false dependencies. Publication must await exact breakdown approval. No runtime implementation/activation or production proof was performed by this review.

## Shared Tasks Hub producer gap and first-tracer recommendation

Current `packages/api/src/admin/mission-control-tasks/service.ts` and store are useful existing owner code, not ADR0183 qualification: task, links and event are sequential writes; the Supabase wrapper creates Finance Operations queue and defaults actor_and_queue. Do not copy that fallback for P27, whose exact source recipient/exception contract must be proved.

Fresh full #618 read confirms it deliberately owns party links/read service/Tasks tab/server summaries and says task mutation is not rebuilt. Its generic lastTouchAt has a separate operational meaning and must not be used as P27 Last recorded exchange; the new exact exchange metric is owned by P27-C03 without redefining the generic field. No mutation/actual-exchange qualification is inferred. #1704 is an OPEN Support-specific vertical extension that must make its exact task/brief/interest/result chain atomic; it explicitly denies treating #618/#1046 as general task prerequisites. Coordinate/reuse a delivered component if it genuinely exists, but waiting for a Support conversation is not a valid blocker for ordinary partnership admission. #710 is explicitly re-scoped to Phase16 successors and must not be dispatched or used as a competing foundation.

No independently tracked, delivered general ADR0183 producer was found in the current issue inventory/title and full issue searches for ADR0183/Tasks Hub. Recommended bounded enabler belongs _inside P27-P01 first ordinary admission behavior_: accept one exact source next action or owned actionable exception atomically with partnership/history/receipt/outbox intent; materialize one protected source-backed task in existing My tasks; re-prove recipient ceiling, deny generic completion, load protected source detail at the source, and recover the same identity after lost responses/projection failures. Demonstrate one actual partnership occurrence, not a fake source or generic framework. P07 extends last-work repair and independently owned obligations; Requests/context/Auto consumers may reuse the qualified adapter without a circular Requests→partnership dependency. No Website-specific recovery route/reason codes or new notification cadence transfers by analogy.
