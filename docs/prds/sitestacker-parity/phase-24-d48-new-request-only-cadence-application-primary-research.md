# Phase 24 D48 — New-Request-Only Cadence Application Primary Research

**Date:** 2026-08-29  
**Decision:** Option 1 — the first non-Off D47 cadence applies only to D43
request episodes whose authoritative source-creation mutation linearizes after
the trusted policy-effective boundary  
**Status:** Founder-selected decision, adversarially reconciled for specification  
**Scope:** first Off-to-non-Off application cohort only; no reminder activation,
policy value, recipient binding, clock, channel, schema, worker, telemetry, or UI
placeholder

> **Post-D49 historical note (2026-08-29):** Earlier D49 options and statements
> that recipient binding remains open preserve the D48-time evidence snapshot.
> D49 has since selected one source-atomic exact current D44 responsibility
> cohort, with each member bound to recipient generation plus Active Tenant
> Assignment, terminal proved zero, unreleased indeterminate retry on the same
> occurrence, and monotonic narrowing only. D50 has since selected one immutable
> request-anchored elapsed eligibility instant from exact seconds and a trusted
> source-created instant captured after this D48 serialization; it is no due
> date or delivery promise. D51 has since added source-fenced Off and prospective
> re-enable; D52 has fixed finite half-open source usefulness and no catch-up;
> D53 now keeps every candidate absent until a D47 evidence-qualified proposal
> later passes a separate full activation. D54 local presentation is next. D48–
> D53 add no reminder/runtime artifact.

## Purpose and research standard

D48 resolves one dependency left deliberately open by D47: whether the first
later non-Off courtesy-reminder policy may enroll D43 request episodes that were
already pending while the Tenant policy was Off. The founder selected **new
request episodes only**. Existing pending episodes are permanently outside that
first activation; only a source-creation mutation that is serialized after the
trusted effective boundary may record admission.

This research tests that choice against Core's governing source/authorization/
task/notification/workflow boundaries, current first-party IAM/CMS/CRM/nonprofit/
e-commerce documentation, PostgreSQL transaction and migration semantics,
accessible configuration UX, low-bandwidth recovery, and modern event-triggered
automation behavior.

D48 does not activate or reserve anything. Exact effects of later edits on
already-admitted work remain unresolved. At the D48 evidence point, recipient
binding and zero-member behavior were still reserved for D49; D50 decides
clock/calendar semantics. Later decisions
still choose evidence-backed cadence values, useful lateness, Off/change/
reschedule/cancellation behavior, presentation, channels, rollout activation,
and complete D46 proof.

Evidence labels are strict:

- **Repository fact:** verified in the current Core repository.
- **Verified external fact:** verified in current official first-party material.
- **Requirement inference:** required by an existing Core authority boundary.
- **Product judgment:** a deliberate Core choice where evidence permits more
  than one safe model.
- **Assumption:** plausible but not established by representative ministry
  evidence.
- **Unresolved unknown:** requires a later founder/source decision.

Vendor behavior is comparative evidence only. Core adopts no vendor workflow
engine, default interval, schema, UI component, or migration mechanism merely
because it demonstrates the prospective-policy pattern.

## Executive finding

**Disposition: Accept with required amendments.** New-request-only application
is the most modern, truthful, reliable first-activation policy for Core:

- SailPoint explicitly states that changed reminder, escalation, and timeout
  configuration affects only access requests created after the change; pending
  requests retain submission-time configuration.
- Microsoft Entra separates changes to the current access review from changes to
  future series instances instead of silently blending them.
- Okta limits active-campaign edits and applies certain context changes to future
  campaigns.
- HubSpot's publish review explicitly asks whether to enroll existing records or
  only records that meet criteria after activation; existing enrollment is a
  separate conscious choice.
- Salesforce event/transition-triggered scheduled paths run for new qualifying
  events rather than rescanning every already-qualifying record.
- Blackbaud keeps active/in-progress applications on their existing form or
  revision and directs future structure through new revisions/cycles.
- Stripe creates a new Price for a changed amount and leaves existing
  subscriptions on their current Price until an explicit subscription update.

These products do not prove every prospective-only rule is correct. They do
show a mature recurring principle: configuration publication and migration of
already-active records are separate decisions. Core needs that separation even
more because D43 concerns sensitive access, D44 already provides durable
recovery, and a retrospective age scan could generate an irreversible reminder
burst.

The corrected Core rule uses a database-authoritative serialization boundary,
not browser time, worker time, `created_at` comparison, deployment time, or a
background scan. The first non-Off policy publication and each D43 source-
creation command must participate in one deterministic source order. A newly
created episode records the exact admitted policy input atomically with the
episode and source receipt. An episode created before that boundary remains
outside forever, including after retry, replay, restore, migration, later
recipient assignment, or later age. A new successor episode created after the
boundary is evaluated as new work.

This keeps UX excellent and quiet. Current users see no D48 control now. After
all later gates pass, the first-enable editor can state plainly:
**Applies only to access review requests created after you save. Requests
already waiting aren't included. This doesn't set a due date or change
access.** No count query, bulk preview, confirmation ceremony, or
hidden backfill is needed. Existing work remains fully visible in Access
requests, with current personal Tasks Hub and required in-product attention
unchanged wherever D44 already provides them.

## Exact corrected D48 decision

1. D48 selects **new request episodes only** for the first transition from
   source policy Off to a later admitted non-Off cadence.
2. Every D43 request episode already pending before the trusted first-activation
   boundary is permanently outside that first non-Off application.
3. An old pending episode never becomes admitted merely because it remains
   pending, grows older, gains a coordinator, is opened,
   edited, restored, replayed, migrated, reindexed, reprojected, or observed by
   analytics or a worker.
4. A later, genuinely new D43 successor request episode created after the
   boundary is evaluated as new source work even when it concerns the same
   holder, grant, capability, or prior episode.
5. The relevant boundary is a source-database serialization fact, not a
   comparison of application timestamps. Policy publication and D43 source
   creation must have one deterministic authoritative order.
6. A request episode may record D47 admission only when its source-creation
   mutation linearizes after the committed non-Off policy head, freshly reads
   that exact current head under the source's concurrency boundary, and commits
   the episode plus admission evidence atomically.
7. A source creation that linearizes before policy publication is excluded even
   if a response, task, projection, worker, or notification appears later.
8. A source creation that begins before policy publication but is serialized
   after it may be admitted only if the trusted mutation re-reads and records the
   committed head before its own commit. A stale snapshot cannot claim admission.
9. Implementation must enforce that order with one product-database
   serialization mechanism—such as a stable Tenant/policy serialization key,
   transaction-level lock/CAS pattern, or serializable equivalent—rather than
   best-effort application ordering. The conflict namespace must exist even
   before the optional policy's first row; locking a missing row or only the
   per-request grant is insufficient. Exact SQL awaits design.
10. The authoritative source episode/receipt retains the evaluated policy head
    or equivalent immutable order evidence. No projection may reconstruct
    admission later from current settings and timestamps.
11. The policy version is evidence/input, never part of reminder uniqueness.
    One exact request episode can still create at most one reminder occurrence
    across every policy, recipient, channel, retry, replay, and executor path.
12. The request-creation command is durably idempotent. A retry before/after the
    boundary returns the same episode, admission outcome, and receipt and cannot
    convert an excluded episode into an admitted one or vice versa.
13. The first activation creates no write, flag, marker, schedule, occurrence,
    task, notification, email, or migration for existing pending episodes.
14. No backfill or “initialize eligibility” scan is permitted. Existing rows do
    not need a negative marker; absence of exact source admission means excluded.
15. Ordinary policy absence or explicit Off is an expected no-admission result
    and creates no incident noise. A stale/concurrent policy observation
    conflicts and is retried within a bounded source command. If an asserted
    active generation has missing, corrupt, unsupported, incomplete, or
    contradictory cadence proof, it must not strand the D43 request: the request
    commits with a typed safe non-admission disposition and durable minimized
    operations evidence, and can never age into admission later.
16. The first-enable impact summary is invariant and privacy-minimal:
    **Applies only to access review requests created after you save. Requests
    already waiting aren't included. This doesn't set a due date or change
    access.** It does not enumerate, count, or query
    current requests.
17. D48 does not add **Apply to current requests**, select-all, import,
    current-cohort preview, original-age scan, historical baseline, or override.
18. D48 does not decide how later non-Off edits, Off publication, policy removal,
    clock changes, or recipient changes affect request episodes already admitted
    after the first boundary. Those remain explicit later decisions.
19. D49 remains authoritative for whether recipient binding occurs at request
    creation, the possible source reminder occurrence, or another bounded source point, including
    zero-member and reassignment behavior.
20. D50 remains authoritative for elapsed/civil/working-day semantics, anchor,
    timezone, DST, tzdb, weekends/holidays, and useful-lateness behavior.
21. D48 creates no reminder value, source field/table, manifest key, Delivery
    Step, preference, event, queue, cron, Inngest function/sleep, feature flag,
    telemetry, or hidden/disabled UI placeholder.
22. Phase 12 remains the sole owner of policy publication, source creation,
    trusted order, admission evidence, episode lifecycle, and eventual reminder
    occurrence.
23. ADR-0183 Tasks Hub remains a projection. Task creation/display time, age,
    reminder/due field, assignment, engagement, edit, import, or rebuild cannot
    alter D48 admission.
24. ADR-0027/Phase 17/Phase 6 presentation, delivery, and provider evidence
    cannot enroll a request or reinterpret the boundary.
25. Inngest may later execute only identifier-only post-commit work for admitted
    source episodes after D49/D50 and every other gate. It owns no application
    cohort, boundary, policy head, request creation, or repair truth.
26. The first policy publication uses the D44-governed future Phase 12
    management boundary: current same-Tenant Active Tenant Assignment,
    `permissions.manage_grants`, registered policy-management purpose, and a
    trusted expected-head Phase 12 command. D48 creates no capability. Current
    broad MVP staff-role gates are migration inputs, not this future authority.
