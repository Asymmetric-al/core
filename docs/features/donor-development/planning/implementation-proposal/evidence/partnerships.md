# Phase 27 partnership ticket proposal evidence

Prepared for the authorized `/to-tickets` breakdown. This is research and a reviewable proposal only: no product code, repository documentation, tests, issues, parent #1992 or PRs were changed by this subtask. The root owns the documentation PR, exact source pin and eventual user-approved publication.

## Coverage and read scope

- Read the complete supplied user attachment and exact `.agents/skills/to-tickets/SKILL.md`; followed root/API/admin/database/Supabase instructions, document authority, OpenSpec, backend, testing and data-access rules. Read governing ADR0136 in full and applicable source-work/notification owner clauses.
- Read the complete formal partnership requirement/acceptance source through coordinated ownership: root subtask P01–P13/P30–P33, stage subagent P14–P29. All matching stories and machine source traces are incorporated. The stage subagent read its full requirement and AC text, not summaries.
- Proposal: **21 partnership vertical slices (P27-P01–P21)** plus **one existing-source enabler (P27-S01)** proposed under Phase9 parent **#604**. S01 implements already accepted Ministry Assignment ownership, not a new P27 product decision.
- **321 partnership ACs** have exactly one local full-primary owner. **All14 REQ27-P33 ACs and US27-P50/P51** are primarily owned by **P27-C03**. Five cross-journey P criteria have full primary ownership in **P27-Q03**: AC27-P30-01, P10-06, P11-05, P12-02 and P12-06. The composed Request/lifecycle **AC27-F08-01** is also full-primary Q03; F05/P11/P12 keep their early implementation obligations shared. These agreed assignments cover all **33 P requirements / 340 ACs / 51 P stories** without duplicate full-primary proof. Common authorization/accessibility/rollout clauses are also explicitly applicable inside each reached behavior; primary ownership is an accounting convention, not permission to postpone proof.
- Every one of the **544 source requirement/acceptance mapping rows** has at least one mapped final P AC. Each ticket lists exact original source-trace IDs, full assigned acceptance text and focused normative paragraph references. No original finding-review links are relied upon as substitutes for formal normative behavior.
- All **87 partnership monitors MON27-001–087** retain the exact adopted signal, threshold, owner and response, each assigned to one local primary operational owner. Runtime actual accountable teams must be named before activation; the role-labelled source owner is not fabricated as an existing person.
- Structural validation checked all AC IDs, exact one-primary coverage, all local source/ADR paths, all monitor IDs and an acyclic local dependency graph. This is document-structure proof, not executed runtime qualification.

Outputs:

- `../tickets.json` — 22 proposal entries with delivery, scope, exact AC text/IDs, stories, blockers, current state, commands/caveats, proof, constraints, source refs and input-size estimates.
- `../coverage.json` — independent 340-AC primary map,87-monitor map and explicit external C03 mapping.
- `/tmp/p27-stage-ticket-notes.json` — subordinate evidence for eight stage/list behaviors; all219 P14–P29 ACs assigned once.

## Actual source baseline and implementation state

Inspected `/workspace/core` at `225c02e9499bd6c0d493223cd4b1a4120ff787e3` and checked relevant runtime/spec paths against current develop `/workspace/core-phase27-docs` at `71b81fae2ce1f9b615bcfee8606cd2c978a70e71`. The inspected CRM, task, authorization, migration and regression-test implementation is unchanged between those revisions. The newer workspace updates Bun to1.4.3 and Base UI to1.9.0; exact installed versions come from current manifests/lock, not this memo. Final issue source links pin the root-created documentation commit `b5a65b3f2da880fcbfa4b3cae189d216d06542be`; no unreviewed working-tree link is authoritative.

The following are **actual checked code facts**, not accepted permanent design:

