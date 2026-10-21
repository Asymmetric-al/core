# D15 — optional connected-account personal email

**Disposition: Accept with required amendments.** The founder selected **A —
Optional connected-account sending** and requested deep research, a complete
adversarial review and excellent simple UX. Review date: October 16, 2026 UTC.
Repository baseline: `9cada8f3d8ab59db391d3fd20df77fcadeb09813`.

On October 16, 2026 UTC the founder instructed: “Ratify this decision and
amendment.” The corrected D15 decision and required amendments below, including
C01–C20, the bounded initial profile and P01–P22 as future acceptance obligations,
are **explicitly ratified**. This includes the stated content-retention tradeoff
and numerical profile limits. Provider candidates remain qualification direction,
not a selected provider inventory or proof of working integrations.

This research-only Grill record changes no formal ADR/OpenSpec/owner contract;
publication awaits `/to-prd`, tickets await `/to-issues`. Earlier decisions retain
their separate statuses; ratification establishes intended behavior, not runtime
or release qualification.

## Exact corrected decision to record

> Allow a missionary, when currently permitted by the organization, to connect
> a supported personal sending account, privately draft an individual email in
> Asym, and deliberately send it to an eligible contact in their permitted
> workspace. Saving or connecting sends nothing. One Send authorizes the exact
> reviewed sender, recipient and message. Eligible restricted prospects need not
> first be shared with organization staff.
>
> Show the actual connected sending account and recipient address clearly.
> Replies arrive in the external mailbox; readable sent copies are available there
> only where the provider retained them. Asym keeps the qualified sending outcome
> without requiring duplicate manual entry.
> Provider acceptance is not delivery, reading, a reply or a completed personal
> exchange. If the provider outcome is unknown, say so and prevent unsafe resend.
>
> Reuse Core's existing communication, contact, permission and integration owners
> through an explicit bounded personal-email extension. Preserve current purpose,
> contact restrictions, tenant boundaries, private content and body-free history.
> Sharing a contact never shares its private email content or earlier history.
>
> Start with a small own-primary-mailbox sending profile, native drafts, one
> selected recipient, simple formatting, safe links and an optional visible
> signature. Request only the qualified sending and identity permissions. This
> does not add inbox import, reply synchronization, bulk sending, newsletters,
> tracking, shared mailboxes or automatic outreach. Native newsletter capability
> remains independently required by D7.
>
> Stopping email sending immediately fences new Asym sends. Removing provider
> permissions is a distinct operation whose calendar and other shared-grant
> consequences must be explained. Neither can recall an already admitted send or
> erase copies in external mailboxes. Reconnecting never silently sends old work.

The direction solves the stated application-switching and duplicate-entry
problem. The amendments make the outcome truthful and maintainable; they do not
replace A with a mailto-only workaround or pretend to provide a full email client.

## Evidence, current behavior and the permanent path

**Evidence types.** Repository facts describe inspected source/contracts at the
baseline. Primary facts describe current published provider/standards documents,
not an authenticated production experiment. Risks, profile limits and UI choices
are engineering/product judgments. Unknown deployment behavior and user feedback
remain explicit release proof obligations, not assumed successes.

| Evidence                                                                                                                      | What was established                                                                                                                                                                                                                                                                                  | Consequence                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Owner boundaries](d15-evidence/owner-boundaries.md), O01–O14                                                                 | P6 has one shared `sendEmail` writer and body-free history. P17/ADR-0029 currently restrict the executable transport to tenant Resend; personal human mail is outside the system-message catalog.                                                                                                     | A needs a narrow source/content/transport amendment. P31 alone cannot authorize a second sender or arbitrary uncataloged email. Preserve Resend for its existing purposes.                                     |
| [Current source and UX](d15-evidence/current-source-and-ux.md)                                                                | Missionary Email is mailto plus separate manual logging; Email Studio is Coming Soon. Support Hub announces “Reply sent” after an inspected queued-row insert. Attachment chips stage metadata without bytes. Admin test-send is tenant Resend with fresh request IDs and conditional consent checks. | These are bounded source findings, not proof of a deployed exploit. Reuse sound shared UI components; do not treat current queue feedback, test-send or attachment stubs as a qualified personal-mail feature. |
| [Provider contracts](d15-evidence/provider-email.md), E01–E16                                                                 | Gmail send-only and Graph delegated Mail.Send can submit mail. Identity needs separate qualified evidence. Neither inspected send API documents a deduplication key equivalent to the current Resend contract. Graph 202 and Gmail success do not prove delivery.                                     | Native draft plus direct send is the smallest complete path. Unknown is a supported outcome; no blind replay. Broad mailbox readback is not a prerequisite or an invisible recovery permission.                |
| Same provider evidence, E16                                                                                                   | Google revocation can invalidate all scopes/clients for the user's project grant. Microsoft scope requests do not themselves remove existing consent; selective grant administration requires broader authority.                                                                                      | Separate local Stop email sending from provider Remove access. Track actual grant relationships; do not add directory-admin permissions or assume two client IDs isolate revocation.                           |
| [Product/privacy reconciliation](d15-evidence/product-and-privacy.md)                                                         | D1 permits a qualified restricted source; D2 sharing does not publish private notes/history. ADR-0209/0212 distinguish external egress from screen visibility. P27 distinguishes outreach from actual exchange.                                                                                       | No compulsory staff sharing, address-based identity merge, arbitrary merge-field export or automatic conversation/coach/task completion.                                                                       |
| [Database/lifecycle analysis](d15-evidence/database-lifecycle.md) and [technical sources](d15-evidence/technical-research.md) | RLS, grants, column mutation, current authority, privileged paths and immutable effect identity require separate checks. OAuth, message syntax and accessibility have concrete standards.                                                                                                             | Apply one authoritative command boundary and current source admission; a hidden button or row-level tenant predicate alone is insufficient.                                                                    |
| [28-case local protocol probe](d15-evidence/probe-results.json)                                                               | A deterministic model demonstrates both duplicate-send counterexamples and the intended conservative boundaries, including restore and both race orderings.                                                                                                                                           | Useful falsification of design assumptions only. It does not prove PostgreSQL, RLS, real concurrency, crash durability, OAuth, provider behavior, UI or scale.                                                 |

**Strongest alternatives.**

