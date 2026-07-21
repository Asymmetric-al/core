# Phase 17 — System Messages & Template Management: Primary Research Evidence

- **Evidence status:** supporting research, not the product specification
- **External-source access date:** 2026-07-19
- **Authority posture:** informative evidence only; the checked-in Phase 17
  PRD, executable manifest, active OpenSpec delta, and ADRs carry product and
  architecture authority under the package hierarchy
- **Scope:** system-message governance, Resend-only delivery, structured authoring
  and rendering, authentication messages, sender and reply identity,
  deliverability, accessibility, reserved SMS contracts, retention, and tenant
  template portability

## How to use this evidence

This appendix consolidates the Phase 17 research fleet and a final direct review of current primary and official sources. It deliberately uses three labels:

- **DOCUMENTED** means the linked official vendor, standards-body, regulator, or platform source directly states or exposes the fact.
- **INFERRED** means a concrete Phase 17 specification implication derived from documented evidence and the ratified D1-D20 record. It is not a claim that a vendor mandates Asym's exact design.
- **UNKNOWN / VERIFY** means the inspected official material does not establish the answer, contains a conflict, or describes behavior that must be proved against the pinned implementation before release.

The evidence does not reopen or replace D1-D20. Where an external provider permits more behavior than a ratified decision, the narrower ratified Asym contract wins. Vendor documentation proves capabilities and constraints, not legal sufficiency, tenant authorization, accessibility conformance, or product truth. Provider limits and policies can change; the release probes in this appendix must run against the exact SDK, API, editor, and service versions used in production.

## Executive findings

