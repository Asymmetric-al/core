# outbound-communications normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-8e07a4b40d95682d87fc"></a>

## Message Contracts Bound Tenant Freedom Without Owning Business Truth

<!-- BEGIN CONTRACT {"id":"8e07a4b40d95682d87fc","name":"Message Contracts Bound Tenant Freedom Without Owning Business Truth"} -->

Producing domains MUST own event meaning, eligibility, current source facts,
recipient authority, requiredness, business timing and cancellation fences,
official document truth, protected actions, and completion state. Phase 17 MUST
own governed presentation, publication, resolution, Delivery Plan capability,
and bounded in-product presentation. Phase 6 MUST remain the only
recipient-specific communication-intent, external-dispatch, provider-evidence,
and communication-history spine.

Authorized tenant staff MUST be able to control contract-permitted content,
tone, branding, layouts, locales, site overrides, sender and reply profiles,
optional channel enrollment, and bounded plan options. The server MUST prevent
tenants from changing required meaning, legal/payment/receipt truth, business
eligibility, arbitrary events or recipients, source queries, consent,
suppression, permissions, classification, protected actions, tenant/site
identity, or mandatory steps. Contracts MUST expose typed, role-safe facts
rather than arbitrary records or database field paths.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-5121b0acf09ee7af56dc"></a>

## Every Tenant Uses Its Own Proved Resend Connection And Delivery Identity

<!-- BEGIN CONTRACT {"id":"5121b0acf09ee7af56dc","name":"Every Tenant Uses Its Own Proved Resend Connection And Delivery Identity"} -->

Every tenant MUST own one Resend account/team, one proved transactional domain,
and one revisioned connection aggregate. Asym MUST NOT use a shared fallback
account for tenant messages. The connection MUST store its send-only API secret
and per-connection signed-webhook secret encrypted and write-only, plus exact
provider/account/domain readiness, rotation, revocation, and audit proof. Secret
values MUST NOT enter client reads, logs, previews, publications, exports,
prepared snapshots, or support history.

Each tenant MUST have one required Default Sender Profile and MAY have a bounded
set of active same-domain Sender Profiles. Sender purpose MUST resolve through a
fixed server-side sparse order. Reply-To MUST resolve independently from a
contract-owned reply purpose to one access-confirmed tenant destination or an
explicit no-reply posture. Request-level From, Reply-To, arbitrary header, or
provider-account overrides MUST be rejected. Inbound reply processing remains
Phase 26.

Preparation MUST freeze the exact connection/account proof, sender-profile
revision, From identity, reply-purpose/destination revision, and no-reply result.
Multiple immutable delivery snapshots MAY coexist after configuration changes.
A prepared message MUST NOT switch account, credential, sender, or reply
destination. Signed webhooks MUST resolve to one exact tenant connection and
prepared message, reject replay and ambiguity, and never infer tenant scope from
provider-supplied email addresses alone.

Provider reduction MUST keep submission, mail-server delivery, reputation,
advisory engagement, evidence health, Phase 3 consent/contact authority, and
provider suppression as independent facts. It MUST reduce sent, delayed,
delivered, failed, bounced, suppressed, and complained monotonically; conflicts
quarantine rather than overwrite. The product MUST claim only absence of known
blocking suppression evidence. Only the adapter MAY emit the fixed transport
header allow-list, including `Auto-Submitted` and exact RFC 8058 unsubscribe
headers where required.

Milestone M0 MUST pin the exact Resend SDK, management access probe,
success/error/webhook schemas, signature library, and official evidence. Current
rate/quota/retry response headers MUST drive a tenant-isolated limiter rather
than a permanent hard-coded limit. Only `resend_sending_key` is instantiable in
Phase 17; any reserved OAuth or other-provider credential path MUST remain
structurally unreachable. Rotation, compromise, webhook disablement,
disconnect, and domain/team/region migration MUST fence new work and reconcile
old pinned identities without cross-account replay. Secret status MUST
distinguish retired, live-purged, backup-expiry-pending, and verified
cryptographic erasure.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ca182e2f10e54317f524"></a>

## Trigger Bindings, Not Producers, Own Delivery Routing Identity

<!-- BEGIN CONTRACT {"id":"ca182e2f10e54317f524","name":"Trigger Bindings, Not Producers, Own Delivery Routing Identity"} -->

Every producer MUST enter through a generated, server-only trigger binding. The
registry resolver MUST reload one append-only binding projection and resolve the
exact compatible manifest generation plus effective tenant or platform Delivery
Plan. The resulting intent MUST retain an immutable binding-projection FK and
the exact manifest, binding id/version, producer event key/version, stable
producer namespace, contract key/version, Delivery Plan contract id/version,
effective plan id/version, step key/ordinal, channel, publication slot,
recipient role/resolver version, fact-adapter version, action-issuer version,
and condition version. Denormalized copies MUST NOT override that projection.

The producer payload MUST NOT select or override any contract, generation,
event kind, plan, step, channel, publication slot, recipient role/resolver,
fact adapter, action issuer, publication, scope, or delivery identity. It MAY
supply only the binding-permitted source occurrence/fence values, one bounded
opaque occurrence-slot token, bounded resolver input, approved producer facts,
relations, presentation cases, action inputs, and timing. Unknown, stale,
Reserved, Retired, unbound, forged, mismatched, or cross-scope binding context
MUST reject before occurrence-slot or intent insertion.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-c7a9a80e904f4c249cd8"></a>

## System Messages Provides A Safe, Observable, Accessible Staff Product

<!-- BEGIN CONTRACT {"id":"c7a9a80e904f4c249cd8","name":"System Messages Provides A Safe, Observable, Accessible Staff Product"} -->

Mission Control MUST provide one System Messages workspace organized around
understandable catalog message names and statuses, not tables or provider jargon.
It MUST expose catalog coverage, inheritance, languages, content, Brand Kit,
Role Layouts, Delivery Plans, sender/reply profiles, Resend readiness, review,
repair, history evidence, and portability through focused progressive disclosure
with one clear next action. Preview and test MUST use stored synthetic scenarios
and fake addresses/facts; real donor PII MUST be structurally unavailable to
authoring and review.

Every read and mutation MUST branch on server-derived `scope_kind`. Tenant
resources MUST require active tenant equality plus every applicable site, Party,
role, capability, document-class, and current-revision predicate with
tenant-scoped RLS/composite integrity. Platform resources MUST require the exact
`platform_scope_id`, current contract-declared platform-recipient or verified
service authority, applicable document-class/revision predicates, and a
service-only command while every tenant/site/Party field remains null and every
tenant/client role is denied. Client ids, claimed scope, cache keys, queue
payloads, imports, provider data, email addresses, and stale claims MUST NOT
select scope or authorize. Mutations MUST use
optimistic concurrency, idempotency, immutable audit, and last-known-good
rollback behavior. They MUST return the repository's stable safe mutation error
envelope rather than provider/schema details. Expensive test, impact, bulk,
conversion, export, and transfer operations MUST have bounded per-scope-owner and
per-actor/service-authority rate/concurrency controls; rejection MUST expose a safe retry path and
MUST NOT leave partial side effects.

The product MUST meet WCAG 2.2 AA and support keyboard, screen reader,
non-drag editing, visible focus, non-color states, 44-by-44 CSS-pixel targets
where applicable, mobile/reflow, zoom, long locales, RTL, blocked images,
reduced motion, and plain-text parity. Observability MUST expose catalog/
activation gaps, resolution/fallback reasons, compile/review failures,
provider/connection health, prepared/submission outcomes, quarantine, backlog,
webhook reconciliation, recent-copy expiry/purge, and cross-tenant rejection
without storing message bodies, secrets, or donor PII in telemetry.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-bf549721606927f0b370"></a>

## Preparation And Recovery Preserve One Recipient-specific Identity

<!-- BEGIN CONTRACT {"id":"bf549721606927f0b370","name":"Preparation And Recovery Preserve One Recipient-specific Identity"} -->

