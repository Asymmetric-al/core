# Delta for Outbound Communications

## ADDED Requirements

### Requirement: One Code-governed System-message Catalog Defines Every Supported Product Message

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

#### Scenario: A catalog contract is activated

- GIVEN a Reserved contract has every common proof and every channel-specific
  proof applicable to each step the exact generation declares executable
- WHEN an authorized release activates the exact catalog generation
- THEN the whole contract becomes Live idempotently with the proof bundle and
  actor recorded
- AND no step becomes independently or partially Live
- AND no database binding or provider template can independently make it Live

#### Scenario: A local-only in-product contract activates without Resend

- GIVEN a Reserved contract declares only executable `in_product` steps
- AND its common proofs plus local presentation, projection, presentation-end,
  recipient-access, event/history, and operational-readiness proofs pass
- AND the tenant has no Resend connection, sender profile, reply destination, or
  external transport
- WHEN an authorized release activates the exact catalog generation
- THEN the whole contract may become Live
- AND activation creates no provider requirement, prepared provider material,
  or external-delivery work

#### Scenario: An email step is not delivery-ready

- GIVEN a Reserved contract passes its common proofs
- AND the exact generation declares an executable external-email step
- AND any applicable sender, reply, Resend connection, sending-domain, transport,
  delivery, or outcome-reconciliation proof is missing
- WHEN an authorized release attempts activation
- THEN the whole contract remains Reserved
- AND no step becomes executable

#### Scenario: An uncataloged message is requested

- GIVEN product code or tenant configuration supplies no Live stable catalog key
- WHEN it attempts to create an external message or in-product notification
- THEN the request fails closed before recipient intent or delivery
- AND the platform records an actionable producer-owned integration failure

### Requirement: Message Contracts Bound Tenant Freedom Without Owning Business Truth

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

#### Scenario: Staff edits a required payment-failure message

- GIVEN the contract permits tenant-authored surrounding copy but owns the
  payment state, next action, and recipient authority
- WHEN authorized staff publishes new wording
- THEN the publication may change permitted copy and presentation
- AND it cannot remove, fabricate, or reinterpret the protected truth core

### Requirement: Complete Immutable Publications Resolve Deterministically

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

#### Scenario: A site locale override is missing

- GIVEN a Live contract permits tenant fallback policy and the exact site and
  requested locale has no compatible published variant
- WHEN an unprepared recipient message resolves
- THEN the versioned resolver selects the first complete compatible candidate
  under the tenant's published policy
- AND it records the full trace without mixing fragments or changing site identity

#### Scenario: A fallback-prohibited contract has no valid publication

- GIVEN the contract forbids fallback and its required publication is missing,
  invalid, or quarantined
- WHEN resolution runs
- THEN the message blocks or suppresses according to its contract
- AND it does not use a superficially similar prior, foreign-site, or system message

### Requirement: One Structured Document Produces Accessible Email Artifacts

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

#### Scenario: Staff publishes a visual message change

- GIVEN authorized staff edited an allowed complete structured document and its
  pinned presentation graph
- WHEN the exact candidate passes contract, accessibility, compiler, dependency,
  and review checks
- THEN the platform atomically publishes immutable source and artifacts
- AND production renders the same semantics and outputs that staff reviewed

### Requirement: Locale Activation Requires Contract-scoped Readiness

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

#### Scenario: A tenant activates a partially translated locale

- GIVEN the locale is standards-valid and some Live contracts use compatible
  fallback while a protected contract still needs a complete publication
- WHEN authorized staff activates the locale
- THEN the UI truthfully shows contract-scoped ready, fallback, and attention states
- AND no draft or incomplete protected message is treated as translated

### Requirement: Publication Review Is Proportional And Independent Where Required

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

#### Scenario: A protected publication changes after approval

- GIVEN an independent reviewer approved an exact protected candidate graph
- WHEN content, assets, dependencies, contract generation, or reviewer authority changes
- THEN the approval becomes stale and publication is blocked
- AND the existing Live version remains active

### Requirement: Trigger Bindings, Not Producers, Own Delivery Routing Identity

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

#### Scenario: A producer tries to choose a route

- GIVEN a generated producer entry point is bound to one immutable projection
- WHEN its payload supplies or changes a contract, plan, step, channel,
  publication slot, recipient role, resolver, or publication id
