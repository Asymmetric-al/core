# Phase 20 seasonal capacity and provider-certification research evidence

**Status:** Ratified grooming evidence
**Decision:** D15 — workload-shaped certified capacity
**Decision status:** Ratified as Phase 20 D15 on 2026-07-26
**Research date:** 2026-07-26
**Scope:** QuickBooks Online and Xero direct Accounting Release delivery,
provider readback, seasonal load, admission, backpressure, certification, and
staff UX

## Executive finding

Option C-prime is the only production-safe choice, but it should reuse the
authorities Phase 20 already established:

- the D7 **QBO Capability Certificate** and D8 **Xero Capability Certificate**
  prove destination-specific provider capabilities, tier, scope, and material
  limits;
- the immutable D2 **Provider Delivery Plan** contains the exact provider
  operations, payload digests, batching, readbacks, and artifact lineage for
  one Accounting Release; and
- a product-owned, versioned **Certified Execution Envelope** records the
  provider-adapter workload shapes Asym has actually proved.

This avoids a second capacity subsystem. At release preflight, Asym compiles the
real Accounting Release into provider operations, validates every operation
against the applicable execution envelope and capability certificate, and
derives a live delivery-window forecast from current quota, queue load,
provider health, and reserved recovery/readback capacity.

A source-item count is not a capacity unit. Ten thousand source transactions
can compile into a small number of summary journal operations or thousands of
detail operations, depending on the tenant's ratified Posting Profile, mapping,
provider carrier plan, line count, attachments, and exact-readback contract.
Capacity must therefore be based on the compiled operation graph rather than a
universal gift, designation, or Accounting Release count.

The staff experience should remain one quiet readiness statement:

- `Ready to send to QuickBooks`
- `Ready to send to Xero`
- `Queued — expected today`
- `Waiting for QuickBooks — no action needed`
- `Waiting for Xero capacity — expected after <time>`
- `Needs attention before it can be sent`

Raw quotas, payload sizes, and provider headers remain available under
`Why this estimate?`, but they are not the default interface. Asym never
silently changes posting grain, carrier plan, Accounting Release, destination,
or delivery lane to make a workload fit.

## Research method and confidence

Provider facts below come only from current first-party Intuit and Xero
documentation. The pages were checked on 2026-07-26. Where two official pages
disagree, this document records the conflict and recommends a conservative
tested rule rather than choosing the more permissive number.

Provider documentation, tiers, and commercial terms can change. Values in this
document are research evidence, not runtime constants. Production adapters
must carry versioned provider-contract metadata, and launch gates must verify
the actual developer-portal tier and current provider documentation.

## QuickBooks Online provider evidence

### REST and batch throttles

Intuit's current [API call limits and throttles][qbo-limits] page states:

- 500 REST requests per minute per `realmId`;
- 10 REST requests per second per `realmId` and app;
- 40 batch requests per minute per `realmId` and app;
- 120 batch requests per minute per `realmId`;
- a combined 800 requests per minute per `realmId` and app when the app also
  accesses endpoints outside QuickBooks Online;
- HTTP 429 after throttling, with an instruction to wait 60 seconds before
  retrying; and
- a 120-second request timeout.

These are independent constraints. A scheduler that respects only the
500-per-minute headline can still breach the 10-per-second or batch limits.

The same limits page recommends no more than 30 payloads in one batch.
However, Intuit's current [batch-operation overview][qbo-batch] says a batch can
contain **up to 10 payloads**. These two official pages conflict.

**Permanent rule:** Asym must not encode 30 as a supported production batch
size. The initial certified envelope should use at most 10 payloads and must
prove that exact number in the target sandbox and production assessment.
Larger batches may be enabled only through a later provider-confirmed,
production-shaped certification version. A provider error that reports a
different limit is runtime evidence for that attempt, not permission to mutate
the active envelope automatically.

Intuit also notes that requests execute in a multithreaded environment and may
have timing issues. Dependent provider operations must remain ordered outside a
batch; a batch cannot be treated as an atomic Accounting Release transaction.

### Queries, transaction shape, attachments, and timeouts

Intuit's [query documentation][qbo-query] states:

- the default query result is 100 entities;
- the maximum response is 1,000 entities; and
- larger result sets require pagination.

Query responses return all populated attributes and do not support arbitrary
projections. Broad query-before-retry scans can therefore consume more time,
CorePlus calls, and response volume than exact provider-ID reads.

The [limits page][qbo-limits] additionally states that each transaction other
than Journal Entry can contain at most:

- 10,000 line items;
- 10,000 linked transactions; and
- 10,000 attachments.

The page expressly excludes Journal Entry from these transaction limits and
does not provide a replacement Journal Entry line maximum. Asym must not infer
that a 10,000-line Journal Entry is supported merely because other transaction
types allow that number. Journal line count, serialized bytes, provider
latency, and exact-readback behavior must be proven as one workload shape.

