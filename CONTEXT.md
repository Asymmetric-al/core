# Asymmetric.al Core

This context captures shared product language for Asymmetric.al's connected
missions operations platform. It defines terms that must stay consistent across
staff operations, donor experience, missionary workspace, and background work.

## Language

**Tenant**:
A missions sending organization using the platform with its own data,
permissions, settings, donors, missionaries, and operational history. The
platform is purpose-built for organizations whose missionaries raise personal
support; churches or other ministries are tenants only when they operate a
sending program. An individual missionary is a user within a tenant, never a
standalone tenant. A tenant is a product boundary, not an Inngest app, Inngest
environment, or billing account.
_Avoid_: Inngest tenant, customer app, billing environment, solo-missionary
tenant

**Ministry Update**:
A missionary-authored update post — field news, prayer requests, support
progress — created in the missionary workspace, governed by tenant moderation
and visibility settings, and surfaced across donor, public, and communication
experiences as one connected concept. It is not public page content and not a
one-off email, though pages and communications may display or reference it.
_Avoid_: newsletter, blog post, page content, donor email

**Workflow Orchestration**:
Durable coordination of background work after authoritative product records
exist. It does not become the source of truth for donations, CRM state,
documents, email, permissions, or tenant data.
_Avoid_: Workflow source of truth, background truth

**Workflow Event Contract**:
A small, safe message shape used to request or trigger background work. It
contains stable identifiers and routing metadata, not secrets, full records,
email bodies, document contents, payment internals, or broad CRM payloads.
_Avoid_: Workflow payload, job data blob

**Workflow Event Envelope**:
The standard wrapper for tenant-scoped workflow events. It identifies the
tenant, the kind of workflow, the durable product record, the dispatch request,
and the safe audit/routing context needed to run the work.
_Avoid_: Full event payload, row snapshot, serialized product state

**Product Idempotency Key**:
A durable product-owned key that prevents the same business effect from being
performed twice. It is stronger than short-term workflow event deduplication
and belongs to the product area that owns the outcome.
_Avoid_: Inngest dedupe key, random retry key, workflow-only idempotency

**Guest Giving**:
Online giving without a pre-existing account or sign-in step. The donor still
provides the name, email, and payment/billing details the payment method and
organization policy require; the server creates or matches the donor record
behind the scenes. Guest giving is not anonymous giving and not an unknown
donor.
_Avoid_: account-first checkout, anonymous gift, unknown donor

**Claimable Donor Access**:
Donor portal access created during checkout without a password step. The donor
later claims it through email verification or magic link. Creating it never
reveals whether an email already belonged to an existing donor.
_Avoid_: forced signup, silent password creation, account-existence leak

**Gift Anonymity**:
A per-gift visibility preference hiding the donor's identity from missionary
and public views only. Finance, admins, receipts, reconciliation, and audit
records always retain the donor. Stored on the contribution itself; donor
defaults only seed the per-gift choice.
_Avoid_: donor-level-only flag, hidden-from-finance gift, deleted donor
identity

**Unknown Offline Contribution**:
An offline gift entered when donor identity is truly unavailable (anonymous
cash, unmarked offering-box gifts). The donor reference stays null, the gift is
not receiptable unless donor information is later provided, and staff never
invent fake donor data.
_Avoid_: fake donor row, "Anonymous Anonymous" donor, receiptable unknown gift

**Receipt Identity Snapshot**:
The donor name, email, and address captured on a contribution at gift time so
receipts, statements, and audits stay historically accurate even if the donor
record changes later. Never exposed to missionary or public views.
_Avoid_: live donor lookup for receipts, mutable receipt identity

**One-Time Donation**:
A donor gift intended to be collected once through the platform's immediate
donation flow. Its payment recovery may use the donation saga and outbox model.
_Avoid_: Subscription donation, recurring pledge

**Recurring Donation**:
A donor commitment intended to collect repeated gifts over time. Its payment
lifecycle belongs to Stripe Billing or subscription-oriented payment flows, not
manual renewal loops built from one-time donation attempts.
_Avoid_: Repeated one-time donation, manual renewal PaymentIntent loop