- THEN schema and server validation reject the command before persistence
- AND no caller-selected route can become an intent

### Requirement: Delivery Plans Are Bounded And Compile Through Channel-owned Seams

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

#### Scenario: A tenant enables a contract-permitted reminder

- GIVEN the producer contract offers one optional named reminder slot with a
  bounded delay and channel choice
- WHEN authorized staff publishes that plan selection and an eligible event occurs
- THEN Phase 6 receives a separate recipient-specific intent for the step
- AND the plan cannot perform arbitrary workflow or record-mutation behavior

#### Scenario: Plan compilation crashes between child writes

- GIVEN one occurrence resolves several applicable recipient-step bindings
- WHEN the compiler fails before its transaction commits
- THEN none of those children is dispatch-eligible or externally visible
- AND exact retry either commits the same complete set once or reports a hard
  identity conflict without partial release

#### Scenario: A plan occurrence has no applicable recipients

- GIVEN all optional steps are disabled, conditions are false, or every
  recipient resolver truthfully returns zero
- WHEN the bounded compiler commits the occurrence
- THEN one released zero-member header records the exact plan and reason digest
- AND exact replay returns empty while changed plan, role, contact, or membership
  under the same occurrence token hard-conflicts

#### Scenario: Two compilers race with different member sets

- GIVEN two requests reuse one plan-occurrence token with disjoint or changed
  candidate members
- WHEN they race to compile
- THEN the unique header lets at most one exact compilation commit
- AND the other hard-conflicts without appending, trimming, or releasing work

#### Scenario: A plan occurrence exceeds its finite bound

- GIVEN a generated binding or the global compiler ceiling permits fewer
  members than the resolved candidate set
- WHEN compilation runs
- THEN it fails before header or child persistence with a repair-visible reason
- AND it never truncates or chunks the logical occurrence

### Requirement: Protected Actions Remain Producer-owned And Scanner-safe

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

Protected actions MUST use either a producer capability with an inert Asym
explanation and deliberate single-use exchange, or an authenticated Asym service
doorway that re-proves current tenant, Party, role, resource, expiry,
revocation, and authorization. `GET`, `HEAD`, preview, scanner, and link-expander
traffic MUST have no business effect. Credentials and protected destinations
MUST NOT appear in editor state, logs, analytics, durable history, recent-copy
storage, or exported packages. Reissuance MUST create a successor communication
identity rather than mutating a prepared message.

The handoff MUST be no-store, no-referrer, and third-party-free. At startup, the
server MUST parse the configured `protectedActionOrigin` as one canonical HTTPS
origin and join it only to the code-owned exact `PROTECTED_ACTION_PATH`; tenant
input, request headers, and arbitrary configured paths MUST NOT participate. A
dedicated CSP-source serializer MUST produce `protectedActionSource` only when
the resulting `protectedActionUrl` parses and round-trips to that exact origin
and path, has no user information, wildcard, query, or fragment, and its source
token contains no raw comma, semicolon, ASCII control, whitespace, single quote,
double quote, or backtick. Invalid or non-round-tripping configuration MUST fail
readiness, and policy fixtures MUST parse the completed value back to the exact
directive/source map. For every landing and terminal response, the server MUST
generate at least 128 fresh random bits with a cryptographically secure
random-number generator, Base64-encode them as `nonce`, and serialize the
following exact policy value only after those checks:
`default-src 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; script-src 'none'; connect-src 'none'; img-src 'none'; font-src 'none'; media-src 'none'; worker-src 'none'; manifest-src 'none'; style-src 'nonce-${nonce}'; form-action ${protectedActionSource}`.
The serialization variables MUST be replaced and MUST never appear literally in
output. The response MAY use one server-rendered inline
`<style nonce="${nonce}">` block with the exact same response nonce; nonces MUST
NOT be reused across responses. Its form action MUST equal the exact
`protectedActionUrl`. It MUST have no style
attributes, scripts, external resources, analytics, or CSP report receiver. Only
POST to the exact server-configured action origin and exact server-owned route,
with method, CSRF/origin/Fetch-Metadata controls, current authorization, expected
state, idempotency, and contract-owned step-up, may mutate. The POST MUST return
its terminal response directly rather than redirect a secret-bearing submission
to another authority. Host/forwarded-host/query/fragment/tenant content MUST NOT
select an action origin, redirect, or authority. Every adopted Supabase Send
Email Hook action MUST have a
checked-in exact recipient/token/hash mapping, including secure and non-secure
email-change cases; raw Standard Webhooks signatures MUST be verified before
parse and the bounded hook deadline MUST use an already-published individual-send
path. Possible provider acceptance MUST remain indeterminate under the same
frozen identity.