Intuit's [attachment workflow][qbo-attachments] allows multiple files in one
upload request up to 100 MB total. Attachment upload is a separate provider
operation and cannot be assumed to share the journal transaction's capacity or
outcome.

**Permanent rules:**

- certify serialized payload bytes and line count together;
- keep every provider object independently balanced where the provider recipe
  requires balance;
- split only at deterministic, accounting-equivalent boundaries established by
  the immutable Provider Delivery Plan;
- use exact reads by returned provider ID whenever possible;
- treat attachment calls as separately metered and recoverable operations; and
- never allow a request to approach the 120-second timeout based only on a
  theoretical line maximum.

### Idempotency, ambiguous outcomes, and response parsing

Intuit's [basic ID and field definitions][qbo-request-id] strongly recommend a
unique `requestid` on writes, updates, and deletes. Reusing the same request
content and request ID lets the provider return the original response rather
than repeat the operation.

Important constraints include:

- uniqueness is scoped to one QuickBooks company;
- the ordinary request ID maximum is 50 characters;
- a batch request ID maximum is 36 characters;
- a batch item ID is limited to 10 characters when the request ID is present;
  and
- a batch retry is the same request only when both request ID and batch IDs
  match the original.

Intuit also documents a stable `DocNumber` plus query-before-retry as its safest
create-recovery pattern after a network error or 5xx. `DocNumber` alone is not
an idempotency key.

The [error-code documentation][qbo-errors] warns that:

- HTTP 200 can still contain a `Fault`;
- every `BatchItemResp` can contain its own fault;
- HTTP 500 should be resubmitted once, then escalated if it persists;
- HTTP 503 means temporary unavailability;
- error 1040 reports an oversized batch;
- error 5010 means a stale object must be refreshed;
- errors 6200 and 6210 represent a closed accounting period; and
- a company may be locked, under maintenance, reset, have an expired
  subscription, or lose the authorizing user.

**Permanent rules:**

- parse the body and every batch item even when HTTP status is 200;
- preserve one stable operation identity and provider request ID across an
  idempotent retry;
- after a timeout or missing response, quarantine the operation as
  `Outcome unknown` and perform exact lookup/readback before any new write;
- never retry an entire Accounting Release because one batch item is uncertain;
- do not treat 429, maintenance, authorization loss, closed books, or business
  validation as one generic retryable failure; and
- retain `intuit_tid`, request identity, response/fault details, attempt
  sequence, and timing as support evidence without donor or secret leakage.

### Intuit commercial metering and tier implications

The current [Intuit App Partner Program FAQ][qbo-partner-faq] says:

- Builder, Silver, Gold, and Platinum are workspace-level partner tiers;
- Builder includes 500,000 successful production CorePlus calls per workspace
  per calendar month and blocks calls above that cap;
- paid tiers remove the CorePlus call cap but charge for use above included
  credits;
- most data-in creates and updates are Core calls and are unmetered;
- most reads, company queries, and reports are CorePlus and are metered;
- errored calls and sandbox calls are not metered;
- usage is measured at app level and aggregated to the workspace;
- the Builder cap resets on the first of the month;
- subscribing to Silver may take up to one hour to lift the Builder cap; and
- paid tiers do **not** provide higher throttle limits or enhanced API
  performance.

Exact readback therefore has a real CorePlus usage consequence even when writes
are unmetered. A correct design must preserve exact readback and budget for it;
it must not weaken evidence to reduce cost.

**Permanent rules:**

- model throttling, monthly CorePlus credits, and commercial cost separately;
- reserve enough CorePlus capacity for exact readback, ambiguity recovery, and
  drift checks before admitting new writes;
- read the actual app/workspace tier from controlled operational configuration
  and reconcile it against the developer portal;
- warn operators before a projected monthly cap or payment failure can block
  direct delivery; and
- never tell tenant staff that buying a higher Intuit tier makes their release
  execute faster.

### Intuit production and ongoing-compliance gates

Intuit's [publishing requirements][qbo-production] apply to apps connecting to
production companies whether the app is public or private. Production
credentials require an approved self-assessment, and apps undergo annual
security assessment.

The same requirements call for:

- 24/7 operation with 99.95% availability in a measurable interval;
- end-user notification and support during incidents;
- thorough production testing and appropriate handling of all API errors;
- capture of `intuit_tid` and the sequence of calls for provider support; and
- secure storage of provider credentials and customer IDs.

Marketplace listing has additional technical, security, and marketing review.
The current [app-review timeline][qbo-review] estimates 10 business days for
technical review after readiness confirmation, up to 30 business days for
security review, and five business days for marketing review. These are
estimates, not commitments.

Intuit's [July 2026 release notes][qbo-release-notes] show that the provider is
actively changing review timelines, limits documentation, and platform
contracts. Launch planning cannot assume a review starts or finishes on the
product's desired date.

## Xero provider evidence

