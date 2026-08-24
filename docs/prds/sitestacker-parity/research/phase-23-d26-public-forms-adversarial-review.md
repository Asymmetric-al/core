# Phase 23 D26 adversarial review — Public Form Definitions and domain-owned routing

**Status:** Complete supporting review for the founder-ratified B-prime-R. The
exact authority is in the
[D26 decision brief](./phase-23-d26-public-form-definitions-and-routing-decision-brief.md)
and this review does not independently expand it.

**Date:** 2026-08-23

## Decision under review

> **B-prime — Purpose-bounded Public Form Definitions with domain-owned
> submissions**, including safe customization, Support Hub-only, verified-email-
> only, domain-plus-email, and future Mobilize-plus-email outcomes using Email
> Studio and Resend.

This review challenges the complete product, data, authorization, delivery,
editorial, accessibility, and operational contract. It does not reopen D1–D25,
assign domain ownership away from another phase, or authorize implementation,
schema, migration, dependency adoption, issue publication, Git publication,
deployment, release, or production change.

## Executive verdict

**Viable after hardening.** The request is flexible without being overengineered
when D26 uses one purpose-bounded definition, exactly one Primary Outcome, and
independent notification/acknowledgement intents. It is unsafe if “route it
anywhere” becomes a free-form workflow graph, if Payload stores an ownerless
copy, if direct email is the only evidence, if several products each become
truth, or if the form editor can type arbitrary recipients/templates/headers.

The permanent shape is:

```text
Released Public Form Definition + Route Plan
                    |
       durable server-side acceptance
                    |
        Form Submission Occurrence
                    |
         exactly one Primary Outcome
                    |
       zero..n staff notifications
                    |
       zero..1 visitor acknowledgement
```

Every child is independently idempotent and observable. The Primary Outcome is
never rolled back by a notification failure. Email-only remains available for
low-risk forms because Asym keeps a short-retained recoverable delivery envelope
without exposing a second operational inbox.

## Evidence and reasoning baseline

- The source prompt assigns form presentation to Web Studio/Payload but assigns
  submission truth, Party matching, Support Hub, workflow enrollment, consent,
  communications, and retention to Asym/domain owners.