Before rendering content, the first browser GET to an opaque-handle URL MUST
perform a server-side clean-URL exchange. The server MUST validate only the
short-lived, non-PII, minimally scoped, revocable handle, create a
non-authorizing landing session in a `Secure`, `HttpOnly`, path-scoped,
host-only `SameSite=Lax` cookie, and immediately return `303 See Other` to the exact
code-owned token-free landing path with no query or fragment. The exchange MUST
be safe to repeat, MUST NOT consume or redeem the producer credential, and MUST
grant no mutation authority. `HEAD` MUST create no session. The redirected GET
MAY render from the landing session; deliberate POST MUST still re-prove every
required tenant/recipient/source/action condition. JavaScript and
`history.replaceState` MUST NOT substitute for the server redirect.

`SameSite=Lax` MUST support the legitimate cross-site top-level navigation from
an email client and subsequent same-origin redirect without granting mutation
authority. A small bounded set of simultaneous short-lived non-authorizing
sessions MAY exist for one handle so scanner follows cannot invalidate a human
landing. Rate/cap enforcement MUST NOT consume the producer credential, mark the
action used, invalidate an existing valid session merely because another GET
arrived, or prevent later recovery/reissue. Terminal, expiry, replacement, and
revocation MUST clear every session for the handle.

The cookie MUST contain only a cryptographically random server-side session id,
MUST omit `Domain` so it is host-only, MUST use the exact landing/action `Path`,
and MUST have absolute expiry and `Max-Age` no later than the handle and action
authority. Server state MUST bind environment, scope tuple, handle digest,
protected-action kind, purpose, key version, expiry and revocation. Every render
MUST recheck those bindings; rotation MUST invalidate the prior session, and
terminal, expired, revoked or replaced authority MUST clear it. Tests MUST reject
sibling-subdomain cookie injection/tossing, stale sessions, wrong path/scope/
environment/action/purpose, and session survival after terminal state.
Real-browser fixtures MUST cover external-webmail and redirect-chain entry in
Chromium, WebKit, and Firefox plus repeated scanner/prefetch GETs, iframe and
cross-site POST attempts, human-session coexistence, cap/rate recovery, and
terminal clearing.

The product MUST prove that the current address, refresh, forward navigation,
form action, and outbound referrer contain no handle, secret, or PII; back
navigation MUST NOT redeem or mutate. It MUST redact handles and secret URL
material from product-controlled logs, analytics, support, tests, screenshots,
and browser telemetry. It MUST NOT claim to erase user-agent-managed prior
navigation entries, browser sync, mail-client history, clipboard contents, or
other records outside Asym control.

#### Scenario: An email scanner opens a protected link

- GIVEN a recipient message contains a producer-owned protected action
- WHEN a scanner or preview client issues `GET` or `HEAD`
- THEN no credential is redeemed and no source state changes
- AND only deliberate, currently authorized acceptance can perform the action

#### Scenario: A platform contract supplies a protected action

- GIVEN a platform-scoped contract or producer command contains a protected-
  action descriptor
- WHEN the contract or command is compiled
- THEN compilation fails before channel materialization or provider I/O
- AND no tenant Party, site, session, or invitation authority is inferred

#### Scenario: The protected landing attempts an external browser request

- GIVEN a protected-action landing is rendered with its per-response CSP nonce
- AND the nonce contains at least 128 bits from a cryptographically secure random
  source, differs from another response, and matches the sole inline style nonce
- AND the form action is the exact configured HTTPS origin plus code-owned route,
  whose CSP source survived delimiter rejection and policy round-trip with no
  literal serialization placeholder
- WHEN injected or accidental content attempts script, fetch, beacon, image,
  font, frame, external style, or CSP-report traffic
- THEN the browser policy blocks every request
- AND `form-action` permits form submission only by the deliberate POST to the
  server-configured action origin and code-owned route
- AND it does not constrain ordinary browser navigation, so exact route, method,
  origin, Fetch Metadata, CSRF, authorization, and state checks remain
  authoritative

### Requirement: In-product Notifications Are One Role-safe Attention Projection

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