| Alternative                                     | Benefit                                                                               | Decision                                                                                                                                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Email-app handoff and deliberate manual logging | Least infrastructure and full existing mailbox features.                              | Preserve as an independently permitted native/manual option. Alone it does not fulfill selected A or remove duplicate entry. Never offer it as a way around a blocked recipient or an uncertain send. |
| Send everything through tenant Resend           | Reuses today's provider and its qualified replay behavior.                            | Wrong identity/product meaning for “my connected account”; no silent substitution. Remains appropriate for its governed existing jobs.                                                                |
| Provider drafts plus mailbox readback           | More correlation and richer external editing are possible.                            | Requires broader permissions and additional external mutations/edit races; missing Sent/draft data still does not prove non-send. Not needed for the initial job.                                     |
| Full synchronized inbox or integration vendor   | More complete in-app mailbox features.                                                | Adds privacy, dependency and operational scope not selected here. Native direct sending is useful without it.                                                                                         |
| Native draft plus own-account direct send       | Meets the selected daily-work job with narrow permissions and one intentional action. | Chosen permanent initial path, with explicit unknown outcomes and bounded content custody.                                                                                                            |

**Content-retention alternative considered.** An author-only readable sent/recovery
archive would preserve useful text after an uncertain result. It is a real UX
advantage, not an invalid security pattern in every product. Here it would require
an additional explicit readable-copy purpose, audience and retention amendment
to the current P6/P17/ADR-0031 boundary for unrestricted authored prose. The
selected initial job requires composition and truthful outcomes, not an archive.
Keep `no_readable_copy` for this profile, disclose the loss-of-copy consequence
below, and test comprehension/usefulness. Do not quietly preserve a sent archive
under the name draft or claim that a provider always has the missing copy.

No interviews or quantitative Asym user study were performed. The user supplied
clear product direction. Primary HubSpot, Pipedrive and MPDX material supports
contact-entry composition, saved drafts, visible addresses and signatures; it
does not prove those products' permissions or broad logging defaults fit Core.

## One small complete user journey

1. **Organization permission.** Use existing tenant permission settings. New,
   unconfigured personal sending is unavailable until deliberately allowed;
   enabling it connects no accounts and sends nothing. The missionary sees an
   honest unavailable state or the permitted Connect action. Do not create a new
   per-message staff approval queue.
2. **Connect in context.** A Personal email card says: “Send individual emails
   from your own account. Replies stay in your email app.” Show supported choices
   and actual permission breadth. Consent returns to the same tenant/contact,
   displays the provider-derived account and preserves an already saved draft.
   Cancellation, missing scope and wrong-account return cannot show Connected.
3. **Compose.** Open from the permitted contact or follow-up task. Show contact
   name **and exact address**, From, Subject and body. Select among eligible
   addresses explicitly when necessary. One recipient; no hidden Cc/Bcc. Use the
   existing shared editor with paragraphs, bold/italic, lists and safe links, a
   plain-text alternative and a simple optional signature visible in the body.
   Initial attachment, schedule, tracking and shared-mailbox controls are absent.
   A resource link is useful only if the recipient can actually access it.
4. **Save and return.** Provide explicit Save draft, a truthful Saved/Unsaved
   indicator, and a small private Drafts list with last saved time and expiry.
   Save is not Send. Keep valid editor input on recoverable errors; navigation
   with unsaved edits offers Save / Discard / Keep editing. No offline resend
   queue or promise that typing survives a browser crash before save.
5. **Send once.** From, To and the message are the review. One deliberate Send is
   enough; no repetitive confirmation modal or ordinary per-message approval.
   A changed address, sender or source permission requires a fresh relevant
   review. A durable sending status remains reachable after navigation. Do not
   auto-complete the associated relationship task.
6. **Understand the result.** Use the states below. The contact view projects the
   existing communication fact for its authorized audience; do not ask Maya to
   log the same send again. Personal subjects/bodies are not timeline labels.
   Before Send, concise help states: “Asym keeps the sending status, not a sent
   message archive. After submission or an uncertain result, this draft is removed
   from Asym; use your email app for any retained sent copy and replies.” At Unknown,
   also state: “A sent copy may not be available.” Do not promise recoverability
   of text after its readable source authority has ended.
7. **Stop or remove access.** The account card offers Stop email sending. A
   separate Remove provider access action explains affected calendar access and
   uses the provider's qualified removal route. Only show capabilities that work.
   Reconnect is appropriate for lost consent, not an organization prohibition.

| Actual state                                            | User-facing text and useful action                                                                                                                                                                               |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Saved unsent draft                                      | **Draft saved.** Edit, send or discard; show its expiry date.                                                                                                                                                    |
| Committed source authorization, no provider outcome yet | **Sending…** Persistent status. Stop is offered only while non-submission can still be proven.                                                                                                                   |
| Provider acceptance proved                              | **Submitted to Gmail/Outlook.** “Your email provider accepted it. Delivery isn't confirmed.” Open the actual mailbox where supported.                                                                            |
| Proven no submission / definite rejection               | **Not sent.** A safe specific reason and preserved eligible draft for correction. Retry only the exact qualified non-acceptance case; never generic retry on every error.                                        |
| Possible submission without conclusive result           | **Sending outcome unknown.** “It may have been sent. Check your email app before contacting them again.” No Retry, alternate-account fallback, promised automatic resolution or ineffective Check status button. |
| Later qualified delivery failure                        | **Delivery failed** with an appropriate safe reason, separate from Not sent. Only show this when exact verified evidence exists; send-only does not promise bounce monitoring.                                   |
| Local email purpose stopped                             | **Email sending stopped.** If a shared grant remains: “Provider permissions are still in place for this connected account.” Explain the removal route and calendar effect.                                       |

A person's observation in their mailbox may be recorded as a clearly attributed
manual observation if the source permits; it cannot manufacture provider proof
or unlock a resend. A genuinely new later message is independently authorized;
there is no forever contact lock or unsafe Clone-and-retry action for unknown mail.

Use shared components and spacing, a full-width mobile composer, restrained
formatting, readable wrapping of long addresses and persistent status. Keep Send
reachable above the mobile keyboard without covering content. Require keyboard,
screen-reader, zoom/reflow and low-bandwidth tests. No send-on-Enter shortcut in
the initial profile; IME composition must never send a message. Show local dates
with clear timezone where relevant, retaining server UTC instants. Names and
content support Unicode; address compatibility follows the actual provider,
without changing a person's name/address to satisfy an ASCII-only assumption.

## Exact required amendments

The identifiers below belong to this Phase 28 research decision; they must not
be confused with Phase 17's independently numbered D15. SHALL wording defines
future obligations, not claims about the current application.

