# Phase 24 D24 — Every Substantive Participant Primary Research

> **Research date:** 2026-08-28  
> **Question:** When an exact protected candidate requires independent review,
> which people are not independent?  
> **Founder choice under review:** Option 2 — exclude every substantive
> participant in that exact candidate, not only the latest material editor.  
> **Research disposition:** **Accept with required amendments.** The choice is
> the safest, clearest permanent rule and resolves the repository contradiction
> in favor of the governing Phase 12/17 contract. It is implementable only if
> candidate scope, source-owned materiality, immutable human lineage, reverts,
> suggestions, AI/import attribution, identity aliases, stale-review behavior,
> and the no-reviewer recovery path are exact.

## Executive conclusion

The founder's choice should stand, with one crucial clarification:
**substantive participation is an immutable, server-proved fact about the exact
candidate lineage—not a role, route, last-editor shortcut, free-form label, or
guess about who influenced whom.**

Core's own governing evidence is decisive:

- Phase 12 says the protected publication actor must be a different human from
  every substantive author/editor of the exact head and review epoch.
- Phase 17 repeats that rule, says author/editor provenance is objective, and
  says role changes, shared identities, split changes, and renamed changes
  cannot evade it.
- The active outbound-communications OpenSpec currently says only “latest
  material editor.” That is a real contradiction and a weaker rule.
- D23 deliberately failed this question closed and asked D24 to resolve it.

