# Phase 24 D24 — every substantive participant adversarial review

> **Subsequent D29 reconciliation (2026-08-28):** D29 now accepts one distinct
> **Website review follow-up route** with one to three explicit Review
> coordinators, current authorization intersection, and no D21/inviter/admin/
> capability inference. Any statement below that calls D29 “next,” “pending,”
> or “unresolved” records the earlier dependency state and is superseded by the
> [D29 adversarial review](./phase-24-d29-explicit-website-review-coordinators-adversarial-review.md).

> **Status:** Founder decision evidence for the active `/grill-with-docs`
> session. This is not a Phase 24 PRD, OpenSpec change, schema, migration,
> implementation plan, ticket, or authorization to build, commit, stage, or
> publish.
>
> **Founder answer:** Option 2 — exclude every substantive participant in the
> exact protected candidate.
>
> **Review date:** 2026-08-28.

## Final disposition

**Accept with required amendments.**

Option 2 is the best permanent rule. It matches the governing Phase 12 and
Phase 17 contract, prevents an earlier author from approving their own work
after somebody else makes the final edit, and gives staff one understandable
principle:

> **If you materially helped make this protected version, another person
> reviews it.**

The unqualified answer is not safe to implement. “Every participant” must not
mean every reader, commenter, person on the Site team, contributor to unrelated
content, or participant in a source review that is already satisfied. It must
mean every stable human whom an authoritative source proves accepted a
material change carried by the **exact candidate lineage and still-unsatisfied
review obligation**.

The choice is acceptable only with D24-R1 through D24-R14 below. The largest
required amendments are immutable candidate lineage, source-owned materiality,
stable-human identity, accepted-suggestion attribution, conservative import and
AI attribution, monotonic reverts and identity merges, atomic stale-review
fencing, privacy-safe staff explanations, and a separately decided recovery
path when no independent internal reviewer exists.

## Exact corrected D24 decision

### D24-R1 — one closed definition

A **protected candidate participant** is a stable human principal for whom an
applicable consequence-owning source proves at least one accepted material-
participation event in the lineage of the exact candidate and review epoch.

The proof is server-derived and closed. A missing, incompatible, corrupt, or
unclassified event is **indeterminate** under D23 and blocks. There is no
caller-supplied participant Boolean, author list, materiality score, confidence,
free-form reason, administrator assertion, or manual “clear participant” action.

This rule applies only when D23 has already proved that the exact action has an
applicable, still-unsatisfied **different human required** obligation. It does
not create a second-person requirement for ordinary work.

### D24-R2 — union over the exact complete candidate

When D23 returns **different human required**, the reviewer must be absent from
the union of every applicable source participant set for:

- the exact Plan candidate and review epoch;
- every included Page, Navigation, protected locale head, and protected shared
  dependency whose material effect is carried by the candidate;
- the default-target and acknowledged-current-default basis;
- the applicable publication or safety candidate; and
- the pinned evaluator, source, policy, dependency, and identity generations.

Unrelated Sites, locales, drafts, Pages, routes, comments, abandoned candidates,
and already-satisfied source obligations do not enter the union. Plan review
does not repeat a completed source review, and Plan review never satisfies or
weakens a source review.

### D24-R3 — each source owns materiality

Every consequence-owning source publishes a versioned, closed registry of
accepted mutation kinds and materiality tests. The Plan composes immutable
typed results; it does not reinterpret Page, Navigation, publication, safety,
locale, or dependency truth.

Potentially material effects include protected wording or meaning; warnings,
actions, destinations, and accessible equivalents; public structure and
Navigation; locale and fallback behavior; shared assets, layouts, or protected
dependencies; Site-default target or root basis; privacy, identity, sender,
rendering, compiler, candidate, dependency, and policy basis.

Transport writes, autosave heartbeats, timestamps, deterministic formatting,
and display-only metadata are not material merely because a row changed. A
semantic no-op is favorable only when the source proves the complete protected
meaning and dependency basis are unchanged under compatible evaluator versions.

### D24-R4 — exact attribution taxonomy

The source records accepted participation using trusted server context:

| Accepted behavior                                                 | Participant result                                                                         |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Author or materially edit protected content                       | Authenticated author/editor participates                                                   |
| Materially change a Plan/default target or acknowledged basis     | Acting human participates                                                                  |
| Change an included protected dependency                           | Dependency actor participates in every carrying candidate                                  |
| Submit a tracked suggestion                                       | No participation until accepted                                                            |
| Accept a tracked material suggestion                              | Human proposer and human accepter both participate                                         |
| Accept a material AI result                                       | Accountable initiating/accepting human participates; AI never reviews                      |
| Accept a material import                                          | Accepter and any trusted mapped human author participate                                   |
| Run a deterministic automated migration                           | Service origin is recorded; carried human lineage remains; service is not a human reviewer |
| Read, preview, comment, route, request review, or request changes | No participation                                                                           |
| Reject a proposal, import, or AI result                           | No candidate participation                                                                 |
| Perform a source-proved semantic no-op                            | No participation                                                                           |
| Revert an accepted material event inside the lineage              | Original actor and reverter both remain participants                                       |

The client cannot submit actor, author, accepter, scope, materiality,
participant status, independence, or reason as authority.

### D24-R5 — no-op proof is source-specific

A semantic no-op requires the source to prove unchanged authoritative protected
semantic digest, complete dependency graph, action meaning, accessibility-
equivalent output, and candidate basis under compatible evaluator versions.

Whitespace, punctuation, alt text, bidirectional marks, labels, URLs, ordering,
or formatting are never globally presumed harmless. A source may classify them
non-material only through a closed, tested semantic rule for that mutation.
Unknown classification blocks rather than silently preserving eligibility.

### D24-R6 — reverts and representation changes cannot launder participation

An accepted material event remains in the participant lineage after an inverse
edit; the inverse actor is added. A successor inherits every participant whose
material source effect or dependency it carries.

Squashing, rebasing, copying, cloning, exporting/importing, restoring,
migrating, changing roles, linking a different account, opening another review
epoch, or making another person the latest editor does not reset participation.

A human may be absent only from a genuinely new candidate for which the source
proves all of the following:

1. the base is independently identified and clean of the discarded lineage;
2. none of that human's material effects or dependencies are carried;
3. the candidate is not a history rewrite or representation change of the
   prior candidate; and
4. every human who materially constructs or accepts the successor is added.

There is no user-facing or administrative “reset contributors” control.

### D24-R7 — discussion remains safe; editing hands review off

Reading, previewing, commenting, requesting changes, and proposing an unaccepted
tracked suggestion do not disqualify a reviewer. This preserves collaborative
review without punishing discussion.

When a tracked material suggestion is accepted, both the provable human
proposer and accepter participate. A reviewer who directly saves a material
protected edit becomes a participant and must hand review to another qualified
human. Core does not infer authorship from private conversations, copied text,
writing style, or semantic similarity.

### D24-R8 — AI, services, imports, and migrations cannot manufacture a second human

AI, automation, service, shared, support, impersonation, and **View as**
identities cannot satisfy independent-human review.

The accountable human who initiates or accepts a material AI result,
transformation, import, or migration choice participates. A separately tracked
human proposer also participates when the source can prove their accepted
contribution. Deterministic transforms retain carried lineage and record their
transformer generation. Unattributed future material mutation is indeterminate.
Legacy content receives no guessed human and no fictional favorable proof.

### D24-R9 — stable human identity is monotonic

Eligibility compares the final Phase 12 canonical, stable, non-reassignable
human principal—not profile ID, account ID, membership, email, display name,
alias, login, session, browser, role, assignment, route, support identity, or
provider user ID.

- Account links and Party/principal merges union participation.
- A merge stales favorable review if the reviewer becomes a participant.
- A split or unlink never automatically widens an in-flight candidate.
- Deletion or anonymization retains the opaque non-reassignable conflict key
  and minimum required evidence without unnecessary names or emails.
- Unresolved identity correlation is indeterminate and blocks.

Historical evidence is append-only. Corrections append superseding evidence;
they do not rewrite history.

### D24-R10 — every relevant change stales or re-evaluates review

An accepted material mutation; participant-digest change; source, dependency,
or head change; evaluator-generation change; identity merge/correlation change;
reviewer authorization or step-up change; policy strengthening; candidate
composition/default-basis change; or validation failure stales or re-evaluates
the review before any effect.

Policy relaxation and identity splitting never make an in-flight candidate
easier. A lawful relaxation applies only to a freshly compiled successor
candidate. Elapsed time never creates independence.

### D24-R11 — one atomic server proof and one winner

The authoritative command re-proves in one short, deterministic transaction:

- trusted Tenant, environment, Site, Plan, candidate, review epoch, and action;
- exact source heads and complete dependency digest;
- D23/evaluator/policy versions and compatibility manifest;
- participant digest and canonical identity epoch;
- reviewer absence from the complete participant union;
- current assignment, capabilities, visibility, and required step-up;
- expected head/CAS and semantic idempotency meaning; and
- the source-specific public-effect preconditions, if the action has one.

One winner writes one immutable receipt. Same-key/same-meaning retry returns the
same business effect. Same key with different candidate, actor, digest, action,
or meaning rejects. A failed proof creates no completion and no public effect.
No external network call occurs inside the transaction.