1. **DOCUMENTED:** Resend is an HTTPS, bearer-key, rate-limited transport. Its current API documentation states a default limit of 10 requests per second per team, shared across that team's keys; it publishes rate and quota response headers. [Resend API introduction](https://resend.com/docs/api-reference/introduction), [Resend usage limits](https://resend.com/docs/api-reference/rate-limit)
2. **INFERRED:** Resend cannot be the product ledger. Asym remains authoritative for message contracts, immutable publications, prepared send identity, semantic idempotency, exact-scope routing, recovery, and communication history.
3. **DOCUMENTED:** Resend stores a current published template version but its send endpoint accepts a template ID or alias, not an explicit immutable provider version ID. [Get template](https://resend.com/docs/api-reference/templates/get-template), [Send email](https://resend.com/docs/api-reference/emails/send-email)
4. **INFERRED:** A Resend template ID alone cannot satisfy exact version-pinned sending. Phase 17 should compile and freeze Asym-owned HTML and plain text, then submit those artifacts through Resend.
5. **DOCUMENTED:** Resend idempotency expires after 24 hours. Batch sending accepts at most 100 messages; strict validation rejects the whole request if any entry is invalid, while permissive validation queues valid entries and returns indexed errors for invalid entries. [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), [batch sending](https://resend.com/docs/dashboard/emails/batch-sending), [batch validation modes](https://resend.com/changelog/batch-validation-modes)
6. **INFERRED:** Provider idempotency and batching are optimizations beneath one durable per-recipient communication intent. Neither may merge recipient facts, weaken scope-owner isolation, or authorize blind replay after an ambiguous outcome.
7. **DOCUMENTED:** React Email Editor is built on Tiptap/ProseMirror and exports JSON, HTML, and text. Tiptap recommends JSON persistence and offers schema/content validation. [React Email Editor](https://react.email/docs/editor/overview), [email export](https://react.email/docs/editor/features/email-export), [Tiptap persistence](https://tiptap.dev/docs/editor/core-concepts/persistence), [Tiptap schema](https://tiptap.dev/docs/editor/core-concepts/schema)
8. **INFERRED:** The editor is a useful authoring substrate, not a security boundary or canonical product format. Phase 17 needs bounded Asym JSON, server validation, reviewed extensions, deterministic compilation, and immutable derived artifacts.
9. **DOCUMENTED:** Supabase's Send Email Hook runs in the authentication flow, sends signed payloads containing sensitive token and redirect facts, and has a five-second HTTP timeout. [Supabase Send Email Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook), [Auth Hooks](https://supabase.com/docs/guides/auth/auth-hooks)
10. **INFERRED:** Authentication messages need a prepublished, fast path. Auth tokens, token hashes, protected URLs, and address-change secrets never enter previews, support copies, logs, imports, exports, analytics, or generic variable catalogs.
11. **DOCUMENTED:** Gmail and Yahoo impose authentication, alignment, complaint-rate, and one-click-unsubscribe rules on bulk/subscribed mail. RFC 8058 defines a DKIM-covered HTTPS POST contract that needs no cookie or interactive authentication. [Gmail sender guidelines](https://support.google.com/mail/answer/81126?hl=en), [Yahoo sender best practices](https://senders.yahooinc.com/best-practices/), [RFC 8058](https://datatracker.ietf.org/doc/html/rfc8058)
12. **INFERRED:** Transactional, subscribed, and marketing purposes must remain explicit. RFC 8058 unsubscribe is a separate POST contract; ordinary protected actions use D6's non-mutating GET plus deliberate Asym POST. Ratified Phase 18 D13 later hardened the shared transport to a scanner-resistant non-secret selector plus independent fragment verifier.
13. **DOCUMENTED:** WCAG 2.2 and ATAG distinguish accessible output from accessible authoring. [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [ATAG](https://www.w3.org/WAI/standards-guidelines/atag/)
14. **INFERRED:** Phase 17 has two accessibility targets: the staff authoring/management experience and the compiled email. Static lint alone proves neither; both need named keyboard, screen-reader, reflow, RTL, images-off, and client tests.
15. **DOCUMENTED:** Twilio requires consent evidence and enforces opt-out behavior, but sender registration, number type, geography, review time, and provider behavior vary. [Twilio Messaging Policy](https://www.twilio.com/en-us/legal/messaging-policy), [Advanced Opt-Out](https://www.twilio.com/docs/messaging/tutorials/advanced-opt-out), [A2P 10DLC](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc)
16. **INFERRED:** Phase 17 should reserve a transport-dark, provider-neutral SMS contract and consent state only. It must not create SMS credentials, numbers, webhooks, tests, previews, queues, or send capability.
17. **DOCUMENTED:** Unlayer and Beefree preserve proprietary editable JSON and export HTML, but foreign HTML conversion has documented limitations and fidelity loss. [Unlayer load/save](https://docs.unlayer.com/builder/latest/load-and-save-designs), [Unlayer raw HTML](https://help.unlayer.com/en/articles/11689421-how-to-use-raw-html-templates-in-unlayer), [Beefree methods and events](https://docs.beefree.io/beefree-sdk/getting-started/readme/installation/methods-and-events), [Beefree HTML Importer](https://docs.beefree.io/beefree-sdk/apis/html-importer-api)
18. **INFERRED:** D19's honest portability model is necessary: a versioned Asym package, immutable render artifacts, loss-reporting foreign conversion, and destination-owned bilateral transfer. Lossless editable cross-vendor transfer must not be promised.

## 1. Evidence-backed D1-D20 specification pins

These are concise implementation pins supported by later sections. They restate, but do not expand, the ratified decisions.

| Decision | Evidence-backed specification pin                                                                                                                                                                                                                                                |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1       | Producer-owned typed contracts govern purpose, audience, authoritative facts, protected actions, requiredness, and failure policy. Tenant freedom exists only inside that server-enforced envelope.                                                                              |
| D2       | Customization copies one complete effective publication; publish freezes one complete variant. Delivery and recovery never field-merge mutable fragments.                                                                                                                        |
| D3       | Locale/site fallback resolves atomically to one compatible whole publication using only the two ratified algorithms. It cannot change tenant, sender identity, jurisdiction, or protected meaning.                                                                               |
| D4       | Canonical content is versioned bounded Asym JSON. The server validates and deterministically compiles immutable HTML/text with schema, compiler, sanitizer, layout, asset, and hash evidence.                                                                                    |
| D5       | One authorized communication intent exists per recipient. Provider batch transport is optional, single-scope-owner, deterministic, bounded to 100 Resend entries, and preserves individual state and recovery.                                                                   |
| D6       | Producers own protected-action purpose and token semantics. Ordinary action GETs are non-mutating and hand off to an Asym confirmation; secrets never become template variables or retained content.                                                                             |
| D7       | Delivery Plans expose only the ratified typed event, bounded step, delay, recipient, channel, and condition capabilities. They are not a general automation language.                                                                                                            |
| D8       | In-product staff notifications use Asym/Postgres truth and the ratified proportional launch surface; email remains a separate Phase 6 channel step, not the source of notification truth.                                                                                        |
| D9       | SMS schemas reserve purpose, consent provenance, registration readiness, and protected STOP/HELP behavior while every runtime SMS capability remains disabled.                                                                                                                   |
| D10      | Each tenant connects one tenant-owned Resend account/team using one domain-scoped sending key and a separately protected webhook authority. No central Asym fallback or second provider exists.                                                                                  |
| D11      | Immutable publication and the ratified proportional independent review gate remain the only approval model. Provider publication does not substitute for Asym review evidence.                                                                                                   |
| D12      | Tenants may activate any BCP 47 locale only after contract-scoped proof of complete readiness, with visible fallback and direction behavior. No silent machine translation or partial live locale.                                                                               |
| D13      | A versioned inherited Brand Kit and bounded layout roles provide broad safe visual freedom while content, layout, brand, and assets remain separate immutable dependencies.                                                                                                      |
| D14      | Durable history stores minimum evidence; one separately protected recent sent copy may expire. Provider retention is disclosed independently. Tokens, restricted data, and official source artifacts are excluded.                                                               |
| D15      | Render, preparation, submission, and delivery failures retain deterministic cause ownership. Recovery is whole-message, proof-gated, idempotent, and grouped in one repair surface; decryptable provider material has a closed purpose-bound deadline and terminal erasure path. |
| D16      | The full catalog is a versioned working registry with explicit producer, purpose, audience, channel, requiredness, fact schema, protection, fallback, and launch-readiness evidence.                                                                                             |
| D17      | Reply purpose belongs to the contract. A prepared email freezes exactly one proved, bounded tenant destination or an explicit governed no-reply posture; tenant content cannot override it.                                                                                      |
| D18      | Official/security/payment messages expose a visible contract-owned protected core and bounded tenant presentation choices. Templates never calculate or restate authoritative financial, legal, or action truth.                                                                 |
| D19      | Portability uses a versioned Asym package, honest foreign conversion, and source-authorized/destination-accepted transfer. The destination creates new IDs, mappings, and publication.                                                                                           |
| D20      | Sender profiles are versioned Asym identities constrained to the tenant's proved Resend domain and mapped by governed message family/site rules. Provider permissiveness never authorizes arbitrary From values.                                                                 |

## 2. Resend-only transport evidence

### 2.1 Account, team, and API baseline

- **DOCUMENTED:** The Resend API enforces HTTPS, bearer API-key authentication, and a required `User-Agent`; missing the header can return 403/code `1010`. Resend currently says the API has no versioning system and plans calendar-based version headers. [Resend API introduction](https://resend.com/docs/api-reference/introduction)
- **DOCUMENTED:** Resend's current default rate is 10 requests per second per team, shared across all keys for that team. Responses include `ratelimit-limit`, `ratelimit-remaining`, `ratelimit-reset`, and `retry-after`; email quota headers are also documented. [Resend usage limits](https://resend.com/docs/api-reference/rate-limit)
- **DOCUMENTED:** The quota response headers are used-count observations rather than remaining capacity; daily quota evidence can be absent outside the free plan. Current typed 429 errors distinguish rate, daily quota, and monthly quota exhaustion. [Resend usage limits](https://resend.com/docs/api-reference/rate-limit), [Resend errors](https://resend.com/docs/api-reference/errors)
- **DOCUMENTED:** A Resend team has separate keys, billing, and usage. Resend's multi-tenant guidance explicitly documents a customer-owned account/domain/key pattern. [Team settings](https://resend.com/docs/dashboard/settings/team), [multi-tenant setup](https://resend.com/docs/knowledge-base/setting-up-resend-for-multi-tenants)
- **INFERRED:** Every Resend credential, webhook secret, provider email ID, rate bucket, quota state, and normalized event must be bound to exactly one connection whose `ExecutionScope` owner is either one tenant or the separate service-only platform owner. A domain string, tag, recipient address, route parameter, or webhook payload cannot select scope or owner authority.
- **INFERRED:** Use a scope-owner limiter that reads current provider headers and applies backoff. Tenant owners and the separate service-only platform owner remain isolated; do not hard-code 10 as an eternal product limit or let one owner's quota/rate failure starve another.
- **UNKNOWN / VERIFY:** Resend's general introduction and rate-specific documentation have not always displayed the same default limit in indexed/cached copies. The release pin must capture the live rate-specific page and provider response headers; runtime safety follows the observed headers and typed 429 result, not either prose number.
- **UNKNOWN / VERIFY:** The inspected sources do not establish a supported way for Asym to create or administer a tenant's Resend account under the ratified pasted-key model. The Phase 17 UI should assume the tenant creates and owns the Resend team, billing, and DNS in Resend.

### 2.2 Least-privilege keys and rotation

- **DOCUMENTED:** Resend keys can have `full_access` or `sending_access`. Sending access can be restricted to a single domain. A key is visible only once, does not expire automatically, and should never be exposed client-side, committed, or hard-coded. [API keys](https://resend.com/docs/dashboard/api-keys/introduction), [create API key](https://resend.com/docs/api-reference/api-keys/create-api-key), [key handling](https://resend.com/docs/knowledge-base/how-to-handle-api-keys)
- **DOCUMENTED:** Resend's recommended rotation sequence is to create a replacement with the same scope, deploy and verify it, and only then delete the old key. [Key handling](https://resend.com/docs/knowledge-base/how-to-handle-api-keys)
- **DOCUMENTED:** Resend announced OAuth 2.1 with PKCE on 2026-07-13. [Resend changelog](https://resend.com/changelog/)
- **OBSERVED + INFERRED:** The current package manifest declares `resend` as
  `^6.9.2`, and `bun.lock` resolves that range to `resend@6.11.0`; the resolved
  lock version is the planning fixture pin. A Sending-access key receives the
  provider's documented `restricted_api_key` response from broader management
  operations; Phase 17 uses the side-effect-free `GET /domains` discriminator
  plus a controlled exact-sender canary and re-pins fixtures whenever the
  manifest range or lock resolution changes. Success from `GET /domains` means
  the key is broader than Sending access. [Resend API-key
  permissions](https://resend.com/docs/dashboard/api-keys/introduction), [List
  domains](https://resend.com/docs/api-reference/domains/list-domains), [Resend
  errors](https://resend.com/docs/api-reference/errors)
- **INFERRED:** D10 remains a single domain-scoped `sending_access` pasted-key path. Accept the secret only server-side, encrypt it with managed key material, show a non-secret hint, and expose **Replace key** and **Disconnect** instead of a redisplayed editable secret.
- **INFERRED:** Rotation uses a pending credential revision, a narrow exact-sender capability proof, atomic promotion, and delayed retirement of the old key. Failed or ambiguous proof leaves the previous active credential unchanged.
- **INFERRED:** Newly available OAuth does not reopen D10 or justify two simultaneous credential systems. A typed credential-kind seam may permit a later audited migration without changing message contracts, but OAuth is not a second Phase 17 option.
- **UNKNOWN / VERIFY:** A send-only key intentionally cannot perform broad account management. Phase 17 must prove and describe only the capabilities it actually observes; it cannot claim account ownership, webhook health, DNS control, inbox delivery, or exclusive domain control from one successful send request.

### 2.3 Domains, sender identity, and migration

- **DOCUMENTED:** Resend requires an owned domain and verifies sending with SPF and DKIM. It recommends subdomains to isolate reputation and communicate mail purpose. Domain states include pending, verified, partial, failed, and temporary-failure variants. [Domains](https://resend.com/docs/dashboard/domains/introduction)
- **DOCUMENTED:** Resend advises starting DMARC with `p=none`, observing all legitimate senders, and strengthening policy only after evidence. [Resend DMARC](https://resend.com/docs/dashboard/domains/dmarc)
- **DOCUMENTED:** Once a domain is verified, Resend permits sending from any local part at that exact domain; a From address need not be precreated or even receive mail, although Resend recommends an address that can receive replies. [Sender addresses](https://resend.com/docs/knowledge-base/how-do-I-create-an-email-address-or-sender-in-resend)
- **DOCUMENTED:** Resend Domain Claim can transfer an owned domain between teams. Recent sending activity may require support involvement; ownership and SPF/DKIM verification are separate steps, and the current workflow is exposed through Resend's product/API surfaces. [Domain Claim](https://resend.com/changelog/domain-claim)
- **INFERRED:** Provider permissiveness is not product authorization. Every From value comes from a published D20 profile revision whose tenant, exact domain, display name, local part, site/family mapping, and connection revision are validated and frozen at preparation.
- **INFERRED:** A domain or account move creates a new pending connection/domain revision. The old identity remains active until the new key, domain authentication, sender, webhook, tracking posture, and controlled canary are proved. Prepared or indeterminate messages remain bound to their original identity and are reconciled there.
- **INFERRED:** Resend domain verification proves sending control, not control or monitoring of an external Reply-To mailbox. D17 keeps those proofs separate.

### 2.4 From, Reply-To, and custom headers

- **DOCUMENTED:** The Resend send API requires `from` as an address or `Name <address>` and supports custom headers. The official Node SDK accepts one or multiple Reply-To addresses. [Send email API](https://resend.com/docs/api-reference/emails/send-email), [Resend Node send options](https://github.com/resend/resend-node/blob/5c4d9128d6aa8a8cbd1671cb673add363deb324c/src/emails/interfaces/create-email-options.interface.ts), [custom headers](https://resend.com/docs/dashboard/emails/custom-headers)
- **DOCUMENTED:** RFC 5322 distinguishes the author identity in From from the address suggested for replies in Reply-To. [RFC 5322 section 3.6.2](https://datatracker.ietf.org/doc/html/rfc5322#section-3.6.2)
- **DOCUMENTED:** RFC 3834 defines `Auto-Submitted` for automatic responses and messages. [RFC 3834](https://www.rfc-editor.org/rfc/rfc3834.html)
- **INFERRED:** D17 deliberately narrows provider support to one effective Reply-To destination or an explicit governed no-reply posture. The contract owns the reply purpose; the tenant chooses only from proved bounded destinations. Template content, imports, browser input, and producer payloads cannot supply or override Reply-To.
- **INFERRED:** Resolve sender and Reply-To before submission, include them in the prepared digest, and preserve them byte-for-byte across retries. Reject CR/LF/control characters, multiple Reply-To addresses, a competing custom Reply-To header, and free-form display-name ambiguity.
- **INFERRED:** Custom headers use a platform allow-list. Tenant-authored arbitrary transport headers are out of scope. `Auto-Submitted` and RFC 8058 list headers, where applicable, are contract/transport output rather than template freedom.

### 2.5 Send API, provider templates, and immutable identity

- **DOCUMENTED:** Resend can send HTML, plain text, a React node through supported Node SDKs, or a published stored template. Template mode cannot be combined with HTML/text/React. The endpoint allows up to 50 To recipients and attachments up to 40 MB after Base64 encoding. [Send email API](https://resend.com/docs/api-reference/emails/send-email)
- **DOCUMENTED:** If text is omitted, Resend can generate it from HTML. Send-time From, subject, and Reply-To override provider-template defaults. [Send email API](https://resend.com/docs/api-reference/emails/send-email), [templates](https://resend.com/docs/dashboard/templates/introduction)
- **DOCUMENTED:** A Resend template exposes `current_version_id` and `has_unpublished_versions`; publication is separate. The send API accepts a template ID or alias but no explicit provider version ID in the inspected contract. [Get template](https://resend.com/docs/api-reference/templates/get-template), [publish template](https://resend.com/docs/api-reference/templates/publish-template), [send email](https://resend.com/docs/api-reference/emails/send-email)
- **INFERRED:** Resend stored templates and dashboard edits cannot be canonical Phase 17 publications. Store immutable Asym source, compiled HTML/text, dependency versions, and hashes; submit the frozen HTML/text through Resend.
- **INFERRED:** Never rely on provider-generated plain text for a governed message. Phase 17 compiles, previews, tests, publishes, and hashes its own plain-text artifact alongside HTML.
- **INFERRED:** A Resend template ID/current version may be retained as optional evidence if used operationally, but it cannot be the only publication pin until an official send-time immutable-version API exists and is proved.
- **UNKNOWN / VERIFY:** Resend's current create-template API documentation and dashboard documentation have published different maximum variable counts. Avoid coupling the Asym contract to either number; if provider templates remain anywhere, run an exact pinned-API limit test. [Create template](https://resend.com/docs/api-reference/templates/create-template), [templates](https://resend.com/docs/dashboard/templates/introduction)

### 2.6 Idempotency, batching, and ambiguous outcomes

- **DOCUMENTED:** Resend supports `Idempotency-Key` for single and batch sends. Keys expire after 24 hours and have a 256-character maximum. Reusing a key with changed payload returns `409 invalid_idempotent_request`; concurrent use can return `409 concurrent_idempotent_requests`. [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), [Resend errors](https://resend.com/docs/api-reference/errors)
- **DOCUMENTED:** Resend's error catalog is global across operations and reuses `validation_error` at both 400 request-shape and 403 testing/domain-readiness cases. It separately documents authentication, endpoint, idempotency, attachment/address/parameter, quota/rate, security, application, and internal error types. Status plus type—and sometimes the pinned reason/operation—are therefore required to interpret the result. [Resend errors](https://resend.com/docs/api-reference/errors)
- **INFERRED:** Keep a version-pinned closed union and exhaustive operation/status/type/reason/context matrix for only the adopted `send_email`, `send_batch`, and `probe_domains` operations. Unknown, malformed, operation-inapplicable, or context-contradictory tuples remain indeterminate; an SDK/API/catalog change fails fixtures until the matrix and evidence version together. This is safer and smaller than a provider-generic error engine.
- **INFERRED:** `invalid_idempotent_request` proves the current payload conflicts with an earlier use of the key, not that no product message crossed the provider boundary. Treat it as an indeterminate data-integrity incident: quarantine, reconcile the exact accepted payload/hash if possible, and never authorize same-key retry, rekey, replay, or a definite-rejection repair transition from the 409 alone.
- **DOCUMENTED:** A batch request accepts at most 100 emails, does not support attachments or `scheduled_at`, and has one request-level idempotency key. [Batch sending](https://resend.com/docs/dashboard/emails/batch-sending), [idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys)
- **DOCUMENTED:** Strict batch validation is the default and rejects the whole request if any item is invalid. Permissive validation queues valid messages and returns invalid entries in an indexed `errors` array; the error index refers to the original payload position. [Batch validation modes](https://resend.com/changelog/batch-validation-modes)
- **INFERRED:** The permanent duplicate guard is a durable Asym semantic identity tied to the exact `ExecutionScope` owner and environment, communication intent, concrete recipient authority, channel step, prepared artifact, and occurrence/attempt. Resend's 24-hour key is a transport supplement only.
- **INFERRED:** A timeout after possible acceptance is **indeterminate**, not failed. Preserve the exact payload, key, chunk identity, and prepared version; reconcile provider evidence before any new send. After the provider window expires, blind replay is forbidden.
- **INFERRED:** Batch only prevalidated compatible intents from one exact scope owner, Resend team/connection credential, sender profile or fixed platform sender policy, purpose/safety class, and retry policy. Persist deterministic chunk membership/order, canonical body hash, and index-to-intent mapping before submission.
- **INFERRED:** Prefer strict mode after local validation for atomic transport understanding. If permissive mode is used for measured operational reasons, consume every indexed error and queued ID into the individual intent ledger. Never infer whole-batch success from HTTP success or replay a whole ambiguous batch casually.
- **INFERRED:** Critical Supabase Auth messages and other low-latency protected actions should use individual sends unless measured evidence proves a batch benefit without increasing latency or ambiguity.

### 2.7 Webhooks, lifecycle truth, and suppression

- **DOCUMENTED:** Resend webhooks are at least once, may be duplicated, may arrive out of order, identify deliveries with `svix-id`, and expose event `created_at`. Manual replay is supported. [Webhooks](https://resend.com/docs/webhooks/introduction)
- **DOCUMENTED:** The retry schedule is immediate, then approximately 5 seconds, 5 minutes, 30 minutes, 2 hours, 5 hours, 10 hours, and an additional 10 hours. Persistently failing endpoints can be disabled. [Retries and replays](https://resend.com/docs/webhooks/retries-and-replays)
- **DOCUMENTED:** Signature verification uses the raw request body and endpoint signing secret. [Verify webhook requests](https://resend.com/docs/webhooks/verify-webhooks-requests)
- **DOCUMENTED:** Resend distinguishes `email.sent` (successful API request and attempted delivery) from `email.delivered` (accepted by the recipient's mail server), and publishes delayed, failed, bounced, complained, opened, clicked, and suppressed events. [Event types](https://resend.com/docs/webhooks/event-types)
- **DOCUMENTED:** Resend's 2026-07-08 changelog says all email webhooks and GET email endpoints include Message-ID. [Resend changelog](https://resend.com/changelog/)
- **DOCUMENTED:** A hard bounce or complaint can suppress a recipient across every domain in the same Resend region. Resend notes that Gmail/Google Workspace does not necessarily return complaint events. [Email suppressions](https://resend.com/docs/dashboard/emails/email-suppressions)
- **INFERRED:** Verify raw bytes before parsing or trusting fields. Resolve one candidate connection from a server-held opaque endpoint handle, derive its exact `ExecutionScope` owner from the connection revision, verify only that connection's secret, then bind the provider email ID to an existing same-scope send. Never scan across scope-owner secrets or trust a payload/tag as authority.
- **INFERRED:** Deduplicate by connection and `svix-id`; reduce lifecycle events monotonically using event identity/time and explicit transition rules. Store minimized normalized evidence, not an indefinite unrestricted provider payload.
- **INFERRED:** Capture Message-ID as nullable, connection-scoped correlation evidence for later inbound-reply work. It is not scope authorization, proof of reading, or a safe substitute for the Resend email ID and local send identity.
- **INFERRED:** Profiles and subdomains are not separate suppression stores. D20 cannot offer a profile-specific force-send or suppression-removal bypass. Consent/contact authority and provider suppression evidence remain separate inputs.

### 2.8 Safe provider tests, tracking, quotas, and retention

- **DOCUMENTED:** Resend provides `delivered@resend.dev`, `bounced@resend.dev`, `complained@resend.dev`, and `suppressed@resend.dev` fixtures to exercise API and webhook behavior without harming domain reputation. Test messages count against quota. [Test emails](https://resend.com/docs/dashboard/emails/send-test-emails)
- **DOCUMENTED:** Open and click tracking are disabled by default and configured at domain level; a custom tracking subdomain is available. [Domain tracking](https://resend.com/docs/dashboard/domains/tracking)
- **DOCUMENTED:** Resend's current account guidance states a default 10 requests/second per team, free transactional quotas of 100/day and 3,000/month, a paid-plan overage ceiling, bounce below 4 percent, and spam below 0.08 percent. These account/provider values can change. [Account quotas and limits](https://resend.com/docs/knowledge-base/account-quotas-and-limits)
- **DOCUMENTED:** Resend says it retains email data for 30 days across standard plans, with flexible Enterprise retention. Disabling content storage is a separately qualified paid capability, not a default. [Store webhook data](https://resend.com/docs/dashboard/webhooks/how-to-store-webhooks-data), [sensitive-data storage](https://resend.com/docs/knowledge-base/how-do-i-ensure-sensitive-data-isnt-stored-on-resend)
- **INFERRED:** Use Resend fixtures for deterministic reducer tests, not as proof of real inbox delivery, SPF/DKIM/DMARC, From/Reply-To display, accessibility, or rendering. Activation needs a controlled real-sink canary with exact-header inspection.
- **INFERRED:** Tracking is not a template toggle. Protected/system traffic should keep tracking off unless a later purpose-specific decision and tenant privacy/consent posture allow it. Detect and surface domain-level drift.
- **INFERRED:** Quota, rate, bounce, spam, billing, suspension, and webhook failure must become truthful connection health states with safe staff guidance. They cannot trigger a silent second provider or sender substitution.
- **INFERRED:** D14's Asym sent-copy retention is independent of Resend's provider retention. Never promise zero provider storage without positive account evidence; minimize payloads and keep durable Asym history provider-independent.

## 3. Structured editor, rendering, and official content

### 3.1 React Email Editor and Tiptap capabilities

- **DOCUMENTED:** React Email Editor is an embeddable visual editor built on Tiptap and ProseMirror. It documents rich text, tables, multi-column content, theming, HTML/plain-text export, and custom extensions. [Editor overview](https://react.email/docs/editor/overview)
- **DOCUMENTED:** The editor exposes Tiptap JSON, HTML, and plain text. Its React Email composition traverses nodes/marks, calls extension renderers, applies theme serialization, and wraps content in a base template. [Email export](https://react.email/docs/editor/features/email-export), [EmailEditor API](https://react.email/docs/editor/api-reference/email-editor)
- **DOCUMENTED:** React Email's render utility converts React components to HTML and can produce plain text. [Render utility](https://react.email/docs/utilities/render)
- **DOCUMENTED:** Tiptap supports HTML or JSON persistence and recommends JSON for flexible parsing/transformation. Its strict schema defines nodes, marks, attributes, and nesting; content checks can report invalid content, with JSON checks more reliable than HTML checks. [Tiptap persistence](https://tiptap.dev/docs/editor/core-concepts/persistence), [Tiptap schema](https://tiptap.dev/docs/editor/core-concepts/schema)
- **INFERRED:** React Email Editor/Tiptap is suitable only as a pinned implementation substrate for D4. Canonical truth is a versioned Asym-structured document, not arbitrary Tiptap JSON, browser HTML, or a provider template.
- **INFERRED:** Persist source JSON with exact schema/catalog/compiler/extension versions. Validate again server-side, compile HTML and text deterministically, record hashes, and ensure preview, test, commit, publish, and production share that compiler.

### 3.2 Security boundary

- **DOCUMENTED:** Tiptap schema validation governs structure and can strip unknown content; the official documentation does not claim that schema checks alone sanitize every URL, asset, style, attribute, extension, or generated output. [Tiptap schema](https://tiptap.dev/docs/editor/core-concepts/schema)
- **DOCUMENTED:** OWASP distinguishes context-sensitive output encoding and sanitization; one universal encoding or client-only check is not sufficient across HTML, attribute, URL, and script contexts. [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- **INFERRED:** Treat editor input as untrusted. Enforce safe URL schemes/destinations, governed immutable assets, attribute allow-lists, output-context escaping, depth/size/collection quotas, and subject/preheader CR/LF/control-character rejection.
- **INFERRED:** Reject raw HTML/CSS/classes, scripts, forms, iframes, embeds, arbitrary columns, React/code/expressions, tracking pixels, unrestricted uploads, record traversal, and tenant-installed executable extensions. Only reviewed Asym extensions may render.
- **INFERRED:** Every variable is a typed indivisible fact with semantics, privacy class, permitted context, null behavior, formatter, and synthetic value. Protected actions are purpose-specific structural nodes. Donor-facing contracts structurally exclude care, staff-only, credential, payment-secret, and unrestricted custom-record data.
- **INFERRED:** Preview uses the same server compiler with synthetic data in an isolated CSP/sandbox. Test sends use synthetic fixtures and bounded staff recipients; neither may introduce real donor PII.

### 3.3 Official, financial, payment, and security message protection

- **DOCUMENTED:** US charitable acknowledgments require specific contribution/benefit facts but not one fixed visual design. [IRS written acknowledgments](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments), [IRS substantiation](https://www.irs.gov/charities-non-profits/substantiating-charitable-contributions)
- **DOCUMENTED:** Canada's official donation-receipt rules require a jurisdiction-specific field set and controls for computer-generated receipts. [CRA required receipt information](https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/operating-a-registered-charity/issuing-receipts/what-information-must-on-official-donation-receipt-a-registered-charity.html), [CRA computer-generated receipts](https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/policies-guidance/policy-statement-014-computer-generated-official-donation-receipts.html)
- **DOCUMENTED:** Stripe's receipt/invoice documentation similarly separates authoritative payment facts from presentation customization. [Stripe receipts](https://docs.stripe.com/receipts), [Stripe invoice customization](https://docs.stripe.com/invoicing/customize)
- **DOCUMENTED:** PCI SSC warns against exposing full cardholder data in end-user messaging; masking and truncation are distinct controls. [PCI SSC FAQ 1146](https://www.pcisecuritystandards.org/faqs/1146/), [PCI SSC FAQ 1310](https://www.pcisecuritystandards.org/faqs/1310/)
- **INFERRED:** D18 should protect semantic units, not freeze an entire message or add one universal legal footer. The producer/source phase owns official facts, jurisdiction, status, and artifact identity; Phase 17 renders visible protected blocks and permits bounded tenant tone, brand, layout, and approved surrounding copy.
- **INFERRED:** Templates never calculate tax deductibility, receipt validity, payment success, ACH settlement, refund state, organization legal identity, or action eligibility. The email wrapper points to or renders the frozen source-owned fact/artifact; it never becomes a competing official record.
- **INFERRED:** The editor should show protected content on the canvas with its source, reason, synthetic example, and safe choices instead of hiding it. D11 remains the one publication-review gate; protection does not create a second approval bureaucracy.

### 3.4 Maturity and release proof

- **UNKNOWN / VERIFY:** React Email Editor's official feature documentation does not establish a production SLA, persisted-schema compatibility guarantee, migration policy, security certification, or universal email-client fidelity.
- **INFERRED:** Pin exact packages and prove golden JSON fixtures, deterministic HTML/text/hashes, malicious-paste rejection, migrations with loss reporting, long/RTL content, images-off/dark-mode behavior, and focused Gmail, Outlook, and Apple Mail rendering.
- **INFERRED:** If the pinned editor renderer cannot provide deterministic compliant server output without fragile DOM emulation, retain the visual editor but implement one small renderer for the approved nodes. Do not fork the editor or create a general-purpose template language.

### 3.5 Current comparator UX and version-governance evidence

These products are design comparators only. Phase 17 does not depend on their
runtimes, data models, pricing tiers, or workflow engines.

- **DOCUMENTED:** Knock separates saving/testing a draft from making it live. A
  commit is required before API-triggered work uses the change; commits can be
  promoted, diffed, audited, reverted, and rolled back through a later commit.
  [Knock commits](https://docs.knock.app/version-control/commits)
- **DOCUMENTED:** Knock environments isolate data and version-controlled content
  with environment-specific keys and explicit promotion to production. Its
  template editor keeps editing, preview data, live preview, localization,
  version history, diffs, and test delivery discoverable in one working surface.
  [Knock environments](https://docs.knock.app/version-control/environments),
  [Knock template editor](https://docs.knock.app/template-editor/overview)
- **INFERRED:** Draft → commit → publish, immutable history, visible diffs,
  explicit environment promotion, and a fixture/editor/preview workspace are
  proven interaction patterns. Phase 17 keeps those benefits while requiring
  stored synthetic fixtures only—never production people or donor PII—and
  preserving Asym as the publication authority.
- **DOCUMENTED:** Postmark Layouts wrap content-only templates with reusable CSS,
  header, and footer; staff can preview a template with its chosen layout and
  inspect which templates depend on a layout. [Postmark
  Layouts](https://postmarkapp.com/support/article/1172-using-postmark-layouts)
- **INFERRED:** Shared Brand Kit and Layout Roles should remove duplicated chrome
  while showing dependency and impact before publish. A later layout change may
  affect only an explicitly republished compatible generation; it must never
  mutate a pinned publication or prepared message in place.
- **DOCUMENTED:** Braze's visual email editor uses bounded rows and content
  blocks with desktop/mobile preview. Braze also documents that a reusable block
  dragged into a message becomes an unlinked copy, while a Liquid include stays
  linked and later changes propagate; its library exposes usage information.
  [Braze drag-and-drop email](https://www.braze.com/docs/user_guide/channels/email/drag_and_drop),
  [Braze Content Blocks](https://www.braze.com/docs/user_guide/messaging/design_and_edit/content_blocks)
- **DOCUMENTED:** Braze global styles apply prospectively, require font
  fallbacks because inbox compatibility varies, and its template flow separates
  blocking errors from warnings while supporting preview and test delivery.
  [Braze email global styles](https://www.braze.com/docs/user_guide/channels/email/customize/email_global_style_settings),
  [Braze email templates](https://www.braze.com/docs/user_guide/messaging/templates/email_templates/email_template)
- **INFERRED:** Phase 17 should offer broad visual freedom through clear bounded
  roles, responsive previews, future-only Brand Kit changes, explicit
  copy-on-insert or immutable version pinning, dependency/impact visibility, and
  one concise readiness panel that separates blocking safety/contract failures
  from non-blocking quality warnings. Raw HTML remains outside the tenant editor;
  comparator support for it does not justify an executable or mutable escape
  hatch.

## 4. Supabase authentication-message boundary

- **DOCUMENTED:** Supabase's Send Email Hook replaces built-in Auth email delivery and supplies `user` plus `email_data`, including token, token hash, redirect, action type, site URL, and current/new address facts. An empty HTTP 200 response signals hook success. [Send Email Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook)
- **DOCUMENTED:** Secure Email Change can require two messages, and Supabase documents a non-obvious current/new token-hash mapping that must be followed exactly. [Send Email Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook)
- **DOCUMENTED:** HTTP Auth Hooks use signed payloads and have a five-second timeout; Postgres hooks have a two-second timeout. [Auth Hooks](https://supabase.com/docs/guides/auth/auth-hooks)
- **DOCUMENTED:** Supabase describes magic links as one-time, requires configured redirect allow-lists, documents default request throttling and expiry, and uses token hashes in PKCE verification. [Passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless), [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- **INFERRED:** Supabase Auth is the producer and sole authority for action type, recipient, redirect semantics, token cardinality, expiry, and completion. Phase 17 may render a protected action node but cannot regenerate, extend, reinterpret, or mark the action complete.
- **DOCUMENTED:** Supabase Admin `generateLink` can create an invite proof for a custom delivery path, and `verifyOtp` verifies the returned hashed token under the matching invite flow. [Supabase `generateLink`](https://supabase.com/docs/reference/javascript/auth-admin-generatelink), [Supabase `verifyOtp`](https://supabase.com/docs/reference/javascript/auth-verifyotp)
- **INFERRED:** Phase 4's seven-day invitation remains the authority. One scanner-resistant, CAS-reserved, idempotent producer command may generate and immediately exchange a fresh short-lived proof after deliberate acceptance; any temporary bearer hash is producer-owned encrypted crash-recovery material and never becomes a Phase 17 template/history fact.
- **INFERRED:** Verify the hook signature against raw bytes and complete under five seconds using a prepublished compatible artifact. No preview, editor compilation, approval workflow, foreign conversion, or slow provider-management call belongs in the hook path.
- **INFERRED:** Token, token hash, current/new address facts, and protected redirect are ephemeral. They never enter synthetic fixtures, logs, traces, analytics, sent-copy retention, exports, imports, screenshots, or generic template variables. Persist only minimized non-secret version/send/outcome evidence.
- **INFERRED:** Model Secure Email Change as its own producer contract and test both recipients with the exact documented token mapping. A generic template must not infer which token belongs to which address.
- **INFERRED:** Supabase configurations may support other fallback behavior, but D10 is stricter: Resend is the only transport and there is no silent SMTP/provider fallback.
- **UNKNOWN / VERIFY:** The inspected Supabase pages do not define a complete retry/replay contract for every non-2xx and timeout. Integration tests must establish duplicate, replay, timeout, link-expiry, and secure-email-change behavior for the pinned Supabase version.

## 5. Deliverability, classification, and scanner-resistant actions

### 5.1 Gmail and Yahoo

- **DOCUMENTED:** Gmail requires all senders to use SPF or DKIM, valid forward/reverse DNS, TLS, RFC 5322 formatting, non-impersonating identity, and spam rates below 0.3 percent. [Gmail sender guidelines](https://support.google.com/mail/answer/81126?hl=en)
- **DOCUMENTED:** Senders of more than 5,000 messages/day to personal Gmail accounts must use SPF and DKIM, publish DMARC, align the visible From domain, and support one-click unsubscribe plus a visible link for marketing/subscribed mail. Gmail recommends staying below 0.10 percent spam and avoiding 0.30 percent or higher. [Gmail sender guidelines](https://support.google.com/mail/answer/81126?hl=en)
- **DOCUMENTED:** Gmail recommends keeping message categories consistent with From identities, separating traffic types where appropriate, monitoring Postmaster data, and ramping volume gradually. [Gmail sender guidelines](https://support.google.com/mail/answer/81126?hl=en)
- **DOCUMENTED:** Yahoo requires SPF or DKIM, forward/reverse DNS, RFC formatting, and complaint rates below 0.3 percent. Bulk senders need SPF and DKIM, DMARC/alignment, one-click unsubscribe and a visible link for marketing/subscribed mail, and must honor opt-outs within two days. [Yahoo best practices](https://senders.yahooinc.com/best-practices/), [Yahoo FAQ](https://senders.yahooinc.com/faqs/)
- **DOCUMENTED:** Yahoo says the one-click requirement applies to promotional/marketing rather than transactional mail and recommends separating bulk/marketing from transactional traffic by IP or DKIM domain. [Yahoo FAQ](https://senders.yahooinc.com/faqs/), [Yahoo best practices](https://senders.yahooinc.com/best-practices/)
- **INFERRED:** Purpose/classification is producer-owned behavior, not editable copy. Every D16 catalog contract must identify transactional required, optional subscribed, or marketing purpose and the corresponding consent, unsubscribe, sender, and failure policy.
- **INFERRED:** Keep authentication/receipt traffic operationally distinguishable from later bulk campaigns. A future phase may choose additional domains or streams, but Phase 17 must retain purpose and sender-family evidence now.
- **INFERRED:** Surface authentication, complaint, bounce, suppression, quota, and webhook health as real evidence. Do not invent a vague "deliverability score" or claim inbox placement from API acceptance/provider delivery.

### 5.2 RFC 8058 one-click unsubscribe

- **DOCUMENTED:** RFC 8058 requires `List-Unsubscribe` with an HTTPS URI and `List-Unsubscribe-Post: List-Unsubscribe=One-Click`. The action is a POST that must not require cookies or HTTP authentication and must not redirect. [RFC 8058](https://datatracker.ietf.org/doc/html/rfc8058)
- **DOCUMENTED:** RFC 8058 recommends `multipart/form-data` for the one field and permits `application/x-www-form-urlencoded`; a receiver can therefore send either encoding. [RFC 8058 section 3.2](https://datatracker.ietf.org/doc/html/rfc8058#section-3.2)
- **DOCUMENTED:** The RFC recommends an opaque hard-to-forge recipient/list identifier. It requires DKIM, with the one-click headers covered by the signature, and says the recipient system initiates POST only with user consent. [RFC 8058](https://datatracker.ietf.org/doc/html/rfc8058)
- **INFERRED:** Optional subscribed/marketing contracts must produce both the visible unsubscribe control and the RFC 8058 headers/POST behavior. Required transactional contracts must not be mislabeled marketing merely to reuse a generic footer.
- **INFERRED:** RFC 8058 is a narrow exception to D6's ordinary action handoff. GET on the unsubscribe URI is non-mutating; mailbox one-click POST uses an opaque single-purpose token and no login/interstitial. All other protected actions use non-mutating GET plus explicit Asym confirmation.
- **INFERRED:** List headers are platform-owned and must be DKIM-covered in delivered canaries. Tenant custom headers cannot override or duplicate them.

### 5.3 Protected-action browser isolation

- **DOCUMENTED:** CSP `default-src` is the fallback for fetch directives such as script, style, image, font, frame, media, manifest, and worker sources, but it does not govern `form-action`. `form-action` must therefore be declared explicitly; browser treatment of redirects after form submission is not fully consistent. [MDN `default-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/default-src), [MDN `form-action`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/form-action)
- **DOCUMENTED:** A CSP nonce should be generated by the server from at least 128 bits of cryptographically secure random data, Base64-encoded, generated freshly for each response, and repeated exactly in the authorized element and the header's `'nonce-…'` source. [MDN `nonce`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/nonce), [MDN `style-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src)
- **INFERRED:** A secret-bearing protected-action landing should default every fetch class to none, allow no script/connect/image/font/frame/report receiver, permit only one inline style block with the exact fresh response nonce, and derive one form-action CSP source from a configured canonical HTTPS origin plus a code-owned exact route. Because CSP policy lists and directives use comma and semicolon delimiters while URI paths may legally contain them, a dedicated serializer must reject raw commas, semicolons, controls, whitespace, quotes, backticks, and non-round-tripping source tokens; policy fixtures must parse back to the exact expected directive map. Literal serialization placeholders must fail closed. Exact path/method/origin/CSRF checks remain server authority, and the POST returns its terminal page directly rather than depending on redirect enforcement.

## 6. Accessibility and localization evidence

### 6.1 WCAG and ATAG

- **DOCUMENTED:** WCAG 2.2 covers text alternatives, semantic relationships, meaningful sequence, color independence, contrast, resize/reflow/text spacing, link purpose, language, keyboard/focus, target size, labels/errors, and programmatic name/role/value and status messages. [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [quick reference](https://www.w3.org/WAI/WCAG22/quickref/?versions=2.2)
- **DOCUMENTED:** ATAG distinguishes accessibility of the authoring tool from support for authors producing accessible content. [ATAG](https://www.w3.org/WAI/standards-guidelines/atag/)
- **DOCUMENTED:** W3C guidance recommends presentation semantics for layout tables so assistive technology does not treat them as data. [WAI tables tutorial](https://www.w3.org/WAI/tutorials/tables/)
- **INFERRED:** The editor/catalog/review/repair surfaces target WCAG 2.2 AA and ATAG principles: keyboard operation, logical focus, accessible names/instructions/errors, non-drag alternatives, target sizes, screen-reader status, zoom/reflow, and non-color state.
- **INFERRED:** The publish gate requires alt text or explicit decoration, meaningful source order, descriptive links, sufficient contrast, no color-only meaning, language/direction, responsive reflow, readable type/spacing, presentation semantics for layout tables, and a reviewed plain-text artifact.
- **UNKNOWN / VERIFY:** WCAG directly defines web-content conformance while email clients implement uneven HTML and assistive-technology support. State WCAG 2.2 AA as the target and publish the named behavior/client matrix; do not claim universal email conformance from lint alone.

### 6.2 Locale identity and proof of readiness

- **DOCUMENTED:** BCP 47 defines structured language tags with language, script, and region distinctions; a tag identifies content but does not prove translation completeness. [RFC 5646](https://www.rfc-editor.org/info/rfc5646/)
- **DOCUMENTED:** Unicode CLDR/LDML defines language matching and plural rules that cannot be reproduced safely by string truncation or English singular/plural substitution. [Unicode LDML](https://unicode.org/reports/tr35/), [CLDR plural rules](https://cldr.unicode.org/index/cldr-spec/plural-rules)
- **DOCUMENTED:** W3C requires programmatic content-language declaration and identifies direction as a separate concern. WCAG explains that language metadata supports correct pronunciation and rendering. [W3C language declarations](https://www.w3.org/International/questions/qa-html-language-declarations.html), [WCAG language of page](https://www.w3.org/WAI/WCAG22/Understanding/language-of-page)
- **INFERRED:** D12 tenant-open activation uses canonical BCP 47 tags and pinned CLDR behavior, but activation requires contract-scoped proof: complete compatible publication, layout/brand, variable formatting, plural/date/number behavior, plain text, fallback, protected meaning, and accessibility for that locale/direction.
- **INFERRED:** Missing or incompatible locale content follows D3's deterministic whole-message fallback or contract block/suppress. Never field-merge languages, silently machine-translate protected content, or equate a locale tag with readiness.

## 7. Retention, privacy, and support evidence

- **DOCUMENTED:** Resend's standard email-data retention is 30 days, while its no-content-storage posture is separately qualified. Its webhook guidance warns that stored events may include email addresses and open/click IP data. [Webhook-data guidance](https://resend.com/docs/dashboard/webhooks/how-to-store-webhooks-data), [sensitive-data storage](https://resend.com/docs/knowledge-base/how-do-i-ensure-sensitive-data-isnt-stored-on-resend)
- **DOCUMENTED:** GDPR Article 5 requires data minimization and storage limitation. The ICO explains that backup data which cannot be immediately erased must be put beyond use and overwritten under an established schedule rather than treated as live data. [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj), [ICO storage limitation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/), [ICO data minimization](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/data-minimisation/)
- **DOCUMENTED:** NIST SP 800-88 Rev. 2 supersedes Rev. 1 and treats cryptographic erase as a sanitization technique whose claim depends on the complete applicable key/material boundary. [NIST SP 800-88 Rev. 2](https://csrc.nist.gov/pubs/sp/800/88/r2/final)
- **INFERRED:** Exact provider-bound bytes need a purpose-bound ceiling distinct from durable body-free history and optional Recent sent copy. The safe lean rule is one closed class per contract delivery step, an immutable earliest-applicable deadline, immediate loss of decrypt/replay authority on terminal acceptance/rejection/no-send or provider-idempotency expiry, bounded primary purge, and backup-aware erasure evidence. Keeping an indeterminate outcome forever does not justify retaining its readable body forever once no safe provider retry can use it.
- **DOCUMENTED:** OWASP recommends minimizing sensitive storage, using appropriate authenticated encryption, separating keys from protected data, and excluding secrets from logs. [OWASP Cryptographic Storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html), [OWASP Logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- **INFERRED:** D14's recent readable sent copy is a distinct encrypted, access-audited support object with the ratified Off/7-day/30-day policy and visible expiry. It is not retry material, full-text search, analytics, marketing data, official-document truth, or a permanent archive.
- **INFERRED:** Durable history preserves minimized version, hash, sender/reply profile, classification, recipient reference, provider IDs/events, timestamps, and outcome evidence. Auth tokens, protected action URLs, payment secrets, care/restricted data, arbitrary webhook payloads, and a forever rendered body are excluded by schema.
- **INFERRED:** Official receipts/statements remain source-owned artifacts; the recent email wrapper can expire without deleting the official record. Backup expiry is disclosed separately and expired content remains inaccessible while backup rotation completes.
- **INFERRED:** “Purged from live systems,” “Backup expiry pending,” and “Cryptographic erasure verified” are distinct states. Deleting ciphertext is not verified erasure while any usable wrapping key or recoverable backup remains; restored systems must apply the external destruction ledger before decrypting or serving.
- **INFERRED:** The staff view shows exact sent content only while eligible, then a truthful **Sent copy expired** state with retained delivery/version evidence. Access is tenant/site/capability checked and audited.

## 8. Transport-dark SMS reservation

- **DOCUMENTED:** Twilio treats programmatic messaging as application-to-person traffic and requires appropriate consent, retained evidence of how/when consent was obtained, sender identification, and opt-out instructions. Informational and promotional traffic have different consent expectations. [Twilio Messaging Policy](https://www.twilio.com/en-us/legal/messaging-policy)
- **DOCUMENTED:** Twilio Advanced Opt-Out supports opt-out, opt-in, and help keyword sets; matching is case-insensitive. `STOP` cannot be removed, while `START` and `UNSTOP` cannot be removed from opt-in behavior. `OptOutType` indicates Twilio already sent the configured response, so the application should not send a duplicate. [Advanced Opt-Out](https://www.twilio.com/docs/messaging/tutorials/advanced-opt-out)
- **DOCUMENTED:** Advanced Opt-Out is disabled by default and requires support to disable after activation. Toll-free messaging has additional STOP/re-opt-in behavior. [Advanced Opt-Out](https://www.twilio.com/docs/messaging/tutorials/advanced-opt-out)
- **DOCUMENTED:** US 10DLC application messaging requires Brand and Campaign registration with opt-in, opt-out, and help information; nonprofit/government onboarding exists. Toll-free sending to the US/Canada requires verification approval. [A2P 10DLC](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc), [nonprofit/government onboarding](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/onboarding-for-government-and-non-profit-agencies), [toll-free verification](https://www.twilio.com/docs/messaging/compliance/toll-free/console-onboarding)
- **INFERRED:** D9 models provider-neutral, channel-scoped consent provenance, purpose, sender-registration readiness, and protected STOP/HELP semantics only. `send_capability` is false for every SMS binding in Phase 17.
- **INFERRED:** No Twilio credential, phone number, webhook, preview/test send, queue, delivery state machine, or SMS editor action ships. Tenants may not remove STOP/HELP obligations or make consent cross-tenant, cross-sender, or cross-purpose.
- **INFERRED:** Keep readiness simple (`not_configured`, `pending`, `approved`, `rejected`, `suspended` or the ratified equivalent) and non-executable. A later transport phase maps it to the selected provider and jurisdiction.
- **UNKNOWN / VERIFY:** Twilio is current evidence, not a ratified future provider. Provider, country, number type, carrier rules, fees, review duration, and legal interpretation can change; Phase 17 must not promise registration timing or encode Twilio-specific runtime logic into generic contracts.

## 9. Unlayer, Beefree, and tenant portability

### 9.1 Official vendor capabilities and limits

- **DOCUMENTED:** Unlayer uses editable design JSON, reloads it with `loadDesign`, and exports HTML plus design JSON. Its documentation recommends retaining JSON for re-editing and HTML for delivery/rendering. [Unlayer load/save](https://docs.unlayer.com/builder/latest/load-and-save-designs), [export HTML](https://docs.unlayer.com/builder/latest/export-html)
- **DOCUMENTED:** Unlayer's main visual builder does not provide general raw-HTML import for full visual editing. Its raw-HTML path is limited/separate. [Unlayer raw HTML](https://help.unlayer.com/en/articles/11689421-how-to-use-raw-html-templates-in-unlayer)
- **DOCUMENTED:** Unlayer's `safeHtml` option sanitizes end-user HTML and unsafe attributes and is recommended in multi-tenant contexts. [Unlayer safe HTML](https://help.unlayer.com/en/articles/12746664-preventing-javascript-execution-inside-the-editor)
- **DOCUMENTED:** Beefree save events return editable JSON and HTML with a `templateVersion`; its Content Services API converts current Beefree JSON to HTML or plain text. [Beefree methods/events](https://docs.beefree.io/beefree-sdk/getting-started/readme/installation/methods-and-events), [Beefree export API](https://docs.beefree.io/beefree-sdk/apis/content-services-api/export)
- **DOCUMENTED:** Beefree's separate HTML Importer converts eligible static email HTML to Beefree JSON but documents input constraints, partial support, possible fidelity loss/manual correction, unpredictable unsupported tags, and no automatic merge-tag/dynamic-content mapping. [Beefree HTML Importer](https://docs.beefree.io/beefree-sdk/apis/html-importer-api)
- **DOCUMENTED:** Both vendors expose powerful custom-block/add-on and permission capabilities, demonstrating tenant freedom but also an executable-extension/security surface that must be deliberately bounded. [Unlayer custom tools](https://docs.unlayer.com/builder/latest/tools/custom), [Beefree custom add-ons](https://docs.beefree.io/beefree-sdk/builder-addons/custom-addons)

### 9.2 D19 package, conversion, and transfer pins

- **INFERRED:** No official evidence supports a lossless editable cross-vendor interchange format. Unlayer JSON, Beefree JSON, and Asym/Tiptap JSON are separate proprietary/versioned schemas. HTML is portable rendered output, not guaranteed editable truth.
- **INFERRED:** The versioned Asym package includes a manifest/schema version; canonical bounded Asym document; immutable HTML/text; content-addressed assets or governed references with hashes and rights/provenance; locale/direction; contract/variable schema; layout/Brand Kit references; compiler/dependency/hash evidence; and conversion warnings.
- **INFERRED:** Packages exclude API keys, webhook secrets, auth/action tokens, payment secrets, donor/staff PII, communication events, consent records, sent support copies, and provider IDs or internal IDs that would falsely convey destination authority.
- **INFERRED:** Same-format import remains editable only after schema/version checks and ordered loss-detecting migration. Foreign Unlayer/Beefree/HTML import enters non-live staging, produces a structured supported/approximated/rejected/lost report and side-by-side preview, requires destination remapping, and never auto-publishes.
- **INFERRED:** Cross-tenant transfer is bilateral and destination-owned: the source authorizes a minimized export; the destination explicitly accepts it; the destination creates new IDs and maps assets, site, locale, Brand Kit, sender, Reply-To, contract, and binding; then it reviews and publishes a new version. Source history remains unchanged.
- **INFERRED:** Exported HTML remains available for practical tenant freedom but is labeled truthfully as rendered output that may not remain visually editable elsewhere.
- **INFERRED:** Do not add Unlayer or Beefree runtime dependencies solely to import proprietary JSON. Add a named adapter only after a representative tenant corpus proves demand and acceptable fidelity; the core package remains vendor-neutral.
- **UNKNOWN / VERIFY:** Exact vendor schema versions, migration guarantees, API availability/pricing, hosted-asset longevity, custom-block behavior, merge tags, licensing, and conversion fidelity vary. A named compatibility claim requires a fixed-corpus test against the exact vendor API/version and a published loss matrix.

## 10. Release-blocking runtime probes

Every item is **UNKNOWN / VERIFY** until the exact implementation passes it:

1. **Credential and domain proof:** confirm a domain-scoped sending key's exact capabilities, prove overprivileged-key rejection, ensure the secret never reaches client/log/analytics, and verify two-slot rotation without interrupting the active connection.
2. **Connection isolation:** prove tenant A's key, webhook secret, provider ID, tag, domain, and event cannot read, send, or mutate tenant B, and that neither tenant can cross into or borrow the separate service-only platform owner or its connection. Prove the reverse platform-to-tenant boundary too. Verify no endpoint scans across scope-owner secrets.
3. **Rate/quota behavior:** capture current rate/quota headers; test 429/backoff, scope-owner fairness and tenant-owner/service-only-platform-owner isolation, quota/billing/suspension states, worker restart, and sustained spikes without silent fallback.
4. **Sender/Reply-To:** deliver a real-sink canary and inspect exact From, display name, Reply-To/no-reply, SPF, DKIM, DMARC, list headers, Message-ID, HTML/text, and tracking. Verify a provider-successful arbitrary local part cannot bypass D20.
5. **Provider template boundary:** prove production sends use the frozen Asym HTML/text/hash and cannot change when a Resend template/default is edited. If any provider template remains, reconcile variable-limit documentation and version behavior.
6. **Single-send idempotency:** test page refresh, worker restart, duplicate job, concurrent same-key request, changed-payload key reuse, timeout after provider acceptance, reconciliation, and provider-key expiry without duplicate communication.
7. **Batch matrix:** test 1/100/101 entries, deterministic order, strict invalid-item rejection, permissive indexed errors, stable response mapping, scope-owner/connection/sender partitioning, timeout after partial acceptance, webhook reconciliation, and no whole-batch blind replay.
8. **Webhook reducer:** test invalid signature, parsed-before-verified attempt, duplicate `svix-id`, manual replay, unknown/provider-ID collision, cross-scope or cross-owner forgery, older event after terminal event, endpoint disablement, lag, and repair.
9. **Suppression/reputation:** exercise delivered, bounced, complained, and suppressed Resend fixtures; prove region-wide suppression is not treated as profile-specific; show that a missing Gmail complaint event is not interpreted as zero complaints.
10. **Editor/compiler:** pin versions and prove allowed/forbidden nodes, unknown-content preservation/migration, malicious paste/link/image/attribute, content/asset limits, deterministic HTML/text/hash, optimistic concurrency, atomic publish, and authoring outage with last-known-good artifacts.
11. **Official/protected content:** verify tenant copy/import cannot edit authoritative receipt/payment/security facts, legal identity, action destination, or classification; protected units remain visible/explained and compile from source-owned snapshots.
12. **Supabase Auth Hook:** test raw signature, five-second budget, timeout/non-2xx/replay, confirmation, invitation, recovery, magic link, link expiry, redirect allow-list, and both Secure Email Change messages with exact token mapping and no secret persistence.
13. **RFC 8058 and scanners:** verify GET never mutates, opaque one-click POST needs no cookie/login and does not redirect, required headers are DKIM-covered, visible unsubscribe exists, and ordinary protected links require Asym confirmation.
14. **Deliverability:** prove SPF/DKIM/DMARC/alignment, purpose-separated sender family, complaint/bounce visibility, tracking posture, TLS, gradual-volume readiness, and truthful accepted/sent/delivered/read distinctions.
15. **Accessibility:** combine static checks with keyboard/screen-reader editor review, non-drag operation, focus/status behavior, 200 percent zoom, reflow, images-off, dark mode, long locale, RTL, plain text, and focused Gmail/Outlook/Apple Mail tests.
16. **Locale readiness:** test valid/invalid BCP 47 tags, pinned CLDR match/plural/date/number behavior, direction, complete contract fixture coverage, missing translation, D3 whole fallback, and no partial live activation.
17. **Retention:** test Off/7/30-day copy policy, protected-class exclusion, support authorization/audit, scheduled-send timing, exact expiry, backups beyond use, official-document link survival, provider-retention disclosure, and deletion independent from retry evidence.
18. **SMS darkness:** prove every SMS binding and UI remains non-executable and that import, API, workflow, catalog, preview, or tenant configuration cannot create a send path or weaken protected STOP/HELP/consent data.
19. **Foreign conversion:** run representative Unlayer JSON/HTML, Beefree JSON/HTML, standards-compliant email HTML, assets, merge tags, and custom blocks; record exact preserved, approximated, rejected, and lost features before advertising compatibility.
20. **Bilateral transfer:** test source authorization, destination acceptance, asset-rights rejection, destination remapping/new IDs, conflict handling, rollback, audit, and structural exclusion of credentials, PII, consent, sent copies, and history.

## 11. Primary official source index

### Resend

- [API introduction](https://resend.com/docs/api-reference/introduction)
- [Usage limits](https://resend.com/docs/api-reference/rate-limit)
- [Team settings](https://resend.com/docs/dashboard/settings/team)
- [Multi-tenant setup](https://resend.com/docs/knowledge-base/setting-up-resend-for-multi-tenants)
- [API keys](https://resend.com/docs/dashboard/api-keys/introduction)
- [Create API key](https://resend.com/docs/api-reference/api-keys/create-api-key)
- [List domains](https://resend.com/docs/api-reference/domains/list-domains)
- [Key handling](https://resend.com/docs/knowledge-base/how-to-handle-api-keys)
- [Domains](https://resend.com/docs/dashboard/domains/introduction)
- [DMARC](https://resend.com/docs/dashboard/domains/dmarc)
- [Domain Claim](https://resend.com/changelog/domain-claim)
- [Sender addresses](https://resend.com/docs/knowledge-base/how-do-I-create-an-email-address-or-sender-in-resend)
- [Send email](https://resend.com/docs/api-reference/emails/send-email)
- [Official Node send options](https://github.com/resend/resend-node/blob/5c4d9128d6aa8a8cbd1671cb673add363deb324c/src/emails/interfaces/create-email-options.interface.ts)
- [Custom headers](https://resend.com/docs/dashboard/emails/custom-headers)
- [Templates](https://resend.com/docs/dashboard/templates/introduction)
- [Create template](https://resend.com/docs/api-reference/templates/create-template)
- [Get template](https://resend.com/docs/api-reference/templates/get-template)
- [Publish template](https://resend.com/docs/api-reference/templates/publish-template)
- [Idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys)
- [Errors](https://resend.com/docs/api-reference/errors)
- [Batch sending](https://resend.com/docs/dashboard/emails/batch-sending)
- [Batch validation modes](https://resend.com/changelog/batch-validation-modes)
- [Webhooks](https://resend.com/docs/webhooks/introduction)
- [Webhook event types](https://resend.com/docs/webhooks/event-types)
- [Webhook retries and replays](https://resend.com/docs/webhooks/retries-and-replays)
- [Webhook verification](https://resend.com/docs/webhooks/verify-webhooks-requests)
- [Email suppressions](https://resend.com/docs/dashboard/emails/email-suppressions)
- [Test emails](https://resend.com/docs/dashboard/emails/send-test-emails)
- [Domain tracking](https://resend.com/docs/dashboard/domains/tracking)
- [Account quotas and limits](https://resend.com/docs/knowledge-base/account-quotas-and-limits)
- [Webhook-data storage](https://resend.com/docs/dashboard/webhooks/how-to-store-webhooks-data)
- [Sensitive-data storage](https://resend.com/docs/knowledge-base/how-do-i-ensure-sensitive-data-isnt-stored-on-resend)
- [Changelog](https://resend.com/changelog/)

### Structured authoring, rendering, and official content

- [React Email Editor](https://react.email/docs/editor/overview)
- [React Email export](https://react.email/docs/editor/features/email-export)
- [React Email Editor API](https://react.email/docs/editor/api-reference/email-editor)
- [React Email render utility](https://react.email/docs/utilities/render)
- [Tiptap persistence](https://tiptap.dev/docs/editor/core-concepts/persistence)
- [Tiptap schema/content checks](https://tiptap.dev/docs/editor/core-concepts/schema)
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [IRS written acknowledgments](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments)
- [IRS substantiation](https://www.irs.gov/charities-non-profits/substantiating-charitable-contributions)
- [CRA receipt requirements](https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/operating-a-registered-charity/issuing-receipts/what-information-must-on-official-donation-receipt-a-registered-charity.html)
- [CRA computer-generated receipts](https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/policies-guidance/policy-statement-014-computer-generated-official-donation-receipts.html)
- [Stripe receipts](https://docs.stripe.com/receipts)
- [Stripe invoice customization](https://docs.stripe.com/invoicing/customize)
- [PCI SSC FAQ 1146](https://www.pcisecuritystandards.org/faqs/1146/)
- [PCI SSC FAQ 1310](https://www.pcisecuritystandards.org/faqs/1310/)
- [Knock commits](https://docs.knock.app/version-control/commits)
- [Knock environments](https://docs.knock.app/version-control/environments)
- [Knock template editor](https://docs.knock.app/template-editor/overview)
- [Postmark Layouts](https://postmarkapp.com/support/article/1172-using-postmark-layouts)
- [Braze drag-and-drop email](https://www.braze.com/docs/user_guide/channels/email/drag_and_drop)
- [Braze Content Blocks](https://www.braze.com/docs/user_guide/messaging/design_and_edit/content_blocks)
- [Braze email global styles](https://www.braze.com/docs/user_guide/channels/email/customize/email_global_style_settings)
- [Braze email templates](https://www.braze.com/docs/user_guide/messaging/templates/email_templates/email_template)

### Authentication, deliverability, and standards

- [Supabase Send Email Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook)
- [Supabase Auth Hooks](https://supabase.com/docs/guides/auth/auth-hooks)
- [Supabase passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase `generateLink`](https://supabase.com/docs/reference/javascript/auth-admin-generatelink)
- [Supabase `verifyOtp`](https://supabase.com/docs/reference/javascript/auth-verifyotp)
- [Gmail sender guidelines](https://support.google.com/mail/answer/81126?hl=en)
- [Yahoo sender best practices](https://senders.yahooinc.com/best-practices/)
- [Yahoo sender FAQ](https://senders.yahooinc.com/faqs/)
- [RFC 5322](https://datatracker.ietf.org/doc/html/rfc5322)
- [RFC 3834](https://www.rfc-editor.org/rfc/rfc3834.html)
- [RFC 8058](https://datatracker.ietf.org/doc/html/rfc8058)

### Accessibility, locale, and privacy

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/?versions=2.2)
- [ATAG](https://www.w3.org/WAI/standards-guidelines/atag/)
- [WAI tables tutorial](https://www.w3.org/WAI/tutorials/tables/)
- [RFC 5646 / BCP 47](https://www.rfc-editor.org/info/rfc5646/)
- [Unicode LDML](https://unicode.org/reports/tr35/)
- [CLDR plural rules](https://cldr.unicode.org/index/cldr-spec/plural-rules)
- [W3C language declarations](https://www.w3.org/International/questions/qa-html-language-declarations.html)
- [WCAG language of page](https://www.w3.org/WAI/WCAG22/Understanding/language-of-page)
- [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [ICO storage limitation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/)
- [ICO data minimization](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/data-minimisation/)
- [OWASP Cryptographic Storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [OWASP Logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [NIST SP 800-88 Rev. 2](https://csrc.nist.gov/pubs/sp/800/88/r2/final)

### SMS reservation

- [Twilio Messaging Policy](https://www.twilio.com/en-us/legal/messaging-policy)
- [Twilio Advanced Opt-Out](https://www.twilio.com/docs/messaging/tutorials/advanced-opt-out)
- [A2P 10DLC](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc)
- [Nonprofit/government onboarding](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/onboarding-for-government-and-non-profit-agencies)
- [Toll-free verification](https://www.twilio.com/docs/messaging/compliance/toll-free/console-onboarding)

### Portability

- [Unlayer load/save](https://docs.unlayer.com/builder/latest/load-and-save-designs)
- [Unlayer export HTML](https://docs.unlayer.com/builder/latest/export-html)
- [Unlayer raw HTML](https://help.unlayer.com/en/articles/11689421-how-to-use-raw-html-templates-in-unlayer)
- [Unlayer safe HTML](https://help.unlayer.com/en/articles/12746664-preventing-javascript-execution-inside-the-editor)
- [Unlayer custom tools](https://docs.unlayer.com/builder/latest/tools/custom)
- [Beefree methods/events](https://docs.beefree.io/beefree-sdk/getting-started/readme/installation/methods-and-events)
- [Beefree export API](https://docs.beefree.io/beefree-sdk/apis/content-services-api/export)
- [Beefree HTML Importer](https://docs.beefree.io/beefree-sdk/apis/html-importer-api)
- [Beefree custom add-ons](https://docs.beefree.io/beefree-sdk/builder-addons/custom-addons)

## 12. Dated repository send, binding, and exclusion census

**Observed:** 2026-07-19 against this worktree. The census searched runtime code, schema, and migrations for the Resend SDK constructor and send methods, the shared `sendEmail` seam and wrapper callers, `email_send_logs`, `email_events`, `email_template_system_bindings`, and `notification_queue`, excluding tests only when identifying production writers. This is the checked-in M0 baseline; implementation must refresh it at build/cutover and CI must reject a newly discovered direct product sender or unknown catalog key.

### Current runtime writers and adapters

| Current anchor                                                                                  | Observed role                                                                                      | Phase 17 disposition                                                                                                                                   |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/email/resend.ts`                                                                      | sole located `new Resend(...)` construction and `resend.emails.send(...)` external-email primitive | retain as the Resend-only adapter behind immutable Phase 6 preparation; no product meaning or tenant-selected headers live here                        |
| `packages/api/src/giving/receipts.ts`                                                           | successful and updated/replacement receipt calls plus `email_send_logs` persistence                | migrate to `giving_receipt_issued_v1`, `giving_receipt_replaced_v1`, and the exact correction producer mapping; Phase 7 artifact remains authoritative |
| `packages/api/src/admin/contribution-operations/notifications/send.ts`                          | current contribution-correction family rendering/sending                                           | one producer adapter per enumerated correction key; preserve contract-specific no-fallback and retire direct content authority                         |
| `packages/api/src/admin/contribution-operations/approval-notification-email.ts`                 | current approval email sibling                                                                     | map to request/reminder/escalation/outcome only where the producer proves that exact occurrence; email remains an optional plan sibling                |
| `packages/api/src/email/test-send.ts` and `packages/api/src/email/template-test-send.ts`        | Resend connection and synthetic template test operations                                           | remain operational tests with minimized test/send evidence; never donor communication history or system-message catalog entries                        |
| `packages/api/src/email/webhooks/resend.ts`                                                     | signed provider-event ingest/reducer over `email_send_logs` / `email_events`                       | evolve into the one per-connection raw-signature, dedupe, same-scope binding, normalized evidence adapter                                              |
| `packages/api/src/email/template-store.ts` plus migration `20260611151000_...notifications.sql` | template/version storage and legacy family/variant system binding                                  | migrate into immutable publications and the trigger-binding compatibility adapter; binding never grants lifecycle/readiness                            |
| `packages/email/resend.ts` receiving methods and Support Hub outbound references                | inbound-provider/support seams, not another located product send writer                            | Phase 26 owns inbound/replies; history foreign keys do not create system-message meaning                                                               |

### Legacy stores and exclusions

- `supabase/schema.sql` and migration history contain `email_send_logs` and `email_events`; they are real evidence primitives to adapt, not a second Phase 17 history.
- `notification_queue` appears in schema, migrations, seed, indexes, grants, and
  demo counts. The checked-in schema snapshot says RLS disabled, while later
  migration history enables staff-scoped RLS and authenticated grants; deployed
  state therefore requires explicit verification. This census found no current
  production send worker. Phase 17 must not revive it; any still-needed data is
  classified and migrated or the table is retired through a separate safe
  schema change.
- `email_template_system_bindings` is real and service-only. It is a migration alias from legacy family/variant to stable key/publication, never the generalized catalog or activation authority.
- Current test sends, provider canaries, human-authored support replies, inbound email, campaigns/newsletters, and missionary personal email are explicitly outside the system-message catalog. External delivery still uses its owning phase and the Phase 6 seam where applicable.
- `refund_started` remains an orphan meaning pending producer/history proof. No Target Live contract aliases it silently.

### Closure rule

The implementation-generated census must enumerate every external-email SDK call, shared send-seam caller, product notification writer, system binding, Supabase Auth Hook, provider webhook, scheduled/background sender, test/canary, inbound path, and legacy queue row type with one of: exact Live/Reserved/Retired key, operational test, human-authored owning phase, inbound owning phase, history-only alias, or remove/retire. The catalog generation cannot activate while any runtime writer or obligation is **Unknown**. Repository architecture tests permit the Resend SDK only inside the one adapter and require every platform/system-generated producer to select only its code-generated event/plan handle; the non-exported Phase 6 resolver derives and validates the compatible activation generation and rejects any caller-supplied generation authority.