- Payload's official form plugin stores submissions and can directly send
  dynamic emails, redirect, upload, and process payments. That default is too
  broad for D26's authority boundary.
  [Payload Form Builder](https://payloadcms.com/docs/plugins/form-builder)
- Core already defines Email Studio as the provider-neutral template authority,
  Phase 6/17 as the communication seam, and tenant-owned Resend as transport.
- The current Email Studio head/version/binding writes are not yet one
  transactional CAS publication, and the current Resend reducer omits
  `email.failed` while permitting a late `sent` event to overwrite a bounce.
  D26 must depend on the permanent Phase 17/6 publication/evidence contract, not
  treat the current bridge as complete.
- Resend's API limits and semantics are transport facts: 50 addresses in one
  send, up to 100 messages in a batch, 24-hour idempotency retention, and at-
  least-once unordered webhooks. None provides permanent business idempotency or
  multi-recipient operational truth.
  [Send Email](https://resend.com/docs/api-reference/emails/send-email),
  [Batch](https://resend.com/docs/api-reference/emails/send-batch-emails),
  [Idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys),
  [Webhooks](https://resend.com/docs/webhooks/introduction)
- Supabase requires grants and RLS together, keeps `service_role` server-side,
  recommends indexes for policy predicates, and requires policy tests.
  [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- W3C and GOV.UK validate visible labels, short/logical forms, retained values,
  an accessible error summary, linked field errors, and explicit completion
  feedback. [W3C Forms](https://www.w3.org/WAI/tutorials/forms/),
  [GOV.UK validation](https://design-system.service.gov.uk/patterns/validation/)
- Core already has a product-owned workflow dispatch ledger, recovery scan,
  identifier-only event envelope, and shared Inngest 4.5.1 runtime. D26 can reuse
  them only after its occurrence, destination intents, and dispatch rows commit
  atomically. Inngest's 24-hour event deduplication does not replace permanent
  product idempotency.
  [Inngest idempotency](https://www.inngest.com/docs/guides/handling-idempotency)
- Core already has TanStack Form 1.28.6 and the shared `useAsymForm` extension
  seam. It suits the complex staff definition builder, but the launch public
  visitor form remains semantic-native and server-authoritative.
  [TanStack Form composition](https://tanstack.com/form/latest/docs/framework/react/guides/form-composition)

The focused
[Inngest/TanStack Form fit research](./phase-23-d26-inngest-and-tanstack-form-fit-research.md)
records the complete adapter, cost, crash-recovery, UX, and seventeen-category
delta. Its findings are incorporated into the exact B-prime-R rather than
creating a separate decision.

## 1. Brittleness

**Material concern: Yes.**

- **What could go wrong:** A mutable form label may be mistaken for a field key;
  a page placement may secretly override delivery; a route may reference a
  retired Support Hub inbox, verified email destination, Email Studio publication, sender
  domain, or future Mobilize program; a stale browser may submit against a newer
  schema; a downstream API may accept and time out; or a provider-specific
  template/field shape may leak throughout the product.
- **Why it matters:** Forms sit at the boundary between anonymous input and
  several operational systems. Small configuration drift can silently lose
  ministry inquiries, create the wrong applicant, disclose an answer, or show a
  false success message.
- **Severity:** High.
- **Likelihood:** High without explicit version and readiness contracts; medium
  after the proposed controls.
- **Evidence/reasoning:** Payload's default plugin combines definition,
  submission, email, redirect, upload, and payment. Resend-hosted templates have
  their own publish state. Current Mobilize data is seeded rather than a
  certified intake. These are different mutable lifecycles.
- **Permanent fix:** Use immutable semantic field keys, code-owned purpose
  profiles, versioned Route Plans, stable same-Tenant references, release-time
  dependency proof, submission-time safety/readiness proof, adapter ports,
  exact occurrence receipts, and stale-schema recovery that preserves compatible
  answers but never remaps silently. Page placements never override routes.

## 2. Technical debt

**Material concern: Yes.**

- **What could go wrong:** D26 could build a second form engine, second template
  system, second workflow system, second submissions inbox, generic JSON bag,
  or one-off integration code for every destination. Direct calls from a
  Payload hook to Resend or Support Hub would duplicate Phase 6/17 and domain
  seams. Building around current seeded Mobilize records would fossilize demo
  shapes.
- **Why it matters:** Every new destination, field, localization rule, provider
  change, or privacy request would require coordinated rewrites and data repair.
- **Severity:** High.
- **Likelihood:** High if generic CMS conveniences are adopted directly; low–
  medium with one port/catalog design.
- **Evidence/reasoning:** Core already has authoritative Email Studio,
  communication, Support Hub, privacy, and release contracts. Payload and
  Resend offer overlapping generic features that do not share those contracts.
- **Permanent fix:** Keep one provider-neutral Public Form Definition, one small
  purpose catalog, one closed destination-adapter interface, and one Phase 6/17
  message seam. Do not adopt Payload Form Submissions/direct email as authority.
  Add adapters only when an owning phase publishes a conformance contract.

## 3. Edge cases

**Material concern: Yes.**

- **What could go wrong:** A form changes while a visitor fills it; two tabs
  submit; mobile connectivity dies after commit; Unicode normalization changes
  an option; a recipient team becomes empty; one of five emails is suppressed;
  the primary owner succeeds and notification fails; the primary request times
  out after acceptance; a template is retired between review and submission; a
  locale has no acknowledgement; a Site changes domain; daylight savings affects
  displayed timestamps; a visitor omits an email; a honeypot is filled by a
  password manager; or the retention purge races a retry.
- **Why it matters:** These are routine Internet and staff lifecycle conditions,
  not exotic failures. Mishandling them causes duplicate work, lost answers,
  false confirmation, or unnecessary visitor re-entry.
- **Severity:** High overall; individual cases range from low to critical.
- **Likelihood:** High in aggregate.
- **Evidence/reasoning:** Resend explicitly limits idempotency to 24 hours and
  webhooks can duplicate/reorder. Public sessions are long-lived relative to
  editorial release changes. Recipient and template membership are mutable.
- **Permanent fix:** Use exact released-schema identity, stable client and
  server idempotency, commit receipt lookup, compatible-answer preservation,
  per-recipient intents, frozen delivery facts, monotonic outcomes, bounded
  locks/claims, safe purge state, accessible non-CAPTCHA fallbacks, and explicit
  matrix/chaos/browser tests.

## 4. Footguns

**Material concern: Yes.**

- **What could go wrong:** Staff may type an unmonitored address, expose many
  recipients in `To`/`Cc`, select a marketing template for a receipt, email all
  application answers, make the visitor email the sender, point a confirmation
  to an unsafe URL, remove a field required by Mobilize, disable a live inbox,
  or assume “delivered” means read. Developers may bypass access with
  `overrideAccess`, a service key, a generic JSON adapter, or blind retry.
- **Why it matters:** The easiest path must also be the safe path; otherwise a
  polished form builder becomes a data-leak and lost-work generator.
- **Severity:** Critical for scope/recipient/data leaks; high otherwise.
- **Likelihood:** High without constrained selectors and impact review.
- **Evidence/reasoning:** Payload's form plugin supports dynamic data-derived
  email and fallback recipients. Resend accepts recipient arrays and header
  overrides. Those primitives are intentionally more permissive than D26.
- **Permanent fix:** Verified email destinations outside the form editor; independent
  recipient intents; compatible typed message contracts; locked required fields;
  no arbitrary headers/redirects/code; calm destructive-change previews; D12
  undo; dependency impact views; precise provider-state copy; privileged
  advanced settings; deny-by-default server validation.

## 5. Tenant safety

**Material concern: Yes.**

- **What could go wrong:** A client-supplied tenant id, guessed form id,
  cross-Tenant inbox/program/template/recipient reference, stale hostname,
  global cache key, worker claim, webhook tenant resolution, or service-role
  query could route one ministry's answers or notifications to another.
- **Why it matters:** A cross-Tenant form leak can expose identities, prayer
  requests, applications, and internal addresses and is a platform-level trust
  failure.
- **Severity:** Critical.
- **Likelihood:** Medium without structural constraints; low with layered proof.
- **Evidence/reasoning:** Supabase warns that grants and RLS are separate and
  that service-role access bypasses RLS. Core's existing inbound Support Hub
  router requires tenant resolution before routing, but it is an email-specific
  port and cannot simply be reused for public forms.
- **Permanent fix:** Derive Tenant/Site/locale/generation from trusted host and
  server routing; use composite same-scope foreign keys or equivalent structural
  checks; tenant-bound unique/idempotency keys, jobs, caches, logs, and metrics;
  server-only ingress; least grants plus RLS and policy indexes; explicit cross-
  Tenant denial tests; deterministic provider-event tenant resolution; no
  browser service credentials.

## 6. Overengineering

**Material concern: Yes.**

- **What could go wrong:** “Flexible” may become a node graph, arbitrary
  webhooks, scripts, conditional branches, generic workflow runtime, plugin
  marketplace, per-Tenant schemas, per-route queues, configurable state
  machines, complex form logic, or duplicated domain models before ministries
  need them.
- **Why it matters:** Staff primarily need a clear form with a trustworthy
  destination. Generalized orchestration makes setup slower, errors harder to
  explain, tests combinatorial, and ownership ambiguous.
- **Severity:** High.
- **Likelihood:** High if every hypothetical route is built now; low under the
  closed adapter catalog.
- **Evidence/reasoning:** Phase 34 already owns generalized workflows. The
  requested real scenarios fit one Primary Outcome plus notifications.
- **Permanent fix:** Ship a small code-owned purpose catalog, bounded ordinary
  field types, one Primary Outcome, independent notification/acknowledgement,
  and closed certified adapters. Keep advanced settings progressive and small.
  Add a new profile/adapter only for a proven owner-backed use case.

## 7. UX/UI and user friction

**Material concern: Yes.**

- **What could go wrong:** Staff may not know the difference between “where work
  goes” and “who gets email”; destination jargon and nested settings may hide
  consequences; advanced flexibility may overwhelm small ministries; disabled
  integrations may lead to dead ends; a route may look ready while recipients
  are empty; visitors may face long forms, placeholder-only labels, lost answers,
  unclear errors, inaccessible CAPTCHA, or a false promise of delivery.
- **Why it matters:** Confusion at setup creates operational failure; friction at
  submission causes abandonment and erodes ministry trust.
- **Severity:** High.
- **Likelihood:** High without an opinionated journey; low–medium with the
  proposed progressive flow.
- **Evidence/reasoning:** W3C/GOV.UK emphasize short forms, visible labels,
  retained answers, field errors plus a focused summary, and clear completion.
  Comparable CRM patterns separate case ownership from notifications rather
  than showing provider internals; HubSpot selects active users/teams for form
  notices but also demonstrates why D26 should reject hidden Page-level
  recipient overrides.
  [HubSpot submission notifications](https://knowledge.hubspot.com/forms/set-up-your-form-submission-notifications)
- **Permanent fix:** A five-step **Purpose → Questions → Delivery → Confirmation
  → Review & publish** journey; clear lanes for Primary Outcome, notifications,
  and visitor receipt; strong defaults; progressive customization; persistent
  plain-language outcome summary; route cards with owner/data/retention/
  template/recipients/readiness; actionable setup links; no graph; single-column
  public forms; accessible error recovery; exact honest success copy; usability
  testing with small and large ministry staff and public visitors.

## 8. Hidden coupling

**Material concern: Yes.**

- **What could go wrong:** A form release may pin a raw template version so copy
  changes require Site publication; a template may assume arbitrary form labels;
  route code may import Support/Mobilize tables; page placement may decide
  recipients; a domain adapter may depend on Payload document ids; retention may
  be encoded in a queue; or removing a recipient may rewrite historical truth.
- **Why it matters:** Ordinary changes become risky coordinated deploys and
  historical evidence drifts.
- **Severity:** High.
- **Likelihood:** Medium–high without explicit ports/version semantics.
- **Evidence/reasoning:** Form presentation, D1 release, Email Studio
  publication, recipient membership, provider connection, and domain records
  have legitimately different lifecycles.
- **Permanent fix:** Route Plan references stable message/recipient/domain
  contracts; submission preparation resolves and freezes exact current facts;
  adapters consume provider-neutral occurrences; historical records keep frozen
  identities; source-owned changes affect future submissions only; contract
  tests stop direct table/provider coupling.

## 9. Failure modes

**Material concern: Yes.**

- **What could go wrong:** The database can commit while the response is lost;
  the Primary Outcome can accept while the worker times out; email can be
  accepted then bounce; one recipient can fail; Resend can rate-limit; webhooks
  can duplicate/reorder; a domain adapter can stay unavailable; a queue/backlog
  can exceed retention; or a release can reference Not Ready dependencies.
- **Why it matters:** False failure invites duplicate submission; false success
  loses work; indiscriminate retry duplicates domain records or email.
- **Severity:** High–critical.
- **Likelihood:** Medium individually, high over product lifetime.
- **Evidence/reasoning:** Resend's documented delivery model is asynchronous,
  its idempotency is time-bound, and webhooks are at-least-once/unordered.
- **Permanent fix:** Atomic occurrence + intent creation; durable commit-receipt
  lookup; independent state machines; permanent semantic idempotency; adapter
  idempotency keys; lease/claim expiry and stale-worker fencing; reconcile-before-
  retry for unknown outcomes; bounded retry/dead-letter/quarantine; release and
  submission readiness gates; alternate contact for unavailable email-only
  forms; runbooks and rollback drills.

## 10. Data integrity risks

**Material concern: Yes.**

- **What could go wrong:** Duplicate occurrences or candidates, partial fan-out,
  answer-to-field mapping drift, invalid option values, missing required domain
  fields, stale recipient membership, orphaned route references, purge before
  completion, inconsistent reporting, or a retry rendered with newer template
  content can corrupt meaning.
- **Why it matters:** Intake data can drive pastoral, applicant, and constituent
  decisions. A record that exists but means something different is worse than
  an obvious failure.
- **Severity:** High.
- **Likelihood:** Medium–high without versioned semantics and transactions.
- **Evidence/reasoning:** Labels/locales/templates/recipients/routes change
  independently; JSON alone cannot enforce exact cross-scope relationships.
- **Permanent fix:** Stable semantic keys; immutable purpose and Route Plan
  versions; server schema validation; one acceptance transaction; uniqueness on
  semantic idempotency; structural same-scope references; exact frozen delivery
  facts; monotonic status transitions; purpose-bound retention with purge
  preconditions; reconciliation invariants and repair tooling; import/migration
  validation and checksum/audit evidence.

## 11. Security and privacy risks

**Material concern: Yes.**

- **What could go wrong:** Spam/DoS, XSS or email/header injection, SSRF through
  redirects/webhooks, PII in logs/URLs/analytics/provider tags, sensitive
  answers in notification bodies, recipient enumeration, unauthorized answer
  viewing, forged consent, service-key leakage, unsafe HTML, or malicious upload
  can expose people or systems.
- **Why it matters:** Public forms are an unauthenticated write surface and may
  collect unusually sensitive ministry information.
- **Severity:** Critical.
- **Likelihood:** High for abuse attempts; medium for material exposure without
  controls; low after defense in depth.
- **Evidence/reasoning:** OWASP requires early allowlist validation and semantic
  server checks. Supabase RLS does not protect service-role mistakes. Payload's
  generic plugin supports dynamic mail, redirects, and uploads that expand the
  attack surface.
- **Permanent fix:** Server-only ingress; exact released allowlists; contextual
  escaping; no answer-controlled routing/headers/code/redirect; no launch
  uploads/payments; layered rate/byte/backpressure/bot defenses; CSRF/origin/
  replay controls as applicable; encrypted purpose-bound content; least
  permissions and audited break-glass repair; field-level email redaction;
  signed provider-webhook verification; secret hygiene; privacy review and
  deletion/export/retention tests.

## 12. Scalability and performance risks

**Material concern: Yes.**

- **What could go wrong:** Bot floods can exhaust database connections,
  storage, workers, Resend quota, or domain APIs; large recipient destinations create
  fan-out explosions; expensive RLS policies or unindexed scans degrade staff
  health views; retries create thundering herds; raw answer metrics create high
  cardinality; long synchronous routing makes visitors wait and retry.
- **Why it matters:** One attacked or popular Tenant must not harm others or
  create an uncontrolled provider bill.
- **Severity:** High.
- **Likelihood:** Medium organically, high under abuse.
- **Evidence/reasoning:** Resend has explicit per-request recipient/batch limits;
  Supabase recommends indexes on RLS predicate columns. Public endpoints invite
  bursty unauthenticated traffic.
- **Permanent fix:** Durable short acceptance; async bounded workers;
  per-Tenant/Site/form/IP/address quotas; global/provider concurrency and rate
  control; maximum recipients and fields/bytes; exponential jitter; circuit
  breakers and backpressure; partition/retention only after measured need;
  low-cardinality redacted metrics; matching composite indexes proven with
  production-shaped `EXPLAIN`; capacity and cost tests before activation.

## 13. Operational burden

**Material concern: Yes.**

- **What could go wrong:** Staff or developers may need to maintain recipient
  lists in every form, manually inspect provider dashboards, repair raw database
  rows, remember which product owns a submission, clean spam, republish Sites
  for template copy, or diagnose invisible partial failures.
- **Why it matters:** Nonprofit staff are often small teams; recurring developer
  intervention makes a theoretically flexible system unusable.
- **Severity:** High.
- **Likelihood:** High without reusable configuration and health UX.
- **Evidence/reasoning:** Multiple independent systems and recipients naturally
  create lifecycle churn; generic CMS forms expose configuration rather than
  ownership-aware operations.
- **Permanent fix:** Reusable verified email destinations; purpose templates;
  source-owned template publication; explicit impact review; one Form health
  surface with redacted receipts and bounded retry; automatic suppression/
  invalid-recipient handling; clear ownership; purpose-aware spam quarantine;
  runbooks and support diagnostics; no per-form provider configuration.

## 14. Observability gaps

**Material concern: Yes.**

- **What could go wrong:** Metrics may report “submitted” before commit,
  “delivered” for provider acceptance, or aggregate away one failed recipient;
  PII may leak into traces; cross-system correlation may be absent; a backlog,
  empty team, retired template, or purge failure may go unnoticed.
- **Why it matters:** Operators cannot repair what they cannot distinguish, and
  misleading success metrics conceal constituent harm.
- **Severity:** High.
- **Likelihood:** High unless designed with the workflow.
- **Evidence/reasoning:** Resend exposes separate asynchronous event types;
  Primary Outcome and notification states are independent by design. Current
  Core reduction does not yet preserve every provider fact monotonically, which
  makes this a verified implementation gap rather than a hypothetical concern.
- **Permanent fix:** One correlation chain from occurrence through exact route
  step/recipient/provider id; separate low-cardinality metrics and statuses for
  durable acceptance, primary handoff, each notification, acknowledgement, and
  purge; oldest-age/backlog/readiness/suppression/bounce signals; redacted error
  categories; sustained SLO alerts; synthetic canaries; staff-visible honest
  health; audited repair outcomes.

## 15. Dependency and integration risks

**Material concern: Yes.**

- **What could go wrong:** Payload plugin behavior, Resend APIs/limits/webhooks,
  Email Studio contracts, Support Hub schema, future Mobilize ports, or Supabase
  access behavior can change. A provider outage or tenant domain/API-key
  revocation can invalidate a live route. Direct imports can make upgrades
  product-breaking.
- **Why it matters:** Public contact paths are business-critical and must not
  depend on undocumented vendor behavior.
- **Severity:** High.
- **Likelihood:** Medium over any release; high over the product lifetime.
- **Evidence/reasoning:** Provider docs expose distinct, evolving capabilities;
  Core currently pins nontrivial integration versions and the generic Payload
  plugin's authority differs from Asym's.
- **Permanent fix:** Exact dependency pins; provider-neutral ports; qualified
  adapters; contract fixtures for Payload, Phase 6/17, Support Hub, and each
  future domain owner; webhook/API conformance tests; version/readiness registry;
  unknown-version fail closed; transport substitution capability; tenant-visible
  integration health; rollback and outage drills.

## 16. Migration and upgrade risks

**Material concern: Yes.**

- **What could go wrong:** Renamed fields can break mappings; purpose catalogs
  can remove semantics; existing Site forms can lose recipients/templates;
  migrating from Payload/plugin data can duplicate occurrences; route versions
  can become unreadable; provider/template changes can make historical sends
  unreconstructable; rollback can restore code without compatible data.
- **Why it matters:** Forms and their histories are long-lived evidence, while
  presentation and providers change frequently.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence/reasoning:** The design intentionally spans D1 versions, purpose
  versions, Email Studio publications, mutable email destinations, and external
  adapters.
- **Permanent fix:** Additive versioned catalogs; stable semantic keys; explicit
  deprecation and upgrade transforms; immutable historical snapshots/receipts;
  dual-read/shadow validation only during bounded migrations; checksummed
  export/import; collision and duplicate reconciliation; reversible expand/
  migrate/contract deployment; rollback compatibility window; tenant impact
  preview and dry run.

## 17. Other development hazards

**Material concern: Yes.**

- **What could go wrong:** Two workers can claim the same step; a late worker
  can overwrite a newer result; configuration disable can race preparation;
  retries and purge can deadlock; deployment can mix schema/catalog versions;
  test email can accidentally use production answers; D25 Preview can submit;
  unclear ownership can leave alerts unhandled; clock skew can break leases; or
  a rollback can replay already-completed effects.
- **Why it matters:** These hazards cross normal category boundaries and create
  the hardest intermittent duplicate/loss incidents.
- **Severity:** High–critical.
- **Likelihood:** Medium without explicit state ownership; low after proof.
- **Evidence/reasoning:** D26 combines anonymous requests, database transaction,
  asynchronous workers, mutable configuration, external APIs, and retention.
- **Permanent fix:** One documented state machine and owner; stable lock order;
  database-backed atomic claims/CAS and fencing tokens; server-time leases;
  idempotent adapter operations; transactional outbox/intent creation; exact
  deployment compatibility gates; synthetic-only test sends with TEST labeling;
  mechanically side-effect-dark Preview; deterministic clocks/fault injection;
  rollback/replay/chaos tests; on-call/runbook ownership.

## Ruthless synthesis

### Must be fixed in the D26 contract now

1. **Make ownership unambiguous.** Exactly one Primary Outcome; Support Hub,
   verified-email handoff, or a certified domain adapter. Other emails are
   notifications. No Payload/CMS inbox and no dual truth.
2. **Separate three lanes.** Primary Outcome, staff notifications, and visitor
   acknowledgement have different authority, data, consent, template, failure,
   and recovery rules.
3. **Bound customization.** Purpose profiles own semantics and safety; staff own
   presentation and approved supplemental questions. No arbitrary code,
   recipients, templates, headers, redirects, uploads, payments, or workflow
   graph.
4. **Use Email Studio/Phase 6/17, not Resend Templates as authority.** Freeze
   exact delivery facts per occurrence; use Resend only as bounded transport.
5. **Make email-only honest and recoverable.** Keep short-retained encrypted
   intake/delivery evidence without creating a second staff inbox; fail safely
   if all verified destinations are unavailable.
6. **Make anonymous ingress server-owned.** Derive scope, validate the exact
   released schema, transactionally create the occurrence, complete work-intent
   set, and corresponding shared workflow-dispatch rows, and deny direct
   domain/delivery writes.
7. **Keep future owners future.** Mobilize/application, event, workflow, care,
   subscription, giving, and upload choices activate only after their owning
   phases certify exact adapters.
8. **Adopt the calm five-step UX and accessible visitor contract.** Plain-
   language outcome summary and release readiness are part of correctness, not
   polish.
9. **Reuse the two existing adapters without transferring authority.** Inngest
   executes only committed identifier-referenced work through the shared ledger;
   TanStack Form manages only the complex staff builder through `useAsymForm`,
   while the launch public form remains semantic-native.

### Should be designed and proven with implementation

1. The exact purpose/destination/message catalogs and compatibility matrix.
2. Occurrence, route-step, recipient-intent, claim/fence, retention, and audit
   state machines with structural tenant scope.
3. Support Hub and verified-email adapter conformance; future adapters remain
   disabled fixtures until their owners exist.
4. Recipient-set verification, empty/revoked membership behavior, per-recipient
   delivery, and impact review.
5. Release/submission readiness, retry/reconcile/quarantine, Form health, SLOs,
   redaction, and runbooks.
6. Full hostile tenant/security/privacy, race/replay/failure, accessibility,
   provider, upgrade, capacity, and cost proof matrix.
7. Atomic occurrence/intent/dispatch-row crash tests, a product-owned D26
   outcome loader, safe workflow failure codes, and account-wide execution
   budgets.
8. Shared form-primitive label/error semantics, error-summary focus,
   keyboard-reachable submit, narrow-subscription performance, and a
   no-JavaScript public path.

### Monitor after activation

- submission completion and validation-error rates by non-PII purpose/field;
- abuse challenge and false-positive rates;
- oldest Primary Outcome and notification age;
- retry, duplicate, unknown-outcome, suppression, bounce, and complaint rates;
- empty/invalid email destinations and Not Ready dependencies;
- per-Tenant/provider volume and cost; and
- staff setup success, time-to-publish, support requests, and form abandonment.

Monitoring does not relax any must-fix contract. It identifies where a proven
new purpose, field type, adapter, or UX simplification earns inclusion.

## Implementation order and dependency graph

1. **Freeze vocabulary and ownership** → purpose, form, Route Plan, Primary
   Outcome, notification, acknowledgement, verified email destination,
   occurrence.
2. **Define closed contracts** → purpose profiles, destination adapters, Phase
   17 message compatibility, field/data projections, retention.
3. **Build safe authoring/release semantics** → five-step UX, D12 revisions,
   D22 locale lineages, D1 closure/readiness, D25 inert preview.
4. **Build durable ingress** → trusted scope, validation/abuse, atomic
   occurrence + child intents + shared dispatch rows, permanent idempotency,
   RLS/grants.
5. **Certify launch adapters** → Support Hub and low-risk verified-email only;
   no Mobilize claim until Phase 34/37.
6. **Connect Phase 6/17 and Resend** → per-recipient intents, exact frozen
   publications/identities, consent/suppression, provider reconciliation.
7. **Connect the shared executor and staff interaction adapter** → identifier-
   only post-commit Inngest work, Tenant-keyed lossless flow control, and the
   accessibility-proven `useAsymForm` seam.
8. **Add health/recovery/retention** → redacted status, bounded repair,
   quarantine, purge, alerts, runbooks.
9. **Prove the complete matrix and activate through D1** → no partial rollout
   around missing security, accessibility, operational, or adapter evidence.

## Explicit non-goals

D26 does not create a general workflow builder, multiple primary owners,
arbitrary webhooks or code, a Payload submissions authority, a second Email
Studio, a Resend-hosted-template control plane, a universal lead/contact table,
application semantics, care/crisis intake, donation/payment forms, uploads,
event registration, save-and-resume, form analytics containing answers, or a
second staff inbox for delivery repair.

## Result

The complete founder-ratified B-prime-R formulation is maintained in the
[D26 decision brief](./phase-23-d26-public-form-definitions-and-routing-decision-brief.md).
This review supports that text but does not independently expand it.
