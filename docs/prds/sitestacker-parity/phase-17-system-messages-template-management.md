# Phase 17 — System Messages & Template Management: Tenant Freedom Inside a Governed, Versioned Delivery Contract

## Status

- **Product decision:** Ratified D1–D20 on 2026-07-17 through 2026-07-19
- **Specification date:** 2026-07-19
- **Program posture:** PRD complete; epic #873 and children #874–#905
  published; every child remains `status:blocked`; groomed but not dispatched
- **Implementation posture:** planning only; this document authorizes no
  product-code deployment
- **Slug:** `system-messages`
- **Primary capability:** `outbound-communications`

Phase 17 has one explicit authority and reading hierarchy. A disagreement among
the operative documents is a release blocker; an implementer must not guess:

1. merged `openspec/specs/**` remains the current product baseline;
2. the active `outbound-communications` OpenSpec delta states the proposed
   observable capability requirements;
3. this PRD and [the executable system-message manifest
   specification](./phase-17-system-message-executable-manifest.md) together
   provide the detailed Phase 17 implementation interface and must agree with
   the OpenSpec delta;
4. canonical platform [ADR-0025](../../adr/0025-producer-owned-protected-actions.md),
   [ADR-0026](../../adr/0026-contract-bounded-delivery-plans.md),
   [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md),
   [ADR-0028](../../adr/0028-sms-evidence-governance-transport-unavailable.md),
   [ADR-0029](../../adr/0029-tenant-owned-resend-and-composed-delivery-identities.md),
   [ADR-0030](../../adr/0030-canonical-message-document-and-presentation-dependencies.md),
   [ADR-0031](../../adr/0031-body-free-history-with-expiring-recent-copy.md), and
   [ADR-0032](../../adr/0032-immutable-prepared-message-and-whole-message-recovery.md)
   record the accepted architecture and cannot override observable product
   behavior; and
5. [the dated census](./phase-17-system-message-census-2026-07-19.md),
   [decision-to-test traceability](./phase-17-decision-test-traceability-2026-07-19.md),
   [cross-PRD congruence package](./phase-17-cross-prd-congruence-2026-07-19.md),
   and [CONTEXT.md](../../../CONTEXT.md) are activation-proof, reconciliation,
   and canonical-language companions. [The research
   appendix](./phase-17-system-messages-template-management-research-evidence.md)
   is dated evidence that must be reverified, not product authority.

Older PRDs and roadmap text remain committed context except where their dated
Phase 17 amendments expressly supersede them. Current code is evidence of what
exists, not permission to weaken this contract. The congruence package owns the
conflict-resolution index; any unresolved conflict blocks dispatch and Live
activation.

> **Controlling Phase 19 statement-communication amendment (2026-07-24).**
> Phase 19 admits only five finite semantic producer meanings: one ordinary
> current-statement notice; one source- and exposure-proved current-statement
> update; one contract-permitted withdrawal without a successor; one fresh
> exact-current additional-copy fulfillment that does not replay lifecycle
> meaning; and one grouped staff delivery-attention occurrence. Portal
> availability, self-print/package readiness, run progress/completion, provider
> acceptance, retries, and missionary visibility emit no donor message. A
> failed route never sends a failure message to that same failed destination.
> Phase 17/6 continues to own compilation, preparation, Resend transport,
> monotonic delivery evidence, fallback execution, and communication history;
> Phase 19 owns admission meaning only. The Reserved keys below are planning
> stubs until the complete Phase 19 source fences, recipient contracts, and
> proof packs land.

## Problem Statement

Asym already has useful pieces of an email product: React Email/Tiptap authoring, version rows, tenant Resend settings, send logs, correction-template bindings, receipt senders, and contribution-operation notices. Those pieces do not yet form a safe system-message platform.

Today, a direct sender can still own its own wording, select a coarse `transactional` classification, read mutable sender settings, or bypass the future Phase 6 communication spine. Existing `email_templates`, `email_template_versions`, `email_template_system_bindings`, and `is_active` fields do not prove that a product message has a stable meaning, an authorized recipient, complete typed facts, an immutable publication, safe locale fallback, a verified sender, a recovery policy, or a tested end-to-end producer. A broken override could block a receipt. A permissive merge field could expose donor or care data. A provider timeout could cause a duplicate send. A visually polished editor could still let a tenant alter official truth.

Later phases compound the risk. Receipts, recurring-payment recovery, statements, reminders, workflows, support notices, and staff alerts all need governed messages. If each phase creates its own template resolver, notification queue, sender rules, locale logic, or communication history, the product becomes brittle and impossible to audit.

Phase 17 therefore has to make one complete platform seam before high-volume dependent phases ship: broad tenant control over presentation, paired with a small nondelegable contract that owns truth, safety, identity, and execution boundaries.

## Solution

Build one governed System Messages platform with six cooperating layers:

1. **A code-owned catalog and contract registry.** Every product-originated message has one stable meaning, owner, audience, channel plan, typed fact schema, safety envelope, and lifecycle: `Reserved`, `Live`, or `Retired`.
2. **A tenant-controlled structured authoring system.** Authorized staff edit subject, preheader, prose, safe sections, brand, layout, locale variants, sender profiles, reply destinations, and contract-declared optional delivery steps. The server—not the browser—validates and compiles the canonical document.
3. **Immutable publication and deterministic resolution.** A complete content variant is inherited or copied, reviewed proportionally, published atomically, and resolved as one whole message. Content, layout, locale policy, plan, sender, reply destination, compiler, and contract generation are all pinned before delivery.
4. **One Phase 6 communication seam.** A producing domain submits one complete, bounded plan occurrence. Inside one Phase 6 transaction, the compiler privately derives and records every recipient-specific, semantically idempotent child intent before releasing any of them. Phase 6 re-proves recipient, consent, contactability, source fence, and—only for external delivery—provider readiness; records local or provider delivery/outcome evidence as applicable; and remains the only communication history.
5. **Resend-only tenant transport.** Each tenant connects its own Resend account, transactional domain, sending-scoped key, and signed webhook. There is no shared Asym fallback for tenant-branded system mail. Sender and reply identities are bounded, versioned, tested, and frozen per prepared message.
6. **Truthful operations and recovery.** A durable body-free history, optional short-lived support-safe sent copy, one grouped repair surface, signed provider evidence, and proof-gated resume make failures visible without blind replay or a second incident/workflow product.

## User Stories

1. As a tenant administrator, I want one System Messages area, so that I can understand every governed message my organization may send.
2. As a tenant administrator, I want to search and filter the catalog by purpose, audience, channel, status, site, and locale, so that I can find the exact message I need quickly.
3. As a tenant administrator, I want each catalog entry to explain why it exists, who receives it, and which parts are protected, so that I can make changes confidently.
4. As a tenant administrator, I want inherited safe defaults to work without setup, so that ordinary messages are not blocked by unnecessary configuration.
5. As a content editor, I want to copy an inherited message only when I choose to customize it, so that platform improvements never overwrite my work.
6. As a content editor, I want broad control over ordinary wording, tone, subject, preheader, sections, and presentation, so that messages sound like our organization.
7. As a content editor, I want protected truth to be visibly locked and plainly explained, so that I do not accidentally change legal, payment, security, identity, or authorization meaning.
8. As a content editor, I want an approved variable picker instead of arbitrary record access, so that I can personalize messages without exposing private data.
9. As a content editor, I want optional facts and contract-owned presentation cases to preview truthfully, so that missing data never produces broken or misleading copy.
10. As a content editor, I want bounded repeatable sections for approved line items, so that receipts and other structured messages remain readable without a general scripting language.
11. As a content editor, I want every preview to use stored synthetic data, so that real donor, missionary, staff, care, payment, and credential data never enters the editor.
12. As a content editor, I want typical, longest-value, missing-optional, images-blocked, narrow-screen, long-translation, and RTL previews, so that I can see realistic failures before publishing.
13. As a content editor, I want HTML and plain-text previews generated by the same server compiler used in production, so that preview success means something.
14. As a content editor using a keyboard or screen reader, I want all authoring, reordering, validation, and publishing actions available without drag-and-drop, so that I can complete the work independently.
15. As a content editor, I want autosave with clear revision conflict handling, so that interrupted work is preserved without silently overwriting a colleague.
16. As a content editor, I want a meaningful before-and-after diff, so that I can review wording, structure, protected meaning, locale, and dependency changes together.
17. As a content editor, I want an impact summary before publication, so that I know which sites, locales, contracts, and future messages will change.
18. As an authorized ordinary editor, I want safe copy changes to self-publish, so that routine work is not buried in approval bureaucracy.
19. As an independent reviewer, I want one focused review surface for protected changes, so that I can inspect exact risk, synthetic output, and affected scopes without seeing donor data.
20. As a tenant administrator, I want to require independent review more broadly for my organization, so that local governance may be stricter without weakening platform safeguards.
21. As an editor, I want rejected changes returned with precise findings, so that I know exactly what to fix.
22. As an editor, I want to restore a prior publication as a new draft, so that history remains immutable and rollback remains explainable.
23. As a tenant administrator, I want publication history with author, reviewer, evidence, and effective version, so that every change is attributable.
24. As a site manager, I want eligible site-specific message variants, so that local wording and branding can differ without changing tenant or legal identity.
25. As a locale manager, I want to activate any canonical human locale after a readiness impact check, so that language choice is flexible and failures remain visible.
26. As a locale manager, I want deterministic locale fallback with an understandable trace, so that I can explain exactly why a recipient received a particular language.
27. As a locale manager, I want blocked required messages identified before activation, so that activating a locale never silently breaks receipts or security mail.
28. As a tenant administrator, I want one inherited Brand Kit with complete version history, so that colors, type, logos, and accessibility evidence remain consistent.
29. As a designer, I want broad visual freedom inside a small set of earned layout roles, so that messages feel custom without becoming unsafe raw HTML.
30. As a designer, I want responsive, dark-mode, high-contrast, zoom, and images-blocked validation, so that recipient output remains understandable across common clients.
31. As an editor, I want reusable Saved Sections that copy into my draft, so that reuse is fast without hidden live dependencies.
32. As a tenant administrator, I want required delivery steps visibly locked and explained, so that I understand what the product must send.
33. As a tenant administrator, I want to enable or remove only contract-approved optional delivery steps, so that I have useful control without building arbitrary workflows.
34. As a tenant administrator, I want each Delivery Plan to show recipient, channel, timing, condition, and fallback in plain language, so that I can understand the real effect before publishing.
35. As a staff member, I want one notification center with unread, read, and archived presentation state separate from source completion, so that inbox actions never falsify business truth.
36. As a staff member, I want grouped attention instead of one notification per failed recipient, so that important operational work is usable at scale.
37. As a missionary, I want only explicitly authorized contextual notifications about my assigned supporters, so that I receive useful information without seeing private donor data.
38. As a donor, I want only explicitly authorized contextual notices in my portal, so that I can act without being exposed to internal staff information.
39. As a tenant administrator, I want future SMS compliance facts represented honestly while SMS remains unavailable, so that no one mistakes reserved governance for a working transport.
40. As a tenant email administrator, I want a guided Resend setup with one clear next action, so that I can connect my account without learning provider internals.
41. As a tenant email administrator, I want to paste a sending-scoped API key once and see only a safe hint afterward, so that setup is simple and secrets remain protected.
42. As a tenant email administrator, I want exact domain, key-scope, canary, webhook, tracking, and DNS evidence, so that Ready means the connection was actually proved.
43. As a tenant email administrator, I want truthful degraded states with age, impact, owner, and repair action, so that a broken connection is diagnosable.
44. As a tenant administrator, I want one required Default Sender and a bounded set of same-domain sender profiles, so that messages have flexible but trustworthy From identities.
45. As a tenant administrator, I want a preview of which contracts use each sender profile before changing it, so that sender changes do not surprise recipients.
46. As a tenant administrator, I want a default human reply mailbox plus earned purpose-specific destinations, so that replies reach monitored people without arbitrary dynamic routing.
47. As a mailbox owner, I want access confirmation and monitoring responsibility recorded separately, so that a syntactically valid address is not mistaken for an attended inbox.
48. As a tenant administrator, I want explicit no-reply posture where a contract permits it, so that recipients are not misled by an unmonitored address.
49. As a donor, I want the displayed sender, reply expectation, organization, and site identity to be clear and consistent, so that I can trust the message.
50. As a recipient of a protected action, I want an inert explanation before deliberate confirmation, so that scanners and accidental opens cannot change my account or payment state.
51. As a recipient of a protected action, I want expired, replaced, used, revoked, and wrong-account states explained safely, so that I know the next legitimate action without account leakage.
52. As a donor receiving a receipt or payment notice, I want the message to state only source-owned facts, so that email never invents tax, payment, settlement, or authorization truth.
53. As a recipient, I want complete plain text, descriptive links, visible identity, and usable output with images blocked, so that the message remains accessible in my client.
54. As a support agent, I want durable body-free communication evidence, so that I can verify what happened without turning history into a permanent PII archive.
55. As an authorized support agent, I want an eligible recent sent copy for a short, explicit period, so that I can resolve current questions without retaining content forever.
56. As an authorized support agent, I want recent-copy access to re-prove the exact recipient relationship and be audited, so that source-record access alone cannot reveal personalized mail.
57. As a support agent, I want truthful unavailable-copy states, so that expiry, policy, privacy removal, and permission denial are not confused with send failure.
58. As a tenant administrator, I want to choose Off, 7 days, or 30 days for eligible support-safe sent copies, so that my organization controls this limited retention within contract ceilings.
59. As a privacy administrator, I want deletion, restriction, reclassification, offboarding, and restore ledgers applied before content becomes readable, so that removed content cannot reappear from backups.
60. As an operations user, I want one repair case per deterministic root cause, so that I see affected counts, impact, owner, evidence health, and one permanent next action.
61. As an operations user, I want repair preflight to separate eligible, completed, expired, blocked, and indeterminate work, so that resume cannot resend successful or unknown messages.
62. As an operations user, I want a provider timeout shown as **Delivery outcome unknown**, so that nobody guesses it failed or blindly sends a replacement.
63. As an operations user, I want accepted, rejected, delayed, delivered, bounced, complained, suppressed, and evidence-health facts shown separately, so that transport evidence is not mistaken for business truth.
64. As a tenant email administrator, I want repair notifications only on meaningful state changes, so that I am informed without alert storms.
65. As a service-only platform operator, I want platform-scoped operational email isolated from every tenant record, credential, publication, recipient, batch, and repair surface, so that platform operations cannot impersonate a tenant.
66. As a security administrator, I want secrets envelope-encrypted with exact owner and revision binding, so that copying ciphertext across tenants, environments, connections, or revisions cannot decrypt it.
67. As a security administrator, I want compromise, rotation, revocation, purge, backup-expiry, and cryptographic-erasure states recorded truthfully, so that deletion claims match actual evidence.
68. As a compliance owner, I want every Live contract to declare purpose, classification, consent behavior, protected core, retention, sender, reply, and failure posture, so that uncataloged behavior cannot ship.
69. As a compliance owner, I want required service messages structurally separated from marketing, so that tenant wording cannot silently change consent or unsubscribe obligations.
70. As a developer adding a producer, I want one typed catalog contract and one Phase 6 submission seam, so that I do not invent another template resolver, queue, or history.
71. As a developer adding recipient fan-out, I want one permanent plan-occurrence slot plus independent member slots released all-before-any, so that retries deduplicate, zero-member results are provable, and recipients remain independent after release.
72. As a developer changing a producer, I want changed input under an existing slot to fail hard, so that deployments cannot silently duplicate or mutate an earlier communication.
73. As a developer using Resend batches, I want batches to be a transport-only optimization over independent recipient intents, so that one malformed or failed member never rewrites the others.
74. As a developer handling a provider timeout, I want a closed bounded same-key policy and reconcile-only causes, so that retry behavior is deterministic and safe.
75. As a QA engineer, I want executable proof packs for every Live key and generation, so that source, recipient, facts, rendering, sender, webhook, retention, recovery, and rollback are tested together.
76. As a QA engineer, I want malformed, duplicate, reordered, partial, conflicting, and unknown provider fixtures, so that the system fails closed rather than relying on ideal responses.
77. As a QA engineer, I want cross-tenant and tenant/platform crossover tests at database, service, queue, cache, batch, webhook, history, and UI seams, so that isolation is structural.
78. As an operator, I want dashboards for catalog generation, preparation, queue age, provider outcomes, webhook health, repair cases, and purge obligations, so that failures are visible before users report them.
79. As an operator, I want scope-owner-fair capacity and protected latency-critical lanes, so that one noisy tenant or platform workload cannot starve receipts or security mail.
80. As an operator, I want kill controls and reversible cutover by producer, contract, connection, and generation, so that incidents can be contained without discarding evidence.
81. As a migration owner, I want every legacy template, binding, direct sender, notification artifact, and provider record mapped to a specific disposition, so that dual authority does not linger.
82. As a migration owner, I want shadow comparison without provider I/O and one-writer canaries, so that cutover proves equivalence without duplicate recipient mail.
83. As a tenant administrator, I want native export and re-import of portable source, versions, fixtures, brand, layout, locales, and saved sections, so that I am not locked into hidden internal state.
84. As a tenant administrator importing foreign designs, I want compatible, changed, needs-choice, and cannot-use results, so that conversion loss is honest and nothing unsafe auto-publishes.
85. As a destination tenant accepting a transfer, I want to approve an exact package digest and receive independent drafts and assets, so that no sender, permission, history, recipient, or live authority crosses tenants.
86. As an administrator exporting records, I want secrets, provider payloads, recipient PII, and other tenants' data excluded, so that portability does not become data leakage.
87. As an accessibility owner, I want the authoring tool, review, setup, repair, notification center, and recipient artifacts tested to WCAG 2.2 AA, so that accessibility is part of done.
88. As a product owner for a later phase, I want to add a stable message key and typed producer proof without changing the platform spine, so that statements, reminders, and workflows build on one system.
89. As a founder, I want the phase to remain groomed-not-dispatched until an explicit build decision, so that a complete plan is not mistaken for implementation authorization.

## Product Outcomes

At Phase 17 acceptance:

- a tenant admin can understand what the platform sends, why, to whom, and from which verified identity;
- ordinary staff can safely customize an eligible message without seeing technical schema or risking official truth;
- protected messages remain usable and brandable without exposing authority-bearing fields;
- every production send is attributable to an exact contract, publication, plan, locale path, sender, reply destination, recipient, and provider outcome;
- required messages keep a known safe publication active through authoring outages and ordinary draft mistakes;
- unsafe or indeterminate work stops in one explainable repair path rather than disappearing or duplicating;
- staff in-product notifications use the same communication truth instead of a second feed ledger;
- SMS facts are future-ready while SMS transport is structurally impossible;
- the initial real message producers are migrated behind this seam and the repository prevents uncataloged sends; and
- dependent phases can add a typed producer contract without inventing another editor, queue, provider abstraction, or history.

## Goals

1. Give tenants the greatest safe control over wording, tone, locale, brand, layout, sender, replies, and explicitly optional delivery behavior.
2. Make official, security, payment, permission, privacy, recipient, and business truth impossible to change in presentation code or tenant content.
3. Make one exact publication and one exact prepared message reproducible and auditable across retries, batches, webhooks, migrations, and support investigation.
4. Keep ordinary staff workflows simple: inherit by default, customize only when needed, preview with fake data, publish with a clear impact explanation, and see one next action when something breaks.
5. Support current email and in-product needs completely, while reserving later SMS, document, statement, campaign, workflow, and inbound-reply seams honestly.
6. Meet WCAG 2.2 AA and authoring-tool accessibility obligations across editing, review, delivery setup, notification center, repair, and recipient output.
7. Ship with a complete catalog census, one real Live tracer, explicit migration ownership, measurable reliability, and rollback evidence.

## Implementation Decisions

| Decision | Ratified contract                                  | Implementation consequence                                                                                                                                                                                                                        |
| -------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1       | Tenant sovereignty inside a platform safety kernel | Contracts own meaning and safety; tenants own bounded presentation controls.                                                                                                                                                                      |
| D2       | Whole-message inheritance and copy-on-customize    | No subject/body/fragment merging; parent changes never overwrite a custom publication.                                                                                                                                                            |
| D3       | Two bounded fallback postures                      | Exact site+locale first; then one versioned language-first or site-wording-first algorithm.                                                                                                                                                       |
| D4       | One Asym-structured visual document                | Canonical JSON plus deterministic server HTML/text; immutable publication and migrations.                                                                                                                                                         |
| D5       | Contract-owned adaptive content                    | Typed facts/cases/collections only; recipient-grained truth; Resend batching is transport optimization.                                                                                                                                           |
| D6       | Producer-owned protected actions                   | Email contains a scanner-resistant Asym handoff; GET/HEAD never completes a consequential action.                                                                                                                                                 |
| D7       | Contract-bounded Delivery Plans                    | A fixed set of required/optional slots; no general workflow runtime.                                                                                                                                                                              |
| D8       | One proportional in-product model                  | Full staff center now; only explicit donor/missionary contextual notices now; one Phase 6 truth.                                                                                                                                                  |
| D9       | Compliance-ready, transport-dark SMS               | Persist only future governance evidence; every executable SMS path is absent or rejected.                                                                                                                                                         |
| D10      | One tenant-owned Resend account                    | No shared tenant-message fallback; proof-gated connection and webhook readiness.                                                                                                                                                                  |
| D11      | Proportional independent review                    | Standard self-publish; protected changes require a different authorized human.                                                                                                                                                                    |
| D12      | Tenant-open locale activation                      | Any canonical human locale may be activated after a PII-free impact review even with partial coverage; every required Live contract resolves to an exact publication, compatible fallback, or fail-closed blocker with truthful readiness counts. |
| D13      | Brand Kit plus bounded Layout Roles                | Broad visual freedom through complete versioned dependencies, not raw layout code.                                                                                                                                                                |
| D14      | Body-free history plus optional recent copy        | Durable evidence is minimized; eligible recent content is encrypted and expires.                                                                                                                                                                  |
| D15      | Contract-owned whole-message recovery              | Fallback occurs only before channel materialization—external preparation or the local in-product `available` event/projection; provider ambiguity reconciles, never rerenders blindly.                                                            |
| D16      | Complete executable catalog                        | Stable keys have exactly Reserved/Live/Retired; activation is proof-gated and generation-safe.                                                                                                                                                    |
| D17      | Contract-owned reply purpose                       | One default human mailbox plus earned destinations; outbound only; exact Reply-To is frozen.                                                                                                                                                      |
| D18      | Editable by default, minimum truth core            | Protect the smallest evidenced unit; everything else remains safely tenant-editable.                                                                                                                                                              |
| D19      | Full tenant portability                            | Signed native package, honest finite foreign conversion, bilateral destination-owned copy.                                                                                                                                                        |
| D20      | One default plus bounded sender profiles           | Sparse fixed resolver, same verified domain, exact revision pin, no arbitrary From.                                                                                                                                                               |

## Dependencies and Ownership

### Platform hard dependencies

Phase 17 foundation work may begin once the Phase 2 tenant/site/locale context,
Phase 3 consent/privacy governance, and Phase 6 communication spine exist. Full
Phase 17 shipment and acceptance also require Phase 7 source receipt
eligibility/facts/issuance and the exact current Phase 18 artifact for the
mandatory `giving_receipt_issued_v1` Target Live tracer. Phase 18 is a
key-specific integration dependency for that tracer, not a prerequisite for
building Phase 17's foundation; the Phase 18 build in turn consumes the Phase
17 delivery contract. The phase-level foundation hard dependencies remain 2,
3, 6, and 7. The other rows below are consumed ownership contracts:
a particular catalog key or capability cannot become **Live** until its owning
producer/source phase and required evidence exist, but an unfinished producer
phase does not block construction of the Phase 17 foundation or unrelated
Reserved authoring work.

### Consumed ownership contracts by applicable Live key

| Owner    | Phase 17 consumes                                                                                             | Phase 17 must not take over                                 |
| -------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Phase 1  | source-of-truth ownership and provider-as-executor rule                                                       | provider IDs as product identity                            |
| Phase 2  | tenant, validated site, locale context, branding context, currency and legal entity                           | broad site/CMS localization or arbitrary locale graphs      |
| Phase 3  | consent, suppression, projection, retention, export, purpose governance                                       | contact permission or compliance truth                      |
| Phase 4  | Party/account identity, invitation/claim authority, Supabase action issuance                                  | authentication tokens, claim completion, access authority   |
| Phase 5  | tenant public-domain context and customer-account bootstrap boundary                                          | donor identity or email ownership                           |
| Phase 6  | recipient-specific intent, dispatch, provider evidence, communication event/history                           | a second send/history/notification ledger                   |
| Phase 7  | receipt/statement eligibility, legal donor, tax facts, source issuance and correction/void/replacement effect | generated-document definition, artifact, access or delivery |
| Phase 8  | operations worklists and health conventions                                                                   | a generic incident platform                                 |
| Phase 9  | Party/relationship projections and role-safe views                                                            | identity inference or supporter ownership                   |
| Phase 10 | restricted-person firewall, anonymity and privacy precedence                                                  | exception-by-template                                       |
| Phase 12 | capability atoms, active assignment, delegated governance                                                     | local roles or job-title authorization                      |
| Phase 13 | contribution/payment/designation/finality truth                                                               | money calculations or eligibility                           |
| Phase 14 | donor-credit/recognition recipients and facts                                                                 | recognition inference                                       |
| Phase 15 | governed outbox-only batch entry                                                                              | another offline-money or send path                          |
| Phase 16 | recurring/fixed-pledge events, facts, actions and exact message obligations                                   | schedule/payment/fulfillment truth                          |

### Forward seams

- Phase 18 owns every generated-document definition, publication, request,
  exact artifact, current head, artifact access and document-records evidence;
  Phase 17 renders the delivery wrapper only.
- Phase 19 owns statement populations, runs, item selection, grouping, cutoffs,
  and run recovery; each item calls Phase 18, and Phase 17 renders/delivers each
  governed message.
- Phase 24 owns broad site/CMS/shell locale and currency management; Phase 17 owns message-locale activation and readiness only.
- Phases 25 and 28 own complete donor and missionary notification-center information architecture, reusing the Phase 6/17 records created here.
- Phase 26 owns inbound email, threading, assignments, reply content, retention, and send-reply operations. Phase 17 only sets outbound Reply-To.
- Phase 32 owns campaigns and newsletters. It may reuse safe editor/layout primitives without joining the system-message catalog.
- Phase 34 owns general workflows, enrollment, waits, branches, tasks, record mutations, and occurrence timing. It may invoke a pre-existing Live system-message action.
- Phase 35 may invoke Live contracts for contribution-triggered engagement but may not mint duplicate meanings or bypass semantic idempotency.

## Repo Anchors — REAL vs FORWARD

### REAL today

- `docs/guides/features/email-studio.md` and `packages/api/src/email/template-store.ts` describe the current React Email/Tiptap editor, template rows, version rows, compiled HTML/text, synthetic preview, and legacy Unlayer input.
- `docs/guides/features/resend-integration.md`, `packages/api/src/email/connect.ts`, `settings-store.ts`, `test-send.ts`, `packages/email/resend.ts`, and `packages/api/src/email/webhooks/resend.ts` provide a tenant Resend foundation, encrypted key path, test send, send log, and webhook reducer.
- `supabase/schema.sql` contains `tenant_email_settings`, `email_send_logs`, `email_events`, `email_templates`, `email_template_versions`, suppressions, inbound rows, and a legacy `notification_queue`.
- `supabase/migrations/20260611151000_contribution_correction_notifications.sql` adds `email_template_system_bindings`; it is a migration input, not a catalog or activation authority.
- `packages/api/src/giving/receipts.ts` has successful and replacement receipt send paths with useful idempotency behavior but hard-coded content and no complete Phase 6/17 path.
- `packages/email/contribution-correction-tags.ts` and `packages/api/src/admin/contribution-operations/notifications/**` provide current correction families, typed tags, producer mappings, send behavior, and history inputs.
- `packages/api/src/admin/contribution-operations/approval-notifications.ts` and `approval-notification-email.ts` provide durable approval-notification rows, recipient planning, in-product/email channel choices, and direct email content.

### REAL constraints that must be treated as migration hazards

- Current template `category`, `is_active`, family/variant binding, or provider template does not prove a stable product-message lifecycle.
- Current caller-selected `transactional | marketing` classification is too coarse and too easy to misuse; it becomes a derived adapter output from the producer contract.
- Current request-level From and Reply-To inputs must not survive the one-resolver cutover.
- Current global-environment or permissive Resend key paths must not become tenant fallback.
- Current raw provider payloads, click URLs, IP addresses, user agents, and personalized subject storage exceed the D14 durable-history minimum and require a retention/minimization migration.
- Current `email_templates` and `email_template_versions` are RLS-disabled,
  service-only migration inputs with anonymous/authenticated access revoked;
  they are not a safe tenant-facing authorization model. Tenant-facing
  configuration needs same-tenant relational constraints, server authorization,
  and RLS wherever client roles can reach it.
- The legacy `notification_queue` has conflicting checked-in posture:
  `supabase/schema.sql` says RLS disabled, while later migration history enables
  staff-scoped RLS and authenticated grants. No production worker was located.
  The snapshot/migration disagreement and possible Data-API reachability are
  migration hazards, not permission to reuse it. Implementation must first
  verify deployed state. It must not be revived as Phase 17, Phase 6, or
  later-workflow transport; classify/migrate needed data and retire it, or prove
  one bounded non-transport owner.

### FORWARD contracts

The code-owned catalog, activation generations, canonical structured document, immutable publications, complete locale variants, Brand Kit/Layout Role versions, bounded Delivery Plans, one in-product model, transport-dark SMS evidence, proof-gated Resend connection, Sender Profiles, reply-purpose destinations, recent sent copy, preparation boundary, whole-message recovery, repair cases, and signed portability package do not exist yet. Every implementation ticket must label them FORWARD and cite the real primitive it extends or replaces.

## Canonical Language and Truth Boundaries

The Phase 17 block in [CONTEXT.md](../../../CONTEXT.md) is the durable thin
glossary. The definitions below are its expanded implementation meanings. They
must be changed together; divergence is a specification defect and blocks
dispatch.

Use these product terms exactly:

- **System message contract:** code-owned definition of one product meaning, owner, audience, facts, protected truth, channels, policy, and failure behavior.
- **Catalog entry:** the stable key and lifecycle projection of one contract.
- **Content variant:** one complete tenant/site/locale/channel message document, inherited or customized.
- **Draft:** mutable, revisioned work that cannot be sent.
- **Commit:** immutable candidate source and compiled evidence awaiting publication or review.
- **Publication:** immutable approved content plus exact dependency pins eligible for future resolution.
- **Delivery Plan:** the complete versioned selection among a contract's fixed
  required and optional delivery-step choices; tenant scope is published by
  authorized tenant staff, while platform scope is the immutable Asym-owned
  fixed plan/version declared by the exact meaning-specific platform profile.
- **Delivery Step:** one contract-declared recipient-role/channel/timing slot.
- **Prepared message:** recipient-specific immutable delivery identity after truth, content, locale, sender, reply, and action have been pinned.
- **Brand Kit:** versioned tenant visual tokens.
- **Layout Role:** platform-owned structural purpose; a **Role Layout** is the tenant's complete layout for that role.
- **Sender Profile:** one versioned same-domain From identity for a bounded Sender Purpose.
- **Human reply purpose:** platform-owned reason that selects one confirmed Reply-To destination.
- **Recent sent copy:** optional tenant-only encrypted, expiring, support-safe personalized rendering; never communication truth or official artifact. Platform scope has no readable-copy branch in this generation.
- **Needs attention case:** grouped repair projection for one deterministic failure signature and responsible owner.

Never collapse these independent truths:

- contract lifecycle, publication state, tenant readiness, plan eligibility, and individual delivery outcome;
- recipient eligibility, consent, preference, suppression, and contactability;
- source business status, communication availability, recipient engagement, and provider delivery state;
- tenant connection readiness, sender-profile readiness, reply-destination confirmation, and message compatibility;
- official artifact truth, email wrapper content, and recent sent copy;
- provider acceptance, delivery, open/click telemetry, human reading, and business completion; or
- configured absence, configured-but-broken, quarantined, retired, and unavailable transport.

## Complete System-Message Catalog

### Catalog authority and lifecycle

The catalog is a typed code registry compiled into an immutable activation manifest. It is the only authority for stable message meaning. Each key has exactly one platform lifecycle:

- `Reserved`: stable meaning and owner are known, but no tenant content, binding, preview, test, readiness, or send path exists. It may appear quietly under **Coming later**.
- `Live`: one end-to-end producer, recipient, fact, publication, plan, dispatch, history, security, accessibility, load, and operations proof passed for the exact activation generation.
- `Retired`: new intent is rejected. Existing history remains readable and an exact policy-valid prepared message may finish only under D15.

`Draft`, `Published`, `Ready`, `Enabled`, `Quarantined`, `Sent`, and percentages are not lifecycle values. Keys never change meaning; material semantic change creates a successor key. The registry generates database read projections, docs, test fixtures, and CI closure checks. A manifest-generation compare-and-swap prevents code/DB skew and supports current plus immediately prior Live generation during deployment.

### Supported scope and channel boundary

The catalog governs every platform-generated **email** and **in-product** product
message, and later governs SMS only after the separately authorized D9 launch
gate. Each contract declares one closed `scope_kind`:

- `tenant` — one exact tenant owns configuration, recipient context, connection,
  publication resolution, permissions, and history; or
- `platform` — Asym owns a fixed, non-tenant-editable contract for one
  contract-declared verified platform recipient-authority kind, with no
  donor/tenant recipient or tenant-data access. Platform v1 admits only
  `eve_platform_owner`; every unknown, absent, or caller-selected kind rejects.

The active Eve #436 change may produce platform-scoped email only through the
Phase 17 catalog/compiler and Phase 6 delivery spine. Eve continues to own the safe source
event, severity/channel eligibility, platform-owner recipient authority,
dedupe/pause/expiry decision, and Discord operational delivery. Discord is not a
Phase 17 tenant channel and does not become Phase 6 email history. This manifest
generation deliberately contains **zero Eve platform-email keys**, so Eve email
is non-dispatchable. #436 must first ratify each stable source occurrence and
fence; a later manifest generation must then add one exact Reserved key per
meaning, a named `scope_kind: platform` profile, and a key-specific platform
proof pack. Only a key that subsequently becomes Live may accept an Eve Phase 6
intent. A generic `eve_alert`, runtime `event_type`, or uncataloged fallback is
forbidden.

Asym customer-account bootstrap/security mail remains a separate forward
platform boundary, not an authorized v1 recipient branch. It cannot create an
intent in this manifest generation. A later change must first define its own
verified app-account recipient authority, producer occurrence/fence, mutually
exclusive union branch, stable keys, and complete proof packs; no Eve authority,
tenant identity, or arbitrary address may stand in for that missing contract.

This is a hard D10 launch prerequisite, not optional future polish. Already
authorized tenant administrators may use the Resend setup flow, but the product
MUST NOT claim that universal tenant-owned delivery is operationally launchable
for new tenants while initial tenant-owner invitation and necessary Asym account
recovery lack that separate ratified platform contract. The future source owner
must close the recipient/action authority and stable-key design before the
universal BYOK rollout can dispatch; Phase 17 must not invent a generic security
key, borrow tenant delivery, or provision speculative platform transport to
hide the gap.

### Target launch catalog

The table is the required Phase 17 acceptance disposition. “Target Live” means the build may mark it `Live` only after its complete proof bundle passes; until then it remains `Reserved` and cannot send through the new catalog.
All 18 Target Live entries below explicitly compile as `scope_kind: tenant`
through their named manifest profile. Scope is required generated data, never an
inference from a tenant publication or recipient. A future platform entry must
use a separately named `scope_kind: platform` profile and pass the complete
platform proof gate before activation.

