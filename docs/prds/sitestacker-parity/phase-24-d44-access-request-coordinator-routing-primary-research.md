# Phase 24 D44 — Access Request Coordinator Routing Primary Research

**Research date:** 2026-08-29  
**Founder answer:** **Option 1 — optional one to three Access request
coordinators.** Tasks Hub is not the only way coordinators are notified.  
**Decision under review:** whether Core should let a Tenant name a small,
explicit cohort that receives personal responsibility for D43 holder-initiated
direct-grant review requests, while the permission-filtered **Access requests**
lane remains the authoritative shared recovery surface.  
**Scope:** necessity, modern routing practice, route authority, exact recipient
qualification, current-pending application, source/task/notification ownership,
Phase 6/17 delivery seams, optional Inngest execution, Tenant/RLS safety,
privacy, accessible Base Maia UX, failure recovery, performance, rollout, and
the next external-email decision.  
**Verification note:** broad formatting, local-link, skill-parity, strict
OpenSpec, lint, typecheck, unit, build, and diff checks remain deferred until
the end of the Grill session by founder direction.

## Research question

Does an optional one-to-three-person coordinator route create clearer personal
responsibility than either broadcasting every request to all grant managers or
using only a shared lane? If so, how should Core apply the route to new and
current pending requests, notify coordinators beyond Tasks Hub without creating
duplicate truth or notification storms, and remain usable when every personal
projection or delivery mechanism is unavailable?

## Evidence labels

- **Repository fact:** verified directly in current Core source or governing
  documentation.
- **Verified external fact:** supported by a current official primary source.
- **Requirement inference:** a falsifiable requirement derived from repository
  and external facts; implementation must still prove it.
- **Product judgment:** the selected product, security, or UX tradeoff.
- **Assumption:** plausible but not established by ministry-user or production
  evidence.
- **Unresolved unknown:** requires a later founder decision or product research.

## Executive finding

**Accept Option 1 with required amendments.** A small explicit coordinator
cohort is a current, defensible responsibility pattern, but it must be a typed
Phase 12 route—not a Team, role, permission group, task assignee list, email
distribution list, or generic workflow.

The strongest permanent model has four deliberately separate surfaces:

1. The Phase 12 **Access requests** lane is always available to every current,
   independently authorized grant decision-maker. It is source truth and the
   recovery path; coordinator configuration cannot disable or narrow it.
2. A Tenant may configure zero or one-to-three unique, unordered, co-equal
   **Access request coordinators**. The default is zero: **Shared lane only**.
3. For each exact pending D43 request, Phase 12 intersects that roster with
   current exact request-decision eligibility and excludes the requester.
   Admitted people receive personal ADR-0183 Tasks Hub responsibility. The
   assignment grants no access and creates no decision authority.
4. The same source-owned recipient generation—not the task—also releases a
   required Phase 17 in-product attention occurrence. D45 decides whether an
   optional external email step supplements it; later reminder/escalation policy
   remains a separate D46 decision.

Modern products substantiate the separation:

- Microsoft Entra explicitly names reviewers, can update reviewers on a current
  review separately from a recurring series, sends reviewer notifications, and
  keeps the review directly discoverable in My Access even when email is late
  or disabled.
- Okta Access Requests separates request/team/task responsibility from email,
  Slack, and Microsoft Teams delivery; notification recipients and delivery
  preferences are explicit rather than inferred from task completion.
- SailPoint assigns review work, exposes an Approvals surface, emails the
  reviewer, and supports reassignment to a newly notified reviewer.
- Salesforce exposes pending approval work in-product and separately lets an
  approver receive email notifications.
- Contentful exposes a pending-tasks surface and also emails assignees, but its
  API warns that an assignee can lack entry access. Core must improve on that
  footgun by intersecting responsibility with current source authorization.

Those products prove neither Core's exact cardinality nor its ministry workflow.
They do support the architectural principle that **responsibility, persistent
work discovery, attention delivery, and authorization are different facts**.

## Exact corrected D44 decision

1. Phase 12 owns one Tenant-wide, code-owned route purpose for D43 personal
   responsibility. Its only current modes are `source_lane_only@1` and
   `named_coordinators`.
2. `source_lane_only@1` has no member rows. The named mode has exactly one to
   three unique, unordered, co-equal same-Tenant Active Tenant Assignment
   members. Null, an empty named route, a fourth member, duplicate membership,
   profile/email/role identifiers, and cross-Tenant references are invalid.
3. A new selection must be a current active same-Tenant staff assignment that
   independently holds D43 grant-decision eligibility for at least one current
   scope. A previously configured assignment that later loses all eligibility
   remains visible to an authorized route manager as **Not currently eligible**
   but is inert. It is never silently replaced or broadened.
4. Only a current same-Tenant actor with Tenant-wide
   `permissions.manage_grants`, the Phase 12 floor, and separately authorized
   staff enumeration may inspect names, search candidates, preview impact, or
   save the route. Receiving coordinator responsibility and managing the route
   are independent.
5. For each exact `pending_review` D43 request, the recipient resolver computes
   the complete intersection of the current route members, current active
   assignments, current exact `permissions.manage_grants` scope/ceiling, D43
   source visibility, and current Phase 12 floor, then excludes the exact
   subject assignment and every configured assignment currently resolving to
   the authenticated requester principal. Partial, timed-out, corrupt, over-limit, or
   indeterminate resolution releases nobody for that request.
6. Zero eligible coordinators creates no guessed task or notification and never
   falls back to every grant manager, Owner, Admin, original grantor, requester-
   selected reviewer, manager, support user, or stale prior coordinator. The
   authoritative **Access requests** lane remains complete and actionable.
7. A new D43 request pins the current route head and complete recipient result
   in one source-owned responsibility generation. Each admitted recipient gets
   at most one current ADR-0183 assignment projection and one required Phase 17
   in-product attention occurrence for that generation.
8. The exact required in-product system-message key is
   `holder_access_review_requested_v1`. Its recipient is one newly admitted
   current coordinator; its policy is
   `presentation.source_actionable_then_recent_90d@1`; its authenticated action
   opens the Phase 12 request detail. Safe preview contains no holder explanation,
   capability, source/provenance, group, grantor, reviewer roster, or Keep/Remove
   control.
9. The task and notification share only the immutable source-work occurrence and
   recipient-generation identity. Neither is created from the other. Task state,
   notification read/archive state, email outcome, worker state, or Inngest state
   cannot decide, close, keep, remove, or restore access.
10. Saving a changed route is not prospective-only. After a complete,
    permission-safe impact preview and an explicit save, the current route head
    becomes authoritative for all current pending D43 requests. This avoids
    leaving responsibility with departed or deliberately removed coordinators.
11. Current-pending application is differential: continuing recipients retain
    their exact assignment and engagement lineage; newly admitted recipients
    receive fresh personal responsibility and attention; removed recipients end
    current presentation as **Coordinator responsibility changed** without
    fabricated read, completion, source resolution, or terminal request history.
12. A route or eligibility change that newly admits one person to multiple
    already-pending requests must not emit one bell item per request. Phase 12
    releases one safe grouped in-product occurrence per recipient and
    responsibility-recompute generation under
    `access_request_responsibility_updated_v1`, with an authorized current count
    and link to filtered **Access requests**. Individual Tasks Hub assignments
    remain one per exact request. New requests after the recompute use the
    per-request `holder_access_review_requested_v1` occurrence.
13. Route-save preview and application use the same sealed current request set,
    route head, authorization/governance heads, recipient digest, and expected-
    head command. A stale or incomplete preview writes nothing. Projection work
    may apply in bounded product-owned batches after commit, but the saved route
    and Phase 12 request heads—not batch position—determine current truth.
14. Every source request decision reauthorizes independently at Phase 12. A
    coordinator who cannot currently decide may still see only whatever safe
    source status another purpose permits; the personal projection itself never
    creates that permission.
15. A D43 terminal transition, requester withdrawal, source end, eligibility
    loss, requester exclusion, or route-generation replacement ends only the
    applicable personal projections. It never rewrites the request, grant,
    audit, or another recipient's engagement.
16. The required in-product occurrence is a Phase 17 notification item, not a
    task badge or duplicate task row. Reading it does not claim the request;
    opening it performs no mutation; archive is unavailable while the source
    remains actionable; the user can always reach the same current work through
    the source lane and, when materialized, Tasks Hub.
17. D44 creates one source-owned, identifier-only communication-plan occurrence
    seam. Phase 6/17 owns delivery-step planning and notification presentation.
    D45 decides whether one immediate email step is absent, optional, or
    mandatory and which Tenant/personal-preference posture applies; any enabled
    step still requires current contactability, suppression, and source-fence proof.
    SMS, push, Slack, Teams, reminder cadence, deadlines, escalation, and
    approval-by-message are not admitted by D44.
18. Task, notification, email, logs, telemetry, analytics, AI, search, cache,
    and workflow events never contain the D43 request/decision explanation or
    D42 provenance. They use code-owned, purpose-minimized copy and opaque
    identifiers; protected detail loads only from Phase 12 after fresh
    authorization.
19. Inngest may deliver or reconcile identifier-only post-commit projection and
    communication work through Core's dispatch ledger and product work claims.
    It owns no route, recipient, request, task, notification, human wait,
    channel choice, idempotency, decision, deadline, or access mutation.
20. The settings and recipient journeys use shared `@asym/ui`, Base UI
    primitives, exact Base Maia/Zinc tokens, accessible semantic lists/forms,
    persistent status, and responsive progressive disclosure. They do not reuse
    the current hardcoded notification-demo content or generic mutable task UI.

## Strongest alternatives

### Broadcast every request to every eligible grant manager

This maximizes immediate visibility and needs no roster. It is weaker because
the recipient set can be large and membership-driven; every request creates
duplicated personal responsibility, diffuse ownership, larger disclosure, and
notification fatigue. Microsoft, Okta, SailPoint, and Salesforce all support a
selected reviewer, team, queue, group, or assignment concept rather than
requiring every administrator to receive every item. Core's shared source lane
already gives every currently authorized grant manager a recovery path without
broadcasting personal attention.

### Shared Access requests lane only

This is the strongest no-build alternative and must remain the default/fallback.
It has no routing state, personal fan-out, or delivery dependency. It is weaker
as the sole permanent model because nobody is explicitly responsible for
noticing a new request. A small, optional roster adds accountability while
preserving lane-only operation for one-person or low-volume Tenants.

### Prospective-only coordinator changes

Prospective-only save limits fan-out and resembles Core's D35 Website recovery
policy. It is weaker here. A person removed because they left or changed duties
could retain personal responsibility for every old pending request, while the
replacement would see only new work. D44 responsibility changes no source
business state or access and is fully reversible, so a complete impact preview
plus differential current application is proportionate. Microsoft distinguishes
updating a current review from its future series, and SailPoint supports
reassigning current requests to a newly notified reviewer. Core therefore applies
the deliberate route change to current pending requests but preserves engagement
for continuing recipients and groups backlog attention to avoid storms.

### Infer coordinators from roles, groups, original grantors, or task assignees

Reject. Those facts have different purposes, lifecycles, scopes, and privacy
rules. Inference makes a harmless edit in another domain silently change access-
governance responsibility and creates an undocumented authorization expectation.

## Current, intended, and permanent state