#### Scenario: A recurring occurrence becomes terminally missed

- GIVEN Phase 16 marks one recurring occurrence terminally `Missed` and the
  missionary remains authorized to see its designation-safe support state
- AND `recurring_occurrence_missed_v1` is Live in the pinned activation
  generation with its complete source, recipient, presentation, and proof bundle
- WHEN the required in-product step is eligible
- THEN the existing notification model presents one grouped, privacy-safe
  terminal-miss notice without attempt, retry, decline, or payment-method detail
- AND reading or archiving the notice does not change the recurring arrangement
  or create an outreach task

#### Scenario: Reserved recurring meanings create no communication work

- GIVEN `recurring_schedule_changed_v1` and
  `recurring_occurrence_missed_v1` are Reserved in the current catalog generation
- WHEN Phase 16 successfully applies a schedule amendment or marks an occurrence
  terminally `Missed`
- THEN Phase 16 preserves its source-owned confirmation and role-safe recurring
  or dashboard projection
- AND no Phase 6 plan-occurrence header, child intent, `communication_event`,
  in-product notification item, prepared material, or provider work is created
- AND a later Live activation does not catch up either historical transition

#### Scenario: Required work remains open after the notification is read

- GIVEN a required source-actionable approval item is unread and its exact
  source request remains pending
- WHEN the recipient reads the item
- THEN its unread badge clears but it remains in **Needs attention**
- AND archive is unavailable with a plain-language explanation because only the
  source can end the required work

#### Scenario: Source work resolves before or after first view

- GIVEN a source-actionable item remains authorized
- WHEN its exact producer source reaches a mapped terminal state
- THEN active attention ends atomically and the item becomes non-unread recent
  history for at most 90 days from the once-set end instant
- AND if it was unseen, no unread debt or fabricated read is created
- AND after the ceiling it is absent from user-facing queries while body-free
  audit remains

#### Scenario: An informational outcome ages out predictably

- GIVEN an approval outcome uses the informational presentation policy
- WHEN 30 days pass after availability without earlier read or archive
- THEN unread treatment has ended and the item remains only ordinary recent
  history
- AND at 90 days it is absent from user-facing queries

#### Scenario: Recipient authority is lost

- GIVEN an active or recent notification is bound to one exact Party and role
- WHEN that access revision is revoked
- THEN list, count, detail, cache, cursor, and realtime reads remove it
  immediately
- AND later authority does not revive the old recipient projection

### Requirement: SMS Governance Is Evidence-ready While Transport Is Unavailable

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

#### Scenario: A tenant has imported SMS consent evidence

- GIVEN valid historical provenance is stored for a tenant and Party
- WHEN a user or system tries to enable an SMS message step in Phase 17
- THEN the operation remains unavailable because platform transport is disabled
- AND the evidence is preserved without creating an executable send path

### Requirement: Every Tenant Uses Its Own Proved Resend Connection And Delivery Identity

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

#### Scenario: A tenant rotates its Resend API key

- GIVEN prepared messages exist under the prior proved connection revision
- WHEN authorized staff completes server-side proof and activates a replacement
- THEN future preparations use the new revision and existing evidence retains
  the old non-secret identity
- AND no prepared message silently swaps credentials or provider account

### Requirement: Platform-scoped Email Uses The Same Governed Spine Without Impersonating A Tenant

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
MUST use a same-tenant Party/contact revision and tenant connection/profile and
MUST leave platform-authority fields null. Platform recipient authority MUST be
a closed mutually exclusive union. Platform v1 MUST admit exactly
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
authority revision, and delivery-profile revision. The tenant branch uses exact
Party/contact and tenant connection/profile revisions; the platform branch uses
exact platform-recipient authority and fixed platform connection/profile
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

#### Scenario: Eve requests email before an exact contract exists

- GIVEN the current manifest generation contains no Eve platform email key
- WHEN Eve requests an email handoff
- THEN the request is rejected before a Phase 6 intent or provider operation
- AND no generic alert key, tenant fallback, or uncataloged publication is used

#### Scenario: Eve requests a platform-owner email and Discord alert

- GIVEN Eve policy permits one governed event for a verified platform owner and
  an approved Discord operational destination
- AND a later manifest generation contains the exact meaning-specific Live Eve
  email key, source fence, fixed platform profile, and passed proof pack