**C01 — One bounded source and delivery path.** P28/P9 SHALL register the native
individual authored-message source and authorization occurrence; P17 SHALL admit
its safe content/preparation profile outside the system-message catalog; P6 SHALL
retain sole `sendEmail` execution, complete plan release and body-free history;
P31 SHALL provide qualified connection/credential/transport mechanics. Amend the
specific Resend-only ADR-0029/P6/P17/OpenSpec branches explicitly. Do not create a
parallel outbox, arbitrary catalog key, direct SDK sender or generic mail engine.

**C02 — Small explicit product profile.** The initial profile SHALL permit one
own primary supported mailbox per principal per tenant, one selected recipient,
subject, safe basic rich text/plain text, links and optional visible signature.
It SHALL exclude attachments, Cc/Bcc, aliases, shared/delegated mailboxes,
scheduling, sequences, open/click tracking and inbox/reply import. These are
reviewed initial scope choices, not platform-wide permanent bans. The full D7
newsletter job and independently permitted manual work remain intact.

**C03 — Current organization and source authority.** Each connect, draft read/
save, preview, Send, preparation, decrypt, final dispatch and history read SHALL
use the existing current P12/source capability resolver for the exact tenant,
actor, applicable assignment/context, recipient and purpose. An assignment is
required only where the owning source requires it; early authorized relationship
work does not acquire a universal Ministry Assignment prerequisite. New unconfigured enablement
SHALL fail closed. Client tenant/role/actor fields, a stale JWT, contact visibility,
service role, staff status or an OAuth grant SHALL NOT supply missing authority.
The UI consumes that same effective capability result and explains relevant blocks.

**C04 — Recipient identity and contactability.** Select a current qualified
contact/address revision or the explicitly registered D1 restricted no-Party
branch. Do not require D2 sharing, create/merge a Party, match hidden records or
send to arbitrary typed destinations as a fallback. Recheck purpose, positive
source authority, `do_not_contact`, `do_not_email`, canonical suppressions and
known applicable provider blocking evidence. Unknown eligibility blocks dispatch.
A newsletter-topic preference is not a global stop; a donation, personal mailbox
or missing suppression is not permission. Provider-region evidence retains its
real scope; changing transport cannot evade a source-wide block.

**C05 — Authentic sender and OAuth purpose.** Use qualified authorization-code/
PKCE and OIDC transaction/issuer/account validation as applicable, with one-use
expiring state bound to the initiating tenant/principal/purpose. Derive sender
identity from the supported provider account, not typed From, UPN guesses or
unqualified aliases. Gmail's send scope does not authorize getProfile/sendAs;
Graph profile lookup needs its own qualified permission. Ambiguous identity or
unsupported mailbox class blocks readiness. Store secrets server-side in existing
custody; connecting, testing identity and refresh SHALL send no email.

**C06 — Content and purpose admission.** The server SHALL construct the exact
allowlisted envelope and canonical sanitized HTML/plain text from the accepted
source revision. Reject header injection, arbitrary MIME, unsafe URLs/HTML,
remote tracking, hidden images and unsupported fields. Qualify the whole authored
content family for the external recipient purpose under ADR-0209/0212; separately
admit every system-fetched/merged field. Do not promise semantic DLP can detect all
retyped private information. The source selects the correct purpose rather than
calling all personal mail transactional; required identity/preference controls
appear in the preview and cannot be deleted as a signature edit.

**C07 — Private useful drafts.** A draft SHALL have one source identity, author,
tenant, revision and current audience, with conditional saves and explicit saved
state. Ordinary draft storage is private source content, not Support conversation
storage, shared CRM notes or a new general notes service. Changes from another tab
cause a resolvable conflict without silent overwrite. Save/connection/reconnect
creates no send. Recoverable definitely-unsent work preserves its eligible source
draft; authority loss never promises continued plaintext access.

**C08 — One deliberate authorization.** Send SHALL atomically lock the reviewed
draft revision and create/replay its one server-owned authorization occurrence,
required body-free audit and complete P6 release. Different browser idempotency
keys SHALL NOT create new effects for that accepted occurrence. Freeze content,
recipient/address/source revisions, purpose, sender/reply destination, connection,
provider account/mailbox, grant generation and authority revision. No partial
compiler release or client-written success. Corrections need closure of the old
provably-unsent authorization and fresh review; sealed bytes never change.

**C09 — Safe credential renewal.** Freeze the stable account/grant authority,
not expiring access-token bytes. Ordinary same-grant refresh may supply current
server-held credentials for an otherwise eligible attempt, with secret-version
attribution protected appropriately. Account replacement, revocation, reconsent
or widened scopes requires current source qualification and never changes an
existing attempt's identity. Refresh/reconnect does not send or revive old work.

**C10 — Admission, uncertainty and replay.** Before possible provider I/O,
commit the immutable attempt/admission identity under current source/consent/
connection fences and exclusive generation. Inspect and disable hidden send
retries in SDK, HTTP client, worker and proxy layers. A possibly accepted send
SHALL NOT be replayed, rekeyed, cloned, rerendered or moved to another account.
Lease expiry, a missing Sent copy, an empty search, Message-ID or an old backup is
not non-acceptance proof. Only a provider-qualified definite non-acceptance permits
bounded retry while the original payload, authority and deadline remain valid.
Crash after admission may conservatively remain unknown even if no packet left.

**C11 — Truthful outcomes and business meaning.** Distinguish local acceptance,
provider acceptance, unknown, proven not submitted/rejected and separately proven
later delivery evidence. Gmail success/Graph 202 SHALL NOT establish Delivered,
Read, Replied or a personal exchange. P6 projects one qualified outreach fact with
original provenance and current audience; no duplicate manual entry, automatic
task completion, coach performance assertion, newsletter subscription, receipt,
gift/commitment mutation or staff publication follows from sending.

**C12 — Stop, revocation and shared grants.** Local Stop email sending SHALL
fence new admissions immediately; cancellation racing an already admitted attempt
SHALL report possible/known submission, not promise recall. Provider Remove access
SHALL disclose its known wider impact and fence affected local purposes before
remote revocation. Track actual Google-project/Graph-grant relationships; no extra
Microsoft grant-admin scope to make a disconnect button convenient. Calendar-only
reconnection SHALL NOT request mail scopes or reactivate the stopped mail purpose.
Previously retained scopes returned by a shared grant SHALL be recorded and
disclosed accurately; they are not local permission to send. Never disclose another
tenant's private connection details while explaining shared-account consequences.