| State                           | Verified position                                                                                                                                                                                                                                                                                                                                                             | D44 consequence                                                                                                                           |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Current repository behavior** | Core has no shipped Phase 12 coordinator route, D43 request, source-backed access-request task, or Phase 17-backed staff notification center. The current bell renders hardcoded demo people/actions, and `/tasks` exposes generic mutable seed-oriented state. Contribution approval notifications use finance-specific profile/role/SLA tables and direct channel planning. | None is a D44 authority or UI precedent. Reuse only architectural lessons, then converge on Phase 12, ADR-0183, ADR-0027, and Phase 6/17. |
| **Intended baseline**           | D43 already makes Phase 12 the request owner, preserves the complete **Access requests** lane, and delegates only personal routing to D44. ADR-0183 separates source work from Tasks Hub; ADR-0027 separates notification attention from tasks and source completion.                                                                                                         | D44 supplies one typed route and recipient generation shared causally across independent projections.                                     |
| **Founder-selected posture**    | Zero or one-to-three explicit coordinators; Tasks Hub is not the only notification path.                                                                                                                                                                                                                                                                                      | Required in-product attention supplements Tasks Hub; external email remains D45.                                                          |
| **Best permanent path**         | Current exact route, exact per-request authorization intersection, explicit current-impact save, grouped anti-storm attention, source-controlled closure, and lane-only recovery.                                                                                                                                                                                             | Clear accountability without broadcast, guessed fallbacks, duplicate truth, or vendor-owned human workflow.                               |

## Current Core repository evidence

| Repository evidence                                                                                                                            | Verified finding                                                                                                                                                                                                                                          | D44 requirement                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [Phase 12 role and permission configuration](./phase-12-full-role-permission-configuration.md)                                                 | D43 is one `permission_change_request` subtype; Phase 12 owns the complete **Access requests** lane, exact `permissions.manage_grants` decision boundary, current source heads, and holder-visible result. D44 is explicitly limited to personal routing. | Store the route and resolve recipients inside Phase 12. Do not let Tasks Hub, Notification Center, or a worker become request truth. |
| [Phase 12 Active Tenant Assignment and EffectiveAccess contract](./phase-12-full-role-permission-configuration.md)                             | Human authorization binds one server-validated Active Tenant Assignment and one branded Tenant context. Role names never authorize; current purpose, capability, scope, ceiling, floor, and epoch decide.                                                 | Coordinator members and recipients bind same-Tenant assignments; every read/action reauthorizes.                                     |
| [D43 primary research](./phase-24-d43-governed-holder-access-review-primary-research.md)                                                       | A holder request changes no access, has one five-state lifecycle, keeps private prose at the source, and can project at most one source-backed task identity.                                                                                             | D44 cannot change D43 semantics, explanations, closure, review authority, or access mutation.                                        |
| [D43 adversarial review](./phase-24-d43-governed-holder-access-review-adversarial-review.md)                                                   | Ownerless routing, generic task mutation, protected-text egress, stale heads, and projection failure were already identified as material risks.                                                                                                           | Coordinator routing must preserve the lane, reject generic mutations, and project identifiers only.                                  |
| [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)                                                             | A source owns actionability, current authorization, responsibility transitions, cancellation, supersession, recurrence, and completion. Tasks Hub owns only admitted work identity, recipient engagement, and presentation.                               | A D44 task is a rebuildable projection; its assignment grants no access and its controls cannot close D43.                           |
| [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)                                                               | Notification is a role-safe attention projection, never source/task/workflow/communication truth. Email and in-product steps are independently authorized. Continuing, newly admitted, and removed recipients have different engagement treatment.        | Required in-product attention is independent of Tasks Hub; read/archive cannot change request or task state.                         |
| [ADR-0026](../../adr/0026-contract-bounded-delivery-plans.md)                                                                                  | A producer supplies one bounded source occurrence and complete candidate set; Phase 6/17 compiles recipient/channel steps. Arbitrary audiences, loops, waits, and source mutations are forbidden.                                                         | Use one bounded, versioned attention occurrence; leave external-email choice to D45 and reject a generic notification workflow.      |
| [Phase 17 system-message catalog](./phase-17-system-messages-template-management.md)                                                           | Stable keys have fixed meaning, source fence, recipients, steps, safe facts, and activation proof. `presentation.source_actionable_then_recent_90d@1` is the existing policy for required work.                                                           | Register exact D44 keys and safe projections; do not synthesize a runtime key or copy request prose.                                 |
| [Workflow orchestration OpenSpec](../../../openspec/specs/workflow-orchestration/spec.md)                                                      | Product records own outcomes; events are identifier-only; product dispatch ledger and work claims own durability; shared workflow infrastructure is Tenant-scoped.                                                                                        | Inngest may execute delivery/reconciliation only after source commit and fire-time reauthorization.                                  |
| [Platform principles OpenSpec](../../../openspec/specs/platform-principles/spec.md)                                                            | Tenant/permission safety outranks convenience, durable behavior should replace recurring human glue, and UX must stay clear, accessible, and fast.                                                                                                        | Add optional accountability without weakening lane recovery or making setup mandatory.                                               |
| [Platform boundaries OpenSpec](../../../openspec/specs/platform-boundaries/spec.md)                                                            | Sensitive mutation and cross-surface authorization stay server-side; UI hiding is not security.                                                                                                                                                           | Candidate search, preview, route save, request detail, and decision remain purpose-built server reads/commands.                      |
| [Current staff notification dropdown](../../../packages/ui/components/shadcn-studio/blocks/dropdown-notification.tsx)                          | The dropdown contains hardcoded external avatar URLs, demo people, fake counts, generic close icons, and inline Accept/Decline controls.                                                                                                                  | It is visual migration input only. D44 targets the prospective Phase 17 notification center, with no inline Keep/Remove.             |
| [Current Mission Control shell](../../../apps/admin/app/mc-shell.tsx)                                                                          | The shell mounts the demo dropdown and currently uses a 32-pixel notification trigger.                                                                                                                                                                    | The permanent important notification control must meet Core's important-target policy; do not preserve the 32-pixel demo affordance. |
| [Current Tasks prototype](<../../../apps/admin/app/(app)/tasks/tasks-content.tsx>)                                                             | “My tasks” filters against hardcoded `staff-1`; task creation writes hardcoded `tenant-1`/`staff-1`. Generic task surfaces permit browser completion and deletion.                                                                                        | D44 cannot ship on this authority model; the future source-backed adapter must reject generic mutation.                              |
| [Current task schema](../../../supabase/migrations/20260526193000_mission_control_tasks.sql)                                                   | Current tasks use generic assignee/profile fields and task links with cascade behavior; they do not encode source occurrence and recipient-generation invariants.                                                                                         | Add ADR-0183 source-work identities/projections rather than extending generic assignee fields into access authority.                 |
| [Current contribution approval notification implementation](../../../packages/api/src/admin/contribution-operations/approval-notifications.ts) | Finance-specific code defaults in-product on/email off, resolves profile/role recipients, creates mission-control tasks, and owns reminder/SLA logic.                                                                                                     | Treat as migration input, not D44 infrastructure. D44 uses Phase 12 assignments, Phase 17 catalog, and no reminder/SLA decision.     |
| [Core frontend rules](../../../docs/ai/rules/frontend.md)                                                                                      | UI uses shared `@asym/ui`, Base UI, exact `base-maia`/Zinc tokens, semantic state, simple native forms when appropriate, and no app-local component fork.                                                                                                 | Route settings, impact preview, notification item, and deep-link detail follow that system.                                          |
| [Shared UI configuration](../../../packages/ui/components.json)                                                                                | The repository is pinned to `base-maia`, Base UI, Lucide icons, Zinc CSS-variable tokens, and shared component ownership.                                                                                                                                 | D44 introduces no new design system, custom combobox dependency, or app-local primitive family.                                      |

## Current official primary-source evidence

### Identity governance and access-request products