### D24-R12 — normalized data and the same authorization boundary everywhere

The permanent data design retains immutable candidate/source/dependency
identity; accepted source material events; normalized candidate-participant
proof keyed by canonical human; evaluator and identity generations; a canonical
participant digest; immutable review receipt/conflict proof; and a privacy-safe
reason projection.

It must not store one caller-editable JSON participant list. Every relationship
has the same Tenant/environment/Site/source/candidate/epoch scope through
composite keys or an equivalent database-enforced invariant, restrictive
deletion, unique event/member/receipt constraints, and indexed foreign-key and
resolution paths.

Browser roles cannot write lineage or receipts. Explicit grants, RLS `USING`
and `WITH CHECK`, views, RPCs, security-definer functions, workers, service
roles, Payload hooks, imports, support tools, repairs, and migrations preserve
the identical boundary. Security-definer functions use a fixed safe
`search_path`; actor and scope come from trusted server context.

This is a conceptual contract, not authorization to freeze table names before
the source inventory and Phase 12 identity manifest.

### D24-R13 — explanations are useful and privacy-minimized

Ordinary staff UI shows only:

- whether the current person can perform the exact action;
- a permission-safe source reason;
- whether editing will hand review to somebody else;
- what remains Live; and
- one lawful next action.

It does not expose another person's aliases, permissions, engagement, identity
corrections, restricted source reason, or unpublished content without narrower
audit authorization. Audit uses opaque keys and closed reason codes. Technical
logs, metrics, traces, errors, exports, and analytics contain no protected body,
email, legal name, donor/missionary fact, credential, or unrestricted
participant list.

### D24-R14 — no effect expansion

D24 only subtracts reviewer eligibility. It grants no authority; creates no
task, route, reminder, email, quorum, deadline, escalation, or workflow;
publishes and activates nothing; exposes no draft publicly; and never selects
or affects Giving, Legal Entity, Stripe, settlement, bank, currency,
contribution, receipt, ledger, or accounting identity.

The current public Site remains unchanged while review is blocked. A review
receipt alone has only the effect its source contract explicitly assigns.

## Plain-language meaning and Hope Ministries example

Maria and Ana prepare Hope Ministries' protected French-default candidate:

1. Maria changes protected Navigation.
2. Ana changes a protected French label.
3. Maria and Ana both materially shaped this exact candidate.
4. Neither may independently review it—even though Ana was the latest editor.
5. Eli, a current qualified human who did not materially change the candidate,
   can review it.
6. If Eli reviews only, he remains independent. If he saves a material fix, the
   UI tells him before the save that another qualified human must review.
7. Until lawful review and the separate activation command succeed,
   `hope.org/` still opens the current default and Giving remains unchanged.

This does **not** disqualify everyone who looked at the work. If Eli previews,
comments, or requests changes, he remains eligible. If he proposes tracked
replacement wording and Maria accepts it, both humans helped create the
accepted result and neither is independent for that version.

## Current behavior, intended behavior, and best permanent path

### Current repository behavior

- Governing Phase 12 and Phase 17 prose excludes every substantive
  author/editor of the exact protected candidate.
- The active outbound-communications OpenSpec contains weaker “latest material
  editor” wording, which can let an earlier author approve surviving work.
- D23 deliberately fails that contradiction closed and reserves D24.
- Current public CMS resolution still returns the reserved Site seam with
  `siteId: null`, current staff capabilities remain broad MVP capabilities, and
  no operational Phase 24 candidate-participant lineage exists.
- Existing review-like runtime examples compare only a creator/requester with
  one decider or reviewer. They are current behavior, not safe D24 precedent.

