# Phase 24 D49 — Current Recipient Cohort at Source Occurrence Primary Research

**Date:** 2026-08-29
**Founder answer:** **Option 1 — at the one possible Phase 12 source reminder
occurrence, atomically resolve and seal the current D44 zero-to-three
coordinator cohort, then allow downstream paths to narrow only**

**Disposition:** **Accept with required amendments**
**Scope:** recipient binding, zero/indeterminate behavior, route and eligibility
churn, source ownership, downstream narrowing, recovery, UX, authorization,
privacy, and proof only; no reminder activation, clock, value, channel, schema,
runtime, OpenSpec, manifest, telemetry, or UI artifact

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

## Purpose and research standard

D49 resolves one dependency deliberately left open by D47 and D48: which D44
coordinators may become candidate recipients of the one possible courtesy
reminder for an admitted D43 request episode. The founder selected the current
D44 cohort at the source occurrence rather than the request-creation cohort or
a continuously changing delivery-time audience.

The attractive shorthand—“use whoever is current when the reminder runs”—is
not sufficient. It could mean a worker query, one query per channel, a cached
roster, a partially resolved set, or a broad fallback when nobody resolves. It
would also leave unclear whether a later coordinator can join an already
created occurrence, whether a former coordinator can re-enter after regaining
access, and whether zero means “nobody is eligible” or “the resolver failed.”
This document therefore tests and corrects the decision against current Core
authority, modern first-party product evidence, PostgreSQL/Supabase semantics,
HTTP recovery, accessible UX, and production-shaped failure modes.

Evidence labels are strict:

- **Repository fact:** verified in the current Core repository.
- **Verified external fact:** verified in current official first-party
  documentation.
- **Requirement inference:** necessary to satisfy a governing Core boundary.
- **Product judgment:** a deliberate Core choice where safe alternatives exist.
- **Assumption:** plausible but not yet established with representative
  ministry evidence.
- **Unresolved unknown:** requires a later founder, product, or source decision.

Vendor behavior is comparative evidence only. Core imports no vendor reviewer
fallback, campaign workflow, queue, task schema, email default, interval,
calendar, or provider behavior.

## Executive finding

**Accept with required amendments.** Option 1 best reconciles current
responsibility with stable, explainable delivery:

- Microsoft Entra snapshots access and reviewers at the beginning of each
  access-review instance; owner changes during the instance do not silently
  change that instance, and the contacted-reviewers API exposes the bounded
  notified set.
- Okta treats reassignment of an active review item as an explicit governed
  action with justification and history; delegation applies to future work
  unless existing items are separately reassigned.
- SailPoint, Salesforce, Contentful, Blackbaud, and Submittable similarly make
  reviewer assignment or reassignment explicit instead of letting each
  notification channel discover a different audience.
- PostgreSQL can provide one serial transaction result, constraints, and exact
  replay; Supabase warns that privileged paths bypass RLS and therefore require
  equivalent server-side authorization.
- W3C and mature design systems support persistent, programmatically announced
  results and restrained use of status surfaces rather than transient or noisy
  recipient feedback.

The corrected Core model does not copy Entra's creation-time snapshot. D44
already makes its current responsibility generation authoritative for pending
work and deliberately re-applies route changes to current requests. D49
therefore resolves the exact current D44 generation at the one source
occurrence, seals its complete unordered assignment-member result once, and
then permits only monotonic suppression. Coordinators added before the source
occurrence can participate; coordinators added after it cannot. Coordinators
proved ineligible at a later irreversible boundary are suppressed and cannot
re-enter that occurrence. A source-proved empty result is terminal and never
later “ages into” a recipient; an incomplete result releases nobody and retries
only the same occurrence.

This is not a second responsibility assignment. It creates no Tasks Hub task,
does not reassign the D44 task, grants no visibility or decision authority, and
does not make notifications or providers routing authorities. The complete
permission-filtered **Access requests** lane and D44 current tasks remain the
recovery and work truth.

## Exact corrected D49 decision

1. D49 selects one **occurrence-time current recipient cohort** for the single
   possible D47 courtesy-reminder occurrence of an exact D48-admitted D43
   request episode.
2. Phase 12 is the only owner of recipient resolution, occurrence identity,
   cohort evidence, member lifecycle, source cancellation, and terminality.
3. “Source occurrence” means one stable Phase 12 product occurrence admitted
   after every later-ratified D50 and policy precondition is satisfied. Its
   recipient-binding point is the first complete transaction that terminally
   seals the cohort or `proved_zero`; any earlier `indeterminate` attempts stay
   unreleased inside that same occurrence. It does not mean worker wake, HTTP
   arrival, task creation, notification rendering, provider preparation, or
   provider acceptance.
4. Before sealing any member, that source transaction freshly proves the exact
   same-Tenant D43 request episode is still actionable, its D48 source
   disposition admits the cadence, and the exact D44 responsibility generation
   and authorization inputs are current under one authoritative concurrency
   boundary.
5. The resolver consumes the exact current D44 responsibility generation for
   the request—not the configured roster, task assignees, or a reminder-owned
   rerun of routing—and revalidates D44's complete algebra: current same-Tenant
   Active Tenant Assignment, exact `permissions.manage_grants` scope and
   ceiling, Phase 12 floor, D43 visibility, exact source actionability, and
   requester exclusion.
6. The result is one complete unordered set containing zero to three unique D44
   assignment members. Profile IDs, email addresses, role names, groups,
   original grantors, managers, Owners, Admins, support users, and arbitrary
   eligible staff are never fallback inputs.
7. Every resolution attempt atomically commits the stable occurrence/current
   state, audit, and immutable attempt evidence. Only a successful terminal
   `sealed_members` or `sealed_proved_zero` resolution atomically commits its closed
   result, complete evaluated D44 generation/member evidence, source receipt,
   and any applicable identifier-only downstream handoff. `Indeterminate`
   commits attempt evidence only: no member or reminder handoff is created. No
   committed partial cohort exists.
8. Occurrence uniqueness excludes mutable recipient, route, policy, channel,
   executor, and provider identities. At minimum it is one stable courtesy-
   reminder slot for the exact Tenant/environment/request episode and reminder
   class.
9. Exact replay of a terminal resolution after a lost response returns the same
   occurrence, recipient disposition, and sealed member set even if D44 routing
   or eligibility has since changed. Each `indeterminate` attempt receipt is
   also immutable; a separately claimed retry may append a new attempt and
   advance the same unresolved occurrence, never rewrite the old attempt. A
   conflicting terminal member set under the same occurrence identity is
   rejected and quarantined rather than merged.
10. A complete current resolution with no admitted D44 member records
    `proved_zero`. It seals an empty terminal cohort, consumes the one occurrence
    slot, releases no descendant, and cannot be reopened by a later coordinator,
    restored eligibility, retry, replay, policy edit, worker, or support action.
11. A timeout, unavailable dependency, stale unresolved head, corrupt evidence,
    over-limit result, contradictory authorization result, or incomplete member
    enumeration is `indeterminate`, never `proved_zero`.
12. `indeterminate` is an unreleased, nonterminal state with immutable attempt
    evidence. It releases no member and no delivery work, falls back to nobody,
    and retries only the same product occurrence under bounded claims. No D44
    generation or member becomes sealed from incomplete proof. Each later
    attempt evaluates the then-current source generation; the first complete
    atomic result may become one sealed cohort, `proved_zero`, or a terminal
    source no-effect result before a separately ratified usefulness fence. It
    can never mint another occurrence.
13. A request terminal transition that wins before source cohort commit releases
    no reminder member. A cohort commit that wins first still grants no decision
    authority; every downstream irreversible effect must re-prove current source
    actionability and authorization and suppress if the request is no longer
    actionable.
14. D44 route or eligibility changes before the first complete terminal cohort
    seal—including while the stable occurrence is `indeterminate`—may affect
    the then-current generation and who is sealed. Changes after the seal
    cannot add, substitute, reroute, or resurrect a member.
15. Every later presentation or provider path starts only from the sealed
    member set and freshly proves the exact member still has current D44
    responsibility for the request plus the required same-Tenant assignment,
    purpose, capability, floor, source visibility, destination/contactability,
    preference/consent, suppression, and source usefulness at that path's
    irreversible boundary.
16. Each sealed member binds the exact D44 recipient-generation identity and
    Active Tenant Assignment that qualified together at source occurrence.
    Later proof can only narrow. A member can remain a gap-free continuing
    candidate, be terminally suppressed for that occurrence, or acquire
    monotonic effect evidence; no transition can add a new member or return a
    suppressed member to candidate.
17. A temporary inability to prove a sealed member's current eligibility is
    indeterminate for that member and releases nothing. It retries the same
    member claim until proof becomes eligible, proved ineligible, or the later
    usefulness fence closes; uncertainty is not permanent suppression and never
    permits fallback.
18. Source-level proof that a sealed member no longer has continuing D44
    responsibility, an active same-Tenant assignment, required EffectiveAccess,
    D43 visibility, or requester-safe eligibility terminally narrows that exact
    recipient-generation/assignment member across all unsubmitted descendants.
    Removal followed by re-addition, a successor recipient generation, restored
    eligibility, or a similar/new assignment is not gap-free continuation and
    cannot revive it. Channel-specific destination, contactability, preference,
    consent, or provider suppression closes only that exact channel
    effect; it does not erase the source member, suppress another independently
    admitted channel, or redirect the effect.
19. A coordinator added after the source occurrence receives ordinary D44
    current responsibility, its existing task, and D44 responsibility-update
    attention as applicable, but never joins this already sealed reminder.
20. A coordinator removed after the source occurrence loses D44 current
    responsibility through D44. Any unsubmitted reminder descendant is narrowed
    away; already accepted external delivery is immutable evidence and cannot be
    recalled or described as current assignment.
21. D49 creates no second task, task reminder, task assignment, task due date,
    unread reset, escalation, SLA, decision default, access mutation, or
    additional source occurrence.
22. Task completion, task assignment, notification engagement, channel
    preference, email outcome, provider state, worker state, cache, analytics,
    AI, or support tooling cannot choose or modify the sealed cohort.
23. The normal coordinator and holder UI does not expose the member list,
    fellow-recipient activity, delivery state, or protected D43 explanation.
    Purpose-authorized audit may expose the minimum historical evidence needed
    to explain who was sealed and why a member was later suppressed.
24. Events and executor handoffs contain Tenant, occurrence, dispatch, and safe
    routing identifiers only. They never carry names, email addresses, request
    explanations, D42 provenance, full member rows, or broad CRM payloads.
25. Tenant, source actor, request head, D44 route/responsibility head,
    authorization epoch, member recipient-generation/assignment identities,
    resolution state, and audit attribution are derived from trusted server and
    source context, never caller payload. The automatic occurrence is a
    product/system source command under its registered purpose; it is not a
    human route/policy publication and does not borrow `permissions.manage_grants`
    as execution authority.
26. Future persistence must enforce non-null Tenant scope, same-Tenant composite
    relationships, restrictive deletion, immutable occurrence/member identity,
    complete-set cardinality, grants plus RLS `USING`/`WITH CHECK`, forced or
    equivalent owner behavior, and privileged-path authorization parity. D49
    does not freeze table or SQL shape.
27. The one occurrence command uses a stable absent-row-safe serialization and
    uniqueness boundary shared with D44 route publication, plus consistent lock
    ordering across the request, occurrence, D44 generation, and relevant
    authorization evidence. If D49 wins while the optional D44 policy is absent,
    the complete shared-lane-only result seals `proved_zero`; a later D44 save
    cannot reopen it. If the D44 save wins first, D49 resolves that complete
    current generation. A worker-local mutex or `SELECT FOR UPDATE` on a missing
    optional route/occurrence row is insufficient.
28. Inngest may later wake or reconcile identifier-only work after product
    commit. Product claims and source receipts—not event IDs, function runs, or
    finite executor deduplication—own idempotency, recipient truth, and repair.
29. D49 adds no key, Delivery Step, channel, destination, preference, setting,
    schema, migration, worker, queue, cron, Inngest function, feature flag,
    telemetry, cache, UI control, or hidden placeholder now.
30. D50 remains authoritative for the clock and source-occurrence threshold.
    Later decisions separately own exact values, useful lateness, Off/edit/
    re-enable effects, stable message meaning, channel plan, and activation.

## Current behavior, intended behavior, and permanent path

