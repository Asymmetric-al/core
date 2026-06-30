# PRD: Inngest Durable Workflow Executor

Status: ready-for-agent

Last updated: 2026-06-08

## GitHub issue

Parent planning issue: #285

## Problem Statement

Asymmetric.al needs durable background workflow execution for donations, Stripe
webhook follow-up, Resend inbound email processing, Support Hub routing,
operator recovery, and future CRM/document automation without turning workflow
orchestration into the product source of truth.

Today the repo already has important product-owned patterns: donation saga and
outbox processing, Resend webhook storage and replay behavior, tenant-scoped
Support Hub routing, server-side package boundaries, audit logs, and Mission
Control operational surfaces. Those patterns protect donor trust, tenant
isolation, payment accuracy, and support staff clarity. The Inngest integration
must strengthen those patterns by making retryable work durable, inspectable,
and easier to recover, not replace them with fire-and-forget jobs or broad
workflow payloads.

The product also serves many tenants under one platform-operated Inngest bill.
That means workflow design must preserve tenant boundaries inside product
records, event envelopes, concurrency keys, work claims, audit entries, and
Mission Control summaries. Tenants are product boundaries, not separate Inngest
apps or billing environments.

## Solution

Add an Inngest-backed durable workflow executor layer that accepts small,
tenant-scoped workflow event envelopes from product-owned dispatch requests.
Each product area keeps its own authoritative records and idempotency keys,
while the shared workflow dispatch ledger records that work must be handed to
workflow orchestration and recovered if handoff fails.

The initial implementation should focus on high-value, already-identified
workflow paths:

- one-time donation saga recovery and Stripe payment follow-up
- recurring donation lifecycle follow-up through Stripe Billing events
- verified and tenant-resolved Resend inbound email content retrieval
- Support Hub routing after inbound body retrieval
- Support Hub message move and bulk move recovery behavior where durable work
  is useful
- Mission Control workflow run summaries and notification policy
- shared dispatch recovery scans, product work claims, and retry-safe audit

Inngest functions should run behind existing server-side boundaries, load
current authorized product state inside durable steps, use per-tenant and
per-work-item flow control, and record product-owned summaries. Workflow events
should carry identifiers and safe routing metadata only.

## User Stories

1. As a donor, I want one-time donations to begin payment processing
   immediately, so that I know quickly whether Stripe accepted the payment
   attempt or needs another action.
2. As a donor, I want recurring donations to use Stripe Billing and
   subscription-aware flows, so that renewal billing follows Stripe-supported
   best practices.
3. As a donor using ACH Direct Debit, I want the checkout to tell me the honest
   current state, so that I do not confuse mandate acceptance or processing with
   final settlement.
4. As a donor, I want card, debit, wallet, instant bank, and ACH payment choices
   to share one clean checkout experience, so that giving feels consistent.
5. As a donor, I want donation status to update accurately after Stripe final
   payment events, so that my giving history is truthful.
6. As a donor, I want failed or pending payment work to recover without me
   submitting duplicate gifts, so that retry behavior does not create duplicate
   charges.
7. As a tenant admin, I want payment workflow recovery to preserve Stripe as the
   payment authority, so that product records do not invent a payment outcome.
8. As a tenant admin, I want workflow processing to be tenant-scoped, so that one
   tenant's workload cannot see or affect another tenant's data.
9. As a tenant admin, I want one shared workflow infrastructure bill to still
   enforce tenant boundaries, so that platform operations stay simple without
   weakening security.
10. As a tenant admin, I want workflow notifications to be configurable, so that
    urgent failures can alert staff and routine retryable failures can stay
    visible without noise.
11. As a staff operator, I want Mission Control to show workflow run summaries,
    so that I can see useful recovery status without reading raw step logs.
12. As a staff operator, I want product records to remain authoritative, so that
    workflow retries cannot rewrite business truth incorrectly.
13. As a staff operator, I want a dispatch recovery scan, so that a failed
    immediate handoff to Inngest is not lost.
14. As a developer, I want a shared workflow dispatch ledger, so that CRM,
    donations, email, documents, and future workflows do not each invent a
    separate handoff table.
15. As a developer, I want product work claims, so that manual replay, recovery
    scans, and Inngest retries cannot run the same business effect at the same
    time.
16. As a developer, I want small workflow event envelopes, so that secrets, full
    records, payment internals, email bodies, attachments, rendered documents,
    and broad CRM payloads do not enter workflow events.
17. As a developer, I want stable event names and schema versions, so that
    workflows can evolve without breaking old dispatch requests.