| Stable key                                        | Target                                    | Owner and meaning                                                                                                      | Audience / steps                                                             | Important contract pins                                                                                                                                                                                        |
| ------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `giving_receipt_issued_v1`                        | Target Live tracer                        | Phase 7 source issuance is current and the exact current Phase 18 artifact is ready                                    | donor; required email where legally/operationally eligible                   | official receipt block protected; exact artifact action; fallback policy fixed; Giving sender purpose; Replies supported for giving help; no open/click truth                                                  |
| `giving_receipt_replaced_v1`                      | Target Live                               | Phase 7 authorizes successor facts/issuance and Phase 18 promotes the replacement artifact                             | legal donor; required email where eligible                                   | replacement identity and supersession protected; never mutates prior history                                                                                                                                   |
| `contribution_refund_failed_v1`                   | Target Live                               | contribution operation ended with failed refund                                                                        | proven donor/contact where notice is required by producer policy             | no raw provider decline; support action; correction owner facts                                                                                                                                                |
| `contribution_refund_completed_v1`                | Target Live                               | refund completed when producer does not classify partial/full separately                                               | proven donor                                                                 | amount/date/finality protected                                                                                                                                                                                 |
| `contribution_partial_refund_completed_v1`        | Target Live                               | partial refund completed                                                                                               | proven donor                                                                 | original/refund/remainder truth source-owned                                                                                                                                                                   |
| `contribution_full_refund_completed_v1`           | Target Live                               | full refund completed                                                                                                  | proven donor                                                                 | finality and receipt impact protected                                                                                                                                                                          |
| `contribution_amount_corrected_v1`                | Target Live                               | posted contribution amount corrected                                                                                   | proven donor                                                                 | old/new amount and artifact impact protected                                                                                                                                                                   |
| `contribution_designation_changed_v1`             | Target Live                               | posted designation corrected                                                                                           | proven donor                                                                 | previous/current designation and effective truth protected                                                                                                                                                     |
| `contribution_receipt_corrected_v1`               | Target Live                               | source correction effect is current and Phase 18 replacement artifact is ready                                         | legal donor                                                                  | Phase 18 exact-current artifact action protected; Phase 7 facts never altered by template                                                                                                                      |
| `statement_current_updated_v1`                    | Reserved until Phase 18/19 artifact proof | a meaningful corrected/replacement successor is exact-current and the governing source/exposure contract admits notice | exact authorized statement recipient                                         | no Live status before source, current-artifact, recipient, exposure, and safety proof; never fabricates correction wording                                                                                     |
| `contribution_payment_state_corrected_v1`         | Target Live                               | payment state corrected                                                                                                | proven donor                                                                 | provider-confirmed old/new state; receipt/statement implications protected                                                                                                                                     |
| `contribution_donor_relinked_v1`                  | Target Live                               | contribution donor ownership link corrected                                                                            | permitted affected contact                                                   | privacy-safe explanation only; Party identity not inferred by template                                                                                                                                         |
| `contribution_approval_requested_v1`              | Target Live                               | correction approval requires staff attention                                                                           | exact eligible approver role; required in-product, optional email if enabled | source task owns completion; notification engagement never approves                                                                                                                                            |
| `contribution_approval_reminder_v1`               | Target Live                               | an existing approval remains due at producer-owned reminder point                                                      | exact eligible approver; in-product, optional email                          | fixed producer timing; no tenant timer or duplicate task                                                                                                                                                       |
| `contribution_approval_escalated_v1`              | Target Live                               | producer marks approval overdue/escalated                                                                              | exact authorized escalation role; in-product, optional email                 | urgency source-owned; no automatic approval                                                                                                                                                                    |
| `contribution_approval_outcome_v1`                | Target Live                               | approval requester receives final decision                                                                             | exact requester; in-product, optional email                                  | decision truth and destination protected                                                                                                                                                                       |
| `system_message_publication_review_requested_v1`  | Target Live                               | a protected immutable candidate needs independent review                                                               | exact Phase 12 reviewer projection; required in-product                      | candidate action opens authenticated review; no approval by email click                                                                                                                                        |
| `system_message_publication_changes_requested_v1` | Target Live                               | reviewer requested changes on exact candidate                                                                          | author/editors; required in-product                                          | exact candidate and comment metadata, no content body in notification                                                                                                                                          |
| `system_message_delivery_needs_attention_v1`      | Target Live                               | D10/D15 repair condition materially changed                                                                            | tenant email admin/repair capability; required in-product                    | grouped case, one safe action, no credentials/provider payload                                                                                                                                                 |
| `recurring_recovery_started_v1`                   | Reserved                                  | Phase 16 card recovery episode began                                                                                   | Party-safe donor recipient                                                   | exact Phase 16 facts; email eligibility is producer-owned                                                                                                                                                      |
| `recurring_action_required_v1`                    | Reserved                                  | Phase 16 requires donor payment action                                                                                 | donor                                                                        | protected recovery action; no raw decline                                                                                                                                                                      |
| `recurring_occurrence_missed_v1`                  | Reserved                                  | one recurring occurrence is terminally missed                                                                          | donor email/in-product; missionary in-product only where Phase 16 permits    | no debt/backcharge; schedule continues; no per-attempt missionary noise                                                                                                                                        |
| `recurring_payment_truth_corrected_v1`            | Reserved                                  | provider-confirmed recurring payment truth changed                                                                     | affected donor                                                               | old/new truth, receipt/statement impact, correction semantics                                                                                                                                                  |
| `recurring_ach_initiated_v1`                      | Reserved                                  | ACH occurrence initiated and is processing                                                                             | donor                                                                        | processing is not received; official receipt waits for success                                                                                                                                                 |
| `recurring_upcoming_charge_v1`                    | Reserved                                  | required upcoming semiannual/annual charge notice                                                                      | donor                                                                        | amount/date/merchant/manage/cancel facts                                                                                                                                                                       |
| `recurring_schedule_changed_v1`                   | Reserved                                  | recurring arrangement changed successfully                                                                             | donor                                                                        | next dates, effective behavior, in-flight non-effect, provider-sync truth                                                                                                                                      |
| `fixed_pledge_upcoming_v1`                        | Reserved                                  | enrolled fixed-pledge expectation is upcoming                                                                          | commitment Party                                                             | no debt or cash claim; optional/gentle profile                                                                                                                                                                 |
| `fixed_pledge_source_aware_followup_v1`           | Reserved                                  | current records show no applied gift after enrolled expectation                                                        | commitment Party                                                             | processing/matching uncertainty and stop-purpose action                                                                                                                                                        |
| `identity_account_claim_invitation_v1`            | Reserved                                  | Phase 4 issued a legacy account-claim invitation                                                                       | exact invited contact                                                        | D6 scanner-resistant handoff; invitation owner controls expiry/revocation                                                                                                                                      |
| `identity_magic_link_v1`                          | Reserved                                  | Supabase magic-link sign-in requested in a tenant context                                                              | exact auth recipient                                                         | ephemeral D6 handoff; Supabase hook deadline; no fallback across tenant                                                                                                                                        |
| `identity_email_otp_v1`                           | Reserved                                  | Supabase email OTP requested where adopted                                                                             | exact auth recipient                                                         | code/action secrecy; rate and expiry producer-owned                                                                                                                                                            |
| `identity_password_recovery_v1`                   | Reserved                                  | Supabase password recovery requested                                                                                   | exact auth recipient                                                         | scanner-resistant landing and fresh proof                                                                                                                                                                      |
| `identity_email_change_v1`                        | Reserved                                  | Supabase email-change confirmation requested                                                                           | source-defined old/new recipients                                            | recipient cardinality and action mapping must be proved before Live                                                                                                                                            |
| `document_artifact_ready_v1`                      | Reserved                                  | Phase 18 immutable artifact is ready                                                                                   | artifact owner recipient                                                     | protected authenticated download only; no artifact body/PDF attachment; Phase 21 D12 may consume only after Reserved→Live proof, a current source-owned notice occurrence, and current recipient authorization |
| `statement_current_available_v1`                  | Reserved                                  | Phase 19 admits the one ordinary frozen current-statement delivery occurrence                                          | exact authorized statement recipient                                         | one ordinary donor notice only; portal/self-print/package readiness and run completion do not mint another occurrence                                                                                          |
| `statement_current_withdrawn_v1`                  | Reserved                                  | source/purpose/jurisdiction contract permits or requires notice that no current successor is available                 | exact authorized statement recipient                                         | truthful consequence and help route only; invalid bytes are never linked or presented                                                                                                                          |
| `statement_additional_copy_ready_v1`              | Reserved                                  | Phase 19 D12 admits one fresh exact-current copy fulfillment after current authority is re-proved                      | exact authorized request recipient                                           | new occurrence identity; never replays ready/correction/replacement/withdrawal meaning and never rerenders                                                                                                     |
| `statement_delivery_attention_v1`                 | Reserved                                  | a deterministic grouped statement-delivery condition materially needs staff action                                     | exact tenant staff owner/capability; in-product, optional bounded email      | no per-recipient noise, donor-failure message, provider jargon, arbitrary retry, or claim that the statement failed as a legal document                                                                        |

### Inventory-only categories with keys deferred

Do not mint stable keys until the producing phase fixes meaning, owner, recipient, and source fence: DAF/tribute/matching acknowledgments beyond Phase 14's exact future occurrence; generic assignment/mention/deadline notices beyond proven current producers; support conversation notices; event/ticket/fundraiser messages; public-content moderation/publish notices; Phase 32 campaigns; Phase 34 workflow-specific messages; Phase 35 stewardship journeys; and Eve/#436 platform-operator email event meanings not yet enumerated as stable contracts. Eve email is an implementation-blocking deferral in this generation, not an allowed generic path. The inventory must cite the owning phase and blocker so absence is visible without creating phantom tenant controls.

The complete obligation census below prevents those deferred meanings from disappearing. It is an inventory, not tenant-visible configuration and not permission to invent a stable key.

| Product meaning to account for                                       | Owning source / target phase                                              | Phase 17 disposition                                                                                                          |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Account claim invitation                                             | Phase 4                                                                   | stable Reserved key above; D6 mapping required                                                                                |
| Magic link and adopted email OTP                                     | Supabase Auth / Phase 4                                                   | stable Reserved keys above; exact hook action/recipient mapping required                                                      |
| Password recovery                                                    | Supabase Auth / Phase 4                                                   | stable Reserved key above                                                                                                     |
| Email confirmation/change and reauthentication                       | Supabase Auth / Phase 4                                                   | email-change key Reserved; split/add successor only after exact current/old/new recipient semantics are proved                |
| Password/email/security change completed notice                      | Phase 4/future security owner                                             | key deferred; no producer/recipient occurrence proved                                                                         |
| Staff/donor account invitation or membership change                  | Phase 4/12                                                                | key deferred; distinguish authorization notice from marketing                                                                 |
| Donor profile/address/contact change confirmation                    | donor self-service phase                                                  | key deferred; source command and security consequence not yet fixed                                                           |
| One-time gift acknowledgement                                        | Phase 7/13                                                                | key deferred until acknowledgement versus official receipt is a distinct emitted occurrence                                   |
| Successful gift receipt                                              | Phase 7                                                                   | Target Live tracer above                                                                                                      |
| Receipt replacement, correction, void or supersession                | Phase 7                                                                   | replacement Target Live; other meanings get distinct keys only when their occurrences exist                                   |
| Refund, return, chargeback or payment-state correction               | Phase 13/contribution operations                                          | current correction keys above; missing meanings deferred rather than conflated                                                |
| ACH initiated/processing confirmation                                | Phase 13 or Phase 16 by occurrence kind                                   | recurring key Reserved; one-time key deferred to its owner                                                                    |
| ACH success/failure/return                                           | Phase 13/16 plus Phase 7                                                  | source event may issue receipt/correction; no duplicate generic success key                                                   |
| Recurring arrangement created/confirmed                              | Phase 16                                                                  | use exact producer-owned confirmation obligation; no new key until Phase 16 names it beyond schedule-change/receipt contracts |
| Recurring schedule/amount/destination/end changed                    | Phase 16                                                                  | `recurring_schedule_changed_v1` Reserved                                                                                      |
| Recurring skipped, paused, resumed or canceled                       | Phase 16                                                                  | contextual product confirmation/source projection; separate email key deferred unless Phase 16 emits stable meaning           |
| Recurring recovery started/action required/missed/corrected          | Phase 16                                                                  | exact Reserved keys above                                                                                                     |
| Upcoming recurring charge                                            | Phase 16                                                                  | exact Reserved key above; required only for its contract-declared cadences                                                    |
| Payment method updated/expiring/unusable                             | Phase 16/payment-method owner                                             | key deferred except where represented by `recurring_action_required_v1`; no raw provider event becomes meaning                |
| Fixed pledge upcoming/source-aware follow-up                         | Phase 16                                                                  | exact Reserved keys above; quiet optional profile                                                                             |
| Missionary recurring pause visibility                                | Phase 16 dashboard projection                                             | not a message; no Phase 17 key or runtime intent                                                                              |
| Missionary terminal recurring miss                                   | Phase 16 + D8                                                             | in-product step of the exact terminal occurrence contract; no per-attempt/email noise                                         |
| DAF/tribute/matching/church recognition acknowledgement              | Phase 14                                                                  | keys deferred per exact recognition occurrence and recipient owner                                                            |
| Artifact ready/download notice                                       | Phase 18                                                                  | stable Reserved key above                                                                                                     |
| Statement ready/delivery/correction/failure/void                     | Phase 19 run/item + Phase 7 facts + Phase 18 artifact + Phase 17 delivery | Reserved until every exact owner contract is proved; no phase collapses another axis                                          |
| Annual tax summary or other official document delivery               | Phase 19 run/item + Phase 18 artifact + Phase 17 delivery                 | key deferred until document class, legal recipient and exact handoff are fixed                                                |
| Contribution correction approval request/reminder/escalation/outcome | contribution operations                                                   | Target Live keys above                                                                                                        |
| Generic staff assignment or @mention                                 | owning CRM/workflow phase                                                 | key deferred until typed source/destination exists; D8 is presentation only                                                   |
| Task deadline/overdue/escalation                                     | Phase 34 or owning domain                                                 | key deferred; producer owns clock and completion                                                                              |
| Workflow form/file/reference request                                 | Phase 34                                                                  | key deferred; Phase 17 may render only a future Live contract                                                                 |
| Workflow stage/outcome notice                                        | Phase 34                                                                  | key deferred; no generic workflow event key                                                                                   |
| Support conversation assigned/replied/SLA/undelivered                | Phase 26                                                                  | system-notice keys deferred; human message body remains outside catalog                                                       |
| Event registration/ticket/team/fundraiser notice                     | future Event Hub                                                          | key deferred; benchmark outcome only                                                                                          |
| Public form submission/content review/publish/domain change          | public-content phases                                                     | key deferred; exact producer/audience required                                                                                |
| Campaign/newsletter/journey message                                  | Phases 32/34/35                                                           | outside system catalog unless it invokes an already-Live system meaning                                                       |
| Resend connection/domain/webhook/sender/reply problem                | Phase 17 D10/D15                                                          | one Target Live grouped Needs-attention meaning; no email-only incident dependency                                            |
| Publication review/change request                                    | Phase 17 D11                                                              | Target Live in-product meanings above                                                                                         |
| Import/export/transfer job completion or action needed               | Phase 17 D19                                                              | contextual job state; stable notification key deferred unless user testing proves an attention event is needed                |
| Eve platform-operator outage/security incident                       | Eve #436 plus Phase 17 email seam                                         | Eve owns safe facts/recipient/policy and Discord; email key deferred until exact event meaning is enumerated and Live-proved  |
| SMS STOP/HELP, registration and delivery                             | later explicit SMS phase                                                  | evidence vocabulary only; no Phase 17 key, content or transport                                                               |

### Explicit exclusions and migration dispositions

- `refund_started` is an orphan current type. It remains Reserved only while history/producer evidence is checked; if none exists, retire the legacy semantic without silently aliasing it.
- Template test sends and Resend connection tests are operational tests, not product-message catalog entries and not donor communication history.
- Human-authored support replies, newsletters, campaigns, and missionary personal messages are not system-message contracts.
- Eve Discord operational alerts remain in Eve's bounded channel and audit model; they are not tenant System Messages or Phase 6 email outcomes.
- Normal recurring payment success uses the Phase 7 receipt. No duplicate `recurring_success` key may be created.
- Missionary pause and missed-occurrence visibility follow Phase 16/D8. No speculative missionary email key is created.
- Existing family/variant values remain migration aliases for history only after a stable key takes over.

### Live activation proof

One automated evidence bundle per key and generation must prove:

1. a real producer emits the exact stable contract key plus one bounded
   recipient/channel-step occurrence-slot token, and the server proves its
   permanent scoped slot plus the derived semantic-identity and full
   immutable-command hashes;
2. source occurrence, epoch/fence, meaning, requiredness, purpose, audience, recipient resolver, and current applicability are authoritative;
3. typed facts, collections, privacy classification, protected core, action purpose, and synthetic fixtures are complete;
4. Phase 3 consent/suppression/purpose mapping and required-message policy are explicit;
5. required channels and Delivery Steps compile with no phantom channel;
6. every required locale has a valid complete publication, plain text, layout, long/RTL/blocked-image proof, and deterministic fallback policy;
7. the D6 action, if present, proves scanner-resistant landing, expiry,
   replay, binding, and postcondition;
8. each executable external-email step proves its applicable D10 connection,
   D20 sender, D17 reply, domain authentication, tracking posture, signed
   webhook, canary, transport, delivery, and outcome-reconciliation readiness;
   each local-only `in_product` step instead proves its local presentation,
   role-safe projection, source-owned presentation-end rule, recipient access,
   event/history, and operational readiness while connection, sender, reply,
   domain, webhook, and provider transport are explicitly not applicable; SMS
   remains transport-dark and non-executable in Phase 17;
9. Phase 6 intent and event are end-to-end for every channel; preparation,
   dispatch, normalized provider outcome, and D14 provider-material retention are
   proved only for external delivery, while `in_product` proves local
   availability with structural absence of provider records;
10. D15 definite/accepted/indeterminate/rejected recovery and grouped repair behavior are proven;
11. tenant/role/site/locale/cache/batch/import isolation, concurrency, deployment N/N-1, migration, rollback, accessibility, and load tests pass;
12. an operations owner, dashboard, alert, runbook, kill control, and rollback artifact exist; and
13. activation advances the exact manifest generation atomically and repository closure checks find no unknown direct sender.

## System-Message Contract

### Code-owned definition

Each catalog entry compiles from one versioned TypeScript definition with these required fields. Names below describe the contract; implementation may use equivalent strongly typed names but may not omit or collapse meanings.

