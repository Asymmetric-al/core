# Phase 26 D1 — Email continuation adversarial review

**Founder ratification:** On 10 September 2026, the founder explicitly ratified
D1 with the changes and updates from this completed review, including R1-R15,
the reconciled owner contracts, proof obligations, and operational responses.
The review disposition below is retained as the review's historical conclusion;
its required amendments are now accepted grooming direction.

**Disposition: Accept with required amendments.** Keep the founder's choice of
email continuation. The amendments make “normal and effortless” precise; they do
not replace it with a portal, a registration flow, or a smaller incomplete inbox.

This is the completed review of D1, checked on 10 September 2026. It records a
grooming decision and its safeguards, not a PRD, formal specification,
implementation authorization, or production-readiness certificate. Findings
about existing source must be addressed before real inbox activation; they are
not evidence that email continuation is the wrong product choice.

## Corrected decision to record

> **D1 — Natural email continuation.** Phase 26 lets donors, missionaries, church
> representatives, and other legitimate requesters contact the tenant's support
> team and continue ordinary support in their existing email client. Creating an
> Asym account, signing in, visiting a portal, completing a CRM link, retaining a
> ticket number, or reading a knowledge article is not a prerequisite merely to
> ask for help or receive an ordinary reply. Existing qualified website and portal
> Help entry points remain available and preserve permitted context. Phase 26
> does not include a requester-facing My messages archive.
>
> Replies visibly identify the tenant and use an activated, monitored return
> route. The useful ordinary answer appears in the email itself. Unknown or
> ambiguous senders remain serviceable without invented CRM Parties. Receiving
> mail, matching an address, finding a thread, and linking a Party do not prove
> identity, representation, or permission to disclose or change protected data.
> When a request needs a protected document or consequential action, the owning
> Core domain provides the least-friction authorized completion path, preserving
> context and explaining any necessary verification. Such a path may support a
> guest; D1 adds no blanket sign-in requirement.
>
> Staff handle one canonical tenant-scoped support conversation with truthful
> authorship, explicitly reviewed recipients, structurally private notes,
> recoverable drafts, collision-protected replies, authorized CRM context, and
> visible delivery failures. Every accepted input has a durable disposition and
> recovery path. Support Hub remains one Asym feature; CRM, identity, giving,
> documents, communication delivery, and confidential care retain their owners.

The founder supplied the channel choice and the low-friction objective. The
authority, privacy, and delivery safeguards preserve the already supplied brief
and Core's governing boundaries. No new channel, broad financial permission,
automated reply policy, provider-switch framework, or care disclosure is ratified.

## Evidence and review method

