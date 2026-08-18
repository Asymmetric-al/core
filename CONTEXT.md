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

**Ministry Update Engagement**:
The reactions (love/prayer/fire) and comment thread on a Ministry Update,
owned by one shared module so counts, viewer state, and persistence behave
identically on every surface. A surface chooses appearance and comment
presentation; it never re-implements reaction state, optimistic updates, or
the wire contract.
_Avoid_: per-surface reaction forks, local-only reaction state, unpersisted
engagement UI

**Assistant**:
An AI agent or assistant that helps a staff member, missionary, or donor
complete a task inside the platform (drafting, suggesting, summarizing,
routing, preparing work). An assistant acts within the authority of the human
it serves — never a separate permission tier, never a way to widen role or
tenant scope — and follows current AI-agent best practice: least privilege,
human approval gates for donor-facing sends, money, operational-truth changes,
and publication, plus full attribution and audit. Model output remains a
suggestion until the owning domain's authorized command accepts it; possession
of a model credential never widens human or data authority. It is not a human
staff role.
_Avoid_: assistant as a permission tier, autonomous money/donor/publish agent,
human assistant job title

**Site**:
A tenant-owned public presence — one website a tenant operates, with its own
domain(s), branding, language, and public giving entry points. A tenant can own
more than one site, and every tenant has at least one. A site is a presentation
and attribution boundary beneath the tenant, not a separate tenant, billing
account, or payment identity. Public content and public gifts belong to a site;
the tenant remains the organization, owner, and money/merchant boundary.
_Avoid_: site as tenant, separate-org microsite, site channel as a product
surface (Mission Control and Donor Portal are surfaces, not sites)

**Entry Method**:
How a gift entered the system — for example public checkout, donor portal,
offline staff entry, data import, or an API call. It is one of a gift's
attribution axes and is kept separate from the gift's type (one-time vs
recurring) and from where or why the gift was made.
_Avoid_: source as gift type, channel, donation type

**Source Code**:
A short attribution tag recording what drove a gift — a specific appeal, email,
link, QR code, or promotion — typically captured from giving-link URL
parameters. It records marketing origin only, and stays distinct from the site
(where the gift happened), the entry method (how it entered), and the
designation (which fund or campaign the gift is for).
_Avoid_: channel, entry method, designation, campaign

**SiteStacker Parity**:
Matching what SiteStacker/WMTek lets a Christian missions organization
accomplish — its operational capability — built on Asymmetric.al's own model,
not cloning its screens. SiteStacker is the benchmark of outcomes an org must be
able to achieve, not a UI blueprint. Each parity area is judged by "can an org
get the same real-world job done here?" and tracked in the parity matrix
(`docs/prds/sitestacker-parity/`). Child sponsorship is out of scope.
_Avoid_: SiteStacker clone, screen-for-screen copy, feature-for-feature parity

**Public tenant website** (Phase 5):
The tenant's public-facing ministry site — branded public pages, missionary
and project pages, storytelling, and giving entry points — served today as a
surface inside the donor app, on the tenant's domain. It is a public ministry
experience, never an operational console, and "channel" is retired as a
public/attribution concept (Phase 2's four axes replaced it: site,
entry method, source code, designation).
_Avoid_: public admin console, marketing microsite outside the platform,
channel

**Public runtime** (Phase 5):
The governed way the public tenant website actually runs: host-based tenant
resolution, published-only isolated content reads, reference validation,
enumeration-safe checkout handoff, tagged caching with secured invalidation,
and Draft Mode preview — one contract every public page type builds on.
_Avoid_: per-page fetch rules, ad hoc public data paths

**Published-content reader / choke-point** (Phase 5):
The sole entry for public content reads. It takes the resolved tenant (and
reserved site) as a required argument, always applies tenant-and-published,
runs with Payload access control enforced, and returns empty when no tenant
resolves. A hard-blocking lint forbids raw Payload reads in public paths.
_Avoid_: direct Payload reads in public code, hand-written tenant `where`
clauses, `overrideAccess: true` public reads

**Public serializer** (Phase 5):
The allowlist between CMS documents and the public. It emits only named
public-safe fields and typed layout blocks; new or unknown fields are
excluded by default; media is normalized to public URLs. Raw Payload
documents never cross it.
_Avoid_: passing raw CMS documents to pages, denylist filtering, leaking
internal fields by default

**Public request context** (Phase 5):
The unified result of resolving a public request from the platform-trusted
host: operational tenant id, CMS tenant id, and a reserved site id. Fail
closed — an unknown or disabled host resolves to "site not found," never to
an unfiltered read. Client-supplied tenant overrides are dev-only.
_Avoid_: trusting `?tenant=` in production, per-page host parsing

**Checkout handoff / CTA resolver** (Phase 5):
The resolver that turns a public "Give" CTA into a server-validated checkout
handoff. Every operational reference is re-validated server-side against the
resolved tenant; a preset amount is a re-validated suggestion, never a
trusted charge value; the handoff carries the reserved attribution fields
(site, source code, currency, locale, entry method). Invalid links fail to
"give another way," never a mis-designated gift.
_Avoid_: hand-rolled giving URLs, client-trusted amounts or references,
enumeration-leaking giving forms

**Preview (Draft Mode) / preview token** (Phase 5):
Staff preview renders the real public page with drafts on via Next.js Draft
Mode, behind a signed-secret route that authenticates the staff user and
checks the tenant; the response is never cached and never indexed. A
shareable, expiring non-staff preview token is a reserved seam.
_Avoid_: separate preview templates that drift from the live page, publicly
reachable drafts, indexable preview URLs

**Public page identity** (Phase 5):
A public page's presentation identity — display name, slug, publish state —
linked to, but never equal to, the operational record behind it. CMS wins
for presentation; operational truth wins for identity, money, and existence;
a dangling or cross-tenant reference fails safe.
_Avoid_: treating the page as the operational record, copying operational
truth into CMS

**Cache tag scheme** (Phase 5):
The tenant/document-derived tags on cached public reads, used for prompt
invalidation when content publishes. Tags invalidate; they never isolate —
cache-key isolation comes from passing the resolved tenant as a function
argument. Site and locale tag dimensions are reserved.
_Avoid_: tag-only tenant isolation, route-segment cache config, unbounded
"never expire" caching

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

**Gift processing-fee policy**:
The Core quote of estimated Stripe processing cost on a Guest Giving gift, in
integer cents, by payment method. Checkout is a thin adapter; Gift intake
recomputes charged cents and never trusts a client total. Distinct from tenant
processor-cost attribution.
_Avoid_: UI-owned Stripe rates, trusted client gross-up, "100% reaches the field"

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

**Receipt Identity Snapshot** (Phase 7):
The immutable legal-donor name and address evidence accepted into a specific
receipt/statement facts version so official documents and audits stay
historically accurate even if the Party profile later changes. It is produced
from the source-owned contribution identity and eligibility evidence, not kept
as mutable receipt columns on the contribution, and is never exposed to
missionary or public projections.
_Avoid_: live donor lookup for an issued receipt; mutable receipt identity;
`receipt_name`/`receipt_address` columns as parallel truth

**Gift / Donation**:
A donor's contribution event through the platform—one-time or a recurring
occurrence—represented by one Phase 13 contribution header and one or more
designation lines whose amounts conserve the header total. Phase 13 keeps
payment/posting/review truth; Phase 7 owns receipt facts, Phase 18 owns the
canonical generated artifact, Phase 17 owns immutable prepared message content
and bounded sender identity, and Phase 6 alone owns communication policy,
scheduling, dispatch, provider outcome, and history. "Gift" is donor-facing
language; "contribution" is the data-model term. See [[one-time-donation]],
[[recurring-giving]].
_Avoid_: fixed-total pledge or recurring commitment (intent records, not
received gifts); one-gift-one-fund; receipt status on the contribution

**Fund**:
A tenant-owned designation target — such as a general or project fund — a gift
can be directed to, distinct from a missionary. See [[designation]].
_Avoid_: missionary, campaign, Stripe product

**Designation**:
The tenant-owned purpose target selected by exactly one contribution
designation line. A gift may contain several lines, each with one target and an
explicit same-currency amount; the lines must sum exactly to their payment
group. Reallocation after posting is an append-only
[[contribution-correction]], not an in-place donor edit.
_Avoid_: two targets on one line; one-gift-one-fund; lines that do not conserve
the payment-group total

**Staged Gift** (retired legacy term):
The former bridge record that mixed receipt status, CRM-post status, and
designation after payment. It is not a target runtime model. Phase 15 owns
editable pre-commit batch rows; Phase 13 owns committed contribution
headers/lines/postings; downstream receipt, document, communication, and
accounting authorities remain separate.
_Avoid_: extending the legacy staged-gift table; using one row as money,
receipt, CRM, and accounting truth

**Fixed-total pledge**:
The canonical record of a Commitment Party's explicit promise to give a
cumulative amount. Received contributions may fulfill it through authoritative
applications, but the pledge itself is not money, donor debt, automatic payment
authority, or an accounting receivable by default; collection method does not
determine its type.
_Avoid_: recurring commitment, provider subscription, received gift, donor debt,
accounting receivable by default

**Contribution Correction**:
A source-owned, append-only staff action that changes the effective contribution
through explicit postings and a durable correction occurrence. Phase 7,
Phase 18, Phase 17 (prepared message content and sender identity), Phase 6
(communication policy, dispatch, provider outcome, and history), Phase 20, and
other consumers process that occurrence independently under their own version,
recovery, and audit contracts; the correction never mutates their prior facts
or provider history atomically.
_Avoid_: silent edit; direct overwrite; one cross-domain transaction that
rewrites gift, receipt, document, communication, and accounting truth

**Donation Saga**:
The durable, outbox-driven process that creates a donation's payment intent and
recovers a stuck handoff, guarded by a [[product-idempotency-key]] so a
business effect is never performed twice.
_Avoid_: fire-and-forget charge, retry loop as source of truth

**Outbox Event**:
A durable product-owned record that background work still needs to happen,
written alongside the business record so a failed handoff can be recovered
later. Donations and the shared [[workflow-dispatch-ledger]] both use this
pattern.
_Avoid_: job queue as source of truth, event as the business record

**Dead-Letter**:
The state a durable work item reaches after bounded automatic retries are
exhausted without success. It stays visible for staff attention and safe manual
replay; it never silently disappears or invents a business outcome.
_Avoid_: hidden failure, infinite retry, silent drop

**One-Time Donation**:
A donor gift intended to be collected once through the platform's immediate
donation flow. Its payment recovery may use the donation saga and outbox model.
_Avoid_: Subscription donation, recurring pledge

**Recurring giving**:
The donor-facing product for arranging repeated gifts. Its intent is recorded
as a recurring commitment, and each received installment is a separate gift;
use "Give monthly" or "Recurring gift" in donor-facing language.
_Avoid_: subscription, fixed-total pledge, one donation charged repeatedly

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

**CRM Write Gate** _(retired — ADR-0001)_:
Retired at the Phase 8 re-groom (2026-07-07). It gated the first write to the
Twenty provider; with Twenty retired and Asym Postgres owning all CRM truth,
there is no provider write to gate. Kept as a tombstone so the term is not
reintroduced. See `docs/prds/sitestacker-parity/phase-08-crm-operating-foundation.md`.

**CRM Readiness Gate** _(retired — ADR-0001)_:
Retired with the write gate. What survives is the **CRM health verdict** — a
plain-language `healthy | degraded | blocked` composed from the data-health
catalog signals, read for display, never a per-write interlock.
_Avoid_: reintroducing a write-readiness interlock (there is no provider write)

**Reactive Pause** _(retired — ADR-0001)_:
Retired. It was an automatic halt of the outbound-to-Twenty write path (with an
emergency global kill-switch); with no outbound writes there is nothing to
pause or stop.

**CRM Healer**:
Redefined at the re-groom. Asym's background-work runtime **already** self-heals
its own jobs (durable Inngest recovery scans + dead-letter/replay ledgers). The
"CRM Healer" now names that shipped recovery machinery — which Phase 8
**observes and escalates over**, never forks — plus the **one** net-new active
heal Phase 8 owns: re-projecting a stale derived view (a Phase-9 concept,
reserved until Phase 9 ships). Steady state is quiet — a green, empty
operations screen means "handled," not "unwatched."
_Avoid_: a second scheduler/scan next to the shipped recovery, auto-merge

**Disposition Predicate**:
The single rule governing the one reserved active heal (stale-derived-view
re-projection): heal only when the action is idempotent, reversible, non-money,
and well-scoped; otherwise escalate. It is a rule, not the engine of a new
healer.
_Avoid_: per-category handler list, heal-everything, escalate-everything

**Proof-of-Health Snapshot** _(retired — ADR-0001)_:
Retired with the write gate — it recorded the green verdict at the moment a
write gate was opened; there is no gate to open. Escalations and the operations
summary carry their own state/timestamps instead.

**Twenty CRM (retired)**:
A third-party CRM engine once adopted as a backing CRM provider for the
relationship layer (read-only) and retired on 2026-07-06 by ADR-0001
(`docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md`) before any
production use. Asym Postgres is the CRM system of record; per-record-type
ownership lives in the Phase 1 ownership matrix
(`docs/prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md`).
_Avoid_: backing CRM provider, Twenty-backed surface, new work that reads or
writes Twenty

**Security level** (Phase 10):
A person-level classification on a party (standard / sensitive / restricted /
high-risk) that governs **publication** — whether the person's real identity may
ever reach a public or external surface. It is orthogonal to the Phase-3 field
`sensitivity_category` (which governs field need-to-know); the two compose with
strictest-applicable wins. It defaults from a tenant-configurable, versioned
country-risk table and is a fixed enum (tenants configure the mapping, not the
tiers).
_Avoid_: per-page visibility checkbox, a second field-classification model,
tenant-defined tiers

**Publication firewall** (Phase 10):
The architectural invariant that a restricted worker's real name, photo, and
location are **structurally unreachable** from every public/external egress
(public site, CMS, donor portal, receipts, OG images, sitemaps, slugs, search,
CSV/export, webhooks, media metadata) — enforced by one predicate at every
egress point, not by configuring each page. Extends the Phase-5 public
projection.
_Avoid_: per-page authenticate checkbox, admin-configured-per-surface safety

**Dual identity** (Phase 10):
A party's separation of a **legal name** (security-classified, in a separate
restricted table) from a public **display name / alias** (pseudonym), with
photo, biography, region, and country as classified attributes. Public surfaces
read only the alias projection; the legal↔alias mapping is a gated named grant.
_Avoid_: one name field, alias stored beside legal name in the clear

**Break-glass access** (Phase 10):
A controlled emergency-access path to a restricted-tier record: it requires a
mandatory justification, fires a real-time alert, grants time-boxed access, and
lands in a post-hoc review queue. The primitive (grant + alert + audit) ships in
Phase 10; the crisis-response UI is Phase 38.
_Avoid_: a weakened gate, silent emergency bypass, unaudited override

**Party**:
The CRM supertype record: every person, household, or organization (including
churches) is one party, with `party_kind` in person / household / org
(`group` reserved for a later phase) and `org_type` distinguishing org
subtypes (church, school, foundation, business, DAF sponsor, …). Parties are
Asym operational identity — not logins, donor profiles, or public-page
identities.
_Avoid_: constituent table, generic CRM record, individual (use person)

**Shared-PK subtype**:
The party topology rule: a subtype row IS its party — same id in the subtype
table (persons, households, org profiles) and in parties. For people, a
person id and a party id are one value, so no bridge columns exist to drift.
_Avoid_: party_id foreign keys on subtype tables, dual identity bridges

**Stored edge / Derived edge**:
A stored edge is a `crm_relationships` row — one canonical, typed, time-bound
row per relationship, never a mirrored reciprocal pair. A derived edge is
computed at read from source truth (supports from the giving ledger,
household membership, org contacts) and is never persisted as a row.
_Avoid_: persisting derived kinds, reciprocal mirror records, edges for
gift-level facts

**Provenance (graph/timeline)**:
The label saying which source of truth produced an edge or timeline item.
Finance-derived items inherit finance visibility rules, not generic CRM
visibility.
_Avoid_: unlabeled merged lists, one visibility rule for all sources

**Relationship role**:
The qualifier a party carries on a specific edge (treasurer on a
board-member edge, coach on an applicant edge). Lives on the edge, never as
a stored party-role table.
_Avoid_: party_roles table, role tags detached from their relationship

**Supports policy**:
The named, versioned definition of when a supports edge exists (v1: a
settled, adjustment-folded gift in the trailing 365 days OR eligible current
recurring intent OR an explicitly qualifying fixed-total pledge). The edge
displays its provenance and policy version; unknown or stale provider control
cannot appear as healthy current recurring support. Recurring expectations and
fixed-pledge expectations never enter cash-received totals.
_Avoid_: unstated support thresholds, staff-entered supports edges

**Saved view / List (segment)**:
A saved view is a live, named, shareable lens over a record kind (filters +
sort + columns; always a live query, never stored membership). A list or
segment — a curated membership container — is a distinct, reserved future
concept.
_Avoid_: static list copies, views that store record membership

**Staff-assignment edge**:
The portfolio-assignment primitive: a typed edge from a staff person to any
party, with rep roles carried as data (donor rep, regional rep, church
relations, mobilizer). Portfolios are derived views over active
staff-assignment edges; display roles derived from them are never an
authorization input.
_Avoid_: stored portfolio tables, assignment columns on records, roles as
authorization

**Lifecycle status vs cultivation stage**:
Lifecycle status is the record's own state (active, inactive, archived,
deceased — plus merged, derived from the Phase 4 merge tombstone, never a
stored value). Cultivation stage is donor-development pipeline state
(Phase 27 — Donor Development) and never appears as a lifecycle status value.
_Avoid_: pipeline stages in record status, prospect states on the party row

**Provider link (record link)**:
A row linking an Asym record to an external provider object by id (the
`crm_record_links` pattern, generalized — Stripe now, Mailchimp later). A
provider id is a link, not an identity: losing or re-pointing it never
changes who a record is or what money happened.
_Avoid_: provider ids as primary identity, provider records as truth

**Custom field** (Phase 11):
A tenant-defined field on an approved CRM record type (person, org/church,
household, or fund), created by a tenant admin without engineering. Its
_definition_ (name, type, options, policy) lives in the field catalog; its
_value_ is the data entered for one record. Every custom field is born
classified — none exists without a visibility/edit/export/sensitivity policy.
_Avoid_: per-tenant tables, raw EAV, an unclassified or ungoverned field

**Custom collection** (Phase 11):
A tenant-defined _repeatable_ set of custom fields under a parent record — e.g.
a person's many Certifications. Each entry is a _collection item_; the shape is
a _collection definition_. A collection is owned sub-data of one parent
(cascade-deleted with it), not a relationship between two records —
record-to-record links stay in the stored-edge relationship graph. (Renamed
from "Configurable Entities"; "entity" retired as ambiguous.)
_Avoid_: "entity" for this, record-reference fields inside a collection,
rebuilding `crm_relationships` inside a collection

**Field key vs value key vs label** (Phase 11):
The field key is a field's immutable machine identity — what stored values and
integrations reference; it never changes. The value key is an option's stable
machine handle for import/export/API. The label is the human display name and
can be renamed freely without breaking anything or corrupting history.
_Avoid_: keying stored data or integrations on the label

**Field catalog** (Phase 11):
The tenant's governed list of custom-field and collection definitions plus their
policy — the single typed, policy-annotated contract every surface (lists,
exports, reports, imports, API, workflows) reads. No consumer touches raw stored
values or re-derives a field's type or policy.
_Avoid_: per-surface field logic, reading raw extension JSON outside the catalog

**Hot / promoted field** (Phase 11):
A custom field an org filters, sorts, or reports on often, promoted to fast
typed access (an index) under a governed budget. Promotion is additive and
reversible; most fields are never promoted.
_Avoid_: indexing every field, unbounded promoted-index growth

**Principal** (Phase 12):
The exact actor presented to the one Policy Decision Point: an authenticated
tenant human with a current membership (staff, donor, or missionary), a public/
anonymous actor limited to the public projection, a non-human identity, or a
platform operator. A Party, email, relationship label, browser role, service
key, or provider identity is not a principal authorization by itself.
_Avoid_: missionary means anonymous, Party equals login, role name authorizes

**Tenant Authorization Context** (Phase 12):
The server-derived, discriminated tenant input to the sole `resolveProjection`
Policy Decision Point. A membership-backed request uses one validated Active
Tenant Assignment. A public/anonymous request uses one validated Public
Projection Context pinned from the requested host, Site, and public resource to
exactly one Tenant and the named public projection; it carries no membership,
internal grant, or private capability. A non-human identity uses one validated
Service Tenant Context pinned to its single-Tenant identity, current human-owner
ceiling, and credential epoch. A platform operator uses one audited,
purpose-bound, time-boxed Operator Tenant Grant Context. Missing, ambiguous,
stale, or client-asserted context fails closed. Every variant uses the same PDP
and floor.
_Avoid_: public request requires fake membership, client-selected tenant,
hostname alone grants access, second public authorization path

**Capability** (Phase 12):
A single, enforced permission — a verb on a resource (e.g. "view a gift record",
"run refunds", "manage permissions"). Capabilities are the _only_ thing the system
checks to make an access decision; roles, groups, and named grants are bundles that
resolve _into_ capabilities. A role or group _name_ is never checked to authorize.
_Avoid_: authorizing on a role/subrole name string; treating a group as the security rule

**Staff group vs named grant** (Phase 12):
A _group_ is a set of staff who share a bundle of capabilities (Finance, Donor Care…) —
an administrative convenience. A _named grant_ gives one person access to one record
(e.g. one restricted worker) for a stated reason, with expiry. Both only ever _add_
capabilities; neither can reach past the floor.
_Avoid_: a "view all" group; a grant that widens a restricted-worker projection

**The floor** (Phase 12):
The subtract-only safety layer — field policy (Phase 3), person security level /
clearance (Phase 10), field gates (Phase 11), purpose/consent, and residency — composed
strictest-wins and applied last. No grant of any kind can add back what the floor removes.
_Avoid_: a configuration path that grants around the floor; a second decision point

**Active Tenant Assignment** (Phase 12; previously “Active assignment”):
The exact active tenant-membership/organization-hat a membership-backed
principal acts within for one request. A person serving several organizations
may have several Tenant assignments but acts within exactly one at a time; the
resolver refuses a membership-backed request without one. A public/anonymous
principal instead uses a Public Projection Context. It is not Phase 21's
Support Assignment, and identifiers must make that distinction explicit.
_Avoid_: active assignment without domain qualifier, client-chosen tenant,
Support Assignment as login context, person-global permission resolution

**EffectiveAccess** (Phase 12):
The runtime-verifiable, short-lived output of the sole `resolveProjection`
Policy Decision Point after the additive capability inputs and subtract-only
floor are applied for one Principal, Tenant Authorization Context, purpose,
target, and governance epoch. A stored grant or visible control is only an
input; it is not the current decision.
_Avoid_: persisted can-access Boolean, role token, trusting a deserialized or
stale decision without required verification

**Legal Entity scope** (Phase 12):
The current subtract-only set of Legal Entities inside one active Tenant that an
EffectiveAccess decision may reach, represented by a canonical set hash and
monotonic revision and rechecked against each entity-bearing target.
_Avoid_: Legal Entity as another Tenant, mutable default as authority, all
entities as an unbounded wildcard

**Purpose** (Phase 12):
The required "for what" input to every access decision — the consent / legal-basis axis.
Being _allowed to see_ a person is not the same as being _lawful to use their data for
this purpose_ (readable ≠ contactable). Bound to the egress surface, from a fixed list.
_Avoid_: a caller-asserted free-text purpose; consent modeled as a second system

**Protected constituent** (Phase 12):
A whole record (person, and everything attached) hidden from non-cleared staff — modeled
as a floor rule that makes the row _vanish_, not a hidden field. A "you can see this person
exists" roster is itself a leak.
_Avoid_: hiding fields but leaving the record visible; a count/roster that reveals existence

**Existence oracle / uniformity** (Phase 12):
A leak where "blocked" and "does not exist" look different (by wording, response shape, or
timing), letting someone infer that a restricted worker exists. The platform makes denied,
purpose-denied, and not-found _indistinguishable_ everywhere, including "view as".
_Avoid_: a distinct "forbidden" vs "not found"; a timing difference on the restricted path

**Contribution (gift)** (Phase 13):
A donor's gift event. One payment can carry several designation lines ("$100 to the Smiths,
$50 to the Kenya well"). Say "gift" to donors/founders; "contribution" for the data model.
_Avoid_: donation-row-as-the-gift, one-gift-one-fund

**Contribution header** (Phase 13):
The top-level record of one payment — who gave, when, how (tender), how much in total, in what
currency, through which site/source. The header is the canonical gift identity.
_Avoid_: the Stripe PaymentIntent as the gift; the header as the money's source of truth for a line

**Designation line** (Phase 13):
One part of a gift directing an amount to exactly one fund or missionary. The database enforces
that the lines always sum to the header total.
_Avoid_: a line with two designations; a gift total that drifts from its lines

**Posting** (Phase 13):
An append-only money-effect entry beneath the ledger. A refund, correction, re-designation,
chargeback, or NSF is a NEW posting — never an edit or delete of a settled row.
_Avoid_: editing money in place; a `status='reversed'` flag instead of a reversing entry

**The effective fold** (Phase 13):
The one derivation that folds the append-only postings into a gift's current ("effective") truth,
ordered by a monotonic per-header sequence. All readers go through it; raw base-row money is never
read directly.
_Avoid_: summing original amounts; two competing effective-value computations

**Tender** (Phase 13):
How a gift was paid — card, ACH, check, cash, or a non-cash asset (stock/securities/crypto,
real estate, in-kind vehicle) or a church remittance. Distinct from the gift's type (one-time vs
recurring) and from its designation.
_Avoid_: tender as gift type; a card-only ledger

**Collection arrangement** (Phase 16):
How a recurring commitment expects future gifts to arrive — provider-automated or
manual/external — including the provenance needed to interpret its expected occurrences. A
fixed-total pledge has no collection arrangement, payment instrument, mandate, or executor; any
automatic support linked to it remains a separately authorized recurring commitment. The
arrangement is independent of the tender recorded on any received gift.
_Avoid_: payment channel as commitment type; provider status as donor intent; collection mode on a fixed pledge

**Gross supported gift** (Phase 13):
The sum of the original positive, non-fee-cover Designation lines for one
contribution occurrence. Together with a separate fee-cover contribution, it
equals the contribution header's hard-tender total.
_Avoid_: net donation, fee-cover blended into a Designation, amount after fees

**Fee-cover** (Phase 13):
An extra estimated-offset contribution on top of the gross supported gift,
configured per tenant and payment method and shown as its own ledger line. It
helps offset payment-processing costs but is neither the provider's exact fee
nor a guarantee that 100% reaches a supported purpose. Phase 20 D19 applies it
first against exact eligible cost for accounting attribution; any surplus
remains fee-cover contribution and any uncovered cost follows the frozen
tenant policy.
_Avoid_: exact fee, net gift, hidden surcharge, guaranteed full cost recovery

**Source code** (Phase 13):
The attribution tag for what DROVE a gift (the July newsletter, a banquet QR, a prayer letter) —
channel × segment × message. Distinct from a campaign (the effort) and a designation (the purpose);
it rides in the URL query (`?sc=`), never the path.
_Avoid_: source code as campaign; free-text source; the code in the URL path

**Giving campaign** (Phase 13):
A staff-defined, time-bounded fundraising effort with goal(s) and reporting rollups. May nest in a
bounded (≤5-deep) parent/child hierarchy. NOT an email blast, a public page, a peer-to-peer
fundraiser, an appeal, a source code, or a designation.
_Avoid_: the email-blast/fundraiser conflation; adding a campaign total to a fund total