1. `packages/api/src/admin/crm/relationships/service.ts` reads legacy donors, missionaries, profiles, pledges and member-care activity, then maps/filters/sorts/paginates them in memory. `packages/api/src/admin/crm/model.ts` uses scalar `donor.missionary_id`, `lastTouchAt = donor.updated_at`, `nextTaskSummary = null`. This is not the stable Ministry Assignment, cultivation identity or actual-exchange source contract.
2. `packages/api/src/crm/auth/access.ts` builds a trusted CRM actor from current auth context but uses staff/admin/super_admin role checks and a super-admin Tenant branch. `tests/unit/packages/api/crm-auth.test.ts` proves that bridge with constructed AuthContext values. Neither establishes the later exact P12 current target/field/history/purpose/epoch floor required by P27.
3. `packages/api/src/admin/mission-control-tasks/service.ts` separately awaits task insertion, linked-record insertion and event append. The store chooses Finance Operations and contribution-operations source. The contribution needs-attention read caps100. This does not qualify source acceptance/history/receipt/work atomicity, exact recipient generations or complete P27 obligation readiness.
4. `supabase/migrations/20260526193000_mission_control_tasks.sql` creates queue/task/link/comment/reminder/event/attention tables, enables RLS, revokes raw anon/authenticated privileges and grants service_role. Individual Tenant columns and service credentials do not independently prove complete same-scope composite relations or fine-grained old/resulting-row authority. P27 must consume a qualified adapter, not declare this posture already sufficient.
5. `packages/database/hooks/mission-control-tasks.ts` is a contribution-specific query and uses one static query key. It is not proof of context/role/recipient-generation isolation for P27. `packages/lib/hooks/use-tasks.ts` represents missionary personal tasks and generic complete/reopen/delete semantics. `apps/admin/app/(app)/tasks/tasks-content.tsx` mutates prototype collection status/delete; generic controls cannot become source completion for P27 review tasks.
6. Scoped searches across API/database/admin/migrations found no native P27 cultivation enrollment/stage-list/review owner. Existing `stage_change` display type and missionary Active/Lapsed/New/At Risk donor status are not implementation, approved seed lists or evidenced migration semantics.
7. Existing UI primitives, approved TanStack hooks/collections and shared Base UI/base-maia form/accessibility helpers are reusable architecture. Broad existing donor profile forms must not make a stage-only edit require unrelated name/email/address fields. No new state/UI framework is justified.

## Existing issue inventory and concrete reconciliation

Root supplied1395 current issue records; title/state inventory and focused GitHub read-only bodies were inspected. Complete bodies read: #606, #607, #618 and #1285. Exact-phrase GitHub issue search for `"Ministry Assignment"` found consumers (#1284/#1285 and other Page tickets) and specifications, but no Phase9 implementation producer. Absence is limited to the inventory/search and scoped source evidence, not a claim about an unknown deployment.

### Missing Ministry Assignment producer: propose S01 under #604

`docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md` §Dated Phase22D19 Ministry Assignment source-ownership amendment and ADR0136 explicitly place stable Ministry Assignment identity/lifecycle and participant membership in Phase9. A ministry has exactly one Tenant/Legal Entity and zero-to-many separately identified Party participants, independent from Party, profile/login, household, relationship edge, Ministry Project, Support Assignment, Designation and public Page.

#607 builds **Party-to-Party relationship edges** and type catalog. It does not build this independent operational subject. #1285 title mentions Ministry Assignment, but its complete body delivers **Page-scoped contributors/display participants** and explicitly lists **external Phase9 Ministry Assignment/participant membership** as a prerequisite. Depending on #1285 would unnecessarily pull Public Page #1284 into native P27 work and leave the actual producer unimplemented.

S01 supplies only the already-decided P9 source and a complete small staff association workflow. #606 supplies canonical Party lifecycle/tombstone scope, inheriting its real spine producer #570; P12 exact current authority remains an owner dependency. No finance binding writer or public Page feature is included. Parent #604 placement and dependent relationships are part of the approval packet; do not silently update #604/#1285/#1992 now.

### Existing #618 needs distinct recency terminology, not a changed generic metric

Full #618 body currently defines generic operational `lastTouchAt` as `GREATEST` of latest CRM activity `occurred_at` and latest linked task `updated_at`. **Preserve that generic operational meaning separately.** Ratified REQ27-P33 explicitly requires that separation, as does C12. The narrower **Last recorded exchange** projection belongs to P27-C03 and must not be inferred from the generic metric.

Proposed narrow owner-issue clarification for the approval packet:

