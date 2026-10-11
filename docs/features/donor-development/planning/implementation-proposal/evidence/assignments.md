# Phase 27 assignment ticket evidence and coverage

Research/preparation only; no implementation, issue creation, parent #1992 changes or repository edits by this subtask.

## Source and revision

- Manually loaded the complete user request at `/workspace/attachments/6753d8d9-6a08-46f9-9b60-60fdbabcbe2a/Pasted text.txt` and repository `.agents/skills/to-tickets/SKILL.md`; no native picker invocation was claimed.
- Read the complete canonical 606-line assignment volume and all 32 assignment stories, the relevant P9/P12/ADR contracts, active design, repository instructions, actual source/test seams and fresh relevant issue bodies. The source volume SHA256 is `eed7eed0f6fd19b19967f24bf72179072ead07054474c44a5180edb98d3add76`.
- Initial source baseline: `225c02e9499bd6c0d493223cd4b1a4120ff787e3` in `/workspace/core`. Fresh target baseline: `71b81fae2ce1f9b615bcfee8606cd2c978a70e71` in `/workspace/core-phase27-docs`. `git diff --stat` between these heads returned no changes for the inspected CRM/API/task/worker/migration/test paths. Target manifests specify Bun 1.4.3, Next.js 16.4.0, Base UI 1.9.0 and Playwright 1.64.0.
- The documentation PR URL/specification commit are root-owned publication results, not yet supplied to this subtask. Final proposal/publication must replace branch-relative source references with verified commit-pinned links and keep a specification-integration prerequisite until integrated. No PR/merge/runtime success is inferred here.

## Existing behavior versus missing behavior