| Field                                       | Required meaning                                                                                                                                                                                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key` / `semantic_version`                  | immutable stable product meaning; a breaking meaning change gets a successor key                                                                                                                           |
| `owner`                                     | producing domain and accountable product/operations owner                                                                                                                                                  |
| `lifecycle`                                 | exactly Reserved, Live, or Retired in the activated manifest                                                                                                                                               |
| `scope_kind`                                | explicitly `tenant` or `platform` in the source profile and expanded contract; never runtime-inferred, supplied by an implicit default, or selected by a caller                                            |
| `purpose` / `classification`                | product purpose and Phase 3 consent/compliance adapter input; callers cannot self-declare                                                                                                                  |
| `requiredness`                              | required, tenant-and-recipient optional, tenant optional but role-required when enabled, or prohibited per step                                                                                            |
| `source_identity`                           | authoritative occurrence type, stable source id, epoch/fence, and applicability recheck                                                                                                                    |
| `audiences`                                 | finite recipient roles and one server-owned resolver per role; never free-form addresses or queries                                                                                                        |
| `fact_schema`                               | typed facts, bounded collections, presentation cases, privacy class, null behavior, formatter, synthetic value                                                                                             |
| `truth_core`                                | minimum protected nodes/properties, source owner, reason, applicability, safe styling freedom, source correction action                                                                                    |
| `actions`                                   | finite D6 purpose descriptors, producer issuer, expiry/replacement/replay rules, landing and postcondition                                                                                                 |
| `channels` / `delivery_plan`                | fixed required and optional slots, approved channels, timing names, simple producer-owned conditions                                                                                                       |
| `locale_policy`                             | supported locale contract, required translations, D3 policy eligibility, system-default eligibility, direction handling                                                                                    |
| `layout_role`                               | one earned role or a language-neutral layout; no arbitrary layout selection                                                                                                                                |
| `sender_purpose`                            | one earned D20 purpose and allowed Sender Profile scopes                                                                                                                                                   |
| `reply_posture`                             | one D17 purpose or explicit Replies not expected                                                                                                                                                           |
| `recent_copy_policy`                        | Off-only or permitted tenant ceiling and protected-link removal rules                                                                                                                                      |
| `recovery_policy`                           | required fallback, optional suppression, compatible-prior eligibility, utility window, provider ambiguity behavior                                                                                         |
| `provider_policy`                           | versioned Resend acceptable-use and deliverability mapping; ambiguous use remains blocked                                                                                                                  |
| `proof_requirements`                        | activation tests, fixtures, email clients, a11y, load, operations and rollout evidence                                                                                                                     |
| `document_class`                            | closed legal/data-exposure presentation class; never inferred from a tenant template category                                                                                                              |
| `fact_wall`                                 | exact required, conditional, allowed-optional and forbidden facts; an unlisted fact is rejected                                                                                                            |
| `protected_render_keys`                     | minimum facts/actions/semantic relationships that content and responsive rules cannot remove, hide or contradict                                                                                           |
| `surface_capability_envelope`               | exact authoring, recipient, history and source-action surfaces plus current capability reproof                                                                                                             |
| `retention_audit_class`                     | one Phase 3/6 policy plus exact append-only material audit events; never a durable personalized body                                                                                                       |
| `prepared_artifact_retention_class_by_step` | exact closed material posture for every delivery step: an external artifact class with absolute ceiling/terminal erasure/body-free residue, or the `prepared.none@1` no-artifact sentinel for `in_product` |
| `shared_profile_ref`                        | immutable compile-time profile expanded into a complete flat contract; no runtime inheritance or tenant profile editing                                                                                    |
| `decision_clause_ids` / `proof_test_ids`    | durable D1–D20 traceability and release-proof identities                                                                                                                                                   |

The registry is not tenant data. Tenants cannot create keys, facts, actions, purposes, roles, channels, classifications, or failure policies. A tenant can select only the controls explicitly exposed by the active contract.

The normative companion [Phase 17 Executable System-Message Manifest Specification](./phase-17-system-message-executable-manifest.md) instantiates these fields for all 18 Target Live keys, defines the five compile-time shared profiles, closed fact/forbidden/action/surface/retention vocabularies, exact trigger bindings, protected Asym system-default namespace, generated projections, closure rules and D1–D20 traceability. It is part of this PRD, not optional implementation guidance. The compiler expands each profile and named override into one complete flat object and hashes it into the activation generation; there is no runtime profile lookup, deep merge, inferred default, tenant profile editor, or generic policy language.

### Producer submission contract

A producing domain submits only the producer payload below. Before persistence,
the server resolves the exact catalog/trigger binding and authenticated server
context into a closed tenant-or-platform authority union. `scope_kind`, owner,
tenant/site, platform scope, and platform-owner authority are sealed resolver
output—not producer payload fields—and the database revalidates the resulting
exclusive arc:

- for tenant scope, the authenticated tenant and validated site where the
  contract permits site context; or
- for platform scope, the fixed platform scope and exact closed recipient
  authority branch. Platform v1 permits only `eve_platform_owner` with its
  verified authority revision and identity/permission epoch.

The generated server entry point supplies the producer event key/version and
stable producer namespace. The producer payload contains only:

- the source occurrence id and immutable epoch or concurrency-fence values
  permitted by the binding's source-fence schema;
- one `plan_occurrence_token@1` for the complete occurrence, retained by the
  producer and stable even when the applicable member set is empty;
- one bounded opaque member occurrence-slot token plus its declared token-schema
  version for each possible recipient and channel-step slot, with both retained
  by the producer; the producer never supplies a server-derived hash;
- one recipient role and its bounded resolver input, never a destination
  address chosen by content;
- bounded typed fact values or an immutable source snapshot reference;
- applicable presentation case identifiers, ordered collection items, and a
  bounded typed source-relation set;
- protected-action descriptor inputs, never a prebuilt tenant-editable URL;
- earliest/expiry/utility window owned by the producer where the contract permits it; and
- correlation references that contain no content, credential, or sensitive provider payload.

The generated producer adapter selects one code-generated event/plan handle for
the whole occurrence and one code-generated trigger-binding handle for each
possible member; it never sends a raw binding id, event name,
contract/generation, plan, step key/ordinal, channel, publication slot,
recipient role/resolver, fact adapter, or action issuer as editable payload. The
non-exported server registry resolver reloads the top-level handle even when no
member applies, then reloads each member handle against the immutable generated
projection and resolves the exact compatible manifest generation and effective
tenant or platform plan. It seals the top-level plan-occurrence context plus one
binding context containing `{binding projection id, manifest generation, binding
id/version, producer event key/version, stable producer namespace, contract
key/version, delivery-plan contract id/version, effective plan id/version, step
key/ordinal, channel, publication slot, recipient role,
resolver/fact-adapter/action-issuer/condition versions}` for each possible
member. A TypeScript brand alone is never authority. Unknown, stale, mismatched,
Reserved, Retired, unbound, forged, cross-scope, or caller-composed context
rejects before an occurrence slot or intent can be inserted. A contract with two
delivery steps therefore resolves two independent binding contexts and requires
two independent occurrence-slot tokens; neither step can borrow the other's
binding or token.

The producer never supplies a template id, HTML, subject, locale fallback path, From, Reply-To, Resend key, provider headers, recipient query, or resolver-owned recipient fact. Phase 17 never queries arbitrary source tables while rendering. A producer adapter projects only the contract's declared source-owned facts; the named server recipient resolver adds only its declared recipient-owned facts. Their collision, spoofing, omission, stale authority, or failure to produce one complete authorized render DTO fails closed before channel materialization—external preparation or the in-product `available` event/projection.

### Recipient-grained identity and batching

The public producer seam accepts one complete plan-occurrence command, including
the bounded candidate envelope for every possible recipient, role, channel, and
step. Inside the compiler's single database transaction, its private child
primitive resolves exactly one concrete recipient authority for one channel
step and gives each member an independent occurrence-slot token. Those private
member commands cannot be submitted or committed independently, and a token is
never shared across member slots. After the parent is released, each child keeps
an independent delivery, suppression, repair, and outcome lifecycle.

The caller supplies no key or hash. The server derives and stores:

1. **Occurrence-slot hash** — `occurrence_slot_hash@1`, a domain-separated hash
   of `{environment, scope kind, scope owner, stable producer namespace id,
token bytes}`. A permanent unique constraint on
   `(scope_kind, scope_owner_id, environment, occurrence_slot_hash)` makes this
   the stable lock for one producer-authorized recipient-and-channel-step slot.
2. **Semantic identity hash** — `semantic_identity_hash@1`, which covers the
   occurrence-slot hash plus `{environment, producer implementation version,
token schema version, scope kind, scope owner, contract key, activation
generation, immutable binding-projection id, binding id/version, producer
event key/version, delivery-plan contract id/version, effective plan
id/version, source occurrence type/id and fence/epoch, step key/ordinal,
publication slot, recipient role/resolver/fact-adapter/action-issuer/condition
versions, concrete tenant Party/contact-point
revision or platform recipient-authority kind/revision/epoch, channel}`.
3. **Immutable-command hash** — `immutable_command_hash@1`, which covers the
   canonical complete producer command and resolved relation envelope: typed
   fact values or immutable snapshot digest, ordered collection-item digest,
   relation-set hash, ordered presentation cases, protected-action
   descriptor-input digest, recipient-resolver input digest, and
   earliest/expiry/utility bounds, in addition to the semantic identity terms.

One transaction inserts or locks the unique occurrence slot, then compares the
semantic-identity and immutable-command hashes plus all three schema versions.
An exact replay returns the prior row only when both comparison hashes and their
schema versions match. Reusing the slot with any changed identity, fact,
relation, order, action, recipient, channel step, or timing bound is a hard
conflict. A legitimate successor or corrected producer event requires a new
producer-authorized slot token. No caller-supplied string or hash can bypass or
replace the derivation. Preparation has its own immutable byte/hash proof and
cannot repair an earlier command-identity mismatch.

All three digests use distinct code-owned domain separators and versioned
canonical UTF-8 byte schemas with Unicode NFC strings, explicit type tags and
lengths, lexicographically ordered object keys, preserved array order, and
distinct absent versus null values; SHA-256 is the initial digest.
Locale-dependent serialization, concatenated ambiguous strings, caller JSON
ordering and database-generated textual JSON are forbidden inputs. Golden
fixtures prove cross-process stability, slot uniqueness, exact replay, and that
changing any one covered field produces the expected conflict.

The stable producer namespace id is a durable registry identity, never a deploy,
implementation, or token-schema version. Each source candidate persists its
original token bytes and token-schema version and re-emits both across N/N-1,
retry, rollback, and worker replacement. A namespace rename or future slot-hash
schema change must preserve the existing unique slot through an explicit data
migration/alias; it may not rehash an existing candidate into a new slot.

Every recipient/channel step has an independent semantic intent identity,
eligibility decision, communication event, and repair state. An external-delivery
step additionally has its own prepared message, provider id/outcome, and a
permanent internal provider-message identity. An `in_product` step has none of those
provider-specific records; it creates only its local `available` event, role-safe
projection, engagement, and body-free history. A provider optimization can never
create a batch-wide product outcome. Provider idempotency is supplemental:
Resend's current 24-hour window cannot replace Asym's permanent semantic
identity.

Single and batch sends use one subordinate Phase 6 **provider-submission envelope**. A single submission has one ordered member and uses `POST /emails`; a batch has 2–100 members and uses `POST /emails/batch`. Before external I/O the immutable envelope seals scope kind/owner and environment, endpoint, exact Resend account/connection/credential revisions, strict-validation pin, adapter/API version, state/claim fence, attempt ordinal, one request-level Resend idempotency key, encrypted exact UTF-8 request bytes, request digest/length, nonsecret allow-listed headers, and a contiguous zero-based member map from index to preparation/internal provider-message identity/member hash/safe correlation tag. The response appends the exact provider id at the documented matching request index. One request key never represents a changed body or membership.

The batch compatibility key must match scope kind/owner, environment, Resend team/account, connection and credential revision, verified domain, exact tenant Sender Profile/reply revision or fixed platform sender/reply policy, channel, safety/purpose and latency class, retry policy, and endpoint capabilities. A batch never crosses any boundary in that key; tenant and platform recipients can never share an envelope. Attachments and `scheduled_at` remain unsupported by the current batch API; a contract-approved attachment uses the governed single-send seam, while product scheduling stays an Asym durable due intent rather than provider scheduling. Latency-critical auth, security, protected-action and immediate-receipt work uses one-member submissions and does not wait for aggregation.

The existing Phase 6 outbox/due-intent queue is the only wake-up authority. The assembler seals a compatible batch at the first of: 100 members; the next member would exceed a deployment-probed serialized-body ceiling; the oldest member reaches the initial non-tenant-configurable 250 ms aggregation wait; an earlier contract utility deadline; or controlled worker drain. The wait may change only from measured evidence and cannot exceed one second without a new explicit performance decision. An unset/unproved body ceiling disables batching rather than guessing an undocumented limit. Scope-owner-fair round-robin scheduling, due-time order within each owner, bounded global memory/concurrency, reserved interactive capacity, bulk aging, and initially one in-flight request per delivery connection prevent starvation/noisy-neighbor harm. The limiter consumes current Resend rate/quota/`Retry-After` headers; tenants cannot configure batch size, wait, concurrency, validation mode, or retry policy, and the service-only platform owner cannot bypass the same bounded fairness controls.

The deterministic upper-bound oracle uses 101 otherwise-compatible, locally
valid, under-byte, due members and a forced drain: preserve due order; seal
members 1–100 as one `/emails/batch` envelope with indices 0–99; and seal member
101 as one governed `/emails` single envelope with index 0. Each envelope has
distinct sealed bytes, digest, request key, and member map; every intent appears
exactly once; and recovery or indeterminate state is envelope-local. The
assembler must never truncate, over-submit, duplicate, or cross scope, account,
credential, domain, sender, reply, safety, latency, or endpoint-capability
boundaries. Other legitimate flush causes may produce smaller envelopes; they do
not change this exact forced-drain boundary fixture.

Validate every member and the exact serialized request locally, then explicitly request Resend **strict** batch validation. A recognized strict validation rejection proves no member was submitted. Isolate a locally invalid member and place unchanged eligible artifacts in a new sealed envelope with new ordered membership, digest and request key. If provider rejection identifies no reliable member, run one bounded single-member isolation pass rather than repeatedly bisecting/sending arbitrary subsets. Permissive partial validation is unreachable in Phase 17.

Batch activation also pins the current SDK/API and a real fixture proving one valid response id per member and documented index-to-id mapping. Count mismatch, duplicate/invalid id, malformed success, ordering uncertainty or contradictory id/tag evidence makes the request **Indeterminate** with closed cause `batch_mapping_indeterminate` and forbids split, rechunk or rekey. The grouped repair surface shows the affected envelope/member count, evidence health, exact next safe action, and that no blind resend is allowed; `P17-CON-02` and the batch proof pack cover malformed, partial, duplicate, reordered, and contradictory mappings plus operator recovery. If that proof later fails, new work automatically uses the same governed one-member path; existing indeterminate work remains frozen for reconciliation.

## Canonical Structured Document and Compiler

### One canonical source

Each complete content variant stores one Asym-governed structured document containing:

- subject and preheader;
- canonical Tiptap JSON body;
- canonical locale and text direction;
- document-schema, block-catalog, contract and variable-schema versions;
- governed asset identities;
- protected node identities and policy metadata; and
- canonical source hash.

HTML and plain text are deterministic compiled artifacts, never independent editable sources. Layout is a separate immutable dependency. The initial writable vocabulary is limited to paragraphs, semantic headings, ordered/unordered lists, bold/emphasis, safe informational links, approved protected actions, tenant-owned images, dividers, optional contract blocks, bounded contract collections, and protected domain summaries. Protected receipt/statement line items may use an accessible domain-owned table; staff do not get a general table builder.

Reject raw HTML, CSS/classes, scripts, event handlers, forms, iframes, embeds, arbitrary columns, arbitrary React, unknown nodes/marks/attributes, custom tenant nodes, formulas, expressions, token text, tracking pixels, hidden content, remote code, and record paths. Paste is normalized into the allow-list; unsupported or dangerous material is reported, never silently retained.

### Typed variables and adaptive content

Variables are indivisible picker-inserted nodes. Each variable records type, semantic meaning, source owner, privacy class, allowed contract/audience/channel/output contexts, nullability, missing-value rule, format, maximum size, synthetic value, and escaping behavior. Default output is escaped. URLs, attributes, subject, preheader, HTML text, and plain text use context-specific encoders. Subject/preheader reject CR/LF, bidi-control abuse, unsafe control characters, excessive length, and secrets.

The only tenant-facing adaptive controls are:

1. **Insert information** — one approved typed fact;
2. **Add optional content** — one contract-owned optional block;
3. **Add when-applicable section** — one named producer-owned presentation case; and
4. **Add details list** — one bounded, deterministically ordered contract collection.

No tenant expression, comparison, loop, nested condition, query, join, custom formula, or recipient segmentation exists. The server validates every reachable case and missing-value path at publication.

### Minimum protected truth core

Tenant authoring is the default. A property may be protected only when all six questions answer yes:

1. Is there a named source owner?
2. Would editing it create a real truth, legal, security, privacy, identity, accessibility, or action-authority failure?
3. Is the protection limited to the exact applicable message/fact/action?
4. Is the smallest possible unit protected?
5. Can staff still style, position, and explain it safely?
6. Is there a clear source-system action to correct wrong truth?

Protected components expose owner, reason, applicability, permitted freedom, and **Change at source** action in plain language. Staff may style or move a component only within contract bounds. They cannot remove, duplicate, split, redirect, hide, convert to an image, add tracking, deceptively relabel, or make it inaccessible. Subjects and preheaders remain editable unless a contract records an evidenced narrow exception. Required service messages cannot be turned into fundraising/marketing; approved non-soliciting warmth is allowed.

Source-family rules:

- Phase 7 owns official receipt/statement eligibility, source facts, issuance,
  and correction effect. Phase 18 owns generated-document identity, exact
  artifact/current head, access, and document-record links.
- Phase 4/auth owners own tokens, expiry, recipient cardinality and completion.
- Phase 13/16 own amount, currency, finality, schedule, processing, no-backcharge and recovery facts.
- Phase 3 owns purpose, consent and suppression meaning.
- Phase 10 structurally excludes restricted/care facts.
- Phase 14 owns recognition recipients and facts.
- Phase 17 protects and presents those facts; it never recalculates them.

### Server-authoritative compilation

The client submits `{draft id, expected revision, structured document, selected dependency drafts}` only. One server compiler:

1. authenticates tenant and capability;
2. validates size/resource limits and exact same-tenant dependency ownership;
3. validates schema, nodes, marks, nesting, attributes, links, assets and bidi/locale rules;
4. validates contract variables, cases, collections, protected nodes and required meaning;
5. produces deterministic pre-PII HTML/text skeletons and hashes;
6. runs accessibility, plain-text, images-blocked and policy checks;
7. records exact document schema, contract/catalog generation, compiler, sanitizer, formatter, renderer, asset manifest and evidence versions; and
8. returns structured findings tied to exact blocks.

Preview, test, commit, publish and production preparation call the same compiler. Browser rendering is an approximation, never authority. First prove the exact pinned Tiptap and React Email packages in the production Node runtime. If necessary, build only a small renderer for the approved nodes. Do not add general DOM emulation, fork either library, or create a proprietary language.

### Draft, commit and publication

- Draft autosave uses optimistic concurrency. A stale revision returns compare/reload/save-as-copy; never last-write-wins.
- Commit atomically freezes source, compiled skeletons, dependency requests, hashes, validations, diff and impact evidence.
- Standard publication may be committed and published by the author after validation, preview, diff, and impact acknowledgement.
- Protected publication requires a different currently authorized human and step-up proof. The reviewer approves the exact immutable candidate; any substantive content or dependency change stales review.
- **Approve & publish** is one atomic idempotent server action. Failure leaves the prior publication active.
- A published version is never edited or ordinarily recompiled. Restore creates a new attributable candidate from a prior version.
- Publishing sends nothing. Already-prepared intents keep old pins. The publish
  impact view separates **Future messages use this version** from **Already
  prepared messages keep version [version/generation]**, shows safe counts and
  pin generations, and never offers retroactive replacement.
- A safety control may quarantine a publication without rewriting it. D3/D15 then govern fallback or blocking.

Primary states are `Draft`, `Needs review`, `Changes requested`, and `Published`; quarantine and migration need are separate facts. Standard self-publish remains simple. Tenants may enable one stricter global “another reviewer for every publication” setting, but cannot weaken protected review or build a custom approval workflow. Author/editor provenance is objective: any principal who changed content or a pinned dependency is not independent for that candidate. Support impersonation, service accounts, shared identities and a renamed/split change cannot evade the rule.

### Derived publication floor and exact approval protocol

The server derives one immutable `publication_floor_evaluation` from the complete effective candidate and its dependency fan-out; the browser never chooses the floor. It records `standard` or `protected`, all applicable closed reason codes, the contract/catalog and predicate-policy versions, every evaluated candidate/compiled-output/dependency/scope/site/locale/plan/fallback/sender/reply digest, the affected protected contract keys/scopes, and whether the tenant's single stricter-review setting elevated the result. The strictest result wins. Splitting or renaming a change, changing roles, or supplying a client label cannot lower the floor; a dependency, contract, predicate-policy, permission, assignment, governance-epoch, or publication-head change invalidates the evaluation and any bound review.

| Protected reason code                | The effective change can alter                                                                                                                                                      |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `official_financial_meaning`         | receipt, acknowledgment, statement, tax, statutory, jurisdictional, void, supersession, donor-advised-fund, matching-gift, or other official financial meaning                      |
| `auth_or_security_meaning`           | authentication, invitation, claiming, recovery, email change, reauthentication, expiry, replacement, revocation, or fraud-reporting meaning                                         |
| `payment_or_recurring_meaning`       | amount, cadence, pending ACH, failure, retry, payment-method recovery, pause, resume, cancellation, or payment authorization meaning                                                |
| `protected_action_context`           | a D6 action's label, emphasis, warning, support route, explanation, placement, or accessible equivalent                                                                             |
| `consequential_delivery_plan`        | a D7 recipient, channel, required/optional step, timing, escalation, fallback, or named condition with consequential effect                                                         |
| `fallback_consequence`               | D3 language, site, locale, jurisdiction, or protected-system fallback behavior                                                                                                      |
| `shared_protected_dependency`        | a layout, Brand Kit element, asset, footer, organization identity, sender/reply instruction, or other dependency consumed by a protected publication                                |
| `quarantined_protected_replacement`  | a replacement for protected content quarantined for security, privacy, phishing, compliance, or rendering risk                                                                      |
| `protected_runtime_contract_change`  | a contract, schema, compiler, sanitizer, formatter, migration, or compatibility change that can alter protected meaning or accessible equivalence                                   |
| `tenant_requires_independent_review` | the tenant's one global setting elevated an otherwise standard publication; this reason is additive and never replaces a platform reason or permits tenant-authored risk predicates |

`ApproveProtectedPublication` is one atomic command over one immutable candidate. It re-proves the current evaluation and every structural/truth/privacy/locale/accessibility/rendering/sender/reply/action gate; requires a different authenticated human from every substantive author/editor; requires current `system_messages.review.protected`, `system_messages.publish.protected`, any contract-owned business capability, and Phase 12 step-up; excludes impersonation, **View as**, service/shared identities, and support tooling; rechecks author/reviewer assignment and permission epochs plus the tenant governance epoch; and compares the expected publication head. Success advances the head and appends the exact reviewed evidence in the same transaction. Any race or failed proof publishes nothing and leaves the prior valid publication active. Review can never waive a structural failure.

A one-person tenant may invite one candidate-scoped delegated reviewer through Phase 12. The invitation binds tenant, immutable candidate digest, reason codes, exact review/publish capabilities, inviter, verified invitee identity, expiry, and revocation. The delegate is a distinct stepped-up human, cannot edit or re-delegate, and sees only a synthetic review projection: safe before/after diff, protected meaning, affected scopes, dependency impact, validations, and synthetic HTML/plain-text/responsive cases. No donor, missionary, staff, payment, credential, care/restricted, Resend-secret, real-recipient, or unrelated-tenant data is exposed. Missing quorum leaves the current or inherited safe publication active and offers **Invite reviewer**, **Keep current version**, and, when compatible, **Return to inherited version**.

`RestoreProtectedBaseline` is a narrow Phase 12 emergency risk-reduction command, not a bypass. A stepped-up human with the explicit emergency capability must cite a recorded security/privacy/compliance/phishing/availability incident and may restore only the current compatible Asym system default or a previously independently reviewed same-tenant last-known-good version. Every current contract, schema, compiler, locale, action, sender/reply, privacy, source, and safety check must pass, and the result may only restore or narrow risk—never introduce new protected wording, meaning, action, recipient, plan, fallback, or identity. The command appends a new attributable decision, never fabricates a reviewer, sends a body-free in-product governance alert, and cannot run per send or per batch. If no compatible safe target exists, quarantine and repair are the only allowed paths.

### Synthetic preview and test sends

Every contract ships stored fake fixtures for typical, missing optional, longest legal values, bounded maximum collection, locale formatting, long translation, RTL/mixed script, blocked images, narrow viewport, plain text, and every presentation case. Fixtures contain no real donor PII or copy of production records.

Test sends:

- go only to an access-confirmed authorized staff/test address;
- show `[TEST]` in subject and a visible test banner;
- use inert protected actions that explain they cannot complete the real action;
- use the exact publication candidate/compiler/sender/reply path being tested;
- are rate-limited and audited as operational test evidence;
- never create a donor/Party communication event or claim product success; and
- retain only fixture/version/hash/provider diagnostic evidence under a bounded policy.

Malformed or unsupported saved content remains read-only as **Needs migration**. Ordered one-version migrations create a new draft, preserve original bytes/hash, validate before/after, report loss, and require normal publication. Legacy Unlayer publications remain sendable from their last-known-good frozen artifacts; conversion produces a new draft and never claims lossless equivalence without proof.

## Inheritance, Locale and Resolution

### Whole-message inheritance

A scope with no customization stores no duplicate content. It displays the exact effective publication and source. **Customize** copies that complete publication into a new revisioned draft with source provenance. Parent changes never overwrite descendants. Staff get three explicit choices: keep current custom publication, create a new draft from the updated parent, or return future resolution to inheritance. Returning to inheritance does not delete history.

Subject, preheader, body, links, content metadata, and protected nodes always come from one complete publication. Brand Kit and Role Layout resolve as separate complete pinned dependencies. There is no field merge, patch chain, live fragment, automatic three-way merge, or descendant republish.

### Locale activation

Tenants may activate any canonical human-language locale in the version-pinned IANA/Unicode standards catalog; Phase 17 has no Asym-curated launch allow-list. The server canonicalizes recognized language/script/region aliases and rejects arbitrary strings, private-use-only identities, `und`, `mul`, `zxx`, control characters, unsafe extensions, and locale options whose behavior Phase 17 does not support. A recognized locale that the pinned renderer cannot yet format may be added to the authoring workspace and populated for coverage review, but affected contracts remain visibly not Ready and follow governed fallback until capability evidence passes. No communication may enter the dispatch state `Prepared definitely unsubmitted` in that locale until the pinned platform-render-capability proof passes. Locale-capable review means an explicitly authorized human attests they can assess the exact candidate/locale or uses an approved named reviewer; it does not create automated language certification.

Never collapse these five independent facts:

1. **Tenant activation** — authorized staff intentionally make the locale available for future system-message resolution at the organization or eligible site scope.
2. **Recipient-requested locale** — source-owned preference/context requested for one concrete recipient and intent.
3. **Platform render capability** — the pinned compiler, formatter, fonts and direction support can safely process that canonical locale.
4. **Contract readiness** — one exact `{tenant, scope, contract generation, locale, presentation dependency set}` is `Ready`, `Uses compatible fallback`, or `Needs attention`, with reasons and evidence.
5. **Effective rendered locale** — the locale actually selected by D3 and frozen on one prepared message.

Activation is allowed after a synthetic, PII-free impact review even when coverage is partial. It is not readiness and never claims that the entire product is translated. The review shows every required Live contract partitioned into exact publication, compatible fallback, and blocked; affected sites, direction/render-capability gaps, protected-review gaps, and the future recipient consequence are explicit. The tenant may proceed when every blocked required contract will fail closed under its contract; the UI then shows the active locale plus truthful readiness counts and blockers rather than a false global Ready badge.

Deactivation is also impact-reviewed and future-only. It stops the locale from entering new requested-locale resolution after the committed effective instant; it does not rewrite publications, prepared messages, provider work, history, recipient preferences, or prior effective-locale evidence. Reactivation is a new audited activation transition. Activating or deactivating never machine-translates or auto-publishes. Phase 24 later owns broader site/shell localization.

### Two resolver policies

The organization chooses one immutable published default:

- **Prefer the recipient's language — Recommended**; or
- **Prefer site-specific wording**, with a clear warning that a less-preferred language can win.

An exact compatible validated-site + requested-locale publication always wins. The resolver canonicalizes locale tags and uses one pinned Unicode CLDR parent/language matcher. It constructs bounded deduplicated locale candidates from requested exact locale, approved parent/same-language match, other explicit recipient preferences where supported, tenant default, and a protected system default only when the contract permits it. Scope candidates are validated site, tenant, and system namespaces.

Language-first iterates locale candidates before scopes. Site-wording-first iterates scopes before locales. Before priority, each candidate must pass tenant/site ownership, jurisdiction, channel, document class, fact-schema, privacy/restricted-person, sender, publication, dependency, current-safety-epoch, quarantine, and contract-specific compatibility. A foreign site is an authorization failure, not a missing candidate.

Each contract is one of `tenant_policy_eligible`, `platform_fixed`, or `fallback_prohibited`. Official receipts/statements/voids/supersessions, auth/security, mandatory payment/network/authorization/statutory messages, restricted-worker safety, and future SMS STOP/HELP do not expose unsafe policy choice. A contract may allow a per-message override only when both policies are safe.

Resolution records the policy/resolver versions, requested-locale provenance, ordered candidates and rejection reasons, effective content scope/locale, cross-language result, content/layout/brand pins, and fallback reason. A synthetic scenario preview shows this exact trace without PII. Policy publication and candidate publication/quarantine recalculate a PII-free impact report.

The settings UI always labels whether the effective policy is inherited from the organization or explicitly set for an eligible contract. **Customize policy** creates a complete draft from the organization policy; **Return to organization policy** changes only future resolution, preserves prior versions/pins, and previews the resulting scope/locale order before confirmation. Contracts marked `platform_fixed` or `fallback_prohibited` show the fixed consequence and reason but no misleading editable control.

## Brand Kit, Layout Roles and Saved Sections

### Brand freedom

One versioned Brand Kit owns reusable email presentation tokens: approved logos/assets, colors with contrast evidence, typography from the email-safe set, link/button styles, spacing scale, border/radius choices, organization identity and footer presentation. Staff see a visual brand workspace and live message examples, not token JSON.

Tenants retain broad freedom inside safe HTML-email constraints. They may create complete site-specific Brand Kit overrides, change visual tokens, reorder allowed layout regions, add safe decorative content, and use Saved Sections. They cannot alter protected truth, inject code, hide mandatory identity/unsubscribe/legal content, or create inaccessible output.

The v1 safe control set is explicit and visual: approved logo/image assets and alt text; email-safe type family, bounded size/weight/line-height; foreground/background/accent colors with contrast evidence; bounded content width, spacing, alignment, border, radius and divider; button/link presentation; organization identity/footer treatment; code-owned header/body/footer regions; and contract-approved optional decorative/content blocks. Tenants can arrange eligible regions and optional blocks, use complete site overrides, and preview every dependency. They cannot enter raw HTML/CSS/JavaScript, arbitrary fonts, absolute/fixed positioning, negative/off-canvas hiding, custom breakpoints/media queries, invisible text, tracking pixels, forms, iframes, scripts, or styles that obscure a Managed node.

Responsive visibility is allowed only for an explicitly optional decorative block whose omission leaves the same meaning and action. Protected truth, required action, sender/organization identity, legal/unsubscribe content, and source-owned data may never be device-hidden, reordered outside its semantic group, or replaced by image-only content. Breakpoints and stacking behavior are compiler-owned and finite. Every drag/reorder action has non-drag controls and the validator tests all supported viewport/direction combinations before publication.

### Earned Layout Roles

Do not create a role for every conceptual category. The D16 launch inventory earns only these structurally distinct roles:

1. **Service message** — default compact transactional/operational wrapper for receipts, corrections, recurring notices and ordinary staff email.
2. **Protected action** — scanner-resistant action emphasis and required security/authorization treatment for auth and other D6 contracts.
3. **Official artifact delivery** — reserved until Phase 18/19; layout includes protected artifact identity and download region but never renders the official artifact itself.

Marketing/campaign, in-product, SMS, and personal correspondence are not email Layout Roles in this phase. Each tenant owns one complete organization Role Layout per earned role and optional complete site overrides. A Role Layout pins its compatible Brand Kit version and declares locale-neutral or exact locale compatibility. There is no nested live layout inheritance or runtime fragment graph.

The compiler distinguishes structural email layout tables from real tabular data. Layout tables receive presentation semantics and a logical reading order; receipt/statement data tables keep genuine headers, scope and text alternatives. Golden output proves images-blocked, dark-mode/light-mode, high contrast, 200% zoom, narrow mobile, long translation, RTL/bidi, keyboard/link order, and named screen-reader behavior without claiming that every email client implements WCAG uniformly.

### Saved Sections

Saved Sections are tenant-owned authoring accelerators, not live dependencies. Inserting one copies its structured content into the draft. Later edits to the saved source never mutate existing drafts or publications. Import/export may carry eligible saved sections, but publication authority and protected content are revalidated at destination.

Every publication pins exact content, Brand Kit, Role Layout, asset, compiler and policy revisions. Dependency impact is shown before publish; invalidating or quarantining a shared dependency opens one grouped repair case with affected counts and safe next action.

## Protected Actions

Protected actions are tenant-scope-only in this generation. A tenant contract
must bind one exact Party/contact authority through the rules below. Every
platform-scoped contract must declare `action: none`; the compiler rejects any
platform protected-action descriptor. A future platform protected action needs
a separate ratified authority model and ADR rather than borrowing tenant Party,
site, session, or Supabase-invitation semantics.

The producer owns action purpose, recipient binding, tenant/site, source occurrence/fence, expiry, replacement/revocation, replay behavior, completion preconditions, and postcondition. Phase 17 owns only the protected visual component and scanner-resistant handoff presentation.

Every protected action enters through one fixed scanner-resistant Asym doorway:
the HTTP URL carries a random non-secret selector and an independent 256-bit
verifier remains in the fragment. GET/HEAD with the selector alone opens only a
generic inert explanation. One minimal first-party script removes the fragment
from browser-visible history; a deliberate same-origin POST validates it and
re-proves current tenant/recipient/source authority. The producer contract may
then require an authenticated portal session, reauthentication, step-up,
producer OTP, or explicit confirmation before its own operation. Those are
assurance requirements behind one doorway, not alternate handoff, link, token,
or authorization systems.

No email GET/HEAD pauses, cancels, approves, changes payment, claims an account,
changes an address, retrieves a protected resource, creates an authorized
session, or mutates business data. Security scanners and prefetchers must be
harmless. The HTTP path/query contains no PII, payment data, provider
credentials, verifier, tenant-selectable destination, or long-lived bearer
authority. The verifier exists only in the fragment until the minimal landing
script moves it into the deliberate same-origin POST; logs, analytics, Recent
sent copy, support tools, provider tracking, communication history, and storage
URLs never retain it. Ordinary links cannot visually compete with or imitate a
protected action.

Supabase auth templates map each adopted action type explicitly; the hook must complete within the current official deadline and use server-owned tenant context. Stripe/payment actions land in authenticated Asym UI and never expose provider mutation through the email. Every action has expiry, replay, replacement, race, wrong-tenant, wrong-recipient, host/origin/open-redirect, scanner, key-rotation, environment, rollback and terminal-state fixtures.

Every protected action instantiates one versioned producer-owned descriptor.
Required fields are stable `action_key`/`producer_key`; the single shared doorway
protocol/version; purpose and authoritative postcondition; server-owned
tenant/environment/site/origin and intended recipient bindings; nonsecret
resource/issuance reference; producer-owned
issuance/validity/expiry/replacement/revocation/replay semantics; one closed
assurance requirement (`current_session`, `step_up`, `producer_otp`, or
`explicit_confirmation_with_source_authorization`); a minimal masked review-fact
schema; the closed terminal vocabulary `ready`, `expired`, `replaced`, `used`,
`revoked`, `wrong_account`, `stale_state`, `already_resolved`, or `unavailable`;
exactly one code-owned recovery route; the required visual/accessible
presentation; and body-free Phase 6/17 audit evidence plus the producer
completion reference. Phase 17 validates and renders this descriptor but never
mints, refreshes, redeems, extends, interprets, or marks the credential complete.

The protected-action browser protocol is exact:

| Request/state                            | Required behavior                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| scanner, prefetch, preview, `GET`/`HEAD` | selector-only request is inert and non-enumerating: no protected facts/resource, credential use, sign-in, address verification, account claim, authorized session, provider session, or product mutation; `HEAD` returns no body/session                                                                                  |
| landing                                  | generic page reveals no protected fact from the selector; one pinned first-party script validates the fragment envelope, removes it from browser-visible history, and prepares—but never auto-submits—the same-origin form                                                                                                |
| deliberate action                        | recipient submits selector + verifier by `POST` to the exact trusted same origin with framework CSRF protection, `Origin`/Fetch-Metadata checks, versioned HMAC verification, and immediate tenant, recipient, source/resource, issuance, authorization, expiry/revocation, expected-revision, and producer-state reproof |
| consequential financial/private action   | current authentication plus contract-owned reauthentication/step-up, significant masked-fact review, and the producer's idempotent command; the email grants entry to review, not authority to complete                                                                                                                   |
| duplicate/race/timeout                   | one producer idempotency and expected-state boundary; repeat returns the same privacy-safe terminal result and never executes twice                                                                                                                                                                                       |
| redirect/return                          | a code-owned allow-listed destination resolved from server context; `Host`, forwarded host, selector, verifier, `redirect_to`, and tenant content never choose authority, and return navigation never proves completion                                                                                                   |

Every protected landing, redirect, error, session, and terminal response carries
`Referrer-Policy: no-referrer` and all three cache headers exactly:

```text
Cache-Control: private, no-store, no-transform, max-age=0
CDN-Cache-Control: no-store
Vercel-CDN-Cache-Control: no-store
```

No protected route permits `s-maxage`, stale fallback, an optimizer, or service
worker handling. At startup, the server parses the configured
`protectedActionOrigin` as one canonical HTTPS origin and joins it only to the
code-owned exact `PROTECTED_ACTION_PATH`; tenant input, request headers, and
arbitrary configured paths never participate. The route may carry only the
closed, random non-secret selector field. It never carries the verifier. Invalid
or non-round-tripping origin/route configuration fails readiness.

For every landing and terminal response, the server generates at least 128 fresh
random bits with a cryptographically secure random-number generator and
Base64-encodes them as `nonce`. It serializes this exact policy only after the
origin/route checks:

```text
Content-Security-Policy: default-src 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; script-src 'nonce-${nonce}'; connect-src 'none'; img-src 'none'; font-src 'none'; media-src 'none'; worker-src 'none'; manifest-src 'none'; style-src 'nonce-${nonce}'; form-action 'self'
```

`${nonce}` is a serialization variable, never literal output; a response
containing the placeholder fails closed. The page is server-rendered with at
most one inline `<style nonce="${nonce}">` block and one minimal inline
`<script nonce="${nonce}">` block using the exact response nonce. The script's
entire job is to parse the closed verifier envelope from `location.hash`, remove
the fragment immediately with `history.replaceState`, and place the verifier in
the same-origin form for an explicit recipient submit. It MUST NOT auto-submit,
fetch, beacon, persist, log, report, navigate, or load another resource. The form
action is the exact same-origin code-owned route. There are no style attributes,
external resources, CSP report receiver, analytics, session replay, remote
image/font, tag manager, pixel, or tracking receiver. Nonces are never reused
across responses. Exact route, method, origin, Fetch Metadata, CSRF, and
authorization checks remain authoritative because CSP is not route
authorization.

The server stores only a versioned HMAC/digest of the independent 256-bit
verifier. A selector-only `GET` or `HEAD` is inert and non-enumerating: it
reveals no organization, action, recipient, resource, expiry, terminal state, or
other protected fact; touches no protected resource; consumes no grant; and
creates no authorized session. `HEAD` returns no body or session. Missing,
malformed, or stripped fragments have no path/query/cookie/raw-selector fallback
and lead only to the same generic recovery surface.

Only an explicit same-origin POST containing the selector/verifier pair may
perform constant-time digest verification and establish a short-lived
non-authorizing landing session. The POST still re-proves every
tenant/recipient/source/action condition and returns a generic failure when any
proof fails. Its cookie contains only a cryptographically random server-side
session id; it is `Secure`, `HttpOnly`, `SameSite=Lax`, host-only because
`Domain` is omitted, and limited to the exact landing/action `Path`. Its absolute
expiry and `Max-Age` are no later than producer action authority. Server state
binds environment, scope tuple, selector and digest/key versions, action kind,
purpose, recipient-authorization epoch, expiry, and revocation. Every later
render/command rechecks those bindings. Rotation invalidates prior sessions;
terminal, expired, replaced, or revoked authority clears every affected
session. A signed/encrypted cookie carrying authority is not an alternative.

Verified POST replay is idempotent and cannot execute the source action twice.
Repeated/scanner-flooded GET/HEAD cannot invalidate a human flow or consume
authority; bounded rate limits may slow the inert landing but never mark an
action used or block recovery/reissue. Security tests cover stripped/modified
fragments, selector enumeration, digest/key rotation, stale/expired/revoked
sessions, sibling-subdomain cookie injection/tossing, wrong
path/scope/environment/action/purpose, duplicate POST, external-webmail and
mobile-webview entry in Chromium/WebKit/Firefox, scanners that execute script or
submit forms, iframe/cross-site POST, rate-limit recovery, and terminal clearing.

Selectors, verifiers, tokens, OTPs, raw POST bodies, hashes, capability-bearing
full URLs, and secret fragments are redacted before proxy/CDN/app logs, traces,
errors, support, screenshots, browser telemetry, and analytics. The
verifier-free current product URL, refresh/forward navigation, form action, and
outbound referrer are product-controlled guarantees after the minimal script
runs; Asym does not claim to erase mail-client/extension history, browser sync,
screenshots, clipboard contents, or other records outside its control. Terminal
pages are non-enumerating and offer exactly one safe recovery route. Production
release proves the fragment survives every supported mail client/webview and
scanner path and that the three cache headers survive the actual Vercel/CDN
route; there is no unsafe compatibility fallback.

The Supabase Send Email Hook mapping is checked in and pinned to the adopted producer schema. Unknown or missing `email_action_type`, unexpected field combinations, or an unsupported project/environment fails closed:

| Supabase action type                                                      | Exact recipient/credential interpretation                                                                                             | Phase 17 contract/postcondition                                                                                                                                                         |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signup`                                                                  | `user.email`; `token` with `token_hash`                                                                                               | confirm-signup capability; completion is Supabase confirmation, never the communication event                                                                                           |
| `invite`                                                                  | `user.email`; a fresh `token`/`token_hash` only after deliberate acceptance of the authoritative seven-day Asym invitation            | Phase 4 `BeginLegacyInvitationRedemption` owns the scanner-resistant, idempotent exchange; the original Asym invitation remains authoritative and is not replaced by this shorter proof |
| `magiclink`                                                               | `user.email`; `token` with `token_hash`                                                                                               | one-time sign-in capability; opening the harmless landing is not sign-in                                                                                                                |
| `recovery`                                                                | `user.email`; `token` with `token_hash`                                                                                               | password-recovery capability; completion requires the producer password-change postcondition and link opening alone does not create an ordinary continuing login                        |
| secure `email_change`                                                     | current `user.email` gets `token` with the counterintuitive `token_hash_new`; new `user.new_email` gets `token_new` with `token_hash` | two independently addressed producer capabilities; never infer meaning from the `_new` suffix                                                                                           |
| non-secure `email_change`                                                 | new `user.new_email`; use the documented present `token`/`token_hash` or `token_new`/`token_hash` combination                         | one producer capability; any other combination is schema drift                                                                                                                          |
| `reauthentication`                                                        | `user.email`; OTP in `token`; do not invent a link/hash pair                                                                          | paste/autofill-friendly producer code; never retained in history, preview, logs, test fixture, or Recent sent copy                                                                      |
| `password_changed_notification`                                           | `user.email`; no action credential                                                                                                    | security notice with safe help/recovery route; delivery does not prove authorization or awareness                                                                                       |
| `email_changed_notification`                                              | `user.email`; `old_email` is typed context only                                                                                       | producer-owned old/current meaning                                                                                                                                                      |
| `phone_changed_notification`                                              | `user.email`; `old_phone` is typed context only                                                                                       | minimized fact, never a generic variable                                                                                                                                                |
| `identity_linked_notification` / `identity_unlinked_notification`         | `user.email`; `provider` is typed context only                                                                                        | escaped label cannot become a URL or authority                                                                                                                                          |
| `mfa_factor_enrolled_notification` / `mfa_factor_unenrolled_notification` | `user.email`; `factor_type` is typed context only                                                                                     | no credential material                                                                                                                                                                  |

This paragraph governs the **Supabase Auth Send Email Hook**, not Resend delivery
events. The hook verifies Standard Webhooks headers `webhook-id`,
`webhook-timestamp`, and `webhook-signature` against raw bytes and that opaque
endpoint revision's one exact Supabase hook secret before parsing. One
configured endpoint binds one Supabase project/environment; the handler never
scans tenant secrets. It enforces bounded timestamp tolerance, deduplicates the
signed Standard Webhooks id, and stores only a keyed payload digest plus
minimized nonsecret evidence. Same id/same digest resumes or returns the prior
result; same id/different digest is a quarantined replay conflict.

Signing-secret rotation creates a new opaque endpoint revision and secret,
proves it, and atomically promotes that endpoint in Supabase configuration. The
old endpoint remains verify-only for a bounded overlap for already-issued or
in-flight requests and can never create a new semantic occurrence; each route
tries exactly its own secret. After overlap and reconciliation, old endpoint and
secret retire together. A failed proof leaves the current endpoint active.

The five-second producer deadline uses already-published artifacts and one low-latency individual Resend send—no editor compilation, review, foreign conversion, provider-management probe, batch wait, or unrestricted tenant query. HTTP 200 is returned only after the semantic occurrence is already known accepted or a duplicate is known accepted. A possible acceptance becomes `Outcome indeterminate`; replay reuses the frozen payload and Resend key. Release probes pin the producer's actual non-2xx, timeout, and retry behavior rather than assuming a retry schedule.

`BeginLegacyInvitationRedemption` binds tenant, invitation id/revision,
normalized invited email, intended Party/donor, fixed allow-listed origin, the
protected-action selector plus verifier-digest/key versions and recipient epoch,
expected `pending` state, and one idempotency key. The verified landing-session
POST re-proves pending/unexpired/unrevoked/unused/same-tenant/same-email and
CAS-reserves one attempt; the raw fragment verifier is neither an input to this
producer command nor retained by it. Phase 4 uses pinned server-only Supabase
Admin `generateLink({ type: "invite", email, redirectTo })`, then immediately
exchanges the returned hash through the pinned `verifyOtp` invite flow into the
response-bound session. For crash recovery only, one short-lived
envelope-encrypted producer credential slot may hold that bearer hash; it is
bound to the redemption attempt and purged on exchange, failure finality, or
provider expiry, and never enters a Phase 17 row, browser storage, log, or
client-selected redirect. Exact command retry resumes the reserved exchange and
cannot generate a second live proof. Possible success without recoverable proof
becomes `redemption_indeterminate`; Phase 4 reconciles
user/session/invitation binding or explicitly invalidates the uncertain proof
before a successor. Final account bind is idempotent;
expired/revoked/replaced/wrong-context/incompatible-account states return one
privacy-safe Phase 4 recovery route.

## Contract-Bounded Delivery Plans

### Fixed plan model

A Delivery Plan is the complete, versioned selection among a contract's fixed
Delivery Step slots and permitted choices. The code-owned contract declares the
slots and capability envelope; it is not itself a plan. For tenant scope,
authorized tenant staff publish the plan. For platform scope, the exact
meaning-specific platform profile declares one immutable Asym-owned fixed
plan/version; tenant configuration cannot select, inherit, copy, or alter it. A
Delivery Plan is not a workflow, journey, automation, or rules engine. A step
declares:

- stable step key and recipient role;
- channel (`email` or `in_product`; `sms` is prohibited in Phase 17);
- requiredness class;
- one product-owned timing name or source transition;
- one optional simple product-owned condition with plain-language consequences;
- compatible content contract/variant, locale, sender and reply posture;
- consent/preference/suppression behavior;
- expiry/source-recheck rule; and
- independent outcome and repair behavior.

Required steps are visible, explained and locked. Tenants cannot remove, delay, substitute, reclassify or silence them. Optional steps may be enabled/disabled and may expose only the contract's approved recipient, channel, content, named timing, escalation and simple-condition choices. There is no arbitrary event, cron, delay, graph, branch, loop, priority, webhook, audience, regex, formula, experiment, provider, record mutation, or custom recipient.

For each tenant `{tenant, contract, allowed scope}`, exactly one complete plan is
effective through whole-plan inheritance/copy-on-customize. There is no step
field merge or overlapping priority. Tenant plan publication follows the same
draft/commit/impact/D11 publication model. A platform contract resolves only its
profile-declared immutable Asym plan/version, never a tenant plan or tenant
publication. Plan changes affect future applicable occurrences only; existing
intents keep their exact plan pins.

### Compilation and execution

For one source occurrence, the only producer entry point is the bounded
`compileAndReleaseCommunicationPlanOccurrence` service. The generated adapter
submits one separate `plan_occurrence_token@1`, the source occurrence/fence, and
the complete bounded candidate envelope, which may be empty, with one independent
member occurrence-slot token for each possible contract-permitted
recipient-step binding. The opaque top-level token is 1–128 canonical UTF-8
bytes, contains no PII, secret, address, provider id, or caller-composed scope or
authority, and is unique for one authoritative occurrence within the stable
producer namespace. The producer durably retains and re-emits the original bytes
for exact replay; Phase 6 stores only the schema id/version and derived
`plan_occurrence_slot_hash@1`, never the raw token. The token identifies the
authoritative source occurrence independently of its eventual member set. A
server-created top-level plan-occurrence context proves scope, environment,
producer event, contract, and effective-plan authority even when there are zero
candidates. The server resolves the fixed contract, exact plan version, binding
versions, conditions, and concrete recipient authorities independently; it
rejects a missing, extra, duplicate, stale, mismatched, unauthorized, or
over-limit candidate before persistence.
Each generated binding declares a finite `max_recipient_count_per_occurrence`,
and one measured global compiler ceiling applies; tenants cannot change either
and the compiler never chunks one logical occurrence into separately released
groups.

One small `communication_plan_occurrences` header is the concurrency and empty-
result lock. Its `plan_occurrence_slot_hash@1` covers only exact execution scope,
environment, stable producer namespace, and the plan-occurrence token bytes;
plan, binding, condition, recipient, and membership facts live in a separate
`compilation_hash@1`. The header also freezes source fence, manifest/contract/
effective-plan versions, expected-member count, canonical ordered-member-set
digest, token schema id/version, and `released_at`; it never stores the raw
plan-occurrence token. A zero-member result is therefore durable and exactly
replayable instead of looking like a crash.

After every candidate is valid, one database transaction uses the fixed lock
order source fence → effective plan/generation → occurrence header → canonical
member slots; inserts or locks the unique header; inserts or exactly replays
every independently keyed child with a same-scope header FK and gap-free member
ordinal; re-reads count/order/digest; and sets `released_at` last. Claims join to
the parent and exclude plan children whose parent is unreleased. A crash or
error before commit leaves no visible header or child. A crash after commit but
before response returns the same header and complete child set on exact retry.
Changed source, plan, binding, condition, recipient, count, order, membership,
or child hash under the occupied occurrence slot is a hard conflict; a
legitimate later occurrence uses a new plan-occurrence token and new member
tokens. A committed unreleased header is an alerted invariant violation, never a
normal state or force-release path. This is coordination metadata inside the
Phase 6 spine—not a workflow run, outcome ledger, scheduler, outbox, or queue.

The compiler therefore durably records all applicable concrete recipient-step
identities and plan pins before any becomes eligible. Every eligible step creates
its recipient-specific Phase 6 intent. An external-delivery intent proceeds
through its channel executor. An `in_product` intent creates one local
`available` event and its independent Asym/Postgres role-safe Phase 17 attention
projection; it creates no provider submission, provider state, or provider
outcome. Semantic identity includes plan version, step, and concrete recipient.
One child can be suppressed, fail, deliver, expire, or repair without changing
siblings.

Before an external dispatch, Phase 6 re-proves source applicability/fence,
current recipient relationship and role, destination revision, consent,
preference, suppression, connection, sender, reply, publication, and action
validity. Before an in-product projection is shown or acted on, its owning
projection seam re-proves current tenant, Party, role, surface, and source
access. In-product read/archive never completes the source task. Repair targets
the same failed step; it does not create a new semantic message. Provider
timeout is indeterminate.