Every recipient/channel intent MUST preserve one independent semantic member
identity plus exact source fact/snapshot, contract and plan step, audience,
locale and fallback trace, content publication, Brand Kit, Role Layout,
renderer/formatter/compiler, protected-action reference, and recent-copy
posture. Before provider I/O, every **external-delivery** intent MUST additionally
cross one durable prepared-message boundary that freezes subject, HTML/text,
sender/reply/connection revisions, permanent internal provider-message identity,
and member payload hashes. The request-level Resend idempotency key MUST NOT
exist until the exact one-member or batch provider-submission envelope is sealed.
An `in_product` intent MUST instead create only its local `available` event,
role-safe notification projection, engagement, and body-free communication
event. It MUST NOT create a provider preparation, prepared delivery artifact,
provider envelope, sender/connection pin, provider identity, provider state, or
provider outcome.

Inside the atomic plan compiler transaction, one private member operation MUST
resolve exactly one concrete recipient authority for one channel step. Fan-out
across recipients, roles, channels, or steps MUST use independently keyed member
operations and independent occurrence-slot tokens beneath the single public
plan-occurrence command. A producer MUST NOT call or commit those member
operations independently. For each member, the producer MUST supply only one
bounded, versioned opaque occurrence-slot token, never a permanent semantic key
or hash.

The server MUST derive `occurrence_slot_hash@1` from `{environment, scope kind,
scope owner, stable producer namespace id, token bytes}` with a
code-owned domain separator. A permanent unique constraint on
`(scope_kind, scope_owner_id, environment, occurrence_slot_hash)` MUST lock one
producer-authorized recipient-and-channel-step slot. In the same transaction,
the server MUST insert or lock that slot and derive two further versioned
canonical hashes. `semantic_identity_hash@1` covers the occurrence-slot hash,
producer implementation and token-schema versions, environment, producer/source
identity and fence, scope kind/owner, immutable binding-projection id, manifest
generation, binding id/version, producer event key/version, stable producer
namespace, contract key/version, Delivery Plan contract id/version, effective
plan id/version, step key/ordinal, channel, publication slot, recipient role,
resolver/fact-adapter/action-issuer/condition versions, and concrete tenant or
platform recipient-authority revision.
`immutable_command_hash@1` additionally covers the complete typed fact or
source-snapshot digest, ordered collection items, relation-set hash,
presentation cases, protected-action descriptor input, recipient-resolver
input, and earliest/expiry/utility bounds. It may return the prior row only when
both comparison hashes and all schema versions match. Any changed identity or
immutable input under the same slot MUST hard-fail; a legitimate successor MUST
use a new producer-authorized slot token.

All three digests MUST use distinct domain separators and versioned canonical
UTF-8 schemas with NFC strings, explicit types/lengths, ordered object keys,
preserved array order and distinct absent/null values. Locale-dependent or
caller-ordered serialization MUST NOT define identity; golden fixtures MUST
prove slot uniqueness, exact replay, conflicts, and cross-process stability.
The stable producer namespace MUST be a durable registry identity rather than a
deploy, implementation, or token-schema version. The source candidate MUST
persist and re-emit its original token bytes and token-schema version across
N/N-1, retry, rollback, and worker replacement. A namespace rename or future
slot-hash schema change MUST preserve every existing unique slot through an
explicit migration/alias and MUST NOT rehash an existing candidate into new
work.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-f6de91cd9bf7f38061a9"></a>

## Phase 3 Cross-channel Consent Gates Recipient Delivery

<!-- BEGIN CONTRACT {"id":"f6de91cd9bf7f38061a9","name":"Phase 3 Cross-channel Consent Gates Recipient Delivery"} -->

Existing staff/system-initiated outbound contact and governed contact-list egress
MUST consume one fail-closed canonical Party/contact-point consent boundary.
`do_not_contact` MUST remain the absolute contact floor; email MUST additionally
honor `do_not_email`, `email_suppressions` and known blocking provider evidence.
Transactional receipt email MUST NOT be exempt from these recipient contact
checks. Self-service download of one's own admitted receipt artifact is not
contact and MUST retain current access checks without applying recipient opt-out.
Missing authority MUST block rather than assume consent. New channel preference
centers, transports and providers MUST remain deferred; an unavailable channel
MUST NOT become executable through this contract.

Recipient consent/contactability MUST apply at delivery resolution and send-time,
not to authorized staff authoring, synthetic preview/review, publication or
catalog administration. Those staff operations MUST still enforce capability and
projection. Self-service access to one's own admitted records/artifacts MUST
remain distinct from contact and retain current access checks. Phase 17 owns
content, typed variable preparation and resolution; Phase 6 alone owns recipient
intent, dispatch and delivery evidence. Phase 7 owns official facts and Phase 18
owns admitted document artifacts. Recipient outputs MUST consume exact
surface/purpose-projected facts, never arbitrary record bags, direct-send or
prototype text-receipt paths. Dependent official output MUST remain unavailable
until its exact owner qualifies, without blocking unrelated foundation delivery.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-5ffc1ba888b56eca77a8"></a>

## Phase 27 review and recorded appeal plan fence dependent solicitation

<!-- BEGIN CONTRACT {"id":"5ffc1ba888b56eca77a8","name":"Phase 27 review and recorded appeal plan fence dependent solicitation"} -->

P6/P17 and qualified delivery consumers SHALL preserve exact current P27 review and membership-dependent source eligibility at actual effect admission. An appeal working list is a recorded plan, not consent or a live filter. Removal/exclusion/closure and required review invalidation fence unadmitted dependent effects; an eventual consumer notification alone is insufficient. Frozen recipients may narrow, never silently gain replacements. Return/re-add or another appeal cannot revive a canceled solicitation. Actual admitted/in-flight/unknown external success stays truthful and independent receipts/service/fulfillment work retains its own authority.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-fe1ca6dc3c23f008dfa0"></a>

## In-product Notifications Are One Role-safe Attention Projection

<!-- BEGIN CONTRACT {"id":"fe1ca6dc3c23f008dfa0","name":"In-product Notifications Are One Role-safe Attention Projection"} -->

The platform MUST use one Asym/Postgres notification item, grouping, and
engagement model. A notification MUST be a tenant-, Party-, role-, and
surface-scoped attention projection over producer-owned truth, never a source
record, task, workflow, business-completion state, external-delivery receipt, or
second communication ledger. Producer availability/source state, immutable
presentation, viewer engagement, and source resolution MUST remain separate.

Phase 17 MUST provide the full staff bell/inbox required by Live contracts and
only contextual donor/missionary views required by current flows. Broad Donor
Portal and Missionary Workspace notification-center information architecture
remains Phases 25 and 28. Email and in-product plan steps MUST have independent
authority and outcomes. Grouping MUST reduce noise without erasing item-level
provenance or current source state.

Severity MUST use the finite code-owned **Information**, **Attention**, and
**Urgent** vocabulary. Eligibility MUST evaluate in the fixed order product
contract/requiredness, tenant configuration, recipient preference, then current
role/access/privacy/source applicability; a later layer MUST NOT suppress a
contract-required safety item or grant access. Migration MUST use one future-only
writer fence and MUST NOT replay historical communication rows as unread items
or infer engagement from email telemetry.

Every Live in-product step MUST select exactly one code-owned presentation
policy and one exact source-applicability/end rule. The initial closed vocabulary
MUST contain only:

- `presentation.source_actionable_then_recent_90d@1`: present in **Needs
  attention** and **All** while the source is actionable and access holds; read
  changes unread/badge state only; archive is unavailable while required work
  remains; source terminal/superseded/expired/not-applicable ends active
  presentation and permits authorized non-unread recent history for exactly 90
  days from the once-set end instant; and
- `presentation.information_30d_then_recent_90d@1`: present in **All** only;
  unread treatment ends by the earliest read, archive, correction/supersession,
  or 30 days after availability; authorized recent history ends 90 days after
  availability.