**Recurring commitment** (Phase 16):
The canonical record of recurring support: an amount and cadence with no explicitly promised
cumulative balance, even when it has a planned end. Collection may be manual or provider-automated;
provider objects execute collection but never define the donor's intent.
_Avoid_: fixed-total pledge; provider subscription as the commitment; projected total as promised balance

**Gift mode** (Phase 16):
Whether a donor authorizes one gift or recurring giving. A one-time gift has no recurring cadence,
next occurrence, pause, or recurring-support projection.
_Avoid_: one-time as a cadence; one-time gift as an ended recurring commitment

**Recurring cadence** (Phase 16):
The canonical calendar rule for how often one recurring amount is expected. Its meaning is exact
and independent of display wording or provider representation.
_Avoid_: ambiguous biweekly or bimonthly labels; provider interval as donor intent

**Recurring-giving group** (Phase 16):
An explicit donor-facing arrangement that holds one or more recurring commitment lines for one
tenant, one immutable Commitment Party, one legal payer and collection-authorizer context, and one
currency. It is created or changed deliberately and is never inferred from shared donor, contact,
payment, amount, date, or cadence facts.
_Avoid_: inferred household bundle; provider subscription; one mandatory group per donor

**Recurring commitment line** (Phase 16):
One independently manageable, destination-specific recurring intent within a recurring-giving
group. Its identity and history survive changes to how a provider collects it.
_Avoid_: subscription item as business identity; rewriting prior gift allocations

**Billing cohort** (Phase 16):
The lines within a recurring-giving group that can honestly share cadence and anchor semantics,
authorization lineage, connected account and provider Customer, collection behavior and capability,
and one explicit execution-leg set. The cohort has one leg for an ordinary cadence and two monthly
legs for the twice-monthly 1st/15th cadence; its lines share each applicable leg's invoice and
payment. A group has more than one cohort only when a real collection incompatibility requires
separate disclosed charges.
_Avoid_: visual-only grouping of separate charges; arbitrary technical partition

**Composite recurring schedule** (Phase 16):
One donor-authorized cadence that contains more than one fixed collection slot in a period. The
Phase 16 form is twice monthly on the 1st and 15th while preserving one recurring intent.
_Avoid_: every two weeks; duplicate business lines; arbitrary tenant-authored date pairs

**Execution leg** (Phase 16):
One provider-side collection schedule under a billing cohort. An ordinary cadence has one explicit
leg; the twice-monthly composite cadence has two monthly legs. Every leg remains subordinate to the
cohort's canonical recurring intent and the donor manages the cohort as one request.
_Avoid_: hidden second commitment; one leg presented as the whole recurring gift

**Grandfathered cadence** (Phase 16):
An existing recurring cadence that remains active and manageable after a tenant stops offering it
for new selection.
_Avoid_: disabling a choice as cancellation; hiding an existing unsupported-looking schedule

**Monthly equivalent** (Phase 16):
A clearly labeled planning measure that normalizes recurring schedules for comparison. It is not
the donor's actual cadence, a receivable, or money received.
_Avoid_: monthly gift when the cadence is not monthly; recurring projection as cash

**Execution binding** (Phase 16):
The effective-dated link between one recurring execution leg and the external provider object
currently carrying out that leg's collection, together with exact per-leg item bindings for every
participating recurring commitment line. It records execution without becoming donor intent or
business identity.
_Avoid_: provider ID as the commitment; overwriting prior provider links

**Initial recurring gift** (Phase 16):
The first actual contribution authorized while creating a payment-backed recurring commitment. It
fulfills the first scheduled occurrence when the continuing schedule begins that day; otherwise it
remains linked to, but outside, the future continuing series.
_Avoid_: test charge; verification charge; duplicate first recurrence

**Continuing schedule anchor** (Phase 16):
The donor-authorized local calendar date from which a recurring commitment's continuing expected
occurrences are generated in the arrangement's giving timezone.
_Avoid_: settlement date; retry date; arbitrary organization billing day; provider timestamp as intent

**Expected scheduled occurrence** (Phase 16):
An authorized future execution slot generated by a recurring commitment's calendar rule. It is
expected support, not donor debt, a pledge receivable, a payment attempt, or money received.
_Avoid_: invoice as commitment truth; forecast as receivable; retry as a new occurrence

**Recurring schedule epoch** (Phase 16):
An effective-dated version of a recurring commitment line's future calendar intent and its compatible
billing cohort execution. A later epoch changes future expectations without rewriting prior ones.
_Avoid_: editing historical anchors in place; provider subscription as schedule history

**Final eligible gift date** (Phase 16):
An optional, line-scoped, inclusive boundary after which no new scheduled attempt or retry may begin.
Its absence is the automatic checkout default and requires no donor choice or confirmation.
_Avoid_: required end date; hidden duration; last successful gift date; automatic lapse

**Skipped recurring occurrence** (Phase 16):
A donor-authorized suppression of one named, still-unclaimed expected scheduled occurrence. It
creates no debt or catch-up gift and does not move the continuing schedule anchor.
_Avoid_: forgiven receivable; skipped payment retry; re-anchored schedule

**Planned recurring pause** (Phase 16):
A donor-authorized bounded or indefinite interval that suppresses new expected occurrences and
not-yet-started collection attempts while preserving the original schedule grid and relationship.
It is neither payment failure nor lapse nor cancellation.
_Avoid_: delinquent donor; hidden recurring line; provider pause state as the only business truth

**Ended as scheduled** (Phase 16):
The donor-intent state reached when a recurring commitment line passes its final eligible gift date.
It says nothing about whether prior payments succeeded and is not fixed-total pledge completion.
_Avoid_: completed pledge; completed with shortfall; automatic cancellation

**Restarted recurring gift** (Phase 16):
A newly authorized recurring commitment and provider-binding epoch linked to a formerly canceled
gift's visible history. It never resurrects the canceled authorization or collects missed periods.
_Avoid_: reactivating a canceled provider subscription; silent catch-up; overwritten history

**Collection health** (Phase 16):
The payment-backed billing cohort's readiness to collect future scheduled gifts, separate from donor
intent, occurrence payment state, and provider synchronization.
_Avoid_: subscription status as donor intent; processing as lapse; payment failure as cancellation

**Failed-occurrence recovery** (Phase 16):
A bounded opportunity to reattempt one existing failed scheduled occurrence without creating donor
debt, changing the recurring grid, or generating another ordinary occurrence.
_Avoid_: catch-up balance; second recurrence engine; retry as a new scheduled gift

**Recurring collection failure episode** (Phase 16):
A continuous collection-health condition linking a triggering failed occurrence with its later
scheduled recovery cycles until recurring collection succeeds or the donor supplies new authorization.
_Avoid_: donor debt period; cancellation; one mutable failed gift

**Scheduled recovery cycle** (Phase 16):
One of the three later normally scheduled occurrences that remains eligible for failed-occurrence
recovery during the same collection failure episode; it is a new gift occurrence, never old debt.
_Avoid_: calendar recovery month; catch-up installment; retry of the earlier missed gift

**Schedule-only recovery** (Phase 16):
The collection mode after scheduled recovery cycles are exhausted: ordinary scheduled occurrences
continue, but accelerated retry slots do not, until the failure episode resolves.
_Avoid_: retired recurring gift; paused giving; lapsed merely from repeated soft misses

**At-risk continuing support** (Phase 16):
Collection health where scheduled gifts have been missed but donor intent and future safe ordinary
occurrences continue. It is neither received support, donor debt, cancellation, nor lapse.
_Avoid_: active-and-healthy; delinquent donor; automatic gifts stopped

**Schedule-first recovery** (Phase 16):
The rule that an unresolved missed gift closes before the next normal scheduled occurrence becomes
collectable. The current gift is never silently stacked with an older recovery attempt.
_Avoid_: automatic catch-up; two collectable occurrences; retry-driven schedule drift

**Retry slot** (Phase 16):
One bounded opportunity inside a failed-occurrence recovery case, tied to a fixed local candidate
date. An automatic or donor-substituted attempt may consume it, but it never creates extra budget.
_Avoid_: queued job; infrastructure retry; new scheduled occurrence; bonus manual attempt

**Balanced card recovery** (Phase 16):
The platform-owned card profile allowing at most +2/+4 slots for weekly occurrences and +2/+4/+6
slots for every other supported cadence, always subject to stricter live safety facts.
_Avoid_: tenant-authored retry schedule; Stripe Dashboard policy; guaranteed attempt

**Stop recovery for one missed gift** (Phase 16):
The donor instruction that ends every unstarted retry slot for one failed occurrence while leaving
the recurring arrangement and its next normal occurrence intact.
_Avoid_: pause recurring giving; cancel recurring giving; forgive debt

**Material communication transition** (Phase 16):
A payment or recovery state change that gives its recipient genuinely new human meaning and can
therefore justify a new product message. A raw provider attempt, duplicate event, or unchanged retry
failure is not one by itself.
_Avoid_: one email per webhook; one email per processor attempt; retry count as message policy

**Communication intent** (Phases 6, 16, and 17):
The durable, scope-owned pre-dispatch request that one exact meaning be evaluated for one exact
recipient and channel under the shared consent, suppression, rendering, and delivery seam. The
closed scope is either one tenant or the service-only Asym platform owner, never a fake tenant or
caller-selected branch. One permanent, producer-authorized recipient/channel-step occurrence slot
plus server-derived semantic-identity and immutable-command hashes prevents duplicate or
changed-input submission; fan-out uses independent slots. It is not proof that a message was queued,
sent, delivered, read, or understood; an actual communication event is recorded only by the Phase 6
send seam.
_Avoid_: domain-owned email queue; communication event before send; provider message ID as dedupe

**System message contract** (Phase 17):
The platform-owned definition of one system message's meaning and non-delegable safety boundaries,
including its purpose, eligible audience, allowed facts, mandatory content, and safe failure posture.
_Avoid_: editable business rule; arbitrary event trigger; template as product truth

**Catalog completeness inventory** (Phase 17):
The versioned, cited accounting of every current system-message producer, prior product obligation,
known future dependency, historical surface, and deliberate exclusion. Its audit dispositions explain
scope and readiness for cataloging but are not executable lifecycle states.
_Avoid_: template list; roadmap wishlist; every future item as a permanent key

**Executable system-message catalog** (Phase 17):
The code-governed registry containing only stable product-message meanings with immutable keys and
exactly one platform lifecycle state: Reserved, Live, or Retired. Every entry maps to inventory evidence.
_Avoid_: database rows as product truth; provider template catalog; tenant-created event key

**System-message scope kind** (Phase 17):
The closed contract discriminator declaring either one exact tenant scope or an Asym-owned platform
scope. Tenant scope uses tenant-owned publications, permissions, data, recipients, and Resend connection;
platform scope uses fixed service-only publications, verified platform recipients, and the separately
proved Asym platform connection. Every execution/history row carries the exclusive `tenant_id` XOR
`platform_scope_id` owner arc and scope-prefixed keys/FKs. Tenant Party/contact/profile and platform
authority/profile fields are mutually exclusive. Exactly one applies and platform transport is never tenant fallback.
_Avoid_: fake tenant id; nullable scope by convention; request-selected scope; shared tenant fallback

**System-message platform lifecycle** (Phase 17):
The three-state product contract governing whether new message intent is forbidden for future work
(Reserved), accepted through a proven generation (Live), or forbidden after supersession while history
remains readable (Retired). It is independent of publication, tenant readiness, Delivery Plan policy,
and individual delivery or recovery outcome.
_Avoid_: Active Boolean; Ready badge; quarantine as lifecycle; template publication state

**Message activation generation** (Phase 17):
The immutable compiled catalog manifest revision whose applicable automated proof authorizes a stable
set of Live contracts across rolling deployments. Each accepted communication intent pins a compatible
generation so partial activation or later configuration drift cannot change its authority.
_Avoid_: active template row; mutable production manifest; per-tenant activation ceremony

**Tenant message readiness** (Phase 17):
The derived, scope-aware answer for whether a tenant can satisfy one Live message contract now, including
its effective system, organization, site, or locale source and reason. A policy-valid approved fallback
may be ready; platform lifecycle, publication, optional-step suppression, and delivery outcome remain separate.
_Avoid_: globally Live means tenant ready; published means ready; every fallback needs repair

**Tenant message capability envelope** (Phase 17):
The explicit, bounded set of content, branding, channel, audience, timing, enablement, and preference
choices a system message contract permits a tenant. For each role and channel, the contract classifies
the path as required, tenant-and-recipient optional, tenant-optional but role-required when enabled, or
prohibited; the envelope never grants arbitrary data, recipient-query, workflow, or safety authority.
_Avoid_: unrestricted template behavior; custom workflow language; tenant-authored recipient query

**Delivery Plan** (Phase 17):
The effective, versioned selection of contract-permitted delivery steps for a system message at an
allowed scope. For tenant scope, authorized tenant staff publish the plan and may choose only approved
recipients, channels, content, and named product-owned timing or condition options. For platform scope,
the plan is an immutable Asym-owned fixed version declared by the exact meaning-specific platform
profile; tenant configuration cannot select or alter it. Neither form owns triggering truth or arbitrary
workflow logic.
_Avoid_: workflow definition; journey graph; template as scheduler

**Delivery Plan Builder** (Phase 17):
The guided staff experience for assembling a Delivery Plan from required and optional
contract-approved delivery slots. Its visual connections explain the resolved plan; they are not a
tenant-authored execution graph.
_Avoid_: workflow canvas; rules engine; no-code programming

**Delivery Plan occurrence** (Phases 6 and 17):
One immutable, bounded coordination header for an authoritative producer occurrence and the exact
Delivery Plan generation compiled for it. A separate stable producer token owns the occurrence
slot even when no member applies. Phase 6 inserts or exactly replays the complete canonically
ordered child-intent set and marks the header released in one PostgreSQL transaction; changed
source, plan, binding, condition, recipient, or membership under that slot conflicts. The header
proves all-before-any release but never becomes a scheduler, workflow run, queue, communication
ledger, or message-outcome truth.
_Avoid_: batch outcome; workflow header; queue item; independently committed child fan-out

**Delivery Step** (Phase 17):
One contract-permitted recipient-and-channel instruction within a Delivery Plan. When the producing
domain says it applies, every step becomes its own recipient-specific Phase 6 communication intent
beneath the Delivery Plan occurrence and becomes claimable only after the complete occurrence is
released. An external-delivery intent proceeds through its channel executor; an in-product intent
produces one local `available` event and its independent role-safe Phase 17 attention projection,
with no provider submission, provider state, or provider outcome.
_Avoid_: workflow node; provider send; batch-wide outcome

**In-product communication availability** (Phases 6 and 17):
The Phase 6 fact that one role-safe in-product communication exists for its exact tenant, recipient,
and source meaning. It is local delivery truth only, not evidence that the recipient saw, read, acted
on, resolved, or understood it.
_Avoid_: delivered to the person; unread state; task created; recipient aware

**In-product notification item** (Phase 17):
The tenant-scoped, recipient- and role-specific presentation of one available in-product
communication, bound to the system message contract and source occurrence that gave it meaning. It
is not an email copy, business record, task, permission grant, or proof of attention.
_Avoid_: email mirror; notification queue row; task record; permission-bearing message

**Notification attention group** (Phase 17):
A recipient's single triage unit for one meaningful source episode, summarizing related in-product
notification items without merging their individual history or source truth. It cannot combine
tenants, recipients, privacy classes, or incompatible actions.
_Avoid_: raw event count; cross-donor thread; batch outcome; business task

**Notification engagement** (Phase 17):
The recipient-specific presentation facts `seen`, `read`, and `archived`, kept separate from
in-product communication availability and the authoritative source status. Engagement describes
interaction with the presentation; it never completes business work or proves comprehension.
_Avoid_: delivered; resolved; completed; recipient understood

**Notification source status** (Phase 17):
The authoritative fact that the underlying matter remains unresolved, has resolved, been superseded
or canceled, become inapplicable, or is no longer authorized for this recipient. It may change the
notification's presentation but is neither local delivery truth nor recipient engagement.
_Avoid_: inbox-owned business state; archive as completion; read as resolution

**Reserved SMS channel** (Phase 17):
The governed future channel whose consent, suppression, sender, and readiness meanings are defined
while platform transport remains unavailable. It cannot be selected, rendered, tested, queued, used
as fallback, or sent until a later authorized launch removes the platform transport lock.
_Avoid_: disabled tenant feature; dormant Twilio transport; SMS-ready channel

**SMS consent evidence** (Phase 17):
Append-only proof that an exact Party using a specific phone contact-point revision gave permission
to one identified sender for one message subject under a known disclosure, method, and time. A phone
number, preference, email consent, staff note, or absence of a broad restriction is not this evidence.
_Avoid_: SMS opt-in boolean; phone-number consent; preferred channel as permission

**SMS sender-route readiness** (Phase 17):
The evidence-derived status for one tenant, public sender identity, message use case, destination
market, and contemplated route. It requires every applicable registration component to be current
and approved, but it is neither platform availability, recipient consent, nor permission to send.
_Avoid_: tenant registered; SMS enabled; provider object ID as approval

**SMS hard suppression** (Phase 17):
An append-only restriction created by STOP, another reasonable withdrawal, or an applicable safety
condition for an exact recipient, contact point, and sender or service scope. It outranks message
importance and preferences and may be lifted only by sufficient, supported recovery evidence.
_Avoid_: optional topic preference; tenant override; required-message bypass

**Protected SMS control semantics** (Phase 17):
The platform- and provider-governed meanings of opt-out, opt-in, and assistance signals such as STOP,
START, UNSTOP, and HELP. Tenants cannot remove or repurpose them; HELP does not suppress, and a
provider unblock does not by itself restore subject-specific consent.
_Avoid_: tenant-authored keyword workflow; HELP as opt-out; START as blanket consent

**Published message variant** (Phase 17):
One complete approved content expression for a system-message step at a permitted tenant, site,
locale, and channel scope. A scope without its own variant inherits another complete published
variant; parts are never mixed across variants for one message.
_Avoid_: live field overlay; partial runtime override; Frankenstein template

**Message-locale activation** (Phase 17):
The tenant's choice to make one canonical human-language locale eligible for system-message
resolution at a permitted scope. It does not by itself prove that every message is translated or ready.
_Avoid_: site localization; translated-everywhere flag; valid locale tag as readiness

**Contract-locale readiness** (Phase 17):
The evidence-derived result that one system message contract's complete publication and required
immediate recipient experience are safe for one locale and presentation.
_Avoid_: translation-present Boolean; tenant attestation as certification; recipient preference as support

**Brand Kit** (Phase 17):
A complete published set of typed visual identity choices for a tenant organization or permitted site.
It presents the brand but never owns message truth, protected actions, recipient facts, or localized prose.
_Avoid_: mutable theme overlay; template variables; website styles as authority

**Layout Role** (Phase 17):
A platform-owned semantic role selected by an email system message contract to define the minimum
shared frame and protected structural obligations for that class of email.
_Avoid_: tenant-created layout category; visual theme; per-template layout choice

**Role Layout** (Phase 17):
The tenant-designed structured visual email frame for one Layout Role at an organization or permitted
site scope. It may vary broadly while the message contract retains protected meaning.
_Avoid_: complete message template; raw HTML shell; locale-specific layout

**Saved Section** (Phase 17):
A tenant-authored reusable visual starting block that becomes an independent copy when inserted into
a draft. Later changes to the saved source do not alter existing consumers.
_Avoid_: live partial; synchronized runtime fragment; nested include

**System-message publication review floor** (Phase 17):
The minimum review posture a system message contract requires before a committed change can become
the published message. A tenant may require more review but cannot weaken this floor.
_Avoid_: tenant-authored approval rules; optional safety check; one policy for every message

**Protected message publication** (Phase 17):
A publication whose effect on official, security, payment, delivery, or protected-action meaning
requires an independent publication review before it can replace the current published message.
_Avoid_: high-risk label chosen by staff; reviewer-per-send; editable safety classification

**Independent publication review** (Phase 17):
An authorized person's review of a committed protected publication that they did not author or
substantively edit. It supplements contract validation and never permits an unsafe publication.
_Avoid_: self-approval through another role; generic approval workflow; validation bypass

**Tenant message fallback policy** (Phase 17):
The tenant's published choice between the platform's permitted language-first and
site-wording-first resolution postures for eligible system-message content. It orders only
complete compatible published variants and cannot create locale graphs, widen a message contract,
cross tenant or site boundaries, or override a message's fixed safe-failure behavior.
_Avoid_: custom fallback chain; tenant rules graph; unrestricted locale priority

**Structured message document** (Phase 17):
The one canonical, versioned subject, preheader, and structured content source for a complete
published message variant. HTML and plain text are deterministic compiled outputs, not independent
editable sources, and the document never owns recipient selection or business truth.
_Avoid_: raw HTML template; three content sources; browser output as canonical truth

**Message document compatibility schema** (Phase 17):
The platform-owned, versioned vocabulary that can safely recognize supported and intentionally
retained legacy message nodes. A system message contract separately decides which recognized nodes
are writable, required, restricted, or forbidden for one message.
_Avoid_: different ProseMirror schema per message; silent unknown-node deletion; tenant block plug-in

**Portable message layer** (Phase 17):
The tenant-authored message source, reusable content, safe variable declarations, and eligible assets
that can stand independently of recipient data and destination-owned identity or authority.
_Avoid_: complete tenant state; sent email; provider template

**Asym Message Package** (Phase 17):
A versioned, integrity-protected representation of one or more Portable message layers that can be
exported and restored without carrying recipient, provider, consent, approval, or secure-action authority.
_Avoid_: database dump; vendor template file; tenant backup

**External message conversion** (Phase 17):
The evidence-bearing transformation of a supported foreign message source into a new Structured message
document, with every unsupported, changed, removed, replaced, or unresolved meaning disclosed.
_Avoid_: exact native round-trip; silent import; executable foreign template

**Message conversion report** (Phase 17):
The destination-safe account of what an External message conversion copied, rebound, changed, could not
use, or still requires staff to resolve before publication.
_Avoid_: raw parser log; success Boolean; lossless claim

**Message transfer offer** (Phase 17):
A revocable, time-bounded source authorization allowing one verified destination organization to accept
an independent copy of named immutable Portable message layers.
_Avoid_: cross-tenant write; public share link; live synchronization

**Destination-owned message copy** (Phase 17):
A new independent draft created for the accepting organization with destination identities, assets,
contracts, permissions, and publication authority rather than live source dependencies.
_Avoid_: moved template; shared source; inherited approval

**Protected message block** (Phase 17):
A small, visible, typed component whose authoritative facts, indispensable meaning, safe destination,
privacy projection, or accessible function come from the owning producer and System message contract.
Staff retain the contract's safe styling and movement freedom but cannot alter, remove, duplicate,
split, hide, redirect, image-convert, deceptively relabel, track, or make the protected meaning inaccessible.
_Avoid_: locked whole template; disabled UI as security; pasted password-reset URL; tenant-removable required notice

**Minimum source-owned truth core** (Phase 17):
The smallest set of Protected message blocks a Live contract can prove must remain producer-owned so
the surrounding tenant-authored system message cannot falsify authoritative facts, remove indispensable
official or safety meaning, weaken a protected action, widen a privacy projection, or hide required
identity or accessible function. Every protection names its source, evidence, applicability, safe
freedom envelope, and nearest legitimate source action; ordinary tenant content remains editable.
_Avoid_: universally locked official template; legal clause builder; tenant-authored lock policy

**Protected action handoff** (Phase 17):
A purpose-bound path from a governed message into producer-owned proof or an authorized service
experience; merely opening it never performs a consequential action.
_Avoid_: editable action URL; email-click mutation; template-owned credential

**Producer capability** (Phase 17):
A one-time proof issued and redeemed by the domain that owns the protected action while Phase 17
presents only its governed purpose and recipient experience.
_Avoid_: generic Phase 17 token; reusable action link; template-derived authority

**Authenticated service doorway** (Phase 17):
A protected entry into a tenant-bound service experience that establishes current authorization before
opening any short-lived downstream session or consequential review.
_Avoid_: emailed provider session; unauthenticated billing link; return redirect as completion proof

**Compiled message artifact** (Phase 17):
The immutable, pre-recipient HTML and plain-text output plus dependency versions, asset manifest,
hashes, and validation evidence produced by the server-authoritative compiler for one committed or
published structured message document.
_Avoid_: live editor render at send; mutable layout dependency; personalized donor body as template source

**Needs-migration message document** (Phase 17):
A preserved structured message document that the current compatibility and policy layer cannot
safely edit or publish without an explicit loss-detecting migration. It remains read-only and is
never silently stripped, blanked, or autosaved.
_Avoid_: best-effort normalization; empty-document recovery; destructive bulk migration

**Message fact contract** (Phase 17):
The producer-owned, versioned vocabulary of approved facts, presentation cases, item sets, and
protected action purpose that one system message may present without deciding or querying business truth.
_Avoid_: source schema path; arbitrary record access; template expression language

**Prepared message identity** (Phase 17):
The stable identity of one recipient's fully resolved message truth and exact published presentation,
used to recognize the same delivery across safe retries and reconciliation.
_Avoid_: render exactly once; mutable re-render after submission; provider message ID as message truth

**Contract-owned whole-message recovery** (Phase 17):
The message contract's safe-failure rule that may select another complete compatible publication only
before a recipient message is prepared; after preparation or possible submission, recovery preserves
the exact prepared message and reconciles its original outcome rather than changing its content.
_Avoid_: fragment fallback; rerender after submission; provider failover; send-anything emergency copy

**Compatible prior publication** (Phase 17):
A complete immutable publication from the same permitted scope that the current System message
contract proves remains safe for the present audience, locale, sender, legal identity, facts, layout,
Brand Kit, and protected-action context. It is not merely the last publication sent or published.
_Avoid_: last-used template; arbitrary historic version; tenant-selected rollback target

**Delivery outcome unknown** (Phases 6 and 17):
The truthful state where provider acceptance cannot be proved or ruled out for one exact prepared
message. It requires reconciliation and never permits a guessed replacement or differently rendered
message for the same communication meaning.
_Avoid_: failed; safe to resend; provider accepted; recipient delivered

**Message repair case** (Phase 17):
One exact-scope-owner operational attention item grouping the same actionable system-message
failure cause, its recipient impact, responsible owner, and governed repair path without becoming
communication truth, recipient content, or a separate workflow product. Tenant cases preserve
tenant/site boundaries; platform cases are service-only and never appear in tenant surfaces.
_Avoid_: one task per failed recipient; generic incident ticket; template error as recipient truth

**Message transport batch** (Phase 17):
An operational grouping of distinct recipient messages submitted together through Resend while each
message keeps its own exact scope-owner boundary, identity, delivery state, and retry outcome. A
batch is wholly tenant-scoped or wholly service-only platform-scoped and can never mix owners.
_Avoid_: BCC personalization; cross-owner batch; batch-wide delivery truth

**Tenant-owned Resend connection** (Phase 17):
The tenant's single active Resend account relationship for system email, including its governed
Sender Profile set, sending authority, delivery-evidence authority, and current readiness.
_Avoid_: shared Asym tenant-mail account; per-message provider account; emergency sender substitution

**Sender Profile** (Phase 17):
A tenant-owned, reusable recipient-visible `From` identity on the exact Tenant-owned Resend
connection domain, with immutable revisions and bounded site or Sender Purpose assignments.
_Avoid_: template From field; Resend sender object; reply mailbox; dynamic per-recipient sender

**Sender Purpose** (Phase 17):
A platform-owned semantic category from the Live System message catalog that constrains where one
stable Sender Profile may be used, independently of message content and Human reply purpose.
_Avoid_: tenant routing taxonomy; template category; custom sender rule; Reply-To purpose