**C13 — Separate content custody from history.** Keep the private unsent source
revision, restricted sealed execution artifact and body-free history separate.
Initial personal mail SHALL use `no_readable_copy`; arbitrary prose is not
structurally support-safe Recent sent copy. Durably recorded provider acceptance
or terminal indeterminate no-replay disposition closes that authorized source revision to body-free status
and ends its author-readable/decrypt authority. Do not retain it forever as a
“draft,” task note, timeline subject, log or search/export index. Where retained
externally, sent content and replies are accessed in the mailbox. Definite
pre-submission stop/rejection can preserve the existing eligible unsent source
revision for correction; purged bytes are not resurrected by late evidence.

**C14 — Explicit finite initial limits.** As reviewed product defaults, not
provider/owner facts: unsent drafts SHALL expire **30 × 24 hours** after the last
successful meaningful author save; reads, identical saves, retries and restore
cannot extend it. Show the expiry date. Retain only the current draft/recovery
revision required by the active lifecycle, not an unlimited revision archive.
A Send-now authorization SHALL have one immutable useful-until instant,
**5 minutes** after local acceptance. Every new attempt, including a retry after
proven non-acceptance, must be admitted before that instant. If no possibly
submitted attempt exists at expiry, end execution as Not sent and preserve the
separately still-eligible source draft for correction. An attempt admitted before
expiry can finish or time out afterward; preserve its actual accepted/unknown
outcome. Retry, reconnect and restore never reset the clock. It cannot send days
later after an outage. Each provider profile SHALL have a finite network
deadline; use **30 seconds** initially, with ambiguous timeout becoming Unknown,
not safe retry. Earlier permission/privacy stops win. End execution decrypt
authority at its terminal/expiry boundary and physically purge linked **primary-storage ciphertext, wrapped keys and plaintext-capable
caches** within the existing **24-hour** ceiling. A separately eligible unsent
source draft retains only its own correction authority and 30-day clock; source
expiry/discard/privacy closure ends that authority independently. Backup expiry
and verified cryptographic erasure retain the distinct existing P17 states;
do not claim all backups physically disappear within 24 hours. Body-free evidence
follows its existing lawful retention, not these draft/payload clocks.

**C15 — Database-enforced integrity.** Use non-null tenant/source/account scope,
closed source/payload/status branches, tenant-aware keys and foreign keys, one
semantic authorization occurrence and immutable prepared/attempt identity. Draft
CAS, current final admission, mandatory audit and complete release SHALL be
transactionally safe. No caller-controlled author/owner/approval/outcome fields;
no unrestricted deletes/cascades that erase shared contacts or needed attempt
facts. No money columns or financial-write authority are added. Exact table
names/storage topology remain design details; these invariants are mandatory.

**C16 — Equivalent protection at every access path.** Raw draft, prepared-material
and token tables SHALL have no direct `anon`/`authenticated` table grants; approved
source commands enforce fine capabilities
over P12's coarse tenant RLS. Effective grants and RLS SHALL cover reads and
old/new mutation states. Deny arbitrary protected-column updates even on an otherwise permitted row. Test raw REST, RPC, views, functions,
storage, realtime, search, exports, jobs and service-role paths. Prefer invoker
functions; necessary definer functions restrict EXECUTE/search_path and recheck
trusted context. Tokens and private bodies never appear in generic logs or
unscoped caches. Cache authority/currentness cannot outlive the qualified source
fence; same human/account in two tenants still has two isolated source contexts.

**C17 — Provider and capacity qualification.** Enable only actual tested provider/
account profiles with production consent readiness, exact From/reply behavior,
minimum scopes, payload limits and closed response classifications. Bound the
initial serialized prepared message to **256 KiB (262,144 bytes)**, subject to any
stricter provider rule; validate before dispatch, with a clear shorten-message
error. This is a conservative text-only product limit, not a provider maximum.
Respect actual shared mailbox/app budgets and Retry-After only for safe retryable
work; bound queue admission fairly by tenant/account and preserve the five-minute
usefulness deadline. Never promise a universal daily send quota or throughput.

**C18 — Recovery and operational evidence.** Retain minimal protected operation,
source, actor, connection/generation, exact payload digest, attempt, timestamps
and verified outcome evidence. Late evidence is append-only/idempotent and cannot
widen audience or restore bytes/authority. Technical logs exclude content and
secrets; business/security history is durable under its own rules. Provide safe
body-free diagnosis without direct database edits or an unrestricted operator
resend. Unknown remains truthful even when it cannot be automatically resolved.

**C19 — Safe activation and restore.** Add schema/grants/commands compatibly,
qualify owners before enabling UI, and gate each provider/tenant independently.
No auto-connection, historical mailbox import, donor-activity conversion or
backfill-generated sending. Old workers SHALL reject new unsupported profiles;
new workers fail closed against absent schema/contracts. Kill switches fence new
admissions while preserving outcome evidence. Restore SHALL quarantine effects
and protected reads until current authority/retention/attempt evidence is
recovered or reconciled; missing evidence means Recovery unknown, never fresh
send authority. Roll forward after external effects; rollback cannot unsend mail.

**C20 — Proof and traceability.** Trace this decision through glossary, explicit
owner/ADR reconciliation, OpenSpec, design, tasks, later authorized tickets, tests
and release evidence. Qualify P01–P22, the numerical boundaries and complete
accessible journeys using real roles, controlled accounts and production-shaped
load before advertising support. Keep selected, recommended, ratified and
implemented status distinct. A deterministic model, type, mock or installed
package SHALL NOT be represented as actual provider/RLS/browser qualification.

The 30-day, five-minute, 30-second and 256-KiB values deliberately close initial
profile gaps. They are **ratified review defaults**, not empirical findings or
inherited financial/staff retention classes. They need boundary/usability testing,
not a new tenant-facing configuration matrix. A future change must explicitly
update its profile, copy and proofs together; it cannot extend an already sealed
message's authority or resurrect expired work.

## Material concern register

Severity is impact if the defect occurs; likelihood estimates a naïve
implementation, not incident frequency. Every row includes the requested eight
dimensions and exact amendment references. Detailed owner/provider counterexamples
are linked above rather than duplicated into separate contradictory requirements.