Access-revision loss MUST remove every active and recent projection immediately
and later authority MUST NOT revive it. A source that resolves before first view
MUST create no unread debt and MUST NOT fabricate read engagement. Group reopen,
read/unread, archive/restore, tenant settings, worker delay, retry, local-time
display, and realtime delivery MUST NOT extend either ceiling. At the 90-day
ceiling the read path MUST return no presentation even if purge is late; purge
MUST remove role-safe preview/search material while separately governed
body-free Phase 6 audit remains.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-9c4c617a341b327f8bc9"></a>

## Complete Immutable Publications Resolve Deterministically

<!-- BEGIN CONTRACT {"id":"9c4c617a341b327f8bc9","name":"Complete Immutable Publications Resolve Deterministically"} -->

Each message/channel/locale variant MUST publish as one complete immutable
publication. An inheriting scope stores no duplicate content. **Customize** MUST
copy the exact currently effective complete publication into a revisioned draft
with its source version recorded. Parent changes MUST NOT overwrite custom
publications; staff MUST be offered keep current, start a new draft from the
updated parent, and return to inheritance with a human-readable impact preview.
Runtime MUST NOT merge subject, body, action, block, locale, or other fragments
from different publications.

For eligible system-message content, each tenant MUST select one of exactly two
platform-defined fallback priorities: **Prefer the recipient's language**
(default and recommended) or **Prefer site-specific wording**. Exact
site-and-requested-locale wins under both. Resolution MUST use canonical BCP 47
locales and a pinned Unicode CLDR matching version, build a bounded deduplicated
candidate list, validate tenant/site/jurisdiction/channel/document/fact/schema/
sender/publication/quarantine compatibility, and choose one complete
publication. Each contract MUST declare tenant-policy-eligible, platform-fixed,
or fallback-prohibited. Receipts, protected documents, and other contracts not
authorizing tenant choice retain their fixed contract order.

Resolution MUST record the requested-locale source, policy and resolver
versions, candidate trace and rejection reasons, effective scope and locale,
cross-language outcome, and exact publication and presentation dependencies.
Content fallback MUST NOT change the already validated scope owner or its
branch-specific authority: tenant/legal-entity/site/sender/Brand-Kit identity
for tenant scope, or platform recipient authority and fixed platform delivery
profile for platform scope. A prepared message MUST never be re-resolved.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d0173aba976d190cf46b"></a>

## SMS Governance Is Evidence-ready While Transport Is Unavailable

<!-- BEGIN CONTRACT {"id":"d0173aba976d190cf46b","name":"SMS Governance Is Evidence-ready While Transport Is Unavailable"} -->

Phase 17 MUST reserve provider-neutral SMS vocabulary and append-only evidence
while platform SMS transport remains structurally unavailable. Platform
capability, tenant/route registration readiness, channel-scoped consent and
provenance, recipient preference, and carrier/provider suppression including
STOP/HELP MUST remain distinct. No state combination may create an SMS intent
while platform capability is unavailable.

Phase 17 MUST NOT ship an SMS provider SDK, adapter, renderer, queue, editor,
test send, template binding, enrollment flow, or activation control. Imported
evidence MUST NOT fabricate consent or readiness. A later explicit transport
phase MUST re-prove current law, registration, consent, suppression, support,
and operational readiness before delivery is enabled.

The preserved future gate MUST separately prove exact sender/use-case/market/
route registration, affirmative consent and phone revision, STOP/HELP and broad
suppression, reassignment/merge behavior, preference, required-message policy,
quiet-time/rate/idempotency/finality, signed callbacks, tenant isolation,
retention, test isolation, operations and rollback. Partial/rejected/drifted
registration, reassigned phones, STOP races, callback disorder, provider
failure, test leakage and credential compromise MUST fail closed. This gate is
documentation only in Phase 17 and MUST NOT create dormant transport code.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ff11d25cc28b0477f45a"></a>

## Protected Actions Remain Producer-owned And Scanner-resistant

<!-- BEGIN CONTRACT {"id":"ff11d25cc28b0477f45a","name":"Protected Actions Remain Producer-owned And Scanner-resistant"} -->

Protected actions MUST be tenant-scope-only in this generation and MUST bind one
exact Party/contact authority. Every platform-scoped contract MUST declare
`action: none`, and compilation MUST reject a platform protected-action
descriptor. A later platform action requires a separately ratified authority
contract and MUST NOT borrow tenant Party, site, session, or Supabase-invitation
semantics.

The producing domain MUST own every protected action's purpose, tenant, Party,
resource, issuance credential, expiry, revocation, redemption, completion
postcondition, and audit. Phase 17 MAY render only a typed action descriptor in
the contract-approved protected-action node. Templates, imports, tests, and
tenant staff MUST NOT create, reveal, rewrite, duplicate, relabel, track, or
widen protected actions.

Every protected action MUST use the same fixed scanner-resistant Asym doorway.
After the verifier POST, a producer contract MAY require an authenticated portal
session, reauthentication, step-up, producer OTP, or explicit confirmation, but
those are assurance requirements behind one transport—not alternate link,
handoff, token, or authorization systems. `GET`, `HEAD`, preview, scanner, and
link-expander traffic MUST have no business effect. Credentials and protected
destinations MUST NOT appear in editor state, logs, analytics, durable history,
recent-copy storage, or exported packages. Reissuance MUST create a successor
communication identity rather than mutating a prepared message.

The handoff MUST be no-store, no-referrer, third-party-free, and shared by every
producer. The fixed code-owned Asym HTTP URL MUST carry only a random non-secret
selector. An independent verifier MUST contain at least 256 random bits and MUST
exist only in the URL fragment until browser bootstrap. The server MUST store
only a versioned HMAC/digest of the verifier. The verifier MUST NOT enter an HTTP
path/query, redirect, provider tracking URL, communication history, recent-copy
storage, export, storage URL, log, trace, analytics event, screenshot, support
tool, or browser telemetry. There MUST be no full-secret or raw-selector
fallback.

A selector-only `GET` or `HEAD` MUST be inert and non-enumerating. It MUST reveal
no organization, action, recipient, resource, expiry, terminal state, or other
protected fact; touch no protected resource; consume no credential or grant;
create no authorized session; and prove neither identity nor human intent.
`HEAD` MUST return no body or session. Missing, malformed, modified, or stripped
fragments MUST lead only to the same generic code-owned recovery route.

At startup, the server MUST parse `protectedActionOrigin` as one canonical HTTPS
origin and join it only to the exact code-owned `PROTECTED_ACTION_PATH`. Tenant
input, request/forwarded-host headers, arbitrary configured paths, selector,
verifier, and return destinations MUST NOT choose the origin, route, authority,
or redirect. Invalid or non-round-tripping origin/route configuration MUST fail
readiness.

For every landing and terminal response, the server MUST generate at least 128
fresh random bits with a cryptographically secure random-number generator,
Base64-encode them as `nonce`, and serialize this exact policy after the
origin/route checks:
`default-src 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; script-src 'nonce-${nonce}'; connect-src 'none'; img-src 'none'; font-src 'none'; media-src 'none'; worker-src 'none'; manifest-src 'none'; style-src 'nonce-${nonce}'; form-action 'self'`.
The serialization variable MUST be replaced and MUST never appear literally in
output. A response MAY use at most one server-rendered inline
`<style nonce="${nonce}">` block and one minimal inline
`<script nonce="${nonce}">` block with the exact same response nonce; nonces
MUST NOT be reused across responses. The script MUST do only four things: parse
the closed verifier envelope from `location.hash`, reject malformed input,
immediately remove the fragment from browser-visible history with
`history.replaceState`, and place the verifier in the same-origin protected
form. It MUST NOT auto-submit, fetch, beacon, persist, log, report, navigate, or
load another resource. The recipient MUST deliberately submit the form.

