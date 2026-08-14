# ADR-0129: Bounded Supporter Response Profiles

**Status:** Accepted (founder ruling, Phase 22 grill session - D12)

## Context

Phase 22 needs a small, humane way for purpose-authorized supporters to respond
to an exact Ministry Update without turning Asym into a public social network.
Epistle demonstrates the relational value of a prayer acknowledgement, while
modern creator and community products demonstrate both the usefulness and the
moderation cost of comments. Tenants differ: some want no responses, some want
only low-risk acknowledgements, and some have the staff capacity and policy to
operate comments.

The existing prototype cannot become authority as-is. It exposes arbitrary
reaction types, mutable counters, update-only storage keys, demo comments,
coarse raw-table reads, and destructive or in-place staff mutation. Those seams
cannot prove the exact tenant, legal entity, purpose, audience, Update Revision,
Release Projection, profile generation, current supporter authority, or
moderation history needed for safe protected engagement.

D11 already owns the canonical Ministry Update, immutable Revision, Audience
Release Manifest, and independently governed Public Page and authenticated
Supporter Release Projections. Phase 10 owns the safety ceiling, Phase 12 owns
current authorization, Phases 17 and 6 own communication consequences, and D7
and Phase 13 own Giving. D12 must add bounded response behavior without
collapsing or duplicating any of those truths.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — one prospective, immutable,
> tenant-owned Supporter Response Profile Version, initially `Responses off` and
> then choosing exactly one of `Responses off`, `Like + I prayed`, or
> `Like + I prayed + comments`, with acknowledgement-only recommended in guided
> setup; acting only as a ceiling over exact D11 Supporter Release Projection-bound
> Engagement Spaces, each structurally carrying Tenant, Legal Entity, environment,
> canonical source and purpose, Update ID and immutable Revision, Release Projection
> and version, audience, safety and authorization epochs, Response Profile Version,
> and operation generation; with per-update narrowing, immediate evidence-preserving
> closure, and reopening only through D4/D5's existing exact Review & Release
> authority. Current authenticated purpose-authorized access is re-proved on every
> count, list, react, unreact, comment, reply, edit, withdraw, report, moderate,
> export, stream, and notification-deep-link request before any elevated command.
> Like and I prayed are two fixed, reversible, idempotent, audience-local
> acknowledgements; optional comments are bounded plain text with safe links,
> audience-safe identity preview, immutable self-edit revisions, self-withdrawal
> and privacy-safe tombstones, one same-space reply level, keyset pagination, and
> exact pending, posted, held, closed, and failed states. Enabling comments
> progressively reveals one tenant-selected Right away, with reporting or After
> review posture and one existing authorized moderation group; one quiet
> exception-first lane provides report, reversible hold/hide/restore, immediate
> source-authorized safety hiding, reasoned privacy/safety redaction, prospective
> comment lock, and smallest-scope actor restriction without staff rewriting a
> supporter's words. Counts are rebuildable audience-local projections, never
> mutable canonical Update facts; Phase 22 emits typed, deduplicable response and
> moderation occurrences only, while Phases 17/6 independently own recipient,
> consent, suppression, cadence, batching, dispatch, and provider outcome and
> D7/Phase 13 alone own the adjacent Give action and every checkout, gift,
> settlement, and attribution fact. Anonymous Public Releases remain read-only and
> contain no protected count, identity, comment, cursor, cache fragment, metadata,
> hydration state, or realtime event; existing releases never change silently;
> uncertain writes never appear posted; safety narrowing fails closed at the
> smallest scope; and activation requires production-shaped cross-scope,
> concurrency, abuse, failure, migration, privacy, accessibility, and load proof—
> without public or anonymous writing, cross-audience totals, arbitrary reactions,
> rich or media comments, mentions, direct messages, social graphs, unbounded
> threads, gamification, donation-derived authority, trusted-user safety bypass,
> AI-only judgment, raw profile/table/realtime exposure, mutable post counters as
> truth, destructive ordinary deletion, hidden per-response email, blind retry,
> dual write, reinterpretation of legacy demo love/prayer/fire or comment data as
> certified truth, or any claim that viewed, opened, liked, prayed, commented,
> notified, delivered, relationally connected, started checkout, gave, settled,
> or paid are the same fact.**