> Keep the P9 generic operational last-touch field and its separately defined semantics. Do not label or use its activity/task-update value as Last recorded exchange, actual conversation recency, a donor responsiveness measure or missionary performance. P27-C03 supplies the distinct qualified personal-exchange projection under D27 / REQ27-P33 and C10–C12. Its source-complete permitted actual-occurrence evidence, precision/unknown state, correction and privacy semantics remain independent; the UI clearly distinguishes Last recorded exchange, Recent outreach and Next follow-up. This clarification changes no existing generic operational metric into another domain fact.

An earlier research draft incorrectly proposed replacing #618 generic `lastTouchAt`. The final proposal removes that change after rereading the exact preserved P33 clause; no governing source or issue was modified.

#618 also calls service-role-only task isolation already correct. Replace that unqualified proof claim with:

> Existing table posture is migration input. Qualify exact grants, coarse RLS, trusted Tenant context, current P12 source/field/history/purpose authority and all service/RPC/result paths for each consumed projection. The P9 CRM Tasks tab remains staff-scoped; a separately admitted P27/P28 source profile uses its exact role-safe task/context/action/attention contract and does not expose or copy the staff CRM endpoint.

This does not broaden the original CRM tab audience or waive the registered source-work contract.

### Shared Tasks ownership and first real vertical delivery

#618 is expressly a **read-side integration slice** and excludes task mutation machinery. Current task service is not a qualified ADR0183 owner. Root's separate owner search found no independent planned reusable producer ticket. The agreed breakdown therefore makes **P27-P01 deliver the smallest bounded native source-work adapter inside real ordinary admission**, including exact occurrence, current source/recipient predicates, typed source action, My Tasks projection, identifier-only durable intent, source receipt recovery and source-controlled end. No separate framework-only S02 is proposed.

First Request/Context/Assignment sources may depend on that **implementation component** if genuinely needed. Users need **no cultivation enrollment** to create otherwise valid request, source task or shared context. P27-P07 is later complete obligation presentation, not the source prerequisite for Request. Request's initial source command must expose its own complete bounded readiness and creating-writer fence for P27-P11; never create the circular dependency Request→cultivation admission workflow→Request.

### Existing notification ownership

P27-P10 consumes exact Phase17 owner contracts covered by #890/#891, not a second notification center or engagement model. Those are direct exact-component blockers, not whole Phase17 gates. P28 missionary review profile and optional finance reader are conditional activation prerequisites only: neither blocks native staff review or nonfinancial portfolio. Do not add synthetic profile fallback, default email or historical backfill attention.

## Right-sized behavior and dependency interpretation

P01 is the first true tracer bullet, containing persistence, narrow source command, UI, current authorization, atomic local work, recovery and tests. S01 and P14 are independent complete existing-source/configuration workflows; they are not table-only scaffolding. P02–P13 add distinct staff outcomes, P14–P21 add stage/list outcomes. All reached security, UX, integration, migration/restore, source-state and performance proof is inline. P21's final catalog cohort checks compose already-tested behaviors; it is not a late catch-all security/test ticket.

The local graph is acyclic. The final compound-AC audit moved49 full-primary assignments to the earliest behavior with all actual prerequisite producers, preserving the original producer duties as explicit shared implementation and regression obligations. The machine coverage artifact records each old/new owner. P21 now owns79 catalog/lifecycle primary ACs, with an estimated22,508 focused input tokens, and directly consumes P03 for genuine finite-group/default/withdrawal integration. It does not absorb notification-wide proof; Q03 owns those cross-journey criteria. Stage choice P15 extends P01 without inventing another admission command; P14 provides a usable initial catalog before P01. P16's paused edits consume actual pause semantics through P08; real closed/reopen interaction proof is completed when P11/P12 land and in composed P21. P20's absence return consumes real P12 reopen. P12 consumes the exact nullable list binding already delivered by P01, not a mandatory later chooser. Redundant direct P15→P14 and P11→P07 edges were removed because their contracts are already transitive. No source adapter requires a finished stage-list cohort merely to implement the first behavior. Production activation of a partially built catalog cohort remains gated by the normative complete semantics, distinct from issue implementation blockers.

