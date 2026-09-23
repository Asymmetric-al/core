# Phase 24 D49 — Current-Recipient Cohort at the Source Reminder Occurrence

- **Status:** Founder answer adjudicated; documentation-only future contract
- **Founder direction:** Option 1 — at the one source reminder occurrence, seal the then-current D44 recipient cohort and allow every later surface or channel only to narrow it
- **Disposition:** **Accept with required amendments**
- **Date reviewed:** 2026-08-29
- **Scope:** Phase 12 access-governance source truth, D44 responsibility, ADR-0183 Tasks Hub projection, ADR-0027/Phase 17 presentation, Phase 6 delivery, and replaceable workflow execution
- **Non-scope:** no runtime behavior, schema, migration, OpenSpec delta, Phase 17 key, message content, channel, cadence value, clock, due date, task reminder, Inngest function, flag, or UI is authorized by D49

> **Post-D50 historical note (2026-08-29):** D50 now makes the one possible
> occurrence eligible at an immutable finite UTC not-before instant derived from
> exact elapsed seconds and a trusted D43 source-created instant captured after
> D48 serialization. It does not bind D49 recipients until the later successful
> source-seal commit and creates no due date or send promise. D51 has since added
> source-fenced Off and prospective re-enable; D52 has fixed finite half-open
> source usefulness and no catch-up; D53 now keeps every candidate absent until
> a D47 evidence-qualified proposal later passes a separate full activation.
> D54 local presentation is next. D49–D53 add no reminder/runtime artifact.
> D49's original question and evidence below remain historical.

## Executive adjudication

Option 1 is the strongest permanent direction, but the short phrase “current
recipients at the reminder” is unsafe unless Core defines exactly when
“current” is observed, which identity is sealed, how route changes race the
seal, and what zero or incomplete proof means.

The corrected decision is:

> A future D50-qualified reminder attempt may create at most one permanent
> source reminder occurrence for one D48-admitted D43 request episode. In one
> Phase 12 source transaction, Core uses the canonical D44 resolver to re-prove
> the request is current and to evaluate the complete current D44 responsibility
> basis. The resolver returns exactly one of three outcomes.
> **sealed_members** closes the seal with unique unordered one-to-three tuples
> of exact current D44 recipient-generation identity plus exact current same-
> Tenant Active Tenant Assignment that completely qualify after requester
> exclusion. **sealed_proved_zero** closes the seal with no members after
> complete proof. **recipient_resolution_indeterminate** is an unreleased,
> nonterminal occurrence-resolution state with immutable attempt evidence: it
> closes no seal, contains no member, and releases no descendant.
>
> “Current at the occurrence” means current at the successful authoritative
> source-seal commit. It is not current at a nominal wake time, request creation,
> task creation, browser render, worker start, HTTP arrival, email preparation,
> provider submission, or query time. A concurrent D44 route, assignment,
> eligibility, authorization, requester-identity, or D43 terminal change must
> have one serial outcome with the seal or force a complete retry. No task,
> cache, projection, provider, or workflow runtime may guess the winner.
>
> D49 and D44 policy publication share one stable Tenant/environment/D44-policy
> serialization namespace even when the optional D44 policy row is absent. If
> D49 commits first, complete lane-only proof seals terminal proved zero and a
> later coordinator policy cannot resurrect it. If the first D44 policy commits
> first, D49 evaluates that complete current route. A missing-row read, task
> projection, or asynchronous reconciliation cannot choose the order.
>
> **sealed_proved_zero** is terminal for that semantic occurrence. A later
> coordinator addition cannot resurrect it. **recipient_resolution_indeterminate**
> is not zero: it releases nobody, never emits a partial known subset, never
> falls back, and may retry only the same permanent occurrence identity. A
> successful retry seals the complete D44 cohort current at that later seal
> commit. D50 must define the bounded usefulness fence after which unresolved
> indeterminacy ends without presentation; D49 defines no clock or retry period.
>
> Every descendant begins with the immutable sealed set and may only suppress
> members. Before each first irreversible in-product presentation or external
> provider submission, Core re-proves the exact member’s current same-Tenant
> assignment, current D44 recipient generation, exact-scope authorization,
> requester exclusion, source actionability, purpose, identity mapping, and all
> channel-specific gates. Failure removes that member from that descendant and
> can never add, replace, reroute, or restore a member. Provider-accepted
> delivery cannot be recalled; current authorization still hides protected
> local detail.
>
> The occurrence and sealed membership create no second Tasks Hub task and do
> not mutate, complete, reopen, reassign, date, prioritize, snooze, or mark read
> the existing D44 task or initial attention. D44 remains current work truth;
> D49 is only the audience boundary for a separately governed courtesy
> occurrence. Phase 12 owns occurrence and recipient evidence, ADR-0183 owns
> task projection, ADR-0027/Phase 17 owns presentation, Phase 6 owns channel
> intents/outcomes, and Inngest—if later used—remains an identifier-only,
> replaceable executor.
>
> The automatic occurrence is a registered code-owned Phase 12 source command,
> not a human permissions.manage_grants command. Human manage-grants authority
> governs D44/D47 policy publication only. The system command may run solely
> from the exact current Tenant policy, D43/D48/D50 source predicates,
> permanent product claim, and code-owned purpose; it derives system
> attribution and cannot impersonate the policy author or accept a caller-
> selected recipient.

This amendment preserves the founder’s desired current-responsibility behavior
without turning delivery time into routing authority or allowing a retry to
address a different audience after a cohort was already sealed.

## Why this solves a real problem

D44 deliberately makes current responsibility replaceable. If Ana leaves and
Carla assumes responsibility before the one courtesy occurrence, notifying Ana
would be unsafe and notifying only the request-creation cohort could omit every
person now able to act. The complete Access requests lane and D44 task still
make the work discoverable; D49 does not pretend a reminder is required for
correctness. It decides only who may receive that optional occurrence if the
future feature passes every later gate.

The strongest alternative is **request-creation cohort plus later narrowing**.
It is simpler historically and avoids giving a newly assigned coordinator both
ordinary D44 reassignment attention and a later courtesy reminder. It loses to
Option 1 because a request created in lane-only mode or under departed
coordinators could permanently have no reminder audience even after an
authorized replacement assumes the work.

Continuous re-resolution through each channel is rejected. It would allow the
same semantic occurrence to address different people based on provider timing,
make lost-response replay unexplainable, and let email, push, Slack, Teams, or
another adapter become a responsibility authority.

## Evidence classification

### Verified repository facts

- [Identity and Access](../../../openspec/specs/identity-and-access/spec.md)
  requires server-derived identity, Tenant, role, and capability; application
  authorization is primary and RLS is defense in depth.
- [Workflow Orchestration](../../../openspec/specs/workflow-orchestration/spec.md)
  makes product records, Tenant authorization, audit, and the dispatch ledger
  authoritative; Inngest is only an executor and receives identifier-only
  envelopes.
- [Platform Boundaries](../../../openspec/specs/platform-boundaries/spec.md)
  keeps permission-sensitive mutation in Mission Control/server boundaries and
  requires one shared staff task model.
- [Platform Principles](../../../openspec/specs/platform-principles/spec.md)
  ranks Tenant safety and permission correctness above convenience and requires
  clarity, accessibility, and coherent shared behavior.
