# Phase 24 D45 — Optional Initial Access-Request Email Primary Research

**Research date:** 2026-08-29  
**Decision under review:** supplement D44's required in-product coordinator
attention with one optional immediate email step whose Tenant Delivery Plan is
off by default and that sends only when the contract, Tenant, recipient, source,
destination, and delivery system all independently permit it.  
**Scope:** necessity, preference layering, safe email content and deep links,
Phase 6/17 ownership, delivery readiness, suppression, provider ambiguity,
privacy, accessibility, future-channel seams, multi-Tenant safety, optional
Inngest execution, notification fatigue, migration, rollout, and the separate
reminder/escalation decision.  
**Verification note:** broad formatting, local-link, skill-parity, strict
OpenSpec, lint, typecheck, unit, build, and diff checks remain deferred until
the end of the Grill session by founder direction.

## Research question

Is an optional, immediate, Tenant-default-off email a modern and proportionate
supplement for D44 Access request coordinators who may not be signed into Mission
Control? If so, which independent controls must all allow the send, what may the
email reveal or do, how must provider failure behave, and how can Core preserve
future channel expansion without building a brittle channel array or generic
notification workflow?

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

**Accept Option 1 with required amendments.** Optional immediate email is a
modern complement to durable in-product work, especially for distributed staff
who do not remain in Mission Control. It is safe only when it remains one
contract-bounded delivery step—not a second notification system, a role-based
broadcast, a hidden mandatory message, or an action-by-email workflow.

The permanent effective-send formula is conjunctive:

```text
EligibleInitialEmail =
  Live exact message contract/version
  AND optional email step enabled in the Tenant's published Delivery Plan
  AND exact recipient preference is inherit/absent, not disabled
  AND exact D44 recipient generation still current
  AND exact D43 source still pending/actionable
  AND current recipient authorization still valid
  AND current verified destination is contactable
  AND no recipient/provider suppression applies
  AND compatible locale publication exists
  AND tenant Resend connection, sender, reply posture, domain and provider proof are Ready
  AND source occurrence/member semantic identity is unspent
```

Any required input that is false, absent, unknown, stale, partial, timed-out, or
indeterminate means **no new email submission**, except the one explicitly
versioned preference rule that a genuinely absent row means `inherit`. Required
in-product attention, Tasks Hub, and the **Access requests** lane remain
unaffected.

Current products support the separation:

- Microsoft Entra lets administrators enable/disable reviewer email while the
  same work remains directly available in My Access; Microsoft warns that email
  may be delayed.
- Okta separately models request/task audiences, delivery channels, and user
  notification settings across email, Slack, and Teams.
- SailPoint and Salesforce pair durable in-product approval work with email
  notification rather than making email the approval record.
- GitHub separates web inbox, email/mobile delivery, and delivery frequency.
- Contentful pairs pending tasks with assignment email, demonstrating the reach
  benefit for people who do not live in the product.
- Android and Apple guidance emphasize channel/user control, proportional
  interruption, concise copy, sensitive-data minimization, and avoiding
  duplicates.

Those sources do not prove Core's default. Default-off at the Tenant Delivery
Plan is a Core product judgment grounded in D43's sensitive access context,
volunteer/distributed staff, Tenant-owned email readiness, and the fact that D44
already guarantees in-product attention plus two durable work surfaces. Once an
authorized Tenant deliberately enables the step, a recipient inherits that
choice unless they personally disable email. This avoids confusing double opt-
in while preserving a self-owned narrowing control.

## Exact corrected D45 decision

1. D45 adds exactly one optional immediate `staff_email` step to each of D44's two
   stable Phase 17 contracts:
   `holder_access_review_requested_v1` for one newly admitted coordinator on a
   new request, and `access_request_responsibility_updated_v1` for one newly
   admitted coordinator across a deliberate current-responsibility recompute.
2. Both contracts keep their required in-product step. Email is supplementary,
   disabled in the code-owned default Delivery Plan, and cannot replace, hide,
   complete, mark read, or suppress the in-product item, Tasks Hub assignment,
   or Phase 12 **Access requests** lane.
3. Tenant enablement is controlled only through the exact Phase 17 System
   Messages Delivery Plan publisher and its immutable publication/review/audit
   boundary. A D44 route manager, coordinator, task administrator, email address,
   role, worker, or provider setting cannot enable the step. One
   `profile.access_governance_attention@1` family-plan selection governs both
   exact D44 `staff_email` slots atomically: mixed per-contract On/Off is invalid,
   and On can publish only when both contracts' exact publication and delivery-
   readiness dependencies are compatible. Each contract still owns its separate
   occurrence/member identity, source fence, safe facts, rendering, and evidence.
4. The exact recipient also has one
   `preference.access_request_responsibility_email@1` under the canonical Phase
   17 tuple of Tenant, Active Tenant Assignment, Party, registered role/surface,
   contract family, and email channel, with the
   closed values `inherit` and `disabled`. Absence means `inherit`: follow the
   deliberate current Tenant Delivery Plan. `disabled` narrows a Tenant-enabled
   step for that recipient. The Tenant cannot override `disabled`; `inherit`
   cannot enable a Tenant-disabled or contract-forbidden step. Tenant
   administrators, route managers, support, operators, and other staff cannot
   edit this personal preference on the recipient's behalf.
5. Widening—Tenant On, `disabled`→`inherit`, or contact/readiness repair—is
   eligible only for D44 source occurrences committed after the new effective
   head. It never adds an omitted member to an earlier/released occurrence,
   backfills an existing request, resends an item, or converts a task into
   email. Narrowing—Tenant Off, `inherit`→`disabled`, or current source/auth/
   contact/suppression/readiness loss—suppresses any not-yet-provider-submitted
   optional email at fire-time reproof, including prepared work without
   rerendering it. Provider-accepted mail is non-retractable.
6. The per-request email uses one recipient-specific semantic member derived
   from the D44 source responsibility generation. The aggregate email uses one
   member per exact recipient/current-application generation and sends one safe
   summary, never one email per existing child request.
7. Provider batching is a transport-only optimization. It cannot mix Tenants,
   scope owners, incompatible contract/publication/locale/sender profiles, or
   recipients into shared visible addressing. Each recipient retains an
   independent prepared identity, suppression decision, provider-message
   identity, outcome, and repair path.
8. Safe per-request email uses an empty render-fact set: generic subject,
   preheader, and body copy stating only that a current access review needs
   attention, that email grants no authority and proves no access change, plus
   one descriptive authenticated **Review access request** link. Tenant branding
   appears only through the governed From identity and immutable layout, never a
   dynamic subject/preheader/body fact.
9. Safe aggregate email uses a generic subject/preheader and exactly one render
   fact: the immutable safe initial assigned count. The count appears only in
   the body, with a statement that access-review responsibility changed and one
   authenticated **View access requests** link. It never appears in subject or
   preheader and the email contains no child list or per-request data.
10. Neither email contains the D43 request/decision explanation, requester name,
    capability, grant source/provenance, group, grantor, other coordinator,
    reviewer identity, source consequence, protected scope, internal route,
    hidden count, task state, or Keep/Remove recommendation.
11. Email has no inline **Keep**, **Remove**, **Approve**, **Reject**, reply-
    command, one-click decision, attachment, calendar invitation, remote form,
    or secret-bearing action URL. GET/HEAD, preview scanners, link expansion,
    forwarded mail, and an authenticated page open are inert.
12. The link is an opaque, non-authorizing route to Core. It requires ordinary
    authentication, current exact Active Tenant Assignment selection, Tenant,
    purpose, D44 recipient/source visibility, and Phase 12 authorization. It
    fails uniformly when wrong-account, wrong-Tenant, stale, ended, or no longer
    authorized; the real decision requires the ordinary deliberate source POST.
13. HTML and complete plain text are deterministic Phase 17 compiled artifacts.
    The email remains understandable with images blocked, at zoom, in dark/high-
    contrast modes, and in common assistive technologies. The link text describes
    its purpose; layout does not rely on image, color, icon, or hover.
14. This sensitive operational family requires provider open and click tracking
    disabled. Resend documents both as optional/default-off and warns tracking
    can harm sensitive transactional-email deliverability. Core never treats
    provider open/click evidence as human reading, task engagement, or source
    action.
15. Core owns the recipient preference and suppression decision. Resend Topics,
    Audiences, Broadcasts, Automations, marketing unsubscribe state, dashboard
    contacts, or arbitrary headers do not become D45 preference authority. The
    email includes an authenticated **Manage notification preferences** link;
    v1 does not use an unauthenticated one-click unsubscribe as an access-
    governance mutation.
16. The verified destination is current source-owned staff contact data under
    exact Tenant/purpose authorization. No caller, route manager, coordinator
    roster, task, import, email template, provider event, or worker supplies or
    changes the destination.
17. Tenant email transport uses the existing Phase 17 Resend-only Tenant branch:
    exact tenant-owned sending-scoped connection, verified SPF/DKIM domain,
    compatible sender/reply posture, publication, locale, provider contract, and
    signed-webhook correlation. There is no Asym shared fallback and no direct
    sender bypass.
18. Resend request idempotency is only a 24-hour secondary aid. Core's permanent
    product intent, prepared identity, sealed provider envelope, internal
    provider-message identity, and communication history own durable semantic
    uniqueness. An ambiguous provider call reconciles; it does not blindly send
    a new email.
19. Resend webhook delivery is at-least-once and may be out of order. Core
    verifies signatures/connection scope, deduplicates provider event identity,
    applies a monotonic reducer, preserves contradictory/unknown evidence, and
    never changes source/task/notification truth from delivery telemetry.
20. `sent`, `delivered`, `delayed`, `bounced`, `complained`, `suppressed`,
    `failed`, and indeterminate provider outcomes remain delivery evidence only.
    “Delivered” means recipient mail server acceptance, not inbox placement or
    human reading.
21. A bounce/complaint/suppression blocks this optional email and follows the
    existing Phase 6/17 repair/communication-history posture. It never reroutes
    responsibility, creates a fallback recipient/channel, disables required in-
    product attention, or marks the request handled.
22. D45 creates no reminder, deadline, digest, escalation, alternate recipient,
    manager fallback, repeat-send, task snooze, or automatic decision. D46 decides
    whether any one source-owned reminder is justified; subsequent escalation
    would require another explicit decision.
23. Future push, Slack, Teams, Google Chat, SMS, or another channel normally
    extends the same stable D44 message meaning through a reviewed contract
    generation plus one named channel step/profile/adapter and channel-specific
    authentication/recipient mapping, consent/preference/suppression/readiness,
    safe rendering, outcome reduction, proof pack, and founder decision. It does
    not mint a new source occurrence or stable message key unless the business
    meaning changes. D45 creates no `channels[]`, provider map, generic webhook,
    free-form destination, or channel DSL.
24. Inngest may execute identifier-only post-commit preparation/dispatch/
    reconciliation through Core's product dispatch ledger and work claims. It
    owns no source, route, recipient, preference, plan, prepared message,
    provider identity, idempotency, reminder, or human wait.

## Strongest alternatives

### Mandatory email to every admitted coordinator

This maximizes off-platform visibility. It is weaker for Core because email is
external, delay-prone, suppressible, provider-dependent, and potentially visible
on shared/lock screens. It removes recipient control, increases complaints and
fatigue, and provides no compensating safety because D44 already guarantees the
source lane, task, and required in-product attention.

### No email at all

This is the strongest no-build/privacy alternative. It avoids all provider,
preference, contact, locale, deliverability, and support burden. It is weaker as
the permanent policy for distributed ministries because an infrequent Mission
Control user may not discover responsibility promptly. An explicitly Tenant-
enabled, recipient-not-disabled email offers reach without making it a universal
default.

### One generic multi-channel notification preference and `channels[]`

Reject. Email, in-product, push, chat, and SMS have different identity,
authentication, consent, suppression, readiness, privacy, provider evidence,
failure, and action semantics. A generic array hides those differences and lets
an unproved provider/channel appear enabled merely by adding a string. Core's
existing bounded Delivery Plan and stable catalog are the stronger permanent
abstraction.

### Direct send from D43/D44 or an Inngest function

Reject. It duplicates Phase 6 communication history, bypasses immutable
publication and current recipient/suppression fences, weakens idempotency, and
makes provider execution an authorization/business-state owner.

## Current, intended, and permanent state