| Evidence                                                                                                                                                | What it establishes / limitation                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/api/src/admin/crm/relationships/service.ts:49–85`                                                                                             | Tenant-filtered reads from legacy donors/missionaries/profiles/pledges/care, mapping then in-memory sorting/paging. Not canonical P9 role edges, a qualified assignment writer, source-level paging or current field-safe preview. |
| `packages/api/src/crm/auth/access.ts:7–58`                                                                                                              | Broad staff/admin/super_admin checks and super-admin exception exist. They are not the exact current P12 actions or NHI ceiling.                                                                                                   |
| `packages/api/src/crm/commands/log.ts:69–104`                                                                                                           | A separate log insert with payload filtering exists. It does not atomically bind business assignment, protection, history and receipt. No D30 completion is claimed.                                                               |
| `tests/unit/packages/api/crm-relationships.test.ts:71–156`                                                                                              | In-memory Supabase/query fixtures verify legacy read behavior. They cannot prove DB grants/RLS, role identity or two-connection races.                                                                                             |
| `packages/api/src/admin/mission-control-tasks/service.ts:48–84`; `store.ts:75–124`; `assignment-policy.ts:6–30`                                         | Shared task helpers exist, but task/link/event writes are separate and actor/queue defaults are not a qualified D30 source handoff or authority fallback.                                                                          |
| `packages/api/src/workflows/serve.ts:21–31`                                                                                                             | Inngest registration includes existing payment/email/recovery functions, no donor-assignment evaluator/executor. Reuse execution infrastructure, not a new scheduler or automatic claim of qualified workers.                      |
| `apps/admin/features/support-hub/components/settings/assignment/AssignmentRulesForm.tsx:20–32,75–79`                                                    | Inbox round-robin UI and draft replacement exist for a different domain. It is not D30 rules, and its refresh behavior must not overwrite D30 edits.                                                                               |
| Targeted `rg` across current migrations/API/database for `crm_relationships`, `crm_relationship_types`, `rule_managed`, `donor_rep`, `church_relations` | No production matches establishing the P9/D30 role source or control engine were found in that inspection. Absence is bounded static evidence, not a live database assertion.                                                      |
| `tests/integration/supabase/eve-final-launch-verification.sql:1–38`                                                                                     | Actual local SQL proof pattern exists; service-role setup alone is not the required authenticated-role/ceiling proof.                                                                                                              |
| `playwright.config.ts:17–32,155–209`                                                                                                                    | Existing browser setup includes placeholder/demo environment conveniences. Phase27 preflight must reject those for product acceptance rather than treating a skip/demo pass as real proof.                                         |

No approved assignment AC is credited as already implemented. Existing issues cover source prerequisites, not the new D30 behavior.

## Genuine predecessor issues and proposed reconciliations

Fresh read-only GitHub observations show #607, #610, #613, #620, #625, #669, #670 and #675 OPEN. The root inventory is `/tmp/p27-tickets-existing-issues.json`; it contains metadata, not complete bodies. Relevant full or bounded owner/body sections were fetched with `gh issue view`. No remote writes occurred.

1. **#607 graph:** retain the one canonical edge, tenant topology, source catalog, no-delete rules and non-staff uniqueness. Amend the staff-assignment exception to distinguish exact role-qualified source identity; the same staff/Party may hold multiple roles and a role may have multiple staff. Current generic uniqueness `(tenant,from,to,type)` and unconditional in-place reRole cannot erase that identity/history/protection. Do not create a generic responsibility-slot aggregate or second portfolio store.
2. **#620 command core:** retain no provider gate, no restored Twenty, no donate idempotency import and no speculative provider log. Replace the blanket client-only double-submit assertion **for D30 assignment commands** with durable source operation/effect identity and current-authorized receipt, atomically with assignment/control/primary/history/required intent. Reconcile its add/end staff-family identity with #607. This is a scoped local command extension, not a new general provider platform.
3. **#625 relationship UI:** generic add/end/re-role remains existing work. Its staff-family adapter must use the reconciled P9/D30 source command and preserve current role identity, protection, history and exact affected-work condition. P27-A01 adds the named assignment policy/control semantics, not a duplicate all-relationship editor. This issue is related, not an artificial blocker on the entire derived graph/finance tab before manual assignment.
4. **#610 merge/unmerge:** qualify staff-role collision/provenance and intervening-authority handling. Ordinary survivor-wins based on `(from,to,type)` cannot decide manual/rule control, discard another role, guess primary or resolve source work. Exact role-aware history/protected choices and qualified replay/correction remain mandatory. P27-A09 extends this owner; no second merge engine.
5. **#613 shell/B6:** supplies the actual Party header/assignment read and shared record gate; it is a genuine narrow source/UI input. Its source socket is not evidence it already implements D30.
6. **Current-authority components:** #669 and #670 contain accepted October 6 component-level dependency language: agreed interfaces permit preparation, actual consumed producer revisions/proofs gate delivery/runtime, and reciprocal whole-issue closure/whole P9/P10/P11 epics are not artificial preparation gates. Use exact #667 PDP, #668 atomic Tenant substrate, #669 context/NHI and #670 currentness plus #505/#516 applicable source guard/proof; inherit real transitive constraints without duplicating every ancestor edge. #675 remains a broader configurable product; ADR0210 permits the bounded code-authoritative capability foundation, so do not require every #675 feature or invent a second registry.

These are proposed targeted existing-issue amendments to include in the approval packet. This subtask does not modify existing issues. Root must decide the publication handoff for those amendments; stale contradictory predecessor prose is not silently accepted.

## Proposed vertical slices and fresh-context estimates

Estimates are engineering reading/working-context estimates, not measured implementation duration or a model token guarantee. They include focused source clauses, relevant instructions, exact producer interfaces, nearby implementation/test material and room for changes. Implementers need not ingest the full 30-decision interview. No slice is a schema-only/API-only/UI-only batch.

| Slice   | Reading/working token envelope | Focus / boundary                                                                   |
| ------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| P27-A01 | 25–40k                         | Transfer one named staff responsibility with protected intent and truthful history |
| P27-A02 | 20–35k                         | Draft and preview bounded ordered assignment rules                                 |
| P27-A03 | 30–45k                         | Activate prospective reviewed routing and apply one current proposal               |
| P27-A04 | 25–40k                         | Apply one finite reviewed group with recoverable member results                    |
| P27-A05 | 25–45k                         | Preserve source work through representative handoff and departure                  |
| P27-A06 | 35–55k                         | Opt into bounded automatic transfers and stop stale work immediately               |
| P27-A07 | 18–30k                         | Return protected responsibility to rules with its exact effect shown               |
| P27-A08 | 30–50k                         | Inspect and recover assignment history without widening current access             |
| P27-A09 | 25–45k                         | Reconcile imported and merged assignment provenance without losing control         |

P27-A06 is the largest but remains one bounded automatic effect and kill/re-enable behavior consuming already-qualified source/evaluator/handoff interfaces. Do not expand it into general routing, a new scheduler, or a full authority implementation. P27-A05 activates only exact admitted source handoff contracts; unknown sources stay blocked, not guessed. Any discovered missing producer is named and qualified rather than folded into a giant Phase27 ticket.

## Direct graph and coordination

Local edges (A → B means B blocked by A): A01→A02; A02→A03; A03→A04; A01→A05; A03→A06; A05→A06; A06→A07; A04→A08; A07→A08; A01→A09. A02 interface preparation may proceed against the exact A01 contract, but a complete real-source preview requires A01 protected/manual/unknown control facts. A04/A05/A09 are not a single serial queue.

A01 consumes #607/#620/#613; A02 consumes A01 current assignment/control facts (and inherits #607/#613); A03 additionally consumes #669 execution context. P12 current-authority component qualification applies before affected acceptance. A09 consumes #610. Neither parent #1992 nor entire Phase9/34/44 is a blocker.

A05 directly consumes P27-P04 partnership responsibility handoff (including the inherited P27-P01 bounded task adapter) and P27-F05 Request readiness/responsibility. Those are actual P27 implementation edges, not generic non-issue source qualifications. Optional Care/commitment integrations remain lane-specific owner qualification gates; they do not block ordinary native assignment. Root still binds current brief/export consumer qualification for A08. These are delivery/owner-qualification seams, not new founder product decisions. An A01 transfer with unchanged lawful independent ownership is allowed; unproved affected work stays blocked until its exact A05 adapter qualifies.

No standalone horizontal harness ticket is proposed. A01 adds its actual source fixtures. Common first-admission browser preflight is owned by the partnership plan; do not manufacture a native issue edge merely to share fixture code. #516 actual-role negative-tier and existing SQL/Playwright/Vitest patterns supply precedent, not complete D30 qualification.

## Complete acceptance ownership

Every assignment AC has exactly one primary completion owner below; prerequisite slices contribute their relevant checks immediately. Cross-journey Q owners confirmed the four terminal cases. Broad cases such as AC27-A09-03 must retain all admitted egress variants in the full graph; consumer owners contribute their own proofs rather than A08 inventing an AI/export product.

| Acceptance  | Primary ticket |
| ----------- | -------------- |
| AC27-A01-01 | P27-A06        |
| AC27-A01-02 | P27-A04        |
| AC27-A01-03 | P27-A03        |
| AC27-A01-04 | P27-A02        |
| AC27-A02-01 | P27-A02        |
| AC27-A02-02 | P27-A02        |
| AC27-A02-03 | P27-A06        |
| AC27-A03-01 | P27-A01        |
| AC27-A03-02 | P27-A01        |
| AC27-A03-03 | P27-A01        |
| AC27-A03-04 | P27-A01        |
| AC27-A03-05 | P27-A09        |
| AC27-A04-01 | P27-A06        |
| AC27-A04-02 | P27-A06        |
| AC27-A04-03 | P27-A07        |
| AC27-A04-04 | P27-A06        |
| AC27-A05-01 | P27-A03        |
| AC27-A05-02 | P27-A04        |
| AC27-A05-03 | P27-A03        |
| AC27-A06-01 | P27-A04        |
| AC27-A07-01 | P27-A02        |
| AC27-A07-02 | P27-A05        |
| AC27-A07-03 | P27-A05        |
| AC27-A08-01 | P27-A05        |
| AC27-A09-01 | P27-A06        |
| AC27-A09-02 | P27-A01        |
| AC27-A09-03 | P27-A08        |
| AC27-A09-04 | P27-A08        |
| AC27-A10-01 | P27-A01        |
| AC27-A10-02 | P27-A08        |
| AC27-A11-01 | P27-A01        |
| AC27-A11-02 | P27-A06        |
| AC27-A11-03 | P27-A08        |
| AC27-A12-01 | P27-Q01        |
| AC27-A14-01 | P27-Q03        |
| AC27-A14-02 | P27-A08        |
| AC27-A14-03 | P27-A08        |
| AC27-A15-01 | P27-Q02        |
| AC27-A17-01 | P27-A09        |
| AC27-A18-01 | P27-Q03        |

## Requirement and story coverage

| Requirement | Delivery / proof owners                                                                  |
| ----------- | ---------------------------------------------------------------------------------------- |
| REQ27-A01   | P27-A02, P27-A03, P27-A04, P27-A06                                                       |
| REQ27-A02   | P27-A02, P27-A03, P27-A04, P27-A06                                                       |
| REQ27-A03   | P27-A01, P27-A08, P27-A09                                                                |
| REQ27-A04   | P27-A01, P27-A02, P27-A03, P27-A06, P27-A07, P27-A09                                     |
| REQ27-A05   | P27-A02, P27-A03, P27-A04, P27-A06, P27-A07                                              |
| REQ27-A06   | P27-A03, P27-A04, P27-A07, P27-A08                                                       |
| REQ27-A07   | P27-A01, P27-A02, P27-A05, P27-A06, P27-A07                                              |
| REQ27-A08   | P27-A01, P27-A05, P27-A06                                                                |
| REQ27-A09   | P27-A01, P27-A02, P27-A03, P27-A04, P27-A05, P27-A06, P27-A07, P27-A08                   |
| REQ27-A10   | P27-A01, P27-A06, P27-A08, P27-A09                                                       |
| REQ27-A11   | P27-A01, P27-A03, P27-A04, P27-A05, P27-A06, P27-A07, P27-A08, P27-A09                   |
| REQ27-A12   | P27-A01, P27-A03, P27-A06, P27-A07, P27-A09, P27-Q01                                     |
| REQ27-A13   | P27-A02, P27-A04, P27-A05, P27-A06, P27-A08, P27-A09                                     |
| REQ27-A14   | P27-A01, P27-A02, P27-A03, P27-A04, P27-A05, P27-A06, P27-A07, P27-A08, P27-Q03          |
| REQ27-A15   | P27-A02, P27-A03, P27-A04, P27-A06, P27-Q02                                              |
| REQ27-A16   | P27-A01, P27-A03, P27-A04, P27-A05, P27-A06, P27-A08, P27-A09                            |
| REQ27-A17   | P27-A01, P27-A06, P27-A09, P27-Q01                                                       |
| REQ27-A18   | P27-A01, P27-A02, P27-A03, P27-A04, P27-A05, P27-A06, P27-A07, P27-A08, P27-A09, P27-Q03 |

All 32 assignment stories are covered: 31 occur in the assignment JSON via their AC mappings; US27-A32 and the terminal proof of US27-A29/A30/A31 reside in the confirmed Q01–Q03 package. Story IDs are source references, not new acceptance definitions. All 18 requirements and 40 AC outcomes remain binding; no D30 clause was marked satisfied by this preparation.

## Operating-control allocation

| Monitor   | Domain owner / consolidated proof                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| MON27-135 | A08 implements cross-flow containment/recovery; each source writer denies unsafe effects from its own slice. |
| MON27-136 | A06 exact Auto/protection/primary invariant fence.                                                           |
| MON27-137 | A05 source-owned work-accountability repair.                                                                 |
| MON27-138 | A06 unchanged-basis churn fence.                                                                             |
| MON27-139 | A03 source/proposal freshness, with A02 safe preview inputs.                                                 |
| MON27-140 | Q02 measured assignment workload/capacity threshold; A03/A04/A06 implement bounded queries/workers.          |
| MON27-141 | Q03 actual staff meaning/workaround pilot; all local UI slices supply accessible clear behavior.             |

Preserve each monitor’s exact signal, threshold, owner role and response from `monitors.json`; map to actual people/on-call owners before activation. The JSON repeats exact domain monitor clauses. No new alert cadence, numeric capacity target or general source escalation policy is added.

## Verified commands and proof limits

- Current target `package.json` declares `bun run test:unit` as the full coverage runner (it does not forward file filters); use `bunx vitest run tests/unit/packages/api` for the inspected focused seam. It also declares `bun run test:e2e:strict --project=chromium`, `bun run verify:supabase-migrations`, `bun run verify:data-boundary`, `bun run test:a11y:strict`, `bun run test:perf:strict` and `bun run ci:preflight`. `playwright.config.ts` declares the chromium project. These commands were inspected, not run for product proof.
- For disposable local DB setup the existing `bun run db:migrate:local` runs local reset without seed; use only against the disposable environment. New genuine real-role fixtures and admission preflight are implementation work, not production credentials or endpoints.
- Unit tests remain offline. Product proof requires real current actor contexts, actual supported Supabase/Postgres, admitted DB-role/RLS/grant paths, independent connections, actual durable entry points and real browser state over the same backend. Only external I/O can be controlled; internal authority/effect cannot be replaced with a passing mock.
- Source publication, structural JSON coverage checks and this read-only evidence do not prove runtime, DB, provider, accessibility, staff-pilot or activation success.

## Preparation validation

- JSON schema fields present for all nine slices; 36 primary assignment ACs occur once; four other ACs map once to Q01–Q03. All 18 requirement IDs are represented.
- Local proposed graph is acyclic. Source paths and ADR files exist. Final commit-pinned source URLs and cross-domain producer IDs remain root integration work before the complete approval proposal, not authorized issue publication.