**Resend credential revision** (Phase 17):
One attributable version of the tenant-provided send authority, kept distinct so replacement and
in-flight communication can retain their exact original authority.
_Avoid_: editable API key field; overwritten secret; provider credential in a delivery profile

**Resend webhook authority** (Phase 17):
The exact tenant-connection or structurally separate platform-connection trust evidence used to
authenticate Resend delivery events before they may affect Asym communication history.
_Avoid_: one global tenant webhook secret; payload tag as authorization; unsigned delivery event;
platform webhook used to resolve tenant messages

**Email delivery readiness** (Phase 17):
The fail-closed result derived from current credential, sender, domain, delivery-event, tracking,
profile, and safety evidence for one tenant-owned Resend connection or the separately scoped Asym
platform connection.
_Avoid_: connected Boolean; successful API-key paste; heuristic deliverability score

**Human reply posture** (Phase 17):
The System message contract's explicit declaration that a recipient's human reply is supported or
deliberately not expected, including the governed help behavior for the latter.
_Avoid_: blank Reply-To setting; omitted header as policy; template-authored reply behavior

**Human reply purpose** (Phase 17):
The platform-owned operational reason and responsible team category for a supported human reply,
derived only from materially distinct owners in the Live system-message catalog.
_Avoid_: tenant routing taxonomy; subject-matching rule; arbitrary department label

**Human reply destination** (Phase 17):
One tenant-accountable mailbox mapped to a Human reply purpose after mailbox access and monitoring
responsibility are confirmed; replies remain outside Asym until the inbound phase records them.
_Avoid_: template Reply-To field; dynamic assignee address; Asym support conversation

**Mailbox access confirmation** (Phase 17):
Point-in-time evidence that an authorized tenant administrator could retrieve a challenge from one
Human reply destination; it is neither legal ownership nor continuous monitoring proof.
_Avoid_: Resend domain verification; delivered challenge; mailbox health

**Monitoring responsibility confirmation** (Phase 17):
A named authorized tenant administrator's statement that a real team accepts and monitors one Human
reply destination, kept separate from mailbox-access and provider-delivery evidence.
_Avoid_: continuous monitoring telemetry; Healthy badge; provider-delivered event

**Support-safe projection** (Phase 17):
The recipient-visible wording and layout of an eligible communication with credentials, protected
destinations, and other forbidden content omitted while preserving what authorized staff need to understand.
_Avoid_: raw provider email; regex-redacted archive; credential-bearing preview

**Recent sent copy** (Phase 17):
A short-lived, recipient-specific support-safe projection of one eligible tenant email retained only so authorized
tenant staff can resolve recent recipient questions; it is not permanent communication truth or an official document.
Platform-scoped messages retain body-free evidence only and have no readable-copy branch in this generation.
_Avoid_: sent-mail archive; communication event body; retry payload; provider log

**Readable sent-copy retention** (Phase 17):
The organization-wide maximum time ordinary eligible Recent sent copies remain readable in Asym,
further limited by each System message contract's safety ceiling.
_Avoid_: email retention; keep forever; per-template retention rule

**Communication delivery profile version** (Phases 6 and 17):
An immutable, non-secret, scope-owned email-delivery snapshot. The tenant branch binds one exact
Sender Profile revision, validated site and Sender Purpose, Human reply posture and—when Reply-To is
emitted—one exact destination and tenant email-settings revision/hash. The service-only platform
branch instead binds the fixed Asym sender/reply policy and platform email-settings revision/hash,
with every tenant field null. It supplies delivery configuration, never consent, template content,
recipient authority, domain eligibility, or a provider credential.
_Avoid_: mutable sender setting on a reminder; template as reply-to authority; provider API key in domain data

**Required-notice override** (Phase 16):
A current network, payment-rail, jurisdiction, provider, authorization, or authentication duty that
requires communication even when the product's normal same-state quiet period would suppress a
discretionary message. It is effective-dated, attributable to a rule and delivery owner, and
evidenced separately.
_Avoid_: optional reminder; tenant preference overriding a mandatory notice; silent compliance guess

**Communication delivery owner** (Phase 16):
The one recorded party responsible for sending a particular message reason for a tenant, provider
account, rail, mode, and jurisdiction: Asym, the provider/network/bank, or intentionally nobody when
no message is required. Two owners must never send the equivalent message.
_Avoid_: duplicate Stripe and Asym email; template as sender policy; unowned mandatory notice

**Donor-substituted retry** (Phase 16):
A donor-confirmed attempt to collect the named scheduled gift now that atomically consumes or fences
the earliest remaining retry slot before charging. Updating a payment method alone never performs
this action, and it never creates additional retry budget.
_Avoid_: generic give once during an active retry window; save-card-and-charge; bonus retry

**ACH authorization lineage** (Phase 16):
The effective-dated, tenant- and provider-bound history of one reusable bank-debit authority and its
credential continuity. Account verification, a reusable token, and payment success are not themselves authorization.
_Avoid_: bank account as mandate; verified means authorized; replacing history when a token changes

**ACH recovery-open occurrence** (Phase 16):
An exact returned billing-cohort occurrence that remains eligible for one donor-confirmed ACH
reinitiation. It is unresolved and recoverable, not terminally missed or money the donor owes.
_Avoid_: missed gift; outstanding balance; automatic retry queue

**Donor-confirmed ACH reinitiation** (Phase 16):
One donor-authorized re-presentation of the exact eligible returned billing-cohort occurrence under
the same proven ACH identity and authorization lineage. It never changes the normal schedule or collects another miss.
_Avoid_: card retry slot; generic new PaymentIntent; catch-up debit; staff-initiated bank retry

**ACH return-exposed success** (Phase 16):
A provider-confirmed ACH success that can post and receipt but can still be corrected by a later bank
return. A later return appends a reversal and supersession instead of rewriting the original success.
_Avoid_: irreversible settlement; guaranteed final ACH payment; overwriting successful history

**Safety-suppressed occurrence** (Phase 16):
An expected occurrence for which no debit was initiated because an earlier bank debit remained
unresolved or another live safety gate failed. It is neither donor-skipped nor failed nor debt.
_Avoid_: missed payment; donor skip; catch-up balance; schedule drift

**Terminal missed occurrence** (Phase 16):
An expected occurrence whose collection and permitted recovery opportunities have ended without a
received gift. It can never reopen or become a balance collected by a later occurrence.
_Avoid_: recovery available; overdue invoice; dormant retry candidate

**Pledge expectation plan** (Phase 16):
An optional, evidence-bound, non-executing arrangement of named expected dates and amounts for a
fixed-total pledge; it may cover all or only an explicitly identified part of the remaining promise.
Its absence is an honest no-plan state, and by itself it never charges, invoices, creates debt, posts
cash, or authorizes a reminder.
_Avoid_: payment schedule; automatic collection plan; fabricated due dates; installment receivable

**Unscheduled pledge expectation** (Phase 16):
The explicit remaining promised amount of a fixed pledge that genuinely has no dated installment
schedule. It is an expectation target, not a fabricated occurrence, invoice, or cash balance.
_Avoid_: fake due date; overall balance used as a silent allocation shortcut; donor debt

**Donor-requested pledge change** (Phase 16):
An accepted, evidence-backed change to a fixed-total pledge's current donor terms made on the
Commitment Party's instruction. It preserves the earlier promise and received-gift history.
_Avoid_: direct edit; plan-only timing change; internal expectation release; entry correction

**Donor-requested pledge ending** (Phase 16):
An accepted Commitment Party instruction that resolves the still-unfulfilled part of a fixed-total
pledge as no longer intended. It preserves the original promise and fulfillment history and does not
itself prove that automatic collection stopped.
_Avoid_: internal expectation release; provider cancellation; fulfilled pledge; accounting write-off

**Internal expectation release** (Phase 16):
The organization's decision to stop forecasting an exact unfulfilled pledge amount without asserting
that the Commitment Party changed the promise. It is neither fulfillment, a collection stop, nor an
accounting write-off.
_Avoid_: donor cancellation; forgiven donor debt; received gift; provider stop

**Pledge entry correction** (Phase 16):
An evidence-backed replacement or invalidation of a fixed-total pledge fact that was wrong when
recorded, with the erroneous fact retained in history. It is not a later donor change or internal release.
_Avoid_: hard delete; silent overwrite; donor amendment disguised as correction; cross-tenant move

**Pledge authority review** (Phase 16):
The quarantine for a fixed-total pledge whose original authorization is disputed or not yet proven;
it is excluded from active forecasting and reminders until evidence resolves it.
_Avoid_: automatic correction; assumed donor ending; active promise while authority is unknown

**Applied above current commitment** (Phase 16):
The derived amount by which authoritative fulfillment exceeds a later valid current donor-affirmed
pledge total. It does not by itself create a refund, future credit, negative remaining expected amount,
or receipt change.
_Avoid_: overpayment automatically owed back; unapplied gift; catch-up credit

**Fulfillment application** (Phase 16):
An append-only, exact-amount relationship showing that one effective contribution designation line
satisfied one named expected occurrence or unscheduled pledge expectation.
_Avoid_: mutable paid counter; commitment-header payment; fuzzy match as fact

**Fulfillment operation** (Phase 16):
One authoritative instruction that groups the complete set of fulfillment applications for a gift
or correction so the allocation is understood and accepted as one whole.
_Avoid_: unrelated row edits; partially accepted allocation; cloned gift or receipt

**Fulfillment authority** (Phase 16):
The proven current source of intent that permits a new fulfillment application or reapplication:
complete frozen provider lineage, an authenticated donor instruction, an approved exact remittance
mapping, or staff confirmation.
_Avoid_: name, date, amount, memo, OCR, soft credit, or relationship similarity as proof

**Fulfillment correction evidence** (Phase 16):
The immutable canonical source-correction or staff match-correction fact that authorizes an inverse
or uncertain-vector retraction against exact prior fulfillment operations and entries. It is distinct
from application authority and remains usable when that earlier authority has expired or been revoked.
_Avoid_: reusing stale donor/provider/remittance authority; blocking a refund or return on old authority

**Commitment match** (Phase 16):
The independently stated relationship between a received gift and the support expectation it
fulfills. Its certainty never changes whether the gift itself was received or correctly designated.
_Avoid_: “unapplied” as if money were missing; matching status as payment finality

**Coverage under review** (Phase 16):
The honest state used when a correction leaves several prior fulfillment applications affected but
the evidence cannot identify which expectation changed. No affected period is claimed as definitely
fulfilled until the allocation is resolved.
_Avoid_: oldest-first guess; newest-first guess; silent proportional reversal

**The effective fulfillment fold** (Phase 16):
The one derived view of current commitment coverage after append-only applications, inverses, and
review holds. Donor, staff, missionary, reporting, and automation projections share this truth.
_Avoid_: mutable fulfillment total; role-specific arithmetic; stale projection authorizing a write

**Current support summary** (Phase 16):
A role-safe, freshness-qualified interpretation of one recurring commitment line or fixed pledge at
one evaluation time. It is derived from underlying facts and is never a writable donor status.
_Avoid_: donor health label; manually entered on-track status; provider status copied as support truth

**Support attention reason** (Phase 16):
A factual concern that can coexist with the current lifecycle statement, such as recovery in progress,
a prior scheduled gift not received, or coverage under review.
_Avoid_: one worst-state badge; hidden secondary fact; person-level risk score

**Collection lapse** (Phase 16):
The billing-cohort state where future automatic collection is proved unavailable or safely parked.
Its consequence may appear on permitted line projections, but it is never a label for the donor.
_Avoid_: missed gift; paused or canceled donor; historical supporter; ordinary soft-failure count

**Projection freshness** (Phase 16):
The stated point through which every required source fact is known current enough to support a derived
summary. Stale or contradictory inputs require updating/review language, not a confident conclusion.
_Avoid_: hidden stale cache; unknown defaults to active; old status presented as current

**Offline review-after instant** (Phase 16):
The bounded, timezone- and resolver-qualified operational instant after which an expected manually
delivered gift needs staff attention. It never replaces the donor's promised date or creates debt,
receipt, fulfillment, or accounting truth.
_Avoid_: rewritten due date; automatic donor blame; organization-wide arbitrary billing date

**Historical support band** (Phase 16):
A relationship-reporting facet based on prior support recency. It is not collection lapse, current
commitment health, donor intent, or authorization.
_Avoid_: lapsed donor; current recurring status; trigger treated as financial truth

**Received support for a period** (Phase 16):
Effective legal-money designation value credited within one governed reporting period and viewer
scope. It is not planned support, processor payout, or spendable field-account balance.
_Avoid_: scheduled gift as cash; pending ACH as received; commitment total as revenue

**Online recurring month plan** (Phase 16):
The full calendar-month set of normal automatic-online recurring occurrences, counted once each and
partitioned by actual outcome. Retries and recovery update an occurrence but never add planned support.
_Avoid_: future-only schedule mislabeled as the full month; retry as another expected gift; guarantee of cash

**Monthly support goal coverage** (Phase 16):
A planning comparison between the current authorized Phase 28 Support-Raising Goal Version and
cadence-normalized recurring support, with health and collection composition visible. When no compatible
Phase 28 goal exists, the comparison is absent rather than zero. A Phase 21 Approved Support Plan Version
is never a silent denominator. It is neither received cash, a Field Account balance, nor a dated forecast.
_Avoid_: percent raised; monthly equivalent as actual cadence; fixed-total pledge divided into monthly support

**Support projection snapshot** (Phase 16):
A role-safe, currency- and period-scoped set of received, planned-occurrence, and goal-coverage facts
qualified by its source cursors and freshness. It is read-only and never authorizes money movement.
_Avoid_: mutable dashboard counter; stale value presented as current; projection used as payment authority

**Commitment Party** (Phase 16):
The one person, household, or organization Party whose declared giving intent a commitment records; the owner is immutable business history unless a governed same-Party merge repairs its identifier.
_Avoid_: payer; service contact; Stripe customer; recognized supporter; editable owner

**Representative authority** (Phase 16):
Evidence that an identified person may act for another Party within stated purposes, actions, and effective dates. It is distinct from an ordinary relationship, staff capability, portal identity, or payment authorization.
_Avoid_: treasurer title as permission; household membership as access; generic authorized-contact flag

**Service contact** (Phase 16):
A recipient and contact point designated for a particular commitment communication purpose. Receiving a message grants no ownership, access, management authority, payment authority, legal-donor status, or recognition.
_Avoid_: primary contact as authorized representative; email recipient as commitment owner

**Campaign commitment reminder** (Phase 16):
A purpose-specific stewardship communication about one current named fixed-total pledge expectation. It is neither a recurring-payment notice nor a claim that the Commitment Party owes a debt or failed to give.
_Avoid_: collection notice; invoice; recurring-payment failure message; generic scheduled gift reminder

**Gentle reminder profile** (Phase 16):
The one bounded campaign-commitment reminder shape: at most one courtesy message before a named expected date and one source-aware follow-up after its review window. It is not a tenant-authored cadence or communication journey.
_Avoid_: dunning sequence; repeat until paid; custom reminder workflow; due-date message

**Tenant reminder maximum** (Phase 16):
The organization-wide ceiling allowing no automated campaign commitment reminders, only the upcoming stage, or the upcoming stage plus one follow-up. It can only narrow platform behavior and never authorizes contact by itself.
_Avoid_: per-pledge cadence; force-send setting; automatic enrollment; policy bypass

**Pledge reminder enrollment** (Phase 16):
The deliberate, current-plan choice to make the tenant-permitted reminder stages available for exact named expectations and one current purpose-bound Service contact. A saved date, imported pledge, tenant setting, or prior plan is not enrollment.
_Avoid_: reminder-by-default; schedule as consent; inherited enrollment; import opt-in

**Reminder candidate** (Phase 16):
One derived opportunity for an enrolled Gentle reminder profile stage. It is neither permission nor a queued or delivered message and must still satisfy current pledge, source, recipient, policy, and duplicate truth.
_Avoid_: guaranteed send; provider-scheduled email as authority; stale queued reminder

**Upcoming commitment reminder** (Phase 16):
The first possible Gentle reminder profile stage, fixed thirty calendar days before a current named expected date. A passed stage is skipped rather than sent as catch-up.
_Avoid_: arbitrary lead time; due-date notice; late backfill

**Source-aware commitment follow-up** (Phase 16):
The second possible Gentle reminder profile stage at the Offline review-after instant, available only when current fulfillment, matching, coverage, recipient, and communication policy still make it truthful and permitted.
_Avoid_: automatic overdue notice; follow-up despite stale source; third reminder

**Purpose-specific reminder stop** (Phase 16):
A recipient instruction ending future campaign commitment reminders for the governed purpose and contact point without changing the pledge, its expectations, or broader authority.
_Avoid_: pledge cancellation; donor-requested pledge ending; global contact preference inferred from one stop

**Expected remitter** (Phase 16):
An optional, provenance-bearing expectation about who may transmit a future commitment payment. It is a matching hint only, never fulfillment, legal-donor, receipt, ownership, or collection authority.
_Avoid_: expected payer as legal donor; remitter hint as cash; payer field as permission

**Collection authorizer** (Phase 16):
The identified human and evidence approving one version of an automatic payment arrangement's terms and future use. A saved payment method, prior successful charge, representative relationship, or staff capability is not this authorization.
_Avoid_: payment-method holder inferred from token; contact as mandate signer; staff approval as donor consent

**Party instruction** (Phase 16):
Evidence that the commitment Party or its currently authorized representative requested exact commitment terms or a specific lifecycle change. It is distinct from staff capability, payment authorization, and notification after the fact.
_Avoid_: staff says donor approved; relationship as instruction; audit entry as consent

**Staff-assisted recurring-support command** (Phase 16):
A recurring-support action operated by tenant staff from a Party instruction, with separate operator authority and any required collection authorization. Staff operate the service case but never impersonate the Party, representative, cardholder, or account holder.
_Avoid_: proxy consent; staff impersonation; capability-only financial change

**Protective collection block** (Phase 16):
A governed stop on future automatic collection because collection is unsafe or unauthorized, while preserving the underlying commitment intent and truthful reason. It is neither donor cancellation nor permission to redirect, retry, or enlarge support.
_Avoid_: forced cancellation; silent redirection; compliance stop as donor choice

**Posted legal donor** (Phase 16):
The contribution-specific Party frozen on a received gift's legal header from its actual evidence. It is never copied blindly from the commitment Party, expected remitter, collection authorizer, or recognition.
_Avoid_: commitment owner as automatic receipt owner; payer hint as hard credit

**Recognition Party** (Phase 16):
A Party receiving Phase 14 recognition-only attribution for a contribution or support relationship. Recognition never owns the commitment, authorizes action, fulfills an occurrence, becomes cash, or receives a tax receipt.
_Avoid_: soft credit as promise ownership; recognition as legal giving; recognition as payment authority

**Normal-date ACH soft-return runway** (Phase 16):
The collection-health window tracking repeated normally scheduled insufficient-funds returns on one
authorization lineage, independently of whether an individual occurrence is recovered by the donor.
_Avoid_: donor debt aging; recovery attempt count; cancellation timer

**Communication delivery evidence** (Phase 16):
The append-only facts showing what happened to a communication intent, such as queued, submitted,
provider accepted, delivered to the recipient's mail server, delivery unconfirmed, suppressed,
bounced, complained, corrected, or manually resent. None proves the person read or understood it.
_Avoid_: donor aware; sent means read; overwriting a prior message after corrected payment truth

**Recurring executor** (Phase 16):
The provider-side collection arrangement for one compatible recurring billing cohort. It has one explicit execution leg for an ordinary cadence and two monthly legs for the twice-monthly 1st/15th cadence. Each applicable line has an exact provider-item binding in each leg. It is separate from the donor's group or line intent, Asym's command posture, and any individual payment outcome.
_Avoid_: commitment; recurring status; payment method; schedule alone

**Provider-control state** (Phase 16):
The evidence-backed truth about whether Asym can currently observe and safely direct a recurring executor through its payment provider. It is separate from donor intent, executor activity, payment outcome, cash, and communication delivery.
_Avoid_: Stripe status; active or inactive; connection flag; donor lifecycle

**Control unknown** (Phase 16):
A provider-control state in which Asym cannot prove safe control of the recurring executor or prove that the executor has stopped. Suppressing Asym commands is not provider-confirmed stop.
_Avoid_: parked; paused; stopped; canceled; safe

**Proof-gated cohort recovery** (Phase 16):
The return of only those affected recurring executors whose same-binding identity, current control, missing-interval and in-flight reconciliation, authorization, and absence of a competing executor have all been proven. Reconnection alone is never recovery.
_Avoid_: reconnect and resume; replay everything; bulk restore by staff assertion

**Lapsed vs canceled** (Phase 16):
Lapsed is a derived display label used only when future automatic collection is
actually unavailable or safely parked for an involuntary, recoverable reason;
repeated soft missed occurrences alone remain at-risk continuing support.
Canceled means the donor chose to stop and is terminal for that authorization.
The authoritative facts remain separate intent, schedule, collection, payment,
provider-control, and health axes.
_Avoid_: writable lapsed status; folding an involuntary lapse into canceled;
marking repeated ordinary misses lapsed

**Hard credit** (Phase 14):
The single legal donor's receiptable claim on a gift (Phase 7 A8); the only input
to the Legal vocabulary.
_Avoid_: two hard credits on one gift; hard credit as a recognition row

**Soft credit (recognition)** (Phase 14):
A recognition-only, structurally non-receiptable (`is_receiptable = FALSE`)
`contribution_credits` row; never mints a receipt, never enters a money total.
_Avoid_: a credit amount in any receipt/deductible/cash/ledger sum

**Credit role** (Phase 14):
The TEXT+CHECK why-this-party-is-recognized label on a credit row; fixed v1
registry, each role in exactly one amount class.
_Avoid_: tenant-custom roles (those are Phase 11 custom fields); reports that
inspect roles case-by-case instead of dispatching on the class

**Amount class** (Phase 14):
The role registry's arithmetic contract for a credit's amount — `allocation`
(required and bounded; member rows under one line sum ≤ that line),
`recognition` (defaults to full scope; cross-party sum deliberately unbounded —
both-spouses-full is legal), `annotation` (always NULL; never in any sum).
_Avoid_: bounding recognition across parties; an annotation carrying an amount

**The recognition fold** (Phase 14):
The ONE canonical read model deriving recognition amounts
(`LEAST(amount_minor, scope_effective_minor)`, 0 when the scope is
reversed/voided), keyed on the Phase 13 `effective_seq` cursor; the sole
aggregator every credit surface consumes.
_Avoid_: a second recognition aggregator; a raw-table credit sum

**Legal vs Recognition vocabulary** (Phase 14):
The permanent two-vocabulary reporting split: "Legal giving" (hard credit only,
the Phase 13 effective fold) vs "Recognition giving" (the recognition fold over
credits) — side-by-side is fine, blended is never fine (the CiviCRM "Both" trap).
_Avoid_: one mixed column summing both; a money surface that doesn't declare
which vocabulary it speaks

**Credit generation run** (Phase 14):
The resumable, idempotent fan-out job record behind generator-minted credits
(full-target-set upsert against the identity key).
_Avoid_: a fan-out that duplicates rows on retry or cannot resume mid-batch

**DAF sponsor / DAF advisor / advisor identity tier** (Phase 14):
The fund-owning charity (per-tenant org party, `org_type = daf_sponsor`) — the
hard-credit legal donor of a grant; the recommending human behind it —
recognition-only, thanked with a $0 non-receipt acknowledgment; and the
per-grant record of what the sponsor's paperwork disclosed
(`full | fund_name_only | anonymous`).
_Avoid_: receipting the advisor; a global shared sponsor registry

**Fund-name memory** (Phase 14):
Confirm-once rules mapping (sponsor, fund name) → an attributed household, with
provenance chips and inline reversibility.
_Avoid_: silent auto-attribution without a staff-confirmed rule

**Tribute / honoree / notify party** (Phase 14):
The reusable honor-or-memorial record; the person it honors (party-linked or
name-only); a person watching the tribute with channel/frequency/total
preferences.
_Avoid_: a junk party for a name-only honoree; a notify party modeled as a donor

**Coverage item** (Phase 14):
A `tribute_notification_items` row — the (notify party, header) truth of who
has been told about which gift, written in the letter's transaction.
_Avoid_: deriving coverage from send events; per-tribute coverage grain (a
watcher of two merged tributes would be told twice)

**Decay cadence** (Phase 14):
The age-anchored tribute-letter pace (weekly in tribute weeks 0–4, then
≥28-day gaps); no automatic stop ever — an uncovered gift always eventually
composes.
_Avoid_: an automatic stop; a fixed calendar pace that turns a gift trickle
into 52 condolence letters a year

**Matching expectancy** (Phase 14):
The anticipated-but-not-money record of an employer match; advisory amounts
only, never in any fold.
_Avoid_: an expectancy in any money surface (neither Legal nor Recognition);
expectancy as a pledge

**Settlement link** (Phase 14):
The `matching_gift_settlements` junction row binding one received employer line
to one expectancy; the line IS the amount.
_Avoid_: an amount column on the settlement; a 1:1 spawned-header column (dies
on the first real batch check)

**Payer-of-record** (Phase 14):
The legal donor of a match/workplace check: whoever actually paid (defaults to
the employer; intermediaries like GE Foundation/Benevity are real payers).
_Avoid_: receipting the employer for an intermediary-paid check

**Payer intelligence registry** (Phase 14):
`party_payer_aliases`: org-keyed payer alias strings with `payer_kind`, feeding
one matcher and one triage surface; unmatched strings fail closed.
_Avoid_: separate DAF and workplace matchers; silently misfiling an unmatched
payer string

**Supporter roster / support path** (Phase 14):
`getSupporterRoster`: the designation-centric read model showing one row per
supporting party with direct and via-paths, both lenses, zero copies. A support
path is one element of a roster row's `paths[]`:
`{path_kind, via_party, legal/recognized amounts, dates}`.
_Avoid_: a materialized roster table; per-path rows that double-count a party

**Attribution Inbox** (Phase 14):
The finite, owned worklist of Not-Provided DAF gifts (the same worklist idiom
reused for matching-gift aging and tributes awaiting setup).
_Avoid_: per-record nag emails; an unbounded review queue

**Gift-entry batch** (Phase 15):
`gift_entry_batches`: the professional offline-entry container — draft →
validate → commit — distinct from `contribution_operation_batches` (bulk
_actions_ over existing gifts). The one front door: all staff-entered offline
money enters through its single commit service (D1).
_Avoid_: reusing `contribution_operation_batches` for entry; a second offline
money-write path that bypasses the batch commit

**Quick entry** (Phase 15):
The keyboard-first grid (TanStack Table + Virtual) where an operator keys a
stack of mail gifts fast, no mouse, one row per gift.
_Avoid_: a mouse-driven form per gift; a grid slower than Excel that breeds
shadow spreadsheets

**Validation (non-mutating, revision-bound)** (Phase 15):
The repeatable pre-commit check over a batch revision — it reads and reports,
never mutates, and its verdict is bound to the revision it ran against (a later
edit re-opens validation).
_Avoid_: validation that writes rows; a stale pass carried across an edit

**Control total + governed override** (Phase 15):
The expected count/amount the operator declares up front, checked against
entered totals; a mismatch is never silently erased — the declared originals
stay frozen and an override is an audited, reason-carrying event (D2).
_Avoid_: silently overwriting the declared total; an unlogged override

**Validate = post** (Phase 15):
The D5 default: a clean validate IS the commit — there is no separate always-on
approve gate. A second approver / quorum is an opt-in per-tenant control.
_Avoid_: a mandatory second-approver step on every batch; treating approve as a
distinct always-on stage