**Payment Authorization Checkpoint**:
The earliest reliable payment state known during checkout. For cards, debit
cards, wallets, and eligible instant bank payments, this can be an immediate
success, decline, or required action; for ACH Direct Debit, it means the donor
authorized the debit and the bank verification or processing state is known.
_Avoid_: Guaranteed ACH success, final settlement, instant ACH clearance

**Bank Account Verification Checkpoint**:
The Stripe-confirmed state that a bank account was verified, or that the donor
must complete verification before the bank payment can proceed. It reduces
mistyped or unusable bank details, but it is not the same as final payment
success.
_Avoid_: Bank payment success, ACH settlement, routing-number-only validation

**Payment Finality**:
The later point when Stripe confirms that funds are successfully collected or
that the payment failed. Some payment methods reach this point during checkout;
delayed bank methods reach it later through payment status updates.
_Avoid_: Checkout submitted, ACH authorized, mandate accepted

**Consistent Donation Checkout**:
A single clear donor experience for giving, regardless of whether the donor
chooses a card, debit card, wallet, instant bank option, or ACH Direct Debit.
Different payment rails may have different timing, but the checkout should
remain visually coherent and truthful.
_Avoid_: Separate-looking ACH checkout, rail-specific confusion, inconsistent
donor payment UI

**Product Work Claim**:
A product-owned decision that one runner may attempt a durable work item now.
It protects work that can be reached through workflow orchestration, manual
replay, recovery scans, or staff tools.
_Avoid_: Inngest lock, route lock, best-effort guard

**Workflow Function Owner**:
The product surface that exposes and owns a workflow function endpoint, such as
staff operations, donor experience, or missionary workspace. The owner names
where the workflow code is served, not which tenant the work belongs to.
_Avoid_: Tenant owner, Inngest tenant, generic job owner

**Workflow Event Name**:
The domain/action name for a workflow event, describing what product thing
happened or what work was requested. It is named for the product domain, not
for the app route that serves the function.
_Avoid_: Function name, route name, app-prefixed event name

**Workflow Dispatch Request**:
A durable product-owned request that background work should be handed to
workflow orchestration. It is created by the product flow that owns the
outcome, and records the intent to run work without becoming the authority for
that outcome.
_Avoid_: Inngest outbox row, workflow truth, fire-and-forget event

**Dispatch Recovery Scan**:
A scheduled safety pass that finds workflow dispatch requests that were not
successfully handed to workflow orchestration. It exists to recover missed
handoffs, not to define the business outcome.
_Avoid_: Cron truth, workflow source, retry brain

**Workflow Dispatch Ledger**:
The shared product-owned collection of workflow dispatch requests across CRM,
donations, email, documents, and other background work. It tracks handoff
status while each product area keeps its own authoritative business record.
_Avoid_: Workflow data store, job source of truth, per-feature dispatch tables

**Workflow Run Summary**:
An operator-facing summary of what happened after a workflow dispatch request
was handed to workflow orchestration. It shows the latest useful status without
copying the detailed step-by-step workflow timeline.
_Avoid_: Step log, duplicate run history, Inngest mirror

**Workflow Notification Policy**:
The tenant/admin-controlled rule for which workflow problems should notify
staff urgently and which should remain visible as operational status. Defaults
prioritize donor trust, money integrity, tenant-wide sync health, and stuck
infrastructure.
_Avoid_: Alert everything, silent failure, hardcoded paging

**Email Event Record**:
A tenant-scoped record of a provider email event that the product can use for
delivery audit, replay safety, and workflow handoff. It is not the support
conversation, the email body, or the attachment store.
_Avoid_: Raw email body event, support ticket, attachment payload

**Tenant-Safe Email Retry**:
A fail-closed response to an inbound email event that cannot be assigned to
exactly one tenant. The product lets the provider retry or surfaces a
platform-level operations issue, but it does not guess a tenant, create tenant
workflow work, or route the email to Support Hub.
_Avoid_: Fake tenant inbox, candidate tenant broadcast, guessed routing

