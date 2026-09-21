# Phase 24 D34 — conditional recovery context primary research

**Status:** Primary research completed and subsequently reconciled by the final
D34 adversarial decision; not an implementation claim, accepted OpenSpec
capability, migration, or Live behavior

**Research recommendation:** Option 1 — context only when it changes recovery;
the exploratory four-code model below is superseded by the three-code final
contract in the reconciliation note

**Research date:** 2026-08-28

## Subsequent D34 adversarial reconciliation

The founder selected the conditional direction. The final adversarial review
accepted it with a smaller three-code Website v1 contract:

- `responsibility_mismatch` — **This work belongs with someone else**;
- `cannot_take_current_work` — **I can't take this work**; and
- `other` — **Something else**.

The exploratory four-code set below remains primary-research evidence, not the
recorded contract. The final review combines **not right recipient** and
**different Website work** because both initially require authorized recovery
staff to inspect responsibility/action modeling and representative evidence
does not yet prove that staff can distinguish the two reliably. It retains a
non-prose `other` escape rather than forcing an inaccurate uncertainty claim.

The accepted decision also settles context as display-only recovery guidance:
it cannot recommend or automate routing, scope, authorization, priority, time,
notification, completion, public behavior, or personnel judgment. Therefore
the exploratory D35 at the end of this research is superseded. The recorded
D35 instead asks who receives attention when Website work enters **Needs
assignment**. See
[`phase-24-d34-conditional-return-recovery-context-adversarial-review.md`](./phase-24-d34-conditional-return-recovery-context-adversarial-review.md).

## Research question

Should Core ask a staff member why they are returning or handing off one
source-backed Website assignment? If context is useful, when is it required,
what exactly may be collected, who owns it, how is it presented, and what must
it never be allowed to prove or trigger?

D33 already records trusted actor, exact source-action scopes, predecessor,
source/routing/policy/authorization heads, transition outcome, timestamp and a
named successor when one exists. The remaining question is narrower: does an
ownerless return need one additional human-provided recovery signal, or would
that signal be friction, weak data, and unnecessary privacy exposure?

## Evidence labels

- **Repository fact** — directly verified in current Core source, OpenSpec,
  accepted ADRs, glossary, or Phase 24 decision artifacts.
- **Verified external fact** — directly supported by a linked current official
  product, technical, standards, regulatory, security, or accessibility source.
- **Reasonable inference** — a conclusion from several verified facts; not an
  external product guarantee.
- **Product judgment** — the recommended Core choice after applying governing
  repository priorities and comparing alternatives.
- **Assumption** — plausible but not established; implementation may not treat
  it as fact.
- **Unresolved unknown** — requires representative ministry research,
  production evidence, or another founder decision.

## Executive finding

**Choose Option 1 with a precise conditional rule and no free text.**

Collect no user-authored context for:

- a direct source-validated handoff to a named eligible successor; or
- a return where one or more other responsible recipients remain after the
  source transition.

Require exactly one source-owned, code-owned **Recovery context code** only
when the final authoritative transition would leave the exact source-action
scopes in **Needs assignment** with zero responsible recipients. The current
Website v1 choices should be:

| Stable code                     | Localizable staff label                         | Recovery meaning                                                                                    | Explicit non-meaning                                                                        |
| ------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `not_right_recipient`           | **I'm not the right person**                    | The same admitted work appears misrouted to this recipient; recovery should inspect responsibility. | Does not identify or authorize a replacement.                                               |
| `different_website_work_needed` | **This needs a different kind of Website work** | The source scope or responsibility may need correction/splitting before reassignment.               | Does not itself change Page, Navigation, Communications, source scope, role, or permission. |
| `cannot_take_now`               | **I can't take this now**                       | The assignment may be valid, but recovery needs another current owner.                              | Does not establish leave, health, capacity, performance, duration, or availability truth.   |
| `unsure_who_should_take_it`     | **I'm not sure who should take it**             | The actor cannot supply a more specific safe recovery signal.                                       | Does not authorize a generic administrator, coordinator, queue, AI choice, or fallback.     |

Do not include **Other** plus a text box. The explicit uncertainty choice is a
truthful catch-all without pressuring staff to disclose personal, performance,
safeguarding, conflict, health, leave, or ministry information. Do not collect
an optional note, task comment, copied D30 explanation, attachment, mention,
date, reminder, email, source anchor, or guessed source fact.

The stored field is called **Recovery context**, not **reason**, **cause**,
**disposition**, or **resolution**, because it is a staff assertion used to
help triage a responsibility gap. It cannot change source actionability,
eligibility, authorization, routing, task completion, publication, or any
staff/personnel conclusion.

### Immediate product consequence

- Reason UI is absent from ordinary direct handoff.
- Reason UI is absent when a return preserves another responsible recipient.
- The source preview—not the client—decides whether the proposed return would
  create **Needs assignment**.
- If it would, the return panel reveals a four-choice radio group headed **Why
  are you returning this?** and asks staff to choose the main recovery context.
- No choice is preselected. The final button remains consequence-led:
  **Return for reassignment**.
- The final source command rechecks the post-transition responsibility set. A
  stale preview writes nothing and refreshes; it never stores a code that the
  final outcome does not require.
- Only the immutable source responsibility transition receipt stores the
  versioned code. Tasks, notifications, workflow events and generic comments do
  not copy it.
- Authorized source-recovery staff may see the translated context as a triage
  hint. The eventual successor does not receive it in their task by default.
- Aggregate analytics may identify routing-system problems; person-level
  productivity, absence, performance or disciplinary analytics are forbidden.

## Why this is current modern best practice

### Current first-party product evidence