| Official source                                                                                                                                  | Verified fact                                                                                                                                                                                                                                                                   | D44 implication                                                                                                                                                             | Evidence limit                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [Microsoft Entra — create an access review](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)                          | A review can name selected reviewers, enable/disable email notification and reminders, add fallback reviewers only in bounded cases, and inspect `contactedReviewers` with notification timestamps. Current-review reviewers can be updated separately from a recurring series. | Explicit recipient responsibility and delivery configuration are distinct. Current work should change deliberately rather than inheriting a future-only roster by accident. | Entra's campaigns, fallback types, deadlines, and reminders do not authorize those features for one-off D43 requests. |
| [Microsoft Entra — perform an access review](https://learn.microsoft.com/en-us/entra/id-governance/perform-access-review)                        | Reviewers can open pending reviews directly in My Access; email may be delayed by as much as 24 hours.                                                                                                                                                                          | Core must keep the source lane usable independently of notification delivery.                                                                                               | This does not set Core's latency SLO or prove email should be required.                                               |
| [Microsoft Entra — plan access-review deployment](https://learn.microsoft.com/en-us/entra/id-governance/deploy-access-reviews)                   | Microsoft recommends planned reviewer selection, notifications, reminders, a pilot, audit-log monitoring, and documented recovery for removed access.                                                                                                                           | Coordinator rollout needs preview, audit, shadow/canary evidence, and source recovery.                                                                                      | It addresses periodic campaigns, not Core's D43 holder request.                                                       |
| [Okta — Access request notifications](https://help.okta.com/en-us/content/topics/identity-governance/notifications.htm)                          | Okta sends request updates through email, Slack, and Teams to defined requester, task-assignee, and follower audiences; it also has expiration and access-ending messages.                                                                                                      | Modern products use more than a task list, but channels, audiences, and timing are contract-specific facts.                                                                 | Core has not adopted Slack/Teams, expiry, or recurring warning semantics here.                                        |
| [Okta — manage requests](https://help.okta.com/en-us/content/topics/identity-governance/access-requests/manage-requests.htm)                     | Request assignees manage work; task escalation can add a manager; request types and conditions have different assignee rules; some requests remain unassigned.                                                                                                                  | Assignment and source request state are separable; no-recipient is a real state, not permission to guess.                                                                   | Okta's mutable assignee/escalation/team model conflicts with D43 source-controlled closure and is not imported.       |
| [Okta — create an Access Requests team](https://help.okta.com/oie/en-us/content/topics/identity-governance/access-requests/ar-team-create.htm)   | Teams can own private request types; auto-assignment can rotate or select one member.                                                                                                                                                                                           | A bounded explicit cohort is a current practice.                                                                                                                            | Core rejects team ownership, round robin, team deletion semantics, and task-owned privacy.                            |
| [Okta — Slack/Teams integration considerations](https://help.okta.com/en-us/Content/Topics/identity-governance/integrations/bp-integrations.htm) | Chat approvals use the chat session; relaxed authentication and email-address matching can weaken assurance or enable impersonation.                                                                                                                                            | D44 provides no Keep/Remove action in notifications and never treats an external-channel identity as Phase 12 authorization.                                                | Core has not adopted these channels.                                                                                  |
| [SailPoint — reviewing access requests](https://documentation.sailpoint.com/saas/user-help/approvals/reviewing_access.html)                      | A reviewer receives email and also works from an Approvals tab. Reassignment sends email to the new reviewer; one member of a governance group may decide.                                                                                                                      | In-product work plus separate attention and deliberate current reassignment are modern patterns.                                                                            | SailPoint's group workflow, 90-day expiry, reminders, and reassignment comments are not D44 requirements.             |
| [SailPoint — requesting access](https://documentation.sailpoint.com/saas/user-help/requests/request_center.html)                                 | Requesters receive both email and in-app validation/outcome notifications, and approval is sent to one or more reviewers.                                                                                                                                                       | Multiple channel surfaces can coexist without one becoming source truth.                                                                                                    | It concerns requesting access, not Core's request to review removal of a continuity source.                           |
| [SailPoint — available email templates](https://documentation.sailpoint.com/saas/help/common/emails/available_templates.html)                    | Stable templates distinguish reviewer assignment, reassignment, requester decision, revoke decision, and failure meanings.                                                                                                                                                      | Stable D44 message meanings should not be collapsed into one generic “request update.”                                                                                      | Template availability does not determine Core's enabled channels.                                                     |

### CRM, CMS, and nonprofit-adjacent patterns

| Official source                                                                                                                                                                 | Verified fact                                                                                                                          | D44 implication                                                                                                                            | Evidence limit                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| [Salesforce Trailhead — manage approval requests](https://trailhead.salesforce.com/content/learn/modules/approval-process-for-public-sector-solutions/manage-approval-requests) | Approvers see pending requests on the Salesforce home page and separately receive email if their user setting enables approval emails. | Persistent work and email delivery are independent user experiences.                                                                       | Salesforce email reply approval is rejected for Core because D43 requires authenticated current-source review. |
| [Contentful — tasks](https://www.contentful.com/help/content-and-entries/tasks/)                                                                                                | A task can be assigned to a person or team; assignees receive email and see pending tasks.                                             | CMS products commonly supplement assigned work with another attention path.                                                                | Contentful tasks own generic completion/due dates; D44 tasks do not.                                           |
| [Contentful entry-task API](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)                                                          | Creating or reassigning a task sends email, but the API does not ensure the assignee can read the entry.                               | Core must structurally intersect personal responsibility with current source authorization rather than assuming assignment implies access. | Contentful's 100-task limit and task body/status model do not transfer.                                        |
| [Blackbaud CRM administration guide](https://webfiles-sc1.blackbaud.com/files/support/guides/enterprise/400/admin.pdf)                                                          | Blackbaud supports configurable email alerts when task/batch/prospect ownership transfers and lets users choose some alert behaviors.  | Nonprofit CRM staff may need attention outside an in-product work list.                                                                    | The guide is older and does not prove D44's exact route, privacy, or channel defaults.                         |

### Notification UX, accessibility, security, and execution

| Official source                                                                                                  | Verified fact                                                                                                                                                                               | D44 implication                                                                                                                                  | Evidence limit                                                                                  |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| [Apple HIG — notifications](https://developer.apple.com/design/human-interface-guidelines/notifications)         | Notifications should be timely, concise, valuable, nonduplicative, and free of sensitive/confidential information; important information must remain discoverable when badges are disabled. | Use safe code-owned copy, one semantic occurrence, grouped backlog attention, and persistent lane/task discovery.                                | Apple platform conventions are design evidence, not Core's web component contract.              |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/)                                                                        | UI names/roles/states must be programmatic; status messages must be announced without taking focus; focus, target size, reflow, error, and authentication criteria apply.                   | Route selection, impact loading, save status, notification counts, and deep links require complete accessible behavior.                          | WCAG does not choose coordinator count or channels.                                             |
| [W3C WAI — interruptions](https://www.w3.org/WAI/WCAG21/Understanding/interruptions.html)                        | Non-emergency interruptions should be postponable or suppressible.                                                                                                                          | Do not add modal interruption, sound, recurring reminder, or urgency escalation in D44.                                                          | This Level AAA guidance informs UX; D44's release gate remains the repo's WCAG 2.2 AA contract. |
| [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) | Least privilege, deny-by-default, per-request validation, safe lookup identifiers, appropriate logging, and authorization tests are required.                                               | Re-prove route management, recipient qualification, list/detail/action, and deep links at every boundary.                                        | OWASP does not define Core's domain model.                                                      |
| [NIST SP 800-53 Rev. 5.1](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)                                    | AC-5 and AC-6 require documented separation of duties and least privilege for security functions.                                                                                           | Coordinator responsibility cannot substitute for grant-decision authorization or existing Phase 12 self/SoD/quorum controls.                     | NIST controls require organization-specific tailoring and do not mandate three coordinators.    |
| [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)                          | RLS is default deny when enabled without applicable policy; owners and `BYPASSRLS` can bypass unless owners are forced; `USING` and `WITH CHECK` serve different mutation checks.           | Route, membership, application, and recipient projections need composite Tenant keys, forced RLS, restricted grants, and privileged-path parity. | RLS cannot replace application-level purpose/capability checks.                                 |
| [Inngest idempotency](https://www.inngest.com/docs/guides/handling-idempotency)                                  | Event/function idempotency suppresses duplicates for only 24 hours; application code should itself be idempotent.                                                                           | Product source identities and unique constraints own permanent task/notification/email semantics.                                                | This does not prove Inngest is necessary.                                                       |
| [Inngest wait for event](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/wait-for-event) | Waiting starts only when the step begins; earlier events can race, and a timeout is required.                                                                                               | Do not model the D43 human decision or D44 recipient lifecycle as an Inngest wait.                                                               | Inngest may still execute replaceable post-commit delivery.                                     |
| [Inngest error handling](https://www.inngest.com/docs/guides/error-handling)                                     | Steps retry and failure handlers run after retries exhaust.                                                                                                                                 | Delivery/projector retries need idempotent source receipts and product-owned reconciliation; failure cannot change source truth.                 | Vendor retries are not business recovery evidence.                                              |

## Evidence synthesis

### Verified facts

- Current IAM products explicitly assign reviewers or responsible teams and
  notify them separately from the durable request/review surface.
- Email can be disabled, delayed, preference-controlled, or unavailable; direct
  in-product discovery therefore remains necessary.
- Current-review responsibility can be changed deliberately rather than waiting
  for future work only.
- Multi-channel products distinguish channel delivery from request status and
  reviewer authority.
- Notification guidance warns against duplicate, sensitive, or interruption-
  heavy messages.
- Assignment does not reliably prove source access in comparable CMS products;
  Core must reauthorize rather than repeat that defect.
- Core already governs one notification projection, one Tasks Hub projection,
  and one Phase 6/17 communication seam with explicit ownership separation.
- Inngest's finite deduplication and event-wait semantics cannot own a long-lived
  human request or durable notification identity.

### Requirement and product inferences

- One-to-three co-equal people is enough to express deliberate accountability
  without adding scheduling, rank, rotation, workload scoring, or a generic team.
- Lane-only must be a complete normal configuration, not an error state or a
  hidden “admin receives it” fallback.
- A current route change should update current pending responsibility because
  personal attention is reversible and otherwise follows departed staff; it
  still needs an explicit impact preview because it can create tasks and
  notification delivery.
- Continuing/new/removed recipient generations must be differential so an
  unchanged coordinator is not punished with duplicate unread work.
- A bulk route change needs one safe summary bell occurrence per newly admitted
  recipient, while individual requests remain separate source/task facts.
- Required in-product attention satisfies the founder's clarification without
  making email, Slack, SMS, or push implicit.
- The message preview must be safer than the authorized request detail because
  notification surfaces can appear over shoulders, in screenshots, and on
  shared devices.

### Assumptions and unresolved evidence

- **Assumption:** most Tenant access-governance responsibility can be made clear
  with one person and needs no more than three for coverage.
- **Assumption:** **Access request coordinators** is understood as attention and
  responsibility, not a new administrative role. Representative staff research
  must test this.
- **Assumption:** a required in-product item plus an optional Tasks Hub row does
  not feel duplicative when copy clearly distinguishes “new attention” from
  “persistent work.”
- **Assumption:** safe aggregate count is useful during current-route changes
  and does not reveal protected subject/source facts.
- **Unresolved unknown:** D45 decides whether the initial in-product occurrence
  is supplemented by optional immediate email. No other external channel is
  currently admitted.
- **Unresolved unknown:** D46 should separately decide whether unresolved
  requests ever receive reminders or escalation. D44 creates no timer, SLA, or
  automatic reassignment.
- **Unresolved unknown:** no production evidence establishes request volume,
  coordinator turnover, optimal email default, response time, notification
  fatigue, or representative ministry comprehension.

## Permanent domain contract

### Product vocabulary

- **Access request coordinator:** one explicitly configured current same-Tenant
  assignment eligible to receive personal responsibility for at least some D43
  requests. It is a responsibility designation, not a role, Team, permission
  group, reviewer class, approver, original grantor, or authorization grant.
- **Access request coordinator route:** the one current Tenant-wide Phase 12
  configuration choosing shared-lane-only or one-to-three coordinators.
- **Coordinator responsibility generation:** the complete, immutable source-
  owned result of applying one route/authorization head to one pending D43
  request and exact recipient set.
- **Coordinator attention occurrence:** a Phase 17 recipient-specific safe
  notification projection caused by a current responsibility generation.
- **Current-responsibility update occurrence:** one safe grouped Phase 17
  attention occurrence caused when a deliberate route/eligibility recompute
  newly admits one recipient to one or more already-pending requests.

Avoid **Access team**, **Approvers**, **Owners**, **Access admins**, **Reviewers**
without qualification, **Queue members**, **Task assignees**, **On-call**, and
**Escalation group**. Each implies authority, organization, order, or scheduling
that D44 does not create.

### Ownership map

| Fact                                                                      | Authoritative owner                                                                                               | Derived consumers                                                       | Never authority                                        |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| D43 request existence, kind, lifecycle, target, source head, and decision | Phase 12 `permission_change_request` aggregate                                                                    | Access requests lane, My access requests, task/notification projections | Task, notification, email, route, Inngest              |
| Current direct grant and EffectiveAccess consequence                      | Phase 12 grant/PDP                                                                                                | D43 detail/receipt, safe outcome projection                             | Requester text, coordinator, task, message             |
| Complete shared request discovery                                         | Phase 12 **Access requests** read model                                                                           | Mission Control list/count                                              | Coordinator route, eligible-recipient count, Tasks Hub |
| Current coordinator intent                                                | Phase 12 D44 route head and immutable route revisions                                                             | Settings, recipient resolver                                            | Role/group/team/task/email audience                    |
| Route management authorization                                            | Current Phase 12 Tenant-wide `permissions.manage_grants` plus floor/enumeration purpose                           | Settings controls                                                       | Coordinator membership or decision eligibility         |
| Exact request-decision authorization                                      | Current Phase 12 `permissions.manage_grants` within exact scope/ceiling plus all floors and self/SoD/quorum rules | Detail/actions                                                          | Route or task assignment                               |
| Current personal recipient set                                            | Complete Phase 12 intersection of current route and exact request authorization, excluding requester              | Tasks Hub and Phase 17 plan occurrence                                  | Worker, cached recipient list, channel preference      |
| Source-backed task identity and personal engagement                       | ADR-0183 Tasks Hub                                                                                                | My tasks/list/count                                                     | D43 lifecycle, request decision, grant state           |
| In-product availability/presentation/read/archive                         | Phase 17/ADR-0027                                                                                                 | Bell, Notification Center, badge                                        | Task completion, request status, decision              |
| External delivery intent/outcome/history                                  | Phase 6/17 under a D45 Delivery Plan                                                                              | Email/history/operations                                                | Recipient qualification, source truth, human reading   |
| Projection execution/retry                                                | Product dispatch ledger/work claim; optional Inngest executor                                                     | Operational telemetry                                                   | Any product fact or semantic idempotency               |

### Route identity and structural invariants

The route is one typed Tenant-owned aggregate with immutable revisions and one
current head. Its semantic identity includes Tenant and route purpose; member
identity is the exact same-Tenant Active Tenant Assignment. The UI presents a
person, but storage and authorization never use a bare person/profile/email or
role label.

Required invariants:

1. Exactly one current D44 route head exists per Tenant and purpose.
2. `source_lane_only@1` has zero members; named mode has one-to-three distinct
   members. Database constraints and the single command boundary make every
   other state impossible.
3. Every member relationship is same-Tenant through a composite key; assignment
   end or replacement never retargets the route to a successor identity.
4. Member order has no semantic meaning. Storage may canonicalize by opaque ID
   for hashing, never expose rank or use order for routing.
5. Immutable revisions preserve who changed the route, trusted actor assignment,
   server time, prior/current head, normalized member set/digest, safe impact
   counts, and command receipt. No hard/cascade deletion erases ordinary history.
6. Route save changes responsibility only. It never grants/revokes capability,
   creates/ends D43 requests, changes grant state, advances the authorization
   epoch, or modifies source explanations.
7. A route member may receive zero, some, or all pending requests depending on
   current exact authorization. The route summary never promises universal
   coverage.
8. The requester exclusion is per exact request/Active Tenant Assignment. It
   does not deny that person's otherwise lawful source decision authority; it
   only prevents self-assignment and self-notification for their own request.

### Candidate and event-time eligibility

The settings picker admits only assignments that are currently:

- active, staff-compatible, and in the exact Tenant;
- visible to the route manager under a purpose-specific staff enumeration;
- current holders of D43 grant-decision authority for at least one scope; and
- not denied by the Phase 12 floor.

This save-time filter avoids the confusing “choose anyone now and maybe grant
them access later” posture. It is still not a promise about an exact future
request. Event-time resolution independently checks the exact request source,
capability, Legal Entity/scope, assignable-capability ceiling, floor, active
assignment, governance epoch, and requester exclusion.

If a configured member later becomes inactive or loses all qualifying authority,
the settings row remains visible only to an authorized route manager with
**Not currently eligible · receives no access request responsibility**. Core
does not delete history, choose a replacement, or notify the person about
requests. Restored eligibility can admit the same still-current assignment only
through a fresh complete responsibility recompute; a recreated assignment is a
different identity and is never revived automatically.

### New-request resolution

When a D43 request reaches `pending_review`, one Phase 12 command/result pins:

- exact request and request head;
- exact route and route head;
- exact authorization/governance epoch and purpose version;
- complete normalized eligible-recipient set or a proved-zero/indeterminate
  posture;
- requester exclusion evidence;
- semantic source-work identity and recipient-generation identities; and
- identifier-only projection/communication intent.

The request transaction does not need Tasks Hub, Phase 17, email, or Inngest to
succeed. If recipient resolution is indeterminate, the request still commits
and appears in **Access requests**, but no personal projection is released until
a later complete reconciliation proves the current result. A later reconciliation
cannot revive a superseded route generation or closed request.

### Deliberate route changes and current pending work

An ordinary save deliberately changes current responsibility. The server first
builds a permission-safe preview from the exact current route head and complete
current pending D43 set. It shows only aggregate consequences the manager may
know:

- current open requests considered;
- personal assignments that continue;
- new personal assignments;
- personal assignments that end; and
- requests that will remain lane-only because no configured coordinator is
  currently eligible.

It never exposes requesters, capabilities, grant sources, explanations,
eligibility-denial reasons, hidden Legal Entities, or coordinator-by-request
matrices in this Tenant-wide preview. If the manager lacks enough aggregate
scope, the server computes and applies the complete result but returns only
coarser safe counts; it never infers unseen source detail from visible totals.

The primary action reflects impact:

- no current pending change: **Save coordinators**;
- current responsibility changes: **Save and update [localized count] open
  requests**; and
- removing the last member: **Use shared lane for [localized count] open
  requests**.

The save requires the preview token, exact route head, exact request-set digest,
authorization heads, and one semantic command key. Any changed head makes the
preview stale and writes nothing. The result commits the new route revision and
a product-owned current-application generation; bounded workers can materialize
differential child projections after commit. Each child rechecks current request
and authorization before release. Source truth never depends on completing all
batches, and repair is deterministic from route/request heads.

Differential rules:

- continuing recipient: preserve current task identity, read/unread, and
  engagement; create no new notification;
- newly admitted to one new request: create one task projection and one
  `holder_access_review_requested_v1` in-product occurrence;
- newly admitted to one or more existing requests because of one recompute: create
  individual task projections but one
  `access_request_responsibility_updated_v1` in-product summary;
- removed by route change: end active task/notification presentation as
  **Coordinator responsibility changed**, without fake completion/read;
- removed by authorization loss: immediately cease protected visibility and
  record body-free security/audit evidence under Phase 12 policy; and
- no recipient: leave the exact request in the complete **Access requests** lane.

### In-product attention contracts

#### `holder_access_review_requested_v1`

Source predicate: one exact D43 request is currently `pending_review` and the
recipient is newly admitted by its current D44 responsibility generation.

Safe presentation:

```text
Access review requested
A staff member asked your organization to review their direct access.

[Review request]
```

The source/surface may safely show the localized request age, but not the
requester's name, request explanation, capability, group, grantor, continuity
history, protected source, another coordinator, or a decision recommendation.
The action opens the authenticated Phase 12 detail and reauthorizes before
showing anything. No **Keep**, **Remove**, **Approve**, **Reject**, or mutation
action appears inside the notification.

The item uses `presentation.source_actionable_then_recent_90d@1`: it remains in
**Needs attention** while the exact source action remains current, regardless of
read state; archive is unavailable while actionable; source terminal or
recipient-generation end sets presentation end once; authorized body-free recent
history follows the existing 90-day policy. Access loss removes presentation
immediately without rewriting durable audit.

#### `access_request_responsibility_updated_v1`

Source predicate: one deliberate current route/eligibility recompute newly
admits the recipient to one or more already-pending D43 requests. Semantic
identity is Tenant + recipient assignment + current-application generation.

Safe presentation:

```text
Access review responsibilities updated
You were assigned [localized count] existing access requests.

[View access requests]
```

The initial exact count is a source-derived safe aggregate, not a copied list or
mutable task total. Its past-tense wording remains truthful as children end;
the current source-actionable state conveys whether attention is still needed.
The authenticated destination re-derives the current
permission-filtered lane. The grouped source remains actionable only while at
least one admitted child request remains current for that recipient; later new
requests create their own per-request occurrence and do not mutate the old
aggregate. This prevents notification storms without collapsing task/source
identities.

Both contracts:

- are Tenant-scoped and recipient-specific;
- carry stable source/recipient-generation references, never protected bodies;
- create exactly one Phase 17 in-product occurrence per semantic identity;
- are required in-product steps and cannot be disabled by a task preference;
- preserve engagement independently per recipient;
- never use notification engagement as source completion;
- can be rebuilt from source receipts without producing fresh unread for an
  unchanged generation; and
- leave external email to D45's separate contract-bounded step decision.

## UX/UI journeys

### Information architecture

Place the setting at **People & access → Access requests → Settings**, after the
always-visible request-lane explanation. Do not put it in Websites, Tasks Hub,
Notification preferences, System Messages, user roles, Access groups, or a
generic Automation builder. The source domain is access governance; tasks and
notifications merely present its output.

Default card:

```text
Access request coordinators

Choose up to 3 people to receive personal responsibility when someone asks for
their direct access to be reviewed. Other authorized access managers can still
review every request in Access requests.

Personal responsibility                     Shared lane only

[Add coordinators]
```

**Shared lane only** is calm, complete, and not red, yellow, “incomplete,” or a
setup blocker. The card contains no channel toggles; D45-owned email controls
belong with the exact system-message Delivery Plan, not coordinator membership.

Configured card:

```text
Access request coordinators

Maria Chen
Arjun Patel

2 coordinators · exact request eligibility is checked when work is assigned

[Edit coordinators]
```

Only independently authorized route managers see names/actions. Other grant
managers see no roster and continue using **Access requests** normally.

### Add or edit coordinators

Use the same shared bounded-route Base Maia sheet pattern established for Phase
24 coordinator settings, with purpose-specific copy:

```text
Access request coordinators

Choose 1–3 people to receive personal responsibility for access review
requests. This does not grant permission to view or decide a request.

[Search eligible people]
```

The shared server-filtered people picker:

- searches current visible same-Tenant active assignments only;
- returns only people currently eligible to decide at least one D43 request
  scope;
- uses debounced, cancelable, keyset-paginated server search rather than
  downloading the directory;
- shows full international display name plus only an independently authorized
  disambiguator;
- presents selected people as semantic rows outside the listbox, each with a
  separately named **Remove [name]** action;
- adds one person first, then progressively reveals **Add coverage**;
- at three shows **3 people selected · maximum** and explains that someone must
  be removed before another is added; and
- has no select-all, role/group/team import, paste list, order, primary/backup,
  workload, presence, schedule, rotation, skill, SLA, or channel control.

After one selection:

```text
Maria Chen
Eligible to receive access request responsibility
[Remove Maria Chen]

One person is usually clearest.
[Add coverage]
```

At two or three:

```text
2 people share access request responsibility

Each person receives their own task and in-product notification only when they
are currently authorized for that exact request. Reading does not claim it.
```

If a previously configured member has become ineligible, preserve the row:

```text
Maria Chen
Not currently eligible · receives no access request responsibility
[Remove Maria Chen]
```

Do not show which capabilities, sources, Legal Entities, people, or requests are
outside Maria's eligibility. A newly searched ineligible person is not offered
for selection; the empty result explains **No currently eligible people match
your search. Access requests will remain available in the shared lane.**

### Save and impact review

If current pending responsibility will change, keep the manager in the sheet
and show one concise review section before the primary action:

```text
Current impact

14 open requests checked
8 personal assignments continue
6 new personal assignments
3 personal assignments end
2 requests remain in the shared lane only

Newly responsible people receive in-product attention. Other delivery depends
on your organization's notification settings.

[Back]                         [Save and update 14 open requests]
```

Counts are localized and pluralized. Do not show a checkbox that silently
switches between future-only/current behavior; D44's meaning is one current
responsibility route. Do not open a second confirmation dialog after this
complete review. On stale preview, keep selections and say **Access requests or
coordinator eligibility changed. Review the updated impact before saving.**

Success is persistent and programmatically announced:

```text
Access request coordinators updated
Current open requests are using the new responsibility settings. Access and
decision permissions did not change.
```

If projection delivery is still catching up, say **Responsibility was saved.
Personal tasks and notifications are still updating; Access requests remains
available.** Never say the save failed after the authoritative receipt committed.

### Coordinator experience

The same pending request can be encountered in three complementary ways:

1. **Notification Center:** one safe “Access review requested” attention item
   with **Review request**.
2. **Tasks Hub:** one persistent source-backed **Review current access** item for
   that exact request, with source-controlled closure.
3. **People & access → Access requests:** the complete permission-filtered source
   lane, available regardless of coordinator configuration/projection health.

Task detail explains:

```text
You received this because your organization selected you as an Access request
coordinator and you are currently authorized for this request. Other
coordinators may also receive responsibility. Reading or opening this item does
not claim the request.
```

Only the authenticated Phase 12 request detail displays protected holder context
and the current lawful decision controls. Notification Center and Tasks Hub list
copy remain safe. The first valid Phase 12 terminal receipt ends all applicable
personal projections; another coordinator's read/open does nothing to siblings.

### Empty, degraded, and conflict states

- **No coordinators configured:** show **Shared lane only**; requests remain in
  **Access requests**; no warning or guessed recipient.
- **No eligible coordinator for one request:** show no personal item; authorized
  route managers may see an aggregate **Some requests have shared-lane coverage
  only** health fact, never protected details.
- **All configured members ineligible:** keep configured rows with safe repair
  status; source lane continues.
- **Recipient loses authorization:** remove protected task/notification/detail
  immediately; do not label the request resolved or reassigned.
- **Projection unavailable:** preserve source route/request; task or notification
  may show only a safe unavailable state when currently authorized; reconcile
  from source identity.
- **Concurrent decision:** loser sees the current source result; no task or
  notification state overrides it.
- **Concurrent route edits:** first expected-head save wins; second keeps draft
  selections but must review current settings/impact again.
- **Offline/poor connection:** do not optimistically claim save. Exact replay
  resolves the receipt; stale cached list data is visibly stale and cannot
  authorize detail or action.

### Accessibility, localization, mobile, and low bandwidth

- Use shared `@asym/ui`, Base UI behavior, exact Base Maia/Zinc semantic tokens,
  Lucide icons, and no new component library or app-local fork.
- The permanent bell/Notification Center target is at least Core's important
  44-by-44 CSS-pixel target; do not retain the current 32-pixel demo trigger.
- Use a labelled button, sheet title/description, combobox/listbox semantics,
  semantic selected-person list, visible focus, and logical focus return.
- Loading, result count, maximum selection, stale preview, save progress,
  success, and projection catch-up are polite programmatic status messages;
  errors are associated with their controls and not conveyed by toast/color.
- Keyboard and screen-reader users can search, add, remove, review impact, save,
  cancel, open notification detail, and return without focus loss or hidden
  content.
- Reflow works at 320 CSS pixels and 400% zoom; controls stack without horizontal
  page scroll, clipping, obscured focus, or sticky-footer overlap.
- Forced colors, contrast, reduced motion, 200% text, target spacing, and
  non-color status are release evidence.
- International names, duplicate names, long translated labels, localized
  plurals/dates, CJK, RTL/bidi, and mixed-script content wrap safely.
- Candidate search is server-filtered/paginated; initial card and lane need no
  full-directory download. Save state is resumable by semantic receipt on poor
  networks.
- Notification previews remain generic enough for shared-screen/over-shoulder
  privacy and never rely on avatar, icon, sound, badge, or color alone.

## Database, RLS, authorization, and privacy requirements

The implementation should extend Phase 12's typed governance relations, not add
a generic routing JSON blob. Exact physical names remain an implementation
detail, but the relational contract requires:

- one route head/revision relation keyed by `(tenant_id, route_purpose)`;
- immutable route-member rows keyed by `(tenant_id, route_revision_id,
active_tenant_assignment_id)` with composite same-Tenant foreign keys;
- one current-responsibility application/generation identity tied to exact route
  and request-set heads;
- one request-recipient generation keyed by Tenant, exact D43 request, route/
  application generation, and recipient assignment;
- partial uniqueness for one current recipient generation per exact request and
  assignment and one semantic task/notification occurrence per projection key;
- append-only route/application/recipient events and audit attribution; and
- product-owned command receipts/idempotency keys independent of transport.

Every base relation has `tenant_id NOT NULL`; no default Tenant exists. Raw
tables are browser-revoked. Purpose-built readers and commands derive Tenant,
actor, active assignment, route purpose, timestamps, heads, status, and audit
attribution from trusted context. Caller-controlled recipient, requester,
source, status, route mode, actor, or attribution fields are rejected.

RLS and command requirements:

- `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY` on owner-reachable
  relations;
- explicit grants plus default-deny policies;
- `SELECT USING` proves current Tenant and purpose-specific route/lane/recipient
  visibility;
- mutation `USING` and `WITH CHECK` prevent a permitted row from being retargeted
  to another Tenant, assignment, request, route, purpose, or generation;
- security-definer functions pin an empty `search_path`, schema-qualify objects,
  revoke default execute, and grant only named callers;
- service-role, owner, `BYPASSRLS`, background worker, support, operator,
  impersonation, export, cache, and AI paths enforce equivalent Phase 12 checks;
- route save and request decision use independent commands/capabilities; and
- advisory/row locks plus expected heads prevent lost updates, duplicate
  recipient generations, and terminal/projection races.

Privacy minimization:

- route storage contains opaque assignment IDs, not emails, names, avatars,
  capability names, schedules, absence, workload, or performance;
- list/task/notification/communication events contain no D43 free text or D42
  provenance;
- safe recipient explanations state only why the recipient received attention;
- route/history exports require separate current governance/audit authorization;
- logs/metrics use opaque IDs and bounded counts; no person-level performance
  leaderboard or “slow coordinator” score exists;
- assignment end removes operational visibility immediately while immutable
  audit follows Phase 12 retention/anonymization/hold rules; and
- backups, support copies, search, embeddings, analytics, notification previews,
  and email are included in protected-egress tests.

## Lifecycle, concurrency, idempotency, and failure handling

### Route lifecycle

```text
source_lane_only@1
    └─ explicit save with 1–3 eligible members → named_coordinators

named_coordinators
    ├─ replace/add/remove within 1–3 → named_coordinators successor
    └─ explicit remove-last save → source_lane_only@1 successor
```

There is no draft-current, disabled, paused, primary, backup, round-robin,
claimed, on-call, expired, or auto-fallback route state. Client draft is local
form state only. Every successful save appends a revision and one current head;
history is not edited.

### Responsibility generation lifecycle

```text
current
    ├─ D43 terminal/source end → ended_source
    ├─ route successor excludes recipient → ended_route_changed
    ├─ current authorization lost → ended_authorization_lost
    ├─ requester exclusion becomes applicable → ended_requester_excluded
    └─ corrected/superseding generation → ended_superseded
```

These are source/projection end reasons, not D43 request states. They cannot
produce Keep/Remove/no-longer-applicable or mutate the grant.

### Race rules

| Race/failure                                      | Permanent result                                                                                                                   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Two route managers save from one head             | First CAS wins; second sees current settings and recomputes impact; no last-write-wins.                                            |
| Route save races D43 request creation             | Request pins either complete old or complete new route head; reconciliation converges from source heads; never a mixed member set. |
| Route save races D43 terminal decision            | Closed request receives no new projection; any prepared child rechecks source and suppresses.                                      |
| Member loses authorization during preview/save    | Changed authorization head stales preview; nothing writes until recomputed.                                                        |
| Member loses authorization after route commit     | Visibility ends immediately; reconciler records differential end; lane remains.                                                    |
| Requester also configured coordinator             | Excluded only from their exact request; siblings remain; no self-notification.                                                     |
| Requester/assignment is recreated                 | Old exact assignment stays excluded/history-bound; no automatic retarget/revival.                                                  |
| Worker retries after 24 hours                     | Product semantic unique key/receipt returns prior effect; Inngest dedupe is irrelevant.                                            |
| Projection succeeds but response is lost          | Receipt lookup reports committed source result; exact retry creates no fresh unread/task/email.                                    |
| Task succeeds, notification fails                 | Request/route/task truth remains; notification reconciles independently.                                                           |
| Notification succeeds, task fails                 | Request/route/notification truth remains; task reconciles independently.                                                           |
| Optional email fails                              | In-product/lane/task remain; Phase 6 records channel outcome and retries/reconciles under D45, never reroutes responsibility.      |
| Complete recipient resolver times out             | No personal release for affected request/application; source lane remains; retry from current heads.                               |
| Bulk application partially materializes           | Current source route is authoritative; incomplete projections are visible operationally and resume by product work claim.          |
| Another coordinator decides while recipient reads | Source terminal receipt wins; stale detail/action returns current outcome; reading is preserved only as engagement evidence.       |

### Semantic idempotency

- Route save: Tenant + D44 route purpose + caller command token, with exact
  normalized input hash and expected head.
- Current-application generation: Tenant + committed route revision + sealed
  current request-set digest.
- Request recipient generation: Tenant + exact D43 request + application/route
  generation + exact recipient assignment.
- Per-request in-product occurrence: system-message key + source request
  occurrence + recipient generation.
- Aggregate current-update occurrence: system-message key + route/application
  generation + recipient assignment.
- Tasks Hub projection: ADR-0183 source-work identity + recipient generation.
- Any later email: D45 Delivery Plan occurrence + exact recipient/channel step.

Same-key/same-input replay returns the existing receipt/outcome. Same-key with a
different route, member set, source set, recipient digest, or channel step
conflicts. Legitimate later changes use successor generations; nothing deletes
an old identity to “make retry work.”

## Scalability, performance, and operational posture

- Coordinator cardinality is bounded at three, so per-request candidate fan-out
  is O(1). Exact qualification must be set-based and index-backed rather than
  three ad hoc API calls or per-row N+1 resolver invocations.
- The Access requests lane and Tasks Hub paginate by stable keyset; counts derive
  from source/request heads and purpose-filtered recipient projections, not
  client rows or decrypted reasons.
- Route impact preview uses a normalized current-request set and set-based
  authorization joins. It does not load request bodies or decrypt explanations.
- Current application can page/batch unbounded pending work through a product-
  owned application ledger/work claim. No fixed “large Tenant” assumption is
  frozen; load evidence determines safe batch/concurrency configuration.
- Required in-product per-request attention remains one semantic item; a bulk
  current change uses one aggregate occurrence per recipient/application to
  prevent N bell items. Tasks remain individual because they represent distinct
  source actions.
- Cache keys include Tenant, purpose, viewer assignment, route/application head,
  request head, recipient generation, and governance epoch. Authorization loss
  invalidates visibility even if purge/projector work lags.
- Projection and delivery are asynchronous only after the authoritative source
  commit. The source lane is the operational fallback and requires no worker.
- Reconciliation scans product heads, compares expected semantic identities,
  creates missing projections, ends stale projections, and never makes a human
  decision or broadens a recipient set.
- No individual coordinator productivity score, leaderboard, workload ranking,
  response quota, or inferred availability is recorded. Operational metrics are
  aggregate system/route health only.

## Rollout, migration, and rollback

1. Ratify D44 terms, keys, ownership, current-application behavior, and D45 seam
   across the decision log, Phase 12, ADR-0183, ADR-0027, glossary, and roadmap.
2. Register route/read/recipient/application contracts and required Phase 17
   in-product keys as non-Live; add deny-boundary tests before UI exposure.
3. Add same-Tenant relational schema, constraints, forced RLS/grants, immutable
   history, hardened commands, semantic receipts, indexes, and reconciliation.
4. Ship the complete **Access requests** lane and D43 source lifecycle before
   any coordinator or notification projection.
5. Ship lane-only default plus settings/preview in shadow mode; compare complete
   recipient/impact results without creating tasks or notifications.
6. Activate one-Tenant canary for route/application/task projection, then
   required in-product attention only after the exact Phase 17 proof pack passes.
7. Decide and separately activate D45 email. Do not hold D44 launch hostage to
   email provider readiness.
8. Expand by Tenant with projection/source reconciliation and privacy/a11y/
   comprehension evidence.

Migration creates no per-Tenant route or member rows; absence resolves to the
code-owned `source_lane_only@1` effective posture. It does not infer
coordinators from roles, grants, groups, Owners, original grantors, existing
tasks, notification recipients, finance approvers, Website/Mobilize routes,
email aliases, or activity. It fabricates no historical responsibility or
notification occurrences.

Mixed versions fail safe: old clients cannot write route or generic source-
backed task state; unknown route/member/message versions are non-releasing;
new readers tolerate the immediately prior schema generation. Rollback disables
the settings and personal projectors, preserves route/request/audit receipts,
keeps **Access requests** usable, and never restores or removes access. Re-
enabling rebuilds projections from current product heads without fresh unread
for unchanged semantic generations.

## Research assertions — D44-RA001 through D44-RA120

### Repository and governing facts

- **D44-RA001 — Repository fact:** D43 is a Phase 12
  `permission_change_request` subtype; neither Tasks Hub nor Notification Center
  owns its state.
- **D44-RA002 — Repository fact:** the Phase 12 **Access requests** lane is the
  complete permission-filtered source recovery surface and does not depend on
  personal routing.
- **D44-RA003 — Repository fact:** D43 delegates only personal recipient routing
  to D44; it does not delegate decision authority or lifecycle.
- **D44-RA004 — Repository fact:** exact D43 decisions require current same-
  Tenant `permissions.manage_grants` within live scope/ceiling plus Phase 12
  floors and self/SoD/quorum safeguards.
- **D44-RA005 — Repository fact:** Active Tenant Assignment—not profile, email,
  role label, or task assignee—is Phase 12's membership-backed authorization
  identity.
- **D44-RA006 — Repository fact:** ADR-0183 makes assignment a presentation/
  engagement fact that grants no source visibility or action authority.
- **D44-RA007 — Repository fact:** ADR-0183 requires source-controlled closure
  and rejects generic completion, reassignment, dismissal, deletion, comments,
  due dates, reminders, bulk, import, support, AI, and worker mutation.
- **D44-RA008 — Repository fact:** ADR-0027 makes in-product notification a role-
  safe attention projection, not source, task, workflow, delivery, or completion
  truth.
- **D44-RA009 — Repository fact:** ADR-0027 requires in-product and email steps
  to be independently authorized; one channel's engagement/failure does not
  complete another.
- **D44-RA010 — Repository fact:** ADR-0027 already distinguishes continuing,
  newly admitted, and removed recipient engagement generations.
- **D44-RA011 — Repository fact:** ADR-0026/Phase 17 require stable message keys,
  bounded Delivery Plans, source fences, complete candidate sets, and semantic
  recipient/channel identities.
- **D44-RA012 — Repository fact:** Core's workflow contract keeps product records,
  dispatch ledger, and work claims authoritative while workflow events carry
  identifiers only.
- **D44-RA013 — Repository fact:** the current staff bell is hardcoded demo UI
  with fake people/actions and is not Phase 17 notification authority.
- **D44-RA014 — Repository fact:** the current `/tasks` experience and schema use
  generic mutable/profile-oriented fields and hardcoded seed identities; they
  are not D44 authority.
- **D44-RA015 — Repository fact:** current contribution approval notification
  code is finance/profile/role/SLA-specific migration input, not a reusable
  Phase 12 coordinator route.

### Current external evidence

- **D44-RA016 — Verified external fact:** Microsoft Entra supports selected
  reviewers and current-review reviewer changes separately from recurring-
  series settings.
- **D44-RA017 — Verified external fact:** Microsoft Entra can send reviewer email
  but reviewers can also open pending reviews directly in My Access.
- **D44-RA018 — Verified external fact:** Microsoft warns review email can be
  delayed, so email is not a reliable source-discovery boundary.
- **D44-RA019 — Verified external fact:** Microsoft exposes contacted reviewers
  and timestamps as delivery evidence separate from review decisions.
- **D44-RA020 — Verified external fact:** Okta separates requester, request
  assignee, task assignee, follower, and notification audiences.
- **D44-RA021 — Verified external fact:** Okta supports email, Slack, and Teams
  notifications, proving channels are explicit delivery choices rather than
  task-state synonyms.
- **D44-RA022 — Verified external fact:** Okta can leave some requests unassigned;
  no-recipient is a real operational state.
- **D44-RA023 — Verified external fact:** Okta team auto-assignment/rotation is
  optional complexity, not necessary to express a small explicit cohort.
- **D44-RA024 — Verified external fact:** Okta warns chat approval sessions can
  have weaker assurance and email-address identity matching risks.
- **D44-RA025 — Verified external fact:** SailPoint provides both an Approvals
  surface and email notification to reviewers.
- **D44-RA026 — Verified external fact:** SailPoint current-request reassignment
  notifies the new reviewer.
- **D44-RA027 — Verified external fact:** Salesforce exposes in-product pending
  approvals and a separate per-user approval-email setting.
- **D44-RA028 — Verified external fact:** Contentful exposes pending tasks and
  emails assignees, but its API does not guarantee assignee read access.
- **D44-RA029 — Verified external fact:** Apple recommends concise,
  nonduplicative notifications with no sensitive/confidential content and
  persistent discoverability when badges are unavailable.
- **D44-RA030 — Verified external fact:** Inngest event/function idempotency is
  limited to 24 hours and wait-for-event can miss events emitted before the wait
  begins.

### Route model and authority

- **D44-RA031 — Product judgment:** D44 has exactly two route modes:
  `source_lane_only@1` and `named_coordinators`.
- **D44-RA032 — Product judgment:** lane-only is the safe default and a complete
  normal configuration, not an error or missing setup.
- **D44-RA033 — Product judgment:** named mode has one-to-three unique, unordered,
  co-equal members; the cap is Core v1 product judgment, not a universal industry
  optimum.
- **D44-RA034 — Requirement inference:** structural constraints make null mode,
  empty named mode, duplicate/fourth member, and cross-Tenant membership
  impossible.
- **D44-RA035 — Requirement inference:** each route member binds an exact same-
  Tenant Active Tenant Assignment, never a bare profile, person, email, role,
  group, team, or alias.
- **D44-RA036 — Requirement inference:** assignment end/recreation never retargets
  or revives a route member.
- **D44-RA037 — Product judgment:** current Tenant-wide
  `permissions.manage_grants` plus purpose-specific staff enumeration manages
  this Tenant-wide route; coordinator status itself never does.
- **D44-RA038 — Requirement inference:** the server derives Tenant, actor,
  purpose, assignment, heads, timestamps, and audit; caller attribution is
  rejected.
- **D44-RA039 — Requirement inference:** route revisions and audit are immutable;
  successful save appends one successor under expected-head CAS.
- **D44-RA040 — Requirement inference:** route member order is canonicalized only
  for identity/hashing and creates no primary, backup, or precedence.
- **D44-RA041 — Product judgment:** new selections are limited to active same-
  Tenant assignments currently eligible for D43 decision work in at least one
  scope.
- **D44-RA042 — Requirement inference:** a configured member who later becomes
  ineligible is inert but remains safely visible to route managers for repair.
- **D44-RA043 — Requirement inference:** route save changes no grant,
  EffectiveAccess, D43 state, governance epoch, source explanation, or decision.
- **D44-RA044 — Product judgment:** coordinator intent is separate from Website,
  Mobilize, finance, Support, original-grantor, role, Access-group, and Tasks Hub
  rosters.
- **D44-RA045 — Requirement inference:** no import, sync, “use existing team,”
  inferred default, or cross-domain roster copy creates D44 membership.

### Exact recipient resolution and source ownership

- **D44-RA046 — Requirement inference:** each pending request resolves a complete
  route × exact current D43 decision-authority intersection.
- **D44-RA047 — Requirement inference:** requester exclusion uses trusted
  principal/assignment relationships to exclude the exact subject assignment
  and every configured assignment currently resolving to the authenticated
  requester; it affects personal routing only and never matches email/name.
- **D44-RA048 — Requirement inference:** read-only D42 provenance/audit access
  never qualifies a coordinator to receive D43 decision responsibility.
- **D44-RA049 — Requirement inference:** incomplete, timed-out, stale, corrupt,
  partial, or over-limit resolution releases nobody for the affected request.
- **D44-RA050 — Requirement inference:** proved-zero never falls back to every
  manager, Owner/Admin, original grantor, manager, requester choice, support, or
  prior coordinator.
- **D44-RA051 — Requirement inference:** the source lane remains complete and
  actionable when routing resolves zero or indeterminate.
- **D44-RA052 — Requirement inference:** one responsibility generation pins exact
  request, route, authorization/governance heads, normalized recipients, and
  semantic source-work identity.
- **D44-RA053 — Requirement inference:** one exact request/recipient generation
  yields at most one current personal task projection.
- **D44-RA054 — Requirement inference:** task assignment never grants request
  detail, decision authority, or grant mutation.
- **D44-RA055 — Requirement inference:** notification recipient status never
  grants task or source visibility.
- **D44-RA056 — Requirement inference:** every lane row, task row, notification,
  deep link, detail, and source action re-proves its own current purpose and
  authorization.
- **D44-RA057 — Requirement inference:** request creation succeeds and remains
  visible in the lane even if recipient resolution, Tasks Hub, Phase 17, email,
  or Inngest is unavailable.
- **D44-RA058 — Requirement inference:** D43 withdrawal/terminal/source end alone
  decides source actionability; personal projection end does not.
- **D44-RA059 — Requirement inference:** one recipient's read/open/action changes
  no sibling engagement and claims nothing.
- **D44-RA060 — Requirement inference:** no personal route can narrow the shared
  lane audience or exclude another independently authorized decision-maker.

### Current-pending differential application

- **D44-RA061 — Product judgment:** a confirmed route save applies to current
  pending requests; prospective-only routing is rejected as brittle for staff
  departure/duty changes.
- **D44-RA062 — Requirement inference:** every current-impacting save first shows
  a complete, permission-safe impact preview.
- **D44-RA063 — Requirement inference:** preview reports only safe aggregate
  continuing/new/ending/lane-only counts and no requester/source matrix.
- **D44-RA064 — Requirement inference:** preview and apply bind the same route,
  request-set, authorization, recipient digest, and expected heads.
- **D44-RA065 — Requirement inference:** changed request/route/authorization heads
  stale the preview and produce no write.
- **D44-RA066 — Requirement inference:** the primary save label explicitly says
  when current open requests will update.
- **D44-RA067 — Requirement inference:** continuing recipients preserve exact
  task and notification engagement without fresh unread.
- **D44-RA068 — Requirement inference:** newly admitted recipients receive fresh
  responsibility/attention only after current source reproof.
- **D44-RA069 — Requirement inference:** removed recipients end as **Coordinator
  responsibility changed**, not read, done, dismissed, or source-resolved.
- **D44-RA070 — Requirement inference:** authorization loss removes protected
  visibility immediately even if differential projection repair lags.
- **D44-RA071 — Requirement inference:** removing the last coordinator explicitly
  returns all current pending work to shared-lane-only responsibility.
- **D44-RA072 — Requirement inference:** route application may batch projection
  work but route/request heads remain authoritative throughout mixed progress.
- **D44-RA073 — Requirement inference:** each batch uses product work claims and
  current reproof; worker position never owns recipient truth.
- **D44-RA074 — Requirement inference:** route-save ambiguity resolves through the
  durable command receipt, never an optimistic client assumption.
- **D44-RA075 — Requirement inference:** rollback can disable personal projectors
  while preserving route/request truth and the source lane.

### Notification and channel separation

- **D44-RA076 — Founder ruling:** Tasks Hub is not the only way an admitted
  coordinator is notified.
- **D44-RA077 — Product judgment:** every newly admitted coordinator receives a
  required Phase 17 in-product attention occurrence independently of Tasks Hub.
- **D44-RA078 — Product judgment:** the per-request stable key is
  `holder_access_review_requested_v1`.
- **D44-RA079 — Product judgment:** per-request in-product attention uses
  `presentation.source_actionable_then_recent_90d@1`.
- **D44-RA080 — Requirement inference:** per-request safe preview discloses no
  request reason, capability, source/provenance, group, grantor, roster, or
  decision recommendation.
- **D44-RA081 — Requirement inference:** notification action is an authenticated
  deep link to Phase 12 detail; no inline Keep/Remove/Approve/Reject exists.
- **D44-RA082 — Requirement inference:** notification read/archive/badge state
  never claims work, changes task state, or decides D43.
- **D44-RA083 — Requirement inference:** task and notification share only causal
  source/recipient-generation identity; neither is emitted from the other.
- **D44-RA084 — Product judgment:** a current recompute admitting one recipient to
  one or more existing requests emits one
  `access_request_responsibility_updated_v1` summary, not N bell items.
- **D44-RA085 — Requirement inference:** the summary key is unique per recipient
  assignment and current-application generation, with a safe source-derived
  count and filtered lane link.
- **D44-RA086 — Requirement inference:** individual source/task identities remain
  separate even when attention is grouped.
- **D44-RA087 — Requirement inference:** newly admitted, continuing, removed, and
  source-ended notification generations follow ADR-0027 differential engagement.
- **D44-RA088 — Requirement inference:** required in-product attention cannot be
  disabled by task preferences or inferred from email outcome.
- **D44-RA089 — Product judgment:** D45 decides optional initial external email
  only; D44 admits no SMS, push, Slack, Teams, or external-action response.
- **D44-RA090 — Product judgment:** reminder cadence, deadlines, SLA, escalation,
  and automatic reassignment remain a later D46 decision.

### UX, privacy, safety, performance, and operations

- **D44-RA091 — Product judgment:** route settings live in **People & access →
  Access requests → Settings**, not Tasks Hub or notification preferences.
- **D44-RA092 — Product judgment:** the default card says **Shared lane only**
  calmly and never presents lane-only as failure.
- **D44-RA093 — Product judgment:** selection progressively reveals second/third
  coverage rather than showing three empty slots.
- **D44-RA094 — Requirement inference:** picker search is purpose-filtered,
  server-side, cancelable, debounced, keyset-paginated, and directory-minimized.
- **D44-RA095 — Requirement inference:** no select-all, role/group/team import,
  rank, primary/backup, rotation, workload, presence, schedule, SLA, or channel
  control appears.
- **D44-RA096 — Requirement inference:** stale configured members remain safely
  visible as ineligible; new ineligible candidates cannot be selected.
- **D44-RA097 — Requirement inference:** UI uses shared `@asym/ui`, Base UI,
  exact Base Maia/Zinc tokens, and no app-local component fork.
- **D44-RA098 — Requirement inference:** permanent notification control meets the
  important 44-by-44 CSS-pixel target and does not preserve the 32-pixel demo.
- **D44-RA099 — Requirement inference:** focus, names/roles/states, errors, status
  messages, keyboard flow, reflow, contrast, target size, and authentication meet
  Core's WCAG 2.2 AA evidence gate.
- **D44-RA100 — Requirement inference:** international/duplicate names, CJK,
  RTL/bidi, long localization, and localized count/date semantics are test cases.
- **D44-RA101 — Requirement inference:** tasks, notifications, email, logs,
  metrics, analytics, AI, search, cache, and workflow events contain no D43
  private text or D42 provenance.
- **D44-RA102 — Requirement inference:** route storage contains opaque assignment
  identities only; names/contacts are current authorized projections.
- **D44-RA103 — Requirement inference:** forced RLS, explicit grants, composite
  Tenant keys, both mutation predicates, and privileged-path parity prevent
  retarget/cross-Tenant transformation.
- **D44-RA104 — Requirement inference:** bounded coordinator cardinality makes
  recipient fan-out O(1); set-based joins avoid per-request/per-member N+1.
- **D44-RA105 — Requirement inference:** one aggregate attention occurrence
  prevents route-change notification storms without hiding individual tasks.

### Migration, proof, and next decision

- **D44-RA106 — Requirement inference:** semantic uniqueness and receipts live in
  Postgres/product state, not Inngest's 24-hour dedupe window.
- **D44-RA107 — Requirement inference:** no Inngest human wait, timeout, recipient
  selection, channel choice, or source mutation is permitted.
- **D44-RA108 — Requirement inference:** task, notification, and optional email
  failures are independently observable/recoverable and never roll back a valid
  D43 request or route save.
- **D44-RA109 — Requirement inference:** reconciliation derives missing/stale
  projections from current source heads and cannot broaden recipients.
- **D44-RA110 — Requirement inference:** new/migrated Tenants start lane-only and
  infer no coordinators or historical occurrences.
- **D44-RA111 — Requirement inference:** rollout orders schema/denials/source lane
  before settings, tasks, in-product notification, and later email.
- **D44-RA112 — Requirement inference:** unknown route/message versions are non-
  releasing in mixed-version deployment.
- **D44-RA113 — Requirement inference:** disabling personal projection leaves
  requests valid, discoverable, and actionable through the source lane.
- **D44-RA114 — Requirement inference:** audit distinguishes route configuration,
  recipient generation, task materialization, notification availability/
  engagement, email outcome, and source decision.
- **D44-RA115 — Product judgment:** individual coordinator speed/workload is not
  scored; only aggregate system/route health is monitored.
- **D44-RA116 — Assumption:** one-to-three coordinators balances clarity and
  coverage for Core's target Tenants; representative evidence may justify a
  future version, not an unbounded v1 control.
- **D44-RA117 — Assumption:** users can understand that coordinator responsibility
  grants no authority when the settings and “why me” copy say so consistently.
- **D44-RA118 — Assumption:** required in-product attention plus Tasks Hub feels
  complementary rather than duplicative; test this with infrequent and daily
  Mission Control users.
- **D44-RA119 — Unresolved unknown:** no current primary evidence chooses Core's
  external email default, recipient preference precedence, or provider-failure
  presentation.
- **D44-RA120 — Product judgment:** D45 should decide only the optional initial
  email supplement; recommend Tenant-enabled + recipient-permitted immediate
  email, default off, with reminders/escalation deferred.

## Falsifiable acceptance criteria

1. A new/migrated Tenant has exactly one current `source_lane_only@1` posture,
   no inferred coordinator, and a fully usable permission-filtered **Access
   requests** lane.
2. Named mode accepts exactly one-to-three unique unordered same-Tenant Active
   Tenant Assignments; null, empty, duplicate, fourth, ended, recreated, bare-
   profile, role/group/team, and cross-Tenant inputs write nothing.
3. Only a current Tenant-wide `permissions.manage_grants` holder with the
   purpose-specific staff-enumeration projection can read names/search/preview/
   save; actor/Tenant/assignment/time/audit are server-derived.
4. Candidate search returns only visible active same-Tenant assignments with
   current D43 decision eligibility in at least one scope, is keyset-paginated,
   and does not download or leak the full directory.
5. A configured member who later loses eligibility is inert and safely labelled
   to route managers; no replacement, access grant, request detail, or personal
   projection is inferred.
6. Every pending D43 request resolves the complete current route × exact current
   decision-authority intersection and excludes the exact subject assignment
   plus every configured assignment currently resolving to the authenticated
   requester principal from personal responsibility.
7. Zero/partial/indeterminate/stale/timeout/corrupt recipient resolution releases
   no personal task or notification, never broadens/falls back, and leaves the
   source lane truthful and actionable.
8. A coordinator, task recipient, notification recipient, or email recipient
   gains no request visibility, decision authority, grant capability, or route-
   management authority from that status.
9. New D43 request creation succeeds and remains recoverable when Tasks Hub,
   Phase 17, email, Inngest, or recipient resolution is unavailable.
10. A route-changing save cannot proceed without a complete current-impact
    preview bound to exact route/request-set/authorization heads and recipient
    digest; any changed head stales the preview and writes nothing.
11. Save copy and primary action clearly state that current open requests will
    update; route save changes no grant, EffectiveAccess, D43 state, or epoch.
12. Applying a new route preserves continuing task/notification engagement,
    admits new recipients freshly, and ends removed recipients as **Coordinator
    responsibility changed** without fabricated read/completion/source result.
13. Removing the final coordinator explicitly returns every current pending
    request to shared-lane-only responsibility without ending or changing the
    request.
14. A bulk recompute admitting one recipient to one or more existing requests
    creates individual source-backed task projections but exactly one
    `access_request_responsibility_updated_v1` in-product occurrence for that
    recipient/application generation.
15. A new post-recompute request creates at most one
    `holder_access_review_requested_v1` occurrence per exact recipient generation
    and does not mutate the prior aggregate occurrence.
16. Both in-product keys use source-actionable presentation, safe code-owned
    copy, exact authenticated deep links, independent per-recipient engagement,
    and source-derived presentation end.
17. Notification/task previews and every secondary sink contain no request/
    decision explanation, capability, D42 provenance, group, grantor, protected
    source, roster, or decision recommendation.
18. No notification exposes Keep/Remove/Approve/Reject; opening, reading,
    archiving, badge changes, email delivery, and task engagement cannot mutate
    D43 or the grant.
19. Generic task Complete/Reopen/Reassign/Dismiss/Delete/comment/due-date/
    reminder/bulk/import/support/AI/worker writes reject for D44 projections;
    only source receipts control closure.
20. Task and notification delivery can independently fail, retry, reconcile,
    and recover without rolling back or duplicating the committed request/route
    or changing another projection.
21. Required in-product attention works without email; D44 emits no SMS, push,
    Slack, Teams, reminder, escalation, timeout, or automatic reassignment.
22. Inngest receives identifier-only post-commit work, reauthorizes at fire time,
    and cannot own recipient identity, semantic idempotency, human wait, route,
    request, channel choice, or decision.
23. Route/member/application/recipient relations enforce same-Tenant composite
    keys, cardinality/uniqueness/check constraints, restrictive deletion,
    immutable history, forced RLS, explicit grants, and correct `USING` plus
    `WITH CHECK` behavior.
24. Owner/service-role/`BYPASSRLS`/support/operator/impersonation/worker/export/
    cache/AI paths cannot exceed the same Tenant, purpose, source, recipient,
    privacy, or action boundaries.
25. Settings use shared Base Maia/Base UI, calm lane-only state, progressive one-
    to-three selection, semantic rows/removal, safe impact review, and persistent
    save/catch-up status without a nested confirmation dialog.
26. Bell, settings, list, and detail journeys work by keyboard/screen reader at
    320 CSS pixels/400% zoom with visible focus, 44-pixel important target,
    programmatic statuses/errors, forced colors, reduced motion, and no color/
    avatar/badge-only meaning.
27. International/duplicate names, CJK, RTL/bidi, localized plurals/dates, slow/
    lost connections, stale preview, lost response, and assignment recreation
    produce safe, understandable, idempotent outcomes.
28. Recipient resolution/list/count/impact preview remains set-based and
    index-backed under production-shaped many-Tenant, many-request, concurrent-
    save/decision, and one-large-Tenant load without protected-text scans or N+1.
29. Migration infers no route/history/notification from current code or data;
    mixed versions fail non-releasing; rollback preserves source request/lane/
    audit and never grants/removes/restores access.
30. Decision log, glossary, ADR-0027, ADR-0183, Phase 12, roadmap, OpenSpec,
    design, tickets, implementation, tests, and release evidence use the same
    route modes, cardinality, terms, keys, recipient rules, source ownership,
    current-application semantics, channel boundary, and D45/D46 seams.

## Initial monitors and response contract

| Signal                                               | Threshold                                                                                                                         | Owner                                         | Required response                                                                                                                       |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `access_d44_cross_tenant_route_or_recipient_total`   | Any                                                                                                                               | Security + Data Platform                      | P0; stop route/projection paths, revoke affected presentation, assess all sinks, repair composite keys/RLS/privileged parity.           |
| `access_d44_invalid_route_cardinality_total`         | Any current named route outside 1–3 unique members or lane-only with members                                                      | Phase 12 + Database                           | Fence saves/resolution, restore last valid head from receipt, repair constraints and race fixtures.                                     |
| `access_d44_unauthorized_route_save_total`           | Any                                                                                                                               | Security + Phase 12                           | Disable route command, inspect current applications/projections, append attributable correction, repair capability/purpose enforcement. |
| `access_d44_ineligible_personal_recipient_total`     | Any task/notification/email released without exact current recipient proof                                                        | Security + Phase 12 + Notifications           | Incident; revoke projection/cache, suppress pending delivery, inspect exposure, repair resolver and negative tests.                     |
| `access_d44_requester_personal_recipient_total`      | Any exact requester receives own personal task/notification                                                                       | Security + Phase 12                           | End false projection, inspect whether protected detail escaped, repair assignment-bound exclusion; do not alter source decision rules.  |
| `access_d44_assignment_granted_authority_total`      | Any source access/action succeeds only because of route/task/notification status                                                  | Security                                      | P0; contain unauthorized action/access, adjudicate source effects, eliminate coupling, add every-boundary proof.                        |
| `access_d44_source_lane_unavailable_total`           | Any current authorized viewer cannot use **Access requests** while personal projection/channel is unavailable                     | Phase 12 + Platform Operations                | Restore lane first, disable dependent-only UX, repair source read path; never broaden recipients.                                       |
| `access_d44_preview_apply_mismatch_total`            | Any committed route application's normalized result differs from its sealed preview beyond source-terminal races                  | Phase 12 + Database                           | Pause route saves, reconcile from heads, inspect digest/CAS/batch logic, present truthful successor evidence.                           |
| `access_d44_unchanged_engagement_reset_total`        | Any continuing recipient gets duplicate assignment, fresh unread, or lost read state                                              | Tasks Hub + Notifications                     | Repair generation diff, merge/end duplicate projection without source mutation, add replay/current-apply regression.                    |
| `access_d44_duplicate_task_total`                    | More than one current task projection per source-work/recipient generation                                                        | Tasks Hub                                     | Stop projector, reconcile semantic identities, preserve source history, repair uniqueness.                                              |
| `access_d44_duplicate_notification_total`            | More than one per-request or aggregate in-product occurrence per semantic identity                                                | Notifications                                 | Suppress duplicate availability, preserve one engagement lineage, repair Phase 17 occurrence idempotency.                               |
| `access_d44_bulk_bell_fanout_total`                  | More than one new in-product item per recipient for one current-application generation with one or more existing requests         | Notifications + Phase 12                      | Stop fan-out, replace with safe aggregate occurrence, audit unread counts, repair grouping contract.                                    |
| `access_d44_private_text_egress_total`               | Any D43 explanation/provenance in route/task/notification/email/log/metric/AI/search/workflow/cache                               | Privacy + Security                            | Stop consumer, contain/delete lawful copies, assess incident, repair schema/allowlist and complete sink tests.                          |
| `access_d44_notification_from_task_total`            | Any notification recipient/availability/end inferred from task mutation rather than source generation                             | Notifications + Tasks Hub                     | Stop adapter, reconcile both from source, remove coupling, add causal-identity tests.                                                   |
| `access_d44_projection_lag_seconds`                  | p95 >300s for 15m with at least 50 pending projections, or any >1800s                                                             | Tasks Hub + Notifications + Workflow Platform | Keep lane active, reconcile product claims/outbox, inspect worker/provider; never reroute or mutate source.                             |
| `access_d44_current_application_stalled_age_seconds` | Any committed route application with unfinished projection work >15m                                                              | Phase 12 + Workflow Platform                  | Resume product-owned claims/reconciliation, show truthful catch-up status, preserve current source route semantics.                     |
| `access_d44_lane_only_request_age_seconds`           | Any pending request with zero personal recipients >24h                                                                            | Tenant access governance + Phase 12 Product   | Surface aggregate route health to authorized managers, review configuration/eligibility; never guess recipient or auto-decide.          |
| `access_d44_coordinator_fanout`                      | Any request has >3 configured or personal coordinator recipients                                                                  | Phase 12 + Tasks Hub + Notifications          | Stop release, end excess projections, inspect route/cardinality/digest, preserve source request.                                        |
| `access_d44_staff_comprehension_rate`                | Below 90% of at least 20 representative tests correctly distinguish lane, coordinator, task, notification, and decision authority | Product Research + UX + Security              | Revise terminology/hierarchy/copy, retest before expansion; do not solve with added warnings everywhere.                                |
| `access_d44_source_lane_only_tenant_rate`            | Observe only; no target until representative adoption evidence                                                                    | Product Research                              | Learn whether coordinators add value; never coerce setup or fabricate a success threshold.                                              |

No monitor may automatically choose/add/remove a coordinator, broaden a
recipient set, keep/remove/restore access, decide a request, create a fallback,
or expose protected detail. Automated response may fence a defective surface,
stop delivery, or reconcile identifier-only projections from current source
truth.

## D45 — should required in-product attention also send an initial email?

> **Historical prompt — resolved by D45 on 2026-08-29.** The founder selected
> Option 1, optional immediate email default Off. The corrected contract and
> its adversarial disposition are authoritative in the D45 artifacts and Phase
> 24 decision log; the options below are retained only as decision provenance.

### Why this needs a separate decision

Hope Mission configures Maria and Arjun as Access request coordinators. Jordan
submits a request while both are away from Mission Control. D44 already gives
each currently eligible coordinator:

- the complete shared **Access requests** recovery path;
- one personal Tasks Hub assignment; and
- one required, safe in-product Notification Center item.

D45 decides only whether the initial attention occurrence may also produce an
external email. It does not revisit recipients, request authority, task state,
source closure, Keep/Remove controls, reminders, deadlines, or escalation.
SMS, push, Slack, and Teams are unavailable because Core has not adopted them.

### Option 1 — optional immediate email, default off — recommended

The stable D44 contract offers one optional immediate email step. It sends only
when an authorized Tenant enables that contract-approved step **and** the exact
recipient's current preference, contactability, suppression, locale, connection,
source fence, and Phase 6/17 readiness permit it. Default is off. Email contains
safe generic copy plus an authenticated link, never request prose/provenance or
Keep/Remove actions. A bulk current-route change produces at most one summary
email per newly admitted recipient/application generation.

**Benefit:** helps coordinators who do not live in Mission Control, matches the
separation used by Entra, Okta, SailPoint, Salesforce, and Contentful, and gives
Tenants/recipients control without making email source truth.  
**Cost:** adds delivery configuration, preference, provider, suppression,
locale, history, and failure states; default-off setup may reduce initial reach.

### Option 2 — mandatory immediate email to every admitted coordinator

Every required in-product occurrence also gets a required email step; recipients
cannot opt out of this operational class. Current destination, suppression,
source-fence, and provider-safety checks may still block delivery, and no surface
may claim that the recipient received it.

**Benefit:** highest off-platform visibility with minimal policy ambiguity.  
**Cost:** surprise email, notification fatigue, privacy/lock-screen exposure,
provider dependence, and weak fit for volunteers/shared inboxes/time zones. It
also conflicts with Core's current pattern of independently authorized channels.

### Option 3 — no email; in-product only

Keep the source lane, Tasks Hub, and required in-product Notification Center
item, but define no D45 email step.

**Benefit:** smallest privacy, provider, preference, localization, and operating
surface.  
**Cost:** infrequent Mission Control users may not learn about personal
responsibility until they next sign in.

### Recommendation

Choose **Option 1 — optional immediate email, default off**. It is the strongest
modern and Core-consistent balance: durable in-product discovery is guaranteed;
email can improve reach only through the existing bounded Delivery Plan and
recipient protections. Leave reminder/escalation cadence to D46 so this one
decision does not become a hidden workflow engine.

**Which D45 email policy should Core record: Option 1, Option 2, or Option 3?**

## Evidence limits

- Microsoft, Okta, SailPoint, Salesforce, Contentful, and Blackbaud demonstrate
  selected responsibility plus one or more notification surfaces; none proves
  that one-to-three is universally optimal for nonprofit ministries.
- Microsoft and SailPoint support current reviewer changes, but neither proves
  Core's exact all-current differential application or aggregate attention key.
- Apple's anti-duplication/privacy guidance supports grouped safe presentation;
  it does not mandate Core's specific text, keys, or 90-day policy.
- Contentful's documented assignee-without-access risk is useful counterevidence,
  not proof of Core implementation behavior.
- Blackbaud evidence is older and establishes only that nonprofit CRM tasks/
  ownership may be paired with email alerts.
- No primary source proves route-management authority should be Tenant-wide
  `permissions.manage_grants`; this is a proportional Core product judgment that
  avoids a speculative capability while remaining narrower than role labels.
- No evidence establishes representative ministry request volume, coordinator
  availability, task/notification comprehension, ideal email default, response
  SLA, reminder cadence, or escalation policy. Those claims require research and
  production-shaped evidence.
- Required in-product presentation cannot become `Live` merely because D44 names
  a key; Phase 17 still requires the exact producer, recipient, publication,
  accessibility, security, load, operations, and rollback proof pack.

## Final research disposition

**Accept with required amendments.** Record optional one-to-three explicit
Access request coordinators only as a current Phase 12 responsibility route over
the always-available **Access requests** lane. Bind members to exact same-Tenant
Active Tenant Assignments; admit only current eligible decision-makers; exclude
the requester from personal responsibility; apply deliberate saves to current
pending requests after a complete impact preview; preserve continuing
engagement; group backlog attention; and require one independent Phase 17 in-
product attention path beyond Tasks Hub.

Keep source authority, task presentation, notification engagement, and external
delivery separate. D45 now adds one optional immediate email sibling under a
Tenant-default-Off, recipient `inherit | disabled` policy; D46 later decides
whether reminders are justified, with digest and escalation separate. This is modern without importing a
vendor workflow engine, and flexible without turning roles, teams, channels, or
workers into hidden authorization.
