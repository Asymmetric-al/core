# Delta for Outbound Communications

## ADDED Requirements

### Requirement: Phase 6 Is The First Build Of The Existing Communications Capability

Phase 6 MUST be the **first build** of Mission Control's already-declared **communications** capability, extending this outbound-communications delta and one communication spine rather than creating a duplicate capability/history or competing Phase 17 design.

Every clause in `openspec/contracts/outbound-communications.md#contract-3688a40e99438928d1c1` MUST apply without exception.

#### Scenario: A multi-hat Party receives a business email

- GIVEN an admitted same-tenant Party/contact revision and linked donor/missionary identities
- WHEN the sole gateway captures the real-recipient dispatch
- THEN one body-free interaction event and its same-scope relations are bound atomically
- AND compatibility identities resolve to that same Party rather than duplicate history

#### Scenario: Signed evidence has no exact scoped correlation

- GIVEN a verified connection revision and an unresolved or crossed provider-message identity
- WHEN synchronous signed/idempotent ingestion reduces the evidence
- THEN it quarantines minimized evidence without fabricating communication history
- AND only later proved same-scope attachment may reconcile it without terminal regression

#### Scenario: Legacy delivery consumers have not converged

- GIVEN a reader, writer, webhook lookup, reconciliation job or FK still depends on legacy email shape
- WHEN a cutover attempts to declare canonical-only authority
- THEN the missing disposition blocks the flip and writer removal
- AND permanent Support Hub/member-care payload ownership remains unchanged

### Requirement: Phase 6 Role-safe History And Suppression Preserve Current Governance

The shared resolver MUST produce explicit allowlisted `communication_timeline_staff`, `communication_timeline_donor` and `communication_timeline_missionary` through the Phase 3 choke point and current role/ownership/source access.

Every clause in `openspec/contracts/outbound-communications.md#contract-c2b5dc5bdf473fd72edc` MUST apply without exception.

#### Scenario: A portal reader lacks current source admission

- GIVEN a donor or missionary with a linked identity but revoked or absent source access
- WHEN the role-safe timeline resolves
- THEN it omits the record and all staff-only/care/other-party/raw evidence
- AND a visibility flag cannot widen current Phase 3 record access

#### Scenario: Historical consent allowed a now-suppressed contact

- GIVEN an immutable send-time allow snapshot and current authoritative suppression
- WHEN a future contact-export eligibility check runs
- THEN current consent/suppression and export policy deny the export
- AND neither provider removal nor the historical snapshot restores consent

#### Scenario: A future portal phase consumes the planned staff pattern

- GIVEN exact allowed/denied implementation evidence for the projection/resolver, staff slice and read paths
- WHEN the donor-portal or missionary-workspace phase implements communication UI
- THEN it consumes its matching governed timeline and shared Activity assembly
- AND reserved integrations and independent financial/document/provider owners remain gated

### Requirement: One Code-governed System-message Catalog Defines Every Supported Product Message

The platform MUST maintain one executable, versioned catalog of system-message contracts for every platform/system-generated email or in-product message and, after its separate activation gate, SMS message.

Every clause in `openspec/contracts/outbound-communications.md#contract-a5d44d364aef4a3ce44c` MUST apply without exception.

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

Producing domains MUST own event meaning, eligibility, current source facts, recipient authority, requiredness, business timing and cancellation fences, official document truth, protected actions, and completion state.

Every clause in `openspec/contracts/outbound-communications.md#contract-8e07a4b40d95682d87fc` MUST apply without exception.

#### Scenario: Staff edits a required payment-failure message

- GIVEN the contract permits tenant-authored surrounding copy but owns the
  payment state, next action, and recipient authority
- WHEN authorized staff publishes new wording
- THEN the publication may change permitted copy and presentation
- AND it cannot remove, fabricate, or reinterpret the protected truth core

### Requirement: Complete Immutable Publications Resolve Deterministically

Each message/channel/locale variant MUST publish as one complete immutable publication.

Every clause in `openspec/contracts/outbound-communications.md#contract-9c4c617a341b327f8bc9` MUST apply without exception.

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

One versioned Asym-structured document MUST be the canonical source for each complete email publication.

Every clause in `openspec/contracts/outbound-communications.md#contract-32f88635c5749980da84` MUST apply without exception.

#### Scenario: Staff publishes a visual message change