No opaque `OWNER-*`, `REQUEST-*` or `PARENT-*` **hard blocker IDs** remain. Request source readiness points to P27-F05, notification engagement to exact #891 (consuming #890), and S01's Party source to #606. P12 exact component gates reference #667/#668/#669/#670/#675/#676/#680 as non-issue consumed-contract prerequisites, not blanket whole-phase/administrative-UI dependencies. Existing executor qualification and responsibility adapters travel inline in P03/P04. Source-certified Party repair is conditional on #512; ordinary mistaken-reference correction remains the P05 behavior and unresolved collisions cannot silently union history. Conditional missionary review profile and finance read prerequisites remain explicitly separate from staff/nonfinancial implementation blockers. The main document-PR source pin is a non-issue readiness gate.

## Testing evidence and verified commands

Read tests distinguish available seams from missing product proof:

- `tests/unit/packages/api/admin/mission-control-tasks.test.ts` uses StubState/QueryBuilder memory mocks. It verifies current actor+Financequeue behavior, links/events and contribution attention grouping. It proves neither transactions nor effective database authorization.
- `tests/unit/supabase/mission-control-tasks-migration.test.ts` checks SQL text/table/RLS/grant/index presence. It is static evidence, not live SQL grants/RLS proof.
- `tests/unit/packages/api/crm-auth.test.ts` uses constructed AuthContext role/tenant values, not real Supabase auth or current P12 grants.
- UI form accessibility tests are useful component regressions, not full browser focus/mobile/permission-proof.
- `scripts/verify/supabase-migrations.mjs` requires localhost DATABASE_URL, builds a compatibility role environment and applies forward migrations. `.github/workflows/ci-integration.yml` uses PostgreSQL15 and the existing donation-fee replay SQL seam. This is reusable real-PostgreSQL migration/transaction infrastructure; it is not real GoTrue/PostgREST coverage by itself.
- `scripts/run-with-ci-env.mjs` and Playwright defaults use `E2E_AUTH_BYPASS=true`. Strict test invocation alone does not remove that bypass. The user-confirmed proof seam is actual authenticated browser→sourceAPI→disposable Supabase with real-role and controlled two-session races where browser-only testing cannot prove correctness.

Commands verified in current manifests/documentation and named existing paths (not executed by this research subtask):

```text
bunx vitest run tests/unit/packages/api/admin/mission-control-tasks.test.ts tests/unit/packages/api/crm-auth.test.ts
bun run test:unit
bun run verify:supabase-migrations
bun run verify:data-boundary
bun run test:e2e:strict
bun run test:a11y:strict
bunx turbo run lint typecheck --filter=@asym/admin
bun run ci:preflight
```

Implementation must add focused actual source/browser/database cases for its behavior and record the exact newly created test paths/commands in its PR. Use no `bun test`, invented `test:p27` command, demo auth as real authorization evidence, mock-to-implementation mirror, production probe or service credential as proof of permitted access. Existing SQL, API and browser seams should be extended only where the behavior's falsifiable outcomes require it.

## Final compound-proof allocation correction

An early ticket may not mark an entire combined AC complete because it has implemented only its stage, list, pause or source-action portion. `primary_acceptance_ids` now means the complete clause can be exercised with actual producer commands in the owner's dependency closure. `composed_proof_handoffs` retains the early producer's obligation, verbatim source AC, and exact later complete-proof owner. It is not permission to postpone auth, data constraints or ordinary UI safeguards. Read-state fixtures remain legitimate where the AC asks only to interpret a known state; they do not certify a missing producer operation.

All32 stage allocation corrections are applied: create replay after later real configuration edit; new-list creation alongside real lifecycle states; ordinary stage/config permission separation; actual enrollment dedupe; later assessment; actual rename/retirement; initializer; withdrawn-list reuse and race; group/default/withdrawal composition; actual close/reopen; and clear versus real list switch. Their earliest suitable later owners are P15/P16/P17/P18/P19/P21. Basic list choice remains independent of group execution; only composed P21 adds P03. P17's blocker no longer claims P16 implements reopening.

Cross-domain current-principal/P12 and existing executor prerequisites are now fully expanded into the ticket `prerequisites` with exact owner component and existing issue references, alongside structured `prerequisite_contracts`; no `owner issue IDs resolved by root` instruction or opaque owner hard blocker remains. Final documentation source is PR#1993 at `b5a65b3f2da880fcbfa4b3cae189d216d06542be`.