The worktree and live `develop` remained at
`7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Three independent reviews examined
database/authorization, vendor UX/CRM practice, and Core contracts/delivery.
The supporting evidence document retains their exact source locations and
limitations. The initial baseline remains useful history; this review supersedes
its provisional Q1 recommendation.

Evidence labels used below:

- **Repository fact:** inspected current code, migrations, tests, or governing
  documents. It is not necessarily deployed behavior.
- **Executed probe:** a stated isolated local experiment, with its actual result.
- **Documented vendor behavior:** official documentation or a vendor's report of
  a repaired defect, not an independently exercised account.
- **Inference:** a failure follows under named conditions; incident frequency is
  not known.
- **Product judgment:** a recommended boundary or interaction, not a claimed
  statistically proven donor preference.

Four existing pure-helper suites passed **21 tests** using Vitest 4.1.4 with
environment-file loading disabled. An additional isolated execution of the
current serializer preserved Unicode text but also preserved a `javascript:`
link, inserted an inert HTML marker from a merge-variable value as markup, and
accepted an unuploaded `local:` attachment reference. No HTML was executed in a
browser. These are serializer counterexamples, not a claim of end-to-end XSS.
No real provider, production database, RLS session, email, DNS change, or live
customer journey was exercised. Passing these helper tests does not prove the
missing reply pipeline.

Severity is qualitative: **High** risks disclosure, lost/duplicate support work,
false authoritative history, or consequentially misleading outcomes; **Medium**
risks substantial friction, confusion, or maintenance cost. Likelihood describes
the triggering conditions, not invented production percentages. A hypothetical
privacy impact is not presented as an observed breach.

## Individual category review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes, in the unqualified wording; the underlying choice is valid.
Severity: Medium. Likelihood: high if “effortless” remains the only requirement.**
Email removes the portal/account step the founder explicitly rejected. The
strongest alternative, email plus an optional authenticated archive, helps people
find old requests and supports controlled content access, but adds a disclosure
surface. Phase 25 excludes that expansion; it does not prove donors dislike it.
An ordinary shared mailbox is a useful channel but does not establish the required
assignment, collision, CRM, and recovery outcomes. No mission-specific preference
study was available. [E1, V1, V2]

**Decision effect:** Accept A; define the experience rather than claiming universal
email preference. **Permanent prevention / exact addition:** R1 and R15 below.
Ordinary conversation has zero required Asym authentication steps, while all core
support guarantees remain required. Do not freeze a particular mail-token format,
status enum, numeric SLA, or editor implementation in this channel decision.

### 2. Brittleness

**Material concern: Yes. Severity: High. Likelihood: plausible with normal forwarding,
missing headers, route changes, or provider outages.** Current threading has a
same-sender/subject fallback and first-match header selection. From and Reply-To
can also point at different receiving paths; Intercom explicitly documents that
an unforwarded visible address can strand replies. Provider body/attachment
retrieval introduces further failure boundaries. A donor should not need to
understand these mechanisms or resend to repair them. [E2, E3, V3]

**Decision effect:** Preserve A; require a qualified return path and conservative
correlation. **Permanent prevention / exact addition:** R2, R3, R4. Qualify ordinary
Reply and new mail to the visible support address, preserve conflicting/unmatched
input, and resolve ambiguity without guessing identity or losing content.

### 3. Technical debt

**Material concern: Yes. Severity: High. Likelihood: high if current prototypes are
promoted unchanged.** Legacy `support_contacts` and `support_tickets` remain
separately persisted. New Support Hub has local merge-variable logic, a partial
macro runner, and historical docs that overstate or understate current behavior.
Both hardening plans already have substantial implementation; executing them as
untouched plans would duplicate work. A second CRM or sender pipeline would make
every future correction more expensive. [E2, E4]

**Decision effect:** A survives; the permanent path must consolidate ownership.
**Permanent prevention / exact addition:** R8, R13, R14. Use existing Core identity,
message preparation, dispatch, and owner commands. Retain legacy history with
verified mappings or explicit read-only provenance; do not keep competing writers.

### 4. Edge cases

**Material concern: Yes. Severity: High. Likelihood: realistic, with incidence
unmeasured.** Shared church addresses, spouses, representatives, forwarded mail,
changed addresses, and duplicate CRM records make address-equals-person invalid.
A fully retrieved attachment-only message is also different from a body that has
not been retrieved; current code conflates empty content with retrieval failure.
Neon CRM's duplicate-management guidance distinguishes merging from relationships
and households. These are useful test cases, not invented claims about Asym's
actual ministry volumes. [E3, E5, V4]

**Decision effect:** Preserve A and the unlinked-requester state. **Permanent
prevention / exact addition:** R3, R4, R8, R10. A valid empty-body/attachment-only
input remains visible and actionable under the content policy; an unhydrated
placeholder never masquerades as a complete message. Linking, merging, or changing
a reply endpoint never silently merges people or rewrites original correspondence.

### 5. Footguns

**Material concern: Yes. Severity: High. Likelihood: high when affected UI/API paths
are used or naively completed.** The API trusts `authorAgentId`; the UI can use
the conversation assignee for a signature while acting as someone else. Note and
reply share delivery fields. Attachment chips stage metadata without uploading.
The macro runner can continue after a failed step. HubSpot's documented beta
composer adds mentioned contacts to recipients; Zoho distinguishes CC removal
from portal-contact access removal. Those conveniences are dangerous to copy
without an explicit disclosure model. [E2, E5, E6, V5]

**Decision effect:** A survives; easy sending must not mean easy accidental
disclosure. **Permanent prevention / exact addition:** R5, R6, R7, R10, R13.
Separate note/reply commands, visible recipients and attachment readiness,
server-derived actor, and consequential macro effects. Unchanged ordinary replies
need no repetitive confirmation ritual; changed disclosure needs explicit review.

### 6. Tenant safety

**Material concern: Yes. Severity: High. Likelihood: conditional on malformed
references, privileged paths, or stale browser scope; no observed cross-tenant
leak.** Core already has useful tenant-composite Support-owned keys and server
tenant binding. Some cross-domain references only prove a global ID exists.
Support query keys omit tenant/actor while the browser QueryClient is reused;
the complete account-switch flow was not exercised. Unknown-tenant mail correctly
fails closed but needs separately authorized operational recovery. [E5, E7]

**Decision effect:** Preserve A. **Permanent prevention / exact addition:** R3,
R5, R8, R11. Enforce tenant equality across referenced owner records; scope cached
content and in-flight results to current actor/tenant/access context, clearing
private state on boundary changes. Never broadcast ambiguous mail to candidate
tenants. A sidebar, assignment, or token grants no extra access.

### 7. Database, RLS, and authorization safety

**Material concern: Yes. Severity: High. Likelihood: source-confirmed policy breadth;
exploitation depends on deployed exposure, not inspected here.** Current Support
migrations grant authenticated staff broad CRUD over messages, assignments, and
audit rows. Both `USING` and `WITH CHECK` exist and constrain tenant/staff state;
they do not enforce immutable authorship, note privacy, delivery transitions, or
append-only audit. Parent deletion can cascade through history. Some inbound/send
references are not tenant-composite, and the inbound-to-message index is not
unique. Later email-table migrations restore restrictive RLS/grants; reporting
the older disabled-RLS state as current would be wrong. [E5, T1]

**Decision effect:** Preserve A; close bypasses before activation. **Permanent
prevention / exact addition:** R5–R8 and R12. Authoritative message/privacy/delivery
and history mutations belong to canonical server commands, with database grants
that deny equivalent direct browser writes. Enforce valid old and resulting rows,
tenant-coherent relationships, uniqueness, note constraints, and safe deactivation.
The evidence appendix explicitly covers PK/FK, types, nulls, defaults, checks,
deletes, indexes, policies, grants, functions, storage, service-role paths and
migrations. D1 introduces no money precision or new monetary table.

### 8. Overengineering

**Material concern: Yes, as a scope-expansion risk; A itself reduces complexity.
Severity: Medium. Likelihood: plausible if the vendor research becomes a feature
checklist.** A generic customer master, CRM sync, portal, omnichannel suite,
knowledge platform, AI autoresponder, or new workflow builder is unnecessary to
deliver normal support email. Existing `support_automation_rules` and local
previews are not authority to ship a second Phase 34 engine. [E1, E4, V6]

**Decision effect:** Accept A and bound implementation. **Permanent prevention /
exact addition:** R13, R14. Use one Support conversation model and shared owner
capabilities. Vendor features require a demonstrated Asym outcome; D1 authorizes
none of the additional platforms above. Reliability constraints are necessary
infrastructure for the chosen promise, not an excuse for a universal framework.

### 9. UX/UI and user friction

**Material concern: Yes. Severity: Medium to High. Likelihood: verified source
paths undermine the desired experience; usability incidence remains unmeasured.**
The UI clears local drafts on conversation change, announces a queued write as
sent, can present a load failure as “not found,” has unuploaded attachment chips,
and uses several hardcoded colors outside Core's semantic token policy. The CRM
sidecar is largely a set of navigation links, not proof of preserved draft and
queue context. Positive foundations include shared Base UI controls, explicit
note/reply labels, busy-state attributes, a mobile sheet, and focus-return work.
No browser or screen-reader conformance claim is made. [E6, E7, T2]

**Decision effect:** Strengthen A with observable UX outcomes. **Permanent prevention /
exact addition:** R1, R2, R6, R9, R10, R11, R15. Ordinary email contains the answer
and works with images disabled; Help is discoverable; safe context is reused;
drafts/queue position survive permitted navigation; errors persist with a next
action; reply/note/recipients remain clear without color. Adopt exact base-maia /
Base UI / semantic tokens, keyboard-complete flows, reflow, focus, and accessible
status feedback. Do not introduce another visual system.

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes. Severity: High. Likelihood: high if support snapshots or
status become write authority.** A request to refund is not a refund; a resolved
conversation is not completed owner work; an email endpoint is not a Party;
provider acceptance is not a human reading. The current legacy contact table,
JSON contact references, local delivery fields, and queued response timestamps
make these distinctions particularly important. [E1, E2, E4, E5]

**Decision effect:** Preserve A. **Permanent prevention / exact addition:** R7,
R8, R9, R12, R14. One accepted source effect produces at most one canonical Support
message; each admitted recipient copy has one Phase 6 event, with no duplicate
capture at the Support hook and send seam. Owner facts are referenced
or permission-filtered projections, never support-maintained replacements.
Historical endpoints and actor evidence remain stable while links can be corrected
through audited owner-safe operations. Notes cannot enter external delivery states.

### 11. Support Hub–CRM integration and cross-surface continuity

**Material concern: Yes. Severity: High. Likelihood: plausible in daily support
work; no unauthorized action was exercised.** Requester, message participant,
authenticated user, Party, represented organization, support assignee, and CRM
record owner differ. HubSpot illustrates useful side-by-side CRM context, while
Zoho's two-product sync and primary-email overwrite solve a different problem.
Core already owns shared records and should not synchronize itself. [E1, E4,
E5, V6, V7]

**Decision effect:** Preserve A; CRM integration is required, not an optional
link afterthought. **Permanent prevention / exact addition:** R8 and R11. Support
reads the owner's authorized projection and initiates typed owner actions with
permitted context, then displays their authoritative outcome. Authorized CRM
screens can expose a support summary/link through the same policy-filtered
history; they do not gain an alternate Support write path. Neither domain depends
on the other for unrelated work. Link corrections and CRM merges re-evaluate
current context without changing the original sender or exposing prior histories.

### 12. Hidden coupling

**Material concern: Yes. Severity: High. Likelihood: high if implicit assumptions
are promoted into the permanent contract.** Current inbound code uses a global
Resend credential; governed Phase 17 requires exact connection/scope authority.
Phase 17 has stale Party-only prose alongside a later explicit Phase 6 no-Party
branch. A proposed conversation reply token also needs to fit the governed Reply-To
snapshot, not bypass it. Current query/session and assignment/signature coupling
create additional hidden state. [E3, E6, E7]

**Decision effect:** Preserve A; reconcile these contracts explicitly. **Permanent
prevention / exact addition:** R2, R5, R7, R8, R11. Qualify a narrow Support-owned
no-Party reply authority through Phase 17/6; never create a fake Party. Any routing
derivative is owner-prepared and frozen under the approved sender/return-route
contract. Support cannot accept arbitrary caller Reply-To or create parallel mail
settings. Treat current identity mappings as explicit typed contracts, not string
coincidences.

### 13. Failure modes

**Material concern: Yes. Severity: High. Likelihood: realistic whenever a database,
worker, provider, or browser response fails.** Separate message/attachment/counter
and move/audit writes can partially succeed. Recovery may find the message and
skip a missing counter update, or see a move already at destination and omit its
failed audit. The UI retains only the latest failed mutation in memory. Provider
timeouts may be ambiguous; attachment metadata is not custody. Kustomer's release
notes document repaired indefinite-sending and safety-race failures, demonstrating
the relevance of these scenarios without claiming current vendor defects. [E2,
E3, E5–E7, V8]

**Decision effect:** Preserve A; recovery is part of its definition. **Permanent
prevention / exact addition:** R3, R7, R9, R10, R12. Required local effects commit
atomically or have durable repair evidence. Retry reconciles original work first;
same destination or duplicate ID alone is not proof all required effects finished.
Uncertain dispatch never causes blind resend or a false failure/success claim.

### 14. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes. Severity: High. Likelihood: plausible during concurrent
replies, retries, late webhooks, and snooze races.** Fresh reads are not a lock.
Current source has no reviewed-version send condition, no unique resulting
inbound-message effect, snapshot counter updates, and incomplete snooze/wakeup
behavior. Queued append currently influences first-response evidence. [E2, E5, T1]

**Decision effect:** Preserve A; lifecycle vocabulary remains a separate decision,
but its invariants are mandatory now. **Permanent prevention / exact addition:**
R7, R9, R12. Separate work status, read state, assignment, timer, local send intent,
provider evidence, and owner action. Serialize the send decision with relevant
conversation changes and current recipient/access checks; preserve blocked drafts.
Late events cannot regress facts or reset original response evidence. Cancellation
after external acceptance cannot be described as recall. A later reply must be
visible for renewed action even when prior work was resolved.

### 15. Data integrity risks

**Material concern: Yes. Severity: High. Likelihood: high under the identified
partial-write/replay paths; production frequency unknown.** Duplicate intake effects,
lost increments, invalid linked records, changing preferred email from sender data,
and legacy/modern dual writes can produce contradictory history and reporting.
Sender/subject matching can merge independent requests, while CRM merging can
change current associations without validating historical disclosure. [E2, E4, E5]

**Decision effect:** Preserve A. **Permanent prevention / exact addition:** R4,
R7, R8, R12, R14. Durable uniqueness follows the business effect and exact owner
scope; all references remain tenant-coherent; sender observations never mutate CRM
truth automatically. Correct associations append evidence. Reconciliation repairs
missing derived data from authoritative records without repeating communication
or financial effects.

### 16. Security and privacy risks

**Material concern: Yes. Severity: High. Likelihood: source-proven weak boundaries,
with end-to-end exploitability untested.** The serializer probe confirmed raw HTML
variable insertion and unsafe link-scheme retention. Authenticated provider mail
can still contain hostile content. Forwarding and BCC can expose identifiers;
notes, quoted history, attachments, search snippets, caches, logs, and exports are
separate disclosure paths. Email copies already delivered cannot be recalled by
deleting the Support record. General email is not a confidential-care repository.
[E3, E5–E7, T3]

**Decision effect:** Accept A with explicit content and authority limits.
**Permanent prevention / exact addition:** R4–R8, R10–R13. Use the governed renderer's
context-aware escaping and allowed URLs, sanitized full-message display, remote
resource controls, and bounded MIME/file processing. Protected owner material
uses its existing secure access flow. Minimize bodies, tokens, and sensitive
context in diagnostic/notification surfaces. No AI send or broad retrieval authority
is implied. Retention/disposal is owner-qualified, with redaction/hold evidence;
ordinary staff cannot erase the audit trail.

### 17. Scalability and performance risks

**Material concern: Yes. Severity: High for hidden work; Medium for latency.
Likelihood: deterministic above the current cap, conditional for provider saturation.**
Search/label filtering after 2,000 conversations can hide a real waiting request.
Current inbound job throttling is measured in jobs, while Resend budgets API
requests across a team; normal jobs make multiple calls. Source inspection and
provider documentation do not establish a production workload envelope. [E2, E3]

**Decision effect:** Preserve A. **Permanent prevention / exact addition:** R3,
R7, R11, R15. Apply authorization and filters before counts/page limits, use bounded
stable pagination, and make results complete across pages. Prove fixtures with
2,001+ records and matches beyond the old cap. Budget provider calls by actual
connection/team request allowance, honor backoff, and prevent a noisy tenant from
starving others. Publish the measured supported workload and page/provider bounds
before activation; do not market an unmeasured latency or scale guarantee.

### 18. Operational burden

**Material concern: Yes. Severity: High. Likelihood: likely if routine exceptions
require SQL repair or developer knowledge.** Existing recovery work is valuable,
but routing ambiguity, exhausted content retrieval, expired provider access,
missing attachments, departing assignees, and disabled routes need product-owned
resolution. A donor repeatedly resending an email is not an acceptable recovery
strategy. [E3, E5, V3]

**Decision effect:** Preserve A. **Permanent prevention / exact addition:** R2,
R3, R9, R10, R12. Authorized staff can see and safely retry/release/correct relevant
work through scoped commands. Separately authorized platform operators handle
unknown-tenant input. The tenant administrator names a monitoring owner as an
operational responsibility, not a new all-powerful role. Inbox setup and health
must be understandable without exposing provider secrets or manual database steps.

### 19. Observability and auditability gaps

**Material concern: Yes. Severity: High. Likelihood: source-confirmed gaps under
partial failure and crafted author input.** Mutable audit rows, actor spoofing,
optimistic sent labels, in-memory error state, and provider-only attachment status
can make staff believe work is complete when it is not. Technical traces alone
cannot establish who changed an association or whether a reply was authorized.
[E2, E3, E5–E7]

**Decision effect:** Preserve A. **Permanent prevention / exact addition:** R5,
R7, R9, R12. Keep distinct technical diagnostics, security access audit, and durable
business history, joined by safe identifiers. Record actor, target, cause, prior
and resulting state, and stable effect identity without unnecessary content.
Detect accepted inputs without dispositions, missing required audit, duplicate
effects, and unresolved provider evidence. The monitoring table below supplies
named signals, thresholds, owners, and responses; no missing safeguard is merely
monitored.

### 20. Dependency and integration risks

**Material concern: Yes. Severity: High. Likelihood: present where planned contracts
are not yet implemented or provider assumptions differ.** Phase 6 capture/hooks
#554/#559 remain open. Phase 23 #1385 awaits the Support intake contract. Phase
17/6 must admit the exact Support reply and no-Party authority. Provider webhook
acceptance, retrieval, retention, rate limits, and expiry differ; an inbound vendor
choice does not reopen outbound-provider ownership. [E1, E3, V9]

**Decision effect:** Preserve A. **Permanent prevention / exact addition:** R2,
R3, R7, R8, R10, R13. Deliver narrow producer/consumer contracts in dependency order;
qualify Resend first; reconcile disagreements through scoped evidence, not address
guessing or a second integration. Existing shared CRM records require direct owner
services/projections, not vendor-style two-way synchronization. No entire future
phase is a prerequisite where a bounded owner contract can suffice.

### 21. Migration, rollout, and upgrade risks

**Material concern: Yes. Severity: High. Likelihood: high if real mail opens before
constraints and recovery are qualified.** Tightening grants, note shapes,
relationship constraints, uniqueness, and history semantics can conflict with old
writers and historical duplicates. Replaying mail to backfill could send old
replies. Destructive rollback after new correspondence exists can erase custody.
Actual legacy volume and deployed state were not queried. [E4, E5]

**Decision effect:** Preserve A. **Permanent prevention / exact addition:** R12,
R14, R15. Inventory actual records; expand compatible schema; backfill with
provenance and no business effects; reconcile duplicates; validate constraints;
fence/disable old writers; then activate narrowly. Mixed-version tests must prove
old clients cannot bypass new actor/privacy/delivery rules. Roll forward or stop
dispatch while preserving accepted intake/history; rollback never revives competing
writers or deletes newly accepted mail.

### 22. Testability, traceability, and proof

**Material concern: Yes. Severity: High. Likelihood: demonstrated gap between helper
test success and product guarantees.** Twenty-one existing helper tests pass while
the serializer counterexamples and incomplete delivery path remain. Existing
Support smoke tests cover navigation and permit a missing conversation. Neither
proves PostgreSQL authorization, real transactional races, delivery, or effortless
staff-to-CRM journeys. [E2, E5, E6]

**Decision effect:** Record D1, but do not declare implementation/phase ready.
**Permanent prevention / exact addition:** R15 and the proof matrix below. Every
accepted clause traces to D1, glossary/ADR, later authorized OpenSpec/design and
tickets, implementation, and release evidence. No tickets or formal specification
are created during this review. Tests exercise public owner seams and user outcomes,
including real PostgreSQL constraints/roles, fault injection, provider contracts,
cross-surface negative cases, keyboard/mobile use, and actual intended-user tasks.

### 23. Other development hazards

**Material concern: No additional independent concern after the above mapping.**
The review also checked feature-boundary creep, branding versus mailbox ownership,
confused identity naming, unmeasured “best UX” claims, framework/preset churn,
secret handling, irreversible mail effects, and unjustified changes to unrelated
domains. Those risks are explicitly covered by R1–R15 and categories 5–22.
A preliminary hypothesis that normal `userId`/`profileId` values would break every
audit was rejected after checking the schema and signup invariant; it must not
appear as a confirmed defect. No new runtime library or source implementation
change is justified merely to record D1. [E5, E6]

**Decision effect:** No additional amendment. Maintain the stated boundaries and
validate the resulting documentation for consistency; do not invent another
finding to make the review sound harsher.

## Exact required safeguards carried by D1

These are the decision's required constraints and the language to carry into a
later authorized specification. They are not a new formal specification in this
grooming stage. Concrete provider adapters, status taxonomy, fine-grained inbox
permissions, retention schedules, and automatic-acknowledgment policy remain
separate Phase 26 decisions; D1 must not secretly settle them.

**R1 — Ordinary conversation.** “A legitimate requester can ask for ordinary help
and read and reply to the tenant's ordinary answer using email, without creating
an Asym account, signing in, completing a CRM link, entering a ticket number, or
passing through mandatory self-service. Required qualified Help entry points retain
permitted context. No requester My messages archive is included in Phase 26.”

**R2 — Tenant identity and working reply route.** “An ordinary reply clearly
identifies the tenant and carries a verified, activated, monitored return route
prepared under the Phase 17/6 sender contract. The answer is readable in the email.
Ordinary Reply and a new message to the visible support address reach recoverable
intake. Website domain, outgoing sender authentication, receiving mail routing,
and monitoring responsibility are distinct. Existing root MX records are not
replaced as a setup shortcut.”

**R3 — Accepted-input responsibility.** “Every accepted input has a durable source
identity and exactly one recoverable disposition. An acknowledgment means the
accepting owner can recover the promised work, not that downstream work is complete.
Unknown or ambiguous tenant ownership fails closed with separately authorized
platform recovery; it is never guessed or exposed to candidate tenants. A fetched
empty body differs from retrieval failure. Legitimate attachment-only inputs remain
visible/actionable under policy; unhydrated placeholders are not complete messages.”

**R4 — Correlation without authority.** “Thread references and opaque route tokens
correlate mail within trusted tenant scope; they never authenticate a person, grant
CRM/financial authority, add external recipients, or authorize prior-history
disclosure. Conflicting references or destinations do not select an arbitrary
first match. Sender plus subject alone does not merge independent requests.
Unmatched mail remains serviceable through safe staff resolution.”

**R5 — Actor and authorization.** “The server derives tenant and acting active staff
identity from authenticated context and records it immutably. Caller input cannot
select author or audit identity; an unresolved actor does not become System.
Assignee and approved presentation signature remain separate from actor. Every
read, link, mutation, retry, download, export and send re-proves its owner's current
authority. Database grants/policies cannot bypass those commands or transform a
permitted row into forbidden authorship, privacy, provider state, or tenant scope.”

**R6 — Private collaboration and recipients.** “Internal notes and system-only
events cannot enter the public-reply pipeline or appear in requester-visible
email, history or exports, including through direct data access, workers or
macros. Authorized internal display/export remains subject to note-access and
audit policy. External delivery accepts an
explicit public-reply command with its reviewed content and exact recipients,
never a mixed timeline. Linking CRM records, assigning staff, mentions and macro
expansion do not silently add recipients. Note/reply mode, sender, To/CC and
attachments are visible and accessible before send.”

**R7 — One durable send decision.** “Creating a send intent is atomic with current
authorization, exact content/recipient approval, a reviewed conversation version,
permanent semantic deduplication, and required local history/dispatch evidence.
Relevant unseen updates block stale sending and preserve the draft for explicit
review. Replays under the same durable send-intent identity return the existing
effect; conflicting immutable input under that identity is rejected. A new
deliberate reply receives a new intent identity. Phase 17 prepares the bounded human-authored reply and Phase 6
dispatches/records each admitted recipient copy once, without duplicate hook/seam
capture. A human reply is not forced into a fixed system-message template merely
to reuse preparation. Ambiguous external outcomes reconcile before retry; no recall or
exactly-once external delivery is promised.”

**R8 — CRM and protected owner actions.** “Support retains observed sender endpoints
and explicit authorized links to Core Parties/records, including an unlinked or
ambiguous state. No automatic Party creation, preferred-email overwrite, duplicate
CRM store, or Support↔CRM sync is permitted. The qualified no-Party reply-authority
branch supports ordinary unlinked correspondence. Protected disclosures and
consequential actions use the owner's least-friction qualified flow with permitted
context and an explanation of any verification. Support resolution never proves
that owner action completed.”

**R9 — Honest work and delivery state.** “Conversation lifecycle, assignment, read
state, timers, drafts, send intent, provider acceptance, delivery evidence, and
domain-action completion are separate facts. Pending is not Sent; provider
acceptance is not Read. Failed or uncertain delivery remains visible and actionable.
Incoming replies create visible owed work under the chosen lifecycle. An automatic
acknowledgment, saved draft or failed reply cannot silently count as a substantive
human answer. Advertised response commitments require their real staffed policy.”

**R10 — Content and attachment custody.** “Use owner-governed content rendering,
context-aware variable escaping, permitted link schemes, safe message display and
bounded untrusted MIME/file processing. Attachments have independent truthful
readiness/failure states. Available means an authorized, policy-compliant retrieval
path exists; a count, `local:` reference, or expired provider URL is insufficient.
Preserve text on attachment failure. Never make private material public to bypass
a channel limit. Protected owner artifacts retain their existing access contract.”

**R11 — Coherent context and interface.** “Support Hub and authorized CRM surfaces
use the same owner-filtered facts and history. Staff can inspect permitted context,
initiate an owner action, and return to their conversation, draft and queue position
without unnecessary re-entry. Draft and cached content are scoped to current actor,
tenant and permitted conversation; boundary changes clear or deny old private
state. Search authorization and filtering precede counts and page limits. Use
Core's exact shared base-maia/Base UI design system, accessible status/error
feedback, keyboard operation, responsive reflow and supported locale behavior.”

**R12 — History, recovery and records.** “Authoritative support state, required audit
and related local effects commit atomically or leave durable repair evidence for
every missing effect. Single/bulk/retry entry points enforce the same invariants.
Recovery proves completion of required evidence, not just existence of a row.
Business and security history are distinct from diagnostic logs. Ordinary staff
cannot edit/delete audit history; governed redaction, holds and disposal preserve
necessary evidence without retaining sensitive bodies forever. Already delivered
external copies cannot be recalled.”

**R13 — Shared capabilities and bounded scope.** “Support owns support work only.
Use Phase 23 form occurrences, Phase 17 preparation, Phase 6 dispatch/history,
Core identity/CRM/authorization, and qualified document/records boundaries.
Phase 34 remains the configurable rules owner. D1 adds no generic CRM, workflow,
knowledge, reporting, AI, or omnichannel platform. Safety, classification and
current recipient authority precede any automatic send; this decision grants
no new auto-acknowledgment or autonomous-reply authority.”

**R14 — Single-writer migration and safe activation.** “Inventory actual legacy
records and preserve their identities/history with verified mappings or explicit
read-only provenance. Backfill never sends old messages or repeats business
effects. Expand, reconcile, validate and fence old writers before new real inbox
activation. Mixed versions cannot bypass new controls. Kill switches pause
unstarted sending while preserving accepted intake, evidence and reconciliation;
rollback does not delete new mail or revive competing writers.”

**R15 — Falsifiable readiness.** “Before activation, prove ordinary account-free
email contact/reply, scoped CRM continuity, authorization negatives, notes and
recipient safety, concurrent/replayed commands, body/attachment recovery, provider
ambiguity, migration and accessible mobile/keyboard journeys against actual owner
seams. Record supported workload and provider/client capability limits from
measurements. Any safety-critical recipient/mode confusion, lost accepted input,
duplicate logical effect, forbidden disclosure or missing required audit blocks
activation. Helper tests, screenshots and vendor documentation alone do not
constitute this evidence.”

## Ruthless synthesis: the permanent path and order

1. **Record D1 now with the corrected language.** The founder's intent is clear;
   the required amendments preserve it and existing authority. Resolve the
   Party-only/no-Party contradiction in the decision notes using the later explicit
   no-Party owner contract. Clarify that fetched-empty and not-yet-fetched content
   differ. Neither requires a portal or a new CRM identity.
2. **Establish owner and invariant boundaries before polishing send.** Bind the
   actor server-side; close direct-write bypasses; qualify cross-domain tenant
   references; separate private notes from deliverable content; establish one
   Support intake/reply effect and required audit. Otherwise UI improvements merely
   make unsafe actions easier to perform.
3. **Complete the owner-qualified email path.** Deliver the narrow Support reply
   and intake contracts into Phase 17/6 and Phase 23, with connection-scoped trust,
   deterministic correlation, durable dispatch, and recoverable body/attachment
   custody. Qualify Resend first. Complete the unknown-tenant recovery path without
   giving tenant staff inappropriate visibility. Reconcile provider uncertainty
   before permitting a resend.
4. **Build the calm staff and requester journeys over that path.** The donor uses
   normal email. Staff see one conversation, a clear answer/note distinction,
   reviewed recipients, safe CRM context, recoverable drafts, and a useful next
   action. Do not add redundant confirmations to unchanged ordinary replies.
   Required protected actions open the exact existing owner flow and return to
   the same work. Finish lifecycle, team permissions, auto-acknowledgment and
   retention as their own decisions before their dependent implementation;
   D1 does not arbitrarily choose those policies.
5. **Migrate and prove before opening real inboxes.** Verify legacy data, constrain
   mixed writers, run real PostgreSQL and provider-contract/fault tests, and
   complete staff/requester usability and accessibility proof. Exercise narrow
   activation and sending pause without discarding incoming evidence. No real
   activation is authorized by this review.

This order is dependency-driven, not a proposal to delay safeguards. The channel
decision is complete. Broader Phase 26 policy decisions remain visible in the
coverage log; they are neither hidden “engineering details” nor preconditions to
understanding what the founder chose here.

## Proof matrix

| Proof obligation                 | Required outcome                                                                                                                                        | Status in this review                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Guest ordinary contact and reply | Useful tenant answer in email; normal Reply continues; no Asym authentication or forced self-service                                                    | Required journey, not run                                                    |
| Qualified Help and CRM handoff   | Permitted source context reused; owner action enforced; return restores draft/queue; no duplicate authoritative fact                                    | Required journey, not run                                                    |
| PostgreSQL 17 roles/grants/RLS   | Anon/donor/missionary/staff/admin/disabled/multi-tenant cases; both mutation predicates; direct-write, FK, delete and privacy negatives                 | Static effective migration review completed; real database execution not run |
| Actor and signature              | Forged author rejected/normalized to real actor; assignee changes do not impersonate staff; missing actor is a recoverable error                        | Source flaw confirmed; route regression required                             |
| Collision and dedupe             | Two staff, multiple tabs, double-click, lost response, concurrent donor reply, revocation, retry and replay yield one permitted effect                  | Source gaps found; database/provider proof required                          |
| Fault recovery                   | Failure between every local write; move/audit partial result; replay repairs missing effects without duplication                                        | Source gaps found; fault injection required                                  |
| Thread identity                  | Shared addresses, forwards, changed subject/address, contradictory headers, copied tokens and inbox moves remain isolated and recoverable               | Source fallback found; provider/threading matrix required                    |
| MIME and attachments             | Plain text/HTML/Unicode; empty retrieved body versus missing retrieval; inline/missing/expired/oversized/rejected files; no public fallback             | Serializer probe executed; full custody/security flow not run                |
| HTML and variables               | Text/HTML/link context remains safe after substitution; owner renderer rejects unsupported URLs/content                                                 | Counterexamples confirmed in local helper; no exploit execution              |
| Delivery and loops               | Verified webhook, duplicates, out-of-order events, bounce, complaint, automation/own-address loops, ambiguous send and endpoint outage                  | Required provider-contract suite, not run                                    |
| Search and cache                 | More than 2,000 records, matching old rows, correct authorized counts/pages, account/tenant change and in-flight results                                | Source risk confirmed; end-to-end proof required                             |
| Records and migration            | Mapping/coverage totals, no historical sends, redaction/hold, mixed-version compatibility, safe dispatch pause/rollback                                 | Required inventory and fixtures, not run                                     |
| UI and accessibility             | Keyboard/focus, non-color mode/recipient feedback, error recovery, 320 CSS-pixel reflow where applicable, zoom, real mail clients, mobile/low-bandwidth | Source review and standards read; no browser conformance claim               |
| Pure helper baseline             | Existing serializer, merge-variable, timeline and business-hours suites                                                                                 | 4 files, 21 tests passed in isolated test configuration                      |
| Human usability                  | Intended users perform ordinary contact/reply and safe CRM handoff; any safety-critical disclosure/mode confusion blocks activation                     | Required evidence; no recruited users in this session                        |

The task-observation requirement evaluates this product with intended users;
it does not justify claiming measured satisfaction gains now. Gmail, Outlook,
Apple Mail and representative mobile/plain-text clients are a proposed qualification
matrix, not a claim all combinations have already passed.

## Residual monitoring after safeguards pass

No known missing safety or integrity control is accepted as monitor-only.
These are operational signals after implementation and qualification, not new
product roles or a full observability platform.

| Signal                                                                                        | Threshold                         | Accountable owner                                                                   | Required response                                                                                                                  |
| --------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Accepted input without durable disposition; duplicate logical effect; missing required audit  | Any one verified occurrence       | Platform operations and owning Support engineer                                     | Preserve evidence, stop affected unsafe transition, reconcile and repair; block further activation until corrected                 |
| Current delivery is failed or indeterminate                                                   | Any unresolved item               | Tenant administrator's named support owner; platform operations for provider faults | Keep visible work, reconcile original attempt before retry, choose an already authorized recovery path; no false completed outcome |
| Activated return route or connection validation fails                                         | Any failed validation/drift check | Named tenant inbox administrator with platform operations                           | Pause new use of the unsafe route, preserve accepted inbound/reconciliation, repair and requalify                                  |
| Item misses its actual promised response/follow-up deadline                                   | Any breached stored deadline      | Named support owner/team                                                            | Surface overdue work and reassign/escalate under policy; D1 invents no universal SLA number                                        |
| Provider reports throttling or retry exhaustion                                               | Any 429 or exhausted attempt      | Platform operations / communication owner                                           | Honor provider backoff and exact team/connection budget; prevent starvation; route exhausted work to durable recovery              |
| Avoidable login/re-entry demand or wrong-tenant/sender/mode confusion in the required journey | Any verified occurrence           | Product/UX owner; security owner for disclosure                                     | Fix and retest the affected journey; safety-critical occurrences block activation                                                  |

Cadence and numeric time/volume promises must derive from the qualified provider
and chosen staffed-service contract. Until measured and implemented, the product
must not advertise them. D1's thresholds above are event/deadline based and fully
specified without pretending a universal response-time policy has been settled.

## Sources and traceability

The accompanying `phase26-d1-evidence.md` contains complete independent evidence
notes, source links, edition/date caveats, detailed database findings and coverage,
and the local UX/probe record. The following anchors support this synthesis:

- **E1 — Core authority:** ADR-0001; `openspec/specs/platform-principles/spec.md`;
  platform boundaries/surfaces; Phase 6/17, Phase 23 ADR-0170, Phase 25 exact
  published head. [Phase 25 scope](https://github.com/Asymmetric-al/core/blob/0624ca3841ea98e618fed0e2c490d24c0ef1d9c1/docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth.md#L299)
- **E2 — Current Support path:** `packages/api/src/admin/support-hub/adapter/supabase.ts:588,632,671,904,941,1293,1371`;
  `schemas.ts:80`. [Pinned adapter](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts)
- **E3 — Inbound/contracts:** `packages/api/src/workflows/adapters/inbound-email.ts:169,227,314,434`;
  `packages/api/src/email/webhooks/resend.ts:673`; later Phase 6 no-Party amendment;
  `docs/adr/0037-scanner-safe-exact-artifact-access.md` (use full filename; another
  ADR also has number 0037). [Pinned inbound adapter](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/workflows/adapters/inbound-email.ts)
- **E4 — Legacy and ownership:** `packages/api/src/admin/support/service.ts:130,146,214`;
  `supabase/migrations/20260501001500_support_hub_foundation.sql:3,20`;
  `docs/prds/sitestacker-parity/roadmap.md:2895`; plans 002/003 compared with source.
- **E5 — Database/authorization:** `supabase/migrations/20260515025814_support_hub_core_modules.sql:228,286,317,476,524`;
  `20260611183000_support_inbound_routes.sql:38,45`;
  `20260426100000_resend_email_rls_grants.sql:10`;
  reply/note route `:12`; `support-hub/move-service.ts:177,210,359`.
  [Pinned foundation](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql)
- **E6 — UI/serializer/probe:** `apps/admin/features/support-hub/components/detail/composer/use-conversation-composer.ts:83,107,199`;
  `ConversationDetail.tsx:116,124`; `AttachmentChips.tsx:31`;
  `serialize-payload.ts:65,84,219`; `lib/merge-variables.ts:44`;
  isolated current-source probe and 21-test result retained in evidence.
- **E7 — State/context:** `packages/database/query-keys.ts:47`;
  `packages/database/providers/query-client.ts:97`;
  `apps/admin/features/support-hub/hooks/use-support-failure-recovery.tsx:44`;
  `ConversationCrmLinks.tsx:67`;
  `packages/ui/AGENTS.md`, `components.json`, frontend/accessibility rules.
- **V1:** [Zendesk: anyone may submit tickets](https://support.zendesk.com/hc/en-us/articles/4408881989018-Enabling-anyone-to-submit-tickets), edited July 2026; email differs from anonymous web-form verification.
- **V2:** [Help Scout Customer Portal](https://docs.helpscout.com/article/1777-set-up-and-manage-customer-portal), updated September 2026; explicit archive access and notification controls.
- **V3:** [Intercom email threading](https://www.intercom.com/help/en/articles/7996715-email-threading), February 2026; [reply addresses](https://www.intercom.com/help/en/articles/6288581-send-replies-from-the-address-inbound-emails-are-sent-to), July 2026; [Freshdesk email overview](https://support.freshdesk.com/support/solutions/articles/50000009268-overview-of-email-channel), edition distinctions in evidence.
- **V4:** [Neon CRM duplicate review](https://support.neonone.com/hc/en-us/articles/31957853946253-Check-for-Duplicate-Accounts-from-an-Account-Page), 2025 documentation; [Salesforce email matching](https://help.salesforce.com/s/articleView?id=000006526&language=en_US&type=1).
- **V5:** [HubSpot beta reply editor](https://knowledge.hubspot.com/help-desk/use-the-updated-reply-editor-in-help-desk), August 2026, Professional/Enterprise beta; [Zoho conversation actions](https://help.zoho.com/portal/en/kb/desk/ticket-management/actions-in-tickets/articles/actions-in-ticket-conversation).
- **V6:** [Zoho Desk/CRM integration](https://help.zoho.com/portal/en/kb/desk/integrations-and-marketplace/sales-and-marketing/articles/integrating-zoho-desk-with-zoho-crm); [HubSpot channel intake](https://knowledge.hubspot.com/help-desk/connect-channels-to-help-desk); [Kustomer access](https://help.kustomer.com/user-access-within-kustomer-rJ6oS_Bpr).
- **V7:** [HubSpot help-desk workflow](https://knowledge.hubspot.com/help-desk/create-respond-to-tickets-in-help-desk), Professional/Enterprise; [asset/record access limitations](https://knowledge.hubspot.com/account-security/limit-access-to-your-hubspot-assets).
- **V8:** [Help Scout collision detection](https://docs.helpscout.com/article/99-prevent-duplicate-replies-with-collision-detection); [bounce handling](https://docs.helpscout.com/article/1442-troubleshooting-conversations-in-needs-attention-and-bounces); [Kustomer 2026 repaired defects](https://help.kustomer.com/en_us/categories/2026-release-notes-BygKsnW9g).
- **V9:** [Resend received content](https://resend.com/docs/dashboard/receiving/get-email-content), [attachments](https://resend.com/docs/dashboard/receiving/attachments), [webhook retries](https://resend.com/docs/webhooks/retries-and-replays), [API limits](https://resend.com/docs/api-reference/introduction#rate-limit).
- **T1:** [PostgreSQL 17 RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html), [constraints](https://www.postgresql.org/docs/17/ddl-constraints.html), [locking](https://www.postgresql.org/docs/17/explicit-locking.html); [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
- **T2:** W3C WCAG 2.2 Understanding: [redundant entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html), [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html); Core shared UI rules govern styling.
- **T3:** [RFC 5322](https://www.rfc-editor.org/rfc/rfc5322.html#section-3.6.4), [RFC 3834](https://www.rfc-editor.org/rfc/rfc3834.html), [OWASP uploads](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [OWASP XSS](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).
- **Human-research limit:** [NN/g's 2016 diary research](https://www.nngroup.com/articles/customer-service-omnichannel-ux/) supports avoiding unnecessary channel changes and difficult-to-find help; its 45 journeys are not a 2026 nonprofit channel-preference sample. The founder's intent, not a fabricated satisfaction uplift, supports D1.

No representative study of Asym's donors/missionaries, production workload,
provider-account configuration, or live usability was available. These are
explicit evidence boundaries and activation obligations, not hidden approvals
or reasons to reopen the founder's ordinary-email decision.