Every protected action's exact same-origin POST, protected by method, CSRF,
Origin, Fetch Metadata, current authorization, expected state, idempotency, and
any contract-owned step-up, MUST validate the selector/verifier pair before it
may establish a short-lived non-authorizing landing session or continue to the
producer-owned assurance/action step. Digest comparison MUST be constant time.
Raw request bodies and verifiers MUST be redacted before every
product-controlled observability seam. The cookie MUST contain only a
cryptographically random server-side session id; MUST be `Secure`, `HttpOnly`,
host-only by omitting `Domain`, `SameSite=Lax`, and scoped to the exact
landing/action `Path`; and MUST expire no later than producer action authority.
Server state MUST bind environment, scope tuple, selector and digest/key
versions, protected-action kind, purpose, recipient-authorization epoch, expiry,
and revocation. Every later request MUST re-prove those bindings. Rotation MUST
invalidate prior sessions, and terminal, expired, replaced, or revoked authority
MUST clear every affected session. Verified POST replay MUST be idempotent and
MUST NOT execute the producer action twice.

Every protected landing, redirect, error, session, and terminal response MUST
set all three cache headers exactly: `Cache-Control: private, no-store,
no-transform, max-age=0`, `CDN-Cache-Control: no-store`, and
`Vercel-CDN-Cache-Control: no-store`. It MUST also set `Referrer-Policy:
no-referrer`. No protected route MAY add `s-maxage`, stale fallback, an optimizer,
or service-worker handling. The form action MUST be the exact same-origin
code-owned route. There MUST be no style attributes, external resources,
third-party script, CSP report receiver, analytics, session replay, remote
image/font, tag manager, pixel, or tracking receiver.

Real-browser and production-path fixtures MUST cover supported webmail, mail
clients, mobile webviews, Chromium/WebKit/Firefox, and scanners that follow
links, execute script, or submit forms. They MUST prove fragment preservation,
fragment removal, deliberate-submit behavior, duplicate POST idempotency,
selector enumeration resistance, iframe/cross-site POST denial, current
authorization, sibling-subdomain cookie rejection, key rotation, terminal
clearing, and the exact cache headers through the actual Vercel/CDN path. There
MUST be no query/path-secret compatibility fallback when a client strips the
fragment. The product MAY guarantee verifier-free product-controlled URLs,
referrers, logs, and telemetry after bootstrap; it MUST NOT claim to erase
mail-client/extension history, browser sync, screenshots, clipboard contents, or
other records outside Asym control.

Every adopted Supabase Send Email Hook action MUST have a checked-in exact
recipient/token/hash mapping, including secure and non-secure email-change cases;
raw Standard Webhooks signatures MUST be verified before parse and the bounded
hook deadline MUST use an already-published individual-send path. Possible
provider acceptance MUST remain indeterminate under the same frozen identity.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-e6c7e9db4ba3f681e57c"></a>

## Publication Review Is Proportional And Independent Where Required

<!-- BEGIN CONTRACT {"id":"e6c7e9db4ba3f681e57c","name":"Publication Review Is Proportional And Independent Where Required"} -->

All drafts MUST support synthetic-data preview, diff, impact explanation, test,
commit, immutable publish, restore-as-new-draft, and audit. Standard copy changes
MAY use a qualified self-publish fast path. A contract-owned fixed predicate
MUST require an authorized reviewer different from the latest material editor
for changes that affect protected meaning, protected actions, legal/payment/
identity content, protected locale variants, sender/reply posture, or a shared
dependency used by any protected message. Tenants MAY require stricter review
but MUST NOT weaken the contract floor or author an approval workflow language.

Review approval MUST bind the exact candidate graph and become stale after any
material edit, dependency change, permission loss, contract change, or failed
validation. Publish MUST be atomic and idempotent and MUST leave the prior Live
version active if any proof fails.

The server MUST derive and freeze one publication-floor evaluation from the
whole effective candidate and dependency fan-out using a closed reason-code
vocabulary. Client labels, split/renamed changes, role switching, imports, and
shared-dependency indirection MUST NOT lower the floor. Protected publication
MUST re-prove a different human principal, current Phase 12 capabilities,
step-up, author/reviewer permission epochs, governance epoch, exact candidate and
head CAS in one transaction. A one-person tenant MAY invite one candidate-scoped
reviewer who sees only synthetic evidence. Emergency restoration MAY only
restore a compatible protected system default or previously independently
reviewed same-tenant version and MUST NOT introduce new/wider protected meaning.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-32f88635c5749980da84"></a>

## One Structured Document Produces Accessible Email Artifacts

<!-- BEGIN CONTRACT {"id":"32f88635c5749980da84","name":"One Structured Document Produces Accessible Email Artifacts"} -->

One versioned Asym-structured document MUST be the canonical source for each
complete email publication. It MUST contain subject, preheader, semantic body,
locale and direction, approved assets, typed variables and bounded collections,
protected fact/action nodes, and schema/catalog identity. One stable
compatibility schema plus each message contract's server-side allow-list MUST
govern nodes, marks, positions, attributes, variables, null behavior, escaping,
output contexts, collection bounds, and presentation cases. Arbitrary record
access, source-schema paths, expressions, code, scripts, raw HTML/CSS, forms,
iframes, embeds, tracking pixels, custom React/components, and provider-template
source MUST be rejected.

One server-side compiler MUST validate and deterministically produce HTML and
plain text for preview, test, review, publish, and production. Publication MUST
freeze the structured source, compiled artifacts, schema/catalog/contract/
compiler/sanitizer/renderer versions, governed assets, protected semantics,
dependency pins, and hashes. Published versions MUST never be reopened or
recompiled in place. Ordered, loss-detecting migrations MUST create new drafts;
unsupported legacy content remains honestly read-only and may use only its
last-known-good frozen artifacts until converted.

Brand Kit and email Role Layout MUST be separate complete immutable
dependencies. Tenants MUST have broad safe visual control at organization and
permitted site scope, while contract-owned layout roles and the minimum protected
semantic units preserve recipient clarity, accessibility, legal/payment truth,
and protected actions. Saved Sections MUST copy on insertion and MUST NOT create
hidden live fan-out. Publication of a shared dependency MUST validate every
affected published consumer and leave the prior complete graph active on failure.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-3b056f19245e71401bee"></a>

## Communication History Is Durable Evidence Without A Body Archive

<!-- BEGIN CONTRACT {"id":"3b056f19245e71401bee","name":"Communication History Is Durable Evidence Without A Body Archive"} -->

Durable communication events MUST remain body-free and retain `scope_kind` plus
exactly one scope owner. Tenant events MUST retain `tenant_id` and only permitted
site/Party/contact-revision or body-free no-Party recipient-authority references;
platform events MUST retain
`platform_scope_id` and the exact platform-recipient authority and platform
delivery-profile revisions while leaving tenant/site/Party/contact fields null.
Every channel MUST retain stable catalog classification or contract-proven safe
title, semantic intent/member identity, channel, requested and effective locale,
fallback trace, publication/dependency hashes, timestamps, and audit. An
external-delivery event MAY additionally retain nonsecret prepared-message pins
and normalized provider outcome evidence. An `in_product` event MUST retain local
`available`/presentation truth and structurally prohibit provider preparation,
sender/connection, provider identity, state, and outcome. Ordinary personalized
resolved subject and body MUST NOT be durable history, and provider history MUST
NOT become product authority.

Eligible **tenant-scoped** email contracts MAY produce one separate encrypted
recipient-specific support-safe recent sent copy at preparation. A typed projection MUST remove
credentials, protected destinations, payment secrets, staff-only/care/restricted
facts, unsafe headers, and contract-forbidden values before persistence.
Security-sensitive contracts MAY require zero copy. Tenant retention MUST be
limited to 30 days (recommended), 7 days, or Off and bounded by any shorter
contract maximum. Expiry MUST deny reads immediately even when purge is pending.

Platform-scoped messages MUST always use `no_readable_copy` in this generation
and MUST NOT create a recent-copy row. Their body-free history remains
service-only. A future readable platform copy requires a separately ratified
service-owned retention, encryption, authorization, support-access, and purge
policy rather than inheriting tenant controls.