Plan publication compares the complete current and candidate plans, simulates every declared source case across required/optional steps, recipient roles, locale/fallback outcomes, channel availability, consent/preference/suppression, missing contact, and connection failure, and records a synthetic impact artifact. **Restore as draft** copies an earlier complete plan version; it never mutates history or changes already-created intents. Occurrence detail groups all sibling steps under the producer occurrence while preserving each recipient/channel outcome, so staff can understand one plan without treating sibling success as universal success.

### Staff builder

The Delivery Plan Builder is a responsive vertical outline:

- a locked **When this happens** source summary;
- separate **Required delivery** and **Optional delivery** cards;
- five consistent questions: who, channel, when, content, and what happens if unavailable;
- **Add delivery** only when the contract has an unused optional slot;
- advanced contract choices collapsed by default;
- ordinary-language consequences and a synthetic scenario preview;
- generated diagram as optional explanation only;
- non-drag controls and full mobile/keyboard parity; and
- one impact review explaining future effect, required protections and current-live continuity.

The builder always offers **Compare to published**, **Test with sample cases**, and **Restore an earlier version as a new draft**. Publication shows the exact future-effective boundary and explicitly says existing scheduled/prepared messages keep their pins. A plan cannot publish while any required simulation is missing, while a required step has no compatible Live contract/publication, or while the candidate would silently reduce a protected delivery obligation.

Do not build a sequence canvas, node graph, generic condition language or Phase 34-compatible runtime kernel. Phase 34 may call a governed Live system-message action; it owns workflow enrollment and timing.

## In-Product Notifications

### One communication truth, three state axes

An in-product notification is a role-scoped attention projection of a Phase 6 communication event. It is not the source record, a task, a workflow, an email mirror, permission, action authority, or completion truth.

Keep independent:

1. **Availability:** whether the item is currently visible to this exact tenant+Party+role.
2. **Engagement:** unseen/seen/read/archived by this exact viewer role.
3. **Source status:** current business state owned by the producer.

Read, archive, email delivery, or link open never means resolved, approved, paid, received, donor aware, or action complete. A resolved-before-view item must not create stale unread work.

The code-owned attention vocabulary is finite: **Information** for durable context with no present action, **Attention** for a useful action or recoverable problem, and **Urgent** only for a producer-proved, time-sensitive safety/authorization/operational consequence. Tenants may tune eligible optional presentation and recipients may tune eligible personal channel preferences, but neither may downgrade or suppress a contract-required safety item. Every projection evaluates in this fixed order: product contract/requiredness → tenant configuration → recipient preference → current role/access/privacy/source applicability. A later layer can narrow only where the earlier contract permits it; no preference grants access or invents a recipient.

Migration is future-only. Cutover creates items only from new post-fence producer transitions or an explicitly bounded, contract-approved still-actionable backfill; it never replays historical communication rows into a wall of unread notifications. The migration records the one active projection writer and fence, shadow-compares counts/content without exposing shadow items, then disables the legacy writer before new items become visible. Engagement history is not fabricated from email opens, old queue rows, or inferred user behavior.

### Two closed presentation policies

Every Live in-product step selects exactly one code-owned presentation policy
and one key-specific source-applicability/end rule. There is no tenant duration
matrix, policy DSL, snooze engine, or inferred default. Email Recent sent-copy
policy is unrelated. The initial vocabulary contains exactly:

1. `presentation.source_actionable_then_recent_90d@1`. The item/group appears in
   **Needs attention** and **All** while the exact source predicate remains
   actionable and current recipient authority/access still holds. Read clears
   only unread/badge state; it never removes the item from **Needs attention** or
   resolves the source. Archive is unavailable while required action remains.
   The protected presentation core supplies one visible, accessibly associated
   contract-specific explanation: approval uses **This stays here until the
   approval is completed or canceled**; publication review uses **This stays here
   until this review is completed or the draft changes**; publication changes
   requested uses **This stays here until a revised draft is submitted or this
   draft is withdrawn**; delivery repair uses **This stays here until this
   delivery issue is resolved**. When the source
   becomes terminal, superseded, expired, or no longer applicable, active
   attention ends atomically. Any protected action
   becomes inert/current-state only and the non-unread item remains recent
   history for 90 days from `presentation_ended_at` while the same viewer remains
   authorized. If it ended before first view, it creates no unread/badge debt and
   remains truthfully unseen; the system never fabricates a read.
2. `presentation.information_30d_then_recent_90d@1`. The item appears only in
   **All**, never **Needs attention**. It may contribute one unread group/badge
   until the earliest of read, archive, correction/supersession, or
   `available_at + 30 days`. It remains ordinary authorized recent history until
   `available_at + 90 days`. Archive is reversible and cannot extend either
   deadline. A correction/supersession ends unread treatment early without
   rewriting the original evidence.

At the 90-day ceiling the read/query path returns **not presentable** even if a
purge worker is late. Purge removes the role-safe preview and search material;
the separately governed body-free Phase 6 event/audit and permitted tombstone or
engagement evidence remain. Read/unread, archive/restore, grouping, retries,
tenant settings, worker delay, and local-time display cannot extend a deadline.
Instants are stored/compared in UTC and localized only for display. These are
deliberate v1 product durations, not a claim that every comparable product uses
the same durations.

### Identity and authorization

Each item binds tenant, Party, role, contract/variant, Phase 6 event, source id+fence, plan+step, meaningful transition, privacy class, destination code, validated site/locale, creation/expiry and immutable safe preview. The permanent tuple hard-conflicts if reused with changed meaning.

Every list, count, search, render, mutation, realtime invalidation, support view, repair and destination click re-proves active tenant, authenticated identity, exact role/relationship and current permission. There is no global feed or cross-tenant badge. Tenant switch, role revocation, later account claim, merge/relink and anonymization fail closed and do not silently transfer unread history. Losing the bound access revision removes active and recent presentation immediately, with no 90-day exception. Later authority requires a new producer-authorized occurrence; it never revives an old recipient projection.

Destinations are typed product codes resolved server-side. Arbitrary URLs are rejected. Realtime contains identifiers only and acts as invalidation; the database commit is authoritative and cursor recovery handles missed events. Logs and metrics contain no message content or recipient PII.

### Attention Groups

Create a group only for one genuine producer episode where multiple child items form one triage unit. Never group across tenant, role, privacy boundary, contract meaning or source episode. Presentation policy remains item-level. A group contributes one badge count while preserving child evidence and remains in **Needs attention** only while it has a current source-actionable child. A contract-defined new meaningful transition creates a new item and may reopen the group; it never mutates, revives, or extends an old child's presentation period.

Phase 16 retry attempts never create missionary notification noise. Only the terminal `Missed` occurrence may create the required, privacy-safe missionary item; it says the donor was notified only if delivery evidence actually proves that fact, and otherwise uses truthful wording such as “The donor has been sent a notice” or “A donor notice could not be delivered” based on exact evidence. No automatic outreach task is created.

### Launch surfaces

Phase 17 ships the complete staff bell and notification center for the Target Live in-product contracts. It ships donor/missionary contextual notices only for explicit current contracts. Full donor and missionary global centers wait for Phases 25/28 but reuse these same records.

The staff UI includes active-tenant bell, exact accessible unread-group count, privacy-safe preview, **Needs attention** and **All**, keyset pagination, read/archive controls where the selected policy permits them, full-page filters/search/history/preferences, bulk mark read/archive with undo where safe, and complete loading/empty/error/offline states. **Needs attention** includes every currently actionable group regardless of read state; unread alone controls the badge. Active required items omit—not merely disable—the archive action and show the contract-specific concise explanation above. Source resolution uses a polite status update without focus theft and keeps stable focus if an open item changes state. Mobile has equivalent page/sheet behavior; dates are accessible and localized, state never relies on color, and expiry alone creates no toast or sound.

## SMS Reservation — Transport Structurally Dark

Phase 17 establishes provider-neutral evidence contracts needed for future SMS without implementing transport. Keep five independent facts:

1. platform capability;
2. exact sender-route readiness;
3. recipient affirmative consent and provenance;
4. recipient channel preference; and
5. suppression/withdrawal.

Future eligibility would require all five plus a Live contract/step and current recipient/contact proof. In Phase 17, platform SMS capability is false by construction: there is no adapter, renderer, template, binding, preview, test send, credential, Twilio SDK/API call, callback, worker, queue, retry, batch, onboarding, enable switch or provider-state editor. Server, API, import and database paths reject an `sms` execution request. No tenant placeholder registration rows are created.

Consent evidence is append-only and binds tenant, Party, exact phone revision, sender, subject/use case, message class, disclosure version, method/source, time, market, actor and lineage. Email consent, a phone number, preferred channel, note, other tenant's consent, donation, prior message, or staff assertion never creates SMS consent. `do_not_contact` remains an absolute floor.

Suppression preserves exact scope, reason, source, time, actor, provider evidence and lineage. STOP or a reasonable withdrawal is hard; HELP changes nothing; START/UNSTOP does not reconstruct every required consent. Duplicates and out-of-order facts reduce fail-closed. Tenants cannot edit STOP/HELP semantics. Readiness evidence is exact tenant+sender+use case+market+route+policy and partial/stale evidence is not Ready.

ADR-0028 preserves a non-executable launch gate for the later SMS phase. That phase must freshly prove, for each tenant/sender/use-case/market/route component: current law/carrier/provider research; tenant and provider account authority; completed registration rather than an aggregate progress guess; approved sender/use-case/content class; exact affirmative consent and phone-revision ownership; immutable STOP/HELP/withdrawal behavior; recipient preference and broad `do_not_contact`; required-message suppression policy; signed callbacks and normalized duplicate/out-of-order evidence; idempotent send/retry/finality; rate/quiet-hour/time-zone rules; tenant isolation; retention/audit/export/deletion; accessible donor/staff UX; real test-number isolation; operations owner, alert, support and shutdown; and migration/rollback. Every component must be Ready together before transport can activate.

The later proof suite must include partial or rejected registration, registration/provider drift, reassigned/recycled phone, Party merge/relink, consent captured for a different sender/use case/market, STOP racing a queued send, HELP/START ambiguity, required-message suppression, duplicate/reordered callback, delivery timeout, provider outage/rate limit, test-to-production leakage, tenant switch and credential compromise. These are preservation requirements only: Phase 17 adds no Twilio state machine, provider client, worker, registration editor or dormant execution branch.

The only tenant-facing Phase 17 treatment is a quiet, noninteractive **SMS — Planned, not available** explanation where future channels are relevant. No prominent navigation, setup checklist, progress bar, activation control or donor enrollment exists. A later separately authorized Twilio phase must re-research current carrier/legal rules and pass every gate in ADR-0028.

## Tenant-Owned Resend Connection

### Topology and ownership

Every tenant owns one Resend account/team, plan/quota/reputation, dedicated transactional domain, API key, webhook and provider dashboard. Asym owns the guided setup, encrypted secret custody, contract/purpose policy, content, exact sender/reply enforcement, Phase 6 intent/history, provider-evidence reducer and repair.

There is no shared Asym tenant-message account, silent credential switch, cross-account retry or failover. Tenant-branded donor/auth/giving mail cannot go Live until the tenant connection is Ready. Asym customer-account bootstrap/security mail is a distinct forward platform boundary and never a fallback for tenant messages; this v1 platform-recipient model and current manifest do not authorize it. It remains non-dispatchable until a later contract defines its exact app-account recipient/trigger authority, union branch, stable keys, and proof packs.

Platform v1 system email supports only a future Live Eve platform-owner contract
and uses one separately proved Asym-owned Resend connection, transactional
domain, fixed sender/reply policy, and service-only publication namespace. That
connection can address only the exact current `eve_platform_owner` authority
under an exact Live contract; it cannot send tenant, donor, missionary, or
unmodeled customer-account mail, resolve a tenant publication, or rescue a tenant
whose connection is unavailable. Phase 17 owns the catalog/contract, fixed
publication resolution, canonical compiler, and platform delivery-profile/
connection configuration and proof. Phase 6 owns recipient-specific intent,
preparation orchestration through those Phase 17 resolvers, outbox/claim,
submission fence, idempotency, Resend invocation, provider attempt/evidence/
outcome reduction, reconciliation, and body-free communication history. Neither
creates a second ledger or lifecycle.

`tenant_email_settings` remains the one mutable tenant connection aggregate.
Its structured `validation_snapshot` is the canonical readiness/proof source.
Existing scalar deliverability fields remain a temporary derived compatibility
projection for legacy readers only. One settings-store write path validates and
persists the snapshot and derived scalars atomically; direct scalar writes are
forbidden. Migration backfills only proved facts, shadow-compares every legacy
reader, and blocks release on divergence before those scalars are retired after
all readers move. Bounded secret/webhook revisions and proof observations are
subordinate. Immutable Phase 6 delivery snapshots contain no secret and several
historical versions may coexist.

### Six-step setup

1. **Create or choose your Resend account.** Explain tenant ownership, billing, quota and dashboard responsibility.
2. **Add a dedicated transactional subdomain.** Recommend isolation from marketing reputation and explain SPF/DKIM/DMARC work plainly.
3. **Create a Sending-access key restricted to that domain.** Paste once over TLS; recommend password-manager handoff. Probe bounded management behavior to reject known Full-access keys. If exact domain scope cannot be read, label **Scope attested**, never “verified.”
4. **Connect the signed webhook.** Show one opaque per-connection URL and secret setup instructions; never expose another tenant's route or accept a tenant selector in payload metadata.
5. **Create the Default Sender and human reply mailbox.** Validate exact domain, confirm reply access separately, and explain that From and Reply-To serve different purposes.
6. **Test and activate.** Send a controlled inert canary to an Asym-approved real sink, observe accepted send plus signed webhook, inspect headers/plain text/tracking posture, and derive Ready.

The flow saves progress, never repeats completed proof without cause, provides one truthful status card and one next action, and supports keyboard/mobile/interrupted use.

### Secret and webhook safety

API keys are accepted once, envelope-encrypted with a unique per-secret-revision data-encryption key (DEK), a managed wrapping key (KEK), exact scope-kind/scope-owner/connection/environment/revision associated data and key version; they are excluded from URLs/client state/telemetry/logs/support/export and displayed only by a nonsecret hint. Compromise pauses sending and requires immediate provider revocation plus replacement. Rotation is overlap-first: store the matching-owner pending revision, prove it, atomically cut over, preserve old identity for in-flight/indeterminate work, drain/reconcile, then destroy the wrapped DEK and ciphertext after policy and matching-owner provider-revocation attestation. Backup restore must reapply the destruction ledger before decryption is enabled. Use the platform's managed envelope-encryption service—never custom cryptography.

Secret lifecycle uses four truthful, non-interchangeable states: **Retired from use** means no new operation can select the revision but bounded reconciliation/rollback authority can remain; **Purged from live systems** means ciphertext, wrapped-key references, durable plaintext caches, temporary files, secret-manager versions, and queued copies are deleted or inaccessible while a nonsecret tombstone remains; **Backup expiry pending** means a backup/escrow could still contain recoverable key material; and **Cryptographic erasure verified** means every managed key copy that could decrypt the ciphertext—including replicas, exports, escrow, and backups—has been irreversibly destroyed or denied by a non-rollbackable managed-key control and a restore test cannot decrypt it. Plaintext exists only inside a bounded worker operation, is never durably cached, and rotation/purge invalidates leases and drains or terminates processes that could still hold it; the product does not claim it can inspect garbage-collected memory. Deleting a row/ciphertext is not cryptographic erasure while a backup still holds a wrapped DEK and usable KEK. The destruction ledger lives outside the rollback domain, is applied before restored workers can decrypt, and records partial failure visibly. Permanent audit retains only nonsecret scope kind/owner, connection, purpose, revision, hint, lifecycle times, state, managed evidence reference, actor/reason, provider-revocation attestation, and restore-test result.

This Resend delivery-event endpoint is a distinct protocol, secret, route, and
dedupe namespace from the Supabase Auth hook above. One opaque webhook route
selects one candidate Resend connection secret, verifies the raw body with the
Resend SDK's documented Svix headers (`svix-id`, `svix-timestamp`, and
`svix-signature`) before parsing or owner lookup, deduplicates that Svix event
id, binds an existing same-scope send by provider id, and applies a monotonic
reducer. Resend email id, RFC Message-ID, and Svix event id are distinct.
Metadata never authorizes tenant or platform-owner selection. Unknown,
duplicate, reordered, or conflicting events are retained as minimized evidence
or quarantined; they never fabricate delivery.

### Readiness

Connection posture is one of `Setup incomplete`, `Ready`, `Needs owner action`, `Paused for protection`, `Provider unavailable`, or `Outcome indeterminate`. Tenant UI renders `Needs tenant action`; the service-only platform surface renders `Needs operator action`. Ready requires current decryptable Sending-access credential, exact domain/From compatibility, SPF/DKIM evidence, DMARC posture, tracking-disabled proof, accepted canary, signed required webhook events, compatible delivery snapshot and no blocking incident. A provider outage, DNS drift or stale proof changes posture without erasing configuration.

Do not invent a deliverability score, continuous inbox test, DNS-management clone or promise that mail reaches inbox. Show exact known evidence, age, impact and accountable next action. Required work remains durable and not falsely Sent; optional behavior follows its contract.

### Provider event reducer and suppression boundary

Provider evidence never collapses into one mutable status. For each attempt retain independent provider submission (`definitely_unsubmitted`, `may_have_submitted`, `accepted`, `definitely_rejected`), mail-server delivery (`pending`, `delayed`, `delivered`, `failed`, `bounced`, `suppressed`), reputation (`none_observed`, `complained`), advisory engagement (`not_observed`, `opened_observed`, `clicked_observed`), and evidence health (`current`, `duplicate`, `out_of_order`, `unknown_schema`, `conflicting`). `delivered` means accepted by the receiving mail server—not inbox placement, reading, understanding, consent, or product completion. Tracking remains disabled; unexpected open/click evidence is advisory drift only.

| Verified same-connection Resend event    | Monotonic reducer effect                                                                                                                                                                                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `email.sent`                             | submission becomes `accepted`; delivery becomes `pending` only if no stronger fact exists                                                                                                                                                                                                         |
| `email.delivery_delayed`                 | `pending -> delayed`; repeats are idempotent; a late delay after a terminal fact is retained as out-of-order evidence without regression                                                                                                                                                          |
| `email.delivered`                        | `pending`/`delayed -> delivered`; a different terminal delivery fact is a conflict, never last-write-wins                                                                                                                                                                                         |
| `email.failed`                           | terminal `failed` with a safe typed cause/owner; never infer bounce, complaint, or consent                                                                                                                                                                                                        |
| `email.bounced`                          | terminal `bounced`; tenant scope appends provider-suppression/contact-risk evidence for the exact connection/region/contact-address revision, while platform scope appends service-only reputation evidence for the exact platform recipient authority/connection and no Phase 3 contact evidence |
| `email.suppressed`                       | terminal `suppressed`; record that the provider's regional suppression list prevented delivery under the exact scope branch; tenant scope may append contact suppression evidence, while platform scope records only service-owned authority/connection evidence                                  |
| `email.complained`                       | reputation becomes `complained`; because the provider defines this as post-delivery, it may establish `delivered` from pending/delayed and appends the same branch-specific suppression/reputation evidence; a conflicting terminal fact quarantines                                              |
| `email.opened` / `email.clicked`         | advisory engagement plus tracking-drift alert only                                                                                                                                                                                                                                                |
| `email.scheduled`                        | unexpected because Asym schedules; record provider-feature drift and do not alter product schedule truth                                                                                                                                                                                          |
| `email.received` or unknown event/schema | outside Phase 17 outbound scope; quarantine/minimize and make no lifecycle transition                                                                                                                                                                                                             |

Raw-body Resend/Svix signature verification precedes parse. The opaque endpoint
selects exactly one candidate connection secret and therefore the structural
scope; no payload field, tag, recipient, domain, or provider id selects tenant
or platform owner. Deduplicate `{scope_kind, scope_owner_id,
connection_revision, svix_id}`, bind the Resend id to one existing same-scope
attempt through the durable provider-message identity, and preserve
provider-created and Asym-received times separately. Late evidence may add
facts but cannot regress a terminal axis; contradictory terminal evidence opens
one deterministic repair case.

Keep four authorities separate: Phase 3 consent/preference/`do_not_contact`; contact-address validity/ownership; provider suppression; and the attempt's delivery result. A hard bounce or complaint can suppress an address across every sending domain in the tenant's Resend region, so suppression is never scoped to a Sender Profile and there is no profile force-send/removal control. Dispatch re-proves product eligibility and that Asym holds no known blocking current provider-suppression evidence; a send-only key cannot prove the provider list is complete, so the UI never claims an address is absent from Resend suppression. Complaint absence is not proof of zero complaints, because some receiving services do not return complaint evidence. Changing profile/settings or later success never clears suppression. A corrected address creates a new contact revision; reuse of the same address after provider-side removal requires owning Phase 3/contact authority and recorded remediation. Old failed occurrences are not replayed merely because future eligibility changes.

### Contract-owned transport headers

Only the Resend adapter builds headers; callers, templates, imports, browser clients, Delivery Plans, and producers cannot provide arbitrary headers or composed From/Reply-To strings. First-class From and Reply-To plus the exact header output are sealed into the prepared payload. The allow-list is intentionally small:

| Header                  | Rule                                                                                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Auto-Submitted`        | platform-generated messages emit exactly `auto-generated` unless a checked-in contract documents a standards-valid exception; a delivered canary through the pinned Resend path must prove preservation |
| `List-Unsubscribe`      | required for optional subscribed/marketing contracts; one HTTPS URI with an opaque, hard-to-forge recipient-and-subscription-scope token and no PII                                                     |
| `List-Unsubscribe-Post` | emitted with the exact value `List-Unsubscribe=One-Click` whenever the unsubscribe header is present                                                                                                    |

Optional subscribed/marketing email also includes an accessible visible unsubscribe action in HTML and plain text. Its RFC 8058 endpoint is a narrow D6 exception: GET is inert; cookieless, unauthenticated, non-redirecting POST accepts the exact single `List-Unsubscribe=One-Click` field in either `multipart/form-data` or `application/x-www-form-urlencoded`, rejects extra fields, and idempotently withdraws only the token-bound tenant/recipient/contact-revision/list-purpose/consent scope; repeated valid POST returns safe 2xx; invalid/expired/wrong-scope input reveals no recipient existence. These headers are covered by the delivered message's DKIM signature. Required transactional messages cannot be relabeled marketing to reuse this path.

Header names/values reject CR, LF, NUL, and duplicates. Competing raw From, Reply-To, `Auto-Submitted`, `List-Unsubscribe`, or `List-Unsubscribe-Post` fails preparation. Header-builder version and canonical output are pinned and remain byte-identical across retry.

### Provider operations and future credential seam

The Full-access rejection probe is the code-owned side-effect-free `GET /domains` call through the exact pinned adapter. A successful response proves the key is overprivileged and blocks activation. HTTP 401 with documented type `restricted_api_key` plus a successful controlled exact-sender canary may prove Sending access, although exact domain restriction stays **Scope attested** unless positively observable. Invalid credentials are incomplete; rate/quota, network, provider, timeout, or unknown-schema outcomes are ambiguous and cannot activate. The package manifest currently declares `resend` as `^6.9.2`, while the repository `bun.lock` resolves that range to `resend@6.11.0`; the lock resolution is the planning fixture pin. Any manifest range or lock resolution change regenerates and reapproves fixtures. Milestone M0 checks in the SDK/API pin, `GET /domains`, individual/batch send, webhook-signature, event, success, and error fixtures—including `restricted_api_key`, `invalid_api_key`, `validation_error`, `invalid_idempotent_request`, `concurrent_idempotent_requests`, `daily_quota_exceeded`, `monthly_quota_exceeded`, `rate_limit_exceeded`, 5xx, network, and timeout. No connection activates until these pass. Generic truthy-object or `id`/`data.id` guessing is prohibited.

Every provider response may update a bounded per-connection limiter from current `ratelimit-limit`, `ratelimit-remaining`, `ratelimit-reset`, `retry-after`, `x-resend-daily-quota`, and `x-resend-monthly-quota` headers. Quota headers are used-count evidence, not remaining capacity, and the daily header may be absent outside the free plan. Missing headers preserve only the last bounded observation; they never invent capacity. `429` distinguishes `rate_limit_exceeded`, `daily_quota_exceeded`, and `monthly_quota_exceeded`. Product code does not hard-code one permanent limit or share one tenant's capacity with another.

Repeated webhook failures or current provider evidence that the endpoint is disabled changes readiness to **Needs tenant action**; Phase 17 does not hard-code a provider disablement interval. Repair shows missing evidence and affected/indeterminate messages, provider-dashboard re-enable steps, one controlled signed test, and provider-event replay/local reconciliation without blind resend. Ready returns only after a fresh signed test binds to its controlled send and backlog reconciliation completes. Bounded proofs run only at setup, material key/domain/webhook/sender/tracking change, concrete drift/incident, explicit repair, or named proof expiry—not continuously or per profile.

Phase 17 has one instantiable credential kind: `resend_sending_key`. The versioned connection interface reserves only the type name `resend_oauth_send_grant` for a separately authorized future migration using Resend OAuth authorization-code flow with PKCE S256 and send-only `emails:send` scope. Phase 17 implements no OAuth client, redirect, exchange, refresh worker, grant row, UI choice, `full_access` request, or dual-active path, and API/import/migration/database/worker paths must reject the reserved variant. Templates, plans, attempts, events, and history depend on the Resend connection interface rather than the secret shape; this is one typed seam, not a provider-neutral abstraction.

| Connection operation                | Required fences and transitions                                                                                                                                                                                                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ordinary key rotation               | prove a pending key, atomically use it for new preparations, retain old authority only for bounded rollback/in-flight/indeterminate reconciliation, then purge local authority and record tenant provider-revocation attestation                                                                             |
| suspected compromise                | immediately pause new preparation/submission, require provider revocation/replacement, reconcile every possible old submission, and never retain compromised authority for convenience                                                                                                                       |
| disconnect                          | impact review and authorized stepped-up confirmation; fence new claims/preparation/submission; revoke definitely unsubmitted work without deleting evidence; reconcile submitted/indeterminate old identity; preserve history/content/plans; purge under finality rules and instruct tenant provider cleanup |
| domain, region, or Resend-team move | create a pending revision, disclose Domain Claim/support/DNS interruption, prove key/SPF/DKIM/domain/tracking/sender/webhook/canary, atomically cut new work over, and reconcile old pinned work through the old identity without cross-account replay                                                       |

A region move is a domain replacement, not an in-place edit. Domain Claim proves only the provider-documented domain fact; it does not prove Asym tenant authority, Reply-To access, inbox delivery, or historical-send ownership.

## Sender Profiles and Human Replies

### Sender Profiles

Every tenant has one required Ready **Default Sender** on the connected D10 domain. Additional same-domain profiles exist only for a real site or closed Sender Purpose used by a Live contract. The launch vocabulary is deliberately small:

- `giving_and_receipts` — donor giving, receipt and contribution-correction service mail;
- `account_security` — adopted auth/claim/security contracts when they become Live; and
- `staff_operations` — staff operational notices when email is a Live step.

A purpose with no Live consumer remains unavailable; the labels above are code-owned, not tenant taxonomy. A profile stores internal label, display name, canonical exact From mailbox on the verified domain, eligible purposes/scopes, append-only revisions, readiness/proof and usage history. It contains no API key, Reply-To, recipient fact, locale rule or provider-specific profile id.

Resolution is fixed and sparse:

1. exact site + purpose assignment;
2. site default assignment;
3. organization purpose assignment;
4. organization Default Sender.

Missing optional assignment inherits. An explicit assignment to a non-Ready profile is a hard D15 failure, not absence that silently falls through. Exact overlaps are forbidden. Preparation pins the assignment reason, profile revision, display/address, D10 connection revision and proof. Request/template/import/test callers cannot override From.

Profile lifecycle is `Draft`, `Testing`, `Ready`, `Needs attention`, or `Retired`, separate from catalog/publication/connection state. Activation validates headers and same-domain identity, runs the real canary, observes signed evidence, and atomically assigns. Prior Ready remains until cutover. A used profile cannot be deleted; **Replace and retire** atomically moves assignments to a Ready replacement. Default requires a Ready replacement. Material identity changes follow D11 when protected; internal-label changes do not create needless review.

The server accepts `display_name` and canonical mailbox as separate fields and uses one pinned mail-address encoder; it never accepts a composed authoritative header string. Display names normalize to NFC with a pinned Unicode/security-data version and reject CR/LF/NUL, C0/C1 controls, line/paragraph separators, noncharacters/unassigned code points, bidi embedding/override/isolate controls, angle-bracket/header syntax, comments/groups/multiple-address forms, values that do not round-trip exactly, recipient variables/merge syntax, donor facts, amount/date/urgency copy, `Re:`/`Fwd:` simulation, and impersonated platform verification/security wording. Bound both Unicode scalar count and final encoded-header bytes. Compare a UTS #39 confusable skeleton with protected organization, Asym, and active-profile identities. A collision or unusual script mixture receives inbox preview, plain explanation, recipient-visible identity review, and D11 protection when deceptive; it is not an ASCII-only ban. Natural localized names remain supported, while hard-invalid injection is never reviewable. The delivered canary captures the provider-generated Message-ID after submission and compares the received decoded display name, exact mailbox, Reply-To, authentication results, tracking posture, and canonical semantic content hashes rather than requiring byte-identical transport-normalized HTML/text. Provider mutation of intended sender identity blocks Ready; protected review can address only a confusable-name warning, never hard-invalid syntax or mutation.

The UI leads with Default, shows exact visible identity, state, uses, site/purpose assignments, independently resolved Reply-To, last proof and one action. Add asks only internal name, display name, local part and eligible uses. A live inbox-style preview and **Why this sender?** trace make resolution transparent. The message editor has no From field.

### Human reply purposes

Every Live email contract declares either `Replies supported` with exactly one code-owned purpose or `Replies not expected` with a narrow reason. Launch purposes are derived from actual operational owners:

- `giving_help` — questions about gifts, receipts and contribution corrections;
- `account_help` — tenant account-claim/auth help once those contracts become Live; and
- `staff_operations_help` — staff operational notices when email is enabled.

One confirmed **Default human replies** destination handles all unmapped supported purposes. Specialized destinations appear only when a Live contract has a materially different accountable team. There is no custom purpose taxonomy, per-template mailbox, dynamic donor/staff address, list, alias engine or multiple Reply-To header.

Access confirmation sends a fixed no-PII challenge to exactly one parsed mailbox. The short-lived single-use challenge proves access at that moment, not ownership or continuous monitoring. Staff separately name the responsible team/person and acknowledge monitoring responsibility. Replacement is atomic: the old Ready revision remains active until the new revision is confirmed. Reconfirmation occurs only on address/material custody change, security incident or evidence invalidation—not a burdensome calendar ritual.

Only a stepped-up actor with `system_messages.reply.manage` and current tenant-wide delivery-settings authority can start or complete the challenge. The server first parses one mailbox, then binds tenant, initiating human principal, destination revision, normalized address, challenge id, issuance/expiry, and attempt count. There is at most one live challenge per destination revision. Code-owned per-actor, tenant, address, and global burst limits, resend cooldown, verification-attempt cap, and spray/many-target/repeated-failure/cross-tenant alerts apply without exposing exact limits. The high-entropy single-use code is stored as a keyed verifier and excluded from browser storage, history, Recent copy, export, logs, telemetry, and support. Completion requires the same initiating human principal with a fresh authenticated session, current capability, and fresh step-up; there is no challenge-transfer workflow, and forwarding the email is insufficient. A link may only open the authenticated page on GET, while POST re-proves actor, tenant, revision, challenge, and expected state. Responses do not reveal cross-tenant address use. The UI shows one resend timer, plain validity, **Use a different mailbox**, and **Send again** only when eligible; provider/network failure preserves the address/team label but never the code. Replacement leaves the prior Ready destination active through challenge, monitoring-responsibility confirmation, impact review, applicable D11 review, and atomic cutover.

Reply-To may be cross-domain and is independent of From. Parse one mailbox with a pinned canonicalization/IDNA policy while preserving valid local-part semantics; reject controls, CR/LF, groups, comments, multiple addresses and unsupported forms. Only the adapter sets the first-class Resend `reply_to` field. No arbitrary headers. Preparation freezes purpose, destination revision, exact address and proof in a restricted nonsecret delivery snapshot. Retries and batch items reuse it.

Replies leave Asym and enter the tenant's external mailbox. Phase 17 performs no MX/Receiving setup, polling, OAuth, provider inbox mirror, body/attachment capture, threading, assignment, ticketing or response send. Reply content is not Phase 6 communication history and never authorizes a product action. Phase 26 owns any future inbound system.

## Durable Evidence, Recent Sent Copy and Recovery

### Body-free durable history

Phase 6 remains the durable communication spine. Every permanent event records `scope_kind` and exactly one scope owner. A tenant event records `tenant_id`, permitted site and Party/contact-revision references and leaves platform ownership/authority fields null. A platform event records `platform_scope_id`, the exact platform-recipient authority and platform delivery-profile revisions and leaves tenant/site/Party/contact fields null. Every channel retains contract key/version/generation, source reference/fence, plan/step, purpose/classification, requested/effective locale and resolution-trace hash, publication/dependency hashes, semantic intent/member identity, timestamps, safe title/classification, integrity hashes, and correction/supersession links. External-delivery events additionally retain nonsecret sender/reply snapshot references, preparation/provider identities and normalized provider state. `in_product` events retain their local `available`/presentation truth and never carry provider preparation, sender/connection, provider identity, state, or outcome.

It does not durably store personalized body, personalized subject, protected URL, credentials, arbitrary provider payload, full click URL, IP, user agent, raw headers, recipient secret, care/restricted data, or official document bytes. Legacy over-retention is classified honestly and migrated prospectively; history is not rewritten to fabricate compliance.

### Recent sent copy

Tenant policy is **30 days — Recommended** (the default), **7 days**, or **Do not store readable copies**, bounded by a per-contract ceiling of zero, seven, or thirty days. The effective duration is the shorter of the organization choice and contract ceiling; unknown or invalid contract classification defaults to zero. Shortening applies immediately after a count-only confirmation, while lengthening affects future copies only and never resurrects or extends an existing expiry. Security/auth, restricted/care, high-risk privacy and other denied classes are always Off. The eligible copy is separately encrypted and access-controlled, sealed once at the prepared/provider-crossing boundary, contains a support-safe subject/body with protected action secrets removed or inert, and has an exact automatic purge time. It is not retry material, official artifact, communication truth, search/export corpus or provider fetch cache.

This feature is tenant-only. Every platform-scoped contract in this generation is
forced to `no_readable_copy`, creates no `communication_recent_sent_copies` row,
and exposes only service-only body-free history. A future readable platform copy
requires a separately ratified service-owned retention, encryption,
authorization, support-access and purge contract; it cannot inherit a tenant
setting or tenant support capability.

The contract chooses exactly one code-owned class:

| Recent-copy class       | Maximum | Eligible material                                                                                                                                                                                                                                                      |
| ----------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ordinary_support_copy` | 30 days | support-safe receipt wrapper, ordinary contribution-correction/service email, and ordinary staff operational email; Phase 7 source facts/issuance effects, the Phase 18 exact artifact/currentness/access record, and any Phase 19 run remain separately authoritative |
| `limited_support_copy`  | 7 days  | a contract-proved service/approval wrapper whose protected destination, action descriptor, security context, credential, raw error, and unnecessary financial detail are removed                                                                                       |
| `no_readable_copy`      | 0 days  | auth/security/credential messages, Phase 10 restricted/care/high-risk privacy content, provider raw material, SMS, and any unknown/unclassified contract                                                                                                               |

The stored projection is allow-listed: support-safe resolved subject and preheader, sanitized inert HTML and plain text, safe sender/reply display labels, effective locale, and the nonsecret catalog title. It excludes every URL/action target, token/code, attachment/artifact body, tracking pixel/query, remote asset reference, custom header, raw provider field/error, internal id, care/restricted field, and value the contract does not explicitly permit. The exact provider-bound payload lives only in the separately sealed delivery artifact required by D15; this convenience projection can never dispatch or reconstruct it.

