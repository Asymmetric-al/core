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
and publication, plus full attribution and audit. It is not a human staff role.
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

**Gift / Donation**:
A donor's contribution record through the platform — one-time or a recurring
installment — carrying amount, currency, a single designation, payment/provider
state, and receipt state. "Gift" and "donation" are used interchangeably for
this record. See [[one-time-donation]], [[recurring-giving]].
_Avoid_: fixed-total pledge or recurring commitment (intent records, not
received gifts), staged gift (the post-completion record)

**Fund**:
A tenant-owned designation target — such as a general or project fund — a gift
can be directed to, distinct from a missionary. See [[designation]].
_Avoid_: missionary, campaign, Stripe product

**Designation**:
The single missionary or fund a gift is directed to at checkout. A gift
designates exactly one target today; reallocation after the fact is a
[[contribution-correction]], not a donor edit.
_Avoid_: split gift, multi-line allocation, missionary and fund on one gift

**Staged Gift**:
The record created when a donation completes, carrying receipt status, CRM-post
status, and designation for downstream receipting and CRM posting. It is not
the donation record itself.
_Avoid_: donation row, receipt, pending donation

**Fixed-total pledge**:
The canonical record of a Commitment Party's explicit promise to give a
cumulative amount. Received contributions may fulfill it through authoritative
applications, but the pledge itself is not money, donor debt, automatic payment
authority, or an accounting receivable by default; collection method does not
determine its type.
_Avoid_: recurring commitment, provider subscription, received gift, donor debt,
accounting receivable by default

**Contribution Correction**:
A recorded staff change to a completed contribution that affects money, donor
identity, designation, provider state, refunds, receipts, or donor-visible
history, preserving a before/after trail rather than silently overwriting
truth.
_Avoid_: silent edit, direct overwrite, harmless metadata edit

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

**Active assignment** (Phase 12):
The single organization-hat a person acts within for one request. A staffer who serves
several orgs holds several assignments but acts within exactly one at a time; the resolver
refuses to run without one, so data never bleeds across orgs.
_Avoid_: a client-chosen tenant; a person-global (org-blind) permission resolution

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

**Fee-cover** (Phase 13):
An extra amount, on top of the intended gift, that covers processing fees so ~100% reaches the
field. Configured per tenant and per payment method (optional or, for a method, mandatory);
a fully-deductible gift shown as its own line, never a hidden surcharge.
_Avoid_: implying an exact fee; a mandatory card charge framed as a card surcharge

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
A planning comparison between an approved monthly support goal and cadence-normalized recurring
support, with health and collection composition visible. It is neither received cash nor a dated forecast.
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
(slip/report), with a **nullable gift-grain link** from each gift to its group.
Phase 15 owns this operational artifact; Phase 20 owns the GL undeposited-funds
account and bank-statement tie-out.
_Avoid_: a flat `deposit_reference` string on the gift; Phase 15 claiming the
GL account or statement reconciliation

**Undeposited funds** (Phase 15):
The operational state of recorded offline money not yet assigned to a deposit
group — "in the drawer, not yet at the bank." The GL undeposited-funds account
is Phase 20's.
_Avoid_: conflating the operational undeposited set with the GL account

**Deposit-state (6th orthogonal axis)** (Phase 15):
The sixth orthogonal contribution axis (beside payment, ledger/posting,
receipt, accounting-export, review): `undeposited → deposited → cleared`. Its
own state machine (D6), NOT a chain of posting gates on the money.
_Avoid_: modeling deposited/cleared as posting preconditions; a single blended
status

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
The Stripe-rail settlement path: money arrives as a Stripe payout, reconciled
through the payout, not grouped into an offline bank deposit.
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