**Inbound Email Workflow**:
Tenant-owned handling of a verified and tenant-resolved received email after
the provider webhook has been trusted. It may load the email body and
attachments from the email provider and route the message to the tenant's
support workspace.
_Avoid_: All email webhook processing, outbound delivery tracking, tenant
resolution

**Provider Webhook Acceptance**:
The moment the product tells an external provider that a webhook was received
successfully. It means the webhook was verified and durably handled enough for
the product to recover internally; it does not mean every downstream workflow
step is finished.
_Avoid_: Workflow completion, support routing complete, final processing

**Inbound Email Placeholder**:
A tenant-owned pending record created from verified provider metadata before
the full received email content is loaded. It makes an inbound email visible as
pending without storing the body, rendered HTML, attachment bytes, or signed
attachment URLs.
_Avoid_: Full inbound email, support message, attachment store

**Support Message Readiness**:
The point where an inbound email has enough trusted tenant-owned content to
become a Support Hub message. The message body is required; attachments may
still be pending, retrying, failed, or added later.
_Avoid_: Empty support message, attachment-blocked support routing, placeholder
conversation

**Inbound Attachment Status**:
A staff-visible state for attachments that belong to an inbound email message.
It tells staff whether attachments are available, pending, retrying, or failed
without blocking the support conversation or exposing provider internals.
_Avoid_: Hidden missing attachment, workflow step log, signed download URL

**Inbound Attachment Retry**:
A tenant-authorized staff request to try retrieving missing or failed inbound
email attachments again. It uses the existing inbound email record and does not
let staff call the email provider directly or bypass product ownership checks.
_Avoid_: Browser provider call, platform-only manual fix, duplicate attachment
job

**Active Attachment Retry**:
The single in-progress retry attempt for a tenant-owned inbound email
attachment. Repeated staff clicks or replay attempts reuse this active retry and
show its current status instead of creating duplicate provider work.
_Avoid_: Retry storm, duplicate provider fetch, second active retry

**Inbound Body Retrieval**:
The durable workflow step that loads the received email body from the email
provider after a verified tenant-owned inbound email placeholder exists. Until
it succeeds, the email remains pending and must not become an empty Support Hub
message.
_Avoid_: Empty support message, placeholder-as-message, body in webhook event

**Body Retrieval Exhaustion**:
The state where automatic attempts to load a received email body have stopped
without success. The tenant-owned placeholder remains visible for audit and
authorized staff retry, but it still must not become an empty Support Hub
message.
_Avoid_: Hidden failed email, empty support message, platform-only recovery

**Active Body Retrieval Retry**:
The single in-progress retry attempt to load the body for a tenant-owned inbound
email. Repeated staff clicks or replay attempts reuse this active retry and
show its current status instead of creating duplicate provider work.
_Avoid_: Duplicate body fetch, retry storm, second active body retry

**Known Support Inbox Route**:
A tenant-approved inbound email destination that can be routed without manual
review. It can be a configured Support Hub inbox address, a configured alias, a
thread reply to an existing support conversation, or a tenant-approved default
catch-all route for that receiving domain.
_Avoid_: Unknown recipient guess, content-based approval, platform-only routing

**Inbound Routing Review**:
A lightweight tenant staff review for a received email that belongs to the
tenant but does not match a known support inbox route. It exists to choose or
save the correct tenant route, not to inspect routine support mail before it can
move.
_Avoid_: Manual approval for every email, hidden pending mail, platform-only
triage

**Tenant Support Route Saver**:
An authenticated support agent in the owning tenant who can choose the inbox for
an inbound routing review and save that tenant-scoped route for future matching
email. The saved route must be audit logged and cannot create platform-wide or
cross-tenant routing.
_Avoid_: Platform bottleneck, cross-tenant route, unaudited permanent rule

**Route Save And Continue**:
The review action where tenant support staff saves the reviewed route and the
same inbound email immediately continues toward Support Hub routing. It should
not require a second staff click or wait for a scheduled recovery scan.
_Avoid_: Second approval button, avoidable delay, duplicate routed message

**Exact Recipient Route Default**:
The default scope for a saved inbound route. A reviewed route should save the
specific recipient address or alias that was just approved unless tenant staff
explicitly chooses to make it a receiving-domain default.
_Avoid_: Accidental domain catch-all, repeated review, hidden broad rule