Ordinary history summary is not a sensitive reveal and is not individually audited. Opening the Recent sent copy requires a narrow Phase 12 capability and one explicit **View sent copy** action; the server silently re-proves current tenant, role/capability, exact recipient Party and contact-point revision authority, permitted source record and site, privacy classification, restriction/erasure state, and unexpired copy authority, then writes a content-free success or denial audit. Source or fund/campaign access alone is insufficient. The ordinary eligible flow has no justification modal, manager approval or repeated password prompt. Copy access is easy to read after the fact: the UI shows recipient, sent/not-sent evidence, exact expiry date/time, why some content is unavailable, and a clean inert HTML/plain-text view. It never encourages staff to copy credentials or treat provider telemetry as proof of reading. The authorization pack includes a negative case where source access remains but recipient Party/contact authority has been revoked.

The viewer is private and inert: `Cache-Control: private, no-store`, no prefetch/prerender, analytics, third-party receiver or network-capable content; a restrictive CSP; sandboxed rendering with scripts, forms, navigation, popups, downloads and external resources disabled; and plain text always available. Closing the viewer, changing tenant/role, expiry, revocation, or authorization loss clears client copy state. The setting and every expired/disabled state explain in plain language that Asym's Off/7/30 choice controls only this Asym support copy; the tenant's Resend account has independent provider retention governed in Resend and is not deleted or shortened by this setting. Provider policy is linked from the tenant responsibility panel and re-verified at build time rather than hard-coded as a promise.

If a pre-provider gate definitely prevents submission, do not retain the convenience copy and show **Not sent**. If submission may have occurred, preserve at most the one prepared copy identity until expiry while reconciling. Phase 10 reclassification or incident response can deny access and priority-purge any remaining copy. Purge never breaks history, official artifacts, correction, or retry.

The expiry clock begins at the first durable instant provider submission may have occurred; for a future-scheduled message it begins at the scheduled provider crossing, not early queueing. Viewing, retrying, reopening, delayed delivery, bounce, complaint, open/click observation, duplicate/reordered webhook, reconciliation or staff activity never resets it. Authorization denies the copy at the exact expiry instant even if physical purge is still pending.

History and detail use distinct truthful states: **Sent copy** only after provider acceptance evidence; **Attempted copy** for failed or indeterminate provider-boundary work; **Not sent** for definite pre-provider stop; **Readable sent copy expired on [date]**; **Readable copies were disabled by your organization**; **Content not stored because this was a security message**; **Content removed after a privacy or safety change**; **Email wrapper expired — official document available**; **Sent-copy capture unavailable**; **Sent copy temporarily unavailable**; and **You do not have permission to view personalized sent content**. Every unavailable state still shows what durable evidence and authorized source/artifact can be verified; a synthetic pinned-design preview is labeled as a sample, never reconstructed history.

Backups cannot become an informal archive. A restore reapplies expiry, erasure, tenant-removal and Phase 10 restriction ledgers before any Recent-copy read is enabled, and periodic restore tests prove deleted content does not reappear. There is no tenant **Keep forever** or legal-hold builder in this phase.

### Preparation boundary

Before channel materialization, the D3/D15 resolver may choose one complete
compatible candidate. For an external-delivery step, preparation creates exactly one
immutable, recipient-specific **Prepared-delivery artifact**; it is the only
material from which the Resend adapter may build a request and is structurally
separate from the support-oriented Recent sent copy. An `in_product` step does
not cross this provider boundary and creates no preparation, prepared artifact,
provider envelope, sender/connection pin, provider identity, state, or outcome.

The sealed artifact contains or immutably references:

- exact `ExecutionScope` tuple/environment, intent, permanent occurrence slot
  and semantic identity, preparation id, artifact schema/version and seal time;
- source occurrence/id/fence and applicability plus the matching recipient
  branch: tenant Party/contact-point revision or exact platform-recipient
  authority kind/revision/epoch, and the server-resolved restricted destination;
- contract key/version/generation, plan/step, audience role, purpose/classification, earliest/expiry/utility boundary and safety epoch;
- complete resolution trace plus exact publication/document/Brand Kit/Role Layout/assets/locale/direction/compiler/renderer/formatter/sanitizer/policy revisions;
- protected-action kind, nonsecret issuer reference, producer version, expiry/replacement facts and exact protected delivery material;
- exact matching-owner delivery revisions: tenant Resend connection/credential/
  domain/Sender Profile/reply destination, or fixed platform connection/
  credential/domain/sender/reply policy;
- normalized exact `from`, one concrete `to`, optional first-class `reply_to`, subject, HTML, plain text, contract-owned headers and safe non-PII tags;
- canonical deterministic UTF-8 provider-member bytes, length, SHA-256, personalized component hashes and adapter serialization version; and
- internal provider-message identity, attempt policy, Recent-copy eligibility and restricted-material retention/purge policy.

Destination, body and protected-action material live in purpose-separated encrypted restricted storage under two closed, non-interchangeable associated-data schemas:

- `prepared_artifact_aad@1` binds `{scope_kind, scope_owner_id, environment,
preparation_id, artifact_schema_version, material_hash, encryption_key_version,
recipient_authority_revision, delivery_profile_revision}`. The tenant branch's
  recipient authority is the exact Party/contact-point revision and its profile
  is the tenant connection/profile revision; the platform branch uses the exact
  platform recipient-authority and fixed platform connection/profile revisions
  with every tenant field null.
- `provider_submission_envelope_aad@1` binds `{scope_kind, scope_owner_id,
environment, submission_id, envelope_schema_version, request_digest,
encryption_key_version, connection_revision, credential_revision,
ordered_member_map_digest}`. It never pretends a multi-member envelope has one
  preparation id.

Any changed, missing, cross-owner or cross-environment component makes
decryption fail before provider I/O. Queues, history, metrics, traces, support
lists, exports and repair signatures store only safe ids/hashes. The artifact
and envelope remain only while exact retry/reconciliation requires them, are
destroyed under the contract policy and cannot be revealed as history. Neither
is sourced from or restored through Recent sent copy or Resend history.

#### Sealed provider-material retention and terminal erasure

Every expanded contract carries one code-owned `prepared_artifact_retention_class_by_step` mapping. Every delivery step maps to exactly one closed material posture and tenant settings cannot lengthen it. External-delivery steps use an artifact class; `in_product` uses the explicit `prepared.none@1` no-artifact sentinel. The initial Target Live manifest has only three values:

| Class                              | Applies to                                                       | Absolute restricted-material ceiling                                                                                                                      |
| ---------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prepared.external_required_30d@1` | required or source-required donor receipt/financial email        | 30 days after artifact seal, always shortened by an earlier intent expiry, utility boundary, protected-action expiry, erasure/privacy stop or safety stop |
| `prepared.optional_staff_7d@1`     | an optional staff-email sibling of required in-product attention | 7 days after artifact seal, always shortened by the source task/role losing applicability or any earlier expiry, erasure/privacy stop or safety stop      |
| `prepared.none@1`                  | in-product-only contracts                                        | no email provider-bound artifact or request bytes may exist                                                                                               |

Future action-bearing, authentication, document or other Reserved contracts cannot become Live by inheriting these values accidentally. Their exact expanded manifest must select a reviewed closed class whose ceiling is no longer than the action/utility authority; adding a class requires a new catalog generation and proof.

At seal time, the server freezes `restricted_material_purge_due_at` as the earliest applicable class ceiling, intent expiry/utility boundary, protected-action expiry and source-owned shorter limit. It never moves later. The same deadline covers every decryptable copy of that recipient's provider-bound material, including prepared-member bytes and provider-submission request bytes. A batch envelope uses the earliest member deadline; batch grouping cannot extend any member's retention.

Adapter use becomes unauthorized immediately and primary ciphertext/key material enters purge when any of these first occurs:

- exact provider acceptance and member mapping are durably recorded, because no provider-request retry remains legal;
- definite rejection becomes terminal because retry is disallowed, exhausted or past utility;
- definitely unsubmitted work is canceled, suppressed, expired, superseded, erased, privacy-blocked or safety-revoked;
- an indeterminate request reaches the end of the pinned provider idempotency window, after which replay is forbidden even though the body-free outcome remains **Delivery outcome unknown**; or
- `restricted_material_purge_due_at` arrives.

Authorization denies decryption at the trigger instant. An idempotent,
scope-owner-fair purge worker removes primary ciphertext, wrapped data keys and
plaintext-capable caches within 24 hours, records content-free destruction
evidence, and applies the Phase 10/ADR-0029 live-purge, backup-expiry and
cryptographic-erasure distinctions. Tenant owners and the service-only platform
owner are scheduled fairly without crossing access boundaries. Permanent hashes,
ids, source/provider fences and body-free outcome evidence remain. Provider
reconciliation after material purge uses signed events, provider ids and hashes
only; it never restores the body from Resend, Recent copy, logs, backups or
support tooling.

If the absolute deadline arrives while work is definitely unsubmitted or definitely rejected, that email step ends truthfully as expired/no longer retryable and the repair surface explains that a new producer-authorized successor is required where the source contract permits one. Accepted or indeterminate work can never be replaced. Purge, submit, webhook, cancel, erasure, batch-member and worker-lease races use the same state-version/safety-epoch CAS; privacy or erasure wins readable-material access without rewriting provider truth.

The preparation transaction uses the expected intent state/version, current
worker claim fence, source fence, governance/safety epoch and same-scope
constraints. It re-proves the exact branch: tenant source, Party/contact,
consent/suppression, publication, action and tenant delivery identity, or the
service-only platform source fence, platform-recipient authority, fixed
publication with no protected action, and fixed platform delivery identity. It renders once,
reserializes through the production adapter and rejects any byte/hash mismatch;
inserts the sealed artifact and existing Phase 6 outbox wake-up; then moves
atomically to `Prepared definitely unsubmitted`. A repeated occurrence slot with
a different semantic-identity hash, immutable-command hash, or sealed bytes is a
hard conflict, not a new version. Insert-or-return has already locked the unique
slot and required both comparison hashes to match before preparation begins. Changed truth,
recipient, relation, order, timing, content, action or delivery identity
requires a producer-authorized successor/correction intent.

### Exact provider-boundary state machine

These monotonic phases are independent from source/business state, provider outcome, downstream delivery lifecycle and repair state:

| Dispatch phase                    | Exact meaning                                                                                                                                     | Legal next work                                                                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Unprepared`                      | no sealed provider payload exists and no provider call for this semantic communication may have begun                                             | run the one bounded resolver/preparation or end truthfully without send                                                                                                 |
| `Prepared definitely unsubmitted` | one sealed artifact exists and durable evidence proves no provider request containing it crossed the submission fence                             | submit that exact artifact after live reproof, or revoke/suppress it before I/O                                                                                         |
| `Submission may have begun`       | a sealed provider-submission/attempt fence committed before external I/O; the request may or may not have reached Resend and never moves backward | reconcile; only a closed permitted class may make the bounded identical same-key provider calls below; a new attempt requires sufficient evidence of definite rejection |

Provider outcome is an orthogonal discriminated fact: `None`, `Accepted`, `Definitely rejected`, or `Indeterminate`. Resend lifecycle evidence is another monotonic reduction: `Queued/Sent`, `Delivery delayed`, `Delivered`, `Suppressed`, `Failed`, `Bounced`, or `Complained`. None means paid, received, read or business-complete.

Legal transitions are server-owned and compare-and-set:

| Actor                    | Required precondition/fence                                                                      | Atomic effect                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| producer adapter         | authorized source + exact generation + one bounded recipient/channel-step occurrence-slot token  | lock the permanent scoped slot and create or exactly return one `Unprepared` intent; either comparison-hash mismatch conflicts                      |
| preparation worker       | active higher claim fence + expected `Unprepared` version + every current gate                   | seal one artifact and move to `Prepared definitely unsubmitted`; no provider I/O                                                                    |
| source/policy reducer    | expected unprepared/definitely-unsubmitted state and current evidence                            | append terminal no-send/suppressed/canceled/expired/superseded disposition; never claims a crossed request stopped                                  |
| dispatch assembler       | exact sealed artifact + live safety/compatibility proof                                          | seal one one-member/batch submission with immutable ordered membership; no second queue                                                             |
| provider adapter         | expected sealed submission + current claim/safety fence + matching bytes/hashes                  | commit attempt and `Submission may have begun` **before** the first byte can leave Asym; then perform exact server-loaded request                   |
| response/webhook reducer | exact submission/member/connection evidence; raw signature for webhook                           | append accepted/definitely-rejected/indeterminate or delivery evidence and reduce monotonically                                                     |
| reconciler               | exact indeterminate submission and pinned connection                                             | prove accepted or definite rejection from sufficient evidence, otherwise remain indeterminate; never change payload/key/membership                  |
| repair/resume service    | exact repair/preflight generation, capability, expected version and fresh per-item claim/reproof | resume only eligible unprepared, definitely unsubmitted or contract-permitted definitely rejected work; never accepted/indeterminate/manual payload |

Every mutable control row carries monotonic `state_version` and `claim_fence`. Lease expiry permits a higher-fence worker but does not prove that the old worker never called Resend. A late signed webhook/response may append evidence after lease expiry but cannot regress a stronger state or grant new submission authority. The adapter checks the current fence and safety epoch immediately before resolving the restricted credential and never accepts caller-built payload fields.

Crash before the submission-fence commit leaves work definitely unsubmitted. Crash after that commit is conservatively indeterminate even if the process probably died before opening the socket. Successful response requires exact member count/index/id proof. Timeout after possible write, malformed/mismatched success, unknown provider code or contradictory evidence remains indeterminate. One versioned exhaustive Resend-code classifier maps recognized definite rejections to the closed `RetryClass`: `rate_limit_exceeded` to `retry_after_backoff`; `daily_quota_exceeded` and `monthly_quota_exceeded` to `retry_after_quota_reset`; proved credential/domain/sender/readiness failures to `retry_after_configuration_repair`; and proved request-shape/validation failures to `non_retryable`. `invalid_idempotent_request` is not a definite rejection at the product-message boundary: Resend reports that the same key was used with a different payload, so a different payload may already have been accepted. It becomes indeterminate cause `idempotency_payload_conflict`, is quarantined as a data-integrity incident, and cannot use same-key retry, rekey, replay, or a definite-rejection repair transition. Reconciliation may mark it accepted only when provider/local evidence binds the accepted provider payload to the exact frozen bytes/hash and membership; a proved different payload remains an incident and requires a new legitimate producer event rather than transport replay. `concurrent_idempotent_requests` is also not definite rejection: it preserves the identical request/key as indeterminate cause `concurrent_idempotent_request` for bounded reconciliation or same-key retry. `5xx`, network/timeout, malformed or missing codes, unknown codes, and contradictory evidence remain indeterminate under their closed cause codes. Only the three explicit classes in the table below permit a bounded identical same-key provider call; nothing unknown defaults to a definite rejection, new attempt, or new-key replay.

The classifier input is the closed operation (`send_email`, `send_batch`, or side-effect-free `probe_domains`), HTTP status, exact documented error type, pinned normalized reason fixture where the provider reuses a type, and current locally proved connection/request context. Free-text substring matching is forbidden. The planning-baseline `ResendErrorType` union contains exactly `invalid_idempotency_key`, `validation_error`, `missing_api_key`, `restricted_api_key`, `invalid_api_key`, `not_found`, `method_not_allowed`, `invalid_idempotent_request`, `concurrent_idempotent_requests`, `invalid_attachment`, `invalid_from_address`, `invalid_access`, `invalid_parameter`, `invalid_region`, `missing_required_field`, `monthly_quota_exceeded`, `daily_quota_exceeded`, `rate_limit_exceeded`, `security_error`, `application_error`, and `internal_server_error`. Adding an operation, status/type/reason tuple, SDK/API pin, or official catalog type fails the exhaustive build fixture until this matrix and its evidence are versioned together.

| Adopted operation and exact result                                                                                                   | Required local/fixture proof                                                                                                          | Closed disposition                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `send_email` 2xx with one exact provider id; `send_batch` 2xx with exact member count, order, indexes, ids, and no unexplained error | frozen request/member digest matches the response fixture                                                                             | `accepted`; attach only the proved ids                                                                                                                                                                                                                     |
| `send_batch` 2xx permissive response with indexed member errors                                                                      | each unique index maps to one frozen member and every success/error is accounted for                                                  | classify each member through this same matrix; a missing, duplicate, out-of-range, malformed, or unexplained index makes the affected mapping indeterminate and forbids whole-batch replay                                                                 |
| `probe_domains` 2xx                                                                                                                  | exact pinned domains-list fixture                                                                                                     | connection proof `overprivileged`; block activation because the key has broader-than-Sending access                                                                                                                                                        |
| `probe_domains` 401 `restricted_api_key`                                                                                             | exact pinned restricted-key fixture plus later controlled exact-sender canary                                                         | positive least-privilege evidence only; not send acceptance and not sufficient by itself for activation                                                                                                                                                    |
| send 400 `invalid_idempotency_key` or 400 `validation_error`                                                                         | exact send-operation fixture and, for `validation_error`, a pinned request-shape reason; request crossed local preflight unexpectedly | `definitely_rejected/non_retryable`; open an adapter-contract defect, do not auto-retry the broken prepared request, and never describe it as accepted                                                                                                     |
| any adopted operation 401 `missing_api_key` or 403 `invalid_api_key`                                                                 | exact pinned provider fixture and matching connection revision                                                                        | send: `definitely_rejected/retry_after_configuration_repair`; probe: incomplete connection proof; no activation                                                                                                                                            |
| send 403 `validation_error`                                                                                                          | exact pinned testing-only/domain-unverified/sender-readiness reason fixture **and** matching current local proof                      | `definitely_rejected/retry_after_configuration_repair`; the same frozen payload may retry only if the repaired connection can honor every frozen identity                                                                                                  |
| 400/403 `validation_error` without the exact operation/reason/context match; any send 401 `restricted_api_key`                       | no closed fixture match or the local proof contradicts the provider reason                                                            | `indeterminate/provider_contract_drift`; quarantine, alert, and do not retry/rekey/replay                                                                                                                                                                  |
| any adopted operation 404 `not_found` or 405 `method_not_allowed`                                                                    | exact Resend structured error from the pinned endpoint                                                                                | `definitely_rejected/non_retryable`; adapter/version defect, no automatic replay                                                                                                                                                                           |
| send 409 `invalid_idempotent_request`                                                                                                | exact documented tuple                                                                                                                | `indeterminate/idempotency_payload_conflict`; quarantine under the no-retry/rekey/replay rule above                                                                                                                                                        |
| send 409 `concurrent_idempotent_requests`                                                                                            | exact documented tuple and identical frozen request/key                                                                               | `indeterminate/concurrent_idempotent_request`; bounded reconciliation or identical same-key retry only within the provider window                                                                                                                          |
| send 422 `invalid_attachment`, `invalid_from_address`, or `missing_required_field`                                                   | exact documented tuple                                                                                                                | `definitely_rejected/non_retryable`; open the owning content/config/adapter repair, and require a legitimate new preparation if corrected bytes or sender identity would differ                                                                            |
| any adopted operation 422 `invalid_access`, `invalid_parameter`, or `invalid_region`                                                 | tuple is outside every adopted operation's expected contract                                                                          | `indeterminate/provider_contract_drift`; quarantine and block replay until the pinned adapter/catalog is reconciled                                                                                                                                        |
| send 429 `rate_limit_exceeded`                                                                                                       | exact documented tuple and parsed bounded response headers                                                                            | `definitely_rejected/retry_after_backoff`; preserve scope-owner fairness and identical frozen request                                                                                                                                                      |
| send 429 `daily_quota_exceeded` or `monthly_quota_exceeded`                                                                          | exact documented tuple and bounded quota evidence                                                                                     | `definitely_rejected/retry_after_quota_reset`; no guessed capacity or cross-owner borrowing                                                                                                                                                                |
| send 451 `security_error`                                                                                                            | exact documented tuple                                                                                                                | `definitely_rejected/non_retryable` plus security quarantine and operator review; never automatic retry                                                                                                                                                    |
| send 500 `application_error` or `internal_server_error`                                                                              | exact documented tuple                                                                                                                | `indeterminate/provider_5xx`; reconcile the identical request and never assume rejection from the status alone                                                                                                                                             |
| malformed 2xx, network/timeout, missing/malformed type, unlisted status/type/reason, contradictory evidence, or any tuple not above  | no exact closed match                                                                                                                 | one closed indeterminate cause (`network_or_timeout`, `malformed_or_missing_provider_code`, `unknown_provider_code`, `contradictory_provider_evidence`, or `provider_contract_drift`); quarantine and never default to a definite rejection or retry grant |

Indeterminate handling is closed and envelope-owned:

| Indeterminate cause                                                                                                                                                                           | Identical same-key provider call                             | Required terminal posture                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `concurrent_idempotent_request`                                                                                                                                                               | permitted after bounded jitter                               | reconcile the same sealed envelope; never change bytes, membership, account, or key              |
| exact typed `provider_5xx` from `application_error` or `internal_server_error`                                                                                                                | permitted after bounded exponential backoff with full jitter | remain indeterminate until exact provider/local evidence proves acceptance or definite rejection |
| `network_or_timeout` with an exact sealed request and no contradictory evidence                                                                                                               | permitted after bounded exponential backoff with full jitter | remain indeterminate until exact evidence proves outcome                                         |
| `batch_mapping_indeterminate`, `idempotency_payload_conflict`, `malformed_or_missing_provider_code`, `unknown_provider_code`, `contradictory_provider_evidence`, or `provider_contract_drift` | forbidden                                                    | quarantine and reconcile only; no provider re-call, split, rechunk, rekey, or replacement        |

Across the first three rows, one sealed provider-submission envelope permits at most two follow-up HTTP calls after the initial call, total—not two per cause. Each call uses the exact endpoint, UTF-8 bytes, order, headers, account/credential and request key; honors a valid bounded `Retry-After` when present; applies full-jitter backoff; rechecks the live safety/decrypt fence; and occurs before the earliest member deadline and Resend's pinned idempotency-window expiry. It is the same envelope and attempt, not a new attempt ordinal. Provider evidence is reconciled before another call whenever available, and acceptance or definite rejection stops the loop. If exact outcome remains unproved after the bound or window, the message remains **Delivery outcome unknown** and is never replayed under another key.

After sufficient definite-rejection evidence, the same sealed recipient artifact may get a new attempt ordinal/request key only when the contract still permits retry and every live fence passes. Accepted or indeterminate work can never take that transition.

After preparation, no content, recipient, locale, action, sender, reply or connection component re-resolves. Auth/security actions that expire are reissued only by the producer under a new semantic identity; old email authority is never resurrected.

### Failure taxonomy and provider outcomes

Classify failures by deterministic phase and owner:

- source/recipient/consent/fence failure — producer or Phase 3 owner;
- contract/fact/publication/locale/layout/compiler failure — Phase 17 content owner;
- connection/sender/reply/domain failure — tenant email admin for tenant
  scope, or the service-only Asym platform operator for platform scope;
- definitely rejected before provider acceptance — retry only under exact contract and same prepared identity;
- provider accepted — await normalized lifecycle evidence;
- outcome indeterminate — stop replacement work and reconcile same identity;
- provider-delivered/bounced/complained/failed — normalized transport evidence, never business truth; and
- expired/no-longer-applicable — terminal without send.

Verified webhook evidence, retrieve-after-write where supported and safe, bounded provider reconciliation, and append-only attempt evidence decide outcomes. Do not infer from missing webhook alone. Rate-limit, quota, provider outage and content rejection have distinct owner/action. Unknown remains unknown.

### Compatible whole-message recovery

For one `Unprepared` recipient/channel intent, the resolver considers only complete immutable candidates in this exact order:

1. the complete publication selected by normal D3 resolution;
2. one derived exact-scope **Compatible prior publication**, only when the active contract explicitly allows recovery and current compatibility proof passes;
3. for tenant scope, the remaining complete candidates in the tenant's one
   published D3 policy; for platform scope, only remaining contract-declared
   `platform_fixed` candidates, with no tenant policy, site override, or
   tenant-authored fallback;
4. one protected Asym system publication only when that exact contract
   authorizes it and every branch-appropriate gate passes: tenant/site/legal/
   Party/audience/fact/locale/layout/sender/reply/action/privacy/security/review
   for tenant scope, or exact platform source/recipient-authority/fact/locale/
   fixed-layout/fixed-profile/privacy/security/review for platform scope;
5. independently authorized D7 sibling steps continue only on their own authority and never become fallback content for this step; then
6. stop truthfully with the typed owner/cause if no candidate survives.

The chosen candidate is one whole publication and dependency set. Subject, preheader, body, layout, branding, locale, assets, protected truth and action presentation never mix across candidates. Unknown compatibility fails closed. Contribution-correction contracts preserve their ratified no-fallback posture unless their owning contract is explicitly amended with full proof.

Quarantine has exactly two code-owned effects:

- **New preparation only** — remove the exact unsafe publication/dependency revision from future resolution. Existing prepared artifacts may proceed only if an independent current dispatch-safety check proves the defect does not make their frozen recipient, content, identity, action or transport unsafe.
- **Revoke unsubmitted** — also prevent every affected `Prepared definitely unsubmitted` artifact from crossing the provider boundary. This is mandatory for security, privacy, phishing, wrong-recipient, legal and protected-action hazards.

The quarantine row freezes owner namespace, exact `ExecutionScope` and
environment, tenant-only permitted site where applicable, contract/channel,
exact publication/dependency revision, normalized cause/reason, safety epoch,
effect, actor, evidence hash and time. Tenants cannot weaken the effect. The
expected safety epoch and dispatch-state CAS resolve the race: quarantine before
the submission transaction blocks crossing; submission first becomes
`Submission may have begun` and is reconciled without claiming recall.
Quarantine never rewrites source truth, history, accepted mail or sealed bytes.

One deterministic PII-free same-scope signature creates or updates one grouped
repair case with affected count, impact, cause/owner, checked candidates,
current-live safety, technical evidence and one recommended action. The tenant
branch appears as **System Messages → Needs attention** under current tenant
authorization; the platform branch remains service-only in Asym operations and
cannot enter a tenant workspace. It is not a generic incident or task engine.

Publishing a repair sends nothing automatically. Where a contract permits backlog recovery, staff choose:

- **Publish only**; or
- **Publish and resume N eligible waiting messages**.

Preflight partitions eligible unprepared, eligible prepared-definitely-unsubmitted, eligible definitely rejected under exact retry policy, completed/accepted, no-longer-applicable, still blocked and indeterminate. Each occurrence re-proves source, recipient, consent, utility window, action and exact authority. Unprepared work resolves/seals once; prepared work preserves exact bytes; definitely rejected work preserves its artifact and gets only a permitted new attempt. Known success and unknown submission are never replayed. Resume is scope-owner-fair, bounded, rate-limited, partially reportable and stoppable on systemic failure. There is no force-send, manual payload edit, close-as-fixed shortcut or automatic send on publish.

## Full Tenant Portability

### Native Asym Message Package

Export creates a signed, versioned, pre-recipient Asym package containing selected tenant-authored structured sources, locale variants, eligible Saved Sections, safe variable/contract references, inert synthetic HTML and plain-text outputs with no recipient data, destination-independent assets, manifests, schema/compiler compatibility, hashes, provenance and publication-history metadata needed to understand the source. The structured source is the only editable truth; synthetic outputs are hashed review/interoperability evidence, never an alternate import authority.

It excludes recipients, communication history, recent copies, provider ids, credentials, sender/reply authority, permissions, approvals, protected-action secrets, delivery readiness, consent, suppressions, official artifact bytes and live publication authority. Compatible native reimport can prove **Exact native round-trip** for the portable layer; destination still re-resolves every authority and creates drafts only.

Packages have explicit format version, minimum/maximum reader, canonical manifest, per-object hashes, whole-package digest and signature. `asym_message_package@1` serializes the manifest as RFC 8785 JSON Canonicalization Scheme UTF-8 after schema validation; manifest values are restricted to the schema's strings, integers, booleans, nulls, arrays, and objects, with no non-finite or implementation-dependent numeric values. Every object records SHA-256 over its exact canonical bytes; the manifest records the ordered object list and those digests; the whole-package digest is SHA-256 over the exact canonical manifest bytes plus the ordered object bytes and lengths.

The initial signing pin is `ECDSA_P256_SHA256_P1363@1`: a managed non-exportable P-256 signing key signs `UTF8("asym-message-package-signature@1\\0") || uint64be(manifest_length) || canonical_manifest_bytes`, and the detached signature is the exact 64-byte IEEE P1363 `r || s` value. The envelope records a versioned `kid`, algorithm id, issuer instance, format version, manifest digest, and signature. Verification selects only the code-owned `(algorithm, kid, issuer)` allow-list, verifies the signature and every length/digest before parsing or exposing any object, and never follows package-supplied key material. Public verification keys remain available for the documented supported-reader window after signing-key rotation; signing secrets do not. Revoked-for-compromise keys, unknown/expired issuers or keys, bad signatures, digest/length/order changes, cross-environment issuers outside explicit trust, and unsupported versions enter the isolated untrusted-conversion lane or Blocked result—never **Exact native round-trip**. Modified/unsigned packages follow the same rule; they are never optimistically loaded.

### Foreign conversion

The only accepted foreign inputs are explicitly supported Unlayer JSON, Beefree JSON, static HTML, and a recognized Unlayer ZIP shape. Intake is encrypted, isolated and no-execution. Enforce file/archive/decompression/path/schema/node/string/image/URL limits, Unicode normalization, malware scanning and cancellation. Never execute scripts, event handlers, forms, iframes, vendor callbacks, CSS/JS, external tools or embedded code.

The converter maps only to approved D4 nodes and records every unsupported, dropped, substituted or staff-choice item. Browser preview never loads remote assets. A server fetcher captures permitted images with SSRF, redirect, DNS-rebinding, metadata/private-address, scheme, size, type and decoder defenses, verifies provenance/rights acknowledgement, re-encodes safe formats and creates new destination-owned asset identities.

The exact uploaded foreign artifact and its digest remain immutable, encrypted, read-only evidence only for the portability job's bounded review/retry window; staff cannot edit or publish it directly. It is never a runtime dependency and is purged with raw intake under the stated completion/cancel/30-day ceiling. Durable audit retains only digest, source kind/version, conversion/loss summary and purge proof.

Outcomes are exactly **Exact native round-trip**, **Compatible conversion**, **Converted with changes**, or **Blocked**. Unresolved decisions appear under **Needs your choice**. Never promise pixel-perfect equivalence or silently discard unknown material.

### Cross-tenant transfer

Transfer is a revocable, expiring bilateral copy:

1. authorized source staff choose exact immutable source versions;
2. Asym creates a seven-day offer with digest and destination tenant identity;
3. authorized destination staff review compatibility/loss and accept;
4. the server re-proves both tenants, offer state, authority and exact digest;
5. one atomic idempotent transaction creates independent destination drafts and re-keyed assets; and
6. the source remains unchanged and the destination owns all new records.

No publication, approval, sender, reply, provider, recipient, consent, history, action, permission or Live status transfers. Before creating destination drafts, the destination re-proves current D5 recipient-grained/Phase 3 privacy and consent boundaries where applicable, D16 contract/schema/lifecycle compatibility, D12 locale, D13 presentation dependencies, D18 protected truth, D6 action ownership, D11 review floor, D15 recovery compatibility, D10 transport, D17 reply and D20 sender constraints. Import cannot manufacture missing authority; incompatible material stays an isolated draft or is Blocked with exact reasons. Revoke-versus-accept and duplicate accept are serialized.

Export download expires after 24 hours; transfer offer after 7 days; raw foreign intake is purged within 30 days and sooner after completion/cancel. Durable audit retains hashes, stages and sanitized loss summaries only. The UX is **Choose → Review → Finish**, is resumable/cancellable for async jobs, shows partial cleanup honestly, and never auto-publishes.

## Target Data Model

The names below are normative unless migration analysis proves an equivalent existing table can carry the complete constraints. Do not create duplicate concepts merely to match the names. Every tenant row has `tenant_id NOT NULL`; every same-tenant relationship uses a composite tenant-aware unique key/FK or equivalent structural guard. A closed `scope_kind` plus database constraint makes each scoped catalog/intent/publication/delivery record exactly one of tenant scope or platform scope. Platform rows have no tenant id, use service-only policies and an Asym-owned connection, and are structurally unavailable to tenant queries or mutations. IDs supplied by clients never select either scope. Mutable heads and append-only versions are separate.

The execution/history discriminator is exact, not an implementation choice.
Every intent, fence, relation, preparation, prepared artifact, provider
submission, submission member, attempt, provider event/evidence, communication
event, and repair row carries `scope_kind` plus the exclusive arc `tenant_id`
XOR `platform_scope_id`. Tenant scope requires
`tenant_id`; platform scope requires the service-only platform scope and has
`tenant_id NULL`. A stored generated `scope_owner_id` equals the one non-null
owner id. Parents expose `UNIQUE (scope_kind, scope_owner_id, id)`; child FKs,
semantic/idempotency uniqueness, provider lookups, state/claim indexes, batch
membership, and history/result constraints include `(scope_kind,
scope_owner_id)`. This prevents NULL-unique gaps and cross-scope attachment.

Tenant recipient identity is the existing same-tenant Party/contact-point arc.
Platform recipient identity is a closed, mutually exclusive authority union;
platform v1 has exactly one branch, `eve_platform_owner`, containing an exact
`platform_owner_notification_record_id`, authority revision, and
identity/permission epoch from Eve #436's app-owned verified platform-owner
records. Every other branch, unknown discriminator, or missing authority rejects
before intent creation; future platform audiences require a separately ratified
typed branch rather than a generic table or address. Every Party/contact/tenant
relation is null. Preparation re-proves the current authority and stores the
actual destination only in encrypted restricted delivery material. Platform v1
supports email only, may relate only to the typed Eve occurrence/fence, and uses
one fixed Asym publication and delivery profile. No client id, address, provider
payload, queue message, or tenant setting may select or change scope.

### Catalog and authoring

| Record                                               | Required fields and constraints                                                                                                                                                                                                                                                                                                                                                            | Ownership / mutability                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `system_message_catalog_generations`                 | generation, manifest hash, prior generation, compiler/registry versions, census source digest, obligation/exclusion artifact digest, traceability digest, release-pack allocation and subject-coverage digests, activation evidence hash, activated time/actor, rollback generation                                                                                                        | global code-generated; append-only                           |
| `system_message_catalog_projection`                  | generation, key, semantic version, explicit scope kind, lifecycle, owner, purpose, requiredness, channels, layout/sender/reply roles, proof status                                                                                                                                                                                                                                         | generated read projection; tenant cannot edit                |
| `system_message_trigger_binding_projections`         | immutable projection id; generation, binding/version, key, explicit scope kind, producer event/version/owner and stable namespace, source-fence schema, delivery-plan contract/version, step/ordinal/channel/publication slot, requiredness/condition, recipient resolver, fact adapter, action issuer and clause/test ids; append-only unique `(generation, binding id, binding version)` | generated immutable projection; tenant cannot edit           |
| `system_message_catalog_contract_projections`        | fully expanded flat contract including explicit scope kind, exact profile ref, source hash and lifecycle for staff/support/readiness queries                                                                                                                                                                                                                                               | generated projection, never a second authoring source        |
| `system_message_system_default_publications` / heads | Asym-only immutable complete publications and exact contract/generation/step/channel/locale CAS heads with compatibility, independent review and quarantine evidence; no tenant id                                                                                                                                                                                                         | platform publication service only; tenant roles cannot write |
| `email_templates` (evolved)                          | tenant, contract key, channel, scope kind/id, canonical locale, inheritance source, current draft revision, legacy source kind                                                                                                                                                                                                                                                             | one logical complete variant; mutable head only              |
| `email_template_drafts`                              | tenant, template, revision, structured source, dependency draft refs, source publication, author/editor provenance, autosave timestamps                                                                                                                                                                                                                                                    | mutable through expected-revision CAS; no production send    |
| `email_template_versions` (evolved)                  | tenant, template, immutable version, canonical source, compiled HTML/text skeletons, subject/preheader, schema/compiler/renderer/sanitizer/catalog/contract versions, hashes, asset manifest                                                                                                                                                                                               | append-only immutable committed artifact                     |
| `system_message_publications`                        | tenant, contract key, exact scope/locale/channel, content version, brand/layout/fallback/plan dependency versions, validation/diff/impact hashes, review class/evidence, published/withdrawn/quarantined facts                                                                                                                                                                             | append-only; no update to source/dependencies                |
| `system_message_publication_heads`                   | tenant, contract key, scope/locale/channel, current publication id, head epoch                                                                                                                                                                                                                                                                                                             | one future-resolution pointer; CAS and same-tenant FKs       |
| `system_message_publication_floor_evaluations`       | tenant, immutable candidate, derived floor, closed reason codes, predicate/catalog/contract generations, complete evaluated dependency/fan-out digests, affected protected keys/scopes, tenant elevation fact                                                                                                                                                                              | append-only code-derived evidence; client cannot author      |
| `system_message_publication_reviews`                 | tenant, immutable candidate, author/editor set, reviewer principal, capability/governance epochs, step-up proof ref, decision/reason/time                                                                                                                                                                                                                                                  | append-only; reviewer differs from every substantive editor  |
| `system_message_delegated_review_invitations`        | tenant, immutable candidate/floor evaluation, inviter/invitee verified principals, exact capabilities, synthetic projection hash, expiry/revocation/acceptance facts                                                                                                                                                                                                                       | one candidate only; no recipient or unrelated tenant data    |
| `system_message_fixture_sets`                        | contract key/version, named synthetic cases, expected render/assertion hashes                                                                                                                                                                                                                                                                                                              | code-owned or governed immutable; no production PII          |