27. Tenant, actor, policy/source heads, command identity, and audit attribution
    come from trusted server context. Browser/route/event/worker/provider input
    cannot nominate the policy head, boundary, or admission. A supplied expected
    D43 source/request head is only a checked concurrency precondition and never
    authority.
28. All future persistence is `tenant_id NOT NULL`, same-Tenant composite, RLS-
    protected, least-privilege, and equivalent across views/functions/RPCs/
    service paths; exact schema is not frozen by D48.
29. Rollout readers fail closed before writers. A rollback can stop new
    admissions while preserving every source episode and immutable admission
    receipt; behavior for already-admitted episodes remains governed by later
    edit/Off decisions, not invented by D48 rollback.
30. Repair never rewrites old episodes by age. It reconciles source receipts and
    atomic handoffs, quarantines an impossible preboundary admission, preserves
    evidence, and requires incident review rather than direct database repair.

## Current behavior, intended behavior, and permanent path

| State                          | Verified position                                                                                                                                                                                                            | D48 consequence                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Current shipped behavior**   | D43–D48 are not shipped. Existing generic task reminders and contribution timers are unrelated runtime/migration inputs.                                                                                                     | No current record is admitted and no current schema or UI is a precedent.                |
| **Current governing design**   | D43 has one source-owned pending episode; D44 supplies complete lane plus optional personal responsibility; D45 supplies optional initial email; D46 supplies no reminder; D47 conditionally permits a future cadence class. | D48 can only decide future cohort admission and must preserve every no-runtime boundary. |
| **Selected first application** | Existing pending episodes stay outside; post-boundary source-creation commits may be admitted.                                                                                                                               | No historical scan, cohort operation, timer, or reminder is created.                     |
| **Permanent path**             | Serialize future policy publication and request creation in Phase 12; atomically record episode plus exact admission evidence; then resolve D49/D50 and later policy-edit/channel decisions before activation.               | New-only semantics remain explainable and executor-independent without schema debt.      |

## Governing Core evidence

| Repository evidence                                                                                                           | Verified finding                                                                                                                                             | D48 requirement                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| [Phase 24 decision log](./phase-24-multi-site-management-decision-log.md)                                                     | D48 offered new-only, deliberate apply-current, and automatic original-age inclusion; founder selected new-only.                                             | Record new-only precisely and remove every implicit current-cohort path.                               |
| [D47 primary research](./phase-24-d47-bounded-tenant-reminder-cadence-primary-research.md)                                    | D47 qualified a bounded Off-by-default policy class but left current/new application, recipient binding, and clock open.                                     | D48 closes only first application; D49/D50 remain open.                                                |
| [D47 adversarial review](./phase-24-d47-bounded-tenant-reminder-cadence-adversarial-review.md)                                | Implicit age inclusion creates storm, migration, privacy, and uniqueness hazards; reminder identity is request-episode based.                                | No policy version or current-cohort operation can mint another occurrence.                             |
| [D43 research](./phase-24-d43-governed-holder-access-review-primary-research.md)                                              | D43 owns exact request episodes/heads and permits only one pending episode for the source grain.                                                             | D48 admission attaches to a source episode at creation and cannot be inferred later.                   |
| [D44 research](./phase-24-d44-access-request-coordinator-routing-primary-research.md)                                         | D44 current-work application deliberately reaches existing requests through a separate previewed all-or-nothing command.                                     | That is evidence that retrospective impact is a separate operation, not authority to reuse it for D48. |
| [D45 research](./phase-24-d45-optional-initial-email-primary-research.md)                                                     | Enabling optional email widens only future source occurrences and sends no backlog.                                                                          | Supports prospective widening while remaining a separate channel contract.                             |
| [D46 research](./phase-24-d46-no-automatic-reminder-primary-research.md)                                                      | Existing age/time cannot create reminder eligibility; no placeholder or backfill exists.                                                                     | Existing pending episodes remain no-reminder source work.                                              |
| [Phase 12](./phase-12-full-role-permission-configuration.md)                                                                  | Source mutation uses exact heads, trusted authorization, Tenant-composite integrity, RLS, immutable audit, and advisory-lock patterns for grant-state races. | One source DB order must linearize policy activation and request creation.                             |
| [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)                                                 | D43/D44 are source-owned access governance through EffectiveAccess, not notification/task workflows.                                                         | Cohort admission cannot come from projections or labels.                                               |
| [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)                                            | Source-backed tasks do not own recurrence, completion, or source mutation.                                                                                   | Task materialization/rebuild cannot admit an old request.                                              |
| [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)                                              | Notification engagement is separate from source and task state.                                                                                              | Read/unread/history cannot alter D48 cohort.                                                           |
| [ADR-0026](../../adr/0026-contract-bounded-delivery-plans.md)                                                                 | Producers own occurrence eligibility/timing; Delivery Plans cannot invent source waits.                                                                      | Phase 17 cannot backfill old requests or decide cohort scope.                                          |
| [Workflow OpenSpec](../../../openspec/specs/workflow-orchestration/spec.md)                                                   | Product records/authorization/dispatch ledger/claims stay authoritative; events are identifier-only and executor disablement is recoverable.                 | Inngest cannot enroll, scan, or repair admission from age.                                             |
| [Platform principles](../../../openspec/specs/platform-principles/spec.md)                                                    | Tenant and permission correctness outrank convenience.                                                                                                       | A convenient backlog reminder cannot bypass source order or authorization.                             |
| [Core frontend rules](../../../docs/ai/rules/frontend.md) and [Base Maia configuration](../../../packages/ui/components.json) | Staff UI uses shared `@asym/ui`, Base UI, Base Maia/Zinc, accessible forms, and trusted privileged writes.                                                   | Future impact copy fits existing grammar; no custom migration/scheduler control.                       |

## Current official external evidence

### IAM and access governance