**High-risk auto-route** (Phase 15):
The exception to validate = post: a batch tripping a high-risk signal is routed
to a second reviewer automatically, without forcing that ceremony on ordinary
batches.
_Avoid_: routing every batch to review; letting a high-risk batch self-commit

**New-operator soft-guard** (Phase 15):
A gentle, temporary extra check for a first-time / new enterer — a soft guard,
not a hard lock — that relaxes as the operator builds a track record.
_Avoid_: a permanent hard block on new staff; no guard at all

**Escape valve / carry-forward follow-on batch** (Phase 15):
When a batch cannot fully commit (a bad row, an unresolved donor), the good
rows commit and the remainder carries forward into a linked follow-on batch —
the operator is never stuck against an all-or-nothing wall.
_Avoid_: blocking the whole batch on one bad row; silently dropping the
remainder

**Deposit group** (Phase 15):
`deposit_groups`: the artifact tying a set of offline gifts to one bank deposit
(slip/report), with append-only assignment events and a derived current
gift-grain membership projection. Phase 15 owns this operational artifact;
Phase 20 owns the balanced undeposited-funds/deposit-clearing Accounting
Effect and bounded Bank Match, while QBO/Xero owns final bank reconciliation.
_Avoid_: a flat `deposit_reference` string on the gift; Phase 15 claiming the
GL account or statement reconciliation

**Undeposited funds** (Phase 15):
The operational state of recorded offline money not yet assigned to a deposit
group — "in the drawer, not yet at the bank." The GL undeposited-funds account
is Phase 20's.
_Avoid_: conflating the operational undeposited set with the GL account

**Deposit state** (Phase 15):
A derived operational projection over the current append-only assignment and
deposit-group evidence: `undeposited → in_open_deposit → deposited`, with
purpose-specific `returned` or `direct_credit/no_slip` outcomes where the
tender requires them. It is separate from Phase 13 payment/posting/review,
Phase 7 receipt facts, and Phase 20 accounting release, provider-delivery, and
Bank Match truth. There is no generic Phase 15 `cleared` state.
_Avoid_: modeling deposit state as a posting or receipt precondition; storing
one blended money/receipt/accounting status

**Deposit assignment event** (Phase 15):
The append-only event that assigns a gift to (or removes it from) a deposit
group — deposit-state moves by event, never a silent `UPDATE`.
_Avoid_: mutating a gift's deposit column in place; an unaudited reassignment

**Settlement rail (bank-direct vs `stripe_rail`)** (Phase 15):
`settlement_rail`: the discriminator for how an ACH gift settles — bank-direct
(deposit-grouped like a check) vs `stripe_rail` (settles via payout).
Deposit-eligibility keys on this, NOT on `gift_method` (amends Phase 13 D4 A1).
_Avoid_: keying deposit-eligibility on `gift_method`; assuming one ACH rail

**Settles-via-payout** (Phase 15):
The Stripe-rail settlement path: money arrives as a Stripe payout and is not
grouped into an offline bank deposit. Phase 20 links exact processor
settlement/payout evidence to an Expected Bank Arrival and bounded Bank Match;
QBO/Xero owns final bank reconciliation.
_Avoid_: deposit-grouping a Stripe-rail gift; reconciling a payout as a manual
deposit

**Batch template** (Phase 15):
A saved preset of columns + default values for a recurring entry shape (a mail
appeal, a church remittance) so operators start pre-configured.
_Avoid_: re-keying the same column setup every batch; a template that mutates a
committed batch

**Config-frozen / safety-live** (Phase 15):
The posture split for a batch's settings: config-frozen once entry begins (the
template/columns/totals stop shifting under the operator) while safety checks
stay live (validation, guards, high-risk routing keep running).
_Avoid_: config that shifts mid-entry; disabling safety checks to "go faster"

**Phone-gift lane** (Phase 15):
The staff-takes-a-card-over-the-phone path. Primary lane = the native embedded
Stripe Payment Element keyed by staff (SAQ-A) + server-confirm MOTO; the
Stripe-hosted secure-link is the fallback lane (D4).
_Avoid_: staff keying raw PANs into an Asym-rendered field; treating
secure-link as the only lane

**MOTO (server-confirm flag)** (Phase 15):
Mail-order/telephone-order: the server-confirm flag set on the PaymentIntent
for a keyed phone gift, telling Stripe this is a MOTO transaction.
_Avoid_: omitting the MOTO flag on a phone gift; client-only confirmation for
MOTO

**TEL / Financial-Connections ACH lane** (Phase 15):
The phone-ACH path: a TEL-authorized bank debit captured via Stripe Financial
Connections rather than a keyed card.
_Avoid_: storing raw bank-account numbers; skipping TEL authorization capture

**`take_phone_payment` capability** (Phase 15):
The gated permission that lets a role open the phone-gift lane — server-side
enforced, off by default.
_Avoid_: exposing the phone lane to every staff role; a client-only capability
check

**Send-acknowledgments gate** (Phase 15):
The explicit per-batch human edge (NF3) that releases batch-origin rows — which
land `held` with origin reason `batch_gate_pending` — into the existing
acknowledgment pipeline. Imports stay `held`; nothing auto-sends.
_Avoid_: auto-sending acknowledgments on batch commit; a batch that sends
without the gate

**Document Purpose Contract** (Phase 18):
The immutable, versioned rule set defining one generated-document purpose, its authoritative facts, eligible recipients, permitted access and delivery routes, jurisdictional obligations, and required evidence. Tenant-authored templates may present the purpose but cannot widen or redefine it.
_Avoid_: template policy, tenant legal-rule builder, delivery-channel setting

**Approved Data View** (Phase 18):
The immutable, typed, purpose-scoped semantic contract naming exactly which source-owned facts a document may consume, including their types, classifications, recipient bindings, examples, and required/forbidden conditions. It is narrower than the CRM field catalog and never grants live record traversal.
_Avoid_: merge-field permission list, SQL view, arbitrary record context, template data query

**Facts Package** (Phase 18):
The immutable values produced by the owning source domain for one exact purpose, source revision, recipient/issuer context, and policy fingerprint. Phase 18 validates and renders it but never recalculates its legal, money, pledge, or recognition truth.
_Avoid_: template variables, live record snapshot, renderer input assembled from queries

**Document Definition Publication** (Phase 18):
One immutable, fully proved executable document definition with its purpose/view versions, semantic tree, locale, assets, fonts, renderer/profile pins, protected review, and validation evidence. A mutable draft or commit is never a production publication.
_Avoid_: published template flag, latest draft, provider template, partial fallback fragment

**Generation Request** (Phase 18):
One tenant-scoped idempotent orchestration intent that freezes the purpose, source facts, exact compatible publication, profile, recipient/issuer/authorization/safety epochs, and semantic fingerprint before rendering. Attempts are subordinate evidence and cannot replace or widen it.
_Avoid_: render job, retry row, provider request, batch item status

**Generated Document Artifact** (Phase 18):
The exact immutable private PDF bytes promoted only after all byte-changing work, validation, hashing, storage, and read-back proof succeed. Its digest, length, opaque object generation, and evidence identify the artifact; a provider URL, filename, template, or later rerender does not.
_Avoid_: PDF URL, render output, email attachment identity, current document record

**Specialist Document Obligation** (Phase 18):
A durable source-triggered record for a real uncommon document/form duty outside the complete everyday U.S. acknowledgment pack, with a stable cause, owner, deadline provenance, evidence, and one closed outcome. It cannot be dismissed merely to clear a queue.
_Avoid_: generic task, reminder, unsupported-form template, hidden compliance note

**Logical official document** (Phase 18):
The stable recipient-facing identity of one official document across its immutable publications and correction history, exposing exactly one current canonical artifact while predecessors remain evidence-only.
_Avoid_: PDF file as document identity, email copy, accessible copy, archive copy

**Mailbox capability** (Phase 18):
A short-lived, recipient-bound authority delivered to an accepted mailbox that permits the exact contract-approved guest access path. Possession proves control of that capability, not the civil identity or human intent of the person using it.
_Avoid_: email authentication, donor identity proof, read receipt, public link

**Recipient authorization epoch** (Phase 18):
An immutable interval during which one exact Party, recipient or evidenced representative, and accepted contact point are authorized for a document purpose. A material authority or destination change ends the epoch rather than silently widening old access.
_Avoid_: current email lookup, household access, mutable recipient flag

**Durable portal access** (Phase 18):
Authenticated access to a current official document while the artifact is lawfully retained and the viewer remains authorized, independent of any guest-link expiry. It is not a promise of permanent retention or perpetual authorization.
_Avoid_: permanent receipt, forever access, guest-link lifetime

**Records Schedule Contract** (Phase 18):
The immutable, effective-dated, purpose- and jurisdiction-owned rule set that classifies a generated-document record, names its authoritative source-owned clock, applies lawful preservation minimums and privacy maximums, bounds any tenant extension, and defines access restriction, hold, custody, recovery, and verified disposal. A record pins its original version for evidence; later legal or policy changes apply only through an explicit reviewed impact transition.
_Avoid_: retention TTL, latest-date-wins rule, tenant legal-rule builder, per-document expiry picker

**Records hold** (Phase 18):
A scoped, authorized, evidence-backed prohibition on disposing of specified records. Its review date is an escalation deadline, never an automatic expiry; release is a separate privileged event, and the hold neither widens access nor changes the underlying retention clock.
_Avoid_: staff note as hold, indefinite archive policy, auto-expiring legal hold, hold as permission

**Disposition suppression journal** (Phase 18):
A small, forward-only, independently recoverable record of opaque tenant-bound disposition epochs that is replayed before any restored system serves reads or resumes workers. It prevents an older database or object snapshot from resurrecting access to records already disposed or restricted without becoming a second records database or retaining donor content.
_Avoid_: deletion log with PII, backup itself, public tombstone, duplicate artifact registry

**Compatible document publication** (Phase 18):
One complete immutable Document Definition Publication that the exact Document Purpose Contract currently proves compatible across tenant and environment, issuer and jurisdiction, purpose and document class, facts schema, permitted scope, locale and legal language, protected truth, signer and serial rules, accessible/archive output, renderer dependencies, privacy, authorization, review, quarantine, and safety state. Historical render success alone never establishes compatibility.
_Avoid_: last-known-good template, sibling-Site fallback, fragment merge, post-freeze substitution, renderer failover

**Document publication head** (Phase 18):
The server-resolved authoritative slot naming which one immutable compatible publication is current for an exact tenant, environment, purpose, issuer where required, jurisdiction, scope, locale, and document class.
_Avoid_: mutable template status, client-selected current version, default template flag

**Publication appointment** (Phase 18):
One immutable, explicitly authorized decision permitting an exact ready publication to advance one Document publication head at or after a recorded future instant, subject to current safety proof. It is not a timer, release calendar, legal-effective-date rule, recurrence, or promise of backdated currentness.
_Avoid_: scheduled draft mutation, cron job as authority, queued release, automatic rollback

**Statement Run** (Phase 19):
One immutable released population for one exact tenant/environment, issuer,
purpose, jurisdiction, document period, source-fact cutoff, and pinned policy
set. It is a bulk-operations authority, not a campaign or year filter.
_Avoid_: statement campaign, mutable batch, ad-hoc annual query

**Run Draft** (Phase 19):
The editable, server-owned candidate configuration used before a Run Preflight
is frozen. It has no live document, portal, message, print, or legal effect.
_Avoid_: live run, mutable preflight, browser-owned population

**Run Preflight** (Phase 19):
One immutable, inert candidate manifest that reconciles exact included,
excluded, blocked, held, and already-current Statement Subjects; source
closures; purpose/publication/profile pins; counts, totals, reasons, and digest
before release.
_Avoid_: preview query, spreadsheet export, cached dashboard count

**Run Item** (Phase 19):
One governed Statement Subject and exact source-coverage candidate inside a
Statement Run. It is never an email address, household, delivery attempt, PDF
file, or communication event.
_Avoid_: recipient row, message item, attachment job

**Statement Subject** (Phase 19):
The exact Phase 7 legal donor or source-proved joint donor to whom the official
statement belongs. Phase 19 consumes this authority and cannot choose or merge
it.
_Avoid_: household addressee, preferred contact, soft-credit recipient

**Recognition Subject** (Phase 19):
A purpose-separated Phase 14 person or household that may be recognized in an
authorized informational product without replacing the Statement Subject or
entering an official deductible total.
_Avoid_: joint legal donor, official household statement, recognition as tax credit

**Delivery Recipient** (Phase 19):
The independently authorized person or evidenced representative permitted to
receive one exact document. A shared destination never merges legal subjects.
_Avoid_: email address as identity, household as automatic recipient

**Year Presentation Group** (Phase 19):
A disposable navigation grouping that helps staff or donors browse related
documents for a year. It carries no legal, population, delivery, or completion
authority.
_Avoid_: annual campaign, household tax statement, run parent

**Participation Decision** (Phase 19):
An append-only, pre-release, run-local decision recording automatic inclusion,
permitted inclusion, hold, permitted omission, or restoration to the automatic
source result. It cannot change source facts or legal eligibility.
_Avoid_: eligibility override, gift-line editor, force include

**Document Period** (Phase 19):
The source- and jurisdiction-owned period represented by an official statement.
It is pinned in the Run Preflight and is not inferred from a UI year label.
_Avoid_: calendar filter, current locale year, staff-selected tax rule

**Source-Fact Cutoff** (Phase 19):
The exact source closure through which facts may enter one reviewed Statement
Run. Facts after it never mutate the released population.
_Avoid_: worker start time, render timestamp, provider submission date

**Readiness Target** (Phase 19):
A tenant operational goal shown as **Target ready for review by**. It may inform
an honest readiness range but never establishes eligibility, legal timing,
queue priority, or permission to bypass safety.
_Avoid_: statutory deadline, guaranteed completion, paid priority

**Compliance-Risk Rule** (Phase 19):
A versioned source-, jurisdiction-, or tenant-owned evidence-and-review policy
that may strengthen proof for exceptional dating. It never changes gift date,
Document Period, Source-Fact Cutoff, or release authority.
_Avoid_: date override, legal conclusion, hidden reviewer trigger

**Late Fact Obligation** (Phase 19):
One deduplicated post-release fact requiring a source-authorized closed outcome:
no action, supplemental coverage, correction, or replacement. It never reopens
or mutates the primary run.
_Avoid_: mutable primary population, blind resend, late-gift override

**Supplemental Run** (Phase 19):
A new reviewed operation that covers source-authorized post-release facts while
preserving the primary Statement Run and its evidence unchanged.
_Avoid_: rerun primary, append to frozen batch, statement retry

**Statement Delivery Profile** (Phase 19):
One versioned tenant-authored configuration of permitted statement routes,
portal posture, paper method, and compatible fallback behavior inside
purpose-owned safety floors.
_Avoid_: workflow builder, provider-state mapping, legal-rules editor

**Fulfillment Plan** (Phase 19):
The frozen, code-compiled set of compatible route steps for one
Recipient-Document Operation after resolving the published Statement Delivery
Profile, Site, locale, destination readiness, and contract constraints.
_Avoid_: tenant-authored execution graph, mutable fallback list

**Execution Lane** (Phase 19):
A derived, mutually exclusive operational lane for one executable route step,
used for fair claims, capacity, progress, and recovery without becoming a new
business authority.
_Avoid_: provider queue as domain state, tenant priority class

**Recipient-Document Operation** (Phase 19):
One Statement Subject, logical Phase 18 document, authorized Delivery Recipient,
and frozen fulfillment intent. Document, portal, communication, and paper
outcomes remain separate within it.
_Avoid_: one blended status, email row, PDF job

**Recipient Delivery Snapshot** (Phase 19):
The frozen recipient, destination revision, authority, locale, Site, route,
consent/suppression review, and digest used for a released recipient operation.
It preserves reviewed meaning but never grants permanent authorization.
_Avoid_: current contact lookup, permanent mailing authority

**Destination Succession** (Phase 19):
The governed, append-only replacement of an eligible destination for future
still-safe execution. Submitted or indeterminate work reconciles before any
successor can cause another delivery.
_Avoid_: editing frozen history, blind resend to new address

**Run Control Posture** (Phase 19):
The separately authoritative operational posture: running, pause requested,
paused and contained, stop requested, or remaining work stopped. It does not
rewrite document, delivery, print, or legal truth.
_Avoid_: one global run status, cancel means recall

**Control Fence** (Phase 19):
The atomic epoch and authority check that prevents stale claims from crossing a
later irreversible boundary after Pause, Stop, or privacy containment.
_Avoid_: dashboard flag, best-effort worker cancellation

**Physical Fulfillment Attempt** (Phase 19):
One self-print, mail-house, or proof-gated connected-provider attempt using the
exact Phase 18 artifact bytes, with truthful preparation, transfer, production,
postal, cancellation, and return evidence.
_Avoid_: PDF generation, mailing equals delivery, package download equals print

**Completion Snapshot** (Phase 19):
An immutable tenant-authorized staff attestation plus Asym-derived clean or
exception outcome. Current delivery, incidents, returns, corrections, and
follow-up remain independently live after completion.
_Avoid_: automatic completion, all work succeeded, closing exceptions

**Statement Communication Occurrence** (Phase 19):
One permanent semantic donor-message occurrence admitted by Phase 19 and
prepared, transported, and reconciled through the Phase 17/6 communication
boundary.
_Avoid_: direct Resend call, portal access as email, duplicate lifecycle notice

**Support overview — Not a tax document** (Phase 19):
An optional, off-by-default, purpose-separated informational document for
authorized household support or disclosed DAF-recommendation recognition. It is
never an official statement section or tax receipt.
_Avoid_: soft-credit tax statement, combined deductible total, default donor noise

**Run Evidence Record** (Phase 19):
One PII-minimized projection of frozen release and completion evidence, current
follow-up references, and records-owner links. It is not a duplicate event
store, artifact archive, or communication history.
_Avoid_: permanent audit export, copied donor addresses, second source of truth

**Audit Package** (Phase 19):
A temporary, scope-bound derivative of currently authorized evidence prepared
for a governed audit request with explicit contents, exclusions, expiry,
reauthorization, integrity proof, and verified disposal.
_Avoid_: permanent download library, unbounded export, access-by-link

**Accounting doorway** (Phase 20/21):
The sole boundary through which source-owned settlement, deposit, and approved
expense facts become accounting projections and provider delivery work. Phase
20 owns the accounting handoff and evidence; the source phase retains its
original facts and lifecycle.
_Avoid_: a second QBO/Xero Accounting integration in the expense product,
accounting sync as gift or expense truth, a shared mutable status

**Finance authority boundary** (Phase 20):
Stripe is authoritative only for its processor account, balance movements,
conversion evidence, payout-transfer lifecycle, and provider-attributed
composition. Source-labelled bank evidence proves only what its statement,
certified read-only connection, or explicit staff attestation observed; Asym's
Bank Match is a bounded allocation over that evidence, not final
reconciliation. Asym owns immutable Accounting Releases, source coverage,
delivery intent, provider-operation evidence, and derived drift verdicts.
QuickBooks Online or Xero owns the tenant's posted books, accounting periods,
translation and revaluation, and final bank reconciliation under accountant
control. Evidence may be compared across these authorities but never collapsed
into one mutable `reconciled` or `synced` flag.
_Avoid_: Stripe payout status as bank proof, bank import as gift truth, provider
acceptance as reconciled books, QBO/Xero edits rewriting an Accounting Release

**Support Assignment** (Phase 21):
The immutable organization-controlled subject for one approved field purpose.
It belongs to one Tenant and Legal Entity and may have zero, one, or many Party
participants; one Party may participate in several Support Assignments. It is
not a person-, household-, login-, donor-, or provider-owned fund and is not
Phase 12's Active Tenant Assignment.
_Avoid_: worker owns fund, household account, polymorphic owner, bare assignment

**Support Assignment Participant Membership** (Phase 21):
The prospective, effective-dated, append-only-corrected fact that one Party is
associated with one Support Assignment during one exact half-open interval. It
grants no workspace access, claimant/reviewer/payee authority, notification,
donor-purpose authority, financial ownership, or money movement.
_Avoid_: spouse implies access, participant owns account, membership as role or
balance allocation

**Field Account** (Phase 21):
The organization-owned, append-only operational allocation subledger for one
exact Support Assignment, partitioned by Tenant, Legal Entity, and one immutable
currency; sibling currencies are
separate Field Accounts and never one aggregate balance. Open-cycle entries
remain activity; its Finance-confirmed Field Account Balance is established
once by a Phase 21 D17 Field Account Operational Cutover and thereafter derived
through immutable Support Cycle closes and append-only corrections, and is not
a donor asset, bank account, general ledger, payroll ledger, accounts-payable
ledger, payment authority, or mirror of QBO/Xero.
_Avoid_: one mutable support-balance column, summing gifts at read time,
cross-currency balance, newly recorded gift as immediately available, treating
an external accounting balance as source truth

**Opening Source Package** (Phase 21):
The immutable, precedence-explicit finance-authorized source set used to
establish one reconciled prior Field Account position for a complete activation
cohort. It pins one half-open boundary per predecessor source family and one
common operational through boundary that every source cursor or snapshot proves
complete. The package is content-addressed and
Tenant-, Legal-Entity-, and ISO-currency-scoped. It distinguishes the source of
position from bounded supporting artifacts and does not make every artifact
provider-authenticated, canonical history, Field Account truth, or accounting
truth by itself.
_Avoid_: whichever file was uploaded last, averaged source total, accounting
system as Field Account authority, migration folder

**Opening Position Activation Cohort** (Phase 21):
The complete census of Field Accounts for one exact Tenant, Legal Entity, and
ISO currency that must be reconciled and activated together. It cannot be
reduced to an arbitrary row subset merely because some accounts are easier to
map or have zero positions. If one D6 source-conserving atomic group spans
currency cohorts, every affected cohort activates behind one linked barrier or
the detail remains reference-only with separate residual positions.
_Avoid_: selected-worker migration, successful rows only, partial currency
activation, account-by-account authority

**Opening Coverage Disposition** (Phase 21):
The exactly-one classification assigned to every pre-cutover source fact in an
Opening Position Activation Cohort: `exact_history`, `opening_residual`,
`reference_only`, `intentional_exclusion`, or `unresolved`. An intentional
exclusion must be proved non-balance-bearing; any unresolved fact prevents
activation. One atomic pair or source-conserving group receives one complete
disposition, never a partial one.
_Avoid_: ignored row, duplicate exact and residual coverage, silent exclusion,
best-effort classification

**Opening Coverage Manifest** (Phase 21):
The immutable complete account-and-source disposition proving, independently
per Field Account and ISO currency and again at cohort control totals, that
balance-bearing certified exact history plus the residual Field Account
Opening Position equals the reconciled boundary position. Every pre-cutover
fact is covered exactly once as exact history, opening residual,
reference-only, intentional non-balance-bearing exclusion, or unresolved;
unresolved coverage prevents activation. It also pins the first-close ingestion
cursor and carries forward exact independently live reservations, obligations,
funding/reallocation coverage, unresolved payments, and other capacity effects
without replay.
_Avoid_: import summary, sampled reconciliation, aggregate tie hiding an
account mismatch, evidence-only history as balance truth

**Field Account Opening Position** (Phase 21):
The immutable balanced residual Field Account occurrence establishing an
organization-controlled starting position at the reconciled operational
boundary, with its typed organization-control counter-entry. It is neither a
mutable balance scalar nor reconstructed gift, assessment, expense,
compensation, payment, payroll, or general-ledger history.
_Avoid_: opening balance column, plug, negative Field Account, imported gift,
QBO/Xero beginning balance as live authority

**Field Account Operational Cutover** (Phase 21):
The immutable activation generation containing one exact half-open authority
boundary per predecessor source family plus the common operational through
boundary and first-close cursor, after which Asym owns new in-scope Field
Account activity for one complete Tenant, Legal Entity, and ISO-currency
cohort. It proves the bounded source scope inspected at activation and never
claims that Asym locked an external writer it cannot control.
_Avoid_: date-only go-live, dual write, universal external freeze, mutable
cutoff, account-by-account partial authority

**Core Field Accounts Production Activation Contract** (Phase 21 D27):
The evidence-gated composition that permits one complete Field Account cohort
to invoke D17's sole Operational Cutover and permits selected optional
capabilities to activate only through their own prospective authority. It is
neither a second activation state nor a feature-flag graph.
_Avoid_: Phase 21 enable switch, launch checklist as authority, all-features
go-live, independent flags everywhere

**Phase 21 Release Generation** (Phase 21 D27):
The immutable identity of one deployed Phase 21 behavior generation and its
current production-qualification evidence. It establishes no tenant
suitability, financial authority, permission, provider outcome, or compliance
claim by itself.
_Avoid_: deploy equals live, environment flag as tenant authority, certified
compliant release

**Field Accounts Adoption Plan Version** (Phase 21 D27):
The immutable prospective tenant selection of a Legal Entity, currency, bounded
source scope, and only the optional capabilities the tenant uses. The complete
D17 cohort is server-derived rather than tenant row-selected. It cannot waive
owner-domain proof or define an arbitrary dependency graph.
_Avoid_: mutable tenant toggle set, custom launch workflow, partial-worker
financial pilot

**Field Accounts Go-Live Readiness Manifest** (Phase 21 D27):
The content-addressed machine-prepared composition of current owner evidence
for one exact Field Accounts Adoption Plan, release generation, complete
cohort, and D17 half-open boundary. It grants no authority and is consumed only
after current permission and every bound input are re-proved by D17.
_Avoid_: mutable ready Boolean, manual launch checklist, second cutover proof,
sandbox success as production proof

**Field Accounts Operational Readiness Projection** (Phase 21 D27):
The disposable, through-dated staff view that composes independently
authoritative activation, close, access, publication, provider, and containment
evidence into the affected owner and next safe action. It is not durable truth,
permission, financial proof, or command input.
_Avoid_: one healthy badge, readiness as authority, Mission Control task as
proof, active means paid

**Opening Position Correction** (Phase 21):
The cause-linked append-only Field Account occurrence and manifest succession
created when a late pre-cutover fact changes a reconciled opening position. It
preserves the original opening, activation manifest, closed cycles, and prior
statements; records source-effective, discovery, and current record times; and
enters economically through the normal correction/next-close path rather than
editing history or replaying the source fact twice.
_Avoid_: edit opening balance, reopen legacy source, silent backdate,
destructive migration rollback

**Default Field Account Currency Version** (Phase 21):
The immutable prospective Legal-Entity choice that supplies the quiet currency
suggestion and display order for newly created Field Accounts. It creates no
source-admission, settlement, accounting, conversion, or payment authority and
never changes an existing Field Account.
_Avoid_: implicit USD, browser or Site currency, donor presentment or reporting
currency as authority, mutable account currency

**Field Account Currency Activation Version** (Phase 21):
The immutable prospective tenant authorization for one exact Tenant, Legal
Entity, Support Assignment, approved purpose, destination Field Account
identity or atomic creation intent, Field Account currency, bounded source
family, source binding, environment, and half-open interval after an
organization-controlled same-currency admission path is proved. It permits
future positive candidates for that scope but does not admit an occurrence,
certify accounting delivery, make money available, or weaken mandatory adverse
corrections.
_Avoid_: global multicurrency flag, donor presentment as activation, current
provider capability as durable balance authority, retroactive activation

**Support Balances Projection** (Phase 21):
The source-owned, missionary-safe grouping of separately authoritative
currency-scoped Field Accounts for one exact Support Assignment. Every balance
remains exact, ISO-labelled, and independently dated;
native publication is controlled by a Support Workspace Publication Profile
Version, external feed authorization remains separate, and the grouping has no
writable or authoritative converted total.
_Avoid_: mandatory balance card, multicurrency account, wallet, aggregate
balance, available funds, converted balance