Sources:
[Phase 12 dated Phase 17 amendment](./phase-12-full-role-permission-configuration.md#dated-phase-17-capability-amendment-2026-07-19),
[Phase 17 draft, commit and publication](./phase-17-system-messages-template-management.md#draft-commit-and-publication),
[Phase 17 exact approval protocol](./phase-17-system-messages-template-management.md#derived-publication-floor-and-exact-approval-protocol),
[Phase 17 D11 traceability](./phase-17-decision-test-traceability-2026-07-19.md#d11-clause-register),
[active outbound-communications delta](../../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md#requirement-publication-review-is-proportional-and-independent-where-required),
and [D23 corrected contract](./phase-24-d23-source-owned-proportional-independence-adversarial-review.md#corrected-decision).

Current official external evidence supports the direction without defining
Core's exact model:

- NIST AC-5 says duties requiring separation must be identified and backed by
  access authorization. The discussion says separation reduces abuse of
  authorized privilege without collusion.
- GitLab can prevent **every user who added commits** from approving, and its
  documentation explicitly exposes a rebase weakness that can make a prior
  committer appear eligible. That is direct evidence that mutable transport
  history is too brittle for Core's durable business rule.
- GitHub documents the weaker “someone other than the latest pusher” rule as a
  compromise and says dismissing stale reviews is safer when hijacking is a
  concern. GitHub also preserves both the suggestion author and accepter as
  co-authors when a suggested change is applied.
- Google Drive can require all approvers to review the same content and then
  resets approvals on edits.
- Contentstack offers “Prevent self-advancement,” but it applies only to the
  person who moved an item into the stage and has superuser bypasses. It is
  useful comparative evidence, not a safe Core contract.
- RFC 7643 requires a service-provider-issued identity resource ID to be
  stable and non-reassignable. That supports an opaque stable human key rather
  than email, profile, role, or display name; the RFC does not choose Core's
  identity model.

Sources:
[NIST SP 800-53 Rev. 5.1 AC-5 and AU-3](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final),
[GitLab approval settings](https://docs.gitlab.com/user/project/merge_requests/approvals/settings/),
[GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches),
[GitHub incorporating feedback](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/incorporating-feedback-in-your-pull-request),
[Google Drive approvals](https://support.google.com/drive/answer/9387535),
[Contentstack workflows](https://www.contentstack.com/docs/headless-cms/add-workflows-and-stages),
and [RFC 7643 §3.1](https://datatracker.ietf.org/doc/html/rfc7643#section-3.1).

The corrected D24 decision should be:

> When D23 proves that an exact protected candidate requires a different human,
> the reviewer must be a current, authorized, stepped-up human whose canonical
> Phase 12 human identity is absent from **every source-owned substantive-
> participant set in the complete candidate and dependency graph for the exact
> review epoch**.
>
> A substantive participant is a human linked by trusted server context to at
> least one accepted, source-classified material participation event in that
> candidate lineage. Authoring or materially editing protected content;
> accepting a material suggestion, AI result, import, migration choice, or
> dependency change; and committing a material Plan/default change can qualify.
> Reading, previewing, commenting, routing, requesting review or changes, and a
> source-proved no-op do not qualify.
>
> Materiality and attribution are source-owned, versioned, closed, and
> server-derived. The client cannot submit the actor, author, contributor,
> materiality, independence, or reason. Structured suggestions preserve both
> the proposer and accepter when accepted. AI, service, support, shared, and
> impersonation identities cannot be the independent human; the accountable
> initiating or accepting human remains attributable.
>
> An accepted material event remains in the participant lineage for that
> candidate even if a later inverse edit restores the visible output. A
> successor inherits every participant whose material lineage is carried into
> it. Only a genuinely new candidate built from an independently proved clean
> base may omit discarded lineage, and every human who materially creates that
> successor is included. Squashing, rebasing, copying, importing, restoring,
> role switching, identity splitting, or making another person the last editor
> never erases participation.
>
> Material edits, participant-set changes, source/dependency changes, identity
> merges, policy changes, or authority changes stale the review and require a
> current re-evaluation. Unknown or incompatible lineage blocks. This rule
> grants no authority, creates no public effect, and has no Giving or financial
> effect.

That wording is a **Core product and architecture judgment** derived from
repository authority and current primary evidence. No external vendor or
standard independently proves the complete Core rule.

## Plain-language meaning

For staff, the rule is intentionally smaller than the engineering contract:

> **If you materially change protected work in this version, someone else
> reviews it.**

“Materially” does not mean “touched the screen.” It means the source accepted a
change that can affect protected meaning, an action, a destination, a shared
protected dependency, public default behavior, or another review-bound
consequence.

### Hope Ministries example

1. Maria changes protected Navigation in the French default-language Plan.
2. Ana fixes a final protected label.
3. Maria and Ana are both substantive participants in this exact candidate.
4. Neither can complete its independent review, even though Ana was the latest
   editor.
5. A third current qualified human reviews the exact candidate. If none exists,
   the current website remains unchanged and D25 owns the lawful recovery path.

By contrast:

- Eli opens the Plan, reads the diff, and comments “Please make this clearer.”
  Eli has not edited the candidate and remains eligible.
- Eli supplies exact replacement wording through a tracked suggestion, and
  Maria accepts it. The source records Eli as proposer and Maria as accepter;
  both materially shaped the accepted candidate and neither is independent.
- Eli saves after a deterministic formatter produces a source-proved semantic
  no-op. Eli is not added merely because a transport write occurred.

## Evidence labels

- **Repository fact:** directly stated in governing Core documentation or
  current source.
- **Verified external fact:** directly stated by the standard or product owner
  in current official documentation.
- **Reasonable inference:** follows from verified facts but is not directly
  stated by the source.
- **Product judgment:** the recommended Core choice among defensible options.
- **Assumption:** plausible for missions organizations but not yet verified
  with representative users.
- **Unresolved unknown:** requires a later founder decision, source inventory,
  implementation proof, or representative-user research.

## What was researched

The research tested:

1. whether latest-editor exclusion is sufficient;
2. exact candidate and dependency scope;
3. no-ops, rejected edits, reverts, restores, copies, and successors;
4. suggestions, AI, automation, imports, migrations, and dependencies;
5. identity aliases, merges, splits, deletion, and anonymization;
6. stale-review and concurrency behavior;
7. proof without a content-body archive or identity leakage;
8. staff warning, explanation, and handoff UX; and
9. small-team operation without an administrator bypass.

Only governing repository artifacts, current repository source, standards,
and first-party product documentation were treated as factual evidence.

## Governing repository findings

### Phase 12/17 already choose every participant

Phase 12 says the protected publication command requires a human different
from **every substantive author/editor of that exact head and review epoch**.
It also says role names, imported authority, job titles, browser state, and
credentials never authorize.

Source:
[Phase 12 dated Phase 17 amendment](./phase-12-full-role-permission-configuration.md#dated-phase-17-capability-amendment-2026-07-19).

Phase 17 says protected publication requires a different currently authorized
human; substantive content or dependency changes stale review; provenance is
objective; anyone who changed content or a pinned dependency is not independent
for that candidate; and role changes, service/shared identity, and renamed or
split changes cannot evade the rule.

Sources:
[Phase 17 draft, commit and publication](./phase-17-system-messages-template-management.md#draft-commit-and-publication),
[Phase 17 exact approval protocol](./phase-17-system-messages-template-management.md#derived-publication-floor-and-exact-approval-protocol),
and [Phase 17 D11 clause register](./phase-17-decision-test-traceability-2026-07-19.md#d11-clause-register).

**Repository conclusion:** D24 Option 2 resolves the developing spec back to
the ratified Phase 12/17 contract; it does not invent a new control.

### The active OpenSpec sentence is weaker

The active outbound-communications delta currently says the reviewer must
differ from the **latest material editor**. The same requirement says split or
renamed changes, role switching, imports, and shared-dependency indirection
cannot lower the floor.

Source:
[active proportional-review requirement](../../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md#requirement-publication-review-is-proportional-and-independent-where-required).

Those clauses conflict: if only the latest editor is excluded, an earlier
author can review their own surviving protected work after another person makes
one final edit. The later implementation-bearing OpenSpec must replace the
latest-editor wording. This research file does not mutate OpenSpec.

### D23 defines the composition boundary

D23 says the source defines materiality and conflict; the candidate aggregates
the strictest source facts; lineage and identity are immutable/server-derived;
routing grants no authority; material/identity/source changes stale review;
unknown blocks; and review alone has no public or financial effect.

Source:
[D23 corrected decision](./phase-24-d23-source-owned-proportional-independence-adversarial-review.md#corrected-decision).

**Consequence:** D24 defines participant lineage and the conflict predicate. It
does not become a workflow, permission, notification, content-classification,
publication, or activation engine.

### AI remains human-bound

The platform-boundaries spec says an AI assistant acts within the initiating
human's authority, cannot bypass approval, stops at the same human approval
gate, and attributes the resulting action to the approving human.

Source:
[AI Assistant Authority Is Bounded By The Initiating User](../../../openspec/specs/platform-boundaries/spec.md#requirement-ai-assistant-authority-is-bounded-by-the-initiating-user).

**Consequence:** AI cannot be the different human. The human who accepts a
material AI result participates; where a separately attributable human created
an accepted tracked instruction/suggestion, both can participate.

### Current runtime does not implement D24

Current public CMS resolution still returns `siteId: null` at the reserved Site
seam, and current staff capabilities remain the broad MVP set. A bounded source
search found no operational Default Site Locale Plan, floor evaluator,
material-participant lineage, or D24 conflict command.

Sources:
[current public tenant resolver](../../../apps/admin/src/cms/public/resolve-tenant.ts)
and [current broad MVP permission map](../../../packages/auth/permissions.ts).

## Current primary external evidence

### NIST — explicit, authorized, privacy-minimized proof

[NIST SP 800-53 Rev. 5.1](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
AC-5 requires documenting duties that require separation and defining access
authorization to support it. AU-3 requires audit event type, time, location,
source, outcome, and associated identities, while warning about privacy risk
and unnecessary audit detail.

This supports explicit candidate-bound conflict, durable identity/event proof,
and body-free/minimized audit. It does not define Core materiality, require a
second human for ordinary work, infer collusion, or authorize an admin bypass.

### Blackbaud — nonprofit software does not prove a universal rule

[Blackbaud Financial Edge NXT Payment Assistant](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-payment-assistant-settings-tiers.html)
recommends separating payment-run creation and approval, but explicitly permits
one person to hold both responsibilities.

This is useful contrary evidence: a current nonprofit system does not establish
“exclude every participant” as a universal industry default. Core's D24 rule is
justified only for the exact protected sources whose D23 contract requires a
different human. It must not be copied into ordinary content, Giving, or
financial workflows by analogy.

### GitLab — every contributor and the rebase weakness

[GitLab approval settings](https://docs.gitlab.com/user/project/merge_requests/approvals/settings/)
can prevent every user who adds commits from approving. The same page warns a
rebase can rewrite committer history and make a prior committer eligible.

This supports all-contributor exclusion and proves mutable transport history is
too brittle for Core. Core needs immutable application lineage that rebase,
squash, copy, or import cannot erase. Git commits/emails are not Core identity.

### GitHub — latest pusher is explicitly a compromise

[GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
describe “someone other than the last pusher” as a compromise and say dismissing
stale approvals is safer when hijacking is a concern.
[GitHub required reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews)
say authors cannot approve and code-modifying commits can stale approval, while
some administrator configurations can bypass.

This supports exact-candidate staleness and shows latest-editor exclusion is
not equivalent to candidate-wide independence. Core must not import admin
bypass, VCS authorship, or a universal code-review workflow.

### GitHub suggestions — proposer and accepter can both author

[GitHub incorporating feedback](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/incorporating-feedback-in-your-pull-request)
says applied suggestions create a commit; each included suggester is a
co-author, and the accepter is co-author and committer.

**Product judgment:** Core should preserve both humans for an accepted tracked
material suggestion. General comments/request-changes do not participate. Core
does not infer off-platform authorship from copy/paste or writing style.

### Google Drive — edits can reset exact-content approval

[Google Drive approvals](https://support.google.com/drive/answer/9387535)
can require every approver to review the same content, in which case edits and
unlocking during active review reset approvals.

This supports exact-candidate review and staleness. Core must not make protected
edit-reset optional or treat a whole-file lock as its domain model.

### Contentstack and Contentful — useful UX, unsafe bypasses

[Contentstack workflows](https://www.contentstack.com/docs/headless-cms/add-workflows-and-stages)
offer Prevent self-advancement for the person who moved an entry into a stage
and require two unique approvers, but owners/admins/superusers can bypass stage
editing/movement restrictions.

[Contentful workflow permissions](https://www.contentful.com/help/ai-automations/workflows/workflows-roles-and-permissions/)
say workflow permission complements space permission and explicit deny wins.

This supports early impossible-state feedback and separation of routing from
authority. Core must not import stage-mover-only conflict, role-as-human,
superuser bypass, or a tenant-built workflow engine.

### RFC 7643 — stable, non-reassignable identity

[RFC 7643 §3.1](https://datatracker.ietf.org/doc/html/rfc7643#section-3.1)
requires a service-provider-issued resource ID to be unique, stable,
non-reassignable, unchanged across requests, and not client-supplied.

This supports opaque stable comparison instead of email/name/profile/session.
It does not prove one external resource equals one real human or define Core's
Party merge/split semantics.

### W3C and GOV.UK — explain before the effect

[WCAG Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)
requires enough visible instruction without excessive clutter.
[WCAG Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html)
requires known correction help unless security/purpose would be harmed.
[WCAG Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)
requires programmatic, non-focus-stealing status and warns against assertive
announcements for ordinary updates.
[GOV.UK buttons](https://design-system.service.gov.uk/components/button/)
recommend one clear action label and server-side protection against duplicate
submission.

This supports a visible pre-edit handoff warning, safe reason, one next action,
polite stale-state announcement, and an idempotent server command.

## Strongest alternative comparison

| Choice                                | Strongest case                                                                       | Material defect for Core                                                                               | Disposition              |
| ------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------ |
| Exclude latest editor                 | lowest handoff cost; documented GitHub compromise                                    | earlier authors can review surviving protected work; contradicts Phase 12/17 and anti-splitting intent | Reject and replace       |
| Exclude every substantive participant | candidate-wide independence; governing Core choice; credible all-contributor pattern | brittle unless materiality, lineage, identity, reverts, staleness, and recovery are exact              | Accept with amendments   |
| Exclude each edited subgraph          | theoretically maximizes reviewers                                                    | requires partial approvals/graph combination for one atomic Plan and an unstable UX                    | Reject as overengineered |

The strongest alternative solves only “someone other than the final editor
looked.” It does not solve independent review of the whole protected candidate.

## Exact recommended D24 contract

### D24-R1 — one closed definition

A **substantive participant** is a stable human principal for whom an applicable
source proves at least one accepted material-participation event in the exact
candidate lineage and review epoch. Missing, incompatible, or corrupt proof is
indeterminate at D23 and blocks. There is no caller Boolean, score, confidence,
free-form reason, or administrator assertion.

### D24-R2 — union over the complete candidate

When D23 returns **different human required**, the reviewer must be absent from
the union of every source participant set for the exact Plan candidate, every
included Page/Navigation head, protected locale variant, shared protected
dependency/source pin, default-change basis, publication/safety candidate, and
review epoch/evaluator generation.

Unrelated Sites, locales, drafts, Pages, routes, comments, or abandoned
candidates do not enter the union. Scope is exact, not Tenant-wide guilt.

### D24-R3 — sources own materiality

Each consequence owner publishes a versioned closed registry of accepted
mutation kinds and materiality tests. The Plan composes but cannot reinterpret.

Potentially material effects include protected wording/meaning; actions,
warnings, destinations, accessible equivalents; public structure/Navigation;
locale/fallback; shared assets/layout/dependencies; default target/root basis;
safety/privacy/identity/sender/rendering; and candidate/dependency/compiler or
policy basis.

The source proves the accepted effect. Transport writes, timestamps, autosave
heartbeats, formatting churn, and display-only metadata are not material merely
because a row changed.

### D24-R4 — attribution taxonomy

| Behavior                                          | Participant effect                                                                             |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Author/materially edit protected content          | authenticated author/editor participates                                                       |
| Materially change Plan/default target             | actor participates when source classifies it material                                          |
| Change included protected dependency              | dependency actor participates in carrying candidates                                           |
| Submit tracked suggestion                         | no participation until accepted                                                                |
| Accept tracked material suggestion                | proposer and accepter participate when provable humans                                         |
| Accept material AI result                         | accountable human participates; AI never reviews                                               |
| Accept material import                            | accepter and trusted mapped human author participate                                           |
| Deterministic automated migration                 | service origin recorded; carried humans remain; service neither participant-human nor reviewer |
| Read/preview/comment/route/request review/changes | no participation                                                                               |
| Rejected proposal/import/AI result                | no candidate participation                                                                     |
| Server-proved semantic no-op                      | no participation                                                                               |
| Accepted material event later reverted in lineage | original actor and reverter remain participants                                                |

### D24-R5 — source-specific semantic no-op proof

A no-op requires unchanged authoritative protected semantic digest, dependency
graph, action meaning, accessibility-equivalent output, and candidate basis
under compatible evaluator versions. Save-without-change and deterministic
canonicalization can qualify when proved.

Whitespace, punctuation, alt text, bidi marks, labels, URLs, or ordering cannot
be globally harmless; they may change meaning, accessibility, navigation,
rendering, or security.

### D24-R6 — reverts and history rewrites cannot launder

An accepted material event remains in that candidate lineage after an inverse
edit; the inverse actor also participates. Successors inherit every participant
whose material source effect/dependency they carry. Squash, rebase, copy,
clone, export/import, restore-as-draft, or migration cannot reset the set.

A person may be absent only from a genuinely new candidate whose source proves:

1. an independently identified clean base without the discarded lineage;
2. none of that person's material effects/dependencies are carried;
3. it is not a history rewrite of the dirty candidate; and
4. every human who materially constructs/accepts the new candidate is added.

### D24-R7 — suggestions without punishing discussion

Comment, request changes, tracked exact suggestion, accept/apply, and direct
edit remain distinct. Comments/general guidance do not participate. Accepted
tracked material suggestions preserve proposer and accepter. A reviewer who
directly edits protected content becomes a participant and hands review off.

Core does not infer authorship from private conversations, copy/paste, style,
or semantic similarity. Deliberate collusion remains outside what a two-person
control can eliminate without invasive surveillance.

### D24-R8 — AI/import/migration never erase humans

AI/service identities are not independent humans. The human invoking/accepting
a material assistant result participates; a separately attributable human who
created an accepted tracked instruction also participates. Editorial import or
migration acceptance adds the human. Deterministic transforms retain prior
lineage and transformer generation. Unattributed future material mutation fails
closed. Legacy content receives no guessed person or fictional proof.

### D24-R9 — identity aliases are monotonic

Compare the final Phase 12 canonical stable human principal, not profile,
membership, email, display/alias, login, session, browser, role, assignment,
support identity, or route member.

- Account links and Party/principal merges union participation.
- A merge stales favorable review if reviewer becomes a participant.
- Split/unlink never automatically manufactures independence.
- Deletion/anonymization retains a non-reassignable opaque conflict key and
  required evidence without unnecessary names/emails.
- Unresolved correlation is indeterminate and blocks.

Historical evidence is append-only; correction evidence never rewrites history.

### D24-R10 — changes stale review

Accepted material mutation, participant digest, source/dependency/head,
evaluator generation, identity correlation, reviewer authority/step-up,
policy strengthening, candidate composition/default basis, or validation
failure stales or re-evaluates before effect. Policy relaxation and identity
splitting never make an in-flight candidate easier; use a fresh candidate.

### D24-R11 — atomic server proof

The command re-proves trusted Tenant/environment/Site/Plan/candidate/epoch;
source heads/dependency digest; D23/evaluator/policy versions; participant
digest/canonical identity epoch; reviewer absence; current assignment,
capabilities, visibility and step-up; expected head/CAS; and semantic
idempotency.

One winner writes one immutable receipt. Same-key/same-meaning retry returns the
same effect. Different candidate/actor/digest/meaning rejects. Failure creates
no completion and no public effect.

### D24-R12 — normalized data and authorization

Retain immutable candidate/source/dependency identity; source material events;
normalized candidate-participant projection keyed by canonical human;
evaluator/identity generations and digest; review receipt/conflict proof; and
privacy-safe reason projection—not caller-editable JSON.

Every relationship has same-scope Tenant/environment/Site/candidate keys or
equivalent composite constraints, restrictive delete behavior, and indexed FK/
resolution paths. Browser roles cannot write lineage/receipts. RLS `USING` and
`WITH CHECK`, grants, views, RPCs, functions, workers, service roles, Payload,
imports, support, repair, and migrations preserve the same boundary. Actor,
author, accepter, scope, materiality, and attribution are server/source facts.

This is a conceptual contract, not authorization to freeze table names before
the source inventory and Phase 12 identity manifest.

### D24-R13 — privacy-minimized explanation

Ordinary UI shows only whether the current person can act, a safe source reason,
whether editing hands off review, what remains Live, and one lawful next action.
It does not expose other participants, aliases, permissions, engagement, merge
history, or protected reasons without narrower audit permission.

Audit uses opaque keys/reason codes; display names resolve through current
allowed projection. Logs/metrics/traces/exports/errors contain no protected
bodies, emails, legal names, donor/missionary facts, credentials, or unrestricted
participant lists.

### D24-R14 — no effect expansion

D24 only subtracts reviewer eligibility. It grants no authority; creates no
task, route, reminder, email, quorum, deadline, or workflow; activates/publishes
nothing; exposes no draft publicly; and never affects Giving, Legal Entity,
Stripe, settlement, bank, currency, contribution, receipt, ledger, or
accounting identity. Current public state remains unchanged while blocked.

## Source of truth and invariants

| Fact                            | Authoritative owner     | D24 may retain                                       | D24 must not own                            |
| ------------------------------- | ----------------------- | ---------------------------------------------------- | ------------------------------------------- |
| Page mutation/materiality       | Page/publication source | immutable event reference, typed result, safe reason | editable Page truth or duplicate classifier |
| Navigation mutation/materiality | Navigation source       | immutable event reference, typed result              | Navigation content or route authority       |
| Protected publication lineage   | Phase 17 source         | exact candidate reference and participant proof      | message body, publication head, or sending  |
| Plan candidate composition      | D17 source              | included heads and lineage digest                    | underlying Page/Navigation truth            |
| Human identity correlation      | Phase 12/Party owner    | opaque canonical key and epoch                       | email/name identity or editable merge truth |
| Review responsibility           | D21/D22 route           | attention reference                                  | authority or independence                   |
| Review receipt                  | exact source command    | immutable candidate/actor/conflict proof             | publication or activation authority         |
| Public default activation       | D16 command             | review reference if required                         | activation itself                           |

The following invariants must always hold:

1. Every future accepted material mutation has one trusted source event and an
   attributable origin class.
2. Every attributable human maps to one canonical non-reassignable conflict
   identity at evaluation time.
3. Candidate participants are the union over the complete dependency graph.
4. The set grows monotonically inside one candidate lineage; inverse edits do
   not delete events.
5. A successor carries participant lineage for every carried material effect.
6. A review binds one candidate, epoch, participant digest, reviewer, evaluator
   set, and authority proof.
7. The protected reviewer is absent from the participant set at atomic commit.
8. Participant membership grants no view/edit/route/review/publish authority.
9. Route membership never alters participation or independence.
10. Accounts, roles, assignments, aliases, support modes, or identity splits
    cannot turn one human into two.
11. Unknown lineage/identity cannot produce a favorable result.
12. Evidence is append-only and body-free; repair rolls forward.
13. D24 has zero public and zero financial effect.

### Candidate versus review epoch

A review epoch is not a lineage reset:

- requesting review opens an epoch over the current candidate;
- a material edit creates a successor head and stales the epoch;
- the successor carries retained participant lineage;
- requesting review again opens an epoch over the successor; and
- removing a participant requires genuinely clean source lineage, not a new
  route, request, or epoch number.

## Tricky-case rulings

| Case                                                       | Permanent ruling                                                                  | Why                                                                |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Open/read/preview                                          | not participant                                                                   | viewing is not authoring                                           |
| Comment/request changes                                    | not participant                                                                   | review needs discussion without disqualification                   |
| Exact tracked suggestion accepted                          | proposer and accepter participate                                                 | both authored/chose accepted effect                                |
| Untracked chat suggestion pasted                           | only provable editor recorded                                                     | no surveillance or invented authorship; collusion remains residual |
| Autosave heartbeat/no semantic change                      | no participation                                                                  | transport is not materiality                                       |
| Change undone before authoritative acceptance              | no participation                                                                  | no event entered lineage                                           |
| Accepted edit later reverted                               | original actor and reverter remain                                                | prevents edit/revert laundering                                    |
| Restore prior reviewed version as draft                    | clean-base lineage retained; restorer participates if creation choice is material | restore is attributable, not clear-history                         |
| Copy/squash/rebase dirty candidate                         | preserve set                                                                      | representation cannot lower control                                |
| Abandon dirty candidate; start from proved clean Live base | discarded lineage may be absent; new material actors included                     | permits honest recreation, not reset button                        |
| AI proposal accepted                                       | accountable human participates; AI cannot review                                  | human-bound authority                                              |
| Different prompter and accepter, both tracked              | both participate                                                                  | both shaped/accepted effect                                        |
| Deterministic migration                                    | service origin recorded; humans carried; service cannot review                    | automation is not a second person                                  |
| Human chooses lossy import/migration outcome               | human participates                                                                | editorial acceptance changes result                                |
| Imported author known only by email                        | correlate through trusted identity or unresolved                                  | email is mutable and private                                       |
| Reviewer fixes “tiny” protected typo                       | hand off if source says material                                                  | consequence, not diff size, controls                               |
| Reviewer performs proved no-op                             | remains eligible                                                                  | protected meaning unchanged                                        |
| Shared dependency changed                                  | dependency actor participates through fan-out                                     | indirection cannot lower floor                                     |
| Same human uses another account                            | remains participant                                                               | canonical identity                                                 |
| Identities merge before effect                             | union and stale conflicting review                                                | stricter truth wins                                                |
| Merge discovered after activation                          | append correction/incident; owner decides safe forward repair                     | history stays honest; latent bypass visible                        |
| Identity split/unlink                                      | no automatic widening                                                             | split cannot bypass                                                |
| Participant leaves Tenant                                  | remains provenance; loses current authority separately                            | history and permission differ                                      |
| No eligible reviewer                                       | honest blocked state; D25 recovery; current Site stays                            | never auto-approve/timeout/admin bypass                            |
| Two reviewers race                                         | one source CAS winner                                                             | source completion, not item state, is truth                        |

## Staff UX contract

### Stable language

Avoid “maker-checker,” “segregation of duties,” “participant digest,”
“principal,” “predicate,” “self-approval,” and permission codes. Use:

- **You can review this version**
- **Another person must review this version**
- **Editing will hand off this review**
- **Review requirements changed**

### Qualified reviewer

> **You can review this version**  
> You did not make a protected change included in this version. Review the
> planned change before its next step. The live website is unchanged.

Actions:

- **Complete review**
- **Request changes**

If this is D17's separately authorized activation seam, its action must state
the public consequence, such as **Review and make French (Canada) default**.

### Current user participated

> **Another person must review this version**  
> You made a protected change included in this version. The live website stays
> unchanged until a qualified person reviews the current version and the
> separate activation succeeds.

Show **Choose review options** when authorized, otherwise **Ask a Website
administrator**. Never leave a disabled review button as the explanation or
reveal colleagues' unread/permission state.

### Reviewer attempts a material edit

Warn before save:

> **Editing will hand off this review**  
> This change affects protected content. If you save it, you will no longer be
> able to complete the independent review for this version. Nothing will be
> published.

Actions:

- **Edit and hand off review**
- **Keep reviewing**

Offer **Request changes** without disqualification. If exact tracked
suggestions exist, disclose before submission that acceptance makes the
proposer a contributor; never hide that in a tooltip.

### Accepted suggestion changes eligibility

> **Another reviewer is needed**  
> Ana's suggested change is now included in this version, so someone else must
> review it. The live website is unchanged.

Announce this politely without focus theft; it is not a danger alert.

### No qualified internal reviewer

> **Another reviewer is required**  
> Everyone currently able to review this version helped make a protected
> change. Your current website remains unchanged.  
> **View review options**

D24 itself does not promise an invitation. D25 now permits that action only when
every applicable source and the current authorization proof allow it. No
recurring reminder or email is created by default.

### Privacy and accessibility

- Tell a person about their own participation.
- Show names/events/identity corrections only with narrower audit permission.
- Resolve display names at read time; do not persist them as conflict truth.
- Public visitors, donors, and missionaries see no workflow existence.
- Use Base Maia, visible text, one obvious primary action, keyboard focus, and
  polite programmatic status.
- Prove 320 CSS pixel/400% reflow, screen reader, high contrast, forced colors,
  reduced motion, RTL, CJK, combining characters, long names/locales, and weak
  network behavior.
- Never optimistically mark review complete; retry is server-idempotent.

Sources:
[Core platform principles](../../../openspec/specs/platform-principles/spec.md),
[WCAG Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html),
[WCAG Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages),
[WCAG Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html),
and [GOV.UK buttons](https://design-system.service.gov.uk/components/button/).

## Failure, concurrency, and idempotency

| Race/failure                              | Required result                                                        |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| Review vs material edit                   | one head/CAS winner; old review never applies to successor             |
| Review vs accepted suggestion             | digest/participant change defeats or stales review atomically          |
| Review vs identity merge                  | identity epoch defeats favorable review if conflict appears            |
| Review vs authority loss                  | current assignment/capability/step-up defeats review                   |
| Two reviewers                             | one source occurrence/receipt; loser sees completed                    |
| Duplicate click/retry                     | same semantic key returns same business effect                         |
| Same key, different meaning               | reject                                                                 |
| Evaluator deploy mid-review               | incompatible generation blocks/stales; compatible manifest is atomic   |
| Projection lags source                    | authoritative source/event position wins; stale absence proves nothing |
| Event write succeeds, projection fails    | blocked/indeterminate; repair replays idempotently                     |
| Receipt commits, response lost            | retry returns same receipt                                             |
| Identity repair finds historical conflict | append correction/security evidence; block next effect; no rewrite     |
| Audit write fails                         | protected command fails atomically; public state unchanged             |
| Rollout disabled                          | stop new commands; preserve evidence/public state; repair forward      |

## Proof required before implementation is complete

### Positive and lineage proof

1. A qualified human absent from the union reviews an exact candidate.
2. Maria and Ana are both rejected after both materially contributed; a third
   human succeeds.
3. Read/preview/comment/route/request-changes do not add participants.
4. Source-proved no-op does not add a participant.
5. Accepted tracked material suggestion adds proposer and accepter.
6. Accepted AI result adds accountable human, never AI reviewer.
7. Human-approved import adds accepter and trusted mapped author.
8. Shared dependency contributor joins every carrying candidate.
9. Earlier contributor remains rejected after another person's latest edit.
10. Accepted edit/revert retains both actors.
11. Squash/rebase/copy/clone/restore/export-import/role/route/new epoch cannot
    clear carried lineage.
12. Proved clean-base successor omits only discarded lineage and adds new actors.

### Authorization and negative proof

13. Alternate accounts/emails/profiles/roles/assignments/aliases/sessions/
    support/impersonation/View as cannot manufacture independence.
14. AI/service/automation/shared/support identities cannot satisfy human review.
15. Caller actor/author/accepter/material/set/identity/scope/reason/result is
    rejected or ignored.
16. Unknown mutation classification or identity correlation has no favorable
    path.
17. Administrator status does not bypass.
18. Route neither adds/removes participants nor grants authority.
19. Reviewer material edit updates lineage and removes their review action
    before completion.
20. Policy/evaluator/source/dependency/identity/authority changes stale exactly.

### Tenant, database, migration, and rollout proof

21. Cross-Tenant/environment/Site/Plan/candidate/source/epoch poison fails via
    browser, RPC, view, worker, service, Payload, import, support, repair, and
    migration.
22. Composite constraints prevent wrong-scope relationships.
23. RLS `USING`/`WITH CHECK`, grants, and immutable commands prevent scope moves.
24. Browser roles cannot write lineage/receipts.
25. Every FK/union query has production-shaped index proof.
26. Missing projections/audits fail closed and replay idempotently.
27. Migration infers no person from display name, email, role, permission,
    route, notification, or VCS metadata.
28. Legacy unproven lineage remains honestly unproven.
29. Old/new code-schema combinations cannot produce favorable review.
30. One compatible generation activates atomically; rollback preserves evidence.

### UX, accessibility, and privacy proof

31. Staff predict whether reading, commenting, suggesting, accepting, or
    editing changes eligibility.
32. Reviewer sees handoff consequence before material edit.
33. Participant sees one safe reason and lawful next action.
34. Ordinary surfaces leak no peer aliases, permissions, engagement, source
    secrets, or identity repair history.
35. Public/donor/missionary surfaces expose no candidate/participant existence.
36. Keyboard, screen reader, reflow, contrast, forced colors, RTL, long text,
    weak network, stale page, duplicate click, and concurrency paths pass.
37. Async changes announce once, politely, without focus theft.
38. Representative small/multilingual/restricted teams understand that review
    alone does not necessarily change the Live Site.

## Named production and release signals

| Signal                                                    |                                                                             Threshold | Owner                          | Required response                                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------: | ------------------------------ | -------------------------------------------------------------------------------------- |
| `site_plan_protected_review_by_participant_total`         |                                                                                   any | Site Security + source         | fence seam, preserve receipts, reconcile all affected candidates, require fresh review |
| `site_plan_latest_editor_shortcut_accept_total`           |                                                                                   any | Site Platform                  | stop rollout, replace shortcut with full union, reconcile receipts                     |
| `site_plan_unclassified_material_mutation_total`          |                                                                                   any | source owner                   | mark indeterminate, quarantine evaluator, classify/test before re-enable               |
| `site_plan_participant_projection_mismatch_total`         |                                                              any authoritative sample | Site Data + source             | stop favorable projection use, replay events, repair digest/index                      |
| `site_plan_edit_revert_lineage_loss_total`                |                                                                                   any | Site Security                  | disable transition, reconstruct lineage, re-review candidates                          |
| `site_plan_identity_merge_conflict_total`                 |                                  any pending/completed favorable review before effect | Identity + Security            | stale/fence, union identities, require review, investigate bypass                      |
| `site_plan_nonhuman_independent_reviewer_total`           |                                                                                   any | Security + Identity            | disable path, invalidate proof, require human review                                   |
| `site_plan_stale_participant_digest_commit_total`         |                                                                                   any | Site Platform                  | stop command, preserve public state, reconcile CAS                                     |
| `site_plan_participant_pii_in_log_total`                  |                                                                                   any | Privacy + Observability        | stop sink, contain disclosure, replace with opaque keys                                |
| `site_plan_reviewer_edit_handoff_rate`                    | cohort baseline; sustained statistically significant increase plus confusion evidence | Site Product + Design          | inspect copy/classification; fix affordance; do not weaken floor merely to lower rate  |
| `site_plan_no_eligible_independent_reviewer_active_total` |                                      any state lacking one visible lawful next action | Tenant Website owner + Product | expose D25-authorized recovery/current-safe options; never auto-approve/email          |
| D24 comprehension protocol                                |               below 90%, or anyone thinks role/account switching creates independence | Product Design + Security      | revise copy/examples and repeat research before rollout                                |

Zero-tolerance thresholds protect structural invariants. The 90% target is a
Core release judgment, not an external statistic. Performance, cardinality,
retention, and aging thresholds require production-shaped measurement.

## Assumptions and unresolved unknowns

### Verified repository facts

- Phase 12/17 exclude every substantive author/editor.
- Active OpenSpec uses weaker latest-editor wording.
- D23 requires source materiality, stable identity, exact candidate, fail-closed
  behavior, and no public/financial effect.
- Phase 17 owns one narrow delegated-review path for its source.
- Current runtime lacks D24.

### Product judgments

- Accepted material reverts retain both actors within the lineage.
- Accepted tracked suggestions attribute proposer and accepter.
- A clean-base successor omits discarded lineage only under D24-R6 proof.
- Identity splitting never widens an in-flight candidate.
- Ordinary UI shows consequence/next action, not participant names.

### Assumptions to test

- Staff understand “protected change” when given the safe source reason.
- Direct reviewer editing is uncommon enough for deliberate handoff.
- Solo ministries can preserve the safe current Site while using a bounded
  candidate-scoped review path.
- Staff prefer request-changes/suggestion over accidental eligibility loss.

Test one-person, two-person, multilingual, multi-Site, low-bandwidth, and
restricted-worker ministries—not only technical CMS administrators.

### Unresolved unknowns

- Exact material mutation registry for each Phase 24 source.
- Final Phase 12 human key and merge/split correction protocol.
- Whether Phase 24 supports structured suggestions.
- Which sources besides Phase 17 authorize external delegation.
- Permission-safe reason projections.
- Legacy/fresh-candidate treatment per CMS source.
- Production lineage/dependency/concurrency cardinalities and retention.
- Translated comprehension in every launched locale.

These do not invalidate Option 2. They block implementation claims until the
source inventory, closed D25 contract and source adapters, identity substrate,
and proof exist.

## Required order of work

1. Record D24 and its exact source-owned definition.
2. Correct active OpenSpec latest-editor wording before implementation.
3. Carry the closed D25 recovery contract forward; create no admin bypass.
4. Land Phase 12 canonical human/merge/split epoch contract.
5. Inventory/version every source's material, no-op, suggestion, AI/import,
   migration, revert, and privacy rules.
6. Define immutable lineage, normalized projection/digest/receipt, composite
   constraints, indexes, grants, RLS, and atomic command.
7. Prototype ordinary, participant, edit-handoff, suggestion, stale,
   identity-merge, and no-reviewer Base Maia journeys; test ministries.
8. Implement red-green source command/reducer/evaluator/review/recipient/
   activation tests.
9. Migrate without inferred people or fictional proof.
10. Cohort-activate one compatible generation, monitor zero-tolerance signals,
    and repair forward.

## Final research disposition

**Accept with required amendments.**

Option 2 matches Phase 12/17; prevents latest-editor, edit/revert, history,
role, alias, import, and dependency laundering; gives staff one memorable rule;
preserves discussion/no-ops; retains source ownership; and leaves the current
Site and all Giving/finance boundaries unchanged while blocked.

It is acceptable only with D24-R1 through D24-R14, especially immutable
source lineage, semantic no-op proof, suggestion attribution, monotonic identity
merge behavior, stale-review/CAS proof, privacy-minimized UX, and D25 recovery.

## Historical D25 decision input — resolved

D25 is now closed. The founder selected source-authorized, exact candidate-
scoped external review without standing Tenant access. The hardened contract is
recorded in the
[D25 adversarial review](./phase-24-d25-candidate-scoped-external-reviewer-adversarial-review.md)
and
[ADR-0181](../../adr/0181-source-authorized-candidate-scoped-external-review.md).
The original question and options remain below as historical decision input.

### Why this was asked

D24 makes protected review stronger. In a one-person ministry—or when every
qualified person helped prepare the candidate—no internal reviewer remains.
Core needs a lawful, clear path without weakening the rule or creating a dead
end. Phase 17 already authorizes a narrow candidate-scoped delegate for its own
source; D25 must not silently generalize that authority.

### Hope example

Maria is Hope's only Website staff member. She materially changes protected
Navigation in the French default Plan. D24 correctly prevents her review. The
current English Site remains Live. What should Maria do next?

### Option 1 — exact candidate-scoped external reviewer — recommended

Where **every applicable source explicitly supports delegation**, Maria may
invite one verified distinct human for only this immutable candidate. Bind
Tenant, Site, source/candidate/dependency digest, safe reasons, action, identity,
expiry, revocation, and step-up. Show only synthetic minimized before/after
evidence. The reviewer cannot edit, re-delegate, see unrelated data, gain
standing membership, or approve a successor. If any source lacks the contract,
the candidate stays honestly blocked.

**UX impact:** one clear **Invite a reviewer** action, focused one-time review,
and no Mission Control membership sprawl. Cost: identity verification and
source-by-source proof.

### Option 2 — internal qualified staff only

Maria must fully onboard another staff member through Phase 12 before review.

**UX impact:** smallest special surface, but heavy onboarding for one review and
a hard block for ministries without another staff member.

### Option 3 — admin/emergency same-human exception

Allow Maria or a super administrator after warning/reason/step-up.

**UX impact:** fastest, but destroys D24. Phase 17's safe emergency behavior is
to restore a compatible default or prior independently reviewed last-known-good
version—not approve novel protected work.

### Recommendation and exact question

**Recommend Option 1 — one source-authorized exact candidate-scoped external
reviewer.** It serves solo ministries while keeping different-human review real,
private, expiring, and non-transferable.

Do you choose **Option 1**, or **Option 2 — internal staff only**? Option 3
should be rejected because it invalidates D24.

### Closure

D25 accepted Option 1 with required amendments. Exactly one current external
invite or grant is candidate-scoped, source-authorized, expiring, revocable,
and non-reusable. D26 now closes when that option may appear despite an
eligible internal reviewer. D27 now closes one source-owned responsibility lane
with deliberate takeover. D28 now closes explicit decline/expiry next-lane
recovery; D29 next decides its bounded recovery-responsibility route.

## Primary source index

### Core

- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
- [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
- [Phase 12 permissions](./phase-12-full-role-permission-configuration.md)
- [Phase 17 System Messages](./phase-17-system-messages-template-management.md)
- [Phase 17 D11 traceability](./phase-17-decision-test-traceability-2026-07-19.md)
- [active outbound-communications delta](../../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md)
- [D16 Site root](./phase-24-d16-locale-neutral-site-root-adversarial-review.md)
- [D17 private Plan](./phase-24-d17-private-default-site-locale-plan-adversarial-review.md)
- [D20 review episodes](./phase-24-d20-every-review-required-episode-adversarial-review.md)
- [D21 routing](./phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md)
- [D22 co-responsible reviewers](./phase-24-d22-small-co-responsible-reviewers-adversarial-review.md)
- [D23 research](./phase-24-d23-source-owned-proportional-independence-primary-research.md)
- [D23 adversarial review](./phase-24-d23-source-owned-proportional-independence-adversarial-review.md)
- [Core glossary](../../../CONTEXT.md)
- [current public resolver](../../../apps/admin/src/cms/public/resolve-tenant.ts)
- [current permissions](../../../packages/auth/permissions.ts)

### External official sources

- [NIST SP 800-53 Revision 5.1](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
- [Blackbaud Payment Assistant approval tiers](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-payment-assistant-settings-tiers.html)
- [GitLab approval settings](https://docs.gitlab.com/user/project/merge_requests/approvals/settings/)
- [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub pull-request reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews)
- [GitHub incorporating feedback](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/incorporating-feedback-in-your-pull-request)
- [Google Drive approvals](https://support.google.com/drive/answer/9387535)
- [Contentstack workflows](https://www.contentstack.com/docs/headless-cms/add-workflows-and-stages)
- [Contentful workflow permissions](https://www.contentful.com/help/ai-automations/workflows/workflows-roles-and-permissions/)
- [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-3.1)
- [WCAG Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)
- [WCAG Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html)
- [WCAG Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)
- [WCAG Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [GOV.UK buttons](https://design-system.service.gov.uk/components/button/)