### Tenant, app-wide, and tier-specific rate limits

Xero's current [rate-limit documentation][xero-rate-limits] states:

- no more than five calls may be in progress for one tenant;
- 60 calls per minute per tenant;
- 1,000 calls per day per tenant for Starter;
- 5,000 calls per day per tenant for Core and higher tiers; and
- 10,000 calls per minute across the whole app and all tenants.

Tenant minute and daily limits use fixed windows that reset at different times
for each tenant. They are not a single midnight reset Asym can predict.

Every successful response provides:

- `X-AppMinLimit-Remaining`;
- `X-MinLimit-Remaining`; and
- `X-DayLimit-Remaining`.

HTTP 429 responses include:

- `X-Rate-Limit-Problem`, identifying the breached limit; and
- `Retry-After`, giving the number of seconds before that tenant may resume.

Xero says it cannot reset these limits. A tenant that consumes its daily quota
must wait for its window even if Asym has unused app-global capacity.

**Permanent rules:**

- use a provider-specific governor for tenant concurrency, tenant minute,
  tenant daily, and app-global minute limits;
- update runtime quota state from every response header;
- stop calls only for the affected tenant when a tenant limit is reached;
- honor `Retry-After` exactly and add jitter only after that floor;
- protect the 10,000-per-minute app budget with tenant-fair scheduling; and
- never hard-code a midnight or UTC daily reset.

### Xero batching, request size, pagination, and partial success

Xero recommends sending roughly 50 nodes in one supported bulk request so the
payload remains around or below 3.5 MB. Its [OAuth/API limits page][xero-limits]
also states a hard maximum request size of 10 MB and recommends bundles of up
to 50 to avoid long-running inserts.

The 50-node value is practical guidance, not a universal endpoint contract.
The 10 MB maximum does not make a near-10 MB accounting write operationally
safe.

Xero's current [paging guidance][xero-paging] permits supported endpoints to
use `pageSize` values up to 1,000, while older rate-limit examples still
describe 100-item pages. Some endpoint references use a 100-record default and
support a larger explicit page size; the Journals read endpoint returns at most
100 journals per call. Pagination and response detail are endpoint-specific.

For supported bulk writes, `summarizeErrors=false` returns item-level status and
validation errors. The [response-code documentation][xero-response-codes]
warns that the overall HTTP response may be 200 even when some elements failed.

**Permanent rules:**

- certify each provider endpoint, node count, serialized byte envelope,
  response shape, and latency separately;
- begin with no more than 50 nodes only where that endpoint officially supports
  bulk mutation and production-shaped proof passes;
- parse and persist every item outcome; HTTP 200 is never whole-batch proof;
- use endpoint-specific pagination with deterministic ordering and termination;
- choose page size from measured latency and egress, not the largest documented
  number; and
- never present a provider batch as an atomic Accounting Release.

### Xero idempotency and ambiguity window

Xero's [idempotency documentation][xero-idempotency] says:

- `Idempotency-Key` applies to POST, PUT, and PATCH mutations;
- the maximum key length is 128 characters;
- the same key and exact request return the cached response;
- reusing a key for a different URL, body, method, or request produces an
  error;
- keys are retained for only six minutes;
- duplicate retries still consume rate-limit quota;
- internal failures may be cached and returned again; and
- when a failure repeats, the client should GET the resource to determine
  whether it exists before using a new key.

If Xero's idempotency service itself is unavailable, Xero returns 500 rather
than process the mutation without protection.

**Permanent rules:**

- preserve one stable operation identity and exact payload digest;
- reuse the same idempotency key only for the exact retry within its valid
  window;
- never assume the six-minute cache provides durable exactly-once delivery;
- after missing, cached-error, expired-key, or contradictory evidence, perform
  exact provider lookup/readback before issuing a new key;
- reserve rate quota for those lookups because retries are also counted; and
- quarantine uncertainty per operation rather than replaying a bulk request.

### Xero outages and provider errors

The [Xero response-code documentation][xero-response-codes] distinguishes:

- 401 authorization loss;
- 403 permission failure;
- 429 rate-limit exhaustion;
- 500 internal provider error;
- 503 provider unavailability; and
- 503 for one organization being temporarily offline.

Xero recommends a retry interval of about five minutes for an organization
offline response. Its public [API status page][xero-status] provides provider
incident visibility.

**Permanent rules:**

- keep authentication, authorization, throttling, organization-offline,
  provider-wide outage, validation, and ambiguous-write states distinct;
- surface `Waiting for Xero — no action needed` for transient provider states;
- prompt staff only for an actionable authorization, mapping, permission, or
  provider-record problem;
- record `Xero-Correlation-Id` for support; and
- resume automatically only when the same immutable operation can continue
  safely.

### Xero pricing, connections, egress, and 2026 changes

Xero's [developer pricing page][xero-pricing] says its new commercial model took
effect on 2026-03-02:

| Tier       | Maximum connections | Daily calls per tenant | Monthly egress included    | Certification/security prerequisite                      |
| ---------- | ------------------- | ---------------------- | -------------------------- | -------------------------------------------------------- |
| Starter    | 5                   | 1,000                  | Not stated as an allotment | None shown                                               |
| Core       | 50                  | 5,000                  | 10 GB                      | Payment method                                           |
| Plus       | 1,000               | 5,000                  | 50 GB                      | App certification                                        |
| Advanced   | 10,000              | 5,000                  | 250 GB                     | App certification and initial/annual security assessment |
| Enterprise | No stated limit     | 5,000                  | By agreement               | App certification and initial/annual security assessment |

The published monthly prices are AUD 35 for Core, AUD 245 for Plus, and AUD
1,445 for Advanced, excluding tax. Egress above the included amount is
published at AUD 2.40 per GB for Core through Advanced. Ingress is unlimited.
Connection and egress metering are app-specific, and egress allotments reset on
the first of the calendar month in UTC.

The price tier does not raise the five-concurrent or 60-per-minute tenant
limits. It raises the Starter daily limit and connection capacity.

The [certification checkpoints][xero-certification] and
[connection-management requirements][xero-connections] require, among other
things:

- the connected Xero tenant name and status;
- self-service connect, disconnect, and reconnect;
- prompt error visibility;
- revocation of unused connections;
- minimal justified scopes;
- `offline_access`; and
- a rate-limit strategy that avoids repeated limit violations.

For apps created on or after 2026-03-02, Xero uses granular scopes. Older apps
must migrate by September 2027. The Journals read endpoint, Bulk Connections,
and Xero Practice Manager are premium Advanced-tier capabilities requiring
security assessment and use-case approval. The Journals read endpoint must not
be confused with ordinary object-level readback or with creating an authorized
Manual Journal.

**Permanent rules:**

- treat connection capacity, daily call capacity, app-wide calls, and monthly
  egress as separate launch gates;
- verify the actual assigned tier and approved premium capabilities rather than
  infer them from configured intent;
- make exact readback efficient, but never omit required evidence to save
  egress;
- keep baseline delivery independent of optional Journals access, as D8
  requires;
- track scope-contract version and recertify after material provider scope or
  tier changes; and
- review Xero's current pricing, scopes, and certification contract before each
  production rollout.

## The hardened capacity model

### Reuse existing Phase 20 authorities

D15 does not add a tenant-authored quota policy or a parallel capacity
aggregate.

1. **QBO/Xero Capability Certificate**
   Existing D7/D8 destination evidence records current tier, scopes,
   preferences, provider object references, and material limits.
2. **Certified Execution Envelope**
   A product-owned, versioned adapter contract records the exact operation
   shapes Asym has proved for a provider, endpoint, recipe, and adapter
   version. It is referenced by the existing certificate; it is not tenant
   editable.
3. **Provider Delivery Plan**
   Existing D2 immutable release evidence records compiled operations, line and
   byte counts, batch membership, stable request identities, and required
   readbacks.
4. **Provider Capacity Observation**
   Volatile, source-labelled evidence records current quota, provider health,
   commercial headroom, and tenant-fair queue conditions used by the runtime
   governor.
5. **Delivery Operation evidence**
   Existing D2 operation-granular truth records attempts, provider outcomes,
   throttling, ambiguity, exact readback, and drift.

The Certified Execution Envelope proves structural safety; it does not freeze
or promise live quota, queue position, provider health, commercial headroom,
or an exact completion time. Those volatile facts remain live observations
used by admission and forecasting. Keeping them separate prevents a stale
certificate from presenting old provider conditions as current truth.

### Workload dimensions

The execution envelope and release preflight must cover at least:

- provider and environment;
- adapter and provider-contract version;
- exact QBO/Xero recipe and provider endpoint;
- operation family and dependency order;
- provider objects and nodes;
- line count per provider object;
- serialized request bytes;
- attachment count, bytes, and separate calls;
- mutation request count after certified batching;
- preflight and exact-readback request count;
- provider query/page shape and expected response bytes;
- tenant concurrency and per-window call demand;
- app-global call demand;
- idempotent retry and outcome-lookup reserve;
- QBO Core versus CorePlus projection;
- Xero ingress and egress projection;
- destination tier, scopes, subscription capabilities, and accounting-period
  state; and
- measured latency distribution and timeout margin for that workload shape.

No single dimension can stand in for the others.

### Admission outcomes

The release fence should derive one of five plain-language outcomes:

1. **Ready now** — all operations fit a current certified envelope and live
   capacity has sufficient write, readback, and recovery reserve.
2. **Ready, queued** — work is certified and safe, but tenant-fair scheduling
   places it behind already admitted work. Show a truthful range, not an exact
   promise.
3. **Waiting for provider** — provider throttle, organization-offline state, or
   provider incident temporarily prevents execution. No staff action is
   requested.