18. As a developer, I want event IDs and product idempotency keys to have
    separate responsibilities, so that workflow dedupe does not become the only
    protection against duplicate business effects.
19. As a developer, I want non-deterministic provider calls inside durable
    steps, so that retries resume safely after process restarts.
20. As a developer, I want flow-control keys by tenant and work item, so that
    one tenant or one noisy record cannot overload shared workflow capacity.
21. As a Resend webhook receiver, I want signatures verified before storage or
    workflow dispatch, so that untrusted webhooks cannot enter product state.
22. As a Resend webhook receiver, I want verified tenant-safe events stored
    before Inngest dispatch, so that provider acceptance does not depend on a
    later workflow handoff.
23. As a Resend webhook receiver, I want to return success after durable
    tenant-safe storage even if immediate workflow dispatch fails, so that the
    provider is not forced to replay an already accepted event.
24. As a Resend webhook receiver, I want unresolved or ambiguous inbound tenant
    resolution to fail closed, so that the product never guesses which tenant
    owns an email.
25. As a support agent, I want inbound emails to wait for body retrieval before
    becoming Support Hub messages, so that I never see empty support messages.
26. As a support agent, I want attachments to be visible as pending, retrying,
    failed, or available, so that missing attachments are clear without blocking
    the support conversation.
27. As a support agent, I want to retry failed attachment retrieval through the
    product, so that I can recover support context without direct Resend access.
28. As a support agent, I want inbound email body retrieval failures to keep a
    visible placeholder, so that failed inbound mail is not hidden or deleted.
29. As a support agent, I want only known Support Hub routes to route
    automatically, so that routine mail flows quickly and unknown routes get
    reviewed.
30. As a support agent, I want lightweight routing review for tenant-owned
    emails that do not match a known route, so that future similar emails can
    route automatically.
31. As a support agent, I want to save a reviewed exact recipient or alias route
    and immediately continue routing the same email, so that one review fixes
    the current email and future mail.
32. As a support agent, I want tenant-domain default routes to require explicit
    confirmation, so that a broad catch-all route is never created by accident.
33. As a tenant admin, I want to view, edit, disable, and delete saved inbound
    routing rules for my tenant, so that routing policy remains tenant-owned.
34. As a support agent, I want route changes to affect pending email but not
    silently move already routed messages, so that historical routing remains
    auditable.
35. As a support agent, I want to move an already routed Support Hub message or
    conversation only through an explicit audited action, so that corrections are
    visible and intentional.
36. As a support agent, I want move reason entry to be short free text, so that
    I can explain a routing correction without fighting preset categories.
37. As a support agent, I want move reason validation to be light, so that a
    quick correction is not delayed by overly strict text rules.
38. As a support agent, I want a moved message to retain labels, priority,
    status, and snooze timing by default, so that moving changes the inbox, not
    the work state.
39. As a support agent, I want resolved moves to ask for a quiet confirmation,
    so that I notice when I am moving closed work without being blocked.
40. As a support agent, I want the original inbox to keep a quiet moved-to
    marker, so that history remains clear without leaving a duplicate replyable
    message.
41. As a support agent, I want the destination inbox to show the message normally
    with a quiet moved-from marker, so that staff can work it without a loud
    special mode.
42. As a support agent, I want moved messages to keep their assignee only when
    the assignee can access the destination inbox, so that assignments do not
    point to someone who cannot work the item.
43. As a support agent, I want cleared-assignee moves to leave the message
    unassigned, so that a move does not secretly run round-robin assignment.
44. As a support agent, I want to bulk move multiple messages, so that inbox
    cleanup and routing corrections are efficient.
45. As a support agent, I want bulk moves to use the same safeguards as single
    moves, so that speed does not reduce tenant checks or audit quality.
46. As a support agent, I want one shared required reason for a bulk move, so
    that I do not have to type the same explanation for every item.
47. As a support agent, I want every item moved in a batch to keep item-level
    audit evidence, so that bulk work remains reviewable per message.
48. As a support agent, I want a bulk move to partially succeed, so that one bad
    or stale item does not block every valid move.
49. As a support agent, I want failed bulk-move items to stay in their original
    inbox, so that the product does not create unclear half-moved state.
50. As a support agent, I want a Retry failed action for a partially failed bulk
    move, so that I can recover only the failed items.
51. As a support agent, I want Retry failed to reuse the original bulk move
    reason, so that I do not explain the same correction twice.