Existing `email_template_system_bindings` becomes a temporary migration adapter mapping legacy family/variant to stable key/publication. It never sets lifecycle, readiness or runtime authority and is retired after all callers are inventoried.

`system_message_catalog_projection` is the small staff/readiness view derived from the same generation's fully expanded `system_message_catalog_contract_projections`; it is not a second catalog source or separately mutable aggregate.

### Presentation, locale and plan configuration

| Record                                                  | Required fields and constraints                                                                                                                                                                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `message_brand_kits` / `message_brand_kit_versions`     | tenant, scope, mutable head; append-only exact tokens/assets/contrast evidence/hash; complete organization or site version                                                                                                                             |
| `message_role_layouts` / `message_role_layout_versions` | tenant, layout role, scope, mutable head; append-only structured layout, compatible Brand Kit, locale-neutral/exact locale declaration, compiler evidence                                                                                              |
| `message_saved_sections` / versions                     | tenant-owned structured source and assets; insertion always copies; no publication runtime reference                                                                                                                                                   |
| `system_message_fallback_policy_versions`               | tenant, organization default or eligible contract override, one of two algorithms, resolver/CLDR version, impact evidence, publication actor/time                                                                                                      |
| `system_message_locale_activations`                     | tenant, scope, canonical locale, direction, default flag, independently active/inactive state, responsible owner, activation/deactivation actor/time/epoch and impact hash; never a readiness Boolean                                                  |
| `system_message_locale_readiness`                       | tenant, scope, contract generation, canonical locale, presentation dependency set, platform-render-capability pin, exact `Ready`/`Uses compatible fallback`/`Needs attention` result, reasons, evidence version/time                                   |
| `system_message_delivery_plans` / versions              | tenant-owned plans use tenant ownership; platform plans use an immutable Asym-owned `platform_scope_id` branch with no tenant foreign key; mutable head; append-only complete fixed-slot selections, timing/condition ids, publication/review evidence |

Complete dependency versions are immutable. Mutable aggregate rows point to heads; already-prepared messages point directly to versions, never heads.

### Resend, sender and reply configuration

| Record                                                         | Required fields and constraints                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tenant_email_settings` (evolved)                              | one row per tenant; active/pending connection revision, domain, webhook route hint, readiness posture/evidence refs, protection pause, optimistic epoch; no plaintext secret                                                                                                                                           |
| `tenant_resend_secret_revisions`                               | tenant/connection/environment/revision, purpose-separated ciphertext/wrapped-DEK refs, managed KEK/version, nonsecret hint, created/activated/retired/live-purge/backup-expiry/verified-erasure facts and destruction-ledger ref; server-only                                                                          |
| `tenant_resend_evidence`                                       | exact connection/domain/revision observation, type, provider/RFC/Svix ids where applicable, normalized result, observed/expiry time, minimized signed evidence hash                                                                                                                                                    |
| `tenant_resend_suppression_evidence`                           | tenant/connection/region/contact-address revision, provider cause/evidence, first/last observed, active/remediated state and owning Phase 3/contact decision ref; transport evidence only, never Sender Profile scoped or product consent authority                                                                    |
| `platform_communication_scopes`                                | one stable `asym_platform_operations` row per environment; UUID owner id and closed code; service-only and never a tenant alias, request-selected owner, or tenant fallback                                                                                                                                            |
| `platform_owner_notification_records` (consumed from Eve #436) | stable app principal, verified email/contact revision, platform-owner permission epoch, eligible event classes, enable/pause state and immutable authority revision/time; no tenant id, caller address, or Phase 17-owned recipient editing                                                                            |
| `platform_email_settings`                                      | one row per platform scope/environment; active/pending connection revision, proved transactional domain, fixed sender/reply policy revision, readiness/evidence refs, safety epoch and protection pause; no tenant id or plaintext secret                                                                              |
| `platform_resend_secret_revisions`                             | platform scope/connection/environment/revision, purpose-separated encrypted credential refs and the same bounded lifecycle/destruction facts as tenant secrets; service-only                                                                                                                                           |
| `platform_resend_evidence`                                     | exact platform scope/connection/domain/revision observation, normalized result, provider/RFC/Svix evidence ids where applicable, observed/expiry time and minimized signed evidence hash; service-only                                                                                                                 |
| `email_sender_profiles` / versions                             | tenant, stable profile id, state/head; append-only internal label, display name, canonical mailbox, purpose/scope eligibility, proof evidence, lifecycle facts                                                                                                                                                         |
| `email_sender_assignments`                                     | tenant, exact site nullable, purpose nullable/default flag, profile revision, effective interval; exclusion constraints prevent overlap                                                                                                                                                                                |
| `email_reply_destinations` / versions                          | tenant, stable destination, encrypted/restricted canonical mailbox, safe label, access-confirm state/evidence, named monitoring owner, state/head, replacement lineage; ordinary lists expose references/labels, not another plaintext personal address                                                                |
| `email_reply_destination_challenges`                           | tenant/destination revision, initiating human principal, keyed verifier, issued/expires/attempt count, rate-limit bucket refs, completed/revoked state; completion requires fresh session/capability/step-up and code/secret never enters audit/history/export                                                         |
| `email_reply_assignments`                                      | tenant, code-owned purpose, destination revision, effective interval; one current mapping per purpose                                                                                                                                                                                                                  |
| `communication_delivery_profile_versions`                      | exact scope tuple and exactly one tenant-settings or platform-settings FK; ordinary tenant sender/reply composition or fixed platform sender/reply policy revision, nonsecret connection proof refs; restricted transport addresses live only in encrypted delivery material; several historical revisions may coexist |

The platform connection/profile rows above define the structural contract and
exclusive foreign-key branch; they are not instructions to insert a placeholder
row, store a credential, or run a canary in a generation with no Live platform
email key. The first exact Live platform key and ratified recipient-authority
branch activate that storage and its positive proof in the same release.

The old singular default From/Reply-To columns backfill one Default Sender and one Default human reply destination, then become read-only compatibility fields and are removed only after one-writer proof. A legacy nonblank reply address becomes **Needs confirmation**, never silently Ready.

### Phase 6 preparation, history and in-product detail

In this table, `ExecutionScope` is the exact tuple and constraint set defined
above: `scope_kind`, exactly one of `tenant_id` or `platform_scope_id`, generated
`scope_owner_id`, and `(scope_kind, scope_owner_id)` on every parent key, child
FK, semantic/idempotency uniqueness rule, claim/index, membership, and result.
It is not a nullable tenant shortcut. Rows marked **tenant-only** require
`scope_kind = tenant`, `tenant_id NOT NULL`, and `platform_scope_id NULL`, and
are excluded from the platform branch.

| Record                                      | Required fields and constraints                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `communication_plan_occurrences`            | `ExecutionScope`; environment, stable producer namespace, producer event key/version, `plan_occurrence_token@1` schema id/version and server-derived `plan_occurrence_slot_hash@1` but never raw token bytes, source identity and fence, manifest/contract/effective-plan versions, `compilation_hash@1`, expected-member count, canonical ordered-member-set digest, created/correlation evidence and `released_at`; permanent unique `(scope_kind, scope_owner_id, environment, plan_occurrence_slot_hash)`; slot hash excludes plan/membership, comparison hash includes the complete evaluated plan including excluded/condition-false slots and safe reason codes; exact zero-member release is valid; immutable coordination header only, never message/outcome truth                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `communication_intents`                     | `ExecutionScope`; immutable same-generation FK to the generated trigger-binding projection, exact effective plan id/version, and binding-owned event/contract/step/ordinal/channel/publication-slot/recipient/resolver/fact-adapter/action-issuer/condition identities; stable producer namespace id, one bounded producer recipient/channel-step occurrence-slot token plus persisted token-schema version, server-derived `occurrence_slot_hash@1`, `semantic_identity_hash@1`, and `immutable_command_hash@1` with schema versions; one concrete matching-branch recipient authority; source/fence, earliest/expiry, typed safe facts or source snapshot ref, ordered presentation/collection/relation/action digests; nullable same-scope/environment `communication_plan_occurrence_id` plus nullable nonnegative `plan_member_ordinal`, both null or both non-null and mandatory for Phase 17 plan children, with unique gap-free ordinal per parent; permanent unique `(scope_kind, scope_owner_id, environment, occurrence_slot_hash)`; the bounded plan compiler inserts/replays every child in the parent's transaction and claims require a released parent, while exact replay requires matching parent plus child hashes and every mismatch hard-conflicts; denormalized binding fields never override the projection FK |
| `communication_preparations`                | **external-delivery only**; `ExecutionScope`; same-scope intent, exact recipient authority/contact/consent/source evidence as applicable to that branch, resolution trace, publication/dependency/sender/reply/action pins, permanent internal provider-message identity, dispatch phase/state version/claim/safety fences, artifact ref/hash, prepared status/time; immutable after seal; an `in_product` member cannot reference this table                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `communication_prepared_delivery_artifacts` | **external-delivery only**; `ExecutionScope`; same-scope preparation, schema/serializer versions, exact encrypted normalized provider-member bytes and restricted destination/content/action material, component hashes, exact `prepared_artifact_aad@1` fields/key version, selected closed `prepared_artifact_retention_class` materialized from the contract step, immutable `restricted_material_purge_due_at`, trigger/deny/purge/backup/erasure facts; one immutable sealed artifact tombstone after material purge, never history/Recent copy                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `communication_provider_submissions`        | **external-delivery only**; `ExecutionScope`; environment, endpoint kind, matching-owner connection/credential, strict-mode/adapter versions, state/claim fence and attempt ordinal, one scoped request-level idempotency key, encrypted exact request bytes/hash/length/header manifest, ordered-member-map digest, exact `provider_submission_envelope_aad@1` fields/key version, earliest-member purge deadline, crossing/outcome/evidence/purge times; append-only sealed request envelope with decryptable bytes terminally removable                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `communication_provider_submission_members` | **external-delivery only**; `ExecutionScope`; same-scope submission, contiguous zero-based index, same-scope preparation/internal provider-message identity, member hash/safe HMAC tag, provider id/evidence; immutable ordered map with composite scoped FKs and exact uniqueness                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `communication_attempts`                    | **external-delivery only**; `ExecutionScope`; same-scope preparation/submission/member, recipient attempt ordinal, provider crossing phase/outcome, Resend id, request/response evidence hashes, started/finished/indeterminate facts; append-only                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `communication_events`                      | `ExecutionScope`; same-scope intent/result, body-free durable event and normalized correction/supersession evidence described under D14; external-delivery rows may retain normalized provider outcome, while `in_product` rows retain local `available`/presentation truth and structurally prohibit provider preparation/identity/state/outcome; append-only monotonic reducer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `in_product_notification_items`             | **tenant-only**; tenant/event/Party/role, destination code, privacy-safe immutable preview, availability/source-state refs, attention-group id, immutable `presentation_policy_ref` and `source_applicability_rule_ref` (compiled from `presentation_end_rule_by_step`), `available_at`, nullable once-set `presentation_ended_at` plus closed end reason, nonextendable `recent_history_until`; exact source/access proof derives `needs_attention`, `information_recent`, `history_recent`, or `not_presentable`; preview/search material is purgeable independently of body-free Phase 6 event/audit; no platform branch and no arbitrary URL/payload                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `in_product_notification_engagement`        | **tenant-only**; tenant/item/viewer Party+role, first seen/read/archive timestamps and revision; no platform branch; idempotent CAS                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `in_product_attention_groups`               | **tenant-only**; tenant, deterministic episode signature, role/privacy boundary, current projection/count; no platform branch; rebuildable from children                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `communication_recent_sent_copies`          | **tenant-only**; same-tenant preparation and exact recipient Party/contact revision, separately encrypted support-safe subject/HTML/text, tenant/environment/preparation/copy/recipient/policy/key-revision AAD, reveal policy, expires/purged; no protected secrets and no platform branch                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `system_message_repair_cases` / items       | `ExecutionScope`; deterministic scoped signature, cause/owner/urgency/state, affected counts and exact same-scope item refs, recommended action, notification transition facts; no generic tasks or content archive                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

Every `ExecutionScope` row expands the complete discriminator, owner arc, and
composite constraints above, never a fake tenant. The recipient and connection
arcs are both checked: the tenant branch requires Party/contact and a tenant
delivery profile while nulling platform authority/settings; the platform branch
requires `platform_recipient_authority_kind = eve_platform_owner`, its verified
authority revision, and the platform delivery profile while nulling
tenant/Party/contact/site and tenant-business relation fields. Unknown or future
authority kinds remain uninstantiable. `communication_provider_submissions` and
ordered members cannot mix owners; one request envelope is single-scope.
Tenant-facing notification items and Recent sent copies remain tenant-only.
Platform history and repair data is service-only and cannot enter tenant
timelines, badges, search, exports, support views, or RLS queries.

Phase 6 tables are the only eventual send/history authority. Existing
`email_send_logs` and `email_events` are migrated or adapted into the
attempt/provider-evidence side of this model; they do not remain a competing
product truth. The authority flip is gated by the Phase 6 dated amendment's
consumer-by-consumer cutover: receipt `receipt_send_log_id`, Support Hub
`outbound_send_log_id`, contribution-operation/approval writers, webhook
resolution, reconciliation jobs, and every FK/read path must first use the new
scope-aware internal/provider identity. Bounded dual-write or adapter reads are
temporary, observed, reversible, and removed only after one-writer/one-reader
proof; no live dependency may be stranded.

### SMS governance and portability

| Record                               | Required fields and constraints                                                                                                                                                               |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| channel consent/suppression evidence | extend Phase 3 provider-neutral consent/suppression records with exact channel/phone revision/sender/use-case/market/disclosure/lineage; append-only; create rows only for real evidence      |
| `sms_sender_registration_evidence`   | schema/projection for future exact component observations only; no tenant row without evidence; no executable route or provider credential                                                    |
| `message_portability_jobs` / items   | tenant, direction/input type, state, exact source/destination, digest, compatibility/loss summary, retention/purge, idempotency, cancellation; raw content separately encrypted and temporary |
| `message_transfer_offers`            | source/destination tenants, exact versions/digest, issuer/acceptor authority evidence, state, expiry/revocation/acceptance CAS, result ids                                                    |

### Structural invariants

1. Tenant-facing public-schema tables use `ENABLE` and `FORCE ROW LEVEL SECURITY` with tested policies. Service-only provider ingress remains isolated and cannot be queried by client roles.
2. Composite tenant relationships prevent a foreign tenant id from being attached even if application authorization fails.
3. Append-only rows reject update/delete except explicit retention purge of designated content/secret fields; history uses correction/supersession rows.
4. Secret/restricted execution material uses purpose-separated keys and closed
   associated data beginning with exact `ExecutionScope` plus environment,
   record/schema/material digests and key revision. Prepared recipient artifacts
   use `prepared_artifact_aad@1`; provider submission envelopes use
   `provider_submission_envelope_aad@1`; neither schema substitutes for the
   other. Recent-copy ciphertext is the deliberate tenant-only branch and uses
   tenant, environment, preparation/copy record, recipient/contact revision,
   policy revision and key revision.
5. Timestamps are UTC instants; locale/civil display uses the pinned locale/time-zone facts from the source contract.
6. Unique constraints cover semantic id, provider event id per connection, publication scope head, sender/reply assignment intervals, manifest generation and transfer acceptance.
7. Foreign/provider ids are evidence links, never authorization or tenant identity.
8. JSON is allowed only for bounded versioned structured documents, manifests, typed safe facts and minimized evidence—not arbitrary record bags.
9. Retention jobs are idempotent, observable and scope-owner-fair; tenant and
   service-only platform owners cannot cross-claim or cross-decrypt. Purging
   subordinate content cannot cascade-delete history or official records.
10. Execution/history indexes start with `{scope_kind, scope_owner_id}` and then cover state+created cursor, due intents, provider-id lookup, repair signature and expiration queues. Tenant-only presentation/configuration indexes separately cover tenant+contract+scope+locale heads and notification viewer cursors. Use measured plans before partitioning.
11. A provider submission has one immutable request hash/idempotency key and contiguous ordered members; a preparation appears at most once per submission/attempt, one active provider attempt exists per preparation, and provider ids are unique within `{scope_kind, scope_owner_id, connection_revision}` evidence.
12. Prepared-delivery artifacts and provider-submission envelopes are restricted execution material beneath the Phase 6 outbox/ledger. They cannot be queried as history, copied into repair cases, or used to create a second batch queue.
13. Publication floor is server-derived from the whole effective fan-out. A protected candidate has exactly one current floor evaluation and cannot advance without a different-human review bound to that exact evaluation and head epoch.
14. Provider suppression is connection-region/contact-revision evidence, not a Sender Profile flag or Phase 3 consent replacement; only the owning remediation contract can supersede it.
15. A secret revision cannot move directly from retired to verified erasure. Live purge, backup/escrow reachability, destruction-ledger application, and restore proof are explicit and monotonic.
16. Scope ownership is an exclusive database arc, propagated through composite parent/result FKs and prefixed uniqueness/indexes; a provider batch/request is single-scope and cannot mix tenant or platform owners.
17. Platform recipient authority is a closed mutually exclusive union; v1 permits only an exact revisioned FK to a currently verified app-owned Eve platform-owner record, not an address supplied by content or a caller. Tenant Party/contact and platform authority columns are mutually exclusive, and unknown/future authority kinds fail before intent creation.
18. Tenant/client RLS predicates always require `scope_kind = tenant` plus the active tenant. Platform rows deny every tenant/client role and are accessible only through service-only platform commands. Provider ingress resolves a proved connection revision before scope lookup.
19. Provider-event correlation is durable and address-free. The opaque route
    verifies one connection revision, derives its exact scope/owner, and binds
    `{scope_kind, scope_owner_id, connection_revision, provider_email_id}` to one
    permanent internal provider-message identity. Recipient address, tag, or
    payload metadata never selects scope or attachment; unresolved evidence is
    quarantined.
20. A plan occurrence has one permanent scope/environment/producer-token slot
    independent of plan membership. Its comparison hash freezes the complete
    evaluated plan, including excluded slots and reason codes; changed plan,
    binding, condition, recipient, or membership under the slot hard-conflicts.
21. Plan-child fields are both-null or both-non-null; Phase 17 plan children
    require a same-scope/environment parent FK and unique nonnegative gap-free
    ordinal. Claim SQL admits a plan child only when the parent has
    `released_at IS NOT NULL`.
22. Release verifies exact child count and canonical ordered-member digest in
    the same transaction. A released zero-member header is valid. A committed
    unreleased header is an invariant alert and has no force-release operation.
23. Generated bindings declare finite recipient bounds and the compiler applies
    one measured global ceiling. Exactly-at-limit may commit atomically;
    limit-plus-one creates no rows, and a logical occurrence is never chunked.

## Service and Module Boundaries

### Target modules

Build or evolve these cohesive seams rather than one giant service:

- `packages/email/system-message-contracts.*` — typed flat registry, compile-time shared profiles, trigger bindings, generated catalog/trace projections and closure checks;
- `packages/email/system-message-document.*` — canonical schema, nodes, variables, compiler, deterministic HTML/text and migrations;
- `packages/email/system-message-rendering.*` — recipient-safe fact binding and output hashes;
- `packages/api/src/email/system-messages/catalog.*` — permissioned catalog/readiness projection;
- `.../drafts.*`, `publications.*`, `reviews.*` — authoring lifecycle, derived publication floor, delegated review and CAS;
- `.../system-default-publications.*` — Asym-only protected defaults and exact compatibility heads, never fake tenant rows;
- `.../resolution.*` — D2/D3 complete-candidate resolver and trace;
- `.../delivery-plans.*` — fixed-slot validator/compiler;
- `.../brand-layout.*`, `locales.*` — immutable presentation dependencies/readiness;
- `.../resend-connection.*`, `resend-adapter.*`, `provider-reducer.*`, `transport-headers.*`, `sender-profiles.*`, `reply-destinations.*` — D10/D17/D20 aggregate, exact provider-schema, event, header and identity services;
- `.../protected-actions.*` plus producer adapters — scanner-resistant descriptor validation/landing protocol; producer domains retain credential issuance/redemption/postcondition;
- `packages/api/src/communications/intents.*`, `prepare.*`, `dispatch.*`, `provider-evidence.*`, `history.*`, `recent-copy.*`, `repair.*` — the Phase 6/17 one-writer seam;
- `.../in-product.*` — role-safe item/group/engagement projection; and
- `.../portability.*` — signed package, isolated finite converters, destination copy.

Equivalent repo-native paths are acceptable if ownership remains obvious. Do not hide the contract registry in database metadata or embed business resolvers in React components.

### One-way dependency rule

Producing domains depend on a narrow intent submission interface and shared contract types. They do not import the editor, Resend client, template store or admin UI. Phase 17 depends on typed producer projections, not source database internals. The Resend adapter depends on an immutable prepared payload and delivery snapshot, not tenant settings heads. UI routes call server services; they do not query provider or tenant tables directly.

### Command contract

All state-changing operations use POST/PATCH with server-derived authenticated tenant context or the exact service-only platform context declared by the contract, explicit capability/authority, expected revision/epoch, idempotency key and structured audit reason where material. Client payloads never choose scope. GET/HEAD never mutates or consumes protected authority. Errors use one typed problem contract with safe code, user-facing message, retryability, current revision/state and correlation id; no secret/PII/provider body leaks.

Minimum command/query surface:

- catalog list/detail/readiness/trace;
- draft create/copy/autosave/compare/discard;
- preview/test/commit/request-review/invite-delegated-review/request-changes/approve-protected-publish/standard-publish/restore-as-draft/restore-protected-baseline/quarantine;
- fallback-policy simulate/impact/publish;
- locale readiness/activate/deactivate impact;
- Brand Kit/Role Layout/Saved Section draft/test/publish/usage;
- Delivery Plan draft/validate/simulate/publish;
- Resend setup/probe/canary/rotate-webhook/rotate-key/pause/disconnect/migrate-domain-team-region/reconcile;
- Sender Profile draft/test/activate/assign/replace-retire/usage;
- Reply destination challenge/confirm/assign/replace/monitoring-owner;
- notification list/count/read/archive/preferences with cursor;
- history detail/reveal-recent-copy;
- repair case preflight/publish-only/publish-and-resume/cancel-resume;
- package export/import/foreign-convert/cancel/purge; and
- transfer offer/revoke/inspect/accept.

Every command returns exact evidence and next action. Bulk operations are dry-run/preflight first and bounded; no bulk activation, retirement, required-disable, authority change, replay or cross-tenant mutation exists.

Each state-changing family has one server command schema and closed result union. Equivalent names are allowed, but implementations must preserve these preconditions and atomic outcomes:

| Family                                 | Required command identity and precondition                                                                                                                | Atomic success / conflict behavior                                                                                                                                                                                            |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| draft/autosave/commit                  | tenant aggregate id, expected draft revision, canonical command hash, capability                                                                          | append/replace only the mutable draft revision; commit seals one immutable candidate; stale revision returns current revision without overwriting                                                                             |
| standard/protected publish             | exact immutable candidate/dependency graph, expected head epoch, publication floor/reason codes, review evidence if required                              | CAS one future-resolution head and append audit/publication; stale head or changed candidate/dependency/reviewer authority invalidates approval and publishes nothing                                                         |
| protected action POST                  | exact descriptor/version, tenant/recipient/source/issuance, expected producer state, origin/CSRF, current auth/step-up and producer idempotency           | producer command performs at most one authoritative transition and returns a privacy-safe terminal/recovery result; GET/HEAD and landing exchange cannot mutate                                                               |
| policy/locale/layout/plan/sender/reply | exact aggregate and expected head/epoch, synthetic impact version, capability/governance epoch                                                            | append a complete version and CAS its future-effective head/assignment; changed impact or overlapping assignment conflicts; already-prepared work keeps prior pins                                                            |
| connection/secret lifecycle            | exact connection/revision, current posture/epoch, protected capability and step-up where required                                                         | append pending/proved/active/retired evidence and atomically cut over or pause; no command returns a secret or silently changes provider account/domain                                                                       |
| reply challenge                        | tenant/destination revision, initiating human principal, expected state, keyed challenge proof, current capability and fresh step-up                      | activate only the exact confirmed destination revision; forwarding, scanner access, changed principal, stale/expired/replayed code, or failed replacement leaves prior Ready active                                           |
| notification engagement/preferences    | exact tenant+viewer Party+role+item or preference version, cursor/current access and derived closed presentation state                                    | idempotent engagement/preference CAS only; never changes source, availability, presentation deadlines, recipient role or communication outcome; an active required item rejects archive with the plain-language policy result |
| recent-copy reveal                     | exact history/preparation, current tenant, role/capability, recipient Party/contact revision, site/source, privacy/restriction/erasure and expiry reproof | returns the inert support projection once and appends content-free allow/deny audit; source access alone is insufficient; no durable browser cache or alternate content endpoint                                              |
| repair preflight/resume                | repair case/version, immutable short-lived preflight generation, capability and per-item claim                                                            | returns/claims only server-partitioned eligible opaque items; counts may shrink on reproof; no caller recipient list, accepted/indeterminate replay or payload editing                                                        |
| import/export/transfer                 | job/offer version, exact digest, source/destination capabilities and destination mapping                                                                  | stage/re-key drafts/assets or append exact blocked/loss result; duplicate accept is idempotent, revoke/accept races serialize, and no authority/publication transfers                                                         |

The producer/worker/provider protocol is also closed:

```ts
type DispatchPhase =
  | "unprepared"
  | "prepared_definitely_unsubmitted"
  | "submission_may_have_begun";

type RetryClass =
  | "retry_after_backoff"
  | "retry_after_quota_reset"
  | "retry_after_configuration_repair"
  | "non_retryable";

type IndeterminateCause =
  | "batch_mapping_indeterminate"
  | "concurrent_idempotent_request"
  | "idempotency_payload_conflict"
  | "provider_5xx"
  | "network_or_timeout"
  | "malformed_or_missing_provider_code"
  | "unknown_provider_code"
  | "contradictory_provider_evidence"
  | "provider_contract_drift";

type ProviderOutcome =
  | { kind: "none" }
  | { kind: "accepted"; evidenceId: string }
  | {
      kind: "definitely_rejected";
      evidenceId: string;
      retryClass: RetryClass;
    }
  | {
      kind: "indeterminate";
      cause: IndeterminateCause;
      evidenceId: string;
      reconcileAfter: string;
    };

type CommunicationExecutionEnvironment =
  | "development"
  | "preview"
  | "production";

type AuthenticatedTenantContext = {
  tenantId: string;
  actorOrServicePrincipalId: string;
  capabilityEpoch: string;
};

type AuthenticatedPlatformServiceContext = {
  platformScopeId: string;
  servicePrincipalId: string;
  authorityRevision: string;
};

type VerifiedServerBindingContext =
  | {
      kind: "tenant";
      tenant: AuthenticatedTenantContext;
      validatedSiteId?: string;
      binding: ResolvedTriggerBindingIdentity;
    }
  | {
      kind: "platform";
      platform: AuthenticatedPlatformServiceContext;
      binding: ResolvedTriggerBindingIdentity;
      recipientAuthority: {
        kind: "eve_platform_owner";
        recordId: string;
        authorityRevision: string;
        identityPermissionEpoch: string;
      };
    };

type ResolvedTriggerBindingIdentity = {
  // Opaque server-only value; submit reloads the immutable projection in the
  // transaction. This object cannot authorize itself.
  bindingProjectionId: TriggerBindingProjectionId;
  catalogGeneration: number;
  bindingId: TriggerBindingId;
  bindingVersion: number;
  producerEventKey: ProducerEventKey;
  producerEventVersion: number;
  stableProducerNamespaceId: StableProducerNamespaceId;
  contractKey: StableContractKey;
  contractSemanticVersion: number;
  deliveryPlanContractId: DeliveryPlanContractId;
  deliveryPlanContractVersion: number;
  effectivePlanId: DeliveryPlanId;
  effectivePlanVersion: number;
  stepKey: DeliveryStepKey;
  stepOrdinal: number;
  channel: "email" | "in_product";
  publicationSlot: PublicationSlotKey;
  recipientRole: RecipientRole;
  resolverVersion: number;
  factAdapterVersion: number;
  actionIssuerVersion: number | "none";
  conditionVersion: number;
};

type ResolvedPlanOccurrenceAuthority = {
  // Reloaded from the immutable generated registry by the non-exported server
  // resolver. None of these fields is accepted as producer routing authority.
  catalogGeneration: number;
  producerEventKey: ProducerEventKey;
  producerEventVersion: number;
  stableProducerNamespaceId: StableProducerNamespaceId;
  contractKey: StableContractKey;
  contractSemanticVersion: number;
  deliveryPlanContractId: DeliveryPlanContractId;
  deliveryPlanContractVersion: number;
  effectivePlanId: DeliveryPlanId;
  effectivePlanVersion: number;
  planOccurrenceTokenSchema: "plan_occurrence_token@1";
  maxRecipientCountPerOccurrence: number;
};

// Created only by the server-side event/binding resolver. This top-level
// authority exists even when the complete applicable candidate set is empty.
type VerifiedPlanOccurrenceContext =
  | {
      kind: "tenant";
      environment: CommunicationExecutionEnvironment;
      tenant: AuthenticatedTenantContext;
      validatedSiteId?: string;
      occurrence: ResolvedPlanOccurrenceAuthority;
    }
  | {
      kind: "platform";
      environment: CommunicationExecutionEnvironment;
      platform: AuthenticatedPlatformServiceContext;
      occurrence: ResolvedPlanOccurrenceAuthority;
    };

// Validated server-side: 1–128 UTF-8 bytes in a stable producer namespace,
// opaque and stable for exactly one intended recipient and channel-step slot,
// with no PII, secret, address, template id, provider id, or caller-composed
// scope/recipient authority. Fan-out uses one independent token per slot.
type BoundedOpaqueOccurrenceSlotToken = string & {
  readonly __brand: "BoundedOpaqueOccurrenceSlotToken";
};

// `plan_occurrence_token@1`: canonical 1–128 UTF-8 bytes, opaque and unique for
// exactly one authoritative occurrence within a stable producer namespace. It
// contains no PII, secret, address, template/provider id, or caller-composed
// scope/authority. The producer durably retains the original bytes for N/N-1,
// retry, rollback, and lost-response replay. Phase 6 derives a domain-separated
// slot hash and persists only that hash plus the schema id/version—never these
// raw bytes. The token is separate from member tokens and remains valid when the
// complete applicable member set is empty.
type BoundedOpaquePlanOccurrenceToken = string & {
  readonly __brand: "BoundedOpaquePlanOccurrenceToken";
};

type ProducerIntentInput = {
  occurrenceSlotTokenSchemaVersion: number;
  occurrenceSlotToken: BoundedOpaqueOccurrenceSlotToken;
  resolverInput: BoundedResolverInput;
  facts: TypedProducerFactEnvelope | ImmutableSourceSnapshotRef;
  relations: readonly TypedSourceRelationInput[];
  presentationCases: readonly PresentationCaseId[];
  orderedItems: readonly TypedPresentationItem[];
  actionDescriptorInput?: ProtectedActionDescriptorInput;
  timing: { earliestAt?: string; expiresAt?: string; utilityEndsAt?: string };
};

type CompleteAuthorizedRenderDto = {
  producerFacts: ValidatedProducerFactProjection;
  recipientFacts: ValidatedRecipientFactProjection;
  concreteRecipientAuthorityRevision: string;
  canonicalFactHash: string;
};

declare function submitCommunicationIntent(
  // Private transaction-scoped child primitive; it cannot commit or be called
  // by a product producer independently.
  transaction: DatabaseTransaction,
  planContext: VerifiedPlanOccurrenceContext,
  source: { id: string; fence: BoundedSourceFenceValues },
  // Created only by the server-side trigger-binding resolver; never parsed from
  // producer payload, browser input, provider metadata, or recipient data.
  bindingContext: VerifiedServerBindingContext,
  input: ProducerIntentInput & { planMemberOrdinal: number },
): Promise<CommunicationIntentResult>;

type ProducerPlanOccurrenceRequest = {
  planOccurrenceTokenSchema: "plan_occurrence_token@1";
  planOccurrenceToken: BoundedOpaquePlanOccurrenceToken;
  source: { id: string; fence: BoundedSourceFenceValues };
  // Complete bounded producer-owned fact/resolver inputs. The list may be
  // empty. It contains no trusted routing identity; the server independently
  // resolves the complete applicable binding/recipient set and canonical order.
  candidates: readonly ProducerIntentInput[];
};

type InternalGeneratedPlanAdapterAuthority = {
  // Code-generated, server-only registry handles captured by the exported
  // producer adapter. They are never request fields or standalone authority;
  // the resolver reloads and verifies their immutable registry projections.
  eventPlanHandle: string;
  memberBindingHandlesInCanonicalOrder: readonly string[];
};

type InternalResolvedPlanMember = {
  // Created only by the non-exported generated resolver.
  bindingContext: VerifiedServerBindingContext;
  input: ProducerIntentInput & { planMemberOrdinal: number };
};

type InternalResolvedPlanOccurrenceCommand = {
  // Authoritative even when `members` is empty; not constructible by a product
  // caller and not exported from the Phase 6 server module.
  planContext: VerifiedPlanOccurrenceContext;
  planOccurrenceTokenSchema: "plan_occurrence_token@1";
  planOccurrenceToken: BoundedOpaquePlanOccurrenceToken;
  source: { id: string; fence: BoundedSourceFenceValues };
  members: readonly InternalResolvedPlanMember[];
};

declare function compileAndReleaseCommunicationPlanOccurrence(
  request: ProducerPlanOccurrenceRequest,
): Promise<CompiledPlanOccurrenceResult>;

// Non-exported generated constant captured by the public adapter closure. It is
// neither readable nor replaceable by the product producer.
declare const generatedPlanAdapterAuthority: InternalGeneratedPlanAdapterAuthority;

// Non-exported server operation: reloads the captured registry/binding handles,
// requires one canonical handle for every candidate ordinal (or the valid empty
// member set), and turns the request into the only private compiler command.
declare function resolvePlanOccurrenceCommand(
  authority: InternalGeneratedPlanAdapterAuthority,
  request: ProducerPlanOccurrenceRequest,
): Promise<InternalResolvedPlanOccurrenceCommand>;