- GIVEN authorized staff edited an allowed complete structured document and its
  pinned presentation graph
- WHEN the exact candidate passes contract, accessibility, compiler, dependency,
  and review checks
- THEN the platform atomically publishes immutable source and artifacts
- AND production renders the same semantics and outputs that staff reviewed

### Requirement: Locale Activation Requires Contract-scoped Readiness

Tenants MUST be able to activate any canonical human-language locale in the version-pinned IANA/Unicode standards catalog for system messages without an Asym approval queue or curated launch allow-list.

Every clause in `openspec/contracts/outbound-communications.md#contract-2493e1e8271730955cdf` MUST apply without exception.

#### Scenario: A tenant activates a partially translated locale

- GIVEN the locale is standards-valid and some Live contracts use compatible
  fallback while a protected contract still needs a complete publication
- WHEN authorized staff activates the locale
- THEN the UI truthfully shows contract-scoped ready, fallback, and attention states
- AND no draft or incomplete protected message is treated as translated

### Requirement: Publication Review Is Proportional And Independent Where Required

All drafts MUST support synthetic-data preview, diff, impact explanation, test, commit, immutable publish, restore-as-new-draft, and audit.

Every clause in `openspec/contracts/outbound-communications.md#contract-e6c7e9db4ba3f681e57c` MUST apply without exception.

#### Scenario: A protected publication changes after approval

- GIVEN an independent reviewer approved an exact protected candidate graph
- WHEN content, assets, dependencies, contract generation, or reviewer authority changes
- THEN the approval becomes stale and publication is blocked
- AND the existing Live version remains active

### Requirement: Trigger Bindings, Not Producers, Own Delivery Routing Identity

Every producer MUST enter through a generated, server-only trigger binding.

Every clause in `openspec/contracts/outbound-communications.md#contract-ca182e2f10e54317f524` MUST apply without exception.

#### Scenario: A producer tries to choose a route

- GIVEN a generated producer entry point is bound to one immutable projection
- WHEN its payload supplies or changes a contract, plan, step, channel,
  publication slot, recipient role, resolver, or publication id
- THEN schema and server validation reject the command before persistence
- AND no caller-selected route can become an intent

### Requirement: Delivery Plans Are Bounded And Compile Through Channel-owned Seams

A message contract MUST define fixed named step slots and the permitted step/channel/delay/escalation envelope; the contract is not itself the effective Delivery Plan.

Every clause in `openspec/contracts/outbound-communications.md#contract-d3dc1377adc6dfeef79b` MUST apply without exception.

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

### Requirement: Protected Actions Remain Producer-owned And Scanner-resistant

Protected actions MUST be tenant-scope-only in this generation and MUST bind one exact Party/contact authority.

Every clause in `openspec/contracts/outbound-communications.md#contract-ff11d25cc28b0477f45a` MUST apply without exception.

#### Scenario: An email scanner opens a protected link

- GIVEN a recipient message contains a producer-owned protected action
- WHEN a scanner or preview client issues `GET` or `HEAD`
- THEN no credential is redeemed and no source state changes
- AND only deliberate, currently authorized acceptance can perform the action

#### Scenario: An advanced scanner executes the landing page

- GIVEN a scanner executes the pinned bootstrap script or submits the verifier
  form
- WHEN the platform records the bootstrap or grants a non-authorizing landing
  session
- THEN it does not label the event human, opened, read, accepted, or completed
- AND the producer action still requires its current contract-owned confirmation,
  authorization, expected-state, and idempotency proofs

#### Scenario: A platform contract supplies a protected action

- GIVEN a platform-scoped contract or producer command contains a protected-
  action descriptor
- WHEN the contract or command is compiled
- THEN compilation fails before channel materialization or provider I/O
- AND no tenant Party, site, session, or invitation authority is inferred

#### Scenario: The protected landing attempts an external browser request

- GIVEN a protected-action landing is rendered with its per-response CSP nonce
- AND the nonce contains at least 128 bits from a cryptographically secure random
  source, differs from another response, and matches the sole inline script and
  style nonces
- AND the form action is the exact same-origin code-owned route with no literal
  serialization placeholder
- WHEN injected or accidental content attempts any unpinned script, fetch,
  beacon, image, font, frame, external style, or CSP-report traffic
- THEN the browser policy blocks every request
- AND the sole pinned script can only prepare the fragment verifier for the
  recipient's deliberate same-origin form POST