Contracts MUST choose exactly one finite class: ordinary support copy with a
30-day ceiling, limited support copy with a 7-day ceiling, or no readable copy.
Unknown classification MUST mean zero. The support projection and viewer MUST be
inert and allow-listed: no action/URL/secret/provider raw material, external
resource, script, form, navigation, download, prefetch, analytics, or client
cache. The tenant UI MUST disclose that this Asym setting does not change the
tenant's independent Resend-account retention.

The copy MUST NOT serve as communication truth, official receipt/statement,
retry payload, provider log, search/export corpus, or legal archive. Reveal MUST
re-prove current tenant, role/capability, exact recipient Party/contact revision,
source/site, privacy/restriction/erasure, and expiry authority and write a
content-free audit. Source access alone MUST NOT grant recipient-copy access.
Erasure, restriction, recipient-authority loss, permission loss, and restore
MUST reapply denial and purge rules. The UI MUST distinguish available,
expired, disabled, never captured, restricted, purged, and honest legacy states.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-3688a40e99438928d1c1"></a>

## Phase 6 Is The First Build Of The Existing Communications Capability

<!-- BEGIN CONTRACT {"id":"3688a40e99438928d1c1","name":"Phase 6 Is The First Build Of The Existing Communications Capability"} -->

Phase 6 MUST be the **first build** of Mission Control's already-declared
**communications** capability, extending this outbound-communications delta and
one communication spine rather than creating a duplicate capability/history or
competing Phase 17 design. The missionary workspace MUST consume its role-safe
communication surface. Shared communication services MUST remain server-only in
`packages/api`; apps MUST consume the governed projection/resolver.

`communication_events` MUST be the Asym-owned body-free interaction-fact header,
with typed detail left to its owner and same-scope `communication_event_relations`
naming source records without granting access. Durable events MUST NOT retain a
body, transport address or personalized subject. Every execution/history
reference MUST preserve environment, exclusive tenant/platform scope and the
applicable exact connection revision. Recipient authority MUST be one closed
branch: same-tenant Party and its purpose-eligible contact point/exact revision;
explicitly contract-permitted same-tenant no-Party authority kind/id/revision
with no durable address; or exact service-only platform authority. Transitional
donor/missionary IDs MUST project that same Party, never another authority.
Addresses, tags and provider payloads MUST select neither identity nor owner.
Platform v1 MUST retain only exact `eve_platform_owner` authority with null
tenant/Party/contact fields; the current no-Live-platform-key generation MUST
remain non-dispatchable. Missing recipient proof MUST NOT fall back to an address.

Every admitted real-recipient business email MUST capture its canonical event
by construction at the sole `sendEmail` gateway with atomic local intent/event,
relation, consent and dispatch-evidence binding. Planned CI sole-seam enforcement
MUST prohibit bypass provider senders. External provider I/O MUST use frozen
submission-envelope identity and reconcile uncertainty before retry; local
atomic capture MUST NOT claim a distributed DB/provider transaction. Synthetic
previews/test sends MUST remain outside Party/source-record communication history.

Signed delivery evidence MUST attach, never create, a communication. The verified
connection revision MUST fix scope before exact internal/provider-message lookup
through `{scope_kind, scope_owner_id, connection_revision, provider_email_id}`.
Ambiguous, unresolved or crossed evidence MUST be quarantined safely; only later
proved same-scope correlation MAY attach it. Provider reduction MUST preserve
independent dispatch, submission, mail-server delivery, reputation, advisory
engagement and evidence-health axes, alongside separately authoritative consent/
contact and provider-suppression facts. Duplicate and out-of-order evidence MUST
be retained without terminal regression; only owner-permitted non-conflicting
transitions MAY advance an axis. Contradictory terminal delivery facts MUST
quarantine and open one deterministic repair case rather than overwrite or
discard either fact. Complaint MUST update separate reputation; it MAY establish
delivered from pending/delayed under the Phase 17 reducer but MUST NOT overwrite
a conflicting terminal delivery fact. In-product `available` MUST NOT imply
provider delivery/read truth.

Support Hub/member-care payloads MUST remain permanently owned by their typed
detail tables, with atomic canonical reference emission, one-event support
outbound deduplication and staff-only care. Legacy `email_send_logs`/`email_events`
MUST instead follow bounded proved migration/backfill/adapters, complete
reader/writer/webhook/reconciliation/FK disposition and legacy writer fencing
into one history. An authority flip MUST NOT occur while a live dependency still
needs the old shape. Blanket “adapt, not migrate” MUST NOT authorize perpetual
dual email authority or inferred recipient mappings.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b2d69f7e799977aae3b6"></a>

## Platform-scoped Email Uses The Same Governed Spine Without Impersonating A Tenant

<!-- BEGIN CONTRACT {"id":"b2d69f7e799977aae3b6","name":"Platform-scoped Email Uses The Same Governed Spine Without Impersonating A Tenant"} -->

Platform-scoped system email MUST use one separately proved Asym-owned Resend
connection and domain, an Asym-fixed publication, verified platform recipient
authority, Phase 17 compiler/profile proofs, and the same Phase 6 preparation,
idempotency, provider-event, recovery, and body-free history contracts as tenant
email. The platform
connection MUST NOT be selectable as a tenant fallback and MUST NOT resolve
tenant publications, tenant credentials, donor/customer/missionary recipients,
or tenant data. Database and service boundaries MUST enforce exactly one tenant
or platform scope rather than using a fake tenant id.

Every recipient-specific execution and history row—intent, fence, relation,
preparation, prepared artifact, provider submission, submission member, attempt,
provider evidence/event, communication event, and repair row—MUST carry the same
closed `scope_kind` and an exclusive owner arc. Tenant
scope MUST have `tenant_id NOT NULL` and `platform_scope_id NULL`; platform
scope MUST have `tenant_id NULL` and a service-only `platform_scope_id`. A
stored owner id derived from the one non-null owner MUST prefix parent/child
composite FKs, semantic/idempotency uniqueness, provider lookups, claim/state
indexes, batch membership, and result/history constraints. A provider request
MUST contain one scope owner only.

Recent sent copies are a separate tenant-only detail. Every platform-scoped
contract in this generation MUST resolve to `no_readable_copy`, MUST NOT create a
recent-copy row, and MUST expose only service-only body-free history. A future
readable platform copy requires a separately ratified service-owned retention,
encryption, authorization, support-access, and purge policy; it MUST NOT inherit
tenant settings or tenant support capabilities.

The recipient and delivery-profile owners MUST also be exclusive. Tenant scope
MUST use exactly one of a same-tenant Party/contact revision or a tenant
non-constituent no-Party recipient-authority branch, MUST use the tenant
connection/profile, and MUST leave platform-authority fields null. The no-Party
branch MUST leave Party/contact fields null and retain only its body-free,
scope-safe authority/reference in durable execution and history. Its transport
address MAY exist only in encrypted, short-lived prepared-delivery material and
MUST NOT become identity or provider-event correlation authority. Platform
recipient authority MUST be a closed mutually exclusive union. Platform v1 MUST admit exactly
`eve_platform_owner`, carrying an enabled, verified app-owned
platform-owner-notification-record revision and identity/permission epoch plus
the fixed platform connection/profile, and MUST leave every tenant, Party,
contact, site, tenant-publication, and tenant-business relation field null. An
unknown, absent, future, or caller-selected platform authority kind MUST reject
before intent creation. The restricted platform destination MAY enter only
sealed delivery material; body-free history MUST retain the authority reference
rather than an arbitrary address.