| Official source                                                                                                                                                  | Verified fact                                                                                                                                             | Useful precedent                                                                                    | Core boundary or caution                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [Contentful Entry Tasks](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)                                              | Contentful lets permitted actors reassign tasks through the task update without documenting a required reassignment explanation.                          | Routine known-destination reassignment need not collect prose.                                      | Contentful task authority is not Core source responsibility, and its API warns that assignee access is not guaranteed.                    |
| [Asana task assignment](https://help.asana.com/s/article/assign-tasks-to-teammates?language=en_US)                                                               | Asana treats reassignment as an ordinary assignee change and recommends clear task context; it does not prescribe a reason for each transfer.             | Known successor plus preserved task context can make routine handoff self-explanatory.              | Core uses immutable source transitions rather than a mutable Asana task field.                                                            |
| [Microsoft Planner assignment](https://support.microsoft.com/en-US/Planner/assign-people-to-tasks)                                                               | Planner exposes direct assignment/reassignment from an allowed member list without a mandatory reason.                                                    | Low-friction named handoff is a mainstream expectation.                                             | Plan membership is not sufficient source eligibility in Core.                                                                             |
| [GitHub closing issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/closing-an-issue)                                  | GitHub supports a small structured close reason and makes changing that reason optional in the ordinary close interaction.                                | Structured outcome codes can add meaning without compulsory prose.                                  | Closing an issue is not a responsibility return, and D34 context is required only for the actual gap state.                               |
| [GitHub Issues REST API](https://docs.github.com/en/rest/issues/issues)                                                                                          | `state_reason` accepts a closed set such as `completed`, `not_planned`, `duplicate`, or `reopened`.                                                       | Stable codes support API behavior, filtering and localization better than arbitrary prose.          | A D34 code remains human-reported recovery context and cannot become source truth.                                                        |
| [HubSpot conditional stage properties](https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines)                                             | HubSpot can show and require properties specifically when a record is moved to a configured stage.                                                        | Ask for data at the transition where it becomes necessary, not in every workflow step.              | Core's condition is fixed by source post-state, not a Tenant-authored workflow builder.                                                   |
| [Jira workflow rules](https://support.atlassian.com/jira-cloud-administration/docs/edit-an-issue-workflow/)                                                      | Jira can request input or require validated detail on selected transitions; validators block only the relevant transition when required input is missing. | Context-dependent validation is established workflow practice.                                      | Jira permits highly configurable workflows; Core keeps D34 a finite source-owned contract.                                                |
| [Zendesk conditional required fields](https://support.zendesk.com/hc/en-us/articles/4408846008218-Making-conditional-ticket-fields-required)                     | Zendesk can require fields only for selected ticket statuses or conditions.                                                                               | Conditional requirements reduce unnecessary agent input.                                            | Ticket form configuration does not determine Core source responsibility.                                                                  |
| [Zendesk resolution field](https://support.zendesk.com/hc/en-us/articles/4408822200346-Using-a-Resolution-field-to-track-how-tickets-are-solved)                 | Zendesk recommends a dropdown resolution field when consistent categorization is needed.                                                                  | A bounded choice produces more consistent operational data than free text.                          | D34 is not a resolution code and must not imply source work was solved.                                                                   |
| [Dynamics 365 status reasons](https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/define-status-reason-transitions-case-management)        | Dynamics separates broad status from structured status reason and can filter allowed next reasons by current reason.                                      | State-specific closed choices reduce invalid combinations and choice overload.                      | Core needs one immutable recovery-context occurrence, not a mutable case-state taxonomy.                                                  |
| [Blackbaud Altru reason codes](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/altru/help/content/RPManageReasonCodes.html)                           | Blackbaud describes reason codes as a way to standardize why users change or restrict records.                                                            | Nonprofit-product precedent supports structured codes when later operational understanding matters. | Tenant-authored reason catalogs would fragment Core semantics; D34 remains code-owned with an uncertainty choice.                         |
| [Blackbaud GrantsConnect application archive reasons](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantsconnect/content/gc-applications-faq.html) | GrantsConnect requires one of several archive reasons and recommends a comment for `Other`.                                                               | Nonprofit workflow tools use bounded dispositions on exceptional lifecycle changes.                 | D34 deliberately avoids the `Other`-comment pattern because the responsibility gap does not need prose and has higher staff/privacy cost. |
| [EU GDPR Article 5](https://eur-lex.europa.eu/legal-content/EN/TXT/?toc=OJ%3AL%3A2016%3A119%3ATOC&uri=uriserv%3AOJ.L_.2016.119.01.0001.01.ENG)                   | Article 5 states purpose limitation, data minimisation and storage limitation principles.                                                                 | Collect only the smallest context required for an explicit recovery purpose.                        | Core applies minimization as product/security judgment irrespective of a Tenant's specific legal jurisdiction.                            |
| [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)                                                             | OWASP warns against directly logging sensitive personal data and notes employee monitoring can have legal implications.                                   | Avoid free text and keep even structured context out of logs/telemetry/personnel analytics.         | Business audit may retain the code in the source record, separately from technical logs.                                                  |
| [W3C radio-group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)                                                                                       | A radio group expresses one choice from a set and defines established keyboard/focus behavior.                                                            | Four short mutually explained choices fit a native/shared radio group.                              | APG is interaction guidance, not a UI design system; Core still uses shared Base Maia primitives.                                         |
| [WCAG 2.2 input assistance](https://www.w3.org/TR/WCAG22/#input-assistance)                                                                                      | WCAG requires labels/instructions and textual identification of detected input errors; redundant entry should be avoided.                                 | The conditional group needs a visible label, concise instruction and precise missing-choice error.  | Do not require a reason again on retry of the same canonical transition.                                                                  |
| [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)                                                                          | PostgreSQL distinguishes `USING` from `WITH CHECK`, and table owners/`BYPASSRLS` roles can bypass policies.                                               | Both existing visibility and resulting Tenant/source/context validity require enforcement.          | Prefer the same append-only privileged source command already required by D33.                                                            |
| [Inngest idempotency](https://www.inngest.com/docs/guides/handling-idempotency)                                                                                  | Inngest's event and function idempotency windows are 24 hours and it recommends idempotent application behavior.                                          | It can safely retry projection after the product transition.                                        | It cannot own the context code, its meaning, permanent uniqueness or audit.                                                               |

### What this evidence actually proves

**Verified external fact:** mature products commonly omit explanations for
ordinary known-destination reassignment, but collect structured information at
specific exceptional transitions where it supports later recovery, reporting,
or state meaning.

**Reasonable inference:** the strongest pattern is not “always require a
reason” or “never collect context.” It is to require a small structured value
only when the resulting state creates an information need that trusted source
facts do not already satisfy.

**Product judgment:** in Core that state is exactly a return which ends the
last responsible recipient and creates **Needs assignment**. Direct handoff and
return-with-continuing-recipient already have enough source-owned context.

## Current behavior, accepted intent and permanent path

### Current repository behavior

**Repository facts:**

- The current admin Tasks prototype allows arbitrary assignee/status changes
  but has no source-aware conditional recovery context.
- `mission_control_tasks` has generic `dismissed_reason` and
  `suppressed_reason` text fields, a mutable assignee, generic JSON events and
  broad service-role access. Those fields are not suitable D34 authority.
- Support Hub intentionally has a different accepted contract: every move of
  an already routed support conversation requires a 5–500 character free-text
  move reason. That message/inbox audit purpose and its domain history are not
  Website source-responsibility recovery.
- D30 has another different contract: an external reviewer requesting changes
  must provide a bounded protected plain-text explanation of what must change.
  That is correction evidence, not handoff context.
- Current task comments, descriptions, notifications and activity are not
  source recovery truth and may have incompatible access/retention.

Existing code therefore does not supply a reusable D34 field. Reusing generic
task reasons, Support move prose or D30 feedback would create hidden coupling
and privacy/retention debt.

### Governing repository intent

- OpenSpec ranks Tenant safety and permission correctness above operational
  truth, experience and convenience, and it requires system behavior to reduce
  repeated manual glue without weakening safety.
- Core prefers clarity, accessibility, perceived speed, shared language and a
  cohesive product over decorative or locally clever workflows.
- ADR-0183 keeps source responsibility and source transitions authoritative;
  Tasks Hub is a projection and coordination surface.
- D33 distinguishes named handoff, return with continuing recipients, and
  return into **Needs assignment**. Only the last creates an ownerless recovery
  problem.
- D31/D33 keep protected source content reference-only and events identifier-
  only. Assignment and context never grant access.
- Inngest is an optional executor over product-owned records, claims and a
  dispatch ledger, never a source of truth.

### Permanent path

Add one nullable, versioned **Recovery context** to the immutable source
responsibility transition contract. Its requiredness is derived from the
authoritative post-transition responsibility state, not a client flag, Tenant
setting, task type name, generic workflow rule, or chosen button.

The Website source contract owns its exact v1 codes. The shared platform owns
only the shape and safety rules. A later producer such as Mobilize may reuse a
code only if its own source meaning is genuinely identical; it cannot inherit
Website wording or consequences by convention.

## Problem validity and strongest alternatives

### Root problem

When a final responsible recipient returns work, the source knows what work is
open and who returned it, but may not know whether the assignment was wrong,
the source action appears wrong, the person cannot take it now, or the person
cannot identify the right route. One short structured assertion can help an
authorized recovery worker choose what to inspect first and can reveal
systematic routing defects.

The context is not necessary when a named successor commits or another current
recipient remains. Requiring it there would collect redundant information.

### Selected Option 1 — conditional structured context

This is the best balance. It adds one tap only on the exceptional ownerless
path, yields bounded/localizable recovery data, and avoids prose collection.

### Strongest alternative — collect nothing

Option 3 is the strongest alternative. It has the lowest friction, smallest
data model and strongest privacy posture. Source scopes, actor, history and
current eligibility may often be enough for a coordinator to investigate.

It loses because **Needs assignment** is the one state where a human already
knows something the source does not and no successor can carry that context.
Without a bounded signal, recovery staff must contact the former recipient or
rediscover the distinction manually. The recommended model is proportionate
because it collects one non-prose code only there.

### Weaker alternative — require context for every transition

Option 2 creates uniform-looking data but poorer product behavior. Staff must
answer a redundant question during obvious handoffs, will learn to choose the
fastest plausible value, and may disclose personal detail when an optional note
is offered. More rows do not mean better evidence.

### Rejected alternative — tenant-authored reason builder

A custom taxonomy would make cross-Tenant reports incomparable, complicate
localization/migrations, create ambiguous source semantics, and drift into a
workflow DSL. The four code-owned choices plus an honest uncertainty option are
flexible enough without transferring source policy to settings.

## Exact Recovery context model

### Canonical term

**Recovery context** is one bounded staff assertion attached to the exact
source responsibility transition that created **Needs assignment**. It helps
authorized staff triage the responsibility gap. It is not a source cause,
eligibility fact, status reason, resolution, assignment permission,
availability record, performance fact, comment, task field, or workflow
instruction.

Use **Recovery context code** for the stable machine value and **Recovery
context label** for its localized presentation. Do not call it **Return
reason** in the domain model because that invites use on every return and
overstates the assertion.

### Versioned Website v1 registry

Conceptual registry identity: `website_assignment_recovery_context_v1`.

#### `not_right_recipient`

- Label: **I'm not the right person**
- Helper: **Someone else should own this same Website work.**
- Recovery use: inspect responsibility rules/current eligible people.
- Never infer: replacement identity, permission, role, staff error or source
  scope error.

#### `different_website_work_needed`

- Label: **This needs a different kind of Website work**
- Helper: **The correction may need a different action or responsibility.**
- Recovery use: inspect whether Page/Navigation/Communications/source scopes
  need correction or splitting.
- Never infer: a new source-action type or authority. Only the source can amend
  its scopes through a separate command.

#### `cannot_take_now`

- Label: **I can't take this now**
- Helper: **Someone else needs to own it now.**
- Recovery use: find another currently eligible owner without asking for
  personal explanation.
- Never infer: illness, leave, disability, workload, duration, employment
  status, performance, consent, capacity or future availability.

#### `unsure_who_should_take_it`

- Label: **I'm not sure who should take it**
- Helper: **Authorized Website staff will review the assignment.**
- Recovery use: ordinary source triage without guessing why.
- Never infer: no eligible person exists, broad-admin ownership, or permission
  to route automatically.

### Taxonomy rules

- Exactly four choices in v1; no preselected default.
- Labels and helpers are code-owned, localized product copy.
- Stable codes and registry version are never localized.
- Codes never change meaning. Clarifying copy may change only without altering
  semantics; a meaning change creates a new registry version/code.
- Historical codes remain readable after retirement and are never reused.
- The uncertainty option is mandatory in every version so staff are never
  forced into a false factual claim.
- Tenants cannot add, rename, reorder, hide, map, automate or require additional
  context choices.
- A source may add a future version only through the same decision/OpenSpec/
  design/migration/localization/test process.
- Context code does not choose a destination or modify action scopes in v1.

## Recommended staff UX and UI

### Conditional reveal

The D33 source preview returns a trusted `posture` describing whether the
currently previewed return would leave other responsible recipients or create
**Needs assignment**. The client never counts displayed task rows to decide.

For a named handoff:

```text
Amélie will receive this Page correction.
You will no longer be assigned.

[Hand off to Amélie]
```

No context control appears.

For a return with another responsible recipient:

```text
You will no longer be assigned.
Joel will remain responsible for the Navigation work.

[Return this work]
```

No context control appears. If Joel's identity is not independently visible,
the copy says **Another responsible person will remain**.

For a return that would create **Needs assignment**:

```text
Why are you returning this?
Choose the main reason so authorized Website staff know what to review.

( ) I'm not the right person
    Someone else should own this same Website work.

( ) This needs a different kind of Website work
    The correction may need a different action or responsibility.

( ) I can't take this now
    Someone else needs to own it now.

( ) I'm not sure who should take it
    Authorized Website staff will review the assignment.

[Return for reassignment]
```

The group appears inside the existing D33 deliberate panel; do not open a
second modal, wizard step or generic task form. It uses the shared Base Maia
radio-group primitive, semantic tokens and ordinary vertical rhythm. The
final button is not a red destructive action: it is a consequence-led source
transition with an explicit cancel/keep-assigned path.

### Validation

- Keep the final button available so keyboard/screen-reader users can discover
  the required-field error; do not communicate requiredness only through a
  disabled button.
- If no code is selected, server and client both reject with **Choose why this
  work needs reassignment.**
- Associate the error and helper with the radio group, set programmatic invalid
  state, focus the group/error on submit, and keep all entered selection.
- No character count, text area, optional note or secret/payment-content
  warning appears because no prose is accepted.
- Retry of the same canonical command reuses the already selected code; it does
  not ask for redundant entry.

### Success and history

Immediate confirmation:

```text
Returned for reassignment
Website still needs an owner.
Context: I'm not the right person
```

The context line is visible to the actor in the immediate source receipt. The
persistent Tasks Hub predecessor history may say only **Returned for
reassignment**. Independently authorized source-recovery staff see a clearly
attributed label such as **Maria selected: I'm not the right person** so it is
not mistaken for a system-certified cause.

The eventual successor's task does not include the code by default. They get
the authoritative current source scopes and source detail, not a potentially
biased assertion about the former recipient or assignment.

### Stale and concurrent state

If another responsible person becomes active before commit, the expected-head
command rejects and refreshes to the no-context return posture. It does not
retain/store an unnecessary selected code. If the final continuing recipient
ends before commit, the command rejects and refreshes to the required-context
posture. It never creates **Needs assignment** without the required code or
silently invents one.

### Mobile, low bandwidth and international use

- Four vertical choices reflow at 320 CSS pixels and 400% zoom without
  horizontal scrolling.
- Whole choice cards may be clickable, but semantics remain one radio group;
  focus, checked state and labels do not depend on color.
- Labels are short enough for translation but must be tested under realistic
  expansion, CJK and RTL; layouts cannot use fixed heights.
- Helpers use plain, translatable sentences and no idioms such as “kick this
  back,” “punt,” or “wrong seat.”
- Codes remain stable English-like identifiers in storage/API while every
  user-facing label/error is localized.
- The choice registry ships with the task panel; no extra candidate/directory
  request is required. Final source authorization still requires connectivity.
- Network retry preserves the selected code only in page memory and revalidates
  current source state before submit.

## Source of truth and invariants

### Ownership map

| Fact                              | Authority                                                   | Derived/display consumers                   | Never authority                             |
| --------------------------------- | ----------------------------------------------------------- | ------------------------------------------- | ------------------------------------------- |
| Whether context is required       | Final source responsibility transition/post-state           | D33 panel                                   | Client count, task row, chosen button       |
| Allowed code registry and meaning | Versioned Website source contract                           | UI labels, validation, source audit         | Tenant settings, task comments, analytics   |
| Selected code                     | Actor intent accepted in immutable source transition        | Authorized recovery view, immediate receipt | Eligibility, routing, source scope, HR fact |
| Actor/scopes/heads/post-state     | Trusted source/server context                               | Audit and projections                       | Caller fields or Inngest payload            |
| Localized label                   | Product localization catalog keyed by registry/version/code | Staff UI                                    | Stored audit meaning                        |
| Technical execution               | Product dispatch ledger and optional Inngest                | Operational telemetry                       | Business context/outcome                    |

### Invariants

1. Recovery context is present if and only if the accepted transition is a
   recipient return whose authoritative post-state is **Needs assignment**.
2. A named handoff, return with continuing recipients, takeover, source
   completion, access loss or other end stores no D34 context.
3. Exactly one valid code and registry version are stored; free text is
   structurally impossible.
4. The code is an attributed actor assertion, not a certified reason/cause.
5. The code cannot grant, revoke, narrow or widen permission, responsibility,
   destination eligibility, source scope or task visibility.
6. The code cannot itself trigger, rank or choose a successor in D34.
7. The source transition, context, trusted attribution, resulting responsibility
   state, receipt and identifier-only projection intent commit atomically.
8. Same semantic retry returns the original receipt; changed code under the
   same idempotency key rejects.
9. Historical code meaning and version never change or disappear.
10. No task, notification, email, comment, search document, AI index, cache key,
    metric, trace or workflow event copies the code unless a later exact purpose
    explicitly admits it.
11. Individual staff performance, leave, health, disability or disciplinary
    conclusions cannot be derived from the code by product policy.
12. A later source triage correction does not rewrite what the actor selected;
    it appends a separate authoritative recovery disposition.

## Data model and database safety

### Conceptual source transition fields

Names remain design-level, but the model requires:

- `recovery_context_registry` — nullable stable registry/version identity;
- `recovery_context_code` — nullable stable code;
- trusted `selected_by_actor_id` already supplied by transition attribution;
- predecessor/source/action scope/post-state/receipt/idempotency lineage from
  D33; and
- no prose/note/attachment column for D34.

Use a code-owned versioned registry/canonical table or an equivalent database-
constrained catalog. Do not use an unconstrained text field, a Postgres enum
whose values are casually renamed, generic JSON, task metadata, or Tenant-
editable lookup table.

### Structural constraints

- Registry and code are both null or both non-null.
- They are non-null exactly for `transition_kind = return` and
  `post_responsibility_state = needs_assignment`.
- The `(registry_version, code)` pair references an immutable valid definition.
- The transition's Tenant/source/predecessor/scopes remain composite-key bound
  under D33; the context cannot be moved to another transition.
- Source transition and outbox/projection intent share a transaction.
- No UPDATE changes the selected code. Corrections append a separately typed
  recovery assessment/disposition without rewriting actor history.
- Delete/identity-retention behavior preserves required business attribution
  through the repository's governed person/tombstone model.
- Indexes support authorized source recovery views and aggregate routing-health
  analysis without indexing free text or protected bodies.

### RLS, grants and trusted context

- Authenticated clients have no direct INSERT/UPDATE/DELETE grant on source
  transitions or context.
- One privileged `packages/api` source command derives Tenant, actor,
  predecessor, current responsibility set, post-state and requiredness.
- Caller input is limited to transition intent, opaque destination when any,
  expected heads, idempotency key and one registry/code pair when prompted.
- The server rejects context when forbidden, missing context when required,
  unknown/retired-for-write version/code, and every stale or unauthorized
  transition.
- Any browser-readable projection uses Tenant- and purpose-scoped `USING`; any
  mutable row uses equivalent `WITH CHECK` so a permitted mutation cannot move
  context across Tenant/source/transition scope.
- Security-definer functions fix `search_path`, use least grants and trusted
  session/actor derivation.
- Service-role, support, import, AI, repair and worker paths call the same
  domain boundary or an equivalently strict source-certified repair command.
  `BYPASSRLS` is never product authority.
- Error/timing behavior does not reveal whether another Tenant has a code,
  transition, person or source occurrence.

## Privacy, retention and audit

### Data minimization

The four codes are the maximum ordinary collection. Do not collect:

- personal or medical explanation;
- leave dates, return date or workload;
- staff performance or conflict narrative;
- names of suggested people;
- source correction feedback or D30 explanation;
- free text, comment, attachment, source anchor or mention;
- donor, missionary, member-care, safeguarding, Giving or finance detail; or
- raw client environment/telemetry beyond normal safe audit context.

`cannot_take_now` is deliberately non-specific. Recovery staff need only know
that another current owner is required, not why.

### Access and presentation

- The actor sees their own immediate receipt.
- Independently authorized Website source-recovery staff may see the attributed
  code on the exact recovery occurrence.
- Generic Tasks Hub managers, unrelated coordinators, future assignees,
  notification recipients, donors, missionaries and public visitors do not see
  it by default.
- History redacts actor or code label whenever the viewer lacks the independent
  purpose permission; authorization loss removes current detail access without
  rewriting history.

### Retention

The code follows the owning source responsibility-transition audit schedule; it
does not create a longer task/comment/analytics retention period. Historical
code meaning remains resolvable while the audit record is retained. Aggregates
must be recomputable from authorized records or retained only under a separately
defined, privacy-safe analytics purpose.

### Audit versus telemetry

The source audit records exact code/version, trusted actor, transition, scopes,
heads, post-state, receipt and time. Technical logs record identifiers,
validation outcome classes and latency—not the code, localized label, staff
name or source content. Security logs may record an invalid-code attempt as a
typed denial without echoing caller payload.

## Analytics and operational use

### Allowed

- authorized per-occurrence recovery triage;
- aggregate counts/rates by source adapter, action-scope family and code to
  find routing-policy or UX defects;
- canary quality monitoring, including high uncertainty/misrouting rates; and
- product research sampling under the Tenant/privacy boundary.

### Forbidden

- individual rankings, productivity scores or “frequent returner” dashboards;
- inference of absence, disability, health, commitment or performance;
- automated staff evaluation or disciplinary use;
- automatic permission, recipient eligibility, routing or source-scope change;
- cross-Tenant benchmarking that exposes small cohorts or identifiable staff;
- AI training, semantic classification or generated summaries from the code;
  and
- treating the actor-selected context as adjudicated cause.

### Interpretation

Recovery UI says **Maria selected**, not **Reason** or **Cause**. Aggregate
analytics say **Selected recovery context**. If later recovery proves a
different source issue, the source appends a separate disposition; it does not
overwrite the original selection.

## Localization and taxonomy evolution

- Registry/version/code are stable ASCII product identifiers.
- Labels, helpers, errors, history phrasing and analytics labels come from the
  localization catalog; the database never stores translated labels as truth.
- A missing translation falls back to a safe product-default label, never raw
  code, blank UI or machine translation, and emits a monitor.
- Copy uses first-person, non-blaming language and avoids terms such as
  incompetent, overloaded, unavailable, conflict, permission failure or wrong
  department.
- Translators receive developer context explaining that choices are staff-
  asserted triage hints and must remain distinct.
- Semantic change creates a new registry version; old versions remain readable.
- Adding a code requires evidence that the existing uncertainty choice is
  materially insufficient and that the new choice changes legitimate recovery.
- Removing a write choice uses an additive version and mixed-client rollout;
  historical codes remain valid for reads.

## Lifecycle, concurrency and failure handling

| Condition                                         | User-visible result                                                 | Authoritative behavior                                          |
| ------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------- |
| Ownerless preview, no code selected               | **Choose why this work needs reassignment.**                        | Reject; write nothing                                           |
| Unknown/tampered code                             | Generic invalid-choice error and refreshed choices                  | Reject; audit typed denial without payload echo                 |
| Preview said ownerless; another recipient appears | Explain assignment changed; refresh simpler return                  | Expected-head loser writes nothing and stores no code           |
| Preview had another recipient; they disappear     | Explain assignment changed; show required context                   | Expected-head loser writes nothing                              |
| Same click/retry and same code                    | Return original receipt                                             | Product semantic idempotency                                    |
| Same key with different code                      | Explain request conflict safely                                     | Reject changed canonical meaning                                |
| Source commit succeeds; response lost             | Retry shows original receipt and selected label if still authorized | Receipt lookup; no second transition                            |
| Source succeeds; Tasks projection fails           | Source history remains correct; task stale state suppressed         | Outbox/reconciliation repairs projection                        |
| Translation missing                               | Show safe default-language label                                    | Record localization monitor; code meaning unchanged             |
| Old client sends retired write code               | Refresh required choices; nothing changes                           | Version/code write policy rejects while historical read remains |
| Actor later says selection was wrong              | Recovery staff may record separate triage disposition               | Never rewrite actor-selected code                               |
| Context analytics unavailable                     | Recovery flow still works                                           | Analytics is non-authoritative and independently recoverable    |
| Inngest unavailable                               | Synchronous return still succeeds/fails truthfully                  | Dispatch ledger/recovery scan catches projection                |

### Idempotency meaning

For an ownerless return, the canonical business meaning includes predecessor,
exact scopes, expected heads, transition kind, resulting state, registry
version and context code. A retry with the same key but different code is not
the same command and must reject.

## Inngest boundary

### Synchronous source-owned work

The final responsibility set, conditional requiredness, accepted registry/code,
source transition, trusted attribution, receipt and durable identifier-only
projection intent are one product-owned source transaction.

### Appropriate asynchronous work

Inngest may materialize or reconcile the body-free task result, source recovery
view indexing, notification engagement and permitted aggregate counters after
the source commit. Its event contains Tenant, workflow name, product record
reference, dispatch request ID and safe routing context only. The worker reloads
the current source receipt under authorization/product claims.

### Forbidden

Inngest never:

- decides whether context is required;
- supplies a default or inferred code;
- parses text or uses AI to classify a reason;
- changes routing based on a code;
- carries code/labels/staff names in the event when a receipt ID suffices;
- waits for a human or owns source/task lifecycle; or
- becomes permanent idempotency, audit, retention or analytics truth.

## Migration, rollout and rollback

### Required order

1. Resolve D34 and record the exact term, conditional invariant and registry in
   the decision log/glossary/ADR before implementation.
2. Add the versioned source registry and nullable constrained context fields
   additively to D33 source transition design.
3. Add server denial for free text, unknown codes, forbidden-context outcomes,
   missing required codes, caller-selected requiredness and generic task paths.
4. Add policy-aware readers/localized labels before exposing the writer.
5. Shadow-evaluate whether returns would create **Needs assignment** and compare
   with authoritative transition outcomes.
6. Canary conditional radio choices for one Website source-action family and
   selected Tenants/Sites.
7. Enable aggregate health analytics only after access, privacy, attribution
   and small-cohort protections are proven.
8. Add optional Inngest projection/reconciliation only after synchronous
   receipt and manual roll-forward recovery are proven.
9. Expand to other Website adapters, then later source domains only through
   their registered meanings and evidence.

### Backfill

Do not infer context from historical task assignee changes, comments, D30
explanations, Support move reasons, notifications, actor identity, source
scopes or later recovery outcomes. Legacy transitions have unknown/null context
and remain truthful.

### Mixed-version safety

- Old clients cannot send arbitrary prose or bypass the conditional requirement.
- New readers treat absent registry/code on legacy rows as **No context
  collected**, not uncertainty or a default code.
- New writers include version/code only for the exact required post-state.
- Historical registry versions remain readable while new writers move to a new
  version.
- Unknown versions fail closed; raw codes never appear in UI.
- Projection workers tolerate context fields without requiring them for task
  lifecycle.

### Rollback

Disable the D34 writer/UI while preserving accepted source transitions and
codes. Do not erase context or reverse responsibility. Roll projections forward
from source receipts. If wording is defective, fix localized presentation
without changing historical code meaning; if semantics are defective, create a
new registry version and stop the old writer.

## Proof portfolio

The later implementation must prove:

- direct named handoff contains no context control or stored context;
- return with one/many continuing recipients contains no context;
- final-recipient return requires exactly one valid v1 code;
- all four choices and no preselection;
- uncertainty choice allows safe completion without prose;
- no free-text, comment, attachment, D30 explanation or Support reason reuse;
- missing, unknown, retired, tampered, cross-source and cross-Tenant code denial;
- client-asserted requiredness ignored;
- state changes in both directions between preview and commit;
- duplicate click, lost response, changed-code/same-key and concurrent source
  transitions;
- task/notification/worker failures after source success;
- code cannot change routing, scope, eligibility, access, completion or
  publication;
- source recovery read access and every unauthorized/redacted viewer;
- technical logs/events/metrics/AI/search/export/email contain no prohibited
  context;
- no person-level analytics or performance inference;
- every supported locale plus missing-translation fallback, long labels, CJK,
  RTL and duplicate accelerators;
- native/shared radio semantics, visible legend/instruction, keyboard arrows,
  screen reader names/descriptions, missing-choice error, focus, 320px/400%
  reflow, touch, contrast and reduced motion;
- old reader/new writer, new reader/old writer and registry-version rollout;
  and
- kill switch, Inngest outage, reconciliation and roll-forward recovery.

## Research-only acceptance outcomes

### Decision and scope

- **D34-RA1:** Recommend Option 1 — collect context only when the accepted
  return creates **Needs assignment**.
- **D34-RA2:** Named eligible handoff requires and stores no D34 context.
- **D34-RA3:** Return with at least one continuing responsible recipient
  requires and stores no D34 context.
- **D34-RA4:** Final-recipient return requires exactly one Recovery context code.
- **D34-RA5:** The final authoritative source post-state, not UI prediction,
  decides requiredness.
- **D34-RA6:** Recovery context is a human assertion for triage, not source
  cause, resolution or status reason.
- **D34-RA7:** D34 introduces no comment, note, attachment, source anchor,
  reminder, date, mention or email.
- **D34-RA8:** D30 request-changes explanation is never copied or reused as
  recovery context.
- **D34-RA9:** Support Message Move Reason remains a distinct Support-domain
  free-text audit contract and does not govern Website tasks.
- **D34-RA10:** D34 remains part of the source responsibility transition, not a
  generic Tasks Hub field.

### Registry and vocabulary

- **D34-RA11:** The canonical domain term is **Recovery context**.
- **D34-RA12:** Machine values use a versioned Recovery context code registry;
  user-facing labels are localized separately.
- **D34-RA13:** Website v1 registry identity is conceptually
  `website_assignment_recovery_context_v1`.
- **D34-RA14:** Website v1 contains exactly `not_right_recipient`,
  `different_website_work_needed`, `cannot_take_now`, and
  `unsure_who_should_take_it`.
- **D34-RA15:** No choice is preselected.
- **D34-RA16:** Every registry version includes an honest uncertainty choice.
- **D34-RA17:** **Other** never reveals a free-text field; v1 instead uses
  **I'm not sure who should take it**.
- **D34-RA18:** Code meaning is immutable and historical codes are never reused.
- **D34-RA19:** Meaning change creates a new registry version.
- **D34-RA20:** Tenants cannot add, rename, reorder, hide, remap or automate the
  code-owned registry.
- **D34-RA21:** A later source domain registers and proves its own context
  meaning rather than inheriting Website labels by name.
- **D34-RA22:** Adding a code requires evidence that it changes legitimate
  recovery and that uncertainty is insufficient.

### Semantics and non-effects

- **D34-RA23:** `not_right_recipient` requests review of responsibility but
  names no replacement.
- **D34-RA24:** `different_website_work_needed` requests review of source scopes
  but does not mutate them.
- **D34-RA25:** `cannot_take_now` requests another current owner but establishes
  no personal availability/health/workload fact.
- **D34-RA26:** `unsure_who_should_take_it` requests ordinary source triage and
  grants no fallback authority.
- **D34-RA27:** No code changes source actionability, responsibility, eligibility,
  permission, visibility, task completion or publication.
- **D34-RA28:** No code ranks or selects a successor in D34.
- **D34-RA29:** No code creates Tenant membership, role, Site access, review,
  communication, Giving or finance authority.
- **D34-RA30:** No code is a personnel, leave, health, disability, capacity,
  performance or disciplinary record.
- **D34-RA31:** A later recovery disposition appends separately and never
  rewrites the actor-selected context.
- **D34-RA32:** UI and analytics call the value selected context, not certified
  cause.

### Staff UX and accessibility

- **D34-RA33:** The context group is absent until the source preview says the
  return would create **Needs assignment**.
- **D34-RA34:** It appears inside the one D33 panel rather than another modal or
  wizard step.
- **D34-RA35:** The visible legend is **Why are you returning this?**
- **D34-RA36:** The instruction is **Choose the main reason so authorized
  Website staff know what to review.**
- **D34-RA37:** Four vertically stacked radio choices use shared Base Maia/Base
  UI primitives and semantic tokens.
- **D34-RA38:** Each choice has one concise label and explanatory helper text.
- **D34-RA39:** The final action remains **Return for reassignment**.
- **D34-RA40:** No second confirmation appears after selecting a code.
- **D34-RA41:** Requiredness is visible and programmatic; it is not conveyed only
  by color, asterisk or disabled submit.
- **D34-RA42:** Missing choice produces **Choose why this work needs
  reassignment.** in text and focuses/associates the group.
- **D34-RA43:** Keyboard arrows, Space, Tab/Shift+Tab and focus behavior follow
  the established radio-group interaction.
- **D34-RA44:** Selection, errors and success are announced without stealing
  focus unexpectedly.
- **D34-RA45:** 320px, 400% zoom, touch, screen reader, forced colors, contrast,
  reduced motion and no-hover behavior are tested.
- **D34-RA46:** Long translations, CJK and RTL reflow without fixed-height
  truncation.
- **D34-RA47:** No avatar, icon or color carries reason meaning.
- **D34-RA48:** Retry retains the selected code in page memory but revalidates
  current state.
- **D34-RA49:** The choice registry adds no separate network request to the
  return panel.
- **D34-RA50:** Success identifies ownerless recovery and the selected context
  without implying source completion.

### Data and invariants

- **D34-RA51:** Registry and code are both null or both non-null.
- **D34-RA52:** They are non-null if and only if return post-state is
  **Needs assignment**.
- **D34-RA53:** `(registry_version, code)` references one immutable valid
  code-owned definition.
- **D34-RA54:** Free-text context is structurally absent, not merely hidden.
- **D34-RA55:** Context is bound to the exact Tenant/source/transition/
  predecessor/action scopes through D33 lineage.
- **D34-RA56:** Context and source transition/receipt/outbox commit atomically.
- **D34-RA57:** Context cannot be moved, edited or deleted independently.
- **D34-RA58:** Historical identity attribution survives profile deactivation
  under governed identity retention.
- **D34-RA59:** Legacy null means **No context collected**, not uncertainty.
- **D34-RA60:** Generic task reason/status/comment/event JSON does not store or
  own D34 context.
- **D34-RA61:** An unconstrained text field, casual Postgres enum or Tenant-
  editable lookup table is rejected.
- **D34-RA62:** Indexes support exact authorized recovery and aggregate health
  without a text/search index.

### Authorization, RLS and trusted attribution

- **D34-RA63:** Authenticated clients have no direct context mutation grant.
- **D34-RA64:** One privileged source command derives Tenant, actor, current
  recipients, post-state and requiredness.
- **D34-RA65:** Caller-supplied `requires_context`, actor, Tenant, timestamp,
  post-state or audit attribution is ignored/rejected.
- **D34-RA66:** Missing-required, forbidden-extra, unknown, tampered and
  retired-for-write codes fail closed.
- **D34-RA67:** Expected source/responsibility/policy/authorization heads protect
  preview-to-commit races.
- **D34-RA68:** Read authorization is separately rechecked for source recovery,
  history and immediate receipt.
- **D34-RA69:** RLS `USING` and `WITH CHECK` constrain old and resulting scope
  wherever mutable projections are exposed.
- **D34-RA70:** Security-definer functions use fixed `search_path`, least grants
  and trusted session context.
- **D34-RA71:** Service-role, support, import, AI, job, worker and repair paths
  preserve the same domain boundary.
- **D34-RA72:** `BYPASSRLS`, generic administrator or task-manager status never
  supplies context authority.
- **D34-RA73:** Denials do not echo attacker-provided code or disclose cross-
  Tenant/source existence.

### Privacy, audit and analytics

- **D34-RA74:** Collection is limited to one code only on ownerless return.
- **D34-RA75:** No free text, health/leave dates, performance narrative,
  replacement names or protected source content is collected.
- **D34-RA76:** `cannot_take_now` stays deliberately non-specific.
- **D34-RA77:** The actor and independently authorized source-recovery staff are
  the only default viewers of context.
- **D34-RA78:** The eventual successor and generic task managers do not receive
  context by default.
- **D34-RA79:** Context follows source transition retention and creates no longer
  task/comment/analytics retention.
- **D34-RA80:** Source audit stores canonical code/version, not translated label.
- **D34-RA81:** Row-level technical logs, traces and telemetry exclude code,
  label and protected actor/source content; separately governed aggregate
  routing-health metrics may use the canonical code.
- **D34-RA82:** Workflow events contain receipt identifiers, not context.
- **D34-RA83:** AI/search indexes and generic exports exclude context.
- **D34-RA84:** Aggregate routing-health analytics may use codes under purpose
  and Tenant boundaries.
- **D34-RA85:** Individual rankings, performance scoring, absence inference and
  disciplinary use are forbidden.
- **D34-RA86:** Small-cohort cross-Tenant benchmarking that could identify staff
  is forbidden.
- **D34-RA87:** Analytics and recovery presentation identify the value as actor-
  selected context.
- **D34-RA88:** Analytics failure cannot block or change source recovery.

### Localization and evolution

- **D34-RA89:** Codes/version are stable ASCII identifiers and never localized.
- **D34-RA90:** Labels/helpers/errors/history are localized product resources.
- **D34-RA91:** Missing translation falls back to a safe product-default label,
  never raw code or blank text.
- **D34-RA92:** Machine translation is not used for labels or historical
  presentation.
- **D34-RA93:** Translator context preserves distinctions among recipient,
  action, temporary inability and uncertainty.
- **D34-RA94:** Copy is first-person, non-blaming and avoids personnel claims.
- **D34-RA95:** Existing code semantics remain readable after a new registry
  version ships.
- **D34-RA96:** Old clients refresh rather than silently remap a retired write
  code.

### Concurrency, idempotency and failure

- **D34-RA97:** Preview ownerless -> continuing recipient race rejects and
  stores no unnecessary context.
- **D34-RA98:** Preview continuing recipient -> ownerless race rejects and asks
  for context before any transition.
- **D34-RA99:** Same key and same canonical code returns the original receipt.
- **D34-RA100:** Same key with a different code rejects changed meaning.
- **D34-RA101:** Duplicate click, network retry, API replay and worker replay
  cannot duplicate context or transition.
- **D34-RA102:** Lost success response recovers from product receipt lookup.
- **D34-RA103:** Source success plus projection failure preserves source context
  and reconciles projections forward.
- **D34-RA104:** Unknown/tampered code writes nothing and records only a typed
  safe denial.
- **D34-RA105:** Translation failure does not change code meaning or source
  state.
- **D34-RA106:** Actor correction appends a separate recovery disposition; it
  never rewrites selected context.
- **D34-RA107:** Analytics outage or stale aggregate does not affect routing.
- **D34-RA108:** Context cannot be auto-defaulted during timeout, retry or
  partial failure.

### Inngest and operations

- **D34-RA109:** The synchronous source command owns requiredness, code,
  transition and receipt.
- **D34-RA110:** Inngest may materialize/reconcile from identifier-only product
  records after commit.
- **D34-RA111:** Inngest never chooses, infers, defaults, parses or changes a
  Recovery context code.
- **D34-RA112:** Product claims and permanent database uniqueness protect every
  retryable projection effect.
- **D34-RA113:** Inngest's 24-hour deduplication is not permanent product
  idempotency.
- **D34-RA114:** Dispatch outage does not prevent a truthful synchronous return.
- **D34-RA115:** Dead-letter recovery reloads current source receipt and never
  accepts event payload as truth.
- **D34-RA116:** Support-safe diagnostics distinguish validation, source,
  outbox, projection, localization and analytics failures without protected
  content.

### Migration, testing and traceability

- **D34-RA117:** Schema/registry rollout is additive and denial guards precede
  the writer.
- **D34-RA118:** No historical context is inferred or backfilled.
- **D34-RA119:** Legacy null remains truthful and readable.
- **D34-RA120:** Policy-aware readers/localization land before UI submission.
- **D34-RA121:** Shadow requiredness comparison precedes canary exposure.
- **D34-RA122:** Canary starts with one Website source-action family and bounded
  Tenant/Site cohorts.
- **D34-RA123:** Rollback stops new context writes but preserves accepted source
  transitions and registry meaning.
- **D34-RA124:** Presentation-only wording fixes do not mutate historical codes;
  semantic fixes create a new version.
- **D34-RA125:** Tests cover positive, negative, boundary, concurrency,
  authorization, privacy, migration, localization, accessibility and
  production-shaped outcomes.
- **D34-RA126:** Sink tests prove no code/label enters prohibited logs, events,
  email, AI, search, cache or generic export.
- **D34-RA127:** Tests prove context has no routing, permission, scope,
  completion or publication effect.
- **D34-RA128:** Traceability carries exact term/codes/invariants through
  decision log, glossary, ADR, OpenSpec, design, tickets, code, tests and release
  evidence.
- **D34-RA129:** Current generic task reasons remain documented as current or
  domain-specific behavior, never claimed as D34 compatibility.
- **D34-RA130:** D34 remains Reserved until complete implementation, migration,
  authorization, privacy, accessibility, canary and release proof exists.
- **D34-RA131:** Broad repository verification remains deferred until the end of
  the Grill session as directed.

## Named monitors

| Signal                                         | Threshold                                                                                                        | Owner                                | Required response                                                                                                        |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `recovery_context_missing_required_total`      | Any accepted ownerless return without a valid code                                                               | Website source owner + Data Platform | Stop writer cohort, reconcile source audit, repair constraint/command, add regression                                    |
| `recovery_context_forbidden_extra_total`       | Any named handoff or continuing-recipient return storing context                                                 | Website source owner + Privacy       | Stop writer, remove only unauthorized projection/copy under audit, preserve source transition, fix conditional invariant |
| `recovery_context_free_text_persisted_total`   | Any D34 prose/note/comment/attachment persisted                                                                  | Security + Privacy                   | Stop input/sink, quarantine/remove where lawful, assess exposure, add structural denial                                  |
| `recovery_context_unknown_code_success_total`  | Any unregistered/retired-for-write code accepted                                                                 | Data Platform                        | Disable writer, inspect registry/version validation, repair affected audit                                               |
| `recovery_context_cross_tenant_total`          | Any cross-Tenant read/write/reference                                                                            | Security + Data Platform             | Incident, stop path, preserve evidence, assess disclosure and repair                                                     |
| `recovery_context_stale_head_success_total`    | Any stale responsibility/source/policy head accepted                                                             | Website source owner                 | Disable command, repair compare-and-swap, inspect downstream effects                                                     |
| `recovery_context_changed_key_success_total`   | Any same idempotency key accepting a different code                                                              | Data Platform                        | Fence writer, reconcile duplicate/contradictory receipts, add regression                                                 |
| `recovery_context_routing_effect_total`        | Any code directly changing destination, eligibility, scope or permission                                         | Website source owner + Security      | Stop automation, revert effect through source-authorized correction, audit all consumers                                 |
| `recovery_context_completion_effect_total`     | Any code affecting task/source completion or publication                                                         | Website source owner + Tasks Hub     | Stop-ship/incident, restore authoritative source state, remove coupling                                                  |
| `recovery_context_prohibited_sink_total`       | Any code/label/person/source detail in log, trace, metric, event, email, AI, search, cache key or generic export | Security + Privacy                   | Stop emitter, purge where possible, assess incident, add sink test                                                       |
| `recovery_context_unauthorized_read_total`     | Any viewer sees context without exact source-recovery purpose                                                    | Security + Website                   | Incident review, revoke projection/cache, repair RLS/read model                                                          |
| `recovery_context_person_analytics_total`      | Any person ranking, performance/absence inference or disciplinary product use                                    | Privacy + Product                    | Disable report/model, remove derived dataset, governance review                                                          |
| `recovery_context_uncertainty_rate`            | Above 40% with at least 30 ownerless returns in a rolling 30 days                                                | Product Research + Website           | Review wording/taxonomy/routing interviews; do not add codes automatically                                               |
| `recovery_context_wrong_recipient_rate`        | Above 20% with at least 30 ownerless returns in a rolling 30 days                                                | Website product + source owner       | Inspect responsibility resolver/policy and representative cases; fix source routing, not staff                           |
| `recovery_context_different_work_rate`         | Above 15% with at least 30 ownerless returns in a rolling 30 days                                                | Website domain owner                 | Inspect action-scope modeling/grouping; do not auto-mutate scope                                                         |
| `recovery_context_selection_abandonment_rate`  | Above 10% of eligible ownerless-return panels or 5 percentage points above the prior return step                 | Product UX + Research                | Inspect necessity, copy, mobile/a11y and latency; block cohort expansion if causal                                       |
| `recovery_context_invalid_submit_rate`         | Above 5% of ownerless-return attempts for 30 minutes                                                             | Web Platform + Product UX            | Inspect validation/focus/state race; preserve server guard                                                               |
| `recovery_context_state_refresh_rate`          | Above 5% for 30 minutes                                                                                          | Website Platform                     | Inspect stale preview/concurrency/cache; never weaken expected heads                                                     |
| `recovery_context_translation_missing_total`   | Any supported-locale label/helper/error missing                                                                  | Localization owner + Web Platform    | Use safe fallback, block locale expansion, add resource/test                                                             |
| `recovery_context_raw_code_visible_total`      | Any user-visible raw registry/code                                                                               | Product UX + Localization            | Correct presentation immediately, audit screenshots/support exposure                                                     |
| `recovery_context_keyboard_completion_rate`    | Below 95% in moderated keyboard-only proof or any blocker                                                        | Accessibility owner + Web Platform   | Stop release, repair radio/error/focus behavior, retest                                                                  |
| `recovery_context_screen_reader_blocker_total` | Any critical label, requiredness, error, checked-state or focus defect                                           | Accessibility owner                  | Stop-ship affected surface, repair and independently retest                                                              |
| `recovery_context_mobile_success_rate`         | Below 90% of eligible canary attempts or more than 5 points below desktop                                        | Product UX + Web Platform            | Inspect reflow/touch/copy/latency, block expansion until repaired                                                        |
| `recovery_context_projection_lag_seconds`      | p95 above 60 seconds for 15 minutes or any item above 300 seconds                                                | Tasks Hub + Workflow Platform        | Reconcile from source receipt, inspect outbox/worker, keep source authoritative                                          |
| `recovery_context_dead_letter_age_seconds`     | Any D34 projection dead letter above 15 minutes                                                                  | Workflow Platform + Tasks Hub        | Run product-owned reconciliation, escalate under policy, preserve source record                                          |
| `recovery_context_manual_db_repair_total`      | Any direct repair not derived from immutable source receipt                                                      | Data Platform                        | Stop ad hoc repair, document incident, build audited roll-forward command                                                |

The percentage thresholds are first-canary investigation thresholds, not claims
about current user behavior. Zero-tolerance safety/privacy thresholds cannot be
weakened by later UX data. Product Research may revise experience thresholds
only with representative evidence and recorded rationale.

## Assumptions and unresolved unknowns

### Assumptions implementation may not treat as verified facts

- Authorized recovery staff will act differently based on these four choices.
  Verify through representative ministry interviews and task-recovery studies.
- Ownerless returns are uncommon relative to direct handoffs/returns with
  continuing recipients. Verify during shadow/canary before forecasting effort.
- Four labels remain understandable across supported languages and ministry
  sizes. Verify with professional localization and comprehension research.
- Aggregate code rates can reveal resolver/scope defects without becoming staff
  surveillance. Verify governance and actual dashboard consumers.

### Unresolved unknowns

1. Whether Recovery context may ever influence recommendations or routing. D35
   below is the recommended next decision.
2. Final source-transition retention, legal hold, staff-departure redaction and
   privacy-request behavior.
3. Supported locale set and representative translations at implementation time.
4. Real ownerless-return volume, code distribution, selection time and
   abandonment by mobile/low-bandwidth cohort.
5. Whether any future Website action needs a source-specific context code due
   to safeguarding, legal, language or separation-of-duties requirements.
6. Whether an authorized recovery worker needs a separate final **Recovery
   disposition** taxonomy after triage; that must not overwrite D34 context.

## Superseded exploratory follow-up — what may Recovery context change?

### Why this needs a founder decision

D34's code is an attributed human triage hint, not verified source truth. It
could simply help authorized Website staff understand the gap, or the product
could use it to suggest or automatically choose what happens next. That choice
changes whether a low-friction radio selection becomes operational authority.

### Hope Ministries example

Maria returns the French Page correction and selects **This needs different
Website work**. Website still records the exact current Page action scopes. May
Core use Maria's selection to move the correction toward Navigation, or must an
authorized person/source command first verify the actual work?

### Option 1 — display and aggregate triage signal only — recommended

Show the attributed context on the authorized Website recovery surface and use
privacy-safe aggregate rates to find routing/model problems. It never changes
the action scopes, eligible people, ordering, destination, priority, SLA,
notification, permission or source state. Recovery staff inspect the source and
take an independently authorized command.

**UX:** honest and predictable. Maria supplies one useful hint without being
asked to diagnose the system; recovery staff see exactly what was asserted and
what remains authoritative.

**Impact:** lowest coupling and safest initial release. It preserves future
options after evidence shows which suggestions would actually help.

### Option 2 — source-validated recommendation, human confirms

The code may ask the source to compute a clearly labelled suggestion, such as
**Review Navigation responsibility**, but a currently authorized staff member
must inspect and confirm the exact source transition. The code alone never
chooses a person or action.

**UX:** may reduce triage time, but introduces suggestion confidence, stale-
state, explanation, ranking, accessibility and analytics obligations. Staff may
over-trust a suggestion derived from an unverified assertion.

**Impact:** viable later only after representative evidence and source-specific
precision/recall proof.

### Option 3 — automatically route from the code

The selected context directly changes action scope, route or successor—for
example, **a different kind of Website work** automatically sends the item to
Navigation.

**UX:** fastest when correct, but a staff hint silently becomes source authority
and mistakes can route protected work to the wrong people.

**Impact:** reject. It conflicts with D23/D27/D28/D31–D34 source ownership and
would create fragile cross-domain automation.

### Exploratory recommendation, now resolved by D34

**Recommend Option 1 — display and aggregate triage signal only.** D34 is useful
because it is small and honest. Making it operational immediately would turn a
safe catch-all choice into a hidden workflow language before Core has evidence
that staff classifications are reliable or that the same meanings apply beyond
Website.

The final D34 adversarial decision adopts Option 1 as an invariant, so this is
not an active founder question. The recorded D35 instead asks who receives
attention when Website work enters **Needs assignment**.

## Primary evidence index

### Core repository

- [`openspec/project.md`](../../../openspec/project.md)
- [`openspec/specs/platform-principles/spec.md`](../../../openspec/specs/platform-principles/spec.md)
- [`openspec/specs/platform-boundaries/spec.md`](../../../openspec/specs/platform-boundaries/spec.md)
- [`openspec/specs/workflow-orchestration/spec.md`](../../../openspec/specs/workflow-orchestration/spec.md)
- [`ADR-0181`](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
- [`ADR-0182`](../../adr/0182-one-current-candidate-review-responsibility-lane.md)
- [`ADR-0183`](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
- [`D30 primary research`](./phase-24-d30-required-request-changes-explanation-primary-research.md)
- [`D31 primary research`](./phase-24-d31-source-owned-correction-attention-primary-research.md)
- [`D32 primary research`](./phase-24-d32-source-backed-task-completion-primary-research.md)
- [`D33 primary research`](./phase-24-d33-source-validated-return-handoff-primary-research.md)
- [`D33 adversarial review`](./phase-24-d33-source-validated-return-handoff-adversarial-review.md)
- [`Phase 24 decision log`](./phase-24-multi-site-management-decision-log.md)
- [`CONTEXT.md`](../../../CONTEXT.md)
- [`mission_control_tasks` migration](../../../supabase/migrations/20260526193000_mission_control_tasks.sql)

### Current official product sources

- [Contentful — Entry Tasks](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)
- [Asana — assign tasks](https://help.asana.com/s/article/assign-tasks-to-teammates?language=en_US)
- [Microsoft — Planner assignment](https://support.microsoft.com/en-US/Planner/assign-people-to-tasks)
- [GitHub — closing an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/closing-an-issue)
- [GitHub — Issues REST API](https://docs.github.com/en/rest/issues/issues)
- [HubSpot — conditional stage properties](https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines)
- [Atlassian — Jira workflow rules](https://support.atlassian.com/jira-cloud-administration/docs/edit-an-issue-workflow/)
- [Zendesk — conditional required fields](https://support.zendesk.com/hc/en-us/articles/4408846008218-Making-conditional-ticket-fields-required)
- [Zendesk — Resolution field](https://support.zendesk.com/hc/en-us/articles/4408822200346-Using-a-Resolution-field-to-track-how-tickets-are-solved)
- [Microsoft — Dynamics status reasons](https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/define-status-reason-transitions-case-management)
- [Blackbaud — Altru reason codes](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/altru/help/content/RPManageReasonCodes.html)
- [Blackbaud — GrantsConnect application reasons](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantsconnect/content/gc-applications-faq.html)

### Current official privacy, security, database, accessibility and workflow sources

- [EU — GDPR Article 5](https://eur-lex.europa.eu/legal-content/EN/TXT/?toc=OJ%3AL%3A2016%3A119%3ATOC&uri=uriserv%3AOJ.L_.2016.119.01.0001.01.ENG)
- [OWASP — Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [W3C — radio-group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
- [W3C — WCAG 2.2 input assistance](https://www.w3.org/TR/WCAG22/#input-assistance)
- [PostgreSQL — row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Inngest — handling idempotency](https://www.inngest.com/docs/guides/handling-idempotency)
- [Inngest — durable execution](https://www.inngest.com/docs/learn/how-functions-are-executed)

## Evidence limits

- Official product documentation proves documented product behavior, not that
  a specific pattern improves outcomes for nonprofit ministry staff.
- Blackbaud provides useful nonprofit-product evidence but does not establish
  how current Asym Tenants classify Website responsibility gaps.
- No representative ministry interviews, usability sessions, context-code
  distributions, support cases or production telemetry were available here.
- The four-code registry is a researched product recommendation, not an
  externally standardized taxonomy. Its comprehension and recovery usefulness
  require representative testing before Live release.
- Exact retention, localization coverage and analytics cohort rules remain
  governed design/legal/privacy decisions; this record prevents unsafe defaults
  without inventing jurisdiction-specific legal advice.
- External configurable workflow products permit broader tenant customization
  than Core's governing ADRs. Repository source ownership and bounded-workflow
  decisions override those external patterns.

## Subsequent D35 resolution

D35 accepts an always-available source-owned Website **Needs assignment lane**
plus optional one-to-three-person Tenant recovery coordination. The bounded
D34 context stays in the operational source and may appear only in separately
authorized recovery detail; it is never copied into coordinator task lists,
events, logs, channels, or routing policy and cannot choose or rank a person.
D35 adds no Site override, broadcast, fallback, claim, email, reminder, or
target date. See the [D35 adversarial record](./phase-24-d35-shared-lane-optional-recovery-coordinators-adversarial-review.md).
