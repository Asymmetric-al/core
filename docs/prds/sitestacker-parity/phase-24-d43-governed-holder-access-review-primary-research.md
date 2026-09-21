# Phase 24 D43 — Governed Holder Access-Review Request Primary Research

**Research date:** 2026-08-29  
**Decision under review:** after an exact current holder sees D42's safe
**Added for continuity** explanation and believes the surviving direct grant is
no longer appropriate, offer one secondary **Ask for an access review** action.
The request changes no access, reuses Phase 12 access governance, tracks a safe
holder-visible status, and can project reviewer work into the shared Tasks Hub
without making task or workflow state authorization truth.  
**Scope:** problem validity, access-governance ownership, current Core fit,
request and decision lifecycle, exact-source concurrency, semantic idempotency,
review authority, Tasks Hub projection, optional Inngest execution, Tenant/RLS
safety, private explanation handling, retention, observability, accessible
mobile UX, migration, performance, and the next routing decision.  
**Verification note:** broad formatting, local-link, skill-parity, strict
OpenSpec, lint, typecheck, unit, build, and diff checks remain deferred until
the end of the Grill session by founder direction.

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

## Research question

Is a governed review/removal request the modern, least-brittle permanent action
for a holder who questions one D40 continuity direct grant? If so, how can Core
reuse Phase 12's planned `permission_change_request` and ADR-0183's projection
contract without inventing another workflow engine, creating a sticky inbox,
or letting the request, task, notification, or Inngest run mutate access?

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

**Option 1 is modern and proportionate, but only with required amendments.** It
should not become a generic ticket, a second approval framework, an immediate
self-revocation wrapper, or an Inngest-owned human workflow.

Current identity-governance products support the core interaction:

- Microsoft My Access lets people inspect and review their own access. When a
  self-reviewer says access is no longer needed, Microsoft does not remove it
  immediately; removal occurs when the review ends or an administrator stops
  it. Microsoft also exposes request history/status and permits cancellation of
  still-pending access requests.
- Okta Access Requests gives the requester a durable details/status view and
  permits cancellation before a reviewer acts. Approval work is assigned
  separately, and Okta explicitly excludes the original requester from a group
  assigned to complete the request.
- SailPoint lets people request removal of their own directly revocable access,
  requires a comment, tracks the request, and sends it to a reviewer when
  approval is configured; inherited access that would simply be restored is
  not exposed as an independently revocable assignment.
- AWS IAM Access Analyzer distinguishes an active finding from the authoritative
  policy change that resolves it. A reviewer first decides whether access is
  intentional; remediation then changes the granting policy.

Those products do not prove Core's exact request type or UX. They support the
permanent principle: **a holder-authored concern is durable governance input,
not authorization and not the access mutation itself**.

The corrected D43 contract is:

1. D43 applies only to the exact current D40 continuity direct grant shown in
   the staff member's authenticated My Access projection. It is not a universal
   self-service revocation rule and cannot target group, role, public, donor,
   missionary, support, operator, or inferred access.
2. The secondary action is **Ask for an access review**. It progressively
   reveals one compact inline Base Maia form immediately beneath the current
   access explanation. It repeats the safe capability label and end condition,
   not protected D42 provenance. It opens no sheet, modal, nested dialog, or
   separate task surface.
3. The form contains one required private plain-text answer to **Why should
   this access be reviewed?** After deterministic CRLF-to-LF handling and
   surrounding-whitespace trim, it contains 1–500 Unicode code points. The
   server performs no compatibility normalization or silent truncation. It
   permits line breaks but no rich text, attachments, URLs-as-
   anchors, mentions, category taxonomy, copied group/actor/receipt fields, or
   Tenant-authored questions.
4. The concise hint says **Briefly explain what changed. Do not include
   confidential ministry, donor, member-care, personnel, location, or security
   details.** It adds no placeholder/example text that could be mistaken for a
   required format or increase the resting form's noise.
5. Immediately before submission, Core says **Someone authorized to manage
   access will decide whether to keep or remove this direct access. Sending this
   request will not change your access.** The primary action is **Submit review
   request**; Cancel is ordinary secondary navigation. No red destructive
   treatment or typed confirmation is appropriate because submission changes
   no authorization.
6. The source is Phase 12 access governance. It specializes the already planned
   `permission_change_request` + decision model with
   `request_kind = holder_direct_grant_review` and
   `request_contract_version = 1`; it does not introduce a D43 table family,
   workflow DSL, tenant-authored request builder, approval engine, or task-owned
   state machine.
7. Submission re-proves the exact current membership-backed Tenant
   Authorization Context, exact Active Tenant Assignment, subject=self,
   registered `access.self_explanation` purpose, current direct source, D40
   creation mode, source head/revision, capability, scope, end condition, and
   current governance epoch. No caller supplies Tenant, subject, requester,
   actor, grant kind, purpose, status, assignee, or attribution.
8. One product transaction commits the immutable request version, attributable
   audit/receipt, and identifier-only outbox projection intent. It does not
   update the direct grant, `EffectiveAccess`, epoch, D37 execution fence,
   routing policy, task, notification, or current access explanation.
9. A partial unique invariant admits at most one `pending_review` holder-review
   request for `(tenant, exact Active Tenant Assignment, exact direct grant,
request kind)`. The immutable version separately pins the source head. Exact
   replay returns the existing receipt and current status. A changed reason,
   target, source head, Tenant, assignment, or request kind under the same
   idempotency token hard-conflicts.
10. The closed lifecycle is `pending_review`, `withdrawn`, `resolved_kept`,
    `resolved_removed`, or `no_longer_applicable`. Tasks Hub
    engagement, unread, assignee activity, claimed work, Inngest run state, and
    notifications create no request status.
11. While still `pending_review`, the holder may choose **Withdraw request**.
    Withdrawal changes no access. Withdraw versus decision uses one expected-
    head compare-and-swap; only one terminal transition commits. Submitted
    answers are never edited in place; correcting one requires withdrawing and
    submitting a successor against the still-current grant head.
12. A reviewer does not “approve the holder.” **Keep direct access** requires
    one fresh 1–500-code-point holder-safe explanation of why the direct source
    remains appropriate and appends a source-owned `resolved_kept` decision.
    **Remove direct access** asks for no duplicate prose; the reviewed
    consequence plus authoritative grant-terminal/request receipt generate the
    exact holder-safe outcome and existing audit evidence. Removal invokes the
    existing Phase 12 exact-source revocation command after fresh current-source and
    D37-consequence review. The removal effect, permission audit, decision,
    request terminal result, one epoch advance, and projection intent commit in
    the authoritative grant transaction or none do.
13. If the exact direct grant expires, is removed, is replaced by a successor,
    changes head, changes subject/scope, or the Active Tenant Assignment ends
    before decision, the old request cannot authorize action. Source
    reconciliation records `no_longer_applicable`; a reviewer must start from
    current access for any new decision. The terminal receipt preserves the
    machine-readable cause without adding another holder-visible lifecycle
    state.
14. While `pending_review`, the holder sees calm status adjacent to the current
    access explanation: **Review requested · [localized date]** and **Your
    access has not changed.** Once the direct source ends, its current-source
    row disappears—or the capability row recomputes from surviving sources—
    rather than preserving stale D43 status. Durable request/outcome history
    lives in shared Phase 12 **My access requests**, using **Direct access
    removed**, **Direct access kept**, **Request withdrawn**, or **Direct access
    ended before review**. A kept result includes the required concise holder-
    safe explanation. The shared history exposes no reviewer identity, internal
    reason, route, group, receipt, task, or protected evidence unless
    independently allowed by D42; D43 creates no standalone page or table.
15. Tasks Hub receives at most one source-backed task identity for the exact
    current request occurrence, with recipient-specific projections determined
    later by D44. List copy is code-owned and safe; request reason and D42
    history are loaded only from the Phase 12 source after current authorization.
    Generic Complete, Reassign, Delete, Dismiss, Suppress, comment, AI, import,
    and bulk-task operations reject this task.
16. Only a current Phase 12 decision command can close the review work. Tasks
    Hub projects **Completed in People & access** or **No longer required**
    after the source receipt; task status can never keep, remove, or restore
    access.
17. Inngest is optional. If used, it materializes or reconciles identifier-only
    task/attention projections after the product commit. It never carries the
    explanation, provenance, subject display, grant label, or decision; waits
    for a human; owns a timeout; selects a reviewer; or supplies durable
    idempotency. Phase 12 **Access requests** and a product reconciler remain
    usable without Inngest.
18. A current permission-filtered Phase 12 **Access requests** source lane
    contains this one-off request under kind **Review current access** and
    exists regardless of personal routing. The distinct Phase 12 **Access
    reviews** area remains reserved for periodic recertification campaigns.
    D44 decides only which eligible people, if any, receive personal Tasks Hub
    projections. The requester is never a personal-task recipient for their own
    request under any D44 option; this routing rule neither grants nor removes
    existing Phase 12 self/SoD/quorum source-action authority. D43 fixes the source
    occurrence, current authority requirements, no-guess/no-fallback rule, and
    projection boundary so D44 cannot turn assignment into authority.

The strongest alternative is **immediate self-revocation**. It removes stale
privilege faster and is appropriate in some products. SailPoint documents that
a self-service revocation can trigger removal immediately when no approval is
configured; when approval is configured it becomes a tracked reviewer request,
and inherited sources that would be re-assigned are not directly revocable.
That is strong counterevidence against universal governance. It is weaker for
this specific D40 continuity source because D38 governs Tenant-wide current-
work application, the direct source was deliberately created to survive group
loss, and final-path removal can interrupt in-flight operational work.
Microsoft self-review provides direct precedent for recording “I no longer
need access” without immediate removal. Core should not generalize this
exception to every permission: a later low-risk access design may still allow
self-removal after separate evidence and consequence analysis.

The strongest no-build alternative is **contact an administrator**. It avoids
new records but violates Core's stated preference for durable system behavior
over recurring human glue, has no reliable recipient, loses status/auditability,
and is especially poor for small or distributed ministries.

## Current, intended, and permanent state

