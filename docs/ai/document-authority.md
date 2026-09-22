# Document authority and current contracts

Updated 2026-09-16 for AL-1861 at Conrad's direction: use the latest credible
ratified decisions and terminology, reconcile the audited documentation, and
retire Twenty CRM. This is the navigation and maintenance contract; detailed
domain requirements remain with their owners.

## Resolve the actual question

1. **Intended behavior:** identify the owning domain, explicit founder ruling,
   ratified amendment, affected scope and superseded clauses. Read its durable
   OpenSpec and active change together with the governing PRD/design/ADR.
   A later consumer phase cannot acquire a producer's authority by shorthand.
2. **Current implementation:** inspect source, migrations and tests. Verify the
   particular deployment/provider when claiming live behavior. Never implement
   an old design merely because old code still exists.
3. **Where to edit:** follow the package's canonical authoring declaration.
   Generated Markdown and OpenSpec views carry the contract but are not
   independent decision sources. Amend their source and regenerate together.
4. **Why a decision exists:** use the accepted ADR and final decision log;
   earlier questions, alternatives and research are dated provenance.
5. **Publication status:** use actual GitHub state and commit ancestry. An
   original PR body, source hash or date is evidence of that snapshot.

Explicit supersession beats stale conflicting prose regardless of directory.
When a current PRD, ADR decision or acceptance clause is superseded, edit that
clause itself. A banner or owner-map pointer is not a substitute for removing
contradictory current requirements. Label retained earlier wording as dated
history and preserve its original source reference. Update every declared
projection of a changed requirement together.

If sources genuinely disagree without an accepted owner ruling, preserve the
last agreed behavior and record the concrete decision instead of inventing one.
File modification time, highest phase/ADR number, or a bot's review timestamp
cannot by itself establish authority.

## State vocabulary

| State                | What it proves                                                     |
| -------------------- | ------------------------------------------------------------------ |
| Proposed             | A documented option or change; approval is not implied.            |
| Ratified             | The identified product decision was accepted for its stated scope. |
| Published            | An exact issue, PR or repository packet is available.              |
| Integrated           | The exact content is present in the named branch/commit.           |
| Merged               | Git ancestry proves integration into the named target branch.      |
| Implemented          | Required behavior exists with the applicable implementation proof. |
| Qualified            | The exact provider/environment/cohort passed its required gates.   |
| Activated            | A proved release enabled the behavior in the named environment.    |
| Superseded / retired | The identified clauses no longer authorize forward work.           |

The AL-1861 branch consolidates Phase 22–26 as ratified **planning contracts**.
It does not merge their original PRs, mark implementation tasks complete, or
activate features. Source PR IDs/hashes identify the original capture. Co-location alone does
not satisfy predecessor acceptance, implementation or qualification gates;
those gates still apply to the reconciled producer contracts.

## Current owner map

Paths below are relative to the repository root. Read the full contract for the
exact task, not only this routing table.