**Support Planning Posture Version** (Phase 21):
The immutable prospective tenant choice of whether Asym manages an Approved
Support Plan for one exact Tenant, Legal Entity, Support Assignment, purpose,
and currency scope. `Not managed in Asym` is a valid quiet posture, not a zero
plan, missing-data error, or suspension of Field Account finance truth.
_Avoid_: mandatory plan, zero plan, missing configuration as an exception

**Approved Support Plan Version** (Phase 21):
The one winning immutable organization-approved planning authority for bounded
recurring and dated support needs plus one optional same-currency diagnostic
reserve target in an exact scope and effective interval. It is not a
Support-Raising Goal, commitment, Field Account balance, compensation
entitlement, accounting budget, restriction, or payment authority.
_Avoid_: worker-authored budget as organization truth, live goal sync,
available-funds plan, general-ledger budget

**Support Workspace Publication Profile Version** (Phase 21):
The immutable prospective tenant policy selecting which independently
authorized source-backed support modules one audience may see, including D12
Support-statement access only when its compatible balance publication is
authorized. It controls presentation and whether the statement-ready event
family is offered with a tenant-safe default of Off. Each recipient's channel
choice lives only in a Support Workspace Notification Preference Version. The
Profile cannot widen authorization, create or alter financial or document
truth, change formulas, authorize notification delivery, or authorize an
external feed.
_Avoid_: arbitrary dashboard builder, UI hiding as security, formula language,
profile as source truth

**Support Workspace authorization** (Phase 12/21):
The current request-time `resolveProjection` decision for one Principal, Active
Tenant Assignment, Tenant, Legal Entity, Support Assignment, purpose,
projection, capability set, floor, resource version, and governance epoch. A
participant membership, invitation, named grant, preset, role, or visible
workspace control is not the decision by itself.
_Avoid_: workspace-access Boolean, participant means viewer, client-selected
Support Assignment, grant row as current access

**Support Workspace invitation** (Phase 12/21):
The expiring, single-use, exact-recipient, revocable proposal to bind a verified
login principal to explicitly reviewed Support Workspace access. Pending,
failed, expired, mismatched, or revoked invitations grant nothing, and reissue
does not resurrect an old grant.
_Avoid_: invitation sent equals access, email address as principal, reusable
invite link, account-wide sharing

**Support Workspace Notification Preference Version** (Phase 21; Phase 6
delivery):
The immutable prospective recipient-, Support-Assignment-, event-family-,
channel-, purpose-, and interval-scoped choice about support updates. It grants
no access; current authorization, preference, suppression, contact-point, and
source eligibility are re-proved before Phase 6 releases a recipient-specific
communication intent.
_Avoid_: subscription implies access, queued means eligible, preference as
delivery history, notification setting as financial truth

**Finance-confirmed Planning Coverage Base** (Phase 21):
The exact same-currency planning numerator derived conservatively from the
Finance-confirmed Field Account Balance after qualified negative open-cycle
effects and still-active non-reusable funding or reallocation coverage are
subtracted once. Provisional positive support never increases it.
_Avoid_: available balance, spendable cash, commitment-adjusted balance,
double-subtracted reservation

**Balance Coverage Projection** (Phase 21):
The disposable same-currency comparison of a compatible Finance-confirmed
Planning Coverage Base with the positive recurring need in an effective
Approved Support Plan Version. It is absent or `Not calculated` when a required
input is missing and never proves availability, compensation, payroll, or
payment.
_Avoid_: cash runway as a promise, infinity for zero need, cross-currency
coverage, missing input as zero

**Reserve Position Projection** (Phase 21):
The disposable signed same-currency result of Finance-confirmed Planning
Coverage Base minus the optional diagnostic reserve target in the effective
Approved Support Plan Version. A positive result is above target; a negative
result is a shortfall. It is not a donor restriction, accounting reserve,
spending authorization, or retained-balance floor.
_Avoid_: reserved cash, legal restriction, cross-currency reserve, automatic
reallocation trigger

**Commitment Forecast Projection** (Phase 21 consuming Phase 16):
The optional purpose-scoped planning view of independently authoritative Phase
16 commitment facts. It may appear alongside an Approved Support Plan or Phase
28 goal only as a separately source-versioned comparison; neither is a
prerequisite. It never becomes received support, Finance-confirmed balance, or
an input to Balance Coverage.
_Avoid_: commitment as cash, inferred commitment zero, blended funded percent

**Support Cycle** (Phase 21):
A tenant-scheduled operational period whose finance close freezes the exact
Field Account coverage and evidence used for a dated balance. It is not a
payroll run, accounting period close, bank reconciliation, or promise to pay.
_Avoid_: payout cycle, live balance window, QBO close, payroll period

**Support Cycle Close** (Phase 21):
The immutable finance decision published only with a fresh Support Cycle
Integrity Manifest proving the exact business boundary, captured ingestion
boundary, continuity, independent control-side balance, unique source coverage,
and complete required groups. It advances the dated Finance-confirmed Field
Account Balance but does not close the books, run payroll, or prove payment.
_Avoid_: editable close, timestamp-only close, capped scan as proof, close
equals paid, QBO period close, balance refresh

**Field Account Occurrence** (Phase 21):
The immutable source-addressed semantic unit whose exact same-currency
Field-Account-side and independently persisted organization-control entries form one
atomic balanced Field Account effect.
_Avoid_: mutable journal row, unbalanced activity, cross-currency entry set,
provider payload as Field Account truth

**Field Account Control Position** (Phase 21):
The non-writable per-Tenant, Legal-Entity, and ISO-currency position derived
from independently persisted organization-control-side Field Account entries
and compared with Support-Assignment/Field-Account-side effects.
_Avoid_: Field Account total negated at read time, QBO/Xero account, tenant
chart-of-accounts row, plug or generic suspense balance

**Support Cycle Integrity Manifest** (Phase 21):
The machine-produced immutable close evidence for one exact business-date
interval and captured monotonic Phase 21 ingestion interval, including opening,
activity, closing, independent control, source-coverage, group-completeness,
scope, currency, and version proof. It also pins every in-scope
version-addressed Reimbursement Obligation, Field Account Funding Coverage
reservation, compensation-funding reservation, and approved non-balance
position at that fence, plus an immutable typed relationship stating whether
each position is included in closing balance, reserved against it, or disclosed
only. Downstream views consume that relationship and never live-query or
double-subtract an open position.
_Avoid_: manual attestation, mutable close checklist, timestamp-only
completeness, scheduled sweep or sample as close authority, live open-item
lookup after close

**Field Account Support Statement Approved Data View** (Phase 21):
The immutable typed projection contract that deterministically selects only
purpose-approved, recipient-safe statement facts from one exact Support Cycle
Integrity Manifest and its covered occurrences for Phase 18. It creates no
second balance or statement-facts authority and cannot live-recompute, merge
currencies, widen recipient access, or repair financial meaning.
_Avoid_: statement ledger, live date-range query, donor export, mutable report
snapshot, template-owned calculation

**Field Account Support Statement** (Phase 18 artifact over Phase 21 facts):
The one logical currently authorized support-cycle document for an exact Field
Account, Support Cycle, and ISO currency, rendered from the source-owned Field
Account Support Statement Approved Data View and immutable Facts Package. It
explains finance-closed organization-controlled support activity and is not a
tax receipt, bank statement, payslip, proof of payment, or statement of
available or withdrawable funds.
_Avoid_: year-end donor statement, available-funds report, payroll statement,
live mutable history, converted multicurrency total, duplicate accessible copy

**Field Account Integrity Verification Run** (Phase 21):
The bounded resumable examination of exact Field Account scopes and immutable
history whose execution state is distinct from its financial verdict; it may
prepare or re-verify evidence but never substitutes for a close manifest.
_Avoid_: one green Boolean, partial or capped scan as complete, live-provider
reconciliation, verification job equals close

**Field Account Integrity Case** (Phase 21):
The deduplicated cause-owned financial exception for one exact proved Field
Account defect and containment scope, cleared only when the owning repair is
followed by fresh complete proof.
_Avoid_: generic balance problem, Mission Control task as financial truth,
task complete equals cleared, force balance, generic mark fixed

**Finance-confirmed Field Account Balance** (Phase 21):
The derived per-currency Field Account balance initially established through a
reconciled Field Account Operational Cutover and thereafter advanced through
closed Support Cycles and append-only corrections, presented with its exact
through/as-of date. Sibling currency balances remain independent and are never
added or converted into this authority. Newer provisional activity remains
separate until admitted by a later close or correction.
_Avoid_: available funds, current cash, withdrawable balance, donation total

**Gross Support Allocation** (Phase 21):
An immutable Field Account credit derived either from exact eligible Phase 13
posted money-designation coverage or from one exact D21 Realized Support Basis;
an original noncash recognized value, FMV, appraisal, or estimate can never
create it. Its amount equals the eligible source amount when currencies match,
or the exact target portion fixed by the applicable D6 evidence when they
differ, and is “gross” only relative to separate Phase 21 assessment and cost
effects—not a claim that every source rail exposed processor gross. Fee-cover,
processor cost, assessments, refunds, and other Field Account effects remain
separate typed occurrences and never rewrite this allocation or the underlying
gift. D21 sale, brokerage, liquidation, and valuation costs are not D20 or
Phase 20 D19 occurrences; they affect a Realized Support Basis only through
D21's pinned treatment and exact source evidence.
_Avoid_: netting processor cost into the gift, recomputing current designation
weights, allocating an unposted or uncovered contribution, valuation as support

**Support Currency Allocation Manifest** (Phase 21):
The immutable admission-contract evidence that conserves the complete effective
Phase 13 hard-tender header line set, including fee-cover or other non-support
lines, into one exact typed organization-controlled target-currency allocation
basis when the currencies differ. It fixes every target line under one
deterministic minor-unit allocation; each later cross-currency adverse
occurrence uses its own successor manifest bounded by remaining original
coverage, and only eligible non-fee-cover designation portions may create
Gross Support Allocations.
_Avoid_: inferred exchange rate, mutable conversion, cross-currency balance,
accounting translation, donor-amount rewrite

**Support Allocation Candidate** (Phase 21):
The provisional current-cycle activity derived from one exact eligible Phase 13
posted money-designation occurrence or one exact source-final D21 Noncash
Support Realization before a Support Cycle close covers it. The original
noncash posting and its valuation are structurally ineligible. A candidate may
be evaluated for a future close but has no confirmed-balance, compensation,
reimbursement, ownership, or availability authority.
_Avoid_: pending balance, available support, mutable candidate amount,
candidate equals confirmed Field Account credit, noncash FMV as cash

**Noncash Support Realization** (Phase 21):
The immutable source-mode-honest derivative that connects exact Phase 15
source-final proceeds for one original Phase 13 noncash Contribution, asset lot,
accepted purpose, and currency to one possible Field Account support effect. It
is neither a second gift nor custody, liquidation, valuation, receipt,
accounting, payroll, payment, or availability truth.
_Avoid_: converted gift, cash replacement gift, appraisal credit, editable sale

**Realized Support Basis** (Phase 21):
The exact monetary basis selected under one frozen D21 source contract and cost
treatment before D3 assessment: exact net proceeds by default, or exact gross
proceeds only when separately proved eligible costs are prospectively and
validly organization-absorbed. It never derives from FMV, appraisal, estimate,
or an implied exchange rate.
_Avoid_: sale estimate, assessable appraisal, guessed fees, mutable net amount

**Noncash Support Realization Manifest** (Phase 21):
The immutable per-lot, per-purpose, per-currency evidence that freezes the
source role and legal recipient; original Contribution, asset, accepted purpose,
disposition, and evidence identities; exact quantity and source-final proceeds;
relevant dates; gross/cost/net or exact-net-only shape; pinned cost treatment and
Realized Support Basis; deterministic allocation and residuals; D6 conversion
evidence; source/policy versions; non-overlapping coverage; idempotency; and
append-only correction lineage before D2 admission.
_Avoid_: mutable proceeds record, date-only sale marker, fuzzy lot allocation,
duplicate opening or accounting coverage

**Support Allocation Readiness Policy** (Phase 21):
The prospective tenant policy that defines which source-labelled evidence a
positive Gross Support Allocation needs before a Support Cycle close may admit
it. Readiness is not worker availability, spendability, compensation, payment,
ownership, or withdrawal authority.
_Avoid_: universal settlement rule, mutable readiness flag, available funds,
QBO/Xero as a universal prerequisite

**Source Readiness Evidence** (Phase 21):
The source-labelled observation used to evaluate Support Cycle admission, such
as an exact provider settlement state, offline deposit outcome, direct-credit
observation, governed staff confirmation, or an exact source-final D21 Noncash
Support Realization Manifest under its capability-certified source contract. An
original noncash posting, valuation, appraisal, estimate, or disposition without
the required manifest is activity only and never readiness evidence for a
monetary Support Allocation Candidate. Native source vocabulary does not become
a Field Account or missionary-facing status.
_Avoid_: generic cleared flag, copied provider truth, evidence equals balance,
Stripe `available` equals worker availability, noncash FMV as settlement proof

**Support Close Readiness Projection** (Phase 21):
The disposable current evaluation of a Support Allocation Candidate against
the pinned readiness policy and current source evidence. Its outcomes are
`ready_for_close`, `waiting_for_evidence`, `needs_finance_review`, or
`blocked_by_integrity`; none is durable balance authority.
_Avoid_: available, settled, cleared, paid, reconciled, synced, immutable
evaluation history, projection as close coverage

**Support Cycle Admission Coverage** (Phase 21):
The immutable coverage of exact Field Account entries, policy versions, source
evidence, and any required Support Currency Allocation Manifest or D21 Noncash
Support Realization Manifest accepted by one Support Cycle Close. A D21 positive
entry is coverable only from the manifest's exact Realized Support Basis; the
original noncash Contribution or valuation can never share or substitute for
that coverage. After the one-time Field Account Operational Cutover has
established the opening authority, this coverage alone advances ordinary
positive activity into the Finance-confirmed Field Account Balance; mandatory
append-only adverse corrections remain continuous.
_Avoid_: mutable included flag, preview as close authority, partial pair
admission, recalculating a prior close

**Missionary Support Activity Projection** (Phase 21):
The exact Tenant-, Legal-Entity-, Support-Assignment-, and purpose-scoped,
privacy-safe composition of Phase 13 effective contribution activity, Phase 14
supporter-roster identity/recognition, Phase 16 safe recurring-support
statements, and Phase 3/10/12 authorization controls for the current Principal
and Active Tenant Assignment. It gives a missionary ordinary CRM context
without creating donor/contact authority, combining a Party's Support
Assignments, or exposing finance-only readiness, provider, deposit, payout,
bank, or accounting state. Routine status detail is quiet by default; material
adverse changes remain visible. When D21 applies, it may add one tenant-
authorized grouped lifecycle relating the original noncash gift to later
finance-closed realized support, but it never displays two gifts or presents an
appraisal, estimated value, disposition cost, or proceeds as available, payable,
payroll-ready, paid, or posted to accounting.
_Avoid_: second donor or payment CRM, contact/notes/tasks ownership, raw decline
reason, duplicate gift from asset sale, availability claim, stable anonymous
identifier, pre-filter counts

**Missionary Support Feed Projection** (Phase 31; sourced by Phase 21 and later
authorized Phase 28 families):
The disposable, rebuildable external-continuity view composed exactly once from
Phase 21's Missionary Support Activity Projection and separately through-dated,
per-currency Support Balances Projection for one authorized recipient,
Missionary Support Feed Subject, and purpose. It is not a supporter, gift,
commitment, Field Account, accounting, or migration authority; later Phase 28
relationship/contactability families enter only through their own separately
ratified projection.
_Avoid_: duplicate CRM or ledger, raw-table export, mutable integration copy,
Phase 28 as supporter or commitment authority, converted balance total

**Missionary Support Feed Subject** (Phase 21/31):
The exact Support Assignment whose authorized support projection may be
included in one feed subscription. It is not a Party participant or the
external principal receiving the feed.
_Avoid_: participant, recipient, provider profile, worker-global feed, all
missionaries, tenant-wide feed

**Missionary Support Feed Recipient** (Phase 31):
The exact external principal or profile authorized to receive one **Missionary
Support Feed Subject** projection through one destination subscription. Bulk
setup creates separate recipient/subject subscription namespaces rather than a
shared cursor or identifier space.
_Avoid_: Missionary Support Feed Subject, Party participant, provider
organization alone, shared team token, multi-recipient cursor

**Missionary Support Feed Subscription Version** (Phase 31):
The immutable prospective authorization binding one Tenant, Legal Entity,
destination organization/product/environment, recipient, Missionary Support
Feed Subject, purpose,
designation or Field Account scope, resource and field families, bounded
history, currencies, schema, certified adapter, and authorization epoch.
Possessing a cursor or prior grant never substitutes for its current authority.
_Avoid_: global integration toggle, cursor as credential, mutable scope, broad
tenant export, reconnect reviving an old grant

**Missionary Support Feed Coverage Manifest** (Phase 21/31 contract):
The immutable declaration of the exact authorized snapshot generation,
snapshot-through cut, source-family coverage, included and excluded resource
families, field set, history horizon, currencies, and adapter/schema versions.
It proves bounded completeness, never all-history or downstream application.
_Avoid_: generated-at means complete, live paginated snapshot, last-sync flag,
date-only recovery

**Missionary Support Feed Revocation** (Phase 31):
The recipient-only removal instruction for an opaque projection object that
the same recipient previously received. It proves only the recorded future
subscription access or provider-removal outcome; it means the recipient may no
longer receive or access the object through that subscription and never claims
that local, exported, or backed-up copies were erased without exact provider
evidence.
_Avoid_: disconnect equals deletion, generic tombstone, restricted-person
existence signal, silent reconnect

**Administrative Assessment Profile** (Phase 21):
An immutable prospective tenant policy version defining one bounded
administrative-assessment calculation and its honest staff and missionary
presentation. Every Tenant and Legal Entity starts with an explicit
`No administrative assessment` profile.
_Avoid_: missing configuration means zero, stackable fee rules, mutable active
rate, arbitrary formula

**Assessment Profile Assignment** (Phase 21):
The prospective binding of one Administrative Assessment Profile to the
Legal-Entity default; an explicit, prospective, source-labelled Support
Assignment assessment-applicability context containing a worker classification,
lifecycle stage, or exact classification-stage combination; or an exact Field
Account. Classification and lifecycle inputs are never inferred from current
Support Assignment Participant Memberships, participant count, access, or
relationship labels. An absent axis does not match; the fixed specificity model
continues to the next explicit assignment and resolves exactly one profile
before its source-family treatment is selected.
_Avoid_: numeric priority, rule-order dragging, additive profile inheritance,
silent ambiguous winner

**Assessment Period** (Phase 21):
The exact monthly, per-currency interval that owns minimum, cap, fixed, and
service-component assessment effects independently of Support Cycle cadence.
_Avoid_: support cycle equals assessment month, per-gift minimum, cross-currency
period

**Assessment Period Determination** (Phase 21):
The immutable result that freezes one Assessment Period's winning profile,
source and period coverage, calculation, rounding, and component results. It is
the authority for period-level assessment effects and later append-only
remeasurement.
_Avoid_: mutable monthly total, current-profile recomputation, gift as fixed-fee
source

**Assessment Entry** (Phase 21):
A separate, typed Field Account occurrence created from a prospective profile
version and either exact Gross Support Allocation coverage or one Assessment
Period Determination. It records the organization's administrative assessment,
cap credit, or correction without changing contribution, Designation, receipt,
processor-cost, or Accounting Release truth.
_Avoid_: hidden net-support math, mutable assessment percentage, retroactive
policy application, assessment as a processor fee

**Assessment Correction** (Phase 21):
An append-only inverse or replacement effect linked to the original
source-linked or period-level assessment coverage. It never edits a closed
Support Cycle, original determination, gift, or receipt.
_Avoid_: reopening an assessment month, reversing a whole fixed charge for one
gift, applying today's profile to history

**Expense Relationship Context** (Phase 21):
The source-owned worker classification and applicable jurisdiction effective at
an expense date, used to select the permitted policy and downstream treatment.
It distinguishes employee, independent contractor, volunteer, and
unresolved/other without inferring classification from `missionary` or a Field
Account.
_Avoid_: role inference, one missionary tax class, tenant-selected legal result

**Expense Claim** (Phase 21):
One logical claimant request for the organization to recognize or reimburse one
business-spending occurrence. Its immutable versions preserve the claimant's
asserted facts, exact items/splits, currencies, evidence links, relationship
context, and lineage. It is neither a report, approval, obligation, Field
Account funding, payment, nor accounting truth.
_Avoid_: expense report, expense payment, approved expense, reimbursement

**Expense Collaboration Assignment Version** (Phase 21):
The immutable, exact-claim-bounded record that one helper Party and accepted
authenticated principal may be responsible for a code-owned collaboration mode
for one claimant Party, Tenant, Legal Entity, Expense Program, stable Expense
Claim, item/split/purpose/evidence scope, Evidence Access Projection Version,
and half-open interval. It records scope, responsibility, and provenance but
grants nothing by itself; Phase 12 remains the sole current authorization
owner. Each accepted or batch-created assignment is independently revocable.
_Avoid_: delegate role, account proxy, helper ACL, spouse access, support
participant permission, transitive delegation

**Expense Collaboration Invitation Version** (Phase 21):
The opaque, one-time, expiring, authority-free invitation for an intended
helper principal to accept one exact proposed Expense Collaboration Assignment.
Acceptance still requires verified identity, current authorization, and exact
Party/principal binding; an auth invitation or account creation alone creates
no Tenant membership, Party association, or collaboration authority.
_Avoid_: invitation grants access, email token as claimant identity, pending
helper permission

**Evidence Access Projection Version** (Phase 21 D24 meaning):
The code-owned, versioned upper bound on the minimum expense-evidence fields and
classifications one exact Expense Collaboration Assignment may expose. The
current Phase 3/10 purpose and classification floor may only subtract from it;
the projection never grants access or admits a reusable evidence URL.
_Avoid_: full receipt access, configurable field ACL, projection as grant,
signed URL as permission

**Claimant Confirmation Version** (Phase 21):
The immutable claimant-authored affirmation of one exact Expense Claim Version
digest, complete material facts, exact item/split amounts and ISO currencies,
evidence-link set, applicable declarations, and versioned attestation language,
method, source, time, and actor. A material successor makes the confirmation
stale. An authenticated claimant or a tenant-admitted claimant-authored
external attestation meeting the Asym proof floor may create the assertion;
the helper, silence, notification, email possession, relationship, or model
inference cannot.
_Avoid_: delegate consent, report checkbox, approval means confirmation,
forwarded email signature, reusable attestation

**Expense Collaboration Action** (Phase 21):
The immutable provenance of an authorized helper preparation, evidence,
ready-for-review, or exact claimant-confirmed submission operation, preserving
the claimant, helper, actual principal, assignment, claim/version, scope,
authorization context, and result. It is neither claimant confirmation, D13
review, approval, obligation, Field Account effect, payment, payroll, nor
accounting truth.
_Avoid_: acting as claimant, helper authorship rewrite, collaboration status as
financial outcome

**Expense Claim Resolution Cause Contract Version** (Phase 21):
The code-owned prospective definition of one supported exceptional cause,
including its detecting and root authority, exact admissible scope,
inseparable-coverage rule, permitted actor actions, source-owned completion
predicate, downstream-disposition requirements, and migration treatment. It is
not tenant-authored workflow or financial policy.
_Avoid_: `other` cause, custom status, rule script, timer decision, workflow
graph

**Expense Claim Resolution Case** (Phase 21):
One exceptional-only immutable coordination basis over an exact Tenant, Legal
Entity, Expense Program, claimant Party, stable Expense Claim and triggering
Claim Version, item/split/purpose/ISO-currency coverage, Cause Contract Version,
root source identity, and coverage digest. It coordinates source-owned recovery
without becoming claim, decision, obligation, Field Account, payment,
accounting, or task truth.
_Avoid_: reopened report, mutable case status, approval case, payment case,
Accounting Exception Case, generic task

**Expense Claim Resolution Occurrence** (Phase 21):
One immutable, actual-actor-attributed request, response, organization evidence
contribution, review request, source-owner command or result observation,
conflict, or completion-proof occurrence inside one exact Resolution Case. It
never edits claimant-authored facts or another owner's domain result.
_Avoid_: comments as evidence, acting as claimant, cross-domain rollback,
mutable resolution history

**Downstream Impact Manifest** (Phase 21 D25 meaning):
The proportional complete exact list of possibly affected snapshot,
obligation, handoff/payment, D23 effect, statement, Phase 20 release/provider,
and other declared owner families, with pinned source versions and an explicit
disposition for each. It is empty when no downstream authority exists and is
never a financial source or rollback command.
_Avoid_: hidden downstream impact, best-effort list, reverse-everything command,
accounting manifest

**Expense Claim Resolution Projection** (Phase 21):
The disposable rebuildable current next-action and wait-reason presentation
derived from immutable Resolution Case truth. Labels such as **Needs your
update**, **With finance**, **Waiting on source**, **Correction in progress**,
and **Complete** are coordination copy, never mutable authority or an input to
a financial consumer.
_Avoid_: resolved scalar, status-owned completion, Complete means approved or
paid, workflow state machine

**Phase 21 Records Schedule Contract Version** (Phase 21 D26):
One immutable, code-owned, source-cited schedule for one closed Phase 21 record
family and purpose, including its trigger, preservation floor, privacy ceiling,
access/use limits, copy classes, holds, recovery, export, and verified-
disposition semantics. It is a domain policy version, not a tenant-authored
legal contract or storage timer.
_Avoid_: retention setting, legal advice, custom rules engine, mutable policy

**Phase 21 Records Schedule Binding Version** (Phase 21 D26):
One immutable prospective tenant selection of a supported schedule variant for
an exact Tenant, Legal Entity, jurisdiction, record family, and only the source
or relationship dimensions that materially change the rule. Exactly one
deterministic non-stacking binding may win for a record.
_Avoid_: per-record picker, overlapping rules, latest row wins, free-form timer

**Phase 21 Record Retention Resolution** (Phase 21 D26):
The immutable result that pins one Phase 21 record to its exact winning
contract and binding versions, authoritative trigger facts and dates,
access/use restrictions, copy classes, hold state, and projected disposition.
It records a decision basis; Phase 29 alone executes byte retention or
disposition.
_Avoid_: mutable expiry date, deletion job, current policy lookup, storage row

**Phase 21 Records Schedule Successor Impact Manifest** (Phase 21 D26):
The complete immutable disposition of every existing record cohort affected by
a reviewed law, policy, provider, product, or schedule successor. It proves
which records preserve their prior resolution, receive an authorized
prospective transition, require review, or remain held without silently
rewriting history.
_Avoid_: bulk policy update, retroactive latest rule, best-effort migration

**Phase 21 Records Export Package** (Phase 21 D26):
One immutable, source-watermarked, manifest-complete, open-format custody export
for exactly one Tenant and Legal Entity, with canonical JSONL, bounded safe CSV,
accessible human views, authorized originals, relationships, versions, ordered
parts, and integrity digests. It is neither a generic database dump nor proof
that every tenant or provider record exists inside Phase 21.
_Avoid_: Phase 19 Audit Package, Phase 20 Accounting Delivery Package, Phase 33
report export, QBO/Xero backup, generic database dump, universal history

**Records Export Coverage Manifest** (Phase 21 D26):
The closed immutable accounting of every record/version selected for a Phase 21
Records Export Package, assigning exactly one inclusion, owner-reference,
authority exclusion, restricted-lane, lawful-disposal, quarantine/unavailable,
or not-applicable disposition. **Ready with issues** is explicit partial output
and never masquerades as a complete archive.
_Avoid_: silent omission, row count only, complete flag without conservation