4. **Needs tenant action** — authorization, permission, tier, mapping,
   destination, closed-period, or provider-record drift requires a specific
   staff correction. This is not described as a capacity delay.
5. **Outside certified envelope** — before immutable release, staff may keep the
   planned direct lane for a later certified envelope, activate a prospective
   D5 Posting Profile version through its owning setup flow, adjust unreleased
   grouping only through the authority that owns it, or deliberately choose the
   D2 staff-mediated artifact lane. There is no per-release profile override,
   and Asym does not silently choose.

Once the Accounting Release is immutable, a quota or outage change may delay
execution but cannot change its accounting effect, destination, provider plan,
posting grain, or mutually exclusive delivery lane.

### Tenant-fair provider scheduling

Scheduling must be provider-native:

- a per-QBO-realm governor enforces request-per-second, request-per-minute, and
  batch limits;
- a per-Xero-tenant governor enforces concurrency, minute, and fixed daily
  windows;
- an Xero app-wide governor enforces the 10,000-per-minute global limit;
- tenant-fair selection prevents one large release from consuming every
  available app-global slot;
- new writes cannot consume capacity reserved for exact readback,
  outcome-unknown lookup, and safe recovery;
- dependency-linked operations remain ordered even when independent tenants
  execute concurrently; and
- provider `Retry-After` or documented delay is authoritative for the affected
  destination.

Fairness is product owned. Tenants do not receive a raw priority weight,
rate-limit slider, concurrency setting, or queue-bypass control.

## Staff UX contract

### Default release-review surface

The ordinary finance review should show:

- exact tenant, Legal Entity, destination, and provider company;
- selected direct or staff-mediated lane;
- Accounting Release amount and accounting period;
- provider posting summary, such as `12 QuickBooks journal entries` or
  `8 Xero accounting records`;
- `Artifact ready` independently of direct-delivery readiness;
- one readiness statement and expected range;
- any staff action required; and
- one primary action appropriate to the state.

Provider details remain behind `Why this estimate?`:

- mutation operations;
- exact readbacks;
- current provider window and queue;
- active QBO/Xero capability-certificate version;
- certified execution-envelope version;
- provider-contract timestamp; and
- the reason for any delay or block.

Do not expose internal worker names, raw tokens, request bodies, donor data,
arbitrary percentages, or a generic `API error`.

### Progress and notification behavior

- Progress uses confirmed operation counts, such as
  `32 of 40 provider records confirmed`, not elapsed-time percentages.
- `Sent` or `Recorded in provider` requires the provider outcome D2/D7/D8
  authorize; a queued request is not sent.
- Completion windows are ranges and update when provider evidence changes.
- Throttle retries and brief provider outages remain quiet when no action is
  required.
- Notify finance once when a promised review window is materially at risk,
  when action becomes required, or when delivery reaches a meaningful terminal
  outcome.
- Coalesce repeated provider errors into the existing cause-owned Accounting
  Exception Case rather than one alert per attempt.
- Preserve keyboard access, visible focus, non-color status text, accessible
  status announcements, reduced motion, and a stable reading order.

### Example

> **Ready to send to Xero**
> 8 accounting records · 8 verification reads
> Expected in under 10 minutes
> Artifact ready
>
> **Why this estimate?**
> This release fits the tested Xero workload for your connected organization.
> Current Xero capacity and the Asym queue are healthy.

During a provider window delay:

> **Waiting for Xero capacity**
> Expected to resume after 2:14 PM
> No action is needed. Your Accounting Release and artifact are safe.

If the release does not fit before it is frozen:

> **Review delivery choice**
> This detail level cannot be completed inside the currently certified Xero
> window. You can schedule direct delivery for the next safe window or choose
> the staff-mediated artifact before creating the Accounting Release.

## Ruthless adversarial review