| ID  | What could go wrong / why it matters                                                                                                                                                               | Severity       | Likelihood                                 | Evidence or reasoning                                                                                                | Effect on A                                                      | Permanent fix / prevention                                                                                                                         | Exact language to add                          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| F01 | “Fully connected email” becomes a second sender/inbox or calls the Resend test route; purpose, consent and history diverge.                                                                        | High           | Likely without an explicit seam            | Owner O01–02; current source; strongest-alternative comparison.                                                      | Narrows scope and changes owner contracts; preserves A.          | Native authored source plus one existing delivery spine; direct send-only transport; keep D7 independent.                                          | C01–C02, C20; exact corrected decision.        |
| F02 | Wrong Google account, mutable email, guessed UPN, alias or OAuth callback binds a sender the user did not intend; private identity is exposed or another mailbox is misused.                       | Critical       | Plausible                                  | Provider E01–E03/E09/E12; RFC 9700; getProfile is not authorized by gmail.send.                                      | Changes connection/From requirements.                            | Stable verified account binding, minimum real permissions, own primary profile, visible sender and no test-send-on-connect.                        | C03, C05–C06, C09, C17; P01/P03.               |
| F03 | A tenant-safe row still allows author/tenant/connection mutation; service jobs, RPCs or stale permission caches expose another person's draft or send after access loss.                           | Critical       | Plausible                                  | P12 current authority; Supabase grants/RLS/column docs; database analysis.                                           | Narrows every access/mutation boundary.                          | Server attribution, composite relationships, immutable protected fields, current source proof and real-role negative tests.                        | C03, C15–C16, C19; P04/P15.                    |
| F04 | A visible address or personal account is treated as consent; hidden identity matches, a stale address or source/provider suppression confusion targets the wrong person or ignores opt-outs.       | High           | Likely                                     | Owner O04–O06; current consent helper's address matching; current ICO/FTC distinctions; D1/D2.                       | Changes recipient/purpose admission.                             | Source-qualified recipient revision and canonical restriction verdict; no forced sharing, address merge or transactional relabeling.               | C04, C06, C08; P05/P06/P17.                    |
| F05 | Double click, lost response, worker failover or new request key sends twice; provider acceptance is falsely reported as delivery or failure.                                                       | Critical       | Plausible under ordinary failures          | Gmail/Graph send contracts; owner O08–O10; model M15/M16 and unsafe M26/M27.                                         | Changes recovery and status; does not invalidate A.              | One durable source authorization, immutable attempt, final admission and permanent no-replay for uncertain effects.                                | C08–C11, C14, C18–C19; P08–P11.                |
| F06 | Users see false working controls, lose drafts, cannot understand unknown results or have to manually log a send twice; mobile errors increase abandoned work and accidental outreach.              | High           | Likely if existing stubs/toasts are copied | Current source findings; HubSpot/Pipedrive/MPDX patterns; WCAG; no user study yet.                                   | Changes UX acceptance, not the selected job.                     | One clear composer, actual capability controls, explicit saved state, persistent honest outcomes and independent reply/mailbox explanation.        | C02–C03, C07, C11, C20; journey and P19/P20.   |
| F07 | Arbitrary body/subject, private CRM inserts or sender identity leak through staff timelines, coach summaries, support copies, telemetry or indefinitely retained “drafts.”                         | Critical       | Likely if shared support storage is reused | ADR-0031, ADR-0209/0212; owner O11–O13; D2/private-history boundary.                                                 | Narrows content custody and egress.                              | Private source content, canonical egress admission, no readable Sent projection, finite explicit profiles and body-free evidence.                  | C06–C07, C11, C13–C16; P07/P14/P16.            |
| F08 | Two tabs or a contact/account change silently edits the accepted message, corrupts evidence or routes a message to a replacement address; same-address people merge.                               | High           | Plausible                                  | Source revision semantics; provider draft edit races; model M03–M07/M17/M23.                                         | Changes data/concurrency invariants.                             | Conditional source saves; sealed exact versions; no address uniqueness-as-person-identity; correction through explicit new eligible authorization. | C04, C07–C10, C15; P02/P08/P17.                |
| F09 | Disconnect either fails to stop sending or unexpectedly breaks calendar; normal token expiry makes every queued send fail, while reconnect resurrects uncertain work.                              | High           | Plausible                                  | Provider E16; owner O07/O10; D14 separation.                                                                         | Changes disconnect/refresh semantics and D14 integration design. | Separate local purpose fences from actual provider-grant removal; freeze authority while allowing same-grant refresh; disclose affected features.  | C05, C09–C10, C12; P12/P13.                    |
| F10 | API throttling, oversized messages or a busy tenant causes retry storms, stale “send now” work and misleading unlimited-scale promises.                                                            | Medium to high | Expected at actual limits                  | Provider E05/E07/E14/E15; current Gmail quotas changed; no production volumes measured.                              | Bounds initial capacity and delivery usefulness.                 | Byte-bound payloads, account-aware budgets, fair bounded admission, deadlines, correct safe retry classification and load qualification.           | C10, C14, C17–C18; P18.                        |
| F11 | Partial release/audit, mixed-version deployment, restored old rows or purged correlation loses evidence and re-sends accepted mail; operators need unsafe direct repair.                           | Critical       | Plausible                                  | ADR-0026; owner O08/O12; restore model counterexamples; external systems do not roll back with Postgres.             | Changes rollout/recovery requirements.                           | Atomic source/release, body-free durable evidence, quarantined restore, fenced kill switches and safe operational views.                           | C08, C13–C15, C18–C19; P09/P14/P21.            |
| F12 | A provider permission list, mock, current code or research recommendation is called implemented/ratified; missing actual acceptance evidence leaves the specification inconsistent and untestable. | High           | Likely without trace discipline            | Existing missing personal producer; scoped source evidence; model limits; no user/provider/real-role test this turn. | Changes release proof and documentation status.                  | Exact contract mapping, falsifiable user/domain outcomes, qualification per actual provider/account and explicit evidence types.                   | C01, C17, C20; P01–P22 and synthesis sequence. |

## Every requested review category

A material concern can span categories; the concern register supplies its full
severity/likelihood/evidence/remedy dimensions. These are independent category
checks, not an assertion that every defect has been observed in production.