| State                           | Verified position                                                                                                                                                                                                                                                                                                                                     | D43 consequence                                                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Current repository behavior** | Core has no shipped D38–D43 grant, My Access provenance, holder-review request, Phase 12 PDP, or source-backed access-review task. `packages/auth/permissions.ts` still grants four broad MVP capabilities to every staff subrole; the current `/tasks` prototype exposes generic mutable status, assignee, comments, reminders, and delete controls. | No current role check, task row, task status dropdown, queue, or seed-backed Teams UI can implement or authorize D43. |
| **Intended governing baseline** | Phase 12 already plans `permission_change_request` + decision, assignment-bound grants, current `EffectiveAccess`, expected-head grant mutation, audit, recertification, and source explanation. ADR-0183 already defines source-owned work projected into one Tasks Hub; D39–D42 define the exact direct source and safe holder explanation.         | D43 must be a thin Phase 12 request kind and one ADR-0183 source-work adapter, not a second domain/workflow model.    |
| **Founder-selected posture**    | The holder may flag the exact continuity direct grant for governed review/removal; access remains unchanged pending decision.                                                                                                                                                                                                                         | The request gives control and visibility without granting self-revoke or leaking governance provenance.               |
| **Best permanent path**         | One immutable source-bound request, one active semantic identity, safe holder status, current-authority review, ordinary Phase 12 revoke command, source-controlled Tasks Hub closure, and optional replaceable delivery executor.                                                                                                                    | Authorization, request truth, task presentation, notification engagement, and execution stay deliberately separate.   |

## Current Core repository evidence

| Repository evidence                                                                                                | Verified finding                                                                                                                                                                                                            | D43 requirement                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Phase 12 role and permission PRD](./phase-12-full-role-permission-configuration.md)                               | The data-model extension already names `permission_change_request` + decision. Asym Postgres owns it; `packages/api` is the write path, and grant mutations use the advisory-locked, epoch-guarded source function.         | Specialize the existing request/decision aggregate; do not add a D43 workflow engine or browser write.                                                      |
| [Phase 12 data model and build order](./phase-12-full-role-permission-configuration.md)                            | Human grants bind Active Tenant Assignment, every Tenant table uses `tenant_id NOT NULL`, composite same-Tenant relationships, RLS, current epochs, and immutable audit.                                                    | Request subject/requester/source/decision relationships carry the same Tenant and assignment invariants.                                                    |
| [Phase 12 testing decisions](./phase-12-full-role-permission-configuration.md)                                     | Current plans require cross-Tenant, names-never-authorize, egress closure, revocation, concurrency, direct/group source, and purpose-projection proof.                                                                      | D43 adds request/decision/task/worker negative paths to those gates; it cannot weaken D39–D42 proof.                                                        |
| [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)                                 | The source owns business condition, current authorization, correction, cancellation, supersession, recurrence, and history. Tasks Hub owns admitted shared-work presentation/engagement only; Inngest owns no product fact. | Phase 12 owns the request and decision. Tasks Hub and Inngest remain projections/executors.                                                                 |
| [ADR-0183 source-controlled closure](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)       | Generic task complete/reopen/dismiss/delete/reassign/bulk/API/AI mutations must reject source-backed tasks.                                                                                                                 | An access-review task ends only from the current Phase 12 request or grant receipt.                                                                         |
| [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)                                      | Direct and protected group grants share one resolver; D40 continuity is immutable creation provenance; D41/D42 distinguish current source from minimized historical explanation.                                            | A holder request references one exact direct source/head and cannot relabel, convert, or disclose its historical group basis.                               |
| [D42 adversarial review](./phase-24-d42-purpose-tiered-continuity-provenance-adversarial-review.md)                | My Access receives only a safe summary; grant governance and audit use different current-purpose projections.                                                                                                               | Request submission can use subject-safe fields; reviewer detail must reload through `access.grant_governance`, never copy D42 fields into the request/task. |
| [`CONTEXT.md`](../../../CONTEXT.md)                                                                                | Current terminology includes Active Tenant Assignment, `EffectiveAccess`, direct continuity grant, **Why you have access**, and **Added for continuity**; D43 is the safe-correction seam.                                  | UX uses those terms and does not invent “backup permission,” “ticket,” “owner,” or “approval” as authorization concepts.                                    |
| [Platform principles OpenSpec](../../../openspec/specs/platform-principles/spec.md)                                | Tenant/permission safety outranks convenience; repeated manual glue should become durable behavior; clarity/accessibility/perceived speed outrank decorative richness.                                                      | A governed one-field request is preferable to off-system contact, but it must stay quiet, safe, and fast.                                                   |
| [Platform boundaries OpenSpec](../../../openspec/specs/platform-boundaries/spec.md)                                | Permission-sensitive actions stay server-side; limited surfaces receive only role-scoped slices; UI hiding is not security; automation calls shared domain services.                                                        | My Access submits one privileged server command and receives a safe status DTO. No direct table/task/automation mutation.                                   |
| [Identity and access OpenSpec](../../../openspec/specs/identity-and-access/spec.md)                                | Server resolves identity/Tenant/role; application checks are primary with RLS defense in depth; current broad staff access is explicitly MVP behavior to narrow later.                                                      | D43 is intended Phase 12 behavior, not shipped authorization. Current `staff`/`admin`/`super_admin` labels cannot authorize it.                             |
| [`packages/auth/permissions.ts`](../../../packages/auth/permissions.ts)                                            | All staff subroles currently share `admin.dashboard.access`, `admin.crm.manage`, `admin.gifts.manage`, and `admin.reports.view`.                                                                                            | None is sufficient to submit, list, decide, export, or route a D43 request.                                                                                 |
| [Current admin task types](<../../../apps/admin/app/(app)/tasks/types.ts>)                                         | Prototype tasks expose generic `todo`/`in_progress`/`completed`/`cancelled`, assignee, reminders, comments, description, tags, and deletion-oriented UI.                                                                    | Treat this as migration input. D43 reason/status/decision must not be copied into or controlled by these fields.                                            |
| [Current contribution task service](../../../packages/api/src/admin/mission-control-tasks/service.ts)              | It inserts task, links, and event sequentially and supports actor/queue assignment.                                                                                                                                         | It is not atomic source projection and cannot be reused unchanged for D43 authority, closure, or exactly-once identity.                                     |
| [Core frontend rules](../../ai/rules/frontend.md)                                                                  | Shared Base UI via `@asym/ui`, Base Maia/Zinc semantic tokens, server-owned privileged mutations, simple native/server forms, clear loading/error/focus/responsive states.                                                  | The one-field inline form composes shared primitives and a server command; no app-local component system or complex form framework is required.             |
| [Shared UI contract](../../../packages/ui/AGENTS.md) and [`components.json`](../../../packages/ui/components.json) | Core pins `base-maia`, Base UI, Zinc semantic CSS variables, shared primitives, and deliberate keyboard/focus/reflow/long-text states.                                                                                      | D43's visual treatment stays within current product language and adds no warning-color or modal system.                                                     |

## Current official primary-source evidence

### Microsoft Entra Identity Governance