| Category                         | Concern | What could go wrong and why it matters                                                                                                                                                                                                               | Severity | Likelihood | Permanent prevention                                                                                                                                                                     |
| -------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                      | Yes     | A fixed source-item cap, universal batch size, midnight quota reset, or static provider tier works only under ideal assumptions and breaks when provider docs, tenant plans, payloads, or queues change.                                             | High     | High       | Compile exact operations; use provider-specific live governors; version the execution envelope; recertify rather than auto-expand.                                                       |
| Technical debt                   | Yes     | Duplicating capacity rules across UI, workers, provider adapters, and runbooks creates drift and contradictory readiness.                                                                                                                            | High     | Medium     | One adapter-owned provider-contract definition feeds certification, admission, scheduling, evidence, and UX reason codes. Reuse D2/D7/D8 authorities.                                    |
| Edge cases                       | Yes     | HTTP 200 with item faults, timeout after commit, idempotency expiry, a Xero fixed window ending mid-run, QBO monthly CorePlus exhaustion, provider plan downgrade, attachments, closed books, or app-global contention can strand or duplicate work. | Critical | High       | Operation-granular state, exact lookup/readback, reserved recovery capacity, preflight plus runtime revalidation, and cause-specific exception handling.                                 |
| Footguns                         | Yes     | Staff or admins could raise a batch/concurrency knob, bypass a queue, weaken readback, or silently choose artifact delivery to make a deadline.                                                                                                      | High     | Medium     | No tenant rate controls; no silent lane switch; objective server-side gates; one explicit pre-release delivery choice; append-only audit.                                                |
| Tenant safety                    | Yes     | A global queue, quota cache, idempotency key, or provider response without tenant/destination coordinates can schedule or attribute work across tenants.                                                                                             | Critical | Medium     | Scope every plan, operation, governor key, uniqueness constraint, log, artifact, and readback by Tenant, Legal Entity, destination, provider organization, and environment; fail closed. |
| Over-engineering                 | Yes     | A generic capacity DSL, simulated provider, separate certificate aggregate, or tenant-configurable scheduler would add maintenance without improving truth.                                                                                          | Medium   | Medium     | Extend existing Capability Certificates and Provider Delivery Plans; keep one product-owned execution-envelope registry and a small state vocabulary.                                    |
| UX/UI and friction               | Yes     | Raw quotas, retry counters, changing ETAs, and technical provider errors can confuse finance staff or imply required action when none exists.                                                                                                        | High     | High       | One plain-language readiness state, range-based expectation, progressive disclosure, exception-only alerts, exact actionable copy, and accessible semantics.                             |
| Hidden coupling                  | Yes     | Source count, posting grain, carrier plan, provider tier, and scheduler could become inseparable, making one mapping or provider change rewrite unrelated accounting intent.                                                                         | High     | Medium     | Capacity consumes the immutable compiled plan but never owns Posting Profile, mapping, Accounting Effect, release cadence, or provider reconciliation.                                   |
| Failure modes                    | Yes     | A worker crash, 429, 500, 503, partial batch, connection loss, or stale quota cache may leave work neither complete nor safely retryable.                                                                                                            | Critical | High       | Durable operation claims, leases/fencing, idempotent retry, outcome-unknown quarantine, exact readback, resumable scheduling, and artifact-always evidence.                              |
| Data integrity                   | Yes     | Blind batch retry, treating HTTP 200 as success, splitting a balanced effect incorrectly, or changing lane after release can create duplicate or unbalanced provider records.                                                                        | Critical | Medium     | Stable operation identities, per-item response parsing, deterministic balanced partitions, immutable lane/plan, and effect-equivalent exact readback.                                    |
| Security and privacy             | Yes     | Capacity logs or support views could expose OAuth material, donor details, full provider payloads, or cross-tenant company identifiers.                                                                                                              | High     | Medium     | Secret-free structured telemetry, PII-minimized evidence, tenant-scoped access, encryption, retention controls, and redacted provider support bundles.                                   |
| Scalability and performance      | Yes     | A single large tenant can exhaust Xero's app-wide window, QBO reads can hit a workspace cap, or large payloads can time out despite nominal call headroom.                                                                                           | Critical | High       | Multi-dimensional admission, per-tenant and global governors, fair queuing, byte/latency certification, readback reserve, and measured seasonal tests.                                   |
| Operational burden               | Yes     | Manually revising constants whenever providers change creates tribal knowledge and launch risk.                                                                                                                                                      | High     | Medium     | Named contract owner, provider-doc review cadence, developer-portal tier reconciliation, versioned certification evidence, and automated drift alerts.                                   |
| Observability gaps               | Yes     | Without provider IDs, remaining quota, queue age, reason codes, attempt history, and correlation IDs, staff cannot distinguish slow, stuck, failed, or committed-but-unknown work.                                                                   | High     | High       | Structured metrics and traces by provider/destination/operation; record `intuit_tid` and `Xero-Correlation-Id`; expose one inspectable support view.                                     |
| Dependency and integration risks | Yes     | Intuit and Xero can change limits, tiers, scopes, assessment requirements, status, and payload behavior independently of Asym.                                                                                                                       | High     | High       | Versioned provider contracts, current-doc verification, portal-confirmed tier, kill switch, circuit breaker, artifact continuity, and proof-gated envelope expansion.                    |
| Migration and upgrade risks      | Yes     | Xero granular-scope migration, provider SDK changes, or a new Intuit tier can invalidate old assumptions while releases are in flight.                                                                                                               | High     | Medium     | Pin each release to adapter/contract versions; changes apply prospectively; keep old evidence readable; dual-read only for migration, never dual-write.                                  |
| Other development hazards        | Yes     | Stale forecasts, race conditions between admission and execution, unfair rescheduling, clock errors, or retry storms can violate displayed expectations.                                                                                             | High     | Medium     | Atomic claims and fences, monotonic clocks for durations, server-derived provider reset evidence, jittered retry, fairness tests, and truthful forecast revision.                        |