52. As a support agent, I want retry audit to link to the original batch, so that
    later review can distinguish the original batch from retry attempts.
53. As a support agent, I want staff-visible failure reasons to be safe and
    understandable, so that I know what happened without seeing secrets,
    workflow internals, or cross-tenant details.
54. As a staff user, I want workflow UI to use existing design tokens and Support
    Hub patterns, so that new recovery controls feel consistent with Mission
    Control.
55. As a platform operator, I want unsupported Stripe events stored and marked
    ignored with a reason, so that provider data is retained without creating
    false alerts.
56. As a platform operator, I want dead-letter workflow states to surface in
    Mission Control, so that staff can review real stuck work.
57. As a platform operator, I want repeated tenant-resolution failures to become
    platform operations issues, so that candidate tenants never receive guessed
    email content.
58. As a platform operator, I want run summaries instead of full workflow step
    mirrors, so that operational status is useful without duplicating Inngest.
59. As a product owner, I want the first email workflow slice limited to inbound
    body, attachment, and Support Hub routing work, so that the first release
    stays focused.
60. As a product owner, I want outbound delivery tracking and suppression
    processing to stay on the current path until separately approved, so that
    the Inngest rollout does not become too broad.

## Implementation Decisions

- Product records remain authoritative. Workflow orchestration executes durable
  recovery and follow-up work after product-owned records exist; it does not own
  donations, email, CRM state, document state, permissions, tenant data, or
  audit truth.
- Tenants are represented by tenant identifiers and product authorization. They
  are not represented by separate Inngest apps, environments, or billing
  accounts.
- A shared workflow dispatch ledger should be introduced as the product-owned
  handoff record for workflow orchestration. Product areas create or reuse
  dispatch requests; Inngest receives only the safe event envelope that points
  back to those records.
- A dispatch recovery scan should find dispatch requests that were stored but
  not successfully handed to Inngest. The recovery scan is a handoff repair
  mechanism, not the authority for business outcomes.
- Product work claims should guard each retryable business effect. Inngest
  concurrency and throttling reduce pressure, but work claims decide whether a
  specific product item may be attempted now.
- Workflow events should use a standard envelope with tenant ID, workflow name,
  durable product record ID, dispatch request ID, schema version, and safe audit
  context. They must not include secrets, full records, email bodies,
  attachments, rendered documents, bank details, Stripe client secrets, payment
  internals, or broad CRM payloads.
- Workflow event names should follow product-domain object/action language and
  should not be named after app route locations.
- One-time donation recovery should process one donation saga outbox row per
  workflow run. A scanner may find due rows, but the per-row function should
  claim the row before Stripe work.
- One-time donation checkout should still create or retrieve the Stripe payment
  object immediately when possible. Inngest should replace recovery/backfill
  work first, not the donor-facing payment creation moment.
- Recurring donations should use Stripe Billing and subscription-oriented flows.
  Inngest may process internal follow-up, reconciliation, notifications, and
  summaries, but it must not become the recurring billing engine.
- Stripe webhooks should verify signatures, store provider events durably, and
  return success once the product safely owns the event. Immediate Inngest
  dispatch failure after storage should be recovered by product dispatch
  recovery, not by forcing provider replay.
- Stripe webhooks remain the source for final payment status updates. The
  product must distinguish payment authorization checkpoints from payment
  finality, especially for ACH Direct Debit and other delayed-notification
  payment methods.
- ACH Direct Debit should use Stripe-supported verification paths. Routing
  number and account number formatting alone is not enough to mark the bank
  account usable; Stripe verification or required donor verification is the
  useful checkpoint.
- Donation checkout should remain visually consistent across payment choices,
  with payment-rail-specific status language only where timing differs.
- Resend webhook signature verification, raw request handling, tenant
  resolution, and durable email event storage should stay in the product webhook
  boundary.
- The first Inngest email slice should move only verified, exactly
  tenant-resolved inbound email body retrieval, attachment retrieval, inbound
  message completion, and Support Hub routing into durable workflow steps.
- Outbound delivery status, suppression, bounce, complaint, and send-log
  handling should stay on the current path until separately approved.
- A verified tenant-safe Resend event may return success after durable storage
  even if immediate Inngest dispatch fails. Unverified, unpersisted,
  misconfigured, unresolved, or ambiguous tenant cases may remain non-2xx so the
  provider can retry safely.
- Inbound email placeholders should be created from verified metadata before
  workflow dispatch when tenant ownership is known. Placeholders must not store
  body text, rendered HTML, attachment bytes, signed attachment URLs, or Support
  Hub rows.
