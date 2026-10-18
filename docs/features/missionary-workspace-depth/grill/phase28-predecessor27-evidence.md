# Phase 28 research: Phase 27 predecessor and live publication evidence

Research only; no Phase 28 decision, specification, ticket draft, tracker change,
implementation or release authorization is recorded here.

Inspected October 15, 2026, America/Los_Angeles; live readback completed around
2026-10-16 03:35 UTC. Repository HEAD was
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` on local branch `work`.

## What is actually published and integrated

- [Issue #1992](https://github.com/Asymmetric-al/core/issues/1992) is open with
  `status:ready`. Its body publishes specification
  `phase27-ratified-spec-2026-10-11-v1`: 193 stories, 193 requirements, 711
  acceptance clauses, 141 operating controls, and 204 unchecked tasks. The issue
  body still describes the earlier specification-publication event; its sentence
  saying no implementation tickets were created is dated, not current inventory.
- [PR #1993](https://github.com/Asymmetric-al/core/pull/1993) is **merged**, not
  pending. GitHub reports merge at `2026-10-11T15:11:49Z` into `develop`, merge
  commit `9cada8f3d8ab59db391d3fd20df77fcadeb09813`, final head
  `fe9b5952d9dfe90aa92b333eec3ad8f45eab9796`, head name
  `docs/AL-1992-phase27-spec`. Both branch and Git-ref lookup returned 404 for
  that old head branch. The PR preserves its head identity; an extant branch is
  not established. Local HEAD equals the merge commit.
- The local publication README and several issue bodies still say PR #1993 is
  unmerged. Live merge metadata supersedes that snapshot statement. This read
  did not edit those historical records.
- Live REST readback of **all 68** implementation issues #1994–#2061 found all
  open, unassigned and carrying `status:blocked`. Every live body SHA-256 matched
  `implementation-publication/issues.json`'s `current_body_sha256` (68/68).
- Live native `dependencies/blocked_by` readback for all 68 issues produced
  **139 edges**, exactly equal to the publication's 123 `internal` plus 16
  `existing_issue` edges. No extra or missing edge was found. This rechecks
  bodies/status/assignees/native blockers, not the whole historical 853-check
  publication audit or all parent relationships.
- All 25 bodies targeted by the correction packet also match its immutable
  `before_body_sha256` baseline. In particular #2026 has only #2021 as a native
  blocker; the proposed #1996 → #2026 edge is absent.
- The correction packet remains a **proposal, unapplied**: 23 primary acceptance
  transfers across 25 replacement bodies and one added edge would produce 140
  edges without changing the 68 identities, 711 cases or source frontier. The
  PR's final description and local review resolution explicitly retain the
  unapproved status. No later approval was established by this readback; body
  and edge comparison proves nonapplication, not the absence of every possible
  off-tracker approval.
- Local `openspec/changes/add-donor-development/tasks.md` has 0 checked and
  204 unchecked tasks. Merging the planning contract satisfies documentary
  integration into this checkout; it does not resolve the correction review,
  prove source implementation, qualify real authorization/providers, or activate
  Phase 27. No feature/runtime qualification was exercised in this research.

Readback used `gh api repos/Asymmetric-al/core/pulls/1993`, issue endpoints, native
dependency endpoints and local SHA-256 comparisons. GitHub connector reads of
the issue and PR independently agreed with the key metadata. Published baseline:
`docs/features/donor-development/planning/implementation-publication/{issues,dependencies}.json`.
Proposed baseline: `implementation-corrections/baseline.json`.

## Inherited source meaning Phase 28 must consume

1. **Continuing partnership is deliberate work, not supporter consent.**
   REQ27-P01–P03 preserve one ordinary canonical Party–identified Ministry
   Assignment–admitted purpose relationship across years, asks and personnel.
   Ministry identity survives participant, login, household, Page and giving
   changes; zero participants is legitimate. Gifts, notes, referrals and imports
   do not automatically enroll managed work. Authorized early Party/referral/task
   work remains useful without an identified ministry. Prayer and other
   nonfinancial participation coexist; a declined ask does not end the human
   relationship. An extra enrollment requires genuinely distinct continuing
   work, not different currency, owner, year, privacy need or stage list.
2. **Tasks, Requests, encounters and money have separate truth.** REQ27-P07 and
   Q07 require an appropriate due source task or owned actionable exception for
   deliberately admitted active managed work. Existing suitable work can meet
   that need without another task. Shared Tasks Hub projects source actions;
   generic Complete/Delete/AI actions cannot decide a Request review or
   partnership lifecycle. An encounter can address multiple obligations only
   with actual source evidence. Voluntary shared updates create no task floor.
3. **Requests represent independently answerable invitations.** The Requests
   workflow keeps preparation, actual presentation of specific terms, supporter
   response, current work disposition and owner-confirmed outcomes separate.
   Funding, prayer, hosting and introductions use the same source; ordinary calls
   and reminders remain tasks. Recording actual historical facts needs neither
   an appeal nor active cultivation. Partial/conditional/deferred/declined and
   unknown responses remain distinct; the latest contact's reply is not
   automatically an organization's authorization. A response does not charge,
   subscribe, book or fulfill anything.
4. **Appeals coordinate recorded plans and shared Requests.** Working-list
   membership is deliberate, not a live filter or consent. Included, Removed
   and Excluded are separate from derived eligibility. Return is deliberate and
   revives no ended solicitation. Requests can be referenced by multiple appeals
   without copying work or transferring access. Boards use a named Request-level
   dimension, not mutually exclusive supporter-wide money stages. Membership,
   presentation, response, requested/forecast/committed/received and handling
   remain separate facts. Financial lenses require exact source currency,
   entity, scope, coverage and deduplication.
5. **D26 shared history is a narrow new-content exception.** REQ27-C01–C09 and
   owner reconciliation permit newly authored eligible context through the P9
   source and exact P12 create/read/history/correct/restrict powers. They do not
   expose general CRM notes, scores, care, Support, imports or private messages.
   The composer identifies the actual continuing audience; newly assigned
   collaborators need an independent historical grant. Reading/writing is
   voluntary and creates no staff role, enrollment, coaching or performance
   obligation. A separate private-note destination must state its real audience;
   “internal” does not mean author-only. An unavailable private destination cannot
   fall back to shared storage.
6. **Contact evidence has exact meaning.** REQ27-C10–C11 distinguish Last recorded
   exchange, Recent outreach and Next follow-up. A human response can count even
   if brief or negative. A sent message, no-show, dialer launch, open/click,
   generic task completion or financial event is not a conversation. Unknown or
   date-only occurrence remains truthful. Latest exchange cannot be inferred
   from the first 50 loaded rows or `created_at` fallback.
7. **Responsibility and access remain independent.** Assignment volume scope and
   owner reconciliation preserve P9 role-qualified assignments, independently
   meaningful primary status, protected manual/unknown provenance and existing
   source history. Party representative, partnership lead and Request/task owner
   are different facts. Transfer does not imply access, supporter allegiance,
   financial succession or compulsory missionary participation.
8. **Native work is independent of optional products.** Q08 and owner
   reconciliation require native Requests/tasks/shared context to remain usable
   without Workflow Studio, Eve, external newsletter sync or SMS. Optional
   consumers use the same permanent source-purpose effect identity and current
   authority; they cannot revive ended work or duplicate effects.

## Exact producer tickets inspected

All tickets in this table were live-read and remain open/blocked. Listed edges
were checked against native GitHub dependency state where noted above; rows
describe intended deliverables, not implemented capability.

| Ticket                                                                            | Existing producer and consumer implication                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#1998](https://github.com/Asymmetric-al/core/issues/1998), P27-S01 under Phase 9 | Stable organization-owned Ministry Assignment plus separate participant intervals; exact Tenant/Legal Entity, current eligibility and historical identity. Blocks on #606. No Page, Support Binding, invitations or access grants follow. Legacy profile mappings require census and explicit unresolved handling.                                                    |
| [#2001](https://github.com/Asymmetric-al/core/issues/2001), P27-C01               | P9-owned eligible shared update/encounter source and bounded staff/missionary projection; depends on #1998. There is **no #2004 enrollment prerequisite** for voluntary sharing. Existing general notes/activity are not this qualified source.                                                                                                                       |
| [#2006](https://github.com/Asymmetric-al/core/issues/2006), P27-C02               | Correction/restriction, honest occurrence dates, bounded history, retained-data and restore behavior; depends on #2001. Notes cannot change money/tasks; no private-to-shared backfill.                                                                                                                                                                               |
| [#2004](https://github.com/Asymmetric-al/core/issues/2004), P27-P01               | Start/reuse continuing partnership; depends on #1998 and stage-list #1997. Also delivers the bounded reusable ADR0183 native Source work adapter: occurrence identity, recipient/action predicates, identifier-only durable intent, current result recovery, My Tasks projection and typed source end. Later sources may reuse it **without cultivation enrollment**. |
| [#2008](https://github.com/Asymmetric-al/core/issues/2008), P27-F01               | First significant nonfinancial Request and source work. Its #2004 dependency is on the technical Source work producer, not a demand to enroll every Request into cultivation.                                                                                                                                                                                         |
| [#2025](https://github.com/Asymmetric-al/core/issues/2025), P27-F03               | Actual presentation and independent supporter response; depends on monetary/noncash terms #2019. Ordinary response works without appeal #2039 or optional Studio.                                                                                                                                                                                                     |
| [#1996](https://github.com/Asymmetric-al/core/issues/1996), P27-F12               | Financial/nonfinancial/mixed appeal shell, optional goals, Working list/Requests/History; no native issue blocker, but qualification gates remain. Legacy `public.campaigns` is not appeal authority.                                                                                                                                                                 |
| [#2039](https://github.com/Asymmetric-al/core/issues/2039), P27-F18               | Same canonical Requests across compatible appeals, truthful presentation/replies, Request-level board; depends on #2029 and #1996. Ordinary Requests do not depend on this composition.                                                                                                                                                                               |
| [#2051](https://github.com/Asymmetric-al/core/issues/2051), P27-F16               | Membership-dependent solicitation fence at actual transport admission; consumes #2031 and #2047. Frozen populations may narrow, never gain replacements; eventual outbox invalidation is insufficient.                                                                                                                                                                |
| [#888](https://github.com/Asymmetric-al/core/issues/888), Phase 17                | Atomic source-fenced occurrence and complete child-plan compiler. Explicitly does **not** create/execute the missing Phase 6 preparation/sealed-submission producer.                                                                                                                                                                                                  |
| [#897](https://github.com/Asymmetric-al/core/issues/897), Phase 17                | Current body, updated October 11, explicitly says Phase 6 preparation/submission allocation and actual component proof are missing. The provider classifier consumes these records; #888 cannot be relabeled their producer.                                                                                                                                          |

#2009/#2021/#2026 finance-report/intake source tickets were read back for
state/body/graph continuity; their detailed acceptance was not comprehensively
reviewed here. Normative requests.md's entire “Gifts awaiting finance” workflow
was inspected: P15 owns the narrow handling report, unknown details remain
unknown, existing finance staging continues the same intake, posting and actual
physical handling finish independently, and a report-only actor receives only
an independently allowed minimal result.

## Bounded unresolved gates

- **E7:** P13 live campaign/source-code remapping versus frozen posting-time
  attribution remains unresolved in owner reconciliation and Q15. Affected
  received-toward-appeal measures remain Unavailable; ordinary Requests,
  nonfinancial work and independent qualified finance facts continue.
- **C-01:** tenant-optional separation versus mandatory independent approver for
  posted corrections remains an upstream finance policy choice. Request review
  and handling reports do not settle it.
- **Phase 6 preparation/sealed submission:** #897 currently states no exact
  allocated/qualified producer. The live `preparation sealed` issue search found
  consumers/classifiers, not evidence overturning that explicit missing-producer
  record. Do not invent a new issue number or mark all native work blocked.
- **Material Phase 27 planning correction:** still unapplied. The original
  publication audit proves fidelity to approval, not that each full acceptance
  scenario can execute using only its assigned producer closure. Corrections
  move composed proof, not source security and correctness obligations.

## Existing Phase 28-adjacent and newsletter-purpose work

Live searches used `"Phase 28"`, `"[Phase 28]" in:title`,
`"missionary workspace" in:title`, `"support raising" in:title`,
`"missionary" in:title`, and `newsletter`/`"newsletter" in:title`.
The Phase 28 string search returned false positives such as P21-28; no dedicated
Phase 28 epic/specification appeared in these queries. This is bounded search
evidence, not a guarantee that no differently named issue exists.

- [#1649](https://github.com/Asymmetric-al/core/issues/1649), P25-85, already owns
  the **minimum usable local child** and intended-recipient permission together
  with email for the public newsletter-request occurrence. Both paths qualify
  before accepting the occurrence. This is not missing work to duplicate in a
  new broad Phase 28 foundation.
- [#1650](https://github.com/Asymmetric-al/core/issues/1650), P25-86, improves the
  focused request detail/Copy/return experience over #1649. Frozen intended human
  intersects current same-Page/typed-subject/purpose/field authority; guest-origin
  request is allowed without fake supporter admission. New assignee, spouse,
  editor, generic role or matching email does not gain the request.
- [#1651](https://github.com/Asymmetric-al/core/issues/1651), P25-87, owns the
  request-only public form and uncertainty recovery. Request received does not
  mean delivery, enrollment, verified identity or subscription. No visitor email
  or account requirement. First email preparation/attempt and local availability
  stop at acceptance +7 days; body/detail ends +30 days or earlier. Copy/read/
  archive do not mean handled or enrolled. Phase 32 automatic enrollment remains
  prohibited. A native signup/preference-center product requires explicit owner
  amendment, not reinterpretation of old requests.
- [#557](https://github.com/Asymmetric-al/core/issues/557) reserves the
  suppression/export-eligibility/provider-adapter contract only; it is not a
  live Mailchimp integration or newsletter composer. Its old “newsletter/
  Mailchimp phase” wording must be interpreted through the current Phase 32
  ownership in the Phase 28 brief.
- [#562](https://github.com/Asymmetric-al/core/issues/562) is an existing Phase 6
  donor/missionary read-service producer with portal UI explicitly reserved. It
  consumes the shared resolver and must not locally rederive permission rules.
- Existing narrow app issues [#1978](https://github.com/Asymmetric-al/core/issues/1978)
  (home page-frame evidence) and [#1979](https://github.com/Asymmetric-al/core/issues/1979)
  (responsive sidebar coordination) remain open. They are not Phase 28 feature
  delivery and should not be silently duplicated. Search also found open #737,
  #829, #1153, #1161, #1166 and #1520 owner/consumer work; their detailed bodies
  were not all assessed in this subtask.

## Actual reading coverage and limits

Read the user brief, root AGENTS, document-authority, general workflow rules,
OpenSpec project guidance and current grill-with-docs skill. Focused Phase 27
reading included:

- Main specification status/problem/solution/package and initial story mapping.
- `owner-reconciliation.md` in full.
- `partnerships.md` P01–P03 and P07 in full, including their acceptance; adjacent
  P04–P06 portions were sampled, not a complete stage/lifecycle audit.
- `requests.md` observable workflow sections: Requests/answers, internal review,
  appeal working list, gifts awaiting finance, mixed appeals/measures, shared
  interaction/delivery, and explicit financial gates. Not all 87 numbered
  requirements and every acceptance case were individually read.
- `context.md` C01–C11 and associated acceptance covering voluntary history,
  scope, correction, privacy, recovery, current audience and recency.
- `assignments.md` responsibility/scope and required staff/admin experience;
  detailed rule-policy clauses were not fully audited.
- `proof.md` Q07/Q08/Q15/Q16 in full. Operating-control inventory was located;
  no assertion is made that all 141 monitor rows were evaluated.
- OpenSpec proposal/design in full; scoped CRM, identity/access and outbound
  communication deltas; task state and selected task sections. The 1,038-scenario
  generated projection was not independently reread end to end.
- Implementation publication index/frontier/gates, review resolution, correction
  explanation/transfer table/graph boundary, immutable correction baseline and
  all live issue body hashes/native edges. Detailed ticket reading concentrated
  on the rows above, not every 68-ticket acceptance body.

This research did not test deployed behavior, RLS, providers, user comprehension,
migrations or retained production data; did not requalify the 15 historical owner
body amendments; and did not reread all historic PRs as though they were current
owner contracts. Those are explicit limits, not inferred passes.

## Candidate founder decisions, not rulings

The highest-leverage opening choice is **who may see a newly entered personal
prospect before the missionary deliberately brings that relationship into shared
organizational work**. The brief expressly leaves private-prospect admission,
staff visibility, promotion/deduplication and correction ownership unresolved.
Phase 27 settles voluntary shared updates and the canonical source boundaries;
it does not grant a new personal shadow CRM or settle this initial prospect
audience. Use a concrete personal referral example and separate visibility from
the already-settled organization-owned source architecture.

Other genuine later choices include native newsletter scheduling/reuse/cadence
scope, exact invited coaching modules/history/duration, and optional getting-
started resource/connection scope. Do not reopen organization-owned CRM, shared
Requests, voluntary D26 contribution, first-class nonfinancial partnerships,
request-only newsletter semantics or task completion's lack of fabricated effects.