## Consequences

- Every tenant starts with **Responses off**. Guided setup recommends
  **Like + I prayed** because it provides a relational signal without creating a
  moderation queue.
- A tenant that deliberately enables comments chooses one simple publication
  posture and one existing authorized moderation group. Healthy acknowledgement
  activity stays quiet; reports and held comments form one exception-first lane.
- A Response Profile Version is prospective and immutable. It is a ceiling, not
  an instruction to mutate existing releases. One exact update may narrow or
  close its Engagement Space without changing tenant defaults.
- `Like` and `I prayed` are fixed, reversible, idempotent acknowledgements.
  `I prayed` records the supporter action only; it is not proof of reading,
  spiritual outcome, relationship health, or giving.
- Comments remain protected, bounded plain text. Self-edits append revisions;
  withdrawal and moderation preserve privacy-safe evidence rather than
  destructively rewriting history.
- Public releases contain no protected engagement state. Counts, lists,
  comments, cursors, cache fragments, hydration payloads, and realtime events
  are all authorized inside the exact Supporter Engagement Space.
- Current supporter authority and safety are re-proved for every operation.
  Prior access, a donation, a page relationship, authentication alone, or a
  service-role code path never grants engagement access.
- Counts are disposable, rebuildable projections over append-only response
  occurrences. They cannot become mutable Ministry Update truth.
- Notifications and Giving remain separate owner-domain facts. A response may
  emit a deduplicable occurrence; it never secretly sends email or proves a
  donation outcome.
- Production authorization requires exact-scope RLS and service-boundary proof,
  idempotency and concurrency proof, revoked-access and privacy proof, abuse and
  moderation proof, migration disposition, accessibility, and representative
  load testing.

## Considered options

- **Responses always off.** Safe but rejects a proven, low-friction way for
  supporters to acknowledge an update and prayer request.
- **Acknowledgements only for every tenant.** Simpler, but unnecessarily blocks
  tenants that have both a legitimate comments use case and operating capacity.
- **Comments or arbitrary reactions enabled broadly.** Rejected because it
  creates moderation, abuse, privacy, accessibility, and operational burden for
  tenants that did not choose it.
- **One mutable engagement row and counters on the Update.** Rejected because it
  cannot preserve exact audience/revision scope, concurrency correctness, or an
  append-only audit trail.
- **Public comments or anonymous reactions.** Rejected because Phase 22's public
  page is not a public social network and cannot safely expose protected
  supporter identity or interaction evidence.
- **Infer response authority from a gift, follow, participant assignment, or
  prior access.** Rejected because D11 requires current purpose-authorized
  membership and current safety proof on every protected request.

## Related decisions

- [ADR-0128 - Canonical Ministry Update audience release projections](./0128-canonical-ministry-update-audience-release-projections.md)
- [ADR-0122 - Simple Public Page review with quiet Phase 10 eligibility](./0122-simple-public-page-review-with-quiet-phase-10-eligibility.md)
- [Phase 5 public website runtime contract](../prds/sitestacker-parity/phase-05-public-website-runtime-contract.md)
- [Phase 6 shared communication event model](../prds/sitestacker-parity/phase-06-shared-communication-event-model.md)
- [Phase 9 CRM relationship graph](../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md)
- [Phase 10 sensitive-data safety](../prds/sitestacker-parity/phase-10-sensitive-data-safety.md)
- [Phase 12 role and permission configuration](../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md)
- [Phase 13 contribution ledger and Giving](../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md)
- [Phase 17 system messages](../prds/sitestacker-parity/phase-17-system-messages-template-management.md)
- [Phase 22 decision log](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md)