**Domain Default Confirmation**:
The extra confirmation shown before saving a tenant receiving-domain default.
It makes clear that future emails for many addresses on that receiving domain
may route through the selected Support Hub inbox.
_Avoid_: One-click broad route, surprise catch-all, accidental future routing

**Tenant Route Management**:
Tenant admin control for saved inbound routing rules. Tenant admins can view,
edit, disable, and delete active saved routes for their own tenant, while audit
history remains available for support and replay investigation.
_Avoid_: Platform-only route changes, irreversible route, erased audit trail

**Latest Active Route For Pending Email**:
The rule that an inbound email which has not yet been routed to Support Hub uses
the tenant's current active route when routing resumes. Already routed messages
keep their historical routing record instead of being moved silently.
_Avoid_: Stuck pending email, stale route after fix, silent message move

**Audited Support Message Move**:
An explicit action by any authenticated support agent in the owning tenant that
moves an already routed Support Hub message or conversation to a different
tenant inbox. It appends a new audit entry and preserves the original routing
history instead of treating a route-rule edit as permission to move old messages
automatically.
_Avoid_: Silent reroute, erased original inbox, automatic old-message move

**Support Message Move Reason**:
A short staff-entered explanation required when moving an already routed Support
Hub message or conversation. It is free text only, with no preset reason
choices, and is stored with the move audit entry so tenant staff can understand
why the inbox changed later.
_Avoid_: Empty move audit, unexplained inbox change, hidden correction reason,
inconsistent reason taxonomy

**Light Move Reason Validation**:
The move reason must be trimmed and required, with a practical 5-500 character
range. It should not enforce strict grammar, categories, special formatting, or
long minimum text that blocks quick routing fixes.
_Avoid_: Blank reason, one-letter reason, overly strict staff blocker

**Support Move Activity Only**:
The notification policy for moving an already routed Support Hub message. The
move appears in Support Hub activity and history, but the product does not send
automatic staff email for the move.
_Avoid_: Noisy staff email, hidden move, Resend email for routine inbox cleanup

**Original Inbox Move Marker**:
A quiet Support Hub history entry left in the original inbox after an already
routed message is moved. It shows that the message was moved to the destination
inbox without leaving a duplicate replyable message behind.
_Avoid_: Noisy alert, disappearing message, duplicate conversation, custom UI
badge

**Destination Inbox Move Marker**:
A quiet Support Hub activity or history entry shown with a moved message in the
destination inbox. The message is otherwise worked normally from the destination
inbox, while the marker explains that it was moved from the original inbox.
_Avoid_: Loud banner, missing move context, duplicate old-inbox workflow

**Move Assignee Retention**:
The rule for an already routed Support Hub message move. Keep the current
assignee only if that agent still has access to the destination inbox in the
owning tenant; otherwise clear the assignee so work is not assigned to someone
who cannot handle it.
_Avoid_: Cross-inbox inaccessible assignment, unnecessary unassignment, hidden
permission mismatch

**Move-Cleared Assignee Queueing**:
The rule that when a move clears an assignee, the message remains unassigned in
the destination inbox queue. A move does not automatically run round-robin or
force the moving agent to choose a new assignee.
_Avoid_: Surprise assignment, move friction, hidden round-robin side effect

**Move Context Retention**:
The rule that labels and priority stay on a Support Hub message or conversation
when it moves to another inbox. They remain editable after the move, but the
move itself should not erase useful context by default.
_Avoid_: Lost urgency, erased label context, unnecessary move form questions

**Move Status Retention**:
The rule that moving a Support Hub message or conversation keeps its current
work status, such as open, pending, snoozed, or resolved. Moving changes the
inbox, not the work state.
_Avoid_: Surprise reopen, lost pending state, accidental resolved change

**Resolved Move Confirmation**:
A quiet confirmation shown before moving a Support Hub message or conversation
that is already resolved. The move remains allowed, and the resolved status is
retained, but staff must notice they are moving closed work.
_Avoid_: Accidental closed-work move, blocked correction, noisy warning banner