- Support Hub routing requires the inbound email body. Attachments may remain
  pending, retrying, failed, or added later.
- Attachment and body retries must run through product authorization, product
  work claims, and workflow dispatch. Staff UI must never call Resend directly
  or receive provider secrets, signed URLs, raw provider payloads, or attachment
  bytes as part of a retry request.
- Inbound routing review should be used only when tenant-owned email does not
  match a known route or matches multiple safe candidate routes. New sender,
  unusual subject, or attachment presence alone should not require review.
- Any authenticated support agent in the owning tenant may save a reviewed
  route. Saved routes must remain tenant-scoped and audit logged.
- Reviewed routes default to exact recipient or alias scope. Tenant-domain
  defaults require explicit staff choice and extra confirmation.
- Tenant admins may view, edit, disable, and delete active saved inbound routes
  for their own tenant. Deleting a route removes the future active rule, not
  historical audit.
- Pending inbound email should use the latest active route when routing resumes.
  Already routed Support Hub messages keep their historical routing audit trail.
- Already routed Support Hub message moves are explicit audited actions. Route
  changes must not silently move existing messages.
- Support message move reason is required, free text only, lightly validated,
  and stored with each move audit entry.
- Support message moves do not send automatic staff email in the first
  implementation. They appear in Support Hub activity and history.
- Move markers use quiet existing Support Hub activity styling and shared design
  tokens. The original inbox keeps a moved-to marker; the destination inbox
  shows the message normally with a moved-from marker.
- Moving a message keeps assignee only if the assignee can access the
  destination inbox. Otherwise the message becomes unassigned in the destination
  queue.
- Moving a message keeps labels, priority, current status, and snooze timing by
  default. Resolved messages require quiet confirmation before move.
- Bulk Support Hub moves are allowed but must apply the same tenant,
  authorization, reason, audit, assignment, label, priority, status, snooze, and
  activity safeguards as single-message moves.
- Bulk moves use one shared required reason copied into every item-level audit
  entry. Each item audit entry records that it came from a batch move and
  includes a stable batch operation identifier.
- Bulk moves may partially succeed. Successful item moves stay moved; failed
  items stay unchanged in their original inbox.
- Retry failed retries only failed items, reuses the original bulk move reason,
  runs through product server authorization and work claims, links audit to the
  original batch operation, and never reruns successful item moves.
- For a failed item later moved by Retry failed, the visible moved-at time should
  reflect the actual successful move time. The audit should also retain the
  original batch operation time and retry attempt time.
- Mission Control should show workflow run summaries and notification policy
  status, not raw Inngest step logs. Inngest remains the detailed orchestration
  timeline.
- Workflow notification policy should prioritize donor trust, money integrity,
  tenant-wide sync health, and stuck infrastructure. Routine retryable failures
  should remain visible without becoming urgent alerts by default.
- New workflow UI must use existing Mission Control and Support Hub patterns,
  shared UI primitives, and design tokens. It must not introduce hardcoded
  colors, loud banners, custom route-specific controls, or inconsistent visual
  treatment.

### Deep Module Opportunities

- Workflow Dispatch Ledger: one stable interface for creating, reusing,
  dispatching, recovering, and summarizing workflow handoff requests.
- Workflow Event Envelope: one validator/builder for identifier-only
  tenant-scoped workflow events.
- Product Work Claims: one reusable product-owned concurrency guard for manual
  replay, recovery scans, and workflow retries.
- Workflow Run Summary Projector: one product-facing summary layer that stores
  useful status without mirroring raw Inngest step logs.
- Workflow Notification Policy Evaluator: one tenant/admin-configurable policy
  module that decides what becomes urgent notification versus visible status.
- Donation Workflow Adapter: one boundary that turns due donation saga rows and
  Stripe webhook records into safe workflow dispatch requests.
- Resend Inbound Workflow Adapter: one boundary that turns verified
  tenant-resolved inbound email records into body, attachment, and Support Hub
  routing work.
- Support Hub Routing and Move Service: one audited service for reviewed routes,
  saved route management, single-message moves, bulk moves, and retry failed
  behavior.
- Provider Webhook Acceptance Helpers: shared acceptance and recovery rules for
  Stripe and Resend webhooks after durable product storage.

## Testing Decisions

- Tests should focus on external product behavior: state transitions, provider
  acknowledgement behavior, idempotency, tenant boundaries, audit output, and
  staff-visible status. They should not assert internal step ordering unless
  the order is part of a product contract.