| #   | Category                                                     | Material concern?                  | Assessment and exact disposition                                                                                                                                                                                                                                                                   |
| --- | ------------------------------------------------------------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Problem validity, necessity and alternatives                 | **Yes**                            | The selected daily-work problem is real user direction; broad “connected email” would exceed it. Mailto is the strongest simpler alternative but misses A's reduced switching/logging. F01/F12; C01–C02.                                                                                           |
| 2   | Brittleness                                                  | **Yes**                            | Account renames, partial consent, stale sources, token rotation and network ambiguity break ideal-only flows. F02/F04/F05/F09; C03–C05/C09–C12.                                                                                                                                                    |
| 3   | Technical debt                                               | **Yes**                            | Parallel sender/history, fake system keys, copied support storage and implicit retention accumulate incompatible authority. F01/F07/F11; C01/C07/C13–C19.                                                                                                                                          |
| 4   | Edge cases                                                   | **Yes**                            | Shared addresses, missing mailbox, guest accounts, changed recipient, concurrent tabs, lost success, late rejection and purged content require defined outcomes. F02/F04/F05/F08; C04–C10/C13–C14.                                                                                                 |
| 5   | Footguns                                                     | **Yes**                            | Blind Retry, arbitrary From, fake attachment readiness, send shortcuts and broad “disconnect” can cause irreversible unwanted mail or access loss. F02/F05/F06/F09; C02/C05/C10/C12.                                                                                                               |
| 6   | Tenant safety                                                | **Yes**                            | Same account/person across tenants, body caches and grant-wide revocation can leak context or affect another binding. F03/F07/F09; C03/C12/C15–C16.                                                                                                                                                |
| 7   | Database, RLS and authorization safety                       | **Yes**                            | Row access alone does not constrain protected columns or privileged dispatch; cross-tenant FKs and new-state checks matter. F03/F08/F11; C08/C15–C16. Money/financial tables are untouched.                                                                                                        |
| 8   | Overengineering                                              | **Yes**                            | Full inbox, provider drafts/readback, generic connectors, per-message approval, admin grant-management and configurability are unnecessary for this job. F01/F09; C01–C02/C12/C14.                                                                                                                 |
| 9   | UX/UI and user friction                                      | **Yes**                            | False sent/connected/saved states, hidden sender effects and confusing retries defeat trust. F06/F09; journey, C03/C07/C11–C12/C20. Actual mobile/accessibility usability still needs proof.                                                                                                       |
| 10  | Source of truth, ownership and domain invariants             | **Yes**                            | Connection, source consent, authored content, provider result and personal exchange are different facts. F01/F04/F07/F08; C01/C04/C08/C11/C13.                                                                                                                                                     |
| 11  | Hidden coupling                                              | **Yes**                            | Shared OAuth grants couple D14/D15; shared email wrappers hide Resend-specific replay and retention assumptions. F01/F05/F09; C01/C09–C12.                                                                                                                                                         |
| 12  | Failure modes                                                | **Yes**                            | Partial local success, unknown remote success and failure to record a received result cannot become fresh send authority. F05/F11; C08/C10/C18–C19.                                                                                                                                                |
| 13  | Lifecycle, temporal correctness, concurrency and idempotency | **Yes**                            | Source CAS, admission/cancel ordering, sealed deadlines, token refresh and restore need explicit semantics. F05/F08/F09/F11; C07–C10/C12–C15/C19.                                                                                                                                                  |
| 14  | Data integrity risks                                         | **Yes**                            | Duplicate effects, stale retargeting, erased attempt truth and shared-address identity merges corrupt useful CRM facts. F04/F05/F08/F11; C04/C08/C11/C15/C18.                                                                                                                                      |
| 15  | Security and privacy risks                                   | **Yes**                            | OAuth credentials, arbitrary prose, private identity, exports/logs and excess mailbox scopes require minimization and actual authorization. F02/F03/F07/F09; C03–C06/C12–C16.                                                                                                                      |
| 16  | Scalability and performance risks                            | **Yes**                            | Shared mailbox quotas and queue/load limits cannot be inferred from API maxima. F10; C14/C17; P18. No unsupported throughput claim is made.                                                                                                                                                        |
| 17  | Operational burden                                           | **Yes**                            | Unclear unknown/reconnect states, unsupported accounts and hidden retry queues create manual repair and support churn. F05/F06/F09/F11; C10–C12/C17–C19 and monitor rules.                                                                                                                         |
| 18  | Observability and auditability gaps                          | **Yes**                            | Debug logs alone cannot prove author consent, precise attempt or late provider result; recording bodies “for debugging” violates privacy. F07/F11/F12; C08/C11/C13/C18/C20.                                                                                                                        |
| 19  | Dependency and integration risks                             | **Yes**                            | Verification/consent policy, scope changes, provider outages and ambiguous send responses are material even without a new package. F02/F05/F09/F10; C05/C09–C12/C17.                                                                                                                               |
| 20  | Migration, rollout and upgrade risks                         | **Yes**                            | Default grants, old workers, silent enrollment and snapshots can revive sends/reads. F03/F11; C15–C16/C19; no destructive backfill or dependency addition.                                                                                                                                         |
| 21  | Testability, traceability and proof                          | **Yes**                            | “Fully functional,” generic Sent and unqualified research checks are not falsifiable release criteria. F12; C20/P01–P22 and owner amendment map.                                                                                                                                                   |
| 22  | Other development hazards                                    | **No additional material concern** | Checked new financial authority, donor/public-page effects, training/completion inference, legal overclaims, dependencies and rollback. No independent new hazard beyond F01–F12 was found; C02/C04/C11/C17/C19 explicitly keep those boundaries. This is not a claim of exhaustive runtime proof. |

## Source, data and lifecycle invariants

| Fact                                              | Authority                                                                      | Invariant                                                                                                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contact/person, eligible address and restrictions | P9/relevant source plus P6/P12 eligibility; bounded D1 branch where applicable | One intended recipient revision; no global email-address uniqueness as person identity; no contact mutation from delivery.                           |
| Private draft and deliberate Send                 | Qualified native authored source with P28 journey                              | One author/tenant/source revision; CAS; one accepted authorization occurrence per reviewed send, irrespective of transport request keys.             |
| Sender account, granted scopes and credentials    | P31 qualified connection with current source-purpose authorization             | Stable provider identity and actual grant relationship; secrets never in UI/log/audit payload; same-grant refresh does not change business identity. |
| Exact execution content                           | P17 sealed artifact                                                            | Immutable envelope/bytes/hash and nonextendable deadline; no client template/header override or post-attempt rerender.                               |
| Submission/outcome                                | P6 intent/attempt/provider evidence                                            | Local commit, external acceptance, later delivery and uncertainty remain distinct; append evidence, do not rewrite history to justify retry.         |
| Contact timeline, tasks and coaching display      | Source-authorized projections                                                  | No authority to read a body, infer a reply or broaden the original history audience; current access still applies.                                   |
| External Sent/Inbox content                       | Actual provider mailbox                                                        | Independent external copy and provider policies; Asym cannot promise recall, deletion, completeness or in-app reply sync.                            |

A draft can be saved, revised, discarded or expired. Send locks its reviewed
revision, releases exactly one complete communication effect and enters pending.
Before attempt admission, a stop/revocation/deadline can prove Not sent. After
admission, current fences cannot honestly promise no effect. A definitive response
may prove rejection or provider acceptance; otherwise the send becomes Unknown.
Unknown is terminal for execution, not for later append-only evidence. A late
positive result improves truth without creating another email or re-exposing
purged content. A definite rejection can return an existing still-eligible draft
for correction, but cannot recreate already purged bytes.