**Move Snooze Retention**:
The rule that moving a snoozed Support Hub message or conversation keeps its
snooze timer. Moving changes the inbox, not when the work should reappear.
_Avoid_: Accidental unsnooze, lost wait timing, move-as-status-change

**Silent Snooze Retention On Move**:
The rule that moving a snoozed message does not add a separate move-specific
snooze note or warning. The retained snoozed status and normal Support Hub
snooze indicators remain the way staff sees that the message is still snoozed.
_Avoid_: Duplicate snooze note, noisy move confirmation, hidden snooze state

**Bulk Support Message Move**:
A tenant-scoped action that moves multiple Support Hub messages or conversations
to another inbox. It is allowed only when each moved item goes through the same
authorization, reason, audit, assignee, status, label, priority, snooze, and
activity-history safeguards as a single-message move.
_Avoid_: Bulk shortcut, reduced checks, unaudited multi-message move

**Bulk Move Shared Reason**:
The one required free-text reason staff enter for a bulk Support Hub move. The
same reason is copied into every moved item's audit entry, and each item audit
entry clearly records that it was part of a batch move.
_Avoid_: Batch-only reason, ambiguous audit trail, per-item missing reason

**Bulk Move Partial Success**:
The rule that a bulk Support Hub move may finish with some items moved and some
items failed. Successfully moved items stay moved, failed items stay in their
original inbox, and staff see item-level results for what happened.
_Avoid_: One bad item blocking all valid moves, hidden partial failure, rerunning
already-moved items

**Bulk Move Retry Failed Action**:
A staff action shown after a bulk Support Hub move has failed items. It retries
only the failed items through the product server path, re-checks tenant access,
uses product work claims, and does not rerun items that already moved.
_Avoid_: Retry all, direct workflow call from UI, duplicate audit entries,
cross-tenant retry

**Bulk Move Retry Reason Reuse**:
The rule that a `Retry failed` action reuses the original bulk move reason
instead of asking staff for a new reason. The retry audit still records that the
attempt was a retry and links it to the original batch.
_Avoid_: Reason fatigue, unclear retry audit, separate reason for same
correction

## Example Dialogue

Developer: "Should this workflow event include the full donor record?"

Domain expert: "No. The workflow event contract should carry the donor or
donation identifier. Workflow orchestration can load the current authorized
state from the product system when it runs."

Developer: "Should each tenant get its own Inngest app?"

Domain expert: "No. Tenants are product boundaries. Workflow orchestration
should receive tenant identifiers and enforce tenant-aware limits, while the
platform still operates under shared workflow infrastructure."

Developer: "Does `admin.crm.outbound.process` mean the work is only for the
admin tenant?"

Domain expert: "No. It names the workflow function owner. The tenant is still
identified separately in the workflow event contract."

Developer: "Can the event include the full CRM payload so the workflow does not
need to look anything up?"

Domain expert: "No. Use the workflow event envelope to identify the current
product record, then load the current authorized state when the workflow runs."

Developer: "Can the workflow event ID be our only protection against duplicate
Stripe or CRM work?"

Domain expert: "No. The product idempotency key protects the business effect.
The workflow event ID only helps avoid duplicate handoffs."

Developer: "Can recurring donations use the same retry loop as one-time
donations?"

Domain expert: "No. A recurring donation has its own subscription lifecycle.
One-time donation recovery and recurring donation billing should be designed as
separate payment concepts."

Developer: "If an ACH donor finishes checkout, is the payment final?"

Domain expert: "No. The payment authorization checkpoint is known, but payment
finality for ACH can arrive later through Stripe payment status updates."

Developer: "Can we at least know whether the bank details look usable?"

Domain expert: "Yes. The bank account verification checkpoint tells us whether
Stripe verified the account or needs the donor to complete verification, but it
does not mean the ACH payment has finally succeeded."

Developer: "Should the checkout look different when the donor chooses ACH?"

Domain expert: "No. The donation checkout should stay consistent. The status
message changes, but the experience remains clear and coherent."

Developer: "Can workflow concurrency be our only protection against staff
manual replay running at the same time?"

Domain expert: "No. Workflow concurrency reduces pressure, but the product work
claim decides whether this specific work item may be attempted now."