**Tenant External Copy Assertion** (Phase 21 D26):
An attributable tenant statement that an exact package or record copy was
placed in a described tenant-controlled destination class. It is useful custody
evidence but does not prove security, recoverability, legal sufficiency,
verified transfer, or permission to dispose of an Asym-held copy.
_Avoid_: backup verified, requirements met, transfer complete, delete source

**Verified Destination Custody Transfer** (Phase 21 D26):
A separately authorized and certified destination-specific outcome proving
exact destination identity, package-manifest acceptance or readback, integrity,
preserved restrictions and holds, and the applicable governing contract. A
browser download, print action, or Tenant External Copy Assertion is not this
transfer.
_Avoid_: downloaded means transferred, emailed archive, unchecked cloud copy

**Records-only Retrieval Window** (Phase 21 D26):
The contract- and jurisdiction-controlled interval after ordinary product
access ends during which an authorized tenant successor may retrieve required
records packages. It is neither ordinary application access nor a universal or
indefinite period; the applicable reviewed contract owns any minimum.
_Avoid_: permanent portal, fixed global grace period, ordinary subscription
access, universal 30-day rule

**Expense Claim Version** (Phase 21):
One immutable material version of an Expense Claim, including exact signed
items/splits that conserve the claim amount in its ISO currency and the
separately preserved claimant, economic payer, evidence contributor, preparer,
and actual-principal facts. Submission, confirmation, review, and approval pin
this version; later material claimant or authorized draft change creates a
linked successor, stales prior confirmation for submission, and never rewrites
the original actor.
_Avoid_: editable submitted claim, current report row, OCR result as claim
truth, preparer implies claimant

**Expense Report Submission** (Phase 21):
The immutable review envelope that pins exact Expense Claim Versions plus the
actual submitter, claimant confirmation where another actor submits, grouping
purpose, context, and submission time. It may represent one quiet expense or an
explicit trip, project, or period group, but every included claim/item must be
fully qualified and it never crosses claimant Parties or Legal Entities.
Uncovered work is blocked or deliberately submitted separately, never silently
omitted. Its status is a derived completion summary, not approval, obligation,
funding, payment, or accounting authority.
_Avoid_: report as transaction, report-level approved, report-level paid,
hidden partial submission

**Receipt Evidence Asset** (Phase 21 meaning; Phase 29 byte lifecycle):
The immutable private evidence identity for an original receipt,
substantiation document, or governed missing-receipt declaration, including
its exact contributor/source provenance. Phase 21 owns its expense meaning; the
private byte/access lifecycle owns staged upload, storage, renditions, malware
hygiene, current-authorized non-cacheable retrieval, retention, and hold
behavior. Contribution, sender identity, OCR, or similarity never selects a
claimant or grants collaboration authority.
_Avoid_: public upload URL, reusable evidence bearer URL, mutable receipt image,
OCR text as original evidence, uploader implies claimant

**Expense Evidence Link Version** (Phase 21):
The immutable purpose and coverage relationship between one Receipt Evidence
Asset and exact Expense Claim Versions or items, preserving the authorized
linking actor and source. It supports many-to-many evidence only through
explicit, non-overlapping economic coverage or a recorded explanation. Helper
linking never establishes claimant confirmation, sufficiency, policy approval,
or payment.
_Avoid_: copied receipt per claim, attachment implies sufficiency, fuzzy match,
helper link as consent

**Receipt Extraction Suggestion Version** (Phase 21):
A non-authoritative, source- and invocation-provenanced proposal for receipt
fields. Material facts become Expense Claim truth only after explicit
authorized confirmation and deterministic validation.
_Avoid_: OCR result, extracted receipt fact, auto-approved claim

**Expense Match Suggestion Version** (Phase 21):
A non-authoritative proposal linking evidence, a claim, or a separately
certified source transaction. Accepting it creates an ordinary versioned link;
it does not prove a duplicate, payment, economic payer, funding source, or
accounting occurrence.
_Avoid_: automatic receipt match, duplicate deletion, inferred payment

**Organization Card Source** (Phase 21):
The tenant-authorized, Legal-Entity-scoped organization card program and safe
card-identity namespace from which Card Transaction Evidence may be admitted.
_Avoid_: personal card feed, bank account, issuer balance, card subledger

**Organization Card Import Profile Version** (Phase 21):
One immutable prospective interpretation contract for a recognizable
machine-readable Organization Card Source layout and its identity, finality,
date, sign, billing-currency, and safe-card fields.
_Avoid_: Source Profile, mutable column mapping, generic import template, PDF or
OCR truth

**Organization Card Activity File Asset** (Phase 21 meaning; Phase 29 byte
lifecycle):
The private source-file identity whose purpose, manifest relationship, and
financial-evidence meaning belong to Phase 21 while the private byte/access
lifecycle owns storage, malware hygiene, authorized retrieval, holds, and
disposition.
_Avoid_: Receipt Evidence Asset, public statement, OCR data source, reusable
spreadsheet

**Organization Card Activity Import Manifest** (Phase 21):
The immutable evidence of one staged source-file acceptance, including exact
source/profile scope, file and row provenance, control totals, admitted
coverage, classified remainder, and outcome.
_Avoid_: mutable import batch, statement reconciliation, replace-all upload

**Organization Card Transaction Evidence Version** (Phase 21):
The source-attributed append-only evidence that one organization-card purchase
or typed Organization Card Source Adjustment Evidence was reported as posted
under its pinned import-profile finality contract. It is neither an Expense
Claim nor approval, payment, accounting, issuer-settlement, or reconciliation
truth.
_Avoid_: card expense, pending charge as final, reimbursed transaction, synced
card row

**Organization Card Source Adjustment Evidence** (Phase 21):
The typed append-only source evidence for a refund, reversal, dispute, fee,
source correction, or certified source removal affecting Organization Card
Transaction Evidence. It remains source evidence until exact downstream
coverage authorizes the owning domain's correction.
_Avoid_: generic adverse correction, destructive edit, automatic repayment,
Field Account correction by implication

**Organization Card Assignment Version** (Phase 21):
The explicit effective-dated routing relationship between one safe
organization-card identity and one exact authorized claimant Party under its
source-owned relationship context, or a finance queue,
inside the same Tenant and Legal Entity.
_Avoid_: mutable current cardholder, historical retargeting, card ownership,
worker classification

**Organization Card Evidence Coverage** (Phase 21):
The immutable same-billing-currency conservation linking exact Organization
Card Transaction Evidence to business Expense Claim Version item-or-split
coverage, a nonbusiness/personal portion, and an unresolved remainder.
_Avoid_: fuzzy auto-merge, source row equals claim, link implies approval,
personal portion proves repayment

**Expense Policy Cohort** (Phase 21):
A stable tenant-owned grouping used only to select prospective expense
governance for claimants whose approved treatment is intentionally shared.
_Avoid_: inferred worker classification, security role, ad hoc reviewer list

**Expense Policy Cohort Membership Version** (Phase 21):
One immutable prospective placement of an exact claimant into an Expense Policy
Cohort, preserving its effective interval and succession.
_Avoid_: mutable cohort tag, saved-filter membership, retroactive regrouping

**Expense Program Activation Version** (Phase 21):
The immutable prospective Tenant and Legal Entity decision that enables the
expense program and its governed claim-and-review experience.
_Avoid_: expense module by default, setup nag, connection implies activation

**Expense Governance Profile Version** (Phase 21):
One immutable prospective set of expense requirements, evidence rules, limits,
timing, and exception treatment for a bounded expense context. It does not own
reviewer identity, funding, payment, or accounting treatment.
_Avoid_: mutable expense policy, arbitrary rule script, approval workflow

**Expense Governance Assignment** (Phase 21):
The prospective bounded relationship between one source-backed expense context
and one Expense Governance Profile Version.
_Avoid_: rule order, numeric priority, stacked policy, label-only match

**Expense Governance Resolution** (Phase 21):
The immutable incurred-date proof of exactly one winning Expense Governance
Profile Version for one exact Expense Claim Version item or split.
_Avoid_: current-policy lookup, report-wide policy, ambiguous fallback

**Prospective Expense Authorization Posture Version** (Phase 21):
The immutable prospective Tenant- and Legal-Entity decision that keeps before-
spend authorization absent, makes it available when helpful, or requires it for
exact scopes resolved through D13. D13 activation never enables it implicitly.
_Avoid_: expense program means preapproval, hidden-but-live feature, one global toggle

**Prospective Expense Request Version** (Phase 21):
One immutable requester-authored version of a planned expense, pinning the
claimant, purpose, expense family, ceiling, ISO currency, incurrence window,
conditions, and source context. It is neither an incurred Expense Claim nor
organization approval.
_Avoid_: mutable request, purchase order, approved expense, commitment to pay

**Prospective Expense Evidence Asset** (Phase 21/29):
Private plan evidence linked to exact Prospective Expense Request Version
coverage; Phase 21 owns its meaning and Phase 29 owns byte storage, access,
retention, hold, quarantine, and disposition mechanics.
_Avoid_: public quote, receipt evidence, evidence proves approval, email attachment authority

**Prospective Expense Governance Resolution** (Phase 21):
The immutable submission-time proof of the one winning D13 governance scope,
route, consequence, and source/policy versions for an exact Prospective Expense
Request Version.
_Avoid_: current-policy lookup, stacked workflow, assignment means approval

**Prospective Expense Authorization Decision** (Phase 21):
One immutable organization decision over an exact Request Version, recording
approved, declined, or needs-information treatment and any narrowed ceiling,
window, or permitted condition after current-authority and conflict checks.
It does not prove incurrence, eligibility, reimbursement, payment, or accounting.
_Avoid_: mutable approval, self-approval, automatic approval, approval means payable

**Prospective Expense Authorization Coverage** (Phase 21):
The immutable exact, non-overlapping link from one authorization ceiling to
later D10 Expense Claim Version item or purpose-split coverage in the same
purpose and ISO currency. It preserves partial and multi-claim use without
making the later claim approved.
_Avoid_: fuzzy plan match, report-wide coverage, duplicate authorization consumption

**Prospective Expense Unused Scope Declaration** (Phase 21):
The immutable authorized assertion that an exact residual authorization slice
will not be used, recorded only after proof that it is not linked or in flight.
Expiry alone is never such proof.
_Avoid_: timer release, mutable remaining amount, cancellation deletes history

**Prospective Expense Capacity Reservation** (Phase 21):
The optional Field Account Funding Coverage subtype that reserves exact same-
purpose, same-currency D1 planning capacity atomically with a final prospective
authorization decision. It is not a debit, Reimbursement Obligation, payment,
or promise that funds are available.
_Avoid_: approved means reserved, spend limit, wallet hold, reservation means payable

**Travel Allowance Source Package** (Phase 21):
One immutable, named and capability-bounded mileage or per-diem source revision
whose provenance, population, effective interval, exact rates/components,
currency, and certification evidence are preserved together. Certification
proves faithful source execution, not tenant applicability or legal compliance.
_Avoid_: live government rate, globally compliant schedule, mutable rate table

**Travel Allowance Calculation Occurrence** (Phase 21):
The immutable calculation evidence for one exact Expense Claim Version item or
split under its winning Expense Governance Resolution and pinned Travel
Allowance Source Package or external calculation. It is neither approval,
Reimbursement Obligation, Field Account capacity, payment, payroll/tax, nor
accounting truth.
_Avoid_: travel approval, payable allowance, current rate result, paid mileage

**Travel Allowance Cumulative Capacity Allocation** (Phase 21):
The immutable consumption of one exact claimant Party-, relationship-, and
policy-period-scoped mileage or allowance band by an exact Travel Allowance
Calculation Occurrence.
_Avoid_: mutable miles-to-date counter, claim-local band, preview reservation

**Travel Allowance Opening Cumulative State** (Phase 21 D28):
One immutable, evidence-labelled source-defined qualifying quantity immediately
before an exact D13/D18 cumulative authority boundary. It is neither historical
claim reconstruction nor money, approval, obligation, payment, tax, payroll,
Field Account, or accounting truth.
_Avoid_: initial miles, current odometer, opening balance, amount already paid

**Travel Allowance Capacity Key Contract** (Phase 21 D28):
The immutable source-defined identity and succession rule for one cumulative
capacity pool or indivisible aggregation group. A successor explicitly
continues the existing pool or begins a genuinely new pool; routine profile,
source, relationship, vehicle-record, or code version changes do not reset it.
_Avoid_: employee-year key, profile-version counter, vehicle-row balance

**Travel Allowance Cumulative Admission** (Phase 21 D28):
The independently proved native opening state (`clean_boundary_zero` or
`opening_cumulative_state`) plus continuing-source proof
(`asym_source_complete` or `authoritative_feed_complete`) that permit one exact
cumulative pool or indivisible group to use D18 native calculation for a named
authority interval. `external_at_boundary` is a complete manifest disposition
that selects `external_calculation_lane`; neither the disposition nor lane is
native-admission proof or evidence of completeness, and neither creates an
Admission.
_Avoid_: travel feature enabled, clean period means complete, migration passed

**Travel Allowance Cumulative Admission Manifest** (Phase 21 D28):
One immutable content-addressed proof that every pool or indivisible group
admitted to native calculation in an exact census has one non-overlapping
opening disposition and one continuing-source proof before native first use.
Groups kept in `external_calculation_lane` have no native Admission and remain
explicitly outside that admitted cohort.
_Avoid_: setup checklist, mutable readiness percentage, baseline spreadsheet

**Expense Approval Route Version** (Phase 21):
One immutable prospective finite sequence of independent review requirements
and capability roles for bounded expense coverage.
_Avoid_: arbitrary workflow graph, named approver as permanent authority,
timeout approval

**Approval Assignment Snapshot** (Phase 21):
The immutable submission-time resolution of one Expense Approval Route Version
to exact governed expense-operation coverage and initially eligible reviewers
or queues. Coverage may be an incurred claim item/split or one prospective
request, but never both; the snapshot is assignment evidence, not continuing
authorization or approval.
_Avoid_: mutable approver list, report approval, assignment implies authority

**Expense Review Action** (Phase 21):
One immutable human reviewer action over exact authorized governed expense-
operation coverage, recorded after current authority and conflict checks. The
operation explicitly distinguishes an incurred claim decision from prospective
authorization.
_Avoid_: AI approval, self-approval, timeout approval, bulk action as one fact

**Reviewer Exception** (Phase 21):
A typed, reasoned, independently authorized exception recorded inside an
Expense Policy Decision without changing the governing Profile Version.
_Avoid_: generic override, missing evidence silently waived, policy mutation

**Expense Policy Decision** (Phase 21):
The source-owned disposition of each Expense Claim line under the applicable
Expense Governance Resolution and worker relationship, including approved,
rejected, needs-information, or excluded treatment. It pins the Approval
Assignment Snapshot, exact human review evidence, and any authorized Reviewer
Exception; it does not prove funding or payment.
_Avoid_: report paid status, accounting approval, automatic eligibility,
assignment implies approval

**Accounting-ready expense handoff** (Phase 20/21):
The immutable, PII-minimized projection through which exact approved expense,
Reimbursement Obligation, External Payment Occurrence evidence, separately
certified Expense Advance Issuance, Expense Advance Application, Claimant
Repayment Occurrence, or cause-linked correction facts may enter Phase 20,
linked through exact source and coverage lineage. It is not the report,
receipt, approval workflow, Field Account Funding Coverage, payment executor,
field-account entry, or external general-ledger record. A
Compensation Handoff Package, Compensation Funding Decision, Compensation
Draft Delivery Profile Version, Provider Draft Operation, provider
acceptance/readback, or reservation cannot enter through this expense lane.
Neither can a Reimbursement Handoff Package, Reimbursement Delivery Profile
Version, Reimbursement Execution Claim, Reimbursement Handoff Coverage,
Handoff Attestation, Reimbursement Handoff Operation, or provider draft/input
acceptance/readback. Only the independently eligible obligation or separately
certified source economic occurrence may qualify through its own discriminator.
An Expense Advance or Claimant Repayment Policy, Authorization, residual
projection, Repayment Decision or Requirement, task, evidence observation,
dispute, Restitution Review, or Field Account reservation is likewise rejected;
only a separately certified D16 economic occurrence and exact coverage may
qualify under accountant-confirmed policy and an independently assigned Phase
20 D17 posting owner. Every D22 prospective posture, request, evidence
reference, governance or assignment snapshot, review action, authorization
decision, compatible capacity reservation, later-claim authorization coverage,
unused-scope declaration, residual, successor, and correction is likewise
rejected. Only a later independently qualified D10/D13 actual expense,
obligation, payment occurrence, or other certified economic source may enter.
Every D23 Expense Field Account Effect Recognition Profile, Effect Basis,
Field Account Funding Coverage or Disposition, Effect Coverage, Expense Field
Account Effect, Support Cycle inclusion, exception, and correction is likewise
operational support-balance truth and is rejected as accounting authority. An
independently certified D18 source may preserve minimum necessary D23 lineage,
but it never inherits D23 qualification, mode, close, or date. Every D24
Expense Collaboration Assignment or Invitation Version, Evidence Access
Projection Version, Claimant Confirmation Version, Expense Collaboration
Action, helper/preparer/submitter fact, notification, reassignment, revocation,
or lifecycle record is likewise collaboration/assertion provenance and is
rejected as accounting authority. An independently qualified Approved Expense
Snapshot or later certified source may retain only its minimum non-
authoritative D24 actor lineage. Every D25 Expense Claim Resolution Cause
Contract Version, Case, Occurrence, Projection, Downstream Impact Manifest or
disposition, task, message, response, source-owner request, and case-completion
proof is likewise coordination truth and is rejected as accounting authority.
Only an independently qualified source correction may enter its existing Phase
20 lane, retaining at most an opaque non-authoritative D25 correlation. Every
D26 Phase 21 Records Schedule Contract or Binding Version, Record Retention
Resolution, successor-impact manifest, Records Export Package, Records Export
Coverage Manifest, tenant external-copy assertion, verified destination custody
transfer, retrieval-window fact, notification, or export receipt is likewise
records-governance or custody evidence and is rejected as accounting authority.
Including a Phase 20 artifact in a D26 custody export neither creates nor
changes an Accounting Release, delivery, provider-posting, readback, drift, or
reconciliation fact.
_Avoid_: exporting an unapproved expense, copying the expense product into
Phase 20, a generic expense blob, provider identifiers as source truth

**Approved Expense Snapshot** (Phase 21):
The immutable source-owned version of exact approved Expense Claim Version
coverage, preserving every item/split disposition, economic-payer and
funding-source classification, allocations, policy decision, approval evidence,
succession lineage, and only the minimum non-authoritative collaboration actor
provenance needed for audit. One Expense Report Submission may yield zero, one,
or many snapshots. Later approved coverage creates a non-overlapping supplement
or successor and never changes coverage already handed to accounting. A D24
assignment, confirmation, helper action, or submission does not create or
approve the snapshot, and the snapshot does not prove Field Account Funding
Coverage or external payment. A D25 Case, Occurrence, Projection, impact
disposition, or **Complete** label cannot create, revoke, reopen, or supersede
the snapshot; only D10/D13-owned exact append-only truth can.
_Avoid_: one snapshot per report, mutable approval, report-level paid authority,
Phase 20 ownership of receipts or approval, collaboration or resolution as
approval

**AI Provider Connection** (shared AI foundation):
The stable Tenant-owned relationship to one exact AI provider account or
organization, environment, and compatible region. It is not a credential and
does not authorize a feature or data egress by itself.
_Avoid_: global AI key, provider name as connection identity, connection implies use

**AI Provider Credential Revision** (shared AI foundation):
One write-only encrypted, replaceable, and revocable provider authority for an
AI Provider Connection. Reads expose only safe identity/lifecycle evidence and
a masked hint; historical work retains the non-secret revision reference.
_Avoid_: secret readback, mutable key column, credential in logs or job payloads

**AI Capability Binding Version** (shared AI foundation):
One immutable prospective Tenant- and purpose-scoped selection of an exact AI
Provider Connection, Credential Revision, capability-certified provider/model
and region, input/output contract, data-use posture, schema/prompt family, and
budget/rate envelope. Different purposes may select different bindings.
_Avoid_: arbitrary endpoint, free-form model, one key enables all AI, silent fallback

**AI Egress Manifest** (shared AI foundation):
The immutable authorization and minimum-data record for one AI egress,
including exact source versions/digests, classifications, purpose, Binding
Version, fields or bytes released, and any redaction or denial result.
_Avoid_: broad record copy, credential, post-hoc egress justification

**AI Invocation Evidence** (shared AI foundation):
The immutable idempotent provenance for one model attempt: safe provider/model
and binding identifiers, input/output digests, schema version, timing, outcome,
error class, and authorized usage/cost observations. It contains no credential,
raw model reasoning, or unrestricted prompt/output log.
_Avoid_: model output as audit truth, secret-bearing trace, retry without identity

**AI Suggestion Version** (shared contract; accepted by the owning domain):
A typed non-authoritative model result with source and invocation provenance,
quality warnings, and an explicit accepted, rejected, or superseded outcome.
Only the owning domain's authorized command may translate a confirmed
suggestion into its source truth.
_Avoid_: AI decision, automatic fact, cross-domain write authority

**Reimbursement Obligation** (Phase 21):
The exact remaining operational amount established and append-only succeeded or
corrected by the core D16 Expense Settlement Determination when D10/D13 approved
coverage and the independently applicable policy or law support an amount owed
to the claimant. D10/D13 own approval facts; D16 owns this record without
creating or adjudicating legal liability; D15 only consumes it for handoff and
external-payment evidence. It remains distinct from Field Account capacity,
payment scheduling, payment evidence, and accounting representation.
_Avoid_: approved claim, funded expense, scheduled payment, paid reimbursement

**Reimbursement Handoff Package** (Phase 21):
The immutable, content-addressed, schema-versioned, PII-minimized artifact that
projects exact non-overlapping Reimbursement Obligation coverage to one
authorized external reimbursement process. Creation, preview, protected audit
retrieval, reference download, and redownload are non-executing access. Only a
separate Reimbursement Execution Claim plus explicit release may hand covered
work to an executable lane. The package never contains beneficiary-bank
credentials and does not prove handoff, provider acceptance, scheduling,
payment, accounting, or reconciliation.
_Avoid_: generic payout file, download means sent, package means paid, receipt
bundle, mutable reimbursement batch

**Reimbursement Delivery Profile Version** (Phase 21):
The immutable prospective binding for one reimbursement lane, scoped to the
exact Tenant, Legal Entity, claimant-relationship authority, reimbursement
family, external execution owner, and—when connected—provider organization,
product, country, environment, external provider participant/payee reference,
ISO currency, cadence or cycle, and certified operation. The provider reference
is not a Support Assignment Participant Membership and is never inferred from
one. It may pin an already-applicable Phase 20 D17
source-family posting-ownership contract, but it never assigns or infers the
posting owner of a future payment occurrence. A successor affects future
unclaimed coverage only and never retargets an existing package, execution
claim, handoff operation, or payment.
_Avoid_: mutable route, one profile across entities or countries, payroll
connection implies accounting connection, route change after unknown outcome

**Reimbursement Execution Claim** (Phase 21):
The immutable exclusivity record assigning each exact, non-overlapping
Reimbursement Obligation coverage unit to exactly one executable lane. It is
created only at explicit release and is distinct from package creation or
access. A successor may claim only an exact residual proved not released or
not executed; `outcome_unknown` coverage remains quarantined and cannot fall
back, expire, or be assigned to a second lane.
_Avoid_: whole-report route, dual delivery, timer fallback, retry means new
owner, download as execution claim

**Reimbursement Handoff Coverage** (Phase 21):
The immutable conservation link from one Reimbursement Execution Claim and
Handoff Operation to exact non-overlapping Reimbursement Obligation amount
coverage. It is distinct from Field Account Funding Coverage and
Reimbursement Payment Coverage. Every released unit resolves once as
`confirmed_handed_off`, `proven_not_handed_off`, or `outcome_unknown`; it does
not claim the external process executed or paid that amount.
_Avoid_: funding reservation, payment application, whole-report coverage,
overlapping executable owners, handoff coverage means paid

**Handoff Attestation** (Phase 21):
The immutable staff-authored evidence that one exact Reimbursement Handoff
Package and Execution Claim were delivered to the named governed external
process by an explicit method and reference. It proves only the recorded
handoff. It does not prove provider acceptance, calculation, scheduling,
funding, payment, claimant receipt, accounting, or reconciliation.
_Avoid_: download log as handoff, handoff means paid, mutable checklist,
report-level external processing flag

**Reimbursement Handoff Operation** (Phase 21):
The immutable source-labelled evidence for one released handoff attempt under
an exact Reimbursement Execution Claim. A manual operation culminates in a
Handoff Attestation. A connected payroll or accounts-payable operation may
reuse D7's concurrency, idempotency, readback, drift, and ambiguity-safe
operation kernel only for a capability-certified pre-execution draft or input
that the tenant's effective provider automation cannot approve, calculate,
submit, schedule, fund, or send. QBO and Xero Accounting bills, payments,
journals, and other accounting objects remain Phase 20-only and are not D15 AP
drafts. Each covered unit resolves only as
`confirmed_handed_off`, `proven_not_handed_off`, or `outcome_unknown`; only a
proved non-handoff residual may enter a successor.
_Avoid_: generic payout operation, provider draft means paid, blind retry,
automatic route switch, compensation/reimbursement truth conflation

**Expense Advance Policy Version** (Phase 21):
The immutable prospective Tenant- and Legal-Entity-owned rules under which an
organization may authorize, issue, establish claimant-use readiness,
substantiate, apply, or carry an expense advance for one bounded claimant
context. External return authority belongs to the Claimant Repayment Policy.
_Avoid_: global advance setting, mutable deadline, policy proves payment,
accountable-plan law engine

**Claimant Repayment Policy Version** (Phase 21):
The immutable prospective Tenant- and Legal-Entity-owned rules for deciding and
externally resolving exact claimant-return candidates from certified source
families. It does not establish legal debt, payroll authority, payment, or
accounting truth.
_Avoid_: collections policy, automatic personal-spend debt, mutable repayment
rules, one policy for every jurisdiction

**Expense Advance Authorization Version** (Phase 21):
The immutable organization authority to issue up to an exact amount and ISO
currency for one claimant, purpose, policy version, and expected expense
interval. It does not prove issuance, claimant use, expense, or accounting.
_Avoid_: advance payment, available cash, authorization means issued

**Expense Advance Issuance Occurrence** (Phase 21):
The immutable source-qualified economic fact that an external organization
process issued an exact advance to the authoritative claimant. Evidence
strength remains explicit and does not prove approved expense or accounting.
_Avoid_: authorization as issuance, provider draft as issuance, accounting
entry as claimant receipt

**Advance Evidence Observation** (Phase 21):
One immutable source-labelled observation about an Expense Advance Issuance
Occurrence. A stronger observation corroborates or conflicts with the same
economic identity rather than creating another issuance.
_Avoid_: uploaded file as a second advance, silent proof upgrade, mutable
evidence status

**Advance Application Readiness** (Phase 21):
The source-contract determination called claimant-use readiness in D16: an
issued advance is eligible to satisfy exact approved expense coverage. It does
not claim general cash availability, withdrawability, authorization, provider
acceptance, check creation, or accounting.
_Avoid_: available funds, issued means applicable, scheduled means usable,
accounting means received