| Subject                                         | Governing source and scope                                                                                                                                                  |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform intent / boundaries                    | `openspec/specs/platform-*/spec.md`; accepted owner amendments remain explicit.                                                                                             |
| CRM ownership                                   | `docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md`, `openspec/specs/crm-core/spec.md`, Phase 1 ownership matrix. Asym Postgres owns CRM truth.                  |
| Program phase architecture                      | `docs/prds/sitestacker-parity/roadmap.md` v3 (45 phases, adopted 2026-09-22) and renumbering map; `phase-map.md` is its orientation mirror.                                 |
| Identity / permissions / restricted data        | Phase 3/4/10/12 PRDs and relevant OpenSpec. A relationship or shared email is not an access grant.                                                                          |
| Contributions / designations / Giving Campaigns | Phase 13 ledger/giving-cart PRD, with explicit later owner amendments. Giving Campaign is an effort, never a Fund/designation.                                              |
| Contribution credits                            | Phase 14; credit/recognition does not manufacture received money or legal-donor authority.                                                                                  |
| Recurring intent / schedule / recovery          | Phase 16 and `openspec/changes/add-recurring-giving/`; legacy subscription reflection is compatibility evidence.                                                            |
| Communications                                  | Phase 17 owns content/catalog/compiler/resolution; Phase 6 owns recipient intent, consent, outbox, dispatch, provider outcomes, recovery and history.                       |
| Official documents / statements                 | Phase 7 facts and subjects; Phase 18 immutable artifacts/renderer qualification; Phase 19 run coordination.                                                                 |
| Accounting / Field Accounts                     | Phase 20 accounting; Phase 21 Field Account operations; preserve separate external payment/provider evidence.                                                               |
| Public ministry pages                           | Phase 22 PRD and `openspec/changes/add-public-ministry-pages/`.                                                                                                             |
| Web Studio / CMS                                | Phase 23 PRD and `openspec/changes/add-web-studio-cms/`.                                                                                                                    |
| Multi-site / language / currency                | Phase 24 PRD and `openspec/changes/add-multi-site-management/`; Site does not own money, identity or authorization.                                                         |
| Donor dashboard                                 | `docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/README.md`; consumer of existing domain owners.                                                                |
| Support Hub                                     | `docs/features/support-hub/README.md`; Support work, native CRM, canonical intake, Phase 17 authoring and Phase 6 delivery retain distinct owners.                          |
| Contribution-detail UI and historical model     | Its feature `README.md` routes current owners; `PRD.md`/`CONTEXT.md` retain compatible UI decisions; newer Phase 12/13/16/17/18 owner contracts govern superseded behavior. |
| ADR identity                                    | `docs/adr/registry.md`; use full path/context for collisions. Existing accepted files are not silently renumbered.                                                          |

The detailed record ownership matrix is
[`phase-01-source-of-truth-ownership-matrix.md`](../prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md).

## Roadmap and Studio adoption — 2026-09-22

AL-1892 adopts the founder-supplied 45-phase roadmap as scoped planning direction.
The [program index](../prds/program-roadmap/README.md) identifies canonical
Workflow Studio, hybrid Web Studio, SMS and enterprise identity packages.
Their effective graphs correct the original all-pack and Git-gated task chains;
immutable source artifacts remain evidence, not executable implementation plans.
Phase 41 owns application decisions, Phase 34 common coordination, and Phase 42
explicit successors to existing CMS/brand boundaries. Existing source owners and
qualification gates remain authoritative. No supplied validator result proves
Core runtime or provider acceptance.

## Canonical authoring and evidence

- **Phase 25:** `traceability.json` → `stories` is the sole story source;
  owner-contract sections remain independently authored domain rules. Run
  `bun docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth/tools/render-stories.mjs --write`
  after an authorized story correction, then `bun run verify:phase25-spec`.
  The OpenSpec task list is the sole task authoring location.
- **Phase 26:** normative stories, requirement volumes, glossary and design
  govern; the OpenSpec behavioral projection and source trace are derived.
  Preserve full REQ/US/AC identifiers and all referenced acceptance suites.
  Its 717 scenarios alone are not the complete normative detail.
- Original issue packets, captured hashes, synthetic model outputs, grill
  transcripts and source-PR provenance remain dated records. A source record's
  phrase “current repository” refers to its captured PR head, not every future
  checkout. Reconciliation provenance separately records imported and amended
  representations; never rewrite the capture to claim current runtime proof.
- Use the [source manifest](audits/2026-09-16-documentation-reconciliation-sources.json)
  for the exact original PR heads and file hashes. Source PRs #1323, #1340,
  #1558, #1564 and #1657 were open at the September 16 inspection; only #1558
  was a draft. Phase 21 #1235 merged August 2; Phase 17–20 #872 merged July 27.

The [September 21 source-PR readback](audits/2026-09-21-documentation-source-readback.json)
confirms no later documentation amendments: changed source heads only merged
current develop. The Phase 24 source PR is now non-draft, and PR #966's
qualification harness is merged; neither change establishes product activation.

## Current publication snapshot

