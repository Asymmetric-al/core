# Design — SiteStacker Parity Program (Phase 0)

## Context

Phase 0 stabilizes the baseline before parity work. It is governance + evidence
only; it ships no features. These decisions came from a structured Phase 0 grill
(2026-07-03).

## Decisions

- **Outcome parity, not blueprint parity.** SiteStacker is the benchmark of what
  a missions org must be able to accomplish; the platform builds those outcomes
  on its own model. Rationale: cloning SiteStacker's structure would fight the
  platform's surface/boundary model and produce bolt-ons.
- **Benchmark = official SiteStacker docs, cited or "not yet sourced."** No live
  SiteStacker instance is in use. Known limitation: docs describe features, not
  always operational depth.
- **Baseline = the live commit, with the develop→production gap recorded.** As
  of 2026-07-03: `production` HEAD `fb168d89` (2026-06-20) is the live candidate;
  `develop` HEAD `44c2637e` is 374 commits ahead. Confirming the true live
  commit is a human-only (Lane 2) task.
- **Two-lane truth-finding.** Lane 1 = repo/agent-provable; Lane 2 = human-only
  live confirmation. The live state is never assumed.
- **Governance by reference.** The existing boundary specs are the binding
  rules; the program points to them and adds one parity-specific reminder rather
  than restating them (avoids drift).
- **Program-only up front.** Only enough is written to govern the program; each
  of the 25 areas is specified in its own change + PRD when it is built.
- **One roadmap governs phase architecture (added 2026-07-07, Roadmap v2).**
  The phase set/numbering/ordering/dependencies live in
  `docs/prds/sitestacker-parity/roadmap.md` (41 phases, 0–40, seven lanes);
  `phase-map.md` mirrors it and loses on conflict. Rationale: the program
  re-sequenced once already (v1→v2 renumbered every phase above 9); without a
  single source of truth plus a mandatory renumbering-map + congruence-sweep
  rule and "Phase N (Name)" citation discipline, stale numbers silently
  misroute future PRDs, issues, and agents. Roadmap revisions are the only
  way ordering changes.
- **Recurring commitments and fixed-total pledges preserve separate truth
  (added 2026-07-13, Phase 16).** A recurring commitment records repeated
  support without a promised cumulative balance; a fixed-total pledge records
  an explicit cumulative promise. Collection arrangements and provider objects
  execute or evidence collection but do not define either promise. Expected
  occurrences, execution, payment finality, ledger posting, fulfillment
  applications, recognition, and posted contributions remain separately owned.
  Recurring groups contain stable destination-line identities; effective line-
  term versions remain distinct from authoritative calendar schedule epochs;
  and only compatible current pairs share a billing cohort/provider executor.
  Every active cadence policy features exactly one enabled cadence—monthly
  whenever enabled. Donor schedule boundaries validate in preview and again
  under lock. Pause/resume preserves the grid, recurring-to-fixed coverage uses
  one effective count-once temporal link, and provider subscriptions own
  ordinary renewal execution but never product recovery eligibility or timing.
  Rationale: the legacy one-subscription-to-one-`donor_pledges` topology
  collapses incompatible meanings, cannot represent independently manageable
  lines, and is unsafe under replay, provider-control loss, ACH delayed
  finality, provider-owned retry, or fixed-pledge fulfillment.
- **OpenSpec reconciliation is explicit, not retrospective (added
  2026-07-13).** The merged `donation-lifecycle` requirement is corrected
  through this dated change's `MODIFIED` delta. The still-active
  `add-recurring-giving` and `add-donor-self-service` changes are amended in
  place to consume the Phase 16 model and expressly record that their original
  legacy-pledge topology is superseded. Historical archived changes remain
  unchanged.
- **System messages are one governed platform capability, not Email Studio
  plus exceptions (added 2026-07-19, Phase 17).** One code-governed catalog
  defines stable message contracts and their Reserved/Live/Retired lifecycle.
  One normative executable manifest expands five immutable compile-time profiles
  into complete flat contracts for all 18 Target Live candidates, with exact
  fact walls, trigger bindings, action/surface/retention envelopes, generated
  projections, a separate protected system-default namespace, and dated
  producer/obligation plus decision/test closure artifacts. Runtime inheritance
  and inferred safety defaults are prohibited.
  Producer domains own events, facts, recipients, protected actions, business
  fences, official truth, and completion. Phase 17 owns immutable structured
  presentation, publication, whole-message resolution, bounded Delivery Plans,
  and notification presentation; Phase 6 remains the single recipient-specific
  intent, dispatch, provider-evidence, and communication-history spine. This
  prevents templates, provider objects, mutable bindings, or workflows from
  becoming a second source of business truth.
- **Tenant freedom is broad inside an explicit safety envelope (added
  2026-07-19, Phase 17).** Tenants can control permitted content, tone, Brand
  Kit, Role Layouts, organization/site variants, any canonical human-language
  locale in the pinned IANA/Unicode standards catalog, one of two bounded
  fallback priorities, optional Delivery Plan steps,
  sender profiles, reply destinations, and native portability. Contracts retain
  the minimum legal/security/payment/receipt truth, recipient authority,
  consent, protected actions, and source-owned facts. Publications and their
  compatible dependencies are complete, immutable, diffable, synthetic-data
  previewable, proportionally reviewed, and atomically published.