Sources: [Phase 12 permissions](./phase-12-full-role-permission-configuration.md),
[Phase 17 System Messages](./phase-17-system-messages-template-management.md),
[active outbound-communications delta](../../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md),
[D23 corrected contract](./phase-24-d23-source-owned-proportional-independence-adversarial-review.md#exact-corrected-d23-decision),
[current public resolver](../../../apps/admin/src/cms/public/resolve-tenant.ts),
and [current permissions](../../../packages/auth/permissions.ts).

### Intended behavior before this review

The founder selected every substantive participant, but “substantive,” exact
candidate scope, inheritance, reverts, suggestions, AI/import attribution,
identity merges, staleness, privacy, atomic proof, and no-reviewer recovery were
not yet implementation-safe.

### Best permanent path

Adopt D24-R1 through D24-R14 as the decision record. Before implementation,
replace the weaker active OpenSpec sentence; carry the closed D25 no-reviewer
recovery contract forward; land the Phase 12 stable-human contract; inventory
each source's closed
materiality registry; and specify one normalized append-only lineage plus one
atomic source command. Do not retrofit current creator-vs-reviewer fields or
infer favorable history from legacy editor metadata.

## Problem validity and strongest alternative

The root problem is real: protected work can be nominally reviewed by another
account while still being approved by a human who materially created it.
Excluding only the latest editor is the strongest plausible alternative because
it minimizes handoffs and is used by GitHub as a documented compromise.

That alternative loses for Core because an earlier author remains eligible
after a second person makes a small final edit; edit/revert and history rewrites
can launder eligibility; and it contradicts Phase 12/17's exact-candidate rule.
GitHub itself distinguishes its latest-pusher compromise from the safer policy
of dismissing stale reviews. GitLab can exclude every committer and documents
why rebased transport history is insufficient. These are useful comparisons,
not Core's authority.

Nonprofit software does not prove a universal all-participant rule either.
[Blackbaud Financial Edge NXT Payment Assistant](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-payment-assistant-settings-tiers.html)
recommends separating payment-run creation and approval but explicitly permits
one person to hold both roles. That is valid evidence that “nonprofit best
practice” is contextual, not a universal product rule. Core's stronger D24 rule
is justified by its own Phase 12/17 protected-source contract. It is not copied
from a finance product, and D24 has no payment, Giving, or financial effect.

| Choice                                  | Best argument                                              | Core consequence                                                            | Disposition                |
| --------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------- |
| Latest material editor only             | Lowest handoff cost; familiar VCS compromise               | Earlier authors can approve surviving work; contradicts governing Core rule | Reject and replace         |
| Every substantive candidate participant | Real candidate-wide independence; one memorable staff rule | Safe only with exact immutable lineage and recovery                         | **Accept with amendments** |
| Per-person edited subgraph              | Retains more potential reviewers                           | Splits one atomic candidate into a brittle partial-approval graph           | Reject as overengineered   |

## Complete staff UX/UI contract

### Journey 1 — staff prepare protected work

The editor stays focused on content. Core records material participation after
the source accepts the mutation; the person does not check an “I am an author”
box. Ordinary autosave and proved no-op feedback remain quiet.

When review becomes applicable, a compact status block says what is ready, what
stays Live, and who can take the next step without exposing a roster.

### Journey 2 — an eligible independent reviewer arrives

> **Ready for your independent review**
>
> You can review this version because you did not make a protected change that
> is included in it. The live website is unchanged.

Actions:

- **Preview**
- **Request changes**
- **Complete review**, or the exact effect-led action such as **Review and make
  French (Canada) default**

The confirmation shows **Current**, **After this action**, and **Unchanged**.
It never uses a generic **Approve** label for an action with a public effect.

### Journey 3 — the current person participated

> **Another person must review this version**
>
> You helped make a protected change included in this version, so you cannot
> complete its independent review. The live website is unchanged.

Show one authorized next action. Offer D25's external-review invitation only
when every applicable source and current authorization proof allow it; otherwise
use **View review options**. Do not show a dead disabled review button, call the
person a “conflict of interest,” or reveal colleagues'
permissions, unread state, or identity history.

### Journey 4 — a reviewer wants to edit

Before the material save, show:

> **Editing will hand off this review**
>
> This change affects protected content. If you save it, another person must
> review this version. Nothing will be published by saving.

Actions:

- **Edit and hand off review**
- **Keep reviewing**

The warning appears before the consequential save, not after staff have lost
their path. **Request changes** and comments remain available without
disqualification.

### Journey 5 — an accepted suggestion changes eligibility

Before a tracked material suggestion is accepted, disclose that both proposer
and accepter will count as contributors. After acceptance, announce politely:

> **Another reviewer is needed**
>
> The accepted suggestion is now included in this version. Someone who did not
> help make this version must review it. The live website is unchanged.

Do not steal focus or use an emergency alert for this ordinary state change.

### Journey 6 — no qualified internal reviewer exists

> **Independent reviewer needed**
>
> Everyone currently able to review helped make a protected change. Your
> current website remains unchanged.
>
> **View review options**

This is an honest safe state, not an error to bypass. D25 owns the allowed
recovery. No recurring reminder or email is created by default.

### Journey 7 — proof changes while the screen is open

If an edit, identity merge, policy, dependency, authority, or candidate change
invalidates the screen, keep staff work and show:

> **Review requirements changed**
>
> We checked the latest version. Review it again before continuing. The live
> website is unchanged.

Refresh the exact evidence without claiming completion. Lost-response retry
reconciles the immutable receipt instead of submitting a second effect.

### Accessibility, mobile, language, and resilience

- Use Base Maia and repository Base UI/Zinc patterns; no bespoke approval app.
- One obvious primary action, visible labels/instructions, keyboard-safe focus,
  and polite programmatic status.
- Prove 320 CSS-pixel and 400% reflow, 44 CSS-pixel targets where applicable,
  screen readers, forced colors, high contrast, reduced motion, RTL, CJK,
  combining characters, long names/locales, and translated expansion.
- Keep technical terms—participant digest, principal, predicate, epoch,
  idempotency—out of ordinary UI.
- Never optimistically mark review complete or queue an offline approval.
- On weak networks, preserve local editing work, show an explicit retry state,
  and let same-meaning retries reconcile safely.
- Public visitors, donors, missionaries, and unaffiliated users learn nothing
  about review candidates, participant identity, or internal staffing.

## Source of truth and ownership

| Fact                                | Authoritative owner                     | D24 may retain                                       | D24 must not own                                 |
| ----------------------------------- | --------------------------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| Page mutation and materiality       | Page/publication source                 | Immutable event reference, typed result, safe reason | Editable Page truth or duplicate classifier      |
| Navigation mutation and materiality | Navigation source                       | Immutable event reference, typed result              | Navigation content or route authority            |
| Protected publication lineage       | Phase 17 source                         | Exact candidate reference and participant proof      | Message body, publication head, or sending       |
| Plan candidate composition          | D17 source                              | Included heads and lineage digest                    | Underlying Page/Navigation truth                 |
| Human identity correlation          | Phase 12/Party owner                    | Opaque canonical key and epoch                       | Email/name identity or editable merge truth      |
| Review responsibility               | D21/D22 route                           | Attention reference                                  | Authority or independence                        |
| Needs attention state               | D19/D20 source projection               | Source occurrence and safe state                     | Review completion or authorization               |
| Review receipt                      | Exact consequence-owning source command | Immutable candidate/actor/conflict proof             | Public activation unless explicitly source-owned |
| Public default activation           | D16 command                             | Review reference when required                       | D24 participant calculation                      |

## Domain invariants

1. Every future accepted material mutation has one trusted source event and an
   attributable origin class.
2. Every attributable human maps to one canonical non-reassignable conflict
   identity at evaluation time.
3. Candidate participants are the union over the complete applicable
   dependency graph for the exact still-unsatisfied obligation.
4. The participant set grows monotonically inside one candidate lineage;
   inverse edits do not delete events.
5. A successor carries participant lineage for every carried material effect.
6. A genuinely clean successor is source-proved, never user-asserted.
7. One review binds one candidate, epoch, participant digest, reviewer,
   evaluator set, policy set, identity epoch, and authority proof.
8. The reviewer is absent from the participant set at atomic commit.
9. Participant membership grants no view, edit, route, review, publish, or
   activation authority.
10. Route and attention state never alter participation or independence.
11. Accounts, roles, assignments, aliases, support modes, and identity splits
    cannot turn one human into two.
12. Unknown materiality, lineage, identity, dependency, or compatibility cannot
    produce a favorable result.
13. Evidence is append-only and body-free; correction rolls forward.
14. Review and activation are distinct unless one explicitly named source
    command lawfully combines them.
15. D24 has zero public effect and zero Giving/financial effect by itself.

## Conceptual database, RLS, authorization, and concurrency contract

The permanent model should conceptually contain:

- immutable source material-event evidence with source-owned event kind,
  materiality result, origin class, semantic/dependency digest, and evaluator
  generation;
- exact candidate and candidate-source/dependency membership;
- normalized candidate-participant proof keyed by canonical stable human and
  source event;
- participant, dependency, policy, evaluator, and identity digests/epochs;
- one immutable review receipt and append-only correction/revocation evidence;
  and
- a separate privacy-safe presentation projection.

Exact table names remain a design decision. The database contract requires:

- same-scope Tenant/environment/Site/source/candidate/epoch keys or equivalent
  composite constraints on every relationship;
- unique constraints for authoritative event identity, candidate/source event/
  human membership, semantic command occurrence, and receipt;
- check constraints for closed source/event/materiality/result/origin states;
- no nullable scope or canonical-human fields on favorable evidence;
- restrictive deletion for evidence, with approved pseudonymous retention on
  offboarding/anonymization;
- indexes for every foreign key plus candidate-union, canonical-human conflict,
  source-event replay, current-head, and semantic-idempotency resolution;
- direct browser-write revocation and explicit least-privilege grants;
- RLS `USING` and `WITH CHECK` that prevent an allowed row from being moved to
  a forbidden Tenant/Site/candidate or changing its actor;
- fixed safe `search_path` and explicit qualification for security-definer
  functions;
- identical checks through RPCs, views, workers, service-role paths, Payload,
  imports, support, repair, and migrations; and
- trusted server derivation for Tenant, actor, author, proposer, accepter,
  materiality, canonical identity, scope, time, and receipt attribution.

The source save, immutable material-event evidence, participant projection (or
authoritative derivation basis), new candidate head, and stale-review marker
must commit atomically. If provenance cannot be recorded, the source save
cannot claim success. Preserve staff input for explicit retry.

The final review command locks in a documented order—candidate/head, source
evidence/participant proof, then receipt—and performs no provider calls in the
transaction. A final compare-and-swap re-proves the candidate/source/policy/
identity/authority generations and participant digest. A projection/outbox
failure after authoritative commit may retry independently, but review remains
blocked until authoritative proof is complete.

Performance cannot weaken safety. There is no participant truncation or fixed
human cap. Use batched indexed resolution and an implementation execution bound
validated with production-shaped cardinalities; a `limit + 1`, timeout, missing
page, or projection mismatch becomes indeterminate rather than an incomplete
favorable set. Do not reuse D22's three-recipient cap or another phase's 50/200
limits as lineage limits without independent proof.

## Exact OpenSpec correction required before implementation

The active outbound-communications delta's “latest material editor” sentence
must be replaced before any implementation or key activation. The equivalent
normative requirement should preserve this meaning:

> **Requirement: protected review excludes every substantive candidate
> participant**
>
> When an applicable, still-unsatisfied source obligation requires a different
> human for an exact protected candidate, the system SHALL permit review only
> by a current, source-authorized, stepped-up human whose canonical stable human
> identity is absent from the complete union of source-owned substantive-
> participant evidence for that candidate lineage, dependency graph, and review
> epoch. Source owners SHALL classify accepted material mutations and semantic
> no-ops through versioned closed contracts. The client SHALL NOT provide
> authoritative actor, author, materiality, participant, independence, scope,
> or reason. Accepted material events and every carried human attribution SHALL
> survive reverts, restores, representation changes, imports, migrations,
> identity merges, and successor candidates. Unknown or incompatible proof
> SHALL block. The final command SHALL re-prove current candidate, source,
> dependency, participant, identity, policy, authorization, and step-up facts
> atomically. Review alone SHALL grant no authority and create no public,
> Giving, or financial effect.

Required OpenSpec scenarios:

1. **Earlier participant remains ineligible after a later edit:** Given Maria
   and Ana each accepted a material change, when Ana is latest, then both are
   rejected and an otherwise qualified third human can review.
2. **Exact scope excludes unrelated work:** Given Maria changed an unrelated
   Page, Site, locale, or abandoned candidate, then that event does not enter
   the current candidate's participant union.
3. **Already-satisfied source review is not repeated:** Given an included
   protected source has its own still-current independent review and its
   contract says the Plan action has no remaining obligation, then D24 does not
   create a duplicate review, while Plan review cannot replace source review.
4. **Read and discussion preserve eligibility:** Preview, comment, route,
   request review, and request changes add no participant.
5. **Source-proved no-op preserves eligibility:** A compatible authoritative
   semantic no-op adds no participant; unknown classification blocks.
6. **Accepted suggestion attributes both humans:** An accepted tracked material
   suggestion adds its human proposer and accepter; a rejected suggestion does
   not.
7. **AI never supplies the different human:** An accepted material AI result
   adds the accountable human, and the AI/service identity cannot review.
8. **Revert cannot launder:** The original actor and inverse actor remain after
   an accepted material event is reverted in the lineage.
9. **Representation changes preserve lineage:** Copy, squash, rebase, restore,
   export/import, migration, new epoch, role change, and last-editor change do
   not clear carried participants.
10. **Only a source-proved clean successor may discard lineage:** A new
    candidate from a proved clean base omits only effects it does not carry and
    includes every new material human actor.
11. **Canonical identity defeats alternate-account bypass:** Linked or merged
    accounts compare as one human; a split does not widen an in-flight
    candidate.
12. **Reviewer edit hands off:** A reviewer is warned before a material save;
    after saving, they become a participant and cannot complete review.
13. **Race fails safely:** A material event, participant change, identity merge,
    source/policy change, or authority loss concurrent with review defeats or
    stales the favorable command with no public effect.
14. **Duplicate review is idempotent:** Same semantic key and meaning returns
    the same receipt; same key with different meaning rejects.
15. **Cross-scope poison fails everywhere:** Browser, RPC, view, worker,
    service, Payload, import, support, repair, and migration paths cannot link
    or expose evidence across Tenant/environment/Site/candidate/source/epoch.
16. **No eligible reviewer remains honestly blocked:** The current public Site
    remains unchanged; no timeout, administrator, or same-human bypass appears.
17. **Privacy-safe explanation:** Ordinary UI explains the current user's
    eligibility and next action without exposing another person's identity,
    permissions, activity, or protected content.
18. **No effect expansion:** Review/participant evidence alone never publishes,
    activates, emails, routes, selects Giving, or changes financial identity.

These scenarios must be traced from founder decision to glossary, PRD,
OpenSpec, design/manifest, tickets, code, tests, and release evidence. This
Grill artifact does not itself edit OpenSpec.

## Ruthless adversarial review — all 22 categories

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.**

- **What could go wrong:** Core could solve “someone else looked last” rather
  than the root problem, or apply candidate-wide separation to ordinary work
  that never required another human.
- **Why it matters:** The first path permits self-review through an earlier
  contribution; the second strands small ministries and invites broad roles.
- **Severity:** Critical.
- **Likelihood:** High without the D23 applicability boundary.
- **Evidence/reasoning:** Phase 12/17 require a different human from every
  substantive author/editor for protected work; GitHub documents latest-pusher
  exclusion as a compromise; D16 rejects universal second-person review.
- **Effect on answer:** Narrows but does not invalidate Option 2.
- **Permanent fix:** Apply candidate-wide exclusion only to the exact
  still-unsatisfied source obligation proved by D23.
- **Exact spec language:** “D24 SHALL exclude every substantive participant
  only when D23 proves a different-human obligation for the exact current
  action; it SHALL neither create universal review nor substitute a latest-
  editor rule.”

### 2. Brittleness

**Material concern: Yes.**

- **What could go wrong:** Eligibility could depend on mutable `updated_by`,
  Git history, a JSON author list, route membership, current role, account, or
  undocumented materiality heuristics.
- **Why it matters:** Rebase, copy, role switch, account relink, import, or a
  small refactor could change who may approve without changing the work.
- **Severity:** Critical.
- **Likelihood:** High if built from current metadata.
- **Evidence/reasoning:** GitLab explicitly documents a rebase weakness in
  committer-based approval; Phase 17 rejects renamed/split changes and role
  switching as bypasses; current runtime lacks D24 lineage.
- **Effect on answer:** Requires immutable source events and stable-human
  identity.
- **Permanent fix:** Closed source classifiers, append-only lineage, normalized
  participant projection, compatible generations, and indeterminate blocking.
- **Exact spec language:** “Eligibility SHALL NOT derive from transport history,
  mutable editor fields, labels, routes, roles, profiles, emails, or accounts.”

### 3. Technical debt

**Material concern: Yes.**

- **What could go wrong:** Page, Navigation, Plan, notifications, and each app
  could implement their own contributor lists and approval booleans, or Core
  could build a generic workflow engine.
- **Why it matters:** Duplicated classification and authority drift, become
  impossible to upgrade, and conflict with reference-not-copy boundaries.
- **Severity:** High.
- **Likelihood:** High without one contract.
- **Evidence/reasoning:** ADR-0029 requires operational references rather than
  copied CMS truth; ADR-0027 keeps source outcome separate from presentation;
  Phase 12 is the authorization spine.
- **Effect on answer:** Constrains implementation shape.
- **Permanent fix:** One typed source-participation interface, one candidate
  union, one source command; no approval DSL or app-local author Boolean.
- **Exact spec language:** “No app-local participant flag, copied author list,
  inbox state, or configurable approval workflow SHALL become D24 authority.”

### 4. Edge cases

**Material concern: Yes.**

- **What could go wrong:** Suggestions, reverts, clean recreations, no-ops,
  shared dependencies, AI, imports, deterministic migrations, account merges,
  identity splits, offboarding, and reviewer edits could all be classified
  inconsistently.
- **Why it matters:** Each case can either manufacture independence or
  unnecessarily disqualify helpful reviewers.
- **Severity:** Critical.
- **Likelihood:** High over the candidate lifecycle.
- **Evidence/reasoning:** GitHub suggestion commits attribute proposer and
  accepter; Phase 17 treats dependencies and split/renamed changes as protected;
  RFC 7643 supports stable non-reassignable identity.
- **Effect on answer:** Requires the D24-R4 taxonomy and explicit hostile tests.
- **Permanent fix:** Source-specific closed materiality/no-op rules plus
  monotonic lineage and identity semantics.
- **Exact spec language:** “Every accepted mutation and origin kind SHALL have
  one versioned materiality, attribution, inheritance, privacy, and staleness
  rule before that source may participate.”

### 5. Footguns

**Material concern: Yes.**

- **What could go wrong:** Staff may make a tiny fix while reviewing, accept a
  suggestion without knowing it changes eligibility, create a new epoch or
  copy to “clear” contributors, or seek an administrator override.
- **Why it matters:** A reasonable staff action can silently create a dead end
  or bypass the exact safety control.
- **Severity:** Critical.
- **Likelihood:** Medium-high.
- **Evidence/reasoning:** Google Drive resets approval when content changes;
  Contentstack's administrator/stage-mover exceptions show unsafe shortcuts;
  WCAG/GOV.UK guidance favors visible instructions and clear actions.
- **Effect on answer:** Adds consequence-led pre-edit and pre-acceptance UX.
- **Permanent fix:** Warn before material save; explain accepted-suggestion
  attribution; expose request changes; provide no reset or override action.
- **Exact spec language:** “Before an eligible reviewer saves a material change,
  the UI SHALL explain that another reviewer will be required and offer Keep
  reviewing or Edit and hand off review.”

### 6. Tenant safety

**Material concern: Yes.**

- **What could go wrong:** Participant events, canonical identities, source
  reasons, candidate caches, or review receipts may link across Tenants, Sites,
  environments, locales, or hidden organizations.
- **Why it matters:** This leaks unpublished ministry activity and can grant or
  deny review based on another Tenant's data.
- **Severity:** Critical.
- **Likelihood:** Medium without structural scope.
- **Evidence/reasoning:** Platform boundaries require structural Tenant
  isolation; current final Site model is not operational; participant identity
  is sensitive relational evidence.
- **Effect on answer:** Blocks runtime until same-scope enforcement is proved.
- **Permanent fix:** Composite scope constraints, uniform RLS/grants, scoped
  cache keys, permission-safe projections, and cross-scope poison tests.
- **Exact spec language:** “Cross-Tenant/environment/Site/source/candidate/epoch
  evidence SHALL neither affect eligibility nor reveal identity, count, reason,
  timing, or existence.”

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

- **What could go wrong:** A caller could submit the actor/materiality/list,
  move an allowed row into forbidden scope, mutate append-only history, exploit
  missing `WITH CHECK`, or use a privileged path that bypasses normal rules.
- **Why it matters:** One forged or movable provenance row can manufacture an
  independent review and public consequence.
- **Severity:** Critical.
- **Likelihood:** High if protected only by application convention.
- **Evidence/reasoning:** Repository Supabase rules require explicit grants,
  RLS `USING` and `WITH CHECK`, indexed constraints, trusted context, and equal
  privileged-path boundaries; NIST AU-3 supports durable attributed evidence.
- **Effect on answer:** Requires normalized immutable data and one mutation
  boundary.
- **Permanent fix:** Composite constraints, restrictive deletion, unique/check
  constraints, direct-write revocation, fixed-search-path functions, complete
  poison matrix, and atomic CAS.
- **Exact spec language:** “Tenant, environment, Site, candidate, actor, human
  identity, source event, materiality, time, reason, and receipt attribution
  SHALL be trusted server/source facts and SHALL be immutable to browser roles.”

### 8. Overengineering

**Material concern: Yes.**

- **What could go wrong:** Core could add attribution scores, NLP authorship,
  editable graphs, subgraph approvals, quorums, claims, timers, reminders,
  escalation rules, or collusion surveillance.
- **Why it matters:** Staff cannot predict the system; policy becomes a custom
  workflow platform; privacy risk and maintenance cost grow without solving a
  known mission need.
- **Severity:** High.
- **Likelihood:** High given the edge-case surface.
- **Evidence/reasoning:** Source-owned finite classification and one atomic Plan
  already solve the verified problem; no evidence supports surveillance or a
  generalized approval engine.
- **Effect on answer:** Strongly narrows v1.
- **Permanent fix:** Binary human membership derived from closed events, one
  candidate, one participant union, one review, finite reasons.
- **Exact spec language:** “D24 SHALL NOT implement risk scoring, inferred
  authorship, partial/subgraph approval, configurable quorum, claims,
  escalation, reminders, or a workflow language.”

### 9. UX/UI and user friction

**Material concern: Yes.**

- **What could go wrong:** Staff may confuse editing, reviewing, authorization,
  responsibility, and going Live; a disabled button may hide the reason; the
  handoff may appear only after work is saved.
- **Why it matters:** Confusion creates abandonment, broad permission grants,
  duplicate work, and unsafe attempts to bypass the rule.
- **Severity:** High.
- **Likelihood:** High without the complete state contract.
- **Evidence/reasoning:** WCAG requires visible labels/instructions and
  programmatic status; GOV.UK discourages unexplained disabled states; Core
  D16/D17 uses consequence-led Current/After/Unchanged language.
- **Effect on answer:** Requires the seven staff journeys and accessible copy.
- **Permanent fix:** One safe reason, one lawful next action, pre-save warning,
  exact public consequence, progressive audit detail, mobile/localized proof.
- **Exact spec language:** “Every state SHALL say whether this person can act,
  why in safe language, whether editing hands review off, what remains Live,
  and the next authorized action.”

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.**

- **What could go wrong:** Plan, Page, Navigation, Party, route, item, logs, or
  UI could each appear to own participation or completion.
- **Why it matters:** Dual ownership creates circular sync, historical drift,
  and a read model that can accidentally authorize a write.
- **Severity:** Critical.
- **Likelihood:** High across several Phase contracts.
- **Evidence/reasoning:** ADR-0029 requires reference-not-copy; ADR-0027 says
  source state—not presentation—owns the business outcome; D23 composes but
  does not reinterpret source truth.
- **Effect on answer:** Requires the ownership table and invariants above.
- **Permanent fix:** Source-owned accepted events, identity-owned correlation,
  candidate-owned union, source-command-owned receipt, presentation-only item.
- **Exact spec language:** “Only an applicable source may classify its mutation
  and only the authoritative source command may complete review; routes, items,
  caches, logs, and UI state SHALL never do either.”

### 11. Hidden coupling

**Material concern: Yes.**

- **What could go wrong:** An unrelated locale or Site may disqualify a human;
  a completed Page review may be repeated at Plan level; a Plan review may be
  mistaken for satisfying Page/publication review; Giving may be coupled to
  Site identity.
- **Why it matters:** Staff face unnecessary reviews, or a required source
  control disappears; future source changes become unexpectedly disruptive.
- **Severity:** Critical.
- **Likelihood:** High without obligation identity.
- **Evidence/reasoning:** D23 requires exact applicable still-unsatisfied
  obligations; Site identity does not own Giving or financial identity; Page,
  Navigation, publication, and activation own distinct effects.
- **Effect on answer:** Narrows participant union to the exact obligation graph.
- **Permanent fix:** Stable obligation IDs, typed applicability, explicit
  satisfied-source references, and zero financial coupling.
- **Exact spec language:** “The participant union SHALL include only sources
  carried by the exact still-unsatisfied obligation; source review and Plan
  review SHALL neither duplicate nor satisfy each other implicitly.”

### 12. Failure modes

**Material concern: Yes.**

- **What could go wrong:** Source event succeeds while provenance fails;
  participant projection lags; identity resolution is unavailable; a response
  is lost after receipt; or compatibility evidence is partial.
- **Why it matters:** Core may lose staff work, approve without proof, create a
  duplicate effect, or expose a stale action.
- **Severity:** Critical.
- **Likelihood:** Medium.
- **Evidence/reasoning:** D20/D23 make source truth authoritative and unknown
  fail closed; OWASP transaction authorization requires final server-side
  validation; durable systems must handle ambiguous success.
- **Effect on answer:** Requires atomic authoritative write and replayable
  projections.
- **Permanent fix:** Fail source save if immutable provenance cannot commit;
  preserve local input; block on projection mismatch; reconcile idempotently;
  leave current public state unchanged.
- **Exact spec language:** “No source mutation or review SHALL report success
  without its authoritative immutable evidence; projection failure SHALL never
  create favorable absence, and ambiguous retry SHALL reconcile by semantic
  occurrence.”

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.**

- **What could go wrong:** Edit/review, suggestion/review, identity-merge/
  review, policy/review, revocation/review, two-reviewer, and lost-response races
  can apply a receipt to unseen facts.
- **Why it matters:** Two individually valid actions can jointly violate the
  independent-human invariant or duplicate a public effect.
- **Severity:** Critical.
- **Likelihood:** High in collaborative use.
- **Evidence/reasoning:** Phase 16–23 use immutable heads, version fences, and
  semantic idempotency; GitHub/Google Drive stale reviews after edits.
- **Effect on answer:** Requires D24-R10/R11 and a documented lock/CAS order.
- **Permanent fix:** Re-prove all generations/digests/current authority in one
  short transaction; one winner; exact replay; stale successor after change.
- **Exact spec language:** “The command SHALL commit only while candidate,
  source, dependency, participant, identity, policy, authorization, step-up,
  and public-effect heads still match the reviewed proof.”

### 14. Data integrity risks

**Material concern: Yes.**

- **What could go wrong:** Duplicate/missing source events, mutable arrays,
  orphaned dependencies, truncated unions, profile-only comparison, inferred
  migration, or destructive identity repair can fabricate independence.
- **Why it matters:** The system can certify a false business fact that cannot
  later be explained or repaired safely.
- **Severity:** Critical.
- **Likelihood:** High without constraints and replay proof.
- **Evidence/reasoning:** Phase 12 identity merges affect access; RFC 7643
  supports stable non-reassignable identity; GitLab's history rewrite warning
  proves representation metadata is unsafe.
- **Effect on answer:** Requires normalized append-only evidence and strict
  migration.
- **Permanent fix:** Unique event/member keys, restrictive deletion, canonical
  digest reconciliation, monotonic identity union, no guessed legacy people.
- **Exact spec language:** “Migration and repair SHALL infer no favorable
  participant or independence fact from names, emails, profiles, roles, routes,
  notifications, timestamps, or VCS/provider metadata.”

### 15. Security and privacy risks

**Material concern: Yes.**

- **What could go wrong:** Participant rosters, aliases, restricted worker or
  missionary facts, protected content, permission gaps, and denial timing may
  leak through UI, Needs attention, logs, metrics, traces, exports, errors,
  support, or backups.
- **Why it matters:** Even revealing that a protected person edited a Site can
  endanger staff or disclose internal operations.
- **Severity:** Critical.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Platform privacy boundaries require minimization;
  NIST AU-3 warns audit detail can create privacy risk; D19/D20 recipients are
  purpose-limited.
- **Effect on answer:** Narrows projections and durable payloads.
- **Permanent fix:** Opaque audit keys, closed safe reasons, current-user-only
  ordinary explanation, narrower roster permission, body-free telemetry,
  uniform not-found/denial behavior.
- **Exact spec language:** “Ordinary users SHALL see only their own eligibility,
  a source-authorized safe reason, Live impact, and next action; protected
  bodies, peer identity/engagement, and correlation history SHALL not leak.”

### 16. Scalability and performance risks

**Material concern: Yes.**

- **What could go wrong:** Whole dependency traversal, identity-alias union,
  RLS, recipient filtering, and replay can become N+1 or be truncated under
  load; one large Tenant may dominate.
- **Why it matters:** Slow UX invites bypasses, while truncation silently turns
  an ineligible human into an eligible reviewer.
- **Severity:** High.
- **Likelihood:** Medium until production cardinalities are measured.
- **Evidence/reasoning:** Phase 19/22 require batched indexed resolution;
  participant cardinality is independent of the three-person attention route;
  the current runtime provides no proven limits.
- **Effect on answer:** Requires indexed batched plans but forbids safety caps.
- **Permanent fix:** Normalized indexed union, digest/cache only with source
  position, keyset/paged internal processing, limit-plus-one fail-closed,
  production p50/p95/p99 and largest-Tenant proof.
- **Exact spec language:** “Performance optimization SHALL NOT truncate
  participant proof, reuse attention-recipient caps, cache current authority,
  or interpret timeout/missing pages as a complete favorable set.”

### 17. Operational burden

**Material concern: Yes.**

- **What could go wrong:** One-person or fully participating teams become
  blocked and resort to spreadsheets, shared accounts, temporary broad roles,
  support impersonation, or direct database repair.
- **Why it matters:** The safety rule becomes unusable and operators create a
  larger security problem.
- **Severity:** High.
- **Likelihood:** High for small ministries without D25's recovery path.
- **Evidence/reasoning:** D24 intentionally excludes all material humans; Phase
  17 permits only narrow source-authorized delegation; current ministries may
  have one Website staff member—an assumption the D25 journey must validate.
- **Effect on answer:** Does not weaken D24; makes the closed D25 contract and
  source adapters prerequisites.
- **Permanent fix:** Honest current-safe blocker, one lawful source-authorized
  recovery, owner runbook, no hidden override or direct repair.
- **Exact spec language:** “A zero-eligible state SHALL preserve the current
  public Site and SHALL offer only D25-authorized recovery; timeout, broad role,
  shared account, support, database, and same-human bypass are forbidden.”

### 18. Observability and auditability gaps

**Material concern: Yes.**

- **What could go wrong:** A `reviewed=true` flag or technical trace cannot
  prove which candidate, humans, material events, identity epoch, policy, or
  authority were evaluated; logging full bodies/people overcorrects.
- **Why it matters:** Staff cannot understand or safely correct an incident,
  while privacy exposure grows.
- **Severity:** Critical.
- **Likelihood:** High without a business receipt.
- **Evidence/reasoning:** ADR-0027 separates durable business history from
  presentation and engagement; NIST AC-5/AU-3 supports attributed minimized
  evidence; Phase 17 uses exact candidate proof.
- **Effect on answer:** Requires immutable body-free decision evidence plus
  separate telemetry.
- **Permanent fix:** Receipt pins candidate, participant digest, reviewer,
  evaluator/policy/source/identity/auth epochs, outcome, and closed safe reasons;
  technical telemetry holds only opaque correlation.
- **Exact spec language:** “Every favorable receipt SHALL independently prove
  exact-candidate human independence without storing protected content or
  treating logs, analytics, or Needs attention state as business history.”

### 19. Dependency and integration risks

**Material concern: Yes.**

- **What could go wrong:** Payload fields, provider author lists, VCS commits,
  AI metadata, imports, migrations, or current finance review helpers may be
  treated as trustworthy D24 proof despite different identity/materiality
  semantics.
- **Why it matters:** Provider disagreement, schema change, missing webhook, or
  mutable history silently changes eligibility and couples Site to finance.
- **Severity:** Critical.
- **Likelihood:** High during integration.
- **Evidence/reasoning:** External products implement incompatible latest-
  pusher, committer, stage-mover, and admin-bypass policies; current Core
  finance helpers compare profile/requester rather than D24 lineage.
- **Effect on answer:** Blocks every adapter until qualified.
- **Permanent fix:** Per-source adapter manifest proving identity, event
  acceptance, materiality, attribution, ordering, replay, deletion, privacy,
  compatibility, outage, and rollback semantics; no finance reuse.
- **Exact spec language:** “External and legacy metadata are evidence only and
  SHALL NOT become D24 authority without a versioned source adapter that meets
  the complete Core contract.”

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

- **What could go wrong:** Backfill may infer authors from `created_by`/
  `updated_by`; mixed code/schema/evaluator generations may omit participants;
  rollback may erase evidence after new writes.
- **Why it matters:** A rollout can manufacture favorable review or make
  history uninterpretable across versions.
- **Severity:** Critical.
- **Likelihood:** High without fresh-start expand/contract.
- **Evidence/reasoning:** Current runtime has no complete D24 provenance;
  existing editor fields are incomplete; governing Phase artifacts already
  show a latest-editor wording contradiction.
- **Effect on answer:** Requires off-by-default compatible-generation rollout.
- **Permanent fix:** Infer nothing, mark legacy lineage unproved, expand/dual-
  read/fence/contract, cohort activation, kill switch for new commands, preserve
  append-only evidence and current public head, repair forward.
- **Exact spec language:** “No legacy row SHALL receive a favorable participant
  set or review receipt by inference; incompatible code/schema/evaluator
  generations SHALL remain blocked and rollback SHALL preserve all evidence.”

### 21. Testability, traceability, and proof

**Material concern: Yes.**

- **What could go wrong:** “Substantive,” “participant,” “exact candidate,” and
  “clean base” remain subjective; PRD/OpenSpec/glossary/tests may repeat the
  latest-editor contradiction.
- **Why it matters:** Implementations pass happy-path tests while violating the
  founder decision at authorization, concurrency, migration, accessibility, or
  production scale.
- **Severity:** Critical.
- **Likelihood:** High because terminology already drifted.
- **Evidence/reasoning:** Active OpenSpec conflicts with Phase 12/17; repository
  OpenSpec rules require positive, negative, authorization, boundary, failure,
  migration, accessibility, and production-shaped scenarios.
- **Effect on answer:** Keeps implementation keys Reserved until trace closes.
- **Permanent fix:** One clause register from D24 → glossary → PRD → OpenSpec →
  design/adapter manifest → tickets → code → tests → release evidence.
- **Exact spec language:** “Every source mutation kind, origin, participant
  transition, identity path, lineage transformation, race, scope boundary, and
  UI state SHALL have positive and hostile proof before Live.”

### 22. Other development hazards

**Material concern: Yes.**

- **What could go wrong:** Teams may claim D24 proves absence of collusion,
  infer off-platform authorship, treat “independent” as authority, create an
  emergency same-human exception, or forget that D25 delegation is source-
  specific.
- **Why it matters:** The system becomes invasive, gives false assurance, or
  quietly destroys the control it was intended to provide.
- **Severity:** Critical.
- **Likelihood:** Medium-high.
- **Evidence/reasoning:** Two-person controls reduce abuse without collusion but
  cannot prove independent thought; NIST AC-5 makes that limit explicit;
  Phase 17's delegate is a narrow source contract.
- **Effect on answer:** Adds explicit non-goals and makes D25 separate.
- **Permanent fix:** State that D24 proves only system-visible candidate
  independence; do not surveil; keep authorization and recovery separate.
- **Exact spec language:** “D24 proves only that the acting human is absent from
  trusted accepted participant lineage; it SHALL NOT infer private influence,
  certify no collusion, grant authority, or create a delegation/exception.”

## Falsifiable acceptance criteria

### Applicability, scope, and positive outcomes

1. An ordinary action for which D23 proves **same human permitted** does not
   receive a D24 different-human gate.
2. An exact action for which D23 proves **different human required** evaluates
   the complete applicable candidate/dependency participant union.
3. A current authorized, stepped-up human absent from that union can complete
   the exact review.
4. Maria and Ana are both rejected after each accepted a material change, even
   when Ana is the latest editor.
5. An unrelated Site's participant never affects the current Site.
6. An unrelated locale, Page, draft, route, comment, or abandoned candidate
   never affects the exact union.
7. A still-current source review is not duplicated merely because the Plan
   consumes its reviewed result.
8. Plan/default review cannot satisfy or weaken an unsatisfied Page,
   Navigation, publication, or safety review.
9. Participant membership alone never grants visibility, edit, review,
   activation, or publication authority.
10. A favorable review receipt alone changes no public state unless its exact
    source command explicitly combines the two effects.

### Materiality, attribution, and lineage

11. Every accepted source mutation kind has one versioned closed materiality
    and attribution rule.
12. A future mutation kind absent from that registry becomes indeterminate and
    cannot preserve or grant favorable eligibility.
13. Read, preview, comment, route, request review, and request changes add no
    participant.
14. A rejected suggestion, import, or AI result adds no candidate participant.
15. A source-proved semantic no-op adds no participant.
16. Whitespace, punctuation, alt text, bidirectional marks, label, URL, order,
    and accessibility changes cannot use a global no-op shortcut.
17. An accepted tracked material suggestion adds both provable human proposer
    and accepter.
18. An accepted material AI result adds the accountable initiating/accepting
    human and never makes AI an eligible reviewer.
19. A tracked separate human prompt author is added when the source proves
    their accepted material contribution.
20. A material import adds its accepting human and every trusted mapped human
    author; unresolved mapping blocks.
21. A deterministic transform records its service origin and generation,
    carries human lineage, and cannot act as the second human.
22. An accepted material event later reverted retains the original actor and
    adds the reverter.
23. Squash, rebase, copy, clone, export/import, restore, migration, new review
    epoch, route edit, role switch, and latest-editor change preserve carried
    lineage.
24. A source-proved genuinely clean successor omits only discarded lineage and
    adds every human who materially creates or accepts it.
25. No client, administrator, support tool, or migration can clear a
    participant set directly.

### Identity, authorization, RLS, and tenant safety

26. Alternate accounts, profiles, emails, aliases, roles, assignments,
    sessions, support modes, impersonation, and **View as** belonging to one
    human cannot manufacture independence.
27. AI, service, automation, shared, deleted, or uncorrelated identities cannot
    satisfy the human-review requirement.
28. Account/Party/principal merge unions participant history and stales a
    favorable review when a conflict appears.
29. Identity split/unlink cannot widen an in-flight candidate automatically.
30. Offboarding or anonymization preserves an opaque non-reassignable conflict
    key and minimum audit proof without retaining unnecessary display PII.
31. Caller-supplied Tenant, Site, actor, author, proposer, accepter,
    materiality, participant, scope, time, reason, or result is rejected or
    ignored as authority.
32. Browser roles cannot directly insert, update, delete, or move source-event,
    participant-proof, identity-proof, or receipt evidence.
33. RLS `USING` and `WITH CHECK` prevent an otherwise allowed mutation from
    moving a row into another Tenant, Site, source, candidate, or epoch.
34. Cross-Tenant/environment/Site/Plan/source/candidate/epoch poison fails
    through browser, RPC, view, worker, service role, Payload, import, support,
    repair, and migration paths.
35. A hidden cross-scope person or candidate yields no name, count, reason,
    timing, eligibility, or existence signal.
36. Security-definer paths use a fixed safe `search_path`, explicit grants,
    trusted actor context, and the same authorization predicate as the source
    command.
37. Every foreign-key and participant-union resolution path has an index and a
    production-shaped query-plan assertion.

### Lifecycle, concurrency, idempotency, and failure

38. A material source save cannot report success unless immutable event and
    participant evidence commit atomically with the new candidate head and
    review staleness.
39. A provenance-write failure preserves staff input for explicit retry and
    creates neither favorable review nor public effect.
40. A participant projection that is missing, stale, mismatched, truncated, or
    beyond its execution bound is indeterminate, never a favorable empty set.
41. Review racing a material edit has one head/CAS winner; an old receipt never
    applies to the successor.
42. Review racing an accepted suggestion detects the participant-digest change
    and fails or stales before effect.
43. Review racing an identity merge detects the identity-epoch/conflict change
    and fails or stales before effect.
44. Review racing authority loss or expired step-up fails before effect.
45. Review racing source, dependency, evaluator, policy, or current-default
    change fails or stales before effect.
46. Two reviewers racing produce one authoritative receipt/occurrence; the
    loser reconciles the completed state.
47. A duplicate same-key/same-candidate/same-actor/same-meaning retry returns
    the same business effect and receipt.
48. The same semantic key with a different candidate, actor, digest, action, or
    meaning rejects.
49. A response lost after receipt commit reconciles that receipt and does not
    execute a second public effect.
50. No provider/network call occurs inside the authoritative transaction.
51. Projection or outbox failure after authoritative commit retries
    idempotently and cannot fabricate completion, eligibility, or engagement.
52. Rollout disablement stops new commands while preserving the current public
    state, immutable receipts, source evidence, and forward-repair path.

### UX, accessibility, localization, and privacy

53. An eligible reviewer sees why they can act, what remains Live, and an
    effect-led primary action.
54. A participant sees “Another person must review this version,” one safe
    personal reason, current Live impact, and one lawful next action.
55. A participant does not see only a disabled review button or the stigmatizing
    label “conflict of interest.”
56. Before an eligible reviewer saves a material change, the UI explains the
    handoff and offers **Keep reviewing** and **Edit and hand off review**.
57. **Request changes**, comment, and unaccepted suggestion flows preserve
    eligibility and remain usable.
58. Before accepting a tracked material suggestion, the UI explains the
    proposer/accepter eligibility consequence.
59. Async staleness or accepted-suggestion change announces once, politely,
    programmatically, and without stealing focus.
60. A zero-eligible state says the current website remains unchanged and shows
    only D25-authorized review options; it offers no timeout, same-human, admin,
    role, support, or database bypass.
61. Ordinary UI exposes no peer participant roster, alias/merge history,
    permission state, item engagement, protected source reason, or unpublished
    body without narrower authorization.
62. Logs, metrics, traces, errors, analytics, exports, and notification payloads
    contain no protected body, name, email, donor/missionary fact, credential,
    or unrestricted participant list.
63. Public, donor, missionary, and unaffiliated surfaces reveal no candidate,
    participant, review, route, or internal staffing existence.
64. Keyboard, screen-reader, 320 CSS-pixel/400% reflow, 44 CSS-pixel targets,
    high contrast, forced colors, reduced motion, RTL, CJK, combining marks,
    long translation, and focus-order tests pass.
65. Weak-network and stale-page flows preserve editing work, never optimistically
    complete review, and reconcile idempotent retry.
66. Representative one-person, two-person, multilingual, multi-Site, and
    restricted-worker ministries can correctly predict whether reading,
    commenting, suggesting, accepting, editing, reviewing, and activating will
    change eligibility or Live state.

### Migration, performance, traceability, and effect boundaries

67. Migration creates no favorable participant or review fact from legacy
    creator/editor/profile/email/role/route/task/notification/VCS/provider data.
68. Legacy content lacking complete trustworthy lineage remains explicitly
    unproved; it is never assigned a fictional human or empty favorable set.
69. Old-code/new-schema and new-code/old-schema combinations cannot commit a
    favorable review.
70. Only one compatible source/evaluator/identity generation activates for a
    cohort atomically; incompatible generations block.
71. Participant resolution has no safety cap; production-shaped largest-Tenant
    and dependency-fan-out tests meet an explicitly approved p50/p95/p99 budget
    without weakening proof.
72. `limit + 1`, timeout, partial page, missing dependency, or cardinality bound
    breach becomes indeterminate and emits its named owner signal.
73. D24 traces without contradiction from this founder answer through glossary,
    PRD, OpenSpec, design/adapter manifest, tickets, code, tests, and release
    evidence.
74. Active outbound-communications OpenSpec no longer contains a favorable
    latest-editor-only rule after the implementation-bearing correction.
75. D24 participant/review behavior never creates a route, task, reminder,
    recurring email, claim, quorum, deadline, escalation, or workflow.
76. D24 never selects or changes Site identity, Giving enablement, Legal Entity,
    Stripe, settlement, bank, currency, contribution, receipt, ledger, or
    accounting identity.

## Named release and production monitors

Only residual risks with a concrete signal, threshold, owner, and response may
sit in “monitor.” Monitoring never replaces a structural constraint or release
proof.

| Signal                                            |                                                                                           Threshold | Owner                               | Required response                                                                                                          |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------: | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `site_plan_protected_review_by_participant_total` |                                                                                           Any event | Site Security + source owner        | Fence the seam; preserve evidence/current public state; reconcile every affected candidate; require fresh qualified review |
| `site_plan_latest_editor_shortcut_accept_total`   |                                                                                           Any event | Site Platform                       | Stop the rollout; remove shortcut; reconstruct full union; reconcile receipts                                              |
| `site_plan_unclassified_material_mutation_total`  |                                                                        Any accepted future mutation | Owning source team                  | Mark affected candidate indeterminate; quarantine evaluator generation; classify and test before re-enable                 |
| `site_plan_participant_projection_mismatch_total` |                                                                          Any authoritative mismatch | Site Data + source owner            | Stop favorable projection use; replay immutable events; repair digest/index; re-evaluate affected reviews                  |
| `site_plan_edit_revert_lineage_loss_total`        |                                                                                           Any event | Site Security                       | Disable transition; reconstruct lineage; stale/re-review affected candidates; open incident                                |
| `site_plan_identity_merge_conflict_total`         |                                                Any favorable pending/completed review before effect | Identity + Security                 | Fence effect; union identity evidence; stale receipt; require review; investigate bypass                                   |
| `site_plan_nonhuman_independent_reviewer_total`   |                                                                                           Any event | Security + Identity                 | Disable path; invalidate favorable proof; require qualified human review                                                   |
| `site_plan_stale_participant_digest_commit_total` |                                                                                           Any event | Site Platform                       | Stop command generation; preserve current public state; reconcile CAS and affected receipts                                |
| `site_plan_cross_scope_evidence_total`            |                                                        Any read, write, cache, or projection signal | Tenant Security                     | Fence affected seams; contain disclosure; repair keys/policies; run full poison matrix                                     |
| `site_plan_participant_pii_in_telemetry_total`    |                                                                                           Any event | Privacy + Observability             | Stop sink; contain/assess disclosure; purge where lawful; replace payload with opaque keys                                 |
| `site_plan_no_reviewer_without_next_action_total` |                                                                                    Any active state | Site Product + Tenant Website owner | Show D25-authorized current-safe recovery; do not auto-approve, email, or widen roles                                      |
| `site_plan_unrequested_review_notification_total` |                                                                Any D24-created email/reminder/route | Notifications + Site Platform       | Disable emission; delete/retract pending projection where safe; restore source-only behavior                               |
| `site_plan_participant_resolution_budget_missing` | Any enabled cohort without an approved production-shaped p50/p95/p99 and maximum-cardinality budget | Site Platform + SRE                 | Block cohort activation; measure/index before enabling; never add a safety cap                                             |
| `site_plan_participant_resolution_budget_breach`  |                            Release-approved budget breached for three consecutive 15-minute windows | Site Platform + SRE                 | Pause cohort expansion; inspect plans/cardinality; index/batch; fail closed on execution-bound breach                      |
| D24 comprehension protocol                        |                 Below 90%, or any participant concludes role/account switching creates independence | Product Design + Security           | Revise copy/examples and repeat representative research before cohort expansion                                            |

Zero-tolerance thresholds protect structural invariants. The 90% comprehension
threshold is a Core release judgment, not an external industry statistic. A
numeric runtime budget cannot be honestly frozen until production-shaped
cardinality and query-plan evidence exist; absence of that approved budget is
itself a release blocker.

## Ruthless synthesis and ordered permanent path

### Must be resolved before D24 is recorded

1. Record **Accept with required amendments**, not the informal Option 2 label
   alone.
2. Record D24-R1 through D24-R14 as one indivisible decision.
3. Define “protected candidate participant” as a source-proved stable human in
   the exact candidate lineage, not every collaborator and not the latest
   editor.
4. State the invariant that reverts, history rewrites, identity changes, role
   changes, and new review epochs cannot launder participation.
5. State that unknown blocks, current public state remains unchanged, and D24
   grants no authority or public/Giving/financial effect.

These points are resolved in this artifact. No blocker remains to recording the
amended D24 decision.

### Must be captured in the future PRD/OpenSpec/design

1. Replace the active latest-editor OpenSpec sentence with the exact
   candidate-wide requirement and scenarios above.
2. Add the glossary term **protected candidate participant** and keep it
   distinct from responsibility recipient, reviewer, editor field, account,
   role, and source author.
3. Pin the D23 applicability/obligation identity so already-satisfied source
   reviews are not duplicated.
4. Inventory and version each Page, Navigation, Plan, publication, safety,
   locale, dependency, suggestion, AI, import, migration, revert, no-op, and
   privacy contract.
5. Define the Phase 12 canonical-human key, account-link, merge, split,
   deletion/anonymization, and correction epochs.
6. Specify append-only source events, normalized participant proof, compatible
   digests/manifests, composite constraints, indexes, RLS/grants, immutable
   receipts, and privacy-safe projections.
7. Specify the exact staff states, consequence-led copy, accessible responsive
   behavior, weak-network recovery, and no-reviewer journey.
8. Trace all 76 criteria through source-owned tests and release evidence.

### Must be required during implementation

1. Carry the closed D25 contract and source adapters before exposing a no-
   reviewer recovery action; create no administrator or same-human exception.
2. Land the Phase 12 identity substrate and source adapter manifests before
   enabling D24.
3. Implement source mutation and provenance as one authoritative atomic write.
4. Implement the final review as one short server transaction with documented
   lock order, final CAS, semantic idempotency, and no provider call inside.
5. Revoke direct browser mutation; prove RLS `USING` and `WITH CHECK`, grants,
   views, functions, service paths, Payload, imports, support, repair, and
   migration through one hostile matrix.
6. Prototype the qualified, participant, edit-handoff, accepted-suggestion,
   stale, identity-merge, weak-network, and zero-reviewer journeys in Core's
   existing design language before implementation detail hardens.
7. Test one-person, two-person, multilingual, multi-Site, low-bandwidth, and
   restricted-worker ministries. Treat workflow assumptions as hypotheses.
8. Migrate without inferred people or favorable history; use compatible
   expand/fence/contract rollout, cohort kill switch, and forward repair.
9. Prove production-shaped cardinality/query budgets before cohort activation;
   no timeout or truncation may become a favorable empty union.
10. Activate one compatible source/evaluator/identity generation, watch the
    zero-tolerance signals, and preserve the current public head on failure.

### Residual risks that may be monitored

Only the named table above is eligible for monitoring after structural and test
gates pass. Invariant violations, absent source adapters, missing identity
proof, unclassified mutation kinds, missing performance budgets, accessibility
failures, or missing D25 recovery proof are release blockers—not “monitor
later.”

### Assumptions requiring evidence

- **Assumption:** Representative staff understand “protected change” when
  paired with a safe concrete reason. Verify through the comprehension protocol.
- **Assumption:** Direct reviewer editing is uncommon enough that deliberate
  handoff is acceptable. Measure after usability testing; do not weaken the
  independence floor merely to reduce handoff.
- **Assumption:** One-person ministries need bounded reviewer recovery. Verify
  the closed D25 journey with representative ministries before activation.
- **Assumption:** Sources can produce complete trusted lineage and semantic
  no-op proof. Verify per source adapter; unsupported sources remain blocked.

No assumption may be promoted to repository fact without evidence.

### ADR disposition

**No new ADR is required for D24.** D24 resolves a product/domain invariant
already governed by Phase 12/17 and applies existing ADR boundaries:

- [ADR-0027](../../../docs/adr/0027-one-notification-presentation-and-engagement-model.md)
  keeps source outcome separate from notification/presentation.
- [ADR-0029](../../../docs/adr/0029-reference-not-copy-cms-operational.md)
  keeps source truth referenced rather than copied into Plan/CMS projections.

Create an ADR only if later implementation proposes a new cross-platform
architectural commitment that is not already governed—such as a reusable
identity-correlation substrate with consequences beyond Phase 12 or a new
event-storage standard. Do not create an ADR merely to restate this decision.

## Historical D25 decision input — resolved

D25 is now closed. The founder selected source-authorized, exact candidate-
scoped external review without standing Tenant access. The hardened contract is
recorded in the
[D25 adversarial review](./phase-24-d25-candidate-scoped-external-reviewer-adversarial-review.md)
and
[ADR-0181](../../adr/0181-source-authorized-candidate-scoped-external-review.md).
The original question and options remain below as historical decision input.

### Why this decision was asked

D24 deliberately blocks every human who materially helped make a protected
candidate. That is safe, but a one-person ministry—or a small team in which
everyone helped—may have no internal reviewer. D25 must provide a clear lawful
journey without pretending the same person is independent, forcing broad
standing access, or leaving staff at a dead end.

### Hope Ministries example

Maria is Hope's only Website staff member. She materially changes protected
Navigation for the French-default candidate. D24 correctly prevents Maria from
reviewing. The current English Site remains Live, no Giving path changes, and
no email is sent. What should **View review options** let Maria do?

### Option 1 — exact candidate-scoped external reviewer — recommended

Where every applicable source explicitly supports delegation, Maria invites
one verified distinct human for only this immutable candidate. The invitation
binds Tenant, Site, source/candidate/dependency digest, safe reasons, action,
identity, expiry, revocation, and step-up. The reviewer sees a synthetic,
minimized, read-only before/after view; cannot edit, re-delegate, export, see
unrelated data, gain standing Tenant membership, touch Giving/finance, or
approve a successor. If a source cannot provide a safe complete projection or
requires an internal officer, the candidate stays honestly blocked.

**Staff impact:** One clear **Invite a reviewer** action and no membership
sprawl. **Safety cost:** Core must prove identity, expiry/revocation, source-
specific permission, and privacy for every candidate.

### Option 2 — internal qualified staff only

Maria must fully onboard another staff member through Phase 12, grant the exact
current Site/source authority, and have that person review.

**Staff impact:** The smallest special-purpose surface, but substantial
onboarding for one review and a hard block for genuinely solo ministries.

### Option 3 — administrator or emergency same-human exception

Let Maria or a super administrator proceed after warning, reason, and step-up.

**Staff impact:** Fastest in the moment, but it destroys D24's independent-human
promise. Safe emergency behavior is restoring a compatible previously reviewed
last-known-good state—not approving novel protected work.

### Recommendation and exact question

**Recommendation: Option 1 — an exact candidate-scoped external reviewer, only
where every applicable source contract proves it safe.** It gives solo
ministries a focused path while keeping the reviewer truly different, access
minimal, review expiring, and Site/Giving/finance boundaries intact. Option 2
is the strongest simpler fallback when a source cannot safely delegate. Option
3 should be rejected because it invalidates D24.

Which recovery should D25 record: **Option 1 — exact candidate-scoped external
reviewer**, **Option 2 — internal qualified staff only**, or **Option 3 —
administrator/emergency same-human exception**?

### Closure

D25 accepted Option 1 with required amendments. Exactly one current external
invite or grant is candidate-scoped, source-authorized, expiring, revocable,
and non-reusable. D26 now closes when that option may appear despite an
eligible internal reviewer. D27 now closes one source-owned responsibility lane
with deliberate takeover. D28 now closes explicit decline/expiry next-lane
recovery; D29 next decides its bounded recovery-responsibility route.

## Primary source index

### Core repository

- [D24 primary research](./phase-24-d24-every-substantive-participant-primary-research.md)
- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
- [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
- [Phase 12 permissions](./phase-12-full-role-permission-configuration.md)
- [Phase 17 System Messages](./phase-17-system-messages-template-management.md)
- [Phase 17 D11 traceability](./phase-17-decision-test-traceability-2026-07-19.md)
- [Active outbound-communications delta](../../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md)
- [D16 locale-neutral Site root](./phase-24-d16-locale-neutral-site-root-adversarial-review.md)
- [D17 private default Plan](./phase-24-d17-private-default-site-locale-plan-adversarial-review.md)
- [D20 every review-required episode](./phase-24-d20-every-review-required-episode-adversarial-review.md)
- [D21 review routing](./phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md)
- [D22 co-responsible reviewers](./phase-24-d22-small-co-responsible-reviewers-adversarial-review.md)
- [D23 research](./phase-24-d23-source-owned-proportional-independence-primary-research.md)
- [D23 adversarial review](./phase-24-d23-source-owned-proportional-independence-adversarial-review.md)
- [Core glossary](../../../CONTEXT.md)
- [Current public resolver](../../../apps/admin/src/cms/public/resolve-tenant.ts)
- [Current permissions](../../../packages/auth/permissions.ts)
- [ADR-0027](../../../docs/adr/0027-one-notification-presentation-and-engagement-model.md)
- [ADR-0029](../../../docs/adr/0029-reference-not-copy-cms-operational.md)

### External official sources

- [NIST SP 800-53 Revision 5.1](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
- [GitLab approval settings](https://docs.gitlab.com/user/project/merge_requests/approvals/settings/)
- [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub pull-request reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews)
- [GitHub incorporating feedback](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/incorporating-feedback-in-your-pull-request)
- [Google Drive approvals](https://support.google.com/drive/answer/9387535)
- [Contentstack workflows](https://www.contentstack.com/docs/headless-cms/add-workflows-and-stages)
- [Contentful workflow permissions](https://www.contentful.com/help/ai-automations/workflows/workflows-roles-and-permissions/)
- [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-3.1)
- [OWASP Transaction Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html)
- [WCAG Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)
- [WCAG Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html)
- [WCAG Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)
- [WCAG Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [GOV.UK buttons](https://design-system.service.gov.uk/components/button/)
- [Blackbaud Financial Edge NXT Payment Assistant](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-payment-assistant-settings-tiers.html)