| State                         | Verified position                                                                                                                                                                              | D49 consequence                                                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Current shipped behavior**  | D43–D49 are not shipped. Current generic tasks, demo bell content, finance approval timers, profile/role recipient queries, and direct email code are unrelated migration inputs.              | There is no current reminder audience to migrate and no runtime artifact to preserve.                                                     |
| **Current governing design**  | Phase 12 owns D43 requests and D44 responsibility generations; D44 applies routing changes to current pending work, while Tasks Hub and Notification Center remain projections.                | D49 must read current D44 source truth once and cannot delegate audience discovery to a projection.                                       |
| **Founder-selected behavior** | At the one possible source occurrence, seal the exact current zero-to-three D44 responsibility generation, then narrow only.                                                                   | Pre-seal changes count; post-seal changes never add. `proved_zero` is terminal; `indeterminate` is retryable no-release.                  |
| **Best permanent path**       | Implement a single Phase 12 source command only after D50 and later gates; commit one immutable audience receipt and identifier-only handoff; let each descendant apply fresh narrowing proof. | Current responsibility, stable audit, privacy, idempotency, and channel independence remain compatible without a generic workflow engine. |

## Governing Core evidence

| Repository evidence                                                                                                                                       | Verified finding                                                                                                                                                                            | D49 requirement                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [Phase 24 decision log](./phase-24-multi-site-management-decision-log.md)                                                                                 | D49 compared request-creation, source-occurrence, and continuously current delivery audiences; founder selected source occurrence.                                                          | Record the choice as a source boundary, not a worker convention.                                         |
| [D43 primary research](./phase-24-d43-governed-holder-access-review-primary-research.md)                                                                  | One exact source-owned pending episode and its heads govern holder review, withdrawal, and terminal resolution.                                                                             | One request episode can have at most one reminder occurrence and must be pending at source resolution.   |
| [D44 primary research](./phase-24-d44-access-request-coordinator-routing-primary-research.md)                                                             | D44 defines zero or one-to-three assignment members, exact current eligibility/requester exclusion, complete result algebra, lane-only fallback, and differential current-work application. | Reuse D44's exact resolver and generation; do not create a reminder-specific roster or broader fallback. |
| [D45 primary research](./phase-24-d45-optional-initial-email-primary-research.md)                                                                         | Immediate email is a separate optional descendant of initial D44 attention and never owns recipient or work truth.                                                                          | D49 does not enable email or let D45's initial audience become the reminder audience.                    |
| [D47 primary research](./phase-24-d47-bounded-tenant-reminder-cadence-primary-research.md)                                                                | One future courtesy-reminder class may have at most one occurrence per exact request episode; recipients, clock, and channel were separate.                                                 | Recipient membership cannot enter occurrence uniqueness or create another occurrence.                    |
| [D48 primary research](./phase-24-d48-new-request-only-cadence-application-primary-research.md)                                                           | Only post-boundary request episodes may be admitted; admission is immutable source evidence and no existing request ages in.                                                                | D49 consumes D48 admission but never changes or reconstructs it.                                         |
| [Phase 12](./phase-12-full-role-permission-configuration.md)                                                                                              | Recipient generations already bind exact request and policy/application heads; Tasks/notifications/executors have no raw route mutation grant.                                              | Source transaction seals exact assignment members with same-Tenant and expected-head proof.              |
| [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)                                                                             | D43/D44 are source-owned identity/access governance through EffectiveAccess; current runtime role gates are nonprecedent.                                                                   | Current Active Tenant Assignment and purpose-bound EffectiveAccess decide every member, not role labels. |
| [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)                                                                        | Tasks Hub projects current responsibility and cannot own reminders, recurrence, source completion, or access.                                                                               | D49 creates no task and never uses task assignment as recipient authority.                               |
| [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)                                                                          | Notification engagement is independent from source/task state; delivery descendants must reauthorize.                                                                                       | One sealed source audience feeds bounded attention descendants that may only narrow.                     |
| [ADR-0026](../../adr/0026-contract-bounded-delivery-plans.md)                                                                                             | Producers own occurrence eligibility and candidate recipients; Phase 6/17 compile finite steps but cannot invent audiences or waits.                                                        | Phase 12 supplies the complete sealed candidate set; every Delivery Step remains downstream.             |
| [Identity and Access OpenSpec](../../../openspec/specs/identity-and-access/spec.md)                                                                       | Identity, Tenant, role, and capability resolve server-side; application checks are primary and RLS defense-in-depth.                                                                        | Caller-selected recipients and RLS-only authorization are forbidden.                                     |
| [Workflow OpenSpec](../../../openspec/specs/workflow-orchestration/spec.md)                                                                               | Product records and claims remain authoritative; events are identifier-only and Inngest is replaceable.                                                                                     | Executor replay cannot re-resolve or expand the cohort.                                                  |
| [Platform principles](../../../openspec/specs/platform-principles/spec.md) and [platform boundaries](../../../openspec/specs/platform-boundaries/spec.md) | Tenant/permission safety outrank convenience; CRM owns permission-sensitive operational workflow.                                                                                           | No CMS, provider, AI, or cross-surface shortcut may broaden recipient truth.                             |
| [Frontend rules](../../../docs/ai/rules/frontend.md) and [Base Maia UI configuration](../../../packages/ui/components.json)                               | Future UI uses shared `@asym/ui`, Base UI, Base Maia/Zinc semantics, accessible forms/status, and no app-local design fork.                                                                 | D49 adds no UI now; later explanation and audit use existing quiet patterns.                             |

## Current official external evidence

### Identity and access governance

