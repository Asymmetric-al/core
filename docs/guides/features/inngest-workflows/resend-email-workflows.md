# Resend Email Workflow Decisions

## Purpose

This guide records the Resend email workflow decisions made during the Inngest
workflow executor planning grill. It keeps webhook acknowledgement, tenant
resolution, inbound Support Hub routing, replay behavior, and workflow event
payloads aligned with the current product boundaries.

This is a planning guide, not an implementation. Do not treat it as approval to
add Inngest runtime code, migrations, environment variables, routes, or package
dependencies without an OpenSpec change and implementation plan.

## Triggers

Use this guide when planning or implementing:

- Resend webhook handling for outbound delivery events.
- Resend inbound email handling for `email.received`.
- Support Hub routing from inbound email.
- Email suppression updates from provider events.
- Workflow dispatch, retry, replay, or operator summaries for email events.

## Current Evidence

- `packages/api/src/email/webhooks/resend.ts` verifies the Resend signature,
  resolves the tenant, inserts `email_events`, updates suppressions and send
  logs, fetches inbound body and attachments, upserts `email_inbound_messages`,
  and routes inbound messages to Support Hub.
- `docs/guides/features/resend-integration.md` already documents replay behavior
  for `email_events`, `email_suppressions`, and `email_inbound_messages`.
- `email_events` is currently tenant-scoped and records provider event metadata.
  `email_inbound_messages` stores inbound email metadata and parsed content.

## Resend Sources Of Truth

Use current Resend docs before implementation. The decisions below were checked
against these Resend guidance areas:

- [Resend Receiving Emails](https://resend.com/docs/dashboard/receiving/introduction):
  inbound events can be routed by the `to` field; webhook payloads include
  metadata, while full content and attachments are retrieved through Resend APIs.
- [Resend Managing Webhooks](https://resend.com/docs/webhooks/introduction):
  webhook endpoints should respond with `HTTP 200 OK` after the event is
  successfully delivered to the application; Resend retries when it does not
  receive `200 OK`.
- [Resend Managing Webhooks](https://resend.com/docs/webhooks/introduction):
  webhook delivery is at-least-once and not guaranteed to arrive in order, so
  duplicate handling and replay must be idempotent.
- [Resend Verify Webhooks Requests](https://resend.com/docs/webhooks/verify-webhooks-requests):
  verify webhook signatures with the raw request body before trusting the
  payload.
- [Resend Storing Webhooks Data](https://resend.com/docs/dashboard/webhooks/how-to-store-webhooks-data):
  store webhook data when the application needs retention, audit, replay, or
  automated workflow behavior.

## Inngest Sources Of Truth

Use current Inngest docs before implementation. The decisions below were checked
against these Inngest guidance areas:

- [Inngest Steps](https://www.inngest.com/docs/learn/inngest-steps): wrap
  provider calls, database writes, and other failure-prone work in retriable
  steps with stable step IDs.
- [How Inngest functions are executed](https://www.inngest.com/docs/learn/how-functions-are-executed):
  split slow webhook follow-up into durable steps that can resume after failure
  instead of redoing successful work.
- [Inngest Concurrency](https://www.inngest.com/docs/functions/concurrency):
  use flow-control keys during implementation for tenant-safe limits and to
  avoid duplicate concurrent work on the same inbound email.

## Workflow Steps

### Chosen Direction

1. Reuse the existing email event storage as the workflow handoff anchor instead
   of adding a separate raw Resend webhook ledger in the first Inngest email
   slice.
2. Treat the email event record as the durable product-owned record for Resend
   provider events that can be processed by workflow orchestration.
3. Add processing and dispatch fields to the existing product-owned email event
   model during implementation if it becomes the workflow handoff anchor.
4. Do not put email bodies, rendered HTML, attachments, API keys, webhook
   secrets, or broad raw provider payloads into Inngest events.
5. Workflow events should carry only safe identifiers, such as tenant ID, email
   event ID, provider event ID, inbound message ID when available, dispatch
   request ID, and schema version.
6. Keep unresolved or ambiguous inbound tenant resolution as a tenant-safe
   Resend retry path. Do not guess a tenant, use a fake tenant, route to
   Support Hub, or dispatch tenant workflow work when the product cannot prove
   exactly one tenant.

### First Inngest Email Slice

1. Move only the `email.received` slow path into Inngest first:
   - received-email body retrieval from Resend.
   - attachment metadata or download URL retrieval from Resend when needed.
   - completion of the `email_inbound_messages` record.
   - Support Hub routing and bridge updates.
2. Keep signature verification, raw request reading, tenant resolution, and the
   durable email event record in the Resend webhook route.
3. After tenant ownership is known, create or update a minimal inbound email
   placeholder from verified Resend webhook metadata before dispatching Inngest.
   The placeholder may include tenant ID, Resend email ID, event type, sender,
   recipients, subject, received time, message headers from metadata when
   present, and attachment count or metadata.
4. Do not store body text, rendered HTML, attachment bytes, signed attachment
   download URLs, or Support Hub rows in the placeholder.
5. Keep outbound delivery status updates, suppression updates, bounced email
   handling, complained email handling, and send-log updates on the current path
   for the first slice.
6. Do not acknowledge an inbound webhook as workflow-accepted until the event is
   verified, tenant ownership is known, and the email event record is stored.
7. Do not put the email body, parsed HTML, attachments, signed attachment URLs,
   API keys, webhook secrets, or broad raw event data into the Inngest event.
8. If the Resend content or attachment API fails inside the workflow, retry the
   durable step where safe and keep the email event visible as pending or failed
   according to the workflow run summary.

### Body Retrieval Failure

1. If received-email body retrieval from Resend fails, keep the inbound email
   placeholder pending and retry the body retrieval in the durable workflow.
2. Do not create or thread a Support Hub message from subject, sender, or
   placeholder metadata alone.
3. The pending placeholder may remain visible as an inbound email awaiting body
   retrieval, but it should not appear as a complete conversation message.
4. Retry body retrieval through workflow steps so transient Resend API failures,
   network failures, or platform restarts do not lose progress.
5. Keep body retrieval event payloads identifier-only. The workflow should load
   the provider email server-side using the tenant-owned inbound email record.
6. If automatic body retrieval retries are exhausted, mark the inbound email
   placeholder as body retrieval failed and keep it visible to authorized tenant
   staff.
7. Authorized tenant staff may request a safe body retrieval retry from the
   placeholder. The retry must run through product authorization, product work
   claims, and workflow dispatch.
8. Body retrieval exhaustion must not create an empty Support Hub message and
   must not delete or hide the placeholder.
9. If a body retrieval retry is already active for the same tenant and inbound
   email, the product should reuse the active retry and return the current
   status instead of creating another workflow dispatch request.
10. Staff-facing copy should make this clear with a status such as retry already
    running, pending, retrying, failed, or body available.

### Webhook Boundary

1. Keep signature verification in the Resend webhook route.
2. Keep durable provider event storage before any workflow handoff.
3. Move slow or failure-prone work behind durable steps, especially inbound body
   retrieval, attachment listing, inbound message upsert, Support Hub routing,
   suppression updates, and send-log updates if the implementation scope
   approves moving them.
4. If immediate Inngest dispatch fails after the event record is stored, record
   the dispatch failure and let the shared dispatch recovery scan retry the
   handoff.
5. Return `200 OK` after the verified tenant-safe provider event is safely
   stored, even if immediate Inngest dispatch fails. At that point Resend
   delivery succeeded and product-owned dispatch recovery is responsible for the
   workflow handoff.
6. Return non-2xx only for unverifiable, misconfigured, unpersisted, or
   tenant-unsafe webhooks where the product cannot safely accept ownership.

### Support Hub Routing

1. Support Hub routing should be idempotent by inbound email identity and email
   threading headers.
2. The workflow may create a window where an inbound email is stored before it
   is routed to Support Hub. The inbound email placeholder should represent
   that as pending routing, not data loss.
3. Require received-email body content before routing to Support Hub. Do not
   create an empty support message from a placeholder if the body retrieval step
   has not succeeded.
4. Do not require attachment retrieval to finish before routing the support
   message. Attachments may remain pending, retry separately, fail with a clear
   status, or be added after the support message exists.
5. Show a clear attachment status on the Support Hub message when attachments
   are expected, pending, retrying, failed, or available. Staff should not need
   to open a technical workflow view to learn that a sender included an
   attachment that is not ready.
6. Do not expose Resend signed attachment URLs, provider internals, workflow
   step logs, or raw attachment payloads in the staff-facing status.
7. Product work claims should guard Support Hub routing so manual replay,
   recovery scans, and Inngest retries do not create duplicate conversations or
   duplicate messages.
8. Route automatically after body retrieval when the inbound email matches a
   known support inbox route:
   - configured Support Hub inbox address.
   - configured inbox alias.
   - reply/thread headers matching an existing support conversation.
   - tenant-approved default catch-all route for that receiving domain.
9. Do not require manual approval merely because the sender is new, the subject
   is unusual, or the message has attachments.
10. Use inbound routing review only when the email is tenant-owned but does not
    match a known support inbox route or safe tenant default.
11. Inbound routing review should be lightweight and tenant-owned. Authorized
    staff should be able to choose an inbox, save an alias or default route when
    appropriate, and then let future matching emails route automatically.
12. If multiple safe tenant routes match, do not guess. Hold for routing review
    and show the candidate routes to authorized tenant staff.
13. Any authenticated support agent in the owning tenant may save the reviewed
    tenant-scoped route. The action must be audit logged, limited to that
    tenant, and protected by product authorization and work-claim checks so a
    retry, replay, or second click cannot create duplicate or cross-tenant
    routing rules.
14. Saving the reviewed route should immediately continue routing the same
    inbound email through the durable Support Hub routing path. Do not require a
    second staff action and do not wait for a scheduled recovery scan unless the
    immediate dispatch itself fails and needs normal recovery.
15. The save-and-continue action must reuse the existing inbound email identity,
    dispatch request, and product work claim where possible so retry, replay, or
    repeat clicks cannot create duplicate Support Hub messages.
16. A saved reviewed route should default to the exact recipient address or
    alias that was approved. Creating or changing a tenant receiving-domain
    default must be an explicit staff choice, not an automatic side effect of
    reviewing one email.
17. The route-save event should record the chosen scope, such as
    `recipient-address`, `alias`, or `tenant-domain-default`, so audit,
    replay, and future workflow logic can tell whether the rule was narrow or
    intentionally broad.
18. If staff chooses `tenant-domain-default`, require an extra confirmation that
    explains the rule may route future emails for many addresses on that
    receiving domain. This confirmation is not required for exact recipient or
    alias saves.
19. The domain-default confirmation result should be recorded in the audit data
    for the route-save action.
20. Tenant admins should be able to view, edit, disable, and delete active saved
    inbound routing rules for their own tenant.
21. Route management changes must remain tenant-scoped and audit logged.
    Deleting a saved route removes the active routing rule for future email; it
    must not erase the audit history for previously saved, changed, or used
    routes.
22. Pending inbound email should use the current active route state when routing
    resumes, while already routed Support Hub messages should keep their
    historical routing audit trail.
23. If a route edit, disable, delete, or new save resolves pending inbound email
    that was waiting for routing, the product may immediately resume routing for
    that pending email through the same durable Support Hub routing path. The
    resumed run should re-read current tenant route state inside a step instead
    of trusting stale route details from an old event payload.
24. Route changes must not silently move or rewrite already routed Support Hub
    messages. Any future reroute feature for already routed messages should be a
    separate explicit staff action with its own audit trail.
25. Any authenticated support agent in the owning tenant may move an already
    routed Support Hub message or conversation to a different tenant inbox
    through an explicit audited action. This action should record the actor,
    tenant, message or conversation identity, original inbox, destination inbox,
    and timestamp.
26. Moving an already routed Support Hub message must append routing history
    instead of erasing or rewriting the original route decision.
27. Moving an already routed Support Hub message or conversation must require a
    short staff-entered reason. Store the reason with the move audit entry so
    tenant staff can understand the correction later.
28. The move reason should be free text only. Do not add preset reason choices
    for the first implementation; they create reporting categories the product
    has not agreed to maintain yet.
29. The move-reason UI should use existing shared `@asym/ui` form primitives,
    the repo's Maia/Zinc design tokens, and the surrounding Support Hub
    modal/drawer form pattern. Do not hardcode colors, spacing, radius, or
    route-specific custom controls for this field.
30. Move-reason validation should be intentionally light: trim whitespace,
    require 5-500 characters after trimming, and do not enforce grammar, preset
    categories, special formatting, or a longer minimum that could block a quick
    routing correction.
31. Moving an already routed Support Hub message should not send automatic staff
    email. Show the move in Support Hub activity and history instead.
32. Do not create a Resend outbound email for routine message-move notifications
    in the first implementation. If in-app destination inbox alerts are added
    later, they should be a separate notification-settings decision.
33. The original inbox should retain a quiet "moved to" activity or history
    entry after a message or conversation is moved. This entry should point to
    the destination inbox and move audit trail without keeping a duplicate
    replyable message in the original inbox.
34. The original-inbox move marker should use existing Support Hub activity
    styling, shared `@asym/ui` primitives, and Maia/Zinc design tokens. Do not
    use a loud notification treatment, hardcoded colors, or custom route-specific
    badges for this marker.
35. The destination inbox should show the moved message normally, with a quiet
    "moved from" activity or history entry that points back to the original
    inbox and move audit trail.
36. The destination-inbox move marker should use existing Support Hub activity
    styling, shared `@asym/ui` primitives, and Maia/Zinc design tokens. Do not
    use a prominent banner, hardcoded colors, or custom route-specific controls
    for this marker.
37. When a message or conversation is moved, keep the current assignee only if
    that agent still has access to the destination inbox in the owning tenant.
    If the assignee does not have destination inbox access, clear the assignee.
38. Message-move audit should record whether the assignee was retained or
    cleared, including the previous assignee identity when one existed.
39. If the assignee is cleared during a move, leave the message unassigned in
    the destination inbox queue. Do not automatically run destination-inbox
    round-robin and do not require the moving agent to choose a new assignee as
    part of the move.
40. Existing destination-inbox assignment or automation rules may pick up the
    unassigned message later if the tenant has configured them, but that is a
    separate assignment workflow rather than a hidden side effect of moving the
    message.
41. Keep labels and priority on the moved Support Hub message or conversation by
    default. The destination inbox staff may change labels or priority later,
    but moving the message should not erase useful context or require extra
    label/priority questions.
42. Message-move audit should record that labels and priority were retained by
    default, including the priority value and label IDs present at move time.
43. Keep the current Support Hub status on the moved message or conversation by
    default, including `open`, `pending`, `snoozed`, or `resolved`. Moving
    changes the inbox, not the work state.
44. Message-move audit should record the retained status value present at move
    time.
45. If the message or conversation is `resolved`, show a quiet confirmation
    before moving it. The move remains allowed, and the `resolved` status remains
    retained unless staff changes status through a separate status action.
46. The resolved-move confirmation should use the existing Support Hub
    modal/drawer confirmation pattern, shared `@asym/ui` primitives, and
    Maia/Zinc design tokens. Do not use a loud banner, custom color treatment,
    or separate alert workflow.
47. If the message or conversation is `snoozed`, keep the snooze timer by
    default, including the stored `snoozedUntil` value. Moving changes the inbox,
    not when the work should reappear.
48. The move action must not clear or change snooze timing. Staff should use the
    normal snooze or unsnooze action if they want to change when the message
    reappears.
49. Message-move audit should record the retained `snoozedUntil` value when the
    moved message or conversation is snoozed.
50. Do not add a separate move-specific snooze note or warning when moving a
    snoozed message. The retained `snoozed` status and normal Support Hub snooze
    indicators are responsible for showing that the message remains snoozed.
51. Bulk moving multiple Support Hub messages or conversations is allowed only
    when every item goes through the same safeguards as a single-message move:
    tenant-owned source and destination inbox checks, required reason,
    audit/history entries, assignee retention or clearing, label and priority
    retention, status and snooze retention, resolved confirmation when needed,
    and quiet original/destination move markers.
52. Bulk move execution should be idempotent per moved message or conversation,
    not only per bulk request. Retry, replay, or partial failure recovery must
    not duplicate move audit entries or activity markers for items already moved.
53. If Inngest is used for bulk move follow-up, fan out durable work per message
    or use per-message work claims so one failed item does not hide successful
    moves or force already-moved items to run again.
54. Bulk move must not use reduced checks for speed. It may show a batch-level
    result summary to staff, but each item still needs item-level audit evidence.
55. Bulk move uses one shared required free-text reason for the batch. Copy that
    reason into every item-level move audit entry.
56. Each item-level audit entry must clearly say the move came from a batch move
    and include a stable `bulkMoveId` or equivalent operation identifier, actor,
    source inbox, destination inbox, moved item id, and retained or cleared move
    metadata needed for replay-safe investigation.
57. A batch-level result summary or batch operation audit may supplement the
    item-level audit records, but it must not replace them.
58. Bulk move may partially succeed. Successfully moved items should stay moved,
    failed items should stay unchanged in their original inbox, and staff should
    see a clear batch result summary with item-level success and failure states.
59. Retrying or recovering a partially failed bulk move must target only failed
    items. It must not rerun successful item moves, duplicate successful move
    audit entries, or roll back successful moves because another item failed.
60. Item-level bulk move failures should record safe, staff-readable failure
    reasons such as missing authorization, stale item state, or invalid
    destination. Do not expose provider secrets, workflow internals, stack
    traces, or cross-tenant details in staff-visible failure text.
61. The batch result UI should include a `Retry failed` action when retryable
    failed items remain. This action should retry only failed items from the
    batch and must keep successful items untouched.
62. `Retry failed` must call a product server endpoint or action that re-checks
    tenant authorization, reloads current item state, and creates or reuses
    product work claims before dispatching workflow retry work. The UI must not
    call Inngest or Resend directly.
63. Repeat clicks on `Retry failed` should reuse the active retry attempt or
    return current retry status instead of creating duplicate workflow dispatches
    or duplicate item-level audit entries.
64. Retry audit should link the retry attempt to the original `bulkMoveId` or
    equivalent operation identifier and record which failed items were retried.
65. The retry action should use existing Support Hub controls, shared `@asym/ui`
    primitives, and Maia/Zinc design tokens. Do not introduce custom colors,
    loud banners, or route-specific controls for the first implementation.
66. `Retry failed` should reuse the original bulk move reason. Do not ask staff
    for a second reason when the retry is part of the same batch correction.
67. Retry audit should record that the original reason was reused, identify the
    retry attempt, and keep the original item-level move audit entries separate
    from retry-attempt audit records.

### Staff Attachment Retry

1. Staff may manually retry failed, pending, or stale inbound attachment
   retrieval from the Support Hub message when they are authorized for the
   tenant.
2. The retry action must call a product server endpoint or action that checks
   tenant access, loads the existing inbound email record, and creates or reuses
   a workflow dispatch request.
3. The staff UI must not call Resend directly and must not receive Resend API
   keys, signed attachment URLs, raw provider payloads, or attachment bytes as
   part of the retry request.
4. The retry must be idempotent by tenant, inbound email, and provider
   attachment identity when available. Duplicate clicks, workflow retries, and
   manual replay must not create duplicate attachment records.
5. The workflow should call Resend server-side for fresh attachment metadata or
   download URLs because signed URLs can expire.
6. Product work claims should prevent concurrent attachment retries for the same
   inbound email attachment from racing each other.
7. If a retry is already active for the same tenant, inbound email, and provider
   attachment identity when available, the product should reuse the active retry
   and return the current attachment status instead of creating another workflow
   dispatch request.
8. Staff-facing copy should make this clear with a status such as retry already
   running, pending, retrying, failed, or available.

### Tenant Resolution Failures

1. If an inbound `email.received` event cannot be resolved to exactly one
   tenant, keep the current fail-closed behavior and let Resend retry.
2. The route may return a retryable non-2xx response only after signature
   verification proves the event is from Resend and tenant resolution still
   fails.
3. Do not store full email bodies, parsed HTML, attachments, or Support Hub
   rows for unresolved or ambiguous tenant cases.
4. Do not send an Inngest tenant workflow event until tenant ownership is known.
5. Record only sanitized platform operations evidence for unresolved or
   ambiguous cases. Do not expose the email to candidate tenant admins.
6. If repeated retries need visibility, raise a platform-level operations issue,
   not a tenant notification.

## Checklist

- [ ] Resend webhook signatures stay verified before event storage or workflow
      dispatch.
- [ ] Existing email event storage is reused as the first workflow handoff
      anchor unless a later decision changes the tenant-resolution edge case.
- [ ] Verified tenant-safe Resend events return `200 OK` after durable storage,
      even if immediate Inngest dispatch fails.
- [ ] Inngest dispatch failures after storage are recovered by the shared
      dispatch ledger and recovery scan, not by forcing Resend to replay stored
      webhooks.
- [ ] Email workflow events carry identifiers and routing metadata only.
- [ ] Email bodies, HTML, attachments, secrets, and broad raw provider payloads
      stay out of Inngest events.
- [ ] Slow provider calls and Support Hub routing move into durable steps only
      after the event record is stored.
- [ ] A minimal inbound email placeholder is created only after the event is
      verified and resolved to exactly one tenant.
- [ ] Inbound email placeholders exclude body text, rendered HTML, attachment
      bytes, signed attachment URLs, and Support Hub rows.
- [ ] Body retrieval failures keep the inbound email placeholder pending and
      retry automatically through durable workflow steps.
- [ ] Exhausted body retrieval marks the placeholder failed and visible for
      authorized staff retry.
- [ ] Staff body retrieval retry runs through product authorization, product
      work claims, and workflow dispatch.
- [ ] Duplicate staff body-retry clicks reuse the active body retrieval retry
      and return current status instead of starting duplicate provider work.
- [ ] Placeholder metadata alone is never routed as a complete Support Hub
      message.
- [ ] Support Hub routing requires the received email body and never routes an
      empty placeholder as a staff-visible message.
- [ ] Known support inbox routes auto-route after body retrieval without manual
      approval.
- [ ] New sender, unusual subject, or attachments alone do not force routing
      review.
- [ ] Tenant-owned email with no known route or multiple candidate routes goes
      to lightweight inbound routing review.
- [ ] Routing review lets authorized tenant staff choose and save a route so the
      same pattern does not cause repeated delays.
- [ ] Any authenticated support agent in the owning tenant may save the reviewed
      route, but the saved route remains tenant-scoped and audit logged.
- [ ] Saving a reviewed route is protected by product authorization and work
      claims so replay or repeat clicks do not create duplicate rules.
- [ ] Saving a reviewed route immediately continues routing the same inbound
      email without a second staff click or scheduled-scan delay.
- [ ] Save-and-continue routing reuses the existing inbound email identity,
      dispatch request, and product work claim where possible.
- [ ] Reviewed route saves default to the exact recipient address or alias.
- [ ] Tenant receiving-domain defaults require an explicit staff choice.
- [ ] Tenant receiving-domain defaults require an extra confirmation before
      saving.
- [ ] Exact recipient and alias route saves do not require the broader domain
      default confirmation.
- [ ] Route-save audit data records the selected scope, such as recipient,
      alias, or tenant-domain default.
- [ ] Route-save audit data records the domain-default confirmation result when
      the selected scope is tenant-domain default.
- [ ] Tenant admins can view, edit, disable, and delete active saved inbound
      routing rules for their tenant.
- [ ] Route management changes are tenant-scoped and audit logged.
- [ ] Deleting a route removes the active future routing rule without erasing
      historical audit evidence.
- [ ] Pending inbound email uses the current active route state when routing
      resumes.
- [ ] Route changes can resume pending inbound email through the durable Support
      Hub routing path when the change resolves the pending route.
- [ ] Resumed routing re-reads current tenant route state inside a step instead
      of trusting stale route details from an old event payload.
- [ ] Route changes do not silently move or rewrite already routed Support Hub
      messages.
- [ ] Any authenticated support agent in the owning tenant can move an already
      routed Support Hub message or conversation only through an explicit
      audited action.
- [ ] Support message moves are limited to tenant-owned source and destination
      inboxes.
- [ ] Message-move audit records actor, tenant, message or conversation
      identity, original inbox, destination inbox, and timestamp.
- [ ] Moving an already routed Support Hub message appends routing history
      instead of erasing the original route decision.
- [ ] Moving an already routed Support Hub message or conversation requires a
      short staff-entered reason.
- [ ] Message-move audit stores the reason with the move event.
- [ ] The move reason is free text only, with no preset choices in the first
      implementation.
- [ ] The move-reason UI uses existing shared `@asym/ui` form primitives and
      Maia/Zinc design tokens.
- [ ] The move-reason UI does not hardcode colors, spacing, radius, or
      route-specific custom controls.
- [ ] Move-reason validation trims whitespace and requires 5-500 characters
      after trimming.
- [ ] Move-reason validation does not enforce grammar, preset categories,
      special formatting, or a long minimum.
- [ ] Moving an already routed Support Hub message does not send automatic staff
      email.
- [ ] Message moves appear in Support Hub activity and history.
- [ ] The first implementation does not create Resend outbound email for
      routine message-move notifications.
- [ ] The original inbox keeps a quiet "moved to" activity or history entry
      after a message or conversation is moved.
- [ ] The original-inbox move marker does not keep a duplicate replyable message
      in the original inbox.
- [ ] The original-inbox move marker uses existing Support Hub activity styling,
      shared `@asym/ui` primitives, and Maia/Zinc design tokens.
- [ ] The original-inbox move marker avoids loud notification treatment,
      hardcoded colors, and custom route-specific badges.
- [ ] The destination inbox shows the moved message normally.
- [ ] The destination inbox includes a quiet "moved from" activity or history
      entry that points back to the original inbox and move audit trail.
- [ ] The destination-inbox move marker uses existing Support Hub activity
      styling, shared `@asym/ui` primitives, and Maia/Zinc design tokens.
- [ ] The destination-inbox move marker avoids prominent banners, hardcoded
      colors, and custom route-specific controls.
- [ ] Moving a Support Hub message keeps the current assignee only if they still
      have access to the destination inbox in the owning tenant.
- [ ] Moving a Support Hub message clears the assignee when the current assignee
      does not have destination inbox access.
- [ ] Message-move audit records whether the assignee was retained or cleared,
      including the previous assignee identity when one existed.
- [ ] If a move clears the assignee, the message remains unassigned in the
      destination inbox queue.
- [ ] Moving a message does not automatically run destination-inbox round-robin.
- [ ] Moving a message does not require the moving agent to choose a new
      assignee.
- [ ] Existing assignment or automation rules may handle the unassigned message
      later only as a separate assignment workflow.
- [ ] Moving a Support Hub message keeps labels and priority by default.
- [ ] Moving a Support Hub message does not require extra label or priority
      questions.
- [ ] Destination inbox staff can change labels or priority after the move.
- [ ] Message-move audit records the retained priority value and label IDs
      present at move time.
- [ ] Moving a Support Hub message keeps its current status by default.
- [ ] Moving a Support Hub message does not force `open`, clear `pending`, clear
      `snoozed`, or reopen `resolved` work.
- [ ] Message-move audit records the retained status value present at move time.
- [ ] Moving a `resolved` Support Hub message requires a quiet confirmation.
- [ ] The resolved-move confirmation does not change the retained `resolved`
      status.
- [ ] The resolved-move confirmation uses existing Support Hub modal/drawer
      confirmation patterns, shared `@asym/ui` primitives, and Maia/Zinc design
      tokens.
- [ ] The resolved-move confirmation avoids loud banners, custom color
      treatment, and separate alert workflows.
- [ ] Moving a `snoozed` Support Hub message keeps the snooze timer by default.
- [ ] Moving a `snoozed` Support Hub message retains the stored `snoozedUntil`
      value.
- [ ] Moving a message does not clear or change snooze timing; staff use the
      normal snooze or unsnooze action for that.
- [ ] Message-move audit records the retained `snoozedUntil` value when the
      moved message is snoozed.
- [ ] Moving a snoozed message does not add a separate move-specific snooze note
      or warning.
- [ ] Normal Support Hub snooze indicators remain responsible for showing that a
      moved message is still snoozed.
- [ ] Bulk moving multiple Support Hub messages is allowed.
- [ ] Bulk move applies the same tenant, reason, audit, assignee, context,
      status, snooze, confirmation, and activity-history safeguards as
      single-message move.
- [ ] Bulk move is idempotent per moved message or conversation, not only per
      bulk request.
- [ ] Bulk move retry, replay, or partial failure recovery does not duplicate
      move audit entries or activity markers for already-moved items.
- [ ] Bulk move does not use reduced checks for speed.
- [ ] Bulk move may show a batch-level result summary, but every item keeps
      item-level audit evidence.
- [ ] Bulk move uses one shared required free-text reason for the batch.
- [ ] The shared bulk move reason is copied into every item-level move audit
      entry.
- [ ] Each item-level audit entry clearly records that the move came from a
      batch move and includes a stable `bulkMoveId` or equivalent operation
      identifier.
- [ ] Batch-level result summaries or batch operation audit records supplement,
      but do not replace, item-level audit records.
- [ ] Bulk move may partially succeed: successful item moves remain moved and
      failed items remain unchanged in their original inbox.
- [ ] Bulk move result summaries show item-level success and failure states.
- [ ] Retry or recovery for a partially failed bulk move targets only failed
      items and never duplicates successful item audit entries.
- [ ] Staff-visible item failure reasons are safe and do not expose provider
      secrets, workflow internals, stack traces, or cross-tenant details.
- [ ] Bulk move result UI includes `Retry failed` when retryable failed items
      remain.
- [ ] `Retry failed` calls a product server endpoint or action, not Inngest or
      Resend directly from the UI.
- [ ] `Retry failed` re-checks tenant authorization, reloads current item state,
      and creates or reuses product work claims before dispatching workflow
      retry work.
- [ ] Repeat `Retry failed` clicks reuse the active retry attempt or return
      current retry status instead of duplicating dispatches or audit entries.
- [ ] Retry audit links the retry attempt to the original `bulkMoveId` or
      equivalent operation identifier and records which failed items were
      retried.
- [ ] The retry action uses existing Support Hub controls, shared `@asym/ui`
      primitives, and Maia/Zinc design tokens.
- [ ] `Retry failed` reuses the original bulk move reason instead of asking
      staff for a second reason.
- [ ] Retry audit records that the original reason was reused and identifies the
      retry attempt separately from original item-level move audit entries.
- [ ] Attachment retrieval does not block Support Hub routing after the body is
      available; attachment status remains visible and retryable.
- [ ] Support Hub messages show staff a visible attachment status when inbound
      attachments are pending, retrying, failed, or available.
- [ ] Staff-facing attachment status excludes signed provider URLs, raw
      attachment payloads, provider internals, and workflow step logs.
- [ ] Authorized tenant staff can request attachment retry from Support Hub for
      failed, pending, or stale inbound attachments.
- [ ] Attachment retry runs through product authorization, product work claims,
      and workflow dispatch; the UI never calls Resend directly.
- [ ] Attachment retry is idempotent by tenant, inbound email, and provider
      attachment identity when available.
- [ ] Duplicate staff retry clicks reuse the active attachment retry and return
      current status instead of starting duplicate provider work.
- [ ] The first Inngest email slice is limited to inbound body/attachment
      retrieval and Support Hub routing.
- [ ] Outbound delivery status, suppression, bounce, complaint, and send-log
      handling remain on the current path until a later migration decision.
- [ ] Inbound email routing is idempotent across webhook retries, manual replay,
      dispatch recovery, and workflow retries.
- [ ] Unresolved or ambiguous tenant cases fail closed and remain tenant-safe.
- [ ] Candidate tenants never receive guessed inbound email content or workflow
      notifications.