- Workflow dispatch ledger tests should prove create/reuse behavior, immediate
  dispatch failure recording, recovery eligibility, and duplicate handoff
  prevention.
- Product work claim tests should prove one active claim per product work item,
  safe claim reuse, stale claim recovery, tenant scoping, and no duplicate
  business effects under replay.
- Workflow event envelope tests should prove schema validation, identifier-only
  payloads, schema version handling, and rejection of sensitive fields.
- Donation workflow tests should prove one-time donation saga recovery preserves
  product idempotency, Stripe idempotency key behavior, retry/dead-letter
  transitions, and honest payment status.
- Stripe webhook tests should prove signature verification precedes storage,
  stored events can be acknowledged even when workflow dispatch fails, and
  unsupported events are stored as ignored with reasons.
- Recurring donation tests should prove subscription/invoice events update
  product state through Stripe Billing lifecycle semantics rather than manual
  one-time renewal loops.
- ACH tests should prove checkout and status surfaces distinguish bank account
  verification, processing, required donor action, failed, and completed states.
- Resend webhook tests should prove raw-body signature verification, duplicate
  event replay safety, tenant resolution fail-closed behavior, and stored-event
  acknowledgement semantics.
- Inbound email workflow tests should prove body retrieval is required before
  Support Hub routing, attachment retrieval does not block routing, failed body
  retrieval keeps a visible placeholder, and staff retries reuse active work.
- Support Hub routing tests should prove known route auto-routing, routing
  review only for unknown or ambiguous safe routes, save-and-continue behavior,
  exact recipient default, domain-default confirmation, and tenant-scoped route
  management.
- Support message move tests should prove tenant-owned source/destination
  checks, required reason, light validation, audit append behavior, retained
  labels/priority/status/snooze, resolved confirmation, assignee retention or
  clearing, and quiet markers.
- Bulk move tests should prove per-item idempotency, item-level audit entries,
  shared reason copying, batch markers, partial success, safe failure reasons,
  and Retry failed behavior.
- Mission Control summary tests should prove run summaries show useful status,
  exclude raw step logs and secrets, and honor notification policy defaults.
- UI tests should prove retry/move controls use existing interaction patterns,
  remain accessible, and do not introduce inconsistent visual treatments.
- Prior art exists in the repo for donation saga unit tests, Resend webhook
  replay/idempotency tests, Support Hub adapter and mutation tests, route handler
  boundary tests, and Mission Control smoke flows. New tests should follow those
  styles rather than inventing a separate testing layer.

## Out of Scope

- Implementing runtime code, package installation, migrations, routes, or env
  variables in the current grill/to-PRD session.
- Making Inngest the source of truth for donations, email, CRM state, documents,
  tenant data, payment status, or audit history.
- Creating a separate Inngest app, environment, or billing setup per tenant.
- Putting secrets, full records, email bodies, attachments, rendered documents,
  payment internals, bank details, Stripe client secrets, or broad CRM payloads
  into workflow events.
- Redesigning donor checkout away from the current immediate one-time payment
  behavior without a separate Stripe checkout product decision.
- Building recurring donation billing loops from repeated one-time
  PaymentIntents.
- Moving all Resend webhook behavior into Inngest in the first email slice.
- Sending automatic staff email for routine Support Hub message moves.
- Building a raw Inngest step-log mirror inside Mission Control.
- Exposing provider internals, signed attachment URLs, workflow stack traces, or
  cross-tenant details in staff-visible recovery text.
- Using public, donor, or missionary surfaces for staff-depth workflow
  operations that belong in Mission Control.

## Further Notes

- This PRD is grounded in the current grill decisions, OpenSpec platform
  boundaries, existing donation saga/outbox behavior, existing Resend webhook
  behavior, existing Support Hub routing/move planning, and official Inngest,
  Stripe, and Resend guidance loaded during the planning session.
- Before implementation starts, create or update the matching OpenSpec change
  so product intent, proposed schema changes, workflow runtime adoption, and
  rollout phases are explicitly tracked.
- Break this PRD into implementation issues before coding. The first slices
  should be small enough for independent agents: dispatch ledger foundation,
  donation recovery adapter, Resend inbound adapter, Support Hub routing review,
  Support Hub move/bulk move behavior, Mission Control summaries, and
  notification policy.
- For every implementation issue, run the repo's data-boundary checks and keep
  app route handlers thin with business logic in shared server-side packages.
- For Next.js route or UI implementation, read the installed Next.js docs for
  the repo's exact version before coding.
