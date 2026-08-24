# Phase 23 D26 decision brief — Public Form Definitions and domain-owned routing

**Status:** Founder-ratified Phase 23 D26 B-prime-R on 2026-08-23 after repository,
primary-source, UX, security, privacy, data, delivery, Inngest/TanStack Form,
cost, accessibility, and operational hardening.

**Date:** 2026-08-23

## Decision to make

Choose the smallest complete Phase 23 public-form product that lets a ministry
compose clear, branded forms and route accepted submissions to the right Asym
product, one or more staff email recipients, or both—without making Payload,
email, a CMS inbox, or a generic workflow graph the system of record.

This is one decision. It does not reopen Phase 23 D1–D25 or the domain
ownership assigned by other phases. It does not authorize implementation,
schema, migration, dependency adoption, issue publication, Git publication,
deployment, release, or production change.

## Bottom line

B-prime is the right direction only after one architectural clarification:

> One purpose-bounded Public Form Definition owns questions and presentation;
> one versioned Route Plan names exactly one primary operational owner, zero or
> more independent staff notifications, and at most one separately governed
> visitor acknowledgement.

That model provides the requested flexibility without creating multiple systems
of record:

- **Support Hub only:** the Support Hub conversation is primary truth.
- **One or many email addresses only:** a short-retained, recoverable Asym
  intake is primary delivery evidence; independent recipient-specific emails
  are the handoff. There is no second staff inbox.
- **Support Hub plus email:** Support Hub is primary; email is notification.
- **Mobilize plus email:** Mobilize is primary only after Phase 34/37 certifies
  its intake contract; email is notification.
- **A future product plus email:** the product adapter becomes primary only
  after its owning phase certifies purpose, schema, permissions, retention,
  idempotency, readiness, and recovery.

No form may have two primary destinations. “Send to several places” is
represented as one primary outcome plus independently observable secondary
effects, never multi-master data ownership.

## Existing authority that D26 must preserve

