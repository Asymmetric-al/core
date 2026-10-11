# Phase 27 grooming research — program authority and Workflow Studio

Research notes only, 2026-10-09. No Phase 27 PRD, formal specification, tickets, implementation, activation, or external write was produced. Local checkout: `/workspace/core`, HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3` (2026-10-08 merge of #1982). GitHub readbacks are preserved in `/workspace/scratch/phase27-program-github-readback.json` (local working evidence; the dated official links below remain the source references). Times below are exact UTC source timestamps; all cited Sept 23 events also fall on Sept 23 in Asia/Bangkok.

## Authority and adoption findings

- **Current roadmap is v3, 45 phases numbered 0–44**, adopted Sept 22. Phases 0–40 retain their identities; 41–44 add mobilization, hybrid web, governed SMS, and enterprise identity. Evidence: `/workspace/core/docs/prds/sitestacker-parity/roadmap.md:1`, `/workspace/core/docs/prds/program-roadmap/README.md:25`, `/workspace/core/docs/prds/sitestacker-parity/phase-map.md:43`. Direct parsing of `docs/prds/program-roadmap/phases.json` confirms revision 3, adoptedOn 2026-09-22, exactly 45 consecutive numbers, and P27 `roadmap scope adopted; phase grooming/qualification required`.
- `roadmap.md` owns phase architecture. Detailed owner PRD/OpenSpec/ADR amendments retain business authority; phase-map and phases.json are projections. Source assets' original WS dependency arrays are provenance, not the effective delivery graph. See `/workspace/core/docs/prds/program-roadmap/README.md:23` and `:36`.
- All six required governance files were inspected: README, integration-guide, delivery-contract, owner-constraints (P27/P28 and relevant later consumers), github-impact, decisions-and-gates. They agree on native independence, explicit source qualification, current permissions, source ownership, and separate evidence states. The governing state vocabulary is `/workspace/core/docs/ai/document-authority.md:37`: proposed, ratified, published, integrated, merged, implemented, qualified, activated are distinct.
- **ADR-0001 is settled founder intent from July 6**: Asym Postgres owns CRM truth; Twenty is retired. `/workspace/core/docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md:3` and `:60`; source ownership matrix `/workspace/core/docs/prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md:21`. No new CRM authority belongs in this grooming.

## Fresh GitHub provenance, not stale snapshot inference

| Artifact                                                     | Current readback on Oct 9                                                                                                    | What it proves                                                                                                                               |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [AL-1861](https://github.com/Asymmetric-al/core/issues/1861) | closed/completed Sept 23, 03:31:14Z; created Sept 16                                                                         | Documentation-authority reconciliation accepted/completed; no runtime activation scope.                                                      |
| [PR #1891](https://github.com/Asymmetric-al/core/pull/1891)  | merged Sept 23, 03:31:12Z; head `2e8f95d193926f080c38b293653b215a7642ef37`; merge `fda104e5c12ed95586c2ef0af6af88184d9bc6e9` | Cumulative P22–26 planning integration plus authority reconciliation actually entered develop.                                               |
| [AL-1892](https://github.com/Asymmetric-al/core/issues/1892) | closed/completed Sept 23, 03:31:12Z; created Sept 22                                                                         | 45-phase roadmap and complete Studio planning adoption.                                                                                      |
| [PR #1897](https://github.com/Asymmetric-al/core/pull/1897)  | merged Sept 23, 03:31:11Z; head `59cad359422f38c19a8d3fce9528fd2b676a14ff`; merge `ea8086cf398fb20878994f5979cbeea7959a1845` | Actual v3/Studio adoption carrier; included #1891 prerequisite, 50 follow-up issue-body amendments beyond seven Sept 22 adoption amendments. |
| [PR #1901](https://github.com/Asymmetric-al/core/pull/1901)  | merged Sept 28, 16:17:54Z; head `914d2775585db4c21fe1600e567275a37582d7fe`; merge `a314933df1f795d80a98ea073e8d2f8551ea82b9` | Accepted C-02 financial ownership successor, not new product runtime.                                                                        |

All three merge commits #1891/#1897/#1901 are ancestors of this checkout (read-only `git merge-base --is-ancestor` returned 0 for each).

The original publication PRs are now **closed without merge**, not still open: [P22 #1323](https://github.com/Asymmetric-al/core/pull/1323), published Aug 14, closed Sept 23 10:18:30Z; [P23 #1340](https://github.com/Asymmetric-al/core/pull/1340), published Aug 24, closed 10:18:28Z; [P24 #1558](https://github.com/Asymmetric-al/core/pull/1558), published Sept 1, closed 10:18:27Z; [P25 #1564](https://github.com/Asymmetric-al/core/pull/1564), published Sept 9, closed 10:18:26Z; [P26 #1657](https://github.com/Asymmetric-al/core/pull/1657), published Sept 15, closed 10:18:23Z. Their current heads all read `5fbb67a5cef8282676b8fbcb5ff2c5f3a1438e03`; use captured source manifests for original-content provenance rather than treating this moved head as the original published package.

Sept 16/22 repository statements that these PRs remain open are **dated inspection evidence**. They do not mean the packages are absent; the merged integrations above establish adoption. Nor do closed original PRs mean rejection of their accepted product intent. Reference `/workspace/core/docs/prds/sitestacker-parity/README.md:3`, `/workspace/core/docs/prds/program-roadmap/github-impact.md:81`, and `/workspace/core/docs/ai/document-authority.md:113`.

C-02 was explicitly decided Sept 23: completely immutable posted financial rows, separate owner-controlled mutable operational records and coherent projections. It must not be reopened by Phase 27. C-01 approval policy remains separately unresolved in the latest carrier #1901 and `/workspace/core/docs/prds/program-roadmap/decisions-and-gates.md:34`; it concerns posted financial corrections, not Phase 27 ask-review policy. Do not conflate the two.

## Settled P27 product floor

- P27 is staff-side Mission Control relationship development; Phase 28 later projects the same source model. Starting floors are P9/P3/P6/P13; P14/P16/P26 are exact capability consumers. P33/P34 enhance without backward gating native work. `/workspace/core/docs/prds/sitestacker-parity/roadmap.md:4071` and `:4079`.
- Portfolios derive from active staff-assignment edges and saved views, never a separately writable membership table. Rep role is edge data; multiple role-qualified assignees plus one primary are inherited. `/workspace/core/docs/prds/program-roadmap/owner-constraints.md:13`; `/workspace/core/docs/prds/sitestacker-parity/phase-map.md:358`; `/workspace/core/CONTEXT.md:2224` and `:2231`.
- One enrollment primitive, staff and MPD stage presets, history preserved; stage is not Party lifecycle, authorization, a task result, or a Workflow Studio run. Asks are first-class business records, not edges/custom fields. `/workspace/core/docs/prds/sitestacker-parity/roadmap.md:4087`; `/workspace/core/CONTEXT.md:2240`.
- P27 owns enrollment/ask/appeal meaning; P9 owns identities, relationships, assignment and shared tasks; P13 received gifts, P14 recognition, P16 commitments, P6/17 communications. `/workspace/core/docs/prds/sitestacker-parity/roadmap.md:4101`.
- Every active enrollment has a due next task **or explicit actionable exception**; roadmap v3’s broader exact rule should not regress to old shorthand demanding outreach regardless of suppression. Native source-backed follow-up works without Workflow Studio. `/workspace/core/docs/prds/sitestacker-parity/roadmap.md:4091`.
- Permanent source-purpose identity unifies native and configurable follow-up; current consent and source authorization still apply. SMS requires qualified P43 owner path; P44 staff departures use P12 plus source-owned reassignment. `/workspace/core/docs/prds/sitestacker-parity/roadmap.md:4103`.
- Stage/assignment/appeal/score cannot grant access. Never-ask/contact restrictions stop prohibited asks and dispatch. Money amounts retain meaning, entity and currency. No wealth screening or autonomous next-best action in P27. `/workspace/core/docs/prds/sitestacker-parity/roadmap.md:4119`.
- P27 has no parity-matrix row to close: it is a beyond-parity capability. `/workspace/core/docs/prds/sitestacker-parity/phase-map.md:358`. The matrix’s Built/Live/Confirmed and initial-code-verification caveats explicitly bar using it as proof of shipment (`parity-matrix.md:7`).
- The inherited `55–65% untouched prospects` statistic at `owner-constraints.md:30` has no primary source in that clause. Omit it unless independently reverified; its presence is not sufficient evidence.

## Effective Workflow Studio consumption

Canonical machine owners are `contracts/recipe-catalog.json`, `contracts/delivery-plan.json`, `verification/acceptance-scenarios.json`, and `contracts/source-contract-register.json`; 07/09/10 Markdown and OpenSpec are generated projections. `/workspace/core/docs/prds/workflow-studio/README.md:27`.

**DON-14–16 belong to Phase 34 CORE, not Phase 35 GIVING.** `/workspace/core/docs/prds/workflow-studio/07-core-workflow-catalog.md:1641`:

| Recipe | Trigger / useful behavior                                                                                                | Protected meaning                                                                                                       |
| ------ | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| DON-14 | Development accepts enrollment/stage transition; next action, information, stage aging, missing-action escalation        | Stage supplies no access, legal-donor, commitment, or money truth.                                                      |
| DON-15 | Development opens proposal or approved appeal population; permitted human review, outreach, source response, stewardship | Never-ask/contact restrictions and explicit currency/Legal Entity remain binding; Studio cannot invent approval policy. |
| DON-16 | Church partnership or permitted anniversary review due; source-safe brief, personal contact, next action/responsibility  | Relationship milestone supplies no permission or marketing consent.                                                     |

All three are disabled by default and source-binding status remains `unresolved_requires_exact_owner_qualification` (`07-core-workflow-catalog.md:1665`, `:1677`, `:1703`, `:1715`, `:1741`, `:1753`). Recipe dependency labels are inventory hints, not all-pack edges or assertions that services exist. Their generic three-business-day / maximum-two-optional-reminders language is proposed only where no source policy governs, and concrete dates require tenant approval; do not bake it into P27 native policy as already accepted.

**WS-18-CORE** is a P34 slice consuming native P27 cultivation and preserving P28, depending on WS-05-CORE, WS-09-CORE, WS-10-CORE, WS-14-CORE. **WS-18-GIVING** is P35, DON-01–13/MPD-01/06, depending on WS-26-CORE. Both recorded `not_started`. `/workspace/core/docs/prds/workflow-studio/contracts/delivery-plan.json:615`; `/workspace/core/docs/prds/workflow-studio/09-implementation-backlog.md:293`.

CORE cannot require P35/P37/P38/P41/P42 to import, initialize, run fixtures or pass whole-program acceptance. FULL is evidence rollup. Exact missing source bindings block only their capability; they do not justify substitute table writes. `/workspace/core/docs/prds/program-roadmap/integration-guide.md:40`; `github-impact.md:56`.

All nine recipe cases are specified, not executed (`/workspace/core/docs/prds/workflow-studio/10-acceptance-scenarios.md:1295`):

- T-DON-14-01: source-qualified transition plus next task; -02 stage configuration retains protected meaning; -03 replay/cancellation/amendment race yields one accepted outcome without duplicate effects.
- T-DON-15-01: exact proposal/appeal approval plus source response; -02 reviewer/audience/cadence changes preserve restrictions/entity/currency; -03 replay/cancellation/amendment race remains once-only.
- T-DON-16-01: reviewed relationship facts plus next action; -02 milestone/owner/questions/cadence never widen access/consent; -03 replay/cancellation/amendment race remains once-only.

WS-18 shared scenarios retained across the right source slices:

- WS-AT-017, currency-safe threshold: USD numerical threshold cannot accept THB fact (`10-acceptance-scenarios.md:201`).
- WS-AT-018, incomplete first-gift history: unknown earlier imports cannot manufacture welcome eligibility (`:213`).
- WS-AT-022, wrong source: raw provider callback does not establish posted gift or stewardship enrollment (`:261`).
- WS-AT-044, shared purpose: org/missionary requests converge to one source effect or report incompatible payload conflict (`:527`). Distinct independently authorized purposes remain distinct; see program delivery WS-INT-06 (`delivery-contract.md:85`).
- WS-AT-045, suppression race: current source opt-out wins before dispatch, with separate required-security policy (`:539`).

The recipe-local idempotency expression includes recipe lineage, but program IG-07 explicitly requires **permanent effect-owner identity across native callers, optional workflows, retries, and publication changes** (`integration-guide.md:97`). Treat recipe/run identity as coordination provenance; it cannot replace shared effect identity and generate duplicate native+Studio tasks.

105 symbolic bindings are not a current service registry. A few `development.*` aliases exist in `source-contract-register.json`; all require exact source qualification. Do not ask the founder to name code symbols or assume those aliases implemented DON-14–16. Source-task reuse, command receipt, assignment generation, and retained-rule migration need engineering inspection (WS-Q01/Q03), while application-specific task authority remains P41. `/workspace/core/docs/prds/workflow-studio/12-owner-bindings-and-decisions.md:24` and `:39`.

## Existing-work search and evidence limits

The Sept 22 full census found no Phase 27–44 epic/PRD/implementation issue (`github-impact.md:7`). Current targeted read-only GitHub searches for exact donor-development, Donor Development in title, cultivation in title and Phase 27 in title found no new P27 owner ticket. Results included P9 #604/#613/#624, P14 #723, P12 #674, P25 #1563; Phase 27 title search also falsely matched P23-27/P25-27/etc. This targeted search is not an exhaustive Oct 9 census. A broad PR keyword search produced unrelated donor/development matches and is not absence proof. Do not create anything during grooming.

Read-only validation: direct phase JSON parse passed; ancestor checks passed; `python3 docs/prds/workflow-studio/tools/verify.py` passed: 96 recipes, 352 scenarios, 26 packages/39 slices, independent CORE DAG, 105 source bindings, 16 blueprints/4 forms/3 candidate schemas, exact source semantic coverage. Phase and Workflow generated-projection `--check` commands could not run because `bunx` is absent in this environment. No runtime, database, browser, provider or live behavior was tested or certified.

## Highest-leverage first decision candidate (research inference, not ratified)

Set the practical identity and concurrency of a cultivation enrollment before stage customization or automation. Example: one church is a long-term sending partner while considering a project-specific financial ask, with a church-relations officer and regional representative involved. The shared enrollment model is already settled; the unresolved decision is when a genuinely separate purpose deserves its own stage, accountable owner and next action, versus another ask within the same journey.

Recommended direction for founder discussion: allow separate purpose-based enrollments when accountability/progression really differs; do not fork an enrollment merely because another representative participates or an appeal references the same Party. Several asks can live within one journey. Shared tasks must make the intended obligation clear, and overlapping money outcomes must not double-count. This controls P28 reuse, handoffs, stage history, next-action health and DON-14/15 source occurrence identity while respecting all existing owners. This is an inference to discuss, not an adopted schema or specification.

Other expressly open P27 decisions remain stage-preset customization, ask review, staff/missionary interaction visibility, score inputs/coverage, rollup materialization, and whether Received/Given are truly distinct source events. `/workspace/core/docs/prds/sitestacker-parity/roadmap.md:4133` and `/workspace/core/docs/prds/program-roadmap/decisions-and-gates.md:12`.