**Expense Settlement Determination** (Phase 21):
The immutable Approved-Expense-Snapshot-rooted result for claimant-
reimbursable coverage that atomically conserves approved coverage across
advance applications, the remaining Reimbursement Obligation, typed residuals,
and separately tenant-authorized Field Account Funding Coverage. It is a core
claimant-reimbursement command; optional Advance and Claimant Repayment policy
activation controls only those branches and never gates the ordinary obligation
or funding partition. The same command may materialize Funding Coverage only
from already-authorized tenant policy; the determination itself supplies no
funding authority. A claimant-paid D23 Effect Basis may reference this
determination; organization-card, organization cash/debit/direct-payment, and
certified-payable sources instead bind their exact D10/D13 approved economic-
payer slice and source occurrence directly and never fabricate this record.
_Avoid_: reduce reimbursement later, mutable settlement, report paid status

**Expense Field Account Effect Recognition Profile** (Phase 21):
The immutable prospective D23 policy version that selects one certified
source-family-specific occurrence for support-balance inclusion timing over an
exact Tenant, Legal Entity, purpose, Field Account, and ISO-currency scope. It
is not GAAP, tax, accounts-payable, payment, or QBO/Xero policy.
_Avoid_: cash-basis accounting setting, recognize expense, per-claim timing

**Expense Field Account Effect Basis** (Phase 21):
The immutable Approved-Expense-Snapshot-rooted record pinning the one winning
D23 profile, certified source family and stable economic occurrence, immutable
observation/evidence versions, exact approved and funding coverage, Field
Account amount/currency authority, cutover/close lineage, and correction
lineage for one expense-effect slice. Claimant-paid slices may bind an Expense
Settlement Determination; organization-paid slices bind approved economic-
payer coverage directly.
_Avoid_: second Expense Settlement Determination, mutable posting basis,
provider status as authority, observation revision as a new economic root

**Expense Field Account Effect Coverage** (Phase 21):
The exact non-reusable, same-currency coverage connecting one approved economic
slice to at most one Expense Field Account Effect while explicitly preserving
organization-funded and unresolved residual dispositions.
Its uniqueness is specific to the D23 operational namespace; independent Phase
20 accounting-source coverage neither consumes nor satisfies it.
_Avoid_: available-balance partial, cross-currency sum, reusable expense amount

**Expense Field Account Effect** (Phase 21):
The signed D23 operational occurrence that changes a Field Account through a
later D1 Support Cycle close after its exact source-family prerequisites and
coverage qualify. A root expense effect ordinarily reduces the Field Account;
a linked correction may increase or decrease it without rewriting history. It
is not expense approval, reimbursement, payment, accounting posting, bank
reconciliation, or evidence of available worker funds.
_Avoid_: recognized expense, paid expense, QBO/Xero expense, worker withdrawal

**Expense Advance Application** (Phase 21):
The immutable same-currency, non-overlapping coverage that applies a
readiness-qualified Expense Advance Issuance Occurrence to exact eligible
Approved Expense Snapshot coverage.
_Avoid_: reimbursement payment, advance balance edit, report-level offset

**Advance Residual Position** (Phase 21):
The through-dated derived portion of one issued advance not yet applied,
externally returned, or otherwise resolved by a certified occurrence. It is not
a wallet balance, debt, or claimant-owned money.
_Avoid_: amount available, amount owed, mutable advance balance

**Claimant Repayment Decision** (Phase 21):
The immutable authorized organization disposition of exact source-final and
responsibility-proved coverage as corrected, no return requested, external
return requested, or referred to a specialist.
_Avoid_: personal classification means debt, cardholder means responsible,
automatic repayment request

**Repayment Subject Determination** (Phase 21):
The immutable source-backed determination of the exact Party whose relationship,
jurisdiction, responsibility evidence, and conflict/dispute route make them an
eligible subject of a Claimant Repayment Decision. It is not debt or a return
request.
_Avoid_: cardholder is liable, assignee is debtor, portal role as responsibility

**Claimant Repayment Requirement** (Phase 21):
The exact operational amount and ISO currency that finance has authorized
requesting back from an authoritative claimant under a Claimant Repayment
Decision. It is not adjudicated debt, collection authority, payment, payroll,
or accounting truth.
_Avoid_: receivable by default, debt balance, payroll deduction authorization

**Claimant Repayment Occurrence** (Phase 21):
The immutable source-qualified economic fact that a claimant returned an exact
amount through an externally owned process. It remains distinct from the
request, evidence strength, accounting entry, and final bank reconciliation.
_Avoid_: acknowledgment as return, staff task complete means repaid, accounting
entry as money returned

**Repayment Evidence Observation** (Phase 21):
One immutable source-labelled observation about a Claimant Repayment
Occurrence. Stronger evidence corroborates or conflicts with the same economic
identity and never silently mints a second return.
_Avoid_: mark repaid, silent confirmation upgrade, fuzzy payment match

**Claimant Repayment Coverage** (Phase 21):
The immutable, exact, non-overlapping application of one Claimant Repayment
Occurrence to one or more Claimant Repayment Requirements in the same ISO
currency, with every unapplied residual typed explicitly.
_Avoid_: negative reimbursement, Field Account netting, one mutable claimant
balance

**Repayment Restitution Review** (Phase 21):
The cause-linked review opened when source truth changes after a claimant has
returned money. It preserves prior occurrences and cannot itself authorize or
prove an organization-to-claimant restoration payment.
_Avoid_: destructive undo, silent future offset, repayment reversal means paid

**Field Account Funding Coverage** (Phase 21):
The immutable allocation of exact organization-controlled Field Account
capacity to one typed approved purpose under a tenant policy. Compensation
coverage reserves capacity for one exact Compensation Funding Decision;
reimbursement coverage reserves capacity for one exact approved expense
purpose; expense-advance coverage reserves capacity for the exact approved
funding component of one Expense Advance Authorization Version; and an
explicitly certified prospective-expense reservation may reserve same-purpose,
same-currency planning capacity for one exact Prospective Expense Authorization
Decision. Coverage prevents reuse but is neither a Field Account debit, a
Reimbursement Obligation, a payroll or payment authorization, nor evidence that
cash moved. When a qualified effect posts, one immutable disposition makes the
exact overlapping active coverage amount derive `fulfilled`; the original
coverage is not rewritten and effect-backed coverage never derives `released`.
Capacity subtracts the reservation before recognition and the debit afterward,
never both. A D22 prospective reservation, D10/D16 actual funding coverage, and
D23 effect are one exact append-only disposition lineage with at most one
capacity-bearing state. Only a non-overlapping remainder may derive `released`,
and only with proof that the exact work was never handed off/submitted or exact
downstream cancellation/reversal proof. Unknown work stays reserved in an
exception and coverage never expires by timer.
_Avoid_: worker-owned money, reimbursement balance, payment authorization,
available cash, advance application means fulfilled, compensation coverage
equals compensation expense

**Field Account Funding Coverage Disposition** (Phase 21):
The immutable append-only fact that derives one exact Funding Coverage slice as
fulfilled by a qualified effect, reclassified into an exact successor coverage
family, released with required non-use/cancellation proof, or unresolved and
quarantined. It never mutates the original coverage. Fulfillment and the
balanced effect commit atomically so one slice cannot consume capacity as both
reservation and debit. In exact-payment-qualified reimbursement, a payment
return atomically reverses the effect and creates successor reserved coverage
when the Reimbursement Obligation remains live.
_Avoid_: mutable coverage status, timer release, reservation plus debit,
returned payment frees a live obligation

**Support Cost Source Admission Contract** (Phase 21):
The immutable prospective contract that identifies one exact source family and
the source-specific evidence, finality, correction, completeness, currency, and
capability conditions under which its residual organization costs may be
considered by Phase 21 D20. It cannot admit a D21 asset valuation, appraisal,
sale, brokerage, liquidation, disposition, or proceeds cost, even when a source
labels that charge a fee; those facts remain exclusively inside D21's source-
mode-honest realization contract and cost treatment.
_Avoid_: provider record exists means eligible, whole-ledger connector, generic
posted status, noncash-disposition cost as residual support cost

**Support Cost Economic Occurrence Root** (Phase 21):
The canonical identity that joins every proved source alias for one real-world
organization cost and permits at most one semantic Field Account application
owner. It cannot be rooted in a D21 asset lot, disposition, realization,
valuation, brokerage, liquidation, or proceeds-cost fact.
_Avoid_: provider ID as economic uniqueness, duplicate cost per source, fallback
owner

**Support Cost Source Observation** (Phase 21):
A private source-labelled observation about a potential organization support
cost before certified source finality. It has no Field Account effect.
_Avoid_: imported cost, pending debit, observed means applied

**Organization Support Cost Occurrence** (Phase 21):
One immutable source-final, purpose-compatible residual organization service or
direct-cost fact whose semantic family is exclusively owned by Phase 21 D20.
D21 sale, brokerage, liquidation, valuation, and disposition costs and Phase 20
D19 processor costs are categorically excluded rather than treated as residual
families or fallback D20 occurrences.
_Avoid_: assessment, compensation cost, expense claim, processor cost, bill as
balance effect, noncash realization cost

**Support Cost Bearing Policy Version** (Phase 21):
The immutable prospective tenant choice for whether one certified support-cost
family is organization-absorbed, Field-Account-borne, exactly split, or sent to
review.
_Avoid_: arbitrary debit rule, executable formula, retroactive cost policy

**Support Cost Application Determination** (Phase 21):
The immutable proposal that applies one winning bearing policy to one qualified
Organization Support Cost Occurrence and identifies exact target, absorbed,
carryforward, and unresolved dispositions.
_Avoid_: applied cost, close result, staff journal

**Support Cost Application Manifest** (Phase 21):
The immutable per-currency conserving publication of one qualified support
cost's exact terminal dispositions and target coverage; unresolved target work
is not admitted as close-complete.
_Avoid_: mutable allocation sheet, cross-currency total, unresolved means done

**Support Cost Carryforward** (Phase 21):
A bounded non-overlapping tranche of a qualified support cost awaiting a later
permitted disposition without a current Field Account effect. It is neither
worker debt nor AP, availability, payment, or a silently expiring adjustment.
_Avoid_: amount owed by missionary, pending debit, automatic future charge

**Support Cost Accounting Candidate Handoff** (Phase 21):
A PII-minimized projection of a closed Organization Support Cost Occurrence for
possible future Phase 20 qualification. It is accounting-dark until a separate
Phase 20 source contract proves semantics, nonduplicate posting ownership, and
admission.
_Avoid_: accounting-ready label before Phase 20 qualification, journal
request, ready to post

**Engagement Authority Reference** (Phase 21):
The exact externally owned worker/payee arrangement identity and version that
a Compensation Funding Plan and Decision reference. The tenant's HR, legal,
payroll, or accounts-payable authority—not Asym—owns classification,
compensation entitlement, tax treatment, and changes to that arrangement. The
reference may pin an exact provider identity/version or a governed
tenant-issued record with issuer/actor, effective interval, classification
asserted by that external authority, source/evidence reference, and immutable
version.
_Avoid_: inferring employee or contractor status from the `missionary` role,
Field Account type, fundraising goal, or compensation plan

**Compensation Funding Period** (Phase 21):
The exact half-open interval for one compensation-funding proposal and
decision. It is independently identified even when it happens to align with a
Support Cycle or an external payroll/accounts-payable period.
_Avoid_: support cycle equals payroll period, month-only identity, mutable
period boundary

**Compensation Funding Plan Version** (Phase 21):
The immutable prospective tenant configuration that references an Engagement
Authority Reference, scope, destination, Field Account funding currency,
external compensation/payment currency, visibility, cadence, half-open
configuration-effective interval, and exactly one bounded funding method:
Finance enters each cycle, Fixed approved target, or Up to an approved maximum.
It does not own a cycle's Compensation Funding Period. The currencies are equal
by default; a different pair requires exact external conversion authority,
amounts, rounding, residual, and provenance. The default is `Not managed in
Asym`.
_Avoid_: payroll policy, wage formula, percentage of balance, automatic short
check, mutable standing amount, overlapping Plan Version intervals, plan
effective interval equals Compensation Funding Period, one ambiguous currency
for cross-currency funding

**Compensation Funding Proposal** (Phase 21):
The disposable, cycle-specific preview calculated from one active plan,
Finance-confirmed Field Account capacity, non-reusable prior coverage, and any
configured support-balance floor. It has no financial, payroll, payment, or
Field Account authority.
_Avoid_: proposed equals approved, proposal creates coverage, proposal as
balance entry

**Compensation Funding Decision** (Phase 21):
The immutable finance authorization for one worker/payee and Compensation
Funding Period that pins its exact Engagement Authority Reference and plan versions,
Field Account-covered amount, separately organization-covered amount,
unresolved amount, both money currencies and conversion evidence when
different, destination, actor, time, and evidence. Its purpose-typed coverage
reserves capacity but does not debit the Field Account, establish wages,
submit payroll, move money, or prove payment.
Compare-and-swap plus same-scope/period uniqueness permits one current,
non-superseded decision lineage; changes append successors and off-cycle work
uses a distinct exact period.
_Avoid_: payroll approval, wage decision, payment order, mutable cycle amount,
duplicate current decision, funding decision equals Field Account effect

**Compensation Effect Recognition Policy** (Phase 21):
The prospective Legal-Entity policy that permits a Compensation Field Account
Effect from exactly one evidence authority: the guided finalized External
Compensation Result or the bounded exact External Payment Occurrence
alternative. It cannot qualify a plan, proposal, funding decision, coverage,
export, provider draft, accounting entry, pay-run schedule, or payslip.
Payment-based recognition additionally requires an exact source-qualified
organization-cost basis or a link to a finalized result that supplies it; net
cash alone is insufficient.
_Avoid_: debit on approval, export means expense, posted payroll means paid,
switching evidence per occurrence, inferring gross cost from net payment

**Compensation Handoff Package** (Phase 21):
The immutable, content-addressed, schema-versioned, PII-minimized artifact that
projects one authorized Compensation Funding Decision to the tenant's external
payroll, contractor-AP, or accounting process. It always exists as
human-usable evidence, while one immutable route selects exactly one executable
outbound lane: artifact fulfillment, one exact capability-certified provider
draft input, or one separately certified Phase 20 source handoff. Artifact
existence is not a second execution, and an accounting projection remains only
a source handoff; the decision/reservation alone creates no payable, expense,
Posting Intent, or Accounting Release.
_Avoid_: universal payroll payload, dual delivery, provider payload as source
truth, package download means submitted, accounting connection implies payroll
access, reservation as compensation expense or payable

**Compensation Handoff Adapter** (Phase 21):
The provider-, product-, country-, environment-, and operation-pinned boundary
that compiles one Compensation Handoff Package only into a currently certified
provider capability, or supplies exact provider readback plus artifact
fulfillment when no equivalent safe write exists. A fully built adapter means
the supported lifecycle is complete; it never implies provider parity,
payroll calculation, execution, payment, or accounting authority.
_Avoid_: logo-level connector, adjacent-object substitution, regional product
collapse, provider acceptance equals payroll completion

**Compensation Handoff Adapter Portfolio** (Phase 21):
The D7 launch set is provider- and region-pinned Gusto Employee Payroll Draft,
ADP Workforce Now Pay Data Input, separate Xero Payroll AU/NZ draft-input
adapters, and complete QuickBooks Workforce/Xero Payroll UK
readback-and-artifact adapters where no equivalent safe per-run write is
proved. The Phase 21 multi-provider launch is incomplete until at least two
direct-write adapters hold current production authorization and certification;
QBO/Xero Accounting remain Phase 20-only.
_Avoid_: sandbox means launched, provider review pending means available,
Xero Payroll implies Xero Accounting, readback-only advertised as direct write

**Compensation Draft Delivery Profile Version** (Phase 21):
The immutable prospective binding of one Tenant, Legal Entity, provider
organization, provider product, country, environment, external provider
participant/payee reference, currency, pay cycle, component-role mapping, and
certified operation for one provider draft lane. The provider reference is not
a Support Assignment Participant Membership and is never inferred from one. A
replacement version affects future packages only and never retargets an
existing package or Provider Draft Operation.
_Avoid_: mutable destination, name-only external provider participant/payee
match, inferred provider organization, one profile across countries or products

**Provider Draft Operation** (Phase 21):
The immutable, source-labelled evidence of one explicit attempt to apply a
Compensation Handoff Package to one exact provider draft/input target,
including concurrency proof, request/response identity, exact readback where
exposed or exact permitted provider/staff confirmation otherwise, drift, and
per-unit coverage disposition. Covered units resolve only as
`confirmed_updated`, `proven_not_updated`, or `outcome_unknown`; only proved
non-updates may enter a residual successor, while unknown work stays
quarantined.
_Avoid_: blind retry, destructive overwrite, mutable attempt, timeout means
failed, accepted means completed or paid

**External Compensation Result** (Phase 21):
The immutable source-labelled evidence of the finalized result owned by the
tenant's external payroll or accounts-payable authority, including exact
organization-cost roles and any failure, cancellation, partial reversal, or
reversal. A processed result or payslip does not by itself prove payment.
_Avoid_: Asym-calculated payroll, provider draft as final result, net pay plus
withholdings double-counted as organization cost, payslip equals paid

**Compensation Field Account Effect** (Phase 21):
The append-only debit or correction created only from evidence qualified by the
pinned Compensation Effect Recognition Policy and limited by the exact
Compensation Funding Decision and coverage. It carries a component-level
result/payment-to-decision application manifest that conserves the qualified
organization-cost basis exactly into Field Account-applied, separately
organization-funded, and unresolved variance. Field Account application cannot
exceed unused active compensation coverage, organization funding cannot exceed
the Decision authorization, and mismatches never silently clamp, prorate, or
change funding-source priority. It preserves the original decision, result,
payment, and closed-balance history. Only a change or reversal in the
policy-selected authority may append signed component deltas; disagreement on
the other track remains evidence or an exception, not an automatic reversal.
_Avoid_: debit from a plan or reservation, mutable draw, automatic backpay,
result overapplication, silent funding reprioritization, editing a prior close

**Compensation Payment Coverage** (Phase 21):
The immutable proof of the exact compensation-result amount covered by one
External Payment Occurrence. A mixed compensation/reimbursement payment uses
the occurrence's one payment currency, exact typed Compensation Payment
Coverage, Reimbursement Payment Coverage, and one signed, typed, explicitly
resolved residual disposition, including zero, that together conserve the
complete payment. A covered source component in another currency preserves
both source/payment amounts and exact conversion evidence.
_Avoid_: duplicate payment occurrences for one transfer, report-level paid,
unallocated or untyped residual, implicit FX, coverage beyond the payment

**Compensation Exception Case** (Phase 21):
The cause-owned finance exception for an unresolved funding shortfall,
authority mismatch, capability failure, ambiguous provider outcome, drift,
payment issue, or reversal. Resolution appends exact evidence or a successor
decision; it never silently reduces wages, creates debt or backpay, rewrites
the plan, or clears because a generic task was closed.
_Avoid_: one catch-all error flag, automatic short check, destructive retry,
task completion equals financial resolution

**External Payment Occurrence** (Phase 21):
The immutable source fact and evidence that the tenant's payroll,
accounts-payable, or governed manual process executed a compensation or
reimbursement payment with exact covered amounts. It preserves the exact
source label and evidence strength—such as staff-attested, payroll/AP-provider
observed, payment-provider observed, bank observed, or another separately
certified authority—plus authoritative payee, amount, ISO currency, source,
provider, observed, and recorded times. Staff evidence remains visibly
**Payment recorded by finance** and is never silently upgraded to stronger
confirmation. A request, approval, schedule, provider submission, payslip,
accounting record, or Field Account debit is not this occurrence.
_Avoid_: Asym payout, inferred payment, approval implies paid, report-level
paid, provider draft acceptance as payment, QBO/Xero entry as payment proof

**Accounting-ready expense occurrence** (Phase 20/21):
A typed, source-owned Cleared Organization-Paid Expense, Approved Reimbursement
Obligation, evidence-qualified Reimbursement Payment, or Expense Accounting
Correction that may authorize an Accounting Posting Intent. It is neither a
journal line nor a provider object.
_Avoid_: one generic expense event, approval implies payment, pending card
authorization as cleared spending, editable debit and credit input

**Reimbursement Payment Coverage** (Phase 20/21):
The immutable proof of the exact approved reimbursement obligations and
amounts covered by one External Payment Occurrence represented by
source-owned evidence, including partial, grouped, one-to-many, and many-to-one
settlement. It is homogeneous for one Tenant, Legal Entity, payee,
disbursement currency, external execution owner, and posting owner; a
cross-payee batch only groups separate atomic payments. Original applications
never overapply or mutate;
later returns, disputes, and corrections append new occurrences. A
reimbursement-only payment is conserved by this coverage plus one signed,
typed, resolved payment-side residual disposition, including zero. A mixed
compensation/reimbursement payment uses the occurrence's one payment currency
and is conserved by one complete typed manifest across exact Compensation
Payment Coverage, Reimbursement Payment Coverage, and one signed, typed,
resolved residual disposition, including zero. A source component in another
currency preserves immutable source/payment amounts and exact conversion
evidence; unresolved residual or FX ambiguity fails closed. Phase 20 D17 assigns one
posting owner to the whole payment; if payroll/AP owns it, the reimbursement
slice cannot create a standalone Accounting Release. It is evidence, not Asym
payment execution, an AP ledger, or a mutable outstanding-balance system.
_Avoid_: whole-report `paid`, some-or-all payment confirmation, inferred
coverage, Phase 20 reimbursement aging, split posting ownership for one
payment, untyped residual or implicit FX, reimbursement-only release for an
externally posted mixed payment

**Accepted Source Purpose Authority Snapshot** (Phase 13; consumed by Phase 21):
The immutable accepted posted-line projection that freezes exact Designation,
restriction-or-preference classification, purpose and excess-use policy
version, source-posting coverage, and one closed provenance variant. When the
accepted source presented or captured governed content, that variant freezes
the exact source-owned publication kind, reference, and digest. Otherwise it
records typed `not_applicable` or `not_captured` together with the exact
source-purpose evidence reference and digest, such as a Designation,
remittance, memo, or acceptance-authority record. Phase 22 owns a public
giving-page publication only when that page was the accepted source, over
Phase 23's CMS substrate; Phase 17 owns a message publication only when a
governed communication was the accepted source. Phase 21 consumes the snapshot
to prove purpose compatibility but cannot edit or infer it from current
labels, pages, organization discretion, or a fabricated publication.
_Avoid_: current Designation equals historical purpose, mutable restriction
flag, worker page as authority, invented publication, reallocation policy
overriding accepted terms

**Support Reallocation Case** (Phase 21):
The bounded coordination and review record for an active Field Account
reallocation or exit disposition. It relates a request, policy, coverage,
organization Decision, and independent outcomes without becoming balance,
payment, accounting, or lifecycle truth.
_Avoid_: transfer record, mutable financial status, worker withdrawal

**Support Reallocation Policy Version** (Phase 21):
The immutable prospective tenant policy governing request mode, eligible typed
Phase 21 destinations, bounded limits, approval roles, visibility, and exit
suggestions. It cannot grant worker execution authority or override accepted
source-purpose authority.
_Avoid_: workflow builder, mutable transfer rules, arbitrary destination policy

**Support Reallocation Coverage Manifest** (Phase 21):
The immutable mapping of each proposed disposition line to exact accepted
source-purpose authority and unreserved Field Account capacity. It is neither
an aggregate balance nor evidence that an internal or external outcome
occurred.
_Avoid_: available balance, fungible support pool, completed transfer

**Support Reallocation Coverage** (Phase 21):
The non-reusable exact source-purpose and amount coverage activated by an
organization Decision. An internal pair fulfills it atomically; an external
line remains covered through partial or unknown outcomes until an exact
qualified disposition effect fulfills it or authoritative non-execution proof
releases the remainder.
_Avoid_: worker-owned reserve, timer-expiring hold, approval equals debit,
ambiguous failure releases capacity

**Reallocation Eligibility Projection** (Phase 21):
The disposable staff calculation of Finance-confirmed balance after every
qualified negative open-cycle effect not yet in the close, active non-reusable
coverage, and the policy floor. It is not cash, worker availability, authority,
or a durable financial fact, and provisional positive support never increases
it.
_Avoid_: transferable balance, spendable funds, approved amount

**Support Reallocation Decision** (Phase 21):
The immutable organization authorization for exact reviewed disposition lines
under pinned source-purpose, policy, lifecycle, destination, close, and capacity
authority. It is distinct from a worker request, Field Account occurrence,
external payment, and Accounting Release.
_Avoid_: worker choice, approval means paid, mutable transfer approval

**Worker Lifecycle Authority Reference** (Phase 21):
The exact externally owned worker-lifecycle identity, version, status, and
effective boundary that authorizes exit handling. It is distinct from D4's
compensation-specific Engagement Authority Reference and is never inferred from
dashboard access, fundraising activity, `missionaries.is_active`, or a finance
note.
_Avoid_: finance-selected exit date, support-account status, manual departure
flag

**Exit Disposition Manifest** (Phase 21):
The immutable conserving plan for every purpose-and-currency amount associated
with an exiting Field Account, including internal destinations, covered
charitable succession, continuing authorities, and explicit
organization-retained successors. It is not one atomic outcome and cannot
cancel independently live compensation, reimbursement, legal, payment, or
communication work.
_Avoid_: sweep balance, close-and-zero, worker-owned exit payout

**Charitable Succession Handoff** (Phase 21):
The evidence-gated projection of an organization-authorized external
charitable disposition to an exactly identified recipient under applicable
jurisdiction and purpose authority. It preserves exact coverage but does not
move money or prove payment.
_Avoid_: external transfer, paid grant, worker-selected charity payout

**Charitable Succession Result** (Phase 21):
The immutable external outcome that matches the organization Decision,
still-valid required authority, Charitable Succession Handoff, and
authoritative payment occurrence. Payment evidence alone, an unknown provider
result, or a Handoff is not this Result. Its qualified Field Account effect is
one atomic balanced occurrence: the source debit and an exact typed
organization-control/disposition counter-entry enter the same governed close.
The counter-entry is neither a recipient Field Account nor general-ledger
truth.
_Avoid_: handoff complete, payment lookup equals approval, inferred external
success, one-sided external debit

**Support Reallocation Accounting Occurrence** (Phase 21; consumed by Phase 20):
The typed, close-covered qualified internal or charitable-succession occurrence
that is the sole eligible future source root for Phase 20
accountant-confirmed interpretation and posting ownership. The current Phase 20
generation deliberately keeps this source family unsupported and
accounting-dark until a separately approved Phase 20 change certifies its
source schema, accountant semantics, Posting Profile recipe, and Posting
Ownership Cutover behavior. A request, policy, coverage, Decision, Handoff,
open-cycle pair, unknown external result, or uncertified close-covered
occurrence remains accounting-dark.
_Avoid_: transfer approval as journal authority, direct QBO/Xero write,
reservation as accounting effect, generic journal fallback

**Legal Entity** (Phase 7 canonical; consumed by source phases and Phase 20):
The enduring legal and financial organization beneath a Tenant that receives
money, issues receipts, owns settlement relationships, and keeps its own books.
Each Tenant starts with one quiet default, but every independently authoritative
financial root stores the exact Legal Entity explicitly. A Legal Entity may
optionally link to one same-Tenant organization Party for CRM relationships,
contacts, and presentation; that Party is not required for financial identity,
and Party merge, archival, or display-name change cannot rewrite the Legal
Entity. Sites may present a Legal Entity but never define one.
_Avoid_: one entity per Site or fund, a parallel Legal Issuer identity, the
Tenant default as historical or runtime ownership, a provider organization as
the entity

**Legal Issuer Profile Version** (Phase 7):
The immutable, effective-dated receipt-issuer facts used by one Legal Entity,
including the approved legal name, address, registration or tax identifiers,
signature and jurisdiction-required presentation facts. A receipt, statement,
or generated document pins the exact version it used. The profile is evidence
about the stable Legal Entity at one time; it is not a second organization
identity, and editing current issuer details creates a successor version.
_Avoid_: mutable issuer fields on a receipt, Legal Issuer as a parallel entity,
inferring the issuer from Site branding or current Tenant settings

