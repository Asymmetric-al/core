# Phase 24 D43 — Governed Holder Access Review/Removal Request

**Decision date:** 2026-08-29  
**Founder direction:** Option 1 — after an exact holder sees **Added for
continuity**, provide one governed request for review/removal rather than an
immediate self-revoke or an off-platform instruction to contact an
administrator.  
**Scope:** Holder and reviewer UX, source ownership, request lifecycle, grant
effects, authorization, Tenant/RLS safety, concurrency/idempotency, Tasks Hub
projection, optional Inngest execution, privacy, migration, operations, and
proof.  
**Method:** `/grill-with-docs`, repository/ADR/OpenSpec/current-code audit,
current primary-source review, Core UI/accessibility review, and the required
22-category adversarial pass.  
**Verification note:** Per founder direction, broad formatting, local-link,
skill-parity, strict OpenSpec, lint, typecheck, unit, build, and `git
diff --check` verification remains deferred until the Grill ends. Only focused
structural/count checks are permitted here.

> **Post-D50 historical note (2026-08-29):** D50 now gives a later D48-admitted
> episode one immutable request-anchored elapsed eligibility instant. Its
> trusted source-created instant is captured exactly once after D48's serialized
> policy winner is proved and is authoritative only if the D43 transaction
> commits; it is not a PostgreSQL physical commit timestamp or generic
> `created_at`. D50 changes no D43 request lifecycle, due status, access effect,
> runtime, or schema. D51 has since added source-fenced Off and prospective re-
> enable; D52 has fixed finite half-open source usefulness and no catch-up; D53
> now keeps every candidate absent until a D47 evidence-qualified proposal later
> passes a separate full activation. D54 local presentation is next. These
> reminder decisions add no runtime artifact.

## Final disposition

**Accept with required amendments.**

A governed request is the right permanent path. It gives the holder a clear
way to challenge unnecessary access without turning possession into mutation
authority, making a security-sensitive change by accident, or forcing the
holder to discover an administrator through email or institutional memory.

The unqualified option would nevertheless be brittle and debt-producing if it
were implemented as a new Website form, a generic workflow, a Tasks Hub row,
an Inngest wait, or an unversioned `pending/approved` Boolean. Option 1 is
accepted only with these amendments:

- use Phase 12's source-owned `permission_change_request` domain with one
  code-owned request kind; create no D43 table or generic workflow engine;
- bind the request to the exact Tenant, requester/subject Active Tenant
  Assignment, direct assignment-capability source, capability, and observed
  grant head; never accept those authority facts from the caller;
- submission records review intent only and does not shorten, suspend, revoke,
  renew, or otherwise change access;
- allow at most one current `pending_review` request for the exact direct source and return
  the same durable request/receipt on duplicate submission or response-loss
  retry;
- use one small closed lifecycle with immutable events and terminal outcomes,
  not configurable steps, comments, arbitrary states, or Tenant-authored
  automation;
- make **Remove direct access** an existing Phase 12 grant-end command that
  atomically commits the exact grant terminal event, audit/receipt, one epoch
  advance, request outcome, and identifier-only projection intent;
- require current exact-scope `permissions.manage_grants` grant-decision
  authority, expected request/grant heads,
  the Phase 12 floor, and existing self/SoD/quorum controls at the decision;
  task assignment or original-grantor history never authorizes;
- preserve every other direct/group source; compute post-decision
  `EffectiveAccess` rather than claiming that removal always ends access;
- keep request status and history source-owned and visible independently of
  Tasks Hub, notifications, or Inngest;
- keep every `pending_review` request in an always-available,
  permission-filtered **Access requests** source lane under the code-owned
  **Review current access** kind label/filter, and project one review
  occurrence to the shared Tasks Hub only after D44 defines and proves
  personal reviewer routing; Tasks Hub cannot complete, dismiss, delete,
  reassign, or decide it;
- restrict Inngest, if used, to identifier-only post-commit projection and
  reconciliation; no durable human wait or product authority lives there;
- classify free text as access-governance data, keep it out of task lists,
  notifications, search, analytics, logs, AI, and ordinary exports; and
- provide persistent, accessible, mobile-safe status and recovery rather than
  toast-only success, hidden queues, optimistic authority changes, or
  misleading promises that a reviewer was notified.

These amendments narrow and complete Option 1; they do not replace it.

## Exact corrected decision

> D43 registers `request_kind = holder_direct_grant_review` and the separate
> `request_contract_version = 1` on Phase 12 `permission_change_request`, with requested effect
> `review_for_removal`. It is a source-owned access-governance request, not a
> Website record, generic task, notification, approval DSL, automation, or
> immediate access mutation. Initial Phase 24 activation admits only an exact
> current D40 continuity-created direct D38 assignment-capability source shown
> to its exact holder under D42's `access.self_explanation` purpose. Other
> capabilities may reuse the code-owned request kind only after their own
> source, safety, field, and reviewer-routing contract is registered and
> tested; no Tenant-authored generic workflow results.
>
> In **My Access**, the current direct source/end condition and D42 holder-safe
> provenance remain first. One labeled secondary action appears beneath that
> exact source: **Ask for an access review**. It is not styled or worded as an
> immediate destructive action. Opening it changes nothing.
>
> Activating the action progressively reveals one inline Base Maia form
> directly beneath D42's holder-safe disclosure. It does not open a modal,
> nested sheet, separate wizard, or context-losing route. The form shows the
> current safe capability label, current direct end condition, and the
> statement **Someone authorized to manage access will decide whether to keep
> or remove this direct access. Sending this request will not change your
> access.** It asks one required plain-text question: **Why should this access
> be reviewed?** Helper text says **Briefly explain what changed. Do not include
> confidential ministry, donor, member-care, personnel, location, or security
> details.** The value is non-blank after outer-whitespace trim and at most 500
> Unicode code points. It supports ordinary international text and line
> breaks, rejects NUL/unsafe control characters, is rendered only as escaped
> text, and has no rich text, Markdown execution, attachment, mention, custom
> field, or URL preview.
>
> The primary action is **Submit review request**; the secondary action is
> **Cancel**. Submit uses Core's standard authenticated same-origin mutation/
> request-forgery boundary and one opaque command idempotency key. The caller
> may provide only that key, the bounded explanation, and an untrusted locator/
> expected head for the source already rendered by the authorized server
> projection. The server re-resolves that locator and derives Tenant,
> requester, subject, Active Tenant Assignment, actor, grant, capability,
> provenance, status, route, reviewer, timestamps, and audit attribution from
> trusted current context. D43 creates no single-use form-intent subsystem.
>
> The authoritative transaction re-proves exact self, current Active Tenant
> Assignment, current direct source, D42 holder purpose, current grant head,
> and Phase 12 floor. It inserts or returns one semantic `pending_review`
> request and
> immutable submission event/receipt. It does not mutate the direct grant or
> advance the authorization epoch. A partial, stale, changed, ended,
> cross-Tenant, cross-assignment, or unauthorized proof writes nothing and
> returns a role-appropriate recoverable outcome without becoming an existence
> oracle.
>
> There is at most one `pending_review` request with
> `request_kind = holder_direct_grant_review` and
> `request_contract_version = 1` for
> `(tenant_id, subject_assignment_id, direct_grant_source_id)`. Double click,
> client retry, network response loss, API replay, outbox replay, and concurrent
> tabs return the same source request and receipt while it remains pending. A
> terminal request is immutable and never reopened; if the exact source is
> still current, a later genuine concern creates a linked successor request
> with a fresh explanation and request generation. Abuse controls may throttle
> repeated terminal successors but cannot create or decide a request.
>
> The closed source lifecycle is:
>
> - `pending_review` — review requested; no access change;
> - `withdrawn` — the exact current requester withdrew before a terminal
>   decision; no access change;
> - `resolved_kept` — an authorized reviewer deliberately kept the direct source;
>   no access change;
> - `resolved_removed` — the exact direct source was ended by the authoritative Phase 12
>   grant command; and
> - `no_longer_applicable` — the direct source independently ended, expired,
>   was replaced, or no longer denotes the same subject/capability before a
>   reviewer decision.
>
> Only `pending_review` is nonterminal. Terminal events are append-only, carry a stable
> predecessor/head and typed cause, and cannot transition again. There is no
> generic `approved`, `done`, `closed`, `reopened`, `snoozed`, `dismissed`,
> `deleted`, `escalated`, `waiting`, or Tenant-created status. Claiming,
> reading, notification delivery, or task engagement does not change source
> state.
>
> While pending, the exact requester may choose **Withdraw request**. Withdrawal
> re-proves current self/history visibility and expected request head, appends
> one terminal event, and leaves access unchanged. If a decision won the race,
> withdrawal returns that committed outcome. Withdrawal is not hard deletion
> and does not erase the request or its audit history.
>
> An authorized grant decision-maker opens the request through the Phase 12
> access-governance source, not through task authority. Every enumerate, count,
> list, detail, decision, and retry re-proves the actor's current exact Tenant
> assignment, registered grant-governance purpose,
> `permissions.manage_grants` within the live assignable scope/ceiling, Phase
> 3/10/12 floor, current request/grant heads, and applicable Phase 12
> self/SoD/quorum/risk controls. Original grantor status, a role name, a task,
> notification, deep link, cached detail, support status, or prior review
> grants nothing. A separately authorized audit/review reader may inspect only
> through its independent read purpose/projection; it cannot keep/remove,
> appear in the decision resolver, or receive a personal actionable task.
> Every request remains discoverable in a permission-filtered
> **Access requests** source lane under the code-owned **Review current
> access** kind label/filter to actors who independently pass those checks.
> D44 decides only which currently eligible exact-scope
> `permissions.manage_grants` holders receive personal Tasks Hub
> projection and cannot weaken source-lane visibility or action checks.
>
> The reviewer sees the current grant-governance projection, the holder's
> escaped explanation, current source/end state, all current EffectiveAccess
> sources needed to understand the consequence, and request chronology. It
> never receives protected source bodies merely because a request exists. The
> decision surface offers exactly **Remove direct access** and **Keep direct
> access**. Choosing **Keep direct access** reveals one required concise,
> holder-safe **Why this direct access is being kept** field under the same
> 1–500-code-point plain-text contract. It is durable source evidence, not a
> task comment or email body. **Remove direct access** requests no duplicate
> prose: the already-reviewed current consequence plus authoritative grant-
> terminal/request receipt generates the holder-safe source-ended/current-
> access outcome. Any grant-command audit reason remains source evidence and is
> not solicited again by D43. No comment thread, arbitrary questionnaire,
> attachment, AI summary, multi-stage builder, or local D43 approval chain is
> created.
>
> **Keep direct access** appends `resolved_kept` plus the current expected request
> and grant heads and immutable decision evidence. It does not rewrite the
> grant, extend its duration, or advance the authorization epoch. If the grant
> changed since review, commit fails without a decision and the surface reloads
> current consequences before another deliberate command.
>
> **Remove direct access** invokes the existing Phase 12 exact-source grant-end
> command. One authoritative transaction locks/re-proves the request and grant
> heads; reauthorizes the reviewer; applies Phase 12 self/SoD/quorum and last-
> authority safeguards; appends the grant terminal event, request
> `resolved_removed`
> event, audit and semantic receipt; advances the Tenant authorization epoch
> exactly once for the grant change; and writes an identifier-only source/task
> projection intent. If any part fails, neither the grant nor request becomes
> terminal. Retrying the same semantic command returns the committed receipt.
>
> Removal targets only the exact direct source. It never removes a group
> membership, group capability, another direct/named source, Active Tenant
> Assignment, task, Website setting, or committed D37 effect. The post-command
> server projection computes whether the person still has the capability from
> another source. Holder-safe result copy is **Direct access removed** followed
> by either **You still have this access another way** or **You no longer have
> this access**, without exposing fields D42 withholds. Only loss of the final
> current source triggers Phase 12's existing access-loss/epoch consequences.
>
> If the exact direct source expires or ends through another valid command
> first, source reconciliation appends `no_longer_applicable`; the request is
> never reported as reviewer-approved removal. If capability/subject/source
> identity changes, the old request cannot transfer. A duration or other
> mutable grant-head change blocks stale decision; the reviewer must reload and
> deliberately act against the new current head while the request remains
> pending, or the source marks the request no longer applicable when identity no
> longer matches.
>
> While the exact direct source remains current, My Access shows its pending
> status inline. My Access also contains one quiet subject-only **My access
> requests** section backed by the Phase 12 request aggregate—not a D43-only
> page or table—so terminal history remains reachable after the current source
> disappears. The section re-proves the exact current Active Tenant Assignment,
> self-history purpose, and retention for each list/detail page; it never
> becomes current-access truth.
>
> Source-owned request status remains independent of task delivery:
> **Review requested**, **Withdrawn**, **Direct access kept**, **Direct access
> removed**, or **Direct access ended before review**, with localized date/time and the
> holder-safe keep explanation where applicable. Pending status says **Your
> access has not changed.** The UI never says a named reviewer was notified, promises
> a response time, or implies removal until the source receipt proves it.
> Success is a persistent request detail/status with a programmatic status
> announcement, not a toast alone.
>
> D43 reuses ADR-0183. The permission request is the source occurrence and owns
> applicability, lifecycle, authorization, decision, and correction. The
> permission-filtered **Access requests** source lane is always available and
> remains authoritative/discoverable without personal routing. After D44
> registers a complete eligible personal reviewer route, one pending request
> may project
> one stable shared source-backed task identity with recipient-specific
> assignment/engagement through the source-adapter identity
> `phase12.holder_direct_grant_review@1`; that adapter identity is not the
> request kind/version. Its list title is
> code-owned (for example **Review an access removal request**); safe holder and
> capability labels appear only when admitted by the current reviewer
> projection. Request explanation, keep explanation, D40 reason/basis, group
> provenance, raw IDs, and protected data are source-loaded after current
> authorization and are never copied into task rows, search, comments,
> notifications, or analytics.
>
> Generic Complete, Done, Dismiss, Delete, Reopen, drag-to-Done, bulk mutation,
> task reassignment, task API/import, AI, support, and worker commands reject a
> source-backed D43 task. A `resolved_kept` or `resolved_removed` source receipt projects
> **Completed in People & access**; `withdrawn` or
> `no_longer_applicable` projects **No longer required**. Projection/access
> failure never fabricates completion. Request source status remains available
> in its authorized source lane even if Tasks Hub is down or no personal route
> is currently provable.
>
> The request transaction writes one durable identifier-only outbox intent.
> Inngest may optionally materialize/reconcile a projection after commit using
> only request/source kind, request ID, Tenant routing reference, causal outbox
> ID, and schema version. It re-resolves current source state and recipient
> authorization at fire time. It never receives explanation/decision text,
> capability/provenance bodies, selects reviewers from event data, waits for a
> human, owns retries as product idempotency, or mutates a grant/request because
> a task changed. Database uniqueness, expected heads, semantic receipts, and
> reconciliation remain authoritative if Inngest is unavailable or replaced.
>
> Request/reviewer text is access-governance data under Phase 3/10/12 field,
> purpose, retention, audit, export, backup, anonymization, and legal-hold
> policy. It is excluded from general logs/traces/errors, notification bodies,
> Tasks Hub storage, full-text search, analytics/BI, AI prompts/embeddings,
> documents, ordinary exports, staff scoring, and ministry-performance uses.
> Authorized source/audit views escape text, use current purpose/floor, and
> durably audit protected reads without copying the text into read-audit.
>
> Request tables carry `tenant_id NOT NULL`; same-Tenant composite foreign keys
> bind requester/subject assignment, direct source, capability, request head,
> event, decision, receipt, and task occurrence. The holder subtype enforces
> requester assignment equals subject assignment. Authority-bearing identity,
> source, status, actor, timestamps, and route fields are immutable/server-
> derived. Raw relations have no browser grants; writes use hardened commands
> with `ENABLE`/`FORCE RLS`, correct `USING` and `WITH CHECK`, pinned
> `search_path`, and owner/service/`BYPASSRLS`/worker/support parity. Hard delete
> and cross-Tenant cascade are forbidden.
>
> D43 adds no Website-only request table, generic workflow/status engine,
> tenant-authored route DSL, arbitrary form builder, approval chain, inbox,
> comment system, SLA/deadline, reminder, escalation, auto-revoke timer,
> notification channel, email/SMS/push, external IAM dependency, AI review,
> or Inngest authority. D44 must settle one bounded personal reviewer route
> before D43 personal Tasks Hub projection; it does not gate source-lane
> reviewer activation.

