# ADR-0170: Purpose-bounded Public Form Definitions with domain-owned routing

**Status:** Accepted (founder-ratified Phase 23 D26 B-prime-R, 2026-08-23)

## Context

Phase 23 must let ministry staff compose clear branded public forms and direct
accepted information to Support Hub, one or more verified email recipients, or
a later certified domain such as Mobilize. Anonymous intake crosses editorial,
privacy, consent, tenant, communications, workflow, retention, abuse, and
operational boundaries; a generic form-submissions table or direct email send
does not provide an accountable owner or reliable recovery.

Payload's form-builder plugin combines definition, submission storage, dynamic
email, redirect, upload, and payment behavior. Resend provides transport, not
business ownership or permanent idempotency. Phase 6/17 already owns
communication planning and Email Studio publications, Phase 26 owns Support
Hub, Phase 13 owns giving, Phase 29 owns governed files, Phase 32 owns
subscriptions, Phase 34/37 owns application/workflow intake, and Phase 38 owns
classified care. D26 must compose those owners without recreating them.

Core also already has a shared Inngest executor, product-owned dispatch ledger
and recovery scan, plus a shared TanStack Form adapter. The decisive repository
finding is that a separately committed form occurrence followed by later
dispatch-row creation has a process-crash gap. The selected design therefore
makes occurrence, destination intents, and dispatch requests one atomic
acceptance transaction, then treats both Inngest and TanStack Form as bounded
replaceable adapters.

## Decision

<!-- prettier-ignore -->
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

## Consequences

- Every public form has one code-owned Purpose Profile and exactly one Primary
  Outcome. Tenant customization remains broad enough for useful presentation
  and ordinary supplemental questions but cannot create executable authority.
- Support Hub, a bounded verified-email handoff, or a later certified domain
  owns the operational result. Notifications and visitor acknowledgement are
  independent child effects rather than additional systems of record.
- Email Studio and Phase 6/17 remain message/delivery-plan authority; Resend
  remains recipient-level transport with durable product idempotency and
  monotonic evidence outside its provider window.
- One server-only PostgreSQL transaction records the immutable occurrence,
  exact Route Plan, all destination/communication intents, and corresponding
  workflow-dispatch rows before the visitor receives **Received**.
- Inngest runs only after commit with identifier-only envelopes, product work
  claims, Tenant-keyed lossless flow control, and the shared recovery scan. An
  Inngest outage or quota problem delays work without invalidating acceptance.
- The five-step staff builder uses the accessibility-proven shared TanStack
  Form seam. The launch public form stays semantic HTML with browser-native
  submission, a no-JavaScript path, and authoritative exact server validation.
- D1 releases definition and Route Plan together. Page placements cannot hide
  delivery overrides, and D25 Preview remains side-effect-dark.
- Staff see one guided setup and one quiet Form health surface, while actual
  work remains in Support Hub, Mobilize, or the certified purpose owner.
- The model requires substantial hostile-ingress, privacy, tenant-isolation,
  failure, recovery, accessibility, migration, and account-wide cost proof,
  but avoids the larger permanent cost of multiple inboxes and workflow truth.

## Rejected alternatives

- **A generic workflow graph or arbitrary adapter runtime:** rejected because
  it duplicates Phase 34, creates unbounded conditions and destinations, and
  gives ordinary form editors operational authority they do not own.
- **Several primary destinations:** rejected because partial success creates
  multi-master truth, irreconcilable staff expectations, and ambiguous
  retention and incident ownership.
- **Email or Resend as submission truth:** rejected because transport
  acceptance is not operational completion, provider idempotency is bounded,
  and email cannot replace a purpose-owning product.
- **Payload Form Submissions and direct dynamic email as authority:** rejected
  because it creates an ownerless CMS inbox and bypasses Phase 6/17, consent,
  tenant identity, purpose retention, and product recovery.
- **Browser-controlled recipients, templates, webhooks, redirects, scripts, or
  validators:** rejected because anonymous answers would control trusted
  execution and disclosure boundaries.
- **Client or TanStack validation as acceptance authority:** rejected because
  browser state can be stale, bypassed, or tampered with and cannot derive the
  current trusted Tenant, generation, route, or owner.
- **Mandatory TanStack Form public runtime or a new Next.js adapter package:**
  rejected at launch because it weakens progressive enhancement and adds
  hydration/integration cost without removing exact server validation.
- **Inngest as submission, idempotency, or outcome truth:** rejected because
  workflow state, deduplication windows, retries, and dashboard replay cannot
  replace product records, fenced work claims, provider evidence, or manual
  recovery.

## Activation boundary

Ratification records architecture only. A future authorized implementation
must prove the closed purpose/field/destination/message catalogs; exact D1
release and server compiler; atomic occurrence/intent/dispatch acceptance;
permanent idempotency and fenced claims; Support Hub and verified-email
adapter conformance; Email Studio/Resend freeze and monotonic evidence;
cross-Tenant denial and RLS/grants where exposed; hostile anonymous ingress;
privacy, encryption, retention and purge; disabled future owners; safe
workflow events and errors; Inngest outage/recovery/cost; D25 side-effect
darkness; native public submission; shared-form accessibility; operational
health; migration/rollback; and production-shaped performance before Live
activation.

## References

- [Phase 23 D26 exact formulation and decision brief](../prds/sitestacker-parity/research/phase-23-d26-public-form-definitions-and-routing-decision-brief.md)
- [Phase 23 D26 complete adversarial review](../prds/sitestacker-parity/research/phase-23-d26-public-forms-adversarial-review.md)
- [Phase 23 D26 Resend and email-routing research](../prds/sitestacker-parity/research/phase-23-d26-resend-email-routing-primary-source-research.md)
- [Phase 23 D26 Inngest and TanStack Form research](../prds/sitestacker-parity/research/phase-23-d26-inngest-and-tanstack-form-fit-research.md)
- [Phase 23 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md)
- [Workflow orchestration OpenSpec](../../openspec/specs/workflow-orchestration/spec.md)
- [ADR-0145 — Page-local composition and coherent Site generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0156 — Bounded working revisions and recoverable active editor](./0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [ADR-0157 — Exact-revision scheduled publication](./0157-exact-revision-scheduled-publication-appointments-through-d1.md)
- [ADR-0168 — One exact public audience](./0168-one-exact-public-audience-and-app-owned-authenticated-surfaces.md)
- [ADR-0169 — Immutable whole-Site Preview Candidates](./0169-immutable-whole-site-preview-candidates-over-sealed-site-plan-inputs.md)
- [Email Studio](../guides/features/email-studio.md)
- [Resend integration](../guides/features/resend-integration.md)
- [Inngest idempotency](https://www.inngest.com/docs/guides/handling-idempotency)
- [TanStack Form validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation)

Ratification of this planning decision authorizes no implementation, schema,
migration, dependency or provider adoption, issue publication, deployment, D1
activation, release, or production change.