- AND exact route, method, Origin, Fetch Metadata, CSRF, authorization, and state
  checks remain authoritative

#### Scenario: A supported mail client strips the verifier fragment

- GIVEN a protected-action notice is opened with its non-secret selector but no
  valid fragment verifier
- WHEN the landing route receives GET, HEAD, refresh, or a submit attempt
- THEN it reveals no protected facts, creates no authorized session, and consumes
  no credential or grant
- AND it offers only the generic recovery route with no path, query, cookie, or
  raw-selector secret fallback

#### Scenario: A protected response crosses the production edge

- GIVEN any protected landing, redirect, error, session, or terminal response
- WHEN the response traverses the actual Vercel and CDN configuration
- THEN it retains `Cache-Control: private, no-store, no-transform, max-age=0`,
  `CDN-Cache-Control: no-store`, and `Vercel-CDN-Cache-Control: no-store`
- AND no cache, transform, stale response, optimizer, or service worker handles
  it

### Requirement: In-product Notifications Are One Role-safe Attention Projection

The platform MUST use one Asym/Postgres notification item, grouping, and engagement model.

Every clause in `openspec/contracts/outbound-communications.md#contract-fe1ca6dc3c23f008dfa0` MUST apply without exception.

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

Phase 17 MUST reserve provider-neutral SMS vocabulary and append-only evidence while platform SMS transport remains structurally unavailable.

Every clause in `openspec/contracts/outbound-communications.md#contract-d0173aba976d190cf46b` MUST apply without exception.

#### Scenario: A tenant has imported SMS consent evidence

- GIVEN valid historical provenance is stored for a tenant and Party
- WHEN a user or system tries to enable an SMS message step in Phase 17
- THEN the operation remains unavailable because platform transport is disabled
- AND the evidence is preserved without creating an executable send path

### Requirement: Every Tenant Uses Its Own Proved Resend Connection And Delivery Identity

Every tenant MUST own one Resend account/team, one proved transactional domain, and one revisioned connection aggregate.

Every clause in `openspec/contracts/outbound-communications.md#contract-5121b0acf09ee7af56dc` MUST apply without exception.

#### Scenario: A tenant rotates its Resend API key

- GIVEN prepared messages exist under the prior proved connection revision
- WHEN authorized staff completes server-side proof and activates a replacement
- THEN future preparations use the new revision and existing evidence retains
  the old non-secret identity
- AND no prepared message silently swaps credentials or provider account

### Requirement: Platform-scoped Email Uses The Same Governed Spine Without Impersonating A Tenant

Platform-scoped system email MUST use one separately proved Asym-owned Resend connection and domain, an Asym-fixed publication, verified platform recipient authority, Phase 17 compiler/profile proofs, and the same Phase 6 preparation, idempotency, provider-event, recovery, and body-free history contracts as tenant email.

Every clause in `openspec/contracts/outbound-communications.md#contract-b2d69f7e799977aae3b6` MUST apply without exception.

#### Scenario: Eve requests email before an exact contract exists

- GIVEN the current manifest generation contains no Eve platform email key
- WHEN Eve requests an email handoff
- THEN the request is rejected before a Phase 6 intent or provider operation
- AND no generic alert key, tenant fallback, or uncataloged publication is used

#### Scenario: A tenant sends to an authorized non-constituent

- GIVEN a tenant contract resolves an exact non-constituent no-Party
  recipient-authority branch and the matching tenant connection/profile
- WHEN Phase 6 prepares, sends, and records the communication
- THEN the send uses that closed authority branch without creating a Party or
  contact record
- AND the address exists only in encrypted, short-lived prepared-delivery
  material while durable execution and history retain only the body-free
  scope-safe authority/reference

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

Every recipient/channel intent MUST preserve one independent semantic member identity plus exact source fact/snapshot, contract and plan step, audience, locale and fallback trace, content publication, Brand Kit, Role Layout, renderer/formatter/compiler, protected-action reference, and recent-copy posture.

Every clause in `openspec/contracts/outbound-communications.md#contract-bf549721606927f0b370` MUST apply without exception.

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

Durable communication events MUST remain body-free and retain `scope_kind` plus exactly one scope owner.

Every clause in `openspec/contracts/outbound-communications.md#contract-3b056f19245e71401bee` MUST apply without exception.

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