Asym customer-account bootstrap/security mail is a separate forward boundary,
not an Eve authority or authorized v1 recipient branch. It MUST remain
non-dispatchable until a later contract defines its own exact app-account source
occurrence/fence, verified recipient authority, mutually exclusive union branch,
stable keys, fixed publication/profile, and complete proof packs.
Because D10 requires that path to avoid universal tenant-BYOK setup deadlock,
new-tenant go-live MUST remain blocked until that separately owned contract is
ratified and Live. Already-authorized tenant administrators MAY configure their
tenant connection; the platform MUST NOT borrow tenant mail, Eve authority, an
arbitrary address, or a generic security key to conceal the missing bootstrap
authority.

The platform connection contract MUST have a normative service-only owner
aggregate and encrypted credential/proof revisions separate from
`tenant_email_settings`. The current manifest generation has no Live platform
email key; therefore Phase 17 MUST prove the schema, exclusive arcs, service-only
authorization, and negative no-send boundary without provisioning a credential,
running a canary, or inventing a test key. Actual platform connection/profile
provisioning, positive canary, and end-to-end send proof become mandatory only
as part of the same release that introduces the first exact meaning-specific
Live platform email key and its ratified recipient-authority branch.
Tenant/client roles MUST have no read or mutation path to platform execution,
history, connection, recipient, or repair rows; tenant policies MUST require
both active tenant equality and tenant scope. Provider ingress MUST resolve the
proved connection revision before scope lookup and MUST ignore payload metadata
as ownership authority. Existing rows MUST backfill as tenant scope without
history rewrite. No migration may manufacture a tenant for platform mail.

Prepared artifacts, encrypted request material, purge scheduling, constraints,
and audit MUST carry the exact `(scope_kind, scope_owner_id, environment)`.
Restricted material MUST use two closed, non-interchangeable associated-data
schemas. `prepared_artifact_aad@1` MUST additionally bind preparation id,
artifact schema version, material hash, encryption-key version, exact recipient-
authority revision, and delivery-profile revision. The tenant branch uses either
an exact Party/contact revision or an exact no-Party recipient-authority revision,
plus the tenant connection/profile revision; the platform branch uses exact
platform-recipient authority and fixed platform connection/profile
revisions with tenant fields null. `provider_submission_envelope_aad@1` MUST
instead bind submission id, envelope schema version, request digest,
encryption-key version, connection revision, credential revision, and ordered-
member-map digest; a multi-member envelope MUST NOT bind one member's
preparation id as its envelope identity. Any changed, missing, cross-owner or
cross-environment field MUST make decryption fail before provider I/O.

Purge work MUST be scope-owner-fair and MUST NOT cross-decrypt, cross-claim, or
cross-attach. Audit MUST use exactly one actor branch: tenant human with tenant
principal and capability/governance/step-up epoch; platform human through
service with verified service identity plus initiating Asym principal and
platform capability/governance/step-up epoch; or platform automation with
verified service identity and policy epoch but no human principal. A
human-triggered platform operation MUST NOT be recorded as automation. Platform
audit MUST remain service-only and no branch may fabricate a tenant or human.

Eve #436 owns each source event, safe fact envelope, channel eligibility,
platform-owner recipient selection, notification-level dedupe/pause/expiry, and
the opaque producer fence that proves those truths. For email it MUST submit only
a typed platform-scoped communication intent. Phase 17 owns the catalog/contract,
fixed publication resolution, canonical compiler, and platform delivery-profile/
connection configuration and proof. Phase 6 owns recipient-specific intent,
preparation orchestration through those Phase 17 resolvers, outbox/claim,
submission fence, idempotency, Resend invocation, provider attempt/evidence/
outcome reduction, reconciliation, and body-free communication history. Before
preparation and again immediately before committing the submission fence, Phase
6 MUST independently re-read or verify the current opaque Eve fence: #418
release/emergency state, #420 switch, Eve pause/opt-out/expiry/dedupe eligibility,
recipient-authority revision, and content-policy/redaction version. Missing,
stale, or unavailable proof fails closed for definitely unsubmitted work;
possibly submitted work remains outcome/reconciliation truth. Phase 6 validates
the proof and MUST NOT reimplement Eve policy. Eve retains Discord-specific
rendering, delivery and evidence outside the Phase 17 channel model. This manifest
generation contains zero Eve email keys, so Eve email is non-dispatchable. A
later generation may make an Eve email Live only after the producer enumerates
its exact stable occurrence meaning and fence, adds a meaning-specific
platform-scoped key and fixed platform profile, and passes the complete
platform proof pack. A generic catch-all Eve key is prohibited.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d3dc1377adc6dfeef79b"></a>

## Delivery Plans Are Bounded And Compile Through Channel-owned Seams

<!-- BEGIN CONTRACT {"id":"d3dc1377adc6dfeef79b","name":"Delivery Plans Are Bounded And Compile Through Channel-owned Seams"} -->

A message contract MUST define fixed named step slots and the permitted
step/channel/delay/escalation envelope; the contract is not itself the effective
Delivery Plan. Authorized tenant staff MAY publish a tenant-specific versioned
plan only inside that envelope. A platform-scoped contract MUST instead resolve
the immutable Asym-owned fixed plan/version declared by its exact
meaning-specific platform profile and MUST NOT resolve tenant configuration. The
producer MUST own business event truth, facts, audience eligibility, business
timing, cancellation fences, and source state. The immutable binding and
effective-plan resolvers MUST own routing identity, concrete recipient-resolver
selection, step, channel, and publication slot. Every eligible step MUST compile into a
recipient-specific Phase 6 intent with its effective plan revision and source
fences recorded. An eligible external-delivery intent MUST proceed through its
channel executor. An eligible `in_product` intent MUST create one local
`available` event and the Asym/Postgres role-safe Phase 17 notification
projection; it MUST create no provider submission, provider state, or provider
outcome.

Delivery Plans MUST NOT provide arbitrary events, audience builders, free-form
recipients, formulas, code, nested workflow graphs, loops, general waits, tasks,
record mutations, or direct provider calls. Phase 34 remains the owner of
general automation and workflow execution. Phase 17 MUST add no second queue,
scheduler, outbox, or communication ledger.

For one source occurrence, the producer MUST make exactly one bounded compiler
call containing the complete candidate envelope, including when one or zero
members apply; it MUST NOT loop over independently committed child submissions.
The compiler MUST independently derive the complete applicable recipient-step
set. The producer MUST supply a separate `plan_occurrence_token@1`; every member
retains its independent token. The top-level token MUST be canonical opaque
1–128-byte UTF-8, PII/secret-free, unique for one occurrence within the stable
producer namespace, durably retained in original form by the producer for
replay, and never persisted raw by Phase 6. A server-created top-level context
MUST prove scope, environment, producer event, contract, and effective-plan
authority even when the candidate set is empty. A unique
`communication_plan_occurrences` header MUST
derive its permanent slot from exact execution scope, environment, stable
producer namespace, and the top-level token—never plan or membership. Its
separate immutable compilation hash MUST cover source fence, manifest/contract/
effective-plan versions, complete evaluated binding/condition results including
excluded slots and safe reason codes, expected member count, and canonical
ordered-member digest. The header MUST represent a released zero-member result.

After all candidates resolve under finite binding and global recipient bounds,
one database transaction MUST lock source fence, plan/generation, the unique
header, and canonical member slots; insert or exactly replay the header; insert
or exactly replay every independently keyed child with same-scope parent FK and
gap-free ordinal; verify count/digest plus every binding, semantic, and command
hash; and set parent `released_at` last. Claim SQL MUST require a same-scope
released parent. A crash before commit MUST expose no parent or child; a crash
after commit/before response MUST exactly replay the complete result. Concurrent
identical compilers MUST converge on one result; changed/disjoint membership or
any changed source, plan, binding, condition, recipient, order, count, digest,
or child input MUST hard-conflict. Bound overflow MUST create no rows, and the
compiler MUST NOT chunk one logical occurrence. A committed unreleased header
MUST be an alerted invariant violation with no force-release path. The header is
Phase 6 coordination metadata, not a workflow run, outcome ledger, queue,
scheduler, or outbox.