## Production-shaped certification matrix

Certification must use sandbox fixtures plus a bounded production canary where
provider terms permit. It must exercise the same adapter, operation compiler,
queue, idempotency, readback, and evidence path intended for production.

### Workload fixtures

- 100, 1,000, and 10,000 source items;
- exact-detail, fund-detail, and fund-summary Posting Profiles;
- 1,200 and 10,000 Designation catalogs with realistic many-fund mappings;
- minimum, median, and certified-maximum lines per provider object;
- payloads near each certified byte boundary;
- with and without supported attachments;
- one tenant, many tenants, and concurrent QBO/Xero seasonal runs;
- a mixture of clean, invalid, stale-reference, closed-period, and
  permission-constrained operations; and
- multi-currency and provider-subscription capability variations already
  supported by the applicable D7/D8 contract.

### QBO-specific tests

- 10-payload batches and an explicit negative test above the certified limit;
- the official 10-versus-30 documentation conflict retained in certification
  evidence;
- 10-per-second, 500-per-minute, and batch-window enforcement;
- 429 plus the documented 60-second wait;
- a provider response near and beyond the 120-second timeout;
- HTTP 200 containing a top-level or batch-item fault;
- timeout or lost response after provider commit;
- identical `requestid` replay and mismatched batch-ID negative test;
- query-before-retry and exact provider-ID readback;
- CorePlus budget warning, Builder-cap block, and paid-tier cost telemetry;
- company maintenance, lockout, reset, expired subscription, closed period,
  stale `SyncToken`, and authorization loss; and
- `intuit_tid` capture without secret or donor leakage.

### Xero-specific tests

- five-concurrent, 60-per-minute, daily, and 10,000-app-minute governors;
- Starter 1,000-call and higher-tier 5,000-call envelopes;
- all `X-*-Remaining`, `X-Rate-Limit-Problem`, `Retry-After`, and
  `Xero-Correlation-Id` handling;
- fixed tenant windows with different reset times;
- supported 50-node bulk writes below the certified byte limit;
- hard request-size and oversized-node negative tests;
- HTTP 200 with mixed item success using `summarizeErrors=false`;
- six-minute idempotency-key window, expired key, cached error, and lookup before
  a new key;
- 503 provider unavailable and organization offline;
- endpoint-specific 100 and larger certified page-size readbacks;
- monthly egress accounting and connection-tier exhaustion;
- granular-scope insufficiency and tier/premium-feature drift; and
- baseline readback without optional Journals access.

### Cross-tenant and recovery tests

- one very large tenant cannot starve small tenants;
- tenant-level throttling does not pause unrelated tenants;
- global Xero pressure degrades fairly;
- capacity is reserved for exact readback and outcome-unknown recovery;
- worker crash and lease expiry never create duplicate provider effects;
- paused/resumed work maintains dependency order;
- Accounting Release, destination, and lane remain immutable;
- every uncertain operation ends confirmed, proven failed, or quarantined;
- artifact access continues during direct-provider outage; and
- the staff surface announces only material state transitions and action.

## Production gates

Direct QBO/Xero delivery must remain unavailable until all applicable gates are
met:

1. Production provider credentials and exact destination authorization are
   approved and healthy.
2. Current provider terms, pricing tier, connection capacity, scopes,
   certification, and security-assessment requirements are proven.
3. D7/D8 capability certification passes for the exact destination and provider
   contract version.
4. Every operation shape is inside a production-shaped Certified Execution
   Envelope.
5. Balance, source coverage, mapping coverage, and provider-plan equivalence
   pass before release.
6. Operation identity, idempotency, partial response, timeout-after-commit,
   lookup-before-retry, exact-readback, and drift tests pass.
7. Provider-specific tenant and app-global governors pass deterministic and
   live-canary verification.
8. The seasonal load test proves tenant fairness, no starvation, bounded queue
   age consistent with displayed ranges, and no duplicate or lost operation.
9. QBO CorePlus and Xero egress/connection budgets have monitored headroom for
   ordinary writes, exact readback, and recovery.
10. Observability captures provider correlation IDs, quota evidence, queue age,
    operation outcomes, and support-safe error details.
11. The artifact lane and Accounting Evidence Artifact remain available
    independently of direct-provider health.
12. Keyboard, screen-reader, focus, contrast, reduced-motion, responsive, and
    plain-language UX verification passes.
13. Provider outage and local kill-switch drills prove immediate containment and
    safe automatic recovery.
14. Named operational owners and escalation paths exist for provider
    compliance, security assessment, tier/payment failure, capacity drift, and
    incident response.

Envelope expansion requires new evidence and a prospective version. No
production traffic may silently teach or enlarge a limit.

## Options assessed

### Option A — One fixed conservative cap

Set one maximum number of source items or provider records for all direct
releases.