Use server instants for deadlines and monotonic generations for fencing, not
client clocks. Grant/role/contact changes must serialize with the final admission
boundary; a remote request already in flight cannot be atomically rolled back by
a PostgreSQL transaction. An expired worker lease proves no permission to act,
not absence of a past remote effect. Delete/discard is source-specific; do not
cascade into a shared Party, independent task, financial fact or attempt history.

The database design needs indexes matching tenant/author draft lists and unique
source authorization, plus qualified pending/deadline/connection lookups. Verify
plans with actual cardinalities and RLS, not a generic index checklist. Store
Unicode text and qualified address forms without destructive normalization;
UTC instants/generations have explicit types. Audit attribution is server-derived
and no amount/currency columns are required by this decision.

## Falsifiable future acceptance and proof

These are required outcomes for implementation, **not tests claimed run now**.
Each test must include the relevant actual tenant roles, direct access paths and
provider profile, not only a mocked component rendering the requested label.

| ID  | Required proof                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P01 | Correct tenant/person connects each supported actual account class; canceled/partial consent, wrong issuer/account, known unsupported/unprovisioned account classes, unsupported guest/alias and invalid OAuth state cannot activate the profile or send a test message. Identity/send consent alone is not proof of mailbox provisioning; later documented service rejection gives Not sent and preserves the eligible draft without silently adding a mailbox-read probe. Scope and publisher verification match the real release. |
| P02 | Save/reload restores the exact private draft; two tabs detect conflicting saves/sends without losing the recoverable source. Saved is shown only after acknowledged persistence. Changed source/sender/address forces relevant review, not retargeting.                                                                                                                                                                                                                                                                              |
| P03 | Gmail getProfile/sendAs/read calls are absent under send-only; Graph identity uses its actually granted permission. Unicode names, renamed primary address, UPN differences and unsupported internationalized destinations preserve exact identity or fail clearly.                                                                                                                                                                                                                                                                  |
| P04 | Cross-tenant, same-tenant other missionary, staff without source rights, coach, departed user, stale JWT and forged actor/owner/tenant/connection/new-state updates fail through REST/RPC/view/function/storage/realtime/job/service paths. Current permitted author succeeds.                                                                                                                                                                                                                                                       |
| P05 | Global contact stop, email stop, applicable suppression, unknown verdict and changed source eligibility block dispatch; topic-only withdrawal has its correct narrower meaning. Every admitted purpose gets its required preview/footer/preference behavior.                                                                                                                                                                                                                                                                         |
| P06 | Restricted eligible prospect sends without creating a Party or D2 sharing. Hidden match, shared address, missing eligible address and raw arbitrary destination cannot disclose/merge/retarget identities or manufacture consent.                                                                                                                                                                                                                                                                                                    |
| P07 | Unsafe JSON/HTML, header CRLF, link schemes, pasted images, tracking, hidden Cc/Bcc, forged signature/From and inadmissible system merge data fail server-side. HTML and plain text reflect the same accepted reviewed content.                                                                                                                                                                                                                                                                                                      |
| P08 | Two Send requests with different transport keys, stale tab, refresh and duplicated jobs yield one source authorization and no duplicate possible submission. Freeze sender, recipient, bytes, source/contact/grant revisions and audit attribution.                                                                                                                                                                                                                                                                                  |
| P09 | Fail before/after source commit, child release, attempt admission, network write and result commit. No partial release becomes dispatchable; missing result after possible remote success remains Unknown. Actual process/transaction fault injection is required.                                                                                                                                                                                                                                                                   |
| P10 | Provider accepted then lost response, ambiguous server failure, lease expiry and hidden SDK retry produce no second possible submission. Definitive documented non-acceptance permits only the exact bounded eligible retry.                                                                                                                                                                                                                                                                                                         |
| P11 | Gmail success/Graph 202 never renders Delivered/Read/Replied, completes a personal exchange/task or alters coaching/finance/newsletter truth. Manual external observations keep distinct provenance. No duplicate manual send log is demanded.                                                                                                                                                                                                                                                                                       |
| P12 | Both orders of stop/revoke/contact withdrawal versus actual final admission preserve the boundary. Pre-admission prevents I/O; post-admission retains possible/known effect. No provider recall/deletion promise.                                                                                                                                                                                                                                                                                                                    |
| P13 | Token expiry/rotation and concurrent refresh preserve grant identity; wrong-account reconnect does not inherit old authority. Connect D14 then D15, stop mail, remove shared access, fail/delay revoke and reconnect calendar-only: truthful feature states, no new mail-scope request, no mail-purpose reactivation, truthful retained-grant scope disclosure and no other-tenant disclosure.                                                                                                                                       |
| P14 | Check draft expiry at just before/exactly/after 30 × 24 hours, every new attempt admission at five minutes (including definite-rejection retries), network timeout at 30 seconds, and terminal denial/primary-store physical purge within 24 hours. An admitted pre-deadline attempt may resolve afterward; a separately eligible unsent source draft and backup expiry retain their own clocks. Reads/no-op saves/retries/restore do not extend clocks. Late proof cannot revive content.                                           |
| P15 | Run real PostgreSQL constraints, grants, USING/new-row WITH CHECK behavior, conflicting permissive policies, protected column updates, definer/search-path/execution and current service-job authority. Do not infer these from a UI or owner-role SQL session.                                                                                                                                                                                                                                                                      |
| P16 | Put synthetic private markers in subject/body/signature and source data. None leaks to staff/coach history, audit labels, logs, search/export, cache or unauthorized draft reads. Verify keys/ciphertext/backups and immediate denial versus bounded physical purge separately.                                                                                                                                                                                                                                                      |
| P17 | Shared household address, changed contact revision, canonical merge, archived preparation, deleted source and departed author preserve exact original evidence and deny unsafe current actions; no automatic identity/consent/history transfer.                                                                                                                                                                                                                                                                                      |
| P18 | Test actual measured tenant/mailbox workloads, one mailbox used in several contexts, 429/Retry-After, ambiguous 5xx, fair admission and queue expiry. Test serialized payload at 262,143 / 262,144 / 262,145 bytes and any stricter provider bound. Record dataset/cardinality/concurrency and query plans; no unsupported scale claim.                                                                                                                                                                                              |
| P19 | Keyboard, screen reader, 200% zoom/reflow, touch and IME users can connect, compose, save, reopen, correct errors, send once and stop; focus and status announcements remain useful. Pending/unknown are persistent, not color/toast-only.                                                                                                                                                                                                                                                                                           |
| P20 | Representative missionaries complete mobile/slow-network contact-to-send and draft-return tasks and accurately explain sender, recipient, reply location, saved state, unknown outcome, content retention (including a terminal Unknown with neither Asym-readable text nor a provider Sent copy) and calendar removal effect without coaching. Any critical misunderstanding blocks release and triggers design correction.                                                                                                         |
| P21 | Mixed old/new code/schema, tenant/provider feature gate, migration failure, kill switch, old backup with missing later attempt/revocation and deleted content all fail safely. Restore cannot replay mail or re-expose purged content. Recovery needs no unrestricted operator resend or direct SQL repair.                                                                                                                                                                                                                          |
| P22 | Trace every C clause and provider profile to owner/OpenSpec/design/tasks/tickets when authorized, automated/manual evidence and release signoff. Evidence explicitly distinguishes model passes from actual DB/provider/browser/load results; no nonexistent Sent/archive/attachment capability is advertised.                                                                                                                                                                                                                       |