- [Phase 23 D1](../../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
  releases one exact Site-locale generation. Form presentation and its exact
  Route Plan are part of that immutable release closure.
- [Phase 23 D12](../../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
  owns acknowledged, recoverable editorial work and stale-write behavior.
- [Phase 23 D22](../../../adr/0166-bounded-localized-editorial-profile-over-exact-locale-lineages.md)
  requires exact locale lineages and no silent field fallback.
- [Phase 23 D24](../../../adr/0168-one-exact-public-audience-and-app-owned-authenticated-surfaces.md)
  allows one public audience; authenticated submission review belongs in
  purpose-owning Asym products.
- [Phase 23 D25](../../../adr/0169-immutable-whole-site-preview-candidates-over-sealed-site-plan-inputs.md)
  requires Preview to remain side-effect-dark.
- Phase 3 owns communication preference and consent truth.
- Phase 6 owns the communication dispatch/history seam.
- Phase 10 owns privacy classification, retention, and protected-data posture.
- Phase 13 owns giving and payment submission.
- Phase 17 owns stable message families, exact Email Studio publications,
  sender/reply identities, and delivery plans.
- Phase 26 owns Support Hub conversations and work queues.
- Phase 29 owns governed files and uploads.
- Phase 32 owns newsletter/campaign subscription and handoff semantics.
- Phase 34 owns generalized workflow, form, intake, and applicant pipelines.
- Phase 37 owns event/opportunity/application semantics over Phase 34.
- Phase 38 owns classified care and crisis workflows.

D26 can offer adapters to those owners; it cannot silently recreate them.

## Current repository findings

### Payload is not currently the form authority

The current Payload configuration has Pages, templates, profiles, Ministry
Updates, and Media but does not configure `@payloadcms/plugin-form-builder`.
Payload's official plugin can define forms, store every submission in its own
collection, send dynamic email, redirect after submission, accept uploads, and
add payments. Those are useful generic CMS capabilities, but adopting them as
defaults would conflict with Asym's domain ownership and create an ownerless CMS
inbox. Payload may later serve as a qualified authoring adapter only if its
submission storage, direct mail, payment, upload, and unrestricted redirect
behaviors are replaced or fenced. [Payload Form Builder](https://payloadcms.com/docs/plugins/form-builder)

### Email Studio is already the correct content authority

Core's [Email Studio guide](../../../guides/features/email-studio.md) defines a
provider-neutral builder envelope with mutable templates, immutable template
versions, governed merge tags, safe rendering, and logged sends. The
[Resend integration guide](../../../guides/features/resend-integration.md) and
[ADR-0029](../../../adr/0029-tenant-owned-resend-and-composed-delivery-identities.md)
require tenant-owned Resend connections, purpose-resolved verified sender and
reply identities, server-side consent, idempotency, and separated provider
outcomes.

Therefore a form selects a compatible **Email Studio message contract and Live
publication**, not a Resend-hosted template id and not arbitrary form-authored
HTML. Resend is transport. Email Studio remains the single editable content
authority.

The current implementation is still a bridge to that target, not proof that
D26 can ship today. Current template-head/version/binding writes are not one
transactional compare-and-set publication operation, `is_active` is not an
immutable Live-publication receipt, and the current Resend webhook reducer does
not represent every outcome monotonically: `email.failed` lacks a send-log
mapping and a late `sent` event can overwrite a prior bounce. D26 therefore
depends on Phase 17/6's permanent publication and evidence spine rather than
calling the current test-send path or mutable template head directly. See the
[D26 Resend/email-routing research](./phase-23-d26-resend-email-routing-primary-source-research.md).

### Existing Inngest and TanStack Form are qualified adapters, not new authorities

Core already pins Inngest 4.5.1 as its shared durable executor and TanStack Form
1.28.6 as its complex-form interaction library. D26 should reuse both behind
their existing product boundaries. Inngest may execute only destination intents
that were already committed with product-owned dispatch rows. TanStack Form is
appropriate for the complex staff definition builder, while the public visitor
form remains semantic-native and server-authoritative at launch.

The repository audit found one material crash gap that D26 must not inherit:
the current workflow helper creates the dispatch-ledger row after a caller has
already created its product record. D26 acceptance must instead commit its
occurrence, complete intent set, and corresponding dispatch rows in one
PostgreSQL transaction. The full role, cost, UX, failure, and adversarial
analysis is in the
[D26 Inngest/TanStack Form fit research](./phase-23-d26-inngest-and-tanstack-form-fit-research.md).

### Support Hub is a real owner; Mobilize intake is not yet certified

The repository has a tenant-scoped Support Hub with inbox registry, inbound
routing, conversation lifecycle, assignment, and audit behavior. A D26 Support
Hub adapter can target an exact active inbox once the form-specific adapter is
implemented and qualified.

The existing router is specifically a verified Resend inbound-email adapter.
D26 must not invent sender, recipient, subject, or threading headers to reuse
it. Phase 26 needs one atomic typed product-intake command with the D26 source
occurrence as its uniqueness/threading provenance.

The current Mobilize surface reads a seeded `mobilizeCandidatesCollection` and
does not expose a certified public application-intake port. D26 may reserve a
typed `mobilize_intake` destination kind, but it must remain unavailable until
Phase 34/37 supplies the exact owner, schema, permissions, retention,
idempotency, readiness, and recovery contract. D26 must not manufacture
candidate records against the current demonstration collection.

## Current primary-source findings

### Resend supports transport mechanics, not Asym's product truth

- Resend-hosted Templates have their own draft/publish lifecycle and variables.
  Running them alongside Email Studio as a second editable authority would
  create drift. [Resend Templates](https://resend.com/docs/dashboard/templates/introduction)
- A single send accepts up to 50 addresses, but D26 must not expose one shared
  `To` list: recipients must not see one another and each outcome must remain
  independently repairable. [Resend Send Email](https://resend.com/docs/api-reference/emails/send-email)
- Resend can transport up to 100 email objects in a batch. Batching is an
  optimization, not a business transaction or recipient-ownership model.
  [Resend Batch](https://resend.com/docs/api-reference/emails/send-batch-emails)
- Resend idempotency keys are retained for 24 hours. Asym needs durable semantic
  deduplication and repair beyond that provider window.
  [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys)
- Resend webhooks are at-least-once and may arrive out of order. Provider events
  must be deduplicated and reduced into monotonic, non-conflated delivery axes.
  [Resend webhooks](https://resend.com/docs/webhooks/introduction)

### Public forms need accessible server validation

W3C recommends short forms, visible labels, clear instructions, logical groups,
and explicit success feedback. GOV.UK's proven validation pattern preserves
answers, moves focus to an error summary, and places linked errors beside their
fields. Client validation can improve immediacy, but the server must validate
the exact released schema. [W3C Forms](https://www.w3.org/WAI/tutorials/forms/),
[GOV.UK validation](https://design-system.service.gov.uk/patterns/validation/)

### Comparable CRM UX supports guided setup—but exposes a placement footgun

HubSpot's current form editor starts from templates, maps questions to CRM
properties, configures the on-submit result separately, and lets staff select
active users or teams for submission notifications. It also allows a Page
placement to override the form's default recipients, and reserves custom
notification behavior for a separate workflow product. The useful lesson is
progressive form setup plus a clear notification section; the unsafe lesson for
Asym is a hidden Page-level delivery override. D26 keeps one visible Route Plan
per form and leaves generalized conditions to Phase 34.
[HubSpot form customization](https://knowledge.hubspot.com/forms/create-and-edit-forms),
[HubSpot submission notifications](https://knowledge.hubspot.com/forms/set-up-your-form-submission-notifications)

OWASP recommends allowlist-based syntactic and semantic validation, request and
field size bounds, and validation before downstream processing. Form input may
never control recipient, sender, template, header, redirect, tenant, or domain
authority. [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

### Supabase requires a server-only ingress boundary

Supabase documents that grants and RLS are separate checks, exposed tables need
RLS, the service role bypasses RLS and must stay server-side, policy columns
need matching indexes, and policies require explicit tests. The anonymous
browser must therefore post to an Asym server boundary—not directly insert
domain submissions or route jobs into exposed tables.
[Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)

## Canonical D26 model

### Public Form Purpose Profile

A small, code-owned, versioned catalog entry such as **General inquiry**,
**Resource request**, **Newsletter interest**, or **Prayer request**. Each
profile declares:

- allowed semantic fields and ordinary supplemental field types;
- immutable internal field meanings and required domain mappings;
- maximum data classification and whether sensitive free text is allowed;
- required consent, retention, and disclosure posture;
- eligible primary destinations and notification data projections;
- compatible Phase 17 staff-notification and visitor-acknowledgement contracts;
- abuse, byte, field, and rate limits; and
- unavailable or delegated behaviors, including giving, uploads, applications,
  care, and generalized workflows.

The catalog is additive and migration-aware. Unknown purpose versions fail
closed. Tenants cannot author executable purpose profiles.

### Public Form Definition

One Site-scoped, locale-lineage-aware editorial definition containing the
visitor-facing form title, introduction, questions, labels, help text, options,
ordering, required/optional presentation, submit copy, validation copy, and
on-page confirmation. It references one purpose profile and one Route Plan.

Editors may safely:

- edit visible copy and translated copy;
- reorder questions within allowed groups;
- enable approved optional purpose fields;
- add a bounded number of ordinary supplemental short text, long text,
  single-select, multi-select, checkbox, and date questions when the purpose
  permits them; and
- select approved same-Site confirmation behavior.

Editors may not change stable semantic keys, mandatory domain fields, data
classification, retention, consent meaning, destination capability, abuse
limits, or executable behavior. Supplemental answers remain supplemental; they
never silently populate Party, Support, Mobilize, giving, care, or workflow
fields.

Launch excludes arbitrary JavaScript, CSS, HTML, SQL, webhooks, conditional
workflow graphs, calculations, payments, uploads, save-and-resume, arbitrary
external redirects, browser-supplied recipients, and arbitrary merge tags.

### Form Route Plan

One versioned, release-bound plan with three clearly separated lanes:

1. **Where the work goes — exactly one Primary Outcome.** The purpose-owning
   product or the bounded verified-email handoff owns operational completion.
2. **Who should be notified — zero or more Notification Deliveries.** These are
   secondary recipient-specific Phase 6/17 communication intents. Failure never
   deletes or rolls back a successful Primary Outcome.
3. **What the visitor receives — zero or one Visitor Acknowledgement.** This is
   a separate transactional message contract. It never enrolls the visitor in
   marketing and never echoes sensitive or arbitrary free-text answers.

Page placements cannot override routing. If a tenant needs the same visual form
to go somewhere else, staff deliberately duplicate it as a clearly named form
variant; there is no hidden per-page route override.

### Primary Outcome

The allowed launch/future kinds are capability-gated:

| Kind                                                                                         | Availability and authority                                                                                                                        |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `support_hub_inbox`                                                                          | Available only for an active, same-Tenant certified Support Hub inbox; the conversation is primary truth.                                         |
| `verified_email_handoff`                                                                     | Available only to low-risk, non-sensitive purposes and one action-qualified Verified Email Destination; durable Asym evidence prevents mail loss. |
| `subscription_intake`                                                                        | Available only after Phase 32 and the Phase 3 consent seam certify subscription and confirmation semantics.                                       |
| `mobilize_intake`                                                                            | Reserved but unavailable until Phase 34/37 certifies application ownership and adapter behavior.                                                  |
| `workflow_enrollment`, `event_registration`, `member_care_intake`, or another domain adapter | Unavailable until its owning phase certifies the exact port; D26 never substitutes a generic record or email.                                     |

When a form has no eligible configured Primary Outcome, it cannot release.

### Verified Email Destination

A privileged tenant administrator manages reusable same-Tenant destinations
outside the ordinary form editor. A destination has a clear name,
purpose/sensitivity ceiling, accountable owner, permitted use as an action
handoff and/or notification, active status, monitored-address attestation or
verification, and members that may be eligible tenant teams, users, single
verified addresses, or verified distribution addresses. A destination that is
safe for notification does not automatically qualify as an email-only Primary
Outcome.

The Route Plan references the stable destination identity. At submission
preparation, Asym resolves its current eligible members and freezes the exact
recipients for that occurrence. Each member receives a separate intent;
addresses are never revealed to one another. For an email-only Primary Outcome,
**Handoff complete** requires transport acceptance for every frozen required
member; a later bounce, suppression, or complaint returns that occurrence to
**Needs attention** without erasing other successful deliveries. The visitor's
**Received** acknowledgement still means durable Asym acceptance, not email
handoff. Removal affects future submissions, not historical evidence. A form
answer, query string, browser request, or page placement can never select a
recipient.

### Form Submission Occurrence

The server creates one immutable, tenant-scoped acceptance envelope containing:

- the trusted Tenant, environment, Site, locale, public generation, form,
  purpose-profile version, and Route Plan version;
- stable server-generated occurrence and idempotency identities;
- exact validated field keys and bounded values;
- classification, retention, consent, and abuse decisions;
- the Primary Outcome work item and independent notification/acknowledgement
  child intents; and
- body-free audit and lifecycle receipts.

This envelope is delivery/recovery truth, not an all-purpose CMS submissions
inbox. Purpose-owned products remain the staff workspace. An email-only form
retains encrypted content only for its short declared repair period, then
purges it while keeping bounded body-free evidence.

## Email Studio and Resend contract

### Two distinct message families

- **Staff notification:** tells an authorized recipient that work arrived. Its
  safest default is a minimal summary plus an authenticated product link.
- **Visitor acknowledgement:** says the submission was received and what to
  expect next. It uses separate audience, facts, consent, sender, reply, and
  privacy rules.

They cannot share one untyped template selection.

### Template selection and version resolution

The Route Plan stores a stable Phase 17 message-contract key and an eligible
Email Studio selection, not raw HTML or a Resend template id. A Live Email
Studio publication can change without forcing a Site release. At submission
preparation, Phase 6/17 resolves and freezes the exact current publication,
locale, sender, reply profile, recipient set members, consent/suppression
decision, provider connection, and facts. Retries use that frozen message;
safety revocation may stop or quarantine it.

Email Studio should show impact such as **Used by 6 public forms**. A missing,
Draft, retired, incompatible, or unauthorized publication makes that route Not
Ready. A later publication applies only to future submissions.

### Safe merge facts

Allowlisted staff-notification facts may include form name, purpose, accepted
time, Site, Page, submitter name/email where the purpose permits it, bounded
email-safe fields, and a secure review link. Values are escaped by default.
There is no `{{all_fields}}`, raw answer HTML, or secret/sensitive answer dump.
Application, care, prayer, and other elevated content defaults to a minimal
notification with an authenticated product link.

Visitor acknowledgements never echo arbitrary free text, attachments, internal
routing, recipient addresses, or sensitive answers. Newsletter confirmation
and double opt-in belong to the subscription/consent owner, not an ordinary
transactional receipt.

No submitted value can control `From`, `To`, `Cc`, `Bcc`, `Reply-To`, subject,
headers, template, sender profile, tracking, tags, or redirect. Any future
low-risk reply-to behavior must be an explicit Phase 17 message-contract rule,
not a form-editor toggle.

## Submission lifecycle and failure semantics

1. The browser submits to an Asym server endpoint using an opaque public form
   handle, one-time/replay-resistant token, and client idempotency token.
2. The server derives Tenant, environment, Site, locale, and current D1
   generation from trusted host/routing context. It does not trust client-
   supplied tenant or destination authority.
3. The server resolves the exact released form and validates field presence,
   semantic type, option membership, lengths, total bytes, purpose limits,
   consent, and route readiness.
4. One short transaction durably creates the occurrence, exact route-plan
   identity, Primary Outcome work item, and child delivery intents. The visitor
   sees success only after durable acceptance.
5. Adapters execute asynchronously and idempotently using a permanent semantic
   key such as `{tenant, occurrence, route-step, recipient}`. Resend's 24-hour
   key is an additional provider safeguard, not the product boundary.
6. A successful Primary Outcome is never rolled back because a notification
   fails. Only failed/indeterminate children are reconciled and retried.
7. Provider accepted, receiving-server delivered, bounced, suppressed,
   complained, and failed remain different facts. “Received” never means “read.”
8. Permanently invalid configuration fails closed. A transient downstream
   outage may accept and queue only within declared backlog and retention
   bounds. Email-only forms with no recoverable eligible recipient fail safely
   and show an approved alternate contact.

Unknown outcomes are reconciled before blind retry. Duplicate/out-of-order
webhooks are deduplicated by provider event identity and reduced monotonically.

## Staff UX/UI contract

The authoring journey is a calm linear flow, not a routing graph.

### 1. Purpose — “What is this form for?”

Purpose cards explain the real outcome in one sentence. Unsupported purposes
remain visible only when a useful guided handoff exists: **Donation — use a
Giving block** or **Mobilization application — set up Mobilize before using this
purpose**. The UI never lets a disabled card lead to a dead-end draft.

### 2. Questions

The editor starts with a strong purpose template. Basic editing covers visible
copy, options, and order. **Customize questions** reveals approved additional
types and destination mapping. Restricted **Advanced settings** explains
classification, retention, consent, and safety without exposing raw database or
integration primitives.

Stable internal keys remain hidden in normal use. Required destination fields
show a calm lock and explanation. Changing purpose previews exactly which
questions/settings will be removed or reset, requires confirmation, and uses
D12 recovery/undo.

### 3. Delivery

Three visually separate sections use plain language:

- **Where the work goes** — required, one Primary Outcome.
- **Who should be notified** — optional, add verified email destinations and compatible
  staff-notification templates.
- **What the visitor receives** — optional transactional acknowledgement.

Each card shows owner, readiness, included data, retention, recipient count,
template, sender/reply identity, and what a failure means. Use **Add
notification**, not **Add node** or **Add route**.

The persistent summary renders the actual plan:

> When submitted: create a conversation in General Inquiries; notify the
> Mobilization Team and applications@example.org in separate emails using New
> inquiry received; send the visitor We received your message.

### 4. Confirmation

Staff edit on-page success copy, an approved same-Site confirmation target,
response-time expectations, and any purpose-required safety language. Arbitrary
external redirects are not available.

### 5. Review and publish

Show a numbered human-readable sequence, collected-data/sensitivity summary,
consent, retention, page placements, locale readiness, exact Primary Outcome,
resolved current recipient count, Email Studio selections, integration health,
and changes from Live. **Check setup** performs an inert readiness plan.
Release is blocked on any required Not Ready dependency.

Route Plan edits require a D1 release. Recipient-set membership and Email
Studio publication changes use their own source-owned governance and affect
future submissions only; current authorization, consent/suppression, provider
readiness, and adverse safety revocation are still re-proved before an effect
crosses its boundary. The review clearly labels that distinction.

### Operations language

Staff-facing states remain precise:

- **Received** — durably accepted by Asym.
- **Routing** — Primary Outcome is pending.
- **Delivered to Support Hub/Mobilize** — that owner accepted it.
- **Email accepted** — Resend accepted the request.
- **Email server delivered** — receiving server accepted it, not proof of an
  inbox view.
- **Needs attention** — one or more exact steps require repair.

Example partial failure: **Application saved in Mobilize. 2 of 4 staff
notifications need attention.**

## Visitor UX, accessibility, and abuse resistance

- Default to a single column, few necessary questions, visible labels,
  explicit optional markers, logical grouping, descriptive submit copy, and
  mobile/zoom-safe touch targets.
- Preserve values after validation failure; focus an error summary; link each
  concise error to its field; expose status changes to assistive technology;
  validate again on the server.
- On stale released-schema conflict, preserve compatible answers and say:
  **This form changed while you were completing it. Review the highlighted
  change and send again.** Never silently remap answers.
- Layer host/origin/current-generation checks, purpose-specific rate and byte
  limits, honeypot/timing signals, velocity controls, replay/idempotency
  protection, backpressure, and an accessible risk-based challenge. Do not make
  a noisy CAPTCHA the only defense.
- Put no personal or answer data in URLs, logs, analytics, traces, metric
  labels, Resend tags, or custom arguments.
- D25 Preview exercises controls and validation but ends with **Preview only —
  no information was submitted**. It creates no occurrence, domain record,
  email, analytics conversion, or side effect.

## Operational visibility and recovery

One quiet **Form health** surface should show only actionable operational facts:

- accepted, primary-pending, primary-failed, notification-pending, notification-
  failed, acknowledgement-failed, and quarantined counts by Tenant/Site/form;
- oldest pending age, backlog, retry exhaustion, route/template/recipient/
  provider readiness, suppression/bounce trends, and last successful delivery;
- exact occurrence and step receipts, correlation ids, redacted error category,
  actor/change audit, and bounded retry/reconcile actions; and
- recipient/template/adapter impact before disable, retire, or delete.

It is not a second submission inbox and does not expose raw sensitive answers
to operators who lack the purpose owner's permission. Alerts use sustained,
purpose-aware thresholds rather than one alert per spam submission.

## Test-before-release proof matrix

A later implementation cannot claim D26 complete until it proves:

- every supported purpose × field × primary destination × notification ×
  locale × classification × staff role combination;
- cross-Tenant/Site/form/recipient/template/inbox/program identifiers, forged
  browser scope, service-role containment, RLS/grants, and denial tests;
- stale/retired generations, schema change during completion, option deletion,
  renamed labels, duplicate clicks, replay, concurrent retries, timeout after
  commit, and unknown outcomes;
- Support Hub/Mobilize/domain success with notification failure, domain failure
  with no false success, per-recipient partial email outcomes, provider
  disconnect, template retirement, email-destination changes, suppression, bounce,
  complaint, rate limiting, and duplicate/out-of-order webhooks;
- Email Studio merge-contract compatibility, escaping, redaction, locale,
  sender/reply identity, consent, transactional/marketing separation, and
  frozen exact publication on retry;
- request/field/byte/rate/backlog bounds, hostile option values, HTML/script
  input, header/recipient/template injection, denial-of-service, and adaptive
  abuse controls;
- atomic occurrence/intent/dispatch-row commit, crash immediately after commit,
  failed handoff recovery, disabled or quota-exhausted Inngest, replay after its
  deduplication window, Tenant-keyed fairness, bounded executions per
  submission, and account-wide workflow cost;
- keyboard, screen-reader, focus, error-summary, 320 CSS-pixel reflow, 400%
  zoom, forced-colors, RTL/CJK/long labels, reduced motion, slow network,
  suspended mobile tab, preserved-answer behavior, no-JavaScript submission,
  shared form-primitive semantics, and a discoverable submit action; and
- D25 side-effect darkness, D1 all-or-none release, exact rollback/recovery,
  retention/purge, backup/restore, adapter conformance, and production-shaped
  performance/cost budgets.

## Exact founder-ratified B-prime-R formulation

> **B-prime-amended-and-hardened (B-prime-R) — Purpose-bounded Public Form
> Definitions with one purpose-qualified Primary Outcome and independently
> governed notification deliveries.**
>
> 1. **One purpose-bounded definition.** Each public form belongs to one small,
>    code-owned, versioned Public Form Purpose Profile. The profile fixes stable
>    semantic field meanings, required domain mappings, sensitivity ceiling,
>    consent, retention, eligible Primary Outcomes, compatible message
>    contracts, and abuse bounds. Unknown versions fail closed.
> 2. **Safe tenant customization, not executable tenant logic.** Staff may edit
>    translated presentation copy, labels, help, options, order, approved
>    optional fields, confirmation copy, and a bounded catalog of ordinary
>    supplemental questions. They cannot change protected semantics,
>    classification, retention, consent meaning, required owner fields,
>    recipients from visitor data, arbitrary code/webhooks, or domain
>    authority. Supplemental answers never silently populate domain fields.
> 3. **One Primary Outcome.** Every released Route Plan names exactly one
>    operational owner. Support Hub-only means a Support Hub conversation is
>    truth. Email-only means one action-qualified Verified Email Destination
>    with durable, short-retained Asym delivery evidence and no second staff
>    inbox; its member deliveries remain independently observable. Mobilize,
>    subscription, event, workflow, care, or other destinations remain
>    unavailable until their owning phase certifies an exact adapter. There is
>    no multi-master fan-out.
> 4. **Independent secondary effects.** A Route Plan may add zero or more staff
>    Notification Deliveries and zero or one Visitor Acknowledgement. A
>    successful Primary Outcome is never rolled back because a notification
>    fails. Each child has its own idempotency, state, evidence, retry, and
>    recovery.
> 5. **Verified email destinations.** Tenant administrators manage reusable,
>    same-Tenant destinations with accountable owner, action/notification use,
>    active/verified status, monitored-address attestation, and sensitivity
>    ceiling. They may resolve eligible teams, users, single external
>    addresses, or distribution addresses. Resolution freezes exact recipients
>    per submission; each member receives a separate intent and addresses are
>    never exposed to one another. An email-only handoff completes only when
>    every frozen required member is transport-accepted; later adverse evidence
>    raises **Needs attention**. Browser input never controls recipients.
> 6. **Email Studio is the content authority.** Staff select compatible Phase 17
>    message contracts and Live Email Studio publications for staff
>    notification and visitor acknowledgement separately. D26 stores no raw
>    Resend template authority. At preparation, Phase 6/17 freezes the exact
>    publication, locale, facts, sender/reply identity, consent/suppression
>    result, provider connection, and recipients. Later Email Studio or
>    email-destination changes affect future submissions only.
> 7. **Resend is bounded transport.** Every recipient is an independent
>    communication intent; provider batch APIs are an optimization only. Asym's
>    durable semantic idempotency outlives Resend's 24-hour provider window.
>    Accepted, receiving-server delivered, bounced, suppressed, complained,
>    and failed remain distinct facts; opened/clicked telemetry is non-
>    authoritative. Duplicate/out-of-order webhooks are verified, deduplicated,
>    and reduced monotonically.
> 8. **Minimal and safe email content.** Staff notifications default to a
>    bounded safe summary and authenticated product link. Visitor receipts are
>    transactional and never echo arbitrary free text, sensitive answers, or
>    internal routing. No answer can control sender, recipient, subject,
>    template, headers, reply behavior, tracking, or redirect; no raw
>    `all_fields` merge exists.
> 9. **Durable server-side acceptance.** The public browser posts only to an
>    Asym server boundary. The server derives scope from trusted host/current
>    D1 generation, validates the exact released schema and limits, and
>    transactionally records one immutable Form Submission Occurrence, exact
>    Route Plan, Primary Outcome work item, child intents, and corresponding
>    product-owned workflow-dispatch requests before saying **Received**. The
>    transaction commits all of them or none of them. Direct anonymous writes
>    to domain, route, or delivery tables are forbidden.
> 10. **No ownerless submissions database.** The occurrence envelope is
>     delivery/recovery truth, not a generic CMS inbox. Staff work in Support
>     Hub, Mobilize, or the certified purpose owner. Email-only content is
>     encrypted, available only to a narrow repair capability, retained for a
>     fixed short purpose-bound period, and purged while body-free evidence
>     remains.
> 11. **Exact release behavior.** D1 releases the form definition and Route Plan
>     as one Site-locale generation. Page placements cannot override delivery.
>     Route changes require a Site release. Source-owned recipient membership
>     and Email Studio publications re-resolve for future occurrences; current
>     authorization, consent/suppression, integration readiness, and adverse
>     safety revocation are re-proved before an effect crosses its boundary.
>     Historical completed evidence never drifts.
> 12. **Calm five-step UX.** The default workflow is **Purpose**, **Questions**,
>     **Delivery**, **Confirmation**, and **Review & publish**. Delivery is split
>     into **Where the work goes**, **Who should be notified**, and **What the
>     visitor receives**. The UI uses a numbered plain-language outcome summary,
>     not a node graph; shows owner, included data, retention, recipients,
>     templates, readiness, and failure meaning; and blocks release on required
>     Not Ready dependencies.
> 13. **Purpose-aware product handoffs.** Donation uses Phase 13 Giving rather
>     than a generic form. Applications use Phase 34/37's future certified
>     definition and Mobilize adapter. Classified care/crisis uses Phase 38.
>     Uploads wait for Phase 29. Newsletter consent/confirmation uses the
>     Phase 32 subscription owner through Phase 3's consent seam. Disabled
>     choices state the exact setup action; D26 does not invent placeholder
>     records.
> 14. **Accessible visitor journey.** Forms are short, predominantly single-
>     column, visibly labeled, grouped, mobile/zoom safe, and server validated.
>     Errors preserve answers, focus and link an accessible summary, appear at
>     fields, and never silently remap stale-schema answers. Confirmation says
>     what was durably accepted and what happens next without promising inbox
>     delivery or response time the tenant cannot meet.
> 15. **Layered abuse and privacy controls.** Trusted host/generation proof,
>     replay/idempotency tokens, allowlist validation, field/request/byte bounds,
>     per-purpose and multi-dimensional rate limits, honeypot/timing signals,
>     backpressure, and accessible risk-based challenges protect ingress. No
>     personal or answer data enters URLs, logs, analytics, traces, metric
>     labels, or provider tags. Launch includes no arbitrary redirects,
>     JavaScript, payments, uploads, or generalized conditional workflows.
> 16. **Tenant and permission safety.** Every identifier and adapter lookup is
>     structurally bound to Tenant × environment × Site and checked server-
>     side. Operational tables are server-only or protected by least grants,
>     RLS, matching indexes, and denial tests; service-role credentials never
>     reach clients. Form editors cannot grant themselves Support Hub,
>     Mobilize, Email Studio, recipient, or sensitive-answer access.
> 17. **Partial failure is explicit and recoverable.** Primary and child work
>     execute asynchronously with stable work claims and stale-result fencing.
>     Transient failures retry within bounded policy; indeterminate provider
>     outcomes reconcile before resend; permanent invalid configuration fails
>     closed; successful steps are not repeated. Email-only forms with no safe
>     recoverable destination show an approved alternate contact.
> 18. **Quiet operational health.** Form health exposes redacted actionable
>     counts, oldest pending age, route/template/recipient/provider readiness,
>     exact step receipts, sustained alerts, and bounded reconcile/retry. It
>     never becomes a second content inbox or reveals answers beyond the
>     purpose owner's permissions.
> 19. **Side-effect-dark Preview and explicit tests.** D25 Preview permits visual
>     interaction and validation but creates no occurrence, owner record,
>     message, or conversion. Authenticated **Check routing** performs a no-write
>     plan; **Send test email** uses synthetic data, an authorized test
>     recipient, and visible TEST labeling. Production proof covers purpose,
>     owner, locale, tenant isolation, races/replays, partial failure,
>     provider/webhook behavior, privacy, retention, abuse, accessibility,
>     performance, cost, recovery, and upgrade conformance.
> 20. **Payload is optional machinery, never authority.** Payload may provide a
>     version-qualified authoring adapter only behind this provider-neutral
>     contract. Its native Form Submissions, dynamic email, payment, upload,
>     fallback-recipient, and unrestricted redirect paths stay disabled or are
>     replaced. D26 adds no general workflow graph, arbitrary adapter runtime,
>     duplicated Support/Mobilize inbox, or second template system.
> 21. **Inngest is the bounded post-commit executor.** D26 reuses Core's existing
>     shared Inngest runtime only after Clause 9's transaction commits. One
>     identifier-only event points to each independently recoverable destination
>     intent; product records, permanent idempotency, fenced work claims, owner
>     outcomes, and the shared dispatch ledger/recovery scan remain authority.
>     Tenant-keyed concurrency and owner-qualified queued throttling may delay
>     accepted work but never discard it. D26 adds no per-Tenant app or
>     scheduler, puts no answers or personal data in workflow events, and
>     delegates all recipient-level email execution to Phase 6/17.
> 22. **TanStack Form is the bounded staff interaction adapter.** The complex
>     five-step staff builder reuses an accessibility-proven, version-pinned
>     shared `useAsymForm` adapter for local edit state, fields, arrays, cross-
>     field feedback, and server-error reconciliation. The Asym-owned released-
>     definition compiler and server commands remain authority. The launch
>     public form uses semantic HTML with browser-native submission, a no-
>     JavaScript path, and exact server validation; D26 adds no generic JSON-form
>     engine, client-authoritative validation, hidden browser autosave, or new
>     meta-framework form package.

## Ratification

The quoted B-prime-R text is the complete founder-ratified D26 authority.
Supporting research and the adversarial review explain it but do not
independently expand it. Ratification authorizes no implementation, schema,
migration, dependency/provider adoption, issue publication, Git publication,
deployment, D1 activation, release, or production change.

Root `CONTEXT.md` synchronization remains held until the Phase 22 documentation
stack is merged or Phase 23 becomes an explicit reviewed stack. D26's canonical
terms are preserved in this brief, the Phase 23 decision log, and ADR-0170
without overwriting accepted Phase 22 language.

## Sources

### Repository authority

- [Phase 23 decision log](../phase-23-web-studio-cms-decision-log.md)
- [ADR-0170 — Purpose-bounded Public Form Definitions](../../../adr/0170-purpose-bounded-public-form-definitions-and-domain-owned-routing.md)
- [Email Studio](../../../guides/features/email-studio.md)
- [Resend integration](../../../guides/features/resend-integration.md)
- [ADR-0029](../../../adr/0029-tenant-owned-resend-and-composed-delivery-identities.md)
- [Phase 17 message/template management](../phase-17-system-messages-template-management.md)
- [D26 Resend/email-routing research](./phase-23-d26-resend-email-routing-primary-source-research.md)
- [D26 Inngest/TanStack Form fit research](./phase-23-d26-inngest-and-tanstack-form-fit-research.md)
- [Workflow orchestration OpenSpec](../../../../openspec/specs/workflow-orchestration/spec.md)
- [`tanstack-form.tsx`](../../../../packages/ui/components/primitives/tanstack-form.tsx)
- [`payload.config.ts`](../../../../apps/admin/payload.config.ts)
- [`inbound-router.ts`](../../../../packages/api/src/admin/support-hub/inbound-router.ts)
- [`admin-workspace.ts`](../../../../packages/database/collections/admin-workspace.ts)

### Current primary sources checked 2026-08-23

- [Payload Form Builder](https://payloadcms.com/docs/plugins/form-builder)
- [Resend Templates](https://resend.com/docs/dashboard/templates/introduction)
- [Resend Send Email](https://resend.com/docs/api-reference/emails/send-email)
- [Resend Batch](https://resend.com/docs/api-reference/emails/send-batch-emails)
- [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys)
- [Resend webhooks](https://resend.com/docs/webhooks/introduction)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [W3C Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [GOV.UK validation](https://design-system.service.gov.uk/patterns/validation/)
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [HubSpot form customization](https://knowledge.hubspot.com/forms/create-and-edit-forms)
- [HubSpot submission notifications](https://knowledge.hubspot.com/forms/set-up-your-form-submission-notifications)
- [Inngest idempotency](https://www.inngest.com/docs/guides/handling-idempotency)
- [Inngest concurrency](https://www.inngest.com/docs/guides/concurrency)
- [Inngest throttling](https://www.inngest.com/docs/guides/throttling)
- [Inngest rate limiting](https://www.inngest.com/docs/guides/rate-limiting)
- [Inngest pricing](https://www.inngest.com/pricing)
- [TanStack Form validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation)
- [TanStack Form submission handling](https://tanstack.com/form/latest/docs/framework/react/guides/submission-handling)
- [TanStack Form composition](https://tanstack.com/form/latest/docs/framework/react/guides/form-composition)
- [TanStack Form with Next.js](https://tanstack.com/form/latest/docs/framework/react/guides/ssr)