| State                           | Verified position                                                                                                                                                                                                                                                                                        | D45 consequence                                                                                                    |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Current repository behavior** | Core has no shipped D43–D45 route/request/email. Current contribution approval code plans in-product/email directly with finance-specific profile/role/SLA tables; current generic email/template/sender pieces do not prove the future Phase 6/17 catalog.                                              | Do not reuse direct planner or role/profile preference rows as D45 authority.                                      |
| **Governing intended baseline** | Phase 17 defines stable contracts, bounded Delivery Plans, immutable publications, recipient-specific Phase 6 intents, tenant-owned Resend, independent consent/preference/suppression/readiness, protected inert actions, and body-free history. ADR-0027 separates notification engagement from email. | D45 is one small catalog/Delivery Plan extension, not infrastructure invention.                                    |
| **D44 baseline**                | Exact eligible coordinators already receive required in-product attention, Tasks Hub responsibility, and access to the complete source lane.                                                                                                                                                             | The Tenant email step can remain optional/default-off without risking request truth or making work undiscoverable. |
| **Best permanent path**         | Contract-approved email + deliberate Tenant enable + recipient inherit/not-disabled + current source/recipient + verified contact + no suppression + complete Phase 17 readiness.                                                                                                                        | The Tenant makes the affirmative activation; the person may narrow it; every safety layer can still say no.        |

## Current Core repository evidence

| Repository evidence                                                                                                            | Verified finding                                                                                                                                                                                                               | D45 requirement                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| [D44 primary research](./phase-24-d44-access-request-coordinator-routing-primary-research.md)                                  | D44 fixes exact recipients, required in-product keys, safe previews/deep links, one-per-request versus aggregate anti-storm semantics, and separates external email as D45.                                                    | D45 changes channels only; it cannot revisit recipient generation, Tasks Hub, or source behavior.                  |
| [Phase 12 role and permission configuration](./phase-12-full-role-permission-configuration.md)                                 | D43/D44 source request, current grant-decision authority, source lane, coordinator route, requester exclusion, and responsibility generations are Phase 12 facts.                                                              | External preparation/dispatch re-proves exact current request/recipient/source heads; email never authorizes.      |
| [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)                                               | Notification item, grouping/engagement, source state, task state, and external communication delivery are separate. One channel's failure or engagement does not complete another.                                             | Keep required in-product and optional email as independent recipient/channel children under one source occurrence. |
| [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)                                             | Tasks Hub is presentation/engagement only; source-controlled closure and current authorization remain at Phase 12.                                                                                                             | Email outcome cannot create/complete/reassign a task or request.                                                   |
| [ADR-0026](../../adr/0026-contract-bounded-delivery-plans.md)                                                                  | Contracts expose only fixed named required/optional steps; its D45 clarification fixes `staff_in_product` plus optional `staff_email`. Phase 6 atomically derives complete recipient-step children.                            | Reuse that vocabulary; no D45 alias, channel array, arbitrary audience, loop, timer, or provider call.             |
| [ADR-0025](../../adr/0025-producer-owned-protected-actions.md)                                                                 | Protected email actions use inert scanner-resistant handoffs; GET/HEAD never completes a consequential action, and same-origin deliberate POST reauthorizes.                                                                   | Email deep links navigate only; Keep/Remove remains an authenticated Phase 12 POST.                                |
| [ADR-0032](../../adr/0032-immutable-prepared-message-and-whole-message-recovery.md)                                            | Prepared messages and provider envelopes are immutable, semantically idempotent, and recovered without blind rerender/resend after provider ambiguity.                                                                         | Pin exact D45 publication/recipient/facts/destination; reconcile ambiguous provider outcomes.                      |
| [ADR-0029](../../adr/0029-tenant-owned-resend-and-composed-delivery-identities.md)                                             | Tenant-scoped system email uses the Tenant's own Resend connection/domain/sender identities with no shared fallback.                                                                                                           | D45 cannot send until exact Tenant transport and composed identity are Ready.                                      |
| [Phase 17 system-message PRD](./phase-17-system-messages-template-management.md)                                               | Catalog keys declare owner/audience/channels/policy; required/optional plan steps, recipient preference, suppression/contactability, immutable compilation, plain text, provider evidence, and retention are already governed. | Extend both D44 keys through the existing compiler/manifest/proof pack only.                                       |
| [Phase 17 target catalog](./phase-17-system-messages-template-management.md)                                                   | `holder_access_review_requested_v1` and `access_request_responsibility_updated_v1` are Target Live only after D44 proof, currently required in-product with external email separately governed.                                | D45 adds optional email without changing key meaning or prematurely claiming Live.                                 |
| [Phase 17 executable manifest](./phase-17-system-message-executable-manifest.md)                                               | Both D44 keys bind `profile.access_governance_attention@1` and `plan.required_in_product_optional_email@1`, with fixed `staff_in_product` and `staff_email` slots plus key-specific source/facts/actions.                      | D45 uses this one generated step vocabulary and preserves each stable key's semantic identity.                     |
| [Outbound communications OpenSpec delta](../../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md)   | Recipient/channel intent, plan binding, source fence, preparation, provider evidence, history, RLS, and portability are separately specified.                                                                                  | D45 acceptance proof must trace through the complete existing communication spine.                                 |
| [Workflow orchestration OpenSpec](../../../openspec/specs/workflow-orchestration/spec.md)                                      | Product dispatch ledger/work claims own durable handoff; events are identifier-only; provider webhooks terminate at product boundaries.                                                                                        | Optional Inngest execution never carries email body/address or owns idempotency/outcome.                           |
| [Current contribution approval planner](../../../packages/api/src/admin/contribution-operations/approval-notifications.ts)     | Current finance-specific defaults in-product on/email off and intersects Tenant plus recipient preferences, but uses profile/role recipient data and owns reminders/SLA.                                                       | Preserve the useful layered-default idea, not the schema, role routing, direct task coupling, or reminder engine.  |
| [Current approval email sender](../../../packages/api/src/admin/contribution-operations/approval-notification-email.ts)        | Current code sends directly through the Tenant Resend integration after local planning and does not implement the complete future Phase 17 catalog/prepared-message spine.                                                     | Treat as migration input; D45 must not create another direct sender.                                               |
| [Current contribution approval migration](../../../supabase/migrations/20260611150000_contribution_approval_notifications.sql) | Current preference rows are profile-oriented and finance-specific; service role owns writes.                                                                                                                                   | D45 preference binds exact Tenant/Active Tenant Assignment/message family and preserves privileged-path parity.    |
| [Core frontend rules](../../../docs/ai/rules/frontend.md)                                                                      | Shared `@asym/ui`, Base UI, exact Base Maia/Zinc tokens, semantic forms/status, accessibility, and server-owned privileged writes are mandatory.                                                                               | Tenant plan and recipient preference UX use existing design language and server commands.                          |
| [Shared UI configuration](../../../packages/ui/components.json)                                                                | The repository is pinned to `base-maia`, Base UI, Lucide, Zinc tokens, and shared components.                                                                                                                                  | Do not add a notification-settings kit, provider widget, or app-local component fork.                              |

## Current official primary-source evidence

### Access governance and durable work versus delivery