| Official source                                                                                                                                      | Verified fact                                                                                                                                               | D48 implication                                                                                                     | Evidence limit                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [SailPoint — reminder, escalation, and timeout policies](https://documentation.sailpoint.com/saas/help/requests/config_emails.html)                  | Changes affect only access requests created after the change; pending requests retain the configuration present when submitted.                             | Directly validates new-request-only temporal-policy application and version evidence.                               | SailPoint also has timeout/escalation/repeat complexity Core rejects.       |
| [Microsoft Entra — create/update access review](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)                          | Recurring review settings distinguish **Current** from **Series**; Series changes affect future recurrences while Current changes target the active review. | Current and future application should never be conflated in one implicit save.                                      | Entra campaigns differ from D43 episodes and permit explicit current edits. |
| [Okta — modify a scheduled campaign](https://help.okta.com/en-us/content/topics/identity-governance/access-certification/iga-ac-modify-campaign.htm) | Scheduled campaigns are editable before activation; active campaigns have limited actions; context changes can apply to future campaigns.                   | State/version boundaries protect active review work from silent policy reinterpretation.                            | Campaign scope and admin roles are not Core authorization.                  |
| [Okta — campaigns](https://help.okta.com/en-us/Content/Topics/identity-governance/access-certification/campaigns.htm)                                | A campaign becomes active at its start and cannot be generally modified afterward; failed launches are closed/auditable and recreated deliberately.         | Activation is a durable lifecycle boundary, not a worker timestamp.                                                 | D43 is not a campaign.                                                      |
| [GitHub — scheduled reminders](https://docs.github.com/en/subscriptions-and-notifications/concepts/scheduled-reminders)                              | Scheduled review reminders evaluate current requested reviews at scheduled times with explicit bounds.                                                      | Demonstrates why an age/current-set model is materially different from Core's selected event/new-episode admission. | GitHub's recurring grouped model is a contrast, not precedent.              |

### CRM, CMS, nonprofit, task, and e-commerce systems

| Official source                                                                                                                                                                                                | Verified fact                                                                                                                                                                     | D48 implication                                                                                                                         | Evidence limit                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [HubSpot — create workflows](https://knowledge.hubspot.com/workflows/create-workflows)                                                                                                                         | Review/publish explicitly asks whether to enroll existing matching records or only records meeting criteria after activation; existing enrollment is a separate conscious choice. | Confirms that current-record inclusion is material UX and new-only is a complete explicit option.                                       | HubSpot's generic workflow engine and estimated cohort list are not Core architecture. |
| [HubSpot — event enrollment triggers](https://knowledge.hubspot.com/workflows/set-event-enrollment-triggers)                                                                                                   | Event triggers enroll only events after activation; existing records require a different filter/manual path, and later segment-filter changes do not retro-enroll records.        | Source creation after activation is a modern event-bound admission model.                                                               | Marketing automation is less security-sensitive than D43.                              |
| [HubSpot — re-enrollment](https://knowledge.hubspot.com/workflows/add-re-enrollment-triggers-to-a-workflow)                                                                                                    | Re-enrollment is separately enabled and is not automatically retroactive; a record cannot re-enroll while already enrolled.                                                       | A later policy change must not silently create a second reminder identity.                                                              | Core rejects generic re-enrollment entirely for the one reminder.                      |
| [Salesforce — entry conditions for record-triggered flows](https://help.salesforce.com/s/articleView?id=platform.automate_flow_build_working_with_conditions_record_triggered_flows.htm&language=en_US&type=5) | New records meeting criteria trigger; already-qualifying records do not schedule a new path unless they transition into criteria; leaving criteria cancels pending paths.         | New qualifying events are distinct from rescanning old truth and reduce unnecessary runs.                                               | Salesforce's configurable flow is intentionally not adopted.                           |
| [Salesforce — scheduled paths](https://help.salesforce.com/s/articleView?id=platform.flow_concepts_trigger_scheduled_path.htm&language=en_US)                                                                  | Scheduled paths identify a trigger/time source, have explicit batches/limits, and pending paths may run under the currently active Flow version.                                  | Version ambiguity in queued work is a warning: Core must preserve evaluated policy evidence rather than load current code/policy later. | Salesforce system-context behavior is unsafe as Core authorization precedent.          |
| [Blackbaud Grantmaking — Forms designer](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/forms-designer.html)                                                                   | Changes to an active form are not reflected in currently in-progress applications.                                                                                                | A nonprofit product preserves in-flight records across future configuration change.                                                     | Forms are not reminders or access governance.                                          |
| [Blackbaud Grantmaking — default form](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/gc-grant-programs-assign-default-forms.html)                                             | A default form can be replaced only before applications exist; submitted applications retain consistency and later changes use revisions.                                         | Current work and future policy versions should remain distinct.                                                                         | Blackbaud may update some active form content; Core still needs its own exact rule.    |
| [Blackbaud Grantmaking — recent changes](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/what%27s%20recent.html)                                                                | Archived forms are removed from future use while remaining available to existing programs/cycles and preserving responses.                                                        | Deactivation can stop future adoption without deleting historical meaning.                                                              | Form archive is only a versioning analogy.                                             |
| [Stripe — manage products and prices](https://docs.stripe.com/products-prices/manage-prices)                                                                                                                   | A changed amount requires a new Price; archiving stops new use while existing subscriptions remain on the old Price until explicitly changed.                                     | Immutable version input plus explicit migration avoids retroactive reinterpretation.                                                    | Billing/financial semantics differ and do not choose D48 authorization.                |
| [Stripe — modify subscriptions](https://docs.stripe.com/billing/subscriptions/change)                                                                                                                          | Existing subscription changes are explicit and impacts such as proration can be previewed; pending updates can gate mutation on payment success.                                  | Existing-record migration is its own deliberate command with impact preview, not a side effect of a new default.                        | D48 rejects that extra current-work command rather than importing it.                  |

### Database, accessibility, UX, and execution

| Official source                                                                                                             | Verified fact                                                                                                                                      | D48 implication                                                                                                        | Evidence limit                                                                     |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [PostgreSQL 18 — transaction isolation](https://www.postgresql.org/docs/18/sql-set-transaction.html)                        | `READ COMMITTED` sees rows committed before each statement; `SERIALIZABLE` rejects transaction patterns that cannot match a serial order.          | Boundary semantics require a deliberate product serialization strategy, not transaction-start or browser timestamps.   | Exact mechanism depends on Core design/load.                                       |
| [PostgreSQL 18 — advisory lock functions](https://www.postgresql.org/docs/18/functions-admin.html#FUNCTIONS-ADVISORY-LOCKS) | Transaction-level advisory locks serialize application-defined resources and release automatically at transaction end.                             | Compatible with Core's existing advisory-lock convention for a Tenant/source policy boundary.                          | D48 does not mandate advisory locks over a row lock/serializable equivalent.       |
| [PostgreSQL 18 — `INSERT`](https://www.postgresql.org/docs/18/sql-insert.html)                                              | `ON CONFLICT DO UPDATE` guarantees an atomic insert-or-update outcome under concurrency and `RETURNING` reports actual results.                    | Durable command/request identity can make source creation retries stable.                                              | Blind upsert can run complex triggers and must not overwrite immutable admission.  |
| [PostgreSQL 18 — constraints](https://www.postgresql.org/docs/18/ddl-constraints.html)                                      | Composite uniqueness and non-null constraints make multi-column identities enforceable; partial uniqueness needs an index.                         | Request-episode and command identities belong in DB constraints rather than convention.                                | Exact future schema remains undecided.                                             |
| [PostgreSQL 18 — `ALTER TABLE`](https://www.postgresql.org/docs/18/sql-altertable.html)                                     | `NOT VALID` can enforce new writes before separately validating old rows with less blocking.                                                       | Additive rollout can protect post-boundary writes without rewriting old requests.                                      | Not every constraint supports `NOT VALID`; migration design must verify exact DDL. |
| [Supabase — RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)                                     | Grants and policies both matter; `USING` controls existing rows, `WITH CHECK` controls resulting rows, views/service roles need explicit scrutiny. | A caller cannot reassign Tenant/policy/admission through an allowed update.                                            | RLS is defense-in-depth, not the source command itself.                            |
| [GOV.UK — plan user research](https://www.gov.uk/service-manual/user-research/plan-user-research-for-your-service)          | Research should turn assumptions into questions, use reliable methods, and include disabled/support-needing users.                                 | Validate impact copy and user expectations with representative staff rather than assuming “future-only” is understood. | Research guidance does not choose Core's policy.                                   |
| [USWDS — radio buttons](https://designsystem.digital.gov/components/radio-buttons/)                                         | Explicit mutually exclusive options need visible labels, logical ordering, adequate targets, and cautious defaults.                                | Supports D47's future Off/value editor; D48 impact is helper/status text, not another cohort selector.                 | Core uses Base Maia, not USWDS components.                                         |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/)                                                                                   | Inputs, errors, status, target size, focus, reflow, and programmatic name/role/value have normative requirements.                                  | First-enable impact and save/recovery must remain accessible on mobile and assistive technology.                       | WCAG does not define source serialization.                                         |
| [Inngest — idempotency](https://www.inngest.com/docs/guides/handling-idempotency)                                           | Event/function idempotency lasts 24 hours.                                                                                                         | Executor dedupe cannot protect a policy/request boundary or permanent episode admission.                               | Inngest remains optional future execution only.                                    |
| [Inngest — cancellation](https://www.inngest.com/docs/features/inngest-functions/cancellation)                              | Cancellation cannot stop an executing step and does not prevent new runs.                                                                          | Executor cancellation cannot repair a wrongly admitted old request; product source evidence must prevent it.           | Exact future cancellation awaits later decisions.                                  |

## Evidence synthesis

### Verified conclusions

- Prospective-only changes are an explicit current pattern in IAM, CRM
  automation, nonprofit forms, and e-commerce versioning.
- Products that support existing-record application expose it as a separate
  deliberate choice or mutation; they do not treat it as an invisible default.
- Event-triggered automation needs an authoritative event after activation;
  scanning current truth is a different enrollment model.
- Active/in-progress records frequently retain the configuration or revision
  present when they entered the workflow.
- Database transaction ordering, not wall-clock comparison, is required to
  resolve policy-publication/request-creation races.
- Atomic request identity/idempotency is necessary because retries can cross the
  effective boundary.
- Existing rows can remain valid without a backfill; new-write constraints and
  later validation support additive rollout.
- Core already has enough durable current-work recovery that retrospective
  reminder enrollment is not needed as a workaround.

### Product judgments

- New-only first activation is safer and clearer than building a current-cohort
  application command before evidence proves that workflow.
- One nonnumeric existing-request consequence sentence is the clearest impact
  preview because the result is invariant and requires no census or protected
  count query.
- Permanent exclusion attaches to the exact old request episode, not the person,
  holder, grant, or capability forever; a truly new successor episode is new.
- One database serialization order is preferable to comparing timestamps with
  ambiguous equality/clock/skew semantics.
- Historical preboundary rows need no negative marker. A post-rollout request
  whose optional cadence proof is persistently unavailable records a typed safe
  non-admission disposition in its own source receipt so the request remains
  valid and diagnosable without creating a backfill surface.
- Policy input must be immutable evidence but not uniqueness, otherwise a later
  policy head could mint a second reminder.
- D48 should not pre-decide later edit, Off, recipient, or clock behavior merely
  to make a schema look complete.

### Assumptions and unresolved unknowns

- **Assumption:** Tenant administrators will understand prospective-only
  behavior when shown the exact nonnumeric impact sentence. This needs future
  usability/comprehension proof.
- **Assumption:** no representative ministry need currently justifies a separate
  apply-current command. Evidence can reopen that as a new founder decision.
- **Unresolved:** D49 recipient binding, zero-member outcome, reassignment, and
  per-recipient fanout timing.
- **Unresolved:** D50 clock/calendar semantics and exact source-clock anchor.
- **Unresolved:** exact later policy-edit, Off, reschedule, cancellation, and
  already-admitted-work effects.
- **Unresolved:** evidence-backed non-Off values, useful-lateness ceiling,
  presentation steps, external channels, and personal preferences.
- **Unresolved:** exact persistence/lock/index design; only its observable
  transaction and authorization properties are decided.

## Authoritative boundary and transaction contract

### Semantic order

The future source must expose one total order for two command classes within an
exact Tenant/source-policy boundary:

1. publish the first non-Off policy head; and
2. create one D43 request episode.

The policy command's committed head/receipt defines the effective boundary. A
request creation is admitted only when its mutation is serialized after that
head, re-proves the current non-Off head, and commits its source episode,
evaluated policy evidence, audit, semantic receipt, and identifier-only
projection/dispatch intent atomically. “Created after” therefore means database
source order, not client initiation, HTTP receipt, UUID order, worker receipt,
`now()` from another transaction, task creation, or notification delivery.

### Race outcomes

| Concurrent order                                                                                                               | Required result                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Request creation serializes and commits before first policy activation                                                         | Episode is permanently outside first activation.                                                              |
| First policy activation serializes and commits before request creation                                                         | Episode may record admission, subject to later D49/D50/value/source gates.                                    |
| Request begins first but waits; policy commits first; request then re-reads current head under the shared boundary and commits | Episode may record admission because authoritative serialization is after activation.                         |
| Request read old head and attempts to commit after policy changed without reproof                                              | Conflict/retry inside the trusted source command; it cannot commit stale or guess admission.                  |
| Policy save response is lost and actor retries                                                                                 | Same command identity returns the same head/effective boundary; no second activation.                         |
| Request response is lost and requester retries after activation                                                                | Same request command returns the original episode/admission result; it cannot cross the boundary twice.       |
| Two equivalent request creations race                                                                                          | Source pending-episode/command uniqueness converges or one conflicts; no duplicate episode/reminder identity. |
| Restore/replay reprocesses preboundary request                                                                                 | Original receipt/source evidence keeps it excluded; current policy cannot reinterpret it.                     |

### What remains unchosen

D48 does not mandate a table layout, a timestamp column, an advisory-lock key,
an isolation level, a trigger, or `ON CONFLICT` SQL. Design must choose the
smallest repository-consistent mechanism that proves the outcomes above and
does not hold a broad Tenant lock during network calls. No policy/request
transaction may call providers or wait on Inngest.

## Source of truth and invariants

1. D48 creates no current runtime, schema, configuration, UI, or telemetry
   artifact.
2. First activation has one immutable Tenant/source policy head and trusted
   source-order boundary.
3. Every preboundary pending request episode remains excluded from first
   activation permanently.
4. Only a post-boundary source-creation mutation can record admission.
5. Admission evidence commits atomically with the exact D43 episode and source
   receipt; it is never reconstructed from current settings.
6. Missing/unknown/corrupt evidence is excluded.
7. One request command identity produces one episode and one immutable admission
   result across retries.
8. One exact request episode can create at most one reminder meaning; policy
   heads, recipients, channels, tasks, and retries cannot create another.
9. A successor episode is distinct source work and is evaluated at its own
   creation boundary.
10. Current record age, `created_at`, source open time, task time, projection
    time, and worker time do not enroll an old episode.
11. First policy enable performs zero writes/mutations/fanout over existing
    pending episodes.
12. Phase 12 source records and receipts are authoritative; every other layer is
    projection/evidence only.
13. Tenant/actor/policy/source/admission facts are trusted-server derived.
14. Every relationship remains same-Tenant and every future tenant row is
    non-null/RLS protected.
15. Current `permissions.manage_grants` plus registered policy-management
    purpose is the management boundary; no new D48 capability exists.
16. Existing Access requests lane, task, and notification remain complete and
    truthful for excluded old episodes.
17. Exclusion does not mark work late, missed, grandfathered, legacy, degraded,
    or less important.
18. Later policy edits, D49 recipient binding, D50 clock, and channel decisions
    cannot retroactively alter the D48 first-activation cohort.

## UX/UI and user journeys

### Current product — no D48 UI

- No reminder/cadence/application control, “new only” badge, legacy status,
  placeholder, or explanation appears before the later feature is fully admitted.
- Existing pending requests continue to show only truthful D43/D44/D45 state.
- No user is told they “missed” a reminder that did not exist.

### Future first-enable Tenant administrator journey

After D49/D50, values, and presentation/channel contracts are ratified, the
future source-policy editor stays in Phase 12 **People & access → Access
requests**. One Base Maia form presents D47's explicit Off-or-reviewed-value
choice. When the draft changes from Off to a non-Off value, a quiet in-flow
impact summary appears before Save:

> **Applies only to access review requests created after you save.**  
> **Requests already waiting aren't included.**  
> **This doesn't set a due date or change access.** Existing tasks and in-product
> attention do not change.

The copy uses “new access reviews,” not “future people,” “grandfathered,” or
“backfill.” It contains no private count query, coordinator count, holder data,
provider jargon, predicted send time, or delivery guarantee. It does not offer
**Apply to current**, **Include pending**, or a checkbox that undermines the
selected policy.

The administrator reviews the explicit cadence draft and impact, then chooses
**Save changes** or **Cancel**. There is no autosave and no destructive/bulk
confirmation modal because first activation has no existing-record effect.
Save is disabled while unchanged/pending. Expected-head conflict and ambiguous
network response produce persistent inline recovery and authoritative receipt,
not toast-only success or blind retry.

Later edits from one non-Off value or Off effects use later-ratified impact copy;
D48's first-enable sentence must not be reused if it becomes false.

### Existing coordinator journey

- Existing pending episodes remain in the complete Access requests lane and
  existing source-backed Tasks Hub/in-product projections.
- First policy activation creates no new item, unread state, email, badge,
  priority, due state, or task mutation for them.
- Later assignment as coordinator does not enroll an old episode; responsibility
  and temporal admission remain separate.
- Existing staff do not need to learn a “legacy request” concept. The UI simply
  remains truthful and quiet.

### New request journey after future activation

- Source creation atomically records its immutable application evidence before
  any task/notification materialization.
- The requester sees the same D43 submitted state; no promise reveals or derives
  the hidden cadence, recipient, or expected response date.
- D49 later decides who could receive the eventual one reminder. D50 later
  decides when. Until then, even an admitted new episode produces no reminder.

### Holder, donor, missionary, public, and operations journeys

- Holders receive no new message/status from D48 and cannot infer staff activity.
- Donor, missionary, public CMS, unrelated staff, AI, support, and operator
  surfaces receive no cohort/admission data or action.
- Operations inspect source receipt/head/admission evidence through authorized
  product tooling only after implementation. No age-based repair button or
  “re-run backfill” exists.

### Accessibility, mobile, localization, and low bandwidth

- Reuse shared `@asym/ui`, Base UI behavior, Base Maia/Zinc tokens, visible
  labels/descriptions, semantic status, visible focus, keyboard operation,
  forced colors, reduced motion, and no color/icon-only meaning.
- Meet WCAG 2.2 AA, Core's 44-CSS-pixel important-target rule, 320-CSS-pixel/
  400-percent reflow, text spacing, screen-reader order, and mobile-safe wrapping.
- Localize complete impact sentences and support RTL/CJK/long translations; the
  invariant numeric zero remains part of a localizable message, not string
  concatenation.
- A weak connection preserves the local draft and one command identity; after
  timeout, the UI reads the authoritative receipt/head before offering retry.
- Save status is persistent/programmatic and does not steal focus. No transient
  toast is the only evidence.

## Edge, failure, and race matrix

| Scenario                                                      | What could go wrong                                 | Required result                                                                                          |
| ------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| First non-Off save with 10,000 pending requests               | Full scan/backfill storm                            | Zero current-row reads/writes/fanout are needed for application; impact is always zero.                  |
| Request commits immediately before boundary                   | Timestamp rounding admits it                        | Source serialization records excluded regardless of later wall time.                                     |
| Request begins before but serializes after boundary           | Stale snapshot excludes/adopts inconsistently       | Trusted source mutation re-reads current head under one order and records deterministic result.          |
| Policy and request commands deadlock/retry                    | Duplicate or different result                       | Deterministic lock order/retry plus durable command receipts; same logical command returns same outcome. |
| Request HTTP response is lost; retry occurs after activation  | Excluded request becomes admitted                   | Original command identity/episode/receipt is returned unchanged.                                         |
| Two tabs submit the same request around boundary              | Two episodes with different application             | Pending-episode/command uniqueness converges or conflicts; never two.                                    |
| Old request gets a new coordinator                            | Assignment update enrolls it                        | No; D44 recipient change cannot alter D48 admission.                                                     |
| Old request is edited/commented/opened                        | Activity resets source age                          | No admission or temporal effect.                                                                         |
| Old request is withdrawn and later a new request is submitted | Person is permanently excluded                      | New successor episode is evaluated at its new source creation.                                           |
| Migration adds future fields                                  | NULL/default accidentally means On                  | Missing/unknown resolves excluded; no backfill/default writes.                                           |
| Worker scans `created_at` after deployment                    | Old requests become admitted                        | Such scan is forbidden and fails contract/release audit.                                                 |
| Current policy is loaded by a delayed worker                  | History is reinterpreted                            | Worker uses immutable source admission evidence and cannot enroll.                                       |
| Backup restore precedes activation then replays commands      | Boundary/order changes                              | Durable command/head/episode identities converge; no wall-clock reclassification.                        |
| Policy activation response is ambiguous                       | Admin double-enables                                | Expected-head command identity resolves one head/receipt.                                                |
| Feature/runtime rollback                                      | Admitted records are deleted or old rows backfilled | Preserve all source evidence; stop new admissions; later decisions own already-admitted effects.         |
| Cross-Tenant request/head pair                                | Another Tenant's policy admits it                   | Same-Tenant composite proof/RLS rejects uniformly.                                                       |
| Service-role worker bypasses RLS                              | Old/cross-Tenant episode is marked admitted         | Service path must call equivalent trusted source proof; direct mutation prohibited/audited.              |
| Clock skew or DST boundary                                    | Episode crosses boundary incorrectly                | Cohort boundary uses source serialization, not civil time; D50 separately governs reminder time.         |
| Low-bandwidth save commits but UI times out                   | User repeats and creates another boundary           | Receipt recovery shows the one committed head.                                                           |

## Full adversarial category review

| Category                                                          | Material concern? | What could go wrong and why it matters                                                                                                     | Severity / likelihood | Evidence and effect on Option 1                                                            | Permanent fix and exact spec language                                                                                                                                                     |
| ----------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Problem validity, necessity, and alternatives**                 | **Yes**           | A current-cohort command could solve a hypothetical backlog while existing lane/task/attention already recover work.                       | High / High           | No validated need justifies retrospective fanout; SailPoint directly uses new-only.        | **“First non-Off activation applies only to post-boundary source-created episodes; existing pending work remains on established recovery surfaces and receives no reminder enrollment.”** |
| **Brittleness**                                                   | **Yes**           | Timestamp comparisons, mutable current policy, or worker scans depend on clocks/order assumptions and break under concurrency/retry.       | Critical / High       | PostgreSQL semantics show snapshot/order differences; policy products version active work. | **“Use one source-database serialization order and immutable episode admission evidence; never reconstruct from current policy/time.”**                                                   |
| **Technical debt**                                                | **Yes**           | Backfill flags, negative markers, migration jobs, cohort tables, or Apply-current UI become permanent second workflows.                    | High / High           | Option 1 needs none.                                                                       | **“Create no current-cohort artifact, negative marker, historical scan, or generic enrollment mechanism; absent exact admission is excluded.”**                                           |
| **Edge cases**                                                    | **Yes**           | Boundary equality, request/policy races, retries, successor episodes, restore, recreated assignments, and stale workers can misclassify.   | Critical / High       | Exact vendor patterns do not solve Core races.                                             | **“The complete race matrix and deterministic source receipts are release-blocking; D49/D50 remain separate.”**                                                                           |
| **Footguns**                                                      | **Yes**           | A checkbox, import, admin script, current-policy join, or retry can silently enroll old requests.                                          | High / Medium–High    | HubSpot makes existing enrollment explicit; D48 rejects it.                                | **“Expose no Apply current/include pending path and reject every non-source writer or age-derived admission.”**                                                                           |
| **Tenant safety**                                                 | **Yes**           | Shared policy cache/lock/event can apply Tenant A's boundary to Tenant B or bare identity can cross scope.                                 | Critical / Medium     | Core/OpenSpec requires Tenant product boundaries.                                          | **“Tenant-key every policy/source/order/command/claim/cache; enforce same-Tenant composites and uniform denial.”**                                                                        |
| **Database, RLS, and authorization safety**                       | **Yes**           | Caller-selected Tenant/head/admission or weak `WITH CHECK` can transform excluded/cross-Tenant rows; service role may bypass RLS.          | Critical / Medium     | Supabase documents grants plus `USING`/`WITH CHECK` and service bypass.                    | **“Trusted Phase 12 command derives all authority; `tenant_id NOT NULL`, same-Tenant FKs, least grants, matching policies, and equivalent RPC/service proof are mandatory.”**             |
| **Overengineering**                                               | **Yes**           | Serializable global locks, cohort snapshots, temporal tables, event sourcing, or generic migration engines may exceed one boundary need.   | High / Medium         | Core has existing transaction/head/lock conventions.                                       | **“Choose the smallest bounded DB serialization mechanism; no network call under lock and no generic policy/enrollment engine.”**                                                         |
| **UX/UI and user friction**                                       | **Yes**           | Admins may expect current work included, hidden zero impact may confuse, or extra confirmation/settings noise may burden small ministries. | High / High           | HubSpot proves application scope needs explicit review; Base Maia/WCAG guide form quality. | **“Show one exact first-enable impact sentence before explicit Save; no current-work selector, count query, modal, autosave, or toast-only result.”**                                     |
| **Source of truth, ownership, and domain invariants**             | **Yes**           | Task/notification/provider/worker/current policy could become a second cohort authority.                                                   | Critical / High       | Core ADRs clearly separate source and projections.                                         | **“Phase 12 source episode/receipt alone owns D48 admission; every projection consumes but cannot create/alter it.”**                                                                     |
| **Hidden coupling**                                               | **Yes**           | D44 current-work application, D45 future email, finance timers, task fields, or feature flags could accidentally define D48.               | High / High           | Adjacent behaviors differ deliberately.                                                    | **“Closed D48 source contract rejects D44/D45/finance/task/flag inference; each remains independent.”**                                                                                   |
| **Failure modes**                                                 | **Yes**           | Commit succeeds but response/handoff fails; partial source/projection writes; ambiguous retry changes boundary.                            | Critical / High       | Workflow OpenSpec and Postgres atomicity provide permanent pattern.                        | **“Episode, admission evidence, receipt, audit, and identifier-only handoff commit atomically; recovery reads source truth and same command identity.”**                                  |
| **Lifecycle, temporal correctness, concurrency, and idempotency** | **Yes**           | Two legal commands can yield no serial answer; a retry across activation can flip result; a successor can be mistaken for old episode.     | Critical / High       | PostgreSQL serializable/advisory/unique facilities can enforce one order.                  | **“Linearize activation and creation, pin immutable result, make request commands idempotent, and distinguish source successor episodes; policy version never changes uniqueness.”**      |
| **Data integrity risks**                                          | **Yes**           | Duplicate episodes, nullable defaults, orphan policy evidence, partial migration, or rebuilt projections can corrupt cohort reporting.     | High / Medium         | DB constraints and atomic source receipts prevent invalid states.                          | **“Use non-null/composite/unique/check constraints as applicable, no default-On, no backfill mutation, immutable receipts, and deterministic projection rebuild.”**                       |
| **Security and privacy risks**                                    | **Yes**           | Cohort scans/counts reveal sensitive request volume or identities; logs/events copy policy/access details.                                 | High / Medium         | New-only has an invariant zero impact and needs no cohort query.                           | **“Impact preview is static authoritative zero; identifier-only execution/logs, purpose-limited audit, no tracking/scoring, and fresh source authorization.”**                            |
| **Scalability and performance risks**                             | **Yes**           | Activation scans/writes millions of pending rows or takes a Tenant-wide lock too long; hot policy head causes contention.                  | High / Medium         | Option 1 eliminates current scans; DB lock scope still needs benchmarks.                   | **“First activation is O(1) in existing request count; source commands use short DB-only bounded serialization and production-shaped contention budgets.”**                               |
| **Operational burden**                                            | **Yes**           | Operators need manual backfill, timestamp repair, or DB edits when admission disagrees.                                                    | High / Medium         | Source receipts enable deterministic diagnosis.                                            | **“Provide read-only explain/receipt and governed quarantine/reconcile/kill paths; never ordinary direct DB repair or run-backfill.”**                                                    |
| **Observability and auditability gaps**                           | **Yes**           | Logs cannot show which side of boundary won or why a request was excluded; executor history is incomplete.                                 | High / Medium         | Product audit must outlive workers/vendors.                                                | **“Durable business history records command/head/source order/admission reason; technical traces remain secondary and no monitor becomes writer.”**                                       |
| **Dependency and integration risks**                              | **Yes**           | Inngest, provider, cache, realtime, or tzdb behavior might reinterpret cohort or replay old work.                                          | High / Medium         | D48 needs none of them for source order.                                                   | **“Boundary and admission are product-DB complete and valid with every integration disabled; events carry identifiers only.”**                                                            |
| **Migration, rollout, and upgrade risks**                         | **Yes**           | Old code/new schema defaults old rows On; new code/old schema guesses; backfill storms; rollback deletes evidence.                         | Critical / High       | Postgres supports additive new-write enforcement; products preserve active records.        | **“Readers deny first; additive writer later; no historical backfill; missing/unknown excluded; shadow proof; immutable receipts; kill stops new admission; roll-forward repair.”**       |
| **Testability, traceability, and proof**                          | **Yes**           | “Created after” is vague without linearization; docs/tests may compare timestamps differently.                                             | Critical / High       | Transaction semantics make the ambiguity concrete.                                         | **“Define created-after as authoritative source serialization, prove every race/idempotency/migration/a11y scenario, and trace identical language across artifacts.”**                    |
| **Other development hazards**                                     | **Yes**           | AI/support/import/admin scripts, clock skew, restore, cache, prefetch, analytics, or manual SQL may bypass the boundary.                   | High / Medium         | Alternate paths are plausible in a broad platform.                                         | **“Close every writer/read cache/automation path; flags never authorize; restores preserve receipts; AI/support/import cannot enroll; release audit rejects age scans.”**                 |

Every category contains a material concern under an unqualified “new requests
only” answer. The amendments resolve those concerns without adding a current
feature or speculative schema.

## Final disposition and ruthless synthesis

### Final disposition

**Accept with required amendments.** New-request-only is the correct first
application because it is explicit, O(1) in current request count, privacy-
minimal, reversible before any reminder is admitted, and aligned with strong
current IAM/CRM/nonprofit/e-commerce versioning evidence. It does not authorize
implementation until D49, D50, values, lifecycle edit rules, content/channels,
and D46 proof close.

### Resolve before recording

1. Define “new” by source-database serialization, not a timestamp comparison.
2. Make old pending episode exclusion permanent for first activation.
3. Make request creation idempotent across the boundary and policy version
   immutable evidence rather than uniqueness.
4. Reject current-cohort/backfill artifacts and preserve D49/D50/later edit
   decisions.

### Capture in spec/design

1. Trusted management authority and expected-head policy publication.
2. Atomic source creation/admission/receipt/handoff and deterministic race table.
3. No-backfill migration, fail-closed old-row behavior, repair, rollback, and
   audit semantics.
4. Exact first-enable impact copy and complete Base Maia/WCAG/low-bandwidth
   journey.
5. Request-episode-based at-most-once identity across later policy/recipient/
   channel changes.

### Require before later implementation

1. D49 recipient and zero-member decision.
2. D50 clock/calendar decision and evidence-backed values.
3. Later policy-edit/Off/reschedule/cancel/useful-lateness decision.
4. Schema/RLS/concurrency/migration threat model and production-shaped proof.
5. Phase 17/6 content/channel/privacy/accessibility contract and no-send canary.

### Named monitors without telemetry authorization

These labels govern evidence, CI, structural review, migration review, and
release audit. D48 creates no production telemetry pipeline, table, event,
dashboard, job, alert, or staff-performance measure.

| Monitor                                  | Signal and threshold                                                                                                                          | Owner                         | Required response                                                                                               |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `d48_preboundary_admission_total`        | Structural/fixture/release proof finds **more than 0** preboundary D43 episodes marked or treated as admitted                                 | Phase 12 + Security           | Block release, disable writer, quarantine impossible admission, preserve evidence, incident-review source path. |
| `d48_existing_request_write_total`       | First-enable test/migration plan performs **more than 0** writes to existing pending episodes                                                 | Database + Product Governance | Reject migration/design; remove backfill/current-cohort path; repeat proof.                                     |
| `d48_age_scan_artifact_total`            | Code/schema/job/query/worker review finds **more than 0** paths that derive admission from current policy plus historical age/time            | Architecture                  | Block release and remove path; restore source-receipt-only admission.                                           |
| `d48_linearization_proof_gate`           | Any policy/request race lacks one deterministic expected result or implementation proof                                                       | Phase 12 + Database           | Do not activate writer; complete concurrency design/tests and rerun review.                                     |
| `d48_request_retry_drift_total`          | Retry/replay of one durable request command returns a different episode or admission result **at least once**                                 | Phase 12                      | Kill writer, preserve receipts, reconcile affected commands, fix idempotency before resuming.                   |
| `d48_impact_copy_contradiction_total`    | UI/content audit finds **more than 0** first-enable surfaces omitting or contradicting prospective-only and existing-request-unchanged impact | UX + Content Design           | Block release, correct copy/semantics, rerun mobile/a11y/comprehension proof.                                   |
| `d48_new_capability_total`               | Authorization diff introduces **more than 0** D48-specific capabilities or label-derived edit paths                                           | IAM + Security                | Reject capability/path; restore D44 `permissions.manage_grants` + registered purpose boundary.                  |
| `d48_artifact_chain_contradiction_total` | Focused audit finds **more than 0** conflicting default/cohort/boundary/identity/D49/D50 statements                                           | Phase 24 docs owner           | Block handoff, reconcile all governing artifacts, repeat semantic audit.                                        |
| `d48_unadmitted_runtime_artifact_total`  | Before complete future admission, audit finds **more than 0** D48 schema/UI/job/event/flag/reminder artifacts                                 | Architecture + Product        | Remove/quarantine artifact and return to docs-only decision sequence.                                           |

## Research assertions

### Repository and governing facts

- **D48-RA001 — Repository fact:** D43–D48 are intended design and are not
  shipped runtime behavior.
- **D48-RA002 — Repository fact:** D43 defines one source-owned pending request
  episode for its exact grain and exact source heads.
- **D48-RA003 — Repository fact:** D43 request submission presently has no due,
  expiry, cadence, reminder, or no-response consequence.
- **D48-RA004 — Repository fact:** D44 always preserves the complete Access
  requests lane independently of personal recipients.
- **D48-RA005 — Repository fact:** D44 deliberately applies coordinator changes
  to current pending work through a separate previewed source command.
- **D48-RA006 — Repository fact:** D44's current-work behavior is not automatic
  authority for reminder cohort application.
- **D48-RA007 — Repository fact:** D45 optional email widening affects future
  source occurrences and sends no backlog.
- **D48-RA008 — Repository fact:** D46 creates no automatic reminder, age
  eligibility, or placeholder.
- **D48-RA009 — Repository fact:** D47 permits only a future bounded Off-by-
  default cadence class and leaves application/recipient/clock decisions open.
- **D48-RA010 — Repository fact:** D47 reminder uniqueness is request-episode
  based and excludes policy, recipient, channel, and executor dimensions.
- **D48-RA011 — Repository fact:** Phase 12 owns source heads, EffectiveAccess,
  trusted mutation, RLS, audit, and Tenant-composite integrity.
- **D48-RA012 — Repository fact:** Phase 12 already uses advisory-locked source
  mutation patterns for grant-state concurrency.
- **D48-RA013 — Repository fact:** D44 policy management uses current same-
  Tenant `permissions.manage_grants` plus registered purpose and expected head.
- **D48-RA014 — Repository fact:** ADR-0183 makes Tasks Hub a projection and
  forbids generic task state from mutating source truth.
- **D48-RA015 — Repository fact:** ADR-0027 keeps notification engagement
  separate from source actionability and task state.
- **D48-RA016 — Repository fact:** ADR-0026 makes the producer owner of occurrence
  eligibility/timing and forbids general Tenant-authored waits.
- **D48-RA017 — Repository fact:** Workflow OpenSpec keeps product records,
  authorization, dispatch ledger, and work claims authoritative.
- **D48-RA018 — Repository fact:** Workflow events are identifier-only and
  shared infrastructure must preserve Tenant boundaries.
- **D48-RA019 — Repository fact:** Executor disablement must leave product
  records and manual recovery valid.
- **D48-RA020 — Repository fact:** Current generic task and finance timer models
  are not D48 source authority.
- **D48-RA021 — Requirement inference:** D48 admission must be created only by
  Phase 12 source mutation.
- **D48-RA022 — Requirement inference:** Existing request/task/notification age
  cannot substitute for source admission.
- **D48-RA023 — Requirement inference:** The first-enable operation requires no
  current-request query or mutation.
- **D48-RA024 — Requirement inference:** D49/D50 and later policy-edit decisions
  must remain unresolved rather than inferred from a schema.

### Verified external facts

- **D48-RA025 — Verified external fact:** SailPoint says reminder/escalation/
  timeout changes affect only access requests created afterward.
- **D48-RA026 — Verified external fact:** SailPoint pending requests retain the
  configuration present at submission.
- **D48-RA027 — Verified external fact:** Microsoft Entra separates current-
  review settings from future-series settings.
- **D48-RA028 — Verified external fact:** Okta scheduled campaigns are editable
  before activation while active campaigns have limited mutation paths.
- **D48-RA029 — Verified external fact:** Okta can apply context-setting changes
  to future campaigns rather than silently changing the current one.
- **D48-RA030 — Verified external fact:** HubSpot publish review presents an
  explicit existing-record versus future-record enrollment choice.
- **D48-RA031 — Verified external fact:** HubSpot generally enrolls only records
  that meet triggers after workflow activation unless existing enrollment is
  deliberately selected.
- **D48-RA032 — Verified external fact:** HubSpot event triggers only enroll
  events occurring after activation.
- **D48-RA033 — Verified external fact:** HubSpot later segment-filter changes do
  not automatically retro-enroll newly matching old records.
- **D48-RA034 — Verified external fact:** HubSpot re-enrollment is separately
  enabled and does not retroactively enroll records by itself.
- **D48-RA035 — Verified external fact:** Salesforce new records meeting event
  criteria trigger scheduled paths.
- **D48-RA036 — Verified external fact:** Salesforce already-qualifying records
  do not schedule a new path merely because an unrelated field changes.
- **D48-RA037 — Verified external fact:** Salesforce pending paths can run under
  a new active Flow version, demonstrating version-drift risk.
- **D48-RA038 — Verified external fact:** Blackbaud active-form edits are not
  reflected in in-progress applications.
- **D48-RA039 — Verified external fact:** Blackbaud prevents default-form
  replacement after applications are associated/submitted.
- **D48-RA040 — Verified external fact:** Blackbaud supports new revisions to
  preserve submitted-application consistency.
- **D48-RA041 — Verified external fact:** Blackbaud archived forms remain usable
  for existing programs/cycles while removed from future selection.
- **D48-RA042 — Verified external fact:** Stripe requires a new Price for a
  changed amount.
- **D48-RA043 — Verified external fact:** Archiving a Stripe Price stops new use
  while existing subscriptions remain active on it.
- **D48-RA044 — Verified external fact:** Changing an existing Stripe
  subscription is an explicit separate update with previewable impact.
- **D48-RA045 — Verified external fact:** PostgreSQL `SERIALIZABLE` rejects
  concurrent patterns that cannot correspond to a serial execution.
- **D48-RA046 — Verified external fact:** PostgreSQL transaction-level advisory
  locks serialize application-defined resources until transaction end.
- **D48-RA047 — Verified external fact:** PostgreSQL `ON CONFLICT DO UPDATE`
  guarantees one atomic insert-or-update outcome under high concurrency.
- **D48-RA048 — Verified external fact:** PostgreSQL `NOT VALID` can enforce
  supported constraints on new writes before separately validating old rows.

### Corrected decision and authoritative ordering

- **D48-RA049 — Product judgment:** Accept new-request-only for the first non-Off
  cadence application.
- **D48-RA050 — Product judgment:** Existing pending episodes are permanently
  outside that first activation.
- **D48-RA051 — Product judgment:** A truly new successor episode is evaluated
  at its own creation rather than inheriting prior exclusion.
- **D48-RA052 — Product judgment:** No Apply-current command is justified now.
- **D48-RA053 — Product judgment:** New-only is O(1) in current pending volume
  and avoids disclosure through cohort counting.
- **D48-RA054 — Product judgment:** The exact impact sentence should state new-
  only and zero existing effects.
- **D48-RA055 — Requirement inference:** “After activation” must mean source-
  database serialization rather than client/worker/wall-clock order.
- **D48-RA056 — Requirement inference:** Policy publication and request creation
  need one deterministic authoritative order within Tenant/source scope.
- **D48-RA057 — Requirement inference:** A post-boundary request creation must
  re-read/prove the committed policy head before commit.
- **D48-RA058 — Requirement inference:** A stale source mutation cannot commit an
  admission guess after concurrent policy change.
- **D48-RA059 — Requirement inference:** Episode, evaluated policy evidence,
  receipt, audit, and identifier-only handoff commit atomically.
- **D48-RA060 — Requirement inference:** Admission is immutable source evidence
  and cannot be reconstructed from current policy and historical timestamps.
- **D48-RA061 — Requirement inference:** Policy version is evidence/input and
  never a dimension that creates a second reminder.
- **D48-RA062 — Requirement inference:** One request command identity returns one
  episode and one admission outcome across every retry.
- **D48-RA063 — Requirement inference:** A retry crossing activation cannot flip
  an already-created episode's result.
- **D48-RA064 — Requirement inference:** Missing/unknown/corrupt admission
  evidence resolves excluded.
- **D48-RA065 — Requirement inference:** Existing rows need no negative marker
  or backfill.
- **D48-RA066 — Requirement inference:** First enable performs zero writes,
  fanout, schedule, or occurrence creation for existing requests.
- **D48-RA067 — Requirement inference:** Task/notification creation or rebuild
  cannot change admission.
- **D48-RA068 — Requirement inference:** Coordinator assignment/reassignment
  cannot enroll an old episode.
- **D48-RA069 — Requirement inference:** Source editing/opening/commenting/
  analytics cannot create a new creation event.
- **D48-RA070 — Requirement inference:** Restore/replay preserves original
  command/head/episode identity and admission.
- **D48-RA071 — Requirement inference:** Same-Tenant non-null relationships and
  RLS protect every future policy/source/admission path.
- **D48-RA072 — Requirement inference:** Trusted D44 management authority is
  reused and D48 creates no capability.

### UX, security, failure, migration, and operations

- **D48-RA073 — Product judgment:** No D48 UI appears before the complete future
  reminder feature is admitted.
- **D48-RA074 — Product judgment:** The eventual first-enable impact appears in
  one source-policy editor rather than a modal or separate migration page.
- **D48-RA075 — Product judgment:** Prospective-only impact needs no count query,
  recipient enumeration, or bulk confirmation.
- **D48-RA076 — Product judgment:** Existing requests require no legacy,
  grandfathered, excluded, or missed-reminder badge.
- **D48-RA077 — Requirement inference:** Later non-Off/Off edit copy cannot reuse
  first-enable copy unless later semantics make it true.
- **D48-RA078 — Requirement inference:** Ambiguous save response recovers the
  authoritative head/receipt before retry.
- **D48-RA079 — Requirement inference:** Stale expected-head saves conflict
  rather than last-write-win.
- **D48-RA080 — Requirement inference:** Browser-supplied Tenant, actor, head,
  command time, or admission is rejected.
- **D48-RA081 — Requirement inference:** Both `USING` and `WITH CHECK`, grants,
  views/functions/RPCs, and service-role paths require explicit proof.
- **D48-RA082 — Requirement inference:** Cross-Tenant policy/source pairs fail
  uniformly without existence disclosure.
- **D48-RA083 — Requirement inference:** Events/logs/cache/analytics contain only
  purpose-minimized identifiers and no protected access detail.
- **D48-RA084 — Requirement inference:** AI, support, operators, imports, feature
  flags, and direct DB paths cannot enroll episodes.
- **D48-RA085 — Requirement inference:** First activation is independent of
  Inngest, provider, realtime, task, notification, and channel availability.
- **D48-RA086 — Requirement inference:** Product audit explains which command/
  head order decided admission after technical traces expire.
- **D48-RA087 — Requirement inference:** Impossible preboundary admission is
  quarantined and incident-reviewed rather than timestamp-rewritten.
- **D48-RA088 — Requirement inference:** A missing projection is rebuilt from
  source admission without changing it.
- **D48-RA089 — Requirement inference:** Rollback stops new admission but
  preserves all source episodes and immutable receipts.
- **D48-RA090 — Unresolved unknown:** Later edit/Off decisions govern already-
  admitted episodes during rollback; D48 cannot invent them.
- **D48-RA091 — Requirement inference:** Mixed-version missing/unknown fields
  fail excluded and never default On.
- **D48-RA092 — Requirement inference:** Additive rollout puts denial/readers/
  constraints before the admission writer.
- **D48-RA093 — Requirement inference:** No migration may scan or update existing
  pending episodes to establish D48 state.
- **D48-RA094 — Requirement inference:** Short source-DB serialization excludes
  network/provider/executor work while locks are held.
- **D48-RA095 — Requirement inference:** Performance proof measures lock
  contention and request throughput, while first activation remains O(1) in old
  request count.
- **D48-RA096 — Requirement inference:** UI meets Base Maia, WCAG 2.2 AA, mobile,
  screen-reader, forced-color, localization, RTL/CJK, and low-bandwidth recovery.

### Proof, sequencing, and next decision

- **D48-RA097 — Requirement inference:** Tests cover both serial orders and
  transactions that begin before but serialize after activation.
- **D48-RA098 — Requirement inference:** Tests cover duplicate tabs, lost
  responses, retries across boundary, and successor episodes.
- **D48-RA099 — Requirement inference:** Tests cover cross-Tenant, stale head,
  ended assignment, service role, cache, event, and projection rebuild paths.
- **D48-RA100 — Requirement inference:** Tests cover migration with many old
  rows and prove zero old-row writes/fanout.
- **D48-RA101 — Requirement inference:** Tests cover backup restore, replay,
  executor disablement, and roll-forward repair without reclassification.
- **D48-RA102 — Requirement inference:** UI proof covers exact impact copy,
  conflicts, ambiguous response, 320px/400% reflow, keyboard, and screen reader.
- **D48-RA103 — Product judgment:** Structural/CI/release monitors are sufficient
  now; D48 authorizes no production telemetry.
- **D48-RA104 — Requirement inference:** Every monitor names signal, threshold,
  owner, and human response and never becomes an enrollment trigger.
- **D48-RA105 — Requirement inference:** Rollout uses shadow comparison only on
  synthetic/new canary commands and never a production old-row age scan.
- **D48-RA106 — Requirement inference:** Kill switches gate writers/executors but
  do not authorize or delete source truth.
- **D48-RA107 — Requirement inference:** Artifact terminology stays identical
  from Grill through glossary/ADR/OpenSpec/design/tickets/tests/release evidence.
- **D48-RA108 — Product judgment:** Option 2 is strongest alternative but adds a
  separate cohort/baseline/confirmation/repair domain without validated need.
- **D48-RA109 — Product judgment:** Option 3 is rejected because one policy save
  silently turns historical age into new action and can burst.
- **D48-RA110 — Product judgment:** Option 1 is not inflexible because a future
  separately justified source decision can add an explicit current-work command.
- **D48-RA111 — Unresolved unknown:** D49 must choose request-creation,
  occurrence-current, or continuously current recipient binding.
- **D48-RA112 — Unresolved unknown:** D49 must define zero-member, reassignment,
  requester exclusion, and fanout finality.
- **D48-RA113 — Unresolved unknown:** D50 must choose elapsed, Tenant-local civil,
  or working-day clock semantics.
- **D48-RA114 — Unresolved unknown:** Later decisions choose exact values,
  useful-lateness, Off/change/reschedule, and presentation/channel behavior.
- **D48-RA115 — Product judgment:** Current-recipient resolution at the possible
  source reminder occurrence is the leading D49 option because responsibility
  may change.
- **D48-RA116 — Product judgment:** Creation-time recipient pinning with
  mandatory later narrowing avoids former recipients and near-reassignment
  duplication, but can miss replacements who have owned the work for a long
  time and breaks current-responsibility alignment.
- **D48-RA117 — Product judgment:** Continuously dynamic recipient binding risks
  channel disagreement and unbounded rerouting after occurrence.
- **D48-RA118 — Requirement inference:** Whatever D49 chooses, recipient inputs
  cannot alter one-reminder-per-request-episode uniqueness.
- **D48-RA119 — Requirement inference:** D49 recipient resolution must always
  freshly prove same-Tenant Active Tenant Assignment and action authority.
- **D48-RA120 — Product judgment:** Ask D49 next because recipient grain is needed
  before clock, member fanout, content, preferences, and channel proof.

## Falsifiable acceptance criteria

- **D48-AC001:** D48 records new-request-only first activation and no present
  reminder/runtime/schema/UI/telemetry authorization.
- **D48-AC002:** Every D43 episode pending before first activation remains
  excluded permanently from that activation.
- **D48-AC003:** Only a source-creation mutation serialized after the trusted
  effective head may record admission.
- **D48-AC004:** “Created after” is never implemented as browser, worker,
  deployment, projection, or uncoordinated wall-clock comparison.
- **D48-AC005:** Policy activation and request creation have one deterministic
  source-database order for every concurrency schedule, including the first
  activation when no optional policy row exists yet.
- **D48-AC006:** A request transaction with stale policy evidence conflicts/
  retries and cannot commit guessed admission.
- **D48-AC007:** Episode, evaluated policy input, admission result, audit,
  receipt, and identifier-only handoff commit atomically.
- **D48-AC008:** Request command retry returns the exact same episode/admission
  result even when the retry crosses activation.
- **D48-AC009:** Two equivalent concurrent request creations cannot produce two
  episodes or different admission results.
- **D48-AC010:** A new successor episode after withdrawal/terminal history is
  evaluated at its own creation boundary.
- **D48-AC011:** Policy version is immutable evidence and never part of reminder
  uniqueness.
- **D48-AC012:** One exact request episode can produce at most one reminder
  across every policy/recipient/channel/executor/retry path.
- **D48-AC013:** Ordinary absence/Off is an expected no-admission result and
  creates no incident. A stale/concurrent policy observation conflicts and
  receives a bounded whole-command retry. An asserted active generation with
  missing, corrupt, unsupported, incomplete, or contradictory cadence proof
  commits the valid D43 request with a typed safe non-admission disposition and
  durable minimized operations evidence; it never blocks My Access or later
  ages into admission.
- **D48-AC014:** First enable reads, writes, or fans out over no existing pending
  episode, regardless of the cohort's size or age.
- **D48-AC015:** No backfill, current-cohort table/snapshot, historical negative
  marker, initialization job, or Apply-current command exists. AC013's typed
  disposition belongs only to the newly committed request's source receipt and
  is not a historical marker or later enrollment surface.
- **D48-AC016:** Existing age, `created_at`, task/projection time, coordinator
  assignment, engagement, analytics, restore, or replay cannot enroll an old
  episode.
- **D48-AC017:** Current Access requests lane, task, and required in-product item
  remain complete/truthful for excluded episodes.
- **D48-AC018:** Existing requests receive no legacy/excluded/missed-reminder
  badge or downgraded priority.
- **D48-AC019:** D48 does not decide later edit/Off/reschedule effects on already-
  admitted episodes.
- **D48-AC020:** D49 recipient binding and D50 clock semantics remain explicit
  blockers before any reminder can occur.
- **D48-AC021:** Future first policy publication uses the D44-governed current
  same-Tenant Active
  Tenant Assignment, `permissions.manage_grants`, registered purpose, expected
  head, and trusted server command; no new capability.
- **D48-AC022:** Caller-controlled Tenant, actor, policy head, boundary,
  admission, recipient, or audit attribution is rejected. A caller-supplied
  expected D43 source/request head is checked only as a non-authorizing
  concurrency precondition.
- **D48-AC023:** Every future tenant row is non-null Tenant-scoped with same-
  Tenant composite relationships and least grants.
- **D48-AC024:** Positive/negative RLS tests cover `USING`, `WITH CHECK`, views,
  functions, RPCs, service role, cross-Tenant, and transformed-row attacks.
- **D48-AC025:** Task/notification/Phase 17/Phase 6/provider/Inngest paths cannot
  create, update, repair, or infer D48 admission.
- **D48-AC026:** Events, logs, cache, analytics, and traces are identifier-only/
  purpose-minimized and never source authority.
- **D48-AC027:** First activation remains correct with Inngest, providers,
  realtime, notification, Tasks, and analytics disabled.
- **D48-AC028:** The future first-enable editor states before Save that only
  access review requests created after save enter the policy, requests already
  waiting aren't included, and neither a due date nor access changes.
- **D48-AC029:** The editor exposes no Include pending/Apply current/import/
  override/count query or bulk confirmation.
- **D48-AC030:** Later edit UI cannot reuse first-enable impact copy unless later
  source semantics prove it true.
- **D48-AC031:** The editor uses shared Base Maia/Base UI, explicit Save/Cancel,
  unchanged/pending states, and no autosave.
- **D48-AC032:** Stale saves conflict with current summary; ambiguous responses
  recover the authoritative receipt before retry.
- **D48-AC033:** Save success/error/recovery is persistent and programmatically
  announced without focus theft or toast-only evidence.
- **D48-AC034:** UI passes keyboard, screen-reader, visible-focus, forced-color,
  target-size, 320px/400% reflow, localization, RTL/CJK, and low-bandwidth proof.
- **D48-AC035:** Impact copy contains no holder/requester detail, coordinator
  count, provider state, guessed send time, or delivery promise.
- **D48-AC036:** Both activation-before-request and request-before-activation
  concurrency tests produce exact selected results.
- **D48-AC037:** A transaction beginning before but serializing after activation
  re-proves current head and records one deterministic result.
- **D48-AC038:** Lost policy-save and request-create responses replay exactly
  through durable command identities.
- **D48-AC039:** Restore/replay cannot reclassify a preboundary or admitted
  episode under current policy.
- **D48-AC040:** Cross-Tenant, wrong-purpose, ended/recreated assignment, stale
  head, and service-role bypass attempts fail closed without disclosure.
- **D48-AC041:** Migration readers treat missing/unknown state as excluded before
  any writer is enabled.
- **D48-AC042:** Additive schema/constraint rollout performs no historical
  admission backfill and old code/new schema combinations cannot default On.
- **D48-AC043:** Shadow/no-send verification uses synthetic/new canary commands
  and never production old-row age scanning.
- **D48-AC044:** First activation performs work independent of existing pending-
  request count and performs no pending-request scan or recipient fanout.
- **D48-AC045:** Production-shaped tests extend D43's named corpus of at least
  100,000 terminal requests in one Tenant and 10,000 current requests across
  many Tenants with concurrent first-activation/request writes, request
  throughput, stable-key contention, retries, and explicit budgets before release.
- **D48-AC046:** Serialization holds only short product-DB work and performs no
  provider/network/Inngest wait under lock.
- **D48-AC047:** Rollback/kill stops new admissions while preserving source
  episodes, heads, receipts, audit, and recoverable handoffs.
- **D48-AC048:** Rollback does not invent effects for already-admitted episodes;
  later policy-edit decisions remain authoritative.
- **D48-AC049:** Impossible preboundary admission triggers writer kill,
  quarantine, evidence preservation, scope assessment, and incident review.
- **D48-AC050:** Repair reconciles source receipt/handoff and never rewrites
  admission from timestamps or direct DB edits.
- **D48-AC051:** Projection rebuild uses source admission and cannot mutate it.
- **D48-AC052:** Technical logs/traces are distinguishable from durable business
  source/head/receipt/audit evidence.
- **D48-AC053:** Every named monitor has exact signal, threshold, owner, and
  response and cannot enroll a request.
- **D48-AC054:** D48 authorizes no production telemetry pipeline, event, table,
  dashboard, job, alert, or staff score.
- **D48-AC055:** All 22 adversarial categories and every race/failure scenario
  are traceable to exact requirements/tests.
- **D48-AC056:** Current decision-log, glossary, ADR, Phase 12/17, and monitor
  artifacts use identical D48 boundary/cohort/identity language. Any later-
  created OpenSpec, design, ticket, implementation, test, or release-evidence
  artifact must use the same terms, and source-specific OpenSpec scenarios are
  required before activation.
- **D48-AC057:** No runtime implementation begins before D49, D50, exact values,
  later edit/Off semantics, content/channels, rollout, and D46 admission close.
- **D48-AC058:** D49 options preserve request-episode uniqueness and fresh same-
  Tenant recipient authorization under every reassignment/zero-member case.
- **D48-AC059:** D50 later supplies exact clock/timezone/calendar/useful-lateness
  semantics without altering D48 cohort admission.
- **D48-AC060:** Focused release audit finds zero preboundary admissions, zero
  existing-request writes, zero age-scan artifacts, zero new capabilities, and
  zero governing contradictions.

## D49 — When should the one reminder bind its D44 recipients?

### Why this is the next decision

Suppose Ana and Ben are Access request coordinators when a genuinely new D43
request is created. Before its possible source reminder occurrence, Ana leaves
the Tenant and Carla becomes a coordinator. Carla already receives the normal
D44 source-backed task and required responsibility-update attention for this
current work. D49 must decide whether the one courtesy occurrence belongs to
Ana and Ben, Ben and Carla, or an audience that continues changing as each
delivery surface acts.

Every option preserves one source occurrence per exact request episode, the
complete shared Access requests lane, the existing D44 task/current assignment
as work truth, requester exclusion, same-Tenant purpose-bound authorization,
and no second Tasks Hub task. Every later irreversible presentation or provider
submission freshly reauthorizes and may only suppress/narrow an already sealed
member set—never add, replace, broaden, or reroute it. `proved_zero` may seal an
empty terminal result; `indeterminate` releases nothing, never falls back, and
may retry only the same product occurrence until a separately defined
usefulness fence ends it. D49 activates no reminder and chooses no clock or
channel behavior.

### Option 1 — seal the current D44 cohort at the source reminder occurrence — recommended

At the one possible source reminder occurrence, Phase 12 atomically resolves
and seals the exact unordered zero-to-three-member cohort from the then-current
D44 responsibility generation. Ana is excluded because her assignment ended;
Ben and Carla may be included because they currently own the work. The source
records that evaluated generation/member evidence once. Later in-product or
external delivery rechecks current assignment, authorization, destination,
preference/consent, and suppression and may only narrow the sealed set.

**UX/engineering impact:** attention follows current responsibility, avoids
former staff, and gives every channel one stable, auditable audience. The shared
lane remains recovery for `proved_zero`. The explicit tradeoff is that Carla may
receive both her normal D44 responsibility-update attention and this courtesy
occurrence. D49 acknowledges that possible duplicate pressure but does not add
another eligibility rule before the clock decision.

### Option 2 — bind the request-creation D44 cohort, then narrow only

The source preserves Ana and Ben's request-creation generation. At the possible
occurrence, Ana is suppressed because she is no longer eligible, Ben may remain,
and Carla is never added even though she now owns the work.

**UX/engineering impact:** this gives the simplest historical explanation and
avoids a second nudge for Carla. It can also miss every person currently able to
act, and a request created in lane-only mode can never gain a reminder recipient.
Mandatory narrowing avoids contacting former staff but cannot repair a stale
creation-time audience. This is the strongest alternative.

### Option 3 — continuously re-resolve current responsibility through delivery

Each in-product or external delivery path independently resolves the current
D44 route. Added coordinators may enter one channel while removed coordinators
disappear from another.

**UX/engineering impact:** this maximizes route freshness per attempt but lets
one occurrence mean different audiences, couples source responsibility to
provider timing, and makes privacy, audit, and idempotent recovery brittle. A
provider-accepted message cannot be recalled after a route change.

### Recommendation and exact question

**Recommend Option 1 — seal one atomic current D44 cohort at the source reminder
occurrence, then narrow only.** It best matches Core's authoritative current-
responsibility model while preserving a stable, cross-channel, auditable
audience. It handles former staff and lane-only recovery safely, distinguishes
proved zero from indeterminate, and avoids a delivery system silently becoming
a routing authority. Option 2 is quieter after reassignment but can omit every
current owner. Option 3 is too mutable.

**Which D49 recipient-binding policy should Core record: Option 1 — seal the
current D44 cohort at the source reminder occurrence, then narrow only, Option 2
— bind the request-creation D44 cohort, then narrow only, or Option 3 —
continuously re-resolve current responsibility through delivery?** You may
amend any option.

## Evidence limits

- SailPoint directly supports new-request-only reminder configuration, but its
  timeout/escalation/reassignment semantics are not Core requirements.
- HubSpot explicitly exposes existing versus future enrollment, but it is a
  generic workflow product with broader automation and different privacy risk.
- Microsoft/Okta campaign versioning, Salesforce event triggers, Blackbaud form
  revisions, and Stripe Prices are analogies for prospective/versioned behavior;
  none dictates Core's schema or authorization.
- PostgreSQL/Supabase prove concurrency, constraint, migration, and RLS
  capabilities; they do not choose product policy.
- WCAG/USWDS/GOV.UK guidance informs UX/research quality, not cohort demand.
- D43–D48 are intended design, not shipped behavior. Current task/finance code
  remains nonprecedent.
- D49 recommendation is a product judgment based on responsibility truth; its
  exact zero-member/fanout semantics still require founder confirmation.

## Final research disposition

Record D48 as **Accept with required amendments**: the first non-Off cadence
applies only to D43 request episodes created through a trusted source mutation
serialized after the committed effective boundary. Existing pending episodes
remain permanently outside that first activation, with no backfill, marker,
scan, task, notification, or reminder effect. Source receipts and idempotent
commands—not timestamps or workers—prove the result. D49 recipient binding and
D50 clock remain open, as do later policy-edit and channel decisions. This is
the clearest, most reliable, least brittle modern path.