Developer: "For bulk message moves, should staff enter one reason for the batch
or a different reason for every message?"

Domain expert: "Use one required reason for the batch, copy it into every moved
item's audit entry, and mark each item audit entry as part of a batch move."

Developer: "If one item in a bulk message move fails, should we undo the whole
batch?"

Domain expert: "No. Keep successful item moves, leave failed items unchanged,
show item-level results, and retry only the failed items."

Developer: "Should the batch result screen include a Retry failed action?"

Domain expert: "Yes. Show it when failed items remain, send it through the
product server path, re-check tenant access, and retry only failed items."

Developer: "Should Retry failed ask staff for a new reason?"

Domain expert: "No. Reuse the original bulk move reason, and make the retry
audit show that this was a retry attempt for the same batch."

Developer: "If sending the workflow event fails, is the work lost?"

Domain expert: "No. The workflow dispatch request remains the product-owned
record that the work still needs to be handed to workflow orchestration."

Developer: "Do users always wait for the dispatch recovery scan?"

Domain expert: "No. The product can try an immediate handoff, while the
dispatch recovery scan catches any handoff that did not complete."

Developer: "Should CRM and donations each invent their own workflow handoff
table?"

Domain expert: "No. They should share the workflow dispatch ledger, while CRM
and donations keep their own authoritative records."

Developer: "Should Mission Control store every workflow step?"

Domain expert: "No. It should show the workflow run summary. The detailed
timeline belongs in workflow orchestration."

Developer: "Should every CRM job failure page staff?"

Domain expert: "No. The workflow notification policy decides what is urgent.
Routine retryable failures stay visible without becoming urgent alerts."

Developer: "Should an inbound email workflow event carry the email body?"

Domain expert: "No. The email event record identifies the provider event.
Workflow orchestration should load authorized email details from product
storage when it runs."

Developer: "If an inbound email might belong to two tenants, should we pick the
most likely tenant?"

Domain expert: "No. Use a tenant-safe email retry. The product must not guess
which tenant owns an email."

Developer: "Should the first email workflow also handle bounces and delivery
tracking?"

Domain expert: "No. The first inbound email workflow handles received-email
content retrieval and support routing. Outbound delivery tracking is a separate
email concern."

Developer: "If workflow dispatch fails after we store a verified Resend event,
should Resend retry the whole webhook?"

Domain expert: "No. Provider webhook acceptance has already happened. The
product should recover the workflow handoff internally."

Developer: "Should the webhook create a full inbound email before workflow
processing?"

Domain expert: "No. It may create an inbound email placeholder from verified
metadata. The inbound email workflow fills in content and support routing."

Developer: "Should missing attachments block the support conversation?"

Domain expert: "No. Support message readiness requires the email body.
Attachment retrieval can finish later without hiding the message from staff."

Developer: "If attachment retrieval fails, should staff only see that in a
technical workflow log?"

Domain expert: "No. The inbound attachment status should be visible on the
Support Hub message so staff know an attachment is pending or failed."

Developer: "Can support staff retry a failed inbound attachment?"

Domain expert: "Yes. An inbound attachment retry is allowed when staff are
authorized for the tenant and the retry uses the product-owned email record."

Developer: "What if staff clicks retry twice?"

Domain expert: "The second click should reuse the active attachment retry and
show the current status. It should not start duplicate provider work."

Developer: "If the provider body API is temporarily unavailable, should we route
the subject as a support message?"

Domain expert: "No. Inbound body retrieval should retry automatically. The
placeholder stays pending until the body is available."

Developer: "If automatic body retrieval retries run out, should we hide the
placeholder?"

Domain expert: "No. Body retrieval exhaustion should remain visible to
authorized tenant staff, who can request a safe retry."

Developer: "What if staff clicks retry body retrieval twice?"

Domain expert: "The second click should reuse the active body retrieval retry
and show the current status. It should not start duplicate provider work."

Developer: "Should every new sender wait for staff approval before Support Hub
routing?"

Domain expert: "No. If the email matches a known support inbox route, it should
route automatically. Inbound routing review is only for tenant-owned email that
does not match a safe route."