- WHEN the eligible channel actions are created
- THEN the email becomes a platform-scoped Phase 6 intent under an exact Live
  Phase 17 contract and the Asym platform Resend connection
- AND Discord remains an Eve-owned operational delivery with separate evidence
- AND neither channel can select tenant scope, create a second email lifecycle,
  or treat Discord as communication history

#### Scenario: Customer-account security mail lacks a recipient branch

- GIVEN a platform producer requests customer-account bootstrap or security mail
- AND no separately ratified app-account recipient-authority branch and exact
  Live contract exist
- WHEN intent resolution runs
- THEN the request fails before intent creation
- AND it cannot borrow an Eve authority, tenant identity, arbitrary address, or
  platform connection alone as delivery authorization

#### Scenario: A caller tries to cross the tenant/platform boundary

- GIVEN a platform intent carries a tenant, Party, contact, tenant publication,
  tenant connection, or tenant relation, or a tenant intent carries a platform
  authority or platform connection
- WHEN the intent or any downstream child/result row is inserted or attached
- THEN database CHECK and scope-aware foreign-key constraints reject it
- AND no provider request, history row, tenant-visible record, or fallback send
  is created

### Requirement: Preparation And Recovery Preserve One Recipient-specific Identity

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

#### Scenario: An exact plan-occurrence command is replayed

- GIVEN one released plan occurrence already owns its complete authorized member
  set, including the possible zero-member case
- WHEN the producer repeats the one complete command with the same parent/member
  tokens and every parent/member comparison hash and schema version matches
- THEN the transaction returns the existing released parent and canonical member
  set
- AND it creates no second parent, recipient intent, preparation, or provider
  request

#### Scenario: A producer reuses a parent or member slot with changed input

- GIVEN one plan-occurrence or member slot already belongs to released work
- WHEN the same token resolves to any changed plan, membership, identity,
  recipient, channel step, fact, relation, order, action, or timing bound
- THEN the transaction fails with a hard idempotency conflict
- AND legitimate corrected or successor work requires the applicable new
  producer-authorized parent and member occurrence-slot tokens

Recovery MUST distinguish unprepared, prepared and definitely unsubmitted, and
provider submission may have begun. Only an unprepared message may use another
complete compatible publication, and only when its contract permits that
whole-message recovery. A definitely unsubmitted message may retry only its
identical frozen payload while current safety fences pass. A possibly submitted
message MUST become indeterminate and reconcile using signed provider evidence;
it MUST NOT rerender, select fallback, change identity/account, or use a new
occurrence slot, semantic identity, or provider-submission request key. Provider idempotency is a secondary bounded
transport safeguard, not product outcome truth.

The versioned Resend adapter MUST use one exhaustive code-owned classifier with
the closed definite-rejection retry classes `retry_after_backoff`,
`retry_after_quota_reset`, `retry_after_configuration_repair`, and
`non_retryable`. It MUST map recognized rate limits to backoff,
daily/monthly quotas to quota reset, proved credential/domain/sender readiness
failures to configuration repair, proved request-shape/validation failures to
non-retryable. `invalid_idempotent_request` MUST become indeterminate cause
`idempotency_payload_conflict` because a different payload may already have been
accepted under that key. It MUST be quarantined and MUST NOT enter same-key
retry, rekey, replay, or any definite-rejection repair transition. Reconciliation
MAY mark it accepted only when provider/local evidence binds the accepted
provider payload to the exact frozen bytes/hash and membership; a proved
different payload remains a data-integrity incident and requires a new
legitimate producer event rather than transport replay.
Provider error type `concurrent_idempotent_requests` MUST normalize to the
intentionally singular internal cause `concurrent_idempotent_request` for one
sealed envelope. That provider type, `5xx`, network/timeout, malformed or missing
codes, unknown codes, and contradictory evidence MUST remain indeterminate under
closed cause codes; nothing unknown may default to a retryable definite
rejection.