**Legal Entity capability readiness** (Phase 20 over source-owned identity):
The independently proven ability of one Legal Entity to perform a particular
kind of work, such as receiving donations, issuing receipts, settling money, or
delivering accounting records. Failure in one capability does not imply that
the others are unavailable.
_Avoid_: one global `active` or `verified` flag, accounting access blocking
donations, provider metadata presented as legal certification

**Settlement Account Binding** (source phases; certified by Phase 20):
The immutable-versioned, effective-dated relationship between one Tenant, one
Legal Entity, and one exact processor merchant account in one environment for
an approved settlement purpose. Source money roots pin the binding used; a
replacement is prospective and preserves historical merchant and settlement
ownership. Currency, balance type, payout destination, and Accounting
Destination readiness are proved separately by a Settlement Currency Lane
Version rather than inferred from this binding.
_Avoid_: one permanent processor account on the Tenant, automatic cross-entity
failover, a provider display name as identity, rewriting old transactions after
an account change

**Settlement Currency Lane Version** (Phase 20):
The immutable, prospective authorization for one exact Tenant, Legal Entity,
Settlement Account Binding, processor account and environment, balance type,
settlement currency, payout destination, Accounting Destination, and half-open
effective interval. The ordinary lane is derived quietly only when the
settlement currency exactly equals the destination's certified QBO home or Xero
base currency; retaining another currency is explicit and proof-gated.
_Avoid_: tenant-wide multicurrency boolean, mutable capability as authority,
retroactive activation, per-gift currency routing

**Accounting Destination** (Phase 20):
The stable external set of books to which accounting work may be delivered,
identified by its provider-native organization identity and environment.
Replaceable OAuth grants authorize access to it but do not define it.
_Avoid_: an OAuth user as the destination, a display name as identity, silently
changing companies during reconnect

**Provider Authorization Grant** (Phase 20):
The encrypted provider-issued credential family authorizing Asym's provider app
within exact granted scopes. It owns the current monotonic token generation,
expiry evidence, provider-user subject where available, serialized rotation,
and non-secret lifecycle lineage. One Xero grant may authorize several exact
organization connections, so it is never itself a Tenant, Legal Entity, or
Accounting Destination.
_Avoid_: one Xero token family per destination, concurrent refresh,
tenant-readable tokens, workflow-carried credentials

**Accounting Destination Connection** (Phase 20):
The effective-dated Tenant- and Legal-Entity-scoped binding from one Accounting
Destination to one authorized Provider Authorization Grant for an exact
provider and environment. It preserves provider-organization identity and
binding history but does not own tokens, provider health, capability
certification, delivery outcome, or reconciliation truth.
_Avoid_: a mutable `connected` boolean, display-name identity, authorization
health stored as destination truth, silent destination replacement

**Provider authorization attempt** (Phase 20):
A short-lived, single-use, server-owned OAuth transaction bound to its actor,
session, Tenant, Legal Entity, provider, environment, purpose, expected
destination when reconnecting, requested scopes, setup revision, nonce, and
expiry. Callback success proves provider authorization only; promotion still
requires current Asym authority and exact provider-organization verification.
_Avoid_: reusable OAuth state, callback state as permission, reconnect reused
as destination replacement

**Local authorization quarantine** (Phase 20):
The immediate Asym-side prohibition on new provider calls through a grant or
destination while revocation, compromise, ambiguity, or recovery is resolved.
It is effective without provider cooperation and remains distinct from
provider-confirmed revocation.
_Avoid_: claiming remote revocation from a local flag, deleting historical
destination evidence, automatic backlog retry after reconnect

**Semantic accounting policy** (Phase 20):
The versioned, tenant-accountant-confirmed interpretation that converts
source-authorized economic facts into canonical account roles, accounting
dates, and semantic dimensions. It is neither source truth nor a provider
mapping.
_Avoid_: provider adapters making accounting policy, silently changing old
releases, claiming blanket GAAP compliance

**Accounting Posting Intent** (Phase 20):
The immutable typed statement that an exact source occurrence is eligible to
be projected for one accounting purpose, Legal Entity, date basis, and
semantic accounting-policy version. It preserves why accounting work exists
without becoming a provider document.
_Avoid_: an arbitrary journal form, a mutable export row, a QBO/Xero object
type

**Canonical Accounting Effect** (Phase 20):
The immutable, provider-neutral, exactly balanced debit-and-credit meaning
derived from an Accounting Posting Intent under its frozen semantic accounting
policy. It defines required accounting effect, not provider record shape or
delivery success.
_Avoid_: provider payloads as accounting truth, adapter-created accounting
policy, balance achieved with an unexplained plug

**Source Coverage Manifest** (Phase 20):
The immutable proof of how every accounting-relevant source occurrence and
amount is represented exactly once or explicitly excluded in a Canonical
Accounting Effect. It preserves source-level traceability even when posting
lines are summarized.
_Avoid_: assuming a balanced total proves completeness, duplicate source
coverage, losing lineage during summarization

**Provider effect equivalence** (Phase 20):
The evidence that a complete graph of provider-native planned or observed
operations preserves the exact Canonical Accounting Effect without overlap,
omission, or hidden automatic accounting effects. A successful request or
matching grand total alone is insufficient.
_Avoid_: HTTP success as proof, silent dimension loss, universal journal
fallback, unmodeled provider defaults

**Posting Profile** (Phase 20):
The prospective, versioned selection of an approved posting grain and
product-owned provider-native recipes for one Legal Entity and Accounting
Destination. It controls representation, not source truth or accounting
policy.
_Avoid_: an arbitrary recipe builder, per-release selection, a mutable active
profile, provider representation changing economic meaning

**Posting grain** (Phase 20):
The amount of source detail represented in the accounting provider: gift
detail, gift-and-fund detail, or fund summary. Every grain retains the same
gift-level Source Coverage Manifest in Asym.
_Avoid_: posting grain as accounting policy, summary that loses source
lineage, reporting views tied to provider output

**Provider-native recipe** (Phase 20):
A product-owned, versioned, conformance-tested method for compiling an exact
Canonical Accounting Effect into the provider objects appropriate to one
source purpose. Tenants select bounded outcomes; they do not author the
operation graph.
_Avoid_: universal journals, silent transaction-type substitution, tenant
payload editors

**Single posting owner** (Phase 20):
The invariant that exactly one system owns provider posting for one canonical
source occurrence, Legal Entity, destination, source account or instrument,
Accounting Posting Intent family, and source-authoritative ownership interval.
It prevents Asym, another connector, a create-capable bank rule, or a manual
workflow from independently recording the same economic activity.
_Avoid_: ownership by source-family label alone, overlapping connectors,
manual workflow ignored as an owner, artifact download treated as another
posting path

**Posting Ownership Cutover** (Phase 20):
The immutable, prospective transfer of provider-posting ownership for one
source-authoritative scope from a previous owner to a next owner at a complete
atomic source boundary. It preserves the prior owner and exact half-open
ownership interval without splitting a payout, Deposit Group, expense,
payable, payment, or other source-owned occurrence.
_Avoid_: calendar-date-only cutoff, two owners, retroactively moving an active
boundary, implicitly reactivating the previous owner

**Cutover Coverage Manifest** (Phase 20):
The immutable coverage evidence for one frozen, explicitly bounded cutover
review population. It records each source occurrence's ownership disposition
and exact, bounded, staff-confirmed, or unavailable evidence strength without
copying financial truth or claiming universal provider history.
_Avoid_: second source ledger, all-history scan, empty query as proof of
absence, clean occurrences requiring row-by-row staff review

**Previous-owner posting evidence** (Phase 20):
Exact or capability-labelled evidence that a prior connector or manual workflow
created a provider record for a source occurrence. It remains attributed to the
previous owner and may support continuity or correction without becoming Asym
delivery.
_Avoid_: fuzzy date-and-amount adoption, relabelling external work as Asym,
provider similarity as ownership proof

**Accounting Reporting Target** (Phase 20):
A tenant-owned, Legal-Entity-scoped, provider-neutral downstream reporting
projection to which one or more source-owned Designations may resolve. A target
used once is displayed as exact; a target shared by several Designations is
displayed as grouped. It changes representation only.
_Avoid_: treating a reporting target as donor restriction, net-asset class,
accounting policy, CRM hierarchy, or provider object

**Designation Mapping Version** (Phase 20):
The immutable, prospective, effective-dated resolution authority for
Designations used by one Legal Entity and Accounting Destination. It contains
explicit or bulk assignments plus one optional named-default-or-require-review
policy and is pinned by every Accounting Release that uses it.
_Avoid_: live mapping rules, overlapping active versions, historical rewrite,
per-release overrides

**Mapping Coverage Manifest** (Phase 20):
The immutable per-release proof that every included Designation allocation
resolved exactly once to an Accounting Reporting Target or a policy-authorized
evidence-only disposition, and then to the required typed provider carrier
without omission or duplication.
_Avoid_: assuming balance proves mapping completeness, additive override and
group behavior, silent `Other`, mixed mapping versions

**Typed provider carrier binding** (Phase 20):
The destination-scoped binding from one bounded semantic role to a certified
provider object type and stable provider object identifier, with expected
type, activity, account, currency, and capability evidence. QBO Accounts,
Classes, Locations, Items, and Projects and Xero Accounts, Tracking Options,
and separately certified Projects are not interchangeable fund fields.
_Avoid_: provider mapping by name, arbitrary carrier substitution, provider
identifiers in source truth, silent remapping after drift

**QBO Carrier Plan Version** (Phase 20):
The immutable, prospective, destination-scoped authority that defines and
certifies the QuickBooks Online carrier kinds and posting positions allowed for
each bounded role, while validating a pinned set of D6 bindings and declaring
its exact QBO Reporting Visibility.
_Avoid_: mandatory Class-only bookkeeping, an arbitrary field-mapping language,
provider objects deciding accounting meaning, historical reinterpretation,
silent carrier fallback

**QBO Capability Certificate** (Phase 20):
The time-bounded evidence that one exact QuickBooks Online destination currently
supports a QBO Carrier Plan Version's preferences, scopes, field positions,
provider objects, relationships, and capacity.
_Avoid_: inferring capability from a product name, treating a webhook as proof,
reusing evidence across realms

**QBO Reporting Visibility** (Phase 20):
The derived disclosure of whether a semantic role is visible in QuickBooks
across income and expense, on one side only, transaction-wide, project-specific,
split across reports, or retained only in Asym.
_Avoid_: calling partial visibility full coverage, confusing reporting
visibility with Source Coverage or Mapping Coverage

**Xero Carrier Plan Version** (Phase 20):
The immutable, prospective, destination-scoped authority that defines and
certifies the Xero carrier kinds and posting positions allowed for each bounded
role, while validating a pinned set of D6 bindings and declaring its exact
Xero Reporting Visibility.
_Avoid_: mandatory Tracking-only bookkeeping, an arbitrary field-mapping
language, Xero objects deciding accounting meaning, per-release overrides,
silent carrier fallback

**Xero Tracking Budget** (Phase 20):
The derived current disclosure of active and archived Tracking Category and
Option capacity, role usage, and calculated report-column exposure for one
Xero organization. It is evidence for a carrier choice, not a stored quota or
accounting authority.
_Avoid_: assuming a third active category, treating recommended option counts
as hard API limits, ignoring two-category report multiplication

**Xero Capability Certificate** (Phase 20):
The time-bounded evidence that one exact Xero organization and destination
currently support a Xero Carrier Plan Version's scopes, permissions, object
semantics, recipe positions, Tracking capacity, report envelope, currency, and
evidence tier.
_Avoid_: inferring capability from a Xero plan name, treating object readback
as journal proof, reusing evidence across organizations

**Xero Reporting Visibility** (Phase 20):
The derived disclosure of whether a semantic role is visible in Xero across
income and expense, on one side only, transaction-wide, Tracking-limited,
separately certified Project-specific, split across reports, or retained only
in Asym.
_Avoid_: calling partial Xero visibility full coverage, confusing reporting
visibility with Source Coverage, Mapping Coverage, delivery, or reconciliation

**Accounting Release** (Phase 20):
The immutable, balanced accounting intent frozen for one destination from exact
source facts and governing D4 policy/effect, D5 Posting Profile/recipe, D6
Designation Mapping, provider Carrier Plan, compiler, adapter, and
provider-contract versions. It is neither an external provider record nor proof
that delivery or reconciliation succeeded.
_Avoid_: a mutable export batch, editing a release after provider delivery, one
release spanning incompatible destinations

**Accounting Release Cadence Policy Version** (Phase 20):
The immutable, prospective tenant choice for when one product-owned Posting
Intent family may reach the Accounting Release fence for one Legal Entity,
Accounting Destination, and delivery lane: automatically when eligible,
prepared on a bounded schedule for review, or held for staff.
_Avoid_: configurable accounting truth, arbitrary cron, tenant-authored
readiness rules, retroactively changing frozen releases

**Release Candidate** (Phase 20):
A derived, disposable projection that says source work currently appears ready
for an Accounting Release. It is revalidated against exact current authorities
at the release fence and is never sent to an accounting provider.
_Avoid_: candidate as financial truth, persisting one mutable ready boolean,
releasing a stale review snapshot

**Accounting Release fence** (Phase 20):
The one atomic compare-and-freeze boundary that revalidates source versions,
policy, mapping, Carrier Plan, destination, period treatment, and blocking
exceptions before creating an immutable Accounting Release.
_Avoid_: separate automatic and manual release logic, bypass through Release
now, treating a provider batch as the release transaction

**Cadence Execution Evidence** (Phase 20):
The durable, PII-minimized audit record of one automatic, scheduled, manual, or
catch-up cadence evaluation, including its logical occurrence, policy, exact
reviewed selection when applicable, source digests, reason-coded exclusions,
Pause or resume evidence, releases created, and provider correlations.
_Avoid_: retaining disposable candidates as audit truth, donor PII in run
evidence, workspace retention determining financial evidence retention

**Release Horizon** (Phase 20):
The quiet, derived Ready for Accounting view of what needs staff, what will
happen automatically and when, what is blocked, and what recently released.
It summarizes but never collapses readiness, release, delivery, readback,
drift, or reconciliation truth.
_Avoid_: metric-card dashboard, one synced status, noisy healthy-run alerts

**Accounting Exception Contract** (Phase 20):
The versioned, product-owned definition of one exceptional accounting cause,
including its detecting authority, root-cause scope, block radius, permitted
actions, revalidation, and proof required to clear.
_Avoid_: tenant-authored exception rule, generic provider error, editable
resolution policy

**Accounting Exception Case** (Phase 20):
One durable occurrence of a contract-defined, source-authoritative accounting
condition at its narrowest root-cause scope, with append-only evidence and
linked recurrence. A shared Mission Control task may own human follow-up but
never determines whether the case is resolved.
_Avoid_: generic ticket, task status as financial truth, one case per affected
row when one shared root cause exists

**Exception Cluster** (Phase 20):
A disposable Ready for Accounting grouping of compatible open Accounting
Exception Cases that share the cause, scope, and next safe action.
_Avoid_: persisted case authority, mixed-currency total, one bulk action across
incompatible preconditions

**Correction Cause** (Phase 20):
The source-owned reason that previously released accounting needs new
downstream treatment, distinct from the tenant accountant's classification of
its financial-statement or GAAP significance.
_Avoid_: Asym deciding materiality, treating every late event as an accounting
error, free-text correction type

**Correction Posting Policy Version** (Phase 20):
The immutable, prospective, accountant-confirmed tenant policy that identifies
permitted treatments and posting periods for each Correction Cause.
_Avoid_: Asym accounting advice, arbitrary backdating, a tenant-authored rules
engine, retroactively changing prior policy

**Compensating Accounting Release** (Phase 20):
A new immutable Accounting Release whose balanced effect corrects, reverses, or
supplements one or more earlier releases while preserving exact lineage to the
original source facts, policy, and provider evidence.
_Avoid_: editing or deleting the original release, silent replacement,
parallel correction ledger

**Posting Period Readiness** (Phase 20):
The independently observed state of whether a proposed posting period is
tenant-policy-permitted and provider-accepted. It is not authority to open,
close, or override an accounting period.
_Avoid_: Asym-owned close calendar, advisory provider preflight as final truth,
storing a closing-date password

**Accounting Evidence Artifact** (Phase 20):
The immutable, machine-verifiable manifest and human-auditable representation
retained for every Accounting Release. It proves what Asym intended and why,
but it is not necessarily a QBO/Xero import file or evidence of provider
acceptance.
_Avoid_: treating a downloaded audit package as delivered, discarding evidence
after API delivery, making a provider-specific file the accounting authority

**Accounting delivery lane** (Phase 20):
The one delivery method selected for an Accounting Release: direct provider API
or staff-mediated provider import. The lanes are mutually exclusive for the
same release so one accounting intent cannot be posted twice.
_Avoid_: API delivery plus manual import for one release, a download silently
changing delivery state

**Provider Delivery Plan** (Phase 20):
The immutable versioned binding from an Accounting Release to its exact tenant,
legal entity, destination, connection, posting date, currency, payload digest,
and pinned D4 policy/effect, D5 Posting Profile/recipe, D6 mapping, QBO or Xero
Carrier Plan, compiler, adapter, and provider-contract versions. It makes
delivery reproducible without turning the provider payload into accounting
truth.
_Avoid_: resolving mappings or destination identity during a retry, reusing a
plan across tenants or legal entities

**Import Surface Conformance Record** (Phase 20):
A narrow, product-owned, expiring evidence record proving that one exact
provider, region, subscription capability, importer, template, serializer,
limit set, and recovery contract has been tested for staff-mediated accounting
delivery. It proves file conformance, not tenant accounting policy, current
staff permission, successful import, provider finalization, or reconciliation.
_Avoid_: generic QBO CSV, generic Xero CSV, tenant-authored import schema,
another capability platform, direct-delivery capacity certificate

**Accounting Delivery Package** (Phase 20):
The immutable, Legal-Entity-, destination-, and staff-mediated-lane-pinned
projection compiled from one frozen Provider Delivery Plan into one logical
package and zero or more ordered provider-import parts. It preserves exact
bytes and evidence but does not prove download, import, provider finalization,
effect verification, or reconciliation.
_Avoid_: mutable export, mandatory ZIP, download equals import, re-import as
retry, silent regeneration, spreadsheet as accounting authority

**Certified Execution Envelope** (Phase 20):
The product-owned, versioned evidence of the exact provider, environment,
provider-contract, adapter, recipe, operation, line, byte, batch, latency,
readback, and recovery workload shapes Asym has proved safe for direct
accounting delivery. It establishes structural safety, not live quota, provider
health, queue position, or a completion guarantee.
_Avoid_: one gift-count limit, tenant-editable capacity, copied documentation as
proof, live provider conditions frozen into a certificate

**Provider Capacity Observation** (Phase 20):
A source-labelled, time-bounded observation of current provider quota, health,
commercial headroom, and tenant-fair queue conditions used to derive current
scheduling state and completion timing. It cannot change an Accounting Release,
Provider Delivery Plan, Posting Profile, destination, or delivery lane.
_Avoid_: stored quota as provider truth, capacity observation as permission,
exact completion promise, accounting or reconciliation status

**Outcome unknown** (Phase 20):
A Delivery Operation state used when a provider may have committed a write but
Asym lacks sufficient proof of the result. The operation is quarantined and
read from the provider before retry; it is not treated as an ordinary failure.
_Avoid_: blind retry after timeout, retrying an entire release, claiming
exactly-once delivery

**Reconciliation Verdict** (Phase 20):
Asym's independently derived comparison of an Accounting Release with current
provider and settlement evidence. Provider acceptance alone is not a
reconciled verdict, and later provider drift may change the current verdict
without rewriting historical evidence.
_Avoid_: `accepted = reconciled`, one mutable `synced` flag, overwriting prior
reconciliation evidence

**Processor Payout Transfer** (Phase 20):
The provider-owned movement of one amount and currency from one exact processor
account to one settlement destination, with its own independently observed
lifecycle. It is not gift truth, bank-arrival proof, or an Accounting Release.
_Avoid_: bare payout, settlement batch, treating `paid` as bank reconciled

**Settlement Component** (Phase 20):
One immutable provider balance movement that contributes to processor
settlement evidence, preserving its gross amount, fee, net effect, currency,
provider classification, and source reference when available.
_Avoid_: editable processor row, subtracting an embedded fee twice, guessed
classification

**Provider Conversion Evidence** (Phase 20):
The immutable provider-attributed evidence for one conversion, preserving the
exact account, environment, source occurrence, source and destination currency,
amount basis, raw nullable rate and its documented direction, effective time,
and separately classified provider costs where exposed. The source gift's
presentment amount remains independent, and a site's reporting currency is not
evidence of QBO home currency or Xero base currency.
_Avoid_: mutable aggregate balance, market or staff rate, inferred or synthetic
rate, reporting currency as accounting-provider authority

**Processor Cost Attribution Policy Version** (Phase 20):
The prospective Tenant-, Legal-Entity-, settlement-binding-, and source-family-
scoped choice that assigns an exact ordinary processor expense either to the
organization or, after associated fee-cover, to supported Designations. It
changes expense attribution, never gift, receipt, or settlement truth.
_Avoid_: net-gift policy, fee estimate as accounting truth, per-gift formula

**Uncovered Processing Cost** (Phase 20):
The non-negative part of one exact eligible charge-linked processor cost that
remains after its associated fee-cover contribution is applied for attribution
purposes. It is an accounting-policy result, not a smaller contribution.
_Avoid_: net donation, donor deduction, estimated fee

**Processor Cost Attribution Manifest** (Phase 20):
The immutable proof linking one exact eligible processor-cost occurrence to
its frozen policy, fee-cover, original Designation weights, organization and
Designation shares, mappings, and Accounting Effect coverage.
_Avoid_: mutable fee split, payout-wide pro rata, current-fund recalculation

**Designation Cost Exception Version** (Phase 20):
A prospective, policy-backed instruction that one Designation cannot bear its
calculated uncovered processor-cost share, so that share remains
organization-borne without shifting onto another supported Designation.
_Avoid_: per-gift override, redistribution to other funds, retroactive exemption

**Settlement Evidence Snapshot** (Phase 20):
An immutable, versioned observation that records either complete
provider-attributed payout composition or a bounded processor-balance interval,
including the evidence mode and its exact limitations.
_Avoid_: mutable current-provider view as historical evidence, invented payout
membership, one universal reconciliation mode

**Payout-attributed evidence** (Phase 20):
A Settlement Evidence Snapshot whose complete component membership is
explicitly supplied by the processor for one supported Processor Payout
Transfer.
_Avoid_: amount-and-date matching, incomplete pagination, attribution while the
provider still reports composition in progress

**Balance-window evidence** (Phase 20):
A Settlement Evidence Snapshot that proves processor balance activity over one
bounded account, balance type, currency, and interval without claiming that the
processor identified which individual components composed a transfer.
_Avoid_: presenting manual, instant, or unsupported payout membership as exact

**Settlement Source Link** (Phase 20):
The exact evidence relationship from a Settlement Component to a source-owned
money occurrence without transferring truth ownership to the processor or
settlement context.
_Avoid_: fuzzy source matching as final truth, processor records rewriting
source facts

**Processor Settlement Verdict** (Phase 20):
Asym's derived assessment of settlement-evidence completeness, arithmetic
conservation, classification, and source coverage. It remains separate from
Processor Payout Transfer state, Bank Match, and Accounting Release state.
_Avoid_: one `reconciled` flag, provider success as proof of source coverage

**Bank Match** (Phase 20):
The independently governed, source-labelled allocation of an Expected Bank
Arrival to posted bank evidence. It explains whether processor or offline-
deposit expectations agree with observed bank activity; it is not final bank
reconciliation, which remains owned by QuickBooks Online or Xero.
_Avoid_: `payout.paid = bank received`, processor composition as bank evidence,
Asym-reconciled

**Expected Bank Arrival** (Phase 20):
An immutable expectation that one Processor Payout Transfer or frozen offline
Deposit Group will arrive at one exact Legal Entity bank-account binding for a
specified amount, currency, direction, and bounded date window.
_Avoid_: bank transaction, receivable, proof of arrival, mutable expected
deposit

**Bank Evidence Observation** (Phase 20):
A source-labelled observation of bank activity obtained from a reviewed
statement import, an optional certified read-only connection, or explicit
staff-confirmed evidence, with its provenance, freshness, and supersession
lineage preserved.
_Avoid_: bank truth without provenance, mutable imported row, staff attestation
presented as provider evidence

**Bank Match Allocation** (Phase 20):
The exact minor-unit amount assigned between one Expected Bank Arrival and one
posted Bank Evidence Observation. Allocations may be one-to-one, many-to-one,
one-to-many, or partial without over-allocating either side.
_Avoid_: fuzzy match as proof, one mutable matched boolean, reusing consumed
bank evidence

**Settlement Exception** (Phase 20):
A cause-coded, auditable condition that identifies incomplete, inconsistent,
unclassified, or unmatched settlement evidence and its bounded recovery owner.
_Avoid_: silent suspense plugs, raw provider errors as staff workflow, one
exception blocking unrelated settlements

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

Domain expert: "No. Recurring giving has its own product-owned schedule,
occurrence, and rail-specific recovery lifecycle; provider subscriptions are
execution legs, not the business authority. One-time donation saga recovery and
recurring occurrence recovery remain separate payment concepts."

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

## Dated Phase 17 glossary congruence note (2026-07-19)

The Phase 17 terms above are the canonical vocabulary for System Messages &
Template Management. Earlier documents sometimes use **template**, **binding**,
**notification**, **sender setting**, or **workflow** as if each were the whole
product. The Phase 17 winner keeps those narrower ideas separate: a **System
message contract** owns meaning and safety; a **System-message publication**
owns one immutable presentation; a **Delivery Plan** selects only
contract-permitted Delivery Steps; a **Delivery Plan occurrence** is Phase 6's
atomic coordination header for all-before-any intent release; a **Communication
intent/event** remains the recipient-specific execution and history fact; and
producer domains retain business truth, recipient authority, timing, and
protected actions.

Compatibility boundary: historical rows and earlier prose remain evidence of
their original systems. They do not become executable-catalog lifecycle,
publication approval, recipient truth, sender authority, workflow state, or
proof that a message was sent. Phase 17 is a groomed planning contract, not a
claim that these glossary objects are built or dispatched.

## Dated Phase 19 glossary congruence note (2026-07-24)

The Phase 19 terms above are the canonical vocabulary for Year-End Statement
Operations. Earlier documents sometimes use **annual statement**, **batch**,
**recipient**, **household statement**, **delivery status**, or **campaign** as
if one row owned the whole operation. The Phase 19 winner keeps each authority
separate: Phase 7 owns the legal-donor Statement Subject, eligibility, facts,
coverage, and correction effect; Phase 13 owns posted money; Phase 14 owns
Recognition Subjects; Phase 18 owns logical documents, exact artifacts,
currentness, access, and records; Phase 17/6 own communication preparation,
transport, and delivery evidence; and Phase 19 owns the Run Preflight, frozen
population, bounded participation, release and control fences,
recipient-operation coordination, physical fulfillment, operational
completion, and Run Evidence Record.

Compatibility boundary: the existing donor-portal live-text year view,
ad-hoc year filters, provider queues, PDF jobs, message states, and historical
batch rows remain evidence of their own systems. They do not become a Statement
Run, establish eligibility, merge legal donors, prove delivery or printing, or
authorize a current artifact. Phase 19 D1–D18 are a groomed planning contract,
not a claim that these glossary objects are built or dispatched.