// Non-exported private compiler; the public adapter resolves first and passes
// only this internal command. No product caller can invoke it.
declare function compileResolvedPlanOccurrence(
  command: InternalResolvedPlanOccurrenceCommand,
): Promise<CompiledPlanOccurrenceResult>;

type ReleasedPlanOccurrenceMembers =
  | { kind: "zero_members"; intentIds: readonly []; memberCount: 0 }
  | {
      kind: "members";
      // Canonical plan-member order; `memberCount === intentIds.length`.
      intentIds: readonly string[];
      memberCount: number;
    };

type CompiledPlanOccurrenceResult =
  | {
      kind: "released";
      release: "new" | "exact_replay";
      planOccurrenceId: string;
      members: ReleasedPlanOccurrenceMembers;
    }
  | {
      kind: "conflict";
      reason:
        | "occupied_occurrence_changed"
        | "concurrent_changed_compilation"
        | "parent_or_member_identity_mismatch";
      // Returned only after same-scope authorization proves the caller owns the
      // occupied occurrence. No hash, token, recipient, or cross-owner id leaks.
      existingPlanOccurrenceId?: string;
    }
  | {
      kind: "rejected";
      reason:
        | "invalid_or_unauthorized_context"
        | "invalid_plan_occurrence_token"
        | "source_or_plan_not_current"
        | "invalid_candidate_set"
        | "recipient_bound_exceeded"
        | "internal_invariant";
      // Safe correlation only; no token, hash, recipient, or provider material.
      correlationId?: string;
    };

type WorkerCommand =
  | {
      kind: "prepare_intent";
      intentId: string;
      expectedVersion: number;
      claimFence: string;
    }
  | {
      kind: "assemble_submission";
      preparationId: string;
      expectedVersion: number;
      claimFence: string;
    }
  | {
      kind: "submit_sealed_request";
      submissionId: string;
      expectedVersion: number;
      claimFence: string;
    }
  | {
      kind: "reconcile_submission";
      submissionId: string;
      expectedVersion: number;
    }
  | { kind: "reduce_provider_event"; providerEvidenceId: string }
  | {
      kind: "resume_repair_generation";
      repairCaseId: string;
      preflightGeneration: string;
    };