**Why it fails:** the same source count compiles into materially different
provider objects, calls, bytes, readbacks, and costs. The cap would be both too
restrictive for summaries and unsafe for high-detail releases.

### Option B — Unlimited best-effort queueing

Accept every direct release and allow provider throttling to determine when it
finishes.

**Why it fails:** daily limits, app-wide contention, commercial caps, provider
outages, and certification boundaries can make the desired window impossible.
An unlimited queue hides operational debt and cannot give staff truthful
expectations.

### Option C-prime — Workload-shaped certified capacity

Compile the actual provider operation graph, prove it against a versioned
provider-native execution envelope, admit it against current destination and
app-wide capacity, schedule it fairly, and show a truthful inspectable delivery
range.

**Why it works:** capacity follows the provider operation that consumes it,
while the source facts, Accounting Release, mapping, provider carrier plan,
delivery lane, readback, and reconciliation authorities stay separate.

## Ratified hardened ruling

The founder ratified:

> **C-prime-amended-and-hardened (C-prime-R) — product-owned,
> workload-shaped certified capacity over immutable Accounting Release
> operations, separating destination capability, an Asym-tested structural
> execution envelope, the exact per-release Provider Delivery Plan, and live
> provider-capacity observations; with conservative provider-contract limits,
> tenant-fair and recovery-safe backpressure, calibrated accessible completion
> windows, operation-granular idempotency and readback, explicit pre-freeze
> delivery choice, artifact-always evidence continuity, and proof-gated
> prospective expansion—without tenant quota controls, silent grain or lane
> substitution, or a second capacity platform.**

This recommendation deliberately does **not** add:

- a tenant capacity rules builder;
- manual rate, batch, concurrency, or priority controls;
- one universal source-item cap;
- an exact completion-time guarantee;
- automatic Posting Profile, carrier-plan, or mapping changes;
- silent switching between direct and staff-mediated delivery;
- weakened readback to reduce provider cost;
- a generic cross-provider throttle algorithm;
- provider-reconciliation claims based on delivery progress; or
- a new parallel certificate aggregate.

## Primary official sources

### Intuit

- [API call limits and throttles][qbo-limits]
- [Batch operation][qbo-batch]
- [Query operations and pagination][qbo-query]
- [Basic ID and field definitions, request IDs, and safe retry][qbo-request-id]
- [Accounting API error codes][qbo-errors]
- [Attachment workflow][qbo-attachments]
- [Intuit App Partner Program FAQ][qbo-partner-faq]
- [Production publishing requirements][qbo-production]
- [App-review process and timeline][qbo-review]
- [QuickBooks Online release notes][qbo-release-notes]

### Xero

- [Rate limits][xero-rate-limits]
- [OAuth/API limits and system limits][xero-limits]
- [Paging][xero-paging]
- [Idempotent requests][xero-idempotency]
- [Accounting API response codes][xero-response-codes]
- [Developer pricing and policies][xero-pricing]
- [Certification checkpoints][xero-certification]
- [Managing connections][xero-connections]
- [API status][xero-status]

[qbo-limits]: https://developer.intuit.com/app/developer/qbo/docs/learn/limits-and-throttles
[qbo-batch]: https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/batch
[qbo-query]: https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/data-queries
[qbo-request-id]: https://developer.intuit.com/app/developer/qbo/docs/learn/learn-basic-field-definitions
[qbo-errors]: https://developer.intuit.com/app/developer/qbo/docs/develop/troubleshooting/error-codes
[qbo-attachments]: https://developer.intuit.com/app/developer/qbo/docs/workflows/attach-images-and-notes
[qbo-partner-faq]: https://developer.intuit.com/app/developer/qbo/docs/get-started/partner-faq
[qbo-production]: https://developer.intuit.com/app/developer/qbo/docs/go-live/publish-app/platform-requirements
[qbo-review]: https://developer.intuit.com/app/developer/qbo/docs/go-live/list-on-the-app-store/what-to-expect-during-the-review
[qbo-release-notes]: https://developer.intuit.com/app/developer/qbo/docs/release-notes/general-release-notes
[xero-rate-limits]: https://developer.xero.com/documentation/best-practices/api-call-efficiencies/rate-limits/
[xero-limits]: https://developer.xero.com/documentation/guides/oauth2/limits/
[xero-paging]: https://developer.xero.com/documentation/best-practices/api-call-efficiencies/paging
[xero-idempotency]: https://developer.xero.com/documentation/guides/idempotent-requests/idempotency/
[xero-response-codes]: https://developer.xero.com/documentation/api/accounting/responsecodes
[xero-pricing]: https://developer.xero.com/pricing
[xero-certification]: https://developer.xero.com/documentation/xero-app-store/app-partner-guides/certification-checkpoints
[xero-connections]: https://developer.xero.com/documentation/best-practices/managing-connections/connections
[xero-status]: https://status.developer.xero.com/