## Current behavior, intended behavior, and permanent path

| Area                | Current repository behavior                                                                                     | Prior intended contract                                                            | D43 permanent path                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Holder self-service | No shipped Phase 12 My Access/request runtime; current staff capabilities remain broad MVP.                     | Phase 12 user story says staff can request access and inspect My Access.           | Add one holder-initiated review-for-removal subtype, not a Website form.                                                                                                |
| Request data        | Phase 12 names `permission_change_request + decision` but does not fully specify this removal-review lifecycle. | Phase 12 owns permission request/decision records and the one authorization spine. | Extend that domain with a closed code-owned kind and events.                                                                                                            |
| Access mutation     | No D43 behavior.                                                                                                | Phase 12 advisory-locked grant-state command owns direct-source endings and epoch. | Reviewer removal calls that command atomically; request alone never mutates access.                                                                                     |
| Tasks               | Existing task-shaped products are migration inputs; not interchangeable truth.                                  | ADR-0183 makes Tasks Hub a source-owned projection.                                | Keep an always-available Access requests source lane with **Review current access** filter; project one request occurrence personally only after D44 proves recipients. |
| Async               | Existing Inngest use does not establish product authority.                                                      | ADR-0183 permits identifier-only materialization/reconciliation.                   | Optional post-commit executor; never human wait or domain state.                                                                                                        |
| UI                  | Current seed-backed Teams sheet is not central access governance.                                               | D39–D42 target People & access/My Access and Base Maia primitives.                 | Quiet secondary self-service action with persistent source status.                                                                                                      |

The permanent path does not bless current broad role checks, the current
generic audit resolver, seed Teams state, or any task collection as
authorization. It is a forward Phase 12/24 contract awaiting implementation.

## Evidence, modern-practice check, and limits

### Repository facts

- [Phase 12](./phase-12-full-role-permission-configuration.md) names
  `permission_change_request + decision`, requires one purpose-bound PDP,
  assignment-bound grants, same-Tenant composite relationships, advisory-
  locked grant mutations, epoch revocation, audit, and quorum-aware governance.