The classifier key MUST include the closed operation (`send_email`,
`send_batch`, or side-effect-free `probe_domains`), HTTP status, exact documented
error type, pinned normalized reason fixture where one type is reused, and
current locally proved context. Free-text substring matching MUST NOT classify
an outcome. The pinned baseline error union MUST contain exactly
`invalid_idempotency_key`, `validation_error`, `missing_api_key`,
`restricted_api_key`, `invalid_api_key`, `not_found`, `method_not_allowed`,
`invalid_idempotent_request`, `concurrent_idempotent_requests`,
`invalid_attachment`, `invalid_from_address`, `invalid_access`,
`invalid_parameter`, `invalid_region`, `missing_required_field`,
`monthly_quota_exceeded`, `daily_quota_exceeded`, `rate_limit_exceeded`,
`security_error`, `application_error`, and `internal_server_error`. Any added
operation, status/type/reason tuple, SDK/API pin, or official catalog type MUST
fail the exhaustive build fixture until the classifier and evidence are
versioned together.

The exact baseline dispositions MUST be:

- exact send 2xx ids/member mapping is accepted; malformed or incomplete 2xx is
  indeterminate, and permissive batch member errors are classified individually
  only through exact unique indexes;
- `probe_domains` 2xx proves an overprivileged key and blocks activation, while
  its exact 401 `restricted_api_key` fixture is only least-privilege evidence
  pending a controlled sender canary;
- send 400 `invalid_idempotency_key` or a 400 `validation_error` matched to a
  pinned request-shape reason, 404 `not_found`, 405 `method_not_allowed`, and
  send 422 `invalid_attachment`,
  `invalid_from_address`, or `missing_required_field` are definitely rejected
  `non_retryable` and create the applicable adapter/content/config defect;
- 401 `missing_api_key` and 403 `invalid_api_key` are definitely rejected
  `retry_after_configuration_repair` for sends and incomplete proof for the
  connection probe;
- send 403 `validation_error` is definitely rejected
  `retry_after_configuration_repair` only when both a pinned
  testing/domain/sender-readiness reason fixture and matching local proof exist;
  an unmatched 400/403 `validation_error` or send 401 `restricted_api_key` is
  indeterminate `provider_contract_drift`;
- adopted-operation 422 `invalid_access`, `invalid_parameter`, or
  `invalid_region` is indeterminate `provider_contract_drift` because those
  tuples are outside every adopted operation contract;
- send 429 `rate_limit_exceeded` is definitely rejected
  `retry_after_backoff`; send 429 `daily_quota_exceeded` or
  `monthly_quota_exceeded` is definitely rejected
  `retry_after_quota_reset`;
- send 451 `security_error` is definitely rejected `non_retryable` and enters
  security quarantine with no automatic retry;
- send 500 `application_error` or `internal_server_error` is indeterminate
  `provider_5xx`; and
- network/timeout, malformed/missing type, an unlisted or contradictory tuple,
  or any exact tuple not covered above is one closed indeterminate cause and
  MUST NOT grant a definite-rejection transition, new attempt, rekey, or replay.

Only `concurrent_idempotent_request`, exact typed `provider_5xx` from
`application_error`/`internal_server_error`, and `network_or_timeout` with an
exact sealed request and no contradictory evidence MAY make an identical
same-key provider call. One sealed envelope permits at most two such follow-up
HTTP calls after the initial call in total. Each call MUST use the same endpoint,
bytes, order, headers, account/credential, member map, and request key; honor a
valid bounded `Retry-After` when present; use bounded exponential backoff with
full jitter; recheck the live safety/decrypt fence; and occur before both its
earliest member deadline and the pinned Resend idempotency-window expiry. It is
the same envelope/attempt, not a new attempt ordinal. Exact evidence MUST be
reconciled before another call whenever available, and acceptance or definite
rejection MUST stop the loop.

`batch_mapping_indeterminate`, `idempotency_payload_conflict`,
`malformed_or_missing_provider_code`, `unknown_provider_code`,
`contradictory_provider_evidence`, and `provider_contract_drift` MUST be
reconcile-only/quarantined and MUST NOT call the provider again. Any unresolved
indeterminate envelope after its call bound or provider window MUST remain
**Delivery outcome unknown** and MUST NOT be replaced under another key.

#### Scenario: A reused Resend error type has different meanings

- GIVEN Resend returns `validation_error` for one 400 request-shape fixture and
  one 403 domain-readiness fixture
- WHEN the exhaustive classifier evaluates operation, status, pinned reason,
  and current local proof
- THEN the 400 result is definitely rejected `non_retryable`
- AND the 403 result is `retry_after_configuration_repair` only when its reason
  and local readiness context agree
- AND an unmatched or contradictory tuple remains indeterminate

#### Scenario: Resend reports a conflicting idempotency payload