| Official source                                                                                                                             | Verified fact                                                                                                                                                                        | D43 implication                                                                                                             | Evidence limit                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [Self-review access](https://learn.microsoft.com/en-us/entra/id-governance/self-access-review)                                              | A user can decide whether they still need assigned access and submit a response.                                                                                                     | Asking the current holder whether access remains appropriate is established governance UX.                                  | Entra reviews are campaigns and do not define Core's holder-initiated request.           |
| [Self-review an access package](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-access-reviews-self-review)    | Selecting **No** does not remove access immediately; removal happens when the review ends or an administrator stops it. The user may change their response while the review is open. | “No immediate access change” is current identity-governance practice, not needless friction.                                | Core chooses immutable cancel/successor requests rather than mutable campaign responses. |
| [Request an access package](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-request-access)                    | My Access shows request history/status; pending requests can be canceled; requestors may provide business justification and a bounded period.                                        | Holder-visible durable status, concise rationale, and pending cancellation are proven interaction patterns.                 | This flow requests new access, whereas D43 questions an existing direct source.          |
| [My Access portal overview](https://learn.microsoft.com/en-us/entra/id-governance/my-access-portal-overview)                                | People request/review their own access while administrators configure governance; actions vary by audience.                                                                          | My Access and grant-governance review should remain distinct surfaces and projections.                                      | Microsoft navigation and licensing are not Core requirements.                            |
| [View/remove access-package requests](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-access-package-requests) | Authorized governance roles view request history and approval justification. Removing request data does not remove the active assignment; assignment removal is a separate action.   | Request deletion/status is not access revocation. Core must prevent task/request state from masquerading as grant mutation. | Core should not offer ordinary deletion of governance evidence.                          |
| [Request process and notifications](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-process)                   | Approval stages, request expiry, access delivery/end, and notifications are distinct lifecycle concepts.                                                                             | Request, reviewer work, authoritative access change, and attention need separate states.                                    | Core does not inherit Entra timers or mandatory email.                                   |

### Okta Identity Governance

| Official source                                                                                                                    | Verified fact                                                                                                                                                         | D43 implication                                                                                                        | Evidence limit                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [Submit requests](https://help.okta.com/en-us/Content/Topics/identity-governance/access-requests/ar-submit-request.htm)            | After submission, the requester sees a details screen, tracks status, and can cancel before a team member/approver acts. Answers cannot be modified after submission. | Immutable answers, durable status, and pending cancellation are mature patterns; correction can be cancel + successor. | Okta's 60-day inactivity expiry is not evidence for Core to expire requests.                          |
| [Request types](https://help.okta.com/en-us/content/topics/identity-governance/access-requests/ar-request-types.htm)               | Requests, steps, teams, assignees, messages, and status are separate concepts. Okta recommends groups rather than teams for approval tasks.                           | Core should separate request truth from recipient projection and avoid an all-purpose “task” record.                   | Core deliberately rejects a tenant-authored no-code request-type engine for this fixed use case.      |
| [Create a request type](https://help.okta.com/en-us/content/topics/identity-governance/access-requests/ar-create-request-type.htm) | The original requester is excluded when a task/question is assigned to a group that contains them.                                                                    | Requesting review must not make the holder a personal-task recipient for their own request.                            | Okta does not decide Core's existing Phase 12 self/SoD/quorum source-action authority.                |
| [Manage tasks](https://help.okta.com/en-us/content/topics/identity-governance/access-requests/manage-tasks.htm)                    | Approvers receive requester/context information and take an approval decision separately from action tasks; automated actions can fail or be canceled independently.  | Review decision and grant-removal effect must not collapse into generic task completion.                               | Okta can mark tasks complete without running an action; Core source-backed tasks explicitly must not. |
| [Manage requests](https://help.okta.com/en-us/content/topics/identity-governance/access-requests/manage-requests.htm)              | Request-assignee routing, task escalation, delegation, and request lifecycle are separate; missing/delegated owners can leave work unassigned.                        | Routing failure must be explicit and source-discoverable rather than guessed.                                          | D43 does not import Okta escalation/delegation complexity.                                            |
| [Request settings](https://help.okta.com/en-us/content/topics/identity-governance/access-requests/ar-config-settings.htm)          | Separation-of-duty conflicts are evaluated against the requester's existing entitlements.                                                                             | Reviewer/decision paths must inspect current complete `EffectiveAccess`, not only the requested source snapshot.       | Okta's SOD rules do not define D38 conflict pairs.                                                    |

### SailPoint Identity Security Cloud

| Official source                                                                                                           | Verified fact                                                                                                                                                                                                                                  | D43 implication                                                                                                                                                                                | Evidence limit                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Request access removal](https://documentation.sailpoint.com/saas/user-help/requests/requesting_access_removal.html)      | A person can start revocation from My Access, must enter a removal comment, and receives a reviewer path when approval is configured. Criteria/role-derived assignments cannot be individually revoked because the source would reassign them. | A required concise explanation and exact-source eligibility are current IGA practice; Core must target the independently revocable direct source rather than effective access in the abstract. | SailPoint may remove immediately when approval is not configured; Core deliberately governs this high-impact D40 source because D37 consequences and source-head review must occur. |
| [Track requests](https://documentation.sailpoint.com/saas/user-help/requests/tracking_access.html)                        | My Requests exposes pending status, details, errors, and cancellation of a pending request.                                                                                                                                                    | Durable inline status and holder withdrawal are proven self-service patterns.                                                                                                                  | Core does not import SailPoint's entire request center or notification behavior.                                                                                                    |
| [Identity Graph revocation](https://documentation.sailpoint.com/saas/help/identity_graph/identity_graph_interaction.html) | Revocation review shows impact on dependent access, requires justification, can route to a reviewer, and exposes status; some inherited sources cannot be directly revoked.                                                                    | Phase 12 must review current surviving sources and D37 consequences before exact-source removal.                                                                                               | Identity Graph is an administrator tool and does not define Core's field projection.                                                                                                |
| [Access request overview](https://documentation.sailpoint.com/saas/help/requests/index.html)                              | Request, approval decision, provisioning/deprovisioning, manual source-owner task, history, and export are distinct stages.                                                                                                                    | Review resolution, grant mutation, task projection, and audit/export must remain separate authorities.                                                                                         | Core does not import SailPoint's 90-day auto-deny or external-ticket model.                                                                                                         |

### AWS IAM Access Analyzer

| Official source                                                                                              | Verified fact                                                                                                                                                                  | D43 implication                                                                                                                          | Evidence limit                                                    |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [Review findings](https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-findings-view.html)       | A reviewer determines whether identified access is intentional or unintended; Active, Archived, and Resolved are distinct states.                                              | A concern/finding can remain open without itself changing access.                                                                        | An automated finding is not a holder-authored request.            |
| [Resolve findings](https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-findings-remediate.html) | Resolution requires modifying the granting policy; Analyzer subsequently detects that the access is removed. Partial remediation may resolve one finding and generate another. | The authoritative grant command resolves D43; changing a task/request label does not. Source-head changes can supersede the old request. | AWS eventual scans are not Core's current-head transaction model. |
| [Understand findings](https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-concepts.html)        | Findings identify current external/internal/unused access based on policies and activity; changed policy can create a distinct finding.                                        | Stable request identity must include the exact direct-source head, not only person + capability.                                         | Core does not adopt AWS's paid analyzer or activity thresholds.   |

### Least privilege, authorization, and audit

| Official source                                                                                                                                   | Verified fact                                                                                                                                          | D43 implication                                                                                                                                       | Evidence limit                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [NIST SP 800-53 Rev. 5.1](https://csrc.nist.gov/CSRC/media/Projects/risk-management/800-53%20Downloads/800-53r5/SP_800-53_v5_1-derived-OSCAL.pdf) | AC-5 separates duties; AC-6 permits only access needed for assigned functions and separately authorizes security functions/information.                | Holder, reviewer, remover, audit reader, and task recipient must not be inferred from one broad role.                                                 | NIST leaves organization-specific controls and does not choose Core's capability names. |
| [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)                                  | Use least privilege, deny by default, validate permission on every request, make object IDs untamperable, log appropriately, and test authorization.   | Submission, detail, cancellation, decision, task list/detail, deep link, export, and worker execution each reauthorize.                               | OWASP does not define the D43 domain lifecycle.                                         |
| [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)                                              | Sensitive personal data should usually be removed, masked, sanitized, hashed, or encrypted; logging failures and untrusted transport should be tested. | Request reason never enters ordinary logs, traces, task events, analytics, or workflow payloads; audit stores identifiers/classification and outcome. | Exact lawful retention is Tenant/jurisdiction specific.                                 |

### Database and privileged-path safety

| Official source                                                                         | Verified fact                                                                                                                                                                                                      | D43 implication                                                                                                                                                            | Evidence limit                                                     |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) | No policy means default deny once RLS is enabled; SELECT visibility and mutation eligibility can use separate expressions; owners and `BYPASSRLS` bypass unless deliberately constrained; policy lookups can race. | D43 needs correct read `USING` and mutation `WITH CHECK`, forced-owner posture where applicable, composite Tenant FKs, expected-head commands, and privileged-path parity. | RLS alone cannot implement Core's capability/purpose/field policy. |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)   | Secret/service credentials can use a `BYPASSRLS` role and must never be exposed to the browser.                                                                                                                    | Workers and server clients must re-prove the same Tenant/request/authority before privileged reads or writes.                                                              | Supabase service roles cannot enforce Core policy by themselves.   |
| [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)         | Grants decide object reachability, RLS decides row reachability, functions need explicit execute grants, and `SECURITY DEFINER` must be reviewed carefully.                                                        | Revoke raw request/decision/outbox table access; expose only purpose-built server DTOs/commands with pinned search path and minimal grants.                                | Exact schema implementation awaits Phase 12/OpenSpec design.       |

### Accessible and low-friction form UX

| Official source                                                                                | Verified fact                                                                                                                                                      | D43 implication                                                                                                                                | Evidence limit                                                                         |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [WAI-ARIA disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)            | A show/hide disclosure is a button operable by Enter/Space whose expanded state and controlled content are programmatically exposed.                               | **Ask for an access review** expands the one-field form inline without modal focus management or a nested surface.                             | APG defines interaction semantics, not Core's visual treatment or authorization.       |
| [WCAG status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html)       | Success/result/state updates must be programmatically determinable without unnecessary focus movement; assertive alerts are for important time-sensitive messages. | Successful submission and refreshed status use a polite status region; errors receive focus/field association rather than a toast-only result. | Exact component mechanics remain a Core implementation decision.                       |
| [GOV.UK textarea](https://design-system.service.gov.uk/components/textarea/)                   | Textareas need explicit labels, associated hints/errors, and limits only for a good reason.                                                                        | One clearly labeled multiline explanation is sufficient; do not add hidden fields or generic comment UI.                                       | GOV.UK styling is not imported into Base Maia.                                         |
| [GOV.UK character count](https://design-system.service.gov.uk/components/character-count/)     | A count helps when a real limit exists; guidance warns against overly narrow limits and describes accessible no-JavaScript behavior.                               | The 500-code-point ceiling is visible in hint/error, counts code points server-side, and does not truncate silently.                           | Ministry research must validate whether 500 is comfortably above normal need.          |
| [GOV.UK confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/) | Confirmation should state that the transaction completed, what happens next, and offer a durable reference/tracking path.                                          | After submission, show durable request status and “access has not changed,” not a transient success toast alone.                               | D43 remains within My Access rather than creating a full standalone confirmation page. |

### Privacy and retention

| Official source                                                                                                                                | Verified fact                                                                                                                               | D43 implication                                                                                                                                                         | Evidence limit                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [EU GDPR Article 5](https://eur-lex.europa.eu/legal-content/EN/TXT/?toc=OJ%3AL%3A2016%3A119%3ATOC&uri=uriserv%3AOJ.L_.2016.119.01.0001.01.ENG) | Personal data should have specified purpose, be limited to what is necessary, and not be kept identifiable longer than necessary.           | Private reason text has a registered access-governance purpose, minimized audiences, and a code-owned retention class separate from durable typed decision/audit facts. | This is evidence for the engineering principle, not a claim that every Tenant is governed by EU law. |
| [Blackbaud user details](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/education/higher-ed/content/sec-userdetails.html)          | Administrators view access-oriented action history; after user deletion, audit history remains even though operational user access is gone. | Typed attribution/history may outlive operational access, while holder-facing request/status remains permission filtered.                                               | Blackbaud does not document a holder-initiated removal request.                                      |
| [Contentful organization roles](https://www.contentful.com/help/roles/organization-roles/)                                                     | Access tools and audit logs are limited to Owner/Admin; ordinary members see only teams/spaces they belong to.                              | Holder status and grant-governance evidence require different projections; task assignment cannot reveal admin-depth detail.                                            | Contentful uses fixed roles rather than Core's capability/purpose resolver.                          |

### Optional durable execution

| Official source                                                                 | Verified fact                                                                                                  | D43 implication                                                                                                                       | Evidence limit                                                             |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Inngest idempotency](https://www.inngest.com/docs/guides/handling-idempotency) | Inngest recommends idempotent application code; event and function keys suppress duplicates for only 24 hours. | Product uniqueness/receipts own permanent D43 idempotency. Provider dedupe is only an operational assist.                             | This does not prove Inngest is needed.                                     |
| [Inngest events](https://www.inngest.com/docs/events)                           | Events trigger functions and are a transport envelope.                                                         | Events carry schema/version and opaque product identifiers only, after source commit.                                                 | Core's outbox/envelope remains governing.                                  |
| [Inngest error handling](https://www.inngest.com/docs/guides/error-handling)    | Functions retry errors and expose failed runs for diagnosis.                                                   | Projection delivery may retry/reconcile, but failure cannot lose or change the source request and cannot wait for the human decision. | Retry policy does not replace product dead-letter/reconciliation evidence. |

## Evidence synthesis

### Verified facts

- Modern IAM products provide self-service access visibility and a durable
  request/review status rather than forcing every concern into email.
- Saying “I no longer need access” need not remove access immediately.
- Request history, cancellation, reviewer work, access action, and final access
  state are distinct concepts in current identity-governance products.
- The requester should not gain reviewer responsibility merely because they
  happen to belong to the reviewer group.
- Mature access-analysis tools keep findings open until the granting policy is
  actually changed.
- Current security guidance requires least privilege, deny-by-default,
  per-request checks, sensitive-log minimization, and authorization testing.
- PostgreSQL/Supabase privileged paths can bypass RLS; an app-level policy check
  and restricted raw object grants remain necessary.
- Accessible inline disclosures/forms require explicit button state, labels,
  associated hints/errors, and programmatic success/status feedback.
- Inngest's deduplication windows are finite and cannot be a permanent business-
  effect identity.

### Requirement and product inferences

- The holder's statement is a concern, not proof that access is unused,
  unauthorized, or safe to remove.
- Targeting the exact direct source/head makes review intelligible and prevents
  an old request from mutating a successor grant.
- A required short explanation gives the reviewer actionable context; free-
  form text remains private and cannot become list/task/notification copy.
- Immutable submission plus cancel-and-successor avoids mutable audit evidence
  without trapping a holder after a typo or changed mind.
- Removing the direct source must use the ordinary Phase 12 revocation command
  so final-path, D37, group-survivor, epoch, audit, and receipt semantics remain
  single-sourced.
- Tasks Hub adds discoverability but must be rebuildable from source state; its
  current generic status/assignee/comment controls are incompatible with D43.
- Inngest can help materialize/reconcile projections but has no reason to wait
  for a human or own request state.

### Assumptions and unresolved evidence

- **Assumption:** ministry staff will understand **Ask for an access review** as a
  concern/review action rather than a guaranteed removal request.
- **Assumption:** 500 Unicode code points is enough for useful context without
  encouraging case-note behavior. Production-shaped research must validate it;
  the limit is versioned, not a database-column accident.
- **Assumption:** a safe capability label/end condition plus the user's own
  explanation gives a reviewer enough triage context before protected detail
  loading.
- **Assumption:** holders value withdrawal while a request remains pending.
- **Historical D44 unknown — resolved 2026-08-29:** D44 adopted optional one-to-
  three explicit **Access request coordinators**, complete proved-zero/
  indeterminate no-fallback behavior, requester exclusion from personal
  attention only, and independent Tasks Hub plus required Phase 17 in-product
  projections. Permission-filtered Phase 12 **Access requests** remains
  mandatory and independent of D44.
- **Unresolved unknown:** no ministry-user evidence determines the ideal status
  copy, support volume, or reviewer response-time expectation.
- **Unresolved unknown:** Phase 12's retention registry must set the exact
  post-terminal lifetime for private reason text before activation. D43 fixes
  the data class and deletion/anonymization behavior, not an unsupported global
  legal duration.

## Nomenclature finding

The holder CTA and the administrative work type should deliberately use
different, plain language:

- **Holder CTA:** **Ask for an access review** — this describes the user's goal.
- **Administrative source lane:** **Access requests** — this is one durable,
  holder-initiated request among Phase 12 permission changes.
- **Request kind:** **Review current access** — this distinguishes the action
  from a request to add access without exposing internal grant terminology.
- **Periodic campaign area:** **Access reviews** — reserved for Phase 12
  recertification campaigns with populations, due dates, and campaign results.

Okta and SailPoint consistently present user-initiated work as access requests
with request status. Microsoft uses Access reviews for scheduled/self-review
campaigns. Collapsing both into an admin **Access reviews** lane would create
ambiguous navigation, filters, metrics, lifecycle assumptions, and future data
coupling. The distinction is a repository/product judgment supported—not
mandated—by those provider vocabularies.

## Exact permanent domain contract

### Source of truth and ownership

| Fact                                     | Authority                                                                                    | Derived/projection only                       | Forbidden authority                              |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------ |
| Current direct grant and source head     | Phase 12 assignment-capability grant aggregate                                               | My Access, governance detail, cache           | Request, task, notification, Inngest             |
| Current `EffectiveAccess`                | Phase 12 resolver at current epoch                                                           | access labels, D37 fence, task eligibility    | request outcome text, task state                 |
| Holder concern and immutable explanation | Phase 12 `permission_change_request` version                                                 | safe holder status, protected reviewer detail | task description/comment, notification body      |
| Review decision                          | Phase 12 request decision receipt                                                            | holder outcome/explanation, task history      | task Complete/Dismiss, chat, workflow success    |
| Direct-source removal                    | Existing Phase 12 grant-revocation command                                                   | request outcome and task closure              | request status update alone                      |
| Shared request discovery                 | Phase 12 permission-filtered **Access requests** source lane, kind **Review current access** | safe source list                              | Tasks Hub presence or D44 policy                 |
| Personal reviewer responsibility         | D44 source-owned routing generation                                                          | Tasks Hub recipient assignment                | capability, access, decision authority           |
| Personal task engagement                 | Tasks Hub                                                                                    | unread/read/presentation                      | request or access lifecycle                      |
| Delivery/reconciliation run              | product outbox/optional Inngest execution ledger                                             | operations status                             | business idempotency, human wait, access outcome |

### Request identity and invariants

The permanent implementation should extend Phase 12's planned aggregate rather
than prescribe a parallel schema. The logical fields/invariants are:

- `tenant_id NOT NULL` on header, version, decision, source link, audit, outbox,
  and projection identity;
- immutable `request_id`, `request_kind='holder_direct_grant_review'`,
  `request_contract_version=1`, exact
  `subject_active_assignment_id`, exact `direct_grant_id`, source head/revision,
  capability identity/version, scope head/hash where applicable, created epoch,
  created time, trusted requester principal/assignment, normalized private
  explanation, private-text schema version, and retention class;
- decision version/receipt with a constrained terminal state; only
  `resolved_kept` requires a fresh normalized 1–500-code-point
  `holder_safe_explanation`, while `resolved_removed` forbids duplicate
  reviewer prose and derives safe outcome from the exact grant-terminal/request
  receipts;
- composite same-Tenant foreign keys from request to assignment and grant, plus
  a constraint proving the direct grant's subject is that exact assignment;
- server-derived requester=subject for this request kind; no on-behalf-of path;
- one `pending_review` semantic head per exact direct grant and request kind; the
  request version separately pins the source head reviewed at submission;
- append-only request versions/terminal decisions; no ordinary UPDATE of
  Tenant, requester, subject, source, reason, status, actor, routing, or audit;
- `ON DELETE RESTRICT`/retained stable references for governance objects;
  anonymization/pseudonymization follows the registered retention policy rather
  than cascading deletion through evidence;
- status is derived from the latest valid request/decision/source event, never
  copied from a task, notification, or job; and
- no request can grant, extend, shorten, revive, relabel, convert, assign,
  approve, remove, or otherwise affect any capability by existence alone.

### Lifecycle and temporal model

| Current state                               | Valid command                                            | Required current proof                                                                                                                                           | Result                                                                         |
| ------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| No request, current exact D40 direct source | Submit                                                   | subject=self; current Tenant/assignment/source/head; no pending semantic duplicate                                                                               | `pending_review` + audit/receipt/outbox intent; access unchanged               |
| `pending_review`                            | Withdraw request                                         | exact holder; current request head; not terminal                                                                                                                 | `withdrawn`; access unchanged                                                  |
| `pending_review`                            | Keep direct access                                       | current access-review decision authority; requester/self rule from D44; current source/head/consequence; fresh required 1–500-code-point holder-safe explanation | `resolved_kept`; grant unchanged                                               |
| `pending_review`                            | Remove direct access                                     | current `permissions.manage_grants` ceiling plus ordinary Phase 12 revoke proof                                                                                  | one grant transaction yields `resolved_removed` and actual source removal      |
| `pending_review`                            | Reconcile vanished/expired/changed/replaced exact source | current authoritative source/head no longer equals reviewed source/head                                                                                          | `no_longer_applicable`; no decision against successor and no new access effect |
| Any terminal state                          | Replay exact command                                     | same semantic token/input                                                                                                                                        | same receipt/outcome; no second effect                                         |
| Any terminal state                          | Changed command under same token                         | mismatch                                                                                                                                                         | hard conflict; no write                                                        |

There is deliberately no editable `in_progress` state in D43. A D44 recipient
opening or engaging with a task is not governance progress. If future research
finds a truthful source-owned **Review started** transition useful, it requires
a separate decision rather than borrowing Tasks Hub activity.

### Concurrency and idempotency

- Two submitters cannot exist because this request kind is self-only and the
  partial semantic uniqueness gate admits one `pending_review` request per
  exact grant. The request still pins the source head used at submission.
- Double-click, retry, lost response, tab duplication, mobile reconnect, and
  outbox replay return the same request/receipt.
- Cancellation and reviewer decision compare the same current request head;
  exactly one wins and the loser receives the current terminal result.
- Source expiry/revoke/replacement and reviewer decision compare the same grant
  head. A stale decision produces no grant or request mutation.
- `resolved_removed` is recorded only in the same transaction as the exact
  authoritative source removal; an ambiguous response is recovered by receipt
  lookup, never by issuing an unkeyed second revoke.
- Product DB identity and receipts are permanent. Inngest event/function
  dedupe, browser mutation IDs, and HTTP request IDs are transport aids only.

## UX/UI journey

### Holder journey

1. My Access renders the D41 current source/end condition first. The D42
   **Why you have access** disclosure contains the safe continuity summary.
2. Only while the exact D40 direct source is current and no matching request is
   `pending_review` does a quiet tertiary/secondary text action appear: **Ask
   for an access review**. It is not a badge, alert, destructive menu item, or
   primary page action.
3. Activating the disclosure expands one inline form directly beneath the
   current access explanation. Its button exposes expanded state and controlled
   content programmatically. It opens no sheet/modal and moves no focus merely
   because content appeared.
4. A visible inline heading says **Ask for an access review**. A short summary
   repeats only the safe capability label and current end condition. Historical
   group, reason, actor, receipt, and route remain absent.
5. One required textarea asks **Why should this access be reviewed?** A
   safe-data hint and example sit before the field. The visible
   count appears near the threshold and server validation uses Unicode code
   points, not bytes or UTF-16 units.
6. The exact decision/no-immediate-change copy—**Someone authorized to manage
   access will decide whether to keep or remove this direct access. Sending this
   request will not change your access.**—sits immediately above the submit
   controls and is associated with the form. Submit remains available without a
   second “Are you sure?” step.
7. While saving, the button has a progress label and duplicate activation is
   disabled locally, but no success is shown until a server receipt arrives.
   A network ambiguity rechecks the semantic receipt/status.
8. Field validation preserves the typed value in memory, moves/announces focus
   to the field error, and never writes the reason to URL, query string,
   localStorage, offline cache, service worker, analytics, or crash telemetry.
9. Success collapses/replaces the inline form with pending status, preserves a
   logical focus position, updates the My Access row, and announces **Review requested. Your access has not changed.** Pending status remains after
   refresh and on another device; pending and terminal entries also remain in
   shared Phase 12 **My access requests** history.
10. The `pending_review` state provides **Withdraw request** and no duplicate
    submit action. Withdrawal explains that it closes the review request and
    does not change access. After a terminal result, current `EffectiveAccess`
    is reloaded independently of the outcome. When the exact direct source is
    gone, its current-source row is gone; durable outcome remains in **My access
    requests** as **Direct access kept**, **Direct access removed**, or **Direct
    access ended before review**.

### Accessibility, localization, mobile, and low bandwidth

- Use shared Base Maia/Base UI disclosure/form primitives, Zinc semantic tokens,
  visible labels, semantic headings, associated hint/error/count IDs, focus-
  visible styling, predictable document-order focus, and a polite status region.
- The action, field, errors, limit, no-change warning, progress, receipt, status,
  cancel, and terminal outcomes are available without hover, color, animation,
  or icon interpretation.
- Important controls meet Core's established 44 CSS-pixel target convention.
  The journey reflows at 320 CSS pixels and 400% zoom without horizontal
  scrolling, clipped text, obscured focus, or fixed footer overlap.
- Reduced motion changes no information. Forced colors preserve focus and
  boundaries. Long CJK/RTL/bidirectional content wraps without changing
  identity, direction, or status order.
- Dates use the viewer's locale/time zone for presentation while audit stores
  exact UTC instants and deterministic ordering. Do not show ambiguous relative
  dates as the only time evidence.
- The initial My Access explanation works without D43 history/status delivery.
  On slow networks, load status in its own boundary; never block current access
  on Tasks Hub or Inngest.
- Submission failure keeps the form and explanation available, states whether
  nothing was saved or status must be checked, and offers a safe retry using
  the same semantic token.

### Reviewer journey boundary

D43 fixes only what every future review surface must preserve:

- reviewer list access is a Phase 12 governance-purpose projection, never
  possession of the holder's task or a role-name check;
- safe list facts do not include the private reason; opening detail re-proves
  current Tenant, exact scope/ceiling, registered purpose, floor, request/source
  head, and field classification before loading it;
- detail shows current access sources and D37 consequences before any decision;
- **Keep direct access** and **Remove direct access** are explicit source
  actions, not generic Approve/Deny or Complete buttons. Keep requires one fresh
  1–500-code-point holder-safe explanation that stands on its own without group,
  actor, security, location, member-care, or personnel detail. Remove asks for
  no duplicate prose; current consequence review and the authoritative source
  receipts supply its outcome/audit evidence;
- removal states whether other current sources survive and never promises that
  all effective access ends unless Phase 12 proves it;
- stale, no-longer-applicable, absent, cross-Tenant, or unauthorized requests return the
  uniform no-oracle outcome; and
- the permission-filtered **Access requests** lane exists even with no D44
  recipients; and
- D44 decides only optional personal work routing without widening these
  authority rules.

## Tasks Hub and Inngest boundary

### Source work projection

Register exactly one ADR-0183 source-work adapter identity,
`phase12.holder_direct_grant_review@1`. This adapter identifier is distinct
from the stable request kind and its request-contract version. The adapter has:

- one source occurrence identity = exact current nonterminal request;
- one action grain = review the exact request/current direct source;
- safe list title = **Review an access request**;
- safe status = waiting/no-longer-required/source-completed only;
- protected detail loader = Phase 12 grant-governance projection;
- source destination = People & access request detail;
- end predicate = current Phase 12 terminal request result;
- semantic identity = request ID + adapter version, Tenant-branded;
- recipient generation = D44 policy plus fresh current authorization;
- completion authority = source-controlled; and
- retention/history = typed source result, not copied explanation.

Tasks Hub stores no reason text, D42 provenance, capability-sensitive label,
group, actor, receipt body, decision explanation, roster, or `EffectiveAccess`.
It may store opaque source/request IDs, adapter/version, safe presentation code,
recipient projection identity, engagement, and source receipt reference.

If task materialization fails, the request remains `pending_review` and
discoverable in the Phase 12 **Access requests** source lane. Reconciliation
may create/repair the projection later. If
the request closes before projection, materialization produces no active task.
One recipient losing authority removes their protected/list projection without
closing the request or completing work for another recipient.

### Optional Inngest fit

Inngest is a reasonable optional executor only for short-lived projection
materialization, recipient fan-out after D44, reconciliation scans, retry, and
dead-letter visibility. It is not appropriate for:

- holding an Inngest function open while a person reviews;
- defining request expiry, escalation, SLA, or auto-decision;
- selecting recipients from event payloads;
- carrying the private reason or access provenance;
- deciding Keep/Remove or invoking an unscoped revocation;
- treating a 24-hour event/function key as permanent idempotency; or
- becoming the only way a pending request is found or repaired.

The product transaction writes a durable identifier-only outbox intent. A
synchronous materializer and Inngest worker call the same idempotent projection
command and produce the same source/task result. This keeps replacement and
local development straightforward and prevents vendor lock-in.

## Database, RLS, authorization, and privacy requirements

1. Raw request, version, decision, private-text, audit, outbox, and task-source
   relations are not browser-readable/writable. `anon` and `authenticated`
   grants are revoked unless a purpose-built read projection is explicitly
   admitted.
2. Holder status uses a purpose-built server DTO containing only request ID or
   safe opaque reference, current safe status code, submitted/terminal time,
   and safe outcome. It never serializes private reason or reviewer/routing
   fields back through a generic row.
3. Reviewer detail uses the D42 `access.grant_governance` projection with the
   request reason added under its own classified field ceiling. Audit reads use
   `access.security_audit`; exports require D42's separate export capability.
4. `SELECT USING` and every write `WITH CHECK`/server assertion enforce same
   Tenant, exact assignment/source relationship, and permitted operation.
   An UPDATE cannot transform an allowed row into another Tenant/subject/source
   or fabricate a terminal state.
5. Owner, service/secret, `BYPASSRLS`, `SECURITY DEFINER`, support/operator,
   repair, export, worker, Realtime, storage, and GraphQL paths enforce the same
   Phase 12 command/projection boundary. Functions pin `search_path`, schema-
   qualify objects, minimize EXECUTE grants, and derive actor/Tenant server-side.
6. Cache keys include Tenant, current viewer principal/assignment, purpose,
   subject assignment, request/source head, floor/classification version, and
   governance epoch. Lower-purpose, cross-hat, cross-viewer, cross-Tenant, or
   stale-epoch reuse is impossible.
7. Private reason text is encrypted/protected according to the Phase 12 field
   policy, excluded from full-text search and ordinary exports, never copied to
   task/notification/log/analytics/AI, and erased or irreversibly anonymized at
   the registered retention boundary while typed request/decision/audit facts
   remain as policy permits.
8. Logs/traces record safe identifiers, schema/version, actor/request IDs,
   operation/outcome/error class, and timing—never reason, group/source labels,
   D42 provenance, person names, or receipt bodies.
9. AI may help the holder understand the static form instructions only from
   public/code-owned text. It cannot read, rewrite, summarize, classify, route,
   score, decide, or transmit request text or protected access evidence without
   a future explicit governed decision.
10. Ordinary CSV, reporting, Tasks Hub export, data warehouse, notification,
    email, webhooks, Realtime, and search receive no request reason or D42
    provenance. A governed audit export is an independent snapshot with purpose,
    scope, floor, destination, field list, read audit, expiry, and receipt.

## Failure, repair, and operating model

| Failure                                                  | Safe behavior                                                                                                                           | Repair evidence                                        |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Response lost after submission commit                    | Holder/status retry returns same receipt/request                                                                                        | semantic key + immutable receipt                       |
| Audit/outbox intent cannot commit                        | Entire submission rolls back; access remains unchanged                                                                                  | no partial header; error class                         |
| Task projection fails                                    | Request remains `pending_review` in **Access requests**; no false failure/closure                                                       | durable outbox + reconciler result                     |
| Inngest unavailable                                      | Synchronous/product reconciler remains valid                                                                                            | pending dispatch/reconciliation ledger                 |
| No eligible D44 recipient                                | No guessed assignment/broadcast; **Access requests** still shows truthful work to independently authorized viewers                      | proved-zero recipient generation                       |
| Recipient loses authority                                | Their projection disappears; request remains `pending_review`                                                                           | current authorization/recipient generation             |
| Grant expires, is removed, changes, or is replaced first | Request becomes `no_longer_applicable`; holder sees **Direct access ended before review**; Tasks Hub may project **No longer required** | source receipt and machine-readable cause/current head |
| Cancel and decision race                                 | Expected-head winner commits; loser receives terminal result                                                                            | one decision receipt                                   |
| Remove transaction becomes ambiguous                     | Lookup semantic receipt before any retry                                                                                                | source command idempotency receipt                     |
| Protected detail cannot be audited/read                  | Reviewer detail fails closed; holder safe status/current access still works                                                             | denied-read audit/error class                          |
| Private-text retention expires                           | Text unavailable by policy; typed request/decision history remains                                                                      | retention/anonymization receipt                        |

No repair path uses direct SQL to invent a decision or task completion. Repair
replays the product command/outbox intent, reconciles from source truth, or
appends a separately authorized corrective successor with attribution.

## Scalability and performance posture

- The active unique key bounds duplicate pending work. Index current governance
  reads by `(tenant_id, terminal_state, created_at, id)` plus exact source and
  recipient-projection lookup keys.
- List queries use purpose-minimized set-based DTOs and cursor pagination; they
  do not call the PDP or decrypt private reason once per row.
- Reason text is loaded only on authorized detail, not list/count/badge/search.
- Task recipient fan-out is D44-bounded and asynchronous only after source
  commit; it cannot lengthen holder submission or create one copied business
  request per recipient.
- Counts count the source occurrence once, not task recipient assignments.
- Request history retention and active operational indexes are separated so
  terminal history growth does not make current queues unbounded.
- No vague “large Tenant” claim is accepted. Production proof must include at
  least 100,000 terminal requests in one Tenant, 10,000 current requests across
  many Tenants, concurrent submit/cancel/decide/source-change races, and D44's
  maximum supported recipient fan-out.

## Research assertions — D43-RA001 through D43-RA120

- **D43-RA001 — Repository fact:** Phase 12 already names
  `permission_change_request` + decision as planned Asym Postgres-owned records.
- **D43-RA002 — Repository fact:** Phase 12 assigns the write path to
  `packages/api`, not a browser-owned table mutation.
- **D43-RA003 — Repository fact:** Phase 12 human grants bind an exact Active
  Tenant Assignment rather than a bare person, email, or role label.
- **D43-RA004 — Repository fact:** Phase 12 grant mutations use current heads,
  one authoritative function, epoch advancement, audit, and receipts.
- **D43-RA005 — Repository fact:** Phase 12's `EffectiveAccess` formula unions
  current sources and subtracts the strictest field/security/purpose floor.
- **D43-RA006 — Repository fact:** D40 continuity creation uses the ordinary
  typed direct-grant relation with immutable exceptional creation basis.
- **D43-RA007 — Repository fact:** D41 keeps current direct source separate from
  historical continuity provenance.
- **D43-RA008 — Repository fact:** D42 gives the holder a safe origin/date only
  and reserves protected provenance for current governance/audit purposes.
- **D43-RA009 — Repository fact:** ADR-0183 makes the consequence-owning source
  authoritative for work existence, actions, cancellation, and completion.
- **D43-RA010 — Repository fact:** ADR-0183 makes Tasks Hub presentation and
  engagement a projection that grants no membership, capability, or action.
- **D43-RA011 — Repository fact:** ADR-0183 permits Inngest only as an optional
  identifier-only materializer/reconciler after product truth commits.
- **D43-RA012 — Repository fact:** current admin task UI offers generic mutable
  status, assignee, comments, reminders, priority, and delete-oriented controls.
- **D43-RA013 — Repository fact:** current contribution task creation inserts
  task, links, and event sequentially rather than in a source transaction.
- **D43-RA014 — Repository fact:** current runtime staff capabilities remain
  broad MVP capabilities and include no Phase 12 grant-review atom.
- **D43-RA015 — Repository fact:** platform principles rank Tenant/permission
  safety above convenience and durable system behavior above recurring glue.
- **D43-RA016 — Repository fact:** platform boundaries require permission-
  sensitive actions behind a server boundary and reject UI hiding as security.
- **D43-RA017 — Repository fact:** Core UI is pinned to shared Base Maia/Base UI
  with Zinc semantic tokens and no app-local primitive fork.
- **D43-RA018 — Repository fact:** D43 is a future intended contract; no shipped
  code currently provides this request or may be represented as doing so.
- **D43-RA019 — Verified external fact:** Microsoft My Access allows a person to
  review whether they still need assigned access.
- **D43-RA020 — Verified external fact:** Microsoft's self-review “No” response
  does not remove access until the review ends or an administrator stops it.
- **D43-RA021 — Verified external fact:** Microsoft My Access exposes request
  history and status to the requester.
- **D43-RA022 — Verified external fact:** Microsoft allows a requester to cancel
  a still-pending access-package request.
- **D43-RA023 — Verified external fact:** Microsoft distinguishes deleting
  request data from removing the active assignment itself.
- **D43-RA024 — Verified external fact:** Microsoft distinguishes request,
  approval stages, delivery, expiry, access end, and notifications.
- **D43-RA025 — Verified external fact:** Okta gives a requester durable request
  details/status and permits cancellation before a team member acts.
- **D43-RA026 — Verified external fact:** Okta prevents in-place editing of
  submitted request answers.
- **D43-RA027 — Verified external fact:** Okta separates a request record from
  approval, custom, and automated action tasks.
- **D43-RA028 — Verified external fact:** Okta excludes the original requester
  when their group is assigned a governance task on that request.
- **D43-RA029 — Verified external fact:** Okta's assigned tasks can be routed,
  delegated, escalated, or left unassigned independently of request truth.
- **D43-RA030 — Verified external fact:** AWS access findings remain active
  until reviewed/archived or the granting policy is actually changed.
- **D43-RA031 — Verified external fact:** AWS resolves an access finding after
  policy remediation rather than from an arbitrary finding-status toggle.
- **D43-RA032 — Verified external fact:** AWS can create a new finding when a
  changed access path differs from the original, supporting head-bound identity.
- **D43-RA033 — Verified external fact:** NIST AC-5 and AC-6 support separated
  duties and least privilege for security-relevant functions/information.
- **D43-RA034 — Verified external fact:** OWASP recommends deny by default and
  permission validation on every request regardless of transport.
- **D43-RA035 — Verified external fact:** OWASP advises excluding or protecting
  sensitive personal data from application logs.
- **D43-RA036 — Verified external fact:** PostgreSQL RLS can separately govern
  row visibility and mutation eligibility through `USING`/`WITH CHECK`.
- **D43-RA037 — Verified external fact:** PostgreSQL owners and `BYPASSRLS`
  roles can bypass ordinary policies and policy lookups can race.
- **D43-RA038 — Verified external fact:** Supabase secret/service credentials
  can bypass RLS and must remain server-only.
- **D43-RA039 — Verified external fact:** Supabase recommends combining object
  grants with RLS and reviewing every `SECURITY DEFINER` function.
- **D43-RA040 — Verified external fact:** WAI modal guidance requires an
  accessible name, deliberate focus, contained tab order, Escape, and return.
- **D43-RA041 — Verified external fact:** WCAG status-message guidance requires
  programmatically determinable success/state without indiscriminate alerts.
- **D43-RA042 — Verified external fact:** GOV.UK recommends an explicit textarea
  label, associated hint/error, and a real justification for length limits.
- **D43-RA043 — Verified external fact:** GOV.UK warns against overly narrow
  character limits and supports threshold-based accessible counts.
- **D43-RA044 — Verified external fact:** GOV.UK confirmation guidance requires
  telling users what completed and what happens next.
- **D43-RA045 — Verified external fact:** SailPoint lets a person ask to revoke
  their own directly revocable access, requires a comment, and routes to review
  when approval is configured.
- **D43-RA046 — Verified external fact:** SailPoint exposes pending request
  status, detail/errors, and cancellation, while inherited assignments that
  would be automatically restored are not directly revocable.
- **D43-RA047 — Verified external fact:** GDPR Article 5 articulates purpose
  limitation, data minimization, and storage limitation as privacy principles.
- **D43-RA048 — Verified external fact:** Inngest recommends application-level
  idempotency and limits event/function duplicate suppression to 24 hours.
- **D43-RA049 — Product judgment:** accept governed holder review for this exact
  high-impact D40 continuity direct source, not every Core permission.
- **D43-RA050 — Product judgment:** call the action **Ask for an access review**;
  avoid “Revoke,” “Delete permission,” “Ticket,” and “Report a problem.”
- **D43-RA051 — Product judgment:** the admin lane is **Access requests** and
  the kind is **Review current access**; **Access reviews** remains reserved for
  Phase 12 periodic recertification campaigns. The request expresses concern,
  not proof of misuse or an instruction to remove access.
- **D43-RA052 — Product judgment:** request existence changes no grant,
  `EffectiveAccess`, epoch, task completion, or D37 execution fence.
- **D43-RA053 — Requirement inference:** submission requires the exact current
  subject's membership-backed context and rejects on-behalf-of use.
- **D43-RA054 — Requirement inference:** submission targets one exact current
  D40 direct grant and immutable source head.
- **D43-RA055 — Requirement inference:** a group-derived path, role bundle,
  public access, support grant, or inferred ability is not a D43 target.
- **D43-RA056 — Requirement inference:**
  `request_kind=holder_direct_grant_review` plus
  `request_contract_version=1` extends Phase 12 `permission_change_request`;
  the distinct ADR-0183 adapter identity is
  `phase12.holder_direct_grant_review@1`, and no new workflow DSL or approval
  service exists.
- **D43-RA057 — Product judgment:** one required plain-text explanation is the
  only holder-authored field.
- **D43-RA058 — Product judgment:** handle CRLF deterministically and trim
  surrounding whitespace before requiring 1–500 Unicode code points; apply no
  compatibility normalization or silent truncation.
- **D43-RA059 — Requirement inference:** URLs, attachments, rich text, mentions,
  source anchors, and tenant-authored questions remain outside D43.
- **D43-RA060 — Requirement inference:** private reason text is evidence for
  exact review only and never current grant rationale or authorization truth.
- **D43-RA061 — Requirement inference:** Tenant, requester, subject, actor,
  source, purpose, status, and attribution derive from trusted server context.
- **D43-RA062 — Requirement inference:** composite Tenant foreign keys make a
  cross-Tenant assignment/grant/request relationship unrepresentable.
- **D43-RA063 — Requirement inference:** one partial unique semantic head
  prevents duplicate pending work for the same exact direct grant while the
  request version pins the reviewed source head.
- **D43-RA064 — Requirement inference:** request, audit/receipt, and outbox
  projection intent commit atomically or none do.
- **D43-RA065 — Requirement inference:** submission itself does not bump the
  authorization epoch because it changes no access-governing fact.
- **D43-RA066 — Product judgment:** the closed status set is `pending_review`,
  `withdrawn`, `resolved_kept`, `resolved_removed`, and
  `no_longer_applicable`.
- **D43-RA067 — Product judgment:** omit `in_progress`; task opening/claiming is
  not truthful governance progress.
- **D43-RA068 — Requirement inference:** while `pending_review`, the exact
  holder may withdraw the request without changing access.
- **D43-RA069 — Requirement inference:** submitted reason is immutable; a
  correction uses withdrawal plus a source-bound successor request.
- **D43-RA070 — Requirement inference:** withdrawal and review decision race on one
  expected request head and exactly one terminal result wins.
- **D43-RA071 — Requirement inference:** exact replay returns the durable
  receipt/status; changed input under the same semantic token hard-conflicts.
- **D43-RA072 — Requirement inference:** response loss triggers receipt lookup,
  not an unkeyed second submission or revoke.
- **D43-RA073 — Requirement inference:** a reviewer decision re-proves current
  Tenant, source head, complete sources, scope/ceiling, floor, and consequence.
- **D43-RA074 — Product judgment:** reviewer commands are **Keep direct access** and
  **Remove direct access**, not generic Approve/Deny; holder-facing outcomes use
  plain **Direct access kept/removed** rather than internal relation jargon.
- **D43-RA075 — Requirement inference:** Keep direct access requires one fresh
  1–500-code-point concise holder-safe
  explanation, appends a `resolved_kept` decision, and does not rewrite the
  direct grant or epoch.
- **D43-RA076 — Requirement inference:** Remove invokes the existing Phase 12
  exact-source revoke command rather than updating request/task status.
- **D43-RA077 — Requirement inference:** source removal, decision, terminal
  request result, audit, receipt, outbox, and one epoch advance are atomic.
- **D43-RA078 — Requirement inference:** if another source survives, the receipt
  and UX say direct source removed without claiming all access ended.
- **D43-RA079 — Requirement inference:** an expired/removed exact grant makes
  pending review `no_longer_applicable`, with no new authorization effect.
- **D43-RA080 — Requirement inference:** a replaced/changed source head also
  makes the old request `no_longer_applicable`; a machine-readable cause
  preserves audit precision while holder copy says **Direct access ended before
  review** and generic Tasks Hub copy may say **No longer required**.
- **D43-RA081 — Requirement inference:** an ended/recreated Active Tenant
  Assignment cannot inherit the old request, status, or reviewer decision.
- **D43-RA082 — Requirement inference:** request status is derived from source
  events and cannot be set by task, notification, email, AI, or worker state.
- **D43-RA083 — Product judgment:** while pending, My Access shows **Review
  requested** plus **Your access has not changed** inline; all pending/terminal
  entries also live in shared Phase 12 **My access requests** history.
- **D43-RA084 — Product judgment:** when a direct source ends, its current-
  source row disappears or recomputes from survivors; safe terminal history
  omits reviewer identity, internal reason, routing, task, group, and receipt.
- **D43-RA085 — Product judgment:** the request action remains secondary and
  quiet; it is not a warning banner, badge, destructive red action, or default.
- **D43-RA086 — Product judgment:** one compact inline disclosure/form is
  proportionate; submission needs no modal or second confirmation because it
  changes no access.
- **D43-RA087 — Requirement inference:** the form repeats only safe capability
  label/end condition and never copies D42 protected provenance.
- **D43-RA088 — Requirement inference:** errors preserve input in memory and do
  not persist private reason in URL, localStorage, offline cache, or telemetry.
- **D43-RA089 — Requirement inference:** success waits for authoritative receipt,
  updates durable status, and uses a polite accessible announcement.
- **D43-RA090 — Requirement inference:** disclosure state, document-order focus,
  labels, hints, errors, count, and status follow shared Base UI semantics.
- **D43-RA091 — Requirement inference:** 320px/400% reflow, 44px targets, forced
  colors, reduced motion, keyboard, screen reader, CJK/RTL, and localized dates
  are normative acceptance dimensions.
- **D43-RA092 — Requirement inference:** low-bandwidth/status failure never
  blocks current My Access source or current authorization.
- **D43-RA093 — Requirement inference:** Tasks Hub receives one source-backed
  occurrence identity, not one copied request/task per reviewer.
- **D43-RA094 — Requirement inference:** task list facts are code-owned and omit
  private reason, D42 history, subject/protected label, and receipt body.
- **D43-RA095 — Requirement inference:** reviewer detail reloads from Phase 12
  under current `access.grant_governance` purpose and authorization.
- **D43-RA096 — Requirement inference:** generic Complete, Reassign, Delete,
  Dismiss, Suppress, comment, bulk, API, import, and AI task mutations reject.
- **D43-RA097 — Requirement inference:** source decision, withdrawal, or
  no-longer-applicable result is the only task closure fact and projects
  truthful source history.
- **D43-RA098 — Requirement inference:** task projection failure leaves the
  request discoverable and actionable in Phase 12 **Access requests**.
- **D43-RA099 — Requirement inference:** proved-zero/indeterminate recipients
  produce no guessed person, owner, queue, broadcast, or broad-admin fallback.
- **D43-RA100 — Requirement inference:** assignment grants no reviewer read,
  decision, grant management, audit, Tenant, or source capability.
- **D43-RA101 — Product judgment:** Inngest is optional for short-lived
  projection/reconciliation only and should not wait for a human.
- **D43-RA102 — Requirement inference:** workflow events contain only schema-
  versioned opaque identifiers and safe routing metadata, never private text.
- **D43-RA103 — Requirement inference:** product uniqueness and receipts remain
  correct beyond Inngest's 24-hour dedupe window and across vendor replacement.
- **D43-RA104 — Requirement inference:** a synchronous materializer and Inngest
  worker call the same idempotent product projection command.
- **D43-RA105 — Requirement inference:** raw request/decision/private-text/outbox
  relations have no browser grants; app authorization remains primary.
- **D43-RA106 — Requirement inference:** holder, reviewer, audit, and export use
  distinct purpose-built field projections rather than one super-payload.
- **D43-RA107 — Requirement inference:** `USING` and `WITH CHECK` plus server
  assertions prevent a permitted update from changing Tenant/subject/source.
- **D43-RA108 — Requirement inference:** owner/service/BYPASSRLS/support/worker/
  export paths re-prove the same current Phase 12 boundary.
- **D43-RA109 — Requirement inference:** cache keys include exact Tenant,
  viewer/assignment, purpose, request/source head, floor version, and epoch.
- **D43-RA110 — Requirement inference:** private reason is excluded from task,
  notification, email, log, search, analytics, scoring, AI, Realtime, and
  ordinary export.
- **D43-RA111 — Requirement inference:** a registered retention class erases or
  anonymizes private reason separately from typed audit/decision facts.
- **D43-RA112 — Requirement inference:** terminal history is indexed/partitioned
  away from active work so retention growth does not degrade current queues.
- **D43-RA113 — Requirement inference:** list/count use set-based minimized
  projections; private reason decrypt/load occurs only on authorized detail.
- **D43-RA114 — Requirement inference:** production proof includes cross-Tenant,
  self/on-behalf, RLS/service, replay, response-loss, withdraw/decision,
  decision/source-change, task, worker, privacy, a11y, and migration tests.
- **D43-RA115 — Requirement inference:** migration creates no D43 requests from
  existing grants, history, tasks, roles, or D42 provenance.
- **D43-RA116 — Requirement inference:** mixed versions fail unknown request
  kind/status/schema closed while preserving current grant and audit history.
- **D43-RA117 — Product judgment:** a feature flag may suppress action/status
  UI and projection creation but cannot reinterpret or delete committed source
  requests; rollback is read-compatible and roll-forward preferred.
- **D43-RA118 — Assumption:** the one-field flow and safe copy will reduce
  off-platform access-correction contacts without creating request spam.
- **D43-RA119 — Product judgment:** every D44 option excludes the requester from
  personal task routing for their own request; that projection invariant does
  not alter Phase 12 self/SoD/quorum source-action authority. D44 chooses only
  optional recipient routing while shared **Access requests** remains fixed.
- **D43-RA120 — Product judgment:** recommend D44 Option 1—optional one to three
  explicit **Access request coordinators** receive personal projections while the
  Phase 12 **Access requests** lane exists regardless, current authorization is re-proved,
  and assignment never becomes authority.

## Falsifiable acceptance criteria

1. Only the exact current holder of an exact D40 continuity direct grant sees
   **Ask for an access review** in their authenticated My Access projection.
2. Group, role, public, donor, missionary, support/operator, ended assignment,
   another Tenant, another subject, and ordinary direct-grant cases cannot
   submit or infer a D43 request.
3. The inline disclosure/form asks **Why should this access be reviewed?** and
   shows only safe capability/end facts, one required 1–500-code-point plain-
   text reason, privacy hint/example, and **Someone authorized to manage access
   will decide whether to keep or remove this direct access. Sending this
   request will not change your access.** It opens no sheet/modal.
4. Empty/whitespace-only, over-limit, malformed Unicode, mismatched source,
   client-supplied actor/Tenant/status, or stale-head submission writes nothing.
5. Submission commits exactly one source request, audit/receipt, and outbox
   intent while leaving grant, `EffectiveAccess`, epoch, D37 fence, and task
   state unchanged.
6. Double-click, tab duplication, reconnect, timeout, and exact retry return one
   request/receipt; changed semantic input hard-conflicts.
7. While pending, My Access persists **Review requested** and **Your access has
   not changed** after refresh/device change; shared Phase 12 **My access
   requests** retains pending/terminal history without protected fields.
8. Holder withdrawal while `pending_review` commits one terminal result and
   changes no access; a post-decision withdrawal returns the terminal outcome.
9. Withdraw versus Keep/Remove and Remove versus expiry/replacement races yield
   exactly one truthful terminal request/source result.
10. Keep direct access requires current review-decision authority plus a fresh
    1–500-code-point holder-safe explanation and creates no grant mutation or
    epoch advance.
11. Remove direct access requires current `permissions.manage_grants` scope/
    ceiling and the ordinary Phase 12 expected-head consequence review, asks
    for no duplicate prose, and uses authoritative receipts as outcome/audit
    evidence.
12. `resolved_removed` cannot exist unless the exact direct-source removal and its
    epoch/audit/receipt committed in the same authoritative transaction.
13. A surviving group/direct source is shown truthfully; no outcome claims all
    effective access ended unless Phase 12 proves final loss.
14. Source expiry/removal/change/replacement removes the stale current-source
    row (or recomputes the capability from surviving sources), yields
    `no_longer_applicable`, and
    holder copy **Direct access ended before review**; generic Tasks Hub copy
    may say **No longer required** and the request cannot mutate a successor.
15. Tasks Hub materializes at most one source-backed task identity per current
    request occurrence with recipient-specific projections and no copied reason.
16. Every generic task completion/status/reassign/delete/comment/bulk/API/AI
    mutation is denied server-side for a D43 source-backed task.
17. Task projection failure or Inngest outage leaves the request discoverable
    and actionable at the Phase 12 source; reconciliation is idempotent.
18. Proved-zero or indeterminate recipients creates no guessed/broadcast task,
    reviewer, queue, or authority.
19. Raw relations are unreachable from browser roles; `USING`/`WITH CHECK`,
    composite Tenant keys, privileged-path parity, and current-purpose DTOs
    prevent cross-Tenant or cross-purpose access.
20. Request reason never appears in task/notification/email/log/trace/search/
    analytics/AI/Realtime/ordinary export schemas or payloads.
21. Holder, grant reviewer, security auditor, and export receive exactly their
    registered D42/D43 field projections with no client-side rich-payload hiding.
22. Private reason retention/anonymization executes from a registered policy
    and leaves only permitted typed request/decision/audit facts.
23. Network ambiguity never tells the holder both “failed” and “submitted”; it
    resolves by semantic receipt/status lookup.
24. The form/status works by keyboard and screen reader, has visible focus and
    associated errors/count, announces status politely, and returns focus.
25. The journey reflows at 320 CSS pixels/400% zoom, supports forced colors/
    reduced motion/44px targets, and safely wraps CJK/RTL/bidirectional text.
26. Current access explanation stays available when request status, Tasks Hub,
    audit detail, or Inngest is unavailable.
27. Set-based list/count remains bounded with 100,000 terminal requests in one
    Tenant and does not decrypt private text per row.
28. Migration infers no request from existing grants/history/tasks; unknown
    mixed-version kinds/statuses fail closed without changing access.
29. Every artifact traces D43 request ownership, lifecycle, command authority,
    privacy, task/Inngest boundary, and D44 seam without contradictory terms.
30. The Phase 12 **Access requests** lane exists without D44; D44 can change personal
    recipient routing only and cannot change who may submit, what the request
    means, who may decide, or how access is removed.

## Initial monitors and response contract

| Signal                                             | Threshold                                                                                           | Owner                                      | Required response                                                                                                                            |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `access_d43_request_changed_access_total`          | Any                                                                                                 | Security + Phase 12                        | Disable submission, contain unauthorized change, restore from source receipt, assess exposure/interruption, and repair transaction boundary. |
| `access_d43_cross_tenant_or_subject_total`         | Any                                                                                                 | Security + Data Platform                   | Treat as P0, stop affected paths, purge caches/projections, assess all copies, and re-prove composite keys/RLS/service parity.               |
| `access_d43_duplicate_pending_request_total`       | Any exact grant with >1 `pending_review` request                                                    | Phase 12 + Database                        | Fence creation, reconcile to one source head, repair uniqueness/idempotency, and add race fixture.                                           |
| `access_d43_terminal_without_source_receipt_total` | Any `resolved_removed` without exact revoke receipt or any terminal conflict                        | Security + Phase 12                        | Disable decision path, reconcile from grant truth, correct status with attributable successor, and prove atomicity.                          |
| `access_d43_private_text_egress_total`             | Any reason in task/notification/log/search/analytics/AI/workflow/ordinary export                    | Privacy + Security                         | Stop consumer, contain/delete lawful copies, assess incident, repair schema/allowlist, and re-prove negative egress.                         |
| `access_d43_unauthorized_decision_total`           | Any                                                                                                 | Security + Phase 12                        | Stop reviewer action, inspect grant effects, restore only through governed source command, and repair capability/purpose check.              |
| `access_d43_task_mutation_accepted_total`          | Any generic task mutation succeeds                                                                  | Tasks Hub + Phase 12                       | Disable generic path for adapter, reconcile source/task, repair server contract, and add every-channel regression.                           |
| `access_d43_projection_lag_age_seconds`            | p95 >300 seconds for 15 minutes with at least 50 pending requests                                   | Tasks Hub + Platform Operations            | Keep **Access requests** active, inspect outbox/worker, run idempotent reconciler, and avoid broadening recipients.                          |
| `access_d43_ownerless_pending_age`                 | Any pending request has proved-zero personal recipient for >24 hours                                | Phase 12 product owner + Tenant governance | Keep **Access requests** visible, investigate D44 configuration/eligibility, and never guess a fallback.                                     |
| `access_d43_submit_error_ratio`                    | >2% for 15 minutes with at least 50 attempts, excluding validation                                  | Phase 12 + Platform Operations             | Preserve form/status, inspect command/audit/outbox dependency, roll back action surface if ambiguity exists, and reconcile receipts.         |
| `access_d43_reason_retention_overdue_total`        | Any private reason past registered erase/anonymize deadline                                         | Privacy + Data Platform                    | Quarantine access, execute lawful purge/anonymization, repair scheduler/reconciler, and verify backups/export copies per policy.             |
| `access_d43_holder_miscomprehension_rate`          | >10% of at least 20 production-shaped studies think submission removed access or guarantees removal | Product + UX Research                      | Revise/test copy/hierarchy; do not add immediate revoke or protected provenance as an unreviewed fix.                                        |

No monitor automatically grants, removes, restores, keeps, reassigns, escalates,
or discloses access. Automated responses may fence a defective surface or run
identifier-only reconciliation, never make a human governance decision.

## Historical D44 recommendation — resolved 2026-08-29

### Question

Which current eligible people other than the requester, if any, should receive
personal Tasks Hub responsibility for a `pending_review` holder access-review
request? The
permission-filtered Phase 12 **Access requests** source lane exists regardless;
Phase 12 **Access reviews** remains the periodic recertification-campaign area.

### Option 1 — optional 1–3 Access request coordinators — recommended

The already-required Phase 12 **Access requests** lane remains available to
every current authorized viewer. A Tenant may optionally name one to three
explicit **Access request coordinators** who receive personal Tasks Hub
projections only while independently eligible for the exact request and not
the requester. Missing
coordinators leave the **Access requests** lane intact; proved-zero or
indeterminate coordinator resolution creates no personal task and no guessed
fallback. Coordinator assignment grants no request detail, review decision, or
grant authority.

**Why recommended:** it combines modern group/resource-owner routing with a
durable shared recovery surface. Small Tenants configure nothing; larger
Tenants can create personal accountability without notifying every grant
manager or depending on the original grantor.

### Option 2 — assign every currently qualified grant manager

Fan the request into personal Tasks Hub assignments for every current eligible
grant manager except the requester.

**Benefit:** no coordinator configuration and high visibility.  
**Cost:** notification/task multiplication, diffusion of responsibility,
membership-churn fan-out, noisy counts, and avoidable privacy exposure.

### Option 3 — shared Access requests lane only; no personal task

Keep every request discoverable only in the permission-filtered Phase 12
**Access requests** lane and create no personal Tasks Hub responsibility.

**Benefit:** no coordinator policy, recipient fan-out, or personal-task
projection; this is the strongest no-build routing alternative.  
**Cost:** no person receives explicit responsibility, so requests can age in a
shared lane and small/distributed teams must remember to check it.

Routing to the original grantor, letting the requester select a reviewer, or
falling back to “an administrator” are rejected footguns rather than options.
They confuse historical authorship or caller choice with current exact
eligibility, leak D42-protected actor context, and create brittle hidden
fallback authority.

### Recommended exact D44 answer

**Choose Option 1 — optional one to three explicit Access request coordinators
for personal Tasks Hub routing.** The shared Phase 12 **Access requests** lane is not an
option and remains available regardless. Requester exclusion is common to all
options; D44 must define coordinator eligibility, current-source resolution, proved-zero personal
routing, and Tasks Hub recipient projection while preserving D43's
no-assignment-as-authority rule.

**Recorded outcome:** Option 1, amended. The selected assignments must already
be current exact-scope eligible; configuration grants nothing; current policy
applies to open and future pending requests after a fresh aggregate consequence
review; unchanged effective sets create no churn. Tasks Hub is not the only
attention surface: a new request uses
`holder_access_review_requested_v1`, while backlog admission uses individual
tasks plus one `access_request_responsibility_updated_v1` item per newly
admitted recipient and route revision. D45 decides external email only.

## Evidence limits

- Microsoft, Okta, and SailPoint prove self-service review/request tracking and
  pending-cancellation patterns, but none proves Core's exact D40-specific
  request or 500-code-point explanation.
- Microsoft self-review supports delayed removal; it does not prove every Core
  access type should prohibit immediate self-revoke.
- Okta supports requester exclusion from personal governance-task assignment.
  Core keeps the shared **Access requests** lane available for one-person
  ministries and leaves existing Phase 12 self/SoD/quorum source-action
  authority unchanged rather than inventing a personal-task fallback.
- AWS findings support source-based resolution but are automated analyses, not
  holder-authored concerns.
- Blackbaud and Contentful support separated admin/audit visibility but provide
  no public official evidence of this exact holder correction flow.
- GDPR is used as purpose/minimization/retention evidence, not as a universal
  legal conclusion for every Tenant or jurisdiction.
- No primary evidence establishes an optimal response SLA, reminder cadence,
  escalation path, notification channel, coordinator count, or retention
  duration. D43 deliberately adds none.
- No production evidence yet proves comprehension, request volume, abuse/spam
  rate, reviewer burden, private-text safety, RLS parity, cache invalidation,
  accessibility, mobile/low-bandwidth recovery, or performance thresholds.

## Final research disposition

**Accept with required amendments.** Record Option 1 only as a Phase 12-owned,
exact-source, no-immediate-effect holder concern with immutable bounded private
text, one semantic pending identity, safe status/withdrawal, current-head review,
ordinary source revocation, source-controlled Tasks Hub projection, optional
replaceable Inngest delivery, strict Tenant/purpose/privacy boundaries, and a
separate D44 responsibility decision.

This is the least-brittle permanent path because it reuses—not duplicates—the
authorization, request, grant mutation, audit, and shared-work abstractions the
repository already governs. It adds exactly one request kind and one source
adapter, while leaving future low-risk self-removal, generic recertification,
notification policy, and reviewer routing to their correct decision levels.