The compiler result MUST be a closed union that distinguishes a newly released
occurrence, exact replay of the same released occurrence, and a successful
zero-member release from safe conflict and safe rejection. A released result
MUST return the same parent id and canonically ordered member ids; zero-member
success MUST return an explicit empty-member variant. Conflict/rejection MUST
use closed reason codes and MUST NOT expose raw tokens, hashes, recipient facts,
provider material, or an existing id until same-scope ownership is proved.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-f675c93c13333e234db5"></a>

## System-message Portability Is Versioned And Destination-owned

<!-- BEGIN CONTRACT {"id":"f675c93c13333e234db5","name":"System-message Portability Is Versioned And Destination-owned"} -->

The platform MUST export a native versioned Asym package containing selected
drafts/publications, structured documents, approved governed assets, Brand Kit,
Role Layouts, Saved Section source copies, locales, bounded Delivery Plan
configuration, sender/reply purpose references without secrets or assumed
verification, dependency manifests, schema/compiler/catalog versions, hashes,
provenance, and hashed inert synthetic HTML/plain-text outputs containing no
recipient data. Structured source MUST remain the only editable truth. Exports
MUST exclude recipient data, communication history,
recent sent copies, provider credentials, provider/account proof, protected
action credentials, consent, suppressions, and source-business records.

The trusted native lane MUST use `asym_message_package@1`: schema-validated RFC
8785 canonical-manifest UTF-8, exact per-object SHA-256 digests, an ordered
whole-package digest, and a detached `ECDSA_P256_SHA256_P1363@1` signature over
the domain-separated length-prefixed canonical manifest. The envelope MUST carry
the versioned key id, algorithm id, issuer instance, format version, manifest
digest, and exact 64-byte P1363 signature. Verification MUST use only a
code-owned `(algorithm, key id, issuer)` allow-list, verify signature and every
length/order/digest before parsing or exposing objects, retain old public keys
for the supported-reader window after signing-key rotation, and never trust
package-supplied key material. Unknown, revoked, expired, cross-environment,
tampered, unsigned, or unsupported packages MUST enter the isolated untrusted
conversion lane or Blocked result and MUST NOT claim exact native round-trip.

Native import MUST stage into a quarantine workspace, verify manifest hashes
and package/schema compatibility, map exact destination-owned sites/locales/
roles/purposes/assets, show loss and conflicts, and create drafts only. Foreign
Unlayer/Beefree/HTML input MAY enter only through an honest bounded conversion
that preserves the original read-only artifact, reports unsupported/lost
semantics, sanitizes all content and assets, and never claims pixel or semantic
equivalence. Imported content MUST pass the same validation, review, and
publication path as authored content.

The original foreign artifact MUST remain encrypted, immutable and read-only
only for the bounded conversion-review window, MUST NOT become a runtime or
publication dependency, and MUST be purged with evidence. Destination import
MUST re-prove current contract/lifecycle, privacy/consent, locale, presentation,
protected truth/action, review, recovery, transport, sender and reply authority;
missing authority MUST produce a draft blocker rather than an inferred mapping.

Cross-tenant transfer MUST require bilateral, destination-owned acceptance,
must never copy source authority or secrets, and must create destination drafts
with complete provenance. Transfer MUST NOT auto-publish, auto-bind Live
contracts, activate locales, verify sender/reply identity, or move communication
history.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-2493e1e8271730955cdf"></a>

## Locale Activation Requires Contract-scoped Readiness

<!-- BEGIN CONTRACT {"id":"2493e1e8271730955cdf","name":"Locale Activation Requires Contract-scoped Readiness"} -->

Tenants MUST be able to activate any canonical human-language locale in the
version-pinned IANA/Unicode standards catalog for system messages without an Asym
approval queue or curated launch allow-list. The server MUST canonicalize
recognized aliases and MUST reject arbitrary strings, private-use-only identities,
`und`, `mul`, `zxx`, control characters, unsafe extensions, and unsupported locale
behavior. A recognized locale whose pinned renderer capability is not yet proved
MAY be added to the authoring workspace and populated for coverage review, but
affected contracts MUST remain visibly not Ready and follow their governed
fallback. No communication may enter `Prepared definitely unsubmitted` in that
locale until the pinned platform-render-capability proof passes. Activation MUST
NOT claim that every message is translated. Readiness MUST be derived per Live
contract and locale from complete publication, current compatibility, required
protected meaning, layout/direction support, source-owned facts, and the
contract's fallback posture. The System Messages language view MUST show human
language names and simple **Ready**, **Uses fallback**, and **Needs attention**
counts with the next useful action.

Tenant activation, recipient-requested locale, pinned platform render
capability, per-contract readiness, and the effective rendered locale on a
prepared message MUST remain separate facts. Authorized staff MAY activate a
partially covered locale after a synthetic impact review partitions required
Live contracts into exact publication, compatible fallback, and blocked; each
blocked required contract MUST fail closed. Activation MUST NOT create a global
readiness Boolean. Deactivation MUST affect future resolution only and MUST NOT
rewrite publications, prepared messages, provider work, history, preferences,
or prior effective-locale evidence.

Locale publications MUST preserve one complete language and direction. Runtime
MUST NOT machine-translate, field-merge languages, or silently publish a draft.
Protected locale publications MUST meet the contract's independent-review floor;
ordinary wording MUST keep the proportional fast path. Each prepared recipient
message MUST pin requested/effective locale and formatter/CLDR versions.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a5d44d364aef4a3ce44c"></a>

## One Code-governed System-message Catalog Defines Every Supported Product Message

<!-- BEGIN CONTRACT {"id":"a5d44d364aef4a3ce44c","name":"One Code-governed System-message Catalog Defines Every Supported Product Message"} -->

The platform MUST maintain one executable, versioned catalog of system-message
contracts for every platform/system-generated email or in-product message and,
after its separate activation gate, SMS message. This governed set means messages
produced by code from business, authentication, security, payment, or operational
events on a Phase 17-supported channel. Every contract MUST
have a stable product-owned key, producer owner,
purpose and classification, audience and recipient authority, typed fact and
protected-action contract, required and optional channels, required and optional
Delivery Plan steps, locale and fallback posture, layout role, sender and reply
purposes, recent-copy class, failure and recovery posture, document class,
required/conditional/optional/forbidden fact wall, protected render core,
surface/capability envelope, retention/audit class, decision/test traceability,
and lifecycle state. The code-generated manifest MUST expand one immutable
compile-time profile plus bounded named overrides into a complete flat contract;
runtime profile inheritance, deep merge, inferred safety defaults, and tenant
profile editing are prohibited. Each contract MUST declare exactly one closed
`scope_kind`: tenant scope with exact tenant isolation, or platform scope with an
Asym-fixed, service-only publication and verified platform recipients. Each
expanded contract, shared profile, trigger projection, and catalog projection
MUST carry that value explicitly; it MUST NOT be inferred from recipient data,
publication availability, a missing tenant, or a caller-supplied default. Each
Target Live key MUST have an exact trigger
binding, producer/source fence, recipient resolver, fact adapter, action issuer,
step/channel slot, proof pack, and migration disposition.
The fact adapter MUST supply only contract-declared producer-owned facts. The
named server recipient resolver MUST add only contract-declared resolver-owned
facts, including the safe recipient display projection, and MUST reject producer
spoofing or collisions. `required_fact_keys` applies to the complete authorized
render DTO after resolution and before channel materialization; either owner omitting a
required fact MUST fail closed.
The catalog lifecycle MUST distinguish **Reserved**, **Live**, and **Retired**;
an `is_active` Boolean, provider template, database binding, or tenant
publication MUST NOT substitute for lifecycle authority.
An unknown or Reserved key MUST be non-executable: every producer request for
one MUST fail before a plan-occurrence header, child intent,
`communication_event`, in-product notification item, prepared material, or
provider work exists. Source-domain command confirmations, operational state,
and role-safe source projections MAY remain available, but MUST NOT be labeled
or counted as catalog delivery. A later Reserved-to-Live activation applies only
to future eligible source transitions and MUST NOT catch up or replay historical
candidates. A mandatory notice MUST remain release-blocked rather than bypass
this lifecycle gate through a direct sender.