The platform MUST export a native versioned Asym package with the complete selected content, configuration, dependency, version, hash, provenance, and inert synthetic-output closure.

Every clause in `openspec/contracts/outbound-communications.md#contract-f675c93c13333e234db5` MUST apply without exception.

#### Scenario: A tenant accepts a cross-tenant package

- GIVEN the source authorized an export and an authorized destination actor
  accepts the exact package
- WHEN destination mapping and validation complete
- THEN the destination receives quarantined drafts and explicit loss/conflict evidence
- AND no source tenant authority, credential, recipient data, or Live binding transfers

### Requirement: System Messages Provides A Safe, Observable, Accessible Staff Product

Mission Control MUST provide one System Messages workspace organized around understandable catalog message names and statuses, not tables or provider jargon.

Every clause in `openspec/contracts/outbound-communications.md#contract-c7a9a80e904f4c249cd8` MUST apply without exception.

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

### Requirement: Phase 3 Cross-channel Consent Gates Recipient Delivery

Existing staff/system-initiated outbound contact and governed contact-list egress MUST consume one fail-closed canonical Party/contact-point consent boundary. `do_not_contact` MUST remain the absolute contact floor; email MUST additionally honor `do_not_email`, `email_suppressions` and known blocking provider evidence.

Every clause in `openspec/contracts/outbound-communications.md#contract-f6de91cd9bf7f38061a9` MUST apply without exception.

#### Scenario: Permitted existing email delivery proceeds through its owner

- **GIVEN** current recipient/contact-point authority and applicable email consent pass
- **WHEN** a qualified existing email delivery resolves and reaches the send seam
- **THEN** the current gate permits only the intended recipient's admitted facts
- **AND** Phase 17 preparation and Phase 6 dispatch retain their separate ownership

#### Scenario: Opt-out blocks contact across existing egress doors

- **GIVEN** a recipient has do_not_contact or email-specific suppression
- **WHEN** staff/system request an affected delivery or governed contact-list export
- **THEN** the applicable contact is blocked fail-closed and audited with identifiers only
- **AND** another serializer or channel path cannot bypass the canonical decision

#### Scenario: Receipt email has no transactional opt-out exemption

- **GIVEN** a donor has do_not_email and an otherwise qualified receipt artifact
- **WHEN** staff/system request transactional receipt email through Phase 17/6
- **THEN** recipient consent blocks the email and records an identifiers-only audit
- **AND** the donor may still download their own admitted artifact under current access checks

#### Scenario: Staff preview and donor record access are not contact

- **GIVEN** a recipient has opted out of contact
- **WHEN** authorized staff preview synthetic content or the donor accesses their own admitted receipt artifact
- **THEN** recipient opt-out does not block those operations
- **AND** staff capability/projection and donor current artifact access still apply

#### Scenario: Later output has no qualified owner artifact

- **GIVEN** a requested official receipt or statement lacks qualified Phase 7/18 output
- **WHEN** a consumer requests delivery or download
- **THEN** that official output remains unavailable
- **AND** neither a live-text receipt, direct sender nor a new transport is created as a substitute

### Requirement: Phase 3 Governed Export Uses Authoritative Field Policy

Governed CSV/JSON export MUST consume one projection/export policy source.

Every clause in `openspec/contracts/outbound-communications.md#contract-70bbde904a9b56a426d6` MUST apply without exception.

#### Scenario: Exportability determines emitted columns

- **GIVEN** an authorized report includes a visible field whose exportable flag is false
- **WHEN** staff export CSV or JSON
- **THEN** both formats omit that field and emit only the resolved exportable projection
- **AND** the audit count equals the rows actually emitted

#### Scenario: Authorized CSV remains safe for spreadsheets

- **GIVEN** an otherwise admitted donor name begins with a formula trigger
- **WHEN** any existing CSV consumer serializes it
- **THEN** the shared helper neutralizes the trigger and applies RFC 4180 cell quoting
- **AND** the serializer joins records with CRLF and emits the file's UTF-8 BOM
- **AND** consumers cannot duplicate escaping or select a second escaping implementation

#### Scenario: Serializer selection cannot widen external export

- **GIVEN** internal notes, care/security fields or payment identifiers are visible to authorized staff
- **WHEN** another export format or derived report column is selected
- **THEN** external and bulk-export restrictions remain effective
- **AND** denied fields and out-of-scope rows cannot reappear through the serializer