- [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
  gives D44 one source-backed task identity and current recipient generations;
  tasks and engagement never own request or access truth.
- [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)
  fixes the D44 resolver as complete, exact-scope, requester-excluding, and
  algebraic: released members, proved zero, or indeterminate.
- [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
  requires Phase 17 to map an admitted exact assignment through a trusted
  current same-Tenant Party/role/surface and to narrow rather than widen.
- D47 and D48 activate no reminder. D48 admits only genuinely new source
  episodes and explicitly leaves recipient binding to D49 and the
  clock/calendar/usefulness model to D50.
- Current generic Mission Control task reminders in
  [20260526193000_mission_control_tasks.sql](../../../supabase/migrations/20260526193000_mission_control_tasks.sql)
  are mutable task-owned records with profile assignees and are not D49
  precedent.
- Current contribution approval reminders in
  [approval-notifications.ts](../../../packages/api/src/admin/contribution-operations/approval-notifications.ts)
  scan pending rows, derive rounds from mutable timestamps, and resolve a broad
  approver list at execution. They are migration evidence, not the D43–D49
  source, identity, authorization, occurrence, or recipient contract.
- No D43–D49 runtime, schema, capability, Phase 17 key, or UI currently ships.

### Verified current primary external evidence

- [Microsoft Entra access-review creation](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)
  says each review instance captures an access snapshot at its start and
  distinguishes edits to the Current instance from edits to the future Series.
  This supports an explicit instance boundary rather than query-time audience
  reconstruction. It does not dictate Core’s D44 model.
- [Microsoft Entra review completion](https://learn.microsoft.com/en-us/entra/id-governance/complete-access-review)
  treats an active review as a distinct instance with durable decisions and
  history. That supports occurrence identity and stable evidence, not a
  channel-specific recipient query.
- [Okta review campaigns](https://help.okta.com/oie/en-us/content/topics/identity-governance/access-certification/iga-ac-review-campaign.htm)
  preserve original reviewer, delegate/reassignment, justification, assigned
  reviewer, and decision history. Explicit reassignment changes responsibility;
  it is not silently inferred independently by every notification channel.
- [Okta identity campaigns](https://help.okta.com/oie/en-us/Content/Topics/identity-governance/access-certification/create-user-campaign.htm)
  notify reviewers when items are assigned or reassigned and send reminders to
  reviewers who still have pending items. This supports current actionable
  responsibility plus separate reminder/presentation concerns.
- [SailPoint certification reassignment](https://documentation.sailpoint.com/saas/user-help/certs/reassign_certs_la.html)
  assigns active work to a new reviewer, requires a reason, and notifies that
  reviewer through email and in-app notification. This supports explicit
  current responsibility and auditable handoff, not dynamic channel authority.
- [NIST SP 800-207](https://csrc.nist.gov/pubs/sp/800/207/final) rejects
  implicit trust and requires authorization before a session to a resource.
  D49 therefore cannot treat a sealed audience as a durable access grant;
  current authorization must still narrow each later effect.
- [PostgreSQL transaction-isolation documentation](https://www.postgresql.org/docs/current/transaction-iso.html)
  explains that Serializable prevents outcomes with no consistent serial order
  and that aborted work must be retried as a complete transaction.
- [PostgreSQL row-security documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
  distinguishes row visibility from resulting-row checks and identifies table
  owners and BYPASSRLS roles as bypass paths requiring explicit parity.
- [RFC 9110 section 9.2.2](https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods)
  explains why a lost response does not make a non-idempotent retry safe unless
  the application can prove the original effect or semantic idempotency.
- [Inngest idempotency guidance](https://www.inngest.com/docs/guides/handling-idempotency)
  documents a 24-hour event/function deduplication window. That is useful
  transport protection but cannot own D49’s permanent product uniqueness.
- [Inngest sleep guidance](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps)
  confirms durable wake-up is available while also noting runs can outlive
  dashboard trace retention. Product receipts, not workflow history, must own
  occurrence and cohort evidence.
- [W3C WCAG 2.2 status-message guidance](https://www.w3.org/WAI/WCAG22/understanding/status-messages.html)
  supports programmatic, non-focus-stealing status feedback for any later
  settings or recovery surface.

These sources support stable review-instance evidence, explicit reassignment,
fresh authorization, and product-owned idempotency. None proves that one exact
automatic recipient-binding policy is universal, nor that Core should ship a
reminder. Option 1 remains a repository-specific product judgment.

### Reasonable inferences

- Ministries with a small access-governance team can experience absences,
  departures, and reassignment between request creation and a later courtesy
  occurrence. This is plausible but is not treated as measured ministry
  evidence.
- Current responsibility is a better default audience than historical
  responsibility because current coordinators are the people the product
  presently asks to act.
- A stable source seal followed by narrowing is easier to explain and audit than
  delivery-time widening across multiple future channels.

### Product judgments and unresolved unknowns

- Keeping the inherited D44 maximum of three members is a v1 Core product
  judgment, not an industry standard.
- No repository evidence yet establishes that reminders reduce time-to-review,
  that coordinators want them, or that newly assigned coordinators consider a
  nearby reminder helpful rather than duplicative. Research with representative
  ministry staff must verify those assumptions before activation.
- D50 has not selected an anchor, calendar arithmetic, cadence value, late-
  usefulness fence, route-change recency rule, or retry horizon.
- Later Off/edit/re-enable behavior, message meaning, in-product key, external
  channels, preference/consent, retention duration, deployment budgets, and
  executor remain unresolved.

## Current behavior, intended behavior, and permanent path

| Area                     | Current repository behavior                                                  | D49 intended contract                                                            | Best permanent path                                                   |
| ------------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| D43 request              | Not implemented; documented source aggregate and complete lane               | One current pending source episode may later qualify for one reminder occurrence | Keep request truth in Phase 12                                        |
| D44 responsibility       | Not implemented; documented exact current recipient generations and one task | Canonical current D44 resolver supplies the source-seal candidate set            | Reuse the source resolver, never task rows                            |
| Generic tasks            | Mutable task reminders and profile assignees exist for other domains         | No second task and no task reminder/date mutation                                | Keep D44 task as the one work projection                              |
| Notification UI          | Current staff bell includes demo/non-authoritative presentation              | No D49 surface or key now                                                        | Add a reviewed Phase 17 contract only after D50 and channel decisions |
| Contribution reminders   | Scan pending correction requests and broad approvers                         | Explicitly nonprecedent                                                          | Do not reuse timestamp rounds or broad role lookup                    |
| Recipient binding        | No D49 runtime                                                               | One source commit seals current complete D44 result                              | Phase 12 immutable occurrence/recipient receipt                       |
| Route changes after seal | No D49 runtime                                                               | May suppress sealed members only; never add replacements                         | Fresh per-effect authorization against immutable ceiling              |
| Workflow                 | Inngest is the accepted replaceable executor                                 | May wake or reconcile identifier-only work                                       | Product claim/receipt remains authoritative                           |

## Domain model, ownership, and invariants

### Canonical terms

**Recipient-binding instant:** The successful Phase 12 commit that closes the
recipient disposition for the one source reminder occurrence. It is not the
nominal wake time or any delivery timestamp.

**Reminder recipient seal:** The immutable disposition and evidence connecting
one reminder occurrence to either one complete unordered set of exact D44
recipient-generation/Active Tenant Assignment tuples or complete proved zero.
Indeterminacy has attempt evidence but no seal.

**Sealed reminder member:** One immutable tuple of exact D44 recipient-
generation identity and exact Active Tenant Assignment admitted by a complete
D44 resolution at the recipient-binding instant. Both identities must continue
gap-free through a later effect. It is an audience ceiling, not an
authorization grant, address, profile, or delivery guarantee.

**Downstream narrowing:** A fresh current check may suppress a sealed member
before an irreversible effect. It may never add, replace, reroute, or revive a
member.

**Proved zero:** Complete proof that no configured non-requester assignment
qualifies. It seals an empty terminal result for that occurrence.

**Indeterminate recipient resolution:** Incomplete, stale, timed-out,
contradictory, corrupt, ambiguous, or over-limit proof. It releases nobody and
retains the same occurrence identity plus immutable attempt evidence for
bounded retry. It is unreleased and nonterminal, not a closed seal.

### Ownership matrix

| Authoritative fact                         | Owner                                   | Permitted consumers                       | Explicit non-owners                         |
| ------------------------------------------ | --------------------------------------- | ----------------------------------------- | ------------------------------------------- |
| D43 request episode, state, actionability  | Phase 12 request aggregate              | source lane, task/item adapters           | task, notification, channel, worker         |
| D48 cadence admission                      | Phase 12 request creation receipt       | D49/D50 source evaluation                 | timestamp scan, route, provider             |
| Current D44 responsibility                 | Phase 12 D44 policy/resolver/generation | task, initial attention, D49 seal         | task assignee, email, display name          |
| One reminder occurrence identity           | Future Phase 12 source contract         | Phase 17/6 descendants, executor claim    | policy version, member digest, channel      |
| Recipient disposition and sealed members   | Phase 12 D49 source receipt             | permission-filtered audit and descendants | provider, Inngest, Phase 17 projection      |
| Current authorization and identity mapping | Phase 12/IAM current facts              | every source and descendant gate          | sealed membership alone                     |
| Existing work projection                   | ADR-0183 Tasks Hub                      | staff work surfaces                       | reminder source, due/reminder fields        |
| In-product presentation                    | ADR-0027/Phase 17                       | Notification Center                       | responsibility, access, occurrence identity |
| External intent/outcome                    | Phase 6/provider evidence               | operations and audit                      | recipient widening, source state            |
| Wake-up/retry                              | Replaceable executor                    | identifier-only claims                    | business identity, membership, truth        |

### Domain invariants

1. One D48-admitted D43 request episode has at most one permanent reminder
   occurrence identity, independent of route, policy, member, channel, or run.
2. One occurrence is either unreleased with immutable indeterminate-attempt
   evidence, or has exactly one terminal seal: members, proved zero, or a later
   D50-governed terminal no-release result.
3. A sealed-members result contains one to three unique unordered tuples of
   exact current D44 recipient-generation identity and exact current same-
   Tenant Active Tenant Assignment; proved zero contains none.
4. Member ordering is presentation-neutral. A canonical ordering may be used
   only for digest/uniqueness evidence and never creates priority.
5. Every configured candidate is evaluated. A known eligible subset cannot be
   released while any required candidate or requester identity is unknown.
6. Every assignment currently resolving to the authenticated requester
   principal is excluded through trusted identity relationships.
7. A sealed member gains no request visibility, decision authority, grant,
   capability, channel preference, or address from membership.
8. Every descendant member belongs to the original sealed set and proves
   gap-free continuation of both exact generation and assignment. Set
   difference is allowed; set union, substitution, removal/re-add
   resurrection, and generation replacement are forbidden.
9. Proved zero never ages into members and a later D44 route does not create a
   second occurrence.
10. Indeterminate is never coerced to zero or a partial set; retry preserves
    the original occurrence identity.
11. The D44 task remains the only task identity for the source work. Reminder
    occurrence, member, item, email, chat, and workflow records create no task.
12. D43 terminal truth and current authorization outrank the seal at every
    irreversible presentation or submission.
13. Source, member, audit, and dispatch evidence never copy request reasons,
    protected provenance, grant snapshots, email addresses, or message bodies.
14. Tenant, code-owned system actor/purpose, requester, request, route,
    assignment, policy/source heads, occurrence identity, member identity, and
    audit attribution are server-derived or server-resolved; callers cannot
    retarget them, and human policy authority is not system occurrence
    authority.
15. Every Tenant-scoped relationship is same-Tenant by construction and every
    privileged path enforces equivalent purpose and scope.

## Lifecycle, concurrency, idempotency, and failure

### Conceptual lifecycle

These are behavioral states, not a schema prescription:

1. **Not qualified:** D47/D48/D50 source predicates do not permit an occurrence.
2. **Recipient resolution indeterminate:** the permanent occurrence identity
   exists or is claimed and an immutable attempt is recorded, but complete
   current D44 proof cannot yet close a seal. This state is unreleased and
   nonterminal.
3. **Sealed members:** one complete one-to-three-member set and source receipt
   commit atomically; membership never widens.
4. **Sealed proved zero:** a complete empty result commits atomically and is
   terminal.
5. **Ended indeterminate:** only a later D50 usefulness rule may stop retry
   without ever releasing a member.
6. **Descendant presented/submitted/suppressed:** each channel-owned outcome is
   independent and cannot change the source seal, task, request, or access.

Forbidden transitions include proved zero to members, sealed members to a
different or larger set, a suppressed old generation to a restored generation,
one occurrence to a channel-specific occurrence, and any descendant outcome to
request resolution or task completion.

### Required race and failure outcomes

| Race or failure                                                           | Required result                                                                                                          |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| No D44 policy row exists and D49 commits before first D44 policy creation | Complete lane-only proof seals terminal proved zero; later policy cannot resurrect it                                    |
| First D44 policy creation commits before D49                              | D49 evaluates that complete current route and may seal its eligible cohort                                               |
| D44 route successor commits before D49 source seal                        | Seal evaluates the successor current generation                                                                          |
| D49 seal commits before D44 route successor                               | Seal may contain the prior serially current set; later presentation suppresses anyone no longer current and adds nobody  |
| D43 becomes terminal before seal                                          | No released cohort or descendant                                                                                         |
| D43 terminal result races seal                                            | One serial winner; a seal ordered first still faces terminal reproof before presentation                                 |
| Assignment or capability ends before seal                                 | Candidate is excluded when fully proved, or the whole result is indeterminate                                            |
| Assignment or capability ends after seal                                  | Member remains historical evidence but every not-yet-irreversible descendant suppresses them                             |
| Assignment is recreated with a new identity                               | New assignment cannot inherit the sealed member or old generation                                                        |
| Removed recipient later regains eligibility                               | Fresh D44 generation does not revive or join the old seal                                                                |
| Requester is the only configured eligible coordinator                     | Complete requester exclusion seals proved zero                                                                           |
| One of three is proved ineligible and two are proved eligible             | Seal exactly the two-member complete subset                                                                              |
| One candidate is eligible but another required fact is unknown            | Indeterminate; release nobody                                                                                            |
| Corrupt policy appears to contain four members                            | Indeterminate; never truncate to three                                                                                   |
| Initial indeterminate retry sees a different current route                | The same occurrence may seal the complete set current at the successful retry commit                                     |
| Proved zero is followed by coordinator configuration                      | No member, retry, or second occurrence is created                                                                        |
| Two workers claim the same occurrence                                     | Product uniqueness yields one seal/receipt; loser returns or observes it                                                 |
| Source seal commits but response or handoff is lost                       | Semantic replay returns the exact seal and repairs identifier-only dispatch                                              |
| Projection or provider retries after its transport dedupe window          | Product member/intent claim prevents a duplicate irreversible effect                                                     |
| Provider accepts delivery and D44 then removes recipient                  | Accepted effect is retained as historical delivery evidence; no recall claim; current detail remains authorization-gated |
| In-product item exists and current authorization ends                     | Current query/presentation ceiling hides protected access; source audit is not rewritten                                 |
| Phase 17 mapping from assignment to Party/role/surface is ambiguous       | That descendant suppresses; it never maps by profile/email/name or widens                                                |
| Cross-Tenant row or cached route is observed                              | Reject/quarantine; no member or descendant is released                                                                   |
| Executor is down past its trace-retention window                          | Product occurrence/claim remains recoverable without executor history                                                    |

## UX/UI contract

### D49 creates no user-facing control now

D49 does not add a recipient picker, reminder switch, audience count, route
preview, task action, channel matrix, “send again” button, or placeholder. The
existing D44 coordinator editor remains the only place to choose responsibility.
D50 has since selected request-anchored elapsed eligibility; the future cadence
control remains unavailable until policy lifecycle, values, usefulness, source,
presentation, and channel decisions are complete.

### Future administrator explanation

If the complete feature later activates, the cadence surface should use one
quiet read-only summary:

**Recipients**

**Access request coordinators responsible when the reminder occurs.**

Its progressive disclosure says:

> Later changes may stop delivery, but won't redirect that reminder. If no one
> qualifies, the request stays in Access requests.

Do not show member names, an audience count, “everyone notified,” guaranteed
delivery, or sealed/cohort/generation terminology in ordinary settings. An
authorized audit view may show the exact source basis and members only after
fresh access-governance authorization.

### Future coordinator experience

A reminder presentation, if separately registered later, should use safe
current-language such as:

> An access review is still waiting. Review current status and available
> actions in People & access.

It must not say Due, Overdue, Escalated, ignored, unresponsive, delivered,
seen, or access changed. It must not create a second Tasks Hub row. The
authenticated deep link rechecks current detail and may truthfully show that
the request is resolved or no longer available.

Carla may receive ordinary D44 responsibility-update attention and later join a
D49 reminder if she is current at the seal. D49 must not hide that consequence
or invent a recency exception. D50 must decide whether the reminder remains
useful near a responsibility change.

### Other user journeys

- The requester/holder sees no recipient list, reminder status, read receipt,
  or claim that staff are aware.
- Former coordinators receive no new local presentation or unsubmitted external
  message after current loss. Provider-accepted messages cannot be recalled,
  but their links and protected detail remain freshly authorized.
- Lane-only and proved-zero operation remain calm and functional through Access
  requests; zero is not shown as a scary product failure.
- Indeterminate resolution is visible to authorized operations with a safe
  repair status; it never creates a misleading Tenant-facing “sent” state.
- Donor, missionary, CMS, and public surfaces gain no control or status.

### Accessibility, localization, mobile, and field conditions

Any later surface must use the repository’s Base Maia/Base UI primitives and
shared Zinc semantic tokens; preserve visible focus, keyboard order, labels,
non-color state, forced colors, touch targets, 320-pixel/400-percent reflow,
screen-reader semantics, RTL/CJK expansion, localization, and reduced motion.
Save/recovery status must be persistent and programmatically announced without
focus theft or a toast-only dependency. The shared lane and task remain usable
without external delivery, continuous connectivity, hover, animation, or a
large screen.

## Normative requirements

- **D49-R1:** D49 accepts Option 1 only as a documentation-only future contract;
  it creates no runtime, schema, OpenSpec, key, job, channel, cadence, or UI.
- **D49-R2:** One D48-admitted D43 request episode may have at most one permanent
  reminder occurrence and no second Tasks Hub task.
- **D49-R3:** The recipient-binding instant is the successful authoritative
  Phase 12 source-seal commit, not a wake, request, task, worker, render, or
  provider timestamp.
- **D49-R4:** The source seal uses the complete canonical current D44 resolver,
  binds each member as exact D44 recipient-generation plus exact Active Tenant
  Assignment, and never derives members from tasks, profiles, addresses, roles,
  groups, caches, provider recipients, or display data.
- **D49-R5:** A source seal and every racing D43/D44/assignment/authorization
  mutation must have one defensible serial outcome or a complete command retry;
  D49 and D44 policy publication share an absent-row-safe stable serialization
  namespace.
- **D49-R6:** A successful occurrence seal, terminal recipient disposition,
  exact member evidence, immutable receipt/audit, and identifier-only handoff
  commit atomically. Indeterminate instead commits only the occurrence claim
  and immutable unreleased attempt evidence, with no seal or handoff.
- **D49-R7:** Occurrence uniqueness excludes D44 route/generation, member digest,
  policy revision, channel, provider, task, event, and executor identity.
- **D49-R8:** The resolver returns only sealed members, sealed proved zero, or
  recipient resolution indeterminate; only the first two close a seal.
- **D49-R9:** Sealed members contain the complete unique eligible one-to-three-
  assignment subset; no known subset releases while any required proof is
  incomplete.
- **D49-R10:** Sealed proved zero is an empty terminal result that route or
  eligibility changes can never resurrect.
- **D49-R11:** Indeterminate releases nobody, never falls back or becomes zero,
  and retries only the same occurrence until a D50 usefulness fence ends it.
- **D49-R12:** Trusted requester exclusion removes the exact subject assignment
  and every configured assignment resolving to the requester principal.
- **D49-R13:** Every admitted member independently re-proves gap-free current
  D44 recipient generation, current same-Tenant assignment, D43 exact-scope
  decision purpose, permissions.manage_grants, ceiling, floor, source
  visibility, and compatible recipient mapping.
- **D49-R14:** No Owner/Admin, original grantor, all-manager, auditor, group,
  manager, prior recipient, support, AI, service-role, or cross-product
  fallback is permitted.
- **D49-R15:** Every downstream member set is a subset of the source seal; later
  processing may suppress but never add, replace, reroute, union, or revive.
- **D49-R16:** Current D43 state, D44 generation, assignment, authorization,
  requester exclusion, identity mapping, and channel gates re-prove before each
  first irreversible presentation or provider submission.
- **D49-R17:** Provider acceptance is historically irreversible; later source
  loss cannot claim recall, while current authorization still protects local
  detail and future effects.
- **D49-R18:** The D44 task remains the one work identity; D49 cannot create,
  date, complete, reopen, reassign, prioritize, snooze, dismiss, or mark it read.
- **D49-R19:** D49 authorizes no message key, content, preference, destination,
  channel, digest, escalation, or delivery guarantee.
- **D49-R20:** Phase 12 owns occurrence and recipient truth; D44 owns current
  responsibility; ADR-0183 owns task projection; Phase 17/6 own presentation
  and delivery; Inngest is only a replaceable executor.
- **D49-R21:** All future persistence and queries are exact-Tenant,
  purpose-scoped, least-granted, same-Tenant constrained, and protected across
  browser, RLS, views, functions, RPCs, service, worker, support, owner, and
  BYPASSRLS paths.
- **D49-R22:** Tenant, code-owned system actor/purpose, requester,
  policy/request/route heads, assignment, member, disposition, occurrence, and
  audit attribution come from trusted server context; caller values are only
  validated concurrency inputs where explicitly allowed. Automatic occurrence
  authority is separate from human permissions.manage_grants policy authority.
- **D49-R23:** Source and member evidence is immutable, append-only or
  equivalently history-preserving, uniquely constrained, restrictively deleted,
  and incapable of cross-Tenant or cross-occurrence retargeting.
- **D49-R24:** Semantic product receipts and claims, not HTTP, event, function,
  task, or provider dedupe windows, guarantee replay and permanent uniqueness.
- **D49-R25:** D49 adds no ordinary UI; any later explanation uses plain
  responsibility language, progressive disclosure, durable status, and no
  audience names/counts or internal cohort terminology.
- **D49-R26:** Recipient evidence is sensitive access-governance data; minimize
  fields and payloads, govern retention/export/deletion/logging/AI access, and
  never copy protected request or contact content.
- **D49-R27:** Resolution is bounded by the D44 maximum of three candidates and
  must not scan staff, pending requests, tasks, messages, or historical
  recipients; release needs production-shaped performance proof.
- **D49-R28:** Rollout uses deny-compatible readers before one writer, no
  historical member backfill, mixed-version proof, a source kill switch, and
  roll-forward repair without rewriting committed seals.
- **D49-R29:** Durable business receipts and security audit differ from
  technical traces; named monitors authorize no new telemetry or sensitive
  person-performance scoring through D49.
- **D49-R30:** D50 must independently decide source clock, calendar arithmetic,
  late usefulness, retry end, and route-change recency before OpenSpec,
  design, implementation, presentation, or channel activation.

## Ruthless 22-category adversarial review

Every category was evaluated independently. A material concern exists in all
22 categories for the unqualified one-line answer; each concern narrows or
amends Option 1 rather than invalidating the corrected direction.

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.**

| What could go wrong                                                                                                                                     | Why it matters                                                                                                     | Severity | Likelihood | Evidence or reasoning                                                               | Effect on answer                                                                           | Best permanent fix                                                                                                                                                                   | Exact specification language                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- | ---------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| The product builds a reminder-recipient system before proving reminders help ministries, or treats reminder reach as necessary for request correctness. | It adds sensitive automation and noise while the complete lane, task, and initial attention already preserve work. | High     | Medium     | D46 found no current temporal requirement; no measured ministry evidence was found. | Narrows Option 1 to an audience rule only if the later reminder is independently admitted. | Keep D49 documentation-only; require evidence, D50, later content/channel decisions, and activation gates. The strongest alternative remains request-creation cohort plus narrowing. | **D49-R1–R2, R19, R30; D49-AC001–010, AC111–120.** |

### 2. Brittleness

**Material concern: Yes.**

| What could go wrong                                                                                 | Why it matters                                                        | Severity | Likelihood          | Evidence or reasoning                                                                                             | Effect on answer                                                                      | Best permanent fix                                                                       | Exact specification language                      |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------- | ------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------- |
| “Current” is evaluated at worker wake, task query, email preparation, or independently per channel. | Route churn and retry produce different audiences for one occurrence. | Critical | High for a shortcut | Current generic approval reminders resolve recipients during scans; D44 generations and external systems can lag. | Replaces vague current-time behavior with one authoritative recipient-binding commit. | Atomically seal the complete current D44 result in Phase 12, then permit narrowing only. | **D49-R3–R7, R15–R16; D49-AC011–020, AC031–050.** |

### 3. Technical debt

**Material concern: Yes.**

| What could go wrong                                                                                                                           | Why it matters                                                                                                  | Severity | Likelihood                         | Evidence or reasoning                                                                        | Effect on answer                                                                | Best permanent fix                                                                                          | Exact specification language                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| D49 adds a generic audience snapshot table, profile/email arrays, channel-recipient join, or Inngest-specific identity before D50 and design. | Placeholder shape becomes a compatibility contract, duplicates D44 identity, and makes future channels brittle. | High     | High under “future-ready” pressure | Governing ADRs already separate assignment, presentation, delivery, and executor identities. | Makes D49 behavior- and owner-specific, storage-neutral, and artifact-free now. | Later select the smallest Phase 12 representation that proves the invariants; no dormant schema or adapter. | **D49-R1, R4, R7, R19–R20, R28, R30; D49-AC001–010, AC061–070, AC091–100.** |

### 4. Edge cases

**Material concern: Yes.**

| What could go wrong                                                                                                                                           | Why it matters                                                                                 | Severity | Likelihood        | Evidence or reasoning                                                                                                               | Effect on answer                         | Best permanent fix                                                                                                             | Exact specification language                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Route update, requester identity, assignment end/recreation, D43 resolution, ambiguous mapping, lost response, proved zero, and indeterminate proof interact. | Former staff can be contacted, current staff omitted, duplicates created, or zero resurrected. | Critical | High in aggregate | These are ordinary staffing and distributed-system transitions; D44 already models fresh generations and exact assignment identity. | Adds a formal lifecycle and race matrix. | One serial seal, exact assignment lineage, terminal zero, same-occurrence indeterminate retry, and narrowing-only descendants. | **D49-R3–R17, R23–R24; D49-AC011–050, AC081–090.** |

### 5. Footguns

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                          | Why it matters                                                                      | Severity | Likelihood                    | Evidence or reasoning                                                                                                        | Effect on answer                                                    | Best permanent fix                                                                                                 | Exact specification language                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Developer truncates four corrupt members to three, sends to the known subset while one candidate is unknown, adds the latest coordinator during email retry, or lets staff click Send again. | A convenience path silently widens sensitive audience or creates repeated pressure. | Critical | High without explicit denials | D44’s algebra distinguishes complete subsets, zero, and indeterminate; transport retries commonly outlive local assumptions. | Prohibits truncation, partial release, widening, and manual replay. | Trusted closed resolver, product claim, no send-again or audience override, and negative tests for every fallback. | **D49-R8–R16, R24–R25; D49-AC021–040, AC071–090.** |

### 6. Tenant safety

**Material concern: Yes.**

| What could go wrong                                                                                                                                        | Why it matters                                            | Severity | Likelihood                     | Evidence or reasoning                                                                        | Effect on answer                                                                           | Best permanent fix                                                                                                             | Exact specification language                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------- | ------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Shared cache, global worker claim, profile mapping, or bare foreign key combines a request from one Tenant with an assignment or destination from another. | It discloses access-governance work across organizations. | Critical | Medium without composite scope | OpenSpec makes Tenant isolation structural; workflow infrastructure is intentionally shared. | Adds exact Tenant/environment scope to every source, member, query, claim, and descendant. | Same-Tenant composite integrity, per-Tenant claims/flow control, no global fallback/cache, and cross-Tenant adversarial tests. | **D49-R13–R16, R21–R23; D49-AC051–060, AC101–110.** |

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                       | Why it matters                                                                                                       | Severity | Likelihood                                        | Evidence or reasoning                                                                                                                                       | Effect on answer                                                                           | Best permanent fix                                                                                                                                                                     | Exact specification language                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Caller supplies recipient/actor/Tenant, update retargets a sealed row, RLS checks only existing rows, or service/BYPASSRLS paths skip the policy. Concurrent route and seal commits both use stale state. | An allowed write can forge or cross-scope audience; two locally valid commits can violate current-at-seal semantics. | Critical | High for generic CRUD or Read Committed shortcuts | Identity OpenSpec requires server derivation; PostgreSQL distinguishes USING/WITH CHECK and privileged bypasses; serial business rules need conflict/retry. | Requires one trusted mutation boundary and database defense in depth without freezing SQL. | Revoke browser base writes; derive authority; composite constraints; immutable evidence; correct USING/WITH CHECK; owner/service/worker parity; one serial outcome and complete retry. | **D49-R5–R6, R12–R13, R21–R24; D49-AC041–060, AC081–090.** |

### 8. Overengineering

**Material concern: Yes.**

| What could go wrong                                                                                                                                           | Why it matters                                                                           | Severity | Likelihood                       | Evidence or reasoning                                                                                            | Effect on answer                                                 | Best permanent fix                                                                    | Exact specification language                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Core creates audience rules, priority/backup ordering, workload routing, fallback trees, channel-specific cohorts, or a general notification workflow engine. | It solves speculative routing problems and obscures the simple 0–3 current D44 boundary. | High     | High if vendor suites are copied | External products expose far more configurability; Core intentionally chose bounded co-equal D44 responsibility. | Strictly limits D49 to one fixed resolver and immutable ceiling. | No DSL, groups, ordering, fallback, per-channel routing, or generic audience service. | **D49-R4, R8–R15, R19–R20, R27, R30; D49-AC001–010, AC021–040, AC061–070.** |

### 9. UX/UI and user friction

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                                              | Why it matters                                                                                   | Severity | Likelihood                        | Evidence or reasoning                                                                                                     | Effect on answer                                                                        | Best permanent fix                                                                                                                                             | Exact specification language                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| A new audience editor duplicates D44, ordinary copy exposes names/counts or internal “sealed cohort” jargon, or a new reminder task appears. Carla may receive reassignment attention and a nearby reminder with no explanation. | Staff face conflicting controls, privacy leakage, noisy work lists, and apparent duplicate work. | High     | High without a strict UX boundary | Core’s design system favors compact progressive disclosure; vendor systems separate review assignment from notifications. | Removes all D49 UI now and defines quiet future copy; defers recency usefulness to D50. | Reuse People & access and the existing task; show one plain explanation only when the full feature exists; no count/names/channel matrix; accessibility gates. | **D49-R18–R19, R25, R30; D49-AC061–080, AC111–120.** |

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.**

| What could go wrong                                                                                                           | Why it matters                                                                           | Severity | Likelihood                   | Evidence or reasoning                                                                        | Effect on answer                                                                                      | Best permanent fix                                                                                          | Exact specification language                      |
| ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------- | ---------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Task assignees, Phase 17 rows, provider destinations, current email address, cache, or Inngest state becomes recipient truth. | Systems disagree, repairs circularly widen audience, and historical explanation is lost. | Critical | High without an owner matrix | ADR-0183/0027 and workflow OpenSpec explicitly make projections/executors non-authoritative. | Centralizes occurrence and member evidence in Phase 12 while preserving D44 responsibility ownership. | One immutable source seal; downstream only consumes identifiers and current gates; no dual write authority. | **D49-R3–R7, R15–R24; D49-AC011–020, AC051–070.** |

### 11. Hidden coupling

**Material concern: Yes.**

| What could go wrong                                                                                                                                             | Why it matters                                                                     | Severity | Likelihood                                        | Evidence or reasoning                                                                                    | Effect on answer                                                | Best permanent fix                                                                                            | Exact specification language                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Cohort depends on D44 task materialization, Phase 17 Party mapping, D45 email preference, contribution reminder rounds, provider acceptance, or an Inngest run. | Changes to a projection, channel, or vendor alter source responsibility semantics. | High     | High because these local precedents already exist | Current task/profile and contribution reminder implementations have incompatible ownership and identity. | Forbids reuse as authority while allowing replaceable adapters. | Canonical D44 source resolver at seal; identifier-only handoff; conformance tests that channels cannot widen. | **D49-R4, R7, R15–R20, R24; D49-AC021–030, AC061–070, AC101–110.** |

### 12. Failure modes

**Material concern: Yes.**

| What could go wrong                                                                                                                                                      | Why it matters                                                                                             | Severity | Likelihood                    | Evidence or reasoning                                                                                  | Effect on answer                                                                                 | Best permanent fix                                                                                                                                                                 | Exact specification language                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | -------- | ----------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Seal commits but dispatch fails; response is lost; one channel succeeds while another fails; authorization ends after provider acceptance; resolver stays indeterminate. | Effects can duplicate, disappear, reach a former coordinator, or become impossible to diagnose and repair. | Critical | High in distributed operation | RFC 9110 limits blind retries; Inngest dedupe is time-bounded; provider submission is not retractable. | Adds product-owned atomic evidence, independent outcomes, safe narrowing, and explicit recovery. | Atomic receipt/outbox, permanent semantic claims, same-occurrence retry, provider accepted truth, bounded indeterminate ending under D50, and no source rollback by channel state. | **D49-R5–R7, R10–R17, R24, R28–R29; D49-AC031–050, AC081–100.** |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                     | Why it matters                                                   | Severity | Likelihood                     | Evidence or reasoning                                                                                                       | Effect on answer                                                                          | Best permanent fix                                                                                                                                | Exact specification language                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| No formal state model distinguishes unqualified, unreleased indeterminate, sealed members, proved zero, and ended; retry seals a new cohort or policy version mints another occurrence. | The same request can create multiple audiences or retry forever. | Critical | High without formal identities | D48 requires one reminder per request generation; PostgreSQL/RFC evidence requires serial, semantically idempotent effects. | Defines explicit states and forbidden transitions while reserving temporal ending to D50. | Stable occurrence identity, atomic terminal seal, same-occurrence retry, D50 fence, deterministic race tests, and no mutable field in uniqueness. | **D49-R2–R11, R15–R17, R24, R30; D49-AC011–050, AC081–090.** |

### 14. Data integrity risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                        | Why it matters                                                       | Severity | Likelihood  | Evidence or reasoning                                                                  | Effect on answer                                                                | Best permanent fix                                                                                                                                                             | Exact specification language                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------- | ----------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Member rows are mutable/nullable, duplicate an assignment, mismatch their digest/count, lose Tenant scope, cascade-delete history, or are patched after occurrence commit. | History drifts, set ceilings cannot be proved, and replay may widen. | Critical | Medium-high | Cross-row membership and history need stronger invariants than application convention. | Requires immutable complete source evidence without prescribing a table layout. | Closed non-null dispositions; exact uniqueness; same-Tenant constraints; restrictive deletion; one trusted atomic writer; repair from receipts, never current query inference. | **D49-R6–R10, R21–R24, R26; D49-AC011–020, AC051–060, AC081–100.** |

### 15. Security and privacy risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                       | Why it matters                                                                                                  | Severity | Likelihood | Evidence or reasoning                                                          | Effect on answer                                                            | Best permanent fix                                                                                                                                                                      | Exact specification language                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Cohort names, email addresses, exclusion reasons, request text, membership counts, logs, exports, backups, support screens, or AI context expose sensitive ministry staffing and access-governance facts. | It expands disclosure beyond the people who can act and may reveal member-care or field-location relationships. | Critical | Medium     | D43 reasons/provenance are protected; audience membership is itself sensitive. | Minimizes evidence and separates ordinary UX from purpose-authorized audit. | Exact assignment identifiers and typed basis only; no protected body/contact copy; fresh read authorization; governed retention/export/deletion/log/backup/AI policy before activation. | **D49-R12–R16, R21–R26; D49-AC051–080, AC101–110.** |

### 16. Scalability and performance risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                           | Why it matters                                                                                         | Severity | Likelihood                        | Evidence or reasoning                                                                                                             | Effect on answer                                                                  | Best permanent fix                                                                                                                                             | Exact specification language                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Worker scans staff/tasks/messages or serializes all Tenant requests; missing indexes turn each reminder into broad joins; retries create noisy-neighbor load. | Large Tenants and shared infrastructure suffer latency, lock contention, and unsafe timeout fallbacks. | High     | Medium for a naïve implementation | D44 bounds configured candidates at three; D49 needs no current-request or staff census. Exact volume/SLO evidence is unresolved. | Keeps resolution O(1) in recipient cardinality without inventing a latency claim. | One indexed current route/head plus at most three candidate proofs; per-occurrence claims; production-shaped query/lock plans and ratified SLO before release. | **D49-R4–R6, R9, R27–R28; D49-AC021–030, AC091–110.** |

### 17. Operational burden

**Material concern: Yes.**

| What could go wrong                                                                                                                                   | Why it matters                                                         | Severity | Likelihood | Evidence or reasoning                                                                                                | Effect on answer                                                     | Best permanent fix                                                                                                                                | Exact specification language                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Operators manually insert members, replay “send” jobs, inspect vendor logs after retention expires, or guess whether zero and unknown are equivalent. | Sensitive effects require tribal knowledge and direct database repair. | High     | Medium     | Inngest documents that sleeping work can outlive visible run history; D44 resolver failures require source evidence. | Adds product receipts, explicit operational states, and safe repair. | Read-only diagnosis, claim repair, same-occurrence replay, quarantine on impossible states, no manual member mutation, and documented escalation. | **D49-R8–R11, R23–R24, R28–R29; D49-AC081–100, AC111–120.** |

### 18. Observability and auditability gaps

**Material concern: Yes.**

| What could go wrong                                                                                                         | Why it matters                                                                                         | Severity | Likelihood                      | Evidence or reasoning                                                                                                | Effect on answer                                                          | Best permanent fix                                                                                                                | Exact specification language                        |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Only logs/provider/workflow traces show who was sealed, or new person-level timing metrics become performance surveillance. | History cannot prove why someone was or was not contacted; monitoring itself leaks sensitive behavior. | High     | High absent explicit separation | Core already distinguishes durable business audit from technical traces; external executor history is not permanent. | Requires future durable product evidence and forbids telemetry creep now. | Body-free source receipt, security audit, independent channel outcomes, aggregate/threshold monitors only, and no person scoring. | **D49-R6, R23–R26, R29; D49-AC071–090, AC111–120.** |

### 19. Dependency and integration risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                     | Why it matters                                                             | Severity | Likelihood  | Evidence or reasoning                                                                    | Effect on answer                                   | Best permanent fix                                                                                                                                                 | Exact specification language                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------- | ----------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Inngest 24-hour dedupe, sleep/run ID, provider address, Slack/Teams directory, ORM snapshot, or cache order becomes permanent uniqueness or membership. | Retention windows, outages, upgrades, and vendor changes alter Core truth. | High     | Medium-high | Inngest’s official dedupe is time-bounded; its sleep is useful but not a product ledger. | Keeps every dependency downstream and replaceable. | Product occurrence/member/intent claims; identifier-only events; current destination/install gates; provider outcomes as evidence only; adapter conformance tests. | **D49-R7, R15–R24, R28; D49-AC041–070, AC081–100.** |

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                        | Why it matters                                                                       | Severity | Likelihood              | Evidence or reasoning                                                                                | Effect on answer                                                  | Best permanent fix                                                                                                                                                       | Exact specification language                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | -------- | ----------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| Old readers treat missing seal as current-query membership; backfill derives members from task/profile history; mixed writers mint two occurrences; rollback deletes audit after delivery. | Historical work can be sent unexpectedly and new/old versions disagree irreversibly. | Critical | High without sequencing | D48 forbids historical admission; D49 adds sensitive audience evidence and external irreversibility. | Adds no-backfill, deny-first, one-writer, and roll-forward rules. | Add compatible denied readers, constraints and receipt readers before writer; activate by Tenant cohort; kill new seals/sends without rewriting history; repair forward. | **D49-R1, R7, R10–R11, R23–R24, R28–R30; D49-AC091–110.** |

### 21. Testability, traceability, and proof

**Material concern: Yes.**

| What could go wrong                                                                                                                                                                                | Why it matters                                                                          | Severity | Likelihood | Evidence or reasoning                                                            | Effect on answer                                         | Best permanent fix                                                                                                                                                                 | Exact specification language   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Tests assert member rows or mocked sends but miss serial route races, requester multi-assignment exclusion, partial proof, privileged bypass, channel widening, lost responses, and accessible UX. | Implementation can pass while contacting the wrong person or creating a duplicate task. | Critical | High       | D49’s correctness is defined across source, identity, projections, and failures. | Adds stable requirement/AC IDs and outcome-driven proof. | Trace D49 through glossary/ADRs/OpenSpec/design/tasks/tickets/code/tests/release; deterministic barrier tests, RLS matrices, production corpus, and accessibility/usability proof. | **D49-R1–R30; D49-AC001–120.** |

### 22. Other development hazards

**Material concern: Yes.**

| What could go wrong                                                                                                                                                            | Why it matters                                                                                                          | Severity | Likelihood | Evidence or reasoning                                                                                             | Effect on answer                                  | Best permanent fix                                                                                                                                                                              | Exact specification language                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Support, AI, imports, restore, experiment cohorts, manual SQL, or an “urgent” channel bypasses the seal; analytics labels coordinators negligent based on reminder/read state. | Hidden privileged paths defeat founder intent, leak data, and convert a courtesy nudge into surveillance or escalation. | Critical | Medium     | Platform boundaries apply equally to assistants/support; D47 explicitly rejects escalation and awareness meaning. | Adds uniform no-exception and purpose boundaries. | Deny unregistered writers and broad exports; no force-send or sample cohort; preserve lineage on restore; no individual responsiveness scoring; require a new governed decision for escalation. | **D49-R14–R19, R21–R30; D49-AC051–080, AC101–120.** |

## Acceptance criteria

### Decision scope, current behavior, and alternatives

- **D49-AC001:** D49 is documentation-only and adds no runtime field, relation,
  enum, migration, RLS policy, API, event, job, flag, key, plan, preference,
  channel, task behavior, telemetry pipeline, or UI.
- **D49-AC002:** The recorded disposition is Accept with required amendments,
  and the exact corrected decision preserves founder Option 1 rather than
  silently substituting request-creation or delivery-time membership.
- **D49-AC003:** Repository verification proves no D43–D49 runtime exists and
  labels all described behavior intended/future rather than current/shipped.
- **D49-AC004:** Generic mission_control_task_reminders, assignee_profile_id,
  task due fields, and task engagement are explicitly non-authoritative and
  cannot be reused as D49 source or identity.
- **D49-AC005:** Contribution approval timestamp rounds, pending-row scans,
  broad approver resolution, notification rows, and synchronous email are
  explicitly nonprecedent.
- **D49-AC006:** The design record compares Option 1 against request-creation
  cohort plus narrowing as the strongest alternative and states why current
  responsibility wins.
- **D49-AC007:** Continuous per-channel re-resolution is rejected because it
  permits divergent audiences and makes delivery infrastructure a route owner.
- **D49-AC008:** The inherited zero-to-three outcome and one-to-three configured
  D44 cardinality are identified as a Core v1 product judgment, not a universal
  external best practice.
- **D49-AC009:** Every external source is primary/official, dated or current
  enough to verify, and used only for the claim it supports; vendor behavior
  never overrides Core ADR/OpenSpec authority.
- **D49-AC010:** Tests and copy preserve that the Access requests lane, D44 task,
  and initial in-product attention—not the courtesy reminder—own dependable
  work discovery.

### Source occurrence, binding instant, and atomic seal

- **D49-AC011:** One exact Tenant and D48-admitted D43 request episode has at
  most one permanent semantic reminder occurrence identity.
- **D49-AC012:** Occurrence uniqueness does not include the mutable D44 route or
  recipient generation, member set/digest, policy revision, cadence revision,
  Phase 17 key, channel, task, provider, event, dispatch, or Inngest run.
- **D49-AC013:** The recipient-binding instant is the successful authoritative
  Phase 12 seal commit and cannot be inferred from a nominal instant, wake,
  worker start, browser request, task/item creation, or provider timestamp.
- **D49-AC014:** Seal evaluation reads the canonical current D44 source policy,
  cutover/generation, complete member configuration, current D43 head, and
  current authorization facts—not lagging projections or caches.
- **D49-AC015:** A successful seal commits occurrence claim, terminal
  disposition, exact members or proved-zero evidence, source receipt/audit, and
  identifier-only handoff atomically. Indeterminate commits only the occurrence
  claim and immutable unreleased attempt evidence, with no seal or handoff.
- **D49-AC016:** A concurrent D44 route, D43 terminal, assignment, capability,
  requester mapping, or authorization change has one serial outcome with the
  seal or aborts/retries the complete source command; first D44 policy creation
  and D49 share a stable namespace even while the optional row is absent.
- **D49-AC017:** Before sealing members, the source re-proves that the exact
  request remains the current actionable D43 episode and retains its immutable
  D48 cadence-admitted disposition.
- **D49-AC018:** A committed seal whose response is lost returns the original
  occurrence, disposition, members/digest, receipt, and handoff on semantic
  replay even after route or policy changes.
- **D49-AC019:** Concurrent workers, manual replay, recovery scan, and duplicate
  events converge on the one product occurrence/claim; at most one can commit
  recipient evidence.
- **D49-AC020:** The durable handoff contains only schema-versioned safe
  identifiers and claim context; it contains no request reason, grant snapshot,
  provenance, person/contact data, rendered content, or authorization grant.

### Canonical D44 resolver, identity, and requester exclusion

- **D49-AC021:** The seal invokes one canonical D44 resolver rather than
  reimplementing eligibility inside reminders, Phase 17, Phase 6, or Inngest.
- **D49-AC022:** A sealed-members result contains one, two, or three unique
  unordered tuples of exact current D44 recipient-generation identity plus
  exact current Active Tenant Assignment and no profile, email, display name,
  role label, group, task assignee, or provider recipient.
- **D49-AC023:** The resolver evaluates the complete configured D44 candidate
  set and all required current facts; pagination, timeout, cache miss, or a
  partial worker page cannot define the cohort.
- **D49-AC024:** The exact subject assignment and every configured assignment
  resolving through trusted same-Tenant identity to the requester principal are
  excluded; email or display-name matching is forbidden.
- **D49-AC025:** Every admitted assignment independently passes current
  same-Tenant activity, D43 exact request scope, registered decision purpose,
  permissions.manage_grants, assignable ceiling, floor, source visibility, and
  compatible staff recipient prerequisites.
- **D49-AC026:** If two candidates are completely eligible and a third is
  completely ineligible, the exact two-member subset may seal and is not
  treated as incomplete proof.
- **D49-AC027:** Cross-Tenant relation, duplicate identity, ambiguous Party,
  stale head, missing requester mapping, contradictory authorization, corrupt
  evidence, or over-limit membership is indeterminate rather than truncated or
  ignored.
- **D49-AC028:** No result falls back to Owner/Admin, all grant managers,
  original grantor, auditor, read-only reviewer, manager, Team/group, prior
  recipient, Website/Mobilize coordinator, support, AI, or service role.
- **D49-AC029:** Downstream mapping of a sealed assignment to current Tenant,
  Party, registered role, and staff surface can suppress that descendant but
  cannot change or widen source membership.
- **D49-AC030:** Stored profile IDs, email addresses, display names, locale,
  task rows, provider destinations, directory aliases, and historical Party
  mappings never resolve D49 identity.

### Resolver algebra, terminal seals, indeterminate, and narrowing

- **D49-AC031:** The resolver algebra returns exactly sealed_members,
  sealed_proved_zero, or recipient_resolution_indeterminate; only the first two
  close a seal, while indeterminate remains unreleased/nonterminal with
  immutable attempt evidence; unknown/legacy values release nobody.
- **D49-AC032:** Complete proof that no eligible non-requester assignment exists
  seals proved zero with empty membership and durable source evidence.
- **D49-AC033:** Proved zero is terminal for the one occurrence; later route,
  assignment, authorization, preference, channel, or policy change creates no
  member, retry, or successor reminder.
- **D49-AC034:** Timeout, partial enumeration, stale/contradictory head,
  unavailable authorization floor, ambiguous identity, corrupt relation, or
  over-limit state produces indeterminate rather than zero.
- **D49-AC035:** Indeterminate releases no known eligible subset, presentation,
  intent, provider submission, task mutation, fallback, or Tenant-facing sent
  claim.
- **D49-AC036:** Every indeterminate retry uses the same permanent occurrence
  identity and, if complete proof later succeeds, seals the complete cohort
  current at that successful source commit; no earlier attempt is a closed
  disposition or released audience.
- **D49-AC037:** Only a separately ratified D50 usefulness fence may end
  unresolved indeterminacy; retry count, worker timeout, trace retention, or
  operator impatience cannot invent a member or second occurrence.
- **D49-AC038:** Every descendant audience is mathematically a subset of the
  immutable source seal and can never union a newly current replacement.
- **D49-AC039:** Before first irreversible presentation/submission for one
  member, gap-free continuation of the exact sealed D44 recipient generation
  and assignment, current D43 actionability, authorization, requester
  exclusion, mapping, and channel gates all re-prove; any false/unknown gate
  suppresses.
- **D49-AC040:** Provider-accepted delivery remains truthful irreversible
  evidence after later route loss; no recall is claimed, no further effect is
  authorized, and current protected detail still requires fresh access.

### Lifecycle, route churn, races, and idempotent recovery

- **D49-AC041:** If the first D44 policy row or a successor route commits before
  D49’s serial point, the seal evaluates that complete current route and cannot
  use a missing-row read or lagging prior task/recipient projection.
- **D49-AC042:** If D49 commits before first D44 policy creation, it seals
  terminal proved zero; if it commits before a D44 successor, it may preserve
  the prior serially current cohort. Later policy changes only narrow
  descendants and never substitute members.
- **D49-AC043:** A D43 terminal result ordered before seal prevents member
  release and descendant creation.
- **D49-AC044:** A D43 terminal result ordered after seal suppresses every
  not-yet-irreversible descendant without deleting or rewriting the source
  occurrence/member history.
- **D49-AC045:** Assignment, scope, or capability loss ordered before seal
  excludes that candidate only when complete proof remains possible; otherwise
  the whole result is indeterminate.
- **D49-AC046:** Any gap in the exact sealed assignment or recipient-generation
  continuation after seal suppresses the affected member at every later effect
  gate; removal and re-addition never bridge the gap.
- **D49-AC047:** A recreated Active Tenant Assignment has a new identity and
  cannot inherit an old sealed membership, task engagement, item, preference,
  destination, or provider intent.
- **D49-AC048:** Eligibility restoration creates a fresh D44 generation where
  lawful but never revives an ended sealed member or adds it to the old
  occurrence.
- **D49-AC049:** In-product, email, push, Slack, Teams, Google Chat, digest, and
  other future descendants maintain independent outcomes while sharing the one
  immutable ceiling; success/failure/read state in one changes none of the
  others.
- **D49-AC050:** Projection, dispatch, executor, render, destination, or
  provider failure cannot roll back, duplicate, close, or reclassify the
  occurrence, D43 request, D44 responsibility, or task.

### Database, RLS, authorization, and Tenant safety

- **D49-AC051:** Every future D49 source/member/receipt/claim relation carries a
  non-null Tenant identity and every request/assignment/recipient-generation/
  member relationship proves the same Tenant through composite integrity.
- **D49-AC052:** Browser anon/authenticated roles receive no base-table insert,
  update, delete, or broad select grant for source seals, members, claims, or
  protected audit evidence.
- **D49-AC053:** Application-layer current session/Tenant/purpose/capability
  checks are primary and RLS independently denies cross-Tenant or unauthorized
  reads/writes; UI hiding is never the boundary.
- **D49-AC054:** Mutation policies protect both selected rows and resulting
  rows with correct USING and WITH CHECK behavior so an allowed update cannot
  retarget Tenant, request, occurrence, assignment, purpose, state, or actor.
- **D49-AC055:** ENABLE/FORCE RLS or an equivalent hardened pattern, least
  grants, pinned search paths, and owner/service/BYPASSRLS/worker/support/
  migration parity are release requirements.
- **D49-AC056:** Tenant, code-owned system actor/purpose, requester,
  source/request/route heads, occurrence, member assignment/generation,
  disposition, command identity, and audit attribution are derived from trusted
  server context. Automatic occurrence authority is not inherited from the
  human policy author’s permissions.manage_grants authority.
- **D49-AC057:** Caller-supplied expected heads or idempotency keys are only
  checked concurrency inputs; they cannot grant authority, select a member, or
  retarget the command.
- **D49-AC058:** Views, functions, RPCs, Realtime, caches, search, exports, and
  generated reports preserve the same exact Tenant/purpose/field ceiling and
  cannot bypass base-table RLS through definer or ownership behavior.
- **D49-AC059:** Sealed dispositions and membership evidence are immutable or
  equivalently append-only, retain history under restrictive deletion, and
  cannot be ordinarily edited or cascade-deleted by assignment/task/channel
  lifecycle.
- **D49-AC060:** Constraints and the one trusted writer make impossible or
  quarantinable: duplicate occurrence, duplicate member, zero with members,
  members outside one-to-three, indeterminate with released members, digest/
  count mismatch, cross-Tenant relationship, and mutable retargeting.

### Ownership, Tasks Hub, presentation, channels, and executor

- **D49-AC061:** Phase 12 alone owns reminder occurrence identity, recipient
  disposition, seal basis, member ceiling, and source audit.
- **D49-AC062:** The existing D44 source-backed task remains the only task
  identity; no source seal, member, retry, item, message, or provider result
  creates a second shared or recipient task.
- **D49-AC063:** D49 cannot set or infer task due/reminder dates, urgency,
  priority, assignment, status, completion, dismissal, snooze, read state,
  comments, or queue placement.
- **D49-AC064:** Phase 17 cannot create a reminder key, item, render, coalescing
  rule, engagement policy, or recipient through D49; a later registered
  contract consumes only the sealed ceiling and current authorization.
- **D49-AC065:** Phase 6 and providers own only later channel intent, submission,
  and outcome evidence; destination, preference, install, suppression, locale,
  or readiness never widens source membership.
- **D49-AC066:** Inngest may later wake or reconcile identifier-only work, but
  its 24-hour dedupe, run ID, step result, sleep, retry count, log, or dashboard
  history cannot own permanent occurrence/member identity.
- **D49-AC067:** Events and dispatch records carry only approved identifiers,
  schema/version, claim, and safe routing context; no request text, grant
  detail, provenance, authorization evidence, email, message body, or rendered
  payload is included.
- **D49-AC068:** D45 initial-email plan/preference or delivery never authorizes a
  reminder member or reminder channel and cannot be reused as D49 recipient
  evidence.
- **D49-AC069:** Lane-only, proved-zero, indeterminate, or channel failure leaves
  the complete permission-filtered Access requests lane and current D44 work
  truth independently available.
- **D49-AC070:** Requesters/holders receive no recipient list, reminder sent/read
  status, staff identity, or awareness claim; D49 changes no grant, request
  state, decision, access, or holder-safe history.

### UX/UI, privacy, accessibility, and field conditions

- **D49-AC071:** D49 adds no top-level page, tab, setting, picker, audience
  preview, task control, count, channel matrix, disabled placeholder, or
  send-again action.
- **D49-AC072:** If the complete feature later activates, a read-only
  **Recipients** row says **Access request coordinators responsible when the
  reminder occurs.** Its disclosure says **Later changes may stop delivery, but
  won't redirect that reminder. If no one qualifies, the request stays in
  Access requests.**
- **D49-AC073:** Ordinary policy UX exposes no sealed member names, audience
  count, requester/holder, request reason, eligibility explanation, or internal
  cohort/generation/digest terminology.
- **D49-AC074:** Any later safe recipient presentation says only that an access
  review is still waiting and links descriptively to current People & access
  status/actions after authentication.
- **D49-AC075:** Copy never claims Due, Overdue, Escalated, ignored,
  unresponsive, delivered, read, awareness, guaranteed reach, task creation,
  or access change.
- **D49-AC076:** Only a freshly authorized purpose-specific audit surface may
  reveal exact sealed assignments/basis; ordinary coordinator, holder, donor,
  missionary, CMS, and public surfaces cannot.
- **D49-AC077:** Save, conflict, indeterminate, recovery, and durable result
  statuses on any later control are programmatically announced without moving
  focus and are not toast-only.
- **D49-AC078:** Keyboard, screen reader, visible focus, error association,
  forced colors, target size, non-color semantics, reduced motion, and
  automated plus manual accessibility proof block release.
- **D49-AC079:** 320-pixel and 400-percent reflow, RTL/CJK expansion,
  localization, Tenant timezone display, low bandwidth, interrupted response,
  and mobile touch operation remain coherent with Base Maia/Base UI.
- **D49-AC080:** Carla’s possible D44 responsibility-update attention plus later
  reminder is documented as a D50 usefulness/recency consequence; D49 neither
  hides it nor adds an unratified cooldown/reset.

### Failure handling, observability, audit, and repair

- **D49-AC081:** Stale source/route/authorization evidence aborts the complete
  seal command and uses bounded whole-command retry; no async membership patch
  or partial commit is permitted.
- **D49-AC082:** Persistent indeterminate resolution records a typed body-free
  operational condition tied to the one occurrence, releases nobody, and is
  diagnosable without protected request content.
- **D49-AC083:** Ordinary complete proved zero is a valid terminal product
  outcome, not an incident, provider failure, missing task, or reason to page.
- **D49-AC084:** Impossible state—cross-Tenant member, widened descendant,
  duplicate seal, over-limit release, or contradictory terminal evidence—is
  quarantined, blocks new effects, and follows security/data-integrity incident
  response.
- **D49-AC085:** A committed source seal with missing dispatch is recovered from
  the product-owned ledger/receipt; repair never re-resolves or replaces the
  sealed cohort.
- **D49-AC086:** Executor outage, redeploy, replay, expired workflow logs, or
  provider outage leaves source truth valid and permits recovery through
  product claims without executor history.
- **D49-AC087:** Partial channel success records independent member/channel
  outcomes and retries only unspent product intents; it cannot resend accepted
  effects or make one channel’s result authoritative for another.
- **D49-AC088:** Any confirmed cross-Tenant or unauthorized presentation stops
  affected release, preserves evidence, assesses exposure, fences tokens/links
  where possible, and repairs forward without rewriting history.
- **D49-AC089:** Backup restore, import, projection rebuild, Party merge, or data
  repair preserves occurrence/member identities and dispositions and never
  derives membership from current routes or timestamps.
- **D49-AC090:** Support/runbooks expose read-only diagnosis and governed replay
  of claims; they provide no direct member edit, force-send, cohort replacement,
  zero-to-member conversion, or broad SQL recipe.

### Scalability, migration, rollout, rollback, and operations

- **D49-AC091:** One seal examines one current request/route basis and at most
  three configured candidates; it performs no Tenant staff, pending-request,
  task, notification, message, or historical-recipient scan.
- **D49-AC092:** Before activation, production-shaped explain/analyze, index,
  transaction, and lock-wait evidence meets a ratified source-command SLO; D49
  invents no unsupported latency target.
- **D49-AC093:** Load tests include concurrent route changes, terminal requests,
  assignment loss, zero, indeterminate retry, and duplicate workers across at
  least 10,000 current requests in many Tenants and 100,000 terminal requests
  in one Tenant without cross-Tenant or broad-scan behavior.
- **D49-AC094:** Performance and product analytics remain aggregate and
  purpose-limited; no per-coordinator response score, neglect label, hidden
  workload rank, location inference, or read surveillance is created.
- **D49-AC095:** Rollout installs deny-compatible readers, constraints, RLS,
  receipt inspection, and safe unknown-state handling before enabling one
  compatible source writer.
- **D49-AC096:** Mixed-version proof shows old readers deny/ignore the new
  occurrence safely, old writers cannot create it, and exactly one writer
  generation can seal.
- **D49-AC097:** No migration/backfill derives members for historical or current
  requests from D44 policy, task assignees, profiles, emails, timestamps,
  notification rows, logs, or current authorization.
- **D49-AC098:** Activation uses a bounded Tenant cohort and kill criteria only
  after D47–D50, source-specific OpenSpec, design, retention, content/channel,
  accessibility, security, and operational evidence are accepted.
- **D49-AC099:** A source kill switch stops new occurrence seals and new
  irreversible descendant effects while preserving requests, D44 work, tasks,
  existing receipts, accepted provider truth, and manual source-lane recovery.
- **D49-AC100:** Rollback is roll-forward compatible: it never deletes or
  rewrites committed occurrence/member/audit evidence and never claims to
  retract an accepted external effect.

### Testability, traceability, and independent proof

- **D49-AC101:** D49-R1–R30 and D49-AC001–AC120 retain stable identifiers across
  decision log, glossary, ADRs, OpenSpec, design, tasks, GitHub tickets,
  implementation, tests, and release evidence.
- **D49-AC102:** Positive tests prove one-, two-, and three-member complete
  seals, complete subset after proved ineligibility, requester exclusion,
  proved zero, and later descendant narrowing.
- **D49-AC103:** Negative tests prove no role/group/profile/email/task/provider
  lookup, no partial release, no truncation, no fallback, no later widening, no
  second task, and no holder/public disclosure.
- **D49-AC104:** Authorization tests cover same/cross Tenant, exact/wrong scope,
  requester multi-assignment, ended/recreated assignment, stale route,
  purpose/capability/ceiling/floor denial, browser revocation, RLS, owner,
  service, worker, support, migration, impersonation, and AI paths.
- **D49-AC105:** Deterministic database barriers prove both serial outcomes for
  route-versus-seal, terminal-versus-seal, assignment-loss-versus-seal, and two-
  worker races; no test depends on sleeps or wall-clock luck.
- **D49-AC106:** Idempotency tests cover lost source response, duplicate HTTP,
  duplicate dispatch, workflow replay beyond transport dedupe, provider timeout
  before/after acceptance, and recovery scan, always preserving one effect.
- **D49-AC107:** Migration tests cover old-code/new-readers, new-code/old-schema
  rejection, no backfill, corrupt/unknown disposition, restore, partial
  deployment, kill, and roll-forward repair.
- **D49-AC108:** Accessibility proof includes automated checks plus manual
  keyboard, screen-reader, focus/status, forced-colors, zoom/reflow, target-size,
  reduced-motion, localization, RTL/CJK, mobile, and low-bandwidth scenarios.
- **D49-AC109:** Production-shaped proof verifies bounded queries/indexes,
  Tenant-isolated flow control, no N-plus-one member/channel query, no
  unbounded retry, and unchanged source-lane/task operation during executor and
  provider outages.
- **D49-AC110:** Release evidence independently maps every requirement to a
  user-visible/domain outcome and includes query plans, race transcripts, RLS
  matrices, migration evidence, security review, usability research, runbooks,
  monitor readiness, and rollback drill.

### Monitor discipline, remaining decisions, and final proof

- **D49-AC111:** Every monitored risk names an exact signal, threshold, owner,
  and required response; a monitor name alone authorizes no schema, telemetry,
  alert, person score, or external service.
- **D49-AC112:** Any confirmed cross-Tenant member, presentation, provider
  submission, cache result, or audit disclosure has a zero-tolerance threshold
  and triggers security incident response.
- **D49-AC113:** Any sealed-members result outside one-to-three unique exact
  assignments, or any proved-zero/indeterminate result with members, has a zero-
  tolerance threshold and blocks release/effects.
- **D49-AC114:** Any descendant member not in the immutable seal, or any
  replacement/addition after seal, has a zero-tolerance threshold and disables
  the affected adapter.
- **D49-AC115:** Any second task, task reminder/date/status mutation, or task-
  derived occurrence/member has a zero-tolerance threshold and blocks release.
- **D49-AC116:** An indeterminate rate above two percent of at least 100
  resolution attempts in 24 hours, or any continuous 15-minute interval,
  pauses new descendant release for the affected scope while the source lane
  remains available.
- **D49-AC117:** Any proved-zero resurrection, same-occurrence reseal to a
  different set, or second occurrence for one request has a zero-tolerance
  threshold and triggers data-integrity incident response.
- **D49-AC118:** External vendor examples remain comparative evidence only; any
  proposal that conflicts with governing Core ADR/OpenSpec must identify and
  resolve the conflict before adoption.
- **D49-AC119:** D49 makes no assertion about cadence value, source anchor,
  elapsed versus calendar arithmetic, timezone/DST, late usefulness,
  indeterminate retry end, or route-change recency; D50 must choose them.
- **D49-AC120:** D49 succeeds only when one source-owned current D44 cohort is
  atomically sealed once, zero/unknown stay distinct, every descendant only
  narrows, no second task exists, and no runtime effect activates by implication.

## Named monitors without new telemetry authority

These are future release/audit obligations. D49 does not create a metric,
table, log field, alert, dashboard, or vendor. Before activation, design must
map each signal to approved product receipts, security audit, existing
aggregate observability, or a separately reviewed minimized addition.

The two non-zero numeric gates below—two-percent indeterminate health and
90-percent comprehension—are conservative initial Core product judgments, not
vendor or industry standards. Their pilot protocol, denominator, cohort,
instrumentation privacy, and baseline must be preregistered before activation;
a missing protocol is itself a failed gate. They pause rollout and trigger
diagnosis/research only and may never widen authorization, recipients, retries,
or delivery. Every safety invariant retains a zero-tolerance threshold.

| Signal                                                                                                                                                                                          | Threshold                                                                                                    | Owner                                        | Required response                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D49-PREMATURE-ARTIFACT-AUDIT** — D49-named runtime/schema/key/job/flag/UI/OpenSpec implementation artifact before the remaining decisions                                                     | Any occurrence                                                                                               | Architecture + Phase 12 Product              | Block release, remove the artifact, and prove no runtime/data effect occurred                                                                       |
| **D49-CROSS-TENANT-RECIPIENT-INCIDENT** — member, descendant, cache, export, or audit evidence crosses Tenant/environment                                                                       | Any confirmed occurrence                                                                                     | Security + IAM + Data Integrity              | Stop affected release, preserve evidence, assess exposure, fence access, notify under incident policy, and repair forward                           |
| **D49-SEAL-INVARIANT-BREACH** — released count outside 1–3, duplicate member, zero/indeterminate with members, or digest/count mismatch                                                         | Any occurrence                                                                                               | Phase 12 + Database + Data Integrity         | Quarantine the occurrence, block descendants, disable the writer, and repair from authoritative receipts                                            |
| **D49-AUDIENCE-WIDENING-BREACH** — descendant member absent from immutable seal or member replacement after seal                                                                                | Any occurrence                                                                                               | Notifications/Phase 6 + Security             | Disable the affected adapter, suppress unaccepted work, assess disclosure, and add a regression test before re-enable                               |
| **D49-DUPLICATE-OCCURRENCE-BREACH** — more than one semantic reminder occurrence for one D43 request episode                                                                                    | Any occurrence                                                                                               | Phase 12 + Workflow Platform                 | Stop new claims, preserve the first authoritative receipt, quarantine later effects, and repair uniqueness forward                                  |
| **D49-PROVED-ZERO-RESURRECTION-BREACH** — proved zero later gains a member, retry, or descendant                                                                                                | Any occurrence                                                                                               | Phase 12 + Data Integrity                    | Stop affected processing, restore terminal zero from receipt, and correct the writer/reconciler                                                     |
| **D49-REQUESTER-EXCLUSION-BREACH** — requester principal receives a sealed member through any current assignment                                                                                | Any occurrence                                                                                               | IAM + Access Product                         | Suppress unaccepted descendants, investigate identity mapping, assess disclosure, and block release                                                 |
| **D49-SECOND-TASK-BREACH** — reminder creates/mutates a second task or task reminder/date/status                                                                                                | Any occurrence                                                                                               | Tasks Hub + Access Product                   | Remove the invalid projection where safe, preserve D44 task truth, and block the producer                                                           |
| **D49-PRIVILEGED-PARITY-BREACH** — owner/service/BYPASSRLS/worker/support/AI path produces a result denied to the equivalent product command                                                    | Any occurrence                                                                                               | Security + Database + IAM                    | Disable the privileged path and prove authorization/RLS parity before restoration                                                                   |
| **D49-INDETERMINATE-HEALTH** — incomplete resolution rate                                                                                                                                       | More than 2% of at least 100 attempts in 24 hours for one environment, or any continuous 15-minute interval  | IAM + Phase 12 + Platform SRE                | Pause new descendant release for affected scope, retain the source lane, diagnose heads/mapping/RLS/dependency, and retry only original occurrences |
| **D49-HANDOFF-GAP** — committed sealed-members occurrence lacks either a retriable identifier-only dispatch claim or a governed terminal no-dispatch result                                     | Any reconciled occurrence                                                                                    | Workflow Platform + Phase 12                 | Repair the handoff from the source receipt without re-resolving membership and verify no duplicate effect                                           |
| **D49-PROVIDER-DUPLICATE** — more than one provider-accepted effect for one exact occurrence/member/channel semantic intent                                                                     | Any occurrence                                                                                               | Phase 6 + Provider Operations                | Stop the adapter, suppress unaccepted duplicates, preserve provider truth, assess disclosure/noise, and repair product claims                       |
| **D49-SENSITIVE-PAYLOAD-BREACH** — request reason, provenance, grant snapshot, contact address, rendered body, or authority evidence enters handoff/log/AI/analytics outside its governed owner | Any occurrence                                                                                               | Privacy + Security + Data Governance         | Stop egress, preserve incident evidence, purge where lawful, assess notifications, and tighten allowlists/retention                                 |
| **D49-PERFORMANCE-SLO** — source seal exceeds the later ratified source-command latency/lock SLO                                                                                                | Two consecutive five-minute windows above the ratified SLO or any safety fallback caused by timeout          | Phase 12 + Database + Platform SRE           | Pause rollout, retain lane/task operation, inspect query/lock plans, and never relax resolver completeness                                          |
| **D49-COMPREHENSION-GATE** — representative staff misunderstand current-at-seal, later narrowing, no second task, or no delivery guarantee                                                      | Below 90% correct comprehension in moderated testing, including mobile and assistive-technology participants | UX Research + Access Product + Accessibility | Keep the feature Reserved, simplify copy/IA, and repeat the study                                                                                   |

## Migration, rollout, rollback, kill, and repair

### D49 rollout now

1. Record only the corrected decision, owner/invariant/race matrices,
   D49-R1–R30, D49-AC001–AC120, and D50 question.
2. Add no runtime or OpenSpec implementation scenario through this decision.
3. Keep existing D43–D48 documentation truthful: no reminder is active.
4. Preserve Phase 17 census/manifest counts and current task/notification code.

### Future implementation sequence

1. Resolve D50’s clock, calendar, useful-lateness, indeterminate-ending, and
   route-change recency model.
2. Gather representative nonprofit/ministry evidence that one courtesy
   occurrence is useful and that the selected value/copy does not create
   pressure or duplicate attention.
3. Resolve later policy edit/Off/re-enable effects, exact content, in-product
   presentation, each optional external channel, preference/consent,
   suppression, retention, export/deletion, and operational ownership.
4. Add source-specific identity/access and outbound-communications OpenSpec
   requirements before implementation. Generic reminder or task requirements
   are insufficient.
5. Design the smallest Phase 12 source command and persistence shape; document
   same-Tenant constraints, RLS/grants/functions/views, serial behavior,
   immutable receipts, product claims, data retention, and executor boundary.
6. Implement deny-compatible readers and unknown-state handling first, then
   constraints/RLS/audit/repair inspection, then exactly one compatible writer.
7. Prove deterministic races, semantic replay, privileged parity, migration,
   accessibility, comprehension, performance, failure recovery, kill, and
   rollback against production-shaped data.
8. Activate a bounded Tenant cohort only after every monitor and runbook is
   ready; expand only with clean evidence.

### Migration and upgrade rules

- No historical/current request recipient backfill is permitted.
- No task, profile, email, Phase 17 row, provider record, log, or present D44
  route may be treated as historical seal evidence.
- A missing/unknown disposition is fail-closed and releases nobody.
- Mixed versions must have one writer and deny-compatible readers.
- Deployment order must not permit a descendant adapter before source claims
  and current authorization narrowing are enforceable.
- Schema evolution, if later chosen, is additive and history-preserving; member
  identity and semantic occurrence identity remain stable across versions.
- Vendor or executor replacement replays product claims, not route selection.

### Rollback and kill

A kill operation stops new source seals and all new unaccepted irreversible
descendant effects. It does not close D43 requests, remove D44 responsibility,
change tasks, delete receipts, change access, mark items read, or claim external
recall. Previously accepted provider outcomes remain historical truth. Rollback
therefore rolls forward to a disabled writer/adapter and preserves all source
evidence needed for repair or future safe resume.

### Repair

- Missing dispatch is recreated from the immutable occurrence/seal receipt.
- Duplicate dispatch or event is reconciled to the one product intent claim.
- Duplicate provider acceptance is preserved and treated as an incident; it is
  never hidden by deleting one result.
- Corrupt or widened membership quarantines the whole occurrence and blocks
  descendants; an operator cannot manually choose a replacement.
- Cross-Tenant or unauthorized exposure follows security incident response.
- Indeterminate proof retries only the same occurrence and never uses a manual
  member override.
- Restore/rebuild reconstructs projections from source evidence while
  preserving original membership and current narrowing.

## Ruthless synthesis

### Resolved before D49 is recorded

- “Current” is the successful Phase 12 seal commit, not a timer or channel.
- Each exact sealed member is a D44 recipient-generation/Active Tenant
  Assignment tuple, not person/contact presentation data.
- The D44 resolver is reused as one canonical complete source boundary.
- Proved zero is terminal; indeterminate is an unreleased nonterminal state
  with immutable attempt evidence and retains one occurrence for bounded retry.
- First D44 policy creation and D49 serialize through an absent-row-safe stable
  namespace, so D49-first seals zero and D44-first supplies the current cohort.
- Automatic source occurrence authority is code-owned and distinct from a
  human’s manage-grants authority to publish policy.
- A successful indeterminate retry uses the complete cohort current at that
  later successful seal; nothing had been released earlier.
- Every later effect may only narrow the seal and must reauthorize.
- Provider acceptance is irreversible evidence; local detail still revokes.
- No second task, task mutation, channel, message key, or D49 UI exists.
- Option 2 remains the strongest alternative; Option 3 remains rejected.

### Requirements that must enter future spec and design

- D49-R1–R30 and D49-AC001–AC120 without renumbering or semantic drift.
- Canonical terms, owner/invariant/state/race/failure matrices, requester
  exclusion, exact assignment identity, and zero/indeterminate algebra.
- Source atomicity, semantic identity, immutable membership, identifier-only
  handoff, product claims, current narrowing, provider irreversibility, and
  D44 task independence.
- Same-Tenant composite integrity, application authorization, RLS/grants/
  views/functions/RPCs, privileged parity, retention, privacy, export/deletion,
  migration, rollout, kill, repair, and evidence requirements.
- UX copy, no-count/no-name ordinary surface, recipient-safe meaning,
  accessibility, localization, mobile, and low-bandwidth proof.

### Implementation safeguards required

- One trusted Phase 12 mutation boundary; no generic CRUD or browser write.
- Product-database uniqueness and receipts beyond any transport dedupe window.
- Deterministic serial race handling and complete-command retry.
- Exhaustive resolver algebra with indeterminate explicitly unreleased and
  nonterminal, plus impossible-state quarantine.
- Downstream set-subset enforcement plus current authorization at irreversible
  effect.
- No broad scans, fallbacks, partial release, member override, manual replay, or
  historical backfill.
- Deny-first mixed-version rollout and roll-forward recovery.

### Risks allowed only under named monitoring

The only monitor-eligible residuals are operational indeterminate rate,
performance against a later evidence-backed SLO, handoff gaps, provider
duplicates, and staff comprehension. Cross-Tenant disclosure, requester
inclusion, invalid cardinality, audience widening, duplicate occurrence/task,
zero resurrection, privileged bypass, and sensitive-payload egress have zero-
tolerance thresholds and are incidents, not accepted risk.

## Exact final D49 decision to record

**Disposition: Accept with required amendments.**

> For a future D50-qualified reminder, Phase 12 may create at most one semantic
> source occurrence for one D48-admitted D43 request episode. Its successful
> authoritative source commit is the recipient-binding instant. In that commit,
> the canonical D44 resolver re-proves the exact current request, route,
> requester, assignment, eligibility, authorization, and purpose and atomically
> closes either a complete unordered one-to-three-member set of exact D44
> recipient-generation/Active Tenant Assignment tuples or complete proved zero.
> Indeterminate instead records immutable unreleased attempt evidence with no
> closed seal, member, handoff, or descendant.
>
> A concurrent route or source change has one serial result or forces complete
> retry. D49 and D44 policy publication share a stable absent-row-safe
> serialization namespace: D49-first lane-only proof seals terminal zero;
> D44-first supplies the complete current route. Proved zero is terminal.
> Indeterminate is nonterminal and never zero or a partial set;
> it retries only the same occurrence and, if proof later succeeds, seals the
> complete cohort current at that successful commit. Only D50 may define when
> an unresolved occurrence is no longer useful.
>
> The immutable sealed set is a maximum audience, never authority. Every later
> presentation or provider submission freshly re-proves current source,
> gap-free continuation of the exact responsibility generation and assignment,
> exact authorization, requester exclusion, identity mapping, and channel gates
> and may only suppress members. It may never add, replace, reroute, bridge a
> remove/re-add gap, or restore a member. Provider-accepted delivery cannot be
> recalled, while current authorization continues to protect source detail.
>
> D49 creates no second task and changes no task, request, grant, access,
> decision, initial attention, or engagement. It activates no cadence, clock,
> message key, channel, destination, preference, executor, schema, OpenSpec
> requirement, telemetry, setting, or UI. Phase 12 owns source occurrence and
> seal truth; D44 owns current responsibility; ADR-0183 owns task projection;
> ADR-0027/Phase 17 and Phase 6 own later presentation/delivery; Inngest, if
> used, remains identifier-only and replaceable. The occurrence is a registered
> code-owned system/source command derived from policy and source truth, not a
> human permissions.manage_grants command and never an impersonation of the
> policy author.

## D50 — What clock should create the one possible source reminder occurrence?

### Why this needs a separate decision

Suppose a D43 request commits Friday at 16:30 in the Tenant’s Bangkok timezone.
The weekend passes, Ana leaves, and Carla becomes responsible on Monday. A
future cadence value would otherwise mature while a workflow executor is
temporarily unavailable and resumes later. D49 says who may be sealed when the
source occurrence successfully commits; D50 must decide what temporal fact
makes that occurrence eligible, whether responsibility changes reset it, and
when a late attempt is no longer useful.

D50 does not choose a numeric cadence yet and does not create Due, Overdue,
SLA, escalation, neglect, or task-date meaning. Every option still requires one
source-owned instant, D43 current actionability, D48 admission, D49 recipient
rules, semantic idempotency, and a bounded usefulness fence.

### Option 1 — elapsed duration from the D43 source-creation commit — recommended

A later registered policy value is elapsed from the immutable D43 episode
creation commit and resolves to one absolute UTC instant. Weekend, timezone
display, D44 reassignment, task engagement, and worker restart do not reset or
recompute it. A late worker may claim the same occurrence only inside a
separately bounded useful-lateness window; outside it, the occurrence ends
without catch-up.

**UX/impact:** simplest and most predictable technical and user model. The
Tenant sees a duration, local display can explain the resulting instant, and
responsibility changes do not silently postpone attention. The tradeoff is that
Carla may inherit work near the occurrence and receive both ordinary D44
reassignment attention and the courtesy reminder unless the evidence-backed
usefulness rule later suppresses it.

### Option 2 — Tenant-local calendar window from request creation

The policy maps request creation into a Tenant-local calendar rule, such as a
later local-day window, with an explicit IANA timezone, DST ambiguity/gap
policy, timezone-change versioning, and late-usefulness rule.

**UX/impact:** can match office-day expectations, but ministries operate across
regions and field schedules; weekends, holidays, DST, timezone edits, and
translations add complexity that no current evidence requires.

### Option 3 — elapsed duration from the current D44 responsibility generation

The clock begins or resets whenever the current D44 recipient generation
changes, so Carla receives a fresh interval after taking responsibility.

**UX/impact:** reduces a reminder immediately after reassignment, but route
churn can postpone the occurrence indefinitely, coordinators can influence the
clock indirectly, and responsibility becomes temporal source truth contrary to
the D43/D49 ownership split.

### Recommendation and exact question

**My recommendation is Option 1 — one elapsed duration from the immutable D43
source-creation commit, resolved to an absolute UTC instant, never reset by
D44 changes, with a later evidence-backed useful-lateness fence.** It is the
smallest reliable model, keeps D44 routing out of temporal truth, handles
executor delay idempotently, and avoids business-calendar complexity until
real ministry evidence demands it.

Which D50 temporal model should Core record: **Option 1 — elapsed duration from
the D43 source-creation commit**, **Option 2 — Tenant-local calendar window from
request creation**, or **Option 3 — elapsed duration from the current D44
responsibility generation**?
