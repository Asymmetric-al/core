# Phase 24 D34 — Conditional Return Recovery Context

**Status:** Founder choice pressure-tested and recorded as Reserved  
**Decision:** When a responsibility transition may ask a staff member for
context, what that context means, and how it may be used  
**Review date:** 2026-08-28  
**Scope:** D31 Website correction work, D33 source responsibility transitions,
and the smallest reusable contract needed by the future shared Tasks Hub

## Final disposition

**Accept Option 1 with required amendments.**

Context should be collected only when a current, recipient-initiated return
would create source-owned **Needs assignment**. It is unnecessary for a named
handoff or a return that leaves another responsible person, because the source
already knows the action, predecessor, destination when present, exact scopes,
and resulting responsibility generation.

The provisional four-choice list is too overlapping. **Not the right person**
and **Needs a different role** ask staff to distinguish responsibility from
capability and role modeling, even though those are source and authorization
facts. D34 therefore narrows the interaction to three code-owned choices whose
only purpose is to give an authorized recovery user different guidance:

1. `responsibility_mismatch` — **This work belongs with someone else**;
2. `cannot_take_current_work` — **I can't take this work**; and
3. `other` — **Something else**.

There is no default, free text, optional note, second reason, attachment,
mention, Tenant-authored value, AI classification, or automated consequence.
If representative evidence does not show that these choices improve recovery,
the permanent fallback is to collect no context—not to grow a taxonomy.

## Exact corrected decision

> D34 adopts **context only when recovery changes** for the D31 Website source
> contract.
>
> A named handoff SHALL collect no reason or note. A return that leaves at
> least one other current responsible recipient for every selected action scope
> SHALL collect no reason or note. Only an explicit recipient-initiated return
> whose fresh authoritative preview and expected-head commit would leave one or
> more exact Source-action scopes in source-owned **Needs assignment** SHALL
> require one actor-selected **Return recovery context**.
>
> The staff member SHALL answer **What is the main reason you're returning this
> work?** by choosing exactly one value from the closed, code-owned
> `source_return_recovery_context@1` vocabulary:
>
> - `responsibility_mismatch` — **This work belongs with someone else**;
> - `cannot_take_current_work` — **I can't take this work**; or
> - `other` — **Something else**.
>
> No choice is selected by default. **Something else** reveals no text field.
> D34 collects no explanation, note, attachment, mention, copied D30 feedback,
> custom value, or secondary reason. The user sees the exact affected scopes,
> the fact that nobody will remain responsible, the authorized recovery
> destination, the selected label, and the consequence before the single
> **Return for reassignment** command.
>
> The chosen code proves only what the actor selected at that time. It does not
> prove that a prior assignment was objectively wrong; that the actor lacks
> skill, willingness, capacity, availability, health, or performance; that a
> specific role is needed; that nobody is eligible; or that another person or
> route is correct. The source derives all authoritative state.
>
> `responsibility_mismatch` may cause the authorized recovery surface to
> recommend reviewing the current responsibility mapping before assigning an
> eligible person. `cannot_take_current_work` may recommend arranging another
> eligible owner without asking why. `other` provides generic inspect-and-
> assign guidance. No context code may change eligibility, routing,
> authorization, priority, urgency, due date, reminder, escalation,
> notification, completion, publication, Giving, finance, or any employee or
> member-care judgment.
>
> One expected-head source transaction SHALL derive the actor and resulting
> responsibility state, validate the exact code and contract version, append
> the immutable source transition and receipt, and record identifier-only
> projection intent. Context is null for every non-gap result. The code,
> version, and exact gap-scope digest participate in canonical idempotency.
> Same key and same meaning returns the original receipt; a changed code,
> scope, or result conflicts.
>
> Tasks Hub may invoke the source command and reference the receipt, but it does
> not store or interpret the context. The code is not a task comment,
> dismissed/suppressed reason, Support Hub move reason, notification field,
> workflow-event payload, analytics dimension tied to a person, or generic
> cross-domain taxonomy. Payload, AI, and Inngest are not owners or consumers.
>
> The Website source contract pins this vocabulary version. Future sources,
> including Mobilize, do not inherit Website labels or semantics by convention;
> each must prove a recovery need and deliberately register a compatible
> source-owned presentation contract. Tenants cannot add, rename, reorder,
> suppress, map, automate, or repurpose the codes.
>
> If moderated representative evidence shows that the choices do not improve
> recovery decisions, that staff cannot distinguish them reliably without
> personal explanation, or that authorized recovery staff ignore them, Core
> removes the prompt and collects no context. It does not respond by adding
> prose, more categories, Tenant configuration, or AI inference.

## Evidence labels

- **Verified repository fact:** current Core source, governing OpenSpec,
  accepted ADR, or glossary read on 2026-08-28.
- **Verified external fact:** current first-party documentation linked below.
- **Reasonable inference:** follows from verified evidence but is not itself a
  repository requirement.
- **Product judgment:** the recommended Core choice where evidence does not
  establish a universal answer.
- **Assumption:** requires representative ministry staff or production-shaped
  evidence before Live activation.
- **Unresolved unknown:** routed into the single D35 question instead of being
  guessed.

## Current behavior, intended behavior, and best permanent path

| Area                          | Current behavior                                                                                                                                                         | D34 intended behavior                                                                     | Best permanent path                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| D33 responsibility transition | D33 reserves context for D34 but already owns actor, predecessor, destination, scopes, heads, and result.                                                                | Add one context choice only to a final-recipient return.                                  | Keep authoritative transition reason and actor-selected recovery context as different facts.                      |
| `mission_control_tasks`       | Generic task rows have free-text `dismissed_reason`, `suppressed_reason`, comments, mutable assignment, and generic JSON details.                                        | Reuse none of these fields.                                                               | Context remains on the immutable source responsibility transition and Tasks Hub keeps only a receipt reference.   |
| Support Hub move              | Current repo requires 5–500 characters of free text and explicitly rejects preset reason choices for that conversation-routing correction.                               | Do not treat it as a generic reassignment precedent.                                      | Preserve separate purpose, data, retention, and UX contracts; neither becomes a universal Tasks Hub reason model. |
| Phase 19 command outcomes     | Closed reason catalogs are versioned; new codes require owner, UI, recovery, telemetry classification, and exhaustive tests; staff notes never become machine semantics. | Apply the same disciplined closed-code pattern without making the code operational truth. | Code/version is immutable and presentation-localized; no prose or caller-authored code crosses the boundary.      |
| Admin task prototype          | Browser-side task assignment and comments are mutable and not source-authoritative.                                                                                      | Treat as a visual prototype only.                                                         | A privileged `packages/api` source command owns the transition; the UI composes shared Base Maia primitives.      |
| Payload/CMS                   | Owns content and publication state, not operational responsibility or task context.                                                                                      | Store no recovery context in CMS documents.                                               | Website operational workflow in Asym Postgres owns the receipt and context.                                       |
| Inngest                       | Governing OpenSpec makes it an executor, never product truth.                                                                                                            | Not required for context validation or commit.                                            | Optional short projection/reconciliation receives only identifiers and reloads product state.                     |
| Future Mobilize tasks         | Roadmap anticipates source-backed work in one Tasks Hub but does not define Website recovery reasons as shared semantics.                                                | Reuse the envelope and source-ownership boundary, not the labels.                         | Each source proves whether context changes its recovery and registers a versioned source contract.                |

## Problem validity, necessity, and strongest alternative

The source can safely authorize, commit, audit, and recover a no-successor
return without asking the user anything beyond the return itself. A reason is
therefore **not necessary for correctness**. The only defensible product
purpose is to reduce the time or uncertainty for the authorized person who
must recover ownerless work.

The strongest alternative is **Option 3 — collect no context**. It has lower
friction, no taxonomy, less personal data, no localization or retention cost,
and no risk that a self-report becomes an HR signal. Option 1 remains better
only if its three choices produce meaningfully different recovery guidance and
representative staff understand that guidance. This is an evidence-bound
product judgment, not a proven ministry workflow fact.

Requiring context for every handoff is rejected. Salesforce's current Flow
reassignment action treats comments as optional, and Jira supports requesting
or validating fields on selected transitions rather than every transition.
Those products do not prove Core's exact policy, but they support the modern
principle of asking for transition input only when it is needed.

## Repository conflict explicitly resolved

Core's existing Support Hub move contract requires a concise free-text reason
and deliberately rejects preset reason choices. D34 does not reverse it:

- Support moves an already routed conversation between Tenant inboxes and
  needs human correction history.
- D34 covers only a recipient-initiated return that leaves exact source-action
  scopes with no responsible person.
- Support collects 5–500 characters; D34 collects one closed code and no prose.
- Support bulk-move storage, task comments, `dismissed_reason`,
  `suppressed_reason`, event JSON, and D30 protected explanation are forbidden
  D34 storage seams.
- Neither policy may be generalized by the name “reason.”

This conflict is resolved by purpose ownership, not by forcing local
consistency between materially different workflows.

## Modern-practice review