- **Transport is tenant-owned and subordinate to prepared product identity
  (added 2026-07-19, Phase 17).** Resend is the only email provider, but every
  tenant brings one proved Resend account/domain/connection and there is no
  shared tenant-message fallback. One Default Sender Profile plus bounded
  same-domain profiles and independent contract-purpose reply destinations
  compose into immutable delivery snapshots. Recipient-specific preparation
  freezes content, locale, presentation, protected-action reference,
  sender/reply/connection, and hashes before provider I/O. Recovery distinguishes
  definitely unsubmitted from possibly submitted work, reconciles unknown
  outcomes, and never blindly rerenders or replays.
- **Tenant and platform mail share one structurally scoped spine (added
  2026-07-19, Phase 17).** Every execution/history row carries an explicit
  tenant-or-platform owner arc and scope-prefixed keys/FKs. Tenant Party/contact
  and tenant connection/profile fields are mutually exclusive with the closed
  platform-recipient authority union; v1 admits only the exact revisioned
  `eve_platform_owner` authority and fixed platform connection/profile. Provider
  envelopes are single-scope; tenant roles cannot reach platform rows; no
  caller/provider field or fake tenant chooses ownership. Eve retains source
  policy and Discord. Phase 17 owns any exact cataloged Eve contract,
  publication/compiler, and platform connection/profile proof; Phase 6 owns its
  recipient-specific delivery and history. Customer-account security mail needs
  a future distinct recipient-authority branch.
- **Notification, history, portability, and reserved channels stay bounded
  (added 2026-07-19, Phase 17).** In-product notifications use one Asym attention
  projection model and never become business/task truth. Durable communication
  history stays body-free; eligible tenant messages may retain one encrypted,
  support-safe recent copy for at most 30 days, while platform-scoped messages
  retain no readable copy in this generation. Native packages create
  destination-owned drafts without authority, secrets, or recipient history.
  SMS records consent/readiness/suppression evidence while transport remains
  structurally unavailable. General workflows remain Phase 34, inbound replies
  Phase 26, broad portal notification centers Phases 25/28, campaigns Phase 32,
  and official documents/statements their producing phases.
- **Phase 17 architecture decisions are recorded once (added 2026-07-19).**
  Canonical `docs/adr/0022`–`0029` bind protected actions, Delivery Plans,
  notifications, dark SMS
  evidence, mutually exclusive tenant/platform Resend ownership and composed delivery identity, the structured
  document and presentation graph, body-free history/recent copy, and immutable
  preparation/recovery. The full product contract lives in
  `specs/outbound-communications/spec.md`; the dated full requirement deltas in
  `platform-surfaces` and `platform-boundaries` remove the older unbounded
  tenant-control and contribution-specific automation routing ambiguity.

## Non-goals

- No feature parity implemented in Phase 0.
- The 374 unreleased commits are recorded, not shipped; ship-or-not is a later
  human decision.
- No exhaustive up-front spec of the 25 areas.
- No product implementation, migration, issue dispatch, or communication send
  is authorized by the Phase 16 specification package.
- No product implementation, migration, transport activation, catalog
  activation, tenant credential collection, message publication, bulk send, or
  issue dispatch is authorized by the Phase 17 specification package.

## Risks / trade-offs

- **Live state unverifiable from repo** → mitigated by Lane 2 + stop condition
  SC1 in the evidence file; parity phases plan against the confirmed _committed_
  baseline until Lane 2 completes.
- **Doc-based benchmark misses operational depth** → mitigated by capturing
  depth per-area at build time, and by the acceptance-test column being
  outcome-based.
- **Overlap with OpenSpec PR #462** → mitigated by an explicit reconcile
  follow-up; the matrix points to #462 where it already governs an area.
- **Existing Email Studio and Resend tables look more complete than they are** →
  mitigated by explicit REAL-versus-FORWARD anchors and migration requirements.
  Mutable templates, `is_active` bindings, singular settings, and provider logs
  are predecessor inputs; they are not the Phase 17 catalog, publication,
  prepared-message, recovery, or communication-history authority.
- **A configurable message product can become a second workflow engine or a
  second truth store** → mitigated by producer ownership, fixed Delivery Plan
  slots, typed facts, one Phase 6 send/history seam, and hard phase boundaries.
  The unique Delivery Plan occurrence header and atomic release compiler are
  coordination inside that Phase 6 spine; they are not another queue, outbox,
  scheduler, workflow run, communication ledger, or outcome authority.
- **Tenant freedom can weaken safety or deliverability** → mitigated by complete
  immutable publications, contract-owned protected truth, proportional review,
  same-domain proved sender profiles, purpose-bound replies, server-side
  resolution, and no shared Resend fallback.
- **Recovery can duplicate or mutate a message after provider uncertainty** →
  mitigated by separate server-derived semantic-identity and immutable-command
  hashes, the durable preparation boundary, distinct artifact/envelope AAD,
  typed failure ownership, indeterminate reconciliation, precise quarantine,
  and proof-gated recovery limited to eligible unprepared,
  prepared-definitely-unsubmitted, or exact contract-permitted definitely
  rejected work.

## Open questions

- Lane 2 (live confirmation) is owned by the platform owner (founder), to
  perform or delegate to an ops lead with hosting access (see the evidence
  file). The remaining action is scheduling and completing it — not deciding who
  is accountable.
- Should the 374-commit gap be closed (release) before parity Phase 1 starts?
  (Recorded, deliberately not forced by Phase 0.)