Developer: "Who can save a route when an inbound email needs review?"

Domain expert: "Any authenticated support agent in that tenant can save the
tenant-scoped route. Keep it audited, but do not make platform admins approve
routine support routing."

Developer: "After the agent saves the reviewed route, should that current email
route right away?"

Domain expert: "Yes. Saving the route should immediately continue routing the
same email. Use idempotent workflow steps so a replay or double click cannot
create duplicate messages."

Developer: "When staff saves a reviewed route, should it apply to the exact
recipient or the whole receiving domain?"

Domain expert: "Default to the exact recipient address or alias. Only create a
tenant domain default when staff explicitly chooses that broader scope."

Developer: "If staff chooses the broader tenant domain default, should the app
ask for extra confirmation?"

Domain expert: "Yes. A domain default can affect many future addresses, so show
a clear confirmation before saving it."

Developer: "Should tenant admins be able to change saved inbound routing rules
later?"

Domain expert: "Yes. Tenant admins should be able to view, edit, disable, and
delete active saved routes for their tenant. Deleting a route removes the active
rule, not the audit history."

Developer: "When a tenant admin changes a saved route, what happens to emails
that are already pending routing?"

Domain expert: "Pending emails that have not routed yet should use the latest
active route when routing resumes. Already routed Support Hub messages keep
their historical routing trail."

Developer: "Should staff be able to move an already routed Support Hub message
to another inbox?"

Domain expert: "Yes, but only through an explicit audited staff action. Route
rule changes should not move old messages automatically."

Developer: "Who should be allowed to move an already routed Support Hub
message?"

Domain expert: "Any authenticated support agent in the owning tenant can move
it, with the required reason and audit trail."

Developer: "Should staff have to enter a reason when moving an already routed
message?"

Domain expert: "Yes. Require a short reason so the audit trail explains why the
conversation moved."

Developer: "Should that reason use preset choices or free text?"

Domain expert: "Use free text only, but keep the field visually consistent with
the product's shared form components and design tokens."

Developer: "How strict should the free-text move reason validation be?"

Domain expert: "Use light validation only: trim it, require 5-500 characters,
and avoid picky rules that slow staff down."

Developer: "Should moving a Support Hub message notify anyone?"

Domain expert: "No automatic email notification. Show the move in Support Hub
activity and history instead."

Developer: "Should the original inbox show where a moved message went?"

Domain expert: "Yes. Leave a quiet 'moved to' activity entry in the original
inbox history, using the normal Support Hub UI style and design tokens."

Developer: "What should the destination inbox show after a message is moved
there?"

Domain expert: "Show the message normally, with a quiet activity entry saying it
was moved from the original inbox."

Developer: "What should happen to the current assignee when a message is moved
to another inbox?"

Domain expert: "Keep the assignee only if they still have access to the
destination inbox. If they do not, clear the assignee."

Developer: "If the assignee gets cleared during a move, should the system
automatically assign the message to someone in the destination inbox?"

Domain expert: "No. Leave it unassigned in the destination inbox queue. Normal
assignment rules can handle it later if the tenant configured them."

Developer: "If a message has labels or priority when moved to another inbox,
what should happen to them?"

Domain expert: "Keep labels and priority by default. The destination team can
change them later if needed."

Developer: "Should moving a message change its status?"

Domain expert: "No. Keep the current status by default. Moving changes the
inbox, not the work state."

Developer: "If the moved message is resolved, should staff get a warning before
moving it?"

Domain expert: "Yes. Show a quiet confirmation so staff notices they are moving
closed work, but still allow the move."

Developer: "If the message is snoozed, should moving it keep the snooze timer?"

Domain expert: "Yes. Keep the snooze timer by default. Moving changes the inbox,
not when the message should reappear."

Developer: "Should moving a snoozed message show a quiet note that the snooze is
still active?"

Domain expert: "No. Keep the snooze silently during the move. The normal
Support Hub snoozed status should still show that the message is snoozed."

Developer: "Should staff be able to bulk-move multiple Support Hub messages at
once?"

Domain expert: "Yes, but every message still needs the same tenant checks,
reason, audit trail, and move safeguards as a single-message move."