- [Salesforce Flow approval reassignment](https://help.salesforce.com/s/articleView?id=platform.core_actions_reassign_approval_work_item.htm&language=en_US&type=5)
  requires a work-item identity and new assignee but makes reassignment
  comments optional. That supports keeping ordinary named handoff free of
  forced explanation.
- [Jira Cloud workflow rules](https://support.atlassian.com/jira-cloud-administration/docs/edit-an-issue-workflow/)
  let a workflow request input and validate it on a specific transition before
  that transition commits. That is the relevant pattern: conditional input at
  the consequence boundary, not a universal task field.
- [Dynamics 365 case status reasons](https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/define-status-reason-transitions-case-management)
  bind reasons to a specific state and can restrict the valid next choices so
  representatives see a smaller lawful list. Core uses the state-bound closed
  choice idea, while rejecting Tenant-configurable workflow complexity.
- [GitHub issue closure](https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/closing-an-issue)
  uses a small finite close-reason choice rather than requiring narrative. It
  demonstrates the clarity of typed context, not a generic reassignment rule.
- [Stripe cancellation details](https://docs.stripe.com/api/subscriptions/cancel)
  separate structured feedback from an optional comment. Core deliberately
  adopts only the structured minimum because personal work-return prose has no
  proven purpose.
- [Blackbaud CRM reason codes](https://webfiles-sc1.blackbaud.com/files/support/guides/enterprise/400/admin.pdf)
  show why nonprofit CRMs standardize reasons, but also show the configuration
  burden of organization-managed catalogs. D34 does not import that older,
  broad customization model.
- [GOV.UK radio guidance](https://design-system.service.gov.uk/components/radios/)
  recommends radios for exactly one choice, no preselection, a fieldset and
  legend, short hints, and conditional questions only when relevant. It also
  advises keeping the conditional question simple in the same interaction.
- [GOV.UK question-page guidance](https://design-system.service.gov.uk/patterns/question-pages/)
  says every question needs a known purpose and services should ask only for
  information they really need.
- [W3C form validation guidance](https://www.w3.org/WAI/tutorials/forms/validation/)
  requires programmatically identified required input and clear error
  feedback. Core adds focus restoration, persistent status, keyboard, zoom,
  and reflow proof through its repository accessibility contract.
- [ICO data-minimisation guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/data-minimisation/)
  requires personal data to be adequate, relevant, and limited to the stated
  purpose. A closed code with no personal narrative is proportionate only for
  the stated recovery purpose.

**Best-practice conclusion:** conditional collection, a tiny state-bound
closed choice, no preselection, no prose, explicit purpose, and no automatic
semantic effect are current proven practices. A universal reason field,
Tenant-authored taxonomy, or reason-driven automation is not justified.

## Excellent Core UX/UI

### Information architecture

- Preserve D33's visible **This needs someone else** secondary action and one
  responsive source-led panel.
- Keep named handoff and covered return unchanged; no hidden field reserves
  space and no extra page or nested modal is introduced.
- Show the context question only after the source preview proves that at least
  one selected scope will have no responsible recipient.
- Put the consequence before the question. Staff first understand what will
  happen, then provide the smallest required context.
- Keep **Keep assigned to me** available as the safe Back/Cancel action and use
  **Return for reassignment** as the consequence-led submit label.

### Covered return

```text
Return Page correction?

Amélie will remain responsible.
You will no longer be responsible for this Page correction.

[Keep assigned to me]  [Return this work]
```

No recovery-context control exists in the DOM or command payload.

### Final-recipient return

```text
Return Page correction?

No one else will remain responsible. This work will appear in
Website > Changes requested > Needs assignment.

What is the main reason you're returning this work?
Choose the closest answer. This is used only to help authorized Website staff
decide what to do next.

○ This work belongs with someone else
  The Website responsibility setup may need review.

○ I can't take this work
  You do not need to say why.

○ Something else
  No additional details are required.

[Keep assigned to me]  [Return for reassignment]
```

### Interaction and accessibility contract

- Use the shared `@asym/ui` Base UI RadioGroup, Label, Button, Card, and
  responsive Sheet/Dialog composition with exact Base Maia geometry and Zinc-
  based semantic tokens. No app-local primitive or style fork is allowed.
- Render one unselected radio group with a real group name/legend, one-choice
  semantics, native checked state, and concise descriptions connected by
  stable IDs.
- Do not use placeholder text, a select menu, icon-only options, color-only
  state, a tooltip, or hover to communicate the choices.
- Each option and action has at least a 44-by-44 CSS-pixel target. Visual and
  DOM order are identical; arrows operate the RadioGroup; Tab reaches the
  group and actions; Escape/Close writes nothing.
- Submit with no selection keeps the panel open, renders a specific inline
  error beside the group, adds `aria-invalid`/described-by semantics as
  appropriate to the shared primitive, announces the error, and focuses the
  group/error summary without losing source context.
- Loading disables repeat submit and names the in-progress action. Success,
  stale conflict, and error remain visible in the panel/current detail; a
  toast is never the only evidence.
- At 320 CSS pixels and 400% zoom, options remain full-width without horizontal
  scroll. Long translated labels, RTL, CJK, Unicode names, forced colors,
  high contrast, text spacing, screen magnification, safe areas, virtual
  keyboards, and reduced motion remain release gates.
- A locale change re-renders the code-owned label; it never mutates the stored
  code. Missing historical translation renders **Return context unavailable**
  without exposing a raw code or crashing.
- No unfinished selection persists beyond page memory, reload, logout, or
  Tenant/source switch. Never remember or preselect the user's previous reason.

### Mixed scopes

If only some selected scopes would enter **Needs assignment**, the panel names
those scopes. The selected context applies only to that exact gap-scope digest.
One choice may cover several compatible gap scopes; staff who genuinely need
different contexts return those scopes separately. The UI must not offer
multi-select reasons or silently attach one code to covered scopes.

### Presentation after commit

- The initiating task/history says **Returned for reassignment** and links to
  the authoritative source receipt.
- The authorized source recovery detail may show **Return context: This work
  belongs with someone else**, explicitly as “selected by [actor]” rather
  than a verified diagnosis.
- Ordinary task lists, notifications, emails, successor tasks, search results,
  generic exports, and staff profiles do not show the code or label.
- Once assignment recovery ends, ordinary active presentation no longer shows
  the context; purpose-limited source audit retention remains governed by the
  source records schedule.

## Domain model, source of truth, and invariants

### Ubiquitous language

**Return recovery context** is the immutable, actor-selected, code-owned
context attached only to a recipient-initiated source responsibility return
that created **Needs assignment**. It is used only to guide authorized recovery
and is not an authoritative transition reason, diagnosis, routing input,
permission fact, or task comment.

The authoritative **Source transition reason** remains source-derived—for
example `returned`, `reassigned`, `authorization_lost`, `completed`, or
`superseded`. Calling both fields “reason” would create semantic collision and
is forbidden in the domain/API vocabulary.

### Ownership

The Website operational workflow in Asym Postgres owns:

- whether exact required work remains;
- current responsible recipients and exact action scopes;
- whether the requested return produces **Needs assignment**;
- return-context requiredness and admitted code/version;
- the immutable transition, gap-scope digest, and receipt;
- the authorized recovery view and current presentation; and
- the purpose-specific retention, correction, and audit contract.

Tasks Hub owns no copy or interpretation. It may resolve a source action,
invoke the source command, and project a safe outcome/reference. Payload owns
content, not operational context. Inngest may deliver/reconcile identifiers
after commit. Neither AI nor analytics becomes a write or read authority.

### Invariants

1. A named handoff has null return context.
2. A return whose selected scopes all retain another current recipient has
   null return context.
3. A recipient-initiated return creating at least one **Needs assignment**
   scope has exactly one valid context code and catalog version.
4. System/source terminality, authorization loss, identity deactivation,
   manager removal, cancellation, completion, and supersession have null D34
   context and their own source-derived reason.
5. The server derives the result and gap scopes; callers cannot assert
   `creates_needs_assignment`, Tenant, actor, source, or authoritative reason.
6. The context code says only what the actor selected; it cannot certify a fact
   about another person, resolver, role, permission, or source.
7. Context never changes the valid state transition or any downstream business
   effect.
8. Code, catalog version, and gap-scope digest are immutable and participate in
   canonical command meaning.
9. Localized labels are derived at read time and are never stored.
10. Unknown code/version fails closed for writes and degrades safely for
    historical reads.
11. No missing value defaults to `other`.
12. Context is visible only under current purpose-specific source recovery or
    audit authorization; task possession grants nothing.
13. Context is not copied to task, notification, workflow, CMS, search, AI,
    generic export, cache key, or person analytics.
14. Historical context follows its source receipt and records schedule; it
    never creates a separate retention root.
15. A future source reuses only the envelope/contract after an explicit source
    decision; it never inherits Website codes by name or task type.

## Conceptual persistence, RLS, and authorization

The smallest durable shape is two nullable fields on the immutable source
responsibility-transition receipt plus the exact gap-scope membership/digest
already required by D33:

- `return_context_contract_version`;
- `actor_selected_return_context_code`; and
- `needs_assignment_scope_digest` or a relational equivalent.

Do not create a generic task-reason table, comments relation, JSON bag, Tenant
catalog, or provider record. A CHECK or composite foreign-key contract must
admit only the code-owned version and must enforce the result/nullability
matrix. A database default is forbidden. Historical versions remain readable;
new codes require an explicit contract version, owner, UI copy, recovery
behavior, telemetry classification, migration, and exhaustive tests.

The source command in `packages/api` derives Tenant, environment, Site,
source-work identity, actor, Party/role reference, Active Tenant Assignment,
current responsibility, exact action scopes, current source/policy/
authorization heads, result, and audit attribution. Browser clients receive no
direct INSERT, UPDATE, or DELETE grant on responsibility transitions or return
context.

`USING` must restrict any readable transition to the exact Tenant, source,
purpose, and current viewer authorization. `WITH CHECK` or an equivalent
security-definer command constraint must reject a resulting row with changed
Tenant, source, actor, transition kind, result state, scopes, code, version, or
receipt relation. Direct table, RPC, owner, service-role, worker, import,
support, repair, export, cache, Realtime, and AI seams must repeat the same
policy. Unknown or overly broad privileged paths fail closed.

An unexpected context on a named or covered return is rejected, not silently
ignored. Silent dropping would make retries with different canonical meaning
look identical and would collect surplus data in logs or intermediaries. An
old client that omits required context receives typed
`recovery_context_required` with the current safe choices and writes nothing.
An unknown/retired client code receives `recovery_context_invalid` and a fresh
contract response.

## Lifecycle, temporal correctness, concurrency, and idempotency

1. Opening **This needs someone else**, choosing Return, loading preview,
   selecting context, closing the panel, or losing connectivity writes nothing.
2. The fresh preview returns exact affected scopes, whether each keeps another
   recipient, the current context policy/version when required, the recovery
   destination, and expected heads.
3. A covered return commits with no context fields.
4. A final-recipient return cannot commit until exactly one admitted context is
   present.
5. The source transaction re-proves every head and recomputes gap scopes; the
   client preview cannot define requiredness.
6. A successful commit appends the complete successor responsibility
   generation, transition receipt, context/version, exact gap-scope relation,
   and identifier-only projection intent atomically.
7. A lost response is recovered by semantic receipt lookup. Same key/same
   meaning returns the receipt; same key/different context, scopes, or result
   conflicts.
8. Later assignment, completion, cancellation, or supersession ends active
   recovery presentation but does not rewrite the historical selection.
9. Recurrence creates a successor source-work identity and never reuses the
   old context.

### Critical races

- **Two last recipients return concurrently.** Both may preview a covered
  return. The first commit succeeds and preserves the other. The second is
  stale, refreshes, and now requires context. It cannot create a gap without
  the required code.
- **Another recipient joins after the prompt appears.** The stale commit fails;
  refreshed impact is covered and neither sends nor stores the old selection.
- **A recipient leaves after a covered preview.** The stale commit fails;
  refreshed impact exposes the prompt before any gap can commit.
- **Source completes while the panel is open.** Terminal source truth wins;
  context is discarded from page memory and no return receipt is written.
- **Authorization or catalog version changes.** Expected-head mismatch writes
  nothing and reloads the current allowed action/choices.
- **Mixed scopes.** The transaction computes the exact subset entering
  **Needs assignment**; context is bound only to that digest.
- **Access loss or system recovery creates the gap.** No user is available to
  answer. The source writes its authoritative reason and null D34 context.
- **Manager removes the last recipient.** Manager-removal governance owns its
  basis; it cannot impersonate a recipient-selected D34 value.
- **Locale changes.** Code meaning remains stable; labels re-localize.
- **`other` is selected.** No additional control, payload field, or follow-up
  prompt appears.

## Failure modes and Inngest boundary

The source transaction is the only business commit. A database error, stale
head, invalid code, invalid combination, authorization loss, or dependency
uncertainty writes no transition. A lost success response reconciles from the
source receipt before retry. Task/attention projection failure cannot roll back
or reinterpret a committed source result; reconciliation repairs the
projection from current product state.

Inngest is unnecessary for collection, validation, or commit. If used after
the product transaction, its schema-versioned event contains only Tenant-safe
dispatch and source-transition identifiers. The worker reloads the current
authorized safe projection. It never receives the code, actor, protected work
context, or labels in the event; infers or defaults context; maps context to a
recipient; triggers routing/escalation; aggregates staff behavior; or retains
reason history. A database outbox worker remains an equally valid simpler
executor.

## Normative requirements

1. **D34-R1 — Conditional collection.** Return recovery context is required
   only for an explicit recipient return whose committed result creates one or
   more **Needs assignment** scopes.
2. **D34-R2 — No routine friction.** Named handoff and covered return collect no
   context, note, or hidden placeholder.
3. **D34-R3 — Closed vocabulary.** Website v1 admits exactly
   `responsibility_mismatch`, `cannot_take_current_work`, and `other`.
4. **D34-R4 — One selection.** Exactly one code is required when D34 applies;
   multi-select and secondary reason are forbidden.
5. **D34-R5 — No default.** No code is preselected, remembered, inferred, or
   defaulted; missing never becomes `other`.
6. **D34-R6 — No prose.** No free-text note, explanation, attachment, mention,
   comment, custom value, or copied feedback is collected.
7. **D34-R7 — Self-report only.** The stored fact is the actor's selection,
   not an objective diagnosis or source transition reason.
8. **D34-R8 — Context-only semantics.** A code can alter only safe recovery
   guidance shown to an independently authorized source recovery user.
9. **D34-R9 — Absolute non-effects.** Context cannot affect permission,
   eligibility, routing, priority, urgency, time, reminder, escalation,
   notification, automation, completion, public state, Giving, finance, HR, or
   member care.
10. **D34-R10 — Server-derived result.** The source computes whether the return
    creates a gap and which exact scopes enter it.
11. **D34-R11 — Atomic append.** Responsibility generation, transition,
    context/version, gap scopes, receipt, and product projection intent commit
    atomically in one short transaction.
12. **D34-R12 — Combination constraint.** Invalid null/non-null code, version,
    transition-kind, result, or scope combinations are impossible at the
    authoritative database/command boundary.
13. **D34-R13 — Immutable versioning.** Codes and meanings are immutable;
    labels localize at read time; new codes require a new governed contract.
14. **D34-R14 — Canonical idempotency.** Code, version, and exact gap scopes
    participate in canonical meaning; changed meaning conflicts.
15. **D34-R15 — Current authorization.** Every preview, commit, read, history,
    and recovery action independently re-proves current Tenant/source/purpose
    authorization.
16. **D34-R16 — Trusted attribution.** Tenant, actor, source, scopes, result,
    and audit attribution derive from trusted server context and current source
    state, never caller-controlled fields.
17. **D34-R17 — Purpose-limited visibility.** Only the returning actor and
    currently authorized source recovery/audit viewers may see the selected
    context for its admitted purpose.
18. **D34-R18 — No successor disclosure.** A later assignee does not
    automatically see the predecessor's context or identity merely because
    they receive the work.
19. **D34-R19 — No copied projection.** Tasks Hub, notifications, email,
    Payload, workflow events, search, AI, caches, logs, generic exports, and
    person analytics contain no code or label.
20. **D34-R20 — Source retention.** Context follows the purpose-specific source
    transition records schedule and creates no separate or indefinite root.
21. **D34-R21 — Accessible progressive disclosure.** The one Base Maia panel
    shows the question only after a current gap preview, with unselected radio
    semantics, inline errors, focus recovery, 44-pixel targets, and complete
    responsive/international behavior.
22. **D34-R22 — Consequence-led confirmation.** Staff see exact gap scopes,
    recovery destination, selected label, and non-effects before one **Return
    for reassignment** action.
23. **D34-R23 — No unfinished persistence.** Uncommitted context stays in page
    memory only and is cleared on reload, logout, source/Tenant change, stale
    result, or terminal source state.
24. **D34-R24 — Race-safe requiredness.** Expected-head compare-and-swap
    recomputes the result so concurrent recipient changes cannot create a gap
    without context or retain context on a covered return.
25. **D34-R25 — Provider independence.** Inngest and other executors receive
    identifiers only and never own, carry, interpret, infer, or retain context.
26. **D34-R26 — No inferred migration.** Existing task reasons, comments,
    Support move prose, task events, assignees, logs, and timestamps never
    backfill D34 context.
27. **D34-R27 — Cross-domain opt-in.** Future sources register their own
    evidence-backed contract; Website labels are never inferred from module,
    title, task policy, or source link.
28. **D34-R28 — No Tenant taxonomy.** Tenants cannot customize, map, order,
    suppress, automate, or assign consequences to D34 codes.
29. **D34-R29 — Humane-use boundary.** Context cannot support individual
    scoring, workload/availability inference, absence tracking, discipline,
    compensation, promotion, performance review, or leaderboards.
30. **D34-R30 — Evidence-bound removal.** If context does not demonstrably
    improve recovery or creates unreliable/sensitive interpretation, remove
    the prompt and collect nothing rather than adding complexity.

## Full adversarial category review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes — the context field is not required for a safe or
auditable return, so it can become unjustified friction and data collection.**

| What could go wrong                                                                                                                        | Why it matters                                                                                                            | Severity |  Likelihood | Evidence or reasoning                                                                                                                                                                                                | Effect on current answer                                                             | Best permanent fix                                                                                                                                                               | Exact decision/requirement/spec language                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | -------: | ----------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Core assumes every ownerless return needs explanation, although source scopes, actor, result, and recovery view may already be sufficient. | Staff perform an extra step, Core retains actor-linked data, and a taxonomy becomes permanent without improving recovery. |   Medium | Medium–High | **Repository fact:** D33 already records every authoritative fact. **External fact:** mainstream known-destination reassignment commonly omits reasons. **Product judgment:** only recovery utility can justify D34. | Narrows Option 1 and makes Option 3 the mandatory fallback if utility is not proved. | Ask only on a true post-state gap; give each code distinct safe guidance; run representative comprehension/recovery proof before Live; remove rather than expand if ineffective. | **D34-R1–R2, R8, R30:** “Context SHALL exist only when it changes ownerless-work recovery; otherwise collect nothing.” |

### 2. Brittleness

**Material concern: Yes — conditional requiredness can depend on stale client
counts, overlapping labels, or mutable catalog meaning.**

| What could go wrong                                                                                                                                              | Why it matters                                                                                 | Severity |              Likelihood | Evidence or reasoning                                                                                                                                             | Effect on current answer                                                                           | Best permanent fix                                                                                                                  | Exact decision/requirement/spec language                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------: | ----------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| The browser thinks Maria is last, two labels overlap, or a label is renamed to mean something new; the wrong prompt appears and history becomes uninterpretable. | Staff see inconsistent flows, choose arbitrarily, and analytics/history drift across versions. |     High | High without amendments | **Repository fact:** responsibility is multi-recipient and expected-head governed. **UX evidence:** small mutually distinguishable radio choices reduce mistakes. | Replaces four provisional labels with three and moves requiredness fully to source preview/commit. | Server-derived gap state, immutable code/version, no semantic relabel, expected-head refresh, and evidence-gated catalog evolution. | **D34-R3, R10, R13, R24:** “A client count or localized label SHALL never define requiredness or historical meaning.” |

### 3. Technical debt

**Material concern: Yes — a tiny field can grow into duplicated enums, Tenant
settings, reports, and a cross-domain workflow language.**

| What could go wrong                                                                                                           | Why it matters                                                                                               | Severity | Likelihood | Evidence or reasoning                                                                                                                                                   | Effect on current answer                                                        | Best permanent fix                                                                                                                                                        | Exact decision/requirement/spec language                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------: | ---------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| UI, API, database, Tasks Hub, Website, and Mobilize each maintain different lists or Tenants add custom reasons and mappings. | Version drift, localization gaps, migration cost, and hidden reason-driven automation become hard to remove. |     High |       High | **Repository fact:** Phase 19 requires one closed governed catalog; repeated business logic must converge. **Product judgment:** no evidence supports a reason builder. | Adds one versioned source contract and rejects Tenant/cross-domain inheritance. | Single code-owned manifest/contract, generated/shared types where appropriate, database compatibility constraint, no Tenant custom values, explicit future-source opt-in. | **D34-R3, R13, R27–R28:** “Reason semantics SHALL be registered once and never inferred from source name or task metadata.” |

### 4. Edge cases

**Material concern: Yes — mixed scopes, concurrent final recipients, access
loss, manager removal, terminal source state, and old clients change whether
context is lawful or possible.**

| What could go wrong                                                                                                                                                 | Why it matters                                                                                                                 | Severity |            Likelihood | Evidence or reasoning                                                                                                                                  | Effect on current answer                                                     | Best permanent fix                                                                                                                          | Exact decision/requirement/spec language                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------: | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| One command returns covered and ownerless scopes; two people return simultaneously; a system event creates the gap without a human; or an old client omits context. | Context may attach to the wrong scopes, a gap may be created without it, or a human may be forced to explain a system outcome. |     High | Medium–High aggregate | **Repository fact:** D33 supports exact multi-action scopes and CAS. **Reasonable inference:** not every zero-recipient result has an available actor. | Requires exact gap-scope binding and recipient-initiated-only applicability. | Per-scope post-state computation, expected heads, null for system/manager/terminal outcomes, typed old-client denial, no inferred fallback. | **D34-R1, R10–R12, R24, R26:** “Only the exact recipient-initiated gap subset may reference D34 context.” |

### 5. Footguns

**Material concern: Yes — defaults, `Other` prose, silent coercion, or reason-
driven actions make false or harmful data easy to create.**

| What could go wrong                                                                                                                                      | Why it matters                                                                                                  | Severity |                   Likelihood | Evidence or reasoning                                                                                            | Effect on current answer                                | Best permanent fix                                                                                                     | Exact decision/requirement/spec language                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------: | ---------------------------: | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| A default records false intent; `other` opens a textarea; unknown values coerce to `other`; a developer maps `cannot_take` to urgency or a target queue. | Staff are misrepresented, sensitive details leak, and a low-trust selection silently changes operational truth. |     High | High without explicit denial | **GOV.UK:** no preselection. **ICO/NIST:** minimize. **Repository:** staff notes never become machine semantics. | Keeps three choices only and adds absolute non-effects. | No default/prose/coercion; reject extra or unknown values; static architecture and tests forbid operational consumers. | **D34-R4–R9:** “No default, prose, inference, coercion, or automated consequence is permitted.” |

### 6. Tenant safety

**Material concern: Yes — context, actor, source, or gap scopes can leak across
Tenants, Sites, environments, or purpose-specific recovery audiences.**

| What could go wrong                                                                                                                         | Why it matters                                                                             | Severity |                                                                   Likelihood | Evidence or reasoning                                                                                                     | Effect on current answer                                       | Best permanent fix                                                                                                                    | Exact decision/requirement/spec language                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------: | ---------------------------------------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| A broad task/history query exposes that a person returned protected work in another Tenant/Site, or a shared cache keys only by receipt ID. | Even the code can expose staff behavior and the existence/type of protected ministry work. | Critical | Low–Medium with good controls; High if current generic task paths are reused | **OpenSpec:** Tenant/role scope is structural. **Current source:** generic task rows and service paths are not D34-ready. | Requires source-purpose reads and no copied task presentation. | Composite same-scope ownership, purpose-specific query/RLS, current reauthorization, safe cache keys, poison tests, no broad exports. | **D34-R15–R19:** “No context read or reference may cross Tenant, environment, Site, source, or admitted recovery purpose.” |

### 7. Database, RLS, and authorization safety

**Material concern: Yes — nullable text fields and broad privileged paths can
admit invalid state combinations or transform a permitted row into a forbidden
one. Money precision is not implicated, but every other requested database
boundary is.**

| What could go wrong                                                                                                                                                                                                                              | Why it matters                                                                                        | Severity |                                    Likelihood | Evidence or reasoning                                                                                                                                            | Effect on current answer                                              | Best permanent fix                                                                                                                                                                                                | Exact decision/requirement/spec language                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | -------: | --------------------------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reusing `dismissed_reason`, JSON, or a mutable task column allows arbitrary strings, missing required values, context on named handoffs, caller-supplied actor/Tenant, update-in-place, cross-scope FK attachment, or owner/service-role bypass. | Invalid history becomes durable; direct/update paths can forge actor intent or expose another Tenant. | Critical | High if current schema/conventions are reused | **PostgreSQL:** `USING` and `WITH CHECK` protect different sides; owners/BYPASSRLS require separate care. **Repo:** source commands must derive trusted context. | Moves data to immutable source receipt with structural compatibility. | Append-only source command, composite same-scope relationships, code/version constraint, no defaults, least grants, FORCE RLS where appropriate, explicit privileged-path parity, immutable fields/delete denial. | **D34-R10–R19:** “Both existing-row visibility and resulting-row validity SHALL preserve exact scope, attribution, operation, result, code, and version.” |

### 8. Overengineering

**Material concern: Yes — notes, custom catalogs, nested reasons, workflow
rules, automated suggestions, or a separate context service exceed the proven
problem.**

| What could go wrong                                                                                                   | Why it matters                                                                                 | Severity |          Likelihood | Evidence or reasoning                                                                                                                         | Effect on current answer                                                   | Best permanent fix                                                                                                            | Exact decision/requirement/spec language                                                                            |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------: | ------------------: | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| D34 becomes a generic reason service with builders, mappings, reports, AI, reminders, or another task/recovery store. | The smallest exceptional interaction creates a platform subsystem and ongoing operator burden. |     High | High unless bounded | **Strongest alternative:** no context works safely. **Repo:** source-specific finite contracts and one Tasks Hub already avoid local systems. | Rejects all speculative extensions and keeps a two-field receipt addition. | Three codes, no prose or configuration, source-local presentation, no automatic consumers, delete prompt if usefulness fails. | **D34-R3–R9, R27–R30:** “D34 SHALL NOT create a generic reason, notes, workflow, reporting, or automation product.” |

### 9. UX/UI and user friction

**Material concern: Yes — poor timing, blame-oriented copy, hidden
consequences, disabled submit, nested dialogs, or inaccessible controls can
make an escape path feel punitive or unusable.**

| What could go wrong                                                                                                                                                                                                | Why it matters                                                                                                   | Severity |                      Likelihood | Evidence or reasoning                                                                                                                                         | Effect on current answer                                                                                          | Best permanent fix                                                                                                                                        | Exact decision/requirement/spec language                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | -------: | ------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff are asked on every transition; labels imply fault; no option fits; a disabled button hides validation; mobile sheet clips; screen readers miss required/error/checked state; success exists only in a toast. | Staff retain wrong work, choose false values, abandon on mobile/low bandwidth, or disclose details outside Core. |     High | High without the specified flow | **Core:** exact Base Maia/Base UI, shared task Sheet, accessibility skill. **GOV.UK/W3C:** conditional relevant question, no preselect, labelled radio/error. | Adds progressive disclosure, three humane options, one panel, and comprehensive state/accessibility requirements. | Consequence first; unselected RadioGroup; `other` without prose; persistent inline error and outcome; 44px targets; focus/reflow/i18n/weak-network proof. | **D34-R2–R6, R21–R23:** “A lawful final-recipient return SHALL be understandable and completable in the existing responsive panel without personal explanation.” |

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes — the actor-selected context can be confused with the
source-derived transition reason, eligibility, or a diagnosis of another
person/system.**

| What could go wrong                                                                                                                                                | Why it matters                                                                             | Severity |                      Likelihood | Evidence or reasoning                                                                                                                   | Effect on current answer                                                            | Best permanent fix                                                                                                                         | Exact decision/requirement/spec language                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | -------: | ------------------------------: | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Reports or code treat `responsibility_mismatch` as proof the resolver failed, or `cannot_take` as availability/capacity truth; Tasks Hub becomes a context writer. | Low-trust opinion changes authoritative state, creates dual ownership, and can harm staff. | Critical | High if both are named “reason” | **ADR-0183/D33:** source owns responsibility and transition truth; task is projection. **ICO:** attributed opinion needs clear context. | Introduces the term **Return recovery context** and explicit self-report semantics. | Separate source transition reason from actor-selected context in names/types; source owns requiredness/receipt; Tasks Hub references only. | **D34-R7–R10, R17–R19:** “Return recovery context SHALL never certify a cause, state, capability, or personnel fact.” |

### 11. Hidden coupling

**Material concern: Yes — apparently harmless codes can become implicit inputs
to routing, role models, notifications, staffing, analytics, or future Mobilize
logic.**

| What could go wrong                                                                                                                               | Why it matters                                                                                                                | Severity |  Likelihood | Evidence or reasoning                                                                                                                       | Effect on current answer                       | Best permanent fix                                                                                                                                      | Exact decision/requirement/spec language                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------: | ----------: | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Website branches on the code to select a role; Tasks Hub embeds labels; Mobilize copies Website codes; BI creates “frequent returner” dashboards. | A presentation hint becomes a brittle shared API and employee-monitoring signal; changing one label breaks unrelated domains. |     High | Medium–High | **Repository:** repeated source-specific routes must not be inferred; future Tasks Hub needs stable envelope, not common Website semantics. | Adds consumer denials and cross-domain opt-in. | Typed context envelope/reference, source presentation adapter, no generic label/code reads, architecture tests, governance review for any new consumer. | **D34-R8–R9, R19, R27, R29:** “No consumer may infer behavior from a context code outside its registered source-presentation purpose.” |

### 12. Failure modes

**Material concern: Yes — partial success, lost responses, stale previews,
projection outage, or missing translations can produce ambiguous history or
unsafe retries.**

| What could go wrong                                                                                                                                  | Why it matters                                                                                             | Severity | Likelihood | Evidence or reasoning                                                                                                       | Effect on current answer                                                                          | Best permanent fix                                                                                                                               | Exact decision/requirement/spec language                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------: | ---------: | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source commits but UI times out; Tasks Hub remains stale; retry changes code; translation is absent; a dependency failure is misread as proved zero. | Staff may create duplicate/conflicting transitions, think work vanished, or see raw sensitive identifiers. |     High |     Medium | **OpenSpec:** product receipt/dispatch ledger own recovery. **Repo:** unknown is not zero and source wins over projections. | Requires atomic receipt, receipt lookup, typed conflict, safe fallback label, and reconciliation. | No provider call in transaction; expected heads; canonical idempotency; identifier-only outbox; current read on open; persistent safe UI states. | **D34-R10–R14, R21, R24–R25:** “Every failure SHALL preserve current source truth or converge from the committed source receipt without inventing context.” |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes — requiredness changes during the interaction, and
context changes canonical command meaning.**

| What could go wrong                                                                                                                                                                               | Why it matters                                                                                 | Severity |  Likelihood | Evidence or reasoning                                                                                                              | Effect on current answer                                              | Best permanent fix                                                                                                                                       | Exact decision/requirement/spec language                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------: | ----------: | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Two individually valid returns jointly create an uncontextualized gap; a late retry stores a now-unnecessary code; same idempotency key accepts another selection; recurrence reuses old context. | Source invariants, audit meaning, and user-visible results diverge under normal races/retries. | Critical | Medium–High | **D33:** expected-head complete generations. **Reasonable inference:** context is part of business intent, not transport metadata. | Makes code/version/gap scope part of the atomic semantic fingerprint. | Recompute under CAS; stale losers refresh; same meaning replays; changed meaning conflicts; recurrence gets successor identity; source terminality wins. | **D34-R11–R14, R23–R24:** “No stale or replayed command may create, omit, move, or reinterpret context.” |

### 14. Data integrity risks

**Material concern: Yes — nullability convention, mutable meanings, copied
labels, or inferred backfills can corrupt historical interpretation and
reporting.**

| What could go wrong                                                                                                                                         | Why it matters                                                                                            | Severity |               Likelihood | Evidence or reasoning                                                                       | Effect on current answer                                                      | Best permanent fix                                                                                                                                                                         | Exact decision/requirement/spec language                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------: | -----------------------: | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| A row has code without version, ownerless result without code, English label stored, retired code reused, or migration infers `cannot_take` from a comment. | Historical evidence becomes false, localization drifts, and repairs require direct database intervention. |     High | High without constraints | **Repo:** Phase 19 closed-catalog versioning; current free-text task fields are unsuitable. | Requires structural matrix, immutable codes, derived labels, and no backfill. | Database CHECK/FK, null-pair constraint, code/version contract, append-only receipt, stable historical renderer, `not_collected_under_prior_contract` as metadata rather than fake choice. | **D34-R12–R14, R20, R26:** “Historical D34 context SHALL be explicit, versioned, immutable, and never inferred.” |

### 15. Security and privacy risks

**Material concern: Yes — actor-linked `cannot_take` can become sensitive
employment, health, absence, workload, conflict, or member-care inference even
without prose.**

| What could go wrong                                                                                                                                                                 | Why it matters                                                                                               | Severity |  Likelihood | Evidence or reasoning                                                                                                  | Effect on current answer                                               | Best permanent fix                                                                                                                                                                    | Exact decision/requirement/spec language                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------: | ----------: | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Managers, exports, AI, logs, or analytics correlate returns to score availability/performance; unauthorized successors see a predecessor's selection; retention becomes indefinite. | Staff may be chilled from returning unsafe work and sensitive personnel conclusions may be wrong or exposed. |     High | Medium–High | **ICO/NIST:** purpose limitation/minimization. **OWASP:** sensitive logs and employee monitoring need special caution. | Adds no-prose, purpose visibility, retention, and humane-use boundary. | Minimum code only; current source authorization; no successor/broadcast disclosure; no person dimensions; no AI/log/export copies; schedule-bound retention and identity disposition. | **D34-R6–R9, R17–R20, R29:** “D34 context SHALL never be used to infer, evaluate, rank, or expose an individual.” |

### 16. Scalability and performance risks

**Material concern: Yes, but modest — the two small fields are cheap; the risk
comes from reason-dependent scans, high-cardinality telemetry, and source/task
joins rather than storage volume.**

| What could go wrong                                                                                                                                   | Why it matters                                                                                                  | Severity |                 Likelihood | Evidence or reasoning                                                                                            | Effect on current answer                                | Best permanent fix                                                                                                                                                                                                | Exact decision/requirement/spec language                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------: | -------------------------: | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Preview counts recipients in the browser, recovery filters join unbounded task/comments/directories by code, or telemetry tags actor/source-work IDs. | Large Tenants see slow/stale prompts; monitoring cardinality and privacy cost grow with people and work volume. |   Medium | Low–Medium after amendment | **Current architecture:** source can compute current responsibility set; only three low-cardinality codes exist. | Adds no reason-driven routing query or premature index. | Set-based indexed source post-state computation; receipt-ID lookup; no context index until measured query need; low-cardinality aggregate metrics without actor/work dimensions; load-test largest Tenant shapes. | **D34-R10, R19, R25:** “Context SHALL add constant-size write cost and no directory/body scan or high-cardinality telemetry.” |

### 17. Operational burden

**Material concern: Yes — even three codes require ownership, translation,
support, versioning, retention, incident handling, and evidence-based change.**

| What could go wrong                                                                                                                                 | Why it matters                                                                 | Severity |  Likelihood | Evidence or reasoning                                                   | Effect on current answer                 | Best permanent fix                                                                                                                                                          | Exact decision/requirement/spec language                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------: | ----------: | ----------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Teams add ad hoc translations/codes, directly repair rows, interpret high `other` rates as a request for prose, or cannot render a retired version. | Small ministries and operators inherit recurring cleanup and tribal knowledge. |   Medium | Medium–High | **Repository:** closed catalogs need owner/UI/recovery/telemetry/tests. | Adds named ownership and a removal path. | Website source owner + Product/Privacy/Localization governance; immutable historical resources; typed repair/roll-forward; monitor `other`; remove prompt before expanding. | **D34-R13, R20, R28, R30:** “Catalog maintenance SHALL be code-owned, versioned, documented, and evidence-triggered—not direct data administration.” |

### 18. Observability and auditability gaps

**Material concern: Yes — source audit, technical execution, user engagement,
and privacy-safe product learning can be conflated.**

| What could go wrong                                                                                                                                                                | Why it matters                                                                                          | Severity |  Likelihood | Evidence or reasoning                                                                                                 | Effect on current answer                       | Best permanent fix                                                                                                                                                                        | Exact decision/requirement/spec language                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------: | ----------: | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| A log line or Inngest success is treated as proof of the chosen context/return; metrics lack code version/result; dashboards attach actor; staff cannot see who selected the hint. | Incidents are hard to diagnose, business history is untrustworthy, and monitoring becomes surveillance. |     High | Medium–High | **ADR/OpenSpec:** product audit and executor telemetry are distinct. **ICO:** attributed opinion needs circumstances. | Adds three evidence planes and named monitors. | Immutable source receipt with actor/result/code/version/scopes; body-free task projection audit; technical causal IDs only; aggregate low-cardinality product metrics; no person metrics. | **D34-R7, R11, R17–R20, R25, R29:** “Only the source receipt proves the transition and selected context; telemetry proves execution only.” |

### 19. Dependency and integration risks

**Material concern: Yes — no new external dependency is necessary, but
Payload, Tasks Hub, localization, directory, Realtime, analytics, and Inngest
can become accidental context stores or authorities.**

| What could go wrong                                                                                                                                              | Why it matters                                                                                                           | Severity | Likelihood | Evidence or reasoning                                                          | Effect on current answer                                                    | Best permanent fix                                                                                                                                         | Exact decision/requirement/spec language                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------: | ---------: | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A workflow event carries code/actor, Payload stores it with content, task JSON copies it, analytics provider receives it, or missing localization blocks return. | Vendor/schema changes expose personal context, create dual ownership, and make core recovery depend on optional systems. |     High |     Medium | **OpenSpec:** events identifier-only; orchestrator/CMS/tasks not source truth. | Keeps all integrations reference-only and non-blocking after source commit. | Source receipt/renderer; identifier-only outbox; current authorized reload; safe localization fallback; sink schema tests; no external analytics property. | **D34-R18–R20, R25:** “No integration may carry, persist, interpret, or gate on the context; it receives only the source transition reference it needs.” |

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes — old and new clients, nullable schema, catalog
versions, and rollback can create invalid writes or fabricated history.**

| What could go wrong                                                                                                                                                                                  | Why it matters                                                                                             | Severity |              Likelihood | Evidence or reasoning                                                                                             | Effect on current answer                              | Best permanent fix                                                                                                                                                                                                                       | Exact decision/requirement/spec language                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------: | ----------------------: | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Old UI returns the final recipient without context; new UI talks to old server; dual writes copy into tasks; backfill fabricates values; rollback drops committed fields or strands the escape path. | Ownerless work and historical meaning differ across deployment versions; safe rollback becomes impossible. |     High | High without sequencing | **Current repo:** multiple task systems and generic writers. **Repo rule:** additive mixed-version compatibility. | Requires reader/denial-first rollout and no backfill. | Add nullable readers and historical renderer; add registry/constraints; block invalid old writers; expose prompt only when server advertises contract; canary one source; kill switch blocks gap-return only; preserve data on rollback. | **D34-R12–R14, R26–R27:** “Mixed versions SHALL fail without mutation, and rollback SHALL preserve every committed source transition/context.” |

### 21. Testability, traceability, and proof

**Material concern: Yes — a happy-path radio test cannot prove conditional
requiredness, RLS, privacy, races, versioning, accessibility, or absence from
forbidden sinks.**

| What could go wrong                                                                                                                                                                                  | Why it matters                                                                      | Severity | Likelihood | Evidence or reasoning                                                                                   | Effect on current answer                                      | Best permanent fix                                                                                                                                                                                                       | Exact decision/requirement/spec language                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------: | ---------: | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Tests assert one selected label but miss named/covered null rules, last-recipient race, caller-forged state, service-role bypass, old clients, logs/events/exports, translations, or keyboard focus. | The implementation appears finished while the permanent invariants remain unproved. |     High |       High | **Repository:** stable public seams, TDD for runtime, deterministic docs trace, manual a11y beyond axe. | Adds the acceptance portfolio below and end-to-end trace IDs. | Decision→glossary→ADR→OpenSpec→design→ticket→implementation→test→release mapping; DB/API/UI negative matrix; real database RLS/concurrency; sink inspections; manual and automated accessibility/comprehension evidence. | “Every D34 rule and acceptance criterion SHALL retain the same term, code, trigger, non-effect, and source owner across all artifacts.” |

### 22. Other development hazards

**Material concern: Yes — D34 can become a punitive personnel signal, access
request, generic delegation policy, or rationale for autoassigning protected
work.**

| What could go wrong                                                                                                                                     | Why it matters                                                                                                                  | Severity |       Likelihood | Evidence or reasoning                                                                                                                                                     | Effect on current answer                           | Best permanent fix                                                                                                                                                            | Exact decision/requirement/spec language                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------: | ---------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| “Frequent returner” labels, manager alerts, AI target choice, bulk departure mapping, access grants, or compulsory explanations are built on the codes. | Staff avoid truthful returns, protected work reaches the wrong people, and a humane escape becomes disciplinary infrastructure. | Critical | Medium aggregate | **Platform principles:** safety/permission/operational truth outrank convenience. **Product judgment:** user-provided context has insufficient trust for any such effect. | Adds explicit non-effects and governance monitors. | No person-level consumption; no permission/routing/AI/bulk effect; independent source authorization for every later action; privacy/security review for any proposed new use. | **D34-R8–R9, R15, R27–R30:** “D34 SHALL create no access, routing, public, financial, automated, bulk, or personnel authority.” |

## Acceptance criteria

### Decision, trigger, and vocabulary

1. **D34-AC001 — Selected direction.** D34 records Option 1 with the exact
   conditional, three-code, context-only amendments in this review.
2. **D34-AC002 — Strongest alternative.** The design records no-context as the
   fallback if representative evidence fails to prove recovery benefit.
3. **D34-AC003 — Canonical term.** Every artifact uses **Return recovery
   context** for the actor-selected hint and **Source transition reason** for
   source-derived state.
4. **D34-AC004 — Named-handoff exclusion.** A named handoff neither requests nor
   persists D34 context.
5. **D34-AC005 — Covered-return exclusion.** A return where every selected
   scope retains another current recipient neither requests nor persists D34
   context.
6. **D34-AC006 — Gap-return inclusion.** A recipient-initiated return that
   would create **Needs assignment** for at least one exact selected scope
   requires context.
7. **D34-AC007 — System-event exclusion.** Authorization loss, deactivation,
   source terminality, system recovery, and other non-recipient outcomes never
   fabricate D34 context.
8. **D34-AC008 — Manager-action exclusion.** A manager removal cannot
   impersonate a recipient-selected D34 value; its governance remains separate.
9. **D34-AC009 — Website v1 codes.** The only accepted v1 codes are
   `responsibility_mismatch`, `cannot_take_current_work`, and `other`.
10. **D34-AC010 — Localized labels.** The current staff locale renders **This
    work belongs with someone else**, **I can't take this work**, and
    **Something else**, or approved semantically equivalent translations.
11. **D34-AC011 — No default.** New/reloaded panels have no selected context;
    the client/server/database provide no default.
12. **D34-AC012 — One choice.** A qualifying command admits exactly one code,
    never zero or more than one.
13. **D34-AC013 — Honest escape.** `other` is always available so a user is not
    forced to assert either specific category.
14. **D34-AC014 — No elaboration.** Selecting `other` reveals no text, note,
    comment, attachment, mention, or follow-up question.
15. **D34-AC015 — Meaning stability.** A stored code/version never changes
    historical meaning; changed semantics require a new governed version/code.

### UX, UI, accessibility, and international use

16. **D34-AC016 — Existing entry point.** Context remains inside D33's one
    responsive **This needs someone else** source-led panel.
17. **D34-AC017 — No nested flow.** D34 adds no second modal, wizard page,
    generic task form, or confirmation after the source consequence preview.
18. **D34-AC018 — Consequence first.** The panel explains which exact scopes
    will have no owner and where recovery appears before asking for context.
19. **D34-AC019 — Clear question.** The group asks **What is the main reason
    you're returning this work?** and explains its recovery-only purpose.
20. **D34-AC020 — Humane labels.** User copy avoids blame, role/capability
    diagnosis, HR language, idioms, and requests for personal detail.
21. **D34-AC021 — Helpful descriptions.** Each option has at most one concise,
    translatable helper sentence that distinguishes its recovery guidance.
22. **D34-AC022 — Base Maia composition.** The UI reuses shared `@asym/ui`
    Base UI/Base Maia RadioGroup, Label, Button, Card, and responsive
    Sheet/Dialog primitives with semantic tokens.
23. **D34-AC023 — No parallel primitives.** No app-local radio/dialog, Radix,
    React Aria, alternate shadcn style, hardcoded palette, or new component
    library is introduced.
24. **D34-AC024 — Programmatic group.** The choices expose one accessible group
    name, descriptions, checked state, requiredness, and error association.
25. **D34-AC025 — Keyboard operation.** Tab/Shift+Tab, radio arrow keys,
    Enter/Space, Escape, and Close follow the established primitive behavior
    and logical visual order.
26. **D34-AC026 — Visible focus.** Every control has visible token-compliant
    focus; opening focus is intentional and closing/cancel restores it to the
    recovery trigger.
27. **D34-AC027 — Touch targets.** Every option/action exposes at least a
    44-by-44 CSS-pixel target without depending on hover or swipe.
28. **D34-AC028 — Missing-choice error.** Submit without selection keeps the
    panel open and shows **Choose why this work needs reassignment.** inline and
    programmatically.
29. **D34-AC029 — Error focus.** Missing-choice submit moves focus to the group
    or an accessible error summary and retains all safe panel state.
30. **D34-AC030 — Submit discoverability.** Requiredness is not communicated
    only by disabling the final button; client and server validation remain
    discoverable to keyboard and screen-reader users.
31. **D34-AC031 — Consequence-led buttons.** The final action says **Return for
    reassignment** and the safe alternative says **Keep assigned to me** or a
    semantically exact equivalent.
32. **D34-AC032 — Loading state.** Submit becomes non-repeatable while pending,
    exposes busy/status semantics, and names the action without optimistic
    source mutation.
33. **D34-AC033 — Persistent result.** Success, stale refresh, denial, conflict,
    and retry guidance remain visible in the panel/current detail; toast alone
    is insufficient.
34. **D34-AC034 — Reflow.** The complete journey works at 320 CSS pixels and
    400% zoom without clipped controls or horizontal scrolling.
35. **D34-AC035 — International presentation.** Long translations, CJK, RTL,
    Unicode names, automatic direction, text spacing, forced colors, high
    contrast, reduced motion, screen magnification, safe areas, and virtual
    keyboards preserve meaning and operation.
36. **D34-AC036 — Weak network.** Candidate/context resources do not require a
    new provider round trip; offline submit is not queued; network errors keep
    selection in page memory only and revalidate before retry.
37. **D34-AC037 — No remembered answer.** Reload, logout, Tenant/source switch,
    terminal source change, and stale refresh clear an unfinished selection.
38. **D34-AC038 — Mixed-scope explanation.** The panel names which selected
    scopes become ownerless and which remain covered without exposing
    unauthorized recipient identity.
39. **D34-AC039 — Mixed-context choice.** One context may apply to the exact
    ownerless subset; staff who need materially different contexts can return
    scopes separately rather than multi-select reasons.
40. **D34-AC040 — Safe missing translation.** A historical missing/retired
    translation renders **Return context unavailable** or approved safe copy,
    never a raw code or crash.

### Source ownership, persistence, integrity, and authorization

41. **D34-AC041 — Source owner.** Website operational workflow in Asym
    Postgres owns context requiredness, registry/version, accepted selection,
    gap scopes, transition, receipt, recovery display, and retention.
42. **D34-AC042 — Tasks boundary.** Tasks Hub invokes/references the source but
    cannot create, update, delete, infer, copy, or interpret context.
43. **D34-AC043 — CMS boundary.** Payload/CMS stores no D34 context, code,
    label, actor selection, or responsibility truth.
44. **D34-AC044 — Transition fields.** The immutable source receipt stores a
    nullable code/version pair and an exact relational/digest binding to gap
    scopes.
45. **D34-AC045 — Pair constraint.** Code and version are both null or both
    present; no half-populated state is valid.
46. **D34-AC046 — Result constraint.** Context is present if and only if the
    admitted recipient return created at least one **Needs assignment** scope.
47. **D34-AC047 — Closed-code constraint.** The database/command boundary
    rejects arbitrary, unknown, retired-for-write, or Tenant-defined values.
48. **D34-AC048 — No JSON escape.** JSON/details/events cannot carry custom
    codes, labels, prose, notes, mappings, or action consequences.
49. **D34-AC049 — No task-field reuse.** `dismissed_reason`,
    `suppressed_reason`, task comments/descriptions/events, and mutable assignee
    fields remain forbidden storage.
50. **D34-AC050 — No Support reuse.** Support Hub move/bulk-move free-text
    reason data and rules are not reused, synchronized, or migrated.
51. **D34-AC051 — No D30 reuse.** Protected Request-changes explanation/anchor
    content never enters context selection, payload, receipt text, or history.
52. **D34-AC052 — Trusted Tenant.** Tenant/environment/Site/source ownership is
    derived from trusted server/source state and cannot be overridden by the
    command payload.
53. **D34-AC053 — Trusted actor.** Actor/Party/role/audit attribution derives
    from the authenticated current server context; caller-supplied identity is
    ignored/rejected.
54. **D34-AC054 — Trusted result.** The source recomputes current recipients and
    gap scopes in the transaction; caller flags/counts/task rows are never
    authoritative.
55. **D34-AC055 — Initiator authority.** The actor must still be responsible
    for and authorized to return every selected exact action scope at commit.
56. **D34-AC056 — Recovery-surface proof.** A gap return is admitted only when
    the source can prove an authorized, current recovery surface; D34 context
    itself never supplies that proof.
57. **D34-AC057 — No browser write grant.** Browser roles have no direct
    INSERT/UPDATE/DELETE on transitions/context.
58. **D34-AC058 — Read `USING`.** Read policy checks current exact Tenant,
    source, purpose, and viewer authorization for the existing row.
59. **D34-AC059 — Write `WITH CHECK`.** The mutation boundary checks the
    resulting Tenant, actor, source, operation, result, scopes, code/version,
    and receipt relationships.
60. **D34-AC060 — Immutable history.** Ordinary application roles cannot update
    or delete a committed context/receipt; later transitions do not rewrite it.

### Privacy, retention, observability, and humane use

61. **D34-AC061 — Minimum data.** D34 stores only stable code, version, scope
    binding, trusted attribution, and existing receipt metadata—no prose or
    extra personal facts.
62. **D34-AC062 — Self-report wording.** Authorized history says the actor
    **selected** a label; it never presents the value as a verified cause.
63. **D34-AC063 — Returning-actor receipt.** The actor may see their selected
    label on the immediate/current authorized source receipt.
64. **D34-AC064 — Recovery-viewer access.** Only independently current source-
    authorized recovery/audit users can see the label/attribution later.
65. **D34-AC065 — Successor non-disclosure.** A future assignee does not gain
    predecessor-context visibility merely by receiving the work.
66. **D34-AC066 — Task-list minimization.** Personal/shared task lists and
    successor task detail show the source work and outcome, not the code/label.
67. **D34-AC067 — Notification minimization.** In-app notification, email,
    push, digest, and delivery previews contain no context or actor-linked hint.
68. **D34-AC068 — Search/AI exclusion.** Context is absent from generic search,
    embeddings, AI prompts/indexes/training, suggestions, and autonomous agents.
69. **D34-AC069 — Export exclusion.** Generic Tasks Hub, CRM, audit-summary,
    and Tenant data exports do not include context absent a separately governed
    exact source-custody purpose.
70. **D34-AC070 — Log/trace exclusion.** Technical logs, traces, errors, cache
    keys, workflow events, and analytics events contain no code, label, actor,
    or work identity combination.
71. **D34-AC071 — Safe aggregate metrics.** Product telemetry may count only
    low-cardinality code/version/result without actor, work identity, protected
    subject, destination, or free-form dimensions.
72. **D34-AC072 — No individual reporting.** No staff profile, dashboard,
    leaderboard, quota, workload, availability, leave, discipline, compensation,
    promotion, or performance product consumes context.
73. **D34-AC073 — No inferred sensitive fact.** `cannot_take_current_work` is
    never evidence of health, disability, leave, capacity, willingness,
    conduct, employment status, or future availability.
74. **D34-AC074 — No inferred fault.** `responsibility_mismatch` is never proof
    an administrator, resolver, manager, or prior actor made an error.
75. **D34-AC075 — Purpose display end.** Active recovery presentation drops the
    context after the gap is resolved, while source audit retention remains
    separately governed.
76. **D34-AC076 — Source schedule.** Context retains/disposes under the
    Website responsibility-transition Records Schedule Contract, with schedule
    version, trigger, hold, and disposition evidence.
77. **D34-AC077 — No indefinite structured-data exception.** The code is not
    retained forever merely because it is structured or small.
78. **D34-AC078 — Identity disposition.** Party/actor tombstoning or governed
    identity disposition is independent of immutable transition meaning.
79. **D34-AC079 — Business audit separation.** The source receipt proves actor
    selection and transition; task projection audit proves presentation;
    technical telemetry proves execution only.
80. **D34-AC080 — Privacy correction.** Any legally required attribution or
    privacy correction uses a separately governed append-only/quarantine path,
    never silent update-in-place or task edit.

### Concurrency, idempotency, failure, and recovery

81. **D34-AC081 — Non-mutating preparation.** Open, preview, select, Back,
    close, Escape, reload, or network loss writes no context or transition.
82. **D34-AC082 — Expected heads.** Preview returns and commit checks exact
    responsibility, source, policy, authorization, and context-contract heads.
83. **D34-AC083 — Two-return race.** Two covered previews cannot jointly create
    a gap; the stale second actor refreshes and must select context.
84. **D34-AC084 — Recipient-added race.** If another recipient appears after
    the prompt, commit rejects; refreshed covered return stores no selection.
85. **D34-AC085 — Recipient-removed race.** If coverage disappears after a
    covered preview, commit rejects; refreshed gap return requires context.
86. **D34-AC086 — Source-terminal race.** Completion, cancellation,
    supersession, or other source terminality wins and writes no return context.
87. **D34-AC087 — Authorization race.** Actor authorization/responsibility loss
    rejects without recording a user reason for the system-derived end.
88. **D34-AC088 — Catalog race.** A contract/version change rejects the stale
    selection and reloads current choices without mutation.
89. **D34-AC089 — Atomicity.** No committed source transition can lack its
    required code/version/scope binding or leave only a context without the
    responsibility result.
90. **D34-AC090 — Semantic fingerprint.** Idempotency covers Tenant, source
    occurrence, exact scopes/order, operation, target absence, expected heads,
    gap digest, code, version, and governing policies.
91. **D34-AC091 — Exact replay.** Same semantic key and meaning returns the
    original receipt without a second transition or question.
92. **D34-AC092 — Changed-code conflict.** Same key with a different code,
    scope, operation, or expected head returns a typed semantic conflict.
93. **D34-AC093 — Lost response.** Receipt lookup recovers committed result and
    selected label only for a still-authorized viewer.
94. **D34-AC094 — Projection failure.** Source success remains authoritative if
    task/attention projection fails; source-driven reconciliation repairs it.
95. **D34-AC095 — Old-event monotonicity.** Late/duplicate projection events
    cannot reopen a recovered gap or overwrite newer responsibility/context.
96. **D34-AC096 — No offline queue.** The client never queues a return for later
    background commit after state/authorization may have changed.
97. **D34-AC097 — Safe dependency uncertainty.** Partial, timeout,
    contradictory, corrupt, over-limit, or indeterminate source proof never
    becomes a successful gap return or default context.
98. **D34-AC098 — Typed errors.** Missing, invalid, stale, unauthorized,
    conflict, dependency, and terminal outcomes have closed permission-safe
    responses and clear next actions.
99. **D34-AC099 — Recurrence identity.** Later genuine recurrence uses a new
    source-work identity and new context decision if it again qualifies.
100.  **D34-AC100 — Recovery independence.** Recovery remains possible from
      current source state/receipt if Tasks Hub, Payload, Realtime, analytics,
      localization service, or Inngest is unavailable.

### Integration, migration, cross-domain evolution, and proof

101. **D34-AC101 — Identifier-only workflow.** Any asynchronous event carries
     only product dispatch/transition identifiers and no context/actor/body.
102. **D34-AC102 — Executor non-authority.** Inngest cannot validate, default,
     infer, map, rank, retain, or certify context or wait for human recovery.
103. **D34-AC103 — Product claims.** Product database uniqueness, work claims,
     dispatch ledger, and current reads—not provider dedupe windows—own
     permanent idempotency/recovery.
104. **D34-AC104 — Reader-first rollout.** Historical readers/safe fallback and
     policy-aware preview responses deploy before D34-capable writes.
105. **D34-AC105 — Constraint-before-writer.** Code/version/result constraints
     and invalid-combination denial activate before any UI can commit context.
106. **D34-AC106 — Old-client safety.** An old client attempting a qualifying
     gap return gets `recovery_context_required` and writes nothing; its named
     and covered transitions remain compatible when current policy admits.
107. **D34-AC107 — New-client/old-server safety.** A new UI does not simulate
     D34 when the server/source contract does not advertise the version.
108. **D34-AC108 — No fabricated backfill.** Historical task reasons, comments,
     Support prose, D30 text, assignees, events, logs, timestamps, and outcomes
     never become D34 values.
109. **D34-AC109 — Prior-contract history.** Historical absence is represented
     by the transition's governing prior contract, not a fake `other` choice.
110. **D34-AC110 — Canary and kill switch.** Rollout starts with one qualified
     Website contract/cohort; a source-surface flag can stop new gap returns
     while preserving named handoff, covered return, history, and source work.
111. **D34-AC111 — Roll-forward rollback.** Disabling the feature never drops or
     rewrites committed code/version/receipt; re-enable reads and reconciles it.
112. **D34-AC112 — No dual writes.** No release writes the same context to
     source receipt plus task, notification, event, comments, or analytics
     storage.
113. **D34-AC113 — Future-source opt-in.** Mobilize or another producer adopts
     only the safe envelope after a source-specific problem/evidence/meaning/
     visibility/retention decision; Website labels are not inherited.
114. **D34-AC114 — Tenant boundary.** No Tenant setting can customize or attach
     operational consequences to the catalog.
115. **D34-AC115 — Database matrix proof.** Tests cover every valid/invalid
     transition-result-code-version-nullability-scope combination.
116. **D34-AC116 — Authorization proof.** Real-database tests cover same/cross
     Tenant, environment, Site, source, actor, purpose, `USING`, `WITH CHECK`,
     service-role/owner/definer, worker, import, support, export, and AI paths.
117. **D34-AC117 — Race/idempotency proof.** Tests cover both-last-recipient,
     add/remove recipient, terminality, policy/auth changes, lost response,
     exact replay, changed meaning, late events, and recurrence.
118. **D34-AC118 — Sink/privacy proof.** Tests and schema inspections prove no
     context in task/notification/email/CMS/event/log/trace/cache/search/AI/
     generic-export/person-report sinks.
119. **D34-AC119 — UX/accessibility proof.** Automated and manual evidence
     covers no-default, conditional absence/presence, errors, keyboard/focus,
     screen reader, touch, 320px/400%, forced colors, reduced motion,
     translations, RTL/CJK, weak network, and every async state.
120. **D34-AC120 — Traceability and research gate.** Every D34 rule traces
     consistently through glossary, ADR, later OpenSpec/design/tasks/tickets/
     implementation/tests/release evidence, and Live activation requires
     representative comprehension/recovery evidence that the three choices
     improve the no-context alternative without punitive interpretation.

## Named monitors

These are implementation obligations, not a claim that telemetry exists now.
Every monitor is Tenant-safe and excludes actor/work/protected-subject
dimensions unless the response explicitly requires authorized source-incident
investigation.

| Signal                                          |                                                                                                                                                     Threshold | Owner                                 | Required response                                                                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------: | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `return_context_missing_required_total`         |                                                                                             Any accepted qualifying gap return without one valid code/version | Website source owner + Data Platform  | Fence the writer cohort, preserve current source work, reconcile receipts, repair command/constraint, add regression before re-enable. |
| `return_context_forbidden_extra_total`          |                                                                   Any named handoff, covered return, system outcome, or manager action persisting D34 context | Website source owner + Privacy        | Stop writer, remove only unauthorized surplus through governed repair, preserve transition history, fix compatibility matrix.          |
| `return_context_free_text_total`                |                                                              Any D34 prose, note, attachment, mention, copied feedback, or custom value accepted or persisted | Security + Privacy                    | Reject/stop sink, quarantine or remove where lawful, assess exposure, add structural denial.                                           |
| `return_context_unknown_code_success_total`     |                                                                                          Any unregistered, Tenant-defined, or retired-for-write code accepted | Data Platform                         | Disable writer, restore manifest/version parity, reconcile affected receipts, never coerce to `other`.                                 |
| `return_context_cross_scope_total`              |                                                                 Any cross-Tenant/environment/Site/source/purpose read, write, reference, cache, or projection | Security + Data Platform              | P0 containment, stop path, preserve evidence, assess disclosure, repair RLS/FK/cache and notify under policy.                          |
| `return_context_stale_head_success_total`       |                                                                                             Any stale responsibility/source/policy/auth/context head accepted | Website source owner                  | Disable command, repair CAS, inspect every affected successor generation and projection.                                               |
| `return_context_changed_key_success_total`      |                                                                                   Any semantic key accepts a different code, scopes, operation, or gap result | Data Platform                         | Fence writer, reconcile conflicting receipts, repair canonical fingerprint and negative tests.                                         |
| `return_context_routing_effect_total`           |                                                                                    Any code changes eligibility, target, route, scope, permission, or ranking | Website source owner + Security       | Disable consumer/automation, restore source-authorized state through audited correction, inspect all consumers.                        |
| `return_context_priority_time_effect_total`     |                                                                      Any code changes urgency, priority, due date, reminder, escalation, SLA, or notification | Tasks Hub + Website Product           | Disable mapping, remove derived state where governed, restore context-only contract.                                                   |
| `return_context_completion_public_effect_total` |                                                                                      Any code affects source/task completion, publication, Giving, or finance | Website source owner + Product Safety | Stop-ship/P0, restore authoritative state, remove coupling, expand invariant tests.                                                    |
| `return_context_personnel_use_total`            |                                       Any person-level workload, availability, health/leave, ranking, performance, discipline, compensation, or promotion use | Privacy + Product Governance          | Disable report/model/alert, contain and dispose derived dataset under policy, conduct governance review.                               |
| `return_context_prohibited_sink_total`          | Any code/label/actor/work combination in task list, notification, email, CMS, event, log, trace, cache key, search, AI, generic export, or external analytics | Security + owning sink                | Stop emitter, purge unsafe copies where permitted, assess incident, repair schema/contract tests.                                      |
| `return_context_unauthorized_read_total`        |                                                                                   Any viewer without exact current source-recovery/audit purpose sees context | Security + Website                    | Contain access, revoke cache/projection, repair read model/RLS, assess disclosure.                                                     |
| `return_context_other_rate`                     |                                                                                            Above 25% with at least 40 qualifying returns in a rolling 30 days | Website Product + UX Research         | Study representative cases and whether the prompt helps; remove/reword through a new version, never reflexively add prose/categories.  |
| `return_context_mismatch_repeat_rate`           |                                                                  Above 15% with at least 30 qualifying returns for one source-contract/action kind in 30 days | Website source owner                  | Inspect responsibility/action modeling and representative cases; fix source rules, never score actors.                                 |
| `return_context_prompt_abandonment_rate`        |                                        Above 15% with at least 40 eligible panel sessions in 30 days, or 5 percentage points above the pre-prompt return step | Product UX + Research                 | Inspect necessity/copy/mobile/a11y/latency; pause cohort expansion above threshold; prefer removing prompt to adding defaults.         |
| `return_context_invalid_submit_rate`            |                                                                                                             Above 5% for 30 minutes with at least 20 attempts | Web Platform + Product UX             | Inspect instruction, focus, validation, state races, and translations; preserve server guard.                                          |
| `return_context_stale_preview_rate`             |                                                                                                                  Above 5% with at least 50 attempts in 7 days | Website Platform                      | Inspect contention/cache freshness and shorten preview-to-commit journey without weakening CAS.                                        |
| `return_context_translation_missing_total`      |                                                                                                    Any missing label/helper/error in a supported staff locale | Localization owner + Web Platform     | Use safe fallback, block locale expansion if material, restore complete resources/tests.                                               |
| `return_context_raw_code_visible_total`         |                                                                                                                 Any user-visible raw catalog key/version/code | Product UX + Localization             | Correct presentation immediately and inspect every renderer/export/support artifact.                                                   |
| `return_context_a11y_serious_total`             |                                                      Any serious/critical automated issue or any manual keyboard/focus/screen-reader blocker before expansion | Accessibility owner + Tasks UX        | Block release/cohort expansion, repair shared composition, repeat independent manual and automated proof.                              |
| `return_context_mobile_success_rate`            |                                                   Below 90% of eligible canary attempts, or more than 5 points below desktop with at least 40 mobile attempts | Product UX + Web Platform             | Inspect reflow, targets, copy, focus, virtual keyboard, latency; block expansion until repaired.                                       |
| `return_context_projection_lag_seconds`         |                                                                                             p95 above 60 seconds for 15 minutes or any item above 300 seconds | Tasks Hub + Workflow Platform         | Reconcile from source receipt, inspect outbox/worker/Realtime, keep source presentation truthful.                                      |
| `return_context_dead_letter_age_seconds`        |                                                                                                      Any related projection dead letter older than 15 minutes | Workflow Platform + Tasks Hub         | Run product-owned reconciliation and escalate under Tenant notification policy without exposing context.                               |
| `return_context_legacy_bypass_total`            |                                                                                  Any gap return committed through old/generic task/UI/API/import/support path | Release Engineering + Source Security | Fence affected routes, reconcile source truth, repair version gate and negative coverage.                                              |
| `return_context_manual_db_repair_total`         |                                                                    Any direct context/source-state repair not expressed as a governed receipt-derived command | Data Platform                         | Stop ad hoc repair, preserve incident evidence, build/use audited roll-forward recovery and document cause.                            |

## Ruthless synthesis

### Facts, judgments, assumptions, and unknowns

**Verified repository facts**

- Source responsibility and its transition are authoritative; Tasks Hub is a
  subordinate projection.
- Current generic task reason/comment/JSON fields do not satisfy this source,
  scope, authorization, immutability, or retention contract.
- Support Hub and D30 already have different purpose-owned prose contracts;
  neither is a generic reassignment precedent.
- Core requires Base Maia/Base UI/Zinc semantic composition, trusted server
  mutation boundaries, Tenant isolation, identifier-only workflow envelopes,
  closed code governance, and accessibility beyond automated checks.

**Verified external facts**

- Mature products commonly keep ordinary reassignment low-friction while
  conditionally requesting validated input on selected exceptional
  transitions.
- State-bound closed choices, no radio preselection, clear group/error
  semantics, and collecting only information needed for a stated purpose are
  established current practices.

**Product judgments**

- Three choices are clearer and less brittle than the four provisional labels.
  “Not the right person” and “different role/kind of work” overlap in the first
  recovery step and would create arbitrary reporting distinctions before user
  evidence justifies them.
- **Something else** is safer than forcing “I am unsure who” because a person
  may know the reason while none of the admitted categories fits.
- The choice is a triage hint only. Any recommendation or automatic use would
  change the decision and require new evidence/governance.

**Assumptions that implementation may not present as fact**

- Ownerless Website returns occur often enough for one extra choice to provide
  material recovery value.
- Authorized recovery staff will act differently on responsibility mismatch
  versus current inability.
- Staff across ministry sizes and supported locales will interpret the labels
  consistently and will not experience the prompt as punitive.

**Unresolved unknown**

- D34 does not decide who, if anyone, receives a personal recovery item when
  source work enters **Needs assignment**. D35 asks that single question below.

### What must be resolved before recording D34

Resolved in this decision:

1. the exact qualifying post-state and initiator;
2. the three-code v1 vocabulary and self-report semantics;
3. no default, prose, optional note, Tenant catalog, or AI classification;
4. source ownership, conditional database invariant, authorization, and
   canonical idempotency;
5. context-only recovery guidance and every prohibited downstream use;
6. one accessible Base Maia interaction and every significant state; and
7. the evidence-bound removal rule.

No further founder choice is required to record D34.

### Requirements that must enter later OpenSpec/design

1. Add the **Return recovery context** definition and closed source contract.
2. Specify the operation/result/code/version/scope compatibility matrix and
   typed response vocabulary.
3. Specify purpose-specific `USING`/`WITH CHECK`, grants, privileged paths,
   same-scope relationships, append-only audit, and source records schedule.
4. Specify preview/commit heads, semantic fingerprint, receipt recovery,
   projection monotonicity, and identifier-only workflow handoff.
5. Specify exact presentation/read consumers and prohibited sink schemas.
6. Specify mixed-version rollout, no-backfill posture, kill switch, and
   roll-forward recovery.
7. Trace D34-R1–R30 and D34-AC001–AC120 into design, tickets, tests, and release
   evidence without changing vocabulary or meaning.

### Implementation safeguards that are mandatory

1. Implement policy-aware readers and invalid-write denial before the writer.
2. Keep the command in `packages/api` and the record in the operational source;
   do not retrofit generic task mutation.
3. Enforce conditional combinations structurally and test real database/RLS
   seams, including service-role/owner/definer paths.
4. Reuse shared Base Maia primitives; perform manual keyboard/focus/screen-
   reader/reflow/international/weak-network proof in addition to automated
   tests.
5. Inspect task, notification, event, log, trace, cache, search, AI, export,
   CMS, and analytics schemas for absence—not just UI hiding.
6. Canary one Website source contract, watch the named signals, and preserve a
   source-surface kill switch that never rewrites committed history.

### Risks to monitor

Only the 26 signals in the monitor table are placed in **monitor**. Each has a
named threshold, owner, and response. Correctness, authorization, Tenant
isolation, privacy sinks, non-effects, migration compatibility, and
accessibility are release-blocking requirements rather than risks deferred to
monitoring.

### Ordered permanent path

1. Record D34 and reconcile D33, glossary, ADR-0181, ADR-0183, and the Phase 34
   Tasks Hub roadmap note.
2. Complete D35 so ownerless recovery has an intentional discovery/
   responsibility policy rather than an inferred broadcast.
3. During `/to-spec`, define the precise source contract and cross-artifact
   acceptance mapping; do not implement from this PRD alone.
4. During design, choose the simplest repository-native relational constraint
   that makes the compatibility matrix impossible to violate; no generic
   reason service or Tenant builder.
5. Implement readers/denials, then source command/receipt, then the Base Maia
   conditional panel, then identifier-only projection/reconciliation.
6. Prove database/RLS/concurrency/idempotency/privacy-sink/accessibility/
   localization/migration behavior and representative staff comprehension.
7. Canary, evaluate recovery benefit against Option 3, and expand only while
   the evidence supports keeping the prompt.

## Migration, rollout, and rollback sequence

1. Amend durable decision artifacts and define the source contract/version.
2. Add nullable historical readers and safe unknown-version presentation.
3. Add code-owned registry/constraint and the operation-result-nullability
   guard with no default.
4. Add current preview responses that advertise whether context is required
   and which version is active.
5. Enforce invalid-combination denial on API/RPC/service/worker/support/import
   seams before exposing the writer.
6. Ship the conditional Base Maia UI behind the source-surface flag.
7. Shadow preview-versus-commit posture and sink absence without storing
   unfinished selections or actor-linked analytics.
8. Canary one qualified Website cohort after security/privacy/a11y/
   localization/concurrency proof.
9. Expand only while monitors and representative recovery evidence pass.
10. Rollback disables the new writer/prompt or blocks only qualifying gap
    returns; it preserves all committed transitions and context for roll-
    forward compatibility.

No historical value is inferred. `not_collected_under_prior_contract` is
represented by the governing old contract/version, not by a fake user-selected
code. There is no dual-write interval.

## Required documentation reconciliation

- Amend ADR-0183 through D34 with conditional context, source ownership,
  context-only semantics, Tasks Hub reference-only behavior, and cross-domain
  opt-in.
- Amend ADR-0181 with the Website v1 recovery-context contract and absolute
  separation from D30 protected feedback.
- Add **Return recovery context** to `CONTEXT.md`; explicitly distinguish it
  from Source transition reason and task/comment reasons.
- Add a subsequent-D34 reconciliation note to both D33 research/review
  artifacts and to the independent D34 primary research: the final adversarial
  decision uses three codes rather than its exploratory four-code set.
- Preserve ADR-0182's D29 Review-coordinator route as a different purpose; D35
  must decide any work-recovery route explicitly.
- Amend the Phase 34 roadmap note so future Mobilize source-backed tasks may
  carry a source-owned context reference only after their own decision; they
  never inherit Website labels or reason behavior from Tasks Hub.
- Explicitly cross-reference the conflicting Support Hub move-reason contract
  without changing its existing domain semantics.
- Reserve OpenSpec/schema/runtime/ticket activation for later `/to-spec` and
  implementation workflows; this Grill records product truth only.

## Exact decision to record

> D34 accepts **Context only when it changes recovery** with a narrowed closed
> contract. Named handoff and return with continuing responsibility collect and
> store no context. Only an explicit recipient return whose authoritative
> source post-state creates **Needs assignment** for one or more exact selected
> Source-action scopes requires one **Return recovery context**.
>
> Website v1 offers exactly one unselected choice: `responsibility_mismatch`
> (**This work belongs with someone else**), `cannot_take_current_work` (**I
> can't take this work**), or `other` (**Something else**). `other` reveals no
> text field. No explanation, note, attachment, mention, copied feedback,
> second reason, default, remembered value, Tenant customization, or AI
> classification exists.
>
> The code records only what the actor selected. It does not prove cause,
> capability, availability, fault, eligibility, or source state. It may change
> only permission-safe guidance on the currently authorized Website recovery
> surface. It never changes routing, target, scope, permission, priority,
> urgency, due date, reminder, escalation, notification, completion,
> publication, Giving, finance, HR, member care, or person analytics.
>
> One expected-head source transaction derives the actor and exact resulting
> gap scopes, validates the immutable code/version, appends the complete
> responsibility generation and receipt, and records identifier-only
> projection intent. Context is null for every other transition/result. Code,
> version, and gap-scope digest participate in semantic idempotency; exact
> replay returns the receipt and changed meaning conflicts.
>
> Context belongs only to the operational source receipt. Tasks Hub references
> but does not copy or interpret it. Payload, notifications, email, comments,
> task reasons, Support move reasons, workflow events, logs, search, AI,
> generic exports, caches, external analytics, and future sources are not
> owners or automatic consumers. Visibility and retention remain exact-source,
> purpose-limited, currently authorized, and schedule-bound.
>
> Future sources such as Mobilize may reuse the safe envelope only after their
> own evidence-backed contract; Website labels and meanings are never inferred.
> If representative evidence shows that the choices do not improve recovery or
> are not reliably understood, Core removes the prompt and collects nothing
> rather than adding prose, categories, configuration, or automation.

## D35 — Who receives attention when Website work needs assignment?

### Why this needs a decision

D34 gives an authorized recovery user a small, source-owned hint, but it does
not decide who is responsible for noticing and resolving an ownerless action.
The Website source lane is safe and authoritative but may be missed. Sending a
personal item to every manager/editor would confuse capability with
responsibility and create noise. Requiring a new coordinator roster for every
Tenant would create setup burden unless it provides real accountability.

### Hope Ministries example

Maria returns the final French Page correction and selects **This work belongs
with someone else**. Website now shows **Needs assignment**. Should Ana receive
a personal **Assign returned Website work** item because Hope Ministries named
her for recovery, should authorized staff discover one shared lane, or should
Core alert everyone who can manage Website work?

### Option 1 — shared lane plus optional bounded personal recovery — recommended

Website always shows one source-owned **Needs assignment** row to currently
authorized recovery staff. A Tenant may additionally name one to three
**Website work-recovery coordinators** for the distinct action **Assign
returned Website work**. Only their current authorized intersection receives
one shared source-backed task/attention projection; the first successful source
assignment ends every projection. The roster grants no edit access and is
separate from D29 Review coordinators. No email or recurring reminder is sent
by default.

**Staff/Tenant UX:** zero required setup for a safe discoverable lane; small
teams may opt into clear personal accountability; the same person may be chosen
for both routes only by deliberate separate selection.

**Impact:** one source truth and one shared recovery action, bounded noise, no
capability broadcast, and modest optional configuration.

### Option 2 — source recovery lane only

Website shows the one authorized **Needs assignment** lane, but no personal
task or attention projection is created.

**Staff/Tenant UX:** simplest and quietest. It depends on somebody habitually
checking the lane, so ownerless work may wait without individual
accountability.

**Impact:** least configuration and projection work; greatest discovery risk.

### Option 3 — broadcast every Website manager or capable editor

Every currently authorized Website manager/editor receives personal attention
for each ownerless action.

**Staff/Tenant UX:** no setup, but duplicate attention, unclear ownership, and
alert fatigue; capability is misrepresented as responsibility.

**Impact:** easiest to implement superficially and the least safe/scalable.
Reject.

### Recommendation and exact question

**My recommendation is Option 1 — shared lane plus optional bounded personal
recovery.** It makes the safe no-configuration path complete while letting a
Tenant add explicit accountability without broadcasts, guessed recipients, or
another source of truth.

Do you choose **Option 1 — shared lane plus optional 1–3 work-recovery
coordinators**, **Option 2 — source recovery lane only**, or **Option 3 —
broadcast all authorized Website managers/editors**? You may amend any option.

## Subsequent D35 resolution

D35 accepts Option 1 with required amendments: one source-owned, permission-
filtered Website **Needs assignment lane** always remains available, while a
Tenant may optionally name one to three unordered, co-equal Website work-
recovery coordinators for **Assign returned Website work**. Current exact
Site/source authorization narrows recipients; D35 adds no Site override. The
route grants nothing and is separate from D21/D29. One shared task identity
supports personal assignments/engagement; reading clears only personal unread,
and the first valid D33 source assignment/end receipt alone clears actionable
recovery. D34 context remains protected source-only detail and never selects,
ranks, or notifies recipients. See the [D35 adversarial record](./phase-24-d35-shared-lane-optional-recovery-coordinators-adversarial-review.md).
