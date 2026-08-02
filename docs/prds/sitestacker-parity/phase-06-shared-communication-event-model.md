# Phase 6 — Shared Communication Event Model

> **Program:** SiteStacker Parity · **Phase:** 6 · **Status:** Groomed (grill-with-docs, 2026-07-05) · **Base:** `develop`
> **Predecessors:** Phase 2 (Site, Locale & Currency) · Phase 3 (Minimum Permission & Role-Scoped Projection) · Phase 4 (Identity & Account-Claiming) · Phase 5 (Public Website Runtime Contract). _The reconcile-cron prior art is the shipped recovery-scan pattern in the repo, not a phase deliverable._
> **Charter / matrix:** `docs/prds/sitestacker-parity/README.md`, `parity-matrix.md`

Modern SiteStacker parity for **one Asym-owned communication history across every surface** — a durable, per-person timeline of what was sent or received, to whom, why, which record caused it, whether it delivered, and under what consent — **before** message templates, workflow messaging, and newsletter sync deepen. This is a **foundation-and-consolidation** phase, not a greenfield build: Email Studio (versioned templates), the Resend provider layer (send-logs, a Svix-verified delivery-event webhook, a typed suppression list), Support Hub (a per-conversation message timeline), member-care activities, the donor-activities feed, and the Inngest workflows runtime **already ship**. What is missing is the one shared **communication-event spine** those systems lack. Phase 6 adds it, captures it **by construction at the single send seam**, **attaches** (never duplicates) the provider delivery layer, **adapts** (never migrates) the existing subsystems, governs visibility with the Phase-3 projection chokepoint and retention/erasure to a GDPR/CPRA baseline, and proves the whole thing with **one staff timeline slice** — built so every later communication feature extrapolates from it rather than reinventing its own log, consent behavior, and provider mapping.

---

## Problem Statement

The platform already sends and logs a great deal of email — receipts, correction notices, test sends, support replies — and already records provider delivery events, suppressions, and inbound mail. But there is **no single, person-centered record of communication**, and every deeper communication feature (system messages, workflow notifications, missionary partner messages, newsletter/Mailchimp sync, donor/missionary communication views, receipt/statement operations, reporting) would otherwise invent its own log, its own consent behavior, its own provider mapping, and its own visibility rules. Five concrete gaps block all of them:

1. **There is no one communication timeline per person.** The facts are scattered across provider infrastructure and domain subsystems — `email_send_logs` and `email_events` (provider delivery, keyed by message id, **no person link**), `support_messages` (per-conversation), `member_care_activities` (per-missionary), `donor_activities` (the CRM "Activity" tab source) — and none of them is a coherent, cross-channel, per-constituent history. Provider logs are also short-lived by nature (a leading nonprofit CRM keeps its provider-fed email history only ~13 months), so relying on them is not durable recordkeeping.

2. **Message intent and delivery outcome are not modeled, and official sends leave no durable record.** There is no split between "we intended to send this, to this person, for this reason" and the provider's later "delivered / bounced." Worse, **receipts and statements are generated on-demand and are not stored at all** — there is no durable "this receipt was sent to this donor on this date, and it delivered" record, which is exactly the substantiation a nonprofit is expected to retain for years.

3. **Consent is decided at send but never snapshotted, and the gate itself is still in-flight.** The fail-closed, message-type-aware consent gate that belongs in front of every outbound send is an **in-flight prerequisite** (not yet on the base branch), and even once it lands it only _decides_ send/suppress — nothing _records_ the consent state that justified a given send. Without a snapshot at send time, we cannot later prove _why_ a message was (or was not) sent — the audit posture modern privacy law expects.

4. **There is nowhere for a provider unsubscribe to land, and no export-eligibility contract.** Suppression facts (unsubscribe, bounce, complaint) live in a typed `email_suppressions` table today, but there is no provider-agnostic landing for an inbound **Mailchimp** unsubscribe/cleaned fact and no defined check that stops a future contact export from re-adding someone who opted out — and a self-unsubscribed Mailchimp contact _cannot be re-subscribed via the API_, so the fact must be honored on our side before any sync launches.

5. **Donor and missionary surfaces have no role-safe communication visibility.** The Phase-3 projection chokepoint governs CRM reads (and already blocks care activity from donor/missionary views), but there is no communication-timeline projection — so there is no safe way to ever show a donor "your receipts and messages from us" or a missionary "your communication with this supporter" without leaking staff-only or other-party data.

If we build system messages, workflow notifications, or Mailchimp sync before this spine exists, each reinvents the log, the consent snapshot, the provider mapping, and the visibility rules — the precise fragmentation this program exists to prevent. The recon for this phase confirmed the delivery machinery, template system, provider webhook (Svix-verified, deduplicated, fail-closed on tenant), Support Hub timeline, and durable-workflow runtime largely already exist; what is missing is the **shared, person-centered communication record** that makes them one product, captured so it can't be forgotten, and governed for privacy by construction.

## Solution

A **shared, server-only communication-event spine** — the system of record for _the fact that a communication happened_ — written **by construction at the one send seam**, with channel payload left in the systems that already own it, provider delivery **attached** rather than duplicated, existing subsystems **adapted** rather than migrated, and visibility/retention governed by the Phase-3 chokepoint to a GDPR/CPRA baseline. Ten moving parts, built from the staff, donor, and missionary point of view so the product feels like one connected platform while the safety work happens underneath:

1. **One communication-event spine (`communication_events`).** A tenant-scoped, per-person **header** record — who it concerns, direction, channel, kind/reason, subject, status, when, visibility, consent snapshot, actor, site/locale — that is authoritative for _that a communication occurred_. Channel payload (the email HTML + delivery events; the support thread; the care note) stays in the system that owns it and is **referenced**, not re-stored. One row per **person-copy** of a communication (a bulk send is many rows sharing a send reference), so a person's timeline is a trivial, indexed scan.

2. **Capture by construction at the send seam, enforced by lint.** Every platform-originated email is logged **at the single shared `sendEmail` seam** — no per-caller discipline — so receipts, correction notices, test sends, and future system/workflow emails all produce a communication event automatically. A hard-blocking **CI import-lint** forbids sending through the provider SDK outside the seam, so the log can't be bypassed.

3. **Reduce provider evidence into the one spine; advance status monotonically.**
   Existing `email_send_logs` and `email_events` are REAL migration inputs, not
   the permanent communication-history authority. Phase 17 evolves or adapts
   them into the scoped submission/attempt/provider-evidence side of the Phase 6
   spine, while `communication_events` remains the durable recipient-specific
   outcome/history record. The signed webhook advances normalized evidence
   through a **monotonic state machine** that never regresses out of a terminal
   state (a late "sent" can never overwrite a recorded "bounced"). Engagement
   (opens/clicks) is a **separate signal**, not delivery status. Evidence that
   matches no prepared communication is **quarantined**, never dropped and never
   allowed to fabricate a communication.

4. **Consent snapshot at send time.** At the seam, the fail-closed consent gate runs and returns its verdict and the inputs it saw; the event **freezes that** (verdict, message-type, the suppression/consent states, preferred language) as an immutable, versioned snapshot — the auditable proof of _why this send was allowed or suppressed_.

5. **A durable receipt/statement-sent record.** The on-demand receipt and statement flows write a communication event when they send — filling the "no durable record of an official donor communication" void — classified for long-term retention. A **`receipt_void` / `statement_supersede`** communication kind (at `retention_class=official`, distinct from the receipt/statement-SENT kind — proof a donor was told a prior receipt/statement was voided or reduced) is **reserved**, emitted by Phase 7's void-supersede guardrails.

6. **Additive emit-hooks for the subsystems that already own history.** Support Hub messages and member-care activities **emit a reference event** into the timeline (an additive write in the same transaction as their own insert) — they are **surfaced, not migrated**; their tables stay the source of truth for their payloads, and care stays staff-only. A single dedupe rule prevents an outbound support email (which also crosses the seam) from producing two events.

7. **A provider-agnostic suppression + consent model with a Mailchimp landing seam.** The existing typed `email_suppressions` stays the one source of truth for "don't contact," extended with **provenance** (including a reserved `mailchimp` source). Phase 6 defines the **export-eligibility contract** — the check a future newsletter/Mailchimp sync must consult so it can never re-add a suppressed contact — and reserves non-executable Mailchimp channel vocabulary only. It does not prebuild a provider adapter, plug-in interface, or transport. The live Mailchimp connection, contact export, and inbound webhook belong to the newsletter/Mailchimp integration phase.

8. **Three role-scoped visibility projections + a staff read slice; donor/missionary scaffolded.** A `communication_timeline` projection for **staff / donor / missionary**, each an allow-list in the Phase-3 pattern, driven by the event's own **visibility** field (default `staff_only`, fail-closed). The **staff** view ships now — communication events feed the existing CRM-person **Activity** timeline. The donor and missionary **projections and resolver ship and are tested now**; their portal **UIs are reserved, scaffolded, and documented** so a portal phase implements them from a settled pattern.

9. **Durable delivery reconciliation via Inngest.** A scheduled Inngest function (mirroring the existing recovery-scan pattern) attaches quarantined provider delivery events to already-recorded communication events. This is a clean forward-only build: it does not synthesize history from legacy send logs or infer recipients from an email address. The synchronous send/ingest path is unchanged; Inngest is reserved for the future bulk/newsletter fan-out.

10. **A privacy-by-construction retention/erasure posture.** Raw provider payloads live only in the provider layer, access-restricted and prunable; every event carries a **retention class** (official ≥7 years / prefer permanent; operational medium; ephemeral short); communication **exports** are governed and audited (not every view); and events are **erasure-aware** (redact-not-delete: irreversibly anonymize communication PII while retaining the immutable receipt ledger). The classification and contracts ship now; the pruning and DSAR jobs are reserved to a retention/compliance phase.

Underneath, the spine is written **at the Asym boundary** in `packages/api`
(server-only, one owner for the rules). Its domain evidence is channel-neutral in
shape, but product email is **Resend-only in this program**. Email/support/care
are live now; SMS, push, WhatsApp, and Mailchimp are reserved dimensions whose
future activation requires a separately ratified scope and proof package—not an
adapter entry. Every heavier feature—the system-message editor, workflow
notification builder, Mailchimp sync, donor/missionary communication UIs,
receipt/statement operations, and reporting—is a reserved seam that consumes
this spine rather than reinventing it.

---

## User Stories

### Staff operator / admin (Mission Control)

1. As a **staff operator**, I want to open a CRM person and see one timeline of every communication — receipts, system emails, support messages, care touches, delivery failures, unsubscribes — so that I understand the whole relationship without hunting across screens.
2. As a **staff operator**, I want each timeline entry to show what was sent, who sent it, why (which gift/pledge/campaign/workflow caused it), which provider carried it, and whether it delivered or bounced, so that I can act on real outcomes.
3. As a **staff operator**, I want to see whether a person has unsubscribed or been suppressed, and why, so that I never chase someone who has opted out.
4. As a **staff operator**, I want a person who is both a donor and a missionary to show one unified communication history, so that their multiple roles don't fragment the record.
5. As an **admin**, I want communication history to be trustworthy and quiet in steady state — surfacing only real failures — so that it's a record, not a babysitting console.
6. As an **admin**, I want complete assurance that no communication record can cross to another tenant, so that our constituents' history is isolated.

### Finance

7. As **finance staff**, I want a durable record that a receipt or year-end statement was sent to a donor, when, and whether it delivered, so that we can substantiate official communications for years.
8. As **finance staff**, I want that receipt record to reflect the legal donor at the time of the gift and the locale it was rendered in, so that it stays accurate after later edits.
9. As **finance staff**, I want to know that every outbound send honored the donor's consent and suppression state, and that the state at send time is recorded, so that we can prove compliance.
10. As **finance staff**, I want an export of communication history to be governed and logged like any sensitive export, so that bulk disclosure is controlled and auditable.

### Donor (reserved surface — projection + logic now, UI later)

11. As a **donor**, I want to eventually see the receipts, statements, and messages _we_ sent _to me_, so that I have my own record.
12. As a **donor**, I want to never see staff-only notes, internal notifications, or another party's information in my view, so that my view shows only what is safe for me.
13. As a **donor**, I want an unsubscribe to be honored everywhere — future sends and future newsletter exports alike — so that opting out means opting out.

### Missionary (reserved surface — projection + logic now, UI later)

14. As a **missionary**, I want to eventually see my communication with my assigned supporters, so that I can steward those relationships.
15. As a **missionary**, I want to never see other missionaries' supporters, donor-private financial detail, or staff-only care records, so that I only see what's mine and safe.

### Content editor / staff (Email Studio)

16. As a **content editor**, I want every message built and sent through Email Studio to be recorded in the communication history automatically, so that what we sent is always traceable.
17. As a **content editor**, I want the raw message body and provider payload kept out of the timeline views, so that a communication record never becomes a second copy of sensitive content.