A contract may become Live only through an idempotent activation generation
that proves the common contract requirements: its producer event and fact
projection, recipient authority, Phase 6 intent seam, required complete
publications/locales, contract-declared presentation dependencies, consent and
permission behavior, failure and recovery posture, observability, and contract
tests. Activation MUST produce one atomic verdict for the exact contract and
generation; every step that generation declares executable MUST pass its
applicable channel proof before the whole contract becomes Live. A contract
MUST NOT become partially Live, and proof for one channel MUST NOT substitute
for another channel's proof.

For each executable external-email step, activation MUST additionally prove the
applicable sender identity/profile, reply purpose and destination, Resend
connection and credential, sending-domain and provider readiness, and external
transport, delivery, and outcome-reconciliation path. For each executable,
local-only `in_product` step, activation MUST instead prove its local
presentation policy and role-safe projection, source-owned presentation-end
rule, recipient access, local event/history path, and local operational
readiness. An `in_product` step MUST NOT require a Resend connection, sender,
reply destination, provider transport, or delivery proof; those contract fields
MUST be explicitly not applicable, and activation MUST NOT create provider
material or work for the step.

Phase 17 SMS declarations are transport-dark reservations, not executable
steps. They MUST NOT satisfy or bypass an SMS transport proof and MUST NOT
become enabled or Live in this phase. Only a later, explicitly authorized SMS
activation phase may declare an SMS step executable after re-proving the
preserved registration, consent, suppression, sender, transport, delivery,
support, and operational gates against then-current requirements.

Retirement MUST stop new intent creation while preserving immutable
publications, prepared messages, history, and evidence. No
platform/system-generated message on any enabled catalog channel—including
email, in-product, and separately activated future SMS—may bypass the catalog.
Human-authored support replies, newsletters, campaigns, and missionary personal
messages are not system-message contracts; their owning later phases govern
composition, while their email or future SMS delivery still crosses the one
Phase 6 recipient-specific communication seam.

Eve #436 retains its governed source envelope, severity/channel policy,
platform-owner recipient authority, dedupe/pause/expiry decision, and Discord
operational channel. Discord is not a tenant System Messages channel or Phase 6
email outcome. Any Eve email MUST instead request an exact platform-scoped,
Asym-fixed Phase 17 contract/compiler and use the Phase 6 delivery spine; it MUST NOT create a parallel
email renderer, provider choice, retry lifecycle, or communication history. The
current manifest generation contains zero Eve email keys, so every Eve email
request MUST fail before intent creation. A later generation may add only
producer-enumerated, meaning-specific platform keys with exact source fences, a
fixed platform profile, and complete platform proof packs; a generic
`eve_alert` key is forbidden.

The activation package MUST include a dated mechanical producer/obligation
census, a D1-D20 decision-to-test traceability matrix, generated trigger and
contract projections, and a separate Asym-only system-default publication
namespace. A system default MUST NOT use a fake tenant id and MAY resolve only
when the exact contract explicitly permits it and all current compatibility,
review, locale, presentation, applicable sender/reply, privacy, and action
proofs pass.

Before any `proved` state, checked-in release evidence MUST also carry the
canonical census-source digest, the `phase17-obligation-exclusion-closure@1`
artifact digest, and the `phase17-release-pack-allocation@1` plus atomic subject-
coverage digests for the exact catalog generation. Their schemas and canonical
UTF-8/SHA-256 rules are those fixed by the Phase 17 census, manifest and
traceability package; row counts or prose review MUST NOT substitute for exact
field and subject coverage.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-70bbde904a9b56a426d6"></a>

## Phase 3 Governed Export Uses Authoritative Field Policy

<!-- BEGIN CONTRACT {"id":"70bbde904a9b56a426d6","name":"Phase 3 Governed Export Uses Authoritative Field Policy"} -->

Governed CSV/JSON export MUST consume one projection/export policy source.
A field MUST be emitted only when `exportable` is true and its category is
permitted for the destination; on-screen visibility MUST NOT imply exportability.
External egress MUST omit internal, care and security fields; bulk export MUST
omit payment identifiers. Derived report columns MUST be classified and serializers
MUST consume the resolved field set rather than competing hardcoded allowlists.
CSV consumers MUST share one `csvSafeCell`, including the fast-track security
patch's helper, neutralizing leading formula/control triggers (`=`, `+`, `-`,
`@`, TAB, CR, LF) and applying RFC 4180 cell quoting. CSV serializers MUST join
records with CRLF and emit the file's UTF-8 BOM, consuming the helper's quoted
cells without duplicating escaping.
JSON MUST enforce the same authorized field set without adopting CSV encoding.
Export audit MUST record identifiers, field/category metadata and actual emitted
row count, never rendered PII. Contact-list export MUST also pass the applicable
consent gate; serializers MUST NOT decide consent independently.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-c2b5dc5bdf473fd72edc"></a>

## Phase 6 Role-safe History And Suppression Preserve Current Governance

<!-- BEGIN CONTRACT {"id":"c2b5dc5bdf473fd72edc","name":"Phase 6 Role-safe History And Suppression Preserve Current Governance"} -->

The shared resolver MUST produce explicit allowlisted
`communication_timeline_staff`, `communication_timeline_donor` and
`communication_timeline_missionary` through the Phase 3 choke point and current
role/ownership/source access. Visibility MUST default fail-closed to `staff_only`;
only admitted `donor_visible`/`missionary_visible` items MAY reach those roles.
All projections MUST exclude bodies, transport addresses, personalized subjects,
raw consent JSON, raw provider payloads and raw identifiers; staff MAY receive a
safe consent summary. Portal projections MUST additionally exclude staff-only,
care and other-party data; missionary projections MUST exclude unauthorized
supporters and donor-private financial material. Tenant readers MUST NOT see
service-only platform history. Visibility or an identity/relation link MUST NOT
grant record access.

The intended staff slice MUST assemble communication items with existing Activity
history and a Communication filter. Projection/resolver/tests (#560), staff
assembly (#561) and donor/missionary read paths (#562) MUST remain planned until
proved by exact implementation evidence. Future portal UIs MUST reuse that safe
assembly in the donor-portal / missionary-workspace phase after demonstrated
allowed/denied producer slices; this docs foundation MUST NOT claim shipped UI.

Consent evidence MUST freeze the existing gate's actual versioned send-time
evaluation/inputs, not create another store or recompute at view time.
`email_suppressions` MUST retain authoritative distinct typed unsubscribe, bounce,
complaint and product suppression facts with provenance. Provider suppression
removal MUST NOT restore consent automatically. Future `isExportEligible` contact
export MUST consult current consent/suppression and governed Phase 3 projection/
export policy, not a historical allow snapshot.

Retention classes MUST distinguish official (at least seven years/prefer
permanent), operational and ephemeral history. Raw/prepared/Recent-copy evidence
MUST obey its separate bounded ceilings. Admitted erasure MUST irreversibly
redact communication PII while preserving separately owned immutable official
financial/document snapshots and purpose schedules. Disclosure-risk audit MUST
govern exports. GDPR/CPRA is a design baseline, not legal qualification; this
foundation MUST NOT implement erasure jobs.

Newsletter/Mailchimp, portal UI, SMS/push and bulk fan-out MUST remain reserved.
Mailchimp MUST be an integration seam, never an executable communication channel;
provenance vocabulary MUST NOT activate transport. Phase 17 MUST retain catalog/
content/preparation/provider ownership; recipient, financial/document and
provider qualification MUST remain separately owned dependencies. Synchronous
signed/idempotent ingestion MUST use database uniqueness/monotonic guards;
Inngest reconciliation and bounded proved backfill MUST NOT introduce an extra
asynchronous ingestion queue or activate reserved bulk.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