- GIVEN a frozen provider request receives `invalid_idempotent_request`
- WHEN the provider outcome is reduced
- THEN it becomes quarantined indeterminate cause
  `idempotency_payload_conflict`
- AND no same-key retry, new-key replay, or definite-rejection repair is
  authorized
- AND only exact provider/local payload correlation may prove acceptance; a
  different or unresolved payload remains a data-integrity incident

Before external-delivery I/O, the executor MUST seal one encrypted
prepared-delivery artifact and one immutable provider-submission envelope
containing the exact endpoint,
connection/credential, serialized request bytes/hash, one request-level
idempotency key, and a contiguous ordered recipient-member map. Strict 2–100
member batches MAY optimize compatible work, but every member retains
recipient-specific truth and mapping uncertainty becomes indeterminate. The
same Phase 6 queue owns single and batch work; no second batch queue exists.

Before provider I/O, every external-delivery recipient member MUST also receive
one permanent internal provider-message identity. Provider acceptance MUST attach the Resend
email id under a unique `{scope_kind, scope_owner_id, connection_revision,
provider_email_id}` correlation. The opaque signed-webhook route MUST verify one
connection revision first and derive scope/owner from it; recipient address,
name, tag, or payload metadata MUST never select scope or attachment. This
minimal identity and signed evidence MUST survive recipient-PII/provider-byte
purge so late or reordered events remain attachable. A lost response without a
provider id MUST reconcile from the sealed request/member digest and attempt
fence, never an address search; unresolved evidence is quarantined.

Every expanded contract MUST map each delivery step to exactly one closed
material posture. An external-delivery step MUST map to a prepared-artifact
retention class, and seal time MUST freeze a nonextendable restricted-material
purge deadline as the earliest class ceiling, intent/utility expiry,
protected-action expiry and source-owned shorter limit. The initial external
classes MUST be required email with a 30-day ceiling and optional staff email
with a 7-day ceiling. An `in_product` step MUST map to the explicit
`prepared.none@1` no-artifact sentinel and MUST structurally create no prepared
artifact or provider bytes. Future Live contracts MUST declare and
prove the exact per-step mapping rather than inherit one accidentally. A batch request MUST
use the earliest member deadline and MUST NOT extend any member.

Exact acceptance, terminal definite rejection, terminal no-send, the end of the
pinned provider idempotency window for an indeterminate request, or the frozen
deadline MUST immediately deny decryption and start terminal purge. Primary
ciphertext, wrapped keys and plaintext-capable caches MUST purge within 24 hours
with content-free evidence. Provider truth, ids and hashes MUST remain body-free;
an indeterminate outcome MAY remain unknown but MUST NOT retain replay or body
restoration authority. Purge and submit/webhook/cancel/erasure/worker races MUST
use the same state-version and safety fences, with privacy restriction winning
readability without rewriting provider outcome.

Failures MUST carry a typed owner and precise quarantine scope. One grouped
repair surface MUST explain root cause, affected counts, last-known-good state,
and the primary permanent action. Proof-gated backlog recovery MUST recheck
current eligibility and resume only eligible unprepared work, prepared work
proved definitely unsubmitted, or work proved definitely rejected when the
exact contract permits that new attempt. It MUST record per-recipient results
and exclude completed or accepted, no-longer-applicable, still-blocked, and
indeterminate work. An indeterminate submission MUST reconcile under its frozen
identity and MUST NOT be bulk replayed.

Whole-message recovery order MUST be normal candidate, one compatible prior
when explicitly allowed, remaining complete candidates under the published
fallback policy, a compatible protected Asym system default when explicitly
allowed, independent sibling steps, then truthful stop. Quarantine MUST use only
`New preparation only` or `Revoke unsubmitted` with safety-epoch and dispatch CAS.
Publish-and-resume preflight MUST separately classify unprepared,
prepared-definitely-unsubmitted, definitely rejected and contract-retryable,
completed, no-longer-applicable, blocked, and indeterminate work.

Resend batching MAY optimize transport only. Each recipient MUST retain its own
intent, prepared identity, consent/suppression decision, payload, provider
evidence, outcome, history, and recovery state. Batch grouping MUST never cross
scope owner, connection, sender, or incompatible payload authority, and one recipient
failure MUST NOT rewrite others.

#### Scenario: A forced drain contains 101 compatible due members

- GIVEN 101 otherwise-compatible, locally valid, under-byte external-delivery
  members are due in canonical order
