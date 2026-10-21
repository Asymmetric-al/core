# eve-email-discord-notifications normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-ee53334be56dfa02432d"></a>

## Discord Is Urgent And Rich Only After Safe-Content Policy

<!-- BEGIN CONTRACT {"id":"ee53334be56dfa02432d","name":"Discord Is Urgent And Rich Only After Safe-Content Policy"} -->

Discord MUST receive only events that meet app-owned urgency/severity routing policy and MUST resolve only an
enabled app-owned operational destination. Its default rendering MUST be minimal safe content. Rich detail MAY
be included only after deterministic field allowlisting, redaction, and URL safety checks approve every field.
Model-only safety claims MUST NOT authorize richer content; uncertain fields MUST be omitted.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-5ddc2fea00291b11b913"></a>

## Sensitive Material Never Enters External Notification Content

<!-- BEGIN CONTRACT {"id":"5ddc2fea00291b11b913","name":"Sensitive Material Never Enters External Notification Content"} -->

Email and Discord content MUST exclude secrets, credentials, environment values, service-role keys, raw
production records, donor/payment data, unapproved identity/tenant data, raw logs, unredacted replay/debug
artifacts, hidden reasoning, and arbitrary model/tool output. Links MUST be allowlisted and sanitized so they
contain no credentials or sensitive query values. Redaction MUST happen before provider submission, not only
at storage or display time. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-e6fea718251c2a99883b"></a>

## This Change Grants No New Delivery Or Runtime Authority

<!-- BEGIN CONTRACT {"id":"e6fea718251c2a99883b","name":"This Change Grants No New Delivery Or Runtime Authority"} -->