### Organization / privacy

18. As the **organization**, I want one communication backbone that system messages, workflows, receipts, and newsletter sync all write to, so that the product is one connected platform, not disconnected tools.
19. As the **organization**, I want tax-receipt communications retained long-term while operational and tracking data is pruned on schedule, so that we keep what we must and hoard nothing we shouldn't.
20. As the **organization**, I want a data-subject erasure to remove a person's PII from communication history while retaining the immutable financial receipt, so that we honor privacy rights without breaking our legal recordkeeping.

### Developer / system (guardrails)

21. As a **developer**, I want every outbound email logged at the one send seam, so that capturing communication is automatic and can't be forgotten.
22. As a **developer**, I want a hard-blocking lint that forbids provider sends outside the seam, so that the log can't be bypassed.
23. As a **developer**, I want delivery events to attach to an existing communication and never create one, so that a provider webhook can never invent CRM or donation truth.
24. As a **developer**, I want a message's terminal status to be monotonic, so that an at-least-once, out-of-order webhook can never regress a bounced message to sent.
25. As a **developer**, I want the communication event keyed on the operational entity (donor/missionary), not a provider email or a Twenty person, so that identities never collapse and the record survives merges.
26. As a **developer**, I want a send to an unknown/external recipient to be recorded with the email and no person link, so that non-constituent mail isn't forced into a fake person.
27. As a **developer**, I want raw provider payloads to live in exactly one access-restricted place and never in the event or a portal view, so that we minimize the PII surface.
28. As a **developer**, I want the reconciliation and backfill to run as durable scheduled jobs, so that missed attachments and historical sends self-heal.
29. As a **developer**, I want the model to carry reserved `channel`, `site_id`,
    and `rendered_locale` dimensions while keeping normalized delivery evidence,
    so that separately ratified future channels can reuse the spine without
    prebuilding a second product-email provider adapter or plug-in framework.
30. As a **future developer**, I want the donor and missionary communication views to be a documented "build the UI over the already-tested projection," so that they extrapolate rather than reinvent the rules.

---

## Implementation Decisions

### A. Architecture rulings (the settled decisions)