```

Product callers enter through
`compileAndReleaseCommunicationPlanOccurrence`; the
single-intent function is its private transactional child primitive and is not
an independently callable producer seam. Product callers supply only the
top-level token/source and bounded producer-owned candidate facts shown above;
they cannot construct or import either verified context. The public service
is a generated adapter closure that captures its server-only top-level plan
handle and canonically ordered member-binding handles outside the producer
payload. It passes that captured authority and the request to the non-exported
resolver. The resolver rejects count/order/handle or generation mismatch, reloads
the authoritative plan context and exactly one verified binding context per
canonical member, and returns the internal resolved command; only
`compileResolvedPlanOccurrence` and its private child primitive accept that
command.
`released/new` is returned only after `released_at` commits;
`released/exact_replay` returns the same header and canonically ordered members;
`zero_members` is a successful released result, not suppression or failure.
Conflict and rejection results use the closed reason set and expose neither raw
tokens/hashes nor an existing id from another scope owner. Internal worker
messages carry ids, expected versions and fences—not rendered content, recipient
addresses, credentials, protected URLs, arbitrary fact bags, template ids,
Resend payloads, or retry overrides. `submit_sealed_request` accepts only an
id/version/fence; the adapter loads and verifies sealed bytes server-side.
HTTP/queue retries repeat the same plan-occurrence token and every bounded
recipient/channel-step member token. The server locks the same
permanent scoped slot and returns the prior result only when its server-derived
semantic-identity hash and separate complete immutable-command hash both match
under their pinned schema versions. Reuse of the token with changed meaning,
facts, relations, ordering, action, resolver input, recipient, channel step or
timing hard-conflicts before any existing row is returned.
Every result follows the repository's [mutation-wrapper
contract](../../guides/architecture/mutation-wrapper.md): one stable safe code,
human message, correlation id, retryability/field detail where applicable,
current state, responsible owner, and next safe action. It never exposes raw
provider/schema/credential evidence.

Expensive staff operations—test sends, impact compilation, bulk preflight,
foreign conversion, export, and transfer—use bounded per-scope-owner and
per-actor rate/concurrency controls with truthful queued or `429`/retry-after
responses.
A rejected request has no partial side effect. Ordinary reads and single draft
edits do not inherit needless challenge or approval ceremony.

## Permissions and Audit

Phase 12 remains the authority. Add exact capability atoms; do not create Phase 17 roles or authorize by job title:

| Capability                                                                                                           | Allows                                                               | Never allows                                                               |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `system_messages.read`                                                                                               | catalog, effective source, safe history/readiness                    | recent content, secrets, arbitrary recipient data                          |
| `system_messages.draft.edit`                                                                                         | create/edit permitted drafts and synthetic preview                   | publish, protected truth edit                                              |
| `system_messages.commit`                                                                                             | freeze candidate                                                     | publish or review own protected candidate                                  |
| `system_messages.publish.standard`                                                                                   | publish standard exact candidate                                     | protected candidate or structural override                                 |
| `system_messages.review.protected`                                                                                   | review a different actor's exact candidate                           | self-review, safety override, send                                         |
| `system_messages.publish.protected`                                                                                  | atomic approved publication seam                                     | approve without independent review                                         |
| `system_messages.review.delegate`                                                                                    | invite one verified human to review one exact candidate              | recipient/unrelated tenant data, editing, onward delegation                |
| `system_messages.restore.protected_emergency`                                                                        | restore one compatible protected baseline during a recorded incident | novel/wider meaning, invalid content, fabricated reviewer, per-send bypass |
| `system_messages.brand.manage`                                                                                       | Brand Kit and safe assets                                            | contract truth or raw code                                                 |
| `system_messages.layout.manage`                                                                                      | Role Layouts and Saved Sections                                      | hidden mandatory content or live fragments                                 |
| `system_messages.locale.manage`                                                                                      | activation/readiness and authorized locale review                    | machine approval or product-wide localization claim                        |
| `system_messages.plan.manage`                                                                                        | contract-exposed step choices                                        | workflow logic or required-step removal                                    |
| `system_messages.connection.manage`                                                                                  | Resend connection/rotation/pause                                     | reveal secrets or shared fallback                                          |
| `system_messages.sender.manage`                                                                                      | Sender Profiles and assignments                                      | credentials, arbitrary From, Reply-To                                      |
| `system_messages.reply.manage`                                                                                       | confirm destinations and map purposes                                | inbound mailbox access or dynamic routing                                  |
| `system_messages.history.read`                                                                                       | body-free history and normalized evidence                            | recent copy or provider raw payload                                        |
| `system_messages.recent_copy.reveal`                                                                                 | deliberate eligible unexpired reveal                                 | denied class, export, search, secret/action token                          |
| `system_messages.repair.manage`                                                                                      | preflight and proof-gated resume                                     | force-send, unknown replay, content edit                                   |
| `system_messages.portability.export` / `system_messages.portability.import` / `system_messages.portability.transfer` | exact bounded operation                                              | authority/publication/recipient transfer                                   |

Every material draft, commit, review, publish, dependency change, locale/policy/
plan change, connection/secret lifecycle, sender/reply assignment, quarantine,
repair, recent-copy reveal, export/import/transfer and support operation records
the exact `ExecutionScope` owner and environment, immutable target/version, safe
diff/evidence hash, reason, time, result, correlation id, and exactly one closed
actor branch:

- **tenant human** — tenant principal plus current capability/governance and
  applicable step-up epoch;
- **platform human through service** — verified service/workload identity plus
  the initiating Asym human principal, platform capability/governance and
  applicable step-up epoch; or
- **platform automation** — verified service/workload identity plus policy epoch
  and no human principal.

No branch fabricates a tenant or human. Human-triggered platform publication,
review, connection, recovery or support work cannot be recorded as automation.
Platform audit stays service-only and unreadable to tenant/client roles. Audit
contains no body, credential, action secret or arbitrary PII.

Tenant support access is not ambient. An Asym operator sees only minimized health unless a separately governed support authorization grants the exact tenant/action/time. Impersonation can never review, publish, reveal copy, rotate credentials or accept transfer.

## Staff Information Architecture and UX Contract

### System Messages workspace

Evolve the current `apps/admin/app/email` surface into **System Messages** with task-first navigation:

1. **Messages** — Live catalog rows staff can actually manage;
2. **Needs attention** — grouped publication, locale, connection, sender, reply, migration and delivery repair cases;
3. **Coming later** — quiet Reserved meanings with owner/phase and no controls;
4. **History** — publication and body-free communication evidence;
5. contextual secondary areas: **Brand & layouts**, **Languages**, and **Email delivery**.

Each Live row answers: what happened, who receives it, whether it is required, channels, effective source/scope/locale, readiness, accountable owner and one next action. Search and URL-backed filters cover product area, audience, channel, state, site and locale. The UI never displays a single misleading “Active” badge; it names catalog lifecycle, content state, tenant readiness and current problem separately.

### Message detail and editor

Before the canvas show purpose, trigger, audience, requiredness, scope/locale, inheritance source and state. The default inherited path is view/preview only with a prominent **Customize** action. A customized draft shows **Draft autosaved — published message unchanged**.

The editor has subject, preheader, visual canvas, responsive outline, contextual inspector, fake-data scenario picker, device/plain-text/blocked-image/RTL previews and a quiet **Message requirements met** panel. **Add content** is primary; slash commands are optional. Protected components show a small **Managed** indicator and plain-language source action. Every drag operation has add-before/after, move up/down, duplicate-if-allowed and delete-if-allowed controls.

Publication review leads with human consequences, not code diff: affected messages/scopes/locales, protected reason, requiredness, fallback/recipient effects, sender/reply identity, responsive/text/RTL previews, current-live continuity and validation. Technical hashes are progressive disclosure.

### Delivery and settings UX

- Fallback uses two consequence-focused radio cards and a synthetic resolution trace.
- Languages uses a simple readiness checklist per locale and message blockers, not a giant site-locale matrix.
- Brand/Layout uses live representative examples, dependency usage and complete override actions; tenants do not feel locked out, but unsafe controls are absent with explanation.
- Email delivery is one guided setup/status card with Default Sender, human reply, domain/key/webhook proof and one next action.
- Sender Profiles are Default-first and sparse; **Why this sender?** explains resolution.
- Reply destinations show “access confirmed” and “monitoring responsibility recorded” as separate facts.
- Needs attention groups related failures and offers one safe action plus recipient impact.
- History is readable without revealing content; an eligible tenant recent copy is one deliberate, time-limited secondary action.
- Import/transfer is Choose → Review → Finish with explicit loss and “drafts only” reassurance.

### Required complete states

Every surface specifies initial loading, empty, inherited, partially ready, validation error, authorization lost, stale revision, concurrent edit, offline/network failure, provider unavailable, indeterminate, quarantined, migration required, no results, partial bulk result, success, and recovery. Skeletons never imply real data. Optimistic UI cannot claim publish/send/delivery before the server commits evidence.

## Recipient UX and Copy Principles

1. Put the truthful reason and next safe action first; omit platform/provider jargon.
2. Clearly separate `Submitted`, `Processing`, `Sent`, `Delivered`, `Could not deliver`, and business truth.
3. Never say “read,” “aware,” “received,” “paid,” “stopped,” or “resolved” without the owning evidence.
4. Required service messages stay service messages. Optional warmth is concise, respectful and non-soliciting.
5. Protected actions state what will happen after deliberate confirmation; landing pages explain expired/already-used/no-longer-applicable states without leaking account existence.
6. Plain text is complete and usable, not an afterthought. Images are optional to comprehension. Links are descriptive and visible; primary actions remain reachable with images blocked.
7. `lang`, direction, number/date/currency formatting and bidi isolation follow the effective locale and source-owned time/currency facts.
8. From display, Reply-To expectation, tenant identity and site branding are consistent and explainable.

## Security, Privacy and Abuse Resistance

### Required threat model

The implementation threat model must cover at least:

- **Cross-tenant access:** forged tenant/site/template/publication/asset/profile/reply/recipient/provider/import ids; cache-key collision; cursor/realtime leakage; support access; provider metadata routing.
- **Server-side template injection and XSS:** crafted JSON, unknown nodes, attribute/URL injection, unsafe paste, bidi/control characters, subject/header injection, malicious asset, preview origin escape, plain-text deception.
- **Protected-action abuse:** scanner/prefetch completion, replay, expiry, wrong recipient/tenant/site/environment, open redirect, Host/forwarded-host confusion, action-token leakage, simultaneous redemption, replacement race.
- **Credential and webhook compromise:** Full-access key, secret logging/client exposure, wrong connection, webhook forgery/replay/reordering, signature-after-parse, ambiguous event binding, key rotation/disconnect race.
- **Email identity and phishing:** arbitrary/deceptive From, lookalike Unicode display, multiple Reply-To, dynamic per-recipient sender, tracking redirect around a protected action, unverified domain, misleading no-reply posture.
- **Privacy and data retention:** donor/care/restricted fields in contract/fixture/log/recent copy; raw provider payload; full click URL/network data; support reveal; expired ciphertext; offboarding/export; Phase 10 reclassification.
- **Import/asset attacks:** zip bombs, path traversal, parser bombs, malicious Unicode, scripts/forms/iframes, CSS exfiltration, SSRF, redirect/DNS rebinding, metadata/private IP, polyglot images, partial-job residue, cross-tenant transfer race.
- **Authorization and review bypass:** role-name trust, inactive assignment, stale capability/governance epoch, self-review, split/renamed protected change, impersonation/service account, GET mutation, bulk mutation, stale draft/publish CAS.
- **Reliability abuse:** duplicate intents, occurrence-slot or semantic-hash collision, provider timeout, batch validation rejection, webhook loss, retry storm, poison message, noisy scope owner, backlog resume flood, stale generation during deploy.
- **Compliance bypass:** caller-chosen classification, marketing prose in required service mail, SMS inferred consent, STOP override, engagement-as-completion, provider acceptable-use ambiguity.

Permanent controls are structural: typed contracts, server compiler, scope-prefixed foreign keys plus tenant RLS and platform service isolation, immutable versions, allow-listed destinations/headers, exact recipient projections, purpose-derived consent, one dispatch seam, permanent idempotency, signed raw-body webhook verification, content/secret minimization, no-execution import, bounded queues and fail-closed state. UI warnings alone are not controls.

### Content security

- Sanitize and validate before compilation; escape again at recipient binding by output context.
- Preview uses a sandboxed distinct origin or equally strong isolation with restrictive CSP, no scripts/forms/popups/top-navigation/same-origin privilege and no uncontrolled remote resources.
- Assets are immutable tenant-owned references with verified media type, safe decoding/re-encoding, size/dimension limits, alt/decorative classification and non-destructive publication retention.
- Ordinary URLs allow only approved HTTPS/mailto policies by contract; protected operations use D6 nodes. No userinfo, credentials, unsafe scheme, protocol-relative URL, javascript/data execution or hidden redirect.
- Rendered HTML and plain text must not contain secrets, payment credentials, raw provider errors, internal ids not explicitly safe, care/restricted fields or arbitrary custom-record values.
- Open/click tracking is disabled on the governed transactional domain unless a later explicit contract and provider/privacy review authorizes a narrow safe case. Tracking never supplies business truth.

### Privacy and retention

Each contract has a Phase 3 record-policy entry covering source facts, intent, prepared hashes, provider evidence, event, in-product preview, recent copy, test evidence, import raw content and audit. Data is minimized before storage, not merely hidden. Tenant export/offboarding includes tenant-authored source and body-free history under existing policy, but excludes secrets, provider raw payload and other tenants' system defaults. Right-to-delete/anonymize modifies permitted Party/contact projections while preserving legally required body-free evidence and official artifacts; it never rewrites what was sent.

Provider retention is external custody, not Asym history. Current Resend retention and logs are documented in the research appendix and must be re-verified at build time. The product does not fetch provider bodies to reconstruct expired content.

## Reliability, Failure Modes and Recovery Guarantees

| Failure                                               | Required permanent behavior                                                        | User-visible truth                                  |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------- |
| Draft save race                                       | expected-revision conflict; preserve both paths                                    | “A newer edit exists”; compare/reload/save copy     |
| Commit/publish transaction fails                      | prior publication/head remains; draft/candidate intact                             | “Published message unchanged”                       |
| Shared dependency becomes invalid                     | quarantine future resolution, calculate impact, open one repair case               | affected messages/count and one repair action       |
| Requested locale missing                              | run exact D3 compatible resolver or contract block/suppress                        | effective language/source or exact blocker          |
| Required fact missing                                 | preparation fails before provider, no degraded blank truth                         | content owner/source fact blocker                   |
| Optional fact missing                                 | execute declared null behavior only                                                | valid omission/fallback copy                        |
| Recipient/consent/role changes                        | dispatch reproof suppresses/expires safely                                         | exact reason; no stale address/role send            |
| Resend key/domain/webhook not Ready                   | fence provider crossing; preserve intent                                           | Needs tenant action / Paused / Provider unavailable |
| Provider call definitely rejected                     | same prepared identity may retry only per policy                                   | Not sent / retrying; never Delivered                |
| Provider call times out                               | mark indeterminate, reconcile; no replacement send                                 | Outcome indeterminate                               |
| Webhook duplicates/reorders/conflicts                 | dedupe and monotonic reducer; quarantine conflict                                  | last verified provider state plus investigation     |
| Batch validation rejects one item                     | no item assumed submitted; fix/preflight exact recipients                          | per-recipient blocked reasons                       |
| Some accepted batch items later fail                  | independent outcomes and repair                                                    | accurate partial result                             |
| Compiler/editor unavailable                           | previously frozen valid required artifacts remain usable                           | authoring unavailable; delivery continuity          |
| Unsafe publication discovered                         | quarantine without history mutation; D3/D15 path                                   | current safe source or blocked repair               |
| Protected action expired                              | producer reissues under new identity if still applicable                           | expired action and safe restart                     |
| Recent copy expires/purges                            | history and retry unaffected                                                       | content no longer retained                          |
| Import/conversion partially fails                     | isolate, cancel, clean partial assets/drafts or report exact retained safe outputs | Ready / Needs choice / Changed / Cannot use         |
| One scope owner becomes noisy or provider rate-limits | scope-owner-fair queue/backoff/circuit; critical lanes protected                   | delayed, not lost; retry/repair evidence            |
| Deploy generation mismatch                            | N/N-1 manifest compatibility or refuse activation                                  | no unknown-key send; operator alarm                 |

No error path may silently choose another tenant, provider account, sender, reply mailbox, recipient, locale, publication, action or business fact. No recovery path changes a prepared payload under the same semantic identity.

## Observability and Operations

### Low-cardinality metrics

Record counts/latencies by environment, catalog key, channel, lifecycle/state,
cause class and a low-cardinality scope-kind/owner hash only where
operationally necessary; no tenant label is invented for platform work:

- contract emissions accepted/rejected/unknown-key/retired-key;
- plan-occurrence compile/replay/conflict/zero-member/bound-rejection counts,
  member-count distribution and release latency; never recipient identities;
- intent-to-preparation, preparation-to-provider, provider-to-terminal latency;
- resolver candidate outcomes and cross-language fallback counts;
- compile/cache hit/failure/migration/quarantine;
- publication/review conflict and stale-review counts;
- connection/sender/reply readiness and drift;
- provider accepted/rejected/indeterminate/bounce/complaint and webhook lag/duplicate/conflict;
- notification projection/count/realtime recovery;
- recent-copy creation/reveal/expiry/purge by policy class, never content;
- repair cases opened/aged/repaired/recurred and resume partition counts;
- import conversion outcomes, cleanup age and SSRF/security rejection class; and
- queue depth, scope-owner fairness, rate-limit/backoff and poison isolation.

Logs contain correlation, scope-safe hashed identifiers, stable key/version/state/cause and evidence hashes—not email address, subject/body, action URL, API key, webhook secret, provider raw body, Party name, full click URL, IP or user agent.

### Alerts and runbooks

Alert on unknown/Retired key emission; missing Live activation proof; manifest skew; cross-tenant relational/policy rejection; a committed unreleased plan-occurrence header; plan compilation count/digest/ordinal invariant failure; required-message preparation failure; auth hook deadline/error; sustained provider indeterminate state; webhook signature/conflict/lag; duplicate semantic/provider submission; connection/domain drift; queue starvation; compiler nondeterminism; quarantine fan-out; overdue purge; import residue; notification count drift; and repair recurrence.

Each alert names owner, impact, diagnostic query, safe containment, reconciliation path, rollback/kill control and recovery proof. Kill controls are narrow: quarantine a publication/dependency, pause one tenant connection, fence one contract generation/producer, stop one backlog resume or disable one optional step. There is no global force-send or provider switch.

### Capacity and performance

- Size queues and indexes from the measured producer census plus documented headroom for the next forecast period; do not prebuild speculative sharding.
- Keep preparation deterministic and cached by immutable skeleton/dependency hash; recipient binding remains bounded by contract collection limits.
- Use keyset pagination for catalog/history/notification/repair lists and eliminate per-row producer/provider queries.
- Apply scope-owner-fair scheduling through one adapter policy whose M0 baseline is the 2026-07-19 rate-specific Resend documentation (10 requests/second/team; maximum batch 100) but whose runtime limiter consumes current response headers and typed 429 evidence. Tenant owners and the service-only platform owner remain isolated; fairness never permits mixed-scope work. Re-verify at build/release; do not turn a dated documentation value into permanent product semantics.
- Separate latency-critical auth/security/receipt lanes from optional aggregation while preserving the same one-writer contract.
- Load tests use realistic long locales, maximum approved collections, high tenant counts, bursty receipts, provider 429/5xx, webhook delay/reorder, and one noisy scope owner. Acceptance requires measured headroom and no starvation, duplicate, cross-owner leak or unbounded memory/row growth.

## Migration and Cutover

### Migration principles

1. Inventory before mutation. Every direct sender, template/binding, provider path, notification artifact, legacy Unlayer publication and historical category gets an owner/disposition.
2. No big-bang dual authority. Migrate one producer family behind the Phase 6/17 seam, shadow-compare where safe, then fence the old writer.
3. Preserve last-known-good artifacts and history. Never rewrite legacy messages, fabricate reviewer evidence, or auto-convert/publish content.
4. Backfill facts only when evidence exists. Unknown remains unknown; singular sender/reply values become drafts/Needs confirmation as specified.
5. One active read and write authority per seam. Dual-write is bounded, reversible and observed; it does not continue indefinitely.
6. Rollback preserves new append-only evidence and routes new work only through an explicitly compatible prior manifest/publication/adapter.

### Ordered build and cutover

**M0 — Freeze the census and contracts.** Land the complete runtime/obligation/exclusion inventory, stable catalog keys, typed definitions, generation compiler, source ownership, purpose mapping, fixtures and repository direct-send closure gate. Record all build-time UNKNOWN/VERIFY probes from the research appendix.

**M1 — Establish scope-safe storage and the Phase 6 spine.** Add the exact exclusive tenant/platform owner and recipient arcs, generated scope-owner keys, same-scope composite constraints, the small plan-occurrence coordination header and atomic release compiler, immutable versions, intents, preparations, attempts, events, audit and outbox/worker semantics. Tenant rows require tenant RLS and same-tenant relations; service-only platform rows deny every tenant/client role and require exact platform authority/profile revisions. Adapt current `email_send_logs`/`email_events` without a second history. Prove no fake tenant or cross-scope selection, complete-set/zero-member idempotency, provider-boundary and N/N-1 deployment before a Live producer.

**M2 — Establish delivery identity.** Evolve `tenant_email_settings`; implement tenant-owned Resend setup, encrypted revisions, per-connection signed webhook, Default Sender, human reply destination and composed immutable delivery snapshots. Universal tenant-BYOK rollout MUST remain blocked until a separately owned customer-account bootstrap/recovery contract and its recipient/action authority are Live. For the current no-platform-key generation, prove the service-only platform schema, exclusive arcs, authorization denial, and no-fallback behavior without provisioning a credential or test key. Provisioning, canary, and positive platform delivery proof occur only in the same release as the first exact meaning-specific Live platform key and ratified recipient-authority branch. Prove no tenant fallback, cross-scope selection or request-level override.

**M3 — Establish canonical authoring/publication.** Implement structured schema/compiler, synthetic fixtures, draft CAS, immutable commit/publication, D11 review, Brand Kit, Service/Protected Action layouts, whole-message inheritance, D3 resolver, locale readiness and safe legacy read-only behavior.

**M4 — Ship the receipt tracer end-to-end.** Adapt
`giving_receipt_issued_v1` from current receipt prototype evidence to Phase 7
source issuance/facts, the exact current Phase 18 artifact, Phase 6 intent,
Phase 17 content/preparation, D10 Resend, and body-free history. Before traffic
moves, check in an exact cutover map from each
legacy receipt occurrence/idempotency identity, writer, send-log/provider id,
reader, and FK to the new source occurrence, producer-authorized occurrence
slot, server-derived semantic identity, preparation, provider-message identity,
and compatibility reference. Shadow comparison uses
a no-provider-I/O path and proves equivalent source eligibility, recipient,
artifact, content hash, sender/reply, and suppression result. Then canary one
writer behind a reversible fence, prove zero duplicate sends and complete late
webhook/FK attachment, move readers, and only then cut the old direct writer.
Rollback restores one writer without changing semantic identity or discarding
new append-only evidence. This proof is required before any other key becomes
Live.

**M5 — Migrate contribution correction family.** Map every real current variant to its stable key; keep `refund_started` non-Live pending evidence; preserve the contract-specific no-fallback rule; migrate replacement receipt and donor corrections one by one. Retire legacy binding authority only after history mapping and one-writer proof.

**M6 — Launch staff in-product center and approval contracts.** Adapt approval requested/reminder/escalation/outcome rows to the one Phase 6/17 model, build bell/center/context destinations, group meaningful episodes and remove direct email content paths after parity.

**M7 — Complete tenant controls.** Deliver Delivery Plans, all required settings/editing/review/readiness/impact surfaces, optional Sender/Reply mappings, Recent sent copy, repair cases, locale activation and full accessibility/usability validation.

**M8 — Complete portability and negative SMS posture.** Land signed native package, finite foreign conversion, bilateral transfer, cleanup/retention and structural no-SMS tests. Do not ship dormant Twilio code.

**M9 — Activate remaining Target Live keys and close bypasses.** Each key advances only with its proof bundle. Run repository/runtime census, block unknown direct sends, verify one writer/read authority, remove compatibility fields only after call-site closure, publish runbooks/evidence and rehearse rollback.

### Rollback

Every milestone has reversible schema expansion and a named traffic fence. Rollback never deletes new evidence, reopens immutable versions, re-enables an ungoverned direct sender alongside a governed writer, or changes prepared identity. If a new generation is unsafe, quarantine/fence it and activate a previously proven compatible generation for future work; reconcile already-prepared/provider-indeterminate items under their original pins.

## Testing Decisions

Tests use the repo's real harness, production-equivalent compiler and database policies. Mocks may isolate vendor failures but cannot replace at least one signed Resend webhook fixture, delivered-header capture, Node production render, database concurrency test, accessible browser flow and end-to-end Live tracer. Every negative test proves both rejection and zero side effect.

The following stable conformance IDs are release blocking and complement the scenario suites below:

| ID               | Required proof                                                                                                                                                                                                                                                                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `P17-REV-01`     | every platform publication predicate produces the exact protected reason code/floor                                                                                                                                                                                                                                                                                          |
| `P17-REV-02`     | one protected consumer elevates a shared dependency candidate and enumerates its complete fan-out                                                                                                                                                                                                                                                                            |
| `P17-REV-03`     | split/rename/client-floor/stale-generation/role-switch attempts cannot evade protection                                                                                                                                                                                                                                                                                      |
| `P17-REV-04`     | author/editor, impersonation, shared/service identity, stale permission/governance epoch, and stale head cannot approve                                                                                                                                                                                                                                                      |
| `P17-REV-05`     | delegated review is exact-candidate, synthetic-only, expiring/revocable, and non-reusable                                                                                                                                                                                                                                                                                    |
| `P17-REV-06`     | emergency restoration permits only compatible system default or previously reviewed same-tenant content and rejects new/wider meaning                                                                                                                                                                                                                                        |
| `P17-ACT-01`     | scanner/prefetch/GET/HEAD/redirect/refresh causes zero producer mutation or credential consumption                                                                                                                                                                                                                                                                           |
| `P17-ACT-02`     | POST requires exact tenant/actor/source/issuance/current-state proof plus CSRF/origin and idempotency under double-click/race/timeout                                                                                                                                                                                                                                        |
| `P17-ACT-03`     | host/forwarded-host/open-redirect/environment/tenant/recipient/terminal-state attacks fail safely                                                                                                                                                                                                                                                                            |
| `P17-ACT-04`     | no-store/no-referrer/no-third-party/redaction plus a fresh cryptographically random 128-bit-or-stronger response nonce, exact header/style nonce match, code-owned-route CSP source serialization with delimiter rejection and policy round-trip, and zero literal placeholders prevent protected handle, token, OTP, hash, and URL leakage                                  |
| `P17-AUTH-01`    | signup/invite/magiclink/recovery/reauthentication, both Secure Email Change messages, and the Secure Email Change-disabled path use exact recipient/token/hash mapping                                                                                                                                                                                                       |
| `P17-AUTH-02`    | all adopted Supabase security-notification types expose only exact typed facts and no generic credential-bearing variable                                                                                                                                                                                                                                                    |
| `P17-AUTH-03`    | raw-body Standard Webhooks signature/timestamp/project binding plus same-id replay and changed-digest conflict                                                                                                                                                                                                                                                               |
| `P17-AUTH-04`    | five-second hook path covers definite reject, accepted, possible acceptance, replay, and zero duplicate mail                                                                                                                                                                                                                                                                 |
| `P17-RSE-01`     | sent/delayed/delivered duplicates and all out-of-order permutations reduce monotonically                                                                                                                                                                                                                                                                                     |
| `P17-RSE-02`     | failed/bounced/suppressed/delivered/complained remain distinct and contradictions quarantine                                                                                                                                                                                                                                                                                 |
| `P17-RSE-03`     | exact signed Resend lifecycle fixtures map correctly without claiming fixture delivery is inbox proof                                                                                                                                                                                                                                                                        |
| `P17-RSE-04`     | provider suppression is region/contact-revision scoped, separate from consent, non-clearable per profile, and complaint absence remains unknown                                                                                                                                                                                                                              |
| `P17-HDR-01`     | a delivered canary preserves `Auto-Submitted: auto-generated` and every tenant/import override fails                                                                                                                                                                                                                                                                         |
| `P17-HDR-02`     | optional subscribed mail has visible unsubscribe plus DKIM-covered RFC 8058 headers; GET is inert and both allowed POST encodings are exact, idempotent, cookieless, unauthenticated, and non-redirecting                                                                                                                                                                    |
| `P17-CON-01`     | non-mutating access probe distinguishes overprivileged, least-privilege, invalid, rate/quota, provider/network, and unknown-schema outcomes                                                                                                                                                                                                                                  |
| `P17-CON-02`     | per-connection limiter consumes observed rate/quota/retry headers and isolates tenants                                                                                                                                                                                                                                                                                       |
| `P17-CON-03`     | webhook disablement becomes Needs tenant action; signed test/replay/reconciliation repairs evidence without blind resend                                                                                                                                                                                                                                                     |
| `P17-CON-04`     | only `resend_sending_key` is instantiable and every OAuth/other-provider path is structurally dark                                                                                                                                                                                                                                                                           |
| `P17-CON-05`     | rotation/compromise/disconnect/domain/team/region migration preserves pins, fences new work, reconciles indeterminate work, and forbids cross-account replay                                                                                                                                                                                                                 |
| `P17-SCOPE-01`   | every current profile/key/projection explicitly declares tenant scope; the tenant/platform owner and recipient arcs, scope-prefixed FKs/keys/indexes, single-scope batch, service-only RLS, fixed platform connection, verified authority revision, no-fake-tenant migration, and Eve email/Discord ownership boundary all pass positive-and-negative database/service tests |
| `P17-RPY-01`     | unauthorized start/complete, spray, brute force, forwarding, scanner, replay, wrong context, expiry, and concurrent replacement cannot activate Reply-To                                                                                                                                                                                                                     |
| `P17-RPY-02`     | challenge proves access-at-a-time only, monitoring responsibility stays separate, and prior Ready destination survives failed replacement                                                                                                                                                                                                                                    |
| `P17-ID-01`      | valid localized/RTL names round-trip while controls/injection/bidi override/fake-thread/variable/deceptive-collision/provider-mutation cases fail or receive required protected review                                                                                                                                                                                       |
| `P17-ERASURE-01` | live purge removes every durable live copy, invalidates worker leases/processes that could hold bounded plaintext, and prevents restored systems from decrypting a tombstoned revision before serving traffic                                                                                                                                                                |
| `P17-ERASURE-02` | any recoverable backup forces Backup expiry pending; only irreversible key denial/destruction plus restore proof records Cryptographic erasure verified                                                                                                                                                                                                                      |
| `P17-RET-01`     | every email contract freezes one closed prepared-material class and nonextendable purge deadline; batch retention is the earliest member deadline                                                                                                                                                                                                                            |
| `P17-RET-02`     | every terminal trigger denies decryption immediately, purges primary material within 24 hours, preserves body-free truth, and wins submit/webhook/lease/erasure races without replay                                                                                                                                                                                         |

### 1. Catalog and producer closure

- mechanically census all direct `sendEmail`/Resend/template/binding/queue writers and compare to the inventory;
- fail CI on an unknown, Reserved or Retired producer emission;
- prove stable-key immutability, successor behavior, generation CAS, N/N-1 deploy, rollback and historical readability;
- prove each Target Live key's owner, source/fence, recipient, facts, purpose, plan, locale, layout, sender, reply, retention, recovery and proof manifest;
- prove normal recurring success cannot mint a duplicate key and orphan `refund_started` cannot become Live by type existence; and
- prove test sends, connection tests, human replies, campaigns and newsletters remain outside catalog truth.

### 2. Contract, facts and compiler

- allow every approved node/mark/variable/case/collection/action and reject every prohibited construct;
- reject crafted/stale clients, unknown nodes, raw code, unsafe paste, header/control injection, arbitrary paths and restricted/care/payment-secret facts;
- reject a producer-supplied `recipient.safe_display_name`, producer/resolver fact collision, resolver omission, stale/wrong-tenant Party/contact authority, and any incomplete final DTO; prove synthetic preview uses only a synthetic resolver fact and preparation pins the concrete authority revision plus final DTO hash;
- test every fact type/output context/null rule/maximum collection/order/case and deterministic formatting;
- prove identical pinned input yields identical canonical source, HTML, text and hashes across preview/test/publish/production/recovery;
- prove Node production compilation without unsafe browser shim and fail on compiler/version mismatch;
- preserve malformed/unsupported content without silent strip/empty autosave;
- prove ordered migration success/loss/failure/rollback and legacy Unlayer last-known-good continuity;
- prove link/asset/alt/decorative/CSP/blocked-image/plain-text/bidi/long-locale protections; and
- prove protected core is the minimum earned unit and ordinary tenant content remains editable.

### 3. Draft, publication and review

- concurrent autosave conflict; reload/compare/save-copy; no last-write loss;
- atomic commit/publish failure at every transaction point leaves prior publication active;
- standard self-publish and tenant stricter-review paths;
- protected author/editor cannot review; different active principal/capability/step-up/governance epoch required;
- dependency/content change invalidates review; split/rename/cosmetic evasion fails; viewing alone does not mark author;
- exact-candidate approve-and-publish race/idempotency;
- one-person tenant keeps inherited/current protected publication and can use bounded delegated reviewer without data leakage;
- emergency restoration only to inherited or previously reviewed compatible content; and
- publishing, review, rollback and restoration never send or mutate prepared intents.

### 4. Inheritance, resolution, locale and presentation dependencies

- no customization stores no duplicate; customize copies exact complete source; parent update never overwrites child;
- keep, new-draft-from-parent and return-to-inheritance paths preserve history;
- exact site+locale wins; language-first and site-wording-first produce exact documented candidate orders;
- BCP 47 canonicalization, CLDR parent/same-language matching, dedupe and requested-locale provenance;
- reject foreign tenant/site, jurisdiction/document/privacy/schema/sender incompatible and quarantined candidates with trace;
- fixed/fallback-prohibited contracts ignore tenant choice; no fragment mixing or cross-language hidden merge;
- policy/candidate changes recalculate PII-free impact; prepared intent never re-resolves;
- tenant activation, requested locale, platform render capability, per-contract readiness and effective locale remain independent; partial activation and future-only deactivation show exact impact and never rewrite prepared/history facts;
- every per-contract Ready result proves complete publication, plain text, long/RTL and compatible layout; compatible fallback and blocked remain distinct; no placeholder/machine publication;
- Brand Kit/Role Layout scope, finite safe controls, protected/device-visibility floor, compiler-owned breakpoints, dependency pin, impact, quarantine, site override and language-neutral rules;
- layout-table presentation semantics versus real semantic data tables, plus images-blocked/dark/light/high-contrast/zoom/mobile/long-locale/RTL/screen-reader proof;
- Saved Section copy-on-insert proves later source edits cannot mutate publications; and
- no speculative layout/purpose/profile matrix is materialized.

### 5. Protected actions

- every adopted Supabase action type and recipient cardinality maps explicitly;
- every platform-scoped contract rejects protected-action descriptors and
  declares `action: none` in this generation;
- GET/HEAD/scanner/prefetch never mutates; POST requires current deliberate proof;
- exact tenant/site/recipient/source/environment/origin/Host/forwarded-host binding and open-redirect resistance;
- expiry, revocation, replacement, replay, duplicate submit, simultaneous race, already-complete and no-longer-applicable terminals;
- the fixed route carries a non-secret selector while an independent 256-bit
  verifier remains fragment-held; GET/HEAD/scanner/prefetch and selector
  enumeration expose no protected fact/resource, create no authorized session,
  consume nothing, and prove no identity or human intent; the one minimal pinned
  script removes the fragment from browser-visible history and prepares—but
  never auto-submits—the exact same-origin form; missing/stripped fragments have
  one safe recovery path and no raw path/query/cookie fallback; only a deliberate
  CSRF-protected POST may verify the versioned digest and establish the bounded
  non-authorizing session; current address, refresh, forward navigation, form
  action and referrer contain no verifier/PII after bootstrap; logs, analytics,
  Recent copy, support and tests retain no verifier/PII; and the product does not
  claim to erase mail-client/extension or browser-managed history outside Asym
  control;
- browser-negative fixtures prove each response uses a fresh cryptographically
  random nonce of at least 128 bits, the CSP plus sole script/style elements
  carry the exact same encoded value, no serialization placeholder reaches
  output, invalid/non-round-tripping origin or route configuration fails
  readiness, and the exact CSP blocks every script except the one pinned fragment
  bootstrap plus all fetch/beacon, images, fonts, frames, external style and CSP
  reports; `form-action 'self'` permits only the same-origin deliberate POST,
  while exact route, method, Origin, Fetch Metadata, CSRF, authorization and state
  checks remain authoritative; every protected response proves
  `Cache-Control: private, no-store, no-transform, max-age=0`,
  `CDN-Cache-Control: no-store`, and `Vercel-CDN-Cache-Control: no-store` through
  the actual Vercel/CDN route; and supported mail-client/webview/scanner fixtures
  prove fragment preservation with no unsafe fallback;
- tracking remains off and ordinary links cannot impersonate/redirect protected action;
- auth hook deadline/failure/rollback/key rotation; and
- authenticated payment/recurring action and provider reconciliation without direct email mutation.

### 6. Delivery Plans

- compile every allowed required/optional slot and reject every arbitrary event/timer/recipient/channel/graph/branch/code/record mutation;
- required step cannot be removed/delayed/reclassified; optional change is future-only;
- deterministic complete plan inheritance and publication races;
- a two-step contract resolves two immutable binding id/version + event/step/channel/publication-slot identities, while unknown/stale bindings reject before slot or intent insertion and swapping a binding with another step's token hard-conflicts;
- the bounded occurrence compiler proves the exact expected recipient-step set, inserts the unique parent then every child and releases the parent in one transaction, and exposes no header or eligible child when faults occur after header insertion, after any child, before release, or before commit;
- crash after commit/before response and concurrent identical compilers return the same released parent and complete child set; concurrent changed/disjoint membership, missing/extra/duplicate/swapped children, reused member token, ordinal gap/duplicate, changed source/plan/generation/binding/recipient/condition/channel/count/digest, partial recipient-resolution failure, and publication/fence races hard-conflict atomically;
- zero-recipient, all-optional-disabled, and condition-false occurrences commit one exactly replayable released zero-member header; a later plan/role/contact change under the same occurrence token cannot manufacture children;
- claims polling during compilation see no child and see every due child after release; exactly-at-bound commits, bound-plus-one writes nothing, mixed owner/environment rejects, and one logical occurrence is never chunked;
- all recipient intents durably exist before dispatch; group and child semantic dedupe survive retry/restart;
- current source/role/contact/consent/suppression/identity reproof at dispatch;
- independent sibling outcome and same-step repair; no business completion from engagement;
- complete plan compare, synthetic source/locale/channel/consent/suppression/unavailable simulation, restore-as-new-draft, grouped occurrence history and future-only effective boundary;
- Phase 16 missionary notice only on terminal `Missed`, never per attempt/retry and never automatic outreach task;
- tenant isolation, bounded fan-out, poison item, provider outage, load/fairness and legacy cutover; and
- guided/non-drag/mobile/a11y builder with all complete states.

### 7. In-product notifications

- availability, engagement and source status remain independent under every transition;
- Information/Attention/Urgent remains code-owned; evaluation order is contract → tenant → recipient preference → current access/privacy and cannot suppress required safety;
- exactly two closed presentation policies and exact per-key source-end rules; all seven Target Live in-product keys map mechanically and a missing/unknown mapping fails closed;
- source-actionable items remain in **Needs attention** after read, omit archive while required work remains, end atomically on the key's source predicate, then remain authorized non-unread recent history for 90 days; resolved-before-view creates no unread debt or fabricated read;
- informational outcomes are **All**-only, stop unread treatment by day 30, leave user-facing recent history by day 90, and cannot have either deadline extended by archive, grouping, retry, tenant settings, or worker delay;
- two-tenant, one identity with multiple tenant/Party/role memberships, tenant switch and global-badge negative tests;
- role revocation, later account claim, merge/relink, anonymity/restriction, access-revision loss and resolved-before-view behavior, including immediate cache/cursor/realtime eviction and no later revival;
- exact semantic id conflict, idempotent projection, grouping/new-transition reopen/count, read/archive/source-terminal races, clock-boundary and UTC/DST-localized-display cases, late-purge read enforcement, old-item non-revival and rebuild;
- typed destination authorization, XSS/IDOR/open-redirect/cache/cursor/realtime/log negative tests;
- realtime outage/missed invalidation recovers by cursor; channel failures remain independent;
- one-writer migration fence, shadow comparison, no historical unread replay and no email-open-derived engagement;
- Phase 16 donor amendment and missionary terminal-miss contextual examples; and
- named-user comprehension, keyboard/screen-reader/mobile and noisy-tenant performance.

### 8. SMS structural negative proof

- schema can represent exact consent/suppression/readiness evidence without creating tenant placeholders;
- phone/email/preference/note/donation/other-tenant/legacy data never infers consent;
- STOP/withdrawal, HELP, START/UNSTOP, phone revision, Party merge, duplicate/reordered evidence and broad `do_not_contact` reduce correctly;
- preserved future gate covers exact registration component, market/use-case/sender, consent, reassignment, quiet-time, callback, operations and fresh legal/provider research without adding runtime code;
- partial/rejected/drifted registration, phone reassignment, STOP-versus-queue race, required-message suppression, callback disorder, provider/rate failure, test leakage and credential compromise fail closed;
- no API, import, template, plan, preview, test, queue, worker, credential, Twilio dependency/call, webhook, enable switch or send route exists;
- server and database reject `sms` intent/step/transport attempts;
- UI is truthful and noninteractive, with no fake progress/readiness; and
- later launch gates remain documented and require fresh research.

### 9. Resend connection, Sender Profiles and replies

- reject positively identified Full-access key; distinguish attested vs verified domain scope and network ambiguity;
- secret never appears in client/URL/telemetry/log/support/export and decrypts only with correct scope-owner/environment/connection/revision AAD;
- exact scope owner/domain/From/connection enforced for single and batch sends; no cross-owner fallback;
- raw-body Svix verification before parse, opaque per-connection routing, event dedupe/reorder/conflict/unknown id and same-scope send binding;
- Ready needs every exact proof; DNS/key/webhook/provider drift changes posture truthfully;
- key rotation, compromise, domain migration, disconnect, in-flight/indeterminate drain and cryptographic purge races;
- Default Sender, same-domain profile, fixed sparse resolution, missing versus configured-broken assignment, exact revision cutover/retire and no request/template/import override;
- From/Reply-To independence, one mailbox parsing, access challenge abuse/replay/expiry, monitoring acknowledgement, replacement and no dynamic destination;
- distinct Resend/RFC/Svix ids, real delivered-header fixture and first-class `reply_to`; no inbound capture;
- batch counts 1/2/99/100 and the exact 101-member under-byte forced-drain oracle: due-order members 1–100 become one batch at indices 0–99, member 101 becomes one governed single at index 0, every intent appears exactly once, sealed bytes/hash/key/maps are distinct, and recovery is envelope-local; count/size/age/deadline/shutdown flush, oversized/attachment/scheduled cases, exact connection+credential+domain+sender+reply+safety/latency boundary and scope-owner fairness;
- one request key/hash/bytes and contiguous member index map; strict local/provider validation, bounded single-member isolation, permissive-unreachable, exact response count/order/id proof and safe batch disable on mapping drift;
- restart/reclaim of definitely unsubmitted; exactly `concurrent_idempotent_request`, typed `provider_5xx`, and contradiction-free `network_or_timeout` allow at most two follow-up calls per sealed envelope with identical request/key inside the earliest member deadline and provider window; definitely-rejected new attempt; indeterminate no split/rechunk/rekey/replay after the window; rate/quota headers and `Retry-After`;
- exhaustive versioned mapping of every recognized Resend error type to the closed retry classes; mapping uncertainty, payload conflict, malformed/missing/unknown/contradictory evidence, and provider drift are reconcile-only, while every permitted same-key call remains indeterminate until exact proof; and
- complete six-step setup and Default-first profile/reply UX at WCAG 2.2 AA.

### 10. History, recent copy and recovery

- durable event contains required evidence but no body/personalized subject/protected URL/secret/raw provider/network payload;
- Off/7/30 tenant policy and per-contract ceiling; denied classes structurally cannot store copy;
- ordinary-30/limited-7/no-copy class allow-lists; unknown is zero; support-safe projection excludes every action/URL/secret/provider/raw/restricted value;
- inert private/no-store viewer blocks network/scripts/forms/navigation/download/prefetch/analytics, clears client state, and discloses independent Resend retention;
- seal at correct boundary, Not-sent deletion, one indeterminate identity, encryption/AAD/reveal authorization/audit/expiry/purge/reclassification;
- purge leaves official artifact/history/retry/reconciliation intact and provider body is never used to restore;
- sealed exact provider-bound artifact remains byte/hash-identical across restart, deployment N/N-1, locale/RTL/Unicode, protected action and adapter fixture while remaining distinct from Recent copy/history;
- `P17-RET-01` proves every external-required, optional-staff and in-product-only contract selects the exact closed prepared-material class, freezes the minimum deadline, and cannot extend it through tenant settings, retries, batches or migration;
- `P17-RET-02` proves acceptance, terminal rejection, no-send, idempotency-window expiry, absolute-deadline, erasure and safety triggers deny decrypt immediately, complete bounded purge/backup-state evidence, preserve body-free provider truth and never authorize replay or restoration;
- every dispatch phase/outcome transition, stale state/claim/safety fence, lease expiry, late evidence and illegal regression; exact `Unprepared`/`Prepared definitely unsubmitted`/`Submission may have begun` crash points;
- exact failure taxonomy, owner, `New preparation only`/`Revoke unsubmitted` quarantine effects and submission race, with one grouped deterministic repair case;
- recovery ladder order, compatible-prior predicate rejects wrong schema/facts/meaning/locale/layout/sender/privacy/safety epoch, protected system publication is contract-gated, siblings stay independent and content never fragment-mixes;
- crash before/after seal and before/after provider fence/call/acceptance/response persistence; exact proof before every bounded identical same-key re-call; two-follow-up-call ceiling across permitted causes; reconcile-only cause rejection; indeterminate no replacement; `invalid_idempotent_request` becomes quarantined `idempotency_payload_conflict` with no same-key retry, rekey, replay, or definite-rejection transition;
- webhook/retrieve evidence reducer, rate-vs-quota behavior and provider fixture changes;
- publish-only versus publish-and-resume preflight partitions; no success/unknown replay; reissue actions; expiry/utility/consent/source reproof;
- bounded partial resume, scope-owner fairness, systemic stop and no force-send/manual payload repair;
- delivery-repair attention renders only allow-listed cause/count/owner/action facts and rejects any hard-coded or dynamic claim that a donor was charged, contacted, retried, or made aware; and
- role-specific accessible case/preflight/result views with PII-free metrics.

### 11. Portability

- RFC 8785 canonical-manifest, per-object SHA-256, whole-package digest and detached `ECDSA_P256_SHA256_P1363@1` golden vectors are byte-identical across supported runtimes before exact round-trip is allowed;
- signature and all length/order/digest checks occur before parse/use and cover tamper, reorder, truncation, unknown/revoked/expired key, retained old public key, signing-key rotation/rollback, wrong issuer/environment, unsupported algorithm/version and reader-window expiry;
- native package exact round-trip of the portable layer succeeds only through the trusted verified lane;
- package includes hashed inert synthetic HTML and plain text with no recipient data while structured source remains the sole editable truth;
- modified/unsigned/future/unsupported package routes fail safely;
- Unlayer/Beefree/static HTML/recognized ZIP golden conversions with explicit compatible/changed/blocked/loss outcomes;
- no script/form/iframe/event/CSS/JS/vendor callback execution; archive/path/parser/Unicode/malware/resource limits;
- SSRF, redirects, DNS rebinding, metadata/private networks, unsafe schemes, polyglot/oversize/decode failures;
- destination-owned asset identity/provenance and no browser remote load;
- original foreign input remains encrypted, immutable and read-only only for the bounded job window, then is purged with proof;
- destination D5/Phase 3/D16/D12/D13/D18/D6/D11/D15/D10/D17/D20 authority reproof and drafts-only result;
- bilateral authority, exact digest, idempotent accept, revoke/accept race, source unchanged and cross-tenant isolation;
- partial job/cancel/retry/cleanup and 24h/7d/30d retention enforcement; and
- accessible Choose–Review–Finish with Needs your choice and no pixel-perfect/auto-publish claim.

### 12. End-to-end, migration and operations

- successful receipt tracer from source artifact through intent, publication, preparation, Resend, signed webhook, event, history and donor output;
- replacement/correction and every current contribution variant; no duplicate donor notice;
- approval in-product/email optional siblings and exact completion separation;
- shadow comparison with zero double send, one-writer cutover and rollback at each milestone;
- legacy templates/bindings/sender/reply/history/Unlayer classification without fictional readiness/reviewer/consent;
- unknown direct sender closure, old route fence, no revived `notification_queue`, no stale request From/Reply-To;
- deployment generation skew, database fault injection, queue crash/restart, provider 429/5xx/timeout, webhook delay/reorder and poison isolation;
- low-cardinality metrics, alert delivery independent of broken tenant email, runbook/kill/repair drills and overdue-retention alarms; and
- strict OpenSpec, formatting, link, schema, RLS/FK, migration rollback and documentation checks.

## Out of Scope

Phase 17 does **not** build:

- a tenant-authored workflow, journey, rules, formulas, SQL, cron, segmentation, query, record traversal, or arbitrary recipient engine;
- a campaign/newsletter or missionary personal-email product;
- a second communication queue, ledger, provider event store, notification truth, task system, incident platform, or support inbox;
- a Discord editor, tenant Discord channel, or replacement for Eve's bounded operational-alert channel;
- inbound email receiving, threading, reply ingestion, assignment, mailbox health, or conversation history;
- SMS rendering, templates, preview, test send, credentials, Twilio integration, registration UI, webhooks, workers, queues, or an enable switch;
- multiple email providers, multiple Resend accounts per tenant, shared Asym failover, provider-side template authority, provider profile synchronization, or a generalized transport adapter;
- raw HTML/CSS/JS editing, arbitrary React, tenant plugins, custom nodes, custom headers, custom tracking, arbitrary From or Reply-To, or dynamic per-recipient sender identities;
- a general page builder, digital-asset manager, localization suite, machine-translation publisher, real-time collaborative editor, AI content authority, experimentation platform, or universal foreign-template converter;
- official receipt/statement/PDF truth, payment truth, authorization, consent, privacy, identity, workflow completion, or producer-side business calculations;
- automatic publication, auto-approval, force-send, blind replay, cross-tenant live sync, or authority transfer through import; or
- speculative configuration rows, keys, purposes, layouts, or UI for features with no stable owner and consumer.

## Acceptance Examples

1. A new tenant with no customization sees the exact inherited system publication and can preview it without storing a copy.
2. Choosing **Customize** copies the entire effective variant. A later Asym parent update does not alter the tenant publication.
3. A French-Canadian donor on Site A receives the exact Site A + `fr-CA` variant if compatible. If missing, language-first and site-wording-first produce their documented different paths and show the chosen source.
4. A receipt cannot fall across jurisdiction/document/sender boundaries or combine a translated subject with another body's content.
5. An ordinary acknowledgement author can publish after validation. The same author cannot approve a protected receipt/action change.
6. A one-person tenant can keep the safe inherited protected publication and use a narrowly delegated reviewer; it is not forced to build an approval workflow.
7. A staff member changes warm introductory receipt copy and brand styling but cannot edit the official amount, legal donor, receipt id, tax language or protected artifact action.
8. A browser or link scanner opens a protected auth/payment link and causes no mutation. The human must deliberately continue and the producer re-proves authority.
9. A required Delivery Step is visible but cannot be removed. An optional staff email can be disabled without removing the required in-product item.
10. A recurring payment retry fails several times; the missionary receives no per-attempt noise. A terminal Phase 16 `Missed` occurrence can create one grouped, privacy-safe in-product notice.
11. A tenant has an email address but no verified Resend connection. Tenant-branded system mail remains blocked; Asym does not use a shared fallback account.
12. A connection test times out after possible acceptance. The system shows **Outcome indeterminate**, reconciles the same prepared identity and does not send a replacement.
13. A 100-item Resend batch contains recipient-grained identities. A later bounce for one recipient changes only that recipient's evidence and repair state.
14. A configured site+purpose Sender Profile becomes Needs attention. Resolution does not silently fall through to Default; D15 opens one repair case.
15. Reply-To routes giving questions to the confirmed giving mailbox while From remains the verified giving Sender Profile. A reply goes to the tenant mailbox and is not fabricated in Asym history.
16. A personalized eligible tenant Recent sent copy can be deliberately revealed before expiry by authorized tenant staff. After expiry, the body is gone while contract/publication/provider evidence remains readable; platform-scoped history never has a readable copy in this generation.
17. A restricted-person reclassification priority-purges an eligible copy; previously delivered external email is honestly non-retractable.
18. A broken required tenant override is discovered before channel materialization—external preparation or the in-product `available` event/projection. Only a complete contract-approved compatible prior/system publication may be selected; otherwise the message blocks and opens repair.
19. A publication is fixed while 42 waiting items exist. Preflight finds 30 eligible, 5 completed, 3 expired and 4 indeterminate. Only the 30 can resume; the 4 unknown are never replayed.
20. A required approval notification is read while its source remains open. It leaves the unread badge but stays in **Needs attention**; archive is unavailable with a plain-language explanation. When the exact source resolves, it becomes non-unread recent history for 90 days and then leaves user-facing feeds without rewriting the durable body-free audit.
21. A user's role is revoked while a notification page is open. The next list/detail/action/realtime operation fails closed and the item disappears without leaking preview data.
22. A tenant activates Arabic after an impact review shows 12 exact-ready contracts, 4 compatible fallbacks and 2 blocked required contracts. Activation succeeds, the two blocked contracts fail closed, each readiness state remains visible, and later deactivation affects only future resolution; neither action claims the whole platform is translated or rewrites prepared/history facts.
23. Staff insert a Saved Section, then edit the saved source. The published message stays unchanged because insertion copied content.
24. A tenant imports a foreign Beefree design. Unsupported constructs appear in **Needs your choice**; nothing executes, loads remote in the browser or publishes automatically.
25. Tenant A offers a native package to Tenant B. Tenant B accepts the exact digest and receives independent drafts/assets only; no sender, reply, approval, recipient, history or permission crosses tenants.
26. A caller tries to submit an SMS step. The request is rejected and no intent/provider row exists; the UI says SMS is planned but unavailable.
27. A producer emits an unknown or Reserved key in production. The intent is rejected, an operator alert fires, and no generic template or direct sender is used.
28. A Live key is Retired while a provider-accepted prepared message is unresolved. D15 reconciles that exact pinned message; all new intents are rejected and history keeps the retired key.
29. The editor/compiler is down. Previously frozen valid required publications continue to prepare/send; staff see authoring unavailable without delivery claims.
30. A provider webhook is duplicated and arrives out of order. Signature, event dedupe and monotonic reduction preserve one truthful outcome.
31. A provider submission remains indeterminate when its 24-hour idempotency window ends. The system keeps **Delivery outcome unknown** and body-free evidence, immediately denies access to the sealed bytes, purges primary restricted material within 24 hours and never sends a replacement; a batch cannot extend any member's earlier deadline.
32. The current manifest generation has zero Eve email keys. An Eve email request
    fails before intent creation and cannot use a generic key, tenant fallback,
    or uncataloged publication. In a later generation, after Eve #436 enumerates
    and ratifies one exact occurrence meaning and source fence, the email may use
    only its proved Live platform-scoped Phase 17 key, fixed Asym publication,
    separate Asym Resend connection, and Phase 6 provider history. Discord
    remains Eve-owned operational delivery. Neither path can select tenant data,
    tenant credentials, or a parallel email lifecycle.
33. Database and service tests attempt every cross-scope attachment: tenant data
    on a platform intent, platform authority/connection on a tenant intent,
    mixed-scope children/results, a mixed tenant/platform batch, tenant-role read
    of platform history, payload-selected scope, and a fake-tenant migration.
    Every attempt fails before provider I/O and creates no tenant-visible row.
34. Asym customer-account bootstrap/security mail requests platform delivery
    without a separately ratified app-account recipient-authority branch and
    exact Live key. It fails before intent creation and cannot borrow an Eve
    authority, tenant identity, arbitrary address, or the platform connection by
    itself.
35. An approval-outcome information item remains **All**-only. Read or archive
    may end unread treatment earlier; otherwise unread ends at day 30. At day 90
    the item leaves every user-facing query while its separately governed
    body-free communication audit remains.

## Release Gates and Evidence Package

Phase 17 is not done until all of the following are checked in or linked from a dated evidence package:

- the checked-in D1–D20 traceability matrix, with implementation/evidence anchors completed as work ships;
- the checked-in runtime/product-obligation/exclusion census and executable
  manifest, refreshed on the implementation base and at activation/cutover,
  plus the canonical census-source, obligation/exclusion,
  release-pack-allocation, and subject-coverage digests stored on the exact
  catalog generation;
- every Target Live activation proof and the successful receipt tracer;
- migrations, schema diagrams, same-tenant FK/RLS assertions plus assertions
  for the exclusive tenant/platform owner and recipient arcs, no-fake-tenant
  backfill proof, and rollback output;
- API/command contracts and permanent semantic idempotency fixtures;
- canonical document/compiler golden artifacts and migration fixtures;
- publication/review/fallback/locale/layout/plan/sender/reply/recovery state-transition evidence;
- complete tenant Resend account/key/domain/canary/webhook/header/plain-text/tracking/provider-policy evidence with secrets removed; current-generation platform schema/no-fallback/cross-scope/no-key negative proof; and, only when a meaning-specific platform key becomes Live, matching platform account/key/domain/canary/webhook and positive end-to-end evidence;
- signed webhook duplicate/reorder/timeout and provider 429/5xx/indeterminate fixtures;
- Gmail, Outlook and Apple Mail focused rendering evidence, plus Gmail/Yahoo/RFC 8058 compliance where applicable;
- WCAG 2.2 AA and ATAG-aligned keyboard, screen-reader, non-drag, focus, target, contrast, zoom/reflow, mobile, long locale, RTL/bidi, images-blocked and plain-text results;
- named-user tests: 5/5 distinguish Live from Ready and Submitted from Delivered; at least 4/5 complete ordinary customize/publish/setup/repair tasks without help; zero wrong-scope changes; every safety misunderstanding blocks release and is retested;
- tenant/role/site/locale/cache/realtime/batch/import/provider-account isolation and hostile-input security evidence;
- recent-copy and prepared-provider-material retention/reclassification/purge/offboarding, terminal-erasure race, backup-state and no-sensitive-log evidence;
- load/fairness/backpressure/headroom results based on measured inventory;
- migration shadow/cutover/one-writer/direct-send-closure and rollback drills;
- operations dashboards, alerts, runbooks, owner roster, kill controls and repair/resume drill;
- strict OpenSpec validation, formatting, UTF-8, link/path and documentation checks; and
- an explicit no-product-code-dispatch record until Conrad separately authorizes implementation tickets.

## Anti-Overengineering Guardrail

The permanent solution is intentionally bounded. It contains one contract registry, one canonical document/compiler, one draft/publication model, one whole-message resolver, two fixed fallback algorithms, one small set of earned layouts/purposes, one bounded Delivery Plan compiler, one Phase 6 communication/history spine, one Resend connection per tenant, a structurally separate platform-connection contract instantiated only when a real Live platform key needs it, one sparse sender/reply resolver, one in-product projection, one repair surface and one portability package. Discord remains an Eve operational channel rather than a generalized Phase 17 transport.

Any proposed abstraction must have at least two real consumers or remain explicit. Reject a proposed generic framework if it introduces tenant code, a rules language, arbitrary graph, provider abstraction, second queue/ledger/editor, live fragment dependency, universal converter, broad policy engine, per-field permission matrix, speculative catalog row, fake readiness score, permanent canary traffic, or infrastructure without measured need. Simplicity never removes tenant isolation, immutable evidence, idempotency, accessibility, failure recovery, source truth, tests or documentation.

## Definition of Done

Phase 17 is complete only when:

1. every ratified D1–D20 clause is implemented and traceable;
2. every current product-originated send has a catalog disposition and no unknown direct path can ship;
3. at least the receipt tracer and every other Target Live entry meet the exact Live proof—none is labeled Live on a promise;
4. tenants can safely author, preview, test, review, publish, inherit, localize, brand, assign sender/reply identity, inspect history, and repair without technical knowledge;
5. producing domains cannot be bypassed for truth, recipient, action, consent, privacy or completion;
6. Phase 6 is the one recipient-specific intent/dispatch/provider/history writer;
7. Resend-only tenant transport is least-privilege, tenant-owned, proof-gated and has no shared fallback;
8. required messages remain safe through authoring failure, ordinary invalid overrides and bounded recovery without duplicate or blind send;
9. in-product notifications, recent-copy retention, SMS reservation and portability meet their exact safety boundaries;
10. all acceptance, security, accessibility, concurrency, migration, provider, load, recovery and rollback tests pass;
11. the PRD, manifest, active OpenSpec delta, ADRs, canonical vocabulary,
    congruence/traceability/census evidence, roadmap, and status documents agree,
    and dated research has been reverified without being mistaken for product
    authority; and
12. no ticket is marked `ready-for-agent` and no implementation is dispatched without a separate explicit founder decision.

## Further Notes

- For this SiteStacker parity program, the word **spec** means this repository PRD plus its normative manifest, OpenSpec delta, ADRs, and dated congruence artifacts. It does not mean a tracker-issue specification.
- Phase 17 is groomed planning, not implementation dispatch. Epic #873 and
  children #874–#905 are published as the implementation-ready decomposition,
  but every child remains `status:blocked`; no child may receive
  `ready-for-agent`, and product-code work requires a separate explicit decision
  from Conrad.
- `issue: 905` · `disposition: superseded_by_phase_18` ·
  `dispatch: blocked_from_dispatch` ·
  `unblock_condition: body_amended_to_phase_18`. Its published phrase “source-owned
  Phase 7 receipt artifact” is obsolete. The receipt tracer must instead bind
  Phase 7 source issuance/facts to the exact current Phase 18 artifact before
  Phase 17 prepares or delivers the wrapper. This repo disposition is
  controlling until the GitHub body is explicitly corrected; no implementation
  may follow the stale ownership sentence.
- Provider behavior, limits, compliance guidance, and client compatibility are dated evidence. Implementation and release must reverify the exact current Resend and recipient-client contracts rather than treating the research snapshot as permanent vendor truth.
- The PRD, executable manifest, OpenSpec delta, ADRs, census, decision-to-test traceability, and cross-PRD congruence package form one contract set. Any unresolved disagreement among them blocks issue publication, implementation dispatch, and Live activation.

## Authority Tiers and Research References

- **Normative observable behavior:** merged OpenSpec is the current baseline;
  the active Phase 17 OpenSpec delta is the proposed behavior that must be
  promoted through the repository's OpenSpec process.
- **Normative implementation interface:** this PRD and the executable manifest
  specify the detailed Phase 17 contract and must agree with the active delta.
- **Normative architecture:** canonical `docs/adr/0025`–`0032` record accepted architectural
  choices but cannot override observable behavior.
- **Derived activation and reconciliation evidence:** the dated census,
  decision-to-test register, congruence package, and canonical `CONTEXT.md`
  vocabulary prove coverage and compatibility. They do not create alternate
  product behavior.
- **Informative research evidence:** the dated research appendix records
  sources, observations, inferences, and unknowns. It is deliberately not
  product authority.

Implementation must pin and re-verify exact current versions and limits before
coding, especially Resend SDK/API/batch/idempotency/webhook/tracking/retention
behavior, Supabase Auth Hook payload/deadline, React Email/Tiptap server
rendering, Gmail/Yahoo sender rules, RFC 8058, WCAG 2.2/ATAG, and
Unlayer/Beefree import formats. Vendor documentation informs transport and
compatibility; it never overrides the Asym product contract.

## Dated Phase 21 D19 Support Workspace notification-content amendment (2026-08-01)

Phase 21 owns the support event meaning and prospective Support Workspace
Notification Preference Version; Phase 12 owns the current recipient projection
authorization; Phase 17 owns only the governed content, locale, sender, and
prepared-message contract; and Phase 6 owns recipient-specific intent,
send-time safety, dispatch, outcome, suppression, and history.

A spouse, participant, coach, leader, staff role, prior delivery, or template
selection never establishes recipient authority. Preparation uses only the
minimum purpose-approved alias-safe facts for one exact Support Assignment and
source fence. Immediately before release, the Phase 6/12 path re-proves the
current principal/Party binding, Active Tenant Assignment, Tenant, Legal Entity,
Support Assignment, purpose/projection/floor, preference, source eligibility,
contact point, consent, and suppression. Revoked or stale queued work is not
sent, and no template or delivery result becomes participant, access, or Field
Account truth.

## Dated Phase 21 D22 prospective-expense notification-content amendment (2026-08-01)

Phase 21 owns whether one exact D22 stage is eligible for notice; Phase 12 owns
current recipient authorization; Phase 17 owns only the governed content,
locale, sender, and prepared-message contract; and Phase 6 owns recipient
intent, send-time safety, dispatch, suppression, outcome, and history. D22 adds
no executable message key before the Phase 21 specification defines an exact
trigger/facts/action contract.

Any later D22 content must use an opaque request reference, a plain-language
stage or requested action, and only minimum target/due context. It must omit
quotes, itineraries, destinations, vendors, companions, health/security or
restricted-location facts, evidence, private notes, reviewer internals, and
unnecessary amounts. It must never call planned or approved work reserved,
incurred, substantiated, reimbursable, guaranteed, available, payable, paid,
posted, synced, or reconciled. Current authority and suppression are re-proved
at Phase 6 release; template selection or prior delivery grants nothing.

## Dated Phase 21 D24 expense-collaboration notification-content amendment (2026-08-02)

Phase 21 owns whether one exact D24 invitation, preparation,
claimant-confirmation, conflict, revocation, or safe next-action occurrence is
eligible for notice. Phase 12 owns current recipient authorization; Phase 17
owns only governed content, locale, sender, prepared-message identity, and
protected-action presentation; and Phase 6 owns recipient intent, send-time
consent and suppression, dispatch, delivery outcome, and history. D24 creates
no executable key until the executable manifest separately admits an exact
trigger, fact allow-list, action, recipient resolver, and proof pack.

Any later D24 message uses an opaque claim or invitation reference, one safe
plain-language stage or requested action, and only minimum timing context. It
must omit receipt/evidence content or URLs, private notes, claimant-only
assertions, sensitive merchant/location detail, unnecessary amounts, reviewer
internals, and broad financial context. It must not call helper-prepared work
claimant-confirmed, submitted, reviewed, approved, reimbursable, payable, paid,
posted, synced, or reconciled.

Protected actions land on an authenticated, request-time-authorized Asym
surface; email links, invitation delivery, template choice, relationship,
Assignment, or prior delivery grant nothing. Phase 6/12 re-proves recipient,
Tenant, Legal Entity, claimant/helper scope, purpose, current Claim and
Assignment Versions, evidence-safe projection, governance epoch, consent, and
suppression before release. Content and history preserve recipient/message
truth separately from claimant, preparer, submitter, confirmer, reviewer,
approver, beneficiary/payee, and actual actor principal action truth.

## Dated Phase 21 D25 expense-resolution notification-content amendment (2026-08-02)

Phase 21 owns whether one exact D25 action or source-owned outcome is notice-
eligible; Phase 12 owns current recipient authorization; Phase 17 owns only
governed content, locale, sender, prepared-message identity, and protected-
action presentation; and Phase 6 owns intent, consent/suppression, dispatch,
outcome, and history. D25 creates no executable key until the manifest admits
an exact trigger, allowed facts, recipient resolver, action, and proof pack.

Content uses an opaque reference, one plain-language action or wait reason, and
minimum timing. It omits receipt/evidence URLs, merchant/location detail,
claimant-only facts, private notes, internal lifecycle reasons, reviewer
internals, provider/accounting details, and language implying approved,
reimbursable, owed, funded, available, payable, paid, Field Account-included,
statement-corrected, posted, synced, or reconciled. Protected actions land in
authenticated Asym; email reply, delivery, failure, silence, and timeout cannot
answer, decide, correct, dispose, or complete a Resolution Case.

## Dated Phase 21 D26 records-export notification-content amendment (2026-08-02)

Phase 17 may prepare content only after a separately admitted exact D26 source
occurrence. Any message uses an opaque package or records-review reference, one
safe state, the exact staged-byte expiry or records-only retrieval deadline
where applicable, and an authenticated deep link. It never attaches a package,
uses a public or reusable URL, exposes record counts or filenames that reveal
scope, includes receipt/location/payroll/provider content, or claims that a
download is a backup, legally sufficient archive, custody transfer, hold
release, source disposal, or deletion everywhere.

Permitted copy distinguishes **Ready to download**, **Ready with issues**,
**Downloaded**, **Destination custody verified**, **Expired**, and exact copy-
specific disposition evidence. Phase 6/12 re-proves current recipient,
authorization, classification, suppression, package scope, and safe state at
release and protected-action open. Template choice or delivery creates no
package, manifest, custody, retention, hold, transfer, or disposal truth.