- [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
  requires the consequence-owning source to own business state and makes Tasks
  Hub/Inngest non-authoritative projections.
- [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)
  makes the direct assignment-capability source independent, assignment-bound,
  and governed by Phase 12 rather than by Website or task state.
- [D40](./phase-24-d40-deliberate-continuity-direct-grant-adversarial-review.md),
  [D41](./phase-24-d41-current-direct-source-historical-provenance-adversarial-review.md),
  and [D42](./phase-24-d42-purpose-tiered-continuity-provenance-adversarial-review.md)
  establish deliberate continuity creation, plain current-source presentation,
  and holder-minimized provenance. D43 cannot widen those fields.

### Verified current external facts

- [Microsoft Entra My Access](https://learn.microsoft.com/en-us/entra/id-governance/my-access-portal-overview)
  separates user request/review surfaces from administrator configuration and
  provides request history/status.
- [Microsoft self access review](https://learn.microsoft.com/en-us/entra/id-governance/self-access-review)
  lets a person state they no longer need access while the governed review
  applies the eventual removal; this supports a visible self-correction route,
  not Core's exact lifecycle.
- [SailPoint access requests](https://documentation.sailpoint.com/saas/user-help/requests/index.html)
  distinguish access/removal requests, approval, provisioning, request status,
  and notification. [SailPoint revocation configuration](https://documentation.sailpoint.com/saas/help/requests/config_entitlements.html)
  also distinguishes a revocation request from deleting source entitlement
  state. These support governed source removal rather than task-owned mutation.
- [Okta Identity Governance](https://help.okta.com/oie/en-us/content/topics/identity-governance/iga.htm)
  separates Access Requests, Access Certifications, lifecycle/provisioning,
  tasks, and reporting. D43 intentionally adopts the separation but not a
  tenant-authored workflow product.
- [NIST SP 800-53 Rev. 5.1](https://csrc.nist.gov/CSRC/media/Projects/risk-management/800-53%20Downloads/800-53r5/SP_800-53_v5_1-derived-OSCAL.pdf)
  supports least privilege, review/removal of privileges, and auditable account
  changes. It does not prescribe Core's UI, task route, or schema.
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
  requires deny-by-default, per-request authorization, relationship/object
  checks, safe failure, logging, and authorization tests.
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
  documents default-deny RLS, `USING`/`WITH CHECK`, and owner/`BYPASSRLS`
  caveats that make direct browser writes or role-only policy unsafe.
- [W3C accessible forms guidance](https://www.w3.org/WAI/tutorials/forms/)
  recommends short forms, only necessary input, labels/instructions,
  validation, undo, and completion feedback. [WAI status-message guidance](https://www.w3.org/WAI/WCAG21/Understanding/status-messages)
  supports programmatic submission/status feedback, while the [dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
  governs focus when a modal primitive is used.

### Product judgments and unresolved evidence

- **Product judgment:** a governed request is safer than immediate self-revoke
  for a continuity source because a mistaken click can disrupt duties and the
  holder may not know surviving source consequences.
- **Product judgment:** one `pending_review` request plus immutable events is
  sufficient; a generic workflow engine, comment thread, and configurable
  statuses are not. The holder's plain CTA may say **Ask for an access
  review**, but the authoritative admin lane is **Access requests**, because
  Phase 12's periodic access-review/recertification campaign is a distinct
  product and modern IAM products distinguish requests from certifications/
  reviews.
- **Product judgment:** a concise required request explanation and conditional
  keep explanation improve reviewer/holder clarity enough to justify two
  bounded text fields; removal needs no duplicate prose because its receipt and
  computed current-access consequence are authoritative.
- **Assumption:** ministry staff sometimes recognize access they no longer
  need and prefer a trusted in-product correction path. No cited study proves
  frequency or exact wording for missions ministries.
- **Evidence required before activation:** representative small/distributed
  ministry usability sessions must verify action discovery, understanding that
  submission does not remove access, reason-field comfort, status clarity,
  withdrawal, and final outcome comprehension without exposing protected data.
- **Historical D44 unknown — resolved 2026-08-29:** current runtime and
  published ministry evidence did not determine one universal routing policy.
  D44 therefore adopted optional one-to-three explicit **Access request
  coordinators**, retained the always-available permission-filtered source lane,
  prohibited guessed fallback, and required an independent Phase 17 in-product
  attention item alongside each newly admitted source-backed Tasks Hub
  responsibility. See the D44 adversarial artifact; D43 authority and lifecycle
  remain unchanged.

## UX and UI contract

### Holder — resting state

```text
Granted directly to you · Ends 15 October 2026

Why you have access
  Added for continuity · 29 August 2026
  Direct access was added so your access could continue if group access changed.

Ask for an access review
```

The action is visible, labeled, and secondary. It is not a red destructive
button, toggle, checkbox, kebab-only item, or nested action inside the
provenance disclosure. Current access remains the primary information.

### Holder — request surface

```text
Website recovery settings
Granted directly to you · Ends 15 October 2026

Someone authorized to manage access will decide whether to keep or remove this
direct access. Sending this request will not change your access.

Why should this access be reviewed?
[ Plain-text input                                                   ]
Briefly explain what changed. Do not include confidential ministry, donor,
member-care, personnel, location, or security details.       0 / 500

[Cancel]                                      [Submit review request]
```

- The single-field Base Maia form expands inline immediately below the D42
  disclosure/action; no modal, sheet, wizard, or separate route obscures the
  current source being reviewed.
- Opening/canceling writes nothing.
- No option is preselected because there is only one requested effect.
- Client validation supplements, never replaces, server validation.
- Server error preserves entered text in the current session, focuses a
  summary/field error appropriately, and does not claim submission.
- Stale grant state produces **This access changed while you were reviewing
  it. Review the current details before submitting.** It never silently rebases.

### Holder — source-owned status

```text
Review requested · 29 August 2026
Your access has not changed.

Why you asked
My responsibilities changed and I do not think I need this access now.

[Withdraw request]
```

Status is a persistent page/detail state and deep link, not a toast. If task
projection is delayed, the holder still sees the committed request. The UI
does not expose reviewer names or delivery claims until a later decision
explicitly authorizes such presentation.

Terminal holder copy is exactly one of:

- **Withdrawn** — `This request was withdrawn. Your access did not
change.`
- **Direct access kept** — holder-safe keep explanation follows; current access is
  reloaded.
- **Direct access removed** — followed by the safe post-resolution sentence
  about whether access remains another way.
- **Direct access ended before review** — `This direct access ended before the
review was completed.` The current-access consequence follows without
  exposing a D42-withheld source.

After `resolved_removed` or `no_longer_applicable`, the direct source is no
longer a current-access row. The terminal receipt/status therefore remains in
one quiet subject-only **My access requests** section in My Access. Pending
status may appear both inline with the current source and in that aggregate;
the two are projections of one request head, not copied status. The section is
not a D43-only page/table and never treats request history as current access.

### Reviewer — governance surface

The source detail shows current request and grant facts before action. It loads
the holder explanation only after current grant-governance authorization.
Tasks Hub may deep-link here but cannot render a cached protected body or
decide the request.

```text
Review access request

Requested by Jordan Lee · 29 August 2026
Website recovery settings · Direct grant · Ends 15 October 2026
Current access after each choice: [server-derived consequence]

Why Jordan asked
My responsibilities changed and I do not think I need this access now.

[Keep direct access]                         [Remove direct access]
```

**Remove direct access** uses the existing destructive-action style only here,
where removal is real. The current consequence and surviving sources precede
the button in visual and DOM order. There is no typed confirmation phrase,
double modal, or checkbox acknowledgement; Phase 12's existing risk/step-up
controls apply if the capability class requires them.

Selecting **Keep direct access** expands one required field:

```text
Why this direct access is being kept
[ Plain-text input                                                   ]
This explanation is visible to the requester. Do not include confidential details.

[Cancel]                                      [Keep direct access]
```

**Remove direct access** asks for no duplicate note. Its current consequence
review and the authoritative terminal receipt produce the exact holder-safe
outcome. Existing grant-command audit evidence remains governed source data,
not a second D43 field.

### Accessibility, internationalization, mobile, and low bandwidth

- Use the existing Base Maia/Base UI inline form, button, field,
  error-summary, status, disclosure, and timeline primitives; do not create a
  D43 component system or add a modal/sheet inside the seed Teams sheet.
- Every field has a persistent visible label, instructions, described error,
  and programmatically determinable required/invalid state.
- Expanding the inline form moves focus to its heading or first invalid field
  only when appropriate; Cancel collapses it and restores focus to **Ask for
  an access review** without discarding current source context.
- Important controls are at least 44 by 44 CSS pixels, have visible focus in
  forced colors, and do not rely on hover, color, icon, truncation, or motion.
- The flow reflows at 320 CSS pixels and 400-percent zoom without a wide
  permission table; button order remains logical and destructive action is not
  placed where habitual submit is expected.
- Text accepts Unicode/RTL/CJK and displays user content with bidi isolation;
  code-point counts, localized dates/time zones, names, wrapping, and error
  copy remain accurate.
- Request submission has no client time limit. Session/security expiry retains
  unsent text locally only for the current safe interaction and requires a
  fresh server intent; it never persists reason text in local storage.
- Lossy/slow connections show pending without duplicate submission, announce
  the final server result, and recover the request by semantic lookup after an
  ambiguous response.

## Domain model, lifecycle, and invariants

### Source records

The Phase 12 request domain needs the following logical records. Exact physical
table partitioning remains an implementation design choice; the invariants do
not.

| Record                           | Authoritative facts                                                                                                                                                              | Required constraints                                                                                                                                                                 |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `permission_change_request` head | Tenant, kind/version, requester/subject assignment, exact direct source/capability, request generation, current state/head, created instant                                      | `tenant_id NOT NULL`; same-Tenant composite FKs; requester=subject for this kind; immutable identity; one pending semantic head                                                      |
| request submission event         | request head predecessor, bounded reason, trusted actual/acting actor/assignment, observed grant head, instant, receipt                                                          | Append-only; no caller authority fields; reason text classified                                                                                                                      |
| request decision/terminal event  | expected request/grant heads, typed outcome/cause, required holder-safe keep explanation only for `resolved_kept`, trusted reviewer actors/authority, grant receipt when removed | Append-only; exactly one terminal successor; keep explanation required only for `resolved_kept`; removal receipt required and duplicate D43 message forbidden for `resolved_removed` |
| direct grant source/head         | Current assignment-capability relation and revisions                                                                                                                             | Phase 12 owns; request never becomes grant truth                                                                                                                                     |
| source work occurrence/outbox    | Request ID, action kind/version, causal receipt, projection intent                                                                                                               | Identifier-only; unique semantic occurrence; same authoritative transaction                                                                                                          |
| Tasks Hub projection             | Shared task identity, recipient assignments/engagement, safe presentation                                                                                                        | Derived/reconcilable; no request reason/decision/grant truth                                                                                                                         |

Recommended structural constraints include:

- same-Tenant composite foreign keys from every request/event/decision to the
  requester/subject assignment, direct source, capability, and predecessor;
- a server-enforced check that this request kind's requester assignment equals
  subject assignment;
- a partial unique current-pending index on `(tenant_id,
subject_assignment_id, direct_grant_source_id, request_kind)` where state is
  `pending_review`;
- unique immutable event sequence/head and semantic receipt keys;
- indexes for holder history `(tenant_id, subject_assignment_id, created_at,
id)`, reviewer lane `(tenant_id, state, created_at, id)`, direct-source
  reconciliation `(tenant_id, direct_grant_source_id, state)`, and outbox
  claims; and
- `ON DELETE RESTRICT`/archival for assignments, grants, requests, events,
  decisions, and receipts; no Tenant-crossing or evidence-destroying cascade.

### State-transition table

| From             | Command/event                      | To                                  | Access effect                                              | Required proof                                                            |
| ---------------- | ---------------------------------- | ----------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| none             | exact holder submits               | `pending_review`                    | None; no epoch                                             | Self, current direct source/head, purpose/floor, uniqueness               |
| `pending_review` | exact requester withdraws          | `withdrawn`                         | None; no epoch                                             | Self/history purpose, expected request head                               |
| `pending_review` | authorized reviewer keeps          | `resolved_kept`                     | None; no epoch                                             | Current grant governance, expected request+grant heads, controls, message |
| `pending_review` | authorized reviewer removes        | `resolved_removed`                  | Exact direct source ends; one epoch                        | Same proof plus atomic grant terminal receipt                             |
| `pending_review` | source independently ends/replaces | `no_longer_applicable`              | Whatever source command already caused; no D43 extra epoch | Current source reconciliation + causal source receipt                     |
| any terminal     | any command                        | rejected/idempotent existing result | None                                                       | Terminal immutability                                                     |

### Permanent invariants

1. A request is review intent, never current access or removal authority.
2. The Phase 12 grant head is the sole authority for the direct source.
3. The request domain owns request state, decision, and request history.
4. Tasks Hub owns no request/grant state and stores no protected text.
5. Inngest owns no product fact and is replaceable.
6. One request binds one Tenant and exact holder Active Tenant Assignment.
7. One request binds one exact current direct source and capability.
8. This holder kind enforces requester assignment equals subject assignment.
9. At most one `pending_review` request exists for the semantic direct source.
10. Duplicate transport attempts return one durable business effect.
11. Only `pending_review` can transition; every terminal state is immutable.
12. Exactly one of withdrawal, retain, remove, or no-longer-applicable wins.
13. Removal is true only with the exact direct-source terminal receipt.
14. Retain never extends, renews, or rewrites the grant.
15. Submit/withdraw/retain/task actions never advance the auth epoch.
16. Exact grant removal advances the auth epoch once, not once per projection.
17. Other access sources are never removed or rewritten by D43.
18. Post-decision ability is resolved, not inferred from request outcome.
19. Historical grantor/task/reviewer relations never authorize.
20. Current purpose/capability/floor is re-proved for every operation.
21. Request reason and keep explanation never authorize or select a route.
22. Request/task absence never proves the grant is safe or unnecessary.
23. Projection failure never rolls back or falsifies source state.
24. Source state remains discoverable independently of Tasks Hub.
25. The Access requests source lane is always available only through current
    exact `permissions.manage_grants` scope/ceiling and source authorization;
    read-only audit/review authority cannot act or route.
26. D44 personal routing cannot broaden reviewer action authority; no personal
    task exists until a complete eligible route is proved.
27. Protected text is source-loaded and omitted from secondary egress.
28. Cross-Tenant relationships and mutations are structurally impossible.
29. Unknown kind/version/state/event fails closed and cannot mutate access.
30. D43 can be disabled without deleting grants, requests, receipts, or audit.

## Normative requirements

1. **D43-R1 — Reuse Phase 12.** Use one code-owned
   `permission_change_request` kind; create no Website request table or generic
   workflow engine.
2. **D43-R2 — Initial admitted source.** V1 admits the exact current holder of
   one D40 continuity-created direct D38 assignment-capability source.
3. **D43-R3 — Exact self.** Requester and subject are the same exact current
   Active Tenant Assignment; caller-supplied subject/tenant is ignored/rejected.
4. **D43-R4 — Intent, not mutation.** Submission and `pending_review` status do not change
   grant state, EffectiveAccess, expiry, or epoch.
5. **D43-R5 — Minimal request form.** One nonblank, at-most-500-code-point
   plain-text explanation is the only user-entered request field.
6. **D43-R6 — Safe text.** Text is escaped, purpose-classified, and excluded
   from task/notification/log/search/AI/analytics/ordinary-export egress.
7. **D43-R7 — One pending request.** Enforce at most one `pending_review` request for the exact
   Tenant/holder/direct-source/kind.
8. **D43-R8 — Semantic idempotency.** Retry/replay/concurrent submit returns the
   same current request/receipt, independent of transport key or Inngest.
9. **D43-R9 — Immutable binding.** Request identity binds exact source,
   capability, holder, kind/version, generation, and observed grant head.
10. **D43-R10 — Closed lifecycle.** Only `pending_review`, `withdrawn`,
    `resolved_kept`, `resolved_removed`, and `no_longer_applicable` exist; only
    `pending_review` transitions.
11. **D43-R11 — Safe withdrawal.** Exact requester may withdraw pending intent;
    withdrawal is terminal, audited, and changes no access.
12. **D43-R12 — Current grant-decision authority.** Every actionable lane,
    detail, routing, and decision operation requires current exact
    `permissions.manage_grants`, grant-governance purpose, live scope/ceiling,
    floor, and Phase 12 controls; audit/review-read authority, routing/task/
    history grants nothing.
13. **D43-R13 — Atomic removal.** `resolved_removed` and exact grant end/audit/receipt/
    one epoch/outbox commit atomically or not at all.
14. **D43-R14 — Honest, nonduplicative outcomes.** `resolved_kept` requires one
    holder-safe explanation and never renews/extends/rewrites access;
    `resolved_removed` accepts no duplicate D43 prose and derives holder-safe
    outcome from the current consequence plus terminal receipt.
15. **D43-R15 — Source-ended outcome.** Independent source end/expiry/replacement
    yields `no_longer_applicable`, never fabricated reviewer removal.
16. **D43-R16 — Expected heads.** Submit, withdraw, retain, and remove use
    current expected request/grant heads and reject stale conflict.
17. **D43-R17 — Source independence.** D43 can end only the bound direct source;
    all other direct/group/named sources and memberships remain independent.
18. **D43-R18 — Epoch discipline.** Only a real grant-state change advances the
    authorization epoch, exactly once.
19. **D43-R19 — Source lane and task projection.** Every pending request appears
    in the permission-filtered Access requests source lane under **Review
    current access**; one request may
    project one ADR-0183 source-backed personal task after complete D44 routing proof.
20. **D43-R20 — Source-controlled task closure.** Generic task mutations reject
    D43; source terminal receipt alone ends task applicability.
21. **D43-R21 — D44 personal-route gate.** No personal reviewer projection or
    delivery claim ships until D44 defines complete eligible current routing;
    source-lane discoverability does not depend on D44, and the exact requester
    is always excluded from their own personal review-task recipients.
22. **D43-R22 — Optional Inngest only.** Inngest may execute identifier-only
    post-commit materialization/reconciliation and owns no request/grant/task.
23. **D43-R23 — Structural Tenant safety.** `tenant_id NOT NULL`, same-Tenant
    composite FKs, assignment binding, restricted delete, and source equality
    checks cover the full graph.
24. **D43-R24 — Hardened mutation boundary.** Browser cannot write raw request/
    decision relations; hardened commands derive authority/actor/status and
    preserve `USING`/`WITH CHECK`/FORCE RLS/privileged parity.
25. **D43-R25 — Purpose-tiered reads and holder history.** Holder current/
    **My access requests**, actionable grant-manager, separate audit-reader,
    task-list, and everyone-else projections are distinct server allowlists
    consistent with D42; request history never becomes current-access truth.
26. **D43-R26 — No secondary leakage.** Protected request/grant/provenance text
    is not copied into Tasks Hub, notifications, logs, search, AI, analytics,
    documents, or ordinary exports.
27. **D43-R27 — Excellent accessible UX.** One quiet secondary action, explicit
    no-change copy, persistent status, recoverable errors, accessible form/
    focus/status, 44px controls, 320px/400% reflow, and i18n are normative.
28. **D43-R28 — Audit/retention.** Append-only history, trusted attribution,
    protected-read audit, retention/anonymization/legal hold, and holder-safe
    history follow Phase 12; no hard delete.
29. **D43-R29 — No speculative platform.** D43 adds no configurable workflow,
    form builder, comment system, SLA/reminder/escalation, auto-revoke,
    notification channel, AI decision, or external IAM dependency.
30. **D43-R30 — Traceability/proof.** D43 must trace through Grill/glossary/ADR/
    Phase 12/OpenSpec/design/tasks/tickets/tests/release; source-request
    activation requires all applicable ACs/monitors, personal Tasks Hub
    activation additionally requires D44 routing, and D44 cannot alter D43
    ownership, lifecycle, authorization, or privacy invariants.

## Ruthless adversarial review by category

### 1. Problem validity, necessity, and alternatives

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                                                                        | Severity / likelihood      | Evidence or reasoning                                                                                                                                                                           | Decision effect                                                                                                       | Best permanent fix                                                                                                      | Exact language / AC                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| A holder sees sticky direct access but cannot safely correct it; email/admin hunting makes unnecessary privilege persist. Conversely, immediate self-revoke can disrupt work without showing surviving-source consequences. | High / Medium              | Entra self review and SailPoint removal requests provide governed self-service; Phase 12 already owns request/decision and grant consequences. Ministry frequency is an assumption, not a fact. | **Narrows, does not invalidate.** Option 1 is justified only as a Phase 12 source request with no immediate mutation. | One visible secondary request action, persistent status, authorized consequence review, and exact-source grant command. | “Submission records review intent only; it changes no access.” D43-AC001–020, AC021–040. |
| A generic workflow builder could solve hypothetical future cases but freeze speculative states/routes into Phase 24.                                                                                                        | High / High if generalized | ADR-0183 requires each source to register finite actions; Phase 12 already names `permission_change_request`.                                                                                   | **Changes implementation level.** Reuse domain/type; reject a new engine.                                             | Closed code-owned kind/version and five-state lifecycle; future sources register separately.                            | “D43 creates no generic workflow/status/form/approval DSL.” D43-AC001, AC019, AC117.     |

### 2. Brittleness

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                              | Severity / likelihood                 | Evidence or reasoning                                                                                           | Decision effect                                                                                             | Best permanent fix                                                                                   | Exact language / AC                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| A request keyed by person, display name, capability label, current route, task, or original grantor breaks after rename, assignment recreation, route change, or staff departure. | Critical / High without exact binding | D39–D42 bind authority to exact Active Tenant Assignment and immutable source; ADR-0183 forbids task authority. | **Narrows.** The request must bind stable Tenant/source/assignment/head identities and derive presentation. | Same-Tenant composite FKs, immutable source binding, code-owned kind, event/head model, no transfer. | “A request never transfers across assignment, source, capability, or Tenant.” D43-AC021–040, AC041–060. |
| A queue implemented as an Inngest sleep or task status fails when the provider, handler, or projection is changed.                                                                | Critical / Medium                     | ADR-0183 explicitly makes executors non-authoritative and replaceable.                                          | **Changes architecture.** Async is optional materialization only.                                           | Product DB owns state/idempotency; transactional outbox + reconciliation; no durable human wait.     | “Inngest never waits for or decides the human lifecycle.” D43-AC071–080.                                |

### 3. Technical debt

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                      | Severity / likelihood              | Evidence or reasoning                                                                             | Decision effect                                                  | Best permanent fix                                                                                                                            | Exact language / AC                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| A D43-specific request table, copied grant status, custom approval UI, and task comments duplicate Phase 12/Tasks Hub semantics and drift.                                | High / High if implemented locally | Phase 12 names request+decision; ADR-0183 owns task projection; D40 relation remains grant truth. | **Changes implementation.** No local storage or copied workflow. | One typed Phase 12 request extension; shared Base Maia primitives; source detail by reference.                                                | “There is one request authority, one grant authority, and one task projection.” D43-AC001, AC061–070, AC116–119. |
| Loose strings for state/outcome/reason parsing create incompatible clients and migrations.                                                                                | High / Medium                      | Closed domains and versioned source contracts are established Phase 24 practice.                  | **Narrows.** State/reason text cannot encode behavior.           | Closed enum/kind version; typed terminal causes; explicit server DTOs; unknown fails closed.                                                  | “No behavior is inferred from prose or unregistered status.” D43-AC018–020, AC109–113.                           |
| Requiring a second removal explanation would duplicate the exact grant command's reviewed consequence/audit evidence and create two competing reasons for one source end. | Medium / High if form-reused       | Phase 12 grant mutation owns removal receipt/reason; D43 owns request intent.                     | **Narrows form/data.**                                           | Keep alone requires holder-safe explanation; removal generates safe outcome from terminal receipt/current resolver and collects no D43 prose. | “`resolved_removed` has no D43 decision-text field.” D43-AC025–028, AC082.                                       |

### 4. Edge cases

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                                                                                         | Severity / likelihood     | Evidence or reasoning                                                                                        | Decision effect                                                                      | Best permanent fix                                                                                                       | Exact language / AC                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Double submit, lost response, two tabs, grant expiry, independent revoke, assignment end/recreation, holder also being a reviewer, multiple surviving sources, or a grant-head change can produce duplicate work or the wrong access result. | Critical / High aggregate | These are normal distributed/UI races; Phase 12 has expected heads/epoch and ADR-0183 semantic identity.     | **Narrows.** Every case requires an explicit outcome; optimistic UI is insufficient. | Unique pending key, semantic receipt, expected heads, terminal CAS, source reconciliation, current post-effect resolver. | “Exactly one terminal outcome wins; post-removal access is resolved, never inferred.” D43-AC021–040. |
| Reason text may be blank, only whitespace, international, long, bidi, include control characters, or contain sensitive facts.                                                                                                                | High / High aggregate     | W3C recommends only necessary fields and clear validation; user text is untrusted and potentially sensitive. | **Narrows UX/data contract.**                                                        | Nonblank trimmed 500-code-point plain text, Unicode support, control rejection, escaped display, no secondary egress.    | “The server validates and escapes one bounded text value.” D43-AC007–012, AC081–100.                 |

### 5. Footguns

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                       | Severity / likelihood | Evidence or reasoning                                                                                                         | Decision effect              | Best permanent fix                                                                                                                                      | Exact language / AC                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| A red **Remove** control in My Access or optimistic success lets a holder accidentally cut off duties, or believe access ended when only a request exists. | High / Medium         | Selected Option 1 rejects immediate self-revoke; W3C requires clear transaction feedback.                                     | **Narrows presentation.**    | Secondary **Ask for an access review**, explicit no-change sentence, persistent `pending_review` status, destructive styling only for reviewer removal. | “Pending status always states Your access has not changed.” D43-AC003–006, AC091–095.     |
| A reviewer can treat task assignment, original grantor identity, Owner/Admin name, or deep-link possession as authority.                                   | Critical / Medium     | OWASP requires object/relationship authorization on every request; Phase 12 says capabilities enforce.                        | **Narrows reviewer action.** | Current PDP proof, exact scope/ceiling/floor, expected heads, and same source command at every action.                                                  | “Routing grants attention only; never authority.” D43-AC041–060, AC061–080.               |
| A separately authorized audit/access-review reader could be mistaken for a grant decision-maker and receive a task or keep/remove control.                 | Critical / Medium     | D42 intentionally separates read projections from grant management; least privilege forbids turning inspection into mutation. | **Narrows resolver and UI.** | Actionable lane/D44 cohort requires current exact-scope `permissions.manage_grants`; read-only users remain in independent read projection.             | “Read authority never counts as decision or routing authority.” D43-AC048–050, AC064–067. |

### 6. Tenant safety

**Material concern exists.**

| What could go wrong / why it matters                                                                                                              | Severity / likelihood | Evidence or reasoning                                                                          | Decision effect                    | Best permanent fix                                                                                                                    | Exact language / AC                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Caller IDs, malformed FKs, caches, task recipients, exports, or support/service paths can mix request, holder, reviewer, or grant across Tenants. | Critical / Medium     | Current Core is multi-tenant; Phase 12 demands branded Tenant context and composite relations. | **Narrows schema and every path.** | `tenant_id NOT NULL`, composite FKs, server-derived context, Tenant-keyed uniqueness/cache/outbox, uniform denial, privileged parity. | “Every edge of the request/grant/task graph is same-Tenant.” D43-AC041–060, AC071–080. |

### 7. Database, RLS, and authorization safety

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                                                 | Severity / likelihood    | Evidence or reasoning                                                                                         | Decision effect                                                 | Best permanent fix                                                                                                                                          | Exact language / AC                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Direct browser insert/update can forge Tenant, subject, capability, reviewer, status, timestamps, or transform an allowed pending row into `resolved_removed`. A permissive SELECT can leak reasons. | Critical / High if naive | PostgreSQL distinguishes `USING`/`WITH CHECK`; owners and `BYPASSRLS` can bypass unless handled.              | **Changes write/read architecture.** Raw mutation is forbidden. | Hardened command/RPC, trusted server derivation, immutable columns/events, FORCE RLS, no raw browser grants, security-invoker projections/pinned functions. | “No caller-controlled authority or terminal state reaches the base relation.” D43-AC041–060.          |
| Removal might commit the request terminal state before the grant, audit, epoch, or outbox, leaving false completion or untracked access.                                                             | Critical / Medium        | Phase 12's advisory-locked grant function and ADR-0183 transactional intent exist to prevent partial effects. | **Narrows transaction.**                                        | One atomic exact-source terminal transaction; request remains pending on any failure.                                                                       | “`resolved_removed` is valid only with the same-transaction grant receipt.” D43-AC028–034, AC061–070. |

### 8. Overengineering

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                                | Severity / likelihood                       | Evidence or reasoning                                                                                                                     | Decision effect                                                            | Best permanent fix                                                                     | Exact language / AC                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Multi-stage approval builders, custom forms, comments, SLAs, reminders, escalation, AI summaries, and tenant-authored statuses solve speculative cases and burden small ministries. | Medium / High if copied from enterprise IGA | Entra/Okta/SailPoint demonstrate broad platforms, but Core's governing ADRs require bounded source contracts and quorum-aware simplicity. | **Narrows.** Adopt separation of concerns, not enterprise product breadth. | One question, two reviewer outcomes, withdrawal, source-ended outcome, D44 route only. | “D43 adds no generic workflow or communication subsystem.” D43-AC001–020, AC116–120. |

### 9. UX/UI and user friction

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                      | Severity / likelihood | Evidence or reasoning                                                                                                                | Decision effect                | Best permanent fix                                                                                                           | Exact language / AC                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Hidden action, IAM jargon, excessive warnings, ambiguous `submitted`, toast-only success, or no status causes abandonment and duplicate requests.                         | High / High           | W3C recommends short forms, instructions, validation, undo, and success feedback; Core uses current-source-first Base Maia patterns. | **Narrows interaction/copy.**  | One labeled secondary action, one field, explicit no-change copy, persistent status/history, semantic retry recovery.        | “Submission is understandable without knowing grant/provenance/task terminology.” D43-AC001–020, AC081–100.  |
| Mobile, keyboard, screen-reader, zoom, forced colors, RTL/CJK, long names/text, or low bandwidth can make submission/decision unusable or destructive action easy to hit. | High / Medium         | Core accessibility contract and WAI form/dialog/status guidance apply.                                                               | **Adds normative safeguards.** | Shared primitives, 44px, 320px/400%, focus/error/status, bidi/i18n, current-session draft recovery, deliberate action order. | “The complete flow works without pointer, color, motion, wide layout, or reliable transport.” D43-AC081–100. |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                          | Severity / likelihood                      | Evidence or reasoning                                                                                    | Decision effect           | Best permanent fix                                                                                                                                          | Exact language / AC                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Request, task, notification, grant, audit, and async status can all appear to own completion, creating circular synchronization and false removal.            | Critical / High without explicit ownership | ADR-0183 explicitly separates source, Tasks Hub, notifications, and executor; Phase 12 owns grant state. | **Changes architecture.** | Request owns intent/outcome; grant owns access; task presents; notification attracts attention; executor transports. One-way projection and reconciliation. | “No projection writes business truth backward.” D43-AC061–080.                                  |
| If terminal outcome lives only beside the current grant row, removal/expiry makes the evidence disappear or pressures UI to retain a fake current-access row. | High / High if row-coupled                 | Request history and current access have different lifecycles; Phase 12 already owns a request aggregate. | **Changes read model.**   | Keep inline pending status while current; retain all allowed status in subject-only **My access requests** under current assignment/retention.              | “Request history never becomes or depends on a current-access source.” D43-AC015, AC047, AC095. |

### 11. Hidden coupling

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                               | Severity / likelihood | Evidence or reasoning                                                                              | Decision effect                                          | Best permanent fix                                                                                               | Exact language / AC                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| D43 could silently depend on Website coordinators, D35 routing, the seed Teams UI, task assignee fields, notifications, original grantor, or Inngest availability. | High / Medium         | Phase 24 repeatedly separates Website work, access governance, task projection, and authorization. | **Narrows.** No convention-based reuse; D44 is explicit. | Separate registered access-review route, central People & access UI, stable source status, replaceable executor. | “D43 imports mechanics only through governing contracts, never domain members/meaning.” D43-AC071–080, AC116–120. |

### 12. Failure modes

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                       | Severity / likelihood | Evidence or reasoning                                                                                              | Decision effect                                         | Best permanent fix                                                                                                                          | Exact language / AC                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Source commit succeeds but response/task/notification fails; task succeeds before source; decision response is lost; audit/outbox fails; or grant mutation partly applies. | Critical / Medium     | Distributed delivery is at-least-once/ambiguous; ADR-0183 requires source commit + outbox and product idempotency. | **Narrows failure semantics.**                          | Commit source first atomically, recover by semantic ID, retry/reconcile projection, never promise delivery, no partial removal.             | “Ambiguous transport returns the one authoritative request/outcome.” D43-AC021–040, AC061–080. |
| No eligible personal reviewer is provable. Guessing all admins leaks context or creates noise, while suppressing the source would strand the request.                      | High / Medium         | D35/ADR-0183 distinguish proved-zero from guessed fallback; D44 is unresolved.                                     | **Narrows personal projection, not source activation.** | Always-available permission-filtered Access requests source lane; D44 personal route; no personal task/delivery claim until complete proof. | “Proved-zero personal routing never guesses; the source lane remains.” D43-AC069–075, AC120.   |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists.**

| What could go wrong / why it matters                                                                                                        | Severity / likelihood                   | Evidence or reasoning                                                                              | Decision effect          | Best permanent fix                                                                                                          | Exact language / AC                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Withdrawal, keep, remove, expiry, and independent revocation can race; late/out-of-order workers may reopen or overwrite a terminal result. | Critical / High enough to design around | Phase 12 expected heads/advisory lock/epoch and ADR-0183 semantic receipts are governing patterns. | **Narrows lifecycle.**   | Single `pending_review` state, terminal CAS, exact source/grant heads, immutable events, ordered reconciliation, no reopen. | “Exactly one terminal successor wins and all later commands return/reject it.” D43-AC021–040. |
| Transport idempotency alone expires or differs across browser, API, outbox, and worker, creating duplicate requests/tasks/removals.         | Critical / Medium                       | Product effects outlive transport keys; ADR-0183 makes DB semantic identity authoritative.         | **Changes idempotency.** | Partial unique pending key, semantic request/decision receipts, unique task occurrence, dispatch ledger secondary.          | “Idempotency is tied to the durable business effect.” D43-AC013–017, AC071–080.               |

### 14. Data integrity risks

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                    | Severity / likelihood | Evidence or reasoning                                                                                                              | Decision effect            | Best permanent fix                                                                                                           | Exact language / AC                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Duplicate pending rows, mutable linkage, cascading assignment deletion, stale task status, mismatched terminal receipt, or copied labels can corrupt history/reporting. | Critical / Medium     | Phase 12 requires same-Tenant composite keys, semantic heads, audit history, restricted deletion; ADR-0183 permits reconciliation. | **Narrows schema/repair.** | Unique pending head, immutable events/relationships, receipt FK, restrictive deletes, derived task, mismatch reconciliation. | “Invalid state combinations are prevented by constraints and one mutation boundary.” D43-AC041–080. |

### 15. Security and privacy risks

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                                          | Severity / likelihood | Evidence or reasoning                                                                                                         | Decision effect                    | Best permanent fix                                                                                                                        | Exact language / AC                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Holder/keep-decision prose may reveal missionary location, care, donor, HR, security, or role-change facts through tasks, notifications, logs, exports, backups, AI, support, or screenshots. | Critical / Medium     | D42 limits provenance; data minimization and purpose separation are established; user text cannot be guaranteed nonsensitive. | **Narrows storage/egress.**        | Plain warning, field classification, source-only protected loading, separate purpose/floor, retention/anonymization, no secondary copies. | “Treat every request/keep explanation as protected governance text regardless of user wording; removal collects no duplicate prose.” D43-AC081–090, AC101–108. |
| Request existence itself could reveal that a person has protected access.                                                                                                                     | Critical / Medium     | OWASP uniform authorization and D42 audience projections apply.                                                               | **Narrows enumeration and error.** | Holder exact-self and reviewer exact-scope projections; uniform wrong/missing response; no task before recipient authorization.           | “Unauthorized request existence is indistinguishable from absence.” D43-AC041–060.                                                                             |

### 16. Scalability and performance risks

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                           | Severity / likelihood | Evidence or reasoning                                                          | Decision effect             | Best permanent fix                                                                                                                        | Exact language / AC                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Synchronous per-reviewer fanout, notifications, per-row PDP, unbounded history/reasons, or task copies lock the request transaction and degrade large Tenants. | High / Medium         | Phase 12 uses set-based resolution/epoch and ADR-0183 post-commit projections. | **Narrows implementation.** | Bounded text/history, indexed stable pagination, set-based reviewer source query, one outbox intent, async projections, no copied bodies. | “Authoritative submit/decision cost is independent of reviewer count.” D43-AC061–080, AC096–100. |

### 17. Operational burden

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                  | Severity / likelihood | Evidence or reasoning                                                                     | Decision effect               | Best permanent fix                                                                                              | Exact language / AC                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Requests can age without an owner; staff may need DB repair, manually dedupe tasks, or reconcile conflicting status. Configurable workflows require tribal knowledge. | High / Medium         | D44 routing remains unknown; ADR-0183 requires reconciliation and source discoverability. | **Narrows and adds monitor.** | One source lane/route decision, deterministic repair/reprojection, stale-open monitor, no custom state machine. | “No request correctness depends on manual task cleanup or direct DB repair.” D43-AC061–080, AC101–120. |

### 18. Observability and auditability gaps

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                            | Severity / likelihood | Evidence or reasoning                                                                                    | Decision effect       | Best permanent fix                                                                                                         | Exact language / AC                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Logs may say task delivered while source is pending, omit actual/acting grant decision-maker, fail to distinguish kept/removed/source-ended, or leak free text. | High / Medium         | Phase 12 requires tamper-evident audit; ADR-0183 distinguishes technical delivery from business history. | **Narrows evidence.** | Typed append-only source events/receipts, correlation IDs, identifier-only technical logs, parity/mismatch/stale monitors. | “Business audit proves source outcome; telemetry proves delivery only.” D43-AC061–080, AC101–108. |

### 19. Dependency and integration risks

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                              | Severity / likelihood | Evidence or reasoning                                                                   | Decision effect              | Best permanent fix                                                                                                                                 | Exact language / AC                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Inngest/provider outage, schema change, rate limit, webhook duplication, Tasks Hub delay, or notification failure can strand or duplicate requests if any integration owns state. | High / Medium         | ADR-0183 explicitly makes executor optional and source/task product identities durable. | **Narrows dependency role.** | Transactional identifier-only outbox, versioned event, product uniqueness/claims, retry/DLQ/reconcile, source fallback, provider replacement test. | “D43 remains correct and operable with every projection integration disabled.” D43-AC071–080, AC109–115. |

### 20. Migration, rollout, and upgrade risks

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                                        | Severity / likelihood | Evidence or reasoning                                                                             | Decision effect               | Best permanent fix                                                                                                                                                  | Exact language / AC                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Old clients may write/read broad rows; a mixed deployment may project tasks before source kinds/RLS exist; rollback after requests/removals could lose status or attempt to restore access. | Critical / Medium     | Current runtime lacks D43; rollback of a committed security mutation cannot safely infer regrant. | **Narrows rollout/rollback.** | Schema/readers/deny gates first, writer canary, projection later, versioned DTO/events, kill switches per surface, roll forward committed data, never auto-regrant. | “Rollback hides/stops new entry points but preserves immutable requests and grant outcomes.” D43-AC109–120. |

### 21. Testability, traceability, and proof

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                   | Severity / likelihood            | Evidence or reasoning                                                                   | Decision effect      | Best permanent fix                                                                                                            | Exact language / AC                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Happy-path UI tests can pass while cross-Tenant, stale-head, duplicate, service-role, task-backwrite, partial commit, accessibility, or mixed-version failures remain. | Critical / High if not specified | Phase 12 requires poison fixtures/property/architecture tests and public-seam outcomes. | **Adds proof gate.** | 120 falsifiable ACs, positive/negative/RLS/concurrency/failure/migration/a11y/production-shaped tests, artifact traceability. | “No D43 activation on screenshots or unit mocks alone.” D43-AC101–120. |

### 22. Other development hazards

**Material concern exists.**

| What could go wrong / why it matters                                                                                                                                                                                     | Severity / likelihood   | Evidence or reasoning                                                                | Decision effect                 | Best permanent fix                                                                                                                               | Exact language / AC                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Request counts/reasons/outcomes could become staff-risk or ministry-performance scoring; support could create requests on behalf; retention could become indefinite; a holder could spam reviews to harass a small team. | High / Medium aggregate | D42 forbids provenance scoring; Phase 12 purpose/retention/support boundaries apply. | **Narrows use and operations.** | Purpose prohibition, exact-self only, bounded active uniqueness/rate budget, retention policy, no AI/analytics dimensions, audit misuse monitor. | “D43 evidence is for access correction/audit only and cannot score people or organizations.” D43-AC081–108. |

## Final adversarial conclusion

The strongest alternative is immediate self-revoke: it eliminates reviewer
latency and routing. It is still inferior for this source because it turns
mere possession into mutation authority, cannot safely communicate surviving
sources before the change, can disrupt a small ministry's only qualified
operator, and complicates recovery. The strongest no-build alternative—tell
the person to contact an administrator—avoids implementation but creates
off-platform ambiguity, weak audit, and stale access.

The selected governed request survives the adversarial pass only as a narrow
Phase 12 extension with a closed state machine, an atomic existing grant-end
command, and an ADR-0183 projection. A new workflow engine, task-owned queue,
or async human wait would make it **Reject and replace**. With the exact
amendments above, the disposition remains **Accept with required amendments**.

## Acceptance criteria

### Request boundary and holder experience

- **D43-AC001:** Exactly one registered `request_kind =
holder_direct_grant_review` with separate `request_contract_version = 1`
  and requested effect
  `review_for_removal`, implements D43 through Phase 12's
  `permission_change_request` domain.
- **D43-AC002:** Initial Phase 24 activation accepts only the exact current
  holder of a D40 continuity-created direct D38 assignment-capability source;
  ordinary group access, another direct source, another capability, or another
  person is ineligible.
- **D43-AC003:** My Access displays the exact secondary CTA **Ask for an access
  review** beneath the D42 holder-safe disclosure and current source; it never
  says **Request access** or implies new access.
- **D43-AC004:** Activating the CTA expands one inline Base Maia form in the
  same source context; no modal, nested sheet, wizard, separate route, toggle,
  immediate revoke, or optimistic access mutation occurs.
- **D43-AC005:** The inline form shows the current safe capability label/end
  condition and exactly states **Someone authorized to manage access will
  decide whether to keep or remove this direct access. Sending this request
  will not change your access.**
- **D43-AC006:** The only requester-entered field is visibly labeled **Why
  should this access be reviewed?** with the exact sensitive-detail warning
  and a 500-code-point counter.
- **D43-AC007:** The server accepts 1–500 Unicode code points after trimming
  outer whitespace, preserves legitimate international text/line breaks,
  rejects NUL/unsafe controls, and never interprets markup.
- **D43-AC008:** Blank/whitespace-only, over-limit, malformed, or invalid text
  writes no request/event/outbox and returns an accessible field error without
  losing the safe current-session value.
- **D43-AC009:** D43 offers no duration/start/end edit, new-access request,
  alternate requested effect, attachment, mention, rich text, custom field,
  questionnaire, comment, or URL preview.
- **D43-AC010:** Opening, closing, canceling, typing, validation, navigation, or
  losing focus writes no request, grant, audit decision, task, notification,
  outbox intent, or epoch.
- **D43-AC011:** Submit uses Core's standard authenticated same-origin mutation/
  request-forgery boundary and one opaque command idempotency key; D43 creates
  no new single-use form-intent/token subsystem.
- **D43-AC012:** Caller input can include only that key, the bounded
  explanation, and an untrusted target-source locator/expected head; the server
  re-resolves the source and derives Tenant/requester/subject/assignment/actor/
  grant/capability/provenance/status/route/reviewer/time/audit fields, and any
  retarget attempt writes nothing.
- **D43-AC013:** A valid submission atomically writes one
  `pending_review` request head, immutable submission event, semantic receipt,
  and identifier-only projection intent while leaving access unchanged.
- **D43-AC014:** Submission advances no authorization epoch and creates no
  grant, revoke, expiry, suspension, membership, D37 application, Website
  effect, or reviewer decision.
- **D43-AC015:** Success persists **Review requested** plus **Your access has
  not changed** inline while the source remains current and in the subject-only
  **My access requests** Phase 12 aggregate; a toast may supplement but never
  replace durable status.
- **D43-AC016:** Success does not say a named reviewer was notified/assigned,
  promise a response time, or claim a task/email/push was delivered.
- **D43-AC017:** A database partial uniqueness constraint permits at most one
  `pending_review` request for the exact Tenant, subject assignment, direct
  source, and kind.
- **D43-AC018:** Double click, two tabs, lost response, client/API retry, and
  concurrent submission return the same pending request and semantic receipt,
  not a second request or task.
- **D43-AC019:** A later concern after a terminal outcome creates a fresh linked
  successor generation with a fresh immutable explanation only if the exact
  direct source remains current; no terminal predecessor reopens.
- **D43-AC020:** Unknown request kind/version/effect/state, stale expected head,
  changed/ended grant, wrong Tenant/assignment, or incomplete authorization
  fails closed, writes nothing, and cannot fall back to a generic request.

### Lifecycle, grant effects, concurrency, and idempotency

- **D43-AC021:** The only states are `pending_review`, `withdrawn`,
  `resolved_kept`, `resolved_removed`, and `no_longer_applicable`; only
  `pending_review` is nonterminal.
- **D43-AC022:** State transitions are append-only events with expected
  predecessor head, typed cause, trusted actual/acting actor/assignment,
  server time, and semantic receipt; prose never determines state.
- **D43-AC023:** The exact current requester may withdraw only their own
  `pending_review` request through **Withdraw request** and a current
  self/history-purpose plus expected-head proof.
- **D43-AC024:** Withdrawal appends `withdrawn`, changes no grant/access/expiry/
  epoch, hard-deletes nothing, and projects **No longer required** to any
  derived task.
- **D43-AC025:** **Keep direct access** requires current exact
  `permissions.manage_grants` decision authority,
  current request/grant heads, Phase 12 controls, and a 1–500-code-point
  holder-safe **Why this direct access is being kept** explanation; it appends
  `resolved_kept` without changing/renewing/
  extending the grant or epoch.
- **D43-AC026:** **Remove direct access** invokes the existing Phase 12 exact-
  source grant-end command and accepts no duplicate D43 note/message; current
  consequence plus the authoritative terminal receipt generates the holder-
  safe outcome. Neither D43 UI nor Tasks Hub writes grant state directly.
- **D43-AC027:** One removal transaction atomically re-proves/locks expected
  request and grant heads, reviewer authority/floor/controls, and the exact
  direct source.
- **D43-AC028:** The same removal transaction appends the exact grant terminal
  event, `resolved_removed` request event, immutable audit/receipt, one Tenant
  authorization-epoch advance, and identifier-only projection intent.
- **D43-AC029:** If any removal write, invariant, audit, receipt, epoch, or
  outbox intent fails, the grant remains current and request remains
  `pending_review`; no false terminal status is returned.
- **D43-AC030:** Exact replay of a committed remove or keep command returns the
  same semantic decision/grant receipt and never creates a second grant event,
  request terminal event, epoch advance, or task outcome.
- **D43-AC031:** Withdrawal, keep, remove, and source-ended commands use one
  first-terminal compare-and-swap; exactly one wins and all later commands
  return/reject the committed terminal result.
- **D43-AC032:** A direct source expiring or ending independently first appends
  `no_longer_applicable` with the causal source receipt; it is never labeled
  reviewer removal and causes no extra D43 epoch.
- **D43-AC033:** A changed grant head blocks stale keep/remove without partial
  effect and forces the reviewer to reload current source and consequence
  before another deliberate command.
- **D43-AC034:** A changed source identity, subject assignment, capability, or
  replacement relation makes the request `no_longer_applicable`; the request
  cannot transfer or mutate the successor source.
- **D43-AC035:** An ended/recreated Active Tenant Assignment cannot inherit,
  view as current self, withdraw, decide, or reactivate the predecessor
  request.
- **D43-AC036:** Removing the bound direct source does not remove or rewrite any
  group membership, group capability, other direct/named grant, assignment,
  task, Website setting, or committed D37 effect.
- **D43-AC037:** After removal the server recomputes current EffectiveAccess;
  the holder sees **You still have this access another way** or **You no longer
  have this access** without receiving a forbidden D42 field.
- **D43-AC038:** Only loss of the final current capability source triggers
  Phase 12's existing final-access-loss consequences; `resolved_removed` alone
  does not imply final loss.
- **D43-AC039:** Out-of-order/late response or worker event cannot overwrite a
  newer request head, grant head, terminal outcome, holder status, or task
  closure.
- **D43-AC040:** UTC instants and monotonic heads/epochs, not client clocks,
  localized strings, `now()` uniqueness, or arrival order, determine state and
  temporal precedence.

### Tenant, database, RLS, and authorization safety

- **D43-AC041:** Request, event, decision, receipt, outbox, and source-work
  relations carry `tenant_id NOT NULL` and cannot infer a default Tenant.
- **D43-AC042:** Same-Tenant composite foreign keys bind requester/subject
  assignment, direct grant source, capability, request predecessor/head,
  decision, receipt, and source-work occurrence.
- **D43-AC043:** The holder request kind has a database/server invariant that
  requester assignment equals subject assignment; a bare Party/person/email/
  role/profile identifier is insufficient.
- **D43-AC044:** Request identity/binding/kind/generation/created-at and every
  event actor/status/head are immutable or append-only and cannot be changed by
  ordinary UPDATE.
- **D43-AC045:** Raw request/event/decision/grant/outbox relations grant no
  browser INSERT/UPDATE/DELETE and no unprojected reason/message SELECT.
- **D43-AC046:** Submission/withdraw/keep/remove/source-ended writes cross one
  hardened Phase 12 server command/RPC boundary and derive trusted authority,
  Tenant, actors, timestamps, statuses, and audit attribution.
- **D43-AC047:** Holder reads use an exact-self, current-assignment,
  purpose-bound server projection containing only safe current source/pending
  status plus **My access requests** history, their own explanation, and
  holder-safe outcome/keep explanation under retention; terminal history never
  reappears as a current-access source.
- **D43-AC048:** Access requests actionable lane and reviewer detail require
  current exact `permissions.manage_grants`, registered grant-governance
  purpose, live scope/ceiling, Phase 3/10/12 floor, and current request/source
  relation for every list, count, detail, action, retry, and page.
- **D43-AC049:** Security/audit or separately authorized review-reader reads
  require their independent current D42/Phase 12 capability, read-only purpose,
  floor/clearance, and read-audit; they cannot keep/remove, count in D44's
  resolver, or receive an actionable personal task without independently
  holding exact-scope `permissions.manage_grants`.
- **D43-AC050:** Owner/Admin/staff role names, original grantor, current/historic
  group membership, D38 possession, task/notification, route/deep link, support
  status, service role, or cached data grants no request read/decision action.
- **D43-AC051:** Multi-hat users act through one exact current Active Tenant
  Assignment and surface purpose; another Tenant/hat capability cannot be
  unioned into self or review authority.
- **D43-AC052:** Every base relation/projection enables and forces RLS where
  applicable, or provably preserves the same forced-RLS boundary through a
  security-invoker view/hardened RPC.
- **D43-AC053:** SELECT/UPDATE policy `USING` checks the existing exact Tenant/
  assignment/source/request relation and `WITH CHECK` prevents a resulting row
  from changing Tenant, subject, source, kind, actor, route, or terminal state.
- **D43-AC054:** Any `SECURITY DEFINER` function pins `search_path`, uses fixed
  qualified relations, revokes public execute, and ignores/rejects caller-
  supplied Tenant/actor/subject/capability/status/route/audit fields.
- **D43-AC055:** Table owner, service role, `BYPASSRLS`, support/operator,
  repair, import, export, Realtime, worker, AI, and Inngest paths pass the same
  Tenant/purpose/field/action parity tests.
- **D43-AC056:** Wrong Tenant/assignment/source/request, ineligible reviewer,
  absent row, floor denial, and stale authorization return the same external
  not-found/denied contract without request/access existence oracle.
- **D43-AC057:** Reviewer action re-proves current request and grant heads plus
  current exact-scope `permissions.manage_grants`, grant-governance purpose,
  live scope/ceiling/floor, and Phase 12 self/SoD/quorum/risk controls at
  commit, regardless of a previously loaded page/task.
- **D43-AC058:** Grant removal cannot violate Phase 12's last-authority,
  restricted-worker, scope, separation-of-duties, or quorum invariants; D43
  creates no bypass because removal appears risk-reducing.
- **D43-AC059:** Assignment/grant/request/event/decision/receipt relationships
  use restrictive archival/delete behavior; withdrawal, retention expiry, UI
  deletion, Tenant admin, or task deletion cannot cascade away proof.
- **D43-AC060:** Database introspection/property tests prove the partial unique
  pending key, same-Tenant graph, requester=subject rule, terminal
  conservation, receipt requirement, no browser base grants, correct policies,
  and privileged-path parity.

### Access requests lane, Tasks Hub, Inngest, and failure recovery

- **D43-AC061:** Every `pending_review` request appears in an always-available,
  permission-filtered **Access requests** source lane under the code-owned
  **Review current access** kind label/filter, independent of D44,
  personal tasks, notification delivery, or Inngest; actionable lane access
  requires current exact-scope `permissions.manage_grants`.
- **D43-AC062:** The source lane is a Phase 12 read model over current request
  truth; it is not a Tasks Hub queue, task assignment, role, claim, or second
  lifecycle.
- **D43-AC063:** Source-lane list/count/detail uses current exact reviewer
  authorization, stable cursor/order, bounded pages, safe fields, and no
  per-row authorization N+1.
- **D43-AC064:** D44 may decide only which currently eligible exact-scope
  `permissions.manage_grants` holders receive personal Tasks Hub projection;
  it cannot include read-only audit/review readers, hide the source lane,
  change request state, select decision authority, or invent a fallback. Every
  option excludes the exact requester from their own personal recipient set;
  Phase 12 independently decides whether they may act from the source lane.
- **D43-AC065:** Proved-zero, partial, stale, contradictory, over-ceiling,
  timed-out, corrupt, or indeterminate personal routing projects nobody and
  makes no notification/delivery claim; authorized source-lane work remains.
- **D43-AC066:** One source request occurrence has at most one stable shared
  source-backed task identity and at most one active recipient assignment per
  admitted role/surface, regardless of retries or overlapping eligibility.
- **D43-AC067:** Task title/list facts are code-owned and purpose-minimized;
  holder/capability labels appear only when the current recipient projection
  permits them, and only an independently current exact-scope
  `permissions.manage_grants` holder is action-eligible.
- **D43-AC068:** Request explanation, keep explanation, D40 reason/basis, group
  provenance, raw identifiers, and protected bodies are absent from task rows,
  list caches, comments, search, notifications, and analytics and load only
  from the source after current authorization.
- **D43-AC069:** Generic Complete/Done/Dismiss/Delete/Reopen/Suppress/
  drag-to-Done/bulk mutation, task reassignment, keyboard/API/import, AI,
  support, and worker commands reject the D43 source-backed task server-side.
- **D43-AC070:** `resolved_kept`/`resolved_removed` source receipts project
  **Completed in People & access**; `withdrawn`/`no_longer_applicable` project
  **No longer required**; task state never chooses the source outcome.
- **D43-AC071:** Loss of task/source-detail authorization removes protected
  presentation and never fabricates Complete, Removed, Kept, Withdrawn, or No
  longer required.
- **D43-AC072:** Submission and every terminal source transaction writes one
  durable identifier-only projection/outbox intent in the same authoritative
  transaction; no task is published before source commit.
- **D43-AC073:** The async event envelope contains only registered source kind/
  version, request identifier, Tenant routing reference, causal outbox ID, and
  schema version—not explanations, messages, capability/provenance bodies,
  reviewers, or authority claims.
- **D43-AC074:** An Inngest function, if selected, validates event schema and
  re-resolves current request state, D44 routing, recipient eligibility, and
  source projection at fire time.
- **D43-AC075:** Inngest never waits/sleeps for a person, parses prose, chooses
  a reviewer from payload, owns request/task idempotency, or mutates request/
  grant because a task changed.
- **D43-AC076:** Source success with task/Inngest/notification failure still
  returns truthful source status; durable retry/DLQ/reconciliation can repair
  the projection without replaying the source mutation.
- **D43-AC077:** Ambiguous source response is recovered by semantic request/
  decision lookup; ambiguous worker response is recovered by product task
  identity/claim, never by creating another row.
- **D43-AC078:** Reconciliation compares source applicability, outbox dispatch,
  shared task, recipient projections, and terminal history; it repairs
  projections only and reports mismatches durably.
- **D43-AC079:** D43 remains correct and source-lane operable with Tasks Hub,
  Inngest, Realtime, email, push, and every optional projection disabled or
  replaced.
- **D43-AC080:** D43 creates no bell item, email, SMS, push, digest, reminder,
  due date, SLA, escalation, or auto-revoke; a later channel decision must
  remain a recipient attention projection under ADR-0027/ADR-0183.

### Privacy, UX/accessibility, performance, and operations

- **D43-AC081:** Request explanation and holder-safe keep explanation are
  classified access-governance text even when they appear harmless; request
  existence is itself purpose-limited.
- **D43-AC082:** The request explanation and conditional keep explanation use
  the same trimmed 1–500-code-point,
  international plain-text, control-character, escaped-rendering, and no-rich-
  content contract; removal collects no second D43 text.
- **D43-AC083:** Inline helper/reviewer copy warns against confidential
  ministry, donor, member-care, personnel, location, or security details and
  does not solicit a protected source narrative.
- **D43-AC084:** Tasks Hub, notifications, general logs/traces/errors, full-text
  search, suggestions, analytics/BI, documents, ordinary exports, Realtime,
  webhooks, and event payloads contain no explanation or decision text.
- **D43-AC085:** AI prompts, embeddings, summaries, classifiers, routing,
  moderation-as-decision, and agent tools receive no request/decision text and
  cannot approve, retain, remove, route, or complete D43.
- **D43-AC086:** Request existence, text, age, outcome, withdrawal, and reviewer
  activity are never used for staff/Tenant engagement, trust, risk,
  performance, ministry health, or surveillance scoring.
- **D43-AC087:** Phase 12 field/purpose/retention policy governs live text,
  terminal history, legal hold, backups, anonymization, deletion requests, and
  authorized audit; UI/task settings cannot extend retention.
- **D43-AC088:** Departed/deleted actors render lawful minimized attribution
  without rewriting request/grant authority, terminal outcome, receipt, or
  restoring deleted personal data.
- **D43-AC089:** Holder ordinary export, task export, notification export, and
  Website export receive no D43 text; any governance/audit export requires a
  separate current purpose/capability/floor and durable export/read-audit.
- **D43-AC090:** Protected source/grant-manager/audit-reader reads are durably read-audited with
  identifiers, viewer/purpose/field class/count/outcome—not explanation,
  keep explanation, or protected source text.
- **D43-AC091:** Resting state uses the exact CTA **Ask for an access review**;
  pending state uses **Review requested** and **Your access has not changed**;
  no ambiguous **Request access** label appears.
- **D43-AC092:** The one-field form expands inline below the D42 disclosure,
  preserves current source context, and Cancel restores focus to the CTA
  without writing or silently persisting the explanation.
- **D43-AC093:** Visible labels/instructions/counter/errors and programmatic
  required/invalid/described relationships exist; submit errors focus/announce
  a summary and field without losing entered safe-session text.
- **D43-AC094:** Pending/success/error/ambiguous-recovery states are
  programmatically announced without stealing focus unnecessarily; persistent
  status remains after reload and is not toast-only.
- **D43-AC095:** Terminal holder statuses/copy in **My access requests** are exactly **Withdrawn**,
  **Direct access kept**, **Direct access removed**, or **Direct access ended
  before review**, plus the safe current-access consequence and holder message
  where applicable.
- **D43-AC096:** Every important control is at least 44 by 44 CSS pixels,
  keyboard operable, visibly focused, and complete at 320 CSS pixels/400%
  zoom without horizontal permission-table dependency.
- **D43-AC097:** Forced colors and reduced motion preserve hierarchy/focus/
  status/destructive distinction; no meaning depends only on color, icon,
  hover, animation, truncation, or button placement.
- **D43-AC098:** Unicode/RTL/CJK/long names and text use bidi isolation and
  safe wrapping; code-point count, localized dates/time zones/plurals, and
  action meaning remain correct.
- **D43-AC099:** Low-bandwidth/offline/expired-session behavior creates no
  duplicate, stores no reason in localStorage/service worker, obtains a fresh
  intent, and recovers ambiguous success from the source.
- **D43-AC100:** Submit/decision transactions have bounded work independent of
  reviewer count; source-lane queries are indexed/set-based/paginated; text and
  histories are bounded; no synchronous recipient fanout or per-row PDP query
  occurs.

### Migration, rollout, proof, and traceability

- **D43-AC101:** Schema constraints, enums/kind registry, RLS/grant denial,
  server projections, and read compatibility land before any D43 writer, CTA,
  source lane, task projector, or worker.
- **D43-AC102:** Migration creates no inferred/backfilled request from existing
  grants, holders, provenance, tasks, emails, audit events, or administrator
  assumptions; only a deliberate post-activation holder submit creates D43.
- **D43-AC103:** Mixed old/new code treats unknown kind/version/state/field as
  no mutation/no protected presentation; old clients cannot raw-write or turn
  `pending_review` into a generic approved/completed row.
- **D43-AC104:** Independent kill switches can disable holder entry, reviewer
  decisions, personal task projection, and optional worker delivery without
  changing committed grant/request truth or source-lane audit access.
- **D43-AC105:** Rollback stops new writes/projections and hides unsupported
  controls while preserving immutable requests/events/decisions/grant
  terminals/audit/outbox; it never auto-regrants access removed before
  rollback.
- **D43-AC106:** Roll-forward readers/reconciliation can finish every committed
  pending/outbox member after deployment interruption; no direct database
  status repair is the normal recovery path.
- **D43-AC107:** Reconciliation reports per-Tenant request-state, grant-receipt,
  epoch, outbox, source-lane, shared-task, recipient, and terminal mismatches
  without exposing protected text.
- **D43-AC108:** Rollout sequence is schema/deny/readers → shadow source query →
  single-Tenant holder writer canary → source-lane reviewer canary → grant
  decision canary → reconciliation → D44 personal tasks; each stage has a
  kill/roll-forward plan.
- **D43-AC109:** Positive public-seam tests prove exact holder submit,
  idempotent recovery, withdraw, keep, remove with/without surviving sources,
  source-ended outcome, source-lane visibility, and source-derived task closure.
- **D43-AC110:** Negative authorization tests cover wrong Tenant/hat/person/
  assignment/source/head, group-only access, role/task/original-grantor/deep-
  link/support/service claims, floor denial, caller authority fields, and
  uniform existence responses.
- **D43-AC111:** Concurrency/property tests interleave duplicate submit,
  withdraw/keep/remove/expiry/independent revoke, source replacement, response
  loss, out-of-order worker, and retry; exactly one pending head/terminal/grant
  effect/epoch/task identity survives.
- **D43-AC112:** Database poison tests inspect constraints/FKs/indexes/grants/
  policies and cover direct SQL, view/RPC, owner, service, `BYPASSRLS`, support,
  repair, import/export, worker, Realtime, and cross-Tenant mutation attempts.
- **D43-AC113:** Tasks/Inngest tests prove source-lane independence, identifier-
  only envelopes, no protected copies, fire-time reproof, duplicate delivery,
  provider outage/DLQ/reconciliation, generic-task rejection, and executor
  replacement.
- **D43-AC114:** Failure tests inject error before/after every request/grant/
  audit/epoch/outbox write and prove atomic source truth, accurate response-
  loss recovery, no false terminal/task state, and no access mutation on keep/
  withdraw/submit.
- **D43-AC115:** Privacy/retention tests cover sensitive text, request-existence
  oracle, group/provenance leakage, logs/search/analytics/AI/tasks/
  notifications/exports/backups, actor departure/anonymization/legal hold, and
  read-audit text exclusion.
- **D43-AC116:** Accessibility/manual tests cover exact copy, inline expansion/
  cancel focus, labels/errors/counter/status, keyboard/screen reader, 44px,
  320px/400%, forced colors, reduced motion, RTL/CJK/Unicode, long text, and
  low bandwidth/ambiguous response.
- **D43-AC117:** Production-shaped performance tests prove indexed stable
  pagination, bounded reason/history/transaction/query counts, no reviewer-
  count synchronous fanout, no per-row PDP N+1, and acceptable source/outbox/
  read-audit contention under largest supported Tenant/load envelopes.
- **D43-AC118:** D43 terms, states, ownership, commands, exact copy, fields,
  limits, capability/purpose, task completion labels, and AC IDs trace
  consistently from Grill through glossary, ADR-0183/0184, Phase 12, OpenSpec,
  design, implementation tasks/tickets, tests, migration, and release evidence.
- **D43-AC119:** Every named monitor below is emitted/tested with its documented
  signal, threshold, owner, and mandatory response; zero events is not claimed
  without instrumentation/reconciliation coverage.
- **D43-AC120:** Source-request/source-lane activation requires complete D43
  positive/negative/security/privacy/concurrency/migration/a11y/performance
  evidence; personal Tasks Hub activation separately requires a resolved D44
  route. D44 cannot change D43 state, source/grant ownership, authorization,
  atomicity, text/egress, or source-lane invariants.

## Named monitors

| Signal                                                       |                                                                                                                            Threshold | Owner                                         | Required response                                                                                                                        |
| ------------------------------------------------------------ | -----------------------------------------------------------------------------------------------------------------------------------: | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `access_requests_d43_cross_tenant_edge_total`                |                                                                                                                                  Any | Security + Database                           | P0 containment; disable D43 writes/reads, inspect request/grant/task exposure, repair composite boundary, notify incident owner.         |
| `access_requests_d43_wrong_subject_submit_total`             |                                                                 Any accepted request where requester assignment differs from subject | IAM + Security                                | Disable holder submit, quarantine request, inspect server-context/RPC derivation and all affected Tenants.                               |
| `access_requests_d43_submit_access_mutation_total`           |                                                                             Any grant/EffectiveAccess/expiry change caused by submit | IAM                                           | Roll back entry point, preserve evidence, restore grant from authoritative precondition only through governed repair, fix command split. |
| `access_requests_d43_nonremoval_epoch_advance_total`         |                                                                                     Any submit/withdraw/keep/task-only epoch advance | IAM + Database                                | Block rollout, inspect transaction boundary, correct excess epoch without rewriting audit.                                               |
| `access_requests_d43_duplicate_pending_total`                |                                                                      Any semantic source with more than one `pending_review` request | IAM + Database                                | Stop writes, preserve earliest/committed heads, run deterministic reconciliation, repair unique constraint/idempotency.                  |
| `access_requests_d43_duplicate_terminal_total`               |                                                                                    Any request with more than one terminal successor | IAM + Database                                | P0 stop decisions, inspect CAS/receipts, determine grant truth, append governed correction rather than rewrite history.                  |
| `access_requests_d43_removed_without_grant_receipt_total`    |                                                                 Any `resolved_removed` lacking matching exact grant terminal receipt | Security + IAM                                | P0 disable decisions, treat status as corrupt, inspect actual access, repair by append-only governed reconciliation.                     |
| `access_requests_d43_partial_remove_transaction_total`       |                                                                           Any grant/request/audit/epoch/outbox conservation mismatch | Security + Database                           | Stop removal path, fence affected requests, use source receipts to roll forward, perform incident review.                                |
| `access_requests_d43_remove_epoch_count_mismatch_total`      |                                                                             Any removal advancing zero or more than one Tenant epoch | IAM + Database                                | Disable removal, inspect current authorization/cache exposure and transaction trigger/function.                                          |
| `access_requests_d43_keep_grant_mutation_total`              |                                                                                 Any grant/duration/epoch change from `resolved_kept` | IAM                                           | Stop keep path, restore only through authoritative successor command, correct decision isolation.                                        |
| `access_requests_d43_stale_head_commit_total`                |                                                                Any terminal decision committed against noncurrent request/grant head | Security + IAM                                | P0 contain, inspect resulting access, repair expected-head/lock enforcement and affected decisions.                                      |
| `access_requests_d43_other_source_mutation_total`            |                                                                          Any D43 decision changing an unbound grant/group/membership | Security + IAM                                | P0 contain, inspect access graph, restore with governed source commands, repair exact-source binding.                                    |
| `access_requests_d43_rls_contract_drift_total`               |                                                                     Any missing FORCE/policy/composite rule or unexpected base grant | Database Security                             | Block deploy, revoke grants, restore RLS/functions, inspect read/write exposure.                                                         |
| `access_requests_d43_privileged_path_parity_failure_total`   |                                                                               Any owner/service/support/worker/export/AI path bypass | Security                                      | Disable failing path, inspect exposure/effects, add poison fixture before re-enable.                                                     |
| `access_requests_d43_existence_oracle_failure_total`         |                                                                Any byte/status/timing-distinguishable unauthorized request existence | Security + Privacy                            | Disable affected enumeration/detail, repair uniform response/padding, assess sensitive-access disclosure.                                |
| `access_requests_d43_d42_provenance_leak_total`              |                                                                                       Any holder/task field beyond D42/D43 allowlist | Privacy + Security                            | Contain response/cache, purge secondary copies, inspect all affected reads, repair server projection.                                    |
| `access_requests_d43_request_text_secondary_egress_total`    |                                 Any explanation/message in task, notification, log, search, analytics, AI, event, or ordinary export | Privacy + Security                            | Disable consumer, remove derived/cached data where lawful, inspect exposure, repair closed egress.                                       |
| `access_requests_d43_read_audit_text_leak_total`             |                                                                                       Any explanation/message copied into read-audit | Privacy + Compliance                          | Stop sink, scrub/secure records under incident process, replace with identifier-only audit.                                              |
| `access_requests_d43_unaudited_protected_read_total`         |                                                                Any protected reviewer/audit read without required durable read-audit | Compliance + Security                         | Stop protected detail/export, investigate reads, restore fail-safe audit-before/with-serve path.                                         |
| `access_requests_d43_source_lane_authorization_bypass_total` |                                                                          Any lane row/count/detail outside current exact scope/floor | Security + IAM                                | Disable lane, purge caches, inspect affected enumerations, repair set-based PDP/RLS.                                                     |
| `access_requests_d43_reader_action_or_route_total`           | Any read-only audit/review authority admitted to keep/remove or D44 personal routing without exact-scope `permissions.manage_grants` | Security + IAM                                | Disable action/personal routing, remove task projections, inspect decisions, repair resolver/capability boundary.                        |
| `access_requests_d43_personal_route_fallback_total`          |                                              Any personal recipient guessed/broadcast from zero/partial/indeterminate D44 resolution | IAM + Product                                 | Stop personal projection, remove assignments, preserve source lane, repair complete resolver.                                            |
| `access_requests_d43_requester_personal_task_total`          |                                                                                     Any requester assigned their own D43 review task | IAM + Tasks Platform                          | Remove the personal projection, preserve source lane, repair requester exclusion; do not reinterpret Phase 12 lane action authority.     |
| `access_requests_d43_task_backwrite_total`                   |                                                                                       Any task mutation changing request/grant state | Security + Tasks Platform                     | P0 disable generic mutation, inspect source effects, restore source-controlled closure guard.                                            |
| `access_requests_d43_generic_task_mutation_accepted_total`   |                                                                            Any Complete/Done/Dismiss/Delete/Reassign/Reopen accepted | Tasks Platform                                | Block affected endpoint, reconcile task from source, add server denial/contract test.                                                    |
| `access_requests_d43_task_source_mismatch_total`             |                                                                                Any mismatch in two consecutive reconciliation sweeps | Tasks Platform + IAM                          | Reconcile projection, inspect outbox/claims, preserve source truth, escalate if source receipt mismatch.                                 |
| `access_requests_d43_inngest_protected_payload_total`        |                                                                   Any text/capability/provenance/reviewer authority in event payload | Privacy + Platform                            | Stop dispatch/function, delete unsafe queued payload where possible, rotate schema, inspect logs/provider retention.                     |
| `access_requests_d43_inngest_domain_mutation_total`          |                                                                Any request/grant transition attributable only to executor/task state | Security + Platform                           | Disable function, inspect all runs/effects, restore product command boundary and source receipts.                                        |
| `access_requests_d43_ready_outbox_oldest_age`                |                                                                                               Greater than 10 minutes for 15 minutes | Platform SRE + Tasks Platform                 | Inspect dispatcher/provider/claims, activate replay/reconcile, preserve source lane and avoid source replay.                             |
| `access_requests_d43_projection_failure_rate`                |                                                                            Greater than 2% over 15 minutes with at least 100 intents | Platform SRE                                  | Pause personal-task rollout, inspect provider/schema/authorization failures, reconcile after fix.                                        |
| `access_requests_d43_oldest_pending_age`                     |                                                                                               Any request older than 7 calendar days | Tenant Access Governance + Product Operations | Review D44 routing/coverage and source lane, surface operational queue health; never auto-remove or invent reviewer.                     |
| `access_requests_d43_submit_failure_rate`                    |                                                                     Greater than 2% over 15 minutes with at least 100 valid attempts | IAM + SRE                                     | Inspect authenticated mutation/CSRF boundary, constraints, latency, and deploy regression; preserve semantic recovery.                   |
| `access_requests_d43_source_lane_latency`                    |                                            p95 greater than 2× established lane baseline for 15 minutes with at least 1,000 requests | IAM + Database SRE                            | Inspect indexes, set-based authorization, read-audit/query plan; pause expansion rather than weakening checks.                           |
| `access_requests_d43_reason_limit_rejection_rate`            |                                                                       Greater than 5% over 30 days with at least 100 submit attempts | Product Design + IAM                          | Review copy/limit with representative users; do not silently truncate or widen egress.                                                   |
| `access_requests_d43_remove_duplicate_text_total`            |                                                                                Any D43 removal note/message field accepted or stored | IAM + Product Design                          | Stop removal UI/API, remove unused duplicate field through governed migration, preserve grant receipt as source evidence.                |
| `access_requests_d43_holder_history_orphan_total`            |                        Any retained request inside retention absent from exact subject's authorized **My access requests** aggregate | IAM + Product                                 | Repair holder projection/reconciliation; never recreate a fake current-access row.                                                       |
| `access_requests_d43_accessibility_blocker_total`            |                                                                       Any critical keyboard/screen-reader/reflow/focus/status defect | Product Design                                | Block release/rollout until the public seam passes manual and automated proof.                                                           |
| `access_requests_d43_comprehension_support_rate`             |                                           More than 5 related support cases per 100 requests over 30 days with at least 100 requests | Product Design + Support                      | Run qualitative usability review of CTA/no-change/status copy; preserve governed mutation boundary.                                      |
| `access_requests_d43_staff_scoring_use_total`                |                                                                                                                                  Any | Privacy + Product                             | Disable consumer/report/model, delete derived score where lawful, run governance/incident review.                                        |
| `access_requests_d43_hard_deleted_evidence_total`            |                                                                    Any missing request/event/decision/grant receipt inside retention | Compliance + Database                         | Stop deletion path, recover from protected backup if lawful, repair FK/retention policy and audit.                                       |
| `access_requests_d43_direct_db_repair_total`                 |                                                                    Any ordinary operational correction requiring ad hoc row mutation | IAM + Database SRE                            | Stop recurring manual procedure, preserve repair evidence, implement deterministic source command/reconciliation.                        |

No monitor changes authorization or request state automatically. A threshold
opens operational response; it never auto-keeps, auto-removes, guesses a
reviewer, or extends access.

## Ruthless synthesis

### Resolved before recording

1. D43 is one Phase 12 request subtype, not a Website form or workflow engine.
2. The holder CTA is **Ask for an access review**, avoiding collision with a
   request for new access.
3. The form is one inline Base Maia field beneath D42 context, not a nested
   modal/sheet/wizard.
4. Submission is nonmutating and persistently says access did not change.
5. The exact 1–500-code-point explanation and sensitive-detail/egress boundary
   are closed.
6. The lifecycle is exactly `pending_review`, `withdrawn`, `resolved_kept`,
   `resolved_removed`, and `no_longer_applicable`.
7. One pending semantic head, first-terminal CAS, expected heads, immutable
   events, and semantic receipts resolve every retry/race.
8. Removal reuses the existing Phase 12 grant-state command and is atomic with
   request/audit/epoch/outbox; it collects no duplicate D43 prose, while keep
   alone requires a holder-safe explanation; keep/withdraw/submit do not
   advance epoch.
9. Other sources remain independent and holder result copy reflects current
   resolved access.
10. Pending status remains inline while current; the subject-only Phase 12
    **My access requests** aggregate preserves terminal history without
    masquerading as current access.
11. **Access requests** is the authoritative admin source lane; **Review
    current access** is a code-owned kind label/filter, distinct from periodic
    access-review/recertification campaigns.
12. Actionable lane/decision/D44 eligibility requires current exact-scope
    `permissions.manage_grants`; separate read-only audit/review authority
    cannot act or route.
13. ADR-0183 owns the one-way Tasks Hub projection and optional Inngest
    materialization; neither owns state or protected text.
14. D44 is narrowed to personal reviewer task routing only.

### Requirements that must be captured in spec/design

- the exact request kind/version, state/event/command model, subject/source
  binding, text field contracts, trusted attribution, retention, and
  holder/reviewer field projections;
- same-Tenant composite relationships, partial pending uniqueness,
  append-only terminal conservation, receipt/epoch constraints, indexes,
  FORCE RLS, raw grants, hardened function/RPC, and privileged parity;
- exact holder/reviewer copy and terminal presentation, including the clear
  request-vs-periodic-review nomenclature;
- Access requests lane enumeration/detail/cursor authorization and the
  **Review current access** filter;
- ADR-0183 task grain, safe list fields, protected detail loading,
  source-controlled closure, semantic identity, outbox, fire-time reproof,
  reconciliation, and provider replacement; and
- retention/export/read-audit/backup/anonymization plus the closed no-AI/
  no-search/no-scoring/no-secondary-egress matrix.

### Required implementation safeguards and order

1. Extend the Phase 12 code-owned request kind/state/event registry and
   ownership matrix.
2. Land schema, same-Tenant FKs, pending uniqueness, terminal/receipt
   constraints, indexes, restrictive deletes, RLS/grants, and poison fixtures.
3. Land holder/reviewer/audit projections and hardened submit/withdraw/keep/
   remove/source-ended commands; removal calls the existing grant-state
   transaction.
4. Land semantic receipts, identifier-only transactional outbox, dispatch
   ledger, claims, DLQ/reconciliation, and source/task mismatch evidence.
5. Land the permission-filtered Access requests source lane and **Review
   current access** filter before personal routing.
6. Land inline My Access holder UX, persistent status/history, reviewer detail,
   exact copy, accessibility, i18n, low-bandwidth, and response-loss recovery.
7. Prove field/purpose/retention/audit/secondary-egress boundaries and all
   database/privileged/concurrency/failure paths.
8. Canary source submit/lane/decisions with optional task projection disabled.
9. Resolve D44, then activate personal Tasks Hub projection and optional
   Inngest execution behind independent kill switches.
10. Release only when production-shaped reconciliation and every named monitor
    are live and the complete traceability chain agrees.

## Migration, rollout, and rollback

### Additive migration

1. Add inactive code-owned kind/state/field registry entries and schema
   constraints; do not infer requests from existing grants.
2. Deploy deny-first RLS/grants, server projections, and readers that tolerate
   unknown future versions by omitting/denying.
3. Shadow-evaluate exact holder eligibility and source-lane queries with no
   writes and compare Tenant/source/assignment counts.
4. Enable holder submission for one internal/synthetic Tenant, then a bounded
   cohort; keep reviewer decisions and personal tasks disabled.
5. Enable permission-filtered source-lane reads, then keep/withdraw, then exact
   removal under transactional conservation checks.
6. Resolve D44 and shadow personal recipient resolution; project tasks only
   after complete-set and no-fallback evidence.
7. If chosen, enable Inngest only after identifier-only payload/DLQ/reconcile/
   provider-replacement tests.

### Mixed versions

- Old code cannot raw-write because base grants are absent and hardened
  commands reject unknown kind/version/state/head.
- New readers tolerate no D43 rows and never manufacture holder/task status.
- Event/projection schema versions are immutable; a consumer that does not
  understand one records failure and leaves source state unchanged.
- Client/server cache keys bind Tenant, assignment, request/source head,
  purpose/projection version, and authorization epoch; stale responses cannot
  overwrite newer terminal/current-access state.

### Rollback and roll-forward

- Disable holder submit, reviewer actions, personal task projection, and
  worker delivery independently.
- Preserve every committed request/event/decision/grant terminal/audit/
  receipt/outbox record; never hard-delete or rewrite it to make old code fit.
- A rollback after `resolved_removed` never auto-regrants access. Restoration,
  if independently justified, is a new governed Phase 12 grant command with
  its own reason/duration/authority/audit.
- Keep authorized audit/reconciliation readers available or roll forward to
  them; source requests remain truth even if product presentation is hidden.
- Replay/reconcile identifier-only intents after repair; never replay submit or
  grant removal merely because a task is missing.

## Traceability and proof matrix

| Decision fact                 | Governing artifact                  | Required downstream proof                                                            |
| ----------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------ |
| Request source and lifecycle  | D43 + Phase 12 request/decision     | OpenSpec scenarios, state/command model, migration constraints, public-seam tests    |
| Exact direct-source mutation  | D39–D41 + ADR-0184 + Phase 12       | Expected-head/advisory-lock/epoch/receipt/conservation tests                         |
| Holder provenance/read fields | D42                                 | Field allowlist, no-widening, uniformity, privacy/a11y tests                         |
| Source-owned work             | ADR-0183                            | Task source-contract registry, generic-mutation denial, projection/reconcile tests   |
| Tenant/RLS                    | Phase 12 + platform boundaries      | Composite FK/RLS introspection, poison fixtures, privileged-path tests               |
| UI/accessibility              | Core frontend rules/Base Maia + D43 | Storybook/public seam, keyboard/AT/reflow/i18n/low-bandwidth evidence                |
| Personal reviewer routing     | D44                                 | Complete eligible route, zero/partial behavior, task-recipient and source-lane proof |
| Operational readiness         | D43 monitors                        | Dashboards/alerts/runbooks, canary evidence, mismatch reconciliation                 |

## Exact decision to record

> **D43 — Governed holder review/removal request.** In My Access, an exact
> current holder of a D40 continuity direct source may expand the inline
> secondary action **Ask for an access review**, submit one required trimmed
> 1–500-code-point plain-text explanation, and receive durable
> `pending_review` status explicitly stating that access did not change. Core
> uses the Phase 12 `permission_change_request` subtype
> `request_kind = holder_direct_grant_review` and separate
> `request_contract_version = 1`, with at most one pending request per exact
> current direct source and immutable `withdrawn`, `resolved_kept`,
> `resolved_removed`, or `no_longer_applicable` terminal history. Pending status
> may remain inline while the source is current; the subject-only Phase 12 **My
> access requests** aggregate preserves authorized status/history after a
> current source disappears without treating history as current access.
>
> The exact requester may withdraw while pending. An independently current,
> exact-scope `permissions.manage_grants` holder may keep or remove only after
> current request/grant-head, grant-governance purpose, live scope/ceiling,
> floor, and Phase 12 control proof. A read-only audit/review capability cannot
> act or be routed. Keep requires a concise holder-safe explanation and changes
> no grant/epoch. Remove collects no duplicate D43 prose; it reuses the Phase
> 12 grant-state command and atomically commits exact direct-source termination,
> request outcome, audit/receipt, one epoch advance, and identifier-only outbox;
> failure leaves both request and grant pending/current. Other sources remain
> independent and post-effect access is re-resolved.
>
> Every pending request remains in the permission-filtered **Access requests**
> source lane under **Review current access**, distinct from periodic
> access-review/recertification campaigns. It is compatible with one ADR-0183
> source-backed Tasks Hub projection, but D44 decides only optional personal
> reviewer routing. Tasks Hub, notifications, AI, and Inngest own no request,
> access, recipient, decision, completion, text, or idempotency fact. No generic
> workflow engine, custom form/status DSL, comment system, SLA/reminder,
> auto-revoke, or Website-specific request table is created.

## Historical D44 question — resolved 2026-08-29

### Context and example

Jordan's request is already safe and discoverable in the permission-filtered
**Access requests** source lane under **Review current access**. D44 does not
decide access, request lifecycle, source-lane visibility, or who is authorized
to review. It decides only whether and how a complete current eligible subset
receives personal Tasks Hub attention. All options exclude Jordan from their
own personal review-task recipients; that avoids a useless/confusing self-task
but does not alter whether Phase 12's existing self/SoD/quorum rules permit
Jordan to act from the authoritative source lane.

Suppose a Tenant has six current exact-scope `permissions.manage_grants`
holders. Two routinely handle access governance; one is away; three hold the capability for broader
coverage. The source lane must remain accurate through every configuration.

### Option 1 — optional one to three Access request coordinators — recommended

The Tenant may name one to three unique, unordered, co-equal **Access request
coordinators** from the currently eligible exact-scope
`permissions.manage_grants` cohort. Coordinator configuration itself grants
no authority. A complete resolver first excludes the requester, then re-proves
current eligibility and
projects the one source-backed task to the currently eligible configured
subset. Missing configuration or proved-zero/partial/indeterminate resolution
projects no personal task and never broadcasts; the source lane remains the
permanent backstop.

This gives small ministries a clear accountable path without turning one
person into a brittle owner. It caps task fanout/noise, tolerates leave/turnover
through source-lane coverage, and mirrors ADR-0183 mechanics without importing
D35 Website coordinators or meanings.

### Option 2 — every current eligible grant decision-maker receives the personal task

Every current exact-scope `permissions.manage_grants` holder except the exact
requester gets a recipient projection for the same
shared occurrence. Coverage is high and configuration is minimal, but ordinary
Tenants may see duplicate personal chores, unclear ownership, notification
fatigue, and avoidable recipient fanout. Reading/claiming by one cannot make the
others' source work disappear until a source decision occurs.

### Option 3 — source lane only; no personal task

Keep the shared source lane and do not create any personal task projection.
This is the smallest implementation and avoids assignment noise, but it relies
on staff repeatedly checking a lane and weakens timely accountability,
especially for small or distributed ministries.

### Recommendation and exact question

**Recommend Option 1.** It preserves the authoritative shared lane, offers
bounded personal attention, avoids original-grantor and all-admin fallbacks,
and remains usable when no coordinator is configured or currently eligible.

**D44: Should D43 personal Tasks Hub routing use Option 1 — optional one to
three Access request coordinators, Option 2 — every current eligible exact-
scope `permissions.manage_grants` holder, or Option 3 — source lane only?**

**Recorded outcome:** Option 1, amended. The Tenant may use the shared lane
alone or select one to three current eligible co-equal coordinators. The same
current Phase 12 recipient generation drives independent source-backed Tasks
Hub responsibility and required ADR-0027/Phase 17 in-product attention; a
backlog policy change uses individual tasks plus one aggregate bell item per
newly admitted recipient and route revision. D45 decides external email only.