| Official source                                                                                                                              | Verified fact                                                                                                                                                                                                                                                                                          | D49 implication                                                                                                             | Evidence limit                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Microsoft Entra — create an access review](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)                      | Each review instance captures a snapshot of users, resources, and reviewers at its start. Group-owner changes during an instance do not add new owners or remove old owners from that instance; later recurrences reevaluate. The contacted-reviewers API exposes who was or would have been notified. | Strong evidence for one bounded audience per occurrence/instance and immutable historical recipient evidence.               | Core deliberately resolves at its own source occurrence and then applies stricter fresh authorization narrowing; it does not copy Entra's review lifecycle or fallback reviewers. |
| [Microsoft Entra — access-review FAQ](https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-faqs)                             | User assignment, group membership, and reviewer changes after a review starts are reflected only in the next instance.                                                                                                                                                                                 | Supports preventing post-occurrence membership broadening.                                                                  | D47 allows only one occurrence, so Core has no next reminder instance for the same request.                                                                                       |
| [Microsoft Entra — deployment planning](https://learn.microsoft.com/en-us/entra/id-governance/deploy-access-reviews)                         | Administrators choose one or more reviewers and audit review activity; notification planning is separate from who reviews.                                                                                                                                                                             | Supports separating reviewer truth, notification, and audit.                                                                | Entra roles and licensing do not define Core authorization.                                                                                                                       |
| [Okta — reassign review items](https://help.okta.com/en-us/content/topics/identity-governance/access-certification/iga-reassign-reviews.htm) | Reassignment is explicit, constrained, justification-bearing, historical, and can notify the new reviewer; self-review restrictions still apply.                                                                                                                                                       | Route change should be source-governed and auditable, not a channel-time substitution.                                      | D49 is not an admin reassignment feature and permits no post-occurrence addition.                                                                                                 |
| [Okta — governance tasks for delegates](https://help.okta.com/en-us/content/topics/identity-governance/complete-governance-tasks.htm)        | Delegation reroutes future governance work, while existing reviews/tasks remain until explicitly reassigned.                                                                                                                                                                                           | Strong evidence that “current person” is not safely inferred for already-created work without a separate source transition. | Core's D44 already governs current responsibility application; D49 only binds one reminder audience.                                                                              |
| [SailPoint — requesting access](https://documentation.sailpoint.com/saas/user-help/requests/request_center.html)                             | Access requests can require multiple reviewers, and configured source workflow may reassign when an assigned reviewer does not act.                                                                                                                                                                    | Reviewer responsibility and reassignment belong to access-governance source logic.                                          | Core rejects automatic reassignment, escalation, and no-response action here.                                                                                                     |

### CRM, CMS, nonprofit, and comparable work systems

| Official source                                                                                                                                                                         | Verified fact                                                                                                                                                                            | D49 implication                                                                                                                         | Evidence limit                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [Salesforce — approval work items](https://help.salesforce.com/s/articleView?id=platform.automate_automated_approvals_concepts_work_items.htm&language=en_US&type=5)                    | An open approval work item can be explicitly reassigned; the work item retains assigned/completed milestones, and email is a separate notification path.                                 | Source work assignment and delivery are distinct facts; replacement is an explicit transition with history.                             | Salesforce's queue/group routing and approval-by-email are not admitted.                        |
| [Salesforce mobile approvals](https://help.salesforce.com/s/articleView?id=000387352&language=en_US&type=1)                                                                             | Approval work remains discoverable in-product and may also use push/email; only approvers with record access can act in mobile, while email can still reach users without record access. | Confirms multi-surface attention and illustrates why Core must reauthorize before every presentation or external send.                  | Salesforce's email footgun is evidence to reject, not copy.                                     |
| [Contentful — entry tasks API](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)                                                               | Task reassignment explicitly notifies old and new assignees, but the API does not ensure an assignee can read the entry.                                                                 | Assignment changes and notifications are separate; Core must improve by intersecting recipient and source visibility at every boundary. | Content tasks are not access governance, and D49 creates no task.                               |
| [Contentful — tasks](https://www.contentful.com/help/content-and-entries/tasks/)                                                                                                        | Assigned work is visible in a pending-tasks surface and separately triggers email.                                                                                                       | Persistent work discovery must not depend on reminder delivery.                                                                         | Contentful teams/broadcasts and due dates are not Core's model.                                 |
| [Blackbaud Grantmaking — Reviews](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/reviews.html)                                                          | Nonprofit grant staff explicitly assign one or more reviewers, control visibility, and configure notifications; permissions govern who may assign or decide.                             | Comparable nonprofit software separates reviewer assignment, visibility, decision authority, and notification.                          | Grant-review committees and external reviewers are broader than D44's bounded internal cohort.  |
| [Submittable — reassign declined review assignments](https://next.support.submittable.com/hc/en-us/articles/30263970902679-Reassign-Declined-Review-Assignments)                        | A program owner explicitly adds a replacement reviewer after a declined assignment and receives a confirmation.                                                                          | Replacement is deliberate source work, not automatic per-channel audience refresh.                                                      | Submittable submissions are not Core access requests.                                           |
| [Submittable — unassign reviewers](https://next.support.submittable.com/hc/en-us/articles/42431962022423-What-s-New-for-August-Unassign-Reviewers-Amendment-Terminations-and-MUCH-more) | Current product guidance preserves completed/in-progress reviews and suppresses unnecessary notifications when reassignment changes workload.                                            | Historical evidence and anti-noise behavior should survive current-routing changes.                                                     | This is product-release guidance, not a security contract; Core uses its own source invariants. |

No current first-party online-giving or e-commerce source located in this review
establishes a better recipient-binding rule for sensitive access-governance
work. Payment/webhook recipient patterns have materially different legal,
financial, and provider semantics. Treating their delivery contacts as reviewer
authority would be false comparability, so D49 imports no e-commerce audience
model.

### PostgreSQL, Supabase, HTTP, and accessible UX

| Official source                                                                                           | Verified fact                                                                                                                                 | D49 implication                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [PostgreSQL 18 — transaction isolation](https://www.postgresql.org/docs/current/sql-set-transaction.html) | `READ COMMITTED` takes statement snapshots; `SERIALIZABLE` rejects executions that cannot correspond to one serial order.                     | “Current at occurrence” needs one source transaction and bounded whole-transaction retry, not several channel queries.                                         |
| [PostgreSQL 18 — `SELECT`](https://www.postgresql.org/docs/current/sql-select.html)                       | Locking clauses lock selected rows but have concurrency and ordering caveats.                                                                 | Locking existing members alone cannot protect an absent occurrence or prove a complete set; design needs a stable uniqueness/serialization boundary.           |
| [PostgreSQL 18 — constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)               | Unique, check, and foreign-key constraints can make invalid row states unrepresentable.                                                       | Same-Tenant relationships, one occurrence slot, member uniqueness, and closed disposition/cardinality rules belong in database invariants where representable. |
| [PostgreSQL — row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)                 | `USING` constrains visible/existing rows and `WITH CHECK` constrains inserted/updated rows; owners and `BYPASSRLS` need deliberate treatment. | A permitted update must not retarget a cohort or member into another Tenant/request, and privileged paths need equivalent checks.                              |
| [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)    | Grants and RLS are separate controls; views can bypass policies by default; secret/service roles bypass RLS.                                  | Browser grants stay revoked, views/functions are audited, and service paths invoke the same authorization contract.                                            |
| [Supabase — securing the Data API](https://supabase.com/docs/guides/api/securing-your-api)                | Exposed objects require both grants and RLS; functions need explicit `EXECUTE` review and `SECURITY DEFINER` review.                          | No raw member relation or broad RPC may become a recipient enumeration oracle.                                                                                 |
| [RFC 9110 — idempotent methods](https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods)      | Automatic retry of a non-idempotent request is unsafe unless its application semantics are known idempotent or non-application is proven.     | The occurrence command needs a durable business idempotency identity and replay receipt across lost responses.                                                 |
| [RFC 9457 — Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html)                                 | Typed problem details can provide stable machine-readable failures but must not expose sensitive implementation or personal information.      | Stale, indeterminate, and authorization results need typed privacy-minimal responses, not ad hoc strings or member leakage.                                    |
| [W3C WCAG 2.2 — Reflow](https://www.w3.org/TR/WCAG22/#reflow)                                             | Content must reflow without two-dimensional scrolling at 320 CSS pixels/400% zoom except genuine exceptions.                                  | Future audit/status and coordinator surfaces must work as stacked content, not wide recipient tables.                                                          |
| [W3C — Status Messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages)                      | Status results must be programmatically determinable without forcing focus.                                                                   | Source action confirmations and recovery states require persistent semantic status, not toast-only feedback.                                                   |
| [W3C — Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible)                          | Keyboard users need a visible focus indicator.                                                                                                | Any future disclosure, audit link, or retry control must preserve Base Maia focus behavior.                                                                    |
| [GOV.UK — notification banner](https://design-system.service.gov.uk/components/notification-banner/)      | Banners should be used sparingly; directly relevant information belongs in main content, and competing banners create noise.                  | D49 recipient mechanics belong in contextual help/audit, not a permanent warning banner or coordinator interruption.                                           |
| [GOV.UK — status tags](https://design-system.service.gov.uk/components/tag/)                              | Status tags should be few, descriptive, noninteractive, and research-backed.                                                                  | Do not create a noisy badge taxonomy for sealed, narrowed, zero, or indeterminate in ordinary user surfaces.                                                   |

## Evidence synthesis

### Verified conclusions

1. Stable review-instance audiences and explicit reassignment are current,
   proven patterns in IAM, CRM, CMS, and nonprofit-review products.
2. Current products also demonstrate material footguns: fallback reviewers,
   queue broadcast, email to people lacking record access, or assignees without
   source visibility.
3. Core's governing model is stricter: current D44 assignment eligibility and
   D43 source visibility must be proved before a person enters the cohort and
   again before an irreversible descendant effect.
4. One complete source transaction is required to make “current” falsifiable.
   Several reads or one read per channel cannot provide one explainable cohort.
5. Stable occurrence identity must not include recipients because mutable route
   changes would otherwise mint another business occurrence.
6. `proved_zero` and `indeterminate` are different facts with different safe
   recovery. Conflating them can either strand valid attention or leak it to a
   guessed fallback.
7. Post-occurrence narrowing is compatible with current authorization. Post-
   occurrence broadening is not compatible with one stable cross-channel
   audience or exact replay.
8. Tasks Hub, Notification Center, email, chat, push, Inngest, and providers can
   all fail independently without changing the source recipient receipt.

### Product judgments

- Resolve at the source occurrence, not at request creation, because D44 already
  declares current responsibility authoritative for pending work.
- Seal assignment identities rather than contact destinations. Destinations and
  preferences are channel-specific current facts and can only narrow later.
- Treat complete zero as terminal for the one occurrence. Adding a later
  coordinator to an old occurrence would be broadening and would make route
  timing a hidden reschedule.
- Let a genuinely indeterminate source resolution retry the same occurrence.
  Treating technical uncertainty as zero would silently discard a valid nudge.
- Preserve one ordinary D44 task and lane. The reminder is attention, not work
  assignment, and must not create a second task.
- Do not expose recipient names or delivery history to ordinary coordinators or
  holders. Shared recipient awareness is not needed to act and increases
  privacy and social-pressure risk.

### Assumptions and unresolved unknowns

- **Assumption:** representative ministries will understand a one-time reminder
  aimed at current coordinators better than one aimed at original coordinators.
  Verify through moderated tests with small, large, distributed, and low-
  bandwidth Tenant staff.
- **Assumption:** the occasional overlap between D44 reassignment attention and
  a near-in-time courtesy reminder is less harmful than omitting every current
  owner. Verify with notification-volume and comprehension research before
  activation.
- **Unknown:** the exact D50 clock, anchor arithmetic, and useful-lateness fence.
- **Unknown:** evidence-backed non-Off cadence values and whether the feature
  should ever graduate from D46's no-reminder baseline.
- **Unknown:** later Off/edit/re-enable behavior for already-admitted requests
  and unresolved occurrences.
- **Unknown:** stable message meaning, safe content, and which presentation or
  external channel—if any—passes Phase 17/6 admission.
- **Unknown:** whether production volumes justify staged cohort persistence; a
  zero-to-three result does not justify a generic fanout engine now.

## Source of truth, ownership, and invariants

| Fact                                  | Authoritative owner                                                                             | Derived consumers                                    | Forbidden owner                                         |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------- |
| D43 request episode/actionability     | Phase 12 source request                                                                         | Tasks, notifications, delivery fences, audit views   | Task, notification, worker, provider                    |
| D48 cadence admission                 | Phase 12 request receipt                                                                        | D49/D50 evaluator, audit                             | Current policy join, age scan, worker                   |
| Current D44 responsibility generation | Phase 12 D44 route/application source                                                           | Tasks, responsibility-update attention, D49 resolver | Task assignees, email list, role/group labels           |
| One D49 occurrence identity           | Phase 12 source occurrence                                                                      | Product dispatch ledger, Phase 17/6 descendants      | Recipient, event, run, channel, provider                |
| D49 resolution disposition            | Phase 12 occurrence receipt                                                                     | Operations/audit and safe downstream claims          | Timeout interpretation, empty query result              |
| Sealed zero-to-three member set       | Phase 12 occurrence member receipt derived from the exact current D44 responsibility generation | Purpose-bound presentation/delivery compilers        | Configured-roster/task/current-route query after commit |
| Current member eligibility            | EffectiveAccess/Phase 12 at each boundary                                                       | Narrowing decision/evidence                          | Sealed membership alone                                 |
| Task responsibility                   | D43/D44 source projected under ADR-0183                                                         | Tasks Hub UI                                         | D49 reminder or delivery                                |
| Notification engagement               | ADR-0027 presentation                                                                           | Notification Center only                             | Source request/task/recipient truth                     |
| Destination, consent, preference      | Phase 6/17 and channel-owned current evidence                                                   | One channel step                                     | D49 source member identity                              |
| Provider delivery                     | Provider plus Phase 6 evidence                                                                  | Status/reconciliation                                | Source occurrence or responsibility                     |

The following invariants must always hold:

1. At most one source reminder occurrence exists per exact Tenant/environment/
   D43 episode/stable reminder class.
2. Exactly one closed D49 resolution disposition belongs to a terminally
   resolved occurrence: `sealed_members` or `sealed_proved_zero`;
   `recipient_resolution_indeterminate` is non-releasing and non-terminal until
   a later terminal source outcome.
3. A `sealed_members` occurrence has exactly one to three unique unordered D44
   assignment members; `sealed_proved_zero` has exactly zero; no other cardinality is
   valid.
4. All occurrence/member/request/assignment/policy relationships are same-
   Tenant and cannot be retargeted.
5. A member binds the evaluated D44 recipient-generation identity and exact
   Active Tenant Assignment plus admission proof; it does not grant
   EffectiveAccess.
6. The sealed source set can remain or shrink for source eligibility. It can
   never grow, replace a member, or reopen a source-suppressed member. A channel
   may independently narrow its own effect without mutating source membership
   or another channel.
7. Exact replay returns the original complete set and disposition.
8. No projection, cache, current-route join, import, restore, or worker can
   reconstruct missing members after commit.
9. Zero and indeterminate are never interchangeable.
10. One reminder occurrence creates zero additional Tasks Hub tasks.
11. Every irreversible effect has both sealed membership proof and fresh
    current source/authorization/channel proof.
12. Protected request text and detailed provenance never leave Phase 12 through
    the member receipt or identifier-only handoff.

## Recipient lifecycle algebra

### Occurrence-level states

| State                                | Meaning                                                                                                                | Permitted next state                                                                                                                                               | Forbidden behavior                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `not_created`                        | No source occurrence has won the stable slot.                                                                          | Later source command may establish the slot if every later-ratified precondition holds.                                                                            | Worker/channel fabricates a slot.                                     |
| `resolving`                          | One product claim is evaluating exact source and D44 heads.                                                            | `sealed_members`, `sealed_proved_zero`, `recipient_resolution_indeterminate`, or source no-effect.                                                                 | Release partial members.                                              |
| `recipient_resolution_indeterminate` | Complete current membership could not be proved; immutable attempt evidence exists but no generation/member is sealed. | Append a separately claimed attempt against then-current source truth in the same slot, reaching a complete result or later terminal no-effect/usefulness closure. | Rewrite an attempt, treat as zero, fall back, or create another slot. |
| `sealed_members`                     | Exact one-to-three member set committed.                                                                               | Descendant member states may only narrow.                                                                                                                          | Add/replace/re-resolve members.                                       |
| `sealed_proved_zero`                 | Complete proof found zero eligible members.                                                                            | Terminal.                                                                                                                                                          | Add a later coordinator or retry into nonempty.                       |
| `source_no_effect`                   | Source terminality or another later-ratified fence prevents the occurrence.                                            | Terminal.                                                                                                                                                          | Resurrect after route or policy change.                               |

### Member-level states

| State                    | Meaning                                                                                                                                           | Permitted next state                                                                                                          | Forbidden behavior                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `sealed_candidate`       | Exact D44 recipient-generation/Active Tenant Assignment pair was in the terminally sealed cohort.                                                 | Remain a gap-free candidate, become temporarily indeterminate, become `source_suppressed`, or gain monotonic effect evidence. | Treat sealed membership as authorization.                                                     |
| `proof_indeterminate`    | Current source/member/channel proof is incomplete.                                                                                                | Retry same member claim; return to candidate only on complete eligible proof; expire later under a ratified fence.            | Send, substitute, or fall back.                                                               |
| `source_suppressed`      | Complete source proof establishes the member no longer has gap-free current D44 responsibility/authorization.                                     | Terminal across all still-unsubmitted descendants for this occurrence.                                                        | Re-add after a gap, successor generation, or eligibility return.                              |
| `channel_suppressed`     | Complete channel proof blocks one destination/effect for preference, consent, contactability, quiet-time, provider, or equivalent channel reason. | Terminal only for that exact channel effect.                                                                                  | Erase source membership, suppress another channel, or redirect to another person/destination. |
| `prepared`               | A channel-specific reversible preparation boundary has been crossed.                                                                              | Suppress if still reversible or proceed through channel contract.                                                             | Claim provider acceptance.                                                                    |
| `submitted_or_presented` | Irreversible effect has evidence.                                                                                                                 | Reconcile monotonically.                                                                                                      | Recall, reroute, or create another occurrence.                                                |

The labels above describe required semantics, not mandated enum or table names.

## Race and lifecycle matrix

| Scenario                                                                                 | Required result                                                                                                                                       |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ana leaves and Carla is added before occurrence transaction                              | Current D44 generation may seal Ben and Carla; Ana is excluded.                                                                                       |
| Carla is added after sealed Ben-only occurrence                                          | Carla gets ordinary D44 task/update attention but never joins this reminder.                                                                          |
| Ana is sealed, then leaves before any descendant effect                                  | Fresh proof terminally suppresses Ana; nobody substitutes.                                                                                            |
| Ana is temporarily unverifiable, then proof recovers eligible                            | No effect while indeterminate; same member claim may resume if still useful.                                                                          |
| Ana is proved ineligible, then is removed/re-added or receives a new eligible assignment | The original generation/assignment member stays suppressed; a gap or successor identity cannot join.                                                  |
| Complete D44 resolution returns zero                                                     | Commit `proved_zero`; no fallback and no future resurrection.                                                                                         |
| D49 resolves while optional D44 policy is absent and a coordinator save races            | Shared serialization decides: D49-first seals `proved_zero`; D44-first exposes the complete winning current generation.                               |
| Resolver times out after reading one of three configured members                         | Commit/retry `indeterminate`; release none, never the partial one.                                                                                    |
| D44 route changes while the occurrence is `indeterminate`                                | No incomplete generation was sealed; the next claimed attempt evaluates the then-current source generation, and only its first complete result seals. |
| D44 result unexpectedly contains four or duplicate members                               | Constraint/command rejects as indeterminate or invariant failure; no release.                                                                         |
| Request terminal commit wins before occurrence                                           | No member release; source occurrence resolves no-effect under later lifecycle contract.                                                               |
| Cohort commit wins just before request terminal commit                                   | Sealed history remains, but all later effects recheck source and suppress.                                                                            |
| Two occurrence commands race                                                             | Stable product uniqueness and serialization yield one receipt; loser replays it.                                                                      |
| Response is lost after cohort commit and route changes                                   | Retry returns the original cohort; it does not re-resolve current D44.                                                                                |
| In-product and email claims race for same member                                         | Both consume the same member identity; each channel has its own bounded effect identity and fresh proof, never a new audience.                        |
| Email provider accepts just before coordinator removal                                   | Provider acceptance remains evidence; removal cannot recall it, and later channels suppress as applicable.                                            |
| Cross-Tenant cache/key collision                                                         | Runtime tenant branding and database composites deny uniformly; no member data is exposed.                                                            |
| Requester becomes a configured coordinator before occurrence                             | D44 requester exclusion removes the requester from the complete result.                                                                               |
| Requester identity cannot be proved                                                      | Result is indeterminate; no partial cohort or fallback.                                                                                               |
| Restore or projection rebuild finds an old occurrence                                    | Rebuild from immutable receipt; never query current D44 to fill or change members.                                                                    |
| Support attempts to add a missed recipient                                               | Reject; repair cannot broaden a committed set.                                                                                                        |
| Later policy edit occurs after seal                                                      | Cohort is unchanged; effect of policy edit belongs to a later decision.                                                                               |
| D50 worker wakes late                                                                    | D49 membership is unchanged; later usefulness/source fences decide whether any effect remains permissible.                                            |

## Failure, recovery, and repair matrix

| Failure point                                                               | Safe behavior                                                                                  | Recovery evidence                                                                         |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Before source transaction commits                                           | No occurrence/member exists.                                                                   | Same idempotent command may retry against current source truth.                           |
| After complete source commit, before response                               | One receipt exists.                                                                            | Return exact receipt by business idempotency identity.                                    |
| Occurrence header would commit without complete member disposition          | Transaction rolls back; no descendant is claimable.                                            | Database atomicity plus invariant audit.                                                  |
| Applicable downstream handoff fails after a terminal nonempty source commit | Source receipt remains authoritative and unmodified.                                           | Product dispatch ledger repairs the identifier-only handoff without re-resolving members. |
| Worker receives duplicate or out-of-order event                             | Product claim loads the one source receipt.                                                    | Duplicate converges; stale event cannot re-resolve audience.                              |
| Authorization service is unavailable                                        | Member/source proof is indeterminate; release nothing.                                         | Retry same member/occurrence claim within later usefulness fence.                         |
| RLS policy disagrees with privileged service path                           | Treat as security invariant failure; release nothing.                                          | Compare purpose-built server authorization and database evidence; repair forward.         |
| Source responsibility/member disappears                                     | Source-suppress all unsubmitted descendants; preserve source member history.                   | Current D44/source proof plus monotonic source-suppression record.                        |
| One channel destination/preference blocks                                   | Suppress only that channel effect; preserve source member and independently admitted channels. | Channel-specific current proof and effect evidence.                                       |
| Provider result is ambiguous                                                | Do not submit again blindly or choose another member.                                          | Reconcile by stable channel effect/provider key.                                          |
| Immutable member receipt is corrupt or incomplete                           | Quarantine occurrence and release nothing.                                                     | Restore from trusted backup/audit only; never current-route recomputation.                |
| Feature runtime is disabled                                                 | Source receipts and current D44 tasks remain valid.                                            | Re-enable from dispatch ledger or use source-lane/manual recovery; no new cohort.         |

## UX/UI and user journeys

### Current product

D49 creates **no UI now**. D46's no-reminder baseline remains the truthful
product. No hidden control, disabled field, recipient preview, notification
badge, audit tab, or empty placeholder should imply that a reminder exists.

### Tenant administrator journey after every later gate passes

Recipient binding is not another configurable setting. The existing compact
access-request cadence editor may show this quiet summary beneath the future
selected cadence:

> **Recipients**
>
> Access request coordinators responsible when the reminder occurs.

One secondary **How recipient changes work** disclosure says:

> Later changes may stop delivery, but won't redirect that reminder. If no one
> qualifies, the request stays in Access requests.

This explanation should be collapsed or secondary unless user research shows
it is needed for comprehension. Do not show names, avatars, a live count,
channel icons, delivery guarantees, checkboxes, or a second Save action. The
D44 coordinator editor remains the only place to manage coordinators and its
existing current-work impact rules remain unchanged.

No ordinary setting, request row, or coordinator surface shows recipient names
or counts. An authorized audit/history surface may show a compact,
noninteractive semantic result such as **Recipients determined at occurrence**
or **No eligible coordinator at occurrence**. Exact historical assignment
evidence is available only through a separate purpose-authorized full-audit
projection and must not appear in list rows, general exports, logs,
notifications, or global search.

### Coordinator journey

- Current work stays discoverable through **Access requests** and the one D44
  task even if every reminder descendant fails.
- A future reminder uses safe source-owned copy such as **Access review still
  waiting**, never **overdue**, **late**, **escalated**, or **you failed to act**.
- The coordinator does not see who else was sealed, whether others opened a
  message, or whether another channel delivered.
- Opening the reminder only opens the freshly authorized request detail; it
  does not claim, acknowledge, approve, keep, or remove anything.
- A newly added coordinator can see current work and normal D44 reassignment
  attention even if they joined after this reminder's cohort closed.
- A removed coordinator loses current personal responsibility and receives no
  further unsubmitted reminder effect; history does not imply continuing duty.

### Holder, missionary, donor, public, and operator journeys

- The holder sees no recipient list, reminder status, staff engagement, or
  implication that their request is overdue. Their D43 status and withdrawal/
  result behavior remain unchanged.
- Missionary, donor, and public surfaces receive no D49 data or UI merely
  because one person may hold multiple product roles.
- Support/operator/impersonation does not become a reminder member and cannot
  add one. Any authorized diagnostic view is purpose-bound, time-boxed, audited,
  and privacy-minimal.
- AI/search/analytics may not infer workload, staff performance, or individual
  responsiveness from sealed or suppressed membership.

### Mobile, accessibility, localization, and low bandwidth

- Preserve the shared Base Maia/Zinc language and `@asym/ui` primitives; do not
  introduce an app-local recipient component or workflow canvas.
- Use semantic headings and lists, not a wide member table. Prove 320 CSS pixel
  and 400% reflow, RTL/CJK expansion, text zoom, forced colors, and visible/
  unobscured focus.
- Persistent results and recovery states are programmatically announced without
  moving focus. Toast-only confirmation and color-only member state fail.
- Do not use avatars or initials as identity proof. Localized display names may
  be non-Latin, long, duplicated, or absent; authorized detail uses stable
  accessible labels plus safe disambiguation.
- Low-bandwidth operation loads the source lane/task first. Reminder/audit
  metadata is supplemental, progressively disclosed, and never blocks action.
- Offline or stale cached recipient data is never presented as current
  authority. Refresh failure preserves work access and says the status cannot
  currently be confirmed.

## Strongest alternative

### Bind the request-creation D44 cohort, then narrow only

This is the strongest alternative. It is simpler to explain historically and
avoids giving a newly assigned coordinator both D44 responsibility-update
attention and a reminder soon afterward. Microsoft Entra's instance snapshots
and Okta's future-only delegation show that creation-time audiences are a
defensible pattern.

It is weaker for Core because D44 explicitly makes current responsibility
authoritative for all pending requests. A request created in shared-lane-only
mode could never gain a reminder recipient; if every original coordinator left,
the occurrence could omit every person now responsible and able to act. Core's
one reminder is not an approval assignment or preserved historical review
panel; it is courtesy attention for still-current work. Occurrence-time sealing
therefore fits the domain better, provided it is one atomic source result and
never a continuously mutable delivery query.

### Continuously resolve recipients through delivery

Reject. It can send in-product attention to Ben, email to Carla, and push to a
later Dana for one business occurrence. Provider timing would affect audience,
retries could broaden disclosure, audit could not answer who the occurrence was
for, and an accepted message cannot be recalled. Fresh authorization remains
mandatory, but it is a subtract-only fence over a sealed set—not authority to
discover replacements.

## Full adversarial category review

Every category has a material concern for the unamended shorthand. The exact
required language is captured in the corrected decision and D49 acceptance
criteria below.

| Category                                                      | Material concern? | What could go wrong and why it matters                                                                                                                                   | Severity / likelihood  | Evidence or reasoning                                                                          | Effect on answer                                                    | Permanent fix and exact required language                                                                                                                                                       |
| ------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem validity, necessity, and alternatives                 | **Yes**           | Current recipients improve relevance, but the feature itself remains evidence-gated and D44 already supplies lane/task recovery. D49 could overstate reminder necessity. | High / High            | D46 found no representative missed-request evidence; vendors show multiple safe patterns.      | Narrows, does not invalidate.                                       | **“D49 chooses recipient binding only; it does not activate or prove the need for a reminder. D46 remains the baseline until the full evidence gate passes.”**                                  |
| Brittleness                                                   | **Yes**           | “Current” resolved by worker/cache/channel yields different audiences under route churn and retry.                                                                       | Critical / High        | Entra snapshots instances; Core sources and executors are intentionally separate.              | Changes shorthand into an atomic source rule.                       | **“One Phase 12 occurrence transaction resolves and seals one complete current D44 generation; downstream reads never broaden it.”**                                                            |
| Technical debt                                                | **Yes**           | A generic audience engine, polymorphic recipient relation, or dormant adapter would become a compatibility contract before D50/channels.                                 | High / High            | Core ADRs already provide source occurrence and bounded Delivery Plan seams.                   | Narrows implementation scope.                                       | **“Add no D49 artifact now; later implement the smallest typed Phase 12 occurrence/member contract after all gates.”**                                                                          |
| Edge cases                                                    | **Yes**           | Zero, timeout, requester overlap, four members, assignment replacement, request terminal race, restore, and lost response can leak or duplicate.                         | Critical / High        | D44 has complete-result algebra; PostgreSQL requires deliberate serialization.                 | Adds closed outcomes and race matrix.                               | **“`proved_zero`, `indeterminate`, exact replay, and every route/source race have deterministic no-fallback outcomes.”**                                                                        |
| Footguns                                                      | **Yes**           | Admin/support could add a “missed” recipient, use an Owner fallback, or replay against current route.                                                                    | Critical / Medium-high | Comparable products support fallbacks/reassignment that Core intentionally rejects.            | Adds uniform no-broadening rule.                                    | **“No fallback, substitute, manual add, import, replay re-resolution, or support broadening is permitted.”**                                                                                    |
| Tenant safety                                                 | **Yes**           | Cross-Tenant cache keys, events, relations, or multi-hat sessions could disclose access-review existence.                                                                | Critical / Medium      | Governing OpenSpec requires server-derived Tenant and application plus RLS isolation.          | Adds exact Tenant branding everywhere.                              | **“Every occurrence, member, claim, event, cache, audit read, and relationship is exact-Tenant and purpose-bound.”**                                                                            |
| Database, RLS, and authorization safety                       | **Yes**           | Caller-nominated assignments, weak FKs, `USING` without `WITH CHECK`, owner/service bypass, or mutable rows could retarget a legal member.                               | Critical / High        | PostgreSQL/Supabase primary docs; current Core intended EffectiveAccess.                       | Adds release-blocking storage/auth invariants without freezing SQL. | **“Server-derived fields, same-Tenant composites, immutable identities, least grants, forced/equivalent RLS, matching mutation checks, and privileged parity are mandatory.”**                  |
| Overengineering                                               | **Yes**           | Generic workflow/rule/calendar/audience builders solve speculative future use and obscure the one bounded rule.                                                          | High / High            | Recipient cap is three; D50 and channels remain separate.                                      | Rejects abstractions beyond the typed seam.                         | **“One code-owned D49 resolver consumes D44; no generic workflow, audience DSL, or channel array.”**                                                                                            |
| UX/UI and user friction                                       | **Yes**           | Names, counts, warning banners, delivery icons, or another setting make a quiet source rule noisy and misleading.                                                        | High / High            | GOV.UK warns banners are often missed/noisy; Core's Base Maia system favors contextual status. | Adds no-UI-now and quiet-help requirements.                         | **“No D49 control; later show only concise contextual explanation and purpose-authorized audit, with lane/task remaining primary.”**                                                            |
| Source of truth, ownership, and invariants                    | **Yes**           | Task assignee, notification recipient, provider destination, or current route could become a second write authority.                                                     | Critical / High        | ADR-0183/0027/0026 explicitly separate these facts.                                            | Clarifies sole owner.                                               | **“Phase 12 owns occurrence and sealed members; every other surface consumes and narrows immutable source truth.”**                                                                             |
| Hidden coupling                                               | **Yes**           | D49 could depend on D45 email, D50 clock, policy version, task state, or Inngest run IDs.                                                                                | High / High            | D47 occurrence identity explicitly excludes mutable dimensions.                                | Removes those dependencies.                                         | **“Recipient/policy/channel/executor identities are evidence, never occurrence identity or authority.”**                                                                                        |
| Failure modes                                                 | **Yes**           | Partial cohorts, lost responses, dispatch gaps, ambiguous provider acceptance, or authorization outage can send twice or to the wrong person.                            | Critical / High        | RFC 9110 retry guidance and workflow OpenSpec require product claims/receipts.                 | Adds atomicity, idempotency, and no-release uncertainty.            | **“Commit attempt evidence atomically; only a terminal complete result commits its receipt and any applicable handoff; exact replay returns it and indeterminate proof releases nothing.”**     |
| Lifecycle, temporal correctness, concurrency, and idempotency | **Yes**           | Pre/post-occurrence route changes, suppression/regain, request closure, and concurrent claims can jointly violate monotonicity.                                          | Critical / High        | Mutable responsibility plus irreversible delivery requires a formal state algebra.             | Adds member and occurrence transition rules; leaves clock to D50.   | **“Pre-occurrence changes may affect the sealed set; post-occurrence paths only narrow; stable product uniqueness owns one occurrence.”**                                                       |
| Data integrity risks                                          | **Yes**           | Duplicate members, wrong cardinality, missing evidence, destructive cascades, or rebuild from current route can corrupt history.                                         | Critical / Medium-high | Database constraints can enforce cardinality/uniqueness/tenant relationships.                  | Adds immutable complete-set invariants.                             | **“`sealed_members` has exactly 1–3 unique members, `sealed_proved_zero` exactly 0, and no committed partial set or destructive history cascade exists.”**                                      |
| Security and privacy risks                                    | **Yes**           | Member lists, explanations, provenance, delivery status, or performance inference can expose sensitive ministry/staff data.                                              | Critical / Medium      | D42/D43 protect provenance/explanation; RFC 9457 warns against detail leakage.                 | Adds data minimization and purpose-specific views.                  | **“Identifier-only handoffs; no protected prose/member names in events/logs/list UI; detailed audit is separately authorized and logged.”**                                                     |
| Scalability and performance risks                             | **Yes**           | A Tenant-wide eligible-staff scan or long source locks could degrade request/route operations at scale.                                                                  | High / Medium          | D44 bounds configured members to three; no current volume proves broad fanout need.            | Requires bounded evaluation and measured contention.                | **“Resolve only the indexed D44 0–3 cohort; no Tenant census; publish lock/query budgets with production-shaped contention proof.”**                                                            |
| Operational burden                                            | **Yes**           | Manual SQL repair, guessed recipients, and provider-by-provider replay would require tribal knowledge.                                                                   | High / Medium          | Immutable receipts and product claims make source repair deterministic.                        | Adds runbook and forbids direct repair.                             | **“Operations quarantine and reconcile from source receipts; they never edit members or re-resolve current route into committed history.”**                                                     |
| Observability and auditability gaps                           | **Yes**           | Technical logs cannot prove why zero occurred, which generation was sealed, or why a member was suppressed.                                                              | High / High            | Entra and Okta preserve reviewer/audit history; Core distinguishes business history from logs. | Adds durable minimal business evidence and named monitors.          | **“Persist resolution disposition/generation/member/suppression evidence; logs and traces are secondary and privacy-minimal.”**                                                                 |
| Dependency and integration risks                              | **Yes**           | Inngest, Resend, Slack, Teams, push, or provider semantics could re-resolve or broaden recipients after delay/outage.                                                    | Critical / Medium-high | Workflow OpenSpec and provider irreversibility require product authority.                      | Keeps dependencies replaceable.                                     | **“Executors/providers consume identifier-only claimed work and may suppress, never discover or substitute members.”**                                                                          |
| Migration, rollout, and upgrade risks                         | **Yes**           | Mixed readers/writers may treat unknown disposition as eligible, re-run cohorts after rollback, or backfill pre-D48 work.                                                | Critical / High        | D48 prohibits backfill; workflow OpenSpec requires additive rollback-safe adoption.            | Adds deny-compatible sequencing.                                    | **“Readers deny unknown/incomplete before writers; no backfill; rollback stops descendants while preserving receipts and never creates a new cohort.”**                                         |
| Testability, traceability, and proof                          | **Yes**           | Happy-path tests can pass while exact races, privileged paths, zero/indeterminate, accessibility, and no-second-task fail.                                               | Critical / High        | D49 is defined by cross-domain outcomes, not one query implementation.                         | Adds continuous IDs and production-shaped matrices.                 | **“Trace D49 from decision through glossary/ADR/OpenSpec/design/tickets/code/tests/release evidence and prove positive, negative, boundary, auth, race, migration, a11y, and scale outcomes.”** |
| Other development hazards                                     | **Yes**           | Account merges, restores, AI recommendations, experiments, imports, and support tools can become hidden audience mutation paths.                                         | Critical / Medium      | Every non-source path is outside D49 authority.                                                | Adds a uniform extension boundary.                                  | **“Any future audience source requires a new governed decision; all current ancillary paths are read-only consumers or denied.”**                                                               |

## Final disposition and ruthless synthesis

### Final disposition

**Accept with required amendments.** The founder's selection is the best
permanent recipient-binding policy after replacing the ambiguous idea of a
“current audience” with one atomic Phase 12 source cohort, complete result
algebra, immutable replay, and monotonic downstream narrowing.

### Resolve before recording

Resolved in this document:

1. exact occurrence-time source boundary;
2. complete zero-to-three current D44 responsibility generation;
3. `proved_zero` versus `indeterminate`;
4. pre-occurrence currentness versus post-occurrence no-broadening;
5. member-level current-proof and suppression semantics;
6. no second task and no channel/executor authority;
7. Tenant/RLS/privileged-path and privacy boundaries;
8. exact replay, repair, rollout, and UX posture.

### Capture in the later specification and design

1. D49 source occurrence and member semantics with the exact invariants above.
2. Same-Tenant relationship, cardinality, immutability, deletion, grants, RLS,
   and authorization contracts without prematurely freezing table names.
3. Stable occurrence and member/effect identities plus product claim ordering.
4. Complete deterministic race, zero/indeterminate, restore, and replay matrix.
5. Identifier-only handoff and separately authorized audit projection.
6. Base Maia contextual-help and audit UX with full accessibility/localization
   proof.
7. Traceability from D49 through glossary, ADRs, OpenSpec, design, tasks, GitHub
   tickets, code, tests, and release evidence.

### Require before any implementation or activation

1. Record D50 and later policy-edit/usefulness/value/channel decisions.
2. Revalidate that the reminder feature itself has representative evidence over
   the D46 no-reminder baseline.
3. Land deny-compatible readers and authorization/RLS enforcement before any
   writer; keep feature Off through mixed versions.
4. Prove exact-barrier races, lost-response replay, privileged-path parity,
   no-second-task, no-broadening, privacy, and rollback.
5. Meet measured per-occurrence query/lock and dispatch-recovery budgets at the
   D43 production-shaped corpus without Tenant-wide scanning.
6. Pass moderated comprehension research and WCAG 2.2 AA/RTL/CJK/mobile/low-
   bandwidth gates.

### Named monitors without premature telemetry authorization

These are required release/audit signals. D49 does not authorize their runtime
implementation now.

| Signal and threshold                                                                                                                                    | Owner                                        | Response                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `D49-PREMATURE-ARTIFACT-GATE`: any D49 schema/key/job/UI/flag/telemetry/runtime artifact before remaining gates                                         | Architecture + Phase 24 docs owner           | Block release, remove artifact, and prove no data/effect was created.                                                                         |
| `D49-AUDIENCE-BROADENING-AUDIT`: any committed occurrence gains/replaces a member after seal; threshold **> 0**                                         | Phase 12 + IAM + Privacy                     | Stop descendant claims, quarantine occurrence, assess disclosure, repair forward from receipt, and re-prove monotonicity.                     |
| `D49-PARTIAL-COHORT-AUDIT`: any claimable occurrence lacks a closed complete disposition/member cardinality; threshold **> 0**                          | Data Integrity + Phase 12                    | Mark unclaimable, stop dispatch, restore only from trusted atomic evidence, and open incident review.                                         |
| `D49-ZERO-INDETERMINATE-CONFLATION-AUDIT`: any timeout/error stored as `proved_zero` or empty result retried into nonempty; threshold **> 0**           | Phase 12 + SRE                               | Fence resolver, reclassify safely without sending, repair tests/runbook, and review affected receipts.                                        |
| `D49-SECOND-TASK-AUDIT`: any D49 occurrence creates/reopens/reassigns a Tasks Hub task; threshold **> 0**                                               | Tasks Hub + Phase 12                         | Stop projection, remove duplicate task safely, preserve D44 task truth, and re-prove identity invariants.                                     |
| `D49-CROSS-TENANT-MEMBER-AUDIT`: any occurrence/member/claim Tenant mismatch; threshold **> 0**                                                         | Security + IAM + Database                    | Disable affected path, contain and assess exposure, preserve evidence, repair constraint/auth boundary, and rotate credentials if implicated. |
| `D49-CALLER-AUTHORITY-AUDIT`: any caller/event/provider-selected Tenant, actor, head, or member is trusted; threshold **> 0**                           | Security + API owner                         | Block command, remove parameter authority, audit prior effects, and add negative tests.                                                       |
| `D49-PRIVILEGED-PARITY-GATE`: any service/owner/definer path lacks equivalent current source/member authorization; threshold **> 0**                    | Database + Security                          | Revoke path, stop workers, add purpose-built enforcement, and rerun ordinary/privileged proof.                                                |
| `D49-RECIPIENT-PII-EGRESS-AUDIT`: any member name/email/protected request detail enters event/log/cache/global search; threshold **> 0**                | Privacy + Security + owning platform         | Stop egress, purge where supported, assess incident/retention, minimize envelope, and re-prove.                                               |
| `D49-REPLAY-DRIFT-AUDIT`: same occurrence identity returns a different disposition/member digest; threshold **> 0**                                     | Data Integrity + API + Phase 12              | Disable blind retry, quarantine both results, select original committed receipt, and repair idempotency.                                      |
| `D49-SOURCE-LANE-RECOVERY-GATE`: a recipient failure prevents authorized staff using **Access requests**; threshold **> 0**                             | Access Product + IAM                         | Roll back supplemental path and restore lane-first operation before release.                                                                  |
| `D49-UX-COMPREHENSION-GATE`: any moderated participant (> 0) infers deadline, access change, guaranteed delivery, or shared-recipient surveillance      | UX Research + Accessibility + Access Product | Block activation, revise copy/placement, and repeat research across required cohorts.                                                         |
| `D49-D50-BOUNDARY-GATE`: any clock/calendar/value/usefulness behavior is implemented or stated as settled before D50/later decisions; threshold **> 0** | Phase 12 + Architecture                      | Freeze/remove inference, preserve D49-only cohort semantics, and record the missing decision.                                                 |
| `D49-TRACEABILITY-GATE`: any contradictory cohort/zero/member/identity statement across governing artifacts; threshold **> 0**                          | Phase 24 docs owner                          | Block handoff, reconcile artifacts, and repeat semantic/identifier checks.                                                                    |

## Research assertions

### Repository and governing facts

- **D49-RA001 — Repository fact:** Core currently ships no D43 holder access-
  review request, D44 coordinator policy, D47 reminder occurrence, or D49
  recipient cohort.
- **D49-RA002 — Repository fact:** Phase 12 is the intended authoritative owner
  of D43 request identity, source actionability, lifecycle, decision, and audit.
- **D49-RA003 — Repository fact:** D44 permits either shared-lane-only operation
  or one-to-three unique unordered co-equal coordinator assignment members.
- **D49-RA004 — Repository fact:** D44 recipient qualification intersects the
  configured assignment set with current exact request-decision eligibility and
  requester exclusion.
- **D49-RA005 — Repository fact:** D44 preserves a complete permission-filtered
  **Access requests** lane even when configured membership is empty,
  ineligible, or indeterminate.
- **D49-RA006 — Repository fact:** D44 deliberately applies route and
  eligibility changes differentially to current pending requests rather than
  preserving a creation-time responsibility roster.
- **D49-RA007 — Repository fact:** D44 supplies at most one current source-
  backed Tasks Hub assignment per admitted recipient/request generation.
- **D49-RA008 — Repository fact:** D44 groups current-work responsibility-update
  attention while retaining one task per exact request, avoiding one bell item
  per backlog row.
- **D49-RA009 — Repository fact:** D45 initial email is an optional separate
  Delivery Step and does not authorize a reminder or future recipient.
- **D49-RA010 — Repository fact:** D46's current governing baseline creates no
  automatic access-request reminder, clock, deadline, or placeholder.
- **D49-RA011 — Repository fact:** D47 only qualifies a possible future bounded
  courtesy cadence and requires at most one occurrence per exact request
  episode.
- **D49-RA012 — Repository fact:** D47 excludes recipient, policy, channel,
  executor, retry, and presentation identities from permanent occurrence
  uniqueness.
- **D49-RA013 — Repository fact:** D48 permits only genuine post-boundary D43
  creation episodes to carry future cadence admission; current work is never
  backfilled.
- **D49-RA014 — Repository fact:** D48 admission is source-recorded and immutable;
  route/task/notification/worker state cannot later reclassify it.
- **D49-RA015 — Repository fact:** Phase 12 already describes source recipient
  generations that bind an exact request occurrence and D44 policy/application
  head without granting access.
- **D49-RA016 — Repository fact:** ADR-0183 makes Tasks Hub a projection; the
  source owns actionability, responsibility transitions, recurrence, and
  completion.
- **D49-RA017 — Repository fact:** ADR-0027 makes Notification Center engagement
  independent from source and task truth and requires fresh descendant
  authorization.
- **D49-RA018 — Repository fact:** ADR-0026 makes the producer own one occurrence
  and complete candidate set while Phase 6/17 only compile bounded delivery.
- **D49-RA019 — Repository fact:** identity-and-access OpenSpec requires identity,
  Tenant, memberships, role, and capabilities to resolve server-side rather
  than from browser input.
- **D49-RA020 — Repository fact:** identity-and-access OpenSpec requires
  application-layer authorization as primary enforcement and RLS as independent
  defense in depth.
- **D49-RA021 — Repository fact:** workflow-orchestration OpenSpec keeps product
  records, authorization, dispatch ledger, and work claims authoritative over
  Inngest execution.
- **D49-RA022 — Repository fact:** workflow events are identifier-only and must
  reject secrets, full records, rendered content, and broad CRM payloads.
- **D49-RA023 — Repository fact:** platform boundaries keep permission-sensitive
  operational workflow in CRM/Phase 12 and prevent CMS, public, donor,
  missionary, AI, or agent surfaces from widening authority.
- **D49-RA024 — Repository fact:** Core's future UI must use shared `@asym/ui`,
  Base UI, Base Maia/Zinc semantics, accessible forms/status, and no app-local
  component fork.

### Verified current external facts

- **D49-RA025 — Verified external fact:** Microsoft Entra access reviews capture
  a snapshot of users, resources, and reviewers at the beginning of each review
  instance.
- **D49-RA026 — Verified external fact:** In an Entra group-owner review, owner
  changes during the review do not add new owners or remove old owners from the
  current instance; later recurrence reevaluates them.
- **D49-RA027 — Verified external fact:** Entra exposes contacted reviewers and
  notification timestamps for an initiated review, supporting bounded recipient
  evidence.
- **D49-RA028 — Verified external fact:** Entra separates updates to the current
  review from updates to the future series instead of silently merging scopes.
- **D49-RA029 — Verified external fact:** Okta reassigns an active review item
  through an explicit governed action rather than implicit notification-time
  current membership.
- **D49-RA030 — Verified external fact:** Okta reassignment can require a business
  justification, preserves history, respects self-review restrictions, and can
  notify the new reviewer.
- **D49-RA031 — Verified external fact:** Okta delegation reroutes future
  governance work while existing review items/tasks require separate explicit
  reassignment.
- **D49-RA032 — Verified external fact:** SailPoint access requests can require
  multiple reviewer approvals and may use source-configured reassignment when a
  reviewer does not act.
- **D49-RA033 — Verified external fact:** Salesforce Flow Approval open work
  items can be explicitly reassigned while retaining their own work-item
  lifecycle evidence.
- **D49-RA034 — Verified external fact:** Salesforce treats in-product approval
  work and email notification as separate surfaces.
- **D49-RA035 — Verified external fact:** Salesforce documents that an approver
  without record access can still receive an email but cannot complete mobile
  approval, demonstrating a real assignment/visibility footgun.
- **D49-RA036 — Verified external fact:** Contentful exposes assigned work in a
  Pending Tasks surface and separately sends task email.
- **D49-RA037 — Verified external fact:** Contentful's API does not verify that a
  task assignee has read access to the entry, illustrating why assignment alone
  cannot authorize Core presentation.
- **D49-RA038 — Verified external fact:** Contentful task reassignment has
  explicit old/new-assignee notification behavior rather than silently changing
  a live message audience.
- **D49-RA039 — Verified external fact:** Blackbaud Grantmaking lets authorized
  staff explicitly assign one or more reviewers to a request.
- **D49-RA040 — Verified external fact:** Blackbaud separately controls reviewer
  visibility, decision permissions, deadlines, and notifications.
- **D49-RA041 — Verified external fact:** Submittable makes replacement of a
  declined reviewer an explicit Program Owner action with confirmation.
- **D49-RA042 — Verified external fact:** Submittable's current reviewer-removal
  guidance preserves completed or in-progress work and suppresses unnecessary
  notifications in some workload-change cases.
- **D49-RA043 — Verified external fact:** PostgreSQL `READ COMMITTED` takes a new
  snapshot per statement, so several statements need not observe one common
  “current” state.
- **D49-RA044 — Verified external fact:** PostgreSQL `SERIALIZABLE` rejects a
  read/write execution that cannot correspond to one serial order, requiring
  application retry of the complete transaction.
- **D49-RA045 — Verified external fact:** PostgreSQL locking clauses protect
  selected rows but have ordering/concurrency caveats and cannot by themselves
  lock an absent occurrence row.
- **D49-RA046 — Verified external fact:** PostgreSQL unique, check, and foreign-
  key constraints can make many duplicate, cardinality, and relationship states
  unrepresentable.
- **D49-RA047 — Verified external fact:** PostgreSQL/Supabase require deliberate
  grants plus RLS mutation checks, while owners, security-definer code, secret
  keys, and service roles can bypass ordinary policy behavior.
- **D49-RA048 — Verified external fact:** RFC 9110 permits automatic recovery of
  a non-idempotent request only when application semantics are known idempotent
  or non-application can be established.

### Corrected decision and source invariants

- **D49-RA049 — Product judgment:** D49 binds recipients at the one Phase 12
  source occurrence because that is the latest point where current D44
  responsibility and one stable audience can both be true.
- **D49-RA050 — Product judgment:** Request-creation binding is the strongest
  alternative but conflicts with D44's deliberate current-work responsibility
  semantics when every original coordinator changes.
- **D49-RA051 — Requirement inference:** Worker wake, task creation,
  notification rendering, and provider preparation are not source occurrence
  time and cannot resolve recipients.
- **D49-RA052 — Requirement inference:** Source resolution must freshly prove
  exact D43 actionability, D48 admission, D44 generation, and authorization
  inputs under one concurrency boundary.
- **D49-RA053 — Requirement inference:** D49 consumes the exact current D44
  responsibility generation and revalidates it; it cannot query the configured
  roster/task assignees directly or create a reminder-specific resolver.
- **D49-RA054 — Requirement inference:** The resolver result must be complete,
  unordered, unique, and bounded to zero through three assignment members.
- **D49-RA055 — Requirement inference:** Role, group, manager, original grantor,
  Owner, Admin, support, requester, and broad eligible-staff fallbacks are
  forbidden.
- **D49-RA056 — Product judgment:** The source seals the exact D44 recipient-
  generation/Active Tenant Assignment pair, not mutable profile/email/channel
  destinations.
- **D49-RA057 — Requirement inference:** Every attempt atomically records
  occurrence/current state, audit, and immutable attempt evidence; only a
  terminal complete resolution commits disposition, generation/members,
  receipt, and any applicable handoff atomically.
- **D49-RA058 — Requirement inference:** Permanent occurrence identity excludes
  mutable members and retains one stable request-episode/reminder-class slot.
- **D49-RA059 — Requirement inference:** Exact replay of a terminal resolution
  returns the original member set/disposition; an indeterminate attempt receipt
  is immutable while a separately claimed retry may advance only the same
  unresolved occurrence.
- **D49-RA060 — Requirement inference:** A different member digest under the
  same occurrence identity is an invariant conflict, never a merge/update.
- **D49-RA061 — Product judgment:** Complete zero is a terminal `proved_zero`
  source fact that consumes the one occurrence and never gains a later member;
  absent optional D44 policy is a complete shared-lane-only zero only after
  serialization against a concurrent D44 save.
- **D49-RA062 — Requirement inference:** Timeout, partial enumeration, stale
  unresolved heads, corruption, contradiction, or over-limit membership is
  `indeterminate`, not zero.
- **D49-RA063 — Requirement inference:** A partial cohort releases nobody even
  when one member looked eligible before the failure.
- **D49-RA064 — Product judgment:** Indeterminate resolution is nonterminal and
  unreleased, retains immutable attempt evidence, seals no generation/member,
  and retries only the same product occurrence against then-current source
  truth until a complete or later terminal result.
- **D49-RA065 — Product judgment:** Route and eligibility changes committed
  before the first complete cohort seal, including during indeterminate
  attempts, may affect the sealed current cohort.
- **D49-RA066 — Requirement inference:** Route and eligibility changes after
  source occurrence cannot add, replace, reroute, or resurrect a member.
- **D49-RA067 — Requirement inference:** Every irreversible descendant boundary
  freshly proves source actionability, the sealed member's continuing current
  D44 responsibility, current EffectiveAccess, and channel-specific conditions;
  source loss suppresses all unsubmitted descendants while a channel failure
  suppresses only that channel effect.
- **D49-RA068 — Requirement inference:** Sealed membership is historical
  candidate evidence and never independently grants visibility or decision
  authority.
- **D49-RA069 — Product judgment:** Temporary inability to prove a sealed
  member's eligibility releases nothing but may retry the same member claim.
- **D49-RA070 — Requirement inference:** Complete proof of ineligibility
  terminally narrows the exact recipient-generation/assignment pair; a gap,
  removal/re-add, successor generation, or later regained eligibility cannot
  re-enter the occurrence.
- **D49-RA071 — Requirement inference:** A post-occurrence new coordinator gets
  ordinary current D44 responsibility/task/update attention but not the old
  reminder.
- **D49-RA072 — Requirement inference:** A post-occurrence removed coordinator
  is narrowed from unsubmitted effects without rewriting sealed history or
  accepted provider evidence.
- **D49-RA073 — Requirement inference:** D49 creates, reopens, completes,
  reassigns, or duplicates zero Tasks Hub tasks.
- **D49-RA074 — Requirement inference:** D45 initial email and any future
  reminder channel remain separate occurrences/effects and cannot supply the
  D49 cohort.
- **D49-RA075 — Product judgment:** Ordinary coordinator and holder UI does not
  expose fellow members, engagement, or delivery history.
- **D49-RA076 — Product judgment:** Purpose-authorized audit may expose the
  minimum sealed/suppressed history required for explanation and repair.
- **D49-RA077 — Requirement inference:** Handoffs and workflow events carry only
  safe identifiers, never member PII, protected prose, or complete source rows.
- **D49-RA078 — Requirement inference:** Tenant, source actor, heads,
  authorization epochs, member generation/assignment IDs, resolution state,
  and attribution are trusted server-derived facts; the automatic occurrence
  uses a registered system/source purpose rather than human
  `permissions.manage_grants` execution authority.
- **D49-RA079 — Requirement inference:** Inngest may later execute identifier-
  only claimed work but owns no recipient, occurrence, authorization,
  idempotency, or repair truth.
- **D49-RA080 — Unresolved unknown:** D50, later policy lifecycle, values,
  usefulness, message meaning, and channels remain independent gates.

### UX, security, failure, migration, and operations

- **D49-RA081 — Product judgment:** D49 creates no current UI because no reminder
  runtime or recipient cohort exists.
- **D49-RA082 — Product judgment:** Future cadence settings may use one quiet
  contextual disclosure explaining occurrence-time current coordinators and
  narrowing-only behavior.
- **D49-RA083 — Product judgment:** Future ordinary settings omit recipient
  names, avatars, current counts, delivery icons, channel promises, and a second
  save action.
- **D49-RA084 — Requirement inference:** D44's coordinator editor remains the
  sole coordinator management surface; D49 adds no reminder-specific roster.
- **D49-RA085 — Product judgment:** Future reminder copy says only that an access
  review is still waiting and never claims overdue, lateness, escalation,
  failure, or access consequence.
- **D49-RA086 — Requirement inference:** Opening a reminder is a freshly
  authorized read and performs no claim, acknowledgment, keep, remove, or task
  mutation.
- **D49-RA087 — Product judgment:** Holders, missionaries, donors, and public
  viewers see no D49 audience or delivery status.
- **D49-RA088 — Requirement inference:** Future settings/audit prove semantic
  structure, keyboard operation, 320 CSS pixel/400% reflow, forced colors, and
  visible/unobscured focus.
- **D49-RA089 — Requirement inference:** Save, stale, ambiguous, indeterminate,
  and recovery outcomes use persistent programmatically announced status rather
  than toast-only feedback.
- **D49-RA090 — Product judgment:** Low-bandwidth journeys load source lane/task
  first and progressively disclose supplemental recipient/audit information.
- **D49-RA091 — Requirement inference:** Internationalized names may be long,
  duplicated, non-Latin, or absent; avatars/initials are never identity or
  authorization proof.
- **D49-RA092 — Requirement inference:** Future occurrence/member relationships
  use non-null Tenant scope and same-Tenant composites that cannot be retargeted.
- **D49-RA093 — Requirement inference:** Browser base writes remain revoked;
  grants, RLS `USING`/`WITH CHECK`, functions, views, and deletes preserve the
  same boundary.
- **D49-RA094 — Requirement inference:** Service-role, owner, security-definer,
  worker, support, and operator paths must invoke equivalent purpose-bound
  authorization and audit.
- **D49-RA095 — Requirement inference:** Stable product uniqueness/
  serialization must protect absent optional D44 policy and absent occurrence
  rows in one namespace: D49-first seals zero, D44-first supplies the complete
  current cohort; worker-local or missing-row locks are insufficient.
- **D49-RA096 — Requirement inference:** Source resolution is bounded by D44's
  zero-to-three configured members and current indexed evidence.
- **D49-RA097 — Requirement inference:** D49 performs no Tenant-wide eligible-
  staff census, current-request scan, or per-channel audience query.
- **D49-RA098 — Requirement inference:** Only a terminal complete result commits
  the source receipt and any applicable identifier-only dispatch handoff
  atomically; indeterminate creates no handoff, and handoff recovery cannot
  re-resolve recipients.
- **D49-RA099 — Requirement inference:** A lost response after commit returns the
  original receipt rather than performing a fresh current-cohort calculation.
- **D49-RA100 — Requirement inference:** Restore and projection rebuild consume
  immutable source receipts and cannot infer members from current D44 state.
- **D49-RA101 — Requirement inference:** Repair cannot add a missed person,
  substitute a replacement, or rewrite a committed member set from current
  routing.
- **D49-RA102 — Requirement inference:** Rollback may stop unsubmitted
  descendants while preserving occurrence/member evidence and current D44
  tasks; it cannot open a new cohort.
- **D49-RA103 — Requirement inference:** Mixed-version readers treat unknown,
  incomplete, or unsupported D49 evidence as no-release until compatible
  readers and authorization are deployed.
- **D49-RA104 — Requirement inference:** There is no D49 backfill because D48
  admits no historical pending request and no runtime has yet created admitted
  work.

### Proof, assumptions, and next decision

- **D49-RA105 — Requirement inference:** Tests need deterministic barriers for
  route-save/occurrence, eligibility/occurrence, request-terminal/occurrence,
  duplicate-command, and descendant/member-loss races.
- **D49-RA106 — Requirement inference:** Tests independently prove
  `proved_zero`, `indeterminate`, partial enumeration, over-limit, duplicate,
  stale, corrupt, and exact replay outcomes.
- **D49-RA107 — Requirement inference:** Authorization tests cover every
  role/subrole, assignment state, scope/ceiling/floor, requester equivalence,
  same-/cross-Tenant, and post-seal loss case.
- **D49-RA108 — Requirement inference:** Ordinary RLS and every privileged path
  must produce equivalent allow/deny/member results.
- **D49-RA109 — Requirement inference:** Property tests prove all accepted
  occurrence/member/request/assignment combinations share one Tenant and no
  permitted update can retarget them.
- **D49-RA110 — Requirement inference:** Tests prove D49 creates zero additional
  task rows and task/notification engagement cannot change members.
- **D49-RA111 — Requirement inference:** Property and integration tests prove
  every post-seal transition preserves or shrinks the set and no path expands
  it.
- **D49-RA112 — Requirement inference:** Accessibility tests combine automation
  with keyboard/screen-reader/zoom/forced-color/RTL/CJK and low-bandwidth manual
  evidence at user-visible seams.
- **D49-RA113 — Requirement inference:** Performance proof covers the D43 corpus
  of at least 100,000 terminal requests in one Tenant and 10,000 current requests
  across many Tenants without a request census or unbounded lock.
- **D49-RA114 — Requirement inference:** D49 IDs and terminology trace
  consistently into glossary, ADRs, OpenSpec, design, tasks, GitHub tickets,
  implementation, tests, and release evidence before activation.
- **D49-RA115 — Assumption:** ministry coordinators prefer a reminder aimed at
  current responsibility over original responsibility; representative
  moderated research must verify this.
- **D49-RA116 — Assumption:** rare overlap between D44 reassignment attention and
  the one courtesy reminder causes less harm than omitting current owners;
  volume and comprehension evidence must verify this.
- **D49-RA117 — Product judgment:** Vendor evidence supports stable audiences and
  explicit reassignment but does not establish Core's cardinality, requester
  exclusion, clock, or ministry demand.
- **D49-RA118 — Verified research limit:** No directly comparable current
  first-party online-giving/e-commerce evidence establishes a safer sensitive-
  reviewer binding rule, so none is imported by analogy.
- **D49-RA119 — Product judgment:** D50 is the next dependency because the
  source occurrence cannot exist until its clock/anchor semantics are exact.
- **D49-RA120 — Requirement inference:** D49 records behavior and proof only; it
  adds no executable artifact and asks exactly one D50 decision next.

## Falsifiable acceptance criteria

### Decision and source semantics

- **D49-AC001:** The recorded decision says the one possible source reminder
  occurrence consumes and seals the exact current D44 responsibility generation
  at one Phase 12 transaction boundary.
- **D49-AC002:** The decision defines occurrence time as source commit, never
  worker, task, notification, provider, cache, or HTTP timing.
- **D49-AC003:** Each exact Tenant/environment/D43 episode/reminder class has at
  most one source occurrence independent of route, member, policy, channel,
  executor, and retry changes.
- **D49-AC004:** Occurrence evaluation consumes and revalidates the exact current
  D44 responsibility generation plus D43 actionability, D48 admission, and
  required authorization inputs; it never derives recipients directly from the
  configured roster or task projection.
- **D49-AC005:** A complete nonempty result contains exactly one through three
  unique unordered members, each binding one exact D44 recipient-generation
  identity and Active Tenant Assignment.
- **D49-AC006:** A complete empty result records terminal `proved_zero`, releases
  nobody, consumes the one slot, and never gains a later member.
- **D49-AC007:** Partial, timed-out, stale unresolved, corrupt, contradictory,
  duplicate, or over-limit resolution is `indeterminate` and releases nobody.
- **D49-AC008:** `indeterminate` remains nonterminal/unreleased with immutable
  attempt evidence, retries only the same product occurrence, and cannot fall
  back, broaden, or mint another occurrence.
- **D49-AC009:** Every attempt atomically commits occurrence/current state,
  audit, and immutable attempt evidence. Only terminal complete resolution
  atomically commits closed disposition, complete generation/member evidence,
  receipt, and any applicable identifier-only handoff; indeterminate creates no
  member/reminder handoff.
- **D49-AC010:** Exact replay of a terminal resolution always returns the
  original disposition/member digest; exact replay of an indeterminate attempt
  returns its immutable attempt evidence, while only a separately claimed retry
  may advance the same unresolved occurrence.

### Tenant, database, RLS, and authorization

- **D49-AC011:** Tenant, source actor, source heads, authorization epochs,
  occurrence identity, member generation/assignment IDs, and attribution are
  derived from trusted server context.
- **D49-AC012:** The automatic occurrence runs as a registered product/system
  source command rather than a human `permissions.manage_grants` policy command;
  caller, browser, event, worker, provider, task, notification, support, and AI
  input cannot nominate or override any member.
- **D49-AC013:** All future relationships are `tenant_id NOT NULL` and enforced
  by same-Tenant composites; cross-Tenant create/read/update/delete fails
  uniformly without existence disclosure.
- **D49-AC014:** Occurrence and member identities/dispositions cannot be updated
  into another Tenant, request, assignment, generation, or outcome.
- **D49-AC015:** Database invariants reject duplicate members, more than three
  members, a nonempty `sealed_proved_zero`, an empty `sealed_members`, and a claimable
  incomplete set.
- **D49-AC016:** Browser base relations have no raw mutation/enumeration grant;
  purpose-built commands and views return only authorized projections.
- **D49-AC017:** RLS `USING` and `WITH CHECK`, restrictive deletion, grants,
  functions, RPCs, views, and storage paths preserve equivalent Tenant/member
  boundaries.
- **D49-AC018:** Owner, service-role/BYPASSRLS, security-definer, worker,
  support/operator, and impersonation paths reapply the same current source and
  member authorization with durable attribution.
- **D49-AC019:** Every irreversible descendant effect proves sealed member
  identity, continuing current D44 responsibility, and current same-Tenant
  EffectiveAccess/source/channel fences.
- **D49-AC020:** A sealed member without current proof receives no protected
  detail, notification presentation, or provider submission.

### Lifecycle, races, idempotency, and repair

- **D49-AC021:** D44 route publication and each D49 resolution attempt serialize
  through one absent-row-safe namespace: a complete D49-first absence seals
  `proved_zero`, D44-first exposes the complete winning cohort, an indeterminate
  attempt seals neither, and a post-seal change cannot add or replace a member.
- **D49-AC022:** A later new coordinator receives ordinary D44 work/attention but
  never joins an existing D49 occurrence.
- **D49-AC023:** Loss of gap-free D44 responsibility/source authorization
  source-suppresses that member from every unsubmitted descendant without
  erasing sealed history; channel-only suppression never changes source
  membership or another channel.
- **D49-AC024:** A temporarily indeterminate sealed-member proof releases
  nothing and retries only that member/effect until eligible, terminally
  ineligible, or later usefulness closure.
- **D49-AC025:** A terminally suppressed recipient-generation/assignment member
  cannot re-enter after a responsibility gap, removal/re-add, successor
  generation, restored eligibility, assignment recreation, account merge,
  route edit, replay, or support action.
- **D49-AC026:** A request-terminal/occurrence race has one serial result; no
  downstream effect survives a fresh source-actionability denial.
- **D49-AC027:** Concurrent identical occurrence commands converge on one receipt;
  disjoint member digests under one identity conflict and release nothing new.
- **D49-AC028:** A lost response, duplicate event, out-of-order event, executor
  replay, and dispatch recovery preserve the original cohort and one business
  effect per member/channel contract.
- **D49-AC029:** Restore, migration, rebuild, and repair use immutable source
  evidence and never query current D44 to fill or change committed members.
- **D49-AC030:** An incomplete/corrupt committed receipt is quarantined and
  unclaimable; operations have no force-send, force-member, or direct-SQL repair
  path.

### Tasks, presentation, delivery, and privacy

- **D49-AC031:** D49 creates, reopens, duplicates, completes, or reassigns zero
  Tasks Hub tasks and creates no due/overdue/SLA state.
- **D49-AC032:** D44's task and complete **Access requests** lane remain current
  work/recovery truth when recipient resolution or every delivery path fails.
- **D49-AC033:** Task age, assignment, completion, deletion, comment, reminder,
  and engagement cannot create, suppress, reschedule, or modify D49 membership.
- **D49-AC034:** Notification read/archive/open state and channel preference/
  outcome cannot create, replace, or resurrect a member.
- **D49-AC035:** Each Phase 17/6 channel compiles only from the sealed set and may
  suppress its own effect on current destination, consent, preference, or
  provider proof; this does not erase the source member, suppress another
  channel, or redirect to a replacement.
- **D49-AC036:** Inngest events and product dispatch handoffs contain only safe
  identifiers and no member names/emails, protected explanations, provenance,
  rendered content, or destination credentials.
- **D49-AC037:** Ordinary coordinators cannot see fellow recipient membership,
  engagement, delivery status, or protected audit rationale.
- **D49-AC038:** Holders, missionaries, donors, public users, generic support,
  search, analytics, and AI receive no D49 audience/engagement projection.
- **D49-AC039:** Purpose-authorized audit returns only minimum sealed/
  suppression evidence, logs the read, respects retention/export/deletion
  policy, and never becomes a write authority.
- **D49-AC040:** Provider acceptance/ambiguity is reconciled by a stable channel
  effect identity; route change cannot recall it, resubmit blindly, or choose a
  replacement recipient.

### UX, accessibility, performance, and operations

- **D49-AC041:** No D49 UI/control/placeholder ships while the reminder remains
  inactive and remaining decisions are unresolved.
- **D49-AC042:** Future cadence settings label the read-only summary
  **Recipients** with **Access request coordinators responsible when the reminder
  occurs.** One optional disclosure says **Later changes may stop delivery, but
  won't redirect that reminder. If no one qualifies, the request stays in
  Access requests.** D44 remains the only coordinator editor.
- **D49-AC043:** Ordinary settings show no recipient names, avatars, live count,
  channel icons, delivery guarantee, bulk action, or second Save control.
- **D49-AC044:** Future reminder copy says only that the review is still waiting
  and never conveys deadline, overdue, escalation, performance, awareness, or
  access-change meaning.
- **D49-AC045:** Opening attention is a safe freshly authorized navigation and
  performs no claim, decision, acknowledgment, task, or access mutation.
- **D49-AC046:** Status/recovery outcomes are persistent and programmatically
  announced without unexpected focus movement; no outcome is toast-only or
  color-only.
- **D49-AC047:** User-visible D49 surfaces pass keyboard, screen-reader, visible/
  unobscured focus, 320 CSS pixel/400% reflow, zoom, forced-color, RTL/CJK,
  localization, and long/duplicate/non-Latin-name tests.
- **D49-AC048:** Low-bandwidth and offline failure never blocks the source lane
  or task; stale cached audience data is not presented as current truth.
- **D49-AC049:** Occurrence resolution reads only the bounded indexed D44 zero-
  to-three cohort and publishes measured query/lock budgets under deterministic
  concurrency; it performs no Tenant-wide staff/request scan.
- **D49-AC050:** Operations can locate one source receipt, dispatch request,
  member state, and effect evidence without member PII in general logs and
  without direct database edits.

### Migration, traceability, and remaining gates

- **D49-AC051:** Rollout deploys deny-compatible readers/authorization/RLS before
  any writer and keeps the feature Off through mixed versions.
- **D49-AC052:** Unknown, unsupported, missing, or contradictory D49 evidence is
  no-release and observable without converting a valid D43 request into an
  error or access change.
- **D49-AC053:** No migration or backfill creates a cohort/marker/occurrence for
  pre-D48 or current pending requests.
- **D49-AC054:** Rollback stops new/unsubmitted descendants while preserving D43,
  D44 tasks, immutable occurrences/members, audit, and accepted provider
  evidence; rollback cannot create a replacement cohort.
- **D49-AC055:** Production-shaped proof includes at least 100,000 terminal
  requests in one Tenant and 10,000 current requests across many Tenants plus
  route/source/authorization contention, with no unbounded scan or noisy-
  neighbor leakage.
- **D49-AC056:** Positive, negative, boundary, authorization, concurrency,
  idempotency, migration, rollback, recovery, accessibility, privacy,
  performance, and production-shaped tests assert user/domain outcomes rather
  than table/query implementation details.
- **D49-AC057:** D49 terminology, corrected decision, invariants, RA/AC IDs, and
  evidence trace without contradiction through glossary, ADRs, OpenSpec,
  design, tasks, GitHub tickets, code, tests, and release proof.
- **D49-AC058:** Named monitors each retain exact signal, threshold, owner, and
  response; their specification does not authorize a telemetry artifact now.
- **D49-AC059:** No implementation begins before D50, later policy-edit/
  usefulness/value/content/channel decisions, the D46 evidence gate, and
  source-specific OpenSpec/design/rollout proof are complete.
- **D49-AC060:** Focused repository verification finds exactly 120 continuous
  unique D49 research assertions, exactly 60 continuous unique D49 acceptance
  criteria, all 22 adversarial categories, no D49 runtime/OpenSpec/schema
  artifact, and exactly one next D50 question.

## D50 — What clock should determine the one possible source occurrence?

### Why this is the next decision

Hope Mission's Tenant operates in `America/New_York`, but a coordinator creates
an admitted access-review request while working in Bangkok on a Friday. Before
the future code-owned cadence interval is reached, a daylight-saving transition
and weekend occur, and D44 replaces Ana with Carla as a current coordinator.
D49 now says the exact current D44 responsibility generation is sealed once at
the source occurrence, but Core still needs one authoritative answer to whether
the clock stays anchored to the request or restarts with responsibility.

This is not merely an implementation detail. PostgreSQL distinguishes calendar
days from elapsed hours: a local day can contain 23 or 25 hours across DST.
[PostgreSQL date/time documentation](https://www.postgresql.org/docs/current/datatype-datetime.html)
Microsoft Entra expresses access-review reminders relative to a review
duration, while GitHub's scheduled reminders use configured days, times, and
time zones. Okta explicitly says reassigning a review item does not extend the
campaign end date. [Microsoft Entra access reviews](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)
[GitHub Teams scheduled reminders](https://docs.github.com/en/integrations/how-tos/teams/schedule-reminders)
[Okta review reassignment](https://help.okta.com/en-us/content/topics/identity-governance/access-certification/iga-reassign-reviews.htm)
These sources prove both elapsed and governed-calendar models exist and provide
direct evidence against silently resetting source time when responsibility
changes. They do not decide which meaning best fits Core's optional,
non-deadline courtesy nudge.

Every option below keeps D46's no-reminder baseline until activation proof,
one source occurrence per exact D43 episode, D48 prospective admission, D49
occurrence-time cohort sealing, database-authoritative time, no Due/Overdue/SLA
meaning, and no channel promise. D50 chooses no numeric value, useful-lateness
window, policy-edit behavior, or delivery time.

### Option 1 — one elapsed duration from the authoritative D43 source-created instant — recommended

Phase 12 derives one not-before instant by adding the later code-owned elapsed
duration to the trusted database instant retained by the successful D43 source-
creation transaction. “Day” values, if later approved, mean exact 24-hour
periods. Tenant, browser, worker, server-process, recipient, and provider time
zones do not change the threshold.

**Benefits:** smallest and most deterministic model; no holiday calendar,
Tenant-zone requirement, DST ambiguity, or tzdb-driven reinterpretation. It
fits a courtesy nudge with no promised local date or deadline and is easiest to
replay, test, migrate, and explain as **after the request has been waiting for
the selected interval**.

**Cost:** the threshold can occur outside local working hours and “days” must be
worded/tested carefully so users do not infer civil or business days. Later
channels may apply separately governed quiet-time/usefulness fences without
changing the source instant.

### Option 2 — request-anchored Tenant-local civil or working calendar

Phase 12 converts creation to a civil date in one governed Tenant IANA zone,
advances the later code-owned number of calendar days, and resolves one defined
local-time occurrence using pinned zone/resolver evidence. A higher-complexity
variant may count only Tenant-governed working days, excluding governed weekends
and holidays; that variant requires independent evidence and explicit calendar
authority rather than emerging from “days” by convention.

**Benefits:** “after N calendar days” can match a familiar administrative
calendar and land at a consistent Tenant-local time. A proved working-calendar
variant could align with a genuinely shared staffed-office schedule.

**Cost:** Core must govern a Tenant access-operations time zone, DST gaps/
overlaps, tzdb changes, missing/invalid configuration, and global-coordinator
expectations. Working days additionally require authoritative calendars,
jurisdictions, observed holidays, regional teams, calendar revisions, and
historical interpretation. Distributed ministries may not have one meaningful
calendar. This is more machinery than current evidence justifies.

### Option 3 — restart elapsed time at each D44 responsibility generation

The source uses elapsed time, but every committed D44 responsibility-generation
change for the pending request replaces the temporal anchor. Carla receives a
fresh interval after replacing Ana even though the request itself is older.

**Benefits:** reduces the chance that a newly responsible coordinator receives
D44 reassignment attention and the courtesy reminder close together. It gives a
new cohort a full interval before the one reminder.

**Cost:** couples routing to time, makes a coordinator edit a hidden snooze/
reschedule action, permits repeated route or eligibility churn to postpone the
one occurrence indefinitely, complicates replay and audit, and creates an
incentive to manipulate routing rather than resolve the request. Okta's current
review model expressly avoids extending the review merely because it is
reassigned. D44 already gives a new coordinator a task and responsibility-
update attention, so another full reset is not necessary for recovery.

### Recommendation and exact question

**Recommend Option 1 — one elapsed duration from the authoritative D43 source-
created instant.** It is the clearest permanent default for a single
optional courtesy nudge that has no due-date or legal/business-calendar
meaning. It minimizes brittleness and technical debt while preserving a clean
later seam for channel quiet-time rules. Option 2 is the strongest alternative
if representative research establishes a Tenant-local civil or working-
calendar promise. Option 3 directly addresses D49's possible duplicate-pressure
tradeoff but should be rejected because responsibility churn must not silently
move source time or postpone attention indefinitely.

**Which D50 clock should Core record: Option 1 — elapsed duration from the
authoritative D43 source-created instant, Option 2 — Tenant-local civil
or working-calendar time anchored to D43 creation, or Option 3 — elapsed time
restarted by each D44 responsibility generation?** You may amend any option.

## Evidence limits

- Current vendor documentation proves stable review audiences and explicit
  reassignment are mature patterns; it does not prove ministry demand, Core's
  one-to-three cardinality, or any D50 value.
- Entra's instance snapshot is not copied blindly because Core's D44 current-
  responsibility model is a governing repository decision with a different
  source lifecycle.
- Okta/SailPoint/Salesforce fallbacks, delegation, reassignment, escalation, and
  default decisions are explicitly outside D49.
- CMS/nonprofit examples support separation of assignment, visibility,
  notification, and audit; they are not authorization precedent.
- PostgreSQL/Supabase sources establish available safety primitives and bypass
  hazards, not the final schema or lock strategy.
- WCAG/GOV.UK guidance establishes accessibility and restraint principles, not
  Core's exact Base Maia component composition.
- Representative ministry comprehension, attention-volume, reassignment-
  overlap, accessibility, and performance evidence remain mandatory before
  activation.

## Final research disposition

**Accept with required amendments.** Seal one complete current D44 assignment
cohort in the one Phase 12 source occurrence transaction, distinguish terminal
proved zero from retryable indeterminate, replay the immutable result, and
allow every downstream path to suppress only. Preserve D43/D44 source and task
truth, current authorization, Tenant isolation, privacy, repairability, and
quiet accessible UX. Add nothing executable now. Ask D50 next.