The [September 16 GitHub readback](audits/2026-09-16-publication-status.json)
records 88 Phase 25 children (#1565–#1652) under #1563 and 199 Phase 26 leaf
issues (#1662–#1860) under four index issues (#1658–#1661) beneath #1656.
Original package statements that no tickets had yet been created describe the
earlier publication event. Published tickets do not satisfy unchecked runtime,
qualification or activation work. PR #462 merged July 9, #872 July 27 and
#1235 August 2; historical “not yet merged” legends are not current status.

The [instruction source](audits/2026-09-16-instruction-source.json) separately
records adoption of PR #1655's scoped-reading and task-completion guidance.
Its source PR remains open; the rule is reconciled here with AL-1861 authority.

## Twenty retirement

Twenty is not a product dependency, alternative CRM authority, fallback, or
rollback path. Do not execute the old integration/cutover runbooks. The native
notes/relationships and runtime removal were integrated into develop through
PR #1325 on August 19. The durable CRM spec is synchronized to that decision.

Keep historical migration records, captured evidence and any still-required
read-only compatibility identifiers until their source-owned migration removes
them. Such identifiers do not authorize vendor calls or future Twenty writes.
Generated database types must follow their generation/migration workflow, not
search-and-replace. The data-boundary guard must continue prohibiting restoration
of vendor clients/credentials/routes/sync.

External removal of old Vercel variables or a vendor key/workspace needs exact
environment inventory and authorized access. Its unverified status remains in
`openspec/changes/complete-twenty-crm-retirement/tasks.md`; a documentation change
does not claim credential revocation, data disposal or deployment completion.

## Matters that do not need another product decision

The recorded rulings already settle Asym-owned CRM, distinct Giving Campaigns,
Phase 13's optional second-approver default, Phase 6/17 communication ownership,
compact agent instructions, and the ratified P22–26 scope. Correcting stale
references and integrating those contracts does not reopen their alternatives.

Keep these separate from a new founder decision:

- Phase 25 G01 requires proof of the supported native account-linking guarantee.
  Run the accepted qualification first. If it fails, a replacement design needs
  a scoped decision; none is selected by this reconciliation.
- Phase 18 renderer selection requires the evidence contest and owner-approved
  budgets. No winner is inferred from the prototype or the merged qualification harness.
- External credential cleanup, deployment proof and source-PR merge approval
  are execution/access gates, not unresolved CRM/product architecture.
- PR #1329's final fee-snapshot/replay documentation is reconciled in companion
  branch `docs/AL-1861-pr-1329-contract`, with its own OpenSpec/ADR/runbook
  reconciliation against head `134310f29e68f77888e462f37aaf101d7d4c567d`. The original
  companion remains a dated local capture. By 2026-09-22, current develop
  contains related fee-extras and documentation through merged PR #1331 while
  #1329 remains open. Inspect exact current source and commit ancestry rather
  than using the open PR state as proof of absence. Preserve persisted-quote
  rails and distinguish legacy sagas; do not apply future runbooks to old code.

No new product choice was identified as necessary for these documentation
corrections. If future qualification invalidates a premise, record the precise
failed guarantee and affected choices before seeking a founder ruling.

## Publication workflow prerequisite

The user approved including the existing commits of
[PR #1428](https://github.com/Asymmetric-al/core/pull/1428), pinned to
`4e2c014afdbea1a2679f71ff3e9f385f6bf755a2`, in this reconciliation branch.
The [workflow source record](audits/2026-09-16-workflow-prerequisite-source.json)
separates that prerequisite from the P22–26 planning imports. It supplies the
trusted team identity and normal attribution/hook checks needed to publish as
Conrad; it does not remove GitHub review requirements or authorize production
deployment. Existing prerequisite commits retain their original authorship.

## Verification and closeout

Run strict current/archive OpenSpec validation, `verify:openspec-deltas`,
`verify:phase25-spec`, scoped formatting/link checks and the applicable repository
gates. Structural validation is not implementation or provider proof. Archive a
change only when every in-scope implementation/acceptance criterion is actually
complete and merged; a Phase 0 checkbox cannot close unbuilt later-phase deltas.