- **A1 — The communication event is a write-through _system of record for the interaction fact_, not a provider log and not a re-store of payloads (D1; Phase 17 evidence amendment, 2026-07-19).** `communication_events` is authoritative for _that a communication happened_—the body-free header, consent snapshot, normalized outcome, and typed source/provider references. Source payloads such as the support thread or care note remain in their owning domain. Personalized email material exists only in Phase 17's bounded encrypted prepared artifact and, when allowed, expiring Recent sent copy; it is never reconstructed from provider evidence. This is the mature "canonical header + typed detail" pattern (class-table inheritance), chosen over a wide nullable table, an EAV bag, or a provider log promoted to product truth. It builds the void-filling spine and **attaches to / adapts** everything that already works.
- **A2 — Capture by construction at the single send seam; enforce it with a lint (D1).** The shared `sendEmail` surface is the sole email delivery point and already requires an idempotency key; the communication-event write happens **there** (or in the thin service around it), so every email-channel communication is logged automatically. A hard-blocking CI import-lint forbids provider-SDK sends outside the seam. This is the transactional-outbox / single-gateway pattern: atomicity and one choke-point, not per-caller memory, guarantee capture — and it is the answer to "how does this not become a development burden."
- **A3 — Converge provider delivery evidence into one spine; do not preserve two authorities (D1, D4; Phase 17 amendment, 2026-07-19).** Current `email_send_logs` and `email_events` are migration/backfill sources and may be bounded compatibility adapters while readers and FKs move. The Phase 17 target records exact scoped provider submissions, members, attempts, normalized evidence, and the one body-free `communication_event`; after one-writer/read proof, legacy writers are fenced and cannot remain a competing delivery or history authority. Identity-level provider account links stay in Phase 4's `crm_record_links`; per-message provider identities bind the exact preparation/submission evidence. Phase 6 still does **not** create a generic `communication_provider_links` table, a provider-selected recipient table, an extra preference snapshot store, or a provider-neutral plug-in framework.
- **A4 — Adapt existing subsystems; never big-bang-migrate them (D1).** Support Hub (`support_messages`) and member care (`member_care_activities`) remain their own source of truth for their payloads; they **emit an additive reference event** into the spine at their insert site (an in-transaction local write, i.e. the local transactional-outbox). This is the strangler-fig / branch-by-abstraction path (leave the detail tables, add a header spine that references/adapts them, converge later) — chosen over re-plumbing shipped, working surfaces. Support outbound (which also crosses the send seam) is deduplicated so it produces exactly one event.
- **A5 — Per-person cardinality; exclusive-arc person link that allows "none"; the entity, not the provider or Twenty person, is the key (D3, G2, G3).** One `communication_events` row is one person's copy of a communication. The person link is **at most one** of `donor_id` / `missionary_id` (a DB exclusive-arc CHECK), **or none** — a send to a non-constituent (staff notification, test send, unknown recipient) is stored by email with no person link (an unresolved/external recipient), never forced into a fake person. The key is the **operational Asym entity**, never a Resend recipient email or a Twenty CRM person (Phase 4's "identities don't collapse"; Twenty retired — [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md) — the rule survives as _never keyed on any provider-side person record_). A person's _full_ timeline is assembled by resolving all their linked identities (via the identity graph) and unioning at read, so a multi-hat donor/missionary sees one history. The exclusive-arc person key (`donor_id` XOR `missionary_id` XOR none) is revisited when Phase 7's typed **PARTY** spine lands.
  _(Amended 2026-07-14, Phase 16 (Pledges & Recurring Commitments): Phase 7's Party spine is the canonical recipient identity for new commitment communications. `communication_intents` and resulting `communication_events` may carry `recipient_party_id` plus the exact purpose-eligible `recipient_contact_point_id` and contact-point revision used for delivery. Both references are composite same-tenant FKs, and the contact point must belong to that Party. During migration, `donor_id` / `missionary_id` are compatibility projections only; when present with a Party they must resolve to that same Party and cannot identify a second recipient. External/unresolved legacy sends may retain the existing no-Party path, but Phase 16 may never fall back from missing or ambiguous Party/contact evidence to an arbitrary email.)_
- **A6 — Related business records via a flexible association table, not a polymorphic key or ever-growing columns (D3).** Links to the records a communication is _about_ (gift, pledge, campaign, receipt, statement, fund, import, report, event, public page…) live in a `communication_event_relations` junction with an enum'd relation type — a large, growing set modeled the way mature CRMs model activity associations, extensible without schema churn. The two integrity-critical links (person, source-payload) keep strong exclusive-arc foreign keys; a raw `type + id` polymorphic key (the SQL anti-pattern with no referential integrity) is rejected. A hot relation type may be promoted to a typed FK later without a breaking change. Because the enum is already declared extensible, Phase 7's vocabulary is **reserved** now with no schema change — reserved `related_type` values `gift_credit`, `tribute`, `donation_tribute`, `matching_gift`, `party`, `person`, `household`, `org_contact` (settling vocabulary the way the `mailchimp`/`sms`/`push` channel dimensions were reserved). _(Amended 2026-07-10, Phase 14 (Donor Credit Operations) D1.14/D4.14: three of these reserved-not-built literals are renamed to match Phase 14's credit-object names — `gift_credit` → `contribution_credit`, `donation_tribute` → `contribution_tribute`, `matching_gift` → `matching_gift_expectancy`; the rename is free now, since nothing is built against the old names.)_
  _(Amended 2026-07-13, Phase 16 (Pledges & Recurring Commitments): the
  ambiguous legacy `pledge` relation must not carry every commitment concept.
  Phase 16 adds explicit related types for `recurring_group`,
  `recurring_cohort`, `recurring_line`, `recurring_occurrence`,
  `recurring_attempt`, `fixed_total_pledge`, `fixed_pledge_expectation`,
  `fixed_pledge_expectation_line`, and `provider_control_incident`. A relation
  names what the communication is about; it does not grant access to that
  record.)_
- **A7 — Delivery status is derived and monotonic; engagement is separate; unresolvable events are quarantined (D4; Phase 17 evidence amendment, 2026-07-19).** The event's status is advanced by the signed provider-evidence reducer through a fixed precedence—terminal `bounced`/`complained`/`failed` outrank `delivered` outrank `sent` outrank `queued`; a complaint may follow delivery; a late lower-precedence event is a no-op. `suppressed` is a distinct pre-send terminal state set when the gate blocks the send. `opened`/`clicked` are separate advisory engagement signals, never delivery status. Evidence that resolves to no exact scoped preparation/provider-message identity remains **quarantined** in the provider-evidence side of the spine—never dropped and never fabricating an event; reconciliation may attach it later. Legacy `email_events` rows are migrated or adapted into this side during cutover, not retained as a second history.
  _(Amended 2026-07-14, Phase 16: that provider-delivery precedence applies only to provider-backed channels. An `in_product` event is committed with the sole v1 local status `available`. It never claims `queued`, `sent`, `delivered`, `opened`, `clicked`, or `read`; a later presentation/dismissal preference, if built, is a separate fact and cannot rewrite delivery truth.)_
- **A8 — Consent state is snapshotted at send time, from the gate's evaluation (D5).** At the seam the fail-closed, message-type-aware consent gate runs and returns its verdict plus the inputs it saw; the event freezes that as an immutable, **versioned inline JSONB** consent snapshot (verdict, message-type, the `do_not_contact`/`do_not_email`/suppression states, preferred language). One evaluation, recorded — not a second computation, and not evaluated only at view time. The gate is a **hard prerequisite** (see C); Phase 6 consumes it and records its result.
- **A9 — One suppression source of truth, extended with provenance; an export-eligibility contract; Mailchimp is a reserved integration seam, not a comms channel (D5).** The typed `email_suppressions` table stays the source of truth for "don't contact," extended with a `source` provenance value set (adding a reserved `mailchimp`). Phase 6 defines the **export-eligibility contract** (`isExportEligible`) that a future sync must consult so it can never re-add a suppressed contact, and reserves `mailchimp` as a channel/kind dimension. Per the repo, Mailchimp is a **downstream integration/handoff** (contacts sync out so staff/missionaries send campaigns _in_ Mailchimp; the parity matrix marks the sync "not built," depends on deeper CRM work, surfaced in Mission Control), not part of the Resend + Email Studio send flow — so the live Mailchimp connection, contact export, campaign handoff, and inbound unsubscribe webhook are the newsletter/Mailchimp phase; Phase 6 ships only the seam and contract.
- **A10 — Delivery ingestion is synchronous; Inngest is reserved for reconciliation and the future bulk fan-out—matching the house pattern (D4; Phase 17 amendment, 2026-07-19).** The current path is Svix verification followed by an idempotent `email_events` write. The target keeps that one-transaction synchronous reduction pattern but resolves the exact connection/scope and writes or adapts into the Phase 6 submission/attempt/provider-evidence records before advancing the one `communication_event` monotonically or quarantining. Database uniqueness and monotonic guards—not a second queue—remain the reliability mechanism. Inngest is used for the **scheduled reconciliation/backfill** scan and is **reserved** for future bulk/newsletter fan-out. The send-seam capture and consent snapshot stay synchronous and in-band.
- **A11 — Future-proofing without a speculative provider framework (D4).**
  (a) The status-advance/attach logic is a pure service function whose normalized
  evidence shape keeps producer domains free of Resend vocabulary; this is not a
  provider-selection abstraction. (b) The communication Inngest event names and
  envelope are reserved now even though only the reconciliation cron uses them.
  (c) Raw **Resend** events pass through one canonical normalizer and a
  data-driven status-precedence map. A newly documented Resend status may extend
  that exhaustive map, but another provider is not an adapter/table entry.
  (d) The reconciliation job uses the house ledger + work-claim + recovery-scan
  pattern. (e) On send, the correlation id is stamped through the pinned Resend
  tag mechanism and correlated to the frozen prepared-message identity; no
  provider-portability claim is made. (f) Phase 6 adds no second provider adapter,
  plug-in framework, provider-selection policy, or cross-provider retry path.
  Any future provider requires a separately ratified product decision,
  congruence review, migration plan, and proof package.
- **A12 — Three role-scoped visibility projections through the Phase-3 chokepoint; event-level `visibility` drives filtering, fail-closed (D6).** `communication_timeline_staff` (full; blocks raw payloads and raw consent JSON — staff see a rendered summary), `communication_timeline_donor` (donor-safe comms _to_ them; blocks staff notes, internal, care, other-party, raw ids), `communication_timeline_missionary` (their assigned supporters' safe comms; blocks other supporters, donor-private financial, care, staff-only, raw ids) — each an allow-list in the existing `CrmProjectionContract` shape. Every event carries a `visibility`/`sensitivity` value (`staff_only` / `donor_visible` / `missionary_visible`); the **default is `staff_only`** so an unclassified event never leaks; care activity is `staff_only` by construction. A **party-scoped visibility path** for sends to soft-credited parties / tribute notify parties is reserved: a party-scoped comms projection (e.g. a fourth `credited_party_visible` value) is a **Phase-7-owned extension** of this Phase-3 chokepoint pattern, keeping the `staff_only` fail-closed default for any `acknowledgment`/`notification` whose recipient party has no portal identity — so an acknowledgment never leaks the hard-credit donor's gift/amount to a soft-credited party (and vice versa).
- **A13 — Build all three interfaces' logic and contracts now; ship the staff UI; scaffold + document the donor/missionary UIs (D6, user directive).** The three projection contracts **and the resolver** that produces each role's safe timeline **ship and are unit-tested now** — the security-critical filtering is exercised even without the two portal UIs, so it can't silently drift. The **staff read slice** ships: communication events feed the existing in-code CRM-person **Activity** timeline (the same assembly that merges gift history + `donor_activities`), with a "Communication" filter — no parallel UI. The **donor and missionary read paths** are reserved: their service functions exist and are tested, and their portal UIs are scaffolded with a **documented build-pattern derived from the staff implementation**, light extension points, and an explicit "implement in the donor-portal / missionary-workspace phase" trigger. The PRD/docs carry a "how the donor and missionary views get built from this" section so a future agent replicates the pattern.
- **A14 — Retention by class; raw payloads minimized to one access-restricted provider-evidence store; classification now, pruning reserved (D7; Phase 17 amendment, 2026-07-19).** Every event carries a `retention_class`: **official** (tax receipts / year-end statements / official donor communications) held **≥7 years, prefer permanent**; **operational** (system/workflow emails) medium; **ephemeral** (engagement signals + raw provider payloads) short/prunable. Raw provider payloads may exist only in the access-restricted provider-evidence side of the Phase 6 spine; legacy `email_events.raw_event` is migration input, not a permanent second store. The body-free event retains normalized facts and evidence references, never the raw blob, and even staff see a rendered safe summary. Pruning removes raw/ephemeral material while preserving the official communication fact and required metadata. A **`receipt`** is official; an **`acknowledgment`** and tribute **`notification`** are operational. Reserved **`receipt_void` / `statement_supersede`** evidence is official. Exact retention/disposal follows the later applicable policy and the Phase 17 prepared-material/Recent-copy ceilings rather than preserving raw provider data indefinitely.
- **A15 — Erasure-aware, redact-not-delete, to a GDPR/CPRA baseline; auditing follows Phase 3 (D7).** Events are erasure-ready: a data-subject erasure **irreversibly anonymizes** communication-side PII (drop key maps, scrub any free-text, purge from backups on the retention cycle — reversible masking would _fail_ the erasure) while **retaining the immutable receipt/statement legal-donor snapshot** (Phase 4), justified on the legal-obligation exemption. "Structured facts" tables exclude identifiers so minimization actually holds. Communication **exports** are governed and audited by **disclosure risk** (a bulk read / API pull / report / large result set is functionally an export and hits the governed, actor-logged path via Phase 3's export governance), plus privileged raw-PII access and access-control failures; single in-context views are not audited. The design targets the stricter GDPR/CPRA baseline rather than relying on the nonprofit exemption (which several 2023–26 state laws narrow). Phase 6 reserves the erasure hook + contract (Phase 3's DSAR seam); it does not build the DSAR job.
- **A16 — Rollout by strangler-fig: capture forward at the seam, backfill recent history via a bounded reconciliation (G1; Phase 17 amendment, 2026-07-19).** New sends capture from day one. A durable, idempotent reconciliation **backfills recent historical `email_send_logs` into `communication_events`** only through proved permanent internal provider-message / preparation identity mappings (quarantining unresolved rows) so a person's timeline isn't empty on launch — bounded (a recent window rather than all history by default) and re-runnable. Recipient email never serves as durable person-resolution or provider-event correlation authority for backfill. The synchronous path is never blocked on the backfill; ownership converges incrementally, and no shipped table is rewritten.
- **A17 — Durable pre-dispatch intents bridge domain eligibility to the one communication seam; they are not another workflow engine (Phase 16 amendment, 2026-07-14; Phase 17 amendment, 2026-07-19).** A producer such as Phase 16 decides the business meaning, audience, candidate timing, and business-record relations, then submits one complete bounded plan occurrence through `compileAndReleaseCommunicationPlanOccurrence`—even for one or zero applicable members. The producer never loops over independently committed child submissions. Inside one compiler transaction, a private child primitive resolves each concrete recipient authority and channel step and gives it an independent producer-authorized occurrence-slot token and recipient-specific `communication_intent`; no child becomes claimable until the complete parent is released. After release, members retain independent claim, suppression, delivery, repair, and outcome state. Phase 6 owns durable claim/submission state and re-proves the matching closed tenant-or-platform recipient authority, consent/suppression where applicable, channel availability, and matching-owner delivery profile. Producer eligibility remains producer-owned but cannot go stale silently: each intent binds one exact scope-owned producer fence/revision; the producer advances only that exact `(scope_kind, scope_owner_id, producer, fence_key)` fence and supersedes only older unstarted intents bound to that fence in the same transaction as any plan/fulfillment/lifecycle change that invalidates them. It never supersedes unrelated work merely because it shares an owner. Both paths lock the exact fence before the intent. Final dispatch atomically moves an exact still-valid intent to `dispatching`; that is the linearization point. A change before it suppresses the intent, while a change after it treats the send as already in flight and may append a corrective intent rather than pretending it was prevented. Email dispatch then goes only through `sendEmail`; a Phase 16 in-product intent creates the one local role-safe event/projection and no provider send. From each stable bounded member occurrence-slot token, the server derives a permanent `occurrence_slot_hash@1`, locks its unique exact-scope/environment slot, and compares the separately server-derived `semantic_identity_hash@1` and full `immutable_command_hash@1`. Replay returns the same released plan result only when the parent compilation and every child hash/schema match; reuse of any occupied parent or member slot with changed immutable input hard-conflicts, and a legitimate successor requires fresh producer-authorized tokens. Provider-submission idempotency belongs to the exact provider envelope and never aliases an intent identity. Provider timeout becomes `indeterminate` and is reconciled before any retry. Submission creates exactly one body-free `communication_event`; email submission, attempt, signed provider evidence, normalized outcome, and history are all attached within the one Phase 6 spine. Existing `email_send_logs` / `email_events` are migrated or adapted into that attempt/evidence side and lose independent write authority after cutover. Intent rows do not authorize a payment, change a pledge, infer a recipient, render content, or create a general queue/journey system.
- **A18 — Delivery identity is an immutable safe snapshot backed by the real scope owner (Phase 16 amendment, 2026-07-14; Phase 17 amendment, 2026-07-19).** The tenant branch uses `tenant_email_settings` as the sole owner of its Resend connection, current credential, verified sender, and reply-to configuration. The service-only platform branch uses the separately governed `platform_email_settings` and credential revisions with every tenant field null. A `communication_delivery_profile_version` freezes only the matching owner's non-secret sender/reply identity and validation evidence selected for a governed communication policy. It references that exact settings owner and source revision; it never copies an API key or becomes a second settings authority. Dispatch obtains the current secret from the same owner, re-proves that the live verified identity can satisfy the frozen profile, and fails closed rather than crossing scope or silently substituting another sender/reply policy. Profile changes append a new same-scope version and affect only policies/intents that bind it.

**Phase 17 A5 privacy supersession (2026-07-19).** A5's phrase “stored by
email” is withdrawn. A non-constituent may use the no-Party recipient-authority
branch, but its transport address exists only in encrypted, short-lived
prepared-delivery material and never in durable communication history. No fake
person is created, and an unresolved address cannot become identity or provider-
event correlation authority.

### B. Deep modules (server-only, under `packages/api/src/communications`)

Each is a deep module — a simple, testable interface hiding real complexity — with thin app routes and thin app pages calling in.

- **`communication-recorder`** — the write path at the send seam. `recordCommunication({ scope, recipientAuthority, channel, kind, reason, relations, consentSnapshot, sourceRef, siteId, locale, actorOrService, idempotencyKey })` → the created/so-far event. The closed resolver admits exactly one matching branch: same-tenant Party/contact; an explicitly contract-permitted same-tenant no-Party authority `{kind, recordId, revision}` with Party/contact fields null and no durable address; or the exact platform-recipient authority with every tenant field null. A caller-supplied address is never authority, and no branch may fall through to another. It is idempotent on the server-derived scoped key and writes the event and relations atomically with the send record. This is the one place a tenant- or platform-originated communication becomes an event.
- **`delivery-ingestion`** — the pure provider-event reducer. It verifies the connection revision first, derives that revision's exact `(scope_kind, scope_owner_id)`, and attaches `{scope_kind, scope_owner_id, connection_revision, provider_email_id}` to the permanent internal provider-message identity before **advancing status monotonically** (data-map precedence) or **quarantining** it. Recipient address may be bounded validation evidence only; it never selects scope or serves as the lookup or attachment key. Called synchronously by the webhook; promotable to durable execution unchanged.
- **`communication-projection`** — the resolver that applies the staff / donor / missionary `communication_timeline` projection contract to produce a role-safe timeline; the single read chokepoint for all three surfaces; fail-closed on unclassified visibility.
- **`suppression-consent`** — reads/writes the extended `email_suppressions`
  (with provenance); exposes `isExportEligible()` (the export-eligibility
  contract), the consent-snapshot builder that captures the gate's evaluation,
  and the typed landing contract a separately ratified future channel
  integration must honor for unsubscribe/cleaned facts.
- **`communication-reconciliation`** — the Inngest scheduled function (house recovery-scan/ledger/claim pattern) that attaches quarantined delivery events and runs the bounded historical backfill.
- **`emit-hooks`** — the additive reference-event emitters invoked in-transaction by Support Hub and member-care inserts, with the support-outbound dedupe rule.
- **`communication-intents`** — the Phase 16-compatible pre-dispatch boundary. Its public producer operation accepts one complete bounded plan occurrence. Only its private transaction-scoped child primitive accepts one stable bounded member occurrence-slot token, resolves one recipient and channel step, and inserts or exactly replays that child; a producer cannot call or commit the primitive independently. Each child validates one immutable semantic envelope and exactly one closed branch: same-tenant Party/contact-point plus tenant delivery profile; an explicitly permitted same-tenant no-Party authority revision plus tenant delivery profile, with its destination restricted to short-lived encrypted prepared material; or service-only platform recipient authority plus fixed platform delivery profile. Phase 17 Target Live contracts remain bound to their manifest-declared Party/contact resolvers unless a future manifest explicitly names and proves the no-Party branch. The child validates the same-scope relation set, exact publication/binding, locale, and time window; derives and permanently locks the exact-scope/environment member slot; derives separate semantic-identity and complete immutable-command hashes from canonical resolved input; returns prior work only when the parent and every child comparison hash/schema match; claims by lease/CAS only after parent release; re-proves Phase 6 safety gates; and hands each accepted intent to the existing send seam exactly once. A changed parent or member input hard-conflicts; legitimate later occurrences use fresh producer-authorized plan/member tokens.
- **`delivery-profiles`** — appends immutable, non-secret sender/reply identity snapshots from the real matching owner: `tenant_email_settings` for tenant scope or service-only `platform_email_settings` for platform scope. Dispatch verifies that the same owner's current connection/validation evidence can satisfy the bound version. It never owns or copies provider credentials and cannot cross-resolve owners.

### C. Predecessor plug-ins and prerequisites (consume, don't reinvent)

- **Consent gate (Phase 3) — hard prerequisite.** The fail-closed, message-type-aware outbound-email consent gate is an **in-flight patch not yet on the base branch**; Phase 6's send-seam capture and consent snapshot consume it. Tickets that depend on it must gate on its merge; the PRD flags this explicitly.
- **Branded auth-email hook (Phase 4) — prerequisite for auth-email capture.** The tenant-branded Send Email Hook (magic-link / invite / claim via Email Studio + Resend) is **not present on the base branch**; capturing those auth-email communications depends on it landing and routing through the seam. Until then, auth-email kinds are reserved.
- **Identity graph (Phase 4, extended by Phase 7/16).** Legacy events link to the operational entity (`donors.id` / `missionaries.id`), never a provider email or Twenty person; a person's full timeline unions their linked identities; provider account links stay in `crm_record_links`; the frozen receipted legal-donor snapshot is honored by receipt communications and by erasure. Phase 16 commitment intents use Phase 7 Party plus the exact purpose-eligible contact point as the canonical recipient seam; any transitional donor/missionary key must map to that same Party.
- **Projection chokepoint + export governance + audit (Phase 3).** The three timeline projections plug into the existing `CrmProjectionContract` pattern; communication exports reuse the export-governance resolver, the shared CSV-safe helper, and the audit spine.
- **Site / locale (Phase 2).** Events carry `site_id` and `rendered_locale`; receipt/system communications consume Phase 2's message-resolution override order (tenant default → site override → locale override). Reserved-arg now; populated as Phase 2's facets land. `campaigns.channel` remains a comms-medium attribute (not gift attribution).
- **Public runtime / guest-first (Phase 5).** Public-checkout receipts and confirmations create communication events **without forcing account creation**; the always-sent receipt is the continuity; site branding/locale are captured for public-originated messages; the reserved public contact-form seam will use the same spine.
- **Automations (existing).** The Mission Control automations that send donor notifications send through `sendEmail` and are therefore captured at the seam automatically. The dormant `notification_queue` is **not** resurrected in Phase 6 or by later workflow delivery; governed intents/Delivery Plans use the Phase 6 outbox instead.

### D. Data model

**Phase 17 scope supersession.** The tenant-scoped descriptions in the original
rows below are now the `tenant` branch of the exact ownership arc defined in the
dated amendment. Their `tenant_id NOT NULL`, `(tenant_id, ...)` uniqueness,
same-tenant Party/contact/profile, and tenant-only service assertions do not
apply to the `platform` branch. Platform email instead uses `tenant_id NULL`,
the required `platform_scope_id`, scope-prefixed keys/FKs, the verified
platform-owner authority revision, and the platform connection/profile owner.
This is an explicit replacement, not an optional implementation interpretation.

- **New: `communication_events`** — scope-owned header carrying exact `scope_kind`, exclusive `tenant_id` XOR `platform_scope_id`, generated `scope_owner_id`, and environment. The tenant branch is per-person: Person via exclusive-arc `donor_id` XOR `missionary_id` XOR none (external/unresolved recipient stored by email — the **`recipient_email`** `TEXT NULL` column ships here in T3 with the three-way exclusive-arc CHECK; the re-groomed Phase 8 is only its first no-person writer). The service-only platform branch requires its exact platform-recipient authority and leaves every tenant/person/Party/contact/site field null. Shared fields include `direction` (outbound/inbound/internal); `channel` (email/support/care now; sms/push/whatsapp/mailchimp **reserved**) _(Amended 2026-07-10, Phase 14 (Donor Credit Operations) D3.5: a `mail` channel is additionally reserved — delivery statuses `queued → printed → mailed / returned`, advanced by **manual staff transitions** (there is no postal webhook) feeding the same A7 monotonic status guard; consent is evaluated **channel-aware at print ENQUEUE** under message-type rules identical to email — `do_not_contact` is absolute; marketing opt-outs do not apply to the `notification` kind — and the consent snapshot is frozen onto the event exactly as A8 does for email. Built by Phase 14 (Donor Credit Operations).)_ _(Amended 2026-07-14, Phase 16: `in_product` is an additional tenant-only local channel for a durable role-safe portal/workspace event; it has no provider send or email-delivery claim.)_; matching-branch recipient authority and nullable same-scope `communication_intent_id` per the dated A5/A17 amendment; `kind`/`reason`; monotonic `status`; `occurred_at`;
  - The `kind` enum is the discriminator the message-type-aware consent gate and the three-document wall key off. Three donor-facing document kinds are reserved on it: **`receipt`** (existing — the deductibility-bearing tax-substantiation send), **`acknowledgment`** (a soft-credit / DAF-advisor thank-you, structurally forbidden from deductibility merge-fields), and **`notification`** (a tribute notify-party message with the gift amount hidden). `acknowledgment` and `notification` are **reserved-not-built** — Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit Model) populates them. Shared rows carry exclusive-arc source-detail FKs (`email_send_log_id` XOR `support_message_id` XOR `member_care_activity_id` XOR none, with a CHECK); inline versioned JSONB `consent_snapshot`; `visibility`/`sensitivity` (default `staff_only`); `retention_class`; closed audit actor branch; `rendered_locale`; `correlation_id`/`idempotency_key`; timestamps. Tenant rows may additionally carry `site_id` and are indexed by scope owner/person/time; platform rows prohibit site/person fields and use service-only scope-owner/time indexes. Partitioning is reserved. Client roles cannot query platform rows; the service/projection layer plus exclusive scope arc enforces ownership without inventing a non-null tenant.
  - The new event schema has no personalized-subject column. Phase 17-governed flows retain only the contract-proven safe catalog title/classification in typed durable fields. A subject already stored in a legacy channel-owner row remains honest legacy evidence, but no new writer copies it into `communication_events`, treats it as a safe title, or uses it to reconstruct a Recent sent copy.
  - **Phase 17 privacy supersession of the unresolved-recipient parenthetical above:** the assertion that T3 ships durable `communication_events.recipient_email` is withdrawn and MUST NOT be implemented for new Phase 17-governed events. If a legacy deployment already has that column, it is legacy-only and accepts no new writes. A bounded migration first fences every writer, backfills a Party/contact or platform-recipient authority only where independently provable, and purges remaining address values under the applicable retention and erasure policy. An unresolved transport destination may exist only in encrypted, short-lived prepared-delivery material; durable history retains a body-free scope-safe authority/reference and never the address itself.
  - When `communication_intent_id` is present, `(scope_kind, scope_owner_id, communication_intent_id)` is unique and the event's scope/environment/recipient/channel/kind/purpose/relations must equal the bound intent. A tenant event uses exactly one recipient branch: transitional operational-entity keys plus Party/contact all resolve to one recipient, or an explicitly permitted same-tenant no-Party authority kind/id/revision is retained with every Party/contact field null. The no-Party branch stores no address and cannot be selected from provider payload. Platform events leave every tenant recipient field null and bind only the exact platform authority.
- **New: `communication_event_relations`** — the flexible association table (event id, enum'd `related_type`, `related_id`) linking a communication to the business records it's about; extensible without schema churn.
- **Phase 16-compatible: `communication_delivery_profile_versions`** — immutable, scope-owned, email-only delivery identity. Common columns carry `id`, exact `ExecutionScope`, environment, version, source-settings owner/revision, sender-identity hash, non-secret From/reply snapshots, validation hash, effective/supersession/audit facts. The tenant branch references the exact composite tenant `tenant_email_settings` owner and permits tenant Sender Profile/reply fields; the service-only platform branch references `platform_email_settings` and fixed Asym sender/reply policy while every tenant/site field is null. Uniqueness and the acyclic supersession chain begin with `(scope_kind, scope_owner_id)`. No row is edited when a successor is appended, and no credential, counter, or mutable connection state is copied. Dispatch reads the current secret from the same owner and fails closed on scope, identity, or validation mismatch.
- **Phase 16-compatible: `communication_intent_fences`** — the minimal producer-validity handshake, not a business rules engine. Key columns: `id`, exact `ExecutionScope`, environment, `producer`, `fence_key`, `current_revision`, `state` (`open|closed`), `updated_at`; unique `(scope_kind, scope_owner_id, producer, fence_key)`. The producer owns the opaque key/revision meaning. Its domain transaction locks and advances/closes only that exact fence, then supersedes only older `pending|claimed` intents bound to the same fence. It cannot cancel unrelated same-owner work or alter `dispatching|submitted|indeterminate` work.
- **Phase 17-compatible: `communication_plan_occurrences`** — one immutable coordination header per authoritative producer occurrence. It carries exact `ExecutionScope`, environment, stable producer namespace and event key/version, `plan_occurrence_token@1` schema id/version and server-derived `plan_occurrence_slot_hash@1` but never raw token bytes, source identity/fence, manifest/contract/effective-plan versions, `compilation_hash@1`, expected-member count, canonical ordered-member-set digest, body-free correlation evidence, and `released_at`. Permanent unique `(scope_kind, scope_owner_id, environment, plan_occurrence_slot_hash)` serializes exact and changed concurrent compilers even when the result has zero members. The slot excludes plan/membership; the comparison hash includes the complete evaluated plan, excluded/condition-false slots and safe reason codes. It is Phase 6 coordination metadata, not a workflow run, outcome ledger, scheduler, outbox, or queue.
- **Phase 16-compatible: `communication_intents`** — durable scope-owned pre-dispatch envelope. Common columns include `id`, exact `ExecutionScope`, environment, immutable same-generation FK to the generated trigger-binding projection, exact effective Delivery Plan id/version, all binding-owned event/contract/step/ordinal/channel/publication-slot/recipient/resolver/fact-adapter/action-issuer/condition versions, stable producer namespace id, producer implementation version, persisted occurrence-slot token schema version, server-derived `occurrence_slot_hash@1`, server-derived `semantic_identity_hash@1` plus schema version, server-derived `immutable_command_hash@1` plus schema version, exact producer fence/revision, one matching-branch recipient authority, locale/timing, ordered presentation/collection/relation/action digests, nullable same-scope/environment plan-occurrence parent FK plus nullable nonnegative member ordinal, claim/result revisions, and body-free result refs. Parent and ordinal are both null or both non-null and mandatory for Phase 17 plan children; ordinal is unique and gap-free per parent. Immutable business columns cannot update, and denormalized binding fields cannot override the projection. Permanent unique `(scope_kind, scope_owner_id, environment, occurrence_slot_hash)` locks one recipient-and-channel-step slot. The bounded compiler transaction inserts/locks the unique parent, inserts or exactly replays every child in canonical order, verifies exact count/digest, and writes parent `released_at` last; claim SQL requires a released same-scope parent. Exact replay returns the same parent/children, any parent or child mismatch hard-conflicts, a committed unreleased parent is an alerted invariant violation, and a legitimate successor uses fresh producer-authorized plan/member tokens. The tenant branch requires either same-tenant Party/contact/profile for email, or a contract-permitted same-tenant no-Party authority revision plus tenant profile with every Party/contact/address history field null; tenant-only in-product items still require their declared role-safe authority. The service-only platform email branch requires exact platform-recipient authority and fixed platform profile while tenant/Party/contact/site fields stay null; platform in-product is unavailable. Exact same-scope fence and result FKs plus CAS guard every transition. `indeterminate` fences another external send until reconciliation proves outcome.
- **Phase 16-compatible: `communication_intent_relations`** — immutable same-scope relation rows: exact `ExecutionScope`, environment, intent, `related_type`, `related_id`, `relation_role`, `ordinal`. They use the closed relation vocabulary and authorization filtering; uniqueness and composite FKs begin with scope owner. The platform branch accepts only its contract-declared typed platform source relation and cannot reference tenant business records. On successful submission the seam copies the exact authorized relation set to the same-scope event. A relation describes meaning only and grants no access.
- **Extended: `email_suppressions`** — add the `source` provenance value set (reserving `mailchimp`). No new suppression table; this stays the one "don't contact" source of truth the gate reads.
- **Not created (rejected duplication):** a provider-selected `communication_recipients` table, generic `communication_provider_links`, a second provider/history ledger, or `communication_preference_snapshots` (the consent decision is frozen on the intent/event). Exact submission/member/attempt/evidence records are part of the one Phase 6 spine, not duplicate provider abstractions.
- **Consumed, migrated, or adapted:** `tenant_email_settings` remains the one mutable tenant connection/secret owner; `email_send_logs` + `email_events` are REAL legacy delivery/evidence inputs whose readers, writers, and FKs move into the scoped Phase 6/17 submission/attempt/evidence model before their independent authority is fenced; `email_templates`/`email_template_versions` are Email Studio migration inputs; Party/contact points plus transitional `donors`/`missionaries` provide recipient identity and consent; `donations`/Phase 16 commitment records/`campaigns`/`funds` remain relation owners; `support_messages`/`support_audit_log`, `member_care_activities`, and `donor_activities` are adapted/surfaced; `crm_record_links` retains provider account links; and the Phase-3 projection contracts plus consent gate remain prerequisites.
  _(Amended 2026-07-19: the preceding list describes the tenant branch. The
  platform branch consumes Phase 17's service-only `platform_email_settings`,
  `platform_resend_secret_revisions`, and `platform_resend_evidence`, plus Eve
  #436's exact `platform_owner_notification_records` authority revision.
  `email_send_logs` and `email_events` must be migrated or adapted into the same
  scoped submission/attempt/provider-evidence model; they cannot remain
  tenant-only side doors or a competing history authority.)_
  _(Amended 2026-07-13: Phase 16 recurring and fixed-pledge records replace
  `donor_pledges` as relation authorities. Phase 16 owns reminder/recovery
  domain meaning, candidate policy, recipient projection, and business
  eligibility re-proof, then submits eligible current meaning through the
  guarded Phase 6 service. Phase 6 creates and owns durable, idempotent
  `communication_intents`, consent evaluation, `communication_events`,
  dispatch, delivery outcomes, suppression, and history; Phase 17 owns editable
  content. Phase 16 domain code must not hardcode Resend or Email Studio.)_
- **Consent booleans** stay on `donors` (`do_not_contact` / `do_not_email`); the snapshot records their value at send, it does not move them.

### E. Contracts / wiring

- **Resend:** every send carries a required idempotency key (already enforced) and now also a correlation tag/custom-arg (A11e); the Svix-verified, deduplicated webhook fails closed unless it resolves the exact connection revision, derives that revision's tenant/platform scope tuple, and only then performs recipient lookup and scope-prefixed provider-message attachment; unresolved, ambiguous, or cross-scope evidence is quarantined rather than forced through tenant lookup; all delivery event types are handled; batching stays reserved for the bulk phase and MUST use the current official adapter limit rather than a hard-coded 50-recipient cap; long-term history is Asym-owned (provider retention is short).
- **Pre-dispatch intent service (Phase 16 amendment):** `compileAndReleaseCommunicationPlanOccurrence(input)` accepts one complete bounded producer occurrence bundle and is the only producer entry point—even for one or zero members. The producer supplies a separate `plan_occurrence_token@1` and independent member tokens. The top-level token is canonical opaque 1–128-byte UTF-8, PII/secret-free, unique for one occurrence within the stable producer namespace, and retained in original form by the producer for replay; Phase 6 persists only its schema id/version and derived slot hash. A generated server-only event/binding resolver creates top-level scope/event/contract/plan authority even for an empty candidate set, reloads every immutable binding projection, and resolves the exact effective plan; producers cannot select contract/generation, event kind, plan, step, channel, publication slot, recipient role/resolver, fact adapter, action issuer, scope, or delivery identity. Each child retains the immutable binding-projection FK and all binding/event/plan versions. The private transaction-scoped `submitCommunicationIntent` child primitive accepts one recipient resolver input and relation set for exactly one channel step, cannot commit independently, and cannot be called repeatedly by a producer. It derives one closed server-side `CommunicationScope` of `tenant` or `platform`, resolves exactly one concrete recipient authority, derives the exact `(scope_kind, scope_owner_id, environment)` and occurrence-slot hash, and atomically inserts or locks the permanent member slot before comparing the semantic-identity and immutable-command hashes. Multi-recipient/channel/step fan-out is materialized only through these private independently keyed member operations inside the compiler transaction; one token can never identify two recipients, channels, or steps. The compiler independently derives the complete applicable child set under finite binding/global bounds, then one PostgreSQL transaction locks source fence → effective plan/generation → unique `communication_plan_occurrences` slot → canonical member slots; inserts or exactly replays the parent; inserts/replays every child with same-scope parent FK and gap-free ordinal; verifies parent comparison hash plus exact member count/digest and every child hash; and writes parent `released_at` last. The unique parent serializes identical/changed concurrent compilers and makes zero-member results durable. Crash before commit exposes no parent or child; crash after commit/before response exactly replays; changed plan, binding, condition, recipient, membership, count, digest, or child input hard-conflicts. A closed result distinguishes new release, exact replay, successful zero-member release, safe conflict, and safe rejection; it exposes no raw token/hash or cross-owner id. The tenant branch requires the exact tenant, profile, template, and exactly one of Party plus channel-applicable contact versions or the tenant non-constituent no-Party recipient-authority version; the no-Party transport address remains confined to encrypted, short-lived prepared-delivery material. The service-only platform branch requires the fixed platform scope, exact current ratified recipient-authority branch, and an exact Live platform-scoped contract/generation with its meaning-specific source occurrence/fence plus matching fixed publication and platform profile; when the current generation has no such key, intent creation rejects before inserting a row. It has no tenant, Party, contact, site, or tenant-business relation and cannot fall back across branches. `advanceCommunicationIntentFence(scope, producer, fenceKey, expectedRevision, nextRevision, reason)` must run inside the producing domain's invalidating transaction; it advances/closes only that exact `(scope_kind, scope_owner_id, producer, fence_key)` and atomically supersedes only older unstarted intents bound to it. `claimCommunicationIntents(scopeShard, now, lease)` is internal, bounded, sharded by `(scope_kind, scope_owner_id)`, CAS-fenced, joins plan children only through a same-scope parent with `released_at IS NOT NULL`, and cannot claim across owners. A committed unreleased parent is an alerted invariant violation with no force-release path. `dispatchCommunicationIntent(intentId, claimToken)` locks the same-scope exact fence then intent, requires the current open producer revision, re-proves the selected tenant recipient-authority branch or the platform recipient-authority revision, and re-proves purpose consent/suppression where applicable, channel availability, matching-owner profile send-readiness, template publication, time window, and duplicate state before committing `dispatching` as the single dispatch decision. Every relation, claim token, lock, semantic identity, profile resolution, result, and history attachment preserves the same scope tuple; no fake tenant or cross-scope lookup is allowed. For email, the intent carries semantic identity into `sendEmail`, but the provider-request idempotency key is derived and frozen only from the exact one-member or batch submission envelope—endpoint, bytes, member ordering, and member map—and never aliases any member intent identity. In-product is tenant-only and appends the local role-safe `available` event/projection without a provider call. A recovering `dispatching`/timed-out worker first reconciles the same-scope permanent send log and provider evidence; it never blind-sends, and any unresolved external boundary becomes `indeterminate`. Success binds one event and, for email, one send log; a gate failure records a reason-safe terminal suppression. The producing domain owns the fence and whether its business candidate remains eligible; Phase 6 validates only the bound revision and does not reinterpret source facts.
- **Occurrence-slot and immutable-identity input (Phase 17 clarification):** the producer supplies one bounded opaque recipient-and-channel-step occurrence-slot token plus its declared token-schema version per intended communication, not a permanent semantic key/hash. The producer persists the original token bytes and schema version for replay; a legitimate successor or additional recipient/channel/step requires a new producer-authorized token. The server derives and stores (a) `occurrence_slot_hash@1` as a domain-separated hash of environment, scope kind/owner, stable producer namespace id, and token bytes; (b) `semantic_identity_hash@1` over the slot, producer implementation and token-schema versions, environment, producer/source identity and fence, scope, contract/generation, plan/step, recipient resolver and exact concrete authority, and channel; and (c) `immutable_command_hash@1` over the complete typed facts/source-snapshot digest, ordered collections, relation-set hash, presentation cases, protected-action input, recipient-resolver input, and timing/utility bounds in addition to the identity terms. The exact-scope/environment slot is permanently unique. One transaction inserts or locks it and returns the prior row only when both comparison hashes and their schema versions match. Reuse with any changed term or immutable input is a hard conflict before returning existing work. The stable producer namespace is never a deploy/version string; N/N-1, rollback, namespace rename, or a future hash schema must preserve the existing candidate's slot through the original token or explicit migrated alias rather than rehashing it into new work.
- **Delivery-profile service (Phase 16 amendment):** `appendCommunicationDeliveryProfileVersion(tenantId, expectedSenderIdentityHash, reason)` reads the real `tenant_email_settings` row under authorization, rejects stale identity or non-send-ready settings, and appends the non-secret snapshot. `resolveCommunicationDeliveryProfile(versionId)` never returns credentials; dispatch separately obtains the current secret from the settings owner and verifies that current connection/domain evidence can still honor the frozen from/reply-to identity. Send counters and other operational fields are outside the identity hash and cannot spuriously invalidate a profile. For platform scope, a separate service-only platform command derives the fixed scope from current platform-recipient authorization, reads `platform_email_settings`, and applies the same stale-identity, send-readiness, and non-secret snapshot rules; neither owner may cross-resolve or fall back to the other.
- **Inngest:** the reconciliation/backfill function follows the house pattern — the strict event envelope (which **forbids raw payloads/PII in events**), scope-owner-keyed `concurrency`, singleton scans, idempotency keys with attempt epochs, `NonRetriableError` vs `RetryAfterError`, `onFailure` recording — reusing the existing serve/client/ledger/claim machinery; unit-testable via `@inngest/test` (worktree dev-env quirk noted). Tenant and platform owner work never shares a claim or concurrency key.
- **Stripe:** the correlation chain (Stripe event → donation → receipt send → communication event) is preserved using the same store-raw-then-process + idempotency discipline the repo already uses for Stripe; Phase 6 changes no Stripe handling.
- **Supabase/Postgres:** one exclusive `tenant_id` XOR `platform_scope_id` owner arc with generated `scope_owner_id`; scope-prefixed parent/result/claim/provider uniqueness and FKs; a tenant recipient exclusive arc requiring either composite Party/contact-point/profile/intent FKs or the same-scope no-Party authority/profile/intent FKs; platform-branch exact authority/profile FKs with tenant fields null; permanent unique exact-scope/environment `plan_occurrence_slot_hash@1` on the coordination header and `occurrence_slot_hash@1` on every child; same-scope parent/ordinal uniqueness, exact count/digest release check, and claim join requiring released parent; separately compared compilation, semantic-identity, and immutable-command hashes; one-event/one-send result constraints; provider-envelope request-key uniqueness for at-least-once safety; lease/CAS and monotonic status guards enforced in SQL/service, not by assuming ordered delivery. Tenant/client policies fail closed on platform rows.
- **Repo boundaries:** all business logic in `packages/api/src/communications` (server-only); app routes and the staff timeline UI stay thin; honors `data-access-boundary.md` and the platform-surfaces/boundaries specs.
- **OpenSpec:** a change under `openspec/changes/sitestacker-parity/` naming the communication-event model as the first build of Mission Control's "communications" capability; glossary (`CONTEXT.md`) additions (below); possible touch-ups to `platform-surfaces`/`platform-boundaries`.
- **UI:** the staff timeline slice uses the repo's shadcn/Base-UI system and the existing Activity-tab components; responsive and accessible per the frontend rulebook; no new design system.

### F. ADRs (to author with the docs ticket)

1. **Communication events are Asym-owned interaction history (canonical header + typed detail), not provider logs** — a per-person system-of-record for the fact a communication occurred, with payload referenced in its owning system, chosen over a wide table, EAV, or a provider log promoted to product truth.
2. **Capture by construction at the single send seam + sole-seam lint** — write-through at the one `sendEmail` gateway with CI enforcement, chosen over per-caller logging (which rots), so capture is atomic and unforgettable.
3. **Delivery events attach, never create** — provider webhooks advance an existing communication's status and never fabricate a communication (or CRM/donation truth), with monotonic terminal status and quarantine of the unresolvable.
4. **Consent state is snapshotted at send time from the gate's evaluation** — an immutable versioned record of _why_ a send was allowed/suppressed, chosen over evaluate-at-view, for auditable compliance.
5. **Keep bounded payload ownership behind one communication spine** — Support Hub and member care keep their typed payload tables while atomically recording one canonical reference event; this is a permanent bounded-context contract, not a legacy migration or second history.
6. **Synchronous delivery ingestion; Inngest reserved for reconciliation and bulk fan-out** — a single-transaction local write stays synchronous (DB constraint + monotonic guard are the reliability mechanism), matching the shipped Resend-outbound pattern; the Stripe/Resend asymmetry is workload-driven, not debt.
7. **Redact-not-delete with retention classes, to a GDPR/CPRA baseline** — erasure irreversibly anonymizes communication PII while the immutable receipt ledger is retained on the legal-obligation exemption; raw payloads live in one access-restricted store; exports are audited by disclosure risk.

---

## Testing Decisions

Good tests here assert **external behavior and safety invariants**, not implementation details — and, as in Phases 3–5, visibility and isolation failures are _silent_ (a leaked row, not an error), so they must be asserted with positive-and-negative pairs and `is_empty()`-style checks, not error expectations.

- **The negative/safety tier (permanent CI gate) is the spine.** Tenant isolation: a timeline read for tenant A never returns tenant B's events. Visibility: the donor projection never returns staff-only/internal/care/other-party events (and the missionary projection never returns another supporter's or donor-private financial events); an **unclassified event defaults to staff-only** and is invisible to donor/missionary (fail-closed). Idempotency/at-least-once: re-delivering the same provider event, and re-sending with the same idempotency key, produce no duplicate. Monotonicity: an out-of-order/late "sent" after a "bounced" does not regress status; a complaint after delivered advances it. Attach/quarantine: a delivery event with no matching communication is quarantined, never dropped, never creating an event. Suppression: a suppressed/`do_not_contact` recipient is not sent to, and the export-eligibility check refuses a suppressed contact. Consent snapshot: the recorded snapshot matches the gate's verdict and inputs at send.
- **Phase 16 intent/profile seam (permanent CI gate once built).** Replaying one complete plan occurrence with identical parent compilation and member semantic/immutable-command hashes returns the same released result; changing any occupied parent or member identity hard-conflicts. The immutable binding projection—not caller fields—owns manifest/binding/event/plan/step/channel/publication-slot/recipient routing identity; forged, stale, Reserved, Retired, unbound, cross-scope, or caller-injected routing rejects before insertion. One public producer call supplies the complete bounded occurrence. Inside its transaction, each private member operation resolves exactly one concrete recipient and channel step; multi-recipient, multi-channel, and multi-step fan-out uses independent member tokens beneath one plan-occurrence token without independently callable or committed child submissions. The bounded compiler uses the unique parent and one transaction to release the independently keyed complete child set: crash after parent/any child/before release, concurrent identical and changed/disjoint compilers, zero-recipient/all-optional-disabled/condition-false results, missing/extra/duplicate/swapped/reused child, ordinal/count/digest mismatch, partial resolver failure, bound overflow, exact replay, claim visibility, optional-condition false, N/N-1, and rollback tests prove no partial dispatch eligibility and no binding/token substitution. Cross-tenant Party/contact/profile/fence references, a contact point that no longer belongs to the Party, stale contact revision, stale producer revision, closed producer fence, stale/non-send-ready email settings, and a mismatched sender/reply-to all fail closed without a send. Plan/fulfillment/lifecycle invalidation racing claim/dispatch proves the fence linearization: invalidation before `dispatching` supersedes the intent; invalidation after it treats the communication as in flight and cannot falsely claim prevention. Concurrent claims, worker replay, lease expiry, browser retry, and an indeterminate provider timeout produce at most one `communication_events` row and, for email, one `email_send_logs` row; reconciliation precedes retry. Exact one-member and batch submission tests prove provider idempotency is frozen from the complete provider envelope and never aliases an intent identity. An in-product intent produces one role-safe `available` event and no send log/provider call; it never claims sent, delivered, opened, clicked, or read. The event carries the exact intent and relation set. A Phase 16 producer cannot use the legacy arbitrary-email path. Profile versions contain no credential/secret and remain reproducible after `tenant_email_settings` changes.
- **Phase 17 platform-scope seam (permanent CI gate once built).** The current no-platform-key generation proves schema/exclusive-arc/service-only authorization and every negative database/service fixture without provisioning a platform credential or manufacturing a test key. Fixtures attempt tenant fields on platform work, platform authority/connection on tenant work, cross-scope parent/result attachment, a mixed-scope provider envelope, tenant-role reads of platform history, provider/caller-selected scope, and a fake-tenant backfill; every case fails before provider I/O and leaves no tenant-visible row. The release that first introduces an exact meaning-specific Live platform key and ratified recipient-authority branch must additionally provision/prove the platform connection and add the positive platform preparation/send/canary fixtures. Existing rows backfill to tenant scope without changing semantic identities or history.
- **Structural assertions (CI).** A hard-blocking **sole-seam lint** that no provider-SDK send exists outside the seam; a check that the raw provider payload never appears in a communication event or any projection output.
- **The staff read slice.** End-to-end: a real send produces a person-linked communication event with a consent snapshot; a delivery webhook advances its status; the event appears in the CRM person's Activity timeline under the "Communication" filter; a multi-hat donor/missionary shows one unified timeline; the slice meets the accessibility gate.
- **The reserved surfaces' logic is tested now, without their UI.** The donor and missionary projection contracts + resolver have full unit coverage (allow-list, care-blocked, other-party-blocked, cross-tenant) so they cannot drift before the portal UIs are built.
- **Prior art.** Phase 3's projection/resolver golden-snapshot tests and consent-gate tests; Phase 4's cross-tenant negative-test tier; the existing Resend webhook dedupe tests; the Inngest recovery-scan tests (`@inngest/test`); `packages/api` service unit tests. The slice needs ≥1 seeded tenant with a donor, a missionary, a completed gift, a sent receipt, and a delivery event (a test-setup/evidence item).

---

## Out of Scope (reserved seams — documented, not built)

- **The full system-message editor and the workflow-notification builder** — Email Studio and the automations engine exist and are captured at the seam; the authoring/builder products are later phases that write to this spine.
- **Live Mailchimp / newsletter sync** — the connection/OAuth, contact/audience export (sync-out), campaign handoff, and the inbound unsubscribe/cleaned webhook. Phase 6 ships only suppression provenance, the export-eligibility contract, and non-executable channel vocabulary; it does not prebuild an adapter or transport.
- **The donor and missionary communication _UIs_** — their projections, resolver, and service functions ship and are tested; the portal views are scaffolded + documented for a portal phase.
- **SMS / push / WhatsApp delivery** — reserved as non-executable channel vocabulary only. No adapter, plug-in interface, provider credential, renderer, queue, worker, or delivery path is built. Each future channel requires its own separately ratified consent, transport, safety, migration, operations, and Phase 6 integration contract plus proof package.
- **Bulk / campaign send and the Inngest fan-out** — reserved; Phase 6 owns the events and suppression a bulk sender will rely on, not the sender.
- **The retention pruning job, the written retention policy document, and the DSAR/erasure job** — the retention classes, the redact-not-delete contract, and the erasure hook ship; the jobs and the policy artifact are a retention/compliance phase.
- **Resurrecting `notification_queue`** — prohibited. Classify/migrate any needed legacy data and retire the table, or prove one bounded non-transport owner; later workflows use governed intents and the Phase 6 outbox.
- **Any communication reporting product** — a future reporting phase reads this spine through the governed/audited export path.
- **Threading / reply-chains** — owned by Support Hub (conversations); a communication event carries only an optional reserved conversation reference.
- **Refactoring the existing Resend webhook's suppression/inbound handling onto Inngest** — reserved cleanup; Phase 6 adds only the status-advance step to the synchronous outbound path.

---

## Further Notes

- **Best-practice grounding (verified this session).** The model was pressure-tested against primary sources. Data model: Fowler (class-table inheritance vs single-table/EAV), Karwin (polymorphic-association anti-pattern), Oracle (exclusive-arc CHECK), and CRM precedent (Salesforce Activity/EmailMessage, HubSpot Timeline Events, Twenty) — confirming header + typed detail, an exclusive arc among typed detail sources, and a flexible association table. Capture/ingestion: the transactional-outbox and single-gateway patterns (microservices.io, Azure, Confluent, Fowler), ESLint `no-restricted-imports` for seam enforcement, Stripe idempotency, and at-least-once/out-of-order guidance (Stripe/SendGrid/Resend) — confirming capture-at-the-seam, unique-constraint idempotency, and a monotonic state machine. Strangler/parallel-change patterns were reviewed but are unnecessary for this greenfield target; bounded source-detail ownership remains, without migration columns or inferred backfill. Inngest official reliable-webhook, idempotency, concurrency, and Resend guidance confirms that a single-transaction upsert does **not** warrant durable orchestration and that durable steps pay off across non-transactional boundaries, so ingestion stays synchronous while attachment reconciliation/bulk work goes durable. Retention/privacy sources confirm redact-not-delete, single-store minimization, and audit-by-disclosure-risk, with the sharp caveat that erasure must be irreversible to count.
- **Congruence (verified).** Phase 6 was checked against the Phase 2–5 PRDs, the tombstoned phase-01-crm-operating-foundation.md (its content is now the Phase 8 slot, re-groom pending), and the platform specs: it fits the reserved slots those documents define (the tombstoned phase-01's quiet-steady-state principle; Phase 2's site/locale + `campaigns.channel`; Phase 3's projection/consent/export/DSAR seams; Phase 4's identity graph and provider links; Phase 5's guest-first receipt handoff) and adds no parallel systems. Phase 7 owns official receipt facts and Phase 18 owns the generated artifact.
- **Two in-flight prerequisites.** The consent gate and the branded auth-email hook are not on the base branch; the PRD and the affected tickets flag them, and dependent work gates on their merge.
- **Compliance anchors.** IRS Pub 1771 (written acknowledgments; the receipt-communication record); GDPR/CCPA/CPRA (redact-not-delete + minimization + audited disclosure); the exact Phase 7 legal-donor Statement Subject/facts version retained under the official-document policy while communication addressing and support-safe copies follow their own minimization/retention rules.
- **Why now.** Building system messages, workflows, or Mailchimp sync before this spine exists forces each to reinvent the log, consent, provider mapping, and visibility — the fragmentation this program prevents. The original event spine stays small (one header table + one junction + a suppression column + a resolver + a seam write + a reconciliation cron) precisely because it attaches to and adapts what already ships. The dated Phase 16 amendment adds only the durable pre-dispatch boundary, its relation rows, and immutable non-secret delivery-profile versions required to hand governed domain meaning into that same seam; it does not add a second sender or general workflow platform.

---

## Evidence & Acceptance

**Acceptance criteria (Phase 6 is "done" when):**

- [ ] Every real-recipient business communication produces exactly one `communication_events` row at in-product availability or external dispatch, with a consent snapshot captured from the gate's evaluation; a hard-blocking lint forbids provider sends outside the seam. Synthetic previews and synthetic test sends create bounded test/audit/provider-operation evidence only and never create Party/source-record communication history.
- [ ] The event binds exactly one closed recipient branch: canonical same-tenant Party/contact (with transitional donor/missionary keys mapping to that Party), an explicitly contract-permitted same-tenant no-Party authority kind/id/revision with no durable address, or the exact platform authority. It is never keyed by caller/provider address, provider identity, or Twenty person; a multi-hat person shows one unified timeline.
- [ ] Phase 16 commitment communications use the canonical same-tenant Party + exact purpose-eligible contact-point seam; transitional donor/missionary IDs, when retained, resolve to that same Party. Missing, stale, ambiguous, or cross-tenant identity cannot fall back to an arbitrary email.
- [ ] `communication_plan_occurrences` provide one permanent top-level producer-occurrence lock, exact compilation/member digests and zero-member proof; one bounded transaction releases its complete independently keyed `communication_intents` set only after exact parent/child verification, and claim SQL requires the released same-scope parent. Every intent remains one durable recipient-specific pre-dispatch handoff with a permanent member occurrence slot, separate semantic-identity and immutable-command hashes, immutable terms/relations, exact scope+producer+fence revision, bounded CAS claim, atomic dispatch linearization, send-time safety re-proof, indeterminate reconciliation fence, and exactly one resulting event (plus one scoped submission/attempt chain for email, none for in-product). Exact parent/member replay returns prior work; changed plan/membership/input hard-conflicts; crash, concurrency, zero-member, and overflow create no partial eligibility. Provider request idempotency remains envelope-owned. Producer invalidation supersedes only unstarted stale intents on that exact fence without teaching Phase 6 the producer's business rules.
- [ ] A Phase 16 in-product intent records only local status `available`; it never claims sent, delivered, opened, clicked, or read, and presentation/dismissal state cannot rewrite communication truth.
- [ ] The current no-platform-key generation rejects platform email before intent creation and proves every scope/recipient/connection CHECK, composite FK, tenant/platform crossover, mixed-scope batch, payload-selected owner, tenant-role read, and fake-tenant migration without a credential or test key. When the first exact Live platform key and ratified recipient branch are introduced, that same release must prove the Asym-fixed publication, platform connection/profile, preparation, provider delivery, signed evidence, and history end to end.
- [ ] Each scope-aware `communication_delivery_profile_version` references exactly one real settings owner matching its scope—`tenant_email_settings` for tenant scope or service-only `platform_email_settings` for platform scope—freezes only the applicable non-secret sender/reply-to/validation evidence, rejects mixed or cross-scope ownership, and fails closed when the current exact connection cannot honor the selected version. It never copies or owns provider credentials.
- [ ] Delivery events **attach** to the existing event and advance its status **monotonically** (a late "sent" never regresses a "bounced"); engagement is a separate signal; an unresolvable delivery event is **quarantined**, never dropped or fabricated.
- [ ] Delivery truth is reduced into the scoped Phase 6 submission/attempt/provider-evidence records and the one body-free `communication_event`. Every current `email_send_logs`/`email_events` writer, reader, webhook lookup, and FK has a proved migration or bounded adapter disposition; after the authority flip no legacy writer remains and no second history, generic provider-link, provider-selected recipient, preference-snapshot, or provider-plug-in table exists.
- [ ] Support Hub and member-care inserts **emit** an additive reference event (adapt, not migrate); support outbound is deduplicated to exactly one event; care events are `staff_only`.
- [ ] Receipts/statements write a durable, retention-classified communication event when sent; the `kind` enum reserves three donor-facing document kinds — `receipt` (built), and **`acknowledgment`** (soft-credit / DAF-advisor thank-you, no deductibility merge-fields) and **`notification`** (tribute notify-party, amount hidden) as **reserved-not-built** (Phase 7 populates).
- [ ] `email_suppressions` carries `source` provenance (incl. reserved `mailchimp`); the **export-eligibility contract** refuses a suppressed contact; Mailchimp remains a reserved integration seam (no live connection/webhook built).
- [ ] Three `communication_timeline` projections + the resolver ship and are **unit-tested** (staff/donor/missionary), driven by event `visibility`, **fail-closed to staff-only**; care/staff-only/other-party/raw-payload data is blocked from donor/missionary.
- [ ] The **staff read slice** shows communication events in the CRM person's Activity timeline (Communication filter); the donor/missionary **UIs are scaffolded + documented** with the build-pattern, not built.
- [ ] Delivery ingestion is synchronous; a **scheduled Inngest reconciliation** attaches quarantined events and runs a **bounded historical backfill**; Inngest bulk fan-out is reserved.
- [ ] Retention classes are stamped (official ≥7 yr/permanent; operational medium; ephemeral short); raw payloads live only in the access-restricted provider store and never in an event or a projection; communication exports are governed + audited by disclosure risk; events are erasure-aware (irreversible redact-not-delete, immutable receipt retained).
- [ ] The two prerequisites (consent gate, branded auth-email hook) are documented; dependent tickets gate on their merge.
- [ ] The safety/negative-test tier is green; the contract is documented (ADRs, OpenSpec, `CONTEXT.md`, the donor/missionary build-pattern doc).

**Evidence file** (Phase-2/3/4/5 style, authored at completion): the repo files inspected; the negative/safety tier + staff-slice tests passing; the sole-seam lint + raw-payload-absence CI output; the provider/Inngest/Stripe/Supabase and retention/privacy doc citations used; a screenshot of the staff communication timeline; the reconciliation/backfill run summary; known gaps; and an explicit list of what Phase 6 intentionally did **not** build (the reserved seams and the two prerequisites).

---

## Tracking Issues (epic #550 + children; created via `/to-issues`)

Mirrors the Phase-2/3/4/5 structure. Foundation tickets first (`status:todo`); the rest `status:blocked` until their blockers land; the two prerequisites (consent gate, branded auth-email hook) are called out on the tickets that depend on them. No `ready-for-agent` label until dispatch.

**Phase 17 dispatch rider (2026-07-19).** Epic #550's children predate the exact Phase 17 scope/history amendment and MUST NOT dispatch as written. Before dispatch, #553, #554, #556, #558, and #563 require body and dependency re-grooming against this dated amendment: remove the proposed personalized `subject_snapshot`; compile every new row, parent/child key, query, and provider correlation through the exact tenant/platform scope arc and connection revision; keep tenant RLS/same-scope constraints and deny tenant access to platform rows; keep synthetic previews/test sends outside Party/source-record communication history; resolve webhook scope from the proved connection revision before recipient attachment; and use typed safe catalog metadata rather than personalized subject evidence. Permanent-tier fixtures in #565 must be reconciled to the same rules. Until that reconciliation is published and verified, a legacy `status:todo` label is not implementation authority.

- **Epic — Phase 6: Shared Communication Event Model**
- **T1** — Docs: PRD, OpenSpec change + glossary (`CONTEXT.md`) terms, the 7 ADRs, and the donor/missionary build-pattern doc.
- **T2** — Canonical vocabulary + source-of-truth rules (event vs delivery event vs recipient vs suppression vs provider link; "attach not create"; "adapt not migrate"). _(foundation)_
- **T3** — The `communication_events` spine + `communication_event_relations` junction: schema, exclusive-arc person + source-detail CHECKs, indexes, retention/visibility columns. _(foundation)_
- **T4** — The `communication-recorder` write path + capture at the `sendEmail` seam + the sole-seam CI import-lint. _(foundation, depends on T3)_
- **T5** — Consent snapshot at send from the gate's evaluation. _(depends on T4; prerequisite: consent gate)_
- **T6** — Delivery-event ingestion: verify the connection revision, derive the exact scope tuple, attach the provider email id to the permanent internal provider-message identity under that scope, apply the monotonic status state-machine (data-map precedence), keep engagement separate, and quarantine unresolved/ambiguous/cross-scope evidence. Recipient address is validation evidence only, never the attachment key. The reducer remains synchronous in the existing webhook. _(depends on T3)_
- **T7** — Suppression provenance + the export-eligibility contract + the reserved Mailchimp channel/adapter seam. _(depends on T3)_
- **T8** — Durable receipt/statement-sent communication events (retention-classified). _(depends on T4)_
- **T9** — Additive emit-hooks for Support Hub + member care (in-transaction reference events, support-outbound dedupe). _(depends on T4)_
- **T10** — The three `communication_timeline` projection contracts + the role-safe resolver + full unit tests (staff/donor/missionary). _(depends on T3)_
- **T11** — The staff read slice: communication events in the CRM-person Activity timeline (Communication filter). _(depends on T10)_
- **T12** — Donor + missionary read paths: service functions + tests + scaffolded/documented portal UIs (reserved). _(depends on T10)_
- **T13** — Inngest quarantine attachment reconciliation with exact-correlation proof and no historical event synthesis (recovery-scan/ledger/claim pattern). _(depends on T3, T6)_
- **T14** — Retention classes + raw-payload minimization + governed/audited exports + the erasure-aware redact-not-delete hook. _(depends on T3)_
- **T15** — The safety/negative-test tier + structural CI gates (sole-seam lint, raw-payload absence) + the Phase 6 evidence file. _(depends on T2–T14)_

## Dated Phase 17 communication-spine amendment (2026-07-19)

This amendment is a narrow partial supersession of the Phase 6 candidate
details below. Phase 6 remains the one recipient-specific communication-intent,
dispatch, provider-evidence, consent-snapshot, and history spine.

### Test sends and the fact-rich preparation boundary

**Old statement.** Every platform-originated email, including template test
sends, creates a person-centered `communication_event`; domain intent moves
directly toward the one `sendEmail` seam.

**New winner.** Producer-owned intent plus Phase 17 preparation is the
authoritative fact-rich boundary. A real recipient communication still becomes
one immutable recipient-specific Phase 6 intent and, at actual in-product
availability or external dispatch, one event. Synthetic previews and synthetic
test sends create test/audit and provider-operation evidence—not a fabricated
donor, missionary, or staff communication-history interaction.

**Compatibility boundary.** `sendEmail` remains the only external-email writer
and direct provider SDK use remains forbidden. A deliberate test to a real
address may retain bounded operational send evidence, but it never asserts a
business message occurred for a Party or source record.

### Durable history and Recent sent copy

**Old statement.** The event header contains `subject_snapshot`; channel body
payload remains only in its existing owner; ordinary single in-context views
are not audited.

**New winner.** Durable Phase 6 history remains body-free and may retain only a
contract-proven durable-safe catalog title/purpose/classification plus immutable
integrity, relation, consent, preparation, and provider-outcome evidence. For an
eligible tenant-scoped email only, a resolved personalized subject and
support-safe body may live in one separately encrypted, expiring Phase 17 Recent
sent copy detail. Platform-scoped messages have no readable-copy branch in this
generation. Opening the body-free summary remains an ordinary view; every
successful or denied reveal of a tenant personalized recent copy is a narrow
content-free privileged disclosure audit.

**Compatibility boundary.** The recent copy is not communication truth, an
official receipt/statement, publication, retry payload, provider log, search or
export corpus, or legal archive. Phase 7 owns source eligibility, facts,
issuance, and correction effect; Phase 18 alone owns the generated definition,
publication, request, exact artifact, current head, access, and document-records
evidence. Phase 17 owns the surrounding message and delivery over this Phase 6
spine.
Security/credential messages and Phase 10 restricted/high-risk messages store
no readable personalized copy. Legacy subjects remain honest legacy evidence;
they are not relabeled or used to fabricate recent copies.

### Delivery identity, sender and reply resolution

**Old statement.** `tenant_email_settings` holds one singular From/Reply-To
identity and `communication_delivery_profile_versions` has one latest version
per tenant.

**New winner.** `tenant_email_settings` remains the sole mutable owner of one
tenant-owned Resend connection, active/pending credential and webhook
authorities, and readiness evidence. It owns one required Default Sender
Profile plus bounded same-domain Sender Profiles and separately revisioned,
access-confirmed human-reply destinations. A communication delivery profile is
an on-demand immutable, non-secret composition of the exact Sender Profile,
Sender Purpose/site, reply posture/destination when applicable, underlying
connection revision/hash, channel, and validation evidence. Several prepared
identities may coexist for one tenant.

A platform-scoped fixed system email uses a separate service-only Asym Resend
connection and verified platform-recipient authority through the same Phase 6/17
intent, preparation, provider-event, recovery, and body-free history spine. It
has no tenant id, tenant publication, tenant credential, or tenant fallback
authority; a structural scope constraint prevents cross-scope selection.

### Exact tenant/platform ownership arc

This section normatively supersedes every Phase 6 statement that requires a
non-null `tenant_id`, tenant-only occurrence/semantic identity, or a Party/contact recipient
for **platform-scoped email only**. Tenant behavior otherwise remains unchanged.
Every row in the recipient-specific execution/history chain—intent, fence,
relation, preparation, prepared artifact, provider submission, submission
member, attempt, provider evidence/event, communication event, and repair
item/case—carries the same closed scope tuple. A Recent sent copy is a separate
tenant-only detail and has no platform branch in this generation:

- `scope_kind` is exactly `tenant` or `platform`;
- `tenant_id` and `platform_scope_id` form an exclusive arc: tenant scope
  requires `tenant_id` and forbids `platform_scope_id`; platform scope requires
  `platform_scope_id` and forbids `tenant_id`;
- `scope_owner_id` is a stored generated value equal to the one non-null owner
  id, so every parent exposes `UNIQUE (scope_kind, scope_owner_id, id)` and every
  child uses `(scope_kind, scope_owner_id, parent_id)` as its foreign key; and
- every permanent semantic/idempotency key, provider-id lookup, state/claim
  index, and uniqueness rule is prefixed by `(scope_kind, scope_owner_id)`.

`platform_communication_scopes` is a service-only registry with one stable
`asym_platform_operations` row per environment. It is not a tenant alias and
cannot be selected from a request, recipient address, queue payload, provider
metadata, or client-supplied id. The database CHECK above and composite foreign
keys make a cross-scope relation impossible even if application authorization
fails.

The recipient columns form a second exclusive arc. A tenant intent requires
exactly one of the same-tenant Party/contact-point path or the tenant
non-constituent no-Party recipient-authority path and leaves platform recipient
columns null. The no-Party path leaves Party/contact-point columns null, retains
only its body-free scope-safe authority/reference in durable execution and
history, and permits the transport address only in encrypted, short-lived
prepared-delivery material. It cannot create a fake Party or use an unresolved
address as identity or provider-event correlation authority.
Platform recipient authority is a closed mutually exclusive union. Platform v1
permits only `platform_recipient_authority_kind = eve_platform_owner`, an exact
`platform_owner_notification_record_id` plus immutable authority revision and
identity/permission epoch, and leaves Party/contact-point columns null. It may
resolve only the currently enabled, verified app-owned platform-owner record
defined by Eve #436. Any unknown, missing, future, or caller-selected branch
rejects before intent creation. Preparation re-proves that record and freezes the
restricted destination only inside the prepared delivery artifact; body-free
history keeps the authority reference, not an arbitrary email address. Platform
relations may reference only the typed Eve source occurrence/fence; they cannot
point at a tenant, donor, missionary, Party, gift, or other tenant-owned record.
Asym customer-account bootstrap/security mail remains a separate forward
boundary and cannot use this branch until its own app-account authority and
meaning-specific contract are ratified.

Platform transport is equally explicit. `platform_email_settings` is the one
service-only mutable connection aggregate for a platform scope/environment;
`platform_resend_secret_revisions` and `platform_resend_evidence` are its
encrypted credential revisions and minimized proof. A scope-aware
`communication_delivery_profile_version` references exactly one of
`tenant_email_settings` or `platform_email_settings`, never both, and freezes
the applicable non-secret connection and sender/reply policy revision. The
platform connection cannot satisfy a tenant profile or act as fallback.

Tenant RLS/service predicates continue to require the authenticated tenant and
`scope_kind = tenant`. Platform rows deny every tenant/client role all
`SELECT`/`INSERT`/`UPDATE`/`DELETE` access and are reachable only through the
service-only platform command path after current platform-owner authorization.
Provider ingress resolves the exact connection revision before scope and
recipient lookup; provider payload fields never choose either owner. Existing
rows backfill as tenant scope without rewriting history. No migration may create
a fake tenant to carry platform mail.

**Compatibility boundary.** No API key or webhook secret enters a delivery
profile. Reply-To authority comes only from the Phase 17 human-reply resolver,
never the Sender Profile or template. Dispatch re-proves that the live exact
connection can still honor the frozen composition. There is no request-level
From override, silent sender/reply substitution, shared platform sender **for
tenant messages**, or cross-account retry. Existing singular defaults backfill the required Default
profile without rewriting historical send evidence.

### Prepared identity, provider boundary and recovery

**Old statement.** Phase 6 defines idempotent dispatch and provider
reconciliation but does not fully separate prepared-message identity from
definitely unsubmitted, accepted, rejected, or indeterminate provider outcomes.

**New winner.** One Prepared message identity freezes the exact recipient,
source occurrence/fence, contract/activation generation, Delivery Plan/step,
publication, typed fact projection, locale, Brand Kit/Role Layout/assets,
Sender Profile/reply destination, consent basis, protected-action descriptor,
subject/body/plain-text payload digest, and provider account/credential
revision before submission. A timeout or lost response is **Delivery outcome
unknown**, not failure. D15 whole-message recovery may choose another complete,
contract-compatible publication only before preparation. After preparation or
possible submission, recovery reconciles/resubmits only the exact frozen
identity when provider evidence proves that safe; it never re-resolves or
changes content, action, locale, sender, tenant account, or idempotency meaning.

The prepared-delivery artifact is encrypted restricted execution material,
separate from durable history and Recent sent copy. Before external I/O, one
immutable provider-submission envelope seals the exact Resend endpoint,
connection/credential, serialized bytes/hash, one request key, and contiguous
ordered member map. Single and strict batch submissions use the same Phase 6
outbox/queue; every member remains an independent recipient intent/outcome, and
an uncertain member mapping makes the provider request indeterminate rather than
permitting split/rekey/replay.

Each Phase 17 contract maps every delivery step to a closed prepared-artifact
retention class. At seal, Phase 6 materializes the selected class and the earliest
nonextendable class/utility/action/source deadline on the prepared artifact; a
batch uses its earliest member deadline. Exact acceptance, terminal rejection,
terminal no-send, provider-idempotency expiry for an indeterminate request, or
the deadline immediately removes decrypt/adapter authority. Primary encrypted
bytes, wrapped keys, and plaintext-capable caches purge within 24 hours while
body-free hashes and outcome evidence remain. Provider uncertainty may remain
truthfully unknown after purge, but it never retains replay or body-restoration
authority.

**Compatibility boundary.** Known success and indeterminate attempts are never
blindly resent. Definitely rejected work follows the contract's retry posture.
Receipt/statement communication resumes only from current Phase 7 source facts
and the exact current Phase 18 artifact; Phase 17 never rerenders it, and
protected actions are reissued only by their producer. Repair groups one actionable cause without
becoming a second task/workflow/communication ledger. Transport batching is an
optimization over distinct recipient messages and uses the current official
Resend adapter limit; the old prose's fixed 50-recipient number is not a
durable product rule.

### Provider-evidence minimization

**Old statement.** Current provider tables may retain raw payloads, complete
click URLs, IP addresses, user agents, and unbounded error text.

**New winner.** Signed Resend events normalize only the typed evidence needed
for delivery reduction, suppression, reconciliation, and audit. Raw
reconciliation material is access-restricted and short-lived. Durable event,
send-log, metric, trace, case-signature, and audit labels contain no recipient
address/name, personalized subject/body, protected destination/token, complete
click URL, IP/user-agent data, tenant secret, raw provider payload, or unbounded
exception text.

Reduction keeps provider submission, mail-server delivery, complaint/reputation,
advisory engagement, evidence health, Phase 3 consent/contact authority, and
Resend suppression as independent axes. Provider suppression is current
connection-region/contact-revision evidence, not a Sender Profile switch or a
replacement for consent; with a send-only key Asym can prove only that it has no
known blocking evidence. Duplicates and late events add evidence monotonically;
contradictory terminal delivery facts quarantine instead of overwriting.

**Compatibility boundary.** Evidence required to reconcile historical provider
outcomes remains truthful. Migration classifies and prunes rich legacy payloads
under explicit retention; it does not delete official communication facts or
pretend past storage already met the Phase 17 minimum.

### Durable provider correlation and legacy cutover

**Old statement.** Some original Phase 6 prose and ticket text attach delivery
by provider message id plus recipient email and allow `recipient_email` to stand
in for an unresolved send.

**New winner.** Recipient address is restricted delivery material, never a
durable correlation key. Before provider I/O, every recipient preparation gets
one permanent internal provider-message identity. A submission member carries
that identity, the scope tuple, connection revision, request/member digest, and
semantic idempotency identity. Provider acceptance adds the Resend email id to a
unique scope- and connection-prefixed correlation index. The opaque webhook
route first resolves and verifies one connection revision, thereby fixing
`scope_kind` and owner; only then may `{scope_kind, scope_owner_id,
connection_revision, provider_email_id}` attach normalized evidence to the
internal identity. Recipient email/name, tags, or payload metadata never select
scope or attachment.

If a response is lost before the provider id is known, reconciliation uses the
sealed request identity, exact bytes/digest, idempotency key, attempt fence, and
provider evidence. It never searches or retries by recipient address. Late or
reordered events remain attachable after short-lived raw material and recipient
PII are purged because the internal/provider identities and minimized signed
correlation evidence are durable. An event that still cannot resolve is
quarantined; it cannot fabricate a communication.

The M1 cutover inventories every live `email_send_logs`/`email_events` consumer,
including receipt `receipt_send_log_id`, Support Hub `outbound_send_log_id`,
contribution-operation and approval senders, and the Resend webhook reducer.
Add the new internal/scope correlation and compatibility references first;
backfill only proved mappings; bounded dual-write/adapter reads remain observed
and reversible; migrate each FK consumer; then fence the old writer and remove
recipient-based attachment. No authority flip occurs while a live reader,
writer, webhook lookup, reconciliation job, or FK still depends on the legacy
shape. Missing proof stays explicit and blocks removal rather than fabricating a
mapping.

### Authorized provider scope

**Old statement.** A11 describes a provider-agnostic service, a provider adapter
entry point, and provider-portable correlation as if Phase 6 should prebuild a
multi-provider email framework.

**New winner.** Phase 17 authorizes **Resend only** for product email. The
platform-level delivery reducer may keep normalized states and evidence shapes
so producer domains do not depend on Resend vocabulary, but implementation does
not add a second provider adapter, provider plug-in framework, provider-selection
policy, cross-provider retry, or speculative portability layer. Correlation is
proved for the exact tenant-owned Resend connection or the structurally separate
Asym platform Resend connection and the frozen prepared-message identity.

**Compatibility boundary.** Existing normalized delivery states remain useful
inside the one Phase 6 spine; they are not a promise to support another provider.
Any future provider adoption requires a separately ratified product decision,
congruence review, migration plan, and evidence package rather than activating a
dormant abstraction.

## Dated Phase 21 D19 Support Workspace notification amendment (2026-08-01)

Phase 21 owns each prospective Support Workspace Notification Preference
Version and the source event's Support-Assignment/event-family eligibility.
Phase 6 remains the sole owner of recipient-specific communication intent,
send-time suppression and consent evaluation, dispatch, provider evidence,
delivery reduction, and communication history. Phase 17 owns governed content
and sender preparation where a message is required.

A preference grants no workspace or source-data access. Immediately before
intent release, Phase 6 re-proves the exact recipient principal/Party binding,
Active Tenant Assignment, Tenant, Legal Entity, Support Assignment, purpose,
the sole Phase 12 projection decision with its internal Phase 3/10 strictest-
wins classification and alias floor, current preference version, source fence,
contact point, consent, and suppression. Revoked access,
superseded preference, ended eligibility, stale queued work, or a restricted
recipient is suppressed before disclosure and recorded through the existing
safe outcome/recovery contract. Participation, relationship labels, prior
delivery, or possession of a queued intent never substitutes for that proof.

## Dated Phase 21 D22 prospective-expense notification amendment (2026-08-01)

Phase 21 owns D22 notification eligibility and the exact source stage; Phase 17
owns governed content and sender preparation; Phase 6 alone owns recipient-
specific intent, send-time consent/suppression, dispatch, evidence, outcome,
and history. D22 activation creates no blanket subscription, and disabled or
unauthorized scopes create no notification signal.

Immediately before release, Phase 6 re-proves the exact recipient binding,
Active Tenant Assignment, Tenant, Legal Entity, request and claimant scope,
purpose, source fence, the sole Phase 12 decision with its internal Phase 3/10
strictest-wins classification and alias floor, contact point, consent, and
suppression. Revoked authority, stale assignment, superseded request, ended
posture, or resolved work suppresses queued content. Messages contain only an
opaque reference, a bounded safe stage or action, and, when needed, a due date.
The timing/context allow-list contains no other values. Private evidence,
itinerary, location, destination, vendor, attendee, companion, health, security,
relationship, private-note, unnecessary-amount, reviewer-internal, or financial-
promise detail is forbidden.

## Dated Phase 21 D24 expense-collaboration communication amendment (2026-08-02)

Phase 21 owns whether one exact D24 invitation, preparation, claimant-
confirmation, conflict, revocation, or safe next-action occurrence is eligible
for notice. Phase 12 owns current recipient authorization; Phase 17 owns only
governed content and preparation; and Phase 6 remains the sole owner of
recipient intent, send-time consent and suppression, dispatch, delivery
evidence, outcome, and history. An Assignment, invitation, prior message, or
delivery result never subscribes or authorizes a recipient.

Immediately before release, Phase 6 re-proves the exact recipient
principal/Party binding, Active Tenant Assignment, Tenant, Legal Entity,
claimant and helper scope, Expense Program, purpose/claim family, current Claim
and Assignment Versions, evidence-safe projection, the sole Phase 12 decision
with its internal Phase 3/10 strictest-wins classification and alias floor,
governance epoch, contact point, consent, and suppression. Revocation,
principal disablement, stale confirmation, superseded claim or assignment,
ended scope, or resolved conflict suppresses queued work before disclosure.

Messages carry only an opaque reference, a safe plain-language stage or action,
and the minimum timing context. They omit receipt or evidence content, private
notes, claimant-only assertions, sensitive merchant/location data, unnecessary
amounts, reviewer internals, and broad financial context. Communication history
preserves recipient and message evidence separately from claimant, economic
payer, evidence contributor, preparer, submitter, confirmer or attestor,
reviewer, approver, beneficiary/payee, and actual actor principal.

## Dated Phase 21 D25 expense-resolution communication amendment (2026-08-02)

Phase 21 owns whether one exact D25 request, response, source-owner result,
wait-reason change, or material completion occurrence is eligible for notice.
Phase 12 owns current recipient authorization; Phase 17 owns governed content
and protected-action presentation; Phase 6 alone owns recipient intent,
send-time consent and suppression, dispatch, delivery evidence, outcome, and
history. Send and protected-link open both reauthorize current Tenant, Legal
Entity, recipient, claimant/claim scope, purpose, case/cause/version,
classification, capability, and governance epoch.

Protected-link open enters one authenticated Phase 6 protected-action boundary,
which delegates the sole authorization decision to the Phase 12 PDP using the
current D25 cause-owner case/cause/version facts as inputs. D25 supplies source
facts and never co-authorizes. The boundary fails closed unless the current
principal, Active Tenant Assignment, Tenant, Legal Entity, recipient,
claimant/claim scope, purpose, case/cause/version, classification, capability,
and governance epoch all match. No case body, evidence metadata, byte reference,
or permitted disposition is returned before the sole PDP decision and source-
owner fact checks pass.

Messages contain only an opaque reference, one safe action or wait reason, and
minimum timing. Receipt or evidence URLs, merchant/location details, claimant-
only facts, private notes, internal lifecycle reasons, reviewer internals, and
provider/accounting detail are forbidden. Delivery, failure, link open, reply,
silence, or timeout cannot supply claimant facts, select a decision, satisfy a
downstream disposition, or complete a case.

## Dated Phase 21 D26 records-export communication amendment (2026-08-02)

Phase 21 may declare one exact package-ready, ready-with-issues, package-failed,
offboarding-window, records-review, or certified destination-result occurrence
eligible for notice. Phase 17 owns governed content and protected-action
presentation; Phase 6 alone owns recipient intent, current consent/suppression,
dispatch, delivery outcome, and communication history. D26 creates no blanket
subscription and healthy policy/retention operation creates no routine message.

Immediately before release, Phase 6/12 re-proves the exact recipient and
actual-principal binding, Active Tenant Assignment, Tenant, Legal Entity,
records purpose, package and manifest identity, safe state, restricted-person
posture, current capability and authorization epoch, contact point, consent,
and suppression. Before the authenticated action returns package or manifest
data or permits retrieval/transfer, it rechecks the exact package and manifest
classification plus the separate Phase 10 clearance, purpose, step-up, rate,
and audit gates. Generic package access or a prior message authorization cannot
substitute. The message contains only an opaque reference, safe state, exact
package-byte expiry or records-only-window deadline where applicable, and one
authenticated next action. Delivery, open, reply, print, silence, or failure
never proves download, external custody, verified transfer, retention, hold,
disposal, completeness, or legal sufficiency.