This change MUST remain spec-only and MUST NOT configure providers, webhooks, credentials, destinations,
schema, event consumers, sends, or runtime activation. #425 remains the owner of event-consumer/runtime
durability; outbound email MUST use the platform-scoped Phase 17 contract/compiler and Phase 6 Resend boundary rather than an Eve-owned or
browser/provider-direct path. Discord remains a separate Eve operational channel and MUST NOT be represented
as tenant System Messages or Phase 6 email history. #420 remains the owner of global automation controls; #419/#424 remain owners of audit/redaction
and retention/replay; #426 remains owner of verified identity and scope. The #418 release switch MUST remain
off. [VERIFIED-REPO: openspec/project.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-59edd140c3fb2323c546"></a>

## Notification Decisions And Outcomes Are Audited And Retained By Existing Owners

<!-- BEGIN CONTRACT {"id":"59edd140c3fb2323c546","name":"Notification Decisions And Outcomes Are Audited And Retained By Existing Owners"} -->

The #419 audit boundary MUST record the explicit source initiator/trigger, #426-verified service delivery actor, event class,
policy/redaction versions, severity, dedupe outcome, channel and destination class, attempt identity, provider
response class, and delivery result without storing credentials or unsafe payloads. Every generation and
delivery attempt MUST execute under the verified service identity and user/tenant scope derived by #426;
prompt, model, event, issue, PR, monitor, or tool content MUST NOT choose that actor or scope. #424 MUST own
retention/hold/expiry of notification and audit records. #427 MUST expose safe notification status and pause
controls to authorized admins. Email or Discord MUST NOT become the authoritative audit or retention store.
[VERIFIED-REPO: openspec/changes/add-eve-retention-replay-tracer]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-8a9f4706189025cbbaf8"></a>

## Notification Delivery Is Deduplicated, Idempotent, Bounded, And Pausable

<!-- BEGIN CONTRACT {"id":"8a9f4706189025cbbaf8","name":"Notification Delivery Is Deduplicated, Idempotent, Bounded, And Pausable"} -->

Every notification MUST use a stable dedupe key and notification-level state.
Repeat events inside the configured window MUST be suppressed or update the
existing notification. Eve MUST own eligibility, suppression, cancellation,
pause, expiry, and handoff for both channels. Discord provider attempts and
retries remain #436-owned and MUST be idempotent and bounded. Email provider
attempts, retries, reconciliation, and terminal delivery states MUST be owned by
the Phase 6 prepared-message and Resend lifecycle, which invokes Phase 17's
compiler/resolvers; Eve MUST link to that
evidence rather than duplicate it. Both paths MUST consume #423 budgets/rate
limits, stop after expiry, and recheck #418 release/emergency, #420 relevant
switch, notification pause/opt-out, recipient validity, and content policy at
their respective safe fence. #436 MUST NOT create a new global kill switch or
self-grant an override.

Eve MUST own one opaque, server-verifiable source fence containing current #418
release/emergency state, #420 switch, notification pause/opt-out/expiry/dedupe
eligibility, exact source event and target identity, #426 verified
service-identity revision, recipient-authority revision, severity band, current
`#423` budget/rate-limit decision and policy revision, selected eligible channel,
and content-policy/redaction version. Phase 6 MUST independently re-read or
verify that same complete fence before preparation and again immediately before
committing its submission fence. Missing, stale, mismatched, or unavailable
proof MUST fail closed and suppress or supersede only definitely unsubmitted
work; work that may have crossed the provider boundary MUST remain under outcome
reconciliation. Phase 6 MUST validate the current proof without reimplementing
Eve policy.
[VERIFIED-REPO: openspec/changes/add-eve-approval-budget-policy]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-dfbf0fa042dcb0a50be3"></a>

## V1 Email Goes Only To Configured Platform Owners

<!-- BEGIN CONTRACT {"id":"dfbf0fa042dcb0a50be3","name":"V1 Email Goes Only To Configured Platform Owners"} -->

Email destinations MUST resolve only from enabled app-owned platform-owner notification records whose current
identity and permission state is valid. V1 MUST NOT send Eve email to customers, donors, tenant users,
arbitrary admins, or addresses supplied by prompts, models, tools, source events, issues, PRs, or monitor
evidence. Email MUST contain only the safe envelope rendering and permitted links to authorized app context.
Those notification records MUST be revisioned service-only authorities with no
tenant id and MUST bind one stable app principal, verified email/contact
revision, platform-owner permission epoch, eligible event classes, and current
enable/pause state. Eve MUST pass only the exact authority id/revision/epoch;
Phase 6 MUST re-prove it during platform preparation and MUST keep the actual
destination only in restricted delivery material.
Every eligible email meaning MUST be registered as an exact platform-scoped,
Asym-fixed Phase 17 system-message contract. Eve MUST submit only the typed safe
facts and verified platform-owner recipient authority through the Phase 6 intent
seam. Phase 17 MUST own the catalog/contract, fixed publication resolution,
canonical compiler, and platform delivery-profile/connection configuration and
proof. Phase 6 MUST own recipient-specific intent, preparation orchestration
through those Phase 17 resolvers, outbox/claim, submission fence, idempotency,
Resend invocation, provider attempt/evidence/outcome reduction, reconciliation,
and body-free communication history. That connection MUST NOT be usable as tenant fallback or
resolve tenant data, publications, credentials, or recipients.
The current Phase 17 manifest generation contains zero Eve email keys, so email
MUST remain non-dispatchable and fail before intent creation. A later generation
MAY add only producer-enumerated, meaning-specific keys with exact source fences,
the fixed platform profile, and complete platform proof packs. A generic
`eve_alert` or severity-only catch-all MUST NOT exist.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-69a3bfd95a2a01244301"></a>

## Notification Decisions And Outcomes Are Audited And Retained By Existing Owners

<!-- BEGIN CONTRACT {"id":"69a3bfd95a2a01244301","name":"Notification Decisions And Outcomes Are Audited And Retained By Existing Owners"} -->

`#419` MUST record the explicit source initiator/trigger, #426-verified service delivery actor, event class,
policy/redaction versions, severity, dedupe outcome, channel and destination class, and the appropriate linked
delivery evidence without storing credentials or unsafe payloads. For Discord that evidence includes Eve's
attempt identity, provider response class, and delivery result. For email, #419 MUST link the Phase 6 intent,
attempt, and provider outcome rather than store a second lifecycle. Every generation and
delivery attempt MUST execute under the verified service identity and user/tenant or platform scope derived by #426;
prompt, model, event, issue, PR, monitor, or tool content MUST NOT choose that actor or scope. #424 MUST own
retention/hold/expiry of notification and audit records. #427 MUST expose safe notification status and pause
controls to authorized admins. Email or Discord MUST NOT become the authoritative audit or retention store.
[VERIFIED-REPO: openspec/changes/add-eve-retention-replay-tracer]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-7f376dc6968e5e37849d"></a>

## This Change Grants No Uncontrolled Delivery Or Runtime Authority

<!-- BEGIN CONTRACT {"id":"7f376dc6968e5e37849d","name":"This Change Grants No Uncontrolled Delivery Or Runtime Authority"} -->

This change MUST implement delivery only behind disabled and paused app-owned channel configuration, the
existing server-side email boundary, a server-only Discord secret, verified service identity, current
governance and budget policy, and durable claims. #425 remains the owner of event-consumer/runtime durability.
#420 remains the owner of global automation controls; #419/#424 remain owners of audit/redaction and
retention/replay; #426 remains owner of verified identity and scope. The #418 release switch MUST remain off
and no live provider credential or destination may be committed. [VERIFIED-REPO: openspec/project.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-fbe307c965d7eef68c5e"></a>

## V1 Email Goes Only To Configured Platform Owners

<!-- BEGIN CONTRACT {"id":"fbe307c965d7eef68c5e","name":"V1 Email Goes Only To Configured Platform Owners"} -->

Email destinations MUST resolve only from enabled app-owned platform-owner notification records whose current
identity and permission state is valid. V1 MUST NOT send Eve email to customers, donors, tenant users,
arbitrary admins, or addresses supplied by prompts, models, tools, source events, issues, PRs, or monitor
evidence. Email MUST contain only the safe envelope rendering and permitted links to authorized app context.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-bf1d5e6bc9ff031e9175"></a>

## Notification Delivery Is Deduplicated, Idempotent, Bounded, And Pausable

<!-- BEGIN CONTRACT {"id":"bf1d5e6bc9ff031e9175","name":"Notification Delivery Is Deduplicated, Idempotent, Bounded, And Pausable"} -->

Every notification MUST use a stable dedupe key and lifecycle state. Repeat events inside the configured window
MUST be suppressed or update the existing notification; provider attempts MUST use idempotency where
supported. Retries MUST be bounded, consume #423 budgets/rate limits, stop after expiry, and recheck #418
release/emergency, #420 relevant switch, notification pause/opt-out, recipient validity, and content policy
before every attempt. #436 MUST NOT create a new global kill switch or self-grant an override.
[VERIFIED-REPO: openspec/changes/add-eve-approval-budget-policy]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-7e4a26799e80712133a9"></a>

## Every Notification Starts From A Safe Typed Envelope

<!-- BEGIN CONTRACT {"id":"7e4a26799e80712133a9","name":"Every Notification Starts From A Safe Typed Envelope"} -->

Eve MUST normalize a governed source event into a typed notification envelope containing stable event and
notification ids, event type, severity, safe source/target references, occurred time, safe decision summary,
explicitly allowed detail fields, policy/redaction versions, dedupe key, intended channel class, and expiry.
Unsafe raw source payloads and arbitrary model/tool text MUST NOT be copied into the envelope. Deterministic
validation and redaction MUST run before channel rendering. [VERIFIED-REPO: openspec/changes/add-eve-audit-tracer-bullet]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