## Ruthless synthesis and execution order

**Resolved before recording this answer.** Preserve A; choose native drafts and
direct own-primary-account sending; retain unknown as a supported terminal
execution outcome; distinguish local stop from broad provider removal; retain
private content/body-free history. The exact source/transport conflicts and
initial limits are explicit above. No unrelated product choice or new approval
workflow is needed to record this ratified decision.

**Capture in formal spec/design when authorized.** First reconcile the bounded
P28/P9 authored source, P17 content/catalog/retention, P6/ADR-0026 plan/attempt spine,
ADR-0029 personal credential branch, P31 grant topology and P12/P3/P10 access/
egress projections together. The [owner amendment map](d15-evidence/owner-boundaries.md#exact-owner-amendments-and-dependencies)
identifies exact contracts. Include D14 shared-grant impact and P27 outreach
meaning. Do not edit governing contracts piecemeal or claim an unrestricted
provider registry overrides them. No full P31 connector catalog, general inbox,
new vendor or separate permission framework is prerequisite.

**Implementation safeguards in dependency order.**

1. Qualify private source/recipient/purpose commands, current authority, semantic
   effect identity, grants/constraints and body-free audit. Prove negative access
   and source conservation before exposing the composer.
2. Add the exact prepared-content/no-readable-copy profiles, finite clocks,
   safe same-grant refresh, one writer and no-replay attempt protocol. Prove crash,
   race, late-evidence, purge and restore behavior before any controlled send.
3. Qualify one provider/account profile end to end, including identity, consent,
   real sender/reply, payload and API outcomes. Gmail and Graph are concrete
   researched candidates, not an untested promise that all accounts work. Add
   further profiles only on equivalent evidence; do not weaken requirements to
   make a second button appear.
4. Build the small settings/composer/private-drafts/status journey with existing
   shared components. Test mobile/accessibility and representative missionary
   comprehension, then fix failures before limited tenant opt-in.
5. Roll out additively behind tenant/provider gates with body-free diagnostics,
   fair budgets and a stop switch. Widen only after release evidence satisfies
   the invariants; capability presence is never inferred from a deployed UI card.

**Residual monitoring, not substitutes for required safeguards.** Thresholds
below are proposed operating rules, not measured provider limits or completed
production instrumentation. Owner names denote existing domain responsibilities.

| Signal                                                                                                        | Threshold                                                                                                     | Owner                    | Required response                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unauthorized read/send or cross-tenant result                                                                 | Any verified occurrence                                                                                       | P12/security with P6/P31 | Fence affected profile immediately, preserve body-free evidence, investigate and correct before reopening.                                                                                          |
| Duplicate possible submission for one authorization                                                           | Any occurrence                                                                                                | P6 delivery owner        | Disable unsafe dispatch/retry path; reconcile exact attempts, fix and requalify fault tests. No automatic compensating resend.                                                                      |
| Provider outcome Unknown                                                                                      | Every occurrence is visible immediately; alert if at least 5 in a rolling 60 minutes for one provider profile | P6/P31 operations        | Keep affected operations non-replayable; inspect provider/transport health and pause new admissions if a common defect is confirmed. Do not page merely because one honestly unknown result exists. |
| Pending send without admission beyond five minutes                                                            | Any occurrence                                                                                                | P6 delivery owner        | Expire to Not sent, retain eligible draft and surface reason; investigate queue/fairness regression.                                                                                                |
| Repeated throttling                                                                                           | Three consecutive documented 429 rejections for an account                                                    | P31 transport owner      | Honor Retry-After, reduce admission for that account, show capacity reason; never replay earlier uncertain work.                                                                                    |
| Content decryptable after terminal/expiry or primary-store physical purge overdue                             | Any unauthorized readability or any primary-store purge exceeding 24 hours                                    | P17/data custody owner   | Fence reads/dispatch immediately; repair primary purge/key lifecycle and separately verify governed backup expiry/erasure status.                                                                   |
| Required audit/attempt linkage missing                                                                        | Any accepted source operation lacking its required identity/evidence                                          | P6/P9 owners             | Stop affected new work, repair through qualified evidence procedure, requalify atomic release.                                                                                                      |
| Missionary cannot identify From/To, reply location or meaning of Unknown; disconnect surprises calendar users | Any critical observed misunderstanding during release testing or supported incident                           | P28 product/design owner | Correct language/controls and repeat affected journey test; pause affected rollout when it can cause wrong sends/access loss.                                                                       |

## Verification performed and remaining limits

Five independent reviews covered owners, current source/UX, providers, product/
privacy and database/lifecycle. Primary documents were inspected as of October 16,
2026, including current Google/Graph changes and Supabase guidance. No provider
account was connected, no messages sent and no production data accessed.

The local [probe](d15-evidence/probe.py) passed **28/28 deterministic model
outcomes**, including two intentionally unsafe controls demonstrating duplicate
submission. Its [results](d15-evidence/probe-results.json) list assumptions and
non-proofs explicitly. Real RLS/concurrency, deployed grants, provider consent,
mobile accessibility, representative user feedback and production volumes remain
P01–P22 release gates, not unresolved product semantics or fabricated evidence.

The source and reference checks for this research do not qualify existing code.
Only session research and a narrowly defined glossary meaning are updated. No
application, dependency, formal owner/ADR/OpenSpec, ticket, live Supabase object,
credential or external communication is changed by this review.

[Artifact verification](d15-evidence/review-verification.json) records local
references, clause/category/proof counts, status checks, source/probe hashes and
the unchanged founder brief. It makes no application qualification claim.