- WHEN the assembler is forced to drain without another earlier flush cause
- THEN members 1–100 form one `/emails/batch` envelope at indices 0–99
- AND member 101 forms one governed `/emails` single envelope at index 0
- AND the envelopes have distinct sealed bytes, digests, request keys, and member
  maps, while every intent appears exactly once
- AND recovery or indeterminate state remains envelope-local
- AND no member is truncated, over-submitted, duplicated, or moved across scope,
  account, credential, domain, sender, reply, safety, latency, or endpoint-
  capability boundaries

#### Scenario: Provider submission times out

- GIVEN a prepared message may have crossed the Resend submission boundary
- WHEN the worker receives no definitive response
- THEN the message is recorded as indeterminate and reconciled under the same identity
- AND the closed policy may make at most two follow-up calls with the identical
  sealed envelope and same request key inside the provider window
- AND no fallback, rerender, sender change, new attempt ordinal, new key, or
  unbounded duplicate submission occurs
- AND absent exact outcome proof it remains **Delivery outcome unknown**

#### Scenario: An indeterminate request outlives provider idempotency

- GIVEN a sealed provider request remains indeterminate when the pinned Resend
  idempotency window ends
- WHEN its restricted-material terminal trigger is reduced
- THEN decryption is denied immediately and primary provider-bound material is
  purged within 24 hours
- AND body-free **Delivery outcome unknown** evidence remains
- AND the request cannot be replayed, restored from another store, or replaced
  under a new idempotency key

### Requirement: Communication History Is Durable Evidence Without A Body Archive

Durable communication events MUST remain body-free and retain `scope_kind` plus
exactly one scope owner. Tenant events MUST retain `tenant_id` and only permitted
site/Party/contact-revision references; platform events MUST retain
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

#### Scenario: Support opens a recent sent copy

- GIVEN an eligible tenant copy is unexpired and the current actor retains exact
  tenant, role/capability, recipient Party/contact revision, source/site,
  privacy, restriction/erasure, and expiry authority
- WHEN the actor deliberately reveals it from communication history
- THEN the support-safe copy is shown and a content-free access audit is recorded
- AND it is not treated as delivery proof or an official document

#### Scenario: Source access remains but recipient authority is revoked

- GIVEN staff may still access the related fund or source record
- AND exact authority for the recipient Party or contact revision has been
  revoked
- WHEN staff attempts to reveal the Recent sent copy
- THEN access is denied and a content-free denial audit is recorded
- AND no personalized content is decrypted or returned

### Requirement: System-message Portability Is Versioned And Destination-owned

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

#### Scenario: A tenant accepts a cross-tenant package

- GIVEN the source authorized an export and an authorized destination actor
  accepts the exact package
- WHEN destination mapping and validation complete
- THEN the destination receives quarantined drafts and explicit loss/conflict evidence
- AND no source tenant authority, credential, recipient data, or Live binding transfers

### Requirement: System Messages Provides A Safe, Observable, Accessible Staff Product

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

#### Scenario: Scope-aware authorization rejects caller-selected ownership

- GIVEN a caller supplies a tenant id, platform scope, recipient address, or
  authority id that differs from server-derived context
- WHEN a System Messages read or mutation is authorized
- THEN the supplied ownership fields grant no authority and the request fails
  closed
- AND no cross-scope row, provider operation, cache entry, or history result is
  exposed

#### Scenario: A valid platform command has no tenant

- GIVEN a verified service command derives the exact platform scope and current
  contract-declared `eve_platform_owner` authority
- WHEN it accesses an authorized platform resource with tenant/site/Party fields
  null
- THEN the service-only platform predicates may authorize it
- AND the same resource remains unreadable and unmodifiable to every tenant or
  client role

#### Scenario: An authorized staff member repairs a broken required message

- GIVEN a grouped case identifies one typed root cause and affected scope
- WHEN staff follows the primary action and publishes or proves the permanent fix
- THEN eligible unprepared and prepared-definitely-unsubmitted work can enter
  proof-gated recovery
- AND work proved definitely rejected may receive only the exact contract-
  permitted new attempt
- AND the UI reports exact repaired, still blocked, suppressed, indeterminate,
  accepted/submitted, and rejected-retry counts without recipient noise or
  hidden replay
- AND accepted or indeterminate work is never bulk replayed