| Official source                                                                                                                                                                 | Verified fact                                                                                                                                                    | D45 implication                                                                                                       | Evidence limit                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [Microsoft Entra — create an access review](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)                                                         | Email notification and reminders are separately configurable. Reviewers/current series are distinct, and contacted-reviewer timestamps remain delivery evidence. | Email is a named policy choice, not request/reviewer truth; reminders remain separate.                                | Entra defaults email on for campaigns; that does not prove Core's default for D43. |
| [Microsoft Entra — perform an access review](https://learn.microsoft.com/en-us/entra/id-governance/perform-access-review)                                                       | Email links reviewers to My Access; reviewers can navigate directly; email may be delayed up to 24 hours.                                                        | Email must be supplementary and link to authenticated current source state.                                           | It does not establish a Core delivery SLO.                                         |
| [Microsoft Entra self-review](https://learn.microsoft.com/en-us/entra/id-governance/self-access-review)                                                                         | Pending work remains in My Access when email is missing/delayed.                                                                                                 | Source lane/in-product work must remain complete through provider failure.                                            | Self-review is not D44 coordinator review.                                         |
| [Okta Access request notifications](https://help.okta.com/en-us/content/topics/identity-governance/notifications.htm)                                                           | Request updates can use email, Slack, and Teams for explicitly defined audiences.                                                                                | Modern products support multiple delivery paths while keeping audience and event meanings explicit.                   | Okta's channel set, expirations, and followers are not Core requirements.          |
| [Okta Slack/Teams integration considerations](https://help.okta.com/en-us/Content/Topics/identity-governance/integrations/bp-integrations.htm)                                  | Chat actions can use a weaker session and email-address matching, creating assurance/impersonation risk.                                                         | Future chat channels need their own identity/authentication proof and should not decide D43 from a message click.     | Core has not adopted Slack or Teams.                                               |
| [SailPoint review access requests](https://documentation.sailpoint.com/saas/user-help/approvals/reviewing_access.html)                                                          | Reviewer email supplements an Approvals surface; reassignment sends a new reviewer email.                                                                        | Email can attract attention without owning work or authority.                                                         | SailPoint's reminder/reassignment/expiry policy is not imported.                   |
| [Salesforce Trailhead — manage approval requests](https://trailhead.salesforce.com/content/learn/modules/approval-process-for-public-sector-solutions/manage-approval-requests) | Approvers have in-product Items to Approve and separately enable approval email in their user profile. Salesforce also supports reply-by-email action.           | In-product plus recipient-controlled email is proven; Core deliberately rejects email decisions for higher assurance. | Salesforce's approval workflow and reply semantics are not D43.                    |
| [GitHub notifications](https://docs.github.com/en/subscriptions-and-notifications)                                                                                              | Users choose notification activity, delivery method, and manage web inbox/email/mobile separately.                                                               | Channel and frequency preferences should be explicit and composable, not one global Boolean.                          | GitHub collaboration notifications are not access governance.                      |
| [Contentful tasks](https://www.contentful.com/help/content-and-entries/tasks/)                                                                                                  | Assigned work is visible in Pending Tasks and also produces email; reminders are tied to a due date.                                                             | Initial email may help staff who do not live in the app; reminder semantics need a separate deadline decision.        | Contentful tasks own generic completion and do not reauthorize source access.      |
| [Blackbaud CRM Administration Guide](https://webfiles-sc1.blackbaud.com/files/support/guides/enterprise/400/admin.pdf)                                                          | Nonprofit CRM staff can opt into email alerts for ownership/task/batch changes.                                                                                  | Recipient-controlled operational email is relevant to nonprofit workflows.                                            | The evidence is older and does not establish D45's exact architecture/default.     |

### Notification control, fatigue, and future-channel seams

| Official source                                                                                                | Verified fact                                                                                                                                                                | D45 implication                                                                                                          | Evidence limit                                                            |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| [Apple HIG — notifications](https://developer.apple.com/design/human-interface-guidelines/notifications)       | Notifications should be timely, concise, valuable, nonduplicative, and free of sensitive/confidential content; important information remains discoverable without badges.    | Use generic safe copy, one semantic email, no duplicate/backfill, and persistent Core surfaces.                          | Apple UI guidance does not determine email plan defaults.                 |
| [Android notifications](https://developer.android.com/develop/ui/compose/notifications)                        | Android requires typed channels and lets users change channel importance/visibility.                                                                                         | Any future push channel needs explicit type and user control, not a generic `push=true`.                                 | Core has no native push transport today.                                  |
| [Android notification design](https://developer.android.com/design/ui/mobile/guides/home-screen/notifications) | Importance should respect attention; disguising nonurgent information as urgent creates unnecessary alarm.                                                                   | D45 email is immediate but ordinary/nonurgent; no urgency language, sound, or escalation implication.                    | Android importance levels do not map directly to email.                   |
| [Google Chat message API](https://developers.google.com/workspace/chat/create-messages)                        | Chat supports normal, forced, and silent notification behavior; forced notification can bypass user DND, subject to limits.                                                  | Google Chat requires an explicit future policy and must not be silently added as “another channel.”                      | Core has no Google Chat app/auth/recipient mapping.                       |
| [Google Chat authentication](https://developers.google.com/workspace/chat/authenticate-authorize)              | User and app authentication have distinct scopes, consent, results, and administrative approval.                                                                             | Future chat delivery needs separate credentials/scopes/recipient identity and cannot reuse email addresses as authority. | It does not choose whether Core should adopt Chat.                        |
| [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)                                                                  | Content and controls require semantic structure, text alternatives, meaningful sequence, contrast, reflow, link purpose, focus, error/status, and accessible authentication. | Email HTML/plain text, preference UI, deep-linked web destination, and proof pack must be accessible.                    | Email-client support varies; production client testing remains necessary. |
| [W3C writing for accessibility](https://www.w3.org/WAI/tips/writing/)                                          | WAI recommends meaningful link text and clear, concise content.                                                                                                              | Use **Review access request**, not “Click here”; include complete plain text.                                            | Advisory guidance does not define source authorization.                   |

### Email provider and delivery semantics

| Official source                                                                                                      | Verified fact                                                                                                                                                           | D45 implication                                                                                                                                                                                              | Evidence limit                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys)                                      | Provider idempotency keys suppress duplicates for 24 hours and reject same-key/different-payload requests.                                                              | Core needs permanent internal identities; provider keys are a bounded retry aid only.                                                                                                                        | Provider behavior can change and remains pinned/versioned by Phase 17 proof.                                           |
| [Resend webhook management](https://resend.com/docs/webhooks/introduction)                                           | Webhooks are at-least-once, may duplicate, may arrive out of order, and retry on non-200 responses.                                                                     | Verify, deduplicate, correlate, and reduce monotonically; never infer source state.                                                                                                                          | Webhook delivery is provider evidence, not human receipt.                                                              |
| [Resend event types](https://resend.com/docs/webhooks/event-types)                                                   | Sent, delivered, delayed, bounced, complained, failed, opened, clicked, and suppressed are distinct events; delivered means mail-server delivery.                       | Keep delivery states exact and never label sent/delivered as human reading.                                                                                                                                  | Inbox placement and human comprehension are not proved.                                                                |
| [Resend suppressions](https://resend.com/docs/dashboard/emails/email-suppressions)                                   | Hard bounce or complaint can suppress an address across all domains in a region.                                                                                        | Recheck suppression and expose a safe provider-health state; never bypass/remove suppression automatically.                                                                                                  | Region-wide provider suppression is not Core consent/preference truth.                                                 |
| [Resend domains](https://resend.com/docs/dashboard/domains/introduction)                                             | Sending requires owned verified domain with SPF and DKIM; Resend recommends purpose-isolating subdomains.                                                               | Exact Tenant connection/domain readiness and purpose-isolated sender posture are prerequisites.                                                                                                              | SPF/DKIM do not guarantee inbox placement or DMARC alignment.                                                          |
| [Resend DMARC](https://resend.com/docs/dashboard/domains/dmarc)                                                      | DMARC builds on SPF/DKIM; Resend recommends testing from monitoring before stricter policy.                                                                             | Phase 17 readiness/operations should test authentication and avoid a false “connected means deliverable” claim.                                                                                              | D45 does not prescribe a universal legal/domain policy.                                                                |
| [Resend open/click tracking](https://resend.com/docs/dashboard/domains/tracking)                                     | Tracking is disabled by default; open tracking adds a unique pixel, click tracking rewrites links and records click data.                                               | Require tracking off for D45 sensitive operational mail and never collect/use open/click as engagement.                                                                                                      | The setting is domain-level, so a dedicated purpose subdomain/profile may be needed.                                   |
| [Resend deliverability insights](https://resend.com/docs/dashboard/emails/deliverability-insights)                   | Resend recommends plain text, purpose subdomains, and disabling tracking for sensitive transactional emails; open rates can be inaccurate.                              | Tracking-off and complete plain text are both privacy and deliverability requirements.                                                                                                                       | Provider advice does not replace client/inbox testing.                                                                 |
| [Resend transactional unsubscribe](https://resend.com/docs/dashboard/emails/add-unsubscribe-to-transactional-emails) | Resend does not manage transactional contact lists; applications may add List-Unsubscribe, while Broadcast/Audience tooling is separate.                                | Core owns D45 preferences; use authenticated settings rather than delegating governance preference to marketing contacts.                                                                                    | Legal unsubscribe obligations vary; this is product architecture, not legal advice.                                    |
| [Resend account quotas and limits](https://resend.com/docs/knowledge-base/account-quotas-and-limits)                 | Resend currently requires account bounce rate below 4% and spam rate below 0.08%; crossing either may pause sending. Limits are account-scoped and provider-controlled. | Pin the provider limit and rate-calculation contract at release; monitor both the shared Tenant connection and D45 diagnostic numerator/denominator so sibling mail cannot hide or be harmed by D45 quality. | Current numbers are not permanent Core constants and must be reverified from official provider terms at build/release. |

## Evidence synthesis

### Verified facts

- Modern systems pair durable in-product work with separately configurable email.
- Email can be delayed, suppressed, bounced, complained about, disabled, or
  provider-unready; none of those states means work does not exist.
- Recipient channel preference and organization/channel configuration are
  separate in current products and platforms.
- Mobile/chat channels have distinct importance, DND, identity, OAuth, consent,
  and interaction semantics; a generic channel Boolean cannot model them safely.
- Sensitive email should be concise, minimize preview data, use descriptive
  links, remain accessible without images, and avoid tracking.
- Resend provider idempotency and webhook delivery are bounded/at-least-once;
  Core must own durable identity and monotonic evidence.
- Core already has the intended fixed-step Delivery Plan, protected-action,
  prepared-message, Tenant Resend, communication-history, and notification
  boundaries; D45 should reuse them.

### Requirement and product inferences

- Default-off at the Tenant plan makes activation deliberate; recipient
  absence/`inherit` follows that current choice while `disabled` provides a
  self-owned narrowing control without a confusing second opt-in.
- Preferences must be Tenant/assignment/message-family scoped because a person
  can serve more than one organization and have different operational duties.
- Tenant/recipient changes should be future-only to prevent backlog blasts and
  false re-notification; current work remains discoverable in Core.
- The email must navigate to current authenticated state rather than carry
  enough data or authority to decide offline.
- Disabling tracking is proportionate for access-governance email because click
  IP/user-agent and open pixels add privacy risk while proving no business fact.
- A bulk D44 current-application email must remain one summary per recipient so
  enabling coverage does not cause a notification storm.
- Future channels should reuse the stable source occurrence but add independent
  contract steps and proof; they should not reuse email destination/preference.

### Assumptions and unresolved evidence

- **Assumption:** some coordinators are infrequent Mission Control users and will
  value optional email enough to justify the operational surface.
- **Assumption:** Tenant-controlled activation plus recipient opt-out is
  understandable when UI explains the inherited and effective result clearly.
- **Assumption:** generic subject/body copy provides enough context without a
  requester name or capability.
- **Assumption:** a purpose-isolated tracking-off subdomain is operationally
  acceptable for Tenants that enable this email.
- **Unresolved unknown:** no representative ministry evidence establishes the
  percentage that would enable email, delivery expectations, preferred sender/
  reply posture, or support burden.
- **Unresolved unknown:** D46 must decide whether one source-owned reminder is
  justified. No deadline or SLA currently exists from which to derive timing.
- **Unresolved unknown:** legal classification and unsubscribe obligations vary
  by Tenant/jurisdiction; legal review remains part of Phase 17 activation and
  D45 does not offer legal advice.

## Permanent domain contract

### Ownership map

| Fact                                                        | Authoritative owner                                                                                                                                                                                     | Derived consumers                            | Never authority                                                |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------- |
| D43 request state/actionability                             | Phase 12 request aggregate                                                                                                                                                                              | D44, Phase 17 source fence, safe destination | Email, provider, task, notification engagement                 |
| Current D44 recipient generation                            | Phase 12 D44 resolver/generation                                                                                                                                                                        | Task, in-product, email candidate            | Address, preference, task state, worker                        |
| Required in-product step                                    | Phase 17 contract + D44 source occurrence                                                                                                                                                               | Notification Center                          | Email enable/outcome                                           |
| Optional email step availability                            | Versioned Phase 17 message contract                                                                                                                                                                     | Delivery Plan editor/readiness               | D44 route, provider dashboard, template binding                |
| Tenant email enablement                                     | Immutable published contract-bounded Delivery Plan                                                                                                                                                      | Effective channel evaluation                 | Recipient preference, route setting, mutable toggle blob       |
| Recipient email preference                                  | Phase 17 relation keyed by `preference.access_request_responsibility_email@1` and the exact Tenant + Active Tenant Assignment + Party + registered role/surface + contract family + email channel tuple | Effective channel evaluation/settings        | Resend Topic/Audience, email address, bare role, browser cache |
| Current recipient destination/contactability                | Phase 3/identity contact authority under exact Tenant/purpose                                                                                                                                           | Phase 6 prepared member                      | Coordinator roster, caller, template, provider event           |
| Suppression/complaint/bounce evidence                       | Phase 6/17 normalized recipient/channel evidence plus provider proof                                                                                                                                    | Eligibility/readiness/repair                 | Source state, recipient preference, authorization              |
| Publication/locale/sender/reply/readiness                   | Phase 17 immutable dependencies                                                                                                                                                                         | Prepared message/provider envelope           | Source, browser editor, worker defaults                        |
| Recipient-specific intent and durable communication history | Phase 6                                                                                                                                                                                                 | Operations/history                           | Provider dashboard alone, notification item                    |
| Provider submission and outcome evidence                    | Phase 6 adapter plus signed webhook reducer                                                                                                                                                             | Operations/repair                            | Human reading, source/task status                              |
| Optional execution/retry                                    | Product dispatch ledger/work claim; optional Inngest executor                                                                                                                                           | Operational telemetry                        | Any preceding product fact                                     |

### Stable contract and step model

D45 does not create a third stable message meaning. It extends each existing
D44 contract with a closed optional step:

| Stable contract                            | Existing required step   | D45 optional step   | Source timing                                                                                                            |
| ------------------------------------------ | ------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `holder_access_review_requested_v1`        | fixed `staff_in_product` | fixed `staff_email` | immediately after one new D44 recipient generation is durably released and remains current                               |
| `access_request_responsibility_updated_v1` | fixed `staff_in_product` | fixed `staff_email` | immediately after one current-application generation newly admits the recipient to one or more existing pending requests |

Both keys resolve through `profile.access_governance_attention@1` and
`plan.required_in_product_optional_email@1`. Contract-specific source, facts,
action, rendering, and semantic member identities remain fixed by each stable
key; the shared `staff_email` slot is not a generic runtime channel alias. The
profile exposes one atomic family-plan selection for those two exact slots. A
plan generation with one D44 email slot On and the other Off is structurally
invalid and cannot be previewed or published. A family selection of On is
publishable only when both exact contract generations, locale publications,
sender/reply posture, and other contract-bound readiness dependencies are
compatible; runtime recipient/source/contact/suppression gates remain independent
per occurrence. Atomic configuration does not merge either contract's semantic
identity, facts, template rendering, source fence, or delivery evidence.

“Immediately” means eligible for preparation/dispatch after the source and
complete plan occurrence commit. It is not a delivery guarantee, synchronous
request dependency, priority override, deadline, or permission to skip current
fences. The aggregate step remains one email whether the sealed child count is
one or many; the per-request key is not emitted for those backfilled children.

There is no generic `notification_channels`, `channel_preferences JSONB`,
runtime `channel` parameter, free-form recipient, arbitrary delay, loop, branch,
or provider name in source code. A generated registry owns exact step keys,
requiredness, channel, recipient role/resolver, publication slot, facts, source
fence, retention, and failure posture.

### Effective enablement and precedence

The server evaluates the following strict sequence for every exact recipient-
channel member:

1. **Contract:** the exact catalog generation is `Live` and admits the named
   optional email step.
2. **Tenant:** an authorized, published, current Delivery Plan enables that exact
   step. Default/absence/unknown is disabled.
3. **Recipient:** the current exact
   `preference.access_request_responsibility_email@1` under the Tenant + Active
   Tenant Assignment + Party + registered role/surface + contract family +
   email channel tuple is `inherit` or absent. Explicit `disabled` narrows the Tenant choice. Unknown,
   corrupt, or unsupported values fail closed as disabled until repaired.
4. **Source:** the exact D43 request and D44 recipient generation remain current
   under their source fence.
5. **Authorization:** the recipient remains authorized for the source detail/
   action purpose; email eligibility cannot preserve ended access.
6. **Destination:** the current source-owned work email is verified, permitted,
   and contactable for this Tenant/purpose.
7. **Safety:** suppression, complaint, bounce, privacy, residency, legal,
   retention, locale, and other floor evidence permits preparation.
8. **Presentation:** the exact immutable locale publication, safe facts, plain
   text/HTML, sender, and reply posture resolve completely.
9. **Transport:** the exact Tenant Resend connection/domain/profile is current,
   proof-gated Ready, tracking-off, and not quarantined.
10. **Identity:** the semantic recipient-step occurrence is unspent or an exact
    replay of the same prepared/provider envelope.

No lower layer can compensate for a higher-layer denial. In-product availability
is not consulted; task materialization is not consulted; provider contact status
cannot infer recipient preference; a preference cannot create source recipient
eligibility.

### Preference lifecycle and invariants

The recipient preference has exactly two stored values: `inherit` and
`disabled`. Absence reads as `inherit`. In user language these are **Use my
organization's setting** and **Turn off for me**. Every change appends an
attributable preference revision/receipt and sets one current head; it does not
edit history, send a message, modify route/task/notification/source state, or
alter another Tenant/assignment.

Preference invariants:

- identity is the exact `(tenant, active_tenant_assignment, party,
registered_role_surface, contract_family, email_channel,
preference.access_request_responsibility_email@1)` tuple for purpose
  `access_request_attention`;
- assignment end makes the preference inert and removes user access; a recreated
  assignment does not inherit it;
- user controls only their own preference through a server-derived authenticated
  assignment; support/admin cannot impersonate, delegate, bulk-change, import,
  or edit the choice on the person's behalf;
- a separately authorized governance export can see safe preference evidence,
  but no ordinary coordinator/route manager sees sibling preferences or
  addresses;
- `inherit` while Tenant plan is disabled truthfully sends nothing now but
  follows a later deliberate Tenant enable for future occurrences;
- disabling before provider preparation prevents future submission for an
  unprepared occurrence; disabling after provider acceptance cannot unsend it;
- `inherit`/`disabled` changes never backfill prior source occurrences or create a “test”
  message; and
- exact replay returns the prior receipt; stale expected heads conflict.

### Tenant Delivery Plan lifecycle

The code-owned default keeps the one access-governance family email selection
Off, which disables both exact D45 steps. A current Phase 17 Delivery Plan
publisher may prepare a new immutable plan version, review a plain-language
synthetic impact, and publish it through the normal proportional review boundary.
The editor offers one family-level email choice—not two deceptively independent
toggles. The compiler rejects a mixed per-key value, and On remains unpublished
unless both contract/publication/readiness dependency sets are compatible.
Enabling/disabling is future-only for unprepared source occurrences.

The impact projection says:

- required in-product attention stays on;
- email is optional and cannot change coordinator responsibility;
- only future newly admitted, currently eligible coordinators whose personal
  setting has not disabled email can receive it;
- **Personal settings may narrow delivery**;
- **0 existing requests will be emailed**;
- current requests/tasks/notifications are not rewritten;
- delivery still depends on verified contact, suppression, locale publication,
  and Tenant Resend readiness; and
- selected-coordinator, email-eligible, preference-disabled, unavailable,
  address, and personal-preference counts or identities are not disclosed.

Plan deactivation stops new email preparation after its effective head/fence. It
does not revoke provider-accepted mail, delete communication history, toggle
recipient preference, or disable in-product. Restore-as-draft creates a new plan
version; it never reopens an old one.

### Email content and safe action

Per-request example:

```text
Subject: Access review needs attention
Preheader: Sign in to see current status and available actions.

Access review needs attention

An access review was assigned to you. Sign in to see current status and available
actions. This email does not grant permission and does not mean access has
changed.

[Review access request]

This email was prepared because your organization enabled access request email,
you were assigned as an Access request coordinator, and your personal setting
followed the organization's choice. Manage notification preferences.
```

Aggregate example:

```text
Subject: Access review responsibilities updated
Preheader: Sign in to see current status and available actions.

Access review responsibilities updated

You were assigned 6 existing access requests. Sign in to see current status and
available actions. This email does not grant permission or change anyone's
access.

[View access requests]

This email was prepared because your organization enabled access request email,
updated its Access request coordinators, and your personal setting followed the
organization's choice. Manage notification preferences.
```

These are preparation-time assignment statements, not present-state assertions.
**Sign in to see current status and available actions** promises only that the
authenticated destination resolves current truth; it does not claim the request
is still open, pending, actionable, or assigned when delayed provider-accepted
mail arrives. Subject, preheader, and body never say **new**, **now**, **open**,
**still pending**, or **currently assigned**. The link-purpose fixtures remain
exactly **Review access request** and **View access requests**; **People & access**
may appear in location/helper copy but never replaces either CTA.

Subject, preheader, and body never interpolate the Tenant display name. Tenant
branding is limited to the governed From identity and immutable Role Layout.
The per-request render-fact set is empty. The aggregate render-fact set contains
only the immutable initial safe count, and that count appears only in the body.
No user-authored text is interpolated.

The primary link points to a first-party HTTPS route whose visible host matches
the Tenant's verified Core destination. It carries only an opaque, non-secret,
uniformly handled source reference or opens the filtered lane. It does not
contain an email address, Tenant slug if protected, reason, capability, grant,
source label, actor, signed mutation token, or return URL to an arbitrary host.
Authentication and current source authorization—not possession of the URL—open
detail or action.

The recipient/footer link label is **Manage notification preferences** and its
authenticated destination is **Settings → Notifications → Access request
responsibility**. It requires ordinary sign-in and changes nothing on GET. The
actual preference save uses a deliberate same-origin POST with CSRF/Origin/Fetch
Metadata, current assignment, expected head, and semantic idempotency. Email
scanners cannot opt a recipient out.

### Sender, reply, tracking, and accessibility posture

- Sender uses a purpose-isolated, verified Tenant transactional subdomain/profile
  where practical, with SPF/DKIM and Phase 17 connection proof; DMARC posture is
  tested under the Tenant's governed rollout.
- Open/click tracking is off. If a Tenant connection cannot prove tracking-off
  for this sender/profile, the D45 step is not Ready; a marketing domain/profile
  with tracking on is not silently reused.
- V1 requires the contract-declared `staff_operations_help` Reply-To. Missing
  or unready help-destination proof makes optional email ineligible; D45 has no
  no-reply branch. A reply leaves Core for the confirmed Tenant mailbox and
  never becomes a request decision or protected source comment.
- Complete plain text is required alongside semantic HTML. Headings, paragraphs,
  lists, descriptive links, logical reading order, sufficient contrast, alt
  text, zoom/reflow, dark/high-contrast behavior, images-off, and locale/RTL
  output are production-client proof, not editor preview claims.
- No tracking pixel, hidden text, attachment, iframe, form, script, arbitrary
  HTML/CSS, externally mutable provider template, custom font dependency, or
  URL-shortener/tracking redirect is allowed.

### Provider and failure lifecycle

```text
candidate
  ├─ any gate false/unknown → not_applicable or suppressed (no provider I/O)
  └─ all gates true → immutable prepared message/member
        └─ sealed provider envelope
              ├─ accepted with correlated provider id → submitted
              ├─ proved pre-I/O rejection → failed/suppressed under closed cause
              └─ timeout/5xx/conflict/unknown → indeterminate; reconcile only
```

Provider outcomes never flow backward into D43/D44/task/notification state.
Before preparation and provider I/O, Phase 6 rechecks current source/recipient/
preference/suppression/readiness. After provider acceptance, Core cannot retract
mail; the destination page safely represents ended/ineligible current state.

Resend webhook reducer rules:

- verify signature and exact connection revision before parsing ownership;
- derive Tenant/scope from the connection, never from payload address/tag;
- deduplicate `svix-id`, tolerate at-least-once and out-of-order delivery;
- correlate exact provider email ID under a same-scope unique relation;
- keep provider evidence monotonic without pretending every event sequence is
  total order;
- preserve unknown/contradictory evidence for quarantine/repair;
- do not reopen a terminal provider state from a late lower-order event; and
- never map opened/clicked to read, done, accepted, or decision.

### Future channel boundary

Future channel adoption reuses only the D43/D44 source occurrence and safe fact
adapter. Each new channel requires a separately ratified named step and complete
channel-specific contract:

- **push:** app/device installation, OS permission, token rotation/revocation,
  per-device privacy/preview policy, platform delivery evidence, and deep-link
  authentication;
- **Slack/Teams/Google Chat:** Tenant installation/admin consent, app versus user
  authentication, exact account mapping independent of email, channel/DM scope,
  DND/notification settings, signatures, rate limits, deletion/history, and no
  consequential chat action without Core reauthentication;
- **SMS:** Phase 17's existing dark launch gate, registration, consent
  provenance, STOP/HELP, phone reassignment, suppression, quiet time, rate,
  signed callbacks, and legal/jurisdiction proof; and
- **another email provider:** a new adapter/proof under the same provider-neutral
  Phase 6/17 identity, never a source-level provider switch.

No future channel may be activated by inserting a row/string into a channel
array. Unknown channels fail before recipient intent; a new contract generation,
OpenSpec/ADR decision, implementation, tests, and release proof are required.

## UX/UI journeys

### Tenant administrator

The canonical route is **System Messages → Messages → Access review requested →
Delivery**. The card represents the bounded access-governance attention family
and summarizes only actual delivery channels:

```text
Access review requested

In-product notification                 Required
Email                                   Off
Readiness                               Ready
Personal settings may narrow delivery
0 existing requests will be emailed

[Configure delivery]
```

The delivery editor shows one locked, explained required in-product row and one
optional family-level email row that atomically governs both exact D44 email
occurrences. It does **not** render Tasks Hub as a channel row: Tasks Hub is a
durable source-owned work projection, not message delivery. Helper copy stays
visible in the card/editor: **Email settings never change Tasks Hub assignments
or the Access requests lane.** The editor does not show arbitrary channels, a
recipient picker, reminder timing, workflow canvas, provider jargon, raw
templates, or separate per-contract email toggles. When email is off:

```text
Email is off by default
Coordinators still receive required in-product attention and can find work in
Tasks Hub and Access requests.

[Enable email for future requests]
```

Before publication, the impact review shows future-only effect and exact
readiness blockers such as **Connect tenant email**, **Publish a compatible
message**, or **Turn off tracking for this sender profile**. It repeats
**Personal settings may narrow delivery** and **0 existing requests will be
emailed**. It never shows selected-coordinator, email-eligible, preference-
disabled, unavailable, address, or personal-preference counts/identities, and
never claims a recipient will receive email merely because the step is enabled.

**People & access → Access requests** may show a compact **Manage email delivery**
link to this exact canonical route only for an authorized Delivery Plan
publisher. It stores and edits no second setting and displays no delivery cohort
counts.

### Recipient preference

At **Settings → Notifications → Access request responsibility**, use one Base
Maia field group:

```text
Access request responsibility
Notifications about access requests assigned to you as a coordinator.

In product                              Always on
Effective email status                  On
                                        Your organization has email on and your
                                        personal setting follows it.

Personal setting
(●) Follow my organization's setting (default)
( ) Off for me

Responsibilities and permissions do not change when you change email.

[Cancel]                                      [Save changes]
```

The stable radio choice **Follow my organization's setting** stores `inherit`;
**Off for me** stores `disabled`. **Effective email status** is a separate read-
only result, not a switch. It shows **Off — your organization has email off**,
**Off for you**, **On**, or a safe **Unavailable** readiness state with one useful
repair explanation appropriate to the viewer. It never exposes provider, DNS,
sender, sibling preference, coordinator, or cohort data.

Changing the radio choice edits a local draft only; it does not autosave. **Save
changes** is disabled until the draft differs from the current receipt-backed
value and while submission is pending. **Cancel** restores the current saved
value and returns focus predictably without writing. On success, persistent
inline status says **Email preference updated. This affects future access
request notifications only.** On validation, authorization, stale-head, or
network ambiguity, the same field group shows an associated persistent inline
error or resolves the durable command receipt/current value before claiming
failure. A toast is never the sole evidence. Disable does not claim to recall
accepted mail. If the session/assignment changed, the save fails safely and
returns the user to current Tenant context without writing another Tenant's
preference. Tenant administration may show contract/transport readiness only,
never recipient/cohort counts or personal values, and has no edit-on-behalf
control for another person's preference. Implement the two personal choices as
one labelled native fieldset or shared Base UI radio group with stable value/
label association.

### Email recipient and deep-link destination

Email is concise and generic; primary CTA is visible and descriptive; the
first-party destination opens in the authenticated Core experience. Wrong/
ended access uses uniform safe copy such as **This access request is no longer
available to you. Open Access requests to see work you can currently review.**
It does not distinguish missing, other-Tenant, withdrawn, removed, or denied
objects to an unauthorized viewer.

The recipient can always navigate directly to Notification Center, My tasks, or
**People & access → Access requests** without the email. Email-delivery state is
not shown as “seen” or “read” in those surfaces. An authorized communication
operator sees provider state separately from request/task history.

### Accessibility, localization, mobile, and low bandwidth

- Use shared `@asym/ui`, Base UI behavior, Base Maia/Zinc tokens, native form
  semantics, visible focus, programmatic labels/descriptions/status, and no app-
  local preference components.
- Tenant and recipient settings reflow at 320 CSS pixels/400% zoom, support
  keyboard/screen reader/forced colors/reduced motion, and keep important targets
  at least the Core 44-pixel policy.
- Email HTML and plain text preserve semantic order, descriptive link purpose,
  locale/direction, international names, localized plural/count/date handling,
  and readability with images/styles unavailable.
- The email does not depend on animation, hover, background image, remote font,
  icon-only meaning, or color-only urgency.
- Subject/preheader/body are short enough for common narrow clients but are not
  silently truncated by Core; client truncation cannot remove the primary
  meaning from plain text.
- Slow/offline link opens preserve login/current-source safety; they never submit
  or optimistically decide. Preference saves use durable receipts and recover
  from ambiguous responses.

## Database, RLS, authorization, privacy, and integrity

D45 reuses Phase 17's generated catalog/plan/publication/preparation/intent/
provider/history relations and adds no standalone email queue. The recipient
preference belongs to the same canonical preference registry or a typed additive
relation—not a JSON settings blob or Resend contact.

Required structural invariants:

- every Tenant-scoped row has `tenant_id NOT NULL` and same-Tenant composite
  foreign keys to exact Active Tenant Assignment, plan, source occurrence,
  recipient generation, connection/profile, publication, intent, and provider
  evidence as applicable;
- one current preference head exists per Tenant + exact assignment + preference
  family; value is the closed enum `inherit | disabled`, with absence read as
  `inherit`, not Boolean/on-off or arbitrary channel JSON;
- one optional email recipient-step member exists at most once per exact source
  occurrence + recipient generation + plan/step version;
- one immutable prepared message and one sealed provider envelope exist per
  recipient-step attempt; a new legitimate send requires a new source/plan
  occurrence permitted by the contract;
- provider email ID is unique within exact scope owner/connection revision and
  cannot be correlated by recipient address;
- ordinary deletion never cascades through source, plan, preference, prepared,
  provider, or communication-history evidence; retention/disposal follows
  purpose-specific Phase 17 policy; and
- unknown/corrupt preference values fail closed as disabled, while a genuinely
  absent row has the deliberate versioned `inherit` meaning.

Raw base tables are browser-revoked. `ENABLE ROW LEVEL SECURITY` plus `FORCE ROW
LEVEL SECURITY`, explicit grants, default-deny `SELECT USING`, mutation `USING`
and `WITH CHECK`, and hardened server commands preserve current and resulting
Tenant/assignment/source/plan boundaries. Security-definer functions use empty
`search_path`, schema-qualified objects, revoked public execute, pinned caller
roles, and equivalent owner/service-role/`BYPASSRLS` checks.

The server derives actor, Tenant, Active Tenant Assignment, preference family,
recipient, destination, source, plan, step, sender, timestamps, audit, and
provider ownership. Browser/provider/worker inputs cannot supply or retarget
those facts. An allowed preference update cannot change another assignment,
Tenant, family, plan, address, or source occurrence.

Privacy/retention requirements:

- durable communication history is body-free and stores exact typed identity,
  channel, locale, sender/profile/connection pins, and normalized outcomes;
- ordinary logs/traces/metrics/workflow events exclude address, rendered body,
  source/request identifiers visible to humans, query strings, provider payload,
  click IP/user agent, and protected source details;
- encrypted recent sent copy is permitted only if the Phase 17 contract admits
  it, expires under its bounded policy, and requires separate current recipient-
  copy authorization; it is not retry payload or source truth;
- email address/contact revision, preference, suppression, consent/legal basis,
  provider evidence, and request source each retain/dispose under their own
  purpose; none extends another's retention;
- support and exports receive safe summaries only; ordinary access-governance
  export cannot reveal provider/contact/private-copy detail; and
- no individual open/click/response-time analytics or coordinator performance
  scoring is collected.

## Temporal correctness, concurrency, idempotency, and failure modes

| Scenario                                                              | Permanent behavior                                                                                                             |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| D43 source closes before preparation                                  | Source fence suppresses optional email; required in-product/task/source history follows D43/D44.                               |
| D43 closes after provider acceptance                                  | Mail cannot be recalled; authenticated link shows safe current unavailability/outcome under current authorization.             |
| Recipient loses D44 eligibility before preparation                    | No provider I/O; preference remains independent/inert for future lawful occurrences.                                           |
| Recipient loses eligibility after acceptance                          | Email remains external evidence; link/detail fail closed; no access persists through mail.                                     |
| Recipient disables email before preparation                           | No send; exact plan member records preference suppression without changing in-product.                                         |
| Recipient disables after provider acceptance                          | No recall; future members disabled; UI states future-only effect.                                                              |
| Tenant disables email before preparation                              | No send for unprepared members; future-only plan head applies.                                                                 |
| Tenant disables after acceptance                                      | No recall/rewrite; accepted envelope/history remains pinned.                                                                   |
| Tenant enables email or recipient returns to `inherit` with open work | No backfill/resend; the next new source/recipient generation may qualify.                                                      |
| Route update admits coordinator to many existing requests             | One aggregate email member at most, if every D45 gate passes.                                                                  |
| Request creation response is lost                                     | D43/D44 receipt resolves source; D45 semantic member compiles exactly once later.                                              |
| Phase 6 compile transaction crashes                                   | All-before-any parent/member release; no partial visible plan children.                                                        |
| Immediate provider call times out                                     | Envelope becomes indeterminate; reconcile signed/local/provider evidence under same identity, never blind new key.             |
| Resend returns same key/different payload                             | Quarantine as idempotency payload conflict; do not retry under a new key absent a new authorized source occurrence.            |
| Duplicate/out-of-order webhook                                        | Signature/scope verify, provider-event dedupe, monotonic reducer; no duplicate send or source effect.                          |
| Hard bounce/complaint                                                 | Record provider suppression; stop future eligible preparation under current evidence; never reroute or auto-remove preference. |
| Tenant Resend unavailable                                             | Skip/fail email honestly; required in-product/lane/task remain; no shared Asym fallback.                                       |
| Locale publication unavailable                                        | Optional step suppresses/blocks per exact plan; never sends wrong/mixed/draft language.                                        |
| Preference save races assignment end                                  | Current assignment/head check fails; no successor-assignment preference inheritance.                                           |
| Two preference saves race                                             | First expected-head CAS wins; second reloads current state; no last-write-wins ambiguity.                                      |
| Plan publication races request generation                             | Occurrence pins either complete prior or complete new plan; no mixed step set.                                                 |
| Worker/plan/provider retry after 24 hours                             | Product identity/receipt decides; provider/Inngest 24-hour dedupe cannot create a new send.                                    |

## Scalability, performance, and operational posture

- D44 caps recipient fan-out at three. Phase 17 resolves the complete recipient-
  step set in one bounded plan occurrence; recipient eligibility and preferences
  use set-based indexed joins, not N+1 application calls.
- Tenant plan and recipient preference summaries query safe current heads without
  decrypting recent copies or provider payloads.
- D44 aggregate responsibility updates produce one email per admitted recipient,
  not per child request. Provider batch use remains optional and preserves
  separate recipient members/addresses/outcomes.
- Connection/publication/readiness checks are cached only under Tenant, plan,
  contract generation, connection/profile revision, locale, and governance
  heads; dispatch still rechecks current source/recipient/suppression.
- Provider call concurrency, rate limits, batch sizes, retries, and worker
  concurrency are pinned operational configuration validated by current Resend
  docs/load tests, not hard-coded into the product decision as “scalable.”
- In-product and source work remains available during email backlog/outage.
  Operational degradation is visible to communication operators without leaking
  request or recipient details.
- Reconciliation compares product intents/envelopes/provider evidence and never
  chooses a recipient, changes preference, creates a new source occurrence, or
  marks a request complete.
- Metrics are bounded aggregates by Tenant-safe operational partition and stable
  contract/step/outcome. High-cardinality addresses, reasons, names, provider
  payloads, and opaque source IDs stay out of metric labels.

## Rollout, migration, upgrade, and rollback

1. Ratify D45 exact step keys, effective enablement, safe facts/content,
   tracking-off posture, future-only semantics, D46 boundary, and monitoring in
   the decision log, Phase 12/17, ADRs, glossary, roadmap, and OpenSpec.
2. Extend the generated catalog profiles for both D44 keys while keeping the
   optional email steps disabled/non-Live until every common and email-specific
   proof passes.
3. Add the typed Tenant/assignment preference relation/reader/command, constraints,
   RLS/grants, audit, retention, and privileged-path tests before settings UI.
4. Complete Tenant Resend connection/domain/sender/reply/tracking-off, immutable
   publications/locales, prepared-message/provider-envelope, webhook reducer,
   history, and recovery infrastructure under Phase 17.
5. Ship recipient preference UI with no dispatch effect first; shadow effective-
   eligibility decisions and safe zero/denial reasons without storing addresses
   in logs.
6. Ship Tenant Delivery Plan preview/publication with both D45 steps default-off.
7. Canary one Tenant/contract/recipient using synthetic and then controlled live
   source occurrences; prove no backfill, duplicate, tracking, protected-data,
   source/task coupling, or cross-Tenant delivery.
8. Expand by Tenant only after reconciliation, delivery, privacy, accessibility,
   comprehension, load, and rollback evidence passes.

New/migrated Tenants start with the Delivery Plan email step off; new/migrated
assignments have no preference row and therefore the versioned `inherit`
posture. No preference is inferred from current profile fields, role, existing finance notification preference,
Resend contact/topic, email presence, prior messages, task assignment, D44
coordinator membership, or Website/Mobilize settings. Existing D43 requests/
D44 notifications/tasks produce no historical/backfill email.

Mixed versions accept current plus immediately prior catalog generations only
under the Phase 17 deployment contract. Unknown contract/plan/step/preference/
provider versions are non-dispatchable. Old clients cannot enable email by
writing a legacy Boolean or generic notification setting.

Rollback disables new optional email compilation/dispatch, preserves D43/D44
source work, required in-product attention, preferences, immutable plans,
prepared/provider evidence, and body-free history. It does not recall accepted
mail or mark it unsent. Re-enable resumes exact product-ledger recovery without
new semantic occurrences or duplicate email.

## Research assertions — D45-RA001 through D45-RA120

### Repository and governing facts

- **D45-RA001 — Repository fact:** D43 request state and grant decisions are
  Phase 12 source truth; communication cannot mutate them.
- **D45-RA002 — Repository fact:** D44 fixes one exact eligible coordinator
  generation independently of any channel.
- **D45-RA003 — Repository fact:** D44 requires in-product attention, a source-
  backed task projection, and the complete Access requests lane before D45.
- **D45-RA004 — Repository fact:** `holder_access_review_requested_v1` already
  means one new request became actionable to one newly admitted coordinator.
- **D45-RA005 — Repository fact:**
  `access_request_responsibility_updated_v1` already means one recipient gained
  current responsibility for one sealed set of existing pending requests.
- **D45-RA006 — Repository fact:** ADR-0027 separates notification availability/
  engagement, external delivery, task state, and source state.
- **D45-RA007 — Repository fact:** ADR-0183 makes Tasks Hub presentation only and
  requires source-controlled closure.
- **D45-RA008 — Repository fact:** ADR-0026 admits fixed required/optional
  Delivery Plan steps and rejects arbitrary channel/workflow graphs.
- **D45-RA009 — Repository fact:** ADR-0025 requires protected email links to be
  inert on GET/HEAD and consequential actions to use deliberate reauthorized
  same-origin POST.
- **D45-RA010 — Repository fact:** ADR-0032 makes prepared messages/provider
  envelopes immutable and provider ambiguity reconcile-only.
- **D45-RA011 — Repository fact:** Phase 17 uses one Phase 6 recipient-specific
  intent/history spine and one Tenant-owned Resend branch without shared fallback.
- **D45-RA012 — Repository fact:** Phase 17 already distinguishes recipient
  eligibility, consent/preference, suppression, contactability, source state,
  provider outcome, and notification engagement.
- **D45-RA013 — Repository fact:** current contribution approval email defaults
  email off but uses finance-specific profile/role/SLA/direct-sender structures.
- **D45-RA014 — Repository fact:** current email/template/Resend pieces do not by
  themselves prove the future catalog/publication/plan/prepared-message contract.
- **D45-RA015 — Repository fact:** workflow events are identifier-only and
  product dispatch ledger/work claims—not Inngest—own durable handoff.

### Current external evidence

- **D45-RA016 — Verified external fact:** Microsoft Entra exposes reviewer email
  notification as a separately configurable access-review setting.
- **D45-RA017 — Verified external fact:** Microsoft reviewers can directly open
  pending work in My Access without email.
- **D45-RA018 — Verified external fact:** Microsoft warns access-review email may
  be delayed up to 24 hours.
- **D45-RA019 — Verified external fact:** Microsoft records contacted reviewers/
  timestamps separately from their review decision.
- **D45-RA020 — Verified external fact:** Microsoft reminder email is separately
  configurable and tied to a review schedule/midpoint.
- **D45-RA021 — Verified external fact:** Okta sends access-request notifications
  through explicit email, Slack, and Teams channels to defined audiences.
- **D45-RA022 — Verified external fact:** Okta delivery preferences and request/
  task assignment are separate product concepts.
- **D45-RA023 — Verified external fact:** Okta warns chat-session assurance and
  email-address identity matching can create authorization risk.
- **D45-RA024 — Verified external fact:** SailPoint pairs reviewer email with a
  durable Approvals surface.
- **D45-RA025 — Verified external fact:** Salesforce pairs in-product Items to
  Approve with a user-level approval-email preference.
- **D45-RA026 — Verified external fact:** GitHub lets users choose web inbox,
  email/mobile delivery, activity, and frequency separately.
- **D45-RA027 — Verified external fact:** Contentful pairs Pending Tasks with
  assignment email and ties reminder email to a due date.
- **D45-RA028 — Verified external fact:** Blackbaud supports user-controlled email
  alerts for nonprofit CRM ownership/task changes.
- **D45-RA029 — Verified external fact:** Apple recommends concise,
  nonduplicative, valuable notifications without sensitive/confidential content.
- **D45-RA030 — Verified external fact:** Android uses typed notification channels
  and user-controlled importance/visibility rather than one app-wide behavior.
- **D45-RA031 — Verified external fact:** Google Chat supports normal, forced,
  and silent notification behavior with different DND consequences.
- **D45-RA032 — Verified external fact:** Google Chat user/app authentication has
  different scopes, consent, authorization, and resource visibility.
- **D45-RA033 — Verified external fact:** W3C recommends meaningful link text and
  WCAG requires semantic, accessible content/authentication experiences.
- **D45-RA034 — Verified external fact:** Resend recommends purpose-isolating
  subdomains and requires verified SPF/DKIM sending domains.
- **D45-RA035 — Verified external fact:** Resend open/click tracking is default-
  off, rewrites/augments messages, and is discouraged for sensitive
  transactional email.

### Exact decision and preference layering

- **D45-RA036 — Product judgment:** both D44 contracts gain one named optional
  immediate email step; required in-product remains unchanged.
- **D45-RA037 — Product judgment:** the code-owned default Delivery Plan keeps
  one access-governance family email selection Off; that selection controls both
  exact D44 `staff_email` slots atomically and mixed per-contract On/Off is
  invalid.
- **D45-RA038 — Requirement inference:** only the exact Phase 17 Delivery Plan
  publisher can enable the family selection through immutable publication/audit,
  and On publishes only when both exact contracts' publication and readiness
  dependencies are compatible without merging their occurrence identities or
  rendering.
- **D45-RA039 — Requirement inference:** D44 route manager/coordinator/task/
  provider/template/role state cannot enable email.
- **D45-RA040 — Product judgment:** each recipient has one Tenant/Active Tenant
  Assignment/message-family operational preference with only `inherit` and
  `disabled`.
- **D45-RA041 — Product judgment:** absence means `inherit` and follows a
  deliberate Tenant Delivery Plan; unknown/corrupt/unsupported values fail
  closed as disabled.
- **D45-RA042 — Requirement inference:** Tenant cannot override recipient
  `disabled`; recipient `inherit` cannot override Tenant/contract off.
- **D45-RA043 — Requirement inference:** email requires the current exact D44
  recipient generation and current actionable D43 source at dispatch.
- **D45-RA044 — Requirement inference:** current authorization, verified
  destination, contactability, suppression, locale publication, and Tenant
  Resend readiness are independent required gates.
- **D45-RA045 — Requirement inference:** any false/unknown/stale/partial/timed-out
  gate yields no new provider submission.
- **D45-RA046 — Product judgment:** Tenant plan and recipient preference changes
  affect future unprepared occurrences only.
- **D45-RA047 — Requirement inference:** Tenant enable or recipient return to
  `inherit` creates no backfill, resend, test send, task mutation, or notification
  reset.
- **D45-RA048 — Requirement inference:** disabling before preparation prevents a
  new send; disabling after provider acceptance cannot recall mail.
- **D45-RA049 — Requirement inference:** preference identity does not transfer to
  a recreated assignment or another Tenant.
- **D45-RA050 — Requirement inference:** route managers cannot enumerate sibling
  preferences, addresses, suppressions, or delivery results.
- **D45-RA051 — Requirement inference:** recipient preference uses a local draft
  with explicit **Save changes** and Cancel—not autosave—and derives actor,
  Tenant, assignment, family, and audit from trusted server context; no Tenant
  administrator or other person can edit it on the recipient's behalf.
- **D45-RA052 — Requirement inference:** same-key/same-input preference replay
  returns one receipt; stale/different input conflicts.
- **D45-RA053 — Product judgment:** a user may retain/return to `inherit` while
  the Tenant step is off, with explicit future-only/effective-off copy.
- **D45-RA054 — Requirement inference:** effective-send UI never promises delivery
  merely because the Tenant plan is on and preference is not disabled.
- **D45-RA055 — Requirement inference:** required in-product/task/lane remain
  truthful through every email preference/readiness/outcome state.

### Safe content, action, privacy, and provider semantics

- **D45-RA056 — Product judgment:** per-request subject is generic **Access review
  needs attention**; aggregate subject is **Access review responsibilities
  updated**; Tenant branding appears only in governed From/layout, never dynamic
  subject/preheader/body copy.
- **D45-RA057 — Requirement inference:** per-request render-fact set is empty and
  email contains no requester name, reason, capability, grant source/provenance,
  group, grantor, sibling, Tenant name, hidden scope, or decision recommendation.
- **D45-RA058 — Requirement inference:** aggregate email contains exactly one
  render fact—the immutable safe initial count—in the body only, never subject/
  preheader, and has no child list/per-request detail.
- **D45-RA059 — Requirement inference:** one current-application generation sends
  at most one aggregate email per admitted recipient, not one per child.
- **D45-RA060 — Requirement inference:** email says it grants no permission and
  does not prove anyone's access changed.
- **D45-RA061 — Requirement inference:** primary links have descriptive text and
  point to first-party authenticated Core routes.
- **D45-RA062 — Requirement inference:** email URL possession is non-authorizing;
  wrong-account/Tenant/stale/ended/denied states fail uniformly.
- **D45-RA063 — Requirement inference:** no Keep/Remove/Approve/Reject/reply
  command/form/attachment/calendar/secret action exists in email.
- **D45-RA064 — Requirement inference:** GET/HEAD/link-preview/forward/scanner
  activity is inert; source decision needs ordinary reauthorized POST.
- **D45-RA065 — Requirement inference:** Manage notification preferences is an
  authenticated inert-on-GET link; actual change is CSRF/Origin/Fetch-Metadata-
  protected POST.
- **D45-RA066 — Product judgment:** Resend marketing Topics/Audiences/
  unsubscribe state never owns D45 operational preference.
- **D45-RA067 — Product judgment:** D45 v1 does not use unauthenticated one-click
  unsubscribe as an access-governance mutation.
- **D45-RA068 — Product judgment:** open and click tracking must be off for this
  sensitive operational family.
- **D45-RA069 — Requirement inference:** open/click telemetry never proves read,
  task engagement, or decision even if provider evidence exists elsewhere.
- **D45-RA070 — Requirement inference:** complete deterministic semantic HTML and
  plain text remain understandable without images/styles/remote fonts.
- **D45-RA071 — Requirement inference:** email uses immutable Phase 17
  publication/locale/sender/reply/profile pins, never mutable provider templates.
- **D45-RA072 — Requirement inference:** current source-owned verified staff
  contact supplies destination; no caller/template/task/worker/provider payload
  may nominate it.
- **D45-RA073 — Requirement inference:** no Asym shared email fallback substitutes
  for unavailable Tenant Resend.
- **D45-RA074 — Requirement inference:** purpose-isolated tracking-off sender/
  domain profile is readiness evidence, not optional visual polish.
- **D45-RA075 — Requirement inference:** replies never decide or comment on D43;
  D45 requires the confirmed `staff_operations_help` Reply-To, and missing or
  unready proof makes optional email ineligible rather than selecting no-reply.

### Provider identity, future channels, UX, and accessibility

- **D45-RA076 — Verified external fact:** Resend request idempotency keys expire
  after 24 hours.
- **D45-RA077 — Verified external fact:** Resend webhooks are at-least-once and
  can duplicate or arrive out of order.
- **D45-RA078 — Requirement inference:** product intent/prepared/envelope/history
  identities own durable uniqueness; provider idempotency is secondary.
- **D45-RA079 — Requirement inference:** ambiguous timeout/5xx/concurrent/conflict
  provider states reconcile under the sealed envelope and never blindly resend.
- **D45-RA080 — Requirement inference:** signed webhook scope/connection verifies
  before provider payload processing; address/tags never choose Tenant ownership.
- **D45-RA081 — Requirement inference:** provider event ID dedupe and monotonic
  reducer tolerate duplicate/out-of-order events without source effects.
- **D45-RA082 — Requirement inference:** sent/delivered/delayed/bounced/
  complained/suppressed/failed/indeterminate remain exact delivery evidence.
- **D45-RA083 — Requirement inference:** delivered means recipient mail-server
  acceptance, never inbox placement or human reading.
- **D45-RA084 — Requirement inference:** suppression stops optional email but
  never reroutes responsibility or disables required in-product.
- **D45-RA085 — Product judgment:** a future channel normally extends the same
  stable D44 message meaning through a reviewed contract generation and named
  channel step/profile/adapter; it does not create a new source occurrence or
  stable message key unless business meaning changes.
- **D45-RA086 — Requirement inference:** future chat recipient identity cannot be
  inferred from editable email address.
- **D45-RA087 — Requirement inference:** future chat/push/SMS channels require
  channel-specific auth, consent/preference/suppression/readiness/outcome proof.
- **D45-RA088 — Requirement inference:** unknown channel strings fail before
  recipient intent; no `channels[]` or provider map exists.
- **D45-RA089 — Product judgment:** Tenant control lives only at **System Messages
  → Messages → Access review requested → Delivery**; **People & access → Access
  requests** may expose only **Manage email delivery** to deep-link there, while
  recipient preference lives only at **Settings → Notifications → Access request
  responsibility** and email uses **Manage notification preferences** to deep-
  link to that personal route.
- **D45-RA090 — Requirement inference:** Tenant UI shows readiness, **Personal
  settings may narrow delivery**, and **0 existing requests will be emailed**
  without small-cohort counts; recipient UI separates read-only effective status
  from stable `inherit`/`disabled` radio choice and says responsibility/
  permissions never change with email. System Messages shows only required in-
  product and optional email as channel rows, never Tasks Hub, with persistent
  helper copy that email settings never change Tasks Hub or the source lane.

### Failure, scale, migration, and next decision

- **D45-RA091 — Requirement inference:** source close/recipient loss before
  preparation suppresses email without altering committed D43/D44 state.
- **D45-RA092 — Requirement inference:** source close after provider acceptance
  leaves mail external but the link safely reflects current state.
- **D45-RA093 — Requirement inference:** plan publication and source occurrence
  race pins either the complete prior or complete new atomic family selection;
  no occurrence can observe mixed D44 email-step state.
- **D45-RA094 — Requirement inference:** preference save and assignment-end race
  cannot write or transfer a successor preference.
- **D45-RA095 — Requirement inference:** task/in-product/email failures retry and
  reconcile independently.
- **D45-RA096 — Requirement inference:** email outage never hides or ends source
  lane, task, or required in-product attention.
- **D45-RA097 — Requirement inference:** recipient/step fan-out is bounded by D44
  and resolved set-wise without N+1 preference/contact calls.
- **D45-RA098 — Requirement inference:** provider batching is transport-only and
  preserves independent recipients, addresses, suppression, identity, and
  outcome.
- **D45-RA099 — Requirement inference:** no cross-Tenant/provider envelope or
  visible multi-recipient addressing is permitted.
- **D45-RA100 — Requirement inference:** metrics/logs exclude address, body,
  request/provenance, query strings, click IP/user agent, and provider payload.
- **D45-RA101 — Requirement inference:** UI/email/deep link pass WCAG 2.2 AA,
  keyboard, reflow, contrast, meaningful-link, plain-text, images-off, locale,
  CJK, and RTL evidence.
- **D45-RA102 — Requirement inference:** high-volume route changes still produce
  one aggregate member/email per admitted recipient/application generation.
- **D45-RA103 — Requirement inference:** new/migrated Tenants/assignments start
  email-off and infer no preference from address/role/history/provider data.
- **D45-RA104 — Requirement inference:** existing requests/tasks/notifications
  produce no historical email when D45 deploys or is enabled.
- **D45-RA105 — Requirement inference:** unknown contract/plan/step/preference/
  provider versions are non-dispatchable in mixed deployment.
- **D45-RA106 — Requirement inference:** rollout activates common/in-product
  proof before preference, plan, email, provider, and canary proof in order.
- **D45-RA107 — Requirement inference:** rollback stops new email but preserves
  preferences, plans, intents/evidence, source work, and in-product attention.
- **D45-RA108 — Requirement inference:** re-enable resumes exact ledger recovery
  without fabricating a new occurrence or duplicate email.
- **D45-RA109 — Product judgment:** D45 creates no reminder, digest, deadline,
  SLA, escalation, alternate recipient, repeat-send, or automatic decision.
- **D45-RA110 — Verified external fact:** Entra/Okta/Contentful reminder examples
  derive from an explicit review period, expiry, or due date.
- **D45-RA111 — Product judgment:** D43 currently has no evidence-backed deadline
  from which to derive a reminder instant.
- **D45-RA112 — Product judgment:** D46 must decide reminder necessity/timing
  separately from initial email.
- **D45-RA113 — Product judgment:** recommend D46 no automatic reminder until a
  source-owned temporal requirement exists; persistent source/task/in-product
  plus age monitoring is proportionate without an invented SLA.
- **D45-RA114 — Assumption:** some distributed coordinators will benefit when
  their Tenant deliberately enables inherited email because they do not remain
  in Mission Control.
- **D45-RA115 — Assumption:** Tenant-controlled activation plus self-owned
  `disabled` opt-out is understandable with inherited/effective-state copy and
  avoids double-opt-in friction.
- **D45-RA116 — Assumption:** preparation-time, past-tense assignment copy and a
  prompt to sign in for current status provide enough context without requester/
  capability disclosure or a stale claim that delayed mail still represents
  open/currently assigned work.
- **D45-RA117 — Assumption:** tracking-off purpose-isolated sender readiness is
  feasible for Tenants that choose email.
- **D45-RA118 — Unresolved unknown:** no representative evidence sets enablement,
  delivery-success, support-volume, or response-time expectations.
- **D45-RA119 — Unresolved unknown:** exact legal classification/unsubscribe
  obligations require Tenant/jurisdiction review and are not inferred here.
- **D45-RA120 — Product judgment:** future channel expansion reuses source facts
  only and must add independently ratified channel contracts—never generic
  configuration.

## Falsifiable acceptance criteria

1. The generated catalog binds both `holder_access_review_requested_v1` and
   `access_request_responsibility_updated_v1` to
   `profile.access_governance_attention@1` and
   `plan.required_in_product_optional_email@1`, with exactly one required
   `staff_in_product` slot and one optional `staff_email` slot; no D45 alias,
   other channel, or timing step exists, and each key retains its own semantics.
   One profile-family plan selection governs both exact `staff_email` slots
   atomically while their occurrence identities and renderers remain separate.
2. The one family email selection is Off in every new/migrated Tenant's code-
   owned default Delivery Plan, thereby disabling both exact slots; a mixed per-
   key On/Off plan is invalid and cannot be previewed, published, or dispatched.
3. Only the current exact Phase 17 Delivery Plan publisher can enable/disable
   the family selection through immutable preview/review/publication; On cannot
   publish unless both exact contract/publication/readiness dependency sets are
   compatible. D44 route, coordinator, task, role, template, provider, browser,
   support, AI, import, or worker state cannot enable it.
4. The recipient preference is exactly
   `preference.access_request_responsibility_email@1` under the Tenant + current
   Active Tenant Assignment + Party + registered role/surface + contract family
   - email channel tuple and purpose `access_request_attention`, with closed
     values `inherit | disabled`; absence
     means `inherit`, unknown/corrupt fails closed as disabled, and assignment end/
     recreation never transfers it.
5. Tenant plan cannot override recipient `disabled`; recipient `inherit` cannot
   override a Tenant/contract off, current-source/recipient denial, destination/
   suppression, locale, or delivery-readiness failure.
6. Widening—Tenant On, `disabled`→`inherit`, or contact/readiness repair—is
   eligible only for source occurrences committed after the new effective head
   and produces no omitted-member addition, backfill, test, resend, current-task,
   or notification change. Narrowing—Tenant Off, `inherit`→`disabled`, or
   source/auth/contact/suppression/readiness loss—suppresses any not-yet-
   provider-submitted optional child at fire-time reproof; accepted mail is
   non-retractable.
7. Every candidate member re-proves exact current D43 actionability, D44 recipient
   generation, current Phase 12 authorization, destination/contactability,
   preference, suppression, publication/locale, sender/reply, tracking-off, and
   Tenant Resend readiness immediately before preparation/provider I/O.
8. Any required false, absent, stale, partial, timed-out, indeterminate, or
   unsupported gate yields no new provider submission—except the explicitly
   versioned absence-as-`inherit` preference rule—and leaves required in-product,
   task, lane, request, and access truth unchanged.
9. A new request creates at most one optional per-request email member per exact
   recipient/source/plan/step generation; a route current-application creates at
   most one aggregate email member per recipient/application generation.
10. Aggregate email contains one safe exact initial count and no child list; it
    never sends one email per existing request in the sealed application set.
11. Per-request email has an empty render-fact set. Aggregate email has exactly
    one fact—the immutable safe initial count in body only. Subject/preheader/
    body contain no requester, reason, decision explanation, capability, grant/
    provenance/group/grantor, sibling coordinator, Tenant display name, hidden
    scope/count, task state, or source consequence. Per-request body says **An
    access review was assigned to you. Sign in to see current status and available
    actions.** Aggregate body says **You were assigned {count} existing access
    requests.** Neither subject, preheader, nor body claims the work is new, now
    open, still pending, or currently assigned; current truth is resolved only
    after authentication at the destination.
12. Email states that it grants no permission and does not mean access changed;
    subjects/preheaders remain generic, Tenant branding appears only in governed
    From/layout, and every admitted dynamic fact is typed/source-owned.
13. Email contains no Keep/Remove/Approve/Reject/reply command/form/attachment/
    calendar invite/secret-bearing action; GET, HEAD, scanner, preview, forward,
    and page open cause no source/task/preference mutation.
14. **Review access request**, **View access requests**, and **Manage notification
    preferences** are descriptive first-party HTTPS links; possession is non-
    authorizing and wrong-account/Tenant/stale/ended/denied access fails uniformly.
    **Manage notification preferences** resolves only to **Settings →
    Notifications → Access request responsibility** in the authenticated current
    Tenant context.
15. The actual D43 decision and preference mutation require ordinary authenticated
    same-origin deliberate POST with current Active Tenant Assignment, purpose,
    authorization, CSRF/Origin/Fetch-Metadata, expected head, and semantic
    idempotency.
16. Complete deterministic semantic HTML and plain text pass images-off, CSS-off,
    dark/high-contrast, zoom/reflow, keyboard/screen-reader, meaningful-link,
    locale fallback, CJK, RTL/bidi, and common production email-client evidence.
17. D45 sender/profile readiness proves Tenant-owned Resend, verified SPF/DKIM,
    governed DMARC posture, compatible immutable publication/locale/sender/reply,
    purpose isolation, and open/click tracking disabled.
18. Resend Topics/Audiences/Broadcasts/Automations/unsubscribe/dashboard contacts,
    email presence, role, or provider suppression never become D45 preference or
    recipient authority.
19. A hard bounce/complaint/suppression blocks optional email under current
    evidence without changing preference, recipient responsibility, required
    in-product attention, Tasks Hub, request status, or access.
20. Product intent, prepared identity, sealed provider envelope, internal
    provider-message identity, and communication history own durable uniqueness;
    neither Resend nor Inngest's 24-hour idempotency may authorize a new send.
21. Ambiguous provider timeout/5xx/concurrency/payload conflict remains under the
    same sealed identity and reconciles; no new key/send occurs merely because
    the provider window elapsed or the worker retried.
22. Signed Resend webhooks derive scope from the exact connection revision,
    deduplicate provider event identity, tolerate duplicates/out-of-order events,
    correlate unique provider email identity, and preserve unknown/contradictory
    evidence without source effects.
23. UI/operations distinguish `sent`, `delivered`, `delayed`, `bounced`,
    `complained`, `suppressed`, `failed`, and indeterminate; none is shown as
    human read, task complete, request handled, or access decision.
24. Tenant control exists only at **System Messages → Messages → Access review
    requested → Delivery** and shows required in-product locked, optional Tenant-
    default-off/future-only email, readiness, **Personal settings may narrow
    delivery**, and **0 existing requests will be emailed**, with no selected,
    email-eligible, preference-disabled, unavailable, address, personal-preference,
    arbitrary-channel, recipient, reminder, provider, or workflow count/control;
    Tasks Hub is not rendered as a channel row, helper copy says email settings
    never change Tasks Hub or the Access requests lane, and **People & access →
    Access requests** exposes only **Manage email delivery** to deep-link there.
25. **Settings → Notifications → Access request responsibility** shows required
    in-product and a separate
    read-only **Effective email status**, then the stable radio choice **Follow
    my organization's setting** (`inherit`, default) or **Off for me**
    (`disabled`), a local draft, explicit **Save changes** plus Cancel, no
    autosave, receipt-backed persistent inline success/error/ambiguity recovery
    rather than toast-only, no sibling/provider/cohort detail, no administrator
    edit-on-behalf path, and explicit no-responsibility/no-permission effect.
26. Tenant/recipient settings and email/deep-link destination meet shared Base
    Maia/Base UI and WCAG 2.2 AA requirements at 320 CSS pixels/400% zoom, forced
    colors, reduced motion, keyboard/screen reader, visible focus, 44-pixel
    important targets, and programmatic status/error behavior.
27. Route/request close, recipient authorization loss, preference/plan changes,
    suppression changes, and provider acceptance races produce the exact safe
    temporal outcomes described here with no stale access or false send state.
28. D44 recipient fan-out resolves set-wise and remains bounded; provider batch
    optimization preserves same-Tenant scope and each recipient's independent
    address, preference, suppression, payload, provider identity, and outcome.
29. Task, notification, email, workflow, logs, metrics, analytics, search, cache,
    exports, support, AI, and recent copy pass protected-data sink tests; no
    email/body/address/provider detail appears outside its governed purpose.
30. Inngest receives identifiers only after product commit, uses product dispatch
    ledger/work claims, reauthorizes at fire time, and owns no recipient,
    preference, plan, body, address, prepared identity, provider outcome,
    idempotency, reminder, or human wait.
31. New/migrated Tenants/assignments infer no email setting or historical send
    from profiles, roles, current finance preferences, Resend contacts/topics,
    addresses, tasks, D44 membership, prior messages, or other domains.
32. Mixed versions admit only supported catalog/plan/preference/provider
    generations; unknowns are non-dispatchable, and old clients cannot write a
    legacy/global email Boolean that enables D45.
33. Rollback stops new optional email without changing D43/D44/in-product/task/
    lane truth, preserves preferences/plans/intents/evidence/history, recalls no
    accepted mail, and re-enables without duplicate semantic occurrences.
34. Decision log, glossary, ADRs, Phase 12/17, roadmap, OpenSpec, design, tickets,
    implementation, tests, and release evidence use identical step keys,
    precedence, default, preference identity, safe content, future-only behavior,
    provider semantics, channel boundary, and D46 seam. A future channel extends
    the same stable D44 meaning through a reviewed contract generation plus named
    step/profile/adapter, without a new occurrence/key unless meaning changes.
35. D45 creates no reminder, digest, deadline, SLA, escalation, fallback,
    repeat-send, or automatic decision; any later reminder requires D46's exact
    source timing and a distinct stable contract key/proof.

## Initial monitors and response contract

| Signal                                                 | Threshold                                                                                                                                                                                                                                                                                                                                                | Owner                                        | Required response                                                                                                                                                                                                                                  |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `access_d45_email_without_live_contract_total`         | Any                                                                                                                                                                                                                                                                                                                                                      | Communications Platform + Security           | Stop compiler/dispatch, quarantine intent, verify catalog generation/proof, inspect all sends under unknown contract.                                                                                                                              |
| `access_d45_email_without_tenant_enable_total`         | Any                                                                                                                                                                                                                                                                                                                                                      | Phase 17 + Tenant Communications             | Stop dispatch, reconcile plan heads, audit publisher/write paths, preserve in-product/source work.                                                                                                                                                 |
| `access_d45_email_despite_recipient_disabled_total`    | Any                                                                                                                                                                                                                                                                                                                                                      | Privacy + Phase 17                           | Incident review, stop affected step, inspect recipients/complaints, restore self-owned disabled evidence, repair preference precedence and audit.                                                                                                  |
| `access_d45_email_to_ineligible_recipient_total`       | Any                                                                                                                                                                                                                                                                                                                                                      | Security + Phase 12                          | P0; stop delivery, revoke current detail/session/cache, assess disclosure, repair source/recipient fire-time fence.                                                                                                                                |
| `access_d45_cross_tenant_email_total`                  | Any                                                                                                                                                                                                                                                                                                                                                      | Security + Data Platform + Communications    | P0; stop connection/dispatcher, contain provider/history copies, assess all recipients, repair composite scope/connection correlation.                                                                                                             |
| `access_d45_protected_fact_egress_total`               | Any request reason/provenance/capability/source/actor/sibling/Tenant-name body fact/hidden detail, or selected/email-eligible/preference-disabled/unavailable small-cohort count in Tenant UI/email/provider/log/metric/workflow/history                                                                                                                 | Privacy + Security                           | Stop compiler/consumer, contain/delete lawful copies, incident assessment, repair projection/schema/allowlist and sink tests.                                                                                                                      |
| `access_d45_duplicate_semantic_email_total`            | More than one provider envelope/submission per exact source-recipient-step identity                                                                                                                                                                                                                                                                      | Communications Platform                      | Quarantine further attempts, correlate provider evidence, prevent resend, repair product uniqueness/idempotency.                                                                                                                                   |
| `access_d45_aggregate_fanout_total`                    | More than one initial-summary email per recipient/current-application generation                                                                                                                                                                                                                                                                         | Phase 12 + Phase 17                          | Stop compiler, suppress unsent duplicates, reconcile to aggregate identity, audit notification storm impact.                                                                                                                                       |
| `access_d45_backfill_email_total`                      | Any email caused solely by enabling plan/preference or D45 migration for an already-current generation                                                                                                                                                                                                                                                   | Phase 17 + Privacy                           | Stop dispatcher, inspect affected recipients, repair effective-time/source-occurrence filter; do not delete source work.                                                                                                                           |
| `access_d45_tracking_enabled_total`                    | Any prepared/submitted D45 email with open or click tracking active                                                                                                                                                                                                                                                                                      | Privacy + Tenant Email Operations            | Disable optional step/profile, quarantine unsubmitted work, rotate to tracking-off purpose profile, assess collected telemetry.                                                                                                                    |
| `access_d45_get_or_scan_mutation_total`                | Any GET/HEAD/scanner/preview/email-open causes source/task/preference mutation                                                                                                                                                                                                                                                                           | Security + Phase 12                          | P0; disable link/action, reverse only through governed source adjudication, repair protected-action boundary.                                                                                                                                      |
| `access_d45_preference_override_total`                 | Any Tenant/admin/support/provider changes another person's preference, overrides `disabled`, or `inherit` bypasses Tenant/contract off                                                                                                                                                                                                                   | Privacy + Security                           | Stop writer, restore current preference/plan from receipts, audit sends, add authority/precedence regression.                                                                                                                                      |
| `access_d45_provider_ambiguity_resend_total`           | Any new provider key/send while prior sealed envelope remains indeterminate without new source occurrence                                                                                                                                                                                                                                                | Communications Platform                      | Stop retries, quarantine envelope, reconcile signed/local/provider evidence, repair retry classifier.                                                                                                                                              |
| `access_d45_webhook_scope_or_duplicate_total`          | Any unsigned/wrong-connection/cross-scope event accepted or duplicate event changes outcome twice                                                                                                                                                                                                                                                        | Security + Communications Platform           | Disable endpoint/connection, contain state, replay from verified evidence, repair signature/scope/dedupe reducer.                                                                                                                                  |
| `access_d45_delivery_mislabeled_read_total`            | Any sent/delivered/opened/clicked state surfaces as human read/task complete/request handled                                                                                                                                                                                                                                                             | Phase 17 + UX                                | Correct projection with attributable evidence, remove engagement inference, add terminology tests.                                                                                                                                                 |
| `access_d45_suppression_bypass_total`                  | Any provider I/O after current blocking suppression/complaint/hard-bounce proof                                                                                                                                                                                                                                                                          | Privacy + Tenant Email Operations            | Stop optional step, preserve suppression, investigate stale cache/worker, never auto-remove provider suppression.                                                                                                                                  |
| `access_d45_email_failure_changed_source_total`        | Any email failure changes D43/D44/task/in-product/access truth                                                                                                                                                                                                                                                                                           | Security + Phase 12 + Phase 17               | Disable coupling, restore source projection from authoritative receipts, repair transaction/event boundaries.                                                                                                                                      |
| `access_d45_dispatch_lag_seconds`                      | p95 >300s for 15m with at least 50 eligible members, or any >1800s                                                                                                                                                                                                                                                                                       | Communications Platform + Workflow Platform  | Keep in-product/source active, inspect ledger/claims/connection, reconcile exact members; never broaden/repeat.                                                                                                                                    |
| `access_d45_family_plan_split_total`                   | Any plan preview/publication/read observes different On/Off values for the two exact D44 `staff_email` slots, or publishes On while either exact contract/publication/readiness dependency set is incompatible                                                                                                                                           | Phase 17 + Tenant Communications             | Block publication/dispatch, restore the last complete family head, inspect compiler/read models and mixed-version clients, preserve independent contract occurrence/history identities.                                                            |
| `tenant_resend_connection_and_d45_bounce_rate`         | Either the provider-calculated Tenant-connection rate or D45 diagnostic rate reaches the release-pinned provider-account limit (currently >=4%), or the provider restricts the connection, whichever occurs first                                                                                                                                        | Tenant Email Operations + Phase 17           | Pause optional D45 delivery for the affected connection, invoke the connection-wide delivery incident posture, inspect D45 and sibling-source destination quality separately, follow provider recovery, and keep in-product/source work unchanged. |
| `tenant_resend_connection_and_d45_spam_complaint_rate` | Either the provider-calculated Tenant-connection rate or D45 diagnostic rate reaches the release-pinned provider-account limit (currently >=0.08%), any provider restriction occurs, or any D45 complaint arrives before the D45 denominator is large enough for that rate (currently <1,250 messages in the same pinned window), whichever occurs first | Tenant Email Operations + Privacy + Phase 17 | Pause optional D45 delivery, preserve complaint suppression, inspect D45 consent/preference/copy/frequency and sibling-source connection reputation separately, follow provider recovery, and require readiness re-proof before re-enable.         |
| `access_d45_effective_email_enable_rate`               | Observe only; no success target until representative adoption evidence                                                                                                                                                                                                                                                                                   | Product Research                             | Learn whether Tenant activation plus self-owned opt-out is useful/comprehensible; never coerce enablement or override `disabled`.                                                                                                                  |
| `access_d45_user_comprehension_rate`                   | Below 90% of at least 20 representative tests correctly identify email as optional/future-only/non-authorizing                                                                                                                                                                                                                                           | Product Research + UX + Security             | Revise hierarchy/copy, retest before expansion; do not solve with mandatory email or extra modal warnings.                                                                                                                                         |

Provider limits, numerator/denominator rules, and measurement windows are pinned
from official provider terms in the build/release evidence and reverified at
every build/release. The current pins are bounce >=4% and spam/complaint >=0.08%;
they are not timeless Core constants. If Resend changes them, publish the new
monitored contract/version with evidence rather than silently changing product
semantics. Connection-wide rates protect shared Tenant reputation; D45-specific
diagnostic rates preserve source attribution without treating sibling mail as
D45 behavior.

No monitor may add/enable a recipient, channel, plan, preference, reminder, or
fallback; resend under a new identity; change request/task/access state; remove
provider suppression; or expose protected data. Automated response may pause an
optional email step, quarantine provider work, or reconcile the same product-
owned identity.

## D46 — should an unresolved access request receive an automatic reminder?

### Why this needs a separate decision

Hope Mission enabled D45 email, and Maria's personal preference remains
`inherit` rather than `disabled`. Jordan's request generated one in-product item,
one Tasks Hub assignment, and one initial email. After those initial attention
paths, the request remains pending. The source lane remains visible and no access
has changed.

Current IAM/CMS products often send reminders, but their reminders are tied to
an explicit review period, request expiration, or task due date. D43 currently
has no deadline, SLA, urgency, business calendar, or automatic terminal action.
D46 therefore cannot treat “modern products send reminders” as proof of an
arbitrary Core timer.

### Option 1 — no automatic reminder in v1 — recommended

Keep the persistent Access requests lane, personal Tasks Hub assignment,
required source-actionable in-product item, optional one-time D45 email, visible
age, and named age/ownerless monitors. Send no repeat notification automatically.

**Benefit:** no invented deadline, timer engine, timezone/business-calendar
ambiguity, fatigue, duplicate delivery, or false escalation. This is the least-
brittle posture while Core gathers real volume/response evidence.  
**Cost:** coordinators who overlook every initial surface receive no automated
nudge; Tenant access governance must monitor aging work.

### Option 2 — one fixed product-wide reminder after seven calendar days

While the exact request and coordinator generation remain current, create one
new source-owned reminder occurrence after seven calendar days. D46 does not
select its presentation or delivery channels; reminder email would require a
separate channel-step decision and cannot reuse D45's initial-email authority.
No second reminder, escalation, or automatic decision occurs.

**Benefit:** simple bounded nudge without a configurable cadence.  
**Cost:** seven calendar days is not evidence-backed, may not match local working
patterns, and adds scheduler/race/recipient-change semantics.

### Option 3 — one Tenant-selected reminder from bounded choices

An authorized Tenant chooses **Off**, **3 days**, **7 days**, or **14 days** for
one reminder. D46 selects only whether/when the source occurrence exists; its
presentation/delivery channels require separate governing decisions.

**Benefit:** modest flexibility for ministries with different operating rhythms.  
**Cost:** another setting, preview/publication/version, timezone definition,
tests, migration, and support burden before demand is proven; presets remain
product judgments.

### Recommendation

**My recommendation is Option 1 — no automatic reminder in v1.** D44/D45
already provide four non-destructive discovery/
attention paths, and no current evidence defines a truthful timer. Monitor aging
and comprehension; if evidence establishes an exact source-owned temporal
requirement, return to D46 and add one bounded reminder meaning through a reviewed
stable key rather than starting with a generic schedule/escalation engine.

Which D46 policy should Core record: **Option 1 — no automatic reminder in v1
until a source-owned temporal requirement exists**, **Option 2 — one fixed
seven-day reminder**, or **Option 3 — one Tenant-selected reminder from Off,
3, 7, or 14 days**? You may amend any option.

## Evidence limits

- Entra, Okta, SailPoint, Salesforce, GitHub, Contentful, and Blackbaud show
  combinations of in-product work and email; none proves Core's Tenant-default-
  off plus recipient-opt-out policy is universally optimal.
- Entra commonly defaults campaign email on; Core differs because D44 already
  guarantees three in-product/source work surfaces and D43 is sensitive. This is
  an explicit product judgment, not misreported external practice.
- Resend consent/unsubscribe guidance often discusses marketing/bulk mail. D45
  uses it as preference/deliverability evidence, not as a legal classification.
- Resend tracking/idempotency/webhook/domain/threshold facts are current provider
  behavior and must be version-pinned/reverified during implementation.
- Tracking-off may require a purpose-specific Tenant subdomain/profile; no
  production evidence yet proves the operational burden is acceptable.
- No source proves exact safe copy, subject, count, sender/reply posture,
  recipient disablement/effective-email rate, delivery SLO, or support burden for nonprofit
  missions organizations.
- No source proves D43 needs a reminder or establishes a fixed seven-calendar-
  day rule or Tenant presets of Off/3/7/14 days; D46 exposes that uncertainty
  instead of treating a vendor default as fact.
- Future push/chat/SMS sections identify required proof categories, not a
  commitment that Core will implement those channels.

## Final research disposition

**Accept with required amendments.** Add one optional, immediate email step to
each exact D44 contract only through Phase 6/17, with the Tenant Delivery Plan
off by default. Once an authorized Tenant enables it, an exact recipient follows
that choice through `inherit`/absence unless their self-owned preference is
`disabled`. Then independently re-prove current D43/D44 source and authority,
verified contact, suppression, locale/publication, tracking-off sender/profile,
Tenant Resend readiness, and durable semantic identity.

Keep content generic, links inert and authenticated, provider outcomes exact,
required in-product/task/lane independent, changes future-only, and every future
channel separately ratified. This adds useful reach without a second workflow,
authorization path, or brittle generic channel abstraction.
